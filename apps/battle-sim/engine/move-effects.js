/**
 * =============================================
 * MOVE EFFECTS - 技能效果扩展模块
 * =============================================
 * 
 * 处理 moves-data.js 中的通用字段，实现高级战斗机制：
 * - 优先级 (Priority)
 * - 状态异常 (Status Conditions)
 * - 天气效果 (Weather)
 * - 场地效果 (Terrain)
 * - 特殊技能标记 (Flags)
 * - 固定伤害技能
 * - 一击必杀技能
 */

// ========== 优先级系统 (Priority) ==========
// 决定回合内的行动顺序

/**
 * 获取技能优先级
 * @param {object} move 技能数据
 * @param {object} user 使用者（可选，用于特性修正）
 * @param {object} target 目标（可选，用于恶作剧之心免疫判定）
 * @returns {number} 优先级 (-7 ~ +5)
 */
function getMovePriority(move, user = null, target = null) {
    // 【古武系统】只有被 style 系统修改过的招式才直接使用 priority
    // 注意：moves-data.js 中几乎所有招式都有 priority: 0，不能用 typeof 判断
    if (move.styleUsed && typeof move.priority === 'number') {
        return move.priority;
    }
    
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // 从数据中读取优先级
    let basePriority = 0;
    if (typeof fullMoveData.priority === 'number') {
        basePriority = fullMoveData.priority;
    }
    
    // 硬编码常见优先级技能（如果数据库没有）
    if (basePriority === 0) {
        const priorityMap = {
            // +5
            'Helping Hand': 5,
            // +4
            'Protect': 4, 'Detect': 4, 'Endure': 4, 'Magic Coat': 4, 'Snatch': 4,
            'Baneful Bunker': 4, 'Spiky Shield': 4, "King's Shield": 4, 'Obstruct': 4,
            'Silk Trap': 4, 'Burning Bulwark': 4,
            // +3
            'Fake Out': 3, 'Quick Guard': 3, 'Wide Guard': 3, 'Crafty Shield': 3,
            // +2
            'Extreme Speed': 2, 'Feint': 2, 'First Impression': 2, 'Accelerock': 2,
            // +1
            'Aqua Jet': 1, 'Baby-Doll Eyes': 1, 'Bullet Punch': 1, 'Ice Shard': 1,
            'Mach Punch': 1, 'Quick Attack': 1, 'Shadow Sneak': 1, 'Sucker Punch': 1,
            'Vacuum Wave': 1, 'Water Shuriken': 1, 'Grassy Glide': 1, 'Jet Punch': 1,
            // -1
            'Vital Throw': -1,
            // -3
            'Focus Punch': -3,
            // -4
            'Avalanche': -4, 'Revenge': -4,
            // -5
            'Counter': -5, 'Mirror Coat': -5,
            // -6
            'Circle Throw': -6, 'Dragon Tail': -6, 'Roar': -6, 'Whirlwind': -6, 'Teleport': -6,
            // -7
            'Trick Room': -7
        };
        basePriority = priorityMap[move.name] || 0;
    }
    
    // === 【恶作剧之心 Prankster】特性处理 ===
    // 变化技优先度+1，但对恶系目标无效
    if (user && user.ability === 'Prankster') {
        const category = fullMoveData.category || (move.cat === 'spec' ? 'Special' : (move.cat === 'phys' ? 'Physical' : 'Status'));
        if (category === 'Status' || move.cat === 'status') {
            // 检查目标是否为恶系（恶系免疫恶作剧之心的变化技）
            if (target && target.types && target.types.includes('Dark')) {
                console.log(`[PRANKSTER] ${target.cnName} 是恶属性，免疫恶作剧之心的变化技！`);
                // 返回一个特殊标记，让调用方知道技能无效
                move.pranksterBlocked = true;
            } else {
                basePriority += 1;
                console.log(`[PRANKSTER] ${user.cnName} 的恶作剧之心使 ${move.name} 优先度+1`);
            }
        }
    }
    
    // === 【疾风之翼 Gale Wings】特性处理 ===
    // 满血时飞行系招式优先度+1
    if (user && user.ability === 'Gale Wings' && move.type === 'Flying') {
        if (user.currHp === user.maxHp) {
            basePriority += 1;
            console.log(`[GALE WINGS] ${user.cnName} 的疾风之翼使飞行系招式优先度+1`);
        }
    }
    
    // === 【慢出 Stall】特性处理 ===
    // 【修复】Stall 不改变优先度等级，而是在同优先度内最后行动
    // 实际效果应在 speed comparison 中处理（类似 Lagging Tail）
    // 此处仅做标记，不修改 basePriority
    if (user && user.ability === 'Stall') {
        move.stallFlag = true;
        console.log(`[STALL] ${user.cnName} 的慢出特性：同优先度内最后行动`);
    }
    
    // === 通用 onModifyPriority 钩子 ===
    // 【修复】跳过已在上方内联处理的特性（Prankster/Gale Wings），避免重复加成
    const inlineHandledAbilities = ['Prankster', 'Gale Wings', 'Stall'];
    if (user && user.ability && typeof AbilityHandlers !== 'undefined' && !inlineHandledAbilities.includes(user.ability)) {
        const abilityHandler = AbilityHandlers[user.ability];
        if (abilityHandler && abilityHandler.onModifyPriority) {
            const modifiedPriority = abilityHandler.onModifyPriority(basePriority, user, target, move);
            if (typeof modifiedPriority === 'number') {
                basePriority = modifiedPriority;
            }
        }
    }
    
    return basePriority;
}

/**
 * 比较两个行动的先后顺序
 * @param {object} action1 { pokemon, move, isPlayer }
 * @param {object} action2 { pokemon, move, isPlayer }
 * @returns {number} 负数=action1先，正数=action2先，0=同速
 */
function compareActionOrder(action1, action2) {
    const pri1 = getMovePriority(action1.move);
    const pri2 = getMovePriority(action2.move);
    
    // 优先级高的先动
    if (pri1 !== pri2) {
        return pri2 - pri1;
    }
    
    // 同优先级比速度（考虑天气修正）
    let spe1 = action1.pokemon.getStat('spe');
    let spe2 = action2.pokemon.getStat('spe');
    
    // 【环境图层系统】速度修正
    if (typeof window !== 'undefined' && window.envOverlay) {
        const mult1 = window.envOverlay.getStatMod(action1.pokemon, 'spe');
        const mult2 = window.envOverlay.getStatMod(action2.pokemon, 'spe');
        if (mult1 !== 1) spe1 = Math.floor(spe1 * mult1);
        if (mult2 !== 1) spe2 = Math.floor(spe2 * mult2);
    }
    
    if (spe1 !== spe2) {
        return spe2 - spe1; // 速度高的先动
    }
    
    // 同速随机
    return Math.random() < 0.5 ? -1 : 1;
}

// ========== 状态异常系统 (Status Conditions) ==========

const STATUS_CONDITIONS = {
    // 主要状态（互斥）
    par: { name: '麻痹', color: '#f1c40f', speedMod: 0.5, skipChance: 0.25 },
    brn: { name: '灼伤', color: '#e74c3c', atkMod: 0.5, dotPercent: 1/16 },
    psn: { name: '中毒', color: '#9b59b6', dotPercent: 1/8 },
    tox: { name: '剧毒', color: '#8e44ad', dotBase: 1/16, dotIncrement: true },
    slp: { name: '睡眠', color: '#95a5a6', skipChance: 1, duration: [1, 3] },
    frz: { name: '冰冻', color: '#3498db', skipChance: 1, thawChance: 0.2 }
};

/**
 * 尝试给目标施加状态异常
 * 【软编码】支持属性免疫、特性免疫、腐蚀特性、薄雾场地等
 * @param {Pokemon} target 目标
 * @param {string} status 状态ID (par/brn/psn/tox/slp/frz)
 * @param {Pokemon} source 来源（可选，用于腐蚀特性判定）
 * @param {object} battle 战斗对象（可选，用于场地判定）
 * @returns {object} { success, message }
 */
