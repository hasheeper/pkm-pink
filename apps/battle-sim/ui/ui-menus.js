/**
 * ===========================================
 * UI-MENUS.JS - 菜单系统
 * ===========================================
 * 
 * 职责:
 * - 主菜单/技能菜单切换
 * - Mega/Dynamax/Tera 按钮控制
 * - 进化动画播放
 */

// ============================================
// 菜单切换
// ============================================

/**
 * 显示技能菜单
 */
function showMovesMenu() {
    console.log('[UI-MENUS] showMovesMenu called');
    
    const battle = typeof window !== 'undefined' ? window.battle : null;
    
    // =========================================================
    // 【蓄力技能锁定】检查玩家是否正在蓄力
    // =========================================================
    if (battle) {
        const player = battle.getPlayer();
        if (player && player.volatile?.chargingMove) {
            const chargingMove = player.volatile.chargingMove;
            
            // 【重要】先检查是否能行动（畏缩/睡眠/麻痹/冰冻等会阻止行动）
            // 如果无法行动，checkCanMove 会清除 chargingMove 状态
            if (typeof window.checkCanMove === 'function') {
                const canMoveCheck = window.checkCanMove(player);
                if (!canMoveCheck.can) {
                    // 无法行动，chargingMove 已被 checkCanMove 清除
                    // 显示无法行动的原因，然后正常显示技能菜单
                    console.log(`[CHARGE MOVE] Player cannot move: ${canMoveCheck.msg}`);
                    // 不在这里显示消息，让 executePlayerTurn 处理
                    // 继续显示正常的技能菜单
                }
            }
            
            // 再次检查 chargingMove 是否仍然存在（可能已被 checkCanMove 清除）
            if (player.volatile?.chargingMove) {
                console.log(`[CHARGE MOVE] Player is charging ${chargingMove}, forcing move execution`);
                
                // 找到对应的技能索引
                const moveIndex = player.moves?.findIndex(m => m.name === chargingMove);
                if (moveIndex >= 0 && typeof window.handleAttack === 'function') {
                    const moveToUse = player.moves[moveIndex];
                    // 显示提示
                    if (typeof window.log === 'function') {
                        window.log(`<span style="color:#f59e0b">⚡ ${player.cnName} 继续执行 ${moveToUse.cn || chargingMove}!</span>`);
                    }
                    // 强制执行蓄力技能（传递索引而非对象）
                    setTimeout(() => {
                        window.handleAttack(moveIndex);
                    }, 100);
                    return; // 不显示技能菜单
                }
            }
        }
    }
    
    // =========================================================
    // 【Insight 预警系统】预测 AI 的"初始意图"
    // AI 最终决策可能不同（见招拆招），但 Insight 显示的是初始意图
    // =========================================================
    if (battle && window.GAME_SETTINGS?.enableClash !== false) {
        const p = battle.getPlayer();
        const e = battle.getEnemy();
        
        if (p && e && p.isAlive() && e.isAlive()) {
            // 计算速度判断是否后手
            let playerSpeed = (typeof p.getStat === 'function') ? p.getStat('spe') : (p.spe || 100);
            let enemySpeed = (typeof e.getStat === 'function') ? e.getStat('spe') : (e.spe || 100);
            if (p.status === 'par') playerSpeed = Math.floor(playerSpeed * 0.5);
            if (e.status === 'par') enemySpeed = Math.floor(enemySpeed * 0.5);
            const isTrickRoom = battle.field && battle.field.trickRoom > 0;
            const playerIsSlower = isTrickRoom ? (playerSpeed > enemySpeed) : (playerSpeed < enemySpeed);
            
            // 只有玩家后手时才触发 Insight
            if (playerIsSlower && typeof window.preCalculateIntent === 'function') {
                // 使用 getHardAiMove 获取 AI 的"初始意图"（最优招式）
                let predictedMove = null;
                if (typeof window.getHardAiMove === 'function') {
                    predictedMove = window.getHardAiMove(e, p, battle.enemyParty);
                }
                if (!predictedMove && e.moves && e.moves.length > 0) {
                    predictedMove = e.moves[0];
                }
                
                if (predictedMove) {
                    const insightResult = window.preCalculateIntent(e, p, predictedMove);
                    if (insightResult && insightResult.success) {
                        console.log(`[INSIGHT] 预警触发: Level ${insightResult.level}, 预测招式: ${predictedMove.cn || predictedMove.name}`);
                        // 标记本回合 Insight 已触发，供对冲系统使用
                        battle.insightTriggeredThisTurn = true;
                        battle.insightPredictedMove = predictedMove;
                        // 显示预警
                        if (typeof window.showInsightWarning === 'function') {
                            window.showInsightWarning(insightResult);
                        }
                    } else {
                        battle.insightTriggeredThisTurn = false;
                        battle.insightPredictedMove = null;
                    }
                }
            } else {
                // 玩家先手，不触发 Insight
                battle.insightTriggeredThisTurn = false;
                battle.insightPredictedMove = null;
            }
        }
    }
    
    // 【战术指挥系统】自动弹窗已移除，改为通过 Smart Bubble 手动触发
    // 【修复】只有在没有锁定状态时才刷新悬浮窗，避免点击FIGHT后重置锁定状态
    // 锁定状态包括：commandArmed, evoArmed, playerMegaArmed, currentMoveStyle
    const hasLockedState = battle?.commandArmed || battle?.evoArmed || battle?.playerMegaArmed || 
                           (window.currentMoveStyle && window.currentMoveStyle !== 'normal');
    if (!hasLockedState && typeof window.refreshCommanderBubble === 'function') {
        window.refreshCommanderBubble();
    }
    
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('moves-menu').classList.remove('hidden');
    
    // 【古武系统】太极球已移除，功能迁移到 Commander System V2
    // 不再重置风格，保持玩家选择的风格直到使用
    
    // 更新 Mega 按钮显示状态
    console.log('[UI-MENUS] Calling updateMegaButtonVisibility');
    updateMegaButtonVisibility();
}

