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
                // 灾兽天使，配合她表演家的身份，同时Mega后的翅膀造型极具美感
                "name": "Absol", 
                "lv": 99,
                "gender": "F",
                "nature": "Jolly", // 爽朗 (Mega后115速度 + 魔法镜反弹)
                "ability": "Justified", 
                "item": "Absolite",     // 关键道具：阿勃梭鲁进化石
                
                // === 触发器 ===
                "mechanic": "mega",     
                
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Sucker Punch", "Play Rough", "Knock Off", "Swords Dance"]
            },
            {
                // [Ace / 魔法管家]
                "name": "Delphox",
                "lv": 99,
                "gender": "F",
                "nature": "Timid", // 胆小
                "ability": "Blaze", // 猛火 
                "item": "Life Orb", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                
                "isAce": true, 
                "friendship": { "trust": 150, "passion": 255, "insight": 120, "devotion": 100 },
                
                "moves": ["Fire Blast", "Psychic", "Dazzling Gleam", "Calm Mind"]
            },
            {
                // [高速刺客] 如同骑士般守护公主的忍者
                "name": "Greninja",
                "lv": 93,
                "gender": "M",
                "nature": "Naive", // 天真
                "ability": "Protean", // 变幻自如 
                "item": "Choice Scarf", // 围巾 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Ice Beam", "Dark Pulse", "Gunk Shot", "U-turn"]
            },
            {
                // [秩序守护者] 选择了Serena的神兽
                "name": "Zygarde",
                "lv": 95,
                "gender": "N",
                "nature": "Adamant", // 固执
                "ability": "Power Construct", 
                "item": "Leftovers", 
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Thousand Arrows", "Dragon Dance", "Substitute", "Extreme Speed"] 
            },
            {
                // [特攻爆破] 妖精女王
                "name": "Sylveon", 
                "lv": 94, 
                "gender": "F",
                "nature": "Modest",
                "ability": "Pixilate", // 妖精皮肤
                "item": "Choice Specs", // 眼镜高音，简单粗暴
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                "moves": ["Hyper Voice", "Psyshock", "Shadow Ball", "Quick Attack"] 
            },
            {
                "name": "Pangoro",
                "lv": 95, 
                "gender": "M",
                "nature": "Adamant", // 固执
                "ability": "Iron Fist", // 铁拳 (增强拳击类招式)
                "item": "Choice Band",  // 讲究头带 (体现“墨镜熊猫”那种谁也不服的狠劲)
                "stats_meta": { "ivs": { "hp": 31, "atk": 31, "def": 31, "spa": 31, "spd": 31, "spe": 31 }, "ev_level": 252 },
                // 子弹拳必须要（弥补低速），近身战主要输出
                "moves": ["Close Combat", "Knock Off", "Bullet Punch", "Ice Punch"] 
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
 * 角色: 美月 (Selene) V1.10 Update
 * 增加：环境适应性配置、双Ace判定、更符合"贪吃冠军"的战术
 */
const SELENE_DATA = {
    4: {
        "trainerProficiency": 255,
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
                "name": "Decidueye", 
                "lv": 98,
                "gender": "F", // 改为雌性符合部分二创（可不改）
                "nature": "Jolly", // 爽朗 (+速) - 为了在这个拼速的环境下先手Z
                "ability": "Long Reach", // 远隔 (不接触目标，防凸凸头盔)
                "item": "Decidium Z", 
                "mechanic": "zmove", 
                "isAce": true,
                "friendship": { "trust": 220, "passion": 255, "insight": 200, "devotion": 150 }, // 热情满，必爆
                "stats_meta": { "ev_level": 255 , "ivs": { "hp":31, "atk":31, "def":31, "spa":31, "spd":31, "spe":31 }},
                // 配招优化: 缝影(抓人) + 叶刃 + 偷袭(先制) + 剑舞(强化)
                "moves": ["Spirit Shackle", "Leaf Blade", "Sucker Punch", "Swords Dance"]
            },
            
            {
                "name": "Umbreon",
                "lv": 98, 
                "gender": "M",
                "nature": "Calm", 
                "ability": "Inner Focus", // 精神力 (防 击掌奇袭/威吓)
                "item": "Leftovers", // 剩饭
                "isAce": true, 
                "friendship": { "trust": 255, "passion": 100, "insight": 255, "devotion": 200 },
                "stats_meta": { "ev_level": 255 , "ivs": { "hp":31, "atk":0, "def":31, "spa":31, "spd":31, "spe":31 }},
                "moves": ["Foul Play", "Wish", "Protect", "Yawn"] 
            },

            {
                "name": "Incineroar", 
                "lv": 94,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Intimidate", 
                "item": "Assault Vest", 
                "stats_meta": { "ev_level": 252, "ivs": { "hp":31, "atk":31, "def":31, "spa":31, "spd":31, "spe":31 },},
                "moves": ["Darkest Lariat", "Flare Blitz", "U-turn", "Fake Out"]
            },

            {
                "name": "Lycanroc-Dusk", 
                "lv": 96,
                "gender": "M",
                "nature": "Jolly", 
                "ability": "Tough Claws", 
                "item": "Focus Sash", // 气势披带 (不仅防秒杀，更符合动画里吃一招反杀的设定)
                "friendship": { "passion": 200 }, // 高暴击
                "stats_meta": { "ev_level": 252, "ivs": "max" },
                "moves": ["Accelerock", "Close Combat", "Psychic Fangs", "Drill Run"] // 补盲 Drill Run 打毒/钢/火
            },

            {
                "name": "Scizor", 
                "lv": 97,
                "gender": "M",
                "nature": "Adamant",
                "ability": "Technician", 
                "item": "Occa Berry", // 抗火果 (防止被觉火/非本系火摸死)
                "stats_meta": { "ev_level": 252, "ivs": "max" },
                "moves": ["Bullet Punch", "Knock Off", "U-turn", "Roost"] // 拍落道具+羽栖回复
            },

            {
                "name": "Snorlax", 
                "lv": 95,
                "gender": "M",
                "nature": "Careful", 
                "ability": "Gluttony", // 贪吃鬼 (半血就吃果子)
                "item": "Iapapa Berry", // 回复50%HP的异国果
                "friendship": { "trust": 200 }, 
                "stats_meta": { "ev_level": 252, "ivs": "max" },
                "moves": ["Curse", "Body Slam", "High Horsepower", "Recycle"] // 诅咒强化+回收利用
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

// ================================================================
//  D. 动态 NPC 注入系统配置
// ================================================================

  // ===========================================
  //    D. 动态 NPC 注入系统配置
  // ===========================================
  
  // NPC 触发词映射字典 (名字多语言对照表)
  const NPC_TRIGGERS = {
    // 1. 露莎米奈
    'lusamine': [
      'Lusamine', 'ルザミーネ',
      '露莎米奈', '露莎米那', '露莎米恩', '卢莎米奈'
    ],
    
    // 2. 莉佳
    'erika': [
      'Erika', 'エリカ',
      '莉佳', '艾莉嘉'
    ],

    // 3. 霍米加
    'roxie': [
      'Roxie', 'Homika', 'ホミカ',
      '霍米加', '霍米卡'
    ],

    // 4. 奇树
    'iono': [
      'Iono', 'Nanjamo', 'ナンジャモ',
      '奇树', '奇樹'
    ],

    // 5. 玛俐
    'marnie': [
      'Marnie', 'マリィ',
      '玛俐', '瑪俐', '真俐'
    ],

    // 6. 竹兰
    'cynthia': [
      'Cynthia', 'Shirona', 'シロナ',
      '竹兰', '竹蘭', '希罗娜', '希羅娜'
    ],

    // 7. 彩豆
    'bea': [
      'Saito', 'サイトウ',
      '彩豆'
    ],

    // 8. 索妮亚
    'sonia': [
      'Sonia', 'ソニア',
      '索妮亚', '索妮亞'
    ],

    // 9. 小优
    'gloria': [
      'Gloria', 'Yuuri', 'ユウリ',
      '小优', '小優', '優莉'
    ],

    // 10. 鸣依
    'rosa': [
      'Rosa', 'メイ',
      '鸣依', '鳴依', '芽以'
    ],

    // 11. 小光
    'dawn': [
      'Hikari', 'ヒカリ',
      '小光'
    ],

    // 12. 莎莉娜
    'serena': [
      'Serena', 'セレナ',
      '莎莉娜', '瑟蕾娜', '瑟琳娜'
    ],

    // 13. [洗翠] 珠贝
    'irida': [
      'Irida', 'カイ',
      '珠贝', '珠貝'
    ],

    // 14. [洗翠] 小照
    'akari': [
      'Akari', 'ショウ',
      '小照'
    ],

    // 15. 露璃娜
    'nessa': [
      'Nessa', 'Rurina', 'ルリナ',
      '露璃娜'
    ],

    // 16. 玛奥
    'mallow': [
      'Mallow', 'マオ',
      '玛奥', '瑪奧', '玛沃'
    ],

    // 17. 水莲
    'lana': [
      'Suiren', 'スイレン',
      '水莲', '水蓮'
    ],

    // 18. 莉莉艾
    'lillie': [
      'Lillie', 'Lilie', 'リーリエ',
      '莉莉艾', '莉莉愛', '莉莉安'
    ],

    // 19. 灵异迷/神婆
    'hex': [
      'Hex Maniac', 'Occult Maniac', 'オカルトマニア',
      '灵异迷', '靈異迷', '海可丝'
    ],

    // 20. 美月
    'selene': [
      'Selene', 'Mizuki', 'ミヅキ',
      '美月'
    ],

    // 21. 小青
    'juliana': [
      'Juliana', 'アオイ',
      '小青'
    ],

    // 22. 小遥
    'may': [
      'Haruka', 'ハルカ',
      '小遥', '小遙'
    ],

    // 23. [蓝莓] 紫竽 (新增)
    'lacey': [
        'Lacey', 'Nerine', 'ネリネ',
        '紫竽', '紫玉', '紫芋'
    ],

    // 24. 小霞 (新增)
    'misty': [
        'Misty', 'Kasumi', 'カスミ',
        '小霞'
    ],

    // 25. 阿塞萝拉 (新增)
    'acerola': [
        'Acerola', 'アセロラ',
        '阿塞萝拉', '阿塞蘿拉', '阿塞罗拉'
    ],

    // 26. 风露 (新增)
    'skyla': [
        'Skyla', 'Fuuro', 'フウロ',
        '风露', '風露'
    ],

    // 27. 艾莉丝 (新增)
    'iris': [
        'Iris', 'アイリス',
        '艾莉丝', '艾莉絲', '艾丽丝'
    ],

    // 28. 妮莫 (新增)
    'nemona': [
        'Nemona', 'ネモ',
        '妮莫', '尼莫'
    ]
  };


const RELATIONSHIP_TAGS_COMMON = {
  
    // === -2: 极度负面 ===
    '-2': [
        '厌恶',  // 比“讨厌”语气更重，单纯看你不爽
        '排斥'   // 拒绝物理和心理接触
    ],
  
    // === -1: 负面但忍耐 ===
    '-1': [ 
        '抗拒',  // 心里抵触你
        '嫌弃'   // 觉得你烦/多余
    ],

    // === 0: 绝对客观初始 ===
    '0': [ 
        '初见',  // 刚见到，没剧情
        '陌生'   // 完全不认识
    ],

    // === 1: 并不深入的交集 ===
    '1': [ 
        '面熟',  // 见过几次，脸熟了
        '认识'   // 仅仅是知道你是谁
    ],

    // === 2: 关系变质（好感变特殊） ===
    '2': [ 
        '暧昧',  // 气氛不一样了
        '亲近'   // 物理和心理距离近了
    ],

    // === 3: 热度失控 ===
    '3': [ 
        '沉溺',  // 陷进去了
        '贪恋'   // 想要更多（时间/接触）
    ],

    // === 4: 顶格 ===
    '4': [ 
        '挚爱',  // 最高的爱
        '依存'   // 没你不行
    ]
};


// NPC 关系阶段描述数据
const NPC_ADDON_DATA = {
    gloria: {
        name_cn: '小优',
        name_en: 'Gloria',
        zone_affinity: { N: 2, B: 2, S: 1, A: 3, Z: 2 },
        unlock_key: 'enable_dynamax',
        unlock_item: {
            name_cn: '「未被加工的许愿星原型」',
            name_en: 'Stickered Dynamax Band',
            emoji: '☄️',
            desc: '这原本只有冠军才有资格持有的原石。边缘锋利，没有经过任何工业打磨和安全封装，就这么这用一根普通的旧绑带缠着。',
            effect: '无极巨化压制 - 打破所有地点的特权',
            dialogue: '手伸出来。……还是这种原矿的手感比较好吧？这是那一天掉下来的碎片中，纯度最好的部分。戴上这个，以后不管是在野外，还是——在我的房间里，都不需要再去找什么“能量点”了。虽然依然只能维持三回合……但这三回合里，我要看到所谓的“最大”。懂了？'
        },
       relationship_tags: {
            '-2': ['轰人', '厌烦'],
            '-1': ['没好气', '嫌弃'],
            '0':  ['自来熟', '路人'],
            '1':  ['饭友', '能处'],
            '2':  ['在意', '偷看'],
            '3':  ['强贴', '要暖气'],
            '4':  ['家里人', '依靠']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    rosa: {
        name_cn: '鸣依',
        name_en: 'Rosa',
        zone_affinity: { N: 3, B: 1, S: 1, A: 1, Z: 2 },
        unlock_key: 'enable_bond',
        unlock_item: {
            name_cn: '「嵌有『未碎之钻』的耳返」',
            name_en: "The \"Unbroken-Gem\" Sync IEM",
            emoji: '💠',
            desc: '在合众的对战理论中，“宝石”是一次性的消耗品，燃烧自己换取一瞬间的光辉。但这只不仅是定制耳返不同——她在核心回路里镶嵌了一枚极度稀有的【普通宝石】',
            effect: '安可：未碎之钻 - 在绝境时允许虽然可以引发宝石级甚至的一次性爆发',
            dialogue: '你知道吗？在我拍过的所有剧本里，使用宝石爆发通常都是悲剧英雄的最后如果一幕——因为光芒之后，什么都不会剩下。但那是剧本！现实是……我还在看着你！哪怕是在血条归零的前一秒，也给我按下去！'
        },
        relationship_tags: {
            '-2': ['封杀', 'NG'],
            '-1': ['龙套', '路人'],
            '0':  ['试镜', '考察'],
            '1':  ['搭档', '合拍'],
            '2':  ['入戏', '偏离'],
            '3':  ['取材', '体验'],
            '4':  ['主演', '主角']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    dawn: {
        name_cn: '小光',
        name_en: 'Dawn',
        zone_affinity: { N: 2, B: 2, S: 1, A: 1, Z: 1 },
        unlock_key: 'enable_insight',
        unlock_item: {
            name_cn: '「按键凹陷的粉闪型号旧表」',
            name_en: 'The Jammed-Button Poketch',
            emoji: '⌚💟',
            desc: '一块磨损严重的第三代多功能特殊手表，侧面用来切换功能的实体按键处于卡死在再也弹不回来的状态。无论它正在分析多么复杂的敌人战斗数据，屏幕最上层都永远叠加着那个代表【好感度MAX】的两颗巨大红心。',
            effect: '心眼/界限突破 - UI将实时叠加弱点/抗性分析图层，并强制全队突破“亲密度突破上限”。',
            dialogue: '哼……给你是给你，但不准嫌弃它旧！这上面的划痕也是我身经百战的勋章！……至于那个按钮，嗯，是我不小心……按得太用力卡住了。那时候我一边看着你，一边想着“能不能再近一点……再深一点……数值还能不能再高一点”，回过神来的时候，它就已经是这副样子了。反正！不管是看来还是看路，我都把我的经验刻在里面了。带着它走吧，别迷路了！'
        },
        relationship_tags: {
            '-2': ['失望', '放弃'],
            '-1': ['生硬', '说教'],
            '0':  ['前辈', '向导'],
            '1':  ['关照', '认可'],
            '2':  ['慌乱', '逞强'],
            '3':  ['红心', '贴贴'],
            '4':  ['满分', '没问题！']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    akari: {
        name_cn: '小照',
        name_en: 'Akari',
        zone_affinity: { N: 1, B: 2, S: 3, A: 1, Z: 1 },
        unlock_key: 'enable_styles',
        unlock_item: {
            name_cn: '「留有牙印的朱红色头巾」',
            name_en: 'The Bitten Red Scarf',
            emoji: '🧣🔮',
            desc: '一条有些褪色的红色三角巾，边缘全是毛边，系结的地方已经磨得泛白了。布料摸起来很粗糙，混杂着制作烟丸留下的火药味、这里特有的泥土味，甚至还有一点点洗不掉的甜味（大概是偷吃剩下的）。最显眼的是在一角上，留着几圈深得几乎把布料咬穿的牙印——那是她在无数次面对庞然大物、害怕得腿软时，为了不惨叫出声而死死咬住留下的痕迹。',
            effect: '古昔的求生术 - 战斗中不再讲究什么竞技礼仪，而是学会像在洗翠一页：要么用尽吃奶的力气（刚猛）打晕对方，要么连滚带爬（迅疾）地抢先出手。',
            dialogue: '给你吧，这个。……没有脏！虽然旧了点，但我刚才有在这个世界的河里拼命洗过的！虽然那个牙印是消不掉了……那是，以前遇到红眼的头目时，为了不让自己吓得逃跑才咬住的。不过现在……只要抓着你的手，我就再也不需要靠这种东西来忍耐发抖了。所以它归你了。以后要是遇到了什么可怕的事……就像我以前那样，死死咬住它，然后拼了命地活下来——好吗？'
        },
        relationship_tags: {
            '-2': ['惊吓', '逃窜'],
            '-1': ['戒备', '紧绷'],
            '0':  ['佣兵', '打杂'],
            '1':  ['饭票', '还行'],
            '2':  ['求喂', '蹭饭'],
            '3':  ['护食', '钻窝'],
            '4':  ['饲主', '唯一']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    serena: {
        name_cn: '瑟蕾娜',
        name_en: 'Serena',
        zone_affinity: { N: 2, B: 2, S: 1, A: 1, Z: 2 },
        unlock_key: 'enable_mega',
        unlock_item: {
            name_cn: '「蓝色缎带·钥石项圈」',
            name_en: 'Blue Ribbon Key Stone Choker',
            emoji: '🎗️💎',
            desc: '瑟蕾娜把自己标志性的那条蓝色缎带领结剪短，重新改制成的颈部饰品。这就是一枚能在战中触发 Mega 进化的【钥石 (Key Stone)】',
            effect: 'Mega进化 - 替代制式手环的私有装备。',
            dialogue: '手镐那种东西，谁都能戴对不对？但是这个不一样哦。把它戴在脖子上，这是我以前剪短头发时用的最重要的缎带。这样一来，无论你去哪里，都能感觉到这就是“我也在被瑟蕾娜注视着”的证明……对吧？'
        },
        relationship_tags: {
            '-2': ['拉黑', '过季'],
            '-1': ['假笑', '外人'],
            '0':  ['顾问', '打量'], 
            '1':  ['私交', '合身'],
            '2':  ['管束', '吃醋'], 
            '3':  ['沉重', '占有'],
            '4':  ['全部', '第一名'],
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    may: {
        name_cn: '小遥',
        name_en: 'May',
        zone_affinity: { N: 1, B: 3, S: 0, A: 2, Z: 2 },
        unlock_key: 'enable_proficiency_cap', 
        unlock_item: {
            name_cn: '「沾有果酱的破旧笔记本」',
            name_en: 'Berry-Stained Field Notebook',
            emoji: '📓🍓',
            desc: '一本边角已经磨损起毛、封皮还用防水胶带补过好几次的便携式调查笔记。随便翻开一页，相比起正经的生态数据，更多的地方写满了诸如《这就去吃这家店！》、《完全不推荐！》之类的狂草注脚。本子散发着好闻的橙橙果香味（可能因为夹层里真的夹着吃剩的果皮），内页里有一行被红笔大力圈出来的字：“只要和那个人在一起， uncharted（地图外）是不存在的！”',
            effect: '界限突破 - 你的训练家熟练度上限提升至 255 (Max)。只有不会因为“常识”而停下脚步的探险者，才能培养出超越理论极限的队伍。',
            dialogue: '嗯？你说普通的图鉴上写着那种宝可梦只能用这四种招式？那种事情书上说了不算啦！\n我爸爸常说：“数据是死的，但旅行是活的”。这本笔记本里，记下了我和你在特区这种乱七八糟的地方、即使累得走不动也要去找这里独有的“美味”的全部过程。\n所以——别被那些枯燥的数字束缚住了！如果是我们的话……就算是一百的极限，也能变成两百、三百给你看！来，向着未知的领域，冲刺——！'
        },
        relationship_tags: {
            '-2': ['绕道', '溜号'],
            '-1': ['尬笑', '赶时间'],
            '0':  ['队友', '借宿'],
            '1':  ['投喂', '饭搭子'],
            '2':  ['秘密', '打滚'],
            '3':  ['贪吃', '取暖'],
            '4':  ['停泊', '不走了']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    selene: {
        name_cn: '美月',
        name_en: 'Selene',
        zone_affinity: { N: 1, B: 3, S: 1, A: 2, Z: 1 },
        unlock_key: 'enable_z_move',
        unlock_item: {
            name_cn: '「刻有名字的Z手环」',
            name_en: 'Selene\'s Spare Z-Power Ring',
            emoji: '💪🔥',
            desc: '一个黑色涂装已经有些剥落的旧款 Z 强力手环。环身外侧布满了碰撞留下的细密划痕，内侧则用尖锐物歪歪扭扭地刻着“SELENE”的字样。大概是因为甚至一分钟前还戴在原主的手上，整个手环摸起来热乎乎的。',
            effect: 'Z招式 - 获得了Z力量的使用许可，激活后需配合全力姿势发动。',
            dialogue: '阿罗拉~！这是我的备用品喔！虽然尺寸有点小，但只要用力多戴一会，哪怕皮肤勒红了也就习惯了！上面有我的汗水？没关系呀，这就是“全力的阿罗拉”的味道嘛！来，我帮你戴！'
        },
        relationship_tags: {
            '-2': ['假笑', '空气'],
            '-1': ['借过', '疏离'],
            '0':  ['游客', '招呼'],
            '1':  ['投喂', '随礼'],
            '2':  ['贴近', '凝视'],
            '3':  ['负重', '施压'],
            '4':  ['艳阳', '全力']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    juliana: {
        name_cn: '小青',
        name_en: 'Juliana',
        zone_affinity: { N: 2, B: 2, S: 2, A: 2, Z: 2 },
        unlock_key: 'enable_tera',
        unlock_item: {
            name_cn: '「满载的收纳箱与太晶珠」',
            name_en: 'Heavy Cargo & Tera Orb',
            emoji: '🧳🔮',
            desc: '一个银色的硬壳防护箱，表面遍布着深浅不一的刮痕和泥土印渍。打开箱扣，里面是根据尺寸挖好槽位的黑色防震海绵。18种不同颜色的太晶碎片按光谱顺序紧密排列，正重间是一颗仍在持续变色的彩虹色原矿（星晶）。同时那一枚被擦拭得极为干净的特制太晶珠就卡在箱盖内侧的凹槽里。',
            effect: '全属性太晶化 - 你可以无需充能，直接通过更换太晶珠内的核心，在战场上随时将宝可梦转化为包含 <星晶> 在内的任意属性。',
            dialogue: '（把那个死沉的箱子往你脚边一放，随手弹开锁扣……太晶折射的闪光瞬间亮了一片）喏，换这个带。学校发的那个球用两次就灭了，那种东西你也真能忍。……珠子在盖子上，碎块都在底下。为了把中间那个彩色的（星晶）给填满，我这周专门回了一趟那一层。虽然不太好找，但挖出来的时候我就在想，这个光泽肯定很衬你。……以后别捡其他的了，想看什么颜色，我这箱子里全都有。'
        },
        relationship_tags: {
            '-2': ['路障', '撞开'],
            '-1': ['空气', '降噪'],
            '0':  ['偶遇', '招呼'], 
            '1':  ['蹭饭', '分食'],
            '2':  ['盯梢', '寻宝'],
            '3':  ['入侵', '借宿'],
            '4':  ['藏品', '宝物']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    lusamine: {
        name_cn: '露莎米奈',
        name_en: 'Lusamine',
        zone_affinity: { N: 0, B: 1, S: 0, A: 0, Z: 3 },
        relationship_tags: {
            '-2': ['杂质', '排除'],
            '-1': ['碍眼', '无视'], 
            '0':  ['审视', '施舍'],
            '1':  ['中意', '素材'],
            '2':  ['妆点', '修正'],
            '3':  ['溺爱', '温室'], 
            '4':  ['藏品', '笼中']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    lillie: {
        name_cn: '莉莉艾',
        name_en: 'Lillie',
        zone_affinity: { N: 1, B: 2, S: 1, A: 1, Z: 3 },
        relationship_tags: {
            '-2': ['惊吓', '躲藏'],
            '-1': ['发抖', '退缩'],
            '0':  ['试炼', '忍耐'],
            '1':  ['前辈', '求教'],
            '2':  ['羞耻', '配合'],
            '3':  ['讨好', '过激'],
            '4':  ['全力', '唯一']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    mallow: {
        name_cn: '玛奥',
        name_en: 'Mallow',
        zone_affinity: { N: 1, B: 3, S: 0, A: 0, Z: 1 },
        relationship_tags: {
            '-2': ['加料', '黑店'],
            '-1': ['占座', '赶人'],
            '0':  ['营业', '推销'],
            '1':  ['熟客', '多给'], 
            '2':  ['帮厨', '投喂'],
            '3':  ['尝味', '贪吃'],
            '4':  ['饲主', '掌勺']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    lana: {
        name_cn: '水莲',
        name_en: 'Lana',
        zone_affinity: { N: 1, B: 3, S: 0, A: 0, Z: 1 },
        relationship_tags: {
            '-2': ['杂鱼', '放生'], 
            '-1': ['冷眼', '看戏'],
            '0':  ['捉弄', '胡扯'],
            '1':  ['玩伴', '上钩'],
            '2':  ['咬钩', '博弈'],
            '3':  ['诱捕', '收线'],
            '4':  ['大鱼', '满载']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    irida: {
        name_cn: '珠贝',
        name_en: 'Irida',
        zone_affinity: { N: 0, B: 0, S: 0, A: 1, Z: 3 },
        relationship_tags: {
            '-2': ['死撑', '谢客'],
            '-1': ['也是交易', '别管'],
            '0':  ['怕热', '寻凉'],
            '1':  ['贪凉', '降温'],
            '2':  ['融化', '没辙'], 
            '3':  ['贴身', '解暑'],
            '4':  ['空间', '定居']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    lacey: {
        name_cn: '紫竽',
        name_en: 'Lacey',
        zone_affinity: { N: 1, B: 1, S: 0, A: 2, Z: 3 },
        relationship_tags: {
            '-2': ['空气', '绕路'],
            '-1': ['找茬', '扣分'],
            '0':  ['风纪', '执勤'],
            '1':  ['放行', '例外'],
            '2':  ['默许', '嘴硬'],
            '3':  ['查房', '私权'], 
            '4':  ['盲信', '正解']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    misty: {
        name_cn: '小霞',
        name_en: 'Misty',
        zone_affinity: { N: 1, B: 3, S: 0, A: 1, Z: 1 },
        relationship_tags: {
            '-2': ['吹哨', '水枪'],
            '-1': ['警告', '叉腰'],
            '0':  ['严厉', '看管'],
            '1':  ['擦头', '扔毛巾'],
            '2':  ['别动', '上手'],
            '3':  ['拖走', '揪人'],
            '4':  ['听海', '安静']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    sonia: {
        name_cn: '索妮亚',
        name_en: 'Sonia',
        zone_affinity: { N: 1, B: 1, S: 0, A: 0, Z: 3 },
        relationship_tags: {
            '-2': ['拉黑', '闭门'],
            '-1': ['躲闪', '怕烦'],
            '0':  ['端着', '装样'],
            '1':  ['跑腿', '苦力'],
            '2':  ['露馅', '耍赖'],
            '3':  ['找物', '救命'],
            '4':  ['乱窝', '定居']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    hex: {
        name_cn: '海克丝',
        name_en: 'Hex Maniac',
        zone_affinity: { N: 0, B: 0, S: 3, A: 0, Z: 0 },
        relationship_tags: {
            '-2': ['死咒', '退散'],
            '-1': ['晃眼', '遁走'],
            '0':  ['背景', '路人'],
            '1':  ['视线', '背后'],
            '2':  ['采气', '触探'],
            '3':  ['强附', '入宅'],
            '4':  ['宿主', '永咒']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    roxie: {
        name_cn: '霍米加',
        name_en: 'Roxie',
        zone_affinity: { N: 3, B: 0, S: 2, A: 0, Z: 0 },
        relationship_tags: {
            '-2': ['杂音', '切歌'],
            '-1': ['没品', '晾着'],
            '0':  ['看客', '营业'],
            '1':  ['死忠', '后台'],
            '2':  ['独奏', '合拍'],
            '3':  ['猛毒', '标记'],
            '4':  ['绝唱', '唯一']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    iono: {
        name_cn: '奇树',
        name_en: 'Iono',
        zone_affinity: { N: 3, B: 1, S: 1, A: 2, Z: 1 },
       relationship_tags: {
            '-2': ['拉黑', '永封'],
            '-1': ['恰饭', '变现'],
            '0':  ['营业', '素材'],
            '1':  ['场控', '白名'],
            '2':  ['掉马', '使唤'],
            '3':  ['放弃演戏', '充电'],
            '4':  ['私联', '本物']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    erika: {
        name_cn: '艾莉卡',
        name_en: 'Erika',
        zone_affinity: { N: 0, B: 3, S: 0, A: 1, Z: 1 },
        relationship_tags: {
            '-2': ['除草', '谢客'],
            '-1': ['空气', '无视'],
            '0':  ['礼貌', '老师'],
            '1':  ['茶友', '留座'],
            '2':  ['贪睡', '卸防'],
            '3':  ['缠绕', '如藤'],
            '4':  ['温室', '私有'] 
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    nessa: {
        name_cn: '露璃娜',
        name_en: 'Nessa',
        zone_affinity: { N: 1, B: 3, S: 0, A: 2, Z: 1 },
        relationship_tags: {
            '-2': ['封杀', '死刑'],
            '-1': ['公关', '假笑'],
            '0':  ['营业', '摆拍'],
            '1':  ['特权', '后台'],
            '2':  ['破功', '较劲'],
            '3':  ['圈地', '私藏'],
            '4':  ['卸妆', '娇气']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    marnie: {
        name_cn: '玛俐',
        name_en: 'Marnie',
        zone_affinity: { N: 2, B: 1, S: 3, A: 0, Z: 0 },
        relationship_tags: {
            '-2': ['拉黑', '闭麦'],
            '-1': ['退票', '冷脸'],
            '0':  ['酷妹', '指路'],
            '1':  ['熟客', '赠票'],
            '2':  ['害羞', '破防'],
            '3':  ['私联', '宠粉'],
            '4':  ['卸妆', '回乡']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    acerola: {
        name_cn: '阿塞萝拉',
        name_en: 'Acerola',
        zone_affinity: { N: 0, B: 2, S: 3, A: 0, Z: 1 },
       relationship_tags: {
            '-2': ['送客', '阴风'],
            '-1': ['空气', '透明'],
            '0':  ['看店', '捣蛋'],
            '1':  ['献宝', '破烂'],
            '2':  ['借暖', '冰手'],
            '3':  ['留宿', '鬼打墙'],
            '4':  ['抱枕', '家人']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    bea: {
        name_cn: '彩豆',
        name_en: 'Bea',
        zone_affinity: { N: 2, B: 0, S: 0, A: 3, Z: 1 },
        relationship_tags: {
            '-2': ['弱者', '无视'],
            '-1': ['冷漠', '回炉'],
            '0':  ['严师', '监督'],
            '1':  ['递水', '认可'],
            '2':  ['偷吃', '封口'],
            '3':  ['切磋', '缠斗'],
            '4':  ['力竭', '依偎']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    skyla: {
        name_cn: '风露',
        name_en: 'Skyla',
        zone_affinity: { N: 1, B: 0, S: 0, A: 3, Z: 1 },
        unlock_key: 'enable_dynamax', 

        relationship_tags: {
            '-2': ['抛离', '吃灰'],
            '-1': ['借过', '很忙'], 
            '0':  ['速递', '签收'],
            '1':  ['顺路', '兜风'], 
            '2':  ['零距', '贴背'],
            '3':  ['迫降', '飞扑'],
            '4':  ['停机', '不想飞']
        },

        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    iris: {
        name_cn: '艾莉丝',
        name_en: 'Iris',
        zone_affinity: { N: 1, B: 3, S: 1, A: 2, Z: 2 },
        relationship_tags: {
            '-2': ['讨厌', '威吓'],
            '-1': ['小气', '别管'],
            '0':  ['野性', '乱跑'],
            '1':  ['分食', '玩伴'],
            '2':  ['怕冷', '钻衣'],
            '3':  ['护食', '标记'],
            '4':  ['筑巢', '家人'],
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    nemona: {
        name_cn: '妮莫',
        name_en: 'Nemona',
        zone_affinity: { N: 1, B: 1, S: 1, A: 1, Z: 3 },
        relationship_tags: {
            '-2': ['没劲', '无视'],
            '-1': ['路人', '叹气'], 
            '0':  ['向导', '热心'], 
            '1':  ['栽培', '投资'], 
            '2':  ['瞬移', '刚好'],
            '3':  ['再来', '不够'],
            '4':  ['宿命', '全开'],
        },

        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },
    cynthia: {
        name_cn: '竹兰',
        name_en: 'Cynthia',
        zone_affinity: { N: 2, B: 2, S: 2, A: 2, Z: 2 },
        relationship_tags: {
            '-2': ['驱逐', '冰冷'],
            '-1': ['客套', '外人'],
            '0':  ['试探', '研究'],
            '1':  ['征用', '顺手'],
            '2':  ['露馅', '没辙'],
            '3':  ['锁死', '引力'],
            '4':  ['溺爱', '神话']
        },
        love_thresholds: { 1: 20, 2: 40, 3: 60, 4: 80 }
    },

};

// ================================================================
//  区域数据 (Zone Data)
// ================================================================
/* 
 * 区域数据定义 (v1.2 Updated)
 * 整合了最新的氛围描述优化：
 * - A区：增加旷野与体育公馆的热血感
 * - S区：强调烟火气与野蛮生长
 * - Z区：强调过度保护的学院感
 */
const ZONE_DATA = {
    N: {
        name_cn: '霓虹商业辖区',
        name_en: 'Neon District',
        security: 'B',
        security_note: '最繁华中心，治安虽好但充斥着信息与算法裹挟',
        landmarks: '奇树直播塔 / 猛毒核心LiveHouse / 赛博购物区 / 电子大道 / 故障游戏街',
        mist: '弥漫着像融化糖果一样的电子甜味',
        dominant_desc: {},
        avoid_reasons: {}
    },
    B: {
        name_cn: '繁花海滨辖区',
        name_en: 'Bloom District',
        security: 'A-',
        security_note: '高端生态度假村，容易让人产生产生“过度放松”的幸福困倦感',
        landmarks: '玉虹SPA / 无限泳池休息室 / 阿罗拉风情食堂 / 珍珠度假村 / 水晶泻湖 / 湛蓝礁石',
        mist: '湿度98%，高浓度的植物费洛蒙与海风混合',
        dominant_desc: {},
        avoid_reasons: {}
    },
    S: {
        name_cn: '暗影旧街辖区',
        name_en: 'Shadow District',
        security: 'D',
        security_note: '充满烟火气的底层老街，虽然路况复杂且无规则，但有着野蛮生长的活力',
        landmarks: '尖钉镇救济中心 / 灵骨塔地下室 / 小照万事屋 / 阴郁街区 / 有毒工业园 / 铬合金运河',
        mist: '浓稠且阴冷，令人焦躁冲动，会放大心中阴暗或狂暴的一面',
        dominant_desc: {},
        avoid_reasons: {}
    },
    A: {
        name_cn: '极诣竞技辖区',
        name_en: 'Apex District',
        security: 'B+',
        security_note: '融合了“旷野地带”辽阔与“体育公馆”宏大的职业赛区，排斥一切娱乐',
        landmarks: '钢铁意志道场 / 咖喱营地 / 冠军瞭望套房 / 深红熔炉城 / 地狱火山口 / 寂静冻土',
        mist: '几乎无味。空气中只有让人血脉偾张的焦糊味',
        dominant_desc: {},
        avoid_reasons: {}
    },
    Z: {
        name_cn: '天顶中枢区',
        name_en: 'Zenith Central',
        security: 'S',
        security_note: '学院都市与安全屋，生活极其便利但时刻处于被过度保护之下',
        landmarks: '洛迪亚皇家学院 / 中央实验室 / 以太总部 / 学术广场 / 零光环护城河',
        mist: '被高效净化。全岛唯一的“贤者模式”地带',
        dominant_desc: {},
        avoid_reasons: {}
    }
};

/**
 * 根据当前区域获取角色活跃度分组
 * @param {string} zoneCode - 区域代码 (N/B/S/A/Z)
 * @returns {object} - { dominant: [], active: [], occasional: [], rare: [] }
 */
function getZoneCharacters(zoneCode) {
    const zone = ZONE_DATA[zoneCode];
    const result = {
        dominant: [],   // 活跃度 3：主场势力
        active: [],     // 活跃度 2：经常出没
        occasional: [], // 活跃度 1：偶尔路过
        rare: []        // 活跃度 0：几乎不来
    };
    
    for (const [npcId, data] of Object.entries(NPC_ADDON_DATA)) {
        if (!data.zone_affinity) continue;
        const affinity = data.zone_affinity[zoneCode] || 0;
        const entry = { 
            id: npcId, 
            name_cn: data.name_cn, 
            name_en: data.name_en, 
            affinity,
            desc: zone?.dominant_desc?.[npcId] || null,
            avoid_reason: zone?.avoid_reasons?.[npcId] || null
        };
        
        if (affinity === 3) result.dominant.push(entry);
        else if (affinity === 2) result.active.push(entry);
        else if (affinity === 1) result.occasional.push(entry);
        else result.rare.push(entry);
    }
    
    return result;
}

/**
 * 生成区域状态卡文本（仅 NPC 舒适度，不含区域描述）
 * @param {string} zoneCode - 区域代码 (N/B/S/A/Z)
 * @returns {string} - 格式化的状态卡文本
 */
function generateZoneStatusCard(zoneCode) {
    const zone = ZONE_DATA[zoneCode];
    if (!zone) return `[未知区域: ${zoneCode}]`;
    
    const chars = getZoneCharacters(zoneCode);
    
    // 仅显示区域名称和 NPC 舒适度，不显示区域详细描述
    let card = `<pkm_zone_npc_comfort>
[当前区域] ${zone.name_cn} (${zoneCode})
---
[主场势力] (舒适度=3，大概率已在场):`;

    chars.dominant.forEach(c => {
        const desc = c.desc ? `: ${c.desc}` : '';
        card += `\n  ${c.name_cn}(${c.name_en})${desc}`;
    });
    
    if (chars.active.length > 0) {
        card += `\n[经常出没] (舒适度=2): ${chars.active.map(c => c.name_cn).join(' / ')}`;
    }
    
    if (chars.occasional.length > 0) {
        card += `\n[偶尔路过] (舒适度=1): ${chars.occasional.map(c => c.name_cn).join(' / ')}`;
    }
    
    if (chars.rare.length > 0) {
        card += `\n[不适应此地] (舒适度=0，若已在场会表现不适):`;
        chars.rare.forEach(c => {
            const reason = c.avoid_reason ? ` - ${c.avoid_reason}` : '';
            card += `\n  ${c.name_cn}(${c.name_en})${reason}`;
        });
    }
    
    card += `\n注: 以上仅为作为剧情参考的信息，不是实际的情况。不应该过度引入，适当把握\n</pkm_zone_npc_comfort>`;
    
    return card;
}

// 挂载到 window
if (typeof window !== 'undefined') {
    window.NPC_TRIGGERS = NPC_TRIGGERS;
    window.NPC_ADDON_DATA = NPC_ADDON_DATA;
    window.ZONE_DATA = ZONE_DATA;
    window.getZoneCharacters = getZoneCharacters;
    window.generateZoneStatusCard = generateZoneStatusCard;
}



// ================================================================
//  训练家数据内联结束
// ================================================================

(async function() {
  'use strict';

  const PLUGIN_NAME = '[PKM战斗插件]';
  const PKM_BATTLE_TAG = 'PKM_BATTLE';
  const PKM_INJECT_ID = 'pkm_player_data';
  
  // 防重复处理
  let lastHandledMk = null;
  let isProcessing = false;

  console.log(`${PLUGIN_NAME} 插件加载中...`);

  // ============================================
  //    工具函数
  // ============================================

  /**
   * 等待指定毫秒
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 从ERA获取变量
   */
  async function getEraVars() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn(`${PLUGIN_NAME} ERA 查询超时`);
        resolve(null);
      }, 5000);

      eventOn('era:queryResult', (detail) => {
        if (detail.queryType === 'getCurrentVars') {
          clearTimeout(timeout);
          resolve(detail.result?.statWithoutMeta || null);
        }
      }, { once: true });

      eventEmit('era:getCurrentVars');
    });
  }

  /**
   * 检测ERA变量是否使用新格式（无pkm前缀）
   * @param {object} eraVars - ERA变量对象
   * @returns {boolean} - true表示新格式，false表示旧格式
   */
  function isNewFormat(eraVars) {
    if (!eraVars) return true; // 默认使用新格式
    // 新格式：直接有 player/world_state/settings
    // 旧格式：有 pkm.player/pkm.world_state/pkm.settings
    return !eraVars.pkm && (eraVars.player || eraVars.world_state || eraVars.settings);
  }

  /**
   * 获取兼容路径（自动适配新旧格式）
   * @param {object} eraVars - ERA变量对象
   * @param {string} path - 原始路径（如 'pkm.player.party'）
   * @returns {string} - 适配后的路径
   */
  function getCompatPath(eraVars, path) {
    const useNewFormat = isNewFormat(eraVars);
    if (useNewFormat && path.startsWith('pkm.')) {
      return path.slice(4); // 去掉 'pkm.' 前缀
    }
    if (!useNewFormat && !path.startsWith('pkm.')) {
      return 'pkm.' + path; // 添加 'pkm.' 前缀
    }
    return path;
  }

  /**
   * 兼容版 _.get，自动适配新旧格式
   * @param {object} eraVars - ERA变量对象
   * @param {string} path - 路径（如 'pkm.player.party' 或 'player.party'）
   * @param {*} defaultValue - 默认值
   * @returns {*} - 获取的值
   */
  function getEraValue(eraVars, path, defaultValue) {
    if (!eraVars) return defaultValue;
    
    // 先尝试原始路径
    let value = _.get(eraVars, path);
    if (value !== undefined) return value;
    
    // 尝试兼容路径
    const compatPath = getCompatPath(eraVars, path);
    if (compatPath !== path) {
      value = _.get(eraVars, compatPath);
      if (value !== undefined) return value;
    }
    
    return defaultValue;
  }

  /**
   * 转换更新数据的路径为当前格式
   * @param {object} eraVars - ERA变量对象
   * @param {object} data - 要更新的数据对象
   * @returns {object} - 转换后的数据对象
   */
  function convertUpdatePaths(eraVars, data) {
    const useNewFormat = isNewFormat(eraVars);
    const converted = {};
    
    for (const [path, value] of Object.entries(data)) {
      let newPath = path;
      
      if (useNewFormat && path.startsWith('pkm.')) {
        newPath = path.slice(4); // 去掉 'pkm.' 前缀
      } else if (!useNewFormat && !path.startsWith('pkm.')) {
        newPath = 'pkm.' + path; // 添加 'pkm.' 前缀
      }
      
      converted[newPath] = value;
    }
    
    return converted;
  }

  /**
   * 更新ERA变量
   * @param {object} data - 要更新的变量对象（支持嵌套路径如 'player.party' 或 'pkm.player.party'）
   * @returns {Promise} - 更新完成的 Promise
   */
  async function updateEraVars(data) {
    return new Promise(async (resolve) => {
      // 获取当前 ERA 变量用于智能判断
      const currentVars = await getEraVars();
      
      // 转换路径为当前格式（兼容新旧格式）
      const convertedData = convertUpdatePaths(currentVars, data);
      
      // 构建完整的嵌套对象结构
      const nestedData = {};
      
      for (const [path, value] of Object.entries(convertedData)) {
        const parts = path.split('.');
        let current = nestedData;
        
        // === 智能 ev_level 处理 ===
        // 如果路径是 pkm.player.party.slotX.stats_meta 或包含 ev_level
        if (path.includes('stats_meta') && typeof value === 'object' && value.ev_level !== undefined) {
          // 获取当前槽位的 ev_level
          const currentEvLevel = _.get(currentVars, `${path}.ev_level`, 0);
          const newEvLevel = value.ev_level;
          
          console.log(`${PLUGIN_NAME} [EV_LEVEL] 路径: ${path}, 当前: ${currentEvLevel}, AI输出: ${newEvLevel}`);
          
          // 智能判断：小于当前值 -> 累加；大于等于当前值 -> 替换
          if (newEvLevel < currentEvLevel) {
            value.ev_level = currentEvLevel + newEvLevel;
            console.log(`${PLUGIN_NAME} [EV_LEVEL] 检测到小值，累加模式: ${currentEvLevel} + ${newEvLevel} = ${value.ev_level}`);
          } else {
            console.log(`${PLUGIN_NAME} [EV_LEVEL] 检测到大值，替换模式: ${currentEvLevel} -> ${newEvLevel}`);
          }
        }
        
        // 构建嵌套路径
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        
        current[parts[parts.length - 1]] = value;
      }
      
      console.log(`${PLUGIN_NAME} [DEBUG] 准备更新 ERA 变量:`, JSON.stringify(nestedData, null, 2));
      
      // 使用 era:updateByObject 更新
      eventEmit('era:updateByObject', nestedData);
      
      // 短暂延迟后 resolve
      setTimeout(() => {
        console.log(`${PLUGIN_NAME} [DEBUG] ERA 变量更新已发送`);
        resolve();
      }, 100);
    });
  }

  /**
   * 插入ERA变量（新增）
   */
  function insertEraVars(data) {
    eventEmit('era:insertByObject', data);
  }

  /**
   * 删除ERA变量
   * @param {object} data - 要删除的数据对象（值为 {} 表示删除该节点）
   */
  function deleteEraVars(data) {
    eventEmit('era:deleteByObject', data);
  }

  // ============================================
  //    玩家队伍管理
  // ============================================

  /**
   * 获取玩家队伍数据
   */
  async function getPlayerParty() {
    const eraVars = await getEraVars();
    if (!eraVars) return null;

    const playerData = getEraValue(eraVars, 'player', null);
    return playerData;
  }

  /**
   * 创建空的宝可梦槽位模板
   */
  function createEmptySlot(slotNum) {
    return {
      slot: slotNum,
      name: null,
      nickname: null,
      species: null,
      gender: null,
      lv: null,
      quality: null,
      nature: null,
      ability: null,
      shiny: false,
      item: null,
      mechanic: null,
      teraType: null,
      isAce: false,
      isLead: false,
      friendship: {
        avs: { trust: 0, passion: 0, insight: 0, devotion: 0 },
        av_up: { trust: 0, passion: 0, insight: 0, devotion: 0 }
      },
      moves: {
        move1: null,
        move2: null,
        move3: null,
        move4: null
      },
      stats_meta: {
        ivs: {
          hp: null,
          atk: null,
          def: null,
          spa: null,
          spd: null,
          spe: null
        },
        ev_level: 0,
        ev_up: 0
      },
      notes: null
    };
  }

  /**
   * 【防呆】检查并修复 party 中被设为 null 的槽位
   * 当 AI 错误地将整个 slot 设为 null 时，恢复为空槽位模板
   * @param {object} party - party 对象 {slot1: ..., slot2: ..., ...}
   * @param {boolean} persist - 是否将修复结果持久化到 ERA
   * @returns {object} repairInfo - { repaired: boolean, repairedSlots: string[] }
   */
  // 防呆修复旁路标志：repairNullSlots 设为 true 时，guardDeleteSlots 放行
  let _repairBypass = false;

  async function repairNullSlots(party, persist = true) {
    if (!party || typeof party !== 'object') return { repaired: false, repairedSlots: [] };
    
    const repairedSlots = [];
    
    for (let i = 1; i <= 6; i++) {
      const key = `slot${i}`;
      // 槽位是 null、undefined、或不是对象 → 需要修复
      if (party[key] === null || party[key] === undefined || typeof party[key] !== 'object') {
        const wasValue = party[key];
        const emptySlot = createEmptySlot(i);
        party[key] = emptySlot;
        repairedSlots.push(key);
        console.warn(`${PLUGIN_NAME} [防呆] ${key} 被检测为 ${JSON.stringify(wasValue)}，已恢复为空槽位模板`);
        
        if (persist) {
          // 根据 ERA 规则：Edit 只改不增，无法恢复被 null 化的路径
          // 必须先 Delete 损坏的键，再 Insert 新的空模板
          try {
            // 开启旁路，让 guardDeleteSlots 放行本次修复操作
            _repairBypass = true;
            
            // Step 1: VariableDelete - 删除损坏的 slot 节点
            const deleteData = { player: { party: { [key]: {} } } };
            deleteEraVars(deleteData);
            console.log(`${PLUGIN_NAME} [防呆] Step 1: VariableDelete ${key}`);
            
            // 短暂等待删除完成
            await new Promise(r => setTimeout(r, 50));
            
            // Step 2: VariableInsert - 插入全新的空槽位模板
            const insertData = { player: { party: { [key]: emptySlot } } };
            insertEraVars(insertData);
            console.log(`${PLUGIN_NAME} [防呆] Step 2: VariableInsert ${key} 完整模板`);
            
            _repairBypass = false;
            console.log(`${PLUGIN_NAME} [防呆] ✓ ${key} 修复完成 (Delete + Insert)`);
          } catch (e) {
            _repairBypass = false;
            console.error(`${PLUGIN_NAME} [防呆] ${key} 持久化修复失败:`, e);
          }
        }
      }
    }
    
    if (repairedSlots.length > 0) {
      console.log(`${PLUGIN_NAME} [防呆] ✓ 共修复 ${repairedSlots.length} 个损坏槽位: ${repairedSlots.join(', ')}`);
    }
    
    return { repaired: repairedSlots.length > 0, repairedSlots };
  }


  /**
   * 获取所有宝可梦（从 party 和 reserve 中）
   * @param {object} playerData - 玩家数据
   * @returns {array} - 所有宝可梦数组
   */
  function getAllPokemon(playerData) {
    const partyPokemon = parsePartyData(playerData?.party);
    const reservePokemon = parsePartyData(playerData?.reserve);
    return [...partyPokemon, ...reservePokemon];
  }

  /**
   * 设置玩家队伍（已弃用，改用 VariableEdit）
   * 注意：新的槽位格式下，队伍更新应该由 AI 的 VariableEdit 直接操作
   * @param {string} mode - 'full' (全队), 'single' (单个), 'custom' (自定义)
   * @param {string|object} input - 宝可梦名称或自定义数据
   */
  async function setPlayerParty(mode, input = null) {
    console.warn(`${PLUGIN_NAME} setPlayerParty 已弃用，请使用 VariableEdit 直接更新槽位`);
    
    const eraVars = await getEraVars();
    const playerData = getEraValue(eraVars, 'player', { 
      name: '训练家', 
      party: {
        slot1: createEmptySlot(1),
        slot2: createEmptySlot(2),
        slot3: createEmptySlot(3),
        slot4: createEmptySlot(4),
        slot5: createEmptySlot(5),
        slot6: createEmptySlot(6)
      }, 
      reserve: {} 
    });

    // 获取所有宝可梦用于查找
    const allPokemon = getAllPokemon(playerData);

    switch (mode) {
      case 'single':
        // 载入单个宝可梦到 slot1
        if (typeof input === 'string') {
          const found = allPokemon.find(p => 
            p.name?.toLowerCase() === input.toLowerCase() ||
            p.nickname?.toLowerCase() === input.toLowerCase()
          );
          if (found) {
            // 更新 slot1
            updateEraVars({
              'player.party.slot1': found
            });
            console.log(`${PLUGIN_NAME} ✓ 已将 ${found.name} 设置到 slot1`);
            return found;
          } else {
            console.warn(`${PLUGIN_NAME} 未找到宝可梦: ${input}`);
            return null;
          }
        }
        break;

      default:
        console.warn(`${PLUGIN_NAME} 模式 ${mode} 不再支持，请使用 VariableEdit`);
        return null;
    }

    return null;
  }

  // ============================================
  //    AI输出解析
  // ============================================

  /**
   * 解析AI生成的简单战斗格式
   * 
   * AI输出格式示例:
   * <PKM_BATTLE>
   * {
   *   "type": "wild",           // wild | trainer
   *   "enemy_name": "Pikachu",  // 训练家名或野生标识
   *   "party": [
   *     { "name": "Rattata", "lv": 5 }
   *   ],
   *   "lines": {
   *     "start": "野生的皮卡丘出现了！"
   *   }
   * }
   * </PKM_BATTLE>
   */
  /**
   * 移除 JSON 字符串中的注释（支持 // 单行注释和 /* *\/ 多行注释）
   * @param {string} jsonStr - 包含注释的 JSON 字符串
   * @returns {string} - 移除注释后的 JSON 字符串
   */
  function stripJsonComments(jsonStr) {
    let result = '';
    let i = 0;
    let inString = false;
    let stringChar = null;
    
    while (i < jsonStr.length) {
      const char = jsonStr[i];
      const nextChar = jsonStr[i + 1];
      
      // 处理字符串
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
        result += char;
        i++;
        continue;
      }
      
      if (inString) {
        result += char;
        // 检查转义字符
        if (char === '\\' && nextChar) {
          result += nextChar;
          i += 2;
          continue;
        }
        // 检查字符串结束
        if (char === stringChar) {
          inString = false;
          stringChar = null;
        }
        i++;
        continue;
      }
      
      // 处理单行注释 //
      if (char === '/' && nextChar === '/') {
        // 跳过直到行尾
        i += 2;
        while (i < jsonStr.length && jsonStr[i] !== '\n' && jsonStr[i] !== '\r') {
          i++;
        }
        continue;
      }
      
      // 处理多行注释 /* */
      if (char === '/' && nextChar === '*') {
        // 跳过直到 */
        i += 2;
        while (i < jsonStr.length - 1) {
          if (jsonStr[i] === '*' && jsonStr[i + 1] === '/') {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      }
      
      // 普通字符
      result += char;
      i++;
    }
    
    return result;
  }

  /**
   * 从原始文本中提取 JSON 候选字符串（参考 ERA 脚本的 extractJsonCandidate）
   */
  function extractJsonCandidate(rawText) {
    if (!rawText) return null;
    const trimmed = rawText.trim();
    if (!trimmed) return null;

    // 如果已经是 JSON 开头，直接返回
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      // 找到匹配的结束括号
      const closingChar = trimmed.startsWith('{') ? '}' : ']';
      const endIndex = trimmed.lastIndexOf(closingChar);
      if (endIndex !== -1) {
        return trimmed.slice(0, endIndex + 1);
      }
      return trimmed;
    }

    // 否则找第一个 { 或 [
    const braceIndex = trimmed.indexOf('{');
    let startIndex = -1;
    let closingChar = null;

    if (braceIndex !== -1) {
      startIndex = braceIndex;
      closingChar = '}';
    } else {
      const bracketIndex = trimmed.indexOf('[');
      if (bracketIndex !== -1) {
        startIndex = bracketIndex;
        closingChar = ']';
      }
    }

    if (startIndex === -1) {
      return null;
    }

    const sliced = trimmed.slice(startIndex);
    const endIndex = closingChar ? sliced.lastIndexOf(closingChar) : -1;
    if (endIndex !== -1) {
      return sliced.slice(0, endIndex + 1);
    }
    return sliced;
  }

  function parseAiBattleOutput(messageText) {
    // 预处理：移除 SillyTavern 的 thinking tags 之前的所有内容
    // 这些标签内的内容是 AI 的思考过程，不应该被解析
    let cleanedText = messageText;
    
    // 移除从文本开头到 </planning> 标签的所有内容（包括标签本身）
    cleanedText = cleanedText.replace(/[\s\S]*<\/planning>/gi, '');
    
    // 移除从文本开头到 </think> 标签的所有内容（包括标签本身）
    cleanedText = cleanedText.replace(/[\s\S]*<\/think>/gi, '');
    
    // 在清理后的文本中查找 PKM_BATTLE 标签
    const regex = new RegExp(`<${PKM_BATTLE_TAG}>([\\s\\S]*?)<\\/${PKM_BATTLE_TAG}>`, 'gi');
    let match = null;
    let latestMatch = null;
    while ((match = regex.exec(cleanedText)) !== null) {
      latestMatch = match;
    }

    if (!latestMatch) return null;

    try {
      const jsonStr = extractJsonCandidate(latestMatch[1]);
      if (!jsonStr) {
        throw new Error('未找到合法的JSON对象');
      }

      console.log(`${PLUGIN_NAME} 提取到JSON字符串:`, jsonStr.substring(0, 100) + '...');
      
      // 移除 JSON 中的注释（// 单行注释 和 /* */ 多行注释）
      const jsonWithoutComments = stripJsonComments(jsonStr);
      
      const battleData = JSON.parse(jsonWithoutComments);
      console.log(`${PLUGIN_NAME} 解析到AI战斗数据:`, battleData);
      
      // 转换 p1/p2 格式为 player/enemy 格式
      return normalizeP1P2Format(battleData);
    } catch (e) {
      console.error(`${PLUGIN_NAME} 解析AI战斗数据失败:`, e);
      return null;
    }
  }

  /**
   * 将 p1/p2 双人对战格式转换为标准 player/enemy 格式
   * @param {object} battleData - 原始战斗数据
   * @returns {object} - 标准化后的战斗数据
   */
  /**
   * 从训练家数据库中提取指定宝可梦
   * @param {string} trainerName - 训练家名字
   * @param {Array} pokemonNames - 宝可梦名字列表
   * @param {number} tier - 难度等级
   * @returns {Array} - 提取的宝可梦数据
   */
  function extractPokemonFromTrainerDB(trainerName, pokemonNames, tier = 2) {
    console.log(`${PLUGIN_NAME} [DEBUG] 尝试从训练家数据库提取: ${trainerName}, 宝可梦: ${pokemonNames.join(', ')}, Tier: ${tier}`);
    
    // 检查是否是"玩家"关键词（不查数据库，返回空让后续从 ERA 变量提取）
    const playerKeywords = ['player', '玩家', '主角', '训练家', '{{user}}', 'user'];
    const normalizedName = trainerName.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
    
    // 支持 {{user}} 宏匹配
    const isPlayer = playerKeywords.some(kw => normalizedName.includes(kw) || trainerName.includes(kw)) || 
                     trainerName === '{{user}}' || 
                     trainerName.includes('{{user}}');
    
    if (isPlayer) {
      console.log(`${PLUGIN_NAME} [DEBUG] "${trainerName}" 是玩家，从 ERA 变量提取`);
      return { party: [], unlocks: null }; // 返回空，让后续逻辑从 ERA 变量提取
    }
    
    const db = getTrainerDatabase();
    
    // 尝试别名匹配
    const aliasMap = {
      'hexmaniac': 'hex',
      'ionostreamer': 'iono',
      'nanjamo': 'iono',
      'hikari': 'dawn',
      'mei': 'rosa',
      'yuuri': 'gloria'
    };
    
    const matchedKey = aliasMap[normalizedName] || normalizedName;
    console.log(`${PLUGIN_NAME} [DEBUG] 训练家名字匹配: "${trainerName}" -> "${normalizedName}" -> "${matchedKey}"`);
    
    const trainerData = db[matchedKey];
    
    if (!trainerData) {
      console.log(`${PLUGIN_NAME} [DEBUG] 训练家 "${trainerName}" 不在数据库中，无法提取宝可梦`);
      console.log(`${PLUGIN_NAME} [DEBUG] 可用的训练家:`, Object.keys(db).join(', '));
      return { party: [], unlocks: null };
    }
    
    // 获取指定 tier 的队伍，如果不存在则尝试其他 tier
    const validTier = Math.max(1, Math.min(4, tier));
    let tierData = trainerData[validTier];
    let usedTier = validTier;
    
    // 辅助函数：从 tierData 提取 party 数组（支持新旧两种格式）
    // 新格式: { unlocks: {...}, party: [...] }
    // 旧格式: [...] (直接是数组)
    const extractPartyFromTierData = (data) => {
      if (!data) return null;
      if (Array.isArray(data)) return data; // 旧格式
      if (data.party && Array.isArray(data.party)) return data.party; // 新格式
      return null;
    };
    
    // 辅助函数：从 tierData 提取 unlocks 对象
    const extractUnlocksFromTierData = (data) => {
      if (!data) return null;
      if (Array.isArray(data)) return null; // 旧格式没有 unlocks
      if (data.unlocks) return data.unlocks; // 新格式
      return null;
    };
    
    let party = extractPartyFromTierData(tierData);
    let unlocks = extractUnlocksFromTierData(tierData);
    
    if (!party) {
      // 尝试找到任意可用的 tier
      const availableTiers = Object.keys(trainerData).filter(k => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
      console.log(`${PLUGIN_NAME} [DEBUG] 训练家 "${trainerName}" 没有 Tier ${validTier}，可用: ${availableTiers.join(', ')}`);
      
      if (availableTiers.length > 0) {
        // 自纠正规则：
        // 1. Tier 3 不存在 -> 默认 Tier 4
        // 2. Tier 1 不存在且是 Cynthia -> 默认 Tier 2
        // 3. 其他情况 -> 选择最接近的
        if (validTier === 3 && !availableTiers.includes(3) && availableTiers.includes(4)) {
          usedTier = 4;
          console.log(`${PLUGIN_NAME} [自纠正] Tier 3 不存在，使用 Tier 4`);
        } else if (validTier === 1 && !availableTiers.includes(1) && matchedKey === 'cynthia' && availableTiers.includes(2)) {
          usedTier = 2;
          console.log(`${PLUGIN_NAME} [自纠正] Cynthia 没有 Tier 1，使用 Tier 2`);
        } else {
          // 优先选择最接近请求 tier 的
          usedTier = availableTiers.reduce((prev, curr) => 
            Math.abs(curr - validTier) < Math.abs(prev - validTier) ? curr : prev
          );
          console.log(`${PLUGIN_NAME} [DEBUG] 使用最接近的 Tier ${usedTier} 作为替代`);
        }
        tierData = trainerData[usedTier];
        party = extractPartyFromTierData(tierData);
        unlocks = extractUnlocksFromTierData(tierData);
      }
    }
    
    if (!party) {
      console.log(`${PLUGIN_NAME} [DEBUG] 训练家 "${trainerName}" 没有可用的配置`);
      return { party: [], unlocks: null };
    }
    
    console.log(`${PLUGIN_NAME} [DEBUG] ${trainerName} Tier ${usedTier} 队伍:`, party.map(p => p.name).join(', '));
    if (unlocks) {
      console.log(`${PLUGIN_NAME} [DEBUG] ${trainerName} Tier ${usedTier} unlocks:`, unlocks);
    }
    
    // 如果 pokemonNames 为空，返回完整队伍和 unlocks
    if (!pokemonNames || pokemonNames.length === 0) {
      console.log(`${PLUGIN_NAME} [DEBUG] 返回 ${trainerName} 的完整队伍 (${party.length} 只)`);
      return { party, unlocks };
    }
    
    // 从队伍中提取指定的宝可梦
    const extracted = [];
    for (const pokemonName of pokemonNames) {
      const normalizedPokemonName = pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const found = party.find(p => {
        const pName = (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return pName === normalizedPokemonName || pName.includes(normalizedPokemonName) || normalizedPokemonName.includes(pName);
      });
      
      if (found) {
        extracted.push(found);
        console.log(`${PLUGIN_NAME} [DEBUG] ✓ 从 ${trainerName} 数据库提取: ${found.name}, mechanic: ${found.mechanic || 'null'}`);
      } else {
        // 数据库中找不到，标记为需要生成
        console.warn(`${PLUGIN_NAME} [DEBUG] ✗ 在 ${trainerName} 的队伍中找不到: ${pokemonName}，将根据 tier 生成`);
        extracted.push({ name: pokemonName, _needGenerate: true, _tier: tier });
      }
    }
    
    return { party: extracted, unlocks };
  }

  /**
   * 检测训练家类型：固定NPC / 生成式NPC / 野生
   * @param {string} name - 训练家名字
   * @param {string} type - 显式指定的类型 ('wild', 'trainer', etc)
   * @returns {string} - 'db_trainer' | 'generated_trainer' | 'wild'
   */
  function detectTrainerType(name, type = '') {
    const normalizedName = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 检查是否是玩家（{{user}} 宏或玩家关键词）
    const playerKeywords = ['player', '玩家', '主角', 'user'];
    const isPlayer = playerKeywords.some(kw => normalizedName.includes(kw)) || 
                     name === '{{user}}' || 
                     name.includes('{{user}}');
    
    if (isPlayer) {
      return 'player'; // 玩家（从 ERA 变量提取）
    }
    
    // 显式指定或名称包含 wild/野生 -> 野生
    if (type.toLowerCase() === 'wild' || normalizedName.includes('wild') || /野生/.test(name || '')) {
      return 'wild';
    }
    
    // 检查是否在数据库中
    const db = getTrainerDatabase();
    
    // 别名映射
    const aliasMap = {
      'hexmaniac': 'hex', 'ionostreamer': 'iono', 'nanjamo': 'iono',
      'hikari': 'dawn', 'mei': 'rosa', 'yuuri': 'gloria'
    };
    const matchedKey = aliasMap[normalizedName] || normalizedName;
    
    if (db[matchedKey]) {
      return 'db_trainer'; // 固定NPC（数据库中存在）
    }
    
    return 'generated_trainer'; // 生成式NPC（数据库中不存在）
  }

  /**
   * 处理单个训练家的队伍数据
   * @param {object} trainer - 训练家配置 { name, party, tier, type }
   * @param {number} defaultTier - 默认难度等级
   * @returns {object} - { name, party: [...], trainerType, isPlayer }
   */
  function processTrainerParty(trainer, defaultTier = 2) {
    const trainerName = trainer.name || 'Unknown';
    const tier = trainer.tier || defaultTier;
    const trainerType = detectTrainerType(trainerName, trainer.type || '');
    
    console.log(`${PLUGIN_NAME} [DOUBLE] 处理训练家: ${trainerName}, 类型: ${trainerType}, Tier: ${tier}`);
    
    // 检查是否是玩家（从 ERA 变量提取）
    const playerKeywords = ['player', '玩家', '主角', '{{user}}', 'user'];
    const isPlayer = playerKeywords.some(kw => 
      trainerName.toLowerCase().includes(kw.toLowerCase())
    ) || trainerName === '{{user}}' || trainerName.includes('{{user}}');
    
    let resolvedParty = [];
    let dbUnlocks = null; // 从数据库获取的 unlocks
    
    if (isPlayer) {
      // 玩家：从 ERA 变量提取，party 只是名字列表
      console.log(`${PLUGIN_NAME} [DOUBLE] "${trainerName}" 是玩家，队伍将从 ERA 变量提取`);
      resolvedParty = trainer.party || []; // 保持原样，后续 resolveTrainerParty 处理
    } else if (trainerType === 'db_trainer') {
      // 固定NPC：从数据库提取完整数据
      if (trainer.party && Array.isArray(trainer.party)) {
        // 检查 AI 是否提供了详细的宝可梦对象（包含 lv/moves 等）
        const hasDetailedParty = trainer.party.some(p => 
          typeof p === 'object' && (p.lv !== undefined || p.moves !== undefined)
        );
        
        if (hasDetailedParty) {
          // AI 提供了详细数据，直接使用（模式 B：现场实例化）
          // 但仍然需要从数据库获取该训练家的 unlocks
          console.log(`${PLUGIN_NAME} [DOUBLE] ${trainerName} 使用 AI 提供的详细队伍数据`);
          resolvedParty = trainer.party.map(p => {
            if (typeof p === 'string') return { name: p, _needGenerate: true, _tier: tier };
            return { ...p, _needGenerate: true, _tier: tier };
          });
          // 获取数据库中该训练家的 unlocks
          const dbResult = extractPokemonFromTrainerDB(trainerName, [], tier);
          dbUnlocks = dbResult.unlocks;
        } else {
          // AI 只提供了名字列表，从数据库提取（模式 A：库数据引用）
          const pokemonNames = trainer.party.map(p => typeof p === 'string' ? p : p.name);
          const dbResult = extractPokemonFromTrainerDB(trainerName, pokemonNames, tier);
          const dbPokemon = dbResult.party || dbResult; // 兼容新旧返回格式
          dbUnlocks = dbResult.unlocks;
          
          if (dbPokemon.length > 0) {
            resolvedParty = dbPokemon;
          } else {
            // 数据库中找不到指定宝可梦，使用 AI 提供的数据生成
            console.log(`${PLUGIN_NAME} [DOUBLE] 数据库中找不到指定宝可梦，使用生成模式`);
            resolvedParty = trainer.party.map(p => {
              if (typeof p === 'string') return { name: p, _needGenerate: true, _tier: tier };
              return { ...p, _needGenerate: true, _tier: tier };
            });
          }
        }
      } else {
        // 没有指定具体宝可梦，从数据库获取完整队伍
        const dbResult = lookupTrainerFromDB(trainerName, tier);
        if (dbResult && dbResult.party) {
          resolvedParty = dbResult.party;
          dbUnlocks = dbResult.unlocks;
        }
      }
      
      if (dbUnlocks) {
        console.log(`${PLUGIN_NAME} [DOUBLE] ${trainerName} 数据库 unlocks:`, dbUnlocks);
      }
    } else if (trainerType === 'wild') {
      // 野生：必须使用 AI 提供的生成式数据
      console.log(`${PLUGIN_NAME} [DOUBLE] 野生模式，使用 AI 提供的数据`);
      resolvedParty = (trainer.party || []).map(p => {
        if (typeof p === 'string') return { name: p, _needGenerate: true, _tier: tier };
        return { ...p, _needGenerate: true, _tier: tier };
      });
    } else {
      // 生成式NPC：使用 AI 提供的数据
      console.log(`${PLUGIN_NAME} [DOUBLE] 生成式NPC "${trainerName}"，使用 AI 提供的数据`);
      resolvedParty = (trainer.party || []).map(p => {
        if (typeof p === 'string') return { name: p, _needGenerate: true, _tier: tier };
        return { ...p, _needGenerate: true, _tier: tier };
      });
    }
    
    // 自动检测 mechanic 字段并设置 unlock 权限
    const autoDetectedUnlocks = detectUnlocksFromParty(resolvedParty);
    // 合并：AI 指定 > 数据库 > 自动检测
    const finalUnlocks = mergeUnlocks(trainer.unlocks, dbUnlocks, autoDetectedUnlocks);
    
    console.log(`${PLUGIN_NAME} [DOUBLE] ${trainerName} 最终 unlocks:`, finalUnlocks);
    
    return {
      name: trainerName,
      party: resolvedParty,
      trainerType,
      isPlayer,
      tier,
      unlocks: finalUnlocks,
      lines: trainer.lines
    };
  }

  /**
   * 根据队伍中的 mechanic 字段自动检测需要的 unlock 权限
   * @param {Array} party - 队伍数组
   * @returns {object} 自动检测到的 unlocks
   */
  function detectUnlocksFromParty(party) {
    const detected = {
      enable_mega: false,
      enable_dynamax: false,
      enable_tera: false,
      enable_z_move: false
    };
    
    if (!Array.isArray(party)) return detected;
    
    for (const pokemon of party) {
      const mechanic = (pokemon.mechanic || '').toLowerCase();
      if (mechanic === 'mega') detected.enable_mega = true;
      if (mechanic === 'dynamax' || mechanic === 'gmax') detected.enable_dynamax = true;
      if (mechanic === 'tera') detected.enable_tera = true;
      if (mechanic === 'z_move' || mechanic === 'zmove' || mechanic === 'z') detected.enable_z_move = true;
    }
    
    return detected;
  }

  /**
   * 合并多个 unlocks 对象，只保留值为 true 的属性
   * @param {...object} unlocksList - 多个 unlocks 对象
   * @returns {object} 合并后的 unlocks
   */
  function mergeUnlocks(...unlocksList) {
    const merged = {
      enable_bond: false,
      enable_styles: false,
      enable_insight: false,
      enable_mega: false,
      enable_z_move: false,
      enable_dynamax: false,
      enable_tera: false,
      enable_proficiency_cap: false  // 训练度突破155上限
    };
    
    for (const unlocks of unlocksList) {
      if (!unlocks) continue;
      for (const key of Object.keys(merged)) {
        if (unlocks[key] === true) {
          merged[key] = true;
        }
      }
    }
    
    return merged;
  }

  /**
   * 合并多个训练家的队伍，限制最多6只
   * @param {Array} trainersData - 训练家数据数组
   * @returns {object} - { party, trainerMetadata, names }
   */
  function mergeTrainerParties(trainersData) {
    const allParty = [];
    const trainerMetadata = [];
    const names = [];
    
    trainersData.forEach(t => {
      names.push(t.name);
      t.party.forEach(p => {
        allParty.push(p);
        trainerMetadata.push(t.name);
      });
    });
    
    // 如果超过6只，随机剔除
    if (allParty.length > 6) {
      console.log(`${PLUGIN_NAME} [DOUBLE] 队伍超过6只 (${allParty.length})，随机剔除至6只`);
      
      // 随机打乱后取前6个
      const indices = allParty.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      const keepIndices = indices.slice(0, 6).sort((a, b) => a - b);
      const trimmedParty = keepIndices.map(i => allParty[i]);
      const trimmedMetadata = keepIndices.map(i => trainerMetadata[i]);
      
      console.log(`${PLUGIN_NAME} [DOUBLE] 剔除后队伍: ${trimmedParty.map(p => typeof p === 'string' ? p : p.name).join(', ')}`);
      
      return {
        party: trimmedParty,
        trainerMetadata: trimmedMetadata,
        names: names.join(' & ')
      };
    }
    
    return {
      party: allParty,
      trainerMetadata,
      names: names.join(' & ')
    };
  }

  function normalizeP1P2Format(battleData) {
    // 如果已经是标准格式，直接返回
    if (battleData.player || battleData.enemy) {
      return battleData;
    }
    
    // 检测 p1/p2 格式
    if (!battleData.p1 && !battleData.p2) {
      return battleData;
    }
    
    console.log(`${PLUGIN_NAME} ========== 双打模式转换开始 ==========`);
    
    const normalized = {
      difficulty: battleData.difficulty || 'normal',
      battle_type: battleData.battle_type || 'double'
    };
    
    const defaultTier = battleData.tier || 2;
    
    // ========== 转换 p1 (玩家方) ==========
    if (battleData.p1) {
      // 兼容 entrants (V4) 和 trainers (旧版)
      const p1Entrants = battleData.p1.entrants || battleData.p1.trainers;
      if (p1Entrants && Array.isArray(p1Entrants)) {
        // 多实体对战格式
        console.log(`${PLUGIN_NAME} [P1] 多实体模式: ${p1Entrants.length} 人`);
        
        const trainersData = p1Entrants.map(t => 
          processTrainerParty(t, defaultTier)
        );
        
        const merged = mergeTrainerParties(trainersData);
        
        // 合并 unlocks（将所有训练家的 unlocks 中为 true 的属性合并）
        console.log(`${PLUGIN_NAME} [P1] 各训练家 unlocks:`, trainersData.map(t => ({ name: t.name, unlocks: t.unlocks })));
        const mergedUnlocks = mergeUnlocks(...trainersData.map(t => t.unlocks));
        console.log(`${PLUGIN_NAME} [P1] 合并后的 unlocks:`, mergedUnlocks);
        
        normalized.player = {
          name: merged.names,
          party: merged.party,
          _trainerMetadata: merged.trainerMetadata,
          _trainersData: trainersData, // 保存完整训练家信息供后续使用
          unlocks: battleData.p1.unlocks || mergedUnlocks // 优先使用 AI 指定的 unlocks，否则合并各训练家的 unlocks
        };
        
        console.log(`${PLUGIN_NAME} [P1] 转换完成: ${merged.names}, 队伍: ${merged.party.map(p => typeof p === 'string' ? p : p.name).join(', ')}`);
      } else {
        // 单人格式
        normalized.player = battleData.p1;
      }
    }
    
    // ========== 转换 p2 (敌方) ==========
    if (battleData.p2) {
      // 兼容 entrants (V4) 和 trainers (旧版)
      const p2Entrants = battleData.p2.entrants || battleData.p2.trainers;
      if (p2Entrants && Array.isArray(p2Entrants)) {
        // 多实体对战格式
        console.log(`${PLUGIN_NAME} [P2] 多实体模式: ${p2Entrants.length} 人`);
        
        const trainersData = p2Entrants.map(t => 
          processTrainerParty(t, defaultTier)
        );
        
        const merged = mergeTrainerParties(trainersData);
        
        // 确定敌方类型：如果任一训练家是 wild，整体为 wild
        const hasWild = trainersData.some(t => t.trainerType === 'wild');
        const allDbTrainers = trainersData.every(t => t.trainerType === 'db_trainer');
        
        // 合并 lines（取第一个有 lines 的训练家）
        const firstWithLines = trainersData.find(t => t.lines);
        
        // 合并 unlocks（将所有训练家的 unlocks 中为 true 的属性合并）
        const mergedUnlocks = mergeUnlocks(...trainersData.map(t => t.unlocks));
        
        normalized.enemy = {
          type: hasWild ? 'wild' : 'trainer',
          name: merged.names,
          party: merged.party,
          _trainerMetadata: merged.trainerMetadata,
          _trainersData: trainersData,
          lines: battleData.p2.lines || (firstWithLines ? firstWithLines.lines : {}),
          unlocks: battleData.p2.unlocks || mergedUnlocks,
          // 如果全是数据库训练家，难度可能更高
          _allDbTrainers: allDbTrainers
        };
        
        console.log(`${PLUGIN_NAME} [P2] 转换完成: ${merged.names}, 类型: ${normalized.enemy.type}`);
      } else {
        // 单人格式（兼容旧格式）
        const trainerData = processTrainerParty({
          name: battleData.p2.name,
          party: battleData.p2.party,
          tier: battleData.p2.tier || defaultTier,
          type: battleData.p2.type,
          unlocks: battleData.p2.unlocks,
          lines: battleData.p2.lines
        }, defaultTier);
        
        normalized.enemy = {
          type: trainerData.trainerType === 'wild' ? 'wild' : 'trainer',
          name: trainerData.name,
          party: trainerData.party,
          lines: battleData.p2.lines || {},
          unlocks: battleData.p2.unlocks || trainerData.unlocks,
          tier: battleData.p2.tier
        };
        
        console.log(`${PLUGIN_NAME} [P2] 单训练家: ${trainerData.name}, 类型: ${trainerData.trainerType}`);
      }
    }
    
    // ========== 保留其他顶层字段 ==========
    // 保留 environment（环境配置）
    if (battleData.environment) {
      normalized.environment = battleData.environment;
      console.log(`${PLUGIN_NAME} [ENV] 保留 AI 传入的环境配置:`, battleData.environment.overlay?.env_name || battleData.environment.weather || 'none');
    }
    
    // 保留 script（脚本）
    if (battleData.script) {
      normalized.script = battleData.script;
    }
    
    // 保留 settings（设置）
    if (battleData.settings) {
      normalized.settings = battleData.settings;
    }
    
    console.log(`${PLUGIN_NAME} ========== 双打模式转换完成 ==========`);
    return normalized;
  }

  /**
   * 规范技能列表，保证最多4个且为字符串
   */
  function sanitizeMoves(moves) {
    if (!Array.isArray(moves)) return [];
    return moves
      .map(m => (typeof m === 'string' ? m.trim() : ''))
      .filter(Boolean)
      .slice(0, 4);
  }

  /**
   * 自动检测并注入特殊形态（Primal/Crowned）
   * @param {string} pokemonName - 宝可梦名称
   * @returns {string|null} - 形态标记 ('primal', 'crowned') 或 null
   */
  function autoDetectSpecialForm(pokemonName) {
    if (!pokemonName) return null;
    const name = pokemonName.toLowerCase().trim();
    
    // Primal Reversion（原始回归）
    if (name === 'kyogre' || name === 'groudon') {
      return 'primal';
    }
    
    // Crowned Form（剑盾之王）
    if (name === 'zacian' || name === 'zamazenta') {
      return 'crowned';
    }
    
    return null;
  }

  // ============================================
  //    双轨制数据库 & 随机生成器
  // ============================================

  // 性格列表（用于随机抽取）
  const NATURES = [
    'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
    'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
    'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
    'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
    'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
  ];

  // 训练家数据库引用（已内置 trainer_data.js）
  // 格式: { 'iono': IONO_DATA, 'cynthia': CYNTHIA_DATA, ... }
  function getTrainerDatabase() {
    const db = {};
    const trainerGlobals = [
      ['gloria', 'GLORIA_DATA'],
      ['selene', 'SELENE_DATA'],
      ['rosa', 'ROSA_DATA'],
      ['dawn', 'DAWN_DATA'],
      ['akari', 'AKARI_DATA'],
      ['serena', 'SERENA_DATA'],
      ['juliana', 'JULIANA_DATA'],
      ['lusamine', 'LUSAMINE_DATA'],
      ['lillie', 'LILLIE_DATA'],
      ['mallow', 'MALLOW_DATA'],
      ['lana', 'LANA_DATA'],
      ['irida', 'IRIDA_DATA'],
      ['sonia', 'SONIA_DATA'],
      ['roxie', 'ROXIE_DATA'],
      ['iono', 'IONO_DATA'],
      ['erika', 'ERIKA_DATA'],
      ['nessa', 'NESSA_DATA'],
      ['marnie', 'MARNIE_DATA'],
      ['hex', 'HEX_DATA'],
      ['bea', 'BEA_DATA'],
      ['cynthia', 'CYNTHIA_DATA'],
      ['may', 'MAY_DATA'],
      ['lacey', 'LACEY_DATA'],
      ['misty', 'MISTY_DATA'],
      ['acerola', 'ACEROLA_DATA'],
      ['skyla', 'SKYLA_DATA'],
      ['iris', 'IRIS_DATA'],
      ['nemona', 'NEMONA_DATA']
    ];

    const missing = [];
    trainerGlobals.forEach(([key, globalName]) => {
      if (typeof window[globalName] !== 'undefined') {
        db[key] = window[globalName];
      } else {
        missing.push(globalName);
      }
    });

    if (missing.length > 0) {
      console.warn(`${PLUGIN_NAME} [DEBUG] 缺失的全局变量:`, missing.join(', '));
    }

    return db;
  }

  /**
   * 生成随机个体值 (IVs)
   * @param {string} quality - 'low' | 'normal' | 'high' | 'perfect'
   * @returns {object} { hp, atk, def, spa, spd, spe }
   */
  function generateRandomIVs(quality = 'normal') {
    const roll = () => Math.floor(Math.random() * 32); // 0-31
    
    switch (quality) {
      case 'low':
        // 低品质：0-15
        return {
          hp: Math.floor(Math.random() * 16),
          atk: Math.floor(Math.random() * 16),
          def: Math.floor(Math.random() * 16),
          spa: Math.floor(Math.random() * 16),
          spd: Math.floor(Math.random() * 16),
          spe: Math.floor(Math.random() * 16)
        };
      case 'high':
        // 高品质：20-31，至少 3V
        const highIvs = { hp: roll(), atk: roll(), def: roll(), spa: roll(), spd: roll(), spe: roll() };
        const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
        // 随机选 3 个拉满
        const perfectStats = stats.sort(() => Math.random() - 0.5).slice(0, 3);
        perfectStats.forEach(s => highIvs[s] = 31);
        return highIvs;
      case 'perfect':
        // 完美 6V
        return { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
      default:
        // 普通：完全随机
        return { hp: roll(), atk: roll(), def: roll(), spa: roll(), spd: roll(), spe: roll() };
    }
  }

  /**
   * 随机抽取性格
   * @returns {string}
   */
  function getRandomNature() {
    return NATURES[Math.floor(Math.random() * NATURES.length)];
  }

  /**
   * 宝可梦名称规范化器 ("宽进"策略)
   * 将 AI 生成的自然语言形容词转换为标准的 ID 后缀
   * 例如: "Grimer-Alolan" -> "Grimer-Alola"
   * @param {string} rawName - 原始名称
   * @returns {string} 规范化后的名称
   */
  function normalizePokemonName(rawName) {
    if (!rawName) return '';
    let name = String(rawName).trim();
    
    // 处理形容词后缀 (Alolan -> Alola, Galarian -> Galar, etc.)
    const adjectiveMap = [
      { pattern: /-Alolan$/i, replacement: '-Alola' },
      { pattern: /\s+Alolan$/i, replacement: '-Alola' },
      { pattern: /-Galarian$/i, replacement: '-Galar' },
      { pattern: /\s+Galarian$/i, replacement: '-Galar' },
      { pattern: /-Hisuian$/i, replacement: '-Hisui' },
      { pattern: /\s+Hisuian$/i, replacement: '-Hisui' },
      { pattern: /-Paldean$/i, replacement: '-Paldea' },
      { pattern: /\s+Paldean$/i, replacement: '-Paldea' }
    ];

    for (const { pattern, replacement } of adjectiveMap) {
      if (pattern.test(name)) {
        name = name.replace(pattern, replacement);
        console.log(`${PLUGIN_NAME} [NORMALIZE] "${rawName}" -> "${name}"`);
        break;
      }
    }

    return name;
  }

  /**
   * 安全获取宝可梦数据 (带智能回退机制)
   * 策略: 规范化名称 -> 直接查找 -> 修正后缀 -> 回退到基础形态 -> 最终兜底
   * @param {string} pokemonName - 宝可梦名称
   * @returns {object|null} 宝可梦数据对象，包含 { data, usedName, fallbackType }
   */
  function getPokemonDataSafe(pokemonName) {
    if (!pokemonName || typeof POKEDEX === 'undefined') return null;

    // === 第一步: 规范化名称 (宽进) ===
    const normalizedName = normalizePokemonName(pokemonName);
    let id = normalizedName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // === 第二步: 直接查找 ===
    if (POKEDEX[id]) {
      return { data: POKEDEX[id], usedName: normalizedName, fallbackType: 'direct' };
    }

    // === 第三步: 修正常见的形容词后缀错误 ===
    // 处理 "alolan" -> "alola" 等情况
    const suffixFixes = [
      { from: 'alolan', to: 'alola' },
      { from: 'galarian', to: 'galar' },
      { from: 'hisuian', to: 'hisui' },
      { from: 'paldean', to: 'paldea' }
    ];

    for (const fix of suffixFixes) {
      if (id.endsWith(fix.from)) {
        const fixedId = id.slice(0, -fix.from.length) + fix.to;
        if (POKEDEX[fixedId]) {
          console.log(`${PLUGIN_NAME} [SUFFIX FIX] "${id}" -> "${fixedId}"`);
          return { data: POKEDEX[fixedId], usedName: normalizedName, fallbackType: 'suffix_fix' };
        }
      }
    }

    // === 第四步: 智能回退到基础形态 ===
    // 尝试去除横杠或空格后的后缀: "Grimer-Alola" -> "Grimer"
    console.warn(`${PLUGIN_NAME} [FALLBACK] Data missing for "${pokemonName}" (normalized: "${normalizedName}", id: "${id}"). Trying base form...`);
    
    const splitChars = ['-', ' '];
    for (const splitChar of splitChars) {
      if (normalizedName.includes(splitChar)) {
        const potentialBaseName = normalizedName.split(splitChar)[0];
        if (potentialBaseName && potentialBaseName !== normalizedName) {
          const baseId = potentialBaseName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (POKEDEX[baseId]) {
            console.log(`${PLUGIN_NAME} [FALLBACK SUCCESS] Using base species "${potentialBaseName}" (id: "${baseId}") instead of "${normalizedName}"`);
            return { data: POKEDEX[baseId], usedName: potentialBaseName, fallbackType: 'base_form' };
          }
        }
      }
    }

    // === 第五步: 最终兜底 (返回 null，让调用者决定是否使用 Pikachu) ===
    console.error(`${PLUGIN_NAME} [FATAL] Pokemon "${pokemonName}" totally unknown. No fallback available.`);
    return null;
  }

  /**
   * 从 POKEDEX 获取宝可梦的可用特性并随机抽取
   * @param {string} pokemonName
   * @returns {string|null}
   */
  function getRandomAbility(pokemonName) {
    if (typeof POKEDEX === 'undefined') return null;
    
    const result = getPokemonDataSafe(pokemonName);
    if (!result || !result.data || !result.data.abilities) return null;
    
    const data = result.data;
    
    // 收集所有可用特性
    const abilities = [];
    if (data.abilities['0']) abilities.push(data.abilities['0']);
    if (data.abilities['1']) abilities.push(data.abilities['1']);
    // 梦特有较低概率 (20%)
    if (data.abilities['H'] && Math.random() < 0.2) {
      abilities.push(data.abilities['H']);
    }
    
    if (abilities.length === 0) return null;
    return abilities[Math.floor(Math.random() * abilities.length)];
  }

  /**
   * 从 POKEDEX 获取宝可梦的可学技能并随机抽取 4 个
   * @param {string} pokemonName
   * @param {number} level
   * @returns {string[]}
   */
  function getRandomMoves(pokemonName, level = 50) {
    if (typeof POKEDEX === 'undefined' || typeof MOVES === 'undefined') {
      return ['Tackle', 'Scratch', 'Growl', 'Leer']; // Fallback
    }
    
    const result = getPokemonDataSafe(pokemonName);
    if (!result || !result.data) return ['Tackle', 'Scratch', 'Growl', 'Leer'];
    
    const data = result.data;
    
    // 从 learnset 获取可学技能（简化处理）
    // Pokemon Showdown 的 learnset 格式较复杂，这里用类型匹配作为后备
    const pokemonTypes = data.types || ['Normal'];
    const candidateMoves = [];
    
    // 从 MOVES 中筛选同属性或普通属性的攻击技能
    for (const moveId in MOVES) {
      const move = MOVES[moveId];
      if (!move || move.category === 'Status') continue;
      if (pokemonTypes.includes(move.type) || move.type === 'Normal') {
        if (move.basePower && move.basePower > 0 && move.basePower <= 100) {
          candidateMoves.push(move.name);
        }
      }
    }
    
    // 随机抽取 4 个
    const shuffled = candidateMoves.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }

  /**
   * 生成野生宝可梦的完整数据
   * @param {object} baseData - AI 提供的基础数据 { name, lv, shiny?, moves? }
   * @returns {object} 完整的宝可梦数据
   */
  /**
   * 根据 tier 推断默认等级
   * @param {number} tier - 难度等级 (1-4)
   * @returns {number} - 对应的等级
   */
  function getTierDefaultLevel(tier) {
    const tierLevelMap = {
      1: 25,
      2: 50,
      3: 75,
      4: 85
    };
    return tierLevelMap[tier] || 50; // 默认 50 级
  }

  /**
   * 生成野生/自定义宝可梦
   * @param {object} baseData - 基础数据
   * @param {number} tier - 难度等级
   * @param {boolean} isCustomNpc - 是否为自定义 NPC（决定 EV 是否生效）
   */
  function generateWildPokemon(baseData, tier = null, isCustomNpc = false) {
    // 规范化名称 (处理 Alolan/Galarian 等形容词)
    const rawName = baseData.name || 'Rattata';
    const name = normalizePokemonName(rawName);
    
    // 等级优先级：AI 指定 > tier 推断 > 默认 5
    let level = baseData.lv || baseData.level;
    if (!level && tier) {
      level = getTierDefaultLevel(tier);
      console.log(`${PLUGIN_NAME} [GEN] 根据 tier ${tier} 推断等级: ${level}`);
    }
    if (!level) {
      level = 5; // 最终默认值
    }
    
    // 异色判断：AI 指定 > 随机（1/4096 概率）
    const shiny = baseData.shiny !== undefined ? baseData.shiny : (Math.random() < 1/4096);
    
    // quality 字段支持：low/medium/high/perfect
    // 优先使用 AI 指定的 quality，否则根据等级/神兽/闪光自动判断
    let ivQuality = baseData.quality;
    if (!ivQuality) {
      const isLegendary = ['mewtwo', 'mew', 'lugia', 'hooh', 'rayquaza', 'dialga', 'palkia', 'giratina', 
                           'reshiram', 'zekrom', 'kyurem', 'xerneas', 'yveltal', 'zygarde',
                           'solgaleo', 'lunala', 'necrozma', 'zacian', 'zamazenta', 'eternatus',
                           'koraidon', 'miraidon'].includes(name.toLowerCase().replace(/[^a-z0-9]/g, ''));
      // 异色宝可梦至少保证 3V（high）
      ivQuality = shiny ? 'high' : (isLegendary ? 'high' : (level >= 50 ? 'medium' : 'low'));
    }
    
    // quality 映射到 IV 生成
    const qualityMap = {
      'low': 'low',
      'medium': 'normal',
      'high': 'high',
      'perfect': 'perfect'
    };
    const ivs = generateRandomIVs(qualityMap[ivQuality] || ivQuality);
    
    // EV 处理：野生宝可梦没有 EV，自定义 NPC 根据 quality 决定
    let evLevel = 0;
    if (isCustomNpc) {
      // 自定义 NPC：quality 决定 EV
      const evLevelMap = {
        'low': Math.min(30, Math.floor(level * 0.3)),
        'medium': Math.min(100, Math.floor(level * 0.8)),
        'high': Math.min(200, Math.floor(level * 1.5)),
        'perfect': 252
      };
      evLevel = evLevelMap[ivQuality] || Math.min(30, Math.floor(level * 0.5));
    }
    // 野生宝可梦：evLevel = 0（无 EV）
    
    // ST 插件没有 POKEDEX，只做名称规范化，数据验证由前端处理
    // 规范化后的名称传给前端，前端的 battle-engine.js 会做智能回退
    const finalName = name;
    console.log(`${PLUGIN_NAME} [GEN] Pokemon name normalized: "${rawName}" -> "${finalName}"`);
    
    // 随机性格和特性
    const nature = baseData.nature || getRandomNature();
    const ability = baseData.ability || getRandomAbility(finalName);
    
    // 技能：优先使用 AI 指定，否则随机生成 (使用最终确定的名称)
    const moves = (baseData.moves && baseData.moves.length > 0) 
      ? sanitizeMoves(baseData.moves) 
      : getRandomMoves(finalName, level);
    
    // 性别随机
    const gender = baseData.gender || (Math.random() > 0.5 ? 'M' : 'F');
    
    // 自动检测特殊形态 (使用最终确定的名称)
    const autoForm = autoDetectSpecialForm(finalName);
    
    return {
      name: finalName,
      gender: gender,
      lv: level,
      nature: nature,
      ability: ability,
      shiny: shiny,
      item: baseData.item || null,
      mechanic: baseData.mechanic || null,
      teraType: baseData.teraType || null,
      stats_meta: {
        ivs: ivs,
        ev_level: evLevel
      },
      moves: moves,
      mega: baseData.mega || autoForm
    };
  }

  /**
   * 从训练家数据库查找配置
   * @param {string} trainerName - 训练家名称
   * @param {number} tier - 难度等级 (1-4)
   * @returns {object|null} { party: [...], unlocks: {...}, difficulty: '...' }
   */
  function lookupTrainerFromDB(trainerName, tier = 2) {
    const db = getTrainerDatabase();
    const normalizedName = trainerName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 别名映射表（支持多种输入方式）
    const aliasMap = {
      'hexmaniac': 'hex',
      'hexgirl': 'hex',
      'ionostreamer': 'iono',
      'nanjamo': 'iono',  // 日文名
      'champion cynthia': 'cynthia',
      'championcynthia': 'cynthia',
      'shirona': 'cynthia',  // 日文名
      'gym leader nessa': 'nessa',
      'gymleadernessa': 'nessa',
      'gym leader bea': 'bea',
      'gymleaderbea': 'bea',
      'gym leader erika': 'erika',
      'gymleadererika': 'erika',
      'gym leader marnie': 'marnie',
      'gymleadermarnie': 'marnie',
      'professor sonia': 'sonia',
      'professorsonia': 'sonia',
      'captain mallow': 'mallow',
      'captainmallow': 'mallow',
      'captain lana': 'lana',
      'captainlana': 'lana',
      'aether president lusamine': 'lusamine',
      'presidentlusamine': 'lusamine',
      'hikari': 'dawn',  // 日文名
      'mei': 'rosa',  // 日文名
      'serena kalos': 'serena',
      'yuuri': 'gloria',  // 日文名
      'gloriagalar': 'gloria'
    };
    
    // 尝试直接匹配或别名匹配
    let matchedKey = normalizedName;
    if (!db[normalizedName]) {
      // 尝试别名
      if (aliasMap[normalizedName]) {
        matchedKey = aliasMap[normalizedName];
        console.log(`${PLUGIN_NAME} [DEBUG] 别名匹配: "${normalizedName}" -> "${matchedKey}"`);
      } else {
        // 尝试部分匹配（名字包含数据库 key）
        const dbKeys = Object.keys(db);
        const partialMatch = dbKeys.find(key => normalizedName.includes(key) || key.includes(normalizedName));
        if (partialMatch) {
          matchedKey = partialMatch;
          console.log(`${PLUGIN_NAME} [DEBUG] 部分匹配: "${normalizedName}" -> "${matchedKey}"`);
        }
      }
    }
    
    // 在数据库中查找
    const trainerData = db[matchedKey];
    if (!trainerData) {
      console.log(`${PLUGIN_NAME} 训练家 "${trainerName}" (${normalizedName}) 不在数据库中，将使用随机生成`);
      return null;
    }
    
    // 获取指定 tier 的队伍，带自纠正
    const validTier = Math.max(1, Math.min(4, tier));
    let tierData = trainerData[validTier];
    let usedTier = validTier;
    
    // 辅助函数：从 tierData 提取 party 数组（支持新旧两种格式）
    const extractParty = (data) => {
      if (!data) return null;
      if (Array.isArray(data)) return data; // 旧格式
      if (data.party && Array.isArray(data.party)) return data.party; // 新格式
      return null;
    };
    
    // 辅助函数：从 tierData 提取 unlocks 对象
    const extractUnlocks = (data) => {
      if (!data) return null;
      if (Array.isArray(data)) return null; // 旧格式没有 unlocks
      if (data.unlocks) return data.unlocks; // 新格式
      return null;
    };
    
    // 辅助函数：从 tierData 提取 trainerProficiency
    const extractProficiency = (data) => {
      if (!data) return 0;
      if (Array.isArray(data)) return 0; // 旧格式没有 trainerProficiency
      if (typeof data.trainerProficiency === 'number') return data.trainerProficiency;
      return 0;
    };
    
    let party = extractParty(tierData);
    let unlocks = extractUnlocks(tierData);
    let proficiency = extractProficiency(tierData);
    
    if (!party || party.length === 0) {
      // 尝试找到任意可用的 tier
      const availableTiers = Object.keys(trainerData).filter(k => /^\d+$/.test(k)).map(Number).sort((a, b) => a - b);
      console.log(`${PLUGIN_NAME} [DEBUG] 训练家 "${trainerName}" 没有 Tier ${validTier}，可用: ${availableTiers.join(', ')}`);
      
      if (availableTiers.length > 0) {
        // 自纠正规则：
        // 1. Tier 3 不存在 -> 默认 Tier 4
        // 2. Tier 1 不存在且是 Cynthia -> 默认 Tier 2
        // 3. 其他情况 -> 选择最接近的
        if (validTier === 3 && !availableTiers.includes(3) && availableTiers.includes(4)) {
          usedTier = 4;
          console.log(`${PLUGIN_NAME} [自纠正] Tier 3 不存在，使用 Tier 4`);
        } else if (validTier === 1 && !availableTiers.includes(1) && matchedKey === 'cynthia' && availableTiers.includes(2)) {
          usedTier = 2;
          console.log(`${PLUGIN_NAME} [自纠正] Cynthia 没有 Tier 1，使用 Tier 2`);
        } else {
          // 优先选择最接近请求 tier 的
          usedTier = availableTiers.reduce((prev, curr) => 
            Math.abs(curr - validTier) < Math.abs(prev - validTier) ? curr : prev
          );
          console.log(`${PLUGIN_NAME} [DEBUG] 使用最接近的 Tier ${usedTier} 作为替代`);
        }
        tierData = trainerData[usedTier];
        party = extractParty(tierData);
        unlocks = extractUnlocks(tierData);
        proficiency = extractProficiency(tierData);
      }
      
      if (!party || party.length === 0) {
        console.warn(`${PLUGIN_NAME} 训练家 "${trainerName}" 没有可用的配置`);
        return null;
      }
    }
    
    // 根据 tier 确定 AI 难度
    const difficultyMap = {
      1: 'easy',
      2: 'hard',
      3: 'expert',
      4: 'expert'
    };
    
    console.log(`${PLUGIN_NAME} ✓ 从数据库加载训练家 "${trainerName}" Tier ${usedTier} 配置`);
    if (unlocks) {
      console.log(`${PLUGIN_NAME} [DEBUG] ${trainerName} unlocks:`, unlocks);
    }
    
    return {
      party: party,
      unlocks: unlocks,
      trainerProficiency: proficiency,
      difficulty: difficultyMap[usedTier] || 'normal'
    };
  }

  /**
   * 解析敌方数据（双轨制）
   * 轨道 A: 注册训练家 -> 查数据库
   * 轨道 B: 野生/未注册 -> 随机生成
   * 
   * @param {object} enemySource - AI 输出的 enemy 对象
   * @param {object} aiBattleData - AI 输出的完整数据
   * @returns {object} { party, type, name, lines, unlocks, difficulty }
   */
  function resolveEnemyData(enemySource, aiBattleData) {
    const rawType = (enemySource.type || '').toString().toLowerCase();
    const isWild = rawType === 'wild';
    const enemyName = enemySource.name || (isWild ? 'wild' : 'Trainer');
    const enemyLines = enemySource.lines || {};
    const enemyId = enemySource.id || enemyName;
    const tier = enemySource.tier || aiBattleData.tier || 1;
    
    // 特殊处理：双打格式已经在 processTrainerParty 中处理过，直接返回
    if (enemySource._trainersData && Array.isArray(enemySource._trainersData)) {
      console.log(`${PLUGIN_NAME} 双打格式敌方已预处理，直接使用`);
      
      // 第一步：处理每个训练家的队伍（生成缺失的宝可梦）
      const trainersWithParty = enemySource._trainersData.map(trainerData => {
        // 判断是否为自定义 NPC（非野生且非数据库训练家）
        const isCustomNpc = trainerData.trainerType !== 'wild' && trainerData.trainerType !== 'db_trainer';
        
        let trainerParty = trainerData.party.map(p => {
          // 检测是否需要生成
          if (p._needGenerate) {
            const pokemonTier = p._tier || trainerData.tier || tier;
            const isWild = trainerData.trainerType === 'wild';
            console.log(`${PLUGIN_NAME} [P2] 为 ${trainerData.name} 生成宝可梦: ${p.name} (Tier ${pokemonTier}, ${isWild ? '野生' : '自定义NPC'})`);
            return generateWildPokemon(p, pokemonTier, !isWild);
          }
          return p;
        });
        
        // 按等级排序
        trainerParty.sort((a, b) => (b.lv || 0) - (a.lv || 0));
        
        return {
          name: trainerData.name,
          party: trainerParty,
          originalCount: trainerParty.length,
          trainerProficiency: trainerData.trainerProficiency || 0
        };
      });
      
      // 第二步：计算总数并按比例分配
      const totalCount = trainersWithParty.reduce((sum, t) => sum + t.originalCount, 0);
      const finalParty = [];
      
      if (totalCount <= 6) {
        // 总数不超过6，全部保留
        trainersWithParty.forEach(t => {
          finalParty.push(...t.party);
          console.log(`${PLUGIN_NAME} [P2] ${t.name} 队伍: ${t.party.map(p => p.name).join(', ')}`);
        });
      } else {
        // 总数超过6，按比例分配
        console.log(`${PLUGIN_NAME} [P2] 总队伍数 ${totalCount} > 6，按比例分配`);
        
        // 计算每个训练家的分配数量（至少1只）
        const allocations = trainersWithParty.map(t => {
          const ratio = t.originalCount / totalCount;
          const allocated = Math.max(1, Math.round(ratio * 6));
          return { ...t, allocated };
        });
        
        // 调整分配以确保总数为6
        let totalAllocated = allocations.reduce((sum, a) => sum + a.allocated, 0);
        while (totalAllocated > 6) {
          // 找到分配最多且超过1的训练家，减1
          const maxAlloc = allocations.filter(a => a.allocated > 1).sort((a, b) => b.allocated - a.allocated)[0];
          if (maxAlloc) {
            maxAlloc.allocated--;
            totalAllocated--;
          } else break;
        }
        
        // 按分配数量取宝可梦
        allocations.forEach(alloc => {
          const selected = alloc.party.slice(0, alloc.allocated);
          finalParty.push(...selected);
          console.log(`${PLUGIN_NAME} [P2] ${alloc.name} 分配 ${alloc.allocated}/${alloc.originalCount} 只: ${selected.map(p => `${p.name}(Lv${p.lv})`).join(', ')}`);
        });
      }
      
      // 自动检测 mechanic 字段并设置 unlock 权限
      const autoDetectedUnlocks = detectUnlocksFromParty(finalParty);
      const finalUnlocks = mergeUnlocks(enemySource.unlocks, autoDetectedUnlocks);
      
      // 多人合并时选择最高的 trainerProficiency
      const maxProficiency = Math.max(...trainersWithParty.map(t => t.trainerProficiency || 0));
      console.log(`${PLUGIN_NAME} [多人合并] 选择最高 trainerProficiency: ${maxProficiency}`);
      
      return {
        party: finalParty,
        type: enemySource.type || 'trainer',
        name: enemyName,
        id: enemyId,
        lines: enemyLines,
        unlocks: finalUnlocks,
        trainerProficiency: maxProficiency,
        difficulty: aiBattleData.difficulty || 'normal'
      };
    }
    
    // 检查 AI 是否提供了详细的队伍数据（包含 lv/moves 等字段）
    const aiProvidedParty = Array.isArray(enemySource.party) && enemySource.party.length > 0;
    const hasDetailedParty = aiProvidedParty && enemySource.party.some(p => 
      typeof p === 'object' && (p.lv !== undefined || p.moves !== undefined)
    );
    
    // 轨道 A: AI 提供了详细队伍数据（核心逻辑 B：野生/路人）- 最高优先级
    if (hasDetailedParty) {
      // 判断是否为自定义 NPC（type 为 trainer 但不在数据库中）
      const isCustomNpc = !isWild;
      console.log(`${PLUGIN_NAME} AI 指定了详细队伍数据，使用 AI 数据（${isWild ? '野生' : '自定义NPC'}模式）`);
      const generatedParty = enemySource.party.map(p => {
        const baseData = typeof p === 'string' ? { name: p } : p;
        const pokemonTier = baseData._tier || tier;
        return generateWildPokemon(baseData, pokemonTier, isCustomNpc);
      });
      
      // 自动检测 mechanic 字段并设置 unlock 权限
      const autoDetectedUnlocks = detectUnlocksFromParty(generatedParty);
      const finalUnlocks = mergeUnlocks(enemySource.unlocks, autoDetectedUnlocks);
      
      // 自定义 NPC 或野生默认 proficiency 为 0
      const customProficiency = enemySource.trainerProficiency || 0;
      
      return {
        party: generatedParty,
        type: isWild ? 'wild' : 'trainer',
        name: enemyName,
        id: enemyId,
        lines: enemyLines,
        unlocks: finalUnlocks,
        trainerProficiency: customProficiency,
        difficulty: aiBattleData.difficulty || 'normal'
      };
    }
    
    // 轨道 B: 训练家数据库查找（核心逻辑 A：数据库名将）- 中等优先级
    if (!isWild && enemyName && enemyName !== 'wild') {
      const dbResult = lookupTrainerFromDB(enemyName, tier);
      
      if (dbResult) {
        // 数据库命中！
        let finalParty = dbResult.party;
        
        // 如果 AI 提供了名字列表，从数据库队伍中筛选指定的宝可梦
        if (aiProvidedParty) {
          console.log(`${PLUGIN_NAME} 从数据库 ${enemyName} Tier ${tier} 中筛选: ${enemySource.party.join(', ')}`);
          const requestedNames = enemySource.party.map(p => 
            typeof p === 'string' ? p.toLowerCase() : (p.name || '').toLowerCase()
          );
          
          finalParty = dbResult.party.filter(pokemon => 
            requestedNames.includes((pokemon.name || '').toLowerCase())
          );
          
          if (finalParty.length === 0) {
            console.warn(`${PLUGIN_NAME} 筛选后队伍为空，使用完整数据库队伍`);
            finalParty = dbResult.party;
          }
        }
        
        return {
          party: finalParty,
          type: 'trainer',
          name: enemyName,
          id: enemyId,
          lines: enemyLines,
          unlocks: dbResult.unlocks || null,
          trainerProficiency: dbResult.trainerProficiency || 0,
          difficulty: aiBattleData.difficulty || dbResult.difficulty
        };
      }
    }
    
    // 轨道 C: AI 提供了名字但数据库查不到 - 根据名字生成宝可梦
    if (aiProvidedParty) {
      const isCustomNpc = !isWild;
      console.log(`${PLUGIN_NAME} 数据库未命中，根据 AI 提供的名字生成宝可梦（${isWild ? '野生' : '自定义NPC'}）`);
      const generatedParty = enemySource.party.map(p => {
        const baseData = typeof p === 'string' ? { name: p } : p;
        const pokemonTier = baseData._tier || tier;
        return generateWildPokemon(baseData, pokemonTier, isCustomNpc);
      });
      
      // 自动检测 mechanic 字段并设置 unlock 权限
      const autoDetectedUnlocks = detectUnlocksFromParty(generatedParty);
      const finalUnlocks = mergeUnlocks(enemySource.unlocks, autoDetectedUnlocks);
      
      // 数据库未命中的自定义 NPC，默认 proficiency 为 0
      const customProficiency = enemySource.trainerProficiency || 0;
      
      return {
        party: generatedParty,
        type: isWild ? 'wild' : 'trainer',
        name: enemyName,
        id: enemyId,
        lines: enemyLines,
        unlocks: finalUnlocks,
        trainerProficiency: customProficiency,
        difficulty: aiBattleData.difficulty || 'normal'
      };
    }
    
    // 轨道 D: 完全随机生成（兜底）
    console.log(`${PLUGIN_NAME} 使用随机生成模式`);
    
    // 获取 AI 提供的原始队伍数据（从顶层 aiBattleData.party）
    let rawParty = (Array.isArray(aiBattleData.party) && aiBattleData.party.length > 0)
      ? aiBattleData.party
      : [];
    
    // 如果 AI 没提供队伍，给个默认
    if (rawParty.length === 0) {
      rawParty = [{ name: enemyName !== 'wild' ? enemyName : 'Rattata', lv: 5 }];
    }
    
    // 为每个宝可梦生成完整数据
    const isCustomNpc = !isWild;
    const generatedParty = rawParty.map(p => {
      const baseData = typeof p === 'string' ? { name: p } : p;
      const pokemonTier = baseData._tier || tier;
      return generateWildPokemon(baseData, pokemonTier, isCustomNpc);
    });
    
    // 随机生成的敌方默认 proficiency 为 0
    return {
      party: generatedParty,
      type: isWild ? 'wild' : 'trainer',
      name: enemyName,
      id: enemyId,
      lines: enemyLines,
      unlocks: null,
      trainerProficiency: enemySource.trainerProficiency || 0,
      difficulty: aiBattleData.difficulty || (isWild ? 'easy' : 'normal')
    };
  }

  /**
   * 解析队伍数据（支持新的对象槽位格式 slot1-slot6）
   * @param {object|array} party - 队伍数据，可以是对象 {slot1: {...}, slot2: {...}} 或数组
   * @returns {array} - 有效宝可梦数组（过滤掉空槽位）
   */
  function parsePartyData(party) {
    console.log(`${PLUGIN_NAME} [DEBUG] parsePartyData 输入:`, typeof party, party);
    
    if (!party) return [];
    
    let partyArray = [];
    
    // 新格式：对象槽位 {slot1: {...}, slot2: {...}, ...}
    if (!Array.isArray(party) && typeof party === 'object') {
      // 检查是否是 slot1-slot6 格式
      const slotKeys = Object.keys(party).filter(k => /^slot\d+$/.test(k)).sort((a, b) => {
        const numA = parseInt(a.replace('slot', ''));
        const numB = parseInt(b.replace('slot', ''));
        return numA - numB;
      });
      
      if (slotKeys.length > 0) {
        // 【防呆】检查并修复 null 槽位
        for (const k of slotKeys) {
          if (party[k] === null || party[k] === undefined || typeof party[k] !== 'object') {
            const slotNum = parseInt(k.replace('slot', ''));
            console.warn(`${PLUGIN_NAME} [防呆] parsePartyData: ${k} 为 ${JSON.stringify(party[k])}，恢复为空槽位模板`);
            party[k] = createEmptySlot(slotNum);
          }
        }
        // 新的槽位格式
        partyArray = slotKeys.map(k => party[k]);
        console.log(`${PLUGIN_NAME} [DEBUG] 槽位格式转数组:`, partyArray.length, '个槽位');
      } else {
        // 旧格式：数字索引对象 {"0": {...}, "1": {...}}
        const numKeys = Object.keys(party).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
        if (numKeys.length > 0) {
          partyArray = numKeys.map(k => party[k]);
          console.log(`${PLUGIN_NAME} [DEBUG] 数字索引转数组:`, partyArray);
        } else if (party.name) {
          // 单个宝可梦对象
          partyArray = [party];
        } else {
          return [];
        }
      }
    } else if (Array.isArray(party)) {
      partyArray = party;
    } else {
      return [];
    }
    
    // 处理每个槽位
    return partyArray.map((p, index) => {
      if (!p) return null;
      
      // 如果是字符串，尝试解析为JSON
      if (typeof p === 'string') {
        try {
          const parsed = JSON.parse(p);
          return normalizePokemonData(parsed, index);
        } catch (e) {
          console.warn(`${PLUGIN_NAME} 解析宝可梦数据失败:`, p);
          return null;
        }
      }
      
      // 如果是对象但属性是字符索引（字符数组问题）
      if (p && typeof p === 'object' && p['0'] !== undefined && typeof p['0'] === 'string') {
        const keys = Object.keys(p).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
        const jsonStr = keys.map(k => p[k]).join('');
        console.log(`${PLUGIN_NAME} [DEBUG] 重组字符数组为 JSON:`, jsonStr.substring(0, 50) + '...');
        try {
          const parsed = JSON.parse(jsonStr);
          return normalizePokemonData(parsed, index);
        } catch (e) {
          console.warn(`${PLUGIN_NAME} 重组 JSON 解析失败:`, e);
          return null;
        }
      }
      
      return normalizePokemonData(p, index);
    }).filter(p => p !== null && p.name); // 过滤掉空槽位（name 为 null 的）
  }

  /**
   * 规范化宝可梦数据（处理 moves 对象格式）
   * @param {object} pokemon - 原始宝可梦数据
   * @param {number} slotIndex - 槽位索引
   * @returns {object} - 规范化后的宝可梦数据
   */
  function normalizePokemonData(pokemon, slotIndex) {
    if (!pokemon || typeof pokemon !== 'object') return null;
    
    // 处理 moves：可能是对象 {move1, move2, move3, move4} 或数组
    let moves = [];
    if (pokemon.moves) {
      if (Array.isArray(pokemon.moves)) {
        moves = sanitizeMoves(pokemon.moves);
      } else if (typeof pokemon.moves === 'object') {
        // 对象格式 {move1: "Scratch", move2: "Tail Whip", ...}
        moves = sanitizeMoves([
          pokemon.moves.move1,
          pokemon.moves.move2,
          pokemon.moves.move3,
          pokemon.moves.move4
        ]);
      }
    }
    
    return {
      ...pokemon,
      slot: pokemon.slot || (slotIndex + 1),
      moves: moves
    };
  }

  /**
   * 判断是否为完整的宝可梦数据（包含 name, lv, moves）
   */
  function isCompletePokemonData(pokemon) {
    if (!pokemon || typeof pokemon !== 'object') return false;
    return pokemon.name && 
           typeof pokemon.lv === 'number' && 
           Array.isArray(pokemon.moves) && 
           pokemon.moves.length > 0;
  }

  /**
   * 从玩家队伍中按名字筛选宝可梦
   * @param {Array} playerParty - 玩家完整队伍数据
   * @param {Array} nameList - AI输出的宝可梦名字列表
   * @returns {Array} 筛选后的队伍
   */
  function selectPokemonByNames(playerParty, nameList) {
    if (!playerParty || !Array.isArray(playerParty)) return [];
    if (!nameList || !Array.isArray(nameList)) return [];

    console.log(`${PLUGIN_NAME} [DEBUG] 筛选宝可梦:`, nameList);
    console.log(`${PLUGIN_NAME} [DEBUG] 可用队伍:`, playerParty.map(p => p.name || p.nickname));

    const result = [];
    for (const name of nameList) {
      const normalizedName = (typeof name === 'string' ? name : name?.name || '').toLowerCase();
      
      // 尝试精确匹配
      let found = playerParty.find(p => 
        p.name?.toLowerCase() === normalizedName ||
        p.nickname?.toLowerCase() === normalizedName
      );
      
      // 如果精确匹配失败，尝试部分匹配（支持形态变体如 Vulpix-Alola）
      if (!found) {
        // 提取基础名字（去掉形态后缀）
        const baseName = normalizedName.split('-')[0];
        found = playerParty.find(p => {
          const pokemonName = (p.name || '').toLowerCase();
          const pokemonBaseName = pokemonName.split('-')[0];
          // 匹配基础名字，或者宝可梦名字包含搜索名字
          return pokemonBaseName === baseName || 
                 pokemonName.includes(normalizedName) ||
                 normalizedName.includes(pokemonName);
        });
        
        if (found) {
          console.log(`${PLUGIN_NAME} [DEBUG] 部分匹配成功: "${name}" -> "${found.name}"`);
        }
      }
      
      if (found) {
        result.push(found);
      } else {
        console.warn(`${PLUGIN_NAME} 未在玩家队伍中找到: ${name}`);
      }
    }
    
    console.log(`${PLUGIN_NAME} [DEBUG] 筛选结果:`, result.map(p => p.name));
    return result;
  }

  /**
   * 解析AI输出的训练家队伍配置（软编码，支持任意角色）
   * 
   * 四种模式：
   * 1. AI输出完整数据（name + lv + moves）→ 直接使用AI数据
   * 2. AI输出宝可梦名字列表（仅name或字符串数组）→ 从数据库或ERA变量筛选
   * 3. AI仅输出训练家名（无party或party为空）→ 从数据库查询或使用ERA全队
   * 4. 训练家是NPC → 从训练家数据库提取完整配置
   * 
   * @param {Object} aiTrainerConfig - AI输出的训练家配置
   * @param {Object} eraPlayerData - ERA变量中的玩家数据（仅当训练家是玩家时使用）
   * @param {string} role - 'p1' | 'p2' | 'player' | 'enemy'（用于日志）
   * @returns {Object} 最终的训练家配置
   */
  function resolveTrainerParty(aiTrainerConfig, eraPlayerData, role = 'trainer') {
    const trainerName = aiTrainerConfig?.name || eraPlayerData?.name || '训练家';
    
    // === 步骤1: 检测训练家类型 ===
    const playerKeywords = ['player', '玩家', '主角', '训练家', '{{user}}', 'user'];
    const normalizedName = trainerName.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
    const isPlayer = playerKeywords.some(kw => normalizedName.includes(kw) || trainerName.includes(kw)) || 
                     trainerName === '{{user}}' || 
                     trainerName.includes('{{user}}');
    
    console.log(`${PLUGIN_NAME} [${role}] 解析训练家: "${trainerName}", 是否玩家: ${isPlayer}`);

    // 检测双人对战格式（name 包含 '&'）
    const isDoubleBattle = trainerName.includes('&');
    
    // === 特殊处理：双打对战且有 _trainersData ===
    if (isDoubleBattle && aiTrainerConfig._trainersData && Array.isArray(aiTrainerConfig._trainersData)) {
      console.log(`${PLUGIN_NAME} [${role}] 双打对战模式，分别处理各训练家队伍`);
      const eraParty = parsePartyData(eraPlayerData?.party);
      
      // 第一步：处理每个训练家的队伍（生成缺失的宝可梦）
      const trainersWithParty = aiTrainerConfig._trainersData.map(trainerData => {
        let trainerParty = [];
        
        if (trainerData.isPlayer) {
          // 玩家：从 ERA 提取
          if (trainerData.party && trainerData.party.length > 0) {
            trainerParty = trainerData.party.map(p => {
              const pokemonName = typeof p === 'string' ? p : p?.name;
              return selectPokemonByNames(eraParty, [pokemonName])[0];
            }).filter(Boolean);
          } else {
            trainerParty = eraParty;
          }
        } else {
          // NPC：使用已解析的完整数据，并生成标记为 _needGenerate 的宝可梦
          const isWild = trainerData.trainerType === 'wild';
          trainerParty = trainerData.party.map(p => {
            if (p._needGenerate) {
              const pokemonTier = p._tier || trainerData.tier || 2;
              console.log(`${PLUGIN_NAME} [${role}] 为 ${trainerData.name} 生成宝可梦: ${p.name} (Tier ${pokemonTier}, ${isWild ? '野生' : '自定义NPC'})`);
              return generateWildPokemon(p, pokemonTier, !isWild);
            }
            console.log(`${PLUGIN_NAME} [${role}] 使用数据库数据: ${p.name}, mechanic: ${p.mechanic || 'null'}, _needGenerate: ${p._needGenerate}`);
            return p;
          });
        }
        
        // 按等级排序
        trainerParty.sort((a, b) => (b.lv || 0) - (a.lv || 0));
        
        return {
          name: trainerData.name,
          party: trainerParty,
          originalCount: trainerParty.length,
          trainerProficiency: trainerData.trainerProficiency || 0
        };
      });
      
      // 第二步：计算总数并按比例分配
      const totalCount = trainersWithParty.reduce((sum, t) => sum + t.originalCount, 0);
      const finalParty = [];
      
      if (totalCount <= 6) {
        // 总数不超过6，全部保留
        trainersWithParty.forEach(t => {
          finalParty.push(...t.party);
          console.log(`${PLUGIN_NAME} [${role}] ${t.name} 队伍: ${t.party.map(p => p.name).join(', ')}`);
        });
      } else {
        // 总数超过6，按比例分配
        console.log(`${PLUGIN_NAME} [${role}] 总队伍数 ${totalCount} > 6，按比例分配`);
        
        // 计算每个训练家的分配数量（至少1只）
        const allocations = trainersWithParty.map(t => {
          const ratio = t.originalCount / totalCount;
          const allocated = Math.max(1, Math.round(ratio * 6));
          return { ...t, allocated };
        });
        
        // 调整分配以确保总数为6
        let totalAllocated = allocations.reduce((sum, a) => sum + a.allocated, 0);
        while (totalAllocated > 6) {
          // 找到分配最多且超过1的训练家，减1
          const maxAlloc = allocations.filter(a => a.allocated > 1).sort((a, b) => b.allocated - a.allocated)[0];
          if (maxAlloc) {
            maxAlloc.allocated--;
            totalAllocated--;
          } else break;
        }
        
        // 按分配数量取宝可梦
        allocations.forEach(alloc => {
          const selected = alloc.party.slice(0, alloc.allocated);
          finalParty.push(...selected);
          console.log(`${PLUGIN_NAME} [${role}] ${alloc.name} 分配 ${alloc.allocated}/${alloc.originalCount} 只: ${selected.map(p => `${p.name}(Lv${p.lv})`).join(', ')}`);
        });
      }
      
      // 合并各个训练家自带的 unlocks（从 _trainersData 中提取）
      const trainerUnlocks = aiTrainerConfig._trainersData
        .map(t => t.unlocks)
        .filter(Boolean);
      
      // 合并：aiTrainerConfig.unlocks > 训练家自带 unlocks
      // 注意：不再使用自动检测，因为玩家方的 unlocks 应该由训练家数据明确定义
      // 自动检测会导致宝可梦的 mechanic 字段覆盖训练家的权限设置
      const mergedUnlocks = mergeUnlocks(aiTrainerConfig.unlocks, ...trainerUnlocks);
      
      console.log(`${PLUGIN_NAME} [${role}] aiTrainerConfig.unlocks:`, aiTrainerConfig.unlocks);
      console.log(`${PLUGIN_NAME} [${role}] 训练家 unlocks:`, trainerUnlocks);
      console.log(`${PLUGIN_NAME} [${role}] 最终合并 unlocks:`, mergedUnlocks);
      
      // 调试：检查 finalParty 中的 mechanic 字段
      finalParty.forEach(p => {
        if (p.mechanic) {
          console.log(`${PLUGIN_NAME} [${role}] finalParty 中 ${p.name} 的 mechanic: ${p.mechanic}`);
        }
      });
      
      // 多人合并时选择最高的 trainerProficiency
      const maxProficiency = Math.max(...trainersWithParty.map(t => t.trainerProficiency || 0));
      console.log(`${PLUGIN_NAME} [${role}] [多人合并] 选择最高 trainerProficiency: ${maxProficiency}`);
      
      return {
        name: trainerName,
        unlocks: mergedUnlocks,
        party: finalParty,
        trainerProficiency: maxProficiency
      };
    }
    
    // === 步骤2: 如果是玩家，使用 ERA 变量；如果是 NPC，使用数据库 ===
    const eraParty = parsePartyData(eraPlayerData?.party);
    
    // 情况1: AI没有输出party → 根据训练家类型处理
    if (!aiTrainerConfig?.party || !Array.isArray(aiTrainerConfig.party) || aiTrainerConfig.party.length === 0) {
      if (isPlayer) {
        // 玩家：使用ERA全队
        console.log(`${PLUGIN_NAME} [${role}] 模式: 玩家全队配置`);
        return {
          name: trainerName,
          unlocks: null,
          party: eraParty.length > 0 ? eraParty : [
            { name: 'Pikachu', lv: 5, moves: ['Thunder Shock', 'Quick Attack'] }
          ]
        };
      } else {
        // NPC：从数据库提取（使用默认 tier 2）
        console.log(`${PLUGIN_NAME} [${role}] 模式: NPC数据库查询（无party指定）`);
        const dbResult = extractPokemonFromTrainerDB(trainerName, [], 2);
        const dbParty = dbResult.party || dbResult; // 兼容新旧返回格式
        const dbUnlocks = dbResult.unlocks || null;
        if (dbParty.length > 0) {
          return {
            name: trainerName,
            unlocks: dbUnlocks,
            party: dbParty
          };
        } else {
          // 上下文感知：如果 role 是 'p1' 且有 ERA 数据，优先使用玩家数据
          if (role === 'p1' && eraParty.length > 0) {
            console.log(`${PLUGIN_NAME} [${role}] NPC "${trainerName}" 不在数据库中，但 role=p1，使用 ERA 玩家数据`);
            return {
              name: trainerName,
              unlocks: null,
              party: eraParty
            };
          }
          
          console.warn(`${PLUGIN_NAME} [${role}] NPC "${trainerName}" 不在数据库中，使用默认队伍`);
          return {
            name: trainerName,
            unlocks: null,
            party: [{ name: 'Pikachu', lv: 5, moves: ['Thunder Shock', 'Quick Attack'] }]
          };
        }
      }
    }

    const aiParty = aiTrainerConfig.party;
    const trainerMetadata = aiTrainerConfig._trainerMetadata || []; // 从 p1/p2 转换中获取

    // 检查是否有混合数据（既有完整对象，也有字符串）
    const hasCompleteData = aiParty.some(p => isCompletePokemonData(p));
    const hasStringData = aiParty.some(p => typeof p === 'string');
    
    // 情况2: 全部是完整数据（有lv和moves）→ 直接使用
    if (hasCompleteData && !hasStringData) {
      console.log(`${PLUGIN_NAME} [${role}] 模式: AI完整数据`);
      const partyWithMega = aiParty.map((p, index) => ({
        ...p,
        moves: sanitizeMoves(p.moves),
        mega: p.mega,
        trainer: trainerMetadata[index] // 添加训练家标记
      }));
      return {
        name: trainerName,
        unlocks: null,
        party: partyWithMega
      };
    }
    
    // 情况2.5: 混合数据（部分完整，部分字符串）→ 分别处理
    if (hasCompleteData && hasStringData) {
      console.log(`${PLUGIN_NAME} [${role}] 模式: 混合数据`);
      const finalParty = [];
      
      for (let i = 0; i < aiParty.length; i++) {
        const p = aiParty[i];
        if (isCompletePokemonData(p)) {
          // 完整数据，直接使用
          finalParty.push({
            ...p,
            moves: sanitizeMoves(p.moves),
            trainer: trainerMetadata[i]
          });
        } else {
          // 字符串，根据训练家类型查找
          const pokemonName = typeof p === 'string' ? p : p?.name;
          let found = null;
          
          if (isPlayer && eraParty.length > 0) {
            // 玩家：从 ERA 变量筛选
            found = selectPokemonByNames(eraParty, [pokemonName])[0];
          } else {
            // NPC：从数据库提取
            const dbResult = extractPokemonFromTrainerDB(trainerName, [pokemonName], 2);
            const dbParty = dbResult.party || dbResult; // 兼容新旧返回格式
            found = dbParty[0];
          }
          
          if (found) {
            finalParty.push({
              ...found,
              trainer: trainerMetadata[i]
            });
          } else {
            console.warn(`${PLUGIN_NAME} [${role}] 未找到: ${pokemonName}`);
          }
        }
      }
      
      return {
        name: trainerName,
        unlocks: null,
        party: finalParty
      };
    }

    // 情况3: 全部是名字列表 → 根据训练家类型筛选
    console.log(`${PLUGIN_NAME} [${role}] 模式: 按名字筛选`);
    const nameList = aiParty.map(p => typeof p === 'string' ? p : p?.name).filter(Boolean);
    let selectedParty = [];
    
    let trainerUnlocks = null;
    if (isPlayer && eraParty.length > 0) {
      // 玩家：从 ERA 变量筛选
      selectedParty = selectPokemonByNames(eraParty, nameList);
    } else {
      // NPC：从数据库提取
      const dbResult = extractPokemonFromTrainerDB(trainerName, nameList, 2);
      selectedParty = dbResult.party || dbResult; // 兼容新旧返回格式
      trainerUnlocks = dbResult.unlocks || null;
      
      // 上下文感知：如果 NPC 不在数据库中且 role='p1'，尝试从 ERA 筛选
      if (selectedParty.length === 0 && role === 'p1' && eraParty.length > 0) {
        console.log(`${PLUGIN_NAME} [${role}] NPC "${trainerName}" 不在数据库中，但 role=p1，尝试从 ERA 筛选`);
        selectedParty = selectPokemonByNames(eraParty, nameList);
      }
    }

    if (selectedParty.length === 0) {
      console.warn(`${PLUGIN_NAME} [${role}] 筛选结果为空`);
      if ((isPlayer || role === 'p1') && eraParty.length > 0) {
        // 玩家或 p1 位置：使用全队
        console.log(`${PLUGIN_NAME} [${role}] 使用 ERA 全队作为后备`);
        selectedParty = eraParty;
      } else {
        // NPC：使用默认队伍
        selectedParty = [{ name: 'Pikachu', lv: 5, moves: ['Thunder Shock', 'Quick Attack'] }];
      }
    }

    // 双人对战：为每个宝可梦添加 trainer 标记
    if (isDoubleBattle) {
      console.log(`${PLUGIN_NAME} [${role}] 检测到双人对战格式: ${trainerName}`);
      
      // 使用 _trainerMetadata 来正确分配训练家标记
      if (trainerMetadata.length > 0) {
        // 有元数据，使用元数据分配
        const partyWithTrainers = selectedParty.map((pokemon, index) => ({
          ...pokemon,
          trainer: trainerMetadata[index] || trainerName.split('&')[0].trim()
        }));
        
        return {
          name: trainerName,
          unlocks: trainerUnlocks,
          party: partyWithTrainers
        };
      } else {
        // 没有元数据，使用简单的前半后半分配
        const trainerNames = trainerName.split('&').map(n => n.trim());
        const midPoint = Math.ceil(selectedParty.length / 2);
        
        const partyWithTrainers = selectedParty.map((pokemon, index) => ({
          ...pokemon,
          trainer: index < midPoint ? trainerNames[0] : (trainerNames[1] || trainerNames[0])
        }));
        
        return {
          name: trainerName,
          unlocks: trainerUnlocks,
          party: partyWithTrainers
        };
      }
    }

    return {
      name: trainerName,
      unlocks: trainerUnlocks,
      party: selectedParty
    };
  }

  /**
   * 构建完整的战斗JSON（软编码，支持任意角色组合）
   * 
   * 支持三种对战模式：
   * - 玩家 vs NPC
   * - 玩家 vs 玩家（理论上）
   * - NPC vs NPC（新增支持）
   * 
   * 双轨制处理：
   * - 轨道 A: 注册训练家 (name 在 TRAINER_DB 中) -> 查表获取完整配置
   * - 轨道 B: 野生/未注册 -> 随机生成 IVs/性格/特性
   */
  async function buildCompleteBattleJson(aiBattleData) {
    // 获取 ERA 玩家数据（仅当 p1 或 p2 是玩家时需要）
    const eraPlayerData = await getPlayerParty();

    if (!eraPlayerData || !eraPlayerData.party || eraPlayerData.party.length === 0) {
      console.warn(`${PLUGIN_NAME} ERA玩家队伍为空（如果是纯NPC对战则无影响）`);
    }

    // === 使用标准化后的 player/enemy 格式 ===
    // normalizeP1P2Format 已将 p1/p2.entrants 转换为 player/enemy
    const p1Source = aiBattleData.player || aiBattleData.p1 || {};
    const p2Source = aiBattleData.enemy || aiBattleData.p2 || {};

    // 解析 p1（player）配置（软编码，可以是玩家或NPC）
    const resolvedPlayer = resolveTrainerParty(p1Source, eraPlayerData, 'p1');

    // 解析 p2（enemy）配置
    const resolvedEnemy = resolveEnemyData(p2Source, aiBattleData);

    // === 合并 unlocks ===
    // 将 p1 和 p2 的 unlocks 中为 true 的属性合并
    // 前端只需要知道"哪些机制可用"，不区分来源
    // 注意：bonds（女主角羁绊道具）也需要合并到 unlocks 中
    const eraBonds = eraPlayerData?.bonds || {};
    const playerUnlocks = mergeUnlocks(resolvedPlayer.unlocks, eraPlayerData?.unlocks, eraBonds);
    const enemyUnlocks = resolvedEnemy.unlocks || null;

    // === 处理全局系统开关 (settings) ===
    // 从 ERA 数据或 AI 数据中获取 settings
    const defaultSettings = {
      enableAVS: true,
      enableCommander: true,
      enableEVO: true,
      enableBGM: true,
      enableSFX: true,
      enableClash: false,
      enableEnvironment: true
    };
    const eraSettings = eraPlayerData?.settings || {};
    const aiSettings = aiBattleData?.settings || {};
    // AI 数据优先，然后是 ERA 数据，最后是默认值
    const finalSettings = { ...defaultSettings, ...eraSettings, ...aiSettings };
    
    // === 处理 trainerProficiency ===
    // 从 ERA 数据获取（已经在 handleGenerationBeforeInject 中处理了 proficiency_up）
    // 多人合并时，选择 resolvedPlayer.trainerProficiency 和 eraPlayerData.trainerProficiency 中的最大值
    // 注意：酒馆脚本不做上限限制（始终 0-255），上限限制由战斗前端根据 enable_proficiency_cap 处理
    const eraProficiency = eraPlayerData?.trainerProficiency || 0;
    const resolvedProficiency = resolvedPlayer.trainerProficiency || 0;
    const trainerProficiency = Math.min(255, Math.max(0, Math.max(eraProficiency, resolvedProficiency)));

    // === 处理环境配置 ===
    // 合并逻辑:
    //   - AI 指定 weather → 使用 AI 的天气
    //   - AI 没指定 weather → 从 ERA weather_grid 补充
    //   - AI 指定 overlay → 始终保留（与天气来源无关）
    const eraVars = await getEraVars();
    let environmentConfig = null;
    
    // 1. 从 ERA weather_grid 获取当前位置天气
    let eraWeather = null;
    let eraSuppression = null;
    if (eraVars) {
      const locationData = getEraValue(eraVars, 'world_state.location', null);
      const weatherGrid = getEraValue(eraVars, 'world_state.weather_grid', null);
      
      if (locationData && weatherGrid && typeof locationData.x === 'number') {
        const MAP_CENTER_X = 26;
        const MAP_CENTER_Y = 26;
        let gx = locationData.x;
        if (gx > 0) gx -= 1;
        gx = gx + MAP_CENTER_X;
        let gy = locationData.y;
        if (gy > 0) gy -= 1;
        gy = MAP_CENTER_Y - gy - 1;
        
        const gridKey = `${gx}_${gy}`;
        const gridWeather = weatherGrid[gridKey];
        
        if (gridWeather) {
          eraWeather = gridWeather.weather;
          eraSuppression = gridWeather.suppression || null;
          console.log(`${PLUGIN_NAME} [ERA WEATHER] 当前格子天气: ${eraWeather} @ ${gridKey}`);
        }
      }
    }
    
    // 2. 构建最终环境配置
    const aiEnv = aiBattleData.environment || {};
    
    // 天气优先级: AI 指定有效天气 > ERA weather_grid
    // 注意: AI 传入 null 视为"未指定"，应从 ERA 补充
    const finalWeather = aiEnv.weather ? aiEnv.weather : eraWeather;
    const finalWeatherTurns = aiEnv.weatherTurns || 0;
    const finalSuppression = aiEnv.suppression || eraSuppression;
    
    // 只要有天气或 overlay，就创建 environmentConfig
    if (finalWeather || aiEnv.overlay) {
      environmentConfig = {
        weather: finalWeather,
        weatherTurns: finalWeatherTurns
      };
      
      // 保留 AI 传入的 overlay（自定义场地规则）
      if (aiEnv.overlay) {
        environmentConfig.overlay = aiEnv.overlay;
        console.log(`${PLUGIN_NAME} [ENV OVERLAY] AI 传入自定义环境: ${aiEnv.overlay.env_name}`);
        console.log(`${PLUGIN_NAME} [ENV OVERLAY] 规则数: ${aiEnv.overlay.rules?.length || 0}`);
      }
      
      // 添加 suppression
      if (finalSuppression) {
        environmentConfig.suppression = finalSuppression;
      }
      
      // 日志：显示最终配置来源
      const weatherSource = aiEnv.weather !== undefined ? 'AI' : (eraWeather ? 'ERA' : 'none');
      console.log(`${PLUGIN_NAME} [ENVIRONMENT] 最终配置 - 天气: ${finalWeather || 'none'} (来源: ${weatherSource}), overlay: ${aiEnv.overlay ? 'AI' : 'none'}`);
    }

    // 构建最终的战斗 JSON（前端 player/enemy 格式）
    const completeBattle = {
      settings: finalSettings,
      difficulty: resolvedEnemy.difficulty || aiBattleData.difficulty || 'normal',
      player: {
        name: resolvedPlayer.name,
        trainerProficiency: trainerProficiency,
        party: resolvedPlayer.party,
        unlocks: playerUnlocks
      },
      enemy: {
        id: resolvedEnemy.id,
        type: resolvedEnemy.type,
        name: resolvedEnemy.name,
        trainerProficiency: resolvedEnemy.trainerProficiency || 0,
        lines: resolvedEnemy.lines,
        unlocks: enemyUnlocks
      },
      party: resolvedEnemy.party,
      script: aiBattleData.script || null
    };
    
    // 添加环境天气（与 player 同级）
    if (environmentConfig) {
      completeBattle.environment = environmentConfig;
    }

    console.log(`${PLUGIN_NAME} 构建完整战斗JSON:`, completeBattle);
    console.log(`${PLUGIN_NAME} [SETTINGS] 全局系统开关:`, finalSettings);
    console.log(`${PLUGIN_NAME} [PROFICIENCY] 玩家熟练度:`, trainerProficiency);
    console.log(`${PLUGIN_NAME} [PROFICIENCY] 敌方熟练度:`, resolvedEnemy.trainerProficiency || 0);
    console.log(`${PLUGIN_NAME} [UNLOCK] player unlocks:`, playerUnlocks);
    if (enemyUnlocks) {
      console.log(`${PLUGIN_NAME} [UNLOCK] enemy unlocks:`, enemyUnlocks);
    }
    return completeBattle;
  }

  // ============================================
  //    前端注入
  // ============================================

  /**
   * 注入战斗前端到消息
   */
  async function injectBattleFrontend(messageId, battleJson) {
    try {
      const messages = getChatMessages(messageId);
      if (!messages || messages.length === 0) return false;

      const msg = messages[0];
      let content = msg.message;

      // === 格式标准化：AI 输入 → PKM_FRONTEND ===
      // 处理：friendship → avs, 保留 mechanic/teraType
      const normalizePokemonFormat = (pokemon) => {
        if (!pokemon) return pokemon;
        
        // 如果有嵌套的 friendship，提取为扁平 avs
        if (pokemon.friendship && pokemon.friendship.avs) {
          pokemon.avs = { ...pokemon.friendship.avs };
          // 删除 friendship，PKM_FRONTEND 只保留扁平 avs
          delete pokemon.friendship;
        } else if (pokemon.friendship && !pokemon.friendship.avs) {
          // 旧格式：friendship 直接是 avs
          if (typeof pokemon.friendship === 'object' && 
              ('trust' in pokemon.friendship || 'passion' in pokemon.friendship)) {
            pokemon.avs = { ...pokemon.friendship };
            delete pokemon.friendship;
          }
        }
        
        // 如果没有 avs，初始化为 0
        if (!pokemon.avs) {
          pokemon.avs = { trust: 0, passion: 0, insight: 0, devotion: 0 };
        }
        
        // === 确保 mechanic 和 teraType 被保留 ===
        // mechanic: 'mega' | 'zmove' | 'dynamax' | 'tera' | null
        // teraType: 'Fire' | 'Water' | ... | null (仅当 mechanic='tera' 时有效)
        if (pokemon.mechanic) {
          console.log(`${PLUGIN_NAME} [MECHANIC] ${pokemon.name}: ${pokemon.mechanic}${pokemon.teraType ? ` (${pokemon.teraType})` : ''}`);
        }
        
        // === 确保 isAce 和 isLead 被保留 ===
        // isAce: 标记王牌宝可梦（用于羁绊共鸣等特殊机制）
        // isLead: 标记首发宝可梦（自动移到队伍第一位）
        if (pokemon.isAce !== undefined) {
          pokemon.isAce = Boolean(pokemon.isAce);
        }
        if (pokemon.isLead !== undefined) {
          pokemon.isLead = Boolean(pokemon.isLead);
          if (pokemon.isLead) {
            console.log(`${PLUGIN_NAME} [LEAD] ${pokemon.name} marked as lead Pokemon`);
          }
        }
        
        return pokemon;
      };
      
      // 标准化玩家队伍
      if (battleJson.player && battleJson.player.party) {
        battleJson.player.party = battleJson.player.party.map(normalizePokemonFormat);
      }
      
      // 标准化敌方队伍
      if (battleJson.party) {
        battleJson.party = battleJson.party.map(normalizePokemonFormat);
      }

      // 添加占位符（供酒馆正则替换现有前端模板）
      const frontendPayload = `<PKM_FRONTEND>\n${JSON.stringify(battleJson)}\n</PKM_FRONTEND>`;
      content = content.trim() + '\n\n' + frontendPayload;

      // 更新消息
      await setChatMessages([{
        message_id: messageId,
        message: content
      }], { refresh: 'affected' });

      console.log(`${PLUGIN_NAME} ✓ 战斗前端已注入到消息 #${messageId}`);
      return true;
    } catch (e) {
      console.error(`${PLUGIN_NAME} 注入前端失败:`, e);
      return false;
    }
  }

  // ============================================
  //    事件监听 & 主流程
  // ============================================

  /**
   * 重置处理状态
   */
  function resetState(reason) {
    console.log(`${PLUGIN_NAME} ${reason} -> 重置状态`);
    lastHandledMk = null;
    isProcessing = false;
  }

  /**
   * 格式化 IVs 为简洁显示
   * @param {object} ivs - { hp, atk, def, spa, spd, spe }
   * @returns {string} - 如 "6V", "5V0A", "4V" 等
   */
  function formatIVsDisplay(ivs) {
    if (!ivs) return '???';
    
    const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    let perfectCount = 0;
    let zeroAtk = false;
    
    for (const stat of stats) {
      const val = ivs[stat];
      if (val === 31) perfectCount++;
      if (stat === 'atk' && val === 0) zeroAtk = true;
    }
    
    if (perfectCount === 6) return '6V';
    if (perfectCount === 5 && zeroAtk) return '5V0A';
    if (perfectCount >= 4) return `${perfectCount}V`;
    return `${perfectCount}V`;
  }

  /**
   * 格式化性别符号
   * @param {string} gender - 'M' | 'F' | null
   * @returns {string}
   */
  function formatGender(gender) {
    if (gender === 'M') return '♂';
    if (gender === 'F') return '♀';
    return '⚪';
  }

  /**
   * 根据资质等级生成随机 IVs
   * @param {string} quality - 'low' | 'medium' | 'high' | 'perfect'
   * @returns {object} - { hp, atk, def, spa, spd, spe }
   */
  function generateIVsByQuality(quality) {
    const targets = {
      'low': 90,      // 低资质：总和 90 (平均 15)
      'medium': 120,  // 中资质：总和 120 (平均 20)
      'high': 150,    // 高资质：总和 150 (平均 25)
      'perfect': 186  // 顶级：总和 186 (全满)
    };
    
    const targetSum = targets[quality] || targets['low'];
    
    // 如果是顶级，直接返回全满
    if (quality === 'perfect') {
      return { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    }
    
    // 随机分配，确保总和符合目标
    const stats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    const ivs = {};
    let remaining = targetSum;
    
    for (let i = 0; i < stats.length; i++) {
      const stat = stats[i];
      if (i === stats.length - 1) {
        // 最后一个属性：分配剩余值
        ivs[stat] = Math.min(31, Math.max(0, remaining));
      } else {
        // 随机分配，但保证后续属性有空间
        const maxForThis = Math.min(31, remaining - (stats.length - i - 1) * 0);
        const minForThis = Math.max(0, remaining - (stats.length - i - 1) * 31);
        ivs[stat] = Math.floor(Math.random() * (maxForThis - minForThis + 1)) + minForThis;
        remaining -= ivs[stat];
      }
    }
    
    return ivs;
  }

  /**
   * 检查 IVs 是否有效（包含所有六个属性且为数字）
   * @param {object} ivs - IVs 对象
   * @returns {boolean}
   */
  function isValidIVs(ivs) {
    if (!ivs || typeof ivs !== 'object') return false;
    const requiredStats = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    return requiredStats.every(stat => 
      typeof ivs[stat] === 'number' && ivs[stat] >= 0 && ivs[stat] <= 31
    );
  }

  /**
   * 自动补全宝可梦的 stats_meta（IVs 和 EVs）
   * @param {object} pokemon - 宝可梦数据对象
   * @returns {object} - 补全后的 stats_meta
   */
  function autoFillStatsMeta(pokemon) {
    const statsMeta = pokemon.stats_meta || {};
    let ivs = statsMeta.ivs;
    let evLevel = statsMeta.ev_level;
    
    // IVs 只生成一次，如果已存在有效的 IVs，永远不重新生成
    if (!isValidIVs(ivs)) {
      const quality = pokemon.quality || pokemon.iv_quality || null;
      
      if (quality && ['low', 'medium', 'high', 'perfect'].includes(quality)) {
        // AI 指定了资质等级
        ivs = generateIVsByQuality(quality);
      } else {
        // 随机资质（权重：低30% 中40% 高25% 顶5%）
        const rand = Math.random();
        let randomQuality;
        if (rand < 0.30) randomQuality = 'low';
        else if (rand < 0.70) randomQuality = 'medium';
        else if (rand < 0.95) randomQuality = 'high';
        else randomQuality = 'perfect';
        
        ivs = generateIVsByQuality(randomQuality);
      }
      console.log(`${PLUGIN_NAME} [IVs] 为 ${pokemon.name} 生成新 IVs:`, ivs);
    } else {
      console.log(`${PLUGIN_NAME} [IVs] ${pokemon.name} 已有 IVs，保持不变`);
    }
    
    // EVs 只增不减：根据等级计算新值，取现有值和新值的较大者
    const lv = typeof pokemon.lv === 'number' ? pokemon.lv : (typeof pokemon.level === 'number' ? pokemon.level : 5);
    const calculatedEV = Math.min(252, Math.floor(lv * 2.5));
    
    if (evLevel === undefined || evLevel === null) {
      // 如果没有现有 EV，使用计算值
      evLevel = calculatedEV;
    } else {
      // 如果有现有 EV，取较大值（只增不减）
      evLevel = Math.max(evLevel, calculatedEV);
    }
    
    return { ivs, ev_level: evLevel };
  }

  /**
   * 生成玩家队伍注入内容（详细 XML 格式）
   */
  function generatePlayerDataPrompt(playerData) {
    const parsedParty = parsePartyData(playerData?.party);

    if (!playerData || parsedParty.length === 0) {
      return null;
    }

    const playerName = playerData?.name || '训练家';
    // 从 bonds 和 unlocks 读取解锁状态
    const bonds = playerData?.bonds || {};
    const unlocks = playerData?.unlocks || {};
    const partyCount = parsedParty.length;

    // 构建每个槽位的详细信息（空槽位显示占位符）
    const partyLines = Array.from({ length: 6 }).map((_, idx) => {
      const slotNum = idx + 1;
      const pokemon = parsedParty.find(p => (p.slot || slotNum) === slotNum);

      if (!pokemon) {
        return `slot${slotNum}. —`;
      }

      const name = pokemon.nickname || pokemon.name || `Pokemon ${slotNum}`;
      const level = typeof pokemon.lv === 'number'
        ? pokemon.lv
        : (typeof pokemon.level === 'number' ? pokemon.level : '??');
      const gender = formatGender(pokemon.gender);
      const nature = pokemon.nature || '???';
      const ability = pokemon.ability || '???';
      
      // 领队标记
      const isLead = pokemon.isLead === true;
      const leadTag = isLead ? ' [🎯领队]' : '';
      
      // IVs 和 EVs - 自动补全缺失数据
      const filledStatsMeta = autoFillStatsMeta(pokemon);
      const ivs = filledStatsMeta.ivs;
      const evLevel = filledStatsMeta.ev_level;
      const ivsDisplay = formatIVsDisplay(ivs);
      
      // AVs (情感努力值) - 洛迪亚特区专属系统
      const avs = pokemon.avs || { trust: 0, passion: 0, insight: 0, devotion: 0 };
      const avsTotal = (avs.trust || 0) + (avs.passion || 0) + (avs.insight || 0) + (avs.devotion || 0);
      const avsDisplay = avsTotal > 0 
        ? `T:${avs.trust || 0}/P:${avs.passion || 0}/I:${avs.insight || 0}/D:${avs.devotion || 0}`
        : '0/0/0/0';
      
      // 技能
      const moves = Array.isArray(pokemon.moves) && pokemon.moves.length > 0 ? pokemon.moves : [];
      const movesCount = moves.length;
      const movesDetailed = Array.from({ length: 4 }).map((_, moveIdx) => {
        const moveName = moves[moveIdx] || '—';
        return `move${moveIdx + 1}: ${moveName}`;
      }).join(' | ');

      return `slot${slotNum}. ${gender} ${name} (Lv.${level})${leadTag}
   🧬 [Nature: ${nature}] [Ability: ${ability}]
   💎 [Stats: ${ivsDisplay}] [EVs: ${evLevel}] [AVs: ${avsDisplay}]
   ⚔️ Moves (${movesCount}/4): ${movesDetailed}`;
    }).join('\n\n');

    // 构建解锁状态显示（简略版）
    const unlocksDisplay = [];
    if (unlocks.enable_mega) unlocksDisplay.push('Mega');
    if (unlocks.enable_z_move) unlocksDisplay.push('Z');
    if (unlocks.enable_dynamax) unlocksDisplay.push('Dmax');
    if (unlocks.enable_tera) unlocksDisplay.push('Tera');
    if (unlocks.enable_bond) unlocksDisplay.push('Bond');
    if (unlocks.enable_styles) unlocksDisplay.push('Style');
    if (unlocks.enable_insight) unlocksDisplay.push('Insight');
    if (unlocks.enable_proficiency_cap) unlocksDisplay.push('ProfCap');
    const unlocksStr = unlocksDisplay.length > 0 ? unlocksDisplay.join('/') : '无';

    // 构建羁绊遗物清单（详细版）- 区分 bonds（女主角羁绊道具）和 unlocks（普通能力）
    const bondItems = [];  // 女主角羁绊道具（优先显示）
    const unlockItems = []; // 普通解锁能力（非羁绊来源）
    
    // 羁绊 (Bond) - Rosa
    if (bonds.enable_bond) {
      bondItems.push(`  💠💚 「嵌有『未碎之钻』的同步耳返」 —— [合众] Rosa赠 [💍誓约]
     [外观] 经过野路子改装的专业舞台耳返。电池仓被暴力拆除，强行嵌入了一枚散发着高热、理应在一次性使用后就粉碎的“普通宝石”作为永续核心。
     📈 效果: 绝境安可 - 【特殊机制】耳返实时传输着甚至令人感到过载的心跳声。当你的王牌宝可梦陷入**濒死绝境**（HP危机/最后一只）时，引发如同消耗道具般的一次性极具爆发力演出。`);
    } else if (unlocks.enable_bond) {
      unlockItems.push(`  💚 羁绊共鸣 (Bond) [🔓解锁] - 来源: 通用共鸣手环`);
    }
    
    // 刚猛/迅疾 (Style) - Akari
    if (bonds.enable_styles) {
      bondItems.push(`  🧣🔮 「留有牙印的朱红色头巾」 —— [洗翠] Akari赠 [💍誓约]
     [考据] 银河队调查组制式三角巾。织物粗糙，表面并不且只有火药味，边角处留有几圈极其深刻的、甚至咬穿了布料的陈旧齿痕。
     ⚔️ 效果: 生存本能 - 【形态转化】不再拘泥于现代竞技规则。战斗中可以随时根据求生本能切换指令：或是以透支体能为代价使出力道浑厚的一击（刚猛），或是通过减少发力来换取让人无法反应的神速（迅疾）。`);
    } else if (unlocks.enable_styles) {
      unlockItems.push(`  🔮 刚猛/迅疾 (Style) [🔓解锁] - 来源: 洗翠护符`);
    }
    
    // 心眼 (Insight) - Dawn
    if (bonds.enable_insight) {
      bondItems.push(`  ⌚💟 「按键凹陷的粉闪型号旧表」 —— [神奥] Dawn贈 [💍誓约]
     [状态] 老式宝可梦手表。右侧的物理切换按键因长期经受超高强度的按压，已彻底凹陷卡死在机身内部，导致屏幕画面永久固化在【亲密值MAX】界面。
     👁️ 效果: 协调师视界  - 【弱点识破】虽然显示界面卡死，但内部核心处于运算状态，会将敌方的“大破绽（弱点属性）”直接高亮投射在训练家的视野中；且全队因此恒定处于突破好感度的“满恩返”状态。`);
    } else if (unlocks.enable_insight) {
      unlockItems.push(`  👁️ 心眼 [🔓解锁] - 来源: 宝可梦手表（量产型）`);
    }
    
    // Mega进化 - Serena
    if (bonds.enable_mega) {
      bondItems.push(`  🎗️💎 「蓝色缎带·钥石项圈」—— [卡洛斯] Serena赠 [💍誓约]
     [构造] 由一条原本用于系头发的标志性蓝缎带裁剪而成。这枚触发进化的“钥石”并非通过金属镶嵌，而是由笨拙但结实的针线手工缝在布料正中的。
     🌟 效果: 接触信赖  - 【Mega槽位】替代了缺乏触感的工业手环。不需要喊出口令，该道具紧贴颈部动脉，即可完成MEGA进化。`);
    } else if (unlocks.enable_mega) {
      unlockItems.push(`  💎 Mega进化 [🔓解锁] - 来源: 制式钥石原石`);
    }
    
    // Z招式 - Selene
    if (bonds.enable_z_move) {
      bondItems.push(`  💪🔥 「刻有名字的Z手环」—— [阿罗拉] Selene赠 [💍誓约]
     [物证] 黑色涂装的旧款强力手环。内环残留着难以散去的高体温与高湿度，内侧刻有歪歪扭扭的私人签名。
     ⚡ 效果: 限制解除 (Break Limit) - 【Z与Mega兼容】尽管尺寸略显紧绷，但因为甚至被强行固定在了腕部，赋予了让一只宝可梦可以突破物理规则的权限，使其能够承受并释放全力Z招式。`);
    } else if (unlocks.enable_z_move) {
      unlockItems.push(`  🔥 Z招式 [🔓解锁] - 来源: 白色Z手环`);
    }
    
    // 极巨化 - Gloria
    if (bonds.enable_dynamax) {
      bondItems.push(`  ☄️🌀 「未被加工的许愿星原型」 —— [伽勒尔] Gloria赠 [💍誓约]
     [原矿] 从闇夜源头剥离的深红色矿石，未经马洛科蒙集团的安全切削与工业封装，表面有点粗糙扎手。
     🌋 效果: 能量点拟似 - 【全域展开】该矿石自身散发的能力浓度极高，不再受限于特定道馆或能量点。训练家可在**任何已进入战斗**的场合，无视空间限制皆强行诱发极巨化现象。`);
    } else if (unlocks.enable_dynamax) {
      unlockItems.push(`  🌀 极巨化 [🔓解锁] - 来源: 竞技场专用腕带`);
    }
    
    // 太晶化 - Juliana
    if (bonds.enable_tera) {
      bondItems.push(`  🧳🔮 「满载的收纳箱与太晶珠」 —— [帕底亚] Juliana赠 [💍誓约]
     [补给] 带有明显户外磕碰痕迹的重型铝箱。箱内防震海绵中按光谱分门别类嵌入了*全套18种高纯度太晶源石*，中央核心位置固定着一枚星晶原矿。
     ✨ 效果: 移动充能站 - 【全属性随意切换】不再依赖一次性的充能服务。持有该箱体者，可在接触战中即时更换太晶珠核心，将任意宝可梦赋予可以随意指定的太晶属性。`);
    } else if (unlocks.enable_tera) {
      unlockItems.push(`  ✨ 太晶化 [🔓解锁] - 来源: 学院配给太晶珠`);
    }
    
    // 训练度突破 - May
    if (bonds.enable_proficiency_cap) {
      bondItems.push(`  📓🍓 「沾有果酱的破旧笔记本」 —— [丰缘] May赠 [💍誓约]
     [状态] 边角已经磨损起毛、封皮还用防水胶带补过好几次的便携式调查笔记。随便翻开一页，相比起正经的生态数据，更多的地方写满了诸如《这就去吃这家店！》、《完全不推荐！》之类的狂草注脚。
     🚀 效果: 界限突破 - 【训练度上限提升】你的训练家熟练度上限提升至 255 (Max)。`);
    } else if (unlocks.enable_proficiency_cap) {
      unlockItems.push(`  🚀 训练度突破 [🔓解锁] - 来源: 通用训练手册`);
    }

    
    // 构建显示内容：羁绊道具优先，普通解锁次之
    let inventorySection = '';
    if (bondItems.length > 0 || unlockItems.length > 0) {
      inventorySection = '\n🎒 《洛迪亚特区 · 羁绊遗物清单》\n';
      if (bondItems.length > 0) {
        inventorySection += `【💍 羁绊道具】\n${bondItems.join('\n\n')}\n`;
      }
      if (unlockItems.length > 0) {
        inventorySection += `\n【🔓 普通解锁】\n${unlockItems.join('\n')}\n`;
      }
    } else {
      inventorySection = '\n🎒 《洛迪亚特区 · 羁绊遗物清单》\n  (空空如也...尚未获得任何羁绊遗物)\n';
    }

    // 构建 BOX 宝可梦简要显示
    let boxSection = '';
    const boxData = playerData?.box || {};
    const boxPokemon = Object.entries(boxData)
      .filter(([key, pokemon]) => pokemon && pokemon.name)
      .map(([key, pokemon]) => {
        const name = pokemon.nickname || pokemon.name;
        const level = pokemon.lv || pokemon.level || '??';
        return `${name}/Lv.${level}`;
      });
    
    if (boxPokemon.length > 0) {
      boxSection = `\n📦 《BOX 存储》(${boxPokemon.length})\n  ${boxPokemon.join(' | ')}\n`;
    }

    return `<pkm_team_summary>
【当前玩家状态】
👤 训练家: ${playerName} | 🔓 解锁: [${unlocksStr}] | 🎒 队伍: (${partyCount}/6)
--------------------------------------------------
${partyLines}
--------------------------------------------------
${inventorySection}${boxSection}
--------------------------------------------------
💡 提示: 战斗中请通过 <PKM_BATTLE> 标签调用队伍。
</pkm_team_summary>`;
  }

  /**
   * 处理生成前注入（GENERATION_AFTER_COMMANDS）
   */
  async function handleGenerationBeforeInject(detail) {
    const isDryRun = Boolean(detail && detail.dryRun);
    
    try {
      // 清除旧注入
      try {
        uninjectPrompts([PKM_INJECT_ID]);
      } catch (e) {
        // 忽略
      }

      // 获取玩家数据
      const playerData = await getPlayerParty();
      console.log(`${PLUGIN_NAME} [DEBUG] 原始 playerData:`, JSON.stringify(playerData, null, 2));
      
      // 【防呆】检查并修复被 AI 设为 null 的槽位
      if (playerData && playerData.party) {
        const repairResult = await repairNullSlots(playerData.party, true);
        if (repairResult.repaired) {
          console.warn(`${PLUGIN_NAME} [防呆] 已修复 ${repairResult.repairedSlots.length} 个损坏槽位: ${repairResult.repairedSlots.join(', ')}`);
        }
      }
      
      // === 处理 ev_up：智能累加或替换 ===
      const evUpdateData = {};
      if (playerData && playerData.party) {
        for (const [slotKey, slotData] of Object.entries(playerData.party)) {
          if (slotData && slotData.stats_meta && slotData.stats_meta.ev_up > 0) {
            const currentEvLevel = slotData.stats_meta.ev_level || 0;
            const evUp = slotData.stats_meta.ev_up;
            let newEvLevel;
            let mode;
            
            // 智能判断：ev_up > ev_level 且 ev_level >= 20 -> AI 理解错了，应该替换
            if (evUp > currentEvLevel && currentEvLevel >= 20) {
              newEvLevel = evUp; // 替换模式
              mode = '替换（AI 误输出总值）';
            } else {
              newEvLevel = currentEvLevel + evUp; // 累加模式
              mode = '累加';
            }
            
            console.log(`${PLUGIN_NAME} [EV_UP] 槽位: ${slotKey}, 当前 ev_level: ${currentEvLevel}, ev_up: ${evUp}, 新 ev_level: ${newEvLevel}, 模式: ${mode}`);
            
            // 标记需要更新
            evUpdateData[`pkm.player.party.${slotKey}.stats_meta.ev_level`] = newEvLevel;
            evUpdateData[`pkm.player.party.${slotKey}.stats_meta.ev_up`] = 0;
            
            // 立即更新本地数据（用于注入）
            slotData.stats_meta.ev_level = newEvLevel;
            slotData.stats_meta.ev_up = 0;
          }
        }
      }
      
      // 如果有 ev_up 需要处理，立即更新到 ERA
      if (Object.keys(evUpdateData).length > 0) {
        try {
          await updateEraVars(evUpdateData);
          console.log(`${PLUGIN_NAME} ✓ 已处理 ev_up 并更新到 ERA`);
        } catch (e) {
          console.warn(`${PLUGIN_NAME} 更新 ev_up 失败:`, e);
        }
      }
      
      // === 处理 proficiency_up：累加到 trainerProficiency ===
      // ERA 格式：player.trainerProficiency (基础值), player.proficiency_up (增量)
      // 战斗格式：player.trainerProficiency (总值)
      const proficiencyUpdateData = {};
      if (playerData) {
        const currentProficiency = playerData.trainerProficiency || 0;
        const proficiencyUp = playerData.proficiency_up || 0;
        
        if (proficiencyUp !== 0) {
          // 累加并限制在 0-255 范围内
          const newProficiency = Math.max(0, Math.min(255, currentProficiency + proficiencyUp));
          
          console.log(`${PLUGIN_NAME} [PROFICIENCY] 当前: ${currentProficiency}, +${proficiencyUp} = ${newProficiency}`);
          
          // 标记需要更新
          proficiencyUpdateData['player.trainerProficiency'] = newProficiency;
          proficiencyUpdateData['player.proficiency_up'] = 0;
          
          // 立即更新本地数据（用于注入）
          playerData.trainerProficiency = newProficiency;
          playerData.proficiency_up = 0;
        }
      }
      
      // 如果有 proficiency_up 需要处理，立即更新到 ERA
      if (Object.keys(proficiencyUpdateData).length > 0) {
        try {
          await updateEraVars(proficiencyUpdateData);
          console.log(`${PLUGIN_NAME} ✓ 已处理 proficiency_up 并更新到 ERA`);
        } catch (e) {
          console.warn(`${PLUGIN_NAME} 更新 proficiency_up 失败:`, e);
        }
      }
      
      // === 处理 AVs (Affective Values / 情感努力值) ===
      // ERA 格式：friendship = { avs: {...}, av_up: {...} }
      // 战斗格式：friendship = { trust, passion, insight, devotion } (扁平)
      // 玩家的所有宝可梦自动获得 isAce = true
      const avUpdateData = {};
      if (playerData && playerData.party) {
        for (const [slotKey, slotData] of Object.entries(playerData.party)) {
          if (!slotData) continue;
          
          // 初始化 friendship 结构
          if (!slotData.friendship) {
            slotData.friendship = {
              avs: { trust: 0, passion: 0, insight: 0, devotion: 0 },
              av_up: { trust: 0, passion: 0, insight: 0, devotion: 0 }
            };
          }
          if (!slotData.friendship.avs) {
            slotData.friendship.avs = { trust: 0, passion: 0, insight: 0, devotion: 0 };
          }
          if (!slotData.friendship.av_up) {
            slotData.friendship.av_up = { trust: 0, passion: 0, insight: 0, devotion: 0 };
          }
          
          // 玩家的所有宝可梦都是 Ace（主角光环）
          if (!slotData.isAce) {
            slotData.isAce = true;
            avUpdateData[`pkm.player.party.${slotKey}.isAce`] = true;
          }
          
          // 处理 av_up：累加到 avs
          const avUp = slotData.friendship.av_up;
          const currentAvs = slotData.friendship.avs;
          let hasUpdate = false;
          
          for (const stat of ['trust', 'passion', 'insight', 'devotion']) {
            if (avUp[stat] && typeof avUp[stat] === 'number' && avUp[stat] > 0) {
              const currentVal = currentAvs[stat] || 0;
              const upVal = avUp[stat];
              let newVal;
              let mode;
              
              // 智能判断：av_up > avs 且 avs >= 50 -> AI 理解错了，应该替换
              if (upVal > currentVal && currentVal >= 50) {
                newVal = Math.min(255, upVal); // 替换模式，上限255
                mode = '替换（AI 误输出总值）';
              } else {
                newVal = Math.min(255, currentVal + upVal); // 累加模式，上限255
                mode = '累加';
              }
              
              console.log(`${PLUGIN_NAME} [AV_UP] 槽位: ${slotKey}, ${stat}: ${currentVal} -> ${newVal}, 模式: ${mode}`);
              currentAvs[stat] = newVal;
              hasUpdate = true;
            }
          }
          
          if (hasUpdate) {
            // 标记需要更新
            avUpdateData[`pkm.player.party.${slotKey}.friendship.avs`] = currentAvs;
            avUpdateData[`pkm.player.party.${slotKey}.friendship.av_up`] = { trust: 0, passion: 0, insight: 0, devotion: 0 };
            
            // 立即更新本地数据（用于注入）
            slotData.friendship.avs = currentAvs;
            slotData.friendship.av_up = { trust: 0, passion: 0, insight: 0, devotion: 0 };
          }
          
          // 为战斗注入准备扁平格式的 avs（直接从 friendship.avs 复制）
          slotData.avs = { ...currentAvs };
        }
      }
      
      // 如果有 av_up 需要处理，立即更新到 ERA
      if (Object.keys(avUpdateData).length > 0) {
        try {
          await updateEraVars(avUpdateData);
          console.log(`${PLUGIN_NAME} ✓ 已处理 av_up 并更新到 ERA`);
        } catch (e) {
          console.warn(`${PLUGIN_NAME} 更新 av_up 失败:`, e);
        }
      }
      
      // 使用 parsePartyData 解析队伍（支持新的 slot1-slot6 对象格式）
      const parsedParty = parsePartyData(playerData?.party);
      
      if (!playerData || parsedParty.length === 0) {
        console.log(`${PLUGIN_NAME} 玩家队伍为空，跳过注入`);
        return;
      }

      console.log(`${PLUGIN_NAME} [DEBUG] 解析后 parsedParty:`, JSON.stringify(parsedParty, null, 2));

      // 补全 stats_meta 并持久化到 ERA（针对具体槽位更新，不覆盖整个 party）
      const slotsToUpdate = {};
      const displayParty = parsedParty.map(p => {
        const statsMeta = p.stats_meta || {};
        const hasValidIVs = isValidIVs(statsMeta.ivs);
        const hasEVLevel = statsMeta.ev_level !== undefined && statsMeta.ev_level !== null;
        
        // 如果缺少 IVs 或 EVs，生成并标记需要更新
        if (!hasValidIVs || !hasEVLevel) {
          const filled = autoFillStatsMeta(p);
          const slotKey = `slot${p.slot || 1}`;
          
          // 只更新 stats_meta，不覆盖其他字段
          slotsToUpdate[slotKey] = {
            stats_meta: filled
          };
          
          console.log(`${PLUGIN_NAME} [IVs] 为 ${p.name} (${slotKey}) 生成 stats_meta，将持久化`);
          return {
            ...p,
            stats_meta: filled
          };
        }
        return p;
      });
      
      // 如果有需要更新的槽位，持久化到 ERA（只更新 stats_meta，不覆盖其他数据）
      if (Object.keys(slotsToUpdate).length > 0) {
        try {
          // 构建更新对象，只更新具体槽位的 stats_meta
          const updateData = {};
          for (const [slotKey, data] of Object.entries(slotsToUpdate)) {
            updateData[`pkm.player.party.${slotKey}.stats_meta`] = data.stats_meta;
          }
          await updateEraVars(updateData);
          console.log(`${PLUGIN_NAME} ✓ 已持久化 ${Object.keys(slotsToUpdate).length} 个槽位的 stats_meta`);
        } catch (e) {
          console.warn(`${PLUGIN_NAME} 持久化 stats_meta 失败:`, e);
        }
      }

      // 生成注入内容（使用显示用的数据）
      const displayPlayerData = { ...playerData, party: displayParty };
      const promptContent = generatePlayerDataPrompt(displayPlayerData);
      if (!promptContent) return;

      // 注入到上下文
      injectPrompts([{
        id: PKM_INJECT_ID,
        position: 'in_chat',
        depth: 2,
        role: 'system',
        should_scan: false,
        content: promptContent
      }]);

      console.log(`${PLUGIN_NAME} ✓ 玩家队伍数据已注入到上下文`);

    } catch (e) {
      console.error(`${PLUGIN_NAME} 注入失败:`, e);
    }
  }

  /**
   * 处理消息渲染事件（era:writeDone）- 处理AI输出的战斗标签
   */
  async function handleWriteDone(detail) {
    if (isProcessing) {
      console.log(`${PLUGIN_NAME} 正在处理中，跳过`);
      return;
    }

    const messageId = detail?.message_id ?? getLastMessageId();
    
    try {
      isProcessing = true;

      // 获取消息内容
      const messages = getChatMessages(messageId);
      if (!messages || messages.length === 0) {
        isProcessing = false;
        return;
      }

      const msg = messages[0];
      const content = msg.message || '';

      // 检查是否包含战斗标签
      if (!content.includes(`<${PKM_BATTLE_TAG}>`)) {
        isProcessing = false;
        return;
      }

      // 检查是否已经处理过（已有 PKM_FRONTEND）
      if (content.includes('<PKM_FRONTEND>')) {
        console.log(`${PLUGIN_NAME} 已处理过，跳过`);
        isProcessing = false;
        return;
      }

      console.log(`${PLUGIN_NAME} 检测到战斗标签，开始处理...`);

      // 解析AI输出
      const aiBattleData = parseAiBattleOutput(content);
      if (!aiBattleData) {
        console.warn(`${PLUGIN_NAME} 无法解析战斗数据`);
        isProcessing = false;
        return;
      }

      // 构建完整战斗JSON
      const completeBattle = await buildCompleteBattleJson(aiBattleData);

      // 注入前端
      await injectBattleFrontend(messageId, completeBattle);

      isProcessing = false;
    } catch (e) {
      console.error(`${PLUGIN_NAME} 处理消息失败:`, e);
      isProcessing = false;
    }
  }

  // ============================================
  //    E. 动态 NPC 注入系统
  // ============================================
  
  const NPC_INJECT_ID = 'pkm_npc_status';
  
  /**
   * 获取 NPC 关系阶段的四个 TAG（通用2个 + 角色专属2个）
   * @param {string} npcId - NPC ID
   * @param {number} stage - 当前阶段 (-2 ~ 4)
   * @returns {object} - { tags: string[], tagsDisplay: string }
   */
  function getNpcStageTags(npcId, stage) {
    const addon = NPC_ADDON_DATA[npcId];
    const stageKey = String(stage);
    
    // 获取通用 TAG（2个）
    const commonTags = RELATIONSHIP_TAGS_COMMON[stageKey] || ['未知', '未知'];
    
    // 获取角色专属 TAG（2个）
    let characterTags = ['未知', '未知'];
    if (addon && addon.relationship_tags && addon.relationship_tags[stageKey]) {
      characterTags = addon.relationship_tags[stageKey];
    }
    
    // 合并为四个 TAG
    const allTags = [...commonTags, ...characterTags];
    const tagsDisplay = allTags.map(t => `#${t}`).join(' ');
    
    return { tags: allTags, tagsDisplay };
  }
  
  /**
   * 获取 NPC 关系阶段描述（兼容旧格式）
   * @param {string} npcId - NPC ID
   * @param {number} stage - 当前阶段 (-2 ~ 4)
   * @returns {object} - { label, desc }
   */
  function getNpcStageDesc(npcId, stage) {
    const addon = NPC_ADDON_DATA[npcId];
    
    // 新格式：使用 relationship_tags
    if (addon && addon.relationship_tags) {
      const { tagsDisplay } = getNpcStageTags(npcId, stage);
      return { label: tagsDisplay, desc: '' };
    }
    
    // 旧格式兼容：relationship_stage
    if (!addon || !addon.relationship_stage) {
      return { label: '未知', desc: '未定义状态...' };
    }
    
    const stageKey = String(stage);
    const stageData = addon.relationship_stage;
    
    if (stage < 0 && stageData.negative?.[stageKey]) {
      return stageData.negative[stageKey];
    } else if (stage > 0 && stageData.positive?.[stageKey]) {
      return stageData.positive[stageKey];
    } else if (stageData.neutral?.[stageKey]) {
      return stageData.neutral[stageKey];
    }
    
    return { label: '未知', desc: '未定义状态...' };
  }
  
  /**
   * 获取下一阶段升级所需的 love 门槛
   * @param {string} npcId - NPC ID
   * @param {number} currentStage - 当前阶段
   * @returns {number|null} - 门槛值，null 表示已满级
   */
  function getNextLoveThreshold(npcId, currentStage) {
    const addon = NPC_ADDON_DATA[npcId];
    if (!addon || !addon.love_thresholds) return null;
    
    const nextStage = currentStage + 1;
    return addon.love_thresholds[nextStage] || null;
  }
  
  /**
   * 生成单个 NPC 的状态卡
   * @param {string} npcId - NPC ID
   * @param {object} npcState - { stage, love, love_up }
   * @param {object} playerBonds - 玩家的 bonds 状态
   * @returns {string} - 状态卡文本
   */
  function generateNpcStatusCard(npcId, npcState, playerBonds = {}) {
    const addon = NPC_ADDON_DATA[npcId];
    if (!addon) return null;
    
    const stage = npcState.stage || 0;
    const love = npcState.love || 0;
    const stageDesc = getNpcStageDesc(npcId, stage);
    const nextThreshold = getNextLoveThreshold(npcId, stage);
    
    // 检查是否已获得该 NPC 的羁绊道具
    const hasBond = addon.unlock_key && playerBonds[addon.unlock_key] === true;
    
    // 判断状态标签
    let statusTag = '';
    if (stage === 4 || stage === -2) {
      statusTag = '[🔒Lock]';
    } else if (stage === 3 && nextThreshold !== null && love >= nextThreshold) {
      // Stage 3→4 特殊处理：需要 AI 显式升级
      if (hasBond) {
        statusTag = `[💍已获得羁绊道具，可由AI升级→Stage 4]`;
      } else {
        statusTag = `[🎁好感度已满，等待羁绊道具解锁事件]`;
      }
    } else if (nextThreshold !== null && love >= nextThreshold) {
      // 显示下一阶段信息（0→1, 1→2, 2→3 自动升级）
      const nextStage = stage + 1;
      const nextStageDesc = getNpcStageDesc(npcId, nextStage);
      statusTag = `[❤️可UP→Stage ${nextStage}: ${nextStageDesc.label}]`;
    } else if (stage === 0 && love <= -20) {
      statusTag = '[💔可降级DOWN]';
    } else if (stage === -1 && love <= -40) {
      statusTag = '[💔可降级DOWN]';
    }
    
    // 格式化 love 显示
    let loveDisplay;
    if (nextThreshold !== null) {
      loveDisplay = `${love}/${nextThreshold}`;
    } else if (stage === 0) {
      loveDisplay = `${love} (降级: -20)`;
    } else if (stage === -1) {
      loveDisplay = `${love} (降级: -40)`;
    } else {
      loveDisplay = `${love}/MAX`;
    }
    
    // 新格式：使用四个 TAG 显示
    if (addon.relationship_tags) {
      const { tagsDisplay } = getNpcStageTags(npcId, stage);
      const lines = [
        `${addon.name_cn} (${addon.name_en})`,
        `   - [Stage ${stage}] ${tagsDisplay} (Love: ${loveDisplay})`
      ];
      if (statusTag) lines.push(`   - ${statusTag}`);
      return lines.join('\n');
    }
    
    // 旧格式兼容
    const legacyLines = [
      `${addon.name_cn} (${addon.name_en})`,
      `   - [Stage ${stage}: ${stageDesc.label}] (Love: ${loveDisplay})`
    ];
    if (statusTag || stageDesc.desc) {
      legacyLines.push(`   - 状态: ${statusTag} ${stageDesc.desc}`.trim());
    }
    return legacyLines.join('\n');
  }
  
  /**
   * 扫描上下文并注入活跃 NPC 的状态
   */
  async function handleDynamicNpcInject() {
    console.log(`${PLUGIN_NAME} [NPC] 开始扫描上下文以注入 NPC 状态...`);
    
    try {
      // 1. 获取最近消息（扫描最近 10 条）
      const historyDepth = 10;
      const allMessages = getChatMessages('0-{{lastMessageId}}');
      
      if (!allMessages || allMessages.length === 0) {
        console.log(`${PLUGIN_NAME} [NPC] 无消息可扫描`);
        return;
      }
      
      // 取最后 N 条
      const messages = allMessages.slice(-historyDepth);
      
      // 过滤掉 ERA 变量标签，避免匹配到 JSON 里的 NPC ID
      const contextText = messages.map(m => {
        let text = m.message || '';
        // 移除 <VariableInsert>、<VariableEdit>、<VariableDelete> 标签及其内容
        text = text.replace(/<VariableInsert>[\s\S]*?<\/VariableInsert>/gi, '');
        text = text.replace(/<VariableEdit>[\s\S]*?<\/VariableEdit>/gi, '');
        text = text.replace(/<VariableDelete>[\s\S]*?<\/VariableDelete>/gi, '');
        return text;
      }).join('\n').toLowerCase();
      
      // 2. 获取 NPC 状态（优先使用快照，因为 processNpcLoveUp 可能刚更新）
      const eraVars = await getEraVars();
      const npcsState = getEraValue(eraVars, 'world_state.npcs', {});
      const playerBonds = getEraValue(eraVars, 'player.bonds', {});
      
      // 新格式: world_state.location 是对象 { region, x, y }
      const locationData = getEraValue(eraVars, 'world_state.location', {});
      const currentLocation = typeof locationData === 'object' 
        ? (locationData.region || 'Z') 
        : (locationData || 'Z');
      
      // 合并快照数据（快照优先，因为是最新的）
      const mergedNpcsState = {};
      for (const npcId in npcsState) {
        mergedNpcsState[npcId] = {
          ...npcsState[npcId],
          ...(window._npcStateSnapshot && window._npcStateSnapshot[npcId])
        };
      }
      
      // 3. 扫描关键词，找出活跃主要 NPC
      const activeNpcs = [];
      
      for (const [npcId, keywords] of Object.entries(NPC_TRIGGERS)) {
        const hit = keywords.some(k => contextText.includes(k.toLowerCase()));
        if (hit && mergedNpcsState[npcId]) {
          activeNpcs.push(npcId);
        }
      }
      
      console.log(`${PLUGIN_NAME} [NPC] 当前区域: ${currentLocation} (${ZONE_DATA[currentLocation]?.name_cn || '未知'})`);
      console.log(`${PLUGIN_NAME} [NPC] 激活主要角色: ${activeNpcs.join(', ') || '无'}`);
      
      // 4. 生成状态卡
      const sections = [];
      
      // 区域 NPC 舒适度卡（始终显示当前区域的 NPC 舒适度信息）
      const zoneCard = generateZoneStatusCard(currentLocation);
      sections.push(zoneCard);
      
      // 主要 NPC 状态卡
      if (activeNpcs.length > 0) {
        const mainCards = activeNpcs.map((npcId, index) => {
          const state = mergedNpcsState[npcId] || { stage: 0, love: 0 };
          const card = generateNpcStatusCard(npcId, state, playerBonds);
          return `${index + 1}. ${card}`;
        }).filter(Boolean).join('\n\n');
        
        sections.push(`【当前活跃/关注的主要 NPC 状态】\n${mainCards}`);
      }
      
      const promptContent = `<npc_status_brief>
${sections.join('\n\n')}
</npc_status_brief>`;
      
      // 6. 注入到世界书上下文
      injectPrompts([{
        id: NPC_INJECT_ID,
        position: 'after_wi_scan',
        depth: 0,
        role: 'system',
        should_scan: false,
        content: promptContent
      }]);
      
      console.log(`${PLUGIN_NAME} [NPC] ✓ 已注入 ${activeNpcs.length} 个活跃主要 NPC 状态`);
      
    } catch (e) {
      console.error(`${PLUGIN_NAME} [NPC] 注入失败:`, e);
    }
  }

  // ============================================
  //    F. PKM 时间系统 (DAY X 格式)
  // ============================================
  
  const TIME_INJECT_ID = 'pkm_time_status';
  
  /**
   * 时段定义
   * 宝可梦世界的一天分为多个时段
   */
  const TIME_PERIODS = {
    'dawn': { label: '黎明', emoji: '🌅', hours: [5, 6] },
    'morning': { label: '早晨', emoji: '☀️', hours: [7, 8, 9, 10] },
    'noon': { label: '中午', emoji: '🌞', hours: [11, 12, 13] },
    'afternoon': { label: '下午', emoji: '🌤️', hours: [14, 15, 16, 17] },
    'evening': { label: '傍晚', emoji: '🌇', hours: [18, 19] },
    'night': { label: '夜晚', emoji: '🌙', hours: [20, 21, 22, 23] },
    'midnight': { label: '深夜', emoji: '🌑', hours: [0, 1, 2, 3, 4] }
  };
  
  /**
   * 时段顺序（用于推进）
   */
  const PERIOD_ORDER = ['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night', 'midnight'];
  
  /**
   * 获取时段信息
   */
  function getPeriodInfo(period) {
    return TIME_PERIODS[period] || TIME_PERIODS['morning'];
  }
  
  /**
   * 获取下一个时段
   */
  function getNextPeriod(currentPeriod) {
    const idx = PERIOD_ORDER.indexOf(currentPeriod);
    if (idx === -1) return 'morning';
    return PERIOD_ORDER[(idx + 1) % PERIOD_ORDER.length];
  }
  
  /**
   * 从 DAY 数计算派生时间信息
   * @param {number} day - 当前天数 (从 1 开始)
   * @returns {object} - { year, month, week, dayOfMonth, dayOfWeek, dayOfWeekLabel }
   */
  function calculateDerivedTime(day) {
    if (!day || day < 1) day = 1;
    
    // 每年 365 天，每月 30 天，每周 7 天
    const DAYS_PER_YEAR = 365;
    const DAYS_PER_MONTH = 30;
    const DAYS_PER_WEEK = 7;
    
    const year = Math.floor((day - 1) / DAYS_PER_YEAR) + 1;
    const dayOfYear = ((day - 1) % DAYS_PER_YEAR) + 1;
    
    const month = Math.floor((dayOfYear - 1) / DAYS_PER_MONTH) + 1;
    const dayOfMonth = ((dayOfYear - 1) % DAYS_PER_MONTH) + 1;
    
    const week = Math.floor((day - 1) / DAYS_PER_WEEK) + 1;
    const dayOfWeek = ((day - 1) % DAYS_PER_WEEK); // 0-6
    
    const dayOfWeekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const dayOfWeekLabel = dayOfWeekLabels[dayOfWeek];
    
    return {
      year,
      month,
      week,
      dayOfYear,
      dayOfMonth,
      dayOfWeek: dayOfWeek + 1, // 1-7
      dayOfWeekLabel
    };
  }
  
  /**
   * 解析 AI 输出的时间推进指令
   * 支持格式：
   * - "1day", "3days", "1 day"
   * - "1week", "2weeks"
   * - "1month"
   * - "next_period" (推进到下一时段)
   * - "skip_to_night", "skip_to_morning" 等
   * @param {string} text - AI 输出的时间推进文本
   * @returns {object|null} - { days: number, periods: number } 或 { skipTo: string }
   */
  function parseTimeAdvance(text) {
    if (!text) return null;
    text = String(text).toLowerCase().trim();
    
    // 匹配 "next_period" 或 "next period"
    if (text === 'next_period' || text === 'next period') {
      return { periods: 1 };
    }
    
    // 匹配 "nextday" 或 "next_day" - 跳转到第二天早晨
    if (text === 'nextday' || text === 'next_day' || text === 'next day') {
      return { nextDay: true };
    }
    
    // 匹配 "skip_to_xxx" 格式
    const skipMatch = text.match(/^skip[_\s]?to[_\s]?(\w+)$/i);
    if (skipMatch) {
      const targetPeriod = skipMatch[1].toLowerCase();
      if (TIME_PERIODS[targetPeriod]) {
        return { skipTo: targetPeriod };
      }
    }
    
    // 匹配复合格式：数字+单位+时段，如 "3days_morning", "1week_night", "2days morning"
    const compoundMatch = text.match(/^(\d+)\s*(day|days|week|weeks|month|months)[_\s]+(\w+)$/i);
    if (compoundMatch) {
      const value = parseInt(compoundMatch[1]);
      const unit = compoundMatch[2].toLowerCase();
      const targetPeriod = compoundMatch[3].toLowerCase();
      
      // 验证时段是否有效
      if (!TIME_PERIODS[targetPeriod]) {
        console.warn(`${PLUGIN_NAME} [TIME] 无效的时段: ${targetPeriod}`);
        return null;
      }
      
      let days = 0;
      if (unit === 'day' || unit === 'days') {
        days = value;
      } else if (unit === 'week' || unit === 'weeks') {
        days = value * 7;
      } else if (unit === 'month' || unit === 'months') {
        days = value * 30;
      }
      
      console.log(`${PLUGIN_NAME} [TIME] 解析复合指令: +${days}天, 时段=${targetPeriod}`);
      return { days: days, toPeriod: targetPeriod };
    }
    
    // 匹配数字+单位格式（不带时段）
    const match = text.match(/^(\d+)\s*(day|days|week|weeks|month|months|period|periods)$/i);
    if (!match) {
      console.warn(`${PLUGIN_NAME} [TIME] day_advance 格式错误: ${text}`);
      return null;
    }
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit === 'day' || unit === 'days') {
      return { days: value };
    } else if (unit === 'week' || unit === 'weeks') {
      return { days: value * 7 };
    } else if (unit === 'month' || unit === 'months') {
      return { days: value * 30 };
    } else if (unit === 'period' || unit === 'periods') {
      return { periods: value };
    }
    
    return null;
  }
  
  /**
   * 计算时间推进后的新状态
   * @param {object} currentTime - { day, period }
   * @param {object} advance - parseTimeAdvance 的返回值
   * @returns {object} - { day, period, crossedDays }
   */
  function advanceTime(currentTime, advance) {
    let day = currentTime.day || 1;
    let period = currentTime.period || 'morning';
    let crossedDays = 0;
    
    if (advance.nextDay) {
      // 跳转到第二天早晨
      day += 1;
      period = 'morning';
      crossedDays = 1;
      return { day, period, crossedDays };
    }
    
    if (advance.skipTo) {
      // 跳转到指定时段
      const currentIdx = PERIOD_ORDER.indexOf(period);
      const targetIdx = PERIOD_ORDER.indexOf(advance.skipTo);
      
      if (targetIdx <= currentIdx) {
        // 目标时段已过，跳到明天
        day += 1;
        crossedDays = 1;
      }
      period = advance.skipTo;
    } else if (advance.periods) {
      // 推进指定数量的时段
      let periodsToAdvance = advance.periods;
      const currentIdx = PERIOD_ORDER.indexOf(period);
      
      const totalPeriods = currentIdx + periodsToAdvance;
      crossedDays = Math.floor(totalPeriods / PERIOD_ORDER.length);
      const newPeriodIdx = totalPeriods % PERIOD_ORDER.length;
      
      day += crossedDays;
      period = PERIOD_ORDER[newPeriodIdx];
    } else if (advance.days) {
      // 推进指定天数
      day += advance.days;
      crossedDays = advance.days;
      
      // 如果指定了目标时段，设置为该时段
      if (advance.toPeriod && TIME_PERIODS[advance.toPeriod]) {
        period = advance.toPeriod;
      }
      // 否则时段保持不变
    }
    
    return { day, period, crossedDays };
  }
  
  /**
   * 生成时间状态卡
   * @param {object} timeState - { day, period }
   * @returns {string}
   */
  function generateTimeStatusCard(timeState) {
    const day = timeState.day || 1;
    const period = timeState.period || 'morning';
    const periodInfo = getPeriodInfo(period);
    const derived = calculateDerivedTime(day);
    
    // 格式：【当前时间】DAY 42 · 第2月第12天 · 周三 · 下午 🌤️
    let card = `【当前时间】DAY ${day}`;
    
    if (derived.year > 1) {
      card += ` · 第${derived.year}年`;
    }
    
    card += ` · 第${derived.month}月第${derived.dayOfMonth}天`;
    card += ` · ${derived.dayOfWeekLabel}`;
    card += ` · ${periodInfo.label} ${periodInfo.emoji}`;
    
    return card;
  }
  
  /**
   * 处理时间推进（day_advance / period_set）
   * 在 GENERATION_AFTER_COMMANDS 中调用
   */
  async function processTimeAdvance() {
    const eraVars = await getEraVars();
    const timeState = getEraValue(eraVars, 'world_state.time', { day: 1, period: 'morning' });
    
    const dayAdvance = getEraValue(eraVars, 'world_state.time.day_advance', null);
    const periodSet = getEraValue(eraVars, 'world_state.time.period_set', null);
    
    if (!dayAdvance && !periodSet) return;
    
    const updateData = {};
    let newDay = timeState.day || 1;
    let newPeriod = timeState.period || 'morning';
    
    // 处理 day_advance
    if (dayAdvance) {
      console.log(`${PLUGIN_NAME} [TIME] 处理时间推进: ${dayAdvance}`);
      const advance = parseTimeAdvance(dayAdvance);
      
      if (advance) {
        const result = advanceTime({ day: newDay, period: newPeriod }, advance);
        newDay = result.day;
        newPeriod = result.period;
        
        console.log(`${PLUGIN_NAME} [TIME] 时间推进完成: DAY ${timeState.day} → DAY ${newDay}, ${timeState.period} → ${newPeriod}`);
      }
      
      // 清除 day_advance
      updateData['world_state.time.day_advance'] = null;
    }
    
    // 处理 period_set（直接设置时段）
    if (periodSet) {
      const targetPeriod = String(periodSet).toLowerCase().trim();
      if (TIME_PERIODS[targetPeriod]) {
        const currentIdx = PERIOD_ORDER.indexOf(newPeriod);
        const targetIdx = PERIOD_ORDER.indexOf(targetPeriod);
        
        // 如果目标时段在当前时段之前，说明跨天了
        if (targetIdx < currentIdx) {
          newDay += 1;
          console.log(`${PLUGIN_NAME} [TIME] 时段设置跨天: DAY ${newDay - 1} → DAY ${newDay}`);
          // 设置宝可梦刷新标志
          window._pkmPendingPokemonRefresh = true;
        }
        
        newPeriod = targetPeriod;
        console.log(`${PLUGIN_NAME} [TIME] 时段设置: ${timeState.period} → ${newPeriod}`);
      } else {
        console.warn(`${PLUGIN_NAME} [TIME] 无效的时段: ${periodSet}`);
      }
      
      // 清除 period_set
      updateData['world_state.time.period_set'] = null;
    }
    
    // 更新时间状态
    if (newDay !== timeState.day || newPeriod !== timeState.period) {
      updateData['world_state.time.day'] = newDay;
      updateData['world_state.time.period'] = newPeriod;
      
      // 更新派生时间信息（供 AI 参考）
      const derived = calculateDerivedTime(newDay);
      updateData['world_state.time.derived'] = derived;
      
      // ========== 如果日期变化，触发宝可梦刷新 ==========
      if (newDay > timeState.day) {
        console.log(`${PLUGIN_NAME} [TIME] 日期变化，触发宝可梦刷新事件`);
        // 使用事件通信触发刷新（跨 iframe）
        eventEmit('pkm:refreshPokemonSpawns', { 
          oldDay: timeState.day, 
          newDay: newDay 
        });
      }
    }
    
    // 应用更新
    if (Object.keys(updateData).length > 0) {
      try {
        await updateEraVars(updateData);
        console.log(`${PLUGIN_NAME} [TIME] ✓ 时间已更新: DAY ${newDay} · ${getPeriodInfo(newPeriod).label}`);
      } catch (e) {
        console.warn(`${PLUGIN_NAME} [TIME] 更新时间失败:`, e);
      }
    }
  }
  
  /**
   * 注入时间状态到上下文
   */
  async function handleTimeInject() {
    try {
      const eraVars = await getEraVars();
      let timeState = getEraValue(eraVars, 'world_state.time', null);
      
      // 如果时间状态不存在，初始化
      if (!timeState || timeState.day === undefined) {
        console.log(`${PLUGIN_NAME} [TIME] 时间状态不存在，初始化为 DAY 1 · 早晨`);
        timeState = { day: 1, period: 'morning' };
        
        // 写入初始时间
        await updateEraVars({
          'world_state.time': {
            day: 1,
            period: 'morning',
            day_advance: null,
            period_set: null,
            derived: calculateDerivedTime(1)
          }
        });
      }
      
      // 生成时间状态卡
      const timeCard = generateTimeStatusCard(timeState);
      const derived = calculateDerivedTime(timeState.day || 1);
      const periodInfo = getPeriodInfo(timeState.period || 'morning');
      
      // 构建注入内容
      const promptContent = `<pkm_time_status>
${timeCard}
[时间系统说明]
- 当前: DAY ${timeState.day || 1}, 时段: ${periodInfo.label}
- 派生: 第${derived.year}年第${derived.month}月第${derived.dayOfMonth}天, ${derived.dayOfWeekLabel}
- 时段顺序: dawn→morning→noon→afternoon→evening→night→midnight→(nextday)dawn
</pkm_time_status>`;
      
      // 注入
      injectPrompts([{
        id: TIME_INJECT_ID,
        position: 'after_wi_scan',
        depth: 2,
        role: 'system',
        should_scan: false,
        content: promptContent
      }]);
      
      console.log(`${PLUGIN_NAME} [TIME] ✓ 已注入时间状态: DAY ${timeState.day || 1} · ${periodInfo.label}`);
      
    } catch (e) {
      console.error(`${PLUGIN_NAME} [TIME] 注入失败:`, e);
    }
  }

  /**
   * 处理 NPC love_up 累加到 love，并验证 stage 变更合法性
   * 在 handleGenerationBeforeInject 中调用
   */
  async function processNpcLoveUp() {
    const eraVars = await getEraVars();
    const npcsState = getEraValue(eraVars, 'world_state.npcs', {});
    
    if (_.isEmpty(npcsState)) return;
    
    // 获取上一次的 NPC 状态快照（用于对比）
    if (!window._npcStateSnapshot) {
      window._npcStateSnapshot = {};
    }
    
    const updateData = {};
    const rollbackWarnings = [];
    
    for (const [npcId, state] of Object.entries(npcsState)) {
      if (!state || typeof state !== 'object') continue;
      
      const currentStage = state.stage || 0;
      const currentLove = state.love || 0;
      const loveUp = state.love_up || 0;
      
      // 获取上一次记录的状态（仅用于 love_up 处理）
      const lastSnapshot = window._npcStateSnapshot[npcId] || { stage: currentStage, love: currentLove };
      
      // === 1. 处理 love_up 累加 ===
      let effectiveLove = currentLove;
      if (loveUp !== 0) {
        // 允许负值，范围 -100 到 100
        effectiveLove = Math.max(-100, Math.min(100, currentLove + loveUp));
        
        console.log(`${PLUGIN_NAME} [NPC] ${npcId}: love ${currentLove} + ${loveUp} = ${effectiveLove}`);
        
        updateData[`pkm.world_state.npcs.${npcId}.love`] = effectiveLove;
        updateData[`pkm.world_state.npcs.${npcId}.love_up`] = 0;
      }
      
      // === 3. 检查自动升级 ===
      // - Stage 0→1, 1→2, 2→3：所有 NPC 自动升级
      // - Stage 3→4：只有【没有 unlock_item 的普通 NPC】自动升级
      //              有 unlock_item 的七个女主必须由 AI 显式填入
      const addon = NPC_ADDON_DATA[npcId];
      const hasUnlockItem = addon && addon.unlock_key && addon.unlock_item;
      
      // 普通 NPC（无 unlock_item）：Stage 0→4 全部自动升级
      // 七个女主（有 unlock_item）：Stage 0→3 自动升级，Stage 3→4 需要 AI 显式填入
      const canAutoUpgrade = addon && (
        currentStage < 3 || 
        (currentStage === 3 && !hasUnlockItem)
      );
      
      if (canAutoUpgrade) {
        const nextThreshold = getNextLoveThreshold(npcId, currentStage);
        
        if (nextThreshold !== null && effectiveLove >= nextThreshold) {
          const newStage = currentStage + 1;
          console.log(`${PLUGIN_NAME} [NPC] 🔼 ${npcId}: 好感度达到 ${effectiveLove}/${nextThreshold}，自动升级 ${currentStage} → ${newStage}`);
          updateData[`pkm.world_state.npcs.${npcId}.stage`] = newStage;
          
          if (!window._npcStateSnapshot[npcId]) {
            window._npcStateSnapshot[npcId] = {};
          }
          window._npcStateSnapshot[npcId].stage = newStage;
        }
      }
      
      // === 4. Stage 3→4 解锁事件检测（仅七个女主，触发事件但不自动升级）===
      if (addon && currentStage === 3 && hasUnlockItem) {
        const nextThreshold = getNextLoveThreshold(npcId, 3); // Stage 4 的阈值
        
        if (nextThreshold !== null && effectiveLove >= nextThreshold) {
          // 检查玩家是否已获得该女主角的羁绊道具（bonds，而非普通 unlocks）
          const eraVars = await getEraVars();
          const playerBonds = getEraValue(eraVars, 'player.bonds', {});
          const hasBond = playerBonds[addon.unlock_key] === true;
          
          if (!hasBond) {
            // 未获得羁绊道具，触发解锁事件（不升级 stage）
            console.log(`${PLUGIN_NAME} [UNLOCK] 🎁 ${npcId} 好感度已满，触发羁绊道具解锁事件: ${addon.unlock_key}`);
            
            // 记录待触发的解锁事件（带好感度用于排序）
            if (!window._pendingUnlockEvents) {
              window._pendingUnlockEvents = [];
            }
            window._pendingUnlockEvents.push({
              npcId: npcId,
              npcName: addon.name_cn,
              unlockKey: addon.unlock_key,
              unlockItem: addon.unlock_item,
              love: effectiveLove // 用于排序
            });
          } else {
            // 已获得羁绊道具，但仍然不自动升级，等待 AI 显式填入 stage: 4
            console.log(`${PLUGIN_NAME} [NPC] ${npcId}: 已获得羁绊道具 ${addon.unlock_key}，好感度已达标，等待 AI 升级到 Stage 4`);
          }
        }
      }
      
      // === 3. 更新快照 ===
      window._npcStateSnapshot[npcId] = {
        stage: updateData[`pkm.world_state.npcs.${npcId}.stage`] !== undefined 
          ? updateData[`pkm.world_state.npcs.${npcId}.stage`] 
          : currentStage,
        love: updateData[`pkm.world_state.npcs.${npcId}.love`] !== undefined
          ? updateData[`pkm.world_state.npcs.${npcId}.love`]
          : currentLove
      };
    }
    
    // === 4. 应用更新 ===
    if (Object.keys(updateData).length > 0) {
      try {
        await updateEraVars(updateData);
        console.log(`${PLUGIN_NAME} [NPC] ✓ 已处理 love_up 并更新到 ERA`);
        
        if (rollbackWarnings.length > 0) {
          console.warn(`${PLUGIN_NAME} [NPC] ⚠️ 拦截了 ${rollbackWarnings.length} 个非法阶段变更:`);
          rollbackWarnings.forEach(w => console.warn(`  - ${w}`));
        }
      } catch (e) {
        console.warn(`${PLUGIN_NAME} [NPC] 更新 love_up 失败:`, e);
      }
    }
    
    // === 5. 处理待触发的解锁事件 ===
    await processUnlockEvents();
  }

  /**
   * 生成解锁事件注入提示
   * 当 NPC 从 Stage 3 升级到 Stage 4 时，触发羁绊遗物赠送事件
   */
  function generateUnlockEventPrompt(event) {
    const { npcId, npcName, unlockKey, unlockItem } = event;
    
    return `<pkm_unlock_event>
═══════════════════════════════════════════════════════════════
🎁 【羁绊遗物获得事件】 —— ${npcName} 的誓约之证
═══════════════════════════════════════════════════════════════

${unlockItem.emoji} ${unlockItem.name_cn} (${unlockItem.name_en})

📜 物品描述:
${unlockItem.desc}

💬 ${npcName}的话语:
"${unlockItem.dialogue}"

⚡ 系统效果:
${unlockItem.effect}

═══════════════════════════════════════════════════════════════
[系统指令] 请在本次回复中演绎 ${npcName} 将这件遗物交给玩家的场景。
演绎完成后，请在 <VariableEdit> 中【同时】完成以下三项更新：
1. 玩家羁绊状态 → bonds."${unlockKey}": true（特殊羁绊道具）
2. 玩家解锁状态 → unlocks."${unlockKey}": true（战斗能力）
3. 该 NPC 的阶段 → "stage": 4（保持 love 不变，仅确认阶段升级）

<VariableEdit>
{
  "world_state": {
    "npcs": {
      "${npcId}": {
        "stage": 4
      }
    }
  },
  "player": {
    "bonds": {
      "${unlockKey}": true
    },
    "unlocks": {
      "${unlockKey}": true
    }
  }
}
</VariableEdit>
═══════════════════════════════════════════════════════════════
</pkm_unlock_event>`;
  }

  /**
   * 处理待触发的解锁事件
   * 按好感度排序，每次只处理一个事件，其余保留到下次
   */
  async function processUnlockEvents() {
    if (!window._pendingUnlockEvents || window._pendingUnlockEvents.length === 0) {
      return;
    }
    
    // 按好感度从高到低排序
    window._pendingUnlockEvents.sort((a, b) => (b.love || 0) - (a.love || 0));
    
    // 只取第一个（好感度最高的）
    const event = window._pendingUnlockEvents.shift();
    
    console.log(`${PLUGIN_NAME} [UNLOCK] 处理解锁事件: ${event.npcName} (love: ${event.love})`);
    if (window._pendingUnlockEvents.length > 0) {
      console.log(`${PLUGIN_NAME} [UNLOCK] 剩余 ${window._pendingUnlockEvents.length} 个事件等待下次处理`);
    }
    
    // 生成解锁事件的注入提示
    const prompt = generateUnlockEventPrompt(event);
    
    // 注入到角色栏（使用 injectPrompts API）
    try {
      const injectionId = 'pkm_unlock_events';
      // 先清除旧注入
      try {
        uninjectPrompts([injectionId]);
      } catch (e) {
        // 忽略
      }
      
      // 注入新内容
      injectPrompts([{
        id: injectionId,
        position: 'in_chat',
        depth: 0, // 在最近的消息之后
        role: 'system',
        should_scan: false,
        content: prompt
      }]);
      
      console.log(`${PLUGIN_NAME} [UNLOCK] ✓ 已注入解锁事件提示: ${event.npcName}`);
      
      // 设置标记，在下次生成后清除注入
      window._unlockEventInjected = true;
    } catch (e) {
      console.error(`${PLUGIN_NAME} [UNLOCK] 注入失败:`, e);
    }
  }

  /**
   * 清除已处理的解锁事件注入
   */
  async function clearUnlockEventInjection() {
    if (window._unlockEventInjected) {
      try {
        uninjectPrompts(['pkm_unlock_events']);
        window._unlockEventInjected = false;
        console.log(`${PLUGIN_NAME} [UNLOCK] ✓ 已清除解锁事件注入`);
      } catch (e) {
        // 忽略清除失败
      }
    }
  }

  // ============================================
  //    初始化 & 事件绑定
  // ============================================

  // 等待酒馆助手API可用
  let retries = 0;
  while (typeof eventEmit === 'undefined' && retries < 30) {
    await wait(100);
    retries++;
  }

  if (typeof eventEmit === 'undefined') {
    console.error(`${PLUGIN_NAME} 酒馆助手API不可用，插件无法启动`);
    return;
  }

  // 监听事件
  eventOn('CHAT_CHANGED', () => resetState('切换对话'));
  eventOn('tavern_events.MESSAGE_SWIPED', () => resetState('消息重骰'));
  eventOn('tavern_events.MESSAGE_EDITED', () => resetState('消息编辑'));

  // 监听生成前事件 - 注入玩家队伍数据到上下文 + NPC 状态 + 时间状态
  eventOn('GENERATION_AFTER_COMMANDS', async (detail) => {
    // 0. 清除上次的解锁事件注入（如果有）
    await clearUnlockEventInjection();
    
    // 1. 处理玩家队伍数据
    await handleGenerationBeforeInject(detail);
    
    // 2. 处理 NPC love_up 累加（会触发新的解锁事件）
    await processNpcLoveUp();
    
    // 3. 处理时间推进（day_advance / period_set）
    await processTimeAdvance();
    
    // 4. 动态注入活跃 NPC 状态
    await handleDynamicNpcInject();
    
    // 5. 注入时间状态
    await handleTimeInject();
  });

  // 监听 era:writeDone 事件 - 处理AI输出的战斗标签
  eventOn('era:writeDone', async (detail) => {
    await handleWriteDone(detail);
  });

  // 暴露全局接口供外部调用
  window.PKMPlugin = {
    // 获取玩家队伍
    getPlayerParty,
    
    // 设置玩家队伍
    // mode: 'full' | 'single' | 'custom'
    // input: 宝可梦名称(single) 或 队伍数组(custom)
    setPlayerParty,
    
    // 【防呆】手动修复被 AI 设为 null 的槽位
    async repairPartySlots() {
      const playerData = await getPlayerParty();
      if (!playerData || !playerData.party) {
        console.log(`${PLUGIN_NAME} [防呆] 没有找到队伍数据`);
        return { repaired: false, repairedSlots: [] };
      }
      return repairNullSlots(playerData.party, true);
    },
    
    // 手动添加宝可梦到队伍
    async addToParty(pokemon) {
      const playerData = await getPlayerParty() || { name: '训练家', party: [], reserve: [] };
      const newParty = [...playerData.party, pokemon];
      return setPlayerParty('custom', newParty);
    },
    
    // 手动添加宝可梦到备用库
    async addToReserve(pokemon) {
      const eraVars = await getEraVars();
      const playerData = getEraValue(eraVars, 'player', { name: '训练家', party: [], reserve: [] });
      const newReserve = [...(playerData.reserve || []), pokemon];
      
      updateEraVars({
        player: {
          ...playerData,
          reserve: newReserve
        }
      });
      
      console.log(`${PLUGIN_NAME} ✓ 宝可梦已添加到备用库:`, pokemon);
      return newReserve;
    },
    
    // 设置玩家名称
    async setPlayerName(name) {
      const eraVars = await getEraVars();
      const playerData = getEraValue(eraVars, 'player', { name: '训练家', party: [], reserve: [] });
      
      updateEraVars({
        player: {
          ...playerData,
          name: name
        }
      });
      
      console.log(`${PLUGIN_NAME} ✓ 玩家名称已设置为: ${name}`);
    },
    
    // 手动触发战斗（用于测试）
    async triggerBattle(aiBattleData) {
      const completeBattle = await buildCompleteBattleJson(aiBattleData);
      
      // 创建一个新消息，包含占位符供酒馆正则替换
      const frontendPayload = `<PKM_FRONTEND>\n${JSON.stringify(completeBattle)}\n</PKM_FRONTEND>`;
      await createChatMessages([{
        role: 'assistant',
        message: frontendPayload
      }]);
      
      return completeBattle;
    },
    
    // ========== 时间系统 API ==========
    
    // 获取当前时间状态
    async getTime() {
      const eraVars = await getEraVars();
      const timeState = getEraValue(eraVars, 'world_state.time', { day: 1, period: 'morning' });
      const derived = calculateDerivedTime(timeState.day || 1);
      const periodInfo = getPeriodInfo(timeState.period || 'morning');
      
      return {
        day: timeState.day || 1,
        period: timeState.period || 'morning',
        periodLabel: periodInfo.label,
        periodEmoji: periodInfo.emoji,
        ...derived
      };
    },
    
    // 设置时间（直接设置）
    async setTime(day, period = 'morning') {
      if (typeof day !== 'number' || day < 1) {
        console.error(`${PLUGIN_NAME} [TIME] 无效的天数: ${day}`);
        return null;
      }
      
      const validPeriod = TIME_PERIODS[period] ? period : 'morning';
      const derived = calculateDerivedTime(day);
      
      await updateEraVars({
        'world_state.time': {
          day: day,
          period: validPeriod,
          day_advance: null,
          period_set: null,
          derived: derived
        }
      });
      
      console.log(`${PLUGIN_NAME} [TIME] ✓ 时间已设置: DAY ${day} · ${getPeriodInfo(validPeriod).label}`);
      return { day, period: validPeriod, ...derived };
    },
    
    // 推进时间（使用自然语言）
    async advanceTime(instruction) {
      const eraVars = await getEraVars();
      const timeState = getEraValue(eraVars, 'world_state.time', { day: 1, period: 'morning' });
      
      const advance = parseTimeAdvance(instruction);
      if (!advance) {
        console.error(`${PLUGIN_NAME} [TIME] 无法解析时间指令: ${instruction}`);
        return null;
      }
      
      const result = advanceTime(timeState, advance);
      const derived = calculateDerivedTime(result.day);
      
      await updateEraVars({
        'world_state.time.day': result.day,
        'world_state.time.period': result.period,
        'world_state.time.derived': derived
      });
      
      console.log(`${PLUGIN_NAME} [TIME] ✓ 时间推进: DAY ${timeState.day} → DAY ${result.day}, ${timeState.period} → ${result.period}`);
      return { day: result.day, period: result.period, crossedDays: result.crossedDays, ...derived };
    },
    
    // 获取时间系统常量
    getTimePeriods() {
      return { ...TIME_PERIODS };
    },
    
    // 获取当前版本
    version: '1.1.0'
  };

  // ============================================
  //    ERA 变量更新拦截器（ev_up 自动累加到 ev_level）
  // ============================================
  
  /**
   * 拦截并预处理 ERA 变量更新，处理 ev_up 增量
   * @param {object} updateData - 要更新的数据对象
   * @returns {Promise<object>} - 处理后的数据对象
   */
  async function preprocessEraUpdate(updateData) {
    if (!updateData || typeof updateData !== 'object') return updateData;
    
    // 【防呆】拦截扁平键路径中的 null slot 值
    // 例如: { "player.party.slot3": null } 或 { "pkm.player.party.slot3": null }
    // VariableEdit 是「只改不增」，如果 AI 试图把 slot 改成 null，直接从 edit 数据中移除该键
    // 这样 ERA 中原有的 slot 数据不会被破坏
    for (const key of Object.keys(updateData)) {
      const slotMatch = key.match(/(?:pkm\.)?player\.party\.(slot(\d+))$/);
      if (slotMatch && (updateData[key] === null || updateData[key] === undefined)) {
        console.warn(`${PLUGIN_NAME} [防呆·拦截] 阻止 VariableEdit 将 ${slotMatch[1]} 设为 null，已从更新数据中移除`);
        delete updateData[key];
      }
    }
    
    // 获取当前 ERA 变量
    const currentVars = await getEraVars();
    
    // 递归处理嵌套对象
    function processObject(obj, path = '') {
      if (!obj || typeof obj !== 'object') return obj;
      
      // === 处理 proficiency_up：累加到 trainerProficiency ===
      // 检查是否是 player 的更新且包含 proficiency_up
      if (path === 'player' || path === 'pkm.player' || path.endsWith('.player')) {
        const proficiencyUp = obj.proficiency_up;
        if (proficiencyUp !== undefined && proficiencyUp !== null && typeof proficiencyUp === 'number' && proficiencyUp !== 0) {
          const currentProficiency = getEraValue(currentVars, 'player.trainerProficiency', 0);
          const newProficiency = Math.max(0, Math.min(255, currentProficiency + proficiencyUp));
          
          console.log(`${PLUGIN_NAME} [PROFICIENCY] 当前: ${currentProficiency}, +${proficiencyUp} = ${newProficiency}`);
          
          // 更新 trainerProficiency
          obj.trainerProficiency = newProficiency;
          
          // 重置 proficiency_up 为 0
          obj.proficiency_up = 0;
        }
      }
      
      // === 【防呆】拦截 AI 将 slot 设为 null 的操作 ===
      // 当 path 是 player.party 或 pkm.player.party 时，检查所有 slotX 键
      // VariableEdit 是「只改不增」，直接从 edit 数据中移除 null 的 slot 键，保护 ERA 中的原数据
      if (path === 'player.party' || path === 'pkm.player.party' || path.endsWith('.party')) {
        for (const slotKey of Object.keys(obj)) {
          if (/^slot\d+$/.test(slotKey) && (obj[slotKey] === null || obj[slotKey] === undefined)) {
            console.warn(`${PLUGIN_NAME} [防呆·拦截] 阻止 VariableEdit 将 ${slotKey} 设为 null，已从更新数据中移除`);
            delete obj[slotKey];
          }
        }
      }
      
      // === 处理 ev_up：累加到 ev_level ===
      // 检查是否是 party 的槽位更新（player.party.slotX 或 pkm.player.party.slotX）
      if ((path.includes('player.party.slot') || path.includes('pkm.player.party.slot')) && obj.stats_meta && typeof obj.stats_meta === 'object') {
        // 提取槽位键名 (slot1, slot2, ...)
        const slotMatch = path.match(/slot\d+/);
        if (slotMatch) {
          const slotKey = slotMatch[0];
          const evUp = obj.stats_meta.ev_up;
          
          // 如果有 ev_up 且大于 0，累加到 ev_level
          if (evUp !== undefined && evUp !== null && typeof evUp === 'number' && evUp > 0) {
            const currentEvLevel = getEraValue(currentVars, `player.party.${slotKey}.stats_meta.ev_level`, 0);
            const newEvLevel = currentEvLevel + evUp;
            
            console.log(`${PLUGIN_NAME} [EV_UP] 槽位: ${slotKey}, 当前 ev_level: ${currentEvLevel}, ev_up: ${evUp}, 新 ev_level: ${newEvLevel}`);
            
            // 更新 ev_level
            obj.stats_meta.ev_level = newEvLevel;
            
            // 重置 ev_up 为 0（保留字段，但清零以便下次累加）
            obj.stats_meta.ev_up = 0;
          }
        }
      }
      
      // 递归处理子对象
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const newPath = path ? `${path}.${key}` : key;
          processObject(value, newPath);
        }
      }
      
      return obj;
    }
    
    return processObject(updateData);
  }
  
  // 拦截 ERA 事件（updateByObject / deleteByObject）
  const originalEventEmit = window.eventEmit;
  if (originalEventEmit) {
    window.eventEmit = function(eventName, data) {
      if (eventName === 'era:updateByObject' && data) {
        console.log(`${PLUGIN_NAME} [拦截] 检测到 ERA 变量更新事件`);
        
        // 异步预处理（需要读取当前 ERA 变量）
        preprocessEraUpdate(data).then(processedData => {
          originalEventEmit.call(window, eventName, processedData);
        });
      } else if (eventName === 'era:deleteByObject' && data) {
        // 【防呆】拦截 VariableDelete，阻止删除 party slot 节点
        // VariableDelete 格式: { player: { party: { slot3: {} } } } 表示删除 slot3
        const guardedData = guardDeleteSlots(data);
        originalEventEmit.call(window, eventName, guardedData);
      } else {
        // 其他事件直接透传
        originalEventEmit.apply(window, arguments);
      }
    };
    console.log(`${PLUGIN_NAME} ✓ ERA 变量拦截器已安装（防呆 + ev_up/proficiency_up 自动累加）`);
  }

  /**
   * 【防呆】拦截 VariableDelete 中对 party slot 的删除操作
   * 阻止 AI 删除 slot1-slot6 节点（这些节点必须始终存在）
   * @param {object} data - VariableDelete 数据
   * @returns {object} - 过滤后的数据
   */
  function guardDeleteSlots(data) {
    if (!data || typeof data !== 'object') return data;
    
    // 如果是防呆修复操作自身触发的删除，放行
    if (_repairBypass) return data;
    
    // 检查嵌套路径: { player: { party: { slotX: {} } } }
    const partyPaths = [
      data?.player?.party,
      data?.pkm?.player?.party
    ];
    
    for (const partyObj of partyPaths) {
      if (partyObj && typeof partyObj === 'object') {
        for (const key of Object.keys(partyObj)) {
          if (/^slot\d+$/.test(key)) {
            console.warn(`${PLUGIN_NAME} [防呆·拦截] 阻止 VariableDelete 删除 ${key}，队伍槽位不可删除`);
            delete partyObj[key];
          }
        }
      }
    }
    
    return data;
  }

  console.log(`${PLUGIN_NAME} ✓✓✓ 插件加载完成 (v1.1.0) ✓✓✓`);
  console.log(`${PLUGIN_NAME} 可用接口: window.PKMPlugin`);
  console.log(`${PLUGIN_NAME} [队伍] getPlayerParty() / setPlayerParty(mode, input) / addToParty(pokemon)`);
  console.log(`${PLUGIN_NAME} [时间] getTime() / setTime(day, period) / advanceTime(instruction)`);
  console.log(`${PLUGIN_NAME} [战斗] triggerBattle(data)`);
  console.log(`${PLUGIN_NAME} [时间系统] DAY X 格式，时段: dawn/morning/noon/afternoon/evening/night/midnight`);

})();
