/* ============================================================
   SHARED DASHBOARD RUNTIME ADAPTER (Universal)
   ============================================================ */
DashboardBridgeClient.install({
    product: 'universal',
    defaultInputSource: 'dashboard-universal'
});
DashboardMovePool.install({
    product: 'dashboard-universal',
    getDb: () => db,
    actionSource: 'dashboard-universal:move-pool',
    narrativeTitle: 'Move configuration updated',
    narrativeLine: (displayName) => `请简短描写 ${displayName} 调整技能、训练家确认配置的场景。`
});
DashboardBoxManager.install({
    product: 'dashboard-universal',
    getDb: () => db,
    boxInputSource: 'dashboard-universal:box',
    getZoneName: (state) => ZoneDB[(state.world?.location || 'Z')]?.label || '未知区域'
});
DashboardPartyRenderer.install({
    product: 'dashboard-universal',
    getDb: () => db
});
DashboardSettings.install({
    product: 'dashboard-universal',
    getDb: () => db,
    setDb: (nextDb) => { db = nextDb; },
    defaultSettings: () => DefaultSettings
});

/* ============================================================
   MVU STATE BRIDGE - 从酒馆当前楼层 stat_data.pkm 读取数据
   ============================================================ */

// 数据容器（初始为空，由 MVU bridge 填充）
let db = null;
const DefaultSettings = {
    enableAVS: true,
    enableCommander: true,
    enableEVO: true,
    enableBGM: true,
    enableSFX: true,
    enableClash: false,
    enableEnvironment: true,
    enableBattlePerformanceMode: false,
    enableBattlePortraitMode: false,
    enableEnemyStrategicSwitching: true
};
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
        product: 'universal',
        target: 'dashboard-universal'
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
    if (handlePkmActionResultMessage(event.data)) {
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
            npcs: bridgePayload.npcs || {}
        });
        const now = Date.now();
        if (payloadKey === lastBridgePayloadKey && now - lastBridgePayloadAt < 1500) {
            console.log('[PKM] 跳过重复桥接刷新', event.data.type);
            return;
        }
        lastBridgePayloadKey = payloadKey;
        lastBridgePayloadAt = now;
        handleRefreshDebounced(event.data);
        return;
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
            refreshDebounceTimer = null;
            return;
        }
        
        if (typeof ensureSettingsDefaults === 'function') ensureSettingsDefaults();
        if (typeof syncDashboardPerformanceMode === 'function') syncDashboardPerformanceMode(db);
        
        // 刷新所有界面
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderPartyList === 'function') renderPartyList();
        if (typeof renderSettings === 'function') renderSettings();
        if (typeof renderBoxPage === 'function') renderBoxPage();
        if (typeof renderSocialList === 'function') renderSocialList();
        if (typeof updateStatusLocation === 'function') updateStatusLocation();
        
        refreshDebounceTimer = null;
    }, 100);
}

