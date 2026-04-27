/**
 * ===========================================
 * LOG-FILTER.JS - 战斗日志清洗与复制系统
 * ===========================================
 * 
 * 职责:
 * - 从 DOM 提取原始战斗日志
 * - D-E-L 模型: 事件分级 (T0~T3)、过滤、压缩
 * - 形态链合并 (Necrozma 等连续变身)
 * - 字数推荐算法 (基于有效事件权值 + 参战规模 + 等级系数)
 * - 复制到剪贴板 & 结束清理
 * 
 * 依赖: battle (全局), DOM (#log-box, #res-clipboard-text)
 */

(function() {
'use strict';

// ============================================
// 【事件分级规则】T0 ~ T3
// 每条规则: { pattern: RegExp, tier: number, score: number }
// tier 越低越重要, score 用于字数推荐
// ============================================

/**
 * T_DELETE: 直接删除的行 (UI 残留 / 过程噪音)
 * 这些行对 AI 叙事毫无价值，甚至会误导
 */
const DELETE_PATTERNS = [
    // UI 准备提示 (给玩家看的交互按钮状态)
    /就绪！选择招式后将/,
    /就绪！选择招式后将触发/,
    // 取消预备 (UI toggle 操作)
    /取消.*预备/,
    /取消.*模式/,
    /回归普通风格/,
    // 极巨化回合计数器 (纯机制数据)
    /极巨化剩余回合/,
    /敌方极巨化剩余回合/,
    // Choice 道具锁定提示 (限制玩家操作的 UI 提示)
    /被\s*.*\s*锁定，只能使用/,
    // 空的 div 容器标签 (HTML 残留)
    /^<div\s/,
    /^<\/div>/,
    // 重置/系统消息
    /^=== 重置战斗 ===/,
    // 太晶化中间态 ("开始结晶化！闪耀着 X 属性的光芒！" → 后面已有 "太晶化了" 行)
    /开始结晶化.*闪耀着/,
];

/**
 * T_MERGE: 需要合并/压缩的行
 * 返回 merge key，相同 key 的连续行会被合并
 */
const MERGE_PATTERNS = [
    // 属性变化详情 → 合并到上一行的太晶化/Mega 描述中
    { pattern: /属性变化:\s*.+→/, mergeKey: 'type_change' },
];

/**
 * T0 - 史诗级节点 (Score: 15)
 * 必须大写特写的关键时刻
 */
const T0_PATTERNS = [
    /Mega\s*进化/i,
    /Z-POWER/i,
    /DYNAMAX/i,
    /极巨化了/,
    /超极巨/,
    /TERASTALLIZE/i,
    /太晶化了/,
    /对冲发生/,
    /CP:\d+\s*vs\s*CP:\d+/i,
    /BOND\s*RESONANCE/i,
    /羁绊共鸣/,
    /羁绊正在觉醒/,
    /心跳完全重合/,
    /ULTRA\s*BURST/i,
    /究极奈克洛兹玛/,
    /共鸣形态/,
    /全属性极大幅提升/,
    /进化激发/,
    /AVs\s*效果翻倍/,
    /潜能被唤醒/,
    /Light That Burns the Sky/i,
    /Clangorous Soulblaze/i,
    /超极巨.*喷发/,
    /势不可挡/,
];

/**
 * T3_PRIORITY - 受队噪音优先拦截 (Score: 0.2)
 * 这些模式必须在 T1/T2 之前检查，否则会被更宽泛的 T1/T2 规则误捕
 * 核心目标: 拦截受队循环中反复出现的特性/道具/状态结算行
 */
const T3_PRIORITY_PATTERNS = [
    // 毒疗特性 (受队核心循环，每回合触发)
    /毒疗特性发动/,
    // 替身中间态 (替身承受伤害、替身消失)
    /替身代替.*承受了伤害/,
    /的替身消失了/,
    // 碉堡/守住免受攻击的详情行
    /守住了自己，.*被防住了/,
    /躲进了碉堡/,
    // 壁/场地消失 (反射壁/光墙/极光幕消失)
    /的反射壁消失/,
    /的光墙消失/,
    /的极光幕消失/,
    // 招式自降副作用 (淘金潮/过热/突飞猛扑等，反复出现)
    /的特攻下降了/,
    /的特防下降了/,
    /的防御下降了/,
    // 持续伤害 tick (剧毒/灼伤/中毒，每回合刷屏)
    /受到剧毒的伤害/,
    /受到灼伤的伤害/,
    /受到中毒的伤害/,
    // 操作失败 (HP不足等)
    /但是失败了/,
    // 黑色淤泥/剩饭回复 (每回合)
    /通过黑色淤泥回复/,
    /通过剩饭回复/,
    // 回复类招式的结果行 (自我再生/月光/许愿等)
    /恢复了体力/,
    // 对其没有效果 (属性免疫，反复出现)
    /对其没有效果/,
    // 麻痹/冰冻无法行动 (状态噪音)
    /因身体麻痹而无法行动/,
    /因冰冻而无法行动/,
    // 寄生种子吸取 (每回合 tick)
    /体力被寄生种子吸取/,
    // 急速折返/蜻蜓回转的机制描述行
    /打完后急速折返回来了/,
    // 重复状态提示 ("已经处于该状态")
    /已经处于该状态/,
    // 寄生种子种在了 (与 "被种下了寄生种子" 重复)
    /寄生种子种在了/,
];

/**
 * T1 - 关键交互 (Score: 5)
 * 战斗的主要骨架
 */
const T1_PATTERNS = [
    /击中要害/,
    /Critical Hit/i,
    /效果绝佳/,
    /Super Effective/i,
    /倒下了/,
    /失去了?战斗能力/,
    /派出了?\s/,
    /去吧[！!]/,
    /收回了/,
    /Passion/,
    /Trust/,
    /Insight/,
    /Devotion/,
    /感受到了训练家的意志/,
    /灵犀感应/,
    /凭借.*羁绊/,
    /\[指挥\]/,
    /刚猛·/,
    /迅疾·/,
    /画皮破损/,
    /画皮.*免疫/,
    /弱点保险/,
    /发起挑战/,
    /准备战斗/,
    /盐腌/,
    /特性.*变为/,
    /获得了特性/,
    /变幻自如/,
    /合体/,
    /与.*产生了反应/,     // 钥石反应
    /全部战败/,
    /你赢了/,
    /战略性撤退/,
    /逃离/,
];

/**
 * T2 - 常规行动 (Score: 2)
 * 普通的你来我往
 */
const T2_PATTERNS = [
    /使用了\s/,
    /使出\s/,
    /造成了\s*\d+\s*伤害/,
    /攻击没有命中/,
    /的.*提升了/,
    /的.*下降了/,
    /剑舞/,
    /灼伤/,
    /冰冻/,
    /麻痹/,
    /催眠/,
    /混乱/,
];

/**
 * T3 - 垃圾时间 / 噪音 (Score: 0.2)
 * 受队 100 回合里 80% 都是这种
 */
const T3_PATTERNS = [
    /剩饭/,
    /Leftovers/i,
    /回复了\s*\d+\s*点体力/,
    /黑色淤泥/,
    /受到了.*的伤害/,       // 天气/状态持续伤害
    /沙暴.*伤害/,
    /冰雹.*伤害/,
    /烧伤.*伤害/,
    /中毒.*伤害/,
    /Protect/i,
    /守住了/,
    /看穿/,
    /碉堡/,
    /生命宝珠.*反噬/,
    /反噬/,
    /刮起来了/,             // 天气设置 (非首次)
    /阳光变得强烈/,
    /下起了雨/,
    /下起了雪/,
    /下起了冰雹/,
    /沙暴停了/,
    /雨停了/,
    /阳光恢复/,
    /制造了一个替身/,       // 替身创建 (动作本身由 T2 "使用了" 捕获)
    /剧毒宝珠/,             // 道具触发
    /火焰宝珠/,
    /场上所有的能力变化.*消失/,  // 黑雾效果
    /建起了反射壁/,         // 壁设置 (战术动作但低叙事价值)
    /建起了光墙/,
];

// ============================================
// 【Tier 评分表】
// ============================================
const TIER_SCORES = {
    0: 15,   // T0: 史诗
    1: 5,    // T1: 关键
    2: 2,    // T2: 常规
    3: 0.2,  // T3: 噪音
};

// ============================================
// 【核心函数】分级一行日志
// ============================================
function classifyLine(text) {
    // 先检查是否应该删除
    for (const pat of DELETE_PATTERNS) {
        if (pat.test(text)) return { tier: -1, score: 0, action: 'delete' };
    }
    
    // 检查是否需要合并
    for (const rule of MERGE_PATTERNS) {
        if (rule.pattern.test(text)) return { tier: -2, score: 0, action: 'merge', mergeKey: rule.mergeKey };
    }
    
    // T0 (最高优先级，不会被降级)
    for (const pat of T0_PATTERNS) {
        if (pat.test(text)) return { tier: 0, score: TIER_SCORES[0], action: 'keep' };
    }
    
    // T3 优先拦截 (在 T1/T2 之前！)
    // 这些模式专门拦截受队循环噪音，防止被宽泛的 T1/T2 规则误捕
    for (const pat of T3_PRIORITY_PATTERNS) {
        if (pat.test(text)) return { tier: 3, score: TIER_SCORES[3], action: 'keep' };
    }
    
    // T1
    for (const pat of T1_PATTERNS) {
        if (pat.test(text)) return { tier: 1, score: TIER_SCORES[1], action: 'keep' };
    }
    
    // T2
    for (const pat of T2_PATTERNS) {
        if (pat.test(text)) return { tier: 2, score: TIER_SCORES[2], action: 'keep' };
    }
    
    // T3
    for (const pat of T3_PATTERNS) {
        if (pat.test(text)) return { tier: 3, score: TIER_SCORES[3], action: 'keep' };
    }
    
    // 默认: T2 (未分类的行按常规处理)
    return { tier: 2, score: TIER_SCORES[2], action: 'keep' };
}

// ============================================
// 【形态链压缩】
// 检测连续的形态变化行，只保留首尾
// ============================================
const FORM_CHAIN_PATTERNS = [
    /变为\s/,
    /变成了\s/,
    /合体/,
    /ULTRA\s*BURST/i,
    /释放了.*力量/,
    /特性变为/,
    /脑核之力/,
    /Neuroforce/i,
];

function isFormChainLine(text) {
    return FORM_CHAIN_PATTERNS.some(p => p.test(text));
}

/**
 * 压缩形态链: 连续的形态变化行 → 保留第一行和最后一行
 * @param {Array<{text: string, classification: object}>} lines
 * @returns {Array<{text: string, classification: object}>}
 */
function compressFormChains(lines) {
    const result = [];
    let chainStart = -1;
    let chainEnd = -1;
    
    for (let i = 0; i < lines.length; i++) {
        const isForm = isFormChainLine(lines[i].text);
        
        if (isForm) {
            if (chainStart === -1) {
                chainStart = i;
            }
            chainEnd = i;
        } else {
            // 链结束，处理积累的链
            if (chainStart !== -1) {
                flushChain(lines, chainStart, chainEnd, result);
                chainStart = -1;
                chainEnd = -1;
            }
            result.push(lines[i]);
        }
    }
    
    // 处理末尾的链
    if (chainStart !== -1) {
        flushChain(lines, chainStart, chainEnd, result);
    }
    
    return result;
}

function flushChain(lines, start, end, result) {
    if (end - start <= 1) {
        // 链长度 ≤ 2，全部保留
        for (let j = start; j <= end; j++) {
            result.push(lines[j]);
        }
    } else {
        // 链长度 > 2，保留首尾，中间折叠
        result.push(lines[start]);
        const skipped = end - start - 1;
        result.push({
            text: `  (${skipped} 步中间变化省略)`,
            classification: { tier: 3, score: 0, action: 'keep' }
        });
        result.push(lines[end]);
    }
}

// ============================================
// 【T3 折叠】连续的 T3 行折叠为一行摘要
// ============================================
function collapseT3Runs(lines) {
    const result = [];
    let t3Buffer = [];
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].classification.tier === 3) {
            t3Buffer.push(lines[i]);
        } else {
            if (t3Buffer.length > 0) {
                flushT3(t3Buffer, result);
                t3Buffer = [];
            }
            result.push(lines[i]);
        }
    }
    
    if (t3Buffer.length > 0) {
        flushT3(t3Buffer, result);
    }
    
    return result;
}

