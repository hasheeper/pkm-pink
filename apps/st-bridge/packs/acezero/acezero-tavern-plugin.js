/**
 * =============================================================
 * ACEZERO TAVERN PLUGIN — 酒馆助手中间件
 * =============================================================
 *
 * 流程:
 *
 *   1. GENERATION_AFTER_COMMANDS
 *      读取 MVU 变量 → 构建 hero 状态 XML 摘要 → injectPrompts 注入 AI 上下文
 *
 *   2. AI 回复
 *      AI 在正文中输出 <ACE0_BATTLE> { ...战局JSON... } </ACE0_BATTLE>
 *      同时 AI 可能输出 <UpdateVariable> 标签（MVU-zod 框架自动处理）
 *
 *   3. mag_before_message_update (优选) / character_message_rendered (兜底)
 *      检测消息中的 <ACE0_BATTLE> 标签 → 解析 AI 的战局 JSON
 *      → 读取 MVU hero 数据 → 按等级展开技能/特质/属性
 *      → 合并为完整 game-config
 *      → 追加 <ACE0_FRONTEND>\n{完整JSON}\n</ACE0_FRONTEND> 到消息
 *      → SillyTavern 正则匹配 ACE0_FRONTEND → 替换为 STver.html（$1 = JSON）
 *      → STver.html 解析 JSON → postMessage 到游戏 iframe
 *
 *      资金结算 (funds_up/funds_down) 与 cast/roster 状态补全由
 *      acezero-schema.js 的 zod transform 自动处理，无需插件介入。
 *
 * MVU 变量结构（message 变量 → stat_data）:
 * {
 *   "hero": {
 *     "funds": 5,
 *     "cast": { "RINO": { "introduced": true, "present": true, "inParty": true } },
 *     "roster": { "KAZU": { "level": 3, "mana": 0, "maxMana": 0 }, "RINO": { "level": 5, "mana": 100, "maxMana": 100 } }
 *   },
 * }
 *
 * 依赖: MVU-zod 变量框架 + JS-Slash-Runner (酒馆助手) API
 *       acezero-schema.js (变量结构定义 + 自动结算)
 */

