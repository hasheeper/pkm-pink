/**
 * =============================================================
 * ACEZERO MVU-ZOD SCHEMA — 变量结构定义 + 自动结算
 * =============================================================
 *
 * 注册在酒馆助手脚本库中，作为 MVU-zod 变量结构。
 * 功能：
 *   1. 定义 hero / world 变量的 zod schema（自动校验+转换）
 *   2. transform 中自动执行 hero 资金与队伍结构补全
 *   3. transform 中自动执行 world 时间结构补全
 *   4. 注册 registerMvuSchema 供变量管理器 + 变量更新使用
 *
 * 变量存储位置: message 变量 → stat_data
 * AI 使用 <UpdateVariable> 标签写入变量
 *
 * 依赖: MVU + MVU-zod (酒馆助手脚本)
 */

import { registerMvuSchema } from 'https://testingcf.jsdelivr.net/gh/StageDog/tavern_resource/dist/util/mvu_zod.js';

// ── schema 定义 ──────────────────────────────────────────────

const MANA_BY_LEVEL = {
  0: { max: 0 },
  1: { max: 40 },
  2: { max: 60 },
  3: { max: 80 },
  4: { max: 90 },
  5: { max: 100 }
};

const CAST_CHAR_KEYS = ['RINO', 'SIA', 'POPPY', 'VV', 'TRIXIE', 'COTA', 'EULALIA', 'KAKO', 'KUZUHA'];
const HERO_INTERNAL_KEY = 'KAZU';
const HERO_MACRO_KEY = '{{user}}';
const ALL_CHAR_KEYS = ['KAZU', ...CAST_CHAR_KEYS];
// 独立世界时钟的可选值（与 ACT 节点无关）
const WORLD_PHASES = ['MORNING', 'NOON', 'AFTERNOON', 'NIGHT'];
const WORLD_LAYERS = ['THE_COURT', 'THE_EXCHANGE', 'THE_STREET', 'THE_RUST'];
function makeDefaultCastNode() {
  return {
    activated: true,
    introduced: false,
    present: false,
    inParty: false,
    miniKnown: false,
  };
}

function makeDefaultRosterNode(charKey) {
  if (charKey === HERO_INTERNAL_KEY) {
    return { level: 3, mana: 0, maxMana: 0 };
  }

  if (charKey === 'RINO') {
    return { level: 5, mana: 100, maxMana: 100 };
  }

  const defaultMana = MANA_BY_LEVEL[1] ? MANA_BY_LEVEL[1].max : 40;
  return { level: 1, mana: defaultMana, maxMana: defaultMana };
}

