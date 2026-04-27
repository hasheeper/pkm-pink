# 战斗测试示例文档

本文档包含完整的战斗 JSON 示例，用于测试 `data-loader.js` 和环境图层系统。

---

## JSON 格式说明

```javascript
{
  // 玩家配置 (可选)
  "player": {
    "name": "玩家名",
    "trainerProficiency": 100,
    "party": [...],
    "unlocks": { ... }
  },
  
  // 敌方训练家配置
  "enemy": {
    "id": "trainer_id",
    "type": "trainer",
    "name": "训练家名",
    "trainerProficiency": 100,
    "lines": { "intro": "开场台词" }
  },
  
  // 敌方队伍 (必需)
  "party": [...],
  
  // 环境配置 (可选)
  "environment": {
    "weather": "rain" | "sun" | "sandstorm" | "snow" | null,
    "weatherTurns": 0,
    "overlay": {
      "env_name": "环境名称",
      "narrative": "环境描述",
      "rules": [...]
    }
  },
  
  // 战斗设置 (可选)
  "settings": {
    "enableAVS": true,
    "enableEnvironment": true
  }
}
```

---

## 宝可梦格式说明

```javascript
{
  "name": "Pikachu",           // 宝可梦名称 (必需)
  "lv": 50,                    // 等级 1-100 (必需)
  "gender": "M" | "F" | null,  // 性别
  "nature": "Timid",           // 性格
  "ability": "Static",         // 特性
  "item": "Light Ball",        // 道具
  "isAce": false,              // 是否为王牌
  "isLead": false,             // 是否为首发
  "stats_meta": {
    "ev_level": 252,           // 努力值等级 0-252
    "ivs": {                   // 个体值
      "hp": 31, "atk": 31, "def": 31,
      "spa": 31, "spd": 31, "spe": 31
    }
  },
  "moves": ["Thunderbolt", "Volt Tackle", "Iron Tail", "Quick Attack"],
  "avs": {                     // AVS 系统数值 (可选)
    "trust": 100,
    "passion": 100,
    "insight": 100,
    "devotion": 100
  }
}
```

---

## 测试用例 1: 烟霾 (Smog) - 工业污染环境

**测试重点**: 回复减半、毒/钢/电系免疫 HP 损失、火系招式增强

```json
{
  "player": {
    "name": "测试玩家",
    "trainerProficiency": 100,
    "party": [
      {
        "name": "Gengar",
        "lv": 50,
        "gender": "M",
        "nature": "Timid",
        "ability": "Cursed Body",
        "item": "Leftovers",
        "isLead": true,
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "moves": ["Shadow Ball", "Sludge Bomb", "Giga Drain", "Will-O-Wisp"]
      },
      {
        "name": "Magnezone",
        "lv": 50,
        "gender": null,
        "nature": "Modest",
        "ability": "Magnet Pull",
        "item": "Air Balloon",
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "moves": ["Thunderbolt", "Flash Cannon", "Volt Switch", "Thunder Wave"]
      }
    ],
    "unlocks": {
      "enable_bond": true,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": false,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": true
    }
  },
  "enemy": {
    "id": "smog_tester",
    "type": "trainer",
    "name": "工业区守卫",
    "trainerProficiency": 90,
    "lines": { "intro": "这片烟霾是我们的主场！" }
  },
  "party": [
    {
      "name": "Weezing",
      "lv": 50,
      "gender": "M",
      "nature": "Bold",
      "ability": "Levitate",
      "item": "Black Sludge",
      "isLead": true,
      "stats_meta": { "ev_level": 200, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Sludge Bomb", "Flamethrower", "Will-O-Wisp", "Pain Split"]
    },
    {
      "name": "Charizard",
      "lv": 50,
      "gender": "M",
      "nature": "Timid",
      "ability": "Blaze",
      "item": "Life Orb",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Fire Blast", "Air Slash", "Dragon Pulse", "Roost"]
    }
  ],
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
  },
  "settings": {
    "enableAVS": true,
    "enableEnvironment": true
  }
}
```

---

