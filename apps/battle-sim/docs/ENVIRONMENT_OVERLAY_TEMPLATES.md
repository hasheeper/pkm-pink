# 环境图层 (Environment Overlay) 模板文档

本文档定义了 AI 可通过 JSON 接口自定义的环境效果系统。

## 概述

环境图层系统允许 AI 在战斗中创建自定义场地规则，影响宝可梦的能力值、伤害、回复等。这些规则通过 `environment.overlay` 字段传入战斗 JSON。

---

## API 格式

```json
{
  "environment": {
    "weather": "rain" | "sun" | "sandstorm" | "snow" | null,
    "weatherTurns": 0,
    "overlay": {
      "env_name": "环境名称",
      "narrative": "环境描述文字（战斗开始时显示）",
      "rules": [
        { "target": "TARGET_SELECTOR", "eff": ["EFFECT_ATOM", ...] }
      ]
    }
  }
}
```

---

## 目标选择器 (TARGET_SELECTOR)

### 基础选择器

| 选择器 | 说明 | 示例 |
|--------|------|------|
| `ALL` | 所有宝可梦 | `"ALL"` |
| `Type:X` | 指定属性的宝可梦 | `"Type:Fire"`, `"Type:Ghost"` |
| `MoveType:X` | 指定属性的技能 | `"MoveType:Water"` |
| `Flag:X` | 指定标记的技能 | `"Flag:Contact"`, `"Flag:Pulse"` |
| `Side:Player` | 玩家方 | `"Side:Player"` |
| `Side:Enemy` | 敌方 | `"Side:Enemy"` |
| `HasAbility:X` | 拥有特定特性 | `"HasAbility:Levitate"` |
| `HasItem:X` | 持有特定道具 | `"HasItem:LifeOrb"` |
| `Grounded` | 接地的宝可梦 | `"Grounded"` |
| `NOT:X` | 取反选择 | `"NOT:Type:Ghost"` |

### 组合选择器

#### AND 逻辑 (用 `+` 或 `&` 连接)

所有条件必须同时满足：

| 组合示例 | 说明 |
|----------|------|
| `MoveType:Water+Flag:Contact` | 水系接触技能 |
| `Type:Fire+HasAbility:FlashFire` | 火系且有引火特性 |
| `Side:Player+Type:Ghost` | 玩家方的幽灵系 |
| `Grounded+Type:Steel` | 接地的钢系宝可梦 |

#### OR 逻辑 (用 `|` 或 `,` 连接)

任一条件满足即可：

| 组合示例 | 说明 |
|----------|------|
| `Type:Poison\|Type:Steel\|Type:Electric` | 毒系或钢系或电系 |
| `Type:Fire,Type:Water,Type:Grass` | 火/水/草系任一 |
| `HasAbility:Levitate\|Type:Flying` | 漂浮特性或飞行系 |

#### 组合使用 NOT

| 组合示例 | 说明 |
|----------|------|
| `NOT:Type:Poison\|Type:Steel\|Type:Electric` | 非(毒/钢/电系) |
| `NOT:HasAbility:Levitate\|Type:Flying` | 非(漂浮或飞行) = 接地 |

### 支持的 Flag 类型

| Flag | 说明 | 示例招式 |
|------|------|----------|
| `contact` | 接触类招式 | Tackle, Close Combat |
| `pulse` | 脉冲类招式 | Aura Sphere, Dragon Pulse |
| `sound` | 声音类招式 | Hyper Voice, Boomburst |
| `punch` | 拳类招式 | Thunder Punch, Mach Punch |
| `bite` | 咬类招式 | Crunch, Psychic Fangs |
| `slicing` | 斩击类招式 | Leaf Blade, Sacred Sword |
| `bullet` | 子弹类招式 | Shadow Ball, Bullet Seed |
| `powder` | 粉末类招式 | Sleep Powder, Spore |
| `wind` | 风类招式 | Hurricane, Tailwind |

---

## 效果原子 (EFFECT_ATOM)

### 数值修正（倍率 0.1 ~ 6.0）

