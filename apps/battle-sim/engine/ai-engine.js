/**
 * =============================================
 * AI ENGINE - 宝可梦战斗 AI 系统
 * =============================================
 * 
 * 四个难度等级：
 * - easy: 随机选择，偶尔选最优
 * - normal: 60% 最优，30% 次优，10% 随机
 * - hard: 总是选择当前最优技能
 * - expert: 大局观 AI，会换人、预判、斩杀计算
 * 
 * v2.0 高级轮转 AI 特性：
 * - 折返技能战术评分 (U-turn, Volt Switch 等)
 * - 战略性换人 (清除负面状态/能力下降)
 * - 风险评估 (脆皮输出手更惜命)
 * - 简易读换 (预测玩家必死换人)
 */

const AI_DIFFICULTY = {
    EASY: 'easy',
    NORMAL: 'normal', 
    HARD: 'hard',
    EXPERT: 'expert'
};

/**
 * AI 决策结果类型
 */
const AI_ACTION_TYPE = {
    MOVE: 'move',
    SWITCH: 'switch'
};

// =============================================
// AI 特性评估配置（软编码，数据驱动）
// =============================================
// type: 防御机制类型
//   - consumable_shield: 一次性护盾（画皮、冰砌鹅）
//   - damage_reduction: 满血减伤（多重鳞片、幻影防守）
//   - endure_lethal: 满血保命（结实）
//   - immunity_conditional: 条件免疫（蓄水、避雷针等）
// breakValue: 打破护盾的战术价值
// condition: 触发条件（physical/special/full_hp）
// bustedFlag: 检测护盾是否已破损的属性名
const AI_ABILITY_TRAITS = {
    // 一次性护盾
    'Disguise':      { type: 'consumable_shield', breakValue: 350, bustedFlag: 'disguiseBusted' },
    'Ice Face':      { type: 'consumable_shield', breakValue: 300, condition: 'physical', bustedFlag: 'iceFaceBroken' },
    
    // 满血减伤
    'Multiscale':    { type: 'damage_reduction', breakValue: 150, condition: 'full_hp' },
    'Shadow Shield': { type: 'damage_reduction', breakValue: 150, condition: 'full_hp' },
    
    // 满血保命
    'Sturdy':        { type: 'endure_lethal', breakValue: 200, condition: 'full_hp' },
    
    // 条件免疫（这些不需要特殊处理，正常伤害计算会返回0）
    'Wonder Guard':  { type: 'immunity_conditional', note: 'only_supereffective' },
    'Levitate':      { type: 'immunity_conditional', note: 'ground_immune' },
    'Volt Absorb':   { type: 'immunity_conditional', note: 'electric_immune' },
    'Water Absorb':  { type: 'immunity_conditional', note: 'water_immune' },
    'Flash Fire':    { type: 'immunity_conditional', note: 'fire_immune' },
};

// 反强化技能列表（面对高威胁时优先使用）
const AI_COUNTER_MOVES = ['Haze', 'Clear Smog', 'Roar', 'Whirlwind', 'Dragon Tail', 'Circle Throw', 'Topsy-Turvy', 'Spectral Thief'];

/**
 * 获取 AI 决策（统一入口）
 * @param {Pokemon} aiPoke - AI 当前宝可梦
 * @param {Pokemon} playerPoke - 玩家当前宝可梦
 * @param {string} difficulty - 难度等级
 * @param {Pokemon[]} aiParty - AI 队伍（用于换人决策）
 * @param {object} battleContext - 战斗上下文（回合数、已用 Mega 等）
 * @returns {object} { type: 'move'|'switch', move?: Move, index?: number, reasoning?: string }
 */
export function getAiAction(aiPoke, playerPoke, difficulty = 'hard', aiParty = [], battleContext = {}) {
    if (!aiPoke || !playerPoke) return null;
    
    // 【蓄力技能锁定】检查 AI 是否正在蓄力
    if (aiPoke.volatile?.chargingMove) {
        const chargingMove = aiPoke.volatile.chargingMove;
        const moveToUse = aiPoke.moves?.find(m => m.name === chargingMove);
        if (moveToUse) {
            console.log(`[AI CHARGE] ${aiPoke.cnName} 正在蓄力 ${chargingMove}，强制执行`);
            return { type: AI_ACTION_TYPE.MOVE, move: moveToUse, forced: true };
        }
    }
    
    const normalizedDiff = (difficulty || 'hard').toLowerCase();
    
    switch (normalizedDiff) {
        case 'expert':
            return getExpertAiAction(aiPoke, playerPoke, aiParty, battleContext);
        case 'hard': {
            // 【v2.1】Hard 难度也支持风格选择
            const hardMove = getHardAiMove(aiPoke, playerPoke, aiParty);
            let chosenStyle = null;
            if (hardMove) {
                const mergedMove = getMergedMoveData(hardMove);
                chosenStyle = tryOptimizeStyle(aiPoke, playerPoke, mergedMove);
            }
            return { type: AI_ACTION_TYPE.MOVE, move: hardMove, style: chosenStyle };
        }
        case 'normal': {
            // 【v2.1】Normal 难度也支持风格选择（概率较低）
            const normalMove = getNormalAiMove(aiPoke, playerPoke, aiParty);
            let chosenStyle = null;
            if (normalMove && Math.random() < 0.5) { // 50% 概率尝试风格
                const mergedMove = getMergedMoveData(normalMove);
                chosenStyle = tryOptimizeStyle(aiPoke, playerPoke, mergedMove);
            }
            return { type: AI_ACTION_TYPE.MOVE, move: normalMove, style: chosenStyle };
        }
        case 'easy':
        default:
            return { type: AI_ACTION_TYPE.MOVE, move: getEasyAiMove(aiPoke, playerPoke, aiParty) };
    }
}

/* =============================================================
 *  基础 AI：Easy 难度
 *  80% 随机选择，20% 选最优
 * ============================================================= */
export function getEasyAiMove(attacker, defender, aiParty = null) {
    if (!attacker?.moves || attacker.moves.length === 0) return null;
    
    // 【修复】过滤掉首回合限制招式（非首回合时）
    const firstTurnOnlyMoves = ['Fake Out', 'First Impression', 'Mat Block'];
    const isFirstTurn = (attacker.turnsOnField || 0) === 0;
    const availableMoves = isFirstTurn 
        ? attacker.moves 
        : attacker.moves.filter(m => !firstTurnOnlyMoves.includes(m.name));
    
    // 如果过滤后没有招式了，回退到原始招式列表
    const movesToUse = availableMoves.length > 0 ? availableMoves : attacker.moves;
    
    // 80% 概率随机选
    if (Math.random() < 0.8) {
        return movesToUse[Math.floor(Math.random() * movesToUse.length)];
    }
    
    // 20% 概率选最优
    const rankedMoves = rankMovesByScore(attacker, defender, aiParty);
    if (rankedMoves.length === 0) return movesToUse[0];
    
    // 过滤掉必定失败的招式
    const viableMoves = rankedMoves.filter(m => m.score > -9000);
    if (viableMoves.length === 0) return movesToUse[0];
    
    // 但即使选最优，也可能选次优
    if (viableMoves.length > 1 && Math.random() < 0.5) {
        return viableMoves[1].move;
    }
    return viableMoves[0].move;
}

/* =============================================================
 *  普通 AI：Normal 难度
 *  60% 最优，30% 次优，10% 第三优或随机
 * ============================================================= */
export function getNormalAiMove(attacker, defender, aiParty = null) {
    if (!attacker?.moves || attacker.moves.length === 0) return null;
    
    const rankedMoves = rankMovesByScore(attacker, defender, aiParty);
    if (rankedMoves.length === 0) return attacker.moves[0];
    
    // 【修复】过滤掉必定失败的招式（得分 <= -9000）
    const viableMoves = rankedMoves.filter(m => m.score > -9000);
    
    // 如果所有招式都被禁用，选择得分最高的那个（最不坏的）
    if (viableMoves.length === 0) {
        // 【关键修复】不要随机选，选得分最高的（即使是负分）
        console.log(`[AI FALLBACK] 所有招式都被禁用，选择得分最高的: ${rankedMoves[0]?.move?.name} (${rankedMoves[0]?.score})`);
        return rankedMoves[0].move;
    }
    
    const roll = Math.random();
    if (roll < 0.6 || viableMoves.length === 1) {
        return viableMoves[0].move;
    }
    if (roll < 0.9 && viableMoves.length > 1) {
        return viableMoves[1].move;
    }
    return viableMoves[Math.min(2, viableMoves.length - 1)].move;
}

/* =============================================================
 *  困难 AI：Hard 难度
 *  总是选择当前评分最高的技能
 * ============================================================= */
export function getHardAiMove(attacker, defender, aiParty = null) {
    if (!attacker?.moves || attacker.moves.length === 0) return null;
    
    const rankedMoves = rankMovesByScore(attacker, defender, aiParty);
    if (rankedMoves.length === 0) return attacker.moves[0];
    
    // 【修复】过滤掉必定失败的招式（得分 <= -9000）
    const viableMoves = rankedMoves.filter(m => m.score > -9000);
    
    // 如果所有招式都被禁用，选择得分最高的那个（最不坏的）
    if (viableMoves.length === 0) {
        // 【关键修复】不要随机选，选得分最高的（即使是负分）
        console.log(`[AI FALLBACK] 所有招式都被禁用，选择得分最高的: ${rankedMoves[0]?.move?.name} (${rankedMoves[0]?.score})`);
        return rankedMoves[0].move;
    }
    
    // 【修复】极巨化时，如果最高分招式是免疫的攻击招式（-9999），优先选择 Max Guard
    // Max Guard 是变化技转换的极巨招式，至少能保护自己
    if (attacker.isDynamaxed && rankedMoves[0].score <= -9000) {
        // 找到 Max Guard（变化技转换的极巨招式）
        const maxGuard = rankedMoves.find(r => r.move.name === 'Max Guard');
        if (maxGuard) {
            console.log(`[AI FIX] 极巨化状态下所有攻击招式对目标免疫，选择 Max Guard`);
            return maxGuard.move;
        }
        // 如果没有 Max Guard，选择评分最高的非攻击招式
        const nonAttack = rankedMoves.find(r => r.score > -9000);
        if (nonAttack) {
            console.log(`[AI FIX] 极巨化状态下攻击招式免疫，选择: ${nonAttack.move.name}`);
            return nonAttack.move;
        }
    }
    
    return rankedMoves[0].move;
}

// 换人冷却追踪（防止连续换人）
let lastSwitchTurn = -999;

// 折返技能列表 (后备，优先使用 moves-data.js 的 selfSwitch 字段)
const PIVOT_MOVES_FALLBACK = ['U-turn', 'Volt Switch', 'Flip Turn', 'Parting Shot', 'Teleport', 'Baton Pass'];

/**
 * 检测招式是否为折返技能（使用后自动换人）
 * 优先使用 PS moves-data.js 的 selfSwitch 字段
 */
function isPivotMove(move) {
    const moveName = move.name || '';
    const moveId = moveName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 优先从 PS 数据库检查
    if (typeof MOVES !== 'undefined' && MOVES[moveId]) {
        const moveData = MOVES[moveId];
        // selfSwitch 可以是 true 或字符串（如 'copyvolatile', 'shedtail'）
        if (moveData.selfSwitch) return true;
    }
    
    // 后备硬编码
    return PIVOT_MOVES_FALLBACK.includes(moveName);
}

/**
 * =======================================================
 * [AI 补丁] 古武流派评估器 (Style Evaluator)
 * 提升 AI 使用 迅疾 (Agile) / 刚猛 (Strong) 的频率
 * =======================================================
 * @param {Pokemon} aiPoke - AI 当前宝可梦
 * @param {Pokemon} playerPoke - 玩家当前宝可梦
 * @param {object} baseMove - 基础招式
 * @returns {string|null} 'agile' | 'strong' | null
 */
/**
 * AI 风格优化 v3.1 - 平衡博弈模型
 * 
 * ⚡ 迅疾 (Agile): 优先度 +1，降低威力和命中
 *   - 场景A（速度快）: 威力 0.75x, 命中 0.9x
 *   - 场景B（速度慢）: 威力 0.50x, 命中 0.85x
 * 
 * 💪 刚猛 (Strong): 优先度 -1，提高威力
 *   - 场景A（速度慢）: 威力 1.3x, 命中 0.8x
 *   - 场景B（速度快）: 威力 1.3x, 命中不变（卖先手）
 */
function tryOptimizeStyle(aiPoke, playerPoke, baseMove) {
    // === 基础检查 ===
    const unlocks = (typeof battle !== 'undefined') ? battle.enemyUnlocks : {};
    if (unlocks && unlocks.enable_styles === false) return null;
    if (typeof battle !== 'undefined' && battle.enemyStyleCooldown > 0) {
        console.log(`[AI STYLE] 冷却中 (${battle.enemyStyleCooldown})`);
        return null;
    }
    
    // 变化技不使用风格
    const category = (baseMove.cat || baseMove.category || '').toLowerCase();
    if (category === 'status' || baseMove.power === 0) return null;
    
    // 先制技不需要迅疾
    const basePriority = baseMove.priority || 0;
    
    // === 获取战斗数据 ===
    const normalDmgResult = simulateDamage(aiPoke, playerPoke, baseMove);
    const normalDmg = normalDmgResult.damage;
    const targetHp = playerPoke.currHp;
    const targetMaxHp = playerPoke.maxHp;
    const myHp = aiPoke.currHp;
    const myMaxHp = aiPoke.maxHp;
    
    const mySpeed = getEffectiveSpeed(aiPoke);
    const targetSpeed = getEffectiveSpeed(playerPoke);
    const isTrickRoom = (typeof battle !== 'undefined') && battle.field && battle.field.trickRoom > 0;
    const isFaster = isTrickRoom ? (mySpeed < targetSpeed) : (mySpeed > targetSpeed);
    const isSlower = !isFaster;
    
    // 伤害计算
    const strongDmg = Math.floor(normalDmg * 1.30);
    const agileDmgFast = Math.floor(normalDmg * 0.75);
    const agileDmgSlow = Math.floor(normalDmg * 0.50);
    
    // 血量百分比
    const targetHpPct = targetHp / targetMaxHp;
    const myHpPct = myHp / myMaxHp;
    
    console.log(`[AI STYLE] 评估: ${baseMove.name}, 速度${isFaster ? '快' : '慢'} (${mySpeed} vs ${targetSpeed}), 对方${Math.floor(targetHpPct*100)}%血, 我${Math.floor(myHpPct*100)}%血`);
    
    // =========================================================
    // 💪 刚猛决策
    // =========================================================
    
    // 【场景1】斩杀线：普通打不死，刚猛能打死（100%触发）
    if (normalDmg < targetHp && strongDmg >= targetHp) {
        if (isFaster) {
            console.log(`[AI STYLE] 刚猛斩杀: ${baseMove.name} (${normalDmg} -> ${strongDmg})`);
            return 'strong';
        } else {
            // 速度慢时命中0.8x，但斩杀线值得赌
            console.log(`[AI STYLE] 刚猛冒险斩杀: ${baseMove.name} (${normalDmg} -> ${strongDmg}, 命中0.8x)`);
            return 'strong';
        }
    }
    
    // 【v3.3 移除场景2】速度快时卖先手太危险，如果对方能斩杀自己就是自杀
    // 只保留斩杀线场景
    
    // =========================================================
    // ⚡ 迅疾决策（先制技跳过）
    // 【v3.3】只在斩杀线时使用迅疾，不再有其他场景
    // =========================================================
    if (basePriority <= 0) {
        // 【唯一场景】速度慢 + 迅疾能斩杀 = 抢先收割
        if (isSlower && agileDmgSlow >= targetHp) {
            console.log(`[AI STYLE] 迅疾斩杀: ${baseMove.name} (${agileDmgSlow} >= ${targetHp})`);
            return 'agile';
        }
    }
    
    // =========================================================
    // 🎯 凝神决策 (Focus) - 必中风格
    // 【场景】低命中高威力技能 + 能斩杀 = 凝神确保命中
    // =========================================================
    const baseAcc = baseMove.accuracy;
    if (typeof baseAcc === 'number' && baseAcc < 85 && normalDmg >= targetHp) {
        // 低命中技能能斩杀时，使用凝神确保命中
        console.log(`[AI STYLE] 凝神斩杀: ${baseMove.name} (命中${baseAcc}% -> 必中)`);
        return 'focus';
    }
    
    // 默认不使用风格
    return null;
}

/* =============================================================
 *  专家 AI：Expert 难度
 *  大局观决策：斩杀计算 + 换人判断 + 状态博弈 + 高级轮转
 * ============================================================= */
export function getExpertAiAction(aiPoke, playerPoke, aiParty = [], battleContext = {}) {
    if (!aiPoke || !playerPoke) return null;
    if (!aiPoke.moves || aiPoke.moves.length === 0) return null;
    
    const turnCount = battleContext.turnCount || 1;
    
    // ========================================
    // 阶段 0：特殊首回合技能检查
    // ========================================
    const firstTurnMove = checkFirstTurnMoves(aiPoke, playerPoke, turnCount);
    if (firstTurnMove) {
        return { type: AI_ACTION_TYPE.MOVE, move: firstTurnMove, reasoning: 'First turn priority move (Fake Out)' };
    }
    
    // ========================================
    // 阶段 1：斩杀线计算 (Lethal Check)
    // 【v3.2】支持迅疾/刚猛斩杀
    // ========================================
    const killMove = findKillMove(aiPoke, playerPoke);
    if (killMove) {
        return { 
            type: AI_ACTION_TYPE.MOVE, 
            move: killMove.move, 
            style: killMove.style || null,
            reasoning: killMove.reasoning 
        };
    }
    
    // ========================================
    // 阶段 1.3：危机闪避 (Crisis Evasion) [v3.5]
    // 如果我处于斩杀线且速度更快，优先使用半无敌技能躲避
    // ========================================
    const evasionMove = findEvasionMove(aiPoke, playerPoke);
    if (evasionMove) {
        return { 
            type: AI_ACTION_TYPE.MOVE, 
            move: evasionMove.move, 
            reasoning: evasionMove.reasoning 
        };
    }
    
    // ========================================
    // 阶段 1.5：读换预判 (Prediction) [v2.0]
    // 如果玩家必死且比我慢，预测玩家会换人
    // ========================================
    const predictionMove = evaluatePrediction(aiPoke, playerPoke, aiParty);
    if (predictionMove) {
        return { type: AI_ACTION_TYPE.MOVE, move: predictionMove.move, reasoning: predictionMove.reasoning };
    }
    
    // ========================================
    // 阶段 2：威胁评估 - 我会死吗？
    // ========================================
    const threatAssessment = assessThreat(aiPoke, playerPoke);
    
    // ========================================
    // 阶段 2.5：战略性换人检查 (Reset Pivoting) [v2.0]
    // 检查是否因为负面状态/能力下降需要换人
    // ========================================
    const needsStrategicSwitch = shouldStrategicSwitch(aiPoke);
    
    // ========================================
    // 阶段 3：换人决策 (Pivot Logic)
    // 添加冷却：至少间隔 2 回合才能再次换人
    // ========================================
    const switchCooldown = 2;
    const canSwitch = (turnCount - lastSwitchTurn) >= switchCooldown;
    
    // 【修复】极巨化状态下绝对禁止换人！
    // 正作规则：极巨化宝可梦换人会立刻解除极巨化，这是巨大的资源浪费
    if (aiPoke.isDynamaxed || (aiPoke.dynamaxTurns && aiPoke.dynamaxTurns > 0)) {
        console.log(`[AI] ${aiPoke.name} is Dynamaxed - switching FORBIDDEN`);
        // 直接跳过换人决策，进入攻击决策
        const bestMove = getHardAiMove(aiPoke, playerPoke, aiParty);
        return { type: AI_ACTION_TYPE.MOVE, move: bestMove, reasoning: 'Dynamax active - must attack' };
    }
    
    // 修复：如果我有优势（能秒杀对方或伤害远超对方），不要换人！
    // v2.0：即使不危险，如果状态很差也考虑换人
    const shouldConsiderSwitch = threatAssessment.amIInDanger || needsStrategicSwitch;
    
    if (canSwitch && shouldConsiderSwitch && 
        !threatAssessment.haveAdvantage &&  // 关键修复：有优势时不换人
        aiParty && aiParty.length > 1) {
        const pivotDecision = findBestPivot(aiPoke, playerPoke, aiParty, threatAssessment);
        if (pivotDecision) {
            lastSwitchTurn = turnCount; // 记录换人回合
            return pivotDecision;
        }
    }
    
    // ========================================
    // 阶段 4：状态博弈与强化判断
    // ========================================
    const strategicMove = evaluateStrategicMoves(aiPoke, playerPoke, threatAssessment);
    if (strategicMove) {
        return { type: AI_ACTION_TYPE.MOVE, move: strategicMove.move, reasoning: strategicMove.reasoning };
    }
    
    // ========================================
    // 阶段 5：常规贪婪选择 (Fallback to Hard AI)
    // ========================================
    const bestMove = getHardAiMove(aiPoke, playerPoke, aiParty);
    
    // ========================================
    // 阶段 6：风格优化 (Style Optimization) [v2.1]
    // 尝试为最优招式附加"流派 (Style)"
    // ========================================
    let chosenStyle = null;
    
    if (bestMove) {
        const mergedMove = getMergedMoveData(bestMove);
        const styleSuggestion = tryOptimizeStyle(aiPoke, playerPoke, mergedMove);
        
        if (styleSuggestion) {
            chosenStyle = styleSuggestion;
        }
        // 【v3.2 移除】不再随机使用风格，只在有战术价值时使用
    }
    
    return { 
        type: AI_ACTION_TYPE.MOVE, 
        move: bestMove, 
        style: chosenStyle,
        reasoning: chosenStyle ? `Optimized via ${chosenStyle} style` : 'Standard best move calculation' 
    };
}

