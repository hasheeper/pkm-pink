/**
 * =============================================
 * WEATHER EFFECTS - 天气效果核心模块
 * =============================================
 * 
 * 统一管理所有天气的机制逻辑：
 * - 天气伤害/回复
 * - 天气免疫类型
 * - 天气对招式威力的修正
 * - 天气对命中率的修正
 * - 天气对防御的修正
 * 
 * 依赖: 无（纯数据模块）
 */

// ============================================
// 天气 ID 标准化
// ============================================

/**
 * 标准化天气 ID
 * - 冰雹 (hail) -> 雪天 (snow)
 * - 其他保持不变
 * @param {string} weatherId 原始天气 ID
 * @returns {string} 标准化后的天气 ID
 */
export function normalizeWeatherId(weatherId) {
    if (!weatherId) return null;
    const id = weatherId.toLowerCase();
    
    // 冰雹统一转换为雪天 (SV机制)
    if (id === 'hail') {
        return 'snow';
    }
    
    return id;
}

// ============================================
// 天气配置数据
// ============================================

/**
 * 天气效果配置
 * 集中管理所有天气的机制逻辑
 */
export const WEATHER_CONFIG = {
    // ========== 普通天气 ==========
    
    rain: {
        name: '雨天',
        icon: '🌧️',
        // 威力修正
        powerModifiers: {
            Water: 1.5,  // 水系威力 x1.5
            Fire: 0.5    // 火系威力 x0.5
        },
        // 命中率修正
        accuracyModifiers: {
            Thunder: true,      // 雷电必中
            Hurricane: true     // 暴风必中
        },
        // 特殊效果
        effects: {
            solarBeamHalved: true,  // 日光束威力减半
            weatherBallType: 'Water',
            weatherBallPower: 100
        },
        visualKey: 'rain'
    },
    
    sun: {
        name: '晴天',
        icon: '☀️',
        powerModifiers: {
            Fire: 1.5,   // 火系威力 x1.5
            Water: 0.5   // 水系威力 x0.5
        },
        effects: {
            solarBeamInstant: true,    // 日光束无需蓄力
            synthesisBoost: true,      // 光合作用回复 2/3
            morningsunBoost: true,     // 晨光回复 2/3
            moonlightBoost: true,      // 月光回复 2/3
            weatherBallType: 'Fire',
            weatherBallPower: 100
        },
        visualKey: 'sun'
    },
    
    sandstorm: {
        name: '沙暴',
        icon: '🌪️',
        // 回合末伤害
        endTurnDamage: {
            fraction: 1/16,
            immuneTypes: ['Rock', 'Ground', 'Steel'],
            immuneAbilities: ['sandveil', 'sandforce', 'sandrush', 'magicguard', 'overcoat']
        },
        // 防御加成
        defenseBoost: {
            types: ['Rock'],
            stat: 'spd',      // 特防
            multiplier: 1.5
        },
        effects: {
            weatherBallType: 'Rock',
            weatherBallPower: 100
        },
        visualKey: 'sand'
    },
    
    snow: {
        name: '雪天',
        icon: '❄️',
        // 防御加成 (Gen 9 机制：冰系物防 x1.5)
        defenseBoost: {
            types: ['Ice'],
            stat: 'def',      // 物防
            multiplier: 1.5
        },
        effects: {
            weatherBallType: 'Ice',
            weatherBallPower: 100,
            auroraVeilEnabled: true  // 允许使用极光幕
        },
        visualKey: 'snow'
    },
    
    // ========== 始源天气 (Primal Weather) ==========
    // 不可被普通天气覆盖，不递减回合
    
    harshsun: {
        name: '大日照',
        icon: '🔥',
        isPrimal: true,
        powerModifiers: {
            Fire: 1.5,
            Water: 0      // 水系招式完全失效
        },
        effects: {
            solarBeamInstant: true,
            synthesisBoost: true,
            morningsunBoost: true,
            moonlightBoost: true,
            weatherBallType: 'Fire',
            weatherBallPower: 100,
            blockWaterMoves: true  // 水系攻击招式失效
        },
        visualKey: 'harshsun'
    },
    
    heavyrain: {
        name: '大雨',
        icon: '🌊',
        isPrimal: true,
        powerModifiers: {
            Water: 1.5,
            Fire: 0       // 火系招式完全失效
        },
        accuracyModifiers: {
            Thunder: true,
            Hurricane: true
        },
        effects: {
            solarBeamHalved: true,
            weatherBallType: 'Water',
            weatherBallPower: 100,
            blockFireMoves: true   // 火系攻击招式失效
        },
        visualKey: 'heavyrain'
    },
    
    deltastream: {
        name: '乱气流',
        icon: '🌀',
        isPrimal: true,
        // 特殊效果：飞行系弱点变为普通效果
        effects: {
            flyingWeaknessNeutralized: true,
            weatherBallType: 'Flying',
            weatherBallPower: 100
        },
        visualKey: 'deltastream'
    },
    
    // ========== 特殊环境天气 ==========
    // 以下天气为硬编码的特殊环境，具有复杂的游戏机制
    // 普通区域天气（如 Smog、Ashfall、Fog、Gale）已迁移至 AI 自定义 JSON 接口
    // 参见 docs/ENVIRONMENT_OVERLAY_TEMPLATES.md 获取模板示例
    
    // ========== Ambrosia 神之琼浆 (C区 - 神秘区) ==========
    ambrosia: {
        name: '神之琼浆',
        icon: '🌸',
        isEnvironmental: true,  // 环境天气，无限持续
        
        effects: {
            // A. 唯心实体化 (Psychic Mind) - 全员暴击率 +1
            psychicMind: {
                critBoost: 1,  // 全员暴击等级 +1
                description: '神秘粉雾增强了精神力量，所有招式更容易命中要害'
            },
            
            // B. AVS 羁绊系统倍率 (Trust/Passion/Insight/Devotion)
            avsMultiplier: {
                rate: 2.0,  // AVS 触发率 x2
                description: '神之琼浆强化了训练家与宝可梦的羁绊'
            },
            
            // C. 时空醉 (Neuro-Backlash) - 使用特殊机制后下回合混乱
            neuroBacklash: {
                enabled: true,
                // 触发条件：Mega/Z/Dynamax/Terastal
                triggers: ['mega', 'zmove', 'dynamax', 'terastal'],
                // 效果：下回合开始时陷入混乱
                effect: 'confusion',
                // 穿透神秘守护
                bypassSafeguard: true,
                // Boss 免疫（通过 isAdmin 标记）
                bossImmune: true,
                description: '神经负担导致时空醉，使用特殊机制后宝可梦会陷入混乱'
            },
            
            // D. 无限场地 (Infinite Terrain) - 超能/薄雾场地无限持续
            infiniteTerrain: {
                affectedTerrains: ['psychicterrain', 'mistyterrain'],
                description: '超能场地和薄雾场地在神之琼浆中永久持续'
            },
            
            // E. 污染回火 (Contamination Recoil) - 高威力毒/恶招式反噬
            contaminationRecoil: {
                enabled: true,
                // 触发条件：毒/恶系招式威力 >= 90
                affectedTypes: ['Dark', 'Poison'],
                powerThreshold: 90,
                // 反噬效果：暴击率 -1 或 混乱
                effects: {
                    critDrop: -1,        // 暴击率 -1
                    confusionChance: 0.3  // 30% 几率混乱
                },
                description: '高威力的毒/恶系招式会触发粉雾的排异反应'
            },
            
            // 天气球变为妖精系
            weatherBallType: 'Fairy',
            weatherBallPower: 100
        },
        
        visualKey: 'ambrosia'
    },
    
    // ========== Chronal Rift 时空裂隙 (S区 - 绝对领域) ==========
    chronalrift: {
        name: '时空裂隙',
        icon: '🌀',
        isEnvironmental: true,  // 环境天气，无限持续
        tier: 3,  // Tier 3 绝对天气，不可被普通天气替换
        allowsInnerWeather: true,  // 内部可以存在普通天气（如暴雨）
        
        effects: {
            // A. 古今悖论 (Paradox Resonance) - 悖谬种/异兽增强
            paradoxResonance: {
                enabled: true,
                // 自动激活古代活性/夸克充能
                autoActivateAbilities: ['protosynthesis', 'quarkdrive'],
                // 异兽气场：非时空类招式伤害 -20%
                beastAura: {
                    damageReduction: 0.20,
                    // 免疫来源：悖谬种、异兽、神话
                    immuneSources: ['paradox', 'ultrabeast', 'mythical']
                },
                description: '悖谬种特性自动激活，异兽获得伤害减免'
            },
            
            // B. 洗翠无法 (Unbound Arts) - 古武系统重构
            unboundArts: {
                enabled: true,
                // 刚猛 (Strong Style) - 破坏神模式
                strongStyle: {
                    noCooldown: true,
                    damageMultiplier: 1.5,    // 伤害 x1.5
                    accuracyMultiplier: 0.85, // 命中 x0.85
                    priority: -1,
                    description: '无冷却，伤害x1.5，命中x0.85，优先度-1'
                },
                // 迅疾 (Agile Style) - 瞬身模式
                agileStyle: {
                    noCooldown: true,
                    priorityBoost: 1,         // 优先度 +1
                    // 威力修正：速度快=1.0，速度慢=0.9
                    powerIfFaster: 1.0,
                    powerIfSlower: 0.9,
                    description: '无冷却，优先度+1，速度快无损/速度慢威力x0.9'
                },
                description: '古武系统解除限制，变成每回合可用的核弹'
            },
            
            // C. 速度熵增 (Entropy Flux) - 随机戏法空间
            entropyFlux: {
                enabled: true,
                triggerChance: 0.15,  // 15% 概率触发
                effect: 'trickRoomToggle',
                // 触发后的戏法空间无回合限制
                infiniteDuration: true,
                description: '每回合开始有15%概率翻转戏法空间状态'
            },
            
            // D. 起源共鸣 (Origin Pulse) - 洗翠/起源形态增强
            originPulse: {
                enabled: true,
                // 洗翠形态：刚猛无视命中惩罚，迅疾无视威力削减
                hisuianBonus: {
                    strongStyleIgnoreAccPenalty: true,
                    agileStyleFullPower: true
                },
                // 起源形态同样享受加成
                originFormBonus: true,
                // 识别关键词
                hisuianIdentifiers: ['hisui', 'hisuian'],
                originIdentifiers: ['origin'],
                description: '洗翠/起源形态在时空裂隙中如鱼得水'
            },
            
            // E. 技能黑箱 (Move Glitch) - 科技招式RNG
            moveGlitch: {
                enabled: true,
                // 受影响的招式类型
                affectedMoves: [
                    'multiattack', 'conversion', 'conversion2', 'lockon',
                    'technoblast', 'gearsaucer', 'geargrind', 'shiftgear',
                    'magnetrise', 'flashcannon', 'steelbeam'
                ],
                // 受影响的宝可梦（人造/科技类）
                affectedPokemon: ['porygon', 'porygon2', 'porygonz', 'genesect', 'magearna', 'silvally', 'typenull'],
                // 效果概率
                criticalSuccessChance: 0.20,  // 20% 威力 x2
                criticalFailChance: 0.10,     // 10% 威力 x0 (失败)
                criticalSuccessMultiplier: 2.0,
                description: '科技类招式有20%暴击/10%失败的赌博效果'
            },
            
            // 天气球变为龙系（时空能量）
            weatherBallType: 'Dragon',
            weatherBallPower: 100
        },
        
        visualKey: 'chronalrift'
    },
    
    // ========== 区域天气 (N/A/S/B) ==========
    // 简化版：仅提供招式威力修正
    
    // N 区 (Neon) - Smog (烟霾) 🏭
    // 【科技过载】电系和毒系招式威力 x1.3
    smog: {
        name: '烟霾',
        icon: '🏭',
        isEnvironmental: true,
        powerModifiers: {
            Electric: 1.3,
            Poison: 1.3
        },
        effects: {
            weatherBallType: 'Poison',
            weatherBallPower: 100
        },
        visualKey: 'smog'
    },
    
    // A 区 (Apex) - Ashfall (火山灰) 🌋
    // 【极热荒原】火/地面威力 x1.3，冰系威力 x0.7
    ashfall: {
        name: '火山灰',
        icon: '🌋',
        isEnvironmental: true,
        powerModifiers: {
            Fire: 1.3,
            Ground: 1.3,
            Ice: 0.7
        },
        effects: {
            weatherBallType: 'Fire',
            weatherBallPower: 100
        },
        visualKey: 'ashfall'
    },
    
    // B 区 (Bloom) - Gale (香风) 🌿
    // 【原始增生】草/虫威力 x1.3，火系威力 x0.7
    gale: {
        name: '香风',
        icon: '🌿',
        isEnvironmental: true,
        powerModifiers: {
            Grass: 1.3,
            Bug: 1.3,
            Fire: 0.7
        },
        effects: {
            weatherBallType: 'Grass',
            weatherBallPower: 100
        },
        visualKey: 'gale'
    },
    
    // S 区 (Shadow) - Fog (迷雾) 👻
    // 【暗物质】幽灵/恶威力 x1.3
    fog: {
        name: '迷雾',
        icon: '👻',
        isEnvironmental: true,
        powerModifiers: {
            Ghost: 1.3,
            Dark: 1.3
        },
        effects: {
            weatherBallType: 'Ghost',
            weatherBallPower: 100
        },
        visualKey: 'fog'
    }
};

