/* ============================================================
   TRAINER DATABASE (NPC立绘与配置)
   ============================================================ */

/* ============================================================
   MOVE POOL SYSTEM (技能池系统 - 状态快照模式)
   基于当前等级获取所有可用技能，而非监听升级事件
   ============================================================ */

// 技能池缓存 (避免重复请求 PokeAPI)
const movePoolCache = {};

/**
 * 从 PokeAPI 获取宝可梦的技能池
 * @param {string} species - 宝可梦种类名 (如 "charizard")
 * @param {number} currentLv - 当前等级
 * @returns {Promise<Array>} - 可用技能列表 [{name, level, displayName}]
 */
async function fetchMovePool(species, currentLv) {
    if (!species) return [];
    
    const normalizedSpecies = species.toLowerCase().replace(/\s+/g, '-');
    const cacheKey = `${normalizedSpecies}_${currentLv}`;
    
    // 检查缓存
    if (movePoolCache[cacheKey]) {
        console.log('[MOVE_POOL] 使用缓存:', cacheKey);
        return movePoolCache[cacheKey];
    }
    
    try {
        console.log('[MOVE_POOL] 请求 PokeAPI:', normalizedSpecies);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalizedSpecies}`);
        
        if (!response.ok) {
            console.warn('[MOVE_POOL] API 请求失败:', response.status);
            return [];
        }
        
        const data = await response.json();
        const moves = data.moves || [];
        
        // 过滤: level-up 且 level <= currentLv
        const availableMoves = [];
        
        for (const moveEntry of moves) {
            const moveName = moveEntry.move.name;
            
            // 遍历版本组详情，找到 level-up 方式
            for (const vgd of moveEntry.version_group_details) {
                if (vgd.move_learn_method.name === 'level-up' && vgd.level_learned_at <= currentLv) {
                    // 避免重复添加同一招式
                    if (!availableMoves.find(m => m.name === moveName)) {
                        availableMoves.push({
                            name: moveName,
                            level: vgd.level_learned_at,
                            displayName: translateMoveName(moveName.replace(/-/g, ' '))
                        });
                    }
                    break;
                }
            }
        }
        
        // 按学习等级排序
        availableMoves.sort((a, b) => a.level - b.level);
        
        // 缓存结果
        movePoolCache[cacheKey] = availableMoves;
        console.log('[MOVE_POOL] 获取到', availableMoves.length, '个可用技能');
        
        return availableMoves;
    } catch (e) {
        console.error('[MOVE_POOL] 获取技能池失败:', e);
        return [];
    }
}

/**
 * 打开技能调整面板
 * @param {string} slotKey - 槽位键 (如 "slot1")
 */
window.openMovePoolPanel = async function(slotKey) {
    const pkm = db?.player?.party?.[slotKey];
    if (!pkm || !pkm.name) {
        console.warn('[MOVE_POOL] 无效的槽位:', slotKey);
        return;
    }
    
    const species = pkm.species || pkm.name;
    const currentLv = pkm.lv || 1;
    const currentMoves = pkm.moves || {};
    
    // 显示加载状态
    showMovePoolModal(slotKey, species, currentLv, currentMoves, null, true);
    
    // 获取技能池
    const movePool = await fetchMovePool(species, currentLv);
    
    // 更新面板显示
    showMovePoolModal(slotKey, species, currentLv, currentMoves, movePool, false);
};

/**
 * 显示技能池模态框
 */
function showMovePoolModal(slotKey, species, lv, currentMoves, movePool, isLoading) {
    // 移除已存在的面板
    const existingPanel = document.getElementById('move-pool-modal');
    if (existingPanel) existingPanel.remove();
    
    const displayName = translatePokemonNameApp(species);
    
    // 当前技能列表
    const moveKeys = ['move1', 'move2', 'move3', 'move4'];
    const currentMoveNames = moveKeys.map(k => currentMoves[k] || null);
    
    let currentMovesHtml = currentMoveNames.map((moveName, idx) => {
        const displayMove = moveName ? translateMoveName(moveName.replace(/-/g, ' ')) : '—';
        const isEmpty = !moveName;
        return `
            <div class="mpm-current-move ${isEmpty ? 'empty' : ''}" data-slot="${idx}" data-move="${moveName || ''}">
                <span class="mpm-move-idx">${idx + 1}</span>
                <span class="mpm-move-name">${displayMove}</span>
                ${!isEmpty ? `<button class="mpm-remove-btn" onclick="removeMoveFromSlot('${slotKey}', ${idx})">✕</button>` : ''}
            </div>
        `;
    }).join('');
    
    // 可用技能池
    let poolHtml = '';
    if (isLoading) {
        poolHtml = '<div class="mpm-loading"><span class="mpm-spinner"></span>Loading Move Pool...</div>';
    } else if (!movePool || movePool.length === 0) {
        poolHtml = '<div class="mpm-empty">No available moves found.</div>';
    } else {
        // 过滤掉已装备的技能
        const equippedMoves = currentMoveNames.filter(Boolean).map(m => m.toLowerCase());
        const unequippedMoves = movePool.filter(m => !equippedMoves.includes(m.name.toLowerCase()));
        
        poolHtml = unequippedMoves.map(move => `
            <div class="mpm-pool-move" onclick="selectMoveFromPool('${slotKey}', '${move.name}')">
                <span class="mpm-pool-lv">Lv.${move.level}</span>
                <span class="mpm-pool-name">${move.displayName}</span>
            </div>
        `).join('');
        
        if (unequippedMoves.length === 0) {
            poolHtml = '<div class="mpm-empty">All available moves are equipped.</div>';
        }
    }
    
    const modalHtml = `
    <div id="move-pool-modal" class="mpm-overlay" onclick="closeMovePoolModal(event)">
        <div class="mpm-container" onclick="event.stopPropagation()">
            <div class="mpm-header">
                <div class="mpm-title">
                    <span class="mpm-species">${displayName}</span>
                    <span class="mpm-lv">Lv.${lv}</span>
                </div>
                <button class="mpm-close" onclick="closeMovePoolModal()">✕</button>
            </div>
            <div class="mpm-body">
                <div class="mpm-section mpm-current">
                    <div class="mpm-section-title">EQUIPPED MOVES</div>
                    <div class="mpm-current-list">
                        ${currentMovesHtml}
                    </div>
                </div>
                <div class="mpm-section mpm-pool">
                    <div class="mpm-section-title">AVAILABLE POOL <small>(Lv.1 ~ Lv.${lv})</small></div>
                    <div class="mpm-pool-list">
                        ${poolHtml}
                    </div>
                </div>
            </div>
            <div class="mpm-footer">
                <button class="mpm-save-btn" onclick="saveMoveChanges('${slotKey}')">SAVE CHANGES</button>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * 关闭技能池面板
 */
window.closeMovePoolModal = function(event) {
    if (event && event.target.id !== 'move-pool-modal') return;
    const modal = document.getElementById('move-pool-modal');
    if (modal) modal.remove();
};

// 临时存储待保存的技能变更
let pendingMoveChanges = {};

/**
 * 将连字符格式转换为首字母大写空格格式
 * 例如: "dragon-claw" -> "Dragon Claw"
 */
function normalizeMoveName(moveName) {
    if (!moveName) return null;
    return moveName
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * 从技能池选择技能
 */
window.selectMoveFromPool = function(slotKey, moveName) {
    // 初始化待保存变更
    if (!pendingMoveChanges[slotKey]) {
        const pkm = db?.player?.party?.[slotKey];
        pendingMoveChanges[slotKey] = { ...pkm?.moves };
    }
    
    // 找到第一个空槽位
    const moveKeys = ['move1', 'move2', 'move3', 'move4'];
    let targetSlot = null;
    
    for (const key of moveKeys) {
        if (!pendingMoveChanges[slotKey][key]) {
            targetSlot = key;
            break;
        }
    }
    
    if (!targetSlot) {
        // 所有槽位已满，提示用户先移除一个
        showMovePoolNotification('All move slots are full. Remove a move first.', 'warning');
        return;
    }
    
    // 设置技能（转换为首字母大写空格格式）
    pendingMoveChanges[slotKey][targetSlot] = normalizeMoveName(moveName);
    
    // 刷新面板
    refreshMovePoolPanel(slotKey);
};

/**
 * 从槽位移除技能
 */
window.removeMoveFromSlot = function(slotKey, slotIdx) {
    // 初始化待保存变更
    if (!pendingMoveChanges[slotKey]) {
        const pkm = db?.player?.party?.[slotKey];
        pendingMoveChanges[slotKey] = { ...pkm?.moves };
    }
    
    const moveKey = `move${slotIdx + 1}`;
    pendingMoveChanges[slotKey][moveKey] = null;
    
    // 刷新面板
    refreshMovePoolPanel(slotKey);
};

/**
 * 刷新技能池面板
 */
async function refreshMovePoolPanel(slotKey) {
    const pkm = db?.player?.party?.[slotKey];
    if (!pkm) return;
    
    const species = pkm.species || pkm.name;
    const currentLv = pkm.lv || 1;
    const currentMoves = pendingMoveChanges[slotKey] || pkm.moves || {};
    
    // 从缓存获取技能池
    const movePool = await fetchMovePool(species, currentLv);
    
    showMovePoolModal(slotKey, species, currentLv, currentMoves, movePool, false);
}

/**
 * 保存技能变更到 ERA
 */
window.saveMoveChanges = async function(slotKey) {
    const changes = pendingMoveChanges[slotKey];
    if (!changes) {
        closeMovePoolModal();
        return;
    }
    
    const pkm = db?.player?.party?.[slotKey];
    const originalMoves = pkm?.moves || {};
    
    // 计算变化的技能（只记录真正改变的）
    const changedMoves = {};
    const moveKeys = ['move1', 'move2', 'move3', 'move4'];
    for (const key of moveKeys) {
        const oldMove = originalMoves[key] || null;
        const newMove = changes[key] || null;
        if (oldMove !== newMove) {
            changedMoves[key] = { from: oldMove, to: newMove };
        }
    }
    
    // 更新本地 db
    if (pkm) {
        db.player.party[slotKey].moves = { ...changes };
    }
    
    const species = pkm?.species || pkm?.name || 'pokemon';
    const displayName = translatePokemonNameApp(species);
    
    // 生成 VariableEdit XML（只包含变化的技能）
    const variableEditXml = generateMoveVariableEdit(slotKey, changes, pkm, changedMoves);
    
    // 生成 AI 演绎提示词（只描述变化的技能）
    const aiPrompt = generateMoveChangeNarrative(slotKey, changes, pkm, changedMoves);
    
    // 合并内容：VariableEdit + AI提示词
    const fullContent = `${variableEditXml}\n\n${aiPrompt}`;
    
    // 复制到剪贴板
    try {
        await navigator.clipboard.writeText(fullContent);
        console.log('[MOVE_POOL] ✓ 已复制到剪贴板');
    } catch (e) {
        console.warn('[MOVE_POOL] 剪贴板复制失败，尝试降级方案:', e);
        fallbackCopyToClipboard(fullContent);
    }
    
    // 发送到酒馆
    sendMoveChangeToTavern(slotKey, changes);
    
    // 清理临时变更
    delete pendingMoveChanges[slotKey];
    
    // 关闭面板
    closeMovePoolModal();
    
    // 刷新 Party 列表
    renderPartyList();
    
    // 显示成功通知（包含复制提示）
    showMovePoolNotification(`${displayName} 技能已更新！VariableEdit 已复制到剪贴板`, 'success');
};

/**
 * 生成 VariableEdit XML 格式（只包含变化的技能）
 */
function generateMoveVariableEdit(slotKey, moves, pkm, changedMoves) {
    // 只输出变化的技能
    const changedKeys = Object.keys(changedMoves || {});
    
    if (changedKeys.length === 0) {
        return `<VariableEdit>\n// 无技能变化\n</VariableEdit>`;
    }
    
    // 只包含变化的技能槽
    const movesObj = {};
    for (const key of changedKeys) {
        movesObj[key] = moves[key] || null;
    }
    
    // 构建嵌套结构
    const editPayload = {
        player: {
            party: {
                [slotKey]: {
                    moves: movesObj
                }
            }
        }
    };
    
    return `<VariableEdit>
${JSON.stringify(editPayload, null, 2)}
</VariableEdit>`;
}

/**
 * 生成 AI 演绎提示词（只描述变化的技能）
 */
function generateMoveChangeNarrative(slotKey, moves, pkm, changedMoves) {
    const species = pkm?.species || pkm?.name || 'Pokemon';
    const displayName = pkm?.nickname || translatePokemonNameApp(species);
    const lv = pkm?.lv || '?';
    
    const changedKeys = Object.keys(changedMoves || {});
    
    if (changedKeys.length === 0) {
        return `[System Narrative Hint]\n${displayName} 的技能配置未发生变化。`;
    }
    
    // 构建变化描述
    const changeDescriptions = changedKeys.map(key => {
        const change = changedMoves[key];
        const fromName = change.from ? translateMoveName(change.from.replace(/-/g, ' ')) : '空槽';
        const toName = change.to ? translateMoveName(change.to.replace(/-/g, ' ')) : '空槽';
        return `${fromName} → ${toName}`;
    });
    
    const changeListStr = changeDescriptions.join('、');
    
    return `[System Event]
> 目标: ${displayName} (Lv.${lv})
> 技能已重组: ${changeListStr}`;
}

/**
 * 降级剪贴板复制方案
 */
function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
    } catch (e) {
        console.error('[MOVE_POOL] 降级复制也失败:', e);
    }
    document.body.removeChild(textarea);
}

