/**
 * Pokemon Spawn Engine - 宝可梦生成系统
 * 基于mapdata.json的威胁度、地表、Biome_Zone生成对应宝可梦
 */

// =====================================================
// 第1部分：环境信息获取函数
// =====================================================

/**
 * 获取玩家当前位置的环境信息
 * @returns {Object} { gx, gy, threat, surfaceId, surfaceType, biomeZone }
 */
function getPlayerLocationInfo() {
    if (typeof playerState === 'undefined' || typeof getIntVal === 'undefined') {
        console.warn('[PokemonEngine] 依赖未加载');
        return null;
    }
    
    const gx = playerState.gx;
    const gy = playerState.gy;
    
    // 1. 获取威胁度 (Threat层)
    const threat = getIntVal(gx, gy, 'Threat') || 0;
    
    // 2. 获取地表类型 (Surface层)
    const surfaceId = getIntVal(gx, gy, 'Surface') || 0;
    const surfaceConfig = (typeof TERRAIN_CONFIG !== 'undefined') ? TERRAIN_CONFIG[surfaceId] : null;
    const surfaceType = surfaceConfig ? surfaceConfig.type : 'Unknown';
    
    // 3. 获取Biome_Zone (实体层)
    const biomeZone = (typeof getEntZoneName === 'function') 
        ? (getEntZoneName('Biome_Zone', gx, gy) || 'Unknown')
        : 'Unknown';
    
    return {
        gx, gy,
        threat,
        surfaceId,
        surfaceType,
        biomeZone
    };
}

window.getPlayerLocationInfo = getPlayerLocationInfo;

// =====================================================
// 第2部分：加载SPAWN_TABLES数据
// =====================================================

// SPAWN_TABLES_DATA 将通过 <script src="pkmdata.js"> 加载

// 区域名称映射：将mapdata中的Biome_Zone名称映射到pkmdata中的区域名称
const BIOME_ZONE_MAPPING = {
    // Z区 - 映射到Aether_Admin_Zone
    "Arcadia_Lawns": "Aether_Admin_Zone",
    "Zenith_HQ": "Aether_Admin_Zone",
    "Lusamine_Gardens": "Aether_Admin_Zone",
    "Academic_Plaza": "Aether_Admin_Zone",
    "Royal_Academy": "Aether_Admin_Zone",
    "Zero_Halo_Moat": "Zero_Halo_Moat",
    
    // B区
    "Pearl_Resort": "Sapphire_Strand",
    "Sapphire_Marina": "Sapphire_Strand",
    "Sunflora_Farmsteads": "Aroma_Meadow",
    "Marina_Port_Town": "Breeze_Woodlands",
    "Jade_Canopy": "Jade_Canopy",
    "Deep_Root_Hollow": "Deep_Root_Hollow",
    "Breeze_Woodlands": "Breeze_Woodlands",
    "Hermit_Sands": "Hermit_Sands",
    "Golden_Horizon": "Golden_Horizon",
    "Emerald_Vein_River": "Emerald_Vein_River",
    "Mirror_Lotis_Lake": "Mirror_Lotis_Lake",
    "Twin_Destiny_Basin": "Twin_Destiny_Basin",
    
    // N区
    "Electro_Avenue": "Radiant_Plains",
    "Cyber_Shopping_District": "Radiant_Plains",
    "Glitch_Arcade_Lane": "Radiant_Plains",
    "Synth_Promenade": "Radiant_Plains",
    "Skyline_Residences": "Radiant_Plains",
    "Neon_Cargo_Terminal": "Radiant_Plains",
    "Chrome_Canal": "Chrome_Canal",
    
    // S区
    "Frost_Smoke_City": "Silent_Tundra",
    "Grim_Borough": "Cinder_Moor",
    "Northern_Cemetery": "Silent_Tundra",
    "Requiem_Grounds": "Silent_Tundra",
    "District_S": "Cinder_Moor",
    "Ginkgo_Grove": "Ginkgo_Grove",
    "Spirit_Plateau": "Spirit_Plateau",
    "Twilight_Copse": "Twilight_Copse",
    "Mercury_Stream": "Mercury_Stream",
    
    // A区
    "Crimson_Forge_City": "Crimson_Badlands",
    "Titan_Mining_site": "Crimson_Badlands",
    "Venom_Refinery": "Crimson_Badlands",
    "Toxic_Industrial_Park": "Crimson_Badlands",
    "Crimson_Peat": "Crimson_Peat",
    "Inferno_Crater": "Inferno_Crater",
    "Scorched_Dunes": "Scorched_Dunes",
    "Silt_Delta": "Silt_Delta",
    
    // 水域 - 浅海/泻湖
    "Prism_Bay": "Crystal_Lagoon",
    "Crystal_Lagoon": "Crystal_Lagoon",
    "Cerulean_Reef": "Cerulean_Reef",
    "Mist_Veil_Sound": "Mist_Veil_Sound",
    "Basalt_Shoals": "Obsidian_Beach",
    
    // 水域 - 深海
    "Equatorial_Dark_Zone": "Equatorial_Dark_Zone",
    "Titan_Trough": "Titan_Trough",
    "Chrome_Abyss": "Chrome_Abyss",
    "Boreal_Trench": "Boreal_Trench",
    
    // 水域 - 特殊
    "Ferro_Straits": "Ferro_Straits",
    "Frigid_Floe": "Frigid_Floe",
    "Obsidian_Beach": "Obsidian_Beach",
    "Frostbite_Slope": "Frostbite_Slope",
    
    // 草原/平原
    "Savanna_Outlands": "Savanna_Outlands",
    "Aroma_Meadow": "Aroma_Meadow",
    "Radiant_Plains": "Radiant_Plains"
};

