/**
 * ===========================================
 * GROWTH SYSTEM - 动漫风格等级建议系统
 * ===========================================
 * 
 * 基于"战功"和"戏剧性"计算成长潜力系数
 * 不再计算具体 EXP 数值，而是给出"极限突破"建议
 * 
 * 设计思路：
 * - 虐菜 (Stomp) -> 几乎无成长 (+0 ~ +1 Lv)
 * - 苦战 (Clutch) -> 高成长 (+2 ~ +3 Lv)
 * - 下克上 (Underdog) -> 极限爆发 (+5 Lv 以上)
 */

/**
 * 核心逻辑：经验建议计算器
 * @param {object} analysis - 包含 rank, hpHealth, levelDiff, resultLabel 的分析对象
 * @param {string} result - 'win' | 'loss' | 'escape' | 'caught'
 * @returns {object} { val: number, reason: string, distribution: string[] }
 */
function calculateAnimeGrowth(analysis, result) {
    const battle = window.battle;
    if (!battle) {
        return { val: 0, reason: '无法获取战斗数据。', distribution: [] };
    }
    
    const pParty = battle.playerParty || [];
    const eParty = battle.enemyParty || [];
    
    if (pParty.length === 0) {
        return { val: 0, reason: '无法获取队伍数据。', distribution: [] };
    }
    
    // 基础成长值
    let levels = 0;
    
    // =========================================================
    // 1. 结果基础分（降低基础值）
    // =========================================================
    if (result === 'win') {
        levels += 0.3; // 降低基础值，避免通货膨胀
    } else if (result === 'loss') {
        levels += 0.2; // 即使输了，也是很好的教训
    } else if (result === 'caught') {
        levels += 0.2; // 捕获战斗通常不是高强度对决
    } else if (result === 'escape') {
        levels += 0; // 逃跑没有成长
    }
    
    // =========================================================
    // 2. 对手强度权重 (Boss战加成)
    // =========================================================
    const isBoss = battle.aiDifficulty === 'expert' || battle.aiDifficulty === 'hard';
    const isTrainer = battle.trainer && battle.trainer.id !== 'wild';
    const isEliteFour = battle.trainer && (
        battle.trainer.title?.includes('四天王') ||
        battle.trainer.title?.includes('Elite') ||
        battle.trainer.title?.includes('Champion') ||
        battle.trainer.title?.includes('冠军')
    );
    
    if (isEliteFour) {
        levels += 3; // 四天王/冠军级别
    } else if (isBoss) {
        levels += 2; // 打强敌不管输赢都血赚
    } else if (isTrainer) {
        levels += 1;
    }
    
    // =========================================================
    // 3. 等级跃迁：你越弱，你越强（扩展判定）
    // =========================================================
    const avgPLv = pParty.reduce((sum, p) => sum + (p.level || p.lv || 1), 0) / Math.max(1, pParty.length);
    const avgELv = eParty.reduce((sum, p) => sum + (p.level || p.lv || 1), 0) / Math.max(1, eParty.length);
    const levelDiff = avgELv - avgPLv;
    
    // 敌方等级更高（下克上）
    if (levelDiff >= 30) {
        levels += 7; // 跨越30级的挑战，简直是神话
    } else if (levelDiff >= 20) {
        levels += 5; // 跨越20级的挑战，简直是神迹
    } else if (levelDiff >= 10) {
        levels += 3;
    } else if (levelDiff >= 5) {
        levels += 1.5;
    } else if (levelDiff >= 3) {
        levels += 0.5; // 小幅领先
    }
    // 同级别或我方略高（正常成长）
    else if (levelDiff >= -2 && levelDiff < 3) {
        levels += 0; // 势均力敌，基础分已给
    }
    // 我方等级更高（虐菜惩罚）
    else if (levelDiff >= -5) {
        levels -= 0.3; // 轻微虐菜
    } else if (levelDiff >= -10) {
        levels -= 0.6; // 虐菜
    } else if (levelDiff >= -20) {
        levels -= 1.2; // 严重虐菜
    } else if (levelDiff < -20) {
        levels -= 2; // 极端虐菜（-30级以上）
    }
    
    // =========================================================
    // 4. 戏剧性因子 (Drama Factor)
    // =========================================================
    const hpHealth = analysis.hpHealth || 0;
    const rank = analysis.rank || '';
    
    // 濒死反杀？(我方很惨且赢了)
    if (result === 'win' && hpHealth < 10) {
        levels += 2; // 极度残血反杀（<10%），突破极限的证明
    } else if (result === 'win' && hpHealth < 20) {
        levels += 1.5; // 残血反杀（<20%）
    } else if (result === 'win' && hpHealth < 40) {
        levels += 0.5; // 残血险胜（<40%）
    }
    
    // 无伤？(Rank S+)
    if (rank && rank.startsWith('S')) {
        // 无伤反而说明学不到太多东西（因为太轻松），除非对面等级很高
        if (levelDiff > 10) {
            levels += 2; // 高超技巧碾压强敌
        } else if (levelDiff > 0) {
            levels += 1; // 技巧取胜
        } else {
            levels = Math.max(0, levels - 1); // 这个叫炸鱼
        }
    }
    
    // 绝境反杀特殊加成
    if (rank && rank.includes('绝境反杀')) {
        levels += 2;
    }
    
    // 死斗/苦战加成
    if (rank && (rank.includes('死斗') || rank.includes('苦战'))) {
        levels += 1;
    }
    
    // =========================================================
    // 5. 机制掌握加成
    // =========================================================
    if (battle.playerMegaUsed) levels += 0.5;
    if (battle.playerZUsed) levels += 0.5;
    if (battle.playerMaxUsed) levels += 0.5;
    if (battle.playerTeraUsed) levels += 0.5;
    if (battle.playerBondUsed) levels += 1.5; // 羁绊进化证明了心灵的成长
    
    // =========================================================
    // 6. 对冲系统使用加成
    // =========================================================
    if (battle.clashCount && battle.clashCount > 0) {
        levels += Math.min(1, battle.clashCount * 0.3); // 对冲次数加成，上限1级
    }
    
    // =========================================================
    // 7. 野生战斗削弱（×0.6）
    // =========================================================
    if (!isTrainer && result !== 'caught') {
        levels *= 0.6; // 野生战斗经验削弱40%
        console.log('[GROWTH] 野生战斗削弱: ×0.6');
    }
    
    // =========================================================
    // 格式化输出
    // =========================================================
    levels = Math.max(0, levels);
    const rawGain = Math.ceil(levels);
    
    // 生成评估文案
    let reason = '日常的训练积累。';
    if (rawGain >= 10) {
        reason = '超越神话的壮举！连传说中的宝可梦都会为之侧目！';
    } else if (rawGain >= 8) {
        reason = '灵魂深处的觉醒！打破了生物学的界限！';
    } else if (rawGain >= 5) {
        reason = '甚至连基因序列都得到了升华的死斗成长！';
    } else if (rawGain >= 3) {
        reason = '通过这一战，理解了宝可梦战斗的真谛。';
    } else if (rawGain === 2) {
        reason = '在实战中获得了显著的成长。';
    } else if (rawGain === 1) {
        reason = '积累了宝贵的实战经验。';
    } else {
        reason = '这种程度的对手，已经起不到锻炼效果了。';
    }
    
    // =========================================================
    // 队伍分配建议
    // =========================================================
    const distribution = [];
    if (rawGain > 0) {
        pParty.forEach(p => {
            const pName = p.cnName || p.name || '???';
            const isFallen = p.currHp <= 0;
            
            // 倒下的宝可梦获得一半经验（但至少1级如果有经验的话）
            let pokeGain = rawGain;
            if (isFallen && rawGain > 1) {
                pokeGain = Math.max(1, Math.floor(rawGain * 0.5));
                distribution.push(`${pName}(+${pokeGain})[败战]`);
            } else if (isFallen && rawGain === 1) {
                distribution.push(`${pName}(+0)[败战]`);
            } else {
                distribution.push(`${pName}(+${pokeGain})`);
            }
        });
    }
    
    return {
        val: rawGain,
        reason: reason,
        distribution: distribution,
        levelDiff: Math.round(levelDiff),
        avgPlayerLevel: Math.round(avgPLv),
        avgEnemyLevel: Math.round(avgELv)
    };
}

/**
 * 生成成长建议文本块（用于插入战报）
 * @param {object} growth - calculateAnimeGrowth 的返回值
 * @returns {string[]} 文本行数组
 */
function formatGrowthReport(growth) {
    const rows = [];
    
    rows.push('');
    rows.push('<GROWTH_SUGGESTION>');
    rows.push(`【⚔️ 成长建议 System】: +${growth.val} LEVELS`);
    rows.push(`  > 等级差: 我方 Lv.${growth.avgPlayerLevel} vs 敌方 Lv.${growth.avgEnemyLevel} (差距: ${growth.levelDiff > 0 ? '+' : ''}${growth.levelDiff})`);
    rows.push(`  > 评估逻辑: ${growth.reason}`);
    
    if (growth.distribution && growth.distribution.length > 0) {
        rows.push(`  > 队伍分配建议: ${growth.distribution.join('、')}`);
    }
    rows.push('</GROWTH_SUGGESTION>');
    
    return rows;
}

// 导出到全局
window.calculateAnimeGrowth = calculateAnimeGrowth;
window.formatGrowthReport = formatGrowthReport;

console.log('[GROWTH SYSTEM] 动漫风格等级建议系统已加载');
