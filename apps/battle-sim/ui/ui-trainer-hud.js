/**
 * ===========================================
 * UI-TRAINER-HUD.JS - 训练家头像与 Cut-in 系统
 * ===========================================
 * 
 * 职责:
 * - 训练家头像显示与加载
 * - 头像 ID 解析与回退
 * - Cut-in 剧场化演出系统
 */

// ============================================
// 头像库配置
// ============================================

const AVATAR_LIBRARY = [
    'player',
    'wild',
    'gloria',
    'rosa',
    'dawn',
    'akari',
    'serena',
    'lusamine',
    'lillie',
    'mallow',
    'lana',
    'irida',
    'roxie',
    'iono',
    'erika',
    'nessa',
    'marnie',
    'hexmaniac',
    'bea',
    'cynthia',
    'sonia',
    'juliana',
    'selene',
    'may',
    'lacey',
    'misty',
    'acerola',
    'skyla',
    'iris',
    'nemona',
    'leon'
];

const AVATAR_ALIAS_MAP = {
    hex: 'hexmaniac',
    leonultimate: 'leon',
    leonchampion: 'leon'
};

const NORMALIZED_AVATARS = AVATAR_LIBRARY.map(name => ({
    original: name,
    normalized: name.toLowerCase().replace(/[^a-z0-9]/g, '')
}));

// 用于训练家头像缺失时的问号备用图
const MISSING_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f1f3f6'/%3E%3Cpath fill='%23dde1e7' d='M0,0 L200,200 L200,0 Z' opacity='0.3'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-weight='900' font-size='120' fill='%23cbd5e1'%3E?%3C/text%3E%3Crect x='10' y='10' width='180' height='180' rx='20' fill='none' stroke='%23cbd5e1' stroke-width='8' stroke-dasharray='15,15'/%3E%3C/svg%3E";

// ============================================
// 头像 ID 解析
// ============================================

/**
 * 解析头像 ID
 * @param {string} source 原始来源（训练家名称或 ID）
 * @returns {string|null} 解析后的头像 ID
 */
function resolveAvatarId(source) {
    const slug = String(source || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '');
    if (!slug) return null;

    if (AVATAR_ALIAS_MAP[slug]) {
        return AVATAR_ALIAS_MAP[slug];
    }

    const exact = NORMALIZED_AVATARS.find(entry => entry.normalized === slug);
    if (exact) return exact.original;

    const partial = NORMALIZED_AVATARS.find(entry =>
        entry.normalized.includes(slug) || slug.includes(entry.normalized)
    );
    return partial ? partial.original : null;
}

// ============================================
// 训练家名称格式化
// ============================================

/**
 * 格式化训练家名称
 * @param {Object} trainer 训练家对象
 * @returns {string} 格式化后的名称
 */
function formatTrainerName(trainer) {
    if (!trainer) return 'TRAINER';
    if (trainer.displayName) return trainer.displayName;
    if (trainer.name_en) return trainer.name_en;
    if (trainer.id && trainer.id !== 'wild') {
        return trainer.id
            .split(/[-_]/)
            .filter(Boolean)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }
    return 'TRAINER';
}

// ============================================
// 训练家 HUD 更新
// ============================================

/**
 * 更新训练家 HUD 显示
 */
