/**
 * Project Rhodia Engine (Final Fix)
 * - 2.5D Isometric Rendering
 * - Zone Border Fusion (No internal grids)
 * - Accurate Roof-top Hit Detection
 */

// --- 配置区域 ---
const BG_COLOR = "#F4F7F6";

// --- 坐标系统配置 ---
// 地图中心点 (原坐标系统中的位置)
const MAP_CENTER_X = 26;
const MAP_CENTER_Y = 26;

// 坐标转换函数：内部坐标 -> 显示坐标 (跳过0，使用-1和+1)
// 注意：Y轴需要-1来反转方向（屏幕下=地理南）
function toDisplayCoords(internalX, internalY) {
    // X轴：简单减法，然后跳过0
    let x = internalX - MAP_CENTER_X;
    if (x >= 0) x += 1;
    
    // Y轴：26 - internalY - 1，然后跳过0
    let y = MAP_CENTER_Y - internalY - 1;
    if (y >= 0) y += 1;
    
    return { x, y };
}

// 坐标转换函数：显示坐标 -> 内部坐标
function toInternalCoords(displayX, displayY) {
    // X轴反向：跳过0的逆运算
    let x = displayX;
    if (x > 0) x -= 1;
    let internalX = x + MAP_CENTER_X;
    
    // Y轴反向：跳过0的逆运算
    // toDisplayCoords: y = 26 - internalY - 1; if (y >= 0) y += 1
    // 逆运算: 先还原跳过0，再反推 internalY = 26 - y - 1
    let y = displayY;
    if (y > 0) y -= 1;
    let internalY = MAP_CENTER_Y - y - 1;
    
    return { gx: internalX, gy: internalY };
}

// 获取象限名称
// 标准地理坐标：北(+Y)上，东(+X)右
function getQuadrantName(displayX, displayY) {
    // Z区（中枢区）：中心 6x6 范围
    if (Math.abs(displayX) <= 6 && Math.abs(displayY) <= 6) return "Z";
    if (displayX > 0 && displayY > 0) return "S"; // 东北 NE 第一象限
    if (displayX < 0 && displayY > 0) return "A"; // 西北 NW 第二象限
    if (displayX < 0 && displayY < 0) return "B"; // 西南 SW 第三象限
    if (displayX > 0 && displayY < 0) return "N"; // 东南 SE 第四象限
    return "Z"; // 默认返回 Z
}

// 格式化坐标显示
function formatCoords(internalX, internalY) {
    const display = toDisplayCoords(internalX, internalY);
    const quadrant = getQuadrantName(display.x, display.y);
    return `[${display.x}, ${display.y}] ${quadrant}`;
}

// --- 全局状态 ---
let mapRawData = null;
let levelData = null;
window.levelData = null;
const GRID_SIZE = 16;
let camera = { x: 0, y: 0, zoom: 1.0 };
let isDragging = false;
let lastMouse = { x: 0, y: 0 };

// --- 玩家/小队状态 ---
// 默认位置 [1,1] NE 对应内部坐标 gx:26, gy:27
let playerState = {
    gx: 26,
    gy: 27,
    color: "#e74c3c",
    moving: false
};
window.playerState = playerState; // 暴露给其他模块

// --- 坐标接口暴露 (供 app.js / ERA 系统使用) ---
// 回调函数：当玩家位置变化时触发
window.onPlayerLocationChange = null;

/**
 * 获取当前玩家的四象限显示坐标
 * @returns {{ x: number, y: number, quadrant: string }}
 */
window.getPlayerDisplayCoords = function() {
    const display = toDisplayCoords(playerState.gx, playerState.gy);
    return {
        x: display.x,
        y: display.y,
        quadrant: getQuadrantName(display.x, display.y)
    };
};

/**
 * 通知外部系统玩家位置已变更
 */
function notifyLocationChange() {
    if (typeof window.onPlayerLocationChange === 'function') {
        const coords = window.getPlayerDisplayCoords();
        window.onPlayerLocationChange(coords);
    }
}

/**
 * 从外部设置玩家位置（用于从 ERA 变量初始化）
 * @param {{ x: number, y: number, quadrant?: string }} displayCoords - 显示坐标
 */
window.setPlayerPosition = function(displayCoords) {
    if (!displayCoords || typeof displayCoords.x !== 'number' || typeof displayCoords.y !== 'number') {
        console.warn('[MAP] setPlayerPosition: 无效坐标', displayCoords);
        return;
    }
    const internal = toInternalCoords(displayCoords.x, displayCoords.y);
    playerState.gx = internal.gx;
    playerState.gy = internal.gy;
    console.log('[MAP] 设置玩家位置:', displayCoords, '-> 内部坐标:', internal);
    updatePlayerCoordsUI();
    // 同步更新 RouteSystem 起点
    if (window.RouteSystem) {
        RouteSystem.setOrigin(internal.gx, internal.gy);
    }
    // 只有在地图数据加载完成后才居中相机
    if (levelData && levelData.pxWid) {
        centerCamera();
    }
};

// 地图加载完成后的回调（供外部使用）
window.onMapReady = null;

// ========== 接收酒馆 ERA 数据（宝可梦刷新等）==========
// 防抖定时器，避免频繁刷新导致卡顿
let eraRefreshDebounceTimer = null;

// ========== 异变系统状态 ==========
window.phenomenonState = {
    active_type: "clear",
    active_region: "none"
};

window.addEventListener('message', function(event) {
    // 处理全屏切换时的 resize 消息
    if (event.data && event.data.type === 'MAP_RESIZE') {
        console.log('[MAP] 收到 resize 消息，重新调整画布大小');
        resizeCanvas();
        return;
    }
    
    // 处理 PKM_ERA_DATA（初始化）和 PKM_REFRESH（刷新）
    if (event.data && (event.data.type === 'PKM_ERA_DATA' || event.data.type === 'PKM_REFRESH')) {
        const eraData = event.data.data;
        const isRefresh = event.data.type === 'PKM_REFRESH';
        
        console.log('[MAP] 收到 ERA 数据:', event.data.type, eraData);
        
        // 更新宝可梦缓存（从 ERA 读取）- 这个可以立即执行
        if (window.PokemonSpawnCache && eraData?.world_state?.pokemon_spawns) {
            window.PokemonSpawnCache.updateFromEra(eraData);
        }
        
        // 更新天气数据（从 ERA 读取）
        if (eraData?.world_state?.weather_grid) {
            window.weatherGridData = eraData.world_state.weather_grid;
            console.log('[MAP] 天气数据已更新:', Object.keys(window.weatherGridData).length, '个格子');
        }
        
        // 更新异变状态
        if (eraData?.world_state?.phenomenon) {
            updatePhenomenonState(eraData.world_state.phenomenon);
        }
        
        // 对于刷新消息，使用防抖避免频繁更新位置和渲染
        if (isRefresh) {
            if (eraRefreshDebounceTimer) {
                clearTimeout(eraRefreshDebounceTimer);
            }
            eraRefreshDebounceTimer = setTimeout(() => {
                updatePlayerFromEra(eraData);
                eraRefreshDebounceTimer = null;
            }, 200); // 200ms 防抖
        } else {
            // 初始化消息立即执行
            updatePlayerFromEra(eraData);
        }
    }
});

// 更新异变状态
function updatePhenomenonState(phenomenon) {
    const oldType = window.phenomenonState.active_type;
    const oldRegion = window.phenomenonState.active_region;
    
    window.phenomenonState.active_type = phenomenon.active_type || "clear";
    window.phenomenonState.active_region = phenomenon.active_region || "none";
    
    if (oldType !== window.phenomenonState.active_type || oldRegion !== window.phenomenonState.active_region) {
        console.log('[MAP] 异变状态更新:', window.phenomenonState);
        // 触发地图重绘以更新实体显示
        if (window.TacticalSystem && window.TacticalSystem.isActive) {
            // TacticalSystem 会在下一帧自动重绘
        }
    }
}

// 检查实体是否应该显示（基于当前异变状态）
window.shouldShowPhenomenonEntity = function(entityType, entityValue) {
    const state = window.phenomenonState;
    
    // 如果是 clear 状态，不显示任何异变实体
    if (state.active_type === "clear") {
        return false;
    }
    
    // Ultra_Wormhole 实体
    if (entityType === "Ultra_Wormhole") {
        // 只在 ultra 异变时显示
        if (state.active_type !== "ultra") return false;
        
        // 检查区域匹配
        const ubConfig = window.ULTRA_BEAST_MAP?.[entityValue];
        if (!ubConfig) return false;
        
        // random 区域时随机选择一个 zone 显示
        if (state.active_region === "random") {
            // 所有 UB 都显示（或根据具体逻辑过滤）
            return true;
        }
        
        return true;
    }
    
    // Paradox_Anchors 实体
    if (entityType === "Paradox_Anchors") {
        // Pool 类型（范围刷新）
        if (entityValue.startsWith("Pool_")) {
            const poolConfig = window.PARADOX_SPAWN_POOLS?.[entityValue];
            if (!poolConfig) return false;
            
            // 检查类型匹配
            if (poolConfig.type !== state.active_type) return false;
            
            // 检查区域匹配
            const regionZones = window.PHENOMENON_CONFIG?.regionZones;
            if (state.active_region && regionZones) {
                // 这里需要根据实体坐标判断所在区域
                // 暂时简化：ancient 显示所有古代池，future 显示所有未来池
                return true;
            }
            
            return true;
        }
        
        // Elite/Boss 类型（单点 Boss）
        if (entityValue.startsWith("Elite_") || entityValue.startsWith("Boss_")) {
            const bossConfig = window.STATIC_BOSS_MAP?.[entityValue];
            if (!bossConfig) return false;
            
            // 检查类型匹配
            if (bossConfig.type !== state.active_type) return false;
            
            return true;
        }
    }
    
    return false;
};

