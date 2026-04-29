/**
 * =============================================================
 * PKM PINK UNIVERSAL MVU-ZOD SCHEMA
 * =============================================================
 *
 * Role:
 *   1. Defines stat_data.pkm for the Universal content pack.
 *   2. Normalizes old ERA-ish structures into the MVUZ namespace.
 *   3. Keeps numeric fields clamp-safe after MVU JSONPatch delta:
 *      - player.proficiency
 *      - party.slots[].stats_meta.ev_level
 *      - party.slots[].bonds
 *      - transfer_buffer -> party.transferBuffer
 *      - slot1-slot6 -> party.slots
 *   4. Registers with MVU-zod.
 *
 * Storage:
 *   message variables -> stat_data.pkm
 *
 * AI writes through <UpdateVariable> and targets pkm.* paths.
 */

import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

const PRODUCT = 'universal';
const VERSION = '0.1.0-mvuz-universal';
const CORE = globalThis.PKMPackCore || null;
const MAX_PARTY_SIZE = 6;

const DEFAULT_SETTINGS = CORE?.getDefaultSettings?.(PRODUCT) || {
  enableAVS: true,
  enableCommander: true,
  enableEVO: true,
  enableBGM: true,
  enableSFX: true,
  enableClash: false,
  enableEnvironment: true
};

const DEFAULT_UNLOCKS = CORE?.getDefaultUnlocks?.() || {
  enable_bond: false,
  enable_styles: false,
  enable_insight: false,
  enable_mega: false,
  enable_z_move: false,
  enable_dynamax: false,
  enable_tera: false,
  enable_proficiency_cap: false
};

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function clone(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return fallback;
  }
}

function clampNumber(value, min, max, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function normalizeString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function makeEmptySlot(slot) {
  if (CORE?.createEmptySlot) return CORE.createEmptySlot(slot);
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
    moves: [null, null, null, null],
    stats_meta: {
      ivs: { hp: null, atk: null, def: null, spa: null, spd: null, spe: null },
      ev_level: 0
    },
    notes: null
  };
}

function normalizeMoves(value) {
  if (CORE?.normalizeMovesArray) return CORE.normalizeMovesArray(value);
  if (Array.isArray(value)) {
    return Array.from({ length: 4 }, (_, index) => value[index] || null);
  }
  if (isObject(value)) {
    return [value.move1, value.move2, value.move3, value.move4].map((move) => move || null);
  }
  return [null, null, null, null];
}

function normalizeIvs(value) {
  if (CORE?.normalizeIvs) return CORE.normalizeIvs(value);
  const src = isObject(value) ? value : {};
  return {
    hp: src.hp === null || src.hp === undefined ? null : clampNumber(src.hp, 0, 31, null),
    atk: src.atk === null || src.atk === undefined ? null : clampNumber(src.atk, 0, 31, null),
    def: src.def === null || src.def === undefined ? null : clampNumber(src.def, 0, 31, null),
    spa: src.spa === null || src.spa === undefined ? null : clampNumber(src.spa, 0, 31, null),
    spd: src.spd === null || src.spd === undefined ? null : clampNumber(src.spd, 0, 31, null),
    spe: src.spe === null || src.spe === undefined ? null : clampNumber(src.spe, 0, 31, null)
  };
}

function isValidIvs(value) {
  return isObject(value) && ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
    .every((key) => typeof value[key] === 'number' && value[key] >= 0 && value[key] <= 31);
}

