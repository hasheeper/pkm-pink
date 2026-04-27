# 反伤倒下与粉末类招式测试文档

本文档包含用于测试反伤技能导致倒下以及粉末类招式免疫机制的战斗 JSON 示例。

适用于 `systems/data-loader.js` 加载测试。

---

## Bug 修复记录

### Bug 1: 反伤技能导致战斗卡住

**问题描述**: 使用闪焰冲锋、勇鸟、疯狂伏特等反伤技能时，如果自己的宝可梦因反伤倒下，战斗界面会卡住，不会自动跳转到选择下一个宝可梦的界面。

**根本原因**: 在 `index.js` 的 `handleAttack` 函数中，`enemyWillSwitch` 分支（敌方换人后玩家攻击）没有检查玩家是否因反伤倒下。

**修复位置**: `index.js` 第 1927-1937 行

**修复内容**: 在 `executePlayerTurn` 后添加玩家倒下检测：
```javascript
// 【BUG修复】检查玩家是否因反伤倒下（闪焰冲锋/勇鸟/疯狂伏特等）
if (!p.isAlive()) {
    console.log('[handleAttack] Player fainted from recoil in enemySwitch branch');
    if (!e.isAlive()) {
        await handleEnemyFainted(e);
    }
    await handlePlayerFainted(p);
    return;
}
```

---

### Bug 2: 草系宝可梦被催眠粉催眠

**问题描述**: 草系宝可梦（如妙蛙花）被催眠粉等粉末类招式催眠，但按照官方规则，草系应该免疫所有粉末类招式。

**根本原因**: 在 `battle/battle-effects.js` 的 `applyMoveSecondaryEffects` 函数中，`fullMoveData.status` 路径直接调用 `tryInflictStatus`，没有先检查粉末类招式的草系免疫。

**修复位置**: `battle/battle-effects.js` 第 386-410 行

**修复内容**: 在施加状态前添加粉末类招式免疫检查：
```javascript
// 【BUG修复】粉末类招式免疫检查（草系/防尘护目镜/防尘特性）
const powderMoves = ['spore', 'sleeppowder', 'poisonpowder', 'stunspore', 'ragepowder', 'cottonspore', 'powder'];
if (powderMoves.includes(moveId)) {
    // 草系免疫
    if (target.types && target.types.includes('Grass')) {
        logs.push(`${target.cnName} 的草属性免疫了粉末类招式!`);
        return { logs, pivot: pivotTriggered };
    }
    // 防尘护目镜免疫
    // 防尘特性免疫
    // ...
}
```

---

## 测试用例 1: 反伤技能倒下测试

**测试重点**: 
- 玩家使用反伤技能击杀敌方后自己也因反伤倒下
- 敌方换人后玩家使用反伤技能自己倒下
- 双方同时倒下的处理

```json
{
  "player": {
    "name": "反伤测试玩家",
    "trainerProficiency": 100,
    "party": [
      {
        "name": "Staraptor",
        "lv": 50,
        "gender": "M",
        "nature": "Adamant",
        "ability": "Reckless",
        "item": null,
        "isLead": true,
        "stats_meta": {
          "ev_level": 252,
          "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
        },
        "moves": ["Brave Bird", "Double-Edge", "Close Combat", "U-turn"]
      },
      {
        "name": "Arcanine",
        "lv": 50,
        "gender": "M",
        "nature": "Adamant",
        "ability": "Flash Fire",
        "item": null,
        "stats_meta": {
          "ev_level": 252,
          "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
        },
        "moves": ["Flare Blitz", "Wild Charge", "Extreme Speed", "Close Combat"]
      },
      {
        "name": "Luxray",
        "lv": 50,
        "gender": "M",
        "nature": "Adamant",
        "ability": "Intimidate",
        "item": null,
        "stats_meta": {
          "ev_level": 252,
          "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
        },
        "moves": ["Wild Charge", "Crunch", "Ice Fang", "Volt Switch"]
      }
    ],
    "unlocks": {}
  },
  "enemy": {
    "id": "recoil_test_trainer",
    "type": "trainer",
    "name": "反伤测试训练家",
    "trainerProficiency": 100,
    "lines": {
      "intro": "来测试反伤技能吧！",
      "win": "反伤测试完成！",
      "lose": "你通过了测试！"
    }
  },
  "party": [
    {
      "name": "Blissey",
      "lv": 50,
      "gender": "F",
      "nature": "Bold",
      "ability": "Natural Cure",
      "item": "Leftovers",
      "stats_meta": {
        "ev_level": 252,
        "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
      },
      "moves": ["Soft-Boiled", "Seismic Toss", "Thunder Wave", "Toxic"]
    },
    {
      "name": "Chansey",
      "lv": 50,
      "gender": "F",
      "nature": "Bold",
      "ability": "Natural Cure",
      "item": "Eviolite",
      "stats_meta": {
        "ev_level": 252,
        "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
      },
      "moves": ["Soft-Boiled", "Seismic Toss", "Heal Bell", "Stealth Rock"]
    }
  ],
  "settings": {
    "enableAVS": false,
    "enableEnvironment": false
  }
}
```

**测试步骤**:
1. 使用 Staraptor 的勇鸟 (Brave Bird) 攻击 Blissey
2. 多次攻击直到 Staraptor 因反伤倒下
3. 验证：战斗应该正常弹出换人界面，不会卡住

