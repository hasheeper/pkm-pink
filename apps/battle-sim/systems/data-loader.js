/**
 * ===========================================
 * DATA-LOADER.JS - 数据加载系统
 * ===========================================
 * 
 * 职责:
 * - 默认战斗数据
 * - JSON 数据解析与加载
 * - 战斗初始化数据处理
 */

// ============================================
// 默认战斗数据
// ============================================

/**
 * 获取默认战斗数据 (当没有外部JSON注入时使用)
 * 
 * 新版格式支持：
 * - stats_meta: { ivs: {...}, ev_level: 0~252 }
 * - nature: 性格名称
 * - ability: 特性名称
 * - gender: 'M' | 'F' | null
 * - shiny: boolean
 * - mechanic: 'mega' | 'dynamax' | 'zmove' | 'tera' (互斥机制锁)
 * - dynamax_moves: string[] (极巨化时的招式列表)
 * - z_move_config: { base_move, target_move, is_unique }
 */
function getDefaultBattleData() {
    return {
        "difficulty": "normal",
        "settings": {
            "enableAVS": false,
            "enableCommander": false,
            "enableEVO": false,
            "enableBGM": true,
            "enableSFX": true,
            "enableClash": false,
            "enableEnvironment": false,
            "enableBattlePerformanceMode": false
        },
        "player": {
            "name": "Revival Blessing Tester",
            "trainerProficiency": 0,
            "faintedPartyIndexes": [1],
            "unlocks": {
                "enable_mega": false,
                "enable_z_move": false,
                "enable_styles": false,
                "enable_bond": false,
                "enable_tera": true,
                "enable_dynamax": false,
                "enable_insight": false,
                "enable_proficiency_cap": true
            },
            "party": [
                {
                    "slot": 1,
                    "name": "Pawmot",
                    "lv": 70,
                    "isLead": true,
                    "ability": "Iron Fist",
                    "nature": "Jolly",
                    "item": "Leppa Berry",
                    "moves": ["Revival Blessing", "Double Shock", "Close Combat", "Mach Punch"],
                    "stats_meta": {
                        "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 },
                        "ev_level": { "hp": 4, "atk": 252, "def": 0, "spa": 0, "spd": 0, "spe": 252 }
                    }
                },
                {
                    "slot": 2,
                    "name": "Ceruledge",
                    "lv": 70,
                    "ability": "Weak Armor",
                    "nature": "Jolly",
                    "mechanic": "tera",
                    "teraType": "Fire",
                    "item": "Clear Amulet",
                    "moves": ["Bitter Blade", "Shadow Sneak", "Close Combat", "Swords Dance"],
                    "stats_meta": {
                        "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 },
                        "ev_level": { "hp": 4, "atk": 252, "def": 0, "spa": 0, "spd": 0, "spe": 252 }
                    }
                },
                {
                    "slot": 3,
                    "name": "Gengar",
                    "lv": 70,
                    "ability": "Cursed Body",
                    "nature": "Timid",
                    "item": "Focus Sash",
                    "moves": ["Shadow Ball", "Sludge Bomb", "Thunderbolt", "Protect"],
                    "stats_meta": {
                        "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 },
                        "ev_level": { "hp": 0, "atk": 0, "def": 0, "spa": 252, "spd": 4, "spe": 252 }
                    }
                }
            ]
        },
        "enemy": {
            "name": "Revival Blessing Dummy",
            "type": "DEBUG",
            "trainerProficiency": 0,
            "unlocks": {
                "enable_mega": false,
                "enable_z_move": false,
                "enable_bond": false,
                "enable_styles": false,
                "enable_tera": false,
                "enable_dynamax": false,
                "enable_insight": false,
                "enable_proficiency_cap": true
            },
            "party": [
                {
                    "name": "Garchomp",
                    "lv": 70,
                    "isLead": true,
                    "ability": "Rough Skin",
                    "nature": "Jolly",
                    "item": "Soft Sand",
                    "moves": ["Earthquake", "Dragon Claw", "Stone Edge", "Swords Dance"],
                    "stats_meta": {
                        "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 0, "spd": 31, "spe": 31 },
                        "ev_level": { "hp": 0, "atk": 252, "def": 0, "spa": 0, "spd": 4, "spe": 252 }
                    }
                }
            ],
            "lines": {
                "start": "这是复生祈祷测试场。默认后排有一只预设为倒下的目标，用来验证复活选择与太晶回退。",
                "lose": "复生祈祷的测试通过了。",
                "win": "继续看日志，确认选择菜单、复活 HP 和太晶回退都正常。"
            }
        }
    };


}

