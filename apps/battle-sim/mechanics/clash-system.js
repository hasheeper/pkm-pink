/**
 * ===========================================
 * CLASH-SYSTEM.JS - 对冲系统
 * ===========================================
 * 
 * 职责:
 * - Clash Type 推导 (SOLID/BEAM/WAVE/PIERCE)
 * - 杀意感知 (Insight Check)
 * - 对冲判定 (Clash Resolution)
 * - Clash Power 计算
 * 
 * 依赖: moves-data.js, battle-engine.js
 */

// ============================================
// 常量与配置
// ============================================

// Clash Type 枚举
const CLASH_TYPE = {
    SOLID: 'SOLID',   // 实体/近身
    BEAM: 'BEAM',     // 光束/投射
    WAVE: 'WAVE',     // 波动/范围
    PIERCE: 'PIERCE'  // 穿透/切裂
};

// 需要强制标记为 WAVE 的招式（缺少 wind/sound flag）
// 这些招式不能被对冲：场地类、垂直类、全屏类
const WAVE_OVERRIDE = [
    // 场地/环境类（力量来自脚下）
    'earthquake', 'magnitude', 'earthpower', 'bulldoze', 'stompingtantrum',
    'surf', 'muddywater', 'sludgewave', 'discharge',
    'heatwave', 'icywind', 'sparklingaria', 'originpulse',
    'precipiceblades', 'thousandarrows', 'thousandwaves',
    // 垂直/天降类（从天而降，无法正面拦截）
    'thunder', 'hurricane', 'dracometeor', 'meteorbeam',
    'cometpunch', 'meteormash', 'doomdesire', 'futuresight',
    // 全屏/范围类
    'explosion', 'selfdestruct', 'mindblown', 'mistyexplosion'
];

// 需要强制标记为 SOLID 的招式（投射实体物，不是能量光束）
// 这些招式虽然是远程，但投射的是实体物质
const SOLID_OVERRIDE = [
    // 岩石投射类（包括有 slicing flag 但实际是投掷岩石的招式）
    'stoneedge', 'rockslide', 'rockthrow', 'ancientpower', 'powergem',
    'smackdown', 'accelerock', 'headsmash', 'rockblast', 'rollout',
    'stoneaxe',  // 岩斧：虽然有 slicing flag，但本质是投掷石斧
    // 金属投射类
    'flashcannon', 'steelbeam', 'ironhead', 'gyroball', 'heavyslam',
    'magnetbomb', 'mirrorshot', 'smartstrike',
    // 其他实体投射
    'seedbomb', 'rockwrecker', 'diamondstorm', 'stealthrock'
];

// 需要强制标记为 PIERCE 的招式（切割/穿刺类）
const PIERCE_OVERRIDE = [
    // 切割类（没有 slicing flag 但实际是切割）
    'slash', 'nightslash', 'crosspoison', 'xscissor', 'cut',
    'furycutter', 'razorshell', 'shellblade', 'secretsword'
];

// 对冲交互矩阵
const CLASH_MATRIX = {
    'BEAM': {
        'BEAM':   { interaction: 'cpCheck', advantage: 0, critBonus: 0 },
        'SOLID':  { interaction: 'beamAdvantage', advantage: 0.5, critBonus: 0 },
        'WAVE':   { interaction: 'pierce', advantage: 1.0, critBonus: 0 },
        'PIERCE': { interaction: 'sliced', advantage: -0.5, critBonus: 0 }
    },
    'SOLID': {
        'BEAM':   { interaction: 'tankOrDodge', advantage: -0.3, critBonus: 0 },
        'SOLID':  { interaction: 'cpCheck', advantage: 0, critBonus: 0.2 },
        'WAVE':   { interaction: 'breakthrough', advantage: 0.8, critBonus: 0 },
        'PIERCE': { interaction: 'parry', advantage: 0, critBonus: 0.3 }
    },
    'WAVE': {
        'BEAM':   { interaction: 'pierced', advantage: -1.0, critBonus: 0 },
        'SOLID':  { interaction: 'broken', advantage: -0.8, critBonus: 0 },
        'WAVE':   { interaction: 'cpCheck', advantage: 0, critBonus: 0 },
        'PIERCE': { interaction: 'dissipate', advantage: -0.5, critBonus: 0 }
    },
    'PIERCE': {
        'BEAM':   { interaction: 'slice', advantage: 0.5, critBonus: 0 },
        'SOLID':  { interaction: 'parry', advantage: 0, critBonus: 0.3 },
        'WAVE':   { interaction: 'passThrough', advantage: 0.5, critBonus: 0 },
        'PIERCE': { interaction: 'crossSlash', advantage: 0, critBonus: 0.5 }
    }
};

// 对冲结果日志文案
const CLASH_MESSAGES = {
    overpower: [
        '{winner}的{move}完全压制了对方！',
        '{winner}的{move}势不可挡！',
        '压倒性的力量！{winner}的{move}碾压了一切！'
    ],
    dominate: [
        '{winner}的{move}占据了上风！',
        '{winner}的{move}压制住了对方的攻击！'
    ],
    pierce: [
        '{winner}的{move}穿透了对方的攻击！',
        '能量对冲！{winner}的{move}略胜一筹！'
    ],
    neutralize: [
        '两股能量相互抵消了！',
        '势均力敌！双方的攻击同时消散！',
        '完美的对冲！双方都没有受到伤害！'
    ],
    backfire: [
        '{winner}的{move}反击成功！',
        '{loser}的攻击被弹回来了！'
    ]
};

// Insight 阈值配置
const INSIGHT_THRESHOLDS = {
    BASIC: 50,      // 仅知道"有攻击意图"
    TYPE: 150,      // 知道属性类型
    CATEGORY: 220,  // 知道属性 + 物理/特殊
    FULL: 255       // 知道具体招式名
};

// ============================================
// 核心函数：Clash Type 推导
// ============================================

/**
 * 从招式 flags 推导 Clash Type
 * @param {Object} move - 招式对象 (含 flags 或 name)
 * @returns {string} 'SOLID' | 'BEAM' | 'WAVE' | 'PIERCE'
 */
