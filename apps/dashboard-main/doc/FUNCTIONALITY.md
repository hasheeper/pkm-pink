# PKM System - 功能文档 (Functionality Documentation)

## 项目概述 (Project Overview)

**PKM System** 是一个基于 Web 的宝可梦训练师管理系统，集成了 SillyTavern AI 对话系统的 ERA (Extended Reality Assistant) 变量系统。该项目提供了一个现代化的用户界面，用于管理宝可梦队伍、PC 存储、NPC 关系网络、地图导航和交通系统。

### 核心特性

- **实时数据同步**：与 SillyTavern ERA 系统双向同步
- **队伍管理**：6 槽位队伍系统，支持详细的宝可梦数据展示
- **PC 存储系统**：基于信号塔覆盖的云端存储机制
- **关系网络**：NPC 好感度系统（AVS：Trust/Passion/Insight/Devotion）
- **交通系统**：环线列车、空运网络、海运港口三大交通网络
- **地图系统**：2.5D 等距视角地图，支持战术视图和宝可梦刷新
- **异变系统**：动态异变事件（Ultra Wormhole、Paradox Anchors）

---

## 系统架构 (System Architecture)

### 1. 前端架构

```
pkm13/
├── index.html          # 主界面入口
├── app.js              # 核心应用逻辑 (2904 行)
├── script.js           # 辅助脚本 (63 行)
├── styles.css          # 样式系统 (4299 行)
├── data-helpers.js     # 数据处理工具 (141 行)
├── tavern-inject.js    # SillyTavern 注入脚本 (3187 行)
├── tavern-inject.min.js # 压缩版注入脚本
└── map/                # 地图子系统
    ├── index.html
    ├── game.js         # 地图引擎 (2221 行)
    ├── locationContext.js # 位置上下文生成器 (728 行)
    ├── tacticalView.js # 战术视图系统 (2703 行)
    ├── pokemonEngine.js # 宝可梦刷新引擎
    ├── scifi.css       # 地图样式
    ├── notification.css # 通知样式
    └── data/           # 地图数据
        ├── mapdata.json
        ├── mapinfo.json
        └── pkmdata.js
```

### 2. 数据流架构

```
SillyTavern (AI Backend)
    ↓ postMessage
ERA Data (JSON)
    ↓
tavern-inject.js (注入层)
    ↓ postMessage
app.js (应用层)
    ↓
UI Components (视图层)
```

---

## 核心功能模块 (Core Modules)

### 1. ERA 数据桥接系统 (ERA Data Bridge)

**文件**: `app.js` (Line 677-826)

#### 功能
- 从 SillyTavern 接收 ERA 变量数据
- 实时同步玩家队伍、盒子、NPC 关系、位置等数据
- 支持防抖刷新机制，避免频繁更新导致卡顿

#### 数据结构
```javascript
db = {
    player: {
        name: "训练师名称",
        party: {
            slot1-6: { /* 宝可梦数据 */ }
        },
        box: {
            storage_01: { /* 宝可梦数据 */ }
        },
        bonds: { /* 羁绊解锁状态 */ },
        unlocks: { /* 机制解锁状态 */ }
    },
    world_state: {
        location: { x: 1, y: 1, region: "Z" },
        npcs: { /* NPC 好感度数据 */ },
        time: { period: "morning", dayOfYear: 1 },
        phenomenon: { active_type: "clear", active_region: "none" }
    },
    settings: { /* 系统设置 */ }
}
```

#### 消息协议
- **PKM_ERA_DATA**: 初始化数据推送
- **PKM_REFRESH**: 增量数据刷新
- **PKM_SET_LEADER**: 设置队长请求
- **PKM_UPDATE_SETTINGS**: 更新系统设置

---

### 2. 队伍管理系统 (Party Management)

**文件**: `app.js` (Line 974-1353)

#### 功能
- 显示 6 个队伍槽位（slot1-slot6）
- 宝可梦详细信息展示：
  - 基础信息：名称、昵称、等级、性别、闪光标记
  - 属性：种族、性格、特性、携带道具
  - 数值：个体值（IVs）、努力值（EVs）
  - 招式：4 个招式槽位
  - AVS 系统：Trust/Passion/Insight/Devotion 四维情感值
  - 机制标记：Mega/Z-Move/Dynamax/Terastal/Bond/Style

