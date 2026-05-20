/**
 * PKM Pink Main MVU-ZOD schema.
 *
 * Defines and normalizes stat_data.pkm for the main content pack. Main keeps
 * dashboard-main specific world fields while using the same MVUZ state shape
 * as the universal pack.
 */

import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

const PRODUCT = 'main';
const CORE = globalThis.PKMPackCore || null;
const MAX_PARTY_SIZE = 6;
if (!CORE) throw new Error('[PKM-Main-Schema] requires PKMPackCore. Load pkm-core.js before this module.');

const DEFAULT_SETTINGS = CORE.getDefaultSettings(PRODUCT);
const DEFAULT_UNLOCKS = CORE.getDefaultUnlocks();
const PERIODS = ['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night', 'midnight'];
const DEFAULT_NPC_RECORDS = {
  gloria: { love: 0 },
  rosa: { love: 0 },
  dawn: { love: 0 },
  akari: { love: 0 },
  serena: { love: 0 },
  may: { love: 0 },
  selene: { love: 0 },
  juliana: { love: 0 },
  lusamine: { love: 0 },
  lillie: { love: 0 },
  mallow: { love: 0 },
  lana: { love: 0 },
  irida: { love: 0 },
  lacey: { love: 0 },
  misty: { love: 0 },
  sonia: { love: 0 },
  hex: { love: 0 },
  roxie: { love: 0 },
  iono: { love: 0 },
  erika: { love: 0 },
  nessa: { love: 0 },
  marnie: { love: 0 },
  acerola: { love: 0 },
  bea: { love: 0 },
  skyla: { love: 0 },
  iris: { love: 0 },
  nemona: { love: 0 },
  cynthia: { love: 0 }
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

function calculateDerivedTime(day) {
  const normalizedDay = Math.max(1, Math.round(Number(day) || 1));
  const dayOfYear = ((normalizedDay - 1) % 365) + 1;
  return {
    year: Math.floor((normalizedDay - 1) / 365) + 1,
    dayOfYear,
    month: Math.floor((dayOfYear - 1) / 30) + 1,
    dayOfMonth: ((dayOfYear - 1) % 30) + 1,
    week: Math.floor((normalizedDay - 1) / 7) + 1,
    dayOfWeek: (normalizedDay - 1) % 7
  };
}

function parseTimeAdvance(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return { days: value };
  const text = String(value).trim().toLowerCase();
  if (text === 'next_period' || text === 'next period' || text === 'nextperiod') return { periods: 1 };
  if (text === 'nextday' || text === 'next_day' || text === 'next day') return { nextDay: true };
  const compoundMatch = text.match(/^(\d+)\s*(day|days|week|weeks|month|months)[_\s]+(\w+)$/);
  if (compoundMatch && PERIODS.includes(compoundMatch[3])) {
    const valueNumber = Number(compoundMatch[1]);
    const unit = compoundMatch[2];
    const days = unit.startsWith('week')
      ? valueNumber * 7
      : unit.startsWith('month')
        ? valueNumber * 30
        : valueNumber;
    return { days, toPeriod: compoundMatch[3] };
  }
  const periodMatch = text.match(/^(\d+)\s*periods?$/);
  if (periodMatch) return { periods: Number(periodMatch[1]) };
  const dayMatch = text.match(/^(\d+)\s*(day|days|week|weeks|month|months)$/);
  if (dayMatch) {
    const valueNumber = Number(dayMatch[1]);
    const unit = dayMatch[2];
    return {
      days: unit.startsWith('week')
        ? valueNumber * 7
        : unit.startsWith('month')
          ? valueNumber * 30
          : valueNumber
    };
  }
  const skipMatch = text.match(/^skip[_\s]?to[_\s]?(\w+)$/);
  if (skipMatch && PERIODS.includes(skipMatch[1])) return { skipTo: skipMatch[1] };
  return null;
}

function applyTimeAdvance(time, advance) {
  let day = Math.max(1, Math.round(Number(time?.day) || 1));
  let period = PERIODS.includes(time?.period) ? time.period : 'morning';
  if (!advance) return { day, period, derived: calculateDerivedTime(day), day_advance: null, period_set: null };
  if (advance.nextDay) {
    day += 1;
    period = 'morning';
    return { day, period, derived: calculateDerivedTime(day), day_advance: null, period_set: null };
  }
  if (advance.days) {
    day += Math.max(0, Math.round(advance.days));
    if (PERIODS.includes(advance.toPeriod)) period = advance.toPeriod;
  }
  if (advance.periods) {
    const total = PERIODS.indexOf(period) + Math.max(0, Math.round(advance.periods));
    day += Math.floor(total / PERIODS.length);
    period = PERIODS[total % PERIODS.length];
  }
  if (advance.skipTo) {
    const current = PERIODS.indexOf(period);
    const target = PERIODS.indexOf(advance.skipTo);
    if (target <= current) day += 1;
    period = advance.skipTo;
  }
  return { day, period, derived: calculateDerivedTime(day), day_advance: null, period_set: null };
}

function applyPeriodSet(time, targetPeriod) {
  let day = Math.max(1, Math.round(Number(time?.day) || 1));
  let period = PERIODS.includes(time?.period) ? time.period : 'morning';
  const target = String(targetPeriod || '').toLowerCase();
  if (!PERIODS.includes(target)) return { day, period };
  const currentIndex = PERIODS.indexOf(period);
  const targetIndex = PERIODS.indexOf(target);
  if (targetIndex < currentIndex) day += 1;
  period = target;
  return { day, period };
}

function normalizeTime(value) {
  const raw = isObject(value) ? clone(value, {}) : {};
  let next = {
    ...raw,
    day: clampNumber(raw.day, 1, 99999, 1),
    period: PERIODS.includes(raw.period) ? raw.period : 'morning'
  };
  if (raw.day_advance) next = { ...next, ...applyTimeAdvance(next, parseTimeAdvance(raw.day_advance)) };
  if (raw.period_set && PERIODS.includes(String(raw.period_set).toLowerCase())) {
    next = { ...next, ...applyPeriodSet(next, raw.period_set) };
    next.period_set = null;
  }
  next.derived = calculateDerivedTime(next.day);
  next.day_advance = null;
  next.period_set = null;
  return next;
}

function normalizeMoves(value) {
  return CORE.normalizeMovesArray(value);
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

function makeEmptySlot(slot) {
  const empty = {
    ...CORE.createEmptySlot(slot),
    friendship: normalizeFriendship(null),
    moves: normalizeMoves(null),
    stats_meta: CORE.normalizeStatsMeta(null, null)
  };
  delete empty.bonds;
  return empty;
}

function normalizePokemon(raw, slot = null) {
  if (!isObject(raw)) return makeEmptySlot(slot || 0);
  const name = normalizeString(raw.name || raw.species || raw.nickname, '');
  if (!name) return makeEmptySlot(slot || clampNumber(raw.slot, 1, 999, 0) || 0);
  const next = {
    ...clone(raw, {}),
    slot: slot || clampNumber(raw.slot, 1, 999, 0) || null,
    name,
    nickname: raw.nickname || null,
    species: normalizeString(raw.species, name),
    gender: raw.gender || null,
    lv: clampNumber(raw.lv ?? raw.level, 1, 100, 5),
    quality: raw.quality || null,
    nature: raw.nature || null,
    ability: raw.ability || null,
    shiny: raw.shiny === true,
    item: raw.item || null,
    mechanic: raw.mechanic || null,
    teraType: raw.teraType || null,
    isAce: true,
    isLead: raw.isLead === true,
    friendship: normalizeFriendship(raw.friendship || raw.avs),
    moves: normalizeMoves(raw.moves),
    stats_meta: CORE.normalizeStatsMeta(raw.stats_meta, raw),
    notes: raw.notes || null
  };
  delete next.bonds;
  return next;
}

function normalizeParty(value) {
  const src = isObject(value) ? value : {};
  const rawSlots = Array.isArray(src.slots)
    ? src.slots
    : [src.slot1, src.slot2, src.slot3, src.slot4, src.slot5, src.slot6];
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
  return {
    slots,
    transferBuffer: normalizeTransferBuffer(src.transferBuffer ?? src.transfer_buffer)
  };
}

function normalizeTransferBuffer(value) {
  if (!isObject(value) || !value.name) return null;
  const normalized = normalizePokemon(value, null);
  delete normalized.slot;
  normalized.isLead = false;
  return normalized;
}

function normalizeBox(value) {
  const src = isObject(value) ? value : {};
  if (Array.isArray(src.boxes)) {
    const boxes = src.boxes.map((box, index) => ({
      id: normalizeString(box?.id, `box_${String(index + 1).padStart(2, '0')}`),
      name: normalizeString(box?.name, `Box ${index + 1}`),
      slots: Array.isArray(box?.slots)
        ? box.slots.map((pokemon) => normalizeTransferBuffer(pokemon)).filter(Boolean)
        : []
    }));
    return {
      boxes: boxes.length ? boxes : [{ id: 'box_01', name: 'Box 1', slots: [] }],
      indexes: isObject(src.indexes) ? clone(src.indexes, {}) : {}
    };
  }
  const slots = Object.entries(src)
    .filter(([key, pokemon]) => key.startsWith('storage_') && isObject(pokemon) && pokemon.name)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, pokemon]) => normalizeTransferBuffer(pokemon))
    .filter(Boolean);
  return {
    boxes: [{ id: 'box_01', name: 'Box 1', slots }],
    indexes: {}
  };
}

