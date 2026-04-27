/**
 * =============================================
 * MOVE CONSTANTS - 招式硬编码数据 (精简版)
 * =============================================
 * 
 * 本文件仅保留 PS moves-data.js 中没有的数据。
 * 
 * 已迁移到 moves-data.js 的属性：
 * - priority → move.priority
 * - recoil → move.recoil
 * - drain → move.drain
 * - willCrit → move.willCrit
 * - boosts → move.boosts
 * - status → move.status
 * - heal flag → move.flags.heal
 */

// ============================================
// 1. 束缚类技能 (Trapping Moves)
// ============================================
// PS 没有直接的 flag，需要保留
export const TRAPPING_MOVES = [
    'Fire Spin',
    'Whirlpool',
    'Bind',
    'Wrap',
    'Sand Tomb',
    'Magma Storm',
    'Infestation',
    'Clamp',
    'Snap Trap',
    'Thunder Cage'
];

// ============================================
// 2. AI 评分用 - 守住技能列表 (Protect Moves)
// ============================================
// PS 没有直接的 flag，需要保留
export const AI_PROTECT_MOVES = [
    'Protect',
    'Detect',
    'King\'s Shield',
    'Spiky Shield',
    'Baneful Bunker',
    'Obstruct',
    'Silk Trap',
    'Max Guard'
];

// ============================================
// 3. 宝可梦形态后缀 (Form Suffixes)
// ============================================
// 用于 extractBaseFormId() 函数
export const FORM_SUFFIXES = [
    'starter',      // 搭档形态 (Let's Go)
    'gmax',         // 极巨化
    'megax', 'megay', 'mega',  // Mega进化
    'alola', 'galar', 'hisui', 'paldea',  // 地区形态
    'therian', 'incarnate',  // 灵兽/化身
    'origin', 'altered',     // 起源/另一形态
    'crowned', 'hero',       // 王冠/英雄
    'eternamax',    // 无极巨化
    'primal',       // 原始回归
    'ultra',        // 究极
    'ash',          // 小智版
    'totem',        // 霸主
    'cosplay', 'phd', 'libre', 'popstar', 'rockstar', 'belle', // 皮卡丘换装
    'original', 'hoenn', 'sinnoh', 'unova', 'kalos', 'partner', 'world'  // 帽子皮卡丘
];

// ============================================
// 4. 默认后备招式 (Fallback Moves)
// ============================================
export const FALLBACK_MOVES = [
    'Tackle',
    'Quick Attack',
    'Ember',
    'Water Gun',
    'Vine Whip'
];

// ============================================
// 5. 超极巨化因子速查表 (G-Max Species Data)
// ============================================
// Key: 宝可梦 Species ID (小写无符号)
// Value: { move: 专属招式名, type: 触发属性, cn: 中文招式名 }
export const GMAX_SPECIES_DATA = {
    // ================= 关都地区 (Gen 1) =================
    'venusaur':         { move: 'G-Max Vine Lash',    type: 'Grass',    cn: '超极巨灰飞鞭灭' },   // 妙蛙花
    'charizard':        { move: 'G-Max Wildfire',     type: 'Fire',     cn: '超极巨深渊灭焰' },   // 喷火龙
    'blastoise':        { move: 'G-Max Cannonade',    type: 'Water',    cn: '超极巨水炮轰灭' },   // 水箭龟
    'butterfree':       { move: 'G-Max Befuddle',     type: 'Bug',      cn: '超极巨蝶影蛊惑' },   // 巴大蝶
    'pikachu':          { move: 'G-Max Volt Crash',   type: 'Electric', cn: '超极巨万雷轰顶' },   // 皮卡丘
    'meowth':           { move: 'G-Max Gold Rush',    type: 'Normal',   cn: '超极巨特大金币' },   // 喵喵
    'machamp':          { move: 'G-Max Chi Strike',   type: 'Fighting', cn: '超极巨会心一击' },   // 怪力
    'gengar':           { move: 'G-Max Terror',       type: 'Ghost',    cn: '超极巨幻影幽魂' },   // 耿鬼
    'kingler':          { move: 'G-Max Foam Burst',   type: 'Water',    cn: '超极巨激漩泡涡' },   // 巨钳蟹
    'lapras':           { move: 'G-Max Resonance',    type: 'Ice',      cn: '超极巨极光旋律' },   // 拉普拉斯 (冰系触发)
    'eevee':            { move: 'G-Max Cuddle',       type: 'Normal',   cn: '超极巨热情拥抱' },   // 伊布
    'snorlax':          { move: 'G-Max Replenish',    type: 'Normal',   cn: '超极巨资源再生' },   // 卡比兽

    // ================= 合众地区 (Gen 5) =================
    'garbodor':         { move: 'G-Max Malodor',      type: 'Poison',   cn: '超极巨臭气冲天' },   // 灰尘山

    // ================= 阿罗拉地区 (Gen 7) =================
    'melmetal':         { move: 'G-Max Meltdown',     type: 'Steel',    cn: '超极巨液金熔击' },   // 美录梅塔

    // ================= 伽勒尔地区 (Gen 8) =================
    'rillaboom':        { move: 'G-Max Drum Solo',    type: 'Grass',    cn: '超极巨狂擂乱打' },   // 轰擂金刚猩
    'cinderace':        { move: 'G-Max Fireball',     type: 'Fire',     cn: '超极巨破阵火球' },   // 闪焰王牌
    'inteleon':         { move: 'G-Max Hydrosnipe',   type: 'Water',    cn: '超极巨狙击神射' },   // 千面避役
    'corviknight':      { move: 'G-Max Wind Rage',    type: 'Flying',   cn: '超极巨旋风袭卷' },   // 钢铠鸦
    'orbeetle':         { move: 'G-Max Gravitas',     type: 'Psychic',  cn: '超极巨天道七星' },   // 以欧路普
    'drednaw':          { move: 'G-Max Stonesurge',   type: 'Water',    cn: '超极巨岩阵以待' },   // 暴噬龟
    'coalossal':        { move: 'G-Max Volcalith',    type: 'Rock',     cn: '超极巨炎石喷发' },   // 巨炭山
    'flapple':          { move: 'G-Max Tartness',     type: 'Grass',    cn: '超极巨酸不溜丢' },   // 苹裹龙
    'appletun':         { move: 'G-Max Sweetness',    type: 'Grass',    cn: '超极巨琼浆玉液' },   // 丰蜜龙
    'sandaconda':       { move: 'G-Max Sandblast',    type: 'Ground',   cn: '超极巨沙尘漫天' },   // 沙螺蟒
    'toxtricity':       { move: 'G-Max Stun Shock',   type: 'Electric', cn: '超极巨异毒电场' },   // 颤弦蝾螈 (高调)
    'toxtricitylowkey': { move: 'G-Max Stun Shock',   type: 'Electric', cn: '超极巨异毒电场' },   // 颤弦蝾螈 (低调)
    'centiskorch':      { move: 'G-Max Centiferno',   type: 'Fire',     cn: '超极巨百火焚野' },   // 焚焰蚣
    'hatterene':        { move: 'G-Max Smite',        type: 'Fairy',    cn: '超极巨天谴雷诛' },   // 布莉姆温
    'grimmsnarl':       { move: 'G-Max Snooze',       type: 'Dark',     cn: '超极巨睡魔降临' },   // 长毛巨魔
    'alcremie':         { move: 'G-Max Finale',       type: 'Fairy',    cn: '超极巨幸福圆满' },   // 霜奶仙
    'copperajah':       { move: 'G-Max Steelsurge',   type: 'Steel',    cn: '超极巨钢铁阵法' },   // 大王铜象
    'duraludon':        { move: 'G-Max Depletion',    type: 'Dragon',   cn: '超极巨劣化衰变' },   // 铝钢龙

    // ================= 武道熊师 (Urshifu) =================
    'urshifu':             { move: 'G-Max One Blow',   type: 'Dark',    cn: '超极巨夺命一击' },   // 一击流 (默认)
    'urshifusinglestrike': { move: 'G-Max One Blow',   type: 'Dark',    cn: '超极巨夺命一击' },   // 一击流
    'urshifurapidstrike':  { move: 'G-Max Rapid Flow', type: 'Water',   cn: '超极巨流水连击' }    // 连击流
};