// 从 ERA 数据更新玩家位置
function updatePlayerFromEra(eraData) {
    if (eraData?.world_state?.location) {
        const loc = eraData.world_state.location;
        if (typeof loc.x === 'number' && typeof loc.y === 'number') {
            window.setPlayerPosition({ x: loc.x, y: loc.y });
            
            // 同步更新 TacticalSystem 的 playerGrid（不调用 render，让现有循环处理）
            if (window.TacticalSystem && window.TacticalSystem.isActive) {
                const internal = toInternalCoords(loc.x, loc.y);
                window.TacticalSystem.playerGrid = { x: internal.gx, y: internal.gy };
                window.TacticalSystem.anchor = { x: internal.gx, y: internal.gy };
                // 不再调用 render()，因为渲染循环已经在运行
                console.log('[MAP] TacticalSystem 位置已同步:', internal);
            }
        }
    }
}

// 缓存与状态 - 延迟初始化以确保 DOM 准备好
let canvas, ctx, tooltip, toggleContainer, playerControls, playerCoordsEl;

function initDOMElements() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('[MAP] Canvas element not found!');
        return false;
    }
    ctx = canvas.getContext('2d');
    tooltip = document.getElementById('tooltip');
    toggleContainer = document.getElementById('layer-toggles');
    playerControls = document.getElementById('player-controls');
    playerCoordsEl = document.getElementById('ui-coords');
    if(playerControls) playerControls.style.display = 'none';
    updatePlayerCoordsUI();
    return true;
}

let layerVisibility = {};
let intGridInfoMap = {};
window.intGridInfoMap = {};
let groupCache = {}; // 存储区域分组 Entity 的集合
window.groupCache = {};

/* 哪些东西算作“区域”需要合并渲染？ */
const MERGE_REGEX = /^(Region|Biome|Zone|Plaza)/i; 

function getIntVal(gx, gy, layerIdentifier) {
    if(!levelData) return 0;
    const layer = levelData.layerInstances.find(l => l.__identifier === layerIdentifier);
    if(!layer || !layer.intGridCsv) return 0;
    if(gx < 0 || gy < 0 || gx >= layer.__cWid || gy >= layer.__cHei) return 0;
    return layer.intGridCsv[gx + gy * layer.__cWid] || 0;
}

function getEntZoneName(layerIdentifier, gx, gy) {
    if(!groupCache || !groupCache[layerIdentifier]) return null;
    const worldX = gx * GRID_SIZE;
    const worldY = gy * GRID_SIZE;
    const groups = groupCache[layerIdentifier];
    for(const key in groups) {
        const list = groups[key];
        for(const item of list) {
            const r = item.rect;
            if(worldX >= r.x && worldX < r.x + r.w && worldY >= r.y && worldY < r.y + r.h) {
                return key;
            }
        }
    }
    return null;
}

const formatZoneLabel = (typeof window !== 'undefined' && typeof window.formatZoneName === 'function')
    ? window.formatZoneName
    : (name => name ? name.replace(/_/g, ' ') : null);

/* 
 * PROJECT RHODIA - SURFACE & TERRAIN DEFINITIONS
 * Last Updated: Re-Standardization Phase
 */
const TERRAIN_CONFIG = {
    // === 海洋与水体 (Aquatic) ===
    1:  { type: 'Deep_Sea',       el: 0, fill: "#00376ea5", stroke: "transparent" }, // 深海 (Gen 3 Dive区域)
    6:  { type: 'Shallow_Sea',    el: 1, fill: "#778FA8",   stroke: "transparent" }, // 浅海/冲浪区
    7:  { type: 'Fresh_Water',    el: 1, fill: "#587C97",   stroke: "transparent" }, // 淡水/河流/湖泊
    24: { type: 'Glacial_Water',  el: 1, fill: "#83c6d6ff", stroke: "transparent" }, // 极地冰水
    9:  { type: 'Sewage',         el: 1, fill: "#7D707E",   stroke: "transparent" }, // 改名为: 城市排污/毒沼
    20: { type: 'Swamp',          el: 2, fill: "#607D6C",   stroke: "transparent" }, // 沼泽/红树林

    // === 基础植被 (Vegetation) ===
    10: { type: 'Standard_Grass', el: 3, fill: "#9CB58C",   stroke: "transparent" }, // 普通草丛
    2:  { type: 'High_Grass',     el: 4, fill: "#7D9C74",   stroke: "transparent" }, // 长草丛 (不可骑行/高遇敌)
    16: { type: 'Light_Forest',   el: 4, fill: "#5D7F66",   stroke: "transparent" }, // 疏林/树下
    13: { type: 'Deep_Jungle',    el: 3, fill: "#6A8E7F",   stroke: "transparent" }, // 原名: ALGAE -> 现明确为深层丛林
    12: { type: 'Flower_Field',   el: 3, fill: "#E6B0AA",   stroke: "transparent" }, // 花田 (Fairy系高发)
    22: { type: 'Withered_Grass', el: 3, fill: "#EAECEF",   stroke: "transparent" }, // 原名: ASH -> 枯草/白灰草

    // === 土壤与沙地 (Soils) ===
    15: { type: 'Coastal_Sand',   el: 2, fill: "#E3CAA5",   stroke: "transparent" }, // 海岸湿沙
    25: { type: 'Desert_Sand',    el: 3, fill: "#DAB78D",   stroke: "transparent" }, // 内陆沙漠
    14: { type: 'Wet_Soil',       el: 2, fill: "#8C8681",   stroke: "transparent" }, // 湿润泥土/雨后
    27: { type: 'Scorched_Earth', el: 3, fill: "#4A5060",   stroke: "transparent" }, // 原名: CURSED -> 焦土
    3:  { type: 'Waste',          el: 3, fill: "#B7B19E",   stroke: "transparent" }, // 垃圾堆/废土

    // === 城市与人工 (Artificial) ===
    4:  { type: 'Pavement',       el: 4, fill: "#B4BCC4",   stroke: "transparent" }, // 铺装路面
    21: { type: 'Slum_Pavement',  el: 3, fill: "#95A5A6",   stroke: "transparent" }, // 贫民窟/旧路
    19: { type: 'Synthetic_Turf', el: 3, fill: "#B5C1A3",   stroke: "transparent" }, // 合成草坪 (Z区专用)
    17: { type: 'Industrial',     el: 4, fill: "#545E68",   stroke: "transparent" }, // 工业金属板
    18: { type: 'High_Voltage',   el: 4, fill: "#D4BC6A",   stroke: "transparent" }, // 发电厂/高压区
    29: { type: 'Ancient_Timber', el: 3, fill: "#8B5A2B",   stroke: "transparent" }, // 木质结构/栈道

    // === 极端环境 (Extreme) ===
    26: { type: 'Rocky_Mountain', el: 5, fill: "#6C6D75",   stroke: "#4C4D53" },     // 矿山/裸岩
    28: { type: 'Magma',          el: 1, fill: "#C0392B",   stroke: "#962D22" },     // 熔岩
    23: { type: 'Snowfield',      el: 2, fill: "#FFFFFF",   stroke: "transparent" }, // 雪原

    // === 障碍物 (Obstacles) ===
    5:  { type: 'Wall_Block',     el: 6, fill: "#0254a7ff", stroke: "#1A252F" }      // 墙壁/不可通行区域 (Logic Block)，不刷怪
};

const DEFAULT_TERRAIN = { type: 'LAND', el: 3, fill: "#F2F4F4", stroke: "#D0D3D4" };
window.TERRAIN_CONFIG = TERRAIN_CONFIG;

function getElevation(id) {
    const conf = TERRAIN_CONFIG[id];
    if(conf) return conf.el;
    return 3;

}

const PALETTE = {
    bg: "#F4F7F6",
    grid: "rgba(44, 62, 80, 0.05)",
    ui_active: "#3498DB"
};

let geometryLayers = [];
let isGlobalRenderPaused = false;

// --- 资源 URL ---（默认使用本地 data 目录，相对路径可被外部覆盖）
const MAPDATA_URL = window.MAPDATA_URL || './data/mapdata.json';
const MAPINFO_URL = window.MAPINFO_URL || './data/mapinfo.json';

// --- 系统入口 ---
async function loadMapData() {
    // 初始化 DOM 元素
    if (!initDOMElements()) {
        console.error('[MAP] DOM 初始化失败，无法加载地图');
        return;
    }
    // 自动适配初始界面大小
    resizeCanvas();
    try {
        console.log('[MAP] 加载地图数据:', MAPDATA_URL);
        const res = await fetch(MAPDATA_URL);
        if(!res.ok) throw new Error("File error");
        mapRawData = await res.json();
        
        // 加载mapinfo.json用于位置上下文
        try {
            let mapInfoData = null;
            
            // 优先使用内嵌数据（打包模式）
            if (window.MAPINFO_DATA) {
                console.log('[MAP] 使用内嵌 mapinfo 数据');
                mapInfoData = window.MAPINFO_DATA;
            } else {
                // 本地开发模式：从文件加载
                const mapInfoRes = await fetch(MAPINFO_URL);
                if (mapInfoRes.ok) {
                    mapInfoData = await mapInfoRes.json();
                }
            }
            
            if (mapInfoData) {
                // 保存到全局以供其他模块使用
                window.mapInfoData = mapInfoData;
                
                if (window.LocationContextGenerator) {
                    window.LocationContextGenerator.init(mapInfoData);
                    console.log('[LocationContext] Initialized with mapinfo data');
                }
            }
        } catch(e) {
            console.warn('[LocationContext] Failed to load mapinfo.json:', e);
        }
        
        setupGame();
    } catch(e) {
        console.error(e);
        drawStatusText("Error Loading Map Found [F12]");
    }
}

