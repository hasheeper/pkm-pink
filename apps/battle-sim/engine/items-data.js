/**
 * ===========================================
 * ITEMS-DATA.JS - 道具数据库
 * ===========================================
 * 
 * 集中管理所有道具数据，消除硬编码
 * 参考 Showdown 的 items.ts 结构
 * 
 * 职责:
 * - 道具基础数据 (名称、类型、效果)
 * - 道具分类常量
 * - 道具效果处理器
 */

// ============================================
// 道具数据库
// ============================================

export const ITEMS = {
    // ========== 战斗道具 (Battle Items) ==========
    
    // --- 气势披带 (Focus Sash) ---
    focussash: {
        id: 'focussash',
        name: 'Focus Sash',
        cnName: '气势披带',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        // 效果: 满血时，致命伤害只会让 HP 剩 1
        effect: 'surviveLethal',
        description: '当持有者HP满时，受到致命伤害会保留1点HP（一次性）',
    },
    
    // --- 讲究系列 (Choice Items) ---
    choiceband: {
        id: 'choiceband',
        name: 'Choice Band',
        cnName: '讲究头带',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'choiceLock',
        statBoost: { atk: 1.5 },
        isChoice: true,
        description: '物攻x1.5，但只能使用第一个选择的招式',
    },
    choicescarf: {
        id: 'choicescarf',
        name: 'Choice Scarf',
        cnName: '讲究围巾',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'choiceLock',
        statBoost: { spe: 1.5 },
        isChoice: true,
        description: '速度x1.5，但只能使用第一个选择的招式',
    },
    choicespecs: {
        id: 'choicespecs',
        name: 'Choice Specs',
        cnName: '讲究眼镜',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'choiceLock',
        statBoost: { spa: 1.5 },
        isChoice: true,
        description: '特攻x1.5，但只能使用第一个选择的招式',
    },
    
    // --- 生命宝珠 (Life Orb) ---
    lifeorb: {
        id: 'lifeorb',
        name: 'Life Orb',
        cnName: '生命宝珠',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'lifeOrb',
        damageBoost: 1.3,
        recoilPercent: 0.1, // 10% 最大HP
        description: '攻击伤害x1.3，但每次攻击损失10%最大HP',
    },
    
    // --- 剩饭 (Leftovers) ---
    leftovers: {
        id: 'leftovers',
        name: 'Leftovers',
        cnName: '剩饭',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'endOfTurnHeal',
        healPercent: 1/16, // 每回合恢复 1/16 最大HP
        description: '每回合结束时恢复1/16最大HP',
    },
    
    // --- 黑色淤泥 (Black Sludge) ---
    blacksludge: {
        id: 'blacksludge',
        name: 'Black Sludge',
        cnName: '黑色淤泥',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'blackSludge',
        healPercent: 1/16, // 毒系恢复
        damagePercent: 1/8, // 非毒系受伤
        description: '毒属性每回合恢复1/16HP，非毒属性每回合损失1/8HP',
    },
    
    // --- 进化奇石 (Eviolite) ---
    eviolite: {
        id: 'eviolite',
        name: 'Eviolite',
        cnName: '进化奇石',
        category: 'held',
        consumable: false,
        fling: { basePower: 40 },
        effect: 'eviolite',
        statBoost: { def: 1.5, spd: 1.5 }, // 防御和特防x1.5
        requiresNFE: true, // 只对未完全进化的宝可梦有效
        description: '未完全进化的宝可梦防御和特防x1.5',
    },
    
    // --- 突击背心 (Assault Vest) ---
    assaultvest: {
        id: 'assaultvest',
        name: 'Assault Vest',
        cnName: '突击背心',
        category: 'held',
        consumable: false,
        fling: { basePower: 80 },
        effect: 'assaultVest',
        statBoost: { spd: 1.5 }, // 特防x1.5
        disableStatus: true, // 禁止使用变化技
        description: '特防x1.5，但无法使用变化技',
    },
    
    // --- 气球 (Air Balloon) ---
    airballoon: {
        id: 'airballoon',
        name: 'Air Balloon',
        cnName: '气球',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'airBalloon',
        immunity: ['Ground'], // 免疫地面
        popOnHit: true, // 被攻击后破裂
        description: '免疫地面系招式，被攻击后破裂',
    },
    
    // --- 光之黏土 (Light Clay) ---
    lightclay: {
        id: 'lightclay',
        name: 'Light Clay',
        cnName: '光之黏土',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'extendScreens',
        screenDuration: 8, // 壁类招式持续8回合（默认5）
        description: '反射壁、光墙、极光幕持续8回合',
    },
    
    // --- 凸凸头盔 (Rocky Helmet) ---
    rockyhelmet: {
        id: 'rockyhelmet',
        name: 'Rocky Helmet',
        cnName: '凸凸头盔',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'rockyHelmet',
        contactDamage: 1/6, // 接触攻击者损失 1/6 HP
        description: '被接触类招式攻击时，攻击者损失1/6最大HP',
    },
    
    // --- 防尘护目镜 (Safety Goggles) ---
    safetygoggles: {
        id: 'safetygoggles',
        name: 'Safety Goggles',
        cnName: '防尘护目镜',
        category: 'held',
        consumable: false,
        fling: { basePower: 80 },
        effect: 'safetyGoggles',
        immunePowder: true, // 免疫粉末类招式
        immuneWeatherDamage: true, // 免疫沙暴/冰雹伤害
        description: '免疫粉末类招式（催眠粉、蘑菇孢子等）和沙暴/冰雹伤害',
    },
    
    // --- 达人带 (Expert Belt) ---
    expertbelt: {
        id: 'expertbelt',
        name: 'Expert Belt',
        cnName: '达人带',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'expertBelt',
        superEffectiveBoost: 1.2, // 效果拔群时伤害x1.2
        description: '效果拔群的招式伤害x1.2',
    },
    
    // --- 弱点保险 (Weakness Policy) ---
    weaknesspolicy: {
        id: 'weaknesspolicy',
        name: 'Weakness Policy',
        cnName: '弱点保险',
        category: 'held',
        consumable: true,
        fling: { basePower: 80 },
        effect: 'weaknessPolicy',
        boosts: { atk: 2, spa: 2 }, // 被弱点攻击后攻击特攻+2
        description: '被效果拔群的招式攻击后，攻击和特攻各+2级',
    },
    
    // --- 火焰宝珠 (Flame Orb) ---
    flameorb: {
        id: 'flameorb',
        name: 'Flame Orb',
        cnName: '火焰宝珠',
        category: 'held',
        consumable: false,
        fling: { basePower: 30, status: 'brn' },
        effect: 'flameOrb',
        selfStatus: 'brn', // 回合结束时自己烧伤
        description: '回合结束时使自己陷入灼伤状态',
    },
    
    // --- 剧毒宝珠 (Toxic Orb) ---
    toxicorb: {
        id: 'toxicorb',
        name: 'Toxic Orb',
        cnName: '剧毒宝珠',
        category: 'held',
        consumable: false,
        fling: { basePower: 30, status: 'tox' },
        effect: 'toxicOrb',
        selfStatus: 'tox', // 回合结束时自己剧毒
        description: '回合结束时使自己陷入剧毒状态',
    },
    
    // --- 厚底靴 (Heavy-Duty Boots) ---
    heavydutyboots: {
        id: 'heavydutyboots',
        name: 'Heavy-Duty Boots',
        cnName: '厚底靴',
        category: 'held',
        consumable: false,
        fling: { basePower: 80 },
        effect: 'heavyDutyBoots',
        ignoreHazards: true, // 免疫入场危害（岩钉、毒菱、黏黏网等）
        description: '免疫所有入场危害（隐形岩、撒菱、毒菱、黏黏网）',
    },
    
    // --- 红牌 (Red Card) ---
    redcard: {
        id: 'redcard',
        name: 'Red Card',
        cnName: '红牌',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'redCard',
        forceSwitch: true, // 被攻击后强制对方换人
        description: '被攻击后强制对方更换宝可梦',
    },
    
    // --- 逃脱按键 (Eject Button) ---
    ejectbutton: {
        id: 'ejectbutton',
        name: 'Eject Button',
        cnName: '逃脱按键',
        category: 'held',
        consumable: true,
        fling: { basePower: 30 },
        effect: 'ejectButton',
        selfSwitch: true, // 被攻击后自己换人
        description: '被攻击后可以更换自己的宝可梦',
    },
    
    // --- 携带逃跑包 (Eject Pack) ---
    ejectpack: {
        id: 'ejectpack',
        name: 'Eject Pack',
        cnName: '携带逃跑包',
        category: 'held',
        consumable: true,
        fling: { basePower: 50 },
        effect: 'ejectPack',
        switchOnStatDrop: true, // 能力下降时换人
        description: '能力下降时可以更换宝可梦',
    },
    
    // ========== 属性强化道具 (Type-Boosting Items) ==========
    
    charcoal: {
        id: 'charcoal',
        name: 'Charcoal',
        cnName: '木炭',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Fire',
        boost: 1.2,
        description: '火属性招式威力x1.2',
    },
    mysticwater: {
        id: 'mysticwater',
        name: 'Mystic Water',
        cnName: '神秘水滴',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Water',
        boost: 1.2,
        description: '水属性招式威力x1.2',
    },
    miracleseed: {
        id: 'miracleseed',
        name: 'Miracle Seed',
        cnName: '奇迹种子',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Grass',
        boost: 1.2,
        description: '草属性招式威力x1.2',
    },
    magnet: {
        id: 'magnet',
        name: 'Magnet',
        cnName: '磁铁',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Electric',
        boost: 1.2,
        description: '电属性招式威力x1.2',
    },
    nevermeltice: {
        id: 'nevermeltice',
        name: 'Never-Melt Ice',
        cnName: '不融冰',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Ice',
        boost: 1.2,
        description: '冰属性招式威力x1.2',
    },
    blackbelt: {
        id: 'blackbelt',
        name: 'Black Belt',
        cnName: '黑带',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Fighting',
        boost: 1.2,
        description: '格斗属性招式威力x1.2',
    },
    poisonbarb: {
        id: 'poisonbarb',
        name: 'Poison Barb',
        cnName: '毒针',
        category: 'held',
        consumable: false,
        fling: { basePower: 70, status: 'psn' },
        effect: 'typeBoost',
        boostedType: 'Poison',
        boost: 1.2,
        description: '毒属性招式威力x1.2',
    },
    softsand: {
        id: 'softsand',
        name: 'Soft Sand',
        cnName: '柔软沙子',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'typeBoost',
        boostedType: 'Ground',
        boost: 1.2,
        description: '地面属性招式威力x1.2',
    },
    sharpbeak: {
        id: 'sharpbeak',
        name: 'Sharp Beak',
        cnName: '锐利鸟嘴',
        category: 'held',
        consumable: false,
        fling: { basePower: 50 },
        effect: 'typeBoost',
        boostedType: 'Flying',
        boost: 1.2,
        description: '飞行属性招式威力x1.2',
    },
    twistedspoon: {
        id: 'twistedspoon',
        name: 'Twisted Spoon',
        cnName: '弯曲的汤匙',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Psychic',
        boost: 1.2,
        description: '超能力属性招式威力x1.2',
    },
    silverpowder: {
        id: 'silverpowder',
        name: 'Silver Powder',
        cnName: '银粉',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'typeBoost',
        boostedType: 'Bug',
        boost: 1.2,
        description: '虫属性招式威力x1.2',
    },
    hardstone: {
        id: 'hardstone',
        name: 'Hard Stone',
        cnName: '硬石头',
        category: 'held',
        consumable: false,
        fling: { basePower: 100 },
        effect: 'typeBoost',
        boostedType: 'Rock',
        boost: 1.2,
        description: '岩石属性招式威力x1.2',
    },
    spelltag: {
        id: 'spelltag',
        name: 'Spell Tag',
        cnName: '诅咒之符',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Ghost',
        boost: 1.2,
        description: '幽灵属性招式威力x1.2',
    },
    dragonfang: {
        id: 'dragonfang',
        name: 'Dragon Fang',
        cnName: '龙之牙',
        category: 'held',
        consumable: false,
        fling: { basePower: 70 },
        effect: 'typeBoost',
        boostedType: 'Dragon',
        boost: 1.2,
        description: '龙属性招式威力x1.2',
    },
    blackglasses: {
        id: 'blackglasses',
        name: 'Black Glasses',
        cnName: '黑色眼镜',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Dark',
        boost: 1.2,
        description: '恶属性招式威力x1.2',
    },
    metalcoat: {
        id: 'metalcoat',
        name: 'Metal Coat',
        cnName: '金属膜',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoost',
        boostedType: 'Steel',
        boost: 1.2,
        description: '钢属性招式威力x1.2',
    },
    silkscarf: {
        id: 'silkscarf',
        name: 'Silk Scarf',
        cnName: '丝绸围巾',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'typeBoost',
        boostedType: 'Normal',
        boost: 1.2,
        description: '一般属性招式威力x1.2',
    },
    fairyfeather: {
        id: 'fairyfeather',
        name: 'Fairy Feather',
        cnName: '妖精之羽',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'typeBoost',
        boostedType: 'Fairy',
        boost: 1.2,
        description: '妖精属性招式威力x1.2',
    },
    
    // ========== 消耗型香草 (Consumable Herbs) ==========
    
    // 【白色香草 White Herb】破壳梦核心
    whiteherb: {
        id: 'whiteherb',
        name: 'White Herb',
        cnName: '白色香草',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'whiteHerb',
        description: '能力下降时自动还原（一次性）',
    },
    
    // 【强力香草 Power Herb】蓄力技瞬发
    powerherb: {
        id: 'powerherb',
        name: 'Power Herb',
        cnName: '强力香草',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'powerHerb',
        description: '蓄力技能第一回合就可以瞬发（一次性）',
    },
    
    // 【精神香草 Mental Herb】空间队核心
    mentalherb: {
        id: 'mentalherb',
        name: 'Mental Herb',
        cnName: '精神香草',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'mentalHerb',
        cures: ['taunt', 'encore', 'torment', 'healblock', 'disable', 'attract'],
        description: '解除挑衅、再来一次、无理取闹、回复封锁、定身法、着迷（一次性）',
    },
    
    // ========== 天气岩石 (Weather Rocks) ==========
    
    // 【热岩石 Heat Rock】晴天队核心
    heatrock: {
        id: 'heatrock',
        name: 'Heat Rock',
        cnName: '热岩石',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'extendWeather',
        weather: 'sun',
        duration: 8, // 从5回合延长到8回合
        description: '晴天持续8回合（默认5回合）',
    },
    
    // 【潮湿岩石 Damp Rock】雨天队核心
    damprock: {
        id: 'damprock',
        name: 'Damp Rock',
        cnName: '潮湿岩石',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'extendWeather',
        weather: 'rain',
        duration: 8,
        description: '雨天持续8回合（默认5回合）',
    },
    
    // 【沙沙岩石 Smooth Rock】沙暴队核心
    smoothrock: {
        id: 'smoothrock',
        name: 'Smooth Rock',
        cnName: '沙沙岩石',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'extendWeather',
        weather: 'sandstorm',
        duration: 8,
        description: '沙暴持续8回合（默认5回合）',
    },
    
    // 【冰冷岩石 Icy Rock】雪天队核心
    icyrock: {
        id: 'icyrock',
        name: 'Icy Rock',
        cnName: '冰冷岩石',
        category: 'held',
        consumable: false,
        fling: { basePower: 40 },
        effect: 'extendWeather',
        weather: 'snow',
        duration: 8,
        description: '雪天持续8回合（默认5回合）',
    },
    
    // ========== 场地种子 (Terrain Seeds) ==========
    
    // 【电气种子 Electric Seed】电气场地消耗
    electricseed: {
        id: 'electricseed',
        name: 'Electric Seed',
        cnName: '电气种子',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'terrainSeed',
        terrain: 'electricterrain',
        boosts: { def: 1 },
        description: '电气场地时防御+1（一次性）',
    },
    
    // 【青草种子 Grassy Seed】青草场地消耗
    grassyseed: {
        id: 'grassyseed',
        name: 'Grassy Seed',
        cnName: '青草种子',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'terrainSeed',
        terrain: 'grassyterrain',
        boosts: { def: 1 },
        description: '青草场地时防御+1（一次性）',
    },
    
    // 【薄雾种子 Misty Seed】薄雾场地消耗
    mistyseed: {
        id: 'mistyseed',
        name: 'Misty Seed',
        cnName: '薄雾种子',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'terrainSeed',
        terrain: 'mistyterrain',
        boosts: { spd: 1 },
        description: '薄雾场地时特防+1（一次性）',
    },
    
    // 【精神种子 Psychic Seed】精神场地消耗
    psychicseed: {
        id: 'psychicseed',
        name: 'Psychic Seed',
        cnName: '精神种子',
        category: 'held',
        consumable: true,
        fling: { basePower: 10 },
        effect: 'terrainSeed',
        terrain: 'psychicterrain',
        boosts: { spd: 1 },
        description: '精神场地时特防+1（一次性）',
    },
    
    // 【大地膜 Terrain Extender】场地延长
    terrainextender: {
        id: 'terrainextender',
        name: 'Terrain Extender',
        cnName: '大地膜',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'extendTerrain',
        duration: 8, // 从5回合延长到8回合
        description: '场地持续8回合（默认5回合）',
    },
    
    // ========== 战术针对型道具 (Niche Tech Items) ==========
    
    // 【漂亮外壳 Shed Shell】反制踩影
    shedshell: {
        id: 'shedshell',
        name: 'Shed Shell',
        cnName: '漂亮外壳',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'shedShell',
        ignoreTrapping: true, // 无视踩影、磁力等
        description: '无视因特性或招式导致的无法换人',
    },
    
    // 【一般宝石 Normal Gem】大爆炸核心
    normalgem: {
        id: 'normalgem',
        name: 'Normal Gem',
        cnName: '一般宝石',
        category: 'held',
        consumable: true,
        fling: { basePower: 0 },
        effect: 'typeGem',
        boostedType: 'Normal',
        boost: 1.3, // Gen6+ 是 1.3，Gen5 是 1.5
        description: '一般属性招式威力x1.3（一次性）',
    },
    
    // 【飞行宝石 Flying Gem】杂技核心
    flyinggem: {
        id: 'flyinggem',
        name: 'Flying Gem',
        cnName: '飞行宝石',
        category: 'held',
        consumable: true,
        fling: { basePower: 0 },
        effect: 'typeGem',
        boostedType: 'Flying',
        boost: 1.3,
        description: '飞行属性招式威力x1.3（一次性）',
    },
    
    // 【节拍器 Metronome (Item)】连打战术
    metronomeitem: {
        id: 'metronomeitem',
        name: 'Metronome',
        cnName: '节拍器',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'metronome',
        maxBoost: 2.0, // 最高 x2.0
        description: '连续使用同一招式，威力递增（最高x2.0）',
    },
    
    // 【驱劲能量 Booster Energy】悖谬种核心
    boosterenergy: {
        id: 'boosterenergy',
        name: 'Booster Energy',
        cnName: '驱劲能量',
        category: 'held',
        consumable: true,
        fling: { basePower: 30 },
        effect: 'boosterEnergy',
        description: '激活古代活性/夸克充能特性（一次性）',
    },
    
    // ========== 属性石板 (Plates) - 阿尔宙斯专属 ==========
    
    flameplate: {
        id: 'flameplate',
        name: 'Flame Plate',
        cnName: '火之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Fire',
        boost: 1.2,
        onPlate: 'Arceus', // 阿尔宙斯专属变形
        description: '火属性招式威力x1.2，阿尔宙斯变为火属性',
    },
    splashplate: {
        id: 'splashplate',
        name: 'Splash Plate',
        cnName: '水之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Water',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '水属性招式威力x1.2，阿尔宙斯变为水属性',
    },
    meadowplate: {
        id: 'meadowplate',
        name: 'Meadow Plate',
        cnName: '草之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Grass',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '草属性招式威力x1.2，阿尔宙斯变为草属性',
    },
    zapplate: {
        id: 'zapplate',
        name: 'Zap Plate',
        cnName: '雷之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Electric',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '电属性招式威力x1.2，阿尔宙斯变为电属性',
    },
    icicleplate: {
        id: 'icicleplate',
        name: 'Icicle Plate',
        cnName: '冰之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Ice',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '冰属性招式威力x1.2，阿尔宙斯变为冰属性',
    },
    fistplate: {
        id: 'fistplate',
        name: 'Fist Plate',
        cnName: '拳之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Fighting',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '格斗属性招式威力x1.2，阿尔宙斯变为格斗属性',
    },
    toxicplate: {
        id: 'toxicplate',
        name: 'Toxic Plate',
        cnName: '毒之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Poison',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '毒属性招式威力x1.2，阿尔宙斯变为毒属性',
    },
    earthplate: {
        id: 'earthplate',
        name: 'Earth Plate',
        cnName: '地之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Ground',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '地面属性招式威力x1.2，阿尔宙斯变为地面属性',
    },
    skyplate: {
        id: 'skyplate',
        name: 'Sky Plate',
        cnName: '天之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Flying',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '飞行属性招式威力x1.2，阿尔宙斯变为飞行属性',
    },
    mindplate: {
        id: 'mindplate',
        name: 'Mind Plate',
        cnName: '心之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Psychic',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '超能属性招式威力x1.2，阿尔宙斯变为超能属性',
    },
    insectplate: {
        id: 'insectplate',
        name: 'Insect Plate',
        cnName: '虫之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Bug',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '虫属性招式威力x1.2，阿尔宙斯变为虫属性',
    },
    stoneplate: {
        id: 'stoneplate',
        name: 'Stone Plate',
        cnName: '岩之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Rock',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '岩石属性招式威力x1.2，阿尔宙斯变为岩石属性',
    },
    spookyplate: {
        id: 'spookyplate',
        name: 'Spooky Plate',
        cnName: '妖之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Ghost',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '幽灵属性招式威力x1.2，阿尔宙斯变为幽灵属性',
    },
    dracoplate: {
        id: 'dracoplate',
        name: 'Draco Plate',
        cnName: '龙之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Dragon',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '龙属性招式威力x1.2，阿尔宙斯变为龙属性',
    },
    dreadplate: {
        id: 'dreadplate',
        name: 'Dread Plate',
        cnName: '恶之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Dark',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '恶属性招式威力x1.2，阿尔宙斯变为恶属性',
    },
    ironplate: {
        id: 'ironplate',
        name: 'Iron Plate',
        cnName: '钢之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Steel',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '钢属性招式威力x1.2，阿尔宙斯变为钢属性',
    },
    pixieplate: {
        id: 'pixieplate',
        name: 'Pixie Plate',
        cnName: '妖之石板',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'plate',
        plateType: 'Fairy',
        boost: 1.2,
        onPlate: 'Arceus',
        description: '妖精属性招式威力x1.2，阿尔宙斯变为妖精属性',
    },
    
    // ========== 太晶珠 (Tera Orbs) ==========
    
    teraorb: {
        id: 'teraorb',
        name: 'Tera Orb',
        cnName: '太晶珠',
        category: 'key',
        consumable: false,
        effect: 'enableTera',
        description: '允许宝可梦进行太晶化',
    },
    
    stellarteraorb: {
        id: 'stellarteraorb',
        name: 'Stellar Tera Orb',
        cnName: '星晶太晶珠',
        category: 'key',
        consumable: false,
        effect: 'enableStellarTera',
        teraType: 'Stellar',
        description: '特殊的太晶珠，允许宝可梦进行星晶太晶化。星晶状态下：原生本系招式2.0x加成，非本系招式1.2x加成，太晶爆发对太晶化目标恒定效果拔群',
    },
    
    // ========== 精灵球 (Poké Balls) ==========
    
    pokeball: {
        id: 'pokeball',
        name: 'Poké Ball',
        cnName: '精灵球',
        category: 'ball',
        catchRate: 1,
        isPokeball: true,
        description: '用于捕捉野生宝可梦的道具',
    },
    greatball: {
        id: 'greatball',
        name: 'Great Ball',
        cnName: '超级球',
        category: 'ball',
        catchRate: 1.5,
        isPokeball: true,
        description: '性能比精灵球好一些的球',
    },
    ultraball: {
        id: 'ultraball',
        name: 'Ultra Ball',
        cnName: '高级球',
        category: 'ball',
        catchRate: 2,
        isPokeball: true,
        description: '性能非常好的球',
    },
    masterball: {
        id: 'masterball',
        name: 'Master Ball',
        cnName: '大师球',
        category: 'ball',
        catchRate: 255, // 必定捕获
        isPokeball: true,
        description: '必定能捕捉到野生宝可梦的最高性能球',
    },
    premierball: {
        id: 'premierball',
        name: 'Premier Ball',
        cnName: '纪念球',
        category: 'ball',
        catchRate: 1,
        isPokeball: true,
        description: '某种纪念用的稀有球',
    },
    quickball: {
        id: 'quickball',
        name: 'Quick Ball',
        cnName: '速度球',
        category: 'ball',
        catchRate: 5, // 第一回合
        catchRateLater: 1, // 之后
        isPokeball: true,
        description: '战斗开始时使用效果拔群的球',
    },
    timerball: {
        id: 'timerball',
        name: 'Timer Ball',
        cnName: '计时球',
        category: 'ball',
        // 捕获率随回合增加
        isPokeball: true,
        description: '回合数越多效果越好的球',
    },
    duskball: {
        id: 'duskball',
        name: 'Dusk Ball',
        cnName: '黑暗球',
        category: 'ball',
        catchRate: 3, // 夜晚或洞穴
        catchRateDay: 1,
        isPokeball: true,
        description: '在黑暗的地方容易捕捉的球',
    },
    healball: {
        id: 'healball',
        name: 'Heal Ball',
        cnName: '治愈球',
        category: 'ball',
        catchRate: 1,
        healOnCatch: true,
        isPokeball: true,
        description: '捕捉后会立即恢复HP和状态的球',
    },
    netball: {
        id: 'netball',
        name: 'Net Ball',
        cnName: '捕网球',
        category: 'ball',
        catchRate: 3.5, // 水/虫属性
        catchRateOther: 1,
        isPokeball: true,
        description: '容易捕捉水属性和虫属性宝可梦的球',
    },
    diveball: {
        id: 'diveball',
        name: 'Dive Ball',
        cnName: '潜水球',
        category: 'ball',
        catchRate: 3.5, // 水中
        catchRateLand: 1,
        isPokeball: true,
        description: '在水中容易捕捉的球',
    },
    luxuryball: {
        id: 'luxuryball',
        name: 'Luxury Ball',
        cnName: '豪华球',
        category: 'ball',
        catchRate: 1,
        friendshipBoost: true,
        isPokeball: true,
        description: '捕捉后亲密度更容易上升的球',
    },
    repeatball: {
        id: 'repeatball',
        name: 'Repeat Ball',
        cnName: '重复球',
        category: 'ball',
        catchRate: 3.5, // 已捕获过的种类
        catchRateNew: 1,
        isPokeball: true,
        description: '容易捕捉曾经捕捉过的宝可梦的球',
    },
    beastball: {
        id: 'beastball',
        name: 'Beast Ball',
        cnName: '究极球',
        category: 'ball',
        catchRate: 5, // 究极异兽
        catchRateOther: 0.1,
        isPokeball: true,
        description: '用于捕捉究极异兽的特殊球',
    },
    dreamball: {
        id: 'dreamball',
        name: 'Dream Ball',
        cnName: '梦境球',
        category: 'ball',
        catchRate: 4, // 睡眠状态
        catchRateAwake: 1,
        isPokeball: true,
        description: '容易捕捉睡眠状态宝可梦的球',
    },
    
    // ========== 树果 (Berries) ==========
    
    // --- 回复树果 ---
    oranberry: {
        id: 'oranberry',
        name: 'Oran Berry',
        cnName: '橙橙果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healAmount: 10,
        triggerHP: 0.5, // HP <= 50% 时触发
        naturalGift: { basePower: 80, type: 'Poison' },
        description: 'HP降到一半以下时恢复10点HP',
    },
    sitrusberry: {
        id: 'sitrusberry',
        name: 'Sitrus Berry',
        cnName: '文柚果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 0.25, // 恢复 25% 最大HP
        triggerHP: 0.5,
        naturalGift: { basePower: 80, type: 'Psychic' },
        description: 'HP降到一半以下时恢复25%最大HP',
    },
    
    // --- 1/3 HP 回复树果 (混乱树果) ---
    figyberry: {
        id: 'figyberry',
        name: 'Figy Berry',
        cnName: '勿花果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 1/3,
        triggerHP: 0.25,
        confuseNature: 'atk', // 减攻击性格会混乱
        naturalGift: { basePower: 80, type: 'Bug' },
        description: 'HP降到1/4以下时恢复1/3最大HP（减攻击性格会混乱）',
    },
    wikiberry: {
        id: 'wikiberry',
        name: 'Wiki Berry',
        cnName: '异奇果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 1/3,
        triggerHP: 0.25,
        confuseNature: 'spa',
        naturalGift: { basePower: 80, type: 'Rock' },
        description: 'HP降到1/4以下时恢复1/3最大HP（减特攻性格会混乱）',
    },
    magoberry: {
        id: 'magoberry',
        name: 'Mago Berry',
        cnName: '芒芒果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 1/3,
        triggerHP: 0.25,
        confuseNature: 'spe',
        naturalGift: { basePower: 80, type: 'Ghost' },
        description: 'HP降到1/4以下时恢复1/3最大HP（减速度性格会混乱）',
    },
    aguavberry: {
        id: 'aguavberry',
        name: 'Aguav Berry',
        cnName: '芭亚果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 1/3,
        triggerHP: 0.25,
        confuseNature: 'spd',
        naturalGift: { basePower: 80, type: 'Dragon' },
        description: 'HP降到1/4以下时恢复1/3最大HP（减特防性格会混乱）',
    },
    iapapaberry: {
        id: 'iapapaberry',
        name: 'Iapapa Berry',
        cnName: '乐芭果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'healOnLowHP',
        healPercent: 1/3,
        triggerHP: 0.25,
        confuseNature: 'def',
        naturalGift: { basePower: 80, type: 'Dark' },
        description: 'HP降到1/4以下时恢复1/3最大HP（减防御性格会混乱）',
    },
    
    // --- 状态回复树果 ---
    cheriberry: {
        id: 'cheriberry',
        name: 'Cheri Berry',
        cnName: '樱子果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureStatus',
        cures: 'par',
        naturalGift: { basePower: 80, type: 'Fire' },
        description: '治愈麻痹状态',
    },
    chestoberry: {
        id: 'chestoberry',
        name: 'Chesto Berry',
        cnName: '零余果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureStatus',
        cures: 'slp',
        naturalGift: { basePower: 80, type: 'Water' },
        description: '治愈睡眠状态',
    },
    pechaberry: {
        id: 'pechaberry',
        name: 'Pecha Berry',
        cnName: '桃桃果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureStatus',
        cures: 'psn',
        naturalGift: { basePower: 80, type: 'Electric' },
        description: '治愈中毒状态',
    },
    rawstberry: {
        id: 'rawstberry',
        name: 'Rawst Berry',
        cnName: '莓莓果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureStatus',
        cures: 'brn',
        naturalGift: { basePower: 80, type: 'Grass' },
        description: '治愈灼伤状态',
    },
    aspearberry: {
        id: 'aspearberry',
        name: 'Aspear Berry',
        cnName: '利木果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureStatus',
        cures: 'frz',
        naturalGift: { basePower: 80, type: 'Ice' },
        description: '治愈冰冻状态',
    },
    persimberry: {
        id: 'persimberry',
        name: 'Persim Berry',
        cnName: '柿仔果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureConfusion',
        naturalGift: { basePower: 80, type: 'Ground' },
        description: '治愈混乱状态',
    },
    lumberry: {
        id: 'lumberry',
        name: 'Lum Berry',
        cnName: '木子果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'cureAll',
        naturalGift: { basePower: 80, type: 'Flying' },
        description: '治愈所有异常状态',
    },
    
    // --- 半伤树果 (抗性树果) ---
    occaberry: {
        id: 'occaberry',
        name: 'Occa Berry',
        cnName: '欧卡果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Fire',
        naturalGift: { basePower: 80, type: 'Fire' },
        description: '受到效果拔群的火属性招式时伤害减半',
    },
    passhoberry: {
        id: 'passhoberry',
        name: 'Passho Berry',
        cnName: '番荔果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Water',
        naturalGift: { basePower: 80, type: 'Water' },
        description: '受到效果拔群的水属性招式时伤害减半',
    },
    wacanberry: {
        id: 'wacanberry',
        name: 'Wacan Berry',
        cnName: '莲蒲果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Electric',
        naturalGift: { basePower: 80, type: 'Electric' },
        description: '受到效果拔群的电属性招式时伤害减半',
    },
    rindoberry: {
        id: 'rindoberry',
        name: 'Rindo Berry',
        cnName: '龙睛果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Grass',
        naturalGift: { basePower: 80, type: 'Grass' },
        description: '受到效果拔群的草属性招式时伤害减半',
    },
    yacheberry: {
        id: 'yacheberry',
        name: 'Yache Berry',
        cnName: '雪莲果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Ice',
        naturalGift: { basePower: 80, type: 'Ice' },
        description: '受到效果拔群的冰属性招式时伤害减半',
    },
    chopleberry: {
        id: 'chopleberry',
        name: 'Chople Berry',
        cnName: '罗子果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Fighting',
        naturalGift: { basePower: 80, type: 'Fighting' },
        description: '受到效果拔群的格斗属性招式时伤害减半',
    },
    kebiaberry: {
        id: 'kebiaberry',
        name: 'Kebia Berry',
        cnName: '草蚕果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Poison',
        naturalGift: { basePower: 80, type: 'Poison' },
        description: '受到效果拔群的毒属性招式时伤害减半',
    },
    shucaberry: {
        id: 'shucaberry',
        name: 'Shuca Berry',
        cnName: '沙鳞果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Ground',
        naturalGift: { basePower: 80, type: 'Ground' },
        description: '受到效果拔群的地面属性招式时伤害减半',
    },
    cobaberry: {
        id: 'cobaberry',
        name: 'Coba Berry',
        cnName: '科巴果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Flying',
        naturalGift: { basePower: 80, type: 'Flying' },
        description: '受到效果拔群的飞行属性招式时伤害减半',
    },
    payapaberry: {
        id: 'payapaberry',
        name: 'Payapa Berry',
        cnName: '芭乐果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Psychic',
        naturalGift: { basePower: 80, type: 'Psychic' },
        description: '受到效果拔群的超能力属性招式时伤害减半',
    },
    tangaberry: {
        id: 'tangaberry',
        name: 'Tanga Berry',
        cnName: '扁樱果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Bug',
        naturalGift: { basePower: 80, type: 'Bug' },
        description: '受到效果拔群的虫属性招式时伤害减半',
    },
    chartiberry: {
        id: 'chartiberry',
        name: 'Charti Berry',
        cnName: '岩荔果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Rock',
        naturalGift: { basePower: 80, type: 'Rock' },
        description: '受到效果拔群的岩石属性招式时伤害减半',
    },
    kasibberry: {
        id: 'kasibberry',
        name: 'Kasib Berry',
        cnName: '幽灵果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Ghost',
        naturalGift: { basePower: 80, type: 'Ghost' },
        description: '受到效果拔群的幽灵属性招式时伤害减半',
    },
    habanberry: {
        id: 'habanberry',
        name: 'Haban Berry',
        cnName: '哈密果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Dragon',
        naturalGift: { basePower: 80, type: 'Dragon' },
        description: '受到效果拔群的龙属性招式时伤害减半',
    },
    colburberry: {
        id: 'colburberry',
        name: 'Colbur Berry',
        cnName: '霹霹果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Dark',
        naturalGift: { basePower: 80, type: 'Dark' },
        description: '受到效果拔群的恶属性招式时伤害减半',
    },
    babiriberry: {
        id: 'babiriberry',
        name: 'Babiri Berry',
        cnName: '霸比果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Steel',
        naturalGift: { basePower: 80, type: 'Steel' },
        description: '受到效果拔群的钢属性招式时伤害减半',
    },
    chilanberry: {
        id: 'chilanberry',
        name: 'Chilan Berry',
        cnName: '奇朗果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Normal',
        naturalGift: { basePower: 80, type: 'Normal' },
        description: '受到一般属性招式时伤害减半',
    },
    roseliberry: {
        id: 'roseliberry',
        name: 'Roseli Berry',
        cnName: '蔷薇果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'resistBerry',
        resistType: 'Fairy',
        naturalGift: { basePower: 80, type: 'Fairy' },
        description: '受到效果拔群的妖精属性招式时伤害减半',
    },

    // --- 危机强化树果 (Pinch Berries) ---
    liechiberry: {
        id: 'liechiberry',
        name: 'Liechi Berry',
        cnName: '枝荔果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'pinchBoost',
        statBoost: { atk: 1 },
        triggerHP: 0.25,
        naturalGift: { basePower: 100, type: 'Grass' },
        description: 'HP降到1/4以下时攻击+1级',
    },
    ganlonberry: {
        id: 'ganlonberry',
        name: 'Ganlon Berry',
        cnName: '龙成果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'pinchBoost',
        statBoost: { def: 1 },
        triggerHP: 0.25,
        naturalGift: { basePower: 100, type: 'Ice' },
        description: 'HP降到1/4以下时防御+1级',
    },
    salacberry: {
        id: 'salacberry',
        name: 'Salac Berry',
        cnName: '莎啦果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'pinchBoost',
        statBoost: { spe: 1 },
        triggerHP: 0.25,
        naturalGift: { basePower: 100, type: 'Fighting' },
        description: 'HP降到1/4以下时速度+1级',
    },
    petayaberry: {
        id: 'petayaberry',
        name: 'Petaya Berry',
        cnName: '龙火果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'pinchBoost',
        statBoost: { spa: 1 },
        triggerHP: 0.25,
        naturalGift: { basePower: 100, type: 'Poison' },
        description: 'HP降到1/4以下时特攻+1级',
    },
    apicotberry: {
        id: 'apicotberry',
        name: 'Apicot Berry',
        cnName: '杏仔果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'pinchBoost',
        statBoost: { spd: 1 },
        triggerHP: 0.25,
        naturalGift: { basePower: 100, type: 'Ground' },
        description: 'HP降到1/4以下时特防+1级',
    },
    starfberry: {
        id: 'starfberry',
        name: 'Starf Berry',
        cnName: '星桃果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'pinchBoostRandom',
        boostAmount: 2, // 随机一项+2
        triggerHP: 0.25,
        naturalGift: { basePower: 100, type: 'Psychic' },
        description: 'HP降到1/4以下时随机一项能力+2级',
    },
    lansatberry: {
        id: 'lansatberry',
        name: 'Lansat Berry',
        cnName: '兰萨果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'pinchCrit',
        triggerHP: 0.25,
        naturalGift: { basePower: 100, type: 'Flying' },
        description: 'HP降到1/4以下时进入聚气状态（容易击中要害）',
    },
    custapberry: {
        id: 'custapberry',
        name: 'Custap Berry',
        cnName: '释陀果',
        category: 'berry',
        consumable: true,
        isBerry: true,
        effect: 'pinchPriority',
        triggerHP: 0.25,
        naturalGift: { basePower: 100, type: 'Ghost' },
        description: 'HP降到1/4以下时下一次行动获得先制',
    },
    
    // ========== 神兽专属道具 ==========
    
    adamantorb: {
        id: 'adamantorb',
        name: 'Adamant Orb',
        cnName: '金刚玉',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'typeBoostSpecies',
        itemUser: ['Dialga'],
        boostedTypes: ['Steel', 'Dragon'],
        boost: 1.2,
        description: '帝牙卢卡持有时钢和龙属性招式威力x1.2',
    },
    lustrousorb: {
        id: 'lustrousorb',
        name: 'Lustrous Orb',
        cnName: '白玉宝珠',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'typeBoostSpecies',
        itemUser: ['Palkia'],
        boostedTypes: ['Water', 'Dragon'],
        boost: 1.2,
        description: '帕路奇亚持有时水和龙属性招式威力x1.2',
    },
    griseousorb: {
        id: 'griseousorb',
        name: 'Griseous Orb',
        cnName: '白金玉',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'typeBoostSpecies',
        itemUser: ['Giratina'],
        boostedTypes: ['Ghost', 'Dragon'],
        boost: 1.2,
        forcedForme: 'Giratina-Origin',
        description: '骑拉帝纳持有时幽灵和龙属性招式威力x1.2，并变为起源形态',
    },
    souldew: {
        id: 'souldew',
        name: 'Soul Dew',
        cnName: '心之水滴',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'typeBoostSpecies',
        itemUser: ['Latios', 'Latias'],
        boostedTypes: ['Psychic', 'Dragon'],
        boost: 1.2,
        description: '拉帝欧斯/拉帝亚斯持有时超能力和龙属性招式威力x1.2',
    },
    
    // --- 原始回归宝珠 ---
    redorb: {
        id: 'redorb',
        name: 'Red Orb',
        cnName: '红色宝珠',
        category: 'held',
        consumable: false,
        effect: 'primalReversion',
        itemUser: ['Groudon'],
        forcedForme: 'Groudon-Primal',
        isPrimalOrb: true,
        description: '固拉多持有时会进行原始回归',
    },
    blueorb: {
        id: 'blueorb',
        name: 'Blue Orb',
        cnName: '蓝色宝珠',
        category: 'held',
        consumable: false,
        effect: 'primalReversion',
        itemUser: ['Kyogre'],
        forcedForme: 'Kyogre-Primal',
        isPrimalOrb: true,
        description: '盖欧卡持有时会进行原始回归',
    },
    
    // --- 苍响/藏玛然特专属 ---
    rustedsword: {
        id: 'rustedsword',
        name: 'Rusted Sword',
        cnName: '腐朽的剑',
        category: 'held',
        consumable: false,
        effect: 'formeChange',
        itemUser: ['Zacian'],
        forcedForme: 'Zacian-Crowned',
        description: '苍响持有时会变为剑之王形态',
    },
    rustedshield: {
        id: 'rustedshield',
        name: 'Rusted Shield',
        cnName: '腐朽的盾',
        category: 'held',
        consumable: false,
        effect: 'formeChange',
        itemUser: ['Zamazenta'],
        forcedForme: 'Zamazenta-Crowned',
        description: '藏玛然特持有时会变为盾之王形态',
    },
    
    // ========== 专属强化道具 ==========
    
    lightball: {
        id: 'lightball',
        name: 'Light Ball',
        cnName: '电气球',
        category: 'held',
        consumable: false,
        fling: { basePower: 30, status: 'par' },
        effect: 'speciesBoost',
        itemUser: ['Pikachu'],
        statBoost: { atk: 2, spa: 2 },
        description: '皮卡丘持有时攻击和特攻翻倍',
    },
    thickclub: {
        id: 'thickclub',
        name: 'Thick Club',
        cnName: '粗骨头',
        category: 'held',
        consumable: false,
        fling: { basePower: 90 },
        effect: 'speciesBoost',
        itemUser: ['Cubone', 'Marowak', 'Marowak-Alola'],
        statBoost: { atk: 2 },
        description: '卡拉卡拉/嘎啦嘎啦持有时攻击翻倍',
    },
    leek: {
        id: 'leek',
        name: 'Leek',
        cnName: '大葱',
        category: 'held',
        consumable: false,
        fling: { basePower: 60 },
        effect: 'critBoost',
        itemUser: ['Farfetchd', 'Farfetchd-Galar', 'Sirfetchd'],
        critBoost: 2,
        description: "大葱鸭/葱游兵持有时容易击中要害",
    },
    luckypunch: {
        id: 'luckypunch',
        name: 'Lucky Punch',
        cnName: '幸运拳套',
        category: 'held',
        consumable: false,
        fling: { basePower: 40 },
        effect: 'critBoost',
        itemUser: ['Chansey'],
        critBoost: 2,
        description: '吉利蛋持有时容易击中要害',
    },
    
    // ============================================
    // 暴击强化道具 (Crit-Boosting Items)
    // ============================================
    scopelens: {
        id: 'scopelens',
        name: 'Scope Lens',
        cnName: '焦点镜',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'critBoost',
        critBoost: 1,
        description: '持有时容易击中要害（暴击等级+1）',
    },
    razorclaw: {
        id: 'razorclaw',
        name: 'Razor Claw',
        cnName: '锐利之爪',
        category: 'held',
        consumable: false,
        fling: { basePower: 80 },
        effect: 'critBoost',
        critBoost: 1,
        description: '持有时容易击中要害（暴击等级+1）',
    },
    
    metalpowder: {
        id: 'metalpowder',
        name: 'Metal Powder',
        cnName: '金属粉',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'speciesBoost',
        itemUser: ['Ditto'],
        statBoost: { def: 2 },
        requiresUntransformed: true,
        description: '百变怪（未变身时）持有时防御翻倍',
    },
    quickpowder: {
        id: 'quickpowder',
        name: 'Quick Powder',
        cnName: '速度粉',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'speciesBoost',
        itemUser: ['Ditto'],
        statBoost: { spe: 2 },
        requiresUntransformed: true,
        description: '百变怪（未变身时）持有时速度翻倍',
    },
    
    // ========== Gen 9 机制修缮道具 (Gen 9 Staples) ==========
    
    // --- 均等之骰 (Loaded Dice) ---
    loadeddice: {
        id: 'loadeddice',
        name: 'Loaded Dice',
        cnName: '均等之骰',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'multiHitBoost',
        description: '多段攻击招式保底命中4-5次',
    },
    
    // --- 清净坠饰 (Clear Amulet) ---
    clearamulet: {
        id: 'clearamulet',
        name: 'Clear Amulet',
        cnName: '清净坠饰',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'preventStatDrop',
        description: '能力等级不会被对手降低',
    },
    
    // --- 隐密斗篷 (Covert Cloak) ---
    covertcloak: {
        id: 'covertcloak',
        name: 'Covert Cloak',
        cnName: '隐密斗篷',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'ignoreSecondary',
        description: '免疫对手招式的追加效果',
    },
    
    // ========== 经典功能性道具 (Classic Utility Items) ==========
    
    // --- 广角镜 (Wide Lens) ---
    widelens: {
        id: 'widelens',
        name: 'Wide Lens',
        cnName: '广角镜',
        category: 'held',
        consumable: false,
        fling: { basePower: 10 },
        effect: 'accuracyBoost',
        accuracyMod: 1.1,
        description: '命中率x1.1',
    },
    
    // --- 贝壳之铃 (Shell Bell) ---
    shellbell: {
        id: 'shellbell',
        name: 'Shell Bell',
        cnName: '贝壳之铃',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'drainOnHit',
        drainRatio: 8, // 1/8
        description: '造成伤害时恢复该伤害值1/8的HP',
    },
    
    // --- 防护垫 (Protective Pads) ---
    protectivepads: {
        id: 'protectivepads',
        name: 'Protective Pads',
        cnName: '防护垫',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'ignoreContact',
        description: '使用接触类招式时不会触发接触反制效果',
    },
    
    // --- 拳击手套 (Punching Glove) ---
    punchingglove: {
        id: 'punchingglove',
        name: 'Punching Glove',
        cnName: '拳击手套',
        category: 'held',
        consumable: false,
        fling: { basePower: 30 },
        effect: 'punchBoost',
        powerMod: 1.1,
        description: '拳头类招式威力x1.1，且不触发接触反制',
    },
    
    // ========== 战术触发道具 (Tactical Triggers) ==========
    
    // --- 爽喉喷雾 (Throat Spray) ---
    throatspray: {
        id: 'throatspray',
        name: 'Throat Spray',
        cnName: '爽喉喷雾',
        category: 'held',
        consumable: true,
        fling: { basePower: 30 },
        effect: 'soundBoost',
        boostOnSound: { spa: 1 },
        description: '使用声音类招式后特攻+1（一次性）',
    },
    
    // --- 路痴保险 (Blunder Policy) ---
    blunderpolicy: {
        id: 'blunderpolicy',
        name: 'Blunder Policy',
        cnName: '路痴保险',
        category: 'held',
        consumable: true,
        fling: { basePower: 80 },
        effect: 'missBoost',
        boostOnMiss: { spe: 2 },
        description: '招式Miss后速度+2（一次性）',
    },
};