/**
 * 发送技能变更到酒馆
 */
function sendMoveChangeToTavern(slotKey, moves) {
    const pkm = db?.player?.party?.[slotKey];
    const displayName = pkm ? translatePokemonNameApp(pkm.species || pkm.name) : 'Pokemon';
    
    // 构建技能列表文本
    const moveList = ['move1', 'move2', 'move3', 'move4']
        .map(k => moves[k] ? translateMoveName(moves[k].replace(/-/g, ' ')) : null)
        .filter(Boolean)
        .join(' | ');
    
    // 通过 postMessage 发送 VariableEdit
    const parentWindow = window.parent || window;
    
    // 发送 ERA 变量更新
    parentWindow.postMessage({
        type: 'PKM_UPDATE_MOVES',
        slotKey: slotKey,
        moves: moves
    }, '*');
    
    console.log('[MOVE_POOL] 技能变更已发送:', slotKey, moves);
}

/**
 * 显示技能池通知
 */
function showMovePoolNotification(message, type = 'info') {
    const colors = {
        success: '#00b894',
        warning: '#fdcb6e',
        error: '#ff7675',
        info: '#74b9ff'
    };
    
    const notif = document.createElement('div');
    notif.className = 'mpm-notification';
    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type]};
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10001;
        animation: mpmNotifIn 0.3s ease;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'mpmNotifOut 0.3s ease forwards';
        setTimeout(() => notif.remove(), 300);
    }, 2000);
}

// 技能池面板样式已移至 styles.css (Ver. Dawn Remastered)
// 此函数保留用于注入动画关键帧（如果 styles.css 未加载时的降级方案）
function injectMovePoolStyles() {
    // 样式已在 styles.css 中定义，此处仅作为降级检查
    // 如果 styles.css 正常加载，此函数无需执行任何操作
    console.log('[MOVE_POOL] 样式由 styles.css 提供 (Ver. Dawn)');
}

const translationLookupCache = {
    normalizedMap: null
};

