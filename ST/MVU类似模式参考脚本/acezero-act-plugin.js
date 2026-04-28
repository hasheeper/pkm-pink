(function initAceZeroActPlugin(global) {
  'use strict';

  const MODULE_NAMESPACE = 'ACE0Modules';
  const MODULE_KEY = 'act';
  const DEFAULT_CHAPTER_ID = 'chapter0_exchange';
  const ACT_STAGE_VALUES = ['planning', 'executing', 'route', 'complete'];
  // 节点内四段（处理槽），与世界时间（晨昼暮夜）解耦
  const ACT_PHASE_LABELS = ['一段', '二段', '三段', '四段'];
  const ACT_RESOURCE_KEYS = ['combat', 'rest', 'asset', 'vision'];
  const ACT_RESOURCE_ALIASES = {
    contract: 'asset',
    event: 'vision'
  };
  const ACT_RESOURCE_TYPE_MAP = {
    combat: 'COMBAT',
    rest: 'REST',
    asset: 'ASSET',
    vision: 'VISION'
  };
  const ACT_RESOURCE_LABEL_MAP = {
    combat: '交锋',
    rest: '休整',
    asset: '资产',
    vision: '视野'
  };
  const SHARED_CAMPAIGN_SEED = 'ACEZERO-SHARD-SEED-V24';
  const NON_PLAYER_CHARACTER_KEYS = ['RINO', 'SIA', 'POPPY', 'VV', 'TRIXIE', 'COTA', 'EULALIA', 'KAKO', 'KUZUHA'];
  const ENCOUNTER_CHARACTER_KEYS = ['SIA', 'TRIXIE', 'POPPY', 'COTA', 'VV', 'KUZUHA', 'KAKO', 'EULALIA'];
  const ENCOUNTER_CHARACTER_STATUS_VALUES = ['locked', 'eligible', 'queued', 'pre_signal', 'first_meet', 'introduced'];
  const ENCOUNTER_QUEUE_STATUS_VALUES = ['queued', 'placed', 'triggered', 'expired', 'cancelled'];
  const ENCOUNTER_QUEUE_TYPE_VALUES = ['first_meet', 'pre_signal'];
  const ENCOUNTER_TERMINAL_QUEUE_STATUSES = ['triggered', 'expired', 'cancelled'];
  const ENCOUNTER_RULES = {
    SIA: {
      category: 'condition',
      minDay: 3,
      minNodeIndex: 5,
      spentWeights: { combat: 2, rest: 1, asset: 1, vision: 2 },
      minSpentScore: 15,
      laneWeights: ['mid_low', 'low', 'mid_high', 'high'],
      rarity: 2,
      debugLabel: 'SIA / anomaly audit',
      firstMeetHint: 'SIA 首次在主角视野里具象化。她不是旧识，也不是熟络同伴；她带着管理局式的冷静，把当前异常行动纳入审视。'
    },
    TRIXIE: {
      category: 'condition',
      minDay: 3,
      minNodeIndex: 7,
      spentWeights: { combat: 5, rest: 0, asset: 0, vision: 1 },
      minSpentScore: 35,
      crisisMin: 26,
      laneWeights: ['low', 'mid_low', 'mid_high', 'high'],
      rarity: 4,
      debugLabel: 'TRIXIE / crisis noise',
      firstMeetHint: 'TRIXIE 首次在主角视野里出现。她像从混乱规则的缝里钻出来，不要写成早已认识的玩笑伙伴。'
    },
    POPPY: {
      category: 'geo',
      minNodeIndex: 4,
      minFunds: 51,
      requiredGeo: 'THE_RUST',
      laneWeights: ['mid_low', 'low', 'mid_high', 'high'],
      rarity: 1,
      debugLabel: 'POPPY / rust contact',
      firstMeetHint: 'POPPY 首次在主角视野里出现。她属于底层生态，不是旧识；她的出现应像玩家踩进了她的活动范围。'
    },
    COTA: {
      category: 'geo',
      minNodeIndex: 4,
      requiredTags: ['赌场', 'casino', 'gambling hall', '赌桌', '荷官'],
      laneWeights: ['mid_high', 'high', 'low', 'mid_low'],
      rarity: 1,
      debugLabel: 'COTA / table contact',
      firstMeetHint: 'COTA 首次在主角视野里出现。她依附赌场、赌桌或荷官场景，不要写成已经熟悉的联系人。'
    },
    VV: {
      category: 'hybrid',
      minDay: 4,
      minNodeIndex: 9,
      minFunds: 2501,
      spentWeights: { combat: 1, rest: 2, asset: 3, vision: 2 },
      minSpentScore: 45,
      crisisMin: 26,
      laneWeights: ['mid_high', 'high', 'mid_low', 'low'],
      preSignalPreferred: true,
      rarity: 3,
      debugLabel: 'VV / asset signal',
      firstMeetHint: 'VV 首次在主角视野里出现。她以估值、套利与风险的方式看人，不要写成旧交或熟络商谈。'
    },
    KUZUHA: {
      category: 'hybrid',
      minDay: 3,
      minNodeIndex: 7,
      requiredGeo: 'THE_RUST',
      requiredIntroduced: ['POPPY'],
      spentWeights: { combat: 2, rest: 2, asset: 1, vision: 2 },
      minSpentScore: 30,
      laneWeights: ['mid_low', 'low', 'high', 'mid_high'],
      rarity: 3,
      debugLabel: 'KUZUHA / rust order',
      firstMeetHint: 'KUZUHA 首次在主角视野里出现。她代表底层秩序与地盘规矩，不要写成已加入队伍的熟人。'
    },
    KAKO: {
      category: 'hybrid',
      minDay: 4,
      minNodeIndex: 10,
      requiredIntroduced: ['SIA'],
      spentWeights: { combat: 4, rest: 1, asset: 1, vision: 3 },
      minSpentScore: 50,
      crisisMin: 36,
      laneWeights: ['mid_low', 'mid_high', 'high', 'low'],
      rarity: 4,
      debugLabel: 'KAKO / audit escalation',
      firstMeetHint: 'KAKO 首次在主角视野里出现。她是管理局审计升级的具象化，不要写成 SIA 之外的既有熟人。'
    },
    EULALIA: {
      category: 'hybrid',
      minDay: 5,
      minNodeIndex: 11,
      spentWeights: { combat: 1, rest: 4, asset: 1, vision: 2 },
      minSpentScore: 60,
      requiresChurchEvent: true,
      laneWeights: ['high', 'mid_high', 'mid_low', 'low'],
      rarity: 5,
      debugLabel: 'EULALIA / church signal',
      firstMeetHint: 'EULALIA 首次在主角视野里出现。她必须带着教廷事件的包裹感，不要裸刷成普通路人。'
    }
  };

  const DEFAULT_WORLD_ACT = {
    id: DEFAULT_CHAPTER_ID,
    seed: 'AUTO',
    // 节点序列索引（1..totalNodes）——与世界时钟 world.current_time 无关
    nodeIndex: 1,
    // 随机池消耗记录：{ [nodeId]: { [phaseIndex]: candidateId } }
    pickedPacks: {},
    route_history: [],
    limited: {
      combat: 0,
      rest: 0,
      asset: 0,
      vision: 0
    },
    reserve: {
      combat: 0,
      rest: 0,
      asset: 0,
      vision: 0
    },
    reserve_progress: {
      combat: 0,
      rest: 0,
      asset: 0,
      vision: 0
    },
    income_rate: {
      combat: 0.2,
      rest: 0.2,
      asset: 0.2,
      vision: 0.2
    },
    income_progress: {
      combat: 0,
      rest: 0,
      asset: 0,
      vision: 0
    },
    phase_slots: [null, null, null, null],
    phase_index: 0,
    phase_advance: 0,
    stage: 'executing',
    controlledNodes: {},
    crisis: 0,
    crisisSignals: [],
    vision: {
      baseSight: 1,
      bonusSight: 0,
      jumpReady: false,
      pendingReplace: null
    },
    resourceSpent: {
      combat: 0,
      rest: 0,
      asset: 0,
      vision: 0
    },
    characterEncounter: {},
    pendingFirstMeet: {},
    pendingResolutions: [],
    resolutionHistory: [],
    narrativeTension: 0
  };

const PROLOGUE_EXCHANGE_CHAPTER = {
  id: 'chapter0_exchange',
  meta: {
    title: '命运 · FATE SPREAD',
    totalNodes: 16
  },

  runtime: {
    seed: SHARED_CAMPAIGN_SEED,
    rules: {
      requireScheduleAllLimited: true,
      reserveGrowthTiming: 'end_of_node'
    },
    initialState: {
      seed: SHARED_CAMPAIGN_SEED,
      route_history: ['node1-entry'],
      stage: 'executing'
    },
    generatedTail: {
      enabled: true,
      mode: 'lane_backbone',
      attachFromNodeIds: ['node3-descent'],
      startNodeIndex: 4,
      totalNodes: 16,
      laneNodeIndex: {
        opening: 4,
        fullLaneStart: 5,
        fullLaneEnd: 14,
        collapse: 15,
        finale: 16
      }
    },
    reserveGrowthByNode: [],
    managedCharacters: ['RINO', 'COTA'],
    initialCast: {
      activate: ['RINO'],
      introduce: ['RINO'],
      present: ['RINO'],
      joinParty: ['RINO'],
      miniKnown: ['COTA']
    }
  },

  nodes: {
    'node1-entry': {
      id: 'node1-entry',
      nodeIndex: 1,
      kind: 'vision',
      key: 'vision',
      ui: {
        label: 'NODE_01',
        subtitle: 'ENTRY NIGHT'
      },
      rewards: { vision: 1, combat: 1 },
      planner: {
        limited: []
      },
      next: {
        mode: 'choice',
        options: ['node2-floor-high', 'node2-floor-side']
      },
      cast: {
        onEnter: {
          present: ['RINO']
        }
      },
      narrative: {
        title: 'ENTRY NIGHT',
        subtitle: '进场弄钱',
        overview: '{{user}} 和 RINO 还在中市，但手里快没钱了。这节的任务就是进赌场，而且目的很明确：必须赢钱，越多越好。',
        guidance: '交代开场。写清楚中市赌场的环境长什么样，以及两人今晚就是来弄钱的，禁止牵扯其他剧情。'
      },
      phases: [
        {
          index: 0,
          slot: 'vision',
          fixed: true,
          cast: { present: ['RINO'] },
          event: {
            id: 'entry_target',
            title: '节点1 · 一段 · 今晚的目标',
            direction: '从赌场外或者刚进门的地方开始。让 RINO 交代今晚的任务：必须赢一笔能接着用的本钱，不然明天连站在这层的资格都没了。说完就带 {{user}} 进场。',
            castDirective: '主角 / RINO。',
            mustEnd: '要赢钱的目标讲明白，然后进赌场，必须发生在中市层。'
          }
        },
        {
          index: 1,
          slot: null,
          fixed: false
        },
        {
          index: 2,
          slot: null,
          fixed: false
        },
        {
          index: 3,
          slot: null,
          fixed: false
        }
      ]
    },

    'node2-floor-high': {
      id: 'node2-floor-high',
      nodeIndex: 2,
      kind: 'random',
      key: 'random',
      ui: {
        label: 'NODE_02_A',
        subtitle: 'HOT FLOOR'
      },
      rewards: { combat: 1, vision: 1 },
      planner: {
        limited: []
      },
      next: { mode: 'forced', nodeId: 'node3-descent' },
      cast: {
        onEnter: {
          present: ['RINO']
        }
      },
      narrative: {
        title: 'HOT FLOOR',
        subtitle: '上桌连赢',
        overview: 'RINO 带着 {{user}} 在赌场里换着桌子玩。主打德州，中间穿插小游戏。RINO 负责看桌子、算钱、催进度。',
        guidance: '真打牌赢钱。不要让 RINO 要算账、挑肥点的人下手，剧情主要围着赢钱转。'
      },
      phases: [
        {
          index: 0,
          slot: null,
          fixed: false
        },
        {
          index: 1,
          slot: null,
          fixed: false
        },
        {
          index: 2,
          slot: null,
          fixed: false
        },
        {
          index: 3,
          slot: null,
          fixed: false
        }
      ]
    },

    'node2-floor-side': {
      id: 'node2-floor-side',
      nodeIndex: 2,
      kind: 'random',
      key: 'random',
      ui: {
        label: 'NODE_02_B',
        subtitle: 'SIDE MACHINES'
      },
      rewards: { vision: 1, combat: 1 },
      planner: {
        limited: []
      },
      next: { mode: 'forced', nodeId: 'node3-descent' },
      cast: {
        onEnter: {
          present: ['RINO']
        }
      },
      narrative: {
        title: 'SIDE MACHINES',
        subtitle: '小游戏区',
        overview: 'RINO 没有一头扎进最热的大桌，而是带着 {{user}} 先从侧厅、小游戏区和更容易快进快出的台子里捞钱。',
        guidance: '把这一条写得更像“小游戏区”的快节奏路线。节奏相对快，RINO 会根据台子状态和人群热度不断换位置。'
      },
      phases: [
        {
          index: 0,
          slot: null,
          fixed: false
        },
        {
          index: 1,
          slot: null,
          fixed: false
        },
        {
          index: 2,
          slot: null,
          fixed: false
        },
        {
          index: 3,
          slot: null,
          fixed: false
        }
      ]
    },

    'node3-descent': {
      id: 'node3-descent',
      nodeIndex: 3,
      kind: 'vision',
      key: 'vision',
      ui: {
        label: 'NODE_03',
        subtitle: 'LAST RECEIPT'
      },
      rewards: { vision: 1 },
      planner: {
        limited: []
      },
      next: { mode: 'none' },
      cast: {
        onEnter: {
          present: ['RINO']
        }
      },
      narrative: {
        title: 'LAST RECEIPT',
        subtitle: '算账走人',
        overview: '到此为止手上应该有一定启动资金了，接下来不该继续困在中市里，而是顺着这笔钱往更深处走。',
      },
      phases: [
        {
          index: 0,
          slot: null,
          fixed: false
        },
        {
          index: 1,
          slot: null,
          fixed: false
        },
        {
          index: 2,
          slot: 'vision',
          fixed: true,
          cast: { present: ['RINO'] },
          event: {
            id: 'descent_drop',
            title: '节点3 · 三段 · 往下走',
            direction: '把场景放在散场后的柜台、走廊或者门口。RINO 清点刚才赢的钱，发现中市太贵，各种名目的杂费和规矩很快就能把这笔钱扣完。她直接决定离开中市，让 {{user}} 跟着她往下层走。',
            castDirective: '主角 / RINO。',
            mustEnd: '写完两人决定去下层并开始离开的经过，后续沿着下行路线继续推进。'
          }
        },
        {
          index: 3,
          slot: null,
          fixed: false
        }
      ]
    }
  },

  narrative: {
    title: 'EXCHANGE NIGHT',
    charter: {
      theme: '两人今晚在中市赌场，任务就是上桌弄一笔起步金。环境是金碧辉煌但处处要收钱的高级赌城。',
      ironLaws: [
        '德州扑克和小游戏要有具体的对局过程。',
        'RINO 负责带路挑桌，她清楚留下来的花销很高。'
      ],
      successCriterion: '赢到起步金，并顺着离开中市后的路线继续向下推进。',
      bounds: {
        focus: '赌桌对决、RINO 的本色发挥以及筹码的变化。',
        forbid: [
          '牵扯任何大阴谋或拯救世界',
          '让其他主要角色出场',
          '跑到中市外面去'
        ],
        closeWhen: [
          '玩过德州和小游戏',
          '手里的钱变多了',
          '离开中市的路线真正跑起来了'
        ]
      }
    },

    stageGuides: {
      executing: '按 [命运事件] 写这一段。RINO 得一直在场。只有当事情真的有进展，比如真的赢了钱、真的弄清了花费、真的定了去哪，才推进进度；如果只是瞎聊或者没变化，就不要推进，继续写。到了结局就果断收尾，不往下多写。',
      route: '初章前半段在第二节点进入赌场路线分支；后半段会进入由种子生成的后续路径。若进入 route，只在当前节点给出的候选路径里选定一路继续写。',
      complete: '初章完成时，必须收在整条 16 节点路线的最终收束点上。'
    },

    phaseGuides: {
      combat: {
        summary: '德州段',
        candidates: [
          {
            id: 'combat_exchange_clerks',
            weight: 2,
            direction: '中市职员桌：对面是刚下班的交易员或柜台经理。写清楚赌场环境，接着按 <ACE0_BATTLE> 开打。',
            mustEnd: '让 {{user}} 在这张桌上顺利赢到钱。'
          },
          {
            id: 'combat_courier_shift',
            weight: 1,
            direction: '杂鱼桌：跑腿或者小掮客在休息。RINO 觉得好打，直接让 {{user}} 上，接着按 <ACE0_BATTLE> 开打。',
            mustEnd: '钱变多了，也让 RINO 的眼光得到验证。'
          },
          {
            id: 'combat_salon_side_table',
            weight: 1,
            direction: '常客桌：几个中市的常客在玩。RINO 把 {{user}} 推上桌，接着按 <ACE0_BATTLE> 开打。',
            mustEnd: '赢得很爽，也很干脆。'
          }
        ]
      },

      asset: {
        summary: '结算段',
        candidates: [
          {
            id: 'asset_room_extension',
            weight: 2,
            direction: '柜台账单：写服务员来确认相关的费用，让两人的花销直接标上数字。',
            mustEnd: '讲清楚继续留在这层有多贵。'
          },
          {
            id: 'asset_chip_hold',
            weight: 1,
            direction: '窗口手续：写换筹码要交的手续费或保证金，让 RINO 发现继续留在这层会一直掉钱。',
            mustEnd: '把花销的规矩落到眼前。'
          },
          {
            id: 'asset_day_pass',
            weight: 1,
            direction: '通行证规定：给他们看一份中市的短期停留规矩，说明待在这里条件很苛刻。',
            mustEnd: '讲明白中市待不下去的具体原因。'
          }
        ]
      },

      rest: {
        summary: '喘息段',
        candidates: [
          {
            id: 'rest_staff_coffee',
            weight: 2,
            direction: '咖啡机旁休息：站着喝口水。RINO 趁这个时间算算刚才赢了多少，下一步还差多少钱。',
            mustEnd: '喘口气，顺便清点一下钱。'
          },
          {
            id: 'rest_counting_corner',
            weight: 1,
            direction: '靠墙数钱：清点赢来的筹码和票据，讨论接下来拿这笔钱去哪。',
            mustEnd: '把钱和接下来的打算讲清楚。'
          },
          {
            id: 'rest_afterglow_walk',
            weight: 1,
            direction: '走廊休息：刚赢完有点放松，一边往外走，一边准备算接下来的账。',
            mustEnd: '给算账和离开做铺垫。'
          }
        ]
      },

      vision: {
        summary: '小游戏段',
        candidates: [
          {
            id: 'vision_dice_lane',
            weight: 2,
            direction: '小游戏区：去玩玩骰子、轮盘或者机器。玩法要爽，来钱要快。',
            mustEnd: '换换节奏，用小游戏快速赢一笔。'
          },
          {
            id: 'vision_bonus_machine',
            weight: 1,
            direction: '选机器：RINO 专门挑来钱快的机器让 {{user}} 玩。',
            mustEnd: '把 RINO 会看机器会挑选这一点写出来。'
          },
          {
            id: 'vision_crowd_heat',
            weight: 1,
            direction: '人多的热闹玩法：围观的多，赢的也快。让两人在人堆里赚一笔。',
            mustEnd: '把赌场热闹的部分和赢钱的感觉一起写出来。'
          }
        ]
      }
    }
  }
};

  function normalizeChapterConfig(chapterId, chapterConfig) {
    const runtimeConfig = chapterConfig.runtime && typeof chapterConfig.runtime === 'object'
      ? chapterConfig.runtime
      : {};
    const legacyInitialEffects = chapterConfig.initialEffects && typeof chapterConfig.initialEffects === 'object'
      ? chapterConfig.initialEffects
      : {};
    const runtimeInitialCast = runtimeConfig.initialCast && typeof runtimeConfig.initialCast === 'object'
      ? runtimeConfig.initialCast
      : {};
    const normalizedChapter = {
      id: chapterId,
      meta: deepClone(chapterConfig.meta || {}),
      totalNodes: Math.max(1, Math.round(Number(chapterConfig.totalNodes) || Number(chapterConfig.meta?.totalNodes) || 1)),
      runtime: {
        seed: normalizeTrimmedString(runtimeConfig.seed, DEFAULT_WORLD_ACT.seed),
        rules: normalizeRules(runtimeConfig.rules || chapterConfig.frontend?.campaign?.rules),
        initialState: normalizeChapterInitialState(chapterId, chapterConfig),
        completionTransition: normalizeCompletionTransition(runtimeConfig.completionTransition),
        generatedTail: normalizeGeneratedTailConfig(runtimeConfig.generatedTail, Math.max(1, Math.round(Number(chapterConfig.totalNodes) || Number(chapterConfig.meta?.totalNodes) || 1))),
        reserveGrowthByNode: Array.isArray(runtimeConfig.reserveGrowthByNode || chapterConfig.reserveGrowthByNode)
          ? (runtimeConfig.reserveGrowthByNode || chapterConfig.reserveGrowthByNode).map((value) => Math.max(0, Number(value) || 0))
          : [],
        managedCharacters: Array.isArray(runtimeConfig.managedCharacters || chapterConfig.managedCharacters)
          ? (runtimeConfig.managedCharacters || chapterConfig.managedCharacters).map((value) => normalizeTrimmedString(value, '')).filter(Boolean)
          : [],
        initialCast: {
          activate: normalizeActEffectList(runtimeInitialCast.activate || legacyInitialEffects.activate),
          introduce: normalizeActEffectList(runtimeInitialCast.introduce || legacyInitialEffects.introduce),
          present: normalizeActEffectList(runtimeInitialCast.present || legacyInitialEffects.present),
          miniKnown: normalizeActEffectList(runtimeInitialCast.miniKnown || runtimeInitialCast.mini_known),
          joinParty: normalizeActEffectList(
            runtimeInitialCast.joinParty
            || runtimeInitialCast.join_party
            || legacyInitialEffects.joinParty
            || legacyInitialEffects.join_party
          )
        }
      },
      nodes: deepClone(chapterConfig.nodes || {}),
      narrative: deepClone(chapterConfig.narrative || {}),
      frontend: deepClone(chapterConfig.frontend || {})
    };
    return applyGeneratedNodeTypesToChapter(buildGeneratedChapterTail(normalizedChapter));
  }

  const ACT_CHAPTERS = {
    chapter0_exchange: normalizeChapterConfig('chapter0_exchange', PROLOGUE_EXCHANGE_CHAPTER)
  };

  function ensureModuleNamespace() {
    if (!global[MODULE_NAMESPACE] || typeof global[MODULE_NAMESPACE] !== 'object') {
      global[MODULE_NAMESPACE] = {};
    }
    return global[MODULE_NAMESPACE];
  }

  function getModuleBridgeTargets() {
    const targets = [];
    const pushTarget = (candidate) => {
      if (!candidate || typeof candidate !== 'object') return;
      if (targets.includes(candidate)) return;
      targets.push(candidate);
    };

    pushTarget(global);

    try { pushTarget(globalThis); } catch (_) {}
    try {
      if (typeof window === 'object' && window) {
        pushTarget(window);
        if (window.parent && window.parent !== window) pushTarget(window.parent);
        if (window.top && window.top !== window) pushTarget(window.top);
      }
    } catch (_) {}

    return targets;
  }

  function installModuleBridge(moduleApi) {
    getModuleBridgeTargets().forEach((target) => {
      try {
        if (!target[MODULE_NAMESPACE] || typeof target[MODULE_NAMESPACE] !== 'object') {
          target[MODULE_NAMESPACE] = {};
        }
        target[MODULE_NAMESPACE][MODULE_KEY] = moduleApi;
      } catch (_) {}
    });
  }

  function deepClone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function isPlainObject(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
  }

  function mergePlainObjects(base, patch, blockedKeys = []) {
    if (!isPlainObject(patch)) return deepClone(base || {});
    const blocked = new Set(blockedKeys);
    const output = isPlainObject(base) ? deepClone(base) : {};
    Object.entries(patch).forEach(([key, value]) => {
      if (blocked.has(key)) return;
      if (isPlainObject(value) && isPlainObject(output[key])) {
        output[key] = mergePlainObjects(output[key], value, blockedKeys);
        return;
      }
      output[key] = deepClone(value);
    });
    return output;
  }

  function normalizeTrimmedString(value, fallback) {
    const normalized = typeof value === 'string' ? value.trim() : '';
    return normalized || fallback;
  }

  function normalizeActResourceKey(value, fallback = 'vision') {
    const normalized = normalizeTrimmedString(value, fallback).toLowerCase();
    const migrated = ACT_RESOURCE_ALIASES[normalized] || normalized;
    return ACT_RESOURCE_KEYS.includes(migrated) ? migrated : fallback;
  }

  function normalizeRules(value) {
    const source = value && typeof value === 'object' ? value : {};
    return {
      requireScheduleAllLimited: source.requireScheduleAllLimited !== false,
      reserveGrowthTiming: normalizeTrimmedString(source.reserveGrowthTiming, 'end_of_node')
    };
  }

  function normalizeGeneratedTailConfig(value, fallbackTotalNodes) {
    const source = value && typeof value === 'object' ? value : {};
    const enabled = source.enabled === true;
    const mode = normalizeTrimmedString(source.mode, 'motif').toLowerCase();
    const totalNodes = Math.max(1, Math.round(Number(source.totalNodes) || fallbackTotalNodes || 1));
    const startNodeIndex = Math.max(1, Math.min(totalNodes, Math.round(Number(source.startNodeIndex) || 1)));
    const attachFromNodeIds = Array.isArray(source.attachFromNodeIds)
      ? source.attachFromNodeIds.map((value) => normalizeTrimmedString(value, '')).filter(Boolean)
      : [];
    const expectedLayerCount = Math.max(0, totalNodes - startNodeIndex + 1);
    const rawSegmentSizes = Array.isArray(source.segmentSizes) ? source.segmentSizes : [];
    const segmentSizes = [];
    let remaining = expectedLayerCount;
    rawSegmentSizes.forEach((value) => {
      if (remaining <= 0) return;
      const size = Math.max(1, Math.round(Number(value) || 0));
      const normalized = Math.min(size, remaining);
      segmentSizes.push(normalized);
      remaining -= normalized;
    });
    while (remaining > 0) {
      const nextSize = Math.min(4, remaining);
      segmentSizes.push(nextSize);
      remaining -= nextSize;
    }

    const motifPoolBySizeSource = source.motifPoolBySize && typeof source.motifPoolBySize === 'object'
      ? source.motifPoolBySize
      : {};
    const motifPoolBySize = {};
    Object.entries(motifPoolBySizeSource).forEach(([sizeKey, pool]) => {
      const size = Math.max(1, Math.round(Number(sizeKey) || 0));
      if (!Array.isArray(pool) || !size) return;
      motifPoolBySize[size] = pool.map((value) => normalizeTrimmedString(value, '')).filter(Boolean);
    });
    const shapeProfiles = Array.isArray(source.shapeProfiles)
      ? source.shapeProfiles
        .map((profile) => {
          if (!profile || typeof profile !== 'object') return null;
          const motifs = Array.isArray(profile.motifs)
            ? profile.motifs.map((value) => normalizeTrimmedString(value, '')).filter(Boolean)
            : [];
          if (!motifs.length) return null;
          return {
            id: normalizeTrimmedString(profile.id, 'generated_profile'),
            motifs
          };
        })
        .filter(Boolean)
      : [];
    const laneNodeIndexSource = source.laneNodeIndex && typeof source.laneNodeIndex === 'object'
      ? source.laneNodeIndex
      : {};
    const laneNodeIndex = {
      opening: Math.max(startNodeIndex, Math.min(totalNodes, Math.round(Number(laneNodeIndexSource.opening) || startNodeIndex))),
      fullLaneStart: Math.max(startNodeIndex, Math.min(totalNodes, Math.round(Number(laneNodeIndexSource.fullLaneStart) || Math.max(startNodeIndex + 1, startNodeIndex)))),
      fullLaneEnd: Math.max(startNodeIndex, Math.min(totalNodes, Math.round(Number(laneNodeIndexSource.fullLaneEnd) || Math.max(startNodeIndex + 1, totalNodes - 2)))),
      collapse: Math.max(startNodeIndex, Math.min(totalNodes, Math.round(Number(laneNodeIndexSource.collapse) || Math.max(startNodeIndex + 1, totalNodes - 1)))),
      finale: Math.max(startNodeIndex, Math.min(totalNodes, Math.round(Number(laneNodeIndexSource.finale) || totalNodes)))
    };
    return {
      enabled,
      mode,
      attachFromNodeId: normalizeTrimmedString(source.attachFromNodeId, ''),
      attachFromNodeIds,
      startNodeIndex,
      totalNodes,
      segmentSizes,
      motifPoolBySize,
      shapeProfiles,
      laneNodeIndex
    };
  }

  function isGeneratedNodeTypeMarker(nodeRuntime) {
    if (!nodeRuntime || typeof nodeRuntime !== 'object') return false;
    const kind = normalizeTrimmedString(nodeRuntime.kind, '').toLowerCase();
    const key = normalizeTrimmedString(nodeRuntime.key, '').toLowerCase();
    return kind === 'random' || key === 'random';
  }

  function shuffleResourceTypeKeys(seedStr) {
    const keys = [...ACT_RESOURCE_KEYS];
    const rng = mulberry32(hashStringToSeed(seedStr));
    for (let index = keys.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rng() * (index + 1));
      [keys[index], keys[swapIndex]] = [keys[swapIndex], keys[index]];
    }
    return keys;
  }

  function applyGeneratedNodeTypesToChapter(chapterConfig) {
    if (!chapterConfig?.nodes || typeof chapterConfig.nodes !== 'object') return chapterConfig;
    const grouped = new Map();
    const chapterSeed = normalizeTrimmedString(chapterConfig?.runtime?.seed, DEFAULT_WORLD_ACT.seed);

    Object.entries(chapterConfig.nodes).forEach(([nodeId, nodeRuntime]) => {
      const nodeIndex = Math.max(1, Math.round(Number(nodeRuntime?.nodeIndex) || 1));
      if (!grouped.has(nodeIndex)) grouped.set(nodeIndex, []);
      grouped.get(nodeIndex).push([nodeId, nodeRuntime]);
    });

    grouped.forEach((entries, nodeIndex) => {
      const randomEntries = entries
        .filter(([, nodeRuntime]) => isGeneratedNodeTypeMarker(nodeRuntime))
        .sort((left, right) => getNodeSortWeight(left[1], 0) - getNodeSortWeight(right[1], 0) || left[0].localeCompare(right[0]));
      if (!randomEntries.length) return;

      const shuffledTypes = shuffleResourceTypeKeys(`${chapterSeed}|${nodeIndex}`);
      randomEntries.forEach(([nodeId], entryIndex) => {
        const targetNode = chapterConfig.nodes[nodeId];
        const generatedType = shuffledTypes[entryIndex % shuffledTypes.length] || 'vision';
        if (!targetNode || typeof targetNode !== 'object') return;
        if (normalizeTrimmedString(targetNode.kind, '').toLowerCase() === 'random') {
          targetNode.kind = generatedType;
        }
        if (normalizeTrimmedString(targetNode.key, '').toLowerCase() === 'random') {
          targetNode.key = generatedType;
        }
      });
    });

    return chapterConfig;
  }

  function getGeneratedTailMotifRegistry() {
    return {
      fan_arc: {
        id: 'fan_arc',
        size: 3,
        counts: [1, 2, 1],
        transitions: [
          [[0, 1]],
          [[0], [0]]
        ]
      },
      double_offset: {
        id: 'double_offset',
        size: 3,
        counts: [2, 2, 1],
        transitions: [
          [[0], [0, 1]],
          [[0], [0]]
        ]
      },
      tri_shear: {
        id: 'tri_shear',
        size: 3,
        counts: [1, 2, 2],
        transitions: [
          [[0, 1]],
          [[0], [0, 1]]
        ]
      },
      late_split: {
        id: 'late_split',
        size: 3,
        counts: [1, 1, 2],
        transitions: [
          [[0]],
          [[0, 1]]
        ]
      },
      stagger_fork: {
        id: 'stagger_fork',
        size: 3,
        counts: [2, 1, 2],
        transitions: [
          [[0], [0]],
          [[0, 1]]
        ]
      },
      double_hold: {
        id: 'double_hold',
        size: 3,
        counts: [2, 2, 2],
        transitions: [
          [[0], [0, 1]],
          [[0, 1], [1]]
        ]
      },
      double_keep: {
        id: 'double_keep',
        size: 3,
        counts: [2, 2, 2],
        transitions: [
          [[0], [1]],
          [[0], [1]]
        ]
      },
      quad_fan: {
        id: 'quad_fan',
        size: 3,
        counts: [2, 4, 4],
        transitions: [
          [[0, 1], [2, 3]],
          [[0], [1], [2], [3]]
        ]
      },
      quad_hold: {
        id: 'quad_hold',
        size: 3,
        counts: [3, 4, 4],
        transitions: [
          [[0, 1], [1, 2], [2, 3]],
          [[0], [1], [2], [3]]
        ]
      },
      sts_early_a: {
        id: 'sts_early_a',
        size: 3,
        counts: [2, 3, 3],
        transitions: [
          [[0, 1], [1, 2]],
          [[0, 1], [1], [1, 2]]
        ]
      },
      sts_early_b: {
        id: 'sts_early_b',
        size: 3,
        counts: [2, 3, 4],
        transitions: [
          [[0, 1], [1, 2]],
          [[0, 1], [1, 2], [2, 3]]
        ]
      },
      sts_early_c: {
        id: 'sts_early_c',
        size: 3,
        counts: [2, 3, 4],
        transitions: [
          [[0, 1], [1, 2]],
          [[0], [1, 2], [2, 3]]
        ]
      },
      sts_mid_a: {
        id: 'sts_mid_a',
        size: 3,
        counts: [3, 4, 3],
        transitions: [
          [[0, 1], [1, 2], [2, 3]],
          [[0], [1, 2], [2]]
        ]
      },
      sts_mid_b: {
        id: 'sts_mid_b',
        size: 3,
        counts: [3, 4, 4],
        transitions: [
          [[0, 1], [1, 2], [2, 3]],
          [[0, 1], [1, 2], [2, 3], [3]]
        ]
      },
      sts_mid_c: {
        id: 'sts_mid_c',
        size: 3,
        counts: [3, 3, 4],
        transitions: [
          [[0], [1], [1, 2]],
          [[0, 1], [1, 2], [2, 3]]
        ]
      },
      sts_spread_a: {
        id: 'sts_spread_a',
        size: 3,
        counts: [3, 4, 3],
        transitions: [
          [[0, 1], [1, 2], [2, 3]],
          [[0], [1, 2], [2]]
        ]
      },
      sts_spread_b: {
        id: 'sts_spread_b',
        size: 3,
        counts: [3, 3, 4],
        transitions: [
          [[0], [1], [1, 2]],
          [[0, 1], [1, 2], [2, 3]]
        ]
      },
      sts_spread_c: {
        id: 'sts_spread_c',
        size: 3,
        counts: [4, 4, 3],
        transitions: [
          [[0], [1], [2], [2, 3]],
          [[0], [0, 1], [1, 2], [2]]
        ]
      },
      sts_braid_a: {
        id: 'sts_braid_a',
        size: 3,
        counts: [3, 4, 4],
        transitions: [
          [[0, 1], [1, 2], [2, 3]],
          [[0], [1, 2], [2, 3], [3]]
        ]
      },
      sts_braid_b: {
        id: 'sts_braid_b',
        size: 3,
        counts: [4, 4, 4],
        transitions: [
          [[0], [0, 1], [2, 3], [3]],
          [[0, 1], [1], [2], [2, 3]]
        ]
      },
      cross_bridge: {
        id: 'cross_bridge',
        size: 4,
        counts: [2, 2, 2, 1],
        transitions: [
          [[0], [0, 1]],
          [[0, 1], [1]],
          [[0], [0]]
        ]
      },
      tri_compress: {
        id: 'tri_compress',
        size: 4,
        counts: [1, 3, 2, 1],
        transitions: [
          [[0, 1, 2]],
          [[0], [0, 1], [1]],
          [[0], [0]]
        ]
      },
      parallel_detour: {
        id: 'parallel_detour',
        size: 4,
        counts: [2, 1, 2, 1],
        transitions: [
          [[0], [0]],
          [[0, 1]],
          [[0], [0]]
        ]
      },
      double_weave: {
        id: 'double_weave',
        size: 4,
        counts: [2, 3, 2, 1],
        transitions: [
          [[0, 1], [1, 2]],
          [[0], [0, 1], [1]],
          [[0], [0]]
        ]
      },
      tri_open: {
        id: 'tri_open',
        size: 4,
        counts: [2, 2, 3, 2],
        transitions: [
          [[0], [0, 1]],
          [[0, 1], [1, 2]],
          [[0, 1], [1]]
        ]
      },
      tri_hold: {
        id: 'tri_hold',
        size: 4,
        counts: [1, 2, 3, 2],
        transitions: [
          [[0, 1]],
          [[0, 1], [1, 2]],
          [[0], [0, 1], [1]]
        ]
      },
      dual_branch_rise: {
        id: 'dual_branch_rise',
        size: 4,
        counts: [2, 2, 3, 3],
        transitions: [
          [[0], [1]],
          [[0, 1], [1, 2]],
          [[0], [1], [2]]
        ]
      },
      tri_branch_hold: {
        id: 'tri_branch_hold',
        size: 4,
        counts: [2, 3, 3, 2],
        transitions: [
          [[0, 1], [1, 2]],
          [[0], [1], [2]],
          [[0], [0, 1], [1]]
        ]
      },
      tri_sprawl: {
        id: 'tri_sprawl',
        size: 4,
        counts: [2, 3, 3, 3],
        transitions: [
          [[0, 1], [1, 2]],
          [[0, 1], [1], [1, 2]],
          [[0], [1], [2]]
        ]
      },
      double_weave_open: {
        id: 'double_weave_open',
        size: 4,
        counts: [2, 2, 2, 2],
        transitions: [
          [[0], [0, 1]],
          [[0, 1], [1]],
          [[0], [1]]
        ]
      },
      pent_spike: {
        id: 'pent_spike',
        size: 4,
        counts: [2, 4, 5, 4],
        transitions: [
          [[0, 1], [2, 3]],
          [[0, 1], [1, 2], [2], [2, 3], [3, 4]],
          [[0], [1], [2], [3]]
        ]
      },
      pent_weave: {
        id: 'pent_weave',
        size: 4,
        counts: [3, 5, 4, 3],
        transitions: [
          [[0, 1], [1, 2, 3], [3, 4]],
          [[0, 1], [1, 2], [2, 3], [3]],
          [[0], [1], [2]]
        ]
      },
      offlane_drift: {
        id: 'offlane_drift',
        size: 4,
        counts: [2, 3, 5, 4],
        transitions: [
          [[0, 1], [1, 2]],
          [[0, 1], [1, 2, 3], [3, 4]],
          [[0, 1], [1, 2], [2, 3], [3]]
        ]
      },
      late_collapse_wide: {
        id: 'late_collapse_wide',
        size: 4,
        counts: [4, 4, 3, 1],
        transitions: [
          [[0], [1], [2], [3]],
          [[0], [1], [1, 2], [2]],
          [[0], [0], [0]]
        ]
      },
      sts_peak_a: {
        id: 'sts_peak_a',
        size: 4,
        counts: [3, 4, 5, 4],
        transitions: [
          [[0, 1], [1, 2], [2, 3]],
          [[0, 1], [1, 2], [2], [2, 3], [3, 4]],
          [[0], [1], [2, 3], [3]]
        ]
      },
      sts_peak_b: {
        id: 'sts_peak_b',
        size: 4,
        counts: [4, 5, 4, 3],
        transitions: [
          [[0, 1], [1], [2, 3], [3, 4]],
          [[0], [1, 2], [2, 3], [3, 4], [4]],
          [[0], [0, 1], [1, 2], [2]]
        ]
      },
      sts_peak_c: {
        id: 'sts_peak_c',
        size: 4,
        counts: [3, 5, 5, 4],
        transitions: [
          [[0, 1], [1, 2, 3], [3, 4]],
          [[0], [1, 2], [2], [2, 3], [3, 4]],
          [[0], [1], [2, 3], [3], [3]]
        ]
      },
      sts_peak_d: {
        id: 'sts_peak_d',
        size: 4,
        counts: [4, 5, 4, 4],
        transitions: [
          [[0], [0, 1], [2, 3], [3, 4]],
          [[0, 1], [1], [2, 3], [3], [3]],
          [[0], [1], [2], [3]]
        ]
      },
      sts_peak_e: {
        id: 'sts_peak_e',
        size: 4,
        counts: [3, 4, 4, 3],
        transitions: [
          [[0, 1], [1, 2], [2, 3]],
          [[0, 1], [1, 2], [2, 3], [3]],
          [[0], [1, 2], [2], [2]]
        ]
      },
      sts_final_a: {
        id: 'sts_final_a',
        size: 3,
        counts: [3, 2, 1],
        transitions: [
          [[0], [0, 1], [1]],
          [[0], [0]]
        ]
      },
      sts_final_b: {
        id: 'sts_final_b',
        size: 3,
        counts: [4, 2, 1],
        transitions: [
          [[0], [0], [1], [1]],
          [[0], [0]]
        ]
      },
      sts_final_c: {
        id: 'sts_final_c',
        size: 3,
        counts: [3, 3, 1],
        transitions: [
          [[0], [1], [1, 2]],
          [[0], [0], [0]]
        ]
      }
    };
  }

  function cloneGeneratedTailMotif(motifId) {
    const motif = getGeneratedTailMotifRegistry()[motifId];
    return motif ? deepClone(motif) : null;
  }

  function listGeneratedMotifsForSize(size) {
    return Object.values(getGeneratedTailMotifRegistry())
      .filter((motif) => Math.max(1, Math.round(Number(motif?.size) || 0)) === Math.max(1, Math.round(Number(size) || 0)))
      .map((motif) => motif.id);
  }

  function selectGeneratedMotifId(size, configuredPool, seed, segmentIndex, requireFinalMerge = false) {
    const motifRegistry = getGeneratedTailMotifRegistry();
    const basePool = Array.isArray(configuredPool) && configuredPool.length
      ? configuredPool
      : listGeneratedMotifsForSize(size);
    const eligiblePool = basePool.filter((motifId) => {
      const motif = motifRegistry[motifId];
      if (!motif || motif.size !== size) return false;
      if (!requireFinalMerge) return true;
      return Array.isArray(motif.counts) && motif.counts[motif.counts.length - 1] === 1;
    });
    const pool = eligiblePool.length ? eligiblePool : listGeneratedMotifsForSize(size);
    if (!pool.length) return null;
    const rng = mulberry32(hashStringToSeed(`${seed}|segment|${segmentIndex}|${size}`));
    return pool[Math.floor(rng() * pool.length)] || pool[0];
  }

  function getGeneratedShapeProfiles(generatedTail) {
    return Array.isArray(generatedTail?.shapeProfiles) ? generatedTail.shapeProfiles : [];
  }

  function selectGeneratedShapeProfile(generatedTail, seed) {
    const profiles = getGeneratedShapeProfiles(generatedTail)
      .filter((profile) => Array.isArray(profile.motifs) && profile.motifs.length);
    if (!profiles.length) return null;
    const rng = mulberry32(hashStringToSeed(`${seed}|shape-profile`));
    return profiles[Math.floor(rng() * profiles.length)] || profiles[0];
  }

  function normalizeGeneratedSelectionPattern(pattern, currentCount, nextCount) {
    const strictLadders = {
      '4->5': [[0, 1], [1, 2], [2, 3], [3, 4]],
      '5->4': [[0], [0, 1], [1, 2], [2, 3], [3]]
    };
    const strictPattern = strictLadders[`${currentCount}->${nextCount}`] || null;
    const normalized = Array.from({ length: currentCount }, (_, sourceIndex) => {
      const allowedTargets = strictPattern
        ? strictPattern[sourceIndex] || []
        : null;
      const anchor = strictPattern
        ? (allowedTargets[0] ?? 0)
        : Math.max(0, Math.min(nextCount - 1, Math.round((sourceIndex / Math.max(1, currentCount - 1 || 1)) * Math.max(0, nextCount - 1))));
      const rawTargets = Array.isArray(pattern?.[sourceIndex]) ? pattern[sourceIndex] : [];
      const targets = rawTargets
        .map((targetIndex) => Math.max(0, Math.min(nextCount - 1, Math.round(Number(targetIndex) || 0))))
        .filter((targetIndex) => (allowedTargets ? allowedTargets.includes(targetIndex) : Math.abs(targetIndex - anchor) <= 1))
        .filter((value, index, list) => list.indexOf(value) === index)
        .sort((left, right) => left - right);
      if (targets.length) return targets;
      if (allowedTargets?.length) return [allowedTargets[0]];
      return [anchor];
    });

    for (let targetIndex = 0; targetIndex < nextCount; targetIndex += 1) {
      const covered = normalized.some((targets) => targets.includes(targetIndex));
      if (covered) continue;
      const attachIndex = strictPattern
        ? Math.max(0, strictPattern.findIndex((targets) => Array.isArray(targets) && targets.includes(targetIndex)))
        : Math.max(0, Math.min(currentCount - 1, Math.round((targetIndex / Math.max(1, nextCount - 1 || 1)) * Math.max(0, currentCount - 1))));
      normalized[attachIndex] = [...normalized[attachIndex], targetIndex]
        .filter((value, index, list) => list.indexOf(value) === index)
        .sort((left, right) => left - right);
    }

    return normalized;
  }

  function getBridgePatternCandidates(currentCount, nextCount) {
    const key = `${currentCount}->${nextCount}`;
    const patterns = {
      '1->1': [[[0]]],
      '1->2': [[[0, 1]]],
      '1->3': [[[0, 1, 2]]],
      '2->1': [[[0], [0]]],
      '2->2': [
        [[0], [1]],
        [[0], [0, 1]],
        [[0, 1], [1]],
        [[1], [0]]
      ],
      '2->3': [
        [[0, 1], [1, 2]],
        [[0, 1], [2]],
        [[0], [1, 2]]
      ],
      '3->1': [[[0], [0], [0]]],
      '3->2': [
        [[0], [0, 1], [1]],
        [[0, 1], [1], [0]]
      ],
      '3->3': [
        [[0], [1], [2]],
        [[0, 1], [1], [1, 2]]
      ]
    };
    return patterns[key] || [Array.from({ length: currentCount }, (_, index) => [Math.max(0, Math.min(nextCount - 1, index % Math.max(1, nextCount)))])];
  }

  function selectBridgePattern(currentCount, nextCount, seed) {
    const candidates = getBridgePatternCandidates(currentCount, nextCount);
    const rng = mulberry32(hashStringToSeed(seed));
    const pattern = candidates[Math.floor(rng() * candidates.length)] || candidates[0];
    return normalizeGeneratedSelectionPattern(pattern, currentCount, nextCount);
  }

  function getGeneratedNodeRole(nodeIndex, layerCount, totalNodes, previousLayerCount, nextLayerCount) {
    if (nodeIndex >= totalNodes) return 'finale';
    if (layerCount > 1) return 'branch';
    if (previousLayerCount > 1) return 'merge';
    if (nextLayerCount > 1) return 'split';
    return 'path';
  }

  function getGeneratedNodeSubtitle(role, branchLabel) {
    if (role === 'finale') return 'FINAL RECKONING';
    if (role === 'merge') return 'MERGE LINE';
    if (role === 'split') return 'SPLIT GATE';
    if (role === 'branch') return `ROUTE ${branchLabel || 'A'}`;
    return 'DESCENT PATH';
  }

  function getGeneratedNodeNarrativeTitle(nodeIndex, role, branchLabel) {
    const base = `GENERATED NODE ${String(nodeIndex).padStart(2, '0')}`;
    if (role === 'finale') return `${base} · FINALE`;
    if (role === 'merge') return `${base} · MERGE`;
    if (role === 'split') return `${base} · SPLIT`;
    if (role === 'branch') return `${base} · ROUTE ${branchLabel || 'A'}`;
    return `${base} · PATH`;
  }

  function createGeneratedNodeId(nodeIndex, branchIndex, layerCount, role) {
    const padded = String(nodeIndex).padStart(2, '0');
    if (role === 'finale') return `node${padded}-finale`;
    if (layerCount <= 1) {
      if (role === 'merge') return `node${padded}-merge`;
      if (role === 'split') return `node${padded}-split`;
      return `node${padded}-path`;
    }
    const branchLabel = String.fromCharCode(97 + branchIndex);
    return `node${padded}-${branchLabel}-route`;
  }

  function createGeneratedNodeSkeleton(options) {
    const nodeIndex = Math.max(1, Math.round(Number(options?.nodeIndex) || 1));
    const layerCount = Math.max(1, Math.round(Number(options?.layerCount) || 1));
    const branchIndex = Math.max(0, Math.round(Number(options?.branchIndex) || 0));
    const role = normalizeTrimmedString(options?.role, 'path').toLowerCase();
    const branchLabel = String.fromCharCode(65 + branchIndex);
    const nodeId = createGeneratedNodeId(nodeIndex, branchIndex, layerCount, role);
    const labelSuffix = layerCount > 1 ? `_${branchLabel}` : '';
    const title = getGeneratedNodeNarrativeTitle(nodeIndex, role, branchLabel);
    const subtitle = getGeneratedNodeSubtitle(role, branchLabel);
    const isFinale = role === 'finale';
    return {
      id: nodeId,
      nodeIndex,
      kind: isFinale ? 'vision' : 'random',
      key: isFinale ? 'vision' : 'random',
      ui: {
        label: `NODE_${String(nodeIndex).padStart(2, '0')}${labelSuffix}`,
        subtitle,
        variant: isFinale ? 'finale' : undefined
      },
      planner: {
        limited: []
      },
      cast: {
        onEnter: {
          present: ['RINO']
        }
      },
      narrative: {
        title,
        subtitle,
        overview: isFinale
          ? '这是种子生成路线的终局节点。把前面的路径结果收口，形成初章终局。'
          : '这是由 seed 自动生成的路线节点，用来承接初章前三节点后的后续推进。按当前节点类型和路径位置继续写。',
        guidance: isFinale
          ? '在这里收束这一整章，不再继续向外展开。'
          : '保持节点推进感，写出从上一节点承接下来的路线变化。'
      },
      phases: [
        { index: 0, slot: null, fixed: false },
        { index: 1, slot: null, fixed: false },
        { index: 2, slot: null, fixed: false },
        { index: 3, slot: null, fixed: false }
      ],
      next: { mode: 'none' }
    };
  }

  function getGeneratedLaneDefs() {
    return [
      { key: 'white', branchIndex: 0, subtitle: 'UPPER LINE', title: 'WHITE LINE' },
      { key: 'blue', branchIndex: 1, subtitle: 'MID-UPPER LINE', title: 'BLUE LINE' },
      { key: 'orange', branchIndex: 2, subtitle: 'MID-LOWER LINE', title: 'ORANGE LINE' },
      { key: 'red', branchIndex: 3, subtitle: 'LOWER LINE', title: 'RED LINE' },
      { key: 'neutral', branchIndex: 2, subtitle: 'CROSS GATE', title: 'NEUTRAL GATE' }
    ];
  }

  function getGeneratedLaneDef(laneKey) {
    const defs = getGeneratedLaneDefs();
    return defs.find((entry) => entry.key === laneKey) || defs[0];
  }

  function createLaneBackboneNode(options) {
    const nodeIndex = Math.max(1, Math.round(Number(options?.nodeIndex) || 1));
    const finale = options?.finale === true;
    if (finale) {
      const node = createGeneratedNodeSkeleton({ nodeIndex, layerCount: 1, branchIndex: 0, role: 'finale' });
      node.ui.subtitle = 'FOUR-LANE FINALE';
      node.narrative.title = `GENERATED NODE ${String(nodeIndex).padStart(2, '0')} · FOUR-LANE FINALE`;
      node.narrative.subtitle = 'FOUR-LANE FINALE';
      node.narrative.overview = '四条主线在这里完成最终收束，形成初章终局。';
      node.narrative.guidance = '把四条主线的结果在这里收束，不再继续展开。';
      return node;
    }

    const laneDef = getGeneratedLaneDef(options?.laneKey);
    const layerCount = Math.max(1, Math.round(Number(options?.layerCount) || 4));
    const subtitle = normalizeTrimmedString(options?.subtitle, laneDef.subtitle);
    const title = normalizeTrimmedString(options?.title, laneDef.title);
    const branchIndexSource = options?.branchIndex;
    const branchIndex = Math.max(
      0,
      Math.round(
        Number.isFinite(Number(branchIndexSource))
          ? Number(branchIndexSource)
          : laneDef.branchIndex
      )
    );
    const mainlineLanes = (Array.isArray(options?.mainlineLanes) ? options.mainlineLanes : [laneDef.key])
      .map((value) => normalizeTrimmedString(value, '').toLowerCase())
      .filter((value, index, list) => ['white', 'blue', 'orange', 'red'].includes(value) && list.indexOf(value) === index);
    const node = createGeneratedNodeSkeleton({
      nodeIndex,
      layerCount,
      branchIndex,
      role: 'branch'
    });
    node.lane = laneDef.key;
    node.ui.lane = laneDef.key;
    node.mainlineLanes = mainlineLanes;
    node.ui.subtitle = subtitle;
    node.narrative.title = `GENERATED NODE ${String(nodeIndex).padStart(2, '0')} · ${title}`;
    node.narrative.subtitle = subtitle;
    node.narrative.overview = `这是初章四条主线中的 ${title} 节点，用来维持稳定的分线推进。`;
    node.narrative.guidance = '保持该线位的推进感，只在相邻线之间做局部交汇，不要让整张图乱飞。';
    return node;
  }

  function assignNodeNext(node, targetIds) {
    const normalizedTargetIds = (Array.isArray(targetIds) ? targetIds : [])
      .map((value) => normalizeTrimmedString(value, ''))
      .filter(Boolean);
    const uniqueTargetIds = normalizedTargetIds.filter((value, index, list) => list.indexOf(value) === index);
    if (!uniqueTargetIds.length) {
      node.next = { mode: 'none' };
      return;
    }
    node.next = uniqueTargetIds.length === 1
      ? { mode: 'forced', nodeId: uniqueTargetIds[0] }
      : { mode: 'choice', options: uniqueTargetIds };
  }

  function appendNodeNextTarget(node, targetId) {
    const normalizedTargetId = normalizeTrimmedString(targetId, '');
    if (!node || !normalizedTargetId) return;
    const existingTargetIds = [];
    const nextMode = normalizeTrimmedString(node?.next?.mode, 'none').toLowerCase();
    if (nextMode === 'forced') {
      existingTargetIds.push(normalizeTrimmedString(node?.next?.nodeId, ''));
    } else if (nextMode === 'choice') {
      existingTargetIds.push(...(Array.isArray(node?.next?.options) ? node.next.options : []));
    }
    assignNodeNext(node, [...existingTargetIds, normalizedTargetId]);
  }

  function getNodeNextTargetIds(node) {
    const nextMode = normalizeTrimmedString(node?.next?.mode, 'none').toLowerCase();
    if (nextMode === 'forced') {
      return [normalizeTrimmedString(node?.next?.nodeId, '')].filter(Boolean);
    }
    if (nextMode === 'choice') {
      return (Array.isArray(node?.next?.options) ? node.next.options : [])
        .map((value) => normalizeTrimmedString(value, ''))
        .filter(Boolean);
    }
    return [];
  }

  function countLaneCrossovers(chapterNodes) {
    const laneCounts = { white: 0, blue: 0, orange: 0, red: 0 };
    Object.entries(chapterNodes || {}).forEach(([nodeId, node]) => {
      const sourceLanes = (Array.isArray(node?.mainlineLanes) ? node.mainlineLanes : [])
        .map((value) => normalizeTrimmedString(value, '').toLowerCase())
        .filter(Boolean);
      getNodeNextTargetIds(node).forEach((targetId) => {
        const targetNode = chapterNodes?.[targetId];
        const targetLanes = (Array.isArray(targetNode?.mainlineLanes) ? targetNode.mainlineLanes : [])
          .map((value) => normalizeTrimmedString(value, '').toLowerCase())
          .filter(Boolean);
        ['white', 'blue', 'orange', 'red'].forEach((laneKey) => {
          const touchesLane = sourceLanes.includes(laneKey) || targetLanes.includes(laneKey);
          const plainContinuation = sourceLanes.length === 1 && targetLanes.length === 1 &&
            sourceLanes[0] === laneKey && targetLanes[0] === laneKey;
          if (touchesLane && !plainContinuation) {
            laneCounts[laneKey] += 1;
          }
        });
      });
    });
    return laneCounts;
  }

  function ensureMinimumLaneCrossovers(chapterNodes) {
    const candidateMap = {
      white: [
        ['node06-a-route', 'node07-b-route'],
        ['node10-a-route', 'node11-b-route'],
        ['node13-a-route', 'node14-b-route']
      ],
      blue: [
        ['node05-b-route', 'node06-a-route'],
        ['node08-b-route', 'node09-c-route'],
        ['node11-b-route', 'node12-c-route']
      ],
      orange: [
        ['node07-c-route', 'node08-b-route'],
        ['node10-c-route', 'node11-b-route'],
        ['node13-c-route', 'node14-b-route']
      ],
      red: [
        ['node10-d-route', 'node11-c-route'],
        ['node13-d-route', 'node14-c-route'],
        ['node14-d-route', 'node15-b-route']
      ]
    };
    const counts = countLaneCrossovers(chapterNodes);
    ['white', 'blue', 'orange', 'red'].forEach((laneKey) => {
      const candidates = candidateMap[laneKey] || [];
      for (const [fromId, toId] of candidates) {
        if ((counts[laneKey] || 0) >= 2) break;
        const fromNode = chapterNodes?.[fromId];
        const toNode = chapterNodes?.[toId];
        if (!fromNode || !toNode) continue;
        const before = JSON.stringify(getNodeNextTargetIds(fromNode));
        appendNodeNextTarget(fromNode, toId);
        const after = JSON.stringify(getNodeNextTargetIds(fromNode));
        if (before !== after) {
          counts[laneKey] += 1;
        }
      }
    });
  }

  function buildLaneLayer(chapterNodes, nodeIndex, laneSpecs, finale = false) {
    return laneSpecs.map((laneSpec, laneIndex) => {
      const laneKey = typeof laneSpec === 'string' ? laneSpec : laneSpec?.lane;
      const node = createLaneBackboneNode({
        nodeIndex,
        laneKey,
        layerCount: laneSpecs.length,
        finale,
        branchIndex: laneIndex,
        subtitle: typeof laneSpec === 'object' ? laneSpec.subtitle : undefined,
        title: typeof laneSpec === 'object' ? laneSpec.title : undefined,
        mainlineLanes: typeof laneSpec === 'object' ? laneSpec.mainlineLanes : undefined
      });
      chapterNodes[node.id] = node;
      return { id: node.id, lane: finale ? 'finale' : laneKey, node };
    });
  }

  function getLaneEntryMap(layer) {
    const map = new Map();
    (Array.isArray(layer) ? layer : []).forEach((entry) => {
      if (!entry?.lane) return;
      map.set(entry.lane, entry);
    });
    return map;
  }

  function getLaneBridgeProfiles() {
    return [
      ['hold', 'upper', 'hold', 'middle', 'hold', 'lower', 'hold', 'dual', 'hold', 'middle'],
      ['upper', 'hold', 'middle', 'hold', 'dual', 'hold', 'lower', 'hold', 'middle', 'hold'],
      ['hold', 'dual', 'hold', 'upper', 'hold', 'middle', 'hold', 'lower', 'hold', 'upper'],
      ['middle', 'hold', 'upper', 'hold', 'lower', 'hold', 'dual', 'hold', 'middle', 'hold']
    ];
  }

  function selectLaneBridgeSequence(seed, length) {
    const profiles = getLaneBridgeProfiles();
    const rng = mulberry32(hashStringToSeed(`${seed}|lane-bridge-profile`));
    const profile = profiles[Math.floor(rng() * profiles.length)] || profiles[0] || [];
    return Array.from({ length }, (_, index) => profile[index % profile.length] || 'hold');
  }

  function applyFourLaneBridgePattern(currentLayer, nextLayer, pattern) {
    const currentByLane = getLaneEntryMap(currentLayer);
    const nextByLane = getLaneEntryMap(nextLayer);
    getGeneratedLaneDefs().forEach((laneDef) => {
      const currentEntry = currentByLane.get(laneDef.key);
      const nextEntry = nextByLane.get(laneDef.key);
      if (!currentEntry || !nextEntry) return;
      assignNodeNext(currentEntry.node, [nextEntry.id]);
    });

    const connectChoice = (laneKey, targetLaneKeys) => {
      const currentEntry = currentByLane.get(laneKey);
      if (!currentEntry) return;
      const targetIds = targetLaneKeys
        .map((targetLaneKey) => nextByLane.get(targetLaneKey)?.id || '')
        .filter(Boolean);
      if (targetIds.length) assignNodeNext(currentEntry.node, targetIds);
    };

    switch (pattern) {
      case 'upper':
        connectChoice('white', ['white', 'blue']);
        break;
      case 'middle':
        connectChoice('blue', ['blue', 'orange']);
        break;
      case 'lower':
        connectChoice('orange', ['orange', 'red']);
        break;
      case 'dual':
        connectChoice('white', ['white', 'blue']);
        connectChoice('orange', ['orange', 'red']);
        break;
      default:
        break;
    }
  }

  function selectLaneCollapsePair(seed) {
    const pairs = [
      ['white', 'blue'],
      ['blue', 'orange'],
      ['orange', 'red'],
      ['white', 'orange'],
      ['blue', 'red']
    ];
    const rng = mulberry32(hashStringToSeed(`${seed}|lane-collapse-pair`));
    return pairs[Math.floor(rng() * pairs.length)] || pairs[0];
  }

  function getNearestLaneTarget(laneKey, targetLaneKeys) {
    const laneIndex = getGeneratedLaneDef(laneKey).branchIndex;
    return [...targetLaneKeys].sort((left, right) => {
      const leftDistance = Math.abs(getGeneratedLaneDef(left).branchIndex - laneIndex);
      const rightDistance = Math.abs(getGeneratedLaneDef(right).branchIndex - laneIndex);
      return leftDistance - rightDistance || getGeneratedLaneDef(left).branchIndex - getGeneratedLaneDef(right).branchIndex;
    })[0] || targetLaneKeys[0];
  }

  function getNodeNameAWords() {
    return [
      'Red', 'Black', 'White', 'Grey', 'Rust', 'Dust', 'Ash', 'Cold', 'Thin', 'Open',
      'Closed', 'Silent', 'Dead', 'Empty', 'Split', 'False', 'Final', 'Last', 'First', 'Zero',
      'Wet', 'Pale', 'Burnt', 'Marked', 'Null', 'Void', 'Broken', 'Hidden', 'Side', 'Slow'
    ];
  }

  function getNodeNameBWords() {
    return [
      'Stamp', 'Receipt', 'Ledger', 'Clause', 'Record', 'Notice', 'Claim', 'Entry', 'Draft', 'Seal',
      'File', 'Margin', 'Slip', 'Balance', 'Writ', 'Bond', 'Register', 'Audit', 'Voucher', 'Ledgerline',
      'Gate', 'Hall', 'Counter', 'Booth', 'Window', 'Floor', 'Valve', 'Pipe', 'Exit', 'Lamp',
      'Rail', 'Shaft', 'Tower', 'Vault', 'Door', 'Track', 'Channel', 'Terminal', 'Stair', 'Corridor',
      'Blind', 'Pot', 'Call', 'Raise', 'River', 'Burn', 'Tell', 'Stack', 'Marker', 'Hand',
      'Draw', 'Seat', 'Table', 'Count', 'Sidepot', 'Fold', 'Ante', 'Chip', 'Dealer', 'Turn',
      'Mark', 'Thread', 'Index', 'Signal', 'Trace', 'Slot', 'Key', 'Flag', 'Code', 'Tag',
      'Phase', 'Line', 'Trigger', 'Link', 'Path', 'Echo', 'Core', 'Lock',
      'Debt', 'Burden', 'Residue', 'Load', 'Scar', 'Weight', 'Fault', 'Sink', 'Break', 'Drift',
      'Vessel', 'Chain', 'Ruin', 'Leak', 'Pressure', 'Threshold', 'Collapse'
    ];
  }

  function generateChapterNodeNames(seed, totalNodes) {
    const safeTotalNodes = Math.max(1, Math.round(Number(totalNodes) || 1));
    const aWords = getNodeNameAWords();
    const bWords = getNodeNameBWords();
    const names = [];
    const used = new Set();
    const rng = mulberry32(hashStringToSeed(`${seed}|chapter-node-names`));
    let guard = 0;
    while (names.length < safeTotalNodes && guard < 2000) {
      guard += 1;
      const aWord = aWords[Math.floor(rng() * aWords.length)] || 'Silent';
      const bWord = bWords[Math.floor(rng() * bWords.length)] || 'Gate';
      const combo = `${aWord} ${bWord}`;
      if (used.has(combo)) continue;
      used.add(combo);
      names.push(combo.toUpperCase());
    }
    while (names.length < safeTotalNodes) {
      names.push(`NODE TITLE ${names.length + 1}`);
    }
    return names;
  }

  function applyGeneratedNodeNames(chapterConfig, seed, totalNodes) {
    const names = generateChapterNodeNames(seed, totalNodes);
    Object.entries(chapterConfig?.nodes || {}).forEach(([, nodeRuntime]) => {
      const nodeIndex = Math.max(1, Math.round(Number(nodeRuntime?.nodeIndex) || 1));
      const generatedTitle = names[nodeIndex - 1] || `NODE TITLE ${nodeIndex}`;
      if (!nodeRuntime.ui || typeof nodeRuntime.ui !== 'object') nodeRuntime.ui = {};
      nodeRuntime.ui.generatedTitle = generatedTitle;
    });
  }

  function generateLaneBackboneCounts(seed) {
    const rng = mulberry32(hashStringToSeed(`${seed}|lane-backbone-counts`));
    const counts = [4];
    let previousCount = 4;
    let repeatRun = 1;
    for (let step = 0; step < 8; step += 1) {
      const remainingSteps = 7 - step;
      const candidates = [3, 4, 5].filter((candidate) => Math.abs(candidate - previousCount) <= 1);
      const weighted = candidates.map((candidate) => {
        let weight = 1;
        if (candidate === previousCount) weight *= repeatRun >= 2 ? 0.12 : 0.45;
        if (candidate === 4) weight *= 0.85;
        if ((step <= 1 || step >= 6) && candidate === 5) weight *= 0.55;
        if (remainingSteps <= 1 && candidate !== 4) weight *= 0.7;
        return { candidate, weight };
      });
      const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0) || 1;
      let pick = rng() * totalWeight;
      let nextCount = weighted[0]?.candidate || 4;
      for (const entry of weighted) {
        pick -= entry.weight;
        if (pick <= 0) {
          nextCount = entry.candidate;
          break;
        }
      }
      if (counts.length >= 4) {
        const tail = counts.slice(-4).concat(nextCount).join('');
        if (tail === '43454' || tail === '34543' || tail === '45434') {
          nextCount = nextCount === 4 ? 3 : 4;
          if (Math.abs(nextCount - previousCount) > 1) nextCount = previousCount;
        }
      }
      counts.push(nextCount);
      repeatRun = nextCount === previousCount ? repeatRun + 1 : 1;
      previousCount = nextCount;
    }
    counts.push(4);
    return counts;
  }

  function createFourLaneLayerSpecs() {
    return [
      { lane: 'white', subtitle: 'UPPER LINE', title: 'WHITE LINE', mainlineLanes: ['white'] },
      { lane: 'blue', subtitle: 'MID-UPPER LINE', title: 'BLUE LINE', mainlineLanes: ['blue'] },
      { lane: 'orange', subtitle: 'MID-LOWER LINE', title: 'ORANGE LINE', mainlineLanes: ['orange'] },
      { lane: 'red', subtitle: 'LOWER LINE', title: 'RED LINE', mainlineLanes: ['red'] }
    ];
  }

  function createThreeLaneLayerSpecs(nodeIndex, variant = 'center') {
    const bridgeTitle = nodeIndex >= 10 ? 'MID CROSS' : 'MID BRIDGE';
    if (variant === 'upper') {
      return [
        { lane: 'neutral', subtitle: 'UPPER MERGE', title: 'UPPER MERGE', mainlineLanes: ['white', 'blue'] },
        { lane: 'orange', subtitle: 'MID-LOWER LINE', title: 'ORANGE LINE', mainlineLanes: ['orange'] },
        { lane: 'red', subtitle: 'LOWER LINE', title: 'RED LINE', mainlineLanes: ['red'] }
      ];
    }
    if (variant === 'lower') {
      return [
        { lane: 'white', subtitle: 'UPPER LINE', title: 'WHITE LINE', mainlineLanes: ['white'] },
        { lane: 'blue', subtitle: 'MID-UPPER LINE', title: 'BLUE LINE', mainlineLanes: ['blue'] },
        { lane: 'neutral', subtitle: 'LOWER MERGE', title: 'LOWER MERGE', mainlineLanes: ['orange', 'red'] }
      ];
    }
    return [
      { lane: 'white', subtitle: 'UPPER LINE', title: 'WHITE LINE', mainlineLanes: ['white'] },
      { lane: 'neutral', subtitle: bridgeTitle, title: bridgeTitle, mainlineLanes: ['blue', 'orange'] },
      { lane: 'red', subtitle: 'LOWER LINE', title: 'RED LINE', mainlineLanes: ['red'] }
    ];
  }

  function createFiveLaneLayerSpecs(nodeIndex, variant = 'center') {
    const gateTitle = nodeIndex % 4 === 0 ? 'CROSS GATE' : 'PRESSURE GATE';
    if (variant === 'upper') {
      return [
        { lane: 'white', subtitle: 'UPPER LINE', title: 'WHITE LINE', mainlineLanes: ['white'] },
        { lane: 'neutral', subtitle: 'UPPER GATE', title: 'UPPER GATE', mainlineLanes: ['white', 'blue'] },
        { lane: 'blue', subtitle: 'MID-UPPER LINE', title: 'BLUE LINE', mainlineLanes: ['blue'] },
        { lane: 'orange', subtitle: 'MID-LOWER LINE', title: 'ORANGE LINE', mainlineLanes: ['orange'] },
        { lane: 'red', subtitle: 'LOWER LINE', title: 'RED LINE', mainlineLanes: ['red'] }
      ];
    }
    if (variant === 'lower') {
      return [
        { lane: 'white', subtitle: 'UPPER LINE', title: 'WHITE LINE', mainlineLanes: ['white'] },
        { lane: 'blue', subtitle: 'MID-UPPER LINE', title: 'BLUE LINE', mainlineLanes: ['blue'] },
        { lane: 'orange', subtitle: 'MID-LOWER LINE', title: 'ORANGE LINE', mainlineLanes: ['orange'] },
        { lane: 'neutral', subtitle: 'LOWER GATE', title: 'LOWER GATE', mainlineLanes: ['orange', 'red'] },
        { lane: 'red', subtitle: 'LOWER LINE', title: 'RED LINE', mainlineLanes: ['red'] }
      ];
    }
    return [
      { lane: 'white', subtitle: 'UPPER LINE', title: 'WHITE LINE', mainlineLanes: ['white'] },
      { lane: 'blue', subtitle: 'MID-UPPER LINE', title: 'BLUE LINE', mainlineLanes: ['blue'] },
      { lane: 'neutral', subtitle: gateTitle, title: gateTitle, mainlineLanes: [] },
      { lane: 'orange', subtitle: 'MID-LOWER LINE', title: 'ORANGE LINE', mainlineLanes: ['orange'] },
      { lane: 'red', subtitle: 'LOWER LINE', title: 'RED LINE', mainlineLanes: ['red'] }
    ];
  }

  function selectLaneLayerVariant(seed, nodeIndex, count) {
    if (count <= 3) {
      const variants = ['center', 'upper', 'lower'];
      const rng = mulberry32(hashStringToSeed(`${seed}|lane-3-variant|${nodeIndex}`));
      return variants[Math.floor(rng() * variants.length)] || 'center';
    }
    if (count >= 5) {
      const variants = ['center', 'upper', 'lower'];
      const rng = mulberry32(hashStringToSeed(`${seed}|lane-5-variant|${nodeIndex}`));
      return variants[Math.floor(rng() * variants.length)] || 'center';
    }
    return 'plain';
  }

  function createLaneLayerSpecsForCount(seed, nodeIndex, count) {
    const variant = selectLaneLayerVariant(seed, nodeIndex, count);
    if (count <= 3) return createThreeLaneLayerSpecs(nodeIndex, variant);
    if (count >= 5) return createFiveLaneLayerSpecs(nodeIndex, variant);
    return createFourLaneLayerSpecs();
  }

  function buildAdjacentTransitionPattern(seed, nodeIndex, fromCount, toCount) {
    const safeFromCount = Math.max(1, Math.round(Number(fromCount) || 1));
    const safeToCount = Math.max(1, Math.round(Number(toCount) || 1));
    if (safeFromCount === safeToCount) {
      return Array.from({ length: safeFromCount }, (_, index) => [index]);
    }
    if (safeFromCount + 1 === safeToCount) {
      const splitIndexMax = Math.max(0, safeFromCount - 1);
      const splitRng = mulberry32(hashStringToSeed(`${seed}|lane-split|${nodeIndex}|${safeFromCount}|${safeToCount}`));
      const splitIndex = Math.min(splitIndexMax, Math.floor(splitRng() * (splitIndexMax + 1)));
      return Array.from({ length: safeFromCount }, (_, index) => {
        if (index < splitIndex) return [index];
        if (index === splitIndex) return [index, index + 1];
        return [Math.min(safeToCount - 1, index + 1)];
      });
    }
    if (safeFromCount === safeToCount + 1) {
      const mergeIndexMax = Math.max(0, safeToCount - 1);
      const mergeRng = mulberry32(hashStringToSeed(`${seed}|lane-merge|${nodeIndex}|${safeFromCount}|${safeToCount}`));
      const mergeIndex = Math.min(mergeIndexMax, Math.floor(mergeRng() * (mergeIndexMax + 1)));
      return Array.from({ length: safeFromCount }, (_, index) => {
        if (index < mergeIndex) return [index];
        if (index === mergeIndex || index === mergeIndex + 1) return [mergeIndex];
        return [Math.max(0, index - 1)];
      });
    }
    const fallback = [];
    for (let index = 0; index < safeFromCount; index += 1) {
      const projected = Math.round((index / Math.max(1, safeFromCount - 1)) * Math.max(0, safeToCount - 1));
      const targets = [Math.max(0, Math.min(safeToCount - 1, projected))];
      fallback.push(targets);
    }
    return fallback;
  }

  function buildLaneBackboneChapterTail(chapterConfig, generatedTail) {
    const totalNodes = Math.max(chapterConfig.totalNodes || 1, generatedTail.totalNodes || 1);
    const chapterSeed = normalizeTrimmedString(chapterConfig?.runtime?.seed, DEFAULT_WORLD_ACT.seed);
    const collapseIndex = 15;
    const finaleIndex = 16;
    const backboneCounts = generateLaneBackboneCounts(chapterSeed);
    const laneLayout = new Map([
      [4, [
        { lane: 'blue', subtitle: 'UPPER LINE', title: 'BLUE LINE', mainlineLanes: ['blue'] },
        { lane: 'orange', subtitle: 'LOWER LINE', title: 'ORANGE LINE', mainlineLanes: ['orange'] }
      ]],
      [5, createFourLaneLayerSpecs()]
    ]);
    for (let nodeIndex = 6; nodeIndex <= 14; nodeIndex += 1) {
      laneLayout.set(nodeIndex, createLaneLayerSpecsForCount(chapterSeed, nodeIndex, backboneCounts[nodeIndex - 5] || 4));
    }
    const transitionMap = new Map([
      ['4->5', [[0, 1], [2, 3]]]
    ]);
    for (let nodeIndex = 5; nodeIndex < 14; nodeIndex += 1) {
      const currentCount = (laneLayout.get(nodeIndex) || []).length;
      const nextCount = (laneLayout.get(nodeIndex + 1) || []).length;
      transitionMap.set(`${nodeIndex}->${nodeIndex + 1}`, buildAdjacentTransitionPattern(chapterSeed, nodeIndex, currentCount, nextCount));
    }

    Object.entries(chapterConfig.nodes).forEach(([nodeId, nodeRuntime]) => {
      const nodeIndex = Math.max(1, Math.round(Number(nodeRuntime?.nodeIndex) || 1));
      if (nodeIndex >= generatedTail.startNodeIndex) delete chapterConfig.nodes[nodeId];
    });

    const layers = new Map();
    for (const [nodeIndex, laneSpecs] of laneLayout.entries()) {
      layers.set(nodeIndex, buildLaneLayer(chapterConfig.nodes, nodeIndex, laneSpecs));
    }
    const collapsePair = selectLaneCollapsePair(chapterSeed);
    layers.set(collapseIndex, buildLaneLayer(chapterConfig.nodes, collapseIndex, collapsePair));
    layers.set(finaleIndex, buildLaneLayer(chapterConfig.nodes, finaleIndex, ['white'], true));

    const openingLayer = layers.get(4) || [];
    const firstFullLane = layers.get(5) || [];
    const openingByLane = getLaneEntryMap(openingLayer);
    const firstFullByLane = getLaneEntryMap(firstFullLane);
    if (openingByLane.get('blue')) {
      assignNodeNext(openingByLane.get('blue').node, [
        firstFullByLane.get('white')?.id || '',
        firstFullByLane.get('blue')?.id || ''
      ]);
    }
    if (openingByLane.get('orange')) {
      assignNodeNext(openingByLane.get('orange').node, [
        firstFullByLane.get('orange')?.id || '',
        firstFullByLane.get('red')?.id || ''
      ]);
    }

    for (let nodeIndex = 5; nodeIndex < 14; nodeIndex += 1) {
      const transition = transitionMap.get(`${nodeIndex}->${nodeIndex + 1}`);
      const currentLayer = layers.get(nodeIndex) || [];
      const nextLayer = layers.get(nodeIndex + 1) || [];
      if (!transition || !currentLayer.length || !nextLayer.length) continue;
      currentLayer.forEach((entry, entryIndex) => {
        const targetIndexes = Array.isArray(transition[entryIndex]) ? transition[entryIndex] : [];
        const targetIds = targetIndexes.map((index) => nextLayer[index]?.id || '').filter(Boolean);
        const mainlineLanes = (Array.isArray(entry?.node?.mainlineLanes) ? entry.node.mainlineLanes : [])
          .map((value) => normalizeTrimmedString(value, '').toLowerCase())
          .filter((value, index, list) => ['white', 'blue', 'orange', 'red'].includes(value) && list.indexOf(value) === index);
        mainlineLanes.forEach((laneKey) => {
          const continuityTargetId = nextLayer.find((candidate) => {
            const candidateMainlineLanes = (Array.isArray(candidate?.node?.mainlineLanes) ? candidate.node.mainlineLanes : [])
              .map((value) => normalizeTrimmedString(value, '').toLowerCase())
              .filter(Boolean);
            return candidateMainlineLanes.includes(laneKey);
          })?.id;
          if (continuityTargetId && !targetIds.includes(continuityTargetId)) {
            targetIds.push(continuityTargetId);
          }
        });
        assignNodeNext(entry.node, targetIds);
      });
    }

    ensureMinimumLaneCrossovers(chapterConfig.nodes);
    // Hard guarantees:
    // 1. Before NODE 07 there is at least one upward step.
    // 2. After NODE 12 there is at least one downward step.
    appendNodeNextTarget(chapterConfig.nodes['node06-b-route'], chapterConfig.nodes['node07-a-route']?.id || '');
    appendNodeNextTarget(chapterConfig.nodes['node12-a-route'], chapterConfig.nodes['node13-b-route']?.id || '');
    // Slightly raise weaving frequency in the middle, but keep it controlled.
    appendNodeNextTarget(chapterConfig.nodes['node08-b-route'], chapterConfig.nodes['node09-c-route']?.id || '');
    appendNodeNextTarget(chapterConfig.nodes['node11-c-route'], chapterConfig.nodes['node12-b-route']?.id || '');

    const collapseLayer = layers.get(collapseIndex) || [];
    const collapseByLane = getLaneEntryMap(collapseLayer);
    const finalLayer = layers.get(finaleIndex) || [];
    const finalNodeId = finalLayer[0]?.id || '';
    (layers.get(14) || []).forEach((entry) => {
      const targetLane = getNearestLaneTarget(entry.lane, collapsePair);
      assignNodeNext(entry.node, [collapseByLane.get(targetLane)?.id || '']);
    });
    collapseLayer.forEach((entry) => {
      assignNodeNext(entry.node, [finalNodeId]);
    });

    const attachNodeIds = Array.isArray(generatedTail.attachFromNodeIds) && generatedTail.attachFromNodeIds.length
      ? generatedTail.attachFromNodeIds
      : [normalizeTrimmedString(generatedTail.attachFromNodeId, '')].filter(Boolean);
    const openingNodeIds = openingLayer.map((entry) => entry.id);
    attachNodeIds.forEach((nodeId) => {
      const attachNode = chapterConfig.nodes[nodeId];
      if (!attachNode) return;
      assignNodeNext(attachNode, openingNodeIds);
    });

    chapterConfig.totalNodes = totalNodes;
    if (!chapterConfig.meta || typeof chapterConfig.meta !== 'object') chapterConfig.meta = {};
    chapterConfig.meta.totalNodes = totalNodes;
    applyGeneratedNodeNames(chapterConfig, chapterSeed, totalNodes);
    return chapterConfig;
  }

  function applyGeneratedLayerTransitions(currentLayer, nextLayer, selectionPattern) {
    if (!Array.isArray(currentLayer) || !currentLayer.length) return;
    if (!Array.isArray(nextLayer) || !nextLayer.length) {
      currentLayer.forEach((entry) => {
        entry.node.next = { mode: 'none' };
      });
      return;
    }

    const nextIds = nextLayer.map((entry) => entry.id);
    if (currentLayer.length === 1) {
      currentLayer[0].node.next = nextIds.length === 1
        ? { mode: 'forced', nodeId: nextIds[0] }
        : { mode: 'choice', options: [...nextIds] };
      return;
    }

    if (nextIds.length === 1) {
      currentLayer.forEach((entry) => {
        entry.node.next = { mode: 'forced', nodeId: nextIds[0] };
      });
      return;
    }

    const selections = normalizeGeneratedSelectionPattern(selectionPattern, currentLayer.length, nextIds.length);
    currentLayer.forEach((entry, entryIndex) => {
      const selectedIds = (selections[entryIndex] || [])
        .map((targetIndex) => nextIds[targetIndex])
        .filter(Boolean);
      const uniqueIds = [...new Set(selectedIds)];
      entry.node.next = uniqueIds.length <= 1
        ? { mode: 'forced', nodeId: uniqueIds[0] || nextIds[0] }
        : { mode: 'choice', options: uniqueIds };
    });
  }

  function buildGeneratedChapterTail(chapterConfig) {
    if (!chapterConfig?.nodes || typeof chapterConfig.nodes !== 'object') return chapterConfig;
    const generatedTail = chapterConfig?.runtime?.generatedTail;
    if (!generatedTail?.enabled) return chapterConfig;
    if (generatedTail.mode === 'lane_backbone') {
      return buildLaneBackboneChapterTail(chapterConfig, generatedTail);
    }

    const totalNodes = Math.max(chapterConfig.totalNodes || 1, generatedTail.totalNodes || 1);
    const startNodeIndex = Math.max(1, Math.min(totalNodes, generatedTail.startNodeIndex || 1));
    const segmentSizes = Array.isArray(generatedTail.segmentSizes) ? generatedTail.segmentSizes : [];
    const chapterSeed = normalizeTrimmedString(chapterConfig?.runtime?.seed, DEFAULT_WORLD_ACT.seed);
    const selectedShapeProfile = selectGeneratedShapeProfile(generatedTail, chapterSeed);

    Object.entries(chapterConfig.nodes).forEach(([nodeId, nodeRuntime]) => {
      const nodeIndex = Math.max(1, Math.round(Number(nodeRuntime?.nodeIndex) || 1));
      if (nodeIndex >= startNodeIndex) delete chapterConfig.nodes[nodeId];
    });

    const segmentPlans = [];
    if (selectedShapeProfile) {
      let generatedNodeIndex = startNodeIndex;
      selectedShapeProfile.motifs.forEach((motifId, segmentIndex) => {
        if (generatedNodeIndex > totalNodes) return;
        const motif = cloneGeneratedTailMotif(motifId);
        if (!motif) return;
        segmentPlans.push({
          motifId,
          motif,
          startNodeIndex: generatedNodeIndex
        });
        generatedNodeIndex += motif.size;
      });
    } else {
      let generatedNodeIndex = startNodeIndex;
      segmentSizes.forEach((segmentSize, segmentIndex) => {
        if (generatedNodeIndex > totalNodes) return;
        const normalizedSize = Math.max(1, Math.round(Number(segmentSize) || 1));
        const isLastSegment = segmentIndex === segmentSizes.length - 1;
        const motifId = selectGeneratedMotifId(
          normalizedSize,
          generatedTail.motifPoolBySize?.[normalizedSize],
          chapterSeed,
          segmentIndex,
          isLastSegment
        );
        const motif = cloneGeneratedTailMotif(motifId);
        if (!motif) return;
        segmentPlans.push({
          motifId,
          motif,
          startNodeIndex: generatedNodeIndex
        });
        generatedNodeIndex += motif.size;
      });
    }

    const allLayerPlans = [];
    segmentPlans.forEach((segmentPlan, segmentIndex) => {
      const counts = Array.isArray(segmentPlan.motif.counts) ? segmentPlan.motif.counts : [];
      counts.forEach((layerCount, layerOffset) => {
        const nodeIndex = segmentPlan.startNodeIndex + layerOffset;
        if (nodeIndex > totalNodes) return;
        const normalizedLayerCount = nodeIndex >= totalNodes ? 1 : Math.max(1, Math.round(Number(layerCount) || 1));
        const previousLayerCount = allLayerPlans.length ? allLayerPlans[allLayerPlans.length - 1].length : 1;
        const nextLayerCount = layerOffset + 1 < counts.length
          ? counts[layerOffset + 1]
          : (segmentPlans[segmentIndex + 1]?.motif?.counts?.[0] || 0);
        const role = getGeneratedNodeRole(nodeIndex, normalizedLayerCount, totalNodes, previousLayerCount, nextLayerCount);
        const layer = Array.from({ length: normalizedLayerCount }, (_, branchIndex) => {
          const node = createGeneratedNodeSkeleton({ nodeIndex, layerCount: normalizedLayerCount, branchIndex, role });
          chapterConfig.nodes[node.id] = node;
          return { id: node.id, node };
        });
        allLayerPlans.push(layer);
      });
    });

    let globalLayerIndex = 0;
    segmentPlans.forEach((segmentPlan) => {
      const transitions = Array.isArray(segmentPlan.motif.transitions) ? segmentPlan.motif.transitions : [];
      transitions.forEach((transitionPattern) => {
        const currentLayer = allLayerPlans[globalLayerIndex];
        const nextLayer = allLayerPlans[globalLayerIndex + 1];
        applyGeneratedLayerTransitions(currentLayer, nextLayer, transitionPattern);
        globalLayerIndex += 1;
      });
      globalLayerIndex += 1;
    });

    for (let layerIndex = 0; layerIndex < allLayerPlans.length - 1; layerIndex += 1) {
      const currentLayer = allLayerPlans[layerIndex];
      const nextLayer = allLayerPlans[layerIndex + 1];
      const hasAssignedTransition = currentLayer.some((entry) => entry.node?.next && normalizeTrimmedString(entry.node.next.mode, '') !== 'none');
      if (hasAssignedTransition) continue;
      const bridgePattern = selectBridgePattern(
        currentLayer.length,
        nextLayer.length,
        `${chapterSeed}|bridge|${startNodeIndex + layerIndex}`
      );
      applyGeneratedLayerTransitions(currentLayer, nextLayer, bridgePattern);
    }

    const attachNodeId = normalizeTrimmedString(generatedTail.attachFromNodeId, '');
    const attachNode = attachNodeId ? chapterConfig.nodes[attachNodeId] : null;
    if (attachNode && allLayerPlans[0]?.length) {
      const firstLayerIds = allLayerPlans[0].map((entry) => entry.id);
      attachNode.next = firstLayerIds.length === 1
        ? { mode: 'forced', nodeId: firstLayerIds[0] }
        : { mode: 'choice', options: firstLayerIds };
    }

    chapterConfig.totalNodes = totalNodes;
    if (!chapterConfig.meta || typeof chapterConfig.meta !== 'object') chapterConfig.meta = {};
    chapterConfig.meta.totalNodes = totalNodes;
    return chapterConfig;
  }

  function normalizeCountMap(value, allowDecimal) {
    const source = value && typeof value === 'object' ? value : {};
    const counts = Object.fromEntries(ACT_RESOURCE_KEYS.map((key) => [key, 0]));
    Object.entries(source).forEach(([rawKey, rawValue]) => {
      const key = normalizeActResourceKey(rawKey, '');
      if (!key) return;
      const raw = Number(rawValue) || 0;
      counts[key] += allowDecimal ? Math.max(0, raw) : Math.max(0, Math.round(raw));
    });
    return counts;
  }

  function normalizeActStage(value) {
    const normalized = normalizeTrimmedString(value, DEFAULT_WORLD_ACT.stage).toLowerCase();
    return ACT_STAGE_VALUES.includes(normalized) ? normalized : DEFAULT_WORLD_ACT.stage;
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

  function normalizeEncounterCharacterStatus(value) {
    const normalized = normalizeTrimmedString(value, 'locked').toLowerCase();
    return ENCOUNTER_CHARACTER_STATUS_VALUES.includes(normalized) ? normalized : 'locked';
  }

  function normalizeEncounterQueueStatus(value) {
    const normalized = normalizeTrimmedString(value, 'queued').toLowerCase();
    return ENCOUNTER_QUEUE_STATUS_VALUES.includes(normalized) ? normalized : 'queued';
  }

  function normalizeEncounterQueueType(value) {
    const normalized = normalizeTrimmedString(value, 'first_meet').toLowerCase();
    return ENCOUNTER_QUEUE_TYPE_VALUES.includes(normalized) ? normalized : 'first_meet';
  }

  function createDefaultEncounterCharacterState(charKey) {
    return {
      status: 'locked',
      firstMeetDone: false,
      preSignalDone: false,
      cooldownUntilNodeIndex: 0,
      queuedRequestId: '',
      placedNodeId: '',
      introducedNodeId: '',
      introducedAtNodeIndex: 0,
      lastEvaluatedNodeIndex: 0,
      reasonCodes: [],
      firstMeetHint: '',
      debugLabel: normalizeTrimmedString(charKey, '').toUpperCase()
    };
  }

  function normalizeEncounterReasonCodes(value) {
    const list = Array.isArray(value) ? value : [];
    return list
      .map((item) => normalizeTrimmedString(item, '').toLowerCase())
      .filter((item, index, source) => item && source.indexOf(item) === index);
  }

  function normalizeEncounterCharacterState(rawValue, charKey) {
    const source = rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue) ? rawValue : {};
    const normalizedCharKey = normalizeTrimmedString(source.charKey || charKey, '').toUpperCase();
    const state = {
      ...createDefaultEncounterCharacterState(normalizedCharKey),
      status: normalizeEncounterCharacterStatus(source.status),
      firstMeetDone: source.firstMeetDone === true || source.status === 'introduced',
      preSignalDone: source.preSignalDone === true,
      cooldownUntilNodeIndex: Math.max(0, Math.round(Number(source.cooldownUntilNodeIndex) || 0)),
      queuedRequestId: normalizeTrimmedString(source.queuedRequestId, ''),
      placedNodeId: normalizeTrimmedString(source.placedNodeId, ''),
      introducedNodeId: normalizeTrimmedString(source.introducedNodeId, ''),
      introducedAtNodeIndex: Math.max(0, Math.round(Number(source.introducedAtNodeIndex) || 0)),
      lastEvaluatedNodeIndex: Math.max(0, Math.round(Number(source.lastEvaluatedNodeIndex) || 0)),
      reasonCodes: normalizeEncounterReasonCodes(source.reasonCodes),
      firstMeetHint: normalizeTrimmedString(source.firstMeetHint || source.hint || source.summary, ''),
      debugLabel: normalizeTrimmedString(source.debugLabel || source.label, normalizedCharKey)
    };
    if (state.firstMeetDone && state.status === 'locked') state.status = 'introduced';
    return state;
  }

  function normalizeEncounterQueueItem(rawItem, fallbackIndex = 0) {
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) return null;
    const charKey = normalizeTrimmedString(rawItem.charKey || rawItem.character || rawItem.key, '').toUpperCase();
    if (!ENCOUNTER_CHARACTER_KEYS.includes(charKey)) return null;
    const type = normalizeEncounterQueueType(rawItem.type);
    const status = normalizeEncounterQueueStatus(rawItem.status);
    const targetNodeId = normalizeTrimmedString(rawItem.targetNodeId || rawItem.nodeId, '');
    return {
      ...deepClone(rawItem),
      id: normalizeTrimmedString(rawItem.id, `enc:${charKey}:${type}:${targetNodeId || 'unplaced'}:${fallbackIndex}`),
      charKey,
      type,
      status,
      targetNodeId,
      targetNodeIndex: Math.max(0, Math.round(Number(rawItem.targetNodeIndex ?? rawItem.nodeIndex) || 0)),
      targetPhaseIndex: Math.max(0, Math.min(3, Math.round(Number(rawItem.targetPhaseIndex ?? rawItem.phaseIndex) || 0))),
      createdNodeIndex: Math.max(0, Math.round(Number(rawItem.createdNodeIndex) || 0)),
      expiresNodeIndex: Math.max(0, Math.round(Number(rawItem.expiresNodeIndex) || 0)),
      priority: Math.round(Number(rawItem.priority) || 0),
      reasonCodes: normalizeEncounterReasonCodes(rawItem.reasonCodes),
      debugLabel: normalizeTrimmedString(rawItem.debugLabel || rawItem.label, charKey),
      firstMeetHint: normalizeTrimmedString(rawItem.firstMeetHint || rawItem.hint || rawItem.summary, '')
    };
  }

  function normalizeCharacterEncounterState(value) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const rawCharacters = source.characters && typeof source.characters === 'object' && !Array.isArray(source.characters)
      ? source.characters
      : source;
    const characters = {};
    ENCOUNTER_CHARACTER_KEYS.forEach((charKey) => {
      characters[charKey] = normalizeEncounterCharacterState(rawCharacters?.[charKey], charKey);
    });
    const queue = (Array.isArray(source.queue) ? source.queue : [])
      .map((item, index) => normalizeEncounterQueueItem(item, index))
      .filter(Boolean);
    return {
      meta: {
        version: Math.max(1, Math.round(Number(source?.meta?.version) || 1)),
        lastFirstMeetNodeIndex: Math.max(0, Math.round(Number(source?.meta?.lastFirstMeetNodeIndex) || 0)),
        lastSignalNodeIndex: Math.max(0, Math.round(Number(source?.meta?.lastSignalNodeIndex) || 0))
      },
      queue,
      characters
    };
  }

  function getActiveEncounterCharacterKeys(characterEncounterInput) {
    const encounter = normalizeCharacterEncounterState(characterEncounterInput);
    const active = new Set();
    Object.entries(encounter.characters).forEach(([charKey, state]) => {
      if (state.status !== 'locked' || state.firstMeetDone || state.preSignalDone) active.add(charKey);
    });
    encounter.queue.forEach((item) => active.add(item.charKey));
    return Array.from(active);
  }

  function getCharacterEncounterFirstMeetMap(actStateInput, currentNodeId) {
    const actState = normalizeActState(actStateInput);
    const encounter = normalizeCharacterEncounterState(actState.characterEncounter);
    const nodeId = normalizeTrimmedString(currentNodeId, '');
    const hints = {};
    Object.entries(encounter.characters).forEach(([charKey, state]) => {
      if (state.status !== 'introduced' && state.status !== 'first_meet') return;
      if (state.introducedNodeId && state.introducedNodeId !== nodeId) return;
      if (!state.firstMeetHint) return;
      hints[charKey] = state.firstMeetHint;
    });
    return hints;
  }

  function calculateEncounterSpentScore(actStateInput, weightsInput) {
    const spent = normalizeCountMap(actStateInput?.resourceSpent, false);
    const weights = weightsInput && typeof weightsInput === 'object' ? weightsInput : {};
    return ACT_RESOURCE_KEYS.reduce((total, key) => {
      const weight = Number(weights[key]) || 0;
      return total + (Math.max(0, spent[key] || 0) * weight);
    }, 0);
  }

  function getEncounterRuntimeDay(contextInput) {
    const context = contextInput && typeof contextInput === 'object' ? contextInput : {};
    const candidates = [
      context.day,
      context.worldDay,
      context.worldClock?.day,
      context.clock?.day,
      context.world?.clock?.day
    ];
    for (const candidate of candidates) {
      const day = Math.round(Number(candidate) || 0);
      if (day > 0) return day;
    }
    return 0;
  }

  function getEncounterRuntimeGeo(contextInput) {
    const context = contextInput && typeof contextInput === 'object' ? contextInput : {};
    return normalizeTrimmedString(
      context.geo
        || context.layer
        || context.locationLayer
        || context.location?.layer
        || context.world?.location?.layer
        || context.world?.geo,
      ''
    ).toUpperCase();
  }

  function collectEncounterRuntimeTags(contextInput, configInput, currentNodeId) {
    const tags = [];
    const pushTag = (value) => {
      const tag = normalizeTrimmedString(value, '').toLowerCase();
      if (tag && !tags.includes(tag)) tags.push(tag);
    };
    const pushText = (value) => {
      const text = normalizeTrimmedString(value, '').toLowerCase();
      if (text) tags.push(text);
    };
    const context = contextInput && typeof contextInput === 'object' ? contextInput : {};
    [
      ...(Array.isArray(context.tags) ? context.tags : []),
      ...(Array.isArray(context.location?.tags) ? context.location.tags : []),
      ...(Array.isArray(context.flags) ? context.flags : [])
    ].forEach(pushTag);
    pushTag(context.sceneTag);
    pushTag(context.nodeTag);

    const node = getNodeRuntime(configInput, currentNodeId);
    const nodeTags = [
      ...(Array.isArray(node?.tags) ? node.tags : []),
      ...(Array.isArray(node?.ui?.tags) ? node.ui.tags : [])
    ];
    nodeTags.forEach(pushTag);
    pushText(node?.id);
    pushText(node?.ui?.label);
    pushText(node?.ui?.subtitle);
    pushText(node?.narrative?.title);
    pushText(node?.narrative?.subtitle);
    pushText(node?.narrative?.overview);
    pushText(node?.narrative?.guidance);
    return tags;
  }

  function isEncounterCharacterIntroduced(actStateInput, heroStateInput, charKeyInput) {
    const charKey = normalizeTrimmedString(charKeyInput, '').toUpperCase();
    if (!ENCOUNTER_CHARACTER_KEYS.includes(charKey)) return false;
    const encounter = normalizeCharacterEncounterState(actStateInput?.characterEncounter);
    const encounterChar = encounter.characters[charKey];
    if (encounterChar?.firstMeetDone || encounterChar?.status === 'introduced' || encounterChar?.status === 'first_meet') return true;
    const hero = heroStateInput && typeof heroStateInput === 'object' ? heroStateInput : {};
    const heroCast = hero.cast && typeof hero.cast === 'object' ? hero.cast : {};
    const heroRoster = hero.roster && typeof hero.roster === 'object' ? hero.roster : {};
    return heroCast[charKey]?.introduced === true
      || heroCast[charKey]?.activated === true
      || heroRoster[charKey]?.introduced === true;
  }

  function hasActiveEncounterForCharacter(encounterInput, charKeyInput) {
    const encounter = normalizeCharacterEncounterState(encounterInput);
    const charKey = normalizeTrimmedString(charKeyInput, '').toUpperCase();
    const state = encounter.characters[charKey];
    if (!state) return false;
    if (state.firstMeetDone || state.status === 'introduced' || state.status === 'first_meet') return true;
    if (state.status === 'queued' || state.status === 'pre_signal' || state.queuedRequestId || state.placedNodeId) return true;
    return encounter.queue.some((item) => item.charKey === charKey && !ENCOUNTER_TERMINAL_QUEUE_STATUSES.includes(item.status));
  }

  function evaluateCharacterEncounterEligibility(actStateInput, heroStateInput = {}, contextInput = {}) {
    const act = normalizeActState(actStateInput);
    const config = getChapter(act.id);
    const currentNodeId = getCurrentActNodeId(act);
    const day = getEncounterRuntimeDay(contextInput);
    const geo = getEncounterRuntimeGeo(contextInput);
    const tags = collectEncounterRuntimeTags(contextInput, config, currentNodeId);
    const hero = heroStateInput && typeof heroStateInput === 'object' ? heroStateInput : {};
    const funds = Math.max(0, Number(hero.funds ?? hero.assets ?? hero.money) || 0);
    const crisis = Math.max(0, Math.round(Number(act.crisis) || 0));
    const encounter = normalizeCharacterEncounterState(act.characterEncounter);
    const eligible = [];
    const blocked = [];

    ENCOUNTER_CHARACTER_KEYS.forEach((charKey) => {
      const rule = ENCOUNTER_RULES[charKey];
      const reasons = [];
      if (!rule) reasons.push('missing_rule');
      if (hasActiveEncounterForCharacter(encounter, charKey)) reasons.push('active_or_done');
      if (Number(rule?.minDay) > 0) {
        if (!day) reasons.push('missing_day');
        else if (day < Number(rule.minDay)) reasons.push('day');
      }
      if (Number(rule?.minNodeIndex) > 0 && act.nodeIndex < Number(rule.minNodeIndex)) reasons.push('node_index');
      if (Number(rule?.crisisMin) > 0 && crisis < Number(rule.crisisMin)) reasons.push('crisis');
      if (Number(rule?.minFunds) > 0 && funds < Number(rule.minFunds)) reasons.push('funds');
      if (rule?.requiredGeo) {
        if (!geo) reasons.push('missing_geo');
        else if (geo !== normalizeTrimmedString(rule.requiredGeo, '').toUpperCase()) reasons.push('geo');
      }
      const requiredTags = Array.isArray(rule?.requiredTags) ? rule.requiredTags : [];
      if (requiredTags.length && !requiredTags.some((tag) => tags.some((runtimeTag) => runtimeTag.includes(normalizeTrimmedString(tag, '').toLowerCase())))) {
        reasons.push(tags.length ? 'tag' : 'missing_tags');
      }
      const requiredIntroduced = Array.isArray(rule?.requiredIntroduced) ? rule.requiredIntroduced : [];
      requiredIntroduced.forEach((requiredCharKey) => {
        if (!isEncounterCharacterIntroduced(act, hero, requiredCharKey)) reasons.push(`requires_${normalizeTrimmedString(requiredCharKey, '').toLowerCase()}`);
      });
      if (rule?.requiresChurchEvent) {
        const hasChurchEvent = contextInput?.churchEvent === true
          || (Array.isArray(contextInput?.flags) && contextInput.flags.some((flag) => normalizeTrimmedString(flag, '').toLowerCase().includes('church')));
        if (!hasChurchEvent) reasons.push('missing_church_event');
      }

      const spentScore = calculateEncounterSpentScore(act, rule?.spentWeights);
      if (Number(rule?.minSpentScore) > 0 && spentScore < Number(rule.minSpentScore)) reasons.push('spent_score');

      const result = {
        charKey,
        eligible: reasons.length === 0,
        reasonCodes: reasons,
        priority: Math.round((spentScore * 2) + (crisis * 1.5) + (act.nodeIndex * 3) + (10 - (Number(rule?.rarity) || 3))),
        spentScore,
        debugLabel: normalizeTrimmedString(rule?.debugLabel, charKey),
        firstMeetHint: normalizeTrimmedString(rule?.firstMeetHint, '')
      };
      if (result.eligible) eligible.push(result);
      else blocked.push(result);
    });

    eligible.sort((left, right) => right.priority - left.priority || ENCOUNTER_CHARACTER_KEYS.indexOf(left.charKey) - ENCOUNTER_CHARACTER_KEYS.indexOf(right.charKey));
    return { eligible, blocked, context: { day, geo, tags, currentNodeId, funds, crisis } };
  }

  function buildEncounterRequestId(actStateInput, charKey, type, fallbackIndex = 0) {
    return [
      'enc',
      normalizeTrimmedString(actStateInput?.id, DEFAULT_WORLD_ACT.id),
      normalizeTrimmedString(charKey, '').toUpperCase(),
      normalizeTrimmedString(type, 'first_meet').toLowerCase(),
      Math.max(1, Math.round(Number(actStateInput?.nodeIndex) || 1)),
      Math.max(0, fallbackIndex)
    ].join(':');
  }

  function findEncounterPlacementCandidates(actStateInput, configInput, options = {}) {
    const act = normalizeActState(actStateInput);
    const config = configInput || getChapter(act.id);
    const distance = Math.max(1, Math.min(3, Math.round(Number(options.distance) || 2)));
    const currentIndex = Math.max(1, Math.round(Number(act.nodeIndex) || 1));
    const currentNodeId = normalizeTrimmedString(
      act.route_history[currentIndex - 1] || getCurrentActNodeId(act),
      ''
    );
    const pastNodes = new Set(act.route_history.slice(0, currentIndex));
    const activeTargets = new Set(
      normalizeCharacterEncounterState(act.characterEncounter).queue
        .filter((item) => item.status === 'placed' && item.targetNodeId)
        .map((item) => item.targetNodeId)
    );
    const candidates = [];
    const seen = new Set();
    const topology = buildTopologyFromV2Nodes(config);
    const outgoingByNode = topology.reduce((acc, edge) => {
      if (!acc.has(edge.from)) acc.set(edge.from, []);
      acc.get(edge.from).push(edge.to);
      return acc;
    }, new Map());
    let frontier = currentNodeId ? [currentNodeId] : [];

    for (let step = 1; step <= distance; step += 1) {
      const nodeIndex = currentIndex + step;
      const plannedNodeId = normalizeTrimmedString(act.route_history[nodeIndex - 1], '');
      const nextIds = [];
      const nextSeen = new Set();

      if (plannedNodeId) {
        nextIds.push(plannedNodeId);
        nextSeen.add(plannedNodeId);
      } else {
        frontier.forEach((nodeId) => {
          (outgoingByNode.get(nodeId) || []).forEach((toId) => {
            if (!toId || nextSeen.has(toId)) return;
            nextSeen.add(toId);
            nextIds.push(toId);
          });
        });
      }

      nextIds.forEach((nodeId) => {
        if (!nodeId || seen.has(nodeId) || pastNodes.has(nodeId) || activeTargets.has(nodeId)) return;
        const nodeRuntime = getNodeRuntime(config, nodeId);
        const targetNodeIndex = Math.max(1, Math.round(Number(nodeRuntime?.nodeIndex) || nodeIndex));
        if (targetNodeIndex <= currentIndex || targetNodeIndex > currentIndex + distance) return;
        seen.add(nodeId);
        candidates.push({ nodeId, nodeIndex: targetNodeIndex, distance: step, weight: 1 });
      });

      frontier = nextIds;
      if (!frontier.length) break;
    }

    if (!candidates.length && !currentNodeId) {
      for (let nodeIndex = currentIndex + 1; nodeIndex <= currentIndex + distance; nodeIndex += 1) {
        getNodeIdsAtIndex(config, nodeIndex).forEach((nodeId) => {
          if (!nodeId || seen.has(nodeId) || pastNodes.has(nodeId) || activeTargets.has(nodeId)) return;
          seen.add(nodeId);
          candidates.push({ nodeId, nodeIndex, distance: nodeIndex - currentIndex, weight: 1 });
        });
      }
    }

    return candidates;
  }

  function pickEncounterTargetPhaseIndex(actStateInput, requestInput, targetInput, options = {}) {
    if (Number.isFinite(Number(options.targetPhaseIndex))) {
      return Math.max(0, Math.min(3, Math.round(Number(options.targetPhaseIndex) || 0)));
    }
    const seed = [
      actStateInput?.seed || DEFAULT_WORLD_ACT.seed,
      actStateInput?.id || DEFAULT_WORLD_ACT.id,
      requestInput?.id || requestInput?.charKey || 'encounter',
      targetInput?.nodeId || 'node',
      targetInput?.nodeIndex || 0,
      'phase'
    ].join('|');
    return Math.floor(mulberry32(hashStringToSeed(seed))() * 4);
  }

  function placeNextCharacterEncounter(actStateInput, configInput, options = {}) {
    const act = normalizeActState(actStateInput);
    const encounter = normalizeCharacterEncounterState(act.characterEncounter);
    const currentNodeIndex = Math.max(1, Math.round(Number(act.nodeIndex) || 1));
    if (
      encounter.meta.lastFirstMeetNodeIndex > 0
      && currentNodeIndex <= encounter.meta.lastFirstMeetNodeIndex + Math.max(1, Math.round(Number(options.cooldownNodes) || 1))
    ) {
      act.characterEncounter = encounter;
      return { actState: act, placed: null, reason: 'cooldown' };
    }

    const requestedCharKey = normalizeTrimmedString(options.charKey || options.requestCharKey || options.forceCharKey, '').toUpperCase();
    const request = encounter.queue
      .filter((item) => (
        item.type === 'first_meet'
        && item.status === 'queued'
        && (!requestedCharKey || item.charKey === requestedCharKey)
      ))
      .sort((left, right) => right.priority - left.priority || left.createdNodeIndex - right.createdNodeIndex)[0];
    if (!request) {
      act.characterEncounter = encounter;
      return { actState: act, placed: null, reason: 'empty_queue' };
    }

    const candidates = findEncounterPlacementCandidates({ ...act, characterEncounter: encounter }, configInput, options);
    const target = pickFromCandidates(candidates, [
      act.seed || DEFAULT_WORLD_ACT.seed,
      act.id || DEFAULT_WORLD_ACT.id,
      request.id || request.charKey || 'encounter',
      currentNodeIndex,
      candidates.map((item) => item.nodeId).join(',')
    ].join('|')) || null;
    if (!target) {
      act.characterEncounter = encounter;
      return { actState: act, placed: null, reason: 'no_candidate' };
    }

    const placed = {
      ...request,
      status: 'placed',
      targetNodeId: target.nodeId,
      targetNodeIndex: target.nodeIndex,
      targetPhaseIndex: pickEncounterTargetPhaseIndex(act, request, target, options),
      expiresNodeIndex: target.nodeIndex + Math.max(1, Math.round(Number(options.expireAfterNodes) || 2))
    };
    encounter.queue = encounter.queue.map((item) => item.id === request.id ? placed : item);
    const charState = encounter.characters[request.charKey] || createDefaultEncounterCharacterState(request.charKey);
    encounter.characters[request.charKey] = {
      ...charState,
      status: 'queued',
      queuedRequestId: placed.id,
      placedNodeId: placed.targetNodeId,
      lastEvaluatedNodeIndex: currentNodeIndex,
      reasonCodes: deepClone(placed.reasonCodes),
      firstMeetHint: placed.firstMeetHint || charState.firstMeetHint,
      debugLabel: placed.debugLabel || charState.debugLabel
    };
    act.characterEncounter = encounter;
    return { actState: act, placed };
  }

  function enqueueEligibleCharacterEncounters(actStateInput, heroStateInput = {}, options = {}) {
    const act = normalizeActState(actStateInput);
    const encounter = normalizeCharacterEncounterState(act.characterEncounter);
    const evaluated = options.eligibility || evaluateCharacterEncounterEligibility({ ...act, characterEncounter: encounter }, heroStateInput, options.context || {});
    const limit = Math.max(1, Math.round(Number(options.limit) || 1));
    const queued = [];
    evaluated.eligible.slice(0, limit).forEach((candidate) => {
      if (hasActiveEncounterForCharacter(encounter, candidate.charKey)) return;
      const request = {
        id: buildEncounterRequestId(act, candidate.charKey, 'first_meet', encounter.queue.length + queued.length),
        charKey: candidate.charKey,
        type: 'first_meet',
        status: 'queued',
        targetNodeId: '',
        targetNodeIndex: 0,
        targetPhaseIndex: 0,
        createdNodeIndex: Math.max(1, Math.round(Number(act.nodeIndex) || 1)),
        expiresNodeIndex: 0,
        priority: candidate.priority,
        reasonCodes: deepClone(candidate.reasonCodes),
        debugLabel: candidate.debugLabel,
        firstMeetHint: candidate.firstMeetHint
      };
      encounter.queue.push(request);
      encounter.characters[candidate.charKey] = {
        ...(encounter.characters[candidate.charKey] || createDefaultEncounterCharacterState(candidate.charKey)),
        status: 'queued',
        queuedRequestId: request.id,
        placedNodeId: '',
        lastEvaluatedNodeIndex: Math.max(1, Math.round(Number(act.nodeIndex) || 1)),
        reasonCodes: deepClone(request.reasonCodes),
        firstMeetHint: request.firstMeetHint,
        debugLabel: request.debugLabel
      };
      queued.push(request);
    });
    act.characterEncounter = encounter;
    if (options.place === false || queued.length === 0) return { actState: act, queued, placed: null, evaluated };
    const placedResult = placeNextCharacterEncounter(act, options.config || getChapter(act.id), options);
    return { actState: placedResult.actState, queued, placed: placedResult.placed, evaluated };
  }

  function consumeCharacterEncounterForNode(actStateInput, nodeIdInput, options = {}) {
    const act = normalizeActState(actStateInput);
    const encounter = normalizeCharacterEncounterState(act.characterEncounter);
    const nodeId = normalizeTrimmedString(nodeIdInput || getCurrentActNodeId(act), '');
    const phaseIndex = Number.isFinite(Number(options.phaseIndex))
      ? Math.max(0, Math.min(3, Math.round(Number(options.phaseIndex) || 0)))
      : null;
    const request = encounter.queue.find((item) => (
      item.type === 'first_meet'
      && item.status === 'placed'
      && item.targetNodeId === nodeId
      && (phaseIndex === null || item.targetPhaseIndex === phaseIndex)
    ));
    if (!request) {
      act.characterEncounter = encounter;
      return { actState: act, consumed: null };
    }

    const currentNodeIndex = Math.max(1, Math.round(Number(act.nodeIndex) || 1));
    const rule = ENCOUNTER_RULES[request.charKey] || {};
    const firstMeetHint = normalizeTrimmedString(request.firstMeetHint || rule.firstMeetHint, '');
    const consumed = {
      ...request,
      status: 'triggered',
      triggeredNodeId: nodeId,
      triggeredNodeIndex: currentNodeIndex,
      triggeredPhaseIndex: phaseIndex === null ? request.targetPhaseIndex : phaseIndex
    };
    encounter.queue = encounter.queue.map((item) => item.id === request.id ? consumed : item);
    encounter.characters[request.charKey] = {
      ...(encounter.characters[request.charKey] || createDefaultEncounterCharacterState(request.charKey)),
      status: 'introduced',
      firstMeetDone: true,
      queuedRequestId: '',
      placedNodeId: '',
      introducedNodeId: nodeId,
      introducedAtNodeIndex: currentNodeIndex,
      cooldownUntilNodeIndex: currentNodeIndex + Math.max(1, Math.round(Number(options.cooldownNodes) || 1)),
      reasonCodes: deepClone(request.reasonCodes),
      firstMeetHint,
      debugLabel: normalizeTrimmedString(request.debugLabel || rule.debugLabel, request.charKey)
    };
    encounter.meta.lastFirstMeetNodeIndex = currentNodeIndex;
    act.characterEncounter = encounter;
    act.pendingFirstMeet = {
      ...normalizePendingFirstMeet(act.pendingFirstMeet),
      ...(firstMeetHint ? { [request.charKey]: firstMeetHint } : {})
    };
    return { actState: act, consumed };
  }

  function updateCharacterEncountersForNodeEntry(actStateInput, heroStateInput = {}, configInput = null, contextInput = {}) {
    const act = normalizeActState(actStateInput);
    const config = configInput || getChapter(act.id);
    const enqueueResult = enqueueEligibleCharacterEncounters(act, heroStateInput, {
      context: contextInput,
      config,
      limit: 1,
      place: true
    });
    return {
      actState: enqueueResult.actState,
      consumed: null,
      queued: enqueueResult.queued,
      placed: enqueueResult.placed,
      evaluated: enqueueResult.evaluated
    };
  }

  function debugForceCharacterEncounter(actStateInput, charKeyInput, configInput = null, options = {}) {
    const charKey = normalizeTrimmedString(charKeyInput, '').toUpperCase();
    const act = normalizeActState(actStateInput);
    const config = configInput || getChapter(act.id);
    const encounter = normalizeCharacterEncounterState(act.characterEncounter);
    const rule = ENCOUNTER_RULES[charKey] || null;
    if (!ENCOUNTER_CHARACTER_KEYS.includes(charKey) || !rule) {
      act.characterEncounter = encounter;
      return { actState: act, applied: false, reason: 'unknown_character' };
    }
    if (encounter.characters[charKey]?.firstMeetDone || encounter.characters[charKey]?.status === 'introduced') {
      act.characterEncounter = encounter;
      return { actState: act, applied: false, reason: 'already_introduced' };
    }
    const active = encounter.queue.find((item) => item.charKey === charKey && !ENCOUNTER_TERMINAL_QUEUE_STATUSES.includes(item.status));
    if (active?.status === 'placed') {
      act.characterEncounter = encounter;
      return {
        actState: act,
        applied: true,
        request: active,
        placed: active,
        reason: 'already_placed'
      };
    }
    if (!active) {
      const request = {
        id: buildEncounterRequestId(act, charKey, 'first_meet', encounter.queue.length),
        charKey,
        type: 'first_meet',
        status: 'queued',
        targetNodeId: '',
        targetNodeIndex: 0,
        targetPhaseIndex: 0,
        createdNodeIndex: Math.max(1, Math.round(Number(act.nodeIndex) || 1)),
        expiresNodeIndex: 0,
        priority: 999,
        reasonCodes: ['debug_force'],
        debugLabel: normalizeTrimmedString(rule.debugLabel, charKey),
        firstMeetHint: normalizeTrimmedString(rule.firstMeetHint, '')
      };
      encounter.queue.push(request);
      encounter.characters[charKey] = {
        ...(encounter.characters[charKey] || createDefaultEncounterCharacterState(charKey)),
        status: 'queued',
        queuedRequestId: request.id,
        placedNodeId: '',
        lastEvaluatedNodeIndex: Math.max(1, Math.round(Number(act.nodeIndex) || 1)),
        reasonCodes: ['debug_force'],
        firstMeetHint: request.firstMeetHint,
        debugLabel: request.debugLabel
      };
    }
    act.characterEncounter = encounter;
    const placedResult = placeNextCharacterEncounter(act, config, {
      ...options,
      forceCharKey: charKey
    });
    return {
      actState: placedResult.actState,
      applied: true,
      request: placedResult.actState.characterEncounter.queue.find((item) => item.charKey === charKey && !ENCOUNTER_TERMINAL_QUEUE_STATUSES.includes(item.status)) || null,
      placed: placedResult.placed,
      reason: placedResult.reason || ''
    };
  }

  function getNodeDisplayLabel(nodeId, nodeRuntime) {
    const rawLabel = normalizeTrimmedString(nodeRuntime?.ui?.label, '');
    if (rawLabel) return rawLabel;
    return normalizeTrimmedString(String(nodeId || '').replace(/-/g, '_').toUpperCase(), 'UNASSIGNED_NODE');
  }

  function getNodeDisplaySubLabel(nodeRuntime) {
    return normalizeTrimmedString(
      nodeRuntime?.ui?.generatedTitle,
      normalizeTrimmedString(
        nodeRuntime?.narrative?.title,
        normalizeTrimmedString(
          nodeRuntime?.ui?.subtitle,
          normalizeTrimmedString(nodeRuntime?.narrative?.subtitle, 'UNASSIGNED NODE')
        )
      )
    );
  }

  function getNodeSortWeight(nodeRuntime, fallbackIndex = 0) {
    const label = getNodeDisplayLabel('', nodeRuntime);
    const suffixMatch = label.match(/_([A-Z])$/);
    if (suffixMatch) return suffixMatch[1].charCodeAt(0) - 64;
    return fallbackIndex + 1;
  }

  function getChapterNodesByIndex(config) {
    const grouped = new Map();
    Object.entries(config?.nodes || {}).forEach(([nodeId, nodeRuntime]) => {
      const nodeIndex = Math.max(1, Math.round(Number(nodeRuntime?.nodeIndex) || 1));
      if (!grouped.has(nodeIndex)) grouped.set(nodeIndex, []);
      grouped.get(nodeIndex).push([nodeId, nodeRuntime]);
    });
    return Array.from(grouped.entries())
      .sort((left, right) => left[0] - right[0])
      .map(([nodeIndex, entries]) => [
        nodeIndex,
        entries.sort((left, right) => getNodeSortWeight(left[1], 0) - getNodeSortWeight(right[1], 0) || left[0].localeCompare(right[0]))
      ]);
  }

  function getDefaultPresentNodeId(entries) {
    if (!entries.length) return null;
    return entries[Math.floor((entries.length - 1) / 2)][0];
  }

  function buildLimitedRewardsForNode(nodeRuntime) {
    const explicitLimited = Array.isArray(nodeRuntime?.planner?.limited)
      ? nodeRuntime.planner.limited
      : null;
    if (explicitLimited) {
      return explicitLimited
        .map((entry) => {
          const key = normalizeActResourceKey(entry?.key, '');
          if (!ACT_RESOURCE_KEYS.includes(key)) return null;
          const count = Math.max(0, Math.round(Number(entry?.count) || 0));
          if (!(count > 0)) return null;
          return {
            key,
            count,
            title: normalizeTrimmedString(entry?.title, `限定·${ACT_RESOURCE_LABEL_MAP[key]}点`),
            sublabel: normalizeTrimmedString(entry?.sublabel, `NODE-BOUND ${ACT_RESOURCE_TYPE_MAP[key]}`)
          };
        })
        .filter(Boolean);
    }

    const rewards = createRewardsForNode(nodeRuntime);
    return ACT_RESOURCE_KEYS
      .map((key) => {
        const count = Math.max(0, Math.round(Number(rewards[key]) || 0));
        if (!(count > 0)) return null;
        return {
          key,
          count,
          title: `限定·${ACT_RESOURCE_LABEL_MAP[key]}点`,
          sublabel: `NODE-BOUND ${ACT_RESOURCE_TYPE_MAP[key]}`
        };
      })
      .filter(Boolean);
  }

  function buildCampaignNodeFromEntries(nodeIndex, entries) {
    const selectableNodeIds = entries.map(([nodeId]) => nodeId);
    const defaultPresentNodeId = getDefaultPresentNodeId(entries);
    const defaultPresentNode = entries.find(([nodeId]) => nodeId === defaultPresentNodeId)?.[1] || null;
    const primaryNode = entries[0]?.[1] || null;
    const firstTransition = primaryNode?.next || { mode: 'none' };
    const isSingleNodeAtIndex = entries.length === 1;
    const template = isSingleNodeAtIndex ? 'fixed' : 'random';
    const nextForcedNodeId = firstTransition.mode === 'forced'
      ? normalizeTrimmedString(firstTransition.nodeId, null)
      : null;

    return {
      nodeIndex: nodeIndex,
      label: `NODE ${String(nodeIndex).padStart(2, '0')}`,
      template,
      title: isSingleNodeAtIndex
        ? getNodeDisplaySubLabel(primaryNode)
        : getNodeDisplaySubLabel(defaultPresentNode),
      subtitle: normalizeTrimmedString(
        (isSingleNodeAtIndex ? primaryNode : defaultPresentNode)?.narrative?.subtitle,
        isSingleNodeAtIndex
          ? getNodeDisplaySubLabel(primaryNode)
          : '多分支节点 / 选择后锁定一路'
      ),
      nodes: entries.map(([nodeId, nodeRuntime]) => ({
        id: nodeId,
        key: getNodeTypeKey(nodeRuntime) || 'vision',
        label: getNodeDisplayLabel(nodeId, nodeRuntime),
        sublabel: getNodeDisplaySubLabel(nodeRuntime),
        isBranch: !isSingleNodeAtIndex,
        lane: normalizeTrimmedString(nodeRuntime?.lane || nodeRuntime?.ui?.lane, ''),
        mainlineLanes: (Array.isArray(nodeRuntime?.mainlineLanes) ? nodeRuntime.mainlineLanes : [])
          .map((value) => normalizeTrimmedString(value, '').toLowerCase())
          .filter((value, index, list) => ['white', 'blue', 'orange', 'red'].includes(value) && list.indexOf(value) === index)
      })),
      selectableNodeIds,
      presentNode: defaultPresentNodeId,
      mapFocus: defaultPresentNodeId,
      nextRouteMode: normalizeTrimmedString(firstTransition.mode, 'none'),
      nextForcedNodeId,
      limited: isSingleNodeAtIndex ? buildLimitedRewardsForNode(primaryNode) : [],
      deadNodes: []
    };
  }

  function buildCampaignNodesFromV2(config) {
    return getChapterNodesByIndex(config).map(([nodeIndex, entries]) => buildCampaignNodeFromEntries(nodeIndex, entries));
  }

  function buildTopologyFromV2Nodes(config) {
    const topology = [];
    const seen = new Set();
    Object.entries(config?.nodes || {}).forEach(([nodeId, nodeRuntime]) => {
      const next = nodeRuntime?.next || null;
      if (!next || typeof next !== 'object') return;
      const pushEdge = (toId) => {
        const normalizedToId = normalizeTrimmedString(toId, '');
        if (!normalizedToId) return;
        const edgeKey = `${nodeId}=>${normalizedToId}`;
        if (seen.has(edgeKey)) return;
        seen.add(edgeKey);
        topology.push({ from: nodeId, to: normalizedToId });
      };
      if (next.mode === 'forced') {
        pushEdge(next.nodeId);
        return;
      }
      if (next.mode === 'choice') {
        (Array.isArray(next.options) ? next.options : []).forEach(pushEdge);
      }
    });
    return topology;
  }

  function buildFixedPhaseMarkersFromV2Nodes(config) {
    const markers = {};
    Object.entries(config?.nodes || {}).forEach(([nodeId, nodeRuntime]) => {
      const phases = Array.isArray(nodeRuntime?.phases) ? nodeRuntime.phases : [];
      phases.forEach((phase, phaseIndex) => {
        if (!phase || typeof phase !== 'object') return;
        const fixedKind = normalizeTrimmedString(phase.slot, '').toLowerCase();
        if (!phase.fixed && !phase.event) return;
        const kind = ACT_RESOURCE_KEYS.includes(fixedKind)
          ? fixedKind
          : getNodeTypeKey(nodeRuntime)
            ? getNodeTypeKey(nodeRuntime)
            : 'vision';
        if (!markers[nodeId]) markers[nodeId] = {};
        markers[nodeId][phaseIndex] = {
          kind,
          title: normalizeTrimmedString(
            phase.event?.title,
            `${getNodeDisplayLabel(nodeId, nodeRuntime)} · ${ACT_PHASE_LABELS[phaseIndex]}`
          )
        };
      });
    });
    return markers;
  }

  function getVisionReplacementForPhase(actStateInput, nodeId, phaseIndex) {
    const vision = normalizeVisionState(actStateInput?.vision);
    const pending = vision.pendingReplace;
    if (!pending || pending.status !== 'ready') return null;
    const targetNodeId = normalizeTrimmedString(pending.nodeId || pending.targetNodeId, '');
    const targetPhaseIndex = Math.max(0, Math.min(3, Math.round(Number(pending.phaseIndex) || 0)));
    const replacementKey = normalizeActResourceKey(pending.replacementKey || pending.key, '');
    if (!targetNodeId || targetNodeId !== nodeId) return null;
    if (targetPhaseIndex !== phaseIndex) return null;
    if (!ACT_RESOURCE_KEYS.includes(replacementKey)) return null;
    return {
      key: replacementKey,
      nodeId: targetNodeId,
      nodeIndex: Math.max(1, Math.round(Number(pending.nodeIndex) || Number(actStateInput?.nodeIndex) || 1)),
      phaseIndex: targetPhaseIndex,
      charges: Math.max(1, Math.round(Number(pending.charges) || 1))
    };
  }

  function getVisionReplaceChargeCount(actStateInput) {
    const pending = normalizeVisionState(actStateInput?.vision).pendingReplace;
    if (!pending || typeof pending !== 'object') return 0;
    if (!['charged', 'choosing', 'ready'].includes(pending.status)) return 0;
    return Math.max(1, Math.round(Number(pending.charges) || 1));
  }

  function consumeVisionReplacementCharge(actStateInput, consumedReplacement) {
    if (!actStateInput || typeof actStateInput !== 'object') return;
    actStateInput.vision = normalizeVisionState(actStateInput.vision);
    const remaining = Math.max(0, getVisionReplaceChargeCount(actStateInput) - 1);
    if (remaining > 0) {
      actStateInput.vision.pendingReplace = {
        status: 'charged',
        charges: remaining,
        source: 'vision2'
      };
      return;
    }
    actStateInput.vision.pendingReplace = null;
    void consumedReplacement;
  }

  function applyVisionReplacementMarkers(markersInput, actStateInput) {
    const markers = markersInput && typeof markersInput === 'object' ? markersInput : {};
    const pending = normalizeVisionState(actStateInput?.vision).pendingReplace;
    if (!pending || pending.status !== 'ready') return markers;
    const nodeId = normalizeTrimmedString(pending.nodeId || pending.targetNodeId, '');
    const phaseIndex = Math.max(0, Math.min(3, Math.round(Number(pending.phaseIndex) || 0)));
    const replacementKey = normalizeActResourceKey(pending.replacementKey || pending.key, '');
    if (!nodeId || !ACT_RESOURCE_KEYS.includes(replacementKey)) return markers;
    if (!markers[nodeId]) markers[nodeId] = {};
    markers[nodeId][phaseIndex] = {
      kind: replacementKey,
      title: `VISION REPLACE · ${ACT_RESOURCE_TYPE_MAP[replacementKey]}`
    };
    return markers;
  }

  function buildEncounterMarkersForSnapshot(actStateInput) {
    const encounter = normalizeCharacterEncounterState(actStateInput?.characterEncounter);
    return encounter.queue
      .filter((item) => item.status === 'placed' && item.targetNodeId)
      .map((item) => ({
        id: item.id,
        charKey: item.charKey,
        type: item.type,
        status: item.status,
        nodeId: item.targetNodeId,
        nodeIndex: item.targetNodeIndex,
        phaseIndex: item.targetPhaseIndex,
        label: item.charKey,
        debugLabel: item.debugLabel,
        reasonCodes: deepClone(item.reasonCodes)
      }));
  }

  function normalizePhaseSlots(value) {
    const slots = Array.isArray(value) ? value.slice(0, 4) : [];
    while (slots.length < 4) slots.push(null);

    return slots.map((slot) => {
      if (!slot || typeof slot !== 'object') return null;
      const key = normalizeActResourceKey(slot.key, '');
      if (!ACT_RESOURCE_KEYS.includes(key)) return null;
      const amount = Math.max(1, Math.min(3, Math.round(Number(slot.amount) || 1)));
      const rawSources = Array.isArray(slot.sources) && slot.sources.length
        ? slot.sources
        : Array.from({ length: amount }, () => slot.source);
      const sources = rawSources
        .slice(0, amount)
        .map((source) => source === 'reserve' ? 'reserve' : 'limited');
      while (sources.length < amount) sources.push(slot.source === 'reserve' ? 'reserve' : 'limited');
      const normalized = {
        key,
        source: slot.source === 'reserve' ? 'reserve' : 'limited',
        amount,
        sources
      };
      const tint = normalizeActResourceKey(slot.tint || slot.controlType || slot.targetKey, '');
      if (key === 'rest' && tint) {
        normalized.tint = tint;
        if (slot.tintSource === 'reserve' || slot.tintSource === 'limited') {
          normalized.tintSource = slot.tintSource;
        }
      }
      return normalized;
    });
  }

  function getChapterEntryNodeId(config) {
    const firstIndexedNode = getChapterNodesByIndex(config)?.[0]?.[1]?.[0]?.[0];
    if (typeof firstIndexedNode === 'string' && firstIndexedNode.trim()) return firstIndexedNode.trim();
    return normalizeTrimmedString(Object.keys(config?.nodes || {})[0], '');
  }

  function normalizeChapterInitialState(chapterId, chapterConfig) {
    const runtimeConfig = chapterConfig?.runtime && typeof chapterConfig.runtime === 'object'
      ? chapterConfig.runtime
      : {};
    const raw = runtimeConfig.initialState && typeof runtimeConfig.initialState === 'object'
      ? runtimeConfig.initialState
      : {};
    const entryNodeId = normalizeTrimmedString(
      raw.entryNodeId || raw.startNodeId || getChapterEntryNodeId(chapterConfig),
      ''
    );
    const rawRouteHistory = Array.isArray(raw.route_history || raw.routeHistory)
      ? (raw.route_history || raw.routeHistory)
      : [];
    const normalizedRouteHistory = rawRouteHistory
      .map((value) => normalizeTrimmedString(value, ''))
      .filter(Boolean);

    return {
      ...deepClone(DEFAULT_WORLD_ACT),
      id: chapterId,
      seed: normalizeTrimmedString(raw.seed, normalizeTrimmedString(runtimeConfig.seed, DEFAULT_WORLD_ACT.seed)),
      nodeIndex: Math.max(1, Math.round(Number(raw.nodeIndex) || 1)),
      route_history: normalizedRouteHistory.length ? normalizedRouteHistory : (entryNodeId ? [entryNodeId] : []),
      limited: normalizeCountMap(raw.limited, false),
      reserve: normalizeCountMap(raw.reserve, false),
      reserve_progress: normalizeCountMap(raw.reserve_progress, true),
      income_rate: normalizeIncomeRateMap(raw.income_rate),
      income_progress: normalizeCountMap(raw.income_progress, true),
      phase_slots: normalizePhaseSlots(raw.phase_slots || raw.phaseSlots),
      phase_index: Math.max(0, Math.min(4, Math.round(Number(raw.phase_index) || 0))),
      phase_advance: Math.max(0, Math.min(4, Math.round(Number(raw.phase_advance) || 0))),
      stage: normalizeActStage(raw.stage),
      controlledNodes: (raw.controlledNodes && typeof raw.controlledNodes === 'object' && !Array.isArray(raw.controlledNodes))
        ? deepClone(raw.controlledNodes)
        : {},
      crisis: Math.max(0, Math.min(100, Math.round(Number(raw.crisis) || 0))),
      crisisSignals: normalizeCrisisSignals(raw.crisisSignals),
      vision: normalizeVisionState(raw.vision),
      resourceSpent: normalizeCountMap(raw.resourceSpent, false),
      characterEncounter: normalizeCharacterEncounterState(raw.characterEncounter),
      pendingFirstMeet: normalizePendingFirstMeet(raw.pendingFirstMeet),
      pendingResolutions: normalizePendingResolutions(raw.pendingResolutions),
      resolutionHistory: normalizeResolutionHistory(raw.resolutionHistory),
      narrativeTension: Math.max(0, Math.min(100, Math.round(Number(raw.narrativeTension) || 0))),
      pickedPacks: (raw.pickedPacks && typeof raw.pickedPacks === 'object' && !Array.isArray(raw.pickedPacks))
        ? deepClone(raw.pickedPacks)
        : {}
    };
  }

  function normalizeCompletionTransition(value) {
    if (!value || typeof value !== 'object') return null;
    const targetChapterId = normalizeTrimmedString(value.targetChapterId, '');
    if (!targetChapterId) return null;

    return {
      targetChapterId,
      conditions: {
        minFunds: Math.max(0, Number(value?.conditions?.minFunds) || 0)
      },
      prompt: {
        title: normalizeTrimmedString(value?.prompt?.title, ''),
        body: normalizeTrimmedString(value?.prompt?.body, '')
      }
    };
  }

  function registerChapter(chapterId, chapterConfig) {
    const key = normalizeTrimmedString(chapterId, '');
    if (!key) throw new Error('registerChapter requires a chapter id.');
    if (!chapterConfig || typeof chapterConfig !== 'object') {
      throw new Error(`registerChapter(${key}) requires an object config.`);
    }

    ACT_CHAPTERS[key] = normalizeChapterConfig(key, chapterConfig);

    return getChapter(key);
  }

  function listChapters() {
    return Object.keys(ACT_CHAPTERS).sort();
  }

  function getChapter(chapterId) {
    const key = normalizeTrimmedString(chapterId, DEFAULT_CHAPTER_ID);
    const chapter = ACT_CHAPTERS[key] || ACT_CHAPTERS[DEFAULT_CHAPTER_ID] || null;
    return chapter ? deepClone(chapter) : null;
  }

  function getDefaultActState(chapterId) {
    const chapter = getChapter(chapterId);
    const initialState = chapter?.runtime?.initialState && typeof chapter.runtime.initialState === 'object'
      ? chapter.runtime.initialState
      : null;
    const id = chapter?.id || DEFAULT_WORLD_ACT.id;
    return {
      ...deepClone(DEFAULT_WORLD_ACT),
      ...(initialState ? deepClone(initialState) : {}),
      id
    };
  }

  function normalizeActState(rawActState) {
    const source = rawActState && typeof rawActState === 'object' ? rawActState : {};
    const base = getDefaultActState(source.id);
    const normalizedRouteHistory = Array.isArray(source.route_history)
      ? source.route_history.map((value) => normalizeTrimmedString(value, '')).filter(Boolean)
      : [];

    return {
      id: normalizeTrimmedString(source.id, base.id),
      seed: normalizeTrimmedString(source.seed, base.seed),
      nodeIndex: Math.max(1, Math.round(Number(source.nodeIndex) || base.nodeIndex)),
      route_history: normalizedRouteHistory.length ? normalizedRouteHistory : deepClone(base.route_history),
      limited: normalizeCountMap(source.limited, false),
      reserve: normalizeCountMap(source.reserve, false),
      reserve_progress: normalizeCountMap(source.reserve_progress, true),
      income_rate: normalizeIncomeRateMap(source.income_rate || base.income_rate),
      income_progress: normalizeCountMap(source.income_progress, true),
      phase_slots: normalizePhaseSlots(source.phase_slots),
      phase_index: Math.max(0, Math.min(4, Math.round(Number(source.phase_index) || base.phase_index))),
      phase_advance: Math.max(0, Math.min(4, Math.round(Number(source.phase_advance) || base.phase_advance))),
      stage: normalizeActStage(source.stage),
      controlledNodes: (source.controlledNodes && typeof source.controlledNodes === 'object' && !Array.isArray(source.controlledNodes))
        ? deepClone(source.controlledNodes)
        : {},
      crisis: Math.max(0, Math.min(100, Math.round(Number(source.crisis) || 0))),
      crisisSignals: normalizeCrisisSignals(source.crisisSignals),
      vision: normalizeVisionState(source.vision || base.vision),
      resourceSpent: normalizeCountMap(source.resourceSpent, false),
      characterEncounter: normalizeCharacterEncounterState(source.characterEncounter),
      pendingFirstMeet: normalizePendingFirstMeet(source.pendingFirstMeet),
      pendingResolutions: normalizePendingResolutions(source.pendingResolutions),
      resolutionHistory: normalizeResolutionHistory(source.resolutionHistory),
      narrativeTension: Math.max(0, Math.min(100, Math.round(Number(source.narrativeTension) || base.narrativeTension || 0))),
      pickedPacks: (source.pickedPacks && typeof source.pickedPacks === 'object' && !Array.isArray(source.pickedPacks))
        ? deepClone(source.pickedPacks)
        : {}
    };
  }

  function normalizeActEffectList(list) {
    const values = Array.isArray(list) ? list : [];
    return Array.from(new Set(
      values
        .map((value) => normalizeTrimmedString(value, '').toUpperCase())
        .filter((value) => NON_PLAYER_CHARACTER_KEYS.includes(value))
    ));
  }

  function getNodeV2CastOnEnter(config, nodeId) {
    const raw = config?.nodes?.[nodeId]?.cast?.onEnter;
    if (!raw || typeof raw !== 'object') return null;
    return {
      activate: normalizeActEffectList(raw.activate),
      introduce: normalizeActEffectList(raw.introduce),
      present: normalizeActEffectList(raw.present),
      mini_known: normalizeActEffectList(raw.mini_known || raw.miniKnown),
      join_party: normalizeActEffectList(raw.join_party || raw.joinParty)
    };
  }

  function getNodeV2Phase(config, nodeId, phaseIndex) {
    const phases = config?.nodes?.[nodeId]?.phases;
    if (!Array.isArray(phases)) return null;
    return phases[phaseIndex] && typeof phases[phaseIndex] === 'object'
      ? phases[phaseIndex]
      : null;
  }

  function getNormalizedActNodeEffects(config, nodeId) {
    const v2Effects = getNodeV2CastOnEnter(config, nodeId);
    if (v2Effects) return v2Effects;
    return {
      activate: [],
      introduce: [],
      present: [],
      mini_known: [],
      join_party: []
    };
  }

  // 首见文案不再从固定 node/phase 的 first_meet 配置读取。
  // 新链路只接受 characterEncounter 运行时状态，避免角色初见重新变成固定节点脚本。

  function getNormalizedActPhaseEffects(config, nodeId, phaseIndex) {
    const rawV2 = getNodeV2Phase(config, nodeId, phaseIndex)?.cast;
    if (rawV2 && typeof rawV2 === 'object') {
      return {
        activate: normalizeActEffectList(rawV2.activate),
        introduce: normalizeActEffectList(rawV2.introduce),
        present: normalizeActEffectList(rawV2.present),
        mini_known: normalizeActEffectList(rawV2.mini_known || rawV2.miniKnown),
        join_party: normalizeActEffectList(rawV2.join_party || rawV2.joinParty)
      };
    }
    return null;
  }

  function getNodeRuntime(config, nodeId) {
    return config?.nodes?.[nodeId] || null;
  }

  function getChapterRuntime(config) {
    return config?.runtime && typeof config.runtime === 'object'
      ? config.runtime
      : {};
  }

  function getNodeTypeKey(nodeRuntime) {
    if (!nodeRuntime || typeof nodeRuntime !== 'object') return '';
    const kind = normalizeActResourceKey(nodeRuntime.kind, '');
    if (ACT_RESOURCE_KEYS.includes(kind)) return kind;
    const key = normalizeActResourceKey(nodeRuntime.key, '');
    return ACT_RESOURCE_KEYS.includes(key) ? key : '';
  }

  function getChapterTotalNodes(config) {
    return Math.max(
      1,
      Math.round(Number(config?.totalNodes) || Number(config?.meta?.totalNodes) || 1)
    );
  }

  function getCurrentActNodeId(actState) {
    const routeHistory = Array.isArray(actState?.route_history) ? actState.route_history : [];
    const index = Math.max(1, Math.round(Number(actState?.nodeIndex) || 1));
    return routeHistory[index - 1] || routeHistory[routeHistory.length - 1] || '';
  }

  function getNodeLaneKey(nodeRuntime) {
    const lane = normalizeTrimmedString(nodeRuntime?.lane, '').toLowerCase();
    if (lane) return lane;
    const lanes = Array.isArray(nodeRuntime?.mainlineLanes) ? nodeRuntime.mainlineLanes : [];
    return normalizeTrimmedString(lanes[0], '').toLowerCase();
  }

  function getNodeIdsAtIndex(config, nodeIndex) {
    const targetIndex = Math.max(1, Math.round(Number(nodeIndex) || 1));
    const layer = getChapterNodesByIndex(config).find(([index]) => index === targetIndex);
    return layer ? layer[1].map(([nodeId]) => nodeId) : [];
  }

  function getJumpRouteOptions(config, actStateInput) {
    const actState = normalizeActState(actStateInput);
    const nextNodeIndex = Math.max(1, Math.round(Number(actState.nodeIndex) || 1)) + 1;
    const totalNodes = getChapterTotalNodes(config);
    if (nextNodeIndex >= totalNodes) return [];
    return getNodeIdsAtIndex(config, nextNodeIndex)
      .filter((nodeId) => !actState.route_history.includes(nodeId));
  }

  function createEmptyCounts(defaultValue = 0) {
    return ACT_RESOURCE_KEYS.reduce((acc, key) => {
      acc[key] = defaultValue;
      return acc;
    }, {});
  }

  function normalizeVisionState(value) {
    const source = value && typeof value === 'object' ? value : {};
    const pendingReplace = source.pendingReplace && typeof source.pendingReplace === 'object' && !Array.isArray(source.pendingReplace)
      ? deepClone(source.pendingReplace)
      : null;
    if (pendingReplace && pendingReplace.status === 'needs_target') {
      pendingReplace.status = 'charged';
      pendingReplace.charges = Math.max(1, Math.round(Number(pendingReplace.charges) || 1));
      pendingReplace.source = pendingReplace.source || 'vision2';
    }
    return {
      baseSight: Math.max(0, Math.round(Number(source.baseSight) || 1)),
      bonusSight: Math.max(0, Math.round(Number(source.bonusSight) || 0)),
      jumpReady: source.jumpReady === true,
      pendingReplace
    };
  }

  function normalizePendingResolutions(value) {
    const list = Array.isArray(value) ? value : [];
    return list
      .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => ({
        ...deepClone(item),
        type: normalizeActResourceKey(item.type, ''),
        level: Math.max(1, Math.min(3, Math.round(Number(item.level) || 1))),
        status: normalizeTrimmedString(item.status, 'pending') || 'pending'
      }))
      .filter((item) => item.type === 'combat' || item.type === 'asset');
  }

  function normalizeResolutionResultStatus(value) {
    const status = normalizeTrimmedString(value, 'resolved').toLowerCase();
    return ['resolved', 'failed', 'cancelled'].includes(status) ? status : 'resolved';
  }

  function normalizeResolutionHistory(value) {
    const list = Array.isArray(value) ? value : [];
    return list
      .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => ({
        ...deepClone(item),
        id: normalizeTrimmedString(item.id, ''),
        type: normalizeActResourceKey(item.type, ''),
        level: Math.max(1, Math.min(3, Math.round(Number(item.level) || 1))),
        status: normalizeResolutionResultStatus(item.status),
        outcome: normalizeTrimmedString(item.outcome, ''),
        summary: normalizeTrimmedString(item.summary, '')
      }))
      .filter((item) => item.id && (item.type === 'combat' || item.type === 'asset'));
  }

  function normalizeCrisisSignalStatus(value) {
    const status = normalizeTrimmedString(value, 'open').toLowerCase();
    return ['open', 'acknowledged', 'resolved', 'dismissed'].includes(status) ? status : 'open';
  }

  function normalizeCrisisSignals(value) {
    const list = Array.isArray(value) ? value : [];
    return list
      .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
      .map((item) => ({
        ...deepClone(item),
        id: normalizeTrimmedString(item.id, ''),
        source: normalizeTrimmedString(item.source, 'external').toLowerCase(),
        kind: normalizeTrimmedString(item.kind || item.type, 'generic').toLowerCase(),
        level: Math.max(0, Math.round(Number(item.level) || 0)),
        delta: Number.isFinite(Number(item.delta)) ? Math.round(Number(item.delta)) : 0,
        nodeId: normalizeTrimmedString(item.nodeId, ''),
        nodeIndex: Math.max(0, Math.round(Number(item.nodeIndex) || 0)),
        phaseIndex: Math.max(-1, Math.min(3, Math.round(Number(item.phaseIndex ?? -1)))),
        status: normalizeCrisisSignalStatus(item.status),
        summary: normalizeTrimmedString(item.summary, '')
      }))
      .filter((item) => item.id);
  }

  function normalizeExternalResolutionResult(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const id = normalizeTrimmedString(value.id || value.requestId || value.resolutionId, '');
    if (!id) return null;
    const type = normalizeActResourceKey(value.type, '');
    return {
      id,
      type,
      status: normalizeResolutionResultStatus(value.status),
      outcome: normalizeTrimmedString(value.outcome, ''),
      summary: normalizeTrimmedString(value.summary || value.note || value.notes, ''),
      actPatch: isPlainObject(value.actPatch) ? deepClone(value.actPatch) : null,
      heroPatch: isPlainObject(value.heroPatch) ? deepClone(value.heroPatch) : null,
      crisisSignals: Array.isArray(value.crisisSignals)
        ? deepClone(value.crisisSignals)
        : (isPlainObject(value.crisisSignal) ? [deepClone(value.crisisSignal)] : []),
      payload: isPlainObject(value.payload) ? deepClone(value.payload) : null,
      consume: value.consume !== false
    };
  }

  function normalizeIncomeRateMap(value) {
    const source = value && typeof value === 'object' ? value : {};
    const rates = { ...DEFAULT_WORLD_ACT.income_rate };
    Object.entries(source).forEach(([rawKey, rawValue]) => {
      const key = normalizeActResourceKey(rawKey, '');
      if (!key) return;
      rates[key] = Math.max(0, Number(rawValue) || 0);
    });
    for (const key of ACT_RESOURCE_KEYS) {
      rates[key] = Math.max(0, Math.min(1.5, rates[key]));
    }
    return rates;
  }

  function createRewardsForNode(nodeRuntime) {
    const rewards = createEmptyCounts(0);
    if (!nodeRuntime || typeof nodeRuntime !== 'object') return rewards;

    if (nodeRuntime.rewards?.limited && typeof nodeRuntime.rewards.limited === 'object') {
      Object.entries(nodeRuntime.rewards.limited).forEach(([rawKey, rawValue]) => {
        const key = normalizeActResourceKey(rawKey, '');
        if (!key) return;
        rewards[key] += Math.max(0, Math.round(Number(rawValue) || 0));
      });
      return rewards;
    }

    if (nodeRuntime.rewards && typeof nodeRuntime.rewards === 'object') {
      Object.entries(nodeRuntime.rewards).forEach(([rawKey, rawValue]) => {
        const key = normalizeActResourceKey(rawKey, '');
        if (!key) return;
        rewards[key] += Math.max(0, Math.round(Number(rawValue) || 0));
      });
      return rewards;
    }

    const typeKey = getNodeTypeKey(nodeRuntime);
    if (typeKey) {
      rewards[typeKey] = 1;
    }
    return rewards;
  }

  function applyReserveGrowthToAct(actState, config, nodeIndex) {
    void config;
    void nodeIndex;
    if (!actState || typeof actState !== 'object') return;
    actState.income_rate = normalizeIncomeRateMap(actState.income_rate);
    actState.income_progress = normalizeCountMap(actState.income_progress, true);
    actState.reserve = normalizeCountMap(actState.reserve, false);
    for (const key of ACT_RESOURCE_KEYS) {
      actState.income_progress[key] += actState.income_rate[key];
      while (actState.income_progress[key] >= 1) {
        actState.income_progress[key] -= 1;
        actState.reserve[key] += 1;
      }
    }
  }

  function clearLimitedActTokens(actState) {
    for (const key of ACT_RESOURCE_KEYS) {
      actState.limited[key] = 0;
    }
  }

  function resetActPhaseSlots(actState, phaseIndex = 0) {
    actState.phase_slots = [null, null, null, null];
    actState.phase_index = phaseIndex;
  }

  function applyNodeRewardsToAct(actState, config, nodeId) {
    const rewards = createRewardsForNode(getNodeRuntime(config, nodeId));
    for (const key of ACT_RESOURCE_KEYS) {
      actState.limited[key] += rewards[key];
    }
  }

  function applyControlledNodeLaneBurst(actState, config, nodeId) {
    const nodeRuntime = getNodeRuntime(config, nodeId);
    const lane = getNodeLaneKey(nodeRuntime);
    if (!lane) return;

    const counts = createEmptyCounts(0);
    Object.values(actState.controlledNodes || {}).forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      const entryLane = normalizeTrimmedString(entry.lane, '').toLowerCase();
      if (entryLane !== lane) return;
      const type = normalizeActResourceKey(entry.type, '');
      if (!ACT_RESOURCE_KEYS.includes(type)) return;
      counts[type] += 1;
    });

    const candidates = ACT_RESOURCE_KEYS
      .map((key) => ({
        key,
        count: counts[key],
        weight: counts[key],
        chance: counts[key] >= 3 ? 1 : counts[key] === 2 ? 0.75 : counts[key] === 1 ? 0.5 : 0,
        amount: counts[key] >= 2 ? 3 : 2
      }))
      .filter((entry) => entry.count > 0)
      .sort((left, right) => right.count - left.count || ACT_RESOURCE_KEYS.indexOf(left.key) - ACT_RESOURCE_KEYS.indexOf(right.key));

    if (!candidates.length) return;
    const seedBase = `${actState.seed || DEFAULT_WORLD_ACT.seed}|lane-burst|${nodeId}|${lane}|${Math.max(1, Math.round(Number(actState.nodeIndex) || 1))}`;
    const selected = pickFromCandidates(candidates, seedBase) || candidates[0];
    const roll = mulberry32(hashStringToSeed(`${seedBase}|${selected.key}`))();
    if (roll >= selected.chance) return;
    actState.reserve = normalizeCountMap(actState.reserve, false);
    actState.reserve[selected.key] += selected.amount;
  }

  function advanceActToNextNode(actState, config) {
    const nextNodeIndex = Math.max(1, Math.round(Number(actState.nodeIndex) || 1)) + 1;
    const nodeId = actState.route_history[nextNodeIndex - 1];
    if (!nodeId) return false;

    actState.nodeIndex = nextNodeIndex;
    actState.stage = 'executing';
    actState.vision = normalizeVisionState(actState.vision);
    actState.vision.bonusSight = 0;
    actState.vision.jumpReady = false;
    resetActPhaseSlots(actState, 0);
    applyNodeRewardsToAct(actState, config, nodeId);
    applyControlledNodeLaneBurst(actState, config, nodeId);
    const encounterResult = updateCharacterEncountersForNodeEntry(actState, {}, config);
    if (encounterResult?.actState) Object.assign(actState, encounterResult.actState);
    return true;
  }

  function resolveActNodeTransition(actState, config) {
    const currentNodeId = actState.route_history[actState.nodeIndex - 1];
    const currentNode = getNodeRuntime(config, currentNodeId);
    const nextTransition = currentNode?.next || { mode: 'none' };

    clearLimitedActTokens(actState);
    applyReserveGrowthToAct(actState, config, actState.nodeIndex);
    resetActPhaseSlots(actState, 4);

    const jumpOptions = actState.vision?.jumpReady === true
      ? getJumpRouteOptions(config, actState)
      : [];
    if (jumpOptions.length > 0) {
      actState.stage = 'route';
      return;
    }

    if (nextTransition.mode === 'choice') {
      const options = Array.isArray(nextTransition.options) ? nextTransition.options : [];
      // 只有一条可选路线 → 等价 forced，自动推进，不停在 route 等玩家选。
      // 避免"只有一个选项还要玩家去 dashboard 按一下"的无意义等待。
      if (options.length === 1) {
        if (actState.route_history.length < actState.nodeIndex + 1) {
          actState.route_history.push(options[0]);
        }
        const advanced = advanceActToNextNode(actState, config);
        if (!advanced) actState.stage = 'route';
        return;
      }
      // 设计态无效（0 个选项）→ 视同收束，而非永久卡 route。
      if (options.length === 0) {
        actState.stage = 'complete';
        return;
      }
      actState.stage = 'route';
      return;
    }

    if (nextTransition.mode === 'forced') {
      if (actState.route_history.length < actState.nodeIndex + 1) {
        actState.route_history.push(nextTransition.nodeId);
      }
      const advanced = advanceActToNextNode(actState, config);
      if (!advanced) {
        actState.stage = 'route';
      }
      return;
    }

    actState.stage = 'complete';
  }

  function getRestRecoverRatio(amount) {
    if (amount >= 3) return 1;
    if (amount === 2) return 0.66;
    return 0.25;
  }

  function getPartyRosterKeys(heroState) {
    const roster = heroState?.roster && typeof heroState.roster === 'object' ? heroState.roster : {};
    const cast = heroState?.cast && typeof heroState.cast === 'object' ? heroState.cast : {};
    return Object.keys(roster).filter((key) => {
      const node = roster[key];
      if (!node || typeof node !== 'object') return false;
      const maxMana = Math.max(0, Math.round(Number(node.maxMana) || 0));
      if (maxMana <= 0) return false;
      if (key === 'KAZU') return true;
      return cast[key]?.inParty === true;
    });
  }

  function applyRestTokenEffect(actState, heroState, config, token, amount, phaseIndex) {
    const ratio = getRestRecoverRatio(amount);
    const roster = heroState?.roster && typeof heroState.roster === 'object' ? heroState.roster : {};
    getPartyRosterKeys(heroState).forEach((charKey) => {
      const node = roster[charKey];
      const maxMana = Math.max(0, Math.round(Number(node.maxMana) || 0));
      const currentMana = Math.max(0, Math.round(Number(node.mana) || 0));
      const recovered = Math.ceil(maxMana * ratio);
      node.mana = Math.min(maxMana, currentMana + recovered);
    });

    const nodeId = getCurrentActNodeId(actState);
    const nodeRuntime = getNodeRuntime(config, nodeId);
    const tintKey = normalizeActResourceKey(token.controlType || token.tint || token.targetKey, '');
    const controlType = ACT_RESOURCE_KEYS.includes(tintKey) ? tintKey : 'neutral';
    actState.controlledNodes = actState.controlledNodes && typeof actState.controlledNodes === 'object' && !Array.isArray(actState.controlledNodes)
      ? actState.controlledNodes
      : {};
    actState.controlledNodes[nodeId] = {
      ...(actState.controlledNodes[nodeId] && typeof actState.controlledNodes[nodeId] === 'object' ? actState.controlledNodes[nodeId] : {}),
      type: controlType,
      lane: getNodeLaneKey(nodeRuntime),
      nodeIndex: Math.max(1, Math.round(Number(actState.nodeIndex) || 1)),
      level: Math.max(amount, Math.round(Number(actState.controlledNodes[nodeId]?.level) || 0)),
      phaseIndex
    };

    if (ACT_RESOURCE_KEYS.includes(tintKey)) {
      actState.income_rate = normalizeIncomeRateMap(actState.income_rate);
      actState.income_rate[tintKey] = Math.min(1.5, actState.income_rate[tintKey] + (amount >= 3 ? 0.4 : amount === 2 ? 0.25 : 0.1));
    }
  }

  function applyVisionTokenEffect(actState, token, amount, phaseIndex) {
    void token;
    actState.vision = normalizeVisionState(actState.vision);
    const nodeId = getCurrentActNodeId(actState);
    if (amount >= 3) {
      actState.vision.jumpReady = true;
      actState.vision.bonusSight += 2;
      return;
    }
    if (amount === 2) {
      const currentCharges = getVisionReplaceChargeCount(actState);
      actState.vision.pendingReplace = {
        status: 'charged',
        charges: currentCharges + 1,
        source: 'vision2',
        nodeId,
        nodeIndex: Math.max(1, Math.round(Number(actState.nodeIndex) || 1)),
        phaseIndex,
        level: amount
      };
      actState.vision.bonusSight += 2;
      return;
    }
    actState.vision.bonusSight += 2;
  }

  function appendPendingResolution(actState, token, amount, phaseIndex) {
    const key = normalizeActResourceKey(token.key, '');
    if (key !== 'combat' && key !== 'asset') return;
    actState.pendingResolutions = normalizePendingResolutions(actState.pendingResolutions);
    const nodeId = getCurrentActNodeId(actState);
    const request = {
      id: `${actState.id}:${nodeId}:${phaseIndex}:${key}:${amount}:${actState.resourceSpent[key] || 0}`,
      protocol: 'ace0.externalResolution.v1',
      type: key,
      level: amount,
      nodeId,
      nodeIndex: Math.max(1, Math.round(Number(actState.nodeIndex) || 1)),
      phaseIndex,
      status: 'pending',
      sources: Array.isArray(token.sources) ? deepClone(token.sources) : [token.source === 'reserve' ? 'reserve' : 'limited']
    };
    actState.pendingResolutions.push(request);
  }

  function getPendingExternalResolutionRequests(actStateInput, filters = {}) {
    const actState = normalizeActState(actStateInput);
    const typeFilter = normalizeActResourceKey(filters.type, '');
    return normalizePendingResolutions(actState.pendingResolutions)
      .filter((request) => request.status === 'pending')
      .filter((request) => !typeFilter || request.type === typeFilter)
      .map((request) => deepClone(request));
  }

  function applyExternalResolutionResult(actStateInput, heroStateInput, resultInput) {
    const result = normalizeExternalResolutionResult(resultInput);
    const originalActState = normalizeActState(actStateInput);
    const heroState = deepClone(heroStateInput || {});
    if (!result) {
      return {
        actState: originalActState,
        heroState,
        applied: false,
        reason: 'invalid_result'
      };
    }

    const pending = normalizePendingResolutions(originalActState.pendingResolutions);
    const requestIndex = pending.findIndex((request) => request.id === result.id);
    if (requestIndex < 0) {
      return {
        actState: originalActState,
        heroState,
        applied: false,
        reason: 'missing_request',
        result
      };
    }

    const request = pending[requestIndex];
    if (result.type && result.type !== request.type) {
      return {
        actState: originalActState,
        heroState,
        applied: false,
        reason: 'type_mismatch',
        request: deepClone(request),
        result
      };
    }

    const nextPending = result.consume
      ? pending.filter((_, index) => index !== requestIndex)
      : pending.map((item, index) => index === requestIndex ? { ...item, status: result.status } : item);
    const historyEntry = {
      ...deepClone(request),
      status: result.status,
      outcome: result.outcome,
      summary: result.summary,
      payload: result.payload
    };

    const patchedActState = result.actPatch
      ? mergePlainObjects(originalActState, result.actPatch, ['pendingResolutions', 'resolutionHistory', 'crisisSignals'])
      : deepClone(originalActState);
    patchedActState.pendingResolutions = nextPending;
    patchedActState.resolutionHistory = [
      ...normalizeResolutionHistory(originalActState.resolutionHistory),
      historyEntry
    ];
    if (Array.isArray(result.crisisSignals) && result.crisisSignals.length) {
      let signalActState = patchedActState;
      result.crisisSignals.forEach((signalInput) => {
        const signalResult = appendCrisisSignalToActState(signalActState, {
          source: request.type,
          nodeId: request.nodeId,
          nodeIndex: request.nodeIndex,
          phaseIndex: request.phaseIndex,
          level: request.level,
          ...signalInput
        });
        signalActState = signalResult.actState;
      });
      patchedActState.crisis = signalActState.crisis;
      patchedActState.crisisSignals = signalActState.crisisSignals;
    }

    const patchedHeroState = result.heroPatch
      ? mergePlainObjects(heroState, result.heroPatch)
      : heroState;

    return {
      actState: normalizeActState(patchedActState),
      heroState: patchedHeroState,
      applied: true,
      request: deepClone(request),
      result: historyEntry
    };
  }

  function applyExternalResolutionResults(actStateInput, heroStateInput, resultListInput) {
    const results = Array.isArray(resultListInput) ? resultListInput : [resultListInput];
    let actState = normalizeActState(actStateInput);
    let heroState = deepClone(heroStateInput || {});
    const applied = [];
    const rejected = [];

    results.forEach((resultInput) => {
      const next = applyExternalResolutionResult(actState, heroState, resultInput);
      actState = next.actState;
      heroState = next.heroState;
      if (next.applied) applied.push(next.result);
      else rejected.push({ reason: next.reason, result: next.result || resultInput });
    });

    return {
      actState,
      heroState,
      applied,
      rejected,
      changed: applied.length > 0
    };
  }

  function createCrisisSignal(actStateInput, signalInput = {}) {
    const actState = normalizeActState(actStateInput);
    const source = isPlainObject(signalInput) ? signalInput : {};
    const nodeId = normalizeTrimmedString(source.nodeId, getCurrentActNodeId(actState));
    const nodeIndex = Math.max(1, Math.round(Number(source.nodeIndex) || Number(actState.nodeIndex) || 1));
    const phaseIndex = Number.isFinite(Number(source.phaseIndex))
      ? Math.max(-1, Math.min(3, Math.round(Number(source.phaseIndex))))
      : Math.max(-1, Math.min(3, Math.round(Number(actState.phase_index) || 0)));
    const existingCount = normalizeCrisisSignals(actState.crisisSignals).length;
    const kind = normalizeTrimmedString(source.kind || source.type, 'generic').toLowerCase();
    const signal = {
      id: normalizeTrimmedString(
        source.id,
        `${actState.id}:${nodeId}:${phaseIndex}:crisis:${kind}:${existingCount}`
      ),
      source: normalizeTrimmedString(source.source, 'external').toLowerCase(),
      kind,
      level: Math.max(0, Math.round(Number(source.level) || 0)),
      delta: Number.isFinite(Number(source.delta)) ? Math.round(Number(source.delta)) : 0,
      nodeId,
      nodeIndex,
      phaseIndex,
      status: normalizeCrisisSignalStatus(source.status),
      summary: normalizeTrimmedString(source.summary || source.note, ''),
      payload: isPlainObject(source.payload) ? deepClone(source.payload) : null
    };
    return normalizeCrisisSignals([signal])[0] || signal;
  }

  function appendCrisisSignalToActState(actStateInput, signalInput = {}) {
    const actState = normalizeActState(actStateInput);
    const signal = createCrisisSignal(actState, signalInput);
    const signals = normalizeCrisisSignals(actState.crisisSignals);
    const alreadyRecorded = signals.some((item) => item.id === signal.id);
    if (!alreadyRecorded) {
      signals.push(signal);
    }
    actState.crisisSignals = signals;
    if (!alreadyRecorded && Number.isFinite(Number(signal.delta)) && signal.delta !== 0) {
      actState.crisis = Math.max(0, Math.min(100, Math.round(Number(actState.crisis) || 0) + signal.delta));
    }
    return {
      actState: normalizeActState(actState),
      signal: deepClone(signal),
      applied: !alreadyRecorded
    };
  }

  function getCrisisSignals(actStateInput, filters = {}) {
    const actState = normalizeActState(actStateInput);
    const sourceFilter = normalizeTrimmedString(filters.source, '').toLowerCase();
    const kindFilter = normalizeTrimmedString(filters.kind || filters.type, '').toLowerCase();
    const statusFilter = normalizeTrimmedString(filters.status, '').toLowerCase();
    return normalizeCrisisSignals(actState.crisisSignals)
      .filter((signal) => !sourceFilter || signal.source === sourceFilter)
      .filter((signal) => !kindFilter || signal.kind === kindFilter)
      .filter((signal) => !statusFilter || signal.status === statusFilter)
      .map((signal) => deepClone(signal));
  }

  function executeActTokenEffect(actState, heroState, config, token, phaseIndex = 0) {
    if (!token || typeof token !== 'object') return;
    const key = normalizeActResourceKey(token.key, '');
    if (!key) return;
    const amount = Math.max(1, Math.min(3, Math.round(Number(token.amount) || 1)));
    actState.resourceSpent = normalizeCountMap(actState.resourceSpent, false);
    actState.resourceSpent[key] += amount;

    if (key === 'rest') {
      applyRestTokenEffect(actState, heroState, config, token, amount, phaseIndex);
      return;
    }
    if (key === 'vision') {
      applyVisionTokenEffect(actState, token, amount, phaseIndex);
      return;
    }
    appendPendingResolution(actState, token, amount, phaseIndex);
  }

  function consumeSingleActPhase(actState, heroState, config) {
    if (actState.stage === 'route') {
      if (actState.route_history.length >= actState.nodeIndex + 1) {
        advanceActToNextNode(actState, config);
      }
      return;
    }

    if (actState.stage === 'complete') return;

    const phaseIndex = Math.max(0, Math.min(4, Math.round(Number(actState.phase_index) || 0)));
    if (phaseIndex >= 4) {
      resolveActNodeTransition(actState, config);
      return;
    }

    const currentNodeId = getCurrentActNodeId(actState);
    const visionReplacement = getVisionReplacementForPhase(actState, currentNodeId, phaseIndex);
    const token = Array.isArray(actState.phase_slots) && actState.phase_slots[phaseIndex]
      ? actState.phase_slots[phaseIndex]
      : visionReplacement
        ? { key: visionReplacement.key, amount: 1, source: 'vision', sources: ['vision'], visionReplacement: true }
        : null;
    const encounterResult = consumeCharacterEncounterForNode(actState, currentNodeId, { phaseIndex });
    if (encounterResult?.consumed && encounterResult.actState) {
      Object.assign(actState, encounterResult.actState);
    }
    executeActTokenEffect(actState, heroState, config, token, phaseIndex);
    if (Array.isArray(actState.phase_slots)) {
      actState.phase_slots[phaseIndex] = null;
    }
    if (visionReplacement) {
      consumeVisionReplacementCharge(actState, visionReplacement);
    }

    actState.phase_index = phaseIndex + 1;
    if (actState.phase_index >= 4) {
      resolveActNodeTransition(actState, config);
      return;
    }

    actState.stage = 'executing';
  }

  function deriveWorldTimeFromAct(actState) {
    // 阶段2：节点轨与世界时间轨完全解耦。
    // ACT 不再为世界时间提供任何值：day / phase 均返回 null（表示不覆盖）。
    // world.current_time 由独立时钟（参见 host advanceWorldClock）推进。
    return {
      day: null,
      phase: null
    };
  }

  function resolvePendingAdvanceState(actStateInput, heroStateInput, config) {
    const actState = normalizeActState(actStateInput);
    const heroState = deepClone(heroStateInput || {});
    if (!config || !(actState.phase_advance > 0)) {
      return {
        actState,
        heroState,
        changed: false,
        worldTime: deriveWorldTimeFromAct(actState)
      };
    }

    const stepCount = Math.max(0, Math.min(4, Math.round(Number(actState.phase_advance) || 0)));
    actState.phase_advance = 0;

    for (let index = 0; index < stepCount; index += 1) {
      consumeSingleActPhase(actState, heroState, config);
      if (actState.stage === 'complete') break;
      if (actState.stage === 'route' && actState.route_history.length < actState.nodeIndex + 1) break;
    }

    return {
      actState,
      heroState,
      changed: true,
      worldTime: deriveWorldTimeFromAct(actState)
    };
  }

  function deriveCharacterStatesFromActState(actStateInput, configInput) {
    const act = normalizeActState(actStateInput);
    const config = configInput && typeof configInput === 'object'
      ? deepClone(configInput)
      : getChapter(act.id);
    if (!config) return null;

    const runtime = getChapterRuntime(config);
    const chapterManagedCharacters = normalizeActEffectList(runtime.managedCharacters);
    const encounterManagedCharacters = getActiveEncounterCharacterKeys(act.characterEncounter);
    const managedCharacters = [...new Set([...chapterManagedCharacters, ...encounterManagedCharacters])];
    const initialEffects = {
      activate: normalizeActEffectList(runtime.initialCast?.activate),
      introduce: normalizeActEffectList(runtime.initialCast?.introduce),
      present: normalizeActEffectList(runtime.initialCast?.present),
      mini_known: normalizeActEffectList(runtime.initialCast?.miniKnown || runtime.initialCast?.mini_known),
      join_party: normalizeActEffectList(runtime.initialCast?.joinParty || runtime.initialCast?.join_party)
    };
    const defaultRouteNode = Array.isArray(getDefaultActState(act.id).route_history) && getDefaultActState(act.id).route_history.length
      ? getDefaultActState(act.id).route_history[0]
      : '';
    const routeNodes = act.route_history.slice(0, Math.max(1, act.nodeIndex));
    const currentNodeId = routeNodes[act.nodeIndex - 1] || routeNodes[routeNodes.length - 1] || defaultRouteNode;
    const nodeLevelEffects = getNormalizedActNodeEffects(config, currentNodeId);
    const currentPhaseIndex = Math.max(0, Math.min(3, Math.round(Number(act.phase_index) || 0)));
    const phaseLevelEffects = getNormalizedActPhaseEffects(config, currentNodeId, currentPhaseIndex);
    const currentNodeEffects = phaseLevelEffects || nodeLevelEffects;
    const states = {};
    const applyPersistentEffects = (effect) => {
      if (!effect || typeof effect !== 'object') return;
      for (const charKey of effect.activate || []) states[charKey].activated = true;
      for (const charKey of effect.mini_known || []) {
        states[charKey].activated = true;
        states[charKey].miniKnown = true;
      }
      for (const charKey of effect.introduce || []) {
        states[charKey].activated = true;
        states[charKey].introduced = true;
      }
      for (const charKey of effect.join_party || []) {
        states[charKey].activated = true;
        states[charKey].introduced = true;
        states[charKey].inParty = true;
      }
    };

    for (const charKey of managedCharacters) {
      const isChapterManaged = chapterManagedCharacters.includes(charKey);
      states[charKey] = {
        activated: isChapterManaged,
        introduced: initialEffects.introduce.includes(charKey)
          || initialEffects.present.includes(charKey)
          || initialEffects.join_party.includes(charKey),
        present: initialEffects.present.includes(charKey),
        inParty: initialEffects.join_party.includes(charKey),
        miniKnown: initialEffects.mini_known.includes(charKey)
      };
    }

    routeNodes.forEach((nodeId, routeIndex) => {
      applyPersistentEffects(getNormalizedActNodeEffects(config, nodeId));
      const phaseLimit = routeIndex < act.nodeIndex - 1 ? 3 : currentPhaseIndex;
      for (let phaseIndex = 0; phaseIndex <= phaseLimit; phaseIndex += 1) {
        applyPersistentEffects(getNormalizedActPhaseEffects(config, nodeId, phaseIndex));
      }
    });

	    for (const charKey of managedCharacters) {
	      states[charKey].present = currentNodeEffects.present.includes(charKey);
	      if (states[charKey].present) {
	        states[charKey].activated = true;
	        states[charKey].introduced = true;
	      }
	    }

    const encounterState = normalizeCharacterEncounterState(act.characterEncounter);
    Object.entries(encounterState.characters).forEach(([charKey, encounterChar]) => {
      if (!states[charKey]) return;
      if (encounterChar.status === 'introduced' || encounterChar.status === 'first_meet' || encounterChar.firstMeetDone) {
        states[charKey].activated = true;
        states[charKey].introduced = true;
      }
      if (
        encounterChar.status === 'first_meet'
        || (encounterChar.status === 'introduced' && encounterChar.introducedNodeId && encounterChar.introducedNodeId === currentNodeId)
      ) {
        states[charKey].present = true;
      }
    });

    // 首见帧来源只允许来自 characterEncounter 运行时状态。
    // 真正是否首见，仍在 createCharacterCastPatch 里比对 currentCast 旧态。
    const designedFirstMeet = getCharacterEncounterFirstMeetMap(act, currentNodeId);

    return {
      act,
      config,
      managedCharacters,
      routeNodes,
      currentNodeId,
      currentNodeEffects,
      states,
      designedFirstMeet
    };
  }

  function createCharacterCastPatch(currentCastInput, derivedState) {
    if (!derivedState) {
      return { changed: false, castPatch: {} };
    }

    const currentCast = currentCastInput && typeof currentCastInput === 'object' ? currentCastInput : {};
    const castPatch = {};
    let changed = false;

    for (const charKey of derivedState.managedCharacters) {
      const currentNode = currentCast[charKey] && typeof currentCast[charKey] === 'object'
        ? currentCast[charKey]
        : {};
      const desiredNode = derivedState.states[charKey];
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

    // 首见帧检测：旧态 introduced=false 且 本轮即将设为 true 且 章节提供了文案。
    const firstMeetHints = {};
    const designed = derivedState.designedFirstMeet || {};
    for (const charKey of derivedState.managedCharacters) {
      const currentNode = currentCast[charKey] && typeof currentCast[charKey] === 'object'
        ? currentCast[charKey]
        : {};
      const desiredNode = derivedState.states[charKey];
      if (!desiredNode) continue;
      if (
        currentNode.introduced !== true &&
        desiredNode.introduced === true &&
        typeof designed[charKey] === 'string' &&
        designed[charKey].trim()
      ) {
        firstMeetHints[charKey] = designed[charKey];
      }
    }

    return { changed, castPatch, firstMeetHints };
  }

  function buildFirstMeetPromptContent(firstMeetHints) {
    if (!firstMeetHints || typeof firstMeetHints !== 'object' || Array.isArray(firstMeetHints)) return '';
    const entries = Object.entries(firstMeetHints)
      .filter(([, v]) => typeof v === 'string' && v.trim());
    if (!entries.length) return '';
    const lines = entries.map(([charKey, hint]) => `- ${charKey}：${hint}`);
    const header = '本轮以下角色首次在主角视野里登场。请按"首见"质感描写：主角对她们还不熟，不要写成老熟人、不要直接称呼默契的细节。';
    return `<ace0_first_meet>\n${header}\n${lines.join('\n')}\n</ace0_first_meet>`;
  }

  function buildActStateSummaryFromDerived(derivedState) {
    if (!derivedState) return '';

    const { act, currentNodeId, managedCharacters, states } = derivedState;
    const routeLine = act.route_history.join(' > ');
    const limitedLine = ACT_RESOURCE_KEYS.map((key) => `${key}=${Math.round(act.limited[key] || 0)}`).join(' | ');
    const reserveLine = ACT_RESOURCE_KEYS.map((key) => `${key}=${Math.round(act.reserve[key] || 0)}`).join(' | ');
    const phaseLines = act.phase_slots.map((slot, index) => {
      if (!slot) return `  ${ACT_PHASE_LABELS[index]} = EMPTY`;
      const tint = slot.key === 'rest' ? normalizeActResourceKey(slot.tint || slot.controlType || slot.targetKey, '') : '';
      const tintText = tint ? ` -> ${tint.toUpperCase()}` : '';
      return `  ${ACT_PHASE_LABELS[index]} = ${slot.key.toUpperCase()} x${Math.max(1, Math.round(Number(slot.amount) || 1))}${tintText} (${slot.source})`;
    });
    const activatedChars = managedCharacters.filter((charKey) => states[charKey]?.activated === true);
    const presentChars = managedCharacters.filter((charKey) => states[charKey]?.present === true);

    // 注：node_seq 是节点序列索引（1..totalNodes），与世界日无关。世界时间见 <ace0_world_context>。
    return `<ace0_act_state>
[ACT]
  id: ${act.id}
  seed: ${act.seed}
  node_seq: ${act.nodeIndex}
  stage: ${act.stage}
  current_node: ${currentNodeId}
  route_history: ${routeLine}
[TOKENS]
  limited: ${limitedLine}
  reserve: ${reserveLine}
  pending_resolutions: ${Array.isArray(act.pendingResolutions) ? act.pendingResolutions.length : 0}
[PHASE_SLOTS]
${phaseLines.join('\n')}
[ACT_CHARACTERS]
  activated: ${activatedChars.length ? activatedChars.join(', ') : '（无）'}
  present: ${presentChars.length ? presentChars.join(', ') : '（无）'}
</ace0_act_state>`;
  }

  // ---------- 情节张力辅助（纯函数）----------
  // 档位映射：数值 → 自然语言节奏提示（永不对 LLM 暴露数值）
  const NARRATIVE_TENSION_TIERS = [
    { min: 0,  max: 30,  hint: '当前段落仍可继续展开，不忙着收束。' },
    { min: 30, max: 60,  hint: '当前互动已进入中段，可以继续铺垫，但不要拖得太远。' },
    { min: 60, max: 85,  hint: '铺垫已经足够，适合尽快形成决定或进入结果。' },
    { min: 85, max: 101, hint: '情节停留较久，强烈建议收束本幕，推进到下一节点。' }
  ];

  function pickNarrativeTensionTier(tension) {
    const v = Math.max(0, Math.min(100, Math.round(Number(tension) || 0)));
    for (const tier of NARRATIVE_TENSION_TIERS) {
      if (v >= tier.min && v < tier.max) return tier;
    }
    return NARRATIVE_TENSION_TIERS[NARRATIVE_TENSION_TIERS.length - 1];
  }

  function buildNarrativePacingSummary(tension, worldClockSuggestion = null) {
    // 返回给 LLM 看的自然语言提示（不包含数值）
    const value = Math.max(0, Math.min(100, Math.round(Number(tension) || 0)));
    const tier = pickNarrativeTensionTier(value);
    const timeHint = worldClockSuggestion && typeof worldClockSuggestion === 'object'
      ? String(worldClockSuggestion.hint || '').trim()
      : '';
    const timePressure = worldClockSuggestion && typeof worldClockSuggestion === 'object'
      ? Math.max(0, Math.min(100, Math.round(Number(worldClockSuggestion.pressure) || 0)))
      : null;
    const lines = [
      `节奏建议：${tier.hint}`,
      `节奏值：${value}/100`
    ];
    if (timeHint) lines.push(`时间建议：${timeHint}`);
    if (timePressure != null) lines.push(`时间值：${timePressure}/100`);
    return `<ace0_narrative_pacing>\n${lines.join('\n')}\n</ace0_narrative_pacing>`;
  }

  function buildCharterPromptContent(narrative) {
    const charter = narrative && narrative.charter;
    if (!charter) return '';
    const laws = Array.isArray(charter.ironLaws) && charter.ironLaws.length
      ? charter.ironLaws.map((law, index) => `${index + 1}. ${law}`).join('\n')
      : '';
    const bounds = charter.bounds && typeof charter.bounds === 'object' ? charter.bounds : {};
    const forbid = Array.isArray(bounds.forbid) && bounds.forbid.length
      ? bounds.forbid.map((item, index) => `${index + 1}. ${item}`).join('\n')
      : '';
    const closeWhen = Array.isArray(bounds.closeWhen) && bounds.closeWhen.length
      ? bounds.closeWhen.map((item, index) => `${index + 1}. ${item}`).join('\n')
      : '';
    const body = [
      '[使用方式]\n这是章节级节奏指导，用来帮助把握方向、轻重与收束位置；不是逐段强制命令。',
      charter.theme ? `[主题]\n${charter.theme}` : '',
      laws ? `[铁律]\n${laws}` : '',
      bounds.focus ? `[边界]\n${bounds.focus}` : '',
      forbid ? `[不要展开]\n${forbid}` : '',
      closeWhen ? `[收束参考]\n${closeWhen}` : '',
      charter.successCriterion ? `[成功标准]\n${charter.successCriterion}` : ''
    ].filter(Boolean).join('\n\n');
    if (!body.trim()) return '';
    return `<ace0_act_charter>\n${body}\n</ace0_act_charter>`;
  }

  // ---------- 随机池抽签（seed 确定性）----------
  function hashStringToSeed(str) {
    // FNV-1a 32-bit
    let h = 2166136261 >>> 0;
    const s = String(str || '');
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function rng() {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickFromCandidates(candidates, seedStr) {
    if (!Array.isArray(candidates) || !candidates.length) return null;
    if (candidates.length === 1) return candidates[0];
    const rng = mulberry32(hashStringToSeed(seedStr));
    const weights = candidates.map((c) => Math.max(0.0001, Number(c?.weight) || 1));
    const total = weights.reduce((a, b) => a + b, 0);
    let target = rng() * total;
    for (let i = 0; i < candidates.length; i += 1) {
      target -= weights[i];
      if (target <= 0) return candidates[i];
    }
    return candidates[candidates.length - 1];
  }

  function normalizePhaseGuideCandidates(guide) {
    if (!guide || typeof guide !== 'object') return [];
    if (Array.isArray(guide.candidates) && guide.candidates.length) {
      return guide.candidates.filter((c) => c && typeof c === 'object');
    }
    // 向后兼容：旧结构 { direction } 当 1 候选
    if (typeof guide.direction === 'string' && guide.direction) {
      return [{
        id: 'legacy',
        weight: 1,
        direction: guide.direction,
        mustEnd: typeof guide.mustEnd === 'string' ? guide.mustEnd : ''
      }];
    }
    return [];
  }

  function collectUsedPackIds(act) {
    const picked = act?.pickedPacks;
    if (!picked || typeof picked !== 'object') return [];
    const ids = [];
    Object.values(picked).forEach((perNode) => {
      if (perNode && typeof perNode === 'object') {
        Object.values(perNode).forEach((id) => {
          if (typeof id === 'string' && id) ids.push(id);
        });
      }
    });
    return ids;
  }

  function getPoolFallbackText(guide, slotKey) {
    if (guide && typeof guide.fallback === 'string' && guide.fallback.trim()) return guide.fallback.trim();
    const label = (guide && guide.summary) || slotKey || '命运事件';
    return `本章节的${label}候选已全部消耗。本段作自然过场推进即可，不再增加新的命运事件。`;
  }

  function resolvePhaseEvent(config, narrative, nodeId, phaseIndex, act) {
    const visionReplacement = getVisionReplacementForPhase(act, nodeId, phaseIndex);

    // L1 节点级 pinned（固定包）
    const pinned = getNodeV2Phase(config, nodeId, phaseIndex)?.event;
    if (!visionReplacement && pinned && typeof pinned === 'object') {
      return { kind: 'pinned', template: deepClone(pinned) };
    }

    // 当前 slot kind 来源区分：
    //  token = 玩家在 phase_slots 里规划的点数
    //  phase = 章节定义里写死的 slot kind
    const phaseSlots = Array.isArray(act?.phase_slots) ? act.phase_slots : [];
    const currentSlot = phaseSlots[phaseIndex] || null;
    const slotKeyFromToken = currentSlot && typeof currentSlot.key === 'string' ? currentSlot.key.toLowerCase() : '';
    const slotKeyFromPhase = normalizeTrimmedString(getNodeV2Phase(config, nodeId, phaseIndex)?.slot, '').toLowerCase();
    const slotKeyFromReplacement = visionReplacement?.key || '';
    const slotKey = slotKeyFromToken || slotKeyFromReplacement || slotKeyFromPhase;

    // L2 节点级 fateEvents（按 slot kind 的 flavor，单条、不池化；任意 slotKey 来源都触发）
    const nodeNarrative = config?.nodes?.[nodeId]?.narrative;
    const fateFlavor = slotKey && nodeNarrative?.fateEvents?.[slotKey];
    if (fateFlavor) {
      const guide = slotKey && narrative?.phaseGuides?.[slotKey];
      return { kind: 'flavor', flavorText: fateFlavor, guide, slotKey };
    }

    // L3 章级 phaseGuides 随机池：玩家规划点数或 Vision 替换固定相位时触发。
    if (!slotKeyFromToken && !slotKeyFromReplacement) return null;

    const guide = narrative?.phaseGuides?.[slotKeyFromToken || slotKeyFromReplacement];
    const candidates = normalizePhaseGuideCandidates(guide);
    if (!candidates.length) return null;

    // 已抽过：从 pickedPacks 读回，保证同一 segment 重入稳定
    const pickedId = act?.pickedPacks?.[nodeId]?.[phaseIndex];
    if (pickedId) {
      const found = candidates.find((c) => c.id === pickedId);
      if (found) {
        return { kind: 'pooled', candidate: found, guide, slotKey: slotKeyFromToken || slotKeyFromReplacement, isNew: false };
      }
      // pickedId 不在当前池里（candidate 被删或改名）→ 穿透到重抽分支
    }

    // 滤掉全局已用（跨 node/seg）
    const usedIds = collectUsedPackIds(act);
    const available = candidates.filter((c) => !usedIds.includes(c.id));

    // 池空：所有候选已被消耗 → 通用兜底
    if (!available.length) {
      const effectiveSlotKey = slotKeyFromToken || slotKeyFromReplacement;
      return {
        kind: 'fallback',
        guide,
        slotKey: effectiveSlotKey,
        fallbackText: getPoolFallbackText(guide, effectiveSlotKey)
      };
    }

    const seedStr = `${act?.seed || 'AUTO'}::${nodeId}::${phaseIndex}`;
    const picked = pickFromCandidates(available, seedStr);
    return { kind: 'pooled', candidate: picked, guide, slotKey: slotKeyFromToken || slotKeyFromReplacement, isNew: true };
  }

  // 给 host 调：在段位推进前将本段的抽签结果落存到 actState.pickedPacks。
  // 幂等：已落存的 segment 不会重抄。只对 isNew 的 pooled 结果写入。
  function commitPackUsageForPhase(actState, config, narrative, nodeId, phaseIndex) {
    if (!actState || typeof actState !== 'object') return false;
    const resolved = resolvePhaseEvent(config, narrative, nodeId, phaseIndex, actState);
    if (resolved?.kind !== 'pooled' || !resolved.isNew || !resolved.candidate?.id) return false;
    if (!actState.pickedPacks || typeof actState.pickedPacks !== 'object') {
      actState.pickedPacks = {};
    }
    if (!actState.pickedPacks[nodeId] || typeof actState.pickedPacks[nodeId] !== 'object') {
      actState.pickedPacks[nodeId] = {};
    }
    actState.pickedPacks[nodeId][phaseIndex] = resolved.candidate.id;
    return true;
  }

  function renderPooledCandidate(candidate, phaseIndex, guide, slotKey) {
    if (!candidate) return '';
    const summary = (guide && guide.summary) || slotKey || '';
    const segLabel = ACT_PHASE_LABELS[phaseIndex] || `段${phaseIndex + 1}`;
    const idTag = candidate.id ? ` #${candidate.id}` : '';
    const heading = `[命运事件 · ${segLabel}${summary ? ` · ${summary}` : ''}]${idTag}`;
    return [
      heading,
      candidate.direction ? `  方向: ${candidate.direction}` : '',
      candidate.castDirective ? `  出手: ${candidate.castDirective}` : '',
      candidate.mustEnd ? `  收束: ${candidate.mustEnd}` : ''
    ].filter(Boolean).join('\n');
  }

  function renderPoolFallback(fallbackText, phaseIndex, guide, slotKey) {
    const summary = (guide && guide.summary) || slotKey || '';
    const segLabel = ACT_PHASE_LABELS[phaseIndex] || `段${phaseIndex + 1}`;
    const heading = `[命运事件 · ${segLabel}${summary ? ` · ${summary}` : ''}] (池已消耗 · 通用兜底)`;
    return `${heading}\n${fallbackText}`;
  }

  function findPinnedEvent(config, narrative, nodeId, phaseIndex) {
    const v2Event = getNodeV2Phase(config, nodeId, phaseIndex)?.event;
    if (v2Event && typeof v2Event === 'object') {
      return {
        node: nodeId,
        phaseIndex,
        inlineTemplate: deepClone(v2Event)
      };
    }
    return null;
  }

  function resolveNodeGuide(config, narrative, nodeId) {
    const nodeNarrative = config?.nodes?.[nodeId]?.narrative;
    if (nodeNarrative && typeof nodeNarrative === 'object') {
      return {
        overview: typeof nodeNarrative.overview === 'string' ? nodeNarrative.overview : '',
        guidance: typeof nodeNarrative.guidance === 'string' ? nodeNarrative.guidance : '',
        fateEvents: nodeNarrative.fateEvents && typeof nodeNarrative.fateEvents === 'object' ? nodeNarrative.fateEvents : {}
      };
    }
    return { overview: '', guidance: '', fateEvents: {} };
  }

  function renderPinnedTemplate(template, phaseIndex) {
    if (!template) return '';
    const phaseLabel = `${ACT_PHASE_LABELS[phaseIndex] || `段${phaseIndex + 1}`} · 固定事件`;
    const heading = template.title ? `[命运事件 · ${phaseLabel}] ${template.title}` : `[命运事件 · ${phaseLabel}]`;
    return [
      heading,
      template.objective ? `  目标: ${template.objective}` : '',
      template.direction ? `  方向: ${template.direction}` : '',
      template.castDirective ? `  出手: ${template.castDirective}` : '',
      template.mustEnd ? `  收束: ${template.mustEnd}` : ''
    ].filter(Boolean).join('\n');
  }

  function renderFateFlavor(flavorText, phaseIndex, phaseGuide, tokenKey) {
    const label = (phaseGuide && phaseGuide.summary) || tokenKey || '';
    const segLabel = ACT_PHASE_LABELS[phaseIndex] || `段${phaseIndex + 1}`;
    const heading = `[命运事件 · ${segLabel}${label ? ` · ${label}` : ''}]`;
    return flavorText ? `${heading}\n${flavorText}` : heading;
  }

  function buildNarrativePromptContentFromDerived(derivedState) {
    if (!derivedState) return '';

    const { act, config, currentNodeId } = derivedState;
    const narrative = config && config.narrative;
    if (!narrative) return '';

    const stage = act?.stage || 'planning';
    const rawPhaseIndex = Math.round(Number(act?.phase_index) || 0);
    const phaseIndex = Math.max(0, Math.min(3, rawPhaseIndex));
    const phaseSlots = Array.isArray(act?.phase_slots) ? act.phase_slots : [];
    const currentSlot = phaseSlots[phaseIndex] || null;
    const tokenKey = currentSlot && typeof currentSlot.key === 'string' ? currentSlot.key : '';
    const headerAttrs = [
      `nodeIndex="${act?.nodeIndex || 1}"`,
      `node="${currentNodeId || ''}"`,
      `stage="${stage}"`,
      `phase="${phaseIndex}"`,
      tokenKey ? `token="${tokenKey}"` : ''
    ].filter(Boolean).join(' ');

    const sections = [];
    const nodeGuide = resolveNodeGuide(config, narrative, currentNodeId);
    if (nodeGuide.overview) sections.push(`[今日]\n${nodeGuide.overview}`);
    if (nodeGuide.guidance) sections.push(`[今日指引]\n${nodeGuide.guidance}`);

    const stageGuides = narrative.stageGuides || {};

    if (stage === 'route' && stageGuides.route) {
      const routeNode = config?.nodes?.[currentNodeId];
      const routeOptions = Array.isArray(routeNode?.next?.options) ? routeNode.next.options : [];
      const currentNodeIndex = Math.max(1, Number(act?.nodeIndex) || 1);
      const existingHistory = Array.isArray(act?.route_history) ? act.route_history.slice(0, currentNodeIndex) : [];
      const parts = ['[阶段 · 选路相]', stageGuides.route];
      if (routeOptions.length) {
        parts.push(`[可选节点] ${routeOptions.join(' / ')}`);
        const sampleNode = routeOptions[0];
        const sampleHistory = [...existingHistory, sampleNode];
        const samplePatch = JSON.stringify([
          { op: 'replace', path: '/world/act/route_history', value: sampleHistory },
          { op: 'replace', path: '/world/act/phase_advance', value: 1 }
        ]);
        parts.push(`[UpdateVariable 模板] 将下面 JSONPatch 的 route_history 末项替换为实际选中的节点 ID，runtime 会自动推进到下一日：\n${samplePatch}`);
      }
      sections.push(parts.filter(Boolean).join('\n'));
    } else if (stage === 'complete' && stageGuides.complete) {
      sections.push(`[阶段 · 收束相]\n${stageGuides.complete}`);
    } else if (stage === 'executing') {
      const resolved = resolvePhaseEvent(config, narrative, currentNodeId, phaseIndex, act);
      if (resolved?.kind === 'pinned') {
        sections.push(renderPinnedTemplate(resolved.template, phaseIndex));
      } else if (resolved?.kind === 'flavor') {
        sections.push(renderFateFlavor(resolved.flavorText, phaseIndex, resolved.guide, resolved.slotKey));
      } else if (resolved?.kind === 'pooled') {
        sections.push(renderPooledCandidate(resolved.candidate, phaseIndex, resolved.guide, resolved.slotKey));
      } else if (resolved?.kind === 'fallback') {
        sections.push(renderPoolFallback(resolved.fallbackText, phaseIndex, resolved.guide, resolved.slotKey));
      }

      if (stageGuides.executing) {
        sections.push(`[阶段 · 执行相]\n${stageGuides.executing}`);
      }
    }

    if (!sections.length) return '';
    return `<ace0_act_narrative ${headerAttrs}>\n${sections.join('\n\n')}\n</ace0_act_narrative>`;
  }

  function evaluateCompletionTransition(actStateInput, heroStateInput) {
    const act = normalizeActState(actStateInput);
    const chapter = getChapter(act.id);
    const runtime = getChapterRuntime(chapter);
    const completionTransition = runtime?.completionTransition;
    if (!completionTransition?.targetChapterId) {
      return { eligible: false, reason: 'no_completion_transition' };
    }

    const defaultRouteNode = Array.isArray(getDefaultActState(act.id).route_history) && getDefaultActState(act.id).route_history.length
      ? getDefaultActState(act.id).route_history[0]
      : '';
    const currentNodeId = act.route_history[act.nodeIndex - 1]
      || act.route_history[act.route_history.length - 1]
      || defaultRouteNode;
    const currentNode = getNodeRuntime(chapter, currentNodeId);
    const nextMode = normalizeTrimmedString(currentNode?.next?.mode, 'none').toLowerCase();
    const transitionReady = nextMode === 'none' || act.stage === 'complete';
    if (!transitionReady) {
      return { eligible: false, reason: 'transition_not_ready', currentNodeId };
    }

    const targetChapter = getChapter(completionTransition.targetChapterId);
    if (!targetChapter) {
      return { eligible: false, reason: 'missing_target_chapter' };
    }

    const currentFunds = Math.max(0, Number(heroStateInput?.funds) || 0);
    const minFunds = Math.max(0, Number(completionTransition?.conditions?.minFunds) || 0);
    if (currentFunds < minFunds) {
      return {
        eligible: false,
        reason: 'funds_below_min',
        currentFunds,
        minFunds,
        sourceChapterId: act.id,
        targetChapterId: completionTransition.targetChapterId
      };
    }

    return {
      eligible: true,
      sourceChapterId: act.id,
      targetChapterId: completionTransition.targetChapterId,
      sourceNodeId: currentNodeId,
      currentFunds,
      minFunds,
      targetActState: getDefaultActState(completionTransition.targetChapterId),
      prompt: deepClone(completionTransition.prompt || {})
    };
  }

  function buildCompletionTransitionPromptContent(transitionResult, options = {}) {
    if (!transitionResult?.eligible) return '';
    const mode = normalizeTrimmedString(options?.mode, 'request').toLowerCase();
    const sourceChapter = getChapter(transitionResult.sourceChapterId);
    const targetChapter = getChapter(transitionResult.targetChapterId);
    const sourceTitle = normalizeTrimmedString(sourceChapter?.meta?.title, transitionResult.sourceChapterId || 'CURRENT_CHAPTER');
    const targetTitle = normalizeTrimmedString(targetChapter?.meta?.title, transitionResult.targetChapterId || 'NEXT_CHAPTER');
    const customTitle = normalizeTrimmedString(transitionResult?.prompt?.title, '');
    const customBody = normalizeTrimmedString(transitionResult?.prompt?.body, '');
    const lines = mode === 'entered'
      ? [
          '[章节切换]',
          customTitle || `${sourceTitle} 已结束，切入 ${targetTitle}。`,
          customBody || `上一章已经满足进入下一章的条件。后续叙事直接从 ${targetTitle} 的起始节点继续。`,
          `当前资金：${transitionResult.currentFunds.toFixed(2)}`,
          `切换结果：当前 ACT 已进入 ${targetTitle}。请不要再把叙事停留在上一章结束后的空档。`
        ]
      : [
          '[可转章状态]',
          customTitle || `${sourceTitle} 已进入可转章状态，可视叙事结果切入 ${targetTitle}。`,
          customBody || `只有当本轮叙事已经明确满足转章条件时，才推进到 ${targetTitle}。如果条件还没真正落地，就留在当前章节继续写。`,
          `当前节点：${normalizeTrimmedString(transitionResult.sourceNodeId, 'UNKNOWN_NODE')}`,
          `当前资金：${transitionResult.currentFunds.toFixed(2)}（门槛：${transitionResult.minFunds.toFixed(2)}）`,
          `若本轮决定切章，请在 UpdateVariable 中写入 world.act.transitionRequestTarget = "${transitionResult.targetChapterId}"。`,
          `若尚未切章，不要改 world.act.id，也不要写 transitionRequestTarget。`
        ];
    return `<ace0_act_transition from="${transitionResult.sourceChapterId}" to="${transitionResult.targetChapterId}">\n${lines.join('\n')}\n</ace0_act_transition>`;
  }

  function createFrontendSnapshot(options) {
    const actState = normalizeActState(options?.actState);
    const chapter = getChapter(actState.id);
    const runtime = getChapterRuntime(chapter);
    const frontend = chapter?.frontend && typeof chapter.frontend === 'object' ? chapter.frontend : {};
    const chapterTotalNodes = Math.max(
      1,
      Math.round(Number(chapter?.totalNodes) || Number(chapter?.meta?.totalNodes) || 1)
    );
    const campaignNodes = buildCampaignNodesFromV2(chapter);
    const campaignConfig = {
      seed: normalizeTrimmedString(actState.seed, runtime.seed || frontend?.campaign?.seed || DEFAULT_WORLD_ACT.seed),
      totalNodes: Math.max(1, Math.round(Number(frontend?.campaign?.totalNodes) || chapterTotalNodes || campaignNodes.length || 1)),
      rules: deepClone(runtime.rules || normalizeRules(frontend?.campaign?.rules)),
      reserveGrowthByNode: deepClone(runtime.reserveGrowthByNode || frontend?.campaign?.reserveGrowthByNode || []),
      nodes: deepClone(campaignNodes)
    };
    const currentNodeIndex = Math.max(1, Math.min(campaignConfig.totalNodes || chapterTotalNodes || 1, Math.round(Number(actState.nodeIndex) || 1)));
    const routeHistory = Array.isArray(actState.route_history) ? [...actState.route_history] : [];
    const currentNodeId = routeHistory[currentNodeIndex - 1]
      || routeHistory[routeHistory.length - 1]
      || campaignConfig.nodes?.[0]?.selectableNodeIds?.[0]
      || '';
    const currentNodeRuntime = getNodeRuntime(chapter, currentNodeId);
    const routeTransition = currentNodeRuntime?.next || { mode: 'none' };
    const jumpRouteOptions = actState.vision?.jumpReady === true ? getJumpRouteOptions(chapter, actState) : [];
    const routeMode = actState.stage === 'route' && jumpRouteOptions.length > 0
      ? 'jump'
      : routeTransition.mode;
    const routeOptions = routeMode === 'jump'
      ? jumpRouteOptions
      : routeTransition.mode === 'choice'
      ? deepClone(routeTransition.options || [])
      : routeTransition.mode === 'forced' && routeTransition.nodeId
        ? [routeTransition.nodeId]
        : [];
    const topology = buildTopologyFromV2Nodes(chapter);
    const fixedPhaseMarkers = applyVisionReplacementMarkers(buildFixedPhaseMarkersFromV2Nodes(chapter), actState);
    const currentNodeTemplate = campaignConfig.nodes.find((cNode) => cNode.nodeIndex === currentNodeIndex) || null;
    const currentLimitedRewards = buildLimitedRewardsForNode(currentNodeRuntime).length
      ? buildLimitedRewardsForNode(currentNodeRuntime)
      : deepClone(currentNodeTemplate?.limited || []);

    return {
      chapterId: chapter?.id || actState.id,
      chapterMeta: deepClone(chapter?.meta || {}),
      totalNodes: chapterTotalNodes,
      runtime: deepClone(runtime),
      reserveGrowthByNode: deepClone(runtime.reserveGrowthByNode || []),
      managedCharacters: deepClone(runtime.managedCharacters || []),
      initialEffects: {
        activate: deepClone(runtime.initialCast?.activate || []),
        introduce: deepClone(runtime.initialCast?.introduce || []),
        present: deepClone(runtime.initialCast?.present || []),
        join_party: deepClone(runtime.initialCast?.joinParty || runtime.initialCast?.join_party || [])
      },
      currentNodeIndex,
      currentNodeId,
      routeHistory,
      stage: actState.stage,
      actState,
      campaign: campaignConfig,
      nodes: deepClone(campaignConfig.nodes || []),
      topology,
      nodeCatalog: deepClone(chapter?.nodes || {}),
      narrative: deepClone(chapter?.narrative || {}),
      fixedPhaseMarkers,
      encounterMarkers: buildEncounterMarkersForSnapshot(actState),
      routeMode,
      routeOptions,
      currentLimitedRewards
    };
  }

  const moduleApi = {
    version: '0.1.0-skeleton',
    constants: {
      DEFAULT_CHAPTER_ID,
      ACT_STAGE_VALUES: deepClone(ACT_STAGE_VALUES),
      ACT_RESOURCE_KEYS: deepClone(ACT_RESOURCE_KEYS)
    },
    registerChapter,
    listChapters,
    getChapter,
    getDefaultActState,
    normalizeActState,
    normalizePendingFirstMeet,
    normalizeCharacterEncounterState,
    evaluateCharacterEncounterEligibility,
    enqueueEligibleCharacterEncounters,
    placeNextCharacterEncounter,
    consumeCharacterEncounterForNode,
    updateCharacterEncountersForNodeEntry,
    debugForceCharacterEncounter,
    normalizeActEffectList,
    getNormalizedActNodeEffects,
    getNormalizedActPhaseEffects,
    getNodeRuntime,
    getJumpRouteOptions,
    createEmptyCounts,
    createRewardsForNode,
    applyReserveGrowthToAct,
    clearLimitedActTokens,
    resetActPhaseSlots,
    applyNodeRewardsToAct,
    advanceActToNextNode,
    resolveActNodeTransition,
    consumeSingleActPhase,
    getPendingExternalResolutionRequests,
    applyExternalResolutionResult,
    applyExternalResolutionResults,
    appendCrisisSignalToActState,
    getCrisisSignals,
    deriveWorldTimeFromAct,
    resolvePendingAdvanceState,
    deriveCharacterStatesFromActState,
    createCharacterCastPatch,
    buildActStateSummaryFromDerived,
    buildCharterPromptContent,
    buildNarrativePromptContentFromDerived,
    evaluateCompletionTransition,
    buildCompletionTransitionPromptContent,
    createFrontendSnapshot,
    resolvePhaseEvent,
    commitPackUsageForPhase,
    buildNarrativePacingSummary,
    pickNarrativeTensionTier,
    buildFirstMeetPromptContent,
    NARRATIVE_TENSION_TIERS: deepClone(NARRATIVE_TENSION_TIERS)
  };

  const namespace = ensureModuleNamespace();
  namespace[MODULE_KEY] = moduleApi;
  installModuleBridge(moduleApi);
})(typeof window !== 'undefined' ? window : globalThis);