function tryInflictStatus(target, status, source = null, battle = null) {
    // 已有主要状态则无法施加
    if (target.status) {
        return { success: false, message: `${target.cnName} 已经处于异常状态!` };
    }
    
    const targetAbility = (target.ability || '').toLowerCase().replace(/[^a-z]/g, '');
    const sourceAbility = source ? (source.ability || '').toLowerCase().replace(/[^a-z]/g, '') : '';
    
    // === 【特性免疫检查】优先于属性免疫 ===
    
    // 【免疫 Immunity】完全免疫中毒
    if (targetAbility === 'immunity' && (status === 'psn' || status === 'tox')) {
        return { success: false, message: `${target.cnName} 的免疫特性阻止了中毒!` };
    }
    
    // 【粉彩护幕 Pastel Veil】免疫中毒
    if (targetAbility === 'pastelveil' && (status === 'psn' || status === 'tox')) {
        return { success: false, message: `${target.cnName} 的粉彩护幕阻止了中毒!` };
    }
    
    // 【洁净之盐 Purifying Salt】免疫所有异常状态
    if (targetAbility === 'purifyingsalt') {
        return { success: false, message: `${target.cnName} 的洁净之盐阻止了异常状态!` };
    }
    
    // 【绝对睡眠 Comatose】视为睡眠状态，无法被覆盖
    if (targetAbility === 'comatose') {
        return { success: false, message: `${target.cnName} 处于绝对睡眠状态，无法被影响!` };
    }
    
    // 【界限盾壳 Shields Down】HP > 50% 时免疫异常状态
    if (targetAbility === 'shieldsdown' && target.currHp > target.maxHp / 2) {
        return { success: false, message: `${target.cnName} 的界限盾壳阻止了异常状态!` };
    }
    
    // 【水幕 Water Veil】免疫灼伤
    if (targetAbility === 'waterveil' && status === 'brn') {
        return { success: false, message: `${target.cnName} 的水幕阻止了灼伤!` };
    }
    
    // 【熔岩铠甲 Magma Armor】免疫冰冻
    if (targetAbility === 'magmaarmor' && status === 'frz') {
        return { success: false, message: `${target.cnName} 的熔岩铠甲阻止了冰冻!` };
    }
    
    // 【柔软 Limber】免疫麻痹
    if (targetAbility === 'limber' && status === 'par') {
        return { success: false, message: `${target.cnName} 的柔软阻止了麻痹!` };
    }
    
    // 【不眠 Insomnia / 干劲 Vital Spirit】免疫睡眠
    if ((targetAbility === 'insomnia' || targetAbility === 'vitalspirit') && status === 'slp') {
        return { success: false, message: `${target.cnName} 无法入睡!` };
    }
    
    // 【吵闹 Uproar】场上有吵闹状态时，所有宝可梦无法入睡
    // 注意：只有当前在场的宝可梦有吵闹状态才生效，换人后吵闹状态会随宝可梦离场而消失
    if (status === 'slp') {
        const battleRef = battle || (typeof window !== 'undefined' ? window.battle : null);
        if (battleRef) {
            // 检查当前在场的玩家和敌方宝可梦是否有吵闹状态
            const playerPoke = battleRef.playerParty?.[battleRef.playerActive];
            const enemyPoke = battleRef.enemyParty?.[battleRef.enemyActive];
            // 只检查当前在场宝可梦的吵闹状态（volatile 状态会在换人时被清除）
            const playerHasUproar = playerPoke?.volatile?.uproar && playerPoke.currHp > 0;
            const enemyHasUproar = enemyPoke?.volatile?.uproar && enemyPoke.currHp > 0;
            if (playerHasUproar || enemyHasUproar) {
                return { success: false, message: `场上太吵了，${target.cnName} 无法入睡!` };
            }
        }
    }
    
    // 【叶子防守 Leaf Guard】大晴天时免疫异常状态
    // 【天气统一】标准值: sun, 极端值: harshsun
    if (targetAbility === 'leafguard') {
        const currentWeather = battle?.weather || (typeof window.battle !== 'undefined' ? window.battle.weather : null);
        const isSunny = currentWeather === 'sun' || currentWeather === 'harshsun';
        if (isSunny) {
            return { success: false, message: `${target.cnName} 的叶子防守在阳光下阻止了异常状态!` };
        }
    }

    // === 【场地免疫检查】===
    const currentTerrain = battle?.terrain || (typeof window.battle !== 'undefined' ? window.battle.terrain : null);
    // 检查是否在地面上（飞行系/飘浮不受场地影响）
    const isGrounded = !target.types?.includes('Flying') && targetAbility !== 'levitate';

    // 【电气场地 Electric Terrain】免疫睡眠
    if (currentTerrain === 'electricterrain' && status === 'slp' && isGrounded) {
        return { success: false, message: `电气场地保护了 ${target.cnName}，无法入睡!` };
    }

    // 【薄雾场地 Misty Terrain】免疫异常状态
    if (currentTerrain === 'mistyterrain' && isGrounded) {
        return { success: false, message: `薄雾场地保护了 ${target.cnName}，无法陷入异常状态!` };
    }

    // === 【神秘守护 Safeguard】检查 ===
    const battleRef2 = battle || (typeof window !== 'undefined' ? window.battle : null);
    if (battleRef2) {
        // 判断目标属于哪一方
        const isTargetPlayer = battleRef2.playerParty && battleRef2.playerParty.includes(target);
        const targetSide = isTargetPlayer ? battleRef2.playerSide : battleRef2.enemySide;
        if (targetSide && targetSide.safeguard > 0) {
            return { success: false, message: `神秘守护保护了 ${target.cnName}，无法陷入异常状态!` };
        }
    }

    // === 【属性免疫检查】===
    const immunities = {
        par: ['Electric'], // 电系免疫麻痹
        brn: ['Fire'],     // 火系免疫灼伤
        psn: ['Poison', 'Steel'], // 毒/钢系免疫中毒
        tox: ['Poison', 'Steel'],
        frz: ['Ice']       // 冰系免疫冰冻
    };
    
    // 【腐蚀 Corrosion】可以让钢/毒系中毒
    const hasCorrosion = sourceAbility === 'corrosion';
    
    if (immunities[status] && target.types) {
        for (const type of target.types) {
            if (immunities[status].includes(type)) {
                // 腐蚀特性可以无视毒/钢系对中毒的免疫
                if (hasCorrosion && (status === 'psn' || status === 'tox') && (type === 'Poison' || type === 'Steel')) {
                    console.log(`[CORROSION] ${source?.cnName} 的腐蚀特性无视了 ${target.cnName} 的${type}属性免疫!`);
                    continue; // 跳过这个免疫检查
                }
                return { success: false, message: `${target.cnName} 的${type}属性免疫了该状态!` };
            }
        }
    }
    
    // 施加状态
    target.status = status;
    target.statusTurns = 0;
    
    // 播放状态异常音效 + VFX
    const STATUS_SFX_MAP = { brn: 'BRN', frz: 'FRZ', par: 'PAR', psn: 'PSN', tox: 'TOX', slp: 'SLP' };
    if (STATUS_SFX_MAP[status] && typeof window !== 'undefined') {
        if (typeof window.playSFX === 'function') window.playSFX(STATUS_SFX_MAP[status]);
        if (typeof window.BattleVFX !== 'undefined') {
            const b = window.battle;
            const isTargetPlayer = b && b.playerParty && b.playerParty.includes(target);
            const spriteId = isTargetPlayer ? 'player-sprite' : 'enemy-sprite';
            window.BattleVFX.triggerStatusVFX(STATUS_SFX_MAP[status], spriteId);
        }
    }
    
    const statusInfo = STATUS_CONDITIONS[status];
    let message = `${target.cnName} ${statusInfo.name}了!`;
    
    // 腐蚀特性的特殊提示
    if (hasCorrosion && (status === 'psn' || status === 'tox')) {
        message = `${source?.cnName} 的腐蚀特性让 ${target.cnName} 中毒了!`;
    }
    
    // 【修复】立即检查状态治愈树果（零余果/桃桃果/木子果等）
    if (typeof ItemEffects !== 'undefined' && ItemEffects.checkStatusBerry) {
        const berryLogs = [];
        const triggered = ItemEffects.checkStatusBerry(target, berryLogs);
        if (triggered && berryLogs.length > 0) {
            message += ' ' + berryLogs.join(' ');
        }
    }
    
    return { success: true, message };
}

/**
 * 处理回合开始时的状态效果
 * @param {Pokemon} pokemon 
 * @returns {object} { canMove, damage, message }
 */
function processStatusEffects(pokemon) {
    if (!pokemon.status) {
        return { canMove: true, damage: 0, message: null };
    }
    
    const status = pokemon.status;
    const info = STATUS_CONDITIONS[status];
    let result = { canMove: true, damage: 0, message: null };
    
    switch (status) {
        case 'par':
            // 25% 概率无法行动
            if (Math.random() < info.skipChance) {
                result.canMove = false;
                result.message = `${pokemon.cnName} 因麻痹而无法行动!`;
            }
            break;
            
        case 'slp':
            // 【Early Bird 早起】睡眠回合消耗加倍
            const pokeAbility = (pokemon.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const hasEarlyBird = pokeAbility === 'earlybird';
            const sleepIncrement = hasEarlyBird ? 2 : 1;
            pokemon.statusTurns += sleepIncrement;
            
            const sleepDuration = pokemon.sleepDuration || (Math.floor(Math.random() * 3) + 1);
            pokemon.sleepDuration = sleepDuration;
            
            if (pokemon.statusTurns >= sleepDuration) {
                pokemon.status = null;
                pokemon.statusTurns = 0;
                pokemon.sleepDuration = 0;
                result.message = hasEarlyBird 
                    ? `${pokemon.cnName} 的早起让它快速醒来了!`
                    : `${pokemon.cnName} 醒来了!`;
            } else {
                result.canMove = false;
                result.message = `${pokemon.cnName} 正在睡觉...`;
            }
            break;
            
        case 'frz':
            // 20% 概率解冻
            if (Math.random() < info.thawChance) {
                pokemon.status = null;
                result.message = `${pokemon.cnName} 解冻了!`;
            } else {
                result.canMove = false;
                result.message = `${pokemon.cnName} 被冻住了!`;
            }
            break;
    }
    
    return result;
}

/**
 * 处理回合结束时的状态伤害
 * 【软编码】支持毒疗、魔法防守等特性
 * @param {Pokemon} pokemon 
 * @returns {object} { damage, message, healed }
 */
function processStatusDamage(pokemon) {
    if (!pokemon.status) {
        return { damage: 0, message: null, healed: false };
    }
    
    const status = pokemon.status;
    const abilityId = (pokemon.ability || '').toLowerCase().replace(/[^a-z]/g, '');
    let damage = 0;
    let message = null;
    
    // === 【毒疗 Poison Heal】特性处理 ===
    // 中毒/剧毒时回复 1/8 HP 而非受伤
    if (abilityId === 'poisonheal' && (status === 'psn' || status === 'tox')) {
        const healAmount = Math.max(1, Math.floor(pokemon.maxHp / 8));
        if (typeof pokemon.heal === 'function') {
            pokemon.heal(healAmount);
        } else {
            pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + healAmount);
        }
        return { 
            damage: 0, 
            message: `<span style="color:#4cd137">💚 ${pokemon.cnName} 的毒疗特性发动，回复了 ${healAmount} 点体力!</span>`,
            healed: true
        };
    }
    
    // === 【魔法防守 Magic Guard】特性处理 ===
    // 免疫所有非直接攻击伤害（包括状态伤害）
    if (abilityId === 'magicguard') {
        return { damage: 0, message: null, healed: false };
    }
    
    let vfxType = null;
    switch (status) {
        case 'brn':
            // 【根性 Guts / 毅力】不减少灼伤伤害，但提升攻击
            damage = Math.max(1, Math.floor(pokemon.maxHp / 16));
            pokemon.takeDamage(damage);
            message = `${pokemon.cnName} 因灼伤受到了 ${damage} 点伤害!`;
            vfxType = 'BRN';
            break;
            
        case 'psn':
            damage = Math.max(1, Math.floor(pokemon.maxHp / 8));
            pokemon.takeDamage(damage);
            message = `${pokemon.cnName} 因中毒受到了 ${damage} 点伤害!`;
            vfxType = 'PSN';
            break;
            
        case 'tox':
            pokemon.statusTurns = (pokemon.statusTurns || 0) + 1;
            damage = Math.max(1, Math.floor(pokemon.maxHp * pokemon.statusTurns / 16));
            pokemon.takeDamage(damage);
            message = `${pokemon.cnName} 因剧毒受到了 ${damage} 点伤害!`;
            vfxType = 'TOX';
            break;
    }
    
    // 播放状态伤害 VFX
    if (vfxType && typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
        const b = window.battle;
        const isPlayer = b && b.playerParty && b.playerParty.includes(pokemon);
        window.BattleVFX.triggerStatusVFX(vfxType, isPlayer ? 'player-sprite' : 'enemy-sprite');
    }
    
    return { damage, message, healed: false };
}

