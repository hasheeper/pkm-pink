/**
 * ===========================================
 * DYNAMAX.JS - 极巨化系统
 * ===========================================
 * 
 * 职责:
 * - 极巨化状态管理
 * - 招式转换（普通招式 <-> 极巨招式）
 * - 极巨招式推导（Max Move / G-Max Move）
 * - HP 倍增/恢复
 */

// ============================================
// G-Max 专属招式表 (动态构建)
// ============================================
const GMAX_MOVE_MAP = {};

// ============================================
// 初始化：从数据库构建 G-Max 映射表
// ============================================
(function buildGMaxMoveMap() {
    if (typeof MOVES === 'undefined') {
        console.warn('[DYNAMAX] MOVES database not loaded');
        return;
    }
    
    // 遍历所有招式，构建 G-Max 专属招式表
    for (const moveId in MOVES) {
        const moveData = MOVES[moveId];
        
        // 构建 G-Max 专属招式表
        if (moveData.isMax && typeof moveData.isMax === 'string') {
            const species = moveData.isMax.toLowerCase().replace(/[^a-z0-9]/g, '');
            GMAX_MOVE_MAP[species] = {
                name: moveData.name,
                id: moveId,
                type: moveData.type,
                basePower: moveData.basePower || 130
            };
        }
    }
    
    console.log('[DYNAMAX] Built GMAX_MOVE_MAP:', Object.keys(GMAX_MOVE_MAP).length, 'entries');
})();

// ============================================
// 极巨招式推导函数
// ============================================

/**
 * 计算极巨招式威力
 * @param {number} basePower - 原招式威力
 * @param {string} moveType - 招式属性
 * @returns {number} 极巨招式威力
 */
function calculateMaxMovePower(basePower, moveType) {
    // 格斗系和毒系极巨招式威力稍低（因为有加攻/加特攻特效）
    if (moveType === 'Fighting' || moveType === 'Poison') {
        if (basePower >= 150) return 100;
        if (basePower >= 110) return 95;
        if (basePower >= 75) return 90;
        if (basePower >= 65) return 85;
        if (basePower >= 55) return 80;
        if (basePower >= 45) return 75;
        return 70;
    }
    
    // 通用威力计算
    if (basePower >= 150) return 150;
    if (basePower >= 110) return 140;
    if (basePower >= 75) return 130;
    if (basePower >= 65) return 120;
    if (basePower >= 55) return 110;
    if (basePower >= 45) return 100;
    return 90;
}

/**
 * 获取宝可梦的基础物种 ID（用于 G-Max 查表）
 * @param {Object} pokemon - 宝可梦对象
 * @returns {string} 基础物种 ID
 */
function getBaseSpeciesId(pokemon) {
    const pokeName = pokemon.name || '';
    // 移除 gmax/mega/gigantamax 后缀，但保留形态后缀如 lowkey/rapidstrike
    let speciesId = pokeName.toLowerCase().replace(/[^a-z0-9]/g, '');
    speciesId = speciesId.replace(/(gmax|mega|gigantamax)$/g, '');
    return speciesId;
}

/**
 * 检查宝可梦是否有超极巨化因子
 * @param {Object} pokemon - 宝可梦对象
 * @returns {Object|null} G-Max 数据 { move, type, cn } 或 null
 */
function getGMaxFactor(pokemon) {
    // 如果显式标记为通用极巨化，则跳过
    if (pokemon.isGenericDynamax) return null;
    
    // 优先使用 GMAX_SPECIES_DATA（来自 move-constants.js）
    const gmaxTable = typeof GMAX_SPECIES_DATA !== 'undefined' ? GMAX_SPECIES_DATA : 
                      (typeof window !== 'undefined' && window.GMAX_SPECIES_DATA) ? window.GMAX_SPECIES_DATA : null;
    
    if (!gmaxTable) return null;
    
    const speciesId = getBaseSpeciesId(pokemon);
    return gmaxTable[speciesId] || null;
}

/**
 * 获取招式对应的极巨化招式名称
 * @param {Object} baseMoveObj - 原始招式对象
 * @param {Object} pokemon - 宝可梦对象
 * @returns {Object|null} Max 招式信息 { name, type, power, isGMax, cn } 或 null
 */
