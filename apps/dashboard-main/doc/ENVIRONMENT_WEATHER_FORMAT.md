# 环境天气 JSON 格式文档

## 概述

环境天气是战斗场景中的持久性天气效果，由地图/剧情/Boss 战触发，具有对宝可梦天气技能的**压制能力**。

**核心概念**：
- **环境天气 (Environment Weather)**: 场景固有天气，通常无限持续
- **宝可梦天气 (Pokémon Weather)**: 由招式/特性触发的天气 (rain/sun/sandstorm/snow)
- **压制 (Suppression)**: 环境天气对宝可梦天气的影响

---

## JSON 格式

### 完整示例

```json
{
  "environment": {
    "weather": "chronalrift",
    "weatherTurns": 0,
    "revertMessage": "时空的扭曲再次笼罩了战场...",
    "suppression": {
      "blocked": ["rain", "sun"],
      "suppressed": ["sandstorm", "snow"]
    },
    "effects": {
      "autoParadox": true,
      "unboundArts": true,
      "speedEntropy": true,
      "digitalGlitch": true
    }
  }
}
```

---

## 字段说明

### `environment` 对象

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `weather` | string | ✅ | 环境天气 ID |
| `weatherTurns` | number | ❌ | 持续回合数，`0` = 无限 (默认) |
| `revertMessage` | string | ❌ | 宝可梦天气结束后回归环境天气时的消息 |
| `suppression` | object | ❌ | 压制配置 (见下文) |
| `effects` | object | ❌ | 环境特效开关 |

### `suppression` 压制配置

压制系统决定宝可梦天气技能（求雨、大晴天、沙暴、冰雹/雪天）在环境天气下的行为。

#### 方式一：全局设置

```json
{
  "suppression": {
    "all": "blocked"
  }
}
```

| `all` 值 | 效果 |
|----------|------|
| `"normal"` | 无压制，宝可梦天气正常展开 |
| `"suppressed"` | 所有宝可梦天气持续回合减半 |
| `"blocked"` | 所有宝可梦天气技能直接失败 |

#### 方式二：按天气设置 (推荐)

```json
{
  "suppression": {
    "blocked": ["rain", "sun"],
    "suppressed": ["sandstorm", "snow"]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `blocked` | string[] | 完全阻止的天气列表，技能直接失败 |
| `suppressed` | string[] | 被抑制的天气列表，持续回合减半 |

**优先级**: `blocked` > `suppressed` > `all`

**支持的天气 ID**:
- `rain` - 雨天
- `sun` - 晴天
- `sandstorm` - 沙暴
- `snow` / `hail` - 雪天 (两者等价)

#### 方式三：旧版兼容

```json
{
  "environment": {
    "suppressionTier": 3
  }
}
```

| `suppressionTier` | 等价于 |
|-------------------|--------|
| `1` | 无压制 |
| `2` | `{ "all": "suppressed" }` |
| `3` | `{ "all": "blocked" }` |

> ⚠️ **已废弃**: 建议使用新版 `suppression` 格式

---

## 使用场景示例

### 场景 1: 时空裂隙 - 完全压制所有天气

```json
{
  "environment": {
    "weather": "chronalrift",
    "weatherTurns": 0,
    "suppression": {
      "all": "blocked"
    }
  }
}
```

**效果**: 任何宝可梦天气技能都会失败，显示 "时空裂隙的力量太过强大，雨天无法生效！"

### 场景 2: 火山灰 - 只阻止雨天

```json
{
  "environment": {
    "weather": "ashfall",
    "weatherTurns": 0,
    "suppression": {
      "blocked": ["rain"],
      "suppressed": ["snow"]
    }
  }
}
```

**效果**:
- 求雨 → 失败
- 大晴天 → 正常 (5/8 回合)
- 沙暴 → 正常 (5/8 回合)
- 冰雹/雪天 → 回合减半 (2/4 回合)

### 场景 3: 迷雾 - 抑制所有天气但不阻止

```json
{
  "environment": {
    "weather": "fog",
    "weatherTurns": 0,
    "suppression": {
      "all": "suppressed"
    }
  }
}
```

**效果**: 所有宝可梦天气持续回合减半

### 场景 4: 普通区域 - 无压制

```json
{
  "environment": {
    "weather": "gale",
    "weatherTurns": 0,
    "suppression": {
      "all": "normal"
    }
  }
}
```

**效果**: 宝可梦天气正常展开，不受影响

### 场景 5: 无环境天气

```json
{
  "environment": null
}
```

或直接省略 `environment` 字段。

---

## API 调用

### 解析环境配置

```javascript
// 从 JSON 解析环境配置
const envConfig = window.parseEnvironmentConfig(json.environment);
// 返回: { weather, weatherTurns, revertMessage, suppression, effects }

