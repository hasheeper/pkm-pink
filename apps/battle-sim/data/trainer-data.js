/* 
 * 角色: 小优 (Gloria)
 * 身份: 伽勒尔冠军 / 咖喱大师
 */
const GLORIA_DATA = {
    // 【Tier 4 - 极巨化全开·冠军模式】
    4: {
        "trainerProficiency": 255,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true, // Galar 核心机制
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },
        "party": [
            {
                "name": "Zacian-Crowned", 
                "lv": 99, 
                "gender": "N", 
                // 苍响本身无法极巨化，所以不设置 mechanic
                "nature": "Adamant", 
                "ability": "Intrepid Sword", 
                "item": "Rusted Sword", 
                "isAce": true, 
                "stats_meta": {
                    "is_perfect": true, // 假设引擎支持或保留 ivs 写法
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 },
                    "ev_level": 252
                },
                "moves": [
                    "Behemoth Blade", // 巨兽斩：针对极巨化双倍伤害
                    "Play Rough",     // 嬉闹：以本系输出覆盖龙/格斗
                    "Close Combat",   // 近身战：钢铁/普通打击面
                    "Swords Dance"    // 剑舞：一旦让它强化一次，就是推队节奏
                ],
                // 王牌满配情感值：不仅有输出(Passion)还有无敌的回避(Insight)与耐性(Trust)
                "friendship": { "trust": 255, "passion": 255, "insight": 200, "devotion": 150 }
            },
            {
                "name": "Cinderace", 
                "lv": 97, 
                "gender": "M",
                "nature": "Jolly", 
                "ability": "Libero", // 自由者：变换属性，极其灵活
                "item": "Life Orb", 
                // 核心极巨位
                "mechanic": "dynamax", 
                "mega_target": "cinderacegmax", // 确保通过 autoDetect 拿到 G-Max 形态
                "stats_meta": { "ev_level": 252 },
                "moves": [
                    "Pyro Ball",    // 极巨后变成 G-Max Fireball (160威力+破格)
                    "Bounce",       // 极巨后变成 Max Airstream (全队提速，核心推队技)
                    "High Jump Kick", // 变成 Max Knuckle (全队加攻)
                    "Court Change"    // 换场：虽然是变化技，但在普通状态下可反去玩家的墙/钉
                ],
                "avs": { "trust": 150, "passion": 230 }
            },
            {
                "name": "Rillaboom", 
                "lv": 95, 
                "gender": "M",
                "nature": "Adamant",
                "ability": "Grassy Surge", 
                "item": "Grassy Seed", // 上场防物防+1
                "mechanic": "dynamax",
                "mega_target": "rillaboomgmax", // 即使不是ACE，如果作为最后一只上场也能G-Max
                "stats_meta": { "ev_level": 252 },
                "moves": [
                    "Grassy Glide", // 青草滑梯：场地下先制
                    "Drum Beating", // 控速
                    "High Horsepower", // 补盲打火/电
                    "U-turn"         // 灵活轮转
                ]
            },
            {
                "name": "Urshifu-Rapid-Strike", 
                "lv": 94, 
                "gender": "M",
                "nature": "Jolly", // 加速度
                "ability": "Unseen Fist", 
                "item": "Focus Sash", // 气腰防止被玩家的 Flying 招式确一，保证输出
                "mechanic": "dynamax",
                "mega_target": "urshifurapidstrikegmax",
                "stats_meta": { "ev_level": 252 },
                "moves": [
                    "Surging Strikes", // 必暴击
                    "Close Combat", 
                    "Ice Punch",      // 冰拳：针对处理不了的飞行/草/龙系
                    "Aqua Jet"        // 先制收割
                ]
            },
            {
                "name": "Corviknight", 
                "lv": 94, 
                "gender": "M",
                "nature": "Impish", // 加物防，减特攻
                "ability": "Mirror Armor", 
                "item": "Leftovers", 
                "mechanic": "dynamax",
                "mega_target": "corviknightgmax",
                "stats_meta": { "ev_level": 252 },
                "moves": [
                    "Brave Bird",
                    "Body Press",   // 扑击：配合铁壁伤害极高
                    "Iron Defense", // 铁壁：强化防御
                    "Roost"         // 羽栖：续航
                ],
                // 高信赖 = 哪怕血量危险也有概率为了不让训练家担心而锁血
                "avs": { "trust": 220, "devotion": 200 }
            },
            {
                "name": "Skwovet",
                "lv": 99, 
                "gender": "F",
                "nature": "Relaxed", // 加防，减速
                "ability": "Cheek Pouch", // 颊囊：吃果子额外回血 1/3 HP
                "item": "Sitrus Berry",   // 文柚果：HP<50% 回复 1/4 -> 配合特性一口奶满
                "mechanic": "dynamax",     // 甚至可以让这只松鼠极巨化增加血量上限
                "stats_meta": { "ev_level": 252 },
                "moves": [
                    "Super Fang",    // 愤怒门牙：无视防御扣除一半血量
                    "Stuff Cheeks",  // 狂吞：防御+2 并吃掉果子 (主动触发回复)
                    "Body Slam",     // 泰山压顶：麻痹对手
                    "Stockpile"      // 蓄力：增加双防，变得极硬
                ],
                // 全满 AVs 参数，极其难以击杀 (高闪避、高锁血概率)
                "avs": { "trust": 255, "insight": 255, "devotion": 255, "passion": 255 } 
            }
        ]
    }
};
/* 
 * 角色: 小照 (Akari)
 * 身份: 银河队调查组 / 神阖之笛的继承者
 * 特色: 洗翠地区全明星 + 古武流派 (Styles) 战术大师
 */
const AKARI_DATA = {
    // 【Tier 4 - 神阖之笛的继承者】(Lv.95 ~ 99)
    4: {
        "trainerProficiency": 255, // 熟练度拉满：高频触发对冲(Clash)与战术指挥
        "unlocks": {
            "enable_bond": false,
            "enable_styles": true,       // 核心特色：频繁切换 刚猛/迅疾
            "enable_insight": true,      // 见其实：调查员拥有看穿招式的直觉
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },
        "party": [
            {
                // [撒前场钉的先锋]
                "name": "Kleavor", 
                "lv": 97,
                "gender": "M",
                "nature": "Jolly",      // 爽朗 (+速度 -特攻)
                "ability": "Sharpness", // 锋锐
                "item": "Focus Sash",   // 气势披带
                "isLead": true,         
                "stats_meta": { 
                    "ev_level": 252,    // 满努力
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                // 战术: 迅疾岩斧 => 必出钉子 + 蹭血
                "moves": ["Stone Axe", "X-Scissor", "Close Combat", "Accelerock"],
                "friendship": { "insight": 200 } // 高闪避
            },
            {
                // [特盾/流转核心]
                "name": "Goodra-Hisui", 
                "lv": 96,
                "gender": "F",
                "nature": "Calm",       // 沉着 (+特防 -攻击)
                "ability": "Gooey",     // 黏滑 (接触降速)
                "item": "Assault Vest", // 突击背心 (特防 x1.5)
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V (龙尾需要物攻IV)
                },
                "moves": ["Draco Meteor", "Flash Cannon", "Flamethrower", "Dragon Tail"],
                "friendship": { "trust": 255, "devotion": 200 } // 高耐受 + 自动回血
            },
            {
                // [高速异常手] 
                "name": "Sneasler", 
                "lv": 95,
                "gender": "F",
                "nature": "Jolly",      // 爽朗 (+速度 -特攻)
                "ability": "Poison Touch", // 毒手 (接触30%中毒)
                "item": "Life Orb",     // 生命宝珠
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                "moves": ["Dire Claw", "Close Combat", "Shadow Claw", "Fake Out"], 
                "friendship": { "passion": 230 } // 高暴击率
            },
            {
                // [幻觉干扰/特攻手] 
                "name": "Zoroark-Hisui",
                "lv": 95,
                "nature": "Timid",      // 胆小 (+速度 -攻击)
                "ability": "Illusion",  // 幻觉
                "item": "Wise Glasses", // 博识眼镜
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 0攻IV (防欺诈/防混乱自伤)
                },
                "moves": ["Shadow Ball", "Hyper Voice", "Sludge Bomb", "Nasty Plot"]
            },
            {
                // [物理核弹 / 空间打手]
                "name": "Ursaluna",
                "lv": 98,
                "nature": "Brave",      // 勇敢 (+攻击 -速度)
                "ability": "Guts",      // 毅力
                "item": "Flame Orb",    // 火焰宝珠
                "stats_meta": { 
                    "ev_level": 252,
                    // 速度31或0都可以。31是为了在常规环境不至于太慢，
                    // 若想完美适配空间队或刚猛后手爆发，可改为 spe: 0
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } 
                },
                "moves": ["Facade", "Headlong Rush", "Earthquake", "Fire Punch"],
                "friendship": { "trust": 200, "passion": 255 }
            },
            {
                // [王牌 - 无双剑豪]
                "name": "Samurott-Hisui", 
                "lv": 99,
                "gender": "F",
                "nature": "Adamant",    // 固执 (+攻击 -特攻)
                "ability": "Sharpness", // 锋锐
                "item": "Scope Lens",   // 焦点镜 (配合Passon打暴击流)
                "isAce": true,
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                // 迅疾·千重浪 = 极速铺毒菱/撒菱？ (代码库目前支持撒菱)
                "moves": ["Ceaseless Edge", "Razor Shell", "Sacred Sword", "Aqua Jet"],
                // 面板怪：满信赖(硬撑)、满激情(刀刀烈火)、满灵犀(闪避)
                "friendship": { "trust": 255, "passion": 255, "insight": 255, "devotion": 200 }
            }
        ]
    }
};


/* 
 * 角色: 鸣依 (Rosa)
 * 身份: 合众英雄 / 宝可梦好莱坞偶像
 * 核心机制: 羁绊共鸣 (全员 ACE 将)
 */
const ROSA_DATA = {
    // 【Tier 4 - 合众的奇迹·全员主角】
    4: {
        "trainerProficiency": 240,
        // ==============================================================
        // [Tier Specific Unlocks: Unova's Peak]
        // ==============================================================
        "unlocks": {
            "enable_bond": true,         // ✅ 灵魂共鸣已开启
            "enable_styles": false,
            "enable_insight": true,      // ✅ 洞察力开启：修正大蛇瞪眼、暴风雪、活力信使鸟的命中
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [御三家·草 | 只有我能逆流而上]
                "name": "Serperior", // 君主蛇
                "lv": 99,
                "gender": "F",
                "nature": "Timid", // 胆小 (+速)
                "ability": "Contrary", 
                "item": "Leftovers", 
                
                "stats_meta": { 
                    "ev_level": 252, // 统一觉醒 EV
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                
                "moves": ["Leaf Storm", "Dragon Pulse", "Glare", "Substitute"],
                
                "isAce": true, 
                // Devotion 极高：配合 Substitute + Leftovers 形成恐怖的回血循环
                "friendship": { "trust": 150, "passion": 150, "insight": 150, "devotion": 255 }
            },
            {
                // [御三家·火 | 舍身战车]
                "name": "Emboar", // 炎武王
                "lv": 96,
                "gender": "M",
                "nature": "Brave", // 勇敢 (+攻 -速)：放弃速度拼耐久和超高爆发
                "ability": "Reckless", // 舍身：反作用力招式威力提升
                "item": "Choice Band", // 专爱头带：攻击力 x1.5
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V撑满HP吃反伤
                },
                
                // Head Smash (150岩) + Flare Blitz (120火) + Wild Charge (90电) + Superpower (120斗)
                // 打击面无死角，只要打中人，要么对面死，要么反伤把自己弹死
                "moves": ["Flare Blitz", "Superpower", "Wild Charge", "Head Smash"],
                
                "isAce": true,
                "friendship": { "trust": 100, "passion": 255, "insight": 100, "devotion": 120 }
            },
            {
                // [御三家·水 | 锐利剑客]
                "name": "Samurott", // 大剑鬼
                "lv": 96,
                "gender": "M",
                "nature": "Adamant", // 固执
                "ability": "Shell Armor", // 硬壳盔甲：不会被CT爆死，稳
                "item": "Life Orb", // 命玉：增强先制技能斩杀线
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V双刀面板充实
                },
                
                // 修正：将 Liquidation 换回经典 Megahorn 覆盖草系，加入 Sacred Sword (如果有) 或 Knock Off
                // 这里用 Knock Off 对抗道具流
                "moves": ["Liquidation", "Aqua Jet", "Knock Off", "Megahorn"],
                
                "isAce": true,
                "friendship": { "trust": 200, "passion": 150, "insight": 150, "devotion": 100 }
            },
            {
                // [暴力法师]
                "name": "Simisear", // 爆香猿
                "lv": 93, 
                "gender": "M",
                "nature": "Timid",
                "ability": "Blaze", // 猛火：残血爆发
                "item": "Focus Sash", // 气腰：为了稳定强化以此 Nasty Plot
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } 
                },
                
                "moves": ["Fire Blast", "Grass Knot", "Nasty Plot", "Focus Blast"],
                
                "isAce": false,
                "friendship": { "trust": 100, "passion": 200 }
            },
            {
                // [广域高速控场]
                "name": "Simipour", // 冷水猿
                "lv": 93, 
                "gender": "M",
                "nature": "Timid",
                "ability": "Torrent", 
                "item": "Expert Belt", // 达人带，因为技能属性丰富
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                
                "moves": ["Hydro Pump", "Ice Beam", "Scald", "Taunt"],
                
                "isAce": false,
                "friendship": { "trust": 100, "passion": 100, "insight": 150 }
            },
            {
                // [合众好莱坞影星 | 必中强攻]
                "name": "Delibird", // 信使鸟
                "lv": 92, // 拉平等级
                "gender": "F",
                "nature": "Jolly", // 极速
                "ability": "Hustle", // 【活力】：物理威力 x1.5，命中 x0.8
                "item": "Focus Sash", // 绑带同命流
                
                // 必须全部拉满31，本身种族值低，但这只有点HP/Def可能有奇迹生还
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                
                // 战术核心：Destiny Bond(同命) + Ice Shard(先制)。
                // Sky Attack(神鸟猛击) 如果带强力香草最好，这里用 Brave Bird 替代稳定输出
                "moves": ["Ice Shard", "Destiny Bond", "Brave Bird", "Drill Run"],
                
                "isAce": false,
                // Insight 255 是关键：修正 Hustle 特性掉的 20% 命中，实现此怪 "招招烈火" 的强度
                "friendship": { "trust": 80, "passion": 200, "insight": 255, "devotion": 50 }
            }
        ]
    }
};


/* 
 * 角色: 莎莉娜 (Serena)
 * 身份: 卡洛斯英雄 / 舞台上的女王
 * 核心机制: Mega 进化 (Absolite)
 */
const SERENA_DATA = {
    // 【Tier 4 - 华丽与力量的终极舞台】
    4: {
        "trainerProficiency": 235,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": true,         // ✅ 唯一的钥匙：开启 Mega 进化按钮
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [Mega 手/特攻手]
                // 注意：名字改回基础形态 "Absol"，装备 Mega 石，加上 mechanic:'mega'
                "name": "Absol", 
                "lv": 99,
                "gender": "F",
                "nature": "Jolly", // 爽朗 (Mega后115速度 + 魔法镜反弹，非常极端的破受配置)
                "ability": "Justified", // 进化前特性：正义之心 (防恶系联防)
                "item": "Absolite",     // 关键道具：阿勃梭鲁进化石
                
                // === 触发器 ===
                "mechanic": "mega",     // 告诉 AI 和 UI：这也是 Mega 进化的执行者
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 魔法镜特性下，可以放心强化；突袭收割
                "moves": ["Sucker Punch", "Play Rough", "Knock Off", "Swords Dance"]
            },
            {
                "name": "Delphox",
                "lv": 99,
                "gender": "F",
                "nature": "Timid", // 胆小
                "ability": "Blaze", // 猛火 (配合高 Trust 的锁血，残血猛火更适合此时的场景)
                // 或者用 "Magician" 也可以，但猛火作为 Ace 的翻盘能力更强
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "isAce": true, 
                // 表演家的热情(Passion) 和 羁绊(Trust) 极高
                "friendship": { "trust": 150, "passion": 255, "insight": 120, "devotion": 100 },
                
                "moves": ["Fire Blast", "Psychic", "Dazzling Gleam", "Calm Mind"]
            },
            {
                // [高速刺客]
                "name": "Greninja",
                "lv": 93,
                "gender": "M",
                "nature": "Naive", // 天真
                "ability": "Protean", // 变幻自如 (卡洛斯的代表性神特性)
                "item": "Choice Scarf", // 围巾 (速度线控制)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Ice Beam", "Dark Pulse", "Gunk Shot", "U-turn"]
            },
            {
                // [神兽位 / 物理核心]
                "name": "Zygarde",
                "lv": 95,
                "gender": "N",
                "nature": "Adamant", // 固执
                // Power Construct (群聚变形) 是被动触发 (HP<50%)，不需 'mechanic' 控制
                "ability": "Power Construct", 
                "item": "Leftovers", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Thousand Arrows", "Dragon Dance", "Substitute", "Extreme Speed"] 
            },
            {
                // [特攻爆破] 妖精女王
                "name": "Sylveon", 
                "lv": 88, // 稍微拉高等级
                "gender": "F",
                "nature": "Modest",
                "ability": "Pixilate", // 妖精皮肤
                "item": "Choice Specs", // 眼镜高音，简单粗暴
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Hyper Voice", "Psyshock", "Shadow Ball", "Quick Attack"] 
            },
            {
                // [水盾] 对应原来的 Vaporeon，但等级修复
                "name": "Vaporeon",
                "lv": 85, // 修正了原本 Lv.31 的问题
                "gender": "F",
                "nature": "Bold", 
                "ability": "Water Absorb",
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Scald", "Wish", "Protect", "Toxic"] // 用 wish 奶队友
            }
        ]
    }
};

/* 
 * 角色: 小遥 (May)
 * 身份: 丰缘顶级协调家 / 特区美食探险队队长
 * 核心机制: Mega 进化 (Blazikenite) + 接力起飞 + 暴力美学
 * 特色: 小巧的身体里蕴含着恐怖的破坏力 (Hoenn Powerhouse)
 */
const MAY_DATA = {
    // 【Tier 4 - 丰缘之风·元气全开】
    4: {
        "trainerProficiency": 230,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": true,         // ✅ 羁绊：和火焰鸡的默契
            "enable_styles": false,
            "enable_insight": true,      // ✅ 协调家的洞察力 (用于抓破绽)
            "enable_mega": true,         // ✅ 核心：Mega 进化
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [绝对王牌 / 接力推土机]
                "name": "Blaziken", // 火焰鸡
                "lv": 99,
                "gender": "F",      // 小遥的火焰鸡设定偏雌性（虽然游戏里是7:1）
                "nature": "Adamant", // 固执：输出最大化，速度交给加速特性
                "ability": "Speed Boost", // 加速：每回合速度+1，真正的滚雪球神器
                
                // === 机制核心 ===
                "item": "Blazikenite",
                "mechanic": "mega",
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } 
                },
                
                "isAce": true, 
                // 关于 Passion (热情) 和 Trust (信赖) 极高
                "friendship": { "trust": 255, "passion": 255, "insight": 150, "devotion": 120 },
                
                // 战术: Protect (守住) 蹭一回合加速 -> Swords Dance (如果贪到就结束游戏) -> Flare Blitz 轰炸
                // 典型的 "只要让我动一次你就输了"
                "moves": ["Protect", "Flare Blitz", "Close Combat", "Stone Edge"] 
                // 替补技能: Swords Dance / Baton Pass (接棒给巨沼怪?)
            },
            {
                // [沼泽守护者 / 联防核心]
                "name": "Swampert", // 巨沼怪
                "lv": 96,
                "gender": "M",
                "nature": "Relaxed", // 悠闲 (+防 -速)
                "ability": "Damp",   // 湿气 (也许是因为她想搞研究抓宠，不想让对面爆炸)
                "item": "Leftovers", // 剩饭
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: 反手 Flip Turn (快速折返) 调度
                "moves": ["Flip Turn", "Earthquake", "Scald", "Stealth Rock"] 
            },
            {
                // [蘑菇捕获手 / 异常状态]
                "name": "Breloom", // 斗笠菇 (实地调查必带)
                "lv": 95,
                "gender": "M",
                "nature": "Jolly", 
                "ability": "Technician", // 技术高手
                "item": "Focus Sash",    // 气腰 (必睡一人)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 哪怕是在Lv.95的环境，必中的 Spore 依然是噩梦
                // Mach Punch 先制技收残血
                "moves": ["Spore", "Bullet Seed", "Mach Punch", "Rock Tomb"] 
            },
            {
                // [真正的“饭桶” / 辉石战神]
                // 对应她“吃货”的设定，小卡比兽比卡比兽更能吃（进化辉石）
                "name": "Munchlax", // 小卡比兽
                "lv": 99, // 甚至比其他队员等级都高，因为吃得多
                "gender": "M",
                "nature": "Adamant",
                "ability": "Thick Fat", // 厚脂肪 (冰火抗性)
                "item": "Eviolite",     // 进化奇石：Def/SpD x1.5 -> 硬度非常离谱
                
                "stats_meta": { 
                    // 特意拉满耐久的分配
                    "ev_level": { "hp": 252, "atk": 100, "def": 158, "spa": 0, "spd": 0, "spe": 0 },
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 0 }
                },
                
                // 诅咒强化流：脸接伤害 -> 睡觉 -> 然后一举毁灭世界
                "moves": ["Curse", "Body Slam", "Rest", "Sleep Talk"]
            },
            {
                // [优雅的冰雪 / 华丽大赛之星]
                "name": "Glaceon", // 冰伊布 (致敬动画以及补充冰系打击面)
                "lv": 94,
                "gender": "F",
                "nature": "Modest", 
                "ability": "Snow Cloak", 
                "item": "Choice Specs", // 讲究眼镜
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 一发暴风雪/冰冻光束打过去，协调家的技能也是要看火力的
                "moves": ["Ice Beam", "Shadow Ball", "Freeze-Dry", "Hyper Voice"]
            },
            {
                // [空中的压制力 / 调查队护卫]
                "name": "Metagross", // 巨金怪 (可能是大吾送的? 或者是丰缘强力代表)
                "lv": 95,
                "gender": "N",
                "nature": "Adamant",
                "ability": "Clear Body", // 恒净之躯 (不会被降能力)
                "item": "Assault Vest",  // 突击背心 (弥补特防)
                
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                
                "moves": ["Meteor Mash", "Zen Headbutt", "Bullet Punch", "Earthquake"]
            }
        ]
    }
};