// ============================================
// 全局系统开关 / 性能模式
// ============================================

const DEFAULT_BATTLE_SETTINGS = {
    enableAVS: true,
    enableCommander: true,
    enableEVO: true,
    enableBGM: true,
    enableSFX: true,
    enableClash: false,
    enableEnvironment: true,
    enableBattlePerformanceMode: false
};

function parseBattleSettings(settings = {}) {
    const source = settings && typeof settings === 'object' ? settings : {};
    const performanceEnabled = source.enableBattlePerformanceMode === true
        || source.performanceMode === true
        || source.enablePerformanceMode === true;

    return {
        ...DEFAULT_BATTLE_SETTINGS,
        enableAVS: source.enableAVS !== false,
        enableCommander: source.enableCommander !== false,
        enableEVO: source.enableEVO !== false,
        enableBGM: source.enableBGM !== false,
        enableSFX: source.enableSFX !== false,
        enableClash: source.enableClash === true,
        enableEnvironment: source.enableEnvironment !== false,
        enableBattlePerformanceMode: performanceEnabled
    };
}

function buildPerformanceConfig(settings = {}) {
    const enabled = settings.enableBattlePerformanceMode === true;
    return {
        enabled,
        disableScreenFilters: enabled,
        disableBlur: false,
        disableShadows: false,
        disableDecorativeAnimations: false,
        disableBattleVFX: enabled,
        disableWeatherParticles: enabled,
        reduceSpriteFilters: enabled,
        preserveUIAnimations: true,
        keepAudio: true
    };
}

function applyBattleSettings(settings = {}) {
    const parsed = parseBattleSettings(settings);
    const perf = buildPerformanceConfig(parsed);
    if (typeof window !== 'undefined') {
        window.GAME_SETTINGS = parsed;
        window.BATTLE_PERFORMANCE = perf;
        const root = document.documentElement;
        const body = document.body;
        root?.classList.toggle('battle-perf-mode', perf.enabled);
        body?.classList.toggle('battle-perf-mode', perf.enabled);
        window.dispatchEvent?.(new CustomEvent('battle-performance-change', { detail: perf }));
    }
    console.log('[SETTINGS] 全局系统开关:', parsed);
    return parsed;
}

function getBattlePerformanceSettings() {
    if (typeof window === 'undefined') return buildPerformanceConfig(DEFAULT_BATTLE_SETTINGS);
    return window.BATTLE_PERFORMANCE || buildPerformanceConfig(window.GAME_SETTINGS || DEFAULT_BATTLE_SETTINGS);
}

function isBattlePerformanceMode() {
    return getBattlePerformanceSettings().enabled === true;
}

// ============================================
// JSON 数据加载
// ============================================

/**
 * 从外部 JSON 字符串加载对战 (供 AI RP 调用)
 * JSON 格式:
 * {
 *   "player": { "name": "主角名", "party": [...] },  // 可选
 *   "trainer": { "name": "训练家", "id": "xxx", "line": "台词" },
 *   "party": [...],  // 敌方队伍
 *   "script": "loss" | "win" | null
 * }
 */