function deriveNpcStage(npcIdOrLove, recordOrFallback = {}, playerBonds = {}) {
  const npcData = globalThis.PKMMainPluginRuntime?.data?.npc || globalThis.PKM_MAIN_NPC_DATA || null;
  if ((typeof npcIdOrLove === 'string' || isObject(recordOrFallback)) && typeof npcData?.deriveNpcStage === 'function') {
    return npcData.deriveNpcStage(npcIdOrLove, recordOrFallback, playerBonds);
  }
  const fallback = typeof recordOrFallback === 'number' ? recordOrFallback : 0;
  const value = clampNumber(isObject(recordOrFallback) ? recordOrFallback.love : npcIdOrLove, -100, 100, 0);
  if (value <= -40) return -2;
  if (value <= -20) return -1;
  if (value < 20) return 0;
  if (value < 40) return 1;
  if (value < 60) return 2;
  if (value < 80) return 3;
  if (value <= 100) return 4;
  return fallback;
}

function normalizeNpcRecords(records) {
  const src = isObject(records) ? records : {};
  const output = {};
  Object.entries({ ...clone(DEFAULT_NPC_RECORDS, {}), ...src }).forEach(([key, record]) => {
    if (!key) return;
    const sourceLove = isObject(record) ? record.love : record;
    output[key] = { love: clampNumber(sourceLove, -100, 100, 0) };
  });
  return output;
}

