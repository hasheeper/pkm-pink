/**
 * PKM Universal battle frontend injection runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMUniversalPluginRuntime || {};
  ROOT.PKMUniversalPluginRuntime = RUNTIME;

  RUNTIME.createBattleFrontend = function createBattleFrontend(ctx, stateService) {
    const {
      ROOT: hostRoot,
      PLUGIN_NAME,
      DEFAULT_UNLOCKS,
      BATTLE_TAG,
      FRONTEND_TAG,
      MAX_PARTY_SIZE,
      FRONTEND_BLOCK_RE,
      battleRuntime
    } = ctx;
    const {
      clone,
      isObject,
      clampNumber,
      normalizeString,
      normalizeMoves,
      normalizeIvs,
      normalizePokemon
    } = ctx.util;
    const { loadState } = stateService;

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
      const cleaned = String(content || '')
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
      if (typeof hostRoot.getChatMessages !== 'function' || typeof hostRoot.setChatMessages !== 'function') return false;
      const messages = hostRoot.getChatMessages(messageId);
      const msg = Array.isArray(messages) ? messages[0] : null;
      if (!msg) return false;
      await hostRoot.setChatMessages([{
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
      if (battleRuntime.isProcessingMessage) return;

      try {
        battleRuntime.isProcessingMessage = true;
        const messages = typeof hostRoot.getChatMessages === 'function' ? hostRoot.getChatMessages(messageId) : null;
        const msg = Array.isArray(messages) ? messages[0] : null;
        const content = msg?.message || '';
        const marker = `${messageId || ''}:${hashString(content)}`;
        if (marker && marker === battleRuntime.lastHandledMarker) return;
        const result = await processBattleContent(content);
        if (result.changed) {
          await hostRoot.setChatMessages([{ message_id: messageId, message: result.content }], { refresh: 'affected' });
        }
        battleRuntime.lastHandledMarker = marker;
      } catch (error) {
        console.error(`${PLUGIN_NAME} battle frontend injection failed:`, error);
      } finally {
        battleRuntime.isProcessingMessage = false;
      }
    }

    function resetRuntimeState() {
      battleRuntime.lastHandledMarker = null;
      battleRuntime.isProcessingMessage = false;
    }

    return {
      buildBattleJson,
      handleBeforeMessageUpdate,
      handleMessageRendered,
      processBattleContent,
      resetRuntimeState
    };
  };
})();
