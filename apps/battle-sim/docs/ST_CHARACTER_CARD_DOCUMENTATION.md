# SillyTavern 角色卡系统文档

> **版本**: Pokemon Pink v1.9.1  
> **最后更新**: 2026-01-22  
> **适用平台**: SillyTavern (Character Card v3.0)

---

## 📋 目录

1. [系统概述](#系统概述)
2. [角色卡结构](#角色卡结构)
3. [ERA 变量系统](#era-变量系统)
4. [Character Book (角色书)](#character-book-角色书)
5. [插件系统](#插件系统)
6. [前端集成](#前端集成)
7. [开发指南](#开发指南)

---

## 系统概述

### 简介

Pokemon Pink 使用 SillyTavern 的 Character Card v3.0 规范，通过以下组件实现完整的 TRPG 体验：

- **角色卡主体**: 世界观设定、开局剧本
- **ERA 变量系统**: 玩家数据、世界状态管理
- **Character Book**: NPC 信息库（28 角色）
- **插件系统**: 战斗引擎集成、状态栏、变量管理
- **前端集成**: GitHub Pages 托管的战斗界面

### 核心特性

1. **动态变量管理**: 实时追踪玩家队伍、世界状态、NPC 好感度
2. **智能触发系统**: 基于关键词自动注入 NPC 信息
3. **战斗系统集成**: 通过 iframe 嵌入完整战斗引擎
4. **多开局支持**: 空白开局、战斗演示、完整剧情
5. **兼容性设计**: 支持新旧 ERA 变量格式

---

## 角色卡结构

### Character Card v3.0 格式

```json
{
  "spec": "chara_card_v3",
  "spec_version": "3.0",
  "data": {
    "name": "Pokemon Pink",
    "description": "",
    "personality": "",
    "scenario": "",
    "first_mes": "开局消息...",
    "mes_example": "",
    "creator_notes": "",
    "system_prompt": "",
    "post_history_instructions": "",
    "alternate_greetings": [...],
    "character_book": {...},
    "extensions": {...}
  }
}
```

### 开局消息 (first_mes)

**主开局 - 洛迪亚机场**：
- 长度：~1,500 字
- 场景：玩家抵达洛迪亚特区
- 引入角色：真朱（接待员）
- 世界观展示：AZC 联合体、粉雾、科技与传统冲突

### 备用开局 (alternate_greetings)

#### 1. 空白开局
```xml
[空白开局]
<VariableInsert>
{
  "settings": {
    "enableAVS": true,
    "enableCommander": true,
    "enableEVO": true,
    "enableBGM": true,
    "enableSFX": true,
    "enableClash": false
  },
  "player": {
    "name": "{{user}}",
    "trainerProficiency": 0,
    "party": { ... }
  }
}
</VariableInsert>
```

**用途**: 自定义开局，完全由玩家定义角色和队伍

#### 2. 战斗演示
```xml
[战斗演示]
<PKM_FRONTEND>
{
  "difficulty": "expert",
  "player": {
    "name": "Red (Mechanic Test)",
    "canMega": true,
    "party": [
      {
        "name": "Charizard",
        "lv": 100,
        "item": "Charizardite Y",
        "moves": ["Flamethrower", "Solar Beam", ...]
      }
    ]
  },
  "trainer": {
    "id": "cynthia",
    "tier": 4
  }
}
</PKM_FRONTEND>
```

**用途**: 快速测试战斗系统，预设强力队伍

#### 3. 战斗演示2 - 火力全开
```xml
[战斗演示2—火力全开]
<PKM_FRONTEND>
{
  "difficulty": "expert",
  "settings": {
    "enableClash": true
  },
  "player": {
    "trainerProficiency": 255,
    "unlocks": {
      "enable_mega": true,
      "enable_z_move": true,
      "enable_styles": true,
      "enable_bond": true,
      "enable_tera": true,
      "enable_dynamax": true
    }
  }
}
</PKM_FRONTEND>
```

**用途**: 展示所有机制（Mega/Z/Max/Tera/对冲/古武）

---

## ERA 变量系统

### 变量结构 (新格式)

```json
{
  "settings": {
    "enableAVS": true,
    "enableCommander": true,
    "enableEVO": true,
    "enableBGM": true,
    "enableSFX": true,
    "enableClash": false
  },
  "player": {
    "name": "玩家名",
    "trainerProficiency": 0,
    "proficiency_up": 0,
    "bonds": { ... },
    "unlocks": { ... },
    "party": {
      "slot1": { ... },
      "slot2": { ... },
      ...
    },
    "reserve": []
  },
  "world_state": {
    "location": {
      "region": "洛迪亚",
      "area": "中央区",
      "landmark": "机场"
    },
    "time": {
      "day": 1,
      "period": "afternoon"
    },
    "npcs": {
      "真朱": { "love": 0, "love_up": 0 },
      ...
    }
  }
}
```

### 玩家数据 (player)

#### 基础属性
```json
{
  "name": "玩家名",
  "trainerProficiency": 0,      // 训练家熟练度 (0-255)
  "proficiency_up": 0            // 本次对话熟练度增量
}
```

#### 解锁系统 (unlocks)
```json
{
  "enable_bond": false,          // 羁绊进化
  "enable_styles": false,        // 古武风格
  "enable_insight": false,       // 杀意感知
  "enable_mega": false,          // Mega 进化
  "enable_z_move": false,        // Z 招式
  "enable_dynamax": false,       // 极巨化
  "enable_tera": false,          // 太晶化
  "enable_proficiency_cap": false // 熟练度上限解锁
}
```

#### 队伍数据 (party)

**单个宝可梦结构**：
```json
{
  "slot": 1,
  "name": "Charizard",
  "nickname": "小火龙",
  "species": "Charizard",
  "gender": "M",
  "lv": 50,
  "quality": "perfect",
  "nature": "Timid",
  "ability": "Solar Power",
  "shiny": false,
  "item": "Charizardite Y",
  "mechanic": "mega",
  "teraType": "Fire",
  "isAce": true,
  "isLead": false,
  "friendship": {
    "avs": {
      "trust": 100,
      "passion": 150,
      "insight": 80,
      "devotion": 60
    },
    "av_up": {
      "trust": 0,
      "passion": 0,
      "insight": 0,
      "devotion": 0
    }
  },
  "moves": {
    "move1": "Flamethrower",
    "move2": "Solar Beam",
    "move3": "Dragon Pulse",
    "move4": "Roost"
  },
  "stats_meta": {
    "is_perfect": false,
    "ivs": {
      "hp": 31,
      "atk": 0,
      "def": 31,
      "spa": 31,
      "spd": 31,
      "spe": 31
    },
    "ev_level": 252
  }
}
```

**字段说明**：
- `quality`: 品质（"perfect", "excellent", "good", "normal"）
- `mechanic`: 机制类型（"mega", "zmove", "dynamax", "tera", "bond"）
- `isAce`: 是否为王牌（影响羁绊进化）
- `isLead`: 是否为先发
- `avs`: 羁绊值（Trust/Passion/Insight/Devotion）
- `ev_level`: 努力值等级（0-252）

### 世界状态 (world_state)

#### 位置信息 (location)
```json
{
  "region": "洛迪亚",
  "area": "S区",
  "landmark": "幽灵图书馆"
}
```

#### 时间系统 (time)
```json
{
  "day": 3,
  "period": "night"
}
```

**时间段 (period)**：
- `early_morning`: 凌晨
- `morning`: 早晨
- `noon`: 中午
- `afternoon`: 下午
- `evening`: 傍晚
- `night`: 夜晚
- `midnight`: 深夜

#### NPC 好感度 (npcs)
```json
{
  "真朱": {
    "love": 50,
    "love_up": 10
  },
  "阿塞萝拉": {
    "love": 30,
    "love_up": 5
  }
}
```

### 变量操作标签

#### VariableInsert (初始化)
```xml
<VariableInsert>
{
  "player": {
    "name": "Red",
    "party": { ... }
  }
}
</VariableInsert>
```

#### VariableEdit (更新)
```xml
<VariableEdit>
{
  "player.party.slot1.lv": 51,
  "player.trainerProficiency": 10,
  "world_state.npcs.真朱.love_up": 5
}
</VariableEdit>
```

#### VariableDelete (删除)
```xml
<VariableDelete>
["player.party.slot6", "world_state.npcs.临时NPC"]
</VariableDelete>
```

---

## Character Book (角色书)

### 概述

Pokemon Pink 包含 **35+ NPC 角色**，每个角色都有详细的设定信息。

### 角色条目结构

```json
{
  "id": 35,
  "keys": ["阿塞萝拉", "Acerola", "アセロラ"],
  "secondary_keys": [],
  "comment": "🟢AcerolaⓂ️",
  "content": "<acerola_info>...</acerola_info>",
  "constant": false,
  "selective": true,
  "insertion_order": 23,
  "enabled": true,
  "position": "after_char",
  "use_regex": true,
  "extensions": {
    "position": 4,
    "depth": 4,
    "probability": 100
  }
}
```

### 角色信息模板

```xml
<character_info>
Name: 角色名 (中文名)
Type: Trainer / Trial Captain / Elite Four
Role: 区域定位 / 职务
Base_Loc: 常驻地点
Introduction: 角色简介
Tags: [标签1, 标签2, ...]

Appearance:
  Figure: [身材特征, 肤色, 发色, 瞳色, ...]
  Attire: [服装描述]

Character_Summary:
角色性格、行为模式、世界观认知的详细描述

Detailed_Records:
  - Scenario: 场景名称
    Context: 触发条件
    Dialogues:
      - 「日语台词」
      - 「中文翻译」

Pokemon_Team:
  Tier_1: [低等级队伍]
  Tier_2: [中等级队伍]
  Tier_3: [高等级队伍]
  Tier_4: [冠军级队伍]

Pokemon_Roles:
  Partner_Ace:
    Name: 王牌宝可梦
    Description: 详细描述
</character_info>
```

### 触发机制

**关键词触发**：
- `keys`: 主要触发词（角色名、日文名、英文名）
- `secondary_keys`: 次要触发词（别名、称号）
- `use_regex`: 启用正则匹配

**插入位置**：
- `position`: "after_char" - 在角色定义后插入
- `depth`: 4 - 插入深度（影响上下文优先级）
- `insertion_order`: 控制多个条目的顺序

**概率控制**：
- `probability`: 100 - 触发概率（100% 必定触发）
- `selective`: true - 选择性触发（仅在关键词出现时）

### 主要 NPC 列表

| ID | 角色名 | 区域 | 职务 | 特色 |
|----|--------|------|------|------|
| 0 | 真朱 | 中央区 | 接待员 | 古风道服、科技恐惧症 |
| 35 | 阿塞萝拉 | S区 | 馆主 | 幽灵专家、拾荒公主 |
| ... | ... | ... | ... | ... |

---

## 插件系统

### 插件架构

Pokemon Pink 使用 3 个核心插件：

1. **ERA 变量框架** (`ERA变量框架1.4.11`)
2. **预设数据脚本** (`脚本`)
3. **状态栏插件** (`状态栏`)

### 1. ERA 变量框架

**功能**：
- 变量管理与持久化
- 悬浮球 UI
- 繁简转换
- 调试模式

**配置选项**：
```json
{
  "在ai消息尾部生成特殊符号": true,
  "特殊符号值": "<StatusPlaceHolderImpl/>",
  "开启悬浮球": true,
  "开启黑夜模式": false,
  "强制重载功能": false,
  "强制重载消息数": 2,
  "繁体转简体": false,
  "调试模式": false
}
```

### 2. 预设数据脚本

**功能**：
- 预设训练家数据（Gloria, Akari, Cynthia 等）
- 快速加载测试队伍

**数据结构**：
```javascript
const GLORIA_DATA = {
  4: {  // Tier 4 (冠军级)
    trainerProficiency: 255,
    unlocks: { enable_dynamax: true },
    party: [
      {
        name: "Zacian-Crowned",
        lv: 99,
        item: "Rusted Sword",
        moves: ["Behemoth Blade", ...]
      }
    ]
  }
};
```

### 3. 状态栏插件

**功能**：
- 悬浮球 UI（右上角）
- 点击打开 PKM Dashboard
- ERA 变量注入
- 位置上下文管理

**实现**：
```javascript
const PKM_URL = 'https://hasheeper.github.io/pkm55/';

// 创建悬浮球
const ball = $('<div>')
  .attr('id', 'pkm-ball')
  .css({
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(...)',
    animation: 'pkm-float 3s ease-in-out infinite'
  });

// 点击事件
ball.on('click', function() {
  window.open(PKM_URL, '_blank');
});
```

### 正则脚本系统

**功能**：从 AI 输出中移除特定标签

#### 前端删除
```regex
/<PKM_FRONTEND>([\s\S]*?)</PKM_FRONTEND>/gmi
```
**作用**：移除战斗前端 JSON，避免显示给用户

#### 去除思维链
```regex
/([\s\S]*)<\/(think|planning)>/g
```
**作用**：移除 AI 思考过程，保持输出简洁

#### 删除战斗
```regex
/<PKM_BATTLE>([\s\S]*?)</PKM_BATTLE>/gmi
```
**作用**：移除战斗日志，仅保留叙事部分

#### ERA 隐藏变量
```regex
/<(?:VariableInsert|VariableEdit|VariableDelete)>[\s\S]*?</(?:VariableInsert|VariableEdit|VariableDelete)>/gsi
```
**作用**：隐藏变量操作标签，避免干扰阅读

#### 界面注入
```regex
<PKM_FRONTEND>([\s\S]*?)</PKM_FRONTEND>
```
**替换为**：完整的 HTML iframe 包装器
**作用**：将 JSON 数据转换为可交互的战斗界面

---

## 前端集成

### 战斗界面嵌入

**流程**：
1. AI 输出 `<PKM_FRONTEND>` 标签包裹的 JSON
2. 正则脚本捕获 JSON 数据
3. 生成 HTML iframe 包装器
4. 嵌入 GitHub Pages 托管的战斗引擎

**生成的 HTML 结构**：
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>PKM - Frame Wrapper</title>
  <style>
    /* 全屏样式 */
    #app-frame {
      width: 100%;
      height: 100vh;
      border: 0;
    }
  </style>
</head>
<body>
  <!-- 工具栏 -->
  <div id="frame-toolbar">
    <button id="btn-enter">放大</button>
    <button id="btn-exit" hidden>退出</button>
  </div>
  
  <!-- JSON 数据 -->
  <script id="pkm-json" type="application/json">
    {战斗数据}
  </script>
  
  <!-- 战斗引擎 iframe -->
  <iframe
    id="app-frame"
    src="https://hasheeper.github.io/pkm33/"
    sandbox="allow-scripts allow-same-origin"
  ></iframe>
  
  <script>
    // 全屏切换逻辑
    // postMessage 通信
  </script>
</body>
</html>
```

### 数据通信

**iframe → 父页面**：
```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'PKM_BATTLE_END') {
    const result = event.data.payload;
    // 处理战斗结果
  }
});
```

**父页面 → iframe**：
```javascript
const battleData = JSON.parse(
  document.getElementById('pkm-json').textContent
);

iframe.contentWindow.postMessage({
  type: 'PKM_INIT',
  payload: battleData
}, '*');
```

---

## 开发指南

### 添加新 NPC

#### 1. 创建角色条目

```json
{
  "id": 36,
  "keys": ["新角色", "New Character"],
  "comment": "🟢NewCharacterⓂ️",
  "content": "<new_character_info>\nName: New Character (新角色)\n...\n</new_character_info>",
  "selective": true,
  "insertion_order": 24,
  "enabled": true,
  "position": "after_char",
  "extensions": {
    "depth": 4,
    "probability": 100
  }
}
```

#### 2. 编写角色信息

```xml
<new_character_info>
Name: New Character (新角色)
Type: Trainer
Role: 区域守护者
Base_Loc: 新区域 · 地标建筑
Introduction: 角色背景介绍

Appearance:
  Figure: [外貌特征]
  Attire: [服装描述]

Character_Summary:
性格、行为模式、价值观描述

Detailed_Records:
  - Scenario: 初次见面
    Context: 玩家进入新区域
    Dialogues:
      - 「你好，欢迎来到这里。」

Pokemon_Team:
  Tier_4:
    - Pokémon: Lv.90
</new_character_info>
```

### 修改 ERA 变量格式

#### 旧格式 → 新格式迁移

**旧格式**：
```json
{
  "pkm": {
    "player": { ... },
    "world_state": { ... }
  }
}
```

**新格式**：
```json
{
  "player": { ... },
  "world_state": { ... }
}
```

**兼容性**：插件自动检测格式，无需手动转换

### 自定义正则脚本

#### 添加新的过滤规则

```json
{
  "id": "custom-filter",
  "scriptName": "自定义过滤",
  "findRegex": "/<CUSTOM_TAG>([\\s\\S]*?)</CUSTOM_TAG>/gmi",
  "replaceString": "",
  "placement": [2],
  "disabled": false,
  "markdownOnly": true,
  "promptOnly": true,
  "runOnEdit": true
}
```

**参数说明**：
- `findRegex`: 正则表达式（需转义）
- `replaceString`: 替换内容
- `placement`: [1]=用户消息, [2]=AI消息
- `markdownOnly`: 仅处理 Markdown
- `promptOnly`: 仅在 Prompt 中处理
- `runOnEdit`: 编辑时也运行

### 扩展插件功能

#### 添加新的 API 函数

```javascript
// 在 pkm-tavern-plugin.js 中添加
window.PKMPlugin = {
  // 现有 API
  getPlayerParty: async function() { ... },
  
  // 新增 API
  getPlayerProficiency: async function() {
    const eraVars = await getEraVars();
    return getEraValue(eraVars, 'player.trainerProficiency', 0);
  },
  
  addProficiency: async function(amount) {
    await updateEraVars({
      'player.proficiency_up': amount
    });
  }
};
```

---

## 最佳实践

### 1. 变量管理

**推荐**：
- 使用新格式（无 `pkm.` 前缀）
- 及时清理无用变量
- 使用 `_up` 字段记录增量

**避免**：
- 直接修改历史消息中的变量
- 在同一消息中多次更新同一变量

### 2. NPC 触发

**推荐**：
- 使用多个关键词（中文/英文/日文）
- 设置合理的 `insertion_order`
- 控制信息长度（避免超出上下文）

**避免**：
- 过于宽泛的关键词（如"她"）
- 过高的触发概率（非核心 NPC）

### 3. 前端集成

**推荐**：
- 使用 `<PKM_FRONTEND>` 包裹完整 JSON
- 验证 JSON 格式正确性
- 提供友好的错误提示

**避免**：
- 在 JSON 中使用未转义的引号
- 遗漏必需字段（如 `player.party`）

### 4. 性能优化

**推荐**：
- 启用 `selective` 减少不必要的注入
- 使用 `depth` 控制优先级
- 定期清理 `reserve` 中的宝可梦

**避免**：
- 所有 NPC 都设置 `constant: true`
- 过深的嵌套结构

---

## 常见问题

### Q: 如何重置 ERA 变量？

A: 使用 `<VariableInsert>` 标签重新初始化：
```xml
<VariableInsert>
{
  "player": { ... },
  "world_state": { ... }
}
</VariableInsert>
```

### Q: NPC 信息没有触发？

A: 检查以下项：
1. `enabled: true`
2. `keys` 包含正确的触发词
3. `selective: true` 且消息中包含关键词
4. `probability` 设置合理

### Q: 战斗界面无法加载？

A: 检查：
1. JSON 格式是否正确
2. 网络连接是否正常
3. GitHub Pages 是否可访问
4. 浏览器控制台是否有错误

### Q: 如何添加自定义宝可梦？

A: 在 `player.party` 中添加：
```json
{
  "slot": 7,
  "name": "CustomPokemon",
  "lv": 50,
  "moves": ["Move1", "Move2", "Move3", "Move4"]
}
```

---

## 附录

### ERA 变量完整示例

```json
{
  "settings": {
    "enableAVS": true,
    "enableCommander": true,
    "enableEVO": true,
    "enableBGM": true,
    "enableSFX": true,
    "enableClash": false
  },
  "player": {
    "name": "Red",
    "trainerProficiency": 100,
    "proficiency_up": 0,
    "bonds": {
      "enable_bond": true,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": true,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": false
    },
    "unlocks": {
      "enable_bond": true,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": true,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": false
    },
    "party": {
      "slot1": {
        "name": "Charizard",
        "lv": 80,
        "item": "Charizardite Y",
        "isAce": true,
        "moves": {
          "move1": "Flamethrower",
          "move2": "Solar Beam",
          "move3": "Dragon Pulse",
          "move4": "Roost"
        }
      }
    },
    "reserve": []
  },
  "world_state": {
    "location": {
      "region": "洛迪亚",
      "area": "中央区",
      "landmark": "机场"
    },
    "time": {
      "day": 1,
      "period": "afternoon"
    },
    "npcs": {
      "真朱": {
        "love": 0,
        "love_up": 0
      }
    }
  }
}
```

---

**文档结束**

更多信息请参考主战斗引擎文档或提交 Issue。
