// switchPage 已在 app.js 中定义，此处删除重复定义

function toggleMechBar() {
    const mechBar = document.getElementById('mech-bar');
    const mechBtn = document.querySelector('.mech-btn');
    if (!mechBar || !mechBtn) return;

    const isExpanded = mechBar.classList.toggle('expanded');
    mechBtn.classList.toggle('open', isExpanded);
}

function toggleCard(cardElement) {
    if (!cardElement) return;
    cardElement.classList.toggle('open');
}

window.toggleLeader = function(event, slotStr) {
    if (event) {
        event.stopPropagation();
        const btn = event.currentTarget;
        if (btn) {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        }
    }
    console.log(`[PKM UI] Request Set Leader -> ${slotStr}`);
    
    // 优先使用直接回调（build-iframe.js 注入方式）
    if (window.pkmSetLeaderCallback) {
        console.log('[PKM UI] 调用 pkmSetLeaderCallback');
        window.pkmSetLeaderCallback(slotStr);
    } else {
        // 降级：使用 postMessage（tavern-inject.js 跨域方式）
        console.log('[PKM UI] 使用 postMessage 发送 Leader 切换请求');
        const message = {
            type: 'PKM_SET_LEADER',
            data: { targetSlot: slotStr }
        };
        // 尝试发送到 parent 和 top
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage(message, '*');
                console.log('[PKM UI] ✓ 已发送到 parent');
            }
            if (window.top && window.top !== window && window.top !== window.parent) {
                window.top.postMessage(message, '*');
                console.log('[PKM UI] ✓ 已发送到 top');
            }
        } catch (e) {
            console.error('[PKM UI] postMessage 发送失败:', e);
        }
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    if (typeof initApp === 'function') {
        initApp();
    }
});
