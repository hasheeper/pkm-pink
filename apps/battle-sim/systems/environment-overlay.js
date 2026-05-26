/**
 * ===========================================
 * ENVIRONMENT OVERLAY SYSTEM - 环境图层系统
 * ===========================================
 * 
 * 核心理念: 让 AI 用"文学描述"生成"数学原子"，JS 引擎只负责执行
 * 
 * 三大原子类型:
 * - A类: 数值修正 (Stat Mod) - Atk/Def/SpA/SpD/Spd/Acc/Crit/Dmg × N
 * - B类: 资源跳动 (HP/Resource) - HP ± N% 每回合
 * - C类: 类型与免控 (Tags) - Immune/Weak/Ban/Grant
 * 
 * JSON 协议示例:
 * {
 *   "env_id": "radiation_rain",
 *   "env_name": "辐射酸雨",
 *   "narrative": "腐蚀性的绿色酸雨从天而降...",
 *   "duration": 5,
 *   "rules": [
 *     { "target": "Type:Steel", "eff": ["Def:0.7", "HP:-0.125"] },
 *     { "target": "Type:Poison", "eff": ["Spd:1.5", "HP:0.06"] },
 *     { "target": "MoveType:Fire", "eff": ["Dmg:0.5"] }
 *   ]
 * }
 */

// ============================================
// 环境图层管理器
// ============================================

class EnvironmentOverlay {
    constructor() {
        this.activeEnvs = [];      // 当前激活的环境列表
        this.envCounter = 0;       // 环境 ID 计数器
        
        // 效果原子别名映射 (支持模糊匹配)
        this.statAliases = {
            // 攻击
            'atk': 'atk', 'attack': 'atk', '攻击': 'atk', '物攻': 'atk',
            // 防御
            'def': 'def', 'defense': 'def', '防御': 'def', '物防': 'def',
            // 特攻
            'spa': 'spa', 'spatk': 'spa', 'specialattack': 'spa', '特攻': 'spa',
            // 特防
            'spd': 'spd', 'spdef': 'spd', 'specialdefense': 'spd', '特防': 'spd',
            // 速度
            'spe': 'spe', 'spd': 'spe', 'speed': 'spe', '速度': 'spe',
            // 命中
            'acc': 'accuracy', 'accuracy': 'accuracy', '命中': 'accuracy',
            // 暴击
            'crit': 'crit', 'critical': 'crit', '暴击': 'crit',
            // 伤害
            'dmg': 'dmg', 'damage': 'dmg', '伤害': 'dmg', '威力': 'dmg',
            // HP
            'hp': 'hp', '血量': 'hp', '生命': 'hp'
        };
        
        // 属性别名映射
        this.typeAliases = {
            'normal': 'Normal', '一般': 'Normal',
            'fire': 'Fire', '火': 'Fire',
            'water': 'Water', '水': 'Water',
            'electric': 'Electric', '电': 'Electric',
            'grass': 'Grass', '草': 'Grass',
            'ice': 'Ice', '冰': 'Ice',
            'fighting': 'Fighting', '格斗': 'Fighting',
            'poison': 'Poison', '毒': 'Poison',
            'ground': 'Ground', '地面': 'Ground',
            'flying': 'Flying', '飞行': 'Flying',
            'psychic': 'Psychic', '超能': 'Psychic',
            'bug': 'Bug', '虫': 'Bug',
            'rock': 'Rock', '岩石': 'Rock',
            'ghost': 'Ghost', '幽灵': 'Ghost',
            'dragon': 'Dragon', '龙': 'Dragon',
            'dark': 'Dark', '恶': 'Dark',
            'steel': 'Steel', '钢': 'Steel',
            'fairy': 'Fairy', '妖精': 'Fairy'
        };
    }
    
    // ============================================
    // 核心 API
    // ============================================
    
    /**
     * 注入新环境
     * @param {Object|string} envJSON - 环境 JSON 对象或字符串
     * @returns {Object} 解析后的环境对象
     */
    inject(envJSON) {
        const env = this.parse(envJSON);
        if (!env) {
            console.error('[ENV OVERLAY] 环境解析失败');
            return null;
        }
        
        // 分配唯一 ID
        env._id = ++this.envCounter;
        env._startTurn = this._getCurrentTurn();
        
        this.activeEnvs.push(env);
        console.log(`[ENV OVERLAY] ✨ 环境注入: ${env.env_name || env.env_id || 'Unknown'}`);
        console.log(`[ENV OVERLAY] 规则数: ${env.rules?.length || 0}`);
        
        return env;
    }
    
    /**
     * 移除环境
     * @param {number|string} envIdOrIndex - 环境 ID 或索引
     */
    remove(envIdOrIndex) {
        if (typeof envIdOrIndex === 'number' && envIdOrIndex < 100) {
            // 按索引移除
            this.activeEnvs.splice(envIdOrIndex, 1);
        } else {
            // 按 ID 移除
            this.activeEnvs = this.activeEnvs.filter(e => e._id !== envIdOrIndex && e.env_id !== envIdOrIndex);
        }
    }
    
    /**
     * 清空所有环境
     */
    clear() {
        this.activeEnvs = [];
        console.log('[ENV OVERLAY] 所有环境已清空');
    }
    
    // ============================================
    // JSON 解析器 (容错设计)
    // ============================================
    