function flushT3(buffer, result) {
    if (buffer.length <= 2) {
        // 少量 T3 行直接保留
        buffer.forEach(l => result.push(l));
    } else {
        // 多条 T3 行折叠
        result.push({
            text: `  (${buffer.length} 条状态结算省略: ${summarizeT3(buffer)})`,
            classification: { tier: 3, score: 0.2, action: 'keep' }
        });
    }
}

function summarizeT3(buffer) {
    const keywords = new Set();
    buffer.forEach(l => {
        if (/剩饭|Leftovers/i.test(l.text)) keywords.add('剩饭回复');
        if (/毒疗/.test(l.text)) keywords.add('毒疗回复');
        if (/黑色淤泥/.test(l.text)) keywords.add('黑色淤泥回复');
        if (/恢复了体力/.test(l.text)) keywords.add('自我再生');
        if (/回复了/.test(l.text) && !/毒疗|剩饭|黑色淤泥/.test(l.text)) keywords.add('HP回复');
        if (/烧伤|灼伤/.test(l.text)) keywords.add('灼伤');
        if (/剧毒/.test(l.text)) keywords.add('剧毒伤害');
        if (/中毒/.test(l.text) && !/剧毒/.test(l.text)) keywords.add('中毒');
        if (/沙暴/.test(l.text)) keywords.add('沙暴');
        if (/冰雹/.test(l.text)) keywords.add('冰雹');
        if (/反噬/.test(l.text)) keywords.add('反噬');
        if (/守住|Protect|看穿|碉堡/i.test(l.text)) keywords.add('防御');
        if (/替身/.test(l.text)) keywords.add('替身');
        if (/反射壁|光墙|极光幕/.test(l.text)) keywords.add('壁消失');
        if (/下降了/.test(l.text)) keywords.add('能力下降');
        if (/失败/.test(l.text)) keywords.add('操作失败');
        if (/没有效果/.test(l.text)) keywords.add('属性免疫');
    });
    return keywords.size > 0 ? [...keywords].join(', ') : '状态结算';
}

