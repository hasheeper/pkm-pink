/**
 * PKM Universal plugin shared runtime.
 *
 * Classic-script module loaded by apps/st-bridge/manifest.json.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMUniversalPluginRuntime || {};
  ROOT.PKMUniversalPluginRuntime = RUNTIME;

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

  function escapeJsonPointerPart(part) {
    return String(part).replace(/~/g, '~0').replace(/\//g, '~1');
  }

  function appendJsonPointerPath(basePath, key) {
    return `${basePath || ''}/${escapeJsonPointerPart(key)}`;
  }

  function readJsonPointer(rootValue, pointer) {
    if (!pointer || pointer === '/') return rootValue;
    const parts = String(pointer).split('/').slice(1).map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'));
    let current = rootValue;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return undefined;
      current = current[part];
    }
    return current;
  }

  function areJsonValuesEqual(left, right) {
    if (left === right) return true;
    try {
      return JSON.stringify(left) === JSON.stringify(right);
    } catch (_) {
      return false;
    }
  }

  function createContext() {
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
    if (!ROOT.PKMUniversalSchemaRuntime?.normalizePkmState) {
      throw new Error(`${PLUGIN_NAME} requires PKMUniversalSchemaRuntime. Load pkm-universal-schema.js before this script.`);
    }

    const DEFAULT_SETTINGS = CORE.getDefaultSettings(PRODUCT);
    const DEFAULT_UNLOCKS = CORE.getDefaultUnlocks();

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
      return ROOT.PKMUniversalSchemaRuntime.normalizePkmState(input);
    }

    const util = {
      wait,
      clone,
      isObject,
      clampNumber,
      normalizeString,
      escapeJsonPointerPart,
      appendJsonPointerPath,
      readJsonPointer,
      areJsonValuesEqual,
      createEmptySlot,
      isEmptyPokemon,
      normalizeMoves,
      normalizeIvs,
      normalizeStatsMeta,
      normalizePokemon,
      normalizePartySlots,
      normalizeTransferBuffer,
      normalizePkmState
    };

    return {
      ROOT,
      CORE,
      PLUGIN_NAME,
      PRODUCT,
      VERSION,
      STAT_KEY,
      PKM_KEY,
      INJECT_ID,
      BATTLE_TAG,
      FRONTEND_TAG,
      MAX_PARTY_SIZE,
      FRONTEND_BLOCK_RE,
      DEFAULT_SETTINGS,
      DEFAULT_UNLOCKS,
      battleRuntime: {
        isProcessingMessage: false,
        lastHandledMarker: null
      },
      util
    };
  }

  RUNTIME.shared = {
    createContext
  };
})();
