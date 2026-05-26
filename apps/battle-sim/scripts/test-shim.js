/**
 * 最小 window shim — 必须作为第一个 import 加载
 * ES module 的 import 按声明顺序依次求值，
 * 所以只要 import './test-shim.js' 放在最前面即可。
 */
globalThis.window = globalThis.window || {};
const w = globalThis.window;
w.battle = w.battle || null;
w.WeatherEffects = w.WeatherEffects || undefined;
w.envOverlay = w.envOverlay || undefined;
w.BattleVFX = w.BattleVFX || undefined;
w.playSFX = w.playSFX || undefined;
w.calcDamage = w.calcDamage || null;
w.TYPE_CHART = w.TYPE_CHART || null;
w.MOVES = w.MOVES || null;
w.MoveHandlers = w.MoveHandlers || null;
w.getMoveHandler = w.getMoveHandler || null;
w.hasMoveHandler = w.hasMoveHandler || null;
w.getTypeEffectiveness = w.getTypeEffectiveness || null;
w.resolveSpriteId = w.resolveSpriteId || (() => '');
w.extractBaseFormId = w.extractBaseFormId || ((n) => n);
w.getFallbackSpriteId = w.getFallbackSpriteId || (() => '');
w.checkCanMove = w.checkCanMove || (() => ({ canMove: true }));
w.getItem = w.getItem || (() => null);

export default 'shim-loaded';