// ============================================
// 道具分类常量
// ============================================

// 不可交换的道具 (Trick/Switcheroo 无效)
const UNSWAPPABLE_ITEMS = [
    // 神兽专属
    'rustedsword', 'rustedshield',
    'griseousorb', 'adamantorb', 'lustrousorb',
    'adamantcrystal', 'lustrousglobe', 'griseouscore',
    // 专属强化
    'souldew', 'lightball', 'thickclub', 'luckypunch', 'leek', 'stick',
    // 邮件
    'mail',
    // 原始回归
    'redorb', 'blueorb',
];

// Mega 石判定 (以 'ite' 结尾但不是 'eviolite')
function isMegaStone(itemId) {
    return itemId.endsWith('ite') && itemId !== 'eviolite';
}

// Z 水晶判定
function isZCrystal(itemId) {
    return itemId.endsWith('iumz') || itemId.endsWith('iniumz');
}

// 检查道具是否可交换
function isSwappable(itemId) {
    if (!itemId) return true;
    const id = itemId.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (UNSWAPPABLE_ITEMS.includes(id)) return false;
    if (isMegaStone(id)) return false;
    if (isZCrystal(id)) return false;
    return true;
}

// ============================================
// 道具效果处理器
// ============================================

const ItemEffects = {
    /**
     * 【内部辅助】触发吃树果相关的特性钩子
     * - Cheek Pouch: 额外回复 1/3 HP
     * - Cud Chew: 记录树果，下回合再吃一次
     * - Unburden: 道具消耗后速度翻倍
     */
    _triggerBerryAbilityHooks(pokemon, berry, logs) {
        if (!pokemon.ability || typeof AbilityHandlers === 'undefined') return;
        
        const handler = AbilityHandlers[pokemon.ability];
        if (!handler) return;
        
        // Cheek Pouch: 吃树果额外回复 1/3 HP
        if (handler.onEatBerry) {
            handler.onEatBerry(pokemon, berry, logs);
        }
        
        // Unburden: 道具消耗后速度翻倍
        if (handler.onItemLost) {
            handler.onItemLost(pokemon, berry, logs);
        }
    },
    
    /**
     * 检查 Focus Sash 效果
     * @returns {boolean} 是否触发了气势披带
     */
    checkFocusSash(pokemon, damage) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId !== 'focussash') return false;
        if (pokemon.currHp !== pokemon.maxHp) return false;
        if (damage < pokemon.currHp) return false;
        
        // 触发效果
        pokemon.currHp = 1;
        pokemon.item = null;
        pokemon.focusSashTriggered = true;
        return true;
    },
    
    /**
     * 检查 Choice 道具锁招
     */
    isChoiceLocked(pokemon) {
        const item = pokemon.item || '';
        const itemData = getItem(item);
        return itemData && itemData.isChoice;
    },
    
    /**
     * 获取 Light Clay 的壁持续回合数
     */
    getScreenDuration(pokemon) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId === 'lightclay') return 8;
        return 5;
    },
    
    /**
     * 获取精灵球捕获率
     */
    getBallCatchRate(ballId, context = {}) {
        const ball = ITEMS[ballId];
        if (!ball || !ball.isPokeball) return 1;
        
        // 特殊球的条件判断
        if (ballId === 'quickball' && context.turn === 1) {
            return ball.catchRate;
        }
        if (ballId === 'quickball' && context.turn > 1) {
            return ball.catchRateLater || 1;
        }
        
        return ball.catchRate || 1;
    },

    /**
     * 检查抗性树果减伤
     * @param {Object} pokemon - 防御方
     * @param {string} moveType - 招式属性
     * @param {number} effectiveness - 属性克制倍率
     * @returns {Object} { triggered: boolean, damageMultiplier: number, message: string }
     */
    checkResistBerry(pokemon, moveType, effectiveness, opponent = null) {
        // 【BUG修复】Chilan Berry（奇朗果）不需要效果拔群，一般属性攻击即可触发
        // 其他抗性果需要 effectiveness >= 2（效果拔群）
        if (!pokemon.item) return { triggered: false, damageMultiplier: 1 };
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        const itemData = ITEMS[itemId];
        
        if (!itemData || itemData.effect !== 'resistBerry') return { triggered: false, damageMultiplier: 1 };
        if (itemData.resistType !== moveType) return { triggered: false, damageMultiplier: 1 };
        
        // Chilan Berry 特殊判定：一般属性攻击即触发（不需要效果拔群）
        // 其他抗性果需要效果拔群
        if (itemData.resistType !== 'Normal' && effectiveness < 2) {
            return { triggered: false, damageMultiplier: 1 };
        }
        
        // 【BUG修复】Unnerve（紧张感）检查：对手有紧张感时无法吃树果
        if (opponent && opponent.ability) {
            const oppAbilityId = opponent.ability.toLowerCase().replace(/[^a-z]/g, '');
            if (oppAbilityId === 'unnerve') {
                console.log(`[UNNERVE] ${pokemon.cnName} 因对手的紧张感无法吃抗性果`);
                return { triggered: false, damageMultiplier: 1 };
            }
        }
        if (pokemon.cannotEatBerry) {
            return { triggered: false, damageMultiplier: 1 };
        }
        
        // 触发抗性果
        const berryName = itemData.cnName || itemData.name;
        const consumedBerry = pokemon.item;
        pokemon.item = null;
        
        // 【BUG修复】触发吃树果相关特性钩子（Cheek Pouch / Unburden 等）
        this._triggerBerryAbilityHooks(pokemon, consumedBerry, []);
        
        return {
            triggered: true,
            damageMultiplier: 0.5,
            message: `${pokemon.cnName} 吃掉了${berryName}，减弱了伤害！`
        };
    },

    /**
     * 检查 HP 阈值触发的树果 (回复/强化)
     * @param {Object} pokemon - 宝可梦
     * @param {Array} logs - 日志数组
     * @param {Object} opponent - 对手（用于检查 Unnerve）
     * @returns {boolean} 是否触发了树果
     */
    checkHPBerry(pokemon, logs = [], opponent = null) {
        if (!pokemon.item) return false;
        
        // 【紧张感 Unnerve】检查：对手有紧张感时无法吃树果
        if (opponent && opponent.ability) {
            const oppAbilityId = opponent.ability.toLowerCase().replace(/[^a-z]/g, '');
            if (oppAbilityId === 'unnerve') {
                console.log(`[UNNERVE] ${pokemon.cnName} 因对手的紧张感无法吃树果`);
                return false;
            }
        }
        // 也检查 cannotEatBerry 标记
        if (pokemon.cannotEatBerry) {
            console.log(`[UNNERVE] ${pokemon.cnName} 被标记为无法吃树果`);
            return false;
        }
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        const itemData = ITEMS[itemId];
        if (!itemData || !itemData.isBerry) return false;
        
        const hpPercent = pokemon.currHp / pokemon.maxHp;
        const abilityId = pokemon.ability ? pokemon.ability.toLowerCase().replace(/[^a-z]/g, '') : '';
        const isGluttony = abilityId === 'gluttony';
        
        // 贪吃鬼特性：触发线提升到 50%
        let triggerThreshold = itemData.triggerHP || 0.25;
        if (isGluttony && triggerThreshold === 0.25) {
            triggerThreshold = 0.5;
        }
        
        if (hpPercent > triggerThreshold) return false;
        
        // 【环境图层系统】检查道具是否被禁用
        if (typeof window !== 'undefined' && window.envOverlay?.isItemBanned) {
            if (window.envOverlay.isItemBanned(pokemon, itemId)) {
                logs.push(`<span style="color:#8b8b8b">环境效果阻止了 ${pokemon.cnName} 使用道具!</span>`);
                return false;
            }
        }
        
        const berryName = itemData.cnName || itemData.name;
        const consumedBerry = pokemon.item; // 记录消耗的树果
        
        // 回复类树果
        if (itemData.effect === 'healOnLowHP') {
            let baseHeal = 0;
            if (itemData.healPercent) {
                baseHeal = Math.floor(pokemon.maxHp * itemData.healPercent);
            } else if (itemData.healAmount) {
                baseHeal = itemData.healAmount;
            }
            
            if (baseHeal > 0) {
                let actualHeal = baseHeal;
                if (typeof pokemon.heal === 'function') {
                    actualHeal = pokemon.heal(baseHeal);
                } else {
                    pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + baseHeal);
                }
                pokemon.item = null;
                pokemon.usedBerry = consumedBerry; // 记录用于 Harvest 回收
                logs.push(`<span style="color:#27ae60">🍇 ${pokemon.cnName} 吃掉了${berryName}，回复了 ${actualHeal} 点体力！</span>`);
                
                // 触发吃树果相关特性钩子
                this._triggerBerryAbilityHooks(pokemon, consumedBerry, logs);
                return true;
            }
        }
        
        // 强化类树果
        if (itemData.effect === 'pinchBoost' && itemData.statBoost) {
            pokemon.item = null;
            pokemon.usedBerry = consumedBerry;
            if (typeof pokemon.applyBoost === 'function') {
                for (const [stat, amount] of Object.entries(itemData.statBoost)) {
                    pokemon.applyBoost(stat, amount);
                }
            } else {
                if (!pokemon.boosts) pokemon.boosts = {};
                for (const [stat, amount] of Object.entries(itemData.statBoost)) {
                    pokemon.boosts[stat] = Math.min(6, (pokemon.boosts[stat] || 0) + amount);
                }
            }
            const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
            const boostStr = Object.entries(itemData.statBoost).map(([s, a]) => `${statNames[s] || s}+${a}`).join('/');
            logs.push(`<span style="color:#f39c12">🍒 ${pokemon.cnName} 吃掉了${berryName}，${boostStr}！</span>`);
            this._triggerBerryAbilityHooks(pokemon, consumedBerry, logs);
            return true;
        }
        
        // 随机强化树果 (星桃果)
        if (itemData.effect === 'pinchBoostRandom') {
            pokemon.item = null;
            pokemon.usedBerry = consumedBerry;
            const stats = ['atk', 'def', 'spa', 'spd', 'spe'];
            const randomStat = stats[Math.floor(Math.random() * stats.length)];
            const amount = itemData.boostAmount || 2;
            if (typeof pokemon.applyBoost === 'function') {
                pokemon.applyBoost(randomStat, amount);
            } else {
                if (!pokemon.boosts) pokemon.boosts = {};
                pokemon.boosts[randomStat] = Math.min(6, (pokemon.boosts[randomStat] || 0) + amount);
            }
            const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
            logs.push(`<span style="color:#f39c12">⭐ ${pokemon.cnName} 吃掉了${berryName}，${statNames[randomStat]}+${amount}！</span>`);
            this._triggerBerryAbilityHooks(pokemon, consumedBerry, logs);
            return true;
        }
        
        // 聚气树果 (兰萨果)
        if (itemData.effect === 'pinchCrit') {
            pokemon.item = null;
            pokemon.usedBerry = consumedBerry;
            if (!pokemon.volatile) pokemon.volatile = {};
            pokemon.volatile.focusenergy = true;
            logs.push(`<span style="color:#e74c3c">🔥 ${pokemon.cnName} 吃掉了${berryName}，进入了聚气状态！</span>`);
            // 【BUG修复】触发吃树果相关特性钩子
            this._triggerBerryAbilityHooks(pokemon, consumedBerry, logs);
            return true;
        }
        
        // 先制树果 (释陀果)
        if (itemData.effect === 'pinchPriority') {
            pokemon.item = null;
            pokemon.usedBerry = consumedBerry;
            if (!pokemon.volatile) pokemon.volatile = {};
            pokemon.volatile.custap = true;
            logs.push(`<span style="color:#9b59b6">⚡ ${pokemon.cnName} 吃掉了${berryName}，下一次行动将获得先制！</span>`);
            // 【BUG修复】触发吃树果相关特性钩子
            this._triggerBerryAbilityHooks(pokemon, consumedBerry, logs);
            return true;
        }
        
        return false;
    },
    
    /**
     * 【新增】检查状态治愈树果（零余果、桃桃果、木子果等）
     * 应在状态变化后立即调用
     * @param {Object} pokemon - 宝可梦
     * @param {Array} logs - 日志数组
     * @returns {boolean} 是否触发了树果
     */
    checkStatusBerry(pokemon, logs = [], opponent = null) {
        if (!pokemon.item || !pokemon.status) return false;
        
        // 【BUG修复】Unnerve（紧张感）检查
        if (opponent && opponent.ability) {
            const oppAbilityId = opponent.ability.toLowerCase().replace(/[^a-z]/g, '');
            if (oppAbilityId === 'unnerve') return false;
        }
        if (pokemon.cannotEatBerry) return false;
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        const itemData = ITEMS[itemId];
        if (!itemData || !itemData.isBerry) return false;
        
        const berryName = itemData.cnName || itemData.name;
        
        // 状态治愈树果 (cureStatus)
        if (itemData.effect === 'cureStatus' && itemData.cures === pokemon.status) {
            const statusNames = { par: '麻痹', brn: '灶伤', psn: '中毒', tox: '剧毒', slp: '睡眠', frz: '冰冻' };
            const consumedBerry = pokemon.item;
            pokemon.status = null;
            pokemon.statusTurns = 0;
            pokemon.sleepTurns = 0;
            pokemon.sleepDuration = 0;
            pokemon.item = null;
            pokemon.usedBerry = consumedBerry;
            logs.push(`<span style="color:#27ae60">🍒 ${pokemon.cnName} 吃掉了${berryName}，治愈了${statusNames[itemData.cures] || '异常状态'}！</span>`);
            // 【BUG修复】触发吃树果相关特性钩子
            this._triggerBerryAbilityHooks(pokemon, consumedBerry, logs);
            return true;
        }
        
        // 全状态治愈树果 (木子果 Lum Berry)
        if (itemData.effect === 'cureAll' && pokemon.status) {
            const statusNames = { par: '麻痹', brn: '灶伤', psn: '中毒', tox: '剧毒', slp: '睡眠', frz: '冰冻' };
            const oldStatus = pokemon.status;
            const consumedBerry = pokemon.item;
            pokemon.status = null;
            pokemon.statusTurns = 0;
            pokemon.sleepTurns = 0;
            pokemon.sleepDuration = 0;
            pokemon.item = null;
            pokemon.usedBerry = consumedBerry;
            logs.push(`<span style="color:#27ae60">🍒 ${pokemon.cnName} 吃掉了${berryName}，治愈了${statusNames[oldStatus] || '异常状态'}！</span>`);
            // 【BUG修复】触发吃树果相关特性钩子
            this._triggerBerryAbilityHooks(pokemon, consumedBerry, logs);
            return true;
        }
        
        return false;
    },
    
    // ============================================
    // 2026-01 新增道具效果
    // ============================================
    
    /**
     * 【白色香草 White Herb】能力下降时自动还原
     * 应在 applyBoost 后调用
     * @param {Object} pokemon - 宝可梦
     * @param {string} stat - 下降的能力
     * @param {number} stages - 下降的阶级（负数）
     * @param {Array} logs - 日志数组
     * @returns {boolean} 是否触发
     */
    checkWhiteHerb(pokemon, stat, stages, logs = []) {
        if (!pokemon.item || stages >= 0) return false;
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId !== 'whiteherb') return false;
        
        // 还原所有下降的能力
        const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度', acc: '命中', eva: '闪避' };
        const restored = [];
        
        for (const s of ['atk', 'def', 'spa', 'spd', 'spe', 'acc', 'eva']) {
            if (pokemon.boosts && pokemon.boosts[s] < 0) {
                restored.push(statNames[s] || s);
                pokemon.boosts[s] = 0;
            }
        }
        
        if (restored.length > 0) {
            pokemon.item = null;
            logs.push(`<b style="color:#27ae60">🌿 ${pokemon.cnName} 的白色香草生效了！${restored.join('、')}恢复了！</b>`);
            return true;
        }
        
        return false;
    },
    
    /**
     * 【精神香草 Mental Herb】解除挑衅等状态
     * 应在被挑衅/再来一次等状态后调用
     * @param {Object} pokemon - 宝可梦
     * @param {string} condition - 被施加的状态
     * @param {Array} logs - 日志数组
     * @returns {boolean} 是否触发
     */
    checkMentalHerb(pokemon, condition, logs = []) {
        if (!pokemon.item) return false;
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId !== 'mentalherb') return false;
        
        const cures = ['taunt', 'encore', 'torment', 'healblock', 'disable', 'attract'];
        if (!cures.includes(condition)) return false;
        
        // 【BUG修复】根据不同状态使用正确的清除方式
        if (pokemon.volatile) {
            if (condition === 'encore') {
                pokemon.volatile.encore = 0;
                pokemon.volatile.encoreMove = null;
            } else if (condition === 'torment') {
                pokemon.volatile.torment = false;
            } else if (condition === 'disable') {
                pokemon.volatile.disable = 0;
                pokemon.volatile.disabledMove = null;
            } else if (condition === 'attract') {
                pokemon.volatile.attract = false;
            } else {
                pokemon.volatile[condition] = 0;
            }
        }
        
        const conditionNames = {
            taunt: '挑衅', encore: '再来一次', torment: '无理取闹',
            healblock: '回复封锁', disable: '定身法', attract: '着迷'
        };
        
        pokemon.item = null;
        logs.push(`<b style="color:#9b59b6">🌿 ${pokemon.cnName} 的精神香草生效了！解除了${conditionNames[condition] || condition}！</b>`);
        return true;
    },
    
    /**
     * 【天气岩石】获取天气持续回合数
     * @param {Object} pokemon - 使用天气技能的宝可梦
     * @param {string} weather - 天气类型
     * @returns {number} 持续回合数
     */
    getWeatherDuration(pokemon, weather) {
        if (!pokemon.item) return 5;
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        const itemData = ITEMS[itemId];
        
        if (!itemData || itemData.effect !== 'extendWeather') return 5;
        if (itemData.weather !== weather) return 5;
        
        return itemData.duration || 8;
    },
    
    /**
     * 【场地种子】检查场地种子触发
     * 应在场地变化或入场时调用
     * @param {Object} pokemon - 宝可梦
     * @param {string} terrain - 当前场地
     * @param {Array} logs - 日志数组
     * @returns {boolean} 是否触发
     */
    checkTerrainSeed(pokemon, terrain, logs = []) {
        if (!pokemon.item || !terrain) return false;
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        const itemData = ITEMS[itemId];
        
        if (!itemData || itemData.effect !== 'terrainSeed') return false;
        if (itemData.terrain !== terrain) return false;
        
        // 应用能力提升
        const seedName = itemData.cnName || itemData.name;
        const statNames = { def: '防御', spd: '特防' };
        
        for (const [stat, amount] of Object.entries(itemData.boosts)) {
            if (typeof pokemon.applyBoost === 'function') {
                pokemon.applyBoost(stat, amount);
            } else {
                if (!pokemon.boosts) pokemon.boosts = {};
                pokemon.boosts[stat] = Math.min(6, (pokemon.boosts[stat] || 0) + amount);
            }
            logs.push(`<b style="color:#22c55e">🌱 ${pokemon.cnName} 的${seedName}生效了！${statNames[stat] || stat}提升了！</b>`);
        }
        
        pokemon.item = null;
        
        // 触发 Unburden
        if (typeof AbilityHandlers !== 'undefined' && pokemon.ability) {
            const handler = AbilityHandlers[pokemon.ability];
            if (handler && handler.onItemLost) {
                handler.onItemLost(pokemon, seedName, logs);
            }
        }
        
        return true;
    },
    
    /**
     * 【大地膜】获取场地持续回合数
     * @param {Object} pokemon - 使用场地技能的宝可梦
     * @returns {number} 持续回合数
     */
    getTerrainDuration(pokemon) {
        if (!pokemon.item) return 5;
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId === 'terrainextender') return 8;
        
        return 5;
    },
    
    /**
     * 【属性宝石】检查属性宝石触发
     * 应在伤害计算前调用
     * @param {Object} pokemon - 攻击方
     * @param {string} moveType - 招式属性
     * @param {Array} logs - 日志数组
     * @returns {number} 威力倍率
     */
    checkTypeGem(pokemon, moveType, logs = []) {
        if (!pokemon.item) return 1;
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        const itemData = ITEMS[itemId];
        
        if (!itemData || itemData.effect !== 'typeGem') return 1;
        if (itemData.boostedType !== moveType) return 1;
        
        const gemName = itemData.cnName || itemData.name;
        pokemon.item = null;
        logs.push(`<b style="color:#a855f7">💎 ${pokemon.cnName} 的${gemName}发光了！</b>`);
        
        return itemData.boost || 1.3;
    },
    
    /**
     * 【漂亮外壳】检查是否可以换人
     * @param {Object} pokemon - 宝可梦
     * @returns {boolean} 是否可以无视束缚换人
     */
    canEscapeTrapping(pokemon) {
        if (!pokemon.item) return false;
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        const itemData = ITEMS[itemId];
        
        return itemData && itemData.ignoreTrapping;
    },
    
    /**
     * 【节拍器】获取连续使用同一招式的威力加成
     * @param {Object} pokemon - 宝可梦
     * @param {string} moveName - 当前招式名
     * @returns {number} 威力倍率
     */
    getMetronomeBoost(pokemon, moveName) {
        if (!pokemon.item) return 1;
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId !== 'metronomeitem') return 1;
        
        // 检查是否连续使用同一招式
        if (!pokemon.lastMove || pokemon.lastMove !== moveName) {
            pokemon.metronomeCount = 1;
            return 1;
        }
        
        // 连续使用，递增计数
        pokemon.metronomeCount = Math.min(5, (pokemon.metronomeCount || 1) + 1);
        // 威力 = 1.0 + 0.2 * (count - 1)，最高 2.0
        return 1 + 0.2 * (pokemon.metronomeCount - 1);
    },
    
    /**
     * 【石板】获取石板威力加成
     * @param {Object} pokemon - 宝可梦
     * @param {string} moveType - 招式属性
     * @returns {number} 威力倍率
     */
    getPlateBoost(pokemon, moveType) {
        if (!pokemon.item) return 1;
        
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
        const itemData = ITEMS[itemId];
        
        if (!itemData || itemData.effect !== 'plate') return 1;
        if (itemData.plateType !== moveType) return 1;
        
        return itemData.boost || 1.2;
    },
    
    // ============================================
    // Gen 9 机制修缮道具效果
    // ============================================
    
    /**
     * 【均等之骰】获取多段攻击次数
     * @param {Object} pokemon - 宝可梦
     * @param {number} minHits - 最小次数
     * @param {number} maxHits - 最大次数
     * @returns {number} 实际命中次数
     */
    getMultiHitCount(pokemon, minHits = 2, maxHits = 5) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (itemId === 'loadeddice') {
            // 均等之骰：保底4-5次
            return Math.random() < 0.5 ? 4 : 5;
        }
        
        // 默认多段攻击概率分布 (2-5次)
        // 2次: 35%, 3次: 35%, 4次: 15%, 5次: 15%
        const roll = Math.random();
        if (roll < 0.35) return 2;
        if (roll < 0.70) return 3;
        if (roll < 0.85) return 4;
        return 5;
    },
    
    /**
     * 【清净坠饰】检查是否阻止能力下降
     * @param {Object} pokemon - 防御方
     * @param {Object} source - 来源（攻击方）
     * @param {number} change - 能力变化值
     * @returns {boolean} 是否阻止
     */
    checkClearAmulet(pokemon, source, change) {
        if (change >= 0) return false; // 只阻止下降
        
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId !== 'clearamulet') return false;
        
        // 检查是否来自对手
        if (source && source !== pokemon) {
            return true; // 阻止对手造成的能力下降
        }
        return false;
    },
    
    /**
     * 【隐密斗篷】检查是否免疫追加效果
     * @param {Object} pokemon - 防御方
     * @returns {boolean} 是否免疫
     */
    hasCovertCloak(pokemon) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return itemId === 'covertcloak';
    },
    
    /**
     * 【广角镜】获取命中率修正
     * @param {Object} pokemon - 攻击方
     * @returns {number} 命中率倍率
     */
    getAccuracyMod(pokemon) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId === 'widelens') return 1.1;
        if (itemId === 'zoomlens') return 1.2; // 对焦镜（后手时）
        return 1;
    },
    
    /**
     * 【贝壳之铃】造成伤害后回血
     * @param {Object} pokemon - 攻击方
     * @param {number} damage - 造成的伤害
     * @param {Array} logs - 日志数组
     * @returns {number} 回复的HP
     */
    checkShellBell(pokemon, damage, logs = []) {
        if (damage <= 0) return 0;
        
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId !== 'shellbell') return 0;
        
        const baseHeal = Math.max(1, Math.floor(damage / 8));
        
        let actualHeal = 0;
        if (typeof pokemon.heal === 'function') {
            actualHeal = pokemon.heal(baseHeal);
        } else {
            actualHeal = Math.min(baseHeal, pokemon.maxHp - pokemon.currHp);
            if (actualHeal > 0) {
                pokemon.currHp += actualHeal;
            }
        }
        
        if (actualHeal > 0) {
            logs.push(`🔔 ${pokemon.cnName} 的贝壳之铃恢复了 ${actualHeal} HP!`);
        }
        
        return actualHeal;
    },
    
    /**
     * 【防护垫/拳击手套】检查是否免疫接触反制
     * @param {Object} pokemon - 攻击方
     * @returns {boolean} 是否免疫
     */
    hasContactImmunity(pokemon) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return itemId === 'protectivepads' || itemId === 'punchingglove';
    },
    
    /**
     * 【拳击手套】获取拳头类招式威力加成
     * @param {Object} pokemon - 攻击方
     * @param {Object} move - 招式
     * @returns {number} 威力倍率
     */
    getPunchingGloveBoost(pokemon, move) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId !== 'punchingglove') return 1;
        
        // 检查是否为拳头类招式
        if (move.flags && move.flags.punch) return 1.1;
        
        // 备用：检查招式名称
        const punchMoves = ['megapunch', 'firepunch', 'icepunch', 'thunderpunch', 
            'machpunch', 'focuspunch', 'cometpunch', 'drainpunch', 'dynamicpunch',
            'hammerarm', 'poweruppunch', 'shadowpunch', 'skyuppercut', 'bulletpunch',
            'meteormash', 'dizzypunch', 'ragefist', 'surgingstrikes', 'wickedblow'];
        const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (punchMoves.includes(moveId)) return 1.1;
        
        return 1;
    },
    
    /**
     * 【爽喉喷雾】使用声音招式后触发
     * @param {Object} pokemon - 攻击方
     * @param {Object} move - 招式
     * @param {Array} logs - 日志数组
     * @returns {boolean} 是否触发
     */
    checkThroatSpray(pokemon, move, logs = []) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId !== 'throatspray') return false;
        
        // 检查是否为声音类招式
        const isSound = move.flags && move.flags.sound;
        if (!isSound) return false;
        
        // 触发效果
        if (!pokemon.boosts) pokemon.boosts = {};
        const oldSpa = pokemon.boosts.spa || 0;
        pokemon.boosts.spa = Math.min(6, oldSpa + 1);
        
        if (pokemon.boosts.spa > oldSpa) {
            pokemon.item = null; // 消耗道具
            logs.push(`<span style="color:#9b59b6">🎤 ${pokemon.cnName} 的爽喉喷雾发动! 特攻提升了!</span>`);
            return true;
        }
        
        return false;
    },
    
    /**
     * 【路痴保险】招式Miss后触发
     * @param {Object} pokemon - 攻击方
     * @param {Array} logs - 日志数组
     * @returns {boolean} 是否触发
     */
    checkBlunderPolicy(pokemon, logs = []) {
        const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId !== 'blunderpolicy') return false;
        
        // 触发效果
        if (!pokemon.boosts) pokemon.boosts = {};
        const oldSpe = pokemon.boosts.spe || 0;
        pokemon.boosts.spe = Math.min(6, oldSpe + 2);
        
        if (pokemon.boosts.spe > oldSpe) {
            pokemon.item = null; // 消耗道具
            logs.push(`<span style="color:#e67e22">📋 ${pokemon.cnName} 的路痴保险发动! 速度大幅提升!</span>`);
            return true;
        }
        
        return false;
    },
};

