/**
 * PKM common pack context helpers.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const COMMON = ROOT.PKMCommonRuntime || {};
  ROOT.PKMCommonRuntime = COMMON;

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

  function createPackContext(config = {}) {
    const CORE = ROOT.PKMPackCore || null;
    const PRODUCT = config.product || 'universal';
    const PLUGIN_NAME = config.pluginName || `[PKM ${PRODUCT} MVUZ]`;
    const VERSION = config.version || '0.1.0-mvuz';
    const STAT_KEY = config.statKey || 'stat_data';
    const PKM_KEY = config.pkmKey || 'pkm';
    const INJECT_ID = config.injectId || `pkm_${PRODUCT}_player_data_mvuz`;
    const BATTLE_TAG = config.battleTag || 'PKM_BATTLE';
    const FRONTEND_TAG = config.frontendTag || 'PKM_FRONTEND';
    const MAX_PARTY_SIZE = 6;
    const FRONTEND_BLOCK_RE = new RegExp(`\\n*<${FRONTEND_TAG}>[\\s\\S]*?<\\/${FRONTEND_TAG}>\\n*`, 'gi');
    const schemaRuntime = ROOT[config.schemaRuntimeName];
    const pokemonMode = config.pokemonMode || 'bonds';

    if (!CORE?.mvu) throw new Error(`${PLUGIN_NAME} requires PKMPackCore. Load pkm-core.js before this script.`);
    if (typeof schemaRuntime?.normalizePkmState !== 'function') {
      throw new Error(`${PLUGIN_NAME} requires ${config.schemaRuntimeName}. Load schema before plugin shared runtime.`);
    }

    const DEFAULT_SETTINGS = CORE.getDefaultSettings(PRODUCT);
    const DEFAULT_UNLOCKS = CORE.getDefaultUnlocks();

    function createEmptySlot(slot) {
      const empty = CORE.createEmptySlot(slot);
      if (pokemonMode === 'avs') {
        delete empty.bonds;
        return {
          ...empty,
          friendship: normalizeFriendship(null)
        };
      }
      return empty;
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

    function normalizeFriendship(value) {
      const src = isObject(value) ? value : {};
      const avsRaw = isObject(src.avs) ? src.avs : src;
      return {
        avs: {
          trust: clampNumber(avsRaw.trust || 0, 0, 255, 0),
          passion: clampNumber(avsRaw.passion || 0, 0, 255, 0),
          insight: clampNumber(avsRaw.insight || 0, 0, 255, 0),
          devotion: clampNumber(avsRaw.devotion || 0, 0, 255, 0)
        }
      };
    }

    function normalizeStatsMeta(statsMeta, pokemon) {
      return CORE.normalizeStatsMeta(statsMeta, pokemon);
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
        moves: normalizeMoves(raw.moves),
        stats_meta: normalizeStatsMeta(raw.stats_meta, raw)
      };
      if (pokemonMode === 'avs') {
        delete next.bonds;
        next.friendship = normalizeFriendship(raw.friendship || raw.avs);
      } else {
        next.bonds = clampNumber(raw.bonds, 0, 255, 0);
      }
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
      return schemaRuntime.normalizePkmState(input);
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
      normalizeFriendship,
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

  COMMON.createPackContext = createPackContext;
})();