// ============================================
// 天气效果查询函数
// ============================================

/**
 * 获取天气配置
 * @param {string} weather 天气 ID
 * @returns {object|null} 天气配置对象
 */
export function getWeatherConfig(weather) {
    const normalizedId = normalizeWeatherId(weather);
    return WEATHER_CONFIG[normalizedId] || null;
}

/**
 * 检查是否为始源天气
 * @param {string} weather 天气 ID
 * @returns {boolean}
 */
export function isPrimalWeather(weather) {
    const config = getWeatherConfig(weather);
    return config?.isPrimal === true;
}

/**
 * 获取始源天气列表
 * @returns {string[]}
 */
export function getPrimalWeathers() {
    return ['deltastream', 'harshsun', 'heavyrain'];
}

// ============================================
// 天气伤害计算
// ============================================

/**
 * 检查宝可梦是否免疫天气伤害
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {string} weather 天气 ID
 * @returns {boolean}
 */
export function isWeatherDamageImmune(pokemon, weather) {
    const config = getWeatherConfig(weather);
    if (!config || !config.endTurnDamage) return true; // 无伤害配置 = 免疫
    
    const dmgConfig = config.endTurnDamage;
    
    // 类型免疫
    if (dmgConfig.immuneTypes && pokemon.types) {
        if (pokemon.types.some(t => dmgConfig.immuneTypes.includes(t))) {
            return true;
        }
    }
    
    // 特性免疫
    if (dmgConfig.immuneAbilities && pokemon.ability) {
        const abilityId = pokemon.ability.toLowerCase().replace(/[^a-z]/g, '');
        if (dmgConfig.immuneAbilities.includes(abilityId)) {
            return true;
        }
    }
    
    // 道具免疫 (Safety Goggles)
    if (pokemon.item) {
        const itemId = pokemon.item.toLowerCase().replace(/[^a-z]/g, '');
        if (itemId === 'safetygoggles') {
            return true;
        }
    }
    
    return false;
}