    /**
     * 解析环境 JSON
     * @param {Object|string} input - JSON 对象或字符串
     * @returns {Object|null} 解析后的环境对象
     */
    parse(input) {
        let json;
        
        // 字符串解析
        if (typeof input === 'string') {
            try {
                // 尝试提取 JSON 块 (支持 AI 输出中的 ```json ... ```)
                const jsonMatch = input.match(/```(?:json)?\s*([\s\S]*?)```/);
                const jsonStr = jsonMatch ? jsonMatch[1] : input;
                json = JSON.parse(jsonStr.trim());
            } catch (e) {
                console.error('[ENV OVERLAY] JSON 解析失败:', e.message);
                return null;
            }
        } else {
            json = input;
        }
        
        if (!json || typeof json !== 'object') {
            return null;
        }
        
        // 构建标准化环境对象
        const env = {
            env_id: json.env_id || json.id || `env_${Date.now()}`,
            env_name: json.env_name || json.name || json.env_ui_name || '未知环境',
            narrative: json.narrative || json.description || '',
            duration: json.duration ?? 0,  // 0 = 永久
            rules: []
        };
        
        // 解析规则
        const rawRules = json.rules || json.effects || [];
        for (const rule of rawRules) {
            const parsed = this._parseRule(rule);
            if (parsed) {
                env.rules.push(parsed);
            }
        }
        
        return env;
    }
    
    /**
     * 解析单条规则
     * @private
     */
    _parseRule(rule) {
        if (!rule) return null;
        
        const parsed = {
            target: this._normalizeTarget(rule.target || 'ALL'),
            effects: {
                statMods: {},    // { atk: 1.5, def: 0.7 }
                hpChange: 0,     // 每回合 HP 变化 (正数回血，负数扣血)
                hpOnce: 0,       // 一次性 HP 变化
                dmgMod: 1,       // 伤害倍率
                accMod: 1,       // 命中倍率
                critMod: 1,      // 暴击倍率
                critStage: 0,    // 暴击等级加成 (+1, +2, -1)
                evasionStage: 0, // 闪避等级加成 (+1, +2, -1)
                priorityMod: 0,  // 优先度修正 (+1, -1)
                healMod: 1,      // 回复效果倍率 (<1 减弱, >1 增强)
                immuneTypes: [], // 免疫属性
                weakTypes: [],   // 追加弱点
                banTypes: [],    // 禁用属性
                banMoves: [],    // 禁用技能
                banItems: [],    // 禁用道具
                grantTypes: [],  // 获得属性
                drainMod: 1,     // 吸血效率修正 (<1 减弱, >1 增强)
                // 环境反伤 (对目标造成概率反伤)
                envRecoil: null, // { chance: 0.3, damage: 0.1 } = 30%概率造成10%maxHP反伤
                // 状态效果
                inflictStatus: null,     // 施加状态: 'burn'/'poison'/'paralysis'/'freeze'/'sleep'/'confusion'/'toxic'
                inflictChance: 0,        // 施加概率 (0-1)
                immuneStatus: [],        // 免疫状态列表
                cureStatus: [],          // 治愈状态列表: [{status: 'frz', chance: 0.5}]
                preventStatus: []        // 阻止施加的状态列表
            }
        };
        
        // 解析效果数组
        const effs = rule.eff || rule.effects || rule.effect_atoms || [];
        const effArray = Array.isArray(effs) ? effs : [effs];
        
        for (const eff of effArray) {
            this._parseEffect(eff, parsed.effects);
        }
        
        return parsed;
    }
    