function getClashType(move) {
    if (!move) return CLASH_TYPE.BEAM;
    
    // 获取完整招式数据
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    const flags = move.flags || fullMoveData.flags || {};
    
    // =====================================================
    // === 优先级 0: Override 列表（最高优先级）===
    // =====================================================
    
    // 强制 WAVE 的招式（场地类、垂直类、全屏类）
    if (WAVE_OVERRIDE.includes(moveId)) {
        return CLASH_TYPE.WAVE;
    }
    
    // 强制 SOLID 的招式（投射实体物）
    if (SOLID_OVERRIDE.includes(moveId)) {
        return CLASH_TYPE.SOLID;
    }
    
    // 强制 PIERCE 的招式（切割/穿刺类）
    if (PIERCE_OVERRIDE.includes(moveId)) {
        return CLASH_TYPE.PIERCE;
    }
    
    // =====================================================
    // === 优先级 1-4: 根据 flags 推导 ===
    // =====================================================
    
    // 优先级 1: 切割类 → PIERCE
    if (flags.slicing) return CLASH_TYPE.PIERCE;
    
    // 优先级 2: 投射物 → BEAM
    if (flags.bullet || flags.pulse) return CLASH_TYPE.BEAM;
    
    // 优先级 3: 范围波动 → WAVE
    if (flags.wind || flags.sound) return CLASH_TYPE.WAVE;
    
    // 优先级 4: 接触类 → SOLID
    if (flags.contact) return CLASH_TYPE.SOLID;
    
    // 默认: 远程能量 → BEAM
    return CLASH_TYPE.BEAM;
}

/**
 * 获取 Clash Type 的中文名称
 * @param {string} clashType 
 * @returns {string}
 */
function getClashTypeName(clashType) {
    const names = {
        'SOLID': '实体',
        'BEAM': '光束',
        'WAVE': '波动',
        'PIERCE': '穿透'
    };
    return names[clashType] || '未知';
}

// ============================================
// 核心函数：对冲交互判定
// ============================================

/**
 * 获取对冲交互结果
 * @param {string} typeA - 先手 Clash Type
 * @param {string} typeB - 后手 Clash Type
 * @returns {Object} { interaction, advantage, critBonus }
 */
function getClashInteraction(typeA, typeB) {
    return CLASH_MATRIX[typeA]?.[typeB] || { interaction: 'cpCheck', advantage: 0, critBonus: 0 };
}

/**
 * 获取属性克制对对冲的加成
 * @param {Object} moveA - 招式 A
 * @param {Object} moveB - 招式 B
 * @returns {number} 加成倍率 (0.7 ~ 1.3)
 */
function getTypeClashModifier(moveA, moveB) {
    if (!moveA || !moveB) return 1.0;
    
    const typeA = moveA.type || 'Normal';
    const typeB = moveB.type || 'Normal';
    
    // 使用现有的属性克制计算
    if (typeof getTypeEffectiveness === 'function') {
        const effectiveness = getTypeEffectiveness(typeA, [typeB]);
        
        if (effectiveness >= 2) return 1.3;   // 克制 +30%
        if (effectiveness <= 0.5 && effectiveness > 0) return 0.7;  // 被克 -30%
        if (effectiveness === 0) return 0;    // 免疫 = 无法对冲
    }
    
    return 1.0;
}

// ============================================
// 核心函数：Clash Power 计算
// ============================================

/**
 * 计算 Clash Power
 * @param {Object} user - 使用者 Pokemon
 * @param {Object} move - 招式
 * @param {Object} opponent - 对手 Pokemon
 * @param {Object} opponentMove - 对手招式
 * @returns {Object} { cp, clashType, interaction, critBonus }
 */
function calculateClashPower(user, move, opponent, opponentMove) {
    if (!user || !move) return { cp: 0, clashType: CLASH_TYPE.BEAM, interaction: null, critBonus: 0, isZMove: false, isMaxMove: false, isMultiHit: false };
    
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    const flags = move.flags || fullMoveData.flags || {};
    
    // =====================================================
    // 【特殊招式检测】Z招式 / 极巨招式 / 多段攻击
    // =====================================================
    const isZMove = move.isZ || fullMoveData.isZ || false;
    const isMaxMove = move.isMax || fullMoveData.isMax || false;
    const multiHitData = fullMoveData.multihit || move.multihit || null;
    const isMultiHit = !!multiHitData;
    
    // 基础威力
    let basePower = move.basePower || move.power || fullMoveData.basePower || 0;
    
    // 【Z招式/极巨招式 CP 加成】
    // Z招式：1.5x CP，极巨招式：1.3x CP
    let specialMoveBonus = 1.0;
    if (isZMove) {
        specialMoveBonus = 1.5;
        console.log(`[CLASH] Z招式检测: ${move.cn || move.name}, CP 加成 1.5x`);
    } else if (isMaxMove) {
        specialMoveBonus = 1.3;
        console.log(`[CLASH] 极巨招式检测: ${move.cn || move.name}, CP 加成 1.3x`);
    }
    
    // 攻击/特攻
    const category = fullMoveData.category || move.category || 'Physical';
    const isSpecial = (category === 'Special' || move.cat === 'spec');
    const atkStat = (typeof user.getStat === 'function') 
        ? (isSpecial ? user.getStat('spa') : user.getStat('atk'))
        : (isSpecial ? (user.spa || 100) : (user.atk || 100));
    
    // 【属性克制加成】招式对目标宝可梦的克制关系
    // 效果极佳 = 1.3x，效果不好 = 0.8x，普通 = 1.0x
    let typeModifier = 1.0;
    if (opponent && typeof window.getTypeEffectiveness === 'function') {
        const moveType = move.type || fullMoveData.type || 'Normal';
        // 【修复】传入对手的类型数组，而不是整个 Pokemon 对象
        const opponentTypes = opponent.types || [opponent.type1, opponent.type2].filter(Boolean);
        if (opponentTypes.length > 0) {
            const effectiveness = window.getTypeEffectiveness(moveType, opponentTypes);
            if (effectiveness >= 2) {
                typeModifier = 1.3; // 效果极佳
            } else if (effectiveness >= 1.5) {
                typeModifier = 1.15; // 效果不错
            } else if (effectiveness <= 0.5 && effectiveness > 0) {
                typeModifier = 0.8; // 效果不好
            } else if (effectiveness <= 0.25 && effectiveness > 0) {
                typeModifier = 0.6; // 效果很差
            }
            // 免疫不影响 CP（对冲是招式碰撞，不是打宝可梦）
        }
    }
    
    // Clash Type 优势
    const myClashType = getClashType(move);
    const theirClashType = opponentMove ? getClashType(opponentMove) : CLASH_TYPE.BEAM;
    const interaction = getClashInteraction(myClashType, theirClashType);
    
    // 【修复】clashAdvantage 最小值为 0.3，避免 CP 直接归零
    // advantage 范围是 -1.0 ~ +1.0，转换为 0.3 ~ 2.0 的倍率
    // 即使处于极端劣势（BEAM vs PIERCE），也有 30% 的基础 CP
    const rawAdvantage = 1 + interaction.advantage;
    const clashAdvantage = Math.max(0.3, rawAdvantage);
    
    // 乱数 (0.9 ~ 1.1)
    const rng = 0.9 + Math.random() * 0.2;
    
    // 最终 CP = 威力 × (攻击/100) × 属性克制 × Clash Type 优势 × 特殊招式加成 × 乱数
    const cp = Math.floor(basePower * (atkStat / 100) * typeModifier * clashAdvantage * specialMoveBonus * rng);
    
    console.log(`[CLASH CP] ${user.cnName} ${move.name || move.cn}: basePower=${basePower}, atk=${atkStat}, type=${myClashType} vs ${theirClashType}, typeMod=${typeModifier.toFixed(2)}, clashAdv=${clashAdvantage.toFixed(2)}, specialBonus=${specialMoveBonus}, cp=${cp}`);
    
    return {
        cp,
        clashType: myClashType,
        interaction: interaction.interaction,
        critBonus: interaction.critBonus,
        isZMove,
        isMaxMove,
        isMultiHit,
        multiHitData
    };
}