/* 
 * 角色: 小光 (Dawn)
 * 身份: 神奥协调大师 / 华丽大赛庆典冠军
 * 风格: 华丽与实力的完美结合 (Insight Stream)
 * 核心变化: 全员 Ace + Mega + 极致闪避/命中修正
 */
/* 
 * 角色: 小光 (Dawn)
 * 优化点：
 * 1. 引入 Togekiss 替换 Froslass (致敬动画/游戏主力，且强度更高)
 * 2. Infernape 换用大字爆 (Fire Blast)，依赖 Insight 修正命中
 * 3. Torterra 增加突击背心(Assault Vest)增强对攻能力，或保持剩饭
 * 4. Empoleon 确认为 Competitive (好胜) + 弱点保险或突击背心
 */
const DAWN_DATA = {
    // 【Tier 4 - 神奥的永恒光辉】
    4: {
        "trainerProficiency": 235,
        "unlocks": {
            "enable_bond": false, 
            "enable_styles": false, 
            "enable_insight": true,      // ✅ 华丽大赛的观察力：大幅修正低命中技能
            "enable_mega": true,         
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },
        "party": [
            {   // [Mega 战姬 - 不变]
                "name": "Lopunny",
                "lv": 98, // 王牌等级微调
                "gender": "F",
                "nature": "Jolly", 
                "ability": "Scrappy", // 胆量
                "item": "Lopunnite",
                "mechanic": "mega",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Fake Out", "Return", "High Jump Kick", "Ice Punch"], // Insight 让飞膝踢必中且不撞墙，非常强暴力
                "isAce": true, 
                "friendship": { "trust": 150, "passion": 200, "insight": 255, "devotion": 120 }
            },
            {   // [天恩 + 心眼 = 绝对畏缩] -> 替换掉 Froslass
                // 波克基斯是小光绝对的主力之一，且是 Insight 机制的最大受益者
                "name": "Togekiss", 
                "lv": 94,
                "gender": "F",
                "nature": "Timid", // 胆小 +速
                "ability": "Serene Grace", // 天恩：追加效果翻倍 (空气切 60% 畏缩)
                "item": "Kings Rock",      // 王者之证 (如果想更加做人，不带也可以；带了就是近 70% 畏缩)
                                           // 或者带 "Leftovers" / "Babiri Berry" (抗钢果)
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术：Air Slash (畏缩) + Insight (保证必中/易暴击)。
                // 只要速度慢于她，基本上很难动弹。
                "moves": ["Air Slash", "Dazzling Gleam", "Aura Sphere", "Nasty Plot"]
            },
            {   // [烈焰猴 - 技能优化]
                "name": "Infernape",
                "lv": 95,
                "gender": "M",
                "nature": "Naive", 
                "ability": "Iron Fist", 
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 修改：Overheat -> Fire Blast
                // 原因：Overheat 打一发就废了特攻。有 Insight 加持，大字爆(Fire Blast) 的命中不是问题，持续输出更强。
                // 增加 Grass Knot (打断自己的水/地弱点) 也是好选择，或者保留 Mach Punch 收残。
                "moves": ["Fire Blast", "Close Combat", "Mach Punch", "Grass Knot"],
                "isAce": true
            },
            {   // [帝王拿波 - 特盾强化]
                "name": "Empoleon",
                "lv": 95,
                "gender": "M",
                "nature": "Modest", 
                "ability": "Competitive", // 好胜 (SV版本才有，如果是Gen8之前的环境可能没有，模拟器通常允许)
                // 如果不能用 Competitive，建议改回 Torrent + Petaya Berry (特攻果)
                
                "item": "Assault Vest",   // 修改：突击背心。这给了它极高的特耐，可以和特殊攻击手硬刚。
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 水炮在 Insight 下必中
                "moves": ["Hydro Pump", "Flash Cannon", "Ice Beam", "Jet Punch"], 
                // Jet Punch 是个玩笑它学不会，但也用 Aqua Jet 凑合；或者 Vacuum Wave
                "moves": ["Hydro Pump", "Flash Cannon", "Ice Beam", "Aqua Jet"] 
            },
            {   // [土台龟 - 物理堡垒]
                "name": "Torterra", 
                "lv": 94,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Shell Armor", // 防CT
                "item": "Yache Berry",    // 修改：抗冰果。土台龟4倍弱冰，这是唯一的暴毙点。
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                 // 既然带了木槌，Synthesis 回血节奏可能跟不上 Tier4 的伤害，依然保留吧
                 // 或者 Rock Polish (岩磨) 强化速度推队
                "moves": ["Wood Hammer", "Earthquake", "Stone Edge", "Synthesis"]
            },
            {   // [白色恶魔 - 维持原样]
                // 这一只是完美的。
                "name": "Pachirisu",
                "lv": 98, 
                "gender": "F",
                "nature": "Impish", 
                "ability": "Volt Absorb", 
                "item": "Sitrus Berry", 
                
                "stats_meta": { 
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, 
                    "ev_level": 252
                },
                "moves": ["Nuzzle", "Super Fang", "Charm", "Protect"],
                "isAce": true,
                "friendship": { "trust": 255, "passion": 80, "insight": 200, "devotion": 200 }
            }
        ]
    }
};


/* 
 * 角色: 美月 (Selene)
 * 身份: 阿罗拉初代冠军 / 从异次元归来的诸岛巡礼者
 * 难度: Expert / Tier 4
 */
const SELENE_DATA = {
    // 【Tier 4 - 全力姿态·阿罗拉的太阳与月亮】
    4: {
        "trainerProficiency": 250,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": true,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },
        "party": [
            {
                "name": "Decidueye", // 狙射树枭 (ACE - Z招式使用者)
                "lv": 98,
                "gender": "M",
                "nature": "Adamant", // 固执
                "ability": "Long Reach", // 远隔
                "item": "Decidium Z", // Z纯晶
                "mechanic": "zmove", // ✅ Z招式机制标记
                "isAce": true,
                "friendship": { "trust": 255, "passion": 180, "insight": 180, "devotion": 120 },
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                "moves": ["Spirit Shackle", "Leaf Blade", "Brave Bird", "Sucker Punch"]
            },
            {
                "name": "Incineroar", // 炽焰咆哮虎
                "lv": 94,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Intimidate", // 威吓
                "item": "Sitrus Berry",
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                "moves": ["Darkest Lariat", "Flare Blitz", "Fake Out", "Parting Shot"]
            },
            {
                "name": "Snorlax", // 卡比兽
                "lv": 95,
                "gender": "M",
                "nature": "Impish", // 淘气 (+防 -特攻)
                "ability": "Thick Fat", // 厚脂肪
                "item": "Leftovers", 
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                "moves": ["Giga Impact", "Body Slam", "Rest", "Sleep Talk"]
            },
            {
                "name": "Lycanroc-Dusk", // 鬃岩狼人-黄昏
                "lv": 96,
                "gender": "M",
                "nature": "Jolly", // 爽朗 (+速 -特攻)
                "ability": "Tough Claws", // 硬爪
                "item": "Life Orb",
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V，虽然特攻无用但为了HP偶数等微调通常拉满
                },
                "moves": ["Stone Edge", "Accelerock", "Close Combat", "Psychic Fangs"]
            },
            {
                "name": "Scizor", // 巨钳螳螂
                "lv": 95,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Technician", // 技术高手
                "item": "Choice Band", 
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 6V
                },
                "moves": ["Bullet Punch", "U-turn", "Dual Wingbeat", "Superpower"]
            },
            {
                "name": "Umbreon",
                "lv": 92,
                "gender": "M",
                "nature": "Calm", // 温和 (+特防 -攻)
                "ability": "Synchronize", // 同步
                "item": "Rocky Helmet",
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 } // 5V0A，为了减少欺诈和混乱伤害
                },
                "moves": ["Foul Play", "Moonlight", "Toxic", "Protect"]
            }
        ]
    }
};

/* 
 * 角色: 小青 (Juliana)
 * 身份: 帕底亚转校生 / 零之秘宝探索者 / 悖论种驯服者
 * 难度: Expert / Tier 4 (UBER)
 */
const JULIANA_DATA = {
    // 【Tier 4 - 帕底亚的第零区生态灾害】
    4: {
        "trainerProficiency": 245,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": true,   // ✅ 解锁 太晶化 (核心机制: 亮晶晶的收藏癖)
            "enable_proficiency_cap": true  // 训练度突破155上限
        },
        "party": [
            // 1. [坐骑/真·神兽] 
            // 帕底亚的守护神，也是她在这个特区横冲直撞的资本。
            {
                "name": "Miraidon", // 密勒顿
                "lv": 99,
                "gender": "N", // 无性别
                "nature": "Modest", // 内敛 (+特攻 -攻)
                "ability": "Hadron Engine", // 强子引擎 (出场开电场+特攻提升)
                "item": "Choice Specs", // 讲究眼镜 (追求极致的暴力输出)
                "mechanic": "tera",
                "teraType": "Electric", // 太晶电 (电上加电)
                "isAce": true, // 核心王牌
                // [羁绊]: 特别高的 Passion (冲动) 和 Trust (长期骑乘的信任)
                "friendship": { "trust": 255, "passion": 255, "insight": 100, "devotion": 120 },
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 } 
                },
                // 闪电猛冲(专属) + 龙波 + 抛物面(吸血续航) + 伏特替换(游走)
                "moves": ["Electro Drift", "Dragon Pulse", "Parabolic Charge", "Volt Switch"]
            },
            // 2. [首发/游击] 
            // 像魔术师一样的猫，和主人一样擅长变手指戏法。
            {
                "name": "Meowscarada", // 魔幻假面喵
                "lv": 98,
                "gender": "F",
                "nature": "Jolly", // 爽朗 (+速 -特攻)
                "ability": "Protean", // 变幻自如 (帕底亚虽然被削但也够用)
                "item": "Focus Sash", // 气势披带 (保证必出一招)
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 千变万花(必中必爆) + 拍落(没收道具) + 急速折返 + 嬉闹
                "moves": ["Flower Trick", "Knock Off", "U-turn", "Play Rough"]
            },
            // 3. [大将]
            // 需要队友献祭才能变强的将军，符合她“把别人当做资源”的性格。
            {
                "name": "Kingambit", // 仆刀将军
                "lv": 97,
                "gender": "M",
                "nature": "Adamant", // 固执
                "ability": "Supreme Overlord", // 大将 (队友倒下越多越强)
                "item": "Black Glasses", // 黑色眼镜
                "mechanic": "tera",
                "teraType": "Dark", // 太晶恶 (加强仆刀)
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 仆刀(必中) + 突袭(心理博弈) + 铁头 + 剑舞
                "moves": ["Kowtow Cleave", "Sucker Punch", "Iron Head", "Swords Dance"]
            },
            // 4. [资源回收者]
            // 拿着巨锤到处抢东西的粉色恶魔，巨锻匠。
            {
                "name": "Tinkaton", // 巨锻匠
                "lv": 96,
                "gender": "F",
                "nature": "Jolly", // 爽朗 (为了能先手电磁波)
                "ability": "Mold Breaker", // 破格 (无视特性砸下去)
                "item": "Leftovers", // 剩饭
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 巨力锤(160威力) + 嬉闹 + 拍落(还是抢劫) + 电磁波(恶心人)
                "moves": ["Gigaton Hammer", "Play Rough", "Knock Off", "Thunder Wave"]
            },
            // 5. [吸血鬼骑士]
            // 又帅又强，悔念剑吸取生命符合“榨取”的主题。
            {
                "name": "Ceruledge", // 苍炎刃鬼
                "lv": 95,
                "gender": "M",
                "nature": "Jolly", 
                "ability": "Weak Armor", // 碎裂铠甲 (被打加速，反杀)
                "item": "Life Orb", // 命玉
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 悔念剑(回血) + 暗影偷袭(先制) + 近身战 + 剑舞
                "moves": ["Bitter Blade", "Shadow Sneak", "Close Combat", "Swords Dance"]
            },
            // 6. [规则破坏者]
            // 巴布土拨，这只看起来毛绒绒的老鼠拥有游戏里最Bug的技能：复活队友。
            // 即使你打倒了密勒顿，她也会笑着让它复活。
            {
                "name": "Pawmot", // 巴布土拨
                "lv": 94,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Iron Fist", // 铁拳
                "item": "Leppa Berry", // PP果 (甚至想复活两次???)
                "stats_meta": { 
                    "ev_level": 252,
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }
                },
                // 复生祈祷(核心) + 电光双击(必须钛晶用) + 近身战 + 音速拳
                "moves": ["Revival Blessing", "Double Shock", "Close Combat", "Mach Punch"]
            }
        ]
    }
};



/* 
 * 角色: 露莎米奈 (Lusamine)
 * 身份: 以太基金会理事长 / 究极异兽狂热者
 * 核心机制: Z招式 (Z-Moves)
 */
const LUSAMINE_DATA = {
    // 【Tier 4 - 虚无世界的母爱】
    4: {
        "trainerProficiency": 220,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": true,       // ✅ 核心：解锁 Z 手环权限
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [异兽王牌 / Z-Move Core]
                "name": "Nihilego", // 虚吾伊德
                "lv": 99,
                "gender": "N",
                "nature": "Timid", // 胆小 (+速 -攻)
                "ability": "Beast Boost", // 发动后滚雪球
                
                // === 机制核心 ===
                "item": "Rockium Z",    // 携带岩石 Z 纯晶
                "mechanic": "zmove",    // 锁定：本场 Z 招式由它释放
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: Power Gem (力量宝石) -> 转化 -> Continental Crush (威力160)
                "moves": ["Power Gem", "Sludge Wave", "Stealth Rock", "Thunderbolt"],
                
                "isAce": true,
                "friendship": { "trust": 80, "passion": 120, "insight": 140, "devotion": 255 }
            },
            {
                // [极速收割机]
                "name": "Pheromosa", // 费洛美螂
                "lv": 98,
                "gender": "N",
                "nature": "Naughty",
                "ability": "Beast Boost",
                "item": "Focus Sash", // 脆皮必备其实披带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["High Jump Kick", "U-turn", "Ice Beam", "Poison Jab"] 
            },
            {
                // [物理攻坚]
                "name": "Bewear", // 穿着熊
                "lv": 92,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Fluffy", // 毛茸茸 (物耐恐怖)
                "item": "Assault Vest", // 突击背心 (补特防)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Double-Edge", "Superpower", "Darkest Lariat", "Ice Punch"] 
            },
            {
                // [特耐选中 / 异常状态手]
                "name": "Milotic", // 美纳斯
                "lv": 82,
                "gender": "F",
                "nature": "Bold", 
                "ability": "Marvel Scale", 
                "item": "Flame Orb", // 主动烧伤加防御
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Scald", "Recover", "Haze", "Ice Beam"] 
            },
            {
                // [特攻强化手]
                "name": "Lilligant", // 裙儿小姐
                "lv": 75,
                "gender": "F",
                "nature": "Modest",
                "ability": "Own Tempo", // 我行我素
                "item": "Kee Berry", // 受到物攻提升防御（比第二条气腰更实用些）/或者 Life Orb
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                "moves": ["Quiver Dance", "Petal Dance", "Sleep Powder", "Giga Drain"]
            },
            {
                // [魔法盾牌 / 补充]
                "name": "Clefable", // 皮可西
                "lv": 85,
                "gender": "F",
                "nature": "Calm",
                "ability": "Magic Guard", 
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Moonblast", "Soft-Boiled", "Cosmic Power", "Stored Power"]
            }
        ]
    }
};


/* 
 * 角色: 莉莉艾 (Lillie)
 * 修正: 等级回调至 [世界锦标赛标准] (Lv. 80 ~ 85)
 * 核心: 用最无害的外表，打最扎实的辉石与Z爆发
 */
const LILLIE_DATA = {
    // 【Tier 4 - 全力姿态·世界锦标赛配置】
    4: {
        "trainerProficiency": 180,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": true,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },

        "party": [
            {
                // [肉盾 ACE]
                // 即使是 Lv.85，配合满努力值辉石，耐久也超过大多数 Lv.100 的脆皮
                "name": "Clefairy", 
                "lv": 85, // 修正为 85 （一般是一队的最高等级）
                "gender": "F",
                "nature": "Bold", 
                "ability": "Magic Guard", 
                "item": "Eviolite", // 辉石是核心
                "mechanic": "zmove",
                "isAce": true, 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 恶心战术不变：宇宙力量+变小
                "moves": ["Moonblast", "Moonlight", "Cosmic Power", "Minimize"],
                "friendship": { "trust": 220, "passion": 60, "insight": 120, "devotion": 255 }
            },
            {
                // [Z招式爆发点]
                "name": "Ninetales-Alola", 
                "lv": 84, // 紧跟ACE的等级
                "gender": "F",
                "nature": "Timid", 
                "ability": "Snow Warning", 
                "item": "Icium Z", 
                "mechanic": "zmove",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0,  "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Blizzard", "Aurora Veil", "Freeze-Dry", "Moonblast"]
            },
            {
                // [传说外援]
                "name": "Magearna", 
                "lv": 82, // 幻兽基础面板高，等级稍微给一点"后来加入"的感觉
                "gender": "N",
                "nature": "Modest",
                "ability": "Soul-Heart", 
                "item": "Assault Vest", // 突击背心增加对拼能力
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Fleur Cannon", "Flash Cannon", "Aura Sphere", "Volt Switch"]
            },
            {
                // [干扰控速]
                "name": "Ribombee", 
                "lv": 82,
                "gender": "F",
                "nature": "Timid",
                "ability": "Shield Dust",
                "item": "Focus Sash", // 气腰保底
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Sticky Web", "Moonblast", "U-turn", "Pollen Puff"]
            },
            {
                // [特攻炮台]
                // 裙儿小姐如果特性是用我行我素，可以防威吓防混乱
                "name": "Lilligant", 
                "lv": 80,
                "gender": "F",
                "nature": "Modest",
                "ability": "Own Tempo", 
                "item": "Life Orb", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                // 蝶舞强化流
                "moves": ["Quiver Dance", "Petal Dance", "Giga Drain", "Hidden Power Fire"] 
                // 关于觉醒火(Hidden Power Fire)，虽然新世代取消了，但在数据构建里可以作为一个"补盲手段"写入
                // 或者换成 Pollen Puff (花粉团)
            },
            {
                // [强力回复/辅助]
                "name": "Comfey", 
                "lv": 80,
                "gender": "F",
                "nature": "Bold",
                "ability": "Triage", 
                "item": "Leftovers",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Draining Kiss", "Giga Drain", "Synthesis", "Calm Mind"] 
            }
        ]
    }
};


/* 
 * 角色: 玛奥 (Mallow)
 * 身份: 阿罗拉草系队长 / 美味之原有人的大厨
 * 核心机制: Z招式 (Grassium Z)
 */
const MALLOW_DATA = {
    // 【Tier 4 - 满汉全席·主厨推荐】
    4: {
        "trainerProficiency": 200,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": true,       // ✅ 队长即是 Z 力量的引导者
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [厨师长 / Z爆发核心]
                "name": "Tsareena", // 甜冷美后
                "lv": 85,
                "gender": "F",
                "nature": "Adamant", // 固执 (+攻 -特攻)
                "ability": "Queenly Majesty", // 女王的威严：封锁先制技（不管是神速还是突袭）
                
                // === 机制核心 ===
                "item": "Grassium Z",   // 携带草 Z
                "mechanic": "zmove",    // 绑定 Z 招式
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: Using Power Whip -> Bloom Doom (威力 190) 强行突破
                // High Jump Kick 补盲打钢，U-turn 灵活轮转
                "moves": ["Power Whip", "High Jump Kick", "Trop Kick", "U-turn"],
                
                "isAce": true,
                // 充满热情的性格，注重献身服务食客(队友)
                "friendship": { "trust": 140, "passion": 200, "insight": 100, "devotion": 180 }
            },
            {
                // [霸主风味 / 唱反调流]
                "name": "Lurantis", // 兰螳花 (她试炼中的霸主)
                "lv": 84,
                "gender": "F",
                "nature": "Brave", // 勇敢 (+攻 -速, 甚至可能带空间？)
                "ability": "Contrary", // 唱反调：能力下降变为提升
                "item": "Leftovers",   // 剩饭续航
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 核心战术: 飞叶风暴 (+2 特攻) + 蛮力 (+1 物攻/防御)
                "moves": ["Leaf Storm", "Superpower", "Synthesis", "Poison Jab"] 
            },
            {
                // [万圣节特供 / 物理盾牌]
                "name": "Trevenant", // 朽木妖
                "lv": 83,
                "gender": "M",
                "nature": "Impish", // 淘气 (+防 -特攻)
                "ability": "Harvest", // 收获：晴天必定回收树果，平时50%
                "item": "Sitrus Berry", // 文柚果 (配合收获几乎无限回血)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 经典的无限鬼火消耗流
                "moves": ["Will-O-Wisp", "Poltergeist", "Horn Leech", "Leech Seed"] 
            },
            {
                // [招牌甜点 / 厚脂坦克]
                "name": "Appletun", // 丰蜜龙
                "lv": 82,
                "gender": "M",
                "nature": "Bold", 
                "ability": "Thick Fat", // 厚脂肪：减半火/冰伤害 (作为草系极其重要)
                "item": "Rocky Helmet", // 凸凸头
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 专门溶解钢系
                "moves": ["Apple Acid", "Dragon Pulse", "Recover", "Body Press"] 
            },
            {
                // [餐后奶油 / 双打辅助]
                "name": "Alcremie", // 霜奶仙
                "lv": 80,
                "gender": "F",
                "nature": "Calm",
                "ability": "Sweet Veil", // 甜幕：防睡眠
                "item": "Wiki Berry", // 混乱果
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Dazzling Gleam", "Mystical Fire", "Calm Mind", "Recover"]
            },
            {
                // [阿罗拉的风 / 地区特产]
                "name": "Exeggutor-Alola", // 阿罗拉椰蛋树
                "lv": 82,
                "gender": "M",
                "nature": "Quiet", // 冷静 (空间打手)
                "ability": "Frisk", // 察觉
                "item": "Sitrus Berry",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 也是能用龙系 Z 招式的 potential unit
                "moves": ["Draco Meteor", "Flamethrower", "Giga Drain", "Sludge Bomb"]
            }
        ]
    }
};


