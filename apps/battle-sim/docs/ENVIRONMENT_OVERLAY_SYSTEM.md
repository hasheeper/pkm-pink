# Environment Overlay System (环境图层系统)

> **核心理念**: 让 AI 用"文学描述"生成"数学原子"，JS 引擎只负责执行。

---

## 一、系统概述

### 1.1 设计哲学

| 传统方案 | 本方案 |
|---------|--------|
| AI 需要记住复杂规则 | AI 只需填 JSON 模板 |
| 每种天气/场地写死代码 | 统一的原子解析器 |
| 有限的预设效果 | 无限的动态生成 |

### 1.2 三大原子类型 (Finite Mechanics)

```
┌─────────────────────────────────────────────────────────┐
│  A类: 数值修正 (Stat Mod)                               │
│  ├─ Atk / Def / SpA / SpD / Spd × N                    │
│  ├─ Acc / Crit / Eva × N                               │
│  └─ Dmg × N (技能威力)                                  │
├─────────────────────────────────────────────────────────┤
│  B类: 资源跳动 (HP/Resource)                            │
│  ├─ HP ± N% (每回合)                                    │
│  └─ PP ± N (可选扩展)                                   │
├─────────────────────────────────────────────────────────┤
│  C类: 类型与免控 (Tags)                                 │
│  ├─ Immune:Type (免疫某属性)                            │
│  ├─ Weak:Type (弱点追加)                                │
│  ├─ Ban:Type / Ban:Move (禁用)                          │
│  └─ Grant:Type (获得属性)                               │
└─────────────────────────────────────────────────────────┘
```

---

## 二、JSON 协议规范

### 2.1 完整结构

```json
{
  "env_id": "radiation_rain",
  "env_name": "辐射酸雨",
  "narrative": "腐蚀性的绿色酸雨从天而降...",
  "duration": 5,
  "rules": [
    {
      "target": "<目标选择器>",
      "eff": ["<效果原子1>", "<效果原子2>"]
    }
  ]
}
```

### 2.2 目标选择器 (Target Selector)

| 选择器 | 含义 | 示例 |
|--------|------|------|
| `ALL` | 所有宝可梦 | `"target": "ALL"` |
| `Type:X` | 某属性宝可梦 | `"target": "Type:Steel"` |
| `MoveType:X` | 某属性技能 | `"target": "MoveType:Fire"` |
| `Side:Player` | 玩家方 | `"target": "Side:Player"` |
| `Side:Enemy` | 敌方 | `"target": "Side:Enemy"` |
| `HasAbility:X` | 拥有某特性 | `"target": "HasAbility:Swift Swim"` |
| `NOT:X` | 取反 | `"target": "NOT:Type:Flying"` |

### 2.3 效果原子 (Effect Atoms)

#### A类：数值修正
```
"Atk:1.5"      // 攻击 ×1.5
"Def:0.7"      // 防御 ×0.7
"Spd:0.5"      // 速度 ×0.5
"Acc:0.8"      // 命中 ×0.8
"Crit:2.0"     // 暴击率 ×2
"Dmg:1.3"      // 伤害 ×1.3
```

#### B类：资源跳动
```
"HP:-0.125"    // 每回合扣 1/8 HP
"HP:0.0625"    // 每回合回 1/16 HP
"HP:-0.25:once" // 立即扣 1/4 HP (一次性)
```

#### C类：类型与免控
```
"Immune:Ground"     // 免疫地面
"Weak:Fire"         // 追加火系弱点
"Ban:Flying"        // 禁用飞行系技能
"Ban:Move:Protect"  // 禁用守住
"Grant:Ghost"       // 获得幽灵属性
"Cure:Burn"         // 治愈烧伤
"Status:Paralysis"  // 施加麻痹
```

---

## 三、实现难度评估

### 3.1 模块拆分

| 模块 | 难度 | 工时估算 | 说明 |
|------|------|----------|------|
| JSON 解析器 | ⭐⭐ | 2h | 正则匹配 + 容错处理 |
| 目标选择器 | ⭐⭐⭐ | 3h | 需要访问战斗状态 |
| 数值修正执行 | ⭐⭐ | 2h | 挂载到现有 stat 计算 |
| HP 跳动执行 | ⭐ | 1h | 回合末 hook |
| 类型/免控执行 | ⭐⭐⭐ | 4h | 需要修改伤害计算流程 |
| AI Prompt 模板 | ⭐ | 1h | 世界书条目 |
| **总计** | | **~13h** | |

### 3.2 依赖分析

```
environment-overlay.js (新文件)
    │
    ├── 需要 hook 进 battle-engine.js
    │   ├── onTurnEnd (HP 跳动)
    │   ├── getStatModifier (数值修正)
    │   └── getDamageMultiplier (伤害修正)
    │
    ├── 需要 hook 进 battle-damage.js
    │   └── typeEffectiveness (类型覆盖)
    │
    └── 需要读取 battle-engine.js 的战斗状态
        └── 当前宝可梦属性、特性等
```

---

## 四、实现路线图

### Phase 1: 基础框架 (MVP)
```
□ 创建 environment-overlay.js
□ 实现 JSON 解析器 (parseEnvironmentJSON)
□ 实现基础目标选择器 (ALL, Type:X)
□ 实现数值修正 (Stat Mod)
□ 测试：手动注入一个简单环境
```

### Phase 2: 完整功能
```
□ 实现 HP 跳动 (回合末 hook)
□ 实现类型免疫/弱点覆盖
□ 实现 Ban 禁用系统
□ 扩展目标选择器 (MoveType, Side, NOT)
```

### Phase 3: AI 集成
```
□ 编写 AI Prompt 模板
□ 在 ST 世界书中添加环境生成指令
□ 实现 AI 输出 → JSON 注入的桥接
□ 添加环境 UI 显示
```

