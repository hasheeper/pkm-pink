/* ============================================================
   SHARED DASHBOARD RUNTIME ADAPTER (Main)
   ============================================================ */
DashboardBridgeClient.install({
    product: 'main',
    defaultInputSource: 'dashboard-main'
});

let pkmMapEnvironmentRequestSeq = 0;
const pendingPkmMapEnvironmentRequests = new Map();
let pkmMapContextRequestSeq = 0;
const pendingPkmMapContextRequests = new Map();

function formatMapRuntimeError(data) {
    return data?.message || data?.reason || 'PKM map runtime request failed';
}

function handleMapEnvironmentResultMessage(data) {
    if (!data || (data.type !== 'PKM_MAP_ENVIRONMENT_RESULT' && data.type !== 'PKM_MAP_ENVIRONMENT_ERROR')) return false;
    const requestId = data.requestId || '';
    const pending = requestId ? pendingPkmMapEnvironmentRequests.get(requestId) : null;
    if (!pending) return true;
    clearTimeout(pending.timer);
    pendingPkmMapEnvironmentRequests.delete(requestId);
    if (data.type === 'PKM_MAP_ENVIRONMENT_RESULT' && data.ok !== false) pending.resolve(data);
    else {
        const error = new Error(formatMapRuntimeError(data));
        error.result = data;
        pending.reject(error);
    }
    return true;
}

function handleMapContextResultMessage(data) {
    if (!data || (data.type !== 'PKM_MAP_CONTEXT_RESULT' && data.type !== 'PKM_MAP_CONTEXT_ERROR')) return false;
    const requestId = data.requestId || '';
    const pending = requestId ? pendingPkmMapContextRequests.get(requestId) : null;
    if (!pending) return true;
    clearTimeout(pending.timer);
    pendingPkmMapContextRequests.delete(requestId);
    if (data.type === 'PKM_MAP_CONTEXT_RESULT' && data.ok !== false) pending.resolve(data);
    else {
        const error = new Error(formatMapRuntimeError(data));
        error.result = data;
        pending.reject(error);
    }
    return true;
}

function postMapEnvironmentRequest(payload = {}, options = {}) {
    const requestId = options.requestId || `pkm-map-env-${Date.now()}-${++pkmMapEnvironmentRequestSeq}`;
    const message = {
        type: 'PKM_MAP_ENVIRONMENT_REQUEST',
        requestId,
        payload: payload && typeof payload === 'object' ? payload : {},
        source: options.source || 'dashboard-main'
    };
    if (options.floorKey) message.floorKey = options.floorKey;
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            pendingPkmMapEnvironmentRequests.delete(requestId);
            reject(new Error('PKM map environment request timed out'));
        }, options.timeoutMs || 15000);
        pendingPkmMapEnvironmentRequests.set(requestId, { resolve, reject, timer });
        try { getPkmActionTargets().forEach((target) => target.postMessage(message, '*')); }
        catch (error) {
            clearTimeout(timer);
            pendingPkmMapEnvironmentRequests.delete(requestId);
            reject(error);
        }
    });
}

function postMapContextRequest(mode = 'inject', options = {}) {
    const requestId = options.requestId || `pkm-map-context-${Date.now()}-${++pkmMapContextRequestSeq}`;
    const message = {
        type: 'PKM_MAP_CONTEXT_REQUEST',
        requestId,
        payload: { mode, force: options.force === true, reason: options.reason || mode },
        source: options.source || 'dashboard-main'
    };
    if (options.floorKey) message.floorKey = options.floorKey;
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            pendingPkmMapContextRequests.delete(requestId);
            reject(new Error('PKM map context request timed out'));
        }, options.timeoutMs || 10000);
        pendingPkmMapContextRequests.set(requestId, { resolve, reject, timer });
        try { getPkmActionTargets().forEach((target) => target.postMessage(message, '*')); }
        catch (error) {
            clearTimeout(timer);
            pendingPkmMapContextRequests.delete(requestId);
            reject(error);
        }
    });
}

window.postMapEnvironmentRequest = postMapEnvironmentRequest;
window.postMapContextRequest = postMapContextRequest;

DashboardMovePool.install({
    product: 'dashboard-main',
    getDb: () => db,
    actionSource: 'dashboard-main:move-pool',
    narrativeTitle: 'R-Sync tactical sync',
    narrativeLine: (displayName) => `请简短描写训练家利用 P-Phone 从云端引导记忆数据，并确认 ${displayName} 的技能配置。`,
    actionPayload: (slot, slotKey, moves) => ({ slot, slotKey, moves })
});
DashboardBoxManager.install({
    product: 'dashboard-main',
    getDb: () => db,
    boxInputSource: 'dashboard-main:box',
    getZoneName: () => {
        const boxLocation = db?.world_state?.location || {};
        return ZoneDB[getRegionByCoords(boxLocation.x || 0, boxLocation.y || 0)]?.label || '未知区域';
    },
    createEmptySlot: (slotNum) => ({
        slot: slotNum,
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
        friendship: { avs: { trust: 0, passion: 0, insight: 0, devotion: 0 } },
        moves: { move1: null, move2: null, move3: null, move4: null },
        stats_meta: { ivs: { hp: null, atk: null, def: null, spa: null, spd: null, spe: null }, ev_level: 0 },
        notes: null
    }),
    beforeRender: async ({ db: state, boxState }) => {
        if (!transitData.loaded) await loadTransitData();
        const locData = state?.world_state?.location;
        const playerX = locData?.x ?? 0;
        const playerY = locData?.y ?? 0;
        const signalStatus = isInSignalCoverage(playerX, playerY);
        const isLocked = !signalStatus.covered;
        if (!isLocked) return { isLocked, signalStatus, overlayHtml: '' };
        const nearestDist = signalStatus.nearestDistance !== Infinity ? (signalStatus.nearestDistance * 0.4).toFixed(1) : '???';
        const nearestCoords = signalStatus.nearestTerminal ? `[${signalStatus.nearestTerminal.x}, ${signalStatus.nearestTerminal.y}]` : '[N/A]';
        return {
            isLocked,
            signalStatus,
            overlayHtml: `
            <div class="box-offline-overlay">
                <div class="boo-bg-deco">SIGNAL LOST</div>
                <div class="boo-content">
                    <div class="boo-icon-wrap"><svg class="boo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.2"></circle><path d="M1 1l22 22" class="slash-line"></path><path d="M4.93 4.93L19.07 19.07" stroke-width="8" stroke="#fff"></path><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" opacity="0.6"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path></svg></div>
                    <div class="boo-title">SIGNAL LOST</div><span class="boo-code">/// 0x0000_OUT_OF_RANGE ///</span>
                    <div class="boo-alert-box"><div class="boo-main-reason">Box-Link 信号塔超出覆盖范围</div><div class="boo-hint">当前位置 [${playerX}, ${playerY}] 不在任何 PC_Terminal 信号范围内<br>最近信号塔: ${nearestCoords} (${nearestDist} km)<br>信号覆盖半径: ${PC_SIGNAL_RADIUS * 0.4} km</div></div>
                </div>
                <div class="boo-terminal"><span>> Scanning for Box-Link terminals... [${transitData.pcTerminals?.length || 0}] found.</span><span>> Nearest signal: ${nearestDist} km away. Required: ≤${PC_SIGNAL_RADIUS * 0.4} km.</span><span>> Connection failed: ERR_SIGNAL_WEAK</span></div>
            </div>`
        };
    }
});
DashboardPartyRenderer.install({
    product: 'dashboard-main',
    getDb: () => db,
    renderAffinityPanel: (pkm, slotIdStr, helpers) => {
        const avsData = pkm?.friendship?.avs || { trust: 0, passion: 0, insight: 0, devotion: 0 };
        return `
        <div class="avs-dashboard" id="avs-panel-${slotIdStr}" onclick="event.stopPropagation()">
            <div class="avs-stat-item asi-stat-trust">
                <span class="asi-label">TRUST</span>
                <span class="asi-val ${helpers.maxCheck(avsData.trust)}">${avsData.trust}</span>
            </div>
            <div class="avs-stat-item asi-stat-passion">
                <span class="asi-label">PASSION</span>
                <span class="asi-val ${helpers.maxCheck(avsData.passion)}">${avsData.passion}</span>
            </div>
            <div class="avs-stat-item asi-stat-insight">
                <span class="asi-label">INSIGHT</span>
                <span class="asi-val ${helpers.maxCheck(avsData.insight)}">${avsData.insight}</span>
            </div>
            <div class="avs-stat-item asi-stat-devotion">
                <span class="asi-label">DEVOTION</span>
                <span class="asi-val ${helpers.maxCheck(avsData.devotion)}">${avsData.devotion}</span>
            </div>
        </div>`;
    }
});
DashboardSettings.install({
    product: 'dashboard-main',
    getDb: () => db,
    setDb: (nextDb) => { db = nextDb; },
    defaultSettings: () => DefaultSettings,
    normalizeSettings: (rawSettings, defaults) => {
        const hasEnvironment = Object.prototype.hasOwnProperty.call(rawSettings, 'enableEnvironment');
        const hasBattleEnvironment = Object.prototype.hasOwnProperty.call(rawSettings, 'enableBattleEnvironment');
        const next = { ...defaults, ...rawSettings };
        if (hasEnvironment && !hasBattleEnvironment) next.enableBattleEnvironment = rawSettings.enableEnvironment === true;
        if (hasBattleEnvironment && !hasEnvironment) next.enableEnvironment = rawSettings.enableBattleEnvironment === true;
        return next;
    },
    buildPatch: (key, value) => {
        const patch = { [key]: value };
        if (key === 'enableEnvironment') patch.enableBattleEnvironment = value;
        if (key === 'enableBattleEnvironment') patch.enableEnvironment = value;
        return patch;
    }
});