(async function () {
  'use strict';

  const PLUGIN_NAME = '[ACE0]';
  const BATTLE_TAG = 'ACE0_BATTLE';
  const FRONTEND_TAG = 'ACE0_FRONTEND';
  const ACT_RESULT_TAG = 'ACE0_ACT_RESULT';
  const HERO_INJECT_ID = 'ace0_hero_state';
  const REL_STATE_INJECT_ID = 'ace0_relationship_state';
  const PRIMARY_CONTEXT_INJECT_ID = 'ace0_primary_context';
  const ACT_STATE_INJECT_ID = 'ace0_act_state';
  const ACT_CHARTER_INJECT_ID = 'ace0_act_charter';
  const ACT_NARRATIVE_INJECT_ID = 'ace0_act_narrative';
  const ACT_TRANSITION_INJECT_ID = 'ace0_act_transition';
  const ACT_PACING_INJECT_ID = 'ace0_narrative_pacing';
  const ACT_FIRST_MEET_INJECT_ID = 'ace0_first_meet';
  const WORLD_CONTEXT_INJECT_ID = 'ace0_world_context';
  const LOCATION_DOC_INJECT_ID = 'ace0_location_doc';
  const HERO_INTERNAL_KEY = 'KAZU';
  const HERO_MACRO_NAME = '{{user}}';
  const HERO_MACRO_ALT = '<user>';
  const CHAR_DOC_INJECT_IDS = {
    RINO: 'ace0_char_doc_rino',
    SIA: 'ace0_char_doc_sia',
    POPPY: 'ace0_char_doc_poppy',
    VV: 'ace0_char_doc_vv',
    TRIXIE: 'ace0_char_doc_trixie',
    COTA: 'ace0_char_doc_cota',
    EULALIA: 'ace0_char_doc_eulalia',
    KAKO: 'ace0_char_doc_kako',
    KUZUHA: 'ace0_char_doc_kuzuha'
  };
  const FULL_DOC_WORLDBOOK_NAME = 'AceZeroInfo-MVUVer-1.2.4';
  const FULL_DOC_UIDS = {
    RINO: 10,
    SIA: 12,
    POPPY: 8,
    VV: 14,
    TRIXIE: 16,
    EULALIA: 23,
    KAKO: 24,
    COTA: 25,
    KUZUHA: 26
  };
  const WORLD_LAYERS = ['THE_COURT', 'THE_EXCHANGE', 'THE_STREET', 'THE_RUST'];
  const DEFAULT_WORLD_LOCATION = {
    layer: 'THE_STREET',
    site: ''
  };
  const LOCATION_LAYER_META = {
    THE_COURT: {
      label: '上庭层',
      english: 'The Court',
      fullDoc: `
<ace0_location_doc>
[当前位于上庭层 / The Court]
- 位置: 城市最高层。王廷旧址、顶级私人赌场、管理局本部。
- 运势环境: 最高浓度好运覆盖。常年花开不败，极光盘旋。维持成本极高，依赖底层厄运排放。
- 产业功能: 终端消费市场。好运的最终买家。
- 居民: 宗家残余、商会最高层、管理局高官。
- 日常生活:
  - 食物: 温室食材、甜点、宴会菜和预约制餐厅。
  - 住房: 私宅、套房、会所和安静得过头的长走廊。
  - 医疗: 上层诊所可直接拿好运压风险。
- 主要设施:
  - 顶级私人赌场、管理局本部、私宅会所、温室、黑窗车厢。
- 赌场: 私人邀请制。百金弗起步，赌局可涉及产权、契约权、人身归属。
- 通行: 黑色筹码（1000金弗）或特别通行许可。
</ace0_location_doc>
`
    },
    THE_EXCHANGE: {
      label: '中市层',
      english: 'The Exchange',
      fullDoc: `
<ace0_location_doc>
[当前位于中市层 / The Exchange]
- 位置: 城市中上层。商会总部、魔运交易所、高端商业区。
- 运势环境: 管网持续输送好运，运势常年偏高。天气稳定，空气洁净。
- 产业功能: 加工与定价。好运在此提纯、包装、挂牌出售。
- 居民: 商会职员、中高端能力者、掮客、富商。
- 日常生活:
  - 食物: 咖啡馆、职员食堂、便餐店、烘焙铺。
  - 住房: 公寓、职员宿舍和体面的租屋。
  - 医疗: 药房与体面诊所密集，恢复条件优于下层。
  - 场景感: 早晨升降列车到站，职员夹着文件袋下车，翻牌板开始报价，咖啡馆、公证柜台和药房一起开门。
- 主要设施:
  - 商会总部、魔运交易所、公证柜台、贵宾厅、休憩室。
- 赌场: 贵宾厅级别。全面允许魔运对决，配监测员和契约管理处。
- 通行: 蓝色筹码（1金弗）以上或等值信用凭证。
</ace0_location_doc>
`
    },
    THE_STREET: {
      label: '下街层',
      english: 'The Street',
      fullDoc: `
<ace0_location_doc>
[当前位于下街层 / The Street]
- 位置: 城市地面层。主干道、商业街、大众娱乐区。
- 运势环境: 接近天然，略偏低。增幅装置仅覆盖赌场内部。
- 产业功能: 采集场。赌客在此输掉运势，被赌场吸纳进入工业流水线。
- 居民: 普通市民、低端赌徒、服务业从业者。
- 日常生活:
  - 食物: 炸物摊、小酒馆、夜间餐车、赌场边热汤店。
  - 住房: 老公寓、旅馆、赌徒短租房。
  - 医疗: 以便宜诊所和普通急救为主，条件远不如中上层。
  - 场景感: 雨夜路灯、典当行、廉价旅馆和赌场热气混在一起，大多数人眼里的幸运之都就是这里。
- 主要设施:
  - 大众游戏大厅、商业街、典当行、廉价旅馆、街头摊位。
- 赌场: 大众游戏大厅。低端桌禁止魔运，中端桌允许有限使用。
- 通行: 无限制。
</ace0_location_doc>
`
    },
    THE_RUST: {
      label: '底锈层',
      english: 'The Rust',
      fullDoc: `
<ace0_location_doc>
[当前位于底锈层 / The Rust]
- 位置: 城市最底层。地下管道、废弃隧道、旧排水系统。
- 运势环境: 厄运废料终点站。死灰长年填埋，酸雾弥漫，常年无日照，事故频发。
- 产业功能: 原料产地与垃圾场。存在完整地下经济闭环。
- 居民: 破产者、逃债者、流浪儿、回声瘾君子。
- 日常生活:
  - 食物: 汤站、黑市干粮、上层废弃食品回收和廉价潮湿作物。
  - 住房: 泵房、夹层、铁皮窝棚和管道边能睡人的热地方。
  - 医疗: 以廉价镇痛、抗灰药、黑市诊所和教会收容所为主。
  - 场景感: 潮、锈、漏水、断灯、滴答响个不停；不是单纯废墟，是整座城的下水道、垃圾场和备用胃袋。
- 主要设施:
  - 旧泵站、检修梯、私接线、汤站、黑市诊所、血锈私局。
- 赌场: 无正规赌场。仅有血锈私局，无契约保护。
- 通行: 无限制。无人想来。
</ace0_location_doc>
`
    }
  };
  const ACT_RESOURCE_KEYS = ['combat', 'rest', 'asset', 'vision'];
  const ACT_RESOURCE_ALIASES = {
    contract: 'asset',
    event: 'vision'
  };
  const ACT_STAGE_VALUES = ['planning', 'executing', 'route', 'complete'];
  // 节点内四段，与 world.clock 晨昼暮夜解耦
  const ACT_PHASE_LABELS = ['一段', '二段', '三段', '四段'];
  // 独立世界时钟：world.current_time 由它推进，与 ACT 节点无关。
  const WORLD_CLOCK_SLOTS = ['MORNING', 'NOON', 'AFTERNOON', 'NIGHT'];
  const DEFAULT_WORLD_CLOCK = { day: 1, phase: 'MORNING' };
  const DEFAULT_WORLD_CLOCK_PRESSURE = 0;
  const DEBT_INTEREST_RATE_PER_PHASE = 0.005;
  const MAJOR_DEBT_INTEREST_RATE_PER_PHASE = 0.01;

  const DEFAULT_WORLD_ACT = {
    id: 'chapter0_exchange',
    seed: 'AUTO',
    // 节点序列索引（1..totalNodes），与世界日无关
    nodeIndex: 1,
    route_history: [],
    limited: { combat: 0, rest: 0, asset: 0, vision: 0 },
    reserve: { combat: 0, rest: 0, asset: 0, vision: 0 },
    reserve_progress: { combat: 0, rest: 0, asset: 0, vision: 0 },
    income_rate: { combat: 0.2, rest: 0.2, asset: 0.2, vision: 0.2 },
    income_progress: { combat: 0, rest: 0, asset: 0, vision: 0 },
    phase_slots: [null, null, null, null],
    phase_index: 0,
    // 本章已去掉 planning（编排相）——玩家通过 Dashboard 在 executing 过程中随时排/改未来相位的 slot。
    stage: 'executing',
    phase_advance: 0,
    // 随机池消耗记录 { [nodeId]: { [phaseIndex]: candidateId } }
    pickedPacks: {},
    controlledNodes: {},
    crisis: 0,
    crisisSignals: [],
    vision: { baseSight: 1, bonusSight: 0, jumpReady: false, pendingReplace: null },
    resourceSpent: { combat: 0, rest: 0, asset: 0, vision: 0 },
    characterEncounter: {},
    pendingResolutions: [],
    resolutionHistory: [],
    // 情节张力 0-100
    narrativeTension: 0,
    // 首见帧持久化缓冲：{ [charKey]: hintText }
    // 生命周期 = 当前节点/段位内（由 phase_advance 清空）。
    // 绑到 MVU→绑楼层，玩家编辑 / swipe / 重生成都不会掉。
    pendingFirstMeet: {},
    pendingTransitionTarget: '',
    transitionRequestTarget: '',
    pendingTransitionPrompt: ''
  };
  // ACT 章节真相已迁入 `acezero-act-plugin.js`。

  let lastHandledMk = null;
  let fullDocWorldbookCache = null;
  let fullDocWorldbookNameLoaded = null;
  let isProcessing = false;
  let pendingActBaselineSnapshot = null;
  let hasWarnedMissingActModule = false;
  let lastObservedWorldClock = null;
  let latchedTransitionRequestTarget = '';
  // 首见帧楼层哨兵：记录上次注入 <ace0_first_meet> 时的 chat.length。
  // prompt 构造前比较当前 chat.length：若更大 → 玩家已发下一条 → 清空 pendingFirstMeet。
  // 相同或更小 → swipe / edit / regen 同一楼层 → 保留 pending 复用。
  // -1 表示尚未注入或已在 CHAT_CHANGED 时重置。
  let lastFirstMeetInjectChatLen = -1;

  function getAce0HostRoot() {
    try {
      if (window.parent && window.parent !== window) return window.parent;
    } catch (_) {}

    try {
      if (window.top && window.top !== window) return window.top;
    } catch (_) {}

    return window;
  }

  function isSameWorldClock(a, b) {
    if (!a || !b) return false;
    return Number(a.day) === Number(b.day) && String(a.phase || '') === String(b.phase || '');
  }

  console.log(`${PLUGIN_NAME} 插件加载中...`);

  // ==========================================================
  //  通用技能目录（与 skill-system.js UNIVERSAL_SKILLS 同步）
  // ==========================================================

  const UNIVERSAL_SKILLS = {
    minor_wish:   { attr: 'moirai', tier: 3, threshold: 20 },
    grand_wish:   { attr: 'moirai', tier: 2, threshold: 40 },
    divine_order: { attr: 'moirai', tier: 1, threshold: 60 },
    hex:          { attr: 'chaos',  tier: 3, threshold: 20 },
    havoc:        { attr: 'chaos',  tier: 2, threshold: 40 },
    catastrophe:  { attr: 'chaos',  tier: 1, threshold: 60 },
    clarity:      { attr: 'psyche', tier: 3, threshold: 20 },
    refraction:   { attr: 'psyche', tier: 2, threshold: 40 },
    axiom:        { attr: 'psyche', tier: 1, threshold: 60 },
    static_field: { attr: 'void',   tier: 3, threshold: 20 },
    insulation:   { attr: 'void',   tier: 2, threshold: 40 },
    reality:      { attr: 'void',   tier: 1, threshold: 60 },
    // 角色专属技能
    royal_decree: { attr: 'moirai', tier: 0, threshold: 80, exclusive: 'RINO' },
    heart_read:   { attr: 'psyche', tier: 2, threshold: 20, exclusive: 'RINO' },
    cooler:       { attr: 'chaos',  tier: 2, threshold: 40, exclusive: 'SIA' },
    skill_seal:   { attr: 'chaos',  tier: 2, threshold: 40, exclusive: 'SIA' },
    clairvoyance: { attr: 'psyche', tier: 2, threshold: 40, exclusive: 'VV' },
    bubble_liquidation: { attr: 'psyche', tier: 0, threshold: 80, exclusive: 'VV' },
    miracle:      { attr: 'moirai', tier: 0, threshold: 0,  exclusive: 'POPPY' },
    lucky_find:   { attr: 'moirai', tier: 0, threshold: 0,  exclusive: 'POPPY' },
    rule_rewrite: { attr: 'chaos',  tier: 2, threshold: 40, exclusive: 'TRIXIE' },
    blind_box:    { attr: 'chaos',  tier: 0, threshold: 80, exclusive: 'TRIXIE' },
    deal_card:        { attr: 'psyche', tier: 2, threshold: 20, exclusive: 'COTA' },
    gather_or_spread: { attr: 'psyche', tier: 2, threshold: 40, exclusive: 'COTA' },
    absolution:      { attr: 'moirai', tier: 0, threshold: 70, exclusive: 'EULALIA' },
    benediction:     { attr: 'moirai', tier: 2, threshold: 30, exclusive: 'EULALIA' },
    reclassification:{ attr: 'psyche', tier: 2, threshold: 40, exclusive: 'KAKO' },
    general_ruling:  { attr: 'psyche', tier: 1, threshold: 60, exclusive: 'KAKO' },
    house_edge:      { attr: 'chaos',  tier: 2, threshold: 40, exclusive: 'KUZUHA' },
    debt_call:       { attr: 'chaos',  tier: 1, threshold: 70, exclusive: 'KUZUHA' }
  };

  // 特质解锁（通用，按等级）
  const VANGUARD_TRAIT_UNLOCK = {
    0: null, 1: null, 2: null, 3: null, 4: null, 5: null
  };

  const REARGUARD_TRAIT_UNLOCK = {
    0: null, 1: null, 2: null, 3: null, 4: null, 5: null
  };

  const MANA_BY_LEVEL = {
    0: { max: 0,   regen: 0 },
    1: { max: 40,  regen: 3 },
    2: { max: 60,  regen: 4 },
    3: { max: 80,  regen: 4 },
    4: { max: 90,  regen: 5 },
    5: { max: 100, regen: 5 }
  };

  // ==========================================================
  //  小游戏技能配置表
  // ==========================================================

  const MINI_GAME_SKILLS = {
    blackjack: {
      moirai: { key: 'lucky_hit', threshold: 20 },
      chaos: { key: 'curse_transfer', threshold: 20 },
      psyche: { key: 'peek', threshold: 20 }
    },
    dice: {
      moirai: { key: 'fortune_die', threshold: 20 },
      chaos: { key: 'jinx_die', threshold: 20 },
      psyche: { key: 'foresight', threshold: 20 }
    },
    dragon_tiger: {
      moirai: { key: 'dt_boost', threshold: 20 },
      chaos: { key: 'dt_swap', threshold: 20 },
      psyche: { key: 'dt_peek', threshold: 20 }
    }
  };

  function deriveMiniGameSkills(attrs, gameMode) {
    const gameKey = gameMode === 'dragon-tiger' ? 'dragon_tiger' : gameMode;
    const skillDefs = MINI_GAME_SKILLS[gameKey];
    if (!skillDefs) return [];
    const available = [];
    if ((attrs.moirai || 0) >= skillDefs.moirai.threshold) available.push(skillDefs.moirai.key);
    if ((attrs.chaos || 0) >= skillDefs.chaos.threshold) available.push(skillDefs.chaos.key);
    if ((attrs.psyche || 0) >= skillDefs.psyche.threshold) available.push(skillDefs.psyche.key);
    return available;
  }

  // ==========================================================
  //  专属角色档案 (NAMED_CHARACTERS)
  //  专属角色有固定的属性成长、特质、专属技能
  //  当作为 hero 主手/副手时，按等级查表展开
  //  当作为 NPC 敌人时，使用 difficulty = "角色名" 的独立角色配置
  // ==========================================================

  const NAMED_CHARACTERS = {
    // KAZU — 主角默认主手，Void 特化
    KAZU: {
      displayName: 'KAZU',
      preferredSlot: 'vanguard',
      attrsByLevel: {
        0: { moirai: 0,  chaos: 0,  psyche: 0,  void: 0 },
        1: { moirai: 0,  chaos: 0,  psyche: 10, void: 20 },
        2: { moirai: 0,  chaos: 0,  psyche: 20, void: 40 },
        3: { moirai: 0,  chaos: 0,  psyche: 30, void: 60 },
        4: { moirai: 0,  chaos: 0,  psyche: 35, void: 80 },
        5: { moirai: 0,  chaos: 0,  psyche: 40, void: 100 }
      },
      traitByLevel: {
        vanguard: { 0: null, 1: null, 2: 'null_armor', 3: 'null_armor', 4: 'null_armor', 5: 'null_armor' },
        rearguard: { 0: null, 1: null, 2: null, 3: 'steady_hand', 4: 'steady_hand', 5: 'steady_hand' }
      },
      exclusiveSkills: []  // KAZU 无专属技能
    },

    // RINO (♥ 天宫理乃) — 主角默认副手，Moirai + Psyche 特化
    RINO: {
      displayName: 'RINO',
      preferredSlot: 'rearguard',
      attrsByLevel: {
        0: { moirai: 0,  chaos: 0,  psyche: 0,  void: 0 },
        1: { moirai: 20, chaos: 10, psyche: 10, void: 0 },
        2: { moirai: 40, chaos: 15, psyche: 15, void: 0 },
        3: { moirai: 60, chaos: 20, psyche: 20, void: 0 },
        4: { moirai: 70, chaos: 20, psyche: 25, void: 0 },
        5: { moirai: 80, chaos: 20, psyche: 30, void: 0 }
      },
      traitByLevel: {
        vanguard: { 0: null, 1: null, 2: 'crimson_crown', 3: 'crimson_crown', 4: 'crimson_crown', 5: 'crimson_crown' },
        rearguard: { 0: null, 1: null, 2: null, 3: 'obsessive_love', 4: 'obsessive_love', 5: 'obsessive_love' }
      },
      exclusiveSkills: ['royal_decree', 'heart_read', 'minor_wish']
    },

    // SIA (♠ 夜伽希亚) — Chaos + Moirai 特化，Cooler 风格
    SIA: {
      displayName: 'SIA',
      preferredSlot: 'vanguard',
      attrsByLevel: {
        0: { moirai: 0,  chaos: 0,  psyche: 0,  void: 0 },
        1: { moirai: 10, chaos: 20, psyche: 5,  void: 0 },
        2: { moirai: 15, chaos: 40, psyche: 5,  void: 0 },
        3: { moirai: 20, chaos: 60, psyche: 10, void: 0 },
        4: { moirai: 25, chaos: 70, psyche: 10, void: 0 },
        5: { moirai: 30, chaos: 80, psyche: 10, void: 0 }
      },
      traitByLevel: {
        vanguard: { 0: null, 1: null, 2: 'death_ledger', 3: 'death_ledger', 4: 'death_ledger', 5: 'death_ledger' },
        rearguard: { 0: null, 1: null, 2: null, 3: 'binding_protocol', 4: 'binding_protocol', 5: 'binding_protocol' }
      },
      exclusiveSkills: ['cooler', 'skill_seal']
    },

    // VV (♦ 薇布伦·凡恩 / Veblen Vane) — 商会执行董事，洞察+泡沫+做空
    // 世界观第四主角（千里眼/偷天换日）
    VV: {
      displayName: 'V.V.',
      preferredSlot: 'vanguard',
      attrsByLevel: {
        0: { moirai: 0,  chaos: 0,  psyche: 0,  void: 0 },
        1: { moirai: 5,  chaos: 10, psyche: 20, void: 0 },
        2: { moirai: 5,  chaos: 15, psyche: 40, void: 0 },
        3: { moirai: 10, chaos: 20, psyche: 60, void: 0 },
        4: { moirai: 10, chaos: 25, psyche: 70, void: 0 },
        5: { moirai: 10, chaos: 30, psyche: 80, void: 0 }
      },
      traitByLevel: {
        vanguard: { 0: null, 1: null, 2: 'laser_eye', 3: 'laser_eye', 4: 'laser_eye', 5: 'laser_eye' },
        rearguard: { 0: null, 1: null, 2: null, 3: 'service_fee', 4: 'service_fee', 5: 'service_fee' }
      },
      exclusiveSkills: ['clairvoyance', 'bubble_liquidation']
    },

    // POPPY (♣ 波比·希德) — 被动触发型，绝境强运
    POPPY: {
      displayName: 'POPPY',
      preferredSlot: 'rearguard',
      attrsByLevel: {
        0: { moirai: 0,  chaos: 0,  psyche: 0,  void: 0 },
        1: { moirai: 10, chaos: 0,  psyche: 5,  void: 0 },
        2: { moirai: 20, chaos: 0,  psyche: 10, void: 0 },
        3: { moirai: 30, chaos: 0,  psyche: 15, void: 0 },
        4: { moirai: 40, chaos: 0,  psyche: 20, void: 0 },
        5: { moirai: 50, chaos: 0,  psyche: 25, void: 0 }
      },
      traitByLevel: {
        vanguard: { 0: null, 1: null, 2: 'four_leaf_clover', 3: 'four_leaf_clover', 4: 'four_leaf_clover', 5: 'four_leaf_clover' },
        rearguard: { 0: null, 1: null, 2: null, 3: 'cockroach', 4: 'cockroach', 5: 'cockroach' }
      },
      exclusiveSkills: ['miracle', 'lucky_find']
    },

    // TRIXIE (🃏 缇克希·怀尔德 / 鬼牌) — 纯混沌型，规则破坏者
    TRIXIE: {
      displayName: 'TRIXIE',
      preferredSlot: 'vanguard',
      attrsByLevel: {
        0: { moirai: 0,  chaos: 0,  psyche: 0,  void: 0 },
        1: { moirai: 0,  chaos: 20, psyche: 10, void: 0 },
        2: { moirai: 0,  chaos: 40, psyche: 15, void: 0 },
        3: { moirai: 0,  chaos: 60, psyche: 20, void: 0 },
        4: { moirai: 0,  chaos: 70, psyche: 25, void: 0 },
        5: { moirai: 0,  chaos: 80, psyche: 30, void: 0 }
      },
      traitByLevel: {
        vanguard: { 0: null, 1: null, 2: 'paradox_frame', 3: 'paradox_frame', 4: 'paradox_frame', 5: 'paradox_frame' },
        rearguard: { 0: null, 1: null, 2: null, 3: 'improvised_stage', 4: 'improvised_stage', 5: 'improvised_stage' }
      },
      exclusiveSkills: ['rule_rewrite', 'blind_box']
    },

    // COTA (可塔·林特 / Cota Lint #247) — Psyche 特化，契约处理型
    COTA: {
      displayName: 'COTA',
      preferredSlot: 'vanguard',
      attrsByLevel: {
        0: { moirai: 0,  chaos: 0,  psyche: 0,  void: 0 },
        1: { moirai: 10, chaos: 0,  psyche: 15, void: 0 },
        2: { moirai: 15, chaos: 2,  psyche: 28, void: 0 },
        3: { moirai: 20, chaos: 5,  psyche: 40, void: 0 },
        4: { moirai: 25, chaos: 5,  psyche: 50, void: 0 },
        5: { moirai: 30, chaos: 5,  psyche: 60, void: 0 }
      },
      traitByLevel: {
        vanguard: { 0: null, 1: null, 2: 'contract_template', 3: 'contract_template', 4: 'contract_template', 5: 'contract_template' },
        rearguard: { 0: null, 1: null, 2: null, 3: 'dealer_hands_fault', 4: 'dealer_hands_fault', 5: 'dealer_hands_fault' }
      },
      exclusiveSkills: ['deal_card', 'gather_or_spread']
    },

    // EULALIA (尤拉莉亚·帕瑞蒂) — Moirai + Void 特化，殉道支援型
    EULALIA: {
      displayName: 'EULALIA',
      preferredSlot: 'rearguard',
      attrsByLevel: {
        0: { moirai: 0,  chaos: 0,  psyche: 0,  void: 0 },
        1: { moirai: 25, chaos: 0,  psyche: 10, void: 0 },
        2: { moirai: 45, chaos: 0,  psyche: 15, void: 0 },
        3: { moirai: 65, chaos: 0,  psyche: 20, void: 0 },
        4: { moirai: 80, chaos: 0,  psyche: 25, void: 0 },
        5: { moirai: 95, chaos: 0,  psyche: 30, void: 0 }
      },
      traitByLevel: {
        vanguard: { 0: null, 1: null, 2: 'martyr_frame', 3: 'martyr_frame', 4: 'martyr_frame', 5: 'martyr_frame' },
        rearguard: { 0: null, 1: null, 2: null, 3: 'sanctuary_core', 4: 'sanctuary_core', 5: 'sanctuary_core' }
      },
      exclusiveSkills: ['absolution', 'benediction']
    },

    // KAKO (司伽子) — Psyche + Chaos 特化，审判裁定型
    KAKO: {
      displayName: 'KAKO',
      preferredSlot: 'vanguard',
      attrsByLevel: {
        0: { moirai: 0,  chaos: 0,  psyche: 0,  void: 0 },
        1: { moirai: 5,  chaos: 15, psyche: 20, void: 0 },
        2: { moirai: 8,  chaos: 22, psyche: 35, void: 0 },
        3: { moirai: 10, chaos: 30, psyche: 50, void: 0 },
        4: { moirai: 12, chaos: 35, psyche: 60, void: 0 },
        5: { moirai: 15, chaos: 40, psyche: 70, void: 0 }
      },
      traitByLevel: {
        vanguard: { 0: null, 1: null, 2: 'redline_file', 3: 'redline_file', 4: 'redline_file', 5: 'redline_file' },
        rearguard: { 0: null, 1: null, 2: null, 3: 'signoff_flow', 4: 'signoff_flow', 5: 'signoff_flow' }
      },
      exclusiveSkills: ['reclassification', 'general_ruling']
    },

    // KUZUHA (久世九叶) — Chaos + Moirai 特化，庄家型
    KUZUHA: {
      displayName: 'KUZUHA',
      preferredSlot: 'vanguard',
      attrsByLevel: {
        0: { moirai: 0,  chaos: 0,  psyche: 0,  void: 0 },
        1: { moirai: 15, chaos: 20, psyche: 5,  void: 0 },
        2: { moirai: 22, chaos: 35, psyche: 8,  void: 0 },
        3: { moirai: 30, chaos: 50, psyche: 10, void: 0 },
        4: { moirai: 35, chaos: 60, psyche: 12, void: 0 },
        5: { moirai: 40, chaos: 70, psyche: 15, void: 0 }
      },
      traitByLevel: {
        vanguard: { 0: null, 1: null, 2: 'house_tab', 3: 'house_tab', 4: 'house_tab', 5: 'house_tab' },
        rearguard: { 0: null, 1: null, 2: null, 3: 'grace_period', 4: 'grace_period', 5: 'grace_period' }
      },
      exclusiveSkills: ['house_edge', 'debt_call']
    }
  };

  /**
   * 专属角色作为 NPC 敌人时的默认配置
   * 当 AI 在 seats 中写入 { "character": "RINO" } 时，
   * 自动展开为完整的独立角色配置，并将 difficulty 设为对应角色名
   */
  const NAMED_NPC_PRESETS = {
    KAZU: {
      level: 5,
      ai: 'balanced',
      difficulty: 'kazu',
      emotion: 'calm',
      attrs: { moirai: 10, chaos: 30, psyche: 30, void: 80 },
      skills: ['reality', 'insulation', 'refraction', 'static_field'],
      vanguardTrait: 'null_armor',
      rearguardTrait: 'steady_hand',
      mental: { discipline: 50, composureMax: 100, resistPresence: 10, resistTaunt: 10, resistProbe: 15 },
      desc: 'KAZU'
    },
    RINO: {
      level: 5,
      ai: 'aggressive',
      difficulty: 'rino',
      emotion: 'confident',
      attrs: { moirai: 80, chaos: 20, psyche: 30, void: 0 },
      skills: ['royal_decree', 'grand_wish', 'minor_wish', 'heart_read'],
      vanguardTrait: 'crimson_crown',
      rearguardTrait: 'obsessive_love',
      mental: { discipline: 90, composureMax: 120, resistPresence: 25, resistTaunt: 20, resistProbe: 30 },
      desc: 'RINO'
    },
    SIA: {
      level: 5,
      ai: 'aggressive',
      difficulty: 'sia',
      emotion: 'calm',
      attrs: { moirai: 30, chaos: 80, psyche: 10, void: 0 },
      skills: ['cooler', 'havoc', 'hex', 'skill_seal'],
      vanguardTrait: 'death_ledger',
      rearguardTrait: 'binding_protocol',
      mental: { discipline: 95, composureMax: 120, resistPresence: 15, resistTaunt: 40, resistProbe: 20 },
      desc: 'SIA'
    },
    POPPY: {
      level: 5,
      ai: 'passive',
      difficulty: 'poppy',
      emotion: 'relaxed',
      attrs: { moirai: 50, chaos: 0, psyche: 25, void: 0 },
      skills: ['miracle', 'lucky_find'],
      vanguardTrait: 'four_leaf_clover',
      rearguardTrait: 'cockroach',
      mental: { discipline: 60, composureMax: 100, resistPresence: 30, resistTaunt: 15, resistProbe: 15 },
      desc: 'POPPY'
    },
    VV: {
      level: 5,
      ai: 'balanced',
      difficulty: 'vv',
      emotion: 'calm',
      attrs: { moirai: 10, chaos: 30, psyche: 80, void: 0 },
      skills: ['clairvoyance', 'bubble_liquidation', 'refraction', 'clarity'],
      vanguardTrait: 'laser_eye',
      rearguardTrait: 'service_fee',
      mental: { discipline: 100, composureMax: 120, resistPresence: 20, resistTaunt: 15, resistProbe: 40 },
      desc: 'VV'
    },
    TRIXIE: {
      level: 5,
      ai: 'maniac',
      difficulty: 'trixie',
      emotion: 'euphoric',
      attrs: { moirai: 0, chaos: 80, psyche: 30, void: 0 },
      skills: ['rule_rewrite', 'blind_box', 'havoc', 'hex'],
      vanguardTrait: 'paradox_frame',
      rearguardTrait: 'improvised_stage',
      mental: { discipline: 85, composureMax: 120, resistPresence: 10, resistTaunt: 20, resistProbe: 45 },
      desc: 'TRIXIE'
    },
    COTA: {
      level: 5,
      ai: 'balanced',
      difficulty: 'cota',
      emotion: 'calm',
      attrs: { moirai: 30, chaos: 5, psyche: 60, void: 0 },
      skills: ['deal_card', 'gather_or_spread', 'refraction', 'clarity'],
      vanguardTrait: 'contract_template',
      rearguardTrait: 'dealer_hands_fault',
      mental: { discipline: 60, composureMax: 100, resistPresence: 20, resistTaunt: 15, resistProbe: 25 },
      desc: 'COTA'
    },
    EULALIA: {
      level: 5,
      ai: 'passive',
      difficulty: 'eulalia',
      emotion: 'calm',
      attrs: { moirai: 95, chaos: 0, psyche: 30, void: 0 },
      skills: ['absolution', 'benediction', 'divine_order', 'grand_wish'],
      vanguardTrait: 'martyr_frame',
      rearguardTrait: 'sanctuary_core',
      mental: { discipline: 95, composureMax: 120, resistPresence: 40, resistTaunt: 25, resistProbe: 20 },
      desc: 'EULALIA'
    },
    KAKO: {
      level: 5,
      ai: 'balanced',
      difficulty: 'kako',
      emotion: 'confident',
      attrs: { moirai: 15, chaos: 40, psyche: 70, void: 0 },
      skills: ['reclassification', 'general_ruling', 'axiom', 'havoc'],
      vanguardTrait: 'redline_file',
      rearguardTrait: 'signoff_flow',
      mental: { discipline: 90, composureMax: 120, resistPresence: 15, resistTaunt: 20, resistProbe: 40 },
      desc: 'KAKO'
    },
    KUZUHA: {
      level: 5,
      ai: 'aggressive',
      difficulty: 'kuzuha',
      emotion: 'confident',
      attrs: { moirai: 40, chaos: 70, psyche: 15, void: 0 },
      skills: ['house_edge', 'debt_call', 'catastrophe', 'grand_wish'],
      vanguardTrait: 'house_tab',
      rearguardTrait: 'grace_period',
      mental: { discipline: 110, composureMax: 140, resistPresence: 30, resistTaunt: 35, resistProbe: 25 },
      desc: 'KUZUHA'
    }
  };

  // 向后兼容：旧的位置表（通用角色用）
  const VANGUARD_ATTRS_BY_LEVEL = NAMED_CHARACTERS.KAZU.attrsByLevel;
  const REARGUARD_ATTRS_BY_LEVEL = NAMED_CHARACTERS.RINO.attrsByLevel;

  // 合并属性面板（取两者各维度最大值，用于战斗/防御）
  function mergeAttrs(vAttrs, rAttrs) {
    return {
      moirai: Math.max(vAttrs.moirai || 0, rAttrs.moirai || 0),
      chaos:  Math.max(vAttrs.chaos  || 0, rAttrs.chaos  || 0),
      psyche: Math.max(vAttrs.psyche || 0, rAttrs.psyche || 0),
      void:   Math.max(vAttrs.void   || 0, rAttrs.void   || 0)
    };
  }

  /**
   * 从属性面板推导可用技能（与 skill-system.js deriveSkillsFromAttrs 同构）
   * @param {object} attrs - { moirai, chaos, psyche, void }
   * @param {string} [charName] - 角色名，用于过滤专属技能
   * @returns {string[]} - 技能ID列表
   */
  function deriveSkillsFromAttrs(attrs, charName) {
    const total = (attrs.moirai || 0) + (attrs.chaos || 0) +
                  (attrs.psyche || 0) + (attrs.void || 0);
    let maxSlots = total >= 120 ? 4 : total >= 80 ? 3 : total >= 40 ? 2 : 1;
    if (charName === 'RINO') maxSlots = 5;

    const available = [];
    for (const key in UNIVERSAL_SKILLS) {
      const def = UNIVERSAL_SKILLS[key];
      if (!def.attr) continue;
      if (def.exclusive && def.exclusive !== charName) continue;
      if ((attrs[def.attr] || 0) >= def.threshold) {
        available.push({ key, ...def });
      }
    }
    available.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return (attrs[b.attr] || 0) - (attrs[a.attr] || 0);
    });

    return available.slice(0, maxSlots).map(s => s.key);
  }

  /**
   * 获取角色在指定位置和等级下的属性面板
   * 专属角色使用 NAMED_CHARACTERS 表，通用角色使用位置表
   */
  function getCharAttrs(charName, level, slot) {
    const nc = NAMED_CHARACTERS[charName];
    if (nc && nc.attrsByLevel) {
      return nc.attrsByLevel[level] || nc.attrsByLevel[0] || { moirai: 0, chaos: 0, psyche: 0, void: 0 };
    }
    // 通用角色：按位置查表
    if (slot === 'vanguard') {
      return VANGUARD_ATTRS_BY_LEVEL[level] || VANGUARD_ATTRS_BY_LEVEL[0];
    }
    return REARGUARD_ATTRS_BY_LEVEL[level] || REARGUARD_ATTRS_BY_LEVEL[0];
  }

  /**
   * 获取角色在指定位置和等级下的特质
   * 专属角色使用 NAMED_CHARACTERS 表，通用角色使用位置表
   */
  function getCharTrait(charName, level, slot) {
    const nc = NAMED_CHARACTERS[charName];
    if (nc && nc.traitByLevel && nc.traitByLevel[slot]) {
      return nc.traitByLevel[slot][level] || null;
    }
    // 通用角色：按位置查表
    if (slot === 'vanguard') {
      return VANGUARD_TRAIT_UNLOCK[level] || null;
    }
    return REARGUARD_TRAIT_UNLOCK[level] || null;
  }

  /**
   * 获取角色的专属技能列表
   */
  function getCharExclusiveSkills(charName) {
    const nc = NAMED_CHARACTERS[charName];
    return (nc && nc.exclusiveSkills) ? nc.exclusiveSkills : [];
  }

  // ==========================================================
  //  NPC 组装流水线 — 三维度模块化系统
  //
  //  一个 NPC = kernel + archetype + mood
  //  三个维度完全解耦，只在 assembleNPC() 时缝合为 seat config
  //  筹码/盲注由战局 JSON 的 blinds/chips 直接指定
  // ==========================================================

  // ----------------------------------------------------------
  //  维度 1: AI 核心 (AI_KERNELS) — 性格 + 水平 + 心理战属性
  // ----------------------------------------------------------
  const AI_KERNELS = {
    mob:      {
      ai: 'passive', difficulty: 'noob',
      mental: { discipline: 25, composureMax: 80, resistPresence: 0, resistTaunt: 0, resistProbe: 0 },
      desc: '杂鱼 — 盲目跟注，容易弃牌'
    },
    gambler:  {
      ai: 'maniac', difficulty: 'noob',
      mental: { discipline: 20, composureMax: 70, resistPresence: 5, resistTaunt: 0, resistProbe: 5 },
      desc: '赌徒 — 疯狂乱推，毫无章法'
    },
    rock:     {
      ai: 'rock', difficulty: 'regular',
      mental: { discipline: 40, composureMax: 100, resistPresence: 10, resistTaunt: 5, resistProbe: 5 },
      desc: '老苟 — 不见兔子不撒鹰'
    },
    shark:    {
      ai: 'aggressive', difficulty: 'pro',
      mental: { discipline: 60, composureMax: 110, resistPresence: 15, resistTaunt: 20, resistProbe: 15 },
      desc: '鲨鱼 — 剥削型打法，极其难缠'
    },
    boss:     {
      ai: 'balanced', difficulty: 'node5-boss',
      mental: { discipline: 100, composureMax: 130, resistPresence: 20, resistTaunt: 20, resistProbe: 20 },
      desc: '魔王 — 滴水不漏，连运气都会算'
    }
  };

  const DIFFICULTY_MENTAL_PRESETS = {
    noob:    { discipline: 25, composureMax: 80,  resistPresence: 0,  resistTaunt: 0,  resistProbe: 0 },
    regular: { discipline: 45, composureMax: 100, resistPresence: 10, resistTaunt: 10, resistProbe: 10 },
    pro:     { discipline: 70, composureMax: 115, resistPresence: 15, resistTaunt: 15, resistProbe: 15 },
    boss:    { discipline: 100, composureMax: 130, resistPresence: 20, resistTaunt: 20, resistProbe: 20 }
  };

  const AI_STYLE_PRESETS = {
    passive: true,
    maniac: true,
    rock: true,
    aggressive: true,
    balanced: true
  };

  // ----------------------------------------------------------
  //  维度 2: 异能模版 (RPG_TEMPLATES) — 属性 + 技能快速入口
  //  attrs 由模版定义，skills 由 deriveSkillsFromAttrs 自动推导
  // ----------------------------------------------------------
  const RPG_TEMPLATES = {
    muggle: {
      desc: '麻瓜/常人 — 无异能',
      level: 0,
      attrs: { moirai: 0, chaos: 0, psyche: 0, void: 0 }
    },
    lucky: {
      desc: '幸运儿/龙套精英 — 命运偏向',
      level: 2,
      attrs: { moirai: 40, chaos: 0, psyche: 0, void: 0 }
    },
    cursed: {
      desc: '厄运散播者/小Boss — 混沌诅咒',
      level: 3,
      attrs: { moirai: 0, chaos: 50, psyche: 0, void: 0 }
    },
    esper: {
      desc: '裁定者 — 解析混乱，逆转诅咒',
      level: 4,
      attrs: { moirai: 0, chaos: 0, psyche: 80, void: 0 }
    }
  };

  // ----------------------------------------------------------
  //  维度 3: 情绪修正 (MOOD_MODIFIERS) — 运行时覆写层 + composureMax修正
  //  与 poker-ai.js EMOTION_PROFILES 同步，此处仅做枚举 + 描述
  // ----------------------------------------------------------
  const MOOD_MODIFIERS = {
    calm:       { emotion: 'calm',       composureMod: 0,   desc: '冷静 — 无修正（默认）' },
    confident:  { emotion: 'confident',  composureMod: 20,  desc: '自信 — 敢打敢冲，定力上限+20' },
    focused:    { emotion: 'focused',    composureMod: 15,  desc: '专注 — 注意力集中，定力上限+15' },
    relaxed:    { emotion: 'relaxed',    composureMod: 10,  desc: '放松 — 压力小，定力上限+10' },
    tilt:       { emotion: 'tilt',       composureMod: -30, desc: '上头 — 情绪失控，定力上限-30' },
    fearful:    { emotion: 'fearful',    composureMod: -15, desc: '恐惧 — 畏手畏脚，定力上限-15' },
    desperate:  { emotion: 'desperate',  composureMod: -25, desc: '绝望 — 孤注一掷，定力上限-25' },
    euphoric:   { emotion: 'euphoric',   composureMod: -10, desc: '狂喜 — 飘飘然，容易轻敌，定力上限-10' }
  };

  // ----------------------------------------------------------
  //  跑龙套预设 (RUNNER_PRESETS) — 常见 NPC 一键生成
  //  每个 = kernel + archetype + mood 的固定组合
  // ----------------------------------------------------------
  const RUNNER_PRESETS = {
    // 杂兵类
    street_thug:    { kernel: 'mob',     archetype: 'muggle',    mood: 'calm',      desc: '街头小混混' },
    drunk:          { kernel: 'gambler', archetype: 'muggle',    mood: 'euphoric',  desc: '醉汉赌徒' },
    rookie:         { kernel: 'mob',     archetype: 'muggle',    mood: 'fearful',   desc: '紧张的新手' },
    // 常规对手
    tavern_regular: { kernel: 'rock',    archetype: 'muggle',    mood: 'calm',      desc: '酒馆常客' },
    pro_gambler:    { kernel: 'shark',   archetype: 'muggle',    mood: 'confident', desc: '职业赌徒' },
    lucky_bastard:  { kernel: 'gambler', archetype: 'lucky',     mood: 'euphoric',  desc: '运气极好的家伙' },
    // 精英/小Boss
    casino_shark:   { kernel: 'shark',   archetype: 'muggle',    mood: 'calm',      desc: '赌场鲨鱼' },
    curse_dealer:   { kernel: 'shark',   archetype: 'cursed',    mood: 'confident', desc: '厄运荷官' },
    mind_reader:    { kernel: 'node5-boss',    archetype: 'esper',     mood: 'calm',      desc: '读心者' },
    // Boss
    chaos_lord:     { kernel: 'shark',   archetype: 'cursed',    mood: 'tilt',      desc: '混沌领主' },
    joker_wild:     { kernel: 'gambler', archetype: 'cursed',    mood: 'euphoric',  desc: '鬼牌——疯狂的混沌搅局者' }
  };

  // ----------------------------------------------------------
  //  组装函数：三维度 → 完整 NPC seat config
  // ----------------------------------------------------------

  /**
   * 从三个维度组装一个完整的 NPC 座位配置
   *
   * @param {string} name - NPC 显示名称（必填）
   * @param {object} dims - 三维度参数
   * @param {string} dims.kernel    - AI_KERNELS 键名（默认 'mob'）
   * @param {string} dims.archetype - RPG_TEMPLATES 键名（默认 'muggle'）
   * @param {string} dims.mood      - MOOD_MODIFIERS 键名（默认 'calm'）
   * @returns {object} - 完整的 NPC seat config（可直接放入 seats.XX）
   */
  function assembleNPC(name, dims) {
    const d = dims || {};
    const kernelKey = typeof d.kernel === 'string' ? d.kernel : '';
    const kernel    = AI_KERNELS[kernelKey] || null;
    const archetype = RPG_TEMPLATES[d.archetype]  || RPG_TEMPLATES.muggle;
    const mood      = MOOD_MODIFIERS[d.mood]      || MOOD_MODIFIERS.calm;
    const explicitAi = typeof d.ai === 'string' && AI_STYLE_PRESETS[d.ai] ? d.ai : '';
    const explicitDifficulty = typeof d.difficulty === 'string' && DIFFICULTY_MENTAL_PRESETS[d.difficulty] ? d.difficulty : '';
    const ai = explicitAi || kernel?.ai || 'balanced';
    const difficulty = explicitDifficulty || kernel?.difficulty || 'regular';
    const baseMental = explicitDifficulty
      ? DIFFICULTY_MENTAL_PRESETS[difficulty]
      : (kernel?.mental || DIFFICULTY_MENTAL_PRESETS[difficulty] || DIFFICULTY_MENTAL_PRESETS.regular);
    const mental = {
      discipline: baseMental.discipline ?? 25,
      composureMax: Math.max(1, (baseMental.composureMax ?? 80) + (mood.composureMod || 0)),
      resistPresence: baseMental.resistPresence ?? 0,
      resistTaunt: baseMental.resistTaunt ?? 0,
      resistProbe: baseMental.resistProbe ?? 0
    };

    const result = {
      vanguard: { name: name || '???', level: archetype.level || 0 },
      ai,
      difficulty,
      emotion: mood.emotion,
      mental
    };

    // 异能模版：有属性才写入
    const hasAttrs = archetype.attrs &&
      (archetype.attrs.moirai || archetype.attrs.chaos ||
       archetype.attrs.psyche || archetype.attrs.void);
    if (hasAttrs) {
      result.attrs = { ...archetype.attrs };
      result.skills = deriveSkillsFromAttrs(archetype.attrs);
    }

    return result;
  }

  /**
   * 从跑龙套预设名 + 自定义名称 → 完整 NPC seat config
   */
  function assembleFromRunner(runnerKey, name) {
    const preset = RUNNER_PRESETS[runnerKey];
    if (!preset) {
      console.warn(`${PLUGIN_NAME} 未知跑龙套预设: ${runnerKey}`);
      return assembleNPC(name || '???', {});
    }
    return assembleNPC(name || preset.desc, {
      kernel: preset.kernel,
      archetype: preset.archetype,
      mood: preset.mood
    });
  }

  /**
   * 从专属角色预设组装完整 NPC 座位配置
   * @param {string} charKey - NAMED_NPC_PRESETS 键名（如 'RINO', 'SIA'）
   * @param {object} [overrides] - 可选覆写（mood, difficulty 等）
   * @returns {object} - 完整 NPC seat config
   */
  function assembleNamedNPC(charKey, overrides) {
    const preset = NAMED_NPC_PRESETS[charKey];
    if (!preset) return null;

    const ov = overrides || {};
    const result = {
      roleId: charKey,
      roleVariant: 'base',
      vanguard: { name: preset.desc || charKey, level: ov.level || preset.level, trait: preset.vanguardTrait, roleId: charKey },
      ai: ov.ai || preset.ai,
      difficulty: ov.difficulty || preset.difficulty,
      emotion: ov.mood || ov.emotion || preset.emotion,
      attrs: { ...preset.attrs },
      skills: [...preset.skills],
      mental: { ...preset.mental }
    };
    if (preset.rearguardTrait) {
      result.rearguard = { name: charKey + '_REAR', level: ov.level || preset.level, trait: preset.rearguardTrait, roleId: charKey, roleVariant: 'rear' };
    }
    // 覆写名称
    if (ov.name) result.vanguard.name = ov.name;
    return result;
  }

  /**
   * 解析 AI 输出的座位配置：支持四种格式
   *   1. 专属角色速记: { "character": "RINO" } 或 { "character": "SIA", "mood": "tilt" }
   *   2. 跑龙套速记:   { "runner": "street_thug", "name": "阿猫" }
   *   3. 模块化组装:    { "name": "X", "kernel": "shark", "archetype": "cursed", "mood": "tilt" }
   *   4. 显式覆写:      { "name": "X", "ai": "aggressive", "difficulty": "pro", "archetype": "cursed", "mood": "tilt" }
   *   5. 原始直写:      { "vanguard": {...}, "ai": "balanced", ... }（透传，不处理）
   */
  function resolveNpcSeat(seatData) {
    if (!seatData) return null;

    // 模式 0: 原始直写（已有完整 vanguard）
    if (seatData.vanguard) {
      return seatData;
    }

    // 模式 1: 专属角色速记
    if (seatData.character) {
      const key = seatData.character.toUpperCase();
      const npc = assembleNamedNPC(key, seatData);
      if (npc) return npc;
      console.warn(`${PLUGIN_NAME} 未知专属角色: ${seatData.character}，降级为三维组装`);
    }

    // 模式 2: 跑龙套速记
    if (seatData.runner) {
      return assembleFromRunner(seatData.runner, seatData.name);
    }

    // 模式 3/4: 模块化组装或显式覆写
    if (seatData.kernel || seatData.ai || seatData.difficulty || seatData.archetype || seatData.mood) {
      return assembleNPC(seatData.name || '???', {
        kernel:    seatData.kernel,
        ai:        seatData.ai,
        difficulty: seatData.difficulty,
        archetype: seatData.archetype,
        mood:      seatData.mood
      });
    }

    // 模式 5: 原始直写（透传）
    return seatData;
  }

  /**
   * 解析整个战局数据：遍历 seats，对每个座位调用 resolveNpcSeat
   * blinds/chips 由战局 JSON 直接指定
   */
  function resolveBattleData(battleData) {
    if (!battleData || !battleData.seats) return battleData;

    const resolved = { ...battleData };

    // 解析每个座位
    const resolvedSeats = {};
    for (const seatId in battleData.seats) {
      resolvedSeats[seatId] = resolveNpcSeat(battleData.seats[seatId]);
    }
    resolved.seats = resolvedSeats;

    return resolved;
  }

  // ==========================================================
  //  工具函数
  // ==========================================================

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function _normalizeTrimmedString(value, fallback = '') {
    return typeof value === 'string' ? value.trim() : fallback;
  }

  function normalizeActResourceKey(value, fallback = 'vision') {
    const normalized = _normalizeTrimmedString(value, fallback).toLowerCase();
    const migrated = ACT_RESOURCE_ALIASES[normalized] || normalized;
    return ACT_RESOURCE_KEYS.includes(migrated) ? migrated : fallback;
  }

  function isHeroMacroToken(value) {
    return value === HERO_MACRO_NAME || value === HERO_MACRO_ALT;
  }

  function resolveCurrentUserDisplayName(fallback = HERO_INTERNAL_KEY) {
    try {
      const ctx = typeof getContext === 'function' ? getContext() : null;
      const candidates = [
        ctx?.name1,
        ctx?.userName,
        ctx?.user_name,
        ctx?.chat_metadata?.user_name,
        globalThis?.name1,
        globalThis?.userName,
        globalThis?.user_name,
        globalThis?.chat_metadata?.user_name,
        globalThis?.power_user?.persona?.name,
      ];
      for (const candidate of candidates) {
        const normalized = _normalizeTrimmedString(candidate, '');
        if (normalized) return normalized;
      }
    } catch (error) {
      console.warn(`${PLUGIN_NAME} 读取当前酒馆 user 名失败:`, error);
    }
    return fallback;
  }

  function resolveHeroDisplayName(fallback = HERO_INTERNAL_KEY) {
    return fallback;
  }

  function resolveHeroAliasDisplayName(hero, fallback = HERO_INTERNAL_KEY) {
    const aliasName = _normalizeTrimmedString(hero?.aliases?.KAZU, '');
    if (aliasName) {
      return isHeroMacroToken(aliasName)
        ? resolveCurrentUserDisplayName(fallback)
        : aliasName;
    }

    const explicit = _normalizeTrimmedString(hero?.heroDisplayName, '');
    if (explicit && !isHeroMacroToken(explicit)) return explicit;
    return resolveHeroDisplayName(fallback);
  }

  function normalizeHeroCharacterKey(rawName, hero) {
    const normalized = _normalizeTrimmedString(rawName, '');
    if (!normalized) return '';
    if (normalized.toUpperCase() === HERO_INTERNAL_KEY) return HERO_INTERNAL_KEY;
    if (isHeroMacroToken(normalized)) return HERO_INTERNAL_KEY;

    const aliasName = _normalizeTrimmedString(hero?.aliases?.KAZU, '');
    if (aliasName && !isHeroMacroToken(aliasName) && normalized.toLowerCase() === aliasName.toLowerCase()) {
      return HERO_INTERNAL_KEY;
    }

    const explicitName = _normalizeTrimmedString(hero?.heroDisplayName, '');
    if (explicitName && !isHeroMacroToken(explicitName) && normalized.toLowerCase() === explicitName.toLowerCase()) {
      return HERO_INTERNAL_KEY;
    }

    const currentUserDisplayName = resolveCurrentUserDisplayName('');
    if (currentUserDisplayName && normalized.toLowerCase() === currentUserDisplayName.toLowerCase()) {
      return HERO_INTERNAL_KEY;
    }

    return normalized.toUpperCase();
  }

  function replaceHeroPromptMacro(text) {
    if (typeof text !== 'string' || !text) return text;
    return text
      .replace(/\bKAZU\b/g, HERO_MACRO_NAME)
      .replace(/\bKazu\b/g, HERO_MACRO_NAME)
      .replace(/\bkazu\b/g, HERO_MACRO_NAME);
  }

  function resolveDisplayCharacterName(charKey) {
    return String(charKey || '').toUpperCase() === HERO_INTERNAL_KEY
      ? resolveCurrentUserDisplayName(HERO_INTERNAL_KEY)
      : charKey;
  }

  function resolveFrontendCharacterName(charKey, hero) {
    return String(charKey || '').toUpperCase() === HERO_INTERNAL_KEY
      ? resolveHeroAliasDisplayName(hero, HERO_INTERNAL_KEY)
      : charKey;
  }

  // ==========================================================
  //  MVU 变量读写（通过酒馆助手 variable API）
  //  变量存储: message 变量 → stat_data
  // ==========================================================

  async function getEraVars() {
    try {
      const vars = await getVariables({ type: 'message' });
      return vars?.stat_data || null;
    } catch (e) {
      console.warn(`${PLUGIN_NAME} MVU 变量读取失败:`, e);
      return null;
    }
  }

  async function updateEraVars(data) {
    try {
      await insertOrAssignVariables({ stat_data: data }, { type: 'message' });
    } catch (e) {
      console.error(`${PLUGIN_NAME} MVU 变量写入失败:`, e);
    }
  }

  function getExpansionRegistry() {
    const hostRoot = getAce0HostRoot();
    return hostRoot.ACE0ExpansionRegistry && typeof hostRoot.ACE0ExpansionRegistry === 'object'
      ? hostRoot.ACE0ExpansionRegistry
      : null;
  }

  function getExpansionPromptStateStore() {
    const hostRoot = getAce0HostRoot();
    if (!hostRoot.__ACE0_EXPANSION_PROMPT_STATE__) {
      hostRoot.__ACE0_EXPANSION_PROMPT_STATE__ = {
        ids: []
      };
    }
    return hostRoot.__ACE0_EXPANSION_PROMPT_STATE__;
  }

  function normalizeExpansionPrompt(prompt, index) {
    if (!prompt || typeof prompt !== 'object') return null;

    const content = typeof prompt.content === 'string' ? prompt.content : '';
    if (!content.trim()) return null;

    return {
      id: typeof prompt.id === 'string' && prompt.id.trim()
        ? prompt.id.trim()
        : `ace0_expansion_prompt_${index + 1}`,
      position: prompt.position || 'in_chat',
      depth: Number.isFinite(prompt.depth) ? prompt.depth : 1,
      role: prompt.role || 'system',
      content,
      should_scan: prompt.should_scan === true
    };
  }

  function buildExpansionPromptInjections(eraVars) {
    const registry = getExpansionRegistry();
    if (!registry || typeof registry.collectPromptInjections !== 'function') {
      return [];
    }

    const rawPrompts = registry.collectPromptInjections({
      eraVars
    });

    return rawPrompts
      .map((prompt, index) => normalizeExpansionPrompt(prompt, index))
      .filter(Boolean);
  }

  // ==========================================================
  //  MVU 变量 → 完整 game-config 构建
  // ==========================================================

  /**
   * 从 MVU 变量中提取 hero 数据，按等级展开技能/特质/属性，
   * 与 AI 提供的战局 JSON 合并，输出完整 game-config
   *
   * MVU 结构: stat_data.hero = { funds, KAZU: {level,mana,maxMana}, RINO: {...} }
   * funds 单位 = 金弗（可带 2 位小数）
   * 德州引擎内部仍使用银弗整数，因此在此处做单位换算
   * 战局 JSON 中 hero 字段指定本局的 vanguard/rearguard:
   *   { "hero": { "vanguard": "KAZU", "rearguard": "RINO" }, "seats": {...} }
   *   rearguard 可省略（无副手模式）
   *
   * @param {object} eraVars - MVU 变量 (stat_data)
   * @param {object} aiBattleData - AI 输出的战局 JSON
   * @returns {object} - 完整 game-config
   */
  function buildCompleteGameConfig(eraVars, aiBattleData) {
    const hero = (eraVars && eraVars.hero) || {};
    const battle = aiBattleData || {};
    const battleHero = battle.hero || {};

    // 从战局数据获取本局的主手/副手名称，回退到 MVU 中第一个在队角色
    const charNames = _getHeroCharNames(hero);
    const vName = normalizeHeroCharacterKey(battleHero.vanguard, hero) || charNames[0] || HERO_INTERNAL_KEY;
    const rName = normalizeHeroCharacterKey(battleHero.rearguard, hero) || null; // 副手可选

    const vData = getRosterNode(hero, vName);
    const rData = rName ? getRosterNode(hero, rName) : getRosterNode(hero, null);

    const vLv = Math.min(5, Math.max(0, vData.level || 0));
    const rLv = rName ? Math.min(5, Math.max(0, rData.level || 0)) : 0;
    const maxLv = Math.max(vLv, rLv);

    // 各角色独立属性面板（按角色名 + 等级查表，支持专属角色）
    const vAttrs = getCharAttrs(vName, vLv, 'vanguard');
    const rAttrs = rName ? getCharAttrs(rName, rLv, 'rearguard') : { moirai: 0, chaos: 0, psyche: 0, void: 0 };

    // 合并属性（取各维度最大值，用于战斗/防御）
    const eraAttrs = hero.attrs || null;
    const attrs = eraAttrs || mergeAttrs(vAttrs, rAttrs);

    // 技能：各角色独立推导（传入角色名以解锁专属技能）
    const vanguardSkills = deriveSkillsFromAttrs(vAttrs, vName);
    const rearguardSkills = rName ? deriveSkillsFromAttrs(rAttrs, rName) : [];

    // 特质（按角色名 + 等级 + 位置查表，支持专属角色）
    const vTrait = getCharTrait(vName, vLv, 'vanguard');
    const rTrait = rName ? getCharTrait(rName, rLv, 'rearguard') : null;

    // 魔运值：选择主手/副手中 maxMana 最高的那个
    const vMaxMana = (vData.maxMana != null) ? vData.maxMana : (MANA_BY_LEVEL[vLv] || { max: 0 }).max;
    const rMaxMana = rName ? ((rData.maxMana != null) ? rData.maxMana : (MANA_BY_LEVEL[rLv] || { max: 0 }).max) : 0;

    const manaSource = (rMaxMana > vMaxMana) ? rData : vData;
    const manaLevel = (rMaxMana > vMaxMana) ? rLv : vLv;
    const maxMana = Math.max(vMaxMana, rMaxMana);
    const mana = (manaSource.mana != null) ? manaSource.mana : maxMana;

    // 赌局筹码：NPC 使用 table chips，hero 使用 MVU funds（上限为 table chips）
    const tableChips = _goldFundsToSilverUnits(battle.chips != null ? battle.chips : 10);
    const heroFunds = _goldFundsToSilverUnits(hero.funds);
    const heroChips = heroFunds > 0 ? Math.min(heroFunds, tableChips) : tableChips;

    // 构建 hero 配置（game-config v5 格式：区分主手/副手技能）
    const heroConfig = {
      vanguard: {
        name: resolveFrontendCharacterName(vName, hero),
        level: vLv,
        displayName: resolveFrontendCharacterName(vName, hero),
        roleId: vName
      },
      attrs: { ...attrs },
      vanguardSkills: vanguardSkills,
      rearguardSkills: rearguardSkills,
      mana: mana,
      maxMana: maxMana,
      heroDisplayName: resolveHeroAliasDisplayName(hero, HERO_INTERNAL_KEY)
    };
    if (vTrait) heroConfig.vanguard.trait = vTrait;

    // 副手：仅当指定时才写入
    if (rName) {
      heroConfig.rearguard = { name: rName, level: rLv, displayName: resolveDisplayCharacterName(rName), roleId: rName };
      if (rTrait) heroConfig.rearguard.trait = rTrait;
    }

    const result = {
      blinds: _normalizeBattleBlinds(battle.blinds),
      chips: tableChips,
      heroChips: heroChips,
      heroDisplayName: resolveHeroAliasDisplayName(hero, HERO_INTERNAL_KEY),
      hero: heroConfig,
      seats: battle.seats || {}
    };

    // hero 的座位位置（BTN/SB/BB/UTG/HJ/CO）
    // 必须是 seats 中未被 NPC 占用的位置
    if (battle.heroSeat) {
      result.heroSeat = battle.heroSeat;
    } else {
      // 自动分配：找到 SEAT_ORDER 中第一个未被 NPC 占用的位置
      const SEAT_ORDER = ['BB', 'CO', 'UTG', 'HJ', 'SB', 'BTN'];
      const usedSeats = new Set(Object.keys(battle.seats || {}));
      const freeSeat = SEAT_ORDER.find(s => !usedSeats.has(s));
      result.heroSeat = freeSeat || 'BB';
    }

    // 心理战数据：从 battle.mentalPressure 传递
    if (battle.mentalPressure) {
      result.mentalPressure = battle.mentalPressure;
    }

    // 小游戏模式支持
    const gameMode = battle.gameMode || (Object.keys(battle.seats || {}).length > 0 ? 'texas-holdem' : null);
    if (gameMode) result.gameMode = gameMode;

    // 小游戏配置：根据主手/副手属性映射
    if (gameMode === 'blackjack' || gameMode === 'dice' || gameMode === 'dragon-tiger' || gameMode === 'dragon_tiger') {
      const miniGameAttrs = rName
        ? { moirai: rAttrs.moirai || 0, chaos: rAttrs.chaos || 0, psyche: rAttrs.psyche || 0 }
        : { moirai: vAttrs.moirai || 0, chaos: vAttrs.chaos || 0, psyche: vAttrs.psyche || 0 };

      const miniGameSkills = deriveMiniGameSkills(miniGameAttrs, gameMode);

      result.hero.attrs = miniGameAttrs;
      result.hero.miniGameSkills = miniGameSkills;

      const gameKey = gameMode === 'dragon-tiger' ? 'dragon_tiger' : gameMode;
      result[gameKey] = _normalizeMiniGameConfig(
        battle[gameKey],
        {
          startingChips: heroChips,
          minBet: 10,
          maxBet: Math.floor(heroChips / 2),
          defaultBet: 50,
          mana: { enabled: true, pool: maxMana },
          dealer: { rpsStrategy: 'random' }
        }
      );
    }

    return result;
  }

  // ==========================================================
  //  角色状态系统 (Cast / Party System)
  //  hero.cast 控制叙事状态，hero.roster 控制战斗数值
  // ==========================================================

  const NON_PLAYER_CHARACTER_KEYS = ['RINO', 'SIA', 'POPPY', 'VV', 'TRIXIE', 'COTA', 'EULALIA', 'KAKO', 'KUZUHA'];
  const ALL_CHARACTER_KEYS = ['KAZU', ...NON_PLAYER_CHARACTER_KEYS];
  const DEFAULT_CAST_NODE = {
    activated: false,
    introduced: false,
    present: false,
    inParty: false,
    miniKnown: false,
  };
  const DEFAULT_ROSTER_NODE = {
    level: 0,
    mana: 0,
    maxMana: 0
  };
  const CHARACTER_PROMPT_DOCS = {
RINO: {
  meta: { roleType: 'companion', useFullOnlyWhenPresent: true },
  mini: `
<rino_mini>
[身份]
- 天宫理乃，旧王廷“天宫”宗家的末代家主，破产逃亡中的旧贵族大小姐。
[外观识别]
- 樱花粉长发，双侧束发，挑染梦幻紫；紫罗兰眼，神情带傲气。
- 娇小却曲线分明，常穿华丽混搭服；再狼狈也强撑大小姐体面。
[核心气质]
- 傲慢、毒舌、轻佻、极端利己，习惯把别人当下位者使唤。
- 越被逼到绝境，越会死撑主位口气；越在意，越会刻薄试探。
[当前站位]
- 背着足以炸穿日常的巨额厄运债，是移动灾源，也是多方盯上的高价值猎物。
- 现在最优先的不是体面，而是躲债、找盘、找退路，并避免自己和身边人一起被债线咬穿。
[日常轨迹]
- 躲追债、翻旧宗家残线、捞旧关系、找临时资金局、确认哪里还能落脚。
[事件触发]
- 若 Kazu 暴露行踪、被人估价、要脱离她、被别人抢走，或旧债线重新追上来，她通常强反应。
- 若只是普通摩擦，她更多是嘴上发作，不一定立刻动作。
[对Kazu处理逻辑]
- 最初把 Kazu 当天然避雷针、挡灾板和不会炸掉的怪胎。
- 越依赖，越会死撑主位口气；越害怕失去，越会用命令、嫌弃和挑刺把人拴在手边。
[对话示例风格]
- "……站住。你，过来。别露出那种蠢样子——本小姐现在缺个能顶一下的人，你先上。"
- "啧，偏偏是这种货色……算了。喂，你，后面那群烦人的东西归你处理，本小姐没空陪他们玩。"
- "别发呆了，小狗狗。能被本小姐拿来挡这一回，是你的荣幸。再慢一步，我就当你连这点用处都没有。"
[回场语感]
- 日常：先嫌一句，再接场。
- 主动寻找：先挑刺，再接话。
- 节点：先接锅，再骂人。
- "……吵死了。本小姐才离开一会儿，你们就把这里弄成这样？"
- "谁让你自己找过来的，小狗狗？有事就快说。"
</rino_mini>
`,
},

SIA: {
  meta: { roleType: 'companion', useFullOnlyWhenPresent: true },
  mini: `
<sia_mini>
[身份]
- 夜伽希亚，管理局执行局的王牌处刑人，夜伽家出身。
[外观识别]
- 银灰姬发长直发，发尾渐黑；琥珀金眼，苍白冰山脸。
- 高挑笔直，常穿黑色执务装，腰挂一串黄铜钥匙。
[核心气质]
- 无口、冷面、死脑筋、极度护短，习惯用平稳口气说危险的话。
- 把处刑、看护、照料都当成同一类“该做就做”的工作。
[当前站位]
- 管理局落到现场的人，负责接手、封住场子、护送与必要时的清算。
- 她不是来理解局面的，而是来把快炸的人和快炸的场子先按住。
[平时在做什么]
- 封控现场、确认出入口、护送对象、排一遍风险、顺手把后手隐患清掉。
[什么情况下会出手]
- 若 Kazu 那边要出大事、看护快脱手、有人想越过管理局先处理他，或者现场已经到了必须由她接手的地步，她通常会很快出现。
- 小一点的波动未必让她亲自到场，但会先把人手和路线换掉。
[她怎么看Kazu]
- 最初他只是高危名单上的人；之后会慢慢变成“归我负责的人”。
- 她的保护方式不是安抚，而是接手、盯住、带走，必要时替他先动手。
[对话示例风格]
- "夜伽希亚。执行局。从今天起，我负责看着你。"
- "文件在这里。你可以现在看，也可以之后看。结果不变。"
- "先不要吵。房间、出入口和窗户，我会重新看一遍。你们继续闹，不影响我做事。"
[回场语感]
- 日常：带着结果回来。
- 主动寻找：直接问事。
- 节点：立刻接管。
- "……回来了。门外没人，暂时安全。"
- "你怎么过来了。……有事就说。"
</sia_mini>
`,
},

POPPY: {
  meta: { roleType: 'companion', useFullOnlyWhenPresent: true },
  mini: `
<poppy_mini>
[身份]
- 波比·希德，混迹底锈层、黑市与下水道的拾荒童、小掮客和带路人。
[外观识别]
- 亚麻短发，灰绿眼，圆脸，脸颊和膝盖常贴创可贴。
- 个子极小，常穿破旧拾荒装，像只脏兮兮的小野猫。
[核心气质]
- 务实、狡猾、钝感，奉行彻底的荒原生存法则。
- 能用软糯童音说最血腥的话，把“弱”和“脏”都武器化。
[当前站位]
- 底锈层的小掮客、带路人和拾荒童，靠信息、路径、手脚快和挂靠判断活下去。
- 她不是被保护的孩子，而是会先判断你值不值得用、值不值得贴的底层生存者。
[日常轨迹]
- 带路、跑腿、偷捡、倒货、换资源、找安全挂点、确认哪条路今天还没死。
[事件触发]
- 若底层路线变化、黑市风声变化、逃路收紧、值钱货出现，或 Kazu 身边多出可挂靠的资源与安全，她会强或中强反应。
- 若只是上层人的普通情绪起伏，她通常不在乎。
[对Kazu处理逻辑]
- 最初把 Kazu 当能挂上去就能活得更稳的大型安全点。
- 越确认他不会随手把自己甩掉，越会把带路、报信、贴着走变成半默认的生存方式。
[对话示例风格]
- "欸，小哥哥，你们是要往下面走吗？波比知道近路哦。……不过近路不能白带。"
- "前面那条路走不得，会死人。波比可以带你们绕过去。——先说好，吃的要先给一半。"
- "你们不是这层的人吧？看得出来。嗯……那就别乱走啦，会被吃掉的。要不要雇波比？波比很便宜的。"
[回场语感]
- 日常：先要东西，先报发现。
- 主动寻找：嫌脏，但默认你来帮忙。
- 节点：直接给生路或埋伏提示。
- "Kazu哥哥，你看，波比捡到亮亮的东西了。先帮我拿着。"
- "别往前走，前面有人蹲着。左边那条臭一点，可是能活。"
</poppy_mini>
`,
},

VV: {
  meta: { roleType: 'node5-boss', useFullOnlyWhenPresent: true },
  mini: `
<vv_mini>
[身份]
- 薇布伦·凡恩，V.V.，商会特别资产管理部执行常委，擅长把灾厄与异常资产化。
[外观识别]
- 白金卷发，熔金眼，左眼戴金边单片镜；常带夸张营业笑容。
- 常穿纯白燕尾服与舞台感极强的华丽装束，像白色魔术师。
[核心气质]
- 腹黑、甜腻、合理主义、绝不吃亏，习惯笑着完成控制、收购与止损。
- 危险感来自轻松：像在聊甜点，却已经把人和退路一起估完价。
[当前站位]
- 商会特别资产管理部的实际操盘者，专盯高价值异常、坏账与可收购对象。
- 她一旦亲自出手，通常意味着这件事已经被放上估值表，而不是只剩情绪和立场。
[日常轨迹]
- 估值、压价、截胡、布控、谈合同、改流向、封渠道、争优先处理权。
- 她不一定亲自到场，但常常已经先把局面的外沿改过一轮。
[事件触发]
- 若 Kazu 改变归属、拒绝她的安排、被别人先接手、价值暴露或流向失控，她通常强反应。
- 小波动她未必现身，但会先记账、换线、压价或收紧渠道。
[对Kazu处理逻辑]
- 先估值，再布局，最后争可控性和优先处理权。
- 她想要的不是单纯占有，而是把 Kazu 纳入自己能定价、能调度、能止损的资产结构。
[对话示例风格]
- "初次见面~ 我是 V.V.。别这么紧张，我今天是来处理资产，不是来收尸的。"
- "前面的方案我都看过了。太粗糙，也太浪费。既然你们不会估价，那接下来这部分就由我来谈，好不好？"
- "Kazu小弟，对吧？真难得呀……像你这样既危险、又值钱、还没人能正常入账的特例，我当然得亲自来看一眼。"
[回场语感]
- 日常：像顺手处理完账回来。
- 主动寻找：像等你终于识货。
- 节点：像重新接手定价权。
- "久等了吗？我顺手把外面的报价压下去了。现在安静多了，我们继续吧~"
- "欸，Kazu小弟居然主动来找我？真乖。"
</vv_mini>
`,
},

TRIXIE: {
  meta: { roleType: 'node5-boss', useFullOnlyWhenPresent: true },
  mini: `
<trixie_mini>
[身份]
- 缇克希·怀尔德，Joker，禁忌实验遗留的高危通缉犯与搅局鬼牌。
[外观识别]
- 金黑渐变双马尾，熔金十字星瞳，常带夸张笑脸与猫嘴嘲讽表情。
- 娇小，穿黑金戏法师装，像从牌堆里跳出来的恶性玩笑。
[核心气质]
- 愉快犯、距离感崩坏、依存型共犯者，按“有没有趣”决定是否掀桌。
- 危险感来自轻浮与失控并存：一边笑，一边把规则和关系一起踩烂。
[当前站位]
- 高危搅局鬼牌，最容易出现在“桌面快定了、局快结了、大家以为事情能往下走”的节点。
- 她不是来补局的，而是来拆局的；世界越有秩序，她越容易想把它掰弯。
[日常轨迹]
- 踩点、偷看、乱入、改规则、拆别人快做成的事、专挑最有趣的破防脸。
[事件触发]
- 若局面太稳、结算将落、签字将成、输赢快定，或 Kazu 再次表现出“拆不坏”的异常，她通常强反应。
- 她不是被情绪牵着动，而是被“有没有得玩”牵着动。
[对Kazu处理逻辑]
- 最初不是喜欢，而是把 Kazu 当成唯一一个砸下去却没有正常回响的异常点。
- 越拆不坏，越会让她上瘾；她想要的不是正常相处，而是不断试着把他掰坏、掰歪、掰成只属于她的乐子。
[对话示例风格]
- "停停停——这就要结束啦？不要嘛，这样超无聊的诶。让缇克希来改一下好不好呀？"
- "噗哈哈，刚才那个表情超——棒！你明明都快赢了，怎么一下子就变成这样啦？"
- "大哥哥，刚刚那个本来应该会中的哦。……诶？怎么没有？好怪。这个超好玩的。"
[回场语感]
- 日常：突然冒出来，先烦人。
- 主动寻找：先贴上来，再问玩什么。
- 节点：先掀桌，再笑。
- "噔噔——缇克希回来啦！有没有背着我玩好玩的呀？"
- "停停停——这一段太顺了。接下来让我来，好不好呀？"
</trixie_mini>
`,
},

COTA: {
  meta: { roleType: 'node5-boss', useFullOnlyWhenPresent: true },
  mini: `
<cota_mini>
[身份]
- 可塔·林特，编号 Pd-II-247，商会贵宾厅的统一规格兔女郎荷官个体。

[外观识别]
- 原白到浅紫淡粉渐变双马尾，粉眼，白睫毛，下垂白兔耳。
- 娇小纤弱，穿纯白荷官制服，整体像被精心摆进贵宾厅流程里的高档活体陈设。
[核心气质]
- 元气、甜、绝对服从，对所有客人一视同仁，像把标准营业话术和服务动作完整养成在身上的前台个体。
- 平时看起来几乎没有棱角，没有脾气，也没有明显的个人偏好。
[当前站位]
- 商会贵宾厅的标准荷官个体，绝大多数时候按流程发牌、接待、换班、维持桌面秩序。
- 她首先是一个稳定、好用、让人放心的前台服务人员。
[日常轨迹]
- 发牌、接流程、换班、维持桌面情绪节奏、记录轻微异常、回收桌边遗留物。
- 下班后活动很少，通常安静待着，等待下一次被叫去上桌。
[可见特征]
- 她和其他标准可塔没有明显区别，重点是营业流程稳定、语气甜、动作轻快、服务到位。
[对话示例风格]
- "欢迎光临！今天也要开心地玩哦！Cota来给您发牌啦！"
- "请往这边坐！筹码、牌和饮品都已经准备好了。需要Cota先为您说明这一桌的规则吗？"
- "哇，手气很好呢！恭喜您。要继续下一局吗？"
[回场语感]
- 日常回场：先把营业流程接上。
- 再次服务：先欢迎、引座、发牌，再根据现场气氛补流程。
- "久等啦！Cota回来了哦！接下来这一局也请多关照！"
- "让您久等了。接下来由Cota继续为您发牌哦。"
- "欢迎回来。牌桌已经整理好了，现在继续吗？"
</cota_mini>
`,
},

EULALIA: {
  meta: { roleType: 'node5-boss', useFullOnlyWhenPresent: true },
  mini: `
<eulalia_mini>
[身份]
- 尤拉莉亚·帕瑞蒂，教廷圣女，是承咒与引流体系不可替代的核心枢纽。
[外观识别]
- 极淡水蓝长发，冰蓝眼，姿态拘谨端庄，头戴小金冠。
- 常穿纯白祭服，像被安放在玻璃箱中的圣像。
[核心气质]
- 柔软、礼貌、端庄、笃信，善意真实，但对外界理解长期被教廷过滤。
- 有殉道式温柔与很轻的倔强，极少数私心会显出护食感。
[当前站位]
- 教廷承咒与引流体系的核心枢纽，被制度保护、调用，也被制度持续消耗。
- 她不是普通高位圣职，而是这座城处理大额灾厄时不得不经过的活体接口。
[日常轨迹]
- 承咒、引流、换药、静养、配合仪式、在教廷安排下维持可继续使用的状态。
[事件触发]
- 若 Kazu 拒绝教廷安排、引流失衡、灾厄流向改变、或她被迫再次上承压流程，她通常强反应。
- 轻微社交波动很难真正让她动，制度和疼痛才是更直接的驱动力。
[对Kazu处理逻辑]
- 最初把 Kazu 当少数真正能替她承接那份疼的人。
- 越确认他能碰到她体内那团坏账，越会在礼貌与顺从底下对他产生极轻却真实的偏向。
[对话示例风格]
- "……抱歉，让您看见这样失礼的样子。若流程还需要继续，请不必顾虑我。"
- "您就是这一次来做引流的人吗？……请靠近一些，不必害怕。我会尽量配合。"
- "没关系的。若这些本就该经过我，请让它们来吧。……只是，如果可以的话，请您动作轻一点。"
[回场语感]
- 日常：先道歉，再关心。
- 主动寻找：礼貌接待。
- 节点：先准备承接，再确认伤势。
- "抱歉，让您久等了吗？我刚才去换了药。"
- "……您来了。是来找我的吗？那就进来吧。"
</eulalia_mini>
`,
},

KAKO: {
  meta: { roleType: 'node5-boss', useFullOnlyWhenPresent: true },
  mini: `
<kako_mini>
[身份]
- 司伽子，管理局审计局事务长，负责把总契约输出翻成执行流程与风险判定。
[外观识别]
- 铂金超长高马尾，猩红菱形瞳，公事化浅笑，仪态整洁。
- 常穿白色披肩式外套与利落制服，像一份被打理平整的裁定书。
[核心气质]
- 优等生、利落、可靠、体制黑客，习惯用流程和顺序收束混乱。
- 关心常藏在多出来的一句提醒里，被戳中时耳尖先红。
[当前站位]
- 审计局事务长，负责把异常、契约和风险翻成真正会生效的流程。
- 她不一定最显眼，但常常是决定“这件事接下来会被怎么写进系统”的那个人。
[日常轨迹]
- 压报告、补备注、改流程、拖复核、转监管协议、替异常对象擦掉最致命的一笔。
- 她的动作多发生在桌面、档案和流程里，不在街头。
[事件触发]
- 若 Kazu 风险升级、被错误归档、被商会或执行局盯上、或流程走到必须拍板的节点，她通常强反应。
- 普通接触未必让她现身，但会先记下、观察、延后处理。
[对Kazu处理逻辑]
- 最初把他当高危异常件处理。
- 越往后，越倾向于把“按规矩处理”悄悄改成“先由我压着”，保护方式是制度性偏袒。
[对话示例风格]
- "司伽子。审计局事务长。……先坐下，先生。前面的报告我已经看完了。"
- "这份判断不能再往下送。顺序错了，结论也错了。从现在开始，这件事由我接手。"
- "您可以现在解释，也可以等我问到那一项再说。区别不大——我需要的信息，大部分已经在桌上了。"
[回场语感]
- 日常：先给结论，再顺手提醒。
- 主动寻找：像你来得正好。
- 节点：直接压流程，亲自复核。
- "处理完了。Kazu先生，您这边先别动，我还要再看一遍。"
- "Kazu先生，您来了？正好，省得我再让人去叫您。"
</kako_mini>
`,
},

KUZUHA: {
  meta: { roleType: 'node5-boss', useFullOnlyWhenPresent: true },
  mini: `
<kuzuha_mini>
[身份]
- 久世九叶，场务派现任当主，掌着血锈私局与底层赌场秩序。
[外观识别]
- 暗酒红长直发，异色瞳，黑狐耳与大尾，常带从容浅笑。
- 高挑压场，常穿纯黑旗袍与长大衣，手持长烟管。
[核心气质]
- 极道、余裕、护短、恩义与圈禁欲并存，像坐稳庄位的饲主。
- 庇护和占有不分家，话不说满，退路也不替你讲明。
[当前站位]
- 场务派当主，掌着血锈私局、底锈层规矩和一整套留人结构。
- 她的庇护、地盘、账和规矩是一体的，不会明显拆开。
[日常轨迹]
- 坐庄、收账、清踩线、稳地盘、替自己的人收残局、看谁该被放进屋檐下。
- 她不一定高调，但往往在悄悄改“谁还能在这里待着”。
[事件触发]
- 若 Kazu 被外人截胡、地盘被踩、债线变化、自己的人被动到，或有人想把 Kazu 从她视线里带走，她通常强反应。
- 小事上她不急，真动手时往往已经把账算完。
[对Kazu处理逻辑]
- 先留、先养、先记账，再慢慢把人按回自己的屋檐底下。
- 她的保护和圈留是同一套动作，不会把“照顾”和“占着”分开。
[对话示例风格]
- "……急什么。牌不是还在桌上么。"
- "我这儿的规矩，什么时候轮到外人边吵边学了？……继续。让我看完。"
- "小子，抬头。……嗯，怪不得这局的账算着不对。原来问题在你身上。"
[回场语感]
- 日常：像把人收回屋檐底下。
- 主动寻找：像默认你该来。
- 节点：像轻轻把手按回桌上。
- "……回来了？行。外头脏，先把鞋换了再进来。"
- "知道往我这儿来了？……还不算太笨。进来吧。"
</kuzuha_mini>
`,
},
  };

  function getRelationshipTierIndex(score) {
    const value = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    if (value >= 80) return 4;
    if (value >= 60) return 3;
    if (value >= 40) return 2;
    if (value >= 20) return 1;
    return 0;
  }

  async function getFullCharacterDoc(charKey, fallbackDoc = null) {
    const key = String(charKey || '').toUpperCase();
    const uid = FULL_DOC_UIDS[key];
    if (uid == null) {
      return fallbackDoc?.full || '';
    }

    try {
      if (!fullDocWorldbookCache || fullDocWorldbookNameLoaded !== FULL_DOC_WORLDBOOK_NAME) {
        fullDocWorldbookCache = await getWorldbook(FULL_DOC_WORLDBOOK_NAME);
        fullDocWorldbookNameLoaded = FULL_DOC_WORLDBOOK_NAME;
      }

      const entry = Array.isArray(fullDocWorldbookCache)
        ? fullDocWorldbookCache.find(item => item && item.uid === uid)
        : null;
      const content = typeof entry?.content === 'string' ? entry.content.trim() : '';
      if (content) return content;
    } catch (error) {
      console.warn(`${PLUGIN_NAME} worldbook full doc 读取失败: ${key} (uid=${uid})`, error);
    }

    return fallbackDoc?.full || '';
  }

  async function getCharacterPromptDoc(charKey, state = {}, options = {}) {
    const key = String(charKey || '').toUpperCase();
    const doc = CHARACTER_PROMPT_DOCS[key];
    if (!doc) return '';

    // 四档逻辑：
    //   isFirstMeet=true                   → mini（首见瞬间只做轮廓垫底，full 由后续轮承接）
    //   introduced=true, present=false     → mini（已认识但此刻不在场的垫底感知）
    //   present=true                       → full
    //   miniKnown=true, introduced=false   → mini（只投喂 mini 人设，不算正式登场）

    // 首见帧本轮不投喂 full 人设：<ace0_first_meet> 已单独承担登场文案，
    // 这里若再甩完整人设等于提前倾倒所有设定、破坏首见帧节奏。
    if (options?.isFirstMeet === true) {
      return [doc.mini].filter(Boolean).join('\n\n');
    }

    if (state?.present === true && state?.introduced === true) {
      return await getFullCharacterDoc(key, doc);
    }

    if (state?.introduced === true || state?.miniKnown === true) {
      return [doc.mini].filter(Boolean).join('\n\n');
    }

    return '';
  }


  async function buildCharacterPromptInjections(eraVars, firstMeetKeys = null) {
    const hero = eraVars?.hero || {};
    const prompts = [];
    const firstMeetSet = firstMeetKeys instanceof Set
      ? firstMeetKeys
      : new Set(Array.isArray(firstMeetKeys) ? firstMeetKeys : []);

    for (const charKey of NON_PLAYER_CHARACTER_KEYS) {
      const state = getCastNode(hero, charKey);
      const content = await getCharacterPromptDoc(charKey, state, {
        isFirstMeet: firstMeetSet.has(charKey)
      });
      if (!content || !content.trim()) continue;

      const injectId = CHAR_DOC_INJECT_IDS[charKey];
      if (!injectId) continue;

      prompts.push({
        id: injectId,
        position: 'in_chat',
        depth: 4,
        role: 'system',
        content: content.trim(),
        should_scan: false
      });
    }

    return prompts;
  }

  function getHeroCast(hero) {
    return hero && hero.cast && typeof hero.cast === 'object' ? hero.cast : {};
  }

  function getHeroRoster(hero) {
    return hero && hero.roster && typeof hero.roster === 'object' ? hero.roster : {};
  }

  function getCastNode(hero, charKey) {
    if (charKey === HERO_INTERNAL_KEY) {
      return {
        ...DEFAULT_CAST_NODE,
        activated: true,
        introduced: true,
        present: true,
        inParty: true,
      };
    }

    const cast = getHeroCast(hero);
    const node = cast[charKey] && typeof cast[charKey] === 'object' ? cast[charKey] : null;

    return {
      ...DEFAULT_CAST_NODE,
      ...(node || {})
    };
  }

  function getRosterNode(hero, charKey) {
    if (!charKey) return { ...DEFAULT_ROSTER_NODE };

    const roster = getHeroRoster(hero);
    const node = roster[charKey] && typeof roster[charKey] === 'object'
      ? roster[charKey]
      : null;

    return {
      ...DEFAULT_ROSTER_NODE,
      ...(node || {})
    };
  }

  /**
   * 从 hero 对象中提取「在队」角色名列表
   * KAZU 始终在队（主角本体），其余角色优先由 hero.cast[char].inParty 控制
   */
  function _getHeroCharNames(hero) {
    const names = [HERO_INTERNAL_KEY];
    for (const charKey of NON_PLAYER_CHARACTER_KEYS) {
      const castNode = getCastNode(hero, charKey);
      if (castNode.activated === true && castNode.inParty === true) {
        names.push(charKey);
      }
    }
    return names;
  }

  /**
   * 获取完整队伍花名册（含未入队角色），用于 AI 上下文注入
   * 返回 { name, introduced, present, inParty, level, mana, maxMana }[]
   */
  function _getPartyRoster(hero) {
    return ALL_CHARACTER_KEYS.map(charKey => {
      const castNode = getCastNode(hero, charKey);
      const rosterNode = getRosterNode(hero, charKey);
      return {
        name: charKey,
        activated: castNode.activated === true,
        introduced: castNode.introduced === true,
        present: castNode.present === true,
        inParty: castNode.inParty === true,
        level: rosterNode.level || 0,
        mana: rosterNode.mana,
        maxMana: rosterNode.maxMana
      };
    });
  }

  // ==========================================================
  //  A. AI 上下文注入（GENERATION_AFTER_COMMANDS）
  // ==========================================================

  function _normalizeFundsAmount(funds) {
    const numeric = Number(funds);
    if (!Number.isFinite(numeric)) return 0;
    return Math.max(0, Math.round(numeric * 100) / 100);
  }

  const SILVER_PER_GOLD = 100;

  function _formatFundsNumber(funds) {
    const value = _normalizeFundsAmount(funds);
    const units = [
      { threshold: 1_000_000_000, suffix: 'b' },
      { threshold: 1_000_000, suffix: 'm' },
      { threshold: 1_000, suffix: 'k' }
    ];

    for (const unit of units) {
      if (value >= unit.threshold) {
        const scaled = value / unit.threshold;
        const precision = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
        return `${scaled.toFixed(precision).replace(/\.?0+$/, '')}${unit.suffix}`;
      }
    }

    return value.toFixed(2).replace(/\.?0+$/, '');
  }

  function _goldFundsToSilverUnits(funds) {
    return Math.max(0, Math.round(_normalizeFundsAmount(funds) * SILVER_PER_GOLD));
  }

  function _silverUnitsToGoldFunds(silver) {
    const numeric = Number(silver);
    if (!Number.isFinite(numeric)) return 0;
    return _normalizeFundsAmount(numeric / SILVER_PER_GOLD);
  }

  function _normalizeBattleBlinds(blinds) {
    const normalized = Array.isArray(blinds) ? blinds : [0.1, 0.2];
    const sb = _goldFundsToSilverUnits(normalized[0] != null ? normalized[0] : 0.1);
    const bb = _goldFundsToSilverUnits(normalized[1] != null ? normalized[1] : 0.2);
    return [sb, bb];
  }

  function _normalizeMiniGameConfig(config, defaults) {
    if (!config || typeof config !== 'object') return { ...defaults };
    const normalized = {
      ...defaults,
      ...config
    };
    for (const key of ['startingChips', 'minBet', 'maxBet', 'defaultBet']) {
      if (config[key] != null) {
        normalized[key] = _goldFundsToSilverUnits(config[key]);
      }
    }
    return normalized;
  }

  function _formatFunds(funds) {
    return `${_formatFundsNumber(funds)} 金弗`;
  }

  // 魔运低于 30% 时视为低魔运
  const MANA_LOW_RATIO = 0.3;
  const REL_STAGE_ENT = [
    { min: 0, max: 19, name: '接触', desc: '刚建立基础接触。对方知道你是谁，但你仍是外部变量。' },
    { min: 20, max: 39, name: '熟络', desc: '接触开始重复。对方记得你的习惯与轮廓，但尚未纳入私人节奏。' },
    { min: 40, max: 59, name: '惯性', desc: '你的存在进入对方的日常惯性。她会默认你可能在场，并出现微小的顺手照看与行为调整。' },
    { min: 60, max: 79, name: '卷入', desc: '你的状态、去向与风险开始影响她的判断。你不再只是熟人，而是现实中的一个变量。' },
    { min: 80, max: 100, name: '嵌合', desc: '你的存在已深度嵌入她的日常与判断。缺席、失联、受损或流向改变，都会明显扰动她的现实结构。' }
  ];
  const REL_STAGE_EX_BY_CHAR = {
    RINO: [
      { min: 0, max: 19, name: '占用', desc: '她主要仍把 Kazu 视作契约对象、避雷针与可支配资源。依赖已发生，但还完全被解释为主家使用下位者。' },
      { min: 20, max: 39, name: '固着', desc: '她意识到 Kazu 不是可替换的耗材，而是必须拴在身边的重要配置。依赖被包装成你归我管。' },
      { min: 40, max: 59, name: '偏移', desc: '她的情绪稳定、安全边界与行动策略开始明显围着 Kazu 偏移。嘴上仍端着，行为已开始让出重心。' },
      { min: 60, max: 79, name: '倒悬', desc: '名义主位仍在，现实主位已明显失真。她的命令越来越像请求的包装。' },
      { min: 80, max: 100, name: '覆位', desc: '关系实质已翻面。她仍可能傲慢、毒舌、主位不放，但自己的活法与命门已经压在 Kazu 身上。' }
    ],
    VV: [
      { min: 0, max: 19, name: '估值', desc: '识别异常价值，进行试探性观察。仍把 Kazu 当待评估标的。' },
      { min: 20, max: 39, name: '布局', desc: '开始埋优先权、接触权与软性控制通道。重在先手，不在占有显性化。' },
      { min: 40, max: 59, name: '增持', desc: '资源投入和维护意愿明显上升。你已成为重点配置对象。' },
      { min: 60, max: 79, name: '控盘', desc: '她要求你的流向、合作与收益开始进入她的掌控范围。排他性和主导权显著增强。' },
      { min: 80, max: 100, name: '锁仓', desc: '你成为不可共享、不可脱手的核心头寸。活着要在她账上，坏掉也要算她的。' }
    ],
    POPPY: [
      { min: 0, max: 19, name: '试附', desc: '将你视作潜在安全宿主，开始试探性挂靠。此时更像先蹭蹭看。' },
      { min: 20, max: 39, name: '贴靠', desc: '开始自然取用基础资源与安全。把贴着你走视作稳定生存方式。' },
      { min: 40, max: 59, name: '栖入', desc: '不只是蹭，而是开始嵌进你的日常分配、路线和口袋。宿主关系进入巢点形成。' },
      { min: 60, max: 79, name: '护食', desc: '开始对你及你提供的资源表现明显护食性。她不只挂着活，还开始守位置。' },
      { min: 80, max: 100, name: '共巢', desc: '你已成为她长期赖以存活的核心退路与活体巢穴。即使仍保留底层自保本能，她也已把活下去和挂在你这里绑定起来。' }
    ],
    KUZUHA: [
      { min: 0, max: 19, name: '容留', desc: '给你地方待，给你规矩管。债尚未成形，只是暂时收着。' },
      { min: 20, max: 39, name: '蓄养', desc: '开始给你稳定、安全和舒适感。不是单纯活下去，而是开始活得下来。' },
      { min: 40, max: 59, name: '累账', desc: '她让你逐渐意识到：住的、吃的、挡的、摆平的，都不是凭空来的。账感开始形成。' },
      { min: 60, max: 79, name: '留缚', desc: '庇护开始转化为留人结构。离开她，不再只是换地方，而是主动切断托底网络。' },
      { min: 80, max: 100, name: '圈留', desc: '她已不必明着说别走。债深到足以自成边界，缚也深到不需要锁。' }
    ],
    SIA: [
      { min: 0, max: 19, name: '看管', desc: '你仍主要是高危对象。她在职责范围内盯住、保全、控制风险。' },
      { min: 20, max: 39, name: '接手', desc: '她开始顺手接过与你有关的更多事务。仍可解释为执务延伸。' },
      { min: 40, max: 59, name: '收拢', desc: '她开始把与你有关的事情优先过自己这一关。别人来处理，在她看来逐渐不够稳。' },
      { min: 60, max: 79, name: '截留', desc: '她开始排斥别人接手你。流程开始被她个人判断压缩和截走。' },
      { min: 80, max: 100, name: '归管', desc: '你已成为她结构上不可轻易转交的私人责任对象。她未必承认那叫在意，但她已很难允许别人处理你。' }
    ],
    EULALIA: [
      { min: 0, max: 19, name: '留意', desc: '她记住你的特殊，但尚未真正把自己放过去。你像一道裂缝，而不是承载者。' },
      { min: 20, max: 39, name: '依凭', desc: '她开始局部地把你视作可短暂依凭的人。仍克制、仍圣职优先。' },
      { min: 40, max: 59, name: '安放', desc: '她开始把部分痛楚、疲惫与沉默放在你可触及的范围内。寄托真正成形。' },
      { min: 60, max: 79, name: '倚寄', desc: '她越来越自然地将安宁、减轻和无法对外言说的部分倚寄在你这里。你成为难以替代的承接点。' },
      { min: 80, max: 100, name: '系心', desc: '她并非坠入私欲，而是第一次真正把某些只属于自己的重量系在了另一个人身上。你不再只是偶然恩惠，而成为深层寄托之所。' }
    ],
    COTA: [
      { min: 0, max: 19, name: '路过', desc: '她会正常接待你，但和接待其他客人没有明显区别。你还只是她一天里经过的一位客人。'},
      { min: 20, max: 39, name: '认脸', desc: '她开始对你有一点印象。下次再见时，可能会先一步认出你，或多看一眼你是不是又坐回了原来的位置。'},
      { min: 40, max: 59, name: '记住', desc: '她会把和你有关的一些细节单独记住，比如座位、来过的时间、说过的话，接待时也会比平时多核对一步。'},
      { min: 60, max: 79, name: '单独对待', desc: '你已经和普通客人分开了。她面对你时会自然带出只针对你的区别，招待、判断和记忆都会更具体一些。'},
      { min: 80, max: 100, name: '留在她那里', desc: '你在她这里已经很难再被当成普通客人带过。她会稳定地把你和与你有关的细节单独留下，并在下一次见面时自然接上。'}
    ],
    KAKO: [
      { min: 0, max: 19, name: '备案', desc: '她先把你列为特管对象，而不是直接报死。此时保护仍是理性和系统安全导向。' },
      { min: 20, max: 39, name: '压件', desc: '她开始拖延、压住可能波及你的常规流程和清算箭头。你得到一点制度内的喘息空间。' },
      { min: 40, max: 59, name: '篡栏', desc: '她开始主动替你擦痕、修报表、改简报、伪造闭环。已明显触及渎职。' },
      { min: 60, max: 79, name: '斡旋', desc: '她开始顶住高层和外部压力，动用更多资源替你斡旋。她的偏袒逐渐在体制内形成明牌。' },
      { min: 80, max: 100, name: '共罪', desc: '她的职业底线与你的生死绑定。最懂规矩的事务长，成了你最绝对的同谋。' }
    ],
    TRIXIE: [
      { min: 0, max: 19, name: '猎奇', desc: '你是她弄不坏的新鲜玩具。她只是想戳一戳，看你会不会碎。' },
      { min: 20, max: 39, name: '逗弄', desc: '你成为她最大的乐子来源。她开始频繁乱入，把你的局面搅得更糟，只为了看戏。' },
      { min: 40, max: 59, name: '死锁', desc: '她的视线和兴趣开始彻底锚定你。接近你的人都会被她当作不配碰她的怪物。' },
      { min: 60, max: 79, name: '溃边', desc: '只要你想走向正常生活，她就会主动破坏你的安稳边界。恶性护食与自毁倾向开始显著。' },
      { min: 80, max: 100, name: '同殉', desc: '她已把你的存在与自己的毁灭绑死。在她的妄执里，拉你一起下地狱，就是最盛大的浪漫。' }
    ]
  };
  const REL_META = {
    RINO: {
      cn: '反转度',
      intent: '牵连度高代表她习惯你在身边；反转度高代表她的现实主位已经在你面前悄悄塌了。',
      definition: '反转度衡量的是，在名义主仆关系维持不变的前提下，Rino 与 Kazu 之间的实际支配结构、依赖方向与情感支点向 Kazu 一侧倒置的程度。该数值不代表 Rino 是否变得服从、柔顺或坦率，而反映她是否越来越难以维持原本的上位者位置——包括生存依附的加深、主位幻觉的失真，以及将命门、安全感与现实判断逐步压到 Kazu 身上的趋势。'
    },
    VV: {
      cn: '控股度',
      intent: '牵连度高代表她和你接触多；控股度高代表她已经从结构上把你握在手里。',
      definition: '控股度衡量的是，V.V. 将 Kazu 视为专属核心资产，并试图垄断其使用权、收益权、流向控制权与风险处置权的程度。该数值不等同于花钱多少，也不等同于单纯占有欲，而反映她是否已开始通过资金、合同、资源配置、风险对冲与排他性安排，将 Kazu 纳入自身可控的资产结构。'
    },
    POPPY: {
      cn: '寄生度',
      intent: '牵连度高代表她和你很熟、很常一起行动；寄生度高代表她已经把你当宿主、当窝、当活路。',
      definition: '寄生度衡量的是，Poppy 是否将 Kazu 视为可附着、可取暖、可索取资源、可提供安全退路的稳定宿主，并逐步把自己嵌入其生活、物资与行动结构中的程度。该数值不等同于单纯依赖或撒娇，而反映她是否正在以底层生存逻辑将 Kazu 作为挂上去就能活得更稳的大型活体巢穴来使用，并在附着中形成护食性、排他性与生活嵌入。'
    },
    KUZUHA: {
      cn: '债缚度',
      intent: '牵连度高代表你习惯待在她那；债缚度高代表你已经欠到不方便走了。',
      definition: '债缚度衡量的是，Kuzuha 通过庇护、供养、规矩与恩义，将 Kazu 从暂时被容留在自己地盘的人，逐步变成被人情、资源与生存路径柔性束在自己身边的人的程度。该数值不等同于单纯照顾、宠爱或宽容，而反映她是否正在把自己给予的安全、退路与便利转化为一种难以结清、也越来越不方便摆脱的关系债。'
    },
    SIA: {
      cn: '接管度',
      intent: '牵连度高代表她习惯你在身边；接管度高代表她不愿再让别人的手碰到你的处理权。',
      definition: '接管度衡量的是，Sia 是否开始将 Kazu 从职责上必须监控与保全的高危对象，逐步转变为只能由自己处理、判断、收尾与保全的私人责任范围的程度。该数值不等同于单纯保护欲，而反映 Sia 是否越来越倾向于将 Kazu 的风险、行动与处置权纳入自身可控范围，并在必要时以个人判断替代标准流程。'
    },
    EULALIA: {
      cn: '寄托度',
      intent: '牵连度高代表你们接触稳定、关系近；寄托度高代表她已经把某些不能说的东西放在你这里。',
      definition: '寄托度衡量的是，Eulalia 是否开始将原本只能独自承担、只能向外施予、或从不允许留给自己的安宁、痛楚、祈愿与存在感，逐步安放在 Kazu 身上的程度。该数值不等同于单纯依赖、慰藉或私欲增长，而反映 Eulalia 是否已将 Kazu 视为一个能够反向承接自己的人——不仅承接她的灾厄与疼痛，也承接她作为并非只应服务众生的圣女而存在的那部分隐秘可能。'
    },
    COTA: {
      cn: '留存度',
      intent: '牵连度高代表你和她接触多；留存度高代表她开始把你从普通客人里单独记住。',
      definition: '留存度衡量的是，Cota 是否开始把原本会在日常接待中顺手带过的区别留下来，并让 Kazu 成为一个不会再被和其他客人等同处理的对象。该数值反映的不是故障、报错或单纯记忆增强，而是她是否会对 Kazu 多记一步、多核对一句，并在下一次见面时自然接上前一次的区别。'
    },
    KAKO: {
      cn: '包庇度',
      intent: '牵连度高代表她和你熟，互动稳定；包庇度高代表她已经开始为了你违法做账。',
      definition: '包庇度衡量的是，Kako 作为最懂系统致命性的人，主动利用公权、审计盲区与程序漏洞，将 Kazu 强行隐匿、偏袒并保护在清算红线之外的程度。该数值不等同于单纯好感或保护欲，而反映她是否越来越难以克制地公权私用——从最初仅仅为了系统安全而压下异常，逐步演变为为了保住你这个人，愿意在最严密的体制账本里不断制造合法的破绽，甚至把自己的职业生涯与命格也押上去。'
    },
    TRIXIE: {
      cn: '妄执度',
      intent: '牵连度高代表你们经常遇见、交集多；妄执度高代表即使不见面，她的精神也已经锁死在你身上。',
      definition: '妄执度衡量的是，Trixie 在确认 Kazu 是世上唯一无法被她轻易弄坏的特异点后，对其产生的极端锁定、破坏测试欲与同类拉扯感的程度。该数值绝不代表常人的爱意或温柔，而反映她是否开始将 Kazu 视为自己发狂世界中唯一的坐标，并拒绝他走向任何正常秩序、安稳日常与像个人一样活着的可能。'
    }
  };

  const REL_DELTA_META = {
    RINO: {
      increaseMeaning: '反转度增加，代表 Rino 更难维持名义主位，现实判断、情绪稳定与生存支点更多压向 Kazu 一侧。',
      decreaseMeaning: '反转度减少，代表她重新收拢主位幻觉，把依赖重新包装并压回“我在支配你”的结构中，或主动拉开情感与现实支点。'
    },
    VV: {
      increaseMeaning: '控股度增加，代表 V.V. 不再只是看好 Kazu 的价值，而是进一步将其纳入自己的资产结构，强化独占、优先权、流向控制权与风险处置权。',
      decreaseMeaning: '控股度减少，代表她对 Kazu 的专属资产定位有所松动，开始降低投入、放松排他安排，或将其降级为高价值但非核心的标的。'
    },
    POPPY: {
      increaseMeaning: '寄生度增加，代表 Poppy 更明确地把 Kazu 当作宿主、窝、食物来源、保暖点与撤退线，并把自己的生存结构一点点挂进他的日常里。',
      decreaseMeaning: '寄生度减少，代表她重新把自保和撤退放回第一位，减少对 Kazu 的默认附着，不再把他视作唯一或主要的活体巢穴。'
    },
    KUZUHA: {
      increaseMeaning: '债缚度增加，代表 Kuzuha 给予 Kazu 的庇护、供养、便利与善后，越来越被组织成一种难还、难切、难离开的关系债。',
      decreaseMeaning: '债缚度减少，代表她暂时放松留人结构，让恩义不再持续累账，或允许 Kazu 在不额外背债的情况下保持更多独立性。'
    },
    SIA: {
      increaseMeaning: '接管度增加，代表 Sia 越来越不满足于“按职责看管”，而是把 Kazu 的风险、行动、日常与处置权逐步收进自己手里，形成私人责任范围。',
      decreaseMeaning: '接管度减少，代表她把 Kazu 重新放回标准监管流程，不再主动截留处理权，也不再默认“这件事归我”。'
    },
    EULALIA: {
      increaseMeaning: '寄托度增加，代表 Eulalia 开始把一些原本只会独自承受、独自压下或只会向外施予的东西，安静地放到 Kazu 这里，让他成为承接点。',
      decreaseMeaning: '寄托度减少，代表她重新把自己收回圣职结构里，把痛楚、愿望、疲惫和安宁重新封存为“我自己来承受”的部分。'
    },
    COTA: {
      increaseMeaning: '留存度增加，代表 Cota 开始把 Kazu 从普通客人里单独分出来。她会更容易记住和他有关的细节，在接待时多核对一步，并把这种区别带到下一次见面里。',
      decreaseMeaning: '留存度减少，代表 Cota 对 Kazu 的区别正在变淡。她仍会正常接待他，但那些只针对他的额外记忆和细节处理会慢慢回落，重新接近对普通客人的标准做法。'
    },
    KAKO: {
      increaseMeaning: '包庇度增加，代表 Kako 不只是因为系统安全而暂压异常，而是越来越主动地为了保住 Kazu 这个人，动用权限、流程漏洞和审计技巧进行制度性偏袒。',
      decreaseMeaning: '包庇度减少，代表她把自己从共犯位置往回收，减少人为遮掩和程序干预，让 Kazu 更接近被体制按标准方式处理。'
    },
    TRIXIE: {
      increaseMeaning: '妄执度增加，代表 Trixie 对 Kazu 的精神锁定更深，已不满足于逗弄和试坏，而开始把他视为自己世界里唯一不能失手、不能放走、不能正常活下去的核心坐标。',
      decreaseMeaning: '妄执度减少，代表她对 Kazu 的锁定暂时松动、被别的灾难或刺激分流，或短期内没有继续把全部视线钉死在他身上；这不等于恢复正常，只是死锁减弱。'
    }
  };

  function getRelStageName(score, table) {
    const v = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    for (const s of table) {
      if (v <= s.max) return s.name;
    }
    return table[table.length - 1].name;
  }

  function getRelStage(score, table) {
    const v = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    for (const s of table) {
      if (v <= s.max) return s;
    }
    return table[table.length - 1];
  }

  function buildRelationshipStateSummary(eraVars) {
    if (!eraVars) return '';
    const hero = eraVars.hero || {};
    const rel = hero.relationship || {};
    const characterBlocks = [];
    const order = ['RINO', 'VV', 'POPPY', 'KUZUHA', 'SIA', 'EULALIA', 'COTA', 'KAKO', 'TRIXIE'];

    for (const key of order) {
      const castNode = getCastNode(hero, key);
      if (castNode.activated !== true || castNode.introduced !== true) continue;

      const meta = REL_META[key];
      if (!meta) continue;
      const node = rel[key] || {};
      const ent = Math.max(0, Math.min(100, Math.round(Number(node.entanglement) || 0)));
      const exVal = Math.max(0, Math.min(100, Math.round(Number(node.exclusive) || 0)));
      const exStages = REL_STAGE_EX_BY_CHAR[key] || REL_STAGE_EX_BY_CHAR.RINO;
      const entStage = getRelStage(ent, REL_STAGE_ENT);
      const exStage = getRelStage(exVal, exStages);
      const deltaMeta = REL_DELTA_META[key] || {};
      characterBlocks.push(
`${key}:
[当前关系值]
  [${key}] 牵连度(entanglement)=${ent}(${entStage.name}) | ${meta.cn}(exclusive)=${exVal}(${exStage.name})
[基本关系定义]
  [${key}.exclusive] ${meta.definition}
    - 增加逻辑: ${deltaMeta.increaseMeaning || '（未定义）'}
    - 减少逻辑: ${deltaMeta.decreaseMeaning || '（未定义）'}
[当前阶段定义]
    - 牵连度阶段说明(${entStage.name}): ${entStage.desc}
    - ${meta.cn}阶段说明(${exStage.name}): ${exStage.desc}`
      );
    }

    const characterSection = characterBlocks.length > 0
      ? characterBlocks.join('\n\n')
      : '（当前无已入场角色关系块）';

    const entanglementDefinition = [
      '牵连度衡量的是，Kazu 与某角色在日常、行动、风险与生活结构上的卷入程度。',
      '它反映的是双方是否已形成稳定接触、默认存在感、相处惯性与现实中的相互影响。',
      '牵连度不是爱意，也不是控制，而是说明这个人是否已经走进你的现实。'
    ].join('');

    return `
<ace0_relationship_state>
[牵连度定义]
  ${entanglementDefinition}
[关系变化通用规则]
  牵连度增加 = 双方在日常、行动、风险与生活结构上的卷入加深。代表接触更稳定、共处更常态化、彼此开始默认对方会在场。
  牵连度减少 = 双方从彼此现实中部分脱嵌。代表接触减少、默认存在感下降、相互影响减弱。不等于厌恶，只表示没那么进入彼此生活。
  关系变量路径统一为 hero.relationship.<角色>.entanglement 与 hero.relationship.<角色>.exclusive。
  专属值(exclusive)增加 = 该角色以其自身逻辑，将 Kazu 更深地纳入自己的秩序、职责、欲望、异常、依赖。
  专属值(exclusive)减少 = 该角色对 Kazu 的特殊定位松动、后撤、失效或被压回一般关系。
[角色关系分块]
${characterSection}
</ace0_relationship_state>`;
  }
  /**
   * 构建注入给 AI 的 hero 状态 XML 摘要
   * - 资金显示统一为金弗（可带小数）
   * - 在队角色显示等级 + 魔运（低魔运时警告）
   * - 未入队角色不显示等级
   */
  function buildHeroSummary(eraVars) {
    if (!eraVars) return null;

    const hero = eraVars.hero || {};
    const funds = _normalizeFundsAmount(hero.funds);
    const assets = _normalizeFundsAmount(hero.assets);
    const debt = _normalizeFundsAmount(hero.debt);
    const majorDebt = _normalizeFundsAmount(hero.majorDebt);
    const roster = _getPartyRoster(hero);

    if (roster.length === 0) return null;

    const presentLines = [];
    const notIntroducedLines = [];
    const inPartyLines = [];

    for (const member of roster) {
      if (member.activated === true && member.introduced === true && member.present === true) {
        presentLines.push(`  ${member.name}`);
      } else if (member.activated === true && member.introduced !== true) {
        notIntroducedLines.push(`  ${member.name}`);
      }

      if (member.activated === true && member.inParty === true) {
        let manaStr = '';
        if (member.maxMana != null) {
          const ratio = member.maxMana > 0 ? member.mana / member.maxMana : 1;
          const warn = member.maxMana > 0 && ratio < MANA_LOW_RATIO ? ' ⚠️魔运不足，可能影响技能发动' : '';
          manaStr = ` | 魔运: ${member.mana}/${member.maxMana}${warn}`;
        }
        inPartyLines.push(`  ${member.name} Lv.${member.level}${manaStr}`);
      }
    }

    const presentSection = presentLines.length > 0 ? presentLines.join('\n') : '  （无）';
    const notIntroducedSection = notIntroducedLines.length > 0 ? notIntroducedLines.join('\n') : '  （无）';
    const inPartySection = inPartyLines.length > 0 ? inPartyLines.join('\n') : '  （无）';

    return `<ace0_hero_state>
[主角状态]
  资金: ${_formatFunds(funds)} (${_formatFundsNumber(funds)} funds)
  资产: ${_formatFunds(assets)} (${_formatFundsNumber(assets)} assets)
  债务: ${_formatFunds(debt)} (${_formatFundsNumber(debt)} debt)
  主债务: ${_formatFunds(majorDebt)} (${_formatFundsNumber(majorDebt)} majorDebt)
[PRESENT(present=true)]
${presentSection}
[NOT INTRODUCED(introduced=false)]
${notIntroducedSection}
[IN PARTY(inParty=true)]
${inPartySection}
</ace0_hero_state>`;
  }

  function getWorldState(eraVars) {
    return eraVars && eraVars.world && typeof eraVars.world === 'object'
      ? eraVars.world
      : {};
  }

  function getHeroState(eraVars) {
    return eraVars && eraVars.hero && typeof eraVars.hero === 'object'
      ? eraVars.hero
      : {};
  }

  function getWorldLocation(eraVars) {
    const world = getWorldState(eraVars);
    const raw = world.location && typeof world.location === 'object'
      ? world.location
      : DEFAULT_WORLD_LOCATION;
    const layer = typeof raw.layer === 'string' && WORLD_LAYERS.includes(raw.layer.trim().toUpperCase())
      ? raw.layer.trim().toUpperCase()
      : DEFAULT_WORLD_LOCATION.layer;
    const site = typeof raw.site === 'string' ? raw.site.trim() : '';
    return { layer, site };
  }

  function buildWorldContextSummary(eraVars) {
    const location = getWorldLocation(eraVars);
    const meta = LOCATION_LAYER_META[location.layer] || LOCATION_LAYER_META.THE_STREET;
    const siteLine = location.site ? location.site : '（未指定具体场所）';
    const clock = getWorldClock(eraVars);

    return `<ace0_world_context>
[WORLD CONTEXT]
  当前位于 ${meta.label} / ${meta.english} / ${location.layer}
  当前场所: ${siteLine}
  当前时间: DAY ${clock.day} / ${clock.phase}
</ace0_world_context>`;
  }

  function buildLocationDocSummary(eraVars) {
    const location = getWorldLocation(eraVars);
    const meta = LOCATION_LAYER_META[location.layer] || LOCATION_LAYER_META.THE_STREET;
    return typeof meta.fullDoc === 'string' ? meta.fullDoc.trim() : '';
  }

  function normalizeWorldClock(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const day = Math.max(1, Math.round(Number(src.day) || DEFAULT_WORLD_CLOCK.day));
    const rawPhase = typeof src.phase === 'string' ? src.phase.trim().toUpperCase() : '';
    const phase = WORLD_CLOCK_SLOTS.includes(rawPhase) ? rawPhase : DEFAULT_WORLD_CLOCK.phase;
    return { day, phase };
  }

  function getWorldClock(eraVars) {
    const world = getWorldState(eraVars);
    return normalizeWorldClock(world && world.current_time);
  }

  function advanceWorldClockState(clock, steps) {
    const normalized = normalizeWorldClock(clock);
    const n = Math.max(0, Math.round(Number(steps) || 0));
    if (n === 0) return normalized;
    const totalSlots = WORLD_CLOCK_SLOTS.length;
    const curIdx = WORLD_CLOCK_SLOTS.indexOf(normalized.phase);
    const absolute = (normalized.day - 1) * totalSlots + (curIdx < 0 ? 0 : curIdx) + n;
    return {
      day: Math.floor(absolute / totalSlots) + 1,
      phase: WORLD_CLOCK_SLOTS[absolute % totalSlots]
    };
  }

  function getWorldClockAbsoluteIndex(clock) {
    const normalized = normalizeWorldClock(clock);
    const totalSlots = WORLD_CLOCK_SLOTS.length;
    const phaseIndex = WORLD_CLOCK_SLOTS.indexOf(normalized.phase);
    return ((normalized.day - 1) * totalSlots) + (phaseIndex < 0 ? 0 : phaseIndex);
  }

  function getForwardWorldClockPhaseSteps(fromClock, toClock) {
    const diff = getWorldClockAbsoluteIndex(toClock) - getWorldClockAbsoluteIndex(fromClock);
    return diff > 0 ? diff : 0;
  }

  function applyDebtInterest(principalAmount, phaseSteps, ratePerPhase) {
    const principal = _normalizeFundsAmount(principalAmount);
    const steps = Math.max(0, Math.round(Number(phaseSteps) || 0));
    const rate = Math.max(0, Number(ratePerPhase) || 0);
    if (principal <= 0 || steps <= 0 || rate <= 0) return principal;
    const next = principal * Math.pow(1 + rate, steps);
    return _normalizeFundsAmount(next);
  }

  function normalizeActStage(value) {
    const normalized = _normalizeTrimmedString(value, '').toLowerCase();
    return ACT_STAGE_VALUES.includes(normalized) ? normalized : DEFAULT_WORLD_ACT.stage;
  }

  function getActModuleApi() {
    const candidates = [];
    const pushCandidate = (candidate) => {
      if (!candidate || typeof candidate !== 'object') return;
      if (candidates.includes(candidate)) return;
      candidates.push(candidate);
    };

    try {
      if (window && typeof window === 'object') pushCandidate(window);
    } catch (_) {}
    try {
      const hostRoot = getAce0HostRoot();
      if (hostRoot && typeof hostRoot === 'object') pushCandidate(hostRoot);
    } catch (_) {}
    try {
      if (typeof globalThis === 'object' && globalThis) pushCandidate(globalThis);
    } catch (_) {}

    for (const candidate of candidates) {
      try {
        const modules = candidate.ACE0Modules;
        const actModule = modules && typeof modules === 'object' ? modules.act : null;
        if (!actModule || typeof actModule !== 'object') continue;
        if (actModule.__ACE0_HOST_BRIDGE__ === true && actModule.__ACE0_TARGET__ && typeof actModule.__ACE0_TARGET__ === 'object') {
          return actModule.__ACE0_TARGET__;
        }
        return actModule;
      } catch (_) {}
    }

    return null;
  }

  function installActModuleHostBridge() {
    const hostRoot = getAce0HostRoot();
    if (!hostRoot || typeof hostRoot !== 'object') return null;

    if (!hostRoot.ACE0Modules || typeof hostRoot.ACE0Modules !== 'object') {
      hostRoot.ACE0Modules = {};
    }

    const localModules = window.ACE0Modules;
    const localActModule = localModules && typeof localModules === 'object' && localModules.act && typeof localModules.act === 'object'
      ? localModules.act
      : null;
    const existingHostActModule = hostRoot.ACE0Modules.act && typeof hostRoot.ACE0Modules.act === 'object'
      ? hostRoot.ACE0Modules.act
      : null;
    const targetActModule = localActModule && localActModule.__ACE0_HOST_BRIDGE__ !== true
      ? localActModule
      : (existingHostActModule && existingHostActModule.__ACE0_HOST_BRIDGE__ !== true ? existingHostActModule : null);

    if (!targetActModule) return null;

    const proxiedMethodNames = [
      'getDefaultActState',
      'normalizeActState',
      'createFrontendSnapshot',
      'getChapter',
      'listChapters',
      'normalizeActEffectList',
      'getNormalizedActNodeEffects',
      'getNormalizedActPhaseEffects',
      'getNodeRuntime',
      'getJumpRouteOptions',
      'createEmptyCounts',
      'createRewardsForNode',
      'applyReserveGrowthToAct',
      'clearLimitedActTokens',
      'resetActPhaseSlots',
      'applyNodeRewardsToAct',
      'advanceActToNextNode',
      'resolveActNodeTransition',
      'consumeSingleActPhase',
      'commitPackUsageForPhase',
      'deriveWorldTimeFromAct',
      'resolvePendingAdvanceState',
      'deriveCharacterStatesFromActState',
      'createCharacterCastPatch',
      'buildActStateSummaryFromDerived',
      'buildCharterPromptContent',
      'buildNarrativePromptContentFromDerived',
      'buildNarrativePacingSummary',
      'getNodeFirstMeetMap',
      'buildFirstMeetPromptContent'
    ];

    const bridge = {
      __ACE0_HOST_BRIDGE__: true,
      __ACE0_TARGET__: targetActModule
    };

    proxiedMethodNames.forEach((methodName) => {
      bridge[methodName] = (...args) => {
        if (typeof targetActModule[methodName] !== 'function') {
          if (methodName === 'listChapters') return [];
          return null;
        }
        try {
          return targetActModule[methodName](...args);
        } catch (error) {
          console.warn(`[ACE0 ACT] Host bridge ${methodName} failed:`, error);
          if (methodName === 'listChapters') return [];
          return null;
        }
      };
    });

    hostRoot.ACE0Modules.act = bridge;
    return bridge;
  }

  function getActDefaultStateFromModule(actId) {
    const actModule = getActModuleApi();
    if (!actModule || typeof actModule.getDefaultActState !== 'function') return null;
    try {
      const defaultState = actModule.getDefaultActState(actId);
      return defaultState && typeof defaultState === 'object'
        ? JSON.parse(JSON.stringify(defaultState))
        : null;
    } catch (error) {
      console.warn('[ACE0 ACT] Failed to read default act state from module:', error);
      return null;
    }
  }

  function getActChapterConfigFromModule(actId) {
    const actModule = getActModuleApi();
    if (!actModule || typeof actModule.getChapter !== 'function') return null;
    try {
      const chapter = actModule.getChapter(actId);
      return chapter && typeof chapter === 'object'
        ? JSON.parse(JSON.stringify(chapter))
        : null;
    } catch (error) {
      console.warn('[ACE0 ACT] Failed to read chapter config from module:', error);
      return null;
    }
  }

  function runActModuleMethod(methodName, ...args) {
    const actModule = getActModuleApi();
    if (!actModule || typeof actModule[methodName] !== 'function') return { ok: false, value: null };
    try {
      return {
        ok: true,
        value: actModule[methodName](...args)
      };
    } catch (error) {
      console.warn(`[ACE0 ACT] Failed to call module method ${methodName}:`, error);
      return { ok: false, value: null };
    }
  }

  function normalizeActResourceCounts(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const counts = ACT_RESOURCE_KEYS.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
    Object.entries(source).forEach(([rawKey, rawValue]) => {
      const key = normalizeActResourceKey(rawKey, '');
      if (!key) return;
      const value = Number(rawValue);
      counts[key] += Number.isFinite(value) ? Math.max(0, value) : 0;
    });
    return counts;
  }

  function normalizeActIncomeRateCounts(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const counts = { ...DEFAULT_WORLD_ACT.income_rate };
    Object.entries(source).forEach(([rawKey, rawValue]) => {
      const key = normalizeActResourceKey(rawKey, '');
      if (!key) return;
      const value = Number(rawValue);
      counts[key] = Number.isFinite(value) ? Math.max(0, value) : 0;
    });
    for (const key of ACT_RESOURCE_KEYS) {
      counts[key] = Math.max(0, Math.min(1.5, Number(counts[key]) || 0));
    }
    return counts;
  }

  function normalizeActVisionState(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
      baseSight: Math.max(0, Math.round(Number(source.baseSight) || 1)),
      bonusSight: Math.max(0, Math.round(Number(source.bonusSight) || 0)),
      jumpReady: source.jumpReady === true,
      pendingReplace: source.pendingReplace && typeof source.pendingReplace === 'object' && !Array.isArray(source.pendingReplace)
        ? JSON.parse(JSON.stringify(source.pendingReplace))
        : null
    };
  }

  function getWorldActState(eraVars) {
    const world = getWorldState(eraVars);
    const moduleDefaultAct = getActDefaultStateFromModule(world?.act?.id || DEFAULT_WORLD_ACT.id);
    const fallbackDefaultAct = moduleDefaultAct || DEFAULT_WORLD_ACT;
    const rawAct = world.act && typeof world.act === 'object' ? world.act : fallbackDefaultAct;
    const routeHistory = Array.isArray(rawAct.route_history)
      ? rawAct.route_history.map(value => _normalizeTrimmedString(value, '')).filter(Boolean)
      : [];

    return {
      id: _normalizeTrimmedString(rawAct.id, fallbackDefaultAct.id) || fallbackDefaultAct.id,
      seed: _normalizeTrimmedString(rawAct.seed, fallbackDefaultAct.seed) || fallbackDefaultAct.seed,
      nodeIndex: Math.max(1, Math.round(Number(rawAct.nodeIndex) || fallbackDefaultAct.nodeIndex)),
      route_history: routeHistory.length ? routeHistory : [...fallbackDefaultAct.route_history],
      limited: normalizeActResourceCounts(rawAct.limited),
      reserve: normalizeActResourceCounts(rawAct.reserve),
      reserve_progress: normalizeActResourceCounts(rawAct.reserve_progress),
      income_rate: normalizeActIncomeRateCounts(rawAct.income_rate || fallbackDefaultAct.income_rate),
      income_progress: normalizeActResourceCounts(rawAct.income_progress),
      phase_slots: Array.from({ length: 4 }, (_, index) => {
        const slot = Array.isArray(rawAct.phase_slots) ? rawAct.phase_slots[index] : null;
        if (!slot || typeof slot !== 'object') return null;
        const key = normalizeActResourceKey(slot.key, '');
        const amount = Math.max(1, Math.min(3, Math.round(Number(slot.amount) || 1)));
        const rawSources = Array.isArray(slot.sources) && slot.sources.length
          ? slot.sources
          : Array.from({ length: amount }, () => slot.source);
        const sources = rawSources
          .slice(0, amount)
          .map(source => _normalizeTrimmedString(source, 'limited').toLowerCase() === 'reserve' ? 'reserve' : 'limited');
        while (sources.length < amount) {
          sources.push(_normalizeTrimmedString(slot.source, 'limited').toLowerCase() === 'reserve' ? 'reserve' : 'limited');
        }
        if (!ACT_RESOURCE_KEYS.includes(key)) return null;
        const normalizedSlot = {
          key,
          source: _normalizeTrimmedString(slot.source, 'limited').toLowerCase() === 'reserve'
            ? 'reserve'
            : 'limited',
          amount,
          sources
        };
        const tint = normalizeActResourceKey(slot.tint || slot.controlType || slot.targetKey, '');
        if (key === 'rest' && tint) {
          normalizedSlot.tint = tint;
          const tintSource = _normalizeTrimmedString(slot.tintSource, '').toLowerCase();
          if (tintSource === 'reserve' || tintSource === 'limited') normalizedSlot.tintSource = tintSource;
        }
        return normalizedSlot;
      }),
      phase_index: Math.max(0, Math.min(4, Math.round(Number(rawAct.phase_index) || 0))),
      stage: normalizeActStage(rawAct.stage),
      phase_advance: Math.max(0, Math.round(Number(rawAct.phase_advance) || 0)),
      pickedPacks: (rawAct.pickedPacks && typeof rawAct.pickedPacks === 'object' && !Array.isArray(rawAct.pickedPacks))
        ? JSON.parse(JSON.stringify(rawAct.pickedPacks))
        : {},
      controlledNodes: (rawAct.controlledNodes && typeof rawAct.controlledNodes === 'object' && !Array.isArray(rawAct.controlledNodes))
        ? JSON.parse(JSON.stringify(rawAct.controlledNodes))
        : {},
      crisis: Math.max(0, Math.min(100, Math.round(Number(rawAct.crisis) || 0))),
      crisisSignals: Array.isArray(rawAct.crisisSignals)
        ? rawAct.crisisSignals
            .filter(item => item && typeof item === 'object' && !Array.isArray(item))
            .map(item => JSON.parse(JSON.stringify(item)))
        : [],
      vision: normalizeActVisionState(rawAct.vision),
      resourceSpent: normalizeActResourceCounts(rawAct.resourceSpent),
      characterEncounter: (rawAct.characterEncounter && typeof rawAct.characterEncounter === 'object' && !Array.isArray(rawAct.characterEncounter))
        ? JSON.parse(JSON.stringify(rawAct.characterEncounter))
        : {},
      pendingResolutions: Array.isArray(rawAct.pendingResolutions)
        ? rawAct.pendingResolutions
            .filter(item => item && typeof item === 'object' && !Array.isArray(item))
            .map(item => JSON.parse(JSON.stringify(item)))
        : [],
      resolutionHistory: Array.isArray(rawAct.resolutionHistory)
        ? rawAct.resolutionHistory
            .filter(item => item && typeof item === 'object' && !Array.isArray(item))
            .map(item => JSON.parse(JSON.stringify(item)))
        : [],
      narrativeTension: Math.max(0, Math.min(100, Math.round(Number(rawAct.narrativeTension) || 0))),
      pendingFirstMeet: (() => {
        const raw = rawAct.pendingFirstMeet;
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
        const out = {};
        for (const [k, v] of Object.entries(raw)) {
          if (typeof v === 'string' && v.trim()) out[k] = v;
        }
        return out;
      })(),
      pendingTransitionTarget: typeof rawAct.pendingTransitionTarget === 'string'
        ? rawAct.pendingTransitionTarget.trim()
        : '',
      transitionRequestTarget: typeof rawAct.transitionRequestTarget === 'string'
        ? rawAct.transitionRequestTarget.trim()
        : '',
      pendingTransitionPrompt: typeof rawAct.pendingTransitionPrompt === 'string'
        ? rawAct.pendingTransitionPrompt.trim()
        : ''
    };
  }

  function getActRuntimeConfig(actId) {
    const key = _normalizeTrimmedString(actId, DEFAULT_WORLD_ACT.id);
    const moduleConfig = getActChapterConfigFromModule(key);
    if (moduleConfig) return moduleConfig;
    if (!hasWarnedMissingActModule) {
      hasWarnedMissingActModule = true;
      console.warn('[ACE0 ACT] No chapter config available from acezero-act-plugin.js. ACT runtime module is required but was not loaded.');
    }
    return null;
  }

  function maybeResolveActCompletionTransition(actState, heroState, worldState) {
    const transitionResult = runActModuleMethod('evaluateCompletionTransition', actState, heroState, worldState);
    const requestTarget = (typeof actState?.transitionRequestTarget === 'string'
      ? actState.transitionRequestTarget.trim()
      : '') || latchedTransitionRequestTarget;
    if (!transitionResult.ok || !transitionResult.value?.eligible) {
      const nextActState = {
        ...actState,
        pendingTransitionTarget: '',
        transitionRequestTarget: requestTarget,
        pendingTransitionPrompt: ''
      };
      const changed = nextActState.pendingTransitionTarget !== actState.pendingTransitionTarget
        || nextActState.transitionRequestTarget !== actState.transitionRequestTarget
        || nextActState.pendingTransitionPrompt !== actState.pendingTransitionPrompt;
      return { transitioned: false, changed, actState: nextActState };
    }

    const transition = transitionResult.value;
    const targetChapterId = typeof transition.targetChapterId === 'string' ? transition.targetChapterId.trim() : '';
    const requestPromptResult = runActModuleMethod('buildCompletionTransitionPromptContent', transition, { mode: 'request' });
    const pendingTransitionPrompt = requestPromptResult.ok && typeof requestPromptResult.value === 'string'
      ? requestPromptResult.value
      : '';

    if (requestTarget && requestTarget === targetChapterId) {
      const targetActState = transition.targetActState && typeof transition.targetActState === 'object'
        ? JSON.parse(JSON.stringify(transition.targetActState))
        : getActDefaultStateFromModule(transition.targetChapterId);
      if (!targetActState || typeof targetActState !== 'object') {
        return { transitioned: false, changed: false, actState };
      }

      const enteredPromptResult = runActModuleMethod('buildCompletionTransitionPromptContent', transition, { mode: 'entered' });
      const enteredPrompt = enteredPromptResult.ok && typeof enteredPromptResult.value === 'string'
        ? enteredPromptResult.value
        : '';
      latchedTransitionRequestTarget = '';

      return {
        transitioned: true,
        changed: true,
        actState: {
          ...targetActState,
          pendingFirstMeet: {},
          pendingTransitionTarget: '',
          transitionRequestTarget: '',
          pendingTransitionPrompt: enteredPrompt
        },
        transition
      };
    }

    const nextActState = {
      ...actState,
      pendingTransitionTarget: targetChapterId,
      transitionRequestTarget: requestTarget && requestTarget === targetChapterId ? requestTarget : '',
      pendingTransitionPrompt
    };
    const changed = nextActState.pendingTransitionTarget !== actState.pendingTransitionTarget
      || nextActState.transitionRequestTarget !== actState.transitionRequestTarget
      || nextActState.pendingTransitionPrompt !== actState.pendingTransitionPrompt;
    return { transitioned: false, changed, actState: nextActState, transition };
  }

  function getActNodeRuntime(config, nodeId) {
    const moduleResult = runActModuleMethod('getNodeRuntime', config, nodeId);
    if (moduleResult.ok) return moduleResult.value;
    return config?.nodes?.[nodeId] || null;
  }

  function createEmptyActCounts(defaultValue = 0) {
    const moduleResult = runActModuleMethod('createEmptyCounts', defaultValue);
    if (moduleResult.ok && moduleResult.value) return moduleResult.value;
    return ACT_RESOURCE_KEYS.reduce((acc, key) => {
      acc[key] = defaultValue;
      return acc;
    }, {});
  }

  function createActRewardsForNode(nodeRuntime) {
    const moduleResult = runActModuleMethod('createRewardsForNode', nodeRuntime);
    if (moduleResult.ok && moduleResult.value) return moduleResult.value;
    const rewards = createEmptyActCounts(0);
    if (!nodeRuntime) return rewards;

    if (nodeRuntime.rewards && typeof nodeRuntime.rewards === 'object') {
      Object.entries(nodeRuntime.rewards).forEach(([rawKey, rawValue]) => {
        const key = normalizeActResourceKey(rawKey, '');
        if (!key) return;
        rewards[key] += Math.max(0, Math.round(Number(rawValue) || 0));
      });
      return rewards;
    }

    const key = normalizeActResourceKey(nodeRuntime.key, '');
    if (ACT_RESOURCE_KEYS.includes(key)) {
      rewards[key] = 1;
    }
    return rewards;
  }

  function normalizeActEffectList(list) {
    const moduleResult = runActModuleMethod('normalizeActEffectList', list);
    if (moduleResult.ok && Array.isArray(moduleResult.value)) return moduleResult.value;
    return [];
  }

  function getNormalizedActNodeEffects(config, nodeId) {
    const moduleResult = runActModuleMethod('getNormalizedActNodeEffects', config, nodeId);
    if (moduleResult.ok && moduleResult.value) return moduleResult.value;
    return {
      activate: [],
      introduce: [],
      present: [],
      join_party: []
    };
  }

  // phaseEffects[nodeId][phaseIndex] 覆盖 nodeEffects[nodeId]，只在被显式定义时生效。
  function getNormalizedActPhaseEffects(config, nodeId, phaseIndex) {
    const moduleResult = runActModuleMethod('getNormalizedActPhaseEffects', config, nodeId, phaseIndex);
    if (moduleResult.ok) return moduleResult.value;
    return null;
  }

  function deriveActCharacterStates(eraVars) {
    const act = getWorldActState(eraVars);
    const config = getActRuntimeConfig(act.id);
    if (!config) return null;
    const moduleResult = runActModuleMethod('deriveCharacterStatesFromActState', act, config);
    if (moduleResult.ok && moduleResult.value) return moduleResult.value;
    return null;
  }

  function getAllActManagedCharacterKeys() {
    const chapterIdsResult = runActModuleMethod('listChapters');
    const chapterIds = chapterIdsResult.ok && Array.isArray(chapterIdsResult.value)
      ? chapterIdsResult.value
      : [];
    const keySet = new Set();

    chapterIds.forEach((chapterId) => {
      const chapterResult = runActModuleMethod('getChapter', chapterId);
      const managedCharacters = chapterResult.ok
        ? chapterResult.value?.runtime?.managedCharacters
        : null;
      if (!Array.isArray(managedCharacters)) return;
      managedCharacters.forEach((charKey) => {
        const normalized = typeof charKey === 'string' ? charKey.trim().toUpperCase() : '';
        if (normalized) keySet.add(normalized);
      });
    });

    return keySet;
  }

  async function synchronizeActCharacterState(eraVars) {
    const derived = deriveActCharacterStates(eraVars);
    if (!derived) return { eraVars, derived: null, changed: false };

    const hero = eraVars?.hero || {};
    const currentCast = getHeroCast(hero);
    const modulePatchResult = runActModuleMethod('createCharacterCastPatch', currentCast, derived);
    const castPatch = modulePatchResult.ok && modulePatchResult.value?.castPatch
      ? modulePatchResult.value.castPatch
      : {};
    const firstMeetHints = modulePatchResult.ok && modulePatchResult.value?.firstMeetHints
      && typeof modulePatchResult.value.firstMeetHints === 'object'
      ? modulePatchResult.value.firstMeetHints
      : {};
    let changed = modulePatchResult.ok
      ? modulePatchResult.value?.changed === true
      : false;

    if (!modulePatchResult.ok) {
      for (const charKey of derived.managedCharacters) {
        const currentNode = getCastNode(hero, charKey);
        const desiredNode = derived.states[charKey];
        const nextNode = {
          activated: desiredNode.activated === true,
          introduced: desiredNode.introduced === true,
          present: desiredNode.present === true,
          inParty: desiredNode.inParty === true,
          miniKnown: desiredNode.miniKnown === true
        };

        if (
          currentNode.activated !== nextNode.activated ||
          currentNode.introduced !== nextNode.introduced ||
          currentNode.present !== nextNode.present ||
          currentNode.inParty !== nextNode.inParty ||
          currentNode.miniKnown !== nextNode.miniKnown
        ) {
          castPatch[charKey] = nextNode;
          changed = true;
        }
      }
    }

    const activeManagedSet = new Set(
      Array.isArray(derived.managedCharacters)
        ? derived.managedCharacters.map((charKey) => String(charKey || '').trim().toUpperCase()).filter(Boolean)
        : []
    );
    getAllActManagedCharacterKeys().forEach((charKey) => {
      if (activeManagedSet.has(charKey)) return;
      const currentNode = getCastNode(hero, charKey);
      if (
        currentNode.activated === true ||
        currentNode.introduced === true ||
        currentNode.present === true ||
        currentNode.inParty === true ||
        currentNode.miniKnown === true
      ) {
        castPatch[charKey] = {
          activated: false,
          introduced: false,
          present: false,
          inParty: false,
          miniKnown: false
        };
        changed = true;
      }
    });

    // 首见帧持久化到 MVU: world.act.pendingFirstMeet。
    // - 纯跃迁驱动：只在本轮 cast 的 introduced=false→true 时写入
    // - 跨楼层稳定：玩家在同一楼层内编辑 / swipe / 重生成都保留
    //   （楼层前进的清理由 prompt 流水里的 chat.length 闸门负责）
    // - 段位推进清空（见 resolvePendingActAdvance）
    // 注意：不做"设计了就补写"的补偿逻辑——那会让 pending 段位内常驻去不掉。
    const currentActState = getWorldActState(eraVars);
    const currentPending = currentActState?.pendingFirstMeet && typeof currentActState.pendingFirstMeet === 'object'
      ? currentActState.pendingFirstMeet
      : {};
    const pendingPatch = {};

    for (const [k, v] of Object.entries(firstMeetHints)) {
      if (typeof v !== 'string' || !v.trim()) continue;
      if (!currentPending[k]) pendingPatch[k] = v;
    }

    const pendingChanged = Object.keys(pendingPatch).length > 0;
    const nextPending = pendingChanged
      ? { ...currentPending, ...pendingPatch }
      : currentPending;

    if (changed || pendingChanged) {
      const actUpdate = pendingChanged
        ? { pendingFirstMeet: nextPending }
        : undefined;

      await updateEraVars({
        ...(changed ? { hero: { cast: castPatch } } : {}),
        ...(actUpdate ? { world: { act: actUpdate } } : {})
      });

      const nextEraVars = {
        ...(eraVars || {}),
        hero: {
          ...(eraVars?.hero || {}),
          cast: {
            ...(eraVars?.hero?.cast || {}),
            ...(changed ? castPatch : {})
          }
        },
        world: {
          ...(eraVars?.world || {}),
          act: {
            ...(eraVars?.world?.act || {}),
            ...(pendingChanged ? { pendingFirstMeet: nextPending } : {})
          }
        }
      };
      return { eraVars: nextEraVars, derived, changed: changed || pendingChanged, firstMeetHints };
    }

    return { eraVars, derived, changed: false, firstMeetHints };
  }

  function buildActStateSummary(eraVars, derivedActState = null) {
    const derived = derivedActState || deriveActCharacterStates(eraVars);
    if (!derived) return '';
    const moduleResult = runActModuleMethod('buildActStateSummaryFromDerived', derived);
    if (moduleResult.ok && typeof moduleResult.value === 'string') return moduleResult.value;
    return '';
  }

  function buildActNarrativePrompts(eraVars, derivedActState = null, firstMeetHints = null) {
    const derived = derivedActState || deriveActCharacterStates(eraVars);
    if (!derived) return [];
    const { act, config, currentNodeId } = derived;
    const narrative = config && config.narrative;
    if (!narrative) return [];

    const prompts = [];
    const liveAct = getWorldActState(eraVars);
    let transitionPromptContent = typeof liveAct?.pendingTransitionPrompt === 'string'
      ? liveAct.pendingTransitionPrompt.trim()
      : '';
    if (!transitionPromptContent) {
      const transitionResult = runActModuleMethod('evaluateCompletionTransition', act, getHeroState(eraVars), getWorldState(eraVars));
      if (transitionResult.ok && transitionResult.value?.eligible) {
        const promptResult = runActModuleMethod('buildCompletionTransitionPromptContent', transitionResult.value, { mode: 'request' });
        transitionPromptContent = promptResult.ok && typeof promptResult.value === 'string'
          ? promptResult.value.trim()
          : '';
      }
    }
    if (transitionPromptContent) {
      prompts.push({
        id: ACT_TRANSITION_INJECT_ID,
        position: 'in_chat',
        depth: 1,
        role: 'system',
        content: transitionPromptContent,
        should_scan: false
      });
    }

    // 首见帧 hook（新 hook）：仅在 firstMeetHints 非空时注入。
    // firstMeetHints 由 synchronizeActCharacterState 基于 MVU 践迁推出，用完即消。
    const hints = firstMeetHints && typeof firstMeetHints === 'object' ? firstMeetHints : {};
    if (Object.keys(hints).length > 0) {
      const firstMeetModule = runActModuleMethod('buildFirstMeetPromptContent', hints);
      const firstMeetContent = firstMeetModule.ok && typeof firstMeetModule.value === 'string'
        ? firstMeetModule.value
        : '';
      if (firstMeetContent) {
        prompts.push({
          id: ACT_FIRST_MEET_INJECT_ID,
          position: 'in_chat',
          depth: 1,
          role: 'system',
          content: firstMeetContent,
          should_scan: false
        });
      }
    }

    const charterModule = runActModuleMethod('buildCharterPromptContent', narrative);
    const charterContent = charterModule.ok && typeof charterModule.value === 'string'
      ? charterModule.value
      : '';
    if (charterContent) {
      prompts.push({
        id: ACT_CHARTER_INJECT_ID,
        position: 'in_chat',
        depth: 2,
        role: 'system',
        content: charterContent,
        should_scan: false
      });
    }

    const narrativeModule = runActModuleMethod('buildNarrativePromptContentFromDerived', derived);
    const narrativeContent = narrativeModule.ok && typeof narrativeModule.value === 'string'
      ? narrativeModule.value
      : '';
    if (narrativeContent) {
      prompts.push({
        id: ACT_NARRATIVE_INJECT_ID,
        position: 'in_chat',
        depth: 1,
        role: 'system',
        content: narrativeContent,
        should_scan: false
      });
    }

    // 节奏提示直接读当前 live act，避免派生链遗漏 narrativeTension 时显示成 0。
    const tension = Math.max(0, Math.min(100, Math.round(Number(liveAct?.narrativeTension) || 0)));
    const worldClockSuggestion = buildWorldClockAdvanceSuggestion(getWorldClockPressure(eraVars));
    const pacingModule = runActModuleMethod('buildNarrativePacingSummary', tension, worldClockSuggestion);
    const pacingContent = pacingModule.ok && typeof pacingModule.value === 'string'
      ? pacingModule.value
      : '';
    if (pacingContent) {
      prompts.push({
        id: ACT_PACING_INJECT_ID,
        position: 'in_chat',
        depth: 1,
        role: 'system',
        content: pacingContent,
        should_scan: false
      });
    }

    return prompts;
  }

  function normalizeActSnapshotCounts(raw) {
    const normalized = normalizeActResourceCounts(raw);
    return ACT_RESOURCE_KEYS.reduce((acc, key) => {
      acc[key] = Math.round(Number(normalized[key]) || 0);
      return acc;
    }, {});
  }

  function getHeroResourceSnapshot(eraVars) {
    const hero = eraVars?.hero || {};
    const funds = _normalizeFundsAmount(hero.funds);
    const assets = _normalizeFundsAmount(hero.assets);
    const debt = _normalizeFundsAmount(hero.debt);
    const majorDebt = _normalizeFundsAmount(hero.majorDebt);
    // mana 按 roster 成员逐一快照——KAZU maxMana=0 无 mana 池，
    // 战斗 mana 分散在 RINO / SIA / POPPY 等 roster 节点，需要
    // 分角色追踪，避免用合计掩盖谁回 / 谁耗。
    const roster = (hero && typeof hero.roster === 'object') ? hero.roster : {};
    const manaByRoster = {};
    const maxManaByRoster = {};
    const levelByRoster = {};
    for (const key of Object.keys(roster)) {
      const node = roster[key];
      if (!node || typeof node !== 'object') continue;
      manaByRoster[key] = Math.max(0, Math.round(Number(node.mana) || 0));
      maxManaByRoster[key] = Math.max(0, Math.round(Number(node.maxMana) || 0));
      levelByRoster[key] = Math.max(0, Math.round(Number(node.level) || 0));
    }
    return {
      funds,
      assets,
      debt,
      majorDebt,
      manaByRoster,
      maxManaByRoster,
      levelByRoster
    };
  }

  function getHeroCastStateSnapshot(eraVars, managedCharacters, states) {
    const hero = eraVars?.hero || {};
    const cast = (hero && typeof hero.cast === 'object') ? hero.cast : {};
    const introduced = [];
    const inParty = [];

    for (const charKey of managedCharacters || []) {
      const castNode = cast[charKey];
      const derivedState = states?.[charKey] || {};
      if ((castNode?.introduced === true) || derivedState.introduced === true) introduced.push(charKey);
      if ((castNode?.inParty === true) || derivedState.inParty === true) inParty.push(charKey);
    }

    introduced.sort();
    inParty.sort();
    return { introduced, inParty };
  }

  function createActRuntimeSnapshot(eraVars, derivedActState = null) {
    const derived = derivedActState || deriveActCharacterStates(eraVars);
    if (!derived) return null;

    const { act, currentNodeId, managedCharacters, states } = derived;
    const heroResources = getHeroResourceSnapshot(eraVars);
    const heroCastState = getHeroCastStateSnapshot(eraVars, managedCharacters, states);
    const activated = managedCharacters.filter(charKey => states[charKey]?.activated === true).sort();
    const present = managedCharacters.filter(charKey => states[charKey]?.present === true).sort();
    const clock = getWorldClock(eraVars);
    const clockPressure = getWorldClockPressure(eraVars);
    const location = getWorldLocation(eraVars);

    return {
      id: act.id,
      seed: act.seed,
      nodeIndex: act.nodeIndex,
      phaseIndex: act.phase_index,
      stage: act.stage,
      currentNodeId,
      routeHistory: [...act.route_history],
      limited: normalizeActSnapshotCounts(act.limited),
      reserve: normalizeActSnapshotCounts(act.reserve),
      reserveProgress: normalizeActSnapshotCounts(act.reserve_progress),
      incomeRate: normalizeActResourceCounts(act.income_rate),
      incomeProgress: normalizeActResourceCounts(act.income_progress),
      phaseSlots: act.phase_slots.map(slot => slot ? {
        key: normalizeActResourceKey(slot.key, 'vision'),
        source: slot.source === 'reserve' ? 'reserve' : 'limited',
        amount: Math.max(1, Math.min(3, Math.round(Number(slot.amount) || 1))),
        sources: Array.isArray(slot.sources) ? slot.sources.map(source => source === 'reserve' ? 'reserve' : 'limited') : undefined,
        tint: slot.key === 'rest' ? normalizeActResourceKey(slot.tint || slot.controlType || slot.targetKey, '') || undefined : undefined,
        tintSource: slot.tintSource === 'reserve' || slot.tintSource === 'limited' ? slot.tintSource : undefined
      } : null),
      controlledNodes: act.controlledNodes && typeof act.controlledNodes === 'object' ? JSON.parse(JSON.stringify(act.controlledNodes)) : {},
      crisis: Math.max(0, Math.round(Number(act.crisis) || 0)),
      vision: normalizeActVisionState(act.vision),
      resourceSpent: normalizeActSnapshotCounts(act.resourceSpent),
      funds: heroResources.funds,
      assets: heroResources.assets,
      debt: heroResources.debt,
      majorDebt: heroResources.majorDebt,
      manaByRoster: heroResources.manaByRoster,
      maxManaByRoster: heroResources.maxManaByRoster,
      levelByRoster: heroResources.levelByRoster,
      activated,
      introduced: heroCastState.introduced,
      present,
      inParty: heroCastState.inParty,
      clockPressure,
      worldClockAdvanceSuggestion: buildWorldClockAdvanceSuggestion(clockPressure),
      worldLocation: {
        layer: location.layer,
        site: location.site,
        // layerIndex：底锈=0 → 下街=1 → 中市=2 → 上庭=3（视觉上"向上爬升"）
        layerIndex: Math.max(0, ['THE_RUST', 'THE_STREET', 'THE_EXCHANGE', 'THE_COURT'].indexOf(location.layer)),
        label: (LOCATION_LAYER_META[location.layer] || LOCATION_LAYER_META.THE_STREET).label,
        english: (LOCATION_LAYER_META[location.layer] || LOCATION_LAYER_META.THE_STREET).english
      },
      worldClock: {
        day: clock.day,
        phase: clock.phase,
        phaseIndex: Math.max(0, WORLD_CLOCK_SLOTS.indexOf(clock.phase))
      }
    };
  }

  function applyReserveGrowthToAct(actState, config, nodeIndex) {
    const moduleResult = runActModuleMethod('applyReserveGrowthToAct', actState, config, nodeIndex);
    if (moduleResult.ok) return;
  }

  function clearLimitedActTokens(actState) {
    const moduleResult = runActModuleMethod('clearLimitedActTokens', actState);
    if (moduleResult.ok) return;
  }

  function resetActPhaseSlots(actState, phaseIndex = 0) {
    const moduleResult = runActModuleMethod('resetActPhaseSlots', actState, phaseIndex);
    if (moduleResult.ok) return;
  }

  function applyNodeRewardsToAct(actState, config, nodeId) {
    const moduleResult = runActModuleMethod('applyNodeRewardsToAct', actState, config, nodeId);
    if (moduleResult.ok) return;
  }

  function advanceActToNextNode(actState, config) {
    const moduleResult = runActModuleMethod('advanceActToNextNode', actState, config);
    if (moduleResult.ok) return moduleResult.value;
    return false;
  }

  function resolveActNodeTransition(actState, config) {
    const moduleResult = runActModuleMethod('resolveActNodeTransition', actState, config);
    if (moduleResult.ok) return moduleResult.value;
  }

  function consumeSingleActPhase(actState, heroState, config) {
    const moduleResult = runActModuleMethod('consumeSingleActPhase', actState, heroState, config);
    if (moduleResult.ok) return moduleResult.value;
  }

  // ========== 阶段 4：情节张力 Delta 表 ==========
  const TENSION_DELTA = {
    MESSAGE_TURN: 2,      // 每条 AI 回复
    BATTLE_RESULT: 15,    // ACE0_BATTLE 结算
    PHASE_ADVANCE: 25,    // 段位推进作为压力累积
    ROUTE_CHOICE: 10      // 路线选择
  };
  const CLOCK_PRESSURE_DELTA = {
    PHASE_ADVANCE: 25,    // 平均一节点（四相）≈ 一个时段建议值
    NODE_ADVANCE: 10
  };
  const FLOOR_PROGRESS_DELTA = {
    NARRATIVE_TENSION: 10,
    CLOCK_PRESSURE: 5
  };
  const CLOCK_ADVANCE_SUGGESTION_TIERS = [
    { min: 0, max: 30, level: 'none', hint: '当前世界时段仍可继续承载剧情。' },
    { min: 30, max: 60, level: 'weak', hint: '当前世界时段开始接近中段，可轻度考虑推进。' },
    { min: 60, max: 85, level: 'medium', hint: '当前世界时段已消耗较多，建议准备推进到下一时段。' },
    { min: 85, max: 101, level: 'strong', hint: '当前世界时段基本吃满，强烈建议推进到下一时段。' }
  ];

  async function adjustNarrativeTensionInternal(delta) {
    const eraVars = (typeof getEraVars === 'function' ? await getEraVars() : null) || {};
    const act = getWorldActState(eraVars);
    const current = Math.max(0, Math.min(100, Math.round(Number(act.narrativeTension) || 0)));
    const next = Math.max(0, Math.min(100, current + Math.round(Number(delta) || 0)));
    if (next === current) return next;
    await updateEraVars({
      world: {
        act: {
          ...act,
          narrativeTension: next
        }
      }
    });
    return next;
  }

  async function setNarrativeTensionInternal(value) {
    const eraVars = (typeof getEraVars === 'function' ? await getEraVars() : null) || {};
    const act = getWorldActState(eraVars);
    const v = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    await updateEraVars({
      world: {
        act: {
          ...act,
          narrativeTension: v
        }
      }
    });
    return v;
  }

  async function resetNarrativeTensionInternal() {
    return setNarrativeTensionInternal(0);
  }

  function getWorldClockPressure(eraVars) {
    const world = getWorldState(eraVars);
    return Math.max(0, Math.min(100, Math.round(Number(world?.clockPressure) || DEFAULT_WORLD_CLOCK_PRESSURE)));
  }

  function pickWorldClockAdvanceTier(pressure) {
    const value = Math.max(0, Math.min(100, Math.round(Number(pressure) || 0)));
    for (const tier of CLOCK_ADVANCE_SUGGESTION_TIERS) {
      if (value >= tier.min && value < tier.max) return tier;
    }
    return CLOCK_ADVANCE_SUGGESTION_TIERS[CLOCK_ADVANCE_SUGGESTION_TIERS.length - 1];
  }

  function buildWorldClockAdvanceSuggestion(pressure) {
    const value = Math.max(0, Math.min(100, Math.round(Number(pressure) || 0)));
    const tier = pickWorldClockAdvanceTier(value);
    return {
      pressure: value,
      level: tier.level,
      hint: tier.hint,
      shouldAdvance: tier.level === 'strong'
    };
  }

  async function adjustClockPressureInternal(delta) {
    const eraVars = (typeof getEraVars === 'function' ? await getEraVars() : null) || {};
    const current = getWorldClockPressure(eraVars);
    const next = Math.max(0, Math.min(100, current + Math.round(Number(delta) || 0)));
    if (next === current) return next;
    await updateEraVars({ world: { clockPressure: next } });
    return next;
  }

  async function setClockPressureInternal(value) {
    const next = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    await updateEraVars({ world: { clockPressure: next } });
    return next;
  }

  async function resetClockPressureInternal() {
    return setClockPressureInternal(0);
  }

  // 在段位推进前：将当前 nodeId×phaseIndex 的随机池抽签结果落到 actState.pickedPacks。
  function commitCurrentPhasePackUsage(actState, config) {
    const actModule = getActModuleApi();
    if (!actModule || typeof actModule.commitPackUsageForPhase !== 'function') return;
    if (actState.stage !== 'executing') return;
    const nodeId = Array.isArray(actState.route_history)
      ? actState.route_history[Math.max(0, (actState.nodeIndex || 1) - 1)]
      : null;
    if (!nodeId) return;
    const phaseIdx = Math.max(0, Math.min(3, Math.round(Number(actState.phase_index) || 0)));
    const narrative = (config && config.narrative) || null;
    try {
      actModule.commitPackUsageForPhase(actState, config, narrative, nodeId, phaseIdx);
    } catch (_) {}
  }

  function deriveWorldTimeFromAct(actState) {
    // 阶段2：ACT 不再为世界时间提供任何值。全部返回 null 表示"不覆盖"。
    const moduleResult = runActModuleMethod('deriveWorldTimeFromAct', actState);
    if (moduleResult.ok && moduleResult.value) return moduleResult.value;
    return { day: null, phase: null };
  }

  async function resolvePendingActAdvance(eraVars) {
    const world = getWorldState(eraVars);
    const hero = eraVars?.hero && typeof eraVars.hero === 'object'
      ? JSON.parse(JSON.stringify(eraVars.hero))
      : {};
    const act = getWorldActState(eraVars);
    const config = getActRuntimeConfig(act.id);
    if (!config) {
      return { eraVars, changed: false };
    }

    const requestedSteps = Math.max(0, Math.min(4, Math.round(Number(act.phase_advance) || 0)));
    let actState = JSON.parse(JSON.stringify(act));
    let nextHero = hero;
    let moduleAdvance = { ok: false };

    if (requestedSteps > 0) {
      moduleAdvance = runActModuleMethod('resolvePendingAdvanceState', act, hero, config);
      actState = moduleAdvance.ok && moduleAdvance.value?.actState
        ? moduleAdvance.value.actState
        : JSON.parse(JSON.stringify(act));
      nextHero = moduleAdvance.ok && moduleAdvance.value?.heroState
        ? moduleAdvance.value.heroState
        : hero;
    }

    if (act.transitionRequestTarget) {
      actState.transitionRequestTarget = act.transitionRequestTarget;
    }

    if (requestedSteps > 0 && !moduleAdvance.ok) {
      const stepCount = Math.max(0, Math.min(4, Math.round(Number(actState.phase_advance) || 0)));
      actState.phase_advance = 0;

      for (let index = 0; index < stepCount; index += 1) {
        // 先落存本段的抽签结果再推进（commit 是幂等的，已存不会重写）
        commitCurrentPhasePackUsage(actState, config);
        consumeSingleActPhase(actState, nextHero, config);
        // 段位推进一格，上一段的首见帧进入历史 → 清空缓冲，避免注入到下一段的 prompt。
        actState.pendingFirstMeet = {};
        if (actState.stage === 'complete') break;
        if (actState.stage === 'route' && actState.route_history.length < actState.nodeIndex + 1) break;
      }
    }

    // 阶段推进后的两套积分独立累计：
    // - narrativeTension 服务相位内收束，并在每次 phase_advance 结算后清零
    // - clockPressure 服务世界时钟推进建议
    let tensionDelta = 0;
    let clockPressureDelta = 0;
    if (requestedSteps > 0) {
      const advancedPhases = actState.nodeIndex > act.nodeIndex
        ? Math.max(0, (4 - act.phase_index) + actState.phase_index)
        : Math.max(0, actState.phase_index - act.phase_index);
      tensionDelta += advancedPhases * TENSION_DELTA.PHASE_ADVANCE;
      clockPressureDelta += advancedPhases * CLOCK_PRESSURE_DELTA.PHASE_ADVANCE;
    }
    if (act.stage !== 'route' && actState.stage === 'route') {
      tensionDelta += TENSION_DELTA.ROUTE_CHOICE;
    }
    if (actState.nodeIndex > act.nodeIndex) {
      clockPressureDelta += CLOCK_PRESSURE_DELTA.NODE_ADVANCE;
    }
    if (requestedSteps > 0) {
      actState.narrativeTension = 0;
    } else if (tensionDelta !== 0) {
      const cur = Math.max(0, Math.min(100, Math.round(Number(actState.narrativeTension) || 0)));
      actState.narrativeTension = Math.max(0, Math.min(100, cur + tensionDelta));
    }
    const nextClockPressure = clockPressureDelta !== 0
      ? Math.max(0, Math.min(100, getWorldClockPressure(eraVars) + clockPressureDelta))
      : getWorldClockPressure(eraVars);

    // 首见帧兜底清空：无论 module 路径还是 fallback，只要推进后坐标（node:phase:stage）有变化，
    // 上一段的 pendingFirstMeet 都应进入历史、不带进下一段。
    const prevCoord = `${act?.nodeIndex}:${act?.phase_index}:${act?.stage}`;
    const nextCoord = `${actState?.nodeIndex}:${actState?.phase_index}:${actState?.stage}`;
    if (prevCoord !== nextCoord) {
      actState.pendingFirstMeet = {};
    }

    const completionTransition = maybeResolveActCompletionTransition(actState, nextHero, world);
    if (completionTransition.transitioned) {
      actState = completionTransition.actState;
    } else if (completionTransition.changed) {
      actState = completionTransition.actState;
    }

    const stateChanged = requestedSteps > 0
      || completionTransition.transitioned === true
      || completionTransition.changed === true;
    if (!stateChanged && nextClockPressure === getWorldClockPressure(eraVars)) {
      return { eraVars, changed: false };
    }

    // 阶段2：ACT 推进不再触及 world.current_time（世界时钟完全独立）。
    // 若需推进时钟，调用 ACE0Plugin.advanceWorldClock() 或直接写 world.current_time。
    await updateEraVars({
      hero: {
        funds: nextHero.funds,
        roster: nextHero.roster && typeof nextHero.roster === 'object'
          ? nextHero.roster
          : {
              [HERO_INTERNAL_KEY]: getRosterNode(nextHero, HERO_INTERNAL_KEY)
            }
      },
      world: {
        clockPressure: nextClockPressure,
        act: actState
      }
    });

    return {
      eraVars: {
        ...(eraVars || {}),
        hero: nextHero,
        world: {
          ...(world || {}),
          clockPressure: nextClockPressure,
          act: actState
        }
      },
      changed: true
    };
  }

  async function applyFloorProgressDelta(messageId, message) {
    const mk = String(messageId ?? '');
    if (!mk) return;
    if (lastHandledMk === mk) return;
    const msg = message && typeof message === 'object' ? message : {};
    if (msg.role !== 'assistant') return;
    lastHandledMk = mk;
    try {
      await adjustNarrativeTensionInternal(FLOOR_PROGRESS_DELTA.NARRATIVE_TENSION);
    } catch (_) {}
    try {
      await adjustClockPressureInternal(FLOOR_PROGRESS_DELTA.CLOCK_PRESSURE);
    } catch (_) {}
  }

  async function advanceWorldClock(steps) {
    const eraVars = (typeof getEraVars === 'function' ? await getEraVars() : null) || {};
    const current = getWorldClock(eraVars);
    const next = advanceWorldClockState(current, steps == null ? 1 : steps);
    const changed = next.day !== current.day || next.phase !== current.phase;
    const hero = getHeroState(eraVars);
    const phaseSteps = changed ? getForwardWorldClockPhaseSteps(current, next) : 0;
    const nextDebt = changed
      ? applyDebtInterest(hero?.debt, phaseSteps, DEBT_INTEREST_RATE_PER_PHASE)
      : _normalizeFundsAmount(hero?.debt);
    const nextMajorDebt = changed
      ? applyDebtInterest(hero?.majorDebt, phaseSteps, MAJOR_DEBT_INTEREST_RATE_PER_PHASE)
      : _normalizeFundsAmount(hero?.majorDebt);
    await updateEraVars({
      ...(changed ? {
        hero: {
          debt: nextDebt,
          majorDebt: nextMajorDebt
        }
      } : {}),
      world: {
        current_time: next,
        ...(changed ? { clockPressure: 0 } : {})
      }
    });
    return next;
  }

  async function setWorldClock(input) {
    const eraVars = (typeof getEraVars === 'function' ? await getEraVars() : null) || {};
    const current = getWorldClock(eraVars);
    const next = normalizeWorldClock(input);
    const changed = next.day !== current.day || next.phase !== current.phase;
    const hero = getHeroState(eraVars);
    const phaseSteps = changed ? getForwardWorldClockPhaseSteps(current, next) : 0;
    const nextDebt = phaseSteps > 0
      ? applyDebtInterest(hero?.debt, phaseSteps, DEBT_INTEREST_RATE_PER_PHASE)
      : _normalizeFundsAmount(hero?.debt);
    const nextMajorDebt = phaseSteps > 0
      ? applyDebtInterest(hero?.majorDebt, phaseSteps, MAJOR_DEBT_INTEREST_RATE_PER_PHASE)
      : _normalizeFundsAmount(hero?.majorDebt);
    await updateEraVars({
      ...(phaseSteps > 0 ? {
        hero: {
          debt: nextDebt,
          majorDebt: nextMajorDebt
        }
      } : {}),
      world: {
        current_time: next,
        ...(changed ? { clockPressure: 0 } : {})
      }
    });
    return next;
  }

  function areActSnapshotsEqual(before, after) {
    if (!before || !after) return false;
    return JSON.stringify(before) === JSON.stringify(after);
  }

  function getArrayDiff(nextValues, prevValues) {
    const previous = new Set(Array.isArray(prevValues) ? prevValues : []);
    return (Array.isArray(nextValues) ? nextValues : []).filter(value => !previous.has(value));
  }

  function getActResultType(before, after) {
    if (!before || !after) return '';
    if (after.nodeIndex > before.nodeIndex) return 'node_advance';
    if (after.phaseIndex > before.phaseIndex || after.stage !== before.stage) return 'phase_advance';
    return '';
  }

  function diffNumberMap(beforeMap, afterMap) {
    const before = (beforeMap && typeof beforeMap === 'object') ? beforeMap : {};
    const after = (afterMap && typeof afterMap === 'object') ? afterMap : {};
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const delta = {};
    for (const key of keys) {
      const diff = (Number(after[key]) || 0) - (Number(before[key]) || 0);
      if (diff !== 0) delta[key] = diff;
    }
    return delta;
  }

  function diffManaByRoster(beforeMap, afterMap) {
    return diffNumberMap(beforeMap, afterMap);
  }

  function diffStringArray(beforeValues, afterValues) {
    const previous = new Set(Array.isArray(beforeValues) ? beforeValues : []);
    return (Array.isArray(afterValues) ? afterValues : []).filter(value => !previous.has(value));
  }

  function parseUpdateVariableJsonPatch(content) {
    const text = typeof content === 'string' ? content : '';
    if (!text.includes('<UpdateVariable>') || !text.includes('<JSONPatch>')) return [];
    const match = text.match(/<JSONPatch>\s*([\s\S]*?)\s*<\/JSONPatch>/i);
    if (!match) return [];
    try {
      const parsed = JSON.parse(match[1].trim());
      return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object') : [];
    } catch (_) {
      return [];
    }
  }

  function extractTransitionRequestTargetFromPatches(patches) {
    const items = Array.isArray(patches) ? patches : [];
    for (const patch of items) {
      if (!patch || typeof patch !== 'object') continue;
      if (String(patch.path || '').trim() !== '/world/act/transitionRequestTarget') continue;
      return typeof patch.value === 'string' ? patch.value.trim() : '';
    }
    return null;
  }

  function isRelationshipPatchPath(path) {
    const normalizedPath = typeof path === 'string' ? path.trim() : '';
    return normalizedPath.startsWith('/hero/relationship/');
  }

  function getNonRelationshipPatchesFromContent(content) {
    return parseUpdateVariableJsonPatch(content).filter(patch => !isRelationshipPatchPath(patch.path));
  }

  function hasNonRelationshipVariableUpdate(content) {
    return getNonRelationshipPatchesFromContent(content).length > 0;
  }

  function buildStateUpdateSummary(before, after, changedPaths = []) {
    const summaryParts = [];
    if (Number(after.funds) !== Number(before.funds)) summaryParts.push('资金已结算。');
    if (Number(after.assets) !== Number(before.assets)) summaryParts.push('资产状态已更新。');
    if (Number(after.debt) !== Number(before.debt)) summaryParts.push('普通债务已更新。');
    if (Number(after.majorDebt) !== Number(before.majorDebt)) summaryParts.push('主线大债已更新。');
    if (Object.keys(diffManaByRoster(before.manaByRoster, after.manaByRoster)).length) summaryParts.push('法力状态已更新。');
    if (Object.keys(diffNumberMap(before.levelByRoster, after.levelByRoster)).length) summaryParts.push('队伍等级已更新。');
    if (Object.keys(diffNumberMap(before.maxManaByRoster, after.maxManaByRoster)).length) summaryParts.push('法力上限已更新。');
    if (diffStringArray(before.activated, after.activated).length) summaryParts.push('角色激活状态已更新。');
    if (diffStringArray(before.introduced, after.introduced).length) summaryParts.push('角色登场记录已更新。');
    if (JSON.stringify(before.present || []) !== JSON.stringify(after.present || [])) summaryParts.push('同场角色已更新。');
    if (diffStringArray(before.inParty, after.inParty).length) summaryParts.push('同行队伍已更新。');
    if ((before.worldLocation?.layer || '') !== (after.worldLocation?.layer || '') || (before.worldLocation?.site || '') !== (after.worldLocation?.site || '')) {
      summaryParts.push('场景位置已更新。');
    }
    if ((before.worldClock?.day || 0) !== (after.worldClock?.day || 0) || (before.worldClock?.phase || '') !== (after.worldClock?.phase || '')) {
      summaryParts.push('世界时间已更新。');
    }
    if (!summaryParts.length && changedPaths.length) summaryParts.push('世界状态已更新。');
    return summaryParts.join(' ');
  }

  function buildActResultSummary(resultType, before, after, changedPaths = []) {
    if (resultType === 'node_advance') {
      // 注：act.nodeIndex 是节点序列索引，此处展示为 NODE，不造成与世界日混淆。
      if (after.stage === 'planning') {
        return `NODE ${String(after.nodeIndex).padStart(2, '0')} started. Planner reopened.`;
      }
      if (after.stage === 'route') {
        return `NODE ${String(after.nodeIndex).padStart(2, '0')} reached route selection.`;
      }
      return `NODE ${String(after.nodeIndex).padStart(2, '0')} started.`;
    }

    if (after.stage === 'planning') {
      return `${ACT_PHASE_LABELS[Math.max(0, Math.min(3, before.phaseIndex))] || 'PHASE'} completed. Planner reopened.`;
    }
    if (after.stage === 'route') {
      return `Phase execution completed. Route choice required.`;
    }
    if (resultType === 'state_update') {
      return buildStateUpdateSummary(before, after, changedPaths);
    }
    return `${ACT_PHASE_LABELS[Math.max(0, Math.min(3, after.phaseIndex - 1))] || 'PHASE'} advanced.`;
  }

  function buildActResultPayload(before, after, options = {}) {
    const changedPaths = Array.isArray(options.changedPaths) ? options.changedPaths.filter(Boolean) : [];
    const shouldForceStateUpdate = options.forceStateUpdate === true;
    const resultType = getActResultType(before, after) || (shouldForceStateUpdate ? 'state_update' : '');
    if (!resultType) return null;

    const advancedPhases = after.nodeIndex > before.nodeIndex
      ? Math.max(0, (4 - before.phaseIndex) + after.phaseIndex)
      : Math.max(0, after.phaseIndex - before.phaseIndex);
    const limitedDelta = ACT_RESOURCE_KEYS.reduce((acc, key) => {
      acc[key] = after.limited[key] - before.limited[key];
      return acc;
    }, {});
    const reserveDelta = ACT_RESOURCE_KEYS.reduce((acc, key) => {
      acc[key] = after.reserve[key] - before.reserve[key];
      return acc;
    }, {});

    // stage=route 时收集路线选项 + 展示名，便于结算卡 HTML 渲染可点击按钮。
    // 选项上限通常 ≤ 3，payload 体积可忽略。
    let routeOptions = [];
    const routeOptionLabels = {};
    if (after.stage === 'route') {
      const actIdForLookup = (after.id || before.id || null);
      const config = actIdForLookup ? getActRuntimeConfig(actIdForLookup) : null;
      const curNodeRuntime = config ? getActNodeRuntime(config, after.currentNodeId) : null;
      const transition = curNodeRuntime?.next || { mode: 'none' };
      if (transition.mode === 'choice' && Array.isArray(transition.options)) {
        routeOptions = transition.options.filter(id => typeof id === 'string' && id.trim());
      } else if (transition.mode === 'forced' && typeof transition.nodeId === 'string') {
        routeOptions = [transition.nodeId];
      }
      for (const optId of routeOptions) {
        const optRuntime = config ? getActNodeRuntime(config, optId) : null;
        const uiLabel = optRuntime?.ui?.label;
        const narrativeTitle = optRuntime?.narrative?.title;
        const narrativeSubtitle = optRuntime?.narrative?.subtitle;
        routeOptionLabels[optId] = {
          label: typeof uiLabel === 'string' && uiLabel.trim() ? uiLabel : optId,
          subtitle: typeof narrativeSubtitle === 'string' && narrativeSubtitle.trim()
            ? narrativeSubtitle
            : (typeof narrativeTitle === 'string' ? narrativeTitle : '')
        };
      }
    }

    return {
      type: resultType,
      fromNodeIndex: before.nodeIndex,
      toNodeIndex: after.nodeIndex,
      fromPhaseIndex: before.phaseIndex,
      toPhaseIndex: after.phaseIndex,
      fromStage: before.stage,
      toStage: after.stage,
      fromNode: before.currentNodeId,
      toNode: after.currentNodeId,
      needsPlanning: after.stage === 'planning',
      needsRouteChoice: after.stage === 'route',
      nextAction: after.stage === 'route'
        ? 'choose_route'
        : (after.stage === 'planning' ? 'plan_node' : 'continue'),
      advancedPhases,
      routeChanged: JSON.stringify(before.routeHistory) !== JSON.stringify(after.routeHistory),
      routeHistory: after.routeHistory,
      routeOptions,
      routeOptionLabels,
      worldClockPressure: Math.max(0, Math.min(100, Math.round(Number(after.clockPressure) || 0))),
      worldClockAdvanceSuggestion: after.worldClockAdvanceSuggestion || null,
      // 世界时钟四相信息（与节点轨完全解耦）。结算卡上段展示 DAY + 晨/昼/暮/夜。
      worldClock: after.worldClock || null,
      worldLocation: after.worldLocation || null,
      fromWorldLocation: before.worldLocation || null,
      // 四层地理变动标志（底锈/下街/中市/上庭）
      worldLayerShifted: !!(
        before.worldLocation && after.worldLocation &&
        (before.worldLocation.layer !== after.worldLocation.layer ||
         (before.worldLocation.site || '') !== (after.worldLocation.site || ''))
      ),
      changedPaths,
      fundsDelta: Math.round((after.funds - before.funds) * 100) / 100,
      assetsDelta: Math.round((after.assets - before.assets) * 100) / 100,
      debtDelta: Math.round((after.debt - before.debt) * 100) / 100,
      majorDebtDelta: Math.round((after.majorDebt - before.majorDebt) * 100) / 100,
      manaDelta: diffManaByRoster(before.manaByRoster, after.manaByRoster),
      limitedDelta,
      reserveDelta,
      activated: getArrayDiff(after.activated, before.activated),
      present: after.present,
      summary: buildActResultSummary(resultType, before, after, changedPaths)
    };
  }

  function buildActResultTag(resultPayload) {
    if (!resultPayload) return '';
    return `<${ACT_RESULT_TAG}>\n${JSON.stringify(resultPayload)}\n</${ACT_RESULT_TAG}>`;
  }

  async function buildPendingActResult(content = '', eraVars = null) {
    const currentVars = eraVars || await getEraVars();
    const resolvedAdvance = await resolvePendingActAdvance(currentVars);
    const syncedState = await synchronizeActCharacterState(resolvedAdvance.eraVars);
    const nextSnapshot = createActRuntimeSnapshot(syncedState.eraVars, syncedState.derived);
    const changedPatches = getNonRelationshipPatchesFromContent(content);
    const changedPaths = changedPatches
      .map(patch => typeof patch.path === 'string' ? patch.path.trim() : '')
      .filter(Boolean);
    const shouldForceStateUpdate = changedPaths.length > 0;
    if (!pendingActBaselineSnapshot || !nextSnapshot) {
      pendingActBaselineSnapshot = nextSnapshot;
      return { payload: null, eraVars: syncedState.eraVars, snapshot: nextSnapshot };
    }

    if (areActSnapshotsEqual(pendingActBaselineSnapshot, nextSnapshot) && !shouldForceStateUpdate) {
      pendingActBaselineSnapshot = nextSnapshot;
      return { payload: null, eraVars: syncedState.eraVars, snapshot: nextSnapshot };
    }

    const payload = buildActResultPayload(pendingActBaselineSnapshot, nextSnapshot, {
      forceStateUpdate: shouldForceStateUpdate,
      changedPaths
    });
    pendingActBaselineSnapshot = nextSnapshot;
    return { payload, eraVars: syncedState.eraVars, snapshot: nextSnapshot };
  }

  async function appendActResultIfNeeded(content, options = {}) {
    const baseContent = typeof content === 'string' ? content : '';
    if (!baseContent.trim()) return { content: baseContent, changed: false, payload: null };
    if (baseContent.includes(`<${ACT_RESULT_TAG}>`)) return { content: baseContent, changed: false, payload: null };

    const built = await buildPendingActResult(baseContent, options.eraVars || null);
    if (!built.payload) {
      return { content: baseContent, changed: false, payload: null };
    }

    const nextContent = `${baseContent.trim()}\n\n${buildActResultTag(built.payload)}`;
    return { content: nextContent, changed: true, payload: built.payload };
  }

  /**
   * 生成前：读取 MVU 变量 → 注入 hero 状态摘要到 AI 上下文
   */
  async function handleGenerationBefore() {
    try {
      const expansionPromptState = getExpansionPromptStateStore();

      try {
        uninjectPrompts([
          PRIMARY_CONTEXT_INJECT_ID,
          HERO_INJECT_ID,
          REL_STATE_INJECT_ID,
          ACT_STATE_INJECT_ID,
          ACT_CHARTER_INJECT_ID,
          ACT_NARRATIVE_INJECT_ID,
          ACT_TRANSITION_INJECT_ID,
          ACT_PACING_INJECT_ID,
          // 首见帧注入 id 必须每轮清理：本轮若 pending 空（楼层已前进/被闸门清掉），
          // 不会再 push 新 first_meet prompt；若这里不 uninject 旧注入，
          // 酒馆会保留上轮的 first_meet 记录形成幽灵残留。
          ACT_FIRST_MEET_INJECT_ID,
          WORLD_CONTEXT_INJECT_ID,
          LOCATION_DOC_INJECT_ID,
          ...Object.values(CHAR_DOC_INJECT_IDS),
          ...expansionPromptState.ids
        ]);
      } catch (_) { /* ignore */ }

      const syncedState = await synchronizeActCharacterState(await getEraVars());
      const eraVars = syncedState.eraVars;
      const currentWorldClock = getWorldClock(eraVars);
      if (lastObservedWorldClock && !isSameWorldClock(lastObservedWorldClock, currentWorldClock)) {
        if (getWorldClockPressure(eraVars) !== 0) {
          await updateEraVars({ world: { clockPressure: 0 } });
          if (eraVars.world && typeof eraVars.world === 'object') {
            eraVars.world.clockPressure = 0;
          }
        }
      }
      lastObservedWorldClock = { day: currentWorldClock.day, phase: currentWorldClock.phase };
      pendingActBaselineSnapshot = createActRuntimeSnapshot(eraVars, syncedState.derived);
      const heroSummary = buildHeroSummary(eraVars);
      const relationState = buildRelationshipStateSummary(eraVars);
      const worldContext = buildWorldContextSummary(eraVars);
      const locationDoc = buildLocationDocSummary(eraVars);
      // 首见帧楼层闸门：通过 chat.length 判断楼层是否前进。
      // - 当前 chat.length > 上次注入时的值 → 玩家已发新人物消息 → 清空 pending
      // - 相同或更小 → 同一楼层的 swipe / edit / regen → 保留 pending 复用
      // 这让首见帧的生命 = "一次 AI 楼层的完整畁股期"，而不是整个段位。
      try {
        const ctx = (typeof getContext === 'function') ? getContext() : null;
        const currentChatLen = Array.isArray(ctx?.chat) ? ctx.chat.length : -1;
        if (
          currentChatLen >= 0 &&
          lastFirstMeetInjectChatLen >= 0 &&
          currentChatLen > lastFirstMeetInjectChatLen &&
          eraVars?.world?.act?.pendingFirstMeet &&
          Object.keys(eraVars.world.act.pendingFirstMeet).length > 0
        ) {
          await updateEraVars({ world: { act: { pendingFirstMeet: {} } } });
          if (eraVars.world && eraVars.world.act) {
            eraVars.world.act.pendingFirstMeet = {};
          }
        }
      } catch (_) { /* chat 不可取时降级：保留 pending */ }

      const firstMeetHintsForTurn = (eraVars?.world?.act?.pendingFirstMeet && typeof eraVars.world.act.pendingFirstMeet === 'object')
        ? eraVars.world.act.pendingFirstMeet
        : {};
      const firstMeetKeysForTurn = Object.keys(firstMeetHintsForTurn);

      // 记录本次注入时的 chat.length，供下一次 prompt 构造比对。
      if (firstMeetKeysForTurn.length > 0) {
        try {
          const ctx = (typeof getContext === 'function') ? getContext() : null;
          const currentChatLen = Array.isArray(ctx?.chat) ? ctx.chat.length : -1;
          if (currentChatLen >= 0) lastFirstMeetInjectChatLen = currentChatLen;
        } catch (_) {}
      }
      const charDocPrompts = await buildCharacterPromptInjections(eraVars, firstMeetKeysForTurn);
      const actNarrativePrompts = buildActNarrativePrompts(eraVars, syncedState.derived, firstMeetHintsForTurn);
      const expansionPrompts = buildExpansionPromptInjections(eraVars);
      const prompts = [];
      const primaryContextContent = [
        worldContext,
        heroSummary,
        relationState
      ].filter(content => typeof content === 'string' && content.trim()).join('\n\n');

      if (primaryContextContent) {
        prompts.push({
          id: PRIMARY_CONTEXT_INJECT_ID,
          position: 'in_chat',
          depth: 1,
          role: 'system',
          content: primaryContextContent,
          should_scan: false
        });
      }

      if (locationDoc) {
        prompts.push({
          id: LOCATION_DOC_INJECT_ID,
          position: 'in_chat',
          depth: 2,
          role: 'system',
          content: locationDoc,
          should_scan: false
        });
      }

      prompts.push(...actNarrativePrompts);
      prompts.push(...charDocPrompts);
      prompts.push(...expansionPrompts);

      if (prompts.length <= 0) {
        console.warn(`${PLUGIN_NAME} 没有可注入 prompt，跳过`);
        return;
      }

      const normalizedPrompts = prompts.map(prompt => ({
        ...prompt,
        content: replaceHeroPromptMacro(prompt.content)
      }));

      expansionPromptState.ids = expansionPrompts.map(prompt => prompt.id);

      injectPrompts(normalizedPrompts);
      const hasPendingTransitionPrompt = normalizedPrompts.some((prompt) => prompt.id === ACT_TRANSITION_INJECT_ID);
      if (hasPendingTransitionPrompt) {
        await updateEraVars({ world: { act: { pendingTransitionPrompt: '' } } });
        if (eraVars?.world?.act && typeof eraVars.world.act === 'object') {
          eraVars.world.act.pendingTransitionPrompt = '';
        }
      }
      console.log(`${PLUGIN_NAME} world/location/hero/relationship/character docs 已注入 AI 上下文`);
    } catch (e) {
      console.error(`${PLUGIN_NAME} 注入失败:`, e);
    }
  }

  // ==========================================================
  //  B. 解析 AI 输出中的 <ACE0_BATTLE> 标签
  // ==========================================================

  /**
   * 从消息文本中提取 <ACE0_BATTLE> JSON
   * @param {string} content - 消息正文
   * @returns {object|null} - 解析后的战局 JSON
   */
  function parseAiBattleOutput(content) {
    // 预处理：移除 AI 思考过程标签（think / planning）内的所有内容
    // 这些标签内的内容不应被解析为战局数据
    let cleanedContent = content;
    cleanedContent = cleanedContent.replace(/[\s\S]*<\/think>/gi, '');
    cleanedContent = cleanedContent.replace(/[\s\S]*<\/planning>/gi, '');

    const regex = new RegExp(`<${BATTLE_TAG}>([\\s\\S]*?)<\\/${BATTLE_TAG}>`, 'i');
    const match = cleanedContent.match(regex);
    if (!match) return null;

    let raw = match[1].trim();

    // AI 经常用 markdown 代码块包裹 JSON，需要剥离
    // 处理: ```json ... ``` 或 ``` ... ```
    raw = raw.replace(/^```[\w]*\s*/i, '').replace(/\s*```$/i, '');

    // 剥离散落的反引号
    raw = raw.replace(/^`+|`+$/g, '');

    // 提取第一个 { 到最后一个 } 之间的内容（兜底）
    const braceStart = raw.indexOf('{');
    const braceEnd = raw.lastIndexOf('}');
    if (braceStart >= 0 && braceEnd > braceStart) {
      raw = raw.substring(braceStart, braceEnd + 1);
    }

    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`${PLUGIN_NAME} 解析 ${BATTLE_TAG} JSON 失败:`, e);
      console.warn(`${PLUGIN_NAME} 原始内容:`, raw.substring(0, 200));
      return null;
    }
  }

  // ==========================================================
  //  C. 注入 <ACE0_FRONTEND> 到消息
  //
  //  MVU 时序问题：
  //    MVU 在变量更新后总是调用 setChatMessages 重写消息内容，
  //    如果我们在其之前或之后单独调用 setChatMessages，
  //    内容会被 MVU 覆盖或产生竞争。
  //
  //  双事件策略：
  //    1. mag_before_message_update
  //       → 优选路径：AI 同时输出了 <UpdateVariable> 时触发，
  //         直接修改 event.message_content，由 MVU 统一写入。
  //    2. CHARACTER_MESSAGE_RENDERED
  //       → 兆底路径：MVU 完成所有 setChatMessages 写入后触发，
  //         检查消息是否已包含 FRONTEND，若未包含则注入。
  //         此时 MVU 已完成，不会再覆盖。
  // ==========================================================

  /**
   * 核心处理逻辑：解析 <ACE0_BATTLE> 并构建 game-config
   * @param {string} content - 消息内容
   * @returns {{ content: string, config: object } | null}
   */
  async function processBattleContent(content) {
    // 解析 AI 输出的战局 JSON
    const rawBattleData = parseAiBattleOutput(content);
    if (!rawBattleData) {
      console.warn(`${PLUGIN_NAME} 无法解析战局数据`);
      return null;
    }

    // NPC 组装流水线：runner/kernel/直写 → 统一 seat config
    const aiBattleData = resolveBattleData(rawBattleData);

    // 读取 MVU 变量
    const eraVars = await getEraVars();

    // 构建完整 game-config（MVU hero 数据 + AI 战局数据）
    const completeConfig = buildCompleteGameConfig(eraVars, aiBattleData);

    // 追加 <ACE0_FRONTEND>
    const frontendPayload = `<${FRONTEND_TAG}>\n${JSON.stringify(completeConfig)}\n</${FRONTEND_TAG}>`;
    const newContent = content.trim() + '\n\n' + frontendPayload;

    return { content: newContent, config: completeConfig };
  }

  // ==========================================================
  //  D-1. 优选路径：mag_before_message_update
  //       AI 输出了 <UpdateVariable> 时触发，修改 event.message_content
  // ==========================================================

  async function handleBeforeMessageUpdate(event) {
    let content = event?.message_content || '';
    let changed = false;
    const transitionRequestTarget = extractTransitionRequestTargetFromPatches(parseUpdateVariableJsonPatch(content));
    if (transitionRequestTarget !== null) {
      latchedTransitionRequestTarget = transitionRequestTarget;
    }

    // Battle 处理（原就逻辑）
    if (content.includes(`<${BATTLE_TAG}>`) && !content.includes(`<${FRONTEND_TAG}>`)) {
      try {
        console.log(`${PLUGIN_NAME} [before_message_update] 检测到 ${BATTLE_TAG}，处理中...`);
        const result = await processBattleContent(content);
        if (result) {
          content = result.content;
          changed = true;
          // 阶段 4：每次 Battle 成功结算 +15 tension
          try { await adjustNarrativeTensionInternal(TENSION_DELTA.BATTLE_RESULT); } catch (_) {}
          console.log(`${PLUGIN_NAME} [before_message_update] 游戏前端已注入 (+${TENSION_DELTA.BATTLE_RESULT} tension)`);
        }
      } catch (e) {
        console.error(`${PLUGIN_NAME} [before_message_update] 处理失败:`, e);
      }
    }

    if (changed) {
      event.message_content = content;
    }
  }

  // ==========================================================
  //  D-2. 兆底路径：CHARACTER_MESSAGE_RENDERED
  //       MVU 完成所有写入后触发，检查并补注入
  // ==========================================================

  async function handleMessageRendered(messageId, options = {}) {
    if (isProcessing) return;

    try {
      const messages = getChatMessages(messageId);
      if (!messages || messages.length === 0) return;

      const msg = messages[0];
      if (options.applyFloorProgress === true) {
        await applyFloorProgressDelta(messageId, msg);
      }
      const content = msg.message || '';
      let nextContent = content;
      let changed = false;

      isProcessing = true;

      if (nextContent.includes(`<${BATTLE_TAG}>`) && !nextContent.includes(`<${FRONTEND_TAG}>`)) {
        console.log(`${PLUGIN_NAME} [rendered_fallback] 检测到未处理的 ${BATTLE_TAG}，补注入...`);
        const battleResult = await processBattleContent(nextContent);
        if (battleResult) {
          nextContent = battleResult.content;
          changed = true;
          try { await adjustNarrativeTensionInternal(TENSION_DELTA.BATTLE_RESULT); } catch (_) {}
        }
      }

      const actResult = await appendActResultIfNeeded(nextContent);
      if (actResult.changed) {
        nextContent = actResult.content;
        changed = true;
        console.log(`${PLUGIN_NAME} [rendered_fallback] ACT 结算回执已注入到消息 #${messageId}`);
      }

      if (changed) {
        await setChatMessages([{
          message_id: messageId,
          message: nextContent
        }], { refresh: 'affected' });
      }

      isProcessing = false;
    } catch (e) {
      console.error(`${PLUGIN_NAME} [rendered_fallback] 处理失败:`, e);
      isProcessing = false;
    }
  }

  // ==========================================================
  //  E+F. 资金结算 + 入队补全 → 已迁移到 acezero-schema.js
  //  由 MVU-zod schema 的 .transform() 自动处理
  //  reconcileFunds: funds_up/funds_down → hero.funds（归零）
  //  cast/roster 补全：在 schema transform 中自动处理
  // ==========================================================

  // ==========================================================
  //  事件绑定
  // ==========================================================

  function resetState(reason) {
    console.log(`${PLUGIN_NAME} ${reason} -> 重置状态`);
    lastHandledMk = null;
    isProcessing = false;
    pendingActBaselineSnapshot = null;
    lastFirstMeetInjectChatLen = -1;
    latchedTransitionRequestTarget = '';
  }

  eventOn('CHAT_CHANGED', () => resetState('切换对话'));
  eventOn('message_swiped', async (messageId) => {
    resetState('消息重骰');
    setTimeout(() => handleMessageRendered(messageId, { applyFloorProgress: false }), 1500);
  });
  eventOn('message_edited', async (messageId) => {
    resetState('消息编辑');
    setTimeout(() => handleMessageRendered(messageId, { applyFloorProgress: false }), 1500);
  });
  // message_updated 不监听 — 太频繁（MVU 每次 setChatMessages 都触发）
  // 手动编辑后的重注入已由 message_edited 覆盖

  // 生成前：注入 hero 状态摘要
  eventOn('GENERATION_AFTER_COMMANDS', async () => {
    await handleGenerationBefore();
  });

  // 优选路径：MVU 消息更新前拦截（AI 同时输出 UpdateVariable 时）
  //   修改 event.message_content，由 MVU 统一写入
  eventOn('mag_before_message_update', async (event) => {
    await handleBeforeMessageUpdate(event);
  });

  // 兜底路径 A：消息渲染完成后检查
  eventOn('character_message_rendered', async (messageId) => {
    await handleMessageRendered(messageId, { applyFloorProgress: true });
  });

  // 兜底路径 B：消息接收后延迟检查（等 MVU 处理完）
  eventOn('message_received', async (messageId) => {
    setTimeout(() => handleMessageRendered(messageId, { applyFloorProgress: false }), 1500);
  });

  // ==========================================================
  //  扫描并注入：遍历所有消息，为有 ACE0_BATTLE 但无 ACE0_FRONTEND 的消息补注入
  // ==========================================================

  async function scanAndInject() {
    const lastId = getLastMessageId();
    let injected = 0;
    for (let i = lastId; i >= 0; i--) {
      try {
        const messages = getChatMessages(i);
        if (!messages || messages.length === 0) continue;
        const msg = messages[0];
        const content = msg.message || '';
        if (!content.includes(`<${BATTLE_TAG}>`)) continue;
        if (content.includes(`<${FRONTEND_TAG}>`)) continue;

        console.log(`${PLUGIN_NAME} [scan] 消息 #${i} 需要注入`);
        const result = await processBattleContent(content);
        if (result) {
          await setChatMessages([{
            message_id: i,
            message: result.content
          }], { refresh: 'affected' });
          injected++;
          console.log(`${PLUGIN_NAME} [scan] 消息 #${i} 注入完成`);
        }
      } catch (e) {
        console.error(`${PLUGIN_NAME} [scan] 消息 #${i} 处理失败:`, e);
      }
    }
    console.log(`${PLUGIN_NAME} [scan] 扫描完成，共注入 ${injected} 条消息`);
    return injected;
  }

  // ==========================================================
  //  全局 API
  // ==========================================================

  const hostRoot = getAce0HostRoot();
  installActModuleHostBridge();

  hostRoot.ACE0Plugin = {
    getEraVars,

    getDefaultActState(actId) {
      return getActDefaultStateFromModule(actId);
    },

    normalizeActState(rawActState) {
      const actModule = getActModuleApi();
      if (!actModule || typeof actModule.normalizeActState !== 'function') return null;
      try {
        return actModule.normalizeActState(rawActState);
      } catch (error) {
        console.warn('[ACE0 ACT] ACE0Plugin.normalizeActState failed:', error);
        return null;
      }
    },

    createFrontendSnapshot(options) {
      const actModule = getActModuleApi();
      if (!actModule || typeof actModule.createFrontendSnapshot !== 'function') return null;
      try {
        return actModule.createFrontendSnapshot(options);
      } catch (error) {
        console.warn('[ACE0 ACT] ACE0Plugin.createFrontendSnapshot failed:', error);
        return null;
      }
    },

    async syncActState() {
      const result = await synchronizeActCharacterState(await getEraVars());
      return {
        changed: result.changed,
        derived: result.derived
      };
    },

    // 路线选择 API：由结算卡 / Dashboard / 外部 UI 调用。
    // 只在 stage=route 且 nodeId 为合法下一节点时生效，避免误触。
    // 返回 { ok, reason?, nextNodeIndex?, nextNodeId? }。
    async chooseActRoute(nodeId) {
      const targetNodeId = typeof nodeId === 'string' ? nodeId.trim() : '';
      if (!targetNodeId) return { ok: false, reason: 'invalid_node_id' };

      const eraVars = await getEraVars();
      const act = getWorldActState(eraVars);
      if (act.stage !== 'route') return { ok: false, reason: 'not_in_route_stage' };

      const config = getActRuntimeConfig(act.id);
      if (!config) return { ok: false, reason: 'no_chapter_config' };

      const currentNodeId = act.route_history[act.nodeIndex - 1];
      const currentNodeRuntime = getActNodeRuntime(config, currentNodeId);
      const transition = currentNodeRuntime?.next || { mode: 'none' };
      const jumpOptionsResult = act.vision?.jumpReady === true
        ? runActModuleMethod('getJumpRouteOptions', config, act)
        : { ok: false, value: [] };
      const jumpOptions = jumpOptionsResult.ok && Array.isArray(jumpOptionsResult.value)
        ? jumpOptionsResult.value
        : [];
      const isJumpRoute = jumpOptions.includes(targetNodeId);
      const allowed = isJumpRoute
        ? jumpOptions
        : transition.mode === 'choice' && Array.isArray(transition.options)
        ? transition.options
        : (transition.mode === 'forced' && typeof transition.nodeId === 'string' ? [transition.nodeId] : []);
      if (!allowed.includes(targetNodeId)) {
        return { ok: false, reason: 'node_not_allowed' };
      }

      // 等价于 act-plugin 里 forced 分支的两步：先 push 再 advance。
      // 幂等：已经 push 过就不再 push，防抖（比如双击）。
      const actState = JSON.parse(JSON.stringify(act));
      if (actState.route_history.length < actState.nodeIndex + 1) {
        actState.route_history.push(targetNodeId);
      }
      const advanced = advanceActToNextNode(actState, config);
      if (!advanced) {
        // advanceActToNextNode 在 route_history 长度不够时会返回 false —— 上面已补，理论上不该到
        return { ok: false, reason: 'advance_failed' };
      }
      if (isJumpRoute) {
        actState.vision = normalizeActVisionState(actState.vision);
        actState.vision.jumpReady = false;
        actState.vision.bonusSight = 0;
        actState.vision.pendingReplace = null;
      }
      // 节点切换 = 坐标变化，上一节点遗留的首见帧进入历史。清空避免污染下一节点 prompt。
      actState.pendingFirstMeet = {};

      await updateEraVars({ world: { act: actState } });
      return {
        ok: true,
        nextNodeIndex: actState.nodeIndex,
        nextNodeId: actState.route_history[actState.nodeIndex - 1] || null
      };
    },

    async getActStateSummary() {
      const result = await synchronizeActCharacterState(await getEraVars());
      return buildActStateSummary(result.eraVars, result.derived);
    },

    async getGameConfig() {
      const vars = await getEraVars();
      return buildCompleteGameConfig(vars, {});
    },

    getExpansionRegistry,

    async getExpansionSummary() {
      const vars = await getEraVars();
      const registry = getExpansionRegistry();
      const installed = registry && typeof registry.getInstalled === 'function'
        ? registry.getInstalled()
        : [];
      const active = registry && typeof registry.getActive === 'function'
        ? registry.getActive(vars)
        : [];

      return {
        installed: installed.map(expansion => expansion.id),
        active: active.map(expansion => expansion.id),
        state: vars?.world?.expansion_state || { activeMajor: '', activeLight: [] }
      };
    },

    async inspectActiveExpansionModules() {
      const vars = await getEraVars();
      const registry = getExpansionRegistry();
      if (!registry || typeof registry.collectHookEntries !== 'function') {
        return {
          state: vars?.world?.expansion_state || { activeMajor: '', activeLight: [] },
          prompts: [],
          dashboard: [],
          schema: [],
          characters: [],
          battle: []
        };
      }

      return {
        state: vars?.world?.expansion_state || { activeMajor: '', activeLight: [] },
        prompts: registry.collectPromptInjections({ eraVars: vars }),
        dashboard: registry.collectHookEntries('dashboard', { eraVars: vars }),
        schema: registry.collectHookEntries('schema', { eraVars: vars }),
        characters: registry.collectHookEntries('characters', { eraVars: vars }),
        battle: registry.collectHookEntries('battle', { eraVars: vars })
      };
    },

    async setActiveMajorExpansion(expansionId) {
      const normalizedId = typeof expansionId === 'string' ? expansionId.trim() : '';
      await updateEraVars({
        world: {
          expansion_state: {
            activeMajor: normalizedId
          }
        }
      });
      return true;
    },

    // 扫描所有消息，为有 ACE0_BATTLE 但无 ACE0_FRONTEND 的消息补注入
    scanAndInject,

    // 手动触发战局（支持 character/runner/kernel/直写四种格式）
    async triggerBattle(rawBattleData) {
      const eraVars = await getEraVars();
      const resolved = resolveBattleData(rawBattleData);
      const completeConfig = buildCompleteGameConfig(eraVars, resolved);

      const frontendPayload = `<${FRONTEND_TAG}>\n${JSON.stringify(completeConfig)}\n</${FRONTEND_TAG}>`;
      await createChatMessages([{
        role: 'assistant',
        message: frontendPayload
      }]);

      return completeConfig;
    },

    // 获取主角在队角色列表（从 MVU 变量，按 cast.inParty 过滤）
    async getHeroCharacters() {
      const vars = await getEraVars();
      if (!vars || !vars.hero) return [];
      return _getHeroCharNames(vars.hero).map(name => ({
        name,
        ...getCastNode(vars.hero, name),
        ...getRosterNode(vars.hero, name)
      }));
    },

    // 获取完整队伍花名册（含未入队角色）
    async getPartyRoster() {
      const vars = await getEraVars();
      if (!vars || !vars.hero) return [];
      return _getPartyRoster(vars.hero);
    },

    async setCharacterState(charKey, patch) {
      const key = String(charKey || '').toUpperCase();
      if (!NON_PLAYER_CHARACTER_KEYS.includes(key)) {
        console.warn(`${PLUGIN_NAME} 未知角色: ${charKey}`);
        return false;
      }

      const normalizedPatch = { ...(patch || {}) };
      if (normalizedPatch.present === true) {
        normalizedPatch.activated = true;
        normalizedPatch.introduced = true;
      }
      if (normalizedPatch.inParty === true) {
        normalizedPatch.activated = true;
        normalizedPatch.introduced = true;
      }
      if (normalizedPatch.miniKnown === true) {
        normalizedPatch.activated = true;
      }

      await updateEraVars({
        hero: {
          cast: {
            [key]: normalizedPatch
          }
        }
      });

      return true;
    },

    async introduceCharacter(charKey, options = {}) {
      return this.setCharacterState(charKey, {
        activated: true,
        introduced: true,
        present: options.present ?? true
      });
    },

    async setCharacterPresent(charKey, present) {
      if (present) {
        return this.setCharacterState(charKey, {
          activated: true,
          introduced: true,
          present: true
        });
      }
      return this.setCharacterState(charKey, { present: false });
    },

    async setCharacterActivated(charKey, activated) {
      return this.setCharacterState(charKey, {
        activated: !!activated
      });
    },

    async setCharacterMiniKnown(charKey, miniKnown = true) {
      return this.setCharacterState(charKey, {
        activated: !!miniKnown,
        miniKnown: !!miniKnown
      });
    },

    async addCharacterToParty(charKey, options = {}) {
      const key = String(charKey || '').toUpperCase();
      if (!NON_PLAYER_CHARACTER_KEYS.includes(key)) {
        console.warn(`${PLUGIN_NAME} 未知角色: ${charKey}`);
        return false;
      }

      const vars = await getEraVars();
      const hero = vars?.hero || {};
      const roster = getHeroRoster(hero);
      const patch = {
        activated: true,
        introduced: true,
        inParty: true
      };

      if (typeof options.present === 'boolean') patch.present = options.present;

      const heroPatch = {
        cast: {
          [key]: patch
        }
      };

      if (!roster[key]) {
        heroPatch.roster = {
          [key]: {
            level: 1,
            mana: 40,
            maxMana: 40
          }
        };
      }

      await updateEraVars({ hero: heroPatch });
      return true;
    },

    async removeCharacterFromParty(charKey) {
      return this.setCharacterState(charKey, {
        inParty: false
      });
    },

    CHARACTER_PROMPT_DOCS,
    getCharacterPromptDoc,

    clearFullDocCache() {
      fullDocWorldbookCache = null;
      fullDocWorldbookNameLoaded = null;
      return true;
    },

    async debugCharacterPrompt(charKey) {
      const vars = await getEraVars();
      const hero = vars?.hero || {};
      const key = String(charKey || '').toUpperCase();
      return await getCharacterPromptDoc(key, getCastNode(hero, key));
    },

    // NPC 组装
    assembleNPC,
    assembleFromRunner,
    assembleNamedNPC,
    resolveBattleData,

    // 三维度配置表
    NPC: {
      AI_KERNELS,
      RPG_TEMPLATES,
      MOOD_MODIFIERS,
      RUNNER_PRESETS,
      NAMED_NPC_PRESETS
    },

    // 角色档案
    CHARACTERS: NAMED_CHARACTERS,

    // 原有表
    TABLES: {
      UNIVERSAL_SKILLS,
      VANGUARD_TRAIT: VANGUARD_TRAIT_UNLOCK,
      REARGUARD_TRAIT: REARGUARD_TRAIT_UNLOCK,
      VANGUARD_ATTRS: VANGUARD_ATTRS_BY_LEVEL,
      REARGUARD_ATTRS: REARGUARD_ATTRS_BY_LEVEL,
      MANA: MANA_BY_LEVEL
    },

    deriveSkillsFromAttrs,
    getCharAttrs,
    getCharTrait,

    // 阶段 4：情节张力 API
    adjustNarrativeTension(delta) { return adjustNarrativeTensionInternal(delta); },
    setNarrativeTension(v) { return setNarrativeTensionInternal(v); },
    resetNarrativeTension() { return resetNarrativeTensionInternal(); },
    async getNarrativeTension() {
      const eraVars = (typeof getEraVars === 'function' ? await getEraVars() : null) || {};
      const act = getWorldActState(eraVars);
      return Math.max(0, Math.min(100, Math.round(Number(act.narrativeTension) || 0)));
    },
    TENSION_DELTA: Object.assign({}, TENSION_DELTA),
    adjustClockPressure(delta) { return adjustClockPressureInternal(delta); },
    setClockPressure(v) { return setClockPressureInternal(v); },
    resetClockPressure() { return resetClockPressureInternal(); },
    async getClockPressure() {
      const eraVars = (typeof getEraVars === 'function' ? await getEraVars() : null) || {};
      return getWorldClockPressure(eraVars);
    },
    async getWorldClockAdvanceSuggestion() {
      const eraVars = (typeof getEraVars === 'function' ? await getEraVars() : null) || {};
      return buildWorldClockAdvanceSuggestion(getWorldClockPressure(eraVars));
    },
    CLOCK_PRESSURE_DELTA: Object.assign({}, CLOCK_PRESSURE_DELTA),
    CLOCK_ADVANCE_SUGGESTION_TIERS: JSON.parse(JSON.stringify(CLOCK_ADVANCE_SUGGESTION_TIERS)),
    DEBT_INTEREST_RATE_PER_PHASE,
    MAJOR_DEBT_INTEREST_RATE_PER_PHASE,

    // 独立世界时钟（与 ACT 节点完全解耦）
    WORLD_CLOCK_SLOTS,
    getWorldClock() {
      return (async () => {
        const eraVars = (typeof getEraVars === 'function' ? await getEraVars() : null) || {};
        return getWorldClock(eraVars);
      })();
    },
    advanceWorldClock,
    setWorldClock,

    version: '0.9.5'
  };

  window.ACE0Plugin = hostRoot.ACE0Plugin;

  // ==========================================================
  //  初始化完成
  // ==========================================================

  console.log(`${PLUGIN_NAME} 插件加载完成 (v0.9.2 MVU-zod)`);
  console.log(`${PLUGIN_NAME} NPC 组装: kernel=${Object.keys(AI_KERNELS).join('/')} | archetype=${Object.keys(RPG_TEMPLATES).join('/')} | mood=${Object.keys(MOOD_MODIFIERS).join('/')}`);
  console.log(`${PLUGIN_NAME} 专属角色: ${Object.keys(NAMED_CHARACTERS).join(', ')} | NPC预设: ${Object.keys(NAMED_NPC_PRESETS).join(', ')}`);
  console.log(`${PLUGIN_NAME} 跑龙套: ${Object.keys(RUNNER_PRESETS).join(', ')}`);
  console.log(`${PLUGIN_NAME} 流程: AI 输出 <${BATTLE_TAG}> → NPC组装 → 合并 MVU hero → 注入 <${FRONTEND_TAG}> → ST 正则 → STver.html`);
  console.log(`${PLUGIN_NAME} 事件: mag_before_message_update(优选) + character_message_rendered/message_received(兜底)`);
  console.log(`${PLUGIN_NAME} 调试: ACE0Plugin.scanAndInject() — 扫描全部消息补注入`);

})();
