# ERA 变量重构说明

## 修改目标
去掉 ERA 变量中多余的 `pkm` 前缀，减少 token 占用，同时保持插件向后兼容。

## 修改内容

### 1. 默认变量文件修改
**文件**: `ST/开局插入默认变量.txt`

**变更**:
- 去掉外层 `"pkm": { ... }` 包装
- 直接使用 `settings`、`player`、`world_state` 作为顶层键

**新格式示例**:
```json
{
  "settings": { ... },
  "player": { ... },
  "world_state": { ... }
}
```

### 2. 插件兼容层实现
**文件**: `ST/pkm-tavern-plugin.js`

#### 新增兼容层函数

**`isNewFormat(eraVars)`**
- 检测 ERA 变量是否使用新格式（无 pkm 前缀）
- 返回 `true` 表示新格式，`false` 表示旧格式

**`getCompatPath(eraVars, path)`**
- 自动转换路径以适配当前格式
- 新格式下：`'pkm.player.party'` → `'player.party'`
- 旧格式下：`'player.party'` → `'pkm.player.party'`

**`getEraValue(eraVars, path, defaultValue)`**
- 兼容版 `_.get`，自动适配新旧格式
- 先尝试原始路径，再尝试兼容路径
- 确保无论使用哪种格式都能正确获取数据

**`convertUpdatePaths(eraVars, data)`**
- 转换更新数据的路径为当前格式
- 在 `updateEraVars` 中自动调用

### 3. 代码修改统计

#### 已更新的函数和位置

**核心函数**:
- `updateEraVars` - 添加路径转换逻辑
- `getPlayerParty` - 使用 `getEraValue`
- `setPlayerParty` - 使用 `getEraValue` 和新路径格式
- `addToReserve` - 使用 `getEraValue` 和新路径格式
- `setPlayerName` - 使用 `getEraValue` 和新路径格式

**时间系统**:
- `processTimeAdvance` - 全部路径更新为新格式
- `handleTimeInject` - 全部路径更新为新格式
- `getTime` (API) - 使用 `getEraValue`
- `setTime` (API) - 路径更新为新格式
- `advanceTime` (API) - 使用 `getEraValue` 和新路径格式

**NPC 系统**:
- `processNpcLoveUp` - 使用 `getEraValue`
- `handleDynamicNpcInject` - 使用 `getEraValue`

**拦截器**:
- `preprocessEraUpdate` - 兼容新旧路径格式检查

### 4. 路径对照表

| 旧格式路径 | 新格式路径 |
|-----------|-----------|
| `pkm.settings` | `settings` |
| `pkm.player` | `player` |
| `pkm.player.party` | `player.party` |
| `pkm.player.party.slot1` | `player.party.slot1` |
| `pkm.player.trainerProficiency` | `player.trainerProficiency` |
| `pkm.player.proficiency_up` | `player.proficiency_up` |
| `pkm.player.bonds` | `player.bonds` |
| `pkm.player.unlocks` | `player.unlocks` |
| `pkm.world_state` | `world_state` |
| `pkm.world_state.npcs` | `world_state.npcs` |
| `pkm.world_state.location` | `world_state.location` |
| `pkm.world_state.time` | `world_state.time` |
| `pkm.world_state.time.day` | `world_state.time.day` |
| `pkm.world_state.time.period` | `world_state.time.period` |

### 5. 兼容性保证

插件现在支持以下三种使用方式：

1. **纯新格式**: ERA 变量使用新格式（无 pkm 前缀），代码使用新路径
2. **纯旧格式**: ERA 变量使用旧格式（有 pkm 前缀），代码使用旧路径
3. **混合模式**: 代码可以使用任意格式的路径，兼容层自动适配

### 6. 使用建议

**新项目**:
- 使用 `ST/开局插入默认变量.txt` 初始化（新格式）
- 代码中直接使用新路径（如 `'player.party'`）

**旧项目迁移**:
- 无需修改 ERA 变量，插件自动兼容
- 可选：使用 VariableEdit 逐步迁移到新格式

**API 调用**:
```javascript
// 获取玩家数据（自动兼容）
const player = await PKMPlugin.getPlayerParty();

// 获取时间状态（自动兼容）
const time = await PKMPlugin.getTime();

// 推进时间（自动兼容）
await PKMPlugin.advanceTime('3days_morning');
```

### 7. Token 节省估算

每个变量路径节省 4 个字符（`pkm.`）：
- 平均每条消息涉及 10-20 个变量访问
- 每条消息节省约 40-80 个字符
- 长对话中累计节省可达数百 tokens

## 测试建议

1. **新格式测试**: 使用新的默认变量文件开始新对话
2. **旧格式测试**: 使用旧的 ERA 变量继续现有对话
3. **功能测试**: 验证战斗、NPC、时间系统等功能正常
4. **变量编辑测试**: 验证 AI 的 VariableEdit 功能正常

## 注意事项

- 兼容层会自动检测格式，无需手动配置
- 所有日志输出已更新，便于调试
- 建议新项目统一使用新格式以获得最佳性能