## 测试用例 2: 火山灰 (Ashfall) - 火山环境

**测试重点**: 接地速度下降、岩石招式增强+暴击、地面招式灼伤几率

```json
{
  "player": {
    "name": "测试玩家",
    "trainerProficiency": 100,
    "party": [
      {
        "name": "Garchomp",
        "lv": 50,
        "gender": "M",
        "nature": "Jolly",
        "ability": "Rough Skin",
        "item": "Rocky Helmet",
        "isLead": true,
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Earthquake", "Dragon Claw", "Stone Edge", "Swords Dance"]
      },
      {
        "name": "Skarmory",
        "lv": 50,
        "gender": "F",
        "nature": "Impish",
        "ability": "Sturdy",
        "item": "Leftovers",
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Brave Bird", "Iron Head", "Roost", "Spikes"]
      }
    ],
    "unlocks": {
      "enable_bond": true,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": false,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": true
    }
  },
  "enemy": {
    "id": "ashfall_tester",
    "type": "trainer",
    "name": "火山研究员",
    "trainerProficiency": 95,
    "lines": { "intro": "火山灰覆盖的战场，速度决定一切！" }
  },
  "party": [
    {
      "name": "Tyranitar",
      "lv": 50,
      "gender": "M",
      "nature": "Adamant",
      "ability": "Sand Stream",
      "item": "Assault Vest",
      "isLead": true,
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
      "moves": ["Stone Edge", "Crunch", "Earthquake", "Ice Punch"]
    },
    {
      "name": "Excadrill",
      "lv": 50,
      "gender": "M",
      "nature": "Jolly",
      "ability": "Sand Rush",
      "item": "Life Orb",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
      "moves": ["Earthquake", "Iron Head", "Rock Slide", "Swords Dance"]
    }
  ],
  "environment": {
    "weather": null,
    "overlay": {
      "env_name": "火山灰 (Ashfall)",
      "narrative": "细密的火山灰从天而降，覆盖了整个战场，地面变得滚烫...",
      "rules": [
        { "target": "Grounded", "eff": ["Spe:0.67"] },
        { "target": "Grounded+Type:Steel", "eff": ["Spe:0.5"] },
        { "target": "MoveType:Rock", "eff": ["Dmg:1.2", "CritStage:+1"] },
        { "target": "MoveType:Ground", "eff": ["Dmg:1.1", "Status:burn:0.2"] }
      ]
    }
  },
  "settings": {
    "enableAVS": true,
    "enableEnvironment": true
  }
}
```

---

## 测试用例 3: 暗影迷雾 (Shadow Fog) - 幽暗环境

**测试重点**: 命中率下降、幽灵/恶系增强+闪避、脉冲招式削弱、阻止冰冻

```json
{
  "player": {
    "name": "测试玩家",
    "trainerProficiency": 100,
    "party": [
      {
        "name": "Lucario",
        "lv": 50,
        "gender": "M",
        "nature": "Timid",
        "ability": "Inner Focus",
        "item": "Life Orb",
        "isLead": true,
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "moves": ["Aura Sphere", "Flash Cannon", "Dragon Pulse", "Nasty Plot"]
      },
      {
        "name": "Clefable",
        "lv": 50,
        "gender": "F",
        "nature": "Bold",
        "ability": "Magic Guard",
        "item": "Leftovers",
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
        "moves": ["Moonblast", "Flamethrower", "Soft-Boiled", "Thunder Wave"]
      }
    ],
    "unlocks": {
      "enable_bond": true,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": false,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": true
    }
  },
  "enemy": {
    "id": "fog_tester",
    "type": "trainer",
    "name": "暗影猎人",
    "trainerProficiency": 100,
    "lines": { "intro": "在这片迷雾中，你什么都看不见..." }
  },
  "party": [
    {
      "name": "Gengar",
      "lv": 50,
      "gender": "M",
      "nature": "Timid",
      "ability": "Cursed Body",
      "item": "Choice Specs",
      "isLead": true,
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Shadow Ball", "Sludge Wave", "Focus Blast", "Thunderbolt"]
    },
    {
      "name": "Umbreon",
      "lv": 50,
      "gender": "M",
      "nature": "Calm",
      "ability": "Synchronize",
      "item": "Leftovers",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Foul Play", "Toxic", "Wish", "Protect"]
    }
  ],
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
  },
  "settings": {
    "enableAVS": true,
    "enableEnvironment": true
  }
}
```

