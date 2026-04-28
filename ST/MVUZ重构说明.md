# PKM ERA 脚本转 MVUZ 重构说明

## 范围

本说明只针对根目录 `ST/ERA参考脚本/` 下的两个当前 ERA 版本脚本：

- `pkm-tavern-plugin.js`
- `tavern-inject.js`

不讨论 `apps/battle-sim/ST/` 旧包，也不把 PKM 业务写进通用 `st-bridge`。

## 当前 ERA 版本职责

### `pkm-tavern-plugin.js`

这是业务主插件，当前职责混在一个大脚本里：

- 读取 ERA：`era:getCurrentVars` / `era:queryResult`
- 写入 ERA：`era:updateByObject` / `era:insertByObject`
- 拦截 ERA 写入：包裹 `window.eventEmit`
- 生成前注入：`GENERATION_AFTER_COMMANDS`
- AI 战斗标签解析：`<PKM_BATTLE>` -> `<PKM_FRONTEND>`
- 队伍/备用库 API：`getPlayerParty()` / `setPlayerParty()`
- 时间系统：`day_advance` / `period_set` -> `world_state.time`
- NPC 好感：`love_up` -> `love/stage/bonds`
- 动态 NPC 注入
- 解锁事件注入
- 旧增量结算：`proficiency_up` / `stats_meta.ev_up`

这部分转 MVUZ 后，应当拆成：

1. `schema + normalize/transform`
2. `migration.fromEra`
3. `prompt providers`
4. `artifact processors`
5. `public API`

### `tavern-inject.js`

这是 Dashboard 宿主脚本，当前职责包括：

- 创建悬浮球、overlay、iframe
- 读取 ERA 后推给 iframe：`PKM_ERA_DATA` / `PKM_REFRESH`
- 接收 Dashboard 消息：
  - `PKM_SET_LEADER`
  - `PKM_UPDATE_SETTINGS`
  - `PKM_INJECT_LOCATION`
  - `PKM_CLEAR_INJECTION`
  - `PKM_MAP_FULLSCREEN`
- 把 UI action 转成 `<VariableEdit>` 并追加到最后消息
- 同时直接触发 `era:updateByObject`
- 检测 `transfer_buffer`，自动塞进 box
- 地图位置上下文注入
- 每日刷新：宝可梦刷新、天气刷新、异变状态

这部分转 MVUZ 后，应当变成：

1. iframe host
2. Dashboard message adapter
3. action dispatch
4. prompt injection bridge
5. map/weather/spawn runtime service

不再拼 `<VariableEdit>`，也不直接写 ERA。

## MVUZ 目标状态

推荐把新状态集中在 message 变量的 `stat_data.pkm`：

```json
{
  "pkm": {
    "meta": {
      "schemaVersion": 1,
      "product": "main",
      "contentVersion": "0.1.0",
      "createdAt": "",
      "updatedAt": ""
    },
    "player": {
      "name": "{{user}}",
      "trainerProficiency": 0,
      "unlocks": {},
      "bonds": {}
    },
    "party": {
      "slots": [],
      "transferBuffer": null
    },
    "box": {
      "boxes": [
        {
          "id": "box_01",
          "name": "Box 1",
          "slots": []
        }
      ],
      "indexes": {}
    },
    "world": {
      "location": {},
      "time": {},
      "weatherGrid": {},
      "pokemonSpawns": {},
      "phenomenon": {}
    },
    "npcs": {
      "records": {}
    },
    "battle": {
      "lastConfig": null,
      "lastResult": null,
      "pendingNarrative": null
    },
    "settings": {},
    "runtime": {
      "migration": {},
      "caches": {},
      "flags": {}
    }
  }
}
```

## ERA -> MVUZ 字段映射

| ERA 路径 | MVUZ 路径 |
|---|---|
| `player.name` | `pkm.player.name` |
| `player.trainerProficiency` | `pkm.player.trainerProficiency` |
| `player.proficiency_up` | schema transform 累加到 `pkm.player.trainerProficiency` 后清零 |
| `player.unlocks` | `pkm.player.unlocks` |
| `player.bonds` | `pkm.player.bonds` |
| `player.party.slot1..slot6` | `pkm.party.slots[0..5]` |
| `player.party.transfer_buffer` | `pkm.party.transferBuffer` |
| `player.box.storage_XX` | `pkm.box.boxes[].slots[]`，并建立 `pkm.box.indexes` |
| `world_state.location` | `pkm.world.location` |
| `world_state.time` | `pkm.world.time` |
| `world_state.time.day_advance` | schema/plugin transform 结算到 `pkm.world.time.day/period` 后清空 |
| `world_state.time.period_set` | schema/plugin transform 结算到 `pkm.world.time.period` 后清空 |
| `world_state.phenomenon` | `pkm.world.phenomenon` |
| `world_state.weather_grid` / 旧天气缓存 | `pkm.world.weatherGrid` |
| `world_state.pokemon_spawns` / 旧刷新缓存 | `pkm.world.pokemonSpawns` |
| `world_state.npcs` | `pkm.npcs.records` |
| `settings` | `pkm.settings` |

## MVUZ 中应该由 schema transform 处理的内容

这些不应该再通过 `eventEmit` 拦截器处理：

- `player.proficiency_up`
  - 读取当前 `trainerProficiency`
  - 累加
  - clamp 到 `0..255`
  - 清零 `proficiency_up`

- `pokemon.stats_meta.ev_up`
  - 累加到 `stats_meta.ev_level`
  - 清零 `ev_up`
  - 阻止负值或非法值

- `friendship.av_up`
  - 累加到 `friendship.avs`
  - clamp 到 `0..255`
  - 清零 `av_up`