function updateTrainerHud() {
    const hud = document.getElementById('trainer-hud');
    const nameEl = document.getElementById('trainer-name');
    const avatarEl = document.getElementById('trainer-avatar');
    if (!hud || !nameEl || !avatarEl) return;

    const battle = typeof window !== 'undefined' ? window.battle : null;
    const t = battle?.trainer;

    if (!t) {
        hud.classList.add('hidden');
        return;
    }

    const isWild = t.id === 'wild' || !t.id;
    if (isWild) {
        hud.classList.add('hidden');
        return;
    }

    const displayName = (t.name || '').trim();
    if (displayName) {
        nameEl.textContent = displayName.replace(/^./, match => match.toUpperCase());
    } else {
        nameEl.textContent = 'Unknown';
    }

    const resolvedFromName = resolveAvatarId(displayName);
    const resolvedFromId = resolveAvatarId(t.id);
    const candidates = [];
    if (resolvedFromId) candidates.push(resolvedFromId);
    if (resolvedFromName) candidates.push(resolvedFromName);

    const uniqueCandidates = [...new Set(candidates)].filter(Boolean);
    let attemptIndex = 0;

    avatarEl.onload = null;
    avatarEl.onerror = null;

    if (uniqueCandidates.length === 0) {
        avatarEl.onload = null;
        avatarEl.onerror = () => { hud.classList.add('hidden'); };
        avatarEl.src = MISSING_AVATAR;
        hud.classList.remove('hidden');
        return;
    }

    const tryNext = () => {
        if (attemptIndex >= uniqueCandidates.length) {
            avatarEl.onload = null;
            avatarEl.onerror = () => { hud.classList.add('hidden'); };
            avatarEl.src = MISSING_AVATAR;
            hud.classList.remove('hidden');
            return;
        }

        const candidate = uniqueCandidates[attemptIndex++];
        avatarEl.onload = () => {
            hud.classList.remove('hidden');
        };
        avatarEl.onerror = () => {
            tryNext();
        };

        avatarEl.src = `data/avatar/${candidate}.png`;
    };

    tryNext();
}

// ============================================
// Cut-in 剧场化演出系统
// ============================================

/**
 * 播放 Cut-in 演出
 * @param {string} text 演出文本
 * @param {number} duration 持续时间（毫秒）
 */
function playCutIn(text, duration = 3000) {
    if (!text) return;

    const stage = document.getElementById('cutin-stage');
    const nameEl = document.getElementById('cutin-name');
    const textEl = document.getElementById('cutin-text');
    const imgEl = document.getElementById('cutin-avatar');

    if (!stage || !nameEl || !textEl || !imgEl) return;

    const battle = typeof window !== 'undefined' ? window.battle : null;
    const trainer = battle?.trainer;
    const trainerName = trainer?.name || trainer?.title || 'ENEMY';
    nameEl.textContent = trainerName;
    textEl.textContent = text;

    const isWild = trainer?.id === 'wild';
    let targetSrc = '';

    if (isWild) {
        const enemySprite = document.getElementById('enemy-sprite');
        if (enemySprite?.src) {
            targetSrc = enemySprite.src;
        }
    } else {
        const trainerHudImg = document.getElementById('trainer-avatar');
        if (trainerHudImg?.src) {
            targetSrc = trainerHudImg.src;
        }
    }

    if (targetSrc && !targetSrc.includes('html')) {
        imgEl.style.opacity = '';
        imgEl.src = targetSrc;
    } else {
        imgEl.style.opacity = 0;
    }

    stage.classList.remove('hidden', 'outro');
    void stage.offsetWidth;
    stage.classList.add('active');

    clearTimeout(stage._cutinTimer);
    stage._cutinTimer = setTimeout(() => {
        stage.classList.remove('active');
        stage.classList.add('outro');
        clearTimeout(stage._cutinHideTimer);
        stage._cutinHideTimer = setTimeout(() => {
            stage.classList.add('hidden');
            stage.classList.remove('outro');
        }, 650);
    }, duration);
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.AVATAR_LIBRARY = AVATAR_LIBRARY;
    window.AVATAR_ALIAS_MAP = AVATAR_ALIAS_MAP;
    window.NORMALIZED_AVATARS = NORMALIZED_AVATARS;
    window.MISSING_AVATAR = MISSING_AVATAR;
    window.resolveAvatarId = resolveAvatarId;
    window.formatTrainerName = formatTrainerName;
    window.updateTrainerHud = updateTrainerHud;
    window.playCutIn = playCutIn;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AVATAR_LIBRARY,
        AVATAR_ALIAS_MAP,
        NORMALIZED_AVATARS,
        MISSING_AVATAR,
        resolveAvatarId,
        formatTrainerName,
        updateTrainerHud,
        playCutIn
    };
}
