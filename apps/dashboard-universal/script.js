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

window.toggleLeader = async function(event, slotStr) {
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
    
    const slot = Number(String(slotStr).replace('slot', '')) || 1;
    if (typeof window.postPkmAction === 'function') {
        try {
            await window.postPkmAction('party.setLead', { slot });
            console.log('[PKM UI] ✓ Leader 写入已确认');
        } catch (e) {
            console.error('[PKM UI] Leader 写入失败:', e);
            if (typeof window.showPkmActionFailure === 'function') {
                window.showPkmActionFailure(`队长切换失败：${e.message}`);
            }
        }
        return;
    }

    console.warn('[PKM UI] postPkmAction 不可用，无法写入 Leader');
};