function getMaxMoveTarget(baseMoveObj, pokemon) {
    // 变化技变成 Max Guard
    if (baseMoveObj.category === 'Status' || baseMoveObj.cat === 'status') {
        const cnTable = typeof GENERIC_MAX_CN !== 'undefined' ? GENERIC_MAX_CN :
                        (typeof window !== 'undefined' && window.GENERIC_MAX_CN) ? window.GENERIC_MAX_CN : {};
        return {
            name: 'Max Guard',
            type: 'Normal',
            power: 0,
            isGMax: false,
            cn: cnTable['Max Guard'] || '极巨防壁'
        };
    }
    
    const moveType = baseMoveObj.type || 'Normal';
    const basePower = baseMoveObj.basePower || baseMoveObj.power || 60;
    
    // === 核心修改：优先查阅 GMAX_SPECIES_DATA 表 ===
    const gmaxFactor = getGMaxFactor(pokemon);
    
    if (gmaxFactor && gmaxFactor.type === moveType) {
        // 该物种在表里，且当前招式属性匹配专属属性
        // G-Max 招式威力通常较高，取 max(计算威力, 130)
        const maxPower = Math.max(calculateMaxMovePower(basePower, moveType), 130);
        return {
            name: gmaxFactor.move,
            type: moveType,
            power: maxPower,
            isGMax: true,
            cn: gmaxFactor.cn
        };
    }
    
    // 备用：检查 GMAX_MOVE_MAP（从 moves-data.js 动态构建的）
    const speciesId = getBaseSpeciesId(pokemon);
    if (GMAX_MOVE_MAP[speciesId] && !pokemon.isGenericDynamax) {
        const gmaxData = GMAX_MOVE_MAP[speciesId];
        if (gmaxData.type === moveType) {
            return {
                name: gmaxData.name,
                type: gmaxData.type,
                power: gmaxData.basePower || 130,
                isGMax: true,
                cn: gmaxData.cn || gmaxData.name
            };
        }
    }
    
    // 通用 Max 招式 (从 move-constants.js 获取)
    const maxByType = typeof window !== 'undefined' && window.GENERIC_MAX_BY_TYPE ? window.GENERIC_MAX_BY_TYPE : {};
    const genericMaxName = maxByType[moveType];
    if (genericMaxName) {
        const maxPower = calculateMaxMovePower(basePower, moveType);
        const cnTable = typeof GENERIC_MAX_CN !== 'undefined' ? GENERIC_MAX_CN :
                        (typeof window !== 'undefined' && window.GENERIC_MAX_CN) ? window.GENERIC_MAX_CN : {};
        return {
            name: genericMaxName,
            type: moveType,
            power: maxPower,
            isGMax: false,
            cn: cnTable[genericMaxName] || genericMaxName
        };
    }
    
    return null;
}

// ============================================
// 极巨化状态管理函数
// ============================================

/**
 * 应用极巨化状态变换（招式替换/回退）
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {boolean} isActive true=开启极巨化, false=关闭极巨化
 */