---

## 测试用例 4: 香风 (Fragrant Gale) - 热带花园环境

**测试重点**: 草系增强+回复、水系速度提升、火系削弱、阻止灼伤、治愈冰冻

```json
{
  "player": {
    "name": "测试玩家",
    "trainerProficiency": 100,
    "party": [
      {
        "name": "Blaziken",
        "lv": 50,
        "gender": "M",
        "nature": "Adamant",
        "ability": "Speed Boost",
        "item": "Life Orb",
        "isLead": true,
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Flare Blitz", "Close Combat", "Thunder Punch", "Swords Dance"]
      },
      {
        "name": "Mamoswine",
        "lv": 50,
        "gender": "M",
        "nature": "Adamant",
        "ability": "Thick Fat",
        "item": "Choice Band",
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Earthquake", "Icicle Crash", "Ice Shard", "Knock Off"]
      }
    ],
    "unlocks": {
      "enable_bond": true,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": false,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": true
    }
  },
  "enemy": {
    "id": "gale_tester",
    "type": "trainer",
    "name": "花园守护者",
    "trainerProficiency": 95,
    "lines": { "intro": "温暖的风带来生命的气息..." }
  },
  "party": [
    {
      "name": "Venusaur",
      "lv": 50,
      "gender": "M",
      "nature": "Modest",
      "ability": "Chlorophyll",
      "item": "Life Orb",
      "isLead": true,
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Giga Drain", "Sludge Bomb", "Earth Power", "Sleep Powder"]
    },
    {
      "name": "Swampert",
      "lv": 50,
      "gender": "M",
      "nature": "Adamant",
      "ability": "Torrent",
      "item": "Leftovers",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
      "moves": ["Waterfall", "Earthquake", "Ice Punch", "Stealth Rock"]
    },
    {
      "name": "Kartana",
      "lv": 50,
      "gender": null,
      "nature": "Jolly",
      "ability": "Beast Boost",
      "item": "Choice Scarf",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
      "moves": ["Leaf Blade", "Sacred Sword", "Smart Strike", "Knock Off"]
    }
  ],
  "environment": {
    "weather": "rain",
    "weatherTurns": 0,
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
  },
  "settings": {
    "enableAVS": true,
    "enableEnvironment": true
  }
}
```

---

## 测试用例 5: 熔岩洞穴 (Magma Cavern) - 高级组合选择器测试

**测试重点**: 组合选择器 (AND 逻辑)、道具禁用、吸血效率修正、反伤修正