    /**
     * 解析单个效果原子
     * @private
     */
    _parseEffect(eff, effects) {
        if (!eff || typeof eff !== 'string') return;
        
        // 格式: "Stat:Value" 或 "Stat * Value" 或 "Stat x Value"
        // 例如: "Atk:1.5", "HP:-0.125", "Immune:Ground", "Ban:Flying"
        
        const normalized = eff.trim().toLowerCase();
        
        // 【优先处理】匹配环境反伤: "Recoil:0.3" 或 "Recoil:0.5:0.15"
        // 必须在通用 stat:value 匹配之前处理，否则会被错误匹配
        const recoilMatch = normalized.match(/^(recoil|反伤)\s*[:：]\s*([\d.]+)(?:\s*[:：]\s*([\d.]+))?$/i);
        if (recoilMatch) {
            const [, , chanceStr, damageStr] = recoilMatch;
            const chance = Math.max(0, Math.min(1, parseFloat(chanceStr)));
            const damage = damageStr ? Math.max(0, Math.min(0.5, parseFloat(damageStr))) : 0.1; // 默认10%
            effects.envRecoil = { chance, damage };
            console.log(`[ENV OVERLAY] 解析环境反伤: chance=${chance}, damage=${damage}`);
            return;
        }
        
        // 【优先处理】匹配吸血效率: "Drain:0.5" 或 "DrainMod:1.5"
        const drainMatch = normalized.match(/^(drain|drainmod|吸血)\s*[:：]\s*([\d.]+)$/i);
        if (drainMatch) {
            const [, , valueStr] = drainMatch;
            effects.drainMod = Math.max(0, Math.min(3, parseFloat(valueStr)));
            console.log(`[ENV OVERLAY] 解析吸血效率: ${effects.drainMod}`);
            return;
        }
        
        // 匹配 "stat:value" 或 "stat*value" 或 "stat x value"
        const match = normalized.match(/^([a-z\u4e00-\u9fa5]+)\s*[:*x×]\s*(-?[\d.]+)(:once)?$/i);
        
        if (match) {
            const [, statRaw, valueStr, once] = match;
            const stat = this._normalizeStat(statRaw);
            const value = parseFloat(valueStr);
            
            if (isNaN(value)) return;
            
            // HP 变化特殊处理：允许负值（扣血），范围 -0.5 ~ 0.5
            if (stat === 'hp') {
                const clampedHP = Math.max(-0.5, Math.min(0.5, value));
                if (once) {
                    effects.hpOnce = clampedHP;
                } else {
                    effects.hpChange = clampedHP;
                }
                return;
            }
            
            // 其他数值限制 (防止破坏平衡)
            const clampedValue = Math.max(0.1, Math.min(10, value));
            
            if (stat === 'dmg') {
                effects.dmgMod = clampedValue;
            } else if (stat === 'accuracy') {
                effects.accMod = clampedValue;
            } else if (stat === 'crit') {
                effects.critMod = clampedValue;
            } else if (stat === 'heal' || stat === '回复' || stat === '治愈') {
                // 回复效果修正: Heal:0.5 = 回复减半, Heal:1.5 = 回复增强
                effects.healMod = clampedValue;
            } else if (['atk', 'def', 'spa', 'spd', 'spe'].includes(stat)) {
                effects.statMods[stat] = clampedValue;
            }
            return;
        }
        
        // 匹配类型效果: "Immune:Type", "Weak:Type", "Ban:Type", "Grant:Type"
        const typeMatch = normalized.match(/^(immune|weak|ban|grant|禁用|免疫|弱点|获得)\s*[:：]\s*(.+)$/i);
        if (typeMatch) {
            const [, action, typeRaw] = typeMatch;
            const type = this._normalizeType(typeRaw);
            
            if (!type) return;
            
            const actionLower = action.toLowerCase();
            if (actionLower === 'immune' || actionLower === '免疫') {
                effects.immuneTypes.push(type);
            } else if (actionLower === 'weak' || actionLower === '弱点') {
                effects.weakTypes.push(type);
            } else if (actionLower === 'ban' || actionLower === '禁用') {
                // 判断是禁用属性还是禁用技能
                if (this.typeAliases[typeRaw.toLowerCase()]) {
                    effects.banTypes.push(type);
                } else {
                    effects.banMoves.push(typeRaw);
                }
            } else if (actionLower === 'grant' || actionLower === '获得') {
                effects.grantTypes.push(type);
            }
            return;
        }
        
        // 匹配道具禁用: "BanItem:Leftovers" 或 "BanItem:Berry"
        const banItemMatch = normalized.match(/^(banitem|禁用道具)\s*[:：]\s*(.+)$/i);
        if (banItemMatch) {
            const [, , itemRaw] = banItemMatch;
            effects.banItems.push(itemRaw.toLowerCase().replace(/[^a-z0-9]/g, ''));
            return;
        }
        
        // 匹配类型转换: "ToType:Src>Dest" (例如 "ToType:Normal>Electric")
        const toTypeMatch = normalized.match(/^totype\s*[:：]\s*(\w+)\s*[>→]\s*(\w+)$/i);
        if (toTypeMatch) {
            const [, srcRaw, destRaw] = toTypeMatch;
            const srcType = this._normalizeType(srcRaw);
            const destType = this._normalizeType(destRaw);
            
            if (srcType && destType) {
                if (!effects.typeConversions) {
                    effects.typeConversions = [];
                }
                effects.typeConversions.push({ from: srcType, to: destType });
            }
            return;
        }
        
        // 匹配状态施加: "Status:burn:0.2" 或 "Inflict:poison:0.3"
        // 格式: Status:状态名:概率 (概率可选，默认1.0)
        const statusMatch = normalized.match(/^(status|inflict|施加)\s*[:：]\s*(\w+)(?:\s*[:：]\s*([\d.]+))?$/i);
        if (statusMatch) {
            const [, , statusRaw, chanceStr] = statusMatch;
            const status = this._normalizeStatus(statusRaw);
            if (status) {
                effects.inflictStatus = status;
                effects.inflictChance = chanceStr ? Math.min(1, Math.max(0, parseFloat(chanceStr))) : 1.0;
            }
            return;
        }
        
        // 匹配状态免疫: "ImmuneStatus:burn" 或 "NoStatus:poison"
        const immuneStatusMatch = normalized.match(/^(immunestatus|nostatus|免疫状态)\s*[:：]\s*(\w+)$/i);
        if (immuneStatusMatch) {
            const [, , statusRaw] = immuneStatusMatch;
            const status = this._normalizeStatus(statusRaw);
            if (status) {
                effects.immuneStatus.push(status);
            }
            return;
        }
        
        // 匹配状态治愈: "Cure:burn" 或 "Cure:freeze:0.5" (带概率) 或 "CureStatus:all"
        const cureMatch = normalized.match(/^(cure|curestatus|治愈)\s*[:：]\s*(\w+)(?:\s*[:：]\s*([0-9.]+))?$/i);
        if (cureMatch) {
            const [, , statusRaw, chanceStr] = cureMatch;
            const chance = chanceStr ? parseFloat(chanceStr) : 1.0; // 默认 100% 治愈
            
            if (statusRaw.toLowerCase() === 'all') {
                const allStatuses = ['brn', 'psn', 'tox', 'par', 'frz', 'slp', 'confusion'];
                allStatuses.forEach(s => effects.cureStatus.push({ status: s, chance }));
            } else {
                const status = this._normalizeStatus(statusRaw);
                if (status) {
                    effects.cureStatus.push({ status, chance });
                }
            }
            return;
        }
        
        // 匹配阻止状态: "Prevent:freeze" 或 "Block:burn"
        const preventMatch = normalized.match(/^(prevent|block|阻止)\s*[:：]\s*(\w+)$/i);
        if (preventMatch) {
            const [, , statusRaw] = preventMatch;
            const status = this._normalizeStatus(statusRaw);
            if (status) {
                effects.preventStatus.push(status);
            }
            return;
        }
        
        // 匹配暴击等级: "CritStage:+1" 或 "Crit:+2"
        const critStageMatch = normalized.match(/^(critstage|暴击等级)\s*[:：]\s*([+-]?\d+)$/i);
        if (critStageMatch) {
            const [, , stageStr] = critStageMatch;
            effects.critStage = Math.max(-6, Math.min(6, parseInt(stageStr)));
            return;
        }
        
        // 匹配闪避等级: "Evasion:+1" 或 "Eva:+2"
        const evasionMatch = normalized.match(/^(evasion|eva|evasionstage|闪避|闪避等级)\s*[:：]\s*([+-]?\d+)$/i);
        if (evasionMatch) {
            const [, , stageStr] = evasionMatch;
            effects.evasionStage = Math.max(-6, Math.min(6, parseInt(stageStr)));
            return;
        }
        
        // 匹配优先度: "Priority:+1" 或 "Pri:-1"
        const priorityMatch = normalized.match(/^(priority|pri|优先度)\s*[:：]\s*([+-]?\d+)$/i);
        if (priorityMatch) {
            const [, , prioStr] = priorityMatch;
            effects.priorityMod = Math.max(-7, Math.min(7, parseInt(prioStr)));
            return;
        }
        
        // 未识别的效果
        console.warn(`[ENV OVERLAY] ⚠️ 无法解析效果: "${eff}"`);
    }
    
