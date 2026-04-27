# Environment Overlay System - API 调用文档

> 环境图层系统完整调用指南，供测试和 AI 集成使用

---

## 一、快速开始

### 1. 使用预设环境（最简单）

```javascript
// 列出所有可用预设
listEnvPresets();

// 加载预设环境
loadEnvPreset('gravity');    // 重力塌缩
loadEnvPreset('radiation');  // 辐射酸雨
loadEnvPreset('rift');       // 时空裂隙
loadEnvPreset('inferno');    // 炎狱熔岩
loadEnvPreset('phantom');    // 幽冥结界
loadEnvPreset('storm');      // 电磁风暴
loadEnvPreset('sanctuary');  // 治愈圣域
loadEnvPreset('smog');       // 腐蚀烟霾

// 清除所有环境
clearEnvironmentOverlay();
```

### 2. 自定义环境注入

```javascript
injectEnvironmentOverlay({
  "env_name": "自定义环境名",
  "narrative": "环境描述文字...",
  "duration": 5,  // 持续回合数，0=永久
  "rules": [
    { "target": "ALL", "eff": ["Spd:0.8"] },
    { "target": "Type:Fire", "eff": ["Atk:1.5", "HP:0.0625"] }
  ]
});
```

---

## 二、JSON 协议详解

### 基础结构

```json
{
  "env_id": "unique_id",        // 可选，唯一标识
  "env_name": "环境名称",        // 显示名称
  "narrative": "描述文字",       // UI 显示的描述
  "duration": 5,                // 持续回合，0=永久
  "rules": [                    // 规则数组
    {
      "target": "目标选择器",
      "eff": ["效果1", "效果2"]
    }
  ]
}
```

### 目标选择器 (Target)

| 选择器 | 说明 | 示例 |
|--------|------|------|
| `ALL` | 所有宝可梦 | `"target": "ALL"` |
| `Type:X` | 指定属性的宝可梦 | `"target": "Type:Fire"` |
| `MoveType:X` | 指定属性的技能 | `"target": "MoveType:Water"` |
| `Side:Player` | 玩家方 | `"target": "Side:Player"` |
| `Side:Enemy` | 敌方 | `"target": "Side:Enemy"` |
| `NOT:X` | 取反 | `"target": "NOT:Type:Ghost"` |
| `HasAbility:X` | 拥有特定特性 | `"target": "HasAbility:Levitate"` |

### 效果原子 (Effect Atoms)

#### A类：数值修正

| 效果 | 格式 | 说明 | 示例 |
|------|------|------|------|
| 攻击 | `Atk:N` | 物攻倍率 | `"Atk:1.5"` |
| 防御 | `Def:N` | 物防倍率 | `"Def:0.7"` |
| 特攻 | `SpA:N` | 特攻倍率 | `"SpA:1.3"` |
| 特防 | `SpD:N` | 特防倍率 | `"SpD:0.8"` |
| 速度 | `Spd:N` | 速度倍率 | `"Spd:0.5"` |
| 伤害 | `Dmg:N` | 伤害倍率 | `"Dmg:1.2"` |
| 命中 | `Acc:N` | 命中倍率 | `"Acc:0.9"` |
| 暴击 | `Crit:N` | 暴击倍率 | `"Crit:2.0"` |
| 回复 | `Heal:N` | 回复效果倍率 | `"Heal:0.5"` |

> **回复修正 (Heal) 详解**：
> - `Heal:0.5` = 所有回复效果减半（包括：羽栖、自我再生、剩饭、吸取招式等）
> - `Heal:1.5` = 所有回复效果增强 50%
> - `Heal:0` = 完全禁止回复（极端环境）
> - 范围限制：0.1 ~ 3.0，超出自动钳制
> - 与天气回复修正（如 Smog）**乘算叠加**

#### B类：HP 跳动

| 效果 | 格式 | 说明 | 示例 |
|------|------|------|------|
| 每回合扣血 | `HP:-N` | N 为 maxHp 比例 | `"HP:-0.125"` (扣 1/8) |
| 每回合回血 | `HP:N` | N 为 maxHp 比例 | `"HP:0.0625"` (回 1/16) |

#### C类：类型与免控

| 效果 | 格式 | 说明 | 示例 |
|------|------|------|------|
| 免疫属性 | `Immune:X` | 免疫某属性伤害 | `"Immune:Ground"` |
| 追加弱点 | `Weak:X` | 对某属性 x2 | `"Weak:Electric"` |
| 禁用属性 | `Ban:X` | 禁用某属性技能 | `"Ban:Flying"` |
| 类型转换 | `ToType:A>B` | 将 A 系技能转换为 B 系 | `"ToType:Normal>Electric"` |

> **类型转换 (ToType) 详解**：
> - `ToType:Normal>Electric` = 所有普通系技能在伤害计算时视为电系
> - `ToType:Water>Poison` = 所有水系技能变成毒系（毒水环境）
> - 转换影响：属性克制、本系加成 (STAB)、属性免疫判定
> - 不影响：技能的视觉效果和名称显示

