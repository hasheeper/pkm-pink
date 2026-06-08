#!/usr/bin/env node
/**
 * Flow regression tests for turn execution, switching, and AI action shape.
 *
 * These tests intentionally use small mocks instead of booting the browser UI.
 */
import './test-shim.js';

import { MOVES } from '../data/moves-data.js';
import { MoveHandlers, getMoveHandler, hasMoveHandler } from '../engine/move-handlers.js';
import { applyMoveSecondaryEffects } from '../battle/battle-effects.js';
import { enemyTurn, getEndTurnStatusLogs } from '../battle/battle-turns.js';
import { hasAliveSwitch, canPlayerSwitch, canEnemySwitch } from '../battle/battle-switch.js';
import { getAiAction } from '../engine/ai-engine.js';
import PPSystem from '../systems/pp-system.js';

const originalConsoleLog = console.log.bind(console);
const verbose = process.argv.includes('--verbose') || process.env.PKM_FLOW_TEST_VERBOSE === '1';
console.log = (...args) => {
    if (verbose) originalConsoleLog(...args);
};

globalThis.MOVES = MOVES;
globalThis.MoveHandlers = MoveHandlers;
globalThis.getMoveHandler = getMoveHandler;
globalThis.hasMoveHandler = hasMoveHandler;
globalThis.AbilityHandlers = {};
globalThis.TYPE_CHART = {};
globalThis.battle = null;
globalThis.applyDamage = (attacker, defender, move) => {
    attacker.lastAppliedMove = move.name;
    const damage = move.name === 'Struggle' ? 25 : Math.max(0, move.power ?? move.basePower ?? 0);
    if (damage > 0 && typeof defender.takeDamage === 'function') {
        defender.takeDamage(damage);
    }
    return { damage, effectiveness: 1 };
};

const testPPSystem = {
    ...PPSystem,
    deductPP(pokemon, move, target) {
        pokemon.lastDeductedMove = move.name;
        return PPSystem.deductPP(pokemon, move, target);
    },
};

Object.assign(globalThis.window, {
    MOVES,
    MoveHandlers,
    getMoveHandler,
    hasMoveHandler,
    log: () => {},
    playSFX: () => {},
    updateAllVisuals: () => {},
    renderSwitchMenu: () => {},
    triggerEntryAbilities: () => {},
    markEnemySwitch: () => {},
    checkCanMove: () => ({ can: true }),
    checkCanSwitch: () => ({ canSwitch: true }),
    getTypeEffectiveness: (type, defenderTypes) => {
        const types = Array.isArray(defenderTypes) ? defenderTypes : [defenderTypes];
        if (type === 'Electric' && types.includes('Ground')) return 0;
        if (type === 'Ground' && types.includes('Electric')) return 2;
        if (type === 'Water' && types.includes('Fire')) return 2;
        return 1;
    },
    calcDamage: (attacker, defender, move) => {
        const category = String(move.cat || move.category || '').toLowerCase();
        if (category === 'status' || move.power === 0 || move.basePower === 0) {
            return { damage: 0, effectiveness: 1 };
        }
        const type = move.type || 'Normal';
        const types = defender.types || ['Normal'];
        if (type === 'Electric' && types.includes('Ground')) {
            return { damage: 0, effectiveness: 0 };
        }
        const power = move.power ?? move.basePower ?? 50;
        return { damage: Math.max(1, Math.floor(power)), effectiveness: type === 'Ground' && types.includes('Electric') ? 2 : 1 };
    },
    applyDamage: globalThis.applyDamage,
    WeatherEffects: {
        getWeatherDamage: () => 6,
        getWeatherDamageLog: (poke, weather, damage) => `${poke.cnName} 受到${weather}的伤害! (-${damage})`,
        getAVSMultiplier: () => 1,
    },
    PPSystem: testPPSystem,
});

let totalTests = 0;
let passedTests = 0;
const failures = [];

function assert(condition, testName, detail = '') {
    totalTests++;
    if (condition) {
        passedTests++;
    } else {
        failures.push({ testName, detail });
    }
}