// ============================================
// 工具函数
// ============================================

/**
 * 根据 ID 获取道具数据
 * @param {string} itemName - 道具名称或 ID
 * @returns {Object|null} 道具数据对象
 */
function getItem(itemName) {
    if (!itemName) return null;
    const id = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return ITEMS[id] || null;
}

/**
 * 根据道具名称获取 ID
 */
function getItemId(itemName) {
    if (!itemName) return null;
    return itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * 获取所有精灵球
 */
function getAllPokeballs() {
    return Object.values(ITEMS).filter(item => item.isPokeball);
}

/**
 * 获取所有树果
 */
function getAllBerries() {
    return Object.values(ITEMS).filter(item => item.isBerry);
}

/**
 * 检查是否为 Choice 道具
 */
function isChoiceItem(itemName) {
    const item = getItem(itemName);
    return item && item.isChoice;
}

// ============================================
// 树果效果触发函数（用于 Cud Chew 等）
// ============================================

/**
 * 触发树果效果（不消耗道具，仅触发效果）
 * 用于 Cud Chew 反刍特性
 * @param {Object} pokemon - 宝可梦
 * @param {string} berry - 树果名称
 * @param {Array} logs - 日志数组
 */
function triggerBerryEffect(pokemon, berry, logs = []) {
    if (!berry) return;
    
    const itemId = berry.toLowerCase().replace(/[^a-z0-9]/g, '');
    const itemData = ITEMS[itemId];
    if (!itemData || !itemData.isBerry) return;
    
    const berryName = itemData.cnName || itemData.name;
    
    // 回复类树果
    if (itemData.effect === 'healOnLowHP') {
        let baseHeal = 0;
        if (itemData.healPercent) {
            baseHeal = Math.floor(pokemon.maxHp * itemData.healPercent);
        } else if (itemData.healAmount) {
            baseHeal = itemData.healAmount;
        }
        if (baseHeal > 0) {
            let actualHeal = baseHeal;
            if (typeof pokemon.heal === 'function') {
                actualHeal = pokemon.heal(baseHeal);
            } else {
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + baseHeal);
            }
            logs.push(`<span style="color:#27ae60">回复了 ${actualHeal} 点体力！</span>`);
        }
    }
    
    // 强化类树果
    if (itemData.effect === 'pinchBoost' && itemData.statBoost) {
        if (!pokemon.boosts) pokemon.boosts = {};
        for (const [stat, amount] of Object.entries(itemData.statBoost)) {
            pokemon.boosts[stat] = Math.min(6, (pokemon.boosts[stat] || 0) + amount);
        }
        const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
        const boostStr = Object.entries(itemData.statBoost).map(([s, a]) => `${statNames[s] || s}+${a}`).join('/');
        logs.push(`<span style="color:#f39c12">${boostStr}！</span>`);
    }
    
    // 状态治愈类树果
    if (itemData.effect === 'cureStatus' && itemData.cures && pokemon.status === itemData.cures) {
        pokemon.status = null;
        pokemon.statusTurns = 0;
        const statusNames = { slp: '睡眠', psn: '中毒', brn: '灼伤', par: '麻痹', frz: '冰冻' };
        logs.push(`<span style="color:#27ae60">${statusNames[itemData.cures] || '异常状态'}被治愈了！</span>`);
    }
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.ITEMS = ITEMS;
    window.UNSWAPPABLE_ITEMS = UNSWAPPABLE_ITEMS;
    window.ItemEffects = ItemEffects;
    window.getItem = getItem;
    window.getItemId = getItemId;
    window.getAllPokeballs = getAllPokeballs;
    window.getAllBerries = getAllBerries;
    window.isChoiceItem = isChoiceItem;
    window.isMegaStone = isMegaStone;
    window.isZCrystal = isZCrystal;
    window.isSwappable = isSwappable;
    window.triggerBerryEffect = triggerBerryEffect; // Cud Chew 等需要
}

// ES Module 导出
export {
    UNSWAPPABLE_ITEMS,
    ItemEffects,
    getItem,
    getItemId,
    getAllPokeballs,
    getAllBerries,
    isChoiceItem,
    isMegaStone,
    isZCrystal,
    isSwappable,
};
