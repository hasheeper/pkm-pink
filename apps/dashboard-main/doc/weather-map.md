# 天气系统 - 地图集成部分

## 概述

本文档描述天气系统在地图模块中的集成实现，包括天气图标显示、数据流转、移动提示等功能。

---

## 一、系统架构

### 1.1 数据流向

```
ERA (weather_grid)
    ↓
game.js (接收 PKM_ERA_DATA/PKM_REFRESH 消息)
    ↓
window.weatherGridData (全局缓存)
    ↓
tacticalView.js (读取并渲染天气图标)
```

### 1.2 核心文件

| 文件 | 职责 |
|------|------|
| `tavern-inject.js` | 天气生成逻辑、气候区读取、ERA 注入 |
| `map/game.js` | 接收 ERA 数据、更新 `window.weatherGridData` |
| `map/tacticalView.js` | 天气图标渲染、移动提示生成 |
| `doc/pkm-tavern-plugin.js` | 战斗 JSON 中的 environment 注入 |
| `app.js` | `enableEnvironment` 设置开关 |

---

## 二、天气数据生成（tavern-inject.js）

### 2.1 气候区读取

**从 `mapdata.json` 的 Climate IntGrid 图层读取气候区**

```javascript
// WeatherSystem.loadClimateGrid()
const climateLayer = mapData.layerInstances.find(l => l.__identifier === 'Climate');
this.climateGridData = climateLayer.intGridCsv;
this.climateGridWidth = climateLayer.__cWid;
```

**气候区映射表（22 种气候区）**

```javascript
CLIMATE_INT_MAP: {
    1: 'Tropical_Monsoon',
    2: 'Tropical_Rainforest',
    3: 'Tropical_Savanna',
    4: 'Desert_Hot',
    5: 'Desert_Cold',
    6: 'Steppe_Hot',
    7: 'Steppe_Cold',
    8: 'Mediterranean',
    9: 'Humid_Subtropical',
    10: 'Oceanic',
    11: 'Continental_Humid',
    12: 'Continental_Lush',
    13: 'Subarctic',
    14: 'Tundra',
    15: 'Ice_Cap',
    16: 'Highland',
    17: 'Volcanic',
    18: 'Abyssal_Shallow',
    19: 'Abyssal_Deep',
    20: 'Abyssal_Trench',
    21: 'Abyssal_Vent',
    22: 'Abyssal_Middle'
}
```

### 2.2 天气生成逻辑

**为玩家周围 13 格（距离 2）生成天气**

```javascript
// WeatherSystem.generateForNearbyGrids(x, y, eraVars)
const radius = 2;
for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist > radius) continue;
        
        const gx = internal.gx + dx;
        const gy = internal.gy + dy;
        const key = `${gx}_${gy}`;
        
        // 只增不改（已有天气的格子跳过）
        if (existingWeather[key]) continue;
        
        const climateZoneId = this.getClimateZoneAtGrid(gx, gy);
        const weatherConfig = this.generateGridWeather(climateZoneId, currentDay);
        
        if (weatherConfig) {
            newWeatherGrid[key] = weatherConfig;
        }
    }
}
```

**天气数据格式**

```javascript
{
    "gx_gy": {
        "weather": "rain",           // 天气类型
        "suppression": ["sandstorm"] // 被抑制的天气
    }
}
```

### 2.3 ERA 注入

**注入到 `world_state.weather_grid`**

```javascript
async function eraInsertWeatherGrid(newWeatherGrid) {
    const insertData = {
        world_state: {
            weather_grid: newWeatherGrid
        }
    };
    insertEraVars(insertData);
}
```

---

## 三、地图天气显示（map/tacticalView.js）

### 3.1 天气图标定义

**SVG 图标常量（ViewBox: 0 0 256 256）**