/**
 * 显示主菜单
 */
function showMainMenu() {
    if (typeof window.playSFX === 'function') window.playSFX('CANCEL');
    document.getElementById('moves-menu').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    
    const battle = typeof window !== 'undefined' ? window.battle : null;
    // 返回主菜单时重置 Mega 预备状态
    if (battle && battle.playerMegaArmed) {
        battle.playerMegaArmed = false;
        const megaBtn = document.getElementById('btn-mega');
        if (megaBtn) megaBtn.classList.remove('armed');
    }
}

// ============================================
// Mega/Dynamax/Tera 按钮控制
// ============================================

/**
 * 更新 Mega/Dynamax/Tera 按钮的显示状态
 * 【已迁移】小球按钮功能已迁移到 Commander System V2 悬浮窗
 * 此函数现在只负责隐藏小球按钮并刷新悬浮窗
 */
function updateMegaButtonVisibility() {
    // 【迁移】小球按钮始终隐藏，功能由悬浮窗接管
    const megaBtn = document.getElementById('btn-mega');
    const evoBtn = document.getElementById('btn-evolved');
    if (megaBtn) {
        megaBtn.classList.add('hidden');
        megaBtn.classList.remove('armed');
    }
    if (evoBtn) evoBtn.classList.add('hidden');
    
    // 【修复】只有在没有锁定状态时才刷新悬浮窗
    const battle = typeof window !== 'undefined' ? window.battle : null;
    const hasLockedState = battle?.commandArmed || battle?.evoArmed || battle?.playerMegaArmed || 
                           (window.currentMoveStyle && window.currentMoveStyle !== 'normal');
    if (!hasLockedState && typeof window.refreshCommanderBubble === 'function') {
        window.refreshCommanderBubble();
    }
    
    // 【重要】直接返回，不再执行后面的显示逻辑
    return;
    
    console.log(`[MEGA UI] Player: ${p.name}, canMegaEvolve: ${p.canMegaEvolve}, canDynamax: ${p.canDynamax}, canTera: ${p.canTera}, mechanic: ${lockedMechanic}`);
    
    const canMegaEvolveFunc = window.canMegaEvolve;
    const canActivateMechanicFunc = window.canActivateMechanic || (() => true);
    
    // 解锁系统检查
    const unlocks = battle.playerUnlocks || {};
    
    // =========================================================
    // 机制锁检查：两层锁机制
    // 一层锁 (unlocks)：玩家是否解锁了该机制
    // 二层锁 (mechanic)：宝可梦是否被指定使用该机制
    // =========================================================
    
    // 检查是否可以 Mega 进化
    // 【修复】必须明确 enable_mega === true 才能使用 Mega
    // 【二层锁】宝可梦必须有 mechanic === 'mega' 才能 Mega 进化
    const canMega = unlocks.enable_mega === true
        && typeof canMegaEvolveFunc === 'function' 
        && canMegaEvolveFunc(p) 
        && !battle.playerMegaUsed
        && canActivateMechanicFunc(p, 'mega')
        && lockedMechanic === 'mega';  // 【关键修复】必须明确指定 mechanic
    
    // 检查是否可以极巨化
    // 【修复】必须明确 enable_dynamax === true 才能使用极巨化
    // 【二层锁】宝可梦必须有 mechanic === 'dynamax' 才能极巨化
    const canDynamax = unlocks.enable_dynamax === true
        && p.canDynamax 
        && !p.isDynamaxed 
        && !battle.playerMaxUsed
        && canActivateMechanicFunc(p, 'dynamax')
        && lockedMechanic === 'dynamax';  // 【关键修复】必须明确指定 mechanic
    
    // 检查是否可以太晶化
    // 【修复】必须明确 enable_tera === true 才能使用太晶化
    // 【二层锁】宝可梦必须有 mechanic === 'tera' 才能太晶化
    const canTerastallize = unlocks.enable_tera === true
        && p.canTera 
        && !p.isTerastallized 
        && !battle.playerTeraUsed
        && canActivateMechanicFunc(p, 'tera')
        && lockedMechanic === 'tera';
    
    const isDynamaxTarget = p.megaTargetId && p.megaTargetId.toLowerCase().includes('gmax');
    
    console.log(`[MEGA UI] canMega: ${canMega}, canDynamax: ${canDynamax}, canTera: ${canTerastallize}, lockedMechanic: ${lockedMechanic}, isDynamaxTarget: ${isDynamaxTarget}`);
    
    // 太晶化模式
    if (lockedMechanic === 'tera') {
        if (canTerastallize) {
            megaBtn.classList.remove('hidden');
            megaBtn.classList.add('tera-style');
            if (iconText) iconText.textContent = 'T';
            p.evolutionType = 'tera';
        } else {
            megaBtn.classList.add('hidden');
            battle.playerMegaArmed = false;
        }
        return;
    }
    
    // Z-Move 模式不显示按钮
    if (lockedMechanic === 'zmove') {
        megaBtn.classList.add('hidden');
        battle.playerMegaArmed = false;
        return;
    }
    
    // Dynamax 模式（优先检查）
    if (lockedMechanic === 'dynamax') {
        if (canDynamax) {
            megaBtn.classList.remove('hidden');
            megaBtn.classList.add('dynamax-style');
            if (iconText) iconText.textContent = 'X';
            p.evolutionType = 'dynamax';
            console.log('[MEGA UI] Showing Dynamax button (mechanic locked)');
        } else {
            megaBtn.classList.add('hidden');
            console.log('[MEGA UI] Hidden: mechanic locked to dynamax but canDynamax is false');
        }
        return;
    }
    
    // Mega 模式
    if (lockedMechanic === 'mega') {
        if (canMega) {
            megaBtn.classList.remove('hidden');
            megaBtn.classList.remove('dynamax-style');
            p.evolutionType = 'mega';
            console.log('[MEGA UI] Showing Mega button (mechanic locked)');
        } else {
            megaBtn.classList.add('hidden');
            console.log('[MEGA UI] Hidden: mechanic locked to mega but canMega is false');
        }
        return;
    }
    
    // 无锁定机制时：隐藏按钮
    // 【关键】四大机制 (Mega/Dynamax/Tera/Z-Move) 都必须有明确的 mechanic 字段
    megaBtn.classList.add('hidden');
    console.log('[MEGA UI] Hidden: no mechanic specified (all mechanics require explicit mechanic field)');
    battle.playerMegaArmed = false;
    megaBtn.classList.remove('armed');
}

