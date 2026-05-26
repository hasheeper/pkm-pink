/**
 * =============================================
 * MOVE HANDLERS - 技能处理器 (策略模式)
 * =============================================
 * 
 * 本文件使用策略模式处理特殊技能逻辑，
 * 避免在 battle-engine.js 中堆积大量 if-else。
 * 
 * 每个技能可以注册以下钩子：
 * - basePowerCallback: 动态计算威力
 * - damageCallback: 完全自定义伤害计算
 * - onHit: 命中后的额外效果
 * - onMiss: 未命中时的效果
 * - onUse: 使用时的效果（蓄力等）
 * - onAfterHit: 命中后的额外效果（带伤害参数）
 * - modifyAtk: 修改攻击力计算
 * - modifyDef: 修改防御力计算
 */

// ============================================
// 辅助函数
// ============================================

/**
 * 【统一回复函数】处理 HP 回复，自动应用环境图层修正
 * @param {Pokemon} pokemon 要回复的宝可梦
 * @param {number} baseAmount 基础回复量
 * @param {string} source 回复来源（用于日志）
 * @returns {number} 实际回复量
 */
function applyHeal(pokemon, baseAmount, source = 'move') {
    if (baseAmount <= 0) return 0;
    
    // 【回复封锁 Heal Block / Psychic Noise】检查
    if (pokemon.volatile && pokemon.volatile.healBlock && pokemon.volatile.healBlock > 0) {
        console.log(`[HEAL BLOCK] ${pokemon.cnName || pokemon.name} 处于回复封锁状态，无法回复!`);
        return 0;
    }
    
    const maxHeal = pokemon.maxHp - pokemon.currHp;
    if (maxHeal <= 0) return 0;
    
    // 优先使用 WeatherEffects.applyHeal（包含环境图层修正）
    if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
        return window.WeatherEffects.applyHeal(pokemon, baseAmount, { source });
    }
    
    // Fallback: 手动应用修正
    let actualHeal = baseAmount;
    
    // 环境图层修正
    if (typeof window !== 'undefined' && window.envOverlay?.getHealMod) {
        const envMult = window.envOverlay.getHealMod(pokemon);
        if (envMult !== 1) {
            const before = actualHeal;
            actualHeal = Math.floor(actualHeal * envMult);
            console.log(`[ENV OVERLAY] 🌍 环境回复修正: ${before} -> ${actualHeal} (x${envMult})`);
        }
    }
    
    actualHeal = Math.min(actualHeal, maxHeal);
    pokemon.currHp += actualHeal;
    
    return actualHeal;
}

/**
 * 处理蓄力技能的 onUse 钩子
 * 统一处理天气联动、强力香草、蓄力状态等逻辑
 * @param {Pokemon} attacker 攻击方
 * @param {string} moveName 技能名称
 * @param {object} battle 战斗状态
 * @param {Array} logs 日志数组
 * @returns {object} { skipDamage, charging, released }
 */
function handleChargeMoveOnUse(attacker, moveName, battle, logs) {
    // 获取蓄力配置
    const config = (typeof getChargeMoveConfig === 'function') 
        ? getChargeMoveConfig(moveName) 
        : (typeof window !== 'undefined' && window.CHARGE_MOVES) 
            ? window.CHARGE_MOVES[moveName] 
            : null;
    
    if (!config) {
        // 没有配置，直接执行
        return {};
    }
    
    // 检查是否正在蓄力中（第二回合）
    const chargingMove = attacker.volatile?.chargingMove;
    if (chargingMove === moveName) {
        // 第二回合：释放攻击
        if (attacker.volatile) {
            delete attacker.volatile.chargingMove;
            // 清除半无敌状态
            if (config.type === 'invuln' && config.status) {
                delete attacker.volatile[config.status];
            }
        }
        
        // 释放时的能力提升（如 Geomancy）
        if (config.releaseBoost) {
            const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
            for (const [stat, stages] of Object.entries(config.releaseBoost)) {
                if (attacker.applyBoost) {
                    attacker.applyBoost(stat, stages);
                    const changeText = stages >= 2 ? '大幅' : '';
                    logs.push(`${attacker.cnName} 的${statNames[stat] || stat}${changeText}提升了！`);
                }
            }
        }
        
        logs.push(`${attacker.cnName} ${config.releaseText}`);
        return { released: true };
    }
    
    // 第一回合：检查是否可以跳过蓄力
    let canSkip = false;
    let skipReason = null;
    let consumeItem = false;
    
    // 1. 天气联动型：检查天气
    if (config.type === 'weather' && config.weather) {
        const currentWeather = battle?.weather || null;
        if (currentWeather && config.weather.includes(currentWeather)) {
            canSkip = true;
            skipReason = 'weather';
        }
    }
    
    // 2. 强力香草 (Power Herb)：消耗道具跳过蓄力
    if (!canSkip) {
        const userItem = (attacker.item || '').toLowerCase().replace(/[^a-z]/g, '');
        if (userItem === 'powerherb') {
            canSkip = true;
            skipReason = 'powerherb';
            consumeItem = true;
        }
    }
    
    if (canSkip) {
        // 可以跳过蓄力，直接攻击
        if (consumeItem) {
            logs.push(`${attacker.cnName} 的强力香草生效了！`);
            attacker.item = null;
        }
        
        // 蓄力期间的能力提升仍然生效
        if (config.chargeBoost) {
            const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
            for (const [stat, stages] of Object.entries(config.chargeBoost)) {
                if (attacker.applyBoost) {
                    attacker.applyBoost(stat, stages);
                    logs.push(`${attacker.cnName} 的${statNames[stat] || stat}提升了！`);
                }
            }
        }
        
        if (skipReason === 'weather') {
            logs.push(`${attacker.cnName} 借助天气的力量，${config.releaseText}`);
        } else {
            logs.push(`${attacker.cnName} ${config.releaseText}`);
        }
        
        return { released: true };
    }
    
    // 需要蓄力
    attacker.volatile = attacker.volatile || {};
    attacker.volatile.chargingMove = moveName;
    
    // 半无敌状态
    if (config.type === 'invuln' && config.status) {
        attacker.volatile[config.status] = true;
    }
    
    // 蓄力期间的能力提升
    if (config.chargeBoost) {
        const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
        for (const [stat, stages] of Object.entries(config.chargeBoost)) {
            if (attacker.applyBoost) {
                attacker.applyBoost(stat, stages);
                logs.push(`${attacker.cnName} 的${statNames[stat] || stat}提升了！`);
            }
        }
    }
    
    logs.push(`${attacker.cnName} ${config.chargeText}`);
    
    // 阻止伤害计算，本回合结束
    return { charging: true, skipDamage: true };
}

/**
 * 检查道具是否可以被 Knock Off 打落
 * 不能打落：Mega 石、Z 纯晶、专属道具（朱红色宝珠等）
 */
export function canKnockOff(pokemon) {
    if (!pokemon.item) return false;
    
    const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Mega 石不能打落
    if (itemId.endsWith('ite') || itemId.endsWith('itex') || itemId.endsWith('itey')) {
        // 检查是否是对应宝可梦的 Mega 石
        const pokemonId = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemId.includes(pokemonId) || itemId.includes('mega')) {
            return false;
        }
    }
    
    // Z 纯晶不能打落
    if (itemId.endsWith('z') && itemId.includes('ium')) {
        return false;
    }
    
    // 专属道具不能打落（朱红色宝珠、靛蓝色宝珠等）
    const unremovableItems = [
        'redorb', 'blueorb', // 固拉多/盖欧卡
        'griseousorb', 'griseouscore', // 骑拉帝纳
        'adamantorb', 'lustrousorb', // 帝牙卢卡/帕路奇亚
        'souldew', // 拉帝亚斯/拉帝欧斯（Gen6 前）
        'rustedsword', 'rustedshield', // 苍响/藏玛然特
        'boosterenergy', // 悖谬种（不能打落）
    ];
    if (unremovableItems.includes(itemId)) {
        return false;
    }
    
    // Sticky Hold 特性防止道具被打落
    if (typeof AbilityHandlers !== 'undefined' && pokemon.ability) {
        const handler = AbilityHandlers[pokemon.ability];
        if (handler && handler.preventItemTheft) {
            return false;
        }
    }
    
    return true;
}