```javascript
const WEATHER_Icons = {
    rain: new Path2D("M158.66,196.44l-32,48a8,8,0,1,1-13.32-8.88..."),
    sun: new Path2D("M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0..."),
    snow: new Path2D("M88,196a12,12,0,1,1-12-12A12,12,0,0,1,88,196..."),
    fog: new Path2D("M120,208H72a8,8,0,0,1,0-16h48a8,8,0,0,1,0,16..."),
    smog: new Path2D("M128,24A104,104,0,1,0,232,128,104.11,104.11..."),
    gale: new Path2D("M184,184a32,32,0,0,1-32,32c-13.7,0-26.95..."),
    ashfall: new Path2D("M143.38,17.85a8,8,0,0,0-12.63,3.41l-22..."),
    sandstorm: new Path2D("M232,40a8,8,0,0,1-8,8H56a8,8,0,0,1,0-16..."),
    clear: null // 无天气不显示图标
};
```

**颜色映射**

```javascript
const WEATHER_COLORS = {
    rain: "#3498db",      // 蓝色
    sun: "#f39c12",       // 橙黄色
    snow: "#a8d8ea",      // 浅蓝色
    fog: "#95a5a6",       // 灰色
    smog: "#7f8c8d",      // 深灰色
    gale: "#1abc9c",      // 青绿色
    ashfall: "#e74c3c",   // 红色
    sandstorm: "#d4a574", // 沙色
    clear: null
};
```

### 3.2 图标渲染

**位置：格子左上角**

```javascript
_drawWeatherIcon: function(ctx, x, y, realS, gx, gy, alpha) {
    const weatherGrid = window.weatherGridData;
    if (!weatherGrid) return;
    
    const key = `${gx}_${gy}`;
    const weatherData = weatherGrid[key];
    if (!weatherData || !weatherData.weather || weatherData.weather === 'clear') return;
    
    const weatherType = weatherData.weather;
    const icon = WEATHER_Icons[weatherType];
    const color = WEATHER_COLORS[weatherType];
    if (!icon || !color) return;
    
    // 位置：左上角
    const iconSize = 18;
    const iconX = x + 6;
    const iconY = y + 6;
    
    ctx.save();
    ctx.globalAlpha = alpha * 0.85;
    
    // 绘制背景圆
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制图标
    ctx.shadowBlur = 0;
    const viewScale = iconSize / 256;
    ctx.translate(iconX, iconY);
    ctx.scale(viewScale, viewScale);
    ctx.fillStyle = "#ffffff";
    ctx.fill(icon);
    
    ctx.restore();
}
```

**调用位置**

```javascript
// 在 _drawInfoTile 中调用
this._drawInfrastructure(ctx, gx, gy, px, py, size, infraID, alpha);
this._drawThreatToken(ctx, x, y, realS, threatVal, alpha);
this._drawWeatherIcon(ctx, x, y, realS, gx, gy, alpha); // 天气图标
```

### 3.3 数据接收（map/game.js）

**监听 ERA 数据消息**

```javascript
window.addEventListener('message', function(event) {
    if (event.data && (event.data.type === 'PKM_ERA_DATA' || event.data.type === 'PKM_REFRESH')) {
        const eraData = event.data.data;
        
        // 更新天气数据（从 ERA 读取）
        if (eraData?.world_state?.weather_grid) {
            window.weatherGridData = eraData.world_state.weather_grid;
            console.log('[MAP] 天气数据已更新:', Object.keys(window.weatherGridData).length, '个格子');
        }
    }
});
```

---

## 四、移动提示中的天气变化

### 4.1 天气变化检测

**在 `_generateMoveChangeText` 中添加天气变化检测**

```javascript
// 天气变化
const weatherGrid = window.weatherGridData;
if (weatherGrid) {
    const fromWeatherData = weatherGrid[`${fromInfo.gx}_${fromInfo.gy}`];
    const toWeatherData = weatherGrid[`${toInfo.gx}_${toInfo.gy}`];
    const fromWeather = fromWeatherData?.weather || 'clear';
    const toWeather = toWeatherData?.weather || 'clear';
    if (fromWeather !== toWeather) {
        changes.push(`★ 天气变化: 从「${fromWeather}」变为「${toWeather}」`);
    }
}
```