- `npcs.records.*.love_up`
  - 累加到 `love`
  - 根据阈值推进 `stage`
  - 清零 `love_up`

- `world.time.day_advance`
  - 解析自然语言推进
  - 更新 `day/period/derived`
  - 清空 `day_advance`

- `world.time.period_set`
  - 校验时段
  - 更新 `period`
  - 清空 `period_set`

- `party.slots`
  - 最多 6 个
  - 保证只有一个 `isLead === true`
  - 空槽位正规化为 `null`

- `party.transferBuffer`
  - 空值正规化为 `null`
  - 不再使用旧 `slot: 7` 空对象作为空态

## MVUZ 中应该留在插件事件层的内容

这些不是 schema 职责：

- 生成前注入 Prompt
- AI 回复标签解析
- 把 `<PKM_BATTLE>` 合成为 `<PKM_FRONTEND>`
- 根据时间推进触发每日刷新事件
- 根据当前地图计算周边上下文
- 根据地形/天气/异变生成刷新缓存
- iframe 创建与销毁
- Dashboard action 分发
- 防重复处理消息

## 两个脚本的重构目标形态

### 新 `pkm-mvuz-schema.js`

替代当前 ERA 拦截器和散落的补全逻辑。

职责：

- 定义 `PkmMvuzSchema`
- `makeDefaultPkmState(product)`
- `normalizePokemon`
- `normalizeParty`
- `normalizeBox`
- `normalizeTime`
- `normalizeNpcRecords`
- `migrateFromEra(eraVars, product)`
- 注册 MVUZ schema：`registerMvuSchema(...)`

它不创建 iframe，不注入 Prompt，不监听消息。

### 新 `pkm-mvuz-plugin.js`

替代 `pkm-tavern-plugin.js` 的事件和业务流程。

职责：

- `loadState()` / `saveState()` / `patchState()`
- 首次检测旧 ERA 时执行 `migrateFromEra`
- `GENERATION_AFTER_COMMANDS`：
  - 运行状态 normalize
  - 注入 party/time/npc/map/battle prompt
- `MESSAGE_UPDATED` 或 `CHARACTER_MESSAGE_RENDERED`：
  - 解析 `<PKM_BATTLE>`
  - 生成 `<PKM_FRONTEND>`
- 暴露 `window.PKMPlugin`
- 保留测试 API：`getPlayerParty` / `setPlayerParty` / `triggerBattle` / `getTime`

它不负责 Dashboard DOM。

### 新 `pkm-mvuz-dashboard-host.js`

替代 `tavern-inject.js`。

职责：

- 创建悬浮球和 iframe
- 初始状态推送：`PKM_STATE_PUSH`
- 刷新状态推送：`PKM_STATE_PUSH`
- 接收 Dashboard action：
  - `party.setLead`
  - `party.updateMove`
  - `settings.update`
  - `box.depositTransferBuffer`
  - `map.injectLocation`
  - `map.clearLocation`
  - `map.fullscreen`
- 调用 `window.PKMPlugin.patchState()` 或 `window.PKMPlugin.dispatchAction()`
- 不再追加 `<VariableEdit>`
- 不再直接调用 `era:updateByObject`

## 旧消息协议到新 action 协议

| 旧消息 | 新消息 |
|---|---|
| `PKM_ERA_DATA` | `PKM_STATE_PUSH` |
| `PKM_REFRESH` | `PKM_STATE_PUSH` |
| `PKM_SET_LEADER` | `PKM_ACTION { action: "party.setLead" }` |
| `PKM_UPDATE_SETTINGS` | `PKM_ACTION { action: "settings.update" }` |
| `PKM_UPDATE_MOVES` | `PKM_ACTION { action: "party.updateMove" }` |
| `PKM_INJECT_LOCATION` | `PKM_ACTION { action: "prompt.injectLocation" }` |
| `PKM_CLEAR_INJECTION` | `PKM_ACTION { action: "prompt.clearInjection" }` |
| `PKM_MAP_FULLSCREEN` | host 本地 UI action，不写状态 |

## 迁移顺序

1. 新建 `pkm-mvuz-schema.js`
   - 只实现默认状态、normalize、ERA -> MVUZ migration
   - 用静态样本测试，不接入 ST

2. 新建 `pkm-mvuz-plugin.js`
   - 用 `getVariables({ type: "message" }).stat_data.pkm`
   - 如果没有 MVUZ 状态但有 ERA 状态，执行 migration
   - 暴露 `window.PKMPlugin`

3. 新建 `pkm-mvuz-dashboard-host.js`
   - 复用旧悬浮球 UI
   - 改为 action dispatch
   - 先兼容旧 Dashboard 消息，再逐步改 Dashboard 前端

4. 保留旧 ERA 脚本一段时间
   - 不直接覆盖
   - 新脚本使用不同全局键，避免互相污染

5. Dashboard 前端改协议
   - 先兼容旧 `PKM_ERA_DATA`
   - 后改为 `PKM_STATE_PUSH`

## 当前最大风险

- `pkm-tavern-plugin.js` 同时承担 schema、业务、事件、Prompt、战斗标签解析，不能整体平移。
- `tavern-inject.js` 直接修改消息并触发 ERA，MVUZ 后必须改成状态 patch。
- 旧 Dashboard 当前期待 ERA 结构，MVUZ 状态需要提供兼容 snapshot，或者 Dashboard 同步改。
- Main 与 Universal 的差异不能进 schema core，应放 product profile。

## 第一阶段最小可用目标

先只迁移这 4 个动作：

- `settings.update`
- `party.setLead`
- `party.updateMove`
- `box.depositTransferBuffer`

这四个动作完成后，Dashboard 可以不再生成 `<VariableEdit>`，而是通过 MVUZ 状态 patch 工作。

