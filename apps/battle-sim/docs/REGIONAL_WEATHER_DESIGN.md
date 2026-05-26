# 洛迪亚特区天气系统设计文档

## 概述

本文档规划洛迪亚特区 (Rhodia Region) 的六种特色天气/环境效果。这些天气分为两类：

1. **区域天气 (Regional Weather)**: N/A/S/B 四区的常驻环境效果
2. **剧情天气 (Story Weather)**: Boss 战/特殊事件触发的异象

---

## 一、区域天气 (Regional Weather)

### 1. N 区 - Smog (烟霾) ✅ 已实现

**世界观**: N 区 (Neon/霓虹区) 是高科技、不夜城、重污染、资本主义和赛博朋克的结合体。核心 Gameplay 体验是**"快节奏、致死率高、侵略性强"**，排斥任何形式的"消极比赛"。

**引擎 ID**: `smog`

**视觉效果** (已实现于 `battle-weather.js`):
- 紫绿色浑浊滤镜 + 旧显像管故障横纹
- 上浮且扭曲的气泡粒子
- CSS 背景类: `bg-smog`

---

#### 核心机制 (Primary Mechanics)

| 效果名 | 描述 | 实现位置 | 状态 |
|--------|------|----------|------|
| **A. 呼吸道腐蚀 (Respiratory Breakdown)** | 非毒/钢/电系每回合损耗 **1/16 HP** | `weather-effects.js` → `battle-turns.js` | ✅ |
| **B. 化学屏障 (Chemical Inertia)** | 所有 HP 回复效果 **减半 (×0.5)** | `Pokemon.heal()` in `battle-engine.js` | ✅ |

**免疫类型**: `Poison`, `Steel`, `Electric`
**免疫特性**: `Overcoat`, `Magic Guard`, `White Smoke`, `Clear Body`, `Full Metal Body`

---

#### 生态与技能连携 (Synergy & Interactions)

| 效果名 | 描述 | 实现位置 | 状态 |
|--------|------|----------|------|
| **C. 腐蚀气体 (Toxic Rain)** | 剧毒/毒瓦斯/催眠粉/麻痹粉等气体/粉尘招式 **必中** | `battle-calc.js` | ✅ |
| **D. 易爆气体 (Volatile Fumes)** | 火系招式威力 **×1.2**，但造成伤害的 **10% 反冲** | `weather-effects.js` → `battle-calc.js` → `battle-damage.js` | ✅ |

**必中招式列表**: `Toxic`, `Poison Gas`, `Sleep Powder`, `Stun Spore`, `Poison Powder`, `Spore`, `Rage Powder`, `Cotton Spore`, `Smog`, `Clear Smog`, `Acid Spray`, `Venom Drench`, `Gastro Acid` + 所有 `flags.powder = true` 的招式

---

#### 特性微调 (Ability Hooks)

| 特性 | 原版效果 | Smog 下效果 | 实现位置 | 状态 |
|------|----------|-------------|----------|------|
| **Stench (恶臭)** | 10% 畏缩 | **30% 畏缩** | `battle-effects.js` | ✅ |
| **White Smoke / Clear Body** | 防止能力下降 | **免疫回合末伤害** | `weather-effects.js` (immuneAbilities) | ✅ |

---

#### 战术画像

> *"这是一场没有氧气的肺活量比赛，谁先不换气得手，谁就能活下去；谁想停下来喘口气（回血），谁就得死。"*

- ❌ **不要用受队 (Stall)**：幸福蛋每回合掉血 + 奶量减半 ≈ 裸奔
- ✅ **速攻干扰流**：必中剧毒/催眠废掉对手，高火力收割
- ✅ **电/火爆破**：利用环境优势对轰，自损一千伤敌八百

---

**JSON 配置**:
```json
{
  "environment": {
    "weather": "smog",
    "weatherTurns": 0
  }
}
```

**API 调用示例**:
```javascript
// 检查回复减半
const healMult = window.WeatherEffects.getHealingMultiplier('smog'); // 0.5

// 检查气体招式必中
const isGuaranteed = window.WeatherEffects.isGasMoveGuaranteedHit('smog', move); // true/false

// 检查火系反冲
const recoil = window.WeatherEffects.getWeatherRecoilPercent('smog', 'Fire'); // 0.10

// 检查特性增强
const boost = window.WeatherEffects.getAbilityWeatherBoost('smog', 'stench'); 
// { type: 'flinchChance', value: 0.30 }
```

