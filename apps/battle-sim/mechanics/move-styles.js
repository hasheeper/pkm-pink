/**
 * ===========================================
 * MOVE-STYLES.JS - 古武系统（招式风格）
 * ===========================================
 * 
 * 职责:
 * - 招式风格状态管理 (道/迅/刚)
 * - 风格切换 UI 更新
 * - 冷却状态显示
 */

// ============================================
// 状态与常量
// ============================================

// 当前选择的招式风格
let currentMoveStyle = 'normal';

// 风格序列
const STYLE_SEQUENCE = ['normal', 'agile', 'strong', 'focus'];

// 风格标签（中文显示）
const STYLE_LABELS = {
    normal: '道',
    agile: '迅',
    strong: '刚',
    focus: '凝'
};

// ============================================
// 核心函数
// ============================================

/**
 * 设置当前招式风格
 * @param {string} style - 'normal' | 'agile' | 'strong' | 'focus'
 * @param {{silent?: boolean, animate?: boolean}} options
 */
function setMoveStyle(style, options = {}) {
    if (!STYLE_SEQUENCE.includes(style)) style = 'normal';
    const prev = currentMoveStyle;
    currentMoveStyle = style;
    
    // 同步更新全局变量，确保战斗逻辑能读取到最新值
    if (typeof window !== 'undefined') {
        window.currentMoveStyle = currentMoveStyle;
    }

    const orb = document.getElementById('btn-style-taiji');
    const label = document.getElementById('taiji-text');

    if (orb) {
        STYLE_SEQUENCE.forEach(cls => orb.classList.remove(cls));
        orb.classList.add(style);
        
        // 【冷却状态】检查是否在冷却中，如果是则添加 disabled 样式
        // 需要访问全局 battle 对象
        const battle = typeof window !== 'undefined' ? window.battle : null;
        if (battle && battle.playerStyleCooldown > 0) {
            orb.classList.add('cooldown');
            orb.style.opacity = '0.4';
            orb.style.filter = 'grayscale(80%)';
            orb.style.pointerEvents = 'none';
        } else {
            orb.classList.remove('cooldown');
            orb.style.opacity = '';
            orb.style.filter = '';
            orb.style.pointerEvents = '';
        }
    }

    if (label) {
        const nextChar = STYLE_LABELS[style] || '道';
        // 【冷却状态】冷却中显示特殊字符
        const battle = typeof window !== 'undefined' ? window.battle : null;
        const displayChar = (battle && battle.playerStyleCooldown > 0) ? '休' : nextChar;
        if (options.animate !== false && prev !== style) {
            animateTaijiText(label, displayChar);
        } else {
            label.textContent = displayChar;
        }
    }

    if (!options.silent) {
        console.log(`[STYLES] 招式风格切换为: ${style}`);
    }
}

/**
 * 更新风格按钮的冷却状态显示
 */
function updateStyleButtonCooldown() {
    const orb = document.getElementById('btn-style-taiji');
    const label = document.getElementById('taiji-text');
    
    if (!orb) return;
    
    const battle = typeof window !== 'undefined' ? window.battle : null;
    const isCooldown = battle && battle.playerStyleCooldown > 0;
    
    if (isCooldown) {
        orb.classList.add('cooldown');
        orb.style.opacity = '0.4';
        orb.style.filter = 'grayscale(80%)';
        orb.style.pointerEvents = 'none';
        if (label) label.textContent = '休';
    } else {
        orb.classList.remove('cooldown');
        orb.style.opacity = '';
        orb.style.filter = '';
        orb.style.pointerEvents = '';
        if (label) label.textContent = STYLE_LABELS[currentMoveStyle] || '道';
    }
}

/**
 * 文字切换动画
 */
function animateTaijiText(el, newChar) {
    if (!el) return;
    el.style.transition = 'transform 0.15s ease, opacity 0.15s ease';
    el.style.transform = 'skewX(15deg) scale(0)';
    el.style.opacity = '0';
    setTimeout(() => {
        el.textContent = newChar;
        el.style.transform = 'skewX(15deg) scale(1.2)';
        el.style.opacity = '1';
        setTimeout(() => {
            el.style.transform = 'skewX(15deg) scale(1)';
        }, 150);
    }, 150);
}

/**
 * 循环切换风格：normal -> agile -> strong -> normal
 */
function cycleMoveStyle() {
    const idx = STYLE_SEQUENCE.indexOf(currentMoveStyle);
    const nextStyle = STYLE_SEQUENCE[(idx + 1) % STYLE_SEQUENCE.length];
    setMoveStyle(nextStyle);
}

/**
 * 获取当前招式风格
 * @returns {string} 'normal' | 'agile' | 'strong'
 */
function getCurrentMoveStyle() {
    return currentMoveStyle;
}

/**
 * 重置招式风格为默认
 */
function resetMoveStyle() {
    currentMoveStyle = 'normal';
    setMoveStyle('normal', { silent: true, animate: false });
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.currentMoveStyle = currentMoveStyle;
    window.STYLE_SEQUENCE = STYLE_SEQUENCE;
    window.STYLE_LABELS = STYLE_LABELS;
    window.setMoveStyle = setMoveStyle;
    window.updateStyleButtonCooldown = updateStyleButtonCooldown;
    window.animateTaijiText = animateTaijiText;
    window.cycleMoveStyle = cycleMoveStyle;
    window.getCurrentMoveStyle = getCurrentMoveStyle;
    window.resetMoveStyle = resetMoveStyle;
    
    // 使用 getter 保持 currentMoveStyle 同步
    Object.defineProperty(window, 'currentMoveStyle', {
        get: () => currentMoveStyle,
        set: (val) => { currentMoveStyle = val; }
    });
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        STYLE_SEQUENCE,
        STYLE_LABELS,
        setMoveStyle,
        updateStyleButtonCooldown,
        animateTaijiText,
        cycleMoveStyle,
        getCurrentMoveStyle,
        resetMoveStyle,
        get currentMoveStyle() { return currentMoveStyle; },
        set currentMoveStyle(val) { currentMoveStyle = val; }
    };
}