// ============================================
// 进化动画
// ============================================

/**
 * 执行 Mega 进化的视觉效果
 */
async function playMegaEvolutionAnimation(pokemon, isPlayer = true) {
    const spriteId = isPlayer ? 'player-sprite' : 'enemy-sprite';
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;

    const isBack = isPlayer;
    const newSpriteUrl = pokemon.getSprite(isBack);

    sprite.classList.remove('evo-silhouette', 'evo-burst', 'evo-finish');
    
    // 阶段 1: DNA 剪影
    sprite.classList.add('evo-silhouette');
    await wait(1000);
    
    // 阶段 2: 白光爆发 + 切换图片
    sprite.classList.remove('evo-silhouette');
    sprite.classList.add('evo-burst');
    
    const spriteRequestedUrls = window.spriteRequestedUrls || {};
    delete spriteRequestedUrls[spriteId];
    if (typeof smartLoadSprite === 'function') {
        smartLoadSprite(spriteId, newSpriteUrl, false);
    }
    spriteRequestedUrls[spriteId] = newSpriteUrl;
    
    await wait(300);
    
    // 阶段 3: 冷却动画
    sprite.classList.remove('evo-burst');
    sprite.classList.add('evo-finish');
    
    await wait(800);
    
    // 【修复】保留 player-scale 类，避免精灵图大小变化
    sprite.classList.remove('evo-silhouette', 'evo-burst', 'evo-finish');
    if (!sprite.classList.contains('loaded')) {
        sprite.classList.add('loaded');
    }
    sprite.classList.add(isPlayer ? 'mega-player' : 'mega-enemy');
}