// ============================================
// 核心函数：对冲结果判定
// ============================================

/**
 * 对冲结算
 * @param {Object} moveA - 先手招式（玩家后手对冲时，这是玩家的招式）
 * @param {Object} moveB - 后手招式（玩家后手对冲时，这是敌方的招式）
 * @param {Object} userA - 先手使用者（玩家后手对冲时，这是玩家）
 * @param {Object} userB - 后手使用者（玩家后手对冲时，这是敌方）
 * @param {Object} options - { applySpeedModifier: boolean } 是否应用速度修正
 * @returns {Object|null} { winner, loser, resultType, damageMultiplierA, damageMultiplierB, logs }
 */
function resolveClash(moveA, moveB, userA, userB, options = {}) {
    // 检查是否可以对冲
    if (!canClash(moveA) || !canClash(moveB)) {
        console.log('[CLASH] 招式不满足对冲条件');
        return null;
    }
    
    // 计算双方 CP
    const resultA = calculateClashPower(userA, moveA, userB, moveB);
    const resultB = calculateClashPower(userB, moveB, userA, moveA);
    
    let cpA = resultA.cp;
    let cpB = resultB.cp;
    const originalCpA = cpA;
    const originalCpB = cpB;
    
    // 【速度修正】双向生效
    // userA = 后手（发起对冲方），userB = 先手（被对冲方）
    // 后手方 CP 削弱，先手方 CP 加成
    if (options.applySpeedModifier !== false) {
        const speedResult = getSpeedModifiers(userA, userB);
        cpA = Math.floor(cpA * speedResult.slowerModifier);
        cpB = Math.floor(cpB * speedResult.fasterModifier);
        console.log(`[CLASH] 速度修正: ${userA.cnName}(${originalCpA} × ${speedResult.slowerModifier.toFixed(2)} = ${cpA}), ${userB.cnName}(${originalCpB} × ${speedResult.fasterModifier.toFixed(2)} = ${cpB})`);
    }
    
    console.log(`[CLASH] CP 对比: ${userA.cnName}(${cpA}) vs ${userB.cnName}(${cpB})`);
    
    // 避免除以 0：当对方 CP=0 时，直接碾压
    if (cpB === 0) {
        const result = {
            winner: 'A',
            loser: 'B',
            resultType: 'overpower',
            damageMultiplierA: 1.0,
            damageMultiplierB: 0,
            cpA, cpB,
            clashTypeA: resultA.clashType,
            clashTypeB: resultB.clashType,
            logs: []
        };
        // 【修复】生成对冲日志
        result.logs = generateClashLogs(result, moveA, moveB, userA, userB);
        return result;
    }
    
    const ratio = cpA / cpB;
    
    let result = {
        winner: null,
        loser: null,
        damageMultiplierA: 0,
        damageMultiplierB: 0,
        resultType: 'neutralize',
        cpA, cpB,
        clashTypeA: resultA.clashType,
        clashTypeB: resultB.clashType,
        critBonusA: resultA.critBonus,
        critBonusB: resultB.critBonus,
        logs: []
    };
    
    // =====================================================
    // 【新版对冲判定】按 CP 差值比例计算伤害
    // =====================================================
    // 核心思想：CP 高的一方造成 (差值/总和) 比例的伤害
    // 例如：453 vs 382，差值=71，总和=835，胜者伤害倍率=71/835=0.085
    // 这样势均力敌时双方都造成很少伤害，差距大时胜者造成更多伤害
    
    const cpDiff = Math.abs(cpA - cpB);
    const cpTotal = cpA + cpB;
    const diffRatio = cpDiff / cpTotal; // 0 ~ 1
    
    if (ratio >= 2.0) {
        // Overpower: A 碾压 B（CP 差距 >= 2倍）
        result.winner = 'A';
        result.loser = 'B';
        result.damageMultiplierA = 1.0;
        result.damageMultiplierB = 0;
        result.resultType = 'overpower';
    } else if (ratio >= 1.5) {
        // Dominate: A 压制 B（CP 差距 1.5~2倍）
        result.winner = 'A';
        result.loser = 'B';
        result.damageMultiplierA = 0.6 + diffRatio * 0.4; // 0.6 ~ 1.0
        result.damageMultiplierB = 0;
        result.resultType = 'dominate';
    } else if (ratio >= 1.15) {
        // Pierce: A 略胜（CP 差距 1.15~1.5倍）
        // A 造成按比例削减的伤害，B 不造成伤害
        result.winner = 'A';
        result.loser = 'B';
        result.damageMultiplierA = 0.3 + diffRatio * 2; // 约 0.3 ~ 0.6
        result.damageMultiplierB = 0;
        result.resultType = 'pierce';
    } else if (ratio >= 0.87) {
        // Neutralize: 势均力敌（CP 差距在 15% 以内）
        // 【改进】双方都造成削减后的伤害，而不是完全抵消
        // 伤害倍率 = 0.2 + (己方CP占比 - 0.5) * 0.6
        const ratioA = cpA / cpTotal; // 0.435 ~ 0.535
        const ratioB = cpB / cpTotal;
        result.winner = cpA > cpB ? 'A' : (cpB > cpA ? 'B' : null);
        result.loser = cpA > cpB ? 'B' : (cpB > cpA ? 'A' : null);
        // 双方都造成少量伤害，CP 高的一方略多
        result.damageMultiplierA = Math.max(0.1, 0.2 + (ratioA - 0.5) * 1.5);
        result.damageMultiplierB = Math.max(0.1, 0.2 + (ratioB - 0.5) * 1.5);
        result.resultType = 'neutralize';
    } else if (ratio >= 0.67) {
        // Backfire: B 略胜（CP 差距 1.15~1.5倍，B 优势）
        result.winner = 'B';
        result.loser = 'A';
        result.damageMultiplierA = 0;
        result.damageMultiplierB = 0.3 + diffRatio * 2;
        result.resultType = 'backfire';
    } else if (ratio >= 0.5) {
        // B Dominate
        result.winner = 'B';
        result.loser = 'A';
        result.damageMultiplierA = 0;
        result.damageMultiplierB = 0.6 + diffRatio * 0.4;
        result.resultType = 'dominate';
    } else {
        // B Overpower
        result.winner = 'B';
        result.loser = 'A';
        result.damageMultiplierA = 0;
        result.damageMultiplierB = 1.0;
        result.resultType = 'overpower';
    }
    
    console.log(`[CLASH] ratio=${ratio.toFixed(2)}, diffRatio=${diffRatio.toFixed(2)}, result=${result.resultType}, dmgA=${result.damageMultiplierA.toFixed(2)}, dmgB=${result.damageMultiplierB.toFixed(2)}`);
    
    // =====================================================
    // 【Z招式/极巨招式 最低伤害保底】
    // Z招式即使被抵消也至少造成 30% 伤害
    // 极巨招式即使被抵消也至少造成 20% 伤害
    // =====================================================
    if (resultA.isZMove && result.damageMultiplierA < 0.3) {
        console.log(`[CLASH] Z招式保底: ${result.damageMultiplierA.toFixed(2)} → 0.30`);
        result.damageMultiplierA = 0.3;
        result.isZMoveProtected = true;
    } else if (resultA.isMaxMove && result.damageMultiplierA < 0.2) {
        console.log(`[CLASH] 极巨招式保底: ${result.damageMultiplierA.toFixed(2)} → 0.20`);
        result.damageMultiplierA = 0.2;
        result.isMaxMoveProtected = true;
    }
    
    if (resultB.isZMove && result.damageMultiplierB < 0.3) {
        console.log(`[CLASH] Z招式保底: ${result.damageMultiplierB.toFixed(2)} → 0.30`);
        result.damageMultiplierB = 0.3;
        result.isZMoveProtected = true;
    } else if (resultB.isMaxMove && result.damageMultiplierB < 0.2) {
        console.log(`[CLASH] 极巨招式保底: ${result.damageMultiplierB.toFixed(2)} → 0.20`);
        result.damageMultiplierB = 0.2;
        result.isMaxMoveProtected = true;
    }
    
    // =====================================================
    // 【多段攻击 有效段数计算】
    // 根据对冲结果决定多少段能穿透
    // =====================================================
    result.multiHitInfoA = null;
    result.multiHitInfoB = null;
    
    if (resultA.isMultiHit && resultA.multiHitData) {
        const totalHits = Array.isArray(resultA.multiHitData) 
            ? resultA.multiHitData[1]  // [min, max] 取最大值
            : resultA.multiHitData;
        let effectiveHits = totalHits;
        
        if (result.winner === 'A') {
            // A 赢了，根据结果类型决定有效段数
            if (result.resultType === 'overpower' || result.resultType === 'dominate') {
                effectiveHits = totalHits; // 全部段数
            } else if (result.resultType === 'pierce') {
                effectiveHits = Math.ceil(totalHits * 0.6); // 60%
            }
        } else if (result.winner === 'B') {
            // A 输了
            if (result.resultType === 'neutralize') {
                effectiveHits = Math.ceil(totalHits * 0.4); // 40%
            } else {
                effectiveHits = 1; // 只有 1 段
            }
        } else {
            // 平局
            effectiveHits = Math.ceil(totalHits * 0.4);
        }
        
        result.multiHitInfoA = { totalHits, effectiveHits };
        console.log(`[CLASH] 多段攻击A: ${totalHits}段 → ${effectiveHits}段有效`);
    }
    
    if (resultB.isMultiHit && resultB.multiHitData) {
        const totalHits = Array.isArray(resultB.multiHitData) 
            ? resultB.multiHitData[1] 
            : resultB.multiHitData;
        let effectiveHits = totalHits;
        
        if (result.winner === 'B') {
            if (result.resultType === 'overpower' || result.resultType === 'dominate') {
                effectiveHits = totalHits;
            } else if (result.resultType === 'pierce' || result.resultType === 'backfire') {
                effectiveHits = Math.ceil(totalHits * 0.6);
            }
        } else if (result.winner === 'A') {
            if (result.resultType === 'neutralize') {
                effectiveHits = Math.ceil(totalHits * 0.4);
            } else {
                effectiveHits = 1;
            }
        } else {
            effectiveHits = Math.ceil(totalHits * 0.4);
        }
        
        result.multiHitInfoB = { totalHits, effectiveHits };
        console.log(`[CLASH] 多段攻击B: ${totalHits}段 → ${effectiveHits}段有效`);
    }
    
    // 生成日志
    result.logs = generateClashLogs(result, moveA, moveB, userA, userB);
    
    return result;
}