function loadBattleFromJSON(jsonString) {
    const battle = typeof window !== 'undefined' ? window.battle : null;
    if (!battle) {
        console.error('[DATA-LOADER] battle object not found');
        return false;
    }
    
    try {
        const json = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        applyBattleSettings(json.settings || {});
        
        // 加载玩家队伍 (如果有)
        if (json.player && json.player.party) {
            const unlocks = json.player.unlocks || {};
            battle.playerUnlocks = {
                enable_bond: unlocks.enable_bond !== false,
                enable_styles: unlocks.enable_styles !== false,
                enable_insight: unlocks.enable_insight !== false,
                enable_mega: unlocks.enable_mega !== false,
                enable_z_move: unlocks.enable_z_move !== false,
                enable_dynamax: unlocks.enable_dynamax !== false,
                enable_tera: unlocks.enable_tera !== false
            };
            const playerCanMega = battle.playerUnlocks.enable_mega;
            battle.setPlayerParty(json.player.party, playerCanMega);
            battle.playerName = json.player.name || '主角';

            const faintedPartyIndexes = Array.isArray(json.player.faintedPartyIndexes)
                ? json.player.faintedPartyIndexes
                : [];
            const teraFaintedIndexes = Array.isArray(json.player.teraFaintedIndexes)
                ? json.player.teraFaintedIndexes
                : [];

            faintedPartyIndexes.forEach((idx) => {
                const partyMember = battle.playerParty?.[idx];
                if (!partyMember || idx === battle.playerActive) return;
                if (teraFaintedIndexes.includes(idx)) {
                    partyMember.isTerastallized = true;
                    partyMember.types = [partyMember.teraType];
                    battle.playerTeraUsed = true;
                }
                partyMember.currHp = 0;
                partyMember.status = null;
                partyMember.statusTurns = 0;
                partyMember.volatile = {};
            });
        }
        
        // 加载敌方数据
        battle.loadFromJSON(json);
        
        // 更新视觉
        if (typeof updateAllVisuals === 'function') {
            updateAllVisuals();
        }
        
        return true;
    } catch (e) {
        console.error('Invalid battle JSON:', e);
        return false;
    }
}

/**
 * 解析玩家解锁配置
 * @param {Object} unlocks 解锁配置对象
 * @returns {Object} 标准化的解锁配置
 */
function parseUnlocks(unlocks = {}) {
    return {
        enable_bond: unlocks.enable_bond !== false,
        enable_styles: unlocks.enable_styles !== false,
        enable_insight: unlocks.enable_insight !== false,
        enable_mega: unlocks.enable_mega !== false,
        enable_z_move: unlocks.enable_z_move !== false,
        enable_dynamax: unlocks.enable_dynamax !== false,
        enable_tera: unlocks.enable_tera !== false
    };
}

/**
 * 解析环境天气配置
 * 
 * 新版 JSON 格式:
 * {
 *   "environment": {
 *     "weather": "chronalrift",      // 环境天气 ID
 *     "weatherTurns": 0,             // 持续回合 (0 = 无限)
 *     "revertMessage": "...",        // 天气回归时的消息
 *     "suppression": {
 *       // 方式一: 全局设置
 *       "all": "blocked" | "suppressed" | "normal",
 *       // 方式二: 按天气设置 (优先级高于 all)
 *       "blocked": ["rain", "sun"],      // 完全阻止的天气
 *       "suppressed": ["sandstorm"]      // 回合减半的天气
 *     },
 *     "effects": { ... }             // 环境特效开关
 *   }
 * }
 * 
 * 旧版兼容:
 * {
 *   "environment": {
 *     "suppressionTier": 3           // 1=normal, 2=suppressed, 3=blocked
 *   }
 * }
 * 
 * @param {Object} envConfig 环境配置对象
 * @returns {Object} 标准化的环境配置
 */
function parseEnvironmentConfig(envConfig = {}) {
    const result = {
        weather: envConfig.weather || null,
        weatherTurns: envConfig.weatherTurns ?? 0,
        revertMessage: envConfig.revertMessage || null,
        suppression: {},
        effects: envConfig.effects || {}
    };
    
    // 解析 suppression 配置
    if (envConfig.suppression) {
        const supp = envConfig.suppression;
        
        // all 字段: 全局设置
        if (supp.all) {
            result.suppression.all = supp.all;
        }
        
        // blocked 数组: 完全阻止的天气
        if (Array.isArray(supp.blocked)) {
            result.suppression.blocked = supp.blocked.map(w => w.toLowerCase());
        }
        
        // suppressed 数组: 回合减半的天气
        if (Array.isArray(supp.suppressed)) {
            result.suppression.suppressed = supp.suppressed.map(w => w.toLowerCase());
        }
    }
    // 旧版兼容: suppressionTier
    else if (envConfig.suppressionTier !== undefined) {
        const tier = envConfig.suppressionTier;
        if (tier === 3) {
            result.suppression.all = 'blocked';
        } else if (tier === 2) {
            result.suppression.all = 'suppressed';
        }
        // tier 1 = normal, 不需要设置
    }
    
    console.log('[DATA-LOADER] 环境配置解析:', result);
    return result;
}

