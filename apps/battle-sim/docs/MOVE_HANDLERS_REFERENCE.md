# 🎯 PKM Battle Engine - 招式处理器参考文档

> 本文档记录了招式效果处理器 (MoveHandlers) 的正确使用方式

---

## 📋 目录

1. [招式处理器结构](#1-招式处理器结构)
2. [核心钩子函数](#2-核心钩子函数)
3. [常用工具函数](#3-常用工具函数)
4. [完整示例](#4-完整示例)

---

## 1. 招式处理器结构

招式处理器定义在 `battle/battle-effects.js` 中的 `MoveHandlers` 对象。

```javascript
const MoveHandlers = {
    'Move Name': {
        // 招式使用前检查
        onUse: (attacker, defender, logs, battle, isPlayerAttacking) => { ... },
        
        // 招式命中后效果
        onHit: (attacker, defender, move, damage, logs, battle) => { ... },
        
        // 特殊伤害计算
        calcDamage: (attacker, defender, move) => { ... },
        
        // 自定义执行逻辑
        execute: (attacker, defender, move, logs, battle) => { ... }
    }
};
```

---

## 2. 核心钩子函数

### `onUse` - 招式使用前检查

**调用时机**: 招式执行前，用于检查是否可以使用

```javascript
onUse: (attacker, defender, logs, battle, isPlayerAttacking) => {
    // attacker: Pokemon - 攻击方
    // defender: Pokemon - 防御方
    // logs: string[] - 日志数组
    // battle: BattleState - 战斗状态
    // isPlayerAttacking: boolean - 是否是玩家攻击
    
    // 返回 { failed: true } 表示招式失败
    // 返回 undefined 或不返回表示继续执行
    
    // 示例：Fake Out 只能首回合使用
    if (attacker.turnCount > 1) {
        logs.push(`${attacker.cnName} 的出其不意失败了！`);
        return { failed: true };
    }
}
```

---

### `onHit` - 招式命中后效果

**调用时机**: 招式命中并造成伤害后

```javascript
onHit: (attacker, defender, move, damage, logs, battle) => {
    // attacker: Pokemon - 攻击方
    // defender: Pokemon - 防御方
    // move: object - 招式对象
    // damage: number - 造成的伤害
    // logs: string[] - 日志数组
    // battle: BattleState - 战斗状态
    
    // 示例：吸血
    const healAmount = Math.floor(damage / 2);
    attacker.currHp = Math.min(attacker.maxHp, attacker.currHp + healAmount);
    logs.push(`${attacker.cnName} 吸收了 ${healAmount} HP！`);
    
    // 示例：降低对手能力
    if (defender.applyBoost) {
        defender.applyBoost('def', -1);
        logs.push(`${defender.cnName} 的防御下降了！`);
    }
}
```

---

### `calcDamage` - 自定义伤害计算

**调用时机**: 替代默认伤害计算

```javascript
calcDamage: (attacker, defender, move) => {
    // attacker: Pokemon - 攻击方
    // defender: Pokemon - 防御方
    // move: object - 招式对象
    
    // 返回: number - 固定伤害值
    
    // 示例：精神波 - 等级 x 随机倍率
    const multiplier = 0.5 + Math.random();
    return Math.floor(attacker.level * multiplier);
}
```

---

### `execute` - 完全自定义执行

**调用时机**: 替代整个招式执行流程

```javascript
execute: (attacker, defender, move, logs, battle) => {
    // attacker: Pokemon - 攻击方
    // defender: Pokemon - 防御方
    // move: object - 招式对象
    // logs: string[] - 日志数组
    // battle: BattleState - 战斗状态
    
    // 返回: { damage, effectiveness, ... } 或自定义结果
    
    // 示例：变化技
    attacker.applyBoost('atk', 2);
    logs.push(`${attacker.cnName} 的攻击大幅提升了！`);
    return { damage: 0, effectiveness: 1 };
}
```

---

## 3. 常用工具函数

### `MoveEffects.tryInflictStatus`

尝试给目标施加异常状态

```javascript
const result = MoveEffects.tryInflictStatus(target, 'par');
// target: Pokemon - 目标
// status: 'par' | 'brn' | 'psn' | 'tox' | 'slp' | 'frz'
// 返回: { success: boolean, message?: string }
```

### `MoveEffects.checkSubstitute`

检查替身是否吸收伤害

```javascript
const result = MoveEffects.checkSubstitute(defender, damage, move);
// 返回: { absorbed: boolean, logs: string[] }
```

### `Pokemon.applyBoost`

修改能力等级

```javascript
pokemon.applyBoost('atk', 2);  // 攻击+2
pokemon.applyBoost('def', -1); // 防御-1
// stat: 'atk' | 'def' | 'spa' | 'spd' | 'spe' | 'accuracy' | 'evasion'
// stages: number (-6 到 +6)
```

### `Pokemon.takeDamage`

造成伤害

```javascript
pokemon.takeDamage(50);
// damage: number - 伤害值
```

### `Pokemon.heal`

回复 HP

```javascript
pokemon.heal(30);
// amount: number - 回复量
```

---

## 4. 完整示例

### 示例 1：吸血招式 (Drain Punch)

```javascript
'Drain Punch': {
    onHit: (attacker, defender, move, damage, logs, battle) => {
        if (damage > 0 && attacker.isAlive()) {
            const healAmount = Math.floor(damage / 2);
            const actualHeal = Math.min(healAmount, attacker.maxHp - attacker.currHp);
            attacker.currHp += actualHeal;
            if (actualHeal > 0) {
                logs.push(`<span style="color:#2ecc71">${attacker.cnName} 吸收了 ${actualHeal} HP！</span>`);
            }
        }
    }
}
```

### 示例 2：固定伤害招式 (Seismic Toss)

```javascript
'Seismic Toss': {
    calcDamage: (attacker, defender, move) => {
        // 伤害 = 使用者等级
        return attacker.level;
    }
}
```

### 示例 3：首回合限定招式 (Fake Out)

```javascript
'Fake Out': {
    onUse: (attacker, defender, logs, battle, isPlayerAttacking) => {
        // 只能在入场首回合使用
        if (attacker.turnCount > 1) {
            logs.push(`但是失败了！`);
            return { failed: true };
        }
    },
    onHit: (attacker, defender, move, damage, logs, battle) => {
        // 100% 畏缩
        if (defender.volatile) {
            defender.volatile.flinch = true;
            logs.push(`${defender.cnName} 畏缩了！`);
        }
    }
}
```

### 示例 4：能力变化招式 (Swords Dance)

```javascript
'Swords Dance': {
    execute: (attacker, defender, move, logs, battle) => {
        if (attacker.applyBoost) {
            attacker.applyBoost('atk', 2);
            logs.push(`${attacker.cnName} 的攻击大幅提升了！`);
        }
        return { damage: 0, effectiveness: 1 };
    }
}
```

### 示例 5：反伤招式 (Counter)

```javascript
'Counter': {
    execute: (attacker, defender, move, logs, battle) => {
        // 检查上回合是否受到物理伤害
        if (attacker.lastDamageTaken && attacker.lastDamageCategory === 'Physical') {
            const counterDamage = attacker.lastDamageTaken * 2;
            defender.takeDamage(counterDamage);
            logs.push(`${attacker.cnName} 反击造成了 ${counterDamage} 伤害！`);
            return { damage: counterDamage, effectiveness: 1 };
        } else {
            logs.push(`但是失败了！`);
            return { damage: 0, effectiveness: 0, failed: true };
        }
    }
}
```

### 示例 6：天气招式 (Sunny Day)

```javascript
'Sunny Day': {
    execute: (attacker, defender, move, logs, battle) => {
        if (battle) {
            battle.weather = 'sunnyday';
            battle.weatherTurns = 5;
            logs.push(`☀️ 阳光变得强烈了！`);
        }
        return { damage: 0, effectiveness: 1 };
    }
}
```

### 示例 7：换人招式 (U-turn)

```javascript
'U-turn': {
    onHit: (attacker, defender, move, damage, logs, battle) => {
        // 标记为 Pivot 招式，触发换人流程
        if (damage > 0) {
            attacker.isPivoting = true;
            logs.push(`${attacker.cnName} 准备返回！`);
        }
    }
}
```

---

## ⚠️ 注意事项

1. **检查对象存在性**: 使用 `pokemon.isAlive()` 检查是否存活
2. **使用 Math.floor()**: 所有伤害/回复计算都要取整
3. **日志格式**: 使用 HTML 标签添加颜色 `<span style="color:#xxx">`
4. **返回值**: `onUse` 返回 `{ failed: true }` 表示失败
5. **能力变化**: 使用 `applyBoost` 而不是直接修改 `boosts`

---

*最后更新: 2026-01-03*