function generateIvsByQuality(quality) {
  const normalized = normalizeString(quality, 'low').toLowerCase();
  const targets = { low: 90, medium: 120, high: 150, perfect: 186 };
  if (normalized === 'perfect') {
    return { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  }

  const targetSum = targets[normalized] || targets.low;
  const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const ivs = {};
  let remaining = targetSum;
  for (let i = 0; i < stats.length; i += 1) {
    const stat = stats[i];
    if (i === stats.length - 1) {
      ivs[stat] = Math.min(31, Math.max(0, remaining));
      break;
    }
    const maxForThis = Math.min(31, remaining);
    const minForThis = Math.max(0, remaining - (stats.length - i - 1) * 31);
    ivs[stat] = Math.floor(Math.random() * (maxForThis - minForThis + 1)) + minForThis;
    remaining -= ivs[stat];
  }
  return ivs;
}

function normalizeStatsMeta(value, pokemon) {
  const src = isObject(value) ? value : {};
  const lv = clampNumber(pokemon?.lv ?? pokemon?.level, 1, 100, 5);
  const calculatedEv = Math.min(252, Math.floor(lv * 2.5));
  const currentEv = src.ev_level === undefined || src.ev_level === null
    ? calculatedEv
    : Math.max(clampNumber(src.ev_level, 0, 252, 0), calculatedEv);
  const quality = normalizeString(pokemon?.quality || pokemon?.iv_quality, '').toLowerCase();
  const normalizedIvs = normalizeIvs(src.ivs);
  const shouldGenerateIvs = ['low', 'medium', 'high', 'perfect'].includes(quality)
    && (!isValidIvs(normalizedIvs) || src.iv_quality === undefined || src.iv_quality === null || src.iv_quality !== quality);
  const ivs = shouldGenerateIvs ? generateIvsByQuality(quality) : normalizedIvs;
  return {
    ...clone(src, {}),
    ivs,
    iv_quality: shouldGenerateIvs ? quality : (src.iv_quality || quality || null),
    ev_level: currentEv
  };
}

function normalizeWorld(value) {
  const src = isObject(value) ? clone(value, {}) : {};
  return {
    time: {
      day: clampNumber(src.time?.day, 1, 99999, 1),
      period: normalizeString(src.time?.period, 'morning'),
      day_advance: src.time?.day_advance || null,
      period_set: src.time?.period_set || null
    }
  };
}

function normalizePokemon(raw, slot = null) {
  if (!isObject(raw) || !raw.name) return makeEmptySlot(slot || 0);
  const next = {
    ...clone(raw, {}),
    slot: slot || clampNumber(raw.slot, 1, 999, 0) || null,
    name: raw.name || null,
    nickname: raw.nickname || null,
    species: raw.species || raw.name || null,
    gender: raw.gender || null,
    lv: raw.lv ?? raw.level ?? null,
    shiny: raw.shiny === true,
    isAce: true,
    isLead: raw.isLead === true,
    bonds: clampNumber(raw.bonds, 0, 255, 0),
    moves: normalizeMoves(raw.moves),
    stats_meta: normalizeStatsMeta(raw.stats_meta, raw)
  };
  if (next.lv !== null) next.lv = clampNumber(next.lv, 1, 100, 5);
  return next;
}

function extractPartySlots(value) {
  if (Array.isArray(value)) return value.slice(0, MAX_PARTY_SIZE);
  if (!isObject(value)) return [];

  const namedSlots = [];
  for (let i = 1; i <= MAX_PARTY_SIZE; i += 1) {
    namedSlots.push(value[`slot${i}`] || makeEmptySlot(i));
  }
  if (namedSlots.some((slot) => isObject(slot) && slot.name)) return namedSlots;

  return Object.keys(value)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key])
    .slice(0, MAX_PARTY_SIZE);
}

function normalizePartySlots(value) {
  const rawSlots = extractPartySlots(value);
  const slots = Array.from({ length: MAX_PARTY_SIZE }, (_, index) => {
    const slotNumber = index + 1;
    return normalizePokemon(rawSlots[index] || makeEmptySlot(slotNumber), slotNumber);
  });

  const explicitLead = slots.findIndex((pokemon) => pokemon.name && pokemon.isLead);
  const firstFilled = slots.findIndex((pokemon) => pokemon.name);
  slots.forEach((pokemon, index) => {
    pokemon.slot = index + 1;
    pokemon.isAce = Boolean(pokemon.name);
    pokemon.isLead = Boolean(pokemon.name) && index === (explicitLead >= 0 ? explicitLead : firstFilled);
  });
  return slots;
}

function normalizeTransferBuffer(value) {
  if (!isObject(value) || !value.name) return null;
  const normalized = normalizePokemon(value, null);
  delete normalized.slot;
  normalized.isLead = false;
  return normalized;
}

function normalizeBox(value) {
  if (Array.isArray(value?.boxes)) {
    return {
      boxes: value.boxes.map((box, index) => ({
        id: normalizeString(box.id, `box_${String(index + 1).padStart(2, '0')}`),
        name: normalizeString(box.name, `Box ${index + 1}`),
        slots: Array.isArray(box.slots)
          ? box.slots.filter((pokemon) => pokemon && pokemon.name).map((pokemon) => normalizePokemon(pokemon, null))
          : []
      })),
      indexes: isObject(value.indexes) ? clone(value.indexes, {}) : {}
    };
  }

  const slots = [];
  if (isObject(value)) {
    Object.keys(value).filter((key) => key.startsWith('storage_')).sort().forEach((key) => {
      if (isObject(value[key]) && value[key].name) slots.push(normalizePokemon(value[key], null));
    });
  }
  return {
    boxes: [{ id: 'box_01', name: 'Box 1', slots }],
    indexes: {}
  };
}