/**
 * 计算天气回合末伤害
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {string} weather 天气 ID
 * @returns {number} 伤害值 (0 = 免疫)
 */
export function getWeatherDamage(pokemon, weather) {
    if (isWeatherDamageImmune(pokemon, weather)) return 0;
    
    const config = getWeatherConfig(weather);
    if (!config || !config.endTurnDamage) return 0;
    
    const fraction = config.endTurnDamage.fraction || 0;
    return Math.max(1, Math.floor(pokemon.maxHp * fraction));
}

/**
 * 获取天气伤害日志
 * @param {Pokemon} pokemon 宝可梦对象
 * @param {string} weather 天气 ID
 * @param {number} damage 伤害值
 * @returns {string} 日志文本
 */
export function getWeatherDamageLog(pokemon, weather, damage) {
    const config = getWeatherConfig(weather);
    if (!config) return '';
    
    return `${pokemon.cnName} 受到${config.name}的伤害! (-${damage})`;
}

// ============================================
// 天气威力修正
// ============================================

/**
 * 获取天气对招式威力的修正
 * @param {string} weather 天气 ID
 * @param {string} moveType 招式属性
 * @param {string} moveName 招式名称 (用于特殊招式检查)
 * @returns {{ modifier: number, log: string|null }}
 */
export function getWeatherPowerModifier(weather, moveType, moveName = '') {
    const config = getWeatherConfig(weather);
    if (!config) return { modifier: 1, log: null };
    
    const moveId = moveName.toLowerCase().replace(/[^a-z]/g, '');
    
    // 【特判】Hydro Steam 在晴天下威力 x1.5 而非 x0.5
    if (moveId === 'hydrosteam' && (weather === 'sun' || weather === 'harshsun')) {
        return { modifier: 1.5, log: `☀️ 水蒸气在晴天下威力增强！` };
    }
    
    // 检查威力修正
    if (config.powerModifiers && config.powerModifiers[moveType] !== undefined) {
        const modifier = config.powerModifiers[moveType];
        
        // 威力为 0 表示招式失效
        if (modifier === 0) {
            const blockMsg = (weather === 'harshsun' || config.effects?.blockWaterMoves) 
                ? `水被强烈的阳光蒸发了！`
                : `火被暴风雨浇灭了！`;
            return { modifier: 0, log: blockMsg };
        }
        
        if (modifier !== 1) {
            const changeText = modifier > 1 ? '增强' : '减弱';
            return { 
                modifier, 
                log: `${config.name}使${moveType}系招式威力${changeText}了！` 
            };
        }
    }
    
    // 日光束/日光刃在恶劣天气威力减半
    if ((moveId === 'solarbeam' || moveId === 'solarblade') && config.effects?.solarBeamHalved) {
        return { modifier: 0.5, log: `${config.name}使${moveName}威力减半！` };
    }
    
    return { modifier: 1, log: null };
}

// ============================================
// 天气命中率修正
// ============================================

/**
 * 获取天气对招式命中率的修正
 * @param {string} weather 天气 ID
 * @param {string} moveName 招式名称
 * @returns {{ accuracy: number|null, log: string|null }} null = 不修改, true = 必中, number = 修正后命中率
 */
export function getWeatherAccuracyModifier(weather, moveName) {
    const config = getWeatherConfig(weather);
    if (!config) return { accuracy: null, log: null };
    
    const moveId = moveName.replace(/[^a-zA-Z]/g, '').toLowerCase();
    
    // 雨天必中招式
    if (config.accuracyModifiers) {
        for (const [move, isGuaranteed] of Object.entries(config.accuracyModifiers)) {
            if (moveId === move.toLowerCase() && isGuaranteed) {
                return { 
                    accuracy: true, // true = 必中
                    log: `${config.name}使${moveName}必定命中！` 
                };
            }
        }
    }
    
    // 【晴天特殊处理】雷电/暴风命中率降至 50%
    if (weather === 'sun' || weather === 'harshsun') {
        const sunAccDropMoves = ['thunder', 'hurricane'];
        if (sunAccDropMoves.includes(moveId)) {
            return { 
                accuracy: 50, 
                log: `☀️ 晴天使${moveName}命中率降至 50%` 
            };
        }
    }
    
    // 【雪天特殊处理】暴风雪必中
    if (weather === 'snow' || weather === 'hail') {
        if (moveId === 'blizzard') {
            return { 
                accuracy: true, 
                log: `❄️ 雪天使暴风雪必定命中！` 
            };
        }
    }
    
    return { accuracy: null, log: null };
}

// ============================================
// 天气防御修正
// ============================================

/**
 * 获取天气对防御的加成
 * @param {string} weather 天气 ID
 * @param {string[]} defenderTypes 防御方属性
 * @param {boolean} isSpecial 是否为特殊攻击
 * @returns {{ multiplier: number, log: string|null }}
 */
export function getWeatherDefenseBoost(weather, defenderTypes, isSpecial) {
    const config = getWeatherConfig(weather);
    if (!config || !config.defenseBoost) return { multiplier: 1, log: null };
    
    const boost = config.defenseBoost;
    
    // 检查防御方是否有对应属性
    const hasMatchingType = defenderTypes.some(t => boost.types.includes(t));
    if (!hasMatchingType) return { multiplier: 1, log: null };
    
    // 检查是否为对应的防御类型
    // spd = 特防 (沙暴对岩石系)
    // def = 物防 (雪天对冰系)
    const statMatches = (boost.stat === 'spd' && isSpecial) || (boost.stat === 'def' && !isSpecial);
    if (!statMatches) return { multiplier: 1, log: null };
    
    const statName = boost.stat === 'spd' ? '特防' : '物防';
    return { 
        multiplier: boost.multiplier, 
        log: `${config.name}使${boost.types.join('/')}系的${statName}提升了！` 
    };
}

// ============================================
// 天气特殊效果检查
// ============================================

