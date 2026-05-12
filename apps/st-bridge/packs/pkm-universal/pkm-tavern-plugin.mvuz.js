/**
 * PKM PINK Universal - MVUZ business plugin
 *
 * Scope:
 * - MVU storage: message variables -> stat_data.pkm
 * - One-way migration from legacy ERA-ish player/settings/world_state shape
 * - Universal party prompt injection
 * - PKM_BATTLE -> PKM_FRONTEND message augmentation
 * - Small action API consumed by the dashboard/status script
 */
(async function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const CORE = ROOT.PKMPackCore || null;
  const PLUGIN_NAME = '[PKM Universal MVUZ]';
  const PRODUCT = 'universal';
  const VERSION = '0.1.0-mvuz-universal';
  const STAT_KEY = 'stat_data';
  const PKM_KEY = 'pkm';
  const INJECT_ID = 'pkm_universal_player_data_mvuz';
  const BATTLE_TAG = 'PKM_BATTLE';
  const FRONTEND_TAG = 'PKM_FRONTEND';
  const MAX_PARTY_SIZE = 6;
  const FRONTEND_BLOCK_RE = new RegExp(`\\n*<${FRONTEND_TAG}>[\\s\\S]*?<\\/${FRONTEND_TAG}>\\n*`, 'gi');
  if (!CORE?.mvu) throw new Error(`${PLUGIN_NAME} requires PKMPackCore. Load pkm-core.js before this script.`);

  let isProcessingMessage = false;
  let lastHandledMarker = null;

  const DEFAULT_SETTINGS = CORE.getDefaultSettings(PRODUCT);
  const DEFAULT_UNLOCKS = CORE.getDefaultUnlocks();

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function clone(value, fallback = null) {
    if (value === undefined || value === null) return fallback;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return fallback;
    }
  }

  function isObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function clampNumber(value, min, max, fallback = 0) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function normalizeString(value, fallback = '') {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  function createEmptySlot(slot) {
    return CORE.createEmptySlot(slot);
  }

  function isEmptyPokemon(pokemon) {
    return !pokemon || !isObject(pokemon) || !pokemon.name;
  }

  function normalizeMoves(moves) {
    return CORE.normalizeMovesArray(moves);
  }

  function normalizeIvs(ivs) {
    return CORE.normalizeIvs(ivs);
  }

  function normalizeStatsMeta(statsMeta, pokemon) {
    const src = isObject(statsMeta) ? clone(statsMeta, {}) : {};
    const lv = clampNumber(pokemon?.lv ?? pokemon?.level, 1, 100, 5);
    const calculatedEv = Math.min(252, Math.floor(lv * 2.5));
    const evLevel = src.ev_level === null || src.ev_level === undefined
      ? calculatedEv
      : Math.max(clampNumber(src.ev_level, 0, 252, 0), calculatedEv);
    return {
      ...src,
      ivs: normalizeIvs(src.ivs),
      ev_level: evLevel
    };
  }

  function normalizePokemon(raw, slot = null) {
    if (!isObject(raw)) return createEmptySlot(slot || 0);
    const next = {
      ...clone(raw, {}),
      slot: slot || clampNumber(raw.slot, 1, 999, 0) || null,
      name: raw.name || null,
      nickname: raw.nickname || null,
      species: raw.species || raw.name || null,
      gender: raw.gender || null,
      lv: raw.lv ?? raw.level ?? null,
      shiny: Boolean(raw.shiny),
      isAce: true,
      isLead: Boolean(raw.isLead),
      bonds: clampNumber(raw.bonds, 0, 255, 0),
      moves: normalizeMoves(raw.moves),
      stats_meta: normalizeStatsMeta(raw.stats_meta, raw)
    };
    if (next.lv !== null) next.lv = clampNumber(next.lv, 1, 100, 5);
    if (!next.name) return createEmptySlot(slot || next.slot || 0);
    return next;
  }

  function normalizePartySlots(slots) {
    const rawSlots = Array.isArray(slots) ? slots : [];
    const next = Array.from({ length: MAX_PARTY_SIZE }, (_, index) => {
      const slotNumber = index + 1;
      return normalizePokemon(rawSlots[index] || createEmptySlot(slotNumber), slotNumber);
    });

    const leadIndex = next.findIndex((pokemon) => pokemon.name && pokemon.isLead);
    const firstFilledIndex = next.findIndex((pokemon) => pokemon.name);
    next.forEach((pokemon, index) => {
      pokemon.slot = index + 1;
      pokemon.isAce = Boolean(pokemon.name);
      pokemon.isLead = index === (leadIndex >= 0 ? leadIndex : firstFilledIndex);
    });
    return next;
  }

  function normalizeTransferBuffer(value) {
    if (!isObject(value) || !value.name) return null;
    const normalized = normalizePokemon(value, null);
    delete normalized.slot;
    normalized.isLead = false;
    return normalized;
  }

  function normalizePkmState(input) {
    if (ROOT.PKMUniversalSchemaRuntime?.normalizePkmState) {
      return ROOT.PKMUniversalSchemaRuntime.normalizePkmState(input);
    }
    throw new Error('PKMUniversalSchemaRuntime.normalizePkmState is unavailable');
  }

  async function readStatData() {
    return CORE.mvu.readStatData(STAT_KEY, { type: 'message' });
  }

  async function writeStatData(nextStatData) {
    await CORE.mvu.writeStatData(nextStatData, STAT_KEY, { type: 'message' });
    return nextStatData;
  }

  async function getLegacyEraVars(timeoutMs = 1200) {
    if (typeof ROOT.eventEmit !== 'function' || typeof ROOT.eventOn !== 'function') return null;
    return new Promise((resolve) => {
      let off = null;
      const done = (value) => {
        try {
          if (off && typeof off.stop === 'function') off.stop();
        } catch (_) {}
        resolve(value);
      };
      const timer = setTimeout(() => done(null), timeoutMs);
      off = ROOT.eventOn('era:queryResult', (detail) => {
        if (detail?.queryType !== 'getCurrentVars') return;
        clearTimeout(timer);
        done(detail.result?.statWithoutMeta || detail.result || null);
      }, { once: true });
      try {
        ROOT.eventEmit('era:getCurrentVars');
      } catch (_) {
        clearTimeout(timer);
        done(null);
      }
    });
  }

  async function loadState(options = {}) {
    const statData = await readStatData();
    const existing = isObject(statData[PKM_KEY]) ? statData[PKM_KEY] : null;
    if (existing) {
      const normalized = normalizePkmState(existing);
      const changed = JSON.stringify(existing) !== JSON.stringify(normalized);
      if (changed && options.persist !== false) {
        await writeStatData({ ...statData, [PKM_KEY]: normalized });
      }
      return normalized;
    }

    if (options.requireExisting) return null;
    const legacy = options.skipMigration ? null : await getLegacyEraVars();
    const initial = normalizePkmState({
      ...(isObject(legacy) ? legacy : {}),
      meta: { migratedFrom: legacy ? 'era' : null }
    });
    const shouldPersistInitial = options.persist === true || (Boolean(legacy) && options.persist !== false);
    if (shouldPersistInitial) {
      await writeStatData({ ...statData, [PKM_KEY]: initial });
    }
    return initial;
  }

  async function saveState(nextState) {
    const statData = await readStatData();
    const normalized = normalizePkmState(nextState);
    await writeStatData({ ...statData, [PKM_KEY]: normalized });
    notifyStateChanged(normalized);
    return normalized;
  }

  async function patchState(patcher) {
    const current = await loadState();
    const draft = clone(current, {});
    const result = await patcher(draft);
    return saveState(result || draft);
  }

  function notifyStateChanged(state) {
    try {
      ROOT.dispatchEvent?.(new CustomEvent('pkm:stateChanged', { detail: { product: PRODUCT, state } }));
    } catch (_) {}
  }

  function legacyDashboardShape(state) {
    return CORE.legacyDashboardShape(state, { emptySlot: createEmptySlot });
  }

  function formatGender(gender) {
    if (gender === 'M') return 'M';
    if (gender === 'F') return 'F';
    return '-';
  }

  function formatMoves(moves) {
    return normalizeMoves(moves).map((move, index) => `move${index + 1}: ${move || '-'}`).join(' | ');
  }

  function formatIvsDisplay(ivs) {
    const src = isObject(ivs) ? ivs : {};
    return ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
      .map((key) => `${key.toUpperCase()}:${src[key] ?? '?'}`)
      .join('/');
  }

  function buildPlayerPrompt(state) {
    const filledSlots = state.party.slots.filter((pokemon) => pokemon?.name);

    const unlocks = state.player.unlocks || {};
    const unlockLabels = [];
    if (unlocks.enable_mega) unlockLabels.push('Mega');
    if (unlocks.enable_z_move) unlockLabels.push('Z');
    if (unlocks.enable_dynamax) unlockLabels.push('Dmax');
    if (unlocks.enable_tera) unlockLabels.push('Tera');
    if (unlocks.enable_bond) unlockLabels.push('Bond');
    if (unlocks.enable_styles) unlockLabels.push('Style');
    if (unlocks.enable_insight) unlockLabels.push('Insight');
    if (unlocks.enable_proficiency_cap) unlockLabels.push('ProfCap');

    const boxCount = (state.box.boxes || []).reduce((sum, box) => sum + (box.slots?.length || 0), 0);

    if (!filledSlots.length) {
      return `<pkm_team_summary>
Player: ${state.player.name} | Proficiency: ${state.player.proficiency} | Unlocks: [${unlockLabels.join('/') || 'none'}] | Party: 0/6 | Box: ${boxCount}
--------------------------------------------------
The player currently has no Pokémon in their party.
--------------------------------------------------
Use <PKM_BATTLE>{...}</PKM_BATTLE> to start a battle. The player party above is authoritative.
</pkm_team_summary>`;
    }

    const lines = state.party.slots.map((pokemon, index) => {
      const slot = index + 1;
      if (!pokemon?.name) return `slot${slot}. -`;
      const name = pokemon.nickname || pokemon.name;
      const lv = pokemon.lv ?? pokemon.level ?? '??';
      const lead = pokemon.isLead ? ' [LEAD]' : '';
      const nature = pokemon.nature || '???';
      const ability = pokemon.ability || '???';
      const ev = pokemon.stats_meta?.ev_level ?? 0;
      const ivs = formatIvsDisplay(pokemon.stats_meta?.ivs);
      const bonds = pokemon.bonds ?? 0;
      return `slot${slot}. ${formatGender(pokemon.gender)} ${name} (Lv.${lv})${lead}
   [Nature: ${nature}] [Ability: ${ability}]
   [Stats: ${ivs}] [EVs: ${ev}] [Bonds: ${bonds}]
   Moves: ${formatMoves(pokemon.moves)}`;
    }).join('\n\n');

    const boxNames = (state.box.boxes || [])
      .flatMap((box) => box.slots || [])
      .filter((pokemon) => pokemon?.name)
      .slice(0, 12)
      .map((pokemon) => `${pokemon.nickname || pokemon.name}/Lv.${pokemon.lv ?? pokemon.level ?? '??'}`);
    const boxSection = boxNames.length
      ? `\nBox: ${boxNames.join(' | ')}${boxCount > boxNames.length ? ` | +${boxCount - boxNames.length} more` : ''}\n`
      : '';
    return `<pkm_team_summary>
Player: ${state.player.name} | Proficiency: ${state.player.proficiency} | Unlocks: [${unlockLabels.join('/') || 'none'}] | Party: ${filledSlots.length}/6 | Box: ${boxCount}
--------------------------------------------------
${lines}
--------------------------------------------------
${boxSection}
Use <PKM_BATTLE>{...}</PKM_BATTLE> to start a battle. The player party above is authoritative.
</pkm_team_summary>`;
  }

  async function handleGenerationBefore(detail) {
    console.log(`${PLUGIN_NAME} handleGenerationBefore fired`, { dryRun: detail?.dryRun });
    if (detail?.dryRun) {
      console.log(`${PLUGIN_NAME} dryRun=true, skip injection`);
      return;
    }
    let state;
    try {
      state = await loadState();
    } catch (e) {
      console.error(`${PLUGIN_NAME} loadState failed in handleGenerationBefore`, e);
      return;
    }
    console.log(`${PLUGIN_NAME} loadState ok, party names:`, state?.party?.slots?.map((p) => p?.name || null));
    const promptContent = buildPlayerPrompt(state);
    console.log(`${PLUGIN_NAME} buildPlayerPrompt returned length=${promptContent?.length}, type=${typeof promptContent}, injectFn=${typeof ROOT.injectPrompts}`);
    if (!promptContent) {
      console.warn(`${PLUGIN_NAME} promptContent is empty, abort injection`);
      return;
    }
    if (typeof ROOT.injectPrompts !== 'function') {
      console.warn(`${PLUGIN_NAME} ROOT.injectPrompts unavailable, abort injection`);
      return;
    }
    try {
      if (typeof ROOT.uninjectPrompts === 'function') ROOT.uninjectPrompts([INJECT_ID]);
    } catch (_) {}
    ROOT.injectPrompts([{
      id: INJECT_ID,
      position: 'in_chat',
      depth: 2,
      role: 'system',
      should_scan: false,
      content: promptContent
    }]);
    console.log(`${PLUGIN_NAME} player prompt injected, length=${promptContent.length}`);
  }

  function stripJsonComments(jsonStr) {
    return String(jsonStr || '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
  }

  function stripCodeFence(text) {
    return String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  function hashString(value) {
    const text = String(value || '');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function extractJsonCandidates(rawText) {
    const text = stripCodeFence(rawText);
    const candidates = [];

    for (let start = text.indexOf('{'); start >= 0; start = text.indexOf('{', start + 1)) {
      let depth = 0;
      let inString = false;
      let escaped = false;
      for (let index = start; index < text.length; index += 1) {
        const char = text[index];
        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (char === '\\') {
            escaped = true;
          } else if (char === '"') {
            inString = false;
          }
          continue;
        }
        if (char === '"') {
          inString = true;
        } else if (char === '{') {
          depth += 1;
        } else if (char === '}') {
          depth -= 1;
          if (depth === 0) {
            candidates.push(text.slice(start, index + 1));
            break;
          }
        }
      }
    }
    return candidates;
  }

  function isBattlePayloadRoot(value) {
    if (!isObject(value)) return false;
    if (value.p1 || value.p2 || value.player || value.enemy) return true;
    if ((value.trainer || value.enemy_id || value.enemy_name) && Array.isArray(value.party)) return true;
    return false;
  }

  function parseBattlePayload(content) {
    let cleaned = String(content || '')
      .replace(/[\s\S]*<\/planning>/gi, '')
      .replace(/[\s\S]*<\/think>/gi, '');
    const regex = new RegExp(`<${BATTLE_TAG}>([\\s\\S]*?)<\\/${BATTLE_TAG}>`, 'gi');
    let match = null;
    const matches = [];
    while ((match = regex.exec(cleaned)) !== null) matches.push(match[1]);
    if (!matches.length) return null;
    let lastError = null;

    for (let matchIndex = matches.length - 1; matchIndex >= 0; matchIndex -= 1) {
      const candidates = extractJsonCandidates(matches[matchIndex]);
      if (!candidates.length) continue;
      for (const candidate of candidates) {
        try {
          const parsed = JSON.parse(stripJsonComments(candidate));
          if (isBattlePayloadRoot(parsed)) return normalizeBattleInput(parsed);
        } catch (error) {
          lastError = error;
        }
      }
    }

    console.warn(`${PLUGIN_NAME} ignored ${BATTLE_TAG}: no complete battle root found`, lastError);
    return null;
  }

  function appendPayloadBeforeUpdateVariable(content, payload) {
    const source = String(content || '').replace(FRONTEND_BLOCK_RE, '\n\n').trim();
    const updateMatch = source.match(/<UpdateVariable\b[\s\S]*?<\/UpdateVariable>/i);
    if (!updateMatch) return `${source}\n\n${payload}`;

    const before = source.slice(0, updateMatch.index).trimEnd();
    const after = source.slice(updateMatch.index).trimStart();
    return `${before}\n\n${payload}\n\n${after}`.trim();
  }

  function mergeUnlocks(...unlocksList) {
    const merged = { ...DEFAULT_UNLOCKS };
    for (const unlocks of unlocksList) {
      if (!isObject(unlocks)) continue;
      for (const key of Object.keys(merged)) {
        if (unlocks[key] === true) merged[key] = true;
      }
    }
    return merged;
  }

  function detectUnlocksFromParty(party) {
    const detected = {
      enable_mega: false,
      enable_z_move: false,
      enable_dynamax: false,
      enable_tera: false
    };
    if (!Array.isArray(party)) return detected;
    for (const pokemon of party) {
      const mechanic = String(pokemon?.mechanic || '').toLowerCase();
      if (mechanic === 'mega') detected.enable_mega = true;
      if (mechanic === 'z_move' || mechanic === 'zmove' || mechanic === 'z') detected.enable_z_move = true;
      if (mechanic === 'dynamax' || mechanic === 'gmax') detected.enable_dynamax = true;
      if (mechanic === 'tera') detected.enable_tera = true;
    }
    return detected;
  }

  function isPlayerEntrantName(name) {
    const text = String(name || '').trim().toLowerCase();
    if (!text) return false;
    return ['player', 'user', '{{user}}', '<user>', '玩家', '主角'].some((keyword) => text.includes(keyword));
  }

  function detectBattleEntrantType(entrant) {
    const explicit = String(entrant?.type || '').toLowerCase();
    if (explicit === 'wild' || explicit === 'pokemon') return 'wild';
    if (explicit === 'player' || isPlayerEntrantName(entrant?.name)) return 'player';
    if (explicit === 'db_trainer') return 'db_trainer';
    return explicit || 'generated_trainer';
  }

  function getTierDefaultLevel(tier) {
    const normalized = clampNumber(tier, 1, 4, 2);
    return ({ 1: 25, 2: 50, 3: 75, 4: 85 })[normalized] || 50;
  }

  function completeBattlePartySeed(entry, tier, trainerType = 'generated_trainer') {
    const src = typeof entry === 'string' ? { name: entry.trim() } : clone(entry, {});
    if (!isObject(src) || !src.name) return null;

    const lv = clampNumber(src.lv ?? src.level, 1, 100, getTierDefaultLevel(tier));
    const isWild = trainerType === 'wild';
    return {
      ...src,
      lv,
      quality: src.quality || src.iv_quality || (lv >= 75 ? 'high' : lv >= 45 ? 'medium' : 'low'),
      moves: Array.isArray(src.moves) && src.moves.length ? src.moves : ['Tackle'],
      stats_meta: isObject(src.stats_meta)
        ? src.stats_meta
        : {
            ivs: normalizeIvs(null),
            ev_level: isWild ? 0 : Math.min(252, Math.floor(lv * 2.5))
          }
    };
  }

  function normalizeBattlePartyEntry(entry, tier, trainerType = 'generated_trainer') {
    const seed = completeBattlePartySeed(entry, tier, trainerType);
    if (!seed) return null;
    const normalized = normalizePokemon(seed, null);
    if (!normalized?.name) return null;
    if (isObject(seed.stats_meta) && seed.stats_meta.ev_level !== undefined && seed.stats_meta.ev_level !== null) {
      normalized.stats_meta = {
        ...(isObject(normalized.stats_meta) ? normalized.stats_meta : {}),
        ev_level: clampNumber(seed.stats_meta.ev_level, 0, 252, 0)
      };
    }
    delete normalized.slot;
    normalized._tier = seed._tier || tier;
    return normalized;
  }

  function normalizeBattleAvs(pokemon) {
    const zero = { trust: 0, passion: 0, insight: 0, devotion: 0 };
    let source = null;
    if (isObject(pokemon?.avs)) {
      source = pokemon.avs;
    } else if (isObject(pokemon?.friendship?.avs)) {
      source = pokemon.friendship.avs;
    } else if (isObject(pokemon?.friendship)) {
      source = pokemon.friendship;
    } else if (typeof pokemon?.bonds === 'number') {
      source = {
        trust: pokemon.bonds,
        passion: pokemon.bonds,
        insight: pokemon.bonds,
        devotion: pokemon.bonds
      };
    }
    if (!source) return zero;
    return {
      trust: clampNumber(source.trust, 0, 255, 0),
      passion: clampNumber(source.passion, 0, 255, 0),
      insight: clampNumber(source.insight, 0, 255, 0),
      devotion: clampNumber(source.devotion, 0, 255, 0)
    };
  }

  function processBattleEntrant(entrant, defaultTier = 2) {
    const src = isObject(entrant) ? entrant : { name: String(entrant || '') };
    const name = normalizeString(src.name, 'Unknown');
    const tier = src.tier || defaultTier;
    const trainerType = detectBattleEntrantType(src);
    const party = Array.isArray(src.party)
      ? src.party.map((pokemon) => normalizeBattlePartyEntry(pokemon, tier, trainerType)).filter(Boolean)
      : [];
    const unlocks = mergeUnlocks(src.unlocks, detectUnlocksFromParty(party));

    return {
      name,
      party,
      trainerType,
      isPlayer: trainerType === 'player' || isPlayerEntrantName(name),
      tier,
      trainerProficiency: clampNumber(src.trainerProficiency ?? src.proficiency, 0, 255, 0),
      unlocks,
      lines: src.lines || null
    };
  }

  function mergeTrainerParties(trainersData) {
    const allParty = [];
    const trainerMetadata = [];
    const names = [];

    trainersData.forEach((trainer) => {
      names.push(trainer.name);
      (trainer.party || []).forEach((pokemon) => {
        allParty.push(isObject(pokemon) ? { ...pokemon, trainer: pokemon.trainer || trainer.name } : pokemon);
        trainerMetadata.push(trainer.name);
      });
    });

    return { party: allParty, trainerMetadata, names: names.join(' & ') };
  }

  function normalizeBattleInput(battleData) {
    if (!isObject(battleData)) return {};
    if (!battleData.p1 && !battleData.p2) return battleData;

    const normalized = {
      ...battleData,
      difficulty: battleData.difficulty || 'normal',
      battle_type: battleData.battle_type || 'double'
    };
    const defaultTier = battleData.tier || 2;

    if (battleData.p1 && !battleData.player) {
      const p1Entrants = battleData.p1.entrants || battleData.p1.trainers;
      if (Array.isArray(p1Entrants)) {
        const trainersData = p1Entrants.map((trainer) => processBattleEntrant(trainer, defaultTier));
        const merged = mergeTrainerParties(trainersData);
        normalized.player = {
          ...battleData.p1,
          name: merged.names,
          party: merged.party,
          _trainerMetadata: merged.trainerMetadata,
          _trainersData: trainersData,
          _usesCurrentPlayerParty: trainersData.some((trainer) => trainer.isPlayer),
          trainerProficiency: Math.max(0, ...trainersData.map((trainer) => trainer.trainerProficiency || 0)),
          unlocks: battleData.p1.unlocks || mergeUnlocks(...trainersData.map((trainer) => trainer.unlocks))
        };
      } else {
        normalized.player = battleData.p1;
      }
    }

    if (battleData.p2 && !battleData.enemy) {
      const p2Entrants = battleData.p2.entrants || battleData.p2.trainers;
      if (Array.isArray(p2Entrants)) {
        const trainersData = p2Entrants.map((trainer) => processBattleEntrant(trainer, defaultTier));
        const merged = mergeTrainerParties(trainersData);
        const firstWithLines = trainersData.find((trainer) => trainer.lines);
        normalized.enemy = {
          ...battleData.p2,
          type: trainersData.some((trainer) => trainer.trainerType === 'wild') ? 'wild' : 'trainer',
          name: merged.names,
          party: merged.party,
          _trainerMetadata: merged.trainerMetadata,
          _trainersData: trainersData,
          trainerProficiency: Math.max(0, ...trainersData.map((trainer) => trainer.trainerProficiency || 0)),
          lines: battleData.p2.lines || firstWithLines?.lines || {},
          unlocks: battleData.p2.unlocks || mergeUnlocks(...trainersData.map((trainer) => trainer.unlocks)),
          _allDbTrainers: trainersData.every((trainer) => trainer.trainerType === 'db_trainer')
        };
      } else {
        const trainerData = processBattleEntrant(battleData.p2, defaultTier);
        normalized.enemy = {
          ...battleData.p2,
          type: trainerData.trainerType === 'wild' ? 'wild' : 'trainer',
          name: trainerData.name,
          party: trainerData.party,
          trainerProficiency: trainerData.trainerProficiency || 0,
          lines: battleData.p2.lines || trainerData.lines || {},
          unlocks: battleData.p2.unlocks || trainerData.unlocks
        };
      }
    }

    return normalized;
  }

  function battlePokemonForFrontend(pokemon) {
    if (!pokemon?.name) return null;
    const next = clone(pokemon, {});
    next.moves = normalizeMoves(next.moves).filter(Boolean);
    next.avs = normalizeBattleAvs(next);
    delete next['friend' + 'ship'];
    delete next._needGenerate;
    delete next._tier;
    return next;
  }

  function normalizeBattlePartyForFrontend(party, fallbackTier = 2, trainerType = 'generated_trainer') {
    if (!Array.isArray(party)) return [];
    return party
      .map((pokemon) => battlePokemonForFrontend(normalizeBattlePartyEntry(pokemon, fallbackTier, trainerType)))
      .filter(Boolean);
  }

  function selectCurrentPartyByNames(currentParty, requestedParty) {
    const names = (Array.isArray(requestedParty) ? requestedParty : [])
      .map((pokemon) => (typeof pokemon === 'string' ? pokemon : pokemon?.name))
      .filter(Boolean)
      .map((name) => String(name).toLowerCase());
    if (!names.length) return currentParty;

    const selected = [];
    for (const name of names) {
      const match = currentParty.find((pokemon) => {
        const pokemonName = String(pokemon?.name || '').toLowerCase();
        const species = String(pokemon?.species || '').toLowerCase();
        return pokemonName === name || species === name || pokemonName.split('-')[0] === name.split('-')[0];
      });
      if (match && !selected.includes(match)) selected.push(match);
    }
    return selected.length ? selected : currentParty;
  }

  function trimBattleParty(party) {
    if (party.length <= MAX_PARTY_SIZE) return party;
    return party.slice(0, MAX_PARTY_SIZE);
  }

  function allocateTrainerParties(trainersWithParty) {
    const activeTrainers = trainersWithParty
      .map((trainer) => ({
        ...trainer,
        party: Array.isArray(trainer.party) ? trainer.party.filter(Boolean) : []
      }))
      .filter((trainer) => trainer.party.length);
    const totalCount = activeTrainers.reduce((sum, trainer) => sum + trainer.party.length, 0);
    if (totalCount <= MAX_PARTY_SIZE) return activeTrainers.flatMap((trainer) => trainer.party);
    if (activeTrainers.length >= MAX_PARTY_SIZE) {
      return activeTrainers.slice(0, MAX_PARTY_SIZE).map((trainer) => trainer.party[0]).filter(Boolean);
    }

    const allocations = activeTrainers.map((trainer) => ({
      ...trainer,
      allocated: Math.max(1, Math.round((trainer.party.length / totalCount) * MAX_PARTY_SIZE))
    }));
    let allocatedTotal = allocations.reduce((sum, trainer) => sum + trainer.allocated, 0);
    while (allocatedTotal > MAX_PARTY_SIZE) {
      const target = allocations
        .filter((trainer) => trainer.allocated > 1)
        .sort((a, b) => b.allocated - a.allocated || b.party.length - a.party.length)[0];
      if (!target) break;
      target.allocated -= 1;
      allocatedTotal -= 1;
    }
    while (allocatedTotal < MAX_PARTY_SIZE) {
      const target = allocations
        .filter((trainer) => trainer.allocated < trainer.party.length)
        .sort((a, b) => (b.party.length - b.allocated) - (a.party.length - a.allocated))[0];
      if (!target) break;
      target.allocated += 1;
      allocatedTotal += 1;
    }
    return allocations.flatMap((trainer) => trainer.party.slice(0, trainer.allocated));
  }

  function resolveTrainerBattleParty(trainersData, currentParty = []) {
    const trainersWithParty = [];
    for (const trainer of trainersData || []) {
      const party = trainer.isPlayer
        ? selectCurrentPartyByNames(currentParty, trainer.party)
        : normalizeBattlePartyForFrontend(trainer.party, trainer.tier || 2, trainer.trainerType);
      trainersWithParty.push({
        name: trainer.name,
        party: party.map((pokemon) => ({
          ...pokemon,
          trainer: trainer.isPlayer ? (pokemon.trainer || 'player') : (pokemon.trainer || trainer.name)
        }))
      });
    }
    return allocateTrainerParties(trainersWithParty);
  }

  function resolveSideName(sideConfig, fallbackName) {
    if (Array.isArray(sideConfig?._trainersData) && sideConfig._trainersData.length) {
      return sideConfig._trainersData
        .map((trainer) => (trainer.isPlayer ? fallbackName : trainer.name))
        .filter(Boolean)
        .join(' & ');
    }
    return isPlayerEntrantName(sideConfig?.name) ? fallbackName : (sideConfig?.name || fallbackName);
  }

  function resolvePlayerBattleParty(state, aiPlayer) {
    const currentParty = state.party.slots
      .filter((pokemon) => pokemon?.name)
      .map(battlePokemonForFrontend)
      .filter(Boolean);

    if (Array.isArray(aiPlayer?._trainersData) && aiPlayer._trainersData.length) {
      const merged = resolveTrainerBattleParty(aiPlayer._trainersData, currentParty);
      return merged.length ? merged : currentParty;
    }

    if (Array.isArray(aiPlayer?.party) && aiPlayer.party.length && !isPlayerEntrantName(aiPlayer.name)) {
      return trimBattleParty(normalizeBattlePartyForFrontend(aiPlayer.party, aiPlayer.tier || 2, aiPlayer.type || 'generated_trainer'));
    }

    return currentParty;
  }

  function resolveEnemyBattleParty(aiEnemy, battleData) {
    if (Array.isArray(aiEnemy?._trainersData) && aiEnemy._trainersData.length) {
      return resolveTrainerBattleParty(aiEnemy._trainersData);
    }
    const enemyPartySource = Array.isArray(battleData.party)
      ? battleData.party
      : Array.isArray(aiEnemy.party)
        ? aiEnemy.party
        : [];
    return trimBattleParty(normalizeBattlePartyForFrontend(
      enemyPartySource,
      aiEnemy.tier || battleData.tier || 2,
      aiEnemy.type || battleData.enemy_type || 'generated_trainer'
    ));
  }

  function resolveBattleEnvironment(state, battleData) {
    // Universal 版没有地图/天气系统，战斗环境完全由 AI 在 <PKM_BATTLE> 中自配置
    const aiEnv = isObject(battleData.environment) ? battleData.environment : {};
    const finalWeather = aiEnv.weather || null;
    const finalSuppression = aiEnv.suppression || null;
    if (!finalWeather && !aiEnv.overlay && !finalSuppression) return null;

    return {
      weather: finalWeather,
      weatherTurns: aiEnv.weatherTurns || 0,
      ...(aiEnv.overlay ? { overlay: aiEnv.overlay } : {}),
      ...(finalSuppression ? { suppression: finalSuppression } : {})
    };
  }

  async function buildBattleJson(aiBattleData) {
    const state = await loadState();
    const battleData = normalizeBattleInput(aiBattleData || {});
    const aiPlayer = battleData.player || {};
    const aiEnemy = battleData.enemy || {};
    const playerParty = resolvePlayerBattleParty(state, aiPlayer);
    const enemyParty = resolveEnemyBattleParty(aiEnemy, battleData);
    const playerUnlocks = mergeUnlocks(
      state.player.unlocks,
      aiPlayer.unlocks,
      detectUnlocksFromParty(playerParty)
    );
    const enemyUnlocks = mergeUnlocks(aiEnemy.unlocks, detectUnlocksFromParty(enemyParty));
    const environment = resolveBattleEnvironment(state, battleData);

    return {
      settings: { ...state.settings, ...(isObject(battleData.settings) ? battleData.settings : {}) },
      difficulty: battleData.difficulty || aiEnemy.difficulty || 'normal',
      player: {
        name: resolveSideName(aiPlayer, state.player.name),
        trainerProficiency: Math.max(
          clampNumber(aiPlayer.trainerProficiency ?? aiPlayer.proficiency, 0, 255, 0),
          state.player.proficiency
        ),
        party: playerParty,
        unlocks: playerUnlocks
      },
      enemy: {
        id: aiEnemy.id || battleData.enemy_id || 'generated_enemy',
        type: aiEnemy.type || battleData.enemy_type || 'generated_trainer',
        name: resolveSideName(aiEnemy, battleData.enemy_name || 'Opponent'),
        trainerProficiency: clampNumber(aiEnemy.trainerProficiency, 0, 255, 0),
        lines: aiEnemy.lines || null,
        unlocks: Object.values(enemyUnlocks).some(Boolean) ? enemyUnlocks : (isObject(aiEnemy.unlocks) ? aiEnemy.unlocks : null)
      },
      party: enemyParty,
      environment,
      script: battleData.script || null
    };
  }

  async function appendFrontendToMessage(messageId, battleJson, contentOverride = null) {
    const payload = `<${FRONTEND_TAG}>\n${JSON.stringify(battleJson)}\n</${FRONTEND_TAG}>`;
    if (contentOverride !== null) return appendPayloadBeforeUpdateVariable(contentOverride, payload);
    if (typeof ROOT.getChatMessages !== 'function' || typeof ROOT.setChatMessages !== 'function') return false;
    const messages = ROOT.getChatMessages(messageId);
    const msg = Array.isArray(messages) ? messages[0] : null;
    if (!msg) return false;
    await ROOT.setChatMessages([{
      message_id: messageId,
      message: appendPayloadBeforeUpdateVariable(msg.message || '', payload)
    }], { refresh: 'affected' });
    return true;
  }

  async function processBattleContent(content) {
    if (!content || !content.includes(`<${BATTLE_TAG}>`)) {
      return { changed: false, content };
    }
    const aiBattleData = parseBattlePayload(content);
    if (!aiBattleData) return { changed: false, content };
    const battleJson = await buildBattleJson(aiBattleData);
    const nextContent = await appendFrontendToMessage(null, battleJson, content);
    return { changed: nextContent !== content, content: nextContent, battleJson };
  }

  async function handleBeforeMessageUpdate(event) {
    const result = await processBattleContent(event?.message_content || '');
    if (result.changed) event.message_content = result.content;
  }

  async function handleMessageRendered(messageId) {
    if (isProcessingMessage) return;

    try {
      isProcessingMessage = true;
      const messages = typeof ROOT.getChatMessages === 'function' ? ROOT.getChatMessages(messageId) : null;
      const msg = Array.isArray(messages) ? messages[0] : null;
      const content = msg?.message || '';
      const marker = `${messageId || ''}:${hashString(content)}`;
      if (marker && marker === lastHandledMarker) return;
      const result = await processBattleContent(content);
      if (result.changed) {
        await ROOT.setChatMessages([{ message_id: messageId, message: result.content }], { refresh: 'affected' });
      }
      lastHandledMarker = marker;
    } catch (error) {
      console.error(`${PLUGIN_NAME} battle frontend injection failed:`, error);
    } finally {
      isProcessingMessage = false;
    }
  }

  async function dispatchAction(action, payload = {}) {
    switch (action) {
      case 'greeting.configure':
        return patchState((state) => {
          if (isObject(payload.unlocks)) {
            Object.keys(DEFAULT_UNLOCKS).forEach((key) => {
              if (key in payload.unlocks) state.player.unlocks[key] = Boolean(payload.unlocks[key]);
            });
          }
          if (isObject(payload.settings)) {
            Object.keys(DEFAULT_SETTINGS).forEach((key) => {
              if (key in payload.settings) state.settings[key] = Boolean(payload.settings[key]);
            });
          }
          return state;
        });
      case 'party.setLead':
        return patchState((state) => {
          const slot = clampNumber(payload.slot ?? payload.targetSlot, 1, MAX_PARTY_SIZE, 1);
          state.party.slots.forEach((pokemon, index) => {
            pokemon.isLead = Boolean(pokemon.name) && index + 1 === slot;
          });
          return state;
        });
      case 'settings.update':
        return patchState((state) => {
          state.settings = { ...state.settings, ...(isObject(payload) ? payload : {}) };
          return state;
        });
      case 'party.updateMove':
        return patchState((state) => {
          const slot = clampNumber(payload.slot, 1, MAX_PARTY_SIZE, 1) - 1;
          const moveIndex = clampNumber(payload.moveIndex ?? payload.index, 1, 4, 1) - 1;
          const moves = normalizeMoves(state.party.slots[slot]?.moves);
          moves[moveIndex] = payload.move || null;
          state.party.slots[slot].moves = moves;
          return state;
        });
      case 'party.updateMoves':
        return patchState((state) => {
          const slot = clampNumber(payload.slot, 1, MAX_PARTY_SIZE, 1) - 1;
          if (!state.party.slots[slot]) return state;
          state.party.slots[slot].moves = normalizeMoves(payload.moves);
          return state;
        });
      case 'box.depositTransferBuffer':
        return patchState((state) => {
          const pokemon = normalizeTransferBuffer(state.party.transferBuffer);
          if (!pokemon) return state;
          if (!state.box.boxes?.length) state.box.boxes = [{ id: 'box_01', name: 'Box 1', slots: [] }];
          state.box.boxes[0].slots.push(pokemon);
          state.party.transferBuffer = null;
          return state;
        });
      case 'box.applyLegacyMutation':
        return patchState((state) => {
          const box = state.box.boxes?.[0] || { id: 'box_01', name: 'Box 1', slots: [] };
          state.box.boxes = [box, ...(state.box.boxes || []).slice(1)];
          box.slots = Array.isArray(box.slots) ? box.slots : [];

          const partyEdits = isObject(payload.partyEdits) ? payload.partyEdits : {};
          Object.entries(partyEdits).forEach(([slotKey, pokemon]) => {
            const match = String(slotKey).match(/^slot(\d+)$/);
            if (!match) return;
            const slotNumber = clampNumber(match[1], 1, MAX_PARTY_SIZE, 1);
            state.party.slots[slotNumber - 1] = normalizePokemon(pokemon, slotNumber);
          });

          const boxInserts = isObject(payload.boxInserts) ? payload.boxInserts : {};
          Object.keys(boxInserts).sort().forEach((key) => {
            const pokemon = normalizeTransferBuffer(boxInserts[key]);
            if (pokemon) box.slots.push(pokemon);
          });

          const boxEdits = isObject(payload.boxEdits) ? payload.boxEdits : {};
          Object.entries(boxEdits).forEach(([key, pokemon]) => {
            const match = String(key).match(/^storage_(\d+)$/);
            if (!match) return;
            const index = Number(match[1]) - 1;
            const normalized = normalizeTransferBuffer(pokemon);
            if (normalized && index >= 0) box.slots[index] = normalized;
          });

          const boxDeletes = isObject(payload.boxDeletes) ? payload.boxDeletes : {};
          Object.keys(boxDeletes)
            .map((key) => {
              const match = String(key).match(/^storage_(\d+)$/);
              return match ? Number(match[1]) - 1 : -1;
            })
            .filter((index) => index >= 0)
            .sort((a, b) => b - a)
            .forEach((index) => {
              if (index < box.slots.length) box.slots.splice(index, 1);
            });

          state.party.slots = normalizePartySlots(state.party.slots);
          return state;
        });
      case 'state.replace':
        return saveState(payload?.state || payload);
      default:
        throw new Error(`Unknown PKM action: ${action}`);
    }
  }

  function resetRuntimeState(reason) {
    lastHandledMarker = null;
    isProcessingMessage = false;
    console.log(`${PLUGIN_NAME} ${reason}: runtime state reset`);
  }

  ROOT.PKMPlugin = {
    version: VERSION,
    product: PRODUCT,
    loadState,
    saveState,
    patchState,
    dispatchAction,
    getPlayerParty: async () => legacyDashboardShape(await loadState()).player,
    getDashboardData: async () => legacyDashboardShape(await loadState()),
    getMvuzState: loadState,
    normalizePkmState,
    legacyDashboardShape,
    async setPlayerParty(mode, input = null) {
      return patchState((state) => {
        const source = mode === 'single'
          ? [{ name: input }]
          : Array.isArray(input)
            ? input
            : [];
        if (!source.length) return state;
        state.party.slots = normalizePartySlots(source.slice(0, MAX_PARTY_SIZE));
        return state;
      });
    },
    async addToParty(pokemon) {
      return patchState((state) => {
        const index = state.party.slots.findIndex((slot) => !slot?.name);
        const normalized = normalizePokemon(pokemon, index >= 0 ? index + 1 : null);
        if (!normalized?.name) return state;
        if (index >= 0) {
          state.party.slots[index] = normalized;
        } else {
          state.party.transferBuffer = normalizeTransferBuffer(normalized);
        }
        return state;
      });
    },
    async addToReserve(pokemon) {
      return patchState((state) => {
        const normalized = normalizeTransferBuffer(pokemon);
        if (!normalized) return state;
        if (!state.box.boxes?.length) state.box.boxes = [{ id: 'box_01', name: 'Box 1', slots: [] }];
        state.box.boxes[0].slots.push(normalized);
        return state;
      });
    },
    async repairPartySlots() {
      const state = await patchState((draft) => {
        draft.party.slots = normalizePartySlots(draft.party.slots);
        return draft;
      });
      return { repaired: true, slots: state.party.slots };
    },
    async setPlayerName(name) {
      return patchState((state) => {
        state.player.name = normalizeString(name, state.player.name);
        return state;
      });
    },
    async triggerBattle(aiBattleData) {
      const battleJson = await buildBattleJson(aiBattleData || {});
      if (typeof ROOT.createChatMessages === 'function') {
        await ROOT.createChatMessages([{
          role: 'assistant',
          message: `<${FRONTEND_TAG}>\n${JSON.stringify(battleJson)}\n</${FRONTEND_TAG}>`
        }]);
      }
      return battleJson;
    }
  };

  for (let retries = 0; retries < 30; retries += 1) {
    if (typeof ROOT.getVariables === 'function' && typeof ROOT.insertOrAssignVariables === 'function') break;
    await wait(100);
  }

  try {
    await loadState();
  } catch (error) {
    console.warn(`${PLUGIN_NAME} initial state normalization skipped:`, error);
  }

  if (typeof ROOT.eventOn === 'function') {
    ROOT.eventOn('CHAT_CHANGED', () => resetRuntimeState('CHAT_CHANGED'));
    ROOT.eventOn('chat_changed', () => resetRuntimeState('chat_changed'));
    ROOT.eventOn('message_swiped', (messageId) => {
      resetRuntimeState('message_swiped');
      setTimeout(() => handleMessageRendered(messageId), 1200);
    });
    ROOT.eventOn('message_edited', (messageId) => {
      resetRuntimeState('message_edited');
      setTimeout(() => handleMessageRendered(messageId), 1200);
    });
    ROOT.eventOn('GENERATION_AFTER_COMMANDS', handleGenerationBefore);
    ROOT.eventOn('mag_before_message_update', handleBeforeMessageUpdate);
    ROOT.eventOn('character_message_rendered', handleMessageRendered);
    ROOT.eventOn('message_received', (messageId) => setTimeout(() => handleMessageRendered(messageId), 1200));
    ROOT.eventOn('era:writeDone', (detail) => {
      const messageId = detail?.message_id ?? (typeof ROOT.getLastMessageId === 'function' ? ROOT.getLastMessageId() : null);
      setTimeout(() => handleMessageRendered(messageId), 300);
    });
  }

  console.log(`${PLUGIN_NAME} loaded (${VERSION})`);
})();