// =====================================================
// 第3部分：宝可梦生成引擎
// =====================================================

// 威胁度值定义 (来自mapdata.json的Threat层)
// 6 = Peace (和平，无宝可梦)
// 1 = Safe (安全，低等级宝可梦)
// 2 = Low_Threat
// 3 = Mid_Threat
// 4 = High_Threat
// 5 = Apex (最高威胁)
// 0 = 未定义区域

const THREAT_PEACE = 6;  // 和平区域值

const PokemonSpawnEngine = {
    
    /**
     * 检查是否为和平区域（无宝可梦）
     */
    isPeaceZone(threat) {
        return threat === THREAT_PEACE || threat === 0;
    },
    
    /**
     * 根据威胁度决定稀有度池
     * 6/0=无宝可梦, 1=safe, 2=low, 3=mid, 4=high, 5=apex
     */
    getRarityPool(threat) {
        if (this.isPeaceZone(threat)) return null; // 和平区域无宝可梦
        
        const roll = Math.random() * 100;
        
        if (threat === 1) {
            // Safe: 90% common, 9% uncommon, 1% rare, 0% boss
            if (roll < 90) return 'common';
            if (roll < 99) return 'uncommon';
            return 'rare';
        } else if (threat === 2) {
            // Low: 75% common, 18% uncommon, 6% rare, 1% boss
            if (roll < 75) return 'common';
            if (roll < 93) return 'uncommon';
            if (roll < 99) return 'rare';
            return 'boss';
        } else if (threat === 3) {
            // Mid: 55% common, 28% uncommon, 13% rare, 4% boss
            if (roll < 55) return 'common';
            if (roll < 83) return 'uncommon';
            if (roll < 96) return 'rare';
            return 'boss';
        } else if (threat === 4) {
            // High: 35% common, 32% uncommon, 23% rare, 10% boss
            if (roll < 35) return 'common';
            if (roll < 67) return 'uncommon';
            if (roll < 90) return 'rare';
            return 'boss';
        } else {
            // Apex (5): 20% common, 30% uncommon, 30% rare, 20% boss
            if (roll < 20) return 'common';
            if (roll < 50) return 'uncommon';
            if (roll < 80) return 'rare';
            return 'boss';
        }
    },
    
    /**
     * 根据威胁度计算等级范围
     */
    getLevelRange(threat) {
        const ranges = {
            1: { min: 3, max: 10 },   // Safe
            2: { min: 8, max: 18 },   // Low
            3: { min: 15, max: 28 },  // Mid
            4: { min: 25, max: 42 },  // High
            5: { min: 38, max: 60 }   // Apex
        };
        return ranges[threat] || ranges[1];
    },
    
    /**
     * 解析区域名称，将mapdata中的名称映射到pkmdata中的名称
     * @param {string} biomeZone - Biome_Zone实体名称
     * @param {string} surfaceType - 地表类型（用于水域推断）
     */
    resolveZoneName(biomeZone, surfaceType) {
        // 如果biome为空但是水域地表，根据surfaceType推断水域区域
        if (!biomeZone || biomeZone === '' || biomeZone === 'Unknown') {
            const waterSurfaces = ['Fresh_Water', 'Shallow_Sea', 'Deep_Sea', 'Glacial_Water', 'Sewage'];
            if (waterSurfaces.includes(surfaceType)) {
                // 根据水域类型返回默认的水域区域
                if (surfaceType === 'Deep_Sea') return 'Equatorial_Dark_Zone';
                if (surfaceType === 'Shallow_Sea') return 'Crystal_Lagoon';
                if (surfaceType === 'Fresh_Water') return 'Zero_Halo_Moat';
                if (surfaceType === 'Glacial_Water') return 'Frigid_Floe';
                if (surfaceType === 'Sewage') return 'Chrome_Canal';
            }
            return 'Aether_Admin_Zone';
        }
        
        // 先尝试直接映射
        if (BIOME_ZONE_MAPPING[biomeZone]) {
            return BIOME_ZONE_MAPPING[biomeZone];
        }
        
        // 尝试移除空格和特殊字符后匹配
        const normalized = biomeZone.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        if (BIOME_ZONE_MAPPING[normalized]) {
            return BIOME_ZONE_MAPPING[normalized];
        }
        
        // 如果pkmdata中直接有这个区域，直接使用
        if (window.SPAWN_TABLES_DATA && window.SPAWN_TABLES_DATA[biomeZone]) {
            return biomeZone;
        }
        if (window.SPAWN_TABLES_DATA && window.SPAWN_TABLES_DATA[normalized]) {
            return normalized;
        }
        
        // 默认返回Aether_Admin_Zone
        return 'Aether_Admin_Zone';
    },
    
    /**
     * 从池中随机选择一个宝可梦
     */
    pickFromPool(pool, levelRange) {
        if (!pool || pool.length === 0) return null;
        
        const idx = Math.floor(Math.random() * pool.length);
        const entry = pool[idx];
        
        let pokemonId, minLevel;
        if (typeof entry === 'string') {
            pokemonId = entry;
            minLevel = levelRange.min;
        } else {
            pokemonId = entry.id;
            minLevel = entry.min || levelRange.min;
        }
        
        // 计算实际等级：确保不低于minLevel
        // 如果minLevel高于levelRange.max，则直接使用minLevel
        const effectiveMin = Math.max(minLevel, levelRange.min);
        const effectiveMax = Math.max(levelRange.max, effectiveMin);
        const level = Math.floor(Math.random() * (effectiveMax - effectiveMin + 1)) + effectiveMin;
        
        return { id: pokemonId, level };
    },
    
    /**
     * 生成单个宝可梦
     */
    spawnOne(locationInfo) {
        if (!locationInfo) {
            locationInfo = getPlayerLocationInfo();
        }
        if (!locationInfo) return null;
        
        const { threat, surfaceType, biomeZone } = locationInfo;
        
        // 和平区域无宝可梦 (threat=6 或 threat=0)
        if (this.isPeaceZone(threat)) return null;
        
        // 获取SPAWN_TABLES_DATA
        const tables = window.SPAWN_TABLES_DATA;
        if (!tables) {
            console.warn('[PokemonEngine] SPAWN_TABLES_DATA未加载');
            return null;
        }
        
        // 解析区域名称（传入surfaceType用于水域推断）
        const resolvedZone = this.resolveZoneName(biomeZone, surfaceType);
        
        // 查找对应的生成表
        let zoneTable = tables[resolvedZone];
        if (!zoneTable) {
            // 尝试使用Aether_Admin_Zone作为默认
            zoneTable = tables['Aether_Admin_Zone'];
        }
        if (!zoneTable) {
            return null;
        }
        
        // 查找地表类型对应的池
        let surfacePool = zoneTable[surfaceType];
        
        // 调试日志
        console.log('[Pokemon] Zone:', resolvedZone, '| Surface:', surfaceType, '| Found:', !!surfacePool, '| Available:', Object.keys(zoneTable));
        
        if (!surfacePool) {
            // 根据地表类型智能回退
            // 水系地表优先回退到水系
            const waterSurfaces = ['Fresh_Water', 'Shallow_Sea', 'Deep_Sea', 'Glacial_Water', 'Sewage'];
            const isWaterSurface = waterSurfaces.includes(surfaceType);
            
            if (isWaterSurface) {
                // 水域回退顺序：优先匹配同类型
                if (surfaceType === 'Shallow_Sea') {
                    surfacePool = zoneTable['Shallow_Sea'] || zoneTable['Fresh_Water'] || zoneTable['Deep_Sea'];
                } else if (surfaceType === 'Deep_Sea') {
                    surfacePool = zoneTable['Deep_Sea'] || zoneTable['Shallow_Sea'];
                } else if (surfaceType === 'Glacial_Water') {
                    surfacePool = zoneTable['Glacial_Water'] || zoneTable['Fresh_Water'] || zoneTable['Shallow_Sea'];
                } else if (surfaceType === 'Sewage') {
                    surfacePool = zoneTable['Sewage'] || zoneTable['Fresh_Water'];
                } else {
                    surfacePool = zoneTable['Fresh_Water'] || zoneTable['Shallow_Sea'] || zoneTable['Deep_Sea'];
                }
            }
            
            // 如果还是没找到，使用通用回退
            if (!surfacePool) {
                surfacePool = zoneTable['Standard_Grass'] || zoneTable['Pavement'] || Object.values(zoneTable)[0];
            }
        }
        if (!surfacePool) {
            return null;
        }
        
        // 根据威胁度决定稀有度
        const rarity = this.getRarityPool(threat);
        if (!rarity) return null;
        
        const levelRange = this.getLevelRange(threat);
        
        // 获取对应稀有度的池
        let pool = surfacePool[rarity];
        if (!pool || pool.length === 0) {
            // 降级到common
            pool = surfacePool['common'];
        }
        if (!pool || pool.length === 0) {
            return null;
        }
        
        // 从池中选择
        const pokemon = this.pickFromPool(pool, levelRange);
        if (!pokemon) return null;
        
        return {
            ...pokemon,
            rarity,
            biome: biomeZone,
            resolvedBiome: resolvedZone,
            surface: surfaceType,
            threat
        };
    },
    
    /**
     * 生成附近的多个宝可梦（4-5个）
     * @param {Object} locationInfo - 来自getPlayerLocationInfo()
     * @returns {Array} 宝可梦数组
     */
    spawnNearby(locationInfo) {
        if (!locationInfo) {
            locationInfo = getPlayerLocationInfo();
        }
        if (!locationInfo) return [];
        
        const { threat } = locationInfo;
        
        // 和平区域无宝可梦 (threat=6 或 threat=0)
        if (this.isPeaceZone(threat)) {
            return [];
        }
        
        // 根据威胁度决定生成数量
        const count = 4 + Math.floor(Math.random() * 2); // 4-5个
        const results = [];
        
        for (let i = 0; i < count; i++) {
            const pokemon = this.spawnOne(locationInfo);
            if (pokemon) {
                results.push(pokemon);
            }
        }
        
        // 按等级排序
        results.sort((a, b) => a.level - b.level);
        
        return results;
    },
    
    /**
     * 标准化宝可梦ID用于精灵图URL
     * 处理特殊形态如 alola, galar, hisui, paldea 等
     */
    normalizeSpriteId(pokemonId) {
        let id = pokemonId.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        
        // 处理地区形态: xxx_alola -> xxx-alola
        const regionalForms = ['alola', 'galar', 'hisui', 'paldea'];
        for (const region of regionalForms) {
            if (id.endsWith(`_${region}`)) {
                id = id.replace(`_${region}`, `-${region}`);
                break;
            }
            if (id.includes(`_${region}_`)) {
                id = id.replace(`_${region}_`, `-${region}-`);
                break;
            }
        }
        
        // 处理其他特殊形态
        id = id.replace(/_/g, '-');
        
        // 移除多余的横杠
        id = id.replace(/--+/g, '-').replace(/^-|-$/g, '');
        
        return id;
    },
    
    /**
     * 获取基础ID（去除形态后缀）
     */
    getBaseId(pokemonId) {
        let id = pokemonId.toLowerCase().replace(/[^a-z0-9]/g, '');
        // 移除常见后缀
        const suffixes = ['alola', 'galar', 'hisui', 'paldea', 'mega', 'gmax'];
        for (const suffix of suffixes) {
            if (id.endsWith(suffix)) {
                id = id.slice(0, -suffix.length);
                break;
            }
        }
        return id;
    },
    
    /**
     * 获取宝可梦图片URL (静态版)
     */
    getImageUrl(pokemonId) {
        const spriteId = this.normalizeSpriteId(pokemonId);
        return `https://play.pokemonshowdown.com/sprites/gen5/${spriteId}.png`;
    },
    
    /**
     * 获取宝可梦图片URL (动画版)
     */
    getAnimatedImageUrl(pokemonId) {
        const spriteId = this.normalizeSpriteId(pokemonId);
        return `https://play.pokemonshowdown.com/sprites/ani/${spriteId}.gif`;
    },
    
    /**
     * 获取回退图片URL
     */
    getFallbackImageUrl(pokemonId) {
        const baseId = this.getBaseId(pokemonId);
        return `https://play.pokemonshowdown.com/sprites/gen5/${baseId}.png`;
    }
};