function normalizeTranslationKey(key) {
    return String(key || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

function getNormalizedTranslationValue(key) {
    if (!key || typeof translations === 'undefined') return null;
    if (!translationLookupCache.normalizedMap) {
        const map = {};
        for (const originalKey in translations) {
            const normalizedKey = normalizeTranslationKey(originalKey);
            if (!(normalizedKey in map)) {
                map[normalizedKey] = translations[originalKey];
            }
        }
        translationLookupCache.normalizedMap = map;
    }

    return translationLookupCache.normalizedMap[normalizeTranslationKey(key)] || null;
}

/**
 * 翻译招式名称为中文
 * @param {string} moveName - 招式英文名称
 * @returns {string} - 中文名称，如果没有翻译则返回原名
 */
function translateMoveName(moveName) {
    if (!moveName) return '—';
    
    // 尝试从 translations 对象获取翻译
    if (typeof translations !== 'undefined') {
        // 直接匹配
        if (translations[moveName]) {
            return translations[moveName];
        }
        
        // 尝试首字母大写格式
        const capitalizedName = moveName.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        if (translations[capitalizedName]) {
            return translations[capitalizedName];
        }
        
        // 尝试连字符格式 (如 "Thunder-Punch" -> "Thunder Punch")
        const hyphenName = moveName.replace(/-/g, ' ');
        if (translations[hyphenName]) {
            return translations[hyphenName];
        }
        
        // 尝试下划线格式
        const underscoreName = moveName.replace(/_/g, ' ');
        if (translations[underscoreName]) {
            return translations[underscoreName];
        }

        const normalizedResult = getNormalizedTranslationValue(moveName);
        if (normalizedResult) {
            return normalizedResult;
        }
    }
    
    // 没有翻译，返回原名
    return moveName;
}

/**
 * 翻译宝可梦名称为中文 (app.js 版本)
 * @param {string} pokemonId - 宝可梦英文ID
 * @returns {string} - 中文名称
 */
function translatePokemonNameApp(pokemonId) {
    if (!pokemonId) return '???';
    
    let normalizedId = pokemonId.trim();
    
    if (typeof translations !== 'undefined') {
        // 直接匹配 (首字母大写)
        const capitalizedId = normalizedId.charAt(0).toUpperCase() + normalizedId.slice(1).toLowerCase();
        if (translations[capitalizedId]) {
            return translations[capitalizedId];
        }
        
        // 处理带连字符的形态
        if (normalizedId.includes('-')) {
            const parts = normalizedId.split('-');
            const formattedId = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('-');
            if (translations[formattedId]) {
                return translations[formattedId];
            }
        }
        
        // 尝试只匹配基础名称
        const baseName = normalizedId.split(/[-_]/)[0];
        const capitalizedBase = baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase();
        if (translations[capitalizedBase]) {
            return translations[capitalizedBase];
        }
    }
    
    return normalizedId.replace(/[-_]/g, ' ');
}


window.triggerMockBag = function(el) {
    if (!el) return;
    el.classList.add('is-pressing');
    setTimeout(() => el.classList.remove('is-pressing'), 180);

    const messageTitle = 'ACCESS DENIED';
    const messageBody = '战术背包尚未激活或内容为空。';

    if (typeof showCopyNotification === 'function') {
        const notif = document.createElement('div');
        notif.className = 'copy-notification show';
        notif.innerHTML = `
            <div class="copy-notif-internal">
                <div class="copy-notif-icon" style="color:#ff7675;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </div>
                <div class="copy-notif-text">
                    <div class="copy-notif-title" style="color:#ff7675;">${messageTitle}</div>
                    <div class="copy-notif-desc">${messageBody}</div>
                </div>
            </div>
        `;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2200);
    } else {
        alert(`${messageTitle}: ${messageBody}`);
    }
};

const getItemBadge = (slug) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug}.png`;

const BondManifest = {
    'gloria':  { key: 'enable_dynamax', icon: getItemBadge('power-band'),  label: 'DYNAMAX BOND' },
    'rosa':    { key: 'enable_bond',    icon: getItemBadge('soothe-bell'), label: 'LINK BOND' },
    'dawn':    { key: 'enable_insight', icon: getItemBadge('scope-lens'),  label: 'INSIGHT LENS' },
    'akari':   { key: 'enable_styles',  icon: getItemBadge('choice-scarf'),label: 'HISUI ARTS' },
    'serena':  { key: 'enable_mega',    icon: getItemBadge('mega-ring'),   label: 'MEGA EVO' },
    'selene':  { key: 'enable_z_move',  icon: getItemBadge('z-ring'),      label: 'Z POWER' },
    'juliana': { key: 'enable_tera',    icon: getItemBadge('normal-gem'),  label: 'TERASTAL' },
    'may':     { key: 'enable_proficiency_cap', icon: getItemBadge('exp-share'), label: 'LIMIT BREAK' }
};

const ZoneDB = {
    'N': { name: 'NEON',   label: 'Dist.N', color: '#e056fd', shadow: 'rgba(224, 86, 253, 0.35)' },
    'B': { name: 'BLOOM',  label: 'Dist.B', color: '#00cec9', shadow: 'rgba(0, 206, 201, 0.35)' },
    'S': { name: 'SHADOW', label: 'Dist.S', color: '#636e72', shadow: 'rgba(99, 110, 114, 0.4)' },
    'A': { name: 'APEX',   label: 'Dist.A', color: '#eb4d4b', shadow: 'rgba(235, 77, 75, 0.35)' },
    'Z': { name: 'ZENITH', label: 'Cent.Z', color: '#f9ca24', shadow: 'rgba(249, 202, 36, 0.4)' }
};

const ZoneOrder = ['N', 'B', 'S', 'A', 'Z'];


/* ============================================================
   ERA DATA BRIDGE - 从酒馆 ERA 系统读取数据
   ============================================================ */

// 数据容器（初始为空，由 ERA 填充）
let db = null;
const DefaultSettings = {
    enableAVS: true,
    enableCommander: true,
    enableEVO: true,
    enableBGM: true,
    enableSFX: true,
    enableClash: true,
    enableEnvironment: true
};

// 获取父窗口的事件系统（iframe 内部需要通过 parent 访问）
function getParentWindow() {
    try {
        return window.parent || window;
    } catch (e) {
        return window;
    }
}

// ========== 监听来自酒馆的 postMessage ==========
window.addEventListener('message', function(event) {
    if (!event.data || !event.data.type) return;
    
    if (event.data.type === 'PKM_ERA_DATA') {
        console.log('[PKM] 收到 ERA 数据 (postMessage)');
        if (event.data.data && event.data.data.player) {
            db = event.data.data;
            window.eraData = db;
            console.log('[PKM] ✓ ERA 数据已更新', db.player?.name);
            
            // 刷新界面
            if (typeof renderDashboard === 'function') renderDashboard();
            if (typeof renderPartyList === 'function') renderPartyList();
        }
    } else if (event.data.type === 'PKM_REFRESH') {
        console.log('[PKM] 收到刷新请求 (postMessage)');
        if (event.data.data && event.data.data.player) {
            db = event.data.data;
            window.eraData = db;
            
            // 使用防抖避免频繁刷新导致卡顿
            handleRefreshDebounced(event.data);
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
        
        if (typeof ensureSettingsDefaults === 'function') ensureSettingsDefaults();
        
        // 刷新所有界面
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderPartyList === 'function') renderPartyList();
        if (typeof renderSettings === 'function') renderSettings();
        if (typeof renderBoxPage === 'function') renderBoxPage();
        
        refreshDebounceTimer = null;
    }, 100);
}

// 加载 ERA 数据到 db（从父窗口注入的 window.eraData 获取）
function loadEraData() {
    console.log('[PKM] 正在加载 ERA 数据...');
    
    // 父窗口会在 iframe 加载前注入 window.eraData
    if (window.eraData && window.eraData.player) {
        db = window.eraData;
        console.log('[PKM] ✓ ERA 数据加载成功', db.player?.name);
        return true;
    } else {
        console.warn('[PKM] ERA 数据为空，使用测试数据');
        db = {
            player: {
                name: 'Trainer',
                bonds: {},
                unlocks: {},
                party: {
                    slot1: {
                        slot: 1,
                        name: 'Charizard',
                        species: 'charizard',
                        nickname: null,
                        lv: 55,
                        gender: 'M',
                        nature: 'Adamant',
                        ability: 'Blaze',
                        item: 'charcoal',
                        shiny: false,
                        isLead: true,
                        moves: {
                            move1: 'Flamethrower',
                            move2: 'Air Slash',
                            move3: 'Dragon Claw',
                            move4: 'Roost'
                        },
                        friendship: {
                            avs: { trust: 180, passion: 120, insight: 90, devotion: 50 }
                        },
                        stats_meta: {
                            ivs: { hp: 31, atk: 28, def: 25, spa: 31, spd: 20, spe: 31 },
                            ev_level: 252
                        }
                    },
                    slot2: {
                        slot: 2,
                        name: 'Pikachu',
                        species: 'pikachu',
                        nickname: null,
                        lv: 42,
                        gender: 'F',
                        nature: 'Timid',
                        ability: 'Static',
                        item: 'light-ball',
                        shiny: true,
                        isLead: false,
                        moves: {
                            move1: 'Thunderbolt',
                            move2: 'Quick Attack',
                            move3: null,
                            move4: null
                        },
                        friendship: {
                            avs: { trust: 255, passion: 200, insight: 150, devotion: 100 }
                        },
                        stats_meta: {
                            ivs: { hp: 20, atk: 15, def: 18, spa: 31, spd: 25, spe: 31 },
                            ev_level: 180
                        }
                    },
                    slot3: {
                        slot: 3,
                        name: 'Garchomp',
                        species: 'garchomp',
                        nickname: null,
                        lv: 60,
                        gender: 'M',
                        nature: 'Jolly',
                        ability: 'Rough Skin',
                        item: null,
                        shiny: false,
                        isLead: false,
                        moves: {
                            move1: 'Earthquake',
                            move2: 'Dragon Claw',
                            move3: 'Stone Edge',
                            move4: 'Swords Dance'
                        },
                        friendship: {
                            avs: { trust: 100, passion: 80, insight: 60, devotion: 30 }
                        },
                        stats_meta: {
                            ivs: { hp: 31, atk: 31, def: 28, spa: 10, spd: 22, spe: 31 },
                            ev_level: 300
                        }
                    },
                    slot4: { slot: 4, name: null },
                    slot5: { slot: 5, name: null },
                    slot6: { slot: 6, name: null }
                },
                box: {}
            },
            world_state: {
                location: { x: 0, y: 0 },
                time: { period: 'morning', derived: { dayOfYear: 15 } },
                npcs: {}
            },
            settings: {}
        };
        return false;
    }
}

/* ============================================================
   RENDER CONTROLLER
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 先加载 ERA 数据
    loadEraData();
    ensureSettingsDefaults();

    // 初始化悬浮状态栏
    initStickyStatusBar();

    // 然后渲染 UI
    renderDashboard();
    renderPartyList();
    renderSettings();
    renderBoxPage();
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

        <div class="ps-right">
            <span class="batt-val">94%</span>
            <div class="batt-shell">
                <div class="batt-fill"></div>
            </div>
        </div>
    `;

    frame.insertAdjacentElement('afterbegin', bar);
}