/**
 * 检查招式是否被天气阻止
 * @param {string} weather 天气 ID
 * @param {string} moveType 招式属性
 * @param {number} basePower 招式威力 (0 = 变化技)
 * @returns {{ blocked: boolean, message: string|null }}
 */
export function checkWeatherBlocksMove(weather, moveType, basePower) {
    const config = getWeatherConfig(weather);
    if (!config || basePower === 0) return { blocked: false, message: null };
    
    // 大日照阻止水系攻击招式
    if (config.effects?.blockWaterMoves && moveType === 'Water') {
        return { 
            blocked: true, 
            message: `<span style="color:#f59e0b">🔥 水被强烈的阳光蒸发了！</span>` 
        };
    }
    
    // 大雨阻止火系攻击招式
    if (config.effects?.blockFireMoves && moveType === 'Fire') {
        return { 
            blocked: true, 
            message: `<span style="color:#3b82f6">🌊 火被暴风雨浇灭了！</span>` 
        };
    }
    
    return { blocked: false, message: null };
}

/**
 * 检查是否可以使用极光幕
 * @param {string} weather 天气 ID
 * @returns {boolean}
 */
export function canUseAuroraVeil(weather) {
    const config = getWeatherConfig(weather);
    return config?.effects?.auroraVeilEnabled === true;
}

/**
 * 检查日光束是否可以瞬发
 * @param {string} weather 天气 ID
 * @returns {boolean}
 */
export function isSolarBeamInstant(weather) {
    const config = getWeatherConfig(weather);
    return config?.effects?.solarBeamInstant === true;
}

/**
 * 获取天气球的属性和威力
 * @param {string} weather 天气 ID
 * @returns {{ type: string, power: number }}
 */
export function getWeatherBallStats(weather) {
    const config = getWeatherConfig(weather);
    if (!config || !config.effects) {
        return { type: 'Normal', power: 50 };
    }
    
    return {
        type: config.effects.weatherBallType || 'Normal',
        power: config.effects.weatherBallPower || 50
    };
}

/**
 * 获取回复技能的回复比例修正
 * @param {string} weather 天气 ID
 * @param {string} moveName 招式名称
 * @returns {number} 回复比例 (默认 0.5)
 */
export function getRecoveryRatio(weather, moveName) {
    const config = getWeatherConfig(weather);
    const moveId = (moveName || '').toLowerCase().replace(/[^a-z]/g, '');
    
    // 光合作用/晨光/月光 在晴天回复 2/3
    const sunBoostMoves = ['synthesis', 'morningsun', 'moonlight'];
    if (sunBoostMoves.includes(moveId)) {
        if (config?.effects?.synthesisBoost || config?.effects?.morningsunBoost || config?.effects?.moonlightBoost) {
            return 2/3;
        }
        // 在其他天气下回复 1/4
        if (weather && weather !== 'none' && weather !== 'sun' && weather !== 'harshsun') {
            return 1/4;
        }
    }
    
    return 1/2; // 默认回复比例
}

/**
 * 获取天气对回复效果的全局修正倍率
 * 【Smog 专用】化学屏障 - 所有回复效果减半
 * @param {string} weather 天气 ID
 * @returns {number} 回复倍率 (1 = 无修正, 0.5 = 减半)
 */
export function getHealingMultiplier(weather) {
    const config = getWeatherConfig(weather);
    if (config?.effects?.healingReduction) {
        return config.effects.healingReduction;
    }
    return 1;
}

/**
 * 【统一治愈函数】处理 HP 回复，自动应用 Smog 化学屏障减半效果
 * 所有回复来源（技能、道具、特性、树果等）都应使用此函数
 * 
 * @param {object} pokemon 要回复的宝可梦
 * @param {number} baseAmount 基础回复量
 * @param {object} options 配置项
 * @param {boolean} options.bypassWeather 是否跳过天气减半（用于治愈之愿等）
 * @param {string} options.source 回复来源（用于日志，如 'leftovers', 'drain', 'ability'）
 * @returns {number} 实际回复量
 */
export function applyHeal(pokemon, baseAmount, options = {}) {
    if (!pokemon || baseAmount <= 0) return 0;
    
    const maxHeal = pokemon.maxHp - pokemon.currHp;
    if (maxHeal <= 0) return 0;
    
    let actualHeal = Math.min(baseAmount, maxHeal);
    let totalMult = 1;
    
    // 1. 应用 Smog 化学屏障减半（除非 bypassWeather = true）
    if (!options.bypassWeather && typeof window !== 'undefined' && window.battle) {
        const weather = window.battle.weather;
        const weatherMult = getHealingMultiplier(weather);
        if (weatherMult !== 1) {
            totalMult *= weatherMult;
        }
    }
    
    // 2. 【环境图层系统】应用环境回复修正
    if (!options.bypassEnv && typeof window !== 'undefined' && window.envOverlay) {
        const envMult = window.envOverlay.getHealMod(pokemon);
        if (envMult !== 1) {
            totalMult *= envMult;
        }
    }
    
    // 应用总倍率
    if (totalMult !== 1) {
        actualHeal = Math.floor(baseAmount * totalMult);
        actualHeal = Math.min(actualHeal, maxHeal);
        if (options.source) {
            console.log(`[HEAL MOD] ${options.source} 回复量 ${baseAmount} -> ${actualHeal} (x${totalMult.toFixed(2)})`);
        } else {
            console.log(`[HEAL MOD] 回复量 ${baseAmount} -> ${actualHeal} (x${totalMult.toFixed(2)})`);
        }
    }
    
    // 应用回复
    pokemon.currHp = Math.min(pokemon.maxHp, pokemon.currHp + actualHeal);
    
    return actualHeal;
}

// ============================================
// 区域天气专用函数已迁移至 Environment Overlay API
// 参见: systems/environment-overlay.js
// 文档: docs/ENVIRONMENT_OVERLAY_TEMPLATES.md
// 
// 已删除的硬编码天气函数：
// - Smog (烟霾) 相关函数
// - Ashfall (火山灰) 相关函数
// - Shadow Fog (暗影迷雾) 相关函数
// - Gale (香风) 相关函数
// 
// 这些天气效果现在通过 environment.overlay 系统实现
// ============================================

/**
 * 检查宝可梦是否接地（通用函数，用于地面招式判定等）
 * @param {object} pokemon 宝可梦对象
 * @returns {boolean} 是否接地
 */
export function isGrounded(pokemon) {
    if (!pokemon) return false;
    
    const types = pokemon.types || [];
    const abilityId = (pokemon.ability || '').toLowerCase().replace(/[^a-z]/g, '');
    const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 飞行系不接地
    if (types.includes('Flying')) return false;
    
    // 漂浮特性不接地
    if (abilityId === 'levitate') return false;
    
    // 气球不接地
    if (itemId === 'airballoon') return false;
    
    // 电磁浮游状态不接地
    if (pokemon.volatile?.magnetrise) return false;
    
    // 顺风飞翔状态不接地
    if (pokemon.volatile?.telekinesis) return false;
    
    return true;
}

// ============================================
// Gale 极速解冻已迁移至 Environment Overlay API
// 使用 envOverlay.getStatusEffects().cureStatus 检查
// ============================================

// ============================================
// Ambrosia (神之琼浆 - C区神秘区) 辅助函数
// ============================================

