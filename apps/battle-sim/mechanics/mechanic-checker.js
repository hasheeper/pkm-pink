/**
 * ===========================================
 * MECHANIC-CHECKER.JS - 机制互斥检查系统
 * ===========================================
 * 
 * 职责:
 * - 检查宝可梦是否可以激活指定机制
 * - 机制互斥逻辑 (Mega/Dynamax/Z-Move/Tera)
 * - 道具冲突检查
 */

// ============================================
// 核心函数
// ============================================

/**
 * 检查宝可梦是否可以激活指定机制
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {string} mechanicType 机制类型: 'mega' | 'dynamax' | 'zmove' | 'tera'
 * @returns {boolean} 是否可以激活
 */
function canActivateMechanic(pokemon, mechanicType) {
    if (!pokemon) return false;
    
    // 1. 如果处于任何一种 "Super State"，则禁止开启另一种
    const inBeastMode = pokemon.isMega || 
                        pokemon.isDynamaxed || 
                        pokemon.hasBondResonance ||
                        pokemon.isTera;
    
    if (inBeastMode) {
        console.log(`[MECHANIC] ${pokemon.name} 已处于特殊状态，无法激活 ${mechanicType}`);
        return false;
    }
    
    // 2. 检查 JSON 配置的系统锁
    // 如果 JSON 里 explicitly 设置了 mechanic: "dynamax"，那么它就不能 Mega
    if (pokemon.mechanic && pokemon.mechanic !== mechanicType) {
        console.log(`[MECHANIC] ${pokemon.name} 被锁定为 ${pokemon.mechanic}，无法激活 ${mechanicType}`);
        return false;
    }
    
    // 3. 道具冲突检查
    // Mega 石和 Z 纯晶互斥
    const item = (pokemon.item || '').toLowerCase();
    if (mechanicType === 'zmove' && item.includes('ite') && !item.includes('ium')) {
        // 携带 Mega 石（如 Lucarionite）无法使用 Z 招式
        console.log(`[MECHANIC] ${pokemon.name} 携带 Mega 石，无法使用 Z 招式`);
        return false;
    }
    if (mechanicType === 'mega' && item.includes('ium z')) {
        // 携带 Z 纯晶无法 Mega
        console.log(`[MECHANIC] ${pokemon.name} 携带 Z 纯晶，无法 Mega 进化`);
        return false;
    }
    
    return true;
}

/**
 * 检查是否处于任何特殊状态
 * @param {Pokemon} pokemon 宝可梦对象
 * @returns {boolean} 是否处于特殊状态
 */
function isInSuperState(pokemon) {
    if (!pokemon) return false;
    return pokemon.isMega || 
           pokemon.isDynamaxed || 
           pokemon.hasBondResonance ||
           pokemon.isTera;
}

/**
 * 获取当前激活的机制类型
 * @param {Pokemon} pokemon 宝可梦对象
 * @returns {string|null} 'mega' | 'dynamax' | 'bond' | 'tera' | null
 */
function getActiveMechanic(pokemon) {
    if (!pokemon) return null;
    if (pokemon.isMega) return 'mega';
    if (pokemon.isDynamaxed) return 'dynamax';
    if (pokemon.hasBondResonance) return 'bond';
    if (pokemon.isTera) return 'tera';
    return null;
}

/**
 * 检查道具是否为 Mega 石
 * @param {string} itemName 道具名称
 * @returns {boolean}
 */
function isMegaStoneItem(itemName) {
    if (!itemName) return false;
    const item = itemName.toLowerCase();
    // Mega 石以 'ite' 结尾，但不是 'eviolite'
    return item.endsWith('ite') && item !== 'eviolite';
}

/**
 * 检查道具是否为 Z 纯晶
 * @param {string} itemName 道具名称
 * @returns {boolean}
 */
function isZCrystalItem(itemName) {
    if (!itemName) return false;
    const item = itemName.toLowerCase();
    return item.endsWith('iumz') || item.endsWith('iniumz') || item.includes('ium z');
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.canActivateMechanic = canActivateMechanic;
    window.isInSuperState = isInSuperState;
    window.getActiveMechanic = getActiveMechanic;
    window.isMegaStoneItem = isMegaStoneItem;
    window.isZCrystalItem = isZCrystalItem;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        canActivateMechanic,
        isInSuperState,
        getActiveMechanic,
        isMegaStoneItem,
        isZCrystalItem
    };
}