---

### 2. A 区 - Ashfall (火山灰)

**世界观**: A 区是重工业与火山地带，空气飘散白色灰烬。

**视觉效果** (已实现于 `battle-weather.js`):
- 灰色方块状粒子缓慢下落
- 地面逐渐变灰
- CSS 背景类: `bg-ashfall`

**引擎机制**:

| 效果名 | 描述 | 实现位置 |
|--------|------|----------|
| **行动受阻 (Clogged Gears)** | 接地宝可梦入场时速度 -1 级 | `index.js` (入场钩子) |
| **覆盖失效 (Covered)** | Leftovers / Black Sludge 失效 | `battle-turns.js` / `items-data.js` |

**免疫类型**: `Fire`, `Rock` (不受速度惩罚)

**接地判定**: 飞行系、浮游特性、气球道具 = 不接地

---

### 3. S 区 - Fog (大雾)

**世界观**: S 区是旧街区，湿度极大，灵异传说盛行。

**视觉效果** (已实现于 `battle-weather.js`):
- 巨大白色雾块缓慢飘动
- 乳白色高斯模糊覆盖层
- CSS 背景类: `bg-fog`

**引擎机制**:

| 效果名 | 描述 | 实现位置 |
|--------|------|----------|
| **视觉遮断 (Blind Spot)** | 所有宝可梦命中率 ×0.8 | `battle-calc.js` |
| **幽灵感知 (Spectral Sight)** | 幽灵/恶系无视命中惩罚 | `battle-calc.js` |
| **清雾互动** | Defog 清除雾并阻止 3 回合内产生新雾 | `move-handlers.js` |

**免疫类型**: `Ghost`, `Dark` (命中率不受影响)

---

### 4. B 区 - Gale (大风)

**世界观**: B 区靠海，热带风暴角，气流紊乱强劲。

**视觉效果** (已实现于 `battle-weather.js`):
- 极速青色风线横向移动
- 植物背景剧烈摇晃
- CSS 背景类: `bg-gale`

**引擎机制**:

| 效果名 | 描述 | 实现位置 |
|--------|------|----------|
| **气流扰动 (Turbulence)** | 粉末/气体类招式失效 | `battle-calc.js` / `move-handlers.js` |
| **场地清空 (Blow Away)** | 撒钉类招式失败 | `move-handlers.js` |
| **顺风借力** | 飞行系招式威力 ×1.2 | `battle-calc.js` |

**失效招式列表** (flags.powder = true):
- Sleep Powder, Stun Spore, Poison Powder
- Rage Powder, Spore, Cotton Spore
- Poison Gas, etc.

**失效撒钉招式**:
- Stealth Rock, Spikes, Toxic Spikes, Sticky Web

---

## 二、剧情天气 (Story Weather)

### 5. 粉雾过载 (Ambrosia Overdrive)

**触发条件**: 异兽降临、以太之塔周边、重要 Boss 战

**世界观**: 神馔 (Ambrosia) 浓度过高产生的异象，情感转化为力量。

**视觉效果** (已实现于 `battle-weather.js`):
- 粉红色能量粒子上浮
- 屏幕边缘粉红色呼吸辉光
- 战斗文本使用 Hotpink 高亮
- CSS 背景类: `bg-ambrosia`

**引擎机制**:

| 效果名 | 描述 | 实现位置 |
|--------|------|----------|
| **唯心实体化** | 全场暴击率 +1 级 | `battle-calc.js` |
| **AVS 极值化** | AVS 触发几率 ×2.0 | `battle-engine.js` (Pokemon.takeDamage) |
| **人类时空醉** | 使用 Mega/Z/极巨/太晶后，宝可梦下回合混乱 | `index.js` (机制触发后) |
| **场地增幅** | 薄雾场地/精神场地持续时间无限 | `battle-engine.js` (tickFieldConditions) |

**JSON 配置**:
```json
{
  "environment": {
    "weather": "ambrosia",
    "weatherTurns": 0
  }
}
```

---

