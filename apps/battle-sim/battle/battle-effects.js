/**
 * ===========================================
 * BATTLE-EFFECTS.JS - 招式副作用处理
 * ===========================================
 * 
 * 从 engine/battle-engine.js 迁移
 * 
 * 职责:
 * - 能力变化 (Boosts)
 * - 反伤 (Recoil)
 * - 吸血 (Drain)
 * - 状态异常
 * - 接触类招式反馈
 * - 特殊技能效果
 * 
 * 依赖: moves-data.js, move-handlers.js, move-effects.js, ability-handlers.js
 */

/**
 * 处理技能带来的副作用（能力升降、反伤、吸血）
 * @param {Pokemon} user 攻击方
 * @param {Pokemon} target 受击方
 * @param {object} move 技能数据
 * @param {number} damageDealt 实际造成的伤害（用于计算反伤/吸血）
 * @param {object} battle 战斗状态
 * @param {boolean} isPlayer 是否为玩家
 * @returns {object} { logs: Array, pivot: boolean }
 */
export function applyMoveSecondaryEffects(user, target, move, damageDealt = 0, battle = null, isPlayer = false) {
    let logs = [];
    
    // 获取完整技能数据
    const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
    
    // === 策略模式：检查是否有特殊处理器 ===
    const handler = (typeof getMoveHandler === 'function') ? getMoveHandler(move.name) : null;
    console.log(`[MOVE HANDLER] Looking for handler: "${move.name}", found:`, handler ? 'YES' : 'NO', handler?.onUse ? '(has onUse)' : '');
    
    // 【修复】提前声明 pivot/passBoosts 标记，供 onUse 和 onHit 共用
    let pivotTriggered = false;
    let passBoostsTriggered = false;
    let revivalChoiceTriggered = false;
    
    // === onUse 钩子 (变化技/天气/场地等，以及技能前置检查如 Fake Out) ===
    // 【重要】蓄力技能的 onUse 已在 applyDamage 中处理，此处跳过
    // 检查：如果 damageDealt > 0，说明已经造成伤害，onUse 已经执行过
    const isChargeMove = handler && handler.isChargeMove;
    const shouldSkipOnUse = isChargeMove && damageDealt > 0;
    
    if (handler && handler.onUse && !shouldSkipOnUse) {
        console.log(`[MOVE HANDLER] Calling onUse for "${move.name}", battle:`, battle, 'isPlayer:', isPlayer);
        const result = handler.onUse(user, target, logs, battle, isPlayer);
        console.log(`[MOVE HANDLER] onUse returned, logs now:`, logs);
        if (result) {
            if (result.failed) {
                return { logs, pivot: false, revivalChoice: false };
            }
            // 【修复】捕获 onUse 返回的 pivot/passBoosts (Baton Pass, Teleport 等)
            if (result.pivot) {
                pivotTriggered = true;
            }
            if (result.passBoosts) {
                passBoostsTriggered = true;
            }
            if (result.needRevivalChoice) {
                revivalChoiceTriggered = true;
            }
            // 【蓄力技能】正在蓄力中，跳过伤害计算
            if (result.charging && result.skipDamage) {
                console.log(`[CHARGE MOVE] ${move.name} is charging, skipping damage`);
                return { logs, pivot: false, charging: true, revivalChoice: revivalChoiceTriggered };
            }
            if (result.selfDestruct) {
                // 自爆类技能已在 handler 中处理 HP
            }
            // 【梦话/模仿等】callMove: 递归执行另一个招式
            if (result.callMove) {
                const calledMove = result.callMove;
                const calledMoveName = calledMove.name || calledMove;
                const calledMoveId = calledMoveName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const calledMoveData = (typeof MOVES !== 'undefined' && MOVES[calledMoveId]) ? MOVES[calledMoveId] : {};
                
                // 构建招式对象
                const moveToExecute = {
                    name: calledMoveName,
                    cn: calledMove.cn || calledMoveData.cnName || calledMoveName,
                    type: calledMoveData.type || 'Normal',
                    power: calledMoveData.basePower || 0,
                    cat: calledMoveData.category === 'Physical' ? 'phys' : 
                         calledMoveData.category === 'Special' ? 'spec' : 'status',
                    accuracy: calledMoveData.accuracy || 100
                };
                
                logs.push(`<span style="color:#a78bfa">→ 使用了 ${moveToExecute.cn}!</span>`);
                
                // 递归调用伤害计算和副作用
                if (typeof applyDamage === 'function' && moveToExecute.power > 0) {
                    const spriteId = isPlayer ? 'enemy-sprite' : 'player-sprite';
                    const dmgResult = applyDamage(user, target, moveToExecute, spriteId);
                    if (dmgResult && dmgResult.damage > 0) {
                        damageDealt = dmgResult.damage;
                    }
                } else {
                    // 状态招式：直接调用副作用处理
                    const subResult = applyMoveSecondaryEffects(user, target, moveToExecute, 0, battle, isPlayer);
                    logs.push(...subResult.logs);
                    if (subResult.revivalChoice) {
                        revivalChoiceTriggered = true;
                    }
                    if (subResult.pivot) {
                        return { logs, pivot: true, revivalChoice: revivalChoiceTriggered };
                    }
                }
                
                // 跳过原招式的后续处理
                if (result.skipDamage) {
                    return { logs, pivot: false, revivalChoice: revivalChoiceTriggered };
                }
            }
        }
    }
    
    // === onHit 钩子 (命中后效果) ===
    let phazeTriggered = false;
    if (handler && handler.onHit) {
        const hitResult = handler.onHit(user, target, damageDealt, logs, battle, move);
        if (hitResult && hitResult.pivot) {
            pivotTriggered = true;
        }
        // 【新增】强制换人效果 (Roar, Whirlwind, Dragon Tail, Circle Throw)
        if (hitResult && hitResult.phaze) {
            phazeTriggered = true;
        }
        // 【修复】治疗类招式命中后触发 HEAL 音效 + VFX (Recover/Roost/Rest/Strength Sap 等)
        if (hitResult && ((hitResult.heal && hitResult.heal > 0) || hitResult.rest || hitResult.strengthSap || hitResult.purify)) {
            if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('HEAL');
            if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                const _isUserPlayer = window.battle && window.battle.playerParty && window.battle.playerParty.includes(user);
                window.BattleVFX.triggerStatVFX('HEAL', _isUserPlayer ? 'player-sprite' : 'enemy-sprite');
            }
        }
    } else if (fullMoveData.heal && Array.isArray(fullMoveData.heal) && fullMoveData.target === 'self') {
        // 【修复】无 onHit handler 但有 heal: [num, den] 的回复招式 (Milk Drink/Heal Order/Life Dew 等)
        // 【回复封锁 Heal Block / Psychic Noise】检查
        if (user.volatile && user.volatile.healBlock && user.volatile.healBlock > 0) {
            logs.push(`<span style="color:#e056fd">${user.cnName} 处于回复封锁状态，无法回复!</span>`);
            return { logs, pivot: pivotTriggered, revivalChoice: revivalChoiceTriggered };
        }
        const [num, den] = fullMoveData.heal;
        const baseHeal = Math.floor(user.maxHp * num / den);
        const maxHeal = user.maxHp - user.currHp;
        if (maxHeal > 0 && baseHeal > 0) {
            let actualHeal;
            if (typeof user.heal === 'function') {
                actualHeal = user.heal(baseHeal);
            } else {
                actualHeal = Math.min(baseHeal, maxHeal);
                user.currHp += actualHeal;
            }
            if (actualHeal > 0) {
                logs.push(`${user.cnName} 恢复了体力!`);
                if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('HEAL');
                if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                    const _isUserPlayer = window.battle && window.battle.playerParty && window.battle.playerParty.includes(user);
                    window.BattleVFX.triggerStatVFX('HEAL', _isUserPlayer ? 'player-sprite' : 'enemy-sprite');
                }
            } else {
                logs.push(`${user.cnName} 的体力已满!`);
            }
        } else {
            logs.push(`${user.cnName} 的体力已满!`);
        }
    }
    
    // === 强制换人处理 (Phazing) ===
    // 检查 moves-data.js 中的 forceSwitch 属性
    if (!phazeTriggered && fullMoveData.forceSwitch) {
        phazeTriggered = true;
    }
    
    // 【修复】检查目标是否免疫强制换人
    if (phazeTriggered && battle) {
        let phazeImmune = false;
        let immuneReason = '';
        const moveName = move.name || '';
        const isStatusMove = fullMoveData.category === 'Status';
        const isRoar = moveName === 'Roar';
        const isWhirlwind = moveName === 'Whirlwind';
        
        // 1. 特性检查：吸盘 (Suction Cups)、看门犬 (Guard Dog)
        const targetAbility = target.ability || '';
        if (typeof AbilityHandlers !== 'undefined') {
            const abilityHandler = AbilityHandlers[targetAbility];
            if (abilityHandler && abilityHandler.preventPhazing) {
                phazeImmune = true;
                const abilityNameCN = targetAbility === 'Suction Cups' ? '吸盘' : '看门犬';
                immuneReason = `${target.cnName} 的${abilityNameCN}紧紧吸住地面！无法被吹走！`;
            }
        }
        
        // 2. 极巨化状态免疫强制换人
        if (!phazeImmune && target.isDynamaxed) {
            phazeImmune = true;
            immuneReason = `${target.cnName} 处于极巨化状态，无法被强制换下！`;
        }
        
        // 3. 扎根状态免疫强制换人
        if (!phazeImmune && target.volatile && target.volatile.ingrain) {
            phazeImmune = true;
            immuneReason = `${target.cnName} 扎根在地面上，无法被吹走！`;
        }
        
        // 4. 隔音 (Soundproof) 免疫吼叫
        if (!phazeImmune && isRoar && targetAbility === 'Soundproof') {
            phazeImmune = true;
            immuneReason = `${target.cnName} 的隔音特性使吼叫无效！`;
        }
        
        // 5. 乘风 (Wind Rider) 免疫吹飞
        if (!phazeImmune && isWhirlwind && targetAbility === 'Wind Rider') {
            phazeImmune = true;
            immuneReason = `${target.cnName} 的乘风特性使吹飞无效！`;
            // 乘风还会提升攻击
            if (typeof target.applyBoost === 'function') {
                target.applyBoost('atk', 1);
                logs.push(`<span style="color:#27ae60">🌬️ ${target.cnName} 乘着风势，攻击提升了！</span>`);
            }
        }
        
        // 6. 黄金之躯 (Good as Gold) 免疫变化技（吼叫/吹飞）
        if (!phazeImmune && isStatusMove && targetAbility === 'Good as Gold') {
            phazeImmune = true;
            immuneReason = `${target.cnName} 的黄金之躯使变化技无效！`;
        }
        
        // 7. 魔法镜 (Magic Bounce) 反弹变化技（吼叫/吹飞）
        // 注意：反弹后使用者自己会被吹飞
        if (!phazeImmune && isStatusMove && targetAbility === 'Magic Bounce') {
            logs.push(`<span style="color:#9b59b6">✨ ${target.cnName} 的魔法镜将${move.cn || moveName}反弹了回去！</span>`);
            // 反弹效果：使用者被强制换人
            phazeImmune = true; // 目标不被换人
            // 标记使用者被强制换人
            if (isPlayer) {
                // 玩家使用的技能被反弹，敌方（使用者）被换人 -> 实际是玩家被换人
                battle.playerForcedSwitch = true;
                logs.push(`<span style="color:#e74c3c">⚡ ${user.cnName} 被自己的招式吹走了！必须更换宝可梦!</span>`);
            } else {
                // 敌方使用的技能被反弹，敌方被换人
                const enemyParty = battle.enemyParty || battle.enemyTeam;
                const enemyActiveIdx = battle.enemyActive ?? battle.enemyActiveIndex ?? 0;
                if (enemyParty && enemyParty.length > 1) {
                    const availablePokemon = enemyParty.filter((p, idx) => 
                        idx !== enemyActiveIdx && p.currHp > 0 && p.isAlive && p.isAlive()
                    );
                    if (availablePokemon.length > 0) {
                        const randomPoke = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
                        const newIndex = enemyParty.indexOf(randomPoke);
                        if (target.volatile) target.volatile = {};
                        battle.enemyActive = newIndex;
                        if ('enemyActiveIndex' in battle) battle.enemyActiveIndex = newIndex;
                        randomPoke.turnCount = 0;
                        logs.push(`<span style="color:#3498db">🔄 ${user.cnName} 被自己的招式吹走了！${randomPoke.cnName} 被强制拉上了战场!</span>`);
                    }
                }
            }
        }
        
        if (phazeImmune) {
            if (immuneReason) {
                logs.push(`<span style="color:#9b59b6">${immuneReason}</span>`);
            }
            phazeTriggered = false; // 取消强制换人
        }
    }
    
    if (phazeTriggered && battle) {
        // 标记需要强制换人，由战斗主循环处理
        // 【注意】单打模式下，AI 方被强制换人时自动随机选择
        const isTargetPlayer = !isPlayer;
        if (isTargetPlayer) {
            // 玩家被强制换人 - 标记状态，由 UI 处理
            battle.playerForcedSwitch = true;
            logs.push(`<span style="color:#e74c3c">⚡ 必须更换宝可梦!</span>`);
        } else {
            // AI 被强制换人 - 自动随机选择
            // 【修复】使用 enemyParty 而不是 enemyTeam，使用 enemyActive 而不是 enemyActiveIndex
            const enemyParty = battle.enemyParty || battle.enemyTeam;
            const enemyActiveIdx = battle.enemyActive ?? battle.enemyActiveIndex ?? 0;
            
            if (enemyParty && enemyParty.length > 1) {
                const availablePokemon = enemyParty.filter((p, idx) => 
                    idx !== enemyActiveIdx && p.currHp > 0 && p.isAlive && p.isAlive()
                );
                if (availablePokemon.length > 0) {
                    const randomPoke = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
                    const newIndex = enemyParty.indexOf(randomPoke);
                    
                    // 清除当前宝可梦的 volatile 状态
                    if (target.volatile) {
                        target.volatile = {};
                    }
                    
                    // 执行换人
                    battle.enemyActive = newIndex;
                    // 兼容旧属性名
                    if ('enemyActiveIndex' in battle) {
                        battle.enemyActiveIndex = newIndex;
                    }
                    
                    // 重置入场回合计数
                    randomPoke.turnCount = 0;
                    
                    logs.push(`<span style="color:#3498db">🔄 ${randomPoke.cnName} 被强制拉上了战场!</span>`);
                    
                    // 触发入场钉子伤害
                    if (typeof MoveEffects !== 'undefined' && MoveEffects.applyEntryHazards) {
                        const hazardLogs = MoveEffects.applyEntryHazards(randomPoke, false, battle);
                        if (hazardLogs && hazardLogs.length > 0) {
                            logs.push(...hazardLogs);
                        }
                    }
                    
                    // 更新视觉
                    if (typeof window !== 'undefined' && typeof window.updateAllVisuals === 'function') {
                        window.updateAllVisuals('enemy');
                    }
                } else {
                    logs.push(`但是对手没有其他宝可梦可以上场了!`);
                }
            } else {
                logs.push(`但是对手没有其他宝可梦可以上场了!`);
            }
        }
    }
    
    // === 场地状态技能处理 (sideCondition) ===
    if (fullMoveData.sideCondition && battle) {
        if (typeof MoveEffects !== 'undefined' && MoveEffects.applySideCondition) {
            const sideLogs = MoveEffects.applySideCondition(user, move, battle);
            logs.push(...sideLogs);
        }
    }
    // self.sideCondition（如 Baddy Bad 的 self: { sideCondition: 'reflect' }）
    if (fullMoveData.self && fullMoveData.self.sideCondition && battle) {
        if (typeof MoveEffects !== 'undefined' && MoveEffects.applySideCondition) {
            // 构造一个临时 move 对象，将 self.sideCondition 提升为顶层 + target 改为 allySide
            const selfMoveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const selfMoveData = { ...fullMoveData, sideCondition: fullMoveData.self.sideCondition, target: 'allySide' };
            const tempMoveObj = { name: move.name, _overrideMoveData: selfMoveData };
            const sideLogs = MoveEffects.applySideCondition(user, tempMoveObj, battle);
            logs.push(...sideLogs);
        }
    }
    
    // === 场地 (Terrain) 设置处理 ===
    if (fullMoveData.terrain && battle) {
        const TERRAIN_NAMES = {
            'electricterrain': '电气场地',
            'grassyterrain': '青草场地',
            'mistyterrain': '薄雾场地',
            'psychicterrain': '精神场地'
        };
        const TERRAIN_ICONS = {
            'electricterrain': '⚡',
            'grassyterrain': '🌿',
            'mistyterrain': '🌫️',
            'psychicterrain': '🔮'
        };
        const newTerrain = fullMoveData.terrain;
        const terrainName = TERRAIN_NAMES[newTerrain] || newTerrain;
        const terrainIcon = TERRAIN_ICONS[newTerrain] || '🌍';
        
        if (battle.terrain === newTerrain) {
            logs.push(`但是失败了! (${terrainName}已经存在)`);
        } else {
            if (battle.terrain) {
                const oldName = TERRAIN_NAMES[battle.terrain] || battle.terrain;
                logs.push(`${oldName}消失了...`);
            }
            battle.terrain = newTerrain;
            battle.terrainTurns = 5;
            logs.push(`<b style="color:#a78bfa">${terrainIcon} ${terrainName}覆盖了战场！</b>`);
        }
    }
    
    // === 伪天气 (pseudoWeather) 设置处理 ===
    if (fullMoveData.pseudoWeather && battle) {
        if (!battle.field) battle.field = {};
        const pwId = fullMoveData.pseudoWeather;
        if (battle.field[pwId] && battle.field[pwId] > 0) {
            logs.push(`但是失败了! (效果已经存在)`);
        } else {
            battle.field[pwId] = 5;
            const pwNames = {
                'watersport': '💧 玩水的效果覆盖了全场！火属性招式威力减半！',
                'mudsport': '🟤 玩泥巴的效果覆盖了全场！电属性招式威力减半！',
                'iondeluge': '⚡ 等离子浴覆盖了全场！普通系招式变为电系！'
            };
            logs.push(`<b>${pwNames[pwId] || `${pwId} 效果展开了！`}</b>`);
        }
    }
    
    // 能力名称映射
    const statMap = {
        atk: "攻击", def: "防御", spa: "特攻", spd: "特防", spe: "速度",
        accuracy: "命中率", evasion: "闪避率"
    };
    
    // 变化幅度文案
    const getChangeText = (val) => {
        if (Math.abs(val) >= 3) return "极大幅";
        if (Math.abs(val) === 2) return "大幅";
        return "";
    };
    
    // helper：修改指定对象的能力
    const changeStats = (subject, boostsObj, isSelfInflicted = false) => {
        if (!boostsObj) return;
        for (const [stat, val] of Object.entries(boostsObj)) {
            if (typeof val !== 'number') continue;
            
            // 【白雾 Mist】检查：己方白雾阻止对手造成的能力下降
            if (val < 0 && !isSelfInflicted && battle) {
                const isSubjectPlayer = battle.playerParty && battle.playerParty.includes(subject);
                const subjectSide = isSubjectPlayer ? battle.playerSide : battle.enemySide;
                if (subjectSide && subjectSide.mist > 0) {
                    logs.push(`白雾保护了 ${subject.cnName}，能力不会下降！`);
                    continue; // 跳过此项能力下降
                }
            }
            
            const diff = subject.applyBoost(stat, val);
            if (diff === 0) {
                const currentBoost = subject.boosts[stat] || 0;
                if (currentBoost >= 6) {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}已经无法再提升了!`);
                } else if (currentBoost <= -6) {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}已经无法再降低了!`);
                } else {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}无法改变!`);
                }
            } else {
                const changeText = getChangeText(diff);
                if (diff > 0) {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}${changeText}提升了!`);
                    if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('STAT_UP');
                    if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                        const _b = window.battle;
                        const _isSubjectPlayer = _b && _b.playerParty && _b.playerParty.includes(subject);
                        window.BattleVFX.triggerStatVFX('BUFF', _isSubjectPlayer ? 'player-sprite' : 'enemy-sprite');
                    }
                } else {
                    logs.push(`${subject.cnName} 的${statMap[stat] || stat}${changeText}下降了!`);
                    if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('STAT_DOWN');
                    if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                        const _b = window.battle;
                        const _isSubjectPlayer = _b && _b.playerParty && _b.playerParty.includes(subject);
                        window.BattleVFX.triggerStatVFX('DEBUFF', _isSubjectPlayer ? 'player-sprite' : 'enemy-sprite');
                    }
                }
            }
        }
        
        // === 【白色香草 White Herb】能力下降后立即检查 ===
        checkWhiteHerb(subject, logs);
    };
    
    // helper：检查并触发白色香草
    const checkWhiteHerb = (pokemon, logs) => {
        if (!pokemon.item) return;
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z]/g, '');
        if (itemId !== 'whiteherb' && pokemon.item !== '白色香草') return;
        
        let restored = false;
        const statNames = ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion'];
        for (const stat of statNames) {
            if (pokemon.boosts[stat] < 0) {
                pokemon.boosts[stat] = 0;
                restored = true;
            }
        }
        
        if (restored) {
            // 消耗道具
            const oldItem = pokemon.item;
            pokemon.item = null;
            logs.push(`<b style="color:#22c55e">🍃 ${pokemon.cnName} 的白色香草发动了！能力下降被还原了！</b>`);
            console.log(`[WHITE HERB] ${pokemon.cnName} 消耗了 ${oldItem}，能力下降被还原`);
            if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('ITEM_USE');
        }
    };
    
    // ========== 1. 能力变化 (Boosts) ==========
    const selfTargets = ['self', 'allySide', 'adjacentAlly', 'adjacentAllyOrSelf', 'allies'];
    const isTargetSelf = selfTargets.includes(fullMoveData.target);
    
    // 1.1 Status 招式的 boosts
    if (fullMoveData.category === 'Status' && fullMoveData.boosts) {
        if (isTargetSelf) {
            changeStats(user, fullMoveData.boosts, true);
        } else {
            changeStats(target, fullMoveData.boosts);
        }
    }
    
    // 1.2 self.boosts（对自己生效的副作用，如近身战降双防）
    if (fullMoveData.self && fullMoveData.self.boosts) {
        changeStats(user, fullMoveData.self.boosts, true);
    }
    
    // 1.2b self.volatileStatus（对自己施加的 volatile 状态）
    // 【修复】通用处理 mustrecharge/lockedmove 等，防止无 onHit handler 的招式遗漏
    if (fullMoveData.self && fullMoveData.self.volatileStatus && damageDealt > 0) {
        const selfVS = fullMoveData.self.volatileStatus;
        if (selfVS === 'mustrecharge' && !user.mustRecharge) {
            user.mustRecharge = true;
            console.log(`[SELF VS] ${user.cnName} 需要下回合休息 (${move.name})`);
        }
    }
    
    // =========================================================
    // 【Sheer Force 强行】特性检查
    // 如果招式有 secondary 副作用且攻击方有 Sheer Force，跳过副作用
    // 威力提升已在 ability-handlers.js 的 onBasePower 中处理
    // =========================================================
    const userAbilityId = (user.ability || '').toLowerCase().replace(/[^a-z]/g, '');
    const hasSheerForce = userAbilityId === 'sheerforce';
    const moveHasSecondary = fullMoveData.secondary || fullMoveData.secondaries;
    
    // Sheer Force 激活标记（用于生命宝珠反伤免疫）
    const sheerForceActive = hasSheerForce && moveHasSecondary;
    
    // =========================================================
    // 【Covert Cloak】隐密斗篷检查 - 免疫所有招式追加效果
    // =========================================================
    const targetItemId = (target.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const hasCovertCloak = targetItemId === 'covertcloak';
    
    // 1.3 Secondary Effects（几率触发，通常对敌人）
    // 【Sheer Force】如果特性激活，跳过所有 secondary 副作用
    if (fullMoveData.secondary && !sheerForceActive) {
        let chance = fullMoveData.secondary.chance || 100;
        // 【修复】天恩 (Serene Grace) 副作用概率翻倍
        if (typeof AbilityHandlers !== 'undefined' && user.ability && AbilityHandlers[user.ability]) {
            const ah = AbilityHandlers[user.ability];
            if (ah.onModifySecondaryChance) {
                chance = ah.onModifySecondaryChance(chance, fullMoveData, user);
            }
        }
        if (Math.random() * 100 < chance) {
            // 【Covert Cloak】对目标的能力下降被阻止
            if (fullMoveData.secondary.boosts) {
                // 检查是否有对目标的负面效果
                const hasNegativeBoosts = Object.values(fullMoveData.secondary.boosts).some(v => v < 0);
                if (hasNegativeBoosts && hasCovertCloak) {
                    logs.push(`${target.cnName} 的隐密斗篷阻止了能力下降!`);
                } else {
                    changeStats(target, fullMoveData.secondary.boosts);
                }
            }
            if (fullMoveData.secondary.self && fullMoveData.secondary.self.boosts) {
                changeStats(user, fullMoveData.secondary.self.boosts, true);
            }
            
            // 状态异常
            // 【Covert Cloak】隐密斗篷免疫追加状态异常
            if (fullMoveData.secondary.status) {
                if (hasCovertCloak) {
                    logs.push(`${target.cnName} 的隐密斗篷阻止了状态异常!`);
                } else {
                    const s = fullMoveData.secondary.status;
                    
                    // 【环境图层系统】检查状态阻止
                    let statusPrevented = false;
                    if (typeof window !== 'undefined' && window.envOverlay && typeof window.envOverlay.isStatusPrevented === 'function') {
                        statusPrevented = window.envOverlay.isStatusPrevented(target, s);
                        if (statusPrevented) {
                            const statusName = (typeof window.envOverlay._getStatusName === 'function') ? window.envOverlay._getStatusName(s) : s;
                            logs.push(`<span style="color:#3b82f6">环境效果阻止了${statusName}状态！</span>`);
                            console.log(`[ENV OVERLAY] 状态阻止: ${s} (${statusName})`);
                        }
                    }
                    if (!statusPrevented && !target.status) {
                        if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                            const result = MoveEffects.tryInflictStatus(target, s, user, battle);
                            if (result.success) {
                                if (s === 'slp') {
                                    target.sleepTurns = Math.floor(Math.random() * 3) + 2;
                                }
                                logs.push(result.message);
                            }
                        } else {
                            target.status = s;
                            if (s === 'slp') {
                                target.sleepTurns = Math.floor(Math.random() * 3) + 2;
                            }
                            // 播放状态异常音效 + VFX
                            const STATUS_SFX_MAP_A = { brn: 'BRN', frz: 'FRZ', par: 'PAR', psn: 'PSN', tox: 'TOX', slp: 'SLP' };
                            if (STATUS_SFX_MAP_A[s] && typeof window !== 'undefined') {
                                if (typeof window.playSFX === 'function') window.playSFX(STATUS_SFX_MAP_A[s]);
                                if (typeof window.BattleVFX !== 'undefined') {
                                    const _sid = isPlayer ? 'enemy-sprite' : 'player-sprite';
                                    window.BattleVFX.triggerStatusVFX(STATUS_SFX_MAP_A[s], _sid);
                                }
                            }
                            const statusMap = {
                                brn: "被灼伤了!", psn: "中毒了!", par: "麻痹了!",
                                tox: "中了剧毒!", slp: "睡着了!", frz: "被冻结了!"
                            };
                            const statusText = statusMap[s];
                            if (statusText) {
                                logs.push(`${target.cnName} ${statusText}`);
                            }
                        }
                    }
                }
            }
            
            // 畏缩效果
            // 【Covert Cloak】隐密斗篷免疫畏缩等追加效果
            // 【Inner Focus/Shield Dust】免疫畏缩
            if (fullMoveData.secondary.volatileStatus === 'flinch') {
                const tAbilityId = (target.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                const immuneToFlinch = ['innerfocus', 'shielddust'].includes(tAbilityId);
                if (hasCovertCloak) {
                    logs.push(`${target.cnName} 的隐密斗篷阻止了畏缩效果!`);
                } else if (immuneToFlinch) {
                    // 精神力/防尘 免疫畏缩，不输出日志（静默免疫）
                } else {
                    target.volatile = target.volatile || {};
                    target.volatile.flinch = true;
                    logs.push(`${target.cnName} 畏缩了!`);
                    // 播放畏缩 VFX
                    if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                        const _fid = isPlayer ? 'enemy-sprite' : 'player-sprite';
                        window.BattleVFX.triggerStatusVFX('FLINCH', _fid);
                    }
                }
            }
            
            // 混乱效果 (Dynamic Punch, Hurricane 等)
            // 【Covert Cloak】隐密斗篷免疫混乱等追加效果
            // 【Own Tempo】免疫混乱
            if (fullMoveData.secondary.volatileStatus === 'confusion') {
                const tAbilityIdC = (target.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                const immuneToConfusion = tAbilityIdC === 'owntempo';
                if (hasCovertCloak) {
                    logs.push(`${target.cnName} 的隐密斗篷阻止了混乱效果!`);
                } else if (immuneToConfusion) {
                    logs.push(`${target.cnName} 的我行我素免疫了混乱!`);
                } else {
                    target.volatile = target.volatile || {};
                    if (!target.volatile.confusion) {
                        target.volatile.confusion = 2 + Math.floor(Math.random() * 4);
                        logs.push(`${target.cnName} 混乱了!`);
                        // 播放混乱 VFX
                        if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                            const _cid = isPlayer ? 'enemy-sprite' : 'player-sprite';
                            window.BattleVFX.triggerStatusVFX('CNF', _cid);
                        }
                    }
                }
            }
            
            // 【Gen 9】回复封锁 (Psychic Noise 精神噪音)
            // 施加 healBlock 状态，2 回合内禁止目标回复
            if (fullMoveData.secondary.volatileStatus === 'healblock') {
                if (hasCovertCloak) {
                    logs.push(`${target.cnName} 的隐密斗篷阻止了回复封锁!`);
                } else {
                    target.volatile = target.volatile || {};
                    if (!target.volatile.healBlock) {
                        target.volatile.healBlock = 2;
                        logs.push(`<span style="color:#e056fd">🔇 ${target.cnName} 被施加了回复封锁!</span>`);
                    }
                }
            }
            
            // 【Gen 9】糖浆炸弹 (Syrup Bomb)
            // 施加 syrupbomb 状态，3 回合每回合速度-1
            if (fullMoveData.secondary.volatileStatus === 'syrupbomb') {
                if (hasCovertCloak) {
                    logs.push(`${target.cnName} 的隐密斗篷阻止了糖浆效果!`);
                } else {
                    target.volatile = target.volatile || {};
                    if (!target.volatile.syrupbomb) {
                        target.volatile.syrupbomb = 3;
                        logs.push(`<span style="color:#f39c12">🍯 ${target.cnName} 被黏稠的糖浆覆盖了!</span>`);
                    }
                }
            }
            
            // 【Gen 7】泡影的咏叹调 (Sparkling Aria)
            // 治愈目标的烧伤状态
            if (fullMoveData.secondary.volatileStatus === 'sparklingaria') {
                if (target.status === 'brn') {
                    target.status = null;
                    target.statusTurns = 0;
                    logs.push(`<span style="color:#3498db">💧 ${target.cnName} 的烧伤被泡沫治愈了!</span>`);
                }
            }
        }
    }
    
    // 1.3b Secondaries 数组处理（Ice Fang, Fire Fang, Thunder Fang 等多副作用招式）
    // 【Sheer Force】如果特性激活，跳过所有 secondaries 副作用
    if (fullMoveData.secondaries && Array.isArray(fullMoveData.secondaries) && !sheerForceActive) {
        for (const sec of fullMoveData.secondaries) {
            let chance = sec.chance || 100;
            // 【修复】天恩 (Serene Grace) 副作用概率翻倍
            if (typeof AbilityHandlers !== 'undefined' && user.ability && AbilityHandlers[user.ability]) {
                const ah = AbilityHandlers[user.ability];
                if (ah.onModifySecondaryChance) {
                    chance = ah.onModifySecondaryChance(chance, fullMoveData, user);
                }
            }
            if (Math.random() * 100 < chance) {
                // 状态异常
                // 【Covert Cloak】隐密斗篷免疫追加状态异常
                if (sec.status && !target.status) {
                    if (hasCovertCloak) {
                        logs.push(`${target.cnName} 的隐密斗篷阻止了状态异常!`);
                    } else {
                        if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                            const result = MoveEffects.tryInflictStatus(target, sec.status, user, battle);
                            if (result.success) {
                                if (sec.status === 'slp') {
                                    target.sleepTurns = Math.floor(Math.random() * 3) + 2;
                                }
                                logs.push(result.message);
                            }
                        } else {
                            target.status = sec.status;
                            if (sec.status === 'slp') {
                                target.sleepTurns = Math.floor(Math.random() * 3) + 2;
                            }
                            // 播放状态异常音效 + VFX
                            const STATUS_SFX_MAP_B = { brn: 'BRN', frz: 'FRZ', par: 'PAR', psn: 'PSN', tox: 'TOX', slp: 'SLP' };
                            if (STATUS_SFX_MAP_B[sec.status] && typeof window !== 'undefined') {
                                if (typeof window.playSFX === 'function') window.playSFX(STATUS_SFX_MAP_B[sec.status]);
                                if (typeof window.BattleVFX !== 'undefined') {
                                    const _sid = isPlayer ? 'enemy-sprite' : 'player-sprite';
                                    window.BattleVFX.triggerStatusVFX(STATUS_SFX_MAP_B[sec.status], _sid);
                                }
                            }
                            const statusMap = {
                                brn: "被灼伤了!", psn: "中毒了!", par: "麻痹了!",
                                tox: "中了剧毒!", slp: "睡着了!", frz: "被冻结了!"
                            };
                            const statusText = statusMap[sec.status];
                            if (statusText) {
                                logs.push(`${target.cnName} ${statusText}`);
                            }
                        }
                    }
                }
                
                // 畏缩效果
                // 【Covert Cloak】隐密斗篷免疫畏缩等追加效果
                // 【Inner Focus/Shield Dust】免疫畏缩
                if (sec.volatileStatus === 'flinch') {
                    const tAbilityId2 = (target.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                    const immuneToFlinch2 = ['innerfocus', 'shielddust'].includes(tAbilityId2);
                    if (hasCovertCloak) {
                        logs.push(`${target.cnName} 的隐密斗篷阻止了畏缩效果!`);
                    } else if (immuneToFlinch2) {
                        // 精神力/防尘 免疫畏缩
                    } else {
                        target.volatile = target.volatile || {};
                        target.volatile.flinch = true;
                        logs.push(`${target.cnName} 畏缩了!`);
                        // 播放畏缩 VFX
                        if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                            const _fid = isPlayer ? 'enemy-sprite' : 'player-sprite';
                            window.BattleVFX.triggerStatusVFX('FLINCH', _fid);
                        }
                    }
                }
                
                // 混乱效果
                // 【Covert Cloak】隐密斗篷免疫混乱等追加效果
                // 【Own Tempo】免疫混乱
                if (sec.volatileStatus === 'confusion') {
                    const tAbilityIdC2 = (target.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                    const immuneToConfusion2 = tAbilityIdC2 === 'owntempo';
                    if (hasCovertCloak) {
                        logs.push(`${target.cnName} 的隐密斗篷阻止了混乱效果!`);
                    } else if (immuneToConfusion2) {
                        logs.push(`${target.cnName} 的我行我素免疫了混乱!`);
                    } else {
                        target.volatile = target.volatile || {};
                        if (!target.volatile.confusion) {
                            target.volatile.confusion = 2 + Math.floor(Math.random() * 4);
                            logs.push(`${target.cnName} 混乱了!`);
                            if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                                const _cid = isPlayer ? 'enemy-sprite' : 'player-sprite';
                                window.BattleVFX.triggerStatusVFX('CNF', _cid);
                            }
                        }
                    }
                }
                
                // 能力变化
                // 【Covert Cloak】隐密斗篷免疫追加能力下降
                if (sec.boosts) {
                    const hasNegativeBoosts = Object.values(sec.boosts).some(v => v < 0);
                    if (hasNegativeBoosts && hasCovertCloak) {
                        logs.push(`${target.cnName} 的隐密斗篷阻止了能力下降!`);
                    } else {
                        changeStats(target, sec.boosts);
                    }
                }
            }
        }
    }
    
    // =========================================================
    // 【Stench 恶臭】特性 - 攻击招式 10% 畏缩
    // =========================================================
    if (damageDealt > 0 && userAbilityId === 'stench' && !hasCovertCloak) {
        const targetAbilityId = (target.ability || '').toLowerCase().replace(/[^a-z]/g, '');
        const immuneToFlinch = ['innerfocus', 'shielddust'].includes(targetAbilityId);
        
        if (!immuneToFlinch) {
            const flinchChance = 0.10;
            if (Math.random() < flinchChance) {
                target.volatile = target.volatile || {};
                target.volatile.flinch = true;
                logs.push(`${user.cnName} 的恶臭让 ${target.cnName} 畏缩了！`);
                // 播放畏缩 VFX
                if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                    const _fid = isPlayer ? 'enemy-sprite' : 'player-sprite';
                    window.BattleVFX.triggerStatusVFX('FLINCH', _fid);
                }
            }
        }
    }
    
    // 1.4 Status 招式直接施加状态
    if (fullMoveData.status) {
        const s = fullMoveData.status;
        
        // 【BUG修复】粉末类招式免疫检查（草系/防尘护目镜/防尘特性）
        const powderMoves = ['spore', 'sleeppowder', 'poisonpowder', 'stunspore', 'ragepowder', 'cottonspore', 'powder'];
        if (powderMoves.includes(moveId)) {
            // 草系免疫
            if (target.types && target.types.includes('Grass')) {
                logs.push(`${target.cnName} 的草属性免疫了粉末类招式!`);
                return { logs, pivot: pivotTriggered, revivalChoice: revivalChoiceTriggered };
            }
            // 防尘护目镜免疫
            const targetItemId = (target.item || '').toLowerCase().replace(/[^a-z]/g, '');
            if (targetItemId === 'safetygoggles') {
                logs.push(`${target.cnName} 的防尘护目镜免疫了粉末类招式!`);
                return { logs, pivot: pivotTriggered, revivalChoice: revivalChoiceTriggered };
            }
            // 防尘特性免疫
            const targetAbilityId = (target.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            if (targetAbilityId === 'overcoat') {
                logs.push(`${target.cnName} 的防尘特性免疫了粉末类招式!`);
                return { logs, pivot: pivotTriggered, revivalChoice: revivalChoiceTriggered };
            }
        }
        
        if (!target.status) {
            if (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) {
                const result = MoveEffects.tryInflictStatus(target, s, user, battle);
                if (result.success) {
                    if (s === 'slp') {
                        target.sleepTurns = Math.floor(Math.random() * 3) + 2;
                    }
                    logs.push(result.message);
                } else {
                    logs.push(result.message);
                }
            } else {
                target.status = s;
                if (s === 'slp') {
                    target.sleepTurns = Math.floor(Math.random() * 3) + 2;
                }
                // 播放状态异常音效 + VFX
                const STATUS_SFX_MAP_C = { brn: 'BRN', frz: 'FRZ', par: 'PAR', psn: 'PSN', tox: 'TOX', slp: 'SLP' };
                if (STATUS_SFX_MAP_C[s] && typeof window !== 'undefined') {
                    if (typeof window.playSFX === 'function') window.playSFX(STATUS_SFX_MAP_C[s]);
                    if (typeof window.BattleVFX !== 'undefined') {
                        const _sid = isPlayer ? 'enemy-sprite' : 'player-sprite';
                        window.BattleVFX.triggerStatusVFX(STATUS_SFX_MAP_C[s], _sid);
                    }
                }
                const statusMap = {
                    brn: "被灼伤了!", psn: "中毒了!", par: "麻痹了!",
                    tox: "中了剧毒!", slp: "睡着了!", frz: "被冻结了!"
                };
                const statusText = statusMap[s];
                if (statusText) {
                    logs.push(`${target.cnName} ${statusText}`);
                }
            }
        } else {
            // 【修复】目标已有状态时，显示失败消息而不是静默跳过
            logs.push(`${target.cnName} 已经处于异常状态，无法再施加新的状态!`);
        }
    }
    
    // === 1.5 Protect/Detect 守住类技能 ===
    // 【修复】move-handlers.js 的 onUse 已经设置了 volatile.protect 并推送了日志
    // 此处仅作为兜底：如果没有 handler 处理，才设置 protect 状态和日志
    const isProtectMove = fullMoveData.stallingMove || 
        (fullMoveData.volatileStatus && ['protect', 'banefulbunker', 'spikyshield', 'kingsshield', 'obstruct', 'silktrap', 'burningbulwark'].includes(fullMoveData.volatileStatus));
    if (isProtectMove && !(user.volatile && user.volatile.protect)) {
        user.volatile = user.volatile || {};
        user.volatile.protect = true;
        // 【BUG修复】设置特殊守住类型标记，否则接触反制效果不会触发
        const vs = fullMoveData.volatileStatus;
        if (vs === 'banefulbunker') user.volatile.banefulBunker = true;
        if (vs === 'spikyshield') user.volatile.spikyShield = true;
        if (vs === 'kingsshield') user.volatile.kingsShield = true;
        if (vs === 'obstruct') user.volatile.obstruct = true;
        if (vs === 'silktrap') user.volatile.silkTrap = true;
        if (vs === 'burningbulwark') user.volatile.burningBulwark = true;
        logs.push(`${user.cnName} 守住了自己!`);
    }
    
    // ========== 2. 吸血 (Drain) - 先于反伤结算 ==========
    // 【Gen 9 正确顺序】吸血回复应在生命宝珠反伤之前结算
    if (fullMoveData.drain && damageDealt > 0) {
        const [num, den] = fullMoveData.drain;
        let baseHeal = Math.max(1, Math.floor(damageDealt * num / den));
        
        // 【环境图层系统】吸血效率修正
        if (typeof window !== 'undefined' && window.envOverlay && typeof window.envOverlay.getDrainMod === 'function') {
            const drainMod = window.envOverlay.getDrainMod(user, move);
            if (drainMod !== 1) {
                baseHeal = Math.floor(baseHeal * drainMod);
                console.log(`[ENV OVERLAY] 吸血效率修正: x${drainMod}`);
            }
        }
        
        const maxHeal = user.maxHp - user.currHp;
        if (maxHeal > 0) {
            const actualHeal = (typeof user.heal === 'function') ? user.heal(baseHeal) : Math.min(baseHeal, maxHeal);
            if (actualHeal > 0) {
                logs.push(`${user.cnName} 吸取了对手的体力!`);
                if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('HEAL');
                if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                    const _isUserPlayer = window.battle && window.battle.playerParty && window.battle.playerParty.includes(user);
                    window.BattleVFX.triggerStatVFX('HEAL', _isUserPlayer ? 'player-sprite' : 'enemy-sprite');
                }
            }
        }
    } else if (damageDealt > 0) {
        const drainPatches = (typeof DRAIN_MOVES !== 'undefined') ? DRAIN_MOVES : {};
        if (drainPatches[move.name]) {
            const [num, den] = drainPatches[move.name];
            let baseHeal = Math.max(1, Math.floor(damageDealt * num / den));
            
            // 【环境图层系统】吸血效率修正
            if (typeof window !== 'undefined' && window.envOverlay && typeof window.envOverlay.getDrainMod === 'function') {
                const drainMod = window.envOverlay.getDrainMod(user, move);
                if (drainMod !== 1) {
                    baseHeal = Math.floor(baseHeal * drainMod);
                }
            }
            
            const maxHeal = user.maxHp - user.currHp;
            if (maxHeal > 0) {
                const actualHeal = (typeof user.heal === 'function') ? user.heal(baseHeal) : Math.min(baseHeal, maxHeal);
                if (actualHeal > 0) {
                    logs.push(`${user.cnName} 吸取了对手的体力!`);
                    if (typeof window !== 'undefined' && typeof window.playSFX === 'function') window.playSFX('HEAL');
                    if (typeof window !== 'undefined' && typeof window.BattleVFX !== 'undefined') {
                        const _isUserPlayer = window.battle && window.battle.playerParty && window.battle.playerParty.includes(user);
                        window.BattleVFX.triggerStatVFX('HEAL', _isUserPlayer ? 'player-sprite' : 'enemy-sprite');
                    }
                }
            }
        }
    }
    
    // ========== 3. 反伤 (Recoil) - 在吸血之后结算 ==========
    // 【Rock Head】只免疫招式反伤，不免疫 Life Orb
    const noRecoilAbility = (typeof AbilityHandlers !== 'undefined' && user.ability && AbilityHandlers[user.ability]) 
        ? AbilityHandlers[user.ability].noRecoil
        : false;
    // 【Magic Guard】免疫所有间接伤害（包括 Life Orb）
    const noIndirectDamage = (typeof AbilityHandlers !== 'undefined' && user.ability && AbilityHandlers[user.ability]) 
        ? AbilityHandlers[user.ability].noIndirectDamage
        : false;
    
    // 招式反伤：Rock Head 和 Magic Guard 都能免疫
    if (!noRecoilAbility && !noIndirectDamage) {
        if (fullMoveData.recoil && damageDealt > 0) {
            const [num, den] = fullMoveData.recoil;
            let recoilDmg = Math.max(1, Math.floor(damageDealt * num / den));
            
            // 【环境图层系统】反伤修正
            if (typeof window !== 'undefined' && window.envOverlay && typeof window.envOverlay.getRecoilMod === 'function') {
                const recoilMod = window.envOverlay.getRecoilMod(user, move);
                if (recoilMod !== 1) {
                    recoilDmg = Math.max(1, Math.floor(recoilDmg * recoilMod));
                    console.log(`[ENV OVERLAY] 反伤修正: x${recoilMod}`);
                }
            }
            
            user.takeDamage(recoilDmg);
            logs.push(`${user.cnName} 受到了 ${recoilDmg} 点反作用力伤害!`);
        } else if (damageDealt > 0) {
            const recoilPatches = (typeof RECOIL_MOVES !== 'undefined') ? RECOIL_MOVES : {};
            if (recoilPatches[move.name]) {
                const [num, den] = recoilPatches[move.name];
                const recoilDmg = Math.max(1, Math.floor(damageDealt * num / den));
                user.takeDamage(recoilDmg);
                logs.push(`${user.cnName} 受到了 ${recoilDmg} 点反作用力伤害!`);
            }
        }
    }
    
    // 生命宝珠反伤 - 独立于招式反伤结算
    // 【Magic Guard】免疫生命宝珠反伤
    // 【Sheer Force】激活时免疫生命宝珠反伤
    // 【Rock Head】不能免疫生命宝珠反伤！
    if (!noIndirectDamage) {
        const userItem = (user.item || '').toLowerCase().replace(/[^a-z]/g, '');
        if (userItem === 'lifeorb' && damageDealt > 0) {
            if (!sheerForceActive) {
                const lifeOrbRecoil = Math.max(1, Math.floor(user.maxHp * 0.1));
                user.takeDamage(lifeOrbRecoil);
                logs.push(`${user.cnName} 受到了生命宝珠的反噬!`);
            }
        }
    }
    
    // ========== 4. 特殊技能效果 ==========
    
    // 【环境图层系统】检查环境状态施加 (基于技能类型)
    // 注意：需要传入完整的技能数据（包含 type），用于 MoveType:X 规则匹配
    if (damageDealt > 0 && !target.status && typeof window !== 'undefined' && window.envOverlay && typeof window.envOverlay.tryInflictStatus === 'function') {
        const moveWithType = { ...move, type: move.type || fullMoveData.type || 'Normal' };
        const statusResult = window.envOverlay.tryInflictStatus(target, moveWithType);
        if (statusResult && statusResult.applied) {
            target.status = statusResult.status;
            target.statusTurns = 0;
            logs.push(`<span style="color:#e74c3c">${statusResult.log}</span>`);
            console.log(`[ENV OVERLAY] 环境状态施加: ${statusResult.status} (技能类型: ${moveWithType.type})`);
        }
    }
    
    // 【环境图层系统】检查环境反伤 (对攻击方造成概率反伤)
    if (damageDealt > 0 && user.isAlive() && typeof window !== 'undefined' && window.envOverlay && typeof window.envOverlay.tryApplyEnvRecoil === 'function') {
        const moveWithData = { ...move, type: move.type || fullMoveData.type || 'Normal', flags: move.flags || fullMoveData.flags || {} };
        const recoilResult = window.envOverlay.tryApplyEnvRecoil(user, moveWithData);
        if (recoilResult && recoilResult.applied) {
            user.takeDamage(recoilResult.damage);
            logs.push(`<span style="color:#a855f7">🌍 ${recoilResult.log}</span>`);
        }
    }
    
    // 寄生种子
    if (move.name === 'Leech Seed') {
        if (target.types && target.types.includes('Grass')) {
            logs.push(`对草系宝可梦没有效果!`);
        } else if (target.volatile && target.volatile.substitute && target.volatile.substitute > 0) {
            logs.push(`${target.cnName} 的替身挡住了寄生种子!`);
        } else {
            target.volatile = target.volatile || {};
            target.volatile['leechseed'] = true;
            logs.push(`寄生种子种在了 ${target.cnName} 身上!`);
        }
    }
    
    // 哈欠
    if (move.name === 'Yawn') {
        // 替身检查
        if (target.volatile && target.volatile.substitute && target.volatile.substitute > 0) {
            logs.push(`${target.cnName} 的替身挡住了哈欠!`);
        // 电气场地检查（接地目标不会被催眠）
        } else if (battle && battle.terrain === 'electricterrain') {
            const tAbility = (target.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const isGrounded = !(target.types && target.types.includes('Flying')) && tAbility !== 'levitate';
            if (isGrounded) {
                logs.push(`电气场地保护了 ${target.cnName}，哈欠无效!`);
            } else if (!target.status && !(target.volatile && target.volatile['yawn'])) {
                target.volatile = target.volatile || {};
                target.volatile['yawn'] = 2;
                logs.push(`${target.cnName} 打了个大大的哈欠...`);
            }
        } else if (!target.status && !(target.volatile && target.volatile['yawn'])) {
            target.volatile = target.volatile || {};
            target.volatile['yawn'] = 2;
            logs.push(`${target.cnName} 打了个大大的哈欠...`);
        }
    }
    
    // 诅咒 (鬼系) - 【已移至 move-handlers.js 统一处理，此处删除避免重复扣血】
    // if (move.name === 'Curse' && user.types.includes('Ghost')) { ... }
    
    // 束缚类技能
    if (fullMoveData.volatileStatus === 'partiallytrapped') {
        target.volatile = target.volatile || {};
        target.volatile['partiallytrapped'] = true;
        logs.push(`${target.cnName} 被困住了!`);
    }
    
    // ========== 5. 自我牺牲技能 ==========
    if (fullMoveData.selfdestruct) {
        const shouldFaint = fullMoveData.selfdestruct === 'always' || 
                           (fullMoveData.selfdestruct === 'ifHit' && damageDealt > 0);
        
        if (shouldFaint) {
            user.currHp = 0;
            logs.push(`${user.cnName} 倒下了!`);
            console.log(`[SELFDESTRUCT] ${user.cnName} used ${move.name} with selfdestruct: ${fullMoveData.selfdestruct}`);
        }
    }
    
    // ========== 6. 接触类招式反馈效果 ==========
    const isContact = fullMoveData.flags && fullMoveData.flags.contact;
    
    // 【BUG修复】优先使用 applyDamage 传递的实际段数，避免与伤害计算不一致
    let hitCount = move._actualHitCount || 1;
    if (hitCount === 1 && fullMoveData.multihit) {
        // 回退：如果没有传递实际段数（如变化技路径），才重新计算
        if (Array.isArray(fullMoveData.multihit)) {
            const [min, max] = fullMoveData.multihit;
            if (userAbilityId === 'skilllink') {
                hitCount = max;
            } else {
                hitCount = Math.floor(Math.random() * (max - min + 1)) + min;
            }
        } else {
            hitCount = fullMoveData.multihit;
        }
    }
    
    if (isContact && damageDealt > 0 && target.isAlive() && typeof AbilityHandlers !== 'undefined') {
        const defenderAbility = target.ability;
        const ah = defenderAbility ? AbilityHandlers[defenderAbility] : null;
        
        for (let hit = 0; hit < hitCount; hit++) {
            if (!user.isAlive() || !target.isAlive()) break;
            
            // 接触反伤特性
            if (ah && ah.onContactDamage && user.isAlive()) {
                const result = ah.onContactDamage(user, target);
                if (result && result.damage > 0) {
                    user.takeDamage(result.damage);
                    if (hit === 0) logs.push(result.message);
                }
            }
            
            // 接触状态特性
            if (ah && ah.onContactStatus && user.isAlive() && !user.status) {
                const result = ah.onContactStatus(user, target);
                if (result && result.status) {
                    const statusResult = (typeof MoveEffects !== 'undefined' && MoveEffects.tryInflictStatus) 
                        ? MoveEffects.tryInflictStatus(user, result.status)
                        : { success: true };
                    if (statusResult.success) {
                        user.status = result.status;
                        logs.push(result.message);
                    }
                }
            }
            
            // 凸凸头盔
            // 【道具统一】使用规范化 ID 比较
            const targetItemId = (target.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (targetItemId === 'rockyhelmet' && user.isAlive()) {
                const helmetDmg = Math.floor(user.maxHp / 6);
                user.takeDamage(helmetDmg);
                if (hit === 0) logs.push(`${user.cnName} 被凸凸头盔伤害了！`);
            }
        }
        
        if (!user.isAlive()) {
            logs.push(`${user.cnName} 被反伤击倒了！`);
        }
    }
    
    // ========== 7. 碎裂铠甲等被攻击触发特性 ==========
    if (damageDealt > 0 && target.isAlive() && typeof AbilityHandlers !== 'undefined') {
        const ah = target.ability ? AbilityHandlers[target.ability] : null;
        const moveCategory = fullMoveData.category || (move.cat === 'phys' ? 'Physical' : (move.cat === 'spec' ? 'Special' : 'Status'));
        const isPhysical = move.cat === 'phys' || moveCategory === 'Physical';
        
        if (ah && ah.onPhysicalHit && isPhysical) {
            ah.onPhysicalHit(user, target, logs);
        }
    }
    
    // ========== 8. onAfterMove 钩子 (招式执行后效果) ==========
    // 【Gigaton Hammer / Glaive Rush 等】招式执行后的副作用
    if (handler && handler.onAfterMove) {
        handler.onAfterMove(user, target, move, logs, battle);
    }
    
    // 【Gigaton Hammer】更新 lastMoveUsed（用于不能连发的判定）
    // 如果使用的不是巨力锤，清除之前的记录
    if (move.name !== 'Gigaton Hammer' && user.lastMoveUsed === 'Gigaton Hammer') {
        user.lastMoveUsed = null;
    }
    
    // 返回日志和 pivot/phaze/passBoosts 状态
    return { logs, pivot: pivotTriggered, phaze: phazeTriggered, passBoosts: passBoostsTriggered, revivalChoice: revivalChoiceTriggered };
}

// ============================================
// 导出到全局
// ============================================

if (typeof window !== 'undefined') {
    window.applyMoveSecondaryEffects = applyMoveSecondaryEffects;
}