const RelationMeta = {
    '-2': { label: 'HOSTILE',  color: '#2d3436', light: '#636e72', icon: '☠️', desc: 'Enemy' },
    '-1': { label: 'COLD',     color: '#e17055', light: '#fab1a0', icon: '❄️', desc: 'Wary' },
    '0':  { label: 'NEUTRAL',  color: '#b2bec3', light: '#dfe6e9', icon: '⚪', desc: 'Stranger' },
    '1':  { label: 'FRIENDLY', color: '#0984e3', light: '#74b9ff', icon: '🔹', desc: 'Acquaintance' },
    '2':  { label: 'TRUSTED',  color: '#00b894', light: '#55efc4', icon: '🍀', desc: 'Friend' },
    '3':  { label: 'CALIB.3',  color: '#fd79a8', light: '#ffcce7', icon: '💗', desc: 'Close' },
    '4':  { label: 'DEVOTED',  color: '#fdcb6e', light: '#ffeaa7', icon: '💍', desc: 'Max Bond' }
};

/* ============================================================
   TRANSIT SYSTEM (交通系统)
   ============================================================ */
// 交通数据缓存
let transitData = {
    mapData: null,
    mapInfo: null,
    stations: [],    // 环线车站
    seaPorts: [],    // 港口码头
    airfields: [],   // 空运停机坪
    loaded: false
};

// 区域ID到简称的映射
const REGION_ID_MAP = {
    'Region_Zenith': 'Z',
    'Region_Neon': 'N',
    'Region_Bloom': 'B',
    'Region_Shadow': 'S',
    'Region_Apex': 'A'
};

// 交通设施ID规范化映射
const TRANSIT_ID_NORMALIZE = {
    'Summit_Dojo_POINT': 'Summit_Dojo_Point',
    'Northern_Cemetery': 'Northern_Cemetery_Pad',
    'Zenith_HQ': 'Zenith_HQ_Helipad'
};

// 坐标转换函数
function toDisplayCoords(gx, gy) {
    const MAP_CENTER_X = 26;
    const MAP_CENTER_Y = 26;
    let displayX = gx - MAP_CENTER_X;
    if (displayX >= 0) displayX += 1;
    let displayY = MAP_CENTER_Y - gy - 1;
    if (displayY >= 0) displayY += 1;
    return { x: displayX, y: displayY };
}

function toInternalCoords(displayX, displayY) {
    const MAP_CENTER_X = 26;
    const MAP_CENTER_Y = 26;
    let x = displayX;
    if (x > 0) x -= 1;
    let internalX = x + MAP_CENTER_X;
    let y = displayY;
    if (y > 0) y -= 1;
    let internalY = MAP_CENTER_Y - y - 1;
    return { gx: internalX, gy: internalY };
}

// 计算两点间的曼哈顿距离
function calcDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// 根据坐标获取区域（与 tavern-inject.js 保持一致）
function getRegionByCoords(x, y) {
    // Z区（中枢区）：中心 6x6 范围
    if (Math.abs(x) <= 6 && Math.abs(y) <= 6) return 'Z';
    // N区（霓虹区）：东南象限
    if (x > 0 && y < 0) return 'N';
    // B区（海滨区）：西南象限
    if (x < 0 && y < 0) return 'B';
    // S区（暗影区）：东北象限
    if (x > 0 && y > 0) return 'S';
    // A区（极诣区）：西北象限
    if (x < 0 && y > 0) return 'A';
    return 'Z';
}

// 加载交通数据
async function loadTransitData() {
    if (transitData.loaded) return true;
    
    try {
        const baseUrl = window.PKM_URL || './';
        const [mapDataRes, mapInfoRes] = await Promise.all([
            fetch(baseUrl + 'map/data/mapdata.json'),
            fetch(baseUrl + 'map/data/mapinfo.json')
        ]);
        
        if (mapDataRes.ok) {
            transitData.mapData = await mapDataRes.json();
        }
        if (mapInfoRes.ok) {
            transitData.mapInfo = await mapInfoRes.json();
        }
        
        if (transitData.mapData) {
            extractTransitEntities();
        }
        
        transitData.loaded = true;
        console.log('[TRANSIT] 交通数据加载完成');
        return true;
    } catch (e) {
        console.error('[TRANSIT] 加载失败:', e);
        return false;
    }
}

// 从 mapdata.json 提取交通实体和 PC_Terminal
function extractTransitEntities() {
    if (!transitData.mapData?.levels?.[0]) return;
    
    const levelData = transitData.mapData.levels[0];
    const gridSize = 16;
    
    transitData.stations = [];
    transitData.seaPorts = [];
    transitData.airfields = [];
    transitData.pcTerminals = []; // PC_Terminal 信号塔位置
    
    for (const layer of levelData.layerInstances || []) {
        if (layer.__type !== 'Entities') continue;
        
        for (const entity of layer.entityInstances || []) {
            const worldX = entity.__worldX || entity.px[0];
            const worldY = entity.__worldY || entity.px[1];
            const gx = Math.floor(worldX / gridSize);
            const gy = Math.floor(worldY / gridSize);
            const displayCoords = toDisplayCoords(gx, gy);
            
            let fieldValue = null;
            if (entity.fieldInstances?.[0]) {
                fieldValue = entity.fieldInstances[0].__value;
            }
            
            const item = {
                id: fieldValue,
                gx, gy,
                x: displayCoords.x,
                y: displayCoords.y,
                region: getRegionByCoords(displayCoords.x, displayCoords.y)
            };
            
            if (entity.__identifier === 'Transit_Station' && fieldValue) {
                transitData.stations.push(item);
            } else if (entity.__identifier === 'Sea_Route' && fieldValue) {
                transitData.seaPorts.push(item);
            } else if (entity.__identifier === 'Sky_Net' && fieldValue) {
                transitData.airfields.push(item);
            } else if (entity.__identifier === 'PC_Terminal') {
                // PC_Terminal 不需要 fieldValue，只需要位置
                transitData.pcTerminals.push({
                    gx, gy,
                    x: displayCoords.x,
                    y: displayCoords.y,
                    region: getRegionByCoords(displayCoords.x, displayCoords.y)
                });
            }
        }
    }
    
    console.log('[TRANSIT] 提取完成:', {
        stations: transitData.stations.length,
        seaPorts: transitData.seaPorts.length,
        airfields: transitData.airfields.length,
        pcTerminals: transitData.pcTerminals.length
    });
}

// PC_Terminal 信号覆盖半径（格子数）
const PC_SIGNAL_RADIUS = 3;

