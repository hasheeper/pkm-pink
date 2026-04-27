/**
 * ===========================================
 * UI-RENDERER.JS - 核心 UI 渲染
 * ===========================================
 * 
 * 职责:
 * - 血条渲染
 * - 精灵球槽渲染
 * - UI 缩放
 */

// ============================================
// UI 缩放
// ============================================

/**
 * 固定画布等比缩放 (基准 1280x720)
 */
function updateUIScale() {
    const baseW = 1280;
    const baseH = 720;
    const pad = 0;
    const vw = Math.max(0, window.innerWidth - pad * 2);
    const vh = Math.max(0, window.innerHeight - pad * 2);
    const scale = Math.min(vw / baseW, vh / baseH);
    const el = document.getElementById('ui-scale');
    if (!el) return;
    el.style.setProperty('--ui-scale', String(scale));
}

// ============================================
// 血条渲染
// ============================================

/**
 * 渲染血条
 * @param {string} who 'player' 或 'enemy'
 * @param {number} curr 当前 HP
 * @param {number} max 最大 HP
 */
function renderHp(who, curr, max) {
    const pct = Math.max(0, (curr / max) * 100);
    const bar = document.getElementById(`${who}-hp-fill`);
    const txt = document.getElementById(`${who}-hp-txt`);

    if (bar) {
        bar.style.width = pct + "%";
        bar.style.background = pct < 20 ? 'var(--hp-low)' : (pct < 50 ? 'var(--hp-mid)' : 'var(--hp-high)');
    }
    if (txt) txt.innerText = `${curr}/${max}`;
}

// ============================================
// 精灵球槽渲染
// ============================================

/**
 * 渲染 6 个精灵球槽作为状态显示
 * @param {string} idBox DOM 元素 ID
 * @param {Array} party 队伍数组
 * @param {number} idxActive 当前出战索引
 */
function renderDots(idBox, party, idxActive) {
    const box = document.getElementById(idBox);
    if (!box) return;
    box.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const slot = document.createElement('div');
        slot.className = 'poke-slot';

        if (i >= party.length) {
            slot.classList.add('empty');
        } else {
            const pm = party[i];
            if (pm.isAlive()) {
                slot.classList.add('alive');
            } else {
                slot.classList.add('dead');
            }

            if (i === idxActive) {
                slot.classList.add('active');
            }
        }

        box.appendChild(slot);
    }
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.updateUIScale = updateUIScale;
    window.renderHp = renderHp;
    window.renderDots = renderDots;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateUIScale,
        renderHp,
        renderDots
    };
}