| 效果 | 说明 | 示例 |
|------|------|------|
| `Atk:X` | 物攻倍率 | `"Atk:1.5"` |
| `Def:X` | 物防倍率 | `"Def:0.7"` |
| `SpA:X` | 特攻倍率 | `"SpA:1.3"` |
| `SpD:X` | 特防倍率 | `"SpD:0.8"` |
| `Spe:X` | 速度倍率 | `"Spe:0.67"` |
| `Dmg:X` | 伤害倍率 | `"Dmg:1.2"` |
| `Acc:X` | 命中倍率 | `"Acc:0.8"` |
| `Heal:X` | 回复倍率 | `"Heal:0.5"` |
| `Drain:X` | 吸血效率倍率 | `"Drain:1.5"` |
| `Recoil:X` | 反伤倍率 | `"Recoil:0.5"` |

### HP 变化（回合末）

| 效果 | 说明 | 示例 |
|------|------|------|
| `HP:X` | 回合末 HP 变化（正数回复，负数伤害） | `"HP:-0.0625"` (扣 1/16) |

### 等级修正

| 效果 | 说明 | 示例 |
|------|------|------|
| `CritStage:X` | 暴击等级加成 (-6 ~ +6) | `"CritStage:+1"` |
| `Evasion:X` | 闪避等级加成 (-6 ~ +6) | `"Evasion:+1"` |
| `Priority:X` | 优先度修正 (-7 ~ +7) | `"Priority:+1"` |

### 状态效果

| 效果 | 说明 | 示例 |
|------|------|------|
| `Status:X:P` | 施加状态 (概率 P 可选，默认 1.0) | `"Status:burn:0.2"` (20% 灼伤) |
| `Inflict:X:P` | 同上，别名 | `"Inflict:poison:0.3"` |
| `ImmuneStatus:X` | 免疫状态 | `"ImmuneStatus:freeze"` |
| `Prevent:X` | 阻止施加状态 | `"Prevent:burn"` |
| `Cure:X` | 治愈状态 (X=all 治愈所有) | `"Cure:paralysis"` |

**支持的状态类型：**
- `burn` / `brn` - 灼伤
- `poison` / `psn` - 中毒
- `toxic` / `tox` - 剧毒
- `paralysis` / `par` - 麻痹
- `freeze` / `frz` - 冰冻
- `sleep` / `slp` - 睡眠
- `confusion` / `cnf` - 混乱

### 类型效果

| 效果 | 说明 | 示例 |
|------|------|------|
| `Immune:X` | 免疫属性 | `"Immune:Ground"` |
| `Weak:X` | 追加弱点 | `"Weak:Fire"` |
| `Ban:X` | 禁用属性/技能 | `"Ban:Flying"` |
| `BanItem:X` | 禁用道具 | `"BanItem:Leftovers"`, `"BanItem:Berry"` |
| `Grant:X` | 获得属性 | `"Grant:Ghost"` |
| `ToType:A>B` | 类型转换 | `"ToType:Normal>Electric"` |

---

## 预设模板示例

以下是四个区域天气的 JSON 模板，可作为 AI 创建自定义环境的参考基准。

### 1. 烟霾 (Smog) - N区 需虹区

工业污染环境，毒/钢/电系适应，火系增强但有反冲。

```json
{
  "environment": {
    "weather": null,
    "overlay": {
      "env_name": "烟霾 (Smog)",
      "narrative": "浓重的工业烟雾弥漫，呼吸变得困难，但某些宝可梦在这种环境中如鱼得水...",
      "rules": [
        { "target": "NOT:Type:Poison|Type:Steel|Type:Electric", "eff": ["HP:-0.0625"] },
        { "target": "MoveType:Fire", "eff": ["Dmg:1.2"] },
        { "target": "ALL", "eff": ["Heal:0.5"] }
      ]
    }
  }
}
```

**效果说明：**
- 非(毒/钢/电系)回合末扣 1/16 HP（使用 OR 组合选择器）
- 火系招式威力 x1.2
- 所有回复效果减半

---

### 2. 火山灰 (Ashfall) - A区 极诣区

火山灰覆盖，接地宝可梦速度下降，岩石招式增强，地面招式有灼伤几率。