```json
{
  "player": {
    "name": "测试玩家",
    "trainerProficiency": 100,
    "party": [
      {
        "name": "Gyarados",
        "lv": 50,
        "gender": "M",
        "nature": "Adamant",
        "ability": "Intimidate",
        "item": "Sitrus Berry",
        "isLead": true,
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 } },
        "moves": ["Waterfall", "Crunch", "Ice Fang", "Dragon Dance"]
      },
      {
        "name": "Ferrothorn",
        "lv": 50,
        "gender": "M",
        "nature": "Relaxed",
        "ability": "Iron Barbs",
        "item": "Leftovers",
        "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 0 } },
        "moves": ["Power Whip", "Gyro Ball", "Leech Seed", "Stealth Rock"]
      }
    ],
    "unlocks": {
      "enable_bond": true,
      "enable_styles": true,
      "enable_insight": true,
      "enable_mega": false,
      "enable_z_move": false,
      "enable_dynamax": false,
      "enable_tera": true
    }
  },
  "enemy": {
    "id": "magma_tester",
    "type": "trainer",
    "name": "熔岩领主",
    "trainerProficiency": 110,
    "lines": { "intro": "在这片炽热的领域，只有火焰才能生存！" }
  },
  "party": [
    {
      "name": "Heatran",
      "lv": 50,
      "gender": "M",
      "nature": "Modest",
      "ability": "Flash Fire",
      "item": "Air Balloon",
      "isLead": true,
      "isAce": true,
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Magma Storm", "Flash Cannon", "Earth Power", "Stealth Rock"]
    },
    {
      "name": "Volcarona",
      "lv": 50,
      "gender": "F",
      "nature": "Timid",
      "ability": "Flame Body",
      "item": "Heavy-Duty Boots",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Fiery Dance", "Bug Buzz", "Giga Drain", "Quiver Dance"]
    },
    {
      "name": "Coalossal",
      "lv": 50,
      "gender": "M",
      "nature": "Modest",
      "ability": "Steam Engine",
      "item": "Weakness Policy",
      "stats_meta": { "ev_level": 252, "ivs": { "hp": 31, "atk": 10, "def": 31, "spa": 31, "spd": 31, "spe": 31 } },
      "moves": ["Heat Wave", "Power Gem", "Scorching Sands", "Rapid Spin"]
    }
  ],
  "environment": {
    "weather": "sun",
    "weatherTurns": 0,
    "overlay": {
      "env_name": "熔岩洞穴 (Magma Cavern)",
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
  },
  "settings": {
    "enableAVS": true,
    "enableEnvironment": true
  }
}
```

---

## 快速测试命令

在浏览器控制台中使用以下命令加载测试用例：

```javascript
// 方法1: 直接加载 JSON 字符串
loadBattleFromJSON(JSON.stringify(testCase));

// 方法2: 仅注入环境图层
injectEnvironmentOverlay({
  "env_name": "测试环境",
  "narrative": "测试描述",
  "rules": [
    { "target": "ALL", "eff": ["Dmg:1.2"] }
  ]
});

// 方法3: 清除环境图层
clearEnvironmentOverlay();

// 方法4: 查看当前环境状态
window.envOverlay.debug();
window.envOverlay.getSummary();
```

---

## 验证检查点

### 烟霾 (Smog) 验证
- [ ] 非毒/钢/电系回合末扣 HP
- [ ] 火系招式威力增强
- [ ] Leftovers/Giga Drain 等回复效果减半

### 火山灰 (Ashfall) 验证
- [ ] 接地宝可梦速度下降
- [ ] 接地钢系速度进一步下降
- [ ] 岩石招式暴击率提升
- [ ] 地面招式有灼伤几率

### 暗影迷雾 (Shadow Fog) 验证
- [ ] 非幽灵/恶系命中率下降
- [ ] 幽灵/恶系闪避提升
- [ ] Aura Sphere 等脉冲招式威力下降
- [ ] 冰冻状态被阻止

### 香风 (Fragrant Gale) 验证
- [ ] 草系回合末回复 HP
- [ ] 水系速度提升
- [ ] 火系招式威力大幅下降
- [ ] Leaf Blade 等斩击招式增强
- [ ] 灼伤被阻止，冰冻被治愈

### 熔岩洞穴 (Magma Cavern) 验证
- [ ] 接地宝可梦回合末扣 HP
- [ ] 接地钢系额外扣 HP 且速度下降
- [ ] 火系+引火特性宝可梦伤害增强且回复 HP
- [ ] 水系接触招式威力下降且反伤增加
- [ ] 火系脉冲招式威力增强
- [ ] 气球持有者免疫地面
- [ ] 所有树果被禁用
- [ ] 吸血效率减半

---

## 注意事项

1. **JSON 格式**: 确保 JSON 格式正确，特别是逗号和引号
2. **宝可梦名称**: 使用英文名称，如 "Pikachu" 而非 "皮卡丘"
3. **招式名称**: 使用英文名称，如 "Thunderbolt" 而非 "十万伏特"
4. **特性名称**: 使用英文名称，如 "Static" 而非 "静电"
5. **道具名称**: 使用英文名称，如 "Leftovers" 而非 "吃剩的东西"
6. **环境叠加**: `weather` 和 `overlay` 可以同时存在，效果叠加