function renderPartyList() {
    const mainEl = document.getElementById('inject-viewport');
    if (!mainEl) {
        console.error('[PKM] inject-viewport 元素不存在');
        return;
    }
    
    const partyData = db.player.party;
    console.log('[PKM] 渲染队伍列表，槽位数:', Object.keys(partyData).length);
    
    // 过滤掉 transfer_buffer，只显示 slot1-slot6
    const displaySlotKeys = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6'];
    const displaySlots = displaySlotKeys.map(key => partyData[key]).filter(Boolean);
    const activeCount = displaySlots.filter(p => p && p.name && p.name !== null).length;
    const maxSlots = 6;

    let dotsHtml = '';
    for (let i = 0; i < maxSlots; i++) {
        const isActive = i < activeCount ? 'active' : '';
        dotsHtml += `<div class="th-dot ${isActive}"></div>`;
    }

    const headerHtml = `
    <div class="team-header-dash">
        <div class="th-title">DEPLOYED UNIT</div>
        <div class="th-status-grp">
            <div class="th-slots-viz">${dotsHtml}</div>
            <div class="th-count">0${activeCount} <small>/ 0${maxSlots}</small></div>
        </div>
    </div>`;

    let cardsHTML = '';

    // 只渲染 slot1-slot6，不渲染 transfer_buffer
    displaySlotKeys.forEach(slotKey => {
        const pkmNode = partyData[slotKey];
        if (pkmNode) {
            cardsHTML += createCardHTML(pkmNode, slotKey);
        }
    });

    const partyPage = document.getElementById('pg-party');
    if (partyPage) {
        partyPage.innerHTML = headerHtml + cardsHTML;
    } else {
        mainEl.innerHTML = `<div id="pg-party" class="page curr">${headerHtml + cardsHTML}</div>
            <div id="pg-social" class="page"></div>
            <div id="pg-settings" class="page"></div>`;
    }
}

function ensureSettingsDefaults() {
    if (!db) db = {};
    if (!db.settings) {
        db.settings = { ...DefaultSettings };
        return;
    }
    db.settings = { ...DefaultSettings, ...db.settings };
}

/* ============================================================
   RENDER SETTINGS (Config Page)
   ============================================================ */

const SettingsManifest = [
    { 
        key: 'enableAVS', 
        label: 'AVS SYSTEM', 
        desc: 'Affective Value System (Trust/Passion/Insight)', 
        color: '#ff7675'
    },
    { 
        key: 'enableCommander', 
        label: 'CMD. INTERFACE', 
        desc: 'Enable real-time tactical order injections.', 
        color: '#fdcb6e'
    },
    { 
        key: 'enableEVO', 
        label: 'LIMIT BREAK', 
        desc: 'Allow Mid-Battle Evolution (Bio/Bond triggers)', 
        color: '#00cec9'
    },
    { 
        key: 'enableBGM', 
        label: 'DYN. AUDIO', 
        desc: 'Narrative-driven background music adaptation.', 
        color: '#74b9ff'
    },
    { 
        key: 'enableSFX', 
        label: 'SFX FEEDBACK', 
        desc: 'SillyTavern UI Sound Effects pack.', 
        color: '#a29bfe'
    },
    { 
        key: 'enableClash', 
        label: 'CLASH SYSTEM', 
        desc: 'Enable clash mechanics during battle.', 
        color: '#e17055'
    },
    { 
        key: 'enableEnvironment', 
        label: 'ENVIRONMENT', 
        desc: 'Enable weather & terrain effects in battle.', 
        color: '#55efc4'
    }
];

function renderSettings() {
    const pageEl = document.getElementById('pg-settings');
    if (!pageEl) return;
    const activeCount = Object.values(db?.settings || {}).filter(Boolean).length;

    const headerHtml = `
    <div class="team-header-dash">
        <div class="th-title">SYSTEM KERNEL</div>
        <div class="th-status-grp">
            <div class="th-count">${activeCount} <small>MODULES ACTIVE</small></div>
        </div>
    </div>`;

    let contentHtml = `<div class="config-grid">`;

    SettingsManifest.forEach(item => {
        const isActive = db?.settings?.[item.key] === true;
        contentHtml += `
            <div class="cfg-card ${isActive ? 'active' : ''}" 
                 style="--cfg-color:${item.color}" 
                 onclick="toggleGlobalSetting('${item.key}')">
               
                <div class="cfg-info">
                    <span class="cfg-label">${item.label}</span>
                    <span class="cfg-desc">${item.desc}</span>
                </div>
              
                <div class="tgl-track ${isActive ? 'active' : ''}">
                    <div class="tgl-thumb"></div>
                </div>
            </div>
        `;
    });

    contentHtml += `</div>`;

    pageEl.innerHTML = headerHtml + contentHtml;
}

window.toggleGlobalSetting = function (key) {
    if (!db) db = {};
    if (!db.settings) {
        db.settings = { ...DefaultSettings };
    }

    db.settings[key] = !db.settings[key];
    console.log('[PKM CONFIG] Setting Changed:', key, db.settings[key]);
    renderSettings();

    // 调用父窗口注入到 iframe window 的回调函数（类似 toggleLeader）
    if (window.pkmUpdateSettingsCallback) {
        console.log('[PKM CONFIG] 调用 pkmUpdateSettingsCallback');
        window.pkmUpdateSettingsCallback(db.settings);
    } else {
        // 降级：使用 postMessage
        const parentWin = window.parent || window;
        parentWin.postMessage({
            type: 'PKM_UPDATE_SETTINGS',
            data: db.settings
        }, '*');
    }
};

// ========== Leader 切换函数 ==========
window.toggleLeader = function(event, slotKey) {
    if (event) event.stopPropagation();
    
    console.log('[PKM] toggleLeader 被调用:', slotKey);
    
    // 方案1: 使用回调函数（如果父窗口注入了）
    if (window.pkmSetLeaderCallback) {
        console.log('[PKM] 调用 pkmSetLeaderCallback');
        window.pkmSetLeaderCallback(slotKey);
    } else {
        // 方案2: 使用 postMessage
        const parentWin = window.parent || window;
        parentWin.postMessage({
            type: 'PKM_SET_LEADER',
            data: { targetSlot: slotKey }
        }, '*');
        console.log('[PKM] 已发送 PKM_SET_LEADER postMessage:', slotKey);
    }
};