---

## 测试用例 2: 粉末类招式草系免疫测试

**测试重点**: 
- 草系宝可梦免疫催眠粉、蘑菇孢子、毒粉等粉末类招式
- 防尘护目镜免疫粉末类招式
- 防尘特性免疫粉末类招式

```json
{
  "player": {
    "name": "粉末测试玩家",
    "trainerProficiency": 100,
    "party": [
      {
        "name": "Venusaur",
        "lv": 50,
        "gender": "M",
        "nature": "Modest",
        "ability": "Chlorophyll",
        "item": null,
        "isLead": true,
        "stats_meta": {
          "ev_level": 252,
          "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
        },
        "moves": ["Sleep Powder", "Giga Drain", "Sludge Bomb", "Synthesis"]
      },
      {
        "name": "Pikachu",
        "lv": 50,
        "gender": "M",
        "nature": "Timid",
        "ability": "Static",
        "item": "Safety Goggles",
        "stats_meta": {
          "ev_level": 252,
          "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
        },
        "moves": ["Thunderbolt", "Volt Switch", "Grass Knot", "Nuzzle"]
      },
      {
        "name": "Forretress",
        "lv": 50,
        "gender": "M",
        "nature": "Relaxed",
        "ability": "Overcoat",
        "item": "Leftovers",
        "stats_meta": {
          "ev_level": 252,
          "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 0 }
        },
        "moves": ["Stealth Rock", "Spikes", "Rapid Spin", "Volt Switch"]
      }
    ],
    "unlocks": {}
  },
  "enemy": {
    "id": "powder_test_trainer",
    "type": "trainer",
    "name": "粉末测试训练家",
    "trainerProficiency": 100,
    "lines": {
      "intro": "来测试粉末类招式免疫吧！",
      "win": "粉末测试完成！",
      "lose": "你通过了测试！"
    }
  },
  "party": [
    {
      "name": "Breloom",
      "lv": 50,
      "gender": "M",
      "nature": "Jolly",
      "ability": "Technician",
      "item": "Focus Sash",
      "stats_meta": {
        "ev_level": 252,
        "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
      },
      "moves": ["Spore", "Mach Punch", "Bullet Seed", "Rock Tomb"]
    },
    {
      "name": "Vileplume",
      "lv": 50,
      "gender": "F",
      "nature": "Bold",
      "ability": "Effect Spore",
      "item": "Black Sludge",
      "stats_meta": {
        "ev_level": 252,
        "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
      },
      "moves": ["Sleep Powder", "Stun Spore", "Giga Drain", "Sludge Bomb"]
    },
    {
      "name": "Butterfree",
      "lv": 50,
      "gender": "F",
      "nature": "Timid",
      "ability": "Compound Eyes",
      "item": null,
      "stats_meta": {
        "ev_level": 252,
        "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
      },
      "moves": ["Sleep Powder", "Stun Spore", "Poison Powder", "Bug Buzz"]
    }
  ],
  "settings": {
    "enableAVS": false,
    "enableEnvironment": false
  }
}
```

**测试步骤**:
1. 让敌方 Breloom 对玩家 Venusaur 使用蘑菇孢子 (Spore)
2. 验证：应显示 "妙蛙花 的草属性免疫了粉末类招式!"
3. 换入 Pikachu（持有防尘护目镜），让敌方使用催眠粉
4. 验证：应显示 "皮卡丘 的防尘护目镜免疫了粉末类招式!"
5. 换入 Forretress（防尘特性），让敌方使用催眠粉
6. 验证：应显示 "佛烈托斯 的防尘特性免疫了粉末类招式!"

---

## 粉末类招式列表

| 招式名 | 英文名 | 效果 |
|--------|--------|------|
| 蘑菇孢子 | Spore | 100% 催眠 |
| 催眠粉 | Sleep Powder | 75% 催眠 |
| 毒粉 | Poison Powder | 100% 中毒 |
| 麻痹粉 | Stun Spore | 100% 麻痹 |
| 愤怒粉 | Rage Powder | 引诱攻击 |
| 棉孢子 | Cotton Spore | 降速 |
| 粉尘 | Powder | 火系招式反伤 |

---

## 反伤技能列表

| 招式名 | 英文名 | 反伤比例 |
|--------|--------|----------|
| 勇鸟 | Brave Bird | 1/3 造成伤害 |
| 闪焰冲锋 | Flare Blitz | 1/3 造成伤害 |
| 疯狂伏特 | Wild Charge | 1/4 造成伤害 |
| 舍身冲撞 | Double-Edge | 1/3 造成伤害 |
| 伏特攻击 | Volt Tackle | 1/3 造成伤害 |
| 木槌 | Wood Hammer | 1/3 造成伤害 |
| 飞膝踢 | High Jump Kick | 失败时 1/2 最大HP |
| 自爆 | Explosion | 使用者倒下 |
| 大爆炸 | Self-Destruct | 使用者倒下 |

---

## 相关代码文件

- `index.js` - handleAttack 函数（反伤倒下检测）
- `battle/battle-effects.js` - applyMoveSecondaryEffects 函数（粉末类招式免疫）
- `engine/move-effects.js` - processMoveStatusEffects 函数（状态效果处理）
- `battle/battle-switch.js` - handlePlayerFainted 函数（玩家倒下处理）