// 加载 MVU 桥接数据到 db（从父窗口推送的 window.pkmBridgeData 获取）
function loadBridgeData() {
    console.log('[PKM] 正在加载 MVU 桥接数据...');
    const hosted = isHostedBridgeMode();
    const bridgeData = window.pkmBridgeData;
    if (bridgeData && bridgeData.player) {
        applyPkmBridgeData(bridgeData, 'initial');
        console.log('[PKM] ✓ MVU 桥接数据加载成功', db.player?.name);
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
        world: {
            location: { region: '', location: '' },
            time: { period: 'morning' }
        },
        npcs: {
            records: {}
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

/* ============================================================
   PERSISTENT STATUS BAR (GLOBAL HUD)
   ============================================================ */
function formatStatusLocation(world = db?.world) {
    const loc = world?.location && typeof world.location === 'object' ? world.location : {};
    const region = typeof loc.region === 'string' && loc.region.trim()
        ? loc.region.trim()
        : '';
    const place = typeof loc.location === 'string' && loc.location.trim()
        ? loc.location.trim()
        : '';
    const parts = [region, place].filter(Boolean);
    return parts.length ? parts.join(' · ').toUpperCase() : 'UNKNOWN AREA';
}

function updateStatusLocation() {
    const label = document.getElementById('world-location-label');
    if (label) label.textContent = formatStatusLocation();
}

function initStickyStatusBar() {
    const frame = document.querySelector('.ver-dawn-frame');
    if (!frame) return;

    const existing = frame.querySelector('#sticky-status-bar');
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.id = 'sticky-status-bar';
    bar.className = 'p-status-bar';
    
    // 默认满格信号
    const signalBarsHTML = Array.from({length: 4}, () => 
        `<div class="n-bar active"></div>`
    ).join('');
    
    bar.innerHTML = `
        <div class="ps-left">
            <div class="net-group">
                <div class="net-signal">
                    ${signalBarsHTML}
                </div>
                <div class="net-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <div class="back-trigger" onclick="goBackToHome()">
                <svg class="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span class="back-txt">Back</span>
            </div>
        </div>

        <div class="ps-center">
            <span id="world-location-label" class="location-label"></span>
        </div>

        <div class="ps-right">
            ${typeof renderDashboardPerformanceBadge === 'function' ? renderDashboardPerformanceBadge() : ''}
            <span class="batt-val">94%</span>
            <div class="batt-shell">
                <div class="batt-fill"></div>
            </div>
        </div>
    `;

    frame.insertAdjacentElement('afterbegin', bar);
    updateStatusLocation();
    if (typeof syncDashboardPerformanceMode === 'function') syncDashboardPerformanceMode(db);
}

/* Party rendering and settings are installed from apps/shared/dashboard/ui-common.js. */

/* ============================================================
   RENDER SOCIAL LIST (Universal NPC relation grid)
   ============================================================ */

const RelationMeta = {
    '-2': { label: 'HOSTILE', color: '#2d3436', light: '#b2bec3', icon: '!', desc: 'Open conflict' },
    '-1': { label: 'WARY',    color: '#e17055', light: '#fab1a0', icon: '-', desc: 'Cautious or tense' },
    '0':  { label: 'NEUTRAL', color: '#636e72', light: '#dfe6e9', icon: '0', desc: 'Neutral contact' },
    '1':  { label: 'KNOWN',   color: '#0984e3', light: '#74b9ff', icon: '+', desc: 'Known contact' },
    '2':  { label: 'TRUSTED', color: '#00b894', light: '#55efc4', icon: 'T', desc: 'Trusted ally' },
    '3':  { label: 'ALLIED',  color: '#6c5ce7', light: '#c7c2ff', icon: 'A', desc: 'Close ally' },
    '4':  { label: 'BONDED',  color: '#d4a017', light: '#ffeaa7', icon: 'B', desc: 'Strong bond' }
};

const NPCAvatarBaseUrl = 'https://raw.githack.com/hasheeper/pkm33/main/data/avatar/';
const FallbackNpcAvatar = 'https://img.pokemondb.net/sprites/black-white/anim/normal/unown-q.gif';

const NPCTriggerAliases = {
    lusamine: ['Lusamine', 'ルザミーネ', '露莎米奈', '露莎米那', '露莎米恩', '卢莎米奈'],
    erika: ['Erika', 'エリカ', '莉佳', '艾莉嘉'],
    roxie: ['Roxie', 'Homika', 'ホミカ', '霍米加', '霍米卡'],
    iono: ['Iono', 'Nanjamo', 'ナンジャモ', '奇树', '奇樹'],
    marnie: ['Marnie', 'マリィ', '玛俐', '瑪俐', '真俐'],
    cynthia: ['Cynthia', 'Shirona', 'シロナ', '竹兰', '竹蘭', '希罗娜', '希羅娜'],
    bea: ['Saito', 'サイトウ', '彩豆'],
    sonia: ['Sonia', 'ソニア', '索妮亚', '索妮亞'],
    gloria: ['Gloria', 'Yuuri', 'ユウリ', '小优', '小優', '優莉'],
    rosa: ['Rosa', 'メイ', '鸣依', '鳴依', '芽以'],
    dawn: ['Hikari', 'ヒカリ', '小光'],
    serena: ['Serena', 'セレナ', '莎莉娜', '瑟蕾娜', '瑟琳娜'],
    irida: ['Irida', 'カイ', '珠贝', '珠貝'],
    akari: ['Akari', 'ショウ', '小照'],
    nessa: ['Nessa', 'Rurina', 'ルリナ', '露璃娜'],
    mallow: ['Mallow', 'マオ', '玛奥', '瑪奧', '玛沃'],
    lana: ['Suiren', 'スイレン', '水莲', '水蓮'],
    lillie: ['Lillie', 'Lilie', 'リーリエ', '莉莉艾', '莉莉愛', '莉莉安'],
    hex: ['Hex Maniac', 'Occult Maniac', 'オカルトマニア', '灵异迷', '靈異迷', '海可丝'],
    selene: ['Selene', 'Mizuki', 'ミヅキ', '美月'],
    juliana: ['Juliana', 'アオイ', '小青'],
    may: ['Haruka', 'ハルカ', '小遥', '小遙'],
    lacey: ['Lacey', 'Nerine', 'ネリネ', '紫竽', '紫玉', '紫芋'],
    misty: ['Misty', 'Kasumi', 'カスミ', '小霞'],
    acerola: ['Acerola', 'アセロラ', '阿塞萝拉', '阿塞蘿拉', '阿塞罗拉'],
    skyla: ['Skyla', 'Fuuro', 'フウロ', '风露', '風露'],
    iris: ['Iris', 'アイリス', '艾莉丝', '艾莉絲', '艾丽丝'],
    nemona: ['Nemona', 'ネモ', '妮莫', '尼莫']
};

const SpriteAlias = {
    hex: 'hexmaniac-gen6',
    hexmaniac: 'hexmaniac-gen6',
    juliana: 'juliana-s',
    nemona: 'nemona-s'
};

const AvatarFixes = {
    hex: 'hexmaniac',
    mallows: 'mallow',
    mallow: 'mallow'
};

const NPCAliasLookup = Object.entries(NPCTriggerAliases).reduce((lookup, [key, aliases]) => {
    lookup[key] = key;
    aliases.forEach((alias) => {
        lookup[String(alias).toLowerCase().trim()] = key;
    });
    return lookup;
}, {});

function clampRelationNumber(value, min, max, fallback = 0) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
}

function deriveRelationStage(love) {
    const value = clampRelationNumber(love, 0, 255, 0);
    if (value <= 31) return -2;
    if (value <= 63) return -1;
    if (value <= 127) return 0;
    if (value <= 159) return 1;
    if (value <= 191) return 2;
    if (value <= 223) return 3;
    return 4;
}

function normalizeNpcId(value, separator = '_') {
    return String(value || '')
        .toLowerCase()
        .trim()
        .replace(/[’']/g, '')
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, separator)
        .replace(new RegExp(`${separator}+`, 'g'), separator)
        .replace(new RegExp(`^${separator}|${separator}$`, 'g'), '');
}

function resolveCanonicalNpcId(npcName) {
    const raw = String(npcName || '').trim();
    if (!raw) return '';
    const lower = raw.toLowerCase();
    if (NPCAliasLookup[lower]) return NPCAliasLookup[lower];
    const normalized = normalizeNpcId(raw, '_');
    if (NPCAliasLookup[normalized]) return NPCAliasLookup[normalized];
    const head = normalized.split('_')[0];
    return NPCAliasLookup[head] || normalized;
}

function getNpcPortraitSources(npcName) {
    const canonical = resolveCanonicalNpcId(npcName);
    if (!canonical) return [FallbackNpcAvatar];

    const avatarBase = canonical.split('_')[0];
    const avatarKey = AvatarFixes[canonical] || AvatarFixes[avatarBase] || avatarBase;
    const trainerFull = normalizeNpcId(canonical, '-').replace(/[^a-z0-9-]/g, '');
    const trainerBase = trainerFull.split('-')[0];
    const trainerSlug = SpriteAlias[trainerFull] || SpriteAlias[trainerBase] || trainerFull;
    const trainerBaseSlug = SpriteAlias[trainerBase] || trainerBase;

    return [
        trainerSlug ? `https://play.pokemonshowdown.com/sprites/trainers/${trainerSlug}.png` : '',
        trainerBaseSlug && trainerBaseSlug !== trainerSlug ? `https://play.pokemonshowdown.com/sprites/trainers/${trainerBaseSlug}.png` : '',
        `${NPCAvatarBaseUrl}${avatarKey}.png`,
        FallbackNpcAvatar
    ].filter(Boolean).filter((url, index, list) => list.indexOf(url) === index);
}

window.handleNpcPortraitError = function handleNpcPortraitError(img) {
    if (!img) return;
    let sources = [];
    try {
        sources = JSON.parse(img.dataset.sources || '[]');
    } catch (_) {
        sources = [];
    }
    const nextIndex = Number(img.dataset.sourceIndex || 0) + 1;
    if (sources[nextIndex]) {
        img.dataset.sourceIndex = String(nextIndex);
        img.src = sources[nextIndex];
        return;
    }
    img.style.opacity = '0.25';
};

function formatNpcDisplayName(key) {
    const normalized = String(key || '').trim().replace(/[-_]+/g, ' ');
    return normalized || 'Unknown';
}

function getNpcRecords() {
    const records = db?.npcs?.records;
    return isPlainRecord(records) ? records : {};
}

function renderSocialList() {
    const socialPage = document.getElementById('pg-social');
    if (!socialPage) return;

    const npcs = getNpcRecords();
    const npcKeys = Object.keys(npcs).filter((key) => isPlainRecord(npcs[key]));
    npcKeys.sort((a, b) => {
        const loveA = clampRelationNumber(npcs[a]?.love, 0, 255, 0);
        const loveB = clampRelationNumber(npcs[b]?.love, 0, 255, 0);
        const stageA = deriveRelationStage(loveA);
        const stageB = deriveRelationStage(loveB);
        if (stageB !== stageA) return stageB - stageA;
        if (loveB !== loveA) return loveB - loveA;
        return a.localeCompare(b);
    });

    const gridHtml = npcKeys.length
        ? `<div id="social-grid-view">${npcKeys.map((key) => createNPCCard(key, npcs[key])).join('')}</div>`
        : `<div id="social-grid-view" class="empty"><div class="empty-placeholder">NO CONTACTS</div></div>`;

    socialPage.innerHTML = `
        <div class="team-header-dash">
             <div class="th-title">RELATION NETWORK</div>
             <div class="th-status-grp">
                 <div class="th-count">${npcKeys.length} <small>CONTACTS</small></div>
             </div>
        </div>
        ${gridHtml}
    `;
}

function createNPCCard(key, npcData) {
    const loveVal = clampRelationNumber(npcData?.love, 0, 255, 0);
    const stage = String(deriveRelationStage(loveVal));
    const meta = RelationMeta[stage] || RelationMeta['0'];
    const portraitSources = getNpcPortraitSources(key);
    const portraitUrl = portraitSources[0];
    const percent = Math.min(100, Math.max(0, (loveVal / 255) * 100));
    const displayName = formatNpcDisplayName(key);

    return `
    <div class="npc-card" data-stage="${stage}" style="--r-color:${meta.color}" title="${escapeHtml(meta.desc)}">
        <div class="npc-portrait">
            <img src="${escapeHtml(portraitUrl)}" loading="lazy" alt="${escapeHtml(displayName)}"
                 data-sources="${escapeHtml(JSON.stringify(portraitSources))}" data-source-index="0"
                 onerror="window.handleNpcPortraitError && window.handleNpcPortraitError(this)">
        </div>
        <div class="npc-info-shade">
            <div class="n-header">
                <span class="n-name">${escapeHtml(displayName)}</span>
                <span class="n-stage-icon">${escapeHtml(meta.icon)}</span>
            </div>
            <div class="n-bar-box">
                <div class="n-bar-label">
                    <span style="color:${meta.color}">${escapeHtml(meta.label)}</span>
                    <span>${loveVal}<small style="opacity:0.5;font-weight:500;"> pts</small></span>
                </div>
                <div class="progress-track" style="background:${meta.light}">
                    <div class="progress-fill" style="width:${percent}%"></div>
                </div>
            </div>
        </div>
    </div>
    `;
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
    const world = db?.world || {};
    const playerName = player.name || 'TRAINER';

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
    const npcCount = Object.keys(db?.npcs?.records || {}).length;
    const location = world?.location && typeof world.location === 'object' ? world.location : {};
    const mapRegion = typeof location.region === 'string' && location.region.trim()
        ? location.region.trim().toUpperCase()
        : 'UNKNOWN';
    const mapPlace = typeof location.location === 'string' && location.location.trim()
        ? location.location.trim().toUpperCase()
        : 'UNKNOWN';
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
            <div class="live-tile box-tactical theme-teal tile-box" onclick="handleTileClick('box')">
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

            <!-- RELATION: 通用关系网 -->
            <div class="live-tile box-tactical theme-purple tile-relation" onclick="handleTileClick('relation')">
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
                        <div class="t-num">${npcCount}</div>
                        <div class="t-label">RELATION</div>
                    </div>
                 </div>
            </div>

            <!-- MAP: 只显示当前位置摘要，不进入地图页 -->
            <div class="live-tile box-tactical theme-blue small-h tile-map-static user-select-none" aria-disabled="true">
                 <div class="t-decoration">
                    <div class="t-watermark">${SystemIcons.map}</div>
                    <div class="t-stripe"></div>
                    <div class="t-glow"></div>
                 </div>
                 <div class="mini-header-icon">${SystemIcons.map}</div>
                 <div class="mini-body map-summary-data">
                    <span class="map-summary-line region">${mapRegion}</span>
                    <span class="map-summary-line place">${mapPlace}</span>
                 </div>
            </div>

            <!-- SETTINGS: 战术灰色 (Config Gray) -->
            <div class="live-tile box-tactical theme-slate small-h tile-settings user-select-none" onclick="handleTileClick('settings')">
                 <div class="t-decoration">
                    <div class="t-watermark">${SystemIcons.settings}</div>
                    <div class="t-stripe"></div>
                    <div class="t-glow"></div>
                 </div>
                 <div class="mini-header-icon">${SystemIcons.settings}</div>
                 <div class="mini-body">
                    <span class="mini-title-big">SYS.CFG</span>
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
        'settings': 'settings',
        'party': 'party',
        'relation': 'social'
    };
    
    const targetPage = pageMap[tileId];
    if (targetPage) {
        openAppPage(targetPage);
    }
};