// 检查玩家是否在信号覆盖范围内
// 规则：Z区全覆盖 OR 在任意 PC_Terminal 的 3 格范围内
function isInSignalCoverage(playerX, playerY) {
    // Z区（中枢区）默认全覆盖
    const playerRegion = getRegionByCoords(playerX, playerY);
    if (playerRegion === 'Z') {
        return { covered: true, reason: 'ZENITH_FULL_COVERAGE' };
    }
    
    // 检查是否在任意 PC_Terminal 的信号范围内
    if (transitData.pcTerminals && transitData.pcTerminals.length > 0) {
        for (const terminal of transitData.pcTerminals) {
            const dist = calcDistance(playerX, playerY, terminal.x, terminal.y);
            if (dist <= PC_SIGNAL_RADIUS) {
                return { 
                    covered: true, 
                    reason: 'PC_TERMINAL_RANGE',
                    terminal: terminal,
                    distance: dist
                };
            }
        }
    }
    
    // 找到最近的 PC_Terminal
    let nearestDist = Infinity;
    let nearestTerminal = null;
    if (transitData.pcTerminals) {
        for (const terminal of transitData.pcTerminals) {
            const dist = calcDistance(playerX, playerY, terminal.x, terminal.y);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestTerminal = terminal;
            }
        }
    }
    
    return { 
        covered: false, 
        reason: 'OUT_OF_RANGE',
        nearestTerminal: nearestTerminal,
        nearestDistance: nearestDist
    };
}

// 获取交通设施描述
function getTransitDesc(id) {
    const normalizedId = TRANSIT_ID_NORMALIZE[id] || id;
    const infra = transitData.mapInfo?.transit_infrastructure || {};
    return infra[normalizedId]?.desc || '';
}

// 获取交通设施显示名称
function getTransitName(id) {
    const normalizedId = TRANSIT_ID_NORMALIZE[id] || id;
    return normalizedId.replace(/_/g, ' ');
}

/* --- TRANSIT 专用 SVG 图标 --- */
const TransitIcons = {
    loop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/><path d="M8 19l-2 3"/><path d="M16 19l2 3"/></svg>`,
    air: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 2L2 9.27l6.91 1 1.74 6.73 3.63-3.64L22 2z"/></svg>`,
    sea: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="5" r="3"/><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    here: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l0.71 0.71L12 18l6.79 3l0.71-0.71L12 2z"/></svg>`
};

// 渲染 TRANSIT 页面（Remastered UI）
async function renderTransitPage() {
    const transitPage = document.getElementById('pg-transit');
    if (!transitPage) return;
    
    if (!transitData.loaded) {
        transitPage.innerHTML = `<div class="transit-loading"><div class="transit-empty">Initializing Navigation System...</div></div>`;
        await loadTransitData();
    }
    
    const playerX = currentMapCoords?.x || 0;
    const playerY = currentMapCoords?.y || 0;
    const playerRegion = getRegionByCoords(playerX, playerY);
    
    const atStation = transitData.stations.find(s => s.x === playerX && s.y === playerY);
    const atSeaPort = transitData.seaPorts.find(s => s.x === playerX && s.y === playerY);
    const atAirfield = transitData.airfields.find(s => s.x === playerX && s.y === playerY);
    
    const sortByDistance = (list) => {
        return [...list].sort((a, b) => {
            const distA = calcDistance(playerX, playerY, a.x, a.y);
            return distA - calcDistance(playerX, playerY, b.x, b.y);
        });
    };
    
    const sortedStations = sortByDistance(transitData.stations);
    const sortedSeaPorts = sortByDistance(transitData.seaPorts);
    const sortedAirfields = sortByDistance(transitData.airfields);
    
    transitPage.innerHTML = `
        <div class="team-header-dash">
            <div class="th-title">TRANSIT LINK</div>
            <div class="th-status-grp">
                <div class="th-count">${playerRegion} <small>DISTRICT</small></div>
            </div>
        </div>
        
        <div class="transit-tabs">
            <div class="transit-tab active" data-tab="loop" onclick="switchTransitTab('loop')">
                <span>${TransitIcons.loop} LOOP-LINE</span>
            </div>
            <div class="transit-tab" data-tab="air" onclick="switchTransitTab('air')">
                <span>${TransitIcons.air} AIR-NET</span>
            </div>
            <div class="transit-tab" data-tab="sea" onclick="switchTransitTab('sea')">
                <span>${TransitIcons.sea} SEAPORT</span>
            </div>
        </div>
        
        <div class="transit-content">
            <div class="transit-panel active" id="transit-loop">
                ${renderTransitListV2(sortedStations, 'loop', playerRegion, atStation)}
            </div>
            <div class="transit-panel" id="transit-air">
                ${renderTransitListV2(sortedAirfields, 'air', playerRegion, atAirfield)}
            </div>
            <div class="transit-panel" id="transit-sea">
                ${renderTransitListV2(sortedSeaPorts, 'sea', playerRegion, atSeaPort)}
            </div>
        </div>
        <div class="transit-spacer"></div>
    `;
}

function renderTransitListV2(list, type, playerRegion, atStation) {
    if (!list || list.length === 0) {
        return `<div class="transit-empty">NO CONNECTION SIGNAL FOUND</div>`;
    }
    
    const playerX = currentMapCoords?.x || 0;
    const playerY = currentMapCoords?.y || 0;
    const currentZone = list.filter(s => s.region === playerRegion);
    const otherZone = list.filter(s => s.region !== playerRegion);
    
    let html = '';
    
    if (currentZone.length > 0) {
        const zoneName = ZoneDB[playerRegion]?.name || playerRegion;
        html += `<div class="transit-section">
            <div class="transit-section-title curr">
                <span class="section-marker"></span> ${zoneName} / LOCAL
            </div>`;
        currentZone.forEach(station => {
            const gridDist = calcDistance(playerX, playerY, station.x, station.y);
            const distKm = gridDist * 0.4;
            const isHere = gridDist === 0;
            const canClick = !atStation || isHere;
            html += renderTransitItemV2(station, type, gridDist, distKm, isHere, canClick);
        });
        html += `</div>`;
    }
    
    if (otherZone.length > 0) {
        html += `<div class="transit-section">
            <div class="transit-section-title othe">
                <span class="section-marker"></span> EXTERNAL ZONES
            </div>`;
        otherZone.forEach(station => {
            const gridDist = calcDistance(playerX, playerY, station.x, station.y);
            const distKm = gridDist * 0.4;
            const canClick = !!atStation;
            html += renderTransitItemV2(station, type, gridDist, distKm, false, canClick);
        });
        html += `</div>`;
    }
    
    return html;
}

function renderTransitItemV2(station, type, gridDist, distKm, isHere, canClick) {
    const name = getTransitName(station.id);
    const regionInfo = ZoneDB[station.region] || { name: station.region, color: '#636e72' };
    const statusClass = isHere ? 'here' : (canClick ? 'available' : 'locked');
    const clickAttr = canClick ? `onclick="handleTransitClick('${station.id}', ${station.x}, ${station.y}, '${type}')"` : '';
    const bgIcon = TransitIcons[type] || '';
    let badgeHtml = '';
    
    if (isHere) {
        badgeHtml = `<div class="ti-status-badge ti-here-badge">${TransitIcons.here} <span>HERE</span></div>`;
    } else if (canClick) {
        const displayDist = distKm >= 10 ? distKm.toFixed(0) : distKm.toFixed(1);
        badgeHtml = `<div class="ti-status-badge ti-dist-badge"><span class="ti-dist-val">${displayDist}</span><span class="ti-dist-unit">KM</span></div>`;
    } else {
        badgeHtml = `<div class="ti-status-badge ti-lock-badge">${TransitIcons.lock}</div>`;
    }
    
    let accColor = '#dfe6e9';
    if (type === 'loop') accColor = '#00b894';
    if (type === 'air') accColor = '#0984e3';
    if (type === 'sea') accColor = '#6c5ce7';
    
    return `
    <div class="transit-item ${statusClass}" ${clickAttr} data-type="${type}" style="--acc-color:${accColor}">
        <div class="transit-back-deco">${bgIcon}</div>
        <div class="ti-left">
            <div class="ti-icon">${bgIcon}</div>
            <div class="ti-info">
                <div class="ti-name">${name}</div>
                <div class="ti-meta">
                    <span class="ti-region" style="color:${regionInfo.color}">:: Zone-${station.region}</span>
                    <span class="muted-separator">|</span>
                    <span>[${station.x}, ${station.y}]</span>
                </div>
            </div>
        </div>
        <div class="ti-right">
            ${badgeHtml}
        </div>
    </div>`;
}

// 切换 Tab
window.switchTransitTab = function(tab) {
    document.querySelectorAll('.transit-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.transit-panel').forEach(p => p.classList.remove('active'));
    
    document.querySelector(`.transit-tab[data-tab="${tab}"]`)?.classList.add('active');
    document.getElementById(`transit-${tab}`)?.classList.add('active');
};