### 6. 时空裂隙 (Chronal Rift / Distortion)

**触发条件**: S 区深处、时空难民相关剧情、悖谬种捕捉

**世界观**: 时空扭曲产生的现象，古代/未来种的专属环境。

**视觉效果** (已实现于 `battle-weather.js`):
- 故障艺术 (Glitch Art) 风格横纹
- RGB 色块随机闪烁跳动
- P-Phone UI 偶尔乱码
- CSS 背景类: `bg-distortion`

**引擎机制**:

| 效果名 | 描述 | 实现位置 |
|--------|------|----------|
| **古今悖论** | Protosynthesis / Quark Drive 无条件激活 | `ability-handlers.js` |
| **洗翠古武传承** | 刚猛/迅疾风格冷却移除 | `mechanics/move-styles.js` |
| **速度熵增** | 每 3 回合随机切换戏法空间状态 | `battle-engine.js` (tickFieldConditions) |
| **Tier 3 压制** | 普通天气只能持续 3 回合 | `ability-handlers.js` (天气特性) |

---

## 三、实现架构

### 推荐新增文件

```
engine/
  weather-effects.js    # 新增：统一天气效果模块
```

### `weather-effects.js` 模块设计

```javascript
/**
 * 天气效果配置
 * 集中管理所有天气的机制逻辑
 */
export const WEATHER_CONFIG = {
    // 区域天气
    smog: {
        name: '烟霾',
        icon: '🏭',
        damagePerTurn: 1/16,
        immuneTypes: ['Poison', 'Steel', 'Electric'],
        healingMultiplier: 0.5,  // 回复效果减半
        visualKey: 'smog'
    },
    ashfall: {
        name: '火山灰',
        icon: '🌋',
        onEntry: { stat: 'spe', stages: -1 },
        immuneTypes: ['Fire', 'Rock'],
        disabledItems: ['Leftovers', 'Black Sludge'],
        requiresGrounded: true,
        visualKey: 'ashfall'
    },
    fog: {
        name: '大雾',
        icon: '🌫️',
        accuracyMultiplier: 0.8,
        immuneTypes: ['Ghost', 'Dark'],
        canBeCleared: true,
        clearCooldown: 3,
        visualKey: 'fog'
    },
    gale: {
        name: '大风',
        icon: '💨',
        disabledFlags: ['powder'],
        disabledHazards: true,
        flyingPowerBoost: 1.2,
        visualKey: 'gale'
    },
    
    // 剧情天气
    ambrosia: {
        name: '粉雾过载',
        icon: '✨',
        critStageBoost: 1,
        avsMultiplier: 2.0,
        mechanicConfusion: true,
        terrainDurationInfinite: ['mistyterrain', 'psychicterrain'],
        visualKey: 'ambrosia'
    },
    distortion: {
        name: '时空裂隙',
        icon: '🌀',
        forceAbilities: ['Protosynthesis', 'Quark Drive'],
        removeStyleCooldown: true,
        trickRoomCycle: 3,
        weatherDurationCap: 3,
        visualKey: 'distortion'
    }
};

/**
 * 检查宝可梦是否免疫当前天气伤害
 */
export function isWeatherImmune(pokemon, weather) {
    const config = WEATHER_CONFIG[weather];
    if (!config || !config.immuneTypes) return false;
    return pokemon.types.some(t => config.immuneTypes.includes(t));
}

/**
 * 获取天气对回复效果的修正
 */
export function getHealingMultiplier(weather) {
    const config = WEATHER_CONFIG[weather];
    return config?.healingMultiplier ?? 1;
}

/**
 * 获取天气对命中率的修正
 */
export function getAccuracyMultiplier(weather, attackerTypes) {
    const config = WEATHER_CONFIG[weather];
    if (!config?.accuracyMultiplier) return 1;
    // 检查免疫
    if (config.immuneTypes && attackerTypes.some(t => config.immuneTypes.includes(t))) {
        return 1;
    }
    return config.accuracyMultiplier;
}

/**
 * 检查招式是否被天气禁用
 */
export function isMoveDisabledByWeather(move, weather) {
    const config = WEATHER_CONFIG[weather];
    if (!config) return false;
    
    // 粉末类招式检查
    if (config.disabledFlags && move.flags) {
        for (const flag of config.disabledFlags) {
            if (move.flags[flag]) return true;
        }
    }
    
    // 撒钉类招式检查
    if (config.disabledHazards) {
        const hazardMoves = ['stealthrock', 'spikes', 'toxicspikes', 'stickyweb'];
        const moveId = (move.name || '').toLowerCase().replace(/[^a-z]/g, '');
        if (hazardMoves.includes(moveId)) return true;
    }
    
    return false;
}
```