/* 
 * 角色: 水莲 (Lana)
 * 身份: 阿罗拉水系队长 / 传说中的钓鱼大师
 * 核心机制: Z招式 (Waterium Z) + 水泡核弹
 */
const LANA_DATA = {
    // 【Tier 4 - 滔天巨浪·海神钓手】
    4: {
        "trainerProficiency": 200,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": true,       // ✅ 你的队伍就是我的鱼塘
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [水泡核弹 / 绝对王牌]
                "name": "Araquanid", // 滴蛛霸
                "lv": 85,
                "gender": "F",
                "nature": "Adamant", // 固执 (+攻 -特攻)
                "ability": "Water Bubble", // 水泡：火系伤害减半，免烧伤，水系威力x2 (自带讲究头带效果且无负面)
                
                // === 机制核心 ===
                "item": "Waterium Z",   // 携带水 Z
                "mechanic": "zmove",    // 绑定 Z 招式
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: Liquidation + Water Bubble + Z-Power = 毁天灭地的 Hydro Vortex (威力160的基础伤害修正后极高)
                // Lunge 降攻，Sticky Web 控速保障后续队友
                "moves": ["Liquidation", "Leech Life", "Lunge", "Sticky Web"],
                
                "isAce": true, 
                // "别看我这样，我可是钓上来过盖欧卡的 (笑)"
                "friendship": { "trust": 160, "passion": 200, "insight": 120, "devotion": 120 }
            },
            {
                // [物理屠夫 / 破壳推队]
                "name": "Cloyster", // 刺甲贝
                "lv": 84,
                "gender": "M",
                "nature": "Jolly", // 爽朗 (极速)
                "ability": "Skill Link", // 连续攻击：必定5连
                "item": "Focus Sash",    // 气势披带：唯一的弱点是特防，这就需要气腰来保证破壳成功
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // AI 逻辑：只要气腰还在，直接 Shell Smash，然后 Icicle Spear 推队
                "moves": ["Shell Smash", "Icicle Spear", "Rock Blast", "Ice Shard"] 
            },
            {
                // [鱼群领主 (?) / 重炮台]
                "name": "Wishiwashi", // 弱丁鱼 (鱼群样子)
                "lv": 83,
                "gender": "M",
                "nature": "Quiet", // 冷静 (接球用，双刀)
                "ability": "Schooling", // 鱼群：HP>25% 时种族如同神兽
                "item": "Sitrus Berry", // 文柚果：维持鱼群形态的生命线
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 252 },
                
                // 极慢的速度适合后手 U-turn，或者硬吃一发后双刀反杀
                "moves": ["Hydro Pump", "Earthquake", "Ice Beam", "U-turn"] 
            },
            {
                // [第一印象 / 战略撤退]
                "name": "Golisopod", // 具甲武者
                "lv": 83,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Emergency Exit", // 危险回避：半血强制退场 (战略价值)
                "item": "Assault Vest", // 突击背心
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // First Impression (迎头一击) 威力90先制
                "moves": ["First Impression", "Aqua Jet", "Liquidation", "Sucker Punch"] 
            },
            {
                // [水/电 联防核心]
                "name": "Lanturn", // 电灯怪
                "lv": 82,
                "gender": "F",
                "nature": "Calm", 
                "ability": "Volt Absorb", // 蓄电
                "item": "Leftovers", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Scald", "Volt Switch", "Thunder Wave", "Heal Bell"] // 假如需要队医
            },
            {
                // [阿罗拉歌姬 / 补盲]
                "name": "Primarina", // 西狮海壬
                "lv": 82,
                "gender": "F",
                "nature": "Modest",
                "ability": "Torrent", // 激流
                "item": "Choice Specs", // 讲究眼镜
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 主要负责处理龙系和格斗系
                "moves": ["Moonblast", "Hydro Pump", "Psychic", "Energy Ball"] 
            }
        ]
    }
};


/* 
 * 角色: 珠贝 (Irida)
 * 身份: 珍珠队首领 / 帕路奇亚信仰者
 * 核心机制: 刚猛/迅疾 (PLA Styles) + 雪天防御队
 */
const IRIDA_DATA = {
    // 【Tier 4 - 珍珠所照耀的广阔空间】
    4: {
        "trainerProficiency": 215,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": true,   
            "enable_insight": true,      
            "enable_mega": false, 
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true  // 训练度突破155上限
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [绝对王牌 / 冰原之花]
                "name": "Glaceon", // 冰伊布
                "lv": 86,
                "gender": "F",
                "nature": "Modest", // 内敛 (特攻极限)
                "ability": "Snow Cloak", // 雪隐 (雪天里配合 AVs Insight 极高闪避)
                
                // 携带光粉 (BrightPowder) + 雪隐 + Insight = 极其难以命中的“空间折叠”感
                "item": "Bright Powder", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: 迅疾·冥想 (贪强化) / 刚猛·暴风雪 (必中高伤)
                "moves": ["Blizzard", "Freeze-Dry", "Calm Mind", "Shadow Ball"],
                
                "isAce": true, 
                // 极高的 Insight 代表了珍珠队对于"空间/距离"的感知
                "friendship": { "trust": 160, "passion": 100, "insight": 255, "devotion": 120 }
            },
            {
                // [空间使者 / 魔法反射]
                "name": "Espeon", // 太阳伊布
                "lv": 84,
                "gender": "F",
                "nature": "Timid", // 胆小
                "ability": "Magic Bounce", // 魔法镜 (反弹状态)
                "item": "Light Clay", // 光之黏土
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 开双墙，利用迅疾风格可以连续行动开墙
                "moves": ["Psychic", "Dazzling Gleam", "Reflect", "Light Screen"] 
            },
            {
                // [雪原巨兽 / 物理坦克]
                "name": "Avalugg-Hisui", // 洗翠冰岩怪 (雪原的王)
                "lv": 85,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Strong Jaw", // 强壮之颚
                "item": "Assault Vest", // 突击背心 (弥补稀烂的特防，依靠雪天+50%物防硬吃物理)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 专属技 冰山之风 (Mountain Gale) + 岩崩
                "moves": ["Mountain Gale", "Stone Edge", "Earthquake", "Body Press"]
            },
            {
                // [火系爆破 / 逆属性位]
                "name": "Flareon", // 火伊布 (作为由于怕热而养的火系，处理钢系敌人)
                "lv": 84,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Guts", // 毅力
                "item": "Toxic Orb", // 剧毒宝珠
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 刚猛·硬撑 / 迅疾·电光一闪
                "moves": ["Flare Blitz", "Facade", "Superpower", "Quick Attack"]
            },
            {
                // [高速刺客 / 剧毒手]
                "name": "Sneasler", // 大纽拉 (也属于珍珠队照看的王)
                "lv": 83,
                "gender": "F",
                "nature": "Jolly", 
                "ability": "Unburden", // 轻装 (配合力量香草或气脊)
                "item": "White Herb", // 配合近身战解Debuff，或者气势披带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 专属技 露爪 (Dire Claw) 异常状态赌狗
                "moves": ["Dire Claw", "Close Combat", "Acrobatics", "Swords Dance"]
            },
            {
                // [雪天启动 / 干扰]
                // 选用冷门但符合设定的雪妖女，契合洗翠的灵异氛围
                "name": "Froslass", // 雪妖女
                "lv": 82,
                "gender": "F",
                "nature": "Timid",
                "ability": "Cursed Body", 
                "item": "Focus Sash",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Aurora Veil", "Destiny Bond", "Icy Wind", "Spikes"] 
                // 极光幕+同命，典型的死士
            }
        ]
    }
};

/* 
 * 角色: 紫竽 (Lacey)
 * 身份: 蓝莓学园四天王 / 风纪委员长 / 规则至上主义者
 * 核心机制: 太晶化 (Tera: Stellar) + 恶作剧控速 + 概率管理
 * "凡是不仅正确的事情，就是不正当的（X）！"
 */
const LACEY_DATA = {
    // 【Tier 4 - 绝对正确的“花”之风纪】
    4: {
        "trainerProficiency": 230, // 学院派的高精准度
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true,    // ✅ 身为风纪委员，能在乱局中看清破绽 (命中修正)
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": true,       // ✅ 帕底亚/蓝莓学园留学生的核心技术
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [执法先锋 / 控速]
                "name": "Whimsicott", // 风妖精
                "lv": 92,
                "gender": "F",
                "nature": "Timid",   // 胆小 (+速)
                "ability": "Prankster", // 恶作剧之心
                "item": "Focus Sash",   // 气势披带：保证开出顺风
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: 顺风(加速) -> 再来一次(锁对面强化/保护) -> 月亮之力
                // 在这个都是Lv.90+怪物的环境，先按下“再来一次”常能逼疯那些准备剑舞的猛男
                "moves": ["Tailwind", "Encore", "Moonblast", "Energy Ball"]
            },
            {
                // [物理管教 / 威吓]
                "name": "Granbull", // 布鲁皇
                "lv": 90,
                "gender": "F",
                "nature": "Adamant", // 固执
                "ability": "Intimidate", // 威吓：物理手的克星
                "item": "Choice Band",   // 专爱头带：将输出最大化
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 即使没有妖精皮，Play Rough + 专头 的力度也足以粉碎龙系
                // 补盲：地震 + 火焰拳
                "moves": ["Play Rough", "Earthquake", "Fire Punch", "Close Combat"]
            },
            {
                // [歌唱社团 / 音爆穿透]
                "name": "Primarina", // 西狮海壬
                "lv": 92,
                "gender": "F",
                "nature": "Modest", // 内敛
                "ability": "Liquid Voice", // 湿润之声：声音技变水系
                "item": "Throat Spray",    // 爽喉喷雾：用完巨声顺便+1特攻
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 典型的越打越痛。除了巨声，还需防范冰/仙盲点。
                "moves": ["Hyper Voice", "Moonblast", "Ice Beam", "Psychic"]
            },
            {
                // [甜蜜陷阱 / 强化要塞]
                "name": "Alcremie", // 霜奶仙 (红钻综合)
                "lv": 90,
                "gender": "F",
                "nature": "Bold",   // 大胆 (+防 -攻)
                "ability": "Sweet Veil", // 甜幕：全队防睡眠（针对 T3+ 的睡杀流极佳）
                "item": "Leftovers",     // 剩饭
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 改版：如果你单打碰到这只，会发现她使用了 "溶化(Acid Armor)" + "冥想(Calm Mind)"
                // 然后 "辅助力量(Stored Power)" 一发入魂
                "moves": ["Acid Armor", "Calm Mind", "Recover", "Stored Power"]
            },
            {
                // [不确定性因素 / 赌狗之毒]
                "name": "Slowbro-Galar", // 伽勒尔呆壳兽
                "lv": 91,
                "gender": "F",
                "nature": "Modest",
                "ability": "Quick Draw", // 速击：30% 概率先制度+1
                "item": "Quick Claw",    // 先制之爪：20% 概率先制度+1
                
                // 双重判定：每一回合都有约 44% 的概率无视速度强行先手
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 252 },
                
                // Shell Side Arm (臂贝武器): 自动选物理/特殊端造成更大伤害，必带
                "moves": ["Shell Side Arm", "Psychic", "Flamethrower", "Nasty Plot"] 
                // Nasty Plot(诡计)一旦强化成功，这只概率怪会变成推队王
            },
            {
                // [风纪委员长 / 规则执行者 ACE]
                "name": "Excadrill", // 龙头地鼠
                "lv": 95,            // 王牌等级
                "gender": "M",
                "nature": "Adamant", // 固执
                "ability": "Mold Breaker", // 破格：由于她的个性——"打破一切不正确防御（飘浮/结实）"
                "item": "Assault Vest",    // 突击背心：硬切特攻手的资本
                
                // === 机制核心 ===
                "mechanic": "tera",
                "teraType": "Stellar", // 太晶：星晶。保留了她在 蓝莓学园 的标志性特征 (全属性打击面增强)
                // 如果引擎不支持 Stellar，visually 可 fallback 至 Ground/Steel
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "isAce": true, 
                
                // 配招：
                // Tera Blast (太晶爆发): 配合星晶，克制所有这只地鼠当前微弱的太晶对手。
                // High Horsepower (十万马力): 不会误伤双打队友的本系，威力95。
                // Iron Head (铁头): 稳定本系。
                // Rock Slide (岩崩): 弥补打击面，加上破格可以打飞/虫。
                "moves": ["High Horsepower", "Tera Blast", "Iron Head", "Rock Slide"],
                
                // [AVs - 情感倾向]
                // 她的 Trust 和 Insight 很高，代表对规则的信赖和洞察力；
                // Passion 虽然外表得体（不像奇树那么疯），但在关键时刻（太晶化）会爆发
                "friendship": { "trust": 220, "passion": 180, "insight": 255, "devotion": 120 }
            }
        ]
    }
};


/* 
 * 角色: 小霞 (Misty)
 * 身份: 华蓝道馆馆主 / 自封"世界第一美少女" / 严厉的泳池保全
 * 核心机制: 纯朴联防 + 洞察心眼 (绝对零度) + 隐藏的呆霸王
 * "我的策略用水来形容? ……那就是无论你怎么挣扎都会把你这一头闷进水里的压迫感！"
 */
const MISTY_DATA = {
    // 【Tier 4 - 华蓝海角的严厉大姐姐】
    4: {
        "trainerProficiency": 230, // 关都老牌馆主的底力
        "unlocks": {
            "enable_bond": true,         // ✅ 羁绊解禁 (给可达鸭) 
            "enable_styles": false,
            "enable_insight": true,      // ✅ 洞察力开启：修正 '绝对零度' 和 '水炮' 命中
            "enable_mega": false,        // 她在这一代依然坚持非Mega的一击制胜 (?) 或者可以考虑给 Mega 暴更... 但这里没带暴鲤龙
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [反强化的叹息之壁]
                "name": "Quagsire", // 沼王
                "lv": 84,
                "gender": "F",
                "nature": "Relaxed", // 悠闲 (+防 -速)
                "ability": "Unaware", // 纯朴：无视对手一切攻/防能力变化
                "item": "Leftovers",  // 剩饭
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 哈欠逼换，剧毒磨血，攀瀑本系
                // 专门用来处理试图在小霞面前“跳龙舞”的家伙
                "moves": ["Yawn", "Earthquake", "Waterfall", "Recover"]
            },
            {
                // [蓄电发电机]
                "name": "Lanturn", // 电灯怪
                "lv": 84,
                "gender": "F",
                "nature": "Calm",   // 温和 (+特防)
                "ability": "Volt Absorb", // 蓄电：完全免疫电系
                "item": "Sitrus Berry", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                
                // 水+电 双本盲点极少
                "moves": ["Volt Switch", "Scald", "Ice Beam", "Thunder Wave"]
            },
            {
                // [移动炮台/破壳流]
                "name": "Blastoise", // 水箭龟  
                "lv": 85,
                "gender": "M",
                "nature": "Adamant", // 固执
                "ability": "Torrent", 
                "item": "White Herb", // 白色香草：抵消破壳后的防御下降
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术：找机会 Shell Smash (及攻/速 +2)
                // 然后逆鳞/水兵推队
                "moves": ["Shell Smash", "Waterfall", "Outrage", "Earthquake"] // 替换了原本的雪崩/铁壁，更具进攻性
            },
            {
                // [心眼战神 / 泳池BOSS]
                "name": "Lapras", // 拉普拉斯
                "lv": 86,
                "gender": "F",
                "nature": "Modest", // 内敛
                "ability": "Water Absorb", // 储水
                "item": "Assault Vest",    // 突击背心（特防 x1.5）-> 肉到令人绝望
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Sheer Cold (绝对零度): 
                // T4 + enable_insight = 会让命中修正到一个"极其危险"的程度（例如50%甚至更高预判）
                // 加上 突击背心 的硬度，她能试射很多发
                "moves": ["Sheer Cold", "Freeze-Dry", "Hydro Pump", "Ice Shard"]
            },
            {   
                // [ACE 1 - 鸭神的觉醒]
                // 替代了原本的 Jellicent (胖嘟嘟)
                "name": "Psyduck", // 可达鸭 (未进化)
                "lv": 95,          // 等级拉高以示特别
                "gender": "M",
                "nature": "Modest", // 内敛 (+特攻)
                "ability": "Cloud Nine", // 无关天气：什么雨天晴天，我的头疼最大
                "item": "Eviolite",     // 进化奇石：Def/SpD x1.5
                
                // 标记为 Ace 之一，享受 Trainer 喊话
                "isAce": true,
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 配招思路：呆头呆脑的超能力爆发
                // Psychic (精神强念)
                // Hydro Pump (水炮) - 相信 Insight，这发水炮必中
                // Disable (定身法) - "哎呀头好痛，你别动了" 封锁对手上一技能
                // Future Sight (预知未来) - 压场神技
                "moves": ["Psychic", "Hydro Pump", "Disable", "Future Sight"],
                
                // [全岛最强的头痛羁绊]
                // 玩家可以理解为这是小霞最初的那只可达鸭，Trust 和 Passion 都是满的
                "friendship": { "trust": 255, "passion": 255, "insight": 255, "devotion": 255 } 
            },
            {
                // [ACE 2 - 海南的双石]
                "name": "Starmie", // 宝石海星
                "lv": 92,
                "gender": "N",
                "nature": "Timid", // 胆小 (极速)
                "ability": "Natural Cure", // 自然回复 (换人对策)
                "item": "Life Orb",        // 命玉 (追求确一的斩杀线)
                "isAce": true,             // 定位的真正Ace
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "friendship": { "trust": 255, "passion": 255, "insight": 255, "devotion": 255 },
                "moves": ["Hydro Pump", "Thunderbolt", "Psychic", "Ice Beam"]
            }
        ]
    }
};

const HEX_DATA = {

    4: {
        "trainerProficiency": 155,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": true, 
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [不死的空间手]
                "name": "Dusclops", 
                "lv": 74,
                "gender": "F",
                "nature": "Sassy", // 狂妄
                "ability": "Pressure",
                "item": "Eviolite", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 25, "def": 31, "spa": 25, "spd": 31, "spe": 0 }, "ev_level": 252 },
                "moves": ["Night Shade", "Will-O-Wisp", "Trick Room", "Memento"] // 开完空间临别礼物退场，甚至不加敌方击杀数
            },
            {
                // [重炮手]
                "name": "Chandelure", // 水晶灯火灵
                "lv": 75,
                "gender": "F",
                "nature": "Modest",
                "ability": "Infiltrator", // 穿透
                "item": "Choice Specs", // 讲究眼镜火抗极高
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Overheat", "Shadow Ball", "Energy Ball", "Trick"]
            },
            {
                // [物理防御组]
                "name": "Cofagrigus", // 只有合众/伽勒尔的 迭失棺
                "lv": 72,
                "gender": "M",
                "nature": "Bold", 
                "ability": "Mummy", // 木乃伊 (接触这只怪会让对方特性失效，专门克制物理手)
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                "moves": ["Hex", "Toxic Spikes", "Protect", "Body Press"] 
            },
            {
                // [超能爆破 / 控速]
                "name": "Gothitelle", // 哥德小姐
                "lv": 73,
                "gender": "F",
                "nature": "Calm",
                "ability": "Competitive", // 蹭威吓可以加特攻
                "item": "Sitrus Berry", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                "moves": ["Psychic", "Thunder Wave", "Fake Out", "Heal Pulse"]
            },
            {
                // [怨念的化身 / Prankster Ace]
                "name": "Banette", 
                "lv": 78,
                "gender": "F",
                "nature": "Adamant", // 固执 (+攻 -特)
                "ability": "Frisk", // 进化前看道具
                
                // === 机制核心 ===
                "mechanic": "mega",     // 锁定：Mega 诅咒娃娃
                "item": "Banettite", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "isAce": true,
                "friendship": { "trust": 100, "passion": 80, "insight": 220, "devotion": 120 }, // 她的玩偶
                
                // 战术核心: Prankster (进化后恶作剧之心) 带来的先制 
                // Destiny Bond (同命) 先手施放：我不死你死，我还手你就死
                // Gunk Shot 打妖精
                "moves": ["Destiny Bond", "Gunk Shot", "Phantom Force", "Knock Off"]
            }
        ]
    }
};
/* 
 * 角色: 索妮亚 (Sonia)
 * 身份: 伽勒尔地区博士 / 传说的记录者
 * 核心概念: 理论派 (The Theorist) - 机制全解禁，道具完美适配，但等级克制
 */