// 处理站点点击
window.handleTransitClick = async function(stationId, destX, destY, type) {
    const playerX = currentMapCoords?.x || 0;
    const playerY = currentMapCoords?.y || 0;
    
    // 检查是否在站点上
    const atStation = transitData.stations.find(s => s.x === playerX && s.y === playerY);
    const atSeaPort = transitData.seaPorts.find(s => s.x === playerX && s.y === playerY);
    const atAirfield = transitData.airfields.find(s => s.x === playerX && s.y === playerY);
    const isAtAnyStation = atStation || atSeaPort || atAirfield;
    
    const destRegion = getRegionByCoords(destX, destY);
    const playerRegion = getRegionByCoords(playerX, playerY);
    const stationName = getTransitName(stationId);
    
    let promptText = '';
    
    // 判断是步行到站点还是搭乘交通工具
    if (destRegion === playerRegion) {
        // 同区域：步行前往站点
        promptText = buildNarrativeInputText('Transit movement confirmed', [
            `从: 当前位置 [${playerX}, ${playerY}]`,
            `至: ${stationName} [${destX}, ${destY}]`,
            `方式: 步行`,
            `区域: ${ZoneDB[destRegion]?.name || destRegion}`,
            `请简短描写玩家步行前往 ${stationName}，并自然承接抵达后的状态。`
        ]);
    } else {
        // 跨区域：必须在站点上，搭乘交通工具
        if (!isAtAnyStation) {
            showDashboardNotice('ACCESS DENIED', '必须在站点才能前往其他区域', false);
            return;
        }
        
        const typeName = type === 'loop' ? '环线列车' : type === 'air' ? '空运飞行' : '港口航线';
        const fromStation = getTransitName((atStation || atSeaPort || atAirfield).id);
        
        promptText = buildNarrativeInputText('Transit movement confirmed', [
            `从: ${fromStation} [${playerX}, ${playerY}]`,
            `至: ${stationName} [${destX}, ${destY}]`,
            `方式: ${typeName}`,
            `区域: ${ZoneDB[playerRegion]?.name || playerRegion} -> ${ZoneDB[destRegion]?.name || destRegion}`,
            `请简短描写玩家搭乘${typeName}从 ${fromStation} 前往 ${stationName}，并自然承接抵达后的状态。`
        ]);
    }

    const actionType = destRegion === playerRegion ? '步行' : (type === 'loop' ? '环线' : type === 'air' ? '空运' : '海运');
    try {
        await requestMapEnvironmentUpdate(
            { x: destX, y: destY, region: destRegion },
            { reason: 'transit', inject: true }
        );
        await postTavernInput(promptText, { source: 'dashboard-main:transit' });
        showDashboardNotice('ROUTE READY', `${actionType} -> ${stationName} 已写入酒馆输入栏`, true);
    } catch (error) {
        console.error('[TRANSIT] 路线写入失败:', error);
        showPkmActionFailure(`路线写入失败：${error.message}`);
    }
};

/* ============================================================
   RENDER SOCIAL LIST (NPC grid)
   ============================================================ */
function renderSocialList() {
    const socialPage = document.getElementById('pg-social');
    if (!socialPage) return;

    const npcs = db?.world_state?.npcs || {};
    const npcKeys = Object.keys(npcs);
    const count = npcKeys.length;
    
    // 按好感度从高到低排序
    npcKeys.sort((a, b) => {
        const loveA = npcs[a]?.love ?? 0;
        const loveB = npcs[b]?.love ?? 0;
        const stageA = npcs[a]?.stage ?? 0;
        const stageB = npcs[b]?.stage ?? 0;
        
        // 先按 stage 排序，再按 love 排序
        if (stageB !== stageA) {
            return stageB - stageA;
        }
        return loveB - loveA;
    });
    
    let gridHtml = `<div id="social-grid-view">`;
    npcKeys.forEach(key => {
        gridHtml += createNPCCard(key, npcs[key]);
    });
    gridHtml += `</div>`;

    socialPage.innerHTML = `
        <div class="team-header-dash">
             <div class="th-title">RELATION NETWORK</div>
             <div class="th-status-grp">
                 <div class="th-count">${count} <small>CONNECTIONS</small></div>
             </div>
        </div>
        ${gridHtml}
    `;
}

function createNPCCard(key, npcData) {
    const stage = (npcData?.stage ?? 0).toString();
    const loveVal = Math.max(-100, Math.min(100, Math.round(Number(npcData?.love ?? 0))));
    const meta = RelationMeta[stage] || RelationMeta['0'];
    const portraitUrl = getTrainerSprite(key);
    const isUnmet = stage === '0' && loveVal === 0;
    const percent = isUnmet ? 0 : Math.min(100, Math.max(0, ((loveVal + 100) / 200) * 100));
    const displayName = key.charAt(0).toUpperCase() + key.slice(1);
    const displayLove = isUnmet ? '?' : (loveVal > 0 ? `+${loveVal}` : `${loveVal}`);
    const displayLabel = isUnmet ? 'UNKNOWN' : meta.label;

    const bondInfo = BondManifest[key.toLowerCase()];
    let badgeHtml = '';
    if (bondInfo) {
        const bondState = db?.player?.bonds || {};
        const isUnlocked = bondState[bondInfo.key] === true;
        const badgeState = isUnlocked ? 'unlocked' : 'locked';
        badgeHtml = `
            <div class="npc-bond-badge ${badgeState}" title="${bondInfo.label}${isUnlocked ? ' Active' : ' Locked'}">
                <img class="nb-icon-img"
                     src="${bondInfo.icon}"
                     alt="${bondInfo.label}"
                     loading="lazy"
                     onerror="this.style.display='none';">
                <span class="nb-bg"></span>
            </div>
        `;
    }

    return `
    <div class="npc-card ${isUnmet ? 'unmet' : ''}" data-stage="${stage}" style="--r-color:${meta.color}" title="${isUnmet ? 'Not encountered' : meta.desc}">
        <div class="npc-portrait">
            <img src="${portraitUrl}" loading="lazy" alt="${displayName}"
                 onerror="this.src='https://img.pokemondb.net/sprites/black-white/anim/normal/unown-i.gif'; this.style.opacity='0.25'">
        </div>
        ${badgeHtml}
        <div class="npc-info-shade">
            <div class="n-header">
                <span class="n-name">${displayName}</span>
                <span class="n-stage-icon">${meta.icon}</span>
            </div>
            <div class="n-bar-box">
                <div class="n-bar-label">
                    <span style="color:${meta.color}">${displayLabel}</span>
                    <span>${displayLove}<small style="opacity:0.5;font-weight:500;"> pts</small></span>
                </div>
                <div class="progress-track" style="background:${meta.light}">
                    <div class="progress-fill" style="width:${percent}%"></div>
                </div>
            </div>
        </div>
    </div>
    `;
}

const SpriteAlias = {
    'hex': 'hexmaniac-gen6',
    'juliana': 'juliana-s',
    'nemona': 'nemona-s'
};

function getTrainerSprite(npcName) {
    if (!npcName) {
        return 'https://img.pokemondb.net/sprites/black-white/anim/normal/unown-q.gif';
    }
    let slug = npcName.toLowerCase().trim();
    if (SpriteAlias[slug]) {
        slug = SpriteAlias[slug];
    }
    return `https://play.pokemonshowdown.com/sprites/trainers/${slug}.png`;
}

/* ============================================================
   MVUZ DATA BRIDGE - 从 pkm-main host 接收数据
   ============================================================ */

// 数据容器（初始为空，由 pkm-main host 推送）
let db = null;
const DefaultSettings = {
    enableAVS: true,
    enableCommander: true,
    enableEVO: true,
    enableBGM: true,
    enableSFX: true,
    enableClash: false,
    enableEnvironment: true,
    enableBattleEnvironment: true,
    enableBattlePerformanceMode: false,
    enableBattlePortraitMode: false,
    enableEnemyStrategicSwitching: true
};

let statusClockTimer = null;
let dashboardDomReady = false;
let dashboardInitialized = false;

function isHostedBridgeMode() {
    if (window.PKM_DASHBOARD_STANDALONE === true) return false;
    try {
        const params = new URLSearchParams(window.location.search || '');
        if (params.get('bridge') === '1') return true;
    } catch (e) {}
    try {
        if (window.parent && window.parent !== window) return true;
    } catch (e) {}
    try {
        if (window.opener) return true;
    } catch (e) {}
    return false;
}

function bootstrapDashboard(reason = 'bridge') {
    if (dashboardInitialized || !db) return false;
    ensureSettingsDefaults();
    if (typeof syncDashboardPerformanceMode === 'function') syncDashboardPerformanceMode(db);
    updateCoordsFromBridge();
    initStickyStatusBar();
    renderDashboard();
    renderPartyList();
    renderSocialList();
    renderSettings();
    renderBoxPage();
    dashboardInitialized = true;
    console.log('[PKM] ✓ Dashboard initialized', reason, db.player?.name || null);
    return true;
}