/* =============================================================
 *  Expert AI 辅助函数
 * ============================================================= */

/**
 * 检查首回合特殊技能（如 Fake Out）
 */
function checkFirstTurnMoves(aiPoke, playerPoke, turnCount) {
    // 关键修复：检查 turnsOnField 而不是 turnCount
    // Fake Out 只能在宝可梦上场后的第一回合使用
    if ((aiPoke.turnsOnField || 0) > 0) return null;
    
    const fakeOutMoves = ['Fake Out', 'First Impression'];
    
    for (const move of aiPoke.moves) {
        if (fakeOutMoves.includes(move.name)) {
            // 确保能造成伤害（不是免疫）
            const eff = getTypeEffectivenessAI(move.type || 'Normal', playerPoke.types || ['Normal']);
            if (eff > 0) {
                return move;
            }
        }
    }
    return null;
}

/**
 * 寻找斩杀技能
 * @returns {object|null} { move, reasoning } 或 null
 */
function findKillMove(aiPoke, playerPoke) {
    const targetHp = playerPoke.currHp;
    const targetMaxHp = playerPoke.maxHp;
    const mySpeed = getEffectiveSpeed(aiPoke);
    const targetSpeed = getEffectiveSpeed(playerPoke);
    const isTrickRoom = (typeof battle !== 'undefined') && battle.field && battle.field.trickRoom > 0;
    const aiFaster = isTrickRoom ? (mySpeed < targetSpeed) : (mySpeed > targetSpeed);
    
    // 【调试】输出斩杀检查信息
    console.log(`[AI KILL CHECK] ${aiPoke.name} vs ${playerPoke.name}: targetHp=${targetHp}/${targetMaxHp}, aiFaster=${aiFaster}`);
    
    let bestKillMove = null;
    let bestKillPriority = -999;
    
    // 【修复】首回合限制技能列表
    const firstTurnOnlyMoves = ['Fake Out', 'First Impression', 'Mat Block'];
    
    for (const move of aiPoke.moves) {
        const mergedMove = getMergedMoveData(move);
        const category = (mergedMove.cat || mergedMove.category || '').toLowerCase();
        if (category === 'status' || mergedMove.power === 0) continue;
        
        // 【修复】跳过非首回合的首回合限制技能
        if (firstTurnOnlyMoves.includes(mergedMove.name) && (aiPoke.turnsOnField || 0) > 0) {
            continue;
        }
        
        const dmgResult = simulateDamage(aiPoke, playerPoke, mergedMove);
        const priority = mergedMove.priority || 0;
        const normalDmg = dmgResult.damage;
        
        // 【调试】输出每个技能的伤害
        if (normalDmg >= targetHp * 0.5) {
            console.log(`[AI KILL CHECK] ${mergedMove.name}: dmg=${normalDmg}, targetHp=${targetHp}, canKill=${normalDmg >= targetHp}`);
        }
        
        // 【v3.2】计算迅疾伤害（速度慢时用0.5x）
        const agileDmg = Math.floor(normalDmg * 0.50);
        
        // 能斩杀
        if (normalDmg >= targetHp) {
            // 速度快 + 能秒 = 完美斩杀
            if (aiFaster && priority >= bestKillPriority) {
                bestKillMove = { move, reasoning: 'Speed advantage kill', style: null };
                bestKillPriority = priority;
            }
            // 速度慢但有先制技 = 先制斩杀
            else if (!aiFaster && priority > 0 && priority > bestKillPriority) {
                bestKillMove = { move, reasoning: 'Priority move kill', style: null };
                bestKillPriority = priority;
            }
            // 【v3.4 修复】速度慢 + 普通能斩杀 + 迅疾也能斩杀 = 用迅疾抢先手
            else if (!aiFaster && priority <= 0 && agileDmg >= targetHp) {
                console.log(`[AI STYLE] 迅疾抢先斩杀: ${mergedMove.name} (${agileDmg} >= ${targetHp})`);
                bestKillMove = { move, reasoning: 'Agile style kill', style: 'agile' };
                bestKillPriority = 999;
            }
            // 速度慢无先制，迅疾杀不死（赌对面不秒我）
            else if (!bestKillMove && normalDmg >= targetHp * 1.2) {
                bestKillMove = { move, reasoning: 'Overkill gamble', style: null };
            }
        }
        // 速度慢 + 普通杀不死 + 迅疾能斩杀 = 迅疾抢先斩杀
        else if (!aiFaster && priority <= 0 && agileDmg >= targetHp) {
            console.log(`[AI STYLE] 迅疾斩杀检测: ${mergedMove.name} (${normalDmg}*0.5=${agileDmg} >= ${targetHp})`);
            bestKillMove = { move, reasoning: 'Agile style kill', style: 'agile' };
            bestKillPriority = 999;
        }
        // 【v3.3 移除刚猛斩杀】速度快时用刚猛会卖先手，太危险
        // 刚猛只在 tryOptimizeStyle 中的斩杀线场景使用（速度慢时）
    }
    
    return bestKillMove;
}

/**
 * 危机闪避：在斩杀线时寻找半无敌技能躲避 [v3.5]
 * 
 * 核心逻辑：
 * 1. 检测是否处于斩杀线（对方能一击秒杀我）
 * 2. 如果我速度更快，使用半无敌技能可以躲避本回合攻击
 * 3. 半无敌技能：Dig, Fly, Dive, Bounce, Phantom Force, Shadow Force
 * 
 * @returns {object|null} { move, reasoning } 或 null
 */
function findEvasionMove(aiPoke, playerPoke) {
    // 半无敌技能列表（从 charge-moves.js 的 type: 'invuln' 配置）
    const INVULN_MOVES = ['Dig', 'Fly', 'Dive', 'Bounce', 'Phantom Force', 'Shadow Force', 'Sky Drop'];
    
    // 获取速度
    const mySpeed = getEffectiveSpeed(aiPoke);
    const targetSpeed = getEffectiveSpeed(playerPoke);
    const isTrickRoom = (typeof battle !== 'undefined') && battle.field && battle.field.trickRoom > 0;
    const aiFaster = isTrickRoom ? (mySpeed < targetSpeed) : (mySpeed > targetSpeed);
    
    // 如果速度慢，半无敌技能没有意义（会先被打死）
    if (!aiFaster) {
        return null;
    }
    
    // 计算对方最大伤害
    let maxIncomingDmg = 0;
    for (const pMove of playerPoke.moves) {
        const mergedMove = getMergedMoveData(pMove);
        const dmgResult = simulateDamage(playerPoke, aiPoke, mergedMove);
        if (dmgResult.damage > maxIncomingDmg) {
            maxIncomingDmg = dmgResult.damage;
        }
    }
    
    const myHp = aiPoke.currHp;
    const willDieNextTurn = maxIncomingDmg >= myHp;
    
    // 如果不会死，不需要闪避
    if (!willDieNextTurn) {
        return null;
    }
    
    // 检查是否有强力香草（有香草的话，蓄力技能变成即发，更有价值）
    const hasHerb = (aiPoke.item || '').toLowerCase().includes('power herb') || 
                    (aiPoke.item || '').includes('强力香草');
    
    // 寻找半无敌技能
    let bestEvasionMove = null;
    let bestDamage = 0;
    
    for (const move of aiPoke.moves) {
        if (INVULN_MOVES.includes(move.name)) {
            const mergedMove = getMergedMoveData(move);
            const dmgResult = simulateDamage(aiPoke, playerPoke, mergedMove);
            
            // 检查是否免疫（0 伤害说明属性免疫）
            if (dmgResult.damage <= 0) {
                continue;
            }
            
            // 选择伤害最高的半无敌技能
            if (dmgResult.damage > bestDamage) {
                bestDamage = dmgResult.damage;
                bestEvasionMove = move;
            }
        }
    }
    
    if (bestEvasionMove) {
        const reasoning = hasHerb 
            ? `Crisis evasion with Power Herb (instant ${bestEvasionMove.name})`
            : `Crisis evasion: ${bestEvasionMove.name} to dodge lethal attack`;
        
        console.log(`[AI EVASION] ${aiPoke.name} 处于斩杀线 (${myHp}HP vs ${maxIncomingDmg}伤害)，使用 ${bestEvasionMove.name} 闪避`);
        
        return { move: bestEvasionMove, reasoning };
    }
    
    return null;
}

/**
 * 威胁评估：判断 AI 是否处于危险
 * v2.0：加入角色类型判断（Sweeper 更惜命）
 */
function assessThreat(aiPoke, playerPoke) {
    let maxIncomingDmg = 0;
    let worstPlayerMove = null;
    let worstMoveType = null;
    
    // 模拟玩家所有技能对 AI 的伤害
    for (const pMove of playerPoke.moves) {
        const mergedMove = getMergedMoveData(pMove);
        const dmgResult = simulateDamage(playerPoke, aiPoke, mergedMove);
        
        if (dmgResult.damage > maxIncomingDmg) {
            maxIncomingDmg = dmgResult.damage;
            worstPlayerMove = mergedMove;
            worstMoveType = mergedMove.type;
        }
    }
    
    const myHp = aiPoke.currHp;
    const myMaxHp = aiPoke.maxHp;
    const hpPercent = myHp / myMaxHp;
    
    // === 新增：评估我的反击能力 ===
    let canKillPlayer = false;
    let myBestDamage = 0;
    let myBestMove = null;
    
    for (const myMove of aiPoke.moves) {
        const mergedMove = getMergedMoveData(myMove);
        const dmgResult = simulateDamage(aiPoke, playerPoke, mergedMove);
        if (dmgResult.damage > myBestDamage) {
            myBestDamage = dmgResult.damage;
            myBestMove = mergedMove;
        }
        if (dmgResult.damage >= playerPoke.currHp) {
            canKillPlayer = true;
        }
    }
    
    // 判断是否有优势：能秒杀对方，或者我的伤害远超对方
    const haveAdvantage = canKillPlayer || (myBestDamage > maxIncomingDmg * 1.3);
    
    // === v2.0：角色类型判断 ===
    // 高速脆皮 (Sweeper)：速度高 + 攻击/特攻高 + 防御低
    const baseSpe = aiPoke.baseStats?.spe || aiPoke.spe || 80;
    const baseAtk = aiPoke.baseStats?.atk || aiPoke.atk || 80;
    const baseSpa = aiPoke.baseStats?.spa || aiPoke.spa || 80;
    const baseDef = aiPoke.baseStats?.def || aiPoke.def || 80;
    const baseSpd = aiPoke.baseStats?.spd || aiPoke.spd || 80;
    
    const isSweeper = baseSpe >= 95 && (baseAtk >= 100 || baseSpa >= 100);
    const isBulky = (baseDef + baseSpd) >= 180;
    
    // 危险阈值：脆皮输出手更惜命
    // Sweeper: 受到 45% 以上伤害就视为危险
    // Tank: 受到 88% 以上伤害才视为危险
    const dangerThreshold = isSweeper ? 0.45 : (isBulky ? 0.88 : 0.7);
    
    const willDieNextTurn = maxIncomingDmg >= myHp;
    const playerFaster = getEffectiveSpeed(playerPoke) > getEffectiveSpeed(aiPoke);
    
    // v2.0 危险判定：
    // 1. 下回合必死且对方速度快
    // 2. 或者受到的伤害超过角色类型阈值且对方速度快
    const significantDamage = maxIncomingDmg >= myMaxHp * dangerThreshold;
    
    const amIInDanger = (willDieNextTurn && playerFaster) || 
                        (significantDamage && playerFaster && hpPercent < 0.8);
    
    return {
        maxIncomingDmg,
        worstPlayerMove,
        worstMoveType,
        willDieNextTurn,
        playerFaster,
        amIInDanger,
        // 新增返回值
        haveAdvantage,
        canKillPlayer,
        myBestDamage,
        myBestMove,
        // v2.0 角色类型
        isSweeper,
        isBulky,
        dangerThreshold
    };
}

/**
 * 寻找最佳换人目标
 */
function findBestPivot(aiPoke, playerPoke, aiParty, threatAssessment) {
    const { worstPlayerMove, worstMoveType, maxIncomingDmg } = threatAssessment;
    
    if (!worstPlayerMove) return null;
    
    let bestPivotIndex = -1;
    let bestPivotScore = -Infinity;
    let bestPivotReasoning = '';
    
    for (let i = 0; i < aiParty.length; i++) {
        const ally = aiParty[i];
        
        // 跳过自己和已倒下的（严格检查 HP > 0）
        if (!ally) continue;
        if (ally === aiPoke) continue;
        if (typeof ally.isAlive !== 'function' || !ally.isAlive()) continue;
        if (!ally.currHp || ally.currHp <= 0) continue;
        
        // 计算队友承受伤害
        const simDmg = simulateDamage(playerPoke, ally, worstPlayerMove);
        const allyHpPercent = simDmg.damage / ally.maxHp;
        
        // 计算属性克制
        const eff = getTypeEffectivenessAI(worstMoveType || 'Normal', ally.types || ['Normal']);
        
        let pivotScore = 0;
        let reasoning = '';
        
        // [战术修正] 防止自杀式换人：被克制 (2x+) 直接负分
        if (eff >= 2) {
            pivotScore = -10000; // 绝对不换！这是送死
            reasoning = `SUICIDE SWITCH BLOCKED: ${ally.cnName || ally.name} is weak to ${worstMoveType}`;
            console.log(`[AI TACTIC] 阻止自杀换人: ${ally.cnName} 弱 ${worstMoveType} (${eff}x)`);
        }
        // 免疫 = 绝对最高优先级（必须选择免疫的宝可梦）
        else if (eff === 0) {
            pivotScore = 99999;
            reasoning = `Perfect Immunity switch to ${ally.cnName || ally.name}`;
        }
        // 抵抗 (0.5x 或更低)
        else if (eff <= 0.5) {
            pivotScore = 5000 - allyHpPercent * 1000;
            reasoning = `Resist switch to ${ally.cnName || ally.name}`;
        }
        // 普通效果但伤害可控 (<40% HP)
        else if (allyHpPercent < 0.4) {
            pivotScore = 2000 - allyHpPercent * 1000;
            reasoning = `Safe switch to ${ally.cnName || ally.name}`;
        }
        // 伤害较高但比留场好
        else if (allyHpPercent < 0.7 && threatAssessment.willDieNextTurn) {
            pivotScore = 500 - allyHpPercent * 500;
            reasoning = `Sacrifice switch to ${ally.cnName || ally.name}`;
        }
        // [战术修正] 普通效果但会被秒杀，也不换
        else if (allyHpPercent >= 0.9) {
            pivotScore = -5000; // 会被秒杀，不换
            reasoning = `OHKO SWITCH BLOCKED: ${ally.cnName || ally.name} would be KO'd`;
        }
        
        // 额外加分：队友能反杀玩家
        if (pivotScore > 0) {
            const allyKillMove = findKillMoveForAlly(ally, playerPoke);
            if (allyKillMove) {
                pivotScore += 1000;
                reasoning += ' (can revenge kill)';
            }
        }
        
        if (pivotScore > bestPivotScore) {
            bestPivotScore = pivotScore;
            bestPivotIndex = i;
            bestPivotReasoning = reasoning;
        }
    }
    
    // 只有当换人明显比留场好时才换
    // 留场等死 vs 换人能活
    if (bestPivotIndex !== -1 && bestPivotScore > 0) {
        return {
            type: AI_ACTION_TYPE.SWITCH,
            index: bestPivotIndex,
            reasoning: bestPivotReasoning
        };
    }
    
    return null;
}

/**
 * 检查队友是否能反杀
 */
function findKillMoveForAlly(ally, target) {
    if (!ally.moves) return null;
    
    for (const move of ally.moves) {
        const mergedMove = getMergedMoveData(move);
        const dmgResult = simulateDamage(ally, target, mergedMove);
        if (dmgResult.damage >= target.currHp) {
            return move;
        }
    }
    return null;
}

/**
 * v2.0：战略性换人检查
 * 检查是否因为负面状态需要换人（而非仅仅是保命）
 */
function shouldStrategicSwitch(aiPoke) {
    // 1. 被大幅降能力 (流星群/近身战后遗症 或 被威吓多次)
    const boosts = aiPoke.boosts || {};
    if ((boosts.atk || 0) <= -2 || (boosts.spa || 0) <= -2) {
        return true;
    }
    
    // 2. 速度被大幅降低（黏黏网/岩石封锁）
    if ((boosts.spe || 0) <= -2) {
        return true;
    }
    
    // 3. 即将睡着 (哈欠)
    const volatile = aiPoke.volatile || aiPoke.volatileStatus || {};
    if (volatile.yawn || volatile.Yawn) {
        return true;
    }
    
    // 4. 灭亡之歌倒计时
    if (volatile.perishsong || volatile.PerishSong) {
        return true;
    }
    
    // 5. 被挑衅但主要是辅助型
    if (volatile.taunt || volatile.Taunt) {
        // 检查是否有足够的攻击技能
        const attackMoves = (aiPoke.moves || []).filter(m => {
            const cat = (m.cat || m.category || '').toLowerCase();
            return cat !== 'status';
        });
        if (attackMoves.length <= 1) {
            return true;
        }
    }
    
    return false;
}

/**
 * v2.0：读换预判
 * 如果玩家当前宝可梦必死且比 AI 慢，预测玩家会换人
 */