const SONIA_DATA = {
    // 【Tier 4 - 博士的论文答辩】
    4: {
        "trainerProficiency": 190,
        // ==============================================================
        // [Tier Specific Unlocks] 全知全能 (Omnisurvey)
        // 只有身为博士的她，才拥有所有地区现象的研究许可
        // ==============================================================
        "unlocks": {
            "enable_bond": true,         // 为了以此证明“英雄”的心
            "enable_styles": true,       // 考据了洗翠的历史文献
            "enable_insight": true,      // 完美的战术理论 (心眼已开，AVs突破155)
            "enable_mega": true,         // 卡洛斯留学的纪念
            "enable_z_move": true,       // 阿罗拉交流的成果
            "enable_dynamax": true,      // 本土伽勒尔的能量
            "enable_tera": true,         // 最新的帕底亚论文课题
            "enable_proficiency_cap": true  // 训练度突破155上限
        },

        // ==============================================================
        // [Party Data] 少而精的理论验证队
        // ==============================================================
        "party": [
            {
                // [绝对核心 / 奇迹吉祥物]
                // 没进化不是因为弱，是因为“进化奇石 (Eviolite)”在计算上防御更高
                "name": "Yamper", 
                "lv": 75, 
                "gender": "M",
                "nature": "Impish", // 淘气 (+防 -特攻) - 极限物理肉盾
                "ability": "Ball Fetch", 
                "item": "Eviolite", // 进化奇石：Def/SpD x1.5，配合下面满的EV，硬度堪比神兽
                
                // === 机制实验：太晶化研究 ===
                "mechanic": "tera",
                "teraType": "Electric", // 纯电太晶，消除弱点并提升本系抗打
                
                "stats_meta": {
                    // 身为博士，当然懂得怎么给宝可梦【磕药】打满 6V 和最合理的 510 努力值
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, 
                    "ev_level": { "hp": 252, "atk": 0, "def": 252, "spa": 0, "spd": 4, "spe": 0 } 
                },
                
                // 战术：蹭蹭麻烦(控速/控场) + 愤怒门牙(无视等级差强行削血)
                "moves": ["Nuzzle", "Super Fang", "Play Rough", "Rest"],
                
                "isAce": true,
                // 高 Insight (读书多预判准) + 高 Devotion (这只狗真的很忠诚)
                "friendship": { "trust": 150, "passion": 100, "insight": 255, "devotion": 200 }
            },
            {
                // [强力输出 / Z 论文演示]
                "name": "Tsareena", // 甜冷美后
                "lv": 72,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Queenly Majesty", // 女王的威严：封锁对面的先制技能 (如神速/击掌奇袭)
                
                "mechanic": "zmove",    // 使用 Z 招式
                "item": "Grassium Z",   // 草 Z
                
                // 依然是满努力值的暴力输出分配
                "stats_meta": {
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 },
                    "ev_level": { "hp": 0, "atk": 252, "def": 4, "spa": 0, "spd": 0, "spe": 252 }
                },
                "moves": ["Power Whip", "High Jump Kick", "Trop Kick", "U-turn"]
            },
            {
                // [本土特产 / 极巨化展示对象]
                // 乘龙 (Lapras) - 可能是丹帝送的那个级别或者以前自己抓的遗留
                "name": "Lapras", 
                "lv": 70,
                "gender": "F",
                "nature": "Modest", // 内敛
                "ability": "Shell Armor", // 硬壳盔甲：不被击中要害 (理论最优解)
                
                "mechanic": "dynamax", // 超极巨化
                "item": "Weakness Policy", // 弱点保险：吃一发克制技能特攻物攻+2，典型的对战党配置
                
                // Max HP / Max SpA
                "stats_meta": {
                    "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 },
                    "ev_level": { "hp": 252, "atk": 0, "def": 0, "spa": 252, "spd": 0, "spe": 4 }
                },
                // G-Max Resonance (超极巨极光声) 会直接开极光幕，战略价值极大
                "moves": ["Freeze-Dry", "Hydro Pump", "Thunder", "Protect"]
            }
        ]
    }
};


/* 
 * 馆主: 霍米加 (Roxie)
 * 属性: 毒 (Poison)
 * 风格: 摇滚乐手 / 猛毒快攻
 * 难度曲线: Level 1 (车库乐队) -> Level 3 (灵魂共鸣) -> Level 4 (世界巡演)
 */
const ROXIE_DATA = {
    // 【Tier 1 - 车库里的杂音】
    // Lv.25 左右，未进化，基础连招，没有任何特殊系统解锁。
    1: {
        "trainerProficiency": 50,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Venipede", // 百足蜈蚣 (高速干扰手雏形)
                "lv": 24,
                "gender": "F",
                "nature": "Hasty",
                "ability": "Poison Point", // 毒刺
                "item": "Poison Barb", // 毒针
                "stats_meta": { "ivs": { "hp": 20, "atk": 20, "def": 20, "spa": 20, "spd": 20, "spe": 20 }, "ev_level": 5 },
                "moves": ["Bug Bite", "Poison Tail", "Iron Defense", "Screech"] // 刺耳声配合物理
            },
            {
                "name": "Koffing", // 瓦斯弹 (飘浮地联防)
                "lv": 24,
                "gender": "M",
                "nature": "Bold",
                "ability": "Levitate",
                "stats_meta": { "ivs": { "hp": 20, "atk": 20, "def": 20, "spa": 20, "spd": 20, "spe": 20 }, "ev_level": 5 },
                "moves": ["Smog", "Assurance", "Clear Smog", "Will-O-Wisp"]
            },
            {
                "name": "Trubbish", // 破破袋 (未来的王牌)
                "lv": 25,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Stench", // 恶臭 (偶尔畏缩)
                "item": "Oran Berry", // 橙橙果
                "isAce": true, // 初始Ace
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 25, "spd": 25, "spe": 25 }, "ev_level": 20 },
                "moves": ["Sludge", "Toxic Spikes", "Acid Spray", "Double Slap"] // 撒毒菱干扰
            }
        ]
    },

    // 【Tier 2 - 地下 Live House 的实力派】
    // Lv.50，辉石防御体系，初步的战术雏形。
    2: {
        "trainerProficiency": 100,
        "unlocks": {
            "enable_bond": false, // 尚未达到灵魂共鸣
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Whirlipede", // 车轮球 (进化奇石战术)
                "lv": 48,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Speed Boost", // 梦特：加速特性开始启用
                "item": "Eviolite",     // 辉石：硬度极高
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 120 },
                // 守住加速 + 铁壁防御，很难打动
                "moves": ["Protect", "Poison Jab", "Iron Defense", "Bug Bite"]
            },
            {
                "name": "Golbat", // 大嘴蝠 (为了以后的战术位)
                "lv": 48,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Inner Focus",
                "item": "Sitrus Berry",
                "stats_meta": { "ivs": { "hp": 25, "atk": 31, "def": 25, "spa": 25, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Cross Poison", "Confuse Ray", "Bite", "U-turn"]
            },
            {
                "name": "Toxtricity", // 颤弦蝾螈 (新队员入队，特攻手)
                "lv": 49,
                "gender": "M",
                "nature": "Modest",
                "ability": "Punk Rock", // 庞克摇滚
                "item": "Magnet", // 磁铁
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 25, "spa": 31, "spd": 25, "spe": 31 }, "ev_level": 120 },
                "moves": ["Overdrive", "Venoshock", "Snarl", "Noble Roar"] // 声音招式配合特性
            },
            {
                "name": "Garbodor", // 灰尘山 (进化完全，物理主力)
                "lv": 50,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Weak Armor", // 碎裂铠甲
                "item": "Black Sludge", // 黑色污泥
                "isAce": true, 
                "friendship": { "trust": 100, "passion": 150, "insight": 80, "devotion": 100 }, // 羁绊渐深
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Gunk Shot", "Body Slam", "Drain Punch", "Toxic"]
            }
        ]
    },

    // 【Tier 3 - 震撼灵魂的巡演 · 羁绊觉醒】
    // Lv.70+，开启 enable_bond。
    // 战术核心：利用 Toxtricity 的声音爆发，以及最后 Garbodor 的“羁绊共鸣”。
    3: {
        "trainerProficiency": 160,
        "unlocks": {
            "enable_bond": true,         // ✅ 核心差异：点亮绿色 EVO 按钮
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,     // T3 还没有去伽勒尔，不会极巨化
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                // [起点核心] 
                "name": "Scolipede", // 蜈蚣王 (完全体接棒手)
                "lv": 75,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Speed Boost",
                "item": "Focus Sash", // 确保必定能强化一轮
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                // 经典的接棒战术，可能会接给后面的颤弦蝾螈或灰尘山
                "moves": ["Swords Dance", "Iron Defense", "Baton Pass", "Megahorn"]
            },
            {
                // [干扰中转]
                "name": "Crobat", // 叉字蝠
                "lv": 74,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Infiltrator", // 穿透
                "item": "Black Sludge", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Brave Bird", "Cross Poison", "U-turn", "Defog"] // 清钉工具人
            },
            {
                // [特攻爆破] 
                "name": "Toxtricity", 
                "lv": 74,
                "gender": "M",
                "nature": "Timid", // 胆小 (+速)
                "ability": "Punk Rock", 
                "item": "Throat Spray", // 处刑曲的节奏
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Boomburst", "Overdrive", "Sludge Wave", "Shift Gear"] //Boomburst 是声音核弹
            },
            {
                // [盲点补全]
                "name": "Drapion", // 龙王蝎 (抗超能 只有地弱点)
                "lv": 73,
                "gender": "M",
                "nature": "Careful", // 慎重 (+特防)
                "ability": "Sniper", // 狙击手
                "item": "Scope Lens", // 焦点镜
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Night Slash", "Cross Poison", "Fell Stinger", "Earthquake"] // 暴击流
            },
            {
                // [绝对王牌 / 羁绊对点]
                "name": "Garbodor", // 灰尘山
                "lv": 77, // 等级压制
                "gender": "F",
                "nature": "Adamant",
                "ability": "Weak Armor", // 碎裂铠甲
                "item": "Rocky Helmet", // 凸凸头
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "moves": ["Gunk Shot", "Seed Bomb", "Drain Punch", "Stomping Tantrum"],
                
                "isAce": true,
                // [AVs 解锁状态]
                // 到了 T3，通过音乐与特训，她的 Passion 已经突破界限，达到 255
                // 由于 enable_bond = true，如果灰尘山红血，玩家（如果是玩家侧）或 AI 将尝试点击绿色 EVO 按钮
                "friendship": { "trust": 150, "passion": 255, "insight": 120, "devotion": 120 }
            }
        ]
    },
    // 【Tier 4 - 为毒而狂·最后的 Live】
    4: {
        "trainerProficiency": 210,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": true,         // ✅ 摇滚精神的灵魂共鸣！
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,      // ✅ 超极巨灰尘山 & 颤弦蝾螈的舞台
            "enable_tera": false,
            "enable_proficiency_cap": true
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            // [接棒发动机 / 起点]
            {
                "name": "Scolipede", // 蜈蚣王
                "lv": 92,
                "gender": "F",
                "nature": "Jolly", 
                "ability": "Speed Boost", // 加速特性
                "item": "Focus Sash", // 气腰保证至少甚至强化一次
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: 守住(加速) -> 剑舞 -> 接棒 -> 换上暴力打手
                // 或者直接 Megahorn 杀出去
                "moves": ["Protect", "Swords Dance", "Baton Pass", "Megahorn"]
            },
            // [乐队外援 / 迦勒尔摇滚代表]
            // 为了弥补毒系打击面，也为了呼应极巨化，加入同样是摇滚风的 Toxtricity
            {
                "name": "Toxtricity", // 颤弦蝾螈 (低调样子/高调样子均可)
                "lv": 90,
                "gender": "M",
                "nature": "Timid",
                "ability": "Punk Rock", // 庞克摇滚：声音类招式威力提升 (Boomburst核弹)
                "item": "Throat Spray", // 爽喉喷雾：用声音招式加特攻
                
                "mechanic": "dynamax", // 极巨化核心之一
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 唯一的特攻爆发点
                "moves": ["Overdrive", "Sludge Wave", "Boomburst", "Shift Gear"]
            },
            // [空间特盾]
            {
                "name": "Amoonguss", // 败露球菇
                "lv": 89,
                "gender": "F",
                "nature": "Sassy", // 狂妄 (+特防 -速)
                "ability": "Regenerator", // 再生力
                "item": "Black Sludge", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 252 },
                "moves": ["Spore", "Giga Drain", "Clear Smog", "Foul Play"] // 用于清除对手的强化 (Clear Smog)
            },
            // [双刀强攻]
            {
                "name": "Seviper", // 饭匙蛇
                "lv": 88,
                "gender": "M",
                "nature": "Rash", // 马虎 (+特攻 -特防)
                "ability": "Infiltrator", // 穿透
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Poison Jab", "Flamethrower", "Earthquake", "Sucker Punch"]
            },
            // [高速游击]
            {
                "name": "Crobat", // 叉字蝠
                "lv": 88,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Infiltrator",
                "item": "Choice Band", // 专爱头带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Brave Bird", "Cross Poison", "U-turn", "Zen Headbutt"]
            },
            // [超极巨王牌 / 灵魂歌姬 (?)]
            {
                "name": "Garbodor", // 灰尘山
                "lv": 95,
                "gender": "F", // 设定上也许是雌性比较酷？
                "nature": "Adamant",
                "ability": "Weak Armor", // 碎裂铠甲：被打防降速升。配合极巨化变大后的耐久，能在挨打中变成高速怪物。
                "item": "Rocky Helmet", // 既然要挨打，那就反伤
                
                // === 机制核心 ===
                "mechanic": "dynamax", // 锁定极巨化：变身为 G-Max Garbodor
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // G-Max Malodor (恶臭毒气): 造成伤害 + 必定中毒
                // Stomping Tantrum (泄愤): 上回合招式失败威力翻倍，极巨地加防
                // Explosion (大爆炸): 极巨化变为威力150的 Max Strike，平时是退场技
                "moves": ["Gunk Shot", "Seed Bomb", "Stomping Tantrum", "Explosion"],
                
                "isAce": true,
                // [AVs] 激情 (Passion) 极高，摇滚无需多言
                "friendship": { "trust": 100, "passion": 255, "insight": 140, "devotion": 120 }
            }
        ]
    }
};

/* 
 * 角色: 奇树 (Iono)
 * 身份: 酿光道馆馆主 / 电网直播主 / 奇树奇述主播
 * 核心机制: 太晶化 (Tera: Electric) + 漂浮战术
 */
const IONO_DATA = {
    // 【Tier 1 - 没什么人看的首播】
    // Lv.25 左右，未进化，注重节目效果而非强度
    1: {
        "trainerProficiency": 45,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Wattrel", // 电海燕 (刚抓的飞行宠)
                "lv": 24,
                "gender": "F",
                "nature": "Bashful", // 害羞 (有些怯场)
                "ability": "Wind Power", 
                "stats_meta": { "ivs": { "hp": 20, "atk": 20, "def": 20, "spa": 20, "spd": 20, "spe": 20 }, "ev_level": 0 },
                "moves": ["Spark", "Peck", "Quick Attack", "Roost"]
            },
            {
                "name": "Tadbulb", // 光蚪仔 (还没进化成电灵)
                "lv": 25,
                "gender": "M",
                "nature": "Modest",
                "ability": "Static", // 静电 (因为还没完全掌握电力转换)
                "item": "Oran Berry",
                "stats_meta": { "ivs": { "hp": 25, "atk": 15, "def": 25, "spa": 25, "spd": 25, "spe": 15 }, "ev_level": 20 },
                "moves": ["Thunder Shock", "Water Gun", "Round", "Charge"]
            },
            {
                "name": "Luxio", // 勒克猫 (因为帅气所以养了)
                "lv": 25,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Intimidate", // 威吓 (唯一的亮点)
                "isAce": true, 
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 25, "spd": 25, "spe": 25 }, "ev_level": 30 },
                "moves": ["Spark", "Bite", "Thunder Wave", "Roar"]
            }
        ]
    },

    // 【Tier 2 - 崭露头角的电网偶像】
    // Lv.50，全员进化，开始构筑以“电力转换”为核心的受队雏形。
    2: {
        "trainerProficiency": 95,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Kilowattrel", // 大电海燕 (高速干扰)
                "lv": 48,
                "gender": "F",
                "nature": "Timid",
                "ability": "Volt Absorb", // 蓄电 (用来联防)
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 20, "spa": 31, "spd": 20, "spe": 31 }, "ev_level": 85 },
                "moves": ["U-turn", "Air Slash", "Electro Ball", "Roost"]
            },
            {
                "name": "Luxray", // 伦琴猫
                "lv": 49,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Intimidate", // 威吓
                "item": "Sitrus Berry",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 25, "spa": 10, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Wild Charge", "Crunch", "Ice Fang", "Thunder Wave"]
            },
            {
                "name": "Mismagius", // 梦妖魔 (新成员入队)
                "lv": 49,
                "gender": "F",
                "nature": "Timid",
                "ability": "Levitate",
                "stats_meta": { "ivs": { "hp": 25, "atk": 0, "def": 25, "spa": 31, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Magical Leaf", "Shadow Ball", "Mystical Fire", "Hex"]
            },
            {
                "name": "Bellibolt", // 电肚蛙 (招牌ACE)
                "lv": 52,
                "gender": "F",
                "nature": "Modest",
                "ability": "Electromorphosis", // 电力转换开启
                "item": "Magnet",
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Discharge", "Sucker Punch", "Wait... Sucker Punch is physical", "Muddy Water", "Slack Off"] 
                // Wait... Sucker Punch (突袭) 对 Bellibolt 是个奇怪的选择，修正为 Acid Spray (酸液炸弹)
            }
        ]
    },

    // 【Tier 3 - 百万订阅企划·太晶化初披露】
    // Lv.75，解锁太晶化。
    // 战术核心：第一次向挑战者展示"没有弱点的神奇宝可梦" (Levitate + Tera Electric)。
    3: {
        "trainerProficiency": 155,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": true,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [高速首发]
                "name": "Electrode-Hisui", // 顽皮雷弹(洗翠) 
                // 为了直播效果搞来的古代种，速度极快
                "lv": 75,
                "gender": "N",
                "nature": "Timid", 
                "ability": "Static",
                "item": "Focus Sash", // 气腰保底
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Volt Switch", "Energy Ball", "Taunt", "Thunder Wave"]
            },
            {
                // [控场手]
                "name": "Kilowattrel", 
                "lv": 74,
                "gender": "F",
                "nature": "Timid",
                "ability": "Wind Power", // 开始玩风电战术
                "item": "Sharp Beak", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Tailwind", "Thunderbolt", "Hurricane", "Roost"] // 顺风必中暴风
            },
            {
                // [物理破盾]
                "name": "Luxray",
                "lv": 74,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Guts", // 毅力 (此时还没带火珠，通常是靠蹭死状态)
                "item": "Expert Belt", // 达人带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Wild Charge", "Psychic Fangs", "Crunch", "Play Rough"]
            },
            {
                // [超级肉盾]
                "name": "Bellibolt", 
                "lv": 76, 
                "gender": "F",
                "nature": "Modest",
                "ability": "Electromorphosis",
                "item": "Leftovers", // 剩饭开始安排上
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Parabolic Charge", "Acid Spray", "Muddy Water", "Slack Off"]
            },
            {
                // [无弱点 ACE / 太晶化首秀]
                // 鬼+梦妖魔本来弱幽灵/恶，太晶电后变成电单属性，弱地面。
                // 但因为有漂浮特性，地面无效 -> 达成【无弱点】成就。
                "name": "Mismagius", 
                "lv": 78,
                "gender": "F",
                "nature": "Timid",
                "ability": "Levitate", // 核心：飘浮
                "item": "Sitrus Berry", // 文柚果保容错
                
                // === 机制核心 ===
                "mechanic": "tera",
                "teraType": "Electric", // 太晶电
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "isAce": true, // 直播中的绝对C位
                "friendship": { "trust": 120, "passion": 200, "insight": 100, "devotion": 100 },
                
                // 太晶电后，Shadow Ball 打面广，Charge Beam (充电光束) 会因为太晶STAB威力增加且加特攻
                "moves": ["Shadow Ball", "Dazzling Gleam", "Charge Beam", "Pain Split"] 
            }
        ]
    },
    // 【Tier 4 - 网络大爆炸·流量巅峰】
    4: {
        "trainerProficiency": 205,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": true,
            "enable_proficiency_cap": true
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [控场先锋]
                "name": "Kilowattrel", // 大电海燕
                "lv": 92,
                "gender": "F",
                "nature": "Timid", // 胆小 (+速)
                "ability": "Wind Power", // 风力发电 (被风打中或开顺风后充电)
                "item": "Focus Sash",    // 气腰保顺风
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术：Tailwind (顺风) + Electric Terrain (如果是隐藏特性 Competitive 就反威吓)
                // 这里利用 Wind Power，顺风后下一个电磁炮必中且威力加强
                "moves": ["Tailwind", "Thunder", "Hurricane", "Volt Switch"] 
            },
            {
                // [直播吉祥物 / 顶级耐久]
                "name": "Bellibolt", // 电肚蛙
                "lv": 94,
                "gender": "F",
                "nature": "Modest", // 内敛 
                "ability": "Electromorphosis", // 电力转换：挨打充电
                "item": "Leftovers",   // 剩饭
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "isAce": true, 
                // "谁是奇树的小可爱？当然是... Bellibolt!"
                "friendship": { "trust": 140, "passion": 255, "insight": 100, "devotion": 120 },
                
                "moves": ["Parabolic Charge", "Muddy Water", "Acid Spray", "Slack Off"] 
                // 抛物面充电 (电系吸血) 是配合特性的神技
            },
            {
                // [无弱点 ACE / 太晶化核心]
                "name": "Mismagius", // 梦妖魔
                "lv": 95,
                "gender": "F",
                "nature": "Timid", 
                "ability": "Levitate", // 飘浮：天生免疫地
                
                // === 机制核心 ===
                "mechanic": "tera",
                "teraType": "Electric", // 太晶电：只有地弱点 -> 配合飘浮 = 无弱点
                
                "item": "Wise Glasses", // 命玉或者博识眼镜
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Tera Blast (太晶爆发) 会变成单体高强本系
                "moves": ["Tera Blast", "Shadow Ball", "Dazzling Gleam", "Mystical Fire"]
            },
            {
                // [物理爆破]
                "name": "Luxray", // 伦琴猫
                "lv": 90,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Guts", // 毅力：异常状态下攻击力 x1.5
                "item": "Flame Orb", // 火焰宝珠：回合末自烧，稳定触发毅力
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Facade", "Wild Charge", "Superpower", "Play Rough"] // Facade(硬撑)威力翻倍
            },
            {
                // [双刀游击 / 天气手?]
                "name": "Electivire", // 电击魔兽
                "lv": 91,
                "gender": "M",
                "nature": "Naive", // 天真
                "ability": "Motor Drive", // 电气引擎
                "item": "Expert Belt", // 达人带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Plasma Fists", "Ice Punch", "Earthquake", "Flamethrower"]
            },
            {
                // [未来悖谬 / 压轴嘉宾]
                "name": "Iron Hands", // 铁臂膀
                "lv": 90,
                "gender": "N",
                "nature": "Adamant", // 固执
                // Quark Drive 需要夸克充能 (电场或驱劲能量)
                "ability": "Quark Drive",
                "item": "Booster Energy", // 驱劲能量：上场自动触发特性 (物攻+30%)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Drain Punch", "Thunder Punch", "Heavy Slam", "Fake Out"] // 下马威控场
            }
        ]
    }
};