function isCharacterData(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function normalizePositiveInt(value, fallback = 1) {
  const normalized = Math.round(Number(value) || 0);
  return normalized > 0 ? normalized : fallback;
}

function normalizeTrimmedString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function isHeroMacroToken(value) {
  return value === '{{user}}' || value === '<user>';
}

function normalizeEnumValue(value, allowedValues, fallback) {
  const normalized = normalizeTrimmedString(value, fallback).toUpperCase();
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function normalizeLowerEnumValue(value, allowedValues, fallback) {
  const normalized = normalizeTrimmedString(value, fallback).toLowerCase();
  return allowedValues.includes(normalized) ? normalized : fallback;
}

function makeDefaultWorldCurrentTime() {
  return {
    day: 1,
    phase: 'MORNING',
  };
}

function makeDefaultWorldLocation() {
  return {
    layer: 'THE_STREET',
    site: ''
  };
}

const RELATIONSHIP_SCORE = z.coerce
  .number()
  .transform(v => Math.max(0, Math.min(100, Math.round(v))))
  .default(0);

function makeRelationshipNode() {
  return z.object({
    entanglement: RELATIONSHIP_SCORE,
    exclusive: RELATIONSHIP_SCORE
  }).default({
    entanglement: 0,
    exclusive: 0
  });
}

const RelationshipSchema = z.object({
  RINO: makeRelationshipNode(),
  VV: makeRelationshipNode(),
  POPPY: makeRelationshipNode(),
  KUZUHA: makeRelationshipNode(),
  SIA: makeRelationshipNode(),
  EULALIA: makeRelationshipNode(),
  COTA: makeRelationshipNode(),
  KAKO: makeRelationshipNode(),
  TRIXIE: makeRelationshipNode()
}).default({
  RINO: { entanglement: 0, exclusive: 0 },
  VV: { entanglement: 0, exclusive: 0 },
  POPPY: { entanglement: 0, exclusive: 0 },
  KUZUHA: { entanglement: 0, exclusive: 0 },
  SIA: { entanglement: 0, exclusive: 0 },
  EULALIA: { entanglement: 0, exclusive: 0 },
  COTA: { entanglement: 0, exclusive: 0 },
  KAKO: { entanglement: 0, exclusive: 0 },
  TRIXIE: { entanglement: 0, exclusive: 0 }
});

const CastNodeSchema = z.object({
  activated: z.coerce.boolean().default(false),
  introduced: z.coerce.boolean().default(false),
  present: z.coerce.boolean().default(false),
  inParty: z.coerce.boolean().default(false),
  miniKnown: z.coerce.boolean().default(false),
}).transform(node => {
  const normalized = {
    activated: node.activated === true,
    introduced: node.introduced === true,
    present: node.present === true,
    inParty: node.inParty === true,
    miniKnown: node.miniKnown === true
  };

  if (normalized.present) {
    normalized.activated = true;
    normalized.introduced = true;
  }

  if (normalized.inParty) {
    normalized.activated = true;
    normalized.introduced = true;
  }

  if (normalized.miniKnown) {
    normalized.activated = true;
  }

  if (!normalized.activated) {
    normalized.present = false;
    normalized.inParty = false;
  }

  return normalized;
});

const CastSchema = z.object({
  RINO: CastNodeSchema.optional(),
  SIA: CastNodeSchema.optional(),
  POPPY: CastNodeSchema.optional(),
  VV: CastNodeSchema.optional(),
  TRIXIE: CastNodeSchema.optional(),
  COTA: CastNodeSchema.optional(),
  EULALIA: CastNodeSchema.optional(),
  KAKO: CastNodeSchema.optional(),
  KUZUHA: CastNodeSchema.optional()
}).default({});

const HeroAliasSchema = z.object({
  KAZU: z.string().transform(v => normalizeTrimmedString(v, '')).optional()
}).passthrough().default({});

// 角色数据 schema（level / mana / maxMana）
const CharacterSchema = z.object({
  level: z.coerce.number().transform(v => Math.max(0, Math.min(5, Math.round(v)))).default(0),
  mana: z.coerce.number().transform(v => Math.max(0, Math.round(v))).default(0),
  maxMana: z.coerce.number().transform(v => Math.max(0, Math.round(v))).default(0)
}).passthrough();

function normalizeFunds(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.round(numeric * 100) / 100);
}

const RosterSchema = z.object({
  KAZU: CharacterSchema.optional(),
  RINO: CharacterSchema.optional(),
  SIA: CharacterSchema.optional(),
  POPPY: CharacterSchema.optional(),
  VV: CharacterSchema.optional(),
  TRIXIE: CharacterSchema.optional(),
  COTA: CharacterSchema.optional(),
  EULALIA: CharacterSchema.optional(),
  KAKO: CharacterSchema.optional(),
  KUZUHA: CharacterSchema.optional()
}).default({});

const WorldTimeSchema = z.object({
  day: z.coerce.number().transform(v => normalizePositiveInt(v, 1)).default(1),
  phase: z.string().transform(v => normalizeEnumValue(v, WORLD_PHASES, 'MORNING')).default('MORNING')
}).default(makeDefaultWorldCurrentTime());

const WorldLocationSchema = z.object({
  layer: z.string().transform(v => normalizeEnumValue(v, WORLD_LAYERS, 'THE_STREET')).default('THE_STREET'),
  site: z.string().transform(v => normalizeTrimmedString(v, '')).default('')
}).default(makeDefaultWorldLocation());

const WorldExpansionStateSchema = z.object({
  activeMajor: z.string().transform(v => normalizeTrimmedString(v, '')).default(''),
  activeLight: z.array(z.string().transform(v => normalizeTrimmedString(v, ''))).default([])
}).default({
  activeMajor: '',
  activeLight: []
}).transform(state => ({
  activeMajor: normalizeTrimmedString(state.activeMajor, ''),
  activeLight: Array.from(new Set(
    (Array.isArray(state.activeLight) ? state.activeLight : [])
      .map(value => normalizeTrimmedString(value, ''))
      .filter(Boolean)
  ))
}));

const ACT_RESOURCE_KEYS = ['combat', 'rest', 'asset', 'vision'];
const ACT_RESOURCE_ALIASES = {
  contract: 'asset',
  event: 'vision'
};
const ACT_SLOT_SOURCES = ['limited', 'reserve'];
const ACT_STAGE_VALUES = ['planning', 'executing', 'route', 'complete'];

function makeDefaultActResourceCounts(defaultValue = 0) {
  return {
    combat: defaultValue,
    rest: defaultValue,
    asset: defaultValue,
    vision: defaultValue
  };
}

function normalizeActResourceKey(value, fallback = 'vision') {
  const normalized = normalizeTrimmedString(value, fallback).toLowerCase();
  const migrated = ACT_RESOURCE_ALIASES[normalized] || normalized;
  return ACT_RESOURCE_KEYS.includes(migrated) ? migrated : fallback;
}

function normalizeActResourceCounts(value, options = {}) {
  const { allowDecimal = false, defaultValue = 0 } = options;
  const source = value && typeof value === 'object' ? value : {};
  const out = makeDefaultActResourceCounts(defaultValue);
  const seen = new Set();
  Object.entries(source).forEach(([rawKey, rawValue]) => {
    const key = normalizeActResourceKey(rawKey, '');
    if (!key) return;
    const numeric = Number(rawValue);
    const safeValue = Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
    const normalized = allowDecimal ? safeValue : Math.max(0, Math.round(safeValue));
    if (seen.has(key)) out[key] += normalized;
    else out[key] = normalized;
    seen.add(key);
  });
  return out;
}

function normalizePendingFirstMeet(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const out = {};
  Object.entries(source).forEach(([rawKey, rawHint]) => {
    const charKey = normalizeTrimmedString(rawKey, '').toUpperCase();
    const hint = normalizeTrimmedString(rawHint, '');
    if (!charKey || !hint) return;
    out[charKey] = hint;
  });
  return out;
}

function makeDefaultActVisionState() {
  return {
    baseSight: 1,
    bonusSight: 0,
    jumpReady: false,
    pendingReplace: null
  };
}

function makeDefaultActState() {
  return {
    id: 'chapter0_exchange',
    seed: 'AUTO',
    nodeIndex: 1,
    route_history: [],
    limited: makeDefaultActResourceCounts(0),
    reserve: makeDefaultActResourceCounts(0),
    reserve_progress: makeDefaultActResourceCounts(0),
    income_rate: makeDefaultActResourceCounts(0.2),
    income_progress: makeDefaultActResourceCounts(0),
    phase_slots: [null, null, null, null],
    phase_index: 0,
    stage: 'executing',
    phase_advance: 0,
    pickedPacks: {},
    controlledNodes: {},
    crisis: 0,
    crisisSignals: [],
    vision: makeDefaultActVisionState(),
    resourceSpent: makeDefaultActResourceCounts(0),
    characterEncounter: {},
    pendingFirstMeet: {},
    pendingResolutions: [],
    resolutionHistory: [],
    narrativeTension: 0,
    pendingTransitionTarget: '',
    transitionRequestTarget: '',
    pendingTransitionPrompt: ''
  };
}

const ActResourceCountsSchema = z.any()
  .default(makeDefaultActResourceCounts(0))
  .transform(v => normalizeActResourceCounts(v, { allowDecimal: false }));

const ActProgressCountsSchema = z.any()
  .default(makeDefaultActResourceCounts(0))
  .transform(v => normalizeActResourceCounts(v, { allowDecimal: true }));

const ActIncomeRateSchema = z.any()
  .default(makeDefaultActResourceCounts(0.2))
  .transform(v => {
    const normalized = normalizeActResourceCounts(v, { allowDecimal: true, defaultValue: 0.2 });
    for (const key of ACT_RESOURCE_KEYS) {
      normalized[key] = Math.max(0, Math.min(1.5, normalized[key]));
    }
    return normalized;
  });

const ActPhaseSlotSchema = z.object({
  key: z.string().transform(v => normalizeActResourceKey(v, 'vision')).default('vision'),
  source: z.string().transform(v => normalizeLowerEnumValue(v, ACT_SLOT_SOURCES, 'limited')).default('limited'),
  amount: z.coerce.number().transform(v => Math.max(1, Math.min(3, Math.round(v)))).default(1),
  sources: z.array(z.string().transform(v => normalizeLowerEnumValue(v, ACT_SLOT_SOURCES, 'limited'))).optional(),
  tint: z.string().transform(v => normalizeActResourceKey(v, '')).optional(),
  tintSource: z.string().transform(v => normalizeLowerEnumValue(v, ACT_SLOT_SOURCES, 'limited')).optional(),
  controlType: z.string().transform(v => normalizeActResourceKey(v, '')).optional(),
  targetKey: z.string().transform(v => normalizeActResourceKey(v, '')).optional()
}).default({
  key: 'vision',
  source: 'limited',
  amount: 1
});

const ActVisionStateSchema = z.object({
  baseSight: z.coerce.number().transform(v => Math.max(0, Math.round(v))).default(1),
  bonusSight: z.coerce.number().transform(v => Math.max(0, Math.round(v))).default(0),
  jumpReady: z.coerce.boolean().default(false),
  pendingReplace: z.any().nullable().default(null)
}).default(makeDefaultActVisionState());

const WorldActSchema = z.object({
  id: z.string().transform(v => normalizeTrimmedString(v, 'chapter0_exchange')).default('chapter0_exchange'),
  seed: z.string().transform(v => normalizeTrimmedString(v, 'AUTO')).default('AUTO'),
  nodeIndex: z.coerce.number().transform(v => normalizePositiveInt(v, 1)).default(1),
  route_history: z.array(z.string().transform(v => normalizeTrimmedString(v, ''))).default([]),
  limited: ActResourceCountsSchema,
  reserve: ActResourceCountsSchema,
  reserve_progress: ActProgressCountsSchema,
  income_rate: ActIncomeRateSchema,
  income_progress: ActProgressCountsSchema,
  phase_slots: z.array(z.union([ActPhaseSlotSchema, z.null()])).default([null, null, null, null]),
  phase_index: z.coerce.number().transform(v => Math.max(0, Math.round(v))).default(0),
  stage: z.string().transform(v => normalizeLowerEnumValue(v, ACT_STAGE_VALUES, 'executing')).default('executing'),
  phase_advance: z.coerce.number().transform(v => Math.max(0, Math.round(v))).default(0),
  // 随机池消耗记录：{ [nodeId]: { [phaseIndex]: candidateId } }
  pickedPacks: z.record(z.record(z.string())).default({}),
  controlledNodes: z.record(z.any()).default({}),
  crisis: z.coerce.number().transform(v => Math.max(0, Math.min(100, Math.round(v)))).default(0),
  crisisSignals: z.array(z.any()).default([]),
  vision: ActVisionStateSchema,
  resourceSpent: ActResourceCountsSchema,
  characterEncounter: z.record(z.any()).default({}),
  pendingFirstMeet: z.record(z.any()).default({}).transform(v => normalizePendingFirstMeet(v)),
  pendingResolutions: z.array(z.any()).default([]),
  resolutionHistory: z.array(z.any()).default([]),
  // 情节张力（0-100）——服务于 prompt 软节奏提示，不流出给 LLM
  narrativeTension: z.coerce.number().transform(v => Math.max(0, Math.min(100, Math.round(v)))).default(0),
  pendingTransitionTarget: z.string().transform(v => normalizeTrimmedString(v, '')).default(''),
  transitionRequestTarget: z.string().transform(v => normalizeTrimmedString(v, '')).default(''),
  pendingTransitionPrompt: z.string().transform(v => normalizeTrimmedString(v, '')).default('')
}).default(makeDefaultActState()).transform(act => {
  act.id = normalizeTrimmedString(act.id, 'chapter0_exchange');
  act.seed = normalizeTrimmedString(act.seed, 'AUTO');
  act.nodeIndex = normalizePositiveInt(act.nodeIndex, 1);
  act.phase_index = Math.max(0, Math.min(4, Math.round(Number(act.phase_index) || 0)));
  act.phase_advance = Math.max(0, Math.round(Number(act.phase_advance) || 0));
  act.stage = normalizeLowerEnumValue(act.stage, ACT_STAGE_VALUES, 'executing');

  act.route_history = Array.isArray(act.route_history)
    ? act.route_history.map(value => normalizeTrimmedString(value, '')).filter(Boolean)
    : [];

  act.limited = ActResourceCountsSchema.parse(act.limited);
  act.reserve = ActResourceCountsSchema.parse(act.reserve);
  act.reserve_progress = ActProgressCountsSchema.parse(act.reserve_progress);
  act.income_rate = ActIncomeRateSchema.parse(act.income_rate);
  act.income_progress = ActProgressCountsSchema.parse(act.income_progress);

  const normalizedSlots = Array.from({ length: 4 }, (_, index) => {
    const slot = Array.isArray(act.phase_slots) ? act.phase_slots[index] : null;
    if (!slot || typeof slot !== 'object') return null;
    const amount = Math.max(1, Math.min(3, Math.round(Number(slot.amount) || 1)));
    const rawSources = Array.isArray(slot.sources) && slot.sources.length
      ? slot.sources
      : Array.from({ length: amount }, () => slot.source);
    const sources = rawSources
      .slice(0, amount)
      .map(source => normalizeLowerEnumValue(source, ACT_SLOT_SOURCES, 'limited'));
    while (sources.length < amount) sources.push(normalizeLowerEnumValue(slot.source, ACT_SLOT_SOURCES, 'limited'));
    const normalized = {
      key: normalizeActResourceKey(slot.key, 'vision'),
      source: normalizeLowerEnumValue(slot.source, ACT_SLOT_SOURCES, 'limited'),
      amount,
      sources
    };
    const tint = normalizeActResourceKey(slot.tint || slot.controlType || slot.targetKey, '');
    if (normalized.key === 'rest' && tint) {
      normalized.tint = tint;
      if (slot.tintSource) normalized.tintSource = normalizeLowerEnumValue(slot.tintSource, ACT_SLOT_SOURCES, 'limited');
    }
    return normalized;
  });
  act.phase_slots = normalizedSlots;

  // pickedPacks 兄式对象相依赖 zod 已假设为 object；空或非对象归零
  if (!act.pickedPacks || typeof act.pickedPacks !== 'object' || Array.isArray(act.pickedPacks)) {
    act.pickedPacks = {};
  }

  // narrativeTension 夹到 [0, 100]
  act.narrativeTension = Math.max(0, Math.min(100, Math.round(Number(act.narrativeTension) || 0)));
  act.controlledNodes = act.controlledNodes && typeof act.controlledNodes === 'object' && !Array.isArray(act.controlledNodes)
    ? act.controlledNodes
    : {};
  act.crisis = Math.max(0, Math.min(100, Math.round(Number(act.crisis) || 0)));
  act.vision = ActVisionStateSchema.parse(act.vision);
  act.resourceSpent = ActResourceCountsSchema.parse(act.resourceSpent);
  act.characterEncounter = act.characterEncounter && typeof act.characterEncounter === 'object' && !Array.isArray(act.characterEncounter)
    ? act.characterEncounter
    : {};
  act.pendingFirstMeet = normalizePendingFirstMeet(act.pendingFirstMeet);
  act.pendingResolutions = Array.isArray(act.pendingResolutions)
    ? act.pendingResolutions.filter(item => item && typeof item === 'object' && !Array.isArray(item))
    : [];
  act.crisisSignals = Array.isArray(act.crisisSignals)
    ? act.crisisSignals.filter(item => item && typeof item === 'object' && !Array.isArray(item))
    : [];
  act.resolutionHistory = Array.isArray(act.resolutionHistory)
    ? act.resolutionHistory.filter(item => item && typeof item === 'object' && !Array.isArray(item))
    : [];
  act.pendingTransitionTarget = normalizeTrimmedString(act.pendingTransitionTarget, '');
  act.transitionRequestTarget = normalizeTrimmedString(act.transitionRequestTarget, '');
  act.pendingTransitionPrompt = normalizeTrimmedString(act.pendingTransitionPrompt, '');

  return act;
});

const WorldSchema = z.object({
  current_time: WorldTimeSchema,
  clockPressure: z.coerce.number().transform(v => Math.max(0, Math.min(100, Math.round(v)))).default(0),
  location: WorldLocationSchema,
  expansion_state: WorldExpansionStateSchema,
  act: WorldActSchema,
  expansions: z.record(z.any()).default({})
}).default({
  current_time: makeDefaultWorldCurrentTime(),
  clockPressure: 0,
  location: makeDefaultWorldLocation(),
  expansion_state: {
    activeMajor: '',
    activeLight: []
  },
  act: makeDefaultActState(),
  expansions: {}
}).transform(world => {
  world.current_time = world.current_time && typeof world.current_time === 'object'
    ? world.current_time
    : makeDefaultWorldCurrentTime();
  world.clockPressure = Math.max(0, Math.min(100, Math.round(Number(world.clockPressure) || 0)));

  world.location = world.location && typeof world.location === 'object'
    ? world.location
    : makeDefaultWorldLocation();

  world.current_time.day = normalizePositiveInt(world.current_time.day, 1);
  world.current_time.phase = normalizeEnumValue(world.current_time.phase, WORLD_PHASES, 'MORNING');
  world.location.layer = normalizeEnumValue(world.location.layer, WORLD_LAYERS, 'THE_STREET');
  world.location.site = normalizeTrimmedString(world.location.site, '');

  world.expansion_state = world.expansion_state && typeof world.expansion_state === 'object'
    ? world.expansion_state
    : { activeMajor: '', activeLight: [] };
  world.act = world.act && typeof world.act === 'object'
    ? world.act
    : makeDefaultActState();
  world.expansions = world.expansions && typeof world.expansions === 'object' && !Array.isArray(world.expansions)
    ? world.expansions
    : {};

  world.expansion_state.activeMajor = normalizeTrimmedString(world.expansion_state.activeMajor, '');
  world.expansion_state.activeLight = Array.from(new Set(
    (Array.isArray(world.expansion_state.activeLight) ? world.expansion_state.activeLight : [])
      .map(value => normalizeTrimmedString(value, ''))
      .filter(Boolean)
  ));

  world.act = WorldActSchema.parse(world.act);

  return world;
});

// hero 根 schema
const HeroSchema = z.object({
  funds: z.coerce.number().transform(normalizeFunds).default(5),
  assets: z.coerce.number().transform(normalizeFunds).default(0),
  debt: z.coerce.number().transform(normalizeFunds).default(0),
  majorDebt: z.coerce.number().transform(normalizeFunds).default(395000000),
  aliases: HeroAliasSchema,
  expansions: z.record(z.any()).default({}),

  cast: CastSchema,
  roster: RosterSchema,
  relationship: RelationshipSchema,

  // 旧结构角色数据（兼容存档读取，主逻辑迁移到 hero.roster）
  KAZU: CharacterSchema.default({ level: 3, mana: 0, maxMana: 0 }),
  RINO: CharacterSchema.optional(),
  SIA: CharacterSchema.optional(),
  POPPY: CharacterSchema.optional(),
  VV: CharacterSchema.optional(),
  TRIXIE: CharacterSchema.optional(),
  COTA: CharacterSchema.optional(),
  EULALIA: CharacterSchema.optional(),
  KAKO: CharacterSchema.optional(),
  KUZUHA: CharacterSchema.optional()
}).passthrough().transform(hero => {
  hero.funds = normalizeFunds(hero.funds);
  hero.assets = normalizeFunds(hero.assets);
  hero.debt = normalizeFunds(hero.debt);
  hero.majorDebt = normalizeFunds(hero.majorDebt);
  hero.aliases = hero.aliases && typeof hero.aliases === 'object' ? hero.aliases : {};
  hero.expansions = hero.expansions && typeof hero.expansions === 'object' && !Array.isArray(hero.expansions)
    ? hero.expansions
    : {};
  hero.aliases.KAZU = normalizeTrimmedString(hero.aliases.KAZU, '');
  if (!hero.aliases.KAZU) {
    hero.aliases.KAZU = HERO_MACRO_KEY;
  }

  const explicitHeroDisplayName = normalizeTrimmedString(hero.heroDisplayName, '');
  if (explicitHeroDisplayName && !isHeroMacroToken(explicitHeroDisplayName)) {
    hero.heroDisplayName = explicitHeroDisplayName;
  } else {
    delete hero.heroDisplayName;
  }

  // ── 自动结算 1: 初始化 cast 默认结构 ──
  hero.cast = hero.cast && typeof hero.cast === 'object' ? hero.cast : {};
  for (const key of CAST_CHAR_KEYS) {
    hero.cast[key] = {
      ...makeDefaultCastNode(),
      ...(hero.cast[key] || {})
    };
  }

  // ── 自动结算 2: 迁移旧角色数值到 roster ──
  hero.roster = hero.roster && typeof hero.roster === 'object' ? hero.roster : {};
  for (const key of ALL_CHAR_KEYS) {
    if (hero.roster[key] == null && isCharacterData(hero[key])) {
      hero.roster[key] = { ...hero[key] };
      console.log(`[ACE0-Schema] 旧角色数据迁移: hero.${key} -> hero.roster.${key}`);
    }
  }

  // ── 自动结算 3: roster 默认补全 ──
  for (const charKey of CAST_CHAR_KEYS) {
    if (hero.cast[charKey]?.inParty !== true) continue;
    if (hero.roster[charKey] != null) continue;

    hero.roster[charKey] = makeDefaultRosterNode(charKey);
    console.log(`[ACE0-Schema] 角色入队: ${charKey}, 补全 hero.roster 默认数据`);
  }

  if (hero.roster[HERO_INTERNAL_KEY] == null) {
    hero.roster[HERO_INTERNAL_KEY] = makeDefaultRosterNode(HERO_INTERNAL_KEY);
  }

  // 宏名只作为输入兼容与展示别名，不作为内部主键保留。
  delete hero.roster[HERO_MACRO_KEY];
  delete hero[HERO_MACRO_KEY];

  // ── 自动结算 4: 兜底补全 roster 结构 ──
  for (const key of ALL_CHAR_KEYS) {
    if (hero.roster[key] == null) {
      hero.roster[key] = makeDefaultRosterNode(key);
    }
  }

  // ── mana clamp: 确保 hero.roster.*.mana <= maxMana ──
  for (const key of ALL_CHAR_KEYS) {
    const c = hero.roster[key];
    if (!c || typeof c !== 'object') continue;
    if (c.maxMana != null && c.mana != null) {
      c.mana = Math.min(c.mana, c.maxMana);
    }
  }

  return hero;
});

// 顶层 schema
export const ACE0Schema = z.object({
  hero: HeroSchema.default({
    aliases: {
      KAZU: '{{user}}'
    },
    expansions: {},
    funds: 5,
    assets: 0,
    debt: 0,
    majorDebt: 395000000,
    cast: {
      RINO: { activated: true, introduced: true, present: true, inParty: true },
      SIA: makeDefaultCastNode(),
      POPPY: makeDefaultCastNode(),
      VV: makeDefaultCastNode(),
      TRIXIE: makeDefaultCastNode(),
      COTA: makeDefaultCastNode(),
      EULALIA: makeDefaultCastNode(),
      KAKO: makeDefaultCastNode(),
      KUZUHA: makeDefaultCastNode()
    },
    roster: {
      KAZU: makeDefaultRosterNode('KAZU'),
      RINO: makeDefaultRosterNode('RINO'),
      SIA: makeDefaultRosterNode('SIA'),
      POPPY: makeDefaultRosterNode('POPPY'),
      VV: makeDefaultRosterNode('VV'),
      TRIXIE: makeDefaultRosterNode('TRIXIE'),
      COTA: makeDefaultRosterNode('COTA'),
      EULALIA: makeDefaultRosterNode('EULALIA'),
      KAKO: makeDefaultRosterNode('KAKO'),
      KUZUHA: makeDefaultRosterNode('KUZUHA')
    },
    relationship: {
      RINO: { entanglement: 0, exclusive: 0 },
      VV: { entanglement: 0, exclusive: 0 },
      POPPY: { entanglement: 0, exclusive: 0 },
      KUZUHA: { entanglement: 0, exclusive: 0 },
      SIA: { entanglement: 0, exclusive: 0 },
      EULALIA: { entanglement: 0, exclusive: 0 },
      COTA: { entanglement: 0, exclusive: 0 },
      KAKO: { entanglement: 0, exclusive: 0 },
      TRIXIE: { entanglement: 0, exclusive: 0 }
    },
    KAZU: { level: 3, mana: 0, maxMana: 0 },
    RINO: { level: 5, mana: 100, maxMana: 100 },
    SIA: { level: 1, mana: 40, maxMana: 40 },
    POPPY: { level: 1, mana: 40, maxMana: 40 },
    VV: { level: 1, mana: 40, maxMana: 40 },
    TRIXIE: { level: 1, mana: 40, maxMana: 40 },
    COTA: { level: 1, mana: 40, maxMana: 40 },
    EULALIA: { level: 1, mana: 40, maxMana: 40 },
    KAKO: { level: 1, mana: 40, maxMana: 40 },
    KUZUHA: { level: 1, mana: 40, maxMana: 40 }
  }),
  world: WorldSchema.default({
    current_time: makeDefaultWorldCurrentTime(),
    clockPressure: 0,
    location: makeDefaultWorldLocation(),
    expansion_state: {
      activeMajor: '',
      activeLight: []
    },
    act: makeDefaultActState(),
    expansions: {}
  })
}).passthrough();

// ── 注册 schema ──────────────────────────────────────────────

$(() => {
  registerMvuSchema(ACE0Schema);
  console.info('[ACE0-Schema] MVU-zod 变量结构注册完成');
});