function applyDynamaxState(pokemon, isActive) {
    if (!pokemon) return;
    
    // === 无极汰那 (Eternatus) 特判 ===
    // 无极汰那的"极巨化"是剧情变身，招式保持原样（不遵循 Max Move 规则）
    const pokeName = (pokemon.name || '').toLowerCase();
    if (pokeName.includes('eternatus')) {
        console.log(`[DYNAMAX] Eternatus detected - Skipping Move Transformation (Boss Logic)`);
        // 无极汰那只做视觉变化，不改招式
        if (isActive) {
            pokemon.isEternamax = true;
        } else {
            pokemon.isEternamax = false;
        }
        return;
    }
    
    if (isActive) {
        // [ON] 开启极巨化
        console.log(`[DYNAMAX] ${pokemon.name} 招式转换为极巨招式`);
        
        // === 【Ambrosia 时空醉】标记下回合混乱 ===
        if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.checkNeuroBacklash) {
            const currentWeather = window.battle?.weather || '';
            const trainer = window.battle?.isPlayerTurn ? null : window.battle?.enemyTrainer;
            const neuroResult = window.WeatherEffects.checkNeuroBacklash(currentWeather, 'dynamax', pokemon, trainer);
            if (neuroResult.shouldTrigger) {
                pokemon.volatile = pokemon.volatile || {};
                pokemon.volatile.neuroBacklash = true;
                console.log(`[AMBROSIA] ⚡ 时空醉：${pokemon.name} 被标记，下回合将混乱`);
            }
        }
        
        // === 检测是否有超极巨化因子 ===
        const gmaxFactor = getGMaxFactor(pokemon);
        if (gmaxFactor) {
            pokemon.hasGMaxFactor = true;
            console.log(`[DYNAMAX] ${pokemon.name} 检测到超极巨化因子: ${gmaxFactor.move} (${gmaxFactor.type})`);
            
            // 自动设置 G-Max 精灵图 URL
            const speciesId = (pokemon.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(gmax|mega|gigantamax)$/g, '');
            pokemon.gmaxSpriteUrl = `https://play.pokemonshowdown.com/sprites/ani/${speciesId}-gmax.gif`;
            console.log(`[DYNAMAX] G-Max 精灵图 URL: ${pokemon.gmaxSpriteUrl}`);
        } else {
            pokemon.hasGMaxFactor = false;
            pokemon.gmaxSpriteUrl = null;
        }
        
        // === 播放极巨化叫声 ===
        if (typeof window.playPokemonCry === 'function') {
            window.playPokemonCry(pokemon.name);
        }
        
        // 1. 备份原始技能 (非常重要！为了回退)
        pokemon._originalMoves = JSON.parse(JSON.stringify(pokemon.moves));
        
        // 2. 使用自动推导系统生成极巨招式
        pokemon.moves = pokemon._originalMoves.map(m => {
            const maxTarget = getMaxMoveTarget(m, pokemon);
            
            if (!maxTarget) {
                // 无法推导，保持原样
                return { ...m, isMax: true };
            }
            
            const maxMoveId = maxTarget.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const MOVES = typeof window !== 'undefined' ? window.MOVES : null;
            const maxMoveData = (MOVES && MOVES[maxMoveId]) ? MOVES[maxMoveId] : {};
            const inheritedCat = m.cat || (maxMoveData.category === 'Physical' ? 'phys' : 'spec');
            
            return {
                name: maxTarget.name,
                cn: maxTarget.cn || maxMoveData.cn || maxTarget.name,
                type: maxTarget.type,
                power: maxTarget.power,
                basePower: maxTarget.power,
                accuracy: 100,
                pp: 5,
                cat: inheritedCat,
                category: maxMoveData.category || (inheritedCat === 'phys' ? 'Physical' : 'Special'),
                isMax: true,
                isGMax: maxTarget.isGMax,
                baseMove: m.name
            };
        });
        
        console.log(`[DYNAMAX] 自动推导极巨招式:`, pokemon.moves.map(m => `${m.name}(${m.type}, pow:${m.power}, gmax:${m.isGMax})`));
        
    } else {
        // [OFF] 关闭极巨化
        console.log(`[DYNAMAX] ${pokemon.name} 招式恢复为普通招式`);
        
        // 清理 G-Max 相关状态
        pokemon.hasGMaxFactor = false;
        pokemon.gmaxSpriteUrl = null;
        
        // 还原技能
        if (pokemon._originalMoves) {
            pokemon.moves = pokemon._originalMoves;
            delete pokemon._originalMoves;
            console.log(`[DYNAMAX] 招式已恢复:`, pokemon.moves.map(m => m.name));
        }
    }
}

/**
 * 应用极巨化 HP 变化
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {boolean} isActive true=开启极巨化, false=关闭极巨化
 * @param {number} multiplier HP 倍率（默认 2）
 */