// ============================================
// 【重复行去重】同一特性/道具/效果连续触发多次 → 首次 + 计数
// ============================================

/**
 * 提取一行日志的"签名" (signature)
 * 签名相同的行视为重复。去掉数字部分以匹配不同数值的同类行。
 * 例: "💚 天蝎王 的毒疗特性发动，回复了 29 点体力!" → "天蝎王毒疗特性发动回复了点体力"
 * @param {string} text
 * @returns {string} 签名字符串
 */
function getLineSignature(text) {
    return text
        .replace(/\d+/g, '')           // 去掉所有数字
        .replace(/[^\u4e00-\u9fff\w]/g, '') // 只保留中文和字母
        .trim();
}

/**
 * 去重: 连续出现的相同签名行 → 保留首次 + 追加计数
 * 非连续的重复不处理 (它们可能出现在不同战斗阶段，有叙事意义)
 * @param {Array<{text: string, classification: object}>} lines
 * @returns {Array<{text: string, classification: object}>}
 */
function deduplicateRepeats(lines) {
    if (lines.length <= 1) return lines;
    
    const result = [];
    let i = 0;
    
    while (i < lines.length) {
        const currentSig = getLineSignature(lines[i].text);
        let runEnd = i;
        
        // 向前扫描连续相同签名的行
        while (runEnd + 1 < lines.length && getLineSignature(lines[runEnd + 1].text) === currentSig) {
            runEnd++;
        }
        
        const runLength = runEnd - i + 1;
        
        if (runLength >= 3) {
            // 3次以上连续重复 → 只保留首次，附加计数
            const first = lines[i];
            result.push({
                text: `${first.text} (×${runLength})`,
                classification: first.classification
            });
        } else {
            // 1-2次: 全部保留
            for (let j = i; j <= runEnd; j++) {
                result.push(lines[j]);
            }
        }
        
        i = runEnd + 1;
    }
    
    return result;
}

