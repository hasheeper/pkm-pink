#!/usr/bin/env node
/**
 * =============================================
 * 方案 B：Node.js 模拟战斗测试
 * =============================================
 * 
 * 用法: node scripts/battle-test.js
 * 
 * 直接 import 核心战斗模块，构造 mock Pokemon 对象，
 * 测试伤害计算、副作用、handler 等逻辑是否正确运行。
 * 
 * 不依赖 window/DOM，不启动前端。
 */

// 0. Window shim 必须作为第一个 import（ES module import 按声明顺序求值）
import './test-shim.js';

import { MOVES } from '../data/moves-data.js';
import { MoveHandlers, getMoveHandler, hasMoveHandler } from '../engine/move-handlers.js';
import { getTypeEffectiveness, TYPE_CHART } from '../engine/battle-engine.js';
import { calcDamage } from '../battle/battle-calc.js';
import { applyMoveSecondaryEffects } from '../battle/battle-effects.js';

// ============================================
// 1. 注入全局变量（模拟浏览器环境中的 window.XXX）
// ============================================
globalThis.MOVES = MOVES;
globalThis.MoveHandlers = MoveHandlers;
globalThis.getMoveHandler = getMoveHandler;
globalThis.hasMoveHandler = hasMoveHandler;
globalThis.AbilityHandlers = {};
globalThis.getTypeEffectiveness = getTypeEffectiveness;
globalThis.TYPE_CHART = TYPE_CHART;
// 同步到 window shim
globalThis.window.MOVES = MOVES;
globalThis.window.MoveHandlers = MoveHandlers;
globalThis.window.getMoveHandler = getMoveHandler;
globalThis.window.calcDamage = calcDamage;

// ============================================
// 2. Mock Pokemon 工厂
// ============================================
function createMockPokemon(overrides = {}) {
    const defaults = {
        name: 'TestMon',
        cnName: '测试宝可梦',
        level: 50,
        types: ['Normal'],
        ability: '',
        item: null,
        status: null,
        statusTurns: 0,
        sleepTurns: 0,
        currHp: 200,
        maxHp: 200,
        atk: 100, def: 100, spa: 100, spd: 100, spe: 100,
        boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 },
        volatile: {},
        moves: [],
        isTerastallized: false,
        teraType: null,
        turnData: {},
        lastMoveUsed: null,
        lastMoveFailed: false,
        // Methods
        getStat(stat) { return this[stat] || 100; },
        isAlive() { return this.currHp > 0; },
        takeDamage(dmg) {
            this.currHp = Math.max(0, this.currHp - dmg);
            return dmg;
        },
        heal(amount) {
            const maxHeal = this.maxHp - this.currHp;
            const actual = Math.min(amount, maxHeal);
            this.currHp += actual;
            return actual;
        },
        applyBoost(stat, amount) {
            this.boosts = this.boosts || {};
            const old = this.boosts[stat] || 0;
            this.boosts[stat] = Math.max(-6, Math.min(6, old + amount));
            return this.boosts[stat] - old;
        },
    };
    const merged = { ...defaults, ...overrides };
    // 同步 stats 子对象（部分 handler 用 pokemon.stats.def 而非 pokemon.def）
    merged.stats = merged.stats || { 
        hp: merged.maxHp, atk: merged.atk, def: merged.def, 
        spa: merged.spa, spd: merged.spd, spe: merged.spe,
    };
    return merged;
}

// ============================================
// 3. Mock Battle 对象
// ============================================
function createMockBattle(overrides = {}) {
    const mockSide = { stealthrock: false, spikes: 0, toxicspikes: 0, stickyweb: false, reflect: 0, lightscreen: 0, auroraveil: 0, tailwind: 0, gmaxVineLash: 0, gmaxWildfire: 0, gmaxCannonade: 0, gmaxVolcalith: 0, gmaxSteelsurge: false, gmaxResonance: 0 };
    const battle = {
        weather: null,
        terrain: null,
        playerSide: { ...mockSide },
        enemySide: { ...mockSide },
        playerParty: [],
        enemyParty: [],
        lastMoveUsed: null,
        getPlayer() { return createMockPokemon(); },
        getEnemy() { return createMockPokemon(); },
        getPlayerSide() { return battle.playerSide; },
        getEnemySide() { return battle.enemySide; },
        addLog(msg) {},
        ...overrides,
    };
    return battle;
}

