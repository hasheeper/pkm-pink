/**
 * ===========================================
 * BATTLE-VFX.JS - 战斗视觉特效引擎
 * ===========================================
 * 
 * 从 battle/effect/debug-console.js 嫁接
 * 适配主项目 DOM 结构 (index.html)
 * 
 * 职责:
 * - 攻击命中特效 (属性图标爆裂 + 扩散环 + 全屏闪光)
 * - 接触类冲撞动画 (dash-strike 透视冲撞)
 * - 未命中/闪避动画
 * - 能力变化粒子 (BUFF↑ / DEBUFF↓ / HEAL+)
 * - 状态异常图标弹跳 (BRN / FRZ / PAR / PSN)
 * 
 * 依赖: index.css 中的 VFX 动画库
 */

const TYPE_COLORS = {
    Normal: '#a8a878',   Fire: '#f08030',    Water: '#6890f0',
    Grass: '#78c850',    Electric: '#f8d030', Ice: '#98d8d8',
    Fighting: '#c03028', Poison: '#a040a0',  Ground: '#e0c068',
    Flying: '#a890f0',   Psychic: '#f85888', Bug: '#a8b820',
    Rock: '#b8a038',     Ghost: '#705898',   Dragon: '#7038f8',
    Dark: '#705848',     Steel: '#b8b8d0',   Fairy: '#ee99ac',
    // lowercase aliases
    normal: '#a8a878',   fire: '#f08030',    water: '#6890f0',
    grass: '#78c850',    electric: '#f8d030', ice: '#98d8d8',
    fighting: '#c03028', poison: '#a040a0',  ground: '#e0c068',
    flying: '#a890f0',   psychic: '#f85888', bug: '#a8b820',
    rock: '#b8a038',     ghost: '#705898',   dragon: '#7038f8',
    dark: '#705848',     steel: '#b8b8d0',   fairy: '#ee99ac'
};

window.TYPE_COLORS = TYPE_COLORS;

const CDN_TYPE_ICONS = 'https://cdn.jsdelivr.net/gh/duiker101/pokemon-type-svg-icons/icons/';

// ============================================
// 辅助：根据 spriteId 找到 wrapper 和 sprite
// ============================================

function _getElements(spriteId) {
    const sprite = document.getElementById(spriteId);
    if (!sprite) return null;
    const wrapper = sprite.closest('.sprite-wrapper');
    return { sprite, wrapper };
}

function _getSide(spriteId) {
    return spriteId === 'player-sprite' ? 'player' : 'enemy';
}

function _getWrapper(side) {
    return document.querySelector(`.${side}-pos`);
}

// ============================================
// 1. 远程攻击命中特效 (属性图标 + 扩散环 + 闪光)
// ============================================