/**
 * 应用环境配置到战斗实例
 * @param {Object} battle 战斗实例
 * @param {Object} envConfig 环境配置 (已解析)
 */
function applyEnvironmentConfig(battle, envConfig) {
    if (!battle || !envConfig) return;
    
    // 设置环境天气
    if (envConfig.weather) {
        battle.environmentWeather = envConfig.weather;
        battle.environmentConfig = envConfig;
        
        // 如果没有普通天气，环境天气也作为当前天气
        if (!battle.weather) {
            battle.weather = envConfig.weather;
            battle.weatherTurns = envConfig.weatherTurns;
        }
        
        // 更新视觉效果
        if (typeof window !== 'undefined' && window.setWeatherVisuals) {
            window.setWeatherVisuals(envConfig.weather);
        }
        
        console.log(`[DATA-LOADER] 环境天气已设置: ${envConfig.weather}`);
    }
}

// ============================================
// 环境图层 API
// ============================================

/**
 * 注入环境图层效果
 * @param {Object|string} envJSON - 环境 JSON 对象或字符串
 * @returns {Object|null} 解析后的环境对象
 */
function injectEnvironmentOverlay(envJSON) {
    if (typeof window === 'undefined' || !window.envOverlay) {
        console.error('[ENV OVERLAY] envOverlay 未初始化');
        return null;
    }
    
    const env = window.envOverlay.inject(envJSON);
    if (env) {
        console.log(`[ENV OVERLAY] 注入环境: ${env.env_name}`);
    }
    return env;
}

/**
 * 清除所有环境图层
 */
function clearEnvironmentOverlay() {
    if (typeof window !== 'undefined' && window.envOverlay) {
        window.envOverlay.clear();
        console.log('[ENV OVERLAY] 已清除所有环境');
    }
}

/**
 * 验证战斗 JSON 格式
 * @param {Object} json 战斗数据
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateBattleJSON(json) {
    const errors = [];
    
    if (!json) {
        errors.push('JSON data is null or undefined');
        return { valid: false, errors };
    }
    
    // 检查敌方队伍
    if (!json.party || !Array.isArray(json.party) || json.party.length === 0) {
        errors.push('Missing or empty enemy party');
    }
    
    // 检查每个宝可梦的必要字段
    const checkPokemon = (pokemon, index, side) => {
        if (!pokemon.name) {
            errors.push(`${side} Pokemon #${index + 1}: missing name`);
        }
        if (typeof pokemon.lv !== 'number' || pokemon.lv < 1 || pokemon.lv > 100) {
            errors.push(`${side} Pokemon #${index + 1}: invalid level`);
        }
        if (!pokemon.moves || !Array.isArray(pokemon.moves) || pokemon.moves.length === 0) {
            errors.push(`${side} Pokemon #${index + 1}: missing moves`);
        }
    };
    
    if (json.party) {
        json.party.forEach((p, i) => checkPokemon(p, i, 'Enemy'));
    }
    
    if (json.player && json.player.party) {
        json.player.party.forEach((p, i) => checkPokemon(p, i, 'Player'));
    }
    
    return { valid: errors.length === 0, errors };
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.getDefaultBattleData = getDefaultBattleData;
    window.loadBattleFromJSON = loadBattleFromJSON;
    window.parseBattleSettings = parseBattleSettings;
    window.applyBattleSettings = applyBattleSettings;
    window.getBattlePerformanceSettings = getBattlePerformanceSettings;
    window.isBattlePerformanceMode = isBattlePerformanceMode;
    window.parseUnlocks = parseUnlocks;
    window.parseEnvironmentConfig = parseEnvironmentConfig;
    window.applyEnvironmentConfig = applyEnvironmentConfig;
    window.validateBattleJSON = validateBattleJSON;
    // 环境图层 API
    window.injectEnvironmentOverlay = injectEnvironmentOverlay;
    window.clearEnvironmentOverlay = clearEnvironmentOverlay;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getDefaultBattleData,
        loadBattleFromJSON,
        parseBattleSettings,
        applyBattleSettings,
        getBattlePerformanceSettings,
        isBattlePerformanceMode,
        parseUnlocks,
        parseEnvironmentConfig,
        applyEnvironmentConfig,
        validateBattleJSON,
        injectEnvironmentOverlay,
        clearEnvironmentOverlay
    };
}