#### 卡片交互
- **点击卡片**：展开/收起详细信息
- **点击旗帜按钮**：设置为队长（Leader）
- **点击爱心按钮**：显示 AVS 情感面板

#### 精灵图加载策略
1. **主图**: PokemonDB Scarlet-Violet 高清图
2. **降级 1**: PokemonDB Sword-Shield 图
3. **降级 2**: Pokemon Showdown Gen5 像素图
4. **特殊处理**: 洗翠形态使用 Pokemon Showdown 资源

---

### 3. PC 存储系统 (Box Storage System)

**文件**: `app.js` (Line 1482-2233)

#### 核心机制：信号塔覆盖系统

**规则**:
- **Z 区（中枢区）**: 全区域信号覆盖
- **其他区域**: 需在 PC_Terminal 信号塔 3 格范围内
- **信号半径**: 3 格（1.2 km）

#### 功能
1. **批量存入**: 队伍 → 空白盒子格子
2. **批量取出**: 盒子 → 空队伍槽位
3. **批量交换**: 队伍 ↔ 盒子

#### 操作流程
```
1. 选择队伍槽位（可多选）
2. 选择盒子格子（可多选）
3. 系统自动判断操作类型
4. 点击 EXECUTE 生成 VariableEdit 指令
5. 指令自动复制到剪贴板
6. 粘贴到 AI 对话框发送
```

#### 数据格式转换
- **队伍格式**: 包含 `slot` 字段、完整 AVS 数据
- **盒子格式**: 移除 `slot`、`currHp`、`maxHp` 等临时字段

#### 信号丢失覆盖层
当玩家不在信号范围内时，显示：
- 当前位置坐标
- 最近信号塔位置和距离
- 信号覆盖半径提示
- 终端扫描日志

---

### 4. 关系网络系统 (Social Network)

**文件**: `app.js` (Line 560-657)

#### NPC 好感度等级
```javascript
RelationMeta = {
    '-2': { label: 'HOSTILE',  icon: '☠️', desc: 'Enemy' },
    '-1': { label: 'COLD',     icon: '❄️', desc: 'Wary' },
    '0':  { label: 'NEUTRAL',  icon: '⚪', desc: 'Stranger' },
    '1':  { label: 'FRIENDLY', icon: '🔹', desc: 'Acquaintance' },
    '2':  { label: 'TRUSTED',  icon: '🍀', desc: 'Friend' },
    '3':  { label: 'CALIB.3',  icon: '💗', desc: 'Close' },
    '4':  { label: 'DEVOTED',  icon: '💍', desc: 'Max Bond' }
}
```

#### 羁绊解锁系统
特定 NPC 达到最高好感度时解锁特殊机制：
- **Gloria**: DYNAMAX BOND
- **Rosa**: LINK BOND
- **Dawn**: INSIGHT LENS
- **Akari**: HISUI ARTS
- **Serena**: MEGA EVO
- **Selene**: Z POWER
- **Juliana**: TERASTAL
- **May**: LIMIT BREAK

#### 显示特性
- 网格布局，自适应卡片大小
- 按好感度从高到低排序
- 未解锁 NPC 显示为灰度图 + "?" 标记
- 好感度进度条（0-255）

---

### 5. 交通系统 (Transit System)

**文件**: `app.js` (Line 72-557)

#### 三大交通网络

##### 1. LOOP-LINE (环线列车)
- **实体**: `Transit_Station`
- **特点**: 连接各区域主要城市
- **使用条件**: 必须在站点才能搭乘跨区列车

##### 2. AIR-NET (空运网络)
- **实体**: `Sky_Net`
- **特点**: 快速跨区域运输
- **使用条件**: 必须在停机坪才能起飞

##### 3. SEAPORT (海运港口)
- **实体**: `Sea_Route`
- **特点**: 沿海区域连接
- **使用条件**: 必须在码头才能出海

#### 交通规则
- **同区域移动**: 步行前往站点
- **跨区域移动**: 必须在站点，搭乘交通工具
- **距离计算**: 曼哈顿距离 × 0.4 km

#### 生成的 Prompt 格式
```
【交通移动】
从: 起点站 [x1, y1]
至: 终点站 [x2, y2]
方式: 环线列车/空运飞行/港口航线
区域: 起始区 → 目标区

玩家搭乘交通工具从起点前往终点。

<VariableEdit>
{
  "world_state": {
    "location": { "x": x2, "y": y2, "region": "目标区" }
  }
}
</VariableEdit>
```