function applyDynamaxHP(pokemon, isActive, multiplier = 2) {
    if (!pokemon) return;
    
    // === 无极汰那 (Eternatus) 无极巨化特殊处理 ===
    // 无极巨化不仅改 HP，还改全属性（BOSS 模式）
    if (pokemon.isEternamax) {
        if (isActive) {
            // 备份原始属性
            pokemon._originalStats = {
                maxHp: pokemon.maxHp,
                currHp: pokemon.currHp,
                atk: pokemon.atk,
                def: pokemon.def,
                spa: pokemon.spa,
                spd: pokemon.spd,
                spe: pokemon.spe
            };
            
            // 无极巨化种族值变化（官方数据）
            // HP: 140 -> 255 (约 1.82x)
            // Atk: 85 -> 115 (约 1.35x)
            // Def: 95 -> 250 (约 2.63x)
            // SpA: 145 -> 125 (下降)
            // SpD: 95 -> 250 (约 2.63x)
            // Spe: 130 -> 130 (不变)
            const hpRatio = pokemon.currHp / pokemon.maxHp;
            pokemon.maxHp = Math.floor(pokemon.maxHp * 1.82);
            pokemon.currHp = Math.floor(pokemon.maxHp * hpRatio);
            pokemon.atk = Math.floor(pokemon.atk * 1.35);
            pokemon.def = Math.floor(pokemon.def * 2.63);
            pokemon.spa = Math.floor(pokemon.spa * 0.86); // 特攻下降
            pokemon.spd = Math.floor(pokemon.spd * 2.63);
            // 速度不变
            
            console.log(`[ETERNAMAX] Boss Mode Activated! Def/SpD Skyrocketed!`);
            console.log(`[ETERNAMAX] HP: ${pokemon._originalStats.currHp}/${pokemon._originalStats.maxHp} -> ${pokemon.currHp}/${pokemon.maxHp}`);
            console.log(`[ETERNAMAX] Def: ${pokemon._originalStats.def} -> ${pokemon.def}, SpD: ${pokemon._originalStats.spd} -> ${pokemon.spd}`);
        } else {
            // 还原原始属性
            if (pokemon._originalStats) {
                const hpRatio = pokemon.currHp / pokemon.maxHp;
                pokemon.maxHp = pokemon._originalStats.maxHp;
                pokemon.currHp = Math.max(1, Math.floor(pokemon.maxHp * hpRatio));
                pokemon.atk = pokemon._originalStats.atk;
                pokemon.def = pokemon._originalStats.def;
                pokemon.spa = pokemon._originalStats.spa;
                pokemon.spd = pokemon._originalStats.spd;
                pokemon.spe = pokemon._originalStats.spe;
                
                delete pokemon._originalStats;
                console.log(`[ETERNAMAX] Boss Mode Deactivated, stats restored`);
            }
        }
        return; // 跳过常规处理
    }
    
    // === 常规极巨化 HP 处理 ===
    if (isActive) {
        // 备份原始 HP
        pokemon._originalMaxHp = pokemon.maxHp;
        pokemon._originalCurrHp = pokemon.currHp;
        
        // HP 翻倍
        const hpRatio = pokemon.currHp / pokemon.maxHp;
        pokemon.maxHp = Math.floor(pokemon.maxHp * multiplier);
        pokemon.currHp = Math.floor(pokemon.maxHp * hpRatio);
        
        console.log(`[DYNAMAX] ${pokemon.name} HP: ${pokemon._originalCurrHp}/${pokemon._originalMaxHp} -> ${pokemon.currHp}/${pokemon.maxHp}`);
    } else {
        // 恢复原始 HP
        if (pokemon._originalMaxHp) {
            const hpRatio = pokemon.currHp / pokemon.maxHp;
            pokemon.maxHp = pokemon._originalMaxHp;
            pokemon.currHp = Math.max(1, Math.floor(pokemon.maxHp * hpRatio));
            
            delete pokemon._originalMaxHp;
            delete pokemon._originalCurrHp;
            
            console.log(`[DYNAMAX] ${pokemon.name} HP 恢复: ${pokemon.currHp}/${pokemon.maxHp}`);
        }
    }
}

/**
 * 完整的极巨化切换（招式 + HP）
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {boolean} isActive true=开启极巨化, false=关闭极巨化
 */
function toggleDynamax(pokemon, isActive) {
    if (!pokemon) return;
    
    applyDynamaxState(pokemon, isActive);
    applyDynamaxHP(pokemon, isActive);
    
    pokemon.isDynamaxed = isActive;
    
    if (isActive) {
        pokemon.dynamaxTurns = 3; // 极巨化持续 3 回合
    } else {
        pokemon.dynamaxTurns = 0;
    }
}

/**
 * 激活极巨化（统一入口）
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {Object} options 选项 { isEnemy: boolean, justSwitchedIn: boolean }
 * @returns {Object} { success: boolean, hpMultiplier: number }
 */
function activateDynamax(pokemon, options = {}) {
    if (!pokemon) return { success: false };
    
    const hpMultiplier = 1.5;
    const oldMaxHp = pokemon.maxHp;
    const oldCurrHp = pokemon.currHp;
    
    // HP 倍率
    pokemon.maxHp = Math.floor(oldMaxHp * hpMultiplier);
    pokemon.currHp = Math.floor(oldCurrHp * hpMultiplier);
    
    // 设置极巨化状态
    pokemon.isDynamaxed = true;
    pokemon.dynamaxTurns = 3;
    pokemon.preDynamaxMaxHp = oldMaxHp;
    pokemon.preDynamaxCurrHp = oldCurrHp;
    
    // 如果是换入时极巨化，标记跳过第一次 tick
    if (options.justSwitchedIn) {
        pokemon.dynamaxJustActivated = true;
    }
    
    // 招式转换为极巨招式
    applyDynamaxState(pokemon, true);
    
    console.log(`[DYNAMAX] ${pokemon.name} 激活极巨化: HP ${oldCurrHp}/${oldMaxHp} -> ${pokemon.currHp}/${pokemon.maxHp}`);
    
    return { success: true, hpMultiplier, oldMaxHp, oldCurrHp };
}