> **技能禁用 (Ban) 安全机制**：
> - 当所有 4 个技能都被环境禁用时，系统自动启用"挣扎"按钮
> - 挣扎：50 威力一般系物理攻击，使用后扣除自身 1/4 最大 HP

---

## 三、预设环境详解

### 1. gravity - 重力塌缩
```javascript
{
  env_name: "重力塌缩",
  narrative: "异常强大的重力场笼罩着战场...",
  rules: [
    { target: "ALL", eff: ["Spd:0.5"] },           // 全员速度减半
    { target: "Type:Flying", eff: ["Def:0.7", "HP:-0.0625"] }  // 飞行系受损
  ]
}
```

### 2. radiation - 辐射酸雨
```javascript
{
  env_name: "辐射酸雨",
  narrative: "腐蚀性的绿色酸雨从天而降...",
  rules: [
    { target: "Type:Steel", eff: ["Def:0.7", "HP:-0.125"] },   // 钢系被腐蚀
    { target: "Type:Poison", eff: ["Spd:1.5", "HP:0.0625"] },  // 毒系增强
    { target: "MoveType:Fire", eff: ["Dmg:0.5"] }              // 火系技能减弱
  ]
}
```

### 3. rift - 时空裂隙
```javascript
{
  env_name: "时空裂隙",
  narrative: "空间扭曲，时间紊乱...",
  rules: [
    { target: "MoveType:Psychic", eff: ["Dmg:1.5"] },          // 超能技能增强
    { target: "Type:Psychic", eff: ["SpA:1.3", "Spd:1.2"] },   // 超能系增强
    { target: "ALL", eff: ["Acc:0.9"] }                        // 全局命中降低
  ]
}
```

### 4. inferno - 炎狱熔岩
```javascript
{
  env_name: "炎狱熔岩",
  narrative: "滚烫的岩浆覆盖了整个战场...",
  rules: [
    { target: "Type:Fire", eff: ["Atk:1.3", "SpA:1.3", "HP:0.0625"] },  // 火系天堂
    { target: "Type:Water", eff: ["Def:0.7", "SpD:0.7", "HP:-0.125"] }, // 水系地狱
    { target: "Type:Ice", eff: ["HP:-0.1875"] },               // 冰系融化
    { target: "MoveType:Water", eff: ["Dmg:0.5"] }             // 水系技能蒸发
  ]
}
```

### 5. phantom - 幽冥结界
```javascript
{
  env_name: "幽冥结界",
  narrative: "阴森的灵气弥漫，生者的力量被削弱...",
  rules: [
    { target: "Type:Ghost", eff: ["SpA:1.4", "Spd:1.2", "HP:0.0625"] }, // 幽灵系主场
    { target: "Type:Normal", eff: ["Atk:0.7", "SpA:0.7"] },    // 一般系削弱
    { target: "ALL", eff: ["Immune:Normal"] },                 // 全局免疫一般
    { target: "MoveType:Ghost", eff: ["Dmg:1.3"] }             // 幽灵技能增强
  ]
}
```

### 6. storm - 电磁风暴
```javascript
{
  env_name: "电磁风暴",
  narrative: "强烈的电磁脉冲席卷战场...",
  rules: [
    { target: "Type:Electric", eff: ["SpA:1.5", "Spd:1.3"] },  // 电系狂欢
    { target: "Type:Steel", eff: ["Spd:0.5", "Def:0.8"] },     // 钢系被磁化
    { target: "MoveType:Electric", eff: ["Dmg:1.2"] },         // 电系技能增强
    { target: "Type:Flying", eff: ["Weak:Electric"] }          // 飞行系追加电弱点
  ]
}
```

### 7. sanctuary - 治愈圣域
```javascript
{
  env_name: "治愈圣域",
  narrative: "神圣的光芒治愈一切伤痛...",
  rules: [
    { target: "ALL", eff: ["HP:0.0625", "Heal:1.5"] },         // 全员回血+回复增强
    { target: "MoveType:Poison", eff: ["Dmg:0.3"] },           // 毒系技能大幅削弱
    { target: "Type:Fairy", eff: ["SpD:1.3"] }                 // 妖精系特防增强
  ]
}
```

### 8. smog - 腐蚀烟霾
```javascript
{
  env_name: "腐蚀烟霾",
  narrative: "有毒的烟雾阻碍了生命的恢复...",
  rules: [
    { target: "ALL", eff: ["Heal:0.5", "HP:-0.0625"] },        // 回复减半+持续扣血
    { target: "Type:Poison", eff: ["Immune:Poison", "HP:0.0625"] }, // 毒系免疫+回血
    { target: "Type:Steel", eff: ["Def:0.8"] }                 // 钢系被腐蚀
  ]
}
```

---

## 四、API 参考

### 核心函数