function getPkmBridgePayload(eventData) {
    if (!eventData || !eventData.type) return null;
    if (eventData.type === 'PKM_STATE_PUSH') {
        return eventData.dashboard || null;
    }
    return null;
}

function applyPkmBridgeData(payload, reason = 'message') {
    if (!payload || !payload.player) return false;
    db = payload;
    window.pkmBridgeData = payload;
    if (typeof syncDashboardPerformanceMode === 'function') syncDashboardPerformanceMode(db);
    console.log('[PKM] ✓ 桥接数据已更新', reason, db.player?.name);
    if (dashboardDomReady && !dashboardInitialized) {
        bootstrapDashboard(`bridge:${reason}`);
    }
    return true;
}

function notifyPkmBridgeReady() {
    const message = {
        type: 'PKM_READY',
        product: 'main',
        target: 'dashboard-main'
    };
    try {
        window.parent?.postMessage(message, '*');
    } catch (e) {}
    try {
        window.top?.postMessage(message, '*');
    } catch (e) {}
    try {
        window.opener?.postMessage(message, '*');
    } catch (e) {}
}

// ========== 监听来自酒馆的 postMessage ==========
let lastBridgePayloadKey = '';
let lastBridgePayloadAt = 0;

window.addEventListener('message', function(event) {
    if (!event.data || !event.data.type) return;
    if (String(event.data.type).startsWith('PKM_')) {
        console.log('[PKM] 收到桥接消息', event.data.type);
    }
    if (handleTavernInputResultMessage(event.data)) {
        return;
    }
    if (handleMapEnvironmentResultMessage(event.data)) {
        return;
    }
    if (handleMapContextResultMessage(event.data)) {
        return;
    }
    if (handlePkmActionResultMessage(event.data)) {
        return;
    }
    if (event.data.type === 'PKM_MAP_TAVERN_INPUT') {
        handleMapTavernInput(event.data);
        return;
    }
    if (event.data.type === 'PKM_MAP_JOURNEY_CONFIRM') {
        handleMapJourneyConfirm(event.data);
        return;
    }

    const bridgePayload = getPkmBridgePayload(event.data);
    if (bridgePayload && applyPkmBridgeData(bridgePayload, event.data.type)) {
        const payloadKey = JSON.stringify({
            player: bridgePayload.player?.name,
            slot1: bridgePayload.player?.party?.slot1?.name,
            party: Object.values(bridgePayload.player?.party || {}).map((pokemon) => pokemon?.name || null),
            boxCount: Object.keys(bridgePayload.player?.box || {}).length,
            settings: bridgePayload.settings || bridgePayload.player?.settings || {},
            world: bridgePayload.world || {},
            worldState: bridgePayload.world_state || {},
            npcs: bridgePayload.npcs || {}
        });
        const now = Date.now();
        if (payloadKey === lastBridgePayloadKey && now - lastBridgePayloadAt < 1500) {
            console.log('[PKM] 跳过重复桥接刷新', event.data.type);
            forwardMapStateToMap(event.data.type);
            return;
        }
        lastBridgePayloadKey = payloadKey;
        lastBridgePayloadAt = now;
        handleRefreshDebounced(event.data);
        return;
    }

    if (event.data.type === 'MAP_RESIZE') {
        // 收到外部容器 resize 消息，转发给 map iframe
        console.log('[PKM] 收到 MAP_RESIZE 消息，转发给 map iframe');
        const mapIframe = document.getElementById('map-iframe');
        if (mapIframe && mapIframe.contentWindow) {
            mapIframe.contentWindow.postMessage({ type: 'MAP_RESIZE' }, '*');
        }
    } else if (event.data.type === 'PKM_EXIT_MAP_FULLSCREEN') {
        // 收到退出全屏消息，退出 MAP 全屏模式
        console.log('[PKM] 收到退出全屏消息');
        const modal = document.getElementById('map-modal');
        if (modal && modal.classList.contains('fullscreen')) {
            modal.classList.remove('fullscreen');
            document.body.classList.remove('map-fullscreen-active');
        }
    }
});

// 防抖刷新处理
let refreshDebounceTimer = null;
function handleRefreshDebounced(eventData) {
    // 清除之前的定时器
    if (refreshDebounceTimer) {
        clearTimeout(refreshDebounceTimer);
    }
    
    // 延迟 100ms 执行，合并快速连续的刷新请求
    refreshDebounceTimer = setTimeout(() => {
        console.log('[PKM] 执行防抖刷新...');
        if (!db) {
            refreshDebounceTimer = null;
            return;
        }
        if (!dashboardInitialized) {
            bootstrapDashboard(`refresh:${eventData?.type || 'stateChanged'}`);
            forwardMapStateToMap(eventData?.type || 'refresh');
            refreshDebounceTimer = null;
            return;
        }
        
        // 先更新坐标，再渲染
        if (typeof updateCoordsFromBridge === 'function') updateCoordsFromBridge();
        if (typeof ensureSettingsDefaults === 'function') ensureSettingsDefaults();
        if (typeof syncDashboardPerformanceMode === 'function') syncDashboardPerformanceMode(db);
        
        // 刷新所有界面
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderPartyList === 'function') renderPartyList();
        if (typeof renderSocialList === 'function') renderSocialList();
        if (typeof renderSettings === 'function') renderSettings();
        if (typeof renderBoxPage === 'function') renderBoxPage();
        if (typeof updateClock === 'function') updateClock();
        
        forwardMapStateToMap(eventData?.type || 'refresh');
        
        refreshDebounceTimer = null;
    }, 100);
}

function buildMapStatePayload() {
    const world = db?.world || {};
    const worldState = db?.world_state || {};
    const npcs = db?.npcs?.records || worldState.npcs || {};
    return {
        location: world.location || worldState.location || {},
        time: world.time || worldState.time || {},
        weatherGrid: world.weatherGrid || worldState.weather_grid || {},
        pokemonSpawns: world.pokemonSpawns || worldState.pokemon_spawns || {},
        phenomenon: world.phenomenon || worldState.phenomenon || {},
        npcs,
        performanceMode: db?.settings?.enableBattlePerformanceMode === true
    };
}

function forwardMapStateToMap(reason = 'refresh') {
    const mapIframe = document.getElementById('map-iframe');
    if (mapIframe && mapIframe.contentWindow) {
        try {
            mapIframe.contentWindow.postMessage({
                type: 'PKM_MAP_STATE',
                product: 'main',
                reason,
                data: buildMapStatePayload()
            }, '*');
            console.log('[PKM] ✓ 已转发 MAP 状态到 map iframe');
        } catch (e) {
            // map iframe 可能未加载
        }
    }
}

function loadBridgeData() {
    const hosted = isHostedBridgeMode();
    console.log('[PKM] 正在加载桥接数据...');
    
    const bridgeData = window.pkmBridgeData;
    if (bridgeData && bridgeData.player) {
        applyPkmBridgeData(bridgeData, 'initial');
        console.log('[PKM] ✓ 桥接数据加载成功', db.player?.name);
        return true;
    }
    if (hosted) {
        console.warn('[PKM] Hosted dashboard waiting for PKM_STATE_PUSH');
        notifyPkmBridgeReady();
        return false;
    }
    console.warn('[PKM] 桥接数据暂未到达，使用本地占位数据');
    db = {
        player: {
            name: 'Trainer',
            bonds: {},
            unlocks: {},
            party: {
                slot1: { slot: 1, name: null },
                slot2: { slot: 2, name: null },
                slot3: { slot: 3, name: null },
                slot4: { slot: 4, name: null },
                slot5: { slot: 5, name: null },
                slot6: { slot: 6, name: null }
            },
            box: {}
        },
        world_state: {
            location: { x: 0, y: 0 },
            time: { period: 'morning', derived: { dayOfYear: 1 } },
            npcs: {}
        },
        settings: {}
    };
    return true;
}