function setupGame() {
    if(!mapRawData.defs) return;

    // 重置几何图层缓存，确保数据修改后能重新处理
    geometryLayers = [];

    // 1. 解析 IntGrid (色块定义)
    mapRawData.defs.layers.forEach(def => {
        if(def.type==="IntGrid" && def.intGridValues) {
            intGridInfoMap[def.uid] = {};
            def.intGridValues.forEach(v => {
                intGridInfoMap[def.uid][v.value] = { color: v.color, id: v.identifier };
            });
        }
    });
    window.intGridInfoMap = intGridInfoMap;

    // 2. 准备 Level 0 数据
    levelData = mapRawData.levels[0];
    window.levelData = levelData;
    
    // 3. 将离散的 Entity 按照 LogicID 组装成 Group，方便一起渲染
    groupEntityLogic(levelData);
    window.groupCache = groupCache;

    // 4. 重置 Camera
    centerCamera();

    // 5. Build UI & Events
    buildLayerControls();
    bindEvents();
    if(playerControls) playerControls.style.display = 'flex';

    // 6. Loop
    requestAnimationFrame(renderLoop);
    
    // 7. 触发地图加载完成回调
    console.log('[MAP] ✓ 地图加载完成');
    if (typeof window.onMapReady === 'function') {
        window.onMapReady();
    }
}

/**
 * 核心算法 A：实体归组 (为了合并同一区域的碎片)
 */
function groupEntityLogic(lvl) {
    groupCache = {}; // Clear name cache
    
    // 直接在原始数据对象上挂载 "_groupID" 
    lvl.layerInstances.forEach((layer) => {
        if(layer.__type !== "Entities") return;
        
        // 只对需要合并渲染的区域图层设置 _groupIdRef
        const isZoneLayer = MERGE_REGEX.test(layer.__identifier);
        
        let groups = {}; // key: ZoneName -> List<Rect>

        layer.entityInstances.forEach(ent => {
            let key = getEntityName(ent);
            if(!groups[key]) groups[key] = [];
            
            // 计算渲染绝对坐标 (Canvas World Space)
            // PX = pivot offsets. TopL = cx - w*pivX
            const rx = layer.pxOffsetX + ent.px[0] - (ent.width * ent.__pivot[0]);
            const ry = layer.pxOffsetY + ent.px[1] - (ent.height * ent.__pivot[1]);
            
            // 存入分组
            const groupData = { 
                id: key, ent: ent, 
                rect: {x:rx, y:ry, w:ent.width, h:ent.height} 
            };
            groups[key].push(groupData);
            
            // 只给区域图层的实体设置反向引用，避免普通实体被跳过渲染
            if(isZoneLayer) {
                ent._groupIdRef = groups[key];
            }
        });
        
        // 保存层的分组表
        groupCache[layer.__identifier] = groups;
    });
}

/**
 * =======================================
 * VISUAL SYSTEMS v3.0 (Structured Layers)
 * =======================================
 */
function renderLoop() {
    if(isGlobalRenderPaused) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(!levelData) return;

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, levelData.pxWid, levelData.pxHei);
    drawGlobalGrid();

    const surfaceLayer = levelData.layerInstances.find(l => l.__identifier === "Surface");
    if(surfaceLayer && geometryLayers.length === 0) {
        preProcessTerrain(surfaceLayer);
        preProcessObstacles();
    }

    if(layerVisibility["Surface"] !== false) {
        geometryLayers.forEach(geo => drawGeoPlate(geo));
    }

    // 渲染其他 IntGrid 图层（使用 mapdata.json 中定义的颜色）
    drawIntGridLayer("Regions", 0.25);
    drawIntGridLayer("Traversability", 0.2);
    drawIntGridLayer("Threat", 0.35);
    drawIntGridLayer("Underground_Access", 0.25);
    drawIntGridLayer("Obstacles", 0.4);

    drawInfrastructure();

    if(window.RouteSystem) window.RouteSystem.drawGridOverlay(ctx);

    const entLayers = levelData.layerInstances.filter(l => l.__type === "Entities" && !MERGE_REGEX.test(l.__identifier));
    entLayers.forEach(layer => {
        if(layerVisibility[layer.__identifier] === false) return;
        layer.entityInstances.forEach(ent => {
            ent._layerName = layer.__identifier; // 添加图层名称供渲染使用
            drawModernPin(ent);
        });
    });
    
    // 渲染区域图层 (Biome_Zone, Region_Zone)
    drawZoneLayers();
    drawPlayerPawn();

    if(hoveredTarget) drawFocusBox();

    ctx.restore();
    requestAnimationFrame(renderLoop);
}

function preProcessTerrain(layer) {
    geometryLayers = [];
    const grouped = {};
    const w = layer.__cWid;
    const offsetX = layer.pxOffsetX;
    const offsetY = layer.pxOffsetY;
    const cellSize = layer.__gridSize || 16;

    layer.intGridCsv.forEach((val, idx) => {
        if(val === 0) return;
        if(!grouped[val]) grouped[val] = [];
        grouped[val].push({
            x: (idx % w) * cellSize + offsetX,
            y: Math.floor(idx / w) * cellSize + offsetY
        });
    });

    Object.keys(grouped).forEach(key => {
        const id = parseInt(key, 10);
        const config = TERRAIN_CONFIG[id] || DEFAULT_TERRAIN;
        geometryLayers.push({
            id,
            type: config.type,
            elevation: config.el,
            color: config.fill,
            stroke: config.stroke || config.fill,
            cells: grouped[key]
        });
    });

    geometryLayers.sort((a, b) => {
        if (a.elevation !== b.elevation) {
            return a.elevation - b.elevation;
        }
        const cityTypes = ['Pavement','Industrial','High_Voltage','Slum_Pavement'];
        const isCityA = cityTypes.includes(a.type);
        const isCityB = cityTypes.includes(b.type);
        if (isCityA && !isCityB) return 1;
        if (!isCityA && isCityB) return -1;
        return a.id - b.id;
    });
}

function preProcessObstacles() {
    const obsLayer = levelData.layerInstances.find(l => l.__identifier === "Obstacles");
    if(!obsLayer) return;

    const cells = [];
    const w = obsLayer.__cWid;
    const cellSize = obsLayer.__gridSize || 16;
    const offsetX = obsLayer.pxOffsetX;
    const offsetY = obsLayer.pxOffsetY;

    obsLayer.intGridCsv.forEach((val, idx) => {
        if(val === 1) {
            cells.push({
                x: (idx % w) * cellSize + offsetX,
                y: Math.floor(idx / w) * cellSize + offsetY
            });
        }
    });

    if(cells.length > 0) {
        geometryLayers.push({
            id: 999,
            type: 'Wall_Block',
            elevation: 6,
            color: "#2C3E50",
            stroke: "#17202A",
            cells
        });
        geometryLayers.sort((a,b) => a.elevation - b.elevation);
    }
}

function drawGeoPlate(geo) {
    if (geo.type === 'Wall_Block') return; 

    if (['Industrial', 'High_Voltage', 'Slum_Pavement', 'Pavement', 'Ancient_Timber'].includes(geo.type)) {
        ctx.fillStyle = geo.color;
        ctx.beginPath();
        geo.cells.forEach(c => ctx.rect(c.x, c.y, 17, 17));
        ctx.fill();
        drawCityBlocks(geo);
        return;
    }

    const el = geo.elevation || 0;
    if (el > 0) {
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = el * 1.5;
        ctx.shadowOffsetX = 0;
        ctx.shadowColor = "rgba(10, 20, 30, 0.15)";
    } else {
        ctx.shadowColor = "transparent";
    }

    ctx.fillStyle = geo.color;
    ctx.strokeStyle = "transparent";

    ctx.beginPath();
    geo.cells.forEach(c => {
        ctx.rect(Math.floor(c.x), Math.floor(c.y), 17, 17);
    });
    ctx.fill();

    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    drawLayerDetails(geo); 
}

function drawCityBlocks(geo) {
    const sideColor = adjustColorBrightness(geo.color, -15); 

    geo.cells.forEach(c => {
        const cx = Math.floor(c.x);
        const cy = Math.floor(c.y);
        const seed = Math.abs(Math.sin(c.x * 12.9898 + c.y * 78.233 + (geo.id * 13))); 

        let blockSize = 10 + (seed * 3);
        let height = 0;

        if (geo.type === 'Ancient_Timber') {
            height = 2 + (seed * 3);
            blockSize = 12 + (seed * 2);
        } else if (geo.type === 'Scorched_Earth') {
            height = 8 + (seed * 8);
        } else if (geo.type === 'Rocky_Mountain') {
            height = 5 + (seed * 5);
        } else if (geo.type === 'Pavement') {
            blockSize = 12 + (seed * 3.5);
            height = 4 + (seed * 6);
        } else if (geo.type === 'Industrial' || geo.type === 'High_Voltage') {
            height = 2 + (seed * 4);
        } else {
            height = seed * 3;
        }

        const margin = (16 - blockSize) / 2; 

        if (height > 1) {
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            ctx.fillRect(cx + margin + 1, cy + margin + 1, blockSize, blockSize);
        }

        if (height > 0) {
            ctx.fillStyle = sideColor;
            const sideHeight = height > 2 ? height : blockSize;
            ctx.fillRect(cx + margin, cy + margin - height + (height>2?blockSize:2), blockSize, sideHeight);
        }

        ctx.fillStyle = geo.color;
        const roofY = cy + margin - height; 
        ctx.fillRect(cx + margin, roofY, blockSize, blockSize);

        if (geo.type === 'Pavement' && seed > 0.8) {
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.fillRect(cx + margin + 2, roofY + 2, 2, 2);
        }
    });
}