function triggerRangedVFX(type, targetSpriteId, effectiveness, isCritical) {
    const typeLower = (type || 'normal').toLowerCase();
    const color = TYPE_COLORS[typeLower] || '#FFFFFF';

    const els = _getElements(targetSpriteId);
    if (!els) return;
    const { sprite: targetSprite, wrapper: targetWrapper } = els;

    // 效果强度
    let effKey = 'normal';
    if (effectiveness >= 2) effKey = 'super';
    else if (effectiveness > 0 && effectiveness <= 0.5) effKey = 'weak';

    let intensityMulti = 1.0;
    if (effKey === 'weak') intensityMulti = 0.6;
    if (effKey === 'super') intensityMulti = 1.6;
    if (isCritical) intensityMulti *= 1.25;

    // --- 全屏闪光 ---
    const flashDiv = document.createElement('div');
    flashDiv.className = 'flash-overlay';
    flashDiv.style.setProperty('--flash-color', isCritical ? '#ffffff' : color);

    let flashDuration = '0.3s';
    if (effKey === 'weak') flashDuration = '0.1s';
    if (effKey === 'super') flashDuration = '0.6s';
    flashDiv.style.animation = `screen-flash ${flashDuration} ease-out forwards`;
    if (effKey === 'weak') flashDiv.style.opacity = '0.3';

    const stage = document.querySelector('.battle-stage');
    if (stage) {
        stage.appendChild(flashDiv);
        setTimeout(() => flashDiv.remove(), 600);
    }

    // --- 精灵震动 (应用在 wrapper 上，不覆盖极巨化等精灵自身动画) ---
    if (targetWrapper) {
        const shakeDuration = effKey === 'weak' ? '0.2s' : '0.5s';
        targetWrapper.style.animation = `shake-hard ${shakeDuration} ease-out`;
        setTimeout(() => { targetWrapper.style.animation = ''; }, 600);
    }

    // --- 属性图标爆裂 + 扩散环 ---
    const vfxAnchor = document.createElement('div');
    vfxAnchor.className = 'vfx-hit-anchor';
    vfxAnchor.style.setProperty('--flash-color', color);
    vfxAnchor.style.transform = `scale(${intensityMulti})`;

    if (effKey === 'weak') vfxAnchor.classList.add('eff-weak');
    if (effKey === 'super') vfxAnchor.classList.add('eff-super');
    if (isCritical) vfxAnchor.classList.add('is-crit');

    const burstIcon = document.createElement('img');
    burstIcon.src = `${CDN_TYPE_ICONS}${typeLower}.svg`;
    burstIcon.className = 'vfx-icon';
    if (!isCritical) {
        burstIcon.style.animation = 'icon-burst 0.6s ease-out forwards';
    }

    const burstRing = document.createElement('div');
    burstRing.className = 'vfx-ring';
    burstRing.style.borderColor = color;
    burstRing.style.boxShadow = effKey !== 'weak' ? `0 0 20px ${color}` : 'none';
    burstRing.style.animation = 'ring-expand 0.5s ease-out forwards';

    vfxAnchor.appendChild(burstRing);

    if (effKey === 'super') {
        const echoRing = burstRing.cloneNode(true);
        echoRing.classList.add('echo-wave');
        vfxAnchor.appendChild(echoRing);
    }

    vfxAnchor.appendChild(burstIcon);
    targetWrapper.appendChild(vfxAnchor);

    setTimeout(() => vfxAnchor.remove(), 800);
}

// ============================================
// 2. 接触类冲撞动画 (dash-strike)
// ============================================

function triggerContactVFX(type, attackerSpriteId, effectiveness, isCritical) {
    const atkEls = _getElements(attackerSpriteId);
    if (!atkEls) return;
    const { sprite: atkSprite, wrapper: atkWrap } = atkEls;

    const defSpriteId = attackerSpriteId === 'player-sprite' ? 'enemy-sprite' : 'player-sprite';
    const defEls = _getElements(defSpriteId);
    if (!defEls) return;
    const { wrapper: defWrap } = defEls;

    const atkRect = atkWrap.getBoundingClientRect();
    const defRect = defWrap.getBoundingClientRect();

    let dx = (defRect.left + defRect.width / 2) - (atkRect.left + atkRect.width / 2);
    let dy = (defRect.top + defRect.height / 2) - (atkRect.top + atkRect.height / 2);

    const gapX = 100;
    const gapY = 0;
    let startScale, endScale;

    const isPlayer = attackerSpriteId === 'player-sprite';
    if (isPlayer) {
        dx -= gapX; dy -= gapY;
        startScale = 1.4; endScale = 0.7;
    } else {
        dx += gapX; dy += gapY - 40; // 【微调】敌方终点向上偏移 40px
        startScale = 1.0; endScale = 1.2;
    }

    atkSprite.style.setProperty('--atk-x', `${dx}px`);
    atkSprite.style.setProperty('--atk-y', `${dy}px`);
    atkSprite.style.setProperty('--scale-start', startScale);
    atkSprite.style.setProperty('--scale-end', endScale);

    atkSprite.classList.remove('anim-dash');
    void atkSprite.offsetWidth;
    atkSprite.classList.add('anim-dash');

    setTimeout(() => {
        // 接触命中音效（延迟到冲撞到位时播放）
        if (typeof window.playHitSFX === 'function') {
            window.playHitSFX(effectiveness, isCritical);
        }

        triggerRangedVFX(type, defSpriteId, effectiveness, isCritical);

        // 画面震动
        const stage = document.querySelector('.battle-stage');
        if (stage) {
            let shakePower = 5;
            if (effectiveness <= 0.5) shakePower = 2;
            if (effectiveness >= 2) shakePower = 10;
            if (isCritical) shakePower += 5;

            stage.style.transition = 'transform 0.05s';
            const sx = Math.random() * shakePower * 2 - shakePower;
            const sy = Math.random() * shakePower - shakePower / 2;
            stage.style.transform = `translate(${sx}px, ${sy}px)`;
            setTimeout(() => { stage.style.transform = 'none'; }, 60);
        }
    }, 350);

    // 清理（安全引用，防止 pivot 换人后精灵元素被替换）
    const atkSpriteRef = atkSprite;
    setTimeout(() => {
        try {
            atkSpriteRef.classList.remove('anim-dash');
            atkSpriteRef.style.removeProperty('--atk-x');
            atkSpriteRef.style.removeProperty('--atk-y');
            atkSpriteRef.style.removeProperty('--scale-start');
            atkSpriteRef.style.removeProperty('--scale-end');
        } catch(e) { /* sprite may have been replaced by pivot switch */ }
    }, 1050);
}