/**
 * 执行极巨化的视觉效果
 */
async function playDynamaxAnimation(pokemon, isPlayer = true) {
    const spriteId = isPlayer ? 'player-sprite' : 'enemy-sprite';
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;

    sprite.classList.remove('evo-silhouette', 'evo-burst', 'evo-finish', 'state-dynamax', 'dynamax-burst', 'dynamax-shrink');
    
    // 阶段 1: 红色爆发动画
    sprite.classList.add('dynamax-burst');
    await wait(800);
    
    // 阶段 2: 进入极巨化状态
    sprite.classList.remove('dynamax-burst');
    sprite.classList.add('state-dynamax');
    
    await wait(200);
}

/**
 * 结束极巨化的视觉效果
 */
async function endDynamaxAnimation(pokemon, isPlayer = true) {
    const spriteId = isPlayer ? 'player-sprite' : 'enemy-sprite';
    const sprite = document.getElementById(spriteId);
    if (!sprite) return;

    sprite.classList.remove('state-dynamax');
    sprite.classList.add('dynamax-shrink');
    
    await wait(600);
    
    sprite.classList.remove('dynamax-shrink', 'dynamax-burst');
}

/**
 * 辅助函数：等待
 */
function wait(ms) { 
    return new Promise(r => setTimeout(r, ms)); 
}

/**
 * 辅助函数：日志输出
 */
function log(msg) {
    if (typeof window !== 'undefined' && typeof window.log === 'function') {
        window.log(msg);
    } else {
        console.log(msg);
    }
}

// ============================================
// Mega/Dynamax/Tera 切换
// ============================================

/**
 * 切换 Mega/Dynamax/Tera 进化预备状态
 */