// ========== 技能附加状态效果 ==========

/**
 * 处理技能的状态异常附加效果
 * @param {Pokemon} user 攻击方
 * @param {Pokemon} target 防御方
 * @param {object} move 技能数据
 * @returns {Array} 日志消息数组
 */
function processMoveStatusEffects(user, target, move) {
    const logs = [];
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // === 【粉末类招式免疫检查】===
    const powderMoves = ['spore', 'sleeppowder', 'poisonpowder', 'stunspore', 'ragepowder', 'cottonspore', 'powder'];
    if (powderMoves.includes(moveId)) {
        // 草系免疫
        if (target.types && target.types.includes('Grass')) {
            logs.push(`${target.cnName} 的草属性免疫了粉末类招式!`);
            return logs;
        }
        // 防尘护目镜免疫
        const targetItem = (target.item || '').toLowerCase().replace(/[^a-z]/g, '');
        if (targetItem === 'safetygoggles') {
            logs.push(`${target.cnName} 的防尘护目镜免疫了粉末类招式!`);
            return logs;
        }
        // 防尘特性免疫
        const targetAbility = (target.ability || '').toLowerCase().replace(/[^a-z]/g, '');
        if (targetAbility === 'overcoat') {
            logs.push(`${target.cnName} 的防尘特性免疫了粉末类招式!`);
            return logs;
        }
    }
    
    // === 【草系免疫寄生种子】===
    if (moveId === 'leechseed' && target.types && target.types.includes('Grass')) {
        logs.push(`${target.cnName} 的草属性免疫了寄生种子!`);
        return logs;
    }
    
    // 检查 secondary 中的状态效果
    if (fullMoveData.secondary && fullMoveData.secondary.status) {
        const chance = fullMoveData.secondary.chance || 100;
        if (Math.random() * 100 < chance) {
            const result = tryInflictStatus(target, fullMoveData.secondary.status);
            if (result.message) logs.push(result.message);
        }
    }
    
    // 检查必定触发的状态效果
    // 【BUG修复】粉末类招式的草系免疫检查已在上方（第464-484行）处理
    // 如果代码执行到这里，说明已经通过了免疫检查，可以安全施加状态
    if (fullMoveData.status) {
        const result = tryInflictStatus(target, fullMoveData.status);
        if (result.message) logs.push(result.message);
    }
    
    // 硬编码常见状态技能
    const statusMoves = {
        'Thunder Wave': { status: 'par', chance: 100 },
        'Stun Spore': { status: 'par', chance: 100 },
        'Glare': { status: 'par', chance: 100 },
        'Nuzzle': { status: 'par', chance: 100 },
        'Will-O-Wisp': { status: 'brn', chance: 100 },
        'Toxic': { status: 'tox', chance: 100 },
        'Poison Powder': { status: 'psn', chance: 100 },
        'Poison Gas': { status: 'psn', chance: 100 },
        'Spore': { status: 'slp', chance: 100 },
        'Sleep Powder': { status: 'slp', chance: 75 },
        'Hypnosis': { status: 'slp', chance: 60 },
        'Sing': { status: 'slp', chance: 55 },
        // 攻击技能附带效果
        'Thunderbolt': { status: 'par', chance: 10 },
        'Thunder': { status: 'par', chance: 30 },
        'Discharge': { status: 'par', chance: 30 },
        'Body Slam': { status: 'par', chance: 30 },
        'Flamethrower': { status: 'brn', chance: 10 },
        'Fire Blast': { status: 'brn', chance: 10 },
        'Scald': { status: 'brn', chance: 30 },
        'Lava Plume': { status: 'brn', chance: 30 },
        'Ice Beam': { status: 'frz', chance: 10 },
        'Blizzard': { status: 'frz', chance: 10 },
        'Sludge Bomb': { status: 'psn', chance: 30 },
        'Poison Jab': { status: 'psn', chance: 30 }
    };
    
    if (statusMoves[move.name] && !fullMoveData.secondary?.status) {
        const { status, chance } = statusMoves[move.name];
        if (Math.random() * 100 < chance) {
            const result = tryInflictStatus(target, status);
            if (result.success && result.message) logs.push(result.message);
        }
    }
    
    return logs;
}

// ========== 固定伤害技能 ==========

/**
 * 检查并计算固定伤害技能
 * @param {Pokemon} attacker 
 * @param {Pokemon} defender 
 * @param {object} move 
 * @returns {object|null} { damage, message } 或 null（非固定伤害技能）
 */
function checkFixedDamageMove(attacker, defender, move) {
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // damage 字段表示固定伤害
    if (fullMoveData.damage) {
        if (fullMoveData.damage === 'level') {
            return { damage: attacker.level, message: null };
        }
        if (typeof fullMoveData.damage === 'number') {
            return { damage: fullMoveData.damage, message: null };
        }
    }
    
    // 特殊固定伤害技能
    const fixedDamageMoves = {
        'Sonic Boom': 20,
        'Dragon Rage': 40,
        'Seismic Toss': 'level',
        'Night Shade': 'level',
        'Psywave': 'random', // 0.5x ~ 1.5x level
        'Super Fang': 'half', // 当前HP的一半
        'Nature\'s Madness': 'half',
        'Guardian of Alola': 'threequarters',
        'Ruination': 'half', // 【新增】大灾难 - 古鼎鹿/古剑豹/古简蜗/古镜鱼专属
        'Endeavor': 'endeavor' // 将对方HP降到与自己相同
    };
    
    const fixedType = fixedDamageMoves[move.name];
    if (!fixedType) return null;
    
    let damage = 0;
    switch (fixedType) {
        case 'level':
            damage = attacker.level;
            break;
        case 'random':
            damage = Math.floor(attacker.level * (0.5 + Math.random()));
            break;
        case 'half':
            damage = Math.floor(defender.currHp / 2);
            break;
        case 'threequarters':
            damage = Math.floor(defender.currHp * 3 / 4);
            break;
        case 'endeavor':
            damage = Math.max(0, defender.currHp - attacker.currHp);
            break;
        default:
            if (typeof fixedType === 'number') {
                damage = fixedType;
            }
    }
    
    return { damage: Math.max(1, damage), message: null };
}

// ========== 一击必杀技能 (OHKO) ==========

/**
 * 检查一击必杀技能
 * @param {Pokemon} attacker 
 * @param {Pokemon} defender 
 * @param {object} move 
 * @returns {object|null} { success, damage, message } 或 null
 */
function checkOHKOMove(attacker, defender, move) {
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // ohko 字段标记一击必杀
    if (!fullMoveData.ohko) {
        const ohkoMoves = ['Fissure', 'Horn Drill', 'Guillotine', 'Sheer Cold'];
        if (!ohkoMoves.includes(move.name)) return null;
    }

    // 属性免疫仍然生效：地裂打不到飞行/飘浮，角钻/断头台打不到幽灵。
    let defensiveTypes = defender.types || ['Normal'];
    if (defender.isTerastallized) {
        defensiveTypes = defender.teraType === 'Stellar'
            ? (defender.originalTypes || defender.types || ['Normal'])
            : [defender.teraType];
    }

    const moveType = move.type || fullMoveData.type || 'Normal';
    if (typeof getTypeEffectiveness === 'function' && getTypeEffectiveness(moveType, defensiveTypes, move.name) === 0) {
        return { success: false, damage: 0, noEffect: true, message: null };
    }

    // Sheer Cold 的 ohko: 'Ice' 表示冰属性目标免疫。
    if (typeof fullMoveData.ohko === 'string' && defensiveTypes.includes(fullMoveData.ohko)) {
        return { success: false, damage: 0, noEffect: true, message: null };
    }
    
    // 等级低于对方则无效
    if (attacker.level < defender.level) {
        return { success: false, damage: 0, message: `${defender.cnName} 的等级太高了!` };
    }
    
    // 命中率 = 30 + (攻击方等级 - 防御方等级)
    const hitChance = 30 + (attacker.level - defender.level);
    
    if (Math.random() * 100 < hitChance) {
        return { 
            success: true, 
            damage: defender.currHp, 
            message: `一击必杀!` 
        };
    } else {
        return { success: false, damage: 0, message: null };
    }
}

// ========== 天气系统 (Weather) ==========
// 【重构】天气逻辑已迁移到 engine/weather-effects.js
// 此处保留兼容性包装函数，调用新模块

// 兼容性：从 weather-effects.js 获取配置
const WEATHER_TYPES = (typeof window !== 'undefined' && window.WeatherEffects) 
    ? window.WeatherEffects.WEATHER_CONFIG 
    : {};

/**
 * 获取天气对技能威力的修正（兼容性包装）
 * @param {string} weather 当前天气
 * @param {string} moveType 技能属性
 * @param {string} moveName 技能名称（用于特例判断）
 * @returns {{ modifier: number, log: string|null }} 威力倍率和日志
 */
function getWeatherModifier(weather, moveType, moveName = '') {
    // 调用 weather-effects.js 模块
    if (typeof window !== 'undefined' && window.WeatherEffects) {
        return window.WeatherEffects.getWeatherPowerModifier(weather, moveType, moveName);
    }
    // Fallback: 无修正
    return { modifier: 1, log: null };
}

/**
 * 获取天气对命中率的修正（兼容性包装）
 * @param {string} weather 当前天气
 * @param {string} moveName 技能名称
 * @returns {{ accuracy: number|null, log: string|null }} 修正后的命中率（null表示不修改）
 */
function getWeatherAccuracyModifier(weather, moveName) {
    // 调用 weather-effects.js 模块
    if (typeof window !== 'undefined' && window.WeatherEffects) {
        return window.WeatherEffects.getWeatherAccuracyModifier(weather, moveName);
    }
    // Fallback: 无修正
    return { accuracy: null, log: null };
}