---

### 6. 地图系统 (Map System)

**文件**: `map/game.js`, `map/tacticalView.js`

#### 坐标系统
- **内部坐标**: LDtk 编辑器坐标（0-52）
- **显示坐标**: 四象限坐标系（跳过 0）
  - 中心点: [26, 26] → [0, 0]（跳过）→ [1, 1]
  - X 轴: 东正西负
  - Y 轴: 北正南负

#### 五大区域
```javascript
REGIONS = {
    'Z': { name: 'ZENITH (中枢区)', center: [1, 1] },
    'N': { name: 'NEON (霓虹区)', center: [12, -12] },
    'B': { name: 'BLOOM (盛放区)', center: [-13, -13] },
    'S': { name: 'SHADOW (暗影区)', center: [12, 12] },
    'A': { name: 'APEX (极诣区)', center: [-13, 13] }
}
```

#### 地图图层
1. **Surface**: 地表类型（城市/水面/植物/沙漠等）
2. **Traversability**: 可通行性（开放/路径/快速）
3. **Threat**: 威胁等级（0-6）
4. **Regions**: 区域划分
5. **Biome_Zone**: 生态区域
6. **Region_Zone**: 地标区域
7. **实体层**: NPC、服务设施、传送点等

#### 战术视图 (Tactical View)
- **视野半径**: 5 格
- **格子大小**: 180px
- **交互**: 拖拽平移、悬停扫描
- **显示信息**:
  - 地表类型（SVG 图标）
  - 威胁等级
  - 实体信息（NPC、服务设施）
  - 宝可梦刷新点

---

### 7. 异变系统 (Phenomenon System)

**文件**: `map/game.js` (Line 143-268)

#### 异变类型
1. **Ultra Wormhole (究极空洞)**
   - 实体: `Ultra_Wormhole`
   - 刷新: 究极异兽（UB）
   - 区域: 随机或指定区域

2. **Paradox Anchors (悖论锚点)**
   - 类型: Ancient (古代) / Future (未来)
   - 实体: `Paradox_Anchors`
   - 刷新: 悖论宝可梦
   - 模式:
     - **Pool**: 范围刷新池
     - **Elite/Boss**: 单点 Boss

#### 状态管理
```javascript
phenomenonState = {
    active_type: "clear" | "ultra" | "ancient" | "future",
    active_region: "none" | "random" | "Z" | "N" | "B" | "S" | "A"
}
```

#### 显示规则
- **clear 状态**: 不显示任何异变实体
- **ultra 状态**: 显示 Ultra_Wormhole 实体
- **ancient/future 状态**: 显示对应类型的 Paradox_Anchors

---

### 8. 位置上下文生成器 (Location Context Generator)

**文件**: `tavern-inject.js` (Line 225-728), `map/locationContext.js`

#### 功能
为 AI 生成详细的位置上下文信息，包括：

1. **当前格子信息**
   - 地表类型
   - 可通行性
   - 威胁等级
   - 所属区域和生态区

2. **周围环境**
   - 8 方向邻近格子
   - 实体信息（NPC、服务设施、传送点）

3. **地标信息**
   - 当前区域的所有地标
   - 地标描述（exterior_view、internal_reality）

4. **NPC 位置**
   - 当前区域的所有 NPC 住址
   - NPC 场景描述

5. **服务设施**
   - 宝可梦中心
   - 商店
   - PC 终端
   - 传送点

#### 生成格式
```
[位置上下文]
坐标: [x, y] 区域
地表: 类型
威胁: 等级
可通行: 是/否

[周围环境]
北: 信息
南: 信息
...

[地标]
- 地标名称 [x, y]: 描述

[NPC]
- NPC 名称 @ 地点 [x, y]: 场景描述
```

---

### 9. 宝可梦刷新引擎 (Pokemon Spawn Engine)

**文件**: `map/pokemonEngine.js`

#### 刷新机制
1. **区域刷新表**: 每个 Biome_Zone 有独立的刷新表
2. **威胁等级过滤**: 根据格子威胁等级筛选可刷新宝可梦
3. **稀有度系统**: Common/Uncommon/Rare/Very Rare
4. **动态缓存**: 缓存已刷新的宝可梦，避免重复计算