export const MoveHandlers = {
    
    // ============================================
    // 1. 固定伤害技能 (Fixed Damage Moves)
    // ============================================
    
    'Night Shade': {
        damageCallback: (attacker, defender) => {
            return attacker.level;
        },
        description: '造成等于使用者等级的固定伤害'
    },
    
    'Seismic Toss': {
        damageCallback: (attacker, defender) => {
            return attacker.level;
        },
        description: '造成等于使用者等级的固定伤害'
    },
    
    'Psywave': {
        damageCallback: (attacker, defender) => {
            // 伤害 = 等级 × (0.5 ~ 1.5) 随机
            const multiplier = 0.5 + Math.random();
            return Math.floor(attacker.level * multiplier);
        },
        description: '造成等级相关的随机伤害'
    },
    
    'Dragon Rage': {
        damageCallback: (attacker, defender) => {
            return 40; // 固定 40 点伤害
        },
        description: '固定造成 40 点伤害'
    },
    
    'Sonic Boom': {
        damageCallback: (attacker, defender) => {
            return 20; // 固定 20 点伤害
        },
        description: '固定造成 20 点伤害'
    },
    
    'Super Fang': {
        damageCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(defender.currHp / 2));
        },
        description: '造成目标当前 HP 一半的伤害'
    },
    
    'Nature\'s Madness': {
        damageCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(defender.currHp / 2));
        },
        description: '造成目标当前 HP 一半的伤害'
    },
    
    'Guardian of Alola': {
        damageCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(defender.currHp * 0.75));
        },
        description: '造成目标当前 HP 75% 的伤害'
    },
    
    // 【大灾难 Ruination】- 古鼎鹿/古剑豹/古简蜗/古镜鱼 专属招式
    // 造成目标当前 HP 一半的伤害（与愤怒门牙相同）
    'Ruination': {
        damageCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(defender.currHp / 2));
        },
        description: '造成目标当前 HP 一半的伤害'
    },
    
    // ============================================
    // 2. 动态威力技能 (Dynamic Power Moves)
    // ============================================
    
    'Gyro Ball': {
        basePowerCallback: (attacker, defender) => {
            // 威力 = 25 × (目标速度 / 自己速度) + 1，最高 150
            const userSpeed = Math.max(1, attacker.getStat('spe'));
            const targetSpeed = Math.max(1, defender.getStat('spe'));
            const power = Math.floor(25 * targetSpeed / userSpeed) + 1;
            return Math.min(150, power);
        },
        description: '速度越慢威力越高'
    },
    
    'Electro Ball': {
        basePowerCallback: (attacker, defender) => {
            // 威力根据速度比值
            const userSpeed = Math.max(1, attacker.getStat('spe'));
            const targetSpeed = Math.max(1, defender.getStat('spe'));
            const ratio = userSpeed / targetSpeed;
            if (ratio >= 4) return 150;
            if (ratio >= 3) return 120;
            if (ratio >= 2) return 80;
            if (ratio >= 1) return 60;
            return 40;
        },
        description: '速度越快威力越高'
    },
    
    'Grass Knot': {
        basePowerCallback: (attacker, defender) => {
            // 根据目标体重（简化：用 HP 基础值模拟）
            const weight = defender.maxHp; // 简化处理
            if (weight >= 200) return 120;
            if (weight >= 150) return 100;
            if (weight >= 100) return 80;
            if (weight >= 50) return 60;
            if (weight >= 25) return 40;
            return 20;
        },
        description: '目标越重威力越高'
    },
    
    'Low Kick': {
        basePowerCallback: (attacker, defender) => {
            const weight = defender.maxHp;
            if (weight >= 200) return 120;
            if (weight >= 150) return 100;
            if (weight >= 100) return 80;
            if (weight >= 50) return 60;
            if (weight >= 25) return 40;
            return 20;
        },
        description: '目标越重威力越高'
    },
    
    'Heavy Slam': {
        basePowerCallback: (attacker, defender) => {
            // 根据体重比
            const userWeight = attacker.maxHp;
            const targetWeight = Math.max(1, defender.maxHp);
            const ratio = userWeight / targetWeight;
            if (ratio >= 5) return 120;
            if (ratio >= 4) return 100;
            if (ratio >= 3) return 80;
            if (ratio >= 2) return 60;
            return 40;
        },
        description: '自己越重威力越高'
    },
    
    'Heat Crash': {
        basePowerCallback: (attacker, defender) => {
            const userWeight = attacker.maxHp;
            const targetWeight = Math.max(1, defender.maxHp);
            const ratio = userWeight / targetWeight;
            if (ratio >= 5) return 120;
            if (ratio >= 4) return 100;
            if (ratio >= 3) return 80;
            if (ratio >= 2) return 60;
            return 40;
        },
        description: '自己越重威力越高'
    },
    
    'Stored Power': {
        basePowerCallback: (attacker, defender) => {
            // 威力 = 20 + 20 × 能力提升总等级
            let totalBoosts = 0;
            for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) {
                if (attacker.boosts[stat] > 0) {
                    totalBoosts += attacker.boosts[stat];
                }
            }
            return 20 + 20 * totalBoosts;
        },
        description: '能力提升越多威力越高'
    },
    
    'Power Trip': {
        basePowerCallback: (attacker, defender) => {
            let totalBoosts = 0;
            for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) {
                if (attacker.boosts[stat] > 0) {
                    totalBoosts += attacker.boosts[stat];
                }
            }
            return 20 + 20 * totalBoosts;
        },
        description: '能力提升越多威力越高'
    },
    
    'Punishment': {
        basePowerCallback: (attacker, defender) => {
            // 威力 = 60 + 20 × 目标能力提升总等级，最高 200
            let totalBoosts = 0;
            for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) {
                if (defender.boosts[stat] > 0) {
                    totalBoosts += defender.boosts[stat];
                }
            }
            return Math.min(200, 60 + 20 * totalBoosts);
        },
        description: '目标能力提升越多威力越高'
    },
    
    'Reversal': {
        basePowerCallback: (attacker, defender) => {
            // 威力根据剩余 HP 百分比
            const hpPercent = attacker.currHp / attacker.maxHp;
            if (hpPercent <= 0.0417) return 200;
            if (hpPercent <= 0.1042) return 150;
            if (hpPercent <= 0.2083) return 100;
            if (hpPercent <= 0.3542) return 80;
            if (hpPercent <= 0.6875) return 40;
            return 20;
        },
        description: 'HP 越低威力越高'
    },
    
    'Flail': {
        basePowerCallback: (attacker, defender) => {
            const hpPercent = attacker.currHp / attacker.maxHp;
            if (hpPercent <= 0.0417) return 200;
            if (hpPercent <= 0.1042) return 150;
            if (hpPercent <= 0.2083) return 100;
            if (hpPercent <= 0.3542) return 80;
            if (hpPercent <= 0.6875) return 40;
            return 20;
        },
        description: 'HP 越低威力越高'
    },
    
    'Eruption': {
        basePowerCallback: (attacker, defender) => {
            // 威力 = 150 × (当前HP / 最大HP)
            return Math.max(1, Math.floor(150 * attacker.currHp / attacker.maxHp));
        },
        description: 'HP 越高威力越高'
    },
    
    'Water Spout': {
        basePowerCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(150 * attacker.currHp / attacker.maxHp));
        },
        description: 'HP 越高威力越高'
    },
    
    'Crush Grip': {
        basePowerCallback: (attacker, defender) => {
            // 威力 = 120 × (目标当前HP / 目标最大HP)
            return Math.max(1, Math.floor(120 * defender.currHp / defender.maxHp));
        },
        description: '目标 HP 越高威力越高'
    },
    
    'Wring Out': {
        basePowerCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(120 * defender.currHp / defender.maxHp));
        },
        description: '目标 HP 越高威力越高'
    },
    
    // 【报恩 Return】威力 = AVS四维平均值 / 2.5（满值102）
    'Return': {
        basePowerCallback: (attacker, defender) => {
            // 使用 AVS 四维平均值代替亲密度
            let avsAvg = 255; // 默认满值
            if (attacker.isAce && attacker.avs) {
                const trust = (attacker.getEffectiveAVs ? attacker.getEffectiveAVs('trust') : attacker.avs.trust) || 0;
                const passion = (attacker.getEffectiveAVs ? attacker.getEffectiveAVs('passion') : attacker.avs.passion) || 0;
                const insight = (attacker.getEffectiveAVs ? attacker.getEffectiveAVs('insight') : attacker.avs.insight) || 0;
                const devotion = (attacker.getEffectiveAVs ? attacker.getEffectiveAVs('devotion') : attacker.avs.devotion) || 0;
                avsAvg = (trust + passion + insight + devotion) / 4;
            }
            // 原公式: 威力 = 亲密度 / 2.5, 最高102 (255/2.5)
            return Math.max(1, Math.floor(avsAvg / 2.5));
        },
        description: '与宝可梦的羁绊(AVS平均值)越高威力越大，最高102'
    },

    // 【迁怒 Frustration】威力 = (255 - AVS四维平均值) / 2.5（AVS越低威力越高）
    'Frustration': {
        basePowerCallback: (attacker, defender) => {
            let avsAvg = 255;
            if (attacker.isAce && attacker.avs) {
                const trust = (attacker.getEffectiveAVs ? attacker.getEffectiveAVs('trust') : attacker.avs.trust) || 0;
                const passion = (attacker.getEffectiveAVs ? attacker.getEffectiveAVs('passion') : attacker.avs.passion) || 0;
                const insight = (attacker.getEffectiveAVs ? attacker.getEffectiveAVs('insight') : attacker.avs.insight) || 0;
                const devotion = (attacker.getEffectiveAVs ? attacker.getEffectiveAVs('devotion') : attacker.avs.devotion) || 0;
                avsAvg = (trust + passion + insight + devotion) / 4;
            }
            // 原公式: 威力 = (255 - 亲密度) / 2.5
            return Math.max(1, Math.floor((255 - avsAvg) / 2.5));
        },
        description: '与宝可梦的羁绊(AVS平均值)越低威力越大，最高102'
    },

    // 【投掷 Fling】威力取决于持有道具
    'Fling': {
        basePowerCallback: (attacker, defender) => {
            const item = (attacker.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!item) return 0; // 没有道具则失败
            // 常见道具威力表
            const flingPowers = {
                'ironball': 130, 'hardstone': 100, 'rarebone': 100,
                'toxicorb': 30, 'flameorb': 30, 'lightball': 30,
                'kingsrock': 30, 'razorfang': 30,
                'choiceband': 10, 'choicescarf': 10, 'choicespecs': 10,
                'lifeorb': 30, 'leftovers': 10, 'focussash': 10,
                'assaultvest': 10, 'rockyhelmet': 60,
                'stickybarb': 80, 'blacksludge': 30,
                'whiteherb': 10, 'mentalherb': 10, 'powerherb': 10,
            };
            return flingPowers[item] || 30; // 默认30
        },
        onHit: (user, target, damage, logs) => {
            // 投掷后失去道具
            const itemName = user.item || '';
            if (itemName) {
                user.item = null;
                logs.push(`${user.cnName} 投掷了 ${itemName}!`);
                // 毒宝珠/火焰宝珠的特殊效果
                const itemId = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (itemId === 'toxicorb') {
                    if (!target.status) { target.status = 'tox'; target.statusTurns = 0; }
                } else if (itemId === 'flameorb') {
                    if (!target.status) { target.status = 'brn'; target.statusTurns = 0; }
                } else if (itemId === 'kingsrock' || itemId === 'razorfang') {
                    if (!target.volatile) target.volatile = {};
                    target.volatile.flinch = true;
                } else if (itemId === 'lightball') {
                    if (!target.status) { target.status = 'par'; target.statusTurns = 0; }
                }
            }
        },
        description: '投掷持有道具攻击，威力和效果取决于道具'
    },

    // 【自然之恩 Natural Gift】威力和属性取决于持有树果
    'Natural Gift': {
        basePowerCallback: (attacker, defender) => {
            const item = (attacker.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!item || !item.includes('berry')) return 0; // 非树果则失败
            return 80; // Gen5+ 大部分树果威力80
        },
        onUse: (user, target, logs) => {
            const item = (user.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!item || !item.includes('berry')) {
                logs.push(`但是失败了！(没有持有树果)`);
                return { failed: true };
            }
            user.item = null; // 消耗树果
            return {};
        },
        description: '消耗持有的树果攻击，威力和属性取决于树果种类'
    },

    // 【王牌 Trump Card】威力取决于剩余PP（PP越少威力越高）
    'Trump Card': {
        basePowerCallback: (attacker, defender) => {
            // 使用 PPSystem 获取真实 PP 值
            if (typeof window !== 'undefined' && window.PPSystem) {
                return window.PPSystem.getTrumpCardPower(attacker);
            }
            return 80; // fallback
        },
        description: '剩余PP越少威力越高，最高200'
    },

    // 【礼物 Present】随机威力或回复对手（用 basePowerCallback 走标准伤害公式）
    'Present': {
        basePowerCallback: (attacker, defender, move, battle) => {
            const roll = Math.random() * 100;
            if (roll < 40) return 40;       // 40% 概率威力40
            if (roll < 70) return 80;       // 30% 概率威力80
            if (roll < 80) return 120;      // 10% 概率威力120
            // 20% 概率回复对手 1/4 HP
            if (defender && defender.maxHp) {
                const healAmount = Math.floor(defender.maxHp / 4);
                defender.currHp = Math.min(defender.maxHp, defender.currHp + healAmount);
                console.log(`[PRESENT] 🎁 回复了对手 ${healAmount} HP!`);
            }
            return 0; // 不造成伤害
        },
        description: '随机威力40/80/120，或回复对手1/4HP'
    },

    // 【震级 Magnitude】随机威力（仅用 basePowerCallback，不用 damageCallback）
    'Magnitude': {
        basePowerCallback: (attacker, defender) => {
            const roll = Math.random() * 100;
            let magnitude, power;
            if (roll < 5) { magnitude = 4; power = 10; }
            else if (roll < 15) { magnitude = 5; power = 30; }
            else if (roll < 35) { magnitude = 6; power = 50; }
            else if (roll < 65) { magnitude = 7; power = 70; }
            else if (roll < 85) { magnitude = 8; power = 90; }
            else if (roll < 95) { magnitude = 9; power = 110; }
            else { magnitude = 10; power = 150; }
            console.log(`[MAGNITUDE] 震级 ${magnitude}! 威力 ${power}`);
            return power;
        },
        description: '随机震级4~10，威力10~150'
    },

    // 【鳃咬】先手威力翻倍 (Gen 8 化石龙核心招式)
    'Fishious Rend': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 如果使用者比目标先行动，威力翻倍 (85 -> 170)
            const mySpeed = attacker.getStat ? attacker.getStat('spe') : attacker.spe;
            const enemySpeed = defender.getStat ? defender.getStat('spe') : defender.spe;
            // 简化判定：速度快的视为先行动
            if (mySpeed >= enemySpeed) {
                console.log(`[Fishious Rend] 先手威力翻倍！170`);
                return 170;
            }
            return 85;
        },
        description: '如果比对手先出手，威力翻倍 (170)'
    },
    
    // 【电喙】先手威力翻倍 (Gen 8 化石龙核心招式)
    'Bolt Beak': {
        basePowerCallback: (attacker, defender, move, battle) => {
            const mySpeed = attacker.getStat ? attacker.getStat('spe') : attacker.spe;
            const enemySpeed = defender.getStat ? defender.getStat('spe') : defender.spe;
            if (mySpeed >= enemySpeed) {
                console.log(`[Bolt Beak] 先手威力翻倍！170`);
                return 170;
            }
            return 85;
        },
        description: '如果比对手先出手，威力翻倍 (170)'
    },
    
    // ============================================
    // 2.5 条件倍率技能 (Conditional Power Moves)
    // ============================================
    
    // 【落拳 Knock Off】竞技环境万金油
    // 如果目标持有可移除道具，威力 x1.5，攻击后移除道具
    'Knock Off': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 检查目标是否持有可移除道具
            if (defender.item && canKnockOff(defender)) {
                console.log(`[Knock Off] 目标持有 ${defender.item}，威力 x1.5`);
                return 97; // 65 * 1.5 = 97.5
            }
            return 65;
        },
        onAfterHit: (attacker, defender, move, damage, logs) => {
            // 攻击后移除道具
            if (defender.item && canKnockOff(defender) && damage > 0) {
                const removedItem = defender.item;
                defender.item = null;
                logs.push(`<b style="color:#8b5cf6">🔨 ${defender.cnName} 的 ${removedItem} 被打落了！</b>`);
                
                // 触发 Unburden 等特性
                if (typeof defender.consumeItem === 'function') {
                    // consumeItem 已经处理了 item = null，这里只触发钩子
                    if (typeof AbilityHandlers !== 'undefined' && defender.ability) {
                        const handler = AbilityHandlers[defender.ability];
                        if (handler && handler.onItemLost) {
                            handler.onItemLost(defender, removedItem, logs);
                        }
                    }
                }
            }
        },
        description: '如果目标持有道具，威力x1.5并打落道具'
    },
    
    // 【杂技 Acrobatics】消耗流飞行系核心
    // 不持有道具时威力翻倍 (55 -> 110)
    'Acrobatics': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (!attacker.item) {
                console.log(`[Acrobatics] 无道具，威力翻倍！110`);
                return 110;
            }
            return 55;
        },
        description: '不持有道具时威力翻倍 (110)'
    },
    
    // 【硬撑 Facade】异常状态物攻手核心
    // 烧伤/麻痹/中毒时威力翻倍，且无视烧伤的物攻减半
    'Facade': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (attacker.status === 'brn' || attacker.status === 'par' || 
                attacker.status === 'psn' || attacker.status === 'tox') {
                console.log(`[Facade] 异常状态，威力翻倍！140`);
                return 140;
            }
            return 70;
        },
        ignoreBurn: true, // 标记：无视烧伤的物攻减半
        description: '异常状态时威力翻倍 (140)，无视烧伤减攻'
    },
    
    // 【祸不单行 Hex】鬼火流特攻手核心
    // 目标有异常状态时威力翻倍
    'Hex': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (defender.status) {
                console.log(`[Hex] 目标有异常状态，威力翻倍！130`);
                return 130;
            }
            return 65;
        },
        description: '目标有异常状态时威力翻倍 (130)'
    },
    
    // 【报复 Payback】被打后威力翻倍
    'Payback': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 简化：如果速度比对手慢，视为后手，威力翻倍
            const mySpeed = attacker.getStat ? attacker.getStat('spe') : attacker.spe;
            const enemySpeed = defender.getStat ? defender.getStat('spe') : defender.spe;
            if (mySpeed < enemySpeed) {
                return 100;
            }
            return 50;
        },
        description: '后手时威力翻倍 (100)'
    },
    
    // 【报仇 Revenge】被打后威力翻倍
    'Revenge': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 如果本回合受到过伤害，威力翻倍
            if (attacker.turnData && attacker.turnData.lastDamageTaken && attacker.turnData.lastDamageTaken.amount > 0) {
                return 120;
            }
            return 60;
        },
        description: '本回合受伤后威力翻倍 (120)'
    },
    
    // ============================================
    // 【雪崩 Avalanche】本回合受伤后威力翻倍
    // ============================================
    'Avalanche': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (attacker.turnData && attacker.turnData.lastDamageTaken && attacker.turnData.lastDamageTaken.amount > 0) {
                return 120;
            }
            return 60;
        },
        description: '本回合受伤后威力翻倍 (120)'
    },
    
    // ============================================
    // 【以牙还牙 Assurance】目标本回合已受伤则威力翻倍
    // ============================================
    'Assurance': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 检查目标本回合是否已受过伤害（钉子、先手攻击等）
            if (defender.turnData && defender.turnData.damageTakenThisTurn && defender.turnData.damageTakenThisTurn > 0) {
                return 120;
            }
            return 60;
        },
        description: '目标本回合已受伤则威力翻倍 (120)'
    },
    
    // ============================================
    // 【跺脚 Stomping Tantrum】上回合招式失败则威力翻倍
    // ============================================
    'Stomping Tantrum': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (attacker.lastMoveFailed) {
                return 150;
            }
            return 75;
        },
        description: '上回合招式失败则威力翻倍 (150)'
    },
    
    // ============================================
    // 【发愤图强 Temper Flare】上回合招式失败则威力翻倍
    // ============================================
    'Temper Flare': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (attacker.lastMoveFailed) {
                return 150;
            }
            return 75;
        },
        description: '上回合招式失败则威力翻倍 (150)'
    },
    
    // ============================================
    // 【龙能 Dragon Energy】HP 越高威力越高 (同喷火/潮旋)
    // ============================================
    'Dragon Energy': {
        basePowerCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(150 * attacker.currHp / attacker.maxHp));
        },
        description: 'HP 越高威力越高，满血150'
    },
    
    // ============================================
    // 【重磅冲撞 Hard Press】目标 HP 越高威力越高
    // 威力 = 100 × (目标当前HP / 目标最大HP)，最低1
    // ============================================
    'Hard Press': {
        basePowerCallback: (attacker, defender) => {
            return Math.max(1, Math.floor(100 * defender.currHp / defender.maxHp));
        },
        description: '目标 HP 越高威力越高，最高100'
    },
    
    // ============================================
    // 【鬼火游行 Infernal Parade】目标有异常状态时威力翻倍
    // ============================================
    'Infernal Parade': {
        basePowerCallback: (attacker, defender) => {
            if (defender.status) {
                return 120;
            }
            return 60;
        },
        description: '目标有异常状态时威力翻倍 (120)'
    },
    
    // ============================================
    // 【连斩 Fury Cutter】连续使用威力翻倍 (40→80→160，上限160)
    // ============================================
    'Fury Cutter': {
        basePowerCallback: (attacker, defender, move, battle) => {
            let consecutive = 0;
            if (attacker.lastMoveUsed === 'Fury Cutter' && attacker.furyCutterCount) {
                consecutive = attacker.furyCutterCount;
            }
            const power = Math.min(160, 40 * Math.pow(2, consecutive));
            // 更新连续计数
            attacker.furyCutterCount = consecutive + 1;
            attacker.lastMoveUsed = 'Fury Cutter';
            return power;
        },
        description: '连续使用威力翻倍 (40→80→160)'
    },
    
    // ============================================
    // 【回声 Echoed Voice】连续使用威力递增 (40→80→120→160→200)
    // ============================================
    'Echoed Voice': {
        basePowerCallback: (attacker, defender, move, battle) => {
            let consecutive = 0;
            if (attacker.lastMoveUsed === 'Echoed Voice' && attacker.echoedVoiceCount) {
                consecutive = attacker.echoedVoiceCount;
            }
            const power = Math.min(200, 40 + 40 * consecutive);
            attacker.echoedVoiceCount = consecutive + 1;
            attacker.lastMoveUsed = 'Echoed Voice';
            return power;
        },
        description: '连续使用威力递增 (40→80→120→160→200)'
    },
    
    // ============================================
    // 【飞水手里剑 Water Shuriken】多段攻击
    // 小智版甲贺忍蛙: 威力20, 固定3次
    // 普通: 威力15, 2-5次
    // ============================================
    'Water Shuriken': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // Ash-Greninja / Battle Bond 形态: 威力20
            const pokeName = (attacker.name || '').toLowerCase();
            const abilityId = (attacker.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            if (pokeName.includes('ash') || abilityId === 'battlebond') {
                return 20;
            }
            return 15;
        },
        description: '多段攻击，小智甲贺忍蛙威力20且固定3次'
    },
    
    // ============================================
    // 【三旋击 Triple Axel】三段攻击，威力递增 (20→40→60)
    // 每段独立命中判定
    // ============================================
    'Triple Axel': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 通过 tripleHitCount 追踪当前是第几段
            const hitNum = (attacker._tripleAxelHit || 0) + 1;
            attacker._tripleAxelHit = hitNum;
            return 20 * hitNum; // 20, 40, 60
        },
        onUse: (attacker, defender, logs, battle, isPlayer) => {
            // 重置计数器
            attacker._tripleAxelHit = 0;
            return {};
        },
        description: '三段攻击，威力递增 (20→40→60)，每段独立判定'
    },
    
    // ============================================
    // 【三连踢 Triple Kick】三段攻击，威力递增 (10→20→30)
    // 每段独立命中判定
    // ============================================
    'Triple Kick': {
        basePowerCallback: (attacker, defender, move, battle) => {
            const hitNum = (attacker._tripleKickHit || 0) + 1;
            attacker._tripleKickHit = hitNum;
            return 10 * hitNum; // 10, 20, 30
        },
        onUse: (attacker, defender, logs, battle, isPlayer) => {
            attacker._tripleKickHit = 0;
            return {};
        },
        description: '三段攻击，威力递增 (10→20→30)，每段独立判定'
    },
    
    // ============================================
    // 【群殴 Beat Up】单打简化：威力 = 5 + (使用者基础攻击 / 10)
    // 原版每个队友各打一次，单打简化为一次攻击
    // ============================================
    'Beat Up': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 简化：基于使用者的基础攻击力
            const baseAtk = attacker.baseStats ? attacker.baseStats.atk : (attacker.atk || 80);
            return Math.floor(5 + baseAtk / 10);
        },
        description: '单打简化：威力基于使用者基础攻击'
    },
    
    // ============================================
    // 【轮唱 Round】单打中无组合效果，使用基础威力
    // ============================================
    'Round': {
        basePowerCallback: (attacker, defender, move, battle) => {
            return 60;
        },
        description: '单打中使用基础威力60'
    },
    
    // ============================================
    // 【誓约招式】单打中无组合效果，使用基础威力
    // ============================================
    'Fire Pledge': {
        basePowerCallback: (attacker, defender, move, battle) => {
            return 80;
        },
        description: '单打中使用基础威力80'
    },
    
    'Grass Pledge': {
        basePowerCallback: (attacker, defender, move, battle) => {
            return 80;
        },
        description: '单打中使用基础威力80'
    },
    
    'Water Pledge': {
        basePowerCallback: (attacker, defender, move, battle) => {
            return 80;
        },
        description: '单打中使用基础威力80'
    },
    
    // 【觉醒力量 Wake-Up Slap】目标睡眠时威力翻倍并唤醒
    'Wake-Up Slap': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (defender.status === 'slp') {
                return 140;
            }
            return 70;
        },
        onAfterHit: (attacker, defender, move, damage, logs) => {
            if (defender.status === 'slp' && damage > 0) {
                defender.status = null;
                defender.sleepTurns = 0;
                logs.push(`${defender.cnName} 被打醒了！`);
            }
        },
        description: '目标睡眠时威力翻倍并唤醒'
    },
    
    // 【光子喷涌】使用物攻和特攻中较高的一方计算伤害
    'Photon Geyser': {
        modifyAtk: (attacker, defender, isSpecial) => {
            const atkStat = attacker.getStat ? attacker.getStat('atk') : attacker.atk;
            const spaStat = attacker.getStat ? attacker.getStat('spa') : attacker.spa;
            // 使用较高的攻击能力
            const usedStat = Math.max(atkStat, spaStat);
            console.log(`[Photon Geyser] 物攻=${atkStat}, 特攻=${spaStat}, 使用=${usedStat}`);
            return usedStat;
        },
        description: '使用物攻和特攻中较高的一方计算伤害，无视目标特性'
    },
    
    // 【焚天灭世炽光爆】同样使用物攻和特攻中较高的一方
    'Light That Burns the Sky': {
        modifyAtk: (attacker, defender, isSpecial) => {
            const atkStat = attacker.getStat ? attacker.getStat('atk') : attacker.atk;
            const spaStat = attacker.getStat ? attacker.getStat('spa') : attacker.spa;
            const usedStat = Math.max(atkStat, spaStat);
            console.log(`[Light That Burns the Sky] 物攻=${atkStat}, 特攻=${spaStat}, 使用=${usedStat}`);
            return usedStat;
        },
        description: '使用物攻和特攻中较高的一方计算伤害，无视目标特性'
    },
    
    // ============================================
    // 3. 特殊攻防计算 (Modified Stat Moves)
    // ============================================
    
    'Foul Play': {
        modifyAtk: (attacker, defender, isSpecial) => {
            // 使用目标的攻击力
            return defender.getStat('atk');
        },
        description: '使用目标的攻击力计算伤害'
    },
    
    'Body Press': {
        modifyAtk: (attacker, defender, isSpecial) => {
            // 使用自己的防御力代替攻击力
            return attacker.getStat('def');
        },
        description: '使用自己的防御力计算伤害'
    },
    
    'Psyshock': {
        modifyDef: (attacker, defender, isSpecial) => {
            // 特殊攻击但打物防
            return defender.getStat('def');
        },
        description: '特殊攻击但计算物理防御'
    },
    
    'Psystrike': {
        modifyDef: (attacker, defender, isSpecial) => {
            return defender.getStat('def');
        },
        description: '特殊攻击但计算物理防御'
    },
    
    'Secret Sword': {
        modifyDef: (attacker, defender, isSpecial) => {
            return defender.getStat('def');
        },
        description: '特殊攻击但计算物理防御'
    },
    
    // ============================================
    // 4. 换人技能 (Pivot Moves) - 仅日志输出
    // ============================================
    
    'U-turn': {
        onHit: (attacker, defender, damage, logs) => {
            // 关键修复：只有造成伤害时才触发换人（免疫/未命中不触发）
            if (damage <= 0) {
                return { pivot: false };
            }
            // 日志移到 index.js 的换人逻辑中，避免误导
            return { pivot: true };
        },
        description: '攻击后可以换人（免疫时不触发）'
    },
    
    'Volt Switch': {
        onHit: (attacker, defender, damage, logs) => {
            // 关键修复：只有造成伤害时才触发换人（地面系免疫电系）
            if (damage <= 0) {
                return { pivot: false };
            }
            // 日志移到 index.js 的换人逻辑中，避免误导
            return { pivot: true };
        },
        description: '攻击后可以换人（免疫时不触发）'
    },
    
    'Flip Turn': {
        onHit: (attacker, defender, damage, logs) => {
            // 关键修复：只有造成伤害时才触发换人
            if (damage <= 0) {
                return { pivot: false };
            }
            // 日志移到 index.js 的换人逻辑中，避免误导
            return { pivot: true };
        },
        description: '攻击后可以换人（免疫时不触发）'
    },
    
    'Parting Shot': {
        onHit: (attacker, defender, damage, logs, battle, move) => {
            // Parting Shot: 降低对手攻击和特攻各1级，然后换人
            // 【Gen 8+】即使降能力被阻止（Clear Body等），仍然可以换人
            let statsDropped = false;
            
            // 检查对手是否有阻止降能力的特性
            const defAbId = (defender.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const blockAbilities = ['clearbody', 'whitesmoke', 'fullmetalbody'];
            
            if (blockAbilities.includes(defAbId)) {
                logs.push(`${defender.cnName} 的特性阻止了能力下降!`);
            } else {
                if (typeof defender.applyBoost === 'function') {
                    const atkChange = defender.applyBoost('atk', -1);
                    if (atkChange !== 0) {
                        logs.push(`→ ${defender.cnName} 的攻击下降了!`);
                        statsDropped = true;
                    }
                    const spaChange = defender.applyBoost('spa', -1);
                    if (spaChange !== 0) {
                        logs.push(`→ ${defender.cnName} 的特攻下降了!`);
                        statsDropped = true;
                    }
                } else {
                    if (defender.boosts) {
                        defender.boosts.atk = Math.max(-6, (defender.boosts.atk || 0) - 1);
                        defender.boosts.spa = Math.max(-6, (defender.boosts.spa || 0) - 1);
                        logs.push(`→ ${defender.cnName} 的攻击和特攻下降了!`);
                        statsDropped = true;
                    }
                }
                if (!statsDropped) {
                    logs.push(`${defender.cnName} 的能力已经无法再降低了!`);
                }
            }
            
            // 【修复】Magic Bounce 反弹时，只降能力不触发换人
            // _bounced 标记表示招式被魔法镜反弹，此时 attacker 是反弹者而非原使用者
            if (move && move._bounced) {
                console.log(`[PARTING SHOT] 被魔法镜反弹，不触发换人`);
                return { pivot: false };
            }
            
            logs.push(`${attacker.cnName} 留下狠话后撤退了!`);
            return { pivot: true };
        },
        description: '降低对手攻击和特攻各1级后换人'
    },
    
    'Fake Out': {
        onUse: (attacker, defender, logs) => {
            // 关键修复：Fake Out 只能在上场第一回合使用
            console.log(`[Fake Out] ${attacker.cnName} turnsOnField: ${attacker.turnsOnField}`);
            if (attacker.turnsOnField > 0) {
                logs.push(`但是失败了!`);
                return { failed: true };
            }
            return {};
        },
        // 【修复】移除 onHit 钩子，畏缩效果由 battle-effects.js 的 secondary 处理统一处理
        // 避免重复输出"畏缩了!"日志
        description: '先制技，仅在上场第一回合有效，100%畏缩'
    },
    
    'First Impression': {
        onUse: (attacker, defender, logs) => {
            // First Impression 只能在上场第一回合使用
            console.log(`[First Impression] ${attacker.cnName} turnsOnField: ${attacker.turnsOnField}`);
            if (attacker.turnsOnField > 0) {
                logs.push(`但是失败了!`);
                return { failed: true };
            }
            return {};
        },
        description: '虫系先制大招，仅在上场第一回合有效'
    },
    
    'Mat Block': {
        onUse: (attacker, defender, logs) => {
            // Mat Block 只能在上场第一回合使用
            console.log(`[Mat Block] ${attacker.cnName} turnsOnField: ${attacker.turnsOnField}`);
            if (attacker.turnsOnField > 0) {
                logs.push(`但是失败了!`);
                return { failed: true };
            }
            logs.push(`${attacker.cnName} 掀起了榻榻米进行防御!`);
            if (attacker.volatile) attacker.volatile.protect = true;
            return {};
        },
        description: '仅在上场第一回合有效，防御物理和特殊攻击'
    },
    
    // ============================================
    // 守住类技能 (Protect Family) - 连续使用惩罚
    // ============================================
    
    'Protect': {
        onUse: (attacker, defender, logs) => {
            // 连续使用成功率衰减：1 -> 1/3 -> 1/9 -> ...
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了! (连续使用守住成功率降低)`);
                    return { failed: true };
                }
            }
            // 成功使用
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 守住了自己!`);
            if (attacker.volatile) attacker.volatile.protect = true;
            return {};
        },
        description: '守住所有攻击，连续使用成功率降低'
    },
    
    'Detect': {
        onUse: (attacker, defender, logs) => {
            // 与 Protect 共享计数器
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了! (连续使用见切成功率降低)`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 使用了见切!`);
            if (attacker.volatile) attacker.volatile.protect = true;
            return {};
        },
        description: '与守住效果相同，共享连续使用计数器'
    },
    
    'King\'s Shield': {
        onUse: (attacker, defender, logs) => {
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 使用了王者盾牌!`);
            if (attacker.volatile) {
                attacker.volatile.protect = true;
                attacker.volatile.kingsShield = true; // 接触攻击降攻
            }
            return {};
        },
        description: '守住并降低接触攻击者的攻击'
    },
    
    'Spiky Shield': {
        onUse: (attacker, defender, logs) => {
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 使用了尖刺防守!`);
            if (attacker.volatile) {
                attacker.volatile.protect = true;
                attacker.volatile.spikyShield = true; // 接触攻击反伤
            }
            return {};
        },
        description: '守住并对接触攻击者造成伤害'
    },
    
    'Baneful Bunker': {
        onUse: (attacker, defender, logs) => {
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 躲进了碉堡!`);
            if (attacker.volatile) {
                attacker.volatile.protect = true;
                attacker.volatile.banefulBunker = true; // 接触攻击中毒
            }
            return {};
        },
        description: '守住并使接触攻击者中毒'
    },
    
    'Obstruct': {
        onUse: (attacker, defender, logs) => {
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 使用了拦堵!`);
            if (attacker.volatile) {
                attacker.volatile.protect = true;
                attacker.volatile.obstruct = true; // 接触攻击降防
            }
            return {};
        },
        description: '守住并降低接触攻击者的防御'
    },
    
    'Silk Trap': {
        onUse: (attacker, defender, logs) => {
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 使用了线阱!`);
            if (attacker.volatile) {
                attacker.volatile.protect = true;
                attacker.volatile.silkTrap = true; // 接触攻击降速
            }
            return {};
        },
        description: '守住并降低接触攻击者的速度'
    },
    
    'Endure': {
        onUse: (attacker, defender, logs) => {
            // 挺住：与守住共享计数器
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了!`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 摆出了挺住的架势!`);
            if (attacker.volatile) attacker.volatile.endure = true;
            return {};
        },
        description: '本回合至少保留1HP，与守住共享计数器'
    },
    
    'Max Guard': {
        onUse: (attacker, defender, logs) => {
            // 与守住共享计数器
            const counter = attacker.protectCounter || 0;
            if (counter > 0) {
                const successChance = Math.pow(1/3, counter);
                if (Math.random() > successChance) {
                    logs.push(`但是失败了! (连续使用成功率降低)`);
                    return { failed: true };
                }
            }
            attacker.protectCounter = counter + 1;
            logs.push(`${attacker.cnName} 守住了自己!`);
            if (attacker.volatile) attacker.volatile.protect = true;
            return {};
        },
        description: '极巨化时的守住，与普通守住共享计数器'
    },
    
    // ============================================
    // 僵直类技能 (Recharge Moves)
    // ============================================
    
    'Hyper Beam': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '强力攻击，命中后下回合无法行动'
    },
    
    'Giga Impact': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '强力物理攻击，命中后下回合无法行动'
    },
    
    'Frenzy Plant': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '草系究极技，命中后下回合无法行动'
    },
    
    'Blast Burn': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '火系究极技，命中后下回合无法行动'
    },
    
    'Hydro Cannon': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '水系究极技，命中后下回合无法行动'
    },
    
    'Prismatic Laser': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '超能力系大招，命中后下回合无法行动'
    },
    
    'Meteor Assault': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '格斗系大招，命中后下回合无法行动'
    },
    
    'Eternabeam': {
        onUse: (attacker, defender, logs) => {
            if (attacker.mustRecharge) {
                logs.push(`${attacker.cnName} 因为上回合的反作用力无法动弹!`);
                attacker.mustRecharge = false;
                return { failed: true };
            }
            return {};
        },
        onHit: (attacker, defender, damage, logs) => {
            if (damage > 0) {
                attacker.mustRecharge = true;
                logs.push(`${attacker.cnName} 下回合需要休息!`);
            }
            return {};
        },
        description: '龙系究极技，命中后下回合无法行动'
    },
    
    'Baton Pass': {
        onUse: (attacker, defender, logs) => {
            logs.push(`${attacker.cnName} 使用了接力棒!`);
            return { pivot: true, passBoosts: true };
        },
        description: '换人并传递能力变化'
    },
    
    'Teleport': {
        onUse: (attacker, defender, logs) => {
            logs.push(`${attacker.cnName} 使用瞬间移动撤退了!`);
            return { pivot: true };
        },
        description: '撤退换人'
    },
    
    // ============================================
    // 5. 强制换人技能 (Phazing Moves)
    // ============================================
    
    'Roar': {
        onHit: (attacker, defender, damage, logs) => {
            logs.push(`${defender.cnName} 被吓跑了!`);
            return { phaze: true };
        },
        description: '强制对手换人'
    },
    
    'Whirlwind': {
        onHit: (attacker, defender, damage, logs) => {
            logs.push(`${defender.cnName} 被吹走了!`);
            return { phaze: true };
        },
        description: '强制对手换人'
    },
    
    'Dragon Tail': {
        onHit: (attacker, defender, damage, logs) => {
            logs.push(`${defender.cnName} 被甩飞了!`);
            return { phaze: true };
        },
        description: '造成伤害并强制换人'
    },
    
    'Circle Throw': {
        onHit: (attacker, defender, damage, logs) => {
            logs.push(`${defender.cnName} 被摔出去了!`);
            return { phaze: true };
        },
        description: '造成伤害并强制换人'
    },
    
    // ============================================
    // 6. 天气技能 (Weather Moves)
    // ============================================
    
    // 【始源天气】不可被普通天气技能覆盖
    // Delta Stream (德尔塔气流), Desolate Land (终结之地), Primordial Sea (始源之海)
    
    'Rain Dance': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle && typeof window !== 'undefined' && window.WeatherEffects?.tryDeployWeather) {
                const result = window.WeatherEffects.tryDeployWeather(battle, 'rain', {
                    itemId: attacker.item,
                    weatherName: '雨天',
                    visualKey: 'rain'
                });
                result.logs.forEach(l => logs.push(l));
                if (!result.success) return { failed: true };
            } else if (battle) {
                if (battle.weather === 'rain') return { failed: true };
                battle.weather = 'rain';
                battle.weatherTurns = 5;
            }
            logs.push('天空下起了大雨!');
            logs.push('<span style="color:#3498db">水系技能威力提升，火系技能威力下降!</span>');
            return { weather: 'rain' };
        },
        description: '召唤雨天'
    },
    
    'Sunny Day': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle && typeof window !== 'undefined' && window.WeatherEffects?.tryDeployWeather) {
                const result = window.WeatherEffects.tryDeployWeather(battle, 'sun', {
                    itemId: attacker.item,
                    weatherName: '晴天',
                    visualKey: 'sun'
                });
                result.logs.forEach(l => logs.push(l));
                if (!result.success) return { failed: true };
            } else if (battle) {
                if (battle.weather === 'sun') return { failed: true };
                battle.weather = 'sun';
                battle.weatherTurns = 5;
            }
            logs.push('阳光变得强烈了!');
            logs.push('<span style="color:#e67e22">火系技能威力提升，水系技能威力下降!</span>');
            return { weather: 'sun' };
        },
        description: '召唤晴天'
    },
    
    'Sandstorm': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle && typeof window !== 'undefined' && window.WeatherEffects?.tryDeployWeather) {
                const result = window.WeatherEffects.tryDeployWeather(battle, 'sandstorm', {
                    itemId: attacker.item,
                    weatherName: '沙暴',
                    visualKey: 'sand'
                });
                result.logs.forEach(l => logs.push(l));
                if (!result.success) return { failed: true };
            } else if (battle) {
                if (battle.weather === 'sandstorm') return { failed: true };
                battle.weather = 'sandstorm';
                battle.weatherTurns = 5;
            }
            logs.push('沙暴刮起来了!');
            logs.push('<span style="color:#d4ac0d">岩石系特防提升，非岩/地/钢系每回合受伤!</span>');
            return { weather: 'sandstorm' };
        },
        description: '召唤沙暴'
    },
    
    'Hail': {
        onUse: (attacker, defender, logs, battle) => {
            if (battle && typeof window !== 'undefined' && window.WeatherEffects?.tryDeployWeather) {
                const result = window.WeatherEffects.tryDeployWeather(battle, 'hail', {
                    itemId: attacker.item,
                    weatherName: '冰雹',
                    visualKey: 'hail'
                });
                result.logs.forEach(l => logs.push(l));
                if (!result.success) return { failed: true };
            } else if (battle) {
                if (battle.weather === 'hail') return { failed: true };
                battle.weather = 'hail';
                battle.weatherTurns = 5;
            }
            logs.push('开始下冰雹了!');
            logs.push('<span style="color:#5dade2">非冰系每回合受伤!</span>');
            return { weather: 'hail' };
        },
        description: '召唤冰雹'
    },
    
    'Snowscape': {
        onUse: (attacker, defender, logs, battle) => {
            // 【修复】始源天气不可被覆盖
            if (battle && ['deltastream', 'harshsun', 'heavyrain'].includes(battle.weather)) {
                logs.push('<span style="color:#e74c3c">但是神秘的气流极其强劲，天气无法改变！</span>');
                console.log('[WEATHER] Snowscape failed: primal weather active');
                return { failed: true };
            }
            // 【修复】如果已经是雪天，技能失败
            if (battle && battle.weather === 'snow') {
                logs.push('<span style="color:#e74c3c">但是失败了！</span>');
                console.log('[WEATHER] Snowscape failed: already snowing');
                return { failed: true };
            }
            if (battle && typeof window !== 'undefined' && window.WeatherEffects?.tryDeployWeather) {
                const result = window.WeatherEffects.tryDeployWeather(battle, 'snow', {
                    itemId: attacker.item,
                    weatherName: '雪天',
                    visualKey: 'snow'
                });
                result.logs.forEach(l => logs.push(l));
                if (!result.success) return { failed: true };
            } else if (battle) {
                battle.weather = 'snow';
                battle.weatherTurns = 5;
            }
            logs.push('下起了雪!');
            logs.push('<span style="color:#85c1e9">冰系防御提升!</span>');
            return { weather: 'snow' };
        },
        description: '召唤雪天'
    },
    
    // ============================================
    // 6.5 环境动态技能 (Environment-Based Moves)
    // ============================================
    
    // 【天气球 Weather Ball】天气队核心补盲技能
    // 根据天气改变属性和威力
    'Weather Ball': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 有天气时威力翻倍
            if (battle && battle.weather && battle.weather !== 'none') {
                console.log(`[Weather Ball] 天气 ${battle.weather}，威力翻倍！100`);
                return 100;
            }
            return 50;
        },
        onModifyType: (move, attacker, battle) => {
            if (!battle || !battle.weather || battle.weather === 'none') return 'Normal';
            
            // 优先使用 WeatherEffects 的配置
            if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.getWeatherBallType) {
                const wbData = window.WeatherEffects.getWeatherBallType(battle.weather);
                if (wbData && wbData.type !== 'Normal') {
                    console.log(`[Weather Ball] 天气 ${battle.weather} -> 属性 ${wbData.type}`);
                    return wbData.type;
                }
            }
            
            // 回退到硬编码逻辑
            switch (battle.weather) {
                case 'sun':
                case 'harshsun':
                    return 'Fire';
                case 'rain':
                case 'heavyrain':
                    return 'Water';
                case 'sandstorm':
                case 'ashfall':  // 火山灰 -> 岩石
                    return 'Rock';
                case 'hail':
                case 'snow':
                    return 'Ice';
                case 'fog':      // 暗影迷雾 -> 幽灵
                    return 'Ghost';
                case 'smog':     // 烟霾 -> 毒
                    return 'Poison';
                case 'gale':     // 香风 -> 草
                    return 'Grass';
                default:
                    return 'Normal';
            }
        },
        description: '根据天气改变属性和威力'
    },
    
    // 【广域战力 Expanding Force】精神场地核心技能
    // 精神场地下威力提升，且变为全体攻击
    'Expanding Force': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (battle && battle.terrain === 'psychicterrain') {
                console.log(`[Expanding Force] 精神场地，威力提升！120`);
                return 120; // 80 * 1.5
            }
            return 80;
        },
        description: '精神场地下威力x1.5'
    },
    
    // 【冲浪 Rising Voltage】电气场地下威力翻倍
    'Rising Voltage': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (battle && battle.terrain === 'electricterrain') {
                console.log(`[Rising Voltage] 电气场地，威力翻倍！140`);
                return 140;
            }
            return 70;
        },
        description: '电气场地下威力翻倍'
    },
    
    // 【青草滑梯 Grassy Glide】青草场地下先制
    'Grassy Glide': {
        priority: 0, // 默认优先度
        onModifyPriority: (priority, user, target, move, battle) => {
            if (battle && battle.terrain === 'grassyterrain') {
                console.log(`[Grassy Glide] 青草场地，先制+1！`);
                return 1;
            }
            return priority;
        },
        description: '青草场地下先制'
    },
    
    // 【薄雾爆发 Misty Explosion】薄雾场地下威力x1.5
    'Misty Explosion': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (battle && battle.terrain === 'mistyterrain') {
                console.log(`[Misty Explosion] 薄雾场地，威力x1.5！150`);
                return 150;
            }
            return 100;
        },
        onUse: (attacker, defender, logs, battle) => {
            // 使用者倒下
            attacker.currHp = 0;
            logs.push(`${attacker.cnName} 引发了薄雾爆发！`);
            return { selfDestruct: true };
        },
        description: '薄雾场地下威力x1.5，使用者倒下'
    },
    
    // 【大地之力 Terrain Pulse】根据场地改变属性
    'Terrain Pulse': {
        basePowerCallback: (attacker, defender, move, battle) => {
            if (battle && battle.terrain && battle.terrain !== 'none') {
                return 100; // 威力翻倍
            }
            return 50;
        },
        onModifyType: (move, attacker, battle) => {
            if (!battle || !battle.terrain || battle.terrain === 'none') return 'Normal';
            
            switch (battle.terrain) {
                case 'electricterrain':
                    return 'Electric';
                case 'grassyterrain':
                    return 'Grass';
                case 'mistyterrain':
                    return 'Fairy';
                case 'psychicterrain':
                    return 'Psychic';
                default:
                    return 'Normal';
            }
        },
        description: '根据场地改变属性和威力'
    },
    
    // ============================================
    // 【已移除】Stealth Rock / Spikes / Toxic Spikes / Sticky Web
    // 全部由 MoveEffects.applySideCondition 统一处理（通过 moves-data.js 的 sideCondition 字段）
    // 旧的 onUse handler 写入 battle.hazards（错误路径），applySideCondition 写入 battle.playerSide/enemySide（正确路径）
    // 双路径导致：1) 成功+失败双消息 2) 数据写入不一致
    
    // ============================================
    // 【BUG修复】Stone Axe (岩斧) - 攻击技 + 设置隐形岩
    // PS data 的 onAfterHit 被 null 化，需要手动实现
    // ============================================
    'Stone Axe': {
        onHit: (attacker, defender, damage, logs, battle) => {
            if (!battle || damage <= 0) return {};
            const targetSide = (attacker === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide) return {};
            if (!targetSide.stealthRock) {
                targetSide.stealthRock = true;
                logs.push(`<span style="color:#a8a29e">🪨 尖锐的岩石漂浮在对手场地周围！</span>`);
            }
            return {};
        },
        description: '造成伤害并在对方场地设置隐形岩'
    },
    
    // ============================================
    // 【BUG修复】Ceaseless Edge (秘剑・千重涛) - 攻击技 + 设置撒菱
    // PS data 的 onAfterHit 被 null 化，需要手动实现
    // ============================================
    'Ceaseless Edge': {
        onHit: (attacker, defender, damage, logs, battle) => {
            if (!battle || damage <= 0) return {};
            const targetSide = (attacker === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide) return {};
            const currentLayers = targetSide.spikes || 0;
            if (currentLayers < 3) {
                targetSide.spikes = currentLayers + 1;
                logs.push(`<span style="color:#a8a29e">🔺 尖刺散布在对手场地！(撒菱 ${currentLayers + 1} 层)</span>`);
            }
            return {};
        },
        description: '造成伤害并在对方场地设置撒菱'
    },
    
    // Rapid Spin, Defog 已在后面定义（完整版本，支持 side 和速度+1）
    
    // ============================================
    // 8. 蓄力技能 (Two-Turn Moves) - 完整两回合实现
    // ============================================
    // 蓄力逻辑由 engine/charge-moves.js 统一处理
    // 此处的 onUse 钩子用于检测蓄力状态并返回相应结果
    
    'Solar Beam': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Solar Beam', battle, logs);
        },
        description: '晴天下无需蓄力，其他天气需要1回合蓄力'
    },
    
    'Solar Blade': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Solar Blade', battle, logs);
        },
        description: '晴天下无需蓄力，其他天气需要1回合蓄力'
    },
    
    'Electro Shot': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Electro Shot', battle, logs);
        },
        description: '雨天下无需蓄力，蓄力时特攻+1'
    },
    
    'Meteor Beam': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Meteor Beam', battle, logs);
        },
        description: '蓄力时特攻+1'
    },
    
    // Hyper Beam, Giga Impact 已在第820行附近定义（完整版本）
    
    // ============================================
    // 8.5 半无敌状态技能 (Semi-Invulnerable Moves)
    // ============================================
    // 完整的两回合逻辑，蓄力期间进入半无敌状态
    
    // 【潜灵奇袭 Phantom Force】多龙巴鲁托核心技能
    // 穿透守住，拖极巨化回合
    'Phantom Force': {
        isChargeMove: true,
        breaksProtect: true, // 穿透守住
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Phantom Force', battle, logs);
        },
        description: '穿透守住，蓄力期间半无敌'
    },
    
    // 【暗影潜袭 Shadow Force】骑拉帝纳专属
    'Shadow Force': {
        isChargeMove: true,
        breaksProtect: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Shadow Force', battle, logs);
        },
        description: '穿透守住，蓄力期间半无敌'
    },
    
    // 【飞翔 Fly】
    'Fly': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Fly', battle, logs);
        },
        description: '飞上高空后攻击，蓄力期间半无敌'
    },
    
    // 【挖洞 Dig】
    'Dig': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Dig', battle, logs);
        },
        description: '钻入地下后攻击，蓄力期间半无敌'
    },
    
    // 【潜水 Dive】
    'Dive': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Dive', battle, logs);
        },
        description: '潜入水中后攻击，蓄力期间半无敌'
    },
    
    // 【弹跳 Bounce】
    'Bounce': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Bounce', battle, logs);
        },
        secondary: { chance: 30, status: 'par' },
        description: '跳到高空后攻击，30%麻痹'
    },
    
    // 【天空落下 Sky Drop】
    'Sky Drop': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Sky Drop', battle, logs);
        },
        description: '抓住对手飞上高空后摔落，蓄力期间双方半无敌'
    },
    
    // 【火箭头锤 Skull Bash】蓄力时提升防御
    'Skull Bash': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Skull Bash', battle, logs);
        },
        description: '缩头蓄力提升防御后猛烈撞击'
    },
    
    // 【神鸟攻击 Sky Attack】高暴击率
    'Sky Attack': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Sky Attack', battle, logs);
        },
        description: '蓄力后发动神鸟攻击，高暴击率'
    },
    
    // 【真空斩 Razor Wind】高暴击率
    'Razor Wind': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Razor Wind', battle, logs);
        },
        description: '卷起狂风后释放真空斩，高暴击率'
    },
    
    // 【冰冻伏特 Freeze Shock】酋雷姆-黑专属
    'Freeze Shock': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Freeze Shock', battle, logs);
        },
        description: '被冰冷电流包围后释放'
    },
    
    // 【极寒冷焰 Ice Burn】酋雷姆-白专属
    'Ice Burn': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Ice Burn', battle, logs);
        },
        description: '被极寒火焰包围后释放'
    },
    
    // 【大地掌控 Geomancy】哲尔尼亚斯专属变化技
    'Geomancy': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Geomancy', battle, logs);
        },
        description: '吸收大地力量后大幅提升特攻特防速度'
    },
    
    // 【鸟嘴加农炮 Beak Blast】铳嘴大鸟专属
    'Beak Blast': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Beak Blast', battle, logs);
        },
        description: '加热鸟嘴后发射，蓄力期间被接触会烧伤对手'
    },
    
    // 【真气拳 Focus Punch】被攻击会中断
    'Focus Punch': {
        isChargeMove: true,
        onUse: (attacker, defender, logs, battle) => {
            return handleChargeMoveOnUse(attacker, 'Focus Punch', battle, logs);
        },
        description: '集中精神后发出强力拳击，被攻击会中断'
    },
    
    // ============================================
    // 8.6 延迟伤害技能 (Future Moves)
    // ============================================
    // 注意：完整的延迟伤害需要引擎支持 futureMove 队列
    // 这里简化为立即造成伤害，但保留无视免疫等关键属性
    
    // 【预知未来 Future Sight】再生力受队核心
    'Future Sight': {
        ignoreImmunity: true, // 无视一般免疫（恶系仍可被命中）
        onUse: (attacker, defender, logs, battle) => {
            logs.push(`${attacker.cnName} 预见了未来！`);
            // 简化：立即造成伤害而非延迟
            // 完整实现需要 battle.futureMove 队列
            return {};
        },
        description: '预见未来的攻击（简化为立即伤害）'
    },
    
    // 【破灭之愿 Doom Desire】基拉祈专属
    'Doom Desire': {
        ignoreImmunity: true,
        onUse: (attacker, defender, logs, battle) => {
            logs.push(`${attacker.cnName} 许下了破灭之愿！`);
            return {};
        },
        description: '许下破灭之愿（简化为立即伤害）'
    },
    
    // ============================================
    // 9. 其他特殊技能
    // ============================================
    
    'Explosion': {
        onUse: (attacker, defender, logs, battle) => {
            // 【Damp 湿气】检查场上是否有湿气特性
            const hasDamp = [attacker, defender].some(p => {
                if (!p || !p.ability) return false;
                const handler = typeof AbilityHandlers !== 'undefined' ? AbilityHandlers[p.ability] : null;
                return handler && handler.preventExplosion;
            });
            if (hasDamp) {
                logs.push(`<b style="color:#3498db">💧 湿气阻止了爆炸！</b>`);
                return { failed: true };
            }
            
            logs.push(`${attacker.cnName} 引爆了自己!`);
            // 自爆：使用者倒下
            attacker.currHp = 0;
            return { selfDestruct: true };
        },
        description: '使用者倒下'
    },
    
    'Self-Destruct': {
        onUse: (attacker, defender, logs, battle) => {
            // 【Damp 湿气】检查场上是否有湿气特性
            const hasDamp = [attacker, defender].some(p => {
                if (!p || !p.ability) return false;
                const handler = typeof AbilityHandlers !== 'undefined' ? AbilityHandlers[p.ability] : null;
                return handler && handler.preventExplosion;
            });
            if (hasDamp) {
                logs.push(`<b style="color:#3498db">💧 湿气阻止了自爆！</b>`);
                return { failed: true };
            }
            
            logs.push(`${attacker.cnName} 自爆了!`);
            attacker.currHp = 0;
            return { selfDestruct: true };
        },
        description: '使用者倒下'
    },
    
    // Final Gambit 已在第3001行定义（完整版本）
    
    'Endeavor': {
        damageCallback: (attacker, defender) => {
            // 将目标 HP 降到与自己相同
            if (defender.currHp > attacker.currHp) {
                return defender.currHp - attacker.currHp;
            }
            return 0;
        },
        description: '将目标 HP 降到与自己相同'
    },
    
    'Pain Split': {
        onUse: (attacker, defender, logs) => {
            const avgHp = Math.floor((attacker.currHp + defender.currHp) / 2);
            attacker.currHp = Math.min(avgHp, attacker.maxHp);
            defender.currHp = Math.min(avgHp, defender.maxHp);
            logs.push(`${attacker.cnName} 和 ${defender.cnName} 平分了痛苦!`);
            return { hpShared: true };
        },
        description: '平分双方 HP'
    },
    
    // Destiny Bond, Perish Song, Metronome 已移至第2876行附近的完整实现
    
    // ============================================
    // 10. 属性变化类技能 (Type Changing Moves)
    // ============================================
    
    // 【纹理】：变成自己第一招的属性
    'Conversion': {
        onUse: (attacker, defender, logs) => {
            // 获取第一招
            const firstMove = attacker.moves[0];
            if (!firstMove) return;

            const targetType = firstMove.type;
            
            // 检查是否已经是该属性（如果是，则招式失败）
            // 注意：attacker.types 是数组，比如 ['Normal', 'Flying']
            if (attacker.types.length === 1 && attacker.types[0] === targetType) {
                logs.push(`但是在 ${targetType} 属性下无法再变化了!`);
                return;
            }

            // 修改属性
            attacker.types = [targetType];
            logs.push(`${attacker.cnName} 的纹理变得和 ${firstMove.name} 一样了!`);
            logs.push(`<span style="color:#a855f7">✦ 变成了 ${targetType} 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '将自身属性变为第一招式的属性'
    },

    // 【镜面属性】：复制对手的属性
    'Reflect Type': {
        onUse: (attacker, defender, logs) => {
            if (!defender.types || defender.types.length === 0) return;

            // 复制属性数组（使用扩展运算符 ... 防止引用传递）
            attacker.types = [...defender.types];
            
            const typeStr = attacker.types.join('/');
            logs.push(`${attacker.cnName} 复制了对手的属性!`);
            logs.push(`<span style="color:#a855f7">✦ 变成了 ${typeStr} 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '将自身属性变为和目标相同'
    },

    // 【浸水】：把对手变成纯水系
    'Soak': {
        onHit: (attacker, defender, damage, logs) => {
            // 无法对替身生效（简化处理忽略替身），无法对阿尔宙斯/银伴战兽生效
            if (defender.ability === 'Multitype' || defender.ability === 'RKS System') {
                logs.push(`但是失败了!`);
                return;
            }
            // 已经是纯水系则失败
            if (defender.types && defender.types.length === 1 && defender.types[0] === 'Water') {
                logs.push(`但是失败了!`);
                return;
            }

            defender.types = ['Water'];
            logs.push(`${attacker.cnName} 向对手喷射了特殊的水!`);
            logs.push(`<span style="color:#3498db">✦ ${defender.cnName} 变成了 水 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '将目标变为水属性'
    },
    
    // 【魔法粉】：把对手变成纯超能力系
    'Magic Powder': {
        onHit: (attacker, defender, damage, logs) => {
            if (defender.ability === 'Multitype' || defender.ability === 'RKS System') {
                logs.push(`但是失败了!`);
                return;
            }
            // 已经是纯超能力系则失败
            if (defender.types && defender.types.length === 1 && defender.types[0] === 'Psychic') {
                logs.push(`但是失败了!`);
                return;
            }
            // 草系免疫粉末类招式
            if (defender.types && defender.types.includes('Grass')) {
                logs.push(`但是失败了! (草系免疫粉末)`);
                return;
            }
            if (defender.ability === 'Overcoat') {
                logs.push(`${defender.cnName} 的防尘特性使其免疫了粉末!`);
                return;
            }

            defender.types = ['Psychic'];
            logs.push(`${attacker.cnName} 撒下了魔法粉!`);
            logs.push(`<span style="color:#a855f7">✦ ${defender.cnName} 变成了 超能力 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '将目标变为超能力属性'
    },
    
    // 【万圣夜】：给对手追加幽灵属性
    'Trick-or-Treat': {
        onHit: (attacker, defender, damage, logs) => {
            // 已经有幽灵属性则失败
            if (defender.types && defender.types.includes('Ghost')) {
                logs.push(`但是失败了!`);
                return;
            }

            defender.types = [...(defender.types || ['Normal']), 'Ghost'];
            logs.push(`${attacker.cnName} 邀请对手参加万圣夜派对!`);
            logs.push(`<span style="color:#9b59b6">✦ ${defender.cnName} 追加了 幽灵 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '给目标追加幽灵属性'
    },
    
    // 【森林诅咒】：给对手追加草属性
    "Forest's Curse": {
        onHit: (attacker, defender, damage, logs) => {
            // 已经有草属性则失败
            if (defender.types && defender.types.includes('Grass')) {
                logs.push(`但是失败了!`);
                return;
            }

            defender.types = [...(defender.types || ['Normal']), 'Grass'];
            logs.push(`${attacker.cnName} 施加了森林的诅咒!`);
            logs.push(`<span style="color:#27ae60">✦ ${defender.cnName} 追加了 草 属性!</span>`);
            
            return { typeChange: true };
        },
        description: '给目标追加草属性'
    },
    
    // 【燃尽】：强力火系攻击，使用后失去火属性
    'Burn Up': {
        onHit: (attacker, defender, damage, logs) => {
            // 不是火系则失败（伤害仍然造成，但不会失去属性）
            if (!attacker.types || !attacker.types.includes('Fire')) {
                logs.push(`但是 ${attacker.cnName} 不是火属性，无法燃尽!`);
                return { failed: true };
            }

            // 移除火属性
            attacker.types = attacker.types.filter(t => t !== 'Fire');
            if (attacker.types.length === 0) {
                attacker.types = ['Normal']; // 变成无属性（游戏中显示为???，这里简化为Normal）
            }
            logs.push(`<span style="color:#e74c3c">🔥 ${attacker.cnName} 燃烧殆尽，失去了火属性!</span>`);
            
            return { typeChange: true, lostType: 'Fire' };
        },
        description: '强力火系攻击，使用后失去火属性'
    },
    
    // 【电光双击】：强力电系攻击，使用后失去电属性
    'Double Shock': {
        onHit: (attacker, defender, damage, logs) => {
            // 不是电系则失败
            if (!attacker.types || !attacker.types.includes('Electric')) {
                logs.push(`但是 ${attacker.cnName} 不是电属性，无法释放电光双击!`);
                return { failed: true };
            }

            // 移除电属性
            attacker.types = attacker.types.filter(t => t !== 'Electric');
            if (attacker.types.length === 0) {
                attacker.types = ['Normal'];
            }
            logs.push(`<span style="color:#f1c40f">⚡ ${attacker.cnName} 释放了全部电力，失去了电属性!</span>`);
            
            return { typeChange: true, lostType: 'Electric' };
        },
        description: '强力电系攻击，使用后失去电属性'
    },

    // ============================================
    // 11. 究极技能：变身 (Transform)
    // ============================================
    'Transform': {
        onUse: (attacker, defender, logs) => {
            if (attacker.isTransformed) {
                logs.push(`但是 ${attacker.cnName} 已经变身过了!`);
                return { failed: true };
            }
            
            // 【BUG修复】对方已变身时，变身失败（百变怪对百变怪）
            if (defender.isTransformed) {
                logs.push(`但是失败了！（对方已经处于变身状态）`);
                return { failed: true };
            }
            
            // 【BUG修复】穿透 Illusion 幻觉：复制本体数据而非伪装数据
            // Illusion 只改变 displayName/displayCnName，实际 types/stats/moves 仍是本体
            // 但如果 defender.illusionActive 为 true，需要先破解幻觉
            if (defender.illusionActive) {
                defender.illusionActive = false;
                const fakeName = defender.illusionTarget?.cnName || '???';
                defender.displayName = null;
                defender.displayCnName = null;
                defender.displaySpriteUrl = null;
                defender.displaySpriteId = null;
                defender.illusionTarget = null;
                logs.push(`<b style="color:#8b5cf6">👻 幻觉破解！${fakeName} 的真身是 ${defender.cnName}！</b>`);
                if (typeof window !== 'undefined' && typeof window.updateBattleSprites === 'function') {
                    window.updateBattleSprites();
                }
            }

            // 1. 复制属性
            attacker.types = [...defender.types];
            
            // 2. 复制能力值 (除HP外)
            // 注意：这里我们直接覆盖 current stats。
            // 正规逻辑应该复制 baseStats 然后重新计算，但为了简化 RP 效果，直接复制数值即可。
            attacker.atk = defender.atk;
            attacker.def = defender.def;
            attacker.spa = defender.spa;
            attacker.spd = defender.spd;
            attacker.spe = defender.spe;
            
            // 复制能力等级 (Boosts)
            attacker.boosts = { ...defender.boosts };

            // 3. 复制技能 (简化：直接引用对象的技能数组，原本应该只有5PP，这里简化为无限)
            // 必须深拷贝技能数组，否则一方消耗PP会影响另一方（虽然目前没做PP系统）
            attacker.moves = defender.moves.map(m => ({...m}));

            // 4. 复制特性
            attacker.ability = defender.ability;

            // 5. 标记变身状态 (防止套娃)
            attacker.isTransformed = true;
            attacker.dittoOriginalName = attacker.cnName; // 记住原名
            attacker.cnName = defender.cnName; // 改名

            logs.push(`${attacker.dittoOriginalName} 变身成了 ${defender.cnName}!`);
            
            // 尝试更新图片为对手的图片 (这是一个高级视觉效果)
            // 注意：这需要前端 index.js 支持，通过 id 查找 DOM 更新 src
            if (typeof document !== 'undefined') {
                const playerSprite = document.getElementById('player-sprite');
                const enemySprite = document.getElementById('enemy-sprite');
                // 简单的图片交换逻辑（仅视觉）
                if (playerSprite && enemySprite) {
                    // 如果我是玩家，我变身成敌人
                    // 这种简单的 src 复制在 Showdown 图库下是有效的（正反面可能不一致，但能看）
                    // 更好的做法是去获取对手的正反面 ID
                    /* 这里不做复杂 DOM 操作，以免报错，仅文字提示 */
                }
            }

            return { transform: true };
        },
        description: '变身成对手的样子'
    },
    
    // ============================================
    // 回复技能 (Recovery Moves)
    // ============================================
    
    'Recover': {
        onHit: (attacker, defender, damage, logs) => {
            const baseHeal = Math.floor(attacker.maxHp / 2);
            const actualHeal = applyHeal(attacker, baseHeal);
            if (actualHeal > 0) {
                logs.push(`${attacker.cnName} 恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复最大HP的50%'
    },
    
    'Soft-Boiled': {
        onHit: (attacker, defender, damage, logs) => {
            const baseHeal = Math.floor(attacker.maxHp / 2);
            const actualHeal = applyHeal(attacker, baseHeal);
            if (actualHeal > 0) {
                logs.push(`${attacker.cnName} 恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复最大HP的50%'
    },
    
    'Slack Off': {
        onHit: (attacker, defender, damage, logs) => {
            const baseHeal = Math.floor(attacker.maxHp / 2);
            const actualHeal = applyHeal(attacker, baseHeal);
            if (actualHeal > 0) {
                logs.push(`${attacker.cnName} 偷懒恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复最大HP的50%'
    },
    
    'Roost': {
        onHit: (attacker, defender, damage, logs) => {
            const baseHeal = Math.floor(attacker.maxHp / 2);
            const actualHeal = applyHeal(attacker, baseHeal);
            if (actualHeal > 0) {
                logs.push(`${attacker.cnName} 降落休息恢复了体力!`);
                // 【完整实现】羽栖效果：本回合失去飞行属性
                if (attacker.types && attacker.types.includes('Flying')) {
                    if (!attacker.volatile) attacker.volatile = {};
                    attacker.volatile.roost = true;
                    // 保存原始属性用于回合末恢复
                    attacker.volatile.roostOriginalTypes = [...attacker.types];
                    // 移除飞行属性
                    attacker.types = attacker.types.filter(t => t !== 'Flying');
                    // 如果移除后没有属性了（纯飞行系），变为普通属性
                    if (attacker.types.length === 0) {
                        attacker.types = ['Normal'];
                    }
                    logs.push(`<span style="color:#94a3b8">${attacker.cnName} 暂时失去了飞行属性!</span>`);
                    console.log(`[ROOST] ${attacker.cnName} 失去飞行属性，当前属性: ${attacker.types.join('/')}`);
                }
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复最大HP的50%，本回合失去飞行属性'
    },
    
    'Synthesis': {
        onHit: (attacker, defender, damage, logs, battle) => {
            let healRatio = 0.5;
            // 天气影响
            // 【天气统一】兼容 sun 和 harshsun
            if (battle) {
                if (battle.weather === 'sun' || battle.weather === 'harshsun') {
                    healRatio = 2/3;
                } else if (battle.weather && battle.weather !== 'none') {
                    healRatio = 0.25;
                }
            }
            const baseHeal = Math.floor(attacker.maxHp * healRatio);
            const actualHeal = applyHeal(attacker, baseHeal);
            if (actualHeal > 0) {
                logs.push(`${attacker.cnName} 通过光合作用恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复HP，晴天恢复更多'
    },
    
    'Morning Sun': {
        onHit: (attacker, defender, damage, logs, battle) => {
            let healRatio = 0.5;
            // 【天气统一】兼容 sun 和 harshsun
            if (battle) {
                if (battle.weather === 'sun' || battle.weather === 'harshsun') {
                    healRatio = 2/3;
                } else if (battle.weather && battle.weather !== 'none') {
                    healRatio = 0.25;
                }
            }
            const baseHeal = Math.floor(attacker.maxHp * healRatio);
            const actualHeal = applyHeal(attacker, baseHeal);
            if (actualHeal > 0) {
                logs.push(`${attacker.cnName} 吸收了清晨的露水恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复HP，晴天恢复更多'
    },
    
    'Moonlight': {
        onHit: (attacker, defender, damage, logs, battle) => {
            let healRatio = 0.5;
            // 【天气统一】兼容 sun 和 harshsun
            if (battle) {
                if (battle.weather === 'sun' || battle.weather === 'harshsun') {
                    healRatio = 2/3;
                } else if (battle.weather && battle.weather !== 'none') {
                    healRatio = 0.25;
                }
            }
            const baseHeal = Math.floor(attacker.maxHp * healRatio);
            const actualHeal = applyHeal(attacker, baseHeal);
            if (actualHeal > 0) {
                logs.push(`${attacker.cnName} 吸收了月光恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复HP，晴天恢复更多'
    },
    
    // ============================================
    // 能力变化清除技能 (Stat Reset Moves)
    // ============================================
    
    'Haze': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 重置双方所有能力变化
            const resetBoosts = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };
            
            if (attacker.boosts) {
                attacker.boosts = { ...resetBoosts };
            }
            if (defender.boosts) {
                defender.boosts = { ...resetBoosts };
            }
            
            logs.push(`场上所有的能力变化由于黑雾都消失了!`);
            return { haze: true };
        },
        description: '清除场上所有宝可梦的能力变化'
    },
    
    'Clear Smog': {
        onHit: (attacker, defender, damage, logs) => {
            // 只重置对手的能力变化
            const resetBoosts = { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, accuracy: 0, evasion: 0 };
            
            if (defender.boosts) {
                defender.boosts = { ...resetBoosts };
            }
            
            logs.push(`${defender.cnName} 的强化被清除之烟抵消了!`);
            return { clearSmog: true };
        },
        description: '造成伤害并清除对手的能力变化'
    },
    
    // 【换场 (Court Change)】交换双方场地效果 - 闪焰王牌专属
    'Court Change': {
        onHit: (attacker, defender, damage, logs, battle, isPlayer) => {
            if (!battle) return {};
            
            // 确保场地对象存在
            if (!battle.playerSide) battle.playerSide = {};
            if (!battle.enemySide) battle.enemySide = {};
            
            const pSide = battle.playerSide;
            const eSide = battle.enemySide;
            
            // 需要交换的场地效果
            const fieldsToSwap = [
                // 入场危害
                'spikes', 'toxicSpikes', 'toxicspikes', 'stealthRock', 'stickyWeb',
                // 墙/屏障
                'auroraVeil', 'reflect', 'lightScreen',
                // 顺风/守护/白雾
                'tailwind', 'safeguard', 'mist',
                // G-Max DOT 效果
                'gmaxWildfire', 'gmaxCannonade', 'gmaxVineLash', 'gmaxVolcalith',
                // 【BUG修复】G-Max Steelsurge (钢之撒菱)
                'gmaxSteelsurge'
            ];
            
            let swapped = false;
            fieldsToSwap.forEach(key => {
                const temp = pSide[key];
                if (pSide[key] || eSide[key]) swapped = true;
                pSide[key] = eSide[key];
                eSide[key] = temp;
            });
            
            if (swapped) {
                logs.push(`🔁 <b>${attacker.cnName}</b> 互换了双方的场地状态！(换场)`);
            } else {
                logs.push(`${attacker.cnName} 使用了换场，但场上没有可交换的效果...`);
            }
            
            // 视觉更新
            if (typeof window !== 'undefined' && typeof window.updateAllVisuals === 'function') {
                window.updateAllVisuals();
            }
            
            return { courtChange: true };
        },
        description: '互换双方场地的效果（钉子、墙、顺风、G-Max DOT）'
    },
    
    // ============================================
    // 能力变化操控技能 (Stat Manipulation Moves)
    // ============================================
    
    'Topsy-Turvy': {
        onHit: (attacker, defender, damage, logs) => {
            // 颠倒对手的能力变化（+3 变 -3，-1 变 +1）
            const stats = ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
            let reversed = false;
            
            if (defender.boosts) {
                stats.forEach(key => {
                    if (defender.boosts[key] && defender.boosts[key] !== 0) {
                        defender.boosts[key] *= -1;
                        reversed = true;
                    }
                });
            }
            
            if (reversed) {
                logs.push(`${defender.cnName} 的能力变化被完全颠倒了!`);
            } else {
                logs.push(`但是没有效果...`);
            }
            return { topsyTurvy: true };
        },
        description: '将对手的能力变化数值反转'
    },
    
    'Spectral Thief': {
        onHit: (attacker, defender, damage, logs) => {
            // 偷取对手的正面能力变化
            const stats = ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
            let stolen = false;
            
            if (defender.boosts && attacker.boosts) {
                stats.forEach(key => {
                    if (defender.boosts[key] && defender.boosts[key] > 0) {
                        // 自己加上对手的增益
                        attacker.boosts[key] = Math.min(6, (attacker.boosts[key] || 0) + defender.boosts[key]);
                        // 对手清零
                        defender.boosts[key] = 0;
                        stolen = true;
                    }
                });
            }
            
            if (stolen) {
                logs.push(`${attacker.cnName} 夺取了对手的强化能力!`);
            }
            return { spectralThief: true };
        },
        description: '偷取对手的正面能力变化后造成伤害'
    },
    
    'Psych Up': {
        onHit: (attacker, defender, damage, logs) => {
            // 复制对手的能力变化
            if (defender.boosts) {
                attacker.boosts = { ...defender.boosts };
                logs.push(`${attacker.cnName} 复制了 ${defender.cnName} 的能力变化!`);
            } else {
                logs.push(`但是没有效果...`);
            }
            return { psychUp: true };
        },
        description: '复制对手的能力变化覆盖自己'
    },
    
    'Heart Swap': {
        onHit: (attacker, defender, damage, logs) => {
            // 交换双方的能力变化
            if (attacker.boosts && defender.boosts) {
                const temp = { ...attacker.boosts };
                attacker.boosts = { ...defender.boosts };
                defender.boosts = temp;
                logs.push(`${attacker.cnName} 和 ${defender.cnName} 的能力变化互换了!`);
            }
            return { heartSwap: true };
        },
        description: '交换双方的能力变化'
    },
    
    'Power Swap': {
        onHit: (attacker, defender, damage, logs) => {
            // 交换双方的攻击和特攻能力变化
            if (attacker.boosts && defender.boosts) {
                const tempAtk = attacker.boosts.atk || 0;
                const tempSpa = attacker.boosts.spa || 0;
                attacker.boosts.atk = defender.boosts.atk || 0;
                attacker.boosts.spa = defender.boosts.spa || 0;
                defender.boosts.atk = tempAtk;
                defender.boosts.spa = tempSpa;
                logs.push(`双方的攻击和特攻能力变化互换了!`);
            }
            return { powerSwap: true };
        },
        description: '交换双方的攻击和特攻能力变化'
    },
    
    'Guard Swap': {
        onHit: (attacker, defender, damage, logs) => {
            // 交换双方的防御和特防能力变化
            if (attacker.boosts && defender.boosts) {
                const tempDef = attacker.boosts.def || 0;
                const tempSpd = attacker.boosts.spd || 0;
                attacker.boosts.def = defender.boosts.def || 0;
                attacker.boosts.spd = defender.boosts.spd || 0;
                defender.boosts.def = tempDef;
                defender.boosts.spd = tempSpd;
                logs.push(`双方的防御和特防能力变化互换了!`);
            }
            return { guardSwap: true };
        },
        description: '交换双方的防御和特防能力变化'
    },
    
    'Speed Swap': {
        onHit: (attacker, defender, damage, logs) => {
            // 交换双方的实际速度值
            const tempSpe = attacker.spe;
            attacker.spe = defender.spe;
            defender.spe = tempSpe;
            logs.push(`${attacker.cnName} 和 ${defender.cnName} 的速度互换了!`);
            return { speedSwap: true };
        },
        description: '交换双方的实际速度值'
    },
    
    // ============================================
    // 状态治疗技能 (Status Healing Moves)
    // ============================================
    
    // Aromatherapy, Heal Bell 已在第3093行附近定义（简化版本）
    
    'Refresh': {
        onHit: (attacker, defender, damage, logs) => {
            // 治愈自己的中毒、麻痹、灼伤
            const curableStatus = ['psn', 'tox', 'par', 'brn'];
            if (attacker.status && curableStatus.includes(attacker.status)) {
                attacker.status = null;
                attacker.statusTurns = 0;
                logs.push(`${attacker.cnName} 的异常状态被治愈了!`);
            } else {
                logs.push(`但是没有效果...`);
            }
            return { refresh: true };
        },
        description: '治愈自己的中毒、麻痹、灼伤'
    },
    
    'Purify': {
        onHit: (attacker, defender, damage, logs) => {
            // 治愈对手的异常状态，自己回复50%HP
            if (defender.status) {
                defender.status = null;
                defender.statusTurns = 0;
                logs.push(`${defender.cnName} 的异常状态被治愈了!`);
                
                // 自己回复HP
                const baseHeal = Math.floor(attacker.maxHp / 2);
                const actualHeal = applyHeal(attacker, baseHeal);
                if (actualHeal > 0) {
                    logs.push(`${attacker.cnName} 恢复了体力!`);
                }
            } else {
                logs.push(`但是失败了!`);
            }
            return { purify: true };
        },
        description: '治愈对手的异常状态，自己回复50%HP'
    },
    
    // ============================================
    // 特殊回复技能 (Special Recovery Moves)
    // ============================================
    
    'Rest': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 完全回复HP，但陷入睡眠2回合
            if (attacker.currHp >= attacker.maxHp) {
                logs.push(`但是失败了!`);
                return { rest: false };
            }
            
            // 【BUG修复】电气场地检查：接地目标不能使用 Rest
            if (battle && battle.terrain === 'electricterrain') {
                const aAbility = (attacker.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                const isGrounded = !(attacker.types && attacker.types.includes('Flying')) && aAbility !== 'levitate';
                if (isGrounded) {
                    logs.push(`电气场地使 ${attacker.cnName} 无法入睡!`);
                    return { rest: false };
                }
            }
            
            // 【BUG修复】不眠/干劲等特性检查
            const aAbilityId = (attacker.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            if (aAbilityId === 'insomnia' || aAbilityId === 'vitalspirit') {
                logs.push(`${attacker.cnName} 的特性使其无法入睡!`);
                return { rest: false };
            }
            
            // 【Smog 化学屏障】Rest 也受回复减半影响
            const baseHeal = attacker.maxHp - attacker.currHp;
            const actualHeal = applyHeal(attacker, baseHeal);
            
            attacker.status = 'slp';
            attacker.statusTurns = 0;
            // 睡眠回合数（Rest 固定睡2回合，第3回合醒来）
            attacker.sleepTurns = 3;
            attacker.sleepDuration = 3;
            
            // 根据实际回复量调整日志
            if (actualHeal < baseHeal) {
                logs.push(`${attacker.cnName} 睡着了，但烟霾阻碍了恢复!`);
            } else {
                logs.push(`${attacker.cnName} 睡着了并恢复了全部体力!`);
            }
            
            // 【修复】立即检查状态治愈树果（零余果/木子果）
            if (typeof ItemEffects !== 'undefined' && ItemEffects.checkStatusBerry) {
                const berryLogs = [];
                const triggered = ItemEffects.checkStatusBerry(attacker, berryLogs);
                if (triggered) {
                    berryLogs.forEach(txt => logs.push(txt));
                }
            }
            
            return { rest: true };
        },
        description: '完全回复HP，但陷入睡眠2回合'
    },
    
    'Wish': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 【完整实现】下回合结束时，该位置上的宝可梦回复"使用者最大HP的50%"
            if (battle) {
                // 判断使用者是玩家方还是敌方
                const isPlayer = battle.playerParty && battle.playerParty.includes(attacker);
                const side = isPlayer ? 'playerSide' : 'enemySide';
                if (!battle[side]) battle[side] = {};
                battle[side].wishPending = {
                    amount: Math.floor(attacker.maxHp / 2),
                    turnsLeft: 1,
                    source: attacker.cnName
                };
                console.log(`[WISH] ${attacker.cnName} 许愿，回复量=${Math.floor(attacker.maxHp / 2)}，标记到 battle.${side}.wishPending`);
            }
            logs.push(`${attacker.cnName} 许下了愿望!`);
            return { wish: true };
        },
        description: '下回合结束时回复50%HP'
    },
    
    // Healing Wish, Lunar Dance 已在第3016行附近定义（完整版本）
    
    'Shore Up': {
        onHit: (attacker, defender, damage, logs, battle) => {
            // 沙暴天气下回复2/3，否则回复1/2
            let healRatio = 0.5;
            if (battle && battle.weather === 'sandstorm') {
                healRatio = 2/3;
            }
            const baseHeal = Math.floor(attacker.maxHp * healRatio);
            const actualHeal = applyHeal(attacker, baseHeal);
            if (actualHeal > 0) {
                logs.push(`${attacker.cnName} 集沙恢复了体力!`);
            } else {
                logs.push(`${attacker.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '恢复HP，沙暴天气下恢复更多'
    },
    
    'Strength Sap': {
        onHit: (attacker, defender, damage, logs) => {
            // 回复等于对手经过能力变化修正后的攻击力的HP，并降低对手攻击
            const baseHeal = defender.getStat ? defender.getStat('atk') : defender.atk;
            const actualHeal = applyHeal(attacker, baseHeal);
            if (actualHeal > 0) {
                logs.push(`${attacker.cnName} 吸取了 ${defender.cnName} 的力量!`);
            }
            
            // 降低对手攻击
            if (defender.boosts) {
                const oldAtk = defender.boosts.atk || 0;
                defender.boosts.atk = Math.max(-6, oldAtk - 1);
                if (oldAtk > -6) {
                    logs.push(`${defender.cnName} 的攻击下降了!`);
                }
            }
            return { strengthSap: true };
        },
        description: '回复等于对手攻击力的HP，并降低对手攻击'
    },
    
    'Leech Seed': {
        onHit: (attacker, defender, damage, logs) => {
            // 种下寄生种子
            if (defender.types && defender.types.includes('Grass')) {
                logs.push(`对草属性宝可梦没有效果!`);
                return { leechSeed: false };
            }
            
            if (!defender.volatile) defender.volatile = {};
            defender.volatile.leechSeed = true;
            logs.push(`${defender.cnName} 被种下了寄生种子!`);
            return { leechSeed: true };
        },
        description: '每回合吸取对手1/8HP'
    },
    
    // Pain Split 已在第1459行定义
    
    // ============================================
    // 吸血/反伤技能补充 (Drain/Recoil Moves)
    // ============================================
    // 【已移除重复处理器】
    // 吸血技能 (Giga Drain, Drain Punch, Horn Leech, Leech Life, Oblivion Wing,
    // Draining Kiss, Absorb, Mega Drain, Dream Eater 等) 的吸血效果
    // 已由 battle-effects.js 通过 moves-data.js 中的 drain 字段统一处理。
    // 此处不再重复定义 onHit 钩子，避免双重日志和双重回血。
    //
    // 如需为特定吸血技能添加额外效果（如 Dream Eater 的睡眠检查），
    // 请使用 onUse 钩子进行前置检查，而非 onHit。

    // ============================================
    // 道具交换技能 (Item Swap Moves)
    // ============================================

    'Trick': {
        onUse: (user, target, logs, battle) => {
            // 检查双方道具
            const userItem = user.item || null;
            const targetItem = target.item || null;
            
            // 如果双方都没有道具，技能失败
            if (!userItem && !targetItem) {
                logs.push(`但是失败了！`);
                return { failed: true };
            }
            
            const userItemId = userItem ? userItem.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
            const targetItemId = targetItem ? targetItem.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
            
            // 使用 items-data.js 的 isSwappable 函数检查
            const checkSwappable = typeof isSwappable === 'function' ? isSwappable : (id) => {
                // Fallback: 硬编码检查
                const unswappableItems = [
                    'rustedsword', 'rustedshield', 'griseousorb', 'adamantorb', 'lustrousorb',
                    'souldew', 'lightball', 'thickclub', 'luckypunch', 'leek', 'stick', 'mail'
                ];
                if (unswappableItems.includes(id)) return false;
                if (id.endsWith('ite') && id !== 'eviolite') return false; // Mega 石
                if (id.endsWith('iumz') || id.endsWith('iniumz')) return false; // Z 水晶
                return true;
            };
            
            if (!checkSwappable(userItemId) || !checkSwappable(targetItemId)) {
                logs.push(`但是失败了！`);
                return { failed: true };
            }
            
            // 检查黏着特性
            if (target.ability === 'Sticky Hold') {
                logs.push(`${target.cnName} 的黏着特性阻止了道具交换！`);
                return { failed: true };
            }
            
            // 执行交换
            user.item = targetItem;
            target.item = userItem;
            
            // 同步交换后的 Choice 锁招状态；失去讲究道具时旧锁招也要清掉。
            const checkChoice = (typeof window !== 'undefined' && typeof window.isChoiceItem === 'function')
                ? window.isChoiceItem
                : (item) => {
                    if (!item) return false;
                    const normalized = String(item).toLowerCase();
                    return normalized.includes('choice') || String(item).includes('讲究');
                };
            const syncChoiceLockAfterItemChange = (pokemon) => {
                if (checkChoice(pokemon.item || '')) {
                    pokemon.choiceLocked = true;
                    pokemon.choiceLockedMove = null;
                } else {
                    delete pokemon.choiceLocked;
                    delete pokemon.choiceLockedMove;
                }
            };

            syncChoiceLockAfterItemChange(user);
            syncChoiceLockAfterItemChange(target);
            
            // 生成日志 - 尝试获取中文名
            const getItemCnName = (item) => {
                if (!item) return '无';
                if (typeof getItem === 'function') {
                    const data = getItem(item);
                    if (data && data.cnName) return data.cnName;
                }
                return item;
            };
            const userItemName = getItemCnName(userItem);
            const targetItemName = getItemCnName(targetItem);
            logs.push(`<b style="color:#a855f7">✦ ${user.cnName} 和 ${target.cnName} 交换了道具！</b>`);
            logs.push(`${user.cnName} 获得了 ${targetItemName}！`);
            logs.push(`${target.cnName} 获得了 ${userItemName}！`);
            
            console.log(`[TRICK] ${user.name}: ${userItem} -> ${targetItem}, ${target.name}: ${targetItem} -> ${userItem}`);
        },
        description: '和对手交换持有的道具'
    },

    'Switcheroo': {
        onUse: (user, target, logs, battle) => {
            // Switcheroo 和 Trick 效果完全相同
            const trickHandler = MoveHandlers['Trick'];
            if (trickHandler && trickHandler.onUse) {
                return trickHandler.onUse(user, target, logs, battle);
            }
        },
        description: '和对手交换持有的道具'
    },

    // ============================================
    // 场地状态技能 (Field Condition Moves)
    // ============================================

    'Trick Room': {
        onUse: (user, target, logs, battle) => {
            console.log('[TRICK ROOM] onUse called, battle:', battle, 'field:', battle?.field);
            
            // 如果 battle 或 field 不存在，尝试从全局获取
            if (!battle) {
                battle = (typeof window !== 'undefined' && window.battle) ? window.battle : null;
                console.log('[TRICK ROOM] Using global battle:', battle);
            }
            
            if (!battle) {
                console.warn('[TRICK ROOM] No battle object available!');
                logs.push(`<b style="color:#a855f7">✦ ${user.cnName} 扭曲了时空！</b>`);
                logs.push(`<span style="color:#c084fc">戏法空间展开！速度慢的宝可梦将先行动！</span>`);
                return;
            }
            
            // 确保 field 对象存在
            if (!battle.field) {
                battle.field = { trickRoom: 0 };
            }
            
            if (battle.field.trickRoom > 0) {
                // 已经有空间，再用会关闭
                battle.field.trickRoom = 0;
                logs.push(`${user.cnName} 让扭曲的时空恢复了正常！`);
                console.log('[TRICK ROOM] Closed! trickRoom =', battle.field.trickRoom);
            } else {
                // 开启空间，持续5回合
                battle.field.trickRoom = 5;
                logs.push(`<b style="color:#a855f7">✦ ${user.cnName} 扭曲了时空！</b>`);
                logs.push(`<span style="color:#c084fc">戏法空间展开！速度慢的宝可梦将先行动！</span>`);
                console.log('[TRICK ROOM] Opened! trickRoom =', battle.field.trickRoom);
            }
        },
        priority: -7,
        description: '5回合内速度慢的先动'
    },

    // 【已移除】Tailwind / Reflect / Light Screen / Aurora Veil
    // 全部由 MoveEffects.applySideCondition 统一处理
    // 避免 onUse handler + sideCondition 双路径导致"成功后又显示失败"的 Bug
    // 光之黏土(Light Clay)延长逻辑已迁移至 applySideCondition 的 screenExtend 配置
    
    // ============================================
    // 反弹技能 (Counter / Mirror Coat)
    // ============================================
    // 这两个技能需要检查本回合受到的伤害类型
    // Counter: 反弹物理伤害的两倍
    // Mirror Coat: 反弹特殊伤害的两倍
    
    'Counter': {
        // 标记为反弹技能，不是普通变化技
        isReflectMove: true,
        reflectCategory: 'physical',
        
        damageCallback: (attacker, defender) => {
            // 检查本回合受到的伤害
            const takenDamage = attacker.turnData?.lastDamageTaken;
            if (!takenDamage || takenDamage.amount <= 0) {
                return 0; // 没受伤，反弹失败
            }
            
            // 必须是物理伤害
            const cat = takenDamage.category || '';
            if (cat !== 'physical' && cat !== 'phys') {
                return 0; // 类型不对
            }
            
            // 双倍返还
            return takenDamage.amount * 2;
        },
        
        onUse: (user, target, logs, battle, isPlayer) => {
            const takenDamage = user.turnData?.lastDamageTaken;
            
            if (!takenDamage || takenDamage.amount <= 0) {
                logs.push(`<b style="color:#888">但是失败了！(本回合没有受到伤害)</b>`);
                return { failed: true };
            }
            
            const cat = takenDamage.category || '';
            if (cat !== 'physical' && cat !== 'phys') {
                logs.push(`<b style="color:#888">但是失败了！(没有受到物理攻击)</b>`);
                return { failed: true };
            }
            
            logs.push(`<b style="color:#c0392b">💥 ${user.cnName} 将物理伤害双倍奉还！</b>`);
            return { damage: takenDamage.amount * 2 };
        },
        description: '将本回合受到的物理伤害双倍返还'
    },
    
    'Mirror Coat': {
        // 标记为反弹技能，不是普通变化技
        isReflectMove: true,
        reflectCategory: 'special',
        
        damageCallback: (attacker, defender) => {
            // 检查本回合受到的伤害
            const takenDamage = attacker.turnData?.lastDamageTaken;
            if (!takenDamage || takenDamage.amount <= 0) {
                return 0; // 没受伤，反弹失败
            }
            
            // 必须是特殊伤害
            const cat = takenDamage.category || '';
            if (cat !== 'special' && cat !== 'spec') {
                return 0; // 类型不对
            }
            
            // 双倍返还
            return takenDamage.amount * 2;
        },
        
        onUse: (user, target, logs, battle, isPlayer) => {
            const takenDamage = user.turnData?.lastDamageTaken;
            
            if (!takenDamage || takenDamage.amount <= 0) {
                logs.push(`<b style="color:#888">但是失败了！(本回合没有受到伤害)</b>`);
                return { failed: true };
            }
            
            const cat = takenDamage.category || '';
            if (cat !== 'special' && cat !== 'spec') {
                logs.push(`<b style="color:#888">但是失败了！(没有受到特殊攻击)</b>`);
                return { failed: true };
            }
            
            logs.push(`<b style="color:#9b59b6">✨ ${user.cnName} 将特殊伤害双倍奉还！</b>`);
            return { damage: takenDamage.amount * 2 };
        },
        description: '将本回合受到的特殊伤害双倍返还'
    },
    
    // Metal Burst: 反弹最后受到伤害的 1.5 倍（不分物理特殊）
    'Metal Burst': {
        isReflectMove: true,
        reflectCategory: 'any',
        
        damageCallback: (attacker, defender) => {
            const takenDamage = attacker.turnData?.lastDamageTaken;
            if (!takenDamage || takenDamage.amount <= 0) {
                return 0;
            }
            // 1.5 倍返还
            return Math.floor(takenDamage.amount * 1.5);
        },
        
        onUse: (user, target, logs, battle, isPlayer) => {
            const takenDamage = user.turnData?.lastDamageTaken;
            
            if (!takenDamage || takenDamage.amount <= 0) {
                logs.push(`<b style="color:#888">但是失败了！(本回合没有受到伤害)</b>`);
                return { failed: true };
            }
            
            logs.push(`<b style="color:#7f8c8d">⚔️ ${user.cnName} 以金属爆发反击！</b>`);
            return { damage: Math.floor(takenDamage.amount * 1.5) };
        },
        description: '将本回合受到的伤害 1.5 倍返还'
    },
    
    // ============================================
    // 太晶爆发 (Tera Blast) - 星晶特殊效果
    // ============================================
    'Tera Blast': {
        onHit: (attacker, defender, damage, logs) => {
            // 只有在星晶太晶化状态下才有副作用
            if (attacker.isTerastallized && attacker.teraType === 'Stellar') {
                if (typeof attacker.applyBoost === 'function') {
                    attacker.applyBoost('atk', -1);
                    attacker.applyBoost('spa', -1);
                    logs.push(`<span style="color:#d400ff">✦ 因为这股能量过于庞大，${attacker.cnName} 的攻击和特攻下降了! (星晶反噬)</span>`);
                    if (typeof window.playSFX === 'function') window.playSFX('STAT_DOWN');
                }
            }
            return {};
        },
        description: '太晶化时改变属性。若是星晶属性，威力强大但会降低双攻。'
    },

    // ============================================
    // 生命置换系统 (HP Cost Mechanics)
    // ============================================

    // 【腹鼓】消耗50%HP，攻击直接+6
    'Belly Drum': {
        onUse: (user, target, logs) => {
            const cost = Math.floor(user.maxHp / 2);
            // 失败判定：血量不足 50%
            if (user.currHp <= cost) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(体力不足)</b>`);
                return { failed: true };
            }
            // 失败判定：攻击等级已满 (+6)
            if (!user.boosts) user.boosts = {};
            if (user.boosts.atk >= 6) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(攻击已经到了极限)</b>`);
                return { failed: true };
            }
            // 执行效果：扣血
            user.takeDamage(cost);
            // 强制将攻击等级设为 +6
            user.boosts.atk = 6;
            logs.push(`<b style="color:#e74c3c">🥁 ${user.cnName} 削减了体力，敲响腹鼓，将攻击提升到了极点！(Atk MAX)</b>`);
            if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');

            // 【修复】强制触发一次 HP 阈值类道具检查 (文柚果/混乱果等)
            if (user.item) {
                const itemId = user.item.toLowerCase().replace(/[^a-z0-9]/g, '');
                const hpPercent = user.currHp / user.maxHp;
                
                // 文柚果: HP <= 50% 时回复 25%
                if (itemId === 'sitrusberry' && hpPercent <= 0.5) {
                    const baseHeal = Math.floor(user.maxHp * 0.25);
                    let actualHeal = baseHeal;
                    if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                        actualHeal = window.WeatherEffects.applyHeal(user, baseHeal, { source: 'Sitrus Berry' });
                    } else {
                        user.currHp = Math.min(user.maxHp, user.currHp + baseHeal);
                    }
                    user.item = null;
                    logs.push(`<span style="color:#27ae60">🍊 ${user.cnName} 吃掉了文柚果，回复了 ${actualHeal} 点体力！</span>`);
                    if (typeof window.playSFX === 'function') window.playSFX('HEAL');
                    if (typeof window.BattleVFX !== 'undefined') {
                        const _isUserPlayer = window.battle && window.battle.playerParty && window.battle.playerParty.includes(user);
                        window.BattleVFX.triggerStatVFX('HEAL', _isUserPlayer ? 'player-sprite' : 'enemy-sprite');
                    }
                }
                // 混乱果系列 (勿花果/异奇果/芒芒果/芭亚果/乐芭果): HP <= 25% 时回复 33%
                // 贪吃鬼特性: 触发线提升到 50%
                const confuseBerries = ['figyberry', 'wikiberry', 'magoberry', 'aguavberry', 'iapapaberry'];
                const isGluttony = user.ability && user.ability.toLowerCase().replace(/[^a-z]/g, '') === 'gluttony';
                const confuseTrigger = isGluttony ? 0.5 : 0.25;
                
                if (confuseBerries.includes(itemId) && hpPercent <= confuseTrigger) {
                    const baseHeal = Math.floor(user.maxHp / 3);
                    let actualHeal = baseHeal;
                    if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                        actualHeal = window.WeatherEffects.applyHeal(user, baseHeal, { source: 'Confuse Berry' });
                    } else {
                        user.currHp = Math.min(user.maxHp, user.currHp + baseHeal);
                    }
                    const berryName = user.item;
                    user.item = null;
                    logs.push(`<span style="color:#27ae60">🍇 ${user.cnName} 吃掉了${berryName}，回复了 ${actualHeal} 点体力！</span>`);
                    if (typeof window.playSFX === 'function') window.playSFX('HEAL');
                    if (typeof window.BattleVFX !== 'undefined') {
                        const _isUserPlayer = window.battle && window.battle.playerParty && window.battle.playerParty.includes(user);
                        window.BattleVFX.triggerStatVFX('HEAL', _isUserPlayer ? 'player-sprite' : 'enemy-sprite');
                    }
                    // TODO: 性格不合时混乱判定
                }
            }

            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return { bellyDrum: true, success: true };
        },
        description: '消耗最大HP的一半，将攻击力提升至最大(+6)'
    },

    // 【甩肉/轻身】消耗50%HP，攻/特攻/速度+2
    'Fillet Away': {
        onUse: (user, target, logs) => {
            const cost = Math.floor(user.maxHp / 2);
            if (user.currHp <= cost) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(体力不足以甩掉肉身)</b>`);
                return { failed: true };
            }
            // 检查是否所有能力都已满级
            if (!user.boosts) user.boosts = {};
            if (user.boosts.atk >= 6 && user.boosts.spa >= 6 && user.boosts.spe >= 6) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(能力已经到了极限)</b>`);
                return { failed: true };
            }
            user.takeDamage(cost);
            logs.push(`<b style="color:#e91e63">🔪 ${user.cnName} 削减了自己的体力，身体变得轻盈了！</b>`);
            if (typeof user.applyBoost === 'function') {
                user.applyBoost('atk', 2);
                user.applyBoost('spa', 2);
                user.applyBoost('spe', 2);
            }
            if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return { success: true };
        },
        description: '消耗50%体力，大幅提升攻击/特攻/速度(+2)'
    },

    // 【魂舞烈音爆】消耗33%HP，全属性+1
    'Clangorous Soul': {
        onUse: (user, target, logs) => {
            const cost = Math.floor(user.maxHp / 3);
            if (user.currHp <= cost) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(体力不足以发出吼叫)</b>`);
                return { failed: true };
            }
            // 检查是否所有能力都已满级
            if (!user.boosts) user.boosts = {};
            const allMaxed = ['atk', 'def', 'spa', 'spd', 'spe'].every(s => (user.boosts[s] || 0) >= 6);
            if (allMaxed) {
                logs.push(`<b style="color:#e74c3c">但是失败了！(能力已经到了极限)</b>`);
                return { failed: true };
            }
            user.takeDamage(cost);
            logs.push(`<b style="color:#f1c40f">🐉 ${user.cnName} 跳起了战舞，浑身充满力量！</b>`);
            ['atk', 'def', 'spa', 'spd', 'spe'].forEach(stat => {
                if (typeof user.applyBoost === 'function') user.applyBoost(stat, 1);
            });
            if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return { success: true };
        },
        description: '消耗1/3体力，全属性提升(+1)'
    },

    // 【惊爆大头】威力150火系特殊，使用后自损50%最大HP
    'Mind Blown': {
        onHit: (attacker, defender, damage, logs) => {
            const recoil = Math.ceil(attacker.maxHp / 2);
            attacker.takeDamage(recoil);
            logs.push(`<span style="color:#e11d48">💥 ${attacker.cnName} 的头炸裂了！受到了 ${recoil} 点反作用伤害！</span>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return {};
        },
        description: '威力150火系特殊，使用后自损50%最大HP'
    },

    // 【铁蹄光线】威力140钢系特殊，使用后自损50%最大HP
    'Steel Beam': {
        onHit: (attacker, defender, damage, logs) => {
            const recoil = Math.ceil(attacker.maxHp / 2);
            attacker.takeDamage(recoil);
            logs.push(`<span style="color:#95a5a6">⚡ ${attacker.cnName} 浑身射出了光芒！受到了 ${recoil} 点反作用伤害！</span>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return {};
        },
        description: '威力140钢系特殊，使用后自损50%最大HP'
    },
    
    // 【叶绿爆震】威力150草系特殊，使用后自损50%最大HP
    'Chloroblast': {
        onHit: (attacker, defender, damage, logs) => {
            const recoil = Math.ceil(attacker.maxHp / 2);
            attacker.takeDamage(recoil);
            logs.push(`<span style="color:#27ae60">🌿 ${attacker.cnName} 释放了叶绿素能量！受到了 ${recoil} 点反作用伤害！</span>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return {};
        },
        description: '威力150草系特殊，使用后自损50%最大HP'
    },

    // ============================================
    // 诅咒 (Curse) - 幽灵/非幽灵双模式
    // ============================================
    'Curse': {
        onUse: (user, target, logs) => {
            const isGhost = user.types && user.types.includes('Ghost');
            
            if (isGhost) {
                // 幽灵系：扣50%血，让对手每回合掉1/4
                // 【关键修复】即使 HP 不足也要执行，使用者会濒死但诅咒仍然生效
                const cost = Math.floor(user.maxHp / 2);
                
                // 先施加诅咒（确保即使自己死了也能生效）
                if (!target.volatile) target.volatile = {};
                target.volatile.curse = true;
                
                // 然后扣血（可能导致自己濒死）
                user.takeDamage(cost);
                
                if (user.currHp <= 0) {
                    logs.push(`<b style="color:#7c3aed">👻 ${user.cnName} 献祭了自己，诅咒了 ${target.cnName}！</b>`);
                } else {
                    logs.push(`<b style="color:#7c3aed">👻 ${user.cnName} 削减体力诅咒了 ${target.cnName}！</b>`);
                }
                
                if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
                return { success: true, ghostCurse: true };
            } else {
                // 非幽灵系：速度-1，攻防+1 (白诅咒)
                if (!user.boosts) user.boosts = {};
                // 检查攻防是否都已满级
                if ((user.boosts.atk || 0) >= 6 && (user.boosts.def || 0) >= 6) {
                    logs.push(`<b style="color:#e74c3c">但是失败了！(能力已经到了极限)</b>`);
                    return { failed: true };
                }
                if (typeof user.applyBoost === 'function') {
                    user.applyBoost('spe', -1);
                    user.applyBoost('atk', 1);
                    user.applyBoost('def', 1);
                }
                logs.push(`${user.cnName} 的速度降低，但肌肉膨胀了！(攻防提升)`);
                return { success: true, whiteCurse: true };
            }
        },
        description: '幽灵系削血诅咒对手；非幽灵系降低速度换攻防'
    },

    // ============================================
    // 挥指 (Metronome) - 随机招式
    // ============================================
    'Metronome': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 安全招式池（避免摇出复杂递归或自爆）
            const safePool = [
                'Flamethrower', 'Ice Beam', 'Thunderbolt', 'Psychic', 'Earthquake',
                'Surf', 'Shadow Ball', 'Dazzling Gleam', 'Hyper Beam', 'Air Slash',
                'Dark Pulse', 'Flash Cannon', 'Energy Ball', 'Sludge Bomb', 'Stone Edge',
                'Close Combat', 'Brave Bird', 'Draco Meteor', 'Moonblast', 'Play Rough'
            ];
            const rndMoveName = safePool[Math.floor(Math.random() * safePool.length)];
            
            logs.push(`${user.cnName} 摆动了手指...`);
            logs.push(`<b style="color:#d4ac0d">✨ 使出了 ${rndMoveName}！</b>`);
            
            // 返回随机招式名，让引擎执行
            return { metronome: true, randomMove: rndMoveName };
        },
        description: '随机使出1种招式'
    },

    // ============================================
    // 终极冲击类 (Final Gambit / Explosion)
    // ============================================

    // 【搏命】造成等于自身当前HP的伤害，自己濒死
    'Final Gambit': {
        damageCallback: (attacker, defender) => {
            return attacker.currHp; // 造成等于自身当前HP的伤害
        },
        onHit: (attacker, defender, damage, logs) => {
            // 自己濒死
            attacker.currHp = 0;
            logs.push(`<span style="color:#e74c3c">💀 ${attacker.cnName} 拼尽全力后倒下了！</span>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return {};
        },
        description: '造成等于自身当前HP的伤害，自己濒死'
    },

    // 【治愈之愿】自己濒死，完全治愈下一只出场的宝可梦
    'Healing Wish': {
        onUse: (user, target, logs, battle, isPlayer) => {
            user.currHp = 0;
            // 【修复】标记治愈之愿效果到 battle.side 而非 user.side
            // 因为 user 即将死亡，数据会丢失
            const battleObj = battle || window.battle;
            if (battleObj) {
                const side = isPlayer ? 'playerSide' : 'enemySide';
                if (!battleObj[side]) battleObj[side] = {};
                battleObj[side].healingWish = true;
                console.log(`[HEALING WISH] 标记到 battle.${side}.healingWish`);
            }
            logs.push(`<b style="color:#ff69b4">💖 ${user.cnName} 化作了治愈之光！</b>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return { success: true, selfKO: true };
        },
        description: '自己濒死，完全治愈下一只出场的宝可梦'
    },

    // 【新月祈祷】自己濒死，完全治愈下一只出场的宝可梦（含PP）
    'Lunar Dance': {
        onUse: (user, target, logs, battle, isPlayer) => {
            user.currHp = 0;
            // 【修复】标记新月祈祷效果到 battle.side
            const battleObj = battle || window.battle;
            if (battleObj) {
                const side = isPlayer ? 'playerSide' : 'enemySide';
                if (!battleObj[side]) battleObj[side] = {};
                battleObj[side].lunarDance = true;
                console.log(`[LUNAR DANCE] 标记到 battle.${side}.lunarDance`);
            }
            logs.push(`<b style="color:#9b59b6">🌙 ${user.cnName} 化作了月光！</b>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return { success: true, selfKO: true };
        },
        description: '自己濒死，完全治愈下一只出场的宝可梦（含PP）'
    },

    // 【同命】如果这回合被击倒，击倒自己的对手也会倒下
    // 【Gen7机制】连续使用会失败，但失败后连锁重置，下回合可以再成功
    // 正确循环：成功 -> 失败 -> 成功 -> 失败
    'Destiny Bond': {
        onUse: (user, target, logs) => {
            // 【关键修复】检查的是"上回合同命是否成功"，而不是"上回合是否使用了同命"
            // lastDestinyBondSuccess 标记上回合同命是否成功
            if (user.lastDestinyBondSuccess) {
                logs.push(`<b style="color:#e74c3c">但是失败了！</b>`);
                // 失败后清除标记，下回合可以再成功
                user.lastDestinyBondSuccess = false;
                console.log(`[DESTINY BOND] ${user.cnName} 连续使用失败，连锁重置`);
                return { failed: true };
            }
            if (!user.volatile) user.volatile = {};
            user.volatile.destinyBond = true;
            // 标记本回合同命成功
            user.lastDestinyBondSuccess = true;
            console.log(`[DESTINY BOND SET] ${user.cnName} 的同命状态已设置, volatile:`, JSON.stringify(user.volatile));
            logs.push(`<b style="color:#7c3aed">💀 ${user.cnName} 想要和对手同归于尽！</b>`);
            return { success: true };
        },
        description: '如果这回合被击倒，击倒自己的对手也会倒下'
    },
    
    // 【怨恨】如果被击倒，对手使用的招式PP归零
    // 【Gen7机制】连续使用会失败，但失败后连锁重置，下回合可以再成功
    'Grudge': {
        onUse: (user, target, logs) => {
            // 【关键修复】检查的是"上回合怨恨是否成功"
            if (user.lastGrudgeSuccess) {
                logs.push(`<b style="color:#e74c3c">但是失败了！</b>`);
                user.lastGrudgeSuccess = false;
                console.log(`[GRUDGE] ${user.cnName} 连续使用失败，连锁重置`);
                return { failed: true };
            }
            if (!user.volatile) user.volatile = {};
            user.volatile.grudge = true;
            user.lastGrudgeSuccess = true;
            logs.push(`<b style="color:#7c3aed">👻 ${user.cnName} 想要让对手承受怨恨！</b>`);
            return { success: true };
        },
        description: '如果被击倒，对手使用的招式PP归零'
    },

    // 【黑色目光】阻止对手逃跑/换人
    'Mean Look': {
        onUse: (user, target, logs) => {
            if (!target.volatile) target.volatile = {};
            // 幽灵系免疫
            if (target.types && target.types.includes('Ghost')) {
                logs.push(`对幽灵系没有效果!`);
                return { failed: true };
            }
            // 已经被困住
            if (target.volatile.cantEscape) {
                logs.push(`但是失败了! (${target.cnName} 已经无法逃走了)`);
                return { failed: true };
            }
            target.volatile.cantEscape = true;
            target.volatile.trappedBy = user;
            logs.push(`<b style="color:#7c3aed">👁️ ${target.cnName} 被 ${user.cnName} 的目光锁定，无法逃走！</b>`);
            return { success: true };
        },
        description: '阻止对手逃跑或换人'
    },
    
    // 【挡路】阻止对手逃跑/换人（同 Mean Look）
    'Block': {
        onUse: (user, target, logs) => {
            if (!target.volatile) target.volatile = {};
            if (target.types && target.types.includes('Ghost')) {
                logs.push(`对幽灵系没有效果!`);
                return { failed: true };
            }
            if (target.volatile.cantEscape) {
                logs.push(`但是失败了! (${target.cnName} 已经无法逃走了)`);
                return { failed: true };
            }
            target.volatile.cantEscape = true;
            target.volatile.trappedBy = user;
            logs.push(`<b style="color:#7c3aed">🚧 ${target.cnName} 被 ${user.cnName} 挡住了去路，无法逃走！</b>`);
            return { success: true };
        },
        description: '阻止对手逃跑或换人'
    },
    
    // 【蛛网】阻止对手逃跑/换人
    'Spider Web': {
        onUse: (user, target, logs) => {
            if (!target.volatile) target.volatile = {};
            if (target.types && target.types.includes('Ghost')) {
                logs.push(`对幽灵系没有效果!`);
                return { failed: true };
            }
            if (target.volatile.cantEscape) {
                logs.push(`但是失败了! (${target.cnName} 已经无法逃走了)`);
                return { failed: true };
            }
            target.volatile.cantEscape = true;
            target.volatile.trappedBy = user;
            logs.push(`<b style="color:#7c3aed">🕸️ ${target.cnName} 被蛛网缠住，无法逃走！</b>`);
            return { success: true };
        },
        description: '阻止对手逃跑或换人'
    },

    // 【灭亡之歌】3回合后双方倒下
    'Perish Song': {
        onUse: (user, target, logs) => {
            if (!user.volatile) user.volatile = {};
            if (!target.volatile) target.volatile = {};
            if (user.volatile.perishsong || target.volatile.perishsong) {
                logs.push(`但是失败了!`);
                return { failed: true };
            }
            user.volatile.perishsong = 3;
            target.volatile.perishsong = 3;
            logs.push(`<b style="color:#7c3aed">🎵 灭亡之歌响起！所有听到歌声的宝可梦将在 3 回合后倒下！</b>`);
            return { success: true };
        },
        description: '3回合后场上所有宝可梦倒下'
    },

    // 【挣扎】PP耗尽时的最后手段
    // 【BUG修复】挣扎反伤必须绕过所有锁血机制（气势披带/AVs Trust/Second Wind/Bond Endure等）
    // 官方机制：挣扎反伤直接扣除HP，无视任何生存效果，可以自杀
    'Struggle': {
        onHit: (attacker, defender, damage, logs) => {
            // 反伤 1/4 最大HP — 直接操作 currHp，绕过 takeDamage 的所有锁血检查
            const recoil = Math.max(1, Math.floor(attacker.maxHp / 4));
            attacker.currHp = Math.max(0, attacker.currHp - recoil);
            logs.push(`<span style="color:#e74c3c">${attacker.cnName} 受到了反作用伤害！(-${recoil})</span>`);
            if (typeof window.updateAllVisuals === 'function') window.updateAllVisuals(false);
            return {};
        },
        description: 'PP耗尽时的最后手段，会受到反伤'
    },

    // ============================================
    // 治愈类招式 (Healing Moves)
    // ============================================

    // 【治愈铃声】治愈队伍所有异常状态
    'Heal Bell': {
        onUse: (user, target, logs, battle, isPlayer) => {
            logs.push(`<b style="color:#27ae60">🔔 治愈铃声响起！队伍的异常状态被治愈了！</b>`);
            user.status = null;
            return { success: true };
        },
        description: '治愈队伍所有宝可梦的异常状态'
    },

    // 【芳香治疗】同治愈铃声
    'Aromatherapy': {
        onUse: (user, target, logs, battle, isPlayer) => {
            logs.push(`<b style="color:#27ae60">🌸 芳香弥漫！队伍的异常状态被治愈了！</b>`);
            user.status = null;
            return { success: true };
        },
        description: '治愈队伍所有宝可梦的异常状态'
    },

    // ============================================
    // 场地清除招式 (Hazard Removal)
    // 注意：场地钉子设置由 move-effects.js 的 applySideCondition 处理
    // 这里只处理清除逻辑
    // ============================================

    // 【高速旋转】清除己方场地钉子 + 速度+1
    'Rapid Spin': {
        onHit: (attacker, defender, damage, logs, battle, move) => {
            if (!battle) return {};
            // 【BUG修复】判断攻击方是否为玩家，传递正确参数给 clearEntryHazards(isPlayer, battle)
            const isAttackerPlayer = battle.playerParty && battle.playerParty.includes(attacker);
            const userSide = isAttackerPlayer ? battle.playerSide : battle.enemySide;
            if (!userSide) return {};
            
            // 使用 move-effects.js 的 clearEntryHazards 函数
            if (typeof MoveEffects !== 'undefined' && MoveEffects.clearEntryHazards) {
                const clearLogs = MoveEffects.clearEntryHazards(isAttackerPlayer, battle);
                clearLogs.forEach(l => logs.push(l));
            }
            
            // 清除束缚状态 (partiallytrapped / leechseed)
            if (attacker.volatile) {
                if (attacker.volatile.partiallytrapped) {
                    delete attacker.volatile.partiallytrapped;
                    logs.push(`${attacker.cnName} 挣脱了束缚！`);
                }
                if (attacker.volatile.leechseed) {
                    delete attacker.volatile.leechseed;
                    logs.push(`${attacker.cnName} 甩掉了寄生种子！`);
                }
            }
            
            // 速度+1 (第8世代新增效果)
            if (!attacker.boosts) attacker.boosts = {};
            attacker.boosts.spe = Math.min(6, (attacker.boosts.spe || 0) + 1);
            logs.push(`${attacker.cnName} 的速度提升了！`);
            
            return {};
        },
        description: '清除己方场地钉子，速度+1'
    },

    // 【BUG修复】臓旋 (Mortal Spin) - 清除己方场地钉子 + 中毒（毒由 secondary 处理）
    // PS data 的 onAfterHit 被 null 化，需要手动实现清除逻辑
    'Mortal Spin': {
        onHit: (attacker, defender, damage, logs, battle, move) => {
            if (!battle) return {};
            const isAttackerPlayer = battle.playerParty && battle.playerParty.includes(attacker);
            
            // 清除己方场地钉子
            if (typeof MoveEffects !== 'undefined' && MoveEffects.clearEntryHazards) {
                const clearLogs = MoveEffects.clearEntryHazards(isAttackerPlayer, battle);
                clearLogs.forEach(l => logs.push(l));
            }
            
            // 清除束缚状态 (partiallytrapped / leechseed)
            if (attacker.volatile) {
                if (attacker.volatile.partiallytrapped) {
                    delete attacker.volatile.partiallytrapped;
                    logs.push(`${attacker.cnName} 挣脱了束缚！`);
                }
                if (attacker.volatile.leechseed) {
                    delete attacker.volatile.leechseed;
                    logs.push(`${attacker.cnName} 甩掉了寄生种子！`);
                }
            }
            
            // 中毒效果由 moves-data.js 的 secondary: { chance: 100, status: 'psn' } 处理
            return {};
        },
        description: '清除己方场地钉子+束缚，并使对手中毒'
    },

    // 【清除浓雾】清除双方场地效果 + 暂时驱散 Shadow Fog 天气
    'Defog': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!battle) return { failed: true };
            const userSide = isPlayer ? battle.playerSide : battle.enemySide;
            const targetSide = isPlayer ? battle.enemySide : battle.playerSide;
            
            let cleared = false;
            
            // 【BUG修复】clearEntryHazards 签名是 (isPlayer, battle)，不是 (sideObj)
            if (typeof MoveEffects !== 'undefined' && MoveEffects.clearEntryHazards) {
                const userClearLogs = MoveEffects.clearEntryHazards(isPlayer, battle);
                const targetClearLogs = MoveEffects.clearEntryHazards(!isPlayer, battle);
                userClearLogs.forEach(l => logs.push(l));
                targetClearLogs.forEach(l => logs.push(l));
                if (userClearLogs.length > 0 || targetClearLogs.length > 0) cleared = true;
            }
            
            // 清除对方壁
            if (targetSide) {
                if (targetSide.reflect > 0) { targetSide.reflect = 0; cleared = true; }
                if (targetSide.lightScreen > 0) { targetSide.lightScreen = 0; cleared = true; }
                if (targetSide.auroraVeil > 0) { targetSide.auroraVeil = 0; cleared = true; }
                if (targetSide.safeguard > 0) { targetSide.safeguard = 0; cleared = true; }
                if (targetSide.mist > 0) { targetSide.mist = 0; cleared = true; }
            }
            
            // 清除场地 (Terrain)
            if (battle.terrain) {
                logs.push(`${battle.terrain === 'electricterrain' ? '电气' : battle.terrain === 'grassyterrain' ? '青草' : battle.terrain === 'mistyterrain' ? '薄雾' : '精神'}场地消失了!`);
                battle.terrain = null;
                battle.terrainTurns = 0;
                cleared = true;
            }
            
            // 【S区特效】Defog 可以暂时驱散 Shadow Fog (fog) 天气 5 回合
            if (battle.weather === 'fog') {
                // 保存环境天气信息以便恢复
                if (!battle.defogCleanse) {
                    battle.defogCleanse = {
                        originalWeather: 'fog',
                        turnsRemaining: 5
                    };
                }
                battle.weather = 'none';
                battle.weatherTurns = 0;
                cleared = true;
                logs.push(`<b style="color:#87ceeb">💨 清除浓雾！视野暂时恢复清晰！</b>`);
                
                // 更新天气视觉效果
                if (typeof setWeatherVisuals === 'function') {
                    setWeatherVisuals('none');
                }
            } else if (cleared) {
                logs.push(`<b style="color:#87ceeb">💨 浓雾散去，场地效果被清除了！</b>`);
            } else {
                logs.push(`浓雾散去...但是没有什么效果。`);
            }
            
            // 降低对手闪避
            if (!target.boosts) target.boosts = {};
            target.boosts.evasion = Math.max(-6, (target.boosts.evasion || 0) - 1);
            
            return { success: true };
        },
        description: '清除双方场地效果，降低对手闪避，可暂时驱散S区迷雾'
    },

    // ============================================
    // 通用 Max 极巨招式 (天气/场地效果)
    // ============================================
    
    'Max Flare': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle && battle.weather !== 'sun') {
                battle.weather = 'sun'; // 标准值: sun
                battle.weatherTurns = 5;
                logs.push(`<span style="color:#f59e0b">☀️ 阳光变得强烈了！</span>`);
            }
            return {};
        },
        description: '造成伤害并召唤晴天'
    },
    
    'Max Geyser': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle && battle.weather !== 'rain') {
                battle.weather = 'rain'; // 标准值: rain
                battle.weatherTurns = 5;
                logs.push(`<span style="color:#3b82f6">🌧️ 天空下起了大雨！</span>`);
            }
            return {};
        },
        description: '造成伤害并召唤雨天'
    },
    
    'Max Hailstorm': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle && battle.weather !== 'hail') {
                battle.weather = 'hail'; // 标准值: hail
                battle.weatherTurns = 5;
                logs.push(`<span style="color:#a5f3fc">❄️ 冰雹开始下了！</span>`);
            }
            return {};
        },
        description: '造成伤害并召唤冰雹'
    },
    
    'Max Rockfall': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle && battle.weather !== 'sandstorm') {
                battle.weather = 'sandstorm'; // 标准值: sandstorm
                battle.weatherTurns = 5;
                logs.push(`<span style="color:#d97706">🏜️ 沙暴刮起来了！</span>`);
            }
            return {};
        },
        description: '造成伤害并召唤沙暴'
    },
    
    'Max Overgrowth': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle) {
                battle.terrain = 'grassyterrain';
                battle.terrainTurns = 5;
                logs.push(`<span style="color:#22c55e">🌿 脚下长出了青草！</span>`);
            }
            return {};
        },
        description: '造成伤害并展开青草场地'
    },
    
    'Max Lightning': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle) {
                battle.terrain = 'electricterrain';
                battle.terrainTurns = 5;
                logs.push(`<span style="color:#facc15">⚡ 电流在脚下奔涌！</span>`);
            }
            return {};
        },
        description: '造成伤害并展开电气场地'
    },
    
    'Max Starfall': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle) {
                battle.terrain = 'mistyterrain';
                battle.terrainTurns = 5;
                logs.push(`<span style="color:#f472b6">✨ 薄雾笼罩了战场！</span>`);
            }
            return {};
        },
        description: '造成伤害并展开薄雾场地'
    },
    
    'Max Mindstorm': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (battle) {
                battle.terrain = 'psychicterrain';
                battle.terrainTurns = 5;
                logs.push(`<span style="color:#a78bfa">🔮 奇妙的感觉笼罩了战场！</span>`);
            }
            return {};
        },
        description: '造成伤害并展开精神场地'
    },
    
    'Max Airstream': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.boosts) user.boosts = {};
            user.boosts.spe = Math.min(6, (user.boosts.spe || 0) + 1);
            logs.push(`<span style="color:#60a5fa">💨 ${user.cnName} 的速度提升了！</span>`);
            return {};
        },
        description: '造成伤害并提升己方速度'
    },
    
    'Max Knuckle': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.boosts) user.boosts = {};
            user.boosts.atk = Math.min(6, (user.boosts.atk || 0) + 1);
            logs.push(`<span style="color:#ef4444">💪 ${user.cnName} 的攻击提升了！</span>`);
            return {};
        },
        description: '造成伤害并提升己方攻击'
    },
    
    'Max Ooze': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.boosts) user.boosts = {};
            user.boosts.spa = Math.min(6, (user.boosts.spa || 0) + 1);
            logs.push(`<span style="color:#a855f7">🧪 ${user.cnName} 的特攻提升了！</span>`);
            return {};
        },
        description: '造成伤害并提升己方特攻'
    },
    
    'Max Steelspike': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.boosts) user.boosts = {};
            user.boosts.def = Math.min(6, (user.boosts.def || 0) + 1);
            logs.push(`<span style="color:#94a3b8">🛡️ ${user.cnName} 的防御提升了！</span>`);
            return {};
        },
        description: '造成伤害并提升己方防御'
    },
    
    'Max Quake': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.boosts) user.boosts = {};
            user.boosts.spd = Math.min(6, (user.boosts.spd || 0) + 1);
            logs.push(`<span style="color:#d97706">🌍 ${user.cnName} 的特防提升了！</span>`);
            return {};
        },
        description: '造成伤害并提升己方特防'
    },
    
    'Max Wyrmwind': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.atk = Math.max(-6, (target.boosts.atk || 0) - 1);
            logs.push(`<span style="color:#7c3aed">🐉 ${target.cnName} 的攻击下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标攻击'
    },
    
    'Max Phantasm': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.def = Math.max(-6, (target.boosts.def || 0) - 1);
            logs.push(`<span style="color:#6366f1">👻 ${target.cnName} 的防御下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标防御'
    },
    
    'Max Darkness': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.spd = Math.max(-6, (target.boosts.spd || 0) - 1);
            logs.push(`<span style="color:#1f2937">🌑 ${target.cnName} 的特防下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标特防'
    },
    
    'Max Flutterby': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.spa = Math.max(-6, (target.boosts.spa || 0) - 1);
            logs.push(`<span style="color:#84cc16">🦋 ${target.cnName} 的特攻下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标特攻'
    },
    
    'Max Strike': {
        isMax: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.spe = Math.max(-6, (target.boosts.spe || 0) - 1);
            logs.push(`<span style="color:#6b7280">⚡ ${target.cnName} 的速度下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标速度'
    },

    // ============================================
    // G-Max 超极巨招式处理器 (不触发天气/场地)
    // ============================================
    
    // === 1. 持续伤害类 (DOT Field) - 4回合非对应属性扣 1/6 HP ===
    'G-Max Wildfire': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.gmaxWildfire) {
                targetSide.gmaxWildfire = { turns: 4 };
                logs.push(`<span style="color:#ef4444">🔥 烈焰包围了战场！非火属性宝可梦将持续受到伤害！</span>`);
            }
            return {};
        },
        description: '造成伤害，4回合内非火属性宝可梦每回合受到1/6最大HP伤害'
    },
    
    'G-Max Vine Lash': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.gmaxVineLash) {
                targetSide.gmaxVineLash = { turns: 4 };
                logs.push(`<span style="color:#22c55e">🌿 致命藤蔓缠绕了战场！非草属性宝可梦将持续受到伤害！</span>`);
            }
            return {};
        },
        description: '造成伤害，4回合内非草属性宝可梦每回合受到1/6最大HP伤害'
    },
    
    'G-Max Cannonade': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.gmaxCannonade) {
                targetSide.gmaxCannonade = { turns: 4 };
                logs.push(`<span style="color:#3b82f6">💧 激流在战场上翻涌！非水属性宝可梦将持续受到伤害！</span>`);
            }
            return {};
        },
        description: '造成伤害，4回合内非水属性宝可梦每回合受到1/6最大HP伤害'
    },
    
    'G-Max Volcalith': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.gmaxVolcalith) {
                targetSide.gmaxVolcalith = { turns: 4 };
                logs.push(`<span style="color:#f97316">�ite 炽热岩石散落战场！非岩属性宝可梦将持续受到伤害！</span>`);
            }
            return {};
        },
        description: '造成伤害，4回合内非岩属性宝可梦每回合受到1/6最大HP伤害'
    },
    
    // === 2. 场地/墙类 ===
    'G-Max Resonance': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const userSide = (user === battle.getPlayer()) ? battle.playerSide : battle.enemySide;
            // 【道具统一】使用规范化 ID 比较
            const userItemId = (user.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const itemExt = (userItemId === 'lightclay') ? 3 : 0;
            if (!userSide.auroraVeil || userSide.auroraVeil <= 0) {
                userSide.auroraVeil = 5 + itemExt;
                logs.push(`<b style="color:#a5f3fc">❄️ 极光旋律开启了极光幕！物理和特殊伤害都将减半！</b>`);
            }
            return {};
        },
        description: '造成伤害并开启极光幕(无视天气)'
    },
    
    'G-Max Steelsurge': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.gmaxSteelsurge) {
                targetSide.gmaxSteelsurge = true;
                logs.push(`<span style="color:#94a3b8">⚙️ 尖锐的钢刺散布在对手场地！</span>`);
            }
            return {};
        },
        description: '造成伤害并在对方场地设置钢之撒菱'
    },
    
    'G-Max Stonesurge': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            if (!targetSide.stealthRock) {
                targetSide.stealthRock = true;
                logs.push(`<span style="color:#a8a29e">🪨 尖锐的岩石漂浮在对手场地周围！</span>`);
            }
            return {};
        },
        description: '造成伤害并设置隐形岩'
    },
    
    // === 3. 状态异常类 ===
    'G-Max Befuddle': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (target.status) return {};
            const rand = Math.random();
            let status = 'psn';
            if (rand < 0.33) status = 'slp';
            else if (rand < 0.66) status = 'par';
            
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const res = MoveEffects.tryInflictStatus(target, status);
                if (res && res.success) logs.push(res.message);
            }
            return {};
        },
        description: '造成伤害并随机使目标陷入睡眠/麻痹/中毒'
    },
    
    'G-Max Volt Crash': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const res = MoveEffects.tryInflictStatus(target, 'par');
                if (res && res.success) logs.push(res.message);
            }
            return {};
        },
        description: '造成伤害并使目标麻痹'
    },
    
    'G-Max Stun Shock': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (target.status) return {};
            const status = Math.random() < 0.5 ? 'par' : 'psn';
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const res = MoveEffects.tryInflictStatus(target, status);
                if (res && res.success) logs.push(res.message);
            }
            return {};
        },
        description: '造成伤害并随机使目标麻痹或中毒'
    },
    
    'G-Max Malodor': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const res = MoveEffects.tryInflictStatus(target, 'psn');
                if (res && res.success) logs.push(res.message);
            }
            return {};
        },
        description: '造成伤害并使目标中毒'
    },
    
    'G-Max Snooze': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            if (!target.volatile.yawn) {
                target.volatile.yawn = 2;
                logs.push(`<span style="color:#a78bfa">😴 ${target.cnName} 开始打哈欠了...</span>`);
            }
            return {};
        },
        description: '造成伤害并使目标进入哈欠状态(下回合睡着)'
    },
    
    // === 4. 资源回复类 ===
    'G-Max Replenish': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.item && user._consumedBerry && Math.random() < 0.5) {
                user.item = user._consumedBerry;
                logs.push(`<span style="color:#22c55e">🍎 ${user.cnName} 捡回了${user._consumedBerry}！</span>`);
            }
            return {};
        },
        description: '造成伤害，50%概率恢复已消耗的树果'
    },
    
    'G-Max Finale': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            const baseHeal = Math.floor(user.maxHp / 6);
            let actualHeal = baseHeal;
            if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                actualHeal = window.WeatherEffects.applyHeal(user, baseHeal, { source: 'G-Max Finale' });
            } else {
                user.currHp = Math.min(user.maxHp, user.currHp + baseHeal);
            }
            logs.push(`<span style="color:#f472b6">🎂 ${user.cnName} 回复了 ${actualHeal} HP！</span>`);
            return {};
        },
        description: '造成伤害并回复己方1/6最大HP'
    },
    
    // === 5. 能力变化类 ===
    'G-Max Chi Strike': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.focusenergy = true;
            logs.push(`<span style="color:#ef4444">💪 ${user.cnName} 气势高涨！暴击率大幅提升！</span>`);
            return {};
        },
        description: '造成伤害并大幅提升暴击率'
    },
    
    'G-Max Terror': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            target.volatile.trapped = true;
            logs.push(`<span style="color:#7c3aed">👻 ${target.cnName} 被恐惧笼罩，无法逃走！</span>`);
            return {};
        },
        description: '造成伤害并使目标无法逃走'
    },
    
    'G-Max Cuddle': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            target.volatile.infatuated = true;
            logs.push(`<span style="color:#ec4899">💕 ${target.cnName} 被迷住了！</span>`);
            return {};
        },
        description: '造成伤害并使目标着迷'
    },
    
    // === 6. 御三家/武道熊师 破格类 ===
    'G-Max Fireball': {
        isGMax: true,
        noWeather: true,
        ignoreAbility: true,
        description: '造成伤害，无视目标特性'
    },
    
    'G-Max Hydrosnipe': {
        isGMax: true,
        noWeather: true,
        ignoreAbility: true,
        description: '造成伤害，无视目标特性'
    },
    
    'G-Max Drum Solo': {
        isGMax: true,
        noWeather: true,
        ignoreAbility: true,
        description: '造成伤害，无视目标特性'
    },
    
    'G-Max One Blow': {
        isGMax: true,
        noWeather: true,
        bypassProtect: true,
        description: '造成伤害，无视守住'
    },
    
    'G-Max Rapid Flow': {
        isGMax: true,
        noWeather: true,
        bypassProtect: true,
        description: '造成伤害，无视守住'
    },
    
    // === 7. 其他 G-Max 招式 (基础效果) ===
    'G-Max Gold Rush': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            // 混乱是 volatile 状态，不是主状态，需要直接设置
            if (!target.volatile) target.volatile = {};
            if (!target.volatile.confusion) {
                target.volatile.confusion = 2 + Math.floor(Math.random() * 4); // 2-5回合
                logs.push(`<span style="color:#f1c40f">💰 ${target.cnName} 被金币砸得混乱了！</span>`);
            }
            return {};
        },
        description: '造成伤害并使目标混乱'
    },
    
    'G-Max Smite': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            // 混乱是 volatile 状态，不是主状态，需要直接设置
            if (!target.volatile) target.volatile = {};
            if (!target.volatile.confusion) {
                target.volatile.confusion = 2 + Math.floor(Math.random() * 4); // 2-5回合
                logs.push(`<span style="color:#9b59b6">💫 ${target.cnName} 混乱了！</span>`);
            }
            return {};
        },
        description: '造成伤害并使目标混乱'
    },
    
    'G-Max Foam Burst': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.spe = Math.max(-6, (target.boosts.spe || 0) - 2);
            logs.push(`<span style="color:#3b82f6">🫧 ${target.cnName} 的速度大幅下降！</span>`);
            return {};
        },
        description: '造成伤害并大幅降低目标速度'
    },
    
    'G-Max Centiferno': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            target.volatile.partiallytrapped = { turns: 4, source: user };
            logs.push(`<span style="color:#ef4444">🔥 ${target.cnName} 被烈焰缠绕了！</span>`);
            return {};
        },
        description: '造成伤害并束缚目标4-5回合'
    },
    
    'G-Max Sandblast': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            target.volatile.partiallytrapped = { turns: 4, source: user };
            logs.push(`<span style="color:#d97706">🏜️ ${target.cnName} 被沙暴缠绕了！</span>`);
            return {};
        },
        description: '造成伤害并束缚目标4-5回合'
    },
    
    'G-Max Wind Rage': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            const targetSide = (user === battle.getPlayer()) ? battle.enemySide : battle.playerSide;
            let cleared = false;
            if (targetSide) {
                if (targetSide.reflect > 0) { targetSide.reflect = 0; cleared = true; }
                if (targetSide.lightScreen > 0) { targetSide.lightScreen = 0; cleared = true; }
                if (targetSide.auroraVeil > 0) { targetSide.auroraVeil = 0; cleared = true; }
            }
            if (cleared) {
                logs.push(`<span style="color:#60a5fa">💨 对手的壁被吹散了！</span>`);
            }
            return {};
        },
        description: '造成伤害并清除对手的壁'
    },
    
    'G-Max Gravitas': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!battle) return {};
            // 【修复】使用 battle.field 而不是 battle.pseudoWeather
            if (!battle.field) battle.field = {};
            battle.field.gravity = 5;
            logs.push(`<b style="color:#a78bfa">🌌 重力场展开了！</b>`);
            return {};
        },
        description: '造成伤害并展开重力场'
    },
    
    'G-Max Depletion': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (target.moves && target.moves.length > 0) {
                const lastMove = target.lastMove;
                if (lastMove) {
                    const move = target.moves.find(m => m.name === lastMove || m.cn === lastMove);
                    if (move && move.pp > 0) {
                        move.pp = Math.max(0, move.pp - 2);
                        logs.push(`<span style="color:#7c3aed">⚡ ${target.cnName} 的 ${move.cn || move.name} PP减少了！</span>`);
                    }
                }
            }
            return {};
        },
        description: '造成伤害并减少目标最后使用招式的PP'
    },
    
    'G-Max Tartness': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.boosts) target.boosts = {};
            target.boosts.evasion = Math.max(-6, (target.boosts.evasion || 0) - 1);
            logs.push(`<span style="color:#84cc16">🍏 ${target.cnName} 的闪避率下降了！</span>`);
            return {};
        },
        description: '造成伤害并降低目标闪避率'
    },
    
    'G-Max Sweetness': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (user.status) {
                user.status = null;
                logs.push(`<span style="color:#22c55e">🍯 ${user.cnName} 的异常状态被治愈了！</span>`);
            }
            return {};
        },
        description: '造成伤害并治愈己方异常状态'
    },
    
    'G-Max Meltdown': {
        isGMax: true,
        noWeather: true,
        onHit: (user, target, damage, logs, battle) => {
            if (!target.volatile) target.volatile = {};
            target.volatile.torment = true;
            logs.push(`<span style="color:#94a3b8">🔩 ${target.cnName} 无法连续使用相同招式了！</span>`);
            return {};
        },
        description: '造成伤害并使目标无法连续使用相同招式'
    },
    
    // ============================================
    // 蓄力系列技能 (Stockpile / Spit Up / Swallow)
    // ============================================
    
    'Stockpile': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            const currentStacks = user.volatile.stockpile || 0;
            
            // 最多蓄力 3 次
            if (currentStacks >= 3) {
                logs.push(`${user.cnName} 已经蓄满了！无法继续蓄力！`);
                return { failed: true };
            }
            
            user.volatile.stockpile = currentStacks + 1;
            const newStacks = user.volatile.stockpile;
            
            // 每次蓄力提升 1 级防御和特防
            const defDiff = user.applyBoost('def', 1);
            const spdDiff = user.applyBoost('spd', 1);
            
            logs.push(`${user.cnName} 蓄力了！(${newStacks}/3)`);
            if (defDiff > 0) logs.push(`${user.cnName} 的防御提升了！`);
            if (spdDiff > 0) logs.push(`${user.cnName} 的特防提升了！`);
            
            return {};
        },
        description: '蓄力（最多3次），每次提升1级防御和特防'
    },
    
    'Spit Up': {
        basePowerCallback: (attacker, defender) => {
            const stacks = (attacker.volatile && attacker.volatile.stockpile) || 0;
            // 威力 = 100 × 蓄力层数
            return stacks * 100;
        },
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            const stacks = user.volatile.stockpile || 0;
            
            if (stacks === 0) {
                logs.push(`${user.cnName} 没有蓄力，喷出失败了！`);
                return { failed: true };
            }
            
            return {};
        },
        onHit: (user, target, damage, logs, battle) => {
            // 使用后清空蓄力层数并降低对应的防御/特防
            const stacks = (user.volatile && user.volatile.stockpile) || 0;
            if (stacks > 0) {
                user.applyBoost('def', -stacks);
                user.applyBoost('spd', -stacks);
                user.volatile.stockpile = 0;
                logs.push(`${user.cnName} 的蓄力消耗殆尽！防御和特防下降了！`);
            }
            return {};
        },
        description: '消耗蓄力层数造成伤害（100/200/300威力）'
    },
    
    'Swallow': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            const stacks = user.volatile.stockpile || 0;
            
            if (stacks === 0) {
                logs.push(`${user.cnName} 没有蓄力，吞下失败了！`);
                return { failed: true };
            }
            
            // 回复量根据蓄力层数：1层=25%, 2层=50%, 3层=100%
            const healPercent = stacks === 1 ? 0.25 : (stacks === 2 ? 0.50 : 1.00);
            const baseHeal = Math.floor(user.maxHp * healPercent);
            
            // 【Smog 化学屏障】使用统一治愈函数
            let actualHeal = baseHeal;
            if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                actualHeal = window.WeatherEffects.applyHeal(user, baseHeal, { source: 'Swallow' });
            } else {
                actualHeal = Math.min(baseHeal, user.maxHp - user.currHp);
                user.currHp = Math.min(user.maxHp, user.currHp + baseHeal);
            }
            logs.push(`${user.cnName} 吞下了蓄力！回复了 ${actualHeal} HP！`);
            if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('HEAL');
            if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                const _isUserPlayer = window.battle && window.battle.playerParty && window.battle.playerParty.includes(user);
                window.BattleVFX.triggerStatVFX('HEAL', _isUserPlayer ? 'player-sprite' : 'enemy-sprite');
            }
            
            // 消耗蓄力层数并降低对应的防御/特防
            user.applyBoost('def', -stacks);
            user.applyBoost('spd', -stacks);
            user.volatile.stockpile = 0;
            logs.push(`${user.cnName} 的蓄力消耗殆尽！防御和特防下降了！`);
            
            return {};
        },
        description: '消耗蓄力层数回复HP（25%/50%/100%）'
    },
    
    'Stuff Cheeks': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 检查是否持有树果
            const item = user.item || '';
            const isBerry = item.toLowerCase().includes('berry') || 
                           item.includes('果') ||
                           (typeof window !== 'undefined' && typeof window.isBerry === 'function' && window.isBerry(item));
            
            if (!item || !isBerry) {
                logs.push(`${user.cnName} 没有持有树果，大快朵颐失败了！`);
                return { failed: true };
            }
            
            // 强制吃掉树果
            const berryName = user.item;
            logs.push(`${user.cnName} 吃掉了 ${berryName}！`);
            
            // 触发树果效果（如果有 consumeItem 函数）
            if (typeof window !== 'undefined' && typeof window.consumeItem === 'function') {
                const itemLogs = window.consumeItem(user, battle);
                if (itemLogs && itemLogs.length) {
                    logs.push(...itemLogs);
                }
            } else {
                // 简化处理：直接清除道具
                user.item = null;
            }
            
            // 防御大幅提升 (+2)
            const defDiff = user.applyBoost('def', 2);
            if (defDiff > 0) {
                logs.push(`${user.cnName} 的防御大幅提升了！`);
            } else {
                logs.push(`${user.cnName} 的防御已经无法再提升了！`);
            }
            
            return {};
        },
        description: '吃掉持有的树果并大幅提升防御'
    },
    
    // ============================================
    // 刷新型 Volatile 技能 (Refreshable Volatile Moves)
    // 这些技能重复使用会刷新效果，不会失败
    // ============================================
    
    'Charge': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.charge = true;
            
            // 充电还会提升特防
            const spdDiff = user.applyBoost('spd', 1);
            
            logs.push(`${user.cnName} 开始充电！`);
            if (spdDiff > 0) logs.push(`${user.cnName} 的特防提升了！`);
            logs.push(`<span style="color:#f59e0b">下回合电系招式威力翻倍！</span>`);
            
            return {};
        },
        description: '充电，下回合电系招式威力翻倍，特防+1'
    },
    
    'Defense Curl': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.defensecurl = true;
            
            // 变圆提升防御
            const defDiff = user.applyBoost('def', 1);
            
            logs.push(`${user.cnName} 蜷缩起身体！`);
            if (defDiff > 0) {
                logs.push(`${user.cnName} 的防御提升了！`);
            } else {
                logs.push(`${user.cnName} 的防御已经无法再提升了！`);
            }
            
            return {};
        },
        description: '变圆，防御+1，滚动/冰球威力翻倍'
    },
    
    'Laser Focus': {
        onUse: (user, target, logs, battle, isPlayer) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.laserfocus = true;
            
            logs.push(`${user.cnName} 集中精神！`);
            logs.push(`<span style="color:#ef4444">下回合攻击必定暴击！</span>`);
            
            return {};
        },
        description: '磨砺，下回合攻击必定暴击'
    },
    
    // ============================================
    // 滚动/冰球 (Rollout / Ice Ball)
    // 威力递增，变圆后威力翻倍
    // ============================================
    
    'Rollout': {
        basePowerCallback: (attacker, defender) => {
            // 基础威力 30，每次翻倍，最多5次 (30->60->120->240->480)
            const rolloutCount = attacker.volatile?.rolloutCount || 1;
            let power = 30 * Math.pow(2, rolloutCount - 1);
            
            // 变圆后威力翻倍
            if (attacker.volatile?.defensecurl) {
                power *= 2;
            }
            
            return Math.min(480, power);
        },
        onHit: (user, target, damage, logs, battle) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.rolloutCount = (user.volatile.rolloutCount || 0) + 1;
            
            // 最多5次
            if (user.volatile.rolloutCount >= 5) {
                user.volatile.rolloutCount = 0;
                user.volatile.lockedMove = null;
            } else {
                user.volatile.lockedMove = 'Rollout';
            }
            
            return {};
        },
        onMiss: (user, target, logs) => {
            // 未命中则重置
            if (user.volatile) {
                user.volatile.rolloutCount = 0;
                user.volatile.lockedMove = null;
            }
            return {};
        },
        description: '滚动，威力递增，变圆后翻倍'
    },
    
    'Ice Ball': {
        basePowerCallback: (attacker, defender) => {
            const rolloutCount = attacker.volatile?.iceballCount || 1;
            let power = 30 * Math.pow(2, rolloutCount - 1);
            
            if (attacker.volatile?.defensecurl) {
                power *= 2;
            }
            
            return Math.min(480, power);
        },
        onHit: (user, target, damage, logs, battle) => {
            if (!user.volatile) user.volatile = {};
            user.volatile.iceballCount = (user.volatile.iceballCount || 0) + 1;
            
            if (user.volatile.iceballCount >= 5) {
                user.volatile.iceballCount = 0;
                user.volatile.lockedMove = null;
            } else {
                user.volatile.lockedMove = 'Ice Ball';
            }
            
            return {};
        },
        onMiss: (user, target, logs) => {
            if (user.volatile) {
                user.volatile.iceballCount = 0;
                user.volatile.lockedMove = null;
            }
            return {};
        },
        description: '冰球，威力递增，变圆后翻倍'
    },

    // ============================================
    // 梦话 (Sleep Talk) - 睡眠中随机使用其他招式
    // ============================================
    'Sleep Talk': {
        onUse: (user, target, logs, battle) => {
            // 检查使用者是否睡眠（包括绝对睡眠特性）
            const userAbility = (user.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const isAsleep = user.status === 'slp' || userAbility === 'comatose';
            
            if (!isAsleep) {
                logs.push(`但是招式失败了！`);
                return { failed: true };
            }
            
            // 获取可用招式（排除梦话自身和不能被梦话调用的招式）
            const availableMoves = [];
            const userMoves = user.moves || [];
            
            for (const moveSlot of userMoves) {
                const moveName = moveSlot.name || moveSlot;
                if (moveName === 'Sleep Talk') continue; // 排除梦话自身
                
                // 检查招式是否有 nosleeptalk 标记
                const moveId = moveName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const moveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
                if (moveData.flags && moveData.flags.nosleeptalk) continue;
                
                availableMoves.push(moveSlot);
            }
            
            if (availableMoves.length === 0) {
                logs.push(`但是招式失败了！`);
                return { failed: true };
            }
            
            // 随机选择一个招式
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            const selectedMoveName = randomMove.name || randomMove;
            
            logs.push(`梦话选择了 ${selectedMoveName}！`);
            
            // 返回要执行的招式
            return { 
                callMove: randomMove,
                skipDamage: true // 跳过梦话本身的伤害计算
            };
        },
        description: '睡眠中随机使用其他招式'
    },

    // ============================================
    // 打鼾 (Snore) - 睡眠中使用的音波攻击
    // ============================================
    'Snore': {
        onUse: (user, target, logs, battle) => {
            // 检查使用者是否睡眠（包括绝对睡眠特性）
            const userAbility = (user.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const isAsleep = user.status === 'slp' || userAbility === 'comatose';
            
            if (!isAsleep) {
                logs.push(`但是招式失败了！`);
                return { failed: true };
            }
            
            // 打鼾可以正常使用，不需要特殊处理
            return {};
        },
        description: '睡眠中使用的音波攻击，可能使对手畏缩'
    },

    // ============================================
    // 珍藏 (Last Resort) - 必须已使用过其他所有招式
    // ============================================
    'Last Resort': {
        onUse: (user, target, logs, battle, isPlayer) => {
            const userMoves = user.moves || [];
            const usedMoves = user.usedMoves || new Set();
            
            // 统计需要使用的其他招式数量
            let otherMoveCount = 0;
            let usedOtherMoveCount = 0;
            
            for (const moveSlot of userMoves) {
                const moveName = moveSlot.name || moveSlot;
                if (moveName === 'Last Resort') continue;
                
                otherMoveCount++;
                if (usedMoves.has(moveName)) {
                    usedOtherMoveCount++;
                }
            }
            
            // 如果没有其他招式，或者还有招式没用过，则失败
            if (otherMoveCount === 0 || usedOtherMoveCount < otherMoveCount) {
                logs.push(`但是招式失败了！`);
                console.log(`[LAST RESORT] 失败：已用 ${usedOtherMoveCount}/${otherMoveCount} 个其他招式`);
                return { failed: true };
            }
            
            console.log(`[LAST RESORT] 成功：已用 ${usedOtherMoveCount}/${otherMoveCount} 个其他招式`);
            return {};
        },
        description: '必须已使用过其他所有招式才能发动'
    },

    // 注意：以下招式由 move-effects.js 统一处理，不需要在这里重复定义：
    // - Taunt, Encore, Disable -> MoveEffects.applyVolatileStatus
    // - Stealth Rock, Spikes, Toxic Spikes, Sticky Web -> MoveEffects.applySideCondition
    // - Haze -> MoveEffects (已有 onHit 处理器在上方)
    
    // ============================================
    // 【气场轮 Aura Wheel】- 莫鲁贝可专属，属性随形态变化
    // ============================================
    'Aura Wheel': {
        // 动态修改属性：满腹=电系，空腹=恶系
        onModifyType: (move, attacker, battle) => {
            const currentId = attacker.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            // 空腹模式(morpekohangry)变为恶系，否则为电系
            if (currentId.includes('hangry')) {
                return 'Dark';
            }
            return 'Electric';
        },
        // 只有莫鲁贝可能使用此招式
        onUse: (user, target, logs, battle, isPlayer) => {
            const currentId = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!currentId.includes('morpeko')) {
                logs.push(`但是招式失败了！`);
                return { failed: true };
            }
            return {};
        },
        description: '莫鲁贝可专属，属性随形态变化(电/恶)，必定提升速度'
    },
    
    // ============================================
    // 【三重攻击 Tri Attack】- 20% 几率随机施加麻痹/灼伤/冰冻
    // ============================================
    'Tri Attack': {
        onHit: (user, target, damageDealt, logs, battle) => {
            // 20% 几率触发状态
            if (Math.random() * 100 >= 20) return {};
            
            // 目标已有状态则不施加
            if (target.status) return {};
            
            // 随机选择状态：麻痹/灼伤/冰冻
            const statuses = ['par', 'brn', 'frz'];
            const statusNames = { par: '麻痹', brn: '灼伤', frz: '冰冻' };
            const randomStatus = statuses[Math.floor(Math.random() * 3)];
            
            // 使用 MoveEffects.tryInflictStatus 进行状态免疫检查
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const result = MoveEffects.tryInflictStatus(target, randomStatus, user, battle);
                if (result.success) {
                    logs.push(result.message);
                }
            } else {
                target.status = randomStatus;
                logs.push(`${target.cnName} ${statusNames[randomStatus]}了!`);
            }
            
            return {};
        },
        description: '20% 几率随机施加麻痹/灼伤/冰冻之一'
    },
    
    // ============================================
    // 【吵闹 Uproar】- 持续3回合，期间全场无法入睡
    // ============================================
    'Uproar': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 初始化或继续吵闹状态
            if (!user.volatile) user.volatile = {};
            
            if (!user.volatile.uproar) {
                // 开始吵闹，持续3回合
                user.volatile.uproar = 3;
                logs.push(`<span style="color:#f39c12">📢 ${user.cnName} 开始大吵大闹了！</span>`);
            } else {
                // 继续吵闹
                logs.push(`<span style="color:#f39c12">📢 ${user.cnName} 继续大吵大闹！</span>`);
            }
            
            // 唤醒场上所有睡着的宝可梦
            if (battle) {
                const playerPoke = battle.playerParty?.[battle.playerActive];
                const enemyPoke = battle.enemyParty?.[battle.enemyActive];
                
                if (playerPoke && playerPoke.status === 'slp' && playerPoke !== user) {
                    playerPoke.status = null;
                    playerPoke.statusTurns = 0;
                    logs.push(`${playerPoke.cnName} 被吵醒了！`);
                }
                if (enemyPoke && enemyPoke.status === 'slp' && enemyPoke !== user) {
                    enemyPoke.status = null;
                    enemyPoke.statusTurns = 0;
                    logs.push(`${enemyPoke.cnName} 被吵醒了！`);
                }
            }
            
            return {};
        },
        onEndTurn: (pokemon, logs, battle) => {
            // 回合结束时减少吵闹计数
            if (pokemon.volatile?.uproar) {
                pokemon.volatile.uproar--;
                if (pokemon.volatile.uproar <= 0) {
                    delete pokemon.volatile.uproar;
                    logs.push(`${pokemon.cnName} 停止了吵闹。`);
                }
            }
        },
        description: '持续3回合大吵大闹，期间全场无法入睡，已睡着的会被吵醒'
    },
    
    // ============================================
    // 【Gen 9 核心招式】
    // ============================================
    
    // ============================================
    // 【愤怒之拳 Rage Fist】- 弃世猴核心招式
    // 威力 = 50 + 50 × 被攻击次数，上限 350
    // 计数器绑定在宝可梦个体上，换人不重置，濒死才清零
    // ============================================
    'Rage Fist': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // timesAttacked 是持久化属性，在宝可梦受到攻击时累加
            const timesHit = attacker.timesAttacked || 0;
            // 威力 = 50 + 50 × 被攻击次数，最高 350 (被打6次)
            const power = Math.min(350, 50 + 50 * timesHit);
            console.log(`[Rage Fist] ${attacker.cnName} 被攻击 ${timesHit} 次，威力 = ${power}`);
            return power;
        },
        description: '威力随被攻击次数增加 (50 + 50×次数)，上限350，换人不重置'
    },
    
    // ============================================
    // 【最后礼谢 Last Respects】- 扫墓犬核心招式
    // 威力 = 50 + 50 × 己方队伍濒死次数
    // 注意：是"濒死次数"而非"濒死数量"，复活再死算2次
    // ============================================
    'Last Respects': {
        basePowerCallback: (attacker, defender, move, battle) => {
            // 从 battle 对象获取己方濒死计数
            const isPlayer = battle && (attacker === battle.playerParty?.[battle.playerActive]);
            let faintCount = 0;
            
            if (battle) {
                if (isPlayer) {
                    faintCount = battle.playerFaintCount || 0;
                } else {
                    faintCount = battle.enemyFaintCount || 0;
                }
            }
            
            // 威力 = 50 + 50 × 濒死次数，上限 5050 (100次)，实战中通常 300-350
            const power = Math.min(5050, 50 + 50 * faintCount);
            console.log(`[Last Respects] 己方濒死 ${faintCount} 次，威力 = ${power}`);
            return power;
        },
        description: '威力随己方队伍濒死次数增加 (50 + 50×次数)'
    },
    
    // ============================================
    // 【盐腌 Salt Cure】- 盐石巨灵核心招式
    // 命中后施加 saltcure 状态，每回合扣 1/8 HP (水/钢系 1/4)
    // 状态由 moves-data.js 的 secondary.volatileStatus 施加
    // 回合结束伤害在 battle-turns.js 处理
    // ============================================
    'Salt Cure': {
        onHit: (user, target, damageDealt, logs, battle) => {
            // 检查隐密斗篷 (Covert Cloak) 免疫追加效果
            const targetItem = (target.item || '').toLowerCase().replace(/[^a-z]/g, '');
            if (targetItem === 'covertcloak') {
                logs.push(`${target.cnName} 的隐密斗篷阻止了盐腌效果!`);
                return {};
            }
            
            // 状态施加由 secondary.volatileStatus 处理
            // 这里只输出提示信息
            if (!target.volatile) target.volatile = {};
            if (!target.volatile.saltcure) {
                target.volatile.saltcure = true;
                logs.push(`<span style="color:#9b59b6">🧂 ${target.cnName} 被盐腌了!</span>`);
            }
            return {};
        },
        description: '命中后施加盐腌状态，每回合扣 1/8 HP (水/钢系 1/4)'
    },
    
    // ============================================
    // 【大整理 Tidy Up】- 一家鼠核心招式
    // 清理己方场地钉子 + 双方替身，然后攻击+1、速度+1
    // ============================================
    'Tidy Up': {
        onUse: (user, target, logs, battle, isPlayer) => {
            let clearedAnything = false;
            
            // 1. 清理己方场地钉子
            const mySide = isPlayer ? battle?.playerSide : battle?.enemySide;
            const sideNameCN = isPlayer ? "我方" : "敌方";
            
            if (mySide) {
                if (mySide.stealthRock) {
                    mySide.stealthRock = false;
                    logs.push(`${sideNameCN}场地的隐形岩消失了!`);
                    clearedAnything = true;
                }
                if (mySide.spikes > 0) {
                    mySide.spikes = 0;
                    logs.push(`${sideNameCN}场地的撒菱消失了!`);
                    clearedAnything = true;
                }
                if (mySide.toxicSpikes > 0) {
                    mySide.toxicSpikes = 0;
                    logs.push(`${sideNameCN}场地的毒菱消失了!`);
                    clearedAnything = true;
                }
                if (mySide.stickyWeb) {
                    mySide.stickyWeb = false;
                    logs.push(`${sideNameCN}场地的黏黏网消失了!`);
                    clearedAnything = true;
                }
                // 【BUG修复】清除 G-Max Steelsurge (钢之撒菱)
                if (mySide.gmaxSteelsurge) {
                    mySide.gmaxSteelsurge = false;
                    logs.push(`${sideNameCN}场地的钢刺消失了!`);
                    clearedAnything = true;
                }
            }
            
            // 2. 清理双方替身
            if (battle) {
                const playerPoke = battle.playerParty?.[battle.playerActive];
                const enemyPoke = battle.enemyParty?.[battle.enemyActive];
                
                if (playerPoke?.volatile?.substitute) {
                    delete playerPoke.volatile.substitute;
                    logs.push(`${playerPoke.cnName} 的替身被收走了!`);
                    clearedAnything = true;
                }
                if (enemyPoke?.volatile?.substitute) {
                    delete enemyPoke.volatile.substitute;
                    logs.push(`${enemyPoke.cnName} 的替身被收走了!`);
                    clearedAnything = true;
                }
            }
            
            // 3. 无论是否清理了东西，都进行能力提升
            logs.push(`<span style="color:#3498db">🧹 ${user.cnName} 进行了大整理!</span>`);
            
            // 攻击+1，速度+1
            if (!user.boosts) user.boosts = {};
            const oldAtk = user.boosts.atk || 0;
            const oldSpe = user.boosts.spe || 0;
            user.boosts.atk = Math.min(6, oldAtk + 1);
            user.boosts.spe = Math.min(6, oldSpe + 1);
            
            const atkMsg = user.boosts.atk > oldAtk ? `攻击提升了!` : `攻击已经无法再提升了!`;
            const speMsg = user.boosts.spe > oldSpe ? `速度提升了!` : `速度已经无法再提升了!`;
            logs.push(`${user.cnName} 的${atkMsg}`);
            logs.push(`${user.cnName} 的${speMsg}`);
            
            return {};
        },
        description: '清理己方钉子和双方替身，攻击+1、速度+1'
    },
    
    // ============================================
    // 【冷笑话 Chilly Reception】- 呆呆王(伽勒尔)核心招式
    // 先将天气改为下雪，然后换人
    // 数据驱动: weather: 'snowscape', selfSwitch: true
    // ============================================
    'Chilly Reception': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 1. 设置天气为下雪
            const oldWeather = battle?.weather;
            
            // 检查是否被极端天气阻止
            if (oldWeather === 'harshsun' || oldWeather === 'heavyrain' || oldWeather === 'strongwinds') {
                logs.push(`但是天气没有变化...`);
            } else if (oldWeather === 'snow' || oldWeather === 'snowscape') {
                logs.push(`天气已经是下雪了。`);
            } else {
                if (battle) {
                    battle.weather = 'snow';
                    battle.weatherTurns = 5;
                }
                logs.push(`<span style="color:#3498db">❄️ ${user.cnName} 讲了个冷笑话! 下起雪来了!</span>`);
            }
            
            // 2. 换人效果由 selfSwitch: true 数据驱动处理
            // 这里返回 pivot 标记
            return { pivot: true };
        },
        description: '将天气改为下雪，然后换人'
    },
    
    // ============================================
    // 【复生祈祷 Revival Blessing】- 复活一只濒死的队友
    // PP 只有 1，复活后回复 50% HP
    // 需要 UI 支持选择濒死队友
    // ============================================
    'Revival Blessing': {
        onUse: (user, target, logs, battle, isPlayer) => {
            const resetRevivedPokemonState = (pokemon, sideLabel) => {
                const wasTerastallized = !!pokemon.isTerastallized;
                const originalTypes = Array.isArray(pokemon.originalTypes) && pokemon.originalTypes.length > 0
                    ? [...pokemon.originalTypes]
                    : [...(pokemon.types || ['Normal'])];
                const reviveHp = Math.max(1, Math.floor(pokemon.maxHp / 2));

                pokemon.currHp = reviveHp;
                pokemon.status = null;
                pokemon.statusTurns = 0;
                pokemon.volatile = {};

                if (wasTerastallized) {
                    pokemon.isTerastallized = false;
                    pokemon.types = originalTypes;
                    logs.push(`<span style="color:#67e8f9">💎 ${pokemon.cnName} 的太晶光辉褪去了，恢复为原本属性！</span>`);
                    console.log(`[Revival Blessing] ${sideLabel} ${pokemon.cnName} revived and Tera state was cleared`);
                }

                return reviveHp;
            };

            // 检查是否有濒死的队友
            const party = isPlayer ? battle?.playerParty : battle?.enemyParty;
            if (!party) {
                logs.push(`但是失败了!`);
                return { failed: true };
            }
            
            const faintedMembers = party.filter((p, idx) => {
                const activeIdx = isPlayer ? battle.playerActive : battle.enemyActive;
                return p && !p.isAlive() && idx !== activeIdx;
            });
            
            if (faintedMembers.length === 0) {
                logs.push(`但是没有可以复活的队友!`);
                return { failed: true };
            }
            
            // 标记需要选择复活目标
            // 实际复活逻辑需要 UI 配合，这里先处理 AI 的情况
            if (!isPlayer) {
                // AI: 随机选择一只濒死的队友复活
                const toRevive = faintedMembers[Math.floor(Math.random() * faintedMembers.length)];
                const reviveHp = resetRevivedPokemonState(toRevive, 'enemy');
                logs.push(`<span style="color:#2ecc71">✨ ${user.cnName} 使用了复生祈祷!</span>`);
                logs.push(`<span style="color:#2ecc71">🙏 ${toRevive.cnName} 复活了! (HP: ${reviveHp}/${toRevive.maxHp})</span>`);
                return {};
            }
            
            // 玩家: 需要 UI 选择，这里标记需要选择
            logs.push(`<span style="color:#2ecc71">✨ ${user.cnName} 使用了复生祈祷!</span>`);
            if (battle) {
                battle.pendingRevival = {
                    side: 'player',
                    moveName: 'Revival Blessing',
                    userName: user.cnName,
                    eligibleIndexes: faintedMembers
                        .map(member => party.indexOf(member))
                        .filter(idx => idx >= 0)
                };
            }
            return { 
                needRevivalChoice: true
            };
        },
        description: '复活一只濒死的队友，回复 50% HP (PP: 1)'
    },
    
    // ============================================
    // 【调用类招式 - 简化版】
    // ============================================
    
    // ============================================
    // 【仿效 Copycat】- 简化版：从对手4技能中随机抽一个使用
    // ============================================
    'Copycat': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 简化版：从对手当前的技能池中随机抽一个
            const opponent = isPlayer ? battle?.getEnemy() : battle?.getPlayer();
            if (!opponent || !opponent.moves || opponent.moves.length === 0) {
                logs.push(`但是失败了!`);
                return { failed: true };
            }
            
            // 过滤掉不能被复制的技能
            const copyableMoves = opponent.moves.filter(m => {
                const moveId = (m.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                // 黑名单：不能复制的技能
                const blacklist = ['copycat', 'metronome', 'mimic', 'sketch', 'transform', 'assist', 'revivalblessing'];
                return !blacklist.includes(moveId);
            });
            
            if (copyableMoves.length === 0) {
                logs.push(`但是没有可以仿效的招式!`);
                return { failed: true };
            }
            
            // 随机选择一个技能
            const copiedMove = copyableMoves[Math.floor(Math.random() * copyableMoves.length)];
            logs.push(`<span style="color:#9b59b6">🎭 ${user.cnName} 仿效了 ${copiedMove.cn || copiedMove.name}!</span>`);
            
            // 返回要执行的招式
            return { 
                callMove: copiedMove,
                copycat: true
            };
        },
        description: '从对手的技能中随机选择一个使用'
    },
    
    // ============================================
    // 【自然之力 Nature Power】- 根据场地变换招式
    // ============================================
    'Nature Power': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 根据当前场地决定使用什么招式
            const terrain = battle?.terrain || null;
            
            let moveName, moveCn;
            switch (terrain) {
                case 'electricterrain':
                    moveName = 'Thunderbolt';
                    moveCn = '十万伏特';
                    break;
                case 'grassyterrain':
                    moveName = 'Energy Ball';
                    moveCn = '能量球';
                    break;
                case 'mistyterrain':
                    moveName = 'Moonblast';
                    moveCn = '月亮之力';
                    break;
                case 'psychicterrain':
                    moveName = 'Psychic';
                    moveCn = '精神强念';
                    break;
                default:
                    // 无场地时使用三重攻击
                    moveName = 'Tri Attack';
                    moveCn = '三重攻击';
            }
            
            logs.push(`<span style="color:#27ae60">🌿 自然之力变成了 ${moveCn}!</span>`);
            
            // 构造要调用的招式
            const calledMove = {
                name: moveName,
                cn: moveCn
            };
            
            return { 
                callMove: calledMove,
                naturePower: true
            };
        },
        description: '根据场地变换招式：电气→十万伏特，青草→能量球，薄雾→月亮之力，精神→精神强念，无→三重攻击'
    },
    
    // ============================================
    // 场地交互/破坏类招式 (Field Interaction Moves)
    // ============================================

    // 【铁滚轮 Steel Roller】只有场地存在时才能使用，攻击后破坏场地
    'Steel Roller': {
        onUse: (user, target, logs, battle) => {
            const battleObj = battle || (typeof window !== 'undefined' ? window.battle : null);
            if (!battleObj || !battleObj.terrain) {
                logs.push(`<span style="color:#e74c3c">但是失败了！(场上没有场地效果)</span>`);
                return { failed: true };
            }
            return {};
        },
        onHit: (user, target, damage, logs, battle) => {
            const battleObj = battle || (typeof window !== 'undefined' ? window.battle : null);
            if (battleObj && battleObj.terrain) {
                const terrainNames = {
                    'electricterrain': '电气场地', 'grassyterrain': '青草场地',
                    'mistyterrain': '薄雾场地', 'psychicterrain': '精神场地'
                };
                const name = terrainNames[battleObj.terrain] || '场地';
                battleObj.terrain = null;
                battleObj.terrainTurns = 0;
                logs.push(`<b style="color:#94a3b8">⚙️ ${name}被铁滚轮碾碎了！</b>`);
            }
        },
        description: '威力130钢系物理技，只有场地存在时才能使用，攻击后破坏场地'
    },

    // 【冰旋 Ice Spinner】攻击后破坏场地
    'Ice Spinner': {
        onHit: (user, target, damage, logs, battle) => {
            const battleObj = battle || (typeof window !== 'undefined' ? window.battle : null);
            if (battleObj && battleObj.terrain) {
                const terrainNames = {
                    'electricterrain': '电气场地', 'grassyterrain': '青草场地',
                    'mistyterrain': '薄雾场地', 'psychicterrain': '精神场地'
                };
                const name = terrainNames[battleObj.terrain] || '场地';
                battleObj.terrain = null;
                battleObj.terrainTurns = 0;
                logs.push(`<b style="color:#7dd3fc">❄️ ${name}被冰旋破坏了！</b>`);
            }
        },
        description: '威力80冰系物理技，攻击后破坏场地'
    },

    // ============================================
    // 空间类招式 (Room Moves)
    // ============================================

    // 【奇迹空间 Wonder Room】5回合内全场防御和特防互换
    'Wonder Room': {
        onUse: (user, target, logs, battle) => {
            const battleObj = battle || (typeof window !== 'undefined' ? window.battle : null);
            if (!battleObj) {
                logs.push(`<b style="color:#ec4899">✦ ${user.cnName} 扭曲了空间！</b>`);
                return {};
            }
            if (!battleObj.field) battleObj.field = {};
            
            if (battleObj.field.wonderRoom > 0) {
                battleObj.field.wonderRoom = 0;
                logs.push(`${user.cnName} 让扭曲的空间恢复了正常！`);
            } else {
                battleObj.field.wonderRoom = 5;
                logs.push(`<b style="color:#ec4899">✦ ${user.cnName} 扭曲了空间！</b>`);
                logs.push(`<span style="color:#f9a8d4">奇迹空间展开！全场防御和特防互换！</span>`);
            }
            return {};
        },
        description: '5回合内全场防御和特防数值互换'
    },

    // 【魔法空间 Magic Room】5回合内全场道具效果失效
    'Magic Room': {
        onUse: (user, target, logs, battle) => {
            const battleObj = battle || (typeof window !== 'undefined' ? window.battle : null);
            if (!battleObj) {
                logs.push(`<b style="color:#a78bfa">✦ ${user.cnName} 创造了魔法空间！</b>`);
                return {};
            }
            if (!battleObj.field) battleObj.field = {};
            
            if (battleObj.field.magicRoom > 0) {
                battleObj.field.magicRoom = 0;
                logs.push(`${user.cnName} 让魔法空间消失了！`);
            } else {
                battleObj.field.magicRoom = 5;
                logs.push(`<b style="color:#a78bfa">✦ ${user.cnName} 创造了魔法空间！</b>`);
                logs.push(`<span style="color:#c4b5fd">魔法空间展开！全场道具效果失效！</span>`);
            }
            return {};
        },
        description: '5回合内全场道具效果失效'
    },

    // ============================================
    // 全场环境状态 (Whole Field Effects)
    // ============================================

    // 【重力 Gravity】5回合内全场重力增强
    'Gravity': {
        onUse: (user, target, logs, battle) => {
            const battleObj = battle || (typeof window !== 'undefined' ? window.battle : null);
            if (!battleObj) {
                logs.push(`<b style="color:#a78bfa">🌌 重力变强了！</b>`);
                return {};
            }
            if (!battleObj.field) battleObj.field = {};
            
            if (battleObj.field.gravity > 0) {
                logs.push(`但是失败了！(重力场已经存在)`);
                return { failed: true };
            }
            
            battleObj.field.gravity = 5;
            logs.push(`<b style="color:#a78bfa">🌌 ${user.cnName} 增强了重力！</b>`);
            logs.push(`<span style="color:#c4b5fd">飞行和浮游的宝可梦被拉到地面！命中率提升！</span>`);
            return {};
        },
        description: '5回合内全场重力增强，飞行/浮游落地，命中率x1.67'
    },

    // 【妖精之锁 Fairy Lock】下一回合双方无法替换
    'Fairy Lock': {
        onUse: (user, target, logs, battle) => {
            const battleObj = battle || (typeof window !== 'undefined' ? window.battle : null);
            if (battleObj) {
                if (!battleObj.field) battleObj.field = {};
                battleObj.field.fairyLock = 2; // 本回合+下回合
            }
            logs.push(`<b style="color:#f472b6">🔒 ${user.cnName} 使用了妖精之锁！</b>`);
            logs.push(`<span style="color:#fbcfe8">下一回合双方都无法替换宝可梦！</span>`);
            return {};
        },
        description: '下一回合双方无法替换宝可梦'
    },

    // ============================================
    // 拉帝亚斯系列技能 (Latias Moves)
    // ============================================

    // 【防守平分】将双方的防御和特防分别取平均
    'Guard Split': {
        onUse: (user, target, logs) => {
            const avgDef = Math.floor((user.stats.def + target.stats.def) / 2);
            const avgSpd = Math.floor((user.stats.spd + target.stats.spd) / 2);
            
            user.stats.def = avgDef;
            user.stats.spd = avgSpd;
            target.stats.def = avgDef;
            target.stats.spd = avgSpd;
            
            logs.push(`<b style="color:#a855f7">✦ ${user.cnName} 和 ${target.cnName} 平分了防御和特防！</b>`);
            logs.push(`<span style="color:#c084fc">防御 → ${avgDef}, 特防 → ${avgSpd}</span>`);
            
            return { success: true };
        },
        description: '将使用者和目标的防御、特防分别取平均'
    },

    // 【治愈波动】回复目标最大HP的50%（超级发射器特性75%）
    'Heal Pulse': {
        onUse: (user, target, logs) => {
            // 在单打中对对手使用（帮对手回血）
            const abilityId = (user.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const healRatio = (abilityId === 'megalauncher') ? 0.75 : 0.5;
            const baseHeal = Math.floor(target.maxHp * healRatio);
            const actualHeal = applyHeal(target, baseHeal, 'Heal Pulse');
            
            if (actualHeal > 0) {
                logs.push(`${user.cnName} 向 ${target.cnName} 发出了治愈波动!`);
                logs.push(`<span style="color:#22c55e">💚 ${target.cnName} 恢复了 ${actualHeal} 点体力!</span>`);
                if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('HEAL');
            } else {
                logs.push(`${target.cnName} 的体力已满!`);
            }
            
            return { success: true };
        },
        description: '回复目标最大HP的50%（超级发射器特性75%）'
    },

    // 【精神转移】将自身异常状态转移给对手
    'Psycho Shift': {
        onUse: (user, target, logs) => {
            const curableStatus = ['brn', 'par', 'psn', 'tox', 'slp'];
            
            // 自身没有异常状态则失败
            if (!user.status || !curableStatus.includes(user.status)) {
                logs.push(`但是失败了! (没有可转移的异常状态)`);
                return { failed: true };
            }
            
            // 对手已有异常状态则失败
            if (target.status) {
                logs.push(`但是失败了! (${target.cnName} 已有异常状态)`);
                return { failed: true };
            }
            
            // 检查属性免疫
            const statusToTransfer = user.status;
            const targetTypes = target.types || [];
            
            // 火系免疫灼伤
            if (statusToTransfer === 'brn' && targetTypes.includes('Fire')) {
                logs.push(`但是失败了! (火系免疫灼伤)`);
                return { failed: true };
            }
            // 电系免疫麻痹
            if (statusToTransfer === 'par' && targetTypes.includes('Electric')) {
                logs.push(`但是失败了! (电系免疫麻痹)`);
                return { failed: true };
            }
            // 毒系/钢系免疫中毒
            if ((statusToTransfer === 'psn' || statusToTransfer === 'tox') && 
                (targetTypes.includes('Poison') || targetTypes.includes('Steel'))) {
                logs.push(`但是失败了! (毒系/钢系免疫中毒)`);
                return { failed: true };
            }
            // 冰系免疫冰冻（虽然Psycho Shift不转移冰冻，但以防万一）
            if (statusToTransfer === 'frz' && targetTypes.includes('Ice')) {
                logs.push(`但是失败了! (冰系免疫冰冻)`);
                return { failed: true };
            }
            
            // 转移状态
            target.status = statusToTransfer;
            target.statusTurns = 0;
            user.status = null;
            user.statusTurns = 0;
            
            const statusNames = {
                brn: '灼伤', par: '麻痹', psn: '中毒', tox: '剧毒', slp: '睡眠'
            };
            const statusName = statusNames[statusToTransfer] || statusToTransfer;
            
            logs.push(`<b style="color:#a855f7">✦ ${user.cnName} 将${statusName}状态转移给了 ${target.cnName}!</b>`);
            logs.push(`${user.cnName} 的异常状态被解除了!`);
            
            return { success: true };
        },
        description: '将自身异常状态转移给对手'
    },

    // 【已移除】Water Sport 由 battle-effects.js 的 pseudoWeather 通用处理
    // 避免 onUse handler + pseudoWeather 双路径导致重复设置

    // ============================================
    // 【限制类招式】
    // ============================================
    
    // ============================================
    // 【巨力锤 Gigaton Hammer】- 不能连续使用两次
    // ============================================
    'Gigaton Hammer': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 检查上一次使用的招式是否是巨力锤
            if (user.lastMoveUsed === 'Gigaton Hammer') {
                logs.push(`<span style="color:#e74c3c">巨力锤还在冷却中，无法连续使用!</span>`);
                return { failed: true };
            }
            return {};
        },
        onAfterMove: (user, target, move, logs, battle) => {
            // 记录使用了巨力锤
            user.lastMoveUsed = 'Gigaton Hammer';
        },
        description: '威力160的钢系物理技，不能连续使用两次'
    },
    
    // ============================================
    // 【戟脊龙突 Glaive Rush】- 简化版：使用后双防-1
    // ============================================
    'Glaive Rush': {
        onAfterMove: (user, target, move, logs, battle) => {
            // 简化版：使用后双防下降1级
            if (!user.boosts) user.boosts = {};
            const oldDef = user.boosts.def || 0;
            const oldSpd = user.boosts.spd || 0;
            
            user.boosts.def = Math.max(-6, oldDef - 1);
            user.boosts.spd = Math.max(-6, oldSpd - 1);
            
            logs.push(`<span style="color:#e74c3c">⚔️ ${user.cnName} 因猛攻而露出破绽!</span>`);
            if (user.boosts.def < oldDef) {
                logs.push(`${user.cnName} 的防御下降了!`);
            }
            if (user.boosts.spd < oldSpd) {
                logs.push(`${user.cnName} 的特防下降了!`);
            }
        },
        description: '威力120的龙系物理技，使用后双防-1'
    },
    
    // ============================================
    // 【灵骚 Poltergeist】- 对手没有道具则失败
    // ============================================
    'Poltergeist': {
        onUse: (user, target, logs, battle, isPlayer) => {
            // 检查对手是否持有道具
            const opponent = isPlayer ? battle?.getEnemy() : battle?.getPlayer();
            if (!opponent || !opponent.item) {
                logs.push(`<span style="color:#e74c3c">但是 ${opponent?.cnName || '对手'} 没有携带道具!</span>`);
                return { failed: true };
            }
            
            // 简化版：不显示具体道具名称，只提示有道具
            logs.push(`<span style="color:#9b59b6">👻 ${user.cnName} 操纵了 ${opponent.cnName} 的道具进行攻击!</span>`);
            return {};
        },
        description: '威力110的幽灵物理技，对手没有道具则失败'
    },
    
    // ============================================
    // ============================================
    //  变化技补全 (Status Move Implementations)
    // ============================================
    // ============================================
    
    // ============================================
    // 【D类：无效果招式】
    // ============================================
    
    'Splash': {
        onUse: (user, target, logs) => {
            logs.push(`${user.cnName} 使劲跳了起来! 但是什么也没有发生!`);
            return {};
        },
        description: '什么也没有发生'
    },
    
    'Celebrate': {
        onUse: (user, target, logs) => {
            logs.push(`恭喜你! 🎉`);
            return {};
        },
        description: '庆祝（无效果）'
    },
    
    'Happy Hour': {
        onUse: (user, target, logs) => {
            logs.push(`大家都变得快乐起来了! 💰`);
            return {};
        },
        description: '快乐时光（无效果）'
    },
    
    'Teatime': {
        onUse: (user, target, logs) => {
            logs.push(`到了喝茶的时间了! ☕`);
            return {};
        },
        description: '茶会时间（无效果）'
    },
    
    // ============================================
    // 【磁力波动 Magnetic Flux】提升Plus/Minus特性队友双防
    // 单打简化：如果自己有 Plus/Minus 则提升自己双防
    // ============================================
    'Magnetic Flux': {
        onUse: (user, target, logs) => {
            const abilityId = (user.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            if (abilityId === 'plus' || abilityId === 'minus') {
                if (typeof user.applyBoost === 'function') {
                    user.applyBoost('def', 1);
                    user.applyBoost('spd', 1);
                }
                logs.push(`<span style="color:#3498db">🧲 ${user.cnName} 的防御和特防提升了!</span>`);
            } else {
                logs.push(`但是失败了!`);
            }
            return {};
        },
        description: '提升Plus/Minus特性宝可梦的双防'
    },
    
    // ============================================
    // 【A类：核心辅助技】
    // ============================================
    
    // 【回收利用 Recycle】回收已消耗的树果/道具
    'Recycle': {
        onUse: (user, target, logs) => {
            if (user.usedBerry && !user.item) {
                user.item = user.usedBerry;
                logs.push(`<span style="color:#27ae60">♻️ ${user.cnName} 回收了 ${user.usedBerry}!</span>`);
                user.usedBerry = null;
                // 取消 Unburden 效果
                if (user.unburdenActive) {
                    user.unburdenActive = false;
                }
            } else if (!user.item && user.originalItem) {
                // Fallback: 如果有记录原始道具
                user.item = user.originalItem;
                logs.push(`<span style="color:#27ae60">♻️ ${user.cnName} 回收了 ${user.originalItem}!</span>`);
            } else {
                logs.push(`但是失败了! 没有可以回收的道具!`);
            }
            return {};
        },
        description: '回收已消耗的树果/道具'
    },
    
    // 【怨恨 Spite】减少目标最后使用招式的 PP
    'Spite': {
        onHit: (user, target, damage, logs) => {
            if (target.moves && target.moves.length > 0) {
                const lastMove = target.lastMove || target.lastMoveUsed;
                if (lastMove) {
                    const move = target.moves.find(m => m.name === lastMove || m.cn === lastMove);
                    if (move && move.pp !== undefined && move.pp > 0) {
                        const reduction = 4;
                        move.pp = Math.max(0, move.pp - reduction);
                        logs.push(`<span style="color:#7c3aed">😤 ${target.cnName} 的 ${move.cn || move.name} PP减少了 ${reduction}!</span>`);
                        return {};
                    }
                }
            }
            logs.push(`但是失败了!`);
            return {};
        },
        description: '减少目标最后使用招式的PP 4点'
    },
    
    // 【指压 Acupressure】随机大幅提升一项能力 +2
    'Acupressure': {
        onUse: (user, target, logs) => {
            const stats = ['atk', 'def', 'spa', 'spd', 'spe'];
            // 过滤掉已经+6的
            const available = stats.filter(s => !user.boosts || (user.boosts[s] || 0) < 6);
            if (available.length === 0) {
                logs.push(`${user.cnName} 的能力已经无法再提升了!`);
                return {};
            }
            const stat = available[Math.floor(Math.random() * available.length)];
            if (typeof user.applyBoost === 'function') {
                user.applyBoost(stat, 2);
            } else {
                user.boosts = user.boosts || {};
                user.boosts[stat] = Math.min(6, (user.boosts[stat] || 0) + 2);
            }
            const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
            logs.push(`<span style="color:#e67e22">💆 ${user.cnName} 的${statNames[stat]}大幅提升了!</span>`);
            return {};
        },
        description: '随机大幅提升一项能力 (+2)'
    },
    
    // 【锁定 Lock-On】下次攻击必中
    'Lock-On': {
        onUse: (user, target, logs) => {
            user.volatile = user.volatile || {};
            user.volatile.lockOn = true;
            logs.push(`<span style="color:#e74c3c">🎯 ${user.cnName} 锁定了目标!</span>`);
            return {};
        },
        description: '下次攻击必定命中'
    },
    
    // 【振奋心神 Take Heart】治愈自身异常状态 + 特攻特防+1
    'Take Heart': {
        onUse: (user, target, logs) => {
            // 治愈异常状态
            if (user.status) {
                const statusNames = { slp: '睡眠', psn: '中毒', tox: '剧毒', brn: '灼伤', par: '麻痹', frz: '冰冻' };
                logs.push(`${user.cnName} 的${statusNames[user.status] || '异常状态'}治愈了!`);
                user.status = null;
                user.statusTurns = 0;
                user.sleepTurns = 0;
            }
            // 特攻特防+1
            if (typeof user.applyBoost === 'function') {
                user.applyBoost('spa', 1);
                user.applyBoost('spd', 1);
            } else {
                user.boosts = user.boosts || {};
                user.boosts.spa = Math.min(6, (user.boosts.spa || 0) + 1);
                user.boosts.spd = Math.min(6, (user.boosts.spd || 0) + 1);
            }
            logs.push(`<span style="color:#e056fd">💖 ${user.cnName} 振奋了心神! 特攻和特防提升了!</span>`);
            return {};
        },
        description: '治愈异常状态，特攻特防+1'
    },
    
    // 【花疗 Floral Healing】回复目标最大HP的1/2（草地上2/3）
    'Floral Healing': {
        onHit: (user, target, damage, logs, battle) => {
            // 单打中对自己使用
            const healTarget = user;
            let ratio = 0.5;
            if (battle && battle.terrain === 'grassyterrain') {
                ratio = 2 / 3;
            }
            const baseHeal = Math.floor(healTarget.maxHp * ratio);
            const actualHeal = applyHeal(healTarget, baseHeal);
            if (actualHeal > 0) {
                logs.push(`<span style="color:#27ae60">🌸 ${healTarget.cnName} 恢复了体力!</span>`);
            } else {
                logs.push(`${healTarget.cnName} 的体力已满!`);
            }
            return { heal: actualHeal };
        },
        description: '回复HP的1/2，草地上2/3'
    },
    
    // 【丛林治疗 Jungle Healing】回复己方全员HP和异常状态
    // 单打简化：回复自己1/4 HP + 治愈异常状态
    'Jungle Healing': {
        onUse: (user, target, logs) => {
            const baseHeal = Math.floor(user.maxHp / 4);
            const actualHeal = applyHeal(user, baseHeal);
            if (actualHeal > 0) {
                logs.push(`<span style="color:#27ae60">🌿 ${user.cnName} 通过丛林治疗恢复了体力!</span>`);
            }
            if (user.status) {
                const statusNames = { slp: '睡眠', psn: '中毒', tox: '剧毒', brn: '灼伤', par: '麻痹', frz: '冰冻' };
                logs.push(`${user.cnName} 的${statusNames[user.status] || '异常状态'}治愈了!`);
                user.status = null;
                user.statusTurns = 0;
                user.sleepTurns = 0;
            }
            return {};
        },
        description: '回复己方HP 1/4 + 治愈异常状态'
    },
    
    // 【新月祝福 Lunar Blessing】回复己方全员HP和异常状态
    // 单打简化：同丛林治疗
    'Lunar Blessing': {
        onUse: (user, target, logs) => {
            const baseHeal = Math.floor(user.maxHp / 4);
            const actualHeal = applyHeal(user, baseHeal);
            if (actualHeal > 0) {
                logs.push(`<span style="color:#9b59b6">🌙 ${user.cnName} 受到了新月的祝福!</span>`);
            }
            if (user.status) {
                const statusNames = { slp: '睡眠', psn: '中毒', tox: '剧毒', brn: '灼伤', par: '麻痹', frz: '冰冻' };
                logs.push(`${user.cnName} 的${statusNames[user.status] || '异常状态'}治愈了!`);
                user.status = null;
                user.statusTurns = 0;
                user.sleepTurns = 0;
            }
            return {};
        },
        description: '回复己方HP 1/4 + 治愈异常状态'
    },
    
    // 【力量平分 Power Split】平均化双方的攻击和特攻
    'Power Split': {
        onHit: (user, target, damage, logs) => {
            const avgAtk = Math.floor((user.atk + target.atk) / 2);
            const avgSpa = Math.floor((user.spa + target.spa) / 2);
            user.atk = avgAtk;
            target.atk = avgAtk;
            user.spa = avgSpa;
            target.spa = avgSpa;
            logs.push(`<span style="color:#3498db">⚖️ ${user.cnName} 和 ${target.cnName} 平分了攻击和特攻!</span>`);
            return {};
        },
        description: '平均化双方的攻击和特攻'
    },
    
    // 【色彩变化2 Conversion 2】将自身属性变为能抵抗对手上次使用招式的属性
    'Conversion 2': {
        onUse: (user, target, logs) => {
            // 简化：随机变为一个能抵抗对手属性的类型
            const targetTypes = target.types || ['Normal'];
            // 抵抗表简化
            const resistMap = {
                'Normal': ['Rock', 'Steel'], 'Fire': ['Fire', 'Water', 'Rock', 'Dragon'],
                'Water': ['Water', 'Grass', 'Dragon'], 'Electric': ['Electric', 'Grass', 'Dragon'],
                'Grass': ['Fire', 'Grass', 'Poison', 'Flying', 'Bug', 'Dragon', 'Steel'],
                'Ice': ['Fire', 'Water', 'Ice', 'Steel'], 'Fighting': ['Poison', 'Flying', 'Psychic', 'Bug', 'Fairy'],
                'Poison': ['Poison', 'Ground', 'Rock', 'Ghost'], 'Ground': ['Grass', 'Bug'],
                'Flying': ['Electric', 'Rock', 'Steel'], 'Psychic': ['Psychic', 'Steel'],
                'Bug': ['Fire', 'Fighting', 'Poison', 'Flying', 'Ghost', 'Steel', 'Fairy'],
                'Rock': ['Fighting', 'Ground', 'Steel'], 'Ghost': ['Dark'],
                'Dragon': ['Steel'], 'Dark': ['Fighting', 'Dark', 'Fairy'],
                'Steel': ['Fire', 'Water', 'Electric', 'Steel'], 'Fairy': ['Fire', 'Poison', 'Steel']
            };
            const lastMoveType = target.lastMoveType || targetTypes[0];
            const resistTypes = resistMap[lastMoveType] || ['Normal'];
            const newType = resistTypes[Math.floor(Math.random() * resistTypes.length)];
            user.types = [newType];
            logs.push(`<span style="color:#e67e22">🎨 ${user.cnName} 变成了 ${newType} 属性!</span>`);
            return {};
        },
        description: '变为能抵抗对手上次招式的属性'
    },
    
    // ============================================
    // 【B类：特性交换系列】
    // 不可交换的特性列表
    // ============================================
    
    // 【特性交换 Skill Swap】交换双方特性
    'Skill Swap': {
        onHit: (user, target, damage, logs) => {
            const banned = ['Wonder Guard', 'Multitype', 'Illusion', 'Stance Change', 'Schooling',
                'Comatose', 'Shields Down', 'Disguise', 'RKS System', 'Battle Bond',
                'Power Construct', 'Ice Face', 'Gulp Missile', 'As One', 'Zero to Hero'];
            if (banned.includes(user.ability) || banned.includes(target.ability)) {
                logs.push(`但是失败了!`);
                return {};
            }
            const temp = user.ability;
            user.ability = target.ability;
            target.ability = temp;
            logs.push(`<span style="color:#9b59b6">🔄 ${user.cnName} 和 ${target.cnName} 交换了特性!</span>`);
            logs.push(`${user.cnName} 获得了 ${user.ability}!`);
            logs.push(`${target.cnName} 获得了 ${target.ability}!`);
            return {};
        },
        description: '交换双方特性'
    },
    
    // 【扮演 Role Play】复制对手特性
    'Role Play': {
        onHit: (user, target, damage, logs) => {
            const banned = ['Wonder Guard', 'Multitype', 'Illusion', 'Stance Change', 'Schooling',
                'Comatose', 'Shields Down', 'Disguise', 'RKS System', 'Battle Bond',
                'Power Construct', 'Ice Face', 'Gulp Missile', 'As One', 'Zero to Hero', 'Trace'];
            if (banned.includes(target.ability)) {
                logs.push(`但是失败了!`);
                return {};
            }
            user.ability = target.ability;
            logs.push(`<span style="color:#9b59b6">🎭 ${user.cnName} 复制了 ${target.cnName} 的 ${target.ability}!</span>`);
            return {};
        },
        description: '复制对手的特性'
    },
    
    // 【找伙伴 Entrainment】将自己的特性强加给对手
    'Entrainment': {
        onHit: (user, target, damage, logs) => {
            const cantReplace = ['Truant', 'Multitype', 'Stance Change', 'Schooling',
                'Comatose', 'Shields Down', 'Disguise', 'RKS System', 'Battle Bond',
                'Power Construct', 'Ice Face', 'Gulp Missile', 'As One', 'Zero to Hero'];
            const cantCopy = ['Trace', 'Forecast', 'Flower Gift', 'Zen Mode', 'Illusion',
                'Imposter', 'Power of Alchemy', 'Receiver', 'Disguise', 'Wonder Guard'];
            if (cantReplace.includes(target.ability) || cantCopy.includes(user.ability)) {
                logs.push(`但是失败了!`);
                return {};
            }
            target.ability = user.ability;
            logs.push(`<span style="color:#9b59b6">🤝 ${target.cnName} 的特性变成了 ${user.ability}!</span>`);
            return {};
        },
        description: '将自己的特性强加给对手'
    },
    
    // 【单纯光束 Simple Beam】将对手特性变为单纯
    'Simple Beam': {
        onHit: (user, target, damage, logs) => {
            const banned = ['Truant', 'Multitype', 'Stance Change', 'Schooling',
                'Comatose', 'Shields Down', 'Disguise', 'RKS System', 'Battle Bond',
                'Power Construct', 'Ice Face', 'Gulp Missile', 'As One', 'Zero to Hero'];
            if (banned.includes(target.ability)) {
                logs.push(`但是失败了!`);
                return {};
            }
            target.ability = 'Simple';
            logs.push(`<span style="color:#f39c12">✨ ${target.cnName} 的特性变成了单纯!</span>`);
            return {};
        },
        description: '将对手特性变为单纯(Simple)'
    },
    
    // 【烦恼种子 Worry Seed】将对手特性变为不眠
    'Worry Seed': {
        onHit: (user, target, damage, logs) => {
            const banned = ['Truant', 'Multitype', 'Stance Change', 'Schooling',
                'Comatose', 'Shields Down', 'Disguise', 'RKS System', 'Battle Bond',
                'Power Construct', 'Ice Face', 'Gulp Missile', 'As One', 'Zero to Hero', 'Insomnia'];
            if (banned.includes(target.ability)) {
                logs.push(`但是失败了!`);
                return {};
            }
            target.ability = 'Insomnia';
            logs.push(`<span style="color:#27ae60">🌱 ${target.cnName} 的特性变成了不眠!</span>`);
            // 如果目标正在睡觉，立即醒来
            if (target.status === 'slp') {
                target.status = null;
                target.sleepTurns = 0;
                logs.push(`${target.cnName} 醒来了!`);
            }
            return {};
        },
        description: '将对手特性变为不眠(Insomnia)'
    },
    
    // 【描绘 Doodle】将己方全员特性变为对手的特性
    // 单打简化：将自己的特性变为对手的特性
    'Doodle': {
        onHit: (user, target, damage, logs) => {
            const banned = ['Wonder Guard', 'Multitype', 'Illusion', 'Stance Change', 'Schooling',
                'Comatose', 'Shields Down', 'Disguise', 'RKS System', 'Battle Bond',
                'Power Construct', 'Ice Face', 'Gulp Missile', 'As One', 'Zero to Hero'];
            if (banned.includes(target.ability)) {
                logs.push(`但是失败了!`);
                return {};
            }
            user.ability = target.ability;
            logs.push(`<span style="color:#e67e22">🖍️ ${user.cnName} 描绘了 ${target.cnName} 的特性! 变成了 ${target.ability}!</span>`);
            return {};
        },
        description: '将自己的特性变为对手的特性'
    },
    
    // ============================================
    // 【跳过类：双打专用/复杂复制技】
    // Mimic, Sketch: 复制招式，单打中意义不大且实现复杂
    // Ally Switch, Instruct, After You, Quash: 双打专用
    // ============================================
    
    'Mimic': {
        onUse: (user, target, logs) => {
            logs.push(`${user.cnName} 使用了模仿! 但在单打中效果有限!`);
            return {};
        },
        description: '模仿对手的招式（简化处理）'
    },
    
    'Sketch': {
        onUse: (user, target, logs) => {
            logs.push(`${user.cnName} 使用了写生! 但在单打中效果有限!`);
            return {};
        },
        description: '永久学习对手的招式（简化处理）'
    }
};

// ============================================
// 辅助函数：获取技能处理器
// ============================================

export function getMoveHandler(moveName) {
    return MoveHandlers[moveName] || null;
}

export function hasMoveHandler(moveName) {
    return moveName in MoveHandlers;
}

// ============================================
// 导出到全局
// ============================================

if (typeof window !== 'undefined') {
    window.MoveHandlers = MoveHandlers;
    window.getMoveHandler = getMoveHandler;
    window.hasMoveHandler = hasMoveHandler;
}