function toggleMega() {
    const megaBtn = document.getElementById('btn-mega');
    if (!megaBtn) return;
    
    const battle = typeof window !== 'undefined' ? window.battle : null;
    if (!battle) return;
    
    const p = battle.getPlayer();
    const canMegaEvolveFunc = window.canMegaEvolve;
    
    // =========================================================
    // 太晶化模式 (优先检查)
    // 【修复】必须检查：1) unlocks.enable_tera === true  2) mechanic === 'tera'
    // =========================================================
    const teraUnlocks = battle.playerUnlocks || {};
    if (p && teraUnlocks.enable_tera === true && p.mechanic === 'tera' && p.canTera) {
        if (battle.playerTeraUsed || p.isTerastallized) {
            return;
        }
        
        battle.playerMegaArmed = !battle.playerMegaArmed;
        
        if (battle.playerMegaArmed) {
            megaBtn.classList.add('armed');
            log(`<span style="color:#22d3ee">💎 太晶化就绪！选择招式后将进行太晶化！(${p.teraType})</span>`);
        } else {
            megaBtn.classList.remove('armed');
            log(`<span style="color:#94a3b8">取消太晶化预备。</span>`);
        }
        return;
    }
    
    // 检查是否是极巨化模式
    // 【修复】必须检查：1) unlocks.enable_dynamax === true  2) mechanic === 'dynamax'
    const unlocks = battle.playerUnlocks || {};
    const isDynamaxMode = p 
        && unlocks.enable_dynamax === true 
        && p.mechanic === 'dynamax'  // 【二层锁】必须明确指定 mechanic
        && (p.canDynamax || (p.megaTargetId && p.megaTargetId.toLowerCase().includes('gmax')));
    
    if (isDynamaxMode) {
        // === 极巨化模式 ===
        if (battle.playerMaxUsed || p.isDynamaxed) {
            return;
        }
        
        battle.playerMegaArmed = !battle.playerMegaArmed;
        
        if (battle.playerMegaArmed) {
            megaBtn.classList.add('armed');
            log(`<span style="color:#e11d48">✦ 极巨化就绪！选择招式后将进行极巨化！</span>`);
        } else {
            megaBtn.classList.remove('armed');
            log(`<span style="color:#94a3b8">取消极巨化预备。</span>`);
        }
        return;
    }
    
    // === 普通 Mega 模式 ===
    // 【修复】必须检查 unlocks.enable_mega === true
    const megaUnlocks = battle.playerUnlocks || {};
    if (!p || megaUnlocks.enable_mega !== true || !canMegaEvolveFunc || !canMegaEvolveFunc(p) || battle.playerMegaUsed) {
        return;
    }
    
    // 检查是否是双 Mega 宝可梦（喷火龙/超梦）
    if (p.hasDualMega && p.megaFormsAvailable && p.megaFormsAvailable.length >= 2) {
        // 如果已经预备，则取消
        if (battle.playerMegaArmed) {
            battle.playerMegaArmed = false;
            megaBtn.classList.remove('armed');
            log(`<span style="color:#94a3b8">取消 Mega 进化预备。</span>`);
            return;
        }
        
        // 显示选择对话框
        if (typeof showMegaFormSelectionDialog === 'function') {
            showMegaFormSelectionDialog(p, (selectedFormId) => {
                if (selectedFormId) {
                    p.megaTargetId = selectedFormId;
                    p.formTargetId = selectedFormId;
                    
                    battle.playerMegaArmed = true;
                    megaBtn.classList.add('armed');
                    
                    const formName = selectedFormId.includes('megax') ? 'Mega X' : 'Mega Y';
                    log(`<span style="color:#a855f7">✦ ${formName} 进化就绪！选择招式后将进行 Mega 进化！</span>`);
                }
            });
        }
    } else {
        // 普通 Mega（单一形态）
        battle.playerMegaArmed = !battle.playerMegaArmed;
        
        if (battle.playerMegaArmed) {
            megaBtn.classList.add('armed');
            log(`<span style="color:#a855f7">✦ Mega 进化就绪！选择招式后将进行 Mega 进化！</span>`);
        } else {
            megaBtn.classList.remove('armed');
            log(`<span style="color:#94a3b8">取消 Mega 进化预备。</span>`);
        }
    }
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.showMovesMenu = showMovesMenu;
    window.showMainMenu = showMainMenu;
    window.updateMegaButtonVisibility = updateMegaButtonVisibility;
    window.toggleMega = toggleMega;
    window.playMegaEvolutionAnimation = playMegaEvolutionAnimation;
    window.playDynamaxAnimation = playDynamaxAnimation;
    window.endDynamaxAnimation = endDynamaxAnimation;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showMovesMenu,
        showMainMenu,
        toggleMega,
        updateMegaButtonVisibility,
        playMegaEvolutionAnimation,
        playDynamaxAnimation,
        endDynamaxAnimation
    };
}