```json
{
  "environment": {
    "weather": null,
    "overlay": {
      "env_name": "火山灰 (Ashfall)",
      "narrative": "细密的火山灰从天而降，覆盖了整个战场，地面变得滚烫...",
      "rules": [
        { "target": "NOT:Type:Flying", "eff": ["Spe:0.67"] },
        { "target": "NOT:HasAbility:Levitate", "eff": ["Spe:0.67"] },
        { "target": "Type:Steel", "eff": ["Spe:0.5"] },
        { "target": "MoveType:Rock", "eff": ["Dmg:1.2", "CritStage:+1"] },
        { "target": "MoveType:Ground", "eff": ["Dmg:1.1", "Status:burn:0.2"] }
      ]
    }
  }
}
```

**效果说明：**
- 非飞行/漂浮的宝可梦速度 x0.67
- 钢系宝可梦速度 x0.5（叠加后约 x0.33）
- 岩石招式威力 x1.2，暴击等级 +1
- 地面招式威力 x1.1，20% 几率灼伤

---

### 3. 暗影迷雾 (Fog) - S区 暗影区

浓雾笼罩，命中率下降，幽灵/恶系获得闪避优势，阻止冰冻。

```json
{
  "environment": {
    "weather": null,
    "overlay": {
      "env_name": "暗影迷雾 (Shadow Fog)",
      "narrative": "诡异的迷雾从地面升起，视野变得模糊，黑暗中似乎有什么在窥视...",
      "rules": [
        { "target": "NOT:Type:Ghost", "eff": ["Acc:0.8"] },
        { "target": "NOT:Type:Dark", "eff": ["Acc:0.8"] },
        { "target": "Type:Ghost", "eff": ["Dmg:1.2", "Evasion:+1"] },
        { "target": "Type:Dark", "eff": ["Dmg:1.2", "Evasion:+1"] },
        { "target": "Flag:Pulse", "eff": ["Dmg:0.8"] },
        { "target": "ALL", "eff": ["Prevent:freeze"] }
      ]
    }
  }
}
```

**效果说明：**
- 非幽灵/恶系命中率 x0.8
- 幽灵/恶系伤害 x1.2，闪避等级 +1
- 脉冲类招式（光束）威力 x0.8
- 所有宝可梦免疫冰冻（迷雾太温暖）

---

### 4. 香风 (Gale) - B区 盛放区

湿润的热带风，草/水系增强，火系削弱，阻止灼伤，治愈冰冻。

```json
{
  "environment": {
    "weather": "rain",
    "overlay": {
      "env_name": "香风 (Fragrant Gale)",
      "narrative": "温暖湿润的风带来花香与生命力，空气中弥漫着孢子与花粉...",
      "rules": [
        { "target": "Type:Grass", "eff": ["Dmg:1.2", "HP:0.0625", "CritStage:+1"] },
        { "target": "Type:Water", "eff": ["Spe:1.2"] },
        { "target": "MoveType:Fire", "eff": ["Dmg:0.5"] },
        { "target": "Flag:Slicing", "eff": ["Dmg:1.15"] },
        { "target": "Type:Ice", "eff": ["Def:0.7"] },
        { "target": "ALL", "eff": ["Prevent:burn", "Cure:freeze"] }
      ]
    }
  }
}
```

**效果说明：**
- 草系伤害 x1.2，回合末回复 1/16 HP，暴击等级 +1
- 水系速度 x1.2
- 火系招式威力 x0.5
- 斩击类招式威力 x1.15
- 冰系防御 x0.7
- 所有宝可梦免疫灼伤，冰冻状态自动治愈

---

## 设计原则

1. **平衡性**：单个效果倍率建议在 0.5 ~ 1.5 之间，避免极端数值
2. **主题性**：环境效果应与场景叙事一致
3. **对称性**：有增益就应有减益，保持战斗公平
4. **可读性**：`env_name` 和 `narrative` 应清晰描述环境特点

---

## 与硬编码天气的关系

以下天气仍为引擎硬编码，具有复杂的游戏机制，不通过 overlay 系统实现：

