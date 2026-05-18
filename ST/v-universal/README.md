# MVUZ 通用版本

这是 SillyTavern 侧使用的 PKM Universal MVUZ 文本资料包。实际部署脚本以 `apps/st-bridge/packs/pkm-universal` 为准，这里只保留初始化变量、规则提示词和历史备份。

## 目录

```text
ST/v-universal/
  init/
    initvar.txt
  rules/
    变量规则.txt
    战斗规则.txt
  prompts/
    planning.txt
  archive/
    pkm-tavern-plugin.mvuz.js.backup-20260519-013440
    旧重构说明.md
```

## 用途

- `init/initvar.txt`: 初始 `stat_data.pkm` 变量模板。
- `rules/变量规则.txt`: MVU JSONPatch 写入规则和允许路径。
- `rules/战斗规则.txt`: `<PKM_BATTLE>` 输出协议和战斗数据结构。
- `prompts/planning.txt`: 生成前的战斗判定和叙事规划提示。
- `archive/`: 历史脚本备份，只用于查阅和回滚参考，不作为当前加载入口。

## 当前入口

本地和线上加载入口都走：

```text
apps/st-bridge/bridge.js
apps/st-bridge/packs/pkm-universal/
```

不要从 `archive/` 里的备份脚本恢复旧直写变量逻辑。