#### 数据结构
```javascript
SPAWN_TABLES_DATA = {
    "Biome_Zone_Name": {
        common: ["宝可梦1", "宝可梦2"],
        uncommon: ["宝可梦3"],
        rare: ["宝可梦4"],
        very_rare: ["宝可梦5"]
    }
}
```

---

## 样式系统 (Style System)

**文件**: `styles.css` (4299 行)

### 设计语言: Ver. Dawn

#### 色彩系统
```css
--c-bg: #f2f4f8;        /* 背景色 */
--c-frame: #ffffff;     /* 卡片底色 */
--c-text: #2d3436;      /* 主文本 */
--c-gray: #b2bec3;      /* 次要文本 */
--c-pink: #ff6b81;      /* 强调色-粉 */
--c-blue: #70a1ff;      /* 强调色-蓝 */
```

#### 字体系统
- **UI 字体**: 'Exo 2' (粗体、斜体)
- **文本字体**: 'M PLUS Rounded 1c'
- **中文字体**: 'Noto Sans SC'

#### 核心组件
1. **卡片系统** (`.dash-card-box`)
   - 斜切设计（skewX: -10deg）
   - 悬浮上浮效果
   - 阴影系统

2. **队伍卡片** (`.pkm-summary`)
   - 展开/收起动画
   - AVS 面板
   - 机制标记

3. **盒子系统** (`.box-storage-area`)
   - 网格布局
   - 选中状态
   - 信号丢失覆盖层

4. **关系网格** (`#social-grid-view`)
   - 自适应网格
   - 好感度进度条
   - 羁绊徽章

5. **交通面板** (`.transit-item`)
   - 分组显示（本地/外部）
   - 距离计算
   - 状态标记（HERE/AVAILABLE/LOCKED）

---

## 技术特性 (Technical Features)

### 1. 响应式设计
- 最大宽度: 480px
- 适配移动端和桌面端
- Flexbox 布局

### 2. 性能优化
- 防抖刷新机制（200ms）
- 图片懒加载
- 精灵图缓存
- 渲染循环优化

### 3. 跨域通信
- postMessage API
- iframe 嵌入支持
- 双向数据同步

### 4. 错误处理
- 图片加载降级策略
- 数据验证
- 默认值填充

### 5. 动画系统
- CSS Transitions
- Keyframe 动画
- 缓动函数（cubic-bezier）

---

## 数据持久化 (Data Persistence)

### ERA 变量系统
所有数据存储在 SillyTavern 的 ERA 变量中：
- **player**: 玩家数据
- **world_state**: 世界状态
- **settings**: 系统设置

### 变量操作指令
1. **VariableEdit**: 修改现有变量
2. **VariableInsert**: 插入新变量
3. **VariableDelete**: 删除变量

### 示例
```xml
<VariableEdit>
{
  "player": {
    "party": {
      "slot1": { /* 宝可梦数据 */ }
    }
  }
}
</VariableEdit>
```

---

## 浏览器兼容性 (Browser Compatibility)

### 支持的浏览器
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### 依赖的 Web API
- Canvas API
- Fetch API
- Clipboard API
- postMessage API
- localStorage (可选)

---

## 部署方式 (Deployment)

### GitHub Pages
- 主站: `https://hasheeper.github.io/pkm55/`
- 地图: `https://hasheeper.github.io/pkm55/map/`

### SillyTavern 集成
1. 通过 `tavern-inject.js` 注入悬浮球
2. 点击悬浮球打开 iframe
3. 自动同步 ERA 数据

---

## 总结 (Summary)

PKM System 是一个功能完整、设计精美的宝可梦训练师管理系统，具有以下优势：

✅ **实时同步**: 与 AI 对话系统无缝集成
✅ **现代 UI**: Ver. Dawn 设计语言，流畅动画
✅ **完整功能**: 队伍/盒子/关系/交通/地图全覆盖
✅ **智能系统**: 信号塔覆盖、异变事件、位置上下文
✅ **高性能**: 防抖优化、懒加载、缓存机制
✅ **易扩展**: 模块化架构，清晰的数据流

代码总量: **约 15,000+ 行**
主要语言: JavaScript, CSS, HTML