/**
 * 获取唯心实体化的全员暴击加成
 * @param {string} weather 天气 ID
 * @returns {number} 暴击等级加成 (0 = 无加成, 1 = +1)
 */
export function getPsychicMindCritBoost(weather) {
    const config = getWeatherConfig(weather);
    if (!config?.effects?.psychicMind) return 0;
    
    const boost = config.effects.psychicMind.critBoost || 0;
    if (boost > 0) {
        console.log(`[AMBROSIA] 🌸 唯心实体化：全员暴击率 +${boost}`);
    }
    return boost;
}

/**
 * 获取 AVS 羁绊系统倍率
 * @param {string} weather 天气 ID
 * @returns {number} AVS 触发率倍率 (1 = 无修正, 2 = 双倍)
 */
export function getAVSMultiplier(weather) {
    const config = getWeatherConfig(weather);
    if (!config?.effects?.avsMultiplier) return 1;
    
    const rate = config.effects.avsMultiplier.rate || 1;
    if (rate > 1) {
        console.log(`[AMBROSIA] 💫 神之琼浆：AVS 羁绊触发率 x${rate}`);
    }
    return rate;
}

/**
 * 检查是否应触发时空醉（使用特殊机制后）
 * @param {string} weather 天气 ID
 * @param {string} mechanicType 机制类型 ('mega', 'zmove', 'dynamax', 'terastal')
 * @param {object} pokemon 使用机制的宝可梦
 * @param {object} trainer 训练家对象（检查 isAdmin）
 * @returns {{ shouldTrigger: boolean, message: string }}
 */
export function checkNeuroBacklash(weather, mechanicType, pokemon, trainer = null) {
    const config = getWeatherConfig(weather);
    if (!config?.effects?.neuroBacklash?.enabled) {
        return { shouldTrigger: false, message: '' };
    }
    
    const nb = config.effects.neuroBacklash;
    
    // Boss 免疫检查
    if (nb.bossImmune && trainer?.isAdmin) {
        console.log(`[AMBROSIA] ⚡ 时空醉：${trainer.name || 'Admin'} 有抗体，免疫时空醉`);
        return { shouldTrigger: false, message: '' };
    }
    
    // 检查触发条件
    if (!nb.triggers.includes(mechanicType)) {
        return { shouldTrigger: false, message: '' };
    }
    
    console.log(`[AMBROSIA] ⚡ 时空醉：${pokemon?.cnName || pokemon?.name} 使用了 ${mechanicType}，下回合将陷入混乱`);
    return { 
        shouldTrigger: true, 
        message: `<span style="color:#e879f9">⚡ 神经负担！${pokemon?.cnName || pokemon?.name} 感到一阵眩晕...</span>`
    };
}

/**
 * 应用时空醉效果（在下回合开始时调用）
 * @param {object} pokemon 宝可梦
 * @returns {{ applied: boolean, message: string }}
 */
export function applyNeuroBacklashConfusion(pokemon) {
    if (!pokemon || !pokemon.volatile?.neuroBacklash) {
        return { applied: false, message: '' };
    }
    
    // 清除标记
    delete pokemon.volatile.neuroBacklash;
    
    // 应用混乱（穿透神秘守护）
    pokemon.volatile = pokemon.volatile || {};
    pokemon.volatile.confusion = Math.floor(Math.random() * 4) + 2; // 2-5 回合
    
    console.log(`[AMBROSIA] ⚡ 时空醉：${pokemon?.cnName || pokemon?.name} 陷入混乱！`);
    return { 
        applied: true, 
        message: `<span style="color:#e879f9">⚡ 时空醉发作！${pokemon?.cnName || pokemon?.name} 陷入了混乱！</span>`
    };
}

/**
 * 检查场地是否应无限持续
 * @param {string} weather 天气 ID
 * @param {string} terrain 场地 ID
 * @returns {boolean} 是否无限持续
 */
export function isTerrainInfinite(weather, terrain) {
    const config = getWeatherConfig(weather);
    if (!config?.effects?.infiniteTerrain) return false;
    
    const affectedTerrains = config.effects.infiniteTerrain.affectedTerrains || [];
    const isInfinite = affectedTerrains.includes(terrain);
    
    if (isInfinite) {
        console.log(`[AMBROSIA] 🌈 无限场地：${terrain} 在神之琼浆中永久持续`);
    }
    return isInfinite;
}

/**
 * 检查污染回火效果
 * @param {string} weather 天气 ID
 * @param {object} move 招式数据
 * @param {object} user 使用者
 * @returns {{ triggered: boolean, effects: { critDrop: number, confusion: boolean }, message: string }}
 */
