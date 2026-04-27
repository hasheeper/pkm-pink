// =====================================================
// 位置上下文生成器 - 为LLM提供分层位置信息
// =====================================================

const LocationContextGenerator = {
    
    // 五大区域定义
    REGIONS: {
        'Region_Zenith': { name: 'Z区 ZENITH (中枢区)', center: [1, 1] },
        'Region_Neon': { name: 'N区 NEON (霓虹区)', center: [12, -12] },
        'Region_Bloom': { name: 'B区 BLOOM (盛放区)', center: [-13, -13] },
        'Region_Shadow': { name: 'S区 SHADOW (暗影区)', center: [12, 12] },
        'Region_Apex': { name: 'A区 APEX (极诣区)', center: [-13, 13] }
    },
    
    // 从mapinfo.json加载的地标数据（需要在初始化时填充）
    regionZones: {},   // Biome_Zone级别的地标
    biomeFlavor: {},   // 生态区域描述
    regionDescriptions: {}, // 大区描述（narrative_layer）
    service: {},       // 服务设施描述
    placeAnchor: {},   // 场所类型描述
    systemWarps: {},   // 传送点描述
    transitInfra: {},  // 交通设施描述
    npcContext: {},    // NPC场景描述
    
    /**
     * 初始化 - 加载mapinfo数据
     */
    init(mapInfoData) {
        if (mapInfoData) {
            this.regionZones = mapInfoData.region_zones || {};
            this.biomeFlavor = mapInfoData.biome_flavor || {};
            // service包含多种服务设施，包括宝可梦中心、商店等
            const serviceData = mapInfoData.service || {};
            this.service = serviceData;
            // place_anchor嵌套在service内
            this.placeAnchor = serviceData.place_anchor || mapInfoData.place_anchor || {};
            this.systemWarps = mapInfoData.system_warps || {};
            this.transitInfra = mapInfoData.transit_infrastructure || {};
            this.npcContext = mapInfoData.npc_actor_context || {};
            // 加载大区描述
            if (mapInfoData.narrative_layer && mapInfoData.narrative_layer.world_atmosphere) {
                this.regionDescriptions = mapInfoData.narrative_layer.world_atmosphere.regions || {};
            }
            console.log('[LocationContext] Loaded:', Object.keys(mapInfoData));
            console.log('[LocationContext] NPC contexts:', Object.keys(this.npcContext).length);
            console.log('[LocationContext] Services:', Object.keys(this.service).length);
        }
    },
    
    /**
     * 获取脚下格子的所有实体信息
     */
    getEntitiesAtGrid(gx, gy) {
        const entities = {
            biomeZone: null,
            regionZone: null,
            placeAnchor: null,
            npcActor: null,
            pokemonCenter: null,
            warp: null,
            service: null,
            bedRest: null,
            pcTerminal: null,
            policeBox: null,
            transitStation: null,
            lavaLine: null
        };
        
        if (!window.levelData) return entities;
        
        const worldX = gx * 16;
        const worldY = gy * 16;
        
        // 遍历所有实体层
        for (const layer of window.levelData.layerInstances) {
            if (layer.__type !== 'Entities' || !layer.entityInstances) continue;
            
            for (const ent of layer.entityInstances) {
                // 检查实体是否覆盖当前格子
                const ex = ent.px[0];
                const ey = ent.px[1];
                const ew = ent.width;
                const eh = ent.height;
                
                if (worldX >= ex && worldX < ex + ew && worldY >= ey && worldY < ey + eh) {
                    const id = ent.__identifier;
                    
                    // 获取实体的字段值
                    let fieldValue = null;
                    if (ent.fieldInstances && ent.fieldInstances.length > 0) {
                        fieldValue = ent.fieldInstances[0].__value;
                    }
                    
                    // 根据层名(__identifier)或实体类型匹配
                    const layerId = layer.__identifier;
                    
                    if (layerId === 'Biome_Zone' || id === 'Biome' || id.startsWith('Biome')) {
                        entities.biomeZone = fieldValue || id;
                    } else if (layerId === 'Region_Zone' || id.startsWith('Region_')) {
                        entities.regionZone = fieldValue || id;
                    } else if (layerId === 'Place_Anchor' || id === 'Place_Anchor') {
                        entities.placeAnchor = fieldValue;
                    } else if (layerId === 'NPC_Actor' || id === 'NPC_Actor') {
                        entities.npcActor = fieldValue;
                    } else if (id === 'Pokemon_Centers') {
                        entities.pokemonCenter = fieldValue;
                    } else if (id === 'Warp') {
                        entities.warp = fieldValue;
                    } else if (id === 'Shop_Kiosk') {
                        entities.service = fieldValue;
                    } else if (id === 'Bed_Rest') {
                        entities.bedRest = fieldValue;
                    } else if (id === 'PC_Terminal') {
                        entities.pcTerminal = 'PC_Terminal';
                    } else if (id === 'Police_Box') {
                        entities.policeBox = fieldValue;
                    } else if (id === 'Transit_Station') {
                        entities.transitStation = fieldValue;
                    } else if (id === 'Lava_Line') {
                        entities.lavaLine = fieldValue;
                    }
                }
            }
        }
        
        return entities;
    },
    
    /**
     * 获取格子的基本信息
     */
    getGridInfo(gx, gy) {
        if (!window.levelData) return null;
        
        const info = {
            gx, gy,
            surface: null,
            traversable: true,
            threat: 0,
            biomeZone: null,
            region: null
        };
        
        // 获取地表类型
        const surfaceVal = window.getIntVal ? window.getIntVal(gx, gy, 'Surface') : 0;
        if (surfaceVal > 0 && window.TERRAIN_CONFIG && window.TERRAIN_CONFIG[surfaceVal]) {
            info.surface = window.TERRAIN_CONFIG[surfaceVal].type;
        }
        
        // 获取可通行性
        const travVal = window.getIntVal ? window.getIntVal(gx, gy, 'Traversability') : 0;
        info.traversable = travVal !== 1; // 1 = 不可通行
        
        // 获取威胁度
        info.threat = window.getIntVal ? window.getIntVal(gx, gy, 'Threat') : 0;
        
        // 获取Biome_Zone
        const zoneInfo = typeof window.getZoneInfo === 'function' ? window.getZoneInfo(gx, gy) : null;
        if (zoneInfo && zoneInfo.tags && zoneInfo.tags.biome) {
            info.biomeZone = zoneInfo.tags.biome;
        }
        
        // 获取Region (intGrid值: 1=Void, 2=Zenith, 3=Neon, 4=Bloom, 5=Shadow, 6=Apex)
        const regionVal = window.getIntVal ? window.getIntVal(gx, gy, 'Regions') : 0;
        const regionMap = {
            2: 'Region_Zenith',
            3: 'Region_Neon',
            4: 'Region_Bloom',
            5: 'Region_Shadow',
            6: 'Region_Apex'
        };
        if (regionMap[regionVal]) {
            info.region = regionMap[regionVal];
        }
        
        return info;
    },
    
    /**
     * 获取周围格子的简要信息（包含实体信息）
     */
    getSurroundingInfo(gx, gy, radius = 2) {
        const surrounding = [];
        
        // 定义检查顺序：先十字方向，再对角
        const offsets = radius === 1 ? [
            { dx: 0, dy: -1, dir: '北' },
            { dx: 0, dy: 1, dir: '南' },
            { dx: -1, dy: 0, dir: '西' },
            { dx: 1, dy: 0, dir: '东' }
        ] : [
            { dx: 0, dy: -1, dir: '北' },
            { dx: 0, dy: 1, dir: '南' },
            { dx: -1, dy: 0, dir: '西' },
            { dx: 1, dy: 0, dir: '东' },
            { dx: -1, dy: -1, dir: '西北' },
            { dx: 1, dy: -1, dir: '东北' },
            { dx: -1, dy: 1, dir: '西南' },
            { dx: 1, dy: 1, dir: '东南' },
            { dx: 0, dy: -2, dir: '北2' },
            { dx: 0, dy: 2, dir: '南2' },
            { dx: -2, dy: 0, dir: '西2' },
            { dx: 2, dy: 0, dir: '东2' }
        ];
        
        for (const { dx, dy, dir } of offsets) {
            const ngx = gx + dx;
            const ngy = gy + dy;
            const info = this.getGridInfo(ngx, ngy);
            const entities = this.getEntitiesAtGrid(ngx, ngy);
            
            if (info) {
                surrounding.push({
                    direction: dir,
                    offset: [dx, dy],
                    surface: info.surface,
                    traversable: info.traversable,
                    threat: info.threat,
                    biomeZone: info.biomeZone || entities.biomeZone,
                    regionZone: entities.regionZone,
                    placeAnchor: entities.placeAnchor,
                    service: entities.service,
                    pokemonCenter: entities.pokemonCenter,
                    npcActor: entities.npcActor,
                    warp: entities.warp,
                    bedRest: entities.bedRest,
                    pcTerminal: entities.pcTerminal,
                    policeBox: entities.policeBox,
                    transitStation: entities.transitStation,
                    lavaLine: entities.lavaLine
                });
            }
        }
        
        return surrounding;
    },
    
    /**
     * 获取当前Biome_Zone内的地标列表
     */
    getBiomeZoneLandmarks(currentBiomeZone) {
        const landmarks = [];
        
        // 从mapinfo的region_zones中查找
        for (const [zoneName, zoneData] of Object.entries(this.regionZones)) {
            if (zoneData.center_point) {
                landmarks.push({
                    name: zoneName,
                    center: zoneData.center_point,
                    hasDescription: !!(zoneData.exterior_view || zoneData.internal_reality)
                });
            }
        }
        
        return landmarks;
    },
    
    /**
     * 获取当前Region内的所有地标
     */
    getRegionLandmarks(regionName) {
        const landmarks = [];
        
        // 根据Region筛选地标
        const regionPrefixes = {
            'Region_Zenith': ['Aether', 'Royal', 'Living', 'Lusamine', 'Eco', 'Academic', 'Zero_Halo', 'Arcadia'],
            'Region_Neon': ['Iono', 'Toxic', 'Cyber', 'Port', 'Glitch', 'Skyline', 'Synth', 'Golden', 'Radiant', 'Chrome'],
            'Region_Bloom': ['Pearl', 'Sunflora', 'Marina', 'Sapphire', 'Hermit', 'Aroma', 'Jade', 'Deep_Root', 'Silt', 'Breeze', 'Prism', 'Crystal', 'Mirror'],
            'Region_Shadow': ['Grim', 'Venom', 'Frost', 'Requiem', 'Canal', 'Kamunagi', 'Cinder', 'Silent', 'Spirit', 'Twilight', 'Crimson_Peat', 'Ginkgo', 'Mercury'],
            'Region_Apex': ['Crimson_Forge', 'Titan', 'Dune', 'Ruins', 'Savanna', 'Scorched', 'Obsidian', 'Inferno', 'Crimson_Badlands', 'Frostbite', 'Desolate']
        };
        
        const prefixes = regionPrefixes[regionName] || [];
        
        // 从region_zones查找
        for (const [zoneName, zoneData] of Object.entries(this.regionZones)) {
            if (prefixes.some(p => zoneName.includes(p)) && zoneData.center_point) {
                landmarks.push({
                    name: zoneName,
                    center: zoneData.center_point,
                    type: 'zone'
                });
            }
        }
        
        // 从biome_flavor查找
        for (const [biomeName, biomeData] of Object.entries(this.biomeFlavor)) {
            if (prefixes.some(p => biomeName.includes(p)) && biomeData.center_point) {
                landmarks.push({
                    name: biomeName,
                    center: biomeData.center_point,
                    type: 'biome'
                });
            }
        }
        
        return landmarks;
    },
    
    /**
     * 获取全图五大区域概览
     */
    getGlobalOverview() {
        return Object.entries(this.REGIONS).map(([id, data]) => ({
            id,
            name: data.name,
            center: data.center
        }));
    },
    
    /**
     * 生成完整的位置上下文文本（供LLM使用）
     */
    generateContextText(gx, gy) {
        const lines = [];
        
        // ========== 第1层：当前格子详细信息 ==========
        const current = this.getGridInfo(gx, gy);
        if (!current) {
            return '【位置信息不可用】';
        }
        
        // 使用game.js的坐标转换函数
        const displayCoords = window.toDisplayCoords ? window.toDisplayCoords(gx, gy) : { x: gx, y: gy };
        
        // 获取大区简称（Z/N/B/S/A）
        const regionShortMap = {
            'Region_Zenith': 'Z',
            'Region_Neon': 'N',
            'Region_Bloom': 'B',
            'Region_Shadow': 'S',
            'Region_Apex': 'A'
        };
        const regionShort = current.region ? regionShortMap[current.region] || '?' : '?';
        
        // 获取脚下实体信息
        const entities = this.getEntitiesAtGrid(gx, gy);
        const biomeZoneName = current.biomeZone || entities.biomeZone;
        
        lines.push('═══════════════════════════════════════');
        lines.push('【当前位置】');
        lines.push(`坐标: [${displayCoords.x}, ${displayCoords.y}] ${regionShort}`);
        lines.push(`地表: ${current.surface || '未知'}`);
        lines.push(`可通行: ${current.traversable ? '是' : '否'}`);
        lines.push(`威胁度: ${current.threat} (${this.getThreatLabel(current.threat)})`);
        
        // ========== 1. 大区信息（最大范围）==========
        if (current.region) {
            const regionName = this.REGIONS[current.region]?.name || current.region;
            lines.push(`所属大区: ${regionName}`);
            
            const regionDesc = this.regionDescriptions && this.regionDescriptions[current.region];
            if (regionDesc) {
                if (regionDesc.prompt_snippet) {
                    lines.push(`【大区氛围】${regionDesc.prompt_snippet}`);
                }
                if (regionDesc.geography_desc) {
                    lines.push(`【地理概述】${regionDesc.geography_desc}`);
                }
            }
        }
        
        // ========== 2. Region_Zone信息（建筑/设施区域）==========
        if (entities.regionZone) {
            lines.push(`所属设施区: ${entities.regionZone}`);
            const rzDesc = this.regionZones[entities.regionZone];
            if (rzDesc) {
                if (rzDesc.exterior_view) {
                    lines.push(`【外观描述】${rzDesc.exterior_view}`);
                }
                if (rzDesc.internal_reality) {
                    lines.push(`【内部环境】${rzDesc.internal_reality}`);
                }
            }
        }
        
        // ========== 3. Biome_Zone信息（生态区域）==========
        if (biomeZoneName) {
            lines.push(`所属生态区: ${biomeZoneName}`);
            const biomeDesc = this.biomeFlavor[biomeZoneName];
            if (biomeDesc) {
                if (biomeDesc.visual_texture) {
                    lines.push(`【视觉纹理】${biomeDesc.visual_texture}`);
                }
                if (biomeDesc.sensory_feed) {
                    lines.push(`【感官体验】${biomeDesc.sensory_feed}`);
                }
            }
        }
        
        // ========== 4. 点坐标设施 ==========
        if (entities.pokemonCenter) {
            const pcDesc = this.service[entities.pokemonCenter];
            lines.push(`【宝可梦中心】${pcDesc?.name || entities.pokemonCenter}`);
            if (pcDesc?.desc) lines.push(`  ${pcDesc.desc}`);
        }
        if (entities.service) {
            const svcDesc = this.service[entities.service];
            lines.push(`【服务设施】${svcDesc?.name || entities.service}`);
            if (svcDesc?.desc) lines.push(`  ${svcDesc.desc}`);
        }
        if (entities.placeAnchor) {
            const anchorDesc = this.placeAnchor[entities.placeAnchor];
            lines.push(`【场所类型】${entities.placeAnchor}`);
            if (anchorDesc?.desc) lines.push(`  ${anchorDesc.desc}`);
        }
        if (entities.warp) {
            const warpDesc = this.systemWarps[entities.warp];
            lines.push(`【传送点】${entities.warp}`);
            if (warpDesc?.desc) lines.push(`  ${warpDesc.desc}`);
        }
        if (entities.npcActor) {
            const npcDesc = this.npcContext[entities.npcActor];
            lines.push(`【NPC场景】${entities.npcActor}`);
            if (npcDesc?.desc) lines.push(`  ${npcDesc.desc}`);
        }
        if (entities.bedRest) {
            const bedDesc = this.service[entities.bedRest];
            lines.push(`【休息点】${bedDesc?.name || entities.bedRest}`);
            if (bedDesc?.desc) lines.push(`  ${bedDesc.desc}`);
        }
        if (entities.pcTerminal) {
            const pcTermDesc = this.service['PC_Terminal'];
            lines.push(`【PC终端】${pcTermDesc?.name || 'Box-Link Terminal'}`);
            if (pcTermDesc?.desc) lines.push(`  ${pcTermDesc.desc}`);
        }
        if (entities.policeBox) {
            const policeDesc = this.service[entities.policeBox];
            lines.push(`【警察站】${policeDesc?.name || entities.policeBox}`);
            if (policeDesc?.desc) lines.push(`  ${policeDesc.desc}`);
        }
        if (entities.transitStation) {
            const transitDesc = this.transitInfra[entities.transitStation];
            lines.push(`【交通站】${transitDesc?.name || entities.transitStation}`);
            if (transitDesc?.desc) lines.push(`  ${transitDesc.desc}`);
        }
        if (entities.lavaLine) {
            const lavaDesc = this.transitInfra[entities.lavaLine];
            lines.push(`【缆车站】${lavaDesc?.name || entities.lavaLine}`);
            if (lavaDesc?.desc) lines.push(`  ${lavaDesc.desc}`);
        }
        
        // ========== 附近宝可梦 ==========
        if (typeof window.PokemonSpawnCache !== 'undefined' && typeof window.getPlayerLocationInfo === 'function') {
            const locationInfo = window.getPlayerLocationInfo();
            if (locationInfo) {
                const pokemonList = window.PokemonSpawnCache.getForLocation(locationInfo);
                if (pokemonList && pokemonList.length > 0) {
                    lines.push('');
                    lines.push('───────────────────────────────────────');
                    lines.push('【附近宝可梦】');
                    for (const poke of pokemonList) {
                        const levelStr = poke.level ? `Lv.${poke.level}` : '';
                        const rarityStr = poke.rarity ? `(${poke.rarity})` : '';
                        lines.push(`  ${poke.id} ${levelStr} ${rarityStr}`);
                    }
                }
            }
        }
        
        // ========== 第2层：周围12格基本信息 ==========
        lines.push('');
        lines.push('───────────────────────────────────────');
        lines.push('【周围环境】(半径2格)');
        
        const surrounding = this.getSurroundingInfo(gx, gy, 2);
        
        // 按地表类型分组
        const surfaceGrouped = {};
        // 按生态区分组
        const biomeGrouped = {};
        // 按设施区分组
        const regionZoneGrouped = {};
        // 收集特殊设施
        const facilities = [];
        
        for (const s of surrounding) {
            if (s.surface === null) continue;
            
            // 地表分组
            const surfKey = `${s.surface}${s.traversable ? '' : '(不可通行)'}`;
            if (!surfaceGrouped[surfKey]) surfaceGrouped[surfKey] = [];
            surfaceGrouped[surfKey].push(s.direction);
            
            // 生态区分组
            if (s.biomeZone && s.biomeZone !== biomeZoneName) {
                if (!biomeGrouped[s.biomeZone]) biomeGrouped[s.biomeZone] = [];
                biomeGrouped[s.biomeZone].push(s.direction);
            }
            
            // 设施区分组
            if (s.regionZone && s.regionZone !== entities.regionZone) {
                if (!regionZoneGrouped[s.regionZone]) regionZoneGrouped[s.regionZone] = [];
                regionZoneGrouped[s.regionZone].push(s.direction);
            }
            
            // 收集特殊设施（只记录方向和名称）
            if (s.pokemonCenter) facilities.push({ dir: s.direction, type: 'PC', name: s.pokemonCenter });
            if (s.service) facilities.push({ dir: s.direction, type: '商店', name: s.service });
            if (s.placeAnchor) facilities.push({ dir: s.direction, type: '场所', name: s.placeAnchor });
            if (s.warp) facilities.push({ dir: s.direction, type: '传送', name: s.warp });
            if (s.npcActor) facilities.push({ dir: s.direction, type: 'NPC', name: s.npcActor });
            if (s.bedRest) facilities.push({ dir: s.direction, type: '休息', name: s.bedRest });
            if (s.pcTerminal) facilities.push({ dir: s.direction, type: 'PC终端', name: 'PC_Terminal' });
            if (s.policeBox) facilities.push({ dir: s.direction, type: '警察', name: s.policeBox });
            if (s.transitStation) facilities.push({ dir: s.direction, type: '交通', name: s.transitStation });
            if (s.lavaLine) facilities.push({ dir: s.direction, type: '缆车', name: s.lavaLine });
        }
        
        // 显示地表
        if (Object.keys(surfaceGrouped).length === 0) {
            lines.push('  (位于地图边缘，周围信息有限)');
        } else {
            for (const [terrain, dirs] of Object.entries(surfaceGrouped)) {
                lines.push(`  ${dirs.join('、')}: ${terrain}`);
            }
        }
        
        // 显示周围不同的生态区
        if (Object.keys(biomeGrouped).length > 0) {
            lines.push('  [周围生态区]');
            for (const [zone, dirs] of Object.entries(biomeGrouped)) {
                lines.push(`    ${dirs.join('、')}: ${zone}`);
            }
        }
        
        // 显示周围不同的设施区
        if (Object.keys(regionZoneGrouped).length > 0) {
            lines.push('  [周围设施区]');
            for (const [zone, dirs] of Object.entries(regionZoneGrouped)) {
                lines.push(`    ${dirs.join('、')}: ${zone}`);
            }
        }
        
        // 显示周围特殊设施
        if (facilities.length > 0) {
            lines.push('  [周围设施]');
            // 合并相同类型和名称的设施
            const facilityGrouped = {};
            for (const f of facilities) {
                const key = `${f.type}:${f.name}`;
                if (!facilityGrouped[key]) facilityGrouped[key] = { type: f.type, name: f.name, dirs: [] };
                facilityGrouped[key].dirs.push(f.dir);
            }
            for (const f of Object.values(facilityGrouped)) {
                lines.push(`    ${f.dirs.join('、')}: [${f.type}] ${f.name}`);
            }
        }
        
        // ========== 第3层：本Biome_Zone地标 ==========
        if (biomeZoneName) {
            lines.push('');
            lines.push('───────────────────────────────────────');
            lines.push(`【本区块地标】(${biomeZoneName})`);
            
            const biomeLandmarks = this.getBiomeZoneLandmarks(biomeZoneName);
            if (biomeLandmarks.length > 0) {
                for (const lm of biomeLandmarks.slice(0, 5)) {
                    // mapinfo中的坐标是显示坐标，计算距离需要转换
                    const dist = Math.abs(lm.center[0] - displayCoords.x) + Math.abs(lm.center[1] - displayCoords.y);
                    lines.push(`  • ${lm.name} [${lm.center[0]}, ${lm.center[1]}] (~${dist}格)`);
                }
            } else {
                lines.push('  (无已知地标)');
            }
        }
        
        // ========== 第4层：本Region地标 ==========
        if (current.region) {
            lines.push('');
            lines.push('───────────────────────────────────────');
            lines.push(`【本大区地标】(${this.REGIONS[current.region]?.name || current.region})`);
            
            const regionLandmarks = this.getRegionLandmarks(current.region);
            if (regionLandmarks.length > 0) {
                // 按距离排序，显示最近的8个
                regionLandmarks.sort((a, b) => {
                    const distA = Math.abs(a.center[0] - displayCoords.x) + Math.abs(a.center[1] - displayCoords.y);
                    const distB = Math.abs(b.center[0] - displayCoords.x) + Math.abs(b.center[1] - displayCoords.y);
                    return distA - distB;
                });
                
                for (const lm of regionLandmarks.slice(0, 8)) {
                    const dist = Math.abs(lm.center[0] - displayCoords.x) + Math.abs(lm.center[1] - displayCoords.y);
                    lines.push(`  • ${lm.name} [${lm.center[0]}, ${lm.center[1]}] (~${dist}格)`);
                }
            }
        }
        
        // ========== 第5层：全图区域概览 ==========
        lines.push('');
        lines.push('───────────────────────────────────────');
        lines.push('【全图区域】');
        
        const regions = this.getGlobalOverview();
        for (const r of regions) {
            const isCurrent = current.region === r.id;
            const marker = isCurrent ? '★' : '○';
            lines.push(`  ${marker} ${r.name} [${r.center[0]}, ${r.center[1]}]`);
        }
        
        lines.push('═══════════════════════════════════════');
        
        return lines.join('\n');
    },
    
    /**
     * 生成简洁版位置上下文（token更少）
     */
    generateCompactContext(gx, gy) {
        const current = this.getGridInfo(gx, gy);
        if (!current) return '位置不可用';
        
        const parts = [];
        
        // 当前位置一行
        parts.push(`[位置] (${gx},${gy}) ${current.surface || '?'} T${current.threat}`);
        
        // 周围地形简写
        const surrounding = this.getSurroundingInfo(gx, gy, 1);
        const nearbyTypes = [...new Set(surrounding.map(s => s.surface).filter(Boolean))];
        if (nearbyTypes.length > 0) {
            parts.push(`[周围] ${nearbyTypes.join(', ')}`);
        }
        
        // 区块和大区
        if (current.biomeZone) {
            parts.push(`[区块] ${current.biomeZone}`);
        }
        if (current.region) {
            parts.push(`[大区] ${this.REGIONS[current.region]?.name || current.region}`);
        }
        
        return parts.join(' | ');
    },
    
    /**
     * 威胁度标签
     */
    getThreatLabel(threat) {
        const labels = {
            0: '未知',
            1: '安全',
            2: '低危',
            3: '中危',
            4: '高危',
            5: '极危',
            6: '和平'
        };
        return labels[threat] || '未知';
    },
    
    /**
     * 查找最近的可通行格子（用于纠正LLM的错误坐标）
     */
    findNearestTraversable(gx, gy, maxRadius = 5) {
        // 先检查当前格子
        const current = this.getGridInfo(gx, gy);
        if (current && current.traversable) {
            return { gx, gy, distance: 0 };
        }
        
        // 螺旋搜索
        for (let r = 1; r <= maxRadius; r++) {
            for (let dx = -r; dx <= r; dx++) {
                for (let dy = -r; dy <= r; dy++) {
                    if (Math.abs(dx) === r || Math.abs(dy) === r) {
                        const info = this.getGridInfo(gx + dx, gy + dy);
                        if (info && info.traversable) {
                            return { 
                                gx: gx + dx, 
                                gy: gy + dy, 
                                distance: Math.abs(dx) + Math.abs(dy) 
                            };
                        }
                    }
                }
            }
        }
        
        return null; // 找不到
    },
    
    /**
     * 根据地标名称查找坐标
     */
    findLandmarkByName(name) {
        // 先在region_zones中查找
        for (const [zoneName, zoneData] of Object.entries(this.regionZones)) {
            if (zoneName.toLowerCase().includes(name.toLowerCase()) && zoneData.center_point) {
                return {
                    name: zoneName,
                    center: zoneData.center_point,
                    type: 'zone'
                };
            }
        }
        
        // 再在biome_flavor中查找
        for (const [biomeName, biomeData] of Object.entries(this.biomeFlavor)) {
            if (biomeName.toLowerCase().includes(name.toLowerCase()) && biomeData.center_point) {
                return {
                    name: biomeName,
                    center: biomeData.center_point,
                    type: 'biome'
                };
            }
        }
        
        // 在REGIONS中查找
        for (const [regionId, regionData] of Object.entries(this.REGIONS)) {
            if (regionData.name.includes(name) || regionId.toLowerCase().includes(name.toLowerCase())) {
                return {
                    name: regionData.name,
                    center: regionData.center,
                    type: 'region'
                };
            }
        }
        
        return null;
    }
};

// 导出
window.LocationContextGenerator = LocationContextGenerator;