function adjustColorBrightness(hex, percent) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.min(255, Math.max(0, parseInt(r * (100 + percent) / 100)));
    g = Math.min(255, Math.max(0, parseInt(g * (100 + percent) / 100)));
    b = Math.min(255, Math.max(0, parseInt(b * (100 + percent) / 100)));

    const toHex = v => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function drawLayerDetails(geo) {
    geo.cells.forEach(c => {
        const cx = Math.floor(c.x) + 8;
        const cy = Math.floor(c.y) + 8;
        const seed = Math.abs(Math.sin(c.x * 45.1 + c.y * 91.3));

        ctx.globalAlpha = 0.3;

        if (['Pavement','Slum_Pavement','Industrial'].includes(geo.type)) {
            if(seed > 0.8) {
                ctx.fillStyle = "#2C3E50";
                ctx.fillRect(cx-1, cy-1, 2, 2);
            }
        } else if (geo.type === 'Deep_Sea') {
            if(seed > 0.9) {
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                ctx.fillRect(cx, cy, 2, 2);
            }
        } else if (geo.type.includes('Water') || geo.type === 'Sewage') {
            if(seed > 0.7) {
                ctx.fillStyle = "rgba(255,255,255,0.15)";
                ctx.fillRect(cx-3, cy, 6, 1);
            }
        } else if (geo.type === 'Glacial_Water') {
            if(seed > 0.8) {
                ctx.fillStyle = "#ffffff";
                ctx.globalAlpha = 0.5;
                ctx.fillRect(cx-1, cy-1, 3, 3);
            }
        } else if (geo.type.includes('Grass') || geo.type.includes('Forest') || geo.type === 'Deep_Jungle') {
            if(seed > 0.85) {
                ctx.fillStyle = "#ffffff";
                ctx.globalAlpha = 0.15;
                ctx.fillRect(cx, cy, 2, 2);
            }
        } else if (geo.type.includes('Sand')) {
            if(seed > 0.7) {
                ctx.fillStyle = "#A08B70";
                ctx.globalAlpha = 0.3;
                ctx.fillRect(cx, cy, 1, 1);
            }
        }

        ctx.globalAlpha = 1.0;
    });
}

function hashRandom(x,y) {
    let sin = Math.sin(x * 12.9898 + y * 78.233);
    return sin - Math.floor(sin);
}

function drawGlobalGrid() {
    ctx.fillStyle = PALETTE.grid;
    const gap = 32;
    for(let x=0; x<=levelData.pxWid; x+=gap) {
        for(let y=0; y<=levelData.pxHei; y+=gap) {
            ctx.fillRect(x-0.5, y-0.5, 1, 1);
        }
    }
}

function drawIntGridLayer(layerName, defaultAlpha) {
    const layer = levelData.layerInstances.find(l => l.__identifier === layerName);
    if(!layer || layerVisibility[layerName] === false) return;
    if(!layer.intGridCsv || layer.intGridCsv.length === 0) return;

    const gs = layer.__gridSize || 16;
    const colorMap = intGridInfoMap[layer.layerDefUid] || {};
    
    ctx.save();
    ctx.globalAlpha = defaultAlpha || 0.3;

    layer.intGridCsv.forEach((val, idx) => {
        if(val === 0) return;
        const x = (idx % layer.__cWid) * gs + layer.pxOffsetX;
        const y = Math.floor(idx / layer.__cWid) * gs + layer.pxOffsetY;
        
        // 使用 intGridInfoMap 中定义的颜色
        const info = colorMap[val];
        const color = info ? info.color : "#888888";
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, gs, gs);
    });
    ctx.restore();
}

function drawZoneLayers() {
    // 渲染 Biome_Zone 和 Region_Zone 等区域图层
    levelData.layerInstances.forEach(layer => {
        if(layer.__type !== "Entities") return;
        if(!MERGE_REGEX.test(layer.__identifier)) return;
        if(layerVisibility[layer.__identifier] === false) return;

        const gMap = groupCache[layer.__identifier];
        if(!gMap) return;
        
        for(let key in gMap) {
            const list = gMap[key];
            if(list.length === 0) continue;
            
            const color = list[0].ent.__smartColor || "#888";
            
            // 只绘制填充色块，边框在悬浮时显示
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = color;
            list.forEach(item => {
                const r = item.rect;
                ctx.fillRect(r.x, r.y, r.w, r.h);
            });
            ctx.restore();
        }
    });
}

function drawPlayerPawn() {
    const gridSize = GRID_SIZE;
    const px = playerState.gx * gridSize;
    const py = playerState.gy * gridSize;
    const centerX = px + gridSize / 2;
    const centerY = py + gridSize / 2;

    ctx.save();

    const spinSpeed = Date.now() / 3000;
    const radius = 5 * gridSize;

    ctx.translate(centerX, centerY);
    ctx.rotate(spinSpeed);

    ctx.strokeStyle = "rgba(231, 76, 60, 0.5)";
    ctx.lineWidth = 1.5 / camera.zoom;
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(-spinSpeed * 2);
    ctx.beginPath();
    ctx.setLineDash([4, 12]);
    ctx.strokeStyle = "rgba(231, 76, 60, 0.3)";
    ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = playerState.color;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, py);
    ctx.lineTo(px + gridSize, centerY);
    ctx.lineTo(centerX, py + gridSize);
    ctx.lineTo(px, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 4;
    ctx.strokeText("SQ-LEADER", centerX, py - 6);

    ctx.shadowBlur = 0;
    ctx.fillText("SQ-LEADER", centerX, py - 6);

    ctx.restore();
}