function normalizeWeatherGrid(value) {
  const src = isObject(value) ? value : {};
  const output = {};
  Object.entries(src).forEach(([key, cell]) => {
    if (!key) return;
    if (typeof cell === 'string' && cell.trim()) {
      output[key] = cell.trim();
      return;
    }
    if (isObject(cell) && typeof cell.weather === 'string' && cell.weather.trim()) {
      output[key] = cell.weather.trim();
    }
  });
  return output;
}

function normalizeWorld(value) {
  const src = isObject(value) ? clone(value, {}) : {};
  const weatherGrid = src.weatherGrid ?? src.weather_grid;
  const pokemonSpawns = src.pokemonSpawns ?? src.pokemon_spawns;
  return {
    ...src,
    location: isObject(src.location) ? clone(src.location, {}) : {},
    time: normalizeTime(src.time),
    weatherGrid: normalizeWeatherGrid(weatherGrid),
    pokemonSpawns: isObject(pokemonSpawns) ? clone(pokemonSpawns, {}) : {},
    phenomenon: isObject(src.phenomenon)
      ? clone(src.phenomenon, {})
      : { active_type: 'clear', active_region: 'none' }
  };
}

function makeDefaultPkmState() {
  return {
    player: {
      name: '{{user}}',
      trainerProficiency: 0,
      proficiency: 0,
      unlocks: clone(DEFAULT_UNLOCKS, {}),
      bonds: {}
    },
    party: {
      slots: Array.from({ length: MAX_PARTY_SIZE }, (_, index) => makeEmptySlot(index + 1)),
      transferBuffer: null
    },
    box: {
      boxes: [{ id: 'box_01', name: 'Box 1', slots: [] }],
      indexes: {}
    },
    world: {
      location: {},
      time: normalizeTime({ day: 1, period: 'morning' }),
      weatherGrid: {},
      pokemonSpawns: {},
      phenomenon: { active_type: 'clear', active_region: 'none' }
    },
    npcs: {
      records: clone(DEFAULT_NPC_RECORDS, {})
    },
    battle: {
      lastConfig: null,
      lastResult: null,
      pendingNarrative: null
    },
    settings: clone(DEFAULT_SETTINGS, {})
  };
}

