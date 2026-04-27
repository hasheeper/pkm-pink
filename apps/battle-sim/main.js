/**
 * ===========================================
 * MAIN.JS - ES Module 入口文件
 * ===========================================
 * 
 * 聚合所有模块并挂载到 window 以保持向后兼容
 * 
 * 使用方法:
 *   <script type="module" src="./main.js"></script>
 */

// ============================================
// 数据层导入
// ============================================
import { POKEDEX } from './data/pokedex-data.js';
import { MOVES } from './data/moves-data.js';
import {
    TRAPPING_MOVES,
    AI_PROTECT_MOVES,
    FORM_SUFFIXES,
    FALLBACK_MOVES,
    GMAX_SPECIES_DATA,
    GENERIC_MAX_BY_TYPE,
    GENERIC_MAX_CN
} from './data/move-constants.js';
import {
    ITEMS,
    UNSWAPPABLE_ITEMS,
    ItemEffects,
    getItem,
    getItemId,
    getAllPokeballs,
    getAllBerries,
    isChoiceItem,
    isMegaStone,
    isZCrystal,
    isSwappable
} from './engine/items-data.js';
import { TRAINER_GLOBALS } from './data/trainer-data.js';

// ============================================
// 引擎层导入 (Phase 2: 纯函数)
// ============================================
import {
    TYPE_CHART,
    NATURE_MODIFIERS,
    getTypeEffectiveness,
    getPokemonData,
    getMoveData,
    calcStats,
    Pokemon,
    BattleState,
    checkCanMove,
    clearVolatileStatus,
    extractBaseFormId,
    resolveSpriteId,
    getFallbackSpriteId,
    normalizePokemonName
} from './engine/battle-engine.js';

import {
    AbilityHandlers,
    isPinching,
    moveHasFlag,
    checkCanSwitch
} from './engine/ability-handlers.js';

import {
    MoveHandlers,
    getMoveHandler,
    hasMoveHandler,
    canKnockOff
} from './engine/move-handlers.js';

import { calcDamage } from './battle/battle-calc.js';

// ============================================
// 挂载到 window (向后兼容)
// ============================================

// 数据常量
window.POKEDEX = POKEDEX;
window.MOVES = MOVES;
window.Moves = MOVES; // 别名，部分代码使用 window.Moves

// 招式常量
window.TRAPPING_MOVES = TRAPPING_MOVES;
window.AI_PROTECT_MOVES = AI_PROTECT_MOVES;
window.FORM_SUFFIXES = FORM_SUFFIXES;
window.FALLBACK_MOVES = FALLBACK_MOVES;
window.GMAX_SPECIES_DATA = GMAX_SPECIES_DATA;
window.GENERIC_MAX_BY_TYPE = GENERIC_MAX_BY_TYPE;
window.GENERIC_MAX_CN = GENERIC_MAX_CN;
window.MOVE_CONSTANTS = {
    TRAPPING_MOVES,
    AI_PROTECT_MOVES,
    FORM_SUFFIXES,
    FALLBACK_MOVES,
    GMAX_SPECIES_DATA,
    GENERIC_MAX_BY_TYPE,
    GENERIC_MAX_CN
};

// 道具
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

// 训练家数据
window.TRAINER_GLOBALS = TRAINER_GLOBALS;

// ============================================
// 引擎层挂载 (Phase 2)
// ============================================

// 属性克制
window.TYPE_CHART = TYPE_CHART;
window.NATURE_MODIFIERS = NATURE_MODIFIERS;
window.getTypeEffectiveness = getTypeEffectiveness;

// 数据查询
window.getPokemonData = getPokemonData;
window.getMoveData = getMoveData;
window.calcStats = calcStats;
window.Pokemon = Pokemon;

// 精灵图辅助
window.extractBaseFormId = extractBaseFormId;
window.resolveSpriteId = resolveSpriteId;
window.getFallbackSpriteId = getFallbackSpriteId;
window.normalizePokemonName = normalizePokemonName;

// 特性处理器
window.AbilityHandlers = AbilityHandlers;
window.isPinching = isPinching;
window.moveHasFlag = moveHasFlag;
window.checkCanSwitch = checkCanSwitch;

// 招式处理器
window.MoveHandlers = MoveHandlers;
window.getMoveHandler = getMoveHandler;
window.hasMoveHandler = hasMoveHandler;
window.canKnockOff = canKnockOff;

// 伤害计算
window.calcDamage = calcDamage;

// 战斗状态管理 (Phase 3)
window.BattleState = BattleState;
window.checkCanMove = checkCanMove;
window.clearVolatileStatus = clearVolatileStatus;

console.log('[ES Module] 数据层模块加载完成');
console.log('[ES Module] POKEDEX entries:', Object.keys(POKEDEX).length);
console.log('[ES Module] MOVES entries:', Object.keys(MOVES).length);
console.log('[ES Module] ITEMS entries:', Object.keys(ITEMS).length);
