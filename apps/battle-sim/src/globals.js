/**
 * ===========================================
 * GLOBALS.JS - 全局变量挂载
 * ===========================================
 * 
 * 此文件必须最先导入，确保所有全局变量在其他模块使用前已挂载
 */

// ============================================
// 数据层导入
// ============================================
import { POKEDEX } from '../data/pokedex-data.js';
import { MOVES } from '../data/moves-data.js';
import {
    TRAPPING_MOVES,
    AI_PROTECT_MOVES,
    FORM_SUFFIXES,
    FALLBACK_MOVES,
    GMAX_SPECIES_DATA,
    GENERIC_MAX_BY_TYPE,
    GENERIC_MAX_CN
} from '../data/move-constants.js';
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
} from '../engine/items-data.js';

// ============================================
// 引擎层导入
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
} from '../engine/battle-engine.js';

import {
    AbilityHandlers,
    isPinching,
    moveHasFlag,
    checkCanSwitch
} from '../engine/ability-handlers.js';

import {
    MoveHandlers,
    getMoveHandler,
    hasMoveHandler,
    canKnockOff
} from '../engine/move-handlers.js';

import {
    CHARGE_MOVES,
    CHARGE_MOVE_CONFIG,
    getChargeMoveConfig,
    isChargeMove,
    checkInstantCondition,
    handleChargePhase,
    handleReleasePhase,
    checkInvulnerability,
    getChargingMove,
    clearChargingState,
    checkFocusPunchInterrupt,
    checkBeakBlastBurn
} from '../engine/charge-moves.js';

import { calcDamage } from '../battle/battle-calc.js';
import { applyMoveSecondaryEffects } from '../battle/battle-effects.js';
import { applyDamage } from '../battle/battle-damage.js';
import {
    hasAliveSwitch,
    handlePlayerPivot,
    handleEnemyPivot,
    handleEnemyFainted,
    handlePlayerFainted,
    triggerEntryAbilities,
    canPlayerSwitch,
    canEnemySwitch
} from '../battle/battle-switch.js';
import {
    onTurnStart,
    executePlayerTurn,
    executeEnemyTurn,
    enemyTurn,
    getEndTurnStatusLogs
} from '../battle/battle-turns.js';
import {
    getAiAction,
    getExpertAiAction,
    getHardAiMove,
    getNormalAiMove,
    getEasyAiMove,
    getBestRevengeKiller
} from '../engine/ai-engine.js';

// ============================================
// 立即挂载到 window
// ============================================

// 数据常量
window.POKEDEX = POKEDEX;
window.MOVES = MOVES;
window.Moves = MOVES;

// 招式常量
window.TRAPPING_MOVES = TRAPPING_MOVES;
window.AI_PROTECT_MOVES = AI_PROTECT_MOVES;
window.FORM_SUFFIXES = FORM_SUFFIXES;
window.FALLBACK_MOVES = FALLBACK_MOVES;
window.GMAX_SPECIES_DATA = GMAX_SPECIES_DATA;
window.GENERIC_MAX_BY_TYPE = GENERIC_MAX_BY_TYPE;
window.GENERIC_MAX_CN = GENERIC_MAX_CN;

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

// 蓄力技能系统
window.CHARGE_MOVES = CHARGE_MOVES;
window.CHARGE_MOVE_CONFIG = CHARGE_MOVE_CONFIG;
window.getChargeMoveConfig = getChargeMoveConfig;
window.isChargeMove = isChargeMove;
window.checkInstantCondition = checkInstantCondition;
window.handleChargePhase = handleChargePhase;
window.handleReleasePhase = handleReleasePhase;
window.checkInvulnerability = checkInvulnerability;
window.getChargingMove = getChargingMove;
window.clearChargingState = clearChargingState;
window.checkFocusPunchInterrupt = checkFocusPunchInterrupt;
window.checkBeakBlastBurn = checkBeakBlastBurn;

// 伤害计算
window.calcDamage = calcDamage;

// 副作用处理
window.applyMoveSecondaryEffects = applyMoveSecondaryEffects;

// 战斗状态管理
window.BattleState = BattleState;
window.checkCanMove = checkCanMove;
window.clearVolatileStatus = clearVolatileStatus;

// 伤害应用
window.applyDamage = applyDamage;

// 换人系统
window.hasAliveSwitch = hasAliveSwitch;
window.handlePlayerPivot = handlePlayerPivot;
window.handleEnemyPivot = handleEnemyPivot;
window.handleEnemyFainted = handleEnemyFainted;
window.handlePlayerFainted = handlePlayerFainted;
window.triggerEntryAbilities = triggerEntryAbilities;
window.canPlayerSwitch = canPlayerSwitch;
window.canEnemySwitch = canEnemySwitch;

// 回合系统
window.onTurnStart = onTurnStart;
window.executePlayerTurn = executePlayerTurn;
window.executeEnemyTurn = executeEnemyTurn;
window.enemyTurn = enemyTurn;
window.getEndTurnStatusLogs = getEndTurnStatusLogs;

// AI 系统
window.getAiAction = getAiAction;
window.getExpertAiAction = getExpertAiAction;
window.getHardAiMove = getHardAiMove;
window.getNormalAiMove = getNormalAiMove;
window.getEasyAiMove = getEasyAiMove;
window.getBestRevengeKiller = getBestRevengeKiller;

console.log('[Vite] 核心全局变量已挂载');
console.log('[Vite] POKEDEX entries:', Object.keys(POKEDEX).length);
console.log('[Vite] MOVES entries:', Object.keys(MOVES).length);
console.log('[Vite] ITEMS entries:', Object.keys(ITEMS).length);