// ============================================
// 3. 未命中/闪避动画
// ============================================

function triggerMissVFX(targetSpriteId) {
    const els = _getElements(targetSpriteId);
    if (!els) return;
    const { sprite: targetSprite, wrapper: targetWrapper } = els;

    if (targetSprite) {
        targetSprite.classList.remove('anim-dodge');
        void targetSprite.offsetWidth;
        targetSprite.classList.add('anim-dodge');
    }

    const missText = document.createElement('div');
    missText.className = 'vfx-text-popup';
    missText.innerText = 'MISS';
    targetWrapper.appendChild(missText);

    setTimeout(() => {
        if (targetSprite) targetSprite.classList.remove('anim-dodge');
        missText.remove();
    }, 800);
}

// ============================================
// 4. 能力变化粒子 (BUFF / DEBUFF / HEAL)
// ============================================

function triggerStatVFX(mode, targetSpriteId) {
    const els = _getElements(targetSpriteId);
    if (!els) return;
    const { sprite: targetSprite, wrapper: targetWrap } = els;

    let color = '#ffffff';
    let animName = 'sc-rise';
    let className = 'vfx-arrow';

    if (mode === 'BUFF') {
        color = '#f0932b';
        animName = 'sc-rise';
    } else if (mode === 'DEBUFF') {
        color = '#33cfed';
        animName = 'sc-fall';
        className = 'vfx-arrow down';
    } else if (mode === 'HEAL') {
        color = '#2ed573';
        animName = 'sc-rise';
        className = 'vfx-plus';
    }

    // 光晕效果应用在 wrapper 上，不干扰精灵自身动画（极巨化等）
    if (targetWrap) {
        targetWrap.style.setProperty('--stat-color', color);
        targetWrap.style.animation = 'aura-pulse 1s ease-in-out';
    }

    const particleBox = document.createElement('div');
    particleBox.className = 'stat-particle-container';
    targetWrap.appendChild(particleBox);

    for (let i = 0; i < 3; i++) {
        const p = document.createElement('div');
        p.className = className;
        p.style.setProperty('--stat-color', color);
        p.style.backgroundColor = color;
        const randX = (Math.random() - 0.5) * 60;
        const delay = i * 0.15;
        p.style.left = `calc(50% + ${randX}px)`;
        p.style.animation = `${animName} 0.8s ease-out forwards`;
        p.style.animationDelay = `${delay}s`;
        particleBox.appendChild(p);
    }

    setTimeout(() => {
        particleBox.remove();
        if (targetWrap) targetWrap.style.animation = '';
    }, 1200);
}

// ============================================
// 5. 状态异常图标弹跳 (BRN / FRZ / PAR / PSN / SLP / CNF / FLINCH)
// ============================================

