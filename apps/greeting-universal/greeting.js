// 设置宿主 iframe 尺寸，确保在酒馆内展开显示
(function() {
    const hostFrame = window.frameElement;
    function resizeHostFrame() {
        if (!hostFrame) return;
        const width = Math.min(window.innerWidth || 480, 480);
        const height = 850;
        hostFrame.style.width = width + 'px';
        hostFrame.style.maxWidth = '100%';
        hostFrame.style.height = height + 'px';
        hostFrame.style.minHeight = height + 'px';
        hostFrame.style.border = 'none';
    }
    resizeHostFrame();
    window.addEventListener('resize', resizeHostFrame);
})();

/**
 * 配置数据表 (Manifest)
 * 包含 前端 UI显示用信息 & 给 AI 插入的 unlock keys
 */
const GenesisData = [
    { 
        id: 1, name: 'Kanto', code: 'gen1', 
        starters: [ 'bulbasaur', 'charmander', 'squirtle' ],
        desc: 'Special: Proficiency / Level Break' 
    },
    { 
        id: 2, name: 'Johto', code: 'gen2', 
        starters: [ 'chikorita', 'cyndaquil', 'totodile' ],
        desc: 'Special: Apricorn Ball Mechanics' 
    },
    { 
        id: 3, name: 'Hoenn', code: 'gen3', 
        starters: [ 'treecko', 'torchic', 'mudkip' ],
        mechanics: ['enable_clash', 'enable_environment'], 
        desc: 'Special: Move Clash / Weather' 
    },
    { 
        id: 4, name: 'Sinnoh', code: 'gen4', 
        starters: [ 'turtwig', 'chimchar', 'piplup' ],
        mechanics: [], 
        desc: 'Classic Battle Systems' 
    },
    { 
        id: 5, name: 'Unova', code: 'gen5', 
        starters: [ 'snivy', 'tepig', 'oshawott' ],
        mechanics: ['enable_environment'], 
        desc: 'Triple Battle Logic / Weather' 
    },
    { 
        id: 6, name: 'Kalos', code: 'gen6', 
        starters: [ 'chespin', 'fennekin', 'froakie' ],
        mechanics: ['enable_mega'], 
        desc: 'Mechanic: Mega Evolution Unlocked' 
    },
    { 
        id: 7, name: 'Alola', code: 'gen7', 
        starters: [ 'rowlet', 'litten', 'popplio' ],
        mechanics: ['enable_z_move'], 
        desc: 'Mechanic: Z-Power / Ride Pkm' 
    },
    { 
        id: 8, name: 'Galar', code: 'gen8', 
        starters: [ 'grookey', 'scorbunny', 'sobble' ],
        mechanics: ['enable_dynamax'], 
        desc: 'Mechanic: Dynamax Spots' 
    },
    { 
        id: 0, name: 'Hisui', code: 'pla', 
        starters: [ 'rowlet', 'cyndaquil', 'oshawott' ],
        mechanics: ['enable_styles', 'enable_clash'],
        formSuffix: '-hisui', // 用于最终数据标记
        desc: 'Specific: Agile / Strong Style Arts' 
    },
    { 
        id: 9, name: 'Paldea', code: 'gen9', 
        starters: [ 'sprigatito', 'fuecoco', 'quaxly' ],
        mechanics: ['enable_tera'], 
        desc: 'Mechanic: Tera Type Shell' 
    },
    {
        id: 888,
        name: 'M8 Class',
        code: 'wcs_unlocked',
        starters: [],
        locked: false,
        classTheme: 'theme-wcs',
        desc: 'STATE: OPEN TO REGISTRATION__',
        teaser: 'MASTERS EIGHT'
    },
    { 
        id: 99, name: 'CUSTOM', code: 'custom',
        starters: [],
        userDefine: true,
        mechanics: [],
        desc: 'Build Your Own World Configuration'
    }
];

// 全局状态
const State = {
    selectedGenIndex: -1,
    selectedStarter: null, // string 'charmander' etc.
    animeMode: true,
    m8RankTier: 1, // 新增：用于记录 M8 的段位模式 (1:新手, 2:选手, 3:大师)
    m8TeamData: {} // Key: slot index => team config object
};

const UI = {
    genList: document.getElementById('gen-list'),
    detailArea: document.getElementById('detail-area'),
    regionName: document.getElementById('region-name'),
    featureList: document.getElementById('feature-list'),
    renderZone: document.getElementById('render-zone')
};

// 辅助：获取图片 (与 Universal 版一致的逻辑)
function getSprite(name) {
    if(!name) return; 
    // 使用 PokemonDB 作为稳定源
    return `https://img.pokemondb.net/sprites/scarlet-violet/normal/${name}.png`;
}