function drawInfrastructure() {
    const layer = levelData.layerInstances.find(l => l.__identifier === "Infrastructure");
    if(!layer || layerVisibility[layer.__identifier] === false) return;

    const gs = layer.__gridSize || 16;
    ctx.save();
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#EB984E";
    ctx.shadowColor = "#EB984E";
    ctx.shadowBlur = 5;

    ctx.beginPath();
    layer.intGridCsv.forEach((val, idx) => {
        if(val === 0) return;
        const x = (idx % layer.__cWid) * gs + gs/2 + layer.pxOffsetX;
        const y = Math.floor(idx / layer.__cWid) * gs + gs/2 + layer.pxOffsetY;
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
}

// 异变实体主题颜色（大地图用）
const PHENOMENON_MAP_COLORS = {
    ancient: "#B71C1C",  // 古代种：深红
    future: "#00BCD4",   // 未来种：电子蓝
    ultra: "#6A1B9A"     // 究极异兽：深紫
};

function drawModernPin(ent) {
    if(ent._groupIdRef) return;

    const x = ent.px[0];
    const y = ent.px[1];
    const layerName = ent._layerName || "";
    
    // 检查是否为异变实体
    if(layerName === "Ultra_Wormhole" || layerName === "Paradox_Anchors") {
        drawPhenomenonPin(ent, x, y, layerName);
        return;
    }

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(x+8, y+14, 4, 1.5, 0, 0, Math.PI*2);
    ctx.fill();

    const color = ent.__smartColor || "#fff";
    ctx.translate(0, -Math.sin(Date.now()/300) * 2);

    if(ent.__identifier === "NPC_Actor") {
        ctx.fillStyle = color;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x+8, y+6, 5, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
    } else {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x+8, y);
        ctx.lineTo(x+14, y+6);
        ctx.lineTo(x+8, y+12);
        ctx.lineTo(x+2, y+6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
}

// 绘制异变实体图标（大地图）
function drawPhenomenonPin(ent, x, y, layerName) {
    const entityValue = ent.fieldInstances?.[0]?.__value || ent.__identifier;
    
    // 判断类型和颜色
    let phenomenonType = "ancient";
    let isBoss = false;
    
    if(layerName === "Ultra_Wormhole") {
        phenomenonType = "ultra";
    } else if(layerName === "Paradox_Anchors") {
        if(entityValue.startsWith("Pool_")) {
            phenomenonType = entityValue.includes("Ancient") ? "ancient" : "future";
        } else {
            isBoss = true;
            phenomenonType = (entityValue.includes("Anc") || entityValue.includes("Ancient")) ? "ancient" : 
                            (entityValue.includes("Fut") || entityValue.includes("Iron")) ? "future" : "ancient";
        }
    }
    
    const color = PHENOMENON_MAP_COLORS[phenomenonType] || PHENOMENON_MAP_COLORS.ancient;
    const pulse = Math.sin(Date.now() / 400) * 0.3 + 0.7;
    
    ctx.save();
    
    // 阴影
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(x+8, y+16, 6, 2, 0, 0, Math.PI*2);
    ctx.fill();
    
    // 脉冲光环
    ctx.globalAlpha = pulse * 0.4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x+8, y+6, 10 * pulse, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // 浮动效果
    const floatY = -Math.sin(Date.now()/300) * 3;
    ctx.translate(0, floatY);
    
    if(layerName === "Ultra_Wormhole") {
        // 究极之洞：圆形漩涡
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x+8, y+6, 6, 0, Math.PI*2);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
        // 内圈
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x+8, y+6, 3, 0, Math.PI*2);
        ctx.fill();
    } else if(isBoss) {
        // Boss：星形
        ctx.fillStyle = color;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        drawStar(ctx, x+8, y+6, 5, 8, 4);
        ctx.fill();
        ctx.stroke();
    } else {
        // Pool：菱形
        ctx.fillStyle = color;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x+8, y);
        ctx.lineTo(x+14, y+6);
        ctx.lineTo(x+8, y+12);
        ctx.lineTo(x+2, y+6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    ctx.restore();
}

// 绘制星形
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for(let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
}

function drawFocusBox() {
    if(!hoveredTarget) return;
    
    if(hoveredTarget.type === 'zone') {
        // 区域图层的悬浮边框
        drawZoneFocusBox(hoveredTarget.layerName, hoveredTarget.val);
    } else {
        // 单体实体的悬浮边框
        drawCrosshairBox(hoveredTarget.uID);
    }
}

function drawZoneFocusBox(layerName, zoneName) {
    const gMap = groupCache[layerName];
    if(!gMap || !gMap[zoneName]) return;
    
    const list = gMap[zoneName];
    const color = list[0].ent.__smartColor || "#2E86C1";
    
    // 获取图层的 gridSize
    const layer = levelData.layerInstances.find(l => l.__identifier === layerName);
    const gridSize = layer ? (layer.__gridSize || 16) : 16;
    
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    // 使用智能内缩描边算法绘制统一边框
    ctx.beginPath();
    generateSeamlessLoop(list, gridSize, 0);
    ctx.stroke();
    
    ctx.restore();
}

function drawCrosshairBox(iid) {
    if(!iid) return;
    for(const l of levelData.layerInstances) {
        if(l.__type !== 'Entities') continue;
        const e = l.entityInstances.find(x=>x.iid === iid);
        if(e) {
            ctx.strokeStyle = "#2E86C1";
            ctx.lineWidth = 2;
            const x = e.px[0];
            const y = e.px[1];
            ctx.strokeRect(x-2, y-2, e.width+4, e.height+4);
            return;
        }
    }
}

/** 
 * 智能内缩描边算法 (Smart Inset Generation)
 * 解决描边打架问题：如果不相邻，就要把线向内缩
 */
function generateSeamlessLoop(rectList, size, yOffset) {
    const pad = 1.5;

    const blockSet = new Set();
    rectList.forEach(item => {
        let gx = Math.round(item.rect.x / size);
        let gy = Math.round(item.rect.y / size);
        let w = Math.round(item.rect.w / size);
        let h = Math.round(item.rect.h / size);
        for(let a=0; a<w; a++) {
            for(let b=0; b<h; b++) {
                blockSet.add(`${gx+a},${gy+b}`);
            }
        }
    });

    rectList.forEach(item => {
        let gx = Math.round(item.rect.x / size);
        let gy = Math.round(item.rect.y / size);
        let w = Math.round(item.rect.w / size);
        let h = Math.round(item.rect.h / size);

        for(let a=0; a<w; a++) {
            for(let b=0; b<h; b++) {
                let curX = (gx+a), curY = (gy+b);
                let px = curX * size;
                let py = curY * size + yOffset; 

                const hasTop    = blockSet.has(`${curX},${curY-1}`);
                const hasBottom = blockSet.has(`${curX},${curY+1}`);
                const hasLeft   = blockSet.has(`${curX-1},${curY}`);
                const hasRight  = blockSet.has(`${curX+1},${curY}`);

                if(!hasTop) {
                    const lineY = py + pad; 
                    const startX = hasLeft ? px : px + pad;
                    const endX   = hasRight ? px + size : px + size - pad;
                    ctx.moveTo(startX, lineY); 
                    ctx.lineTo(endX, lineY);
                }

                if(!hasBottom) {
                    const lineY = py + size - pad;
                    const startX = hasLeft ? px : px + pad;
                    const endX   = hasRight ? px + size : px + size - pad;
                    ctx.moveTo(startX, lineY); 
                    ctx.lineTo(endX, lineY);
                }

                if(!hasLeft) {
                    const lineX = px + pad;
                    const startY = hasTop ? py : py + pad;
                    const endY = hasBottom ? py + size : py + size - pad;
                    ctx.moveTo(lineX, startY);
                    ctx.lineTo(lineX, endY);
                }

                if(!hasRight) {
                    const lineX = px + size - pad;
                    const startY = hasTop ? py : py + pad;
                    const endY = hasBottom ? py + size : py + size - pad;
                    ctx.moveTo(lineX, startY);
                    ctx.lineTo(lineX, endY);
                }
            }
        }
    });
}

/**
 * -------------------------------------------------------------
 * 键鼠交互模块 (Interaction Update for 3D Offset)
 * -------------------------------------------------------------
 */
let hoveredTarget = null; // 当前的高亮对象（Group或Einzel）

function bindEvents() {
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    canvas.addEventListener('mousedown', e => { 
        if(e.button === 0) {
            isDragging = true; 
            lastMouse = {x:e.clientX, y:e.clientY}; 
        }
        // 右键移动玩家功能已禁用，坐标由 ERA 变量控制
        // if(e.button === 2) {
        //     handlePlayerMove(e.clientX, e.clientY);
        // }
    });
    window.addEventListener('mouseup', () => isDragging=false );
    window.addEventListener('mouseleave', () => isDragging=false );

    // [Mobile Touch] 拖拽 + 双指缩放
    let _touchLastDist = 0;
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        if(e.touches.length === 1) {
            isDragging = true;
            lastMouse = {x: e.touches[0].clientX, y: e.touches[0].clientY};
        } else if(e.touches.length === 2) {
            isDragging = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            _touchLastDist = Math.sqrt(dx*dx + dy*dy);
        }
    }, {passive:false});
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        if(e.touches.length === 1 && isDragging) {
            const tx = e.touches[0].clientX, ty = e.touches[0].clientY;
            if(!(window.TacticalSystem && window.TacticalSystem._movementMode)) {
                camera.x += tx - lastMouse.x;
                camera.y += ty - lastMouse.y;
                limitCameraBounds();
            }
            lastMouse = {x: tx, y: ty};
        } else if(e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if(_touchLastDist > 0) {
                const ZOOM_MAX = 6.0, ZOOM_MIN = 0.5;
                const scale = dist / _touchLastDist;
                let nextZ = camera.zoom * scale;
                nextZ = Math.max(ZOOM_MIN, Math.min(nextZ, ZOOM_MAX));
                const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                const rect = canvas.getBoundingClientRect();
                const mx = (midX - rect.left - camera.x) / camera.zoom;
                const my = (midY - rect.top - camera.y) / camera.zoom;
                camera.x -= mx * (nextZ - camera.zoom);
                camera.y -= my * (nextZ - camera.zoom);
                camera.zoom = nextZ;
                limitCameraBounds();
            }
            _touchLastDist = dist;
        }
    }, {passive:false});
    canvas.addEventListener('touchend', e => {
        if(e.touches.length < 2) _touchLastDist = 0;
        if(e.touches.length === 0) isDragging = false;
    });
    
    // Zoom
    canvas.addEventListener('wheel', e => {
        e.preventDefault();

        const ZOOM_MAX = 6.0;
        const ZOOM_MIN = 0.5;
        let delta = e.deltaY > 0 ? 0.9 : 1.1; 
        let nextZ = camera.zoom * delta;
        nextZ = Math.max(ZOOM_MIN, Math.min(nextZ, ZOOM_MAX));
        if (Math.abs(nextZ - camera.zoom) < 0.001) return;
        
        let rect = canvas.getBoundingClientRect();
        // Mouse in World offset
        let mx = (e.clientX - rect.left - camera.x) / camera.zoom;
        let my = (e.clientY - rect.top - camera.y) / camera.zoom;
        
        camera.x -= mx * (nextZ - camera.zoom);
        camera.y -= my * (nextZ - camera.zoom);
        camera.zoom = nextZ;
        limitCameraBounds();
    }, {passive:false});

    // Move
    canvas.addEventListener('mousemove', e => {
        // 移动模式下禁用拖拽
        if(isDragging && !(window.TacticalSystem && window.TacticalSystem._movementMode)) {
            camera.x += e.clientX - lastMouse.x;
            camera.y += e.clientY - lastMouse.y;
            limitCameraBounds();
        }
        lastMouse = {x:e.clientX, y:e.clientY};
        if(!isDragging) checkMouseHover(e.clientX, e.clientY);
    });
    
    // Shift + 点击添加路线点
    canvas.addEventListener('click', e => {
        if(e.shiftKey && window.RouteSystem) {
            const rect = canvas.getBoundingClientRect();
            const wx = (e.clientX - rect.left - camera.x) / camera.zoom;
            const wy = (e.clientY - rect.top - camera.y) / camera.zoom;
            const gx = Math.floor(wx / GRID_SIZE);
            const gy = Math.floor(wy / GRID_SIZE);
            RouteSystem.handleShiftClick(gx, gy);
        }
    });
}

function handlePlayerMove(sx, sy) {
    if(!levelData) return;

    const rect = canvas.getBoundingClientRect();
    const wx = (sx - rect.left - camera.x) / camera.zoom;
    const wy = (sy - rect.top - camera.y) / camera.zoom;

    const tx = Math.floor(wx / GRID_SIZE);
    const ty = Math.floor(wy / GRID_SIZE);

    const maxX = Math.floor(levelData.pxWid / GRID_SIZE);
    const maxY = Math.floor(levelData.pxHei / GRID_SIZE);

    if(tx < 0 || ty < 0 || tx >= maxX || ty >= maxY) return;

    playerState.gx = tx;
    playerState.gy = ty;
    updatePlayerCoordsUI();
    notifyLocationChange(); // 通知外部系统位置变更
    if(window.RouteSystem) RouteSystem.setOrigin(tx, ty);
    const display = toDisplayCoords(tx, ty);
    console.log(`[CMD] Relocating Squad to Grid [${display.x}, ${display.y}] ${getQuadrantName(display.x, display.y)}`);
}

