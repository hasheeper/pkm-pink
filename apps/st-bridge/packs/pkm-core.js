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

  if (ROOT.PKMPackCore?.version) return;

  const DEFAULT_SETTINGS = {
    universal: {
      enableAVS: true,
      enableCommander: true,
      enableEVO: true,
      enableBGM: true,
      enableSFX: true,
      enableClash: false,
      enableEnvironment: true
    },
    main: {
      enableAVS: true,
      enableCommander: true,
      enableEVO: true,
      enableBGM: true,
      enableSFX: true,
      enableClash: false,
      enableBattleEnvironment: true
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
    for (const key of ['hp', 'atk', 'def', 'spa', 'spd', 'spe']) {
      next[key] = src[key] === null || src[key] === undefined
        ? null
        : clampNumber(src[key], 0, 31, null);
    }
    return next;
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

  function getPath(object, path, fallback) {
    if (!path) return object == null ? fallback : object;
    const parts = String(path).split('.').filter(Boolean);
    let cursor = object;
    for (const part of parts) {
      if (!isObject(cursor) || !(part in cursor)) return fallback;
      cursor = cursor[part];
    }
    return cursor == null ? fallback : cursor;
  }

  function setPath(object, path, value) {
    const parts = String(path || '').split('.').filter(Boolean);
    if (!parts.length) return value;
    let cursor = object;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i];
      if (!isObject(cursor[part])) cursor[part] = {};
      cursor = cursor[part];
    }
    cursor[parts[parts.length - 1]] = value;
    return object;
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

  function createStateStore(config = {}) {
    const rootKey = config.rootKey || DEFAULT_STATE_ROOT;
    const stateKey = config.stateKey || DEFAULT_STATE_KEY;
    const normalize = typeof config.normalize === 'function' ? config.normalize : (state) => state;
    const onWrite = typeof config.onWrite === 'function' ? config.onWrite : null;
    const options = config.options || { type: 'message' };

    async function load(defaultFactory = null) {
      const existing = await readState(rootKey, stateKey, options);
      if (existing) return normalize(existing);
      return typeof defaultFactory === 'function' ? normalize(await defaultFactory()) : null;
    }

    async function save(state) {
      const normalized = normalize(state);
      await writeState(rootKey, stateKey, normalized, options);
      if (onWrite) await onWrite(normalized);
      return normalized;
    }

    async function patch(patcher, defaultFactory = null) {
      const current = await load(defaultFactory);
      const draft = clone(current, {});
      const result = await patcher(draft, current);
      return save(result === undefined ? draft : result);
    }

    return { load, save, patch, readStatData: () => readStatData(rootKey, options) };
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
    createEmptySlot,
    legacyDashboardShape,
    getPath,
    setPath,
    mvu: {
      readVariables,
      writeVariables,
      readStatData,
      writeStatData,
      readState,
      writeState,
      createStateStore
    }
  };
})();