/**
 * 生成对冲日志
 */
function generateClashLogs(result, moveA, moveB, userA, userB) {
    const logs = [];
    const messages = CLASH_MESSAGES[result.resultType] || CLASH_MESSAGES.neutralize;
    const template = messages[Math.floor(Math.random() * messages.length)];
    
    const winnerName = result.winner === 'A' ? userA.cnName : (result.winner === 'B' ? userB.cnName : null);
    const loserName = result.loser === 'A' ? userA.cnName : (result.loser === 'B' ? userB.cnName : null);
    const winnerMove = result.winner === 'A' ? (moveA.cn || moveA.name) : (result.winner === 'B' ? (moveB.cn || moveB.name) : null);
    
    let message = template
        .replace('{winner}', winnerName || '')
        .replace('{loser}', loserName || '')
        .replace('{move}', winnerMove || '');
    
    // 添加 CP 信息（包含技能名称）
    const moveNameA = moveA.cn || moveA.name || '???';
    const moveNameB = moveB.cn || moveB.name || '???';
    logs.push(`<b style="color:#f59e0b">⚔️ 对冲发生！</b>`);
    logs.push(`${userA.cnName} 的 <b>${moveNameA}</b> [${getClashTypeName(result.clashTypeA)}] CP:${result.cpA} vs ${userB.cnName} 的 <b>${moveNameB}</b> [${getClashTypeName(result.clashTypeB)}] CP:${result.cpB}`);
    
    // 【新增】显示伤害削减信息
    if (result.resultType === 'neutralize' && result.damageMultiplierA > 0 && result.damageMultiplierB > 0) {
        // 势均力敌：双方都造成削减伤害
        const dmgPctA = Math.round(result.damageMultiplierA * 100);
        const dmgPctB = Math.round(result.damageMultiplierB * 100);
        logs.push(`<span style="color:#f59e0b">双方势均力敌！${userA.cnName} 威力削减至 ${dmgPctA}%，${userB.cnName} 威力削减至 ${dmgPctB}%</span>`);
    } else {
        logs.push(`<span style="color:#ef4444">${message}</span>`);
        // 【修复】显示非零伤害削减（backfire/pierce 等有削减的情况）
        if (result.damageMultiplierA > 0 && result.damageMultiplierA < 1) {
            const dmgPctA = Math.round(result.damageMultiplierA * 100);
            logs.push(`<span style="color:#22c55e">${userA.cnName} 的攻击威力削减至 ${dmgPctA}%</span>`);
        }
        if (result.damageMultiplierB > 0 && result.damageMultiplierB < 1) {
            const dmgPctB = Math.round(result.damageMultiplierB * 100);
            logs.push(`<span style="color:#22c55e">${userB.cnName} 的攻击威力削减至 ${dmgPctB}%</span>`);
        }
    }
    
    // 【Z招式/极巨招式保底提示】
    if (result.isZMoveProtected) {
        logs.push(`<span style="color:#a855f7">💎 Z招式的力量无法被完全抵消！保留 30% 威力！</span>`);
    }
    if (result.isMaxMoveProtected) {
        logs.push(`<span style="color:#ec4899">🔥 极巨招式的力量无法被完全抵消！保留 20% 威力！</span>`);
    }
    
    // 【多段攻击有效段数提示】
    if (result.multiHitInfoA) {
        const { totalHits, effectiveHits } = result.multiHitInfoA;
        if (effectiveHits < totalHits) {
            logs.push(`<span style="color:#06b6d4">${userA.cnName} 的多段攻击：${totalHits}段中有 ${effectiveHits}段 穿透了对冲！</span>`);
        }
    }
    if (result.multiHitInfoB) {
        const { totalHits, effectiveHits } = result.multiHitInfoB;
        if (effectiveHits < totalHits) {
            logs.push(`<span style="color:#06b6d4">${userB.cnName} 的多段攻击：${totalHits}段中有 ${effectiveHits}段 穿透了对冲！</span>`);
        }
    }
    
    return logs;
}