```javascript
// 注入环境 (返回解析后的环境对象)
injectEnvironmentOverlay(envJSON)

// 清除所有环境
clearEnvironmentOverlay()

// 加载预设环境
loadEnvPreset(presetName)

// 列出所有预设
listEnvPresets()
```

### envOverlay 对象方法

```javascript
// 注入环境
envOverlay.inject(envJSON)

// 移除环境 (按 ID 或索引)
envOverlay.remove(envIdOrIndex)

// 清空所有环境
envOverlay.clear()

// 获取数值修正
envOverlay.getStatMod(pokemon, statName)  // 返回倍率

// 获取伤害修正
envOverlay.getDamageMod(attacker, defender, move)  // 返回倍率

// 获取回复修正
envOverlay.getHealMod(pokemon)  // 返回倍率

// 获取类型覆盖
envOverlay.getTypeOverrides(pokemon)  // 返回 { immuneTypes, weakTypes, grantTypes }

// 检查技能是否被禁用
envOverlay.isMoveBanned(pokemon, move)  // 返回 boolean

// 获取回合末 HP 变化
envOverlay.getTurnEndHPChange(pokemon)  // 返回 HP 变化量

// 获取当前环境摘要
envOverlay.getSummary()

// 打印调试信息
envOverlay.debug()
```

---

## 五、测试用例

### 测试 1：数值修正
```javascript
// 加载重力环境
loadEnvPreset('gravity');

// 检查速度修正
const p = battle.getPlayer();
console.log('速度修正:', envOverlay.getStatMod(p, 'spe'));  // 应该是 0.5
```

### 测试 2：HP 跳动
```javascript
// 加载辐射环境
loadEnvPreset('radiation');

// 钢系宝可梦每回合应该扣 1/8 HP
// 毒系宝可梦每回合应该回 1/16 HP
```

### 测试 3：类型免疫
```javascript
// 加载幽冥结界
loadEnvPreset('phantom');

// 一般系技能应该对所有目标无效 (effectiveness = 0)
```

### 测试 4：技能禁用
```javascript
// 自定义禁用飞行系
injectEnvironmentOverlay({
  env_name: "禁飞区",
  rules: [{ target: "ALL", eff: ["Ban:Flying"] }]
});

// 飞行系技能应该无法使用
```

### 测试 5：回复修正
```javascript
// 加载腐蚀烟霾
loadEnvPreset('smog');

// 所有回复效果应该减半 (Heal:0.5)
// 使用吸取技能、剩饭、树果等验证
```

### 测试 6：多环境叠加
```javascript
// 同时加载多个环境
loadEnvPreset('gravity');
loadEnvPreset('storm');

// 效果应该叠加
envOverlay.debug();  // 查看所有激活环境
```

---

## 六、AI 集成示例

### 世界书调用格式

```javascript
// AI 输出 JSON 后，解析并注入
const aiResponse = `
场景描述：你们进入了一片被辐射污染的废墟...

\`\`\`json
{
  "env_name": "辐射废墟",
  "narrative": "空气中弥漫着诡异的绿光...",
  "rules": [
    { "target": "Type:Steel", "eff": ["Def:0.7", "HP:-0.1"] },
    { "target": "Type:Poison", "eff": ["Atk:1.3"] }
  ]
}
\`\`\`
`;

// 系统自动提取 JSON 并注入
injectEnvironmentOverlay(aiResponse);  // 支持从 markdown 代码块提取
```

### SillyTavern 插件调用

```javascript
// 在 pkm-tavern-plugin.js 中
function handleEnvironmentFromAI(text) {
  // 提取 JSON
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    const envData = JSON.parse(jsonMatch[1]);
    if (envData.rules) {
      injectEnvironmentOverlay(envData);
    }
  }
}
```

---

## 七、常见问题

### Q: 环境效果不生效？
1. 检查 `envOverlay.debug()` 确认环境已注入
2. 检查目标选择器是否正确匹配
3. 检查效果格式是否正确（如 `Atk:1.5` 而不是 `Atk=1.5`）

### Q: 如何移除特定环境？
```javascript
// 按 env_id 移除
envOverlay.remove('my_env_id');

// 按索引移除（0 = 第一个）
envOverlay.remove(0);

// 清除所有
clearEnvironmentOverlay();
```

### Q: 效果数值有限制吗？
- 数值倍率限制在 0.1 ~ 10 之间
- HP 变化比例建议在 -0.25 ~ 0.25 之间
- 回复修正限制在 0.1 ~ 3.0 之间

### Q: 支持中文别名吗？
支持！以下都是有效的：
- `"Type:火"` = `"Type:Fire"`
- `"攻击:1.5"` = `"Atk:1.5"`
- `"免疫:地面"` = `"Immune:Ground"`

---

## 八、版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0 | Phase 1 | 基础框架、数值修正、HP跳动 |
| 2.0 | Phase 2 | 伤害修正、类型覆盖、技能禁用、UI显示、回复修正 |

---

*文档版本: 2.0 | 最后更新: Phase 2 完成*
