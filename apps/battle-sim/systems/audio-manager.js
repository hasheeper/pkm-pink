/**
 * ===========================================
 * AUDIO-MANAGER.JS - 音效管理系统
 * ===========================================
 * 
 * 职责:
 * - 预加载短音效 (提高响应速度)
 * - 实现并发播放 (cloneNode)
 * - 与 BGM 系统协同工作
 */

// ============================================
// 路径兼容 (GitHub Pages)
// ============================================

function getSfxBasePath() {
    // 优先使用全局 getBasePath（由 index.js 定义）
    if (typeof window !== 'undefined' && typeof window.getBasePath === 'function') {
        return window.getBasePath();
    }
    const path = window.location.pathname;
    // GitHub Pages: /pkm33/
    if (path.includes('/pkm33/')) {
        return path.substring(0, path.indexOf('/pkm33/') + 7);
    }
    return './';
}

// SFX 文件名配置（不包含路径，路径在播放时动态获取）
const SFX_FILES = {
    'CONFIRM':    'ui_01_confirm.mp3',
    'CANCEL':     'ui_01_confirm.mp3',
    'HIT_NORMAL': 'hit_00_normal.mp3',
    'HIT_SUPER':  'Hit_Super_Effective_XY.mp3',
    'HIT_WEAK':   'hit_02_weak.mp3',
    'STAT_UP':    'stat_up.mp3',
    'STAT_DOWN':  'stat_down.mp3',
    'FAINT':      'battle_faint.mp3',
    'HEAL':       'battle_heal.mp3',
    'THROW':      'ball_throw.mp3',
    'BALL_OPEN':  'ball_open.mp3',
    'CLASH':      'Hit_Super_Effective_XY.mp3',
    'BRN':        'burn.mp3',
    'FRZ':        'freeze.mp3',
    'PAR':        'para.mp3',
    'PSN':        'poison.mp3',
    'TOX':        'poison.mp3'
};

// 动态获取 SFX 完整路径
function getSfxPath(filename) {
    const basePath = getSfxBasePath();
    return `${basePath}data/sfx/${filename}`;
}

// 兼容旧代码：动态生成 SFX_CONFIG
const SFX_CONFIG = {};

// ============================================
// SFX 音量配置表 (0.0 - 1.0)
// ============================================

const SFX_VOLUME_CONFIG = {
    'CONFIRM':    0.5,
    'CANCEL':     0.5,
    'HIT_NORMAL': 0.6,
    'HIT_SUPER':  0.7,
    'HIT_WEAK':   0.5,
    'STAT_UP':    0.3,
    'STAT_DOWN':  0.3,
    'FAINT':      0.6,
    'HEAL':       0.5,
    'THROW':      0.6,
    'BALL_OPEN':  0.6,
    'CLASH':      0.8,
    'BRN':        0.5,
    'FRZ':        0.5,
    'PAR':        0.5,
    'PSN':        0.5,
    'TOX':        0.5
};

// 音频缓存池
const sfxCache = {};

// ============================================
// 预加载 SFX（延迟执行，等待 DOM 和路径就绪）
// ============================================

let sfxPreloaded = false;

function initSfxPreload() {
    if (sfxPreloaded) return;
    sfxPreloaded = true;
    
    console.log('[SFX] Starting preload...');
    let loadedCount = 0;
    const totalCount = Object.keys(SFX_FILES).length;
    
    for (const [key, filename] of Object.entries(SFX_FILES)) {
        const path = getSfxPath(filename);
        const audio = new Audio();
        audio.src = path;
        audio.preload = 'auto';
        audio.volume = SFX_VOLUME_CONFIG[key] || 0.6;
        
        // 同时填充 SFX_CONFIG 以兼容旧代码
        SFX_CONFIG[key] = path;
        
        audio.addEventListener('canplaythrough', () => {
            loadedCount++;
            if (loadedCount === totalCount) {
                console.log(`[SFX] All ${loadedCount} files preloaded.`);
            }
        }, { once: true });
        
        audio.addEventListener('error', () => {
            console.warn(`[SFX] Failed to load: ${key} (${path})`);
            loadedCount++;
        }, { once: true });
        
        sfxCache[key] = audio;
        audio.load();
    }
    
    console.log(`[SFX] Queued ${Object.keys(sfxCache).length} files for preload.`);
}