// ============================================
// 核心函数：对冲条件检查
// ============================================

/**
 * 检查招式是否可以参与对冲
 * @param {Object} move - 招式对象
 * @returns {{ canClash: boolean, reason: string }}
 */
function canClash(move) {
    if (!move) return { canClash: false, reason: '无效招式' };
    
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    const flags = move.flags || fullMoveData.flags || {};
    
    // =====================================================
    // === 【不可对冲黑名单】Hard Logic ===
    // =====================================================
    
    // 1. 变化技不能对冲（没有弹道）
    const category = fullMoveData.category || move.category || 'Physical';
    if (category === 'Status') {
        return { canClash: false, reason: '变化技无法对冲' };
    }
    
    // 2. 威力为 0 的招式不能对冲
    const basePower = move.basePower || move.power || fullMoveData.basePower || 0;
    if (basePower === 0) {
        return { canClash: false, reason: '无威力招式无法对冲' };
    }
    
    // 3. 声音类招式不能对冲（波动/声音，无实体）
    if (flags.sound) {
        return { canClash: false, reason: '声音类招式无法对冲' };
    }
    
    // 4. 粉末类招式不能对冲（无形物质）
    if (flags.powder) {
        return { canClash: false, reason: '粉末类招式无法对冲' };
    }
    
    // 5. 场地/环境类招式不能对冲（地震等，力量来自脚下）
    // 使用 WAVE_OVERRIDE 列表或 nonsky flag
    if (WAVE_OVERRIDE.includes(moveId)) {
        return { canClash: false, reason: '场地类招式无法对冲' };
    }
    
    // 6. 守住类招式不能对冲
    const protectMoves = ['protect', 'detect', 'kingsshield', 'spikyshield', 'banefulbunker', 'obstruct', 'silktrap', 'burningbulwark'];
    if (protectMoves.includes(moveId)) {
        return { canClash: false, reason: '防护类招式无法对冲' };
    }
    
    // =====================================================
    // === 【不可对冲黑名单】Soft Logic ===
    // =====================================================
    
    // 7. 必中招式不能被对冲（概念类战技）
    // 注意：这里只检查攻击方招式是否必中，必中招式可以主动对冲别人
    // 但在 canTriggerClash 中会检查防守方招式是否必中
    
    // 8. 异次元潜袭类（从异次元钻出）
    const phasingMoves = ['phantomforce', 'shadowforce', 'hyperspacefury', 'hyperspacehole'];
    if (phasingMoves.includes(moveId)) {
        return { canClash: false, reason: '异次元类招式无法对冲' };
    }
    
    // 9. 精神/念力类（直接作用于精神，无弹道）
    const mentalMoves = ['psychic', 'psyshock', 'dreameater', 'hex', 'nightshade', 'seismictoss', 'counter', 'mirrorcoat'];
    if (mentalMoves.includes(moveId)) {
        return { canClash: false, reason: '精神类招式无法对冲' };
    }
    
    return { canClash: true, reason: '可以对冲' };
}

/**
 * 检查是否满足对冲触发条件（放宽版本）
 * @param {Object} attacker - 攻击方
 * @param {Object} defender - 防守方
 * @param {Object} attackerMove - 攻击方招式
 * @param {Object} defenderMove - 防守方招式
 * @param {Object} options - { requireSpeedDisadvantage: boolean }
 * @returns {Object} { canTrigger, reason }
 */