/**
 * 获取天气对防御的加成（兼容性包装）
 * @param {string} weather 当前天气
 * @param {Array} defenderTypes 防御方属性
 * @param {boolean} isSpecial 是否特殊攻击
 * @returns {{ multiplier: number, log: string|null }} 防御倍率
 */
function getWeatherDefenseBoost(weather, defenderTypes, isSpecial) {
    // 调用 weather-effects.js 模块
    if (typeof window !== 'undefined' && window.WeatherEffects) {
        return window.WeatherEffects.getWeatherDefenseBoost(weather, defenderTypes, isSpecial);
    }
    // Fallback: 无修正
    return { multiplier: 1, log: null };
}

// ========== 场地系统 (Terrain) ==========

const TERRAIN_TYPES = {
    electricterrain: { name: '电气场地', boost: 'Electric', preventSleep: true },
    grassyterrain: { name: '青草场地', boost: 'Grass', healPercent: 1/16 },
    psychicterrain: { name: '精神场地', boost: 'Psychic', blockPriority: true },
    mistyterrain: { name: '薄雾场地', dragonNerf: 0.5, preventStatus: true }
};

/**
 * 获取场地对技能威力的修正
 * @param {string} terrain 当前场地
 * @param {string} moveType 技能属性
 * @param {boolean} isGrounded 是否接地
 * @returns {number} 威力倍率
 */
function getTerrainModifier(terrain, moveType, isGrounded = true) {
    if (!terrain || !isGrounded || !TERRAIN_TYPES[terrain]) return 1;
    
    const t = TERRAIN_TYPES[terrain];
    
    if (t.boost === moveType) return 1.3;
    if (moveType === 'Dragon' && t.dragonNerf) return t.dragonNerf;
    
    return 1;
}

// ========== 技能标记系统 (Flags) ==========

/**
 * 检查技能是否有特定标记
 * @param {object} move 
 * @param {string} flag 标记名
 * @returns {boolean}
 */
function hasMoveFlag(move, flag) {
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    return !!(fullMoveData.flags && fullMoveData.flags[flag]);
}

// 常用标记说明
const MOVE_FLAGS = {
    contact: '接触类技能，触发接触特性（如铁刺、静电）',
    protect: '可被守住类技能挡下',
    mirror: '可被魔法反射反弹',
    sound: '声音类技能，穿透替身',
    punch: '拳类技能，铁拳特性加成',
    bite: '咬类技能，强壮之颚特性加成',
    bullet: '子弹/球类技能，防弹特性免疫',
    pulse: '波动类技能，超级发射器特性加成',
    slicing: '斩切类技能，锋锐特性加成',
    wind: '风类技能，风力发电特性触发'
};

/**
 * 检查技能是否为接触类
 */
function isContactMove(move) {
    return hasMoveFlag(move, 'contact');
}

/**
 * 检查技能是否可被守住
 */
function isProtectable(move) {
    return hasMoveFlag(move, 'protect');
}

/**
 * 检查技能是否为声音类
 */
function isSoundMove(move) {
    return hasMoveFlag(move, 'sound');
}

// ========== 场地钉子系统 (Entry Hazards) ==========

/**
 * 处理场地状态技能 (sideCondition)
 * 包括：隐形岩、撒菱、毒菱、黏黏网、顺风、双墙等
 * @param {Pokemon} user 使用者
 * @param {object} move 技能数据
 * @param {object} battle 战斗实例
 * @returns {Array} 日志消息数组
 */