function createCardHTML(pkm, slotIdStr) {
    if (!pkm || !pkm.name || pkm.name === null) {
        const slotNum = slotIdStr.replace("slot", "0");
        return `
        <div class="dash-card-box empty">
            <div class="dcb-inner">
                <span class="empty-placeholder">SLOT ${slotNum} OPEN</span>
            </div>
        </div>
        `;
    }

    const isLead = pkm.isLead === true;
    const slotDisplay = ("0" + pkm.slot).slice(-2);
    // 优先使用 species，如果为空则使用 name
    const speciesName = pkm.species || pkm.name;
    
    // [超级回退方案] Chain: [朱紫] --> (404?) --> [剑盾] --> (404?) --> [像素]
    const rawSlug = String(speciesName).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const spriteSlug = (typeof buildSpriteSlug === 'function' ? buildSpriteSlug(speciesName) : rawSlug) || rawSlug;
    const showdownSlug = spriteSlug.replace(/[^a-z0-9-]/g, '');
    const hasRegionalSuffix = /-(hisui|alola|galar|paldea)$/.test(showdownSlug);
    const slugPixel = hasRegionalSuffix ? showdownSlug : showdownSlug.replace(/-/g, '');

    let url_sv   = `https://img.pokemondb.net/sprites/scarlet-violet/normal/${spriteSlug}.png`;
    let url_swsh = `https://img.pokemondb.net/sprites/sword-shield/normal/${spriteSlug}.png`;
    let url_px   = `https://play.pokemonshowdown.com/sprites/gen5/${slugPixel}.png`;

    let regionalClass = '';
    if (/-hisui$/.test(showdownSlug)) {
        url_sv = `https://play.pokemonshowdown.com/sprites/gen5/${showdownSlug}.png`;
        url_swsh = `https://play.pokemonshowdown.com/sprites/ani/${showdownSlug}.gif`;
        url_px = `https://play.pokemonshowdown.com/sprites/gen5/${showdownSlug}.png`;
        regionalClass = 'regional-sprite';
    } else if (hasRegionalSuffix) {
        regionalClass = 'regional-sprite';
    }
    
    const theme = getThemeColors(speciesName);
    const itemUrl = getItemIconUrl(pkm.item);
    const itemUrlPS = getItemIconUrlPS(pkm.item);
    // 读取 bonds 数据 (ERA 格式)
    const bondsValue = pkm.bonds || 0;
    const maxCheck = (val) => val >= 255 ? 'maxed' : '';
    
    let displayName = pkm.nickname || pkm.name;
    if (!pkm.nickname && pkm.species) {
        // 使用翻译函数获取中文宝可梦名称
        displayName = translatePokemonNameApp(pkm.species);
    }
    // 如果没有翻译成功（返回的是英文），则转大写；中文名称保持原样
    if (displayName && /^[a-zA-Z\s-]+$/.test(displayName)) {
        displayName = displayName.toUpperCase();
    }

    let genderHtml = '';
    const genderKey = (pkm.gender || '').toUpperCase();
    if (genderKey === 'M') {
        genderHtml = `<span class="gender-mark male">♂</span>`;
    } else if (genderKey === 'F') {
        genderHtml = `<span class="gender-mark female">♀</span>`;
    } else {
        genderHtml = `<span class="gender-mark neutral">∅</span>`;
    }

    const shinyBadge = pkm.shiny ? '<span class="shiny-mark">✨</span>' : '';

    const boxClass = isLead ? "dash-card-box is-leader" : "dash-card-box";
    const leaderBadgeHtml = isLead
        ? `<div class="lead-tag"><span class="lead-text">LEAD</span></div>`
        : '';
    const actionClass = isLead ? "leader-action active" : "leader-action";
    const actionTitle = isLead ? "Current Point Pokemon" : "Set to Leader";
    const clickHandler = isLead ? '' : `onclick="toggleLeader(event, '${slotIdStr}')"`;
    const leaderBtnHtml = `
        <div class="${actionClass}" ${clickHandler} title="${actionTitle}">
            <svg viewBox="0 0 24 24">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
        </div>
    `;

    const typeChips = theme.types.map(t =>
        `<div class="type-mini" style="background:${getTypeColor(t)}"><span>${t.toUpperCase()}</span></div>`
    ).join('');

    const moveOrder = ['move1', 'move2', 'move3', 'move4'];
    const movesHtml = moveOrder.map(key => {
        const moveName = pkm?.moves?.[key];
        if (moveName) {
            // 翻译招式名称
            const translatedMove = translateMoveName(moveName);
            return `<div class="k-move-shell"><span>${translatedMove}</span></div>`;
        }
        return `<div class="k-move-shell empty"><span>—</span></div>`;
    }).join('');

    const statMap = { 'hp': 'H', 'atk': 'A', 'def': 'B', 'spa': 'C', 'spd': 'D', 'spe': 'S' };
    let ivsHtml = '';

    if (pkm.stats_meta && pkm.stats_meta.ivs) {
        Object.keys(statMap).forEach(key => {
            const val = pkm.stats_meta.ivs[key] || 0;
            const isMax = val === 31;
            ivsHtml += `<div class="chip-cell ${isMax ? 'max' : ''}" data-stat="${statMap[key]}">${val}</div>`;
        });
    }

    const itemHtml = pkm.item ? 
        `<div class="item-box" data-name="${pkm.item}">
            <img src="${itemUrl}" 
                 alt="${pkm.item}"
                 onerror="if(!this.dataset.triedPS){this.dataset.triedPS=true;this.src='${itemUrlPS}';}else{this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';}" 
            />
          </div>` : '';
    const avsDashboardHtml = `
        <div class="avs-dashboard" id="avs-panel-${slotIdStr}" onclick="event.stopPropagation()">
            <div class="avs-stat-item asi-stat-bonds">
                <span class="asi-label">BONDS</span>
                <span class="asi-val ${maxCheck(bondsValue)}">${bondsValue}</span>
            </div>
        </div>
    `;

    return `
    <div class="${boxClass}" 
         data-slot="${slotDisplay}" 
         onclick="toggleCard(this)" 
         style="--prim-color: ${theme.p}; --sec-color: ${theme.s}; cursor: pointer;">
        <div class="dcb-inner card-layout">
            <div class="pkm-summary" data-slot="${slotDisplay}">
                ${avsDashboardHtml}
                <div class="p-visual-grp">
                    <div class="p-avatar">
                        <img src="${url_sv}" 
                             loading="lazy" 
                             alt="${pkm.species}"
                             class="${regionalClass}"
                             onerror="
                                 if (!this.dataset.triedSwsh) {
                                     this.dataset.triedSwsh = true; 
                                     this.src = '${url_swsh}';
                                 } else {
                                     this.onerror = null; 
                                     this.src = '${url_px}'; 
                                     this.className = 'pixel-fallback';
                                 }
                             "
                             style="transition: 0.2s;">
                    </div>
                    <div class="p-texts">
                        <div class="p-meta-line">
                            <span>NO.${slotDisplay}</span>
                            <span>Lv.<b class="p-lv-val">${pkm.lv}</b></span>
                            ${shinyBadge}
                            ${leaderBadgeHtml}
                        </div>
                        <div class="p-name">${displayName}${genderHtml}</div>
                    </div>
                </div>
                <div class="summary-actions">
                    ${leaderBtnHtml}
                    <div class="build-action" onclick="event.stopPropagation(); openMovePoolPanel('${slotIdStr}')" title="Adjust Moves">
                        <svg viewBox="0 0 24 24">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                    </div>
                    <div class="avs-action" onclick="toggleAVS(event, '${slotIdStr}')" title="Affinity Gauge">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </div>
                    <div class="expand-action">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="pkm-details">
                <div class="details-overflow">
                    <div class="detail-padder tech-mode">
                        <div class="top-rail">
                            <div class="element-grp">
                                ${typeChips}
                            </div>
                            <div class="meta-chips">
                                <div class="m-tag nature"><span>${pkm.nature}</span></div>
                                <div class="m-tag ability"><span>${pkm.ability}</span></div>
                            </div>
                            ${itemHtml}
                        </div>
                        <div class="kinetic-moves">
                            ${movesHtml}
                        </div>
                        <div class="bot-stat-strip">
                            <div class="ivs-group">
                                <span class="micro-lbl">IVs</span>
                                <div class="hex-chips">
                                    ${ivsHtml}
                                </div>
                            </div>
                            <div class="evs-group">
                                <span class="micro-lbl">TOTAL EVs</span>
                                <span class="evs-val">${pkm.stats_meta ? pkm.stats_meta.ev_level : 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

/* ============================================================
   HELPER UTILS
   ============================================================ */
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


function switchPage(targetId, btn) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('curr', 'sub-page'));

    const target = document.getElementById(`pg-${targetId}`);
    if (target) {
        target.classList.add('curr');
        if (targetId !== 'dashboard') target.classList.add('sub-page');
    }

    if (targetId === 'box') {
        renderBoxPage();
    } else if (targetId === 'dashboard') {
        renderDashboard();
    } else if (targetId === 'party') {
        renderPartyList();
    } else if (targetId === 'settings') {
        renderSettings();
    }

    const sb = document.getElementById('sticky-status-bar');
    if (sb) {
        if (targetId === 'dashboard') sb.classList.remove('sub-mode');
        else sb.classList.add('sub-mode');
    }
}

// 打开子页面（从 Dashboard 进入）
window.openAppPage = function(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('curr', 'sub-page'));

    const target = document.getElementById(`pg-${pageId}`);
    if (target) {
        target.classList.add('curr', 'sub-page');

        if (pageId === 'box') {
            renderBoxPage();
        } else if (pageId === 'party') {
            renderPartyList();
        } else if (pageId === 'settings') {
            renderSettings();
        }
    }

    const sb = document.getElementById('sticky-status-bar');
    if (sb) sb.classList.add('sub-mode');
};

// 顶部返回按钮
window.goBackToHome = function() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('curr', 'sub-page'));

    const dashPage = document.getElementById('pg-dashboard');
    if (dashPage) {
        dashPage.classList.add('curr');
        renderDashboard();
    }

    const sb = document.getElementById('sticky-status-bar');
    if (sb) sb.classList.remove('sub-mode');
};

function toggleMechBar() {
    const mechBar = document.getElementById('mech-bar');
    if (!mechBar) return;
    
    // 找到同一个容器内的按钮
    const wrapper = mechBar.closest('.mech-wrapper');
    const mechBtn = wrapper ? wrapper.querySelector('.mech-btn') : document.querySelector('.mech-btn');
    
    const isExpanded = mechBar.classList.toggle('expanded');
    if (mechBtn) mechBtn.classList.toggle('open', isExpanded);
}

window.toggleCard = function(cardElement) {
    if (!cardElement) return;
    if (cardElement.classList.contains('empty')) return;
    
    cardElement.classList.toggle('open');
    console.log('Toggle:', cardElement.dataset.slot, cardElement.classList.contains('open'));
};

window.toggleAVS = function(event, slotKey) {
    event.stopPropagation();
    const panel = document.getElementById(`avs-panel-${slotKey}`);
    const btn = event.currentTarget;
    if (!panel || !btn) return;

    const isVisible = panel.classList.toggle('visible');
    btn.classList.toggle('active', isVisible);

    document.querySelectorAll('.avs-dashboard.visible').forEach(el => {
        if (el !== panel) {
            el.classList.remove('visible');
        }
    });
    document.querySelectorAll('.avs-action.active').forEach(el => {
        if (el !== btn) {
            el.classList.remove('active');
        }
    });
};

/* ============================================================
   [ADDON] BOX SYSTEM LOGIC (PC/Storage Manager)
   依赖前端的虚拟分页逻辑，不占用后台 Context
   ============================================================ */

// 状态管理
let boxState = {
    selectedPartIdxs: [],    // 当前选中的队伍槽位数组 (0-5)
    selectedBoxKeys: [],     // 当前选中的盒子Key数组 (字符串，有宝可梦的格子)
    selectedEmptyIdxs: [],   // 当前选中的空白格子索引数组 (用于存入)
    isLocked: false,         // 信号锁定状态
    signalStatus: null       // 信号覆盖状态详情
};

function buildGenderMark(gender) {
    const genderKey = (gender || '').toUpperCase();
    if (genderKey === 'M') return '<span class="gender-mark male">♂</span>';
    if (genderKey === 'F') return '<span class="gender-mark female">♀</span>';
    return '<span class="gender-mark neutral">∅</span>';
}

/* --- 1. [核心] 渲染 BOX 页面 --- */
async function renderBoxPage() {
    console.log('[BOX] renderBoxPage 被调用');
    const boxPage = document.getElementById('pg-box');
    if (!boxPage) {
        console.error('[BOX] pg-box 元素不存在');
        return;
    }
    console.log('[BOX] db.player.box =', db?.player?.box);
    
    // Mini版本：始终允许访问BOX（无信号限制）
    boxState.isLocked = false;
    boxPage.classList.remove('locked');

    // B. 初始化 HTML 框架
    let html = `
        <div class="box-header-strip storage-green">
            <span class="box-header-title">CURRENT PARTY (HAND)</span>
        </div>
    `;

    // 队伍区域
    const partyData = db.player.party;
    html += `<div class="box-party-grid">`;
    for (let i = 1; i <= 6; i++) {
        const slotKey = `slot${i}`;
        const pkm = partyData[slotKey];
        html += renderBoxPartyCard(pkm, i - 1);
    }
    html += `</div>`;

    // 盒子区域头
    html += `
        <div class="box-header-strip storage-green">
            <span class="box-header-title">CLOUD STORAGE (SERVER)</span>
        </div>
    `;

    // 盒子容器
    html += `<div class="box-storage-area"><div class="box-storage-matrix">`;
  
    // [对象模式] 将 box 对象转为带 Key 的数组
    // 不再初始化 Mock 数据，完全依赖 ERA 系统
    const boxEntries = Object.entries(db.player.box || {});
    // boxEntries 结构: [ ["key1", {data}], ["key2", {data}] ]
  
    // 渲染盒子格子 (至少渲染30个格子补充版面)
    const totalCells = Math.max(30, boxEntries.length + 5);
    for (let i = 0; i < totalCells; i++) {
        if (i < boxEntries.length) {
            const [key, pkmData] = boxEntries[i];
            html += renderStorageCell(pkmData, key, i);
        } else {
            // 空白格子，传入 cellIndex 用于存入操作
            html += renderStorageCell(null, null, i);
        }
    }
    html += `</div></div>`;

    boxPage.innerHTML = html;
}

// initMockBox 已删除 - 完全依赖 ERA 系统数据

/* --- 2. 渲染组件 (HTML Generators) --- */

/* ============================================================
   [FIX v2] 智能缓存与稳定加载 Image Handler
   ============================================================ */

if (!window._pkmIconVerifyCache) {
    window._pkmIconVerifyCache = {};
}

function generateSmartIconHex(name, cssClass = "") {
    if (!name) return "";
    const rawSlug = String(name).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const spriteSlug = (typeof buildSpriteSlug === 'function' ? buildSpriteSlug(name) : rawSlug) || rawSlug;
    const showdownSlug = spriteSlug.replace(/[^a-z0-9-]/g, '');
    const showdownMenuSlug = showdownSlug.replace(/-/g, '');
    const cacheKey = spriteSlug || showdownMenuSlug;
    
    const hasRegionalSuffix = /-(hisui|alola|galar|paldea)$/.test(spriteSlug);
    const regionalIconClass = hasRegionalSuffix ? 'regional-icon' : '';
    const finalClass = [cssClass, regionalIconClass].filter(Boolean).join(' ');

    let src1 = `https://raw.githubusercontent.com/msikma/pokesprite/master/icons/pokemon/regular/${spriteSlug}.png`;
    let src2 = `https://play.pokemonshowdown.com/sprites/gen5/${showdownSlug}.png`;
    let src3 = `https://play.pokemonshowdown.com/sprites/menu/${showdownMenuSlug}.png`;
    const src4 = `https://img.pokemondb.net/sprites/black-white/anim/normal/unown-q.gif`;

    if (spriteSlug === 'zorua-hisui') {
        src1 = `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/zorua-hisui.png`;
        src2 = `https://play.pokemonshowdown.com/sprites/gen5/zorua-hisui.png`;
        src3 = `https://play.pokemonshowdown.com/sprites/menu/zoruahisui.png`;
    }

    if (window._pkmIconVerifyCache[cacheKey]) {
        return `<img src="${window._pkmIconVerifyCache[cacheKey]}" class="${finalClass}" loading="lazy">`;
    }

    return `<img src="${src1}" loading="lazy" class="${finalClass}"
        onload="window._pkmIconVerifyCache['${cacheKey}'] = this.src"
        onerror="
            if(!this.dataset.step){ 
                this.dataset.step = 1; 
                this.src='${src2}'; 
            } else if(this.dataset.step == 1){
                this.dataset.step = 2;
                this.src='${src3}';
            } else {
                this.onerror = null;
                this.style.opacity = 0.5;
                this.src='${src4}';
            }
        ">`;
}

