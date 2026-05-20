/**
 * PKM pack core.
 *
 * Shared helpers for PKM packs. This file is intentionally pack-level business
 * code, not part of the generic ST bridge.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const CORE_NAME = '[PKM Pack Core]';
  const DEFAULT_STATE_ROOT = 'stat_data';
  const DEFAULT_STATE_KEY = 'pkm';
  const MAX_PARTY_SIZE = 6;
  const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

  if (ROOT.PKMPackCore?.version) return;

  const DEFAULT_SETTINGS = {
    universal: {
      enableAVS: true,
      enableCommander: true,
      enableEVO: true,
      enableBGM: true,
      enableSFX: true,
      enableClash: false,
      enableEnvironment: true,
      enableBattlePerformanceMode: false,
      enableBattlePortraitMode: false,
      enableEnemyStrategicSwitching: true
    },
    main: {
      enableAVS: true,
      enableCommander: true,
      enableEVO: true,
      enableBGM: true,
      enableSFX: true,
      enableClash: false,
      enableEnvironment: true,
      enableBattleEnvironment: true,
      enableBattlePerformanceMode: false,
      enableBattlePortraitMode: false,
      enableEnemyStrategicSwitching: true
    }
  };

  const DEFAULT_UNLOCKS = {
    enable_bond: false,
    enable_styles: false,
    enable_insight: false,
    enable_mega: false,
    enable_z_move: false,
    enable_dynamax: false,
    enable_tera: false,
    enable_proficiency_cap: false
  };

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
    return Math.max(min, Math.min(max, Math.round(n)));
  }

  function normalizeString(value, fallback = '') {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  function getDefaultSettings(product = 'universal') {
    return clone(DEFAULT_SETTINGS[product] || DEFAULT_SETTINGS.universal, {});
  }

  function getDefaultUnlocks() {
    return clone(DEFAULT_UNLOCKS, {});
  }

  function normalizeMovesArray(moves) {
    if (Array.isArray(moves)) {
      return Array.from({ length: 4 }, (_, index) => moves[index] || null);
    }
    if (isObject(moves)) {
      return [moves.move1, moves.move2, moves.move3, moves.move4].map((move) => move || null);
    }
    return [null, null, null, null];
  }

  function normalizeMovesObject(moves) {
    const normalized = normalizeMovesArray(moves);
    return {
      move1: normalized[0],
      move2: normalized[1],
      move3: normalized[2],
      move4: normalized[3]
    };
  }

  function normalizeIvs(ivs) {
    const src = isObject(ivs) ? ivs : {};
    const next = {};
    for (const key of STAT_KEYS) {
      next[key] = src[key] === null || src[key] === undefined
        ? null
        : clampNumber(src[key], 0, 31, null);
    }
    return next;
  }

  function isValidIvs(ivs) {
    return isObject(ivs) && STAT_KEYS.every((key) => (
      typeof ivs[key] === 'number' && ivs[key] >= 0 && ivs[key] <= 31
    ));
  }

  function generateIvsByQuality(quality) {
    const normalized = normalizeString(quality, 'low').toLowerCase();
    if (normalized === 'perfect') {
      return { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    }

    const targets = { low: 90, medium: 120, high: 150, perfect: 186 };
    const targetSum = targets[normalized] || targets.low;
    const ivs = {};
    let remaining = targetSum;

    for (let i = 0; i < STAT_KEYS.length; i += 1) {
      const stat = STAT_KEYS[i];
      if (i === STAT_KEYS.length - 1) {
        ivs[stat] = Math.min(31, Math.max(0, remaining));
        break;
      }
      const maxForThis = Math.min(31, remaining);
      const minForThis = Math.max(0, remaining - (STAT_KEYS.length - i - 1) * 31);
      ivs[stat] = Math.floor(Math.random() * (maxForThis - minForThis + 1)) + minForThis;
      remaining -= ivs[stat];
    }

    return ivs;
  }

  function randomIvQuality() {
    const roll = Math.random();
    if (roll < 0.30) return 'low';
    if (roll < 0.70) return 'medium';
    if (roll < 0.95) return 'high';
    return 'perfect';
  }

  function normalizeStatsMeta(statsMeta, pokemon) {
    const src = isObject(statsMeta) ? clone(statsMeta, {}) : {};
    const hasPokemon = isObject(pokemon) && Boolean(pokemon.name || pokemon.species || pokemon.nickname);
    const lv = clampNumber(pokemon?.lv ?? pokemon?.level, 1, 100, 5);
    const calculatedEv = hasPokemon ? Math.min(252, Math.floor(lv * 2.5)) : 0;
    const evLevel = isObject(src.ev_level)
      ? clone(src.ev_level, {})
      : (src.ev_level === null || src.ev_level === undefined
        ? calculatedEv
        : Math.max(clampNumber(src.ev_level, 0, 252, 0), calculatedEv));
    const quality = normalizeString(pokemon?.quality, '').toLowerCase();
    const normalizedIvs = normalizeIvs(src.ivs);
    const validQualities = ['low', 'medium', 'high', 'perfect'];
    const generatedQuality = hasPokemon && !isValidIvs(normalizedIvs)
      ? (validQualities.includes(quality) ? quality : randomIvQuality())
      : '';
    const shouldGenerateIvs = Boolean(generatedQuality);
    const next = {
      ...src,
      ivs: shouldGenerateIvs ? generateIvsByQuality(generatedQuality) : normalizedIvs,
      ev_level: evLevel
    };
    delete next.iv_quality;
    return next;
  }

  function autofillPokemonStatsPatches(patches) {
    if (!Array.isArray(patches)) return [];
    const added = [];
    const seen = new Set();
    const hasStatsPatch = (basePath) => patches.some((patch) => {
      const path = String(patch?.path || '');
      return path === `${basePath}/stats_meta` || path.startsWith(`${basePath}/stats_meta/`);
    });

    for (const patch of patches) {
      const op = String(patch?.op || '').toLowerCase();
      const path = String(patch?.path || '');
      const basePath = /^\/pkm\/party\/slots\/\d+$/.test(path) || path === '/pkm/party/transferBuffer'
        ? path
        : '';
      if ((op !== 'add' && op !== 'replace') || !basePath || seen.has(basePath) || hasStatsPatch(basePath)) continue;
      if (!isObject(patch.value) || !(patch.value.name || patch.value.species || patch.value.nickname)) continue;
      if (isValidIvs(patch.value.stats_meta?.ivs)) continue;
      const statsMeta = normalizeStatsMeta(patch.value.stats_meta, patch.value);
      if (!isValidIvs(statsMeta.ivs)) continue;
      added.push({ op: 'add', path: `${basePath}/stats_meta`, value: statsMeta });
      seen.add(basePath);
    }
    return added;
  }

  function autofillPokemonStatsInText(content) {
    const source = String(content || '');
    let changed = false;
    const nextContent = source.replace(/<UpdateVariable\b[\s\S]*?<\/UpdateVariable>/gi, (block) => {
      const match = block.match(/<JSONPatch>([\s\S]*?)<\/JSONPatch>/i);
      if (!match) return block;
      try {
        const patches = JSON.parse(match[1].trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, ''));
        const added = autofillPokemonStatsPatches(patches);
        if (!added.length) return block;
        changed = true;
        return block.slice(0, match.index)
          + `<JSONPatch>${JSON.stringify(patches.concat(added))}</JSONPatch>`
          + block.slice(match.index + match[0].length);
      } catch (error) {
        console.warn(`${CORE_NAME} stats autofill skipped:`, error);
        return block;
      }
    });
    return { changed, content: nextContent };
  }

  function createEmptySlot(slot, options = {}) {
    const moves = options.moves === 'object'
      ? normalizeMovesObject(null)
      : normalizeMovesArray(null);
    return {
      slot,
      name: null,
      nickname: null,
      species: null,
      gender: null,
      lv: null,
      quality: null,
      nature: null,
      ability: null,
      shiny: false,
      item: null,
      mechanic: null,
      teraType: null,
      isAce: false,
      isLead: false,
      bonds: 0,
      moves,
      stats_meta: {
        ivs: normalizeIvs(null),
        ev_level: 0
      },
      notes: null
    };
  }

  function toLegacyPokemon(pokemon, fallback = {}) {
    const next = clone(pokemon, fallback);
    next.moves = normalizeMovesObject(next.moves);
    return next;
  }

  function legacyDashboardShape(state, options = {}) {
    const emptySlot = options.emptySlot || ((slot) => createEmptySlot(slot, { moves: 'object' }));
    const slots = Array.isArray(state?.party?.slots) ? state.party.slots : [];
    const party = {};

    for (let i = 0; i < MAX_PARTY_SIZE; i += 1) {
      party[`slot${i + 1}`] = toLegacyPokemon(slots[i], emptySlot(i + 1));
    }
    party.transfer_buffer = toLegacyPokemon(
      state?.party?.transferBuffer || state?.party?.transfer_buffer,
      emptySlot(MAX_PARTY_SIZE + 1)
    );

    const box = {};
    let index = 1;
    for (const boxEntry of state?.box?.boxes || []) {
      for (const pokemon of boxEntry.slots || []) {
        box[`storage_${String(index).padStart(2, '0')}`] = toLegacyPokemon(pokemon, {});
        index += 1;
      }
    }

    return {
      player: {
        ...clone(state?.player, {}),
        party,
        box,
        settings: clone(state?.settings, {})
      },
      party,
      box,
      settings: clone(state?.settings, {}),
      world_state: clone(state?.world, {}),
      world: clone(state?.world, {})
    };
  }

  async function readVariables(options = {}) {
    if (ROOT.STBridge?.mvu?.readVariables) {
      return ROOT.STBridge.mvu.readVariables(options);
    }
    if (typeof ROOT.getVariables !== 'function') return {};
    try {
      const vars = await ROOT.getVariables({ type: options.type || 'message' });
      return isObject(vars) ? vars : {};
    } catch (error) {
      console.warn(`${CORE_NAME} readVariables failed:`, error);
      return {};
    }
  }

  async function writeVariables(data, options = {}) {
    if (ROOT.STBridge?.mvu?.writeVariables) {
      return ROOT.STBridge.mvu.writeVariables(data, options);
    }
    if (typeof ROOT.insertOrAssignVariables === 'function') {
      await ROOT.insertOrAssignVariables(data, { type: options.type || 'message' });
      return data;
    }
    if (typeof ROOT.updateVariablesWith === 'function') {
      return ROOT.updateVariablesWith((vars) => ({ ...(isObject(vars) ? vars : {}), ...data }), {
        type: options.type || 'message'
      });
    }
    if (typeof ROOT.replaceVariables === 'function') {
      const current = await readVariables(options);
      const next = { ...current, ...data };
      ROOT.replaceVariables(next, { type: options.type || 'message' });
      return next;
    }
    throw new Error('MVU variable write API is unavailable');
  }

  async function readStatData(rootKey = DEFAULT_STATE_ROOT, options = {}) {
    const vars = await readVariables(options);
    return isObject(vars?.[rootKey]) ? vars[rootKey] : {};
  }

  async function writeStatData(statData, rootKey = DEFAULT_STATE_ROOT, options = {}) {
    return writeVariables({ [rootKey]: isObject(statData) ? statData : {} }, options);
  }

  async function readState(rootKey = DEFAULT_STATE_ROOT, stateKey = DEFAULT_STATE_KEY, options = {}) {
    if (ROOT.STBridge?.mvu?.readState) {
      return ROOT.STBridge.mvu.readState(rootKey, stateKey, options);
    }
    const statData = await readStatData(rootKey, options);
    return isObject(statData?.[stateKey]) ? statData[stateKey] : null;
  }

  async function writeState(rootKey = DEFAULT_STATE_ROOT, stateKey = DEFAULT_STATE_KEY, state, options = {}) {
    if (ROOT.STBridge?.mvu?.writeState) {
      return ROOT.STBridge.mvu.writeState(rootKey, stateKey, state, options);
    }
    const statData = await readStatData(rootKey, options);
    await writeStatData({ ...statData, [stateKey]: state }, rootKey, options);
    return state;
  }

  ROOT.PKMPackCore = {
    version: '0.1.0',
    constants: {
      DEFAULT_STATE_ROOT,
      DEFAULT_STATE_KEY,
      MAX_PARTY_SIZE
    },
    DEFAULT_SETTINGS,
    DEFAULT_UNLOCKS,
    clone,
    isObject,
    clampNumber,
    normalizeString,
    getDefaultSettings,
    getDefaultUnlocks,
    normalizeMovesArray,
    normalizeMovesObject,
    normalizeIvs,
    isValidIvs,
    generateIvsByQuality,
    randomIvQuality,
    normalizeStatsMeta,
    autofillPokemonStatsPatches,
    autofillPokemonStatsInText,
    createEmptySlot,
    legacyDashboardShape,
    mvu: {
      readVariables,
      writeVariables,
      readStatData,
      writeStatData,
      readState,
      writeState
    }
  };
})();
