/**
 * ===========================================
 * BATTLE-SWITCH.JS - 换人系统
 * ===========================================
 * 
 * 职责:
 * - Pivot 换人 (U-turn/Volt Switch)
 * - 强制换人
 * - 倒下处理
 * - 入场特性触发
 */

// ============================================
// 辅助函数
// ============================================

/**
 * 检查是否有可换入的存活宝可梦
 */
export function hasAliveSwitch(party, currentIndex) {
    return party.some((pm, idx) => 
        idx !== currentIndex && pm && pm.isAlive && pm.isAlive() && pm.currHp > 0
    );
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

/**
 * 辅助函数：更新视觉
 */
function updateAllVisuals(forceSpriteAnim) {
    if (typeof window !== 'undefined' && typeof window.updateAllVisuals === 'function') {
        window.updateAllVisuals(forceSpriteAnim);
    }
}

// ============================================
// Pivot 换人
// ============================================

/**
 * 处理玩家 Pivot 换人（U-turn/Volt Switch 等）
 * 使用 Promise 等待玩家选择
 */
export function handlePlayerPivot() {
    const battle = window.battle;
    console.log('[handlePlayerPivot] Starting pivot switch');
    log(`<span style="color:#3498db">选择要换入的宝可梦!</span>`);
    
    battle.phase = 'pivot_switch';
    battle.pivotSide = 'player';
    
    // 显示换人菜单（不可取消）
    if (typeof window.renderSwitchMenu === 'function') {
        window.renderSwitchMenu(false);
    }
    
    console.log('[handlePlayerPivot] Waiting for player selection...');
    return new Promise((resolve) => {
        battle.pivotResolve = resolve;
    });
}

/**
 * 处理敌方 Pivot 换人（AI 自动选择）
 */
export async function handleEnemyPivot(passBoosts = false) {
    const battle = window.battle;
    const currentE = battle.getEnemy();
    const p = battle.getPlayer();
    
    // 【Baton Pass】保存当前能力变化和替身，用于传递给换入的宝可梦
    const savedBoosts = passBoosts && currentE.boosts ? { ...currentE.boosts } : null;
    const savedSubstitute = passBoosts && currentE.volatile && currentE.volatile.substitute ? currentE.volatile.substitute : 0;
    // 【修复】Shed Tail 替身也要传递
    const savedShedTailSub = currentE.volatile && currentE.volatile.shedTailSub ? currentE.volatile.shedTailSub : 0;
    if (savedBoosts) {
        console.log(`[BATON PASS] ${currentE.cnName} 准备传递能力变化:`, savedBoosts, '替身HP:', savedSubstitute);
    }
    if (savedShedTailSub) {
        console.log(`[SHED TAIL] ${currentE.cnName} 准备传递断尾替身:`, savedShedTailSub);
        delete currentE.volatile.shedTailSub;
    }
    
    // AI 选择最佳换入目标
    let bestIndex = -1;
    let bestScore = -Infinity;
    
    for (let i = 0; i < battle.enemyParty.length; i++) {
        const ally = battle.enemyParty[i];
        if (!ally || i === battle.enemyActive) continue;
        if (!ally.isAlive || !ally.isAlive() || ally.currHp <= 0) continue;
        
        let score = 0;
        
        // 检查玩家最强技能对该宝可梦的效果
        for (const pMove of p.moves) {
            const moveType = pMove.type || 'Normal';
            const eff = window.getTypeEffectiveness ? 
                window.getTypeEffectiveness(moveType, ally.types || ['Normal']) : 1;
            if (eff === 0) score += 500;
            else if (eff <= 0.5) score += 200;
            else if (eff >= 2) score -= 100;
        }
        
        // 检查该宝可梦对玩家的克制
        for (const aMove of ally.moves || []) {
            const moveType = aMove.type || 'Normal';
            const eff = window.getTypeEffectiveness ? 
                window.getTypeEffectiveness(moveType, p.types || ['Normal']) : 1;
            if (eff >= 2) score += 150;
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestIndex = i;
        }
    }
    
    // 如果找到合适目标，执行换人
    if (bestIndex !== -1) {
        log(`<span style="color:#ef4444">敌方收回了 ${currentE.cnName}！</span>`);
        
        // 清除 Choice 锁招状态
        if (currentE.choiceLockedMove) {
            console.log(`[CHOICE] ${currentE.name} 换下，解除 ${currentE.choiceLockedMove} 锁定`);
            delete currentE.choiceLockedMove;
        }
        
        // 【哈欠修复】换人时清除哈欠状态（官方机制：换人可以躲避哈欠）
        if (currentE.volatile && currentE.volatile.yawn) {
            console.log(`[YAWN] ${currentE.cnName} 换下，清除哈欠状态`);
            delete currentE.volatile.yawn;
        }
        
        // 【剧毒计数器重置】换人时重置剧毒递增伤害（Gen5+ 官方机制）
        if (currentE.status === 'tox') {
            currentE.statusTurns = 0;
            console.log(`[TOX RESET] ${currentE.cnName} 换下，剧毒计数器重置`);
        }
        
        // 如果换下的宝可梦处于极巨化状态，恢复招式
        if (currentE.isDynamaxed && typeof window.applyDynamaxState === 'function') {
            console.log(`[SWITCH] Enemy ${currentE.name} was Dynamaxed, restoring moves`);
            window.applyDynamaxState(currentE, false);
        }
        
        // 重置换出宝可梦的能力等级（无论是否接棒，换出者都要重置）
        if (typeof currentE.resetBoosts === 'function') {
            currentE.resetBoosts();
        }
        
        // 【特性钩子】触发退场特性 (Regenerator, Natural Cure, Zero to Hero 等)
        if (typeof AbilityHandlers !== 'undefined' && currentE.ability) {
            const handler = AbilityHandlers[currentE.ability];
            if (handler && handler.onSwitchOut) {
                handler.onSwitchOut(currentE);
                console.log(`[ABILITY] ${currentE.cnName} 触发退场特性: ${currentE.ability}`);
            }
        }
        
        battle.enemyActive = bestIndex;
        const newE = battle.getEnemy();
        
        // 【Baton Pass】将保存的能力变化传递给换入的宝可梦
        if (savedBoosts && newE.boosts) {
            // 【修复】只有存在非零能力变化时才传递和显示日志
            const hasNonZeroBoost = Object.values(savedBoosts).some(v => v !== 0);
            if (hasNonZeroBoost) {
                Object.keys(savedBoosts).forEach(stat => {
                    newE.boosts[stat] = (newE.boosts[stat] || 0) + savedBoosts[stat];
                    newE.boosts[stat] = Math.max(-6, Math.min(6, newE.boosts[stat]));
                });
                console.log(`[BATON PASS] ${newE.cnName} 继承了能力变化:`, newE.boosts);
                log(`<span style="color:#9b59b6">${newE.cnName} 继承了能力变化!</span>`);
            }
        }
        // 【修复】Baton Pass 替身传递
        if (savedSubstitute > 0) {
            if (!newE.volatile) newE.volatile = {};
            newE.volatile.substitute = savedSubstitute;
            console.log(`[BATON PASS] ${newE.cnName} 继承了替身! (HP: ${savedSubstitute})`);
            log(`<span style="color:#3498db">🛡️ ${newE.cnName} 继承了替身! (替身HP: ${savedSubstitute})</span>`);
        }
        // 【修复】Shed Tail 替身传递
        if (savedShedTailSub > 0) {
            if (!newE.volatile) newE.volatile = {};
            newE.volatile.substitute = savedShedTailSub;
            console.log(`[SHED TAIL] ${newE.cnName} 继承了断尾替身! (HP: ${savedShedTailSub})`);
            log(`<span style="color:#3498db">🛡️ ${newE.cnName} 继承了替身保护! (替身HP: ${savedShedTailSub})</span>`);
        }
        log(`<span style="color:#ef4444">敌方派出了 ${newE.cnName}！</span>`);
        
        // 【标记换人】用于重复精灵图修复
        if (typeof window.markEnemySwitch === 'function') {
            window.markEnemySwitch();
        }
        
        updateAllVisuals('enemy');
        await wait(500);
        triggerEntryAbilities(newE, p);
        
        // 结算敌方场地钉子伤害
        if (typeof MoveEffects !== 'undefined' && MoveEffects.applyEntryHazards) {
            const hazardLogs = MoveEffects.applyEntryHazards(newE, false, battle);
            hazardLogs.forEach(msg => log(msg));
            if (hazardLogs.length > 0) updateAllVisuals();
        }
    }
}

// ============================================
// 倒下处理
// ============================================

/**
 * 处理敌方倒下
 */
export async function handleEnemyFainted(e) {
    if (typeof window.playSFX === 'function') window.playSFX('FAINT');
    const battle = window.battle;
    
    // 【Gen 9 Last Respects】增加敌方濒死计数（用于最后礼谢威力计算）
    battle.enemyFaintCount = (battle.enemyFaintCount || 0) + 1;
    console.log(`[Last Respects Counter] 敌方濒死次数: ${battle.enemyFaintCount}`);
    
    // 【Gen 9 Rage Fist】濒死时清零被攻击计数
    e.timesAttacked = 0;
    
    // === 清理特殊形态视觉效果（极巨化/钛晶化/超级进化/羁绊共鸣） ===
    const enemySpriteEl = document.getElementById('enemy-sprite');
    
    // 极巨化清理
    if (e.isDynamaxed) {
        if (e.originalName) {
            e.name = e.originalName;
            delete e.originalName;
        }
        if (typeof window.endDynamaxAnimation === 'function') {
            await window.endDynamaxAnimation(e, false);
        }
        e.isDynamaxed = false;
        delete e.preDynamaxMaxHp;
        delete e.preDynamaxCurrHp;
        if (typeof window.applyDynamaxState === 'function') {
            window.applyDynamaxState(e, false);
        }
        // 恢复原始精灵图片（非极巨化形态）
        if (enemySpriteEl && typeof e.getSprite === 'function') {
            enemySpriteEl.src = e.getSprite(false);
        }
    }
    
    // 钛晶化清理
    if (e.isTerastallized && enemySpriteEl) {
        enemySpriteEl.classList.remove('state-terastal');
        const allTeraTypes = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy','stellar'];
        allTeraTypes.forEach(t => enemySpriteEl.classList.remove(`tera-type-${t}`));
        // 【TERA CROWN】移除悬浮图腾
        if (typeof removeTeraCrown === 'function') removeTeraCrown('enemy');
    }
    
    // 超级进化清理
    if (enemySpriteEl) {
        enemySpriteEl.classList.remove('mega-enemy', 'mega-player', 'unofficial-mega');
    }
    
    // 羁绊共鸣清理
    if (e.hasBondResonance && enemySpriteEl) {
        enemySpriteEl.classList.remove('bond-resonance');
        enemySpriteEl.style.filter = '';
    }
    
    // 【倒下动画】确保精灵播放倒下动画
    if (enemySpriteEl && !enemySpriteEl.classList.contains('fainting') && !enemySpriteEl.classList.contains('fainted-hidden')) {
        enemySpriteEl.classList.add('fainting');
        await wait(750);
        enemySpriteEl.classList.remove('fainting');
        enemySpriteEl.classList.add('fainted-hidden');
    }
    
    log(`敌方的 ${e.cnName} 倒下了!`);
    
    // === 【onKill 钩子】击杀后特性触发 (Moxie, Beast Boost 等) ===
    const p = battle.getPlayer();
    if (p && p.isAlive() && p.ability) {
        const abilityId = p.ability;
        if (typeof AbilityHandlers !== 'undefined' && AbilityHandlers[abilityId] && AbilityHandlers[abilityId].onKill) {
            const killLogs = [];
            AbilityHandlers[abilityId].onKill(p, killLogs);
            killLogs.forEach(msg => log(msg));
            if (typeof updateAllVisuals === 'function') {
                updateAllVisuals('player');
            }
        }
    }
    
    // Battle Bond (牵绊变身) 触发检查
    if (p && p.isAlive() && typeof window.checkBattleBondTransform === 'function') {
        const bondResult = window.checkBattleBondTransform(p);
        if (bondResult && bondResult.success) {
            log(`<span style="color:#3b82f6">🌊 ${bondResult.oldName} 的牵绊... 变身为 ${bondResult.newName}！</span>`);
            updateAllVisuals('player');
            await wait(800);
        }
    }
    
    // 【防止重复判定】如果已经判定过胜负，直接返回
    if (battle.battleEndDetermined) {
        console.log('[handleEnemyFainted] 胜负已判定，跳过');
        return;
    }
    
    const battleEnd = battle.checkBattleEnd();
    if (battleEnd === 'win') {
        battle.battleEndDetermined = true; // 标记胜负已判定
        log("🏆 <b style='color:#27ae60'>敌方全部战败！你赢了！</b>");
        const t = battle.trainer;
        if (t && t.id !== 'wild' && t.lines?.lose) {
            log(`<i>${t.name}: "${t.lines.lose}"</i>`);
        }
        setTimeout(() => {
            if (typeof window.battleEndSequence === 'function') {
                window.battleEndSequence('win');
            }
        }, 2000);
        return;
    } else if (battleEnd === 'loss') {
        // 【同命双杀】敌方倒下但玩家也全灭，且同命者是敌方 -> 玩家赢
        // 这种情况在 checkBattleEnd 中已经处理，但如果返回 loss 说明是玩家用的同命
        battle.battleEndDetermined = true;
        log(" <b style='color:#e74c3c'>... 你输了.</b>");
        const t = battle.trainer;
        if (t && t.id !== 'wild' && t.lines?.win) {
            log(`<i>${t.name}: "${t.lines.win}"</i>`);
        }
        setTimeout(() => {
            if (typeof window.battleEndSequence === 'function') {
                window.battleEndSequence('loss');
            }
        }, 2000);
        return;
    }
    
    // 敌方换人
    await wait(1000);
    if (battle.nextAliveEnemy()) {
        const newE = battle.getEnemy();
        
        // 【BUG修复】先触发入场特性（Illusion等），再输出日志
        // 这样 Illusion 的 displayCnName 会在日志输出前设置好
        triggerEntryAbilities(newE, battle.getPlayer());
        
        // 使用 displayCnName（幻觉伪装名）或 cnName（真名）
        const displayName = newE.displayCnName || newE.cnName;
        log(`敌方派出 <b>${displayName}</b> (Lv.${newE.level})!`);
        
        // 【标记换人】用于重复精灵图修复
        if (typeof window.markEnemySwitch === 'function') {
            window.markEnemySwitch();
        }
        
        // === 播放敌方新宝可梦叫声 ===
        if (typeof window.playPokemonCry === 'function') {
            window.playPokemonCry(newE.name);
        }
        
        // === 【敌方 Necrozma 合体 + Ultra Burst】===
        // 检测换入的是否是 Necrozma，且队伍中有 Solgaleo/Lunala 可以合体
        if (typeof window.autoProcessNecrozmaFusion === 'function') {
            const necrozmaName = (newE.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (necrozmaName === 'necrozma') {
                updateAllVisuals('enemy');
                await wait(600);
                
                const fusionResult = window.autoProcessNecrozmaFusion(battle.enemyParty, (msg) => {
                    log(msg); // 显示合体/变身日志
                });
                
                if (fusionResult.success) {
                    // 更新精灵图
                    const newSpriteUrl = newE.getSprite ? newE.getSprite(false) : null;
                    if (newSpriteUrl && typeof window.smartLoadSprite === 'function') {
                        window.smartLoadSprite('enemy-sprite', newSpriteUrl, false);
                    }
                    updateAllVisuals('enemy');
                    await wait(800);
                    
                    // 播放变身后的叫声
                    if (typeof window.playPokemonCry === 'function') {
                        window.playPokemonCry(newE.name);
                    }
                }
            }
        }
        
        // 检查并执行进场自动变形 (Primal/Crowned)
        if (typeof window.checkInitTransform === 'function' && newE.needsInitTransform) {
            console.log('[FORM] Checking enemy switch-in init transform:', newE.name);
            const result = window.checkInitTransform(newE);
            if (result) {
                log(`<span style="color:#ef4444">✦ 敌方 ${result.oldName} 变为 ${result.newName}！</span>`);
                const newSpriteUrl = newE.getSprite(false);
                const preloader = new Image();
                preloader.src = newSpriteUrl;
                await wait(100);
            }
        }
        
        // 检查换入的敌方是否需要极巨化
        const enemyUnlocks = battle.enemyUnlocks || {};
        // 【数据驱动】检查是否有 G-Max 因子
        const hasGMaxFactor = typeof window.getGMaxFactor === 'function' && window.getGMaxFactor(newE);
        const isNewEnemyDynamax = (newE.mechanic === 'dynamax') || 
                                   (newE.canDynamax && newE.mechanic !== 'mega' && newE.mechanic !== 'tera') ||
                                   (newE.megaTargetId && newE.megaTargetId.includes('gmax')) ||
                                   hasGMaxFactor; // 自动检测 G-Max 因子
        
        if (enemyUnlocks.enable_dynamax && isNewEnemyDynamax && !newE.isDynamaxed && !battle.enemyMaxUsed) {
            battle.enemyMaxUsed = true;
            const oldName = newE.cnName;
            const oldMaxHp = newE.maxHp;
            const oldCurrHp = newE.currHp;
            
            newE.originalName = newE.name;
            
            updateAllVisuals('enemy');
            await wait(600);
            
            log(`<b style="color:#e11d48">▂▃▅▆▇ DYNAMAX !!! ▇▆▅▃▂</b>`);
            log(`敌方的 ${oldName} 极巨化了！`);
            
            const spriteEl = document.getElementById('enemy-sprite');
            if (spriteEl) {
                spriteEl.classList.add('dynamax-burst');
                await wait(400);
                
                // 检查是否有 G-Max 形态（megaTargetId 包含 gmax）
                // 【关键】通用极巨化 (isGenericDynamax) 不切换图片，只用 CSS 放大
                const gmaxFormId = newE.megaTargetId;
                if (gmaxFormId && gmaxFormId.includes('gmax') && !newE.isGenericDynamax) {
                    // [BUG FIX] 格式转换：charizardgmax -> Charizard-Gmax
                    const baseName = gmaxFormId.replace(/gmax$/i, '');
                    const formattedName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + '-Gmax';
                    newE.name = formattedName;
                    
                    // 【强制修正】G-Max 形态中文名：优先翻译，回退时强制加"超极巨"前缀
                    if (window.Locale) {
                        const translatedName = window.Locale.get(formattedName);
                        // 检查是否成功翻译（翻译后不等于原名，且不等于基础形态名）
                        const baseTranslated = window.Locale.get(baseName.charAt(0).toUpperCase() + baseName.slice(1));
                        if (translatedName !== formattedName && translatedName !== baseTranslated) {
                            // 成功翻译到 G-Max 形态（如 "超极巨喷火龙"）
                            newE.cnName = translatedName;
                        } else {
                            // 翻译失败，强制添加"超极巨"前缀
                            newE.cnName = '超极巨' + baseTranslated;
                        }
                    } else {
                        newE.cnName = formattedName;
                    }
                    
                    const gmaxSpriteId = gmaxFormId.replace(/gmax$/i, '-gmax');
                    const gmaxSpriteUrl = `https://play.pokemonshowdown.com/sprites/ani/${gmaxSpriteId}.gif`;
                    if (typeof window.smartLoadSprite === 'function') {
                        window.smartLoadSprite('enemy-sprite', gmaxSpriteUrl, false);
                    }
                    console.log(`[DYNAMAX] 敌方换入极巨化，切换精灵图: ${gmaxSpriteUrl}`);
                } else if (newE.isGenericDynamax) {
                    console.log(`[DYNAMAX] 敌方通用极巨化，保持原始精灵图: ${newE.name}`);
                }
                
                await wait(400);
                spriteEl.classList.remove('dynamax-burst');
                spriteEl.classList.add('state-dynamax');
            }
            
            // 【统一】使用 dynamax.js 的 activateDynamax 函数
            if (typeof window.activateDynamax === 'function') {
                const result = window.activateDynamax(newE, { justSwitchedIn: true });
                log(`<span style="color:#ff6b8a">[敌方极巨化剩余回合: ${newE.dynamaxTurns}]</span>`);
            } else {
                // 回退逻辑（如果 dynamax.js 未加载）
                const hpMultiplier = 1.5;
                newE.maxHp = Math.floor(oldMaxHp * hpMultiplier);
                newE.currHp = Math.floor(oldCurrHp * hpMultiplier);
                newE.isDynamaxed = true;
                newE.dynamaxTurns = 3;
                newE.preDynamaxMaxHp = oldMaxHp;
                newE.preDynamaxCurrHp = oldCurrHp;
                newE.dynamaxJustActivated = true;
                if (typeof window.applyDynamaxState === 'function') {
                    window.applyDynamaxState(newE, true);
                }
                log(`<span style="color:#ff6b8a">[敌方极巨化剩余回合: ${newE.dynamaxTurns}]</span>`);
            }
            
            await wait(400);
        }
        
        updateAllVisuals('enemy');
        // 【注意】triggerEntryAbilities 已在日志输出前调用，这里不再重复调用
        
        // 结算敌方场地钉子伤害
        if (typeof MoveEffects !== 'undefined' && MoveEffects.applyEntryHazards) {
            const hazardLogs = MoveEffects.applyEntryHazards(newE, false, battle);
            hazardLogs.forEach(msg => log(msg));
            if (hazardLogs.length > 0) updateAllVisuals();
        }
        
        // 【注意】敌方倒下换人后，不在这里执行 executeEndPhase
        // 因为 handleAttack 中会在 return 之前或之后统一处理回合末结算
        // 如果在这里调用 executeEndPhase，会导致 G-Max DOT 在换人时立即触发
        // 而不是等到整个回合结束后触发
        
        battle.locked = false;
    } else {
        log("🏆 <b style='color:#27ae60'>敌方全部战败！你赢了！</b>");
        setTimeout(() => {
            if (typeof window.battleEndSequence === 'function') {
                window.battleEndSequence('win');
            }
        }, 2000);
    }
}

/**
 * 处理玩家倒下
 */
export async function handlePlayerFainted(p) {
    if (typeof window.playSFX === 'function') window.playSFX('FAINT');
    const battle = window.battle;
    
    // 【Gen 9 Last Respects】增加玩家方濒死计数（用于最后礼谢威力计算）
    battle.playerFaintCount = (battle.playerFaintCount || 0) + 1;
    console.log(`[Last Respects Counter] 玩家方濒死次数: ${battle.playerFaintCount}`);
    
    // 【Gen 9 Rage Fist】濒死时清零被攻击计数
    p.timesAttacked = 0;
    
    // === 清理特殊形态视觉效果（极巨化/钛晶化/超级进化/羁绊共鸣） ===
    const playerSpriteEl = document.getElementById('player-sprite');
    
    // 极巨化清理
    if (p.isDynamaxed) {
        if (p.originalName) {
            p.name = p.originalName;
            delete p.originalName;
        }
        if (typeof window.endDynamaxAnimation === 'function') {
            await window.endDynamaxAnimation(p, true);
        }
        p.isDynamaxed = false;
        delete p.preDynamaxMaxHp;
        delete p.preDynamaxCurrHp;
        if (typeof window.applyDynamaxState === 'function') {
            window.applyDynamaxState(p, false);
        }
        // 恢复原始精灵图片（非极巨化形态）
        if (playerSpriteEl && typeof p.getSprite === 'function') {
            playerSpriteEl.src = p.getSprite(true);
        }
    }
    
    // 钛晶化清理
    if (p.isTerastallized && playerSpriteEl) {
        playerSpriteEl.classList.remove('state-terastal');
        const allTeraTypes = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy','stellar'];
        allTeraTypes.forEach(t => playerSpriteEl.classList.remove(`tera-type-${t}`));
        // 【TERA CROWN】移除悬浮图腾
        if (typeof removeTeraCrown === 'function') removeTeraCrown('player');
    }
    
    // 超级进化清理
    if (playerSpriteEl) {
        playerSpriteEl.classList.remove('mega-player', 'mega-enemy', 'unofficial-mega');
    }
    
    // 羁绊共鸣清理
    if (p.hasBondResonance && playerSpriteEl) {
        playerSpriteEl.classList.remove('bond-resonance');
        playerSpriteEl.style.filter = '';
    }
    
    // 【倒下动画】确保精灵播放倒下动画
    if (playerSpriteEl && !playerSpriteEl.classList.contains('fainting') && !playerSpriteEl.classList.contains('fainted-hidden')) {
        playerSpriteEl.classList.add('fainting');
        await wait(750);
        playerSpriteEl.classList.remove('fainting');
        playerSpriteEl.classList.add('fainted-hidden');
    }
    
    log(`<b style="color:red">糟糕! ${p.cnName} 失去了战斗能力!</b>`);
    
    // 【防止重复判定】如果已经判定过胜负，直接返回
    if (battle.battleEndDetermined) {
        console.log('[handlePlayerFainted] 胜负已判定，跳过');
        return;
    }
    
    // === 【修复】检查敌方是否也同时倒下（双杀场景：闪焰冲锋/大爆炸等）===
    const e = battle.getEnemy();
    if (e && !e.isAlive()) {
        log(`敌方的 ${e.cnName} 倒下了!`);
        
        // 检查战斗是否结束
        const battleEnd = battle.checkBattleEnd();
        if (battleEnd === 'win') {
            battle.battleEndDetermined = true;
            log("🏆 <b style='color:#27ae60'>敌方全部战败！你赢了！</b>");
            const t = battle.trainer;
            if (t && t.id !== 'wild' && t.lines?.lose) {
                log(`<i>${t.name}: "${t.lines.lose}"</i>`);
            }
            setTimeout(() => {
                if (typeof window.battleEndSequence === 'function') {
                    window.battleEndSequence('win');
                }
            }, 2000);
            return;
        } else if (battleEnd === 'loss') {
            battle.battleEndDetermined = true;
            log(" <b style='color:#e74c3c'>... 你输了.</b>");
            const t = battle.trainer;
            if (t && t.id !== 'wild' && t.lines?.win) {
                log(`<i>${t.name}: "${t.lines.win}"</i>`);
            }
            setTimeout(() => {
                if (typeof window.battleEndSequence === 'function') {
                    window.battleEndSequence('loss');
                }
            }, 2000);
            return;
        }
        
        // 敌方换人
        await wait(500);
        if (battle.nextAliveEnemy()) {
            const newE = battle.getEnemy();
            log(`敌方派出 <b>${newE.cnName}</b> (Lv.${newE.level})!`);
            
            if (typeof window.markEnemySwitch === 'function') {
                window.markEnemySwitch();
            }
            
            // 加载新敌方精灵图
            const newSpriteUrl = newE.getSprite(false);
            if (typeof window.smartLoadSprite === 'function') {
                window.smartLoadSprite('enemy-sprite', newSpriteUrl, true);
            }
            
            // 播放叫声
            if (typeof window.playPokemonCry === 'function') {
                window.playPokemonCry(newE.name);
            }
            
            if (typeof updateAllVisuals === 'function') {
                updateAllVisuals();
            }
            
            // 【双杀标记】标记敌方刚换人，等玩家换人完成后触发入场特性
            battle.enemyJustSwitchedInDoubleKO = true;
        }
    } else if (e && e.isAlive() && e.ability) {
        // === 【onKill 钩子】敌方击杀后特性触发 (Moxie, Beast Boost 等) ===
        const abilityId = e.ability;
        if (typeof AbilityHandlers !== 'undefined' && AbilityHandlers[abilityId] && AbilityHandlers[abilityId].onKill) {
            const killLogs = [];
            AbilityHandlers[abilityId].onKill(e, killLogs);
            killLogs.forEach(msg => log(msg));
            if (typeof updateAllVisuals === 'function') {
                updateAllVisuals('enemy');
            }
        }
    }
    
    await wait(500);
    
    // 【关键修复】等待强制换人完成，而不是立即返回
    if (typeof window.checkPlayerDefeatOrForceSwitch === 'function') {
        const result = await window.checkPlayerDefeatOrForceSwitch();
        console.log('[handlePlayerFainted] Force switch completed with result:', result);
    }
}

// ============================================
// 入场特性
// ============================================

/**
 * 触发入场特性 (威吓、天气等)
 */
export function triggerEntryAbilities(pokemon, opponent) {
    const battle = window.battle;
    if (!pokemon || !opponent) return;
    
    // === 【治愈之愿 / 新月祈祷】入场治愈效果 ===
    // 判断是玩家方还是敌方
    const isPlayerPokemon = battle.playerParty && battle.playerParty.includes(pokemon);
    const side = isPlayerPokemon ? battle.playerSide : battle.enemySide;
    
    if (side) {
        // Healing Wish: 回满 HP + 清除状态
        if (side.healingWish) {
            const healAmount = pokemon.maxHp - pokemon.currHp;
            pokemon.currHp = pokemon.maxHp;
            if (pokemon.status) {
                pokemon.status = null;
                pokemon.statusTurns = 0;
                pokemon.sleepTurns = 0;
            }
            log(`<b style="color:#ff69b4">💖 治愈之愿的光芒包围了 ${pokemon.cnName}！HP 完全恢复！</b>`);
            delete side.healingWish;
            console.log(`[HEALING WISH] ${pokemon.cnName} 被治愈，回复 ${healAmount} HP`);
            updateAllVisuals();
        }
        
        // Lunar Dance: 回满 HP + 清除状态 + 回满 PP
        if (side.lunarDance) {
            const healAmount = pokemon.maxHp - pokemon.currHp;
            pokemon.currHp = pokemon.maxHp;
            if (pokemon.status) {
                pokemon.status = null;
                pokemon.statusTurns = 0;
                pokemon.sleepTurns = 0;
            }
            // 回满所有招式的 PP
            if (pokemon.moves) {
                pokemon.moves.forEach(move => {
                    if (move.pp !== undefined && move.maxPp !== undefined) {
                        move.pp = move.maxPp;
                    }
                });
            }
            log(`<b style="color:#9b59b6">🌙 新月祈祷的月光包围了 ${pokemon.cnName}！HP 和 PP 完全恢复！</b>`);
            delete side.lunarDance;
            console.log(`[LUNAR DANCE] ${pokemon.cnName} 被治愈，回复 ${healAmount} HP，PP 全满`);
            updateAllVisuals();
        }
    }
    
    // === 【环境图层系统】进场效果已迁移至 environment overlay API ===
    
    // === 入场特性 ===
    if (typeof AbilityHandlers === 'undefined') return;
    
    const h = AbilityHandlers[pokemon.ability];
    if (h && h.onStart) {
        let logs = [];
        h.onStart(pokemon, opponent, logs, battle);
        logs.forEach(t => log(t));
        updateAllVisuals();
    }
}

// ============================================
// 换人校验（抓人机制）
// ============================================

/**
 * 检查玩家是否可以换人（考虑抓人特性和状态）
 * @returns {Object} { canSwitch: boolean, reason?: string }
 */
export function canPlayerSwitch() {
    const battle = window.battle;
    if (!battle) return { canSwitch: true };
    
    const p = battle.getPlayer();
    const e = battle.getEnemy();
    
    if (!p || !p.isAlive || !p.isAlive()) return { canSwitch: true };
    
    // 使用全局的 checkCanSwitch 函数
    if (typeof window.checkCanSwitch === 'function') {
        return window.checkCanSwitch(p, e, battle);
    }
    
    return { canSwitch: true };
}

/**
 * 检查敌方是否可以换人（考虑抓人特性和状态）
 * @returns {Object} { canSwitch: boolean, reason?: string }
 */
export function canEnemySwitch() {
    const battle = window.battle;
    if (!battle) return { canSwitch: true };
    
    const p = battle.getPlayer();
    const e = battle.getEnemy();
    
    if (!e || !e.isAlive || !e.isAlive()) return { canSwitch: true };
    
    // 使用全局的 checkCanSwitch 函数
    if (typeof window.checkCanSwitch === 'function') {
        return window.checkCanSwitch(e, p, battle);
    }
    
    return { canSwitch: true };
}

// ============================================
// 导出
// ============================================

if (typeof window !== 'undefined') {
    window.hasAliveSwitch = hasAliveSwitch;
    window.handlePlayerPivot = handlePlayerPivot;
    window.handleEnemyPivot = handleEnemyPivot;
    window.handleEnemyFainted = handleEnemyFainted;
    window.handlePlayerFainted = handlePlayerFainted;
    window.triggerEntryAbilities = triggerEntryAbilities;
    window.canPlayerSwitch = canPlayerSwitch;
    window.canEnemySwitch = canEnemySwitch;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        hasAliveSwitch,
        handlePlayerPivot,
        handleEnemyPivot,
        handleEnemyFainted,
        handlePlayerFainted,
        triggerEntryAbilities,
        canPlayerSwitch,
        canEnemySwitch
    };
}