/**
 * 减少极巨化回合数
 * @param {Pokemon} pokemon 宝可梦对象
 * @returns {boolean} 是否应该结束极巨化
 */
function tickDynamaxTurn(pokemon) {
    if (!pokemon || !pokemon.isDynamaxed) return false;
    
    pokemon.dynamaxTurns = (pokemon.dynamaxTurns || 0) - 1;
    
    if (pokemon.dynamaxTurns <= 0) {
        console.log(`[DYNAMAX] ${pokemon.name} 极巨化结束`);
        return true;
    }
    
    console.log(`[DYNAMAX] ${pokemon.name} 极巨化剩余 ${pokemon.dynamaxTurns} 回合`);
    return false;
}

/**
 * 处理极巨化回合结束（统一入口）
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {boolean} isPlayer 是否为玩家方
 * @param {Function} logFn 日志函数
 * @returns {Object} { ended: boolean, logs: string[] }
 */
async function processDynamaxEndTurn(pokemon, isPlayer, logFn) {
    const logs = [];
    const log = logFn || console.log;
    
    if (!pokemon || !pokemon.isAlive() || !pokemon.isDynamaxed || pokemon.dynamaxTurns <= 0) {
        return { ended: false, logs };
    }
    
    // 【修复】如果是本回合刚极巨化的，跳过这次 tick
    if (pokemon.dynamaxJustActivated) {
        delete pokemon.dynamaxJustActivated;
        console.log(`[DYNAMAX] ${isPlayer ? '玩家' : '敌方'}本回合刚极巨化，跳过 tick`);
        return { ended: false, logs, skipped: true };
    }
    
    // 减少回合数
    pokemon.dynamaxTurns--;
    
    if (pokemon.dynamaxTurns === 0) {
        // 极巨化结束
        const prefix = isPlayer ? '' : '敌方的 ';
        logs.push(`<b style="color:#94a3b8">⚡ ${prefix}极巨化能量耗尽了...</b>`);
        
        // 招式恢复为普通招式
        applyDynamaxState(pokemon, false);
        
        // 恢复原始名称和中文名
        if (pokemon.originalName) {
            pokemon.name = pokemon.originalName;
            if (typeof window !== 'undefined' && window.Locale) {
                pokemon.cnName = window.Locale.get(pokemon.originalName);
            } else {
                pokemon.cnName = pokemon.originalName;
            }
            delete pokemon.originalName;
        }
        
        logs.push(`${prefix}${pokemon.cnName} 变回了原来的样子。`);
        
        // 恢复 HP
        const hpRatio = pokemon.currHp / pokemon.maxHp;
        pokemon.maxHp = pokemon.preDynamaxMaxHp || Math.floor(pokemon.maxHp / 1.5);
        pokemon.currHp = Math.max(1, Math.floor(pokemon.maxHp * hpRatio));
        
        pokemon.isDynamaxed = false;
        delete pokemon.preDynamaxMaxHp;
        delete pokemon.preDynamaxCurrHp;
        
        return { ended: true, logs };
    } else {
        // 还有剩余回合
        const prefix = isPlayer ? '' : '敌方';
        logs.push(`<span style="color:#ff6b8a">[${prefix}极巨化剩余回合: ${pokemon.dynamaxTurns}]</span>`);
        return { ended: false, logs };
    }
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    // 极巨招式推导函数
    window.GMAX_MOVE_MAP = GMAX_MOVE_MAP;
    window.calculateMaxMovePower = calculateMaxMovePower;
    window.getBaseSpeciesId = getBaseSpeciesId;
    window.getGMaxFactor = getGMaxFactor;
    window.getMaxMoveTarget = getMaxMoveTarget;
    
    // 极巨化状态管理函数
    window.applyDynamaxState = applyDynamaxState;
    window.applyDynamaxHP = applyDynamaxHP;
    window.toggleDynamax = toggleDynamax;
    window.activateDynamax = activateDynamax;
    window.tickDynamaxTurn = tickDynamaxTurn;
    window.processDynamaxEndTurn = processDynamaxEndTurn;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // 极巨招式推导
        GMAX_MOVE_MAP,
        calculateMaxMovePower,
        getBaseSpeciesId,
        getGMaxFactor,
        getMaxMoveTarget,
        
        // 极巨化状态管理
        applyDynamaxState,
        applyDynamaxHP,
        toggleDynamax,
        tickDynamaxTurn
    };
}