// 内联 SVG 图标 — 使用 data/svg/ 中的属性图标
const STATUS_INLINE_SVG = {
    // 灼伤 → 火属性 (data/svg/fire.svg)
    BRN: `<svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M352.258 395.394C358.584 372.263 346.305 324.71 346.305 324.71C346.305 324.71 337.399 363.449 323.483 377.767C311.611 389.98 297.066 398.451 276.206 400.677C293.261 392.393 304.99 375.12 304.99 355.155C304.99 327.129 281.878 304.409 253.368 304.409C224.858 304.409 201.745 327.129 201.745 355.155C201.745 362.809 203.47 370.068 206.557 376.576C188.725 362.37 185.921 339.594 185.921 339.594C185.921 339.594 166.009 422.264 220.875 461.152C275.74 500.04 383.219 466.614 383.219 466.614C383.219 466.614 229.41 574.837 115.436 457.05C17.2568 355.584 89.8111 222.003 89.8111 222.003C89.8111 222.003 86.6777 234.395 86.6777 248.78C86.6777 263.165 94.477 274.11 94.477 274.11C94.477 274.11 117.742 225.071 135.848 205.128C152.984 186.254 174.465 170.946 193.019 157.724C207.301 147.546 219.849 138.604 227.343 130.223C268.62 84.0687 243.311 0 243.311 0C243.311 0 289.841 41.02 302.831 93.9978C307.783 114.192 304.597 137.169 301.749 157.716C297.125 191.072 293.388 218.025 326.793 216.276C380.775 213.449 333.866 130.223 333.866 130.223C333.866 130.223 456.318 194.583 447.17 307.145C438.021 419.707 313.324 445.297 313.324 445.297C313.324 445.297 345.931 418.525 352.258 395.394Z"/></svg>`,
    // 冰冻 → 冰属性 (data/svg/ice.svg)
    FRZ: `<svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M384.304 39.0418L385.879 177.392L265.209 235.319L263.721 104.69L384.304 39.0418Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M505.269 257.047L385.814 325.374L266.288 256.939L385.752 194.187L505.269 257.047Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M245.04 257.047L125.585 325.374L6.05861 256.939L125.523 194.187L245.04 257.047Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M124.243 38.4753L248.229 99.881L245.059 233.697L127.993 175.719L124.243 38.4753Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M387.678 473.525L263.692 412.119L266.862 278.302L383.928 336.281L387.678 473.525Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M128.525 474.77L126.949 336.42L247.62 278.493L249.108 409.121L128.525 474.77Z"/></svg>`,
    // 麻痹 → 电属性 (data/svg/electric.svg)
    PAR: `<svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M152.56 0.583659C152.461 0.29796 152.674 0 152.976 0H332.805C332.998 0 333.169 0.125587 333.226 0.309782L415.824 267.171C415.911 267.454 415.7 267.741 415.403 267.741H295.684C295.538 267.741 295.433 267.88 295.473 268.021L364.135 509.726C364.269 510.195 363.654 510.501 363.361 510.111L96.5295 155.267C96.3115 154.977 96.5184 154.563 96.881 154.563H205.536C205.687 154.563 205.793 154.414 205.743 154.271L152.56 0.583659Z"/></svg>`,
    // 中毒 → 毒属性 (data/svg/poison.svg)
    PSN: `<svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M427.821 393.449C479.524 352.108 512 292.376 512 225.95C512 101.161 397.385 0 256 0C114.615 0 0 101.161 0 225.95C0 289.978 30.1737 347.786 78.6553 388.901C75.7171 399.046 74.1052 410.081 74.1052 421.62C74.1052 471.535 104.267 512 141.474 512C165.65 512 186.852 494.915 198.737 469.254C210.622 494.915 231.824 512 256 512C278.038 512 297.604 497.804 309.895 475.857C322.186 497.804 341.752 512 363.789 512C400.996 512 431.158 471.535 431.158 421.62C431.158 411.784 429.986 402.314 427.821 393.449ZM404.211 230.431C404.211 293.785 336.346 345.144 252.632 345.144C168.917 345.144 101.053 293.785 101.053 230.431C101.053 167.077 168.917 115.718 252.632 115.718C336.346 115.718 404.211 167.077 404.211 230.431Z"/></svg>`,
    // 剧毒 → 毒属性 (data/svg/poison.svg)
    TOX: `<svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M427.821 393.449C479.524 352.108 512 292.376 512 225.95C512 101.161 397.385 0 256 0C114.615 0 0 101.161 0 225.95C0 289.978 30.1737 347.786 78.6553 388.901C75.7171 399.046 74.1052 410.081 74.1052 421.62C74.1052 471.535 104.267 512 141.474 512C165.65 512 186.852 494.915 198.737 469.254C210.622 494.915 231.824 512 256 512C278.038 512 297.604 497.804 309.895 475.857C322.186 497.804 341.752 512 363.789 512C400.996 512 431.158 471.535 431.158 421.62C431.158 411.784 429.986 402.314 427.821 393.449ZM404.211 230.431C404.211 293.785 336.346 345.144 252.632 345.144C168.917 345.144 101.053 293.785 101.053 230.431C101.053 167.077 168.917 115.718 252.632 115.718C336.346 115.718 404.211 167.077 404.211 230.431Z"/></svg>`,
    // 睡眠：月亮+Zzz (保留原有)
    SLP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 25" fill="currentColor"><path d="M15.59848,10.838v.02a6.31,6.31,0,1,1-6.83-6.29.47821.47821,0,0,1,.49.28.50026.50026,0,0,1-.09.56,3.77067,3.77067,0,1,0,5.55,5.1.47652.47652,0,0,1,.55005-.14A.49612.49612,0,0,1,15.59848,10.838ZM10.9111,3.832h1.12305l-1.5376,2.27734a.50012.50012,0,0,0,.41455.77979h2.064a.5.5,0,0,0,0-1H11.852l1.53759-2.27734a.50012.50012,0,0,0-.41455-.77979h-2.064a.5.5,0,0,0,0,1Zm5.61035,3.98633h-.53076l.94531-1.3999a.50012.50012,0,0,0-.41455-.77979H14.88376a.5.5,0,0,0,0,1h.69677l-.94531,1.3999a.50012.50012,0,0,0,.41455.77979h1.47168a.5.5,0,0,0,0-1Z"/></svg>`,
    // 混乱 → 超能属性 (data/svg/psychic.svg)
    CNF: `<svg viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M455.925 425.184C455.925 425.184 391.365 476.963 262.893 455.536C165.423 439.279 113.437 331.833 113.437 274.079C113.437 137.149 214.783 105.988 283.3 105.988C351.816 105.988 396.513 172.788 396.513 224.508C396.513 276.228 359.933 321.466 303.006 321.466C246.08 321.466 229.22 281.501 229.22 244.758C229.22 208.016 258.947 195.071 286.058 195.071C313.169 195.071 322.452 218.217 322.452 238.11C322.452 258.004 307.017 265.128 294.143 265.128C281.269 265.128 279.996 258.633 275.069 251.807C270.141 244.982 281.353 219.146 262.893 219.146C244.433 219.146 240.992 248.847 240.992 248.847C240.992 248.847 247.722 306.18 303.006 305.191C358.291 304.201 384.518 261.461 376.896 219.146C369.274 176.83 328.207 131.865 256.133 140.951C184.059 150.037 154.632 222.861 167.603 300.685C180.574 378.51 273.807 423.602 347.112 407.379C420.418 391.156 493.429 338.086 493.429 203.533C493.429 68.9789 376.896 -11.9002 237.941 1.42913C98.9859 14.7584 12.729 136.242 18.2502 282.207C23.7714 428.172 162.275 507.669 279.394 511.766C396.513 515.864 468.312 448.067 468.312 448.067C468.312 448.067 484.459 433.668 478.128 422.424C471.798 411.18 455.925 425.184 455.925 425.184Z"/></svg>`,
    // 畏缩：X眼惊恐脸 (保留原有)
    FLINCH: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm61.66-93.66a8,8,0,0,1-11.32,11.32L168,123.31l-10.34,10.35a8,8,0,0,1-11.32-11.32L156.69,112l-10.35-10.34a8,8,0,0,1,11.32-11.32L168,100.69l10.34-10.35a8,8,0,0,1,11.32,11.32L179.31,112Zm-80-20.68L99.31,112l10.35,10.34a8,8,0,0,1-11.32,11.32L88,123.31,77.66,133.66a8,8,0,0,1-11.32-11.32L76.69,112,66.34,101.66A8,8,0,0,1,77.66,90.34L88,100.69,98.34,90.34a8,8,0,0,1,11.32,11.32ZM140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"/></svg>`
};