function renderBoxPartyCard(pkm, idx) {
    const isSelected = boxState.selectedPartIdxs.includes(idx);
    const isEmpty = (!pkm || !pkm.name);

    if (isEmpty) {
        return `
        <div class="box-char-card empty ${isSelected ? 'selected' : ''}" 
             onclick="handlePartyClick(${idx})">
            <div class="bcc-inner">
                <span class="bcc-name">EMPTY SLOT</span>
            </div>
        </div>`;
    }

    const imgHtml = generateSmartIconHex(pkm.name);

    const theme = getThemeColors(pkm.name); 
    const genderHtml = buildGenderMark(pkm.gender);

    // 使用翻译函数获取中文宝可梦名称
    const displayName = pkm.nickname || translatePokemonNameApp(pkm.name);

    return `
    <div class="box-char-card ${isSelected ? 'selected' : ''}" onclick="handlePartyClick(${idx})">
        <div class="bcc-inner">
            <div class="bcc-icon">${imgHtml}</div>
            <div class="bcc-info">
                <div class="bcc-name">${displayName}</div>
                <div class="bcc-lv">Lv.${pkm.lv} ${genderHtml}</div>
            </div>
            <div class="bcc-type" style="background:${theme.p}"></div>
        </div>
    </div>`;
}

function renderStorageCell(pkm, key, cellIndex) {
    const isSelected = key 
        ? boxState.selectedBoxKeys.includes(key) 
        : boxState.selectedEmptyIdxs.includes(cellIndex);

    if (!pkm) {
        return `<div class="storage-cell empty ${isSelected ? 'selected' : ''}" onclick="handleEmptyBoxClick(${cellIndex})"></div>`;
    }

    const imgHtml = generateSmartIconHex(pkm.name, "sc-img");

    return `
    <div class="storage-cell ${isSelected ? 'selected' : ''}" onclick="handleBoxClick('${key}')">
        ${imgHtml}
        <span class="sc-lv">L.${pkm.lv}</span>
        ${pkm.shiny ? '<span class="sc-shiny">★</span>' : ''}
    </div>`;
}

/* --- 3. 交互逻辑 (Handlers) --- */

window.handlePartyClick = function(idx) {
    if (boxState.isLocked) return;
    // Toggle 逻辑：点击已选中的取消，未选中的添加
    const arrIdx = boxState.selectedPartIdxs.indexOf(idx);
    if (arrIdx !== -1) {
        boxState.selectedPartIdxs.splice(arrIdx, 1);
    } else {
        boxState.selectedPartIdxs.push(idx);
    }
  
    refreshBoxUI();
    updateOpsBar(); 
};

window.handleBoxClick = function(key) {
    if (boxState.isLocked || !key) return;
  
    // 点击有宝可梦的格子时，清除空白格子选中
    boxState.selectedEmptyIdxs = [];
    
    // Toggle 逻辑
    const arrIdx = boxState.selectedBoxKeys.indexOf(key);
    if (arrIdx !== -1) {
        boxState.selectedBoxKeys.splice(arrIdx, 1);
    } else {
        boxState.selectedBoxKeys.push(key);
    }

    refreshBoxUI();
    updateOpsBar();
};

// 点击空白盒子格子（用于存入）
window.handleEmptyBoxClick = function(cellIndex) {
    console.log('[BOX] handleEmptyBoxClick 被调用, cellIndex =', cellIndex);
    console.log('[BOX] isLocked =', boxState.isLocked);
    
    if (boxState.isLocked) return;
    
    // 点击空白格子时，清除有宝可梦格子的选中
    boxState.selectedBoxKeys = [];
    
    // Toggle 逻辑
    const arrIdx = boxState.selectedEmptyIdxs.indexOf(cellIndex);
    if (arrIdx !== -1) {
        boxState.selectedEmptyIdxs.splice(arrIdx, 1);
    } else {
        boxState.selectedEmptyIdxs.push(cellIndex);
    }

    console.log('[BOX] selectedEmptyIdxs 更新为:', boxState.selectedEmptyIdxs);
    
    refreshBoxUI();
    updateOpsBar();
};

function refreshBoxUI() {
    renderBoxPage(); // 重新执行 renderBoxPage 会读取 boxState 里的选中下标
}

window.resetBoxSelection = function() {
    boxState.selectedPartIdxs = [];
    boxState.selectedBoxKeys = [];
    boxState.selectedEmptyIdxs = [];
    // 不刷新整个页面，只更新操作栏和选中状态的视觉效果
    document.querySelectorAll('.box-char-card.selected, .storage-cell.selected').forEach(el => {
        el.classList.remove('selected');
    });
    updateOpsBar();
};

