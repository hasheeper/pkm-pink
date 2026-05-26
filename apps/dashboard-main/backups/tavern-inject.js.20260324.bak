/**
 * PKM Dashboard - SillyTavern 悬浮球注入脚本
 * 点击悬浮球打开 GitHub Pages 上的 PKM 面板
 * 包含 ERA 变量获取、位置上下文注入逻辑
 */

(function() {
    'use strict';
    
    const PKM_URL = 'https://hasheeper.github.io/pkm55/';
    const LOCATION_INJECT_ID = 'pkm_location_context';
    
    // 等待 jQuery 加载
    function waitForJQuery(callback) {
        if (typeof jQuery !== 'undefined') {
            callback(jQuery);
        } else {
            setTimeout(() => waitForJQuery(callback), 100);
        }
    }
    
    waitForJQuery(function($) {
        console.log('[PKM] 悬浮球脚本加载中...');
        
        // 清理旧元素
        $('[id^="pkm-"]').remove();
        
        // 动画样式
        const animationStyle = `
            <style id="pkm-anim-style">
                @keyframes pkm-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes pkm-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); }
                    50% { box-shadow: 0 0 0 12px rgba(255, 215, 0, 0); }
                }
            </style>
        `;
        if (!$('#pkm-anim-style').length) {
            $('head').append(animationStyle);
        }
        
        // 创建容器
        const container = $('<div>')
            .attr('id', 'pkm-container')
            .css({
                position: 'fixed',
                top: '80px',
                right: '20px',
                zIndex: '99999'
            });
        
        // 悬浮球
        const ball = $('<div>')
            .attr('id', 'pkm-ball')
            .css({
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(255, 165, 0, 0.5)',
                animation: 'pkm-float 3s ease-in-out infinite, pkm-pulse 2s ease-in-out infinite',
                transition: 'transform 0.2s ease'
            })
            .html(`
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
                    <circle cx="12" cy="12" r="10" stroke="#333" stroke-width="2" fill="none"/>
                    <line x1="2" y1="12" x2="22" y2="12" stroke="#333" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="#333"/>
                </svg>
            `)
            .hover(
                function() { $(this).css({ transform: 'scale(1.1)' }); },
                function() { $(this).css({ transform: 'scale(1)' }); }
            );
        
        // 遮罩层（参考 build-iframe.js）
        const overlay = $('<div>')
            .attr('id', 'pkm-overlay')
            .css({
                'position': 'fixed',
                'top': '0',
                'left': '0',
                'right': '0',
                'bottom': '0',
                'width': '100vw',
                'height': '97.5vh',
                'background': 'rgba(0, 0, 0, 0.5)',
                'backdrop-filter': 'blur(4px)',
                'pointer-events': 'auto',
                'display': 'none',
                'align-items': 'center',
                'justify-content': 'center',
                'padding': '1px',
                'z-index': 2147483646,
                'overflow': 'hidden'
            });
        
        // 内容包装器（参考 build-iframe.js）
        const contentWrapper = $('<div>')
            .attr('id', 'pkm-content-wrapper')
            .css({
                'position': 'relative',
                'width': '100%',
                'max-width': '485px',
                'height': '95vh',
                'max-height': '850px',
                'display': 'flex',
                'flex-direction': 'column',
                'align-items': 'center',
                'justify-content': 'center',
                'pointer-events': 'auto'
            });
        
        // iframe（预加载用的隐藏 iframe）
        const hiddenIframe = $('<iframe>')
            .attr('id', 'pkm-iframe-hidden')
            .css({
                'position': 'fixed',
                'top': '-9999px',
                'left': '-9999px',
                'width': '485px',
                'height': '850px',
                'border': 'none',
                'visibility': 'hidden',
                'pointer-events': 'none'
            });
        
        // 显示用的 iframe（在 overlay 内）
        const iframe = $('<iframe>')
            .attr('id', 'pkm-iframe')
            .css({
                'width': '100%',
                'height': '100%',
                'border': 'none',
                'border-radius': '24px',
                'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                'background': '#f2f4f8',
                'overflow': 'hidden'
            });
        
        // 关闭按钮（参考 build-iframe.js）
        const closeIconSvg = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>`;
        
        const closeBtn = $('<div>')
            .attr('id', 'pkm-close-btn')
            .html(closeIconSvg)
            .css({
                'position': 'absolute',
                'top': '-5px',
                'right': '-10px',
                'width': '40px',
                'height': '40px',
                'background': 'rgba(255, 255, 255, 0.85)',
                'backdrop-filter': 'blur(4px)',
                'border-radius': '50%',
                'cursor': 'pointer',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'color': '#636e72',
                'z-index': 100,
                'pointer-events': 'auto',
                'transition': 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            });
        
        closeBtn.hover(
            function() {
                $(this).css({
                    'transform': 'rotate(90deg) scale(1.1)',
                    'background': '#ff7675',
                    'color': '#fff'
                });
            },
            function() {
                $(this).css({
                    'transform': 'rotate(0deg) scale(1)',
                    'background': 'rgba(255, 255, 255, 0.85)',
                    'color': '#636e72'
                });
            }
        );
        
        // 组装
        contentWrapper.append(iframe).append(closeBtn);
        overlay.append(contentWrapper);
        container.append(ball);
        $('body').append(container).append(overlay).append(hiddenIframe);
        
        // ========== ERA 变量获取 ==========
        async function getEraVars() {
            return new Promise((resolve) => {
                if (typeof eventEmit === 'undefined' || typeof eventOn === 'undefined') {
                    console.warn('[PKM] eventEmit/eventOn 不可用');
                    resolve(null);
                    return;
                }
                
                const timeout = setTimeout(() => {
                    console.warn('[PKM] ERA 查询超时');
                    resolve(null);
                }, 3000);
                
                eventOn('era:queryResult', (detail) => {
                    if (detail.queryType === 'getCurrentVars') {
                        clearTimeout(timeout);
                        resolve(detail.result?.statWithoutMeta || null);
                    }
                }, { once: true });
                
                eventEmit('era:getCurrentVars');
            });
        }
        
        // ========== 位置上下文生成器（后端版本，完整逻辑）==========
        const LocationContextBackend = {
            // 数据缓存
            mapInfoData: null,
            mapData: null,
            spawnTablesData: null,
            dataLoaded: false,
            
            // 五大区域定义
            REGIONS: {
                'Region_Zenith': { name: 'Z区 ZENITH (中枢区)', center: [1, 1], short: 'Z' },
                'Region_Neon': { name: 'N区 NEON (霓虹区)', center: [12, -12], short: 'N' },
                'Region_Bloom': { name: 'B区 BLOOM (盛放区)', center: [-13, -13], short: 'B' },
                'Region_Shadow': { name: 'S区 SHADOW (暗影区)', center: [12, 12], short: 'S' },
                'Region_Apex': { name: 'A区 APEX (极诣区)', center: [-13, 13], short: 'A' }
            },
            
            // 从mapinfo.json加载的地标数据
            regionZones: {},
            biomeFlavor: {},
            regionDescriptions: {},
            service: {},
            placeAnchor: {},
            systemWarps: {},
            transitInfra: {},
            npcContext: {},
            
            // mapdata.json 到 mapinfo.json 的键名映射（处理不一致）
            TRANSIT_ID_MAP: {
                'Summit_Dojo_POINT': 'Summit_Dojo_Point',
                'Northern_Cemetery': 'Northern_Cemetery_Pad',
                'Zenith_HQ': 'Zenith_HQ_Helipad'
            },
            
            // system_warps 映射（去掉 _N 后缀）
            WARP_ID_MAP: {
                'Sewer_0': 'Sewer', 'Sewer_1': 'Sewer', 'Sewer_2': 'Sewer',
                'Cave_0': 'Cave', 'Cave_1': 'Cave', 'Cave_2': 'Cave',
                'Gate_0': 'Gate', 'Gate_1': 'Gate'
            },
            
            // NPC Actor 映射（处理重复或别名）
            NPC_ID_MAP: {
                'Iono_Stream_Tower': 'Iono_Levincia_Guild_Tower'
            },
            
            // NPC 触发词映射字典 (名字多语言对照表)
            NPC_TRIGGERS: {
                'lusamine': ['Lusamine', 'ルザミーネ', '露莎米奈', '露莎米那', '露莎米恩', '卢莎米奈'],
                'erika': ['Erika', 'エリカ', '莉佳', '艾莉嘉'],
                'roxie': ['Roxie', 'Homika', 'ホミカ', '霍米加', '霍米卡'],
                'iono': ['Iono', 'Nanjamo', 'ナンジャモ', '奇树', '奇樹'],
                'marnie': ['Marnie', 'マリィ', '玛俐', '瑪俐', '真俐'],
                'cynthia': ['Cynthia', 'Shirona', 'シロナ', '竹兰', '竹蘭', '希罗娜', '希羅娜'],
                'bea': ['Saito', 'サイトウ', '彩豆'],
                'sonia': ['Sonia', 'ソニア', '索妮亚', '索妮亞'],
                'gloria': ['Gloria', 'Yuuri', 'ユウリ', '小优', '小優', '優莉'],
                'rosa': ['Rosa', 'メイ', '鸣依', '鳴依', '芽以'],
                'dawn': ['Hikari', 'ヒカリ', '小光'],
                'serena': ['Serena', 'セレナ', '莎莉娜', '瑟蕾娜', '瑟琳娜'],
                'irida': ['Irida', 'カイ', '珠贝', '珠貝'],
                'akari': ['Akari', 'ショウ', '小照'],
                'nessa': ['Nessa', 'Rurina', 'ルリナ', '露璃娜'],
                'mallow': ['Mallow', 'マオ', '玛奥', '瑪奧', '玛沃'],
                'lana': ['Suiren', 'スイレン', '水莲', '水蓮'],
                'lillie': ['Lillie', 'Lilie', 'リーリエ', '莉莉艾', '莉莉愛', '莉莉安'],
                'hex': ['Hex Maniac', 'Occult Maniac', 'オカルトマニア', '灵异迷', '靈異迷', '海可丝'],
                'selene': ['Selene', 'Mizuki', 'ミヅキ', '美月'],
                'juliana': ['Juliana', 'アオイ', '小青'],
                'may': ['Haruka', 'ハルカ', '小遥', '小遙'],
                'lacey': ['Lacey', 'Nerine', 'ネリネ', '紫竽', '紫玉', '紫芋'],
                'misty': ['Misty', 'Kasumi', 'カスミ', '小霞'],
                'acerola': ['Acerola', 'アセロラ', '阿塞萝拉', '阿塞蘿拉', '阿塞罗拉'],
                'skyla': ['Skyla', 'Fuuro', 'フウロ', '风露', '風露'],
                'iris': ['Iris', 'アイリス', '艾莉丝', '艾莉絲', '艾丽丝'],
                'nemona': ['Nemona', 'ネモ', '妮莫', '尼莫']
            },
            
            // NPC 触发词到地图 NPC ID 的映射
            NPC_TRIGGER_TO_MAP_ID: {
                'lusamine': 'Lusamine',
                'erika': 'Erika',
                'roxie': 'Roxie',
                'iono': 'Iono',
                'marnie': 'Marnie',
                'cynthia': 'Cynthia',
                'bea': 'Bea',
                'sonia': 'Sonia',
                'gloria': 'Gloria',
                'rosa': 'Rosa',
                'dawn': 'Dawn',
                'serena': 'Serena',
                'irida': 'Irida',
                'akari': 'Akari',
                'nessa': 'Nessa',
                'mallow': 'Mallow_Lana',  // Mallow 和 Lana 在一起
                'lana': 'Mallow_Lana',    // Mallow 和 Lana 在一起
                'lillie': 'Lillie',
                'hex': 'Hex',
                'selene': 'Selene',
                'juliana': 'Juliana',
                'may': 'May',
                'lacey': 'Lacey',
                'misty': 'Misty',
                'acerola': 'Acerola',
                'skyla': 'Skyla',
                'iris': 'Iris',
                'nemona': 'Nemona'
            },
            
            // 获取规范化的交通设施ID
            normalizeTransitId(id) {
                return this.TRANSIT_ID_MAP[id] || id;
            },
            
            // 获取规范化的传送点ID
            normalizeWarpId(id) {
                return this.WARP_ID_MAP[id] || id;
            },
            
            // 获取规范化的NPC Actor ID
            normalizeNpcId(id) {
                return this.NPC_ID_MAP[id] || id;
            },
            
            // 加载所有数据文件
            async loadData() {
                if (this.dataLoaded) return true;
                
                try {
                    console.log('[PKM] 加载地图数据文件...');
                    
                    // 并行加载所有数据
                    const [mapInfoRes, mapDataRes] = await Promise.all([
                        fetch(PKM_URL + 'map/data/mapinfo.json'),
                        fetch(PKM_URL + 'map/data/mapdata.json')
                    ]);
                    
                    if (mapInfoRes.ok) {
                        this.mapInfoData = await mapInfoRes.json();
                        this.initFromMapInfo(this.mapInfoData);
                        console.log('[PKM] ✓ mapinfo.json 已加载');
                    }
                    
                    if (mapDataRes.ok) {
                        this.mapData = await mapDataRes.json();
                        console.log('[PKM] ✓ mapdata.json 已加载');
                    }
                    
                    // 加载 pkmdata.js（通过动态 script）
                    await this.loadPkmData();
                    
                    this.dataLoaded = true;
                    console.log('[PKM] ✓ 所有地图数据加载完成');
                    return true;
                } catch (e) {
                    console.error('[PKM] 加载地图数据失败:', e);
                    return false;
                }
            },
            
            // 加载 pkmdata.js
            async loadPkmData() {
                return new Promise((resolve) => {
                    if (window.SPAWN_TABLES_DATA) {
                        this.spawnTablesData = window.SPAWN_TABLES_DATA;
                        resolve();
                        return;
                    }
                    
                    const script = document.createElement('script');
                    script.src = PKM_URL + 'map/data/pkmdata.js';
                    script.onload = () => {
                        this.spawnTablesData = window.SPAWN_TABLES_DATA;
                        console.log('[PKM] ✓ pkmdata.js 已加载');
                        resolve();
                    };
                    script.onerror = () => {
                        console.warn('[PKM] pkmdata.js 加载失败');
                        resolve();
                    };
                    document.head.appendChild(script);
                });
            },
            
            
            // 初始化 mapinfo 数据
            initFromMapInfo(mapInfoData) {
                if (!mapInfoData) return;
                
                this.regionZones = mapInfoData.region_zones || {};
                this.biomeFlavor = mapInfoData.biome_flavor || {};
                const serviceData = mapInfoData.service || {};
                this.service = serviceData;
                this.placeAnchor = serviceData.place_anchor || mapInfoData.place_anchor || {};
                this.systemWarps = mapInfoData.system_warps || {};
                this.transitInfra = mapInfoData.transit_infrastructure || {};
                this.npcContext = mapInfoData.npc_actor_context || {};
                
                if (mapInfoData.narrative_layer && mapInfoData.narrative_layer.world_atmosphere) {
                    this.regionDescriptions = mapInfoData.narrative_layer.world_atmosphere.regions || {};
                }
            },
            
            // 根据显示坐标判断所属大区
            getRegionByCoords(x, y) {
                // 基于象限和距离判断
                if (Math.abs(x) <= 6 && Math.abs(y) <= 6) return 'Region_Zenith';
                if (x > 0 && y < 0) return 'Region_Neon';
                if (x < 0 && y < 0) return 'Region_Bloom';
                if (x > 0 && y > 0) return 'Region_Shadow';
                if (x < 0 && y > 0) return 'Region_Apex';
                return 'Region_Zenith';
            },
            
            // 根据坐标查找最近的 Region_Zone
            findNearestRegionZone(x, y) {
                let nearest = null;
                let minDist = Infinity;
                
                for (const [zoneName, zoneData] of Object.entries(this.regionZones)) {
                    if (zoneData.center_point) {
                        const dist = Math.abs(zoneData.center_point[0] - x) + Math.abs(zoneData.center_point[1] - y);
                        if (dist < minDist && dist <= 8) {
                            minDist = dist;
                            nearest = { name: zoneName, data: zoneData, distance: dist };
                        }
                    }
                }
                return nearest;
            },
            
            // 根据坐标查找最近的 Biome_Zone
            findNearestBiomeZone(x, y) {
                let nearest = null;
                let minDist = Infinity;
                
                for (const [biomeName, biomeData] of Object.entries(this.biomeFlavor)) {
                    if (biomeData.center_point) {
                        const dist = Math.abs(biomeData.center_point[0] - x) + Math.abs(biomeData.center_point[1] - y);
                        if (dist < minDist && dist <= 10) {
                            minDist = dist;
                            nearest = { name: biomeName, data: biomeData, distance: dist };
                        }
                    }
                }
                return nearest;
            },
            
            // 威胁度标签
            getThreatLabel(threat) {
                const labels = { 0: '未知', 1: '安全', 2: '低危', 3: '中危', 4: '高危', 5: '极危', 6: '和平' };
                return labels[threat] || '未知';
            },
            
            // 获取当前区域的所有 NPC 住址位置
            getNpcLocationsInRegion(regionId) {
                if (!this.mapData || !this.mapData.levels) return [];
                
                const npcLocations = [];
                
                for (const level of this.mapData.levels) {
                    if (!level.layerInstances) continue;
                    
                    for (const layer of level.layerInstances) {
                        if (layer.__identifier !== 'NPC_Actor') continue;
                        if (!layer.entityInstances) continue;
                        
                        for (const entity of layer.entityInstances) {
                            if (entity.__identifier !== 'NPC_Actor') continue;
                            
                            const gx = entity.__grid[0];
                            const gy = entity.__grid[1];
                            const displayCoords = this.toDisplayCoords(gx, gy);
                            const npcRegion = this.getRegionByCoords(displayCoords.x, displayCoords.y);
                            
                            // 获取 NPC ID
                            let npcId = null;
                            for (const field of entity.fieldInstances || []) {
                                if (field.__identifier === 'NPC_Actor') {
                                    npcId = field.__value;
                                    break;
                                }
                            }
                            
                            if (npcId && npcRegion === regionId) {
                                npcLocations.push({
                                    id: npcId,
                                    gx: gx,
                                    gy: gy,
                                    displayX: displayCoords.x,
                                    displayY: displayCoords.y,
                                    desc: this.npcContext[npcId]?.desc || null
                                });
                            }
                        }
                    }
                }
                
                return npcLocations;
            },
            
            // 扫描文本检测 NPC 触发词（返回匹配到的 NPC key 列表）
            scanForNpcTriggers(text) {
                if (!text) return [];
                
                const triggeredNpcs = new Set();
                const lowerText = text.toLowerCase();
                
                for (const [npcKey, triggers] of Object.entries(this.NPC_TRIGGERS)) {
                    for (const trigger of triggers) {
                        // 大小写不敏感匹配
                        if (lowerText.includes(trigger.toLowerCase())) {
                            triggeredNpcs.add(npcKey);
                            break;
                        }
                    }
                }
                
                return Array.from(triggeredNpcs);
            },
            
            // 获取所有 NPC 位置（全图）
            getAllNpcLocations() {
                if (!this.mapData || !this.mapData.levels) return [];
                
                const npcLocations = [];
                const gridSize = 16;
                
                for (const level of this.mapData.levels) {
                    if (!level.layerInstances) continue;
                    
                    for (const layer of level.layerInstances) {
                        if (layer.__identifier !== 'NPC_Actor') continue;
                        if (!layer.entityInstances) continue;
                        
                        for (const entity of layer.entityInstances) {
                            if (entity.__identifier !== 'NPC_Actor') continue;
                            
                            const gx = entity.__grid[0];
                            const gy = entity.__grid[1];
                            const displayCoords = this.toDisplayCoords(gx, gy);
                            
                            let npcId = null;
                            for (const field of entity.fieldInstances || []) {
                                if (field.__identifier === 'NPC_Actor') {
                                    npcId = field.__value;
                                    break;
                                }
                            }
                            
                            if (npcId) {
                                npcLocations.push({
                                    id: npcId,
                                    gx, gy,
                                    displayX: displayCoords.x,
                                    displayY: displayCoords.y,
                                    desc: this.npcContext[npcId]?.desc || null,
                                    name: this.npcContext[npcId]?.name || npcId.replace(/_/g, ' ')
                                });
                            }
                        }
                    }
                }
                
                return npcLocations;
            },
            
            // 根据触发的 NPC key 获取对应的地图位置
            getNpcLocationsByTriggers(triggeredNpcKeys) {
                if (!triggeredNpcKeys || triggeredNpcKeys.length === 0) return [];
                
                const allNpcLocations = this.getAllNpcLocations();
                const matchedLocations = [];
                
                for (const npcKey of triggeredNpcKeys) {
                    const mapIdPrefix = this.NPC_TRIGGER_TO_MAP_ID[npcKey];
                    if (!mapIdPrefix) continue;
                    
                    // 查找所有匹配该 NPC 的位置（NPC ID 以 mapIdPrefix 开头）
                    for (const loc of allNpcLocations) {
                        if (loc.id.startsWith(mapIdPrefix + '_') || loc.id === mapIdPrefix) {
                            matchedLocations.push({
                                ...loc,
                                triggerKey: npcKey,
                                displayName: this.NPC_TRIGGERS[npcKey]?.[0] || mapIdPrefix
                            });
                        }
                    }
                }
                
                return matchedLocations;
            },
            
            // 显示坐标转内部格子坐标（与 game.js 的 toInternalCoords 一致）
            toInternalCoords(displayX, displayY) {
                // 地图中心点（内部坐标）- 与 map/game.js 保持一致
                const MAP_CENTER_X = 26;
                const MAP_CENTER_Y = 26;
                
                // X轴：跳过0的逆运算
                let x = displayX;
                if (x > 0) x -= 1;
                let internalX = x + MAP_CENTER_X;
                
                // Y轴反向：跳过0的逆运算
                let y = displayY;
                if (y > 0) y -= 1;
                let internalY = MAP_CENTER_Y - y - 1;
                
                return { gx: internalX, gy: internalY };
            },
            
            // 内部格子坐标转显示坐标（toInternalCoords 的逆运算）
            toDisplayCoords(gx, gy) {
                const MAP_CENTER_X = 26;
                const MAP_CENTER_Y = 26;
                
                // X轴逆运算
                let displayX = gx - MAP_CENTER_X;
                if (displayX >= 0) displayX += 1;
                
                // Y轴逆运算
                let displayY = MAP_CENTER_Y - gy - 1;
                if (displayY >= 0) displayY += 1;
                
                return { x: displayX, y: displayY };
            },
            
            // 从 mapdata.json 获取指定格子的实体信息
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
                    lavaLine: null,
                    seaRoute: null,
                    skyNet: null,
                    // 异变实体
                    paradoxAnchors: [],
                    ultraWormholes: []
                };
                
                if (!this.mapData || !this.mapData.levels || !this.mapData.levels[0]) return entities;
                
                const levelData = this.mapData.levels[0];
                const worldX = gx * 16;
                const worldY = gy * 16;
                
                // 遍历所有实体层
                for (const layer of levelData.layerInstances || []) {
                    if (layer.__type !== 'Entities' || !layer.entityInstances) continue;
                    
                    for (const ent of layer.entityInstances) {
                        const ex = ent.px[0];
                        const ey = ent.px[1];
                        const ew = ent.width;
                        const eh = ent.height;
                        
                        // 检查实体是否覆盖当前格子
                        if (worldX >= ex && worldX < ex + ew && worldY >= ey && worldY < ey + eh) {
                            const id = ent.__identifier;
                            const layerId = layer.__identifier;
                            
                            // 获取实体的字段值
                            let fieldValue = null;
                            if (ent.fieldInstances && ent.fieldInstances.length > 0) {
                                fieldValue = ent.fieldInstances[0].__value;
                            }
                            
                            // 根据层名或实体类型匹配
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
                            } else if (id === 'Sea_Route') {
                                entities.seaRoute = fieldValue;
                            } else if (id === 'Sky_Net') {
                                entities.skyNet = fieldValue;
                            } else if (layerId === 'Ultra_Wormhole' || id === 'Ultra_Wormhole') {
                                // 究极之洞实体
                                if (fieldValue) {
                                    entities.ultraWormholes.push(fieldValue);
                                }
                            } else if (layerId === 'Paradox_Anchors' || id === 'Paradox_Anchors') {
                                // 悖谬锚点实体
                                if (fieldValue) {
                                    entities.paradoxAnchors.push(fieldValue);
                                }
                            }
                        }
                    }
                }
                
                return entities;
            },
            
            // 生成完整的位置上下文文本
            generateContextText(x, y) {
                const lines = [];
                
                // 获取大区
                const regionId = this.getRegionByCoords(x, y);
                const regionInfo = this.REGIONS[regionId];
                const regionShort = regionInfo?.short || '?';
                
                // 转换为内部坐标并获取实体和格子信息
                const internal = this.toInternalCoords(x, y);
                const entities = this.getEntitiesAtGrid(internal.gx, internal.gy);
                const gridInfo = this.getGridInfo(internal.gx, internal.gy);
                
                lines.push('【当前位置】');
                lines.push(`坐标: [${x}, ${y}] ZONE-${regionShort}`);
                lines.push(`地表: ${gridInfo.surface || '未知'}`);
                lines.push(`可通行: ${gridInfo.traversable ? '是' : '否'}`);
                lines.push(`威胁度: ${gridInfo.threat} (${this.getThreatLabel(gridInfo.threat)})`);
                
                // 大区信息
                if (regionInfo) {
                    lines.push(`所属大区: ${regionInfo.name}`);
                    
                    const regionDesc = this.regionDescriptions[regionId];
                    if (regionDesc) {
                        if (regionDesc.prompt_snippet) {
                            lines.push(`【大区氛围】${regionDesc.prompt_snippet}`);
                        }
                        if (regionDesc.geography_desc) {
                            lines.push(`【地理概述】${regionDesc.geography_desc}`);
                        }
                    }
                }
                
                // ========== 区域描述优先级：水系 > 人文区 > 非水系生态区 ==========
                const waterBiomes = [
                    'Zero_Halo_Moat', 'Mirror_Lotis_Lake', 'Emerald_Vein_River', 'Crystal_Lagoon',
                    'Twin_Destiny_Basin', 'Chrome_Canal', 'Ferro_Straits', 'Mercury_Stream',
                    'Frigid_Floe', 'Mist_Veil_Sound', 'Prism_Bay', 'Cerulean_Reef',
                    'Basalt_Shoals', 'Equatorial_Dark_Zone', 'Titan_Trough', 'Chrome_Abyss', 'Boreal_Trench'
                ];
                
                const hasRegionZone = entities.regionZone;
                const hasBiomeZone = entities.biomeZone;
                const isWaterBiome = hasBiomeZone && waterBiomes.includes(entities.biomeZone);
                
                // 1. 优先显示水系生态区
                if (isWaterBiome) {
                    lines.push(`所属水域: ${entities.biomeZone}`);
                    const biomeDesc = this.biomeFlavor[entities.biomeZone];
                    if (biomeDesc) {
                        if (biomeDesc.visual_texture) lines.push(`【视觉纹理】${biomeDesc.visual_texture}`);
                        if (biomeDesc.sensory_feed) lines.push(`【感官体验】${biomeDesc.sensory_feed}`);
                    }
                }
                // 2. 其次显示人文区（如果不是水系）
                else if (hasRegionZone) {
                    lines.push(`所属设施区: ${entities.regionZone}`);
                    const rzDesc = this.regionZones[entities.regionZone];
                    if (rzDesc) {
                        if (rzDesc.exterior_view) lines.push(`【外观描述】${rzDesc.exterior_view}`);
                        if (rzDesc.internal_reality) lines.push(`【内部环境】${rzDesc.internal_reality}`);
                    }
                }
                // 3. 最后显示非水系生态区
                else if (hasBiomeZone) {
                    lines.push(`所属生态区: ${entities.biomeZone}`);
                    const biomeDesc = this.biomeFlavor[entities.biomeZone];
                    if (biomeDesc) {
                        if (biomeDesc.visual_texture) lines.push(`【视觉纹理】${biomeDesc.visual_texture}`);
                        if (biomeDesc.sensory_feed) lines.push(`【感官体验】${biomeDesc.sensory_feed}`);
                    }
                }
                // 4. 如果都没有，查找最近的区域
                else {
                    const nearestRZ = this.findNearestRegionZone(x, y);
                    const nearestBZ = this.findNearestBiomeZone(x, y);
                    
                    // 优先显示距离更近的
                    if (nearestRZ && (!nearestBZ || nearestRZ.distance <= nearestBZ.distance)) {
                        lines.push(`附近设施区: ${nearestRZ.name} (~${nearestRZ.distance}格)`);
                        if (nearestRZ.data.exterior_view) lines.push(`【外观描述】${nearestRZ.data.exterior_view}`);
                        if (nearestRZ.data.internal_reality) lines.push(`【内部环境】${nearestRZ.data.internal_reality}`);
                    } else if (nearestBZ) {
                        lines.push(`附近生态区: ${nearestBZ.name} (~${nearestBZ.distance}格)`);
                        if (nearestBZ.data.visual_texture) lines.push(`【视觉纹理】${nearestBZ.data.visual_texture}`);
                        if (nearestBZ.data.sensory_feed) lines.push(`【感官体验】${nearestBZ.data.sensory_feed}`);
                    }
                }
                
                // ========== 点坐标设施 ==========
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
                    lines.push(`【场所类型】${anchorDesc?.name || entities.placeAnchor}`);
                    if (anchorDesc?.desc) lines.push(`  ${anchorDesc.desc}`);
                }
                if (entities.warp) {
                    const normalizedWarpId = this.normalizeWarpId(entities.warp);
                    const warpDesc = this.systemWarps[normalizedWarpId];
                    lines.push(`【传送点】${normalizedWarpId}`);
                    if (warpDesc?.desc) lines.push(`  ${warpDesc.desc}`);
                }
                if (entities.npcActor) {
                    const normalizedNpcId = this.normalizeNpcId(entities.npcActor);
                    const npcDesc = this.npcContext[normalizedNpcId];
                    lines.push(`【NPC场景】${normalizedNpcId.replace(/_/g, ' ')}`);
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
                if (entities.seaRoute) {
                    const seaDesc = this.transitInfra[entities.seaRoute];
                    lines.push(`【港口码头】${seaDesc?.name || entities.seaRoute}`);
                    if (seaDesc?.desc) lines.push(`  ${seaDesc.desc}`);
                }
                if (entities.skyNet) {
                    const normalizedId = this.normalizeTransitId(entities.skyNet);
                    const skyDesc = this.transitInfra[normalizedId];
                    lines.push(`【空运停机坪】${skyDesc?.name || normalizedId.replace(/_/g, ' ')}`);
                    if (skyDesc?.desc) lines.push(`  ${skyDesc.desc}`);
                }
                
                // ========== 当前区域 NPC 住址列表 ==========
                const npcLocations = this.getNpcLocationsInRegion(regionId);
                if (npcLocations.length > 0) {
                    lines.push('');
                    lines.push(`【${regionInfo?.name || regionId} NPC住址】`);
                    for (const npc of npcLocations) {
                        const npcName = npc.id.replace(/_/g, ' ');
                        lines.push(`  • ${npcName} [${npc.displayX}, ${npc.displayY}]`);
                    }
                }
                
                // ========== 重要地标（全图显示）==========
                lines.push('');
                lines.push('【重要地标】');
                // Player_s_Room: 格子坐标 [30, 22] -> 显示坐标 [5, 4]
                const playerRoomCoords = this.toDisplayCoords(30, 22);
                const playerRoomDesc = this.placeAnchor['Player_s_Room'] || this.service['Player_s_Room'];
                lines.push(`  • 私人房间 (Personal Quarters) [${playerRoomCoords.x}, ${playerRoomCoords.y}] ZONE-Z`);
                if (playerRoomDesc?.desc) {
                    lines.push(`    ${playerRoomDesc.desc}`);
                }
                
                // ========== 周围环境（半径2格）==========
                lines.push('');
                lines.push('【周围环境】(半径2格)');
                
                const surrounding = this.getSurroundingInfo(internal.gx, internal.gy, 2);
                
                // 按地表类型分组
                const surfaceGrouped = {};
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
                    
                    // 设施区分组（只显示与当前不同的）
                    if (s.regionZone && s.regionZone !== entities.regionZone) {
                        if (!regionZoneGrouped[s.regionZone]) regionZoneGrouped[s.regionZone] = [];
                        regionZoneGrouped[s.regionZone].push(s.direction);
                    }
                    
                    // 收集特殊设施
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
                
                // ========== 本区块地标（Biome_Zone）==========
                const biomeZoneName = entities.biomeZone;
                if (biomeZoneName) {
                    lines.push('');
                    lines.push(`【本区块地标】(${biomeZoneName})`);
                    
                    const biomeLandmarks = this.getBiomeZoneLandmarks(biomeZoneName, x, y);
                    if (biomeLandmarks.length > 0) {
                        for (const lm of biomeLandmarks.slice(0, 5)) {
                            lines.push(`  • ${lm.name} [${lm.center[0]}, ${lm.center[1]}] (~${lm.distance}格)`);
                        }
                    } else {
                        lines.push('  (无已知地标)');
                    }
                }
                
                // 本大区地标
                lines.push('');
                lines.push(`【本大区地标】(${regionInfo?.name || regionId})`);
                
                const landmarks = this.getRegionLandmarks(regionId, x, y);
                if (landmarks.length > 0) {
                    for (const lm of landmarks.slice(0, 6)) {
                        lines.push(`  • ${lm.name} [${lm.center[0]}, ${lm.center[1]}] (~${lm.distance}格)`);
                    }
                }
                
                // 全图区域概览
                lines.push('');
                lines.push('【全图区域】');
                
                for (const [id, data] of Object.entries(this.REGIONS)) {
                    const isCurrent = id === regionId;
                    const marker = isCurrent ? '★' : '○';
                    lines.push(`  ${marker} ${data.name} [${data.center[0]}, ${data.center[1]}]`);
                }
                
                // ========== 本大区公共设施 ==========
                const pokemonCenters = this.getAllPokemonCenters();
                const policeBoxes = this.getAllPoliceBoxes();
                
                // 筛选当前大区的设施
                const currentRegionCenters = pokemonCenters.filter(c => 
                    this.getRegionByCoords(c.displayX, c.displayY) === regionId
                );
                const currentRegionPolice = policeBoxes.filter(p => 
                    this.getRegionByCoords(p.displayX, p.displayY) === regionId
                );
                
                if (currentRegionCenters.length > 0 || currentRegionPolice.length > 0) {
                    lines.push('');
                    lines.push(`【本大区公共设施】(${regionInfo?.name || regionId})`);
                    
                    // 宝可梦中心
                    if (currentRegionCenters.length > 0) {
                        lines.push('  ■ 宝可梦中心:');
                        for (const center of currentRegionCenters) {
                            const centerInfo = this.mapInfo?.place_anchor?.[center.id];
                            const name = centerInfo?.name || center.id.replace(/_/g, ' ');
                            lines.push(`    • ${name} [${center.displayX}, ${center.displayY}]`);
                        }
                    }
                    
                    // 警察亭
                    if (currentRegionPolice.length > 0) {
                        lines.push('  ■ 警察亭:');
                        for (const box of currentRegionPolice) {
                            const boxInfo = this.mapInfo?.[box.id];
                            const name = boxInfo?.name || box.id.replace(/_/g, ' ');
                            lines.push(`    • ${name} [${box.displayX}, ${box.displayY}]`);
                        }
                    }
                }
                
                // ========== 交通系统 ==========
                const transitStations = this.getAllTransitStations();
                const seaPorts = this.getAllSeaPorts();
                const airfields = this.getAllAirfields();
                
                if (transitStations.length > 0 || seaPorts.length > 0 || airfields.length > 0) {
                    lines.push('');
                    lines.push('【交通系统】');
                    
                    // 环线车站
                    if (transitStations.length > 0) {
                        lines.push('  ■ 环线车站:');
                        const currentRegionStations = [];
                        const otherRegionStations = [];
                        
                        for (const station of transitStations) {
                            const stationRegion = this.getRegionByCoords(station.displayX, station.displayY);
                            if (stationRegion === regionId) {
                                currentRegionStations.push(station);
                            } else {
                                otherRegionStations.push(station);
                            }
                        }
                        
                        if (currentRegionStations.length > 0) {
                            lines.push(`    ★ ${regionInfo?.name || regionId}:`);
                            for (const st of currentRegionStations) {
                                const desc = this.transitInfra[st.id];
                                const name = desc?.name || st.id.replace(/_/g, ' ');
                                lines.push(`      • ${name} [${st.displayX}, ${st.displayY}]`);
                            }
                        }
                        
                        if (otherRegionStations.length > 0) {
                            lines.push(`    ○ 其他大区:`);
                            for (const st of otherRegionStations) {
                                const stationRegion = this.getRegionByCoords(st.displayX, st.displayY);
                                const regionData = this.REGIONS[stationRegion];
                                const regionName = regionData?.short || stationRegion;
                                const desc = this.transitInfra[st.id];
                                const name = desc?.name || st.id.replace(/_/g, ' ');
                                lines.push(`      • ${name} [${st.displayX}, ${st.displayY}] (${regionName})`);
                            }
                        }
                    }
                    
                    // 港口码头
                    if (seaPorts.length > 0) {
                        lines.push('  ■ 港口码头:');
                        const currentRegionPorts = [];
                        const otherRegionPorts = [];
                        
                        for (const port of seaPorts) {
                            const portRegion = this.getRegionByCoords(port.displayX, port.displayY);
                            if (portRegion === regionId) {
                                currentRegionPorts.push(port);
                            } else {
                                otherRegionPorts.push(port);
                            }
                        }
                        
                        if (currentRegionPorts.length > 0) {
                            lines.push(`    ★ ${regionInfo?.name || regionId}:`);
                            for (const pt of currentRegionPorts) {
                                const desc = this.transitInfra[pt.id];
                                const name = desc?.name || pt.id.replace(/_/g, ' ');
                                lines.push(`      • ${name} [${pt.displayX}, ${pt.displayY}]`);
                            }
                        }
                        
                        if (otherRegionPorts.length > 0) {
                            lines.push(`    ○ 其他大区:`);
                            for (const pt of otherRegionPorts) {
                                const portRegion = this.getRegionByCoords(pt.displayX, pt.displayY);
                                const regionData = this.REGIONS[portRegion];
                                const regionName = regionData?.short || portRegion;
                                const desc = this.transitInfra[pt.id];
                                const name = desc?.name || pt.id.replace(/_/g, ' ');
                                lines.push(`      • ${name} [${pt.displayX}, ${pt.displayY}] (${regionName})`);
                            }
                        }
                    }
                    
                    // 空运停机坪
                    if (airfields.length > 0) {
                        lines.push('  ■ 空运停机坪:');
                        const currentRegionAir = [];
                        const otherRegionAir = [];
                        
                        for (const air of airfields) {
                            const airRegion = this.getRegionByCoords(air.displayX, air.displayY);
                            if (airRegion === regionId) {
                                currentRegionAir.push(air);
                            } else {
                                otherRegionAir.push(air);
                            }
                        }
                        
                        if (currentRegionAir.length > 0) {
                            lines.push(`    ★ ${regionInfo?.name || regionId}:`);
                            for (const af of currentRegionAir) {
                                const normalizedId = this.normalizeTransitId(af.id);
                                const desc = this.transitInfra[normalizedId];
                                const name = desc?.name || normalizedId.replace(/_/g, ' ');
                                lines.push(`      • ${name} [${af.displayX}, ${af.displayY}]`);
                            }
                        }
                        
                        if (otherRegionAir.length > 0) {
                            lines.push(`    ○ 其他大区:`);
                            for (const af of otherRegionAir) {
                                const airRegion = this.getRegionByCoords(af.displayX, af.displayY);
                                const regionData = this.REGIONS[airRegion];
                                const regionName = regionData?.short || airRegion;
                                const normalizedId = this.normalizeTransitId(af.id);
                                const desc = this.transitInfra[normalizedId];
                                const name = desc?.name || normalizedId.replace(/_/g, ' ');
                                lines.push(`      • ${name} [${af.displayX}, ${af.displayY}] (${regionName})`);
                            }
                        }
                    }
                }
                
                
                return lines.join('\n');
            },
            
            // 生成附近宝可梦列表
            generateNearbyPokemon(biomeZone) {
                if (!this.spawnTablesData) return [];
                
                // 区域名称映射
                const BIOME_ZONE_MAPPING = {
                    "Arcadia_Lawns": "Aether_Admin_Zone",
                    "Zenith_HQ": "Aether_Admin_Zone",
                    "Pearl_Resort": "Sapphire_Strand",
                    "Jade_Canopy": "Jade_Canopy",
                    "Radiant_Plains": "Radiant_Plains",
                    "Cinder_Moor": "Cinder_Moor",
                    "Silent_Tundra": "Silent_Tundra",
                    "Crimson_Badlands": "Crimson_Badlands"
                };
                
                const resolvedZone = BIOME_ZONE_MAPPING[biomeZone] || biomeZone;
                const zoneTable = this.spawnTablesData[resolvedZone] || this.spawnTablesData['Aether_Admin_Zone'];
                
                if (!zoneTable) return [];
                
                const results = [];
                const surfacePool = zoneTable['Standard_Grass'] || zoneTable['Pavement'] || Object.values(zoneTable)[0];
                
                if (!surfacePool) return [];
                
                // 从 common 池中随机选择 3-4 个
                const commonPool = surfacePool.common || [];
                for (let i = 0; i < Math.min(4, commonPool.length); i++) {
                    const entry = commonPool[Math.floor(Math.random() * commonPool.length)];
                    const pokemonId = typeof entry === 'string' ? entry : entry.id;
                    const minLevel = typeof entry === 'object' ? (entry.min || 5) : 5;
                    results.push({
                        id: pokemonId,
                        level: minLevel + Math.floor(Math.random() * 10),
                        rarity: 'common'
                    });
                }
                
                // 从 uncommon 池中随机选择 1 个
                const uncommonPool = surfacePool.uncommon || [];
                if (uncommonPool.length > 0) {
                    const entry = uncommonPool[Math.floor(Math.random() * uncommonPool.length)];
                    const pokemonId = typeof entry === 'string' ? entry : entry.id;
                    const minLevel = typeof entry === 'object' ? (entry.min || 10) : 10;
                    results.push({
                        id: pokemonId,
                        level: minLevel + Math.floor(Math.random() * 8),
                        rarity: 'uncommon'
                    });
                }
                
                return results;
            },
            
            // 获取大区内的地标
            getRegionLandmarks(regionId, x, y) {
                const landmarks = [];
                const regionPrefixes = {
                    'Region_Zenith': ['Aether', 'Royal', 'Living', 'Lusamine', 'Eco', 'Academic', 'Zero_Halo', 'Arcadia'],
                    'Region_Neon': ['Iono', 'Toxic', 'Cyber', 'Port', 'Glitch', 'Skyline', 'Synth', 'Golden', 'Radiant', 'Chrome'],
                    'Region_Bloom': ['Pearl', 'Sunflora', 'Marina', 'Sapphire', 'Hermit', 'Aroma', 'Jade', 'Deep_Root', 'Silt', 'Breeze', 'Prism', 'Crystal', 'Mirror'],
                    'Region_Shadow': ['Grim', 'Venom', 'Frost', 'Requiem', 'Canal', 'Kamunagi', 'Cinder', 'Silent', 'Spirit', 'Twilight', 'Crimson_Peat', 'Ginkgo', 'Mercury'],
                    'Region_Apex': ['Crimson_Forge', 'Titan', 'Dune', 'Ruins', 'Savanna', 'Scorched', 'Obsidian', 'Inferno', 'Crimson_Badlands', 'Frostbite', 'Desolate']
                };
                
                const prefixes = regionPrefixes[regionId] || [];
                
                for (const [zoneName, zoneData] of Object.entries(this.regionZones)) {
                    if (prefixes.some(p => zoneName.includes(p)) && zoneData.center_point) {
                        const dist = Math.abs(zoneData.center_point[0] - x) + Math.abs(zoneData.center_point[1] - y);
                        landmarks.push({ name: zoneName, center: zoneData.center_point, distance: dist, type: 'zone' });
                    }
                }
                
                for (const [biomeName, biomeData] of Object.entries(this.biomeFlavor)) {
                    if (prefixes.some(p => biomeName.includes(p)) && biomeData.center_point) {
                        const dist = Math.abs(biomeData.center_point[0] - x) + Math.abs(biomeData.center_point[1] - y);
                        landmarks.push({ name: biomeName, center: biomeData.center_point, distance: dist, type: 'biome' });
                    }
                }
                
                landmarks.sort((a, b) => a.distance - b.distance);
                return landmarks;
            },
            
            // 获取当前 Biome_Zone 内的地标列表
            getBiomeZoneLandmarks(currentBiomeZone, x, y) {
                const landmarks = [];
                
                // 从 regionZones 中查找属于当前生态区的地标
                for (const [zoneName, zoneData] of Object.entries(this.regionZones)) {
                    if (zoneData.center_point) {
                        const dist = Math.abs(zoneData.center_point[0] - x) + Math.abs(zoneData.center_point[1] - y);
                        landmarks.push({
                            name: zoneName,
                            center: zoneData.center_point,
                            distance: dist,
                            hasDescription: !!(zoneData.exterior_view || zoneData.internal_reality)
                        });
                    }
                }
                
                // 按距离排序
                landmarks.sort((a, b) => a.distance - b.distance);
                return landmarks;
            },
            
            // 地表类型配置（与 mapdata.json Surface 层 intGridValues 对应）
            TERRAIN_CONFIG: {
                1: { type: 'Deep_Sea' },
                2: { type: 'High_Grass' },
                3: { type: 'Waste' },
                4: { type: 'Pavement' },
                6: { type: 'Shallow_Sea' },
                7: { type: 'Fresh_Water' },
                9: { type: 'Sewage' },
                10: { type: 'Standard_Grass' },
                12: { type: 'Flower_Field' },
                13: { type: 'Deep_Jungle' },
                14: { type: 'Wet_Soil' },
                15: { type: 'Coastal_Sand' },
                16: { type: 'Light_Forest' },
                17: { type: 'Industrial' },
                18: { type: 'High_Voltage' },
                19: { type: 'Synthetic_Turf' },
                20: { type: 'Swamp' },
                21: { type: 'Slum_Pavement' },
                22: { type: 'Withered_Grass' },
                23: { type: 'Snowfield' },
                24: { type: 'Glacial_Water' },
                25: { type: 'Desert_Sand' },
                26: { type: 'Rocky_Mountain' },
                27: { type: 'Scorched_Earth' },
                28: { type: 'Magma' },
                29: { type: 'Ancient_Timber' }
            },
            
            // 从 mapdata.json 获取 IntGrid 值
            getIntVal(gx, gy, layerName) {
                if (!this.mapData || !this.mapData.levels || !this.mapData.levels[0]) return 0;
                
                const levelData = this.mapData.levels[0];
                const gridSize = 16;
                
                for (const layer of levelData.layerInstances || []) {
                    if (layer.__identifier === layerName && layer.__type === 'IntGrid') {
                        const cWid = layer.__cWid;
                        const idx = gy * cWid + gx;
                        if (layer.intGridCsv && idx >= 0 && idx < layer.intGridCsv.length) {
                            return layer.intGridCsv[idx];
                        }
                    }
                }
                return 0;
            },
            
            // 获取格子的基本信息
            getGridInfo(gx, gy) {
                const info = {
                    gx, gy,
                    surface: null,
                    traversable: true,
                    threat: 0,
                    biomeZone: null,
                    region: null
                };
                
                // 获取地表类型
                const surfaceVal = this.getIntVal(gx, gy, 'Surface');
                if (surfaceVal > 0 && this.TERRAIN_CONFIG[surfaceVal]) {
                    info.surface = this.TERRAIN_CONFIG[surfaceVal].type;
                }
                
                // 获取可通行性
                const travVal = this.getIntVal(gx, gy, 'Traversability');
                info.traversable = travVal !== 1;
                
                // 获取威胁度
                info.threat = this.getIntVal(gx, gy, 'Threat');
                
                // 获取Region
                const regionVal = this.getIntVal(gx, gy, 'Regions');
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
            
            // 获取所有交通站点
            getAllTransitStations() {
                if (!this.mapData || !this.mapData.levels || !this.mapData.levels[0]) return [];
                
                const stations = [];
                const levelData = this.mapData.levels[0];
                const gridSize = 16;
                
                for (const layer of levelData.layerInstances || []) {
                    if (layer.__type === 'Entities') {
                        for (const entity of layer.entityInstances || []) {
                            if (entity.__identifier === 'Transit_Station') {
                                const worldX = entity.__worldX || entity.px[0];
                                const worldY = entity.__worldY || entity.px[1];
                                const gx = Math.floor(worldX / gridSize);
                                const gy = Math.floor(worldY / gridSize);
                                
                                // 转换为显示坐标
                                const displayCoords = this.toDisplayCoords(gx, gy);
                                
                                // 获取站点ID
                                let stationId = null;
                                for (const field of entity.fieldInstances || []) {
                                    if (field.__identifier === 'Transit_Station') {
                                        stationId = field.__value;
                                        break;
                                    }
                                }
                                
                                if (stationId) {
                                    stations.push({
                                        id: stationId,
                                        gx, gy,
                                        displayX: displayCoords.x,
                                        displayY: displayCoords.y
                                    });
                                }
                            }
                        }
                    }
                }
                
                return stations;
            },
            
            // 获取所有港口码头
            getAllSeaPorts() {
                if (!this.mapData || !this.mapData.levels || !this.mapData.levels[0]) return [];
                
                const ports = [];
                const levelData = this.mapData.levels[0];
                const gridSize = 16;
                
                for (const layer of levelData.layerInstances || []) {
                    if (layer.__type === 'Entities') {
                        for (const entity of layer.entityInstances || []) {
                            if (entity.__identifier === 'Sea_Route') {
                                const worldX = entity.__worldX || entity.px[0];
                                const worldY = entity.__worldY || entity.px[1];
                                const gx = Math.floor(worldX / gridSize);
                                const gy = Math.floor(worldY / gridSize);
                                
                                const displayCoords = this.toDisplayCoords(gx, gy);
                                
                                let portId = null;
                                for (const field of entity.fieldInstances || []) {
                                    if (field.__identifier === 'Sea_Route') {
                                        portId = field.__value;
                                        break;
                                    }
                                }
                                
                                if (portId) {
                                    ports.push({
                                        id: portId,
                                        gx, gy,
                                        displayX: displayCoords.x,
                                        displayY: displayCoords.y
                                    });
                                }
                            }
                        }
                    }
                }
                
                return ports;
            },
            
            // 获取所有空运停机坪
            getAllAirfields() {
                if (!this.mapData || !this.mapData.levels || !this.mapData.levels[0]) return [];
                
                const airfields = [];
                const levelData = this.mapData.levels[0];
                const gridSize = 16;
                
                for (const layer of levelData.layerInstances || []) {
                    if (layer.__type === 'Entities') {
                        for (const entity of layer.entityInstances || []) {
                            if (entity.__identifier === 'Sky_Net') {
                                const worldX = entity.__worldX || entity.px[0];
                                const worldY = entity.__worldY || entity.px[1];
                                const gx = Math.floor(worldX / gridSize);
                                const gy = Math.floor(worldY / gridSize);
                                
                                const displayCoords = this.toDisplayCoords(gx, gy);
                                
                                let airId = null;
                                for (const field of entity.fieldInstances || []) {
                                    if (field.__identifier === 'Sky_Net') {
                                        airId = field.__value;
                                        break;
                                    }
                                }
                                
                                if (airId) {
                                    airfields.push({
                                        id: airId,
                                        gx, gy,
                                        displayX: displayCoords.x,
                                        displayY: displayCoords.y
                                    });
                                }
                            }
                        }
                    }
                }
                
                return airfields;
            },
            
            // 获取所有宝可梦中心
            getAllPokemonCenters() {
                if (!this.mapData || !this.mapData.levels || !this.mapData.levels[0]) return [];
                
                const centers = [];
                const levelData = this.mapData.levels[0];
                const gridSize = 16;
                
                for (const layer of levelData.layerInstances || []) {
                    if (layer.__type === 'Entities') {
                        for (const entity of layer.entityInstances || []) {
                            if (entity.__identifier === 'Pokemon_Centers') {
                                const worldX = entity.__worldX || entity.px[0];
                                const worldY = entity.__worldY || entity.px[1];
                                const gx = Math.floor(worldX / gridSize);
                                const gy = Math.floor(worldY / gridSize);
                                
                                const displayCoords = this.toDisplayCoords(gx, gy);
                                
                                let centerId = null;
                                for (const field of entity.fieldInstances || []) {
                                    if (field.__identifier === 'Pokemon_Centers') {
                                        centerId = field.__value;
                                        break;
                                    }
                                }
                                
                                if (centerId) {
                                    centers.push({
                                        id: centerId,
                                        gx, gy,
                                        displayX: displayCoords.x,
                                        displayY: displayCoords.y
                                    });
                                }
                            }
                        }
                    }
                }
                
                return centers;
            },
            
            // 获取所有警察亭
            getAllPoliceBoxes() {
                if (!this.mapData || !this.mapData.levels || !this.mapData.levels[0]) return [];
                
                const boxes = [];
                const levelData = this.mapData.levels[0];
                const gridSize = 16;
                
                for (const layer of levelData.layerInstances || []) {
                    if (layer.__type === 'Entities') {
                        for (const entity of layer.entityInstances || []) {
                            if (entity.__identifier === 'Police_Box') {
                                const worldX = entity.__worldX || entity.px[0];
                                const worldY = entity.__worldY || entity.px[1];
                                const gx = Math.floor(worldX / gridSize);
                                const gy = Math.floor(worldY / gridSize);
                                
                                const displayCoords = this.toDisplayCoords(gx, gy);
                                
                                let boxId = null;
                                for (const field of entity.fieldInstances || []) {
                                    if (field.__identifier === 'Service_Type') {
                                        boxId = field.__value;
                                        break;
                                    }
                                }
                                
                                if (boxId) {
                                    boxes.push({
                                        id: boxId,
                                        gx, gy,
                                        displayX: displayCoords.x,
                                        displayY: displayCoords.y
                                    });
                                }
                            }
                        }
                    }
                }
                
                return boxes;
            },
            
            // 获取周围格子的简要信息
            getSurroundingInfo(gx, gy, radius = 2) {
                const surrounding = [];
                
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
            }
        };
        
        // ========== 天气系统（108天周期 + 三层权重叠加）==========
        const WeatherSystem = {
            // 气候数据缓存
            climateData: null,
            dataLoaded: false,
            
            // 108天周期常量
            YEAR_DAYS: 108,
            SEASON_DAYS: 27,
            SEGMENT_DAYS: 9,
            
            // 季节顺序
            SEASONS: ['Spring', 'Summer', 'Autumn', 'Winter'],
            // 阶段顺序
            SEGMENTS: ['Early', 'Mid', 'Late'],
            
            // 原版四个天气（用于 suppression）
            POKEMON_WEATHERS: ['rain', 'sun', 'sandstorm', 'snow'],
            
            // 加载气候数据
            async loadClimateData() {
                if (this.dataLoaded && this.climateData) return true;
                
                try {
                    const res = await fetch(PKM_URL + 'map/data/climatedata.json');
                    if (res.ok) {
                        this.climateData = await res.json();
                        this.dataLoaded = true;
                        console.log('[PKM] ✓ climatedata.json 已加载');
                        return true;
                    }
                } catch (e) {
                    console.error('[PKM] 加载气候数据失败:', e);
                }
                return false;
            },
            
            // 根据游戏日期计算季节和阶段
            getSeasonSegment(day) {
                // day 从 1 开始，转为 0-indexed
                const dayIndex = ((day - 1) % this.YEAR_DAYS + this.YEAR_DAYS) % this.YEAR_DAYS;
                
                // 计算季节 (0-3)
                const seasonIndex = Math.floor(dayIndex / this.SEASON_DAYS);
                const season = this.SEASONS[seasonIndex];
                
                // 计算阶段 (0-2)
                const dayInSeason = dayIndex % this.SEASON_DAYS;
                const segmentIndex = Math.floor(dayInSeason / this.SEGMENT_DAYS);
                const segment = this.SEGMENTS[segmentIndex];
                
                return { season, segment, dayIndex, seasonIndex, segmentIndex };
            },
            
            // 获取季节修正器
            getSeasonalModifiers(season, segment) {
                if (!this.climateData) return null;
                return this.climateData[season]?.[segment]?.modifier || null;
            },
            
            // 获取气候带基础权重
            getClimateBaseWeights(climateZoneId) {
                if (!this.climateData) return null;
                return this.climateData[climateZoneId] || null;
            },
            
            // 三层权重叠加计算最终天气
            calculateWeather(climateZoneId, day) {
                const baseWeights = this.getClimateBaseWeights(climateZoneId);
                if (!baseWeights) {
                    console.warn('[PKM] [WEATHER] 未找到气候区:', climateZoneId);
                    return null;
                }
                
                const { season, segment } = this.getSeasonSegment(day);
                const modifiers = this.getSeasonalModifiers(season, segment);
                if (!modifiers) {
                    console.warn('[PKM] [WEATHER] 未找到季节修正:', season, segment);
                    return null;
                }
                
                // 计算最终权重
                const finalWeights = {};
                let totalWeight = 0;
                
                for (const [weatherType, baseWeight] of Object.entries(baseWeights)) {
                    const modifier = modifiers[weatherType] ?? 1.0;
                    const finalWeight = baseWeight * modifier;
                    if (finalWeight > 0) {
                        finalWeights[weatherType] = finalWeight;
                        totalWeight += finalWeight;
                    }
                }
                
                if (totalWeight === 0) {
                    console.warn('[PKM] [WEATHER] 所有天气权重为零');
                    return { weather: 'clear', weights: finalWeights, season, segment };
                }
                
                // 加权随机选择
                const roll = Math.random() * totalWeight;
                let cumulative = 0;
                let selectedWeather = 'clear';
                
                for (const [weatherType, weight] of Object.entries(finalWeights)) {
                    cumulative += weight;
                    if (roll < cumulative) {
                        selectedWeather = weatherType;
                        break;
                    }
                }
                
                return {
                    weather: selectedWeather,
                    weights: finalWeights,
                    season,
                    segment,
                    climateZone: climateZoneId
                };
            },
            
            // 生成 suppression 配置（权重为零的原版天气）
            generateSuppression(climateZoneId, day) {
                const baseWeights = this.getClimateBaseWeights(climateZoneId);
                if (!baseWeights) return null;
                
                const { season, segment } = this.getSeasonSegment(day);
                const modifiers = this.getSeasonalModifiers(season, segment);
                if (!modifiers) return null;
                
                const suppressed = [];
                
                for (const pokemonWeather of this.POKEMON_WEATHERS) {
                    const baseWeight = baseWeights[pokemonWeather] ?? 0;
                    const modifier = modifiers[pokemonWeather] ?? 1.0;
                    const finalWeight = baseWeight * modifier;
                    
                    // 权重为零 → suppressed
                    if (finalWeight === 0) {
                        suppressed.push(pokemonWeather);
                    }
                }
                
                return suppressed.length > 0 ? { suppressed } : null;
            },
            
            // 生成格子天气配置（只保留必要字段）
            generateGridWeather(climateZoneId, day) {
                const weatherResult = this.calculateWeather(climateZoneId, day);
                if (!weatherResult) return null;
                
                const suppression = this.generateSuppression(climateZoneId, day);
                
                // 只保留 weather 和 suppression
                const config = {
                    weather: weatherResult.weather
                };
                
                if (suppression && suppression.suppressed.length > 0) {
                    config.suppression = suppression;
                }
                
                return config;
            },
            
            // 为玩家周围13格生成天气（类似 pokemon_spawns）
            // forceRefresh: true 时忽略已存在的天气数据，用于每日刷新
            async generateForNearbyGrids(x, y, eraVars, forceRefresh = false) {
                await this.loadClimateData();
                if (!this.climateData) return null;
                
                const currentDay = eraVars?.world_state?.time?.day || 1;
                const internal = LocationContextBackend.toInternalCoords(x, y);
                const centerGx = internal.gx;
                const centerGy = internal.gy;
                
                // 获取已存在的天气数据（forceRefresh 时忽略）
                const existingWeather = forceRefresh ? {} : (eraVars?.world_state?.weather_grid || {});
                
                // 13格偏移（与 pokemon_spawns 一致）
                const offsets = [
                    { dx: 0, dy: 0 },
                    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
                    { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
                    { dx: 0, dy: -2 }, { dx: 0, dy: 2 }, { dx: -2, dy: 0 }, { dx: 2, dy: 0 }
                ];
                
                const newWeather = {};
                
                for (const { dx, dy } of offsets) {
                    const gx = centerGx + dx;
                    const gy = centerGy + dy;
                    const key = `${gx}_${gy}`;
                    
                    // 只增不改（forceRefresh 时跳过此检查）
                    if (existingWeather[key]) continue;
                    
                    // 获取该格子的气候区
                    const climateZoneId = this.getClimateZoneAtGrid(gx, gy);
                    const weatherConfig = this.generateGridWeather(climateZoneId, currentDay);
                    
                    if (weatherConfig) {
                        newWeather[key] = weatherConfig;
                    }
                }
                
                return Object.keys(newWeather).length > 0 ? newWeather : null;
            },
            
            // 获取当前格子的天气
            getCurrentGridWeather(x, y, eraVars) {
                const internal = LocationContextBackend.toInternalCoords(x, y);
                const key = `${internal.gx}_${internal.gy}`;
                return eraVars?.world_state?.weather_grid?.[key] || null;
            },
            
            // Climate IntGrid 值到气候区名称的映射（从 mapdata.json 定义）
            CLIMATE_INT_MAP: {
                1: 'Tropical_Monsoon',
                2: 'Industrial_Gloom',
                3: 'Scorched_Badlands',
                4: 'Polar_Tundra',
                5: 'Spectral_Haze',
                6: 'Continental_Lush',
                7: 'Controlled_Vault',
                8: 'Continental_Savanna',
                9: 'Continental_Highland',
                10: 'Iron_Sand_Desert',
                11: 'Volcanic_Fallout',
                12: 'Radiant_Cityscape',
                13: 'Maritime_Trade_Winds',
                14: 'Azure_Coral_Atolls',
                15: 'Southern_Tradewind',
                16: 'Chrome_Magnetic_Waters',
                17: 'Northern_Floe',
                18: 'Phosphorescent_Shoals',
                19: 'Basalt_Geyser_Shelf',
                20: 'Abyssal_North',
                21: 'Abyssal_South',
                22: 'Abyssal_Middle'
            },
            
            // Climate 图层数据缓存
            climateGridData: null,
            climateGridWidth: 52,
            
            // 从 mapdata.json 加载 Climate 图层
            loadClimateGrid() {
                if (this.climateGridData) return;
                
                const mapData = LocationContextBackend.mapData;
                if (!mapData || !mapData.levels || !mapData.levels[0]) return;
                
                const levelData = mapData.levels[0];
                for (const layer of levelData.layerInstances || []) {
                    if (layer.__identifier === 'Climate' && layer.intGridCsv) {
                        this.climateGridData = layer.intGridCsv;
                        this.climateGridWidth = layer.__cWid || 52;
                        console.log('[PKM] ✓ Climate 图层已加载');
                        return;
                    }
                }
            },
            
            // 获取当前位置的气候区ID（从 mapdata.json Climate 图层读取）
            getClimateZoneAtGrid(gx, gy) {
                this.loadClimateGrid();
                
                if (!this.climateGridData) {
                    return 'Continental_Lush'; // 默认值
                }
                
                // 计算在 intGridCsv 中的索引
                const index = gy * this.climateGridWidth + gx;
                const climateInt = this.climateGridData[index];
                
                if (climateInt && this.CLIMATE_INT_MAP[climateInt]) {
                    return this.CLIMATE_INT_MAP[climateInt];
                }
                
                return 'Continental_Lush'; // 默认值
            }
        };
        
        // ========== 宝可梦区域刷新系统（ERA 注入版）==========
        const PokemonSpawnSystem = {
            // 威胁度定义
            THREAT_PEACE: 6,
            
            // 区域名称映射（与 pokemonEngine.js 一致）
            BIOME_ZONE_MAPPING: {
                "Arcadia_Lawns": "Aether_Admin_Zone",
                "Zenith_HQ": "Aether_Admin_Zone",
                "Lusamine_Gardens": "Aether_Admin_Zone",
                "Academic_Plaza": "Aether_Admin_Zone",
                "Royal_Academy": "Aether_Admin_Zone",
                "Zero_Halo_Moat": "Zero_Halo_Moat",
                "Pearl_Resort": "Sapphire_Strand",
                "Sapphire_Marina": "Sapphire_Strand",
                "Sunflora_Farmsteads": "Aroma_Meadow",
                "Marina_Port_Town": "Breeze_Woodlands",
                "Jade_Canopy": "Jade_Canopy",
                "Deep_Root_Hollow": "Deep_Root_Hollow",
                "Breeze_Woodlands": "Breeze_Woodlands",
                "Hermit_Sands": "Hermit_Sands",
                "Golden_Horizon": "Golden_Horizon",
                "Electro_Avenue": "Radiant_Plains",
                "Cyber_Shopping_District": "Radiant_Plains",
                "Frost_Smoke_City": "Silent_Tundra",
                "Grim_Borough": "Cinder_Moor",
                "Crimson_Forge_City": "Crimson_Badlands",
                "Titan_Mining_site": "Crimson_Badlands",
                "Savanna_Outlands": "Savanna_Outlands",
                "Aroma_Meadow": "Aroma_Meadow",
                "Radiant_Plains": "Radiant_Plains"
            },
            
            // 检查是否为和平区域
            isPeaceZone(threat) {
                return threat === this.THREAT_PEACE || threat === 0;
            },
            
            // 根据威胁度决定稀有度池
            getRarityPool(threat) {
                if (this.isPeaceZone(threat)) return null;
                
                const roll = Math.random() * 100;
                
                if (threat === 1) {
                    // SAFE: 79.5% common, 17% uncommon, 3% rare, 0.5% boss
                    if (roll < 79.5) return 'common';
                    if (roll < 96.5) return 'uncommon';
                    if (roll < 99.5) return 'rare';
                    return 'boss';
                } else if (threat === 2) {
                    // LOW: 75% common, 17% uncommon, 6% rare, 2% boss
                    if (roll < 75) return 'common';
                    if (roll < 92) return 'uncommon';
                    if (roll < 98) return 'rare';
                    return 'boss';
                } else if (threat === 3) {
                    // MID: 70% common, 20% uncommon, 6% rare, 4% boss
                    if (roll < 70) return 'common';
                    if (roll < 90) return 'uncommon';
                    if (roll < 96) return 'rare';
                    return 'boss';
                } else if (threat === 4) {
                    // HIGH: 60% common, 25% uncommon, 9% rare, 6% boss
                    if (roll < 60) return 'common';
                    if (roll < 85) return 'uncommon';
                    if (roll < 94) return 'rare';
                    return 'boss';
                } else {
                    // APEX: 50% common, 30% uncommon, 20% rare, 10% boss
                    if (roll < 50) return 'common';
                    if (roll < 80) return 'uncommon';
                    if (roll < 100) return 'rare';
                    return 'boss';
                }
            },
            
            // 根据威胁度计算等级范围
            getLevelRange(threat) {
                const ranges = {
                    1: { min: 2, max: 8 },    // SAFE: 新手区
                    2: { min: 8, max: 20 },   // LOW: 初期冒险
                    3: { min: 20, max: 40 },  // MID: 完全进化前过渡期
                    4: { min: 40, max: 60 },  // HIGH: 高难度区域
                    5: { min: 60, max: 85 }   // APEX: 真正的禁区
                };
                return ranges[threat] || ranges[1];
            },
            
            // 解析区域名称（严格映射，无 fallback）
            resolveZoneName(biomeZone, surfaceType) {
                // 通过 BIOME_ZONE_MAPPING 映射，否则直接使用 biomeZone
                return this.BIOME_ZONE_MAPPING[biomeZone] || biomeZone;
            },
            
            // 精简版进化表 - 只包含等级进化数据（内嵌以避免跨域加载问题）
            EVOLUTION_TABLE: {"bulbasaur":{"evos":["Ivysaur"],"evoLevel":16},"ivysaur":{"evos":["Venusaur"],"evoLevel":32},"charmander":{"evos":["Charmeleon"],"evoLevel":16},"charmeleon":{"evos":["Charizard"],"evoLevel":36},"squirtle":{"evos":["Wartortle"],"evoLevel":16},"wartortle":{"evos":["Blastoise"],"evoLevel":36},"caterpie":{"evos":["Metapod"],"evoLevel":7},"metapod":{"evos":["Butterfree"],"evoLevel":10},"weedle":{"evos":["Kakuna"],"evoLevel":7},"kakuna":{"evos":["Beedrill"],"evoLevel":10},"pidgey":{"evos":["Pidgeotto"],"evoLevel":18},"pidgeotto":{"evos":["Pidgeot"],"evoLevel":36},"rattata":{"evos":["Raticate"],"evoLevel":20},"rattataalola":{"evos":["Raticate-Alola"],"evoLevel":20},"spearow":{"evos":["Fearow"],"evoLevel":20},"ekans":{"evos":["Arbok"],"evoLevel":22},"sandshrew":{"evos":["Sandslash"],"evoLevel":22},"nidoranf":{"evos":["Nidorina"],"evoLevel":16},"nidoranm":{"evos":["Nidorino"],"evoLevel":16},"zubat":{"evos":["Golbat"],"evoLevel":22},"oddish":{"evos":["Gloom"],"evoLevel":21},"paras":{"evos":["Parasect"],"evoLevel":24},"venonat":{"evos":["Venomoth"],"evoLevel":31},"diglett":{"evos":["Dugtrio"],"evoLevel":26},"diglettalola":{"evos":["Dugtrio-Alola"],"evoLevel":26},"meowth":{"evos":["Persian"],"evoLevel":28},"meowthgalar":{"evos":["Perrserker"],"evoLevel":28},"psyduck":{"evos":["Golduck"],"evoLevel":33},"mankey":{"evos":["Primeape"],"evoLevel":28},"poliwag":{"evos":["Poliwhirl"],"evoLevel":25},"abra":{"evos":["Kadabra"],"evoLevel":16},"machop":{"evos":["Machoke"],"evoLevel":28},"bellsprout":{"evos":["Weepinbell"],"evoLevel":21},"tentacool":{"evos":["Tentacruel"],"evoLevel":30},"geodude":{"evos":["Graveler"],"evoLevel":25},"geodudealola":{"evos":["Graveler-Alola"],"evoLevel":25},"ponyta":{"evos":["Rapidash"],"evoLevel":40},"ponytagalar":{"evos":["Rapidash-Galar"],"evoLevel":40},"slowpoke":{"evos":["Slowbro","Slowking"],"evoLevel":37},"magnemite":{"evos":["Magneton"],"evoLevel":30},"doduo":{"evos":["Dodrio"],"evoLevel":31},"seel":{"evos":["Dewgong"],"evoLevel":34},"grimer":{"evos":["Muk"],"evoLevel":38},"grimeralola":{"evos":["Muk-Alola"],"evoLevel":38},"shellder":{"evos":["Cloyster"],"evoLevel":38},"gastly":{"evos":["Haunter"],"evoLevel":25},"drowzee":{"evos":["Hypno"],"evoLevel":26},"krabby":{"evos":["Kingler"],"evoLevel":28},"voltorb":{"evos":["Electrode"],"evoLevel":30},"voltorbhisui":{"evos":["Electrode-Hisui"],"evoLevel":30},"cubone":{"evos":["Marowak","Marowak-Alola"],"evoLevel":28},"koffing":{"evos":["Weezing","Weezing-Galar"],"evoLevel":35},"rhyhorn":{"evos":["Rhydon"],"evoLevel":42},"horsea":{"evos":["Seadra"],"evoLevel":32},"goldeen":{"evos":["Seaking"],"evoLevel":33},"staryu":{"evos":["Starmie"],"evoLevel":36},"magikarp":{"evos":["Gyarados"],"evoLevel":20},"omanyte":{"evos":["Omastar"],"evoLevel":40},"kabuto":{"evos":["Kabutops"],"evoLevel":40},"dratini":{"evos":["Dragonair"],"evoLevel":30},"dragonair":{"evos":["Dragonite"],"evoLevel":55},"chikorita":{"evos":["Bayleef"],"evoLevel":16},"bayleef":{"evos":["Meganium"],"evoLevel":32},"cyndaquil":{"evos":["Quilava"],"evoLevel":14},"quilava":{"evos":["Typhlosion","Typhlosion-Hisui"],"evoLevel":36},"totodile":{"evos":["Croconaw"],"evoLevel":18},"croconaw":{"evos":["Feraligatr"],"evoLevel":30},"sentret":{"evos":["Furret"],"evoLevel":15},"hoothoot":{"evos":["Noctowl"],"evoLevel":20},"ledyba":{"evos":["Ledian"],"evoLevel":18},"spinarak":{"evos":["Ariados"],"evoLevel":22},"chinchou":{"evos":["Lanturn"],"evoLevel":27},"natu":{"evos":["Xatu"],"evoLevel":25},"mareep":{"evos":["Flaaffy"],"evoLevel":15},"flaaffy":{"evos":["Ampharos"],"evoLevel":30},"marill":{"evos":["Azumarill"],"evoLevel":18},"hoppip":{"evos":["Skiploom"],"evoLevel":18},"skiploom":{"evos":["Jumpluff"],"evoLevel":27},"wooper":{"evos":["Quagsire"],"evoLevel":20},"wooperpaldea":{"evos":["Clodsire"],"evoLevel":20},"pineco":{"evos":["Forretress"],"evoLevel":31},"snubbull":{"evos":["Granbull"],"evoLevel":23},"teddiursa":{"evos":["Ursaring"],"evoLevel":30},"slugma":{"evos":["Magcargo"],"evoLevel":38},"swinub":{"evos":["Piloswine"],"evoLevel":33},"remoraid":{"evos":["Octillery"],"evoLevel":25},"houndour":{"evos":["Houndoom"],"evoLevel":24},"phanpy":{"evos":["Donphan"],"evoLevel":25},"larvitar":{"evos":["Pupitar"],"evoLevel":30},"pupitar":{"evos":["Tyranitar"],"evoLevel":55},"treecko":{"evos":["Grovyle"],"evoLevel":16},"grovyle":{"evos":["Sceptile"],"evoLevel":36},"torchic":{"evos":["Combusken"],"evoLevel":16},"combusken":{"evos":["Blaziken"],"evoLevel":36},"mudkip":{"evos":["Marshtomp"],"evoLevel":16},"marshtomp":{"evos":["Swampert"],"evoLevel":36},"poochyena":{"evos":["Mightyena"],"evoLevel":18},"zigzagoon":{"evos":["Linoone"],"evoLevel":20},"zigzagoongalar":{"evos":["Linoone-Galar"],"evoLevel":20},"wurmple":{"evos":["Silcoon","Cascoon"],"evoLevel":7},"silcoon":{"evos":["Beautifly"],"evoLevel":10},"cascoon":{"evos":["Dustox"],"evoLevel":10},"lotad":{"evos":["Lombre"],"evoLevel":14},"seedot":{"evos":["Nuzleaf"],"evoLevel":14},"taillow":{"evos":["Swellow"],"evoLevel":22},"wingull":{"evos":["Pelipper"],"evoLevel":25},"surskit":{"evos":["Masquerain"],"evoLevel":22},"shroomish":{"evos":["Breloom"],"evoLevel":23},"slakoth":{"evos":["Vigoroth"],"evoLevel":18},"vigoroth":{"evos":["Slaking"],"evoLevel":36},"nincada":{"evos":["Ninjask","Shedinja"],"evoLevel":20},"whismur":{"evos":["Loudred"],"evoLevel":20},"loudred":{"evos":["Exploud"],"evoLevel":40},"makuhita":{"evos":["Hariyama"],"evoLevel":24},"aron":{"evos":["Lairon"],"evoLevel":32},"lairon":{"evos":["Aggron"],"evoLevel":42},"meditite":{"evos":["Medicham"],"evoLevel":37},"electrike":{"evos":["Manectric"],"evoLevel":26},"gulpin":{"evos":["Swalot"],"evoLevel":26},"carvanha":{"evos":["Sharpedo"],"evoLevel":30},"wailmer":{"evos":["Wailord"],"evoLevel":40},"numel":{"evos":["Camerupt"],"evoLevel":33},"spoink":{"evos":["Grumpig"],"evoLevel":32},"trapinch":{"evos":["Vibrava"],"evoLevel":35},"vibrava":{"evos":["Flygon"],"evoLevel":45},"cacnea":{"evos":["Cacturne"],"evoLevel":32},"swablu":{"evos":["Altaria"],"evoLevel":35},"barboach":{"evos":["Whiscash"],"evoLevel":30},"corphish":{"evos":["Crawdaunt"],"evoLevel":30},"baltoy":{"evos":["Claydol"],"evoLevel":36},"lileep":{"evos":["Cradily"],"evoLevel":40},"anorith":{"evos":["Armaldo"],"evoLevel":40},"shuppet":{"evos":["Banette"],"evoLevel":37},"duskull":{"evos":["Dusclops"],"evoLevel":37},"snorunt":{"evos":["Glalie","Froslass"],"evoLevel":42},"spheal":{"evos":["Sealeo"],"evoLevel":32},"sealeo":{"evos":["Walrein"],"evoLevel":44},"bagon":{"evos":["Shelgon"],"evoLevel":30},"shelgon":{"evos":["Salamence"],"evoLevel":50},"beldum":{"evos":["Metang"],"evoLevel":20},"metang":{"evos":["Metagross"],"evoLevel":45},"turtwig":{"evos":["Grotle"],"evoLevel":18},"grotle":{"evos":["Torterra"],"evoLevel":32},"chimchar":{"evos":["Monferno"],"evoLevel":14},"monferno":{"evos":["Infernape"],"evoLevel":36},"piplup":{"evos":["Prinplup"],"evoLevel":16},"prinplup":{"evos":["Empoleon"],"evoLevel":36},"starly":{"evos":["Staravia"],"evoLevel":14},"staravia":{"evos":["Staraptor"],"evoLevel":34},"bidoof":{"evos":["Bibarel"],"evoLevel":15},"kricketot":{"evos":["Kricketune"],"evoLevel":10},"shinx":{"evos":["Luxio"],"evoLevel":15},"luxio":{"evos":["Luxray"],"evoLevel":30},"cranidos":{"evos":["Rampardos"],"evoLevel":30},"shieldon":{"evos":["Bastiodon"],"evoLevel":30},"burmy":{"evos":["Wormadam","Mothim"],"evoLevel":20},"combee":{"evos":["Vespiquen"],"evoLevel":21},"buizel":{"evos":["Floatzel"],"evoLevel":26},"cherubi":{"evos":["Cherrim"],"evoLevel":25},"shellos":{"evos":["Gastrodon"],"evoLevel":30},"drifloon":{"evos":["Drifblim"],"evoLevel":28},"glameow":{"evos":["Purugly"],"evoLevel":38},"stunky":{"evos":["Skuntank"],"evoLevel":34},"bronzor":{"evos":["Bronzong"],"evoLevel":33},"gible":{"evos":["Gabite"],"evoLevel":24},"gabite":{"evos":["Garchomp"],"evoLevel":48},"hippopotas":{"evos":["Hippowdon"],"evoLevel":34},"skorupi":{"evos":["Drapion"],"evoLevel":40},"croagunk":{"evos":["Toxicroak"],"evoLevel":37},"finneon":{"evos":["Lumineon"],"evoLevel":31},"snover":{"evos":["Abomasnow"],"evoLevel":40},"snivy":{"evos":["Servine"],"evoLevel":17},"servine":{"evos":["Serperior"],"evoLevel":36},"tepig":{"evos":["Pignite"],"evoLevel":17},"pignite":{"evos":["Emboar"],"evoLevel":36},"oshawott":{"evos":["Dewott"],"evoLevel":17},"dewott":{"evos":["Samurott","Samurott-Hisui"],"evoLevel":36},"patrat":{"evos":["Watchog"],"evoLevel":20},"lillipup":{"evos":["Herdier"],"evoLevel":16},"herdier":{"evos":["Stoutland"],"evoLevel":32},"purrloin":{"evos":["Liepard"],"evoLevel":20},"pidove":{"evos":["Tranquill"],"evoLevel":21},"tranquill":{"evos":["Unfezant"],"evoLevel":32},"blitzle":{"evos":["Zebstrika"],"evoLevel":27},"roggenrola":{"evos":["Boldore"],"evoLevel":25},"drilbur":{"evos":["Excadrill"],"evoLevel":31},"timburr":{"evos":["Gurdurr"],"evoLevel":25},"tympole":{"evos":["Palpitoad"],"evoLevel":25},"palpitoad":{"evos":["Seismitoad"],"evoLevel":36},"sewaddle":{"evos":["Swadloon"],"evoLevel":20},"venipede":{"evos":["Whirlipede"],"evoLevel":22},"whirlipede":{"evos":["Scolipede"],"evoLevel":30},"sandile":{"evos":["Krokorok"],"evoLevel":29},"krokorok":{"evos":["Krookodile"],"evoLevel":40},"darumaka":{"evos":["Darmanitan"],"evoLevel":35},"darumakagalar":{"evos":["Darmanitan-Galar"],"evoLevel":35},"dwebble":{"evos":["Crustle"],"evoLevel":34},"scraggy":{"evos":["Scrafty"],"evoLevel":39},"yamask":{"evos":["Cofagrigus"],"evoLevel":34},"tirtouga":{"evos":["Carracosta"],"evoLevel":37},"archen":{"evos":["Archeops"],"evoLevel":37},"trubbish":{"evos":["Garbodor"],"evoLevel":36},"zorua":{"evos":["Zoroark"],"evoLevel":30},"zoruahisui":{"evos":["Zoroark-Hisui"],"evoLevel":30},"gothita":{"evos":["Gothorita"],"evoLevel":32},"gothorita":{"evos":["Gothitelle"],"evoLevel":41},"solosis":{"evos":["Duosion"],"evoLevel":32},"duosion":{"evos":["Reuniclus"],"evoLevel":41},"ducklett":{"evos":["Swanna"],"evoLevel":35},"vanillite":{"evos":["Vanillish"],"evoLevel":35},"vanillish":{"evos":["Vanilluxe"],"evoLevel":47},"deerling":{"evos":["Sawsbuck"],"evoLevel":34},"karrablast":{"evos":["Escavalier"],"evoLevel":35},"foongus":{"evos":["Amoonguss"],"evoLevel":39},"frillish":{"evos":["Jellicent"],"evoLevel":40},"joltik":{"evos":["Galvantula"],"evoLevel":36},"ferroseed":{"evos":["Ferrothorn"],"evoLevel":40},"klink":{"evos":["Klang"],"evoLevel":38},"klang":{"evos":["Klinklang"],"evoLevel":49},"tynamo":{"evos":["Eelektrik"],"evoLevel":39},"elgyem":{"evos":["Beheeyem"],"evoLevel":42},"litwick":{"evos":["Lampent"],"evoLevel":41},"axew":{"evos":["Fraxure"],"evoLevel":38},"fraxure":{"evos":["Haxorus"],"evoLevel":48},"cubchoo":{"evos":["Beartic"],"evoLevel":37},"shelmet":{"evos":["Accelgor"],"evoLevel":35},"mienfoo":{"evos":["Mienshao"],"evoLevel":50},"golett":{"evos":["Golurk"],"evoLevel":43},"pawniard":{"evos":["Bisharp"],"evoLevel":52},"rufflet":{"evos":["Braviary","Braviary-Hisui"],"evoLevel":54},"vullaby":{"evos":["Mandibuzz"],"evoLevel":54},"deino":{"evos":["Zweilous"],"evoLevel":50},"zweilous":{"evos":["Hydreigon"],"evoLevel":64},"larvesta":{"evos":["Volcarona"],"evoLevel":59},"chespin":{"evos":["Quilladin"],"evoLevel":16},"quilladin":{"evos":["Chesnaught"],"evoLevel":36},"fennekin":{"evos":["Braixen"],"evoLevel":16},"braixen":{"evos":["Delphox"],"evoLevel":36},"froakie":{"evos":["Frogadier"],"evoLevel":16},"frogadier":{"evos":["Greninja"],"evoLevel":36},"bunnelby":{"evos":["Diggersby"],"evoLevel":20},"fletchling":{"evos":["Fletchinder"],"evoLevel":17},"fletchinder":{"evos":["Talonflame"],"evoLevel":35},"scatterbug":{"evos":["Spewpa"],"evoLevel":9},"spewpa":{"evos":["Vivillon"],"evoLevel":12},"litleo":{"evos":["Pyroar"],"evoLevel":35},"flabebe":{"evos":["Floette"],"evoLevel":19},"skiddo":{"evos":["Gogoat"],"evoLevel":32},"pancham":{"evos":["Pangoro"],"evoLevel":32},"espurr":{"evos":["Meowstic","Meowstic-F"],"evoLevel":25},"honedge":{"evos":["Doublade"],"evoLevel":35},"inkay":{"evos":["Malamar"],"evoLevel":30},"binacle":{"evos":["Barbaracle"],"evoLevel":39},"skrelp":{"evos":["Dragalge"],"evoLevel":48},"clauncher":{"evos":["Clawitzer"],"evoLevel":37},"helioptile":{"evos":["Heliolisk"],"evoLevel":35},"tyrunt":{"evos":["Tyrantrum"],"evoLevel":39},"amaura":{"evos":["Aurorus"],"evoLevel":39},"goomy":{"evos":["Sliggoo","Sliggoo-Hisui"],"evoLevel":40},"sliggoo":{"evos":["Goodra"],"evoLevel":50},"sliggoohisui":{"evos":["Goodra-Hisui"],"evoLevel":50},"phantump":{"evos":["Trevenant"],"evoLevel":35},"pumpkaboo":{"evos":["Gourgeist"],"evoLevel":35},"bergmite":{"evos":["Avalugg","Avalugg-Hisui"],"evoLevel":37},"noibat":{"evos":["Noivern"],"evoLevel":48},"rowlet":{"evos":["Dartrix"],"evoLevel":17},"dartrix":{"evos":["Decidueye","Decidueye-Hisui"],"evoLevel":34},"litten":{"evos":["Torracat"],"evoLevel":17},"torracat":{"evos":["Incineroar"],"evoLevel":34},"popplio":{"evos":["Brionne"],"evoLevel":17},"brionne":{"evos":["Primarina"],"evoLevel":34},"pikipek":{"evos":["Trumbeak"],"evoLevel":14},"trumbeak":{"evos":["Toucannon"],"evoLevel":28},"yungoos":{"evos":["Gumshoos"],"evoLevel":20},"grubbin":{"evos":["Charjabug"],"evoLevel":20},"cutiefly":{"evos":["Ribombee"],"evoLevel":25},"mareanie":{"evos":["Toxapex"],"evoLevel":38},"mudbray":{"evos":["Mudsdale"],"evoLevel":30},"dewpider":{"evos":["Araquanid"],"evoLevel":22},"fomantis":{"evos":["Lurantis"],"evoLevel":34},"morelull":{"evos":["Shiinotic"],"evoLevel":24},"salandit":{"evos":["Salazzle"],"evoLevel":33},"stufful":{"evos":["Bewear"],"evoLevel":27},"bounsweet":{"evos":["Steenee"],"evoLevel":18},"wimpod":{"evos":["Golisopod"],"evoLevel":30},"sandygast":{"evos":["Palossand"],"evoLevel":42},"jangmoo":{"evos":["Hakamo-o"],"evoLevel":35},"hakamoo":{"evos":["Kommo-o"],"evoLevel":45},"cosmog":{"evos":["Cosmoem"],"evoLevel":43},"cosmoem":{"evos":["Solgaleo","Lunala"],"evoLevel":53},"grookey":{"evos":["Thwackey"],"evoLevel":16},"thwackey":{"evos":["Rillaboom"],"evoLevel":35},"scorbunny":{"evos":["Raboot"],"evoLevel":16},"raboot":{"evos":["Cinderace"],"evoLevel":35},"sobble":{"evos":["Drizzile"],"evoLevel":16},"drizzile":{"evos":["Inteleon"],"evoLevel":35},"skwovet":{"evos":["Greedent"],"evoLevel":24},"rookidee":{"evos":["Corvisquire"],"evoLevel":18},"corvisquire":{"evos":["Corviknight"],"evoLevel":38},"blipbug":{"evos":["Dottler"],"evoLevel":10},"dottler":{"evos":["Orbeetle"],"evoLevel":30},"nickit":{"evos":["Thievul"],"evoLevel":18},"gossifleur":{"evos":["Eldegoss"],"evoLevel":20},"wooloo":{"evos":["Dubwool"],"evoLevel":24},"chewtle":{"evos":["Drednaw"],"evoLevel":22},"yamper":{"evos":["Boltund"],"evoLevel":25},"rolycoly":{"evos":["Carkol"],"evoLevel":18},"carkol":{"evos":["Coalossal"],"evoLevel":34},"silicobra":{"evos":["Sandaconda"],"evoLevel":36},"arrokuda":{"evos":["Barraskewda"],"evoLevel":26},"toxel":{"evos":["Toxtricity","Toxtricity-Low-Key"],"evoLevel":30},"sizzlipede":{"evos":["Centiskorch"],"evoLevel":28},"hatenna":{"evos":["Hattrem"],"evoLevel":32},"hattrem":{"evos":["Hatterene"],"evoLevel":42},"impidimp":{"evos":["Morgrem"],"evoLevel":32},"morgrem":{"evos":["Grimmsnarl"],"evoLevel":42},"cufant":{"evos":["Copperajah"],"evoLevel":34},"dreepy":{"evos":["Drakloak"],"evoLevel":50},"drakloak":{"evos":["Dragapult"],"evoLevel":60},"sprigatito":{"evos":["Floragato"],"evoLevel":16},"floragato":{"evos":["Meowscarada"],"evoLevel":36},"fuecoco":{"evos":["Crocalor"],"evoLevel":16},"crocalor":{"evos":["Skeledirge"],"evoLevel":36},"quaxly":{"evos":["Quaxwell"],"evoLevel":16},"quaxwell":{"evos":["Quaquaval"],"evoLevel":36},"lechonk":{"evos":["Oinkologne","Oinkologne-F"],"evoLevel":18},"tarountula":{"evos":["Spidops"],"evoLevel":15},"nymble":{"evos":["Lokix"],"evoLevel":24},"pawmi":{"evos":["Pawmo"],"evoLevel":18},"tandemaus":{"evos":["Maushold","Maushold-Four"],"evoLevel":25},"fidough":{"evos":["Dachsbun"],"evoLevel":26},"smoliv":{"evos":["Dolliv"],"evoLevel":25},"dolliv":{"evos":["Arboliva"],"evoLevel":35},"nacli":{"evos":["Naclstack"],"evoLevel":24},"naclstack":{"evos":["Garganacl"],"evoLevel":38},"wattrel":{"evos":["Kilowattrel"],"evoLevel":25},"maschiff":{"evos":["Mabosstiff"],"evoLevel":30},"shroodle":{"evos":["Grafaiai"],"evoLevel":28},"toedscool":{"evos":["Toedscruel"],"evoLevel":30},"flittle":{"evos":["Espathra"],"evoLevel":35},"tinkatink":{"evos":["Tinkatuff"],"evoLevel":24},"tinkatuff":{"evos":["Tinkaton"],"evoLevel":38},"wiglett":{"evos":["Wugtrio"],"evoLevel":26},"finizen":{"evos":["Palafin"],"evoLevel":38},"varoom":{"evos":["Revavroom"],"evoLevel":40},"glimmet":{"evos":["Glimmora"],"evoLevel":35},"greavard":{"evos":["Houndstone"],"evoLevel":30},"frigibax":{"evos":["Arctibax"],"evoLevel":35},"arctibax":{"evos":["Baxcalibur"],"evoLevel":54},"syclar":{"evos":["Syclant"],"evoLevel":30},"embirch":{"evos":["Flarelm"],"evoLevel":24},"flarelm":{"evos":["Pyroak"],"evoLevel":38},"breezi":{"evos":["Fidgit"],"evoLevel":33},"rebble":{"evos":["Tactite"],"evoLevel":28},"privatyke":{"evos":["Arghonaut"],"evoLevel":37},"voodoll":{"evos":["Voodoom"],"evoLevel":32},"scratchet":{"evos":["Tomohawk"],"evoLevel":23},"necturine":{"evos":["Necturna"],"evoLevel":31},"cupra":{"evos":["Argalis"],"evoLevel":30},"argalis":{"evos":["Aurumoth"],"evoLevel":50},"brattler":{"evos":["Malaconda"],"evoLevel":33},"cawdet":{"evos":["Cawmodore"],"evoLevel":33},"volkritter":{"evos":["Volkraken"],"evoLevel":34},"snugglow":{"evos":["Plasmanta"],"evoLevel":29},"floatoy":{"evos":["Caimanoe"],"evoLevel":21},"caimanoe":{"evos":["Naviathan"],"evoLevel":40},"fawnifer":{"evos":["Electrelk"],"evoLevel":17},"electrelk":{"evos":["Caribolt"],"evoLevel":34},"smogecko":{"evos":["Smoguana"],"evoLevel":15},"smoguana":{"evos":["Smokomodo"],"evoLevel":36},"swirlpool":{"evos":["Coribalis"],"evoLevel":17},"coribalis":{"evos":["Snaelstrom"],"evoLevel":34},"justyke":{"evos":["Equilibra"],"evoLevel":32},"solotl":{"evos":["Astrolotl"],"evoLevel":35},"miasmite":{"evos":["Miasmaw"],"evoLevel":30},"monohm":{"evos":["Duohm"],"evoLevel":32},"duohm":{"evos":["Cyclohm"],"evoLevel":43},"dorsoil":{"evos":["Colossoil"],"evoLevel":39},"protowatt":{"evos":["Krilowatt"],"evoLevel":15},"chuggon":{"evos":["Draggalong"],"evoLevel":36},"draggalong":{"evos":["Chuggalong"],"evoLevel":46}},
            
            // 根据等级进化宝可梦到正确形态
            // 仅对 MID(20-40)、HIGH(40-60)、APEX(60-85) 区域生效
            evolveToLevel(pokemonId, level) {
                if (level < 20) return pokemonId; // 低等级不进化
                
                // 标准化 ID 用于查找
                const normalizedId = pokemonId.toLowerCase().replace(/[^a-z0-9]/g, '');
                const data = this.EVOLUTION_TABLE[normalizedId];
                
                if (!data) return pokemonId; // 未找到数据，保持原样
                
                // 如果等级达到进化要求，递归检查下一阶段
                if (level >= data.evoLevel) {
                    // 获取第一个进化形态
                    const evoName = data.evos[0];
                    const evolvedId = evoName.toLowerCase().replace(/ /g, '-');
                    return this.evolveToLevel(evolvedId, level);
                }
                
                return pokemonId;
            },
            
            // 进化型宝可梦最低等级表（保险机制：确保进化型不会出现低于进化门槛的等级）
            EVOLVED_MIN_LEVEL: {"ivysaur":16,"venusaur":32,"charmeleon":16,"charizard":36,"wartortle":16,"blastoise":36,"metapod":7,"butterfree":10,"kakuna":7,"beedrill":10,"pidgeotto":18,"pidgeot":36,"raticate":20,"raticatealola":20,"fearow":20,"arbok":22,"sandslash":22,"nidorina":16,"nidorino":16,"golbat":22,"gloom":21,"parasect":24,"venomoth":31,"dugtrio":26,"dugtrioalola":26,"persian":28,"perrserker":28,"golduck":33,"primeape":28,"poliwhirl":25,"kadabra":16,"machoke":28,"weepinbell":21,"tentacruel":30,"graveler":25,"graveleralola":25,"rapidash":40,"rapidashgalar":40,"slowbro":37,"magneton":30,"dodrio":31,"dewgong":34,"muk":38,"mukalola":38,"haunter":25,"hypno":26,"kingler":28,"electrode":30,"marowak":28,"marowakalola":28,"weezing":35,"weezinggalar":35,"rhydon":42,"seadra":32,"seaking":33,"mrrime":42,"gyarados":20,"omastar":40,"kabutops":40,"dragonair":30,"dragonite":55,"bayleef":16,"meganium":32,"quilava":14,"typhlosion":36,"typhlosionhisui":36,"croconaw":18,"feraligatr":30,"furret":15,"noctowl":20,"ledian":18,"ariados":22,"lanturn":27,"xatu":25,"flaaffy":15,"ampharos":30,"azumarill":18,"skiploom":18,"jumpluff":27,"quagsire":20,"clodsire":20,"forretress":31,"granbull":23,"ursaring":30,"magcargo":38,"piloswine":33,"cursola":38,"octillery":25,"houndoom":24,"donphan":25,"hitmonlee":20,"hitmonchan":20,"hitmontop":20,"jynx":30,"electabuzz":30,"magmar":30,"pupitar":30,"tyranitar":55,"grovyle":16,"sceptile":36,"combusken":16,"blaziken":36,"marshtomp":16,"swampert":36,"mightyena":18,"linoone":20,"linoonegalar":20,"obstagoon":35,"silcoon":7,"cascoon":7,"beautifly":10,"dustox":10,"lombre":14,"nuzleaf":14,"swellow":22,"pelipper":25,"kirlia":20,"gardevoir":30,"masquerain":22,"breloom":23,"vigoroth":18,"slaking":36,"ninjask":20,"shedinja":20,"loudred":20,"exploud":40,"hariyama":24,"lairon":32,"aggron":42,"medicham":37,"manectric":26,"swalot":26,"sharpedo":30,"wailord":40,"camerupt":33,"grumpig":32,"vibrava":35,"flygon":45,"cacturne":32,"altaria":35,"whiscash":30,"crawdaunt":30,"claydol":36,"cradily":40,"armaldo":40,"banette":37,"dusclops":37,"wobbuffet":15,"glalie":42,"sealeo":32,"walrein":44,"shelgon":30,"salamence":50,"metang":20,"metagross":45,"grotle":18,"torterra":32,"monferno":14,"infernape":36,"prinplup":16,"empoleon":36,"staravia":14,"staraptor":34,"bibarel":15,"kricketune":10,"luxio":15,"luxray":30,"rampardos":30,"bastiodon":30,"wormadam":20,"wormadamsandy":20,"wormadamtrash":20,"mothim":20,"vespiquen":21,"floatzel":26,"cherrim":25,"gastrodon":30,"drifblim":28,"purugly":38,"skuntank":34,"bronzong":33,"gabite":24,"garchomp":48,"hippowdon":34,"drapion":40,"toxicroak":37,"lumineon":31,"abomasnow":40,"servine":17,"serperior":36,"pignite":17,"emboar":36,"dewott":17,"samurott":36,"samurotthisui":36,"watchog":20,"herdier":16,"stoutland":32,"liepard":20,"tranquill":21,"unfezant":32,"zebstrika":27,"boldore":25,"excadrill":31,"gurdurr":25,"palpitoad":25,"seismitoad":36,"swadloon":20,"whirlipede":22,"scolipede":30,"krokorok":29,"krookodile":40,"darmanitan":35,"crustle":34,"scrafty":39,"cofagrigus":34,"carracosta":37,"archeops":37,"garbodor":36,"zoroark":30,"zoroarkhisui":30,"gothorita":32,"gothitelle":41,"duosion":32,"reuniclus":41,"swanna":35,"vanillish":35,"vanilluxe":47,"sawsbuck":34,"amoonguss":39,"jellicent":40,"galvantula":36,"ferrothorn":40,"klang":38,"klinklang":49,"eelektrik":39,"beheeyem":42,"lampent":41,"fraxure":38,"haxorus":48,"beartic":37,"mienshao":50,"golurk":43,"bisharp":52,"braviary":54,"braviaryhisui":54,"mandibuzz":54,"zweilous":50,"hydreigon":64,"volcarona":59,"quilladin":16,"chesnaught":36,"braixen":16,"delphox":36,"frogadier":16,"greninja":36,"diggersby":20,"fletchinder":17,"talonflame":35,"spewpa":9,"vivillon":12,"vivillonfancy":12,"pyroar":35,"floette":19,"gogoat":32,"pangoro":32,"meowstic":25,"meowsticf":25,"doublade":35,"malamar":30,"barbaracle":39,"dragalge":48,"clawitzer":37,"tyrantrum":39,"aurorus":39,"sliggoo":40,"sliggoohisui":40,"goodra":50,"goodrahisui":50,"avalugg":37,"avalugghisui":37,"noivern":48,"dartrix":17,"decidueye":34,"decidueyehisui":36,"torracat":17,"incineroar":34,"brionne":17,"primarina":34,"trumbeak":14,"toucannon":28,"gumshoos":20,"charjabug":20,"ribombee":25,"lycanroc":25,"lycanrocmidnight":25,"lycanrocdusk":25,"toxapex":38,"mudsdale":30,"araquanid":22,"lurantis":34,"shiinotic":24,"salazzle":33,"bewear":27,"steenee":18,"golisopod":30,"palossand":42,"hakamoo":35,"kommoo":45,"cosmoem":43,"solgaleo":53,"lunala":53,"thwackey":16,"rillaboom":35,"raboot":16,"cinderace":35,"drizzile":16,"inteleon":35,"greedent":24,"corvisquire":18,"corviknight":38,"dottler":10,"orbeetle":30,"thievul":18,"eldegoss":20,"dubwool":24,"drednaw":22,"boltund":25,"carkol":18,"coalossal":34,"sandaconda":36,"barraskewda":26,"toxtricity":30,"toxtricitylowkey":30,"centiskorch":28,"hattrem":32,"hatterene":42,"morgrem":32,"grimmsnarl":42,"copperajah":34,"drakloak":50,"dragapult":60,"floragato":16,"meowscarada":36,"crocalor":16,"skeledirge":36,"quaxwell":16,"quaquaval":36,"oinkologne":18,"oinkolognef":18,"spidops":15,"lokix":24,"pawmo":18,"maushold":25,"mausholdfour":25,"dachsbun":26,"dolliv":25,"arboliva":35,"naclstack":24,"garganacl":38,"kilowattrel":25,"mabosstiff":30,"grafaiai":28,"toedscruel":30,"espathra":35,"tinkatuff":24,"tinkaton":38,"wugtrio":26,"palafin":38,"revavroom":40,"glimmora":35,"houndstone":30,"arctibax":35,"baxcalibur":54,"syclant":30,"flarelm":24,"pyroak":38,"fidgit":33,"tactite":28,"arghonaut":37,"voodoom":32,"tomohawk":23,"necturna":31,"argalis":30,"aurumoth":50,"malaconda":33,"cawmodore":33,"volkraken":34,"plasmanta":29,"caimanoe":21,"naviathan":40,"electrelk":17,"caribolt":34,"smoguana":15,"smokomodo":36,"coribalis":17,"snaelstrom":34,"equilibra":32,"astrolotl":35,"miasmaw":30,"duohm":32,"cyclohm":43,"colossoil":39,"krilowatt":15,"draggalong":36,"chuggalong":46},
            
            // 获取进化型宝可梦的最低等级（保险机制）
            getEvolvedMinLevel(pokemonId) {
                const normalizedId = pokemonId.toLowerCase().replace(/[^a-z0-9]/g, '');
                return this.EVOLVED_MIN_LEVEL[normalizedId] || 0;
            },
            
            // 从池中随机选择一个宝可梦
            pickFromPool(pool, levelRange, rarity = null) {
                if (!pool || pool.length === 0) return null;
                
                const idx = Math.floor(Math.random() * pool.length);
                const entry = pool[idx];
                
                let pokemonId, configMin;
                if (typeof entry === 'string') {
                    pokemonId = entry;
                    configMin = null; // 配置文件未指定 min
                } else {
                    pokemonId = entry.id;
                    configMin = entry.min || null;
                }
                
                // 保险机制：获取进化型宝可梦的最低等级门槛
                const evolvedMin = this.getEvolvedMinLevel(pokemonId);
                
                // 优先级：配置文件 min > 进化门槛保险 > 区域等级范围
                const effectiveMin = Math.max(
                    configMin || levelRange.min,  // 配置 min 优先，否则用区域 min
                    evolvedMin                     // 进化门槛保险
                );
                const effectiveMax = Math.max(levelRange.max, effectiveMin);
                let level = Math.floor(Math.random() * (effectiveMax - effectiveMin + 1)) + effectiveMin;
                
                // Boss 等级加成：+3~5 级
                if (rarity === 'boss') {
                    const bossBonus = 3 + Math.floor(Math.random() * 3); // 3-5 级加成
                    level = Math.min(level + bossBonus, 100); // 上限 100 级
                }
                
                // 进化逻辑：对于 MID/HIGH/APEX 区域（level >= 20），自动进化到正确形态
                if (level >= 20) {
                    const originalId = pokemonId;
                    pokemonId = this.evolveToLevel(pokemonId, level);
                    if (originalId !== pokemonId) {
                        console.log(`[PKM] 进化: ${originalId} Lv.${level} -> ${pokemonId}`);
                    }
                }
                
                return { id: pokemonId, level };
            },
            
            // ========== 异变宝可梦生成逻辑 ==========
            // 悖谬宝可梦刷怪池配置（内嵌，避免跨域问题）
            PARADOX_SPAWN_POOLS: {
                Pool_Ancient_Sun: { type: "ancient", pokemon: [{ id: "brutebonnet", min: 55 }, { id: "slitherwing", min: 55 }] },
                Pool_Ancient_Moon: { type: "ancient", pokemon: [{ id: "screamtail", min: 55 }, { id: "fluttermane", min: 55 }] },
                Pool_Ancient_Earth: { type: "ancient", pokemon: [{ id: "greattusk", min: 55 }, { id: "sandyshocks", min: 55 }] },
                Pool_Future_Drive: { type: "future", pokemon: [{ id: "ironhands", min: 55 }, { id: "irontreads", min: 55 }] },
                Pool_Future_Sky: { type: "future", pokemon: [{ id: "ironmoth", min: 55 }, { id: "ironjugulis", min: 55 }] },
                Pool_Future_Code: { type: "future", pokemon: [{ id: "ironbundle", min: 55 }, { id: "ironthorns", min: 55 }] }
            },
            
            // 单点 Boss 配置
            STATIC_BOSS_MAP: {
                Boss_Anc_Apex: { type: "ancient", pokemon: { id: "roaringmoon", min: 72 } },
                Boss_Fut_Apex: { type: "future", pokemon: { id: "ironvaliant", min: 72 } },
                Elite_Walking_Wake: { type: "ancient", pokemon: { id: "walkingwake", min: 68 } },
                Elite_Raging_Bolt: { type: "ancient", pokemon: { id: "ragingbolt", min: 68 } },
                Elite_Gouging_Fire: { type: "ancient", pokemon: { id: "gougingfire", min: 68 } },
                Elite_Iron_Leavs: { type: "future", pokemon: { id: "ironleaves", min: 68 } },
                Elite_Iron_Boulder: { type: "future", pokemon: { id: "ironboulder", min: 68 } },
                Elite_Iron_Crown: { type: "future", pokemon: { id: "ironcrown", min: 68 } }
            },
            
            // 究极异兽配置
            ULTRA_BEAST_MAP: {
                UB01_Nihilego: { pokemon: { id: "nihilego", min: 55 } },
                UB02_Buzzwole: { pokemon: { id: "buzzwole", min: 55 } },
                UB02_Pheromosa: { pokemon: { id: "pheromosa", min: 55 } },
                UB03_Xurkitree: { pokemon: { id: "xurkitree", min: 55 } },
                UB04_Celesteela: { pokemon: { id: "celesteela", min: 55 } },
                UB04_Kartana: { pokemon: { id: "kartana", min: 55 } },
                UB05_Guzzlord: { pokemon: { id: "guzzlord", min: 55 } },
                UB_Blacephalon: { pokemon: { id: "blacephalon", min: 55 } },
                UB_Stakataka: { pokemon: { id: "stakataka", min: 55 } }
            },
            
            // 生成异变宝可梦（基于当前格子的实体和 phenomenon 状态）
            spawnPhenomenonPokemon(gx, gy, phenomenon, entities) {
                if (!phenomenon || phenomenon.active_type === "clear") return null;
                
                const activeType = phenomenon.active_type;
                const activeRegion = phenomenon.active_region;
                
                // 检查当前格子是否有异变实体
                const paradoxAnchors = entities.paradoxAnchors || [];
                const ultraWormholes = entities.ultraWormholes || [];
                
                // Ultra 异变：检查究极之洞
                if (activeType === "ultra" && ultraWormholes.length > 0) {
                    for (const ub of ultraWormholes) {
                        const config = this.ULTRA_BEAST_MAP[ub];
                        if (config) {
                            const level = config.pokemon.min + Math.floor(Math.random() * 10);
                            return {
                                id: config.pokemon.id,
                                level,
                                rarity: "ultra_beast",
                                biome: "Ultra_Space",
                                surface: "Wormhole",
                                threat: 10,
                                phenomenon: activeType
                            };
                        }
                    }
                }
                
                // Ancient/Future 异变：检查悖谬锚点
                if ((activeType === "ancient" || activeType === "future") && paradoxAnchors.length > 0) {
                    for (const anchor of paradoxAnchors) {
                        // Boss 类型（25% 刷新）
                        if (anchor.startsWith("Elite_") || anchor.startsWith("Boss_")) {
                            const config = this.STATIC_BOSS_MAP[anchor];
                            if (config && config.type === activeType) {
                                if (Math.random() < 0.25) {
                                    const level = config.pokemon.min + Math.floor(Math.random() * 5);
                                    return {
                                        id: config.pokemon.id,
                                        level,
                                        rarity: "paradox_boss",
                                        biome: "Paradox_Zone",
                                        surface: "Anchor",
                                        threat: 10,
                                        phenomenon: activeType
                                    };
                                }
                            }
                        }
                        
                        // Pool 类型（25% 概率）
                        if (anchor.startsWith("Pool_")) {
                            const config = this.PARADOX_SPAWN_POOLS[anchor];
                            if (config && config.type === activeType) {
                                // 25% 概率刷新
                                if (Math.random() < 0.25) {
                                    const pokemon = config.pokemon[Math.floor(Math.random() * config.pokemon.length)];
                                    const level = pokemon.min + Math.floor(Math.random() * 10);
                                    return {
                                        id: pokemon.id,
                                        level,
                                        rarity: "paradox",
                                        biome: "Paradox_Zone",
                                        surface: "Anchor",
                                        threat: 8,
                                        phenomenon: activeType
                                    };
                                }
                            }
                        }
                    }
                }
                
                return null;
            },
            
            // 生成单个格子的宝可梦列表
            // phenomenon: { active_type, active_region } 异变状态
            spawnForGrid(gx, gy, spawnTablesData, phenomenon = null) {
                const gridInfo = LocationContextBackend.getGridInfo(gx, gy);
                const entities = LocationContextBackend.getEntitiesAtGrid(gx, gy);
                
                const threat = gridInfo.threat;
                const surfaceType = gridInfo.surface;
                const biomeZone = entities.biomeZone;
                
                // 和平区域或无效数据：无宝可梦
                if (this.isPeaceZone(threat) || !surfaceType || !biomeZone) {
                    return [];
                }
                
                const resolvedZone = this.resolveZoneName(biomeZone, surfaceType);
                
                // 严格匹配：zone 必须存在
                const zoneTable = spawnTablesData[resolvedZone];
                if (!zoneTable) {
                    console.warn(`[PKM] Zone not found: ${resolvedZone}`);
                    return [];
                }
                
                // 严格匹配：surface 必须存在
                const surfacePool = zoneTable[surfaceType];
                if (!surfacePool) {
                    console.warn(`[PKM] Surface not found: ${resolvedZone}.${surfaceType}`);
                    return [];
                }
                
                const count = 4 + Math.floor(Math.random() * 2);
                const results = [];
                const levelRange = this.getLevelRange(threat);
                
                // ========== 异变宝可梦注入（基于 phenomenon 状态）==========
                if (phenomenon && phenomenon.active_type !== "clear") {
                    const phenomenonPokemon = this.spawnPhenomenonPokemon(gx, gy, phenomenon, entities);
                    if (phenomenonPokemon) {
                        results.push(phenomenonPokemon);
                        console.log(`[PKM] ★ 异变宝可梦: ${phenomenonPokemon.id} Lv.${phenomenonPokemon.level} (${phenomenon.active_type})`);
                    }
                }
                
                // ========== Legendary 独立判定（0.1% 概率）==========
                // Legendary 宝可梦单独判定，不占用普通宝可梦位置
                if (surfacePool.legendary && surfacePool.legendary.length > 0) {
                    const legendaryRoll = Math.random() * 1000;
                    if (legendaryRoll < 1) { // 0.1% 概率 (1/1000)
                        const legendaryPool = surfacePool.legendary;
                        const legendaryPokemon = this.pickFromPool(legendaryPool, { min: 70, max: 90 }, 'legendary');
                        if (legendaryPokemon) {
                            results.push({
                                ...legendaryPokemon,
                                rarity: 'legendary',
                                biome: biomeZone,
                                surface: surfaceType,
                                threat
                            });
                            console.log(`[PKM] ★ Legendary 出现！${legendaryPokemon.id} Lv.${legendaryPokemon.level}`);
                        }
                    }
                }
                
                for (let i = 0; i < count; i++) {
                    const requestedRarity = this.getRarityPool(threat);
                    if (!requestedRarity) continue;
                    
                    // 按优先级尝试获取池子，记录实际使用的稀有度
                    let pool = null;
                    let actualRarity = requestedRarity;
                    
                    if (surfacePool[requestedRarity] && surfacePool[requestedRarity].length > 0) {
                        pool = surfacePool[requestedRarity];
                        actualRarity = requestedRarity;
                    } else if (requestedRarity === 'boss' && surfacePool['rare'] && surfacePool['rare'].length > 0) {
                        pool = surfacePool['rare'];
                        actualRarity = 'rare';
                    } else if ((requestedRarity === 'boss' || requestedRarity === 'rare') && surfacePool['uncommon'] && surfacePool['uncommon'].length > 0) {
                        pool = surfacePool['uncommon'];
                        actualRarity = 'uncommon';
                    } else if (surfacePool['common'] && surfacePool['common'].length > 0) {
                        pool = surfacePool['common'];
                        actualRarity = 'common';
                    }
                    
                    if (!pool || pool.length === 0) continue;
                    
                    const pokemon = this.pickFromPool(pool, levelRange, actualRarity);
                    if (pokemon) {
                        results.push({
                            ...pokemon,
                            rarity: actualRarity,
                            biome: biomeZone,
                            surface: surfaceType,
                            threat
                        });
                    }
                }
                
                results.sort((a, b) => a.level - b.level);
                return results;
            },
            
            // 生成位置键
            getLocationKey(gx, gy) {
                return `${gx}_${gy}`;
            },
            
            // 为玩家周围区域生成宝可梦（半径2格）
            // forceRefresh: 强制刷新，忽略已有数据（用于每日刷新）
            async generateForNearbyGrids(x, y, eraVars, forceRefresh = false) {
                await LocationContextBackend.loadData();
                
                const spawnTablesData = LocationContextBackend.spawnTablesData;
                if (!spawnTablesData) {
                    console.warn('[PKM] SPAWN_TABLES_DATA 未加载');
                    return null;
                }
                
                const internal = LocationContextBackend.toInternalCoords(x, y);
                const centerGx = internal.gx;
                const centerGy = internal.gy;
                
                // 获取当前 ERA 中已存在的宝可梦区域（强制刷新时忽略）
                const existingSpawns = forceRefresh ? {} : (eraVars?.world_state?.pokemon_spawns || {});
                
                // 获取当前异变状态
                const phenomenon = eraVars?.world_state?.phenomenon || { active_type: "clear", active_region: "none" };
                console.log('[PKM] [SPAWN] 当前异变状态:', phenomenon);
                
                // 半径2格的所有格子（与地标范围一致）
                const offsets = [
                    { dx: 0, dy: 0 },   // 当前格子
                    { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
                    { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 },
                    { dx: 0, dy: -2 }, { dx: 0, dy: 2 }, { dx: -2, dy: 0 }, { dx: 2, dy: 0 }
                ];
                
                const newSpawns = {};
                
                for (const { dx, dy } of offsets) {
                    const gx = centerGx + dx;
                    const gy = centerGy + dy;
                    const key = this.getLocationKey(gx, gy);
                    
                    // 只增不改：如果已存在则跳过（强制刷新时不跳过）
                    if (existingSpawns[key]) {
                        continue;
                    }
                    
                    // 生成该格子的宝可梦（传入异变状态）
                    const pokemonList = this.spawnForGrid(gx, gy, spawnTablesData, phenomenon);
                    if (pokemonList.length > 0) {
                        // 转换为对象结构（ERA 不支持数组）
                        const pokemonObj = {};
                        pokemonList.forEach((poke, idx) => {
                            pokemonObj[`p${idx + 1}`] = poke;
                        });
                        newSpawns[key] = pokemonObj;
                    }
                }
                
                return Object.keys(newSpawns).length > 0 ? newSpawns : null;
            },
            
            // 获取当前格子的宝可梦（用于位置上下文显示）
            getCurrentGridPokemon(x, y, eraVars) {
                const internal = LocationContextBackend.toInternalCoords(x, y);
                const key = this.getLocationKey(internal.gx, internal.gy);
                
                const spawns = eraVars?.world_state?.pokemon_spawns || {};
                const gridData = spawns[key];
                if (!gridData) return [];
                
                // 从对象结构转回数组（p1, p2, p3...）
                const result = [];
                const keys = Object.keys(gridData).sort((a, b) => {
                    const numA = parseInt(a.replace('p', ''));
                    const numB = parseInt(b.replace('p', ''));
                    return numA - numB;
                });
                for (const k of keys) {
                    if (gridData[k]) result.push(gridData[k]);
                }
                return result;
            }
        };
        
        // ========== ERA 变量操作函数（参考 pkm-tavern-plugin.js）==========
        
        // 插入 ERA 变量（只增不改）
        function insertEraVars(data) {
            if (typeof eventEmit === 'function') {
                eventEmit('era:insertByObject', data);
            }
        }
        
        // 更新 ERA 变量
        function updateEraVars(data) {
            if (typeof eventEmit === 'function') {
                eventEmit('era:updateByObject', data);
            }
        }
        
        // 插入宝可梦区域数据
        async function eraInsertPokemonSpawns(newSpawns) {
            if (!newSpawns || Object.keys(newSpawns).length === 0) return;
            
            const insertData = {
                world_state: {
                    pokemon_spawns: newSpawns
                }
            };
            
            // 使用 era:insertByObject 插入（只增不改）
            insertEraVars(insertData);
            console.log('[PKM] ✓ 宝可梦区域已注入 ERA:', Object.keys(newSpawns));
        }
        
        // 插入天气格子数据到 ERA（类似 pokemon_spawns）
        async function eraInsertWeatherGrid(newWeather) {
            if (!newWeather || Object.keys(newWeather).length === 0) return;
            
            const insertData = {
                world_state: {
                    weather_grid: newWeather
                }
            };
            
            // 使用 era:insertByObject 插入（只增不改）
            insertEraVars(insertData);
            console.log('[PKM] ✓ 天气格子已注入 ERA:', Object.keys(newWeather));
        }
        
        // 刷新天气格子数据（每日刷新）- 先删除再插入
        async function eraRefreshWeatherGrid(newWeather) {
            try {
                // 构建 VariableDelete 块
                const variableDeleteData = {
                    world_state: {
                        weather_grid: {}
                    }
                };
                const variableDeleteJson = JSON.stringify(variableDeleteData, null, 2);
                const variableDeleteBlock = `<VariableDelete>\n${variableDeleteJson}\n</VariableDelete>`;
                
                // 构建 VariableInsert 块
                let variableInsertBlock = '';
                if (newWeather && Object.keys(newWeather).length > 0) {
                    const variableInsertData = {
                        world_state: {
                            weather_grid: newWeather
                        }
                    };
                    const variableInsertJson = JSON.stringify(variableInsertData, null, 2);
                    variableInsertBlock = `<VariableInsert>\n${variableInsertJson}\n</VariableInsert>`;
                }
                
                console.log('[PKM] [WEATHER] 生成 VariableDelete + VariableInsert（每日刷新）');
                
                const messageId = getLastMessageId();
                if (!messageId) {
                    console.warn('[PKM] [WEATHER] 无法获取最近消息ID');
                    return false;
                }
                
                const messages = getChatMessages(messageId);
                if (!messages || messages.length === 0) {
                    console.warn('[PKM] [WEATHER] 无法获取消息内容');
                    return false;
                }
                
                const msg = messages[0];
                let content = msg.message || '';
                
                content = content.trim() + '\n\n' + variableDeleteBlock;
                if (variableInsertBlock) {
                    content += '\n' + variableInsertBlock;
                }
                
                await setChatMessages([{
                    message_id: messageId,
                    message: content
                }], { refresh: 'affected' });
                
                console.log('[PKM] ✓ 天气格子已刷新:', Object.keys(newWeather || {}));
                return true;
            } catch (e) {
                console.error('[PKM] [WEATHER] 刷新失败:', e);
                return false;
            }
        }
        
        // 刷新宝可梦和天气数据（每日刷新）- 先删除再插入，合并成一个消息操作
        async function eraRefreshPokemonAndWeather(newSpawns, newWeather) {
            try {
                // 构建 VariableDelete 块（同时删除 pokemon_spawns 和 weather_grid）
                const variableDeleteData = {
                    world_state: {
                        pokemon_spawns: {},
                        weather_grid: {}
                    }
                };
                const variableDeleteJson = JSON.stringify(variableDeleteData, null, 2);
                const variableDeleteBlock = `<VariableDelete>\n${variableDeleteJson}\n</VariableDelete>`;
                
                // 构建 VariableInsert 块（宝可梦）
                let pokemonInsertBlock = '';
                if (newSpawns && Object.keys(newSpawns).length > 0) {
                    const pokemonInsertData = {
                        world_state: {
                            pokemon_spawns: newSpawns
                        }
                    };
                    const pokemonInsertJson = JSON.stringify(pokemonInsertData, null, 2);
                    pokemonInsertBlock = `<VariableInsert>\n${pokemonInsertJson}\n</VariableInsert>`;
                }
                
                // 构建 VariableInsert 块（天气）
                let weatherInsertBlock = '';
                if (newWeather && Object.keys(newWeather).length > 0) {
                    const weatherInsertData = {
                        world_state: {
                            weather_grid: newWeather
                        }
                    };
                    const weatherInsertJson = JSON.stringify(weatherInsertData, null, 2);
                    weatherInsertBlock = `<VariableInsert>\n${weatherInsertJson}\n</VariableInsert>`;
                }
                
                console.log('[PKM] [REFRESH] 生成 VariableDelete + VariableInsert（每日刷新：宝可梦+天气）');
                
                // 获取最近一楼消息ID
                const messageId = getLastMessageId();
                if (!messageId) {
                    console.warn('[PKM] [POKEMON] 无法获取最近消息ID，跳过刷新');
                    return false;
                }
                
                // 获取消息内容
                const messages = getChatMessages(messageId);
                if (!messages || messages.length === 0) {
                    console.warn('[PKM] [POKEMON] 无法获取消息内容，跳过刷新');
                    return false;
                }
                
                const msg = messages[0];
                let content = msg.message || '';
                
                // 先删除再插入，合并追加到消息末尾
                content = content.trim() + '\n\n' + variableDeleteBlock;
                if (pokemonInsertBlock) {
                    content += '\n' + pokemonInsertBlock;
                }
                if (weatherInsertBlock) {
                    content += '\n' + weatherInsertBlock;
                }
                
                // 更新消息
                await setChatMessages([{
                    message_id: messageId,
                    message: content
                }], { refresh: 'affected' });
                
                console.log('[PKM] ✓ 每日刷新完成 - 宝可梦:', Object.keys(newSpawns || {}).length, '个区域, 天气:', Object.keys(newWeather || {}).length, '个格子');
                return true;
            } catch (e) {
                console.error('[PKM] [REFRESH] 每日刷新失败:', e);
                return false;
            }
        }
        
        // 记录上次的游戏日期，用于检测日期变化
        let lastGameDay = null;
        // 记录上次的区域代码，用于检测区域变化
        let lastRegionCode = null;
        
        // 区域ID到简称的映射
        const REGION_SHORT_MAP = {
            'Region_Zenith': 'Z',
            'Region_Neon': 'N',
            'Region_Bloom': 'B',
            'Region_Shadow': 'S',
            'Region_Apex': 'A'
        };
        
        // 更新区域到 ERA 变量（通过 VariableEdit 注入消息）
        async function updateRegionToEra(newRegion) {
            try {
                const variableEditData = {
                    world_state: {
                        location: {
                            region: newRegion
                        }
                    }
                };
                
                const variableEditJson = JSON.stringify(variableEditData, null, 2);
                // 验证 JSON 格式（确保有最外层的 {}）
                if (!variableEditJson.startsWith('{') || !variableEditJson.endsWith('}')) {
                    console.error('[PKM] [REGION] VariableEdit JSON 格式错误:', variableEditJson);
                }
                const variableEditBlock = `<VariableEdit>\n${variableEditJson}\n</VariableEdit>`;
                
                console.log('[PKM] [REGION] 生成 VariableEdit:', variableEditBlock);
                
                // 获取最近一楼消息ID
                const messageId = getLastMessageId();
                if (!messageId) {
                    console.warn('[PKM] [REGION] 无法获取最近消息ID，跳过');
                    return false;
                }
                
                // 获取消息内容（同步调用，不需要 await）
                const messages = getChatMessages(messageId);
                if (!messages || messages.length === 0) {
                    console.warn('[PKM] [REGION] 无法获取消息内容，跳过');
                    return false;
                }
                
                const msg = messages[0];
                let content = msg.message || '';
                
                // 在末尾追加 VariableEdit
                content = content.trim() + '\n\n' + variableEditBlock;
                
                // 更新消息（使用 message_id 而不是 id）
                await setChatMessages([{
                    message_id: messageId,
                    message: content
                }], { refresh: 'affected' });
                
                console.log('[PKM] [REGION] ✓ 区域已更新为:', newRegion);
                return true;
            } catch (e) {
                console.error('[PKM] [REGION] 更新失败:', e);
                return false;
            }
        }
        
        // ========== 位置上下文注入函数 ==========
        async function injectLocationContext() {
            try {
                // 确保数据已加载
                await LocationContextBackend.loadData();
                
                const eraVars = await getEraVars();
                if (!eraVars) {
                    console.log('[PKM] 无 ERA 数据，跳过位置注入');
                    return;
                }
                
                // 获取位置信息
                const location = eraVars?.world_state?.location;
                if (!location || typeof location.x !== 'number') {
                    console.log('[PKM] 无位置数据，跳过位置注入');
                    return;
                }
                
                // ========== 检测区域变化，自动更新 ERA 变量 ==========
                const regionId = LocationContextBackend.getRegionByCoords(location.x, location.y);
                const currentRegion = REGION_SHORT_MAP[regionId] || 'Z';
                const storedRegion = location.region;
                
                // 如果区域变化，自动更新
                if (storedRegion !== currentRegion) {
                    console.log(`[PKM] [REGION] 检测到区域变化: ${storedRegion || '未知'} -> ${currentRegion}`);
                    await updateRegionToEra(currentRegion);
                    lastRegionCode = currentRegion;
                } else if (lastRegionCode === null) {
                    lastRegionCode = currentRegion;
                }
                
                // ========== 为玩家周围区域生成宝可梦（只增不改）==========
                // 注意：日期变化时的刷新（删除+插入）由 pkm:refreshPokemonSpawns 事件处理
                const currentDay = eraVars?.world_state?.time?.day || 1;
                lastGameDay = currentDay;
                
                const newSpawns = await PokemonSpawnSystem.generateForNearbyGrids(
                    location.x, 
                    location.y, 
                    eraVars
                );
                if (newSpawns && Object.keys(newSpawns).length > 0) {
                    await eraInsertPokemonSpawns(newSpawns);
                }
                
                // ========== 天气系统：为周围13格生成天气（只增不改）==========
                const newWeatherGrid = await WeatherSystem.generateForNearbyGrids(
                    location.x,
                    location.y,
                    eraVars
                );
                if (newWeatherGrid && Object.keys(newWeatherGrid).length > 0) {
                    await eraInsertWeatherGrid(newWeatherGrid);
                }
                
                // 获取当前格子和周围13格的天气
                const internal = LocationContextBackend.toInternalCoords(location.x, location.y);
                const centerGx = internal.gx;
                const centerGy = internal.gy;
                const weatherGrid = eraVars?.world_state?.weather_grid || {};
                
                // 当前格子天气
                const currentGridKey = `${centerGx}_${centerGy}`;
                const currentWeatherConfig = weatherGrid[currentGridKey] || null;
                
                // 收集周围13格天气（距离为2）
                const nearbyWeathers = [];
                const offsets = [
                    { dx: 0, dy: -1, dir: '北' }, { dx: 0, dy: 1, dir: '南' },
                    { dx: -1, dy: 0, dir: '西' }, { dx: 1, dy: 0, dir: '东' },
                    { dx: -1, dy: -1, dir: '西北' }, { dx: 1, dy: -1, dir: '东北' },
                    { dx: -1, dy: 1, dir: '西南' }, { dx: 1, dy: 1, dir: '东南' },
                    { dx: 0, dy: -2, dir: '北2' }, { dx: 0, dy: 2, dir: '南2' },
                    { dx: -2, dy: 0, dir: '西2' }, { dx: 2, dy: 0, dir: '东2' }
                ];
                
                for (const { dx, dy, dir } of offsets) {
                    const gx = centerGx + dx;
                    const gy = centerGy + dy;
                    const key = `${gx}_${gy}`;
                    const weather = weatherGrid[key];
                    if (weather) {
                        nearbyWeathers.push({ dir, weather: weather.weather, suppression: weather.suppression });
                    }
                }
                
                // ========== 获取当前格子的宝可梦（从 ERA 读取）==========
                const currentPokemon = PokemonSpawnSystem.getCurrentGridPokemon(
                    location.x, 
                    location.y, 
                    eraVars
                );
                
                // 生成完整的位置上下文文本
                let contextText = LocationContextBackend.generateContextText(
                    location.x, 
                    location.y
                );
                
                // ========== 添加天气信息到上下文 ==========
                if (currentWeatherConfig || nearbyWeathers.length > 0) {
                    const weatherLines = ['', '【天气状况】'];
                    
                    // 脚下天气
                    if (currentWeatherConfig) {
                        let currentLine = `脚下: ${currentWeatherConfig.weather}`;
                        if (currentWeatherConfig.suppression?.suppressed?.length > 0) {
                            currentLine += ` (压制: ${currentWeatherConfig.suppression.suppressed.join('/')})`;
                        }
                        weatherLines.push(currentLine);
                    }
                    
                    // 四周天气（按天气类型分组，减少冗余）
                    if (nearbyWeathers.length > 0) {
                        const weatherGroups = {};
                        for (const nw of nearbyWeathers) {
                            if (!weatherGroups[nw.weather]) {
                                weatherGroups[nw.weather] = [];
                            }
                            weatherGroups[nw.weather].push(nw.dir);
                        }
                        
                        const nearbyParts = [];
                        for (const [weather, dirs] of Object.entries(weatherGroups)) {
                            nearbyParts.push(`${dirs.join('/')}:${weather}`);
                        }
                        weatherLines.push(`四周: ${nearbyParts.join(', ')}`);
                    }
                    
                    // 在【周围环境】之前插入
                    const insertPoint = contextText.indexOf('【周围环境】');
                    if (insertPoint > 0) {
                        const before = contextText.substring(0, insertPoint - 1);
                        const after = contextText.substring(insertPoint - 1);
                        contextText = before + weatherLines.join('\n') + '\n' + after;
                    } else {
                        contextText += weatherLines.join('\n');
                    }
                }
                
                // 添加当前格子的宝可梦信息
                if (currentPokemon && currentPokemon.length > 0) {
                    const pokemonLines = [
                        '',
                        '【附近宝可梦】'
                    ];
                    for (const poke of currentPokemon) {
                        const levelStr = poke.level ? `Lv.${poke.level}` : '';
                        const rarityStr = poke.rarity ? `(${poke.rarity})` : '';
                        pokemonLines.push(`  ${poke.id} ${levelStr} ${rarityStr}`);
                    }
                    // 在【周围环境】之前插入
                    const insertPoint = contextText.indexOf('【周围环境】');
                    if (insertPoint > 0) {
                        const beforeEnv = contextText.substring(0, insertPoint - 1);
                        const afterEnv = contextText.substring(insertPoint - 1);
                        contextText = beforeEnv + pokemonLines.join('\n') + '\n' + afterEnv;
                    } else {
                        contextText += '\n' + pokemonLines.join('\n');
                    }
                }
                
                // ========== 扫描聊天记录检测 NPC 触发词 ==========
                let npcTriggerSection = '';
                try {
                    // 使用 getChatMessages 获取最近10条聊天记录（与 pkm-tavern-plugin.js 一致）
                    const historyDepth = 10;
                    const allMessages = typeof getChatMessages === 'function' 
                        ? getChatMessages('0-{{lastMessageId}}') 
                        : null;
                    
                    if (allMessages && allMessages.length > 0) {
                        // 取最后 N 条
                        const messages = allMessages.slice(-historyDepth);
                        
                        // 过滤掉 ERA 变量标签，避免匹配到 JSON 里的 NPC ID
                        const textToScan = messages.map(m => {
                            let text = m.message || m.mes || '';
                            // 移除 <VariableInsert>、<VariableEdit>、<VariableDelete> 标签及其内容
                            text = text.replace(/<VariableInsert>[\s\S]*?<\/VariableInsert>/gi, '');
                            text = text.replace(/<VariableEdit>[\s\S]*?<\/VariableEdit>/gi, '');
                            text = text.replace(/<VariableDelete>[\s\S]*?<\/VariableDelete>/gi, '');
                            // 移除 <planning> 标签及其内容
                            text = text.replace(/<planning>[\s\S]*?<\/planning>/gi, '');
                            return text;
                        }).join('\n');
                        
                        // 扫描触发词
                        const triggeredNpcs = LocationContextBackend.scanForNpcTriggers(textToScan);
                        
                        if (triggeredNpcs.length > 0) {
                            // 获取匹配的 NPC 位置
                            const npcLocations = LocationContextBackend.getNpcLocationsByTriggers(triggeredNpcs);
                            
                            if (npcLocations.length > 0) {
                                const npcLines = ['', '【剧情触发NPC地点】'];
                                
                                // 按 NPC 分组显示
                                const groupedByNpc = {};
                                for (const loc of npcLocations) {
                                    if (!groupedByNpc[loc.displayName]) {
                                        groupedByNpc[loc.displayName] = [];
                                    }
                                    groupedByNpc[loc.displayName].push(loc);
                                }
                                
                                for (const [npcName, locations] of Object.entries(groupedByNpc)) {
                                    npcLines.push(`  ■ ${npcName}:`);
                                    for (const loc of locations) {
                                        const region = LocationContextBackend.getRegionByCoords(loc.displayX, loc.displayY);
                                        const regionInfo = LocationContextBackend.REGIONS[region];
                                        const regionShort = regionInfo?.short || '?';
                                        const placeName = loc.name || loc.id.replace(/_/g, ' ');
                                        npcLines.push(`    • ${placeName} [${loc.displayX}, ${loc.displayY}] (${regionShort}区)`);
                                    }
                                }
                                
                                npcTriggerSection = npcLines.join('\n');
                                console.log(`[PKM] 检测到 NPC 触发词: ${triggeredNpcs.join(', ')}`);
                            }
                        }
                    }
                } catch (e) {
                    console.warn('[PKM] NPC 触发词扫描失败:', e);
                }
                
                // 将 NPC 触发区块添加到上下文末尾
                if (npcTriggerSection) {
                    contextText += npcTriggerSection;
                }
                
                const promptContent = `<location_context>
${contextText}
</location_context>`;
                
                // 先清除旧注入
                if (typeof uninjectPrompts === 'function') {
                    try { uninjectPrompts([LOCATION_INJECT_ID]); } catch (e) {}
                }
                
                // 注入新内容
                if (typeof injectPrompts === 'function') {
                    injectPrompts([{
                        id: LOCATION_INJECT_ID,
                        position: 'after_wi_scan',
                        depth: 0,
                        role: 'system',
                        should_scan: false,
                        content: promptContent
                    }]);
                    console.log('[PKM] ✓ 位置上下文已注入:', location);
                } else {
                    console.warn('[PKM] injectPrompts API 不可用');
                }
            } catch (e) {
                console.error('[PKM] 位置上下文注入失败:', e);
            }
        }
        
        // ========== 初始化时注入位置上下文 ==========
        console.log('[PKM] 初始化位置上下文注入...');
        injectLocationContext();
        
        // ========== iframe 初始化（预加载用隐藏 iframe）==========
        let hiddenIframeLoaded = false;
        let visibleIframeLoaded = false;
        
        // 预加载隐藏的 iframe（用于后台数据同步）
        hiddenIframe.attr('src', PKM_URL);
        hiddenIframe.on('load', async function() {
            hiddenIframeLoaded = true;
            console.log('[PKM] 隐藏 iframe 已加载（用于数据同步）');
            
            // 加载完成后立即发送 ERA 数据
            const eraData = await getEraVars();
            if (eraData && hiddenIframe[0].contentWindow) {
                hiddenIframe[0].contentWindow.postMessage({
                    type: 'PKM_ERA_DATA',
                    data: eraData
                }, '*');
                console.log('[PKM] ✓ ERA 数据已发送到隐藏 iframe');
            }
        });
        
        // ========== 事件绑定 ==========
        ball.on('click', async function() {
            console.log('[PKM] 打开面板');
            overlay.css('display', 'flex');
            
            // 首次打开时加载显示用的 iframe
            if (!visibleIframeLoaded) {
                iframe.attr('src', PKM_URL);
                iframe.on('load', async function() {
                    visibleIframeLoaded = true;
                    console.log('[PKM] 显示 iframe 已加载');
                    
                    const eraData = await getEraVars();
                    if (eraData && iframe[0].contentWindow) {
                        iframe[0].contentWindow.postMessage({
                            type: 'PKM_ERA_DATA',
                            data: eraData
                        }, '*');
                    }
                });
            } else {
                // 已加载，刷新数据
                refreshDashboard();
            }
        });
        
        closeBtn.on('click', function(e) {
            e.stopPropagation();
            overlay.css('display', 'none');
        });
        
        overlay.on('click', function(e) {
            if (e.target === overlay[0]) {
                overlay.css('display', 'none');
            }
        });
        
        // ESC 关闭
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && overlay.css('display') !== 'none') {
                overlay.css('display', 'none');
            }
        });
        
        // ========== 刷新函数 ==========
        let refreshDashboardTimer = null;
        async function refreshDashboard() {
            // 防抖：避免频繁刷新导致卡顿
            if (refreshDashboardTimer) {
                clearTimeout(refreshDashboardTimer);
            }
            
            refreshDashboardTimer = setTimeout(async () => {
                console.log('[PKM] 刷新面板数据...');
                const eraData = await getEraVars();
                if (!eraData) return;
                
                const message = { type: 'PKM_REFRESH', data: eraData };
                
                // 只发送到显示的 iframe（如果已加载且面板打开）
                // 隐藏 iframe 不需要频繁刷新，只在初始化时同步
                if (visibleIframeLoaded && iframe[0] && iframe[0].contentWindow) {
                    try {
                        iframe[0].contentWindow.postMessage(message, '*');
                        console.log('[PKM] ✓ 已发送刷新数据到显示 iframe');
                    } catch (e) {}
                }
                
                refreshDashboardTimer = null;
            }, 150); // 150ms 防抖
        }
        
        // ========== Transfer Buffer 处理逻辑 ==========
        let transferBufferLock = false;
        
        async function handleTransferBuffer() {
            // 防抖锁
            if (transferBufferLock) {
                console.log('[PKM] [TRANSFER] 正在处理中，忽略重复请求');
                return;
            }
            
            try {
                const eraVars = await getEraVars();
                const transferBuffer = eraVars?.player?.party?.transfer_buffer;
                
                // 检查 transfer_buffer 是否有内容（name 不为 null）
                if (!transferBuffer || !transferBuffer.name) {
                    return; // 没有需要传输的内容
                }
                
                transferBufferLock = true;
                console.log('[PKM] [TRANSFER] 检测到 transfer_buffer 有内容:', transferBuffer.name);
                
                // 查找第一个空的盒子位置
                const box = eraVars?.player?.box || {};
                const existingKeys = Object.keys(box);
                const existingIds = existingKeys
                    .filter(k => k.startsWith('storage_'))
                    .map(k => parseInt(k.split('_')[1]) || 0);
                const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
                const newBoxKey = `storage_${String(nextId).padStart(2, '0')}`;
                
                // 准备盒子数据（移除 slot 字段）
                const boxData = JSON.parse(JSON.stringify(transferBuffer));
                delete boxData.slot;
                
                // 准备空的 transfer_buffer 结构
                const emptyTransferBuffer = {
                    slot: 7,
                    name: null,
                    nickname: null,
                    species: null,
                    gender: null,
                    lv: null,
                    quality: null,
                    nature: null,
                    ability: null,
                    shiny: false,
                    item: null,
                    mechanic: null,
                    teraType: null,
                    isAce: false,
                    isLead: false,
                    friendship: {
                        avs: { trust: 0, passion: 0, insight: 0, devotion: 0 },
                        av_up: { trust: 0, passion: 0, insight: 0, devotion: 0 }
                    },
                    moves: {
                        move1: null,
                        move2: null,
                        move3: null,
                        move4: null
                    },
                    stats_meta: {
                        ivs: { hp: null, atk: null, def: null, spa: null, spd: null, spe: null },
                        ev_level: 0,
                        ev_up: 0
                    },
                    notes: null
                };
                
                // 构建 VariableInsert（插入盒子）和 VariableEdit（清空 transfer_buffer）
                const variableInsertData = {
                    player: {
                        box: {
                            [newBoxKey]: boxData
                        }
                    }
                };
                
                const variableEditData = {
                    player: {
                        party: {
                            transfer_buffer: emptyTransferBuffer
                        }
                    }
                };
                
                const variableInsertJson = JSON.stringify(variableInsertData, null, 2);
                const variableEditJson = JSON.stringify(variableEditData, null, 2);
                // 验证 JSON 格式（确保有最外层的 {}）
                if (!variableEditJson.startsWith('{') || !variableEditJson.endsWith('}')) {
                    console.error('[PKM] [TRANSFER] VariableEdit JSON 格式错误:', variableEditJson);
                }
                const variableInsertBlock = `<VariableInsert>\n${variableInsertJson}\n</VariableInsert>`;
                const variableEditBlock = `<VariableEdit>\n${variableEditJson}\n</VariableEdit>`;
                
                console.log('[PKM] [TRANSFER] 生成 VariableInsert:', variableInsertBlock);
                
                // 获取最近一楼消息
                const lastMessageId = getLastMessageId();
                const messages = getChatMessages(lastMessageId);
                
                if (!messages || messages.length === 0) {
                    console.warn('[PKM] [TRANSFER] 无法获取最近消息');
                    return;
                }
                
                const msg = messages[0];
                let content = msg.message || '';
                
                // 在末尾追加 VariableInsert 和 VariableEdit
                content = content.trim() + '\n\n' + variableInsertBlock + '\n\n' + variableEditBlock;
                console.log('[PKM] [TRANSFER] 追加传输指令到消息末尾');
                
                // 更新消息
                await setChatMessages([{
                    message_id: lastMessageId,
                    message: content
                }], { refresh: 'affected' });
                
                console.log(`[PKM] [TRANSFER] ✓ 已将 ${transferBuffer.name} 传输到盒子 ${newBoxKey}`);
                
                // 立即触发 ERA 变量更新
                if (typeof eventEmit !== 'undefined') {
                    // 先插入盒子
                    eventEmit('era:updateByObject', variableInsertData);
                    // 再清空 transfer_buffer
                    eventEmit('era:updateByObject', variableEditData);
                    console.log('[PKM] [TRANSFER] ✓ ERA 变量已更新');
                }
                
                // 刷新面板
                setTimeout(() => refreshDashboard(), 100);
                
            } catch (e) {
                console.error('[PKM] [TRANSFER] 处理失败:', e);
            } finally {
                // 1秒后解锁
                setTimeout(() => { transferBufferLock = false; }, 1000);
            }
        }
        
        // ========== 监听酒馆事件 ==========
        // 防抖标志：防止 era:writeDone -> injectLocationContext -> ERA写入 -> era:writeDone 死循环
        let isProcessingEraEvent = false;
        let eraEventDebounceTimer = null;
        const ERA_EVENT_DEBOUNCE_MS = 500; // 500ms 防抖
        
        if (typeof eventOn !== 'undefined') {
            eventOn('era:writeDone', () => {
                // 如果正在处理中，跳过（防止死循环）
                if (isProcessingEraEvent) {
                    console.log('[PKM] 跳过重复的 era:writeDone 事件（防抖中）');
                    return;
                }
                
                // 清除之前的防抖定时器
                if (eraEventDebounceTimer) {
                    clearTimeout(eraEventDebounceTimer);
                }
                
                // 设置防抖定时器
                eraEventDebounceTimer = setTimeout(async () => {
                    isProcessingEraEvent = true;
                    console.log('[PKM] 检测到 ERA 变量更新，刷新面板和位置注入');
                    try {
                        refreshDashboard();
                        await injectLocationContext();
                        // 检测 transfer_buffer 并处理
                        handleTransferBuffer();
                    } finally {
                        // 延迟重置标志，确保后续的 writeDone 事件被跳过
                        setTimeout(() => {
                            isProcessingEraEvent = false;
                        }, 200);
                    }
                }, 100); // 100ms 后执行，合并快速连续的事件
            });
            
            eventOn('generation_ended', () => {
                console.log('[PKM] 检测到消息生成完成，刷新面板和位置注入');
                refreshDashboard();
                injectLocationContext(); // 刷新位置上下文注入
                // 检测 transfer_buffer 并处理
                handleTransferBuffer();
            });
            
            eventOn('chat_changed', () => {
                console.log('[PKM] 检测到对话切换，重置面板');
                iframeInitialized = false;
                injectLocationContext(); // 切换对话时也刷新位置注入
            });
            
            // ========== 监听每日刷新事件（由 pkm-tavern-plugin.js 触发）==========
            eventOn('pkm:refreshPokemonSpawns', async (detail) => {
                console.log('[PKM] [REFRESH] 收到每日刷新事件:', detail);
                try {
                    // 确保数据已加载
                    await LocationContextBackend.loadData();
                    
                    // 获取当前位置
                    const eraVars = await getEraVars();
                    const location = eraVars?.world_state?.location;
                    if (!location || typeof location.x !== 'number') {
                        console.warn('[PKM] [REFRESH] 无位置数据，跳过刷新');
                        return;
                    }
                    
                    // 更新 lastGameDay
                    const newDay = detail?.newDay || eraVars?.world_state?.time?.day;
                    lastGameDay = newDay;
                    
                    // ★ 计算并更新异变状态，同时返回计算结果（不依赖 ERA 重新获取）
                    const phenomenon = await updatePhenomenonByDay(newDay);
                    
                    // 直接使用计算出的 phenomenon 状态，注入到 eraVars 中
                    if (!eraVars.world_state) eraVars.world_state = {};
                    eraVars.world_state.phenomenon = phenomenon;
                    
                    console.log('[PKM] [SPAWN] 使用计算的异变状态:', phenomenon);
                    
                    // 生成新的宝可梦数据（强制刷新，使用本地计算的 phenomenon）
                    const newSpawns = await PokemonSpawnSystem.generateForNearbyGrids(
                        location.x, 
                        location.y, 
                        eraVars,
                        true // forceRefresh = true
                    );
                    
                    // 生成新的天气数据（强制刷新）
                    const newWeather = await WeatherSystem.generateForNearbyGrids(
                        location.x,
                        location.y,
                        eraVars,
                        true // forceRefresh = true
                    );
                    
                    // 执行刷新（删除+插入：宝可梦+天气）
                    await eraRefreshPokemonAndWeather(newSpawns, newWeather);
                    
                    console.log('[PKM] [REFRESH] ✓ 每日刷新完成');
                } catch (e) {
                    console.error('[PKM] [REFRESH] 每日刷新失败:', e);
                }
            });
            
            // ========== 异变系统刷新逻辑 ==========
            // 根据天数更新 phenomenon 状态，返回计算出的状态对象
            async function updatePhenomenonByDay(day) {
                const defaultState = { active_type: "clear", active_region: "none" };
                
                if (!day || day < 1) return defaultState;
                
                console.log('[PKM] [PHENOMENON] 检查异变状态，当前天数:', day);
                
                // Week 1 (Day 1-7): 锁定为 clear
                if (day <= 7) {
                    console.log('[PKM] [PHENOMENON] 第一周，保持 clear 状态');
                    await setPhenomenonState("clear", "none", true);
                    return defaultState;
                }
                
                // Week 2+ (Day > 7): 根据 dayOfWeek 轮换
                const dayOfWeek = ((day - 1) % 7) + 1;
                const normalizedDayOfWeek = dayOfWeek === 7 ? 0 : dayOfWeek;
                
                // 星期轮换规则
                const schedule = {
                    0: { type: "clear", region: "none" },
                    1: { type: "ancient", region: "west" },
                    2: { type: "future", region: "east" },
                    3: { type: "ultra", region: "random" },
                    4: { type: "ancient", region: "west" },
                    5: { type: "future", region: "east" },
                    6: { type: "ultra", region: "random" }
                };
                
                const todaySchedule = schedule[normalizedDayOfWeek] || { type: "clear", region: "none" };
                
                // 如果是 random 区域，随机选择一个 zone
                let activeRegion = todaySchedule.region;
                if (activeRegion === "random") {
                    const zones = ["A", "B", "N", "S", "Z"];
                    activeRegion = zones[Math.floor(Math.random() * zones.length)];
                }
                
                console.log('[PKM] [PHENOMENON] Day', day, '-> dayOfWeek', normalizedDayOfWeek, 
                    '-> type:', todaySchedule.type, 'region:', activeRegion);
                
                // 异步注入 ERA（不等待完成）
                setPhenomenonState(todaySchedule.type, activeRegion);
                
                // 立即返回计算结果供 spawn 使用
                return { active_type: todaySchedule.type, active_region: activeRegion };
            }
            
            // 设置异变状态（通过 VariableEdit 注入）
            async function setPhenomenonState(activeType, activeRegion, forceUpdate = false) {
                try {
                    // 获取当前 ERA 变量
                    const eraVars = await getEraVars();
                    const currentPhenomenon = eraVars?.world_state?.phenomenon || {};
                    
                    // 如果状态没有变化且不强制更新，跳过
                    if (!forceUpdate && 
                        currentPhenomenon.active_type === activeType && 
                        currentPhenomenon.active_region === activeRegion) {
                        console.log('[PKM] [PHENOMENON] 状态未变化，跳过更新');
                        return;
                    }
                    
                    // 如果 phenomenon 字段不存在，强制更新
                    if (!eraVars?.world_state?.phenomenon) {
                        console.log('[PKM] [PHENOMENON] phenomenon 字段不存在，强制初始化');
                        forceUpdate = true;
                    }
                    
                    // 构建 VariableEdit JSON
                    const variableEditData = {
                        world_state: {
                            phenomenon: {
                                active_type: activeType,
                                active_region: activeRegion
                            }
                        }
                    };
                    
                    const variableEditJson = JSON.stringify(variableEditData, null, 2);
                    const variableEditBlock = `<VariableEdit>\n${variableEditJson}\n</VariableEdit>`;
                    
                    console.log('[PKM] [PHENOMENON] 生成 VariableEdit:', variableEditBlock);
                    
                    // 获取最近一楼消息
                    const lastMessageId = getLastMessageId();
                    if (!lastMessageId) {
                        console.warn('[PKM] [PHENOMENON] 无法获取最近消息ID');
                        return;
                    }
                    
                    const messages = getChatMessages(lastMessageId);
                    if (!messages || messages.length === 0) {
                        console.warn('[PKM] [PHENOMENON] 无法获取消息内容');
                        return;
                    }
                    
                    const msg = messages[0];
                    let content = msg.message || '';
                    
                    // 在末尾追加 VariableEdit
                    content = content.trim() + '\n\n' + variableEditBlock;
                    
                    // 更新消息
                    await setChatMessages([{
                        message_id: lastMessageId,
                        message: content
                    }], { refresh: 'affected' });
                    
                    console.log(`[PKM] [PHENOMENON] ✓ 已注入异变状态: ${activeType} / ${activeRegion}`);
                    
                    // 立即触发 ERA 变量更新
                    if (typeof eventEmit !== 'undefined') {
                        eventEmit('era:updateByObject', variableEditData);
                        console.log('[PKM] [PHENOMENON] ✓ ERA 变量已更新');
                    }
                    
                } catch (e) {
                    console.error('[PKM] [PHENOMENON] 设置异变状态失败:', e);
                }
            }
        }
        
        // ========== 卸载清理函数（退出角色卡时调用）==========
        function unloadPkmUI() {
            console.log('[PKM] UI 脚本开始卸载');
            
            // 移除 DOM 元素
            $('#pkm-container').remove();
            $('#pkm-anim-style').remove();
            $('[id^="pkm-"]').remove();
            
            // 清理事件监听
            if (typeof eventRemoveListener !== 'undefined') {
                try {
                    eventRemoveListener('era:writeDone');
                    eventRemoveListener('generation_ended');
                    eventRemoveListener('chat_changed');
                } catch (e) {
                    // 忽略清除失败
                }
            }
            
            // 清理全局变量
            delete window.pkmDashboard;
            
            // 移除 pagehide 监听器
            window.removeEventListener('pagehide', unloadPkmUI);
            
            console.log('[PKM] UI 脚本卸载完成');
        }
        
        // 监听 pagehide 事件（退出角色卡时触发）
        window.removeEventListener('pagehide', unloadPkmUI);
        window.addEventListener('pagehide', unloadPkmUI);
        
        // ========== 监听 iframe 的 postMessage 请求 ==========
        console.log('[PKM] ✓ 注册 postMessage 监听器');
        window.addEventListener('message', function(event) {
            // 调试：打印所有 PKM 相关消息
            if (event.data && event.data.type) {
                const type = event.data.type;
                if (type.startsWith('PKM_')) {
                    console.log('[PKM] 收到 postMessage:', type, JSON.stringify(event.data).slice(0, 200));
                }
            }
            if (!event.data || !event.data.type) return;
            
            // 处理位置上下文注入请求
            if (event.data.type === 'PKM_INJECT_LOCATION') {
                const { id, content, position, depth } = event.data;
                console.log('[PKM] 收到位置上下文注入请求:', id);
                
                try {
                    // 先清除旧注入
                    if (typeof uninjectPrompts === 'function') {
                        try {
                            uninjectPrompts([id]);
                        } catch (e) {
                            // 忽略清除失败
                        }
                    }
                    
                    // 注入新内容（参考 pkm-tavern-plugin.js 的格式）
                    if (typeof injectPrompts === 'function') {
                        injectPrompts([{
                            id: id,
                            position: position || 'after_wi_scan',
                            depth: depth || 0,
                            role: 'system',
                            should_scan: false,
                            content: content
                        }]);
                        console.log('[PKM] ✓ 位置上下文已注入到世界书');
                    } else {
                        console.warn('[PKM] injectPrompts API 不可用');
                    }
                } catch (e) {
                    console.error('[PKM] 位置上下文注入失败:', e);
                }
            }
            
            // 处理清除注入请求
            if (event.data.type === 'PKM_CLEAR_INJECTION') {
                const { id } = event.data;
                console.log('[PKM] 收到清除注入请求:', id);
                
                try {
                    if (typeof uninjectPrompts === 'function') {
                        uninjectPrompts([id]);
                        console.log('[PKM] ✓ 注入已清除');
                    }
                } catch (e) {
                    console.error('[PKM] 清除注入失败:', e);
                }
            }
            
            // 处理 Leader 切换请求
            if (event.data.type === 'PKM_SET_LEADER') {
                const { targetSlot } = event.data.data || {};
                console.log('[PKM] 收到 Leader 切换请求:', targetSlot);
                handleLeaderToggle(targetSlot);
            }
            
            // 处理 Settings 更新请求
            if (event.data.type === 'PKM_UPDATE_SETTINGS') {
                const settingsData = event.data.data;
                console.log('[PKM] 收到 Settings 更新请求:', settingsData);
                handleSettingsToggle(settingsData);
            }
            
            // 处理 MAP 全屏切换请求
            if (event.data.type === 'PKM_MAP_FULLSCREEN') {
                handleMapFullscreen(event.data.fullscreen);
            }
        });
        
        // ========== MAP 全屏处理 ==========
        let isMapFullscreen = false; // 记录当前全屏状态
        
        function handleMapFullscreen(isFullscreen) {
            console.log('[PKM] 收到 MAP 全屏请求:', isFullscreen);
            isMapFullscreen = isFullscreen;
            
            const wrapper = $('#pkm-content-wrapper');
            const iframeEl = $('#pkm-iframe');
            const overlay = $('#pkm-overlay');
            
            if (isFullscreen) {
                // 全屏模式：移除尺寸限制，让 MAP 占满整个屏幕
                wrapper.css({
                    'max-width': '100vw',
                    'max-height': '100vh',
                    'width': '100vw',
                    'height': '100vh'
                });
                iframeEl.css({
                    'border-radius': '0'
                });
                overlay.css({
                    'padding': '0',
                    'height': '100vh'
                });
                console.log('[PKM] ✓ 已切换到全屏模式');
            } else {
                // 恢复正常模式
                wrapper.css({
                    'max-width': '485px',
                    'max-height': '850px',
                    'width': '100%',
                    'height': '95vh'
                });
                iframeEl.css({
                    'border-radius': '24px'
                });
                overlay.css({
                    'padding': '1px',
                    'height': '97.5vh'
                });
                console.log('[PKM] ✓ 已退出全屏模式');
            }
            
            // 通知 PKM iframe 内部调整大小
            const pkmIframe = document.getElementById('pkm-iframe');
            if (pkmIframe && pkmIframe.contentWindow) {
                setTimeout(() => {
                    pkmIframe.contentWindow.postMessage({ type: 'MAP_RESIZE' }, '*');
                }, 150);
            }
        }
        
        // 退出全屏（供外部调用）
        function exitMapFullscreen() {
            if (isMapFullscreen) {
                handleMapFullscreen(false);
                // 通知 PKM iframe 内部也退出全屏
                const pkmIframe = document.getElementById('pkm-iframe');
                if (pkmIframe && pkmIframe.contentWindow) {
                    pkmIframe.contentWindow.postMessage({ type: 'PKM_EXIT_MAP_FULLSCREEN' }, '*');
                }
            }
        }
        
        // ========== Leader 切换处理 ==========
        let leaderToggleLock = false;
        
        async function handleLeaderToggle(targetSlot) {
            if (leaderToggleLock) {
                console.log('[PKM] [LEADER] 正在处理中，忽略重复请求');
                return;
            }
            leaderToggleLock = true;
            
            try {
                console.log(`[PKM] [LEADER] 收到切换请求: ${targetSlot}`);
                
                // 1. 获取当前队伍数据
                const eraVars = await getEraVars();
                const party = eraVars?.player?.party || {};
                
                if (!party || Object.keys(party).length === 0) {
                    console.warn('[PKM] [LEADER] 队伍为空，无法切换');
                    return;
                }
                
                // 2. 构建 VariableEdit JSON：一个 true，其余 false
                const variableEditData = {
                    player: {
                        party: {}
                    }
                };
                
                // 遍历所有槽位，设置 isLead
                for (let i = 1; i <= 6; i++) {
                    const slotKey = `slot${i}`;
                    const pokemon = party[slotKey];
                    
                    // 只有非空槽位才设置 isLead
                    if (pokemon && pokemon.name) {
                        variableEditData.player.party[slotKey] = {
                            isLead: slotKey === targetSlot
                        };
                    }
                }
                
                const variableEditJson = JSON.stringify(variableEditData, null, 2);
                // 验证 JSON 格式（确保有最外层的 {}）
                if (!variableEditJson.startsWith('{') || !variableEditJson.endsWith('}')) {
                    console.error('[PKM] [LEADER] VariableEdit JSON 格式错误:', variableEditJson);
                }
                const variableEditBlock = `<VariableEdit>\n${variableEditJson}\n</VariableEdit>`;
                
                console.log('[PKM] [LEADER] 生成 VariableEdit:', variableEditBlock);
                
                // 3. 获取最近一楼消息
                const lastMessageId = getLastMessageId();
                const messages = getChatMessages(lastMessageId);
                
                if (!messages || messages.length === 0) {
                    console.warn('[PKM] [LEADER] 无法获取最近消息');
                    return;
                }
                
                const msg = messages[0];
                let content = msg.message || '';
                
                // 4. 直接在末尾追加新的 VariableEdit（不删除现有标签）
                content = content.trim() + '\n\n' + variableEditBlock;
                console.log('[PKM] [LEADER] 追加新 VariableEdit 到末尾');
                
                // 5. 更新消息
                await setChatMessages([{
                    message_id: lastMessageId,
                    message: content
                }], { refresh: 'affected' });
                
                console.log(`[PKM] [LEADER] ✓ 已注入 Leader 切换到消息 #${lastMessageId}`);
                
                // 6. 立即触发 ERA 变量更新（让前端立即刷新）
                if (typeof eventEmit !== 'undefined') {
                    eventEmit('era:updateByObject', variableEditData);
                    console.log('[PKM] [LEADER] ✓ ERA 变量已更新');
                }
                
                // 7. 刷新面板（延迟执行，避免和锁冲突）
                setTimeout(() => refreshDashboard(), 100);
                
            } catch (e) {
                console.error('[PKM] [LEADER] 切换失败:', e);
            } finally {
                // 1秒后解锁，防止快速连续点击
                setTimeout(() => { leaderToggleLock = false; }, 1000);
            }
        }
        
        // ========== Settings 切换处理 ==========
        let settingsToggleLock = false;
        
        async function handleSettingsToggle(settingsData) {
            if (settingsToggleLock) {
                console.log('[PKM] [SETTINGS] 正在处理中，忽略重复请求');
                return;
            }
            settingsToggleLock = true;
            
            try {
                console.log('[PKM] [SETTINGS] 收到设置更新:', settingsData);
                
                // 1. 构建 VariableEdit JSON
                const variableEditData = {
                    settings: settingsData
                };
                
                const variableEditJson = JSON.stringify(variableEditData, null, 2);
                const variableEditBlock = `<VariableEdit>\n${variableEditJson}\n</VariableEdit>`;
                
                console.log('[PKM] [SETTINGS] 生成 VariableEdit:', variableEditBlock);
                
                // 2. 获取最近一楼消息
                const lastMessageId = getLastMessageId();
                const messages = getChatMessages(lastMessageId);
                
                if (!messages || messages.length === 0) {
                    console.warn('[PKM] [SETTINGS] 无法获取最近消息');
                    return;
                }
                
                const msg = messages[0];
                let content = msg.message || '';
                
                // 3. 直接在末尾追加新的 VariableEdit
                content = content.trim() + '\n\n' + variableEditBlock;
                console.log('[PKM] [SETTINGS] 追加新 VariableEdit 到末尾');
                
                // 4. 更新消息
                await setChatMessages([{
                    message_id: lastMessageId,
                    message: content
                }], { refresh: 'affected' });
                
                console.log(`[PKM] [SETTINGS] ✓ 已注入 Settings 到消息 #${lastMessageId}`);
                
                // 5. 立即触发 ERA 变量更新
                if (typeof eventEmit !== 'undefined') {
                    eventEmit('era:updateByObject', variableEditData);
                    console.log('[PKM] [SETTINGS] ✓ ERA 变量已更新');
                }
                
            } catch (e) {
                console.error('[PKM] [SETTINGS] 更新失败:', e);
            } finally {
                setTimeout(() => { settingsToggleLock = false; }, 500);
            }
        }
        
        // ========== 暴露全局函数到酒馆主窗口 ==========
        // 方案1: 使用酒馆助手的 initializeGlobal API
        if (typeof initializeGlobal === 'function') {
            initializeGlobal('pkmSetLeader', handleLeaderToggle);
            initializeGlobal('pkmUpdateSettings', handleSettingsToggle);
            console.log('[PKM] ✓ 已通过 initializeGlobal 暴露函数');
        }
        
        // 方案2: 直接在酒馆主窗口设置全局函数（同源情况下有效）
        try {
            const topWin = window.top || window.parent;
            if (topWin && topWin !== window) {
                topWin.pkmSetLeader = handleLeaderToggle;
                topWin.pkmUpdateSettings = handleSettingsToggle;
                console.log('[PKM] ✓ 已在酒馆主窗口设置 pkmSetLeader 和 pkmUpdateSettings');
                
                // 在酒馆主窗口注册 postMessage 监听器
                topWin.addEventListener('message', function(event) {
                    if (!event.data || !event.data.type) return;
                    
                    if (event.data.type === 'PKM_SET_LEADER') {
                        const { targetSlot } = event.data.data || {};
                        console.log('[PKM] 收到 Leader 切换请求 (top listener):', targetSlot);
                        handleLeaderToggle(targetSlot);
                    }
                    
                    if (event.data.type === 'PKM_UPDATE_SETTINGS') {
                        const settingsData = event.data.data;
                        console.log('[PKM] 收到 Settings 更新请求 (top listener):', settingsData);
                        handleSettingsToggle(settingsData);
                    }
                    
                    if (event.data.type === 'PKM_MAP_FULLSCREEN') {
                        const isFullscreen = event.data.fullscreen;
                        console.log('[PKM] 收到 MAP 全屏请求 (top listener):', isFullscreen);
                        handleMapFullscreen(isFullscreen);
                    }
                });
                console.log('[PKM] ✓ 已在酒馆主窗口注册 postMessage 监听器');
            }
        } catch (e) {
            console.warn('[PKM] 无法访问酒馆主窗口:', e.message);
        }
        
        // 方案3: 本地 window 也设置（作为降级）
        window.pkmSetLeader = handleLeaderToggle;
        window.pkmUpdateSettings = handleSettingsToggle;
        
        console.log('[PKM] ✓ 悬浮球已加载，点击打开 PKM 面板');
    });
})();