function canTriggerClash(attacker, defender, attackerMove, defenderMove, options = {}) {
    // 基础检查：使用新的 canClash 返回格式
    const attackerClashCheck = canClash(attackerMove);
    if (!attackerClashCheck.canClash) {
        return { canTrigger: false, reason: `我方招式: ${attackerClashCheck.reason}` };
    }
    
    const defenderClashCheck = canClash(defenderMove);
    if (!defenderClashCheck.canClash) {
        return { canTrigger: false, reason: `对方招式: ${defenderClashCheck.reason}` };
    }
    
    // 对方招式必须是"非必中"的攻击技能（必中招式无法被拦截）
    const defenderMoveId = (defenderMove.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const defenderMoveData = (typeof MOVES !== 'undefined' && MOVES[defenderMoveId]) ? MOVES[defenderMoveId] : {};
    
    if (defenderMoveData.accuracy === true || defenderMove.accuracy === true) {
        return { canTrigger: false, reason: '对方招式必中，无法对冲' };
    }
    
    return { canTrigger: true, reason: '满足对冲条件' };
}

/**
 * 检查对冲是否成功触发（概率检查）
 * 基于训练家熟练度，最高 255 = 75% 触发率
 * @param {number} proficiency - 训练家熟练度 (0-255)
 * @returns {{ success: boolean, roll: number, chance: number }}
 */
function rollClashTrigger(proficiency = 0) {
    // 概率公式：chance = proficiency / 340
    // 满熟练度 255 时约 75% 触发率
    // 0 熟练度时 0% 触发率（新手无法触发对冲）
    const clampedProf = Math.min(255, Math.max(0, proficiency));
    const triggerChance = clampedProf / 340;
    const roll = Math.random();
    
    const success = roll < triggerChance;
    console.log(`[CLASH] 触发判定: roll=${roll.toFixed(3)} vs chance=${triggerChance.toFixed(3)} (熟练度=${clampedProf}) => ${success ? '成功' : '失败'}`);
    
    return { success, roll, chance: triggerChance };
}

/**
 * 计算速度修正系数（双向）
 * 先手方有速度加成（招式已经打出去了）
 * 后手方有速度惩罚（对冲效果削弱）
 * @param {Object} slower - 后手方（发起对冲的一方）
 * @param {Object} faster - 先手方（被对冲的一方）
 * @returns {{ slowerModifier: number, fasterModifier: number, speedRatio: number }}
 */
function getSpeedModifiers(slower, faster) {
    const slowerSpeed = (typeof slower.getStat === 'function') ? slower.getStat('spe') : (slower.spe || 100);
    const fasterSpeed = (typeof faster.getStat === 'function') ? faster.getStat('spe') : (faster.spe || 100);
    
    // 速度比例：后手/先手
    const speedRatio = slowerSpeed / fasterSpeed;
    
    // 后手方修正：速度越慢，对冲效果越差
    // speedRatio = 0.5 时，修正 = 0.75（对冲伤害削减 25%）
    // speedRatio = 0.7 时，修正 = 0.85（对冲伤害削减 15%）
    // speedRatio = 1.0 时，修正 = 1.0（无削减）
    const slowerModifier = Math.min(1.0, 0.5 + speedRatio * 0.5);
    
    // 先手方修正：速度越快，招式威力越强
    // speedRatio = 0.5 时（先手是后手的2倍速），加成 = 1.25
    // speedRatio = 0.7 时，加成 = 1.15
    // speedRatio = 1.0 时，加成 = 1.0（无加成）
    const fasterModifier = Math.min(1.3, 1.0 + (1 - speedRatio) * 0.5);
    
    console.log(`[CLASH] 速度修正计算: 后手${slowerSpeed} vs 先手${fasterSpeed}, ratio=${speedRatio.toFixed(2)}`);
    console.log(`[CLASH] 后手修正=${slowerModifier.toFixed(2)}, 先手修正=${fasterModifier.toFixed(2)}`);
    
    return { slowerModifier, fasterModifier, speedRatio };
}

// 保留旧函数以兼容
function getSpeedModifier(attacker, defender) {
    const result = getSpeedModifiers(attacker, defender);
    return result.slowerModifier;
}

// ============================================
// 核心函数：杀意感知 (Insight Check)
// ============================================

/**
 * 预计算意图 (杀意感知)
 * @param {Object} attacker - 攻击方 (速度快的一方)
 * @param {Object} defender - 防守方 (速度慢的一方)
 * @param {Object} move - 攻击方招式
 * @returns {Object} { success, level, message, moveType, moveCategory }
 */
function preCalculateIntent(attacker, defender, move) {
    if (!attacker || !defender || !move) {
        return { success: false, level: 0, message: null };
    }
    
    // 获取防守方的 Insight AVs（不再限制 isAce）
    let insightValue = 0;
    if (defender.avs && typeof defender.getEffectiveAVs === 'function') {
        insightValue = defender.getEffectiveAVs('insight');
    } else if (defender.avs?.insight) {
        insightValue = defender.avs.insight;
    }
    
    // 获取训练家熟练度
    const proficiency = (typeof battle !== 'undefined' && battle.trainerProficiency) 
        ? battle.trainerProficiency 
        : 0;
    
    // 【新公式】结合 Insight AVS 和 trainerProficiency，封顶 30%
    // 基础概率 = (Insight / 255) * 15% + (Proficiency / 255) * 15%
    // 满值时：15% + 15% = 30%
    const insightContrib = (Math.min(insightValue, 255) / 255) * 0.15;
    const profContrib = (Math.min(proficiency, 255) / 255) * 0.15;
    const successRate = Math.min(0.30, insightContrib + profContrib);
    
    // 根据 Insight 值决定信息等级
    let level = 0;
    if (insightValue >= INSIGHT_THRESHOLDS.FULL) {
        level = 4; // 完整信息（知道具体招式名）
    } else if (insightValue >= INSIGHT_THRESHOLDS.CATEGORY) {
        level = 3; // 属性 + 分类
    } else if (insightValue >= INSIGHT_THRESHOLDS.TYPE) {
        level = 2; // 仅属性
    } else if (insightValue >= INSIGHT_THRESHOLDS.BASIC) {
        level = 1; // 仅意图
    } else {
        // Insight 太低，无法感知
        return { success: false, level: 0, message: null };
    }
    
    console.log(`[INSIGHT] 触发判定: Insight=${insightValue}, Prof=${proficiency}, Rate=${(successRate * 100).toFixed(1)}%, Level=${level}`);
    
    const success = Math.random() < successRate;
    
    if (!success) {
        return { success: false, level: 0, message: null };
    }
    
    // 生成感知信息
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    const moveType = move.type || fullMoveData.type || 'Normal';
    const moveCategory = fullMoveData.category || move.category || 'Physical';
    const moveCn = move.cn || move.name || '未知招式';
    
    let message = '';
    switch (level) {
        case 4:
            message = `直觉告诉你，对方准备使用【${moveCn}】！`;
            break;
        case 3:
            message = `直觉告诉你，一股${moveType}系的${moveCategory === 'Physical' ? '物理' : '特殊'}能量正在汇聚...`;
            break;
        case 2:
            message = `直觉告诉你，一股${moveType}系的能量正在汇聚...`;
            break;
        case 1:
            message = `直觉告诉你，对方正在准备攻击...`;
            break;
    }
    
    return {
        success: true,
        level,
        message,
        moveType,
        moveCategory,
        insightValue,
        successRate: Math.round(successRate * 100)
    };
}

// ============================================
// UI 辅助函数
// ============================================

/**
 * 显示杀意感知警告
 * @param {Object} insightResult - preCalculateIntent 的返回值
 */
function showInsightWarning(insightResult) {
    if (!insightResult || !insightResult.success) return;
    
    // 创建或获取 Insight 警告元素
    let warningEl = document.getElementById('insight-warning');
    if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.id = 'insight-warning';
        warningEl.className = 'insight-warning';
        
        // 插入到战斗区域
        const battleStage = document.querySelector('.battle-stage');
        if (battleStage) {
            battleStage.appendChild(warningEl);
        }
    }
    
    // 设置内容
    warningEl.innerHTML = `
        <div class="insight-icon">🔴</div>
        <div class="insight-text">${insightResult.message}</div>
    `;
    
    // 显示动画
    warningEl.classList.add('active');
    
    // 3秒后隐藏
    setTimeout(() => {
        warningEl.classList.remove('active');
    }, 3000);
}

