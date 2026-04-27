#!/usr/bin/env node
/**
 * =============================================
 * 招式实现覆盖率静态分析脚本
 * =============================================
 * 
 * 用法: node scripts/move-coverage-test.js
 * 
 * 分析维度:
 * 1. 纯伤害技能 (basePower > 0, 无特殊字段) → 通用引擎自动处理 ✅
 * 2. secondary/secondaries 副作用 → battle-effects.js 通用处理 ✅
 * 3. drain/recoil/heal 字段 → battle-effects.js 通用处理 ✅
 * 4. boosts (变化技) → battle-effects.js 通用处理 ✅
 * 5. status (直接施加状态) → battle-effects.js 通用处理 ✅
 * 6. flags.charge (蓄力技) → 需要 CHARGE_MOVE_CONFIG ⚠️
 * 7. basePowerCallback/onHit/onUse 等 → 需要 MoveHandler ⚠️
 * 8. 特殊机制 (forceSwitch, selfdestruct, terrain, weather 等) → 部分通用 + 部分需 handler
 * 
 * 输出: 每个招式的实现状态 ✅完整 / ⚠️部分 / ❌缺失
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// ============================================
// 1. 加载 MOVES 数据
// ============================================
function loadMoves() {
    const src = readFileSync(join(ROOT, 'data/moves-data.js'), 'utf-8');
    // 移除 export 关键字，用 Function 构造器执行
    const code = src.replace(/^export\s+/gm, '');
    const fn = new Function(code + '\nreturn MOVES;');
    return fn();
}

// ============================================
// 2. 加载 MoveHandlers 名称列表 + 钩子类型
// ============================================
function loadHandlers() {
    const src = readFileSync(join(ROOT, 'engine/move-handlers.js'), 'utf-8');
    const handlers = {};
    
    // 匹配 'Move Name': { ... } 块，提取名称和钩子
    // 策略：找到所有 handler key，然后检查其包含的钩子
    const handlerRegex = /^\s{4}(?:'([^']+)'|"([^"]+)"):\s*\{/gm;
    let match;
    while ((match = handlerRegex.exec(src)) !== null) {
        const name = (match[1] || match[2]).replace(/\\'/g, "'");
        const startIdx = match.index;
        
        // 找到这个 handler 块的结束位置（通过大括号匹配）
        let depth = 0;
        let blockStart = src.indexOf('{', startIdx + match[0].length - 1);
        let blockEnd = blockStart;
        for (let i = blockStart; i < src.length; i++) {
            if (src[i] === '{') depth++;
            if (src[i] === '}') depth--;
            if (depth === 0) { blockEnd = i; break; }
        }
        
        const block = src.substring(blockStart, blockEnd + 1);
        
        handlers[name] = {
            hasBasePowerCallback: /basePowerCallback\s*:/.test(block),
            hasDamageCallback: /damageCallback\s*:/.test(block),
            hasOnHit: /onHit\s*:/.test(block),
            hasOnUse: /onUse\s*:/.test(block),
            hasOnMiss: /onMiss\s*:/.test(block),
            hasOnAfterMove: /onAfterMove\s*:/.test(block),
            hasOnModifyType: /onModifyType\s*:/.test(block),
            hasIsChargeMove: /isChargeMove\s*:/.test(block),
        };
    }
    
    return handlers;
}

// ============================================
// 3. 加载 CHARGE_MOVE_CONFIG 名称列表
// ============================================
function loadChargeMoveConfig() {
    const src = readFileSync(join(ROOT, 'engine/charge-moves.js'), 'utf-8');
    const names = new Set();
    const regex = /^\s{4}'([^']+)':\s*\{/gm;
    let match;
    while ((match = regex.exec(src)) !== null) {
        // 只匹配 CHARGE_MOVE_CONFIG 内部的（在 export const CHARGE_MOVE_CONFIG 之后）
        const configStart = src.indexOf('export const CHARGE_MOVE_CONFIG');
        if (match.index > configStart) {
            const closingBrace = src.indexOf('};', configStart);
            if (match.index < closingBrace) {
                names.add(match[1].replace(/\\'/g, "'"));
            }
        }
    }
    return names;
}

// ============================================
// 4. 分析每个招式的实现状态
// ============================================
function analyzeMove(moveId, moveData, handlers, chargeMoves) {
    const name = moveData.name || moveId;
    const category = moveData.category || 'Status';
    const basePower = moveData.basePower || 0;
    const handler = handlers[name];
    
    const result = {
        id: moveId,
        name: name,
        category: category,
        type: moveData.type || '???',
        basePower: basePower,
        status: 'ok',       // ok / partial / missing
        coverage: [],        // 已覆盖的机制
        missing: [],         // 缺失的机制
        notes: [],           // 备注
        isNonstandard: moveData.isNonstandard || null,
        needsHandler: false, // 是否需要专用 handler
    };
    
    // === 跳过非标准招式 (Z-Move, Max Move, Past) ===
    if (moveData.isZ || moveData.isMax) {
        result.notes.push('Z/Max招式(特殊处理)');
    }
    
    // === A. 纯伤害技能 (有 basePower, 无特殊字段) ===
    if (category !== 'Status' && basePower > 0) {
        result.coverage.push('伤害计算(通用引擎)');
    }
    
    // === B. secondary 副作用 ===
    if (moveData.secondary && moveData.secondary !== null) {
        const sec = moveData.secondary;
        if (sec.boosts) result.coverage.push('secondary.boosts(通用)');
        if (sec.status) result.coverage.push(`secondary.status:${sec.status}(通用)`);
        if (sec.volatileStatus === 'flinch') result.coverage.push('secondary.flinch(通用)');
        if (sec.volatileStatus === 'confusion') result.coverage.push('secondary.confusion(通用)');
        if (sec.volatileStatus === 'healblock') result.coverage.push('secondary.healblock(通用)');
        if (sec.volatileStatus === 'saltcure') result.coverage.push('secondary.saltcure(通用+handler)');
        if (sec.volatileStatus === 'syrupbomb') result.coverage.push('secondary.syrupbomb(通用)');
        if (sec.volatileStatus === 'sparklingaria') result.coverage.push('secondary.sparklingaria(通用)');
        if (sec.self && sec.self.boosts) result.coverage.push('secondary.self.boosts(通用)');
        // 未处理的 secondary 字段
        const handledVolatile = ['flinch', 'confusion', 'healblock', 'saltcure', 'syrupbomb', 'sparklingaria'];
        if (sec.volatileStatus && !handledVolatile.includes(sec.volatileStatus)) {
            result.missing.push(`secondary.volatileStatus:${sec.volatileStatus}(未通用处理)`);
        }
    }
    
    // === B2. secondaries 数组 ===
    if (moveData.secondaries && Array.isArray(moveData.secondaries)) {
        for (const sec of moveData.secondaries) {
            if (sec.status) result.coverage.push(`secondaries.status:${sec.status}(通用)`);
            if (sec.volatileStatus === 'flinch') result.coverage.push('secondaries.flinch(通用)');
            if (sec.volatileStatus === 'confusion') result.coverage.push('secondaries.confusion(通用)');
            if (sec.boosts) result.coverage.push('secondaries.boosts(通用)');
        }
    }
    
    // === C. drain / recoil / heal ===
    if (moveData.drain) result.coverage.push('drain(通用)');
    if (moveData.recoil) result.coverage.push('recoil(通用)');
    if (moveData.heal) result.coverage.push('heal(通用)');
    
    // === D. boosts (变化技直接能力变化) ===
    if (moveData.boosts) result.coverage.push('boosts(通用)');
    
    // === E. self.boosts (攻击后自身能力变化，如近身战) ===
    if (moveData.self && moveData.self.boosts) result.coverage.push('self.boosts(通用)');
    if (moveData.self && moveData.self.volatileStatus) result.coverage.push('self.volatileStatus(通用)');
    
    // === F. status (直接施加状态异常) ===
    if (moveData.status) result.coverage.push(`status:${moveData.status}(通用)`);
    
    // === G. 蓄力技能 ===
    if (moveData.flags && moveData.flags.charge) {
        if (chargeMoves.has(name)) {
            result.coverage.push('蓄力技(CHARGE_MOVE_CONFIG)');
        } else {
            result.missing.push('flags.charge但无CHARGE_MOVE_CONFIG配置');
        }
    }
    
    // === H. 场地/天气/地形 ===
    if (moveData.weather) result.coverage.push(`weather:${moveData.weather}(通用handler)`);
    if (moveData.terrain) result.coverage.push(`terrain:${moveData.terrain}(通用)`);
    if (moveData.sideCondition) result.coverage.push(`sideCondition:${moveData.sideCondition}(通用)`);
    if (moveData.pseudoWeather) result.coverage.push(`pseudoWeather:${moveData.pseudoWeather}(通用)`);
    
    // === I. 特殊机制字段 ===
    if (moveData.forceSwitch) result.coverage.push('forceSwitch(通用)');
    if (moveData.selfdestruct) result.coverage.push('selfdestruct(通用)');
    if (moveData.volatileStatus === 'partiallytrapped') result.coverage.push('束缚(通用)');
    if (moveData.stallingMove) result.coverage.push('守住类(通用)');
    if (moveData.multihit) result.coverage.push('多段攻击(通用)');
    if (moveData.critRatio && moveData.critRatio > 1) result.coverage.push('高暴击率(通用)');
    if (moveData.willCrit) result.coverage.push('必定暴击(通用)');
    if (moveData.breaksProtect) result.coverage.push('穿透守住(通用)');
    if (moveData.priority !== 0 && moveData.priority !== undefined) result.coverage.push(`优先度:${moveData.priority}(通用)`);
    
    // === J. MoveHandler 检查 ===
    if (handler) {
        const hooks = [];
        if (handler.hasBasePowerCallback) hooks.push('basePowerCallback');
        if (handler.hasDamageCallback) hooks.push('damageCallback');
        if (handler.hasOnHit) hooks.push('onHit');
        if (handler.hasOnUse) hooks.push('onUse');
        if (handler.hasOnMiss) hooks.push('onMiss');
        if (handler.hasOnAfterMove) hooks.push('onAfterMove');
        if (handler.hasOnModifyType) hooks.push('onModifyType');
        result.coverage.push(`MoveHandler(${hooks.join(',')})`);
    }
    
    // === K. 判断是否需要专用 handler ===
    // 以下情况需要 handler 但可能没有:
    const needsSpecialHandling = [];
    
    // K1. moves-data.js 中有 basePowerCallback: null 标记（原始数据有回调但被移除）
    if ('basePowerCallback' in moveData && moveData.basePowerCallback === null) {
        needsSpecialHandling.push('basePowerCallback(数据中标记为null)');
        // 如果有任何 handler 钩子（basePowerCallback/onHit/onUse等），视为已实现
        // Tera Blast 等招式的威力逻辑在 battle-calc.js 中特判
        if (!handler) {
            result.missing.push('需要basePowerCallback但无handler');
        }
    }
    
    // K2. moves-data.js 中有 onHit: null 标记
    if ('onHit' in moveData && moveData.onHit === null) {
        needsSpecialHandling.push('onHit(数据中标记为null)');
        // 如果有任何 handler 钩子，视为已实现
        if (!handler) {
            // 变化技如果只有 boosts/status 不一定需要 onHit handler
            if (category === 'Status' && !moveData.boosts && !moveData.status && !moveData.sideCondition && !moveData.terrain && !moveData.weather && !moveData.volatileStatus && !moveData.stallingMove && !moveData.heal) {
                result.missing.push('变化技需要onHit但无handler');
            }
        }
    }
    
    // K3. moves-data.js 中有 onTryMove: null 标记（原始有条件检查）
    if ('onTryMove' in moveData && moveData.onTryMove === null) {
        needsSpecialHandling.push('onTryMove(数据中标记为null)');
    }
    
    // K4. 变化技无 boosts/status/sideCondition/weather/terrain 且无 handler
    if (category === 'Status' && basePower === 0) {
        const hasGenericEffect = moveData.boosts || moveData.status || moveData.sideCondition || 
            moveData.weather || moveData.terrain || moveData.pseudoWeather || moveData.heal ||
            moveData.volatileStatus || moveData.stallingMove || moveData.forceSwitch ||
            (moveData.self && moveData.self.sideCondition) || (moveData.self && moveData.self.boosts);
        if (!hasGenericEffect && !handler) {
            result.needsHandler = true;
            result.missing.push('变化技无通用效果且无handler');
        }
    }
    
    // K5. 固定伤害技 (basePower === 1 或特殊标记) 需要 damageCallback
    if (basePower === 1 && !moveData.isZ && !moveData.isMax) {
        if (!handler || !handler.hasDamageCallback) {
            // 可能是 Z-Move 的 basePower=1 占位
            if (!moveData.isNonstandard) {
                result.missing.push('basePower=1可能需要damageCallback');
            }
        }
    }
    
    if (needsSpecialHandling.length > 0) {
        result.notes.push(`原始数据含回调: ${needsSpecialHandling.join(', ')}`);
    }
    
    // === 最终状态判定 ===
    if (result.missing.length > 0) {
        // 检查是否为非标准招式（Past/LGPE/CAP等）
        if (moveData.isNonstandard) {
            result.status = 'nonstandard';
        } else {
            result.status = result.missing.some(m => m.includes('需要') || m.includes('变化技无通用')) ? 'missing' : 'partial';
        }
    } else if (result.coverage.length === 0 && category !== 'Status') {
        // 纯伤害技，无特殊字段，通用引擎可处理
        result.status = 'ok';
    }
    
    return result;
}

// ============================================
// 5. 主程序
// ============================================
function main() {
    console.log('========================================');
    console.log('  PKM12 招式实现覆盖率分析');
    console.log('========================================\n');
    
    // 加载数据
    const MOVES = loadMoves();
    const handlers = loadHandlers();
    const chargeMoves = loadChargeMoveConfig();
    
    const moveIds = Object.keys(MOVES);
    const handlerNames = Object.keys(handlers);
    
    console.log(`📊 数据概览:`);
    console.log(`   MOVES 数据库: ${moveIds.length} 个招式`);
    console.log(`   MoveHandlers: ${handlerNames.length} 个专用处理器`);
    console.log(`   CHARGE_MOVE_CONFIG: ${chargeMoves.size} 个蓄力技配置`);
    console.log('');
    
    // 分析每个招式
    const results = [];
    for (const [id, data] of Object.entries(MOVES)) {
        results.push(analyzeMove(id, data, handlers, chargeMoves));
    }
    
    // 统计
    const stats = {
        ok: results.filter(r => r.status === 'ok'),
        partial: results.filter(r => r.status === 'partial'),
        missing: results.filter(r => r.status === 'missing'),
        nonstandard: results.filter(r => r.status === 'nonstandard'),
    };
    
    // 按分类统计
    const byCategory = {
        Physical: { total: 0, ok: 0, partial: 0, missing: 0, nonstandard: 0 },
        Special: { total: 0, ok: 0, partial: 0, missing: 0, nonstandard: 0 },
        Status: { total: 0, ok: 0, partial: 0, missing: 0, nonstandard: 0 },
    };
    
    for (const r of results) {
        const cat = r.category;
        if (byCategory[cat]) {
            byCategory[cat].total++;
            byCategory[cat][r.status]++;
        }
    }
    
    // ============================================
    // 输出报告
    // ============================================
    
    console.log('========================================');
    console.log('  总体覆盖率');
    console.log('========================================');
    const standardTotal = stats.ok.length + stats.partial.length + stats.missing.length;
    console.log(`   ✅ 完整实现: ${stats.ok.length} (${(stats.ok.length / standardTotal * 100).toFixed(1)}%)`);
    console.log(`   ⚠️  部分实现: ${stats.partial.length} (${(stats.partial.length / standardTotal * 100).toFixed(1)}%)`);
    console.log(`   ❌ 缺失实现: ${stats.missing.length} (${(stats.missing.length / standardTotal * 100).toFixed(1)}%)`);
    console.log(`   ⏭️  非标准(Past/Z/Max等): ${stats.nonstandard.length}`);
    console.log(`   ─────────────────────`);
    console.log(`   总计: ${moveIds.length} | 标准招式: ${standardTotal}`);
    console.log('');
    
    console.log('========================================');
    console.log('  按分类统计');
    console.log('========================================');
    for (const [cat, s] of Object.entries(byCategory)) {
        const catStandard = s.ok + s.partial + s.missing;
        const pct = catStandard > 0 ? (s.ok / catStandard * 100).toFixed(1) : '0.0';
        console.log(`   ${cat.padEnd(10)} | 总${String(s.total).padStart(3)} | ✅${String(s.ok).padStart(3)} | ⚠️ ${String(s.partial).padStart(3)} | ❌${String(s.missing).padStart(3)} | 覆盖率 ${pct}%`);
    }
    console.log('');
    
    // ============================================
    // 缺失列表 (❌)
    // ============================================
    if (stats.missing.length > 0) {
        console.log('========================================');
        console.log(`  ❌ 缺失实现的招式 (${stats.missing.length}个)`);
        console.log('========================================');
        
        // 按类型分组
        const missingByType = {};
        for (const r of stats.missing) {
            const key = r.category;
            if (!missingByType[key]) missingByType[key] = [];
            missingByType[key].push(r);
        }
        
        for (const [cat, moves] of Object.entries(missingByType)) {
            console.log(`\n  ── ${cat} (${moves.length}个) ──`);
            for (const m of moves) {
                const missingStr = m.missing.join('; ');
                console.log(`   ❌ ${m.name.padEnd(25)} [${m.type.padEnd(8)}] ${missingStr}`);
            }
        }
        console.log('');
    }
    
    // ============================================
    // 部分实现列表 (⚠️)
    // ============================================
    if (stats.partial.length > 0) {
        console.log('========================================');
        console.log(`  ⚠️  部分实现的招式 (${stats.partial.length}个)`);
        console.log('========================================');
        for (const r of stats.partial) {
            const missingStr = r.missing.join('; ');
            console.log(`   ⚠️  ${r.name.padEnd(25)} [${r.type.padEnd(8)}] 缺: ${missingStr}`);
        }
        console.log('');
    }
    
    // ============================================
    // Handler 覆盖检查：handler 中有但 MOVES 中没有的
    // ============================================
    const movesNameSet = new Set(results.map(r => r.name));
    const orphanHandlers = handlerNames.filter(h => !movesNameSet.has(h));
    if (orphanHandlers.length > 0) {
        console.log('========================================');
        console.log(`  🔍 孤立 Handler (有handler但MOVES中无对应招式): ${orphanHandlers.length}个`);
        console.log('========================================');
        for (const h of orphanHandlers) {
            console.log(`   🔍 ${h}`);
        }
        console.log('');
    }
    
    // ============================================
    // 有 handler 的招式汇总
    // ============================================
    const handledMoves = results.filter(r => r.coverage.some(c => c.startsWith('MoveHandler')));
    console.log('========================================');
    console.log(`  📋 有专用 Handler 的招式: ${handledMoves.length}个`);
    console.log('========================================');
    
    // 按 handler 钩子类型分组
    const hookGroups = {
        damageCallback: [],
        basePowerCallback: [],
        onHit: [],
        onUse: [],
        onAfterMove: [],
        onModifyType: [],
    };
    
    for (const r of handledMoves) {
        const h = handlers[r.name];
        if (!h) continue;
        if (h.hasDamageCallback) hookGroups.damageCallback.push(r.name);
        if (h.hasBasePowerCallback) hookGroups.basePowerCallback.push(r.name);
        if (h.hasOnHit) hookGroups.onHit.push(r.name);
        if (h.hasOnUse) hookGroups.onUse.push(r.name);
        if (h.hasOnAfterMove) hookGroups.onAfterMove.push(r.name);
        if (h.hasOnModifyType) hookGroups.onModifyType.push(r.name);
    }
    
    for (const [hook, names] of Object.entries(hookGroups)) {
        if (names.length > 0) {
            console.log(`\n  ── ${hook} (${names.length}个) ──`);
            console.log(`   ${names.join(', ')}`);
        }
    }
    console.log('');
    
    // ============================================
    // 特殊关注：变化技实现情况
    // ============================================
    const statusMoves = results.filter(r => r.category === 'Status');
    const statusOk = statusMoves.filter(r => r.status === 'ok');
    const statusMissing = statusMoves.filter(r => r.status === 'missing');
    
    console.log('========================================');
    console.log(`  🎯 变化技重点关注 (最容易缺失实现)`);
    console.log('========================================');
    console.log(`   总计: ${statusMoves.length} | ✅${statusOk.length} | ❌${statusMissing.length}`);
    
    if (statusMissing.length > 0) {
        console.log(`\n  ── 缺失的变化技 ──`);
        // 过滤掉非标准
        const standardMissing = statusMissing.filter(r => !r.isNonstandard);
        const nonstandardMissing = statusMissing.filter(r => r.isNonstandard);
        
        if (standardMissing.length > 0) {
            console.log(`\n  标准招式 (${standardMissing.length}个):`);
            for (const m of standardMissing) {
                console.log(`   ❌ ${m.name.padEnd(25)} [${m.type.padEnd(8)}] ${m.missing.join('; ')}`);
            }
        }
        if (nonstandardMissing.length > 0) {
            console.log(`\n  非标准招式 (${nonstandardMissing.length}个, 低优先级):`);
            for (const m of nonstandardMissing) {
                console.log(`   ⏭️  ${m.name.padEnd(25)} [${m.type.padEnd(8)}] (${m.isNonstandard})`);
            }
        }
    }
    console.log('');
    
    console.log('========================================');
    console.log('  分析完成');
    console.log('========================================');
}

main();