function triggerStatusVFX(statusType, targetSpriteId) {
    const els = _getElements(targetSpriteId);
    if (!els) return;
    const { sprite: targetSprite, wrapper: targetWrap } = els;

    const config = {
        BRN:    { inline: true, color: '#e15f41', shake: true,  anim: 'rise-burn',      duration: 1200 },
        FRZ:    { inline: true, color: '#74b9ff', shake: false, anim: 'pulse-freeze',   duration: 1400 },
        PAR:    { inline: true, color: '#f9ca24', shake: true,  anim: 'zap-paralyze',   duration: 1000 },
        PSN:    { inline: true, color: '#a55eea', shake: false, anim: 'drip-poison',    duration: 1200 },
        TOX:    { inline: true, color: '#6c5ce7', shake: true,  anim: 'drip-poison',    duration: 1200 },
        SLP:    { inline: true, color: '#5b6abf', shake: false, anim: 'float-sleep',    duration: 1500 },
        CNF:    { inline: true, color: '#f85888', shake: true,  anim: 'spin-confuse',   duration: 1200 },
        FLINCH: { inline: true, color: '#ff6b6b', shake: true,  anim: 'shake-flinch',   duration: 1000 }
    };

    const cfg = config[statusType] || config.PSN;
    const duration = cfg.duration || 1000;

    // 光晕 + 震动应用在 wrapper 上，不干扰精灵自身动画（极巨化等）
    if (targetWrap) {
        targetWrap.style.setProperty('--stat-color', cfg.color);
        // 每种状态有独特的精灵动画
        const wrapAnims = {
            BRN:    'aura-pulse 0.8s ease-in-out, burn-flicker 1.2s ease-in-out',
            FRZ:    'aura-pulse 1.0s ease-in-out, freeze-shiver 1.4s ease-in-out',
            PAR:    'aura-pulse 0.6s ease-in-out, paralyze-jolt 0.8s ease-out',
            PSN:    'aura-pulse 0.8s ease-in-out, poison-throb 1.2s ease-in-out',
            TOX:    'aura-pulse 0.8s ease-in-out, poison-throb 1.2s ease-in-out',
            SLP:    'sleep-dim 1.5s ease-in-out',
            CNF:    'aura-pulse 0.8s ease-in-out, confuse-wobble 1.2s ease-in-out',
            FLINCH: 'aura-pulse 0.6s ease-in-out, flinch-recoil 0.5s ease-out'
        };
        targetWrap.style.animation = wrapAnims[statusType] || (cfg.shake
            ? 'aura-pulse 0.8s ease-in-out, shake-hard 0.4s ease-out'
            : 'aura-pulse 0.8s ease-in-out');
    }

    // 创建图标元素 (全部使用内联 SVG)
    let iconEl;
    if (STATUS_INLINE_SVG[statusType]) {
        iconEl = document.createElement('div');
        iconEl.innerHTML = STATUS_INLINE_SVG[statusType];
        iconEl.className = `vfx-status-icon vfx-status-${statusType.toLowerCase()}`;
        iconEl.style.color = cfg.color;
        iconEl.style.filter = `drop-shadow(0 0 6px ${cfg.color}) drop-shadow(0 0 12px ${cfg.color}80)`;
    } else {
        // 后备：CDN 图标
        iconEl = document.createElement('img');
        iconEl.src = `${CDN_TYPE_ICONS}${cfg.file || 'poison.svg'}`;
        iconEl.className = 'vfx-status-icon';
        iconEl.style.filter = `drop-shadow(0 0 5px ${cfg.color}) drop-shadow(0 0 10px white)`;
    }

    targetWrap.appendChild(iconEl);

    setTimeout(() => {
        iconEl.remove();
        if (targetWrap) targetWrap.style.animation = '';
    }, duration);
}