/* 
 * 角色: 莉佳 (Erika)
 * 身份: 玉虹市道馆馆主 / 自负的自然爱好者
 * 核心机制: Mega进化 +心眼 (Insight) — 在花香中迷失方向吧。
 */
const ERIKA_DATA = {
    // 【Tier 1 - 茶室里的插花课】
    // Lv.25，未进化，撒粉干扰为主的初级课程。
    1: {
        "trainerProficiency": 55,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false, // T1 还是睁着眼睛打的
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Oddish", // 走路草
                "lv": 24,
                "gender": "F",
                "nature": "Calm",
                "ability": "Chlorophyll",
                "stats_meta": { "ivs": { "hp": 15, "atk": 15, "def": 15, "spa": 15, "spd": 15, "spe": 15 }, "ev_level": 0 },
                "moves": ["Absorb", "Acid", "Sleep Powder", "Mega Drain"]
            },
            {
                "name": "Bellsprout", // 喇叭芽
                "lv": 24,
                "gender": "F",
                "nature": "Modest",
                "ability": "Chlorophyll",
                "stats_meta": { "ivs": { "hp": 20, "atk": 20, "def": 20, "spa": 20, "spd": 20, "spe": 20 }, "ev_level": 0 },
                "moves": ["Vine Whip", "Growth", "Wrap", "Poison Powder"]
            },
            {
                "name": "Tangela", // 蔓藤怪
                "lv": 25, // Ace
                "gender": "F",
                "nature": "Bold",
                "ability": "Regenerator", // 再生力
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 25, "spd": 25, "spe": 25 }, "ev_level": 10 },
                "moves": ["Mega Drain", "Bind", "Stun Spore", "Leech Seed"]
            }
        ]
    },

    // 【Tier 2 - 盛开的御苑】
    // Lv.50，进化型，晴天轴初步启动。
    2: {
        "trainerProficiency": 105,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false, // T2 还没进入冥想状态
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Jumpluff", // 毽子棉 (高速干扰首发)
                "lv": 48,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Chlorophyll",
                "stats_meta": { "ivs": { "hp": 31, "atk": 20, "def": 20, "spa": 10, "spd": 20, "spe": 31 }, "ev_level": 85 },
                "moves": ["Sleep Powder", "U-turn", "Acrobatics", "Leech Seed"]
            },
            {
                "name": "Vileplume", // 霸王花 (晴天手)
                "lv": 49,
                "gender": "F",
                "nature": "Modest",
                "ability": "Chlorophyll",
                "item": "Heat Rock", // 晴天岩石
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 25, "spa": 31, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Solar Beam", "Sludge Bomb", "Moonlight", "Sunny Day"]
            },
            {
                "name": "Tangrowth", // 巨蔓藤
                "lv": 49,
                "gender": "F",
                "nature": "Relaxed",
                "ability": "Regenerator", // 轮转回复
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 20 }, "ev_level": 85 },
                "moves": ["Giga Drain", "Knock Off", "Earthquake", "Ancient Power"] // 打击面覆盖火/飞
            },
            {
                "name": "Venusaur", // 妙蛙花 (普通Ace)
                "lv": 50,
                "gender": "F",
                "nature": "Modest",
                "ability": "Chlorophyll",
                "item": "Miracle Seed",
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Giga Drain", "Sludge Bomb", "Earth Power", "Growth"]
            }
        ]
    },

    // 【Tier 3 - 沉醉的花粉香】
    // Lv.70，全员恶人，催眠粉/蝶舞强化，Mega进化解禁（T3）。
    3: {
        "trainerProficiency": 165,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false, // 依旧未开启心眼
            "enable_mega": true,     // ✅ T3 解锁 Mega，作为过渡
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                "name": "Victreebel", // 大食花 (双刀破盾)
                "lv": 73,
                "gender": "F",
                "nature": "Naughty", // 顽皮 (+攻 -特防)
                "ability": "Chlorophyll",
                "item": "Life Orb",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Leaf Blade", "Sludge Bomb", "Sucker Punch", "Weather Ball"]
            },
            {
                "name": "Bellossom", // 美丽花 (强化点/接棒终点)
                "lv": 74,
                "gender": "F",
                "nature": "Modest",
                "ability": "Chlorophyll",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Quiver Dance", "Giga Drain", "Moonblast", "Strength Sap"]
            },
            {
                "name": "Tangrowth", 
                "lv": 74,
                "gender": "F",
                "nature": "Sassy",
                "ability": "Regenerator",
                "item": "Assault Vest", // 突击背心
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Power Whip", "Knock Off", "Earthquake", "Sludge Bomb"]
            },
            // Venusaur 这里是 Mega 位
            {
                "name": "Venusaur", 
                "lv": 76,
                "gender": "F",
                "nature": "Modest",
                "ability": "Chlorophyll", // 没变之前是叶绿素
                "item": "Venusaurite",
                "mechanic": "mega",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Giga Drain", "Sludge Bomb", "Target", "Synthesis"] // Target换成具体伤害技
            },
            {
                "name": "Vileplume",
                "lv": 72,
                "gender": "F",
                "nature": "Bold",
                "ability": "Effect Spore",
                "item": "Black Sludge",
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Giga Drain", "Sludge Bomb", "Strength Sap", "Sleep Powder"]
            }
        ]
    },

    // 【Tier 4 - 永恒的梦境与腐殖土 · 心眼全开】
    // Lv.85+，顶级恶心配置。Mega 妙蛙花 + 再生力巨蔓藤。
    // 核心特色：开启 enable_insight。
    4: {
        "trainerProficiency": 215,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true,      // ✅ 核心：花道的心眼，闪避率提升！
            "enable_mega": true,         // ✅ 保留 Mega
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [晴天启动机 / 睡杀先锋]
                "name": "Jumpluff", // 毽子棉
                "lv": 88,
                "gender": "F",
                "nature": "Jolly", 
                "ability": "Infiltrator", // 穿透替身，防止对面想用替身挡催眠
                "item": "Focus Sash", // 气腰，保证至少能撒一次粉或开一次天气
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: 开启 Sunny Day 激活队友叶绿素，或者 Sleep Powder 逼换
                "moves": ["Sleep Powder", "Strength Sap", "U-turn", "Sunny Day"]
            },
            {
                // [绝对堡垒 / Mega 王牌]
                "name": "Venusaur", // 进化后名字变成 Venusaur-Mega
                "lv": 90,
                "gender": "F",
                "nature": "Bold", // 大胆（耐久向）
                "ability": "Chlorophyll", // Mega 后变成 Thick Fat (厚脂肪)，减半火/冰两大弱点
                "item": "Venusaurite",
                "mechanic": "mega",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 技能配置: 纯消耗，打不动
                "moves": ["Giga Drain", "Sludge Bomb", "Synthesis", "Leech Seed"],
                
                "isAce": true, 
                // [AVs Limit Break]
                // 开启 Insight (>200) 后，配合厚脂肪，简直就是不死的存在
                // 敌方的命中率修正为 战术上的下降
                "friendship": { "trust": 160, "passion": 100, "insight": 255, "devotion": 120 }
            },
            {
                // [物理铜墙]
                "name": "Tangrowth", 
                "lv": 89,
                "gender": "F",
                "nature": "Relaxed", 
                "ability": "Regenerator", // 强大的中转
                "item": "Rocky Helmet", // 凸凸头盔
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 252 },
                
                // 拥有觉醒火(这里用Incinerate/HP Fire逻辑)用于打钢
                // 如果没有觉火可以用 Earthquake
                "moves": ["Giga Drain", "Knock Off", "Earthquake", "Sleep Powder"] 
            },
            {
                // [双刀游击]
                "name": "Victreebel", 
                "lv": 88,
                "gender": "F",
                "nature": "Naughty", 
                "ability": "Chlorophyll", 
                "item": "Life Orb",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 天气球 (Weather Ball) 在晴天下变 100 威力火系招式 >> 很好的补盲
                "moves": ["Leaf Blade", "Sludge Bomb", "Weather Ball", "Sucker Punch"]
            },
            {
                // [特殊强化推队]
                "name": "Bellossom", 
                "lv": 88,
                "gender": "F",
                "nature": "Modest", 
                "ability": "Chlorophyll", 
                "item": "Leftovers", // 或者 Kee Berry
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 蝶舞强化 + 月亮之力补盲
                "moves": ["Quiver Dance", "Moonblast", "Energy Ball", "Safeguard"] 
            },
            {
                // [猛毒控场]
                "name": "Vileplume", 
                "lv": 88,
                "gender": "F",
                "nature": "Calm", // +特防
                "ability": "Effect Spore", // 上异常状态的神技
                "item": "Black Sludge",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 猛毒/吸取力量
                "moves": ["Strength Sap", "Moonblast", "Sludge Bomb", "Aromatherapy"] 
            }
        ]
    }
};

/* 
 * 馆主: 露璃娜 (Nessa)
 * 属性: 水 (Water)
 * 风格: 激流超模 / 雨天猛攻
 * 难度曲线: T1 (业余) -> T4 (超模/极诣)
 */
const NESSA_DATA = {
    // 【Tier 1 - 泳池水枪战】
    // Lv.25，可爱风格，用来教属性相克
    1: {
        "trainerProficiency": 50,
        "unlocks": { 
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Goldeen", // 角金鱼
                "lv": 24, "gender": "F", "nature": "Naughty",
                "ability": "Water Veil", 
                "stats_meta": { "ivs": { "hp":15,"atk":15,"def":15,"spa":15,"spd":15,"spe":15 }, "ev_level": 5 },
                "moves": ["Water Pulse", "Horn Attack", "Supersonic", "Rain Dance"]
            },
            {
                "name": "Arrokuda", // 刺梭鱼
                "lv": 25, "gender": "M", "nature": "Hasty",
                "ability": "Swift Swim", 
                "stats_meta": { "ivs": { "hp":20,"atk":20,"def":20,"spa":20,"spd":20,"spe":20 }, "ev_level": 5 },
                "moves": ["Aqua Jet", "Bite", "Fury Attack", "Laser Focus"]
            },
            {
                "name": "Chewtle", // 咬咬龟 (Ace)
                "lv": 26, "gender": "M", "nature": "Adamant",
                "ability": "Strong Jaw", 
                "isAce": true,
                "stats_meta": { "ivs": { "hp":25,"atk":25,"def":25,"spa":25,"spd":25,"spe":25 }, "ev_level": 30 },
                "moves": ["Water Gun", "Bite", "Headbutt", "Protect"]
            }
        ]
    },

    // 【Tier 2 - 时尚大片拍摄现场】
    // Lv.50，雨天初现，暴噬龟进化，速度开始提起来了
    2: {
        "trainerProficiency": 100,
        "unlocks": { 
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Pelipper", // 大嘴鸥 (降雨起点)
                "lv": 48, "gender": "M", "nature": "Modest",
                "ability": "Drizzle", // 降雨!
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":25,"spa":31,"spd":25,"spe":31 }, "ev_level": 85 },
                "moves": ["Scald", "Hurricane", "Water Pulse", "Roost"]
            },
            {
                "name": "Barraskewda", // 斗尖梭 (雨天子弹)
                "lv": 49, "gender": "F", "nature": "Adamant",
                "ability": "Swift Swim",
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":20,"spa":10,"spd":20,"spe":31 }, "ev_level": 120 },
                "moves": ["Liquidation", "Aqua Jet", "Bite", "Flip Turn"]
            },
            {
                "name": "Araquanid", // 滴蛛霸
                "lv": 49, "gender": "F", "nature": "Adamant",
                "ability": "Water Bubble",
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":25,"spa":10,"spd":25,"spe":20 }, "ev_level": 85 },
                "moves": ["Liquidation", "Bug Bite", "Crunch", "Mirror Coat"]
            },
            {
                "name": "Drednaw", // 暴噬龟 (GMAX 可能)
                "lv": 52, "gender": "M", "nature": "Adamant",
                "ability": "Strong Jaw",
                "mechanic": "dynamax", // 极巨化核心
                "item": "Hard Stone", 
                "isAce": true, 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 180 },
                "moves": ["Razor Shell", "Rock Tomb", "Jaw Lock", "Crunch"]
            }
        ]
    },

    // 【Tier 3 - 海洋广告代言】
    // Lv.75，完备雨天队，也是对战塔水准
    3: {
        "trainerProficiency": 160,
        "unlocks": { 
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                "name": "Pelipper",
                "lv": 75, "gender": "F", "nature": "Modest",
                "ability": "Drizzle",
                "item": "Damp Rock", // 8回合雨天
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 180 },
                "moves": ["Hurricane", "Hydro Pump", "U-turn", "Roost"]
            },
            {
                "name": "Ludicolo", // 乐天河童 (新面孔，雨天特攻手)
                "lv": 74, "gender": "M", "nature": "Modest",
                "ability": "Swift Swim", 
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Hydro Pump", "Giga Drain", "Ice Beam", "Rain Dance"]
            },
            {
                "name": "Golisopod", // 具甲武者
                "lv": 76, "gender": "M", "nature": "Adamant",
                "ability": "Emergency Exit",
                "item": "Sitrus Berry", 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 180 },
                "moves": ["First Impression", "Liquidation", "Aqua Jet", "Sucker Punch"]
            },
            {
                "name": "Drednaw", 
                "lv": 78, "gender": "M", "nature": "Adamant",
                "mechanic": "dynamax", // G-Max
                "ability": "Swift Swim", // 雨天加速+GMAX
                "item": "White Herb", 
                "isAce": true,
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Liquidation", "Stone Edge", "Superpower", "Swords Dance"]
            },
            { /* 5th - Seaking/Lanturn 可放这里 */ 
                "name": "Toxapex",
                "lv": 73, "gender": "F", "nature": "Bold", "ability": "Regenerator", "item": "Black Sludge",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                "moves": ["Scald", "Recover", "Haze", "Toxic"]
            }
        ]
    },

    // 【Tier 4 - 惊涛骸浪·冠军杯全开】
    // Lv.85+，顶级控速强攻受，极巨化全开
    4: {
        "trainerProficiency": 210,
        "unlocks": { 
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [控场手 / 雨天核心]
                "name": "Pelipper",
                "lv": 88,
                "gender": "F",
                "nature": "Bold", // 转为物防，毕竟岩崩多
                "ability": "Drizzle",
                "item": "Damp Rock",
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Scald", "Hurricane", "U-turn", "Roost"] // 后手U-turn让出安全上场位
            },
            {
                // [雨天刺客]
                "name": "Barraskewda", 
                "lv": 89,
                "gender": "M",
                "nature": "Adamant", // 在雨旗下速度已足够，固执修威力
                "ability": "Swift Swim", 
                "item": "Choice Band", // 专爱头带：确一力度
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Liquidation", "Close Combat", "Psychic Fangs", "Flip Turn"]
            },
            {
                // [首发/反先制]
                "name": "Golisopod",
                "lv": 88,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Emergency Exit",
                "item": "Assault Vest", // 突击背心
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["First Impression", "Aqua Jet", "Leech Life", "Close Combat"]
            },
            {
                // [超极巨王牌 / 控场]
                // 只有小优和她能完美利用极巨化
                "name": "Drednaw", 
                "lv": 90,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Swift Swim", // 如果场面有雨，极巨暴噬龟将快过所有人
                
                "mechanic": "dynamax", // G-Max Stonesurge
                "item": "Life Orb", 
                
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Liquidation", "Stone Edge", "Superpower", "Ice Fang"],
                // G-Max Stonesurge: 攻击同时撒下 "隐形岩" 并且是水系大招，配合雨天伤害加倍
                
                "isAce": true, 
                "friendship": { "trust": 140, "passion": 180, "insight": 100, "devotion": 120 }
            },
            {
                // [功能性联防]
                "name": "Seaking", // 金鱼王
                "lv": 85,
                "gender": "F",
                "nature": "Careful", 
                "ability": "Lightning Rod", // 避雷针：完美联防雨天队的电系弱点
                "item": "Leftovers", 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Waterfall", "Knock Off", "Drill Run", "Horn Drill"] // 角钻 (Horn Drill) 是最后的惊喜
            },
            {
                // [最后一道防线]
                "name": "Toxapex",
                "lv": 86,
                "gender": "F",
                "nature": "Bold",
                "ability": "Regenerator", 
                "item": "Black Sludge", 
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":0 }, "ev_level": 252 },
                "moves": ["Scald", "Recover", "Haze", "Toxic Spikes"] // 剧毒钉折磨
            }
        ]
    }
};


/* 
 * 馆主: 玛俐 (Marnie)
 * 属性: 恶 (Dark)
 * 风格: 酷妹偶像 / 恶作剧开墙 + 极巨爆发
 */
const MARNIE_DATA = {
        // 【Tier 1 - 旷野地带初遭遇】
    // Lv.24-26，刚获得莫鲁贝不久，配招和努力值都很基础
    1: {
        "trainerProficiency": 55,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Croagunk", // 不良蛙
                "lv": 24,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Dry Skin", // 干燥皮肤 (防一手水系技能)
                "stats_meta": { "ivs": { "hp": 20, "atk": 20, "def": 20, "spa": 20, "spd": 20, "spe": 20 }, "ev_level": 20 },
                "moves": ["Poison Sting", "Revenge", "Sucker Punch", "Venoshock"]
            },
            {
                "name": "Scraggy", // 滑滑小子
                "lv": 24,
                "gender": "M",
                "nature": "Impish",
                "ability": "Shed Skin",
                "item": "Eviolite", // 既然是富家大小姐，这种道具还是拿得到的
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 25, "spd": 25, "spe": 25 }, "ev_level": 40 },
                "moves": ["Headbutt", "Brick Break", "Payback", "Work Up"]
            },
            {
                // [招牌]
                "name": "Morpeko", // 莫鲁贝可
                "lv": 26,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Hunger Switch", // 即使低等级，气场轮的威力也不容小觑
                "item": "Oran Berry",
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 25, "spd": 25, "spe": 25 }, "ev_level": 50 },
                "moves": ["Aura Wheel", "Bite", "Quick Attack", "Protect"] // 利用 Protect 让饱腹感/空腹感切换
            }
        ]
    },
    // 【Tier 2 - 尖钉镇的试练】
    // Lv.48-52，队伍除了Grimmsnarl还未进化完全，其他已经基本成型
    2: {
        "trainerProficiency": 105,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Liepard", // 酷豹
                "lv": 48,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Prankster", // 恶作剧之心开始恶心人
                "stats_meta": { "ivs": { "hp": 31, "atk": 25, "def": 25, "spa": 10, "spd": 25, "spe": 31 }, "ev_level": 120 },
                "moves": ["Fake Out", "Torment", "Sucker Punch", "U-turn"] // Torment 折磨
            },
            {
                "name": "Toxicroak", // 毒骷蛙
                "lv": 49,
                "gender": "M",
                "nature": "Jolly",
                "stats_meta": { "ivs": { "hp": 25, "atk": 31, "def": 25, "spa": 25, "spd": 25, "spe": 31 }, "ev_level": 85 },
                "moves": ["Poison Jab", "Drain Punch", "Sucker Punch", "Venoshock"]
            },
            {
                "name": "Scrafty", // 头巾混混
                "lv": 49,
                "gender": "M",
                "nature": "Careful",
                "ability": "Intimidate", // 威吓耐久流
                "item": "Sitrus Berry",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 20, "spd": 31, "spe": 20 }, "ev_level": 120 },
                "moves": ["Brick Break", "Crunch", "Ice Punch", "Headbutt"]
            },
            {
                "name": "Morpeko",
                "lv": 51,
                "gender": "F",
                "nature": "Jolly",
                "item": "Silk Scarf", // 丝绸围铿 加强普通系招式（如果带电光一闪）或者磁铁
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                // 气场轮变成 110 威力，这个阶段很痛
                "moves": ["Aura Wheel", "Crunch", "Seed Bomb", "Quick Attack"]
            }
        ]
    },
    // 【Tier 3 - 冠军杯准决赛 · 极巨首秀】
    // Lv.75，解锁 `enable_dynamax`，这是她在这一代最经典的配置。
    3: {
        "trainerProficiency": 165,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                "name": "Liepard",
                "lv": 73,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Prankster",
                "item": "Light Clay", // 光之黏土 -> 这里也许不合适，因为它不开墙
                "item": "Focus Sash", // 确保能恶心到人
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 击掌奇袭 + 挑衅 + 假哭 + 咬碎
                "moves": ["Fake Out", "Taunt", "Sucker Punch", "Play Rough"]
            },
            {
                "name": "Toxicroak",
                "lv": 74,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Dry Skin",
                "item": "Black Sludge", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Sludge Bomb", "Drain Punch", "Nasty Plot", "Vacuum Wave"] // 阴险的特攻毒骷蛙？或者双刀
            },
            {
                "name": "Scrafty",
                "lv": 74,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Moxie", // 自信过剩：如果给它收割了残血，后果很严重
                "item": "Assault Vest",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 20, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Close Combat", "Crunch", "Ice Punch", "Poison Jab"]
            },
            {
                "name": "Morpeko",
                "lv": 75,
                "gender": "F",
                "nature": "Jolly",
                "item": "Choice Band", // 专爱头带：纯粹的速度与威力
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 200 },
                "moves": ["Aura Wheel", "Psychic Fangs", "Seed Bomb", "Parting Shot"]
            },
            {
                // [真正的 Ace / G-Max核心]
                "name": "Grimmsnarl",  
                "lv": 76,
                "gender": "M",
                "nature": "Impish",
                "ability": "Prankster",
                "item": "Leftovers", // 剩饭
                
                // === 机制核心 ===
                "mechanic": "dynamax", // G-Max
                
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 20, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Spirit Break (灵魂冲击) 降特攻 + Confide (密语) 进一步削弱
                // 变身后 G-Max Snooze 控场
                "moves": ["Spirit Break", "Darkest Lariat", "Bulk Up", "Play Rough"]
            }
        ]
    },
    // 【Tier 4 - 为了尖钉镇，赌上一切的安可】
    4: {
        "trainerProficiency": 220,
        // ==============================================================
        // [Tier Specific Unlocks]
        // ==============================================================
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },

        // ==============================================================
        // [Party Data]
        // ==============================================================
        "party": [
            {
                // [开墙先锋 / G-Max 领衔]
                "name": "Grimmsnarl",  
                "lv": 95,
                "gender": "M",
                "nature": "Adamant", // 固执
                // 虽然恶作剧之心开墙很经典，但如果要打极巨化输出，这种配置更凶
                "ability": "Prankster", 
                "item": "Leftovers",   // 剩饭续航
                
                // === 机制核心 ===
                "mechanic": "dynamax", // 超极巨长毛巨魔
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // G-Max Snooze (打瞌睡)：伤害+50%几率让对手睡着。
                // 没变身前 Spirit Break(灵魂冲击) 降特攻，Thunder Wave 控速
                "moves": ["Spirit Break", "Darkest Lariat", "Thunder Wave", "Bulk Up"],
                
                "isAce": true,
                "friendship": { "trust": 180, "passion": 200, "insight": 140, "devotion": 120 }
            },
            {
                // [可爱又迷人的反派角色]
                "name": "Morpeko", 
                "lv": 92,
                "gender": "F",
                "nature": "Jolly", // 爽朗 (极速)
                "ability": "Hunger Switch", // 饿了么
                "item": "Focus Sash", // 气腰 (作为脆皮的保险)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Aura Wheel (气场轮): 威力110，速度+1，还会变属性。神技。
                "moves": ["Aura Wheel", "Psychic Fangs", "Seed Bomb", "Protect"]
            },
            {
                // [硬汉拦路]
                "name": "Obstagoon", // 堵拦熊
                "lv": 90,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Guts", // 毅力：典型的火珠流
                "item": "Flame Orb", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // Facade(硬撑) 威力翻倍 + STAB；Obstruct(拦堵) 安全火珠触发 + 降对手防御
                "moves": ["Facade", "Knock Off", "Obstruct", "Close Combat"]
            },
            {
                // [龙舞推手]
                "name": "Scrafty", // 头巾混混
                "lv": 90,
                "gender": "M",
                "nature": "Careful", // 慎重
                "ability": "Shed Skin", // 蜕皮：配合睡觉
                "item": "Chesto Berry", // 睡醒果
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 龙舞强化后，吸取拳续航
                "moves": ["Dragon Dance", "Drain Punch", "Crunch", "Rest"]
            },
            {
                // [雨天与毒的克星]
                "name": "Toxicroak", // 毒骷蛙
                "lv": 88,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Dry Skin", // 干燥皮肤：完全免疫水系，还回血
                "item": "Life Orb", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Gunk Shot", "Drain Punch", "Sucker Punch", "Swords Dance"]
            },
            {
                // [恶作剧干扰]
                "name": "Liepard", // 酷豹
                "lv": 88,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Prankster", 
                "item": "Eject Button", // 逃脱按键 (配合恶作剧先手) 或者 Lagging Tailx戏法
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Copycat (仿效) + Encore (再来一次) 很脏
                "moves": ["Encore", "Thunder Wave", "Foul Play", "U-turn"]
            }
        ]
    }
};
/* 
 * 角色: 阿塞萝拉 (Acerola)
 * 身份: 阿罗拉四天王 / S区旧街区的老大 / 古代王室末裔
 * 核心机制: Z招式 (幽灵Z) + 画皮 (Disguise) + 诅咒消耗
 * "来我的图书馆玩吧？大家（幽灵们）都说饿了……"
 */