function applySideCondition(user, move, battle, overrideCondition = null, overrideTarget = null) {
    const logs = [];
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    const conditionId = overrideCondition || fullMoveData.sideCondition;
    if (!conditionId) return logs;
    
    const target = overrideTarget || fullMoveData.target || 'foeSide';
    
    // 判断施法者是否为玩家
    const isPlayerUser = battle && battle.getPlayer && (user === battle.getPlayer());
    
    // 获取受影响的场地（完全基于 target 字段，无硬编码）
    let targetSide = null;
    let sideNameCN = "我方";
    
    if (target === 'foeSide') {
        targetSide = isPlayerUser ? battle.enemySide : battle.playerSide;
        sideNameCN = isPlayerUser ? "敌方" : "我方";
    } else if (target === 'allySide' || target === 'self') {
        targetSide = isPlayerUser ? battle.playerSide : battle.enemySide;
        sideNameCN = isPlayerUser ? "我方" : "敌方";
    }
    
    if (!targetSide) return logs;
    
    // === 场地状态配置（数据驱动，易于扩展） ===
    const SIDE_CONDITION_CONFIG = {
        // 可叠加的钉子
        'spikes': {
            type: 'stackable',
            maxLayers: 3,
            key: 'spikes',
            messages: {
                success: (layers) => `撒菱散布在${sideNameCN}场地上! (当前${layers}层)`,
                failed: () => `但是没什么效果... (已经撒不下了)`
            }
        },
        'toxicspikes': {
            type: 'stackable',
            maxLayers: 2,
            key: 'toxicspikes',
            altKey: 'toxicSpikes', // 支持驼峰命名
            messages: {
                success: () => `毒菱散布在${sideNameCN}场地上!`,
                failed: () => `但是没什么效果... (已经撒不下了)`
            }
        },
        // 布尔型钉子
        'stealthrock': {
            type: 'boolean',
            key: 'stealthRock',
            messages: {
                success: () => `尖锐的岩石悬浮在${sideNameCN}场地上!`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        'stickyweb': {
            type: 'boolean',
            key: 'stickyWeb',
            messages: {
                success: () => `黏黏网铺设在${sideNameCN}场地上!`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        // 有时限的场地状态
        'tailwind': {
            type: 'timed',
            duration: 4, // 实际是5回合（设置后立即-1）
            key: 'tailwind',
            messages: {
                success: () => `${sideNameCN}刮起了顺风!`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        // 壁/屏障 (Screens) - 支持光之黏土延长
        'reflect': {
            type: 'timed',
            duration: 5,
            screenExtend: true, // 光之黏土可延长到8回合
            key: 'reflect',
            messages: {
                success: () => `<b style="color:#f97316">🛡️ ${sideNameCN}建起了反射壁！</b>`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        'lightscreen': {
            type: 'timed',
            duration: 5,
            screenExtend: true,
            key: 'lightScreen',
            messages: {
                success: () => `<b style="color:#facc15">✨ ${sideNameCN}建起了光墙！</b>`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        'auroraveil': {
            type: 'timed',
            duration: 5,
            screenExtend: true,
            key: 'auroraVeil',
            messages: {
                success: () => `<b style="color:#22d3ee">❄️ ${sideNameCN}展开了极光幕！</b>`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        // 神秘守护：5回合内免受异常状态
        'safeguard': {
            type: 'timed',
            duration: 5,
            key: 'safeguard',
            messages: {
                success: () => `<b style="color:#22c55e">✨ ${sideNameCN}被神秘的力量守护了！</b>`,
                failed: () => `但是失败了! (已经存在)`
            }
        },
        // 白雾：5回合内己方能力不能被降低
        'mist': {
            type: 'timed',
            duration: 5,
            key: 'mist',
            messages: {
                success: () => `<b style="color:#93c5fd">🌫️ ${sideNameCN}被白雾笼罩了！</b>`,
                failed: () => `但是失败了! (已经存在)`
            }
        }
    };
    
    const config = SIDE_CONDITION_CONFIG[conditionId];
    if (!config) {
        // 未配置的 sideCondition，使用通用处理
        console.warn(`[SIDE CONDITION] 未配置的场地状态: ${conditionId}`);
        return logs;
    }
    
    // 根据类型处理
    if (config.type === 'stackable') {
        // 可叠加类型
        const key = config.key;
        const altKey = config.altKey;
        if (!targetSide[key]) targetSide[key] = 0;
        if (altKey && !targetSide[altKey]) targetSide[altKey] = 0;
        
        const currentLayers = targetSide[key] || targetSide[altKey] || 0;
        if (currentLayers < config.maxLayers) {
            targetSide[key] = currentLayers + 1;
            if (altKey) targetSide[altKey] = currentLayers + 1;
            logs.push(config.messages.success(currentLayers + 1));
        } else {
            logs.push(config.messages.failed());
        }
    } else if (config.type === 'boolean') {
        // 布尔类型
        const key = config.key;
        if (!targetSide[key]) {
            targetSide[key] = true;
            logs.push(config.messages.success());
        } else {
            logs.push(config.messages.failed());
        }
    } else if (config.type === 'timed') {
        // 有时限类型
        const key = config.key;
        if (!targetSide[key] || targetSide[key] <= 0) {
            // 计算持续回合数
            let duration = config.duration;
            // 光之黏土 (Light Clay) 延长壁/屏障到 8 回合
            if (config.screenExtend && user) {
                const screenDuration = (typeof ItemEffects !== 'undefined' && ItemEffects.getScreenDuration) 
                    ? ItemEffects.getScreenDuration(user) 
                    : ((user.item || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes('lightclay') ? 8 : 5);
                duration = screenDuration;
            }
            targetSide[key] = duration;
            logs.push(config.messages.success());
        } else {
            logs.push(config.messages.failed());
        }
    }
    
    return logs;
}

/**
 * 宝可梦上场时结算场地钉子伤害
 * @param {Pokemon} pokemon 上场的宝可梦
 * @param {boolean} isPlayer 是否为玩家方
 * @param {object} battle 战斗实例
 * @returns {Array} 日志消息数组
 */
function applyEntryHazards(pokemon, isPlayer, battle) {
    const logs = [];
    if (!pokemon || !battle) return logs;
    
    // 【厚底靴 (Heavy-Duty Boots)】免疫所有入场危害
    const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z]/g, '');
    if (itemId === 'heavydutyboots') {
        console.log(`[Heavy-Duty Boots] ${pokemon.name} 的厚底靴保护了它免受入场危害！`);
        // 可选：不输出日志，静默免疫
        // logs.push(`${pokemon.cnName} 的厚底靴保护了它免受陷阱伤害！`);
        return logs;
    }
    
    // 获取对应的场地状态
    const side = isPlayer ? battle.playerSide : battle.enemySide;
    if (!side) return logs;
    
    const types = pokemon.types || [];
    const isFlying = types.includes('Flying');
    const hasLevitate = (pokemon.ability || '').toLowerCase() === 'levitate';
    const isGrounded = !isFlying && !hasLevitate;
    const isPoison = types.includes('Poison');
    const isSteel = types.includes('Steel');
    
    // === 隐形岩 (Stealth Rock) ===
    // 岩石系伤害，根据属性克制计算
    if (side.stealthRock) {
        let effectiveness = 1;
        const rockChart = { 
            weak: ['Fire', 'Ice', 'Flying', 'Bug'], 
            resist: ['Fighting', 'Ground', 'Steel'] 
        };
        
        for (const type of types) {
            if (rockChart.weak.includes(type)) effectiveness *= 2;
            if (rockChart.resist.includes(type)) effectiveness *= 0.5;
        }
        
        const damage = Math.max(1, Math.floor(pokemon.maxHp * effectiveness / 8));
        pokemon.takeDamage(damage);
        logs.push(`尖锐的岩石扎进了 ${pokemon.cnName}! (-${damage})`);
    }
    
    // === 撒菱 (Spikes) ===
    // 地面系伤害，飞行/漂浮免疫
    if (side.spikes && side.spikes > 0 && isGrounded) {
        const layers = side.spikes;
        const damagePercent = [0, 1/8, 1/6, 1/4][layers] || 1/4;
        const damage = Math.max(1, Math.floor(pokemon.maxHp * damagePercent));
        pokemon.takeDamage(damage);
        logs.push(`${pokemon.cnName} 被撒菱扎伤了! (-${damage})`);
    }
    
    // === 毒菱 (Toxic Spikes) ===
    // 毒系宝可梦踩上去会清除，飞行/漂浮免疫
    // 【规范】统一使用驼峰命名 toxicSpikes，兼容读取小写
    const toxicLayers = side.toxicSpikes || side.toxicspikes || 0;
    if (toxicLayers > 0 && isGrounded) {
        if (isPoison) {
            // 毒系宝可梦清除毒菱
            side.toxicSpikes = 0;
            delete side.toxicspikes; // 清理旧格式
            logs.push(`${pokemon.cnName} 吸收了毒菱!`);
        } else if (!isSteel && !pokemon.status) {
            // 钢系免疫中毒
            if (toxicLayers >= 2) {
                pokemon.status = 'tox';
                logs.push(`${pokemon.cnName} 中了剧毒!`);
            } else {
                pokemon.status = 'psn';
                logs.push(`${pokemon.cnName} 中毒了!`);
            }
        }
    }
    
    // === 黏黏网 (Sticky Web) ===
    // 速度-1，飞行/漂浮免疫
    if (side.stickyWeb && isGrounded) {
        if (typeof pokemon.applyBoost === 'function') {
            pokemon.applyBoost('spe', -1);
            logs.push(`${pokemon.cnName} 被黏黏网缠住了! 速度下降!`);
            if (typeof window.playSFX === 'function') window.playSFX('STAT_DOWN');
        }
    }
    
    // === 【BUG修复】G-Max Steelsurge (钢之撒菱) ===
    // 钢系伤害，根据属性克制计算（与隐形岩类似，但是钢系）
    if (side.gmaxSteelsurge) {
        let steelEff = 1;
        const steelChart = {
            weak: ['Ice', 'Rock', 'Fairy'],
            resist: ['Fire', 'Water', 'Electric', 'Steel']
        };
        // 钢系免疫：无（没有属性免疫钢系）
        
        for (const type of types) {
            if (steelChart.weak.includes(type)) steelEff *= 2;
            if (steelChart.resist.includes(type)) steelEff *= 0.5;
        }
        
        const steelDmg = Math.max(1, Math.floor(pokemon.maxHp * steelEff / 8));
        pokemon.takeDamage(steelDmg);
        logs.push(`尖锐的钢刺扎进了 ${pokemon.cnName}! (-${steelDmg})`);
    }
    
    return logs;
}

/**
 * 清除场地钉子（高速旋转、清除浓雾）
 * @param {boolean} isPlayer 清除哪一方的场地
 * @param {object} battle 战斗实例
 * @returns {Array} 日志消息数组
 */
function clearEntryHazards(isPlayer, battle) {
    const logs = [];
    if (!battle) return logs;
    
    const side = isPlayer ? battle.playerSide : battle.enemySide;
    if (!side) return logs;
    
    let cleared = false;
    
    if (side.stealthRock) {
        side.stealthRock = false;
        cleared = true;
    }
    if (side.spikes) {
        side.spikes = 0;
        cleared = true;
    }
    if (side.toxicSpikes || side.toxicspikes) {
        side.toxicSpikes = 0;
        delete side.toxicspikes; // 清理旧格式
        cleared = true;
    }
    if (side.stickyWeb) {
        side.stickyWeb = false;
        cleared = true;
    }
    // 【BUG修复】清除 G-Max Steelsurge (钢之撒菱)
    if (side.gmaxSteelsurge) {
        side.gmaxSteelsurge = false;
        cleared = true;
    }
    
    if (cleared) {
        logs.push(`场地上的障碍物被清除了!`);
    }
    
    return logs;
}

// ========== Volatile 状态系统 (Taunt, Substitute 等) ==========

/**
 * 【精神香草 Mental Herb】检查并解除控制状态
 * @param {Pokemon} pokemon - 宝可梦
 * @param {string} condition - 被施加的状态 (taunt/encore/torment/healblock/disable/attract)
 * @param {Array} logs - 日志数组
 * @returns {boolean} 是否触发并解除状态
 */
function checkMentalHerb(pokemon, condition, logs) {
    if (!pokemon.item) return false;
    
    const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (itemId !== 'mentalherb' && pokemon.item !== '精神香草') return false;
    
    const cures = ['taunt', 'encore', 'torment', 'healblock', 'disable', 'attract'];
    if (!cures.includes(condition)) return false;
    
    // 解除状态
    if (pokemon.volatile) {
        if (condition === 'encore') {
            pokemon.volatile.encore = 0;
            pokemon.volatile.encoreMove = null;
        } else if (condition === 'disable') {
            pokemon.volatile.disable = 0;
            pokemon.volatile.disabledMove = null;
        } else if (condition === 'attract') {
            pokemon.volatile.attract = false;
        } else if (condition === 'torment') {
            pokemon.volatile.torment = false;
        } else {
            pokemon.volatile[condition] = 0;
        }
    }
    
    const conditionNames = {
        taunt: '挑衅', encore: '再来一次', torment: '无理取闹',
        healblock: '回复封锁', disable: '定身法', attract: '着迷'
    };
    
    // 消耗道具
    pokemon.item = null;
    logs.push(`<b style="color:#9b59b6">🌿 ${pokemon.cnName} 的精神香草生效了！解除了${conditionNames[condition] || condition}！</b>`);
    console.log(`[MENTAL HERB] ${pokemon.cnName} 消耗了精神香草，解除了 ${condition}`);
    if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('ITEM_USE');
    return true;
}

/**
 * 处理 Volatile 状态技能
 * @param {Pokemon} user 使用者
 * @param {Pokemon} target 目标
 * @param {object} move 技能数据
 * @returns {object} { success, logs }
 */
function applyVolatileStatus(user, target, move) {
    const logs = [];
    const moveName = move.name || '';
    
    // 初始化 volatile 对象
    if (!target.volatile) target.volatile = {};
    if (!user.volatile) user.volatile = {};
    
    // 【Soft-Coded】通用 volatileStatus 重复检查
    const moveId = moveName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    if (fullMoveData.volatileStatus && fullMoveData.target === 'self') {
        const volatileKey = fullMoveData.volatileStatus;
        
        // =========================================================
        // Volatile 状态分类：
        // 
        // 【可叠加】由 move-handlers.js 处理层数逻辑，跳过通用检查：
        //   - stockpile: 蓄力（最多3层）
        // 
        // 【刷新型】重复使用会刷新回合数/效果，不应失败：
        //   - charge: 充电（下回合电系威力翻倍）
        //   - laserfocus: 磨砺（下回合必定暴击）
        //   - defensecurl: 变圆（滚动/冰球威力翻倍）
        // 
        // 【不可叠加】重复使用应该失败：
        //   - aquaring, ingrain, focusenergy, substitute, 
        //   - protect, endure, destinybond, imprison, etc.
        // =========================================================
        
        // 可叠加的状态：由 handler 处理
        const stackableVolatiles = ['stockpile'];
        
        // 刷新型状态：重复使用会刷新效果，不应失败
        const refreshableVolatiles = ['charge', 'laserfocus', 'defensecurl'];
        
        if (stackableVolatiles.includes(volatileKey)) {
            // 交给 handler 处理层数逻辑
        } else if (refreshableVolatiles.includes(volatileKey)) {
            // 刷新型：允许重复使用，会刷新效果
        } else if (user.volatile[volatileKey]) {
            // 不可叠加：已有状态则失败
            logs.push(`但是失败了! (${user.cnName} 已经处于该状态)`);
            return { success: false, logs };
        }
    }
    
    switch (moveName) {
        case 'Taunt':
            // 挑衅：3回合内无法使用变化技
            if (target.volatile.taunt && target.volatile.taunt > 0) {
                logs.push(`但是失败了! (${target.cnName} 已经处于挑衅状态)`);
                return { success: false, logs };
            }
            target.volatile.taunt = 3;
            logs.push(`${target.cnName} 陷入了挑衅状态!`);
            // 【精神香草】检查
            if (checkMentalHerb(target, 'taunt', logs)) {
                return { success: true, logs }; // 状态被立即解除
            }
            return { success: true, logs };
            
        case 'Substitute':
            // 替身：消耗 1/4 HP 生成护盾
            const subHp = Math.floor(user.maxHp / 4);
            if (user.currHp <= subHp) {
                logs.push(`但是失败了! (HP 不足以制造替身)`);
                return { success: false, logs };
            }
            if (user.volatile.substitute && user.volatile.substitute > 0) {
                logs.push(`但是失败了! (已经有替身了)`);
                return { success: false, logs };
            }
            user.currHp -= subHp;
            user.volatile.substitute = subHp;
            logs.push(`${user.cnName} 制造了一个替身! (消耗 ${subHp} HP)`);
            return { success: true, logs };
            
        case 'Encore':
            // 再来一次：强制使用上一个技能
            const encoreMoveName = target.lastBaseMoveUsed || target.lastMoveUsed;
            if (!encoreMoveName) {
                logs.push(`但是失败了!`);
                return { success: false, logs };
            }
            target.volatile.encore = 3;
            target.volatile.encoreMove = encoreMoveName;
            logs.push(`${target.cnName} 被强制再来一次!`);
            // 【精神香草】检查
            if (checkMentalHerb(target, 'encore', logs)) {
                return { success: true, logs };
            }
            return { success: true, logs };
            
        case 'Disable':
            // 定身法：封印上一个技能
            const disabledMoveName = target.lastBaseMoveUsed || target.lastMoveUsed;
            if (!disabledMoveName) {
                logs.push(`但是失败了!`);
                return { success: false, logs };
            }
            target.volatile.disable = 4;
            target.volatile.disabledMove = disabledMoveName;
            logs.push(`${target.cnName} 的 ${disabledMoveName} 被封印了!`);
            // 【精神香草】检查
            if (checkMentalHerb(target, 'disable', logs)) {
                return { success: true, logs };
            }
            return { success: true, logs };
            
        case 'Torment':
            // 无理取闹：无法连续使用同一技能
            target.volatile.torment = true;
            logs.push(`${target.cnName} 陷入了无理取闹状态!`);
            // 【精神香草】检查
            if (checkMentalHerb(target, 'torment', logs)) {
                return { success: true, logs };
            }
            return { success: true, logs };
            
        case 'Heal Block':
            // 回复封锁
            target.volatile.healBlock = 5;
            logs.push(`${target.cnName} 被封锁了回复!`);
            // 【精神香草】检查
            if (checkMentalHerb(target, 'healblock', logs)) {
                return { success: true, logs };
            }
            return { success: true, logs };
            
        // ===================== 持续伤害/干扰类 =====================
        // 注意：Leech Seed, Curse 已移至 move-handlers.js 统一处理
        
        case 'Yawn':
            // 哈欠：下回合结束时睡着
            if (target.status) {
                logs.push(`但是失败了! (${target.cnName} 已经有异常状态了)`);
                return { success: false, logs };
            }
            if (target.volatile.yawn) {
                logs.push(`但是失败了!`);
                return { success: false, logs };
            }
            target.volatile.yawn = 2; // 2回合后睡着
            logs.push(`${target.cnName} 打了个哈欠...`);
            return { success: true, logs };
            
        // 注意：Perish Song, Destiny Bond 已移至 move-handlers.js 统一处理
            
        // ===================== 束缚类 =====================
        
        case 'Bind':
        case 'Wrap':
        case 'Fire Spin':
        case 'Clamp':
        case 'Whirlpool':
        case 'Sand Tomb':
        case 'Magma Storm':
        case 'Infestation':
        case 'Snap Trap':
            // 束缚：每回合扣 1/8 HP，持续 4-5 回合
            if (target.volatile.partiallytrapped) {
                logs.push(`但是失败了! (${target.cnName} 已经被束缚了)`);
                return { success: false, logs };
            }
            target.volatile.partiallytrapped = 4 + Math.floor(Math.random() * 2); // 4-5 回合
            logs.push(`${target.cnName} 被 ${moveName} 束缚住了!`);
            return { success: true, logs };
            
        // ===================== 混乱类 =====================
        
        case 'Confuse Ray':
        case 'Supersonic':
        case 'Sweet Kiss':
        case 'Teeter Dance':
        case 'Flatter':
        case 'Swagger':
            // 【修复】Swagger/Flatter 先提升能力，再施加混乱
            // Swagger: 目标攻击+2 + 混乱, Flatter: 目标特攻+1 + 混乱
            {
                const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const fullData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
                if (fullData.boosts) {
                    if (typeof window !== 'undefined' && typeof window.changeStats === 'function') {
                        window.changeStats(target, fullData.boosts);
                    } else {
                        // 手动应用 boosts
                        for (const [stat, val] of Object.entries(fullData.boosts)) {
                            target.boosts = target.boosts || {};
                            target.boosts[stat] = Math.min(6, Math.max(-6, (target.boosts[stat] || 0) + val));
                        }
                    }
                    const boostNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
                    for (const [stat, val] of Object.entries(fullData.boosts)) {
                        const name = boostNames[stat] || stat;
                        if (val > 0) logs.push(`${target.cnName} 的${name}提升了${val > 1 ? '很多' : ''}!`);
                    }
                }
            }
            // 混乱
            // 【Own Tempo】免疫混乱
            {
                const tAbId = (target.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                if (tAbId === 'owntempo') {
                    logs.push(`${target.cnName} 的我行我素免疫了混乱!`);
                    return { success: false, logs };
                }
            }
            if (target.volatile.confusion) {
                logs.push(`但是失败了! (${target.cnName} 已经混乱了)`);
                return { success: false, logs };
            }
            target.volatile.confusion = 2 + Math.floor(Math.random() * 4); // 2-5 回合
            logs.push(`${target.cnName} 混乱了!`);
            // 播放混乱 VFX
            if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                const b = window.battle;
                const isTargetPlayer = b && b.playerParty && b.playerParty.includes(target);
                const _cid = isTargetPlayer ? 'player-sprite' : 'enemy-sprite';
                window.BattleVFX.triggerStatusVFX('CNF', _cid);
            }
            return { success: true, logs };
            
        // ===================== 接力类 =====================
        
        case 'Shed Tail':
            // 断尾：消耗 50% HP 制造替身并换人
            const shedCost = Math.ceil(user.maxHp / 2);
            if (user.currHp <= shedCost) {
                logs.push(`但是失败了! (HP 不足以断尾)`);
                return { success: false, logs };
            }
            user.currHp -= shedCost;
            // 制造一个 1/4 HP 的替身给下一只
            user.volatile.shedTailSub = Math.floor(user.maxHp / 4);
            logs.push(`${user.cnName} 制造了一个替身并准备撤退!`);
            return { success: true, logs, pivot: true, passSub: true };
            
        // ===================== 其他常用状态技 =====================
        
        case 'Attract':
            // 着迷
            if (target.volatile.attract) {
                logs.push(`但是失败了!`);
                return { success: false, logs };
            }
            target.volatile.attract = true;
            logs.push(`${target.cnName} 着迷了!`);
            // 【精神香草】检查
            if (checkMentalHerb(target, 'attract', logs)) {
                return { success: true, logs };
            }
            return { success: true, logs };
            
        case 'Focus Energy':
            // 聚气：暴击率 +2 (重复检查已由通用逻辑处理)
            user.volatile.focusenergy = true;
            logs.push(`${user.cnName} 深呼吸，集中精神!`);
            return { success: true, logs };
            
        case 'Imprison':
            // 封印：对手不能使用与自己相同的招式
            user.volatile.imprison = true;
            logs.push(`${user.cnName} 封印了对手的招式!`);
            return { success: true, logs };
            
        case 'Embargo':
            // 查封：无法使用道具
            target.volatile.embargo = 5;
            logs.push(`${target.cnName} 无法使用道具了!`);
            return { success: true, logs };
            
        case 'Aqua Ring':
            // 水流环：每回合回复 1/16 HP (重复检查已由通用逻辑处理)
            user.volatile.aquaring = true;
            logs.push(`${user.cnName} 用水流环包裹住了自己!`);
            return { success: true, logs };
            
        case 'Ingrain':
            // 扎根：每回合回复 1/16 HP，无法换人 (重复检查已由通用逻辑处理)
            user.volatile.ingrain = true;
            logs.push(`${user.cnName} 扎下了根!`);
            return { success: true, logs };
            
        default:
            return { success: false, logs };
    }
}

/**
 * 检查宝可梦是否可以使用指定技能
 * @param {Pokemon} pokemon 
 * @param {object} move 
 * @returns {object} { canUse, reason }
 */
function canUseMove(pokemon, move) {
    if (!pokemon.volatile) return { canUse: true, reason: null };
    
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    const category = fullMoveData.category || move.category || move.cat || 'Physical';
    
    // 挑衅检查：无法使用变化技
    if (pokemon.volatile.taunt && pokemon.volatile.taunt > 0) {
        if (category === 'Status' || category === 'status') {
            return { canUse: false, reason: `${pokemon.cnName} 被挑衅了，无法使用变化技!` };
        }
    }
    
    // 定身法检查
    if (pokemon.volatile.disable && pokemon.volatile.disable > 0) {
        if (pokemon.volatile.disabledMove === move.name) {
            return { canUse: false, reason: `${move.name} 被封印了!` };
        }
    }
    
    // 再来一次检查
    if (pokemon.volatile.encore && pokemon.volatile.encore > 0) {
        const currentMoveName = move.baseMove || move.originalMoveName || move.name;
        if (pokemon.volatile.encoreMove && currentMoveName !== pokemon.volatile.encoreMove) {
            return { canUse: false, reason: `被强制使用 ${pokemon.volatile.encoreMove}!` };
        }
    }
    
    // 无理取闹检查
    const currentMoveName = move.baseMove || move.originalMoveName || move.name;
    const lastMoveName = pokemon.lastBaseMoveUsed || pokemon.lastMoveUsed;
    if (pokemon.volatile.torment && lastMoveName === currentMoveName) {
        return { canUse: false, reason: `${pokemon.cnName} 无法连续使用同一技能!` };
    }
    
    // 封印检查 (Imprison)：对手不能使用与自己相同的招式
    // 注意：这需要在战斗中检查对手的招式，这里只做标记检查
    if (pokemon.volatile.imprisonBlocked && pokemon.volatile.imprisonBlocked.includes(move.name)) {
        return { canUse: false, reason: `${move.name} 被封印了!` };
    }
    
    return { canUse: true, reason: null };
}

/**
 * 检查混乱状态是否导致自伤
 * @param {Pokemon} pokemon 
 * @returns {object} { confused, selfHit, damage, logs }
 */
function checkConfusion(pokemon) {
    const logs = [];
    
    if (!pokemon.volatile || !pokemon.volatile.confusion || pokemon.volatile.confusion <= 0) {
        return { confused: false, selfHit: false, damage: 0, logs };
    }
    
    logs.push(`${pokemon.cnName} 正处于混乱中!`);
    
    // 播放混乱 VFX (每回合混乱状态提示)
    if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
        const b = window.battle;
        const isPlayer = b && b.playerParty && b.playerParty.includes(pokemon);
        const _cid = isPlayer ? 'player-sprite' : 'enemy-sprite';
        window.BattleVFX.triggerStatusVFX('CNF', _cid);
    }
    
    // 33% 概率自伤
    if (Math.random() < 0.33) {
        // 自伤伤害：40 威力物理攻击
        const selfDamage = Math.max(1, Math.floor(pokemon.atk * 40 / pokemon.def / 50 * 2));
        pokemon.currHp = Math.max(0, pokemon.currHp - selfDamage);
        logs.push(`${pokemon.cnName} 在混乱中攻击了自己! (-${selfDamage})`);
        return { confused: true, selfHit: true, damage: selfDamage, logs };
    }
    
    return { confused: true, selfHit: false, damage: 0, logs };
}

/**
 * 检查着迷状态是否阻止行动
 * @param {Pokemon} pokemon 
 * @returns {object} { attracted, immobilized, logs }
 */
function checkAttract(pokemon) {
    const logs = [];
    
    if (!pokemon.volatile || !pokemon.volatile.attract) {
        return { attracted: false, immobilized: false, logs };
    }
    
    logs.push(`${pokemon.cnName} 对对手着迷了!`);
    
    // 50% 概率无法行动
    if (Math.random() < 0.5) {
        logs.push(`${pokemon.cnName} 因为着迷而无法行动!`);
        return { attracted: true, immobilized: true, logs };
    }
    
    return { attracted: true, immobilized: false, logs };
}

/**
 * 检查替身是否吸收伤害
 * @param {Pokemon} defender 防御方
 * @param {number} damage 原始伤害
 * @param {object} move 技能数据
 * @returns {object} { absorbed, remainingDamage, logs }
 */
function checkSubstitute(defender, damage, move, attacker = null) {
    const logs = [];
    
    if (!defender.volatile || !defender.volatile.substitute || defender.volatile.substitute <= 0) {
        return { absorbed: false, remainingDamage: damage, logs };
    }
    
    // 声音类技能穿透替身
    if (isSoundMove(move)) {
        return { absorbed: false, remainingDamage: damage, logs };
    }
    
    // 【Infiltrator】穿透特性无视替身
    if (attacker && typeof AbilityHandlers !== 'undefined' && attacker.ability && AbilityHandlers[attacker.ability]) {
        if (AbilityHandlers[attacker.ability].ignoreSubstitute) {
            return { absorbed: false, remainingDamage: damage, logs };
        }
    }
    
    const subHp = defender.volatile.substitute;
    
    if (damage >= subHp) {
        // 替身被打破
        defender.volatile.substitute = 0;
        logs.push(`${defender.cnName} 的替身消失了!`);
        // 剩余伤害不传递给本体（替身吸收所有伤害）
        return { absorbed: true, remainingDamage: 0, logs };
    } else {
        // 替身吸收伤害
        defender.volatile.substitute -= damage;
        logs.push(`替身代替 ${defender.cnName} 承受了伤害! (替身剩余: ${defender.volatile.substitute})`);
        return { absorbed: true, remainingDamage: 0, logs };
    }
}

/**
 * 回合结束时递减 Volatile 状态计数器
 * @param {Pokemon} pokemon 
 * @param {Pokemon} opponent - 对手（用于灭亡之歌等）
 * @returns {Array} 日志消息
 */
function tickVolatileStatus(pokemon, opponent = null) {
    const logs = [];
    if (!pokemon.volatile) return logs;
    
    // 挑衅
    if (pokemon.volatile.taunt && pokemon.volatile.taunt > 0) {
        pokemon.volatile.taunt--;
        if (pokemon.volatile.taunt === 0) {
            logs.push(`${pokemon.cnName} 的挑衅状态解除了!`);
        }
    }
    
    // 定身法
    if (pokemon.volatile.disable && pokemon.volatile.disable > 0) {
        pokemon.volatile.disable--;
        if (pokemon.volatile.disable === 0) {
            pokemon.volatile.disabledMove = null;
            logs.push(`${pokemon.cnName} 的技能封印解除了!`);
        }
    }
    
    // 再来一次
    if (pokemon.volatile.encore && pokemon.volatile.encore > 0) {
        pokemon.volatile.encore--;
        if (pokemon.volatile.encore === 0) {
            pokemon.volatile.encoreMove = null;
            logs.push(`${pokemon.cnName} 的再来一次状态解除了!`);
        }
    }
    
    // 回复封锁
    if (pokemon.volatile.healBlock && pokemon.volatile.healBlock > 0) {
        pokemon.volatile.healBlock--;
        if (pokemon.volatile.healBlock === 0) {
            logs.push(`${pokemon.cnName} 的回复封锁解除了!`);
        }
    }
    
    // 糖浆炸弹 (Syrup Bomb) - 倒计时由 battle-turns.js 处理速度下降
    // 此处仅作兜底：如果 battle-turns.js 未处理，确保倒计时递减
    // 注意：battle-turns.js 已处理速度下降和倒计时，此处不重复
    
    // 哈欠 -> 睡眠
    // 【已移除】哈欠的倒计时在 battle-turns.js 中统一处理，避免重复减少
    // 该处理包含电气场地/薄雾场地免疫检查
    
    // 灭亡之歌
    if (pokemon.volatile.perishsong && pokemon.volatile.perishsong > 0) {
        pokemon.volatile.perishsong--;
        logs.push(`${pokemon.cnName} 的灭亡倒计时: ${pokemon.volatile.perishsong}!`);
        if (pokemon.volatile.perishsong === 0) {
            pokemon.currHp = 0;
            logs.push(`${pokemon.cnName} 因灭亡之歌倒下了!`);
        }
    }
    
    // 混乱
    if (pokemon.volatile.confusion && pokemon.volatile.confusion > 0) {
        pokemon.volatile.confusion--;
        if (pokemon.volatile.confusion === 0) {
            logs.push(`${pokemon.cnName} 的混乱解除了!`);
        }
    }
    
    // 束缚
    if (pokemon.volatile.partiallytrapped && typeof pokemon.volatile.partiallytrapped === 'number') {
        pokemon.volatile.partiallytrapped--;
        if (pokemon.volatile.partiallytrapped === 0) {
            delete pokemon.volatile.partiallytrapped;
            logs.push(`${pokemon.cnName} 从束缚中解脱了!`);
        }
    }
    
    // 查封
    if (pokemon.volatile.embargo && pokemon.volatile.embargo > 0) {
        pokemon.volatile.embargo--;
        if (pokemon.volatile.embargo === 0) {
            logs.push(`${pokemon.cnName} 可以使用道具了!`);
        }
    }
    
    // 同命（已移至 executePlayerTurn/executeEnemyTurn 招式执行后处理）
    // 【关键修复】不要在回合末清除 destinyBond！
    // destinyBond 应该在使用者"使用其他招式时"才清除，而非回合末
    // 这样才能让同命状态在下一回合被攻击时生效
    // if (pokemon.volatile.destinyBond) {
    //     delete pokemon.volatile.destinyBond;
    // }
    
    return logs;
}

// ========== 道具回合末效果 (End-Turn Item Effects) ==========

/**
 * 【软编码】处理回合结束时的道具效果
 * 支持剧毒宝珠、火焰宝珠等自赋状态道具
 * @param {Pokemon} pokemon 
 * @returns {Array} 日志消息数组
 */
function processEndTurnItemEffects(pokemon) {
    const logs = [];
    
    if (!pokemon || !pokemon.item) return logs;
    if (typeof pokemon.isAlive === 'function' && !pokemon.isAlive()) return logs;
    
    // 【软编码】从 items-data.js 获取道具数据
    const itemId = pokemon.item.toLowerCase().replace(/[^a-z0-9]/g, '');
    const itemData = (typeof window.getItem === 'function') ? window.getItem(pokemon.item) : null;
    
    if (!itemData) return logs;
    
    // === 自赋状态道具 (Toxic Orb, Flame Orb) ===
    if (itemData.selfStatus && !pokemon.status) {
        const statusToApply = itemData.selfStatus;
        
        // 检查免疫（钢/毒系免疫中毒，火系免疫灼伤）
        let immune = false;
        if ((statusToApply === 'psn' || statusToApply === 'tox') && pokemon.types) {
            if (pokemon.types.includes('Steel') || pokemon.types.includes('Poison')) {
                immune = true;
            }
        }
        if (statusToApply === 'brn' && pokemon.types && pokemon.types.includes('Fire')) {
            immune = true;
        }
        
        // 检查特性免疫
        const abilityId = (pokemon.ability || '').toLowerCase().replace(/[^a-z]/g, '');
        if (abilityId === 'immunity' && (statusToApply === 'psn' || statusToApply === 'tox')) {
            immune = true;
        }
        if (abilityId === 'waterveil' && statusToApply === 'brn') {
            immune = true;
        }
        
        if (!immune) {
            pokemon.status = statusToApply;
            pokemon.statusTurns = 0;
            
            const statusName = statusToApply === 'tox' ? '剧毒' : (statusToApply === 'brn' ? '灼伤' : '中毒');
            const itemCnName = itemData.cnName || pokemon.item;
            logs.push(`<span style="color:#9b59b6">💎 ${pokemon.cnName} 受到 ${itemCnName} 的影响，陷入了${statusName}状态!</span>`);
        }
    }
    
    // === 黑色淤泥 (Black Sludge) ===
    if (itemId === 'blacksludge') {
        // 【BUG修复】太晶化后应使用太晶属性判定（太晶毒应回血）
        const sludgeTypes = (pokemon.isTerastallized && pokemon.teraType) 
            ? [pokemon.teraType] 
            : (pokemon.types || []);
        if (sludgeTypes.includes('Poison')) {
            // 毒系回复 1/16 HP
            const baseHeal = Math.max(1, Math.floor(pokemon.maxHp / 16));
            let actualHeal = baseHeal;
            if (typeof pokemon.heal === 'function') {
                actualHeal = pokemon.heal(baseHeal);
            } else {
                // Fallback: 应用环境图层修正
                if (typeof window !== 'undefined' && window.envOverlay?.getHealMod) {
                    const mult = window.envOverlay.getHealMod(pokemon);
                    actualHeal = Math.floor(baseHeal * mult);
                }
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + actualHeal);
            }
            logs.push(`<span style="color:#4cd137">${pokemon.cnName} 通过黑色淤泥回复了 ${actualHeal} 点体力!</span>`);
        } else {
            // 非毒系受到 1/8 HP 伤害
            const damage = Math.max(1, Math.floor(pokemon.maxHp / 8));
            pokemon.takeDamage(damage);
            logs.push(`<span style="color:#e74c3c">${pokemon.cnName} 被黑色淤泥伤害了 ${damage} 点!</span>`);
        }
    }
    
    // === 剩饭 (Leftovers) ===
    if (itemId === 'leftovers') {
        if (pokemon.currHp < pokemon.maxHp) {
            const baseHeal = Math.max(1, Math.floor(pokemon.maxHp / 16));
            let actualHeal = baseHeal;
            if (typeof pokemon.heal === 'function') {
                actualHeal = pokemon.heal(baseHeal);
            } else {
                // Fallback: 应用环境图层修正
                if (typeof window !== 'undefined' && window.envOverlay?.getHealMod) {
                    const mult = window.envOverlay.getHealMod(pokemon);
                    actualHeal = Math.floor(baseHeal * mult);
                }
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + actualHeal);
            }
            logs.push(`<span style="color:#4cd137">${pokemon.cnName} 通过剩饭回复了 ${actualHeal} 点体力!</span>`);
        }
    }
    
    return logs;
}

// ========== 拍落效果 (Knock Off) ==========

/**
 * 【软编码】检查道具是否可以被拍落
 * 使用 items-data.js 中的函数进行判定
 * @param {string} itemId 道具ID
 * @returns {boolean} 是否可以被拍落
 */
function canKnockOffItem(itemId) {
    if (!itemId) return false;
    const id = itemId.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 【软编码】使用 items-data.js 的函数
    if (typeof window.isMegaStone === 'function' && window.isMegaStone(id)) return false;
    if (typeof window.isZCrystal === 'function' && window.isZCrystal(id)) return false;
    if (typeof window.isSwappable === 'function' && !window.isSwappable(id)) return false;
    
    return true;
}

/**
 * 【软编码】处理拍落效果 - 移除对手道具
 * 使用 items-data.js 的 isSwappable/isMegaStone/isZCrystal 判定
 * @param {Object} attacker 攻击方
 * @param {Object} defender 防御方
 * @param {Object} move 技能数据
 * @returns {Object} { success: boolean, logs: Array, bonusDamage: number }
 */
function applyKnockOff(attacker, defender, move) {
    const logs = [];
    let bonusDamage = 1.0;
    
    if (move.name !== 'Knock Off') return { success: false, logs, bonusDamage };
    
    // 检查对手是否有道具
    if (defender.item && defender.item !== '') {
        // 【黏着 Sticky Hold】检查：道具无法被拍落
        const defenderAbilityId = (defender.ability || '').toLowerCase().replace(/[^a-z]/g, '');
        if (defenderAbilityId === 'stickyhold') {
            logs.push(`<span style="color:#9b59b6">${defender.cnName} 的黏着特性保护了道具！</span>`);
            return { success: false, logs, bonusDamage: 1.5 }; // 仍有伤害加成
        }
        
        // 【软编码】使用 canKnockOffItem 函数判定
        const isUnremovable = !canKnockOffItem(defender.item);
        
        if (!isUnremovable) {
            const knockedItem = defender.item;
            defender.item = null;
            defender.knockedOffItem = knockedItem; // 记录被拍落的道具
            
            // 触发 Unburden 等 onItemLost 钩子
            if (typeof AbilityHandlers !== 'undefined' && defender.ability) {
                const abilityHandler = AbilityHandlers[defender.ability];
                if (abilityHandler && abilityHandler.onItemLost) {
                    abilityHandler.onItemLost(defender, knockedItem, logs);
                }
            }
            
            const itemData = (typeof window.getItem === 'function') ? window.getItem(knockedItem) : null;
            const itemName = itemData?.cnName || knockedItem;
            logs.push(`${attacker.cnName} 拍落了 ${defender.cnName} 的 ${itemName}！`);
            bonusDamage = 1.5; // 拍落有道具的对手伤害 x1.5
        }
    }
    
    return { success: logs.length > 0, logs, bonusDamage };
}

// ========== 束缚招式 (Trapping Moves) ==========

/**
 * 【软编码】处理束缚招式效果 - 困住对手并造成持续伤害
 * 使用 moves-data.js 中的 volatileStatus: 'partiallytrapped' 标记判定
 * @param {Object} attacker 攻击方
 * @param {Object} defender 防御方
 * @param {Object} move 技能数据
 * @returns {Object} { success: boolean, logs: Array }
 */
function applyTrappingMove(attacker, defender, move) {
    const logs = [];
    
    // 【软编码】从 moves-data.js 读取技能数据
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // 检查是否为束缚招式（通过 volatileStatus 字段判定）
    const isTrappingMove = fullMoveData.volatileStatus === 'partiallytrapped';
    if (!isTrappingMove) return { success: false, logs };
    
    // 幽灵系免疫束缚
    if (defender.types && defender.types.includes('Ghost')) {
        return { success: false, logs };
    }
    
    // 已经被束缚则不重复施加
    if (defender.volatile && defender.volatile.partiallyTrapped) {
        return { success: false, logs };
    }
    
    // 初始化 volatile
    if (!defender.volatile) defender.volatile = {};
    
    // 施加束缚状态
    const turns = Math.random() < 0.5 ? 4 : 5; // 4-5 回合
    defender.volatile.partiallyTrapped = turns;
    defender.volatile.trappedBy = attacker;
    defender.volatile.trapDamage = 1/8; // 标准束缚伤害
    
    // 【软编码】获取技能中文名（从翻译系统或使用原名）
    const moveCnName = (typeof window.Locale !== 'undefined' && window.Locale.get) 
        ? window.Locale.get(move.name) 
        : move.name;
    defender.volatile.trapMove = moveCnName;
    
    logs.push(`${defender.cnName} 被 ${moveCnName} 困住了！`);
    
    return { success: true, logs };
}

/**
 * 【软编码】处理黑色目光/挡路等硬控招式
 * 通过检查 moves-data.js 中的 flags 或 onHit 字段判定
 * @param {Object} attacker 攻击方
 * @param {Object} defender 防御方
 * @param {Object} move 技能数据
 * @returns {Object} { success: boolean, logs: Array }
 */
function applyMeanLook(attacker, defender, move) {
    const logs = [];
    
    // 【软编码】从 moves-data.js 读取技能数据
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // 检查是否为抓人招式（通过多种方式判定）
    // 1. 检查 flags 中是否有 trap 标记
    // 2. 检查是否为已知的抓人招式（作为后备）
    const knownTrapMoves = ['meanlook', 'block', 'spiderweb', 'anchorshot', 'spiritshackle', 'jawlock'];
    const isTrapMove = (fullMoveData.flags && fullMoveData.flags.trap) || knownTrapMoves.includes(moveId);
    
    if (!isTrapMove) return { success: false, logs };
    
    // 幽灵系免疫
    if (defender.types && defender.types.includes('Ghost')) {
        logs.push(`${defender.cnName} 是幽灵属性，不受影响！`);
        return { success: false, logs };
    }
    
    // 初始化 volatile
    if (!defender.volatile) defender.volatile = {};
    
    // 施加无法逃走状态
    defender.volatile.cantEscape = true;
    defender.volatile.trappedBy = attacker;
    
    // 【软编码】获取技能中文名
    const moveCnName = (typeof window.Locale !== 'undefined' && window.Locale.get) 
        ? window.Locale.get(move.name) 
        : move.name;
    
    logs.push(`${defender.cnName} 被 ${moveCnName} 困住，无法逃走了！`);
    
    // Jaw Lock 特殊处理：双方都被困住
    if (moveId === 'jawlock') {
        if (!attacker.volatile) attacker.volatile = {};
        attacker.volatile.cantEscape = true;
        logs.push(`${attacker.cnName} 也因紧咬不放而无法逃走！`);
    }
    
    return { success: true, logs };
}

/**
 * 处理束缚状态的回合结束伤害
 * @param {Object} pokemon 宝可梦
 * @returns {Object} { damage: number, logs: Array }
 */
function processTrappingDamage(pokemon) {
    const logs = [];
    let damage = 0;
    
    if (!pokemon.volatile || !pokemon.volatile.partiallyTrapped) {
        return { damage, logs };
    }
    
    // 计算束缚伤害
    const trapDamage = pokemon.volatile.trapDamage || 1/8;
    damage = Math.floor(pokemon.maxHp * trapDamage);
    if (damage < 1) damage = 1;
    
    const trapMove = pokemon.volatile.trapMove || '束缚';
    logs.push(`${pokemon.cnName} 受到了 ${trapMove} 的伤害！`);
    
    return { damage, logs };
}

// ========== 导出 ==========

window.MoveEffects = {
    // 优先级
    getMovePriority,
    compareActionOrder,
    
    // 状态异常
    STATUS_CONDITIONS,
    tryInflictStatus,
    processStatusEffects,
    processStatusDamage,
    processMoveStatusEffects,
    
    // 特殊伤害
    checkFixedDamageMove,
    checkOHKOMove,
    
    // 天气/场地
    WEATHER_TYPES,
    TERRAIN_TYPES,
    getWeatherModifier,
    getWeatherAccuracyModifier,
    getWeatherDefenseBoost,
    getTerrainModifier,
    
    // 技能标记
    MOVE_FLAGS,
    hasMoveFlag,
    isContactMove,
    isProtectable,
    isSoundMove,
    
    // 场地钉子
    applySideCondition,
    applyEntryHazards,
    clearEntryHazards,
    
    // Volatile 状态 (Taunt, Substitute 等)
    applyVolatileStatus,
    canUseMove,
    checkConfusion,
    checkAttract,
    checkSubstitute,
    tickVolatileStatus,
    
    // 道具回合末效果
    processEndTurnItemEffects,
    
    // 拍落效果
    applyKnockOff,
    canKnockOffItem,
    
    // 束缚招式
    applyTrappingMove,
    applyMeanLook,
    processTrappingDamage
};

// 【关键修复】确保 window.getMovePriority 使用正确的函数
// 因为 battle-engine.js 加载时 MoveEffects 还未定义，会使用 fallback
// 这里重新挂载以确保优先度判定正确
window.getMovePriority = getMovePriority;

console.log('[PKM] MoveEffects 模块已加载');