window.PokemonSpawnEngine = PokemonSpawnEngine;

// =====================================================
// 第4部分：宝可梦数据缓存管理
// =====================================================

const PokemonSpawnCache = {
    // 缓存数据：按位置键存储
    cache: {},
    
    // 当前位置的宝可梦列表
    currentList: [],
    currentLocationKey: null,
    
    /**
     * 生成位置键 - 每个格子独立
     */
    getLocationKey(locationInfo) {
        if (!locationInfo) return null;
        // 使用gx,gy坐标确保每个格子有不同的宝可梦
        return `${locationInfo.gx}_${locationInfo.gy}`;
    },
    
    /**
     * 获取或生成当前位置的宝可梦
     * 只有位置变化时才重新生成
     */
    getForLocation(locationInfo) {
        if (!locationInfo) return [];
        
        const key = this.getLocationKey(locationInfo);
        
        // 如果位置没变，返回缓存的列表
        if (key === this.currentLocationKey && this.currentList.length > 0) {
            return this.currentList;
        }
        
        // 检查是否有该位置的缓存
        if (this.cache[key]) {
            this.currentLocationKey = key;
            this.currentList = this.cache[key];
            return this.currentList;
        }
        
        // 生成新的宝可梦列表
        const newList = PokemonSpawnEngine.spawnNearby(locationInfo);
        
        // 缓存结果
        this.cache[key] = newList;
        this.currentLocationKey = key;
        this.currentList = newList;
        
        console.log('[Pokemon] 生成新列表:', key, newList);
        return newList;
    },
    
    /**
     * 强制刷新当前位置的宝可梦
     */
    refresh(locationInfo) {
        if (!locationInfo) {
            locationInfo = getPlayerLocationInfo();
        }
        if (!locationInfo) return [];
        
        const key = this.getLocationKey(locationInfo);
        
        // 生成新的宝可梦列表
        const newList = PokemonSpawnEngine.spawnNearby(locationInfo);
        
        // 更新缓存
        this.cache[key] = newList;
        this.currentLocationKey = key;
        this.currentList = newList;
        
        console.log('[Pokemon] 刷新列表:', key, newList);
        return newList;
    },
    
    /**
     * 清除所有缓存
     */
    clearAll() {
        this.cache = {};
        this.currentList = [];
        this.currentLocationKey = null;
    }
};

window.PokemonSpawnCache = PokemonSpawnCache;