const ACEROLA_DATA = {
    // 【Tier 1 - 深夜的捉迷藏】
    // Lv.24-26，由未进化的可爱幽灵组成，主打异常状态干扰。
    1: {
        "trainerProficiency": 60,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Drifloon", // 飘飘球
                "lv": 24, 
                "gender": "F", 
                "nature": "Modest",
                "ability": "Unburden", // 轻装：这是个变速点
                "item": "Oran Berry",  // 吃掉果子速度翻倍
                "stats_meta": { "ivs": { "hp":20,"atk":0,"def":20,"spa":20,"spd":20,"spe":20 }, "ev_level": 10 },
                "moves": ["Gust", "Astonish", "Payback", "Focus Energy"]
            },
            {
                "name": "Shuppet", // 怨影娃娃
                "lv": 24, 
                "gender": "F", 
                "nature": "Adamant",
                "ability": "Insomnia", // 不眠
                "stats_meta": { "ivs": { "hp":20,"atk":25,"def":20,"spa":10,"spd":20,"spe":20 }, "ev_level": 10 },
                "moves": ["Shadow Sneak", "Will-O-Wisp", "Knock Off", "Screech"] // 鬼火是一种折磨
            },
            {
                "name": "Sandygast", // 沙丘娃 (ACE 雏形)
                "lv": 26, 
                "gender": "F", 
                "nature": "Quiet",
                "ability": "Water Compaction", // 遇水凝固是一开始就有的
                "isAce": true,
                "stats_meta": { "ivs": { "hp":25,"atk":25,"def":25,"spa":25,"spd":25,"spe":20 }, "ev_level": 30 },
                "moves": ["Mega Drain", "Sand Tomb", "Bulldoze", "Astonish"]
            }
        ]
    },
    // 【Tier 2 - 废弃大厦的传闻】
    // Lv.48-52，4只队伍，开始出现诅咒娃娃和随风球的完全体能力。
    2: {
        "trainerProficiency": 110,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Froslass", // 雪妖女 (在T2是非常快的一速干扰)
                "lv": 48, 
                "gender": "F", 
                "nature": "Timid",
                "ability": "Snow Cloak",
                "item": "Never-Melt Ice", // 不融冰
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":25,"spa":31,"spd":25,"spe":31 }, "ev_level": 85 },
                "moves": ["Ice Beam", "Shadow Ball", "Confuse Ray", "Ominous Wind"]
            },
            {
                "name": "Banette", // 诅咒娃娃 (物理端)
                "lv": 49, 
                "gender": "M", 
                "nature": "Adamant",
                "ability": "Insomnia",
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":25,"spa":10,"spd":25,"spe":31 }, "ev_level": 85 },
                "moves": ["Shadow Claw", "Sucker Punch", "Will-O-Wisp", "Curse"]
            },
            {
                "name": "Drifblim", // 随风球 (高HP特攻)
                "lv": 49, 
                "gender": "F", 
                "nature": "Calm",
                "ability": "Aftermath", // 引爆：被打倒会炸伤对手
                "item": "Sitrus Berry", 
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":25,"spa":31,"spd":25,"spe":25 }, "ev_level": 120 },
                "moves": ["Shadow Ball", "Gust", "Hex", "Stockpile"]
            },
            {
                "name": "Palossand", // 噬沙堡爷 (ACE)
                "lv": 52, 
                "gender": "F",
                "nature": "Modest",
                "ability": "Water Compaction",
                "isAce": true, 
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":20 }, "ev_level": 120 },
                "moves": ["Shadow Ball", "Earth Power", "Giga Drain", "Iron Defense"]
            }
        ]
    },
    // 【Tier 3 - 四天王的真正实力】
    // Lv.70+，5只队伍，新增 破破舵轮，解锁 Z 招式。风格开始变得诡异和坚硬。
    3: {
        "trainerProficiency": 170,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true,
            "enable_mega": false,
            "enable_z_move": true,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [炸弹开局]
                "name": "Drifblim", 
                "lv": 73, 
                "gender": "F", 
                "nature": "Timid",
                "ability": "Unburden", // 改为轻装
                "item": "Weakness Policy", // 只有AI敢这么玩，吃一发克制->特攻+2&速度x2
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 180 },
                "moves": ["Shadow Ball", "Thunderbolt", "Will-O-Wisp", "Destiny Bond"]
            },
            {
                // [极速干扰]
                "name": "Froslass",
                "lv": 74, 
                "gender": "F", 
                "nature": "Timid",
                "ability": "Cursed Body", // 穿透/诅咒之躯, 让对方技能被封印
                "item": "Focus Sash", // 气腰同命
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 200 },
                "moves": ["Spikes", "Ice Beam", "Shadow Ball", "Destiny Bond"]
            },
            {
                // [物理重炮]
                "name": "Dhelmise", // 破破舵轮
                "lv": 74, "gender": "N", "nature": "Adamant",
                "ability": "Steelworker", // 钢能力者 - 等于有三个本系
                "item": "Assault Vest",   // 突击背心（因为它很硬）
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":20 }, "ev_level": 252 },
                // 威力巨大的独有技
                "moves": ["Anchor Shot", "Power Whip", "Phantom Force", "Heavy Slam"]
            },
            {
                "name": "Banette",
                "lv": 74, "gender": "F", "nature": "Adamant",
                "ability": "Frisk", // 察觉
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 180 },
                "moves": ["Shadow Claw", "Sucker Punch", "Knock Off", "Will-O-Wisp"]
            },
            {
                // [Z招式王牌]
                "name": "Palossand",
                "lv": 76, 
                "gender": "F", 
                "nature": "Modest",
                "ability": "Water Compaction", // 遇水防御+2
                
                "mechanic": "zmove", // 激活 Z 招式
                "item": "Ghostium Z", // 幽灵 Z
                "isAce": true, 
                
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // Giga Drain / Shore Up (集沙) 回血
                "moves": ["Shadow Ball", "Earth Power", "Shore Up", "Teeter Dance"]
            }
        ]
    },
    // 【Tier 4 - 此世与彼世的边界】
    // Lv.85+，6只队伍，谜拟Q 入队作为绝对的救场杀手。
    // Insight 极高，闪避让人抓狂。
    4: {
        "trainerProficiency": 240,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true, 
            "enable_mega": false,
            "enable_z_move": true,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [起点与献祭] 
                "name": "Drifblim", // 随风球
                "lv": 90, "gender": "F", "nature": "Timid",
                "ability": "Unburden", // 轻装
                "item": "Electric Seed", // 假设洛迪亚环境或队友配合，或者 Psychic Seed
                "item": "Focus Sash", // 保底气腰轻装
                
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // 战术: 顺风(Tailwind) -> 鬼火(Will-O-Wisp) -> 强风(Gust)/影球
                // 高 HP，不容易被一击秒
                "moves": ["Tailwind", "Shadow Ball", "Will-O-Wisp", "Self-Destruct"]
            },
            {
                // [绝对的画皮 / 第六人机制怪]
                "name": "Mimikyu", // 谜拟Q
                "lv": 90, 
                "gender": "F", 
                "nature": "Jolly", // 爽朗 (+速)
                "ability": "Disguise", // 画皮：免费抵挡一次伤害 (即使现在扣1/8也很强)
                "item": "Life Orb",    // 命玉：增强剑舞后的斩杀力
                
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // 战术：Disguise 吃伤害 -> Swords Dance (剑舞) -> 嬉闹/影袭清场
                // 这只其实是队伍里的 隐藏ACE，非常契合 S 区那种破败布偶的氛围
                "moves": ["Swords Dance", "Play Rough", "Shadow Sneak", "Shadow Claw"]
            },
            {
                // [第三本系重坦]
                "name": "Dhelmise", // 破破舵轮
                "lv": 90, "gender": "N", "nature": "Brave", // 勇敢 (+攻 -速, 追求力度)
                "ability": "Steelworker", // 钢能力者：钢系招式威力 x1.5
                "item": "Expert Belt",    // 达人带，因为它打击面很广
                // 或者突击背心 Assualt Vest
                
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":0 }, "ev_level": 252 },
                
                // Power Whip (120草) + Anchor Shot (封锁换人) + Gyro Ball (陀螺球，因为它哪怕Lv90也很慢)
				// 新增 Poltergeist (灵骚) : 110威力幽灵本系，非常痛
                "moves": ["Poltergeist", "Anchor Shot", "Power Whip", "Synthesi s"]
            },
            {
                // [极速干扰]
                "name": "Froslass", // 雪妖女
                "lv": 90, "gender": "F", "nature": "Timid",
                "ability": "Cursed Body", // 30% 封印对手
                "item": "Colbur Berry",   // 抗恶果，防止被先制秒
                
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // Aurora Veil (极光幕)? 如果有雪天。
                // 默认选择 Spikes (撒菱) + Destiny Bond (同命) 的恶心流
                "moves": ["Ice Beam", "Shadow Ball", "Spikes", "Destiny Bond"]
            },
            {
                // [高攻刺客]
                "name": "Banette", // 诅咒娃娃 (如果不能MEGA，就用命玉强攻)
                "lv": 88, 
                "gender": "F", 
                "nature": "Adamant",
                "ability": "Cursed Body", 
                "item": "Focus Sash", // 再次强行续命
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Poltergeist", "Gunk Shot", "Sucker Punch", "Knock Off"]
                // Gunk Shot 垃圾射击：针对妖精系的毒系大招，配合 Insight 可以修正命中
            },
            {
                // [沙堡领主 / 永恒噩梦 ACE]
                "name": "Palossand", // 噬沙堡爷
                "lv": 92, 
                "gender": "F", 
                "nature": "Modest", // 内敛，追求特攻爆发
                "ability": "Water Compaction", // 遇水防御激增
                
                // === 机制核心 ===
                "mechanic": "zmove", // 幽灵Z
                "item": "Ghostium Z", 
                
                "isAce": true,
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // Shore Up (集沙): 沙暴下回复2/3，平时1/2，超强续航
                // Shadow Ball (影球) -> NEVER-ENDING NIGHTMARE
                // Earth Power (大地之力): 强力地本
                // Giga Drain (终极吸取) or Sludge Bomb (污泥炸弹): 补盲战打击水/草
                "moves": ["Shadow Ball", "Earth Power", "Shore Up", "Sludge Bomb"],
                
                // [AVs - 鬼族的共鸣]
                // 极高的 Insight (阿塞萝拉的特质) 让她和幽灵们能完美闪避
                "friendship": { "trust": 160, "passion": 140, "insight": 255, "devotion": 120 }
            }
        ]
    }
};

/* 
 * 馆主: 彩豆 (Bea)
 * 属性: 格斗 (Fighting)
 * 风格: 极真空手道 / G-Max 暴击队
 * 难度曲线: Level 1 (体验) -> Level 4 (修罗)
 */
const BEA_DATA = {
    // 【Tier 1 - 道场的早间晨练】
    // Lv.25 左右，严谨但尚未成熟
    1: {
        "trainerProficiency": 55,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Tyrogue", // 无畏小子
                "lv": 24,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Guts", // 毅力 (此时还没火珠，靠运气)
                "stats_meta": { "ivs": { "hp": 20, "atk": 25, "def": 20, "spa": 15, "spd": 20, "spe": 20 }, "ev_level": 10 },
                "moves": ["Mach Punch", "Fake Out", "Tackle", "Focus Energy"] 
            },
            {
                "name": "Pancham", // 顽皮熊猫
                "lv": 25,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Iron Fist", // 铁拳
                "item": "Muscle Band", // 肌肉羽毛
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 15, "spd": 25, "spe": 20 }, "ev_level": 20 },
                "moves": ["Comet Punch", "Circle Throw", "Karate Chop", "Work Up"]
            },
            {
                "name": "Farfetch'd-Galar", // 大葱鸭 (伽勒尔)
                "lv": 26, // 下只 Ace
                "gender": "M",
                "nature": "Brave",
                "ability": "Scrappy", // 胆量
                "item": "Leek", // 大葱
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 25, "atk": 25, "def": 25, "spa": 15, "spd": 25, "spe": 20 }, "ev_level": 40 },
                "moves": ["Rock Smash", "Peck", "Fury Cutter", "Focus Energy"]
            }
        ]
    },

    // 【Tier 2 - 黑带考核段位战】
    // Lv.50，进化完全，战术初现
    2: {
        "trainerProficiency": 110,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false, // T2 的普通道馆赛不极巨化
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Hitmontop", // 战舞郎
                "lv": 48,
                "gender": "M",
                "nature": "Impish",
                "ability": "Intimidate", // 威吓手
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 20 }, "ev_level": 85 },
                "moves": ["Fake Out", "Rapid Spin", "Close Combat", "Sucker Punch"]
            },
            {
                "name": "Pangoro", // 霸道熊猫
                "lv": 49,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Iron Fist",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 25, "spa": 10, "spd": 25, "spe": 20 }, "ev_level": 85 },
                "moves": ["Hammer Arm", "Bullet Punch", "Crunch", "Ice Punch"]
            },
            {
                "name": "Sirfetch'd", // 葱游兵
                "lv": 50,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Scrappy", 
                "item": "Leek",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 25, "spa": 10, "spd": 25, "spe": 31 }, "ev_level": 120 },
                "moves": ["Brick Break", "Poison Jab", "Leaf Blade", "Swords Dance"]
            },
            {
                "name": "Machamp", // 怪力 
                "lv": 52,
                "gender": "M",
                "nature": "Example",
                "ability": "Guts", // 毅力 - 还未携带火珠，靠对面施舍异常
                "item": "Sitrus Berry", 
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Cross Chop", "Bullet Punch", "Ice Punch", "Knock Off"]
            }
        ]
    },

    // 【Tier 3 - 不败的极诣门槛】
    // Lv.70+，解锁极巨化。这时候她已经是一般人无法战胜的格斗大师。
    3: {
        "trainerProficiency": 170,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                "name": "Falinks", // 列阵兵
                "lv": 73,
                "gender": "N",
                "nature": "Jolly",
                "ability": "Defiant", // 不服输
                "item": "Sitrus Berry",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["No Retreat", "Close Combat", "Iron Head", "Throat Chop"] // 背水一战
            },
            {
                "name": "Grapploct", // 八爪武师
                "lv": 74,
                "gender": "M",
                "nature": "Careful",
                "ability": "Technician",
                "item": "Leftovers", 
                // 八爪固定 (Octolock)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 20 }, "ev_level": 180 },
                "moves": ["Octolock", "Drain Punch", "Sucker Punch", "Protect"]
            },
            {
                "name": "Hawlucha", // 摔角鹰人
                "lv": 75,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Unburden", // 轻装
                "item": "White Herb", // 配合近身战解Debuff触发轻装
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Close Combat", "Acrobatics", "Poison Jab", "Swords Dance"]
            },
            {
                // [极巨化王牌]
                "name": "Machamp", 
                "lv": 78,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Guts", 
                "item": "Flame Orb", // 火珠
                
                "mechanic": "dynamax", // G-Max
                
                "isAce": true, 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Facade", "Close Combat", "Thunder Punch", "Bullet Punch"], // G-Max Chi Strike (会心流)
                "friendship": { "trust": 160, "passion": 180, "insight": 100, "devotion": 120 }
            }
        ]
    },

    // 【Tier 4 - 修罗之道 · Boss 降临】
    // Lv.85+，Second Wind 全面释放，G-Max 破坏力拉满。
    4: {
        "trainerProficiency": 225,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,      // ✅ 力量的极致体验
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [控制坦克]
                "name": "Grapploct", 
                "lv": 88, 
                "gender": "M",
                "nature": "Careful", 
                "ability": "Limber", 
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Octolock", "Protect", "Drain Punch", "Sucker Punch"]
            },
            {
                // [破盾重锤]
                "name": "Pangoro",
                "lv": 89,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Scrappy", // 胆量：格斗打鬼，解决最大盲点
                "item": "Choice Band", // 专爱头带
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Gunk Shot", "Close Combat", "Knock Off", "Bullet Punch"]
            },
            {
                // [会心神话]
                "name": "Sirfetch'd", 
                "lv": 90,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Scrappy", 
                "item": "Leek", // 50% 暴击率基底，待会吃了 G-Max 的 Buff 就是刀刀暴击
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Meteor Assault", "Brave Bird", "Close Combat", "Thousand Arrows (?)"] 
                // Leaf Blade 平替 First Impression
            },
            {
                // [高速爆发]
                "name": "Hawlucha", 
                "lv": 90,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Mold Breaker", // 破格
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Swords Dance", "Close Combat", "Brave Bird", "Roost"]
            },
            {
                // [背水一战]
                "name": "Falinks", 
                "lv": 87,
                "gender": "N",
                "nature": "Jolly",
                "ability": "Defiant", 
                "item": "Focus Sash", // 强行背水
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["No Retreat", "Close Combat", "Throat Chop", "Megahorn"]
            },
            {
                // [极诣王牌 / 修罗]
                "name": "Machamp", 
                "lv": 95, 
                "gender": "M",
                "nature": "Adamant",
                "ability": "Guts", // 毅力
                "item": "Flame Orb", // 火珠
                
                // === 机制核心 ===
                "mechanic": "dynamax", // G-Max Machamp
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // G-Max Chi Strike (超极巨会心一击): 攻击后全队暴击率 +1
                // 队伍里的葱游兵和这只怪力本身会非常享受这个效果
                "moves": ["Facade", "Close Combat", "Heavy Slam", "Stone Edge"],
                
                "isAce": true,
                "hasSecondWind": true, // 【BOSS 机制】: 首次致死伤害锁1血 + 全属性提升1级
                "friendship": { "trust": 100, "passion": 200, "insight": 140, "devotion": 120 }
            }
        ]
    }
};

/* 
 * 角色: 风露 (Skyla)
 * 身份: 合众吹寄道馆馆主 / A区空中物流网总指挥
 * 核心机制: 极巨化 (Max Airstream) + 精密制导 (Insight: Hurricane) + 神风攻势
 * "在3000英尺的高空，没有人能逃过我的眼睛！全速爬升！"
 */