// ============================================
// 6. 通用极巨招式映射表 (Generic Max Moves by Type)
// ============================================
export const GENERIC_MAX_BY_TYPE = {
    'Normal':   'Max Strike',
    'Fire':     'Max Flare',
    'Water':    'Max Geyser',
    'Electric': 'Max Lightning',
    'Grass':    'Max Overgrowth',
    'Ice':      'Max Hailstorm',
    'Fighting': 'Max Knuckle',
    'Poison':   'Max Ooze',
    'Ground':   'Max Quake',
    'Flying':   'Max Airstream',
    'Psychic':  'Max Mindstorm',
    'Bug':      'Max Flutterby',
    'Rock':     'Max Rockfall',
    'Ghost':    'Max Phantasm',
    'Dragon':   'Max Wyrmwind',
    'Dark':     'Max Darkness',
    'Steel':    'Max Steelspike',
    'Fairy':    'Max Starfall'
};

// ============================================
// 7. 通用极巨招式中文名映射
// ============================================
export const GENERIC_MAX_CN = {
    'Max Strike':    '极巨攻击',
    'Max Flare':     '极巨火爆',
    'Max Geyser':    '极巨水流',
    'Max Lightning': '极巨闪电',
    'Max Overgrowth':'极巨草原',
    'Max Hailstorm': '极巨寒冰',
    'Max Knuckle':   '极巨拳斗',
    'Max Ooze':      '极巨酸毒',
    'Max Quake':     '极巨大地',
    'Max Airstream': '极巨飞冲',
    'Max Mindstorm': '极巨超能',
    'Max Flutterby': '极巨虫蛊',
    'Max Rockfall':  '极巨岩石',
    'Max Phantasm':  '极巨幽魂',
    'Max Wyrmwind':  '极巨龙骑',
    'Max Darkness':  '极巨恶霸',
    'Max Steelspike':'极巨钢铁',
    'Max Starfall':  '极巨妖精',
    'Max Guard':     '极巨防壁'
};

// ============================================
// 导出到全局 (Export to Window)
// ============================================
if (typeof window !== 'undefined') {
    window.MOVE_CONSTANTS = {
        TRAPPING_MOVES,
        AI_PROTECT_MOVES,
        FORM_SUFFIXES,
        FALLBACK_MOVES,
        GMAX_SPECIES_DATA,
        GENERIC_MAX_BY_TYPE,
        GENERIC_MAX_CN
    };
    
    // 单独导出常用的
    window.TRAPPING_MOVES = TRAPPING_MOVES;
    window.AI_PROTECT_MOVES = AI_PROTECT_MOVES;
    window.FORM_SUFFIXES = FORM_SUFFIXES;
    window.FALLBACK_MOVES = FALLBACK_MOVES;
    window.GMAX_SPECIES_DATA = GMAX_SPECIES_DATA;
    window.GENERIC_MAX_BY_TYPE = GENERIC_MAX_BY_TYPE;
    window.GENERIC_MAX_CN = GENERIC_MAX_CN;
}