    /**
     * 标准化状态名
     * @private
     */
    _normalizeStatus(raw) {
        if (!raw) return null;
        const key = raw.toString().trim().toLowerCase();
        
        // 返回引擎使用的标准状态名 (brn, psn, tox, par, frz, slp)
        const statusAliases = {
            // 灼伤 -> brn
            'burn': 'brn', 'brn': 'brn', '灼伤': 'brn', '烧伤': 'brn',
            // 中毒 -> psn
            'poison': 'psn', 'psn': 'psn', '中毒': 'psn',
            // 剧毒 -> tox
            'toxic': 'tox', 'tox': 'tox', 'badpoison': 'tox', '剧毒': 'tox',
            // 麻痹 -> par
            'paralysis': 'par', 'par': 'par', 'paralyze': 'par', '麻痹': 'par',
            // 冰冻 -> frz
            'freeze': 'frz', 'frz': 'frz', 'frozen': 'frz', '冰冻': 'frz', '冻结': 'frz',
            // 睡眠 -> slp
            'sleep': 'slp', 'slp': 'slp', '睡眠': 'slp',
            // 混乱 -> confusion (volatile, 不是主状态)
            'confusion': 'confusion', 'confuse': 'confusion', 'cnf': 'confusion', '混乱': 'confusion'
        };
        
        return statusAliases[key] || null;
    }
    
    /**
     * 标准化目标选择器
     * @private
     * 
     * 支持组合选择器 (AND 逻辑):
     * - "MoveType:Water+Flag:Contact" = 水系接触技能
     * - "Type:Fire+HasAbility:FlashFire" = 火系且有引火特性
     * - "Side:Player+Type:Ghost" = 玩家方的幽灵系
     */
    _normalizeTarget(target) {
        if (!target) return { type: 'all' };
        
        const t = target.toString().trim();
        
        // 检查组合选择器 (OR 逻辑，用 | 或 , 连接) - 优先级高于 AND
        // 例如: "Type:Poison|Type:Steel|Type:Electric" = 毒系或钢系或电系
        if (t.includes('|') || (t.includes(',') && !t.includes('+'))) {
            const parts = t.split(/[|,]/).map(p => p.trim()).filter(p => p);
            if (parts.length > 1) {
                const conditions = parts.map(p => this._normalizeTarget(p));
                return { type: 'or', conditions };
            }
        }
        
        // 检查组合选择器 (AND 逻辑，用 + 或 & 连接)
        // 例如: "MoveType:Water+Flag:Contact" = 水系且接触
        if (t.includes('+') || t.includes('&')) {
            const parts = t.split(/[+&]/).map(p => p.trim()).filter(p => p);
            if (parts.length > 1) {
                const conditions = parts.map(p => this._normalizeTarget(p));
                return { type: 'and', conditions };
            }
        }
        
        // ALL
        if (t.toUpperCase() === 'ALL' || t === '全部' || t === '所有') {
            return { type: 'all' };
        }
        
        // Type:X
        const typeMatch = t.match(/^type\s*[:：]\s*(.+)$/i);
        if (typeMatch) {
            return { type: 'pokemonType', value: this._normalizeType(typeMatch[1]) };
        }
        
        // MoveType:X
        const moveTypeMatch = t.match(/^movetype\s*[:：]\s*(.+)$/i);
        if (moveTypeMatch) {
            return { type: 'moveType', value: this._normalizeType(moveTypeMatch[1]) };
        }
        
        // Side:Player / Side:Enemy
        const sideMatch = t.match(/^side\s*[:：]\s*(player|enemy|玩家|敌方)$/i);
        if (sideMatch) {
            const side = sideMatch[1].toLowerCase();
            return { type: 'side', value: (side === 'player' || side === '玩家') ? 'player' : 'enemy' };
        }
        
        // NOT:X
        const notMatch = t.match(/^not\s*[:：]\s*(.+)$/i);
        if (notMatch) {
            const inner = this._normalizeTarget(notMatch[1]);
            return { type: 'not', inner };
        }
        
        // HasAbility:X
        const abilityMatch = t.match(/^hasability\s*[:：]\s*(.+)$/i);
        if (abilityMatch) {
            return { type: 'hasAbility', value: abilityMatch[1] };
        }
        
        // Flag:X (技能标记，如 Contact, Pulse, Sound, Punch, Bite, Slicing, Bullet)
        const flagMatch = t.match(/^flag\s*[:：]\s*(.+)$/i);
        if (flagMatch) {
            return { type: 'moveFlag', value: flagMatch[1].toLowerCase().trim() };
        }
        
        // HasItem:X (持有道具)
        const itemMatch = t.match(/^hasitem\s*[:：]\s*(.+)$/i);
        if (itemMatch) {
            return { type: 'hasItem', value: itemMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '') };
        }
        
        // Grounded (接地)
        if (t.toLowerCase() === 'grounded' || t === '接地') {
            return { type: 'grounded' };
        }
        
        // 默认当作属性处理
        const maybeType = this._normalizeType(t);
        if (maybeType) {
            return { type: 'pokemonType', value: maybeType };
        }
        
