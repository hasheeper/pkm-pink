/**
 * ===========================================
 * SPRITE-DUPLICATE-FIX.JS - 重复精灵图修复
 * ===========================================
 * 
 * 问题：当多只相同宝可梦出现时，浏览器缓存 GIF 导致
 *       后续相同 URL 的精灵图不会重新播放动画
 * 
 * 解决方案：销毁并重建 img 元素，强制浏览器重新渲染 GIF
 */

(function() {
    'use strict';
    
    // 记录当前显示的精灵图 URL（去除查询参数后的基础 URL）
    let currentEnemySpriteUrl = null;
    // 标记是否是真正的换人（由外部调用设置）
    let isActualSwitch = false;
    
    /**
     * 销毁并重建精灵图元素（终极方案）
     * 【优化】使用淡入淡出效果，避免突然消失
     * @param {string} spriteId - DOM 元素 ID
     * @param {string} url - 图片 URL
     */
    function recreateSpriteElement(spriteId, url) {
        const oldImg = document.getElementById(spriteId);
        if (!oldImg) return;
        
        const parent = oldImg.parentNode;
        if (!parent) return;
        
        console.log(`[SPRITE-FIX] Recreating element for: ${url}`);
        
        // 添加唯一参数确保不使用缓存
        const separator = url.includes('?') ? '&' : '?';
        const uniqueUrl = `${url}${separator}_t=${Date.now()}`;
        
        // 【同步替换】立即创建新元素并替换
        const newImg = document.createElement('img');
        newImg.id = spriteId;
        // 【修复】保留原始类（包括 player-scale）
        newImg.className = oldImg.className.replace(/loaded|entering|fainted-hidden|fainting/g, '').trim() || 'p-sprite';
        newImg.alt = oldImg.alt || '';
        
        // 设置加载回调
        newImg.onload = function() {
            newImg.classList.add('loaded');
            newImg.classList.remove('entering');
            void newImg.offsetWidth;
            newImg.classList.add('entering');
            setTimeout(() => newImg.classList.remove('entering'), 650);
            console.log(`[SPRITE-FIX] Recreate complete: ${spriteId}`);
        };
        
        newImg.onerror = function() {
            console.error(`[SPRITE-FIX] Failed to load: ${uniqueUrl}`);
        };
        
        // 先设置 src
        newImg.src = uniqueUrl;
        
        // 立即替换旧元素
        parent.replaceChild(newImg, oldImg);
    }
    
    /**
     * 包装原始的 smartLoadSprite 函数
     * 检测重复 URL 并重建元素
     */
    function wrapSmartLoadSprite() {
        const originalSmartLoadSprite = window.smartLoadSprite;
        if (!originalSmartLoadSprite) {
            console.warn('[SPRITE-FIX] smartLoadSprite not found, retrying...');
            setTimeout(wrapSmartLoadSprite, 100);
            return;
        }
        
        window.smartLoadSprite = function(id, url, forceAnim = false) {
            // 只处理敌方精灵图的重复问题
            if (id === 'enemy-sprite') {
                const baseUrl = url.split('?')[0];
                
                // 【简化逻辑】只有当 isActualSwitch=true 且 URL 相同时才触发重建
                // isActualSwitch 由外部在换人前设置为 true
                if (isActualSwitch && currentEnemySpriteUrl === baseUrl) {
                    console.log(`[SPRITE-FIX] Duplicate enemy sprite on switch: ${baseUrl}`);
                    isActualSwitch = false; // 重置标记
                    recreateSpriteElement(id, url);
                    return;
                }
                
                // 重置标记（无论是否触发重建）
                isActualSwitch = false;
                
                // 记录当前 URL
                currentEnemySpriteUrl = baseUrl;
            }
            
            // 调用原始函数
            originalSmartLoadSprite.call(this, id, url, forceAnim);
        };
        
        console.log('[SPRITE-FIX] smartLoadSprite wrapped successfully');
    }
    
    /**
     * 重置状态（战斗结束时调用）
     */
    function resetDuplicateFix() {
        currentEnemySpriteUrl = null;
        isActualSwitch = false;
        console.log('[SPRITE-FIX] State reset');
    }
    
    /**
     * 标记即将进行换人（在换人前调用）
     * 这样 smartLoadSprite 就知道这是真正的换人，而不是形态切换或回合更新
     */
    function markEnemySwitch() {
        isActualSwitch = true;
        console.log('[SPRITE-FIX] Enemy switch marked');
    }
    
    // 导出函数
    window.resetSpriteDuplicateFix = resetDuplicateFix;
    window.markEnemySwitch = markEnemySwitch;
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wrapSmartLoadSprite);
    } else {
        setTimeout(wrapSmartLoadSprite, 50);
    }
    
    console.log('[SPRITE-FIX] Module loaded');
})();