function normalizeFinalNumbers(pkm) {
  const next = clone(pkm, {});

  next.player.proficiency = clampNumber(
    next.player.proficiency ?? next.player.trainerProficiency ?? 0,
    0,
    255,
    0
  );
  delete next.player.trainerProficiency;
  delete next.player['proficiency' + '_up'];

  next.party.slots = next.party.slots.map((pokemon) => {
    if (!pokemon?.name) return pokemon;
    const slot = clone(pokemon, pokemon);
    slot.bonds = clampNumber(slot.bonds, 0, 255, 0);
    delete slot['bonds' + '_up'];
    if (slot.stats_meta) {
      slot.stats_meta.ev_level = clampNumber(slot.stats_meta.ev_level, 0, 252, 0);
      delete slot.stats_meta['ev' + '_up'];
    }
    slot.isAce = true;
    return slot;
  });

  return next;
}

export function normalizePkmState(value = {}) {
  const source = isObject(value) ? clone(value, {}) : {};
  const player = isObject(source.player) ? source.player : {};
  const oldParty = isObject(player.party) ? player.party : {};
  const party = isObject(source.party) ? source.party : {};

  const pkm = {
    meta: {
      schemaVersion: 1,
      product: PRODUCT,
      version: VERSION,
      migratedFrom: source.meta?.migratedFrom || null,
      updatedAt: new Date().toISOString()
    },
    player: {
      name: normalizeString(player.name, '{{user}}'),
      proficiency: clampNumber(player.proficiency ?? player.trainerProficiency, 0, 255, 0),
      unlocks: { ...DEFAULT_UNLOCKS, ...(isObject(player.unlocks) ? player.unlocks : {}) },
      bonds: isObject(player.bonds) ? clone(player.bonds, {}) : {}
    },
    party: {
      slots: normalizePartySlots(Array.isArray(party.slots) ? party.slots : oldParty),
      transferBuffer: normalizeTransferBuffer(party.transferBuffer || party.transfer_buffer || oldParty.transfer_buffer)
    },
    box: normalizeBox(source.box || player.box || {}),
    world: normalizeWorld(isObject(source.world) ? source.world : source.world_state),
    battle: isObject(source.battle) ? clone(source.battle, {}) : {
      lastConfig: null,
      lastResult: null,
      pendingNarrative: null
    },
    settings: { ...DEFAULT_SETTINGS, ...(isObject(source.settings) ? source.settings : player.settings || {}) },
    runtime: {
      migration: isObject(source.runtime?.migration) ? clone(source.runtime.migration, {}) : {},
      flags: isObject(source.runtime?.flags) ? clone(source.runtime.flags, {}) : {},
      caches: isObject(source.runtime?.caches) ? clone(source.runtime.caches, {}) : {}
    }
  };

  return normalizeFinalNumbers(pkm);
}

export const PKMUniversalSchema = z.any()
  .default({})
  .transform((value) => normalizePkmState(value));

export const PKMUniversalStatDataSchema = z.object({
  pkm: z.any().default({}).transform((value) => normalizePkmState(value))
}).passthrough().transform((statData) => ({
  ...statData,
  pkm: normalizePkmState(statData.pkm)
}));

function registerSchemaWhenReady() {
  if (typeof registerMvuSchema !== 'function') {
    console.warn('[PKM-Universal-Schema] registerMvuSchema 不可用');
    return;
  }
  registerMvuSchema(PKMUniversalStatDataSchema);
  console.info('[PKM-Universal-Schema] MVU-zod 变量结构注册完成: stat_data.pkm');
}

const host = typeof window !== 'undefined' ? window : globalThis;
host.PKMUniversalSchemaRuntime = {
  version: VERSION,
  product: PRODUCT,
  normalizePkmState,
  PKMUniversalSchema,
  PKMUniversalStatDataSchema
};

if (typeof $ === 'function') {
  $(() => registerSchemaWhenReady());
} else {
  registerSchemaWhenReady();
}