---

## 五、代码骨架预览

```javascript
// environment-overlay.js

class EnvironmentOverlay {
  constructor() {
    this.activeEnvs = [];  // 当前激活的环境列表
  }

  // 注入新环境
  inject(envJSON) {
    const env = this.parse(envJSON);
    this.activeEnvs.push(env);
    return env;
  }

  // 解析 JSON
  parse(json) {
    // 容错解析，支持模糊匹配
  }

  // 获取某宝可梦的数值修正
  getStatMod(pokemon, statName) {
    let multiplier = 1;
    for (const env of this.activeEnvs) {
      for (const rule of env.rules) {
        if (this.matchTarget(rule.target, pokemon)) {
          multiplier *= this.extractStatMod(rule.eff, statName);
        }
      }
    }
    return multiplier;
  }

  // 获取回合末 HP 变化
  getTurnEndHPChange(pokemon) { ... }

  // 获取类型覆盖
  getTypeOverrides(pokemon) { ... }

  // 目标匹配器
  matchTarget(selector, context) { ... }
}

// 全局单例
window.envOverlay = new EnvironmentOverlay();
```

---

## 六、AI Prompt 模板 (世界书用)

```
【环境效果生成指令】

当你需要创建一个特殊的战斗环境时，请输出以下 JSON 格式：

{
  "env_name": "环境名称",
  "narrative": "一句话描述",
  "rules": [
    { "target": "目标", "eff": ["效果1", "效果2"] }
  ]
}

可用目标: ALL, Type:X, MoveType:X, Side:Player, Side:Enemy
可用效果:
- 数值: Atk/Def/SpA/SpD/Spd/Acc/Crit/Dmg:倍率
- 血量: HP:±小数 (正数回血，负数扣血)
- 类型: Immune:X, Weak:X, Ban:X, Grant:X

示例 - 重力场:
{
  "env_name": "重力塌缩",
  "rules": [
    { "target": "ALL", "eff": ["Spd:0.5", "Acc:1.2"] },
    { "target": "Type:Flying", "eff": ["Immune:Ground:remove"] }
  ]
}
```

---

## 七、风险与对策

| 风险 | 对策 |
|------|------|
| AI 输出格式不规范 | 宽松正则 + 默认值兜底 |
| 效果叠加冲突 | 定义优先级规则 |
| 性能问题 | 缓存计算结果，仅在环境变化时重算 |
| 破坏游戏平衡 | 设置数值上下限 (如倍率 0.1~10) |

---

## 八、实现状态 ✅

### Phase 1 已完成

| 功能 | 状态 | 文件 |
|------|------|------|
| JSON 解析器 | ✅ | `systems/environment-overlay.js` |
| 目标选择器 (ALL, Type:X, MoveType:X, Side, NOT) | ✅ | `systems/environment-overlay.js` |
| 数值修正 (Stat Mod) | ✅ | Hook 到 `Pokemon.getStat()` |
| HP 跳动 (回合末) | ✅ | Hook 到 `battle-turns.js` |
| API 导出 | ✅ | `data-loader.js` |

### Phase 2 已完成

| 功能 | 状态 | 文件 |
|------|------|------|
| 伤害修正 (Dmg Mod) | ✅ | Hook 到 `battle-calc.js` |
| 类型免疫覆盖 (Immune:X) | ✅ | Hook 到 `battle-calc.js` |
| 类型弱点追加 (Weak:X) | ✅ | Hook 到 `battle-calc.js` |
| 技能禁用 (Ban:X) - 玩家 | ✅ | Hook 到 `index.js handleAttack()` |
| 技能禁用 (Ban:X) - AI | ✅ | Hook 到 `ai-engine.js rankMovesByScore()` |
| 环境 UI 显示 | ✅ | `index.html` + `index.css` |

### 使用方法

#### 1. 在控制台手动注入
```javascript
// 注入一个简单的环境
injectEnvironmentOverlay({
  "env_name": "重力塌缩",
  "narrative": "这里的重力异常强大...",
  "rules": [
    { "target": "ALL", "eff": ["Spd:0.5"] },
    { "target": "Type:Flying", "eff": ["Def:0.7"] }
  ]
});

// 查看当前环境
envOverlay.debug();

// 清除所有环境
clearEnvironmentOverlay();
```

#### 2. 在战斗 JSON 中配置
```json
{
  "environment": {
    "weather": "rain",
    "overlay": {
      "env_name": "辐射酸雨",
      "rules": [
        { "target": "Type:Steel", "eff": ["Def:0.7", "HP:-0.125"] },
        { "target": "Type:Poison", "eff": ["Spd:1.5", "HP:0.06"] }
      ]
    }
  }
}
```

#### 3. AI 动态生成 (世界书调用)
```javascript
// AI 输出 JSON 后，直接调用
const aiOutput = `{
  "env_name": "时空裂隙",
  "rules": [
    { "target": "MoveType:Psychic", "eff": ["Dmg:1.5"] },
    { "target": "ALL", "eff": ["Acc:0.9"] }
  ]
}`;
injectEnvironmentOverlay(aiOutput);
```

---

## 九、总结

**实现状态**: ✅ Phase 1 + Phase 2 完成

**核心价值**: 
- 将 AI 从"规则执行者"解放为"规则创造者"
- 用有限的代码支撑无限的玩法
- 真正实现 Text-to-Gameplay

**后续扩展 (Phase 3 可选)**:
- 属性获得 (`Grant:X`) - 动态添加属性
- 命中率修正 (`Acc:X`)
- 暴击率修正 (`Crit:X`)
- 多环境叠加显示优化
- 环境持续时间 UI 倒计时