export function checkContaminationRecoil(weather, move, user) {
    const config = getWeatherConfig(weather);
    if (!config?.effects?.contaminationRecoil?.enabled) {
        return { triggered: false, effects: { critDrop: 0, confusion: false }, message: '' };
    }
    
    const cr = config.effects.contaminationRecoil;
    const moveId = (move?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const fullMoveData = (typeof MOVES !== 'undefined' && MOVES[moveId]) ? MOVES[moveId] : move;
    
    const moveType = fullMoveData?.type || move?.type;
    const basePower = fullMoveData?.basePower || move?.basePower || 0;
    
    // 检查是否为受影响的属性且威力达到阈值
    if (!cr.affectedTypes.includes(moveType) || basePower < cr.powerThreshold) {
        return { triggered: false, effects: { critDrop: 0, confusion: false }, message: '' };
    }
    
    // 触发污染回火
    const effects = {
        critDrop: cr.effects.critDrop || 0,
        confusion: Math.random() < (cr.effects.confusionChance || 0)
    };
    
    let message = `<span style="color:#a855f7">💀 污染回火！${user?.cnName || user?.name} 使用的 ${move.name} 触发了粉雾的排异反应！`;
    if (effects.critDrop < 0) {
        message += ` 暴击率 ${effects.critDrop}！`;
    }
    if (effects.confusion) {
        message += ` 陷入混乱！`;
    }
    message += `</span>`;
    
    console.log(`[AMBROSIA] 💀 污染回火：${user?.cnName || user?.name} 的 ${move.name} (${moveType}/${basePower}威力) 触发反噬`);
    
    return { triggered: true, effects, message };
}

// ============================================
// Chronal Rift (时空裂隙 - S区绝对领域) 辅助函数
// ============================================

/**
 * 检查是否应自动激活悖谬种特性 (Paradox Resonance)
 * @param {string} weather 天气 ID
 * @param {object} pokemon 宝可梦
 * @returns {{ shouldActivate: boolean, ability: string, message: string }}
 */
export function checkParadoxResonance(weather, pokemon) {
    const config = getWeatherConfig(weather);
    if (!config?.effects?.paradoxResonance?.enabled) {
        return { shouldActivate: false, ability: '', message: '' };
    }
    
    const pr = config.effects.paradoxResonance;
    const abilityId = (pokemon?.ability || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (pr.autoActivateAbilities.includes(abilityId)) {
        console.log(`[CHRONAL RIFT] 🌀 古今悖论：${pokemon?.cnName || pokemon?.name} 的 ${pokemon.ability} 自动激活`);
        return {
            shouldActivate: true,
            ability: abilityId,
            message: `<span style="color:#8b5cf6">🌀 时空裂隙共鸣！${pokemon?.cnName || pokemon?.name} 的 ${pokemon.ability} 自动激活！</span>`
        };
    }
    
    return { shouldActivate: false, ability: '', message: '' };
}

/**
 * 检查异兽气场伤害减免 (Beast Aura)
 * @param {string} weather 天气 ID
 * @param {object} defender 防御方
 * @param {object} attacker 攻击方
 * @returns {{ hasAura: boolean, damageMultiplier: number, message: string }}
 */
export function checkBeastAura(weather, defender, attacker) {
    const config = getWeatherConfig(weather);
    if (!config?.effects?.paradoxResonance?.beastAura) {
        return { hasAura: false, damageMultiplier: 1.0, message: '' };
    }
    
    const ba = config.effects.paradoxResonance.beastAura;
    const defenderId = (defender?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const attackerId = (attacker?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 使用 POKEMON_CATEGORIES 检查防御方是否为异兽
    let isUltraBeast = false;
    if (typeof window !== 'undefined' && window.POKEMON_CATEGORIES) {
        isUltraBeast = window.POKEMON_CATEGORIES.isPokemonInCategory(defenderId, 'ultrabeast');
    } else {
        // 降级：检查 tags 或名称
        isUltraBeast = defender?.tags?.some(t => t === 'Ultra Beast') || false;
    }
    
    if (!isUltraBeast) {
        return { hasAura: false, damageMultiplier: 1.0, message: '' };
    }
    
    // 使用 POKEMON_CATEGORIES 检查攻击方是否为免疫来源
    let isImmuneSource = false;
    if (typeof window !== 'undefined' && window.POKEMON_CATEGORIES) {
        const cats = window.POKEMON_CATEGORIES;
        isImmuneSource = cats.isPokemonInCategory(attackerId, 'paradox') ||
                         cats.isPokemonInCategory(attackerId, 'ultrabeast') ||
                         cats.isPokemonInCategory(attackerId, 'hisuian') ||
                         cats.isPokemonInCategory(attackerId, 'origin');
    } else {
        isImmuneSource = attacker?.tags?.some(t => t === 'Paradox' || t === 'Ultra Beast' || t === 'Mythical') || false;
    }
    
    if (isImmuneSource) {
        return { hasAura: false, damageMultiplier: 1.0, message: '' };
    }
    
    const reduction = ba.damageReduction || 0.20;
    console.log(`[CHRONAL RIFT] 🛡️ 异兽气场：${defender?.cnName || defender?.name} 受到的伤害 -${reduction * 100}%`);
    
    return {
        hasAura: true,
        damageMultiplier: 1.0 - reduction,
        message: `<span style="color:#8b5cf6">🛡️ 异兽气场！伤害减少 ${Math.round(reduction * 100)}%！</span>`
    };
}

/**
 * 获取洗翠无法的古武修正 (Unbound Arts)
 * @param {string} weather 天气 ID
 * @param {string} style 'strong' 或 'agile'
 * @param {object} pokemon 使用者
 * @param {object} opponent 对手
 * @returns {{ active: boolean, damageMultiplier: number, accuracyMultiplier: number, priorityMod: number, noCooldown: boolean, message: string }}
 */
export function getUnboundArtsModifier(weather, style, pokemon, opponent) {
    const config = getWeatherConfig(weather);
    if (!config?.effects?.unboundArts?.enabled) {
        return { active: false, damageMultiplier: 1.0, accuracyMultiplier: 1.0, priorityMod: 0, noCooldown: false, message: '' };
    }
    
    const ua = config.effects.unboundArts;
    const op = config.effects.originPulse;
    
    // 使用 POKEMON_CATEGORIES 检查洗翠/起源形态
    const pokemonId = (pokemon?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    let isHisuian = false;
    let isOrigin = false;
    
    if (typeof window !== 'undefined' && window.POKEMON_CATEGORIES) {
        const cats = window.POKEMON_CATEGORIES;
        isHisuian = cats.isPokemonInCategory(pokemonId, 'hisuian');
        isOrigin = cats.isPokemonInCategory(pokemonId, 'origin');
    } else {
        // 降级：使用字符串匹配
        isHisuian = pokemonId.includes('hisui');
        isOrigin = pokemonId.includes('origin');
    }
    const hasOriginBonus = isHisuian || isOrigin;
    
    if (style === 'strong') {
        const ss = ua.strongStyle;
        let accMult = ss.accuracyMultiplier || 0.85;
        
        // 洗翠/起源形态无视命中惩罚
        if (hasOriginBonus && op?.hisuianBonus?.strongStyleIgnoreAccPenalty) {
            accMult = 1.0;
            console.log(`[CHRONAL RIFT] 🌀 起源共鸣：${pokemon?.cnName || pokemon?.name} 刚猛无视命中惩罚`);
        }
        
        return {
            active: true,
            damageMultiplier: ss.damageMultiplier || 1.5,
            accuracyMultiplier: accMult,
            priorityMod: ss.priority || -1,
            noCooldown: ss.noCooldown || true,
            message: `<span style="color:#ef4444">⚔️ 洗翠无法・刚猛！伤害 x${ss.damageMultiplier}${accMult < 1 ? `，命中 x${accMult}` : ''}！</span>`
        };
    }
    
    if (style === 'agile') {
        const as = ua.agileStyle;
        const userSpeed = pokemon?.spe || pokemon?.stats?.spe || 100;
        const oppSpeed = opponent?.spe || opponent?.stats?.spe || 100;
        const isFaster = userSpeed >= oppSpeed;
        
        let powerMult = isFaster ? (as.powerIfFaster || 1.0) : (as.powerIfSlower || 0.9);
        
        // 洗翠/起源形态总是满威力
        if (hasOriginBonus && op?.hisuianBonus?.agileStyleFullPower) {
            powerMult = 1.0;
            console.log(`[CHRONAL RIFT] 🌀 起源共鸣：${pokemon?.cnName || pokemon?.name} 迅疾无视威力削减`);
        }
        
        return {
            active: true,
            damageMultiplier: powerMult,
            accuracyMultiplier: 1.0,
            priorityMod: as.priorityBoost || 1,
            noCooldown: as.noCooldown || true,
            message: `<span style="color:#3b82f6">💨 洗翠无法・迅疾！优先度 +${as.priorityBoost}${powerMult < 1 ? `，威力 x${powerMult}` : ''}！</span>`
        };
    }
    
    return { active: false, damageMultiplier: 1.0, accuracyMultiplier: 1.0, priorityMod: 0, noCooldown: false, message: '' };
}

/**
 * 检查速度熵增效果 (Entropy Flux)
 * @param {string} weather 天气 ID
 * @returns {{ shouldTrigger: boolean, message: string }}
 */
export function checkEntropyFlux(weather) {
    const config = getWeatherConfig(weather);
    if (!config?.effects?.entropyFlux?.enabled) {
        return { shouldTrigger: false, message: '' };
    }
    
    const ef = config.effects.entropyFlux;
    const roll = Math.random();
    
    if (roll < (ef.triggerChance || 0.15)) {
        console.log(`[CHRONAL RIFT] ⚡ 速度熵增：时空翻转触发！(Roll: ${(roll * 100).toFixed(1)}%)`);
        return {
            shouldTrigger: true,
            message: `<span style="color:#a855f7; font-size:1.1em">⚡ 时空翻转！维度的流向瞬间逆转了！</span>`
        };
    }
    
    return { shouldTrigger: false, message: '' };
}

/**
 * 检查技能黑箱效果 (Move Glitch)
 * @param {string} weather 天气 ID
 * @param {object} move 招式
 * @param {object} user 使用者
 * @returns {{ triggered: boolean, effect: 'critical'|'fail'|'normal', powerMultiplier: number, message: string }}
 */
export function checkMoveGlitch(weather, move, user) {
    const config = getWeatherConfig(weather);
    if (!config?.effects?.moveGlitch?.enabled) {
        return { triggered: false, effect: 'normal', powerMultiplier: 1.0, message: '' };
    }
    
    const mg = config.effects.moveGlitch;
    const moveId = (move?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const userId = (user?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 检查是否为受影响的招式
    const isAffectedMove = mg.affectedMoves?.includes(moveId);
    
    // 使用 POKEMON_CATEGORIES 检查宝可梦分类
    // 注意：只有 Artificial 类和 iron 开头的未来悖谬种触发技能黑箱
    // Miraidon/Koraidon 等封面神兽不触发
    let isAffectedPokemon = false;
    if (typeof window !== 'undefined' && window.POKEMON_CATEGORIES) {
        const cats = window.POKEMON_CATEGORIES;
        // 人造/机械类
        isAffectedPokemon = cats.isPokemonInCategory(userId, 'artificial');
        // 未来悖谬种（仅 iron 开头的）
        if (!isAffectedPokemon && userId.startsWith('iron')) {
            isAffectedPokemon = cats.isPokemonInCategory(userId, 'paradox_future');
        }
    } else {
        // 降级：使用硬编码列表
        const artificialList = ['porygon', 'porygon2', 'porygonz', 'magnemite', 'magneton', 'magnezone',
            'genesect', 'metagross', 'magearna', 'rotomheat', 'rotomwash', 'rotomfrost', 'rotomfan', 'rotommow'];
        isAffectedPokemon = artificialList.some(p => userId.includes(p)) || userId.startsWith('iron');
    }
    
    if (!isAffectedMove && !isAffectedPokemon) {
        return { triggered: false, effect: 'normal', powerMultiplier: 1.0, message: '' };
    }
    
    const roll = Math.random();
    
    // 20% 暴击成功
    if (roll < (mg.criticalSuccessChance || 0.20)) {
        const mult = mg.criticalSuccessMultiplier || 2.0;
        console.log(`[CHRONAL RIFT] 💥 技能黑箱：${move.name} 暴走！威力 x${mult}`);
        return {
            triggered: true,
            effect: 'critical',
            powerMultiplier: mult,
            message: `<span style="color:#22c55e">💥 技能黑箱・暴走！${move.name} 的数据溢出！威力 x${mult}！</span>`
        };
    }
    
    // 10% 失败
    if (roll < (mg.criticalSuccessChance || 0.20) + (mg.criticalFailChance || 0.10)) {
        console.log(`[CHRONAL RIFT] ❌ 技能黑箱：${move.name} 崩溃！威力 x0`);
        return {
            triggered: true,
            effect: 'fail',
            powerMultiplier: 0,
            message: `<span style="color:#ef4444">❌ 技能黑箱・崩溃！${move.name} 的数据损坏！招式失败！</span>`
        };
    }
    
    return { triggered: false, effect: 'normal', powerMultiplier: 1.0, message: '' };
}

/**
 * 检查是否为时空裂隙天气
 * @param {string} weather 天气 ID
 * @returns {boolean}
 */
export function isChronalRift(weather) {
    return weather === 'chronalrift';
}

// ============================================
// 环境天气压制系统 (Suppression Tier System)
// ============================================

/**
 * 压制等级常量
 * Tier 1: 无影响 - 宝可梦天气正常覆盖
 * Tier 2: 有抑制 - 宝可梦天气持续回合数减半
 * Tier 3: 绝对领域 - 宝可梦天气技能直接失败
 */
export const SUPPRESSION_TIER = {
    NORMAL: 1,
    SUPPRESSED: 2,
    ABSOLUTE: 3
};

/**
 * 获取环境天气的压制等级 (旧版兼容)
 * @param {object} battle 战斗实例
 * @returns {number} 压制等级 (1/2/3)
 * @deprecated 使用 getWeatherSuppressionStatus 代替
 */
export function getEnvironmentSuppressionTier(battle) {
    if (!battle || !battle.environmentWeather) return SUPPRESSION_TIER.NORMAL;
    
    // 优先从 battle.environmentConfig 读取配置
    if (battle.environmentConfig && battle.environmentConfig.suppressionTier) {
        return battle.environmentConfig.suppressionTier;
    }
    
    // 新版格式: suppression 对象
    if (battle.environmentConfig?.suppression?.all === 'blocked') {
        return SUPPRESSION_TIER.ABSOLUTE;
    }
    
    // 默认根据天气类型推断
    const weather = battle.environmentWeather;
    const config = getWeatherConfig(weather);
    
    // 始源天气 = 绝对领域
    if (config?.isPrimal) {
        return SUPPRESSION_TIER.ABSOLUTE;
    }
    
    // 区域天气 = 有抑制
    if (config?.isRegional) {
        return SUPPRESSION_TIER.SUPPRESSED;
    }
    
    // 普通天气 = 无影响
    return SUPPRESSION_TIER.NORMAL;
}

/**
 * 【新版】获取特定天气的压制状态
 * @param {object} battle 战斗实例
 * @param {string} targetWeather 要展开的天气 ID
 * @returns {{ status: 'normal'|'suppressed'|'blocked', reason: string }}
 */
export function getWeatherSuppressionStatus(battle, targetWeather) {
    const normalResult = { status: 'normal', reason: '' };
    
    if (!battle || !battle.environmentWeather) return normalResult;
    
    const envConfig = battle.environmentConfig || {};
    const suppression = envConfig.suppression || {};
    const weatherId = (targetWeather || '').toLowerCase();
    
    // 标准化天气 ID (hail -> snow)
    const normalizedWeather = normalizeWeatherId(weatherId);
    
    // 新版格式: suppression 对象
    // 1. 检查 all 字段 (全局设置)
    if (suppression.all === 'blocked') {
        return { 
            status: 'blocked', 
            reason: `环境天气完全压制所有宝可梦天气` 
        };
    }
    if (suppression.all === 'suppressed') {
        return { 
            status: 'suppressed', 
            reason: `环境天气抑制所有宝可梦天气` 
        };
    }
    
    // 2. 检查 blocked 数组 (完全阻止)
    if (Array.isArray(suppression.blocked)) {
        const blockedList = suppression.blocked.map(w => normalizeWeatherId(w.toLowerCase()));
        if (blockedList.includes(normalizedWeather)) {
            return { 
                status: 'blocked', 
                reason: `${targetWeather} 被环境天气完全阻止` 
            };
        }
    }
    
    // 3. 检查 suppressed 数组 (回合减半)
    if (Array.isArray(suppression.suppressed)) {
        const suppressedList = suppression.suppressed.map(w => normalizeWeatherId(w.toLowerCase()));
        if (suppressedList.includes(normalizedWeather)) {
            return { 
                status: 'suppressed', 
                reason: `${targetWeather} 被环境天气抑制` 
            };
        }
    }
    
    // 4. 旧版兼容: suppressionTier 数字
    if (envConfig.suppressionTier === 3 || envConfig.suppressionTier === SUPPRESSION_TIER.ABSOLUTE) {
        return { 
            status: 'blocked', 
            reason: `环境天气完全压制所有宝可梦天气 (tier 3)` 
        };
    }
    if (envConfig.suppressionTier === 2 || envConfig.suppressionTier === SUPPRESSION_TIER.SUPPRESSED) {
        return { 
            status: 'suppressed', 
            reason: `环境天气抑制所有宝可梦天气 (tier 2)` 
        };
    }
    
    // 5. 默认根据环境天气类型推断
    const envWeatherConfig = getWeatherConfig(battle.environmentWeather);
    if (envWeatherConfig?.isPrimal) {
        return { 
            status: 'blocked', 
            reason: `始源天气完全压制所有宝可梦天气` 
        };
    }
    if (envWeatherConfig?.isRegional) {
        return { 
            status: 'suppressed', 
            reason: `区域天气抑制所有宝可梦天气` 
        };
    }
    
    return normalResult;
}

/**
 * 【核心函数】尝试展开宝可梦天气（统一入口）
 * @param {object} battle 战斗实例
 * @param {string} newWeather 要展开的天气 ID
 * @param {object} options 配置项
 * @param {string} options.itemId 使用者的道具 ID（用于延长岩石判定）
 * @param {string} options.weatherName 天气中文名（用于日志）
 * @param {string} options.visualKey 视觉效果 key（用于 setWeatherVisuals）
 * @returns {{ success: boolean, logs: string[], weatherTurns: number }}
 */
export function tryDeployWeather(battle, newWeather, options = {}) {
    const logs = [];
    
    // 【新版】使用按天气的压制状态检查
    const suppressionStatus = getWeatherSuppressionStatus(battle, newWeather);
    
    // blocked: 完全阻止
    if (suppressionStatus.status === 'blocked') {
        const envConfig = getWeatherConfig(battle.environmentWeather);
        const envName = envConfig?.name || battle.environmentWeather;
        logs.push(`<span style="color:#dc2626">⛔ ${envName}的力量太过强大，${options.weatherName || newWeather}无法生效！</span>`);
        console.log(`[WEATHER] ${newWeather} blocked: ${suppressionStatus.reason}`);
        return { success: false, logs, weatherTurns: 0 };
    }
    
    // 检查是否已经是该天气
    const sameWeatherMap = {
        'rain': ['rain', 'heavyrain'],
        'sun': ['sun', 'harshsun'],
        'sandstorm': ['sandstorm'],
        'hail': ['hail', 'snow'],
        'snow': ['snow', 'hail']
    };
    const sameWeathers = sameWeatherMap[newWeather] || [newWeather];
    if (sameWeathers.includes(battle.weather)) {
        logs.push('<span style="color:#e74c3c">但是失败了！</span>');
        return { success: false, logs, weatherTurns: 0 };
    }
    
    // 计算持续回合
    const rockMap = {
        'rain': 'damprock',
        'sun': 'heatrock',
        'sandstorm': 'smoothrock',
        'hail': 'icyrock',
        'snow': 'icyrock'
    };
    const extendRock = rockMap[newWeather];
    const itemId = (options.itemId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    let baseTurns = (extendRock && itemId === extendRock) ? 8 : 5;
    let finalTurns = baseTurns;
    
    // suppressed: 回合数减半
    if (suppressionStatus.status === 'suppressed') {
        finalTurns = Math.floor(baseTurns / 2);
        const weatherName = options.weatherName || newWeather;
        logs.push(`<span style="color:#f59e0b">⚠️ 环境天气的压制使${weatherName}持续时间减半！(${baseTurns}→${finalTurns}回合)</span>`);
    }
    
    // 设置天气
    battle.weather = newWeather;
    battle.weatherTurns = finalTurns;
    
    // 更新视觉效果
    const visualKey = options.visualKey || newWeather;
    if (typeof window !== 'undefined' && window.setWeatherVisuals) {
        window.setWeatherVisuals(visualKey);
    }
    
    console.log(`[WEATHER] Deployed ${newWeather}: ${finalTurns} turns (status=${suppressionStatus.status})`);
    return { success: true, logs, weatherTurns: finalTurns };
}

/**
 * 获取天气回归时的日志消息
 * @param {object} battle 战斗实例
 * @returns {string} 回归日志
 */
export function getWeatherRevertMessage(battle) {
    if (!battle || !battle.environmentWeather) return '';
    
    // 优先使用自定义消息
    if (battle.environmentConfig && battle.environmentConfig.revertMessage) {
        return battle.environmentConfig.revertMessage;
    }
    
    // 默认消息
    const config = getWeatherConfig(battle.environmentWeather);
    const envName = config?.name || battle.environmentWeather;
    
    if (config?.isRegional) {
        return `<span style="color:#9b59b6">🌍 自然的恶意压倒了强行改变的气象，${envName}再次笼罩了战场！</span>`;
    }
    
    return `<span style="color:#9b59b6">🌍 环境天气回归：${envName}！</span>`;
}

// ============================================
// 导出到全局
// ============================================

if (typeof window !== 'undefined') {
    window.WeatherEffects = {
        normalizeWeatherId,
        getWeatherConfig,
        isPrimalWeather,
        getPrimalWeathers,
        isWeatherDamageImmune,
        getWeatherDamage,
        getWeatherDamageLog,
        getWeatherPowerModifier,
        getWeatherAccuracyModifier,
        getWeatherDefenseBoost,
        checkWeatherBlocksMove,
        canUseAuroraVeil,
        isSolarBeamInstant,
        getWeatherBallStats,
        getRecoveryRatio,
        // 通用函数
        getHealingMultiplier,
        applyHeal,  // 【统一治愈函数】所有回复来源都应使用此函数
        isGrounded, // 检查宝可梦是否接地
        // Ambrosia (神之琼浆) 专用函数
        getPsychicMindCritBoost,
        getAVSMultiplier,
        checkNeuroBacklash,
        applyNeuroBacklashConfusion,
        isTerrainInfinite,
        checkContaminationRecoil,
        // Chronal Rift (时空裂隙) 专用函数
        isChronalRift,
        checkParadoxResonance,
        checkBeastAura,
        getUnboundArtsModifier,
        checkEntropyFlux,
        checkMoveGlitch,
        // 压制系统
        SUPPRESSION_TIER,
        getEnvironmentSuppressionTier,  // 旧版兼容
        getWeatherSuppressionStatus,    // 新版：按天气检查压制状态
        tryDeployWeather,  // 统一入口函数
        getWeatherRevertMessage,
        WEATHER_CONFIG
    };
}