/**
 * 显示对冲选项
 * @param {Object} playerMove - 玩家招式
 * @param {Object} enemyMove - 敌方招式 (可能是预判的)
 * @returns {Promise<string>} 'clash' | 'normal'
 */
function showClashOption(playerMove, enemyMove) {
    return new Promise((resolve) => {
        // 创建对冲选项 UI
        let clashModal = document.getElementById('clash-option-modal');
        if (!clashModal) {
            clashModal = document.createElement('div');
            clashModal.id = 'clash-option-modal';
            clashModal.className = 'clash-option-modal';
            // 添加到 .ui-scale 内部，确保在 .screen-filters 的层叠上下文中
            const uiScale = document.getElementById('ui-scale') || document.body;
            uiScale.appendChild(clashModal);
        }
        
        const playerClashType = getClashType(playerMove);
        const enemyClashType = enemyMove ? getClashType(enemyMove) : null;

        // 1. 定义两个矢量 SVG 图标 (保证高清无锯齿，不要用 Emoji)
        const iconClashAction = `
<svg width="28" height="32" viewBox="0 0 64 80" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M46.85449,37.19678l9.33106-3.73242a.49983.49983,0,0,0-.09619-.95606L45.98047,30.66992l10.38818-11.332a.50008.50008,0,0,0-.60547-.77832L43.87305,24.96191,47.47412,14.1582a.49989.49989,0,0,0-.82764-.51172l-9.27734,9.27686L35.49609,7.938a.49945.49945,0,0,0-.44677-.43555.50692.50692,0,0,0-.52344.33936L29.79541,22.03174,20.37012,11.66357a.50019.50019,0,0,0-.85742.44873l2.82617,12.24561-9.24073-1.84814a.5.5,0,0,0-.4746.81933l6.40966,7.3252L7.918,32.50684a.4998.4998,0,0,0-.08887.96289L18.05127,37.187,7.66357,46.62988a.5.5,0,0,0,.5044.84082l12.90137-4.60742L17.543,50.79688a.50017.50017,0,0,0,.76953.59375l9.37891-7.50342L30.5127,56.1123a.49925.49925,0,0,0,.45214.38624L31,56.5a.50064.50064,0,0,0,.4668-.32031l4.72363-12.28223,5.456,5.45606A.5.5,0,0,0,42.5,49V42.7583l13.30322,5.70117a.5.5,0,0,0,.5669-.7959Z"/>
</svg>`;

        const iconHoldAction = `
<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10" />
  <polyline points="12 6 12 12 16 14" />
</svg>`;

        const headerIcon = `
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
</svg>`;
        
        // 2. 只有内部结构的 HTML
        clashModal.innerHTML = `
            <div class="clash-card-core">
                <!-- 黑色切割顶栏 -->
                <div class="clash-header-bar">
                    <span class="header-deco">${headerIcon}</span>
                    <span class="header-title">CLASH OPPORTUNITY</span>
                    <span class="header-sub">对冲判定</span>
                </div>
              
                <!-- 内容区域 -->
                <div class="clash-body-grid">
                    <!-- Left (You) -->
                    <div class="unit-group p1-side">
                        <div class="unit-role-lbl">YOUR ACTION</div>
                        <div class="unit-main-name">${playerMove.cn || playerMove.name}</div>
                        <div class="unit-divider p1-divider"></div>
                        <div class="unit-badge tier-1">${getClashTypeName(playerClashType)}</div>
                    </div>

                    <!-- VS Central Divider -->
                    <div class="vs-divider-shape">
                        <div class="vs-shockwave"></div>
                        <div class="vs-text">VS</div>
                    </div>

                    <!-- Right (Enemy) -->
                    <div class="unit-group p2-side">
                        <div class="unit-role-lbl">INCOMING</div>
                        <div class="unit-main-name">${enemyMove ? (enemyMove.cn || enemyMove.name) : 'PREDICTING...'}</div>
                        <div class="unit-divider p2-divider"></div>
                        <div class="unit-badge tier-2">${enemyMove ? getClashTypeName(enemyClashType) : '???'}</div>
                    </div>
                </div>

                <!-- 底部无缝按钮区 -->
                <div class="clash-action-deck">
                    <button id="btn-clash-yes" class="deck-btn primary is-skew">
                        <div class="btn-inner-unskew">
                            <span class="btn-msg">CLASH</span>
                            <span class="btn-sub-msg">强制拦截</span>
                            <div class="btn-floating-icon">${iconClashAction}</div>
                        </div>
                        <div class="btn-shine"></div>
                    </button>
                    <button id="btn-clash-no" class="deck-btn secondary is-skew">
                        <div class="btn-inner-unskew">
                            <div class="btn-floating-icon right">${iconHoldAction}</div>
                            <span class="btn-msg">PASS</span>
                            <span class="btn-sub-msg">放弃对冲</span>
                        </div>
                    </button>
                </div>
            </div>
        `;
        
        // 强制重排以触发动画
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                clashModal.classList.add('active');
            });
        });
        
        // 绑定事件
        document.getElementById('btn-clash-yes').onclick = () => {
            // 播放重击音效
            if (typeof playSFX === 'function') {
                playSFX('HIT_SUPER');
            }
            clashModal.classList.remove('active');
            setTimeout(() => resolve('clash'), 200);
        };
        
        document.getElementById('btn-clash-no').onclick = () => {
            clashModal.classList.remove('active');
            setTimeout(() => resolve('normal'), 200);
        };
        
    });
}

/**
 * 更新 Insight Bar UI
 * @param {Object} pokemon - 当前宝可梦
 */