// 应用到战斗实例
window.applyEnvironmentConfig(battle, envConfig);
```

### 检查天气压制状态

```javascript
// 检查特定天气的压制状态
const status = window.WeatherEffects.getWeatherSuppressionStatus(battle, 'rain');
// 返回: { status: 'normal'|'suppressed'|'blocked', reason: string }

if (status.status === 'blocked') {
    console.log('雨天被阻止:', status.reason);
} else if (status.status === 'suppressed') {
    console.log('雨天被抑制:', status.reason);
}
```

### 展开宝可梦天气 (统一入口)

```javascript
// 使用统一入口函数展开天气
const result = window.WeatherEffects.tryDeployWeather(battle, 'rain', {
    itemId: pokemon.item,      // 检查延长岩石
    weatherName: '雨天',        // 日志显示名
    visualKey: 'rain'          // 视觉效果 key
});

if (result.success) {
    console.log(`雨天展开成功，持续 ${result.weatherTurns} 回合`);
    result.logs.forEach(log => addBattleLog(log));
} else {
    console.log('雨天展开失败');
    result.logs.forEach(log => addBattleLog(log));
}
```

---

## 环境天气 ID 列表

### 区域天气 (Regional)

| ID | 名称 | 默认压制 |
|----|------|----------|
| `smog` | 烟霾 (N区) | suppressed |
| `ashfall` | 火山灰 (A区) | suppressed |
| `fog` | 暗影迷雾 (S区) | suppressed |
| `gale` | 香风 (B区) | suppressed |

### 环境天气 (Environmental)

| ID | 名称 | 默认压制 |
|----|------|----------|
| `ambrosia` | 神之琼浆 (C区) | suppressed |
| `chronalrift` | 时空裂隙 (S区绝对领域) | blocked |

### 始源天气 (Primal)

| ID | 名称 | 默认压制 |
|----|------|----------|
| `harshsun` | 大日照 | blocked |
| `heavyrain` | 大雨 | blocked |
| `deltastream` | 乱气流 | blocked |

> 始源天气默认完全阻止所有宝可梦天气

---

## 默认压制规则

如果未配置 `suppression`，系统会根据环境天气类型自动推断：

1. **始源天气** (`isPrimal: true`) → `blocked`
2. **区域天气** (`isRegional: true`) → `suppressed`
3. **环境天气** (`isEnvironmental: true`) → 根据配置
4. **普通天气** → `normal`

---

## 完整战斗 JSON 示例

```json
{
  "settings": {
    "enableAVS": true,
    "enableCommander": true,
    "enableEVO": true
  },
  "environment": {
    "weather": "chronalrift",
    "weatherTurns": 0,
    "revertMessage": "时空的扭曲再次笼罩了战场...",
    "suppression": {
      "blocked": ["rain", "sun", "sandstorm", "snow"]
    },
    "effects": {
      "autoParadox": true,
      "unboundArts": true,
      "speedEntropy": true,
      "digitalGlitch": true
    }
  },
  "player": {
    "name": "Subject_Delta",
    "trainerProficiency": 230,
    "party": [...],
    "unlocks": {
      "enable_mega": true,
      "enable_tera": true,
      "enable_dynamax": true
    }
  },
  "enemy": {
    "name": "???",
    "party": [...]
  }
}
```

---

## 相关文件

- `@/Users/liuhang/Documents/pkm12/systems/data-loader.js` - 环境配置解析
- `@/Users/liuhang/Documents/pkm12/engine/weather-effects.js` - 压制系统实现
- `@/Users/liuhang/Documents/pkm12/docs/WEATHER_EFFECTS_DOCUMENTATION.md` - 天气效果完整文档
