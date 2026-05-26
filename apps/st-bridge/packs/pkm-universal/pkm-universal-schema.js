/**
 * =============================================================
 * PKM PINK UNIVERSAL MVU-ZOD SCHEMA
 * =============================================================
 *
 * Role:
 *   1. Defines stat_data.pkm for the Universal content pack.
 *   2. Keeps numeric fields clamp-safe after MVU JSONPatch delta:
 *      - player.proficiency
 *      - party.slots[].stats_meta.ev_level
 *      - party.slots[].bonds
 *   3. Registers with MVU-zod.
 *
 * Storage:
 *   message variables -> stat_data.pkm
 *
 * AI writes through <UpdateVariable> and targets pkm.* paths.
 */

import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

const PRODUCT = 'universal';
const CORE = globalThis.PKMPackCore || null;
const MAX_PARTY_SIZE = 6;
if (!CORE) throw new Error('[PKM-Universal-Schema] requires PKMPackCore. Load pkm-core.js before this module.');

const DEFAULT_SETTINGS = CORE.getDefaultSettings(PRODUCT);
const DEFAULT_UNLOCKS = CORE.getDefaultUnlocks();

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
  return CORE.createEmptySlot(slot);
}

function normalizeMoves(value) {
  return CORE.normalizeMovesArray(value);
}

function normalizeWorld(value) {
  const src = isObject(value) ? clone(value, {}) : {};
  const location = isObject(src.location) ? src.location : {};
  return {
    location: {
      region: normalizeString(location.region, ''),
      location: normalizeString(location.location, '')
    },
    time: {
      day: clampNumber(src.time?.day, 1, 99999, 1),
      period: normalizeString(src.time?.period, 'morning'),
      day_advance: src.time?.day_advance || null,
      period_set: src.time?.period_set || null
    }
  };
}

function deriveNpcStage(love) {
  if (love <= 31) return -2;
  if (love <= 63) return -1;
  if (love <= 127) return 0;
  if (love <= 159) return 1;
  if (love <= 191) return 2;
  if (love <= 223) return 3;
  return 4;
}

function normalizeNpcRecord(value) {
  if (!isObject(value)) return null;
  const love = clampNumber(value.love, 0, 255, 0);
  return {
    love,
    stage: deriveNpcStage(love)
  };
}

function normalizeNpcs(value) {
  const src = isObject(value) ? value : {};
  const recordsSrc = isObject(src.records) ? src.records : {};
  const records = {};
  Object.entries(recordsSrc).forEach(([key, record]) => {
    const normalizedKey = String(key || '').trim();
    const normalizedRecord = normalizeNpcRecord(record);
    if (normalizedKey && normalizedRecord) {
      records[normalizedKey] = normalizedRecord;
    }
  });
  return { records };
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
    stats_meta: CORE.normalizeStatsMeta(raw.stats_meta, raw)
  };
  if (next.lv !== null) next.lv = clampNumber(next.lv, 1, 100, 5);
  return next;
}

function normalizePartySlots(value) {
  const rawSlots = Array.isArray(value) ? value.slice(0, MAX_PARTY_SIZE) : [];
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
  return {
    boxes: Array.isArray(value?.boxes)
      ? value.boxes.map((box, index) => ({
          id: normalizeString(box.id, `box_${String(index + 1).padStart(2, '0')}`),
          name: normalizeString(box.name, `Box ${index + 1}`),
          slots: Array.isArray(box.slots)
            ? box.slots.filter((pokemon) => pokemon && pokemon.name).map((pokemon) => normalizePokemon(pokemon, null))
            : []
        }))
      : [{ id: 'box_01', name: 'Box 1', slots: [] }]
  };
}

function normalizeFinalNumbers(pkm) {
  const next = clone(pkm, {});

  next.player.proficiency = clampNumber(
    next.player.proficiency,
    0,
    255,
    0
  );

  next.party.slots = next.party.slots.map((pokemon) => {
    if (!pokemon?.name) return pokemon;
    const slot = clone(pokemon, pokemon);
    slot.bonds = clampNumber(slot.bonds, 0, 255, 0);
    if (slot.stats_meta) {
      slot.stats_meta.ev_level = clampNumber(slot.stats_meta.ev_level, 0, 252, 0);
    }
    slot.isAce = true;
    return slot;
  });

  return next;
}

export function normalizePkmState(value = {}) {
  const source = isObject(value) ? clone(value, {}) : {};
  const player = isObject(source.player) ? source.player : {};
  const party = isObject(source.party) ? source.party : {};

  const pkm = {
    player: {
      name: normalizeString(player.name, '{{user}}'),
      proficiency: clampNumber(player.proficiency, 0, 255, 0),
      unlocks: { ...DEFAULT_UNLOCKS, ...(isObject(player.unlocks) ? player.unlocks : {}) }
    },
    party: {
      slots: normalizePartySlots(party.slots),
      transferBuffer: normalizeTransferBuffer(party.transferBuffer)
    },
    box: normalizeBox(source.box),
    world: normalizeWorld(source.world),
    npcs: normalizeNpcs(source.npcs),
    settings: { ...DEFAULT_SETTINGS, ...(isObject(source.settings) ? source.settings : {}) }
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