// 立即尝试预加载，如果路径还没准备好，等 DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSfxPreload);
} else {
    // DOM 已就绪，延迟一点确保其他脚本加载完成
    setTimeout(initSfxPreload, 100);
}

// ============================================
// 播放 SFX (支持并发)
// ============================================

/**
 * 播放短音效 (支持并发)
 * @param {string} key - SFX_CONFIG 中的键名
 * @param {number} volumeOverride - 可选的音量覆盖 (0.0 - 1.0)
 */
function playSFX(key, volumeOverride = null) {
    // 【全局开关】SFX 系统关闭时不播放
    if (typeof window !== 'undefined' && window.GAME_SETTINGS && !window.GAME_SETTINGS.enableSFX) {
        return;
    }
    
    let original = sfxCache[key];
    
    // 缓存未命中时动态加载
    if (!original && SFX_FILES[key]) {
        const path = getSfxPath(SFX_FILES[key]);
        original = new Audio(path);
        original.volume = SFX_VOLUME_CONFIG[key] || 0.6;
        sfxCache[key] = original;
        console.log(`[SFX] Dynamic load: ${key} -> ${path}`);
    }
    
    if (!original) {
        console.warn(`[SFX] Unknown key: ${key}`);
        return;
    }

    try {
        const clone = original.cloneNode();
        clone.volume = volumeOverride !== null 
            ? volumeOverride 
            : (SFX_VOLUME_CONFIG[key] || 0.6);
        
        clone.play().catch(() => {
            // 忽略浏览器自动播放限制错误
        });
    } catch (e) {
        console.error('[SFX] Play error:', e);
    }
}

/**
 * 根据伤害效果播放对应打击音效
 * @param {number} effectiveness - 克制倍率
 * @param {boolean} isCrit - 是否暴击
 */
function playHitSFX(effectiveness, isCrit = false) {
    if (isCrit || effectiveness >= 2) {
        playSFX('HIT_SUPER');
    } else if (effectiveness > 0 && effectiveness <= 0.5) {
        playSFX('HIT_WEAK');
    } else {
        playSFX('HIT_NORMAL');
    }
}

// ============================================
// 导出到全局
// ============================================

window.playSFX = playSFX;
window.playHitSFX = playHitSFX;
window.initSfxPreload = initSfxPreload;
window.SFX_CONFIG = SFX_CONFIG;
window.SFX_FILES = SFX_FILES;

// ============================================
// 宝可梦叫声系统
// ============================================

const CRY_VOLUME = 0.45;

/**
 * 播放宝可梦叫声 (在线拉取 Showdown 音频库)
 * @param {string} speciesName - 宝可梦名字 (如 "Pikachu", "Charizard-Mega-Y")
 */
window.playPokemonCry = function(speciesName) {
    // 【全局开关】SFX 系统关闭时不播放叫声
    if (typeof window !== 'undefined' && window.GAME_SETTINGS && !window.GAME_SETTINGS.enableSFX) {
        return;
    }
    
    if (!speciesName) return;
    
    // 优先使用预加载缓存
    if (typeof playCachedCry === 'function') {
        playCachedCry(speciesName, CRY_VOLUME);
        return;
    }
    
    // Fallback: 在线加载
    let id = speciesName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (typeof POKEDEX !== 'undefined' && POKEDEX[id]) {
        if (POKEDEX[id].baseSpecies) {
            id = POKEDEX[id].baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, '');
        }
    }
    
    const suffixes = ['mega', 'megax', 'megay', 'gmax', 'alola', 'hisui', 'paldea', 'galar'];
    for (const s of suffixes) {
        if (id.endsWith(s) && id.length > s.length) {
            id = id.replace(s, '');
            break;
        }
    }
    
    const url = `https://play.pokemonshowdown.com/audio/cries/${id}.mp3`;
    const cryAudio = new Audio(url);
    cryAudio.volume = CRY_VOLUME;
    cryAudio.play().catch(() => {});
    
    console.log(`[CRY] Playing online: ${speciesName} -> ${id}`);
};