function assertEqual(actual, expected, testName) {
    assert(actual === expected, testName, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertArrayIncludes(array, predicate, testName, detail = '') {
    assert(Array.isArray(array) && array.some(predicate), testName, detail || `array did not contain expected entry: ${JSON.stringify(array)}`);
}

function createMove(overrides = {}) {
    return {
        name: 'Tackle',
        cn: '撞击',
        power: 40,
        basePower: 40,
        type: 'Normal',
        cat: 'phys',
        pp: 35,
        maxPp: 35,
        ...overrides,
    };
}

function createMockPokemon(overrides = {}) {
    const pokemon = {
        name: 'Testmon',
        cnName: '测试兽',
        level: 50,
        types: ['Normal'],
        ability: '',
        item: null,
        status: null,
        statusTurns: 0,
        sleepTurns: 0,
        currHp: 200,
        maxHp: 200,
        atk: 100,
        def: 100,
        spa: 100,
        spd: 100,
        spe: 100,
        baseStats: { hp: 80, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
        boosts: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 },
        volatile: {},
        moves: [createMove()],
        turnsOnField: 1,
        isTerastallized: false,
        isDynamaxed: false,
        getStat(stat) {
            return this[stat] || this.stats?.[stat] || 100;
        },
        isAlive() {
            return this.currHp > 0;
        },
        takeDamage(amount) {
            const actual = Math.max(0, Math.min(this.currHp, amount));
            this.currHp -= actual;
            return actual;
        },
        heal(amount) {
            const actual = Math.max(0, Math.min(this.maxHp - this.currHp, amount));
            this.currHp += actual;
            return actual;
        },
        applyBoost(stat, amount) {
            const oldValue = this.boosts[stat] || 0;
            this.boosts[stat] = Math.max(-6, Math.min(6, oldValue + amount));
            return this.boosts[stat] - oldValue;
        },
        resetBoosts() {
            this.boosts = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };
        },
        getSprite() {
            return '';
        },
        ...overrides,
    };
    pokemon.stats = pokemon.stats || {
        hp: pokemon.maxHp,
        atk: pokemon.atk,
        def: pokemon.def,
        spa: pokemon.spa,
        spd: pokemon.spd,
        spe: pokemon.spe,
    };
    return pokemon;
}

function createMockBattle(overrides = {}) {
    const player = overrides.player || createMockPokemon({ name: 'Player', cnName: '玩家兽' });
    const enemy = overrides.enemy || createMockPokemon({ name: 'Enemy', cnName: '敌方兽' });
    const battle = {
        weather: null,
        terrain: null,
        field: {},
        turn: 1,
        turnCount: 1,
        aiDifficulty: 'hard',
        locked: false,
        phase: 'fight',
        playerActive: 0,
        enemyActive: 0,
        playerParty: [player],
        enemyParty: [enemy],
        playerSide: {},
        enemySide: {},
        getPlayer() {
            return this.playerParty[this.playerActive];
        },
        getEnemy() {
            return this.enemyParty[this.enemyActive];
        },
        getPlayerSide() {
            return this.playerSide;
        },
        getEnemySide() {
            return this.enemySide;
        },
        checkBattleEnd() {
            return null;
        },
        nextAliveEnemy() {
            const idx = this.enemyParty.findIndex((pokemon, index) => index !== this.enemyActive && pokemon?.isAlive?.());
            if (idx >= 0) {
                this.enemyActive = idx;
                return true;
            }
            return false;
        },
        addLog() {},
        ...overrides,
    };
    return battle;
}

function setBattle(battle) {
    globalThis.battle = battle;
    globalThis.window.battle = battle;
}

function testSwitchBooleans() {
    const active = createMockPokemon({ name: 'Active' });
    const benchAlive = createMockPokemon({ name: 'BenchAlive' });
    const benchFainted = createMockPokemon({ name: 'BenchFainted', currHp: 0 });

    assertEqual(hasAliveSwitch([active], 0), false, 'hasAliveSwitch false with no bench');
    assertEqual(hasAliveSwitch([active, benchFainted], 0), false, 'hasAliveSwitch ignores fainted bench');
    assertEqual(hasAliveSwitch([active, benchFainted, benchAlive], 0), true, 'hasAliveSwitch finds alive bench');

    setBattle(null);
    assertEqual(canPlayerSwitch().canSwitch, true, 'canPlayerSwitch true without battle');
    assertEqual(canEnemySwitch().canSwitch, true, 'canEnemySwitch true without battle');

    const player = createMockPokemon({ name: 'Player' });
    const enemy = createMockPokemon({ name: 'Enemy' });
    setBattle(createMockBattle({ player, enemy, playerParty: [player, benchAlive], enemyParty: [enemy, benchAlive] }));
    assertEqual(canPlayerSwitch().canSwitch, true, 'canPlayerSwitch delegates stable true');
    assertEqual(canEnemySwitch().canSwitch, true, 'canEnemySwitch delegates stable true');
}

function testPhazeDoesNotLeaveStickyState() {
    const attacker = createMockPokemon({ name: 'Dragonite', cnName: '快龙' });
    const defender = createMockPokemon({ name: 'Gengar', cnName: '耿鬼', volatile: { confusion: 2 } });
    const battle = createMockBattle({ player: attacker, enemy: defender, playerParty: [attacker], enemyParty: [defender] });
    setBattle(battle);

    const result = applyMoveSecondaryEffects(
        attacker,
        defender,
        createMove({ name: 'Dragon Tail', cn: '龙尾', type: 'Dragon', power: 60, basePower: 60 }),
        30,
        battle,
        true
    );

    assertEqual(result.phaze, true, 'Dragon Tail returns one-shot phaze result');
    assertEqual(Boolean(battle.playerForcedSwitch), false, 'Dragon Tail does not set sticky playerForcedSwitch');
    assertEqual(defender.volatile.forceSwitch, undefined, 'Dragon Tail does not write volatile.forceSwitch');
    assertEqual(defender.volatile.forcedSwitch, undefined, 'Dragon Tail does not write volatile.forcedSwitch');
    assertEqual(defender.volatile.confusion, 2, 'Dragon Tail preserves unrelated volatile state');

    const circleLogs = [];
    const circleResult = MoveHandlers['Circle Throw'].onHit(attacker, defender, 30, circleLogs, battle, createMove({ name: 'Circle Throw' }));
    assertEqual(circleResult.phaze, true, 'Circle Throw handler returns phaze');
    assertEqual(defender.volatile.forceSwitch, undefined, 'Circle Throw handler does not write sticky forceSwitch');
}

async function testChoiceLockedNoPpFallsBackToStruggle() {
    const lockedMove = createMove({ name: 'Dragon Dance', cn: '龙之舞', type: 'Dragon', cat: 'status', power: 0, basePower: 0, pp: 0, maxPp: 20 });
    const otherMove = createMove({ name: 'Crunch', cn: '咬碎', type: 'Dark', power: 80, basePower: 80, pp: 15, maxPp: 15 });
    const enemy = createMockPokemon({
        name: 'Tyranitar',
        cnName: '班基拉斯',
        item: 'Choice Scarf',
        choiceLockedMove: 'Dragon Dance',
        moves: [lockedMove, otherMove],
    });
    const player = createMockPokemon({ name: 'Target', cnName: '目标', moves: [createMove({ name: 'Splash', cat: 'status', power: 0, basePower: 0 })] });
    const battle = createMockBattle({
        player,
        enemy,
        playerParty: [player],
        enemyParty: [enemy],
        aiDifficulty: 'hard',
    });
    setBattle(battle);

    await enemyTurn();

    assertEqual(enemy.lastMoveUsed, 'Struggle', 'choice-locked depleted move falls back to Struggle');
    assertEqual(enemy.lastDeductedMove, 'Struggle', 'choice lock does not borrow PP from another move');
    assertEqual(otherMove.pp, 15, 'choice lock leaves other move PP untouched');
    assertEqual(battle.locked, false, 'enemyTurn unlocks battle after choice no-PP flow');
}

function testAiActionShapes() {
    const aiMove = createMockPokemon({
        name: 'AI',
        cnName: 'AI',
        spe: 120,
        moves: [createMove({ name: 'Earthquake', type: 'Ground', power: 100, basePower: 100 })],
    });
    const playerMove = createMockPokemon({ name: 'Player', cnName: '玩家', types: ['Electric'], spe: 80 });

    const moveAction = getAiAction(aiMove, playerMove, 'hard', [aiMove], { turnCount: 5, settings: {} });
    assertEqual(moveAction?.type, 'move', 'getAiAction hard returns move action');
    assert(Boolean(moveAction?.move), 'move action includes move');

    const aiCurrent = createMockPokemon({
        name: 'LowAI',
        cnName: '残血AI',
        types: ['Water'],
        currHp: 20,
        maxHp: 200,
        spe: 50,
        baseStats: { hp: 80, atk: 80, def: 70, spa: 80, spd: 70, spe: 50 },
        moves: [createMove({ name: 'Tackle', type: 'Normal', power: 40, basePower: 40 })],
    });
    const immunePivot = createMockPokemon({
        name: 'GroundPivot',
        cnName: '地面后备',
        types: ['Ground'],
        currHp: 200,
        maxHp: 200,
        moves: [createMove({ name: 'Earthquake', type: 'Ground', power: 100, basePower: 100 })],
    });
    const playerThreat = createMockPokemon({
        name: 'Threat',
        cnName: '威胁',
        types: ['Electric'],
        spe: 130,
        moves: [createMove({ name: 'Thunderbolt', type: 'Electric', power: 120, basePower: 120 })],
    });

    const switchAction = getAiAction(aiCurrent, playerThreat, 'expert', [aiCurrent, immunePivot], {
        turnCount: 10,
        settings: { enableEnemyStrategicSwitching: true },
    });

    assertEqual(switchAction?.type, 'switch', 'getAiAction expert can return switch action');
    assertEqual(typeof switchAction?.index, 'number', 'switch action includes index');
    assert(Boolean(switchAction?.reasoning), 'switch action includes reasoning');
}

function testEndTurnStatusLogs() {
    const poke = createMockPokemon({
        name: 'StatusMon',
        cnName: '状态兽',
        status: 'brn',
        currHp: 120,
        maxHp: 160,
        volatile: { aquaring: true, ingrain: true },
    });
    const opponent = createMockPokemon({ name: 'Opponent', cnName: '对手' });
    setBattle(createMockBattle({ player: poke, enemy: opponent, weather: 'sandstorm' }));

    const logs = getEndTurnStatusLogs(poke, opponent, false);

    assert(Array.isArray(logs), 'getEndTurnStatusLogs returns array');
    assertArrayIncludes(logs, line => line.includes('灼伤'), 'status logs include burn damage');
    assertArrayIncludes(logs, line => line.includes('水流环'), 'status logs include Aqua Ring recovery');
    assertArrayIncludes(logs, line => line.includes('地面吸收'), 'status logs include Ingrain recovery');
    assertArrayIncludes(logs, line => line.includes('sandstorm'), 'status logs include weather damage');
}

function testDoubleBattleOnlyMovesFailCleanlyInSingles() {
    const attacker = createMockPokemon({ name: 'Oranguru', cnName: '智挥猩' });
    const defender = createMockPokemon({ name: 'Target', cnName: '目标' });
    const battle = createMockBattle({ player: attacker, enemy: defender });
    const moves = [
        ['After You', 'Normal'],
        ['Ally Switch', 'Psychic'],
        ['Instruct', 'Psychic'],
        ['Quash', 'Dark'],
    ];

    for (const [name, type] of moves) {
        const before = {
            attackerHp: attacker.currHp,
            defenderHp: defender.currHp,
            attackerVolatile: JSON.stringify(attacker.volatile),
            defenderVolatile: JSON.stringify(defender.volatile),
        };
        const result = applyMoveSecondaryEffects(
            attacker,
            defender,
            createMove({ name, type, cat: 'status', category: 'Status', power: 0, basePower: 0 }),
            0,
            battle,
            true
        );

        assert(hasMoveHandler(name), `${name} has simplified single-battle handler`);
        assert(Array.isArray(result.logs), `${name} returns logs array`);
        assertArrayIncludes(result.logs, line => line.includes('单打'), `${name} explains single-battle no-op`);
        assertEqual(attacker.currHp, before.attackerHp, `${name} does not damage user`);
        assertEqual(defender.currHp, before.defenderHp, `${name} does not damage target`);
        assertEqual(JSON.stringify(attacker.volatile), before.attackerVolatile, `${name} does not mutate user volatile`);
        assertEqual(JSON.stringify(defender.volatile), before.defenderVolatile, `${name} does not mutate target volatile`);
    }
}

function testPPSystemMechanics() {
    const pressureMove = createMove({ name: 'Tackle', cn: '撞击', pp: 5, maxPp: 35 });
    const pressureUser = createMockPokemon({ name: 'User', cnName: '使用者', moves: [pressureMove] });
    const pressureTarget = createMockPokemon({ name: 'PressureMon', cnName: '压迫兽', ability: 'Pressure' });
    const pressureResult = PPSystem.deductPP(pressureUser, pressureMove, pressureTarget);

    assertEqual(pressureResult.success, true, 'PPSystem deductPP succeeds under Pressure');
    assertEqual(pressureMove.pp, 3, 'Pressure deducts 2 PP');

    const leppaMove = createMove({ name: 'Thunderbolt', cn: '十万伏特', pp: 1, maxPp: 15 });
    const leppaUser = createMockPokemon({ name: 'BerryUser', cnName: '树果兽', item: 'Leppa Berry', moves: [leppaMove] });
    const leppaResult = PPSystem.deductPP(leppaUser, leppaMove, createMockPokemon());
    assertEqual(leppaResult.success, true, 'PPSystem deductPP succeeds before Leppa Berry');
    assertEqual(leppaMove.pp, 10, 'Leppa Berry restores PP after depletion');
    assertEqual(leppaUser.item, null, 'Leppa Berry is consumed');
    assertArrayIncludes(leppaResult.logs, line => line.includes('零余果'), 'Leppa Berry emits recovery log');

    const depleted = createMockPokemon({
        name: 'Depleted',
        moves: [
            createMove({ name: 'Splash', pp: 0, maxPp: 40 }),
            createMove({ name: 'Growl', pp: 0, maxPp: 40 }),
        ],
    });
    const notDepleted = createMockPokemon({
        name: 'NotDepleted',
        moves: [
            createMove({ name: 'Splash', pp: 0, maxPp: 40 }),
            createMove({ name: 'Tackle', pp: 1, maxPp: 35 }),
        ],
    });
    assertEqual(PPSystem.allPPDepleted(depleted), true, 'allPPDepleted true when all tracked PP are zero');
    assertEqual(PPSystem.allPPDepleted(notDepleted), false, 'allPPDepleted false when any move has PP');

    const struggle = PPSystem.createStruggle();
    const struggleUser = createMockPokemon({ name: 'Struggler', moves: [createMove({ name: 'Tackle', pp: 0, maxPp: 35 })] });
    const struggleResult = PPSystem.deductPP(struggleUser, struggle, createMockPokemon());
    assertEqual(struggleResult.success, true, 'Struggle PP deduction succeeds');
    assertEqual(struggleUser.moves[0].pp, 0, 'Struggle does not deduct another move PP');
}

async function main() {
    testSwitchBooleans();
    testPhazeDoesNotLeaveStickyState();
    await testChoiceLockedNoPpFallsBackToStruggle();
    testAiActionShapes();
    testEndTurnStatusLogs();
    testDoubleBattleOnlyMovesFailCleanlyInSingles();
    testPPSystemMechanics();

    if (failures.length > 0) {
        console.error(`\n❌ battle-flow-test failed: ${passedTests}/${totalTests} passed`);
        failures.forEach((failure, idx) => {
            console.error(`  ${idx + 1}. ${failure.testName}${failure.detail ? ` — ${failure.detail}` : ''}`);
        });
        process.exitCode = 1;
        return;
    }

    originalConsoleLog(`✅ battle-flow-test passed: ${passedTests}/${totalTests}`);
}

await main();
