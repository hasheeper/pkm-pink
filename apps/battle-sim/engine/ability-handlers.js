/**
 * =============================================
 * ABILITY HANDLERS - 特性处理器
 * =============================================
 * 
 * 仅收录 Top 25 + 常见 RP 特性。
 * 使用 Hook 系统注入到 battle-engine.js 的各个环节。
 */

// 简单的辅助工具
export function isPinching(poke) {
    return poke.currHp > 0 && poke.currHp <= poke.maxHp / 3;
}

// ============================================
// 【软编码】招式 Flag 检查辅助函数
// 使用 PS moves-data.js 的 flags 替代硬编码招式列表
// ============================================

/**
 * 检查招式是否具有指定的 flag
 * @param {Object} move - 招式对象
 * @param {string} flag - flag 名称 (punch, bite, slicing, pulse, sound, powder, bullet, wind 等)
 * @returns {boolean} 是否具有该 flag
 */
export function moveHasFlag(move, flag) {
    if (!move) return false;
    
    // 优先使用招式对象自带的 flags
    if (move.flags && move.flags[flag]) return true;
    
    // 从 MOVES 数据库查找（move 对象通常不含 flags 字段）
    const moveId = (move.id || move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (typeof MOVES !== 'undefined' && MOVES[moveId]) {
        const moveData = MOVES[moveId];
        if (moveData && moveData.flags && moveData.flags[flag]) return true;
    }
    // 兼容 window.Moves 别名
    if (typeof window !== 'undefined' && window.Moves) {
        const moveData = window.Moves[moveId];
        if (moveData && moveData.flags && moveData.flags[flag]) return true;
    }
    
    return false;
}

export const AbilityHandlers = {
    // ============================================
    // A. 暴力数值修正
    // ============================================
  
    // 【大力士/瑜伽之力】物攻翻倍
    // 【钩子统一】onModifyStat: (stats, poke, battle)
    'Huge Power': { onModifyStat: (stats, poke, battle) => { stats.atk *= 2; } },
    'Pure Power': { onModifyStat: (stats, poke, battle) => { stats.atk *= 2; } },

    // 【技术高手】低威力(<=60)招式 x1.5
    // 【钩子统一】onBasePower: (power, attacker, defender, move, battle)
    'Technician': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (power <= 60) return power * 1.5;
            return power;
        }
    },

    // 【适应力】本系加成从 1.5 -> 2.0
    'Adaptability': {
        // 这一条比较特殊，我们通过修改 stab 倍率实现，需在 calcDamage 里特别判断
        onModifySTAB: (stab) => 2
    },

    // 【有色眼镜】效果不好(X0.5)时变为正常(X1)
    'Tinted Lens': {
        onModifyEffectiveness: (eff) => {
            if (eff < 1 && eff > 0) return eff * 2;
            return eff;
        }
    },

    // ============================================
    // B. 御三家专属 - 绝境爆发 (红血变身)
    // ============================================
    // 【钩子统一】onBasePower: (power, attacker, defender, move, battle)
    'Blaze': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (move.type === 'Fire' && isPinching(attacker)) return power * 1.5;
            return power;
        }
    },
    'Torrent': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (move.type === 'Water' && isPinching(attacker)) return power * 1.5;
            return power;
        }
    },
    'Overgrow': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (move.type === 'Grass' && isPinching(attacker)) return power * 1.5;
            return power;
        }
    },
    'Swarm': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (move.type === 'Bug' && isPinching(attacker)) return power * 1.5;
            return power;
        }
    },

    // ============================================
    // C. 特殊防御/开眼
    // ============================================

    // 【漂浮】免疫地面
    // 【钩子统一】onImmunity: (atkType, move)
    // 【BUG修复】千箭齐发(Thousand Arrows)无视漂浮的地面免疫
    'Levitate': {
        onImmunity: (atkType, move) => {
            if (atkType !== 'Ground') return false;
            const mid = (move?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (mid === 'thousandarrows') return false; // 千箭齐发穿透漂浮
            return true;
        },
        groundImmune: true
    },
    // 【引火】免疫火系+威力提升50%
    // 【钩子统一】onImmunity: (atkType, move)
    'Flash Fire': {
        onImmunity: (atkType, move) => atkType === 'Fire',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Fire') {
                pokemon.flashFireBoost = true;
                logs.push(`🔥 ${pokemon.cnName} 的引火特性发动！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        },
        // 【钩子统一】onBasePower: (power, attacker, defender, move, battle)
        onBasePower: (power, attacker, defender, move, battle) => {
            if (move.type === 'Fire' && attacker.flashFireBoost) return Math.floor(power * 1.5);
            return power;
        }
    },
    // 【蓄水】免疫水系+回复1/4HP
    // 【钩子统一】onImmunity: (atkType, move)
    'Water Absorb': {
        onImmunity: (atkType, move) => atkType === 'Water',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Water') {
                const baseHeal = Math.floor(pokemon.maxHp / 4);
                // 【Smog 化学屏障】使用统一治愈函数
                let actualHeal = baseHeal;
                if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                    actualHeal = window.WeatherEffects.applyHeal(pokemon, baseHeal, { source: 'Water Absorb' });
                } else {
                    pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + baseHeal);
                }
                logs.push(`💧 ${pokemon.cnName} 的蓄水回复了 ${actualHeal} HP！`);
                return { absorbed: true, heal: actualHeal };
            }
            return { absorbed: false };
        }
    },
    // 【避雷针】免疫电系+特攻+1
    // 【钩子统一】onImmunity: (atkType, move)
    'Lightning Rod': {
        onImmunity: (atkType, move) => atkType === 'Electric',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Electric') {
                if (pokemon.applyBoost) pokemon.applyBoost('spa', 1);
                logs.push(`⚡ ${pokemon.cnName} 的避雷针发动！特攻提升！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    },
    // 【蓄电】免疫电系+回复1/4HP
    // 【钩子统一】onImmunity: (atkType, move)
    'Volt Absorb': {
        onImmunity: (atkType, move) => atkType === 'Electric',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Electric') {
                const baseHeal = Math.floor(pokemon.maxHp / 4);
                let actualHeal = baseHeal;
                if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                    actualHeal = window.WeatherEffects.applyHeal(pokemon, baseHeal, { source: 'Volt Absorb' });
                } else {
                    pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + baseHeal);
                }
                logs.push(`⚡ ${pokemon.cnName} 的蓄电回复了 ${actualHeal} HP！`);
                return { absorbed: true, heal: actualHeal };
            }
            return { absorbed: false };
        }
    },
    // 【电气引擎】免疫电系+速度+1
    // 【钩子统一】onImmunity: (atkType, move)
    'Motor Drive': {
        onImmunity: (atkType, move) => atkType === 'Electric',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Electric') {
                if (pokemon.applyBoost) pokemon.applyBoost('spe', 1);
                logs.push(`⚡ ${pokemon.cnName} 的电气引擎发动！速度提升！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    },
    // 【食草】免疫草系+攻击+1
    // 【钩子统一】onImmunity: (atkType, move)
    'Sap Sipper': {
        onImmunity: (atkType, move) => atkType === 'Grass',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Grass') {
                if (pokemon.applyBoost) pokemon.applyBoost('atk', 1);
                logs.push(`🌿 ${pokemon.cnName} 的食草发动！攻击提升！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    },
    // 【引水】免疫水系+特攻+1
    // 【钩子统一】onImmunity: (atkType, move)
    'Storm Drain': {
        onImmunity: (atkType, move) => atkType === 'Water',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Water') {
                if (pokemon.applyBoost) pokemon.applyBoost('spa', 1);
                logs.push(`💧 ${pokemon.cnName} 的引水发动！特攻提升！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    },
    // 【干燥皮肤】免疫水系回复，火系x1.25
    // 【钩子统一】onImmunity: (atkType, move)
    'Dry Skin': {
        onImmunity: (atkType, move) => atkType === 'Water',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Water') {
                const baseHeal = Math.floor(pokemon.maxHp / 4);
                let actualHeal = baseHeal;
                if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                    actualHeal = window.WeatherEffects.applyHeal(pokemon, baseHeal, { source: 'Dry Skin' });
                } else {
                    pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + baseHeal);
                }
                logs.push(`💧 ${pokemon.cnName} 的干燥皮肤回复了 ${actualHeal} HP！`);
                return { absorbed: true, heal: actualHeal };
            }
            return { absorbed: false };
        },
        // 【修复】参数顺序：(damage, attacker, defender, move, effectiveness)
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            return move.type === 'Fire' ? Math.floor(damage * 1.25) : damage;
        }
    },
  
    // 【神奇鳞片】异常状态时防御 x1.5 (此处简化为物防)
    // 【钩子统一】onModifyStat: (stats, poke, battle)
    'Marvel Scale': {
        onModifyStat: (stats, poke, battle) => { 
            if (poke.status) stats.def = Math.floor(stats.def * 1.5); 
        }
    },
  
    // 【坚硬/结实】满血时至少保留1血
    'Sturdy': {
        onDamageHack: (damage, defender) => {
            if (defender.currHp === defender.maxHp && damage >= defender.currHp) {
                return defender.currHp - 1; // 锁血1
            }
            return damage;
        }
    },
  
    // 【神奇守护】鬼蝉：只能被效果绝佳的招式打中
    'Wonder Guard': {
        onTryHit: (attacker, defender, move, effectiveness) => {
            // 只有效果绝佳（>1）的招式才能命中
            if (effectiveness <= 1) {
                return { blocked: true, message: `${defender.cnName} 的神奇守护让攻击无效了！` };
            }
            return { blocked: false };
        },
        wonderGuard: true // 标记：需要在伤害计算时检查
    },

    // 【厚脂肪】减半火/冰伤害
    // 【钩子统一】onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness)
    'Thick Fat': {
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            if (move.type === 'Fire' || move.type === 'Ice') {
                return Math.floor(damage * 0.5);
            }
            return damage;
        }
    },

    // 【毛皮大衣】物防翻倍
    // 【钩子统一】onModifyStat: (stats, poke, battle)
    'Fur Coat': {
        onModifyStat: (stats, poke, battle) => { stats.def *= 2; }
    },

    // 【滤镜/坚硬岩石】克制伤害减少25%
    'Filter': {
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            if (effectiveness > 1) return Math.floor(damage * 0.75);
            return damage;
        }
    },
    'Solid Rock': {
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            if (effectiveness > 1) return Math.floor(damage * 0.75);
            return damage;
        }
    },

    // 【多重鳞片】满血时伤害减半
    // 【钩子统一】onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness)
    'Multiscale': {
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            if (defender.currHp === defender.maxHp) {
                return Math.floor(damage * 0.5);
            }
            return damage;
        }
    },
    // 【暗影盾牌】满血时伤害减半
    // 【钩子统一】onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness)
    'Shadow Shield': {
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            if (defender.currHp === defender.maxHp) {
                return Math.floor(damage * 0.5);
            }
            return damage;
        }
    },

    // ============================================
    // 接触类招式反馈特性 (Contact Move Reactions)
    // 注意：这些特性只在接触类招式命中时触发
    // ============================================

    // 【粗糙皮肤】接触时反伤1/8
    'Rough Skin': {
        onContactDamage: (attacker, defender) => {
            return { damage: Math.floor(attacker.maxHp / 8), message: `${attacker.cnName} 被粗糙皮肤伤害了！` };
        }
    },
    // 【铁刺】接触时反伤1/8
    'Iron Barbs': {
        onContactDamage: (attacker, defender) => {
            return { damage: Math.floor(attacker.maxHp / 8), message: `${attacker.cnName} 被铁刺伤害了！` };
        }
    },
    // 【静电】接触时30%麻痹
    'Static': {
        onContactStatus: (attacker, defender) => {
            if (Math.random() < 0.3) return { status: 'par', message: `${attacker.cnName} 被静电麻痹了！` };
            return null;
        }
    },
    // 【火焰身躯】接触时30%灼伤
    'Flame Body': {
        onContactStatus: (attacker, defender) => {
            if (Math.random() < 0.3) return { status: 'brn', message: `${attacker.cnName} 被火焰身躯灼伤了！` };
            return null;
        }
    },
    // 【毒刺】接触时30%中毒
    'Poison Point': {
        onContactStatus: (attacker, defender) => {
            if (Math.random() < 0.3) return { status: 'psn', message: `${attacker.cnName} 被毒刺毒到了！` };
            return null;
        }
    },
    // 【可爱迷人】接触时30%着迷
    'Cute Charm': {
        onContactVolatile: (attacker, defender) => {
            if (Math.random() < 0.3 && attacker.gender !== defender.gender) {
                return { volatile: 'attract', message: `${attacker.cnName} 被迷住了！` };
            }
            return null;
        }
    },
    // 【碎裂铠甲】被物理攻击时防御-1速度+2
    // 【BUG修复】已移至第2641行的 onDamageTaken 钩子实现（更完善，有物理招式类型检查）

    // ============================================
    // D. 入场效果 (Intimidate / Weather)
    // ============================================
  
    // 【威吓】
    // 【钩子统一】onStart: (self, enemy, logs, battle)
    'Intimidate': {
        onStart: (self, enemy, logs, battle) => {
            if (!enemy || !enemy.isAlive()) return;
            // 检查对方是否有防止下降的特性
            const safe = ['Clear Body', 'White Smoke', 'Full Metal Body', 'Inner Focus', 'Oblivious', 'Hyper Cutter', 'Scrappy', 'Own Tempo'];
            if (enemy.ability && safe.includes(enemy.ability)) {
                logs.push(`(对方的 ${enemy.ability} 免疫了威吓!)`);
                return;
            }
            if (typeof enemy.applyBoost === 'function') {
                enemy.applyBoost('atk', -1);
                logs.push(`${self.cnName} 的威吓让对手稍微退缩了! (攻击降低)`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_DOWN');
            }
        }
    },

    // 【始源天气列表】不可被普通天气特性覆盖
    // Delta Stream, Desolate Land, Primordial Sea
    
    // 【降雨】
    'Drizzle': {
        onStart: (self, enemy, logs, battle) => {
            if (battle && typeof window !== 'undefined' && window.WeatherEffects?.tryDeployWeather) {
                const result = window.WeatherEffects.tryDeployWeather(battle, 'rain', {
                    itemId: self.item,
                    weatherName: '降雨',
                    visualKey: 'rain'
                });
                result.logs.forEach(l => logs.push(l));
                if (!result.success) return;
            } else if (battle) {
                battle.weather = 'rain';
                battle.weatherTurns = 5;
            }
            logs.push(`🌧️ ${self.cnName} 带来了降雨!`);
        }
    },
    // 【日照】
    'Drought': {
        onStart: (self, enemy, logs, battle) => {
            if (battle && typeof window !== 'undefined' && window.WeatherEffects?.tryDeployWeather) {
                const result = window.WeatherEffects.tryDeployWeather(battle, 'sun', {
                    itemId: self.item,
                    weatherName: '日照',
                    visualKey: 'sun'
                });
                result.logs.forEach(l => logs.push(l));
                if (!result.success) return;
            } else if (battle) {
                battle.weather = 'sun';
                battle.weatherTurns = 5;
            }
            logs.push(`☀️ ${self.cnName} 让阳光变得强烈了!`);
        }
    },
    // 【扬沙】
    'Sand Stream': {
        onStart: (self, enemy, logs, battle) => {
            if (battle && typeof window !== 'undefined' && window.WeatherEffects?.tryDeployWeather) {
                const result = window.WeatherEffects.tryDeployWeather(battle, 'sandstorm', {
                    itemId: self.item,
                    weatherName: '沙暴',
                    visualKey: 'sand'
                });
                result.logs.forEach(l => logs.push(l));
                if (!result.success) return;
            } else if (battle) {
                battle.weather = 'sandstorm';
                battle.weatherTurns = 5;
            }
            logs.push(`🌪️ ${self.cnName} 扬起了沙暴!`);
        }
    },
    // 【降雪】
    'Snow Warning': {
        onStart: (self, enemy, logs, battle) => {
            if (battle && typeof window !== 'undefined' && window.WeatherEffects?.tryDeployWeather) {
                const result = window.WeatherEffects.tryDeployWeather(battle, 'snow', {
                    itemId: self.item,
                    weatherName: '降雪',
                    visualKey: 'snow'
                });
                result.logs.forEach(l => logs.push(l));
                if (!result.success) return;
            } else if (battle) {
                battle.weather = 'snow';
                battle.weatherTurns = 5;
            }
            logs.push(`❄️ ${self.cnName} 让天空开始下雪了!`);
        }
    },
    
    // 【绯红脉动 Orichalcum Pulse】故勒顿专属 - 进场开晴天，晴天下攻击x1.33
    'Orichalcum Pulse': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) {
                battle.weather = 'sun'; // 标准值: sun
                self.orichalcumActive = true;
            }
            logs.push(`☀️ ${self.cnName} 的绯红脉动发动了！阳光变得强烈了！`);
        },
        onModifyStat: (stats, poke, battle) => {
            // 晴天下攻击 x1.33
            if (battle && (battle.weather === 'sun' || battle.weather === 'harshsun')) {
                stats.atk = Math.floor(stats.atk * 1.3333);
            }
        }
    },
    
    // 【强子引擎 Hadron Engine】密勒顿专属 - 进场开电气场地，场地下特攻x1.33
    'Hadron Engine': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) {
                battle.terrain = 'electricterrain';
                self.hadronActive = true;
            }
            logs.push(`⚡ ${self.cnName} 的强子引擎发动了！电气在脚下涌动！`);
        },
        onModifyStat: (stats, poke, battle) => {
            // 电气场地下特攻 x1.33
            if (battle && battle.terrain === 'electricterrain') {
                stats.spa = Math.floor(stats.spa * 1.3333);
            }
        }
    },
    
    // 【终结之地 Desolate Land】原始固拉多专属 - 进场开大日照，水系技能无效
    'Desolate Land': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) {
                battle.weather = 'harshsun'; // 极端天气
                battle.weatherSource = self; // 标记天气来源
                // 更新天气视觉效果
                if (typeof window !== 'undefined' && window.setWeatherVisuals) {
                    window.setWeatherVisuals('harshsun');
                }
            }
            logs.push(`🔥 ${self.cnName} 的终结之地发动了！强烈的日照笼罩了战场！`);
        },
        onModifyStat: (stats, poke, battle) => {
            // 大日照下攻击无加成，但水系技能在 getWeatherModifier 中被阻止
        }
    },
    
    // 【始源之海 Primordial Sea】原始盖欧卡专属 - 进场开大雨，火系技能无效
    'Primordial Sea': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) {
                battle.weather = 'heavyrain'; // 极端天气
                battle.weatherSource = self;
                // 更新天气视觉效果
                if (typeof window !== 'undefined' && window.setWeatherVisuals) {
                    window.setWeatherVisuals('heavyrain');
                }
            }
            logs.push(`🌊 ${self.cnName} 的始源之海发动了！暴风雨席卷了战场！`);
        }
    },
    
    // 【德尔塔气流 Delta Stream】Mega裂空座专属 - 进场开乱流，飞行系弱点无效
    'Delta Stream': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) {
                battle.weather = 'deltastream';
                battle.weatherSource = self;
                // 更新天气视觉效果
                if (typeof window !== 'undefined' && window.setWeatherVisuals) {
                    window.setWeatherVisuals('deltastream');
                }
            }
            logs.push(`🌪️ ${self.cnName} 的德尔塔气流发动了！神秘的乱流保护着战场！`);
        }
    },
    
    // 【花之礼 Flower Gift】樱花儿专属 - 晴天下己方攻击和特防x1.5
    'Flower Gift': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && (battle.weather === 'sun' || battle.weather === 'harshsun')) {
                stats.atk = Math.floor(stats.atk * 1.5);
                stats.spd = Math.floor(stats.spd * 1.5);
            }
        }
    },

    // 【电气制造者】
    'Electric Surge': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.terrain = 'electricterrain';
            logs.push(`⚡ ${self.cnName} 脚下电流涌动!`);
        }
    },
    // 【精神制造者】
    'Psychic Surge': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.terrain = 'psychicterrain';
            logs.push(`🔮 ${self.cnName} 脚下奇妙的感觉蔓延开来!`);
        }
    },
    // 【青草制造者】
    'Grassy Surge': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.terrain = 'grassyterrain';
            logs.push(`🌿 ${self.cnName} 脚下青草茂盛!`);
        }
    },
    // 【薄雾制造者】
    'Misty Surge': {
        onStart: (self, enemy, logs, battle) => {
            if (battle) battle.terrain = 'mistyterrain';
            logs.push(`🌫️ ${self.cnName} 脚下薄雾弥漫!`);
        }
    },

    // ============================================
    // E. 机制怪
    // ============================================

    // 【变幻自如 / 利贝罗】
    'Protean': {
        onBeforeMove: (user, move, logs) => {
            if (move.type && move.type !== 'Normal' && !user.types.includes(move.type)) {
                if (user.types[0] !== move.type) { 
                    user.types = [move.type];
                    logs.push(`[变幻自如] ${user.cnName} 变成了 ${move.type} 属性!`);
                }
            }
        }
    },
    'Libero': {
        onBeforeMove: (user, move, logs) => {
            if (move.type && user.types[0] !== move.type) {
                user.types = [move.type];
                logs.push(`[利贝罗] ${user.cnName} 变成了 ${move.type} 属性!`);
            }
        }
    },

    // 【异兽提升】击杀后提升最高能力
    'Beast Boost': {
        onKill: (attacker, logs) => {
            // 找最高基础能力
            const stats = ['atk', 'def', 'spa', 'spd', 'spe'];
            let best = 'atk';
            let bestVal = attacker.atk || 0;
            for (const s of stats) {
                if (attacker[s] > bestVal) {
                    bestVal = attacker[s];
                    best = s;
                }
            }
            if (typeof attacker.applyBoost === 'function') {
                attacker.applyBoost(best, 1);
                logs.push(`${attacker.cnName} 的 ${best} 提升了! (异兽提升)`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        }
    },
    // 【自信过剩】击杀后攻击+1
    'Moxie': {
        onKill: (attacker, logs) => {
            if (typeof attacker.applyBoost === 'function') {
                attacker.applyBoost('atk', 1);
                logs.push(`${attacker.cnName} 的攻击提升了! (自信过剩)`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        }
    },

    // ============================================
    // 悖谬种特性 (Paradox Pokémon Abilities)
    // ============================================
    
    // 【夸克充能】Quark Drive - 未来悖谬种
    // 电气场地或携带驱劲能量时，提升最高能力 30%（速度为 50%）
    // 【Chronal Rift】时空裂隙中自动激活
    'Quark Drive': {
        onStart: (self, enemy, logs, battle) => {
            // 检查是否有电气场地
            const hasElectricTerrain = battle && battle.field && battle.field.terrain === 'electricterrain';
            // 检查是否携带驱劲能量
            // 【道具统一】使用规范化 ID 比较
            const selfItemId = (self.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const hasBoosterEnergy = selfItemId === 'boosterenergy';
            
            // 【Chronal Rift 古今悖论】时空裂隙中自动激活
            let chronalRiftActivate = false;
            if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.checkParadoxResonance) {
                const weather = battle?.weather || battle?.environmentWeather || '';
                const resonance = window.WeatherEffects.checkParadoxResonance(weather, self);
                if (resonance.shouldActivate) {
                    chronalRiftActivate = true;
                    logs.push(resonance.message);
                }
            }
            
            if (hasElectricTerrain || hasBoosterEnergy || chronalRiftActivate) {
                // 找最高能力
                const stats = { atk: self.atk, def: self.def, spa: self.spa, spd: self.spd, spe: self.spe };
                let bestStat = 'atk';
                let bestValue = 0;
                for (const [stat, val] of Object.entries(stats)) {
                    if (val > bestValue) {
                        bestValue = val;
                        bestStat = stat;
                    }
                }
                
                // 标记激活状态
                self.quarkDriveActive = true;
                self.quarkDriveStat = bestStat;
                
                // 消耗驱劲能量（如果是通过道具激活，且不是时空裂隙供能）
                // 【Chronal Rift】时空裂隙中由环境供能，不消耗道具
                if (hasBoosterEnergy && !hasElectricTerrain && !chronalRiftActivate) {
                    self.item = null;
                    logs.push(`${self.cnName} 消耗了驱劲能量！`);
                }
                
                const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
                logs.push(`<b style="color:#f1c40f">⚡ ${self.cnName} 的夸克充能启动了！${statNames[bestStat]}提升！</b>`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        },
        // 【钩子统一】onModifyStat: (stats, poke, battle)
        onModifyStat: (stats, poke, battle) => {
            if (poke.quarkDriveActive && poke.quarkDriveStat) {
                const stat = poke.quarkDriveStat;
                const multiplier = (stat === 'spe') ? 1.5 : 1.3;
                stats[stat] = Math.floor(stats[stat] * multiplier);
            }
        }
    },
    
    // 【古代活性】Protosynthesis - 古代悖谬种
    // 大晴天或携带驱劲能量时，提升最高能力 30%（速度为 50%）
    // 【Chronal Rift】时空裂隙中自动激活
    'Protosynthesis': {
        onStart: (self, enemy, logs, battle) => {
            // 检查是否有大晴天
            // 【天气统一】兼容标准值和极端天气
            const hasSun = battle && (battle.weather === 'sun' || battle.weather === 'harshsun');
            // 检查是否携带驱劲能量
            // 【道具统一】使用规范化 ID 比较
            const selfItemId = (self.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const hasBoosterEnergy = selfItemId === 'boosterenergy';
            
            // 【Chronal Rift 古今悖论】时空裂隙中自动激活
            let chronalRiftActivate = false;
            if (typeof window.WeatherEffects !== 'undefined' && window.WeatherEffects.checkParadoxResonance) {
                const weather = battle?.weather || battle?.environmentWeather || '';
                const resonance = window.WeatherEffects.checkParadoxResonance(weather, self);
                if (resonance.shouldActivate) {
                    chronalRiftActivate = true;
                    logs.push(resonance.message);
                }
            }
            
            if (hasSun || hasBoosterEnergy || chronalRiftActivate) {
                // 找最高能力
                const stats = { atk: self.atk, def: self.def, spa: self.spa, spd: self.spd, spe: self.spe };
                let bestStat = 'atk';
                let bestValue = 0;
                for (const [stat, val] of Object.entries(stats)) {
                    if (val > bestValue) {
                        bestValue = val;
                        bestStat = stat;
                    }
                }
                
                // 标记激活状态
                self.protosynthesisActive = true;
                self.protosynthesisstat = bestStat;
                
                // 消耗驱劲能量（如果是通过道具激活，且不是时空裂隙供能）
                // 【Chronal Rift】时空裂隙中由环境供能，不消耗道具
                if (hasBoosterEnergy && !hasSun && !chronalRiftActivate) {
                    self.item = null;
                    logs.push(`${self.cnName} 消耗了驱劲能量！`);
                }
                
                const statNames = { atk: '攻击', def: '防御', spa: '特攻', spd: '特防', spe: '速度' };
                logs.push(`<b style="color:#e67e22">☀️ ${self.cnName} 的古代活性启动了！${statNames[bestStat]}提升！</b>`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        },
        // 【钩子统一】onModifyStat: (stats, poke, battle)
        onModifyStat: (stats, poke, battle) => {
            if (poke.protosynthesisActive && poke.protosynthesisstat) {
                const stat = poke.protosynthesisstat;
                const multiplier = (stat === 'spe') ? 1.5 : 1.3;
                stats[stat] = Math.floor(stats[stat] * multiplier);
            }
        }
    },

    // 【加速】回合结束速度+1
    'Speed Boost': {
        onEndTurn: (pokemon, logs) => {
            if (pokemon.boosts && pokemon.boosts.spe < 6) {
                if (typeof pokemon.applyBoost === 'function') {
                    pokemon.applyBoost('spe', 1);
                    logs.push(`${pokemon.cnName} 的速度提升了! (加速)`);
                    if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
                }
            }
        }
    },

    // 【慢启动】出场5回合内，攻击减半，速度减半 (雷吉奇卡斯专属)
    // 【钩子统一】onStart: (self, enemy, logs, battle)
    'Slow Start': {
        // 进场时初始化计数器
        onStart: (self, enemy, logs, battle) => {
            self.slowStartTurns = 0;
            self.isSlowStarting = true;
            logs.push(`<b style="color:#636e72">${self.cnName} 的慢启动！依然没能拿出真本事！</b>`);
        },
        // 实时修改面板数值
        // 【钩子统一】onModifyStat: (stats, poke, battle)
        onModifyStat: (stats, poke, battle) => {
            if (poke.isSlowStarting) {
                stats.atk = Math.floor(stats.atk * 0.5);
                stats.spe = Math.floor(stats.spe * 0.5);
            }
        },
        // 回合结束：计数器递增 + 解除封印判断
        onEndTurn: (pokemon, logs) => {
            if (pokemon.isSlowStarting) {
                pokemon.slowStartTurns = (pokemon.slowStartTurns || 0) + 1;
                if (pokemon.slowStartTurns >= 5) {
                    pokemon.isSlowStarting = false;
                    pokemon.slowStartTurns = 0;
                    logs.push(`<b style="color:#e91e63; font-size:1.1em">🔥 ${pokemon.cnName} 终于拿出了真本事！</b>`);
                    if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
                } else {
                    logs.push(`<span style="color:#aaa">${pokemon.cnName} 还没有拿出真本事... (${pokemon.slowStartTurns}/5)</span>`);
                }
            }
        }
    },

    // 【懒惰】每隔一回合才能行动 (请假王专属)
    // 【钩子统一】onStart: (self, enemy, logs, battle)
    'Truant': {
        onStart: (self, enemy, logs, battle) => {
            // 进场时重置状态，第一回合可以行动
            self.truantNextTurn = false;
        },
        // 行动前检查：如果是休息回合则跳过
        // 【钩子统一】onBeforeMove: (user, move, logs)
        onBeforeMove: (user, move, logs) => {
            // 注意：此处 user 就是 self
            const self = user;
            if (self.truantNextTurn) {
                logs.push(`<b style="color:#95a5a6">${self.cnName} 正在偷懒！</b>`);
                self.truantNextTurn = false; // 下回合可以行动
                return false; // 禁止行动
            } else {
                self.truantNextTurn = true; // 下回合休息
                return true; // 允许行动
            }
        }
    },

    // 【慢出】永远最后行动 (优先度 -6)
    // 【修复】参数顺序统一为：(priority, user, target, move)
    'Stall': {
        onModifyPriority: (priority, user, target, move) => {
            // 返回一个极低的优先度修正，确保最后行动
            return -6;
        }
    },
  
    // 【再生力】换下时回复1/3血
    'Regenerator': {
        onSwitchOut: (pokemon) => {
            if (pokemon.currHp < pokemon.maxHp && pokemon.currHp > 0) {
                const baseHeal = Math.floor(pokemon.maxHp / 3);
                // 【Smog 化学屏障】使用统一治愈函数
                if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                    window.WeatherEffects.applyHeal(pokemon, baseHeal, { source: 'Regenerator' });
                } else {
                    pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + baseHeal);
                }
            }
        }
    },

    // 【铁拳】拳头类招式威力x1.2
    // 【钩子统一】onBasePower: (power, attacker, defender, move, battle)
    // 【软编码】使用 PS moves-data.js 的 punch flag
    'Iron Fist': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (moveHasFlag(move, 'punch')) {
                return Math.floor(power * 1.2);
            }
            return power;
        }
    },

    // 【强壮之颚】咬类招式威力x1.5
    // 【钩子统一】onBasePower: (power, attacker, defender, move, battle)
    // 【软编码】使用 PS moves-data.js 的 bite flag
    'Strong Jaw': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (moveHasFlag(move, 'bite')) {
                return Math.floor(power * 1.5);
            }
            return power;
        }
    },

    // 【硬爪】接触类招式威力x1.3
    // 【钩子统一】onBasePower: (power, attacker, defender, move, battle)
    'Tough Claws': {
        onBasePower: (power, attacker, defender, move, battle) => {
            // 使用 contact flag 精确判定接触类招式
            if (moveHasFlag(move, 'contact')) {
                return Math.floor(power * 1.3);
            }
            return power;
        }
    },

    // 【蛮力】攻击后降低自身攻防
    // 【钩子统一】onBasePower: (power, attacker, defender, move, battle)
    'Sheer Force': {
        // 取消副作用但威力x1.3，这里简化处理
        onBasePower: (power, attacker, defender, move, battle) => {
            // 从 MOVES 数据库查找完整招式数据（move 对象可能不含 secondary 字段）
            const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const fullData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
            // 如果招式有副作用，威力x1.3
            if (fullData.secondary || fullData.secondaries || move.secondary || move.secondaries) {
                return Math.floor(power * 1.3);
            }
            return power;
        }
    },

    // 【沙之力】沙暴中岩/地/钢威力x1.3
    // 【天气统一】标准值: sandstorm
    'Sand Force': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (battle && battle.weather === 'sandstorm') {
                if (['Rock', 'Ground', 'Steel'].includes(move.type)) {
                    console.log(`[Sand Force] ✅ 沙之力发动！${move.name} 威力 ${power} -> ${Math.floor(power * 1.3)}`);
                    return Math.floor(power * 1.3);
                }
            }
            return power;
        }
    },

    // 【狙击手】暴击伤害x1.5
    'Sniper': {
        onCritDamage: (damage) => Math.floor(damage * 1.5)
    },

    // 【超幸运 Super Luck】所有招式暴击等级 +1
    // 代表：高傲雉鸡、阿勃梭鲁、乌鸦头头
    'Super Luck': {
        critStageBoost: 1
    },

    // 【不仁不义 Merciless】攻击中毒目标时必定暴击
    // 代表：超坏星
    'Merciless': {
        onCheckCrit: (attacker, defender) => {
            if (defender.status === 'psn' || defender.status === 'tox') {
                console.log(`[Merciless] ${attacker.cnName} 的不仁不义：攻击中毒目标必定暴击！`);
                return true; // 强制暴击
            }
            return null; // 正常判定
        }
    },

    // 【战斗盔甲 Battle Armor】不会被暴击
    // 代表：大钳蟹、巨钳蟹、盔甲鸟
    'Battle Armor': {
        preventCrit: true
    },

    // 【硬壳盔甲 Shell Armor】不会被暴击
    // 代表：大舌贝、刺甲贝、拉普拉斯
    'Shell Armor': {
        preventCrit: true
    },

    // ============================================
    // 核心攻击组件 (The Powerhouses)
    // ============================================

    // 【连续攻击 Skill Link】多段攻击固定为最大次数
    // 代表：刺甲贝、赫拉克罗斯、土龙节节
    'Skill Link': {
        onMoveHitCount: (move, user) => {
            // 如果招式有 multihit 属性，返回最大次数
            if (move.multihit) {
                if (Array.isArray(move.multihit)) {
                    return move.multihit[1]; // 返回最大值
                }
                return move.multihit; // 固定次数
            }
            return null; // 默认逻辑
        }
    },

    // 【穿透 Infiltrator】无视光墙/反射壁/替身
    // 代表：多龙巴鲁托、叉字蝠、直冲熊
    'Infiltrator': {
        ignoreScreens: true,      // 无视光墙/反射壁/极光幕
        ignoreSubstitute: true    // 无视替身
    },

    // 【天恩 Serene Grace】副作用概率翻倍
    // 代表：波克基斯、基拉祈、土龙节节
    'Serene Grace': {
        onModifySecondaryChance: (chance, move, user) => {
            // 副作用概率翻倍，上限100%
            return Math.min(100, chance * 2);
        }
    },

    // 【舍身 Reckless】反伤/撞飞类招式威力x1.2
    // 代表：姆克鹰、战舞郎
    'Reckless': {
        onBasePower: (power, attacker, defender, move, battle) => {
            // 从 MOVES 数据库查找完整招式数据（move 对象可能不含 recoil 字段）
            const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const fullData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
            if (fullData.recoil || fullData.hasCrashDamage || fullData.mindBlownRecoil ||
                move.recoil || move.hasCrashDamage || move.mindBlownRecoil) {
                return Math.floor(power * 1.2);
            }
            return power;
        }
    },

    // 【轻装 Unburden】失去道具后速度翻倍
    // 代表：摔角鹰人、随风球、蜥蜴王
    'Unburden': {
        onItemLost: (pokemon, item, logs) => {
            // 标记轻装激活
            pokemon.unburdenActive = true;
            logs.push(`<b style="color:#3498db">💨 ${pokemon.cnName} 的轻装特性发动！速度大幅提升！</b>`);
            if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
        },
        onModifyStat: (stats, poke, battle) => {
            if (poke.unburdenActive) {
                stats.spe = Math.floor(stats.spe * 2);
            }
        },
        // 【关键】获得道具后取消速度加成
        onItemGained: (pokemon, item, logs) => {
            if (pokemon.unburdenActive) {
                pokemon.unburdenActive = false;
                console.log(`[UNBURDEN] ${pokemon.cnName} 获得道具，轻装效果解除`);
            }
        }
    },
    
    // 【颊囊 Cheek Pouch】吃树果时额外回复 1/3 HP
    // 代表：掘掘兔、咬咬龟
    'Cheek Pouch': {
        onEatBerry: (pokemon, berry, logs) => {
            const baseHeal = Math.floor(pokemon.maxHp / 3);
            let actualHeal = baseHeal;
            // 【Smog 化学屏障】使用统一治愈函数
            if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                actualHeal = window.WeatherEffects.applyHeal(pokemon, baseHeal, { source: 'Cheek Pouch' });
            } else if (typeof pokemon.heal === 'function') {
                actualHeal = pokemon.heal(baseHeal);
            } else {
                pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + baseHeal);
            }
            logs.push(`<b style="color:#f39c12">🐹 ${pokemon.cnName} 的颊囊发动！额外回复了 ${actualHeal} HP！</b>`);
        }
    },
    
    // 【贪吃鬼 Gluttony】HP 50% 以下就吃原本 25% 才吃的树果
    // 代表：卡比兽、大舌舔
    'Gluttony': {
        berryThreshold: 0.5 // 将 25% 阈值提升到 50%
    },
    
    // 【紧张感 Unnerve】敌方无法食用树果
    // 代表：超梦、老班、暴鲤龙
    'Unnerve': {
        onStart: (self, enemy, logs, battle) => {
            logs.push(`<b style="color:#e74c3c">😨 ${self.cnName} 的紧张感让对手紧张起来了！</b>`);
            // 标记敌方无法吃树果
            if (enemy) enemy.cannotEatBerry = true;
        },
        // 全局效果：阻止敌方吃树果
        preventEnemyBerry: true
    },
    
    // 【察觉 Frisk】进场时显示对手道具
    'Frisk': {
        onStart: (self, enemy, logs, battle) => {
            if (enemy && enemy.item) {
                const itemData = (typeof window.getItem === 'function') ? window.getItem(enemy.item) : null;
                const itemName = itemData?.cnName || enemy.item;
                logs.push(`<b style="color:#9b59b6">👁️ ${self.cnName} 察觉到 ${enemy.cnName} 携带着 ${itemName}！</b>`);
            } else if (enemy) {
                logs.push(`<b style="color:#9b59b6">👁️ ${self.cnName} 察觉到 ${enemy.cnName} 没有携带道具。</b>`);
            }
        }
    },
    
    // 【反刍 Cud Chew】吃树果后下回合末再吃一次
    // 代表：奇麒麟、帕底亚肯泰罗
    'Cud Chew': {
        onEatBerry: (pokemon, berry, logs) => {
            // 记录吃的树果，下回合末再触发一次
            pokemon.cudChewBerry = berry;
            pokemon.cudChewReady = false; // 下回合末才触发
            console.log(`[CUD CHEW] ${pokemon.cnName} 记录了 ${berry}，下回合末再吃一次`);
        },
        onTurnEnd: (pokemon, logs) => {
            // 如果有记录的树果且已经过了一回合
            if (pokemon.cudChewBerry && pokemon.cudChewReady) {
                const berry = pokemon.cudChewBerry;
                logs.push(`<b style="color:#27ae60">🐄 ${pokemon.cnName} 的反刍特性发动！再次享用了 ${berry} 的效果！</b>`);
                // 触发树果效果（需要调用树果处理函数）
                if (typeof window.triggerBerryEffect === 'function') {
                    window.triggerBerryEffect(pokemon, berry, logs);
                }
                pokemon.cudChewBerry = null;
                pokemon.cudChewReady = false;
            } else if (pokemon.cudChewBerry && !pokemon.cudChewReady) {
                // 标记下回合可以触发
                pokemon.cudChewReady = true;
            }
        }
    },
    
    // 【笨拙 Klutz】携带物无效（不加成、不吃、不投掷）
    // 代表：布卢皇、顽皮熊猫
    'Klutz': {
        // 标记：道具效果无效
        itemDisabled: true,
        // 注意：火珠/毒珠也不会生效
        preventItemEffect: true
    },
    
    // 【魔术师 Magician】攻击造成伤害后偷取对手道具
    // 代表：妖精系
    'Magician': {
        onAfterDamage: (attacker, defender, damage, move, logs) => {
            if (damage > 0 && !attacker.item && defender.item) {
                // 检查是否可以偷取
                const defenderAbilityId = (defender.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                if (defenderAbilityId === 'stickyhold') {
                    logs.push(`<span style="color:#9b59b6">${defender.cnName} 的黏着特性阻止了道具被偷！</span>`);
                    return;
                }
                // 检查不可交换道具
                if (typeof window.isSwappable === 'function' && !window.isSwappable(defender.item)) {
                    return;
                }
                const stolenItem = defender.item;
                attacker.item = stolenItem;
                defender.item = null;
                const itemData = (typeof window.getItem === 'function') ? window.getItem(stolenItem) : null;
                const itemName = itemData?.cnName || stolenItem;
                logs.push(`<b style="color:#9b59b6">🎩 ${attacker.cnName} 的魔术师偷走了 ${defender.cnName} 的 ${itemName}！</b>`);
            }
        }
    },
    
    // 【顺手牵羊 Pickpocket】被接触攻击后偷取对手道具
    // 代表：狡猾天狗、扒手猫
    'Pickpocket': {
        onDamageTaken: (pokemon, damage, source, logs, move) => {
            if (!move) return;
            const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
            const isContact = fullMoveData.flags && fullMoveData.flags.contact;
            
            if (damage > 0 && isContact && !pokemon.item && source && source.item) {
                // 检查黏着特性
                const sourceAbilityId = (source.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                if (sourceAbilityId === 'stickyhold') {
                    logs.push(`<span style="color:#9b59b6">${source.cnName} 的黏着特性阻止了道具被偷！</span>`);
                    return;
                }
                // 检查不可交换道具
                if (typeof window.isSwappable === 'function' && !window.isSwappable(source.item)) {
                    return;
                }
                const stolenItem = source.item;
                pokemon.item = stolenItem;
                source.item = null;
                const itemData = (typeof window.getItem === 'function') ? window.getItem(stolenItem) : null;
                const itemName = itemData?.cnName || stolenItem;
                logs.push(`<b style="color:#9b59b6">🤏 ${pokemon.cnName} 的顺手牵羊偷走了 ${source.cnName} 的 ${itemName}！</b>`);
            }
        }
    },
    
    // 【黏着 Sticky Hold】道具无法被偷取或打落
    // 代表：臭泥、黏美儿
    'Sticky Hold': {
        preventItemLoss: true
    },

    // ============================================
    // 即时信息读取类 (Surveillance & Reaction)
    // ============================================

    // 【复制 Trace】入场时复制对手特性
    // 代表：沙奈朵、多边兽2
    // 黑名单：部分特性禁止复制
    'Trace': {
        onStart: (self, enemy, logs, battle) => {
            if (!enemy || !enemy.ability) return;
            
            // 禁止复制的特性黑名单
            const blacklist = [
                'Trace', 'Illusion', 'Imposter', 'Flower Gift', 'Forecast', 'Hunger Switch',
                'Power of Alchemy', 'Receiver', 'Schooling', 'Stance Change', 'Wonder Guard',
                'Zen Mode', 'Battle Bond', 'Comatose', 'Disguise', 'Multitype', 'RKS System',
                'Shields Down', 'Power Construct', 'Ice Face', 'Gulp Missile', 'As One',
                'Neutralizing Gas', 'Commander', 'Zero to Hero'
            ];
            
            if (blacklist.includes(enemy.ability)) {
                logs.push(`${self.cnName} 无法复制 ${enemy.ability}！`);
                return;
            }
            
            const oldAbility = self.ability;
            self.ability = enemy.ability;
            self.tracedAbility = enemy.ability; // 标记已复制
            logs.push(`<b style="color:#9b59b6">🔮 ${self.cnName} 复制了 ${enemy.cnName} 的 ${enemy.ability}！</b>`);
            
            // 触发新特性的 onStart（如果有）
            const handler = AbilityHandlers[enemy.ability];
            if (handler && handler.onStart) {
                handler.onStart(self, enemy, logs, battle);
            }
        }
    },

    // 【下载 Download】入场时根据对手防御/特防提升攻击/特攻
    // 代表：多边兽Z、盖诺赛克特
    'Download': {
        onStart: (self, enemy, logs, battle) => {
            if (!enemy) return;
            
            // 获取对手的防御和特防
            const enemyDef = enemy.def || enemy.storedStats?.def || 100;
            const enemySpd = enemy.spd || enemy.storedStats?.spd || 100;
            
            if (enemyDef < enemySpd) {
                // 对手物耐脆，提升物攻
                if (typeof self.applyBoost === 'function') {
                    self.applyBoost('atk', 1);
                }
                logs.push(`<b style="color:#e74c3c">📥 ${self.cnName} 的下载特性发动！攻击提升！</b>`);
            } else {
                // 对手特耐脆，提升特攻
                if (typeof self.applyBoost === 'function') {
                    self.applyBoost('spa', 1);
                }
                logs.push(`<b style="color:#3498db">📥 ${self.cnName} 的下载特性发动！特攻提升！</b>`);
            }
            if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
        }
    },

    // ============================================
    // 受队与回复 (Stall & Protection)
    // ============================================

    // 【自然回复 Natural Cure】换下时治愈异常状态
    // 代表：吉利蛋/幸福蛋、宝石海星、罗丝雷朵
    'Natural Cure': {
        onSwitchOut: (pokemon) => {
            if (pokemon.status) {
                const oldStatus = pokemon.status;
                pokemon.status = null;
                pokemon.statusTurns = 0;
                pokemon.sleepTurns = 0;
                console.log(`[NATURAL CURE] ${pokemon.name} 的异常状态 ${oldStatus} 被治愈了`);
            }
        }
    },

    // ============================================
    // 极高难度机制 (Complexity Nightmare)
    // ============================================

    // 【变身者 Imposter】入场时自动变身为对手
    // 代表：百变怪
    // 复制：能力值、能力阶级、招式（PP=5）、属性
    // 保留：HP、道具、特性本身
    'Imposter': {
        onStart: (self, enemy, logs, battle) => {
            if (!enemy || !enemy.isAlive()) return;
            
            // 检查对手是否有替身（替身阻止变身）
            if (enemy.substitute && enemy.substitute > 0) {
                logs.push(`${self.cnName} 无法变身！对手有替身保护！`);
                return;
            }
            
            // 检查对手是否也是变身者或已变身
            if (enemy.transformed || enemy.ability === 'Imposter') {
                logs.push(`${self.cnName} 无法变身！`);
                return;
            }
            
            // 保存原始数据
            self.originalData = {
                name: self.name,
                cnName: self.cnName,
                types: [...self.types],
                atk: self.atk,
                def: self.def,
                spa: self.spa,
                spd: self.spd,
                spe: self.spe,
                moves: self.moves ? [...self.moves] : [],
                ability: self.ability
            };
            
            // 复制对手数据
            self.transformed = true;
            self.transformedInto = enemy.name;
            
            // 复制能力值（HP 保持不变）
            self.atk = enemy.atk;
            self.def = enemy.def;
            self.spa = enemy.spa;
            self.spd = enemy.spd;
            self.spe = enemy.spe;
            
            // 复制属性
            self.types = enemy.types ? [...enemy.types] : ['Normal'];
            
            // 复制能力阶级
            if (enemy.boosts) {
                self.boosts = { ...enemy.boosts };
            }
            
            // 复制招式（PP 固定为 5）
            if (enemy.moves && enemy.moves.length > 0) {
                self.moves = enemy.moves.map(move => ({
                    ...move,
                    pp: 5,
                    maxPp: 5
                }));
            }
            
            // 显示名称变化（用于 UI）
            self.displayName = enemy.name;
            self.displayCnName = enemy.cnName;
            
            // 复制精灵图 URL（用于 UI 显示）
            if (enemy.spriteUrl) {
                self.displaySpriteUrl = enemy.spriteUrl;
            }
            // 生成精灵图 URL
            const enemyId = enemy.name.toLowerCase().replace(/[^a-z0-9-]/g, '');
            self.displaySpriteId = enemyId;
            
            logs.push(`<b style="color:#e91e63">🎭 ${self.originalData.cnName} 变身成了 ${enemy.cnName}！</b>`);
            
            // 触发精灵图更新
            if (typeof window.updateBattleSprites === 'function') {
                window.updateBattleSprites();
            }
        },
        // 换下时恢复原形
        onSwitchOut: (pokemon) => {
            if (pokemon.transformed && pokemon.originalData) {
                pokemon.name = pokemon.originalData.name;
                pokemon.cnName = pokemon.originalData.cnName;
                pokemon.types = pokemon.originalData.types;
                pokemon.atk = pokemon.originalData.atk;
                pokemon.def = pokemon.originalData.def;
                pokemon.spa = pokemon.originalData.spa;
                pokemon.spd = pokemon.originalData.spd;
                pokemon.spe = pokemon.originalData.spe;
                pokemon.moves = pokemon.originalData.moves;
                pokemon.transformed = false;
                pokemon.transformedInto = null;
                pokemon.displayName = null;
                pokemon.displayCnName = null;
                pokemon.displaySpriteUrl = null;
                pokemon.displaySpriteId = null;
                delete pokemon.originalData;
                console.log(`[IMPOSTER] ${pokemon.name} 恢复了原形`);
            }
        }
    },

    // 【幻觉 Illusion】伪装成队伍最后一只存活的宝可梦
    // 代表：索罗亚克
    // 只改变外观（名称、精灵图），不改变实际数据
    // 受到直接伤害时幻觉破解
    'Illusion': {
        // 入场时设置幻觉
        onStart: (self, enemy, logs, battle) => {
            if (self.illusionActive) return;

            // 获取队伍
            const party = battle?.playerParty?.includes(self) 
                ? battle.playerParty 
                : battle?.enemyParty;
            
            if (!party || party.length <= 1) return;
            
            // 找到队伍最后一只存活且不是自己的宝可梦
            let disguiseTarget = null;
            for (let i = party.length - 1; i >= 0; i--) {
                const pm = party[i];
                if (pm !== self && pm.currHp > 0) {
                    disguiseTarget = pm;
                    break;
                }
            }
            
            if (!disguiseTarget) return;
            
            // 设置幻觉
            self.illusionActive = true;
            self.illusionTarget = {
                name: disguiseTarget.name,
                cnName: disguiseTarget.cnName,
                types: disguiseTarget.types ? [...disguiseTarget.types] : null,
                ability: disguiseTarget.ability || null,
                moves: disguiseTarget.moves ? disguiseTarget.moves.map(m => ({ ...m })) : null,
                atk: disguiseTarget.atk,
                def: disguiseTarget.def,
                spa: disguiseTarget.spa,
                spd: disguiseTarget.spd,
                spe: disguiseTarget.spe,
                baseStats: disguiseTarget.baseStats ? { ...disguiseTarget.baseStats } : null
            };
            
            // 显示用的伪装名称
            self.displayName = disguiseTarget.name;
            self.displayCnName = disguiseTarget.cnName;
            
            // 复制精灵图 URL（用于 UI 显示）
            const targetId = disguiseTarget.name.toLowerCase().replace(/[^a-z0-9-]/g, '');
            self.displaySpriteId = targetId;
            if (disguiseTarget.spriteUrl) {
                self.displaySpriteUrl = disguiseTarget.spriteUrl;
            }
            
            console.log(`[ILLUSION] ${self.name} 伪装成了 ${disguiseTarget.name}`);
        },
        // 受到伤害时幻觉破解
        onDamageTaken: (pokemon, damage, source, logs) => {
            if (pokemon.illusionActive && damage > 0) {
                pokemon.illusionActive = false;
                const realName = pokemon.cnName;
                const fakeName = pokemon.illusionTarget?.cnName || '???';
                pokemon.displayName = null;
                pokemon.displayCnName = null;
                pokemon.displaySpriteUrl = null;
                pokemon.displaySpriteId = null;
                pokemon.illusionTarget = null;
                
                logs.push(`<b style="color:#8b5cf6">👻 幻觉破解！${fakeName} 的真身是 ${realName}！</b>`);
                
                // 触发精灵图更新
                if (typeof window.updateBattleSprites === 'function') {
                    window.updateBattleSprites();
                }
            }
        },
        // 换下时不公开真身，但必须清理伪装状态，避免后备宝可梦继续污染日志/AI感知。
        onSwitchOut: (pokemon) => {
            if (!pokemon.illusionActive) return;
            pokemon.illusionActive = false;
            pokemon.displayName = null;
            pokemon.displayCnName = null;
            pokemon.displaySpriteUrl = null;
            pokemon.displaySpriteId = null;
            pokemon.illusionTarget = null;
            console.log(`[ILLUSION] ${pokemon.name} 换下，幻觉状态重置`);
        }
    },

    // 【清除之躯】免疫能力下降
    // 【钩子统一】onTryBoost: (boost, pokemon, source, stat, logs)
    'Clear Body': {
        onTryBoost: (boost, pokemon, source, stat, logs) => {
            // 阻止负面能力变化
            if (boost < 0 && source !== pokemon) return 0;
            return boost;
        }
    },
    'White Smoke': {
        onTryBoost: (boost, pokemon, source, stat, logs) => {
            if (boost < 0 && source !== pokemon) return 0;
            return boost;
        }
    },
    'Full Metal Body': {
        onTryBoost: (boost, pokemon, source, stat, logs) => {
            if (boost < 0 && source !== pokemon) return 0;
            return boost;
        }
    },

    // ============================================
    // F. 第二梯队补充 - 招式大师类
    // ============================================

    // 【锋锐】切割类招式威力x1.5
    // 【钩子统一】onBasePower: (power, attacker, defender, move, battle)
    // 【软编码】使用 PS moves-data.js 的 slicing flag
    'Sharpness': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (moveHasFlag(move, 'slicing')) {
                return Math.floor(power * 1.5);
            }
            return power;
        }
    },

    // 【超级发射器】波导/波动类招式威力x1.5
    // 【钩子统一】onBasePower: (power, attacker, defender, move, battle)
    // 【软编码】使用 PS moves-data.js 的 pulse flag
    'Mega Launcher': {
        onBasePower: (power, attacker, defender, move, battle) => {
            if (moveHasFlag(move, 'pulse')) {
                return Math.floor(power * 1.5);
            }
            return power;
        }
    },

    // ============================================
    // G. 第二梯队补充 - 抗性/状态类
    // ============================================

    // 【隔音】免疫声音招式
    // 【软编码】使用 PS moves-data.js 的 sound flag
    'Soundproof': {
        onImmunity: (atkType, move) => {
            return moveHasFlag(move, 'sound');
        }
    },

    // 【毅力】异常状态下物攻x1.5
    // 【钩子统一】onModifyStat: (stats, poke, battle)
    'Guts': {
        onModifyStat: (stats, poke, battle) => { 
            if (poke.status) stats.atk = Math.floor(stats.atk * 1.5); 
        }
    },

    // ============================================
    // 声音系特性 (Sound-based Abilities)
    // ============================================
    
    // 【湿润之声】声音招式变为水属性
    // 【软编码】使用 PS moves-data.js 的 sound flag
    'Liquid Voice': {
        onModifyMove: (move, attacker) => {
            if (moveHasFlag(move, 'sound')) {
                move.type = 'Water';
            }
        }
    },
    
    // 【湿润之声 Pro】声音招式变为水属性 + 威力x1.3 (RPG 魔改版)
    // 【软编码】使用 PS moves-data.js 的 sound flag
    // 【修复】使用 _liquidVoiceApplied 标记防止威力累积
    'Liquid Voice Pro': {
        onModifyMove: (move, attacker) => {
            if (moveHasFlag(move, 'sound')) {
                move.type = 'Water';
                // 【关键修复】只在首次应用时修改威力，防止累积
                if (!move._liquidVoiceApplied) {
                    const originalPower = move._originalBasePower || move.basePower || move.power || 0;
                    move._originalBasePower = originalPower; // 保存原始威力
                    move.basePower = Math.floor(originalPower * 1.3);
                    move.power = move.basePower;
                    move._liquidVoiceApplied = true;
                }
            }
        }
    },

    // 【软弱】半血以下攻击/特攻减半
    // 【钩子统一】onModifyStat: (stats, poke, battle)
    'Defeatist': {
        onModifyStat: (stats, poke, battle) => {
            if (poke.currHp <= poke.maxHp / 2) {
                stats.atk = Math.floor(stats.atk * 0.5);
                stats.spa = Math.floor(stats.spa * 0.5);
            }
        }
    },

    // ============================================
    // H. 第二梯队补充 - 天气加速类
    // ============================================

    // 【叶绿素】晴天速度翻倍
    // 【天气统一】兼容 sun 和 harshsun
    'Chlorophyll': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && (battle.weather === 'sun' || battle.weather === 'harshsun')) {
                stats.spe *= 2;
            }
        }
    },

    // 【悠游自如】雨天速度翻倍
    // 【天气统一】兼容 rain 和 heavyrain
    'Swift Swim': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && (battle.weather === 'rain' || battle.weather === 'heavyrain')) {
                stats.spe *= 2;
            }
        }
    },

    // 【拨沙】沙暴速度翻倍
    // 【天气统一】标准值: sandstorm
    'Sand Rush': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && battle.weather === 'sandstorm') {
                stats.spe *= 2;
            }
        }
    },

    // 【拨雪】雪天速度翻倍
    // 【天气统一】兼容 snow 和 hail
    'Slush Rush': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && (battle.weather === 'snow' || battle.weather === 'hail')) {
                stats.spe *= 2;
            }
        }
    },

    // 【太阳之力】晴天特攻x1.5
    // 【天气统一】兼容 sun 和 harshsun
    'Solar Power': {
        onModifyStat: (stats, poke, battle) => {
            if (battle && (battle.weather === 'sun' || battle.weather === 'harshsun')) {
                stats.spa = Math.floor(stats.spa * 1.5);
            }
        }
    },

    // ============================================
    // I. 第二梯队补充 - 吸收系
    // ============================================

    // 【食土】被地面打回血1/4HP（大王铜象）
    // 【钩子统一】onImmunity: (atkType, move)
    'Earth Eater': {
        onImmunity: (atkType, move) => atkType === 'Ground',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Ground') {
                const baseHeal = Math.floor(pokemon.maxHp / 4);
                let actualHeal = baseHeal;
                if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                    actualHeal = window.WeatherEffects.applyHeal(pokemon, baseHeal, { source: 'Earth Eater' });
                } else {
                    pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + baseHeal);
                }
                logs.push(`🌍 ${pokemon.cnName} 的食土回复了 ${actualHeal} HP！`);
                return { absorbed: true, heal: actualHeal };
            }
            return { absorbed: false };
        }
    },

    // 【焦香身躯】被火系打防御+2（麻花犬）
    // 【钩子统一】onImmunity: (atkType, move)
    'Well-Baked Body': {
        onImmunity: (atkType, move) => atkType === 'Fire',
        onAbsorbHit: (pokemon, move, logs) => {
            if (move.type === 'Fire') {
                if (pokemon.applyBoost) pokemon.applyBoost('def', 2);
                logs.push(`🔥 ${pokemon.cnName} 的焦香身躯发动！防御大幅提升！`);
                return { absorbed: true };
            }
            return { absorbed: false };
        }
    },

    // 【湿气】禁止自爆/大爆炸
    'Damp': {
        preventExplosion: true
    },

    // ============================================
    // J. 第二梯队补充 - 免疫类
    // ============================================

    // 【石头脑袋】不受反伤
    'Rock Head': {
        noRecoil: true
    },

    // 【魔法防守】不受天气/状态伤害 (简化)
    'Magic Guard': {
        noIndirectDamage: true
    },

    // 【毒疗】中毒时回复HP而非受伤
    'Poison Heal': {
        onStatusDamage: (pokemon, status) => {
            if (status === 'psn' || status === 'tox') {
                // 回复 1/8 HP
                const baseHeal = Math.max(1, Math.floor(pokemon.maxHp / 8));
                let actualHeal = baseHeal;
                // 【Smog 化学屏障】使用统一治愈函数
                if (typeof window !== 'undefined' && window.WeatherEffects?.applyHeal) {
                    actualHeal = window.WeatherEffects.applyHeal(pokemon, baseHeal, { source: 'Poison Heal' });
                } else if (typeof pokemon.heal === 'function') {
                    actualHeal = pokemon.heal(baseHeal);
                } else {
                    pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + baseHeal);
                }
                return { 
                    blocked: true, 
                    healed: true,
                    message: `<span style="color:#4cd137">💚 ${pokemon.cnName} 的毒疗特性发动，回复了 ${actualHeal} 点体力!</span>`
                };
            }
            return { blocked: false };
        }
    },

    // 【毅力】异常状态时速度x1.5 (Quick Feet)
    // 【修复】参数顺序：(stats, poke, battle)
    'Quick Feet': {
        onModifyStat: (stats, poke, battle) => {
            if (poke.status) {
                stats.spe = Math.floor(stats.spe * 1.5);
            }
        }
    },

    // 注意：Marvel Scale 已在第 192 行定义，此处删除重复定义

    // 【不服输】被降能力时攻击+2
    'Defiant': {
        onAfterStatDrop: (pokemon, stat, stages, logs) => {
            if (typeof pokemon.applyBoost === 'function') {
                pokemon.applyBoost('atk', 2);
                logs.push(`${pokemon.cnName} 的攻击大幅提升了! (不服输)`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        }
    },

    // 【竞争心】被降能力时特攻+2
    'Competitive': {
        onAfterStatDrop: (pokemon, stat, stages, logs) => {
            if (typeof pokemon.applyBoost === 'function') {
                pokemon.applyBoost('spa', 2);
                logs.push(`${pokemon.cnName} 的特攻大幅提升了! (竞争心)`);
                if (typeof window.playSFX === 'function') window.playSFX('STAT_UP');
            }
        }
    },

    // 【精神力】免疫畏缩
    'Inner Focus': {
        noFlinch: true,
        preventFlinch: true // 兼容两种检查方式
    },

    // 【我行我素】免疫混乱
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Own Tempo': {
        noConfusion: true,
        onImmunityStatus: (status, pokemon, battle) => status === 'confusion' // 兼容状态免疫检查
    },

    // 【柔软】免疫麻痹
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Limber': {
        onImmunityStatus: (status, pokemon, battle) => status === 'par'
    },

    // 【免疫】免疫中毒
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Immunity': {
        onImmunityStatus: (status, pokemon, battle) => status === 'psn' || status === 'tox'
    },

    // 【水之面纱】免疫烧伤
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Water Veil': {
        onImmunityStatus: (status, pokemon, battle) => status === 'brn'
    },

    // 【熔岩铠甲】免疫冰冻
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Magma Armor': {
        onImmunityStatus: (status, pokemon, battle) => status === 'frz'
    },

    // 【不眠】免疫睡眠
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Insomnia': {
        onImmunityStatus: (status, pokemon, battle) => status === 'slp'
    },
    'Vital Spirit': {
        onImmunityStatus: (status, pokemon, battle) => status === 'slp'
    },
    
    // 【甘幕 Sweet Veil】己方全员免疫睡眠（包括队友）
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Sweet Veil': {
        onImmunityStatus: (status, pokemon, battle) => status === 'slp',
        // 标记：队友也免疫睡眠（双打用）
        teamSleepImmune: true
    },
    
    // 【早起 Early Bird】睡眠回合减半
    'Early Bird': {
        // 标记：睡眠回合消耗速度加倍
        earlyBird: true
    },
    
    // 【蜕皮 Shed Skin】每回合结束时30%概率治愈异常状态
    'Shed Skin': {
        onEndTurn: (pokemon, logs) => {
            if (pokemon.status && Math.random() < 0.3) {
                const oldStatus = pokemon.status;
                pokemon.status = null;
                pokemon.statusTurns = 0;
                pokemon.sleepTurns = 0;
                const statusNames = { par: '麻痹', brn: '灶伤', psn: '中毒', tox: '剧毒', slp: '睡眠', frz: '冰冻' };
                logs.push(`${pokemon.cnName} 的蜕皮治愈了${statusNames[oldStatus] || '异常状态'}！`);
            }
        }
    },
    
    // 【饱了又饿 Hunger Switch】莫鲁贝可专属，每回合结束时切换满腹/空腹形态
    'Hunger Switch': {
        onEndTurn: (pokemon, logs) => {
            // 获取当前形态 ID
            const currentId = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // 只对莫鲁贝可生效
            if (!currentId.includes('morpeko')) return;
            
            let targetFormId = '';
            let formName = '';
            
            // 判断当前形态，进行切换
            if (currentId === 'morpekohangry' || currentId.includes('hangry')) {
                targetFormId = 'morpeko';
                formName = '满腹花纹';
            } else {
                targetFormId = 'morpekohangry';
                formName = '空腹花纹';
            }
            
            // 调用形态变化系统
            if (typeof window.performFormChange === 'function') {
                const result = window.performFormChange(pokemon, targetFormId, 'hungerswitch');
                if (result && result.success) {
                    logs.push(`<span style="color:#f59e0b">🍽️ ${pokemon.cnName} 变成了${formName}！</span>`);
                    if (typeof window.updateAllVisuals === 'function') {
                        window.updateAllVisuals();
                    }
                }
            }
        }
    },
    
    // 【梦魇 Bad Dreams】对手睡眠时每回合扣除1/8HP（达克莱伊专属）
    'Bad Dreams': {
        onEndTurn: (pokemon, logs) => {
            // 梦魇是对对手生效，需要在回合结束时检查对手
            const battle = window.battle;
            if (!battle) return;
            
            // 确定对手
            const isPlayer = battle.playerParty && battle.playerParty.includes(pokemon);
            const opponent = isPlayer ? battle.getEnemy() : battle.getPlayer();
            
            // 检查对手是否睡眠（包括绝对睡眠 Comatose 特性）
            const opponentAbility = (opponent?.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            const isAsleep = opponent?.status === 'slp' || opponentAbility === 'comatose';
            
            if (opponent && opponent.isAlive() && isAsleep) {
                const damage = Math.max(1, Math.floor(opponent.maxHp / 8));
                opponent.takeDamage(damage);
                logs.push(`<span style="color:#8b5cf6">👻 ${opponent.cnName} 被 ${pokemon.cnName} 的梦魇侵蚀了 ${damage} HP！</span>`);
            }
        }
    },
    
    // 【孢子 Effect Spore】接触时有概率让对手中毒、麻痹或睡眠
    'Effect Spore': {
        onContactStatus: (attacker, defender) => {
            // 草系免疫孢子
            if (attacker.types && attacker.types.includes('Grass')) {
                return null;
            }
            // 防尘护目镜免疫
            const attackerItem = (attacker.item || '').toLowerCase().replace(/[^a-z]/g, '');
            if (attackerItem === 'safetygoggles') {
                return null;
            }
            // 防尘特性免疫
            const attackerAbility = (attacker.ability || '').toLowerCase().replace(/[^a-z]/g, '');
            if (attackerAbility === 'overcoat') {
                return null;
            }
            
            // 30%概率触发，平分三种状态
            if (Math.random() < 0.3) {
                const rand = Math.random();
                if (rand < 0.33) {
                    return { status: 'slp', message: `${attacker.cnName} 被孢子催眠了！` };
                } else if (rand < 0.66) {
                    return { status: 'par', message: `${attacker.cnName} 被孢子麻痹了！` };
                } else {
                    return { status: 'psn', message: `${attacker.cnName} 被孢子毒到了！` };
                }
            }
            return null;
        }
    },

    // 【粉彩护幕】免疫中毒（伽勒尔小火马/烈焰马）
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Pastel Veil': {
        onImmunityStatus: (status, pokemon, battle) => status === 'psn' || status === 'tox',
        // 【钩子统一】onStart: (self, enemy, logs, battle)
        onStart: (self, enemy, logs, battle) => {
            // 注意：此处 self 就是 pokemon
            const pokemon = self;
            // 入场时治愈己方中毒状态
            if (pokemon.status === 'psn' || pokemon.status === 'tox') {
                pokemon.status = null;
                logs.push(`${pokemon.cnName} 的粉彩护幕治愈了中毒状态!`);
            }
        }
    },

    // 【洁净之盐】免疫所有异常状态（盐石巨灵）
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Purifying Salt': {
        onImmunityStatus: (status, pokemon, battle) => true, // 免疫所有异常状态
        // 【修复】参数顺序：(damage, attacker, defender, move, effectiveness)
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            // 幽灵系招式伤害减半
            if (move.type === 'Ghost') {
                return Math.floor(damage * 0.5);
            }
            return damage;
        }
    },

    // 【绝对睡眠】视为睡眠状态（树枕尾熊）
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Comatose': {
        onImmunityStatus: (status, pokemon, battle) => true, // 无法被覆盖其他状态
        alwaysAsleep: true // 视为睡眠状态
    },

    // 【界限盾壳】HP > 50% 时免疫异常状态（小陨星）
    // 【钩子统一】onImmunityStatus: (status, pokemon, battle)
    'Shields Down': {
        onImmunityStatus: (status, pokemon, battle) => {
            return pokemon && pokemon.currHp > pokemon.maxHp / 2;
        }
    },

    // 【叶子防守】大晴天时免疫异常状态
    // 【天气统一】兼容 sun 和 harshsun
    'Leaf Guard': {
        onImmunityStatus: (status, pokemon, battle) => {
            const weather = battle?.weather || (typeof window.battle !== 'undefined' ? window.battle.weather : null);
            return weather === 'sun' || weather === 'harshsun';
        }
    },

    // 【腐蚀】可以让钢/毒系中毒（夜盗火蜥、焰后蜥）
    'Corrosion': {
        canPoisonAny: true // 标记：可以让任何属性中毒
    },

    // 【鳞粉/防尘】免疫粉尘类招式
    // 【软编码】使用 PS moves-data.js 的 powder flag
    'Overcoat': {
        onImmunity: (atkType, move) => {
            return moveHasFlag(move, 'powder');
        }
    },

    // 【防弹】免疫球类招式
    // 【软编码】使用 PS moves-data.js 的 bullet flag
    'Bulletproof': {
        onImmunity: (atkType, move) => {
            return moveHasFlag(move, 'bullet');
        }
    },

    // ============================================
    // K. 画皮 (Disguise) - Mimikyu 专属
    // ============================================

    // 【画皮】第一次受到攻击伤害时免疫，但自身损失 1/8 HP
    // 【钩子统一】onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness)
    'Disguise': {
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness) => {
            // 如果画皮已经破损，正常受伤
            if (defender.disguiseBroken) return damage;
            
            // 画皮完好时，免疫这次伤害
            if (damage > 0) {
                defender.disguiseBroken = true;
                // 画皮破损后自身损失 1/8 HP
                const bustDamage = Math.floor(defender.maxHp / 8);
                defender.disguiseBustDamage = bustDamage; // 标记需要扣血
                return 0; // 伤害变为 0
            }
            return damage;
        }
    },

    // ============================================
    // L. 抓人特性 (Trapping Abilities)
    // ============================================

    // 【踩影】对手无法换人（幽灵系除外，对方也是踩影则可逃）
    'Shadow Tag': {
        isTrapping: true,
        canTrap: (self, target) => {
            // 幽灵系免疫
            if (target.types && target.types.includes('Ghost')) return false;
            // 对方也是踩影则不困
            if (target.ability === 'Shadow Tag') return false;
            return true;
        }
    },

    // 【磁力】钢属性无法换人
    'Magnet Pull': {
        isTrapping: true,
        canTrap: (self, target) => {
            // 幽灵系免疫
            if (target.types && target.types.includes('Ghost')) return false;
            // 只困住钢系
            if (target.types && target.types.includes('Steel')) return true;
            return false;
        }
    },

    // 【沙穴】地面上的对手无法换人
    'Arena Trap': {
        isTrapping: true,
        canTrap: (self, target) => {
            // 幽灵系免疫
            if (target.types && target.types.includes('Ghost')) return false;
            // 飞行系免疫
            if (target.types && target.types.includes('Flying')) return false;
            // 漂浮特性免疫
            if (target.ability === 'Levitate') return false;
            // 气球道具免疫
            // 【道具统一】使用规范化 ID 比较
            const targetItemId = (target.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (targetItemId === 'airballoon') return false;
            return true;
        }
    },

    // ============================================
    // M. 恶作剧之心 (Prankster) - 优先度修正
    // ============================================

    // 【恶作剧之心】变化技优先度+1，但对恶系无效
    'Prankster': {
        onModifyPriority: (priority, user, target, move) => {
            // 只对变化技生效
            if (move.cat === 'status' || move.category === 'Status') {
                return priority + 1;
            }
            return priority;
        },
        // 恶系免疫恶作剧之心的变化技
        pranksterImmunity: true
    },

    // ============================================
    // N. 纯朴 (Unaware) - 忽略能力变化
    // ============================================

    // 【纯朴】攻击时忽略对手防御/特防提升，防御时忽略对手攻击/特攻提升
    'Unaware': {
        ignoreDefenderBoosts: true,  // 攻击时忽略对手防御提升
        ignoreAttackerBoosts: true   // 防御时忽略对手攻击提升
    },

    // ============================================
    // O. 其他重要特性补充
    // ============================================

    // 【魔法反射】反弹变化技
    'Magic Bounce': {
        reflectStatus: true
    },

    // 【破格】无视对手特性
    'Mold Breaker': {
        ignoreAbility: true
    },
    'Teravolt': {
        ignoreAbility: true
    },
    'Turboblaze': {
        ignoreAbility: true
    },

    // ============================================
    // P. 重要补充 - 先制免疫 & 黄金之躯
    // ============================================

    // 【鲜艳之躯】免疫先制攻击
    // 【钩子统一】onTryHit: (attacker, defender, move, effectiveness)
    'Dazzling': {
        onTryHit: (attacker, defender, move, effectiveness) => {
            if (move.priority && move.priority > 0) {
                return { blocked: true, message: `${defender.cnName} 的特性让先制攻击无效了！` };
            }
            return { blocked: false };
        }
    },

    // 【女王的威严】免疫先制攻击
    // 【钩子统一】onTryHit: (attacker, defender, move, effectiveness)
    'Queenly Majesty': {
        onTryHit: (attacker, defender, move, effectiveness) => {
            if (move.priority && move.priority > 0) {
                return { blocked: true, message: `${defender.cnName} 的威严让对手无法使出先制招式！` };
            }
            return { blocked: false };
        }
    },

    // 【尾甲】免疫先制攻击
    // 【钩子统一】onTryHit: (attacker, defender, move, effectiveness)
    'Armor Tail': {
        onTryHit: (attacker, defender, move, effectiveness) => {
            if (move.priority && move.priority > 0) {
                return { blocked: true, message: `${defender.cnName} 的铠甲之尾挡下了先制攻击！` };
            }
            return { blocked: false };
        }
    },

    // 【黄金之躯】免疫变化招式 (赛富豪专属)
    // 【钩子统一】onTryHit: (attacker, defender, move, effectiveness)
    'Good as Gold': {
        onTryHit: (attacker, defender, move, effectiveness) => {
            // 【修复】只阻止"以黄金之躯持有者为目标"的变化招式
            // 自身使用的变化招式（替身、剑舞等 target='self'）不应被阻止
            if (move.cat === 'status' || move.category === 'Status') {
                // 从 moves-data.js 读取招式目标类型
                const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const fullData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
                const moveTarget = move.target || fullData.target || 'normal';
                // 自我/队友目标的招式不受黄金之躯影响
                const selfTargets = ['self', 'allySide', 'adjacentAllyOrSelf', 'allyTeam', 'allies', 'adjacentAlly'];
                if (selfTargets.includes(moveTarget)) {
                    return { blocked: false };
                }
                return { blocked: true, message: `${defender.cnName} 的黄金之躯免疫了变化招式！` };
            }
            return { blocked: false };
        }
    },

    // 【乘风】免疫风类招式+攻击+1
    // 【软编码】使用 PS moves-data.js 的 wind flag
    'Wind Rider': {
        onImmunity: (atkType, move) => {
            return moveHasFlag(move, 'wind');
        }
    },

    // ============================================
    // Q. 补充 - 特定能力保护 & 换人保护
    // ============================================

    // 【怪力钳】防止攻击降低
    // 【钩子统一】onTryBoost: (boost, pokemon, source, stat, logs)
    'Hyper Cutter': {
        onTryBoost: (boost, pokemon, source, stat, logs) => {
            if (stat === 'atk' && boost < 0 && source !== pokemon) return 0;
            return boost;
        }
    },

    // 【健壮胸肌】防止防御降低
    // 【钩子统一】onTryBoost: (boost, pokemon, source, stat, logs)
    'Big Pecks': {
        onTryBoost: (boost, pokemon, source, stat, logs) => {
            if (stat === 'def' && boost < 0 && source !== pokemon) return 0;
            return boost;
        }
    },

    // 【锐利目光】防止命中率降低 + 忽略对方闪避
    // 【钩子统一】onTryBoost: (boost, pokemon, source, stat, logs)
    'Keen Eye': {
        onTryBoost: (boost, pokemon, source, stat, logs) => {
            if (stat === 'accuracy' && boost < 0 && source !== pokemon) return 0;
            return boost;
        },
        ignoreEvasion: true
    },

    // 【镜甲】反射能力下降给对方
    'Mirror Armor': {
        onTryBoost: (boost, pokemon, source, stat, logs) => {
            // 如果是自身造成的下降（如近身战），不反弹
            if (source === pokemon || !source) return boost;
            // 只有负面效果才反弹
            if (boost < 0) {
                // 反弹给对方
                if (typeof source.applyBoost === 'function') {
                    source.applyBoost(stat, boost);
                } else if (source.boosts) {
                    source.boosts[stat] = Math.max(-6, (source.boosts[stat] || 0) + boost);
                }
                if (logs && Array.isArray(logs)) {
                    logs.push(`🪞 ${pokemon.cnName} 的镜甲将 ${stat} 下降反弹给了 ${source.cnName}！`);
                }
                console.log(`[MIRROR ARMOR] ${pokemon.cnName} 将 ${stat} 下降反弹给了 ${source.cnName}!`);
                return 0; // 自己不受影响
            }
            return boost;
        }
    },

    // 【吸盘】防止被吼叫/龙尾强制换下
    'Suction Cups': {
        preventPhazing: true
    },

    // 【看门犬】防止被强制换下，被威吓时攻击+1
    'Guard Dog': {
        preventPhazing: true,
        onIntimidated: (pokemon, source, logs) => {
            // 被威吓时攻击+1而不是-1
            if (typeof pokemon.applyBoost === 'function') {
                pokemon.applyBoost('atk', 1);
                logs.push(`<span style="color:#e74c3c">🐕 ${pokemon.cnName} 的看门犬特性发动！攻击提升了！</span>`);
            }
            return 0; // 取消威吓的攻击下降
        }
    },

    // 【黏着】防止道具被偷/被拍落
    'Sticky Hold': {
        preventItemTheft: true
    },

    // 【注意】Inner Focus 和 Own Tempo 已在第999-1007行定义，此处删除重复

    // 【迟钝】防止被挑衅和挑拨
    'Oblivious': {
        preventTaunt: true,
        preventAttract: true
    },

    // ============================================
    // R. 特殊形态变化特性
    // ============================================

    // 【战斗切换 Stance Change】坚盾剑怪专属 - 攻击时变刀剑，王者盾牌时变盾牌
    'Stance Change': {
        onBeforeMove: (user, move, logs) => {
            const baseId = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // 只对坚盾剑怪生效
            if (!baseId.includes('aegislash')) return;
            
            // 获取招式分类
            const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
            const category = fullMoveData.category || move.category || (move.cat === 'phys' ? 'Physical' : move.cat === 'spec' ? 'Special' : 'Status');
            const isAttack = category === 'Physical' || category === 'Special';
            const isKingsShield = move.name === "King's Shield" || moveId === 'kingsshield';
            
            // 攻击招式 -> 刀剑形态
            if (isAttack && !baseId.includes('blade')) {
                if (typeof window.performFormChange === 'function') {
                    const res = window.performFormChange(user, 'aegislashblade', 'stancechange');
                    if (res && res.success) {
                        logs.push(`<span style="color:#dc2626">⚔️ ${user.cnName} 变成了刀剑形态！</span>`);
                        if (typeof window.updateAllVisuals === 'function') {
                            window.updateAllVisuals();
                        }
                    }
                }
            }
            // 王者盾牌 -> 盾牌形态
            else if (isKingsShield && baseId.includes('blade')) {
                if (typeof window.performFormChange === 'function') {
                    const res = window.performFormChange(user, 'aegislash', 'stancechange');
                    if (res && res.success) {
                        logs.push(`<span style="color:#3b82f6">🛡️ ${user.cnName} 变成了盾牌形态！</span>`);
                        if (typeof window.updateAllVisuals === 'function') {
                            window.updateAllVisuals();
                        }
                    }
                }
            }
        }
    },

    // 【全能变身 Zero to Hero】海豚侠专属 - 退场后再入场变成全能形态
    'Zero to Hero': {
        onSwitchOut: (pokemon) => {
            const baseId = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            // 只对海豚侠生效，且只有平凡形态才标记
            if (baseId.includes('palafin') && !baseId.includes('hero')) {
                pokemon.zeroToHeroActivated = true;
                console.log(`[ZERO TO HERO] ${pokemon.cnName} 退场，下次入场将变身！`);
            }
        },
        onStart: (self, enemy, logs, battle) => {
            const baseId = self.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            // 如果已标记且仍是平凡形态，则变身
            if (self.zeroToHeroActivated && baseId.includes('palafin') && !baseId.includes('hero')) {
                if (typeof window.performFormChange === 'function') {
                    const res = window.performFormChange(self, 'palafinhero', 'zerotohero');
                    if (res && res.success) {
                        logs.push(`<span style="color:#06b6d4">🦸 ${self.cnName} 变成了全能形态！</span>`);
                        if (typeof window.updateAllVisuals === 'function') {
                            window.updateAllVisuals();
                        }
                    }
                }
            }
        }
    },

    // 【结冻头 Ice Face】冰砌鹅专属 - 物理攻击免疫一次，雪天恢复
    'Ice Face': {
        // 物理伤害防御逻辑
        // 【重要】第6个参数 isSimulation 用于区分 AI 模拟和实际战斗
        onDefenderModifyDamage: (damage, attacker, defender, move, effectiveness, isSimulation) => {
            const baseId = defender.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            // 只对冰砌鹅生效
            if (!baseId.includes('eiscue')) return damage;
            
            // 如果已经是解冻头形态，正常受伤
            if (baseId.includes('noice')) return damage;
            
            // 获取招式分类
            const moveId = (move.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : {};
            const category = fullMoveData.category || move.category || (move.cat === 'phys' ? 'Physical' : 'Special');
            
            // 物理招式且头还在
            if (category === 'Physical' && damage > 0) {
                // 【关键修复】AI 模拟时只返回伤害为0，不触发形态变化
                if (isSimulation) {
                    return 0; // 模拟时伤害归零但不变身
                }
                
                // 实际战斗中：变身为解冻头形态
                let iceFaceLog = null;
                if (typeof window.performFormChange === 'function') {
                    const res = window.performFormChange(defender, 'eiscuenoice', 'iceface');
                    if (res && res.success) {
                        defender.iceFaceBroken = true;
                        iceFaceLog = `<span style="color:#60a5fa">❄️ ${defender.cnName} 的结冻头代替它承受了攻击！</span>`;
                        console.log(`[ICE FACE] ${defender.cnName} 的结冻头被打碎了！`);
                        if (typeof window.updateAllVisuals === 'function') {
                            window.updateAllVisuals();
                        }
                    }
                }
                // 【修复】返回对象以包含日志
                return { damage: 0, log: iceFaceLog };
            }
            return damage;
        },
        // 入场时检查雪天恢复
        onStart: (self, enemy, logs, battle) => {
            const baseId = self.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const weather = battle?.weather || (typeof window.battle !== 'undefined' ? window.battle.weather : null);
            const isSnow = weather === 'snow' || weather === 'hail';
            
            // 如果是解冻头形态且天气是雪天，恢复
            if (isSnow && baseId.includes('noice')) {
                if (typeof window.performFormChange === 'function') {
                    const res = window.performFormChange(self, 'eiscue', 'iceface');
                    if (res && res.success) {
                        self.iceFaceBroken = false;
                        logs.push(`<span style="color:#60a5fa">❄️ ${self.cnName} 的结冻头恢复了！</span>`);
                        if (typeof window.updateAllVisuals === 'function') {
                            window.updateAllVisuals();
                        }
                    }
                }
            }
        },
        // 天气变化时也检查恢复（回合结束时）
        onEndTurn: (pokemon, logs) => {
            const baseId = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const battle = window.battle;
            const weather = battle?.weather;
            const isSnow = weather === 'snow' || weather === 'hail';
            
            // 如果是解冻头形态且天气是雪天，恢复
            if (isSnow && baseId.includes('noice')) {
                if (typeof window.performFormChange === 'function') {
                    const res = window.performFormChange(pokemon, 'eiscue', 'iceface');
                    if (res && res.success) {
                        pokemon.iceFaceBroken = false;
                        logs.push(`<span style="color:#60a5fa">❄️ ${pokemon.cnName} 的结冻头恢复了！</span>`);
                        if (typeof window.updateAllVisuals === 'function') {
                            window.updateAllVisuals();
                        }
                    }
                }
            }
        }
    },
    
    // ============================================
    // H. 皮肤系特性 (The "-ate" Abilities)
    // 普通系招式转换为其他属性，威力x1.2
    // ============================================

    // 【妖精皮肤】普通系招式变为妖精系，威力x1.2
    'Pixilate': {
        onModifyType: (move, attacker, battle) => {
            const moveType = move.type || 'Normal';
            if (moveType === 'Normal') {
                return { newType: 'Fairy', powerBoost: 1.2 };
            }
            return null;
        }
    },

    // 【飞行皮肤】普通系招式变为飞行系，威力x1.2
    'Aerilate': {
        onModifyType: (move, attacker, battle) => {
            const moveType = move.type || 'Normal';
            if (moveType === 'Normal') {
                return { newType: 'Flying', powerBoost: 1.2 };
            }
            return null;
        }
    },

    // 【冰冻皮肤】普通系招式变为冰系，威力x1.2
    'Refrigerate': {
        onModifyType: (move, attacker, battle) => {
            const moveType = move.type || 'Normal';
            if (moveType === 'Normal') {
                return { newType: 'Ice', powerBoost: 1.2 };
            }
            return null;
        }
    },

    // 【电气皮肤】普通系招式变为电系，威力x1.2
    'Galvanize': {
        onModifyType: (move, attacker, battle) => {
            const moveType = move.type || 'Normal';
            if (moveType === 'Normal') {
                return { newType: 'Electric', powerBoost: 1.2 };
            }
            return null;
        }
    },

    // ============================================
    // I. 灾祸系列 (The "Ruins" - Gen 9)
    // 简化版：直接修改自身造成的伤害
    // ============================================

    // 【灾祸之剑】自己造成的物理伤害x1.33 (简化版)
    'Sword of Ruin': {
        onAttackerModifyDamage: (damage, attacker, defender, move, battle) => {
            const isPhysical = move.cat === 'phys' || move.category === 'Physical';
            if (isPhysical) {
                return Math.floor(damage * 1.33);
            }
            return damage;
        },
        onSwitchIn: (pokemon, logs) => {
            logs.push(`<span style="color:#e74c3c">⚔️ ${pokemon.cnName} 的灾祸之剑散发着不祥的气息!</span>`);
        }
    },

    // 【灾祸之玉】自己造成的特殊伤害x1.33 (简化版)
    'Beads of Ruin': {
        onAttackerModifyDamage: (damage, attacker, defender, move, battle) => {
            const isSpecial = move.cat === 'spec' || move.category === 'Special';
            if (isSpecial) {
                return Math.floor(damage * 1.33);
            }
            return damage;
        },
        onSwitchIn: (pokemon, logs) => {
            logs.push(`<span style="color:#9b59b6">💎 ${pokemon.cnName} 的灾祸之玉散发着不祥的气息!</span>`);
        }
    },

    // 【灾祸之简】受到的物理伤害x0.75 (简化版)
    'Tablets of Ruin': {
        onDefenderModifyDamage: (damage, attacker, defender, move, battle) => {
            const isPhysical = move.cat === 'phys' || move.category === 'Physical';
            if (isPhysical) {
                return Math.floor(damage * 0.75);
            }
            return damage;
        },
        onSwitchIn: (pokemon, logs) => {
            logs.push(`<span style="color:#f39c12">📜 ${pokemon.cnName} 的灾祸之简散发着不祥的气息!</span>`);
        }
    },

    // 【灾祸之鼎】受到的特殊伤害x0.75 (简化版)
    'Vessel of Ruin': {
        onDefenderModifyDamage: (damage, attacker, defender, move, battle) => {
            const isSpecial = move.cat === 'spec' || move.category === 'Special';
            if (isSpecial) {
                return Math.floor(damage * 0.75);
            }
            return damage;
        },
        onSwitchIn: (pokemon, logs) => {
            logs.push(`<span style="color:#1abc9c">🏺 ${pokemon.cnName} 的灾祸之鼎散发着不祥的气息!</span>`);
        }
    },

    // ============================================
    // J. 风险回报类 (Risk & Reward)
    // ============================================

    // 【活力】物攻x1.5，命中率x0.8
    'Hustle': {
        onModifyStat: (stats, poke, battle) => {
            stats.atk = Math.floor(stats.atk * 1.5);
        },
        onModifyAccuracy: (accuracy, attacker, defender, move, battle) => {
            const isPhysical = move.cat === 'phys' || move.category === 'Physical';
            if (isPhysical && typeof accuracy === 'number') {
                return Math.floor(accuracy * 0.8);
            }
            return accuracy;
        }
    },

    // 【分析】后手攻击威力x1.3
    'Analytic': {
        onBasePower: (power, attacker, defender, move, battle) => {
            // 简化判定：如果对手本回合已经行动过，则视为后手
            if (defender.hasActedThisTurn) {
                return Math.floor(power * 1.3);
            }
            return power;
        }
    },

    // ============================================
    // K. 被动触发类 (Reactive)
    // ============================================

    // 【正义之心】受到恶系伤害后攻击+1
    'Justified': {
        onDamageTaken: (pokemon, damage, source, logs, move) => {
            if (damage > 0 && move && move.type === 'Dark') {
                if (!pokemon.boosts) pokemon.boosts = {};
                const oldAtk = pokemon.boosts.atk || 0;
                pokemon.boosts.atk = Math.min(6, oldAtk + 1);
                if (pokemon.boosts.atk > oldAtk) {
                    logs.push(`<span style="color:#3498db">⚔️ ${pokemon.cnName} 的正义之心发动! 攻击提升了!</span>`);
                }
            }
        }
    },

    // 【蒸汽机】受到水/火系伤害后速度+6
    'Steam Engine': {
        onDamageTaken: (pokemon, damage, source, logs, move) => {
            if (damage > 0 && move && (move.type === 'Water' || move.type === 'Fire')) {
                if (!pokemon.boosts) pokemon.boosts = {};
                const oldSpe = pokemon.boosts.spe || 0;
                pokemon.boosts.spe = 6; // 直接拉满
                if (pokemon.boosts.spe > oldSpe) {
                    logs.push(`<span style="color:#e67e22">🚂 ${pokemon.cnName} 的蒸汽机全力运转! 速度极大幅提升!</span>`);
                }
            }
        }
    },

    // 【诅咒之躯】受到伤害后30%概率定身对手招式
    'Cursed Body': {
        onDamageTaken: (pokemon, damage, source, logs, move) => {
            if (damage > 0 && source && move && Math.random() < 0.3) {
                if (!source.volatile) source.volatile = {};
                // 【关键修复】使用正确的字段名，与 checkCanMove 一致
                source.volatile.disable = 4; // 持续 4 回合
                source.volatile.disabledMove = move.name; // 被封印的招式名
                logs.push(`<span style="color:#9b59b6">👻 ${pokemon.cnName} 的诅咒之躯发动! ${source.cnName} 的 ${move.cn || move.name} 被封印了!</span>`);
                console.log(`[CURSED BODY] ${source.cnName} 的 ${move.name} 被封印 4 回合`);
            }
        }
    },

    // ============================================
    // L. 简单数值类 (Simple Stat Modifiers)
    // ============================================

    // 【耐热】受到火系伤害减半
    'Heatproof': {
        onDefenderModifyDamage: (damage, attacker, defender, move, battle) => {
            if (move.type === 'Fire') {
                return Math.floor(damage * 0.5);
            }
            return damage;
        }
    },

    // 【单纯】能力变化翻倍
    'Simple': {
        onBoostChange: (pokemon, stat, change) => {
            return change * 2; // 翻倍
        }
    },
    
    // 【持久力 Stamina】受到攻击时防御+1
    'Stamina': {
        onDamageTaken: (pokemon, damage, source, logs, move) => {
            if (damage > 0) {
                if (!pokemon.boosts) pokemon.boosts = {};
                const oldDef = pokemon.boosts.def || 0;
                if (oldDef < 6) {
                    pokemon.boosts.def = Math.min(6, oldDef + 1);
                    logs.push(`<span style="color:#3498db">🛡️ ${pokemon.cnName} 的持久力发动！防御提升了！</span>`);
                    console.log(`[STAMINA] ${pokemon.cnName} 防御 +1 (${oldDef} -> ${pokemon.boosts.def})`);
                }
            }
        }
    },
    
    // 【弱点保险 Weak Armor】受到物理攻击时防御-1，速度+2
    'Weak Armor': {
        onDamageTaken: (pokemon, damage, source, logs, move) => {
            if (damage > 0 && move && (move.cat === 'phys' || move.category === 'Physical')) {
                if (!pokemon.boosts) pokemon.boosts = {};
                const oldDef = pokemon.boosts.def || 0;
                const oldSpe = pokemon.boosts.spe || 0;
                pokemon.boosts.def = Math.max(-6, oldDef - 1);
                pokemon.boosts.spe = Math.min(6, oldSpe + 2);
                logs.push(`<span style="color:#e74c3c">💨 ${pokemon.cnName} 的碎裂盔甲发动！防御下降，速度大幅提升！</span>`);
                console.log(`[WEAK ARMOR] ${pokemon.cnName} 防御 -1, 速度 +2`);
            }
        }
    }
    
    // 【唱反调 Contrary】已在 battle-engine.js 的 applyBoost 中实现
    // 不在此重复定义
};

// ============================================
// 换人阻断校验函数
// ============================================

/**
 * 校验当前宝可梦是否可以主动换人
 * @param {Object} pokemon - 想要换人的宝可梦
 * @param {Object} opponent - 对手宝可梦
 * @param {Object} battle - 战斗对象
 * @returns {Object} { canSwitch: boolean, reason?: string }
 */
export function checkCanSwitch(pokemon, opponent, battle) {
    // 0. 特殊状态直接放行
    // 如果使用了 U-turn 等 Pivot 招式，或者携带漂亮外壳，无视一切锁定
    if (pokemon.isPivoting) return { canSwitch: true };
    // 【道具统一】使用规范化 ID 比较
    const pokeItemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (pokeItemId === 'shedshell') return { canSwitch: true };

    // 1. 幽灵系特权：想走就走（六代后）
    if (pokemon.types && pokemon.types.includes('Ghost')) return { canSwitch: true };

    // 2. 检查自身的异常状态 (Volatile)
    if (pokemon.volatile) {
        // 黑色目光/挡路等造成的 cantEscape 状态
        if (pokemon.volatile.cantEscape) {
            return { canSwitch: false, reason: `${pokemon.cnName} 被困住了，无法逃走！` };
        }
        // 束缚状态（熔岩风暴、火焰旋涡等）
        if (pokemon.volatile.partiallyTrapped) {
            return { canSwitch: false, reason: `${pokemon.cnName} 正处于束缚状态，无法逃走！` };
        }
    }

    // 3. 检查对手特性 (Abilities)
    if (opponent && opponent.isAlive && opponent.isAlive()) {
        const ability = opponent.ability || '';
        const handler = AbilityHandlers[ability];

        if (handler && handler.isTrapping && handler.canTrap) {
            if (handler.canTrap(opponent, pokemon)) {
                // 根据特性返回不同的提示
                if (ability === 'Shadow Tag') {
                    return { canSwitch: false, reason: `${opponent.cnName} 的踩影让脚因为恐惧而无法移动！` };
                }
                if (ability === 'Magnet Pull') {
                    return { canSwitch: false, reason: `${opponent.cnName} 的强力磁场吸住了钢属性！` };
                }
                if (ability === 'Arena Trap') {
                    return { canSwitch: false, reason: `${opponent.cnName} 封锁了地面，无法逃走！` };
                }
                return { canSwitch: false, reason: `被对手的特性困住了！` };
            }
        }
    }

    return { canSwitch: true };
}

// ============================================
// 【软编码】特性分类列表（供其他模块引用）
// ============================================

// 破格类特性（无视对手特性）
AbilityHandlers._moldBreakerAbilities = ['moldbreaker', 'teravolt', 'turboblaze'];

// 睡眠免疫特性
AbilityHandlers._sleepImmuneAbilities = ['insomnia', 'vitalspirit', 'comatose', 'purifyingsalt', 'sweetveil'];

// 皮肤系特性
AbilityHandlers._ateAbilities = ['pixilate', 'aerilate', 'refrigerate', 'galvanize'];

// 导出到全局
if (typeof window !== 'undefined') {
    window.AbilityHandlers = AbilityHandlers;
    window.checkCanSwitch = checkCanSwitch;
    window.moveHasFlag = moveHasFlag; // 导出招式 flag 检查函数
}