function getSvgIcon(code) {
    const svgs = {
        'mega': '<svg viewBox="0 0 14 17.5" fill="currentColor"><g><path d="M3.88792,10.9 C5.96264,10.9,8.03736,10.9,10.1121,10.9 C11.0183,10.9426,11.0183,9.45744,10.1121,9.5 C8.03736,9.5,5.96264,9.5,3.88792,9.5 C2.98166,9.45744,2.98166,10.9426,3.88792,10.9 z"/><path d="M2.75289,2 C2.75289,2.10488,2.75289,2.20976,2.75289,2.31464 C2.75355,4.80881,4.40963,6.99632,6.81004,7.67374 C8.60567,8.17928,9.84777,9.81993,9.84711,11.6854 C9.84711,11.7903,9.84711,11.8951,9.84711,12 C9.80455,12.9063,11.2897,12.9063,11.2471,12 C11.2471,11.8951,11.2471,11.7903,11.2471,11.6854 C11.2464,9.19119,9.59033,7.00368,7.18992,6.32626 C5.39429,5.82072,4.15223,4.18007,4.15289,2.31464 C4.15289,2.20976,4.15289,2.10488,4.15289,2 C4.19545,1.09374,2.71033,1.09374,2.75289,2 z"/><g><path d="M6.99988,6.26793 C6.93733,6.28879,6.87403,6.30825,6.81004,6.32626 C4.40962,7.00368,2.75355,9.1912,2.75289,11.6854 C2.75289,11.6854,2.75289,12,2.75289,12 C2.71033,12.9063,4.19545,12.9063,4.15289,12 C4.15289,12,4.15289,11.6854,4.15289,11.6854 C4.15223,9.81992,5.3943,8.17928,7.18992,7.67374 C7.73053,7.52117,8.23338,7.29202,8.68807,7.00001 C8.23346,6.70808,7.73068,6.47894,7.19012,6.32632 C7.12599,6.30829,7.06257,6.28881,6.99988,6.26793 z"/><path d="M8.21185,5.62527 C9.21994,4.85339,9.84758,3.64081,9.84711,2.31464 C9.84711,2.31464,9.84711,2,9.84711,2 C9.80455,1.09375,11.2897,1.09374,11.2471,2 C11.2471,2,11.2471,2.31464,11.2471,2.31464 C11.2467,3.88075,10.5936,5.32595,9.51336,6.35232 C9.1132,6.06454,8.67745,5.81966,8.21185,5.62527 z"/></g><g><path d="M6.02737,4.5 C6.02737,4.5,10.1121,4.5,10.1121,4.5 C11.0183,4.54256,11.0183,3.05744,10.1121,3.1 C10.1121,3.1,5.2513,3.1,5.2513,3.1 C5.38672,3.62909,5.65656,4.11049,6.02737,4.5 z"/></g></g></svg>',
        'z': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.25 2L4 13h6l-2 9 9.5-12H10l3-8z"/></svg>',
        'dmax': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 3.5l6.5 13h-13L12 5.5zM12 8l-2 4h4l-2-4z"/></svg>',
        'tera': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-9.5 5.5v9L12 22l9.5-5.5v-9L12 2zM12 19.5L5.5 15.8v-7.6L12 4.5l6.5 3.7v7.6L12 19.5z"/><path d="M12 7.5L8 10l4 2.5 4-2.5-4-2.5z"/></svg>',
        'bond': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
        'style': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 93.75" fill="currentColor"><path transform="scale(.75)" d="m50 5.8594c-11.79 0-22.876 4.5903-31.213 12.928-8.3374 8.3366-12.928 19.422-12.928 31.213s4.5903 22.874 12.928 31.211c2.8053 2.8061 5.9253 5.1857 9.2754 7.1113-2.8564-4.2252-4.5273-9.3145-4.5273-14.787 0-14.593 11.872-26.465 26.465-26.465 11.362 0 20.605-9.2438 20.605-20.605s-9.2438-20.605-20.605-20.605zm21.939 5.8184c2.8572 4.2252 4.5254 9.3146 4.5254 14.787 0 14.593-11.872 26.465-26.465 26.465-11.362 0-20.605 9.2438-20.605 20.605s9.2438 20.605 20.605 20.605c11.79 0 22.876-4.5923 31.213-12.93 8.3374-8.3367 12.928-19.42 12.928-31.211s-4.5903-22.876-12.928-31.213c-2.8053-2.8061-5.9234-5.1837-9.2734-7.1094zm-21.939 3.0625c6.4652 0 11.725 5.2602 11.725 11.725 0 6.4644-5.2595 11.723-11.725 11.723-6.4652 0-11.725-5.2575-11.725-11.723-2e-6 -6.4651 5.2595-11.725 11.725-11.725zm0 5.8594c-3.2341 0-5.8652 2.6311-5.8652 5.8652-2e-6 3.2341 2.6311 5.8633 5.8652 5.8633 3.2341 0 5.8652-2.6292 5.8652-5.8633 0-3.2341-2.6311-5.8652-5.8652-5.8652zm0 41.211c6.4652 0 11.725 5.2594 11.725 11.725s-5.2595 11.723-11.725 11.723c-6.4652 0-11.725-5.2575-11.725-11.723-2e-6 -6.4652 5.2595-11.725 11.725-11.725zm0 5.8594c-3.2341 0-5.8652 2.6311-5.8652 5.8652s2.6311 5.8633 5.8652 5.8633c3.2341-1e-6 5.8652-2.6292 5.8652-5.8633s-2.6311-5.8652-5.8652-5.8652z" stroke-width=".19531"/></svg>',
        'eye': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
        'cap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg>'
    };
    return svgs[code] || '';
}

/* === 八大机制定义 === */
const MECHANICS_DICT = [
    { key: 'enable_mega', label: 'Mega Evolution', desc: 'Gen 6 Systems', icon: 'mega' },
    { key: 'enable_z_move', label: 'Z-Moves Force', desc: 'Gen 7 Systems', icon: 'z' },
    { key: 'enable_dynamax', label: 'Dynamax Spots', desc: 'Gen 8 Systems', icon: 'dmax' },
    { key: 'enable_tera', label: 'Terastallized', desc: 'Gen 9 Systems', icon: 'tera' },
    { key: 'enable_bond', label: 'Bond / Anime', desc: 'Sync Bonding', icon: 'bond' },
    { key: 'enable_styles', label: 'Agile/Strong', desc: 'PLA Mechanics', icon: 'style' },
    { key: 'enable_insight', label: 'Insight Eye', desc: 'Status View', icon: 'eye' },
    { key: 'enable_proficiency_cap', label: 'Level Break', desc: 'Over Level', icon: 'cap' }
];

const DEFAULT_WORLD_SETTINGS = {
    enableAVS: false,
    enableCommander: false,
    enableEVO: false,
    enableBGM: true,
    enableSFX: true,
    enableClash: false,
    enableEnvironment: true
};

const SETTING_MECHANIC_MAP = {
    enable_clash: 'enableClash',
    enable_environment: 'enableEnvironment'
};

function normalizeGreetingSettings(settings) {
    return {
        ...DEFAULT_WORLD_SETTINGS,
        ...(settings || {})
    };
}

function buildGreetingLocation(region) {
    return {
        region: (region || '').trim(),
        location: ''
    };
}

let bridgeRequestSeq = 0;
const pendingBridgeRequests = new Map();

function getBridgeTarget() {
    try {
        if (window.parent && window.parent !== window) return window.parent;
    } catch (_) {}
    try {
        if (window.top && window.top !== window) return window.top;
    } catch (_) {}
    try {
        if (window.opener && !window.opener.closed) return window.opener;
    } catch (_) {}
    return null;
}