/* ============================================================
   RENDER CONTROLLER
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    dashboardDomReady = true;
    initApp();
    notifyPkmBridgeReady();
    setTimeout(notifyPkmBridgeReady, 250);
    setTimeout(notifyPkmBridgeReady, 1000);
    setTimeout(notifyPkmBridgeReady, 2500);
});

function initApp() {
    if (loadBridgeData()) {
        bootstrapDashboard('DOMContentLoaded');
    }
}

// 从桥接数据更新坐标显示
function updateCoordsFromBridge() {
    if (db && db.world_state && db.world_state.location) {
        const loc = db.world_state.location;
        if (typeof loc.x === 'number' && typeof loc.y === 'number') {
            currentMapCoords = {
                x: loc.x,
                y: loc.y
            };
            updateCoordsDisplay(currentMapCoords);
            console.log('[PKM] 从桥接数据更新坐标:', currentMapCoords);
        }
    }
}

/* ============================================================
   PERSISTENT STATUS BAR (GLOBAL HUD)
   ============================================================ */
function initStickyStatusBar() {
    const frame = document.querySelector('.ver-dawn-frame');
    if (!frame) return;

    const existing = frame.querySelector('#sticky-status-bar');
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.id = 'sticky-status-bar';
    bar.className = 'p-status-bar';
    // 计算信号强度
    const playerX = db?.world_state?.location?.x || 0;
    const playerY = db?.world_state?.location?.y || 0;
    const signalStatus = isInSignalCoverage(playerX, playerY);
    let signalBars = 1; // 默认1格
    if (signalStatus.covered) {
        if (signalStatus.reason === 'ZENITH_FULL_COVERAGE') {
            signalBars = 4; // Z区满格
        } else {
            signalBars = 4; // PC终端范围内也满格
        }
    }
    
    const signalBarsHTML = Array.from({length: 4}, (_, i) => 
        `<div class="n-bar ${i < signalBars ? 'active' : ''}"></div>`
    ).join('');
    
    bar.innerHTML = `
        <div class="ps-left">
            <div class="net-group">
                <div class="net-signal">
                    ${signalBarsHTML}
                </div>
                <span class="net-label">R-NET</span>
            </div>
            <div class="back-trigger" onclick="goBackToHome()">
                <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span class="back-txt">Back</span>
            </div>
        </div>

        <div class="ps-center" id="sys-clock">12:00</div>

        <div class="ps-right">
            ${typeof renderDashboardPerformanceBadge === 'function' ? renderDashboardPerformanceBadge() : ''}
            <span class="batt-val">94%</span>
            <div class="batt-shell">
                <div class="batt-fill"></div>
            </div>
        </div>
    `;

    frame.insertAdjacentElement('afterbegin', bar);

    updateClock();
    if (typeof syncDashboardPerformanceMode === 'function') syncDashboardPerformanceMode(db);
    if (statusClockTimer) clearInterval(statusClockTimer);
    statusClockTimer = setInterval(updateClock, 60 * 1000);
}

const PERIOD_LABELS_EN = {
    '黎明': 'Dawn',
    '早晨': 'Morning',
    '正午': 'Noon',
    '下午': 'Afternoon',
    '傍晚': 'Evening',
    '夜晚': 'Night',
    '午夜': 'Midnight',
    dawn: 'Dawn',
    morning: 'Morning',
    noon: 'Noon',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    midnight: 'Midnight'
};

function getEnglishPeriodLabel(period) {
    if (!period) return 'Unknown';
    if (PERIOD_LABELS_EN[period]) return PERIOD_LABELS_EN[period];
    const lower = typeof period === 'string' ? period.toLowerCase() : '';
    return PERIOD_LABELS_EN[lower] || period;
}

function updateClock() {
    const clockEl = document.getElementById('sys-clock');
    if (!clockEl) return;

    // 使用 MVUZ 游戏时间而非现实时间
    const timeData = db?.world_state?.time;
    if (timeData && timeData.period) {
        const dayNum = timeData.derived?.dayOfYear || 1;
        const periodLabel = getEnglishPeriodLabel(timeData.period);
        clockEl.textContent = `DAY${dayNum}-${periodLabel}`;
    } else {
        clockEl.textContent = 'DAY1-Morning';
    }
}

/* Settings and party card rendering are provided by apps/shared/dashboard/ui-common.js. */

/* ============================================================
   P-SYSTEM DASHBOARD (仪表盘主页)
   9个APP磁贴：Fog, Box, News, Gig, Transit, Map, Mart, Unite, Settings
   ============================================================ */