// Check Logic
function checkMouseHover(sx, sy) {
    if(!levelData) return;
    
    // Convert Screen -> World
    const rect = canvas.getBoundingClientRect();
    const wx = (sx - rect.left - camera.x) / camera.zoom;
    const wy = (sy - rect.top - camera.y) / camera.zoom;

    hoveredTarget = null;
    let hitZ = -99999; // 简单的 Z-Buffer 逻辑

    // 1. 扫描实体图层 (Entities)
    // 修正：我们要判定点击的是不是 Visual rect (移位后的)
    
    // 为了优化体验，我们反向遍历（先Top层服务、NPC，再到底层区域）
    // 为了省事直接复用 mapRawData loop
    // 请使用 for loop 方便 break/return
    
    let candidates = [];

    levelData.layerInstances.forEach(layer => {
        if(!layerVisibility[layer.__identifier]) return;
        if(layer.__type !== 'Entities') return; // 只考虑实体高亮，地板一般不交互

        const lid = layer.__identifier;
        const isZone = MERGE_REGEX.test(lid);

        if(isZone) {
            // 检测合并区域
            const gMap = groupCache[lid];
            for(let key in gMap) {
                const list = gMap[key];
                
                let isHit = false;
                for(let item of list) {
                    const r = item.rect;
                    if(wx >= r.x && wx <= r.x+r.w &&
                       wy >= r.y && wy <= r.y + r.h) {
                       isHit = true; break;
                    }
                }
                
                if(isHit) {
                    candidates.push({ 
                        val: key, type: 'zone', clr: list[0].ent.__smartColor,
                        zIdx: 0,
                        layerName: lid
                    });
                }
            }
        } else {
            // 单体
            layer.entityInstances.forEach(ent => {
                const ex = (layer.pxOffsetX + ent.px[0]) - (ent.width * ent.__pivot[0]);
                const ey = (layer.pxOffsetY + ent.px[1]) - (ent.height * ent.__pivot[1]);
                
                if( wx >= ex && wx <= ex + ent.width &&
                    wy >= ey && wy <= ey + ent.height ) {
                    
                    let name = getEntityName(ent);
                    candidates.push({
                        val: name, type: 'obj', clr: ent.__smartColor,
                        zIdx: 100,
                        uID: ent.iid
                    });
                }
            });
        }
    });

    if(candidates.length > 0) {
        // 取Z index最大的，解决重贴问题
        candidates.sort((a,b)=>b.zIdx - a.zIdx);
        hoveredTarget = candidates[0];
        updateDOMTooltip(sx, sy, hoveredTarget);
    } else {
        tooltip.style.display = 'none';
        canvas.style.cursor = 'default';
    }
}

function updateDOMTooltip(x, y, dat) {
    canvas.style.cursor = 'pointer';
    tooltip.style.display = 'block';
    
    // 使用汉化翻译（如果 translateMapName 函数存在）
    let txt = dat.val.replace(/_/g, ' ');
    if (typeof translateMapName === 'function') {
        txt = translateMapName(dat.val);
    }
    const typeLabel = dat.type === "obj" ? "实体" : "指定区域";
    tooltip.innerHTML = `<b style="color:${dat.clr}; font-size:14px; font-family:'M PLUS Rounded 1c', sans-serif;">${txt}</b><br><span style="font-size:10px; color:#aaa">${typeLabel}</span>`;
    
    tooltip.style.left = (x+20)+'px';
    tooltip.style.top = (y+20)+'px';
}

// 辅助：获取实体名称
function getEntityName(ent) {
    if(ent.fieldInstances[0] && ent.fieldInstances[0].__value) {
        return ent.fieldInstances[0].__value;
    }
    return ent.__identifier;
}

// --- Utils ---
window.toggleAllLayers = (v) => { 
    for(let k in layerVisibility) {
        layerVisibility[k]=v;
        let c = document.getElementById('toggle-'+k); if(c) c.checked=v;
    } 
};

window._calcPivotX = (l, e) => (l.pxOffsetX + e.px[0]) - (e.width * e.__pivot[0]);
window._calcPivotY = (l, e) => (l.pxOffsetY + e.px[1]) - (e.height * e.__pivot[1]);

function buildLayerControls() {
    toggleContainer.innerHTML = "";
    if(!levelData.layerInstances) return;

    let keys = levelData.layerInstances.map(l => l.__identifier);

    const DEFAULT_VISIBLE = [
        "Surface",
        "Infrastructure",
        "Regions",
        "Service"
    ];

    const priorityList = ["Surface", "Regions", "Threat", "Infrastructure", "Place_Anchor", "NPC_Actor"];
    keys.sort((a,b) => {
        let idxA = priorityList.indexOf(a);
        let idxB = priorityList.indexOf(b);
        if(idxA === -1) idxA = 999;
        if(idxB === -1) idxB = 999;
        return idxA - idxB;
    });

    keys.forEach(k => {
        if(layerVisibility[k] === undefined) {
            layerVisibility[k] = DEFAULT_VISIBLE.includes(k);
        }

        let div = document.createElement('div');
        div.className = 'layer-item';

        const isPriority = priorityList.includes(k);
        const labelStyle = isPriority 
            ? "color:#2c3e50; font-weight:800;" 
            : `color:${/Zone|Access|Obstacles/i.test(k)?'#95a5a6':'#3498db'}`;

        const isChecked = layerVisibility[k] ? 'checked' : '';

        div.innerHTML = `<label style="${labelStyle}"><input type="checkbox" id="toggle-${k}" ${isChecked} onchange="updateVis('${k}', this.checked)"> ${k}</label>`;
        toggleContainer.appendChild(div);
    });
}
window.updateVis = (k, v) => layerVisibility[k] = v;