const SKYLA_DATA = {
    // 【Tier 1 - 航校新手的初飞】
    // Lv.24-26，各种飞行幼崽，主打基础的速度压制。
    1: {
        "trainerProficiency": 65,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Pidove", // 豆豆鸽
                "lv": 24, 
                "gender": "F", 
                "nature": "Jolly", // 爽朗
                "ability": "Super Luck", // 虽然是幼崽，运气不错
                "stats_meta": { "ivs": { "hp":20,"atk":25,"def":20,"spa":10,"spd":20,"spe":25 }, "ev_level": 10 },
                "moves": ["Air Cutter", "Quick Attack", "Roost", "Detect"]
            },
            {
                "name": "Woobat", // 滚滚蝙蝠
                "lv": 24, 
                "gender": "M", 
                "nature": "Timid",
                "ability": "Unaware", // 纯朴：无视对方防御变化
                "stats_meta": { "ivs": { "hp":20,"atk":10,"def":20,"spa":25,"spd":20,"spe":25 }, "ev_level": 10 },
                "moves": ["Gust", "Confusion", "Heart Stamp", "Assurance"]
            },
            {
                "name": "Ducklett", // 鸭宝宝
                "lv": 26, 
                "gender": "F", 
                "nature": "Modest",
                "ability": "Hydration", // 在雨天解状态
                "isAce": true, 
                "stats_meta": { "ivs": { "hp":25,"atk":10,"def":20,"spa":25,"spd":25,"spe":25 }, "ev_level": 30 },
                "moves": ["Water Pulse", "Aerial Ace", "Bubble Beam", "Aqua Ring"]
            }
        ]
    },
    // 【Tier 2 - A区红土风暴的洗礼】
    // Lv.48-52，队伍开始成型，虽然脆弱但速度极快。
    2: {
        "trainerProficiency": 120,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true, 
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Swoobat", // 心蝙蝠 (简单强化流)
                "lv": 48, 
                "gender": "M", 
                "nature": "Timid",
                "ability": "Simple", // 单纯：能力变化翻倍
                "item": "Colbur Berry", // 抗恶果
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":25,"spa":31,"spd":25,"spe":31 }, "ev_level": 100 },
                "moves": ["Calm Mind", "stored Power", "Air Slash", "Roost"] // 冥想一次特攻特防+2
            },
            {
                "name": "Unfezant", // 高傲雉鸡 (暴击流)
                "lv": 49, 
                "gender": "F", 
                "nature": "Jolly",
                "ability": "Super Luck",
                "item": "Razor Claw", // 焦点镜
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":25,"spa":10,"spd":25,"spe":31 }, "ev_level": 120 },
                "moves": ["Air Cutter", "Night Slash", "Steel Wing", "Roost"]
            },
            {
                "name": "Sigilyph", // 象征鸟 (魔法防御)
                "lv": 49, 
                "gender": "F", 
                "nature": "Timid",
                "ability": "Magic Guard",
                "item": "Flame Orb", // 烧伤自己防睡眠并转移
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":25,"spa":31,"spd":25,"spe":31 }, "ev_level": 120 },
                "moves": ["Psycho Shift", "Roost", "Air Slash", "Cosmic Power"]
            },
            {
                "name": "Swanna", // 舞天鹅 (ACE)
                "lv": 52, 
                "gender": "F", 
                "nature": "Timid",
                "ability": "Big Pecks", // 健壮胸肌 (防降防)
                "item": "Sharp Beak", 
                "isAce": true, 
                "stats_meta": { "ivs": { "hp":31,"atk":20,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 200 },
                "moves": ["Hurricane", "Surf", "Tailwind", "Roost"] // 虽然没雨天，但 T2 开始尝试裸打暴风
            }
        ]
    },
    // 【Tier 3 - 超音速货运航线】
    // Lv.73-76，强力打手始祖大鸟入队，开始不讲道理的空袭。
    3: {
        "trainerProficiency": 175,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true, // ✅ 暴风命中补正
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true, // ✅ 极巨飞冲 (Speed Control)
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                "name": "Archeops", // 始祖大鸟 (自杀式先锋)
                "lv": 75, 
                "gender": "M", 
                "nature": "Jolly",
                "ability": "Defeatist", // 软弱：半血以下就要命
                "item": "Flying Gem",   // 或者是飞行石板/无道具Acrobatics策略
                // 此处用各种手段模拟杂技：如果不带道具，Acrobatics 威力110
                "item": null, 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                // 开局直接杂技+地震/岩崩，打死一个是一个
                "moves": ["Acrobatics", "Stone Edge", "Earthquake", "U-turn"]
            },
            {
                // [肉盾轰炸机]
                "name": "Mandibuzz", // 秃鹰娜
                "lv": 74, 
                "gender": "F", 
                "nature": "Impish", // 淘气 (+防)
                "ability": "Overcoat", // 防尘：无视A区沙暴
                "item": "Leftovers", 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Foul Play", "Roost", "Defog", "Toxic"]
            },
            {
                // [强行破盾]
                "name": "Braviary", // 勇士雄鹰
                "lv": 74,  
                "gender": "M", 
                "nature": "Adamant",
                "ability": "Sheer Force", // 强行：不发动特效但增伤
                "item": "Life Orb",       // 命玉不扣血
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Brave Bird", "Close Combat", "Crush Claw", "Rock Slide"]
            },
            {
                // [双重性格]
                "name": "Unfezant", // 高傲雉鸡
                "lv": 73, 
                "gender": "F", 
                "nature": "Jolly",
                "ability": "Super Luck",
                "item": "Scope Lens",
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "friendship": { "trust": 50, "passion": 100, "insight": 200, "devotion": 50 },
                "moves": ["Night Slash", "Air Cutter", "Drill Run", "Quick Attack"]
            },
            {
                // [极巨王牌]
                "name": "Swanna",
                "lv": 76, 
                "gender": "F", 
                "nature": "Timid",
                "mechanic": "dynamax", // MAX AIRSTREAM = SPEED +1
                "ability": "Hydration",
                "item": "Expert Belt",
                "isAce": true,
                "stats_meta": { "ivs": { "hp":31,"atk":20,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                // Insight 让 Hurricane (110威力) 必中
                "moves": ["Hurricane", "Hydro Pump", "Ice Beam", "Roost"]
            }
        ]
    },
    // 【Tier 4 - 万里长空的王牌飞行员】
    // Lv.88-92，即使是脆皮在她的手里也能依靠极高的速度先发制人。
    // 风露的“视力”在这里达到极致，几乎所有大威力低命中技能皆为必定命中。
    4: {
        "trainerProficiency": 225,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true, // ✅ 核心：视力6.0的精准空袭
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true, // ✅ 全员提速推队
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [神谷特攻 / 一击脱离]
                "name": "Archeops", // 始祖大鸟
                "lv": 90, 
                "gender": "M", 
                "nature": "Jolly", // 爽朗 (极速)
                "ability": "Defeatist",
                // 无道具杂技 (Acrobatics) 威力 110，配合本系 = 165 威力
                // 且因为无道具，第一击绝对比有道具强
                "item": null, 
                
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // 必中尖石攻击 (Insight修正) + 满威力杂技 + 地震 + 急速折返
                "moves": ["Acrobatics", "Stone Edge", "Earthquake", "U-turn"]
            },
            {
                // [特攻强化刺客]
                "name": "Swoobat", // 心蝙蝠
                "lv": 88, 
                "gender": "F", 
                "nature": "Timid",
                "ability": "Simple", // 单纯：冥想一次 = 特攻特防+2
                "item": "Focus Sash", // 气腰：保证冥想成功
                
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":25,"spa":31,"spd":25,"spe":31 }, "ev_level": 252 },
                
                // 战术：抗一发-冥想-辅助力量(此时威力很大)
                "moves": ["Calm Mind", "Stored Power", "Air Slash", "Heat Wave"]
            },
            {
                // [空中装甲堡垒]
                "name": "Mandibuzz", // 秃鹰娜
                "lv": 90, 
                "gender": "F", 
                "nature": "Impish", // +防
                "ability": "Overcoat", // 防尘：无视各种粉末和天气效果
                "item": "Heavy-Duty Boots", // 厚底靴：无视隐形岩，这是飞行系内战的关键
                
                "stats_meta": { "ivs": { "hp":31,"atk":20,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // 欺诈(利用对手高物攻) + 扫除钉子 + 剧毒
                "moves": ["Foul Play", "Defog", "Toxic", "Roost"]
            },
            {
                // [对地攻击机]
                "name": "Braviary", // 勇士雄鹰
                "lv": 89, 
                "gender": "M", 
                "nature": "Adamant", // 固执
                "ability": "Sheer Force", // 强行
                "item": "Life Orb", // 命玉
                
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // 暴力拆解一切。Brave Bird 无反伤 (因强行Bug) 但威力巨大
                // 不对，Sheer Force只对带追加效果的技能生效，BB鸟不生效。
                // 修正：Crush Claw(撕裂爪) / Rock Slide(岩崩) / Zen Headbutt
                // 但 Brave Bird 依然是本系最高爆发
                "moves": ["Brave Bird", "Rock Slide", "Close Combat", "Crush Claw"]
            },
            {
                // [会心之风]
                "name": "Unfezant", // 高傲雉鸡
                "lv": 88, 
                "gender": "F", 
                "nature": "Jolly", 
                "ability": "Super Luck", 
                "item": "Scope Lens", 
                
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":0,"spd":31,"spe":31 }, "ev_level": 252 },
                // 刀刀烈火 + 高速神鸟激突 (Sky Attack) [配合道具香草? No, need scope lens]
                // 相信她的 Night Slash 和 Air Cutter 必暴
                "moves": ["Sky Attack", "Night Slash", "Steel Wing", "Quick Attack"]
            },
            {
                // [极巨化王牌 / 白鸟]
                "name": "Swanna", // 舞天鹅
                "lv": 92, 
                "gender": "F", 
                "nature": "Timid", // 胆小 +速
                
                "mechanic": "dynamax", // G-MAX 开启
                "item": "Life Orb",    // 命玉爆发
                
                "isAce": true, 
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                
                "moves": ["Hurricane", "Hydro Pump", "Ice Beam", "Roost"],
                
                // [AVs - A区的女皇]
                "friendship": { "trust": 160, "passion": 200, "insight": 255, "devotion": 120 }
            }
        ]
    }
};

/* 
 * 角色: 竹兰 (Cynthia)
 * 身份: 神奥冠军 / 乃至全世代最强的王者之一
 * 核心机制: Mega进化 + Second Wind (二阶段变身)
 */
const CYNTHIA_DATA = {
    // 【Tier 2 - 这只是热身运动】
    // Lv.60+，已经可以使用 Mega 进化了。对于其他馆主这是底牌，对她只是起手式。
    2: {
        "trainerProficiency": 180,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": true,         // ✅ T2 就可以 Mega
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [无弱点首发]
                "name": "Spiritomb", 
                "lv": 61,
                "gender": "F",
                "nature": "Quiet",
                "ability": "Pressure",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 85 },
                "moves": ["Sucker Punch", "Psychic", "Shadow Ball", "Embargo"]
            },
            {
                // [特攻爆破]
                "name": "Roserade", 
                "lv": 60,
                "gender": "F",
                "nature": "Timid",
                "ability": "Natural Cure",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 85 },
                "moves": ["Sludge Bomb", "Energy Ball", "Shadow Ball", "Extrasensory"]
            },
            {
                // [水地联防]
                "name": "Gastrodon", 
                "lv": 60,
                "gender": "F",
                "nature": "Modest",
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 85 },
                "moves": ["Muddy Water", "Earth Power", "Sludge Bomb", "Stone Edge"]
            },
            {
                // [双刀波导]
                "name": "Lucario",
                "lv": 63,
                "gender": "M",
                "nature": "Naive",
                "ability": "Inner Focus",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Aura Sphere", "Dragon Pulse", "Extreme Speed", "Close Combat"]
            },
            {
                // [特殊的肉]
                "name": "Milotic",
                "lv": 63,
                "gender": "F",
                "nature": "Bold",
                "item": "Flame Orb", // Marvel Scale
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Hydro Pump", "Ice Beam", "Mirror Coat", "Recover"]
            },
            {
                // [准神] 在 T2 还没携带 Mega 石，普通形态足够强了... 哦不，既然开启了 Mega，这里就是 Garchomp-Mega
                "name": "Garchomp",
                "lv": 66,
                "gender": "F",
                "nature": "Jolly",
                "ability": "Rough Skin",
                "item": "Garchompite", // 鲨鱼皮 -> 变身 Sand Force
                "mechanic": "mega",
                "isAce": true, 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Dragon Rush", "Earthquake", "Brick Break", "Giga Impact"]
            }
        ]
    },

    // 【Tier 3 - 世锦赛八大师】
    // Lv.80+，仍然是 Mega 核心，但全员数值大幅强化。
    3: {
        "trainerProficiency": 220,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": true,         // ✅ 依然是 Mega
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [催眠战术]
                "name": "Spiritomb",
                "lv": 80,
                "gender": "F",
                "nature": "Bold",
                "ability": "Infiltrator", 
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 0 }, "ev_level": 180 },
                // 恶心的睡梦流
                "moves": ["Dream Eater", "Dark Pulse", "Hypnosis", "Shadow Ball"] 
            },
            {
                // [天恩飞机]
                "name": "Togekiss", 
                "lv": 83,
                "gender": "M",
                "nature": "Timid",
                "ability": "Serene Grace", // 天恩
                "item": "Leftovers", // 或者弱测
                "item": "Weakness Policy",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                // 可怕的空气切畏缩 + 极巨飞冲潜力
                "moves": ["Air Slash", "Dazzling Gleam", "Aura Sphere", "Nasty Plot"]
            },
            {
                // [无弱点电免]
                "name": "Eelektross", // 麻麻鳗鱼王
                "lv": 83,
                "gender": "M",
                "nature": "Quiet",
                "item": "Assault Vest",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Wild Charge", "Flamethrower", "Giga Drain", "Dragon Claw"]
            },
            {
                // [好胜美纳斯]
                "name": "Milotic",
                "lv": 84,
                "gender": "F",
                "nature": "Bold",
                "ability": "Competitive", // 蹭威吓加特攻
                "item": "Flame Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Scald", "Recover", "Ice Beam", "Mirror Coat"]
            },
            {
                // [适应力路卡]
                "name": "Lucario",
                "lv": 84,
                "gender": "M",
                "nature": "Naive",
                "item": "Focus Sash", // 气腰保命爆发
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Close Combat", "Meteor Mash", "Extreme Speed", "Swords Dance"]
            },
            {
                // [噩梦烈咬]
                "name": "Garchomp",
                "lv": 88,
                "gender": "F",
                "nature": "Jolly",
                "mechanic": "mega",
                "item": "Garchompite",
                "isAce": true, 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 毒刺补盲打妖精 / 剑舞流
                "moves": ["Dragon Claw", "Earthquake", "Poison Jab", "Swords Dance"]
            }
        ]
    },
    4: {
        "trainerProficiency": 255,
        "unlocks": {
            "enable_bond": true,         // ✅ 激活王牌的 Second Wind 与属性修正
            "enable_styles": true,       // ✅ 补充：作为接触过神奥神话的人，她必然懂得“刚/迅”
            "enable_insight": true,      // ✅ 核心：修正所有低命中技能至必中前
            "enable_mega": true,         // ✅ 破坏神降临
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [无解首发 / 催眠陷阱]
                "name": "Spiritomb",
                "lv": 95, 
                "gender": "F",
                "nature": "Bold", // +防御
                "ability": "Infiltrator", // 穿透：无视此时玩家可能会开的替身/墙
                "item": "Kee Berry", // 受到物理攻击提升防御 (给对面一种打不动的错觉)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: Insight加持下Hypnosis几乎必中。
                // 睡掉首发 -> 临别礼物废掉对方攻击 -> 安全换人强化
                "moves": ["Hypnosis", "Memento", "Foul Play", "Will-O-Wisp"] 
            },
            {
                // [白色恶魔 / 空切地狱]
                // 道具改为【讲究围巾】，先手空切 60% 畏缩，动都动不了
                "name": "Togekiss", 
                "lv": 95,
                "gender": "M",
                "nature": "Timid", // 胆小 + 围巾 = 极速
                "ability": "Serene Grace", // 天恩
                "item": "Choice Scarf", // 🔒 讲究围巾
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "moves": ["Air Slash", "Dazzling Gleam", "Aura Sphere", "Fire Blast"] 
                // 大字爆 (Fire Blast) 即使命中只有85，在Insight加持下就是必中火系核弹
            },
            {
                // [催眠好胜 / 针对威吓]
                "name": "Milotic",
                "lv": 95,
                "gender": "F",
                "nature": "Bold",
                "ability": "Competitive", // 谁敢威吓烈咬陆鲨就切美纳斯上来+2特攻
                "item": "Leftovers",
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 依靠 Insight 随意使用水炮 (Hydro Pump) 和 暴风雪 (Blizzard)
                "moves": ["Hydro Pump", "Blizzard", "Recover", "Mirror Coat"]
            },
            {
                // [物理清场 / 节奏核心]
                "name": "Lucario",
                "lv": 96, // 等级提升
                "gender": "M",
                "nature": "Naughty", // 孤独 (+攻 -特防)，为了双刀
                "ability": "Justified", 
                "item": "Focus Sash", // 气腰：保证能剑舞一次
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 吃到临别礼物后上场 -> 剑舞 -> 子弹拳/神速清场
                // 精神强念 (Psychic) 打击格斗盲点
                "moves": ["Swords Dance", "Close Combat", "Extreme Speed", "Psychic"]
            },
            {
                // [特殊定点爆破]
                "name": "Volcarona", // 火神蛾
                "lv": 96,
                "gender": "F",
                "nature": "Modest",
                "ability": "Flame Body", 
                "item": "Heavy-Duty Boots", // 防止隐形岩
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 蝶舞强化 + 亿万吸续航
                "moves": ["Quiver Dance", "Fiery Dance", "Bug Buzz", "Giga Drain"]
            },
            {
                // [绝望的代在词 / 终焉]
                "name": "Garchomp", 
                "lv": 100, 
                "gender": "F",
                "nature": "Naughty", // 顽皮 (+攻 -特防)，双刀流性格，确保流星群威力
                
                "mechanic": "mega",
                "item": "Garchompite",
                
                "isAce": true,
                "hasSecondWind": true, // Boss 机制开关
                
                "stats_meta": { 
                    // 完美的双攻 6V
                    "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, 
                    "ev_level": { "hp": 0, "atk": 252, "def": 0, "spa": 100, "spd": 0, "spe": 158 } // 将部分努力给特攻 
                },
                
                // 配招优化：双刀针对性打击
                // 1. Earthquake: 没有任何理由换掉的本系
                // 2. Stone Edge (尖石攻击): Insight 修正后必中，打飞行的神技
                // 3. Draco Meteor (流星群): 专杀那些以为物防高就能挡烈咬陆鲨的人（比如土猫、钢鸟）
                // 4. Poison Jab (毒击): 杀妖精
                "moves": ["Earthquake", "Stone Edge", "Draco Meteor", "Poison Jab"],
                
                "friendship": { 
                    "trust": 255,   // 锁血概率 Max
                    "passion": 255, // 暴击率 Boost -> 配合Mega的高攻非常危险
                    "insight": 255, // 回避率 Max + 命中修正 Max
                    "devotion": 200 // 自愈能力
                }
            }
        ]
    }
};

/* 
 * 角色: 艾莉丝 (Iris)
 * 身份: 合众冠军 / 极诣三皇 (野性) / 龙之民
 * 核心机制: Z招式 (Dragonium Z) + 野性直觉 (修正大威力技能命中) + 双王牌压制
 * "不论什么精密的算计，在压倒性的力量面前都会粉碎！我们要上了，双斧战龙！"
 */