function renderDashboard() {
    const dashPage = document.getElementById('pg-dashboard');
    if (!dashPage) return;

    const player = db?.player || {};
    const world = db?.world_state || {};
    const playerName = player.name || 'TRAINER';
    // location 可能是对象 {x, y} 或字符串
    const locData = world.location;
    const currLocCode = (typeof locData === 'string' 
        ? locData 
        : (locData?.x !== undefined && locData?.y !== undefined 
            ? getQuadrantFromCoords(locData.x, locData.y) 
            : 'Z')
    ).toUpperCase();
    const currZone = ZoneDB[currLocCode] || { name: 'UNKNOWN', label: '---', color: '#b2bec3', shadow: 'rgba(0,0,0,0.1)' };

    // 计算 Box 使用情况
    const boxCount = Object.keys(player.box || {}).length;
    // 计算队伍数量和生成精灵图标
    const partyData = player.party || {};
    const partySlots = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6'];
    const activePartyCount = partySlots.filter(k => partyData[k]?.name).length;
    
    // 生成 roster HTML (使用 shotx 精灵图)
    let rosterHTML = '';
    partySlots.forEach(slotKey => {
        const mon = partyData[slotKey];
        if (mon?.name) {
            const shotx = mon.shotx || `https://img.pokemondb.net/sprites/scarlet-violet/icon/${mon.name.toLowerCase()}.png`;
            rosterHTML += `
                <div class="roster-slot">
                    <img class="pk-icon" src="${shotx}" alt="${mon.name}">
                </div>
            `;
        } else {
            rosterHTML += `
                <div class="roster-slot">
                    <span class="empty-dot"></span>
                </div>
            `;
        }
    });
    
    const activeStr = activePartyCount < 10 ? `0${activePartyCount}` : `${activePartyCount}`;
    const SVG_POKEBALL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125"><path d="M50,35c7.244,0,13.304,5.161,14.698,12h19.163C82.341,29.628,67.766,16,50,16S17.659,29.628,16.139,47h19.163    C36.696,40.161,42.756,35,50,35z"/><path d="M50,65c-7.244,0-13.304-5.161-14.698-12H16.139C17.659,70.371,32.234,84,50,84s32.341-13.629,33.861-31H64.698    C63.304,59.839,57.244,65,50,65z"/><circle cx="50" cy="50" r="9"/></svg>`;

    // 生成机制能量条 (完整7个)
    const unlocks = db?.player?.unlocks || {};
    const mechanisms = [
        { key: 'enable_mega', label: 'MEGA EVO', code: 'mega' },
        { key: 'enable_z_move', label: 'Z-POWER', code: 'z' },
        { key: 'enable_dynamax', label: 'DYNAMAX', code: 'dmax' },
        { key: 'enable_tera', label: 'TERASTAL', code: 'tera' },
        { key: 'enable_bond', label: 'SYNC.BOND', code: 'bond' },
        { key: 'enable_styles', label: 'HISUI STYLE', code: 'style' },
        { key: 'enable_insight', label: 'INSIGHT', code: 'eye' },
        { key: 'enable_proficiency_cap', label: 'LIMIT BREAK', code: 'cap' }
    ];
    const mechCellsHTML = mechanisms.map(mech => {
        const isActive = unlocks[mech.key];
        return `<div class="cell ${isActive ? 'active' : ''}" data-mech="${mech.code}" data-name="${mech.label}">${getSvgIcon(mech.code)}</div>`;
    }).join('');

    dashPage.innerHTML = `
        <div class="p-hero-dash">
            <div class="hero-main">
                <div class="hero-welcome">SYSTEM READY.</div>
                <div class="hero-name">${playerName}</div>
                <div class="hero-meta-row">
                    <div class="hero-zone" style="background:${currZone.color};box-shadow:2px 2px 0 ${currZone.shadow};"><span>LOC: ZONE-${currLocCode}</span></div>
                    <div class="hero-bag-btn refined" onclick="triggerBagAccessDenied(this)">
                        <div class="hbb-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                            </svg>
                        </div>
                        <span class="hbb-text">ITEMS</span>
                    </div>
                </div>
            </div>
            <div class="mech-wrapper">
                 <button class="mech-btn" type="button" onclick="toggleDashMechBar(this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                 </button>
                 <div class="mech-matrix icon-mode">${mechCellsHTML}</div>
            </div>
        </div>

        <!-- 新的栅格布局结构 (V3修正版) -->
        <div class="mosaic-grid layout-v3">
          
            <!-- PARTY 指挥官核心 (重制大气版) -->
            <div class="tile-party full-width remodel" onclick="openAppPage('party')">
                <div class="tp-bg-decoration">
                    <div class="tp-stripe-bg"></div>
                    <div class="tp-red-glow"></div>
                    <div class="tp-giant-watermark">${SVG_POKEBALL}</div>
                </div>
                <div class="tp-content-left">
                    <div class="tp-top-row">
                        <div class="tp-label-main">ACTIVE UNIT</div>
                    </div>
                    <div class="tp-big-counter">
                        <span class="curr-val">${activeStr}</span>
                        <span class="max-val">/ 06</span>
                    </div>
                </div>
                <div class="tp-roster-container">
                    ${rosterHTML}
                </div>
            </div>

            <!-- BOX: 战术青色 (Cyber Teal) -->
            <div class="live-tile box-tactical theme-teal" onclick="handleTileClick('box')">
                 <div class="t-decoration">
                    <div class="t-watermark">${SystemIcons.box}</div>
                    <div class="t-stripe"></div>
                    <div class="t-glow"></div>
                 </div>
                 <div class="t-content">
                    <div class="t-header">
                        <div class="t-icon-sm">${SystemIcons.box}</div>
                    </div>
                    <div class="t-main-data">
                        <div class="t-num">${boxCount}<small>/ 30</small></div>
                        <div class="t-label">STORAGE</div>
                    </div>
                 </div>
            </div>

            <!-- UNIT: 战术紫色 (Deep Violet) -->
            <div class="live-tile box-tactical theme-purple" onclick="handleTileClick('social')">
                 <div class="t-decoration">
                    <div class="t-watermark">${SystemIcons.unite}</div>
                    <div class="t-stripe"></div>
                    <div class="t-glow"></div>
                 </div>
                 <div class="t-content">
                    <div class="t-header">
                        <div class="t-icon-sm">${SystemIcons.unite}</div>
                    </div>
                    <div class="t-main-data">
                        <div class="t-num">LINK</div>
                        <div class="t-label">RELATION</div>
                    </div>
                 </div>
            </div>

            <!-- MAP: 战术蓝色 (坐标点修正版) -->
            <div class="live-tile box-tactical theme-blue tactical-map-pro tile-tall-map" onclick="openMapSystem()">
                <div class="t-decoration">
                    <div class="map-bg-grid"></div>
                    <div class="t-watermark logo-mode">${SystemIcons.map}</div>
                </div>
                <div class="t-content">
                    <div class="t-header is-dashed">
                        <div class="t-icon-sm">${SystemIcons.map}</div>
                    </div>
                    <div class="t-map-visual">
                        <div class="radar-ping"></div>
                        <div class="map-radar-ring"></div>
                        <div class="map-axis-x"></div>
                        <div class="map-axis-y"></div>
                        <div class="map-point-dot"></div>
                        <div class="corner-L-bra top-l"></div>
                        <div class="corner-L-bra bot-r"></div>
                    </div>
                    <div class="t-main-data map-hud-layout">
                        <div class="mh-bar"></div>
                        <div class="mh-col">
                            <div class="mh-zone">ZONE-${currLocCode}</div>
                            <div class="mh-coords" id="dashboard-map-coords">
                                <span class="coord-display">[${currentMapCoords.x}, ${currentMapCoords.y}]</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧堆叠区：战术插片 (Tactical Blades) -->
            <div class="stack-col">
                <div class="live-tile box-tactical theme-amber small-h user-select-none" onclick="handleTileClick('transit')">
                    <div class="t-decoration">
                         <div class="t-watermark">${SystemIcons.transit}</div>
                         <div class="t-stripe"></div>
                         <div class="t-glow" style="--glow-c:rgba(253, 203, 110, 0.4)"></div>
                    </div>
                    <div class="mini-header-icon">
                        ${SystemIcons.transit}
                    </div>
                    <div class="mini-body">
                        <span class="mini-title-big">TRANSIT</span>
                    </div>
                </div>

                <div class="live-tile box-tactical theme-slate small-h user-select-none disabled">
                    <div class="t-decoration">
                         <div class="t-watermark">${SystemIcons.gig}</div>
                         <div class="t-stripe"></div>
                         <div class="t-glow"></div>
                    </div>
                    <div class="mini-header-icon">
                        ${SystemIcons.gig}
                    </div>
                    <div class="mini-body">
                         <span class="mini-title-big work-locked-title">WORK</span>
                         <span class="locked-badge">LOCKED</span>
                    </div>
                </div>
            </div>
          
            <!-- 底部：微型战术模块 (Mini Tactical Docks) -->
            <div class="bottom-dock-layer">
                <div class="live-tile box-tactical dock-mode dock-news disabled">
                    <div class="t-decoration">
                        <div class="t-stripe is-muted"></div>
                    </div>
                    <div class="dock-content-row">
                        <div class="dock-icon">${SystemIcons.news}</div>
                        <span class="dock-title">NEWS</span>
                        <span class="locked-badge-small">LOCKED</span>
                    </div>
                </div>

                <div class="live-tile box-tactical dock-mode dock-mart disabled">
                    <div class="t-decoration">
                        <div class="t-stripe is-muted"></div>
                        <div class="t-glow" style="--glow-c:rgba(0, 184, 148, 0.4)"></div>
                    </div>
                    <div class="dock-content-row">
                        <div class="dock-icon">${SystemIcons.mart}</div>
                        <span class="dock-title">MART</span>
                        <span class="locked-badge-small">LOCKED</span>
                    </div>
                </div>

                <div class="live-tile box-tactical dock-mode dock-config" onclick="handleTileClick('settings')">
                    <div class="t-decoration">
                    </div>
                    <div class="dock-content-row">
                        <div class="dock-icon">${SystemIcons.settings}</div>
                        <span class="dock-title">SYS.CFG</span>
                    </div>
                </div>
            </div>

        </div>
    `;
}


// Dashboard 机制能量条折叠（通过按钮找相邻元素）
window.toggleDashMechBar = function(btn) {
    const wrapper = btn.closest('.mech-wrapper');
    if (!wrapper) return;
    
    const mechBar = wrapper.querySelector('.mech-matrix');
    if (!mechBar) return;
    
    const isExpanded = mechBar.classList.toggle('expanded');
    btn.classList.toggle('open', isExpanded);
};

// 磁贴点击处理（用于其他磁贴）
window.handleTileClick = function(tileId) {
    console.log('[Dashboard] Tile clicked:', tileId);
    
    // 根据磁贴ID跳转到对应页面
    const pageMap = {
        'box': 'box',
        'social': 'social',
        'settings': 'settings',
        'party': 'party',
        'transit': 'transit'
    };
    
    const targetPage = pageMap[tileId];
    if (targetPage) {
        openAppPage(targetPage);
        // 如果是 transit 页面，需要渲染
        if (targetPage === 'transit') {
            renderTransitPage();
        }
    }
};

/* ============================================================
   MAP 系统接入 - 坐标管理与 MVUZ action
   ============================================================ */

// 当前坐标缓存
let currentMapCoords = { x: 0, y: 0 };

// 根据坐标自动判断象限
function getQuadrantFromCoords(x, y) {
    // Z区（中枢区）：中心 6x6 范围
    if (Math.abs(x) <= 6 && Math.abs(y) <= 6) return "Z";
    // N区（霓虹区）：东南象限
    if (x > 0 && y < 0) return "N";
    // B区（海滨区）：西南象限
    if (x < 0 && y < 0) return "B";
    // S区（暗影区）：东北象限
    if (x > 0 && y > 0) return "S";
    // A区（极诣区）：西北象限
    if (x < 0 && y > 0) return "A";
    return "Z";
}

// 更新 Dashboard 磁贴坐标显示
function updateCoordsDisplay(coords) {
    const el = document.getElementById('dashboard-map-coords');
    if (el && coords) {
        el.innerHTML = `<span class="coord-display">[${coords.x}, ${coords.y}]</span>`;
    }
}

function getCurrentBridgeLocation() {
    return db?.world?.location || db?.world_state?.location || null;
}

function setLocalMapLocation(location) {
    if (!location || typeof location.x !== 'number' || typeof location.y !== 'number') return;
    const nextLocation = {
        ...location,
        region: location.region || getRegionByCoords(location.x, location.y)
    };
    currentMapCoords = { x: nextLocation.x, y: nextLocation.y };
    updateCoordsDisplay(currentMapCoords);
    if (db) {
        db.world = db.world && typeof db.world === 'object' ? db.world : {};
        db.world_state = db.world_state && typeof db.world_state === 'object' ? db.world_state : {};
        db.world.location = { ...(db.world.location || {}), ...nextLocation };
        db.world_state.location = { ...(db.world_state.location || {}), ...nextLocation };
    }
}