function centerCamera() {
    let sc = Math.min(canvas.width / levelData.pxWid, canvas.height/levelData.pxHei)*0.85;
    sc = Math.max(0.5, Math.min(sc, 2.0));
    camera.zoom = sc;
    camera.x = canvas.width/2 - (levelData.pxWid*sc)/2;
    camera.y = canvas.height/2 - (levelData.pxHei*sc)/2;
}
function resizeCanvas() { 
    // 在 iframe 中可能需要使用父容器尺寸
    const w = window.innerWidth || document.documentElement.clientWidth || 400;
    const h = window.innerHeight || document.documentElement.clientHeight || 600;
    canvas.width = Math.max(w, 100); 
    canvas.height = Math.max(h, 100); 
    
    // 重新计算缩放和相机位置
    if (levelData && levelData.pxWid) {
        centerCamera();
    }
    
    // 立即清除并重绘，避免残影
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // 更新 TacticalSystem 尺寸
    if (window.TacticalSystem && window.TacticalSystem.isActive) {
        window.TacticalSystem.resize(canvas.width, canvas.height);
    }
    
    console.log('[MAP] Canvas 已调整:', w, 'x', h);
} 
function drawStatusText(t) {console.log(t);}
function hexToRgba(hex,a) {
    if(!hex || hex.length!=7) return `rgba(255,255,255,${a})`;
    let r=parseInt(hex.slice(1,3), 16), g=parseInt(hex.slice(3,5), 16), b=parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${a})`;
}

function updatePlayerCoordsUI() {
    const el = playerCoordsEl || document.getElementById('ui-coords');
    if(!el) return;

    const display = toDisplayCoords(playerState.gx, playerState.gy);
    const quadShort = getQuadrantName(display.x, display.y);
    const quadDisplay = quadShort === '?' ? '-' : quadShort;

    el.innerHTML = `
        <div class="hud-coords-container">
            <span class="coord-axis">X</span>
            <span class="coord-num">${display.x}</span>
            <span style="width:6px"></span>
            <span class="coord-axis">Y</span>
            <span class="coord-num">${display.y}</span>
            <span class="quad-tag">${quadDisplay}</span>
        </div>
    `;
    playerCoordsEl = el;
}

function toggleTacticalMode() {
    const btnText = document.getElementById('action-btn-text');
    const relocateBtn = document.getElementById('relocate-btn');
    const encounterBtn = document.getElementById('encounter-btn');
    const isDiving = !document.body.classList.contains('tactical-mode');

    if(isDiving) {
        document.body.classList.add('tactical-mode');
        if(btnText) btnText.innerText = "RETURN TO ORBIT";
        if(relocateBtn) relocateBtn.style.display = 'block';
        if(encounterBtn) encounterBtn.style.display = 'block';
        enterPlayerTactical();
    } else {
        document.body.classList.remove('tactical-mode');
        if(btnText) btnText.innerText = "TACTICAL DIVE";
        if(relocateBtn) relocateBtn.style.display = 'none';
        if(encounterBtn) encounterBtn.style.display = 'none';
        // 退出战术模式时关闭移动模式
        if(window.TacticalSystem && window.TacticalSystem._movementMode) {
            window.TacticalSystem._movementMode = false;
            window.TacticalSystem._movementTarget = null;
        }
        exitPlayerTactical();
    }
}

function enterPlayerTactical() {
    if(!window.TacticalSystem) {
        console.error("Tactical Module Missing!");
        return;
    }
    if(window.TacticalSystem.isActive) return;

    isGlobalRenderPaused = true;
    window.TacticalSystem.enter(ctx, canvas.width, canvas.height, playerState.gx, playerState.gy);
}

function exitPlayerTactical() {
    if(!window.TacticalSystem) return;
    if(!window.TacticalSystem.isActive) return;

    window.TacticalSystem.exit();
    resizeCanvas();
    centerCameraOnPlayer();
    isGlobalRenderPaused = false;
    requestAnimationFrame(renderLoop);
}

function centerCameraOnPlayer() {
    if(!levelData) return;

    const playerPixelX = (playerState.gx * GRID_SIZE) + (GRID_SIZE / 2);
    const playerPixelY = (playerState.gy * GRID_SIZE) + (GRID_SIZE / 2);
    const screenCX = canvas.width / 2;
    const screenCY = canvas.height / 2;

    camera.x = screenCX - (playerPixelX * camera.zoom);
    camera.y = screenCY - (playerPixelY * camera.zoom);
    limitCameraBounds();
}

window.modifyZoom = function(delta) {
    if(!camera) return;
    const newZoom = Math.max(0.5, Math.min(6.0, camera.zoom + delta));
    camera.zoom = newZoom;
    limitCameraBounds();
};

const RouteSystem = {
    isPanelVisible: false,
    isExpanded: false,
    markers: [],
    dom: {
        panel: null,
        list: null,
        dist: null,
        risk: null,
        legs: null,
        summary: null,
        expandIcon: null
    },

    init() {
        this.dom.panel = document.getElementById('journey-panel');
        this.dom.list = document.getElementById('route-steps');
        this.dom.dist = document.getElementById('route-dist');
        this.dom.risk = document.getElementById('route-risk');
        this.dom.legs = document.getElementById('route-legs');
        this.dom.summary = document.getElementById('route-summary');
        this.dom.expandIcon = document.getElementById('expand-icon');
        this.reset();
    },

    ensureDom() {
        if(!this.dom.panel) this.init();
    },

    toggle() {
        this.ensureDom();
        this.isPanelVisible = !this.isPanelVisible;
        if(this.isPanelVisible) {
            this.dom.panel.classList.remove('hidden');
            if(this.markers.length === 0) this.reset();
        } else {
            // 关闭面板时，如果有多个点，生成旅途叙事
            if(this.markers.length > 1) {
                this.confirmJourney();
            }
            this.dom.panel.classList.add('hidden');
            this.isExpanded = false;
            this.dom.panel.classList.remove('expanded');
        }
    },

    toggleExpand() {
        this.ensureDom();
        this.isExpanded = !this.isExpanded;
        if(this.isExpanded) {
            this.dom.panel.classList.add('expanded');
        } else {
            this.dom.panel.classList.remove('expanded');
        }
    },

    setOrigin(gx, gy) {
        if(this.markers.length === 0) {
            this.markers = [{ gx, gy }];
        } else {
            this.markers[0] = { gx, gy };
        }
        this.updateData();
    },

    reset() {
        if(typeof playerState !== 'undefined' && playerState) {
            this.markers = [{ gx: playerState.gx, gy: playerState.gy }];
        } else {
            this.markers = [];
        }
        this.updateData();
    },

    handleShiftClick(gx, gy) {
        if(!levelData || gx < 0 || gy < 0) return;
        const maxX = Math.floor(levelData.pxWid / GRID_SIZE);
        const maxY = Math.floor(levelData.pxHei / GRID_SIZE);
        if(gx >= maxX || gy >= maxY) return;

        if(!this.isPanelVisible) this.toggle();
        if(this.markers.length === 0) this.reset();

        const origin = this.markers[0];
        if(origin && origin.gx === gx && origin.gy === gy) {
            return;
        }

        const existIdx = this.markers.findIndex((pt, idx) => idx > 0 && pt.gx === gx && pt.gy === gy);
        if(existIdx !== -1) {
            this.markers.splice(existIdx, 1);
        } else {
            this.markers.push({ gx, gy });
        }
        this.updateData();
    },

    updateData() {
        const { list, dist, risk, legs } = this.dom;
        if(!list || !dist || !risk || !legs) return;

        if(this.markers.length === 0 && typeof playerState !== 'undefined') {
            this.markers = [{ gx: playerState.gx, gy: playerState.gy }];
        }

        list.innerHTML = '';
        let totalD = 0;
        let totalRiskPoints = 0;

        this.markers.forEach((pt, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === this.markers.length - 1 && idx > 0;

            if(idx > 0) {
                const prev = this.markers[idx - 1];
                const dx = pt.gx - prev.gx;
                const dy = pt.gy - prev.gy;
                totalD += Math.hypot(dx, dy);
                const mx = Math.floor((pt.gx + prev.gx) / 2);
                const my = Math.floor((pt.gy + prev.gy) / 2);
                totalRiskPoints += getIntVal(mx, my, 'Threat') || 0;
            }

            let zoneNameRaw = formatZoneLabel(
                getEntZoneName('Region_Zone', pt.gx, pt.gy)
                || getEntZoneName('Biome_Zone', pt.gx, pt.gy)
            );
            // 使用汉化翻译
            let zoneName = zoneNameRaw ? (typeof translateMapName === 'function' ? translateMapName(zoneNameRaw) : zoneNameRaw) : `格点 ${formatCoords(pt.gx, pt.gy)}`;
            if(isStart) zoneName = '当前位置';

            const display = toDisplayCoords(pt.gx, pt.gy);
            const div = document.createElement('div');
            div.className = `route-step${isStart ? ' start' : ''}${isEnd ? ' final' : ''}`;
            div.innerHTML = `<div><b>${zoneName}</b></div><div style="color:#aaa; font-size:9px;">[${display.x}, ${display.y}]</div>`;
            list.appendChild(div);
        });

        dist.textContent = Math.floor(totalD * 1.5) + 'm';
        legs.textContent = Math.max(0, this.markers.length - 1);

        let riskText = 'SAFE';
        let riskColor = '#2ecc71';
        if(totalRiskPoints > 8) {
            riskText = 'CRITICAL';
            riskColor = '#e74c3c';
        } else if(totalRiskPoints > 3) {
            riskText = 'ELEVATED';
            riskColor = '#f1c40f';
        }
        risk.textContent = riskText;
        risk.style.color = riskColor;

        // Update summary in header
        const summary = this.dom.summary;
        if(summary) {
            const legCount = Math.max(0, this.markers.length - 1);
            summary.textContent = legCount === 0 ? 'NO ROUTE' : `${legCount} LEG${legCount > 1 ? 'S' : ''}`;
        }
    },

    drawGridOverlay(ctxRef) {
        if(!this.isPanelVisible || this.markers.length < 2) return;

        ctxRef.save();
        ctxRef.lineJoin = 'round';
        ctxRef.lineCap = 'round';

        const timeScroller = -Date.now() / 30;
        ctxRef.shadowBlur = 10;
        ctxRef.shadowColor = 'rgba(52, 152, 219, 0.8)';

        ctxRef.beginPath();
        this.markers.forEach((pt, i) => {
            const px = pt.gx * GRID_SIZE + GRID_SIZE / 2;
            const py = pt.gy * GRID_SIZE + GRID_SIZE / 2;
            if(i === 0) ctxRef.moveTo(px, py); else ctxRef.lineTo(px, py);
        });

        ctxRef.lineWidth = 3;
        ctxRef.strokeStyle = '#3498db';
        ctxRef.setLineDash([8, 6]);
        ctxRef.lineDashOffset = timeScroller;
        ctxRef.stroke();

        ctxRef.shadowBlur = 0;
        ctxRef.setLineDash([]);

        this.markers.forEach((pt, i) => {
            if(i === 0) return;
            const px = pt.gx * GRID_SIZE + GRID_SIZE / 2;
            const py = pt.gy * GRID_SIZE + GRID_SIZE / 2;

            ctxRef.fillStyle = '#fff';
            ctxRef.beginPath();
            ctxRef.arc(px, py, 3, 0, Math.PI * 2);
            ctxRef.fill();

            if(i === this.markers.length - 1) {
                ctxRef.strokeStyle = '#e74c3c';
                ctxRef.lineWidth = 2;
                ctxRef.beginPath();
                ctxRef.arc(px, py, 6, 0, Math.PI * 2);
                ctxRef.stroke();
                ctxRef.textAlign = 'left';
                ctxRef.fillStyle = '#2c3e50';
                ctxRef.strokeStyle = '#fff';
                ctxRef.lineWidth = 3;
                ctxRef.font = 'bold 10px sans-serif';
                ctxRef.strokeText('DEST', px + 10, py);
                ctxRef.fillText('DEST', px + 10, py);
            }
        });

        ctxRef.restore();
    },
    
    // 生成旅途叙事并确认
    confirmJourney() {
        if(this.markers.length < 2) return;
        
        const journeyText = this.generateJourneyNarrative();
        this.copyToClipboard(journeyText);
        this.showJourneyNotification();
        
        console.log('[RouteSystem] 旅途叙事已生成:');
        console.log(journeyText);
    },
    
    // 生成旅途叙事
    generateJourneyNarrative() {
        const lines = [];
        const destination = this.markers[this.markers.length - 1];
        const destDisplay = toDisplayCoords(destination.gx, destination.gy);
        
        // VariableEdit 部分 - 终点坐标
        lines.push('<VariableEdit>');
        lines.push(`"world_state": {`);
        lines.push(`    "location": {`);
        lines.push(`        "x": ${destDisplay.x},`);
        lines.push(`        "y": ${destDisplay.y}`);
        lines.push(`    }`);
        lines.push(`}`);
        lines.push('</VariableEdit>');
        lines.push('');
        
        // 旅途标题
        const legCount = this.markers.length - 1;
        lines.push(`【旅途记录】共 ${legCount} 段行程，从 ${this.getLocationName(0)} 前往 ${this.getLocationName(this.markers.length - 1)}。`);
        lines.push('');
        
        // 逐段描述环境变化
        for(let i = 1; i < this.markers.length; i++) {
            const fromPt = this.markers[i - 1];
            const toPt = this.markers[i];
            
            const fromInfo = this.getGridInfo(fromPt.gx, fromPt.gy);
            const toInfo = this.getGridInfo(toPt.gx, toPt.gy);
            
            lines.push(`▶ 第 ${i} 段: ${fromInfo.displayName} → ${toInfo.displayName}`);
            
            // 检查环境变化
            const changes = [];
            
            // 1. 地区变化（大区域）
            if(fromInfo.region !== toInfo.region) {
                const fromRegion = this.getRegionNarrative(fromInfo.region);
                const toRegion = this.getRegionNarrative(toInfo.region);
                changes.push(`  ★ 跨越地区: 离开「${fromRegion.name}」，进入「${toRegion.name}」`);
                if(toRegion.prompt) {
                    changes.push(`    ${toRegion.prompt}`);
                }
            }
            
            // 2. 区域变化（人文区）vs 生态变化 - 优先显示人文区
            const zoneChanged = fromInfo.zone !== toInfo.zone;
            const biomeChanged = fromInfo.biome !== toInfo.biome;
            
            if(zoneChanged) {
                const fromZone = this.getZoneNarrative(fromInfo.zone);
                const toZone = this.getZoneNarrative(toInfo.zone);
                
                // 检查是否是人文区（在 region_zones 中）
                const isHumanZone = this.isInRegionZones(toInfo.zone);
                
                if(isHumanZone) {
                    // 人文区优先显示
                    changes.push(`  ★ 区域变化: 离开「${fromZone.name}」，进入「${toZone.name}」`);
                    if(toZone.exterior) {
                        changes.push(`    ${toZone.exterior}`);
                    }
                } else if(biomeChanged) {
                    // 如果不是人文区且生态也变了，显示生态变化
                    const fromBiome = this.getBiomeNarrative(fromInfo.biome);
                    const toBiome = this.getBiomeNarrative(toInfo.biome);
                    changes.push(`  ★ 生态变化: 从「${fromBiome.name}」进入「${toBiome.name}」`);
                    if(toBiome.visual) {
                        changes.push(`    ${toBiome.visual}`);
                    }
                } else {
                    // 只有区域变化，没有生态变化
                    changes.push(`  ★ 区域变化: 离开「${fromZone.name}」，进入「${toZone.name}」`);
                    if(toZone.exterior) {
                        changes.push(`    ${toZone.exterior}`);
                    }
                }
            } else if(biomeChanged) {
                // 只有生态变化，没有区域变化
                const fromBiome = this.getBiomeNarrative(fromInfo.biome);
                const toBiome = this.getBiomeNarrative(toInfo.biome);
                changes.push(`  ★ 生态变化: 从「${fromBiome.name}」进入「${toBiome.name}」`);
                if(toBiome.visual) {
                    changes.push(`    ${toBiome.visual}`);
                }
            }
            
            // 3. 地表变化
            if(fromInfo.surface !== toInfo.surface) {
                changes.push(`  ★ 地表变化: ${fromInfo.surface} → ${toInfo.surface}`);
            }
            
            if(changes.length > 0) {
                lines.push(...changes);
            } else {
                lines.push(`  继续在同一环境中前进。`);
            }
            lines.push('');
        }
        
        // 最终抵达
        const finalInfo = this.getGridInfo(destination.gx, destination.gy);
        lines.push(`【最终目的地】`);
        lines.push(`坐标: [${destDisplay.x}, ${destDisplay.y}]`);
        if(finalInfo.region) lines.push(`地区: ${finalInfo.region}`);
        if(finalInfo.biome) lines.push(`生态: ${finalInfo.biome}`);
        lines.push(`区域: ${finalInfo.zone}`);
        if(finalInfo.surface) lines.push(`地表: ${finalInfo.surface}`);
        
        return lines.join('\n');
    },
    
    // 获取位置名称
    getLocationName(index) {
        if(index < 0 || index >= this.markers.length) return '未知';
        const pt = this.markers[index];
        const display = toDisplayCoords(pt.gx, pt.gy);
        const zoneRaw = formatZoneLabel(
            getEntZoneName('Region_Zone', pt.gx, pt.gy)
            || getEntZoneName('Biome_Zone', pt.gx, pt.gy)
        );
        // 使用汉化翻译
        const zone = zoneRaw ? (typeof translateMapName === 'function' ? translateMapName(zoneRaw) : zoneRaw) : `[${display.x}, ${display.y}]`;
        return zone;
    },
    
    // 获取格子信息
    getGridInfo(gx, gy) {
        const display = toDisplayCoords(gx, gy);
        const regionVal = getIntVal(gx, gy, 'Region');
        const biomeVal = getIntVal(gx, gy, 'Biome');
        const surfaceVal = getIntVal(gx, gy, 'Surface');
        const zoneVal = getEntZoneName('Region_Zone', gx, gy) || getEntZoneName('Biome_Zone', gx, gy);
        
        const regionName = getIntGridTextName('Region', regionVal) || '';
        const biomeName = getIntGridTextName('Biome', biomeVal) || '';
        const surfaceName = getIntGridTextName('Surface', surfaceVal) || '';
        const zoneNameRaw = formatZoneLabel(zoneVal) || 'Local Grid';
        // 使用汉化翻译
        const zoneName = typeof translateMapName === 'function' ? translateMapName(zoneNameRaw) : zoneNameRaw;
        
        return {
            displayX: display.x,
            displayY: display.y,
            displayName: zoneName,
            region: regionName,
            biome: biomeName,
            surface: surfaceName,
            zone: zoneName
        };
    },
    
    // 获取地区叙事信息
    getRegionNarrative(regionKey) {
        const mapInfo = window.mapInfoData;
        if(!mapInfo) return { name: regionKey, prompt: null };
        
        const regions = mapInfo.narrative_layer?.world_atmosphere?.regions || {};
        for(const key in regions) {
            const r = regions[key];
            if(key.toLowerCase().includes(regionKey.toLowerCase()) || 
                (r.display_name && r.display_name.includes(regionKey))) {
                return {
                    name: r.display_name || regionKey,
                    prompt: r.prompt_snippet || null
                };
            }
        }
        return { name: regionKey, prompt: null };
    },
    
    // 获取生态区叙事信息
    getBiomeNarrative(biomeKey) {
        const mapInfo = window.mapInfoData;
        if(!mapInfo) return { name: biomeKey, visual: null };
        
        const biomes = mapInfo.biome_flavor || {};
        const normalizedKey = biomeKey.replace(/\s+/g, '_');
        
        for(const key in biomes) {
            if(key.toLowerCase() === normalizedKey.toLowerCase() ||
                key.toLowerCase().includes(normalizedKey.toLowerCase())) {
                const b = biomes[key];
                return {
                    name: key.replace(/_/g, ' '),
                    visual: b.visual_texture || null
                };
            }
        }
        return { name: biomeKey, visual: null };
    },
    
    // 检查区域是否在 region_zones 中（人文区）
    isInRegionZones(zoneKey) {
        const mapInfo = window.mapInfoData;
        if(!mapInfo) return false;
        
        const zones = mapInfo.region_zones || {};
        const normalizedKey = zoneKey.replace(/\s+/g, '_');
        
        for(const key in zones) {
            if(key.toLowerCase() === normalizedKey.toLowerCase() ||
                key.toLowerCase().includes(normalizedKey.toLowerCase())) {
                return true;
            }
        }
        return false;
    },
    
    // 获取人文区叙事信息
    getZoneNarrative(zoneKey) {
        const mapInfo = window.mapInfoData;
        if(!mapInfo) return { name: zoneKey, exterior: null };
        
        const normalizedKey = zoneKey.replace(/\s+/g, '_');
        
        // 先在 region_zones 中查找
        const zones = mapInfo.region_zones || {};
        for(const key in zones) {
            if(key.toLowerCase() === normalizedKey.toLowerCase() ||
                key.toLowerCase().includes(normalizedKey.toLowerCase())) {
                const z = zones[key];
                return {
                    name: key.replace(/_/g, ' '),
                    exterior: z.exterior_view || null
                };
            }
        }
        
        // 如果没找到，在 biome_flavor 中查找
        const biomes = mapInfo.biome_flavor || {};
        for(const key in biomes) {
            if(key.toLowerCase() === normalizedKey.toLowerCase() ||
                key.toLowerCase().includes(normalizedKey.toLowerCase())) {
                const b = biomes[key];
                return {
                    name: key.replace(/_/g, ' '),
                    exterior: b.visual_texture || null
                };
            }
        }
        
        return { name: zoneKey, exterior: null };
    },
    
    // 复制到剪贴板
    copyToClipboard(text) {
        if(navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                console.log('[RouteSystem] 已复制到剪贴板');
            }).catch(err => {
                console.error('[RouteSystem] 复制失败:', err);
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    },
    
    // 备用复制方法
    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            console.log('[RouteSystem] 备用复制成功');
        } catch(err) {
            console.error('[RouteSystem] 备用复制失败:', err);
        }
        document.body.removeChild(textarea);
    },
    
    // 显示旅途通知
    showJourneyNotification() {
        const old = document.querySelector('.copy-notification');
        if(old) old.remove();
        
        const legCount = this.markers.length - 1;
        const destination = this.markers[this.markers.length - 1];
        const destDisplay = toDisplayCoords(destination.gx, destination.gy);
        const destName = this.getLocationName(this.markers.length - 1);
        
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.innerHTML = `
            <div class="copy-notif-internal">
                <div class="copy-notif-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="24" height="24">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <div class="copy-notif-text">
                    <div class="copy-notif-title">JOURNEY CONFIRMED</div>
                    <div class="copy-notif-desc">${legCount} 段行程 · 目的地: ${destName}</div>
                    <div class="copy-notif-desc" style="margin-top: 4px; opacity: 0.8;">[${destDisplay.x}, ${destDisplay.y}]</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        void notification.offsetWidth;
        requestAnimationFrame(() => notification.classList.add('show'));
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3500);
    }
};

window.RouteSystem = RouteSystem;

// Start - 确保 DOM 准备好后再加载地图
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        RouteSystem.init();
        loadMapData();
    });
} else {
    // DOM 已经准备好
    RouteSystem.init();
    loadMapData();
}

/**
 * 🚧 相机边界限制算法 (防止迷路)
 */
function limitCameraBounds() {
    if (!levelData) return;

    const mapRenderW = levelData.pxWid * camera.zoom;
    const mapRenderH = levelData.pxHei * camera.zoom;
    const screenW = canvas.width;
    const screenH = canvas.height;
    const PADDING = 100;

    if (mapRenderW < screenW) {
        camera.x = (screenW - mapRenderW) / 2;
    } else {
        const maxX = PADDING;
        const minX = screenW - mapRenderW - PADDING;
        camera.x = Math.max(minX, Math.min(camera.x, maxX));
    }

    if (mapRenderH < screenH) {
        camera.y = (screenH - mapRenderH) / 2;
    } else {
        const maxY = PADDING;
        const minY = screenH - mapRenderH - PADDING;
        camera.y = Math.max(minY, Math.min(camera.y, maxY));
    }
}