function evaluatePrediction(aiPoke, playerPoke, aiParty) {
    // 检查玩家是否必死
    const playerHp = playerPoke.currHp;
    const playerMaxHp = playerPoke.maxHp;
    const playerHpPercent = playerHp / playerMaxHp;
    
    // 玩家血量太低 (<= 20%) 且比 AI 慢
    if (playerHpPercent > 0.2) return null;
    
    const aiFaster = getEffectiveSpeed(aiPoke) > getEffectiveSpeed(playerPoke);
    if (!aiFaster) return null;
    
    // 检查 AI 是否能秒杀当前玩家
    let canKillCurrent = false;
    let bestKillMove = null;
    let bestKillDamage = 0;
    
    for (const move of aiPoke.moves) {
        const mergedMove = getMergedMoveData(move);
        const dmgResult = simulateDamage(aiPoke, playerPoke, mergedMove);
        if (dmgResult.damage >= playerHp) {
            canKillCurrent = true;
            if (dmgResult.damage > bestKillDamage) {
                bestKillDamage = dmgResult.damage;
                bestKillMove = mergedMove;
            }
        }
    }
    
    if (!canKillCurrent || !bestKillMove) return null;
    
    // 玩家必死，预测玩家会换人
    // 预读逻辑：如果最佳技能是单属性克制技能，考虑换一个覆盖面更广的技能
    const coveragePairs = {
        'Ground': ['Ice', 'Rock', 'Water'],      // 地面被飞行免疫，用冰/岩石打
        'Electric': ['Ice', 'Grass', 'Ground'],  // 电被地面免疫，用冰/草打
        'Fighting': ['Flying', 'Psychic'],       // 格斗被幽灵免疫，用飞行/超能打
        'Normal': ['Fighting', 'Ghost'],         // 一般被幽灵免疫
        'Poison': ['Ground', 'Psychic']          // 毒被钢免疫
    };
    
    const bestMoveType = bestKillMove.type;
    const coverageTypes = coveragePairs[bestMoveType];
    
    if (!coverageTypes) return null;
    
    // 找一个覆盖技能
    for (const move of aiPoke.moves) {
        const mergedMove = getMergedMoveData(move);
        if (coverageTypes.includes(mergedMove.type) && (mergedMove.basePower || mergedMove.power || 0) >= 60) {
            // 50% 概率使用预读技能（不要太激进）
            if (Math.random() < 0.5) {
                return {
                    move: move,
                    reasoning: `Prediction: expecting switch, using ${mergedMove.type} coverage`
                };
            }
        }
    }
    
    return null;
}

/**
 * 评估战略性技能（强化、状态、回复）
 */