async function requestMapEnvironmentUpdate(location, options = {}) {
    if (!location || typeof location.x !== 'number' || typeof location.y !== 'number') {
        throw new Error('invalid map coordinates');
    }
    const payload = {
        location: {
            x: location.x,
            y: location.y,
            region: location.region || getRegionByCoords(location.x, location.y)
        },
        force: options.force === true,
        daily: options.daily === true,
        replaceGrids: options.replaceGrids === true,
        inject: options.inject === true,
        reason: options.reason || 'mapEnvironment'
    };
    setLocalMapLocation(payload.location);
    const result = await postMapEnvironmentRequest(payload, {
        source: options.source || 'dashboard-main:map'
    });
    console.log('[PKM] 地图环境请求已确认:', payload.location);
    return result;
}

// 打开 MAP 系统
window.openMapSystem = function() {
    console.log('[PKM] 打开地图系统...');
    
    // 获取手机容器
    const container = document.querySelector('.ver-dawn-frame');
    if (!container) {
        console.error('[PKM] 找不到手机容器 .ver-dawn-frame');
        return;
    }
    
    // 创建模态框（相对于手机容器）
    let modal = document.getElementById('map-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'map-modal';
        modal.className = 'map-modal';
        modal.innerHTML = `
            <div class="map-modal-header">
                <span class="map-modal-title">TACTICAL MAP</span>
                <div class="map-modal-actions">
                    <button class="map-modal-fullscreen" onclick="toggleMapFullscreen()" title="全屏">⛶</button>
                    <button class="map-modal-close" onclick="closeMapSystem()">✕</button>
                </div>
            </div>
            <iframe id="map-iframe" frameborder="0"></iframe>
        `;
        container.appendChild(modal);
        
        // 加载 MAP iframe
        const iframe = document.getElementById('map-iframe');
        
        // 使用外部文件加载（更稳定）
        console.log('[PKM] 加载 MAP 文件');
        iframe.src = 'map/index.html';
        iframe.onload = function() {
            setupMapCallbacks(iframe);
            if (typeof syncDashboardPerformanceMode === 'function') syncDashboardPerformanceMode(db);

            // 加载完成后立即发送当前 main map 状态
            if (db && db.player) {
                forwardMapStateToMap('mapIframeLoad');
            }
        };
    }
    
    modal.classList.add('active');
};

// 关闭 MAP 系统
window.closeMapSystem = function() {
    const modal = document.getElementById('map-modal');
    if (!modal) return;
    
    // 如果在全屏模式，先退出全屏
    if (modal.classList.contains('fullscreen')) {
        // 通知父级窗口退出全屏
        const message = { type: 'PKM_MAP_FULLSCREEN', fullscreen: false };
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage(message, '*');
            }
            if (window.top && window.top !== window && window.top !== window.parent) {
                window.top.postMessage(message, '*');
            }
        } catch (e) {
            console.error('[PKM] postMessage 发送失败:', e);
        }
        modal.classList.remove('fullscreen');
        document.body.classList.remove('map-fullscreen-active');
        console.log('[PKM] MAP 关闭时退出全屏');
    }
    
    // 关闭 MAP 模态框
    modal.classList.remove('active');
};

// 切换 MAP 全屏模式
window.toggleMapFullscreen = function() {
    const modal = document.getElementById('map-modal');
    if (!modal) return;
    
    const isFullscreen = modal.classList.toggle('fullscreen');
    document.body.classList.toggle('map-fullscreen-active', isFullscreen);
    
    // 更新按钮图标
    const btn = modal.querySelector('.map-modal-fullscreen');
    if (btn) {
        btn.textContent = isFullscreen ? '⛶' : '⛶';
        btn.title = isFullscreen ? '退出全屏' : '全屏';
    }
    
    // 通知父级窗口调整 PKM 容器大小（main 专属协议）
    const message = {
        type: 'PKM_MAP_FULLSCREEN',
        fullscreen: isFullscreen
    };
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, '*');
            console.log('[PKM] ✓ 已发送全屏消息到 parent');
        }
        if (window.top && window.top !== window && window.top !== window.parent) {
            window.top.postMessage(message, '*');
            console.log('[PKM] ✓ 已发送全屏消息到 top');
        }
    } catch (e) {
        console.error('[PKM] postMessage 发送失败:', e);
    }
    
    // 通知 map iframe 调整大小
    const iframe = document.getElementById('map-iframe');
    if (iframe && iframe.contentWindow) {
        setTimeout(() => {
            iframe.contentWindow.postMessage({ type: 'MAP_RESIZE' }, '*');
        }, 100);
    }
    
    console.log('[PKM] MAP 全屏模式:', isFullscreen ? '开启' : '关闭');
};

// 设置 MAP iframe 的回调
function setupMapCallbacks(iframe) {
    try {
        const mapWindow = iframe.contentWindow;
        
        // 设置位置变更回调
        mapWindow.onPlayerLocationChange = function(coords) {
            console.log('[PKM] 收到位置变更:', coords);
            requestMapEnvironmentUpdate(coords, {
                reason: 'mapDrag',
                inject: true
            }).catch((error) => {
                console.error('[PKM] 地图位置写入失败:', error);
                showPkmActionFailure(`地图位置写入失败：${error.message}`);
            });
        };
        
        // 设置地图加载完成回调
        mapWindow.onMapReady = function() {
            console.log('[PKM] 地图加载完成，设置初始位置');
            
            // 从 main 状态设置初始位置
            const bridgeLocation = getCurrentBridgeLocation();
            if (bridgeLocation && typeof bridgeLocation === 'object' && typeof bridgeLocation.x === 'number') {
                console.log('[PKM] 从 main 状态设置地图初始位置:', bridgeLocation);
                if (typeof mapWindow.setPlayerPosition === 'function') {
                    mapWindow.setPlayerPosition(bridgeLocation);
                }
            }
            
            // 获取初始坐标
            if (typeof mapWindow.getPlayerDisplayCoords === 'function') {
                const initialCoords = mapWindow.getPlayerDisplayCoords();
                currentMapCoords = initialCoords;
                updateCoordsDisplay(initialCoords);
            }
            if (typeof syncDashboardPerformanceMode === 'function') syncDashboardPerformanceMode(db);
            forwardMapStateToMap('mapReady');
        };
        
        console.log('[PKM] MAP 回调设置完成');
    } catch (e) {
        console.warn('[PKM] 无法设置 MAP 回调:', e);
    }
}

async function handleMapJourneyConfirm(data) {
    const location = data?.location || {};
    const inputText = typeof data?.text === 'string' ? data.text : '';
    const source = data?.source || 'dashboard-main:map-journey';
    const noticeTitle = data?.noticeTitle || 'JOURNEY READY';
    const noticeMessage = data?.noticeMessage || '旅途提示已写入酒馆输入栏';
    try {
        if (typeof location.x === 'number' && typeof location.y === 'number') {
            await requestMapEnvironmentUpdate({
                x: location.x,
                y: location.y,
                region: location.region || getRegionByCoords(location.x, location.y)
            }, {
                reason: 'mapJourney',
                inject: true
            });
        }
        await postTavernInput(inputText, { source });
        showDashboardNotice(noticeTitle, noticeMessage, true);
    } catch (error) {
        console.error('[PKM] 旅途写入失败:', error);
        showPkmActionFailure(`旅途写入失败：${error.message}`);
    }
}

async function handleMapTavernInput(data) {
    const inputText = typeof data?.text === 'string' ? data.text : '';
    const source = data?.source || 'dashboard-main:map';
    const noticeTitle = data?.noticeTitle || 'INPUT READY';
    const noticeMessage = data?.noticeMessage || '地图提示已写入酒馆输入栏';
    try {
        await postTavernInput(inputText, { source });
        showDashboardNotice(noticeTitle, noticeMessage, true);
    } catch (error) {
        console.error('[PKM] 地图输入栏写入失败:', error);
        showPkmActionFailure(`地图输入栏写入失败：${error.message}`);
    }
}

window.injectLocationContext = function() {
    return postMapContextRequest('inject', {
        force: true,
        reason: 'dashboardManualInject',
        source: 'dashboard-main:map-context'
    });
};

window.clearLocationContextInjection = function() {
    return postMapContextRequest('clear', {
        reason: 'dashboardManualClear',
        source: 'dashboard-main:map-context'
    });
};