function updateInsightBar(pokemon) {
    const insightBar = document.getElementById('insight-bar');
    if (!insightBar) return;
    
    const insightValue = (pokemon && pokemon.isAce && pokemon.avs && typeof pokemon.getEffectiveAVs === 'function')
        ? pokemon.getEffectiveAVs('insight')
        : 0;
    
    const percentage = Math.min(100, (insightValue / 255) * 100);
    
    const fill = insightBar.querySelector('.insight-bar-fill');
    if (fill) {
        fill.style.width = `${percentage}%`;
    }
    
    const text = insightBar.querySelector('.insight-bar-text');
    if (text) {
        text.textContent = `直觉: ${insightValue}`;
    }
}

// ============================================
// AI 对冲决策
// ============================================

/**
 * AI 决定是否发起对冲（敌方后手时调用）
 * @param {Object} enemy - 敌方宝可梦
 * @param {Object} player - 玩家宝可梦
 * @param {Object} enemyMove - 敌方招式
 * @param {Object} playerMove - 玩家招式
 * @returns {Object} { shouldClash: boolean, reason: string }
 */
function aiDecideClash(enemy, player, enemyMove, playerMove) {
    // 基础检查：使用新的 canClash 返回格式
    const enemyClashCheck = canClash(enemyMove);
    if (!enemyClashCheck.canClash) {
        return { shouldClash: false, reason: `AI 放弃对冲 (敌方招式: ${enemyClashCheck.reason})` };
    }
    
    const playerClashCheck = canClash(playerMove);
    if (!playerClashCheck.canClash) {
        return { shouldClash: false, reason: `AI 放弃对冲 (玩家招式: ${playerClashCheck.reason})` };
    }
    
    // 玩家招式必中则无法对冲
    const playerMoveId = (playerMove.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const playerMoveData = (typeof MOVES !== 'undefined' && MOVES[playerMoveId]) ? MOVES[playerMoveId] : {};
    if (playerMoveData.accuracy === true || playerMove.accuracy === true) {
        return { shouldClash: false, reason: 'AI 放弃对冲 (玩家招式必中)' };
    }
    
    // 计算双方 Clash Power
    const enemyCP = calculateClashPower(enemy, enemyMove, player, playerMove);
    const playerCP = calculateClashPower(player, playerMove, enemy, enemyMove);
    
    const cpRatio = enemyCP.cp / (playerCP.cp || 1);
    
    // 获取 Clash Type 交互
    const enemyClashType = getClashType(enemyMove);
    const playerClashType = getClashType(playerMove);
    const interaction = getClashInteraction(enemyClashType, playerClashType);
    
    // === AI 决策因素 ===
    let clashScore = 0;
    
    // 1. CP 优势加分
    if (cpRatio >= 2.0) {
        clashScore += 60; // 碾压优势
    } else if (cpRatio >= 1.5) {
        clashScore += 40; // 明显优势
    } else if (cpRatio >= 1.2) {
        clashScore += 20; // 轻微优势
    } else if (cpRatio >= 0.8) {
        clashScore += 0; // 势均力敌
    } else if (cpRatio >= 0.5) {
        clashScore -= 10; // 轻微劣势
    } else {
        clashScore -= 20; // 明显劣势
    }
    
    // 2. Clash Type 优势加分
    if (interaction.advantage >= 0.5) {
        clashScore += 20; // 类型优势
    } else if (interaction.advantage <= -0.5) {
        clashScore -= 20; // 类型劣势
    }
    
    // 3. 【关键】生存压力：血线时必须对冲！
    const enemyHp = enemy.currHp || 0;
    const enemyMaxHp = enemy.maxHp || enemy.hp || 100;
    const hpPercent = enemyHp / enemyMaxHp;
    
    // 血线判定：HP < 30% 时大幅增加对冲倾向
    if (hpPercent <= 0.30) {
        clashScore += 80; // 血线时强烈倾向对冲，这是最后的机会
        console.log(`[AI CLASH] 血线压力: HP ${Math.round(hpPercent * 100)}% <= 30%，+80分`);
    } else if (hpPercent <= 0.50) {
        clashScore += 40; // 半血时也增加对冲倾向
        console.log(`[AI CLASH] 半血压力: HP ${Math.round(hpPercent * 100)}% <= 50%，+40分`);
    }
    
    // 预估伤害检查：如果不对冲会被秒杀
    const playerMoveBasePower = playerMove.basePower || playerMoveData.basePower || 0;
    const estimatedDamage = Math.floor(playerMoveBasePower * 2); // 粗略估算
    
    if (estimatedDamage >= enemyHp) {
        clashScore += 50; // 会被秒杀，对冲是唯一生路
        console.log(`[AI CLASH] 秒杀压力: 预估伤害 ${estimatedDamage} >= HP ${enemyHp}，+50分`);
    }
    
    // 4. 随机因素（增加不可预测性）
    const randomFactor = Math.random() * 20 - 10; // -10 ~ +10
    clashScore += randomFactor;
    
    console.log(`[AI CLASH] 决策评分: ${Math.round(clashScore)} (CP比=${cpRatio.toFixed(2)}, 类型优势=${interaction.advantage}, HP=${Math.round(hpPercent * 100)}%)`);
    
    // 阈值：评分 >= 20 则对冲（降低阈值，让对冲更容易触发）
    const shouldClash = clashScore >= 20;
    
    return {
        shouldClash,
        reason: shouldClash 
            ? `AI 决定对冲 (评分: ${Math.round(clashScore)})` 
            : `AI 放弃对冲 (评分: ${Math.round(clashScore)})`,
        score: clashScore,
        cpRatio,
        enemyClashType,
        playerClashType
    };
}

// ============================================
// 导出
// ============================================

if (typeof window !== 'undefined') {
    // 常量
    window.CLASH_TYPE = CLASH_TYPE;
    
    // 核心函数
    window.getClashType = getClashType;
    window.getClashTypeName = getClashTypeName;
    window.getClashInteraction = getClashInteraction;
    window.getTypeClashModifier = getTypeClashModifier;
    window.calculateClashPower = calculateClashPower;
    window.resolveClash = resolveClash;
    window.canClash = canClash;
    window.canTriggerClash = canTriggerClash;
    window.preCalculateIntent = preCalculateIntent;
    window.rollClashTrigger = rollClashTrigger;
    window.getSpeedModifier = getSpeedModifier;
    window.getSpeedModifiers = getSpeedModifiers;
    
    // AI 函数
    window.aiDecideClash = aiDecideClash;
    
    // UI 函数
    window.showInsightWarning = showInsightWarning;
    window.showClashOption = showClashOption;
    window.updateInsightBar = updateInsightBar;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CLASH_TYPE,
        getClashType,
        getClashTypeName,
        getClashInteraction,
        getTypeClashModifier,
        calculateClashPower,
        resolveClash,
        canClash,
        canTriggerClash,
        preCalculateIntent
    };
}

console.log('[CLASH SYSTEM] 对冲系统已加载');