// ============================================
// 6. 综合攻击 VFX 入口 (供 battle-damage.js 调用)
// ============================================

/**
 * 播放完整攻击 VFX
 * @param {string} attackerSpriteId - 攻击方精灵 ID
 * @param {string} defenderSpriteId - 防御方精灵 ID
 * @param {object} move - 招式数据
 * @param {object} result - 伤害计算结果 { effectiveness, isCrit }
 */
function playAttackVFX(attackerSpriteId, defenderSpriteId, move, result) {
    const moveType = (move.type || 'Normal').toLowerCase();
    const effectiveness = result.effectiveness || 1;
    const isCrit = result.isCrit || false;

    // 判断接触/非接触
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    const isContact = !!(fullMoveData.flags && fullMoveData.flags.contact);

    // 【折返/换人技】强制非接触，避免冲撞动画与换人流程冲突
    const isPivotMove = !!(result.pivot || fullMoveData.selfSwitch);

    // 物理技默认接触，特殊技默认非接触（除非 flags 明确标注）
    const cat = (move.cat || '').toLowerCase();
    const shouldContact = !isPivotMove && (isContact || (cat === 'phys' && !fullMoveData.flags));

    if (shouldContact) {
        triggerContactVFX(moveType, attackerSpriteId, effectiveness, isCrit);
    } else {
        triggerRangedVFX(moveType, defenderSpriteId, effectiveness, isCrit);
    }

    return { isContact: shouldContact };
}

// ============================================
// 导出到全局
// ============================================

window.BattleVFX = {
    triggerRangedVFX,
    triggerContactVFX,
    triggerMissVFX,
    triggerStatVFX,
    triggerStatusVFX,
    playAttackVFX,
    TYPE_COLORS
};