function handleBridgeResultMessage(event) {
    const data = event?.data;
    if (!data || !data.type || !data.requestId) return;
    const pending = pendingBridgeRequests.get(data.requestId);
    if (!pending) return;
    if (!pending.successTypes.includes(data.type) && !pending.errorTypes.includes(data.type)) return;
    clearTimeout(pending.timer);
    pendingBridgeRequests.delete(data.requestId);
    if (pending.successTypes.includes(data.type) && data.ok !== false) {
        pending.resolve(data);
    } else {
        const error = new Error(data.message || data.reason || `${pending.label} failed`);
        error.result = data;
        pending.reject(error);
    }
}

window.addEventListener('message', handleBridgeResultMessage);

function postBridgeRequest(message, options) {
    const target = getBridgeTarget();
    if (!target) return Promise.reject(new Error('ST bridge is unavailable'));
    const requestId = message.requestId || `greeting-${Date.now()}-${++bridgeRequestSeq}`;
    const payload = {
        ...message,
        requestId,
        source: message.source || 'greeting-universal'
    };
    const successTypes = options.successTypes || [];
    const errorTypes = options.errorTypes || [];
    const timeoutMs = options.timeoutMs || 10000;
    const label = options.label || payload.type || 'Bridge request';

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            pendingBridgeRequests.delete(requestId);
            reject(new Error(`${label} timed out`));
        }, timeoutMs);
        pendingBridgeRequests.set(requestId, { resolve, reject, timer, successTypes, errorTypes, label });
        try {
            target.postMessage(payload, '*');
        } catch (error) {
            clearTimeout(timer);
            pendingBridgeRequests.delete(requestId);
            reject(error);
        }
    });
}

function launchGreetingWorld(payload, text) {
    return postBridgeRequest({
        type: 'PKM_GREETING_LAUNCH',
        payload,
        text,
        notice: {
            level: 'success',
            title: 'PKM 开局准备完成',
            message: '机制变量和世界设置已注入当前楼层，开局叙事已写入酒馆输入栏。确认后发送输入栏内容，就可以开始游玩。',
            usePopup: true
        },
        source: 'greeting-universal'
    }, {
        successTypes: ['PKM_GREETING_LAUNCH_RESULT'],
        errorTypes: ['PKM_GREETING_LAUNCH_ERROR'],
        timeoutMs: 20000,
        label: 'Greeting launch'
    });
}

function showGreetingTavernNotice(level, title, message) {
    return postBridgeRequest({
        type: 'PKM_TAVERN_NOTICE',
        level,
        title,
        message,
        usePopup: true,
        source: 'greeting-universal'
    }, {
        successTypes: ['PKM_TAVERN_NOTICE_RESULT'],
        errorTypes: ['PKM_TAVERN_NOTICE_ERROR'],
        timeoutMs: 5000,
        label: 'Greeting Tavern notice'
    });
}

function showInlineGreetingNotice(level, title, message) {
    const normalizedLevel = ['success', 'info', 'warning', 'error'].includes(level) ? level : 'info';
    let notice = document.getElementById('greeting-inline-notice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'greeting-inline-notice';
        notice.setAttribute('role', 'status');
        notice.setAttribute('aria-live', 'polite');
        document.body.appendChild(notice);
    }
    notice.className = `greeting-inline-notice is-${normalizedLevel}`;
    const heading = document.createElement('strong');
    heading.textContent = title || 'PKM';
    const body = document.createElement('span');
    body.textContent = message || '';
    notice.replaceChildren(heading, body);
    window.clearTimeout(showInlineGreetingNotice.timer);
    showInlineGreetingNotice.timer = window.setTimeout(() => {
        notice.classList.add('is-hiding');
    }, normalizedLevel === 'error' ? 8000 : 5000);
}

async function showGreetingNotice(level, title, message) {
    try {
        const result = await showGreetingTavernNotice(level, title, message);
        if (result?.shown === false) {
            showInlineGreetingNotice(level, title, message);
        }
    } catch (error) {
        console.warn('[Greeting] Tavern notice failed:', error);
        showInlineGreetingNotice(level, title, message);
    }
}

async function showGreetingFailure(message) {
    console.error('[Greeting]', message);
    await showGreetingNotice('error', 'PKM 开局准备失败', message);
}

function showGreetingValidation(message) {
    void showGreetingNotice('warning', 'PKM 开局配置未完成', message);
}

const BASE_UNLOCK_STATE = MECHANICS_DICT.reduce((acc, mech) => {
    acc[mech.key] = false;
    return acc;
}, {});

const ANIME_UNLOCK_KEYS = ['enable_bond', 'enable_insight', 'enable_proficiency_cap'];

const GEN_UNLOCK_MAP = {
    6: ['enable_mega'],
    7: ['enable_z_move'],
    8: ['enable_dynamax'],
    9: ['enable_tera'],
    0: ['enable_styles']
};

function applySettingsMode(target, isAnimeMode) {
    Object.entries(DEFAULT_WORLD_SETTINGS).forEach(([key, defaultVal]) => {
        target[key] = isAnimeMode ? true : defaultVal;
    });
}

function applyAnimeUnlocks(target, isAnimeMode) {
    ANIME_UNLOCK_KEYS.forEach(key => {
        target[key] = !!isAnimeMode;
    });
}

function applyGenUnlocks(target, genId) {
    const keys = GEN_UNLOCK_MAP[genId];
    if (!keys) return;
    keys.forEach(key => { target[key] = true; });
}

function applyMechanicsToMvuz(mechanicsList, unlocksTarget, settingsTarget) {
    mechanicsList.forEach(key => {
        const settingKey = SETTING_MECHANIC_MAP[key];
        if (settingKey) {
            settingsTarget[settingKey] = true;
            return;
        }
        if (key in BASE_UNLOCK_STATE) {
            unlocksTarget[key] = true;
        }
    });
}

/**
 * 逻辑控制器
 */