export function normalizePkmState(value = {}, product = PRODUCT) {
  const source = isObject(value) ? clone(value, {}) : {};
  const base = makeDefaultPkmState(product);
  const player = isObject(source.player) ? source.player : {};
  const trainerProficiency = clampNumber(
    player.trainerProficiency ?? player.proficiency ?? 0,
    0,
    255,
    0
  );
  const playerBonds = isObject(player.bonds) ? clone(player.bonds, {}) : {};
  const world = normalizeWorld(source.world || source.world_state);
  const npcSource = isObject(source.npcs?.records)
    ? source.npcs.records
    : (isObject(world.npcs) ? world.npcs : {});

  return {
    ...base,
    ...source,
    player: {
      ...base.player,
      ...player,
      name: normalizeString(player.name, base.player.name),
      trainerProficiency,
      proficiency: trainerProficiency,
      unlocks: { ...DEFAULT_UNLOCKS, ...(isObject(player.unlocks) ? player.unlocks : {}) },
      bonds: playerBonds
    },
    party: normalizeParty(source.party || player.party),
    box: normalizeBox(source.box || player.box),
    world,
    npcs: {
      records: normalizeNpcRecords(npcSource)
    },
    battle: {
      ...base.battle,
      ...(isObject(source.battle) ? source.battle : {})
    },
    settings: {
      ...DEFAULT_SETTINGS,
      ...(isObject(source.settings) ? source.settings : {}),
      ...(isObject(player.settings) ? player.settings : {})
    }
  };
}

export function migrateEraToPkmState(eraVars = {}, product = PRODUCT) {
  const era = isObject(eraVars) ? eraVars : {};
  return normalizePkmState({
    player: era.player || {},
    party: era.player?.party || {},
    box: era.player?.box || {},
    world: era.world_state || {},
    npcs: { records: era.world_state?.npcs || {} },
    settings: era.settings || {}
  }, product);
}

export const PKMMainSchema = z.any()
  .default({})
  .transform((value) => normalizePkmState(value));

export const PKMMainStatDataSchema = z.object({
  pkm: z.any().default({}).transform((value) => normalizePkmState(value))
}).passthrough().transform((statData) => ({
  ...statData,
  pkm: normalizePkmState(statData.pkm)
}));

function registerSchemaWhenReady() {
  if (typeof registerMvuSchema !== 'function') {
    console.warn('[PKM-Main-Schema] registerMvuSchema unavailable');
    return;
  }
  registerMvuSchema(PKMMainStatDataSchema);
  console.info('[PKM-Main-Schema] MVU-zod schema registered: stat_data.pkm');
}

const host = typeof window !== 'undefined' ? window : globalThis;
host.PKMMainSchemaRuntime = {
  product: PRODUCT,
  makeDefaultPkmState,
  deriveNpcStage,
  normalizePkmState,
  migrateEraToPkmState,
  PKMMainSchema,
  PKMMainStatDataSchema
};

if (typeof $ === 'function') {
  $(() => registerSchemaWhenReady());
} else {
  registerSchemaWhenReady();
}