---

## 四、实现优先级

### Phase 1: 基础框架
1. 创建 `engine/weather-effects.js` 模块
2. 在 `battle-turns.js` 中集成天气伤害逻辑
3. 在 `battle-calc.js` 中集成命中率/威力修正

### Phase 2: 区域天气
1. Smog (N区) - 伤害 + 回复减半
2. Fog (S区) - 命中率修正
3. Gale (B区) - 招式禁用 + 飞行加成
4. Ashfall (A区) - 入场减速 + 道具禁用

### Phase 3: 剧情天气
1. Ambrosia - 暴击 + AVS 增幅
2. Distortion - 悖谬种特性 + 戏法空间循环

### Phase 4: 测试与平衡
1. 编写测试用例
2. 平衡数值调整
3. 文档更新

---

## 五、与现有系统的交互

### 环境天气系统
新天气完全兼容现有的 `environment.weather` JSON 配置：
```json
{
  "settings": { "enableEnvironment": true },
  "environment": {
    "weather": "smog",
    "weatherTurns": 0
  }
}
```

### 天气特性
新天气不会被普通天气特性 (Drizzle, Drought 等) 覆盖，类似始源天气的优先级处理。

### 清除浓雾 (Defog)
Defog 对 Fog 天气有特殊交互：清除当前雾并设置 3 回合冷却。

---

## 六、CSS 背景类参考

需要在 `index.css` 中添加以下背景类：

```css
/* 区域天气 */
.bg-smog { 
    background: linear-gradient(135deg, rgba(128, 0, 128, 0.15), rgba(0, 128, 0, 0.1)); 
}
.bg-ashfall { 
    background: linear-gradient(135deg, rgba(128, 128, 128, 0.2), rgba(64, 64, 64, 0.15)); 
}
.bg-fog { 
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(200, 200, 220, 0.2)); 
}
.bg-gale { 
    background: linear-gradient(135deg, rgba(100, 200, 255, 0.15), rgba(150, 255, 200, 0.1)); 
}

/* 剧情天气 */
.bg-ambrosia { 
    background: linear-gradient(135deg, rgba(255, 20, 147, 0.15), rgba(255, 182, 193, 0.1)); 
}
.bg-distortion { 
    background: linear-gradient(135deg, rgba(50, 255, 50, 0.1), rgba(255, 0, 255, 0.1)); 
}
```

---

## 七、日志格式规范

### 天气伤害日志
```html
<span style="color:#9b59b6">🏭 {pokemon.cnName} 因烟霾受到伤害! (-{dmg})</span>
```

### 天气效果日志
```html
<span style="color:#9b59b6">🌋 {pokemon.cnName} 被火山灰覆盖，速度下降了!</span>
<span style="color:#9b59b6">🌫️ 浓雾遮蔽了视野...</span>
<span style="color:#9b59b6">💨 风太大了！{move.cn} 被吹散了!</span>
```

### 剧情天气日志
```html
<span style="color:#ff1493">✨ 粉雾浓度过载！情感开始实体化...</span>
<span style="color:#00ff00">🌀 时空开始扭曲...</span>
```

---

## 八、待讨论事项

1. **Smog 的电系免疫**：是否符合世界观？电系代表"都市属性"的设定是否足够直观？

2. **Distortion 的戏法空间循环**：随机性是否会导致游戏体验不佳？是否需要可预测的循环模式？

3. **Ambrosia 的机制混乱惩罚**：是否过于严厉？是否需要调整为"下回合命中率-20%"等更温和的惩罚？

4. **天气优先级**：区域天气是否应该像始源天气一样不可被覆盖？还是允许玩家通过天气技能临时改变？

---

*文档版本: v1.0*
*最后更新: 2026-01-25*