const IRIS_DATA = {
    // 【Tier 2 - “只是来打个招呼啦”】
    // Lv.60+，冠军强度的起手，单王牌双斧战龙。
    2: {
        "trainerProficiency": 175,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": true,       // 龙系不需要优雅，只需要迅疾/刚猛的节奏
            "enable_insight": true,      // ✅ 直觉开启：大字爆/水炮开始更加准了
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [特攻炮台]
                "name": "Hydreigon", // 三首恶龙
                "lv": 61,
                "gender": "F",
                "nature": "Modest", // 内敛
                "ability": "Levitate", 
                "item": "Wise Glasses", // 博识眼镜
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Dragon Pulse", "Dark Pulse", "Flamethrower", "Surf"]
            },
            {
                // [强力物理手]
                "name": "Druddigon", // 赤面龙
                "lv": 60,
                "gender": "F",
                "nature": "Adamant",
                "ability": "Sheer Force", // 强行
                "item": "Life Orb",       // 命玉 (经典的强行命玉流)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 20 }, "ev_level": 85 },
                "moves": ["Dragon Claw", "Fire Punch", "Thunder Punch", "Superpower"]
            },
            {
                // [高速飞行员]
                "name": "Archeops", // 始祖大鸟
                "lv": 60,
                "gender": "M",
                "nature": "Jolly",
                "ability": "Defeatist",
                "item": "Flying Gem",   // 或者是无道具
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 25, "spa": 10, "spd": 25, "spe": 31 }, "ev_level": 120 },
                "moves": ["Acrobatics", "Rock Slide", "Earthquake", "U-turn"]
            },
            {
                // [物理壁垒]
                "name": "Aggron", // 波士可多拉
                "lv": 60,
                "gender": "F",
                "nature": "Impish",
                "ability": "Rock Head", // 石头脑袋
                "item": "Hard Stone",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 20 }, "ev_level": 85 },
                "moves": ["Head Smash", "Iron Head", "Earthquake", "Autotomize"]
            },
            {
                // [特殊的龙(?)]
                "name": "Lapras", // 拉普拉斯
                "lv": 60,
                "gender": "F",
                "nature": "Modest",
                "ability": "Water Absorb",
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 85 },
                "moves": ["Ice Beam", "Hydro Pump", "Thunderbolt", "Sing"]
            },
            {
                // [王牌 ACE]
                "name": "Haxorus", // 双斧战龙
                "lv": 63,
                "gender": "F",
                "nature": "Adamant", // 固执
                "ability": "Mold Breaker", // 破格 (无视结实/漂浮)
                "item": "Focus Sash",      // 气腰保龙舞
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 120 },
                "moves": ["Dragon Dance", "Dragon Claw", "Earthquake", "Poison Jab"],
                "friendship": { "trust": 100, "passion": 150, "insight": 150, "devotion": 100 }
            }
        ]
    },

    // 【Tier 3 - “稍微拿出一点真本事咯！”】
    // Lv.80+，双王牌体系确立。三首恶龙与双斧战龙同时拥有 Ace 标识。
    3: {
        "trainerProficiency": 210,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": true,
            "enable_insight": true,      // 直觉修正大幅提升
            "enable_mega": false,
            "enable_z_move": false,      // T3暂不交Z招式
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [ACE 1 - 毁灭的特攻]
                "name": "Hydreigon",
                "lv": 82, 
                "gender": "F", 
                "nature": "Timid", // 胆小 (+速)
                "ability": "Levitate",
                "item": "Life Orb", 
                "isAce": true, // 双ACE之一
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                // 野性直觉流: 高威力，无视命中缺陷
                "moves": ["Draco Meteor", "Fire Blast", "Flash Cannon", "Surf"],
                "friendship": { "trust": 100, "passion": 150, "insight": 150, "devotion": 100 }
            },
            {
                "name": "Archeops",
                "lv": 80, "gender": "M", "nature": "Jolly",
                "item": null, // 无道具杂技
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Acrobatics", "Stone Edge", "Earthquake", "Endeavor"]
            },
            {
                "name": "Aggron", 
                "lv": 80, "gender": "F", "nature": "Adamant",
                "ability": "Rock Head", // 无伤双刃头槌
                "item": "Expert Belt",
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Head Smash", "Iron Tail", "Ice Punch", "Low Kick"] // Iron Tail 命中靠 direct
            },
            {
                "name": "Lapras",
                "lv": 80, "gender": "F", "nature": "Modest",
                "item": "Wide Lens", // 辅助一唱，或者靠Insight
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 180 },
                "moves": ["Hydro Pump", "Blizzard", "Thunder", "Sing"] // 全是大招，Insight修正
            },
            {
                "name": "Druddigon",
                "lv": 80, "gender": "F", "nature": "Adamant",
                "ability": "Rough Skin", // 蹭血
                "item": "Rocky Helmet",  // 经典的双重反伤
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Outrage", "Gunk Shot", "Superpower", "Sucker Punch"]
            },
            {
                // [ACE 2 - 龙牙斩杀]
                "name": "Haxorus", 
                "lv": 84, // 等级略高
                "gender": "F",
                "nature": "Jolly", 
                "ability": "Mold Breaker", 
                "item": "Lum Berry", // 木子果防混乱解状态
                "isAce": true,
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Dragon Dance", "Outrage", "Earthquake", "Iron Tail"],
                "friendship": { "trust": 100, "passion": 200, "insight": 200, "devotion": 100 }
            }
        ]
    },

    // 【Tier 4 - 此即为“原始的本能”！】
    // Lv.95+，全能力解禁，Z招式确认为 Haxorus 使用。
    // Insight +255，大招基本必中，暴力美学。
    4: {
        "trainerProficiency": 255, // Instinct Limit Break
        "unlocks": {
            "enable_bond": true,
            "enable_styles": true,
            "enable_insight": true,      // ✅ 直觉：所有大威力低命中技能 (流星群/大字爆/水炮/贴身冲撞) 命中率极大修正
            "enable_mega": false,
            "enable_z_move": true,       // ✅ Haxorus: Devastating Drake
            "enable_dynamax": false,
            "enable_tera": false,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [高火力特攻王牌]
                "name": "Hydreigon", // 三首恶龙
                "lv": 97, 
                "gender": "F", 
                "nature": "Timid", // 胆小 (+速)
                "ability": "Levitate",
                "item": "Life Orb", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "isAce": true,
                // Insight 使得 Draco Meteor (流星群) 和 Fire Blast (大字爆炎) 必中
                // 不计后果的狂轰滥炸
                "moves": ["Draco Meteor", "Fire Blast", "Hydro Pump", "Earth Power"],
                "friendship": { "trust": 155, "passion": 255, "insight": 200, "devotion": 120 }
            },
            {
                // [敢死队先锋]
                "name": "Archeops", // 始祖大鸟
                "lv": 95, 
                "gender": "M", 
                "nature": "Jolly", 
                
                // 气势披带 + 莽撞 (Endeavor) 针对高血量敌人
                "item": "Focus Sash", 
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Head Smash (双刃头槌) 150威力，配合 Insight 必中
                "moves": ["Head Smash", "Acrobatics", "Earthquake", "Endeavor"]
            },
            {
                // [反伤坦克]
                "name": "Druddigon", // 赤面龙
                "lv": 95, 
                "gender": "F", 
                "nature": "Adamant", 
                "ability": "Rough Skin", // 粗糙皮肤
                "item": "Rocky Helmet",  // 凸凸头盔
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // Glare (大蛇瞪眼) 控速，Sucker Punch (突袭) 收割
                "moves": ["Glare", "Gunk Shot", "Superpower", "Sucker Punch"]
            },
            {
                // [重装巨兽]
                "name": "Aggron", // 波士可多拉
                "lv": 96, 
                "gender": "F", 
                "nature": "Adamant",
                "ability": "Rock Head", // 舍身
                "item": "Assault Vest", // 突击背心 (弥补特防短板)
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Head Smash (150岩 无反伤) 简单就是力量
                "moves": ["Head Smash", "Heavy Slam", "Earthquake", "Avalanche"]
            },
            {
                // [全广角打击]
                "name": "Lapras", // 拉普拉斯
                "lv": 96, 
                "gender": "F", 
                "nature": "Modest",
                "ability": "Water Absorb",
                "item": "Expert Belt", // 达人带
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 0, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 全屏 110-120 威力的大招，这就是“野性”
                "moves": ["Hydro Pump", "Blizzard", "Thunder", "Sing"]
            },
            {
                // [究极王牌 - 你的败北无可避免]
                "name": "Haxorus", // 双斧战龙
                "lv": 98, 
                "gender": "F", 
                "nature": "Jolly", // 爽朗 (+速)
                "ability": "Mold Breaker", // 破格 (无视多鳞/漂浮/结实)
                
                // === 机制核心 ===
                "mechanic": "zmove",    // 使用Z招式
                "item": "Dragonium Z",  // 龙 Z -> 究极巨龙震天地 (Devastating Drake)
                
                "isAce": true, 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // 战术: Dragon Dance (龙舞) 一次 -> 游戏结束
                // Poison Jab (毒击) 杀妖精
                // Iron Tail (铁尾) 杀仙/岩, Insight 修正后必中
                // Outrage (逆鳞) -> 转化为 Z 招式 190 威力，不可阻挡
                "moves": ["Dragon Dance", "Outrage", "Poison Jab", "Iron Tail"],
                
                // [AVs - 龙之心的共鸣]
                "friendship": { "trust": 220, "passion": 255, "insight": 255, "devotion": 120 }
            }
        ]
    }
};

/* 
 * 角色: 妮莫 (Nemona)
 * 身份: 帕底亚冠军级 / 学生会长 / 战斗狂人
 * 核心机制: 太晶化 (Tera) + 复活战术 (Revival Blessing) + 无限连击
 * "好厉害！那就是全力吗？那我也要不受限制地上了哦！"
 */
const NEMONA_DATA = {
    // 【Tier 1 - “我也是才挑了宝可梦哦” (谎言)】
    // Lv.15，用来进行教学局的队伍，但努力值已经悄悄开始分配了。
    1: {
        "trainerProficiency": 100,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": false,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": false, 
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Rockruff", // 岩狗狗
                "lv": 14,
                "gender": "F", 
                "nature": "Jolly", 
                "ability": "Vital Spirit",
                "stats_meta": { "ivs": { "hp":25,"atk":25,"def":25,"spa":10,"spd":25,"spe":31 }, "ev_level": 50 },
                "moves": ["Rock Throw", "Bite", "Tackle", "Leer"]
            },
            {
                "name": "Pawmi", // 布拨
                "lv": 14, 
                "gender": "F", 
                "nature": "Jolly", 
                "ability": "Static",
                "stats_meta": { "ivs": { "hp":25,"atk":25,"def":20,"spa":25,"spd":20,"spe":31 }, "ev_level": 50 },
                "moves": ["Nuzzle", "Thunder Shock", "Scratch", "Quick Attack"]
            },
            {
                "name": "Smoliv", // 迷你芙
                "lv": 14, 
                "gender": "F", 
                "nature": "Modest",
                "stats_meta": { "ivs": { "hp":25,"atk":10,"def":20,"spa":31,"spd":25,"spe":20 }, "ev_level": 50 },
                "moves": ["Razor Leaf", "Tackle", "Absorb", "Sweet Scent"]
            },
            {
                "name": "Sprigatito",
                "lv": 16, 
                "gender": "F", 
                "nature": "Jolly",
                "ability": "Overgrow", 
                "item": "Oran Berry",
                "isAce": true, 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 100 },
                "moves": ["Leafage", "Scratch", "Bite", "Hone Claws"],
                "friendship": { "trust": 100, "passion": 100, "insight": 120, "devotion": 120 }
            }
        ]
    },

    // 【Tier 2 - 道馆巡回中的偶遇】
    // Lv.30，队伍进化，开始根据属性太晶化，压迫感增强。
    2: {
        "trainerProficiency": 150,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true, 
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": true,
            "enable_proficiency_cap": false
        },
        "party": [
            {
                "name": "Lycanroc", // 鬃岩狼人-白昼 (高速岩钉/冲岩)
                "lv": 29, 
                "gender": "F", 
                "nature": "Jolly", 
                "ability": "Sand Rush",
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":25,"spa":10,"spd":25,"spe":31 }, "ev_level": 150 },
                "moves": ["Accelrock", "Rock Tomb", "Stealth Rock", "Bite"]
            },
            {
                "name": "Goomy", // 黏黏宝
                "lv": 28, 
                "gender": "F", 
                "nature": "Modest",
                "item": "Eviolite", // 辉石黏黏宝很硬
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":20 }, "ev_level": 150 },
                "moves": ["Dragon Breath", "Water Pulse", "Protect", "Rain Dance"]
            },
            {
                "name": "Pawmo", // 布土拨
                "lv": 28, "gender": "F", "nature": "Adamant",
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":25,"spa":25,"spd":20,"spe":31 }, "ev_level": 150 },
                "moves": ["Spark", "Arm Thrust", "Dig", "Bite"]
            },
            {
                "name": "Orthworm", // 拖拖蚓
                "lv": 29,
                "gender": "F", 
                "nature": "Impish", 
                "ability": "Earth Eater",
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":20 }, "ev_level": 100 },
                "moves": ["Iron Head", "Bulldoze", "Wrap", "Iron Defense"]
            },
            {
                "name": "Floragato", // 蒂蕾喵 (太晶草)
                "lv": 32, "gender": "F", "nature": "Jolly",
                "mechanic": "tera",
                "teraType": "Grass",
                "item": "Miracle Seed",
                "isAce": true, 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Seed Bomb", "U-turn", "Hone Claws", "Slash"],
                "friendship": { "trust": 100, "passion": 150, "insight": 100, "devotion": 120 }
            }
        ]
    },

    // 【Tier 3 - 冠军测验的守门人】
    // Lv.60+，完全进化，队伍成型。虽然还没用外挂，但已是冠军强度。
    3: {
        "trainerProficiency": 200,
        "unlocks": {
            "enable_bond": false,
            "enable_styles": false,
            "enable_insight": true,
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": false,
            "enable_tera": true,
            "enable_proficiency_cap": true
        },
        "party": [
            {
                "name": "Lycanroc",
                "lv": 60, 
                "nature": "Jolly",
                "ability": "Sand Rush",
                "item": "Focus Sash", // 气腰保住稳定出招
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 200 },
                "moves": ["Stealth Rock", "Accelrock", "Stone Edge", "Drill Run"]
            },
            {
                "name": "Goodra", // 黏美龙
                "lv": 60, 
                "nature": "Modest", 
                "ability": "Sap Sipper",
                "item": "Leftovers",
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Dragon Pulse", "Muddy Water", "Sludge Bomb", "Ice Beam"]
            },
            {
                "name": "Orthworm", // 拖拖蚓
                "lv": 59, 
                "nature": "Impish",
                "item": "Sitrus Berry", 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":0 }, "ev_level": 252 },
                "moves": ["Heavy Slam", "Body Press", "Iron Defense", "Earthquake"]
            },
            {
                "name": "Dudunsparce", // 土龙节节
                "lv": 59, 
                "nature": "Adamant", 
                "ability": "Serene Grace", // 天恩
                "item": "Kings Rock", // 王者之证 (如果她想恶心人就会带)
                // 修正：Leftovers
                "moves": ["Hyper Drill", "Dragon Rush", "Coil", "Roost"]
            },
            {
                "name": "Pawmot", // 巴布土拨 (Ace 1)
                "lv": 60, 
                "nature": "Jolly", 
                "ability": "Iron Fist",
                "item": "Punching Glove",
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                "moves": ["Double Shock", "Close Combat", "Ice Punch", "Mach Punch"]
            },
            {
                "name": "Meowscarada", // 魔幻假面喵 (Ace 2)
                "lv": 62, 
                "gender": "F", 
                "nature": "Jolly",
                "mechanic": "tera",
                "teraType": "Grass",
                "item": "Choice Band", // 专爱头带
                "isAce": true, 
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                // 必中+必爆击，伤害简单粗暴
                "moves": ["Flower Trick", "Knock Off", "Play Rough", "U-turn"],
                "friendship": { "trust": 150, "passion": 200, "insight": 150, "devotion": 200 }
            }
        ]
    },

    // 【Tier 4 - 跨越地区的究极战斗狂】
    // Lv.95-99 | 真正意义上的全明星战队。
    // 这不是普通的冠军战，这是汇聚了帕底亚、北上乡与蓝莓学院后，完全没有限制的妮莫。
    4: {
        "trainerProficiency": 255, // Battle Genius
        "unlocks": {
            "enable_bond": false, 
            "enable_styles": true, 
            "enable_insight": true, 
            "enable_mega": false,
            "enable_z_move": false,
            "enable_dynamax": true,      // ✅ 部分队员可极巨化增加 Boss 战压迫感 (如杖尾鳞甲龙)
            "enable_tera": true,         // ✅ 太晶化：核心战术
            "enable_proficiency_cap": true
        },
        "party": [
            {
                // [撒钉起点 / 先制控速]
                "name": "Lycanroc", // 鬃岩狼人-白昼 (图中Lv.86 -> 修至95)
                "lv": 95, 
                "gender": "F", 
                "nature": "Jolly", // 极速
                "ability": "Sand Rush", // 拨沙：如果有沙暴则速度翻倍(可配队友技能) 或 Steadfast(不屈之心)
                "item": "Focus Sash",   // 气腰确保撒出钉子
                
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":10,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // Stealth Rock 后 Accelerator (冲岩) 蹭血，Endeavor (莽撞) 换掉对面通关大哥
                "moves": ["Stealth Rock", "Accelrock", "Stone Edge", "Endeavor"]
            },
            {
                // [高速虫网 / 辅助与火力]
                "name": "Ribombee", // 蝶结萌虻
                "lv": 95, 
                "gender": "F", 
                "nature": "Timid",
                "ability": "Shield Dust", 
                "item": "Focus Sash", // 也带气腰(防止首发被秒)，双腰战术在无道具规则外很常见
                
                "stats_meta": { "ivs": { "hp":31,"atk":0,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // Sticky Web (黏黏网): 降低对手全队速度，让妮莫的高速队必拿先手
                // Moonblast + Bug Buzz 也是很疼的本系
                "moves": ["Sticky Web", "Moonblast", "Bug Buzz", "Psychic"]
            },
            {
                // [极巨化ACE位置 / 准神]
                "name": "Kommo-o", // 杖尾鳞甲龙
                "lv": 97, 
                "gender": "F", 
                "nature": "Timid", // 胆小 (+速) 或 Naive 双刀
                "ability": "Soundproof", // 隔音
                "item": "Throat Spray",  // 爽喉喷雾
                
                // G-Max 其实不是它的长处，但普通的 Dynamax 也能增加它的耐久
                "mechanic": "dynamax", 
                
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // Clangorous Soul (魂舞烈音爆): 全能力+1并扣血，触发喷雾再+1特攻
                // 瞬间造神
                "moves": ["Clangorous Soul", "Clanging Scales", "Aura Sphere", "Flash Cannon"]
            },
            {
                // [万能变幻 / 高速刺客]
                "name": "Greninja", // 甲贺忍蛙 (忍住！这里是变幻自如/激流)
                "lv": 96, 
                "gender": "M", 
                "nature": "Naive", // 天真
                "ability": "Protean", // 变幻自如
                "item": "Life Orb",   // 命玉
                
                "stats_meta": { "ivs": { "hp":31,"atk":31,"def":31,"spa":31,"spd":31,"spe":31 }, "ev_level": 252 },
                
                // 高速打击多系盲点
                "moves": ["Ice Beam", "Dark Pulse", "Gunk Shot", "Hydro Pump"]
            },
            {
                // [真正的“作弊” / ACE 1]
                "name": "Pawmot", // 巴布土拨
                "lv": 98, 
                "gender": "M", // 图中是公的
                "nature": "Jolly", 
                "ability": "Iron Fist", 
                "item": "Leppa Berry", // PP果，为了多一次复活
                
                "isAce": true, // 双ACE之一
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 10, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Revival Blessing (复生祈祷): 复活队伍里倒下的王牌 (Meowscarada/Kommo-o)
                // Double Shock (电光双击): 120威力本系，无脑轰
                "moves": ["Revival Blessing", "Double Shock", "Close Combat", "Mach Punch"],
                
                // Insight让他更会闪避
                "friendship": { "trust": 255, "passion": 200, "insight": 150, "devotion": 200 }
            },
            {
                // [宿命 / ACE 2]
                "name": "Meowscarada", // 魔幻假面喵 (魔术师)
                "lv": 99, 
                "gender": "F", 
                "nature": "Jolly", 
                "ability": "Protean", // 变幻自如。或者 Overgrow
                "mechanic": "tera",
                "teraType": "Grass",  // 草太晶：将千变万花威力推向极致
                
                "item": "Choice Scarf", // 讲究围巾：锁招但速度必须快过所有Lv.99
                // 或者用 "Focus Sash" 确保至少放出一次必杀
                
                "isAce": true, 
                // Lv.99 的满分配
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                // Flower Trick (千变万花): 必得要害(x1.5及无视防御buff) + 本系 + Insight修正
                // 只要出手，对面非死即残，无视任何墙/防御强化
                "moves": ["Flower Trick", "Knock Off", "Play Rough", "U-turn"],
                
                // “和我战斗到最后一刻吧！”
                "friendship": { "trust": 200, "passion": 255, "insight": 255, "devotion": 120 }
            }
        ]
    }
};



// ================================================================
//  挂载到 window 对象，供插件内部访问
// ================================================================
if (typeof window !== 'undefined') {
    window.GLORIA_DATA = GLORIA_DATA;
    window.SELENE_DATA = SELENE_DATA;
    window.ROSA_DATA = ROSA_DATA;
    window.DAWN_DATA = DAWN_DATA;
    window.AKARI_DATA = AKARI_DATA;
    window.SERENA_DATA = SERENA_DATA;
    window.LUSAMINE_DATA = LUSAMINE_DATA;
    window.LILLIE_DATA = LILLIE_DATA;
    window.MALLOW_DATA = MALLOW_DATA;
    window.LANA_DATA = LANA_DATA;
    window.IRIDA_DATA = IRIDA_DATA;
    window.SONIA_DATA = SONIA_DATA;
    window.ROXIE_DATA = ROXIE_DATA;
    window.IONO_DATA = IONO_DATA;
    window.ERIKA_DATA = ERIKA_DATA;
    window.NESSA_DATA = NESSA_DATA;
    window.MARNIE_DATA = MARNIE_DATA;
    window.HEX_DATA = HEX_DATA;
    window.BEA_DATA = BEA_DATA;
    window.CYNTHIA_DATA = CYNTHIA_DATA;
    window.JULIANA_DATA = JULIANA_DATA;
    window.MAY_DATA = MAY_DATA;
    window.LACEY_DATA = LACEY_DATA;
    window.MISTY_DATA = MISTY_DATA;
    window.ACEROLA_DATA = ACEROLA_DATA;
    window.SKYLA_DATA = SKYLA_DATA;
    window.IRIS_DATA = IRIS_DATA;
    window.NEMONA_DATA = NEMONA_DATA;
    
    window.TRAINER_GLOBALS = {
        gloria: GLORIA_DATA,
        selene: SELENE_DATA,
        rosa: ROSA_DATA,
        dawn: DAWN_DATA,
        akari: AKARI_DATA,
        serena: SERENA_DATA,
        juliana: JULIANA_DATA,
        lusamine: LUSAMINE_DATA,
        lillie: LILLIE_DATA,
        mallow: MALLOW_DATA,
        lana: LANA_DATA,
        irida: IRIDA_DATA,
        sonia: SONIA_DATA,
        roxie: ROXIE_DATA,
        iono: IONO_DATA,
        erika: ERIKA_DATA,
        nessa: NESSA_DATA,
        marnie: MARNIE_DATA,
        hex: HEX_DATA,
        bea: BEA_DATA,
        cynthia: CYNTHIA_DATA,
        may: MAY_DATA,
        lacey: LACEY_DATA,
        misty: MISTY_DATA,
        acerola: ACEROLA_DATA,
        skyla: SKYLA_DATA,
        iris: IRIS_DATA,
        nemona: NEMONA_DATA
    };
}