// 更新底部操作栏状态 (支持多选)
function updateOpsBar() {
    const bar = document.getElementById('box-ops-console');
    if (!bar) return;

    const pIdxs = boxState.selectedPartIdxs;
    const bKeys = boxState.selectedBoxKeys;
    const emptyIdxs = boxState.selectedEmptyIdxs;

    // 没人选中 -> 隐藏
    if (pIdxs.length === 0 && bKeys.length === 0 && emptyIdxs.length === 0) {
        bar.classList.remove('active');
        return;
    }

    bar.classList.add('active');

    // 获取选中的队伍名称列表
    const partyNames = pIdxs.map(idx => {
        const pkm = db.player.party[`slot${idx+1}`];
        return pkm?.name || null;
    });
    const filledPartyCount = partyNames.filter(n => n !== null).length;
    const emptyPartyCount = partyNames.filter(n => n === null).length;

    // 获取选中的盒子名称列表
    const boxNames = bKeys.map(key => db.player.box[key]?.name || "Unknown");

    let htmlInner = "";
    const prefixStyle = `style="color: #636e72; font-weight:900; margin-right:6px; opacity:0.8"`;
    const countStyle = `style="color: #0984e3; font-weight:900;"`;

    // 判断操作类型和合法性
    const hasParty = pIdxs.length > 0;
    const hasBoxPkm = bKeys.length > 0;
    const hasEmptyBox = emptyIdxs.length > 0;

    if (hasParty && hasEmptyBox && filledPartyCount > 0) {
        // [批量存入] 队伍数量必须等于空位数量
        if (filledPartyCount === emptyIdxs.length) {
            const namesStr = partyNames.filter(n => n).join(', ');
            htmlInner = `<span ${prefixStyle}>CMD: BATCH STORE</span> <span ${countStyle}>[${filledPartyCount}]</span> <span class="ops-highlight">${namesStr}</span> <span style="color:#b2bec3; margin:0 5px;">»</span> SERVER`;
        } else {
            htmlInner = `<span ${prefixStyle}>ERR:</span> <span style="color:#e74c3c;">队伍选中 ${filledPartyCount} 个，空位选中 ${emptyIdxs.length} 个，数量不匹配</span>`;
        }
    } else if (hasParty && hasBoxPkm) {
        // [批量交换/取出] 队伍数量必须等于盒子数量
        if (pIdxs.length === bKeys.length) {
            if (filledPartyCount === pIdxs.length) {
                // 全是有宝可梦的槽位 = 批量交换
                const pNamesStr = partyNames.join(', ');
                const bNamesStr = boxNames.join(', ');
                htmlInner = `<span ${prefixStyle}>CMD: BATCH SWAP</span> <span ${countStyle}>[${pIdxs.length}]</span> <span class="ops-highlight">${pNamesStr}</span> <span style="color:#00cec9; margin:0 2px;">⇄</span> <span class="ops-highlight">${bNamesStr}</span>`;
            } else if (emptyPartyCount === pIdxs.length) {
                // 全是空槽位 = 批量取出
                const bNamesStr = boxNames.join(', ');
                htmlInner = `<span ${prefixStyle}>CMD: BATCH RETRIEVE</span> <span ${countStyle}>[${bKeys.length}]</span> SERVER <span style="color:#b2bec3; margin:0 5px;">»</span> <span class="ops-highlight">${bNamesStr}</span>`;
            } else {
                // 混合情况 = 批量操作（部分交换部分取出）
                htmlInner = `<span ${prefixStyle}>CMD: BATCH TRANSFER</span> <span ${countStyle}>[${pIdxs.length}]</span> <span class="ops-highlight">混合操作</span>`;
            }
        } else {
            htmlInner = `<span ${prefixStyle}>ERR:</span> <span style="color:#e74c3c;">队伍选中 ${pIdxs.length} 个，盒子选中 ${bKeys.length} 个，数量不匹配</span>`;
        }
    } else if (hasParty) {
        // 等待选择盒子
        const namesStr = partyNames.map((n, i) => n || `SLOT${pIdxs[i]+1}(空)`).join(', ');
        htmlInner = `<span ${prefixStyle}>STATUS:</span> TARGETING <span ${countStyle}>[${pIdxs.length}]</span> <span class="ops-highlight">${namesStr}</span> <span style="color:#b2bec3">...SELECT BOX</span>`;
    } else if (hasBoxPkm) {
        // 等待选择队伍
        const namesStr = boxNames.join(', ');
        htmlInner = `<span ${prefixStyle}>STATUS:</span> TARGETING <span ${countStyle}>[${bKeys.length}]</span> <span class="ops-highlight">${namesStr}</span> <span style="color:#b2bec3">...SELECT SLOT</span>`;
    } else if (hasEmptyBox) {
        // 只选了空位，等待选择队伍
        htmlInner = `<span ${prefixStyle}>STATUS:</span> SELECTED <span ${countStyle}>[${emptyIdxs.length}]</span> EMPTY CELLS <span style="color:#b2bec3">...SELECT PARTY</span>`;
    }

    bar.innerHTML = `
        <div class="ops-text-row">
            <div class="ops-log">
                ${htmlInner}
            </div>
        </div>
        <div class="ops-action-row">
            <button class="btn-ops-cancel" onclick="resetBoxSelection()">RESET</button>
            <button class="btn-ops-confirm" onclick="confirmBoxTransfer()">EXECUTE</button>
        </div>
    `;
}

/* --- 4. 生成与执行 (Execution) --- */

// 生成空槽位结构的辅助函数
function createEmptySlot(slotNum) {
    return {
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
        friendship: {
            avs: { trust: 0, passion: 0, insight: 0, devotion: 0 },
            av_up: { trust: 0, passion: 0, insight: 0, devotion: 0 }
        },
        moves: { move1: null, move2: null, move3: null, move4: null },
        stats_meta: {
            ivs: { hp: null, atk: null, def: null, spa: null, spd: null, spe: null },
            ev_level: 0,
            ev_up: 0
        },
        notes: null
    };
}

window.confirmBoxTransfer = function() {
    const pIdxs = boxState.selectedPartIdxs;
    const bKeys = boxState.selectedBoxKeys;
    const emptyIdxs = boxState.selectedEmptyIdxs;

    const hasParty = pIdxs.length > 0;
    const hasBoxPkm = bKeys.length > 0;
    const hasEmptyBox = emptyIdxs.length > 0;

    if (!hasParty) {
        alert("请先选择队伍槽位。");
        return;
    }

    if (!hasBoxPkm && !hasEmptyBox) {
        alert("请选择盒子中的宝可梦或空白格子。");
        return;
    }

    // 获取队伍数据
    const partyInfos = pIdxs.map(idx => {
        const slotKey = `slot${idx+1}`;
        const obj = db.player.party[slotKey];
        return {
            idx,
            slotKey,
            obj,
            name: obj?.name || null
        };
    });
    const filledPartyInfos = partyInfos.filter(p => p.name !== null);
    const emptyPartyInfos = partyInfos.filter(p => p.name === null);

    const playerName = db.player.name || "训练师";
    const zoneName = ZoneDB[(db.world_state.location || 'Z')]?.label || "未知区域";

    let actionLog = "";

    // ========== [批量存入模式] 队伍 -> 空白盒子 ==========
    if (hasEmptyBox && filledPartyInfos.length > 0) {
        if (filledPartyInfos.length !== emptyIdxs.length) {
            alert(`数量不匹配：队伍选中 ${filledPartyInfos.length} 个宝可梦，空位选中 ${emptyIdxs.length} 个。`);
            return;
        }

        // 生成新的 box keys
        const existingKeys = Object.keys(db.player.box || {});
        const existingIds = existingKeys
            .filter(k => k.startsWith('storage_'))
            .map(k => parseInt(k.split('_')[1]) || 0);
        let nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

        const boxInserts = {};
        const partyEdits = {};
        const uploadList = [];

        filledPartyInfos.forEach((pInfo, i) => {
            const newBoxKey = `storage_${String(nextId++).padStart(2, '0')}`;
            const newBoxObj = normalizeToBoxFormat(JSON.parse(JSON.stringify(pInfo.obj)));
            boxInserts[newBoxKey] = newBoxObj;
            partyEdits[pInfo.slotKey] = createEmptySlot(pInfo.idx + 1);
            uploadList.push(pInfo.name);
        });

        actionLog = `
[系统指令：粉红网络连接协议 - 批量存入成功]
> 操作：传输通道 [${zoneName}] 已建立。
> 上行 (Upload): ${uploadList.join(', ')} >>> 云端服务器存储。
> 变量已更新，无需重复发送。
> 已清空 ${filledPartyInfos.length} 个队伍槽位。

<VariableInsert>
${JSON.stringify({ player: { box: boxInserts } }, null, 2)}
</VariableInsert>

<VariableEdit>
${JSON.stringify({ player: { party: partyEdits } }, null, 2)}
</VariableEdit>

[演绎要求]
${uploadList.join('、')} 已被传送至索妮亚研究所的云端存储系统。请简短描写多道传输光束同时闪烁、宝可梦们化为数据流消失的画面，以及 ${playerName} 的反应。
`.trim();
    }
    // ========== [批量取出模式] 盒子 -> 队伍空槽 ==========
    else if (hasBoxPkm && emptyPartyInfos.length === pIdxs.length) {
        if (pIdxs.length !== bKeys.length) {
            alert(`数量不匹配：队伍空槽选中 ${pIdxs.length} 个，盒子选中 ${bKeys.length} 个。`);
            return;
        }

        const partyEdits = {};
        const boxDeletes = {};
        const downloadList = [];

        bKeys.forEach((bKey, i) => {
            const pInfo = emptyPartyInfos[i];
            const boxObj = db.player.box[bKey];
            const bName = boxObj?.name || "Unknown";
            const newPartyObj = normalizeToPartyFormat(JSON.parse(JSON.stringify(boxObj)), pInfo.idx + 1);
            partyEdits[pInfo.slotKey] = newPartyObj;
            boxDeletes[bKey] = true;
            downloadList.push(bName);
        });

        actionLog = `
[系统指令：粉红网络连接协议 - 批量取出成功]
> 操作：传输通道 [${zoneName}] 已建立。
> 下行 (Download): ${downloadList.join(', ')} <<< 云端服务器。
> 变量已更新，无需重复发送。
> 已加入 ${bKeys.length} 个队伍槽位。

<VariableEdit>
${JSON.stringify({ player: { party: partyEdits } }, null, 2)}
</VariableEdit>

<VariableDelete>
${JSON.stringify({ player: { box: boxDeletes } }, null, 2)}
</VariableDelete>

[演绎要求]
${downloadList.join('、')} 已从云端传送回来！请简短描写多道传输光束同时闪烁、宝可梦们从数据流中具现化的画面，以及它们对 ${playerName} 的反应。
`.trim();
    }
    // ========== [批量交换模式] 队伍 <-> 盒子 ==========
    else if (hasBoxPkm && filledPartyInfos.length > 0) {
        if (pIdxs.length !== bKeys.length) {
            alert(`数量不匹配：队伍选中 ${pIdxs.length} 个，盒子选中 ${bKeys.length} 个。`);
            return;
        }

        const partyEdits = {};
        const boxEdits = {};
        const uploadList = [];
        const downloadList = [];

        // 按顺序配对：partyInfos[i] <-> bKeys[i]
        partyInfos.forEach((pInfo, i) => {
            const bKey = bKeys[i];
            const boxObj = db.player.box[bKey];
            const bName = boxObj?.name || "Unknown";

            if (pInfo.name) {
                // 有宝可梦 = 交换
                const newPartyObj = normalizeToPartyFormat(JSON.parse(JSON.stringify(boxObj)), pInfo.idx + 1);
                const newBoxObj = normalizeToBoxFormat(JSON.parse(JSON.stringify(pInfo.obj)));
                partyEdits[pInfo.slotKey] = newPartyObj;
                boxEdits[bKey] = newBoxObj;
                uploadList.push(pInfo.name);
                downloadList.push(bName);
            } else {
                // 空槽位 = 取出
                const newPartyObj = normalizeToPartyFormat(JSON.parse(JSON.stringify(boxObj)), pInfo.idx + 1);
                partyEdits[pInfo.slotKey] = newPartyObj;
                boxEdits[bKey] = null; // 标记删除
                downloadList.push(bName);
            }
        });

        // 分离需要删除的盒子
        const boxEditsFinal = {};
        const boxDeletes = {};
        Object.entries(boxEdits).forEach(([k, v]) => {
            if (v === null) boxDeletes[k] = true;
            else boxEditsFinal[k] = v;
        });

        let variableBlocks = `<VariableEdit>
${JSON.stringify({ player: { party: partyEdits, box: boxEditsFinal } }, null, 2)}
</VariableEdit>`;

        if (Object.keys(boxDeletes).length > 0) {
            variableBlocks += `

<VariableDelete>
${JSON.stringify({ player: { box: boxDeletes } }, null, 2)}
</VariableDelete>`;
        }

        const opDesc = uploadList.length > 0 
            ? `> 上行 (Upload): ${uploadList.join(', ')} >>> 云端服务器。\n> 下行 (Download): ${downloadList.join(', ')} <<< 云端服务器。`
            : `> 下行 (Download): ${downloadList.join(', ')} <<< 云端服务器。`;

        actionLog = `
[系统指令：粉红网络连接协议 - 批量传输成功]
> 操作：传输通道 [${zoneName}] 已建立。
> 变量已更新，无需重复发送。
${opDesc}

${variableBlocks}

[演绎要求]
${uploadList.length > 0 ? `${uploadList.join('、')} 与 ${downloadList.join('、')} 完成了交换传输！` : `${downloadList.join('、')} 已从云端传送回来！`}请简短描写多道光束交错的画面，宝可梦们出现后对 ${playerName} 的反应，以及 ${playerName} 与新伙伴们的互动。
`.trim();
    }
    else {
        alert("无效的操作组合。");
        return;
    }

    console.log("[BOX] 生成的指令:\n" + actionLog);
    copyToClipboard(actionLog);
    resetBoxSelection(); 
};

/* --- Helpers --- */

function normalizeToPartyFormat(simpleObj, slotNum) {
    // 把盒子里的简单数据扩充成队伍数据
    // 保留完整数据，包括 friendship/AVS
    return {
        slot: slotNum,
        ...simpleObj
    };
}

function normalizeToBoxFormat(partyObj) {
    // 把队伍数据剥离成精简数据放入盒子
    // 保留完整数据，包括 friendship/AVS、moves、stats_meta 等
    const clone = JSON.parse(JSON.stringify(partyObj));
    // 清理不需要的字段
    delete clone.slot;      // box 中不需要 slot 字段
    delete clone.currHp;    // 临时战斗数据
    delete clone.maxHp;     // 临时战斗数据
    return clone;
}

// 复制到剪贴板函数
function copyToClipboard(text) {
    // 尝试使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            console.log("[BOX] ✓ 已复制到剪贴板");
            showCopyNotification("✓ 指令已复制到剪贴板，请粘贴发送给AI");
        }).catch(err => {
            console.error("[BOX] 剪贴板写入失败:", err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

// 降级复制方案
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        console.log("[BOX] ✓ 已复制到剪贴板 (fallback)");
        showCopyNotification("✓ 指令已复制到剪贴板，请粘贴发送给AI");
    } catch (err) {
        console.error("[BOX] 复制失败:", err);
        alert("复制失败，请手动复制控制台中的指令");
    }
    document.body.removeChild(textarea);
}

/* --- 新版通知系统 (app.js) --- */
function showCopyNotification(msg) { // msg 参数暂保留以兼容旧调用
    // 1. 移除旧的（依然存在的话）
    const old = document.querySelector('.copy-notification');
    if (old) old.remove();

    // 2. 创建新结构 (对应CSS)
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
                <div class="copy-notif-title">SYSTEM READY</div>
                <div class="copy-notif-desc">指令已生成并复制至剪贴板</div>
            </div>
        </div>
    `;
  
    document.body.appendChild(notification);
  
    // 避免没有 transition，强制 reflow
    void notification.offsetWidth;
  
    // 滑入
    requestAnimationFrame(() => notification.classList.add('show'));
  
    // 3.5秒后滑出销毁
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500); 
    }, 3500);
}

/* ============================================================
   P-SYSTEM DASHBOARD (仪表盘主页)
   9个APP磁贴：Fog, Box, News, Gig, Transit, Map, Mart, Unite, Settings
   ============================================================ */

// --- [新增] 简洁线条图标库 (请添加在 App.js 顶部) ---
const SystemIcons = {
    box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    news: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"></circle><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path></svg>`,
    gig: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    transit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path><path d="M9 20l-1.5 2.5"></path><path d="M15 20l1.5 2.5"></path></svg>`,
    map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    mart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    unite: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>` 
};

function renderDashboard() {
    const dashPage = document.getElementById('pg-dashboard');
    if (!dashPage) return;

    const player = db?.player || {};
    const world = db?.world_state || {};
    const playerName = player.name || 'TRAINER';

    // 计算 Box 使用情况
    const boxCount = Object.keys(player.box || {}).length;
    const boxMax = 30;
    const boxPercent = boxMax > 0 ? Math.min(100, Math.max(0, (boxCount / boxMax) * 100)) : 0;

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
                    <div class="hero-bag-btn refined" onclick="triggerMockBag(this)">
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

            <!-- SETTINGS: 战术灰色 (Config Gray) -->
            <div class="live-tile box-tactical theme-slate tile-settings" onclick="handleTileClick('settings')">
                 <div class="t-decoration">
                    <div class="t-watermark">${SystemIcons.settings}</div>
                    <div class="t-stripe"></div>
                    <div class="t-glow"></div>
                 </div>
                 <div class="t-content">
                    <div class="t-header">
                        <div class="t-icon-sm">${SystemIcons.settings}</div>
                    </div>
                    <div class="t-main-data">
                        <div class="t-num">SYS</div>
                        <div class="t-label">CONFIG</div>
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
        'settings': 'settings',
        'party': 'party'
    };
    
    const targetPage = pageMap[tileId];
    if (targetPage) {
        openAppPage(targetPage);
    }
};