// ============================================
// 4. 测试框架
// ============================================
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];
const crashedMoves = [];

function assert(condition, testName, detail = '') {
    totalTests++;
    if (condition) {
        passedTests++;
    } else {
        failedTests++;
        failures.push({ testName, detail });
    }
}

// ============================================
// 5. 全量测试套件
// ============================================

// ── Layer 1: Smoke Test ──
// 对每个标准攻击技调用 calcDamage，验证：
//   a) 不崩溃（不抛异常）
//   b) 返回对象包含 damage (number) 和 effectiveness (number)
//   c) 攻击技 power>0 且非免疫时 damage > 0
function layer1_smokeTestAllMoves() {
    const allTypes = ['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison',
        'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];
    
    // 为每种属性准备一个防御方（避免免疫导致误判）
    const neutralDefender = createMockPokemon({ name: 'Blissey', cnName: '幸福蛋', types: ['Normal'], def: 100, spd: 100 });
    
    let tested = 0, crashed = 0, wrongShape = 0, zeroDamage = 0;
    const zeroDamageList = [];
    
    for (const [id, moveData] of Object.entries(MOVES)) {
        if (moveData.isNonstandard) continue;
        const cat = (moveData.category || '').toLowerCase();
        if (cat !== 'physical' && cat !== 'special') continue;
        if (!moveData.basePower && !('basePowerCallback' in moveData)) continue;
        
        tested++;
        const moveType = moveData.type || 'Normal';
        
        // 选择不免疫的防御方属性
        let defTypes = ['Water']; // 默认
        // 避免免疫：Normal→Ghost, Fighting→Ghost, Ground→Flying, Electric→Ground, Poison→Steel, Ghost→Normal, Dragon→Fairy, Psychic→Dark
        const immuneMap = { 'Normal': 'Ghost', 'Fighting': 'Ghost', 'Ground': 'Flying', 'Electric': 'Ground', 'Poison': 'Steel', 'Ghost': 'Normal', 'Dragon': 'Fairy', 'Psychic': 'Dark' };
        const immuneType = immuneMap[moveType];
        if (immuneType && defTypes.includes(immuneType)) {
            defTypes = ['Fire'];
        }
        // 确保防御方不免疫攻击属性
        const eff = getTypeEffectiveness(moveType, defTypes, moveData.name);
        if (eff === 0) defTypes = ['Fire'];
        
        const attacker = createMockPokemon({ 
            name: 'Attacker', cnName: '攻击方', 
            types: [moveType], atk: 150, spa: 150,
            currHp: 200, maxHp: 200,
            turnData: { lastDamageTaken: { amount: 50 } },
            lastMoveFailed: true,
            lastMoveUsed: moveData.name,
        });
        const defender = createMockPokemon({ 
            name: 'Defender', cnName: '防御方', 
            types: defTypes, def: 100, spd: 100,
            currHp: 200, maxHp: 200,
            status: 'brn',
            turnData: { damageTakenThisTurn: 50 },
        });
        
        const move = { 
            name: moveData.name, 
            power: moveData.basePower || 0, 
            type: moveType, 
            cat: cat === 'physical' ? 'phys' : 'spec', 
            accuracy: moveData.accuracy === true ? 100 : (moveData.accuracy || 100),
        };
        
        try {
            const result = calcDamage(attacker, defender, move);
            
            // 结构检查
            if (!result || typeof result.damage !== 'number') {
                wrongShape++;
                assert(false, `L1 结构: ${moveData.name}`, `返回值缺少 damage 字段`);
                continue;
            }
            
            assert(typeof result.damage === 'number', `L1 结构: ${moveData.name}`);
            
            // 伤害检查（power>0 的攻击技应该造成伤害，除非是固定伤害技返回了0）
            if (moveData.basePower > 0 && result.damage === 0 && result.effectiveness !== 0) {
                zeroDamage++;
                zeroDamageList.push(moveData.name);
                assert(false, `L1 伤害: ${moveData.name}`, `power=${moveData.basePower} 但 damage=0, eff=${result.effectiveness}`);
            }
        } catch (e) {
            crashed++;
            crashedMoves.push({ name: moveData.name, error: e.message });
            assert(false, `L1 崩溃: ${moveData.name}`, e.message.substring(0, 80));
        }
    }
    
    return { tested, crashed, wrongShape, zeroDamage, zeroDamageList };
}

// ── Layer 2: Handler 完整性 ──
// 对每个有 MoveHandler 的招式，调用其所有钩子，验证不崩溃
function layer2_handlerIntegrity() {
    let tested = 0, crashed = 0;
    const hookNames = ['basePowerCallback', 'damageCallback', 'onHit', 'onUse', 'onMiss', 'onAfterHit', 'onAfterMove', 'onModifyType'];
    
    for (const [name, handler] of Object.entries(MoveHandlers)) {
        tested++;
        const user = createMockPokemon({ 
            name: 'User', cnName: '使用者', types: ['Normal'], 
            currHp: 200, maxHp: 200, ability: 'Levitate',
            item: null, usedBerry: 'Sitrus Berry',
            status: 'brn', volatile: {},
            moves: [{ name: 'Tackle', cn: '撞击', pp: 15 }],
            lastMove: 'Tackle', lastMoveUsed: 'Tackle',
            lastMoveFailed: false,
            turnData: { lastDamageTaken: { amount: 50 } },
        });
        const target = createMockPokemon({ 
            name: 'Target', cnName: '目标', types: ['Water'],
            currHp: 200, maxHp: 200, ability: 'Intimidate',
            status: 'brn', volatile: {},
            moves: [{ name: 'Surf', cn: '冲浪', pp: 15 }],
            lastMove: 'Surf', lastMoveUsed: 'Surf',
            turnData: { damageTakenThisTurn: 50 },
        });
        const logs = [];
        const battle = createMockBattle();
        
        for (const hook of hookNames) {
            if (typeof handler[hook] !== 'function') continue;
            try {
                const moveObj = { name, type: 'Normal', power: 80, cat: 'phys' };
                if (hook === 'basePowerCallback') {
                    handler[hook](user, target, moveObj, battle);
                } else if (hook === 'damageCallback') {
                    handler[hook](user, target, moveObj, battle);
                } else if (hook === 'onHit') {
                    handler[hook](user, target, 50, logs, battle, true);
                } else if (hook === 'onUse') {
                    handler[hook](user, target, logs, battle, true);
                } else if (hook === 'onMiss') {
                    handler[hook](user, target, logs, battle);
                } else if (hook === 'onAfterHit') {
                    handler[hook](user, target, 50, logs, battle);
                } else if (hook === 'onAfterMove') {
                    handler[hook](user, target, moveObj, logs, battle);
                } else if (hook === 'onModifyType') {
                    handler[hook](moveObj, user, battle);
                }
                assert(true, `L2 ${name}.${hook}`);
            } catch (e) {
                crashed++;
                assert(false, `L2 崩溃: ${name}.${hook}`, e.message.substring(0, 80));
            }
        }
    }
    
    return { tested, crashed };
}

// ── Layer 3: 语义正确性 ──
// 3a. 属性克制表完整性
// 3b. basePowerCallback 返回合理数值
// 3c. secondary 结构完整性
// 3d. drain/recoil 数值合理性
// 3e. applyMoveSecondaryEffects 不崩溃
function layer3_semanticCorrectness() {
    let results = { typeChart: 0, callbacks: 0, secondaries: 0, effects: 0 };
    
    // 3a. 属性克制表 — 验证所有 18x18 组合
    const allTypes = ['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison',
        'Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];
    
    const knownImmunities = [
        ['Normal', 'Ghost'], ['Fighting', 'Ghost'], ['Poison', 'Steel'],
        ['Ground', 'Flying'], ['Ghost', 'Normal'], ['Electric', 'Ground'],
        ['Psychic', 'Dark'], ['Dragon', 'Fairy'],
    ];
    
    for (const [atk, def] of knownImmunities) {
        const eff = getTypeEffectiveness(atk, [def]);
        assert(eff === 0, `L3a 免疫: ${atk}→${def}`, `got ${eff}`);
        results.typeChart++;
    }
    
    const knownSuperEffective = [
        ['Fire', 'Grass', 2], ['Water', 'Fire', 2], ['Electric', 'Water', 2],
        ['Grass', 'Water', 2], ['Ice', 'Dragon', 2], ['Fighting', 'Normal', 2],
        ['Ground', 'Electric', 2], ['Flying', 'Fighting', 2], ['Psychic', 'Fighting', 2],
        ['Bug', 'Psychic', 2], ['Rock', 'Fire', 2], ['Ghost', 'Ghost', 2],
        ['Dragon', 'Dragon', 2], ['Dark', 'Psychic', 2], ['Steel', 'Fairy', 2],
        ['Fairy', 'Dragon', 2], ['Fire', 'Ice', 2], ['Ice', 'Grass', 2],
    ];
    
    for (const [atk, def, expected] of knownSuperEffective) {
        const eff = getTypeEffectiveness(atk, [def]);
        assert(eff === expected, `L3a 克制: ${atk}→${def}=${expected}`, `got ${eff}`);
        results.typeChart++;
    }
    
    // 双属性克制
    const eff4x = getTypeEffectiveness('Ice', ['Dragon', 'Flying']);
    assert(eff4x === 4, 'L3a 4x: Ice→Dragon/Flying', `got ${eff4x}`);
    results.typeChart++;
    
    // 3b. basePowerCallback 返回合理数值
    const callbackTests = {
        'Eruption': { user: { currHp: 200, maxHp: 200 }, expected: 150 },
        'Water Spout': { user: { currHp: 200, maxHp: 200 }, expected: 150 },
        'Dragon Energy': { user: { currHp: 200, maxHp: 200 }, expected: 150 },
        'Eruption_half': { moveName: 'Eruption', user: { currHp: 100, maxHp: 200 }, expected: 75 },
        'Flail': { user: { currHp: 1, maxHp: 200 }, expectedMin: 100 },
        'Reversal': { user: { currHp: 1, maxHp: 200 }, expectedMin: 100 },
        'Hex': { target: { status: 'brn' }, expected: 130 },
        'Hex_clean': { moveName: 'Hex', target: {}, expected: 65 },
        'Infernal Parade': { target: { status: 'brn' }, expected: 120 },
        'Infernal Parade_clean': { moveName: 'Infernal Parade', target: {}, expected: 60 },
        'Facade': { user: { status: 'brn' }, expected: 140 },
        'Facade_clean': { moveName: 'Facade', user: {}, expected: 70 },
        'Avalanche': { user: { turnData: { lastDamageTaken: { amount: 50 } } }, expected: 120 },
        'Avalanche_clean': { moveName: 'Avalanche', user: {}, expected: 60 },
        'Stomping Tantrum': { user: { lastMoveFailed: true }, expected: 150 },
        'Stomping Tantrum_clean': { moveName: 'Stomping Tantrum', user: { lastMoveFailed: false }, expected: 75 },
        'Temper Flare': { user: { lastMoveFailed: true }, expected: 150 },
        'Temper Flare_clean': { moveName: 'Temper Flare', user: { lastMoveFailed: false }, expected: 75 },
        'Acrobatics': { user: { item: null }, expected: 110 },
        'Acrobatics_item': { moveName: 'Acrobatics', user: { item: 'Leftovers' }, expected: 55 },
    };
    
    for (const [testKey, config] of Object.entries(callbackTests)) {
        const moveName = config.moveName || testKey;
        const handler = getMoveHandler(moveName);
        if (!handler || !handler.basePowerCallback) {
            assert(false, `L3b callback存在: ${moveName}`, 'handler或basePowerCallback不存在');
            continue;
        }
        const user = createMockPokemon(config.user || {});
        const target = createMockPokemon(config.target || {});
        try {
            const power = handler.basePowerCallback(user, target, { name: moveName }, null);
            if (config.expected !== undefined) {
                assert(power === config.expected, `L3b ${testKey}=${config.expected}`, `got ${power}`);
            } else if (config.expectedMin !== undefined) {
                assert(power >= config.expectedMin, `L3b ${testKey}>=${config.expectedMin}`, `got ${power}`);
            }
            results.callbacks++;
        } catch (e) {
            assert(false, `L3b 崩溃: ${testKey}`, e.message.substring(0, 60));
        }
    }
    
    // 3c. secondary 结构完整性 — 每个有 secondary 的招式在 MOVES 中数据合法
    for (const [id, m] of Object.entries(MOVES)) {
        if (m.isNonstandard) continue;
        if (!m.secondary) continue;
        const sec = m.secondary;
        if (sec.chance !== undefined) {
            assert(typeof sec.chance === 'number' && sec.chance > 0 && sec.chance <= 100,
                `L3c secondary.chance: ${m.name}`, `chance=${sec.chance}`);
        }
        if (sec.status) {
            assert(['brn','par','psn','tox','slp','frz'].includes(sec.status),
                `L3c secondary.status: ${m.name}`, `status=${sec.status}`);
        }
        if (sec.boosts) {
            const validStats = ['atk','def','spa','spd','spe','accuracy','evasion'];
            for (const k of Object.keys(sec.boosts)) {
                assert(validStats.includes(k), `L3c secondary.boosts key: ${m.name}`, `key=${k}`);
            }
        }
        results.secondaries++;
    }
    
    // 3d. drain/recoil 数值合理
    for (const [id, m] of Object.entries(MOVES)) {
        if (m.isNonstandard) continue;
        if (m.drain) {
            assert(Array.isArray(m.drain) && m.drain.length === 2, `L3d drain格式: ${m.name}`, `drain=${JSON.stringify(m.drain)}`);
            assert(m.drain[0] > 0 && m.drain[1] > 0, `L3d drain正数: ${m.name}`);
        }
        if (m.recoil) {
            assert(Array.isArray(m.recoil) && m.recoil.length === 2, `L3d recoil格式: ${m.name}`, `recoil=${JSON.stringify(m.recoil)}`);
        }
    }
    
    // 3e. applyMoveSecondaryEffects 全量 smoke test
    let effectsCrashed = 0;
    let effectsTested = 0;
    for (const [id, moveData] of Object.entries(MOVES)) {
        if (moveData.isNonstandard) continue;
        const cat = (moveData.category || '').toLowerCase();
        effectsTested++;
        
        const user = createMockPokemon({ currHp: 100, maxHp: 200 });
        const target = createMockPokemon({ currHp: 200, maxHp: 200 });
        const move = { name: moveData.name, type: moveData.type || 'Normal', cat: cat === 'physical' ? 'phys' : (cat === 'special' ? 'spec' : 'status') };
        const battle = createMockBattle();
        
        try {
            applyMoveSecondaryEffects(user, target, move, 50, battle, true);
            // 不崩溃即通过
        } catch (e) {
            effectsCrashed++;
            assert(false, `L3e 副作用崩溃: ${moveData.name}`, e.message.substring(0, 80));
        }
    }
    assert(effectsCrashed === 0, `L3e 副作用全量smoke (${effectsTested}个)`, `${effectsCrashed}个崩溃`);
    results.effects = effectsTested;
    
    return results;
}

// ── Layer 4: 数值校验 ──
// 手算伤害公式对比（Showdown 公式）
// damage = ((2*level/5+2) * power * A/D) / 50 + 2) * STAB * typeEff * random(0.85~1.0)
function layer4_numericalSpotCheck() {
    let checked = 0;
    
    // 标准公式: ((2*50/5+2) * power * atk/def) / 50 + 2) * modifiers
    // level=50: (22 * power * A/D) / 50 + 2
    function expectedDamageRange(power, atk, def, stab, typeEff) {
        const base = Math.floor((Math.floor(22 * power * atk / def) / 50) + 2);
        const modified = Math.floor(base * stab * typeEff);
        return { min: Math.floor(modified * 0.85), max: modified };
    }
    
    const spotChecks = [
        // [name, power, atkStat, defStat, atkTypes, defTypes, moveType, cat, expectedStab, expectedEff]
        { desc: 'Thunderbolt (STAB, neutral)', power: 90, atk: 130, def: 100, atkTypes: ['Electric'], defTypes: ['Water'], moveType: 'Electric', cat: 'spec', stab: 1.5, eff: 2 },
        { desc: 'Earthquake (STAB, neutral)', power: 100, atk: 130, def: 100, atkTypes: ['Ground'], defTypes: ['Fire'], moveType: 'Ground', cat: 'phys', stab: 1.5, eff: 2 },
        { desc: 'Ice Beam (no STAB, 2x)', power: 90, atk: 100, def: 100, atkTypes: ['Water'], defTypes: ['Dragon'], moveType: 'Ice', cat: 'spec', stab: 1, eff: 2 },
        { desc: 'Tackle (STAB, neutral)', power: 40, atk: 100, def: 100, atkTypes: ['Normal'], defTypes: ['Water'], moveType: 'Normal', cat: 'phys', stab: 1.5, eff: 1 },
        { desc: 'Flamethrower (STAB, 4x)', power: 90, atk: 150, def: 80, atkTypes: ['Fire'], defTypes: ['Grass', 'Bug'], moveType: 'Fire', cat: 'spec', stab: 1.5, eff: 4 },
    ];
    
    for (const sc of spotChecks) {
        // 多次采样取中位数，消除暴击和随机数噪音
        const samples = [];
        const RUNS = 30;
        let lastEff = null;
        
        for (let i = 0; i < RUNS; i++) {
            const attacker = createMockPokemon({ 
                types: sc.atkTypes, 
                atk: sc.cat === 'phys' ? sc.atk : 100, 
                spa: sc.cat === 'spec' ? sc.atk : 100,
            });
            const defender = createMockPokemon({ 
                types: sc.defTypes, 
                def: sc.cat === 'phys' ? sc.def : 100, 
                spd: sc.cat === 'spec' ? sc.def : 100,
            });
            const move = { name: 'TestMove', power: sc.power, type: sc.moveType, cat: sc.cat === 'phys' ? 'phys' : 'spec', accuracy: 100 };
            const result = calcDamage(attacker, defender, move);
            samples.push(result.damage);
            lastEff = result.effectiveness;
        }
        
        samples.sort((a, b) => a - b);
        // 取 Q1 (25th percentile) 作为"非暴击"代表值
        const q1 = samples[Math.floor(RUNS * 0.25)];
        const range = expectedDamageRange(sc.power, sc.atk, sc.def, sc.stab, sc.eff);
        
        // 非暴击伤害应落在公式范围 ±15% 内
        const tolerance = Math.max(range.max * 0.15, 3);
        const inRange = q1 >= range.min - tolerance && q1 <= range.max + tolerance;
        assert(inRange, `L4 数值: ${sc.desc}`, `Q1=${q1}, expected=[${range.min}~${range.max}]±${Math.round(tolerance)}, min=${samples[0]}, max=${samples[RUNS-1]}`);
        
        // 克制倍率检查（确定性）
        assert(lastEff === sc.eff, `L4 克制: ${sc.desc}`, `eff=${lastEff}, expected=${sc.eff}`);
        checked++;
    }
    
    return { checked };
}

// ── Layer 5: 特殊招式回归 ──
function layer5_specialMoveRegression() {
    const originalRandom = Math.random;
    let checked = 0;

    try {
        Math.random = () => 0;
        const ohkoAttacker = createMockPokemon({ level: 80, currHp: 220, maxHp: 220 });
        const ohkoDefender = createMockPokemon({ level: 50, currHp: 187, maxHp: 187 });
        const pollutedSheerCold = {
            name: 'Sheer Cold',
            power: 80,
            type: 'Ice',
            cat: 'spec',
            accuracy: 30,
        };

        const hitResult = calcDamage(ohkoAttacker, ohkoDefender, pollutedSheerCold);
        assert(hitResult.ohko === true, 'L5 OHKO: Sheer Cold 命中标记', JSON.stringify(hitResult));
        assert(hitResult.damage === 187, 'L5 OHKO: Sheer Cold 直接击倒', `damage=${hitResult.damage}`);
        checked += 2;

        Math.random = () => 0.99;
        const missResult = calcDamage(ohkoAttacker, ohkoDefender, pollutedSheerCold);
        assert(missResult.miss === true && missResult.damage === 0, 'L5 OHKO: Sheer Cold 未命中', JSON.stringify(missResult));
        checked += 1;

        Math.random = () => 0;
        const underleveledAttacker = createMockPokemon({ level: 40 });
        const highLevelDefender = createMockPokemon({ level: 50, currHp: 150, maxHp: 150 });
        const failResult = calcDamage(underleveledAttacker, highLevelDefender, pollutedSheerCold);
        assert(failResult.failed === true && /等级太高/.test(failResult.failMessage || ''), 'L5 OHKO: 等级限制', JSON.stringify(failResult));
        checked += 1;

        const fissureVsFlying = calcDamage(
            createMockPokemon({ level: 80 }),
            createMockPokemon({ types: ['Flying'], currHp: 160, maxHp: 160 }),
            { name: 'Fissure', power: 80, type: 'Ground', cat: 'phys', accuracy: 30 }
        );
        assert(fissureVsFlying.effectiveness === 0 && fissureVsFlying.damage === 0, 'L5 OHKO: 地裂打不到飞行', JSON.stringify(fissureVsFlying));
        checked += 1;

        const guillotineVsGhost = calcDamage(
            createMockPokemon({ level: 80 }),
            createMockPokemon({ types: ['Ghost'], currHp: 160, maxHp: 160 }),
            { name: 'Guillotine', power: 80, type: 'Normal', cat: 'phys', accuracy: 30 }
        );
        assert(guillotineVsGhost.effectiveness === 0 && guillotineVsGhost.damage === 0, 'L5 OHKO: 断头台打不到幽灵', JSON.stringify(guillotineVsGhost));
        checked += 1;

        const hornDrillVsGhost = calcDamage(
            createMockPokemon({ level: 80 }),
            createMockPokemon({ types: ['Ghost'], currHp: 160, maxHp: 160 }),
            { name: 'Horn Drill', power: 80, type: 'Normal', cat: 'phys', accuracy: 30 }
        );
        assert(hornDrillVsGhost.effectiveness === 0 && hornDrillVsGhost.damage === 0, 'L5 OHKO: 角钻打不到幽灵', JSON.stringify(hornDrillVsGhost));
        checked += 1;

        const sheerColdVsIce = calcDamage(
            createMockPokemon({ level: 80 }),
            createMockPokemon({ types: ['Ice'], currHp: 160, maxHp: 160 }),
            pollutedSheerCold
        );
        assert(sheerColdVsIce.effectiveness === 0 && sheerColdVsIce.damage === 0, 'L5 OHKO: 绝对零度打不到冰', JSON.stringify(sheerColdVsIce));
        checked += 1;
    } finally {
        Math.random = originalRandom;
    }

    return { checked };
}

// ============================================
// 6. 运行所有测试
// ============================================
function main() {
    console.log('========================================');
    console.log('  PKM12 全量战斗测试 (方案 B v2)');
    console.log('========================================');
    
    // 抑制 console.log/warn 噪音
    const origLog = console.log;
    const origWarn = console.warn;
    let testOutput = [];
    console.log = (...args) => testOutput.push(args.join(' '));
    console.warn = (...args) => testOutput.push('[WARN] ' + args.join(' '));
    
    let l1, l2, l3, l4, l5;
    try {
        origLog('\n── Layer 1: 全量 Smoke Test (calcDamage) ──');
        l1 = layer1_smokeTestAllMoves();
        origLog(`   测试 ${l1.tested} 个攻击技: 崩溃=${l1.crashed}, 结构错误=${l1.wrongShape}, 零伤害=${l1.zeroDamage}`);
        if (l1.zeroDamageList.length > 0 && l1.zeroDamageList.length <= 20) {
            origLog(`   零伤害招式: ${l1.zeroDamageList.join(', ')}`);
        }
        
        origLog(`\n── Layer 2: Handler 完整性 (${Object.keys(MoveHandlers).length} handlers) ──`);
        l2 = layer2_handlerIntegrity();
        origLog(`   测试 ${l2.tested} 个 handler: 崩溃=${l2.crashed}`);
        
        origLog('\n── Layer 3: 语义正确性 ──');
        l3 = layer3_semanticCorrectness();
        origLog(`   属性克制: ${l3.typeChart} 组合, callback: ${l3.callbacks} 个, secondary: ${l3.secondaries} 个, 副作用smoke: ${l3.effects} 个`);
        
        origLog('\n── Layer 4: 数值校验 ──');
        l4 = layer4_numericalSpotCheck();
        origLog(`   精确校验: ${l4.checked} 个招式`);

        origLog('\n── Layer 5: 特殊招式回归 ──');
        l5 = layer5_specialMoveRegression();
        origLog(`   回归校验: ${l5.checked} 项`);
    } finally {
        console.log = origLog;
        console.warn = origWarn;
    }
    
    // 输出结果
    console.log('\n========================================');
    console.log('  测试结果');
    console.log('========================================');
    console.log(`   ✅ 通过: ${passedTests}`);
    console.log(`   ❌ 失败: ${failedTests}`);
    console.log(`   📊 总计: ${totalTests}`);
    console.log(`   通过率: ${(passedTests / totalTests * 100).toFixed(1)}%`);
    
    if (failures.length > 0) {
        console.log(`\n── 失败详情 (${failures.length}个) ──`);
        // 按 Layer 分组
        const byLayer = {};
        for (const f of failures) {
            const layer = f.testName.match(/^L(\d)/)?.[1] || '?';
            if (!byLayer[layer]) byLayer[layer] = [];
            byLayer[layer].push(f);
        }
        for (const [layer, items] of Object.entries(byLayer)) {
            console.log(`\n   Layer ${layer}: ${items.length} 个失败`);
            const shown = items.slice(0, 15);
            for (const f of shown) {
                console.log(`   ❌ ${f.testName}${f.detail ? ' — ' + f.detail : ''}`);
            }
            if (items.length > 15) {
                console.log(`   ... 还有 ${items.length - 15} 个`);
            }
        }
    }
    
    if (crashedMoves.length > 0) {
        console.log(`\n── 崩溃招式 (${crashedMoves.length}个) ──`);
        for (const c of crashedMoves.slice(0, 20)) {
            console.log(`   💥 ${c.name}: ${c.error}`);
        }
    }
    
    console.log('\n========================================');
    console.log(failedTests === 0 ? '  ✅ 全部通过!' : `  ⚠️  ${failedTests} 个测试失败 (共 ${totalTests} 个)`);
    console.log('========================================');
    
    process.exit(failedTests > 0 ? 1 : 0);
}

main();
