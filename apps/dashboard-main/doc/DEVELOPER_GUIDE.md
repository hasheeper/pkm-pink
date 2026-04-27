# PKM System - 开发者文档 (Developer Guide)

## 目录 (Table of Contents)

1. [项目结构](#项目结构)
2. [技术栈](#技术栈)
3. [核心模块详解](#核心模块详解)
4. [数据流架构](#数据流架构)
5. [API 参考](#api-参考)
6. [样式系统](#样式系统)
7. [扩展开发](#扩展开发)
8. [调试指南](#调试指南)
9. [性能优化](#性能优化)
10. [部署流程](#部署流程)

---

## 项目结构

```
pkm13/
├── index.html              # 主界面 HTML (64 行)
├── app.js                  # 核心应用逻辑 (2904 行)
│   ├── ERA 数据桥接 (677-826)
│   ├── 队伍渲染 (974-1353)
│   ├── PC 存储系统 (1482-2233)
│   ├── 关系网络 (560-657)
│   ├── 交通系统 (72-557)
│   ├── Dashboard (2235-2904)
│   └── 设置系统 (1034-1138)
├── script.js               # 辅助脚本 (63 行)
│   └── 事件处理器
├── styles.css              # 样式系统 (4299 行)
│   ├── 全局样式 (1-150)
│   ├── 框架布局 (151-266)
│   ├── 卡片系统 (267-833)
│   ├── 队伍卡片 (834-1088)
│   ├── 关系网格 (1089-1246)
│   ├── 盒子系统 (1247-1800)
│   ├── 交通面板 (1801-2100)
│   └── Dashboard (2101-4299)
├── data-helpers.js         # 数据处理工具 (141 行)
│   ├── 类型颜色映射
│   ├── 道具图标 URL
│   ├── 精灵图 URL
│   └── 主题颜色获取
├── tavern-inject.js        # SillyTavern 注入脚本 (3187 行)
│   ├── 悬浮球 UI (1-199)
│   ├── ERA 数据获取 (200-223)
│   ├── 位置上下文生成 (225-728)
│   └── 消息通信 (729-3187)
├── tavern-inject.min.js    # 压缩版注入脚本 (1 行)
└── map/                    # 地图子系统
    ├── index.html          # 地图界面
    ├── game.js             # 地图引擎 (2221 行)
    │   ├── 坐标转换 (1-65)
    │   ├── 玩家状态 (66-134)
    │   ├── 异变系统 (143-268)
    │   ├── 渲染循环 (289-2221)
    │   └── 事件处理
    ├── locationContext.js  # 位置上下文生成器 (728 行)
    │   ├── 实体查询 (54-128)
    │   ├── 格子信息 (129-178)
    │   ├── 周围环境 (179-237)
    │   └── 地标查询 (238-728)
    ├── tacticalView.js     # 战术视图系统 (2703 行)
    │   ├── SVG 图标库 (1-46)
    │   ├── 渲染引擎 (199-2703)
    │   └── 交互处理
    ├── pokemonEngine.js    # 宝可梦刷新引擎
    ├── scifi.css           # 地图样式 (20254 bytes)
    ├── notification.css    # 通知样式 (2027 bytes)
    └── data/               # 地图数据
        ├── mapdata.json    # LDtk 地图数据
        ├── mapinfo.json    # 地图元数据
        └── pkmdata.js      # 宝可梦刷新表
```

---

## 技术栈

### 前端技术
- **HTML5**: 语义化标签
- **CSS3**: Flexbox, Grid, Animations, Custom Properties
- **JavaScript (ES6+)**: Modules, Async/Await, Arrow Functions
- **Canvas API**: 地图渲染
- **Fetch API**: 数据加载
- **postMessage API**: 跨域通信

### 外部依赖
- **jQuery**: DOM 操作（仅 tavern-inject.js）
- **LDtk**: 地图编辑器数据格式
- **Pokemon Showdown**: 精灵图资源
- **PokemonDB**: 高清精灵图资源
- **PokeAPI**: 道具图标资源

### 字体
- **Exo 2**: UI 字体（粗体、斜体）
- **M PLUS Rounded 1c**: 文本字体
- **Noto Sans SC**: 中文字体

### 浏览器支持
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 核心模块详解

### 1. ERA 数据桥接模块

**文件**: `app.js` (Line 677-826)

#### 数据结构

```javascript
// 全局数据对象
let db = {
    player: {
        name: String,
        party: {
            slot1: PokemonData,
            slot2: PokemonData,
            // ... slot3-6
        },
        box: {
            storage_01: PokemonData,
            storage_02: PokemonData,
            // ...
        },
        bonds: {
            enable_mega: Boolean,
            enable_z_move: Boolean,
            // ...
        },
        unlocks: {
            enable_dynamax: Boolean,
            // ...
        }
    },
    world_state: {
        location: {
            x: Number,
            y: Number,
            region: String
        },
        npcs: {
            npc_name: {
                love: Number,      // 0-255
                stage: Number      // -2 to 4
            }
        },
        time: {
            period: String,
            dayOfYear: Number
        },
        phenomenon: {
            active_type: String,
            active_region: String
        },
        pokemon_spawns: Object
    },
    settings: {
        enableAVS: Boolean,
        enableCommander: Boolean,
        // ...
    }
};

// 宝可梦数据结构
interface PokemonData {
    slot?: Number,           // 队伍槽位（1-6）
    name: String,            // 种族名
    nickname?: String,       // 昵称
    species?: String,        // 种族（优先使用）
    gender: "M" | "F" | null,
    lv: Number,
    quality?: String,
    nature: String,
    ability: String,
    shiny: Boolean,
    item?: String,
    mechanic?: String,
    teraType?: String,
    isAce: Boolean,
    isLead: Boolean,
    friendship: {
        avs: {
            trust: Number,      // 0-255
            passion: Number,
            insight: Number,
            devotion: Number
        },
        av_up: Object
    },
    moves: {
        move1: String,
        move2: String,
        move3: String,
        move4: String
    },
    stats_meta: {
        ivs: {
            hp: Number,         // 0-31
            atk: Number,
            def: Number,
            spa: Number,
            spd: Number,
            spe: Number
        },
        ev_level: Number,
        ev_up: Number
    },
    notes?: String
}
```

#### 消息协议

```javascript
// 1. 初始化数据推送
{
    type: 'PKM_ERA_DATA',
    data: db
}

// 2. 增量刷新
{
    type: 'PKM_REFRESH',
    data: db
}

// 3. 设置队长请求
{
    type: 'PKM_SET_LEADER',
    data: {
        targetSlot: String  // "slot1" - "slot6"
    }
}

// 4. 更新设置
{
    type: 'PKM_UPDATE_SETTINGS',
    data: settings
}

// 5. 地图 resize
{
    type: 'MAP_RESIZE'
}

// 6. 退出全屏
{
    type: 'PKM_EXIT_MAP_FULLSCREEN'
}
```

#### 关键函数

```javascript
// 加载 ERA 数据
function loadEraData() {
    if (window.eraData && window.eraData.player) {
        db = window.eraData;
        return true;
    }
    // 返回默认空数据
    return false;
}

// 从 ERA 更新坐标
function updateCoordsFromEra() {
    if (db?.world_state?.location) {
        const loc = db.world_state.location;
        currentMapCoords = { x: loc.x, y: loc.y };
        updateCoordsDisplay(currentMapCoords);
    }
}

// 防抖刷新处理
let refreshDebounceTimer = null;
function handleRefreshDebounced(eventData) {
    if (refreshDebounceTimer) {
        clearTimeout(refreshDebounceTimer);
    }
    refreshDebounceTimer = setTimeout(() => {
        // 刷新所有界面
        renderDashboard();
        renderPartyList();
        renderSocialList();
        renderSettings();
        renderBoxPage();
        updateClock();
    }, 100);
}
```

---

### 2. 队伍管理模块

**文件**: `app.js` (Line 974-1353)

#### 渲染流程

```javascript
// 1. 渲染队伍列表
function renderPartyList() {
    const partyData = db.player.party;
    const displaySlotKeys = ['slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6'];
    
    // 生成头部
    const headerHtml = generateHeaderHtml(partyData);
    
    // 生成卡片
    let cardsHTML = '';
    displaySlotKeys.forEach(slotKey => {
        const pkmNode = partyData[slotKey];
        cardsHTML += createCardHTML(pkmNode, slotKey);
    });
    
    // 渲染到 DOM
    partyPage.innerHTML = headerHtml + cardsHTML;
}

// 2. 创建卡片 HTML
function createCardHTML(pkm, slotIdStr) {
    if (!pkm || !pkm.name) {
        return renderEmptySlot(slotIdStr);
    }
    
    // 获取主题颜色
    const theme = getThemeColors(pkm.species || pkm.name);
    
    // 生成精灵图 URL（三级降级）
    const url_sv = `https://img.pokemondb.net/sprites/scarlet-violet/normal/${spriteSlug}.png`;
    const url_swsh = `https://img.pokemondb.net/sprites/sword-shield/normal/${spriteSlug}.png`;
    const url_px = `https://play.pokemonshowdown.com/sprites/gen5/${slugPixel}.png`;
    
    // 生成 HTML
    return `
        <div class="dash-card-box" style="--prim-color: ${theme.p}; --sec-color: ${theme.s}">
            <!-- 卡片内容 -->
        </div>
    `;
}
```

#### 精灵图加载策略

```javascript
// 三级降级策略
<img src="${url_sv}" 
     onerror="
         if (!this.dataset.triedSwsh) {
             this.dataset.triedSwsh = true; 
             this.src = '${url_swsh}';
         } else {
             this.onerror = null; 
             this.src = '${url_px}'; 
             this.className = 'pixel-fallback';
         }
     ">
```

#### 交互处理

```javascript
// 展开/收起卡片
window.toggleCard = function(cardElement) {
    if (!cardElement || cardElement.classList.contains('empty')) return;
    cardElement.classList.toggle('open');
};

// 切换 AVS 面板
window.toggleAVS = function(event, slotKey) {
    event.stopPropagation();
    const panel = document.getElementById(`avs-panel-${slotKey}`);
    const isVisible = panel.classList.toggle('visible');
    
    // 关闭其他面板
    document.querySelectorAll('.avs-dashboard.visible').forEach(el => {
        if (el !== panel) el.classList.remove('visible');
    });
};

// 设置队长
window.toggleLeader = function(event, slotStr) {
    event.stopPropagation();
    
    // 调用回调或发送 postMessage
    if (window.pkmSetLeaderCallback) {
        window.pkmSetLeaderCallback(slotStr);
    } else {
        window.parent.postMessage({
            type: 'PKM_SET_LEADER',
            data: { targetSlot: slotStr }
        }, '*');
    }
};
```

---

### 3. PC 存储模块

**文件**: `app.js` (Line 1482-2233)

#### 状态管理

```javascript
let boxState = {
    selectedPartIdxs: [],      // 选中的队伍槽位索引 [0-5]
    selectedBoxKeys: [],       // 选中的盒子 Key ["storage_01", ...]
    selectedEmptyIdxs: [],     // 选中的空白格子索引
    isLocked: false,           // 信号锁定状态
    signalStatus: null         // 信号覆盖详情
};
```

#### 信号覆盖检测

```javascript
// PC 信号覆盖半径（格子数）
const PC_SIGNAL_RADIUS = 3;

// 检查信号覆盖
function isInSignalCoverage(playerX, playerY) {
    // Z 区全覆盖
    const playerRegion = getRegionByCoords(playerX, playerY);
    if (playerRegion === 'Z') {
        return { covered: true, reason: 'ZENITH_FULL_COVERAGE' };
    }
    
    // 检查 PC_Terminal 范围
    if (transitData.pcTerminals) {
        for (const terminal of transitData.pcTerminals) {
            const dist = calcDistance(playerX, playerY, terminal.x, terminal.y);
            if (dist <= PC_SIGNAL_RADIUS) {
                return { 
                    covered: true, 
                    reason: 'PC_TERMINAL_RANGE',
                    terminal: terminal,
                    distance: dist
                };
            }
        }
    }
    
    // 找最近的终端
    let nearestDist = Infinity;
    let nearestTerminal = null;
    // ...
    
    return { 
        covered: false, 
        reason: 'OUT_OF_RANGE',
        nearestTerminal: nearestTerminal,
        nearestDistance: nearestDist
    };
}
```

#### 批量操作逻辑

```javascript
window.confirmBoxTransfer = function() {
    const pIdxs = boxState.selectedPartIdxs;
    const bKeys = boxState.selectedBoxKeys;
    const emptyIdxs = boxState.selectedEmptyIdxs;
    
    // 判断操作类型
    if (hasEmptyBox && filledPartyInfos.length > 0) {
        // 批量存入
        generateStoreCommand();
    } else if (hasBoxPkm && emptyPartyInfos.length === pIdxs.length) {
        // 批量取出
        generateRetrieveCommand();
    } else if (hasBoxPkm && filledPartyInfos.length > 0) {
        // 批量交换
        generateSwapCommand();
    }
};
```

#### 数据格式转换

```javascript
// 队伍格式 -> 盒子格式
function normalizeToBoxFormat(partyObj) {
    const clone = JSON.parse(JSON.stringify(partyObj));
    delete clone.slot;      // 移除槽位字段
    delete clone.currHp;    // 移除临时战斗数据
    delete clone.maxHp;
    return clone;
}

// 盒子格式 -> 队伍格式
function normalizeToPartyFormat(simpleObj, slotNum) {
    return {
        slot: slotNum,
        ...simpleObj
    };
}
```

#### VariableEdit 生成

```javascript
// 批量存入示例
const actionLog = `
[系统指令：粉红网络连接协议 - 批量存入成功]
> 操作：传输通道 [${zoneName}] 已建立。
> 上行 (Upload): ${uploadList.join(', ')} >>> 云端服务器存储。

<VariableInsert>
${JSON.stringify({ player: { box: boxInserts } }, null, 2)}
</VariableInsert>

<VariableEdit>
${JSON.stringify({ player: { party: partyEdits } }, null, 2)}
</VariableEdit>

[演绎要求]
${uploadList.join('、')} 已被传送至云端存储系统。
`;
```

---

### 4. 交通系统模块

**文件**: `app.js` (Line 72-557)

#### 数据结构

```javascript
let transitData = {
    mapData: null,
    mapInfo: null,
    stations: [],      // 环线车站
    seaPorts: [],      // 港口码头
    airfields: [],     // 空运停机坪
    pcTerminals: [],   // PC 终端
    loaded: false
};
```

#### 数据加载

```javascript
async function loadTransitData() {
    if (transitData.loaded) return true;
    
    const [mapDataRes, mapInfoRes] = await Promise.all([
        fetch(PKM_URL + 'map/data/mapdata.json'),
        fetch(PKM_URL + 'map/data/mapinfo.json')
    ]);
    
    if (mapDataRes.ok) {
        transitData.mapData = await mapDataRes.json();
    }
    if (mapInfoRes.ok) {
        transitData.mapInfo = await mapInfoRes.json();
    }
    
    extractTransitEntities();
    transitData.loaded = true;
}
```

#### 实体提取

```javascript
function extractTransitEntities() {
    const levelData = transitData.mapData.levels[0];
    const gridSize = 16;
    
    for (const layer of levelData.layerInstances) {
        if (layer.__type !== 'Entities') continue;
        
        for (const entity of layer.entityInstances) {
            const gx = Math.floor(entity.__worldX / gridSize);
            const gy = Math.floor(entity.__worldY / gridSize);
            const displayCoords = toDisplayCoords(gx, gy);
            
            const item = {
                id: entity.fieldInstances[0]?.__value,
                gx, gy,
                x: displayCoords.x,
                y: displayCoords.y,
                region: getRegionByCoords(displayCoords.x, displayCoords.y)
            };
            
            if (entity.__identifier === 'Transit_Station') {
                transitData.stations.push(item);
            } else if (entity.__identifier === 'Sea_Route') {
                transitData.seaPorts.push(item);
            } else if (entity.__identifier === 'Sky_Net') {
                transitData.airfields.push(item);
            } else if (entity.__identifier === 'PC_Terminal') {
                transitData.pcTerminals.push(item);
            }
        }
    }
}
```

#### 距离计算

```javascript
// 曼哈顿距离
function calcDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// 显示距离（km）
const gridDist = calcDistance(playerX, playerY, station.x, station.y);
const distKm = gridDist * 0.4;
```

---

### 5. 地图系统模块

**文件**: `map/game.js` (2221 行)

#### 坐标转换

```javascript
const MAP_CENTER_X = 26;
const MAP_CENTER_Y = 26;

// 内部坐标 -> 显示坐标
function toDisplayCoords(internalX, internalY) {
    let x = internalX - MAP_CENTER_X;
    if (x >= 0) x += 1;  // 跳过 0
    
    let y = MAP_CENTER_Y - internalY - 1;
    if (y >= 0) y += 1;  // 跳过 0
    
    return { x, y };
}

// 显示坐标 -> 内部坐标
function toInternalCoords(displayX, displayY) {
    let x = displayX;
    if (x > 0) x -= 1;
    let internalX = x + MAP_CENTER_X;
    
    let y = displayY;
    if (y > 0) y -= 1;
    let internalY = MAP_CENTER_Y - y - 1;
    
    return { gx: internalX, gy: internalY };
}
```

#### 区域判断

```javascript
function getQuadrantName(displayX, displayY) {
    // Z 区：中心 6x6
    if (Math.abs(displayX) <= 6 && Math.abs(displayY) <= 6) return "Z";
    
    // 四象限
    if (displayX > 0 && displayY > 0) return "S";  // 东北
    if (displayX < 0 && displayY > 0) return "A";  // 西北
    if (displayX < 0 && displayY < 0) return "B";  // 西南
    if (displayX > 0 && displayY < 0) return "N";  // 东南
    
    return "Z";
}
```

#### 玩家位置管理

```javascript
let playerState = {
    gx: 26,
    gy: 27,
    color: "#e74c3c",
    moving: false
};

// 设置玩家位置（从外部调用）
window.setPlayerPosition = function(displayCoords) {
    const internal = toInternalCoords(displayCoords.x, displayCoords.y);
    playerState.gx = internal.gx;
    playerState.gy = internal.gy;
    
    // 同步到 RouteSystem
    if (window.RouteSystem) {
        RouteSystem.setOrigin(internal.gx, internal.gy);
    }
    
    // 居中相机
    if (levelData && levelData.pxWid) {
        centerCamera();
    }
};

// 获取玩家显示坐标
window.getPlayerDisplayCoords = function() {
    const display = toDisplayCoords(playerState.gx, playerState.gy);
    return {
        x: display.x,
        y: display.y,
        quadrant: getQuadrantName(display.x, display.y)
    };
};
```

#### 异变系统

```javascript
window.phenomenonState = {
    active_type: "clear",      // clear | ultra | ancient | future
    active_region: "none"      // none | random | Z | N | B | S | A
};

// 更新异变状态
function updatePhenomenonState(phenomenon) {
    window.phenomenonState.active_type = phenomenon.active_type || "clear";
    window.phenomenonState.active_region = phenomenon.active_region || "none";
}

// 检查实体是否应该显示
window.shouldShowPhenomenonEntity = function(entityType, entityValue) {
    const state = window.phenomenonState;
    
    if (state.active_type === "clear") {
        return false;
    }
    
    if (entityType === "Ultra_Wormhole") {
        return state.active_type === "ultra";
    }
    
    if (entityType === "Paradox_Anchors") {
        // 检查类型匹配
        // ...
    }
    
    return false;
};
```

---

### 6. 战术视图模块

**文件**: `map/tacticalView.js` (2703 行)

#### 系统配置

```javascript
const TACTICAL_STYLE = {
    TILE_SIZE: 180,
    VIEW_RADIUS: 5,
    DRAG_FRICTION: 0.12,
    
    // 颜色
    COLOR_BG: "#f2f4f8",
    CARD_BASE: "rgba(255, 255, 255, 0.95)",
    TXT_PRIMARY: "#2d3436",
    TXT_SECONDARY: "#b2bec3",
    
    // 字体
    FONT_UI: "700 12px 'Exo 2', sans-serif",
    FONT_HEAD: "900 14px 'Exo 2', sans-serif",
    FONT_NUM: "700 12px 'Chakra Petch', monospace"
};
```

#### 渲染循环

```javascript
const TacticalSystem = {
    isActive: false,
    _renderLoopActive: false,
    
    ctx: null,
    w: 0,
    h: 0,
    
    anchor: { x: 0, y: 0 },
    playerGrid: { x: 0, y: 0 },
    cam: { x: 0, y: 0, inputX: 0, inputY: 0 },
    
    enter: function(ctx, w, h, pGx, pGy) {
        this.isActive = true;
        this.ctx = ctx;
        this.w = w;
        this.h = h;
        
        this.anchor = { x: Math.floor(pGx), y: Math.floor(pGy) };
        this.playerGrid = { x: Math.floor(pGx), y: Math.floor(pGy) };
        
        this.bindEvents();
        this.render();
    },
    
    render: function() {
        if (!this.isActive) return;
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.w, this.h);
        
        // 平滑相机
        this.cam.x += (this.cam.inputX - this.cam.x) * TACTICAL_STYLE.DRAG_FRICTION;
        this.cam.y += (this.cam.inputY - this.cam.y) * TACTICAL_STYLE.DRAG_FRICTION;
        
        // 渲染格子
        this.renderTiles();
        
        // 渲染实体
        this.renderEntities();
        
        // 渲染 UI
        this.renderUI();
        
        // 下一帧
        requestAnimationFrame(() => this.render());
    }
};
```

#### SVG 图标系统

```javascript
const SURF_Icons = {
    CITY: new Path2D("M240,208h-8V88a8,8,0,0,0-8-8H160..."),
    WAVE: new Path2D("M222.16,177.25a8,8,0,0,1-1,11.25..."),
    PLANT: new Path2D("M247.63,47.89a8,8,0,0,0-7.52-7.52..."),
    // ...
};

// 绘制 SVG 图标
function drawSurfIcon(ctx, iconKey, x, y, size, color) {
    const path = SURF_Icons[iconKey];
    if (!path) return;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 256, size / 256);
    ctx.fillStyle = color;
    ctx.fill(path);
    ctx.restore();
}
```

---

## 数据流架构

### 完整数据流图

```
┌─────────────────────────────────────────────────────────┐
│                    SillyTavern                          │
│                    (AI Backend)                         │
└────────────────────┬────────────────────────────────────┘
                     │ ERA Variables
                     │ (JSON)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              tavern-inject.js                           │
│              (注入层)                                    │
│  • 悬浮球 UI                                             │
│  • ERA 数据获取 (eventEmit/eventOn)                     │
│  • 位置上下文生成                                        │
│  • postMessage 通信                                      │
└────────────────────┬────────────────────────────────────┘
                     │ postMessage
                     │ { type: 'PKM_ERA_DATA', data: db }
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    app.js                               │
│                    (应用层)                              │
│  • 接收 ERA 数据 (window.addEventListener)              │
│  • 数据存储 (db 对象)                                    │
│  • 防抖刷新 (handleRefreshDebounced)                    │
│  • 业务逻辑处理                                          │
└────────────────────┬────────────────────────────────────┘
                     │ 渲染调用
                     ▼
┌─────────────────────────────────────────────────────────┐
│                UI Components                            │
│                (视图层)                                  │
│  • renderDashboard()                                    │
│  • renderPartyList()                                    │
│  • renderBoxPage()                                      │
│  • renderSocialList()                                   │
│  • renderTransitPage()                                  │
│  • renderSettings()                                     │
└─────────────────────────────────────────────────────────┘
```

### 消息流向

```
用户操作 (点击按钮)
    ↓
事件处理器 (onclick, toggleLeader, confirmBoxTransfer)
    ↓
生成指令 (VariableEdit JSON)
    ↓
复制到剪贴板 (navigator.clipboard.writeText)
    ↓
用户粘贴到 SillyTavern
    ↓
AI 执行 VariableEdit
    ↓
ERA 变量更新
    ↓
postMessage 推送 (PKM_REFRESH)
    ↓
app.js 接收并刷新 UI
```

---

## API 参考

### 全局对象

#### `db` - ERA 数据对象
```javascript
// 访问玩家数据
db.player.name
db.player.party.slot1
db.player.box.storage_01

// 访问世界状态
db.world_state.location
db.world_state.npcs
db.world_state.time
```

#### `window.eraData` - ERA 数据副本
```javascript
// 与 db 相同，用于外部访问
window.eraData === db
```

### 核心函数

#### 数据加载

```javascript
// 加载 ERA 数据
function loadEraData(): Boolean

// 从 ERA 更新坐标
function updateCoordsFromEra(): void

// 确保设置默认值
function ensureSettingsDefaults(): void
```

#### 渲染函数

```javascript
// 渲染主页
function renderDashboard(): void

// 渲染队伍
function renderPartyList(): void

// 渲染盒子
async function renderBoxPage(): void

// 渲染关系网络
function renderSocialList(): void

// 渲染交通系统
async function renderTransitPage(): void

// 渲染设置
function renderSettings(): void
```

#### 工具函数

```javascript
// 获取精灵图 URL
function getSpriteUrl(speciesRaw: String): String

// 获取主题颜色
function getThemeColors(speciesRaw: String): { p: String, s: String, types: Array }

// 获取道具图标 URL
function getItemIconUrl(itemKey: String): String

// 获取类型颜色
function getTypeColor(typeName: String): String

// 构建精灵图 slug
function buildSpriteSlug(speciesRaw: String): String
```

#### 交互函数

```javascript
// 切换页面
function switchPage(targetId: String, btn: Element): void

// 打开子页面
window.openAppPage(pageId: String): void

// 返回主页
window.goBackToHome(): void

// 切换卡片
window.toggleCard(cardElement: Element): void

// 切换 AVS 面板
window.toggleAVS(event: Event, slotKey: String): void

// 设置队长
window.toggleLeader(event: Event, slotStr: String): void

// 切换设置
window.toggleGlobalSetting(key: String): void
```

#### 盒子操作

```javascript
// 处理队伍点击
window.handlePartyClick(idx: Number): void

// 处理盒子点击
window.handleBoxClick(key: String): void

// 处理空格子点击
window.handleEmptyBoxClick(cellIndex: Number): void

// 重置选择
window.resetBoxSelection(): void

// 确认传输
window.confirmBoxTransfer(): void
```

#### 交通系统

```javascript
// 加载交通数据
async function loadTransitData(): Boolean

// 处理站点点击
window.handleTransitClick(stationId: String, destX: Number, destY: Number, type: String): void

// 切换交通 Tab
window.switchTransitTab(tab: String): void
```

#### 地图系统

```javascript
// 坐标转换
function toDisplayCoords(internalX: Number, internalY: Number): { x: Number, y: Number }
function toInternalCoords(displayX: Number, displayY: Number): { gx: Number, gy: Number }

// 获取象限
function getQuadrantName(displayX: Number, displayY: Number): String

// 设置玩家位置
window.setPlayerPosition(displayCoords: { x: Number, y: Number }): void

// 获取玩家坐标
window.getPlayerDisplayCoords(): { x: Number, y: Number, quadrant: String }

// 检查异变实体显示
window.shouldShowPhenomenonEntity(entityType: String, entityValue: String): Boolean
```

---

## 样式系统

### CSS 变量

```css
:root {
    /* 倾斜角度 */
    --s-deg: -10deg;
    --ns-deg: 10deg;
    
    /* 圆角 */
    --r-frame: 24px;
    --r-item: 8px;
    
    /* 颜色 */
    --c-bg: #f2f4f8;
    --c-frame: #ffffff;
    --c-text: #2d3436;
    --c-gray: #b2bec3;
    --c-pink: #ff6b81;
    --c-blue: #70a1ff;
    
    /* 字体 */
    --font-ui: 'Exo 2', 'Noto Sans SC', sans-serif;
    --font-txt: 'M PLUS Rounded 1c', sans-serif;
}
```

### 核心类名

#### 布局
- `.ver-dawn-frame` - 主框架
- `.nav-wrap` - 导航栏
- `.main-viewport` - 主视口
- `.page` - 页面容器
- `.page.curr` - 当前页面

#### 卡片
- `.dash-card-box` - 基础卡片
- `.dash-card-box.empty` - 空槽位
- `.dash-card-box.open` - 展开状态
- `.dash-card-box.is-leader` - 队长标记

#### 队伍
- `.pkm-summary` - 宝可梦摘要
- `.pkm-details` - 详细信息
- `.p-avatar` - 精灵图
- `.p-name` - 名称
- `.avs-dashboard` - AVS 面板

#### 盒子
- `.box-party-grid` - 队伍网格
- `.box-storage-area` - 存储区域
- `.box-char-card` - 队伍卡片
- `.storage-cell` - 存储格子
- `.box-offline-overlay` - 信号丢失覆盖层

#### 关系
- `#social-grid-view` - 关系网格
- `.npc-card` - NPC 卡片
- `.npc-portrait` - NPC 立绘
- `.npc-bond-badge` - 羁绊徽章

#### 交通
- `.transit-tabs` - 交通 Tab
- `.transit-panel` - 交通面板
- `.transit-item` - 站点卡片
- `.transit-section` - 分组标题

---

## 扩展开发

### 添加新页面

1. **在 `index.html` 添加页面容器**
```html
<div id="pg-newpage" class="page"></div>
```

2. **在 `app.js` 添加渲染函数**
```javascript
function renderNewPage() {
    const page = document.getElementById('pg-newpage');
    if (!page) return;
    
    page.innerHTML = `
        <div class="team-header-dash">
            <div class="th-title">NEW PAGE</div>
        </div>
        <!-- 页面内容 -->
    `;
}
```

3. **在 Dashboard 添加磁贴**
```javascript
<div class="dash-card-box" onclick="openAppPage('newpage')">
    <div class="dcb-inner">
        <div class="ph-lbl">NEW</div>
        <div class="ph-sub">NEW PAGE</div>
    </div>
</div>
```

4. **在 `switchPage` 添加路由**
```javascript
function switchPage(targetId, btn) {
    // ...
    if (targetId === 'newpage') {
        renderNewPage();
    }
}
```

### 添加新的 ERA 数据字段

1. **在 `db` 对象添加字段**
```javascript
db.player.newField = value;
```

2. **在渲染函数中使用**
```javascript
function renderNewPage() {
    const data = db.player.newField;
    // 渲染逻辑
}
```

3. **确保 SillyTavern 端同步更新**
```xml
<VariableEdit>
{
  "player": {
    "newField": "value"
  }
}
</VariableEdit>
```

### 添加新的交通网络

1. **在 `extractTransitEntities` 添加实体类型**
```javascript
else if (entity.__identifier === 'New_Transit') {
    transitData.newTransit.push(item);
}
```

2. **在 `renderTransitPage` 添加 Tab**
```html
<div class="transit-tab" data-tab="new" onclick="switchTransitTab('new')">
    <span>${TransitIcons.new} NEW TRANSIT</span>
</div>
```

3. **添加渲染逻辑**
```javascript
<div class="transit-panel" id="transit-new" style="display:none;">
    ${renderTransitListV2(sortedNewTransit, 'new', playerRegion, atNewTransit)}
</div>
```

### 自定义样式主题

1. **修改 CSS 变量**
```css
:root {
    --c-bg: #yourColor;
    --c-frame: #yourColor;
    /* ... */
}
```

2. **添加新的颜色变量**
```css
:root {
    --c-custom: #yourColor;
}
```

3. **在组件中使用**
```css
.custom-component {
    background: var(--c-custom);
}
```

---

## 调试指南

### 浏览器控制台

#### 查看 ERA 数据
```javascript
console.log(db);
console.log(db.player.party);
console.log(db.world_state.location);
```

#### 查看交通数据
```javascript
console.log(transitData);
console.log(transitData.stations);
console.log(transitData.pcTerminals);
```

#### 查看盒子状态
```javascript
console.log(boxState);
console.log(boxState.selectedPartIdxs);
console.log(boxState.signalStatus);
```

### 日志标记

项目使用统一的日志标记：
- `[PKM]` - 主应用
- `[BOX]` - 盒子系统
- `[TRANSIT]` - 交通系统
- `[MAP]` - 地图系统
- `[TacticalSystem]` - 战术视图
- `[LocationContext]` - 位置上下文

### 常见问题排查

#### 数据未同步
```javascript
// 检查 postMessage 监听
window.addEventListener('message', function(event) {
    console.log('[DEBUG] 收到消息:', event.data);
});

// 检查 ERA 数据
if (!db || !db.player) {
    console.error('[DEBUG] ERA 数据未加载');
}
```

#### 精灵图加载失败
```javascript
// 检查 URL
console.log('精灵图 URL:', getSpriteUrl('pikachu'));

// 检查 buildSpriteSlug
console.log('Slug:', buildSpriteSlug('Hisuian Zorua'));
```

#### 信号覆盖检测失败
```javascript
// 检查玩家位置
console.log('玩家位置:', currentMapCoords);

// 检查 PC 终端
console.log('PC 终端:', transitData.pcTerminals);

// 检查信号状态
console.log('信号状态:', isInSignalCoverage(x, y));
```

---

## 性能优化

### 1. 防抖优化

```javascript
// 刷新防抖（100ms）
let refreshDebounceTimer = null;
function handleRefreshDebounced(eventData) {
    if (refreshDebounceTimer) {
        clearTimeout(refreshDebounceTimer);
    }
    refreshDebounceTimer = setTimeout(() => {
        // 执行刷新
    }, 100);
}
```

### 2. 图片懒加载

```html
<img src="..." loading="lazy" alt="...">
```

### 3. 精灵图缓存

```javascript
if (!window._pkmIconVerifyCache) {
    window._pkmIconVerifyCache = {};
}

// 缓存成功加载的 URL
onload="window._pkmIconVerifyCache['${cacheKey}'] = this.src"

// 使用缓存
if (window._pkmIconVerifyCache[cacheKey]) {
    return `<img src="${window._pkmIconVerifyCache[cacheKey]}">`;
}
```

### 4. 渲染优化

```javascript
// 只渲染可见区域
const visibleSlots = partySlots.filter(slot => isVisible(slot));

// 使用 requestAnimationFrame
requestAnimationFrame(() => {
    renderFrame();
});

// 避免强制同步布局
const height = element.offsetHeight;  // 读取
element.style.height = height + 'px'; // 写入
```

### 5. 事件委托

```javascript
// 不推荐：为每个卡片绑定事件
cards.forEach(card => {
    card.addEventListener('click', handleClick);
});

// 推荐：事件委托
container.addEventListener('click', (e) => {
    const card = e.target.closest('.dash-card-box');
    if (card) handleClick(card);
});
```

---

## 部署流程

### GitHub Pages 部署

1. **推送到 GitHub**
```bash
git add .
git commit -m "Update PKM System"
git push origin main
```

2. **启用 GitHub Pages**
- 进入仓库 Settings
- 选择 Pages
- Source: main branch
- 保存

3. **访问地址**
```
https://{username}.github.io/{repo}/
```

### 本地测试

```bash
# 使用 Python 启动本地服务器
python -m http.server 8000

# 或使用 Node.js
npx http-server -p 8000

# 访问
http://localhost:8000
```

### 压缩脚本

```bash
# 压缩 tavern-inject.js
npx terser tavern-inject.js -o tavern-inject.min.js -c -m
```

### 版本管理

```javascript
// 在 app.js 添加版本号
const PKM_VERSION = "1.0.0-dawn";
console.log(`[PKM] Version ${PKM_VERSION}`);
```

---

## 代码规范

### 命名约定

- **变量**: camelCase (`playerState`, `boxState`)
- **常量**: UPPER_SNAKE_CASE (`PC_SIGNAL_RADIUS`, `MAP_CENTER_X`)
- **函数**: camelCase (`renderPartyList`, `loadEraData`)
- **类**: PascalCase (`TacticalSystem`, `LocationContextGenerator`)
- **CSS 类**: kebab-case (`.dash-card-box`, `.pkm-summary`)

### 注释规范

```javascript
/**
 * 函数说明
 * @param {Type} paramName - 参数说明
 * @returns {Type} 返回值说明
 */
function functionName(paramName) {
    // 实现
}

// 单行注释
let variable = value;

/* 
 * 多行注释
 * 说明
 */
```

### 代码组织

```javascript
/* ============================================================
   模块名称
   ============================================================ */

// --- 子模块 ---

// 具体功能
```

---

## 总结

PKM System 是一个功能完整、架构清晰的 Web 应用，具有以下技术特点：

✅ **模块化设计**: 清晰的模块划分，易于维护和扩展
✅ **数据驱动**: 基于 ERA 变量的响应式数据流
✅ **性能优化**: 防抖、缓存、懒加载等优化策略
✅ **跨域通信**: postMessage 实现 iframe 双向通信
✅ **现代 UI**: CSS3 动画、Flexbox/Grid 布局
✅ **错误处理**: 完善的降级策略和错误提示

**代码统计**:
- 总行数: ~15,000+
- JavaScript: ~9,000+
- CSS: ~4,300+
- HTML: ~200+

**主要文件**:
- `app.js`: 2904 行
- `styles.css`: 4299 行
- `tavern-inject.js`: 3187 行
- `map/game.js`: 2221 行
- `map/tacticalView.js`: 2703 行
- `map/locationContext.js`: 728 行

**技术亮点**:
1. 信号塔覆盖系统（PC 存储）
2. 三级降级精灵图加载
3. 批量操作 VariableEdit 生成
4. 2.5D 等距地图渲染
5. 异变系统动态显示
6. AVS 四维情感系统
7. 羁绊解锁机制
8. 位置上下文生成器

适合作为 SillyTavern 扩展、Web 游戏 UI、数据可视化等项目的参考。
