
---

# 致谢名单 (Credits & Acknowledgments)

本项目 是一个基于 Web 技术的宝可梦对战模拟引擎。本项目的实现离不开开源社区的无私贡献、优秀的资源整理者以及原始版权所有者的创作。

以下是本项目引用的资源列表及致谢。

## 🛠️ 核心数据与引擎机制 / Core Data & Mechanics

本项目的大部分战斗数据、伤害计算公式及基础逻辑高度参考并移植自 **Pokémon Showdown** 项目。

*   **Pokémon Showdown**: [https://pokemonshowdown.com/](https://pokemonshowdown.com/)
    *   **Github**: [smogon/pokemon-showdown](https://github.com/smogon/pokemon-showdown)
    *   引用了 `data/` 目录下的宝可梦种族值 (Pokedex)、招式数据 (Moves)、特性数据 (Abilities) 及道具信息 (Items)。
    *   参考了其伤害计算逻辑 (Damage Calc) 与状态机制处理。

## 📚 百科与知识库 / Encyclopedias & Wikis

除了核心数据外，部分技能描述的校对、隐藏数值验证以及战术逻辑引用了以下专业的宝可梦百科与对战社区。

*   **Smogon Strategy Pokedex**: [smogon.com/dex/](https://www.smogon.com/dex/)
    *   提供了详尽的对战机制解析与战术参考。
*   **神奇宝贝百科 (52poke)**: [wiki.52poke.com](https://wiki.52poke.com/)
    *   提供了最准确的中文技能详解与机制说明，用于汉化与数据对照。

## 🇨🇳 本地化 / Localization

本项目使用的中文技能、特性及描述文本，由 **PSChina (Pokemon Showdown China)** 社区及其贡献者整理制作。

*   **Showdown Translation (Tampermonkey Script)**
    *   **脚本作者 (Author)**: Ceca3
    *   **项目来源**: PSChina Server Translation (剑盾测试先行版)
    *   **贡献**: 核心的“中-英”映射字典（汉化数据库）直接取材于该项目的经过社区长期验证的翻译数据。
    *   特别感谢 PSChina 社区对宝可梦对战中文化做出的卓越贡献。

## 🎨美术资源 / Visual Assets

本项目混合使用了多个优秀的公共美术资源库，致力于提供最佳的视觉体验。

**精灵图与图标 (Sprites & Icons)**
*   **Pokémon Showdown Sprite Library**: [play.pokemonshowdown.com](https://play.pokemonshowdown.com/sprites/)
    *   Gen 1-5 动态像素图 (Animated Sprites) / Gen 6+ 静态模型图。
*   **PkParaiso**: [pkparaiso.com](https://www.pkparaiso.com/)
    *   高质量 3D 模型动态 GIF，用于战斗演出。
*   **PokéSprite**: [github.com/msikma/pokesprite](https://github.com/msikma/pokesprite)
    *   菜单图标 (Box Icons) 和道具图标数据。

**SVG 矢量与 UI 素材 (Vecters & UI Elements)**
本项目 UI 中的图标资源遵循 **CC BY 3.0 (Creative Commons Attribution 3.0)** 协议或开源许可：
*   **Phosphor Icons**: [phosphoricons.com](https://phosphoricons.com/) - 界面交互图标。
*   **The Noun Project**: [thenounproject.com](https://thenounproject.com/) - 界面交互图标。
*   **Pokemon Type SVG Icons**: [github.com/duiker101/pokemon-type-svg-icons](https://github.com/duiker101/pokemon-type-svg-icons)
    *   清晰的属性图标 (Type Icons) 矢量数据。

**UI 设计 (Design Inspiration)**
*   UI 风格混合了 **《宝可梦：剑/盾》** 的扁平化竞技风与 **《女神异闻录5》** 的动态剪切风。
*   古武系统 UI 致敬了 **《宝可梦传说：阿尔宙斯》**。

## 🤖 协作开发与测试 / Development Assistance

作为一个人力有限的项目，本系统的大量代码编写与数据整理得益于次世代 AI 的辅助，以及热心社区玩家的反馈。

*   **Google Gemini 3.0 Pro**:
    *   在大量**数据整理**、文档撰写以及复杂正则表达式处理上提供了卓越的帮助。
*   **Anthropic Claude**:
    *   在项目的 Js/Css **代码逻辑编写**、函数重构与架构设计中发挥了核心作用。
*   **Discord 社区反馈者**:
    *   感谢在 Discord 频道上提交 Bug 反馈（Debug）、协助测试战斗逻辑以及提供宝贵建议的每一位用户。

## 🎵 音效与音乐 / Audio & BGM

*   **宝可梦叫声 (Cries)**: 动态请求自 `play.pokemonshowdown.com/audio/cries/`。
*   **背景音乐 (BGM) & 音效 (SFX)**: 版权归属于 **Nintendo (任天堂)**, **Game Freak** 及原作曲家（一之濑刚, 增田顺一等）。本项目仅做学习与演示用途。

## ⚖️ 免责声明 / Disclaimer

**Pokémon®**, **Pokémon Character Names**, **Nintendo®**, **Game Freak**, and **The Pokémon Company** are trademarks of **Nintendo**.

本项目 是一个非营利性的、开源的粉丝自制项目 (Fan-made Project)。本软件完全免费，不用于任何商业目的。所有与《宝可梦》相关的原文设定、图像、音频文件的版权均归版权方所有，如有侵权请联系删除。

---

*This file was generated to respect and credit the hard work of the community.*