### 4.2 移动提示示例

```
<VariableEdit>
{
  "world_state": {
    "location": {
      "x": -7,
      "y": -1
    }
  }
}
</VariableEdit>

【位置移动】玩家从 [-6, 1] 移动到了 [-7, -1]。

【环境变化】
★ 地表变更: 从「铺装路面」变为「草地」
★ 天气变化: 从「clear」变为「rain」

【目标区域宝可梦】
  • elgyem Lv.3 (uncommon)
  • zigzagoon Lv.4 (common)
```

---

## 五、战斗系统集成

### 5.1 设置开关（app.js）

**添加 `enableEnvironment` 到默认设置**

```javascript
const DefaultSettings = {
    enableAVS: true,
    enableCommander: true,
    enableEVO: true,
    enableBGM: true,
    enableSFX: true,
    enableClash: true,
    enableEnvironment: true  // 新增
};
```

**设置页面显示**

```javascript
const SettingsManifest = [
    // ...
    { 
        key: 'enableEnvironment', 
        label: 'ENVIRONMENT', 
        desc: 'Enable weather & terrain effects in battle.', 
        color: '#55efc4'
    }
];
```

### 5.2 战斗 JSON 注入（pkm-tavern-plugin.js）

**添加到 `defaultSettings`**

```javascript
const defaultSettings = {
    enableAVS: true,
    enableCommander: true,
    enableEVO: true,
    enableBGM: true,
    enableSFX: true,
    enableClash: false,
    enableEnvironment: true  // 新增
};
```

**注入到 `<PKM_FRONTEND>`**

```javascript
const completeBattle = {
    settings: finalSettings,  // 包含 enableEnvironment
    difficulty: resolvedEnemy.difficulty || 'normal',
    player: { ... },
    enemy: { ... },
    party: resolvedEnemy.party,
    environment: environmentConfig,  // 天气配置
    script: aiBattleData.script || null
};
```

---

## 六、上下文注入（tavern-inject.js）

### 6.1 天气上下文显示

**在位置上下文中显示当前格子和周围 13 格的天气**

```javascript
// 收集天气信息
const weatherLines = ['', '【当前天气】'];
const currentWeather = weatherGrid[currentKey];
if (currentWeather && currentWeather.weather && currentWeather.weather !== 'clear') {
    weatherLines.push(`  脚下: ${currentWeather.weather}`);
}

// 收集周围天气
const nearbyWeather = {};
for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist === 0 || dist > 2) continue;
        
        const ngx = internal.gx + dx;
        const ngy = internal.gy + dy;
        const nkey = `${ngx}_${ngy}`;
        const nweather = weatherGrid[nkey];
        
        if (nweather && nweather.weather && nweather.weather !== 'clear') {
            if (!nearbyWeather[nweather.weather]) {
                nearbyWeather[nweather.weather] = [];
            }
            nearbyWeather[nweather.weather].push({ dx, dy });
        }
    }
}

// 按天气类型分组显示
for (const [weatherType, positions] of Object.entries(nearbyWeather)) {
    const directions = positions.map(p => getDirection(p.dx, p.dy)).join('、');
    weatherLines.push(`  ${directions}: ${weatherType}`);
}
```

### 6.2 上下文注入位置

**在【周围环境】之前插入天气信息**

```javascript
const insertPoint = contextText.indexOf('【周围环境】');
if (insertPoint > 0) {
    const beforeEnv = contextText.substring(0, insertPoint - 1);
    const afterEnv = contextText.substring(insertPoint - 1);
    contextText = beforeEnv + weatherLines.join('\n') + '\n' + afterEnv;
}
```

---

## 七、关键数据结构

### 7.1 ERA 天气数据格式