// ============================================
// 【循环检测】受队 Stall Loop 压缩
// 检测重复的多行循环模式 (如碉堡→攻击→再生→tick×N)
// ============================================

/**
 * 将一行转为循环签名 (比 getLineSignature 更激进的归一化)
 * 去掉数字、emoji、标点，只保留核心动作关键词
 */
function getCycleSignature(text) {
    return text
        .replace(/\d+/g, '#')          // 数字统一为 #
        .replace(/[^\u4e00-\u9fffA-Za-z#]/g, '') // 只保留中文、字母、#
        .trim();
}

/**
 * 检测并压缩重复循环
 * 算法: 对于每个位置 i，尝试周期长度 L=3~12，
 * 检查从 i 开始的签名序列是否重复 ≥2 次
 * @param {Array<{text: string, classification: object}>} lines
 * @returns {Array<{text: string, classification: object}>}
 */
function collapseStallCycles(lines) {
    if (lines.length < 6) return lines;
    
    // 建立索引映射: 跳过 T3 行，只对非-T3 行做循环检测
    // 这样 T3 折叠摘要 ("3 条状态结算省略") 不会破坏循环模式
    const nonT3Indices = [];
    for (let k = 0; k < lines.length; k++) {
        if (lines[k].classification.tier !== 3) {
            nonT3Indices.push(k);
        }
    }
    
    if (nonT3Indices.length < 6) return lines;
    
    const nonT3Sigs = nonT3Indices.map(idx => getCycleSignature(lines[idx].text));
    
    // 在非-T3 行上做循环检测
    const keepSet = new Set(); // 要保留的原始索引
    const skipSet = new Set(); // 要跳过的原始索引
    let ni = 0;
    
    while (ni < nonT3Indices.length) {
        let bestCycleLen = 0;
        let bestCycleCount = 0;
        
        for (let L = 2; L <= 12 && ni + L * 2 <= nonT3Indices.length; L++) {
            const pattern = nonT3Sigs.slice(ni, ni + L).join('|');
            
            let count = 1;
            let pos = ni + L;
            while (pos + L <= nonT3Indices.length) {
                const candidate = nonT3Sigs.slice(pos, pos + L).join('|');
                if (candidate === pattern) {
                    count++;
                    pos += L;
                } else {
                    break;
                }
            }
            
            if (count >= 2 && count * L > bestCycleCount * bestCycleLen) {
                bestCycleLen = L;
                bestCycleCount = count;
            }
        }
        
        if (bestCycleLen > 0 && bestCycleCount >= 2) {
            // 保留第一个周期的非-T3 行
            for (let j = ni; j < ni + bestCycleLen; j++) {
                keepSet.add(nonT3Indices[j]);
            }
            // 标记后续周期的非-T3 行为 skip
            for (let j = ni + bestCycleLen; j < ni + bestCycleLen * bestCycleCount; j++) {
                skipSet.add(nonT3Indices[j]);
            }
            ni += bestCycleLen * bestCycleCount;
        } else {
            keepSet.add(nonT3Indices[ni]);
            ni++;
        }
    }
    
    if (skipSet.size === 0) return lines;
    
    // 重建结果: 保留未被 skip 的行，在循环结束处插入摘要
    const result = [];
    let inSkip = false;
    let skipStartIdx = -1;
    let skippedCount = 0;
    
    for (let k = 0; k < lines.length; k++) {
        if (skipSet.has(k)) {
            if (!inSkip) {
                inSkip = true;
                skipStartIdx = k;
                skippedCount = 0;
            }
            skippedCount++;
        } else if (lines[k].classification.tier === 3 && inSkip) {
            // T3 行在 skip 区间内，也跳过
            skippedCount++;
        } else {
            if (inSkip) {
                // skip 区间结束，插入摘要
                result.push({
                    text: `  ⟳ 以上模式又重复了多次 (${skippedCount} 行省略)`,
                    classification: { tier: 3, score: 0, action: 'keep' }
                });
                inSkip = false;
            }
            result.push(lines[k]);
        }
    }
    
    if (inSkip) {
        result.push({
            text: `  ⟳ 以上模式又重复了多次 (${skippedCount} 行省略)`,
            classification: { tier: 3, score: 0, action: 'keep' }
        });
    }
    
    return result;
}

// ============================================
// 【战斗行合并】攻击 + 结果行 → 单行
// [X] 使用了 Y! + 造成了 Z 伤害 (效果绝佳!) → 合并为一条
// [X] 使出 诡计! + 特攻大幅提升了! → 合并为一条
// ============================================

/**
 * 判断一行是否是"攻击/招式发动"行
 */
function isActionLine(text) {
    return /^\[.+\]\s*(使用了|使出)\s/.test(text);
}

/**
 * 判断一行是否可以作为上一个 action 的"结果"被合并
 * 结果行: 造成伤害、效果描述、能力变化、守住、没有效果等
 */
function isResultLine(text) {
    return (
        /^造成了\s*\d+\s*伤害/.test(text) ||
        /^对其没有效果/.test(text) ||
        /^攻击没有命中/.test(text) ||
        /的.{1,6}(大幅)?(提升|下降)了/.test(text) ||
        /守住了自己/.test(text) ||
        /恢复了体力/.test(text) ||
        /制造了一个替身/.test(text) ||
        /躲进了碉堡/.test(text) ||
        /但是失败了/.test(text) ||
        /场上所有的能力变化.*消失/.test(text)
    );
}

/**
 * 合并攻击行 + 紧随的结果行为单条事件
 * 规则:
 * - 遇到 action 行时开始收集
 * - 紧随的 1~3 行如果是 result 行，合并到 action 行
 * - 合并后取最高 tier (如 action=T2, 效果绝佳=T1 → 合并行=T1)
 * @param {Array<{text: string, classification: object}>} lines
 * @returns {Array<{text: string, classification: object}>}
 */
function mergeActionResults(lines) {
    const result = [];
    let i = 0;
    
    while (i < lines.length) {
        if (isActionLine(lines[i].text)) {
            // 开始收集 action + results
            let actionText = lines[i].text;
            let bestTier = lines[i].classification.tier;
            let bestScore = lines[i].classification.score;
            let j = i + 1;
            const maxLookahead = 3; // 最多向后看 3 行
            
            while (j < lines.length && j - i <= maxLookahead && isResultLine(lines[j].text)) {
                // 提取结果行的关键信息并追加
                const rt = lines[j].text.trim();
                actionText += ' → ' + rt;
                
                // 取最高优先级 tier (数字越小越高)
                if (lines[j].classification.tier >= 0 && lines[j].classification.tier < bestTier) {
                    bestTier = lines[j].classification.tier;
                    bestScore = lines[j].classification.score;
                }
                j++;
            }
            
            result.push({
                text: actionText,
                classification: { tier: bestTier, score: bestScore, action: 'keep' }
            });
            i = j;
        } else {
            result.push(lines[i]);
            i++;
        }
    }
    
    return result;
}

// ============================================
// 【主入口】从 DOM 提取并清洗日志
// ============================================

/**
 * 从 #log-box 提取原始日志条目
 * @returns {string[]} 原始文本行数组
 */
function extractRawLog() {
    const logBox = document.getElementById('log-box');
    if (!logBox) return [];
    
    const entries = [];
    logBox.querySelectorAll('.log-entry').forEach(entry => {
        const text = entry.innerText.trim();
        if (text) entries.push(text);
    });
    return entries;
}

/**
 * 对原始日志执行完整的清洗流水线
 * @param {string[]} rawLines - 原始日志行
 * @returns {{ filtered: string[], stats: object }}
 */
function filterBattleLog(rawLines) {
    // Step 1: 分级每一行
    let classified = rawLines.map(text => ({
        text,
        classification: classifyLine(text)
    }));
    
    // Step 2: 删除 DELETE 行
    classified = classified.filter(l => l.classification.action !== 'delete');
    
    // Step 3: 处理 MERGE 行 (将其内容附加到上一行)
    const merged = [];
    for (let i = 0; i < classified.length; i++) {
        if (classified[i].classification.action === 'merge' && merged.length > 0) {
            // 将 merge 行的关键信息提取并附加到上一行
            const lastLine = merged[merged.length - 1];
            const mergeText = classified[i].text.trim();
            // 属性变化行: 提取 "X → Y" 部分
            const typeMatch = mergeText.match(/属性变化:\s*(.+)/);
            if (typeMatch) {
                lastLine.text += ` [${typeMatch[1].trim()}]`;
            }
        } else if (classified[i].classification.action !== 'merge') {
            merged.push(classified[i]);
        }
    }
    classified = merged;
    
    // Step 4: 战斗行合并 (攻击 + 结果 → 单行)
    classified = mergeActionResults(classified);
    
    // Step 5: 形态链压缩
    classified = compressFormChains(classified);
    
    // Step 6: 重复行去重 (同一特性/道具连续触发多次 → 首次 + 计数)
    classified = deduplicateRepeats(classified);
    
    // Step 7: 循环检测 (受队 stall loop 压缩)
    classified = collapseStallCycles(classified);
    
    // Step 8: T3 连续行折叠
    classified = collapseT3Runs(classified);
    
    // Step 9: 统计
    const stats = { total: rawLines.length, kept: classified.length, deleted: 0, t0: 0, t1: 0, t2: 0, t3: 0 };
    stats.deleted = rawLines.length - classified.length;
    classified.forEach(l => {
        const t = l.classification.tier;
        if (t === 0) stats.t0++;
        else if (t === 1) stats.t1++;
        else if (t === 2) stats.t2++;
        else if (t === 3) stats.t3++;
    });
    
    // Step 10: 计算叙事总分
    stats.narrativeScore = classified.reduce((sum, l) => sum + (l.classification.score || 0), 0);
    
    return {
        filtered: classified.map(l => `> ${l.text}`),
        classified,
        stats
    };
}

// ============================================
// 【字数推荐算法】D-E-L 模型
// Participants + Effective Events + Stakes
// ============================================

/**
 * 基于清洗后的日志和战斗状态计算推荐字数
 * @param {object} stats - filterBattleLog 返回的 stats
 * @param {object} battle - 全局 battle 对象
 * @returns {{ min: number, max: number, recommended: number, breakdown: object }}
 */
function calculateWordCount(stats, battle) {
    if (!battle) {
        // Fallback: 无 battle 对象时用简单公式
        const rec = Math.min(4000, Math.max(500, Math.round(stats.kept * 40)));
        return { min: Math.max(500, rec - 200), max: Math.min(4000, rec + 200), recommended: rec, breakdown: {} };
    }
    
    const breakdown = {};
    
    // === 1. 参战规模权重 (Base Participants) ===
    let participantScore = 0;
    const pParty = battle.playerParty || [];
    const eParty = battle.enemyParty || [];
    
    // 每只登场宝可梦 +50
    const totalUsed = pParty.length + eParty.length;
    participantScore += totalUsed * 50;
    
    // 每只濒死宝可梦 +80
    const pFainted = pParty.filter(p => p && p.currHp <= 0).length;
    const eFainted = eParty.filter(e => e && e.currHp <= 0).length;
    participantScore += (pFainted + eFainted) * 80;
    
    // ACE / 神兽加权 +80
    const aceCount = pParty.filter(p => p && p.isAce).length + eParty.filter(e => e && e.isAce).length;
    participantScore += aceCount * 80;
    
    breakdown.participants = participantScore;
    
    // === 2. 有效事件权值 (Narrative Score) ===
    // 直接使用 stats.narrativeScore (已在 filterBattleLog 中计算)
    const eventScore = Math.round(stats.narrativeScore * 5); // 每分 ≈ 5 字
    breakdown.events = eventScore;
    
    // === 3. 等级系数 (Level/Stake Modifier) ===
    const allPokes = [...pParty, ...eParty].filter(p => p);
    const avgLevel = allPokes.length > 0
        ? allPokes.reduce((sum, p) => sum + (p.level || 1), 0) / allPokes.length
        : 50;
    const levelModifier = Math.min(1.5, Math.max(0.8, avgLevel / 50));
    breakdown.levelModifier = levelModifier;
    breakdown.avgLevel = Math.round(avgLevel);
    
    // === 4. 衰减算法 (Decay) ===
    // T3 占比越高，说明越多"垃圾时间"，压制膨胀
    const t3Ratio = stats.kept > 0 ? stats.t3 / stats.kept : 0;
    // 受队惩罚: 原始日志数远大于清洗后数量，说明大量垃圾时间被压缩
    const compressionRatio = stats.total > 0 ? stats.kept / stats.total : 1;
    // 压缩率越低 (垃圾越多)，衰减越强
    const stallPenalty = Math.min(1, 0.4 + compressionRatio * 0.8);  // 0.35 ratio → 0.68, 0.5 → 0.8, 1.0 → 1.0
    const t3Penalty = Math.max(0.75, 1 - t3Ratio * 0.4);
    const decayFactor = Math.max(0.55, stallPenalty * t3Penalty);
    breakdown.decayFactor = decayFactor;
    breakdown.compressionRatio = compressionRatio;
    
    // === 最终计算 ===
    const rawWords = (participantScore + eventScore) * levelModifier * decayFactor;
    const recommended = Math.min(4000, Math.max(500, Math.round(rawWords)));
    const min = Math.max(500, recommended - 200);
    const max = Math.min(4000, recommended + 200);
    
    breakdown.rawWords = Math.round(rawWords);
    
    return { min, max, recommended, breakdown };
}

// ============================================
// 【复制系统】
// ============================================

/**
 * 仅复制战斗结果摘要
 */
function copyResultOnly() {
    const summary = document.getElementById('res-clipboard-text').value;
    copyToAndClose(summary);
}

/**
 * 复制完整战斗过程 (清洗后的日志 + 提示词模板)
 */
function copyFullProcess() {
    const summary = document.getElementById('res-clipboard-text').value;
    
    // 提取并清洗日志
    const rawLines = extractRawLog();
    const { filtered, stats } = filterBattleLog(rawLines);
    const processLog = filtered.join('\n');
    
    // 计算推荐字数 (使用 D-E-L 模型)
    const battle = window.battle;
    const wordCount = calculateWordCount(stats, battle);
    
    const wordRequirement = `📊 【字数要求】本次战斗共 ${stats.total} 条原始日志，清洗后 ${stats.kept} 条有效事件 (T0:${stats.t0} T1:${stats.t1} T2:${stats.t2} T3:${stats.t3})，推荐正文字数：**${wordCount.min}~${wordCount.max} 字**（不少于 ${wordCount.min} 字）`;
    
    console.log(`[LOG-FILTER] 日志清洗完成: ${stats.total} → ${stats.kept} (删除 ${stats.deleted}), 叙事分: ${stats.narrativeScore.toFixed(1)}, 推荐字数: ${wordCount.min}~${wordCount.max}`);
    
    const finalContent = [
        '<CORE_TASK>',
        '🛑 [SYSTEM COMMAND // 强制执行] 🛑',
        '🚫 DO NOT ADVANCE THE PLOT! (禁止推进后续剧情)',
        '🚫 DO NOT SKIP BATTLE DETAILS! (禁止跳过战斗细节)',
        '⚠️ 核心任务 (CORE TASK):',
        '你现在的身份是【精灵宝可梦动画编剧】。请基于下方的「战斗日志」与「结果」，将枯燥的数据重构为充满画面感的**小说级实况演出**。',
        '不仅要基于下方的「回合制日志 (Log)」与「最终结算 (Result)」，撰写一场**字数充足**的完整战斗过程。',
        '',
        wordRequirement,
        '',
        '【核心原则 // CORE RULES】',
        '1. 风格自适应：请自动识别对战级别并切换画风：',
        '   - 高强度对决（神兽/满级/Mega/Z技）：采用王道热血风',
        '   - 低频/趣味局（幼崽/更替衣服/随机挥指）：采用轻松欢快风，描写要生动相对可爱。',
        '2. 绝对全年龄：',
        '   - ❌ 严禁黑残深：禁止出现肢体残缺、痛苦绝望、血腥描写。',
        '   - ✅ 视效转化：将"重伤"写为体力透支或战损（污渍/擦伤）；"倒下"即为圈圈眼或体面退场。',
        '3. 去数据化与去回合制：',
        '   - **严禁**使用"第X回合"、"造成XX点伤害"等游戏术语。',
        '   - 必须通过由于伤害造成的"地形破坏"、"表情痛楚"、"动作迟缓"来体现数值变化。',
        '   - 动作必须流畅衔接，不准记流水账，道具与特性发动要自然融入战斗描述中，结合环境依据战斗文本进行灵活创意性改编。',
        '</CORE_TASK>',
        '',
        '<BATTLE_LOG>',
        processLog,
        '</BATTLE_LOG>',
        '',
        '<BATTLE_RESULT>',
        '结果统计（作为结局的参考）：',
        summary.replace('[系统提示：宝可梦对战结果结算]\n', ''),
        '</BATTLE_RESULT>',
        '',
        '<WRITING_INSTRUCTION>',
        `请立即生成 ${wordCount.min}~${wordCount.max} 字的战斗实况文案（最低不少于 ${wordCount.min} 字）`,
        '</WRITING_INSTRUCTION>'
    ].join('\n');
    
    copyToAndClose(finalContent);
}

/**
 * 复制文本到剪贴板并执行结束清理
 * @param {string} textStr - 要复制的文本
 */
function copyToAndClose(textStr) {
    const fallbackCopy = () => {
        const el = document.createElement('textarea');
        el.value = textStr;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        endGameCleanup();
    };

    if (navigator.clipboard) {
        navigator.clipboard.writeText(textStr).then(() => {
            endGameCleanup();
        }).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }
}

/**
 * 游戏结束后的 UI 清理
 */
function endGameCleanup() {
    setTimeout(() => {
        if (window.parent) {
            window.parent.postMessage({ type: 'pkm-battle-close' }, '*');
        }
        document.getElementById('ui-root').style.filter = "grayscale(1) brightness(0.2)";
        document.body.innerHTML = "<div style='color:white;text-align:center;margin-top:20%'><h1>SESSION ENDED</h1><p>已复制结果，请在对话框粘贴。</p></div>";
    }, 600);
}

// ============================================
// 【导出到 window】
// ============================================
window.copyResultOnly = copyResultOnly;
window.copyFullProcess = copyFullProcess;
window.copyToAndClose = copyToAndClose;
window.endGameCleanup = endGameCleanup;

// 导出工具函数供调试/测试
window.LogFilter = {
    extractRawLog,
    filterBattleLog,
    classifyLine,
    calculateWordCount,
    compressFormChains,
    collapseT3Runs,
    deduplicateRepeats,
    collapseStallCycles,
    mergeActionResults,
    // 暴露规则表供外部扩展
    DELETE_PATTERNS,
    T0_PATTERNS,
    T1_PATTERNS,
    T2_PATTERNS,
    T3_PATTERNS,
    T3_PRIORITY_PATTERNS,
    TIER_SCORES,
};

console.log('[LOG-FILTER] 战斗日志清洗系统已加载');

})();