function evaluateStrategicMoves(aiPoke, playerPoke, threatAssessment) {
    const myHpPercent = aiPoke.currHp / aiPoke.maxHp;
    const myHp = aiPoke.currHp;
    const myMaxHp = aiPoke.maxHp;
    
    // 【重构】危险判定只跳过强化(setup)，不跳过回复和状态技能
    // 防御型宝可梦（如超坏星）在被 2HKO 时仍然需要回复和下毒
    const canBe2HKOd = threatAssessment.maxIncomingDmg * 2 >= myHp;
    const skipSetup = threatAssessment.amIInDanger || 
                      (threatAssessment.willDieNextTurn && threatAssessment.playerFaster) ||
                      (canBe2HKOd && threatAssessment.playerFaster);
    
    if (skipSetup) {
        console.log(`[AI] Danger detected, skipping SETUP moves only (heal/status still allowed)`);
    }
    
    // 【新增】属性克制检查：如果对方有 2 倍克制技能且速度更快，不要强化
    let skipSetupDueToType = false;
    if (threatAssessment.worstMoveType && threatAssessment.playerFaster) {
        const eff = getTypeEffectivenessAI(threatAssessment.worstMoveType, aiPoke.types || ['Normal']);
        if (eff >= 2) {
            skipSetupDueToType = true;
            console.log(`[AI] Weak to ${threatAssessment.worstMoveType} (${eff}x) and slower, skipping setup`);
        }
    }
    
    // 【新增】连续回复惩罚：连续使用回复技能时大幅降低评分
    const lastMove = aiPoke.lastMoveUsed || '';
    const lastMoveId = lastMove.toLowerCase().replace(/[^a-z0-9]/g, '');
    const lastMoveData = (typeof MOVES !== 'undefined' && MOVES[lastMoveId]) ? MOVES[lastMoveId] : {};
    const lastMoveWasHeal = (lastMoveData.heal || (lastMoveData.flags && lastMoveData.flags.heal)) && 
                            (lastMoveData.target === 'self' || lastMoveData.target === 'adjacentAllyOrSelf');
    
    // 【新增】计算 AI 最大输出伤害，用于判断是否为"低输出"型（stall）
    let maxDmgToPlayer = 0;
    for (const m of aiPoke.moves) {
        const mMerged = getMergedMoveData(m);
        const cat = (mMerged.cat || mMerged.category || '').toLowerCase();
        if (cat !== 'status' && (mMerged.basePower || mMerged.power || 0) > 0) {
            const dmg = simulateDamage(aiPoke, playerPoke, mMerged);
            if (dmg.damage > maxDmgToPlayer) maxDmgToPlayer = dmg.damage;
        }
    }
    const isLowDamageOutput = maxDmgToPlayer < playerPoke.maxHp * 0.15;
    if (isLowDamageOutput) {
        console.log(`[AI STALL] ${aiPoke.cnName} 输出极低 (最高${maxDmgToPlayer} vs ${playerPoke.maxHp}HP)，优先状态消耗`);
    }
    
    let bestStrategicMove = null;
    let bestStrategicScore = 0;
    
    for (const move of aiPoke.moves) {
        const moveName = move.name || '';
        let score = 0;
        let reasoning = '';
        
        // === 强化技能 ===
        // 【修复】使用 moves-data.js 的 boosts 字段检测强化技，而不是硬编码列表
        const moveId = moveName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const moveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
        const boosts = moveData.boosts || null;
        const target = moveData.target || 'normal';
        
        // 检测是否是自身强化技能
        const isSelfBoost = boosts && ['self', 'allySide', 'adjacentAllyOrSelf'].includes(target);
        
        if (isSelfBoost && !skipSetup && !skipSetupDueToType) {
            // 【关键修复】检查所有正面强化是否已满级 (+6)
            const currentBoosts = aiPoke.boosts || {};
            let anyBoostMaxed = false;
            for (const stat of Object.keys(boosts)) {
                if (boosts[stat] > 0 && (currentBoosts[stat] || 0) >= 6) {
                    console.log(`[AI STRATEGIC] ${aiPoke.cnName} 的 ${stat} 已满级 (+6)，禁止使用 ${moveName}`);
                    anyBoostMaxed = true;
                    break;
                }
            }
            
            if (!anyBoostMaxed) {
                // 检查相关能力是否已经强化足够
                const relevantBoost = aiPoke.spa > aiPoke.atk ? (currentBoosts.spa || 0) : (currentBoosts.atk || 0);
                const defBoost = currentBoosts.def || 0;
                const spdBoost = currentBoosts.spd || 0;
                
                // 攻击/特攻强化
                if (boosts.atk > 0 || boosts.spa > 0) {
                    if (myHpPercent > 0.6 && relevantBoost < 2) {
                        score = 150;
                        reasoning = 'Setup opportunity';
                    } else if (myHpPercent > 0.4 && relevantBoost === 0) {
                        score = 80;
                        reasoning = 'Risky setup';
                    }
                }
                // 防御强化（如 Iron Defense）
                else if (boosts.def > 0 && defBoost < 2) {
                    if (myHpPercent > 0.7) {
                        score = 80;
                        reasoning = 'Defensive setup';
                    }
                }
                // 特防强化（如 Amnesia）
                else if (boosts.spd > 0 && spdBoost < 2) {
                    if (myHpPercent > 0.7) {
                        score = 80;
                        reasoning = 'Special defense setup';
                    }
                }
            }
        }
        
        // === 回复技能 === 【软编码】使用 PS 的 heal 字段
        // 【重构】回复技能不受 skipSetup 限制，防御型宝可梦需要回复
        const moveHealData = moveData.heal || (moveData.flags && moveData.flags.heal);
        const isSelfHeal = moveHealData && (target === 'self' || target === 'adjacentAllyOrSelf');
        if (isSelfHeal) {
            if (myHpPercent >= 0.95) {
                // 满血绝对不回血
                score = 0;
            } else if (myHpPercent < 0.4) {
                score = 200;
                reasoning = 'Critical heal';
            } else if (myHpPercent < 0.6) {
                score = 100;
                reasoning = 'Preventive heal';
            } else if (myHpPercent < 0.75) {
                score = 50;
                reasoning = 'Light heal';
            }
            
            // 【关键修复】连续回复惩罚：上回合也用了回复技能，大幅降分
            // 这防止了 Recover 无限循环的"沙袋"行为
            if (score > 0 && lastMoveWasHeal) {
                const penalty = Math.floor(score * 0.6); // 扣掉 60% 分数
                score -= penalty;
                console.log(`[AI HEAL PENALTY] ${moveName} 连续回复惩罚: -${penalty} (${score})`);
                reasoning = 'Consecutive heal (penalized)';
            }
        }
        
        // === 守住类技能 === 【毒保替战术核心】
        // 当对手已中毒/灼伤时，守住可以白赚一回合伤害
        const isProtectLike = moveData.stallingMove === true;
        if (isProtectLike) {
            const lastMoveIsProtect = ['Protect', 'Detect', 'Spiky Shield', "King's Shield", 
                'Baneful Bunker', 'Obstruct', 'Silk Trap', 'Burning Bulwark', 'Endure'].includes(lastMove);
            if (!lastMoveIsProtect) {
                // 对手有持续伤害状态时，守住价值极高
                if (playerPoke.status === 'tox' || playerPoke.status === 'psn' || playerPoke.status === 'brn') {
                    score = 160;
                    reasoning = 'Stall protect (opponent has status)';
                    console.log(`[AI STALL] ${aiPoke.cnName} 守住消耗: 对手有 ${playerPoke.status}`);
                }
                // 对手有寄生种子时也值得守住
                if (playerPoke.volatile && playerPoke.volatile.leechseed) {
                    score = Math.max(score, 140);
                    reasoning = 'Stall protect (leech seed active)';
                }
            }
        }
        
        // === 替身 === 【毒保替战术核心】
        if (moveName === 'Substitute') {
            const hasSubstitute = aiPoke.volatile && aiPoke.volatile.substitute;
            if (!hasSubstitute && myHpPercent > 0.3) {
                // 对手已中毒时，替身价值极高（拖时间）
                if (playerPoke.status === 'tox' || playerPoke.status === 'psn') {
                    score = 150;
                    reasoning = 'Stall substitute (opponent poisoned)';
                    console.log(`[AI STALL] ${aiPoke.cnName} 替身消耗: 对手已中毒`);
                } else if (myHpPercent > 0.5) {
                    score = 60;
                    reasoning = 'Substitute setup';
                }
            }
        }
        
        // === 状态技能 === 【软编码】使用 PS 的 status 字段
        const moveStatusEffect = moveData.status; // 'slp', 'par', 'brn', 'psn', 'tox'
        if (moveStatusEffect && !playerPoke.status) {
            // 对手没有状态才用
            // 睡眠招式
            if (moveStatusEffect === 'slp') {
                // 【修复】检查目标是否免疫睡眠
                // 【软编码】从 AbilityHandlers 读取睡眠免疫特性列表
                const targetAbility = (playerPoke.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                const sleepImmuneAbilities = (typeof AbilityHandlers !== 'undefined' && AbilityHandlers._sleepImmuneAbilities) 
                    ? AbilityHandlers._sleepImmuneAbilities 
                    : ['insomnia', 'vitalspirit', 'comatose', 'purifyingsalt', 'sweetveil'];
                const isImmune = sleepImmuneAbilities.includes(targetAbility);
                
                if (!isImmune) {
                    score = 180;
                    reasoning = 'Sleep opportunity';
                }
                // 如果免疫则不给分，跳过此招式
            // 麻痹招式
            } else if (moveStatusEffect === 'par' && getEffectiveSpeed(playerPoke) > getEffectiveSpeed(aiPoke)) {
                score = 120;
                reasoning = 'Speed control';
            // 烧伤招式
            } else if (moveStatusEffect === 'brn' && playerPoke.atk > playerPoke.spa) {
                score = 110;
                reasoning = 'Physical attacker burn';
            // 中毒招式
            } else if (moveStatusEffect === 'psn' || moveStatusEffect === 'tox') {
                score = 90;
                reasoning = 'Chip damage';
                // 【毒保替战术】低输出型宝可梦大幅提升剧毒优先级
                if (isLowDamageOutput) {
                    score = 250;
                    reasoning = 'Stall toxic (low damage output)';
                    console.log(`[AI STALL] ${aiPoke.cnName} 优先下毒: 输出不足以击杀`);
                }
            }
        }
        
        if (score > bestStrategicScore) {
            bestStrategicScore = score;
            bestStrategicMove = { move, reasoning };
        }
    }
    
    // 只有当战略分数足够高时才选择战略技能
    // 否则让常规伤害计算来决定
    if (bestStrategicScore >= 100) {
        return bestStrategicMove;
    }
    
    return null;
}

/* =============================================================
 *  通用辅助函数
 * ============================================================= */

/**
 * 对技能按评分排序
 */
function rankMovesByScore(attacker, defender, aiParty = null) {
    if (!attacker?.moves) return [];
    
    // 【修复】Choice 道具锁招检查
    // 如果持有 Choice 道具且已经锁定了技能，只能使用那个技能
    // 使用 items-data.js 的 isChoiceItem 函数
    const item = attacker.item || '';
    const checkIsChoice = typeof window !== 'undefined' && typeof window.isChoiceItem === 'function' 
        ? window.isChoiceItem 
        : (i) => i && (i.includes('Choice') || i.includes('讲究'));
    const hasChoiceItem = checkIsChoice(item);
    const lockedMove = attacker.choiceLockedMove;
    
    if (hasChoiceItem && lockedMove) {
        // 找到被锁定的技能
        const locked = attacker.moves.find(m => m.name === lockedMove);
        if (locked) {
            console.log(`[AI CHOICE] ${attacker.name} 被 ${item} 锁定在 ${lockedMove}`);
            const mergedMove = getMergedMoveData(locked);
            return [{
                move: locked,
                score: calcMoveScore(attacker, defender, mergedMove, aiParty)
            }];
        }
    }
    
    return attacker.moves.map(move => {
        const mergedMove = getMergedMoveData(move);
        
        // === 【环境图层系统】检查技能是否被环境禁用 ===
        if (typeof window !== 'undefined' && window.envOverlay && window.envOverlay.isMoveBanned) {
            if (window.envOverlay.isMoveBanned(attacker, mergedMove)) {
                console.log(`[AI ENV BAN] ${move.name} 被环境禁用`);
                return { move, score: -10000 }; // 极低分数，AI 不会选择
            }
        }
        
        return {
            move,
            score: calcMoveScore(attacker, defender, mergedMove, aiParty)
        };
    }).sort((a, b) => b.score - a.score);
}

/**
 * 获取合并后的技能数据（本地 + MOVES 数据库）
 */
function getMergedMoveData(move) {
    const id = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    let merged = {
        ...move,
        type: move.type || 'Normal',
        cat: move.cat || move.category || 'phys'
    };
    
    if (typeof MOVES !== 'undefined' && MOVES[id]) {
        const staticData = MOVES[id];
        merged = {
            ...staticData,
            ...move,
            type: move.type || staticData.type || 'Normal',
            basePower: move.power ?? staticData.basePower ?? 0,
            power: move.power ?? staticData.basePower ?? 0,
            priority: staticData.priority ?? move.priority ?? 0,
            cat: (move.cat || (staticData.category ? staticData.category.toLowerCase() : 'phys')),
            // 【修复】确保 boosts 和 target 从 staticData 获取（用于强化技检测）
            boosts: move.boosts || staticData.boosts || null,
            target: move.target || staticData.target || 'normal'
        };
    }
    
    return merged;
}

/**
 * 模拟伤害计算（简化版，用于 AI 决策）
 * 保持纯净：该是0就是0，不在这里做特性魔改
 */
function simulateDamage(attacker, defender, move) {
    // 【关键修复】前置免疫检查：确保 AI 不会选择对目标无效的招式
    // 这是最高优先级的检查，必须在任何伤害计算之前执行
    
    // 【修复】变化技不做属性克制预检查（替身、守住、剧毒等不受属性克制影响）
    const moveCategory = (move.cat || move.category || '').toLowerCase();
    const isMoveStatus = moveCategory === 'status' || (move.basePower === 0 && move.power === 0);
    
    // 【重要】考虑皮肤系特性的属性转换 (Galvanize, Pixilate, Aerilate, Refrigerate)
    let moveType = move.type || 'Normal';
    if (typeof AbilityHandlers !== 'undefined' && attacker.ability && AbilityHandlers[attacker.ability]) {
        const ah = AbilityHandlers[attacker.ability];
        if (ah.onModifyType) {
            const typeResult = ah.onModifyType(move, attacker, window.battle);
            if (typeResult && typeResult.newType) {
                moveType = typeResult.newType;
                console.log(`[AI SIMULATE] ${attacker.ability} 将 ${move.name} 属性变为 ${moveType}`);
            }
        }
    }
    
    // 只对攻击技做属性克制预检查，变化技跳过
    if (!isMoveStatus) {
        const defenderTypes = defender.types || ['Normal'];
        const preCheckEff = getTypeEffectivenessAI(moveType, defenderTypes, move.name || '');
        if (preCheckEff === 0) {
            console.log(`[AI SIMULATE] ${move.name} (${moveType}) 对 ${defenderTypes.join('/')} 无效，跳过`);
            return { damage: 0, effectiveness: 0 };
        }
    }
    
    // 如果有全局 calcDamage 函数，使用它
    // 传入 isSimulation: true 防止消耗指令状态
    if (typeof window.calcDamage === 'function') {
        try {
            const result = window.calcDamage(attacker, defender, move, { isSimulation: true });
            return {
                damage: result.damage || result.singleHitDamage || 0,
                effectiveness: (result.effectiveness !== undefined) ? result.effectiveness : 1
            };
        } catch (e) {
            // 回退到简化计算
        }
    }
    
    // 简化伤害计算
    const moveName = move.name || '';
    const category = (move.cat || move.category || '').toLowerCase();
    const isStatus = category === 'status' || move.power === 0 || move.basePower === 0;
    
    if (isStatus) {
        return { damage: 0, effectiveness: 1 };
    }
    
    const usesSpecial = category === 'spec' || category === 'special';
    let atkStat = usesSpecial ? (attacker.getStat?.('spa') || attacker.spa) : (attacker.getStat?.('atk') || attacker.atk);
    const defStat = usesSpecial ? (defender.getStat?.('spd') || defender.spd) : (defender.getStat?.('def') || defender.def);
    
    // 烧伤减半物攻
    if (!usesSpecial && attacker.status === 'brn') {
        atkStat = Math.floor(atkStat * 0.5);
    }
    
    const eff = getTypeEffectivenessAI(move.type || 'Normal', defender.types || ['Normal'], moveName);
    if (eff === 0) return { damage: 0, effectiveness: 0 };
    
    const stab = (attacker.types || []).includes(move.type) ? 1.5 : 1.0;
    const power = move.basePower ?? move.power ?? 0;
    const level = attacker.level || 50;
    
    const baseDamage = ((2 * level / 5 + 2) * power * (atkStat / Math.max(1, defStat)) / 50 + 2) * stab * eff;
    
    return {
        damage: Math.floor(baseDamage * 0.925),
        effectiveness: eff
    };
}

/**
 * 评估技能的战术影响力（软编码，数据驱动）
 * 综合考虑：护盾破除、满血保命、威胁等级等因素
 * @returns {object} { totalScore, rawDamage, effectiveness, shieldBreak, threatBonus }
 */
function evaluateMoveImpact(attacker, defender, move) {
    // 1. 获取基础伤害模拟
    const dmgResult = simulateDamage(attacker, defender, move);
    let baseScore = dmgResult.damage;
    const eff = dmgResult.effectiveness;
    
    // 免疫直接返回
    if (eff === 0) {
        return { totalScore: -9999, rawDamage: 0, effectiveness: 0 };
    }
    
    // 获取技能分类
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    const category = (fullMoveData.category || move.cat || '').toLowerCase();
    const isAttackMove = category !== 'status' && (move.power > 0 || move.basePower > 0);
    
    // 2. 特性评估（软编码，从配置读取）
    const defAbility = defender.ability || '';
    const trait = AI_ABILITY_TRAITS[defAbility];
    let shieldBreak = false;
    
    if (trait && isAttackMove) {
        // === Case A: 消耗型护盾（画皮、冰砌鹅）===
        if (trait.type === 'consumable_shield') {
            const bustedFlag = trait.bustedFlag || 'shieldBusted';
            const isShieldActive = !defender[bustedFlag];
            
            // 检查条件（如冰砌鹅只防物理）
            let conditionMet = true;
            if (trait.condition === 'physical') {
                conditionMet = category === 'physical';
            } else if (trait.condition === 'special') {
                conditionMet = category === 'special';
            }
            
            if (isShieldActive && conditionMet && dmgResult.damage === 0) {
                // 护盾挡住了攻击，但破盾有战术价值
                let breakValue = trait.breakValue;
                
                // 【修复】Ice Face 在雪天下会恢复，破盾价值大幅降低
                if (defAbility === 'Ice Face') {
                    const battle = typeof window !== 'undefined' ? window.battle : null;
                    const weather = battle?.weather;
                    if (weather === 'snow' || weather === 'hail') {
                        // 雪天下破盾几乎无意义，因为回合结束会恢复
                        breakValue = 50; // 大幅降低破盾价值
                        console.log(`[AI] Ice Face 在雪天下，破盾价值降低: ${trait.breakValue} -> ${breakValue}`);
                    }
                }
                
                baseScore += breakValue;
                shieldBreak = true;
            }
        }
        
        // === Case B: 满血减伤（多重鳞片）===
        else if (trait.type === 'damage_reduction' && trait.condition === 'full_hp') {
            if (defender.currHp === defender.maxHp && dmgResult.damage > 0) {
                // 打破满血状态有价值
                baseScore += trait.breakValue;
            }
        }
        
        // === Case C: 满血保命（结实）===
        else if (trait.type === 'endure_lethal' && trait.condition === 'full_hp') {
            if (defender.currHp === defender.maxHp && dmgResult.damage > 0) {
                baseScore += trait.breakValue;
            }
        }
    }
    
    // 3. 道具评估（气势披带）
    const defItem = (defender.item || '').toLowerCase().replace(/[^a-z]/g, '');
    if (defItem === 'focussash' && defender.currHp === defender.maxHp && dmgResult.damage > 0) {
        baseScore += 150; // 打破气腰的满血状态
    }
    
    // 4. 威胁等级评估（对手强化程度）
    let threatLevel = 0;
    const defBoosts = defender.boosts || {};
    threatLevel += Math.max(0, (defBoosts.atk || 0) - 1) * 100;
    threatLevel += Math.max(0, (defBoosts.spa || 0) - 1) * 100;
    if ((defBoosts.spe || 0) > 0) threatLevel *= 1.5;
    
    let threatBonus = 0;
    if (threatLevel > 100) {
        if (isAttackMove) {
            // 攻击技能加分
            threatBonus = threatLevel;
            // 克制技能额外加分
            if (eff >= 2) threatBonus += threatLevel;
        } else {
            // 辅助技能：检查是否为反强化技能
            const isCounterMove = AI_COUNTER_MOVES.includes(move.name);
            if (isCounterMove) {
                threatBonus = threatLevel * 2; // 救命稻草
            } else {
                threatBonus = -Math.min(1000, threatLevel * 2); // 大幅惩罚
            }
        }
        baseScore += threatBonus;
    }
    
    return {
        totalScore: baseScore,
        rawDamage: dmgResult.damage,
        effectiveness: eff,
        shieldBreak,
        threatBonus
    };
}

/**
 * 获取有效速度（考虑麻痹、顺风、天气等）
 */
function getEffectiveSpeed(pokemon) {
    let spe = pokemon.getStat?.('spe') || pokemon.spe || 100;
    
    // 麻痹减速
    if (pokemon.status === 'par') {
        spe = Math.floor(spe * 0.5);
    }
    
    // 【环境图层系统】速度修正
    if (typeof window !== 'undefined' && window.envOverlay) {
        const envSpeMult = window.envOverlay.getStatMod(pokemon, 'spe');
        if (envSpeMult !== 1) {
            spe = Math.floor(spe * envSpeMult);
        }
    }
    
    return spe;
}

/**
 * 获取属性克制（使用内置表，避免循环调用）
 */
function getTypeEffectivenessAI(atkType, defTypes, moveName = '') {
    // 直接使用内置表，不调用 window.getTypeEffectiveness 避免循环
    const TYPE_CHART = {
        'Normal':   { weak: [],                          resist: ['Rock', 'Steel'],      immune: ['Ghost'] },
        'Fire':     { weak: ['Grass', 'Ice', 'Bug', 'Steel'], resist: ['Fire', 'Water', 'Rock', 'Dragon'], immune: [] },
        'Water':    { weak: ['Fire', 'Ground', 'Rock'],  resist: ['Water', 'Grass', 'Dragon'], immune: [] },
        'Electric': { weak: ['Water', 'Flying'],         resist: ['Electric', 'Grass', 'Dragon'], immune: ['Ground'] },
        'Grass':    { weak: ['Water', 'Ground', 'Rock'], resist: ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'], immune: [] },
        'Ice':      { weak: ['Grass', 'Ground', 'Flying', 'Dragon'], resist: ['Fire', 'Water', 'Ice', 'Steel'], immune: [] },
        'Fighting': { weak: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'], resist: ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'], immune: ['Ghost'] },
        'Poison':   { weak: ['Grass', 'Fairy'],          resist: ['Poison', 'Ground', 'Rock', 'Ghost'], immune: ['Steel'] },
        'Ground':   { weak: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'], resist: ['Grass', 'Bug'], immune: ['Flying'] },
        'Flying':   { weak: ['Grass', 'Fighting', 'Bug'], resist: ['Electric', 'Rock', 'Steel'], immune: [] },
        'Psychic':  { weak: ['Fighting', 'Poison'],      resist: ['Psychic', 'Steel'],   immune: ['Dark'] },
        'Bug':      { weak: ['Grass', 'Psychic', 'Dark'], resist: ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'], immune: [] },
        'Rock':     { weak: ['Fire', 'Ice', 'Flying', 'Bug'], resist: ['Fighting', 'Ground', 'Steel'], immune: [] },
        'Ghost':    { weak: ['Psychic', 'Ghost'],        resist: ['Dark'],               immune: ['Normal'] },
        'Dragon':   { weak: ['Dragon'],                  resist: ['Steel'],              immune: ['Fairy'] },
        'Dark':     { weak: ['Psychic', 'Ghost'],        resist: ['Fighting', 'Dark', 'Fairy'], immune: [] },
        'Steel':    { weak: ['Ice', 'Rock', 'Fairy'],    resist: ['Fire', 'Water', 'Electric', 'Steel'], immune: [] },
        'Fairy':    { weak: ['Fighting', 'Dark', 'Dragon'], resist: ['Fire', 'Poison', 'Steel'], immune: [] },
    };
    
    const chart = TYPE_CHART[atkType];
    if (!chart) return 1;
    
    let multiplier = 1;
    for (const defType of defTypes) {
        if (chart.immune.includes(defType)) return 0;
        if (chart.weak.includes(defType)) multiplier *= 2;
        if (chart.resist.includes(defType)) multiplier *= 0.5;
    }
    
    return multiplier;
}

/**
 * 技能评分（用于排序）
 * @param {Pokemon} attacker - 攻击方
 * @param {Pokemon} defender - 防御方
 * @param {Object} move - 技能数据
 * @param {Pokemon[]} aiParty - AI 队伍（用于折返技能检查）
 */
function calcMoveScore(attacker, defender, move, aiParty = null) {
    if (!move) return -9999;

    const moveName = move.name || '';
    
    // =========================================================
    // -1. 定身法/诅咒之躯/怨恨封印检查 (Disable/Cursed Body/Grudge)
    // 被封印的招式完全禁止使用
    // =========================================================
    if (attacker.volatile) {
        // 定身法/诅咒之躯封印
        if (attacker.volatile.disable > 0 && attacker.volatile.disabledMove === moveName) {
            console.log(`[AI BAN] ${moveName} 被定身法/诅咒之躯封印`);
            return -99999;
        }
        // 怨恨封印
        if (attacker.volatile.grudgeSealed && attacker.volatile.grudgeSealed.includes(moveName)) {
            console.log(`[AI BAN] ${moveName} 被怨恨封印`);
            return -99999;
        }
    }
    
    // =========================================================
    // 0. Z-Move / Max Move 全场唯一限制 (Once Per Battle)
    // 这些超强技能只能使用一次，用过就永久封印
    // =========================================================
    
    // 获取技能数据判断是否为 Z/Max 招式
    const moveId = (moveName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const moveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // 检测 Z 招式：isZ 字段 或 isNonstandard === 'Past' 且 PP === 1
    const isZMove = moveData.isZ || 
        (moveData.pp === 1 && moveData.basePower >= 100 && moveData.isNonstandard === 'Past');
    
    // 检测极巨招式：isMax 字段 或 名称包含 Max/G-Max
    const isMaxMove = moveData.isMax || 
        moveName.startsWith('Max ') || moveName.startsWith('G-Max ');
    
    // 如果是 Z 招式且 AI 已经用过，永久封印
    if (isZMove && typeof battle !== 'undefined' && battle.enemyZUsed) {
        console.log(`[AI BAN] Z-Move "${moveName}" 已使用过，禁止再次使用`);
        return -99999;
    }
    
    // 【修复】极巨招式的禁用逻辑：
    // - 如果当前宝可梦处于极巨化状态，可以使用极巨招式
    // - 如果当前宝可梦不在极巨化状态，且 AI 已经用过极巨化，禁止使用极巨招式
    // （因为极巨化结束后招式会恢复为普通招式，不应该出现极巨招式）
    if (isMaxMove && typeof battle !== 'undefined') {
        // 如果当前宝可梦不在极巨化状态，极巨招式不应该出现在招式列表中
        if (!attacker.isDynamaxed) {
            console.log(`[AI BAN] Max Move "${moveName}" 当前未极巨化，禁止使用`);
            return -99999;
        }
        // 极巨化状态下可以正常使用极巨招式，不禁止
    }
    
    // =========================================================
    // 1. 复杂技能黑名单 (Complex Move Blacklist)
    // 引擎未实现的复杂机制技能，禁止 AI 使用
    // =========================================================
    const ENGINE_BANS = [
        // 延迟伤害技能（需要全局队列）
        'Future Sight', 'Doom Desire',
        
        // 双打专用技能
        'Ally Switch', 'Helping Hand', 'Follow Me', 'Rage Powder',
        'Wide Guard', 'Quick Guard', 'After You', 'Instruct', 'Quash',
        
        // 道具交换/移除类（道具系统未完善）
        'Switcheroo', 'Trick', 'Bestow', 'Fling', 'Thief', 'Covet',
        
        // 特性交换类（过于复杂）
        'Skill Swap', 'Entrainment', 'Role Play', 'Doodle'
    ];
    
    if (ENGINE_BANS.includes(moveName)) {
        return -99999; // 永远不选
    }
    
    // =========================================================
    // 2. 条件型限制技能检查 (Context-based Restrictions)
    // 使用 moves-data.js 的数据驱动判断
    // =========================================================
    
    // 【修复】优先使用传入的 move 参数（已经是 getMergedMoveData 处理过的）
    // 只有当 move 没有 boosts/target 时才回退到 moveData
    const fullMoveData = {
        ...moveData,
        ...move,
        boosts: move.boosts || moveData.boosts || null,
        target: move.target || moveData.target || 'normal'
    };
    const moveFlags = fullMoveData.flags || {};
    
    // =========================================================
    // ConditionChecker: 条件限制检查器
    // 检查招式在当前环境下是否合法/理智
    // =========================================================
    
    // [类型0: 已有自我状态检查] - 已有 volatile 状态时禁止重复使用
    // 这是最高优先级的检查，避免 AI 浪费回合
    if (fullMoveData.volatileStatus && fullMoveData.target === 'self') {
        const volatileKey = fullMoveData.volatileStatus;
        // 可叠加状态除外（stockpile 由后续逻辑处理）
        const stackableVolatiles = ['stockpile'];
        // 刷新型状态可以重复使用
        const refreshableVolatiles = ['charge', 'laserfocus', 'defensecurl'];
        
        if (!stackableVolatiles.includes(volatileKey) && 
            !refreshableVolatiles.includes(volatileKey) &&
            attacker.volatile && attacker.volatile[volatileKey]) {
            console.log(`[AI BAN] ${moveName}：已有 ${volatileKey} 状态，禁止重复使用`);
            return -99999;
        }
    }
    
    // [类型1: 首回合限定组] - Fake Out, First Impression, Mat Block
    const firstTurnOnlyMoves = ['Fake Out', 'First Impression', 'Mat Block'];
    if (firstTurnOnlyMoves.includes(moveName) && (attacker.turnsOnField || 0) > 0) {
        console.log(`[AI BAN] ${moveName} 只能在首回合使用，当前 turnsOnField=${attacker.turnsOnField}`);
        return -9999; // 非首回合，必定失败
    }
    
    // [类型2: 连发惩罚组] - Protect, Detect, King's Shield 等
    // 连续使用守住类技能成功率大幅下降
    const protectMoves = ['Protect', 'Detect', 'Spiky Shield', "King's Shield", 'Baneful Bunker', 
                          'Obstruct', 'Silk Trap', 'Burning Bulwark', 'Endure', 'Wide Guard', 'Quick Guard'];
    if (protectMoves.includes(moveName)) {
        const lastMove = attacker.lastMoveUsed || '';
        if (protectMoves.includes(lastMove)) {
            console.log(`[AI BAN] ${moveName} 连续使用，成功率极低，禁止选择`);
            return -8000; // 连续使用守住类技能，极大降低权重
        }
    }
    
    // [类型3: 先制博弈组] - Sucker Punch
    // 如果对手上回合使用变化技，突袭大概率会失败
    if (moveName === 'Sucker Punch') {
        const defenderLastMove = defender.lastMoveUsed || '';
        const defenderLastMoveId = defenderLastMove.toLowerCase().replace(/[^a-z0-9]/g, '');
        const defenderLastMoveData = (typeof MOVES !== 'undefined' && MOVES[defenderLastMoveId]) ? MOVES[defenderLastMoveId] : {};
        const lastMoveCategory = (defenderLastMoveData.category || '').toLowerCase();
        
        // 如果对手上回合用的是变化技，降低突袭优先级
        if (lastMoveCategory === 'status') {
            console.log(`[AI WARN] 对手上回合使用变化技 ${defenderLastMove}，突袭可能失败`);
            return -500; // 降低优先级但不完全禁止
        }
    }
    
    // [类型4: 状态冗余组] - 状态技对已有状态/免疫属性无效
    // 【优化】从 moves-data.js 动态读取状态招式信息
    const moveStatus = fullMoveData.status; // 直接从招式数据获取状态类型
    const defenderTypes = defender.types || [];
    const defenderAbility = (defender.ability || '').toLowerCase().replace(/[^a-z]/g, '');
    
    if (moveStatus) {
        // 检查已有状态
        if (defender.status) {
            console.log(`[AI BAN] ${moveName} 对已有状态 ${defender.status} 的目标无效`);
            return -9999;
        }
        
        // 粉末类招式对草系免疫
        if (moveFlags.powder && defenderTypes.includes('Grass')) {
            console.log(`[AI BAN] ${moveName} 粉末招式对草系无效`);
            return -9999;
        }
        
        // 电系招式对地面系免疫（电磁波）
        if (fullMoveData.type === 'Electric' && defenderTypes.includes('Ground')) {
            console.log(`[AI BAN] ${moveName} 电系招式对地面系无效`);
            return -9999;
        }
        
        // 火系免疫烧伤
        if (moveStatus === 'brn' && defenderTypes.includes('Fire')) {
            console.log(`[AI BAN] ${moveName} 对火系无效`);
            return -9999;
        }
        
        // 毒/钢系免疫中毒
        if ((moveStatus === 'psn' || moveStatus === 'tox') && 
            (defenderTypes.includes('Poison') || defenderTypes.includes('Steel'))) {
            console.log(`[AI BAN] ${moveName} 对毒/钢系无效`);
            return -9999;
        }
        
        // 电系免疫麻痹
        if (moveStatus === 'par' && defenderTypes.includes('Electric')) {
            console.log(`[AI BAN] ${moveName} 对电系无效`);
            return -9999;
        }
        
        // 睡眠状态特殊检查
        if (moveStatus === 'slp') {
            // 【软编码】从 AbilityHandlers 读取睡眠免疫特性列表
            const sleepImmuneAbilities = (typeof AbilityHandlers !== 'undefined' && AbilityHandlers._sleepImmuneAbilities) 
                ? AbilityHandlers._sleepImmuneAbilities 
                : ['insomnia', 'vitalspirit', 'comatose', 'purifyingsalt', 'sweetveil'];
            if (sleepImmuneAbilities.includes(defenderAbility)) {
                console.log(`[AI BAN] ${moveName} 对 ${defender.ability} 特性无效（睡眠免疫）`);
                return -9999;
            }
            
            // 电气场地免疫睡眠
            const battle = window.battle;
            if (battle?.terrain === 'electricterrain') {
                const isGrounded = !defenderTypes.includes('Flying') && defenderAbility !== 'levitate';
                if (isGrounded) {
                    console.log(`[AI BAN] ${moveName} 在电气场地中对地面单位无效`);
                    return -9999;
                }
            }
        }
    }
    
    // 4b. 天气技对已存在的相同天气无效
    // 【修复】使用实际的天气值（小写）进行匹配
    const weatherMoves = {
        'Rain Dance': 'rain',
        'Sunny Day': 'sun', 
        'Sandstorm': 'sandstorm',
        'Hail': 'hail',
        'Snowscape': 'snow'
    };
    if (weatherMoves[moveName]) {
        // 检查 battle.weather（直接属性）或 battle.field.weather
        const currentWeather = (typeof battle !== 'undefined' && battle.weather) || 
                               (typeof battle !== 'undefined' && battle.field && battle.field.weather) || '';
        if (currentWeather === weatherMoves[moveName]) {
            console.log(`[AI BAN] ${moveName} 天气已存在 (${currentWeather})，禁止使用`);
            return -9999;
        }
    }
    
    // [类型5: HP依赖组] - Explosion, Self-Destruct, Final Gambit, Destiny Bond
    const selfKOMoves = ['Explosion', 'Self-Destruct', 'Final Gambit', 'Memento', 'Healing Wish', 'Lunar Dance'];
    const hpPercentCheck = attacker.currHp / attacker.maxHp;
    
    if (selfKOMoves.includes(moveName)) {
        // Final Gambit 伤害等于自身当前HP，低HP时毫无意义
        if (moveName === 'Final Gambit' && attacker.currHp < defender.currHp * 0.3) {
            console.log(`[AI BAN] Final Gambit HP过低 (${attacker.currHp})，伤害不足`);
            return -9000;
        }
        
        // 大爆炸/自爆：满血且队伍还有其他成员时不要送
        if ((moveName === 'Explosion' || moveName === 'Self-Destruct') && hpPercentCheck > 0.7) {
            const aliveCount = (aiParty || []).filter(p => p && p.currHp > 0).length;
            if (aliveCount > 1) {
                console.log(`[AI WARN] ${moveName} 满血且队伍还有 ${aliveCount} 只，降低优先级`);
                return -2000; // 大幅降低但不完全禁止
            }
        }
        
        // 检查对手是否有湿气特性（免疫爆炸）
        const defenderAbility = (defender.ability || '').toLowerCase();
        if ((moveName === 'Explosion' || moveName === 'Self-Destruct') && defenderAbility === 'damp') {
            console.log(`[AI BAN] 对手有湿气特性，${moveName} 无效`);
            return -9999;
        }
    }
    
    // Destiny Bond 连续使用会失败（但失败后连锁重置，下回合可以再成功）
    // 【修复】检查的是 lastDestinyBondSuccess，而不是 lastMoveUsed
    if (moveName === 'Destiny Bond' && attacker.lastDestinyBondSuccess) {
        console.log(`[AI BAN] Destiny Bond 连续使用必定失败`);
        return -9999;
    }
    
    // Grudge 同理
    if (moveName === 'Grudge' && attacker.lastGrudgeSuccess) {
        console.log(`[AI BAN] Grudge 连续使用必定失败`);
        return -9999;
    }
    
    // 睡眠状态才能用的技能
    if (moveFlags.nosleeptalk === undefined && (moveName === 'Sleep Talk' || moveName === 'Snore')) {
        if (attacker.status !== 'slp') {
            return -5000;
        }
    }
    
    // 需要对手睡眠的技能
    if (fullMoveData.sleepUsable || moveName === 'Dream Eater') {
        if (defender.status !== 'slp') {
            return -5000;
        }
    }
    
    // =========================================================
    // 3. 核心战术强制执行 (Force Setup Logic)
    // 使用 moves-data.js 数据驱动判断技能类型
    // =========================================================
    
    const itemName = (attacker.item || '').toLowerCase().replace(/[^a-z]/g, '');
    const hasFocusSash = itemName === 'focussash';
    const hpPercent = attacker.currHp / attacker.maxHp;
    
    // [A] 场地技能检测 (pseudoWeather 类)
    // Trick Room, Magic Room, Wonder Room, Gravity 等
    if (fullMoveData.pseudoWeather) {
        const fieldType = fullMoveData.pseudoWeather;
        
        // 【修复】字段名映射：pseudoWeather 用小写，但 battle.field 用驼峰
        // 完整映射所有 pseudoWeather 类型
        const fieldKeyMap = {
            'trickroom': 'trickRoom',
            'magicroom': 'magicRoom',
            'wonderroom': 'wonderRoom',
            'gravity': 'gravity',
            'fairylock': 'fairyLock',
            'iondeluge': 'ionDeluge',
            'mudsport': 'mudSport',
            'watersport': 'waterSport'
        };
        const fieldKey = fieldKeyMap[fieldType] || fieldType;
        
        // 检查场地是否已开启
        if (typeof battle !== 'undefined' && battle.field && battle.field[fieldKey] > 0) {
            console.log(`[AI TACTIC] ${fieldType} 已开启 (${battle.field[fieldKey]} 回合)，不再使用`);
            return -9999;
        }
        
        // Trick Room 特殊处理：空间队核心
        if (fieldType === 'trickroom' && (hpPercent >= 0.4 || hasFocusSash)) {
            console.log(`[AI TACTIC] ${attacker.cnName} 必须开 Trick Room！`);
            return 50000;
        }
        
        // 其他场地技能
        if (hpPercent >= 0.5) {
            return 25000;
        }
    }
    
    // [B] 场地技能 (sideCondition 类)
    // 分两类：己方场地（Tailwind, Reflect, Light Screen, Aurora Veil）和敌方场地（钉子类）
    if (fullMoveData.sideCondition) {
        const sideType = fullMoveData.sideCondition;
        const target = fullMoveData.target || 'foeSide';
        const isAiAttacker = typeof battle !== 'undefined' && attacker !== battle.getPlayer?.();
        
        // 根据 target 字段判断作用于哪一方场地
        let targetSide = null;
        if (target === 'foeSide') {
            // 钉子类：AI 撒钉子作用于玩家场地
            targetSide = isAiAttacker ? battle.playerSide : battle.enemySide;
        } else if (target === 'allySide' || target === 'self') {
            // 己方增益：AI 使用作用于己方场地
            targetSide = isAiAttacker ? battle.enemySide : battle.playerSide;
        }
        
        // === 钉子类技能：检查是否已满层 ===
        if (['stealthrock', 'spikes', 'toxicspikes', 'stickyweb'].includes(sideType) && targetSide) {
            // 检查各类钉子的上限
            if (sideType === 'spikes' && (targetSide.spikes || 0) >= 3) {
                console.log(`[AI BAN] Spikes 已满3层，禁止使用`);
                return -9999;
            }
            if (sideType === 'toxicspikes' && (targetSide.toxicSpikes || targetSide.toxicspikes || 0) >= 2) {
                console.log(`[AI BAN] Toxic Spikes 已满2层，禁止使用`);
                return -9999;
            }
            if (sideType === 'stealthrock' && targetSide.stealthRock) {
                console.log(`[AI BAN] Stealth Rock 已存在，禁止使用`);
                return -9999;
            }
            if (sideType === 'stickyweb' && targetSide.stickyWeb) {
                console.log(`[AI BAN] Sticky Web 已存在，禁止使用`);
                return -9999;
            }
            
            // === 关键修复：对手正在强化时，降低撒钉子的优先级 ===
            // 如果对手攻击等级 >= 2，撒钉子就是送死行为
            const defenderBoosts = defender.boosts || {};
            const defenderAtkBoost = defenderBoosts.atk || 0;
            const defenderSpaBoost = defenderBoosts.spa || 0;
            if (defenderAtkBoost >= 2 || defenderSpaBoost >= 2) {
                console.log(`[AI TACTIC] 对手已强化 (atk:${defenderAtkBoost}, spa:${defenderSpaBoost})，放弃撒钉子`);
                return -500; // 大幅降低优先级，转而攻击
            }
            
            // 【优化】对手剩余存活数量越多，钉子价值越高
            let enemyAliveForHazard = 1;
            if (typeof battle !== 'undefined' && battle.playerParty) {
                enemyAliveForHazard = battle.playerParty.filter(p => p && p.currHp > 0).length;
            }
            const hazardPartyBonus = (enemyAliveForHazard - 1) * 200; // 每多一只 +200
            
            // 首发撒钉：血量健康且对手没强化时才撒
            if (hpPercent >= 0.85) {
                const baseScore = 2500 + hazardPartyBonus + Math.random() * 500;
                console.log(`[AI TACTIC] ${attacker.cnName} 首发撒钉: ${moveName} (对手剩${enemyAliveForHazard}只，分数${Math.round(baseScore)})`);
                return baseScore;
            }
            // 【优化】中等血量时，如果对手队伍大，仍可考虑撒钉
            if (hpPercent >= 0.6 && enemyAliveForHazard >= 3) {
                const midScore = 800 + hazardPartyBonus + Math.random() * 300;
                console.log(`[AI TACTIC] ${attacker.cnName} 中期补钉: ${moveName} (对手剩${enemyAliveForHazard}只，分数${Math.round(midScore)})`);
                return midScore;
            }
            // 血量不足或对手队伍小，不撒钉子
            return -100;
        }
        
        // === 己方增益类技能 ===
        if (targetSide) {
            // 检查是否已存在（己方增益类）
            const keyMap = {
                'tailwind': 'tailwind',
                'reflect': 'reflect', 
                'lightscreen': 'lightScreen',
                'auroraveil': 'auroraVeil'
            };
            const key = keyMap[sideType] || sideType;
            if (targetSide[key] > 0) {
                return -500; // 已存在，不重复使用
            }
        }
        
        // 顺风：高优先级
        if (sideType === 'tailwind' && hpPercent >= 0.5) {
            return 40000;
        }
        
        // 双墙/极光幕：高优先级
        if (['reflect', 'lightscreen', 'auroraveil'].includes(sideType) && hpPercent >= 0.6) {
            console.log(`[AI TACTIC] ${attacker.cnName} 开启防护墙: ${moveName}`);
            return 15000;
        }
    }
    
    // [C] 天气技能检测 (weather 类)
    if (fullMoveData.weather) {
        if (hpPercent >= 0.5) {
            return 30000;
        }
    }
    
    // [D] 催眠技能检测 (status: 'slp')
    if (fullMoveData.status === 'slp') {
        if (!defender.status && (!defender.volatile || !defender.volatile.yawn)) {
            // 根据命中率给分：100% 命中的更高分
            const accuracy = fullMoveData.accuracy === true ? 100 : (fullMoveData.accuracy || 75);
            const sleepBonus = accuracy >= 100 ? 8000 : (accuracy >= 75 ? 6000 : 4000);
            console.log(`[AI TACTIC] ${attacker.cnName} 尝试催眠: ${moveName} (命中率: ${accuracy})`);
            return sleepBonus;
        } else {
            return -500;
        }
    }
    
    // [E] 强化技能检测 (boosts 且 target: 'self')
    const isSelfBoost = fullMoveData.boosts && 
        ['self', 'allySide', 'adjacentAllyOrSelf'].includes(fullMoveData.target);
    
    // 【调试】输出强化技检测信息
    if (moveName === 'Iron Defense' || moveName === 'Swords Dance' || moveName === 'Calm Mind') {
        console.log(`[AI BOOST DEBUG] ${moveName}: boosts=`, fullMoveData.boosts, 'target=', fullMoveData.target, 'isSelfBoost=', isSelfBoost);
        console.log(`[AI BOOST DEBUG] attacker.boosts=`, attacker.boosts);
    }
    
    if (isSelfBoost) {
        const boosts = fullMoveData.boosts;
        // 检查主要强化的能力
        const atkBoost = boosts.atk || 0;
        const spaBoost = boosts.spa || 0;
        const speBoost = boosts.spe || 0;
        const defBoost = boosts.def || 0;
        const spdBoost = boosts.spd || 0;
        
        // 【修复】检查所有正面强化是否已满级 (+6)
        // 如果该技能强化的能力已经满级，直接返回负分
        const currentBoosts = attacker.boosts || {};
        for (const stat of Object.keys(boosts)) {
            const boostValue = boosts[stat];
            if (boostValue > 0) { // 只检查正面强化
                const currentValue = currentBoosts[stat] || 0;
                console.log(`[AI BOOST CHECK] ${moveName}: ${stat} boost=${boostValue}, current=${currentValue}`);
                if (currentValue >= 6) {
                    console.log(`[AI TACTIC] ${attacker.cnName} 的 ${stat} 已满级 (+6)，禁止使用 ${moveName}`);
                    return -9999; // 满级后绝对不能再用
                }
            }
        }
        
        // 【关键修复】威胁检查：如果对方速度更快且有克制技能，不要强化
        const mySpeed = getEffectiveSpeed(attacker);
        const oppSpeed = getEffectiveSpeed(defender);
        const playerFaster = oppSpeed > mySpeed;
        
        if (playerFaster) {
            // 检查对方是否有克制技能
            let hasSuper = false;
            for (const pMove of (defender.moves || [])) {
                const pMoveType = pMove.type || 'Normal';
                const eff = getTypeEffectivenessAI(pMoveType, attacker.types || ['Normal']);
                if (eff >= 2) {
                    hasSuper = true;
                    break;
                }
            }
            
            // 如果对方速度快且有克制技能，强化是自杀行为
            if (hasSuper) {
                console.log(`[AI TACTIC] ${attacker.cnName} 放弃强化：对方速度快且有克制技能`);
                return -500;
            }
            
            // 即使没有克制，检查是否会被 2HKO
            let maxIncoming = 0;
            for (const pMove of (defender.moves || [])) {
                const mergedMove = getMergedMoveData(pMove);
                const dmgResult = simulateDamage(defender, attacker, mergedMove);
                if (dmgResult.damage > maxIncoming) maxIncoming = dmgResult.damage;
            }
            if (maxIncoming * 2 >= attacker.currHp) {
                console.log(`[AI TACTIC] ${attacker.cnName} 放弃强化：会被 2HKO (${maxIncoming}x2 >= ${attacker.currHp})`);
                return -500;
            }
        }
        
        // 攻击/特攻强化
        if (atkBoost > 0 || spaBoost > 0) {
            const relevantStat = atkBoost > 0 ? 'atk' : 'spa';
            const currentBoost = (attacker.boosts && attacker.boosts[relevantStat]) || 0;
            
            // 已经 +2 或更高，停止强化
            if (currentBoost >= 2) {
                console.log(`[AI TACTIC] ${attacker.cnName} 已强化 ${currentBoost} 级，停止强化`);
                return -100;
            }
            
            // 血量健康时强化
            if (hpPercent >= 0.8) {
                console.log(`[AI TACTIC] ${attacker.cnName} 安全强化: ${moveName}`);
                return 3500;
            } else if (hpPercent >= 0.5) {
                return 1500;
            }
        }
        
        // 速度强化（龙舞、蝶舞等）
        if (speBoost > 0 && (atkBoost > 0 || spaBoost > 0)) {
            if (hpPercent >= 0.7) {
                return 4000; // 龙舞类更有价值
            }
        }
    }
    
    const category = (move.cat || move.category || '').toLowerCase();
    const isStatus = category === 'status' || move.power === 0 || move.basePower === 0;
    
    // =========================================================
    // 【Anti-Spam 修正】替身 (Substitute) 特殊处理
    // 防止 AI 无限循环使用替身
    // =========================================================
    if (moveName === 'Substitute') {
        // 1. 血量过低绝对不用（< 30%）
        if (hpPercent < 0.30) {
            console.log(`[AI BAN] ${attacker.cnName} 血量过低 (${Math.round(hpPercent * 100)}%)，禁止使用替身`);
            return -9999;
        }
        
        // 2. 已有替身绝对不用
        if (attacker.volatile && attacker.volatile.substitute && attacker.volatile.substitute > 0) {
            console.log(`[AI BAN] ${attacker.cnName} 已有替身，禁止重复使用`);
            return -9999;
        }
        
        // 3. 连续使用惩罚：如果上回合用了替身，大幅降分
        if (attacker.lastMoveUsed === 'Substitute') {
            console.log(`[AI PENALTY] ${attacker.cnName} 上回合已用替身，降低优先级`);
            return -500;
        }
        
        // 4. 血量中等时（30%-50%），替身价值降低
        if (hpPercent < 0.50) {
            return 20; // 低优先级
        }
        
        // 5. 对手残血时，不要用替身，应该进攻
        const defenderHpPercent = defender.currHp / defender.maxHp;
        if (defenderHpPercent < 0.30) {
            console.log(`[AI TACTIC] 对手残血，${attacker.cnName} 应该进攻而非替身`);
            return -200;
        }
        
        // 6. 正常情况下替身是中等优先级
        return 50;
    }

    // =========================================================
    // 【高风险招式评估】腹鼓/甩肉/魂舞烈音爆等扣血强化技
    // =========================================================
    
    // 【腹鼓】消耗50%HP，攻击直接+6
    if (moveName === 'Belly Drum') {
        const cost = Math.floor(attacker.maxHp / 2);
        // 血量不足50%，必定失败
        if (attacker.currHp <= cost) {
            console.log(`[AI BAN] Belly Drum：血量不足 50%，会失败`);
            return -99999;
        }
        // 攻击已满级
        if (attacker.boosts && attacker.boosts.atk >= 6) {
            console.log(`[AI BAN] Belly Drum：攻击已满级`);
            return -99999;
        }
        // 对手残血时，直接进攻更好
        const defHpPercent = defender.currHp / defender.maxHp;
        if (defHpPercent < 0.30) {
            console.log(`[AI TACTIC] 对手残血，直接进攻而非腹鼓`);
            return -500;
        }
        // 检查是否会被秒杀（腹鼓后剩余50%血）
        let maxIncoming = 0;
        for (const pMove of (defender.moves || [])) {
            const mergedMove = getMergedMoveData(pMove);
            const dmgResult = simulateDamage(defender, attacker, mergedMove);
            if (dmgResult.damage > maxIncoming) maxIncoming = dmgResult.damage;
        }
        const hpAfterDrum = attacker.currHp - cost;
        if (maxIncoming >= hpAfterDrum) {
            console.log(`[AI BAN] Belly Drum：腹鼓后会被秒杀 (${maxIncoming} >= ${hpAfterDrum})`);
            return -9999;
        }
        // 血量健康且安全时，腹鼓是极高价值
        if (hpPercent >= 0.80) {
            console.log(`[AI TACTIC] ${attacker.cnName} 安全使用腹鼓！`);
            return 8000; // 极高优先级
        } else if (hpPercent >= 0.55) {
            return 5000;
        }
        return 100; // 风险较高时降低优先级
    }

    // 【甩肉】消耗50%HP，攻/特攻/速度+2
    if (moveName === 'Fillet Away') {
        const cost = Math.floor(attacker.maxHp / 2);
        if (attacker.currHp <= cost) {
            console.log(`[AI BAN] Fillet Away：血量不足 50%，会失败`);
            return -99999;
        }
        // 检查是否所有能力都已满级
        const boosts = attacker.boosts || {};
        if ((boosts.atk || 0) >= 6 && (boosts.spa || 0) >= 6 && (boosts.spe || 0) >= 6) {
            console.log(`[AI BAN] Fillet Away：能力已满级`);
            return -99999;
        }
        // 对手残血时直接进攻
        const defHpPercent = defender.currHp / defender.maxHp;
        if (defHpPercent < 0.30) {
            return -500;
        }
        // 检查是否会被秒杀
        let maxIncoming = 0;
        for (const pMove of (defender.moves || [])) {
            const mergedMove = getMergedMoveData(pMove);
            const dmgResult = simulateDamage(defender, attacker, mergedMove);
            if (dmgResult.damage > maxIncoming) maxIncoming = dmgResult.damage;
        }
        const hpAfter = attacker.currHp - cost;
        if (maxIncoming >= hpAfter) {
            console.log(`[AI BAN] Fillet Away：使用后会被秒杀`);
            return -9999;
        }
        if (hpPercent >= 0.80) {
            return 6000;
        } else if (hpPercent >= 0.55) {
            return 4000;
        }
        return 100;
    }

    // 【魂舞烈音爆】消耗33%HP，全属性+1
    if (moveName === 'Clangorous Soul') {
        const cost = Math.floor(attacker.maxHp / 3);
        if (attacker.currHp <= cost) {
            console.log(`[AI BAN] Clangorous Soul：血量不足 33%，会失败`);
            return -99999;
        }
        // 检查是否所有能力都已满级
        const boosts = attacker.boosts || {};
        const allMaxed = ['atk', 'def', 'spa', 'spd', 'spe'].every(s => (boosts[s] || 0) >= 6);
        if (allMaxed) {
            console.log(`[AI BAN] Clangorous Soul：能力已满级`);
            return -99999;
        }
        const defHpPercent = defender.currHp / defender.maxHp;
        if (defHpPercent < 0.30) {
            return -500;
        }
        // 检查是否会被秒杀
        let maxIncoming = 0;
        for (const pMove of (defender.moves || [])) {
            const mergedMove = getMergedMoveData(pMove);
            const dmgResult = simulateDamage(defender, attacker, mergedMove);
            if (dmgResult.damage > maxIncoming) maxIncoming = dmgResult.damage;
        }
        const hpAfter = attacker.currHp - cost;
        if (maxIncoming >= hpAfter) {
            console.log(`[AI BAN] Clangorous Soul：使用后会被秒杀`);
            return -9999;
        }
        if (hpPercent >= 0.70) {
            return 5000;
        } else if (hpPercent >= 0.40) {
            return 3000;
        }
        return 100;
    }

    // 【搏命】造成等于自身当前HP的伤害，自己濒死
    if (moveName === 'Final Gambit') {
        // 只有在能击杀对手时才使用
        if (attacker.currHp >= defender.currHp) {
            // 自己残血时更愿意搏命
            if (hpPercent < 0.30) {
                console.log(`[AI TACTIC] ${attacker.cnName} 残血搏命！`);
                return 7000;
            }
            // 能击杀且自己血量不高
            if (hpPercent < 0.50) {
                return 4000;
            }
        }
        // 不能击杀或自己血量健康，不值得
        return -500;
    }

    // 【同命】如果这回合被击倒，击倒自己的对手也会倒下
    if (moveName === 'Destiny Bond') {
        // 连续使用会失败
        if (attacker.lastMoveUsed === 'Destiny Bond') {
            return -99999;
        }
        // 残血时同命价值极高
        if (hpPercent < 0.25) {
            console.log(`[AI TACTIC] ${attacker.cnName} 残血使用同命！`);
            return 6000;
        }
        if (hpPercent < 0.40) {
            return 3000;
        }
        // 血量健康时不值得
        return -100;
    }

    // 【治愈之愿/新月祈祷】自己濒死治愈队友
    if (moveName === 'Healing Wish' || moveName === 'Lunar Dance') {
        // 只有在残血且队伍有其他受伤成员时才使用
        if (hpPercent < 0.25) {
            // 简化：残血时给予中等分数
            return 2000;
        }
        // 血量健康时不值得牺牲
        return -9999;
    }
    
    // === 变化技评分 ===
    if (isStatus) {
        let statusScore = 10;
        
        // =========================================================
        // 【Soft-Coded】使用 MOVES 数据中的 volatileStatus 字段判断
        // 自我施加 volatile 状态的技能：已有状态时禁止重复使用
        // =========================================================
        if (fullMoveData.volatileStatus && fullMoveData.target === 'self') {
            const volatileKey = fullMoveData.volatileStatus;
            
            // 【特殊处理】Stockpile 是可叠加的（最多3层），需要特殊逻辑
            if (volatileKey === 'stockpile') {
                const currentStacks = (attacker.volatile && attacker.volatile.stockpile) || 0;
                
                // 已满3层，禁止继续使用
                if (currentStacks >= 3) {
                    console.log(`[AI BAN] Stockpile：已满 ${currentStacks}/3 层，禁止继续使用`);
                    return -99999;
                }
                
                // 残血时不要蓄力（浪费回合）
                if (hpPercent < 0.35) {
                    console.log(`[AI BAN] Stockpile：残血 (${Math.round(hpPercent * 100)}%) 不应继续蓄力`);
                    return -99999;
                }
                
                // 已有2层且血量不高，不要继续蓄力
                if (currentStacks >= 2 && hpPercent < 0.60) {
                    console.log(`[AI PENALTY] Stockpile：已有 ${currentStacks} 层且血量不足，降低优先级`);
                    return 5;
                }
                
                // 正常情况下给予较低优先级（不应该无脑蓄力）
                return 25;
            }
            
            // 1. 已有状态，禁止重复使用
            if (attacker.volatile && attacker.volatile[volatileKey]) {
                console.log(`[AI BAN] ${moveName}：已有 ${volatileKey} 状态，禁止重复使用`);
                return -99999;
            }
            
            // 2. 持续回复类 volatile (aquaring, ingrain) 在残血时无意义
            const hotVolatiles = ['aquaring', 'ingrain'];
            if (hotVolatiles.includes(volatileKey)) {
                if (hpPercent < 0.30) {
                    console.log(`[AI BAN] ${moveName}：残血 (${Math.round(hpPercent * 100)}%) 使用持续回复无意义`);
                    return -99999;
                }
                if (hpPercent < 0.50) {
                    console.log(`[AI PENALTY] ${moveName}：血量不足 (${Math.round(hpPercent * 100)}%)，降低优先级`);
                    return 5;
                }
                if (hpPercent >= 0.70) {
                    return 40;
                }
                return 15;
            }
            
            // 3. focusenergy: 已有状态禁止重复，残血时不要聚气
            if (volatileKey === 'focusenergy') {
                // 【修复】已有聚气状态，禁止重复使用
                if (attacker.volatile && attacker.volatile.focusenergy) {
                    console.log(`[AI BAN] Focus Energy：已处于聚气状态，禁止重复使用`);
                    return -99999;
                }
                if (hpPercent < 0.30) {
                    return -100;
                }
                return 30;
            }
        }
        
        // =========================================================
        // 【特殊处理】Spit Up / Swallow 需要检查蓄力层数
        // =========================================================
        const moveId = moveName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (moveId === 'spitup' || moveId === 'swallow') {
            const stacks = (attacker.volatile && attacker.volatile.stockpile) || 0;
            if (stacks === 0) {
                console.log(`[AI BAN] ${moveName}：没有蓄力层数，无法使用`);
                return -99999;
            }
            // 有蓄力时，根据层数给予评分
            if (moveId === 'spitup') {
                // 喷出：层数越多威力越高
                return 50 + stacks * 30;
            } else {
                // 吞下：血量低时优先使用
                if (hpPercent < 0.40) return 150;
                if (hpPercent < 0.60) return 80;
                return 30;
            }
        }
        
        // =========================================================
        // 【特殊处理】Stuff Cheeks 需要检查是否持有树果
        // =========================================================
        if (moveId === 'stuffcheeks') {
            const item = attacker.item || '';
            const isBerry = item.toLowerCase().includes('berry') || item.includes('果');
            if (!item || !isBerry) {
                console.log(`[AI BAN] Stuff Cheeks：没有持有树果，无法使用`);
                return -99999;
            }
            // 有树果时，血量健康时使用价值更高
            if (hpPercent > 0.70) return 80;
            if (hpPercent > 0.50) return 50;
            return 20; // 残血时不太值得用
        }
        
        // =========================================================
        // 【Soft-Coded】对目标施加 volatile 状态的技能
        // 检查目标是否已有该状态
        // =========================================================
        if (fullMoveData.volatileStatus && fullMoveData.target !== 'self') {
            const volatileKey = fullMoveData.volatileStatus;
            
            // 目标已有该 volatile 状态，禁止使用
            if (defender.volatile && defender.volatile[volatileKey]) {
                console.log(`[AI BAN] ${moveName}：目标已有 ${volatileKey} 状态`);
                return -99999;
            }
            
            // yawn: 对手已有异常状态时无效
            if (volatileKey === 'yawn' && defender.status) {
                console.log(`[AI BAN] ${moveName}：对手已有异常状态 (${defender.status})`);
                return -99999;
            }
            
            // curse (幽灵系): 对手已被诅咒
            if (volatileKey === 'curse') {
                // 幽灵系诅咒：需要扣50%血，可能导致自杀
                if (attacker.types && attacker.types.includes('Ghost')) {
                    // 【关键修复】检查是否是最后一只宝可梦
                    const aliveCount = (aiParty || []).filter(p => p && p.currHp > 0).length;
                    const isLastPokemon = aliveCount <= 1;
                    
                    if (isLastPokemon) {
                        // 最后一只宝可梦，绝对不能自杀诅咒
                        console.log(`[AI BAN] Curse：最后一只宝可梦，禁止自杀诅咒`);
                        return -99999;
                    }
                    
                    // 【关键修复】如果有同命状态，不要用诅咒打断它（给最低分）
                    if (attacker.volatile && attacker.volatile.destinyBond) {
                        console.log(`[AI BAN] Curse：有同命状态，不要自杀打断`);
                        return -999999; // 比其他禁止招式更低，确保不会被 fallback 选中
                    }
                    
                    if (hpPercent <= 0.50) {
                        // 残血时使用诅咒是有效的献祭战术（但不是最后一只）
                        console.log(`[AI TACTIC] Curse：残血献祭诅咒！`);
                        return 3000; // 高优先级
                    }
                    
                    // 血量高于50%时，诅咒的价值较低（会损失大量HP）
                    console.log(`[AI WARN] Curse：血量 ${Math.floor(hpPercent*100)}% 较高，降低优先级`);
                    return -500; // 降低优先级但不完全禁止
                }
            }
            
            // leechseed: 对草系无效
            if (volatileKey === 'leechseed') {
                if (defender.types && defender.types.includes('Grass')) {
                    console.log(`[AI BAN] Leech Seed：对手是草系，无效`);
                    return -99999;
                }
                const defHpPercent = defender.currHp / defender.maxHp;
                if (defHpPercent < 0.20) {
                    return 5;
                }
                return 50;
            }
        }
        
        // =========================================================
        // 【控制招式】Mean Look / Block / Spider Web 等
        // 对手已被困住时禁止重复使用
        // =========================================================
        const trappingMoves = ['Mean Look', 'Block', 'Spider Web', 'Anchor Shot', 'Spirit Shackle', 'Jaw Lock'];
        if (trappingMoves.includes(moveName)) {
            // 对手已被困住
            if (defender.volatile && defender.volatile.cantEscape) {
                console.log(`[AI BAN] ${moveName}：对手已被困住，无效`);
                return -99999;
            }
            // 对手是幽灵系，免疫
            if (defender.types && defender.types.includes('Ghost')) {
                console.log(`[AI BAN] ${moveName}：对手是幽灵系，免疫`);
                return -99999;
            }
            // 控制招式有一定价值
            return 80;
        }
        
        // =========================================================
        // 【灭亡之歌】Perish Song - 双方都已有状态时禁止使用
        // =========================================================
        if (moveName === 'Perish Song') {
            // 任意一方已有灭亡之歌状态，禁止使用
            const attackerHasPerish = attacker.volatile && attacker.volatile.perishsong;
            const defenderHasPerish = defender.volatile && defender.volatile.perishsong;
            if (attackerHasPerish || defenderHasPerish) {
                console.log(`[AI BAN] Perish Song：已有灭亡之歌状态，无效`);
                return -99999;
            }
            // 最后一只宝可梦不应该使用灭亡之歌（会同归于尽）
            const aliveCount = (aiParty || []).filter(p => p && p.currHp > 0).length;
            if (aliveCount <= 1) {
                console.log(`[AI BAN] Perish Song：最后一只宝可梦，禁止使用`);
                return -99999;
            }
            return 100; // 灭亡之歌有战术价值
        }
        
        // =========================================================
        // 【属性变化技能】完整的类型变化技能拦截系统
        // 防止 AI 对已经达成的状态重复使用无效技能
        // =========================================================
        
        // 1. Transform (变身) - 复制对手的一切
        if (moveName === 'Transform') {
            // 如果目标已经变身过，失败
            if (defender.isTransformed || (defender.volatile && defender.volatile.transformed)) {
                console.log(`[AI BAN] Transform: 目标已经变身过`);
                return -99999;
            }
            // 如果目标有替身，失败
            if (defender.volatile && defender.volatile.substitute) {
                console.log(`[AI BAN] Transform: 目标有替身`);
                return -99999;
            }
            // 百变怪互相对视时避免死循环
            const attackerSpecies = (attacker.species || attacker.name || '').toLowerCase();
            const defenderSpecies = (defender.species || defender.name || '').toLowerCase();
            if (attackerSpecies.includes('ditto') && defenderSpecies.includes('ditto')) {
                console.log(`[AI BAN] Transform: 百变怪互相变身无意义`);
                return -99999;
            }
            return 100; // 变身是强力技能
        }
        
        // 2. Conversion (纹理) - 变成自己第一招的属性
        if (moveName === 'Conversion') {
            const firstMove = attacker.moves[0];
            if (firstMove && firstMove.type) {
                const targetType = firstMove.type;
                // 如果已经是该属性（单属性且相同），禁止使用
                if (attacker.types && attacker.types.length === 1 && attacker.types[0] === targetType) {
                    console.log(`[AI BAN] Conversion: 已经是 ${targetType} 属性`);
                    return -99999;
                }
            }
            return 30;
        }
        
        // 3. Reflect Type (镜面属性) - 复制对手的属性
        if (moveName === 'Reflect Type') {
            const myTypes = (attacker.types || ['Normal']).slice().sort().join(',');
            const targetTypes = (defender.types || ['Normal']).slice().sort().join(',');
            // 如果属性组合完全一致，失败
            if (myTypes === targetTypes) {
                console.log(`[AI BAN] Reflect Type: 属性已相同 (${myTypes})`);
                return -99999;
            }
            return 25;
        }
        
        // 4. Burn Up (燃尽) - 失去火属性的强力火系攻击
        if (moveName === 'Burn Up') {
            const types = attacker.types || [];
            if (!types.includes('Fire')) {
                console.log(`[AI BAN] Burn Up: 不再是火系，无法使用`);
                return -99999;
            }
            // 这是攻击技能，由伤害计算处理，这里只做属性检查
        }
        
        // 5. Double Shock (电光双击) - 失去电属性的强力电系攻击
        if (moveName === 'Double Shock') {
            const types = attacker.types || [];
            if (!types.includes('Electric')) {
                console.log(`[AI BAN] Double Shock: 不再是电系，无法使用`);
                return -99999;
            }
            // 这是攻击技能，由伤害计算处理
        }
        
        // 6. Soak (浸水) - 把对手变成纯水系
        if (moveName === 'Soak') {
            const types = defender.types || [];
            if (types.length === 1 && types[0] === 'Water') {
                console.log(`[AI BAN] Soak: 对手已经是纯水系`);
                return -99999;
            }
            // 对水系宝可梦使用意义不大（虽然不会失败，但战术价值低）
            if (types.includes('Water') && types.length === 1) {
                return 5;
            }
            return 40; // 改变对手属性有战术价值
        }
        
        // 7. Magic Powder (魔法粉) - 把对手变成纯超能力系
        if (moveName === 'Magic Powder') {
            const types = defender.types || [];
            if (types.length === 1 && types[0] === 'Psychic') {
                console.log(`[AI BAN] Magic Powder: 对手已经是纯超能力系`);
                return -99999;
            }
            return 35;
        }
        
        // 8. Trick-or-Treat (万圣夜) - 给对手追加幽灵属性
        if (moveName === 'Trick-or-Treat') {
            if ((defender.types || []).includes('Ghost')) {
                console.log(`[AI BAN] Trick-or-Treat: 对手已经有幽灵属性`);
                return -99999;
            }
            return 30;
        }
        
        // 9. Forest's Curse (森林诅咒) - 给对手追加草属性
        if (moveName === "Forest's Curse") {
            if ((defender.types || []).includes('Grass')) {
                console.log(`[AI BAN] Forest's Curse: 对手已经有草属性`);
                return -99999;
            }
            return 30;
        }
        
        // =========================================================
        // 【Soft-Coded】延迟生效技能 (slotCondition 或特定 volatileStatus)
        // 残血时使用无意义
        // =========================================================
        const isDelayedEffect = fullMoveData.slotCondition || 
            (fullMoveData.volatileStatus === 'yawn') ||
            (fullMoveData.isFutureMove);
        
        if (isDelayedEffect && hpPercent < 0.25) {
            console.log(`[AI BAN] ${moveName}：残血使用延迟技能无意义`);
            return -99999;
        }
        
        // Wish: 血量健康时不需要（使用 slotCondition 检测）
        if (fullMoveData.slotCondition === 'wish') {
            if (hpPercent > 0.70) {
                return 5; // 血量健康，不需要许愿
            }
            if (hpPercent < 0.50) {
                return 60; // 血量中等，可以许愿
            }
        }
        
        // =========================================================
        // 【Critical Fix】自我牺牲技能 (Memento, Healing Wish, Lunar Dance)
        // 检查 selfdestruct 字段，防止无效使用导致死循环
        // =========================================================
        if (fullMoveData.selfdestruct) {
            // Memento: 降低对手攻击和特攻各2级
            if (fullMoveData.boosts) {
                const targetBoosts = defender.boosts || {};
                let canLowerStats = false;
                
                // 检查是否还能降低任何属性
                for (const [stat, value] of Object.entries(fullMoveData.boosts)) {
                    const currentBoost = targetBoosts[stat] || 0;
                    // 如果当前等级 > -6，说明还能降低
                    if (value < 0 && currentBoost > -6) {
                        canLowerStats = true;
                        break;
                    }
                }
                
                // 如果所有相关属性都已经是 -6，禁止使用
                if (!canLowerStats) {
                    console.log(`[AI BAN] ${moveName} 无效：对手属性已降至最低 (atk:${targetBoosts.atk || 0}, spa:${targetBoosts.spa || 0})`);
                    return -99999;
                }
                
                // 只有在对手威胁很大且我方即将倒下时才使用
                const defenderHpPercent = defender.currHp / defender.maxHp;
                const attackerHpPercent = attacker.currHp / attacker.maxHp;
                
                // 对手残血时不要用（浪费）
                if (defenderHpPercent < 0.3) {
                    console.log(`[AI BAN] ${moveName}：对手残血，不值得牺牲`);
                    return -9999;
                }
                
                // 自己还健康时不要用
                if (attackerHpPercent > 0.5) {
                    console.log(`[AI BAN] ${moveName}：自己还健康，不应牺牲`);
                    return -9999;
                }
                
                // 只有在自己残血且对手强大时才考虑
                if (attackerHpPercent <= 0.3 && defenderHpPercent > 0.6) {
                    // 检查对手是否已经被削弱
                    const atkDebuff = targetBoosts.atk || 0;
                    const spaDebuff = targetBoosts.spa || 0;
                    
                    if (atkDebuff <= -4 && spaDebuff <= -4) {
                        // 已经削弱得够多了
                        console.log(`[AI BAN] ${moveName}：对手已被充分削弱 (atk:${atkDebuff}, spa:${spaDebuff})`);
                        return -9999;
                    }
                    
                    // 可以使用，但优先级不高
                    return 30;
                }
                
                // 其他情况不使用
                return -9999;
            }
            
            // Healing Wish / Lunar Dance: 只在有后备且自己残血时使用
            if (moveName === 'Healing Wish' || moveName === 'Lunar Dance') {
                if (hpPercent > 0.2) {
                    return -9999; // 血量还行，不牺牲
                }
                // 需要检查是否有后备宝可梦（这里简化处理）
                return 20;
            }
        }
        
        // 强化技能 - 【软编码】使用 PS 的 boosts 字段
        const moveBoosts = fullMoveData.boosts;
        const isSelfBoostMove = moveBoosts && ['self', 'allySide', 'adjacentAllyOrSelf'].includes(fullMoveData.target);
        if (isSelfBoostMove) {
            // 检查是否有攻击/特攻强化
            const hasOffensiveBoost = (moveBoosts.atk && moveBoosts.atk > 0) || (moveBoosts.spa && moveBoosts.spa > 0);
            if (hasOffensiveBoost) {
                const relevantBoost = attacker.spa > attacker.atk ? (attacker.boosts?.spa || 0) : (attacker.boosts?.atk || 0);
                if (relevantBoost < 2) statusScore = 80 + Math.random() * 20;
                else if (relevantBoost < 4) statusScore = 40 + Math.random() * 20;
                else statusScore = 5;
            }
        }
        
        // 状态技能 - 【软编码】使用 PS 的 status 字段
        const inflictedStatus = fullMoveData.status; // 'slp', 'par', 'brn', 'psn', 'tox', 'frz'
        
        if (inflictedStatus) {
            if (!defender.status) {
                // 睡眠招式
                if (inflictedStatus === 'slp') {
                    // 【修复】检查目标是否免疫睡眠
                    // 【软编码】从 AbilityHandlers 读取睡眠免疫特性列表
                    const defenderAbility = (defender.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                    const sleepImmuneAbilities = (typeof AbilityHandlers !== 'undefined' && AbilityHandlers._sleepImmuneAbilities) 
                        ? AbilityHandlers._sleepImmuneAbilities 
                        : ['insomnia', 'vitalspirit', 'comatose', 'purifyingsalt', 'sweetveil'];
                    if (sleepImmuneAbilities.includes(defenderAbility)) {
                        statusScore = -100; // 免疫睡眠，不使用
                    } else {
                        statusScore = 70 + Math.random() * 30;
                    }
                // 麻痹招式
                } else if (inflictedStatus === 'par') {
                    statusScore = defender.spe > attacker.spe ? 60 + Math.random() * 20 : 30 + Math.random() * 20;
                // 烧伤招式
                } else if (inflictedStatus === 'brn') {
                    statusScore = defender.atk > defender.spa ? 65 + Math.random() * 20 : 25 + Math.random() * 15;
                // 中毒招式
                } else if (inflictedStatus === 'psn' || inflictedStatus === 'tox') {
                    statusScore = 50 + Math.random() * 20;
                }
            } else {
                statusScore = -100;
            }
        }
        
        // 回复技能 - 【软编码】优先使用 PS 的 heal 字段或 flags.heal
        const isHealMove = (fullMoveData.heal || (fullMoveData.flags && fullMoveData.flags.heal)) && 
                           fullMoveData.target === 'self';
        if (isHealMove) {
            const hpPercent = attacker.currHp / attacker.maxHp;
            const defenderHpPercent = defender.currHp / defender.maxHp;
            
            // 【关键修复】满血时绝对不使用回复技能
            if (hpPercent >= 0.95) {
                console.log(`[AI BAN] ${moveName}：满血 (${Math.round(hpPercent * 100)}%) 禁止使用回复技能`);
                return -9999; // 满血时绝对不回血
            }
            
            // 【修正】对手残血时，大幅降低回血技能优先级
            if (defenderHpPercent < 0.25 && hpPercent > 0.4) {
                // 对手快死了，我还健康，不要回血！去输出！
                statusScore = -500;
            } else if (hpPercent < 0.3) {
                statusScore = 90 + Math.random() * 10;
            } else if (hpPercent < 0.5) {
                statusScore = 60 + Math.random() * 20;
            } else if (hpPercent < 0.7) {
                statusScore = 30 + Math.random() * 15;
            } else {
                statusScore = -100; // 血量健康时不应该回血
            }
            
            // 【关键修复】连续回复惩罚：上回合也用了回复技能，大幅降分
            // 防止 Recover/Soft-Boiled 无限循环
            if (statusScore > 0) {
                const lastUsed = attacker.lastMoveUsed || '';
                const lastUsedId = lastUsed.toLowerCase().replace(/[^a-z0-9]/g, '');
                const lastUsedData = (typeof MOVES !== 'undefined' && MOVES[lastUsedId]) ? MOVES[lastUsedId] : {};
                const lastWasHeal = (lastUsedData.heal || (lastUsedData.flags && lastUsedData.flags.heal)) && 
                                    (lastUsedData.target === 'self' || lastUsedData.target === 'adjacentAllyOrSelf');
                if (lastWasHeal) {
                    const penalty = Math.floor(statusScore * 0.6);
                    statusScore -= penalty;
                    console.log(`[AI HEAL PENALTY] ${moveName} 连续回复惩罚(fallback): -${penalty} -> ${statusScore}`);
                }
            }
        }
        
        // 【新增】反伤技能预测评分 (Mirror Coat / Counter / Metal Burst)
        const counterMoves = ['Mirror Coat', 'Counter', 'Metal Burst'];
        if (counterMoves.includes(moveName)) {
            const defenderHpPercent = defender.currHp / defender.maxHp;
            
            // 对手残血时，反伤技能毫无意义（对面可能直接换人或用变化技）
            if (defenderHpPercent < 0.25) {
                return -9999;
            }
            
            // 预测对手的攻击类型
            const defenderIsSpecialAttacker = (defender.baseStats?.spa || defender.spa || 0) > (defender.baseStats?.atk || defender.atk || 0);
            const defenderIsPhysicalAttacker = (defender.baseStats?.atk || defender.atk || 0) > (defender.baseStats?.spa || defender.spa || 0);
            
            // Mirror Coat：只对特攻手有效
            if (moveName === 'Mirror Coat') {
                if (defenderIsSpecialAttacker) {
                    // 预测对手会用特殊攻击，Mirror Coat 有价值
                    const predictedDamage = attacker.maxHp * 0.35; // 假设受到 35% HP 伤害
                    const estimatedReturn = predictedDamage * 2;
                    statusScore = 40 + (estimatedReturn / defender.maxHp) * 100;
                } else if (defenderIsPhysicalAttacker) {
                    // 对面是物理手，Mirror Coat 无用
                    return -9999;
                } else {
                    // 不确定，给个中等分数
                    statusScore = 20;
                }
            }
            
            // Counter：只对物理手有效
            if (moveName === 'Counter') {
                if (defenderIsPhysicalAttacker) {
                    const predictedDamage = attacker.maxHp * 0.35;
                    const estimatedReturn = predictedDamage * 2;
                    statusScore = 40 + (estimatedReturn / defender.maxHp) * 100;
                } else if (defenderIsSpecialAttacker) {
                    return -9999;
                } else {
                    statusScore = 20;
                }
            }
            
            // Metal Burst：通用反伤，但需要后手
            if (moveName === 'Metal Burst') {
                const attackerSpeed = attacker.spe || attacker.baseStats?.spe || 100;
                const defenderSpeed = defender.spe || defender.baseStats?.spe || 100;
                
                if (attackerSpeed < defenderSpeed) {
                    // 我比对手慢，Metal Burst 有效
                    statusScore = 50;
                } else {
                    // 我比对手快，Metal Burst 无效
                    return -5000;
                }
            }
        }
        
        // 守住类 - 考虑连续使用惩罚
        // 【软编码】使用 PS 的 stallingMove 字段
        const isProtectMove = fullMoveData.stallingMove === true;
        if (isProtectMove) {
            // 检查连续使用惩罚
            const protectCounter = attacker.protectCounter || 0;
            if (protectCounter > 0) {
                // 连续使用成功率很低，AI 应该避免
                const successChance = Math.pow(1/3, protectCounter);
                if (successChance < 0.34) {
                    // 成功率低于 34%，不值得冒险
                    return -100;
                }
            }
            
            if (defender.status === 'psn' || defender.status === 'tox' || defender.status === 'brn') {
                statusScore = 40 + Math.random() * 30;
            } else {
                statusScore = 15 + Math.random() * 15;
            }
        }
        
        // 首回合限制技能检查
        const firstTurnMoves = ['Fake Out', 'First Impression', 'Mat Block'];
        if (firstTurnMoves.includes(moveName)) {
            if ((attacker.turnsOnField || 0) > 0) {
                return -9999; // 非首回合，必定失败
            }
        }
        
        // 同命连续使用限制
        if (moveName === 'Destiny Bond' && attacker.lastMoveUsed === 'Destiny Bond') {
            return -9999; // 连续使用必失败
        }
        
        // 僵直状态检查
        if (attacker.mustRecharge) {
            return -9999; // 需要休息，无法行动
        }
        
        return statusScore;
    }

    // === 攻击技能评分（使用软编码的 evaluateMoveImpact）===
    const impact = evaluateMoveImpact(attacker, defender, move);
    const eff = impact.effectiveness;
    
    // 免疫时直接返回极低分
    if (eff === 0) return -9999;

    let score = impact.totalScore;
    
    // =========================================================
    // 【AI 智商补正】Contrary (唱反调) 特性专门增强
    // 自降能力的技能在唱反调下变成自我强化
    // =========================================================
    const attackerAbility = (attacker.ability || '').toLowerCase();
    const isContrary = attackerAbility === 'contrary';
    
    if (isContrary) {
        // 软编码：从 fullMoveData.self.boosts 中检测自降能力
        const selfBoosts = fullMoveData.self?.boosts || {};
        let hasSelfDebuff = false;
        let debuffValue = 0;
        
        // 检查所有自降能力
        for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) {
            const boost = selfBoosts[stat] || 0;
            if (boost < 0) {
                hasSelfDebuff = true;
                debuffValue += Math.abs(boost);
            }
        }
        
        // 如果有自降能力，在唱反调下变成强化
        if (hasSelfDebuff) {
            // 每级自降变成 +1 强化，价值极高
            const contraryBonus = debuffValue * 800; // 每级 +800 分
            score += contraryBonus;
            console.log(`[AI CONTRARY] ${attacker.cnName} 的 ${moveName} 因唱反调获得 +${contraryBonus} 分 (自降 ${debuffValue} 级)`);
            
            // 特别加成：Leaf Storm / Overheat 等 -2 特攻的技能
            if (selfBoosts.spa === -2 || selfBoosts.atk === -2) {
                score += 500; // 额外加成，因为这类技能威力本身就高
                console.log(`[AI CONTRARY] ${moveName} 是顶级强化技，额外 +500 分`);
            }
        }
    }
    // 【反向逻辑】非唱反调时，自降能力技能应该适当减分
    else {
        const selfBoosts = fullMoveData.self?.boosts || {};
        let debuffPenalty = 0;
        
        for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) {
            const boost = selfBoosts[stat] || 0;
            if (boost < 0) {
                // 降攻击/特攻惩罚更重
                if (stat === 'atk' || stat === 'spa') {
                    debuffPenalty += Math.abs(boost) * 100;
                } else {
                    debuffPenalty += Math.abs(boost) * 50;
                }
            }
        }
        
        if (debuffPenalty > 0) {
            score -= debuffPenalty;
        }
    }
    
    // =========================================================
    // 【Extension 1】条件增伤技能逻辑 (Variable Power)
    // Hex, Venoshock, Foul Play, Body Press, Gyro Ball 等
    // =========================================================
    let damageMultiplier = 1.0;
    
    // 1.1 状态施加增伤 (Facade, Hex, Venoshock, Wake-Up Slap)
    if (moveName === 'Facade' && (attacker.status === 'brn' || attacker.status === 'par' || attacker.status === 'psn' || attacker.status === 'tox')) {
        damageMultiplier = 2.0;
        if (attacker.status === 'brn') score += 1000; // 烧伤时硬撑无视减半
    }
    if (moveName === 'Hex' && defender.status) {
        damageMultiplier = 2.0;
        console.log(`[AI VAR] Hex 对异常状态目标威力翻倍`);
    }
    if (moveName === 'Venoshock' && (defender.status === 'psn' || defender.status === 'tox')) {
        damageMultiplier = 2.0;
    }
    if (moveName === 'Wake-Up Slap' && defender.status === 'slp') {
        damageMultiplier = 2.0;
    }
    if (moveName === 'Brine' && defender.currHp <= defender.maxHp / 2) {
        damageMultiplier = 2.0;
    }
    
    // 1.2 利用对手属性计算 (Foul Play / Body Press / Power Trip / Stored Power)
    if (moveName === 'Foul Play') {
        const enemyAtk = defender.atk || defender.baseStats?.atk || 50;
        const myAtk = attacker.atk || 50;
        if (enemyAtk > myAtk) {
            damageMultiplier = enemyAtk / myAtk;
            console.log(`[AI VAR] Foul Play 使用对手攻击力: x${damageMultiplier.toFixed(1)}`);
        }
    }
    if (moveName === 'Body Press') {
        const myDef = attacker.def || 50;
        const myAtk = attacker.atk || 50;
        if (myDef > myAtk) {
            damageMultiplier = myDef / myAtk;
            console.log(`[AI VAR] Body Press 使用自身防御: x${damageMultiplier.toFixed(1)}`);
        }
    }
    if (moveName === 'Power Trip' || moveName === 'Stored Power') {
        const boosts = attacker.boosts || {};
        let totalBoosts = 0;
        for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) {
            totalBoosts += Math.max(0, boosts[stat] || 0);
        }
        if (totalBoosts > 0) {
            // 每级 +20 威力，基础 20
            const power = 20 + totalBoosts * 20;
            damageMultiplier = power / 20;
            console.log(`[AI VAR] ${moveName} 强化加成: ${totalBoosts}级 -> 威力${power}`);
        }
    }
    
    // 1.3 速度类技能 (Gyro Ball / Electro Ball)
    if (moveName === 'Gyro Ball') {
        const oppSpeed = getEffectiveSpeed(defender) || 1;
        const mySpeed = getEffectiveSpeed(attacker) || 1;
        const power = Math.min(150, Math.floor(25 * (oppSpeed / mySpeed)));
        if (power > (move.basePower || 80)) {
            damageMultiplier = power / (move.basePower || 80);
            console.log(`[AI VAR] Gyro Ball 速度差计算: 威力${power}`);
        }
    }
    if (moveName === 'Electro Ball') {
        const oppSpeed = getEffectiveSpeed(defender) || 1;
        const mySpeed = getEffectiveSpeed(attacker) || 1;
        const diff = mySpeed / oppSpeed;
        let power = 60;
        if (diff >= 4) power = 150;
        else if (diff >= 3) power = 120;
        else if (diff >= 2) power = 80;
        damageMultiplier = power / 60;
    }
    
    // 1.4 体重类技能 (Grass Knot / Low Kick / Heavy Slam / Heat Crash)
    if (moveName === 'Grass Knot' || moveName === 'Low Kick') {
        // 简化：假设重型宝可梦威力更高
        const defenderWeight = defender.baseStats?.hp || 80; // 用 HP 近似体重
        if (defenderWeight > 100) damageMultiplier = 1.5;
        if (defenderWeight > 150) damageMultiplier = 2.0;
    }
    
    // 1.5 应用条件增伤修正
    if (damageMultiplier > 1.0) {
        const bonusDmg = impact.rawDamage * (damageMultiplier - 1);
        if ((impact.rawDamage + bonusDmg) >= defender.currHp) {
            score += 3000;
            console.log(`[AI CRITICAL] ${moveName} 经过条件修正后可斩杀!`);
        } else {
            score += Math.min(2000, bonusDmg / attacker.maxHp * 1000);
        }
    }
    
    // =========================================================
    // 【Extension 2】大爆炸战术逻辑 (Explosion / Self-Destruct)
    // =========================================================
    if (moveName === 'Explosion' || moveName === 'Self-Destruct' || moveName === 'Misty Explosion') {
        let enemyCount = 1;
        if (typeof battle !== 'undefined' && battle.playerParty) {
            enemyCount = battle.playerParty.filter(p => p && p.currHp > 0).length;
        }
        
        const canKill = impact.rawDamage >= defender.currHp;
        const myHpPct = attacker.currHp / attacker.maxHp;
        
        // Case A: 自己残血（<15%），废物利用
        if (myHpPct < 0.15) {
            score += 5000;
            console.log(`[AI EXPLOSION] 残血自爆: ${moveName} (+5000)`);
        }
        // Case B: 能确杀且对手是最后一只 -> 终结比赛
        else if (canKill && enemyCount === 1) {
            score += 10000;
            console.log(`[AI EXPLOSION] 终结比赛: ${moveName} (+10000)`);
        }
        // Case C: 能杀且对手威胁大
        else if (canKill && myHpPct < 0.5) {
            score += 2000;
            console.log(`[AI EXPLOSION] 一换一: ${moveName} (+2000)`);
        }
        // Case D: 满血且杀不死对手 -> 严禁使用
        else {
            console.log(`[AI BAN] ${moveName} 杀不死人亏节奏，禁用`);
            return -9999;
        }
    }
    
    // =========================================================
    // 【Extension 3】突袭预判逻辑 (Sucker Punch / Thunderclap)
    // =========================================================
    if (moveName === 'Sucker Punch' || moveName === 'Thunderclap') {
        // 连续使用惩罚
        if (attacker.lastMoveUsed === moveName) {
            console.log(`[AI SMART] 连续突袭惩罚: ${moveName}`);
            score -= 500;
        }
        
        // 预测对手行为：如果对手威胁小，可能用变化技，突袭会失败
        // 简化判断：对手残血时突袭有效（收割），对手健康且威胁小时风险高
        const defHpPct = defender.currHp / defender.maxHp;
        
        if (defHpPct < 0.2) {
            // 对手残血，突袭收割
            score += 1000;
            console.log(`[AI SMART] 突袭收割残血: ${moveName} (+1000)`);
        } else if (defHpPct > 0.7) {
            // 对手健康，可能会用变化技
            // 检查对手是否有强化/回复技能倾向
            const defenderIsSetupType = (defender.spa || 0) > (defender.atk || 0) * 1.2 || 
                                        (defender.def || 0) > 100 || (defender.spd || 0) > 100;
            if (defenderIsSetupType) {
                score -= 800;
                console.log(`[AI SMART] 对手可能强化，突袭风险高: ${moveName} (-800)`);
            }
        }
    }
    
    // =========================================================
    // 【Extension 4】硬直/蓄力技能风险评估 [v3.5 增强]
    // =========================================================
    const rechargeMoves = ['Hyper Beam', 'Giga Impact', 'Hydro Cannon', 'Blast Burn', 'Frenzy Plant', 'Roar of Time', 'Eternabeam', 'Prismatic Laser', 'Meteor Assault'];
    const chargeMoves = ['Solar Beam', 'Solar Blade', 'Meteor Beam', 'Sky Attack', 'Skull Bash'];
    const invulnMoves = ['Dig', 'Fly', 'Dive', 'Bounce', 'Phantom Force', 'Shadow Force', 'Sky Drop'];
    const weather = (typeof battle !== 'undefined' && battle.field) ? battle.field.weather : '';
    
    // 检查强力香草
    const hasHerb = (attacker.item || '').toLowerCase().includes('power herb') || 
                    (attacker.item || '').includes('强力香草');
    
    // 4.1 硬直技能 (需要下回合不能动)
    if (rechargeMoves.includes(moveName)) {
        if (impact.rawDamage < defender.currHp) {
            // 打不死人，下回合是活靶子
            score -= 8000;
            console.log(`[AI SMART] ${moveName} 无法斩杀，硬直风险，禁用`);
        } else {
            // 能打死，但仍有风险
            score -= 500;
            // 用破坏死光杀残血是浪费
            if (defender.currHp < 50) {
                score -= 5000;
                console.log(`[AI SMART] 没必要用 ${moveName} 杀残血`);
            }
        }
    }
    
    // 4.2 蓄力技能 (Solar Beam 等)
    if (chargeMoves.includes(moveName)) {
        const isSolar = moveName.includes('Solar');
        // 【天气统一】兼容 sun 和 harshsun
        const hasSun = (weather === 'sun' || weather === 'harshsun');
        
        if (isSolar && !hasSun && !hasHerb) {
            // 没有晴天也没有强力香草，蓄力回合是送
            score -= 5000;
            console.log(`[AI SMART] 晴天/香草缺失，禁止裸打 ${moveName}`);
        } else if (hasSun || hasHerb) {
            // 即发状态，这是好技能
            score += 500;
            console.log(`[AI SMART] ${moveName} 有天气/香草加持，加分 (+500)`);
        }
        
        // Meteor Beam 特殊处理：蓄力时 +1 特攻
        if (moveName === 'Meteor Beam' && !hasHerb) {
            // 没有香草但能强化，风险降低
            score -= 2000; // 仍有风险但不是完全禁用
        }
    }
    
    // 4.3 【v3.5 新增】半无敌技能评估 (Dig, Fly, Dive 等)
    if (invulnMoves.includes(moveName)) {
        // 计算是否处于危机（对方能秒杀我）
        let maxIncomingDmg = 0;
        for (const pMove of defender.moves || []) {
            const pMerged = getMergedMoveData(pMove);
            const pDmg = simulateDamage(defender, attacker, pMerged);
            if (pDmg.damage > maxIncomingDmg) {
                maxIncomingDmg = pDmg.damage;
            }
        }
        
        const myHp = attacker.currHp;
        const willDieNextTurn = maxIncomingDmg >= myHp;
        const mySpeed = getEffectiveSpeed(attacker);
        const targetSpeed = getEffectiveSpeed(defender);
        const isTrickRoom = (typeof battle !== 'undefined') && battle.field && battle.field.trickRoom > 0;
        const aiFaster = isTrickRoom ? (mySpeed < targetSpeed) : (mySpeed > targetSpeed);
        
        if (hasHerb) {
            // 有强力香草：半无敌技能变成即发高威力技能，大幅加分
            score += 800;
            console.log(`[AI SMART] ${moveName} 有强力香草，即发半无敌技能 (+800)`);
        } else if (willDieNextTurn && aiFaster) {
            // 处于斩杀线且速度快：半无敌技能可以躲避致命攻击
            score += 2000;
            console.log(`[AI EVASION] ${moveName} 危机闪避加分 (+2000)：${myHp}HP vs ${maxIncomingDmg}伤害`);
        } else if (!aiFaster) {
            // 速度慢：半无敌技能风险高（会先被打）
            score -= 1000;
            console.log(`[AI SMART] ${moveName} 速度慢，半无敌技能风险高 (-1000)`);
        } else {
            // 正常情况：轻微惩罚（两回合技能效率低）
            score -= 300;
        }
    }
    
    // =========================================================
    // 【Extension 5】设置型技能评估 (Charge/Defense Curl/Laser Focus)
    // 这些技能需要下回合才能发挥效果，需要评估使用时机
    // =========================================================
    const setupVolatileMoves = {
        'Charge': { volatile: 'charge', benefit: 'Electric moves x2' },
        'Defense Curl': { volatile: 'defensecurl', benefit: 'Rollout/Ice Ball x2' },
        'Laser Focus': { volatile: 'laserfocus', benefit: 'Next attack crits' }
    };
    
    if (setupVolatileMoves[moveName]) {
        const setupInfo = setupVolatileMoves[moveName];
        const hpPercent = attacker.currHp / attacker.maxHp;
        
        // 已有该状态，不需要重复使用
        if (attacker.volatile && attacker.volatile[setupInfo.volatile]) {
            score -= 5000;
            console.log(`[AI SETUP] ${moveName}：已有 ${setupInfo.volatile} 状态，禁止重复使用`);
        }
        // 残血时不要用设置技能
        else if (hpPercent < 0.35) {
            score -= 3000;
            console.log(`[AI SETUP] ${moveName}：残血 (${Math.round(hpPercent * 100)}%) 不应使用设置技能`);
        }
        // Charge：检查是否有电系技能可以受益
        else if (moveName === 'Charge') {
            const hasElectricMove = attacker.moves && attacker.moves.some(m => {
                const merged = getMergedMoveData(m);
                return merged.type === 'Electric' && (merged.basePower || merged.power || 0) >= 60;
            });
            if (!hasElectricMove) {
                score -= 5000;
                console.log(`[AI SETUP] Charge：没有高威力电系技能，无意义`);
            } else if (hpPercent > 0.6) {
                score += 50; // 血量健康时可以考虑
            }
        }
        // Defense Curl：检查是否有 Rollout/Ice Ball
        else if (moveName === 'Defense Curl') {
            const hasRollout = attacker.moves && attacker.moves.some(m => 
                m.name === 'Rollout' || m.name === 'Ice Ball'
            );
            if (!hasRollout) {
                // 没有滚动/冰球，变圆只是普通的防御+1
                score -= 100; // 轻微惩罚，因为还有防御提升效果
            } else if (hpPercent > 0.6) {
                score += 100; // 有配合技能时加分
            }
        }
        // Laser Focus：下回合必定暴击
        else if (moveName === 'Laser Focus') {
            if (hpPercent > 0.5) {
                score += 30; // 血量健康时可以考虑
            }
        }
    }
    
    // 斩杀加分
    if (impact.rawDamage >= defender.currHp) score += 5000;

    // 先制技斩杀加分
    const priority = move.priority || 0;
    if (priority > 0 && impact.rawDamage >= defender.currHp) score += 2000;
    
    // 低血量时优先先制技
    const myHpPercent = attacker.currHp / attacker.maxHp;
    if (priority > 0 && myHpPercent < 0.3) score += 500;
    
    // =========================================================
    // 【新增】斩杀激励 (Execution Incentive)
    // 对手残血时，AI 应该优先输出而不是回血/辅助
    // =========================================================
    const defenderHpPercent = defender.currHp / defender.maxHp;
    const defenderIsLowHp = defenderHpPercent < 0.25 || (defender.currHp < 100 && myHpPercent > 0.4);
    
    if (defenderIsLowHp) {
        // 对手残血时，攻击技能大幅加分
        if (category !== 'status' && move.basePower > 0) {
            score += 300; // 残血必杀加成
            
            // 如果能斩杀，再加分
            if (impact.rawDamage >= defender.currHp) {
                score += 200; // 确保斩杀优先级最高
            }
        }
    }
    
    // 克制加分
    if (eff >= 2) score += 100;
    if (eff >= 4) score += 200;
    
    // 【强化】效果不好减分 - 更严厉的惩罚
    // AI 不应该用效果不好的技能，除非没有更好的选择
    if (eff <= 0.5 && eff > 0) score -= 200;  // 从 -50 改为 -200
    if (eff <= 0.25) score -= 500;            // 从 -100 改为 -500
    
    // 【新增】如果有更好的属性克制选择，进一步惩罚效果不好的技能
    // 检查是否有其他技能能打出更好的效果
    if (eff <= 0.5 && attacker.moves && attacker.moves.length > 1) {
        for (const otherMove of attacker.moves) {
            if (otherMove === move) continue;
            const otherMerged = getMergedMoveData(otherMove);
            const otherEff = getTypeEffectivenessAI(otherMerged.type || 'Normal', defender.types || ['Normal']);
            // 如果有更好的属性克制技能，大幅惩罚当前技能
            if (otherEff > eff && (otherMerged.basePower || otherMerged.power || 0) >= 60) {
                score -= 300;
                break;
            }
        }
    }
    
    // ========================================
    // 【v2.1】反伤技能智能评估 - 禁止自杀式袭击
    // 【软编码】优先使用 PS moves-data.js 的 recoil 字段
    // ========================================
    
    // 从 PS 数据获取反伤信息
    let recoilRatio = 0;
    if (fullMoveData.recoil) {
        // PS 格式: recoil: [分子, 分母]，如 [1, 3] 表示 1/3
        const [num, den] = fullMoveData.recoil;
        recoilRatio = num / den;
    } else if (fullMoveData.mindBlownRecoil || fullMoveData.struggleRecoil) {
        // 特殊反伤类型（精神击破、挣扎）
        recoilRatio = 0.50;
    }
    
    if (recoilRatio > 0) {
        const moveDamage = impact.rawDamage || 0;
        const expectedRecoil = Math.floor(moveDamage * recoilRatio);
        
        // 【核心逻辑】如果反伤会致死
        if (expectedRecoil >= attacker.currHp) {
            // 检查敌方剩余存活数量
            let enemyAliveCount = 1; // 至少有当前对手
            if (typeof battle !== 'undefined' && battle.playerParty) {
                enemyAliveCount = battle.playerParty.filter(p => p && p.currHp > 0).length;
            }
            
            // 检查这一击能否击杀对手
            const canKill = moveDamage >= defender.currHp;
            
            if (canKill && enemyAliveCount <= 1) {
                // 同归于尽且是最后一只 -> 勇往直前！
                score += 3000;
                console.log(`[AI RECOIL] 同归于尽斩杀最后一只: ${moveName} (+3000)`);
            } else if (canKill && enemyAliveCount <= 2) {
                // 能杀但对面还有2只 -> 勉强可以接受
                score -= 500;
                console.log(`[AI RECOIL] 自杀换人头(对面剩${enemyAliveCount}): ${moveName} (-500)`);
            } else {
                // 自杀但杀不掉 或 对面还有很多 -> 极刑禁止
                score -= 8000;
                console.log(`[AI RECOIL] 禁止自杀式袭击: ${moveName} (-8000)`);
            }
        } else if (expectedRecoil >= attacker.currHp * 0.5) {
            // 反伤会掉一半血以上 -> 谨慎使用
            if (myHpPercent < 0.5) {
                score -= 400;
            }
        } else if (myHpPercent < 0.4) {
            // 原有逻辑：低血量时减分
            score -= 200;
        }
    }
    
    // ========================================
    // v2.0：折返技能战术评分
    // ========================================
    if (isPivotMove(move)) {
        // 【关键修复】检查是否还有存活队友可以换入
        // 如果没有队友了，折返毫无意义，应该选择高伤害技能对攻
        let aliveAllies = 0;
        if (aiParty && aiParty.length > 0) {
            for (const ally of aiParty) {
                if (ally && ally !== attacker && ally.isAlive && ally.isAlive()) {
                    aliveAllies++;
                }
            }
        }
        
        if (aliveAllies === 0) {
            // 没有队友了，折返技能大幅减分（只保留基础伤害价值）
            console.log(`[AI PIVOT] ${attacker.name} 没有存活队友，${moveName} 折返无意义，大幅减分`);
            score -= 500; // 减分，让 AI 选择其他高伤害技能
        } else {
            // 有队友时，正常计算折返加分
            // 基础奖励：灵活性总是好的
            score += 300;
            
            const attackerSpeed = getEffectiveSpeed(attacker);
            const defenderSpeed = getEffectiveSpeed(defender);
            const isFaster = attackerSpeed > defenderSpeed;
            const isSlower = attackerSpeed < defenderSpeed;
            
            // 先手折返 (Fast Pivot)：收割残血后安全撤退
            if (isFaster && defender.currHp < defender.maxHp * 0.15) {
                score += 1500; // 白嫖伤害后跑路
            }
            
            // 后手折返 (Slow Pivot)：让队友无伤上场，这是神技
            // 如果我比较肉且比对手慢
            const myBulk = (attacker.def || 80) + (attacker.spd || 80);
            if (isSlower && myBulk >= 160) {
                score += 1200; // 后手带人是战术核心
            }
            
            // 如果我状态不好（能力下降），折返清除负面状态
            const boosts = attacker.boosts || {};
            if ((boosts.atk || 0) <= -1 || (boosts.spa || 0) <= -1 || (boosts.spe || 0) <= -1) {
                score += 800; // 用折返重置状态
            }
            
            // Parting Shot 特殊加分（降对手能力）
            if (moveName === 'Parting Shot') {
                score += 500;
            }
        }
    }

    // =========================================================
    // 【新增】攻击技能附带状态效果加分 (Secondary Effect Bonus)
    // Scald 30% 烧伤、Thunderbolt 10% 麻痹等
    // 对于低输出型宝可梦（stall），这些附带效果是核心输出手段
    // =========================================================
    if (!defender.status) {
        const secondary = fullMoveData.secondary || null;
        const secondaries = fullMoveData.secondaries || null;
        
        // 检查 secondary.status（如 Scald: { chance: 30, status: 'brn' }）
        if (secondary && secondary.status && secondary.chance) {
            const statusBonus = secondary.chance * 1.5; // 30% burn = +45
            score += statusBonus;
            // 对手是物理手且可能烧伤时，额外加分
            if (secondary.status === 'brn' && defender.atk > defender.spa) {
                score += secondary.chance * 2; // 30% burn vs physical = +60 extra
            }
        }
        
        // 检查 secondaries 数组
        if (secondaries && Array.isArray(secondaries)) {
            for (const sec of secondaries) {
                if (sec.status && sec.chance) {
                    score += sec.chance * 1.5;
                    if (sec.status === 'brn' && defender.atk > defender.spa) {
                        score += sec.chance * 2;
                    }
                }
            }
        }
    }

    // =========================================================
    // 【BUG修复 + 优化】攻击技附带钉子效果评分
    // Stone Axe (岩斧) → 隐形岩, Ceaseless Edge (秘剑) → 撒菱
    // 这些是攻击技，不走 sideCondition 路径，需要单独评估
    // =========================================================
    const hazardAttackMoves = {
        'Stone Axe': { hazardKey: 'stealthRock', type: 'boolean', label: '隐形岩' },
        'Ceaseless Edge': { hazardKey: 'spikes', type: 'stackable', max: 3, label: '撒菱' }
    };
    
    if (hazardAttackMoves[moveName]) {
        const hazardInfo = hazardAttackMoves[moveName];
        const battleObj = (typeof battle !== 'undefined') ? battle : (typeof window !== 'undefined' ? window.battle : null);
        
        if (battleObj) {
            const isAiAttacker = battleObj.playerParty && !battleObj.playerParty.includes(attacker);
            const targetSide = isAiAttacker ? battleObj.playerSide : battleObj.enemySide;
            
            if (targetSide) {
                let canSetHazard = false;
                if (hazardInfo.type === 'boolean') {
                    canSetHazard = !targetSide[hazardInfo.hazardKey];
                } else if (hazardInfo.type === 'stackable') {
                    canSetHazard = (targetSide[hazardInfo.hazardKey] || 0) < hazardInfo.max;
                }
                
                if (canSetHazard) {
                    // 对手剩余存活数量越多，钉子价值越高
                    let enemyAliveCount = 1;
                    const enemyParty = isAiAttacker ? battleObj.playerParty : battleObj.enemyParty;
                    if (enemyParty) {
                        enemyAliveCount = enemyParty.filter(p => p && p.currHp > 0).length;
                    }
                    
                    // 基础加分 + 每多一只对手额外加分（钉子是长线投资）
                    const hazardBonus = 200 + (enemyAliveCount - 1) * 100;
                    score += hazardBonus;
                    console.log(`[AI HAZARD] ${moveName} 可设置${hazardInfo.label}，加分 +${hazardBonus} (对手剩${enemyAliveCount}只)`);
                } else {
                    // 钉子已满，但仍是攻击技，不减分（纯伤害价值保留）
                    console.log(`[AI HAZARD] ${moveName} ${hazardInfo.label}已满/已存在，仅作攻击技评估`);
                }
            }
        }
    }
    
    // =========================================================
    // 【优化】钉子清除技能评分 (Rapid Spin / Defog / Mortal Spin / Tidy Up)
    // 己方场地有钉子时，清除技能价值大幅提升
    // =========================================================
    const hazardRemovalMoves = ['Rapid Spin', 'Mortal Spin', 'Defog', 'Tidy Up'];
    if (hazardRemovalMoves.includes(moveName)) {
        const battleObj = (typeof battle !== 'undefined') ? battle : (typeof window !== 'undefined' ? window.battle : null);
        
        if (battleObj) {
            const isAiAttacker = battleObj.playerParty && !battleObj.playerParty.includes(attacker);
            const mySide = isAiAttacker ? battleObj.enemySide : battleObj.playerSide;
            
            if (mySide) {
                let hazardCount = 0;
                let hazardSeverity = 0;
                
                if (mySide.stealthRock) { hazardCount++; hazardSeverity += 3; } // 隐形岩伤害最高
                if (mySide.spikes > 0) { hazardCount++; hazardSeverity += mySide.spikes; }
                if (mySide.toxicSpikes > 0) { hazardCount++; hazardSeverity += mySide.toxicSpikes * 2; } // 毒菱持续伤害
                if (mySide.stickyWeb) { hazardCount++; hazardSeverity += 2; }
                if (mySide.gmaxSteelsurge) { hazardCount++; hazardSeverity += 3; }
                
                if (hazardCount > 0) {
                    // 己方队伍剩余存活数量越多，清除钉子价值越高
                    let myAliveCount = 1;
                    const myParty = isAiAttacker ? battleObj.enemyParty : battleObj.playerParty;
                    if (myParty) {
                        myAliveCount = myParty.filter(p => p && p.currHp > 0).length;
                    }
                    
                    const removalBonus = hazardSeverity * 80 + (myAliveCount - 1) * 50;
                    score += removalBonus;
                    console.log(`[AI HAZARD REMOVAL] ${moveName} 清除${hazardCount}种钉子，加分 +${removalBonus} (己方剩${myAliveCount}只)`);
                    
                    // Defog 特殊处理：会同时清除对方钉子，如果对方也有钉子则减分
                    if (moveName === 'Defog') {
                        const oppSide = isAiAttacker ? battleObj.playerSide : battleObj.enemySide;
                        if (oppSide) {
                            let oppHazards = 0;
                            if (oppSide.stealthRock) oppHazards++;
                            if (oppSide.spikes > 0) oppHazards++;
                            if (oppSide.toxicSpikes > 0) oppHazards++;
                            if (oppSide.stickyWeb) oppHazards++;
                            if (oppSide.gmaxSteelsurge) oppHazards++;
                            
                            if (oppHazards > 0) {
                                // 清除对方钉子是负面效果，减分
                                const defogPenalty = oppHazards * 100;
                                score -= defogPenalty;
                                console.log(`[AI HAZARD REMOVAL] Defog 会清除对方${oppHazards}种钉子，减分 -${defogPenalty}`);
                            }
                        }
                    }
                } else {
                    // 己方没有钉子，清除技能价值降低（但 Rapid Spin 还有速度+1，Mortal Spin 有毒）
                    if (moveName === 'Defog') {
                        // Defog 没有额外效果，己方无钉子时不值得用
                        // 但如果对方有壁（Reflect/Light Screen），Defog 仍有价值
                        const oppSide = isAiAttacker ? battleObj.playerSide : battleObj.enemySide;
                        if (oppSide && (oppSide.reflect > 0 || oppSide.lightScreen > 0 || oppSide.auroraVeil > 0)) {
                            score += 200;
                            console.log(`[AI HAZARD REMOVAL] Defog 可清除对方壁，加分 +200`);
                        }
                    }
                }
            }
        }
    }

    return score;
}

/* =============================================================
 *  Revenge Killer 选择 - 智能换人逻辑
 * ============================================================= */

/**
 * 当 AI 的宝可梦倒下时，选择最佳的复仇者上场
 * @param {Pokemon[]} party - AI 队伍
 * @param {Pokemon} opp - 玩家当前场上的宝可梦
 * @param {number} currentActive - 当前（已倒下的）宝可梦索引
 * @returns {number} - 最佳队员的 index，-1 表示没有可用的
 */
export function getBestRevengeKiller(party, opp, currentActive = -1) {
    if (!party || !opp) return -1;
    
    let bestIdx = -1;
    let bestScore = -Infinity;
    
    party.forEach((p, i) => {
        // 跳过死亡的、当前在场的
        if (!p || p.currHp <= 0 || !p.moves || i === currentActive) return;
        
        let score = 0;
        
        // 1. 速度优势 (最重要的复仇击杀指标)
        const mySpe = getEffectiveSpeed(p);
        const oppSpe = getEffectiveSpeed(opp);
        if (mySpe > oppSpe) score += 300;
        
        // 2. 伤害潜力 (能否秒杀对面？)
        let maxDmg = 0;
        for (const m of p.moves) {
            const mergedMove = getMergedMoveData(m);
            const result = simulateDamage(p, opp, mergedMove);
            if (result.damage > maxDmg) maxDmg = result.damage;
        }
        
        const oppHp = opp.currHp || 1;
        const dmgPercent = maxDmg / oppHp;
        
        if (dmgPercent >= 1) {
            score += 500; // 确一（秒杀）！权重极高
        } else {
            score += dmgPercent * 200; // 能打痛也好
        }
        
        // 3. 抗性 (会不会被对面打死？)
        let incomingDmg = 0;
        let worstEff = 1;
        for (const m of opp.moves) {
            const mergedMove = getMergedMoveData(m);
            const result = simulateDamage(opp, p, mergedMove);
            if (result.damage > incomingDmg) {
                incomingDmg = result.damage;
                worstEff = result.effectiveness || 1;
            }
        }
        
        // 【新增】属性克制检查：被克制的宝可梦大幅减分
        if (worstEff >= 2) {
            score -= 400; // 被克制，尽量不选
            console.log(`[AI] ${p.cnName || p.name} 被对手克制 (${worstEff}x)，减分`);
        } else if (worstEff === 0) {
            score += 300; // 免疫对手最强技能，加分
        } else if (worstEff <= 0.5) {
            score += 150; // 抵抗对手最强技能，加分
        }
        
        // 我能挨几下？
        const mySurviveTurns = incomingDmg > 0 ? (p.currHp / incomingDmg) : 999;
        if (mySurviveTurns >= 2) {
            score += 200; // 能吃两发，很稳
        } else if (mySurviveTurns < 1) {
            score -= 300; // 上来就死，尽量不选
        }
        
        // 4. 先制技能加分
        for (const m of p.moves) {
            const mergedMove = getMergedMoveData(m);
            if ((mergedMove.priority || 0) > 0 && (mergedMove.basePower || mergedMove.power || 0) > 0) {
                const result = simulateDamage(p, opp, mergedMove);
                if (result.damage >= oppHp) {
                    score += 400; // 先制技能能秒杀，极高优先级
                } else {
                    score += 100; // 有先制技能
                }
            }
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
        }
    });
    
    console.log(`[AI] getBestRevengeKiller: best index = ${bestIdx}, score = ${bestScore}`);
    return bestIdx;
}

/* =============================================================
 *  导出
 * ============================================================= */
if (typeof window !== 'undefined') {
    window.AI_DIFFICULTY = AI_DIFFICULTY;
    window.AI_ACTION_TYPE = AI_ACTION_TYPE;
    window.getAiAction = getAiAction;
    window.getExpertAiAction = getExpertAiAction;
    window.getHardAiMove = getHardAiMove;
    window.getNormalAiMove = getNormalAiMove;
    window.getEasyAiMove = getEasyAiMove;
    window.getBestRevengeKiller = getBestRevengeKiller;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AI_DIFFICULTY,
        AI_ACTION_TYPE,
        getAiAction,
        getExpertAiAction,
        getHardAiMove,
        getNormalAiMove,
        getEasyAiMove
    };
}