        return { type: 'all' };
    }
    
    /**
     * 标准化属性名
     * @private
     */
    _normalizeType(raw) {
        if (!raw) return null;
        const key = raw.toString().trim().toLowerCase();
        return this.typeAliases[key] || (key.charAt(0).toUpperCase() + key.slice(1));
    }
    
    /**
     * 标准化能力名
     * @private
     */
    _normalizeStat(raw) {
        if (!raw) return null;
        const key = raw.toString().trim().toLowerCase();
        return this.statAliases[key] || key;
    }
    
    /**
     * 获取当前回合数
     * @private
     */
    _getCurrentTurn() {
        if (typeof window !== 'undefined' && window.battle) {
            return window.battle.turn || 0;
        }
        return 0;
    }
    
    // ============================================
    // 效果查询 API (供引擎调用)
    // ============================================
    
    /**
     * 获取宝可梦的数值修正
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {string} statName - 能力名 (atk/def/spa/spd/spe)
     * @returns {number} 倍率 (默认 1, 范围 0.1 ~ 6.0)
     * 
     * 【叠加规则】多重环境采用乘算叠加 (Multiplicative Stacking)
     * 例如: 环境A Atk:2.0 + 环境B Atk:0.5 = 2.0 * 0.5 = 1.0
     */
    getStatMod(pokemon, statName) {
        let multiplier = 1;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, null)) {
                    const mod = rule.effects?.statMods?.[statName];
                    if (mod !== undefined) {
                        multiplier *= mod;
                    }
                }
            }
        }
        
        // 【安全限制】防止极端数值，范围 0.1 ~ 6.0
        return Math.max(0.1, Math.min(6.0, multiplier));
    }
    
    /**
     * 获取技能伤害修正
     * @param {Pokemon} attacker - 攻击方
     * @param {Pokemon} defender - 防御方
     * @param {Object} move - 技能对象
     * @returns {number} 倍率 (默认 1, 范围 0.1 ~ 6.0)
     * 
     * 【叠加规则】多重环境采用乘算叠加 (Multiplicative Stacking)
     */
    getDamageMod(attacker, defender, move) {
        let multiplier = 1;
        const moveType = move?.type || 'Normal';
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                // 检查 MoveType 目标
                if (rule.target?.type === 'moveType') {
                    if (rule.target.value === moveType) {
                        multiplier *= rule.effects?.dmgMod ?? 1;
                    }
                }
                // 检查 MoveFlag 目标 (如 Flag:Contact, Flag:Pulse)
                else if (rule.target?.type === 'moveFlag') {
                    if (this._matchTarget(rule.target, attacker, move)) {
                        multiplier *= rule.effects?.dmgMod ?? 1;
                    }
                }
                // 检查攻击方属性
                else if (this._matchTarget(rule.target, attacker, move)) {
                    multiplier *= rule.effects?.dmgMod ?? 1;
                }
            }
        }
        
        // 【安全限制】防止极端数值，范围 0.1 ~ 6.0
        return Math.max(0.1, Math.min(6.0, multiplier));
    }
    
    /**
     * 获取回合末 HP 变化
     * @param {Pokemon} pokemon - 宝可梦实例
     * @returns {number} HP 变化量 (正数回血，负数扣血，基于 maxHp 的比例)
     */
    getTurnEndHPChange(pokemon) {
        let totalChange = 0;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, null)) {
                    const hpChange = rule.effects?.hpChange ?? 0;
                    if (hpChange !== 0) {
                        totalChange += hpChange;
                    }
                }
            }
        }
        
        // 返回基于 maxHp 的实际变化量
        if (totalChange !== 0 && pokemon.maxHp) {
            return Math.floor(pokemon.maxHp * totalChange);
        }
        
        return 0;
    }
    
    /**
     * 获取命中率修正
     * @param {Pokemon} attacker - 攻击方
     * @param {Object} move - 技能对象
     * @returns {number} 倍率 (默认 1)
     */
    getAccuracyMod(attacker, move) {
        let multiplier = 1;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, attacker, null)) {
                    multiplier *= rule.effects?.accMod ?? 1;
                }
            }
        }
        
        return multiplier;
    }
    
    /**
     * 检查技能是否被禁用
     * @param {Pokemon} pokemon - 使用技能的宝可梦
     * @param {Object} move - 技能对象
     * @returns {boolean} 是否被禁用
     */
    isMoveBanned(pokemon, move) {
        const moveType = move?.type || 'Normal';
        const moveName = move?.name || '';
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                // 全局禁用检查
                if (rule.target?.type === 'all' || this._matchTarget(rule.target, pokemon, null)) {
                    // 检查属性禁用
                    if (rule.effects?.banTypes?.includes(moveType)) {
                        return true;
                    }
                    // 检查技能名禁用
                    const bannedMoves = rule.effects?.banMoves || [];
                    if (bannedMoves.some(m => m.toLowerCase() === moveName.toLowerCase())) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * 获取回复效果修正 (Heal Mod)
     * @param {Pokemon} pokemon - 宝可梦实例
     * @returns {number} 倍率 (默认 1, <1 减弱回复, >1 增强回复)
     */
    getHealMod(pokemon) {
        let multiplier = 1;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, null)) {
                    const mod = rule.effects?.healMod;
                    if (mod !== undefined) {
                        multiplier *= mod;
                    }
                }
            }
        }
        
        // 限制范围 0.1 ~ 3.0
        return Math.max(0.1, Math.min(3.0, multiplier));
    }
    
    /**
     * 获取类型覆盖 (免疫/弱点)
     * @param {Pokemon} pokemon - 宝可梦实例
     * @returns {Object} { immuneTypes: [], weakTypes: [], grantTypes: [] }
     */
    getTypeOverrides(pokemon) {
        const result = {
            immuneTypes: [],
            weakTypes: [],
            grantTypes: []
        };
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, null)) {
                    result.immuneTypes.push(...(rule.effects?.immuneTypes || []));
                    result.weakTypes.push(...(rule.effects?.weakTypes || []));
                    result.grantTypes.push(...(rule.effects?.grantTypes || []));
                }
            }
        }
        
        return result;
    }
    
    /**
     * 检查道具是否被禁用
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {string} itemId - 道具 ID
     * @returns {boolean} 是否被禁用
     */
    isItemBanned(pokemon, itemId) {
        if (!itemId) return false;
        const normalizedItem = itemId.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, null)) {
                    const bannedItems = rule.effects?.banItems || [];
                    // 支持精确匹配和类别匹配 (如 "berry" 匹配所有树果)
                    for (const banned of bannedItems) {
                        if (normalizedItem === banned) {
                            console.log(`[ENV OVERLAY] 🚫 道具禁用: ${pokemon.cnName || pokemon.name} 的 ${itemId} 被禁用 (精确匹配: ${banned})`);
                            return true;
                        }
                        // 类别匹配
                        if (banned === 'berry' && normalizedItem.endsWith('berry')) {
                            console.log(`[ENV OVERLAY] 🚫 道具禁用: ${pokemon.cnName || pokemon.name} 的 ${itemId} 被禁用 (类别匹配: berry)`);
                            return true;
                        }
                        if (banned === 'plate' && normalizedItem.endsWith('plate')) return true;
                        if (banned === 'gem' && normalizedItem.endsWith('gem')) return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * 获取吸血效率修正
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {Object} move - 技能对象 (可选)
     * @returns {number} 倍率 (默认 1, <1 减弱吸血, >1 增强吸血)
     */
    getDrainMod(pokemon, move = null) {
        let multiplier = 1;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, move)) {
                    const mod = rule.effects?.drainMod;
                    if (mod !== undefined) {
                        multiplier *= mod;
                    }
                }
            }
        }
        
        return Math.max(0, Math.min(3.0, multiplier));
    }
    
    /**
     * 获取环境反伤效果 (对攻击方造成概率反伤)
     * @param {Pokemon} attacker - 使用技能的宝可梦
     * @param {Object} move - 技能对象
     * @returns {Object|null} { chance: number, damage: number } 或 null
     */
    getEnvRecoil(attacker, move = null) {
        let result = null;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                const hasRecoil = rule.effects?.envRecoil;
                if (hasRecoil) {
                    const matched = this._matchTarget(rule.target, attacker, move);
                    console.log(`[ENV OVERLAY] 反伤规则检查: target=${JSON.stringify(rule.target)}, move=${move?.name}, moveType=${move?.type}, moveFlags=${JSON.stringify(move?.flags)}, matched=${matched}`);
                    if (matched) {
                        const recoil = rule.effects.envRecoil;
                        // 取最高概率和伤害
                        if (!result) {
                            result = { chance: recoil.chance, damage: recoil.damage };
                        } else {
                            result.chance = Math.max(result.chance, recoil.chance);
                            result.damage = Math.max(result.damage, recoil.damage);
                        }
                    }
                }
            }
        }
        
        return result;
    }
    
    /**
     * 尝试对攻击方施加环境反伤
     * @param {Pokemon} attacker - 使用技能的宝可梦
     * @param {Object} move - 技能对象
     * @returns {Object} { applied: boolean, damage: number, log: string|null }
     */
    tryApplyEnvRecoil(attacker, move = null) {
        const recoilConfig = this.getEnvRecoil(attacker, move);
        
        if (!recoilConfig) {
            return { applied: false, damage: 0, log: null };
        }
        
        const roll = Math.random();
        if (roll >= recoilConfig.chance) {
            console.log(`[ENV OVERLAY] 环境反伤判定失败: ${attacker.cnName || attacker.name}, 概率=${Math.round(recoilConfig.chance * 100)}%, roll=${roll.toFixed(3)}`);
            return { applied: false, damage: 0, log: null };
        }
        
        const damage = Math.floor(attacker.maxHp * recoilConfig.damage);
        const chancePercent = Math.round(recoilConfig.chance * 100);
        const damagePercent = Math.round(recoilConfig.damage * 100);
        
        console.log(`[ENV OVERLAY] 🔥 环境反伤: ${attacker.cnName || attacker.name} 受到 ${damage} 伤害 (${damagePercent}% maxHP), 概率=${chancePercent}%, roll=${roll.toFixed(3)}`);
        
        return {
            applied: true,
            damage: damage,
            log: `${attacker.cnName || attacker.name} 受到环境反伤，损失了 ${damage} HP！`
        };
    }
    
    /**
     * 获取暴击等级加成
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {Object} move - 技能对象 (可选)
     * @returns {number} 暴击等级加成 (-6 ~ +6)
     */
    getCritStage(pokemon, move = null) {
        let stage = 0;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, move)) {
                    stage += rule.effects?.critStage || 0;
                }
            }
        }
        
        return Math.max(-6, Math.min(6, stage));
    }
    
    /**
     * 获取闪避等级加成
     * @param {Pokemon} pokemon - 宝可梦实例
     * @returns {number} 闪避等级加成 (-6 ~ +6)
     */
    getEvasionStage(pokemon) {
        let stage = 0;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, null)) {
                    stage += rule.effects?.evasionStage || 0;
                }
            }
        }
        
        return Math.max(-6, Math.min(6, stage));
    }
    
    /**
     * 获取优先度修正
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {Object} move - 技能对象
     * @returns {number} 优先度修正 (-7 ~ +7)
     */
    getPriorityMod(pokemon, move) {
        let mod = 0;
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, move)) {
                    mod += rule.effects?.priorityMod || 0;
                }
            }
        }
        
        return Math.max(-7, Math.min(7, mod));
    }
    
    /**
     * 获取状态效果 (施加/免疫/治愈/阻止)
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {Object} move - 技能对象 (可选，用于判断招式触发)
     * @returns {Object} { inflict: {status, chance}, immuneStatus: [], cureStatus: [], preventStatus: [] }
     */
    getStatusEffects(pokemon, move = null) {
        const result = {
            inflict: null,       // { status: 'burn', chance: 0.2 }
            immuneStatus: [],    // 免疫的状态列表
            cureStatus: [],      // 治愈的状态列表
            preventStatus: []    // 阻止施加的状态列表
        };
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                if (this._matchTarget(rule.target, pokemon, move)) {
                    // 施加状态
                    if (rule.effects?.inflictStatus && rule.effects?.inflictChance > 0) {
                        // 多个施加效果时，取概率最高的
                        if (!result.inflict || rule.effects.inflictChance > result.inflict.chance) {
                            result.inflict = {
                                status: rule.effects.inflictStatus,
                                chance: rule.effects.inflictChance
                            };
                        }
                    }
                    
                    // 免疫状态
                    result.immuneStatus.push(...(rule.effects?.immuneStatus || []));
                    
                    // 治愈状态 (合并相同状态，取最高概率)
                    const cures = rule.effects?.cureStatus || [];
                    for (const cure of cures) {
                        const existing = result.cureStatus.find(c => c.status === cure.status);
                        if (existing) {
                            existing.chance = Math.max(existing.chance, cure.chance);
                        } else {
                            result.cureStatus.push({ ...cure });
                        }
                    }
                    
                    // 阻止状态
                    result.preventStatus.push(...(rule.effects?.preventStatus || []));
                }
            }
        }
        
        // 去重
        result.immuneStatus = [...new Set(result.immuneStatus)];
        // cureStatus 已在上面去重并合并概率
        result.preventStatus = [...new Set(result.preventStatus)];
        
        return result;
    }
    
    /**
     * 检查是否阻止施加某状态
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {string} status - 状态名
     * @returns {boolean}
     */
    isStatusPrevented(pokemon, status) {
        const effects = this.getStatusEffects(pokemon);
        return effects.preventStatus.includes(status) || effects.immuneStatus.includes(status);
    }
    
    /**
     * 尝试施加环境状态效果
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {Object} move - 技能对象 (可选)
     * @returns {Object|null} { status: string, applied: boolean, log: string } 或 null
     */
    tryInflictStatus(pokemon, move = null) {
        const effects = this.getStatusEffects(pokemon, move);
        
        if (!effects.inflict) return null;
        
        const { status, chance } = effects.inflict;
        
        // 检查是否免疫
        if (this.isStatusPrevented(pokemon, status)) {
            return { status, applied: false, log: `${pokemon.cnName || pokemon.name} 免疫了${this._getStatusName(status)}！` };
        }
        
        // 概率判定
        if (Math.random() < chance) {
            return { status, applied: true, log: `${pokemon.cnName || pokemon.name} 因环境影响陷入了${this._getStatusName(status)}！` };
        }
        
        return null;
    }
    
    /**
     * 获取状态中文名
     * @private
     */
    _getStatusName(status) {
        const names = {
            // 支持新旧两种格式
            'burn': '灼伤', 'brn': '灼伤',
            'poison': '中毒', 'psn': '中毒',
            'toxic': '剧毒', 'tox': '剧毒',
            'paralysis': '麻痹', 'par': '麻痹',
            'freeze': '冰冻', 'frz': '冰冻',
            'sleep': '睡眠', 'slp': '睡眠',
            'confusion': '混乱'
        };
        return names[status] || status;
    }
    
    /**
     * 获取技能类型转换
     * @param {Object} move - 技能对象
     * @returns {string} 转换后的类型，如果没有转换则返回原类型
     * 
     * 用法示例: "ToType:Normal>Electric" 将普通系技能转换为电系
     */
    getMoveTypeConversion(move) {
        const originalType = move?.type || 'Normal';
        
        for (const env of this.activeEnvs) {
            for (const rule of env.rules || []) {
                const conversions = rule.effects?.typeConversions || [];
                for (const conv of conversions) {
                    if (conv.from === originalType) {
                        console.log(`[ENV OVERLAY] 类型转换: ${originalType} → ${conv.to}`);
                        return conv.to;
                    }
                }
            }
        }
        
        return originalType;
    }
    
    // ============================================
    // 目标匹配器
    // ============================================
    
    /**
     * 检查目标是否匹配
     * @param {Object} selector - 目标选择器
     * @param {Pokemon} pokemon - 宝可梦实例
     * @param {Object} move - 技能对象 (可选)
     * @returns {boolean}
     */
    _matchTarget(selector, pokemon, move) {
        if (!selector || !pokemon) return false;
        
        switch (selector.type) {
            case 'all':
                return true;
            
            // 组合选择器 (AND 逻辑)
            case 'and':
                if (!selector.conditions || !Array.isArray(selector.conditions)) return false;
                return selector.conditions.every(cond => this._matchTarget(cond, pokemon, move));
            
            // 组合选择器 (OR 逻辑)
            case 'or':
                if (!selector.conditions || !Array.isArray(selector.conditions)) return false;
                return selector.conditions.some(cond => this._matchTarget(cond, pokemon, move));
                
            case 'pokemonType':
                const pokeTypes = pokemon.types || [];
                return pokeTypes.includes(selector.value);
                
            case 'moveType':
                return move?.type === selector.value;
                
            case 'side':
                // 需要 battle 上下文判断
                if (typeof window !== 'undefined' && window.battle) {
                    const isPlayer = window.battle.playerParty?.includes(pokemon);
                    return selector.value === 'player' ? isPlayer : !isPlayer;
                }
                return false;
                
            case 'not':
                return !this._matchTarget(selector.inner, pokemon, move);
                
            case 'hasAbility':
                const abilityId = (pokemon.ability || '').toLowerCase().replace(/[^a-z]/g, '');
                const targetAbility = (selector.value || '').toLowerCase().replace(/[^a-z]/g, '');
                return abilityId === targetAbility;
            
            case 'moveFlag':
                // 检查技能是否具有指定的 flag (如 contact, pulse, sound, punch, bite, slicing, bullet)
                if (!move) return false;
                const moveFlags = move.flags || {};
                const targetFlag = selector.value;
                return !!moveFlags[targetFlag];
            
            case 'hasItem':
                // 检查宝可梦是否持有指定道具
                const itemId = (pokemon.item || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                return itemId === selector.value;
            
            case 'grounded':
                // 检查宝可梦是否接地
                return this._isGrounded(pokemon);
                
            default:
                return false;
        }
    }
    
    /**
     * 检查宝可梦是否接地
     * @private
     */
    _isGrounded(pokemon) {
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
    // 回合末处理
    // ============================================
    
    /**
     * 处理回合末效果 (HP 跳动、状态治愈等)
     * @param {Pokemon} pokemon - 宝可梦实例
     * @returns {Object} { hpChange: number, curedStatus: string|null, logs: string[] }
     */
    processTurnEnd(pokemon) {
        const result = {
            hpChange: 0,
            curedStatus: null,
            logs: []
        };
        
        // 1. HP 变化
        const hpDelta = this.getTurnEndHPChange(pokemon);
        
        if (hpDelta !== 0) {
            result.hpChange = hpDelta;
            
            if (hpDelta > 0) {
                result.logs.push(`${pokemon.cnName || pokemon.name} 受到环境影响，回复了 ${hpDelta} HP！`);
            } else {
                result.logs.push(`${pokemon.cnName || pokemon.name} 受到环境影响，损失了 ${Math.abs(hpDelta)} HP！`);
            }
        }
        
        // 2. 状态治愈 (概率判定)
        if (pokemon.status) {
            const statusEffects = this.getStatusEffects(pokemon, null);
            if (statusEffects.cureStatus.length > 0) {
                const currentStatus = pokemon.status;
                // 查找当前状态的治愈配置
                const cureConfig = statusEffects.cureStatus.find(c => c.status === currentStatus);
                if (cureConfig) {
                    // 概率判定
                    const roll = Math.random();
                    if (roll < cureConfig.chance) {
                        result.curedStatus = currentStatus;
                        const statusName = this._getStatusName(currentStatus);
                        const chancePercent = Math.round(cureConfig.chance * 100);
                        result.logs.push(`${pokemon.cnName || pokemon.name} 的${statusName}状态被环境治愈了！`);
                        console.log(`[ENV OVERLAY] 🩹 状态治愈: ${pokemon.cnName || pokemon.name} 的 ${currentStatus} (${statusName}), 概率=${chancePercent}%, roll=${roll.toFixed(3)}`);
                    } else {
                        console.log(`[ENV OVERLAY] 状态治愈判定失败: ${pokemon.cnName || pokemon.name} 的 ${currentStatus}, 概率=${Math.round(cureConfig.chance * 100)}%, roll=${roll.toFixed(3)}`);
                    }
                }
            }
        }
        
        return result;
    }
    
    /**
     * 处理环境持续时间
     */
    tickDuration() {
        const currentTurn = this._getCurrentTurn();
        
        this.activeEnvs = this.activeEnvs.filter(env => {
            if (env.duration <= 0) return true; // 永久环境
            
            const elapsed = currentTurn - (env._startTurn || 0);
            if (elapsed >= env.duration) {
                console.log(`[ENV OVERLAY] ⏰ 环境结束: ${env.env_name}`);
                return false;
            }
            return true;
        });
    }
    
    // ============================================
    // 调试 API
    // ============================================
    
    /**
     * 获取当前所有激活环境的摘要
     */
    getSummary() {
        return this.activeEnvs.map(env => ({
            id: env._id,
            name: env.env_name,
            rules: env.rules?.length || 0,
            duration: env.duration,
            elapsed: this._getCurrentTurn() - (env._startTurn || 0)
        }));
    }
    
    /**
     * 打印调试信息
     */
    debug() {
        console.log('=== Environment Overlay Debug ===');
        console.log('Active Environments:', this.activeEnvs.length);
        for (const env of this.activeEnvs) {
            console.log(`  [${env._id}] ${env.env_name}`);
            for (const rule of env.rules || []) {
                console.log(`    Target: ${JSON.stringify(rule.target)}`);
                console.log(`    Effects:`, rule.effects);
            }
        }
    }
}

// ============================================
// UI 更新函数
// ============================================

/**
 * 更新环境图层 HUD 显示
 */
function updateEnvOverlayHUD() {
    if (typeof document === 'undefined') return;
    
    const hud = document.getElementById('env-overlay-hud');
    const nameEl = document.getElementById('env-overlay-name');
    const descEl = document.getElementById('env-overlay-desc');
    
    if (!hud) return;
    
    const envs = envOverlay.activeEnvs;
    
    if (envs.length === 0) {
        hud.classList.add('hidden');
        return;
    }
    
    // 显示第一个环境（或合并显示）
    const env = envs[0];
    if (nameEl) nameEl.textContent = env.env_name || '环境效果';
    if (descEl) descEl.textContent = env.narrative || `${env.rules?.length || 0} 条规则生效中`;
    
    hud.classList.remove('hidden');
}

// ============================================
// 全局单例 & 导出
// ============================================

const envOverlay = new EnvironmentOverlay();

// 重写 inject 方法以自动更新 UI
const originalInject = envOverlay.inject.bind(envOverlay);
envOverlay.inject = function(envJSON) {
    const result = originalInject(envJSON);
    updateEnvOverlayHUD();
    return result;
};

// 重写 remove 和 clear 方法以自动更新 UI
const originalRemove = envOverlay.remove.bind(envOverlay);
envOverlay.remove = function(envIdOrIndex) {
    originalRemove(envIdOrIndex);
    updateEnvOverlayHUD();
};

const originalClear = envOverlay.clear.bind(envOverlay);
envOverlay.clear = function() {
    originalClear();
    updateEnvOverlayHUD();
};

// 浏览器环境
if (typeof window !== 'undefined') {
    window.envOverlay = envOverlay;
    window.EnvironmentOverlay = EnvironmentOverlay;
    window.updateEnvOverlayHUD = updateEnvOverlayHUD;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnvironmentOverlay, envOverlay };
}

export { EnvironmentOverlay, envOverlay };