const Launcher = {
    init() {
        GenesisData.forEach((gen, idx) => {
            const card = document.createElement('div');
            card.className = 'gen-card';
            if (gen.code) card.classList.add('gc-style-' + gen.code);

            if (gen.locked) {
                card.classList.add('is-locked');
                card.innerHTML = `
                    <div class="gc-inner">
                        <div class="lock-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                            </svg>
                        </div>
                        <div class="gc-name" style="color:#ffd700; text-shadow:none;">${gen.name}</div>
                        <div class="gc-bonus locked-tag">${gen.teaser || 'LOCKED'}</div>
                    </div>
                    <div class="scan-line"></div>
                `;

                card.onclick = () => {
                    const statusText = document.getElementById('feature-list');
                    if (!statusText) return;

                    const originalText = statusText.dataset.originalText || statusText.innerText;
                    statusText.dataset.originalText = originalText;

                    statusText.innerText = 'ACCESS DENIED';
                    statusText.style.color = '#ff4757';
                    statusText.style.borderColor = '#ff4757';

                    card.classList.add('access-denied-anim');
                    setTimeout(() => card.classList.remove('access-denied-anim'), 500);

                    if (Launcher._featureResetTimer) clearTimeout(Launcher._featureResetTimer);
                    Launcher._featureResetTimer = setTimeout(() => {
                        statusText.innerText = statusText.dataset.originalText || originalText;
                        statusText.style.color = '';
                        statusText.style.borderColor = '';
                    }, 2000);
                };
            } else {
                if (gen.id === 0) card.style.borderBottom = '4px solid #fab1a0';
                if (gen.id === 99) card.style.borderBottom = '4px solid #6c5ce7';
                card.innerHTML = `
                    <div class="gc-inner">
                        <div class="gc-num">${gen.id === 99 ? '?' : (gen.id === 0 ? 'H' : gen.id)}</div>
                        <div class="gc-name">${gen.name}</div>
                        <div class="gc-bonus">${gen.range || (gen.id === 0 ? 'LEGENDS' : (gen.id === 99 ? 'SANDBOX' : 'GENERATION'))}</div>
                    </div>
                `;
                card.onclick = () => Launcher.selectGen(idx, card);
            }

            UI.genList.appendChild(card);
        });
    },

    selectGen(index, cardEl) {
        document.querySelectorAll('.gen-card').forEach(c => c.classList.remove('active'));
        cardEl.classList.add('active');

        State.selectedGenIndex = index;
        State.selectedStarter = null;
        State.m8RankTier = 1;

        const screenEl = document.getElementById('screen-display');
        const data = GenesisData[index];
        const renderZone = document.getElementById('render-zone');

        if (screenEl) {
            const tagLabel = document.querySelector('.sim-header .section-tag');
            screenEl.className = 'sim-screen';

            const currentId = data.id;
            if (currentId === 1) {
                screenEl.classList.add('theme-gen1');
                if (tagLabel) tagLabel.innerText = 'AREA MAP';
            } else if (currentId === 2) {
                screenEl.classList.add('theme-gen2');
                if (tagLabel) tagLabel.innerText = 'POKÉGEAR';
            } else if (currentId === 3) {
                screenEl.classList.add('theme-gen3');
                if (tagLabel) tagLabel.innerText = 'BATTLE SCENE';
            } else if (currentId === 4) {
                screenEl.classList.add('theme-gen4');
                if (tagLabel) tagLabel.innerText = 'COMMAND?';
            } else if (currentId === 5) {
                screenEl.classList.add('theme-gen5');
                if (tagLabel) tagLabel.innerText = 'LINK STATUS_';
            } else if (currentId === 6) {
                screenEl.classList.add('theme-gen6');
                if (tagLabel) tagLabel.innerText = 'KEY STONE_';
            } else if (currentId === 7) {
                screenEl.classList.add('theme-gen7');
                if (tagLabel) tagLabel.innerText = 'Z-POWER_';
            } else if (currentId === 8) {
                screenEl.classList.add('theme-gen8');
                if (tagLabel) tagLabel.innerText = 'CHALLENGERS';
            } else if (currentId === 9) {
                screenEl.classList.add('theme-gen9');
                if (tagLabel) tagLabel.innerText = 'TERA CHARGE_';
            } else if (currentId === 0) {
                screenEl.classList.add('theme-hisui');
                if (tagLabel) tagLabel.innerText = '神奧尊';
            } else if (currentId === 888) {
                screenEl.classList.add('theme-wcs');
                if (tagLabel) tagLabel.innerHTML = 'SYNC_WORLD <span>///</span> RANKING';
            } else {
                if (tagLabel) tagLabel.innerText = 'SYSTEM_TARGET';
            }
        }

        UI.detailArea.style.display = 'block';
        UI.detailArea.classList.remove('anim-fade');
        void UI.detailArea.offsetWidth;
        UI.detailArea.classList.add('anim-fade');

        UI.regionName.innerText = data.name.toUpperCase();
        UI.featureList.innerText = data.desc.toUpperCase();

        const badgeContainer = document.getElementById('region-badges');
        if (badgeContainer) badgeContainer.innerHTML = '';

        const isCustom = data.id === 99;
        const isM8 = data.id === 888;

        if (isM8) {
            State.m8TeamData = {};
            this.renderM8UI();
            return;
        }

        if (!isCustom && badgeContainer && data.mechanics?.length) {
            data.mechanics.forEach(mechKey => {
                const meta = MECHANICS_DICT.find(m => m.key === mechKey);
                if (meta?.icon) {
                    const div = document.createElement('div');
                    div.className = 'mb-icon';
                    div.style.background = 'transparent';
                    div.style.border = 'none';
                    div.style.width = '';
                    div.style.height = '';
                    div.style.color = '';
                    div.title = `${meta.label} Active`;
                    div.innerHTML = getSvgIcon(meta.icon);
                    badgeContainer.appendChild(div);
                }
            });
        }

        if (!renderZone) return;

        if (isCustom) {
            this.renderCustomUI();
            return;
        }

        const startersBlock = data.starters.map(pkmName => {
            const title = pkmName.charAt(0).toUpperCase() + pkmName.slice(1);
            return `
                <div class="starter-btn" onclick="Launcher.setStandardStarter(this, '${pkmName}')">
                    <img src="${getSprite(pkmName)}" class="pk-img" loading="lazy">
                    <span class="pk-name">${title}</span>
                </div>
            `;
        }).join('');

        const animeHeaderColor = data.id === 6 ? '#dfe6e9' : '#00cec9';

        const htmlBlock = `
            <span class="section-tag">DETECTED SIGNALS</span>
            <div class="starter-grid">
                ${startersBlock}
            </div>

            <div style="height:20px;"></div>

            <div class="config-block" id="anime-options" style="box-shadow:none; border:1px solid #4a4a4a; background:rgba(0,0,0,0.8);">
                <div class="conf-text" style="transform: skewX(0);">
                    <div class="ct-main" style="color:${animeHeaderColor}; font-size:1rem;">ANIME_MODE.sys</div>
                    <div class="ct-sub">Bond Logic / Plot Armor / Voice</div>
                </div>
                <div class="ch-box-wrap" style="transform: skewX(0);">
                    <label>
                        <input type="checkbox" id="anime-toggle" class="native-check" ${State.animeMode ? 'checked' : ''}>
                        <div class="custom-check" style="height:20px; width:40px;"></div>
                    </label>
                </div>
            </div>
        `;

        renderZone.innerHTML = htmlBlock;

        const toggle = document.getElementById('anime-toggle');
        if (toggle) toggle.onchange = (e) => { State.animeMode = e.target.checked; };
    },

    renderCustomUI() {
        const container = document.getElementById('render-zone');
        if (!container) return;

        const mechCards = MECHANICS_DICT.map(m => `
            <div class="switch-card" data-key="${m.key}">
                <div class="sc-icon">${getSvgIcon(m.icon)}</div>
                <div class="sc-info" style="flex:1">
                    <div class="sc-label" style="font-weight:900;">${m.label}</div>
                    <div class="sc-label" style="font-size:0.6rem; opacity:0.6;">${m.desc}</div>
                </div>
                <div class="sc-box-wrap">
                    <div class="sc-box"></div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="custom-panel-frame">
                <h3 class="custom-panel-title">Custom Parameters</h3>

                <div class="cust-input-group">
                    <div class="hero-lbl">Designation // 目标地区名</div>
                    <input type="text" id="cust-region" class="hero-input" placeholder="Enter Region Name..." value="Unknown Region">
                </div>

                <div class="cust-input-group">
                    <div class="hero-lbl">Soul Link // 初始搭档 ID (English)</div>
                    <div class="poke-id-row">
                        <input type="text" id="cust-starter" class="hero-input input-poke" placeholder="e.g. mudkip" oninput="Launcher.previewCustomSprite(this)">
                        <div id="cust-preview" class="img-preview-box">
                            <span style="font-size:0.6rem; color:#b2bec3;">IMG</span>
                        </div>
                    </div>
                </div>

                <div class="config-block" id="custom-anime-options" style="box-shadow:none; border:1px solid #4a4a4a; background:rgba(0,0,0,0.8);">
                    <div class="conf-text" style="transform: skewX(0);">
                        <div class="ct-main" style="color:#00cec9; font-size:1rem;">ANIME_MODE.sys</div>
                        <div class="ct-sub">Bond Logic / Plot Armor / Voice</div>
                    </div>
                    <div class="ch-box-wrap" style="transform: skewX(0);">
                        <label>
                            <input type="checkbox" id="custom-anime-toggle" class="native-check" ${State.customAnimeMode ? 'checked' : ''}>
                            <div class="custom-check" style="height:20px; width:40px;"></div>
                        </label>
                    </div>
                </div>
            </div>

            <span class="section-tag" style="margin-top:10px;">SYSTEM KERNEL // 系统内核覆写</span>
            <div class="mech-grid">
                ${mechCards}
            </div>

            <div style="height:20px"></div>
        `;

        UI.regionName.innerText = 'CUSTOM SANDBOX';
        UI.featureList.innerText = 'MANUAL CONFIGURATION';

        container.querySelectorAll('.switch-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('active');
            });
        });

        const customAnimeToggle = document.getElementById('custom-anime-toggle');
        if (customAnimeToggle) {
            customAnimeToggle.checked = State.customAnimeMode;
            customAnimeToggle.onchange = (e) => {
                State.customAnimeMode = e.target.checked;
            };
        }
    },

    setStandardStarter(btn, name) {
        document.querySelectorAll('.starter-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        State.selectedStarter = name;
    },

    previewCustomSprite(inputEl) {
        const val = (inputEl.value || '').trim().toLowerCase();
        State.selectedStarter = val;
        const prev = document.getElementById('cust-preview');
        if (!prev) return;

        if (val.length > 2) {
            const imgUrl = getSprite(val);
            prev.innerHTML = `<img src="${imgUrl}" onerror="this.style.display='none'">`;
            prev.classList.add('has-img');
        } else {
            prev.innerHTML = '<span style="font-size:0.6rem; color:#b2bec3;">HOLO</span>';
            prev.classList.remove('has-img');
        }
    },

    renderM8UI() {
        const badgeContainer = document.getElementById('region-badges');
        if (badgeContainer) {
            badgeContainer.innerHTML = `<div class="mb-icon" style="color:#00cec9; background:#fff; border:1px solid #dff9fb; box-shadow:0 0 10px rgba(0,206,201,0.2);">WCS</div>`;
        }

        const renderZone = document.getElementById('render-zone');
        renderZone.innerHTML = `
            <span class="section-tag" style="text-align:right; color:#00cec9; padding-right:5px;">OFFICIAL RANKINGS DATABASE_</span>
            <div class="rank-selector-row holo-row">
                <div class="rank-opt-card holo-card" onclick="Launcher.selectM8Tier(1, this)">
                    <div class="data-decor"></div>
                    <div class="ro-content">
                        <div class="ro-main">NORMAL</div>
                        <div class="ro-rank">Rank 100,000+</div>
                        <div class="ro-sub">Limit: 1 Slot</div>
                    </div>
                </div>
                <div class="rank-opt-card holo-card" onclick="Launcher.selectM8Tier(2, this)">
                    <div class="data-decor"></div>
                    <div class="ro-content">
                        <div class="ro-main">SUPER</div>
                        <div class="ro-rank">Rank 9,999+</div>
                        <div class="ro-sub">Limit: 3 Slots</div>
                    </div>
                </div>
                <div class="rank-opt-card holo-card selected" onclick="Launcher.selectM8Tier(3, this)">
                    <div class="data-decor"></div>
                    <div class="ro-content">
                        <div class="ro-main">MASTER</div>
                        <div class="ro-rank">Rank 999~Top</div>
                        <div class="ro-sub">Full Team (6)</div>
                    </div>
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:25px; margin-bottom:5px;">
                <span class="section-tag" id="team-lbl" style="margin:0;">PARTY DATA <span class="blink">///</span> CONFIGURATOR</span>
                <div style="font-size:0.6rem; color:#b2bec3; font-weight:800; font-family:var(--font-ui);">SYNC STATUS: <span style="color:#00cec9;">ONLINE</span></div>
            </div>

            <div id="m8-team-wrapper" class="team-builder-grid sci-fi-grid"></div>
            <div id="editor-mount-point"></div>

            <div style="height:25px"></div>

            <div class="config-block sci-fi-option" id="m8-anime-block">
                <div class="conf-text" style="display:grid; grid-template-columns:auto; transform:none;">
                    <div class="ct-main" style="color:#2d3436; font-size:0.9rem; font-style:normal; transform:none;">
                        NARRATIVE LOGIC : <span style="color:#00cec9;font-weight:900;">ACTIVE</span>
                    </div>
                    <div class="ct-sub" id="anime-desc-text" style="color:#636e72; font-weight:600; transform:none;">
                        Dynamic Bond / Battle Speech / Plot Armor
                    </div>
                </div>
                <div class="ch-box-wrap" style="transform:none;">
                    <label class="toggle-light">
                        <input type="checkbox" id="anime-toggle" class="native-check" checked>
                        <div class="slider-runway">
                            <div class="slider-knob"></div>
                        </div>
                    </label>
                </div>
            </div>
        `;

        State.m8RankTier = 3;
        this.refreshM8SlotsDisplay();

        const toggle = document.getElementById('anime-toggle');
        const labelStatus = document.querySelector('#m8-anime-block .ct-main span');
        const labelBlock = document.getElementById('anime-desc-text');

        State.animeMode = true;

        const syncAnimeBlock = () => {
            if (State.animeMode) {
                labelStatus.innerText = 'ACTIVE';
                labelStatus.style.color = '#00cec9';
                labelStatus.style.textShadow = '0 0 10px rgba(0,206,201,0.5)';
                labelBlock.style.opacity = '1';
            } else {
                labelStatus.innerText = 'DISABLED';
                labelStatus.style.color = '#b2bec3';
                labelStatus.style.textShadow = 'none';
            }
        };

        syncAnimeBlock();

        if (toggle) {
            toggle.onchange = (e) => {
                State.animeMode = e.target.checked;
                syncAnimeBlock();
            };
        }
    },

    refreshM8SlotsDisplay() {
        const grid = document.getElementById('m8-team-wrapper');
        if (!grid) return;

        grid.innerHTML = '';

        let count = 1;
        if (State.m8RankTier === 2) count = 3;
        if (State.m8RankTier === 3) count = 6;
        grid.className = `team-builder-grid tb-layout-${count}`;

        for (let i = 1; i <= count; i++) {
            const cfg = State.m8TeamData[i];
            const hasData = !!(cfg && cfg.species);
            const slot = document.createElement('div');
            slot.className = `tb-slot ${i === 1 ? 'ace-slot' : ''} ${hasData ? 'has-data' : ''}`;

            if (hasData) {
                const displayName = cfg.nickname || cfg.species;
                const imgSrc = getSprite((cfg.species || '').toLowerCase().replace(/\s+/g, '-'));
                slot.innerHTML = `
                    <img src="${imgSrc}" style="width:50px; height:50px; object-fit:contain; opacity:0.8;" onerror="this.style.display='none'">
                    <div class="tb-summary-name">${displayName}</div>
                    <div class="tb-summary-lv">Lv.${cfg.level || 50} / ${cfg.item || 'No Item'}</div>
                `;
            } else {
                slot.innerHTML = `
                    <div style="font-size:2rem; color:#b2bec3; line-height:1;">+</div>
                    <span class="tb-label-sm">${i === 1 ? 'ACE DATA' : 'DEFINE'}</span>
                `;
            }

            slot.onclick = () => this.openTeamEditor(i);
            grid.appendChild(slot);
        }
    },

    selectM8Tier(tier, btnEl) {
        document.querySelectorAll('.rank-opt-card').forEach(b => b.classList.remove('selected'));
        if (btnEl) btnEl.classList.add('selected');
        State.m8RankTier = tier;
        this.refreshM8SlotsDisplay();
    },

    openTeamEditor(slotIdx) {
        const mount = document.getElementById('editor-mount-point');
        if (!mount) return;
        const defaults = {
            species: '', nickname: '',
            level: slotIdx === 1 ? 80 : 70,
            gender: 'M', nature: 'Hardy', ability: 'Classic', item: '',
            bond_trust: slotIdx === 1 ? 200 : 120,
            ivs: '31,31,31,31,31,31',
            ev_total: 0
        };
        const safeData = { ...defaults, ...(State.m8TeamData[slotIdx] || {}) };

        mount.innerHTML = `
        <div class="editor-overlay">
            <div class="eo-header">
                <div class="eo-title">CONFIG SLOT #${slotIdx}</div>
                <div class="eo-close" onclick="Launcher.closeEditor()">× TYPE_EXIT</div>
            </div>

            <div class="eo-scroll">
                <div class="eo-row-2">
                    <div class="eo-form-group">
                        <span class="eo-label">Species (English ID) *</span>
                        <input type="text" id="ed-species" class="eo-input" value="${safeData.species}" placeholder="e.g. garchomp">
                    </div>
                    <div class="eo-form-group">
                        <span class="eo-label">Nickname (Optional)</span>
                        <input type="text" id="ed-nick" class="eo-input" value="${safeData.nickname}">
                    </div>
                </div>

                <div class="eo-row-3">
                    <div class="eo-form-group">
                        <span class="eo-label">Item</span>
                        <input type="text" id="ed-item" class="eo-input" value="${safeData.item}" placeholder="Leftovers">
                    </div>
                    <div class="eo-form-group">
                        <span class="eo-label">Nature</span>
                        <input type="text" id="ed-nature" class="eo-input" value="${safeData.nature}" placeholder="Adamant">
                    </div>
                    <div class="eo-form-group">
                        <span class="eo-label">Level</span>
                        <input type="number" id="ed-lv" class="eo-input" value="${safeData.level}">
                    </div>
                </div>

                <div class="eo-form-group">
                    <span class="eo-label">Ability / Trait (特性)</span>
                    <input type="text" id="ed-ability" class="eo-input" value="${safeData.ability}" placeholder="Intimidate">
                </div>

                <hr style="border:0; border-top:1px dashed #b2bec3; margin:10px 0;">

                <div class="eo-form-group">
                    <div style="display:flex; justify-content:space-between">
                        <span class="eo-label">Individual Values (IVs) [HP | Atk | Def | SpA | SpD | Spe]</span>
                        <span class="eo-label" style="color:var(--c-accent); cursor:pointer;" onclick="Launcher.fillStatHex('ed-iv', 31)">[MAX]</span>
                    </div>
                    <div class="stat-hex-grid" id="ed-iv-box">
                        ${this._genHexInputs('ed-iv', safeData.ivs)}
                    </div>
                </div>

                <div class="eo-row-2">
                    <div class="eo-form-group">
                        <span class="eo-label">Effort Value Total (0 - 255)</span>
                        <input type="number" id="ed-ev-total" class="eo-input" value="${safeData.ev_total}" placeholder="e.g. 255">
                    </div>
                    <div class="eo-form-group">
                        <span class="eo-label">Bond Link (Trust 0-255)</span>
                        <input type="number" id="ed-bond-t" class="eo-input" value="${safeData.bond_trust}" placeholder="Trust">
                    </div>
                </div>

                <button class="eo-save-btn" onclick="Launcher.saveEditor(${slotIdx})"></button>
                <div style="height:40px;"></div>
            </div>
        </div>
        `;
    },

    _genHexInputs(prefix, strVal) {
        const vals = (strVal || '0,0,0,0,0,0').toString().split(',');
        return vals.map(v => `<div class="stat-box"><input type="number" class="${prefix}-inputs" value="${(v || '').trim() || 0}"></div>`).join('');
    },

    fillStatHex(prefix, val) {
        document.querySelectorAll(`.${prefix}-inputs`).forEach(inp => {
            inp.value = val;
        });
    },

    closeEditor() {
        const mount = document.getElementById('editor-mount-point');
        if (mount) mount.innerHTML = '';
    },

    saveEditor(slotIdx) {
        const getString = (id) => (document.getElementById(id)?.value || '').trim();
        const collectHex = (prefix) => {
            const arr = [];
            document.querySelectorAll(`.${prefix}-inputs`).forEach(el => arr.push(el.value || 0));
            return arr.join(',');
        };

        const species = getString('ed-species');
        if (!species) {
            showGreetingValidation('请填写宝可梦 Species Name。');
            return;
        }

        const newData = {
            species,
            nickname: getString('ed-nick') || species,
            level: parseInt(getString('ed-lv'), 10) || 50,
            gender: 'M',
            item: getString('ed-item'),
            nature: getString('ed-nature') || 'Serious',
            ability: getString('ed-ability') || 'hidden',
            ivs: collectHex('ed-iv'),
            ev_total: parseInt(getString('ed-ev-total'), 10) || 0,
            bond_trust: parseInt(getString('ed-bond-t'), 10) || 0
        };

        State.m8TeamData[slotIdx] = newData;
        this.refreshM8SlotsDisplay();
        this.closeEditor();
    },

    async createWorld() {
        const idx = State.selectedGenIndex;
        if (idx === -1) {
            showGreetingValidation('请选择一个开局区域或模式。');
            return;
        }

        const data = GenesisData[idx];
        const isCustom = data.id === 99;
        const isM8 = data.id === 888;

        let finalRegion = data.name;
        let finalStarter = State.selectedStarter;
        let finalMechanics = {};
        const finalSettings = { enableSFX: true, enableBGM: true };
      
        const narrativeTeam = {};

        /* === 逻辑分支 A: M8 模式 === */
        if (isM8) {
            const slotAllowance = State.m8RankTier === 1 ? 1 : (State.m8RankTier === 2 ? 3 : 6);
            if (!State.m8TeamData[1] || !State.m8TeamData[1].species) {
                showGreetingValidation('请点击插槽 (+)，并至少保存 Ace (Slot 01) 的数据。');
                return;
            }

            finalRegion = "World Coronation Series (WCS)";

            const makeHexObj = (str) => {
                const keys = ['hp','atk','def','spa','spd','spe'];
                const vals = (str || '0,0,0,0,0,0').split(',');
                return keys.reduce((acc, key, idx) => {
                    acc[key] = parseInt(vals[idx], 10) || 0;
                    return acc;
                }, {});
            };

            for (let i = 1; i <= slotAllowance; i++) {
                const cfg = State.m8TeamData[i];
                if (!cfg || !cfg.species) continue;

                const slotKey = `slot${i}`;
                if (i === 1) finalStarter = cfg.species;

                narrativeTeam[slotKey] = {
                    name: cfg.nickname || cfg.species,
                    species: cfg.species,
                    level: parseInt(cfg.level, 10) || (i === 1 ? 80 : 70),
                    gender: cfg.gender || 'M',
                    item: cfg.item || null,
                    ability: cfg.ability || 'hidden',
                    nature: cfg.nature || 'Serious',
                    stats: {
                        ivs: makeHexObj(cfg.ivs),
                        ev_total: cfg.ev_total || 0
                    },
                    bonds: parseInt(cfg.bond_trust, 10) || 0
                };
            }

            if (!narrativeTeam.slot1) {
                showGreetingValidation('Slot 01 为空，请重新保存 Ace 数据。');
                return;
            }

            finalSettings.enableM8mode = true;
            finalSettings.enableSFX = true;
            finalSettings.enableBGM = true;

            if (State.animeMode) {
                finalSettings.animeMode = true;
                finalSettings.enableAVS = true;
                finalSettings.enableClash = true;
                finalSettings.enableCommander = true;
                finalSettings.enableEnvironment = true;

                MECHANICS_DICT.forEach(mech => {
                    if (mech.key !== 'enable_styles') {
                        finalMechanics[mech.key] = true;
                    }
                });
            } else {
                finalSettings.animeMode = false;
                finalSettings.enableAVS = false;
                finalSettings.enableClash = false;
                finalSettings.enableCommander = false;
                finalSettings.enableEnvironment = false;

                finalMechanics['enable_mega'] = true;
                finalMechanics['enable_z_move'] = true;
                finalMechanics['enable_dynamax'] = true;
                finalMechanics['enable_tera'] = true;
                finalMechanics['enable_bond'] = false;
                finalMechanics['enable_insight'] = false;
                finalMechanics['enable_styles'] = false;
                finalMechanics['enable_proficiency_cap'] = false;
            }

        /* === 逻辑分支 B: 自定义 & 常规 Gen 模式 === */
        } else {
            const mechanicsList = Array.isArray(data.mechanics) ? data.mechanics : [];
            finalMechanics = { ...BASE_UNLOCK_STATE };
            let animeModeActive = false;

            if (!isCustom) {
                if (!finalStarter) {
                    showGreetingValidation('请选择初始宝可梦。');
                    return;
                }
                applyGenUnlocks(finalMechanics, data.id);
                applyAnimeUnlocks(finalMechanics, State.animeMode);
                animeModeActive = !!State.animeMode;
                finalSettings.animeMode = State.animeMode;
            } else {
                const regInput = document.getElementById('cust-region');
                const startInput = document.getElementById('cust-starter');
                const toggleCards = document.querySelectorAll('.mech-grid .switch-card');

                if (!startInput || !startInput.value.trim()) {
                    showGreetingValidation('请输入自定义宝可梦的名字 (英文 ID)。');
                    return;
                }

                finalRegion = regInput && regInput.value ? regInput.value.trim() : 'Unknown Region';
                finalStarter = startInput.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

                toggleCards.forEach((card, i) => {
                    if (card.classList.contains('active')) {
                        const key = MECHANICS_DICT[i].key;
                        finalMechanics[key] = true;
                    }
                });

                if (State.customAnimeMode) {
                    finalMechanics['enable_bond'] = true;
                }
                animeModeActive = !!State.customAnimeMode;
            }

            applySettingsMode(finalSettings, animeModeActive);
            applyMechanicsToMvuz(mechanicsList, finalMechanics, finalSettings);
        }

        let teamDescription = '';
        if (isM8) {
            const teamList = [];
            Object.keys(narrativeTeam).forEach(key => {
                const mon = narrativeTeam[key];
                const ivStr = `${mon.stats.ivs.hp}/${mon.stats.ivs.atk}/${mon.stats.ivs.def}/${mon.stats.ivs.spa}/${mon.stats.ivs.spd}/${mon.stats.ivs.spe}`;
                teamList.push(`- ${mon.name} (${mon.species}) Lv.${mon.level} ${mon.gender} | Nature: ${mon.nature} | Ability: ${mon.ability} | Item: ${mon.item || 'None'} | IVs: ${ivStr} | EVs: ${mon.stats.ev_total} | Bonds: ${mon.bonds}`);
            });
            teamDescription = '\n\n[队伍配置]\n' + teamList.join('\n');
        }
      
        let logicType = "GAME LOGIC";
        if (isCustom) logicType = "CUSTOM SANDBOX";
        if (State.animeMode && !isM8) logicType = "ANIME LOGIC";
        if (isM8) logicType = `WCS CHAMPIONSHIP (Tier ${State.m8RankTier})`;

        let guideText = "";
        if (isM8) {
            const tiers = ["Zero", "Rookie Class", "Ultra Class", "Masters Eight"];
            guideText = `当前开局模式：${tiers[State.m8RankTier]} (PVP Career Layout)。\n玩家叙事设定包含 ${Object.keys(narrativeTeam).length} 只核心宝可梦。首发王牌为 ${finalStarter}。\n根据 'animeMode=${State.animeMode}'，请${State.animeMode ? '注重角色羁绊表现与技能喊话' : '注重数值硬核计算与战术'}。`;
        } else {
            guideText = isCustom ? 
            `这里是自建世界区域${finalRegion}。请描述主角获得了${finalStarter || '自定义搭档'}的场景。` : '请沿用宝可梦官方开局剧本。';
        }

        const msg = `
[SYSTEM: WORLD RESET]
// Region: ${finalRegion}
// Starter: ${finalStarter ? finalStarter.toUpperCase() : 'UNKNOWN'}
${teamDescription}

	[引导]
	${guideText}
机制变量和世界设置已经注入当前楼层，请只演绎开局叙事，不要输出变量更新块，不要写入初始宝可梦变量。`.trim();

        try {
            await launchGreetingWorld({
                unlocks: finalMechanics,
                settings: normalizeGreetingSettings(finalSettings),
                world: {
                    location: buildGreetingLocation(finalRegion)
                }
            }, msg);
        } catch (error) {
            await showGreetingFailure(`开局准备失败：${error.message}`);
            return;
        }
    }
};

// 附加 BGM 控制逻辑
if (typeof Launcher !== 'undefined') {
    Launcher.toggleBGM = function () {
        const audio = document.getElementById('sys-bgm-layer');
        const widget = document.getElementById('bgm-float-btn');
        const statusTxt = document.getElementById('bgm-status-text');

        if (!audio || !widget || !statusTxt) return;

        audio.volume = 0.35;

        if (audio.paused) {
            audio.play().then(() => {
                widget.classList.add('playing');
                widget.classList.remove('paused');
                statusTxt.innerText = 'ACTIVE';
            }).catch(err => {
                console.warn('Audio playback blocked:', err);
                statusTxt.innerText = 'ERROR';
            });
        } else {
            audio.pause();
            widget.classList.remove('playing');
            widget.classList.add('paused');
            statusTxt.innerText = 'OFFLINE';
        }
    };
}

// 启动
window.onload = Launcher.init;