```javascript
{
    "world_state": {
        "weather_grid": {
            "0_0": {
                "weather": "rain",
                "suppression": ["sandstorm"]
            },
            "1_0": {
                "weather": "clear",
                "suppression": []
            }
        }
    }
}
```

### 7.2 战斗 environment 格式

```javascript
{
    "weather": "rain",
    "suppression": ["sandstorm"],
    "season": "spring",
    "segment": "early"
}
```

---

## 八、测试检查清单

### 8.1 天气生成
- [ ] 玩家移动时，周围 13 格自动生成天气
- [ ] 已有天气的格子不会被覆盖（只增不改）
- [ ] 日期变化时，天气刷新（删除 + 重新生成）
- [ ] 气候区正确读取自 `mapdata.json` Climate 图层

### 8.2 地图显示
- [ ] 天气图标显示在格子左上角
- [ ] 图标颜色与天气类型匹配
- [ ] `clear` 天气不显示图标
- [ ] 图标透明度随格子距离衰减

### 8.3 移动提示
- [ ] 天气变化正确检测
- [ ] 移动提示包含天气变化信息
- [ ] 复制到剪贴板功能正常

### 8.4 战斗集成
- [ ] `enableEnvironment` 开关在设置页面显示
- [ ] 开关状态正确同步到 ERA
- [ ] 战斗 JSON 包含 `settings.enableEnvironment`
- [ ] 战斗 JSON 包含 `environment` 配置

### 8.5 上下文注入
- [ ] 位置上下文包含当前天气
- [ ] 位置上下文包含周围 13 格天气
- [ ] 天气按方向分组显示

---

## 九、已知问题与限制

### 9.1 性能考虑
- 天气数据存储在 ERA 中，格子数量过多时可能影响性能
- 建议只为玩家周围区域生成天气（当前实现：距离 2）

### 9.2 数据同步
- 天气数据依赖 ERA 消息传递，可能存在延迟
- 地图刷新时需要确保 `window.weatherGridData` 已更新

### 9.3 兼容性
- 天气图标使用 Path2D，需要现代浏览器支持
- SVG 图标来自 Phosphor Icons，需要确保版权合规

---

## 十、更新日志

### v1.0.0 (2026-01-26)
- ✅ 添加天气 SVG 图标（8 种天气类型）
- ✅ 实现天气图标在地图格子左上角显示
- ✅ 添加天气变化到移动提示
- ✅ 添加 `enableEnvironment` 设置开关
- ✅ 集成天气数据到战斗 JSON
- ✅ 添加天气上下文注入

---

## 附录

### A. 天气类型列表

| 天气类型 | 英文名 | 图标颜色 | 描述 |
|---------|--------|---------|------|
| 晴天 | sun | #f39c12 | 橙黄色太阳图标 |
| 雨天 | rain | #3498db | 蓝色雨滴图标 |
| 雪天 | snow | #a8d8ea | 浅蓝色雪花图标 |
| 雾天 | fog | #95a5a6 | 灰色雾气图标 |
| 烟雾 | smog | #7f8c8d | 深灰色烟雾图标 |
| 大风 | gale | #1abc9c | 青绿色风图标 |
| 火山灰 | ashfall | #e74c3c | 红色火山图标 |
| 沙尘暴 | sandstorm | #d4a574 | 沙色沙尘图标 |
| 晴朗 | clear | - | 不显示图标 |

### B. 相关文件路径

```
/Users/liuhang/Documents/pkm13/
├── tavern-inject.js              # 天气生成、气候区读取、ERA 注入
├── app.js                        # enableEnvironment 设置开关
├── map/
│   ├── game.js                   # ERA 数据接收、weatherGridData 更新
│   ├── tacticalView.js           # 天气图标渲染、移动提示
│   └── data/
│       └── mapdata.json          # Climate IntGrid 图层数据
└── doc/
    └── pkm-tavern-plugin.js      # 战斗 JSON environment 注入
```

---

**文档版本**: v1.0.0  
**最后更新**: 2026-01-26  
**维护者**: PKM 开发团队