| 天气 | 说明 |
|------|------|
| `sun` / `harshsun` | 晴天 / 大日照 |
| `rain` / `heavyrain` | 雨天 / 大雨 |
| `sandstorm` | 沙暴 |
| `snow` | 雪天 |
| `deltastream` | 乱气流 |
| `ambrosia` | 神之琼浆（C区特殊环境） |
| `chronalrift` | 时空裂隙（S区特殊环境） |

这些天气可与 `overlay` 叠加使用，例如：

```json
{
  "environment": {
    "weather": "rain",
    "overlay": {
      "env_name": "暴风雨海岸",
      "narrative": "狂风暴雨中，海浪拍打着礁石...",
      "rules": [
        { "target": "Type:Water", "eff": ["Spe:1.3"] },
        { "target": "Type:Electric", "eff": ["Dmg:1.2"] }
      ]
    }
  }
}
```

---

## 高级示例：组合选择器

### 5. 熔岩洞穴 (Magma Cavern)

展示组合选择器的高级用法：

```json
{
  "environment": {
    "weather": "sun",
    "overlay": {
      "env_name": "熔岩洞穴",
      "narrative": "炽热的岩浆在脚下流淌，空气中弥漫着硫磺的气息...",
      "rules": [
        { "target": "Grounded", "eff": ["HP:-0.0625"] },
        { "target": "Grounded+Type:Steel", "eff": ["HP:-0.125", "Spe:0.5"] },
        { "target": "Type:Fire+HasAbility:FlashFire", "eff": ["Dmg:1.5", "HP:0.0625"] },
        { "target": "MoveType:Water+Flag:Contact", "eff": ["Dmg:0.5", "Recoil:1.5"] },
        { "target": "MoveType:Fire+Flag:Pulse", "eff": ["Dmg:1.3"] },
        { "target": "HasItem:AirBalloon", "eff": ["Immune:Ground"] },
        { "target": "ALL", "eff": ["BanItem:Berry", "Drain:0.5"] }
      ]
    }
  }
}
```

**效果说明：**
- 接地宝可梦回合末扣 1/16 HP
- 接地的钢系宝可梦回合末扣 1/8 HP，速度 x0.5
- 火系且有引火特性的宝可梦伤害 x1.5，回合末回复 1/16 HP
- 水系接触技能威力 x0.5，反伤 x1.5
- 火系脉冲技能威力 x1.3
- 持有气球的宝可梦免疫地面
- 所有树果被禁用，吸血效率减半

---

## API 查询函数参考

引擎内部使用以下 API 查询环境效果：

| API | 用途 | 返回值 |
|-----|------|--------|
| `getStatMod(pokemon, stat)` | 能力值修正 | 倍率 (0.1~6.0) |
| `getDamageMod(attacker, defender, move)` | 伤害修正 | 倍率 (0.1~6.0) |
| `getHealMod(pokemon)` | 回复效果修正 | 倍率 (0.1~3.0) |
| `getDrainMod(pokemon, move)` | 吸血效率修正 | 倍率 (0~3.0) |
| `getRecoilMod(pokemon, move)` | 反伤修正 | 倍率 (0~3.0) |
| `getCritStage(pokemon, move)` | 暴击等级加成 | -6 ~ +6 |
| `getEvasionStage(pokemon)` | 闪避等级加成 | -6 ~ +6 |
| `getPriorityMod(pokemon, move)` | 优先度修正 | -7 ~ +7 |
| `getAccuracyMod(attacker, move)` | 命中率修正 | 倍率 |
| `isMoveBanned(pokemon, move)` | 技能禁用检查 | boolean |
| `isItemBanned(pokemon, itemId)` | 道具禁用检查 | boolean |
| `isStatusPrevented(pokemon, status)` | 状态阻止检查 | boolean |
| `getStatusEffects(pokemon)` | 状态效果汇总 | Object |
| `getTypeOverrides(pokemon)` | 类型覆盖 | Object |
| `getMoveTypeConversion(move)` | 技能类型转换 | string |
| `getTurnEndHPChange(pokemon)` | 回合末 HP 变化 | number |
| `tryInflictStatus(pokemon, move)` | 尝试施加状态 | Object |
