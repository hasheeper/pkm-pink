window.SPAWN_TABLES_DATA = {
"Aether_Admin_Zone": {
    "Standard_Grass": { 
        "common": [ 
            "minccino", "glameow", "skitty", "lillipup", "pidove", "zigzagoon", 
            "bidoof", "wooloo", "patrat", "yungoos", "bouffalant"
        ],

        "uncommon": [
            "shinx", "marill", "plusle", "minun", "buneary", "purrloin", 
            "nidoranf", "nidoranm", "stufful", "furfrou",
            
            // 初级进化型限制 (防止 Lv.5 出现第一阶进化)
            { "id": "herdier", "min": 16 }, // 哈约克
            { "id": "tranquill", "min": 21 } // 咕咕鸽
        ],

        "rare": [
            "abra", "ralts", "porygon", "castform", "eevee", "rotom", 
            "magnemite", "klink", "ditto", 
            // 稀有种等级限制
            { "id": "type:null", "min": 40 } // 如果新手真的在 Z 区 roll 到了这个，那是 Lv.40 的，无法捕捉，只能跑
        ],

        "boss": [
            // Boss 总是会有“最低出厂等级”
            { "id": "absol", "min": 35 },     // 哪怕 Z 区平均 Lv.10, 出来的 Absol 就是 Lv.35
            { "id": "luxio", "min": 30 },     // 勒克猫更高点
            { "id": "stoutland", "min": 45 }, // 面板怪物
            { "id": "ambipom", "min": 32 }    // 双尾怪手
        ]
    },
    /* 
       Terrain: Flower_Field 
       Flavor: "Manicured, Aromatic, Therapeutic"
    */
    "Flower_Field": {
        "common": [
            // 传粉者 / 基础花卉 / 萌宠
            "flabebe",       // 花蓓蓓：各种颜色，庭院基石
            "floette",       // 花叶蒂
            "cutiefly",      // 萌虻：阿罗拉特产，非常符合医疗花园设定
            "comfey",        // 花疗环环：随处可见的治愈光环
            "petilil",       // 百合根娃娃：优雅的球根
            "oddish",        // 走路草：经典的杂草，但也可爱
            "budew",         // 含羞苞：没进化前也是好看的
            "sunkern",       // 向日种子
            "hoppip",        // 毽子草：不仅在花从，也会飘在天上
            "skitty"         // (复用) 优雅猫退化，在花里玩球是很合理的
        ],

        "uncommon": [
            // 更具观赏性 / 需要特定花蜜
            "ribombee",      // 蝶结萌虻：更高级的采蜜者
            "roselia",       // 毒蔷薇：带刺的美
            "swablu",        // 青绵鸟：像棉花糖一样停在花上
            "maractus",      // 街头沙铃：可能是进口观赏植物跑出来了
            "fomantis",      // 伪螳草：伪装成花的高级猎手（B区入侵物种）
            "bounsweet",     // 甜竹竹：太香了，要防止被吃掉
            "gossifleur",    // 幼棉棉
            "snubbull",      // 布鲁：这里的保安犬，虽然脸凶但其实是妖精系(可爱)
            "milcery"        // 小仙奶：是甜点还是生物？
        ],

        "rare": [
            // 真正的“大小姐” / 科研结晶
            "clefairy",      // 皮皮：月光研究对象
            "togepi",        // 波克基斯退化：幸运象征
            "cherrim",       // 樱花儿：依赖强光（Z区人工日照）
            "chansey",       // 吉利蛋：真正的护士，逃出来的
            "audino",        // 差不多娃娃：合众的护士，也是治愈担当
            "hatenna",       // 迷布莉姆：感知情绪，如果不快乐会被赶走
            { "id": "sylveon", "min": 25 } // 仙子伊布：及其罕见，进化的奇迹
        ],

        "boss": [
            // 花园领主 / 皇室护卫
            // 如果你等级低，看到它们就是在欣赏风景；如果你想破坏花草，死。
            { "id": "gardevoir", "min": 35 },     // 沙奈朵：守护神
            { "id": "lilligant", "min": 30 },     // 裙儿小姐：优雅舞者
            { "id": "bellossom", "min": 30 },     // 美丽花
            { "id": "roserade", "min": 35 },      // 罗丝雷朵：假面骑士风格高压护卫
            { "id": "florges", "min": 40 },       // 花洁夫人：花海真正的女王
            { "id": "tsareena", "min": 38 },      // 甜冷美后：露莎米奈风格的不仅美丽而且可以踩死你的女王
            { "id": "togekiss", "min": 45 }       // 空中的恩惠（轰炸机）
        ]
    }
},
/* Zone: Sapphire_Strand (Zone B South-West Coast) */
/* Theme: Tropical / Vacation / Water-Ground Type / Slow Life */
"Sapphire_Strand": {

    // === 1. 金色辉煌的度假村海滩 (Coastal Sand) ===
    // 主要是螃蟹、玩沙子的小生物、海鸟、伪装成沙堡的鬼魂
    "Coastal_Sand": {
        "common": [
            "wingull",       // 长翅鸥：海滨标配BGM
            "krabby",        // 大钳蟹
            "sandygast",     // 沙丘娃：不仅是玩沙子，还会吞噬生气（小心）
            "crabrawler",    // 好胜蟹：会抢椰子吃
            "binacle",       // 龟脚脚
            "shellos",       // 无壳海兔（蓝）：对应“西方海域”配色
            "slowpoke",      // 呆呆兽：在沙滩上睡大觉，没人会去惹它
            "sandshrew"      // 穿山鼠（虽然是地面系，但在干燥沙滩也常见）
        ],

        "uncommon": [
            "wimpod",        // 胆小虫：一靠近就跑得飞快
            "dwebble",       // 石居蟹
            "clamperl",      // 珍珠贝：和珍珠镇呼应
            "staryu",        // 海星星
            "shellder",      // 许多
            "mareanie",      // 刺坏星：专吃太阳珊瑚的恶霸
            "cursola"        // 太阳珊瑚(伽勒尔)：被咬死后的样子... (稀有，有点恐怖) -> 改为普通太阳珊瑚"corsola"如果不想要悲剧风
        ],
        // 如果想要普通的太阳珊瑚： "corsola"
        
        "rare": [
            "pelipper",      // 大嘴鸥
            "clauncher",     // 铁臂枪虾
            "pincurchin",    // 啪嚓海胆：小心扎脚
            "pyukumuku"      // 拳海参：游客不仅不讨厌，还会有丢海参大赛
        ],

        "boss": [
            { "id": "palossand", "min": 35 },   // 噬沙堡爷：巨大的沙堡
            { "id": "kingler", "min": 32 },     // 巨钳蟹
            { "id": "slowbro", "min": 30 },     // 呆壳兽
            { "id": "clawitzer", "min": 38 },   // 钢炮臂虾
            { "id": "toxapex", "min": 35 }      // 超坏星：剧毒堡垒
        ]
    },


    // === 2. 珍珠镇的石板路商业街 (Pavement) ===
    // 主要是流浪猫狗、贪吃的鸟、甚至是帮忙搬运的怪力系
    "Pavement": {
        "common": [
            "meowth",         // 喵喵 (阿罗拉样子)：这里产这个，虽然有点像Z区但也合理
            "alolan_rattata", // 小拉达 (阿罗拉)
            "pidove",         // 豆豆鸽：哪有广场哪有我
            "magnemite",      // 小磁怪：依附在店铺电箱
            "pikipek",        // 小笃儿
            "rockruff"        // 岩狗狗：很适合这个人地互动多的地方
        ],

        "uncommon": [
            "machop",         // 腕力：帮酒店搬行李/修路
            "furfrou",        // 多丽米亚：被精心梳理过的游客狗
            "sylveon",        // (复用Z区？No) 改为 "snubbull" 布鲁：其实挺温顺
            "trubbish",       // 破破袋：游客产生的垃圾引来了它们
            "grimer_alola"    // 臭泥（阿罗拉）：吃垃圾而且颜色鲜艳，不怎么臭
        ],
        
        "rare": [
            "mrmime",         // 魔墙人偶：在此为游客表演哑剧
            "smeargle",       // 图图犬：在这里写生的画家
            "ditto"           // 百变怪：拟态成了垃圾桶？
        ],

        "boss": [
            { "id": "machoke", "min": 28 },   // 豪力
            { "id": "granbull", "min": 30 },  // 布鲁皇
            { "id": "muk_alola", "min": 38 }, // 臭臭泥（阿罗拉）：五颜六色的大家伙
            { "id": "conkeldurr", "min": 45 } // 修建老匠：工地包工头
        ]
    },


    // === 3. 酒店背后的热带绿化带 (Standard_Grass) ===
    // 虽然是 Standard_Grass，但位于 BIOME_B，所以出的东西偏向“热带/雨林/海岛”风，而不是普通家门鸟
    "Standard_Grass": {
        "common": [
            "oddish",         // 走路草
            "bellsprout",     // 喇叭芽
            "exeggcute",      // 蛋蛋
            "yungoos",        // 猫鼬少：在这抓老鼠
            "fomantis",       // 伪螳草：白天蹭一点光合作用
            "bounsweet",      // 甜竹竹
             "surskit"        // 溜溜糖球：如果有积水在草丛里
        ],
        
        "uncommon": [
            "tropius",        // 热带龙：虽大但它是食草的，很温和
            "comfey",         // 花疗环环
            "gloom",          // 臭臭花：有点味道但还能接受
            "scyther",        // 飞天螳螂：除虫能手
            "heracross"       // 赫拉克罗斯：喜欢吸树汁
        ],

        "rare": [
             "bulbasaur",     // 妙蛙种子：(御三家作为稀有发现!)
             "chikorita",     // 菊草叶
             "pinsir",        // 凯罗斯
             "oranguru"       // 智挥猩：在树林边缘思考人生
        ],

        "boss": [
            { "id": "exeggutor_alola", "min": 35 }, // 椰蛋树（阿罗拉）：脖子太长了露出来了
            { "id": "venusaur", "min": 45 },        // 妙蛙花 (霸主)
            { "id": "tsareena", "min": 38 }         // 甜冷美后 (复用花田 Boss，但在B区更野生一点)
        ]
    }
},
/* Zone: Aroma_Meadow / Sunflora_Farmsteads */
/* Theme: Agriculture / Farming / Floral High-Yield / Pastoral */
"Aroma_Meadow": {

    // === 1. 繁忙的农机过道与仓库装卸区 (Pavement) ===
    // 宝可梦：搬运工、卡车司机、想偷吃水果的老鼠
    "Pavement": {
        "common": [
            "meowth",         // 喵喵(普通): 经典农场猫，抓老鼠的
            "rattata",        // 小拉达
            "honchkrow",      // 黑暗鸦：如果这里是仓库区，它们会成群结队
            "watchog",        // 步哨鼠：盯梢货物的
            "machop",         // 腕力：还是腕力好用!
            "timburr"         // 搬运小匠：建筑/修补农舍
        ],
        "uncommon": [
            "growlithe",      // 卡蒂狗：看守农场
            "herdier",        // 哈约克：比一般小狗更靠谱的牧羊犬
            "glameow",        // 魅力喵
            "persian"         // 猫老大
        ],
        "rare": [
            "rotom",          // 洛托姆(割草机)：Rotom-Mow形态乱入! "rotom-mow"
            "porygon"         // 物流无人机系统AI判定实体?
        ],
        "boss": [
            { "id": "conkeldurr", "min": 40 }, // 修建老匠
            { "id": "machamp", "min": 40 }     // 怪力 (四只手搬更快)
        ]
    },


    // === 2. 牧草地 / 放牧区 (Standard_Grass & Synthetic_Turf) ===
    // 宝可梦：家畜（牛羊马猪）、牧羊犬
    "Standard_Grass": {
        "common": [
            "wooloo",         // 毛辫羊：农场招牌
            "mareep",         // 咩利羊
            "miltank",        // 大奶罐：重要产奶来源
            "tauros",         // 肯泰罗 (普通)：在这里充当公牛
            "mudbray",        // 泥驴仔
            "ponyta",         // 小火马(普通)：农场马
            "bunnelby",       // 掘掘兔
            "sentret"         // 尾立
        ],
        "uncommon": [
            "flaaffy",        // 茸北北
            "dubwool",        // 毛毛角羊
            "blitzle",        // 斑斑马
            "spoink",         // 跳跳猪
            "lechonk",        // 爱吃豚 (Paldea的新猪)
            "lillipup"        // 牧羊犬
        ],
        "rare": [
            "tauros_paldea",  // 帕底亚肯泰罗(斗牛种): 这只有点凶
            "ponyta_galar",   // 小火马(伽勒尔): 彩虹小马，稀有观赏种
            "skiddo"          // 小骑山羊
        ],
        "boss": [
            { "id": "ampharos", "min": 35 },   // 电龙：灯塔级亮度
            { "id": "mudsdale", "min": 35 },   // 重泥挽马：重型挽马
            { "id": "stoutland", "min": 38 },  // 长毛狗：牧羊的老长辈
            { "id": "rapidash", "min": 40 }    // 烈焰马
        ]
    },
    // Syntheic_Turf (如果有铺设的假区域) 直接复用 Standard_Grass 即可


    // === 3. 高密度经济作物区 (High_Grass) ===
    // 宝可梦：这比普通草里更密，主要是藏在里面的、或是把自己伪装成庄稼的
    "High_Grass": {
        "common": [
            "sunkern",        // 向日种子：满地都是
            "paras",          // 派拉斯特
            "burmy",          // 结草儿(草木蓑衣)
            "sewaddle",       // 虫宝包
            "weedle",         // 独角虫
            "caterpie",       // 绿毛虫
            "kricketot",      // 圆法师：晚上叫得很大声
            "nincada"         // 土居忍士
        ],
        "uncommon": [
            "sunflora",       // 向日花怪：有时候你分不清它是花还是怪/伪装
            "leavanny",       // 保姆虫
            "venonat",        // 毛球
            "gloomy"          // 臭臭花：堆肥区附近?
        ],
        "rare": [
            "karrablast",     // 盖盖虫：专门吃蜗牛的
            "shelmet",        // 小嘴蜗：专门被虫吃的
            "applin",         // 啃果虫：混在也是苹果园里
            "flapple"         // 苹裹龙
        ],
        "boss": [
            { "id": "meganium", "min": 45 },  // 大竺葵：(御三家彩蛋!) 草系的古老守护者
            { "id": "scyther", "min": 30 },   // 飞天螳螂：收割者
            { "id": "yanmega", "min": 38 }    // 远古巨廷：像直升机一样的巨大蜻蜓
        ]
    },


    /* Revision: Aroma_Meadow - Wet_Soil (Fixed Priority) */
    "Wet_Soil": { /* 语义：肥沃的耕地与灌溉沟渠 */

        "common": [ // 路边野狗组 (真的应该遍地都是的)
            "diglett",        // 地鼠：农药杀不完的
            "wooper_paldea",  // 乌波(帕底亚)：在肥料堆里钻来钻去
            "shellos",        // 无壳海兔：可能是被水渠冲过来了
            "barboach",       // 泥泥鳅
            "poliwag",        // 蚊香蝌蚪：如果你在水沟边
            "tympole",        // 圆蝌蚪
            "krabby"          // 大钳蟹：淡水蟹种?
        ],
        
        "uncommon": [ // 稍微高级点的农害
            "drilbur",        // 螺钉地鼠：这玩意打洞很快
            "corphish",       // 龙虾小兵：入侵物种
            "oddish",         // 走路草
            "paras",          // 派拉斯特
            "golett",         // 泥偶小人：帮农民搬砖的古代遗产
            "sandile"         // 黑眼鳄：埋在深土里晒背
        ],

        "rare": [ // 稀有/彩蛋/精英 (这才是御三家该去的地方!)
            "mudkip",         // 水跃鱼：只有在特定的雨天或者极好的运气下在灌溉总闸才能捞到一只
            "goomy",          // 黏黏宝
            "stunfisk",       // 泥巴鱼 (伽勒尔? 普通): 踩上去也是惊喜
            "trapinch"        // 大颚蚁
        ],

        "boss": [
            // Boss不一定是水跃鱼全家桶了，换成本地恶霸
            { "id": "dugtrio", "min": 26 },     // 三地鼠：田地破坏神
            { "id": "seusmitoad", "min": 36 },  // 蟾蜍王：嗓门很大震死你
            { "id": "whiscash", "min": 35 },    // 鲶鱼王：可能吞掉了农民的结婚戒指
            { "id": "crawdaunt", "min": 32 },   // 铁螯龙虾
            { "id": "swampert", "min": 45 }     // 巨沼怪：作为超级稀有的霸主，如果你真的在Rare那一栏运气好进化了 或者高威胁度暴走
        ]
    },



    // === 5. 高级观赏花圃/香氛区 (Flower_Field) ===
    // 相比Z区的“无菌”，这里更野性、香气浓郁（甚至有毒香）
    "Flower_Field": {
        "common": [
            "combee",         // 三蜜蜂：这里有庞大的采蜜作业
            "ribombee",       // 蝶结萌虻
            "ledyba",         // 芭瓢虫
            "spinarak",       // 圆丝蛛：织网
            "roselia",        // 毒蔷薇
            "happiny",        // 小福蛋
            "spritzee"        // 粉香香
        ],

        "uncommon": [
            "vespiquen",      // 蜂女王：如果不带这个，三蜜蜂就不可怕了
            "vileplume",      // 霸王花：在角落里释放花粉
            "bellossom",      // 美丽花：晴天跳舞
            "swirlix",        // 绵绵泡芙：闻起来像棉花糖
            "cherrim"         // 樱花儿
        ],

        "rare": [
            "heracross",      // 赫拉克罗斯：会为了吸蜜打架
            "pinsir",         // 凯罗斯：打架对象
            "florges",        // 花洁夫人 (橙色/白色花，野外种)
            "zarude",          // 萨戮德?? (幻兽太夸张了，去掉)，哪怕是彩蛋
            "shaymin"         // 谢米 (如果是极低概率那太棒了) - 留作彩蛋
        ],

        "boss": [
            { "id": "vespiquen", "min": 35 },   // 必然的领袖，控制 Common 里的三蜜蜂群殴玩家
            { "id": "lurantis", "min": 35 },    // 兰螳花 (霸主种)：不仅仅好看，而且能打
            { "id": "aromatisse", "min": 32 }   // 芳香精
        ]
    }
},
/* Zone: Jade_Canopy (The Primal Jungle) */
/* Threat Range: Safe -> Mid (Lv 0-3) */

"Jade_Canopy": {

    // === 1. 被藤蔓吞噬的古代栈道/小据点 (Pavement) ===
    // 那些小据点的废墟，或者仍在运作的微型检测站
    // 住客：主要是那些即便有人类设施也不怕人的、或者把设施当巢穴的
    "Pavement": {
        "common": [
            "aipom",          // 长尾怪手：在废弃栏杆上跳来跳去
            "mankey",         // 猴怪：脾气暴躁，可能会抢你在据点放的泡面
            "slakoth",        // 懒人獭：趴在路中间睡觉
            "rattata_alola",  // 小拉达
            "spinarak",       // 圆丝蛛：在屋檐下结网
            "joltik"          // 电电虫：吸据点电箱的电
        ],
        "uncommon": [
            "steenee",        // 甜舞妮
            "nuzleaf",        // 长鼻叶：喜欢这种混合地形
            "passimian",      // 投掷猴 (从树上跳下来)
            "oranguru"        // 智挥猩 (在废墟看书?)
        ],
        "rare": [
            "kecleon",        // 变隐龙：你以为是路障，其实是它
            "ditto",          // 百变怪
            "porygon"         // 残留数据
        ],
        "boss": [
            { "id": "shiftry", "min": 35 },   // 狡猾天狗
            { "id": "ambipom", "min": 32 }    // 双尾怪手
        ]
    },


    /* Revision: Jade_Canopy - Standard_Grass (Expanded Ecology) */
    "Standard_Grass": {
        
        "common": [
            // 第一梯队：绝对的数量级基础 (虫/草/啮齿)
            "caterpie",       // 绿毛虫：食物链底端 No.1
            "weedle",         // 独角虫
            "wurmple",        // 刺尾虫
            "metapod",        // 铁甲蛹：只会在那变硬
            "kakuna",         // 铁壳蛹
            "silcoon",        // 甲壳茧
            
            // 林地小型哺乳类
            "rattata",        // 小拉达 (关都种)：森林边缘无处不在
            "sentret",        // 尾立：警戒放哨
            "zigzagoon",      // 蛇纹熊 (关都种)：在树根下面刨东西
            "patrat",         // 探探鼠
            "skwovet",        // 贪心栗鼠：和上面的树果掉落联动
            
            // 草伪装者
            "seedot",         // 橡实果
            "shroomish",      // 蘑蘑菇
            "fomantis",       // 伪螳草
            "oddish",         // 走路草
            "hoppip",         // 毽子草
            "bounsweet",      // 甜竹竹
            "petilil",        // 百合根娃娃
            "budew",          // 含羞苞
            "sewaddle"        // 虫宝包
        ],

        "uncommon": [
            // 第二梯队：有一定自保能力或群居的生物
            "nidoranf",       // 尼多兰
            "nidoranm",       // 尼多朗 (尼多家族在深林里有很大的群落)
            "mankey",         // 猴怪：路过的时候容易发生冲突
            "aipom",          // 长尾怪手
            "panpour",        // 冷水猴 (也喜欢湿润森林)
            "bansage",        // 花椰猴
            "deerling",       // 四季鹿 (夏季形态)
            "skiddo",         // 小骑山羊
            
            // 稍强的昆虫与植物
            "venonat",        // 毛球
            "ledyba",         // 芭瓢虫
            "spinarak",       // 圆丝蛛：晚上比白天多
            "pineco",         // 榛果球
            "kricketot",      // 圆法师
            "burmy",          // 结草儿 (草木)
            "cherubi",        // 樱花宝
            "phantump",       // 小木灵：看起来像普通的树桩
            "morelull",       // 睡睡菇：夜光

            // 进化型 (低级)
            { "id": "nuzleaf", "min": 14 },     // 长鼻叶
            { "id": "beautifly", "min": 10 },   // 狩猎凤蝶 (美丽但也危险)
            { "id": "dustox", "min": 10 },      // 毒粉蛾
            { "id": "butterfree", "min": 10 },  // 巴大蝶
            { "id": "beedrill", "min": 10 }     // 大针蜂 (这个真的不想遇到，一来就是一群)
        ],

        "rare": [
             // 惊喜：第三代以后的“特种”
             "scyther",       // 飞天螳螂 (不仅仅在高草，边缘也有)
             "pinsir",        // 凯罗斯
             "heracross",     // 赫拉克罗斯
             "teddiursa",     // 熊宝宝：极度危险（因为妈在附近）
             "pikachu",       // 皮卡丘：深林种，野性强
             "emolga",        // 电飞鼠
             "pachirisu",     // 帕奇利兹
             "togedemaru",    // 托戈德玛尔
             
             // 御三家的“野化”版本 (Rare Only)
             "bulbasaur",     // 妙蛙种子
             "chikorita",     // 菊草叶
             "turtwig",       // 草苗龟
             "snivy",         // 藤藤蛇
             "chespin",       // 哈力栗
             "rowlet",        // 木木枭
             "grookey",       // 敲音猴 (猴群领袖?)
             "sprigatito"     // 新叶喵
        ],

        "boss": [
            // 第三梯队：森林的无冕之王
            { "id": "ursaring", "min": 35 },   // 圈圈熊：真正的物理压制力
            { "id": "sawsbuck", "min": 34 },   // 萌芽鹿：优雅但冲撞力极强
            { "id": "primeape", "min": 28 },   // 火暴猴：追得你出不了森林
            { "id": "nidoqueen", "min": 40 },  // 尼多后
            { "id": "nidoking", "min": 40 },   // 尼多王
            { "id": "shiftry", "min": 35 },    // 狡猾天狗
            { "id": "tsareena", "min": 38 },   // 甜冷美后 (野化版)
            { "id": "trevenant", "min": 38 },  // 朽木妖
            { "id": "shiinotic", "min": 35 },  // 灯罩夜菇
            { "id": "lurantis", "min": 34 }    // 兰螳花
        ]
    },



    /* 
       Revision: Jade_Canopy - High_Grass (Dense Ferns)
       Ecology: Ambush Predators / Hive Infinities / Trap Plants
       Level Range: Mostly Lv.10 - 25
    */
    "High_Grass": {
        
        // === Common Pool: 任何人都踩的到的地雷 ===
        "common": [
            // 基础虫群 (Hive Mind)
            "sewaddle",       // 虫宝包：在给自己做衣服
            "spinara",        // 圆丝蛛：到处都是粘性的网
            "venipede",       // 百足蜈蚣：小心脚下有毒
            "nincada",        // 土居忍士：生活在土根部
            "crustle",        // (修正) dwebble 石居蟹：林地型，背着苔藓石头
            "paras",          // 派拉斯特：也是吃蘑菇长大的
            "wurmple",        // 刺尾虫
            "kricketot",      // 圆法师，叫声源头
            "joltik",         // 电电虫
            
            // 下层植被拟态
            "gossifleur",     // 幼棉棉：被大风吹进来的
            "cacnea",         // (森林种?) 不，应该是 carnivine 尖牙笼：看起来像草
            "foongus",        // 哎呀球菇：精灵球陷阱
            "bellsprout",     // 喇叭芽
            
            // 四足潜伏者
            "ekans",          // 阿柏蛇：草丛里的嘶嘶声
            "seviper",        // 饭匙蛇：和猫鼬斩打架的那个
            "zangoose",       // 猫鼬斩：和上面打架的那个
            "yungoos"         // 猫鼬少
        ],

        // === Uncommon Pool: 稍微强壮一点的战士 ===
        "uncommon": [
            // 进化型 (Low Level Cap)
            { "id": "swadloon", "min": 20 },  // 宝包茧
            { "id": "ariados", "min": 22 },   // 阿利多斯
            { "id": "weepinbell", "min": 21 },// 口呆花
            { "id": "arbok", "min": 22 },     // 阿柏怪
            { "id": "parasect", "min": 24 },  // 派拉斯特
            { "id": "whirlipede", "min": 22 },// 车轮球：滚来滚去

            // 单体强力的基础型
            "scyther",        // 飞天螳螂：收割者，哪怕没进化也很强
            "pinsir",         // 凯罗斯：力量型虫
            "heracross",      // 赫拉克罗斯：格斗技
            "tangela",        // 蔓藤怪
            "yanma",          // 阳阳玛 (在头上飞)
            "durant",         // 铁蚁 (成群结队)
            "skorupi",        // 钳尾蝎
            "scolpile",       // (注：Sizzlipede 烧火依)
            "karrablast",     // 盖盖虫
            "shelmet"         // 小嘴蜗
        ],

        // === Rare Pool: 生态链顶端的稀客 ===
        "rare": [
            // 龙与亚龙
            "vibrava",        // 超音波幼虫 (Ground/Dragon)
            "axew",           // 牙牙 (需要地方磨牙)
            "fraxure",        // (如果稍微欧一点遇到了进化的)
            "applin",         // 啃果虫
            
            // 特殊肉食者
            "carnivine",      // 尖牙笼 (Common移入Rare? 不，保留几个在Common，这里放高级的)
            
            // 异阶入侵
            "tropius",        // 热带龙 (个头太大只能藏在高草里)
            "drapion",        // (Min lv 40) 龙王蝎：这如果在Rare里直接遇到是要命的
            
            // 区域形态
            "morpeko",           // 莫鲁贝可：饿了会咬人
            "leavanny"           // 保姆虫：也是高级别的保姆
        ],

        // === Boss Pool: 自然灾害 ===
        "boss": [
            { "id": "yanmega", "min": 38 },    // 远古巨廷：轰炸机
            { "id": "scolipede", "min": 35 },  // 蜈蚣王：重战车 (比之前降低了等级要求，让中段玩家也能挑战)
            { "id": "tangrowth", "min": 40 },  // 巨蔓藤
            { "id": "kangaskhan", "min": 40 }, // 袋兽
            { "id": "armaldo", "min": 40 },    // 多刺菊石兽 (如果是古代种复活?) -> 选 Armaldo 太古盔甲
            { "id": "haxorus", "min": 48 },    // 双斧战龙 (Jade Canopy 真正的可怖传说)
            { "id": "vikavolt", "min": 35 }    // 锹农炮虫
        ]
    },



    /* 
       Revision: Jade_Canopy - Light_Forest (The Canopy Verticality) 
       Ecology: Avian / Arboreal / Mimicry-Ghost / Primate
       Cross-Threat: Low(10-20) -> Mid(25-40)
    */
    "Light_Forest": {
        
        // === Common Pool: 任何抬头或是摇树都能碰到的 ===
        "common": [
            // 基础鸟类 (Forest Birds)
            "pikipek",        // 小笃儿：哒哒哒的钻木声无处不在
            "hoothoot",       // 咕咕：哪怕白天也在树荫里睡觉
            "taillow",        // 傲骨燕：在林冠上层飞
            "starly",         // 姆克儿
            "pidove",         // 豆豆鸽 (可能会迷路飞进来)
            "spearow",        // 烈雀：脾气不好，会攻击摇树的人
            "murkrow",        // 黑暗鸦：把亮晶晶的东西叼回巢穴
            
            // 树上的静止物/挂件 (Drop Hazard)
            "pineco",         // 榛果球：真的像松果一样掉下来
            "burmy",          // 结草儿 (植物蓑衣)
            "metapod",        // 铁甲蛹
            "kakuna",         // 铁壳蛹
            "cascoon",        // 盾甲茧
            "silcoon",        // 甲壳茧
            "seedot",         // 橡实果
            "cherubi",        // 樱花宝

            // 爬树者
            "spinarak",       // 圆丝蛛
            "joltik",         // 电电虫
            "caterpie",       // 绿毛虫
            "wurmple",        // 刺尾虫
            "aipom",          // 长尾怪手
            "mankey",         // 猴怪
            "slakoth"         // 懒人獭 (趴着不动)
        ],

        // === Uncommon Pool: 中坚层级，树的主人 (Lv 20-30区间) ===
        "uncommon": [
            // 鸟类进化层
            { "id": "trumbeak", "min": 15 },    // 喇叭啄鸟
            { "id": "noctowl", "min": 20 },     // 猫头夜鹰
            { "id": "fearow", "min": 22 },      // 大嘴雀：开始有领地意识了
            { "id": "staravia", "min": 17 },    // 姆克鸟
            { "id": "fletchinder", "min": 20 }, // 火箭雀

            // 树木本树 / 拟态者
            { "id": "sudowoodo", "min": 20 },   // 树才怪 (它不是树，但它就在这混)
            { "id": "phantump", "min": 15 },    // 小木灵
            { "id": "pumpkaboo", "min": 15 },   // 南瓜精 (可能是不同尺寸)
            { "id": "trevenant", "min": 25 },   // 朽木妖 (未完全成熟体)
            { "id": "shiinotic", "min": 26 },   // 灯罩夜菇

            // 较强的悬挂/昆虫
            { "id": "forretress", "min": 31 },  // 佛列托斯：这次掉下来炸得更痛
            { "id": "swadloon", "min": 20 },    // 宝包茧
            { "id": "heracross", "min": 25 },   // 赫拉克罗斯：独占了只好的树汁
            { "id": "pinsir", "min": 25 },      // 凯罗斯
            { "id": "mothim", "min": 20 },      // 绅士蛾
            { "id": "wormadam", "min": 20 },    // 结草贵妇
            
            // 灵长类&树栖哺乳类
            "komala",         // 树枕尾熊
            "passimian",      // 投掷猴
            "oranguru",       // 智挥猩
            { "id": "vigoroth", "min": 18 }     // 过动猿：很吵，真的，全林子都听得到
        ],

        // === Rare Pool: 阴影中的极少数 (Lv 30+) ===
        "rare": [
            "munchlax",       // 小卡比兽 (只在该特定的“甜蜜树”出？)
            "applin",         // 啃果虫
            
            // 御三家草系稀有位
            "treecko",        // 木守宫：完美的树栖设定
            "turtwig",        // 草苗龟
            "snivy",          // 藤藤蛇
            "chespin",        // 哈力栗
            "rowlet",         // 木木枭

            // 特殊飞行系 (龙/仙)
            "altaria",        // 七夕青鸟 (Rare Spawn): 像云一样停在树顶
            "tropius",        // 热带龙
            "jumpluff",       // 毽子棉：被风吹挂在树上了

            { "id": "snorlax", "min": 30 }      // 卡比兽 (如果不挡路的话，就是Rare Spawn)
        ],

        // === Boss Pool: 天空的阴影 / 树海之王 (Lv 38-50) ===
        "boss": [
            // 顶级猛禽
            { "id": "toucannon", "min": 40 },   // 枪嘴大鸟：森林大炮
            { "id": "staraptor", "min": 38 },   // 姆克鹰：俯冲轰炸
            { "id": "honchkrow", "min": 42 },   // 乌鸦头头：黑帮老大
            { "id": "braviary", "min": 45 },    // 勇士雄鹰 (如果是普通的，或者洗翠的?) -> 普通
            { "id": "corviknight", "min": 45 }, // 钢铠鸦：空中机动要塞 (如果这里能生成的话)
            { "id": "unfezant", "min": 35 },    // 高傲雉鸡

            // 森林之王 / 巨型灵长类
            { "id": "slaking", "min": 45 },     // 请假王：数值怪兽
            { "id": "rillaboom", "min": 45 },   // 轰擂金刚猩 & 它的鼓
            { "id": "ambipom", "min": 35 },     // 双尾怪手
            { "id": "zarude", "min": 60 },      // (超级Boss彩蛋?) 萨戮德

            // 幽灵统治者
            { "id": "trevenant", "min": 42 },   // 朽木妖 (老树精)
            { "id": "decidueye", "min": 45 }    // 狙射树枭：幽灵弓箭手
        ]
    }

},

/* Zone: Deep_Root_Hollow (Underground Roots & Fungi) */
/* Threat Range: Safe -> High (Lv 15 -> Lv 50+) */
/* Theme: Dark / Bug / Poison / Ghost / Bio-Luminescence */

"Deep_Root_Hollow": {

    // === Light_Forest (空洞入口 / 荧光苔藓带) ===
    // 依然能看到一点外面的光，或者有发光的植物照明
    // 生态位：蝙蝠、夜行性生物、发光植物
    "Light_Forest": {
        "common": [
            "zubat",          // 超音蝠：这里是它们的天下，不再是鸟了
            "woobat",         // 滚滚蝙蝠
            "morelull",       // 睡睡菇：主要光源
            "paras",          // 派拉斯特：吃蘑菇
            "shroomish",      // 蘑蘑菇
            "spinarak",       // 圆丝蛛
            "joltik",         // 电电虫
            "nincada",        // 土居忍士：根部的居民
            "cutiefly"        // 萌虻：被发光物吸引
        ],
        "uncommon": [
            "golbat",         // 大嘴蝠
            "shiinotic",      // 灯罩夜菇：更大的光源
            "parasect",       // 派拉斯特：此时蘑菇已经控制了身体，眼神空洞
            "illumise",       // 甜甜萤
            "volbeat",        // 电萤虫
            "swoobat",        // 心蝙蝠
            "phantump"        // 小木灵
        ],
        "rare": [
            "impidimp",       // 捣蛋小妖：这里真的很阴暗，适合这种小恶魔
            "klefki",         // 钥圈儿：有人在这丢了钥匙?
            "mimikyu",        // 谜拟Q：即使在树洞里也不想见人
            "sableye"         // 勾魂眼：吃荧光宝石
        ],
        "boss": [
            { "id": "crobat", "min": 35 },    // 叉字蝠：虽然亲密度进化难，但野外有大佬
            { "id": "noivern", "min": 45 },   // 音波龙：作为从更深处飞出来的领主
            { "id": "shiinotic", "min": 38 }  // (复用) 巨大的蘑菇王
        ]
    },


    /* 
       Revision: Deep_Jungle (The Abyssal Roots)
       Ecology: Decomposer / Arachnid / Primeval Arthropod / Mushroom Kingdom
       Threat: High (Hostile Environment)
    */
    "Deep_Jungle": {
        
        // === Common Pool: 任何行走都要处理的“环境噪音” ===
        "common": [
            // 基础虫/茧
            "sewaddle",       // 虫宝包
            "venipede",       // 百足蜈蚣 (数量极大)
            "weedle",         // 独角虫
            "kakuna",         // 铁壳蛹
            "wurmple",        // 刺尾虫
            "cascoon",        // 盾甲茧 (黑暗分支多)
            "spinara",        // 圆丝蛛
            "joltik",         // 电电虫 (在电离的苔藓上)
            "scatterbug",     // 粉蝶虫 (洞窟纹样)
            "tarountula",     // (Gen 9) 团珠蛛：用线球在那滚来滚去
            "dewpider",       // 滴蛛
            "wimpod",         // 胆小虫 (到处爬)
            
            // 腐败分解者
            "grimer_alola",   // 臭泥(阿罗拉)：吃腐败植物，颜色鲜艳
            "koffing",        // 瓦斯弹：吸食地底沼气
            "foongus",        // 哎呀球菇
            "morelull",       // 睡睡菇
            "zubat",          // 超音蝠 (不用说了)
            
            // 意外的底层
            "ferroseed",      // 种子铁球 (伪装成硬果实，扎脚)
            "shuckle",        // 壶壶 (把腐烂的浆果发酵成酒)
            "inkay",          // 比如 (好啦鱿)：虽然是恶系适合，但这是海洋生物... 算了去掉
            // 换成 nymble     // (Gen 9) 豆蟋蟀：黑暗中的跳跃者
             "nymble"
        ],

        // === Uncommon Pool: 小心！不仅是路障，是猎手 ===
        "uncommon": [
            // 进化的虫群中坚
            { "id": "swadloon", "min": 20 },      // 宝包茧
            { "id": "whirlipede", "min": 24 },    // 车轮球 (滚动的车轮)
            { "id": "spidops", "min": 25 },       // (Gen 9) 操陷蛛
            { "id": "ariados", "min": 24 },       // 阿利多斯
            { "id": "ledian", "min": 18 },        // 安瓢虫 (虽然弱，但是会发光打信号)
            { "id": "illumise", "min": 20 },      // 甜甜萤
            { "id": "volbeat", "min": 20 },       // 电萤虫
            { "id": "dustox", "min": 20 },        // 毒粉蛾 (这层主要是有毒蛾)
            
            // 植物掠食者
            { "id": "cherrim", "min": 25 },       // 樱花儿(阴天形态)：永远闭着，看起来阴森
            { "id": "weepinbell", "min": 22 },    // 口呆花
            { "id": "carnivine", "min": 26 },     // 尖牙笼
            
            // 地底特化
            { "id": "gligar", "min": 24 },        // 天蝎 (洞穴蝙蝠蝎)
            { "id": "sableye", "min": 25 },       // 勾魂眼 (Mega?)
            { "id": "mawile", "min": 25 },        // 大嘴娃 (欺骗捕食者)
            { "id": "skorupi", "min": 25 }        // 钳尾蝎
        ],

        // === Rare Pool: 生化的奇迹 / 光源守护者 ===
        "rare": [
            "scyther",        // 飞天螳螂 (这里的螳螂可能有更深色的甲壳? Lore)
            "pinsir",         // 凯罗斯
            "heracross",      // 赫拉克罗斯
            "accelgor",       // 敏捷虫 (小嘴蜗进化) -> 需要和 Karrablast 互动
            "escavalier",     // 骑士蜗牛 (盖盖虫进化) -> 需要和 Shelmet 互动
            "toedscool",      // (Gen 9) 原野水母：虽然叫水母，但是是草/地，走路摇摇晃晃
            "shiny_metapod",  // (Joke) 金色铁甲蛹? no
            
            { "id": "hydreigon", "min": 64 }, // (Ultra Ultra Rare???) 三首恶龙：这如果出现在这里真的就是最终警告了 (改为 Deino/Zweilous更合适) -> "zweilous"(Min 50) 单首龙
             "deino",         // 单首龙：在黑暗中乱咬
             "larvesta"       // 燃烧虫 (圣火)
        ],

        // === Boss Pool: (Min 35-60) 这片黑暗的终极恐惧 ===
        "boss": [
            // 虫王系列
            { "id": "scolipede", "min": 45 },     // 蜈蚣王
            { "id": "vikavolt", "min": 40 },      // 锹农炮虫
            { "id": "galvantula", "min": 36 },    // 电蜘蛛
            { "id": "leavanny", "min": 38 },      // 保姆虫 (虽然叫保姆，切割力惊人)
            { "id": "araquanid", "min": 35 },     // 滴蛛霸
            { "id": "accelgor", "min": 40 },      // 敏捷虫 (极速刺客)
            { "id": "escavalier", "min": 40 },    // 骑士蜗牛
            { "id": "vespiquen", "min": 36 },     // 蜂女王
            { "id": "lokix", "min": 42 },         // (Gen 9) 烈腿蝗：黑暗机甲骑士
            { "id": "kleavor", "min": 50 },       // (洗翠?) 劈斧螳螂：如果石斧被允许存在，那这里最适合劈砍木头

            // 剧毒/恶势力
            { "id": "drapion", "min": 45 },       // 龙王蝎
            { "id": "gliscor", "min": 42 },       // 天蝎王
            { "id": "weezing_galar", "min": 45 }, // 双弹瓦斯(伽勒尔)：净化工厂
            { "id": "muk_alola", "min": 42 },     // 臭臭泥(阿罗拉)：在黑暗中发光的杀手
            { "id": "toedscruel", "min": 45 },    // 陆地水母 (Boss版)

            // 神话/准神
             { "id": "volcarona", "min": 55 },    // 火神蛾 (太阳神)
             { "id": "hydreigon", "min": 64 }     // 三首恶龙 (如果有 Deino 在rare, 那么 Boss 可以有)
        ]
    }

},

/* Zone: Breeze_Woodlands (Windy Meadows & Birch Forest) */
/* Threat: Safe -> Mid (Mainly Low) */
/* Weather: Strong Wind (Increased Flying-type Speed) */

"Breeze_Woodlands": {

    /* 
       Terrain: Pavement @ Marina_Port_Town
       Theme: Logistics Hub / Ranger Station / Cozy Settlement
       Threat: Safe -> Safe (Almost no hostility)
    */
    "Pavement": {

        // === Common Pool: 街道上的“市民” (Lv 5-15) ===
        "common": [
            // 城镇伴侣 - 极度和平
            "glameow",        // 魅力喵：在露天咖啡座下面钻来钻去
            "purrloin",       // 扒手猫：试图偷游客的炸鱼薯条
            "lillipup",       // 哈约克 (基础款)：最常见的看门狗
            "fidough",        // (Gen 9) 狗仔包：面包店门口的常客，软乎乎的
            "skwovet",        // 贪心栗鼠：翻垃圾桶的主力
            "pidove",         // 豆豆鸽：也是广场标配
            "rookidee",       // 稚山雀：作为飞行出租车的预备役

            // 港口/物流工人
            "wingull",        // 长翅鸥：毕竟是“Marina”港口，码头到处都是
            "machop",         // 腕力：帮忙搬箱子
            "timburr",        // 搬运小匠：帮忙修补木栈道
            "rattata",        // 小拉达
            "meowth"          // 喵喵
        ],

        // === Uncommon Pool: 服务提供者 (Lv 15-25) ===
        "uncommon": [
            // 快递与公职人员
            "delibird",       // 信使鸟：负责包裹投递
            "pelipper",       // 大嘴鸥：负责信件投递 / 吞下货物运输
            "growlithe",      // 卡蒂狗：君莎小姐/治安队的搭档
            "squawkabilly",   // (Gen 9) 怒鹦哥：城镇里的不良少年团伙(也就是有点吵)
            
            // 商业区特色
            "tandemaus",      // (Gen 9) 一对鼠：这暗示着这镇子适合定居
            "slurpuff",       // (Evolution? no make pre-evo better) -> "swirlix" 绵绵泡芙
            "minccino",       // 泡沫栗鼠：清洁工
            "trubbish",       // 破破袋：因为是物流中心，垃圾分类很重要

            // 电力/信号支持
            "magnemite",      // 小磁怪：在这个比较原始的木头镇子负责提供无害能源
            "dedenne",        // 咚咚鼠：偷吸电线的电以获取信号
            
            // 进化型 (社会化)
            { "id": "gurdurr", "min": 25 },    // 铁骨土人：工头
            { "id": "herdier", "min": 16 }     // 哈约克：警犬
        ],

        // === Rare Pool: 特殊功能与吉祥物 (Lv 25+) ===
        "rare": [
            "eevee",          // 伊布：由于这里生活环境好，是理想的饲育地
            "castform",       // 飘浮泡泡：位于港口的气象观测站附近
            "polygon",        // 多边兽：PC中心的辅助系统具象化
            "chansey",        // 吉利蛋：医疗援护
            "mrmime",         // 魔墙人偶：什么都能干的家政服务
            "cyclizar",       // (Gen 9) 摩托蜥：护林员的坐骑在这里休息
            "dragonite"       // (彩蛋?不) -> "dratini" 迷你龙：在城镇的水渠里偶尔能看到
        ],

        // === Boss Pool: 城镇守护者/路障 (Lv 35-50) ===
        // 这里的Boss不是那种“只要你靠近就杀你”的怪，而是“挡路”或者“通过考核”的意味
        "boss": [
            // 道路阻塞者
            { "id": "snorlax", "min": 35 },     // 卡比兽：不仅挡路，还吃光了餐厅
            { "id": "conkeldurr", "min": 40 },  // 修建老匠：港口总工程师 (如果你乱动物资会揍你)
            { "id": "corviknight", "min": 45 }, // 钢铠鸦：空中巴士停在这里
            { "id": "arcanine", "min": 40 },    // 风速狗：这里的治安官
            { "id": "stoutland", "min": 40 },   // 长毛狗：受人尊敬的老狗，镇长?
            { "id": "pelipper", "min": 35 },    // 大嘴鸥 (领主级)：掌握着所有信件
            { "id": "dachsbun", "min": 35 }     // (Gen 9) 麻花犬：烤得焦黄，甚至防守极高
        ]
    },

    // === 1. 河岸边的舒适草甸 (Standard_Grass) ===
    // 靠近"零光护城河"和"翡翠脉络河"的交界，视野开阔
    // 宝可梦：喜欢晒太阳的、随风滚动的
    "Standard_Grass": {
        "common": [
            "hoppip",         // 毽子草：被风吹得到处都是
            "skiploom",       // 毽子花
            "cottonee",       // 木棉球：像蒲公英一样
            "drifloon",       // 飘飘球：如果你体重不够重小心被带走（虽然是Ghost，但像气球）
            "sentret",        // 尾立：常常站起来用尾巴当凳子
            "zigzagoon_galar",// 蛇纹熊 (伽勒尔)：这里有这种黑白条纹的变种在乱跑
            "lillipup",       // 哈约克 (基础款)
            "skwovet",        // 贪心栗鼠
            "pidove"          // 豆豆鸽：成群结队
        ],

        "uncommon": [
            "taillow",        // 傲骨燕：在低空滑翔
            "swablu",         // 青绵鸟：伪装成云朵
            "fletchling",     // 小箭雀
            "electrike",      // 落雷兽：只有在跑起来能产生电
            "plusle",         // 正电拍拍
            "minun",          // 负电拍拍
            "furret",         // 大尾立：(Safe区的小Boss?)
            "bramblin"        // (Gen 9) 纳噬草：风滚草鬼魂，非常适合这里! (Rolling Ghost)
        ],

        "rare": [
            "whimsicott",     // 风妖精：恶作剧之风的源头
            "eldegoss",       // 白蓬蓬
            "togetic",        // 波克基古
            "cyclizar"        // (Gen 9) 摩托蜥：有人在草坪上飙车留下来的
        ],

        "boss": [
            { "id": "jumpluff", "min": 28 },    // 毽子棉：不再被风吹，而是驾驭风
            { "id": "linoone_galar", "min": 32 }, // 直冲熊 (伽勒尔)：飞奔的泥头车 (Rare Spawn)
            { "id": "driftblim", "min": 30 },   // 随风球：它来了
            { "id": "kilowattrel", "min": 40 }  // (Gen 9) 电海燕：利用风力发电的大鸟
        ]
    },


    // === 2. 森林外缘挡风林带 (High_Grass) ===
    // 草更深，可能有强风直接灌入，适合更能抗风的生物
    // 特征：高高的芦苇和芒草，隐蔽性好
    "High_Grass": {
        "common": [
            "nuzleaf",        // 长鼻叶：喜欢这种风
            "seedot",         // 橡实果
            "ledyba",         // 芭瓢虫 (群飞)
            "combee",         // 三蜜蜂
            "cutiefly",       // 萌虻
            "scyther",        // 飞天螳螂（这里也算林在外缘）
            "kricketot",      // 圆法师    
            "bramblin"        // 纳噬草 (继续滚)
        ],

        "uncommon": [
            "sudowoodo",      // 树才怪：风吹也不动
            "pidgeotto",      // 比比鸟
            "tranquill",      // 咕咕鸽
            "staravia",       // 姆克鸟
            "swellow",        // 大王燕：速度极快
            "ninjask"         // 铁面忍者：你只能看到残影 (Fastest Bug)
        ],

        "rare": [
            "scyther",        // (再次确认作为High Grass常驻Rare)
            "kleavor",        // (不太可能，只有洗翠有) -> 换:
            "yanma",          // 阳阳玛 (高速震动翅膀)
            "braviary",       // 勇士雄鹰
            "tornadus",        // (Ultra Rare/Easter Egg ???) 龙卷云：风的化身 (极低概率且只有暴风雨) -> 
            "emolga",         // 电飞鼠：在树梢间滑翔
            "hawlucha",       // 摔角鹰人：从高空跳水
            "shiftry"         // 狡猾天狗 (Rare spawn / pre-boss)
        ],

        "boss": [
            { "id": "yanmega", "min": 38 },     // 远古巨廷
            { "id": "pidgeot", "min": 36 },     // 比雕：真正的马赫飞行
            { "id": "staraptor", "min": 40 },   // 姆克鹰
            { "id": "unfezant", "min": 35 },    // 高傲雉鸡
            { "id": "shiftry", "min": 45 },     // 狡猾天狗：被称为森林之神，这很合理
            { "id": "brambleghast", "min": 38 } // (Gen 9) 怖纳噬草：Boss级的风滚草
        ]
    },


    /* Revision: Light_Forest (Sun-Dappled Canopy) */
    "Light_Forest": {

        // === Common Pool: 喧闹的树上邻居 ===
        "common": [
            // 第一梯队家门鸟的初阶
            "pikitpek",        // 小笃儿
            "fletchling",      // 小箭雀
            "pidove",          // 豆豆鸽 (这货哪都有)
            "spearow",         // 烈雀
            "starly",          // 姆克儿
            "hoothoot",        // 咕咕
            "rookidee",        // 稚山雀 (这个在微风林地很合适，虽然通常在伽勒尔)
            "murkrow",         // 黑暗鸦 (喜欢亮晶晶的东西)
            "wattrel",         // (Gen 9) 电海燕的幼体：把窝筑在树顶

            // 树干上的常客
            "aipom",           // 长尾怪手
            "slakoth",         // 懒人獭
            "burmy",           // 结草儿 (植物蓑衣)
            "cherubi",         // 樱花宝
            "seedot",          // 橡实果
            "pineco",          // 榛果球
            "caterpie",        // 绿毛虫 (为了变成巴大蝶)
            "metapod",         // 铁甲蛹
            "kakuna",          // 铁壳蛹
            "combee",          // 三蜜蜂
            "pichu"            // 皮丘 (偶尔从树上掉下来)
        ],

        // === Uncommon Pool: 中坚与中型鸟类 (Level 15-25) ===
        "uncommon": [
            // 鸟类进阶梯队
            { "id": "trumbeak", "min": 14 },     // 喇叭啄鸟
            { "id": "fletchinder", "min": 17 },  // 火箭雀
            { "id": "staravia", "min": 14 },     // 姆克鸟
            { "id": "tranquill", "min": 21 },    // 咕咕鸽
            { "id": "corvisquire", "min": 18 },  // 蓝鸦
            { "id": "fearow", "min": 20 },       // 大嘴雀 (性格暴躁)
            { "id": "noctowl", "min": 20 },      // 猫头夜鹰

            // 树上的其他生物
            { "id": "komala", "min": 1 },        // 树枕尾熊 (无进化)
            { "id": "kecleon", "min": 1 },       // 变隐龙：不仅隐身而且在树干上很难发现
            { "id": "nuzleaf", "min": 14 },      // 长鼻叶
            { "id": "mothim", "min": 20 },       // 绅士蛾
            { "id": "beautifly", "min": 10 },    // 狩猎凤蝶 (美丽但也也是虫子)
            { "id": "butterfree", "min": 10 },   // 巴大蝶
            { "id": "vespiquen", "min": 21 },    // 蜂女王 (如果运气好碰到了巢穴)
            
            // 花舞鸟-热辣风格 (火) / 风格修正: 草原风格 (超能/花? No, Pom-Pom电)
            { "id": "orocorio", "min": 1 }       // 花舞鸟 (默认红：花蜜风格)
        ],

        // === Rare Pool: 林间隐士与来自远方者 (Level 25+) ===
        "rare": [
            "swablu",          // 青绵鸟：伪装成棉花
            "chatot",          // 聒噪鸟
            "emolga",          // 电飞鼠：滑翔专家
            "girafarig",       // 麒麟奇：除了吃的一无所有 (Min Lv 1)
            "farfetchd",       // 大葱鸭 (普通/伽勒尔? 普通就好)
            "pinsir",          // 凯罗斯
            "heracross",       // 赫拉克罗斯
            
            // 需要一点欧气才能碰到的进化体
            { "id": "scyther", "min": 1 },       // 飞天螳螂
            { "id": "munchlax", "min": 1 },      // 小卡比兽 (如果树上有蜂蜜)
            { "id": "applin", "min": 1 },        // 啃果虫
            { "id": "sudowoodo", "min": 1 }      // 树才怪
        ],

        // === Boss Pool: 天空霸主 (Level 35-50) ===
        // Breeze Woodlands的天空几乎被它们垄断
        "boss": [
            { "id": "pidgeot", "min": 36 },      // 比雕：(这里必须有，作为初代速度象征)
            { "id": "toucannon", "min": 40 },    // 枪嘴大鸟
            { "id": "talonflame", "min": 40 },   // 烈箭鹰 (疾风之翼)
            { "id": "unfezant", "min": 32 },     // 高傲雉鸡
            { "id": "staraptor", "min": 34 },    // 姆克鹰
            { "id": "corviknight", "min": 45 },  // 钢铠鸦：巡逻骑士
            { "id": "braviary", "min": 54 },     // 勇士雄鹰
            { "id": "kilowattrel", "min": 40 },  // (Gen 9) 电海燕
            { "id": "hawlucha", "min": 35 },     // 摔角鹰人 (喜欢从高树跳水)
            { "id": "altaria", "min": 35 }       // 七夕青鸟
        ]
    }
},
/* Zone: Silt_Delta (The Muddy Marsh) */
/* Threat: Low -> Mid (Lv 15-40) */
/* Terrain: Swamp (Thick Mud & Stagnant Water) Only */

"Silt_Delta": {
    
    // === 覆盖全境的黑泥沼泽 (Swamp) ===
    // 无论是水坑还是泥地，统一归为此类
    "Swamp": {
        
        // === Common Pool: 泥巴里的原住民 (数量最大) ===
        "common": [
            // "泥巴佬"三巨头
            "wooper_paldea",  // 乌波(帕底亚)：在毒泥里打滚
            "wooper",         // 乌波(普通)：在水坑里打滚
            "shellos",        // 无壳海兔(东海/西海混居)：软软粘粘的
            
            // 蝌蚪与青蛙幼体
            "poliwag",        // 蚊香蝌蚪
            "tympole",        // 圆蝌蚪
            // 沼泽植物共生
            "lotad",          // 莲叶童子：伪装成水面的叶子
            "surskit",        // 溜溜糖球：水面滑冰
            
            // 淤泥特产
            "stunfisk",       // 泥巴鱼(普通)：踩到会放电，最讨厌的陷阱
            "stunfisk_galar", // 泥巴鱼(伽勒尔)：踩到会被夹住 (夹子)
            "barboach",       // 泥泥鳅：滑溜溜抓不住
            "croagunk",       // 不良蛙：潜伏在芦苇丛里
            "goomy",          // 黏黏宝：必须保持湿润
            "skrelp"          // 垃垃藻：适应了这里的浑浊水质
        ],

        // === Uncommon Pool: 泥沼猎手与进阶威胁 (Lv 20-30) ===
        "uncommon": [
            // 进化型 (中级)
            { "id": "quagsire", "min": 20 },    // 沼王
            { "id": "clodsire", "min": 20 },    // 土王：泥潭里的重型坦克
            { "id": "poliwhirl", "min": 25 },   // 蚊香君
            { "id": "palpitoad", "min": 25 },   // 蓝蟾蜍
            { "id": "lombre", "min": 14 },      // 莲帽小童
            { "id": "masquerain", "min": 22 },  // 雨翅蛾
            
            // 湿地捕食者 & 居民
            "carnivine",      // 尖牙笼：这里才是它们除林地外的老家
            "yanma",          // 阳阳玛：作为可以飞行的捕食者
            "shelmet",        // 小嘴蜗：沼泽骑士
            "karrablast",     // 盖盖虫
            "psyduck",        // 可达鸭：头痛地在泥里发呆
            "marill",         // 玛力露
            "azurill",        // 露力丽
            "clauncher"       // 铁臂枪虾：在浑水里射击
        ],

        // === Rare Pool: 泥潭深处的宝藏 (Lv 30+) ===
        "rare": [
            "dratini",        // 迷你龙：神话般的蛇，喜欢躲在这个脏地方没人抓
            "froakie",        // 呱呱泡蛙 (稀有御三家)：这里是两栖类的天堂
            "mudkip",         // 水跃鱼 (稀有御三家)：同上
            "totodile",       // 小锯鳄：咬合力惊人

            { "id": "sliggoo", "min": 40 },     // 黏美儿：藏身沼泽雾气中
            { "id": "toxicroak", "min": 37 },   // 毒骷蛙
            { "id": "whiscash", "min": 30 },    // 鲶鱼王
            { "id": "pyukumuku", "min": 1 }     // 拳海参
        ],

        // === Boss Pool: 沼泽领主 (Lv 40-55) ===
        // 在泥浆翻滚声中出现的巨大阴影
        "boss": [
            // 两栖霸主
            { "id": "seismitoad", "min": 36 },  // 蟾蜍王：毒属性震源
            { "id": "politoed", "min": 40 },    // 牛蛙君：呼风唤雨，将这里变成暴雨区
            { "id": "swampert", "min": 45 },    // 巨沼怪：这里是它的绝对领域
            { "id": "toedscruel", "min": 38 },  // 陆地水母：用触手在泥里行走

            // 湿地巨龙/猛兽
            { "id": "goodra", "min": 50 },      // 黏美龙：实际上很温和，但体型巨大
            { "id": "feraligatr", "min": 45 },  // 大力鳄
            { "id": "dragalge", "min": 48 },    // 毒藻龙：极强的毒性防区
            { "id": "quagsire", "min": 35 },    // 沼王 (作为Buff过的领主)
            { "id": "whiscash", "min": 40 }     // 鲶鱼王 (地震制造者)
        ]
    }
},
/* Zone: Hermit_Sands (The Shell Graveyard) */
/* Threat: Safe -> Low (Lv 10 - 25) */
/* Theme: Crustaceans / Scavengers / Buried Treasures / Semi-Arid */

"Hermit_Sands": {

    // === 1. 粗糙的碎贝壳沙滩 (Coastal_Sand) ===
    // 这里的沙子并不细腻，混杂着碎壳和珊瑚尸体
    // 住客：几乎全部背着壳，或者藏在沙子下面
    "Coastal_Sand": {
        "common": [
            // 寄居蟹与虾蟹大军
            "dwebble",        // 石居蟹：绝对的主角，如果不小心会把它们当石头踩
            "krabby",         // 大钳蟹
            "binacle",        // 龟脚脚：吸附在岸边岩石上
            "corphish",       // 龙虾小兵：性格鲁莽的好战分子
            "shellder",       // 大舌贝：在等待进化机会
            "wiglett",        // (Gen 9) 海地鼠：像花园鳗一样从沙里探头探脑
            "shellos",        // 无壳海兔(东海/蓝色)：虽然没壳，但硬皮也能抗沙
            "wimpod",         // 胆小虫：成群清理岸边垃圾，一有动静就集体瞬移消失
            "wingull",        // 长翅鸥
            "shuckle"         // 壶壶：(Prompt提到的) 藏在石头缝里酿果汁
        ],

        "uncommon": [
            // 稍强的甲壳类与钻沙者
            "clauncher",      // 铁臂枪虾
            "crabrawler",     // 好胜蟹：虽然是拳击手但也是蟹
            "staryu",         // 海星星
            "sandygast",      // 沙丘娃：小心这种伪装
            "kabuto",         // 化石盔：(Rare? 不，这里古贝壳多，可能有活体孑遗) -> 放在Rare更合适，这里放 Slowpoke
            "slowpoke",       // 呆呆兽：试图钓大舌贝
            "slowpoke_galar", // 呆呆兽(伽勒尔)：额头有毒斑，因为吃了本地毒贝壳？
            "pyukumuku"       // 拳海参：内脏比壳还硬
        ],

        "rare": [
            // 真正的隐士与巨物
            "skrelp",         // 垃垃藻：伪装成烂海草冲上岸
            "omanyte",        // 菊石兽：混在碎贝壳里复活了
            "kabuto",         // 化石盔
            "cursola",        // 魔灵珊瑚 (如果是伽勒尔太阳珊瑚进化的残骸...)
            "clamperl",       // 珍珠贝：罕见的完整贝壳
            "barbaracle"      // 龟足巨铠：如果不注意看以为是礁石
        ],

        "boss": [
            // 它是你的壳，归我了！
            { "id": "crustle", "min": 34 },     // 岩殿居蟹：这一带背着巨大岩石行走的领主
            { "id": "kingler", "min": 30 },     // 巨钳蟹
            { "id": "golisopod", "min": 35 },   // 具甲武者：虽然怂，但打人极其痛，胆小虫的老大
            { "id": "clawitzer", "min": 38 },   // 钢炮臂虾：移动的海滨炮台
            { "id": "slowbro", "min": 30 },     // 呆壳兽
            { "id": "cloyster", "min": 30 }     // 刺甲贝
        ]
    },


    // === 2. 干燥的滨海灌木丛与土包 (Standard_Grass) ===
    // 连接北部的过渡带，植被稀疏干枯，有许多被大风吹堆的沙丘
    // 生态位：既有海边的生物，也有能在贫瘠土地生存的虫和地面系
    "Standard_Grass": {
        "common": [
            // 昆虫与清理者
            "nincada",        // 土居忍士：生活在干枯的植物根部
            "paras",          // 派拉斯特：这里的派拉斯特比较干瘪
            "venonat",        // 毛球
            "kricketot",      // 圆法师
            "zigzagoon",      // 蛇纹熊：到处捡贝壳
            "meowth_alola",   // 喵喵(阿罗拉)：有些狡猾的猎手
            
            // 地面/爬行系的渗透 (过渡到 Zone A的特征)
            "sandshrew",      // 穿山鼠(普通)：这里的地比较硬，适合磨爪子
            "diglett",        // 地鼠
            "silicobra",      // (Gen 8) 沙包蛇：盘在沙土包上
            "cubone"          // 卡拉卡拉：捡骨头做头盔（这里骨头/壳很多）
        ],

        "uncommon": [
            // 进化的虫与草
            { "id": "ninjask", "min": 20 },     // 铁面忍者：速度极快
            { "id": "shedinja", "min": 20 },    // 脱壳忍者：(非常符合 Hermit 主题，空壳鬼魂) -> 必须要 Nincada 进化时有空位，野外遇到视为彩蛋
            { "id": "parasect", "min": 24 },    // 派拉斯特
            { "id": "maractus", "min": 1 },     // 街头沙铃：即便是海边也有这种耐旱植物
            { "id": "cacnea", "min": 1 },       // 刺球仙人掌：开始出现沙漠化征兆
            { "id": "trapinch", "min": 15 },    // 大颚蚁：沙坑陷阱的制造者 (Antlion)
            { "id": "sandslash", "min": 22 }    // 穿山王
        ],

        "rare": [
            "exeggcute",      // 蛋蛋：虽然干，但毕竟热带
            "sudowoodo",      // 树才怪：伪装成干枯的灌木，你一碰它就打你
            "gligar",         // 天蝎：从北部峭壁飞来的侦查兵
            "orthworm"        // (Gen 9) 拖拖蚓：巨大的钢铁蚯蚓，可能是从A区工业废土钻过来的
        ],

        "boss": [
            { "id": "marowak_alola", "min": 30 }, // 嘎啦嘎啦(阿罗拉)：挥舞着燃烧骨棒的舞者
            { "id": "sudowoodo", "min": 28 },     // 树才怪 (作为拦路Boss)
            { "id": "vibrava", "min": 35 },       // 超音波幼虫
            { "id": "drapion", "min": 40 }        // 龙王蝎：偶尔有把领地扩到这里的狠角
        ]
    }
},

/* Zone: Golden_Horizon (The Gilded Coast) */
/* Threat: Safe -> Low (Well managed, Security Drones Active) */
/* Theme: Solar Power / Wealth / High Temperature / Speed */

"Golden_Horizon": {

    /* Revision: Golden_Horizon - Coastal_Sand (Mineral Rich Beach) */
    /* Ecology: High Temp / High Metal Content / Reflection */
    "Coastal_Sand": {
        
        // === Common Pool: 金沙下的居民 (Base Stage / Robust) ===
        "common": [
            // 沙滩原住民 (耐热组)
            "sandile",        // 黑眼鳄：自带护目镜，完美适应高反光沙滩
            "sandshrew",      // 穿山鼠(普通)：这里的沙砾太硬了，只磨爪子
            "silicobra",      // (Gen 8) 沙包蛇：盘在热沙上睡觉
            "diglett_alola",  // 地鼠(阿罗拉)：【重点】钢铁发丝不仅防晒，也是还没适应这里矿物土壤的证明 (Steel/Ground)
            "helioptile",     // 伞电蜥：太阳能电池
            "trapinch",       // 大颚蚁：在游客走过的地方挖坑

            // 海岸基础线
            "wingull",        // 长翅鸥
            "wattrel",        // (Gen 9) 电海燕：风力发电鸟，数量极多
            "krabby",         // 大钳蟹
            "shellder",       // 大舌贝
            "binacle",        // 龟脚脚
            "wiglett",        // (Gen 9) 海地鼠：和各种worm不一样，它是水系，但这长长的身子很显眼
            "clodsire",       // 土王?? -> No, "wooper_paldea" (海水里活得不好), 换成 "shellos"
            "shellos"         // 无壳海兔(东海/蓝色)
        ],

        // === Uncommon Pool: 中型掠食者与硬壳类 (Lv 20-35) ===
        "uncommon": [
            // 有一定破坏力的野生动物
            { "id": "krokorok", "min": 29 },    // 混混鳄
            { "id": "pelipper", "min": 25 },    // 大嘴鸥
            { "id": "gabite", "min": 24 },      // 尖牙陆鲨：被光泽吸引来的龙系
            { "id": "brionne", "min": 17 },     // 花海狮：(御三家Uncommon? 有点多，换别的) -> "dewgott" (小海狮进化?) No
            { "id": "vibrava", "min": 35 },     // 超音波幼虫
            
            // 钢系混居 (矿沙特色)
            "magnemite",      // 小磁怪：这沙子里铁粉太多，被吸住了！
            "cufant",         // 铜象：用鼻子吸金属沙
            "ferroseed",      // 种子铁球：扎脚神器 No.1
            "varoom",         // (Gen 9) 噗隆隆：被当成废金属丢在这的引擎怪 (Steel/Poison)
            
            // 传统的沙滩中坚
            "dwebble",        // 石居蟹
            "sandygast",      // 沙丘娃
            "staryu",         // 海星星
            "slowpoke",       // 呆呆兽
            { "id": "corsola", "min": 1 }       // 太阳珊瑚 (活体)
        ],

        // === Rare Pool: 财富象征与危险流沙 (Lv 30+) ===
        "rare": [
            // 黄金财宝系
            "gimmighoul",     // 索财灵(徒步)：在金沙里找金币 (Signature rare)
            "meowth_alola",   // 喵喵(阿罗拉)：高傲地在海边散步
            "sableye",        // 勾魂眼：这里的海星星全是红宝石核心，吸引了它
            "persian",        // 猫老大 (普通)：看场子的

            // 深度变异/强力种
            { "id": "dugtrio_alola", "min": 26 }, // 三地鼠(阿罗拉)：金色的头发非常华丽符合"Golden"
            { "id": "stunfisk_galar", "min": 1 }, // 泥巴鱼(伽勒尔)：完美的捕兽夹伪装
            
            // 深埋地下的巨大物体
            "onix",           // 大岩蛇：在地底深处穿行
            "orthworm"        // (Gen 9) 拖拖蚓：钢铁蚯蚓，正在吞噬这些金属废沙
        ],

        // === Boss Pool: 地质灾难与巨型海怪 (Lv 38-55) ===
        "boss": [
            // 沙漠/地面暴君
            { "id": "krookodile", "min": 45 },    // 流氓鳄：海岸霸主
            { "id": "excadrill", "min": 40 },     // 龙头地鼠：如果矿层太硬就靠它了
            { "id": "palossand", "min": 35 },     // 噬沙堡爷：吞噬一切的沙堡
            { "id": "flygon", "min": 48 },        // 沙漠蜻蜓：掀起沙暴(虽然这里是海边)

            // 科技/钢铁巨兽
            { "id": "copperajah", "min": 42 },    // 大王铜象
            { "id": "revavroom", "min": 40 },     // 普隆隆姆：暴走到沙滩上的非法改装车
            { "id": "orthworm", "min": 40 },      // 拖拖蚓 (Titan级大小)

            // 从海里爬上来的不可名状
            { "id": "kingler", "min": 32 },       // 巨钳蟹
            { "id": "barbaracle", "min": 39 },    // 龟足巨铠
            { "id": "drednaw", "min": 38 }        // 暴噬龟：性格暴躁
        ]
    },


    // === 2. 滨海观光大道与电车轨 (Pavement) ===
    // 繁忙的商业化道路，有水上电车的轨道
    // 生态位：城市共生动物、被钱吸引的、电器依附者
    "Pavement": {
        "common": [
            "meowth_alola",   // 喵喵(阿罗拉)：这里很富有，它们很喜欢辉光平原
            "meowth",         // 喵喵(普通)：为了抢地盘打架
            "murkrow",        // 黑暗鸦：偷游客闪亮的饰品
            "magnemite",      // 小磁怪：吸附在电车轨道上
            "voltorb",        // 霹雳电球：经常被误认为是精灵球垃圾
            "rattata_alola",  // 小拉达(阿罗拉)：城市底层
            "pidove",         // 豆豆鸽
            "skwovet"         // 贪心栗鼠
        ],

        "uncommon": [
            "porygon",        // 多边兽：N区数据溢出
            "rotom",          // 洛托姆：甚至还在想钻进电车里
            "electrike",      // 落雷兽：在轨道旁奔跑
            "cyclizar",       // 摩托蜥：有人在宽阔的大道上飙车
            "klefki",         // 钥圈儿：游客丢的钥匙也很多
            "trubbish",       // 破破袋：商业垃圾
            "plusle",         // 正电拍拍：啦啦队吉祥物
            "minun"           // 负电拍拍
        ],

        "rare": [
            "raichu_alola",   // 雷丘(阿罗拉)：极其罕见的稀有海滨冲浪者！这是这里的明星
            "pikachu",        // 皮卡丘：不用说了
            "ditto",          // 百变怪
            "persian_alola"   // 这里的猫老大吃得更好
        ],

        "boss": [
            { "id": "raichu_alola", "min": 40 }, // (作为Boss级出现，因为不能野外进化)
            { "id": "porygon2", "min": 35 },     // 多边兽II
            { "id": "electrode", "min": 35 },    // 顽皮雷弹：巨大的爆炸隐患
            { "id": "manectric", "min": 36 },    // 雷电兽
            { "id": "revavroom", "min": 40 }     // (Gen 9) 普隆隆姆：暴走族留下的引擎怪
        ]
    },


    // === 3. 大道旁的装饰性隔离带 (Standard_Grass) ===
    // 人工种植的耐旱草皮，为了美观修剪整齐
    // 生态位：小型啮齿电系、或是看起来很高级的宠
    "Standard_Grass": {
        "common": [
            "yungoos",        // 猫鼬少：在这里晒太阳
            "pachirisu",      // 帕奇利兹：可爱的电松鼠
            "togedemaru",     // 托戈德玛尔：避雷针
            "dedenne",        // 咚咚鼠
            "morpeko",        // 莫鲁贝可：饿了会抢游客食物
            "mareep",         // 咩利羊：静电羊
            "fletchling"      // 小箭雀
        ],

        "uncommon": [
            "yamper",         // 来电汪：作为深受喜爱的牧羊/宠物犬
            "glameow",        // 魅力喵
            "luxio",          // 勒克猫
            "flaaffy",        // 茸北北
            "staravia",       // 姆克鸟
            "manectric"       // No, save for boss/pavement -> "electrike"
        ],

        "rare": [
            "jolteon",        // 雷伊布：可能是被遗弃的高级宠，或者受N区雷之石辐射影响
            "pikachu",        // 皮卡丘
            "growlithe",      // 卡蒂狗
            "rockruff"        // 岩狗狗
        ],

        "boss": [
            { "id": "boltund", "min": 34 },    // 逐电犬
            { "id": "ampharos", "min": 38 },   // 电龙
            { "id": "luxray", "min": 42 },     // 伦琴猫：具有透视眼的猫王
            { "id": "gumshoos", "min": 35 }    // 猫鼬探长：像管理者一样巡视
        ]
    }
},
/* Zone: Radiant_Plains (The Neon Wilderness) */
/* Threat: Safe (City) -> Mid (Power Plants) */
/* Effect: Electric Terrains boost electric moves naturally here */

"Radiant_Plains": {

    /* Revision: Radiant_Plains - Pavement (City Center & High-Tech Living) */
    /* Theme: Cyberpunk Pets / Data Leaks / Neon Lights / Street Punk */
    "Pavement": {
        
        // === Common Pool: 霓虹灯下的原住民 ===
        "common": [
            // 第一梯队城市害兽 (更具霓虹特色)
            "meowth_alola",   // 喵喵(阿罗拉)：这里的夜王
            "rattata_alola",  // 小拉达(阿罗拉)
            "shroodle",       // (Gen 9) 滋汁鼹：性格像涂鸦艺术家一样，喜欢标地盘
            "tadbulb",        // (Gen 9) 光蚪仔：漂浮的红绿灯/灯泡，被霓虹城的电网吸引
            "pidove",         // 豆豆鸽
            "magnemite",      // 小磁怪：城市监视摄像头?
            "glameow",        // 魅力喵
            "purrloin",       // 扒手猫
            "skwovet",        // 贪心栗鼠
            "zigzagoon_galar",// 蛇纹熊(伽勒尔)：黑白朋克配色，非常符合N区摇滚乐的调性
            "bunnelby"        // 掘掘兔：翻垃圾桶好手
        ],

        // === Uncommon Pool: 功能性生物与伴侣 (Lv 18-30) ===
        "uncommon": [
            // 科技/电力寄生类
            "elekid",         // 电击怪：在这个充满插座的城市里太容易活了
            "voltorb",        // 霹雳电球：被伪装成广场上的球形装饰?
            "plusle",         // 正电拍拍：啦啦队/霓虹广告吉祥物
            "minun",          // 负电拍拍
            "togedemaru",     // 托戈德玛尔：避雷针鼠
            "rotom",          // 洛托姆：从大屏幕里溜出来的
            
            // 城市生活类
            "maschiff",       // (Gen 9) 偶叫獒：店铺的看门狗
            "cyclizar",       // (Gen 9) 摩托蜥：外卖与交通工具
            "porygon",        // 多边兽：广告Bug
            "trubbish",       // 破破袋
            "burmy_trash",    // 结草儿(垃圾蓑衣)：专门在城市里穿垃圾
            "sinistea",       // 来悲茶
            "smeargle",       // 图图犬：这里的街头涂鸦全是它们干的
            "furfrou"         // 多丽米亚：被Tony老师修剪过的贵族犬
        ],

        // === Rare Pool: 稀有数据遗物与朋克精神 (Lv 30+) ===
        "rare": [
            "toxel",          // (Gen 8) 毒电婴：又毒又电，只有在污染和高能并存的地方才有，也就是N区
            "porygon2",       // 多边兽II (升级版AI)
            "ditto",          // 百变怪
            "zorua",          // 索罗亚：都市传说的源头
            "eevee",          // 伊布 (由于光害严重，这里的伊布很难进化成月亮伊布，但也睡不著)
            "squawkabilly",   // (Gen 9) 怒鹦哥：四种颜色集齐了就是黑帮火拼
            "beldum",         // 铁哑铃：磁悬浮列车的某种副产物
            "varoom"          // (Gen 9) 噗隆隆：单独的引擎
        ],

        // === Boss Pool: 地下王者与摇滚巨星 (Lv 35-50) ===
        "boss": [
            // 统治级家养宠
            { "id": "persian_alola", "min": 32 }, // 猫老大(阿罗拉)：帮派教父
            { "id": "mabosstiff", "min": 35 },    // (Gen 9) 獒教父：真正的黑道大哥
            { "id": "stoutland", "min": 40 },     // 长毛狗
            { "id": "gumshoos", "min": 35 },      // 猫鼬探长

            // 甚至带有危险性的科技产物
            { "id": "toxtricity", "min": 40 },    // (Gen 8) 颤弦蝾螈：霓虹城的摇滚象征 (Low Key 或 Amped)
            { "id": "revavroom", "min": 40 },     // 普隆隆姆
            { "id": "magnezone", "min": 45 },     // 自爆磁怪：可能是暴走的城市浮空巡逻单位
            { "id": "obstagoon", "min": 40 },     // 堵拦熊：午夜拦路抢劫
            { "id": "klinklang", "min": 42 }      // 齿轮怪
        ]
    },



    // === 2. 人工发光草甸 (Synthetic_Turf / Standard_Grass) ===
    // 这里不是普通的草，空气中有静电，草叶可能会发荧光，像巨大的电路板
    // 生态位：食电生物、荧光生物、高速奔跑着
    "Synthetic_Turf": {
        "common": [
            // 电系占领了生态底层
            "pachirisu",      // 帕奇利兹：代替了普通松鼠
            "shinx",          // 小猫怪：在发光的草里躲着
            "mareep",         // 咩利羊：毛发摩擦起电
            "blitzle",        // 斑斑马：奔跑产生电流
            "plusle",         // 正电拍拍
            "minun",          // 负电拍拍
            "elekid",         // 电击怪：这里是最好的托儿所
            "voltorb",        // 霹雳电球
            "hoppip",         // 毽子草：虽然是草，但也被静电吸得到处飘
            "fletchling"      // 小箭雀
        ],
        "uncommon": [
            // 荧光植物与静电捕食者
            "volbeat",        // 电萤虫：配合城市灯光
            "illumise",       // 甜甜萤
            "luxio",          // {id, min:15} 勒克猫
            "flaaffy",        // {id, min:15} 茸北北
            "ponyta_galar",   // 小火马(伽勒尔)：虽然是超能，但这种发光的彩虹马很契合这里
            "jolteon",        // 雷伊布：受环境辐射影响进化?
            "charjabug",      // 虫电宝：就是地上的蓄电池
            "dedenne"         // 咚咚鼠：偷电设备
        ],
        "rare": [
            "pikachu",        // 皮卡丘：经典电老鼠
            "pikachu_alola",  // (No, Alola Raichu only) -> 换: "alcremie" 霜奶仙? No.
            "togedemaru",     // 托戈德玛尔
            "raichu",         // 雷丘
            "pawmi",          // (Gen 9) 布拨
            "pawmo"           // 布土拨
        ],
        "boss": [
            { "id": "luxray", "min": 40 },       // 伦琴猫：平原的王
            { "id": "zebstrika", "min": 36 },    // 雷电斑马：闪电般的速度
            { "id": "ampharos", "min": 38 },     // 电龙
            { "id": "pawmot", "min": 42 },       // 巴布土拨：蓄电池复活者
            { "id": "manectric", "min": 35 }     // 雷电兽
        ]
    },


        /* Revision: Radiant_Plains - Standard_Grass (Urban Outskirts & Green Belt) */
    /* Theme: Static Field / Fast Runners / Light-Attracted Bugs */
    "Standard_Grass": {
        
        // === Common Pool: 城市边缘的居民 (Base Stage) ===
        // 这里比市中心更野一点，但也满是静电
        "common": [
            // 电力/静电组
            "shinx",          // 小猫怪：平原上最经典的电系幼崽
            "blitzle",        // 斑斑马：只有大平原才够它跑
            "mareep",         // 咩利羊：毛发因静电而蓬松
            "pachirisu",      // 帕奇利兹：在输电塔附近的树上
            "pawmi",          // (Gen 9) 布拨：在草丛里摩擦放电
            "elekid",         // 电击怪
            "yamper",         // 来电汪：会追着电车跑

            // 顽强的一般/草系
            "bunnelby",       // 掘掘兔：在电力塔下面挖洞
            "skwovet",        // 贪心栗鼠：哪里都有
            "lillipup",       // 哈约克：比城里的更野一点
            "fletchling",     // 小箭雀
            "deerling",       // 四季鹿 (在这个电气平原可能呈现为不一样的色泽?)
            "hoppip",         // 毽子草：被电扇或气流吹来吹去
            "oddish",         // 走路草：经典的边缘杂草
            "budew"           // 含羞苞
        ],

        // === Uncommon Pool: 进化的中坚力量 (Lv 15-30) ===
        "uncommon": [
            // 电气进化链
            { "id": "luxio", "min": 15 },       // 勒克猫：开始有了指甲，也会咬断电线
            { "id": "flaaffy", "min": 15 },     // 茸北北：粉色的羊在荧光草地上很显眼
            { "id": "electrike", "min": 18 },   // 落雷兽：奔跑产生绿色静电
            { "id": "pawmo", "min": 18 },       // 布土拨：学会了甚至格斗技
            { "id": "pikachu", "min": 10 },     // 皮卡丘：野生的，比起城里更难抓
            { "id": "tadbulb", "min": 10 },     // 光蚪仔：在潮湿的或者带电的草窝里发光

            // 趋光昆虫 & 适应者
            "volbeat",        // 电萤虫：成群结队模拟城市的霓虹
            "illumise",       // 甜甜萤
            "joltik",         // 电电虫：虽然小但电压高
            "ledian",         // 安瓢虫 (夜晚发光)，虽然弱但很美
            "roselia",        // 毒蔷薇：在工厂排水沟边的花更艳丽
            { "id": "herdier", "min": 16 },     // 哈约克
            { "id": "diggersby", "min": 20 }    // 掘地兔：耳朵很有力
        ],

        // === Rare Pool: 高性能生物 (Lv 25+) ===
        "rare": [
            // 需要一点运气
            "jolteon",        // 雷伊布：受强辐射进化
            "scyther",        // 飞天螳螂：在这也能看得到，收割电路草?
            "togedemaru",     // 托戈德玛尔：引雷针
            "dedenne",        // 咚咚鼠：偷电大盗
            "girafarig",      // 麒麟奇：超能属性让其能感知电波
            "tauros_paldea",  // (Gen 9) 肯泰罗(斗战种)：脾气暴躁
            
            // 稀有进化
            { "id": "raichu", "min": 30 },      // 雷丘：这下是真的稀有
            { "id": "luxray", "min": 30 },      // 伦琴猫 (Rare spawn before boss)
            { "id": "kadabra", "min": 25 }      // 勇基拉：折弯平原上的传输勺子? -- N区的超能属性暗示
        ],

        // === Boss Pool: 雷暴的化身 (Lv 35-55) ===
        // 在广阔平原上呼唤雷电的存在
        "boss": [
            { "id": "zebstrika", "min": 35 },   // 雷电斑马：冲锋起来无人能挡
            { "id": "manectric", "min": 36 },   // 雷电兽：通过落雷来补充体力
            { "id": "boltund", "min": 34 },     // 逐电犬：当它咆哮时整个区域都会停电
            { "id": "ampharos", "min": 40 },    // 电龙：其尾巴的光能传达通过整个平原
            { "id": "galvantula", "min": 36 },  // 电蜘蛛 z: 在高压线塔上结网
            { "id": "pawmot", "min": 40 },      // 巴布土拨 (需要Let's Go模式进化，野外直接遇到就是赚)
            { "id": "bellibolt", "min": 38 }    // (Gen 9) 电肚蛙：超级耐打的凸透镜青蛙
        ]
    },


    /* Revision: Radiant_Plains - The Industrial Complex */
    /* Access: Danger - Authorized Personnel Only (Or sneaky trainers) */

    // === 3-A. 高压输电塔与变电站核心 (High_Voltage) ===
    // 覆盖着巨大的变压器和特斯拉线圈，嗡嗡声震耳欲聋。
    // 生态位：磁悬浮生命、电池、并在电线中穿梭的数据体
    "High_Voltage": {
        "common": [
            // 电力/磁力基础
            "magnemite",      // 小磁怪：这地方没有它就不成立，甚至负责维护设施
            "voltorb",        // 霹雳电球：滚来滚去的易爆物
            "togedemaru",     // 托戈德玛尔：充当了可以移动的避雷针
            "elekid",         // 电击怪：在变压器后面吸奶嘴（吸电）
            "tynamo",         // 麻麻小鱼：在强磁场中像鱼一样漂浮
            "pachirisu",      // 帕奇利兹：虽然也常见于草甸，但这只明显电力更猛
            "wattrel",        // 电海燕：在最高的信号塔上筑巢
            "joltik",         // 电电虫：寄生在电表箱
            "dedenne"         // 咚咚鼠：窃电老鼠
        ],

        "uncommon": [
            // 进化的带电体 (Lv 20-35)
            "magneton",       // 三合一磁怪：为了更强的磁场3合1
            "charjabug",      // 虫电宝：就是这里产出的“蓄电池”
            "pikachu",        // 皮卡丘：(工业区版，更加暴躁)
            { "id": "rotom", "min": 1 },        // 洛托姆：即使不进机器，也在电缆里狂欢
            { "id": "electrode", "min": 30 },   // 顽皮雷弹：巨大的自毁隐患
            { "id": "luxio", "min": 18 },       // 勒克猫：因为能用透视眼检查电路故障，被工人喂养
            { "id": "raichu", "min": 1 },       // 雷丘：需要大量电力维持巨大化体型??(No, just energetic)
            "clinch"          // (Typo?) -> "chinchou" 灯笼鱼? 不, "klink" (齿轮儿)
        ],

        "rare": [
            "rotom_fan",      // 洛托姆(风扇)：在冷却塔附近
            "porygon",        // 多边兽：中控系统里的杀毒程序
            "helioptile",     // 伞电蜥：光伏发电设备周围
            "pincurchin",     // 啪嚓海胆：在冷却水池依然通电的地方
            "beldum",         // 铁哑铃：被变电站巨大的电磁铁吸过来的
            
            // 稀有的毒/电混合
            "toxel",          // 毒电婴：又是N区特产，废液与电力的结晶
            { "id": "electabuzz", "min": 30 }   // 电击兽：这里是它们的主场
        ],

        "boss": [
            // 电网的守护神/灾难 (Lv 40-55)
            { "id": "magnezone", "min": 45 },   // 自爆磁怪：空中指挥官
            { "id": "electivire", "min": 50 },  // 电击魔兽：吸收整个电厂的电量
            { "id": "eelektross", "min": 45 },  // 麻麻鳗鱼王：无弱点的飘浮者
            { "id": "ampharos", "min": 35 },    // 电龙 (Mega级能量)
            { "id": "bellibolt", "min": 38 },   // (Gen 9) 电肚蛙：超级耐打的凸透镜青蛙发电机
            { "id": "rotom_heat", "min": 1 },   // 洛托姆(微波炉)：过载加热
            { "id": "toxtricity", "min": 40 }   // 颤弦蝾螈 (Amped Form / 高调样子)
        ]
    },


    // === 3-B. 机械轰鸣的重工业与冶炼厂 (Industrial) ===
    // 烟囱林立，传送带交错，充满了金属撞击声与化学废渣处理池。
    // 生态位：食铁生物、垃圾处理者、劳动力、刚系/毒系
    "Industrial": {
        "common": [
            // 零件与金属
            "klink",          // 齿轮儿：真正的工业齿轮
            "aron",           // 可可多拉：这里是自助餐厅，到处都能吃铁
            "magnemite",      // 小磁怪：(共通种)
            "meowth_galar",   // 喵喵(伽勒尔)：浑身是铁毛而且也是战斗民族
            "cufant",         // 铜象：帮助搬运重物的，且防腐蚀
            "drilbur",        // 螺钉地鼠：在混凝土下钻洞
            "alolan_diglett", // 地鼠(阿罗拉)：能钻透混凝土地基的钢头
            
            // 废料处理者
            "koffing",        // 瓦斯弹：在烟囱口开派对
            "grimer_alola",   // 臭泥(阿罗拉)：处理化学泄漏
            "bronzor",        // 铜镜怪：古董还是废铁？
            "slugma"          // 熔岩虫：如果有像炼钢炉那样的高温区
        ],

        "uncommon": [
            // 进化的机械与工头
            "klang",          // 齿轮组
            "lairon",         // 可可多拉 (更厚的三餐)
            "orthworm",       // (Gen 9) 拖拖蚓：从地下管道里钻出来的身子
            "varoom",         // (Gen 9) 噗隆隆：被丢弃的引擎活化了
            "pawniard",       // 驹刀小兵：像流氓一样切断废料
            "metang",         // 金属怪
            "tinkatink",      // (Gen 9) 小锻匠：来这里“进货”废铁，升级它的锤子 (非常合理!)
            
            // 劳动力
            { "id": "machoke", "min": 28 },     // 豪力
            { "id": "gurdurr", "min": 25 },     // 铁骨土人
            { "id": "coalossal", "min": 34 }    // 巨炭山 (Pre-evo Rolycoly, 但巨炭山能当锅炉) -> "carkol" 这里的矿车
        ],

        "rare": [
            "scyther",        // (这里出现的应该是 Kleavor 的石头形态? No, Scizor 需要金属膜，这里天然产出) -> "scizor" 巨钳螳螂 (Rare/Wild)
            { "id": "steelix", "min": 40 },     // 大钢蛇：偶尔把工厂地基掀翻
            "duraludon",      // 铝钢龙：简直就是长成工厂的样子
            "beldum",         // 铁哑铃
            "skarmory",       // 盔甲鸟：把巢穴筑在废金属堆上
            "meltan"          // 美录坦：(极稀有彩蛋! 吃螺母的幻之宝可梦)
        ],

        "boss": [
            // 工业的顶点 / 污染之源
            { "id": "klinklang", "min": 45 },   // 齿轮怪：永动核心
            { "id": "aggron", "min": 42 },      // 波士可多拉：领地意识极强
            { "id": "weezing_galar", "min": 40 }, // 双弹瓦斯(伽勒尔)：它在净化这些烟雾！它是好的！
            { "id": "copperajah", "min": 45 },  // 大王铜象：起重机级别
            { "id": "revavroom", "min": 40 },   // 普隆隆姆
            { "id": "tinkaton", "min": 38 },    // (Gen 9) 巨锻匠：用最暴力的手段狩猎别的钢系 Boss
            { "id": "conkeldurr", "min": 45 },  // 修建老匠
            { "id": "metagross", "min": 50 }    // 巨金怪：超级计算机
        ]
    },
    // === 4. 北部贫民窟边缘路面 (Slum_Pavement) ===
    // 接近 S 区边界，路面破损，灯光昏暗，有更多垃圾
    // 生态位：恶系、盗窃者、垃圾处理、不受欢迎的老鼠
    "Slum_Pavement": {
        "common": [
            "rattata_alola",  // 阿罗拉小拉达
            "raticate_alola", // 阿罗拉拉达：肥胖的恶霸
            "grimer",         // 普通臭泥：不仅没变成彩色，反而更脏了
            "trubbish",       // 破破袋
            "poochyena",      // 土狼犬：野压迫感的流浪狗
            "murkrow",        // 黑暗鸦
            "nickit",         // (Gen 8) 偷儿狐
            "houndour",       // 戴鲁比
            "zubat"           // 超音蝠
        ],
        "uncommon": [
            "scraggy",        // 滑滑小子：街头混混
            "krokorok",       // 混混鳄
            "morgrem",        // 诈唬魔
            "sneasel",        // 狃拉：半夜划车漆
            "mightyena",      // 大狼犬
            "thiefhul"        // No -> "thievul" 狐大盗
        ],
        "rare": [
            "umbreon",        // 月亮伊布：在贫民窟屋顶注视着一切的暗影
            "absol",          // 阿勃梭鲁：预感这里只要出事就是大事
            "spiritomb",      // 花岩怪 (可能作为某个古老基石的封印，极其罕见) -> 改为 "sableye" 勾魂眼
            "pawniard"        // 驹刀小兵：带刀的
        ],
        "boss": [
            { "id": "obstagoon", "min": 40 },    // 堵拦熊：此路不通
            { "id": "scrafty", "min": 36 },      // 头巾混混：帮派老大
            { "id": "houndoom", "min": 38 },     // 黑鲁加
            { "id": "honchkrow", "min": 40 },    // 乌鸦头头
            { "id": "garbodor", "min": 35 }      // 灰尘山：垃圾也是有尊严的
        ]
    },


    // === 5. 市中心公园景观湖 (Fresh_Water) ===
    // 干净、经过过滤的人工淡水湖，有很多天鹅船，或者纯粹的观赏鱼
    // 生态位：优雅的水鸟、观赏鱼
    "Fresh_Water": {
        "common": [
            "ducklett",       // 鸭宝宝：公園湖标配
            "swanna",         // 舞天鹅
            "goldeen",        // 角金鱼
            "magikarp",       // 鲤鱼王
            "lotad",          // 莲叶童子
            "surskit",        // 溜溜糖球
            "cramorant"       // (Gen 8) 古月鸟：呆呆地吞除了鱼以外的东西
        ],
        "uncommon": [
            "psyduck",        // 可达鸭：偏头痛
            "slowpoke",       // 呆呆兽
            "buizel",         // 泳圈鼬 (因为它自带泳圈，甚至像救生员)
            "poliwag",        // 蚊香蝌蚪
            "wooper"          // 乌波
        ],
        "rare": [
            "feebas",         // 笨笨鱼 (想在人造湖里养美纳斯也是想多了)
            "golduck",        // 哥达鸭
             "lapras",        // 拉普拉斯 (极其罕见的从海闸门进来的，如果遇到就像尼斯湖水怪一样)
             "dratini"        // 迷你龙
        ],
        "boss": [
            { "id": "gyarados", "min": 30 },     // 暴鲤龙：有人把鲤鱼王养大了没人管，变成了湖里的祸害
            { "id": "golduck", "min": 32 },      // 哥达鸭
            { "id": "vaporeon", "min": 30 }      // 水伊布：完全适应了城市水质
        ]
    },
    // === 3-C. 几何排列的人工防风林/行道树 (Light_Forest) ===
    // 树木排列得非常整齐，可能是为了这遮挡丑陋的输电塔，也可能是为了美化光辉市。
    // 土壤干燥，树上常常挂着电线和监控摄像头。
    // 生态位：树栖电系、喜欢躲藏的恶霸、负责修剪树木的虫系
    "Light_Forest": {
        
        // === Common Pool: 树上的噪音制造者 & 公园常客 ===
        "common": [
            // 电与树的结合
            "pachirisu",      // 帕奇利兹：由于没有自然中空的树洞，只能在高压箱附近筑巢
            "emolga",         // 电飞鼠：利用高楼间的风滑翔
            "joltik",         // 电电虫：体型极小，吸附在树干的线路接口上
            "wattrel",        // 电海燕：在树顶休息
            
            // 城市破坏者/适应者
            "shroodle",       // (Gen 9) 滋汁鼹：喜欢在树干上涂涂画画（剧毒涂鸦）
            "aipom",          // 长尾怪手：偷行人的帽子然后跑回树上
            "burmy",          // 结草儿 (垃圾蓑衣/砂土蓑衣)：这里的材料只有垃圾
            "pidove",         // 豆豆鸽：城市树木标配
            "hoothoot",       // 咕咕：精准报时的生物钟
            "pineco",         // 榛果球：小心，撞到树它会炸
            "seedot"          // 橡实果
        ],

        // === Uncommon Pool: 园林维护者与暗处窥视者 (Lv 20-30) ===
        "uncommon": [
            // 负责（或者破坏）园林的
            "scyther",        // 飞天螳螂：虽然是虫，但也常常被当作园丁（不论自愿与否）
            { "id": "rotom_mow", "min": 1 }, // 洛托姆(割草机)：从工具房跑出来的
            "kricketune",     // 音箱普：在人工林里演奏小提琴
            "leavanny",       // 保姆虫：缝补落叶
            "nuzleaf",        // 长鼻叶：喜欢这种有人造风的地方
            "morpeko",        // 莫鲁贝可：饿着肚子在树下等吃的
            "venonat",        // 毛球：被远处N区的强光吸引
            
            // 进化的城市居民
            { "id": "grafaiai", "min": 28 }, // (Gen 9) 指绘雷猴：把整片树林画得乱七八糟的艺术家，剧毒且领地意识强
            { "id": "noctowl", "min": 20 },  // 猫头夜鹰
            { "id": "trumbeak", "min": 14 }  // 喇叭啄鸟
        ],

        // === Rare Pool: 稀有拟态与彩蛋 (Lv 25+) ===
        "rare": [
            // 拟态成“树”的东西
            { "id": "sudowoodo", "min": 1 }, // 树才怪：在这个本来就很假的树林里，它显得更真了
            "bonsly",         // 盆才怪
            "xurkitree",      // (Ultra Rare/Easter Egg) 电束木：如果是极高威胁度...看起来就像一捆电线或者树?? (作为Ultra Beast, 0.01%) - 
            // 换成现实点的:
            "electabuzz",     // 电击兽：像人一样靠在树边
            "jolteon",        // 雷伊布
            "heracross"       // 赫拉克罗斯
        ],

        // === Boss Pool: 林地守护者 (Lv 35-50) ===
        "boss": [
            { "id": "galvantula", "min": 36 },  // 电蜘蛛：用带电的网封锁树与树之间的空陈空间
            { "id": "ambipom", "min": 32 },     // 双尾怪手
            { "id": "arboliva", "min": 35 },    // (Gen 9) 奥利瓦：橄榄树，产出油脂，非常符合这种“农业/食用/景观”的人工林设定
            { "id": "scizor", "min": 40 },      // 巨钳螳螂：红色的钢铁身躯在夜晚的霓虹反光下很酷
            { "id": "trevenant", "min": 40 }    // 朽木妖：如果是用老旧且因为污染死去的树木造的林子...
        ]
    },
    // === 4. 远离城市的凶猛荒野 (High_Grass) ===
    // 到处是甚至会割伤皮肤的带电长草，风势很大，隐蔽性强。
    // 这里虽属于N区，但充满了“狂野西部”或“非洲大草原”的蛮荒感。
    // 生态位：伏击捕食者、利用草从掩护的快跑手、地面系（电系杀手）
    "High_Grass": {
        
        // === Common Pool: 藏在深草里的危险分贝 ===
        "common": [
            // 电系伏击者
            "manectric",      // (Pre-evo?) -> electrike 落雷兽
            "blitzle",        // 斑斑马：只有高草能藏住它们跳动的闪电
            "luxio",          // (Common?) -> Shinx 小猫怪 (Luxio放Uncommon比较好)
            "joltik",         // 电电虫：如果你走进草丛被叮了，就是它
            "pachirisu",      // 帕奇利兹
            "pawmi",          // 布拨
            
            // 草原基础款
            "bouffalant",     // 爆炸头水牛：(这才是平原应该有的Common!) 脾气暴躁，横冲直撞
            "tauros_paldea",  // (Gen 9) 肯泰罗(斗战种/水澜/火炽?): 默认格斗种，在平原决斗
            "girafarig",      // 麒麟奇：高个子适合在深草探头
            "nincada",        // 土居忍士：地面+虫，不怕电的虫子
            "bunnelby",       // 掘掘兔
            "patrat",         // 探探鼠：站起来看有没有掠食者
            "venonat"         // 毛球
        ],

        // === Uncommon Pool: 熟练的猎手 (Lv 20-35) ===
        "uncommon": [
            // 地面系掠食者 (Ground Type - N区野外的平衡者)
            { "id": "diggersby", "min": 20 },   // 掘地兔：耳朵不仅能挖土，更能打
            { "id": "mudbray", "min": 17 },     // 泥驴仔
            { "id": "gabite", "min": 24 },      // 尖牙陆鲨：被这里“隐藏在草里的东西”吸引（龙/地），它是电系杀手
            { "id": "vibrava", "min": 35 },     // 超音波幼虫
            { "id": "golett", "min": 1 },       // 泥偶小人 (远古守卫遗留?)

            // 电气上位种
            { "id": "luxio", "min": 15 },       // 勒克猫：群体行动
            { "id": "zebstrika", "min": 27 },   // 雷电斑马：如果你看到黑影一闪而过
            { "id": "helioptile", "min": 1 },   // 伞电蜥
            { "id": "pikachu", "min": 10 },     // 皮卡丘 (愤怒)
            { "id": "eelektrik", "min": 39 },   // 麻麻鳗：漂浮在草上，没有弱点

            // 高草割草机
            "scyther",        // 飞天螳螂：切割干燥的硬草
            "zangoose",       // 猫鼬斩：经典的草丛斗士，它的爪子对抗这里硬皮的怪很有用
            "seviper"         // 饭匙蛇
        ],

        // === Rare Pool: 野性呼唤 (Lv 30+) ===
        "rare": [
            // 电气猛兽
            "electabuzz",     // 电击兽：像鬼神一样突然出现
            "toxel",          // 毒电婴 (可能父母在附近)
            "pincurchin",     // 啪嚓海胆 (为什么在陆地? 可能是被鸟丢下来的，或者适应了陆地High Grass) - 可作为彩蛋
            "toedscool",      // 原野水母 (Gen 9)：草/地属性，完美克制纯电系环境，跑得快
            "raichu",         // 雷丘
            
            // 龙与巨兽
            "sliver",         // (Typo?) -> "sliggoo" (Hisui/Normal?) or "axew" 牙牙
            "fraxure",        // 斧牙龙：磨利了牙齿
            "drapion"         // 龙王蝎：偶尔从隔壁沙漠/工业区爬过来的捕猎者
        ],

        // === Boss Pool: 平原霸主 (Lv 40-55) ===
        // 遇到它们请绕道，这是真正的野外
        "boss": [
            { "id": "luxray", "min": 40 },      // 伦琴猫：具有穿透高草的视力 `Intimidate`
            { "id": "zebstrika", "min": 40 },   // 雷电斑马 (Alpha级速度)
            { "id": "bouffalant", "min": 45 },  // 爆炸头水牛 (野牛王)：如果你有一件红衣服... 完蛋
            { "id": "mudsdale", "min": 35 },    // 重泥挽马：踢碎一切电系
            { "id": "krookodile", "min": 40 },  // 流氓鳄 (Ground/Dark)：免疫超能和电，这里的顶级掠食者
            { "id": "galvantula", "min": 36 },  // 电蜘蛛：设置了巨大的电网陷阱
            { "id": "toxtricity", "min": 40 },  // 颤弦蝾螈 (Low Key / 低调)：藏在深草里的毒瘤
            { "id": "haxorus", "min": 48 }      // 双斧战龙：它不在乎你是电还是刚才，一刀两断
        ]
    }
},
/* Zone: Cinder_Moor (The Smoldering Wasteland) */
/* Threat: Safe (10%) -> Low (60%) -> Mid (30%) */
/* Weather: Smog / Ashfall / Overcast */

"Cinder_Moor": {

    // === 1. 中立设施小鎮 / 铁灰镇中心 (Pavement) ===
    // 算是S区唯一的安全区，有宝可梦中心和霓虹灯招牌，主要是玛俐的粉丝团在维护。
    // 生态位：摇滚/朋克风格的宠物、稍微有些坏心眼但有个性的伴侣
    "Pavement": {
        "common": [
            "morpeko",        // 莫鲁贝可：玛俐的招牌，肯定满大街流浪找吃的
            "zigzagoon_galar",// 蛇纹熊(伽勒尔)：这里是它们的摇滚天堂
            "nickit",         // 偷儿狐：狡猾但可爱的小偷
            "meowth_galar",   // 喵喵(伽勒尔)：比起钱更喜欢战斗
            "poochyena",      // 土狼犬：虽然脸凶但其实很忠诚
            "grimer_alola",   // 臭泥(阿罗拉)：在镇子里被当做垃圾处理机喂养
            "trubbish",       // 破破袋
            "pidove"          // 豆豆鸽 (不仅不怕烟熏，羽毛都灰了)
        ],

        "uncommon": [
            "toxel",          // 毒电婴：又是一个很朋克的宝宝
            "scraggy",        // 滑滑小子：街头嘻哈风格
            "snubbull",       // 布鲁：丑萌的看门狗
            "stufful",        // 童偶熊：虽然在Z区也有，但这里的可能有些脏脏的
            "litleo",         // 小狮狮：只有在温暖的路灯下能看到
            "impdimp",        // 捣蛋小妖：恶作剧专家
            "thievul",        // 狐大盗
            { "id": "linoone_galar", "min": 25 } // 直冲熊(伽勒尔)
        ],

        "rare": [
            "umbreon",        // 月亮伊布：非常契合这里的黑夜氛围
            "sylveon",        // (只有亲密度极高才能获得，玛俐作为偶像的彩蛋?)
            "furfrou",        // 多丽米亚：(可能是做成了朋克或者绅士造型)
            "ditto"           // 百变怪
        ],

        "boss": [
            // 能够罩住场子的地头蛇
            { "id": "grimmsnarl", "min": 45 },  // 长毛巨魔：镇长的保镖级别
            { "id": "obstagoon", "min": 40 },   // 堵拦熊：在此为了甚至可以开演唱会
            { "id": "toxtricity", "min": 40 },  // 颤弦蝾螈 (Low Key / 蝾螈样子)
            { "id": "granbull", "min": 32 }     // 布鲁皇
        ]
    },


    // === 2. 广阔的贫民窟/旧城区废墟 (Slum_Pavement) ===
    // 覆盖了余烬荒原的大部分地表。生锈的集装箱迷宫、断裂的沥青路、化工厂排放口。
    // 生态位：食腐动物、帮派宝可梦、甚至是有害的城市幽灵
    "Slum_Pavement": {
        
        // === Common Pool: 阴沟里的数量级 (Base Stage) ===
        "common": [
            // 传统的城市害兽
            "rattata",        // 小拉达(关都)：纯粹的数量优势
            "rattata_alola",  // 小拉达(阿罗拉)：在满是油污的夜里活动
            "zubat",          // 超音蝠：从下水道入口飞出
            "trubbish",       // 破破袋：如果你不仔细看，那里全是破破袋
            "grimer",         // 臭泥(普通)：这里的没有阿罗拉那种彩色，就是纯粹的烂泥
            "munna",          // 食梦梦：它们喜欢飘荡在噩梦丛生的贫民窟吸食梦境
            "koffing",        // 瓦斯弹：只要有裂缝冒烟，就有它们
            "patrat",         // 探探鼠
            "purrloin",       // 扒手猫：眼睛发光的谋略家
            "glameow",        // 魅力喵
            "venipede",       // 百足蜈蚣：在潮湿阴暗的角落
            "shroodle",       // (Gen 9) 滋汁鼹：喜欢在集装箱上留下有毒的涂鸦标记
            "poochyena",      // 土狼犬：成群结队也会有威胁
            "spinarak",       // 圆丝蛛：把网结在废墟之间
            "murkrow"         // 黑暗鸦
        ],

        // === Uncommon Pool: 街头暴徒与流浪者 (Lv 22-35) ===
        "uncommon": [
            // 初级打手/混混 (Min Lvl Entry)
            { "id": "scraggy", "min": 15 },     // 滑滑小子：总是提着裤子找人打架
            { "id": "croagunk", "min": 15 },    // 不良蛙：手指有毒
            { "id": "mankey", "min": 15 },      // 猴怪：路怒症
            { "id": "houndour", "min": 15 },    // 戴鲁比：为了对抗毒气，S区的狗学会了火系
            { "id": "sneasel", "min": 20 },     // 狃拉(普通)：喜欢偷鸟蛋
            
            // 进化的城市生态
            { "id": "raticate", "min": 20 },    // 拉达：体型巨大，甚至能咬断铁丝网
            { "id": "raticate_alola", "min": 20 }, // 拉达(阿罗拉)：真正的黑帮胖子
            { "id": "persian_alola", "min": 28 }, // 猫老大(阿罗拉)：这里的老大
            { "id": "liepard", "min": 20 },     // 酷豹：寂静的暗影
            { "id": "watchog", "min": 20 },     // 步哨鼠
            { "id": "seviper", "min": 1 },      // 饭匙蛇：在金属管道里穿梭 (无进化，直出)
            { "id": "garbodor", "min": 36 },    // 灰尘山：巨大的以至于卡在了巷子里
            
            // 贫民窟的新住客
            "maschiff",       // 偶叫獒：看起来很凶但其实在找吃的
            "bombirdier",     // (Gen 9) 下石鸟：喜欢往路人头上扔也是垃圾
            "impdimp",        // 捣蛋小妖
            "nickit"          // 偷儿狐
        ],

        // === Rare Pool: 充满怨念的遗弃物 (Lv 30+) ===
        "rare": [
            // 幽灵与被遗忘者
            "banette",        // 诅咒娃娃：被丢弃在垃圾堆里的玩偶复活了
            "mimikyu",        // 谜拟Q：用破布伪装自己
            "shuppet",        // 怨影娃娃
            "yamask",         // 哭哭面具：可能依附在古董碎片上
            "gastly",         // 鬼斯
            { "id": "haunter", "min": 25 },     // 鬼斯通
            
            // 危险的高级毒/恶
            "zorua",          // 索罗亚
            "skorupi",        // 钳尾蝎
            "salandit",       // 夜盗火蜥：这里的地面裂缝有热气
            "varoom",         // 噗隆隆：发动机的声音
            "spiritomb",      // 花岩怪：罕见的被封印在镇痛石里的... (0.1% Rare)
            
            // 龙?!
            { "id": "zweilous", "min": 50 }     // 双首龙：盲目的破坏力，因为太危险被赶到了这里
        ],

        // === Boss Pool: 地下社会的土皇帝 (Lv 40-60) ===
        // 在这混乱街区制定规则的顶级掠食者
        "boss": [
            // 帮派领袖
            { "id": "honchkrow", "min": 40 },   // 乌鸦头头：教父级
            { "id": "obstagoon", "min": 40 },   // 堵拦熊：S 区的标志性路霸
            { "id": "grimmsnarl", "min": 42 },  // 长毛巨魔
            { "id": "pangoro", "min": 40 },     // 流氓熊猫
            { "id": "scrafty", "min": 39 },     // 头巾混混：它的领地就是那个街区
            { "id": "mabosstiff", "min": 38 },  // 獒教父：虽然老了但这是你的教父

            // 生化/环境灾难
            { "id": "muk", "min": 38 },         // 臭臭泥(普通)：这里的化学废料堆积成了山
            { "id": "weezing_galar", "min": 45 }, // 双弹瓦斯(伽勒尔)：巨大的净化烟囱
            { "id": "skuntank", "min": 38 },    // 坦克臭鼬
            { "id": "toxtricity", "min": 40 },  // 颤弦蝾螈 (Low Key / 低调)：在角落里弹贝斯
            { "id": "hydreigon", "min": 64 },   // 三首恶龙 (S区的末日传说)
            { "id": "salazzle", "min": 33 }     // 焰后蜥：拥有大量雄性夜盗火蜥的后宫
        ]
    },


    // === 3. 大地裂解的各种草地 (Standard_Grass / High_Grass) ===
    // 覆盖在碳渣和灰层上的植物。
    // West (Standard): 靠近护城河，相对较干净，有火系。
    // Inner (High): 更加荒凉，甚至有地底热气，毒系/火系混杂。
    "Standard_Grass": { 
        // 相对安全的缓冲区，靠近中枢
        "common": ["lillipup", "purrloin", "numel" /*呆火驼*/, "torkoal" /*煤炭龟*/, "vulpix", "machop" ], 
        "uncommon": ["growlithe", "houndour", "litleo", "flaaffy"],
        "boss": [{ "id": "arcanine", "min": 30 }] 
    },
    
    "High_Grass": {
        // 余烬荒原真正的荒野
        "common": [
            "stunky",         // 臭鼬噗
            "venipede",       // 百足蜈蚣 (爬虫)
            "nidoranm",       // 尼多朗 (毒刺)
            "nidoranf",       // 尼多兰
            "ekans",          // 阿柏蛇
            "poochyena",      // 土狼犬
            "numel",          // 呆火驼：背上冒着烟
            "magby",          // 鸭嘴宝宝：这里很热
            "slugma"          // 熔岩虫：如果有因为地热而融化的地方
        ],
        "uncommon": [
            "camerupt",       // 喷火驼
            "seviper",        // 饭匙蛇：完美的居住地 (Cinder Moor 和隔壁 High Grass 相连)
            "heatmor",        // 熔蚁兽：追猎钢系的虫子
            "salazzle",       // (Min lvl requirement usually female..) -> "salandit"
            "toxicroak",      // 毒骷蛙
            "scolipede",      // 蜈蚣王
            "skorupi"         // 钳尾蝎
        ],
        "rare": [
            "larvesta",       // 燃烧虫
            "turtonator",     // 爆焰龟兽
            "gliscor",        // 天蝎王
            "mimikyu"         // 谜拟Q: 破旧的布偶丢在荒草里
        ],
        "boss": [
            { "id": "centiskorch", "min": 40 }, // (Gen 8) 焚焰蚣：火与虫的结合，如同燃烧的余烬
            { "id": "drapion", "min": 40 },     // 龙王蝎
            { "id": "nidoking", "min": 45 },    // 尼多王
            { "id": "incineroar", "min": 50 }   // 炽焰咆哮虎：如果是作为野外Boss，这种擂台反派风格非常搭配S区
        ]
    },


    // === 4. 碳渣黑海滩 (Coastal_Sand) ===
    // 看起来像煤灰一样的沙滩，可能有石油泄露感，连接着被污染的海水
    // 生态位：毒/水、被冲上岸的残骸
    "Coastal_Sand": {
        "common": [
            "grimer_alola",   // 臭泥（阿罗拉）：清理黑色的油污潮位线
            "mareanie",       // 坏星：非常痛
            "tentacool",      // 玛瑙水母
            "wingull",        // 长翅鸥
            "sandile",        // 黑眼鳄：保护色完美，趴在黑沙上看不见
            "shellos"         // 无壳海兔
        ],
        "uncommon": [
            "qwilfish",       // 千针鱼
            "qwilfish_hisui", // 千针鱼(洗翠)：恶/毒属性，太那个了。这这里作为近代变种出现很合适
            "skrelp",         // 垃垃藻
            "palossand",      // (Black variant logic?) 噬沙堡爷
            "carkol"          // 大炭车：真的来海边拉那些大概是煤矿的东西
        ],
        "rare": [
            "guzzlord",       // (Ultra Beast? NO. Easter egg only) -> 换成 "overqwil"
            "overqwil",       // (Gen 8 Hisui) 万针鱼：极其凶恶
            "toxapex"
        ],
        "boss": [
            { "id": "muk_alola", "min": 38 },   // 臭臭泥(阿罗拉)
            { "id": "krookodile", "min": 40 },  // 流氓鳄
            { "id": "garbodor", "min": 40 }     // 灰尘山(极巨状态的残留?)
        ]
    },


    // === 5. 南部仍在运作的非法/高危工厂区 (Industrial) ===
    // 充满煤灰、高炉温度、以及并没有通过环保检测的黑烟囱。
    // 这是一片不需要用电，而是用火烧出来的黑色工厂。
    // 生态位：固体燃料生物、耐高热的钢铁、被锁链束缚的劳工
    "Industrial": {
        
        // === Common Pool: 燃料与炉渣 (基础生态) ===
        "common": [
            // 煤炭/火焰核心
            "rolycoly",       // 小炭仔：遍地都是，甚至是燃料来源
            "charcadet",      // (Gen 9) 炭小侍：诞生于黑煤灰中，这里是它们的温床
            "torkoal",        // 煤炭龟：移动的小型锅炉，整个工厂都很热
            "slugma",         // 熔岩虫：在排渣口爬行
            "litwick",        // 烛光灵：以微弱的生命力为食，在废弃厂房飘荡
            "vulpix",         // 六尾：如果你运气好，能在温暖的管道旁发现
            
            // 肮脏的金属/部件
            "klink",          // 齿轮儿：这里的齿轮都是带油污和铁锈的
            "magnemite",      // 小磁怪：甚至有些螺丝松了
            "bronzor",        // 铜镜怪：被抛弃的古董金属板
            "meowth_galar",   // 喵喵(伽勒尔)：浑身是铁毛，非常野蛮也是优秀的监工
            
            // 毒气/烟雾
            "koffing",        // 瓦斯弹：在烟囱口开派对
            "grimer",         // 臭泥（普通/关都）：黑色的油污泥
            "timburr"         // 搬运小匠：搬运煤炭的实习生
        ],

        // === Uncommon Pool: 熟练工与燃烧者 (Lv 22-35) ===
        "uncommon": [
            // 重体力劳动者
            { "id": "gurdurr", "min": 25 },     // 铁骨土人：拿着钢筋到处走
            { "id": "machoke", "min": 28 },     // 豪力：这里的豪力可能身上有黑印子
            { "id": "carkol", "min": 18 },      // 大炭车：矿坑车的活体化
            { "id": "cufant", "min": 20 },      // 铜象
            
            // 高热/引擎生物
            "magmar",         // 鸭嘴火兽：甚至喜欢接近高炉
            "numel",          // 呆火驼
            "varoom",         // (Gen 9) 噗隆隆：吃石头和废铁的引擎怪
            "houndour",       // 戴鲁比：工厂看门狗
            "sizzlipede",     // 烧火螟：藏在散热器坏掉的地方
            "heatmor",        // 熔蚁兽：在这里依然寻找铁蚁（尽管这里铁蚁是除锈后的）
            
            // 腐蚀与锈迹
            "salandit",       // 夜盗火蜥：利用尾巴的毒气腐蚀金属门
            "aron",           // 可可多拉：吃废料
            "pawniard"        // 驹刀小兵：像帮派流氓一样切断废料
        ],

        // === Rare Pool: 战争机器与特殊合成 (Lv 30+) ===
        "rare": [
            // 稀有热源
            { "id": "magcargo", "min": 38 },    // 熔岩蜗牛
            { "id": "camerupt", "min": 33 },    // 喷火驼
            { "id": "turtonator", "min": 1 },   // 爆焰龟兽 (Living Bomb)
            "scyther",        // 飞天螳螂（也许是黑色的变种？Lore only）-> "kleavor" (洗翠岩石螳螂? 不，这里产出黑奇石 "Black Augurite"，或许劈斧螳螂能现身！)
            "scizor",         // 巨钳螳螂 (需要金属膜，这里有的是)
            
            // 特殊进化
            "klang",          // 齿轮组
            "beldum",         // 铁哑铃
            "skarmory",       // 盔甲鸟：把巢穴筑在最高的烟囱上
            "flareon"         // 火伊布
        ],

        // === Boss Pool: 熔炉领主与工业巨兽 (Lv 42-60) ===
        // "Authorized Personnel Only"
        "boss": [
            { "id": "coalossal", "min": 42 },   // 巨炭山：如同会移动的火山要塞
            { "id": "aggron", "min": 42 },      // 波士可多拉：S区最强的物理盾牌
            { "id": "incineroar", "min": 50 },  // 炽焰咆哮虎：这里是它的擂台
            { "id": "copperajah", "min": 45 },  // 大王铜象：巨大的工程机械
            { "id": "revavroom", "min": 40 },   // 普隆隆姆：暴走的 6 缸引擎
            { "id": "centiskorch", "min": 45 }, // 焚焰蚣：巨大的散热怪兽
            { "id": "magmortar", "min": 48 },   // 鸭嘴炎兽：高炉炮手
            { "id": "conkeldurr", "min": 45 },  // 修建老匠：在它的混凝土柱子下颤抖吧
            { "id": "weezing", "min": 40 }      // 双弹瓦斯 (关都形态)：这里不搞净化，只搞污染，它很快乐
        ]
    }
},
/* Zone: Silent_Tundra (The Absolute Zero) */
/* Threat: Safe (City) -> Low -> Mid -> High -> Apex (Deep North) */
/* Weather: Snow / Hail / Fog / Blizzard */

"Silent_Tundra": {

    // === 1. 也是全岛最温暖的避风港 - 霜烟市城市街道 (Pavement) ===
    // 依靠地热蒸汽维持运作的要塞城市。
    // 生态位：伴侣宠物取暖、不怕冷的冰系、被灯火吸引的生物
    "Pavement": {
        "common": [
            // 居民与取暖者
            "snover",         // 雪笠怪：像行道树一样走在街上
            "snom",           // 雪吞虫：在路灯下缓慢蠕动
            "spheal",         // 海豹球：圆滚滚地在街道上滚
            "growlithe_hisui",// 卡蒂狗(洗翠)：【特色】因为是岩石/火，体表发热，是当地最受欢迎的取暖犬
            "skitty",         // 向尾喵：甚至穿着小衣服
            "purrloin",       // 扒手猫
            "delibird",       // 信使鸟：不仅送快递，还负责运送物资
            "cubchoo",        // 喷嚏熊
            "smeargle",       // 图图犬：画着雪景
            "meowth_galar"    // 喵喵(伽勒尔)：浑身是毛，不怕冷
        ],

        "uncommon": [
            // 稍强的抗寒生物
            "glalie",         // 冰鬼护：有时会在屋檐下冻住
            "snorunt",        // 雪童子：看起来就像穿了防寒服的孩子
            "furfrou",        // 多丽米亚：雪国造型
            "greavard",       // (Gen 9) 墓仔狗：在街角倒着等陪玩的幽灵狗，很符合哥特风
            { "id": "rotom_frost", "min": 1 }, // 洛托姆(冰箱)：因为这里不仅需要冰箱，还需要空调(加热?)
            "stoutland",      // 长毛狗：雪地救援犬的退役版本
            "litwick"         // (Chandelier?) 烛光灵：城市的路灯很多是用它们做的
        ],

        "rare": [
            "glaleon",        // (Typo -> Glaceon) 冰伊布：优雅的城市漫步者
            "castform_snowy", // 飘浮泡泡(雪)：为了适应天气
            "piplup",         // 波加曼：如果是家养跑出来的
            "mr_mime_galar"   // 魔墙人偶(伽勒尔)：冰系踢踏舞者，甚至有点诡异
        ],

        "boss": [
            { "id": "arcanine_hisui", "min": 38 }, // 风速狗(洗翠)：石狮子般的守护神，温暖的源头
            { "id": "walrein", "min": 40 },        // 帝牙海狮：港口或水源管理
            { "id": "mr_rime", "min": 35 }         // 踏冰人偶：城市的绅士管理者 (Gothic Vibe)
        ]
    },


    /* Revision: Silent_Tundra - Slum_Pavement (Gothic Ruins & Graves) */
    /* Ecology: Paranormal / Occult / Frozen Decay / Ancient Spirits */
    /* Threat: Mid -> High (Spirits become aggressive) */
    "Slum_Pavement": {
        
        // === Common Pool: 徘徊的初阶灵体 (Base Stage) ===
        // 任何踏入废墟的人都能感觉到视线
        "common": [
            // 经典的浮游灵
            "litwick",        // 烛光灵：忽明忽暗的蓝色火苗引领迷路者
            "gastly",         // 鬼斯：冻结的瓦斯气体
            "duskull",        // 夜巡灵：在集装箱缝隙里甚至穿墙而过
            "shuppet",        // 怨影娃娃：寻找被遗弃的怨念
            "drifloon",       // 飘飘球：如果你听到风铃声，可能就是它
            "misdreavus",     // 梦妖：喜欢吓唬路人取暖
            
            // 墓地守卫者(幼体)
            "greavard",       // (Gen 9) 墓仔狗：非常粘人，会吸取你的生命力取暖
            "houndour",       // 戴鲁比：成群结队的黑色猎犬，体内的火是唯一热源
            "poochyena",      // 土狼犬
            "yamask",         // 哭哭面具：拿着古代的面具从地下飘出来
            "yamask_galar",   // 哭哭面具(伽勒尔)：这里也散落着符文石块
            
            // 环境生物
            "murkrow",        // 黑暗鸦：站在十字架或或者路灯上
            "sneasel",        // 狃拉(普通)：偷吃祭品
            "zubat",          // 超音蝠
            "cubchoo",        // 喷嚏熊：迷路的孩子
            "espurr"          // 妙喵：面无表情地盯着虚空
        ],

        // === Uncommon Pool: 某种意志的具象化 (Lv 25-40) ===
        "uncommon": [
            // 哥特的具象
            "gothita",        // 哥德宝宝
            { "id": "gothorita", "min": 28 }, // 哥德小童：开始展现出操纵精神的能力
            "sinistea",       // 来悲茶(真品率1%?)：冻结的古董茶具
            "impidimp",       // 捣蛋小妖
            "zorua_hisui",    // 索罗亚(洗翠)：充满怨恨的白色狐狸形影
            "honedge",        // 独剑鞘：插在雪地里的古剑，拔出来就会被吸干灵魂
            
            // 食尸/甚至食梦者
            { "id": "haunter", "min": 25 },   // 鬼斯通：这里的每一块砖都有毒
            { "id": "houndstone", "min": 30 },// (Gen 9) 墓扬犬：真正的墓地之主，甚至骨头都在震动
            { "id": "morgrem", "min": 32 },   // 诈唬魔
            { "id": "sableye", "min": 20 },   // 勾魂眼：眼睛在黑暗中发光
            { "id": "lampent", "min": 38 },   // 灯火幽灵：出现在濒死之人面前 
            { "id": "doublade", "min": 35 }   // 双剑鞘：两把剑摩擦的声音
        ],

        // === Rare Pool: 冻土的都市传说 (Lv 35+) ===
        "rare": [
            // 特殊进化与古代封印
            "spritomb",       // 花岩怪：罕见地从楔石中泄漏气息
            "rotom",          // 洛托姆：这里有很多坏掉的取暖器附身
            "mimikyu",        // 谜拟Q：这里有很多被丢弃的长得像皮卡丘的玩偶...
            "cryogonal",      // 几何雪花：这就是冰冷的锁链
            "runerigus",      // 死神板：巨大的石碑其实是活的
            "banette",        // 诅咒娃娃
            "mismagius",      // 梦妖魔：吟唱着会让耳朵结冰的咒语
            
            // 危险的准神幼体
            "deino",          // 单首龙：因为瞎，所以在这废墟里乱撞，极其危险
            { "id": "zweilous", "min": 50 }   // 双首龙：两个头在吵架
        ],

        // === Boss Pool: 死亡与寒冬的领主 (Lv 42-60) ===
        // "DON'T LOOK BACK"
        "boss": [
            { "id": "chandelure", "min": 45 },  // 水晶灯火灵：灵魂熔炉，S区哥特地标
            { "id": "gothitelle", "min": 45 },  // 哥德小姐：拥有预知星球寿命能力的终极观星者
            { "id": "aegislash", "min": 40 },   // FIXME: 需要暗之石但不一定有，作为Boss直接出场：坚盾剑怪
            { "id": "dusknoir", "min": 45 },    // 黑夜魔灵：通往灵界的门
            { "id": "kingambit", "min": 55 },   // (Gen 9) 仆刀将军：坐在剑冢之上的大将军，统领这里的劈斩司令
            { "id": "zoroark_hisui", "min": 40 }, // 索罗亚克(洗翠)：满身血污长发的复仇之神
            { "id": "hydreigon", "min": 64 },   // 三首恶龙：毁灭一切的甚至移动天灾
            { "id": "froslass", "min": 38 }     // 雪妖女：会把你冻成冰雕装饰品
        ]
    },


    /* Revision: Silent_Tundra - Withered_Grass (Permafrost Plains) */
    /* Ecology: Thick Fur / Frozen Roots / Ice Shells / Heavy Walkers */
    /* Threat: Mid -> High (Environment is the enemy) */
    "Withered_Grass": {
        
        // === Common Pool: 冻土上的拾荒者 (Base Stage) ===
        "common": [
            // 厚脂肪组
            "swinub",         // 小山猪：用鼻子铲开冻土找根茎
            "cetoddle",       // (Gen 9) 走鲸：陆地鲸鱼，数量多且皮厚，成群结队
            "spheal",         // 海豹球：在平坦的冻原上滚得飞快
            "teddiursa",      // 熊宝宝：这里的熊宝宝毛色可能更浅（Lore）
            "zigzagoon_galar",// 蛇纹熊(伽勒尔)：哪里有恶劣环境，哪里就有它
            
            // 冰晶共生组
            "snorunt",        // 雪童子：发抖？不，那是兴奋
            "bergmite",       // 冰宝：与其说是生物，不如说是走到岸上的冰块
            "glimmet",        // (Gen 9) 晶光芽：在冻土上发光的有毒晶体花
            "vanillite",      // 迷你冰：看起来像甜点，摸起来能粘掉一层皮
            
            // 狩猎者前奏
            "sneasel",        // 狃拉 (普通)：坏心眼的偷蛋者
            "vulpix_alola",   // 六尾(阿罗拉)：雪地里的白色妖精
            "poochyena",      // 土狼犬：为了保持体温而不断奔跑
            "deerling"        // 四季鹿 (冬之姿)：如果它不动，你根本看不见
        ],

        // === Uncommon Pool: 冰封的坚壁 (Lv 25-38) ===
        "uncommon": [
            // 耐寒进化体
            { "id": "piloswine", "min": 33 },   // 长毛猪：覆盖着能挡住暴风雪的长毛
            { "id": "vanillish", "min": 35 },   // 多多多冰
            { "id": "linoone_galar", "min": 25 }, // 直冲熊(伽勒尔)：狂暴冲锋
            { "id": "sandslash_alola", "min": 22 }, // 穿山王(阿罗拉)：背上的冰刺更锋利了
            
            // 强壮的游荡者
            "beartic",        // 冻原熊：(Uncommon Spawn if level fits) 游荡的白色死神
            "stantler",       // 惊角鹿：这里的角能制造幻觉迷雾
            "cryogonal",      // 几何雪花：这种人工结构般的生物很适合Rhodia
            "sawsbuck",       // 萌芽鹿 (冬天形态)
            "delibird",       // 信使鸟：不仅送礼物，也会把冒险者的随身物品丢得满地都是
            
            // 特殊适应种
            "cubchoo",        // 喷嚏熊
            "darumaka_galar"  // 达摩狒狒(伽勒尔)：白色的小雪人
        ],

        // === Rare Pool: 极光下的奇迹 (Lv 35+) ===
        "rare": [
            // 龙与太古
            "frigibax",       // (Gen 9) 凉脊龙：为了成为哥斯拉而潜伏在雪堆里
            "amaura",         // 冰雪龙：北极光的孩子 (Rare fossil spawn)
            "duraludon",      // 铝钢龙：太冷了，只有金属和龙的体质能抗住
            
            // 高贵者/孤独者
            "glaceon",        // 冰伊布：体温控制极佳
            "absol",          // 阿勃梭鲁：白色的毛发在雪地里是隐形的
            "eiscue",         // 冰砌鹅：漂流到这里的傻面孔，头如果破了会很滑稽
            "frosmoth",       // 雪绒蛾：美丽的鳞粉不仅冻人，还致命
            "glalie"          // 冰鬼护
        ],

        // === Boss Pool: 绝对零度的暴君 (Lv 45-65) ===
        // "Warning: Ambient Temperature dropping rapidly."
        "boss": [
            { "id": "mamoswine", "min": 45 },   // 象牙猪：冻原的推土机，毫无疑问的霸主
            { "id": "abomasnow", "min": 40 },   // 暴雪王：引发白蒙蒙天气
            { "id": "baxcalibur", "min": 55 },  // (Gen 9 准神) 戟脊龙：脊背喷射冰气的超级怪兽
            { "id": "avalugg_hisui", "min": 40 }, // 冰岩怪(洗翠)：覆盖着甚至更坚硬的岩石，像破冰船
            { "id": "cetitan", "min": 45 },     //浩大鲸：陆地巡洋舰，极其耐打
            { "id": "weavile", "min": 42 },     // 玛狃拉：极速暗杀者，成群出现时的头领
            { "id": "walrein", "min": 44 },     // 帝牙海狮
            { "id": "aurorus", "min": 48 },     // 冰雪巨龙
            { "id": "wyrdeer", "min": 45 },     // (Gen-LA) 诡角鹿：在特区这种有时空扭曲的地方进化了
            { "id": "mr_rime", "min": 42 }      // 踏冰人偶：如果你看到一个拿手杖的大叔...快跑，那是怪
        ]
    },


     // === 4. 绝对零度的纯白极点 (Snowfield) ===
    // 暴风雪从未停歇，能见度极低。你需要护目镜才能看清。
    // 这里不是用来走路的，是用来被活埋的。
    // 生态位：极地巨兽、古代猛犸、未来的机械、高智慧冰妖
    "Snowfield": {
        
        // === Common Pool: 冰层下的顽强者 (Base Stage) ===
        // 即便是最弱的生态位，放到其他区也是小Boss级别的肉度
        "common": [
            // 生存专家
            "cetoddle",       // (Gen 9) 走鲸：皮下脂肪极厚，成群结队像企鹅一样
            "swinub",         // 小山猪：在这种深度积雪里只能看到背面
            "bergmite",       // 冰宝：在暴风雪里恢复体力
            "cubchoo",        // 喷嚏熊：鼻涕永远冻着
            "galarian_darumaka", // 达摩狒狒(伽勒尔)：虽然小但是很暴躁
            "sandshrew_alola",// 穿山鼠(阿罗拉)：冰钢属性，它的壳甚至比岩石还硬
            "snorunt",        // 雪童子：唯一的亮色
            "vanillite",      // 迷你冰：和环境融为一体
            "sneasel",        // 狃拉 (普通)：在冰崖阴影处
            "sneasel_hisui"   // 狃拉 (洗翠)：更有毒性，适合极端捕猎 (Fighting/Poison)
        ],

        // === Uncommon Pool: 冰封防线 (Lv 30-45) ===
        // 这一层的生物如果你没有火系或者是格斗系，打起来会像敲石头一样费劲
        "uncommon": [
            // 中型巨兽
            { "id": "piloswine", "min": 33 },   // 长毛猪：它的毛坚硬如针
            { "id": "beartic", "min": 37 },     // 冻原熊：如果你看到它站起来，那它准备杀人了
            { "id": "crabominable", "min": 30 },// 好胜毛蟹：原本在雪山顶，现在下山了
            { "id": "vanillish", "min": 35 },   // 多多多冰
            { "id": "glalie", "min": 42 },      // 冰鬼护：那张脸会把你吓僵
            { "id": "cryogonal", "min": 30 },   // 几何雪花：随风而来的活锁链
            { "id": "eiscue", "min": 30 },      // 冰砌鹅：不管被打碎多少次头都会长出来
            { "id": "sneasler", "min": 42 }     // 大狃拉 (洗翠进化)：极度危险的攀岩杀手
        ],

        // === Rare Pool: 极光下的传说与超越时代的物体 (Lv 40+) ===
        "rare": [
            // 龙族(准神前置)
            "arctibax",       // (Gen 9) 冻脊龙：正在练习背摔，非常凶猛
            "duraludon",      // 铝钢龙：活体的金属塔
            "amaura",         // 冰雪龙：叫声回荡在空旷雪原
            
            // 优雅的致命者
            "frosmoth",       // 雪绒蛾：用暴雪做掩护
            "alolan_ninetales", // 九尾(阿罗拉)：在暴风雪中救人? 还是诱导? (罕见的善意)
            "glaceon",        // 冰伊布：完全适应零度
            
            // 下个时代的入侵者
            { "id": "iron_bundle", "min": 50 }  // [得文公司事故?] 铁包袱 (Paradox Delibird)：用像加压水炮一样的反重力装置滑行
        ],

        // === Boss Pool: 极地的终焉 (Lv 50-70) ===
        // "Warning: Life signs minimal. Massive energy detected."
        "boss": [
            // 大怪兽系列
            { "id": "baxcalibur", "min": 55 },  // 戟脊龙：哥斯拉级的生物，它喷出的不是火，是冻气
            { "id": "cetitan", "min": 50 },     // 浩大鲸：陆地巡洋舰，吨位碾压
            { "id": "mamoswine", "min": 48 },   // 象牙猪：远古血脉
            { "id": "avalugg_hisui", "min": 48 }, // 冰岩怪 (洗翠)：下颚变成了铲雪的大岩石
            { "id": "aurorus", "min": 52 },     // 冰雪巨龙：能瞬间制造冰墙
            { "id": "walrein", "min": 45 },     // 帝牙海狮
            { "id": "abomasnow", "min": 45 },   // 暴雪王：此地暴风雪的源头
            
            // 灾厄级
            { "id": "chien_pao", "min": 60 },   // (Gen 9, Low %) 古剑豹：如果是极低概率的彩蛋... (封印之剑)
            { "id": "articuno_galar", "min": 60 } // 急冻鸟 (伽勒尔)：在那残酷眼神下的冷酷视屏 (超能/飞，但很像冰)
        ]
    }
},
/* Zone: Ginkgo_Grove (The Ancient Gold) */
/* Threat: Low -> High (Safe until you disturb the spirits) */
/* Theme: Autumn / Wind Chimes / Foxes / Spirits of the Past */

"Ginkgo_Grove": {

    // === 1. 厚筑落叶层地表 (Withered_Grass) ===
    // 地面上也是铺满了几十厘米厚的金黄叶子，下面掩盖着腐殖土和也是古代遗物
    // 你听到的沙沙声，可能不是风，而是什么东西走过来了
    "Withered_Grass": {
        
        // === Common Pool: 金色落叶的掩护 (Base Stage) ===
        "common": [
            // 保护色/秋季限定
            "deerling",       // 四季鹿 (秋季形态)：橙红色外皮完美的融入环境
            "vulpix",         // 六尾：金色的狐狸，通常这就是神隐传说的源头
            "seedot",         // 橡实果：伪装成掉落的果实
            "skwovet",        // 贪心栗鼠：忙着收集银杏果
            "nickit",         // 偷儿狐：在叶子下潜行
            
            // 气味与菌类
            "stunky",         // 臭鼬噗：银杏果特有的"微臭"其实也混合了它的气味
            "toedscool",      // (Gen 9) 原野水母：虽然叫水母但我是菌类！在腐叶土上跑得飞快
            "paras",          // 派拉斯特
            "shroomish",      // 蘑蘑菇
            
            // 古代的小东西
            "voltorb_hisui",  // 霹雳电球(洗翠)：【重点】看起来像古代球果，居然是草/电系
            "baltoy",         // 天秤偶：像古代玩具一样转动
            "chingling"       // 铃铛响：风铃声的源头之一
        ],

        // === Uncommon Pool: 树下的守护者 (Lv 22-38) ===
        "uncommon": [
            // 进化的林地看守
            { "id": "nuzleaf", "min": 14 },     // 长鼻叶：天狗的随从
            { "id": "meowth_galar", "min": 15 },// 喵喵(伽勒尔)：也可能是随着北方维京人来的?
            { "id": "girafarig", "min": 25 },   // 麒麟奇
            { "id": "sawsbuck", "min": 34 },    // 萌芽鹿 (秋季霸主)：鹿角上挂满红叶
            { "id": "pikachu", "min": 15 },     // 皮卡丘 (稀有色?) No, just Pikachu
            { "id": "thievul", "min": 18 },     // 狐大盗
            { "id": "standler", "min": 20 },    // 分不清... "stantler" 惊角鹿 (普通型, 洗翠进化前)
            
            // 灵骚现象
            "misdreavus",     // 梦妖：喜欢躲在古树后面
            "yamask_galar",   // 哭哭面具(伽勒尔)：石板遗迹
            "golett",         // 泥偶小人 (古代守卫)
            "sinistcha_unremarkable" // (Gen 9) 斯魔茶：没人喝的苦茶变成了怪 (伪匠/真匠) -> Pre-evo "poltchageist"
        ],

        // === Rare Pool: 时空错乱的访客 (Lv 35+) ===
        "rare": [
            // 稀有光之狐
            "zorua_hisui",    // 索罗亚(洗翠)：白色的冤魂，超级稀有(Rare/Hidden)
            "ninetales",      // 九尾：长寿的象征
            "wyrdeer",        // 诡角鹿：(直接遇到) 来自古代的神使
            
            // 森林深处的异类
            "sudowoodo",      // 树才怪：这里的老树才怪非常强
            "drampa",         // 老翁龙：只有这种古风森林适合它
            { "id": "claydol", "min": 36 },     // 念力土偶
            "poltchageist"    // (Gen 9) 斯魔茶：躲在树洞里的茶罐
        ],

        // === Boss Pool: 神社与古树之主 (Lv 45-60) ===
        "boss": [
            { "id": "shiftry", "min": 40 },     // 狡猾天狗：森林的风神，扇动叶扇制造强风
            { "id": "zoroark_hisui", "min": 45 }, // 索罗亚克(洗翠)：悲叹的亡灵主宰 (High Threat Ace)
            { "id": "ursaring", "min": 40 },    // 圈圈熊
            { "id": "mismagius", "min": 35 },   // 梦妖魔：吟唱古代咒语
            { "id": "tsareena", "min": 38 },    // (虽然是之后，但她是这里除了狐狸外唯一的鲜艳色彩) No, remove.
            { "id": "kleavor", "min": 50 },     // 劈斧螳螂：如果它还没灭绝，那一定就在这片也是充满了岩石和树干的地方
            { "id": "overqwil", "min": 35 },     // 万针鱼：(如果附近有水池，或者强行登陆?) -> Remove, keep to water.
            // Replace with:
            { "id": "sinistcha", "min": 35 }    // 来悲粗茶：能随便夺取在此处喝茶人的精气
        ]
    },


    // === 2. 挂满绘马和风铃的古木树冠 (Light_Forest) ===
    // 树上挂着的不仅是叶子，还有古人留下的祈福道具。随着风摇摆。
    // 生态位：声波生物、鸟类、模仿器物的灵
    "Light_Forest": {
        "common": [
            // 声音的制造者
            "chingling",      // 铃铛响：所有树上都在响
            "chimecho",       // 风铃铃：被认为是招魂的风铃
            "bronzor",        // 铜镜怪：挂在树枝上像一面镜子
            "hoothoot",       // 咕咕：永远睁着一只眼
            "natu",           // 天然雀：站在树梢一动不动
            "murkrow",        // 黑暗鸦：把闪亮的东西挂在树上
            
            // 叶子里的东西
            "pineco",         // 榛果球
            "cascoon",        // 盾甲茧：它在甚至等待进化成毒粉蛾
            "seedot",         // 橡实果
            "burmy_trash",    // 结草儿 (垃圾蓑衣? No, Plant/Trash mix)：这里可能是用了"绘马"做蓑衣?
            "kakuna"          // 铁壳蛹
        ],

        "uncommon": [
            "noctowl",        // 猫头夜鹰：睿智的老者
            "xatu",           // 天然鸟：凝视过去和未来
            "bronzong",       // (Low level?) -> Uncommon spawn min: 33 青铜钟 (能求雨)
            "sigilyph",       // 象征鸟：也是古代遗迹的守护者，飞在树林上空
            "swellow",        // 大王燕
            { "id": "electroode_hisui", "min": 30 }, // 顽皮雷弹(洗翠)：草/电 惊喜球果
            { "id": "mothim", "min": 20 }     // 绅士蛾
        ],

        "rare": [
            // 稀有龙与幽灵
            "dreepy",         // 多龙梅西亚：被看作是古代战死的士兵的幽灵重现
            "drakloak",       // 多龙奇
            "applin",         // 啃果虫
            "hydrapple",      // (Gen 9) 裹蜜虫进化型... 蜜集大蛇? (Maybe late rare) 
            "flapple"         // 苹裹龙
        ],

        "boss": [
            { "id": "braviary_hisui", "min": 45 }, // 勇士雄鹰(洗翠)：用超能力统御这片古代天空
            { "id": "decidueye_hisui", "min": 45 },// 狙射树枭(洗翠)：草/格斗，浪人斗笠客 (与普通的狙射树枭在Jade Canopy形成对比)
            { "id": "bronzong", "min": 35 },    // 青铜钟
            { "id": "noivern", "min": 48 },     // 音波龙：把耳朵变成巨大的音箱
            { "id": "dragapult", "min": 60 }    // 多龙巴鲁托：极快，在此地被视为"幽灵空军"
        ]
    }
},
/* Zone: Spirit_Plateau (The Solemn Highlands) */
/* Threat: Safe (Village) -> Mid (Fields) -> High (Northern Ridge) */
/* Theme: Occult / Wind / Psychic / Fighting / Purple Flora */

"Spirit_Plateau": {

    // === 1. 古老的隐世村落 (Ancient_Timber) ===
    // 神阖之空 (Kamunagi Hollow) 的一部分延伸或其他避世者的据点。木质建筑、缘侧、甚至有茶室。
    // 生态位：家宅守护灵、古代物品灵、能够与人共存的奇异生物
    "Ancient_Timber": {
        "common": [
            "meowth_galar",   // 喵喵(伽勒尔)：这里的人喜欢的维京风格猫霸
            "hoothoot",       // 咕咕：停在村口鸟居上
            "chingling",      // 铃铛响：风很大，所以铃铛声一直在向
            "bronzor",        // 铜镜怪：作为镜子或牌匾被挂着
            "natu",           // 天然雀：站在木桩上一动不动
            "shuppet",        // 怨影娃娃：并不是要害人，只是被负面情绪吸引
            "swablu",         // 青绵鸟：像帽子一样在人头上
            "rookie"          // -> "rookidee" 稚山雀：在屋檐下避风
        ],

        "uncommon": [
            "poltchageist",   // (Gen 9) 斯魔茶：这就是"Ancient"茶室里的常客
            "ralts",          // 拉鲁拉丝：感知村民的情绪
            "meditite",       // 玛沙那：在村子周边冥想
            "baltoy",         // 天秤偶
            "nuzleaf",        // 长鼻叶：天狗传说的来源
            "klefki",         // 钥圈儿：收集古老的要是
            { "id": "mrmime_galar", "min": 25 } // 魔墙人偶(伽勒尔)：村里的滑稽艺人
        ],

        "rare": [
            "riolu",          // 利欧路：非常稀有，只会接近波导纯净的人
            "sinistea",       // 来悲茶 (真品)
            "zorua_hisui",    // 索罗亚 (洗翠)：甚至会被误认为得了白化病的小狗喂养
            "absol",          // 阿勃梭鲁：虽然不想进村，但必须来预警
            "rotom"           // 洛托姆：即使在这里也找到了也是旧电视机钻进去
        ],

        "boss": [
            { "id": "sinistcha", "min": 35 },   // 来悲粗茶：恐怖茶室的主人
            { "id": "chimecho", "min": 30 },    // 风铃铃：平安的象征
            { "id": "shiftry", "min": 40 },     // 狡猾天狗
            { "id": "lucario", "min": 45 },     // 路卡利欧：村落的守护神，站在屋顶俯瞰
            { "id": "mawile", "min": 35 }       // 大嘴娃：也许是被供奉的对象
        ]
    },


    // === 2. 高山梯田与祭祀耕地 (Wet_Soil) ===
    // 虽然是田地，但海拔较高，且可能种植着给幽灵系宝可梦的祭品（苦涩的草药等）。
    // 生态位：耐寒的地面系、沼泽生物、也是在湿土里爬行的灵体
    "Wet_Soil": {
        "common": [
            "wooper_paldea",  // 乌波 (帕底亚)：S区标配毒沼乌波
            "barboach",       // 泥泥鳅
            "shellos",        // 无壳海兔
            "yanma",          // 阳阳玛：高山蜻蜓
            "lotad",          // 莲叶童子：这里有净水池
            "golett",         // 泥偶小人：就是用这里的湿泥巴捏出来的
            "inkay",          // 好啦鱿：也是飘在水田上的奇妙生物，颠倒
            "shelmet",        // 小嘴蜗
            "diglett_alola"   // 地鼠(阿罗拉)
        ],

        "uncommon": [
            "golbat",         // 大嘴蝠
            "quagsire",       // 沼王 (呆滞的神)
            "clodsire",       // (Gen 9) 土王：同样呆滞但有剧毒
            "sliggoo",        // 黏美儿
            "whiscash",       // 鲶鱼王
            "toxicroak",      // 毒骷蛙：由于是高地，这就是武斗派青蛙
            "lokix"           // (Gen 9 - Nymble evo) -> "nymble" 豆蟋蟀 (Common) -> "lokix" (Rare)
        ],

        "rare": [
            "mudkip",         // 水跃鱼 (Rare Spawn)
            "toedscool",      // 原野水母：在高地田埂上那个魔性的奔跑姿态...
            "stunfisk_galar", // 泥巴鱼
            "spiritomb"       // 花岩怪：可能从某个耕出的楔石里冒出来，被当成杂草
        ],

        "boss": [
            { "id": "seismitoad", "min": 38 },  // 蟾蜍王
            { "id": "toedscruel", "min": 40 },  // 陆地水母
            { "id": "swampert", "min": 45 },    // 巨沼怪
            { "id": "golurk", "min": 42 }       // 泥偶巨人：某种意义上的古代农机
        ]
    },


    // === 3. 覆盖紫色石楠花的南部高地 (Standard_Grass) ===
    // 这里的草不是绿色的，而是紫色的低矮花丛。风很大，视野开阔。
    // 生态位：紫色/粉色系的宝可梦、妖精系、随风漂泊者
    "Standard_Grass": {
        "common": [
            // 紫色系/石楠花色系掩护
            "drifloon",       // 飘飘球：高低的风太适合它们了，成群像气球
            "gastly",         // 鬼斯：紫色的雾气混在花丛里
            "stunky",         // 臭鼬噗：保护色完美
            "venonat",        // 毛球
            "glimmet",        // 晶光芽：像是地上的蓝紫色宝石
            "swablu",         // 青绵鸟
            "hoppip",         // 毽子草
            "nidoranm",       // 尼多朗(紫色) / 尼多兰
            "meditite",       // 玛沙那
            "ralts"           // 拉鲁拉丝
        ],

        "uncommon": [
            // 优雅的灵魂
            "sprites",        // (Typo -> Spritzee) 粉香香：这种香味在狂风中也能闻到
            "misdreavus",     // 梦妖
            "floette",        // 花叶蒂 (紫色花或蓝色花)
            "orocorio",       // 花舞鸟... (Wait, Purple Style is Sensu/Ghost) -> "orocorio_sensu" 
                              // 这种轻纱飞舞的形态最适合镇魂高地的风!
            "spoink",         // 跳跳猪：利用弹力在山岩间跳
            "haunter",        // 鬼斯通
            "murkrow"         // 黑暗鸦
        ],

        "rare": [
            "gothita",        // 哥德宝宝
            "impidimp",       // 捣蛋小妖
            "dreepy",         // 多龙梅西亚：被大风吹得骑在其他的宝可梦头上
            "altaria",        // 七夕青鸟 (Uncommon/Rare) - 这里是看云的好地方
            "lunatone",       // 月石：这里离天空很近
            "absol"           // 阿勃梭鲁
        ],

        "boss": [
            { "id": "orocorio_sensu", "min": 30 }, // 花舞鸟(轻盈)：高地舞姬
            { "id": "drifblim", "min": 35 },    // 随风球：可以在上面看到Z区全景
            { "id": "mismagius", "min": 38 },   // 梦妖魔
            { "id": "gardevoir", "min": 40 },   // 沙奈朵：如果是死去的训练家的守护灵...
            { "id": "gengar", "min": 42 }       // 耿鬼
        ]
    },


    // === 4. 北部甚至开始结霜的狂风荒原 (Withered_Grass) ===
    // 靠近 A 区边界，植被极其稀疏，布满乱石和不可见的能量乱流。
    // 生态位：岩石系、格斗系、暴躁的恶灵
    "Withered_Grass": {
        "common": [
            "yamask_galar",   // 哭哭面具(伽勒尔)：嵌在岩石里
            "baltoy",         // 天秤偶
            "shuppet",        // 怨影娃娃
            "poochyena",      // 土狼犬
            "houndour",       // 戴鲁比：从附近的贫民窟跑上来的
            "stufful",        // 童偶熊：不要被外表骗了，这里能活下来的都很强
            "rhyhorn",        // 独角犀牛：由于地表充满碎石
            "nosepass",       // 朝北鼻：指向磁场
            "mankey_galar"    // No galar key? -> "mankey" 猴怪
        ],

        "uncommon": [
            // 战士之魂
            "primeape",       // 火暴猴：一直处于被激怒状态
            "machoke",        // 豪力
            "doublade",       // 双剑鞘
            "sableye",        // 勾魂眼：吃这里的矿石
            "runerigus",      // 死神板：伪装成壁画残骸
            "midnight_lycanroc", // (鬃岩狼人-黑夜)：这里非常适合 S 区的画风
            "claydol",        // 念力土偶
            "gligar"          // 天蝎：滑翔
        ],

        "rare": [
            "stonjourner",    // 巨石丁：也是古代遗迹的一部分 (Rare Structure)
            "braviary_hisui", // 勇士雄鹰(洗翠)：来自北方的神鸟
            "spiritomb",      // 花岩怪：封印石
            "riolu",          // 利欧路
            "zoroark",        // 索罗亚克：甚至会伪装成巨石丁欺骗你
            "annihilape"      // (Gen 9) 弃世猴：只有在 Withered Grass 这种死寂之地，死去的火暴猴才能进化成它
        ],

        "boss": [
            { "id": "annihilape", "min": 45 },  // 弃世猴：高地最强的物理/幽灵混合体
            { "id": "braviary_hisui", "min": 45 }, // 洗翠勇士雄鹰
            { "id": "tyranitar", "min": 55 },   // (Gen 2 Pseodo) 班基拉斯：S区的地形改变者 (Roaming Storm)
            { "id": "garganacl", "min": 42 },   // (Gen 9) 盐石巨灵：如要塞版移动
            { "id": "medicham", "min": 38 },    // 恰雷姆
            { "id": "golurk", "min": 40 },      // 泥偶巨人
            { "id": "hydreigon", "min": 64 }    // (Roaming Disaster)
        ]
    }
},
/* Zone: Crimson_Peat (The Acidic Bog) */
/* Threat: Mid -> High (Hazardous Terrain) */
/* Theme: Ancient / Acidic / Preservation / Peat Moss */

"Crimson_Peat": {

    // === 红色的酸性泥沼与古木桩群 (Swamp) ===
    // 覆盖全境。这里的"水"其实是红褐色的酸液，"土"是像海绵一样的千年沉积物。
    // 生态位：泥炭共生生物、硬壳古代种、酸蚀龙族
    "Swamp": {
        
        // === Common Pool: 红色泥浆中的居民 (Lv 25-35) ===
        // 这里的Common已经比其他区的Uncommon要危险了
        "common": [
            // 红色/褐色系沼泽生物
            "shellos_west",   // 无壳海兔(西海)：粉红/红色种，完美融入红泥
            "corphish",       // 龙虾小兵：在酸水里反而甲壳更红了
            "paras",          // 派拉斯特：被泥炭土滋养的蘑菇
            "yanma",          // 阳阳玛：远古蜻蜓，依然没有任何改变地飞着
            "skrelp",         // 垃垃藻：拟态成腐烂的红色水草
            "croagunk",       // 不良蛙：毒囊因环境而更加肿胀
            "skorupi",        // 钳尾蝎：紫红色的甲壳
            "trapinch",       // 大颚蚁：不仅仅在沙地，这种软泥更适合它做流沙坑
            "goomy",          // 黏黏宝
            "inkay"           // 好啦鱿 (红褐色，且习性怪异)
        ],

        // === Uncommon Pool: 泥炭保存的活化石 (Lv 35-42) ===
        "uncommon": [
            // 进化的掠食者
            "crawdaunt",      // 铁螯龙虾：性格极其暴躁，甚至会攻击古木桩
            "parasect",       // 派拉斯特：完全被孢子接管
            "drapion",        // 龙王蝎：这一区域的主战坦克
            "toxicroak",      // 毒骷蛙
            "carnivine",      // 尖牙笼：在这片深红土地上长得异常巨大
            "dragalge",       // 毒藻龙：喷射腐蚀性毒液
            "tangela",        // 蔓藤怪：这里的蔓藤是暗红色的
            
            // 特殊泥炭种
            { "id": "qwilfish_hisui", "min": 25 }, // (Gen-LA) 千针鱼(洗翠)：这里的水质和古代也没区别
            { "id": "sliggoo_hisui", "min": 35 },  // (Gen-LA) 黏美儿(洗翠)：关键！它的金属壳就是由这片红水里的矿物沉积而成的
            { "id": "gastrodon_west", "min": 30 }, // 海兔兽(西海)：像一个粉红色的肉瘤
            { "id": "whiscash", "min": 30 }        // 鲶鱼王
        ],

        // === Rare Pool: 封印与远古血脉 (Lv 40+) ===
        "rare": [
            // 太古的遗物
            "tyrunt",         // 宝宝暴龙：这片泥炭地保存了很好的恐龙化石，甚至还是活的
            "kabuto",         // 化石盔
            "anorith",        // 太古羽虫
            
            // 木桩的怨念
            "spiritomb",      // 花岩怪：描述中提到的"古老木桩"其实就是封印它的楔石
            "mimikyu",        // 谜拟Q: 它的破布被染红了...
            
            // 霸主预备役
            "teddiursa",      // 熊宝宝：千万别在这里惹它们，长辈不一样
            "ursaring",       // 圈圈熊：(正在寻找泥炭块...)
            "axew"            // 牙牙
        ],

        // === Boss Pool: 红莲湿地的霸主 (Lv 48-65) ===
        // 在这片时间停滞之地进化到了顶点
        "boss": [
            // 真正的“泥炭”象征
            { "id": "ursaluna", "min": 50 },    // (Gen-LA) 月月熊。没有比让它做 Crimson Peat 的Boss更合适的了。它就是这片土地本身。
            
            // 远古巨兽
            { "id": "yanmega", "min": 45 },     // 远古巨廷：翼展遮天
            { "id": "tangrowth", "min": 48 },   // 巨蔓藤：像克苏鲁神话里的黑山羊幼崽
            { "id": "goodra_hisui", "min": 50 },// (Gen-LA) 黏美龙(洗翠)：巨大的金属蜗牛，忧郁地盘踞在泥潭中心
            { "id": "feraligatr", "min": 48 },  // 大力鳄：在这红水里像哥斯拉一样
            { "id": "tyrantrum", "min": 52 },   // 怪颚龙：红色的暴龙雷克斯，顶级的视觉压迫力
            { "id": "overqwil", "min": 40 },    // 万针鱼：水中的机雷
            { "id": "slither_wing", "min": 60 } // (Paradox - Ancient Volcarona) 爬地翅：如果是极低概率的古老霸主 (蟲/格斗)
        ]
    }
},
/* Zone: Twilight_Copse (The Haunted Violet Woods) */
/* Threat: Mid -> High (Psychological Horror & Poison) */
/* Theme: Dark Fairy / Illusions / Bio-Luminescence / Corrupted Nature */

"Twilight_Copse": {

    // === 1. 膝盖深的阴湿发光长草 (High_Grass) ===
    // 覆盖在扭曲树根之间的长草，常年见而不见光，草叶呈紫黑色。
    // 生态位：发光菌类、陷阱行者、成群的乌鸦
    "High_Grass": {
        
        // === Common Pool: 迷雾中的黑影 (Base Stage) ===
        "common": [
            // 荧光菌群
            "morelull",       // 睡睡菇：遍地都是，紫色雾气的主要来源
            "foongus",        // 哎呀球菇：这里的颜色可能会暗沉一些
            "shroomish",      // 蘑蘑菇
            "paras",          // 派拉斯特
            
            // 恶作剧妖精 & 恶系
            "impidimp",       // 捣蛋小妖：在草丛里伸脚绊你
            "murkrow",        // 黑暗鸦：甚至在地上跳着走
            "purrloin",       // 扒手猫
            "poochyena",      // 土狼犬：嗅觉非常灵敏
            "stunky",         // 臭鼬噗：毒气叠加
            "zorua",          // 索罗亚：把草丛伪装成平地的幻觉制造者
            
            // 传统森林害虫
            "spinarak",       // 圆丝蛛
            "venonat",        // 毛球：红色的复眼在雾里发光
            "gastly"          // 鬼斯：只是路过的气体
        ],

        // === Uncommon Pool: 恶意的显现 (Lv 28-40) ===
        "uncommon": [
            // 下位杀手
            { "id": "morgrem", "min": 32 },     // 诈唬魔：会主动发起欺诈攻击
            { "id": "liepard", "min": 25 },     // 酷豹：无声的暗杀者
            { "id": "skuntank", "min": 34 },    // 坦克臭鼬
            { "id": "ariados", "min": 22 },     // 阿利多斯
            
            // 谜一样的存在
            "mimikyu",        // 谜拟Q：在 Copse 深处的破布更显恐怖
            "mawile",         // 大嘴娃：背后的嘴长在草丛高度，专门咬腿
            "sableye",        // 勾魂眼：眼睛反射微弱的光
            "roselia",        // 毒蔷薇：唯一的"美"也是带毒的
            { "id": "amoonguss", "min": 39 },   // 败露球菇
            
            // 迷失的孩子?
            "phantump",       // 小木灵
            "pumpkaboo"       // 南瓜精 (特大尺寸)：这里营养过剩
        ],

        // === Rare Pool: 童话里的梦魇 (Lv 40+) ===
        "rare": [
            "umbreon",        // 月亮伊布：它红色的眼睛在黑森林里非常醒目 (光环效果)
            "absol",          // 阿勃梭鲁：如果你看到它，说明前面有真正的危险
            "shiinotic",      // 灯罩夜菇 (High Level)：如果周围突然亮了，那是它饿了
            "gengar",         // 耿鬼
            "spiritomb",      // 花岩怪
            "klefki"          // 钥圈儿：挂在草叶上的钥匙，千万别捡
        ],

        // === Boss Pool: 黑暗森林的狩猎主 (Lv 45-60) ===
        // "I think we are walking in circles..."
        "boss": [
            { "id": "grimmsnarl", "min": 45 },  // 长毛巨魔：暮光灌丛物理力量的顶点
            { "id": "drapion", "min": 42 },     // 龙王蝎：横冲直撞的猛毒战车
            { "id": "honchkrow", "min": 45 },   // 乌鸦头头：教父正在召集小弟
            { "id": "vileplume", "min": 40 },   // 霸王花：散发着致敏花粉
            { "id": "aromatisse", "min": 38 },  // 芳香精：这里的瘟疫医生
            { "id": "muk_alola", "min": 40 }    // 臭臭泥(阿罗拉)：在黑暗中发出彩虹光
        ]
    },


    // === 2. 扭曲的鬼影黑森林 (Light_Forest) ===
    // 树木密度不高，但每一棵都长得像怪异的人形。树上并没有甚至是稍微正常的叶子，只有藤蔓和发光苔藓。
    // 生态位：树上的窥视者、女巫类、利用回声的蝙蝠
    "Light_Forest": {
        "common": [
            // 窥视者
            "hoothoot",       // 咕咕：红眼睛在夜里很吓人
            "zubat",          // 超音蝠
            "woobat",         // 滚滚蝙蝠
            "spinara",        // 圆丝蛛：织出只有特定角度才能看见的网
            "natu",           // 天然雀：站在树枝最高处
            "murkrow",        // 黑暗鸦
            "shuppet",        // 怨影娃娃
            "drifloon",       // 飘飘球
            "phantump"        // 小木灵：树干的一部分其实是活的
        ],

        "uncommon": [
            // 森林女巫序列
            "hatenna",        // 迷布莉姆：如果你在大声说话，它会让你闭嘴
            { "id": "hattrem", "min": 32 },     // 提布莉姆：狂暴的辫子
            
            // 树上威胁
            { "id": "noctowl", "min": 20 },     // 猫头夜鹰
            { "id": "golbat", "min": 22 },      // 大嘴蝠
            { "id": "swoobat", "min": 25 },     // 心蝙蝠
            { "id": "grafaiai", "min": 28 },    // (Gen 9) 指绘雷猴：树皮是黑色的因为被它涂掉了
            { "id": "crobat", "min": 35 },      // 叉字蝠
            "misdreavus",     // 梦妖
            "mismagius"       // 梦妖魔 (需暗之石进化，可直接作为Uncommon/Rare出现)
        ],

        "rare": [
            // 午夜漫步者
            "weavile",        // 玛狃拉：树上的利刃 (Requires item to evo, so rare spawn is lore acc.)
            "zoroark",        // 索罗亚克：高智商幻影
            "gothitelle",     // 哥德小姐 (Rare wanderer)
            "polteageist",    // 怖思壶：如果你在树林里看到茶会...
            
            // 传说感
            "galarian_rapidash", // 烈焰马(伽勒尔)：妖精系的独角兽，这片黑暗里唯一的圣洁光芒 (但性格高傲)
            "ponyta_galar"       // 小火马(伽勒尔)
        ],

        "boss": [
            // 黑童话的终局
            { "id": "hatterene", "min": 45 },   // 布莉姆温：沉默魔女，森林真正的女主人
            { "id": "trevenant", "min": 42 },   // 朽木妖：控制周围的树木移动
            { "id": "noivern", "min": 48 },     // 音波龙：黑夜中的超声波轰炸
            { "id": "crobat", "min": 40 },      // 叉字蝠
            { "id": "gourgeist", "min": 38 },   // 南瓜怪人(特大)：把受害者装进身体里带走
            { "id": "corviknight", "min": 50 }  // [S区别注版] 钢铠鸦：如果是浑身漆黑、不反光的哑光版本 (Lore only)
        ]
    }
},
/* Zone: Crimson_Badlands (The Rusty Wasteland) */
/* Threat: Safe (City) -> Low (Plains) -> Mid (Canyons) */
/* Terrain Focus: Red Rock, Dry Earth, Heavy Industry */

"Crimson_Badlands": {

    // === 1. 类似非洲大草原的南部枯草区 (High_Grass) ===
    // 位于湿润B区与干燥A区的交界，长满金黄色的干枯长草 "Savanna Outlands"。
    // 生态位：大型有蹄类、狮群、极速猎手
    "High_Grass": {
        "common": [
            // 草原吃草组
            "rhyhorn",        // 独角犀牛：这里数量多得像角马一样
            "mudbray",        // 泥驴仔
            "blitzle",        // 斑斑马：适应干燥气候的平原马
            "girafarig",      // 麒麟奇
            "litleo",         // 小狮狮：在草丛里练习捕猎
            "doduo",          // 嘟嘟：跑得飞快
            "bouffalant",     // 爆炸头水牛
            "patrat",         // 探探鼠
            "phanpy"          // 小小象
        ],

        "uncommon": [
            // 进化的捕食者与领袖
            { "id": "pyroar", "min": 35 },      // 火炎狮 (雄/雌)：草原之王
            { "id": "zebstrika", "min": 27 },   // 雷电斑马
            { "id": "zangoose", "min": 20 },    // 猫鼬斩：这里没有蛇，但它可以磨爪子
            { "id": "luxio", "min": 18 },       // 勒克猫
            { "id": "tauros_paldea_blaze", "min": 1 }, // 肯泰罗(火炽种)：红色的牛更适合红土地
            "scyther",        // 飞天螳螂：由于这里非常干燥，它们的甲壳更硬
            "fearow",         // 大嘴雀：这是荒地，不是树林，大嘴雀更适合
            "kangaskhan"      // 袋兽
        ],

        "rare": [
            "growlithe_hisui", // 卡蒂狗(洗翠)：岩石/火，完美契合这种红土乱石草地，极其稀有
            "larvitar",       // 幼基拉斯：在吃土
            "sandile",        // 黑眼鳄：也有跑到草地上的
            "rhydon"          // 钻角犀兽
        ],

        "boss": [
            { "id": "donphan", "min": 40 },     // 顿甲：滚动战车
            { "id": "arcanine_hisui", "min": 45 }, // 风速狗(洗翠)：被称为传说中的守护兽
            { "id": "luxray", "min": 42 },      // 伦琴猫
            { "id": "dodrio", "min": 32 }       // 嘟嘟利
        ]
    },


    // === 2. 稀疏的枯木与红土岩柱 (Light_Forest) ===
    // 类似于大峡谷中或荒野上的几棵枯树，主要作为飞行系和伏击者的落脚点。
    // 生态位：秃鹫、猛禽、伪装成树的岩石
    "Light_Forest": {
        "common": [
            "vullaby",        // 秃鹰丫头：这里是骸骨荒原，秃鹫最爱
            "spearow",        // 烈雀
            "ruflet",         // 毛头小鹰：甚至会和秃鹰打架
            "pineco",         // 榛果球：挂在枯树上
            "seedot",         // 橡实果
            "burmy_sandy",    // 结草儿(砂土)：用荒地的沙子做衣服
            "bonsly",         // 盆才怪：假树
            "nuzleaf",        // 长鼻叶
            "silicobra"       // 沙包蛇：盘在树根阴凉处
        ],

        "uncommon": [
            "mandibuzz",      // 秃鹰娜：盘旋在尸体上方 & 骨头收集者
            "braviary",       // 勇士雄鹰
            "skarmory",       // 盔甲鸟：在带刺的树上筑巢 (钢铁之翼不畏惧)
            "sudowoodo",      // 树才怪
            "sawsbuck",       // 萌芽鹿 (秋/冬)：在这里毛色偏枯黄，是种像羚羊一样的存在
            "noctowl"         // 猫头夜鹰
        ],

        "rare": [
            "aerodactyl",     // 化石翼龙：从附近的化石挖掘场复活飞过来的 (Rare Spawn)
            "yanmega",        // 远古巨廷：红色的蜻蜓，与红色天空融为一体
            "gligar",         // 天蝎：悬崖攀登者
            "shiftry"         // 狡猾天狗 (生活在荒野中的忍者)
        ],

        "boss": [
            { "id": "mandibuzz", "min": 40 },   // 秃鹰娜 (领主)
            { "id": "skarmory", "min": 38 },    // 盔甲鸟 (高防御路障)
            { "id": "corviknight", "min": 45 }, // 钢铠鸦 (A区的空中霸主，经常甚至作为运输机飞过)
            { "id": "archeops", "min": 42 }     // 始祖大鸟：非常吵闹
        ]
    },


    // === 3. 无尽的深红废土与矿渣场 (Waste) ===
    // 地表主要是红色的有毒尘埃、被化学物质硬结的泥土、以及偶尔露出的生锈钢架。
    // 这不是单纯的石头地，而是真正残酷的“辐射废土”。
    // 生态位：清道夫、剧毒生物、无机生命、强盗团伙
    "Waste": {
        
        // === Common Pool: 荒原上的拾荒大军 (Base Stage) ===
        "common": [
            // 地面/岩石系基底 (仍占据主流)
            "sandile",        // 黑眼鳄：数量极大
            "silicobra",      // 沙包蛇：盘在有化学废料的土堆上睡
            "roggenrola",     // 石丸子
            "rhyhorn",        // 独角犀牛：硬皮能抗住腐蚀
            "diglett_alola",  // 地鼠(阿罗拉)：在硬土里钻洞
            "nacli",          // 盐石宝：盐碱地的指示物
            
            // 肮脏的清道夫与有害物
            "trubbish",       // 破破袋：工业垃圾袋成精
            "koffing",        // 瓦斯弹：这里地缝里冒的不仅是热气，还有毒气
            "grimer_alola",   // 臭泥(阿罗拉)：这里的颜色比城市里的更鲜艳（毒性更大）
            "stunky",         // 臭鼬噗：它的恶臭和某种化工厂气味混合在一起
            "varoom",         // (Gen 9) 噗隆隆：如果你听到引擎声，那就是它
            "salandit",       // 夜盗火蜥：这里的地面又毒又热，是天堂
            
            // 机会主义者
            "vullaby",        // 秃鹰丫头：盯着任何倒下的东西
            "houndour",       // 戴鲁比：像野狗一样成群行动
            "poochyena",      // 土狼犬
            "elekid",         // 电击怪：也许是在寻找遗留的电池
            "voltorb"         // 霹雳电球：滚动的危险
        ],

        // === Uncommon Pool: 剧毒捕食者与废土战士 (Lv 25-40) ===
        "uncommon": [
            // 毒系进阶
            { "id": "skuntank", "min": 34 },    // 坦克臭鼬：主要战斗力
            { "id": "garbodor", "min": 36 },    // 灰尘山：巨大的污染源 (Lore: 这片地就是它搞坏的)
            { "id": "weezing", "min": 35 },     // 双弹瓦斯(普通): 原味毒气
            { "id": "golbat", "min": 22 },      // 大嘴蝠：在这片空旷地极其凶狠
            
            // 恶徒与格斗家
            "scraggy",        // 滑滑小子：适应了沙尘暴
            "croagunk",       // 不良蛙：其实干燥废土也有，尤其是在毒水洼边
            "mightyena",      // 大狼犬
            "krokorok",       // 混混鳄
            "sneasel_hisui",  // 狃拉(洗翠)：格斗/毒，这种属性非常适合这篇废土
            
            // 硬派地质生物
            "carkol",         // 大炭车
            "lairon",         // 可可多拉的进化 -> 可多拉
            "orthworm",       // 拖拖蚓：钢铁巨虫
            "glimmet",        // 晶光芽：有毒的晶石
            "onix",           // 大岩蛇
            "dwebble"         // (Wait, Crustle better fits uncommon) -> "crustle" 岩殿居蟹
        ],

        // === Rare Pool: 末日后的变异与遗物 (Lv 35+) ===
        "rare": [
            // 稀有龙与高能生物
            "gible",          // 圆陆鲨：在被挖空的矿洞附近捕猎
            "pupitar",        // 沙基拉斯
            "duraludon",      // 铝钢龙：像残破的建筑一样矗立
            "druddigon",      // 赤面龙：只有这种面相凶恶的龙才生活在这里
            "toxtricity",     // 颤弦蝾螈 (Low Key 样子)：废土朋克
            "revaroom",       // 普隆隆姆：暴走的改装车队首领
            
            // 极其特殊的适应者
            "drapion",        // 龙王蝎：即使是 Waste 也是它的后花园
            "metang",         // 金属怪
            "bombirdier"      // 下石鸟：用这些带重金属污染的石头砸人
        ],

        // === Boss Pool: 荒原暴君与地质灾害 (Lv 45-65) ===
        // "This zone is red for a reason."
        "boss": [
            { "id": "tyranitar", "min": 55 },   // 班基拉斯：移动的天灾 (Roaming Boss)
            { "id": "archaludon", "min": 50 },  // (Gen 9 DLC) 铝钢桥龙：字面意义上的大基建/钢铁要塞
            { "id": "steelix", "min": 45 },     // 大钢蛇：能甚至嚼碎也是基岩
            { "id": "krookodile", "min": 42 },  // 流氓鳄：这里的老大
            { "id": "garganacl", "min": 42 },   // 盐石巨灵
            { "id": "nidoking", "min": 45 },    // 尼多王：这就是"大地的愤怒"具象化，毒/地面完美打击
            { "id": "skarmory", "min": 40 },    // 盔甲鸟：金属之翼
            { "id": "gliscor", "min": 42 }      // 天蝎王：荒原死神
        ]
    },


    // === 4. 红莲锻造市城区 (Pavement / Industrial) ===
    // 粗犷的重工业城市，充满轮子、传送带。即便安全区也充满油污味。
    // 生态位：格斗系(工人)、钢铁系(机械)、火系(动力)
    "Pavement": { /* 城市生活区 */
        "common": [
            "timburr",        // 搬运小匠：绝对的劳动力
            "machop",         // 腕力
            "meowth_galar",   // 喵喵(伽勒尔)：浑身铁锈色，最适合这里
            "growlithe",      // 卡蒂狗：普通的
            "rockruff",       // 岩狗狗
            "scraggy",        // 滑滑小子：街头混混
            "tyrogue",        // 无畏小子：这里的人崇尚武力
            "makuhita"        // 幕下力士
        ],
        "uncommon": [
            "machoke", "gurdurr", "houndour"
        ],
        "boss": [
            { "id": "machamp", "min": 40 }      // 怪力
        ]
    },

    "Industrial": { /* 冶炼厂与矿机区 */
        "common": [
            "klink",          // 齿轮儿
            "magnemite",      // 小磁怪
            "rolycoly",       // 小炭仔
            "varoom",         // 噗隆隆：废气引擎
            "slugma",         // 熔岩虫
            "numel",          // 呆火驼
            "bronzoa"         // 铜镜怪
        ],
        "uncommon": [
            "klang",          // 齿轮组
            "revaroom",       // 普隆隆姆
            "cufant",         // 铜象
            "magmar",         // 鸭嘴火兽
            "durant",         // 铁蚁：甚至会吃掉工厂设备
            "heatmor"         // 熔蚁兽
        ],
        "rare": [
            "metang",         // 金属怪
            "tinkatink",      // 小锻匠：来偷铁做锤子
            "beldum"
        ],
        "boss": [
            { "id": "revavroom", "min": 45 },   // 普隆隆姆
            { "id": "copperajah", "min": 45 },  // 大王铜象
            { "id": "heatran", "min": 50 }      // (Ultra Rare) 席多蓝恩：在某个深井盖下面???
        ]
    }
},
/* Zone: Inferno_Crater (The Living Volcano) */
/* Threat: Low (Base) -> Mid -> High -> Apex (Chamber) */
/* Terrain Focus: Vertical Z-Axis & Extreme Temperature */

"Inferno_Crater": {

    // === 1. 山脚下的地热工厂群 (Industrial) ===
    // 利用火山热能的发电设施和矿物加工厂。震动不断。
    // 生态位：热能吸取者、煤炭生物、劳动搬运工
    "Industrial": {
        "common": [
            "torkoal",        // 煤炭龟：到处都有，甚至堵塞了交通
            "rolycoly",       // 小炭仔
            "machop",         // 腕力：矿工协助
            "magnemite",      // 小磁怪
            "numel",          // 呆火驼
            "meowth_galar",   // 喵喵(伽勒尔)
            "growlithe",      // 卡蒂狗：普通的工地看门狗
            "slugma"          // 熔岩虫：如果有任何甚至很小的裂缝，它就会爬出来
        ],

        "uncommon": [
            // 重工进阶
            "carkol",         // 大炭车
            { "id": "magmar", "min": 30 },        // 鸭嘴火兽：喜欢工业废热
            { "id": "rotom_heat", "min": 1 },     // 洛托姆(加热)：在熔炉里狂欢
            //{ "id": "gurrdurr", "min": 25 },    // (上一轮写过了，换个别的) -> "haunter" 鬼斯通(死去的矿工?)
            "weezing",        // 双弹瓦斯：吸收硫磺气体
            "electabuzz"      // 电击兽
        ],

        "rare": [
            "charcadet",      // (Gen 9) 炭小侍：诞生在冷却的炉渣里，非常贴切
            "varoom",         // 噗隆隆 (Steel/Poison)
            "scyther"         // 飞天螳螂：被红光吸引?
        ],

        "boss": [
            { "id": "coalossal", "min": 45 },     // 巨炭山：守护着矿山的巨兽
            { "id": "electivire", "min": 48 },    // 电击魔兽
            { "id": "magmortar", "min": 48 }      // 鸭嘴炎兽
        ]
    },


    // === 2. 焦黑的黑曜石山坡/半山腰 (Scorched_Earth) ===
    // 中高威胁区 (Mid-High)。遍地都是锋利的黑曜石碎屑、硬化的熔岩流遗迹。
    // 空气中常年漂浮着使得视野模糊的热浪。
    // 生态位：热能蓄力者、厚重甲壳生物、利用毒气作为武器的火系
    "Scorched_Earth": {
        
        // === Common Pool: 灰烬中的幸存者 (Base Stage / Robust) ===
        // 即便是初始形态，也是硬碰硬的狠角色
        "common": [
            // 热火基部
            "numel",          // 呆火驼：背负着热量行动
            "slugma",         // 熔岩虫：在岩石缝隙里流淌
            "rolycoly",       // 小炭仔：遍地乱滚的活体煤炭
            "growlithe_hisui",// 卡蒂狗(洗翠)：这种带有玄武岩皮毛的狗最适合这里
            "vulpix",         // 六尾：火狐狸，以小火苗交流
            "pansear",        // 爆香猴：在高温岩石上烤果子
            "tepig",          // 暖暖猪：在这个充满热气的地方很开心的打滚
            
            // 岩石与剧毒
            "salandit",       // 夜盗火蜥：这里的每一块黑石头后面可能都藏着一只
            "aron",           // 可可多拉：正在把黑曜石当饭吃
            "geodude",        // 小拳石 (普通)：随地可见的障碍
            "roggenrola",     // 石丸子：坚硬的核心
            "glimmet",        // 晶光芽：有毒的晶花，开在焦土上
            "sandile",        // 黑眼鳄：保护色完美融入黑土
            "silicobra"       // 沙包蛇
        ],

        // === Uncommon Pool: 装备了装甲的战士 (Lv 25-38) ===
        "uncommon": [
            // 火力升级
            { "id": "charcadet", "min": 10 },   // (Gen 9 - Common/Uncommon) 炭小侍：诞生于战斗后的焦炭中，Seeking stronger foes
            { "id": "magby", "min": 1 },        // 鸭嘴宝宝 (高温区稍微稀有)
            { "id": "carkol", "min": 20 },      // 大炭车：快速移动本身就是武器
            { "id": "darumaka", "min": 1 },     // 达摩狒狒(普通)：像不倒翁一样耐打
            { "id": "litleo", "min": 1 },       // 小狮狮 (傲慢的)
            { "id": "houndour", "min": 1 },     // 戴鲁比 (群体狩猎)
            
            // 防御特化
            { "id": "graveler", "min": 25 },    // 隆隆石
            { "id": "boldore", "min": 25 },     // 地幔岩
            { "id": "lairon", "min": 32 },      // 可多拉：这种级别的防御力才能扛住滑坡
            { "id": "crustle", "min": 34 },     // 岩殿居蟹：用火山岩石做加壳
            
            // 危险的土著
            "marowak_alola",  // 嘎啦嘎啦(阿罗拉)：在荒地夜晚舞动磷火，引导亡魂
            "durant",         // 铁蚁：挖掘这坚硬的岩层
            "heatmor",        // 熔蚁兽：追着铁蚁喷火
            "trapinch"        // 大颚蚁
        ],

        // === Rare Pool: 为战斗而生的龙与火 (Lv 35+) ===
        "rare": [
            // 龙族试炼场
            "jangmo_o",       // (Gen 7) 心鳞宝：龙族战士，在这里借此恶劣环境修行
            "hakamo_o",       // 鳞甲龙：敲击鳞片的声音回荡在峡谷
            "druddigon",      // 赤面龙：利用因粗糙皮肤调节体温，依靠蛮力捕猎
            "axew",           // 牙牙
            
            // 极高温生物
            "larvesta",       // 燃烧虫：被信奉为太阳使者
            "tortunator",     // (Typo fix) -> "turtonator" 爆焰龟兽：伪装成带刺的岩石，触碰即炸
            "raboot",         // 腾蹴小将：可能是被那个武道格斗世家养在这的?
            "scyther"         // 飞天螳螂：在这焦土上外骨骼硬化得更快
        ],

        // === Boss Pool: 焦土统治者与暴怒之炎 (Lv 42-60) ===
        // 如果你看到周围的石头都融化了，说明这东西在附近
        "boss": [
            { "id": "camerupt", "min": 40 },    // 喷火驼：每一步都会在这个斜坡上引发小地震
            { "id": "salazzle", "min": 38 },    // 焰后蜥：统治着下方所有的Salandit，逆后宫之主
            { "id": "arcanine_hisui", "min": 45 }, // 风速狗(洗翠)：如同行走的山岩要塞
            { "id": "charizard", "min": 45 },   // 喷火龙：它占领了半山腰视野最好的平台
            { "id": "kommo_o", "min": 50 },     // 杖尾鳞甲龙：(Pseudo-Legendary) 峡谷中的格斗宗师
            { "id": "tyranitar", "min": 55 },   // 班基拉斯：不需要解释，它既然是岩石恶霸，那就一定在这
            { "id": "rhperior", "min": 50 },    // (Rhyperior) 超甲狂犀
            { "id": "magcargo", "min": 38 },    // 熔岩蜗牛：因为这里其实比火山口稍微冷一点，它的壳硬化了
            { "id": "aggron", "min": 42 }       // 波士可多拉
        ]
    },


    // === 3. 甚至难以立足的峭壁与断崖 (Rocky_Mountain) ===
    // 连接火山口(Apex)之前的最后屏障，垂直落差极大，气流紊乱。
    // 这里不是为了行走设计的，必须使用攀岩工具或飞行坐骑。
    // 生态位：高空掠食者、绝壁使用者、龙族试炼场
    "Rocky_Mountain": {
        
        // === Common Pool: 碎石与滑翔者 (Base Stage) ===
        // 小心头顶的落石——那可能是活的
        "common": [
            // 岩壁附着物
            "geodude",        // 小拳石：如果要把住手点，小心抓错
            "aron",           // 可可多拉：正在啃食岩盘里的铁矿
            "minior",         // 小陨星：大气层剥落的外壳，核心暴露会发光
            "klawf",          // (Gen 9) 毛崖蟹：垂直挂在岩壁上，眼珠转来转去搜寻猎物
            "ferroseed",      // 种子铁球：把刺钉入岩石固定自己
            "nosepass",       // 朝北鼻：像雕像一样一动不动指向磁北
            
            // 初级空战队
            "rufflet",        // 毛头小鹰：这是它们学会以勇毅面对强风的第一课
            "vullaby",        // 秃鹰丫头：等待掉下去摔死的其它怪
            "fletchinder",    // 火箭雀：热气流冲浪者 (注意：已经是进阶，但这里算初级战力)
            "skarmory",       // 盔甲鸟：把羽毛当作刀片插在岩缝里筑巢
            "bagon",          // 宝贝龙：真的会从悬崖上跳下来练习飞——“我相信我能飞”
            "noibat"          // 嗡蝠：在峡谷的回音中定位
        ],

        // === Uncommon Pool: 坚不可摧的登山家 (Lv 30-45) ===
        "uncommon": [
            // 进化的岩石意志
            { "id": "graveler", "min": 25 },    // 隆隆石：引发山崩的元凶
            { "id": "lairon", "min": 32 },      // 可多拉：为了争夺含有稀有金属的地盘而撞击
            { "id": "onix", "min": 20 },        // 大岩蛇：身体成了天然的栈道（或者隧道制造者）
            { "id": "crustle", "min": 34 },     // 岩殿居蟹：这里的岩层切面就是它们背着的
            { "id": "nacli_stack", "min": 24 }, // 盐石垒：(Gen 9) 喜欢高处的盐风?
            
            // 甚至有些狡猾的空中杀手
            "bombirdier",     // (Gen 9) 下石鸟：专门往攀岩的训练家头上扔石头
            "druddigon",      // 赤面龙：穴居龙族，依靠粗糙皮肤调节体温
            "solrock",        // 太阳岩：越接近山顶太阳辐射越强
            "lunatone",       // 月石：配合陨石坑
            "gligar"          // 天蝎：如果失去平衡跌落，它不仅会滑翔接住你，还会也是吃掉你
        ],

        // === Rare Pool: 龙之禁地 (Lv 40+) ===
        "rare": [
            // 真龙显现
            "shelgon",        // 甲壳龙：为了进化成暴飞龙，而在高处绝食/冥想
            "gabite",         // 尖牙陆鲨：极其凶猛，为了也是闪光的东西会攻击人
            "aerodactyl",     // 化石翼龙：天空的古老暴君，至今未也没灭绝的证明
            "archen",         // 始祖小鸟：虽然飞不远，但在跳崖滑翔方面是专家
            
            // 高维度的防御力
            { "id": "metang", "min": 20 },      // 金属怪：两只合体后智商增加
            { "id": "stonjourner", "min": 1 },  // 巨石丁：看起来像是一个通过该区域的人造拱门
            "duraludon"       // 铝钢龙：适应高海拔缺氧和宇宙射线
        ],

        // === Boss Pool: 天空与大地的断绝者 (Lv 50-65) ===
        // "Higher you climb, harder you fall."
        "boss": [
            // A区空战王牌
            { "id": "salamence", "min": 50 },   // 暴飞龙：一旦愤怒就会喷火烧光一切，终于实现了飞翔的梦想
            { "id": "braviary_hisui", "min": 50 }, // 勇士雄鹰(洗翠)：利用精神力在高空悬停，狩猎猎物
            { "id": "corviknight", "min": 45 }, // 钢铠鸦：空中装甲列车
            { "id": "archeops", "min": 40 },    // 始祖大鸟
            { "id": "garchomp", "min": 48 },    // 烈咬陆鲨：虽然是陆鲨，但也能以音速飞行，A区的速度化身

            // 山脉化身
            { "id": "gigalith", "min": 40 },    // 庞岩怪
            { "id": "aggron", "min": 42 },      // 波士可多拉：如果它是Boss，整个山头都是它私人的
            { "id": "tyranitar", "min": 55 },   // 班基拉斯：它可以轻易更改变地形，制造新的断崖
            { "id": "rhyperior", "min": 50 },   // 超甲狂犀
            { "id": "gliscor", "min": 45 }      // 天蝎王：即使在强风中也能无声悬停
        ]
    },


    // === 4. 活跃的岩浆池与火山口核心 (Magma) ===
    // 只有流动的高温熔体和零星的漂浮黑曜石板。
    // 这里不是陆地，掉下去的瞬间就是终结。只有那些身体结构允许它们把岩浆当作洗澡水的生物能在此存活。
    // 生态位：活体岩浆、热能核心、以极高温为食的特异点
    "Magma": {
        
        // === Common Pool: 熔流的一部分 (Base Stage / Fluid) ===
        // 它们的体温和岩浆同步
        "common": [
            "slugma",         // 熔岩虫：它就是岩浆的一溅
            "numel",          // 呆火驼：背上时刻装着岩浆，在这这里补充弹药
            "rolycoly",       // 小炭仔：在岩浆面上像黑色石头一样漂着滚动
            "torkoal",        // 煤炭龟：在极热中挖掘红莲煤矿
            "charcadet",      // (Gen 9) 炭小侍：诞生于未燃尽的焦炭余魂中
            "magby",          // 鸭嘴宝宝：在岸边最热的地方泡脚
            "pansear",        // 爆香猴：住在火山口内部的岩洞里
            "litwick",        // 烛光灵：这里的并不是吸食生命，而是这直接吸食燃烧反应
            "vulpix"          // 六尾 (如果有多块浮岩的话)
        ],

        // === Uncommon Pool: 燃烧的进阶者 (Lv 30-45) ===
        "uncommon": [
            // 硬核耐热
            { "id": "magcargo", "min": 38 },    // 熔岩蜗牛：体表温度1000度，壳是脆化的石头
            { "id": "carkol", "min": 20 },      // 大炭车
            { "id": "magmar", "min": 30 },      // 鸭嘴火兽：身体会发出红光的热浪
            { "id": "heatmor", "min": 1 },      // 熔蚁兽：体内的火焰足以烧穿岩石
            { "id": "turtonator", "min": 1 },   // 爆焰龟兽：伪装成火山口的爆炸岩石 (陷阱)
            { "id": "houndoom", "min": 24 },    // 黑鲁加：地狱看门口狗，口吐烧尽一切的火
            { "id": "sliggoo_hisui", "min": 40 }, // (Gen-LA) 黏美儿(洗翠): (Rare Idea?) 其实不适合这里，太热了。移除。
            
            // 悬浮/特殊机制
            { "id": "weezing", "min": 35 },     // 双弹瓦斯：吸食不仅有硫磺还有高毒瓦斯
            { "id": "rotom_heat", "min": 1 },   // 洛托姆(微波炉)：把岩浆的热能转化为微波，极其兴奋
            "sizzlipede"      // 烧火螟：如果岩壁上有可以攀爬的热管
        ],

        // === Rare Pool: 稀有的极热血脉 (Lv 40+) ===
        "rare": [
            // 珍贵的火焰
            "larvesta",       // 燃烧虫：火神蛾的幼体，被视为坠落在此的太阳火种
            "charmander",     // 小火龙 (野生?) -> "charmeleon" 火恐龙 (在这里历练) min: 16
            { "id": "flareon", "min": 1 },      // 火伊布：只有这里的温度能让它们保持最高光泽 (需要极高体质)
            
            // 下一代战士
            "armarouge",      // (Gen 9) 红莲铠骑：正义的铠甲，在这里利用地热锻造
            "ceruledge",      // (Gen 9) 苍炎刃鬼：利用这里的亡灵怨念锻造双剑
            "scovillain"      // (Gen 9) 狠雷椒怪：它是草/火，这里的独特变异植物
        ],

        // === Boss Pool: 行星的愤怒 (Lv 50-80) ===
        // 这一栏里的东西，每一次呼吸都能引发火山喷发 (Eruption)
        "boss": [
            { "id": "coalossal", "min": 45 },   // 巨炭山：当它激昂时，背上的矿石会散落点燃周围
            { "id": "magmortar", "min": 50 },   // 鸭嘴炎兽：能够甚至融化Boss级坚硬外壳的火力
            { "id": "camerupt", "min": 33 },    // 喷火驼 (Mega种)：每一座都是一个小火山
            { "id": "volcarona", "min": 59 },   // 火神蛾：A区的太阳，飞过之处落下火鳞粉
            { "id": "centiskorch", "min": 45 }, // 焚焰蚣：巨大的百足火鞭
            { "id": "chandelure", "min": 42 },  // 水晶灯火灵：吸取火山口庞大的灵魂能量
            { "id": "charizard", "min": 45 },   // 喷火龙：领空的霸主
            
            // 传说级别的相遇 (Apex Target)
            { "id": "open_heatran", "min": 70 },// (World Event?) 席多蓝恩 (天冠山的也是熔岩之主来到此地)
            { "id": "groudon", "min": 80 },     // 固拉多：大陆的创造者 (The Primal Land)
            { "id": "entei", "min": 65 }        // 炎帝：传闻它的吼叫能引起火山喷发
        ]
    },


    // === 5. 北坡-霜咬坡地冻结侧 (Snowfield) ===
    // 覆盖着火山灰的灰色积雪。虽然空气极冷，但地表偶尔会有温热的蒸汽裂缝。
    // 这是一种非常诡异的 "Steam Ice" 生态——也正因如此，这里的冰显得湿润且更滑。
    // 生态位：热能敏感虫类、高山龙族、拥有钢铁防御的适应者
    "Snowfield": {
        
        // === Common Pool: 灰烬雪行者 (Base Stage) ===
        "common": [
            // 热诱导生物 (被地热吸引)
            "snom",           // 雪吞虫：成群结队地趴在微微发热的地面裂缝上进食
            "swinub",         // 小山猪：用鼻子在这个混合了火山灰的土里找根茎
            "vanillite",      // 迷你冰：身体上混杂了一些黑色的灰尘
            "bergmite",       // 冰宝：伪装成被雪覆盖的岩石
            
            // 地区形态对照组 (有趣的生态对比)
            "darumaka_galar", // 达摩狒狒(伽勒尔)：在南坡是红色的，翻过山脊就变成白色的了，生态分界线十分明显
            "vulpix_alola",   // 六尾(阿罗拉)：在灰色雪地里非常显眼
            "sandshrew_alola",// 穿山鼠(阿罗拉)：兼具钢属性，非常适合这里的矿物雪地
            
            // 高山适应
            "delibird",       // 信使鸟：在高空物流网络里“迷路”或者休憩的
            "cubchoo",        // 喷嚏熊
            "sneasel",        // 狃拉：依靠锋利的爪子在冻结的熔岩管上攀爬
            "snorunt"         // 雪童子
        ],

        // === Uncommon Pool: 冰封的坚硬外壳 (Lv 30-45) ===
        "uncommon": [
            // 耐受高落差的进化体
            { "id": "piloswine", "min": 33 },   // 长毛猪：毛发浓密，足以抵挡带碎石的风
            { "id": "vanillish", "min": 35 },   // 多多多冰
            { "id": "sneasel_hisui", "min": 1 },// 狃拉(洗翠)：毒/格斗，意外地更适应这种这种有毒气的火山背面
            { "id": "sandslash_alola", "min": 22 }, // 穿山王(阿罗拉)：背上的冰刺像钢针一样
            
            // 漂浮与高压物体 - 这里靠近机械感十足的火山口内部
            { "id": "cryogonal", "min": 1 },    // 几何雪花：诞生于急速冷却的蒸汽中，如同工业产物
            { "id": "rotom_frost", "min": 1 },  // 洛托姆(冰箱)：不知哪个工厂丢弃的废冰箱，加上这就地取材的冷气
            { "id": "glalie", "min": 42 }       // 冰鬼护
        ],

        // === Rare Pool: 稀薄空气中的龙影 (Lv 40+) ===
        "rare": [
            // 高山龙族
            "frigibax",       // (Gen 9) 凉脊龙：这完全就是为您设计的——因为它的进化型能转换热能
            "drampa",         // 老翁龙：最经典的"住很高的山上"的龙，性格温和但发怒很可怕
            "duraludon",      // 铝钢龙：无论在哪一侧山坡都能活
            
            // 美丽但危险
            "amaura",         // 冰雪龙：叫声在山谷回荡
            "frosmoth",       // 雪绒蛾：平时必须小心翅膀沾上火山灰而无法飞行
            "articuno",       // 急冻鸟 (Ultra Rare) No, 换: -> 
            { "id": "ninetales_alola", "min": 1 }  // 九尾(阿罗拉)：被雪原旅者奉为神明
        ],

        // === Boss Pool: 冰火同源的终极生态 (Lv 50-70) ===
        "boss": [
            // 完美的适应者 (Apex Adaptation)
            { "id": "avalugg_hisui", "min": 45 }, // **冰岩怪(洗翠)**：【核心Boss】岩石/冰。这就是 Frostbite Slope 的具象化身，既是火山的岩石也是山顶的冰
            { "id": "darmanitan_galar", "min": 45 }, // **达摩狒狒(伽勒尔)**：如果它进入 "Zen Mode" (达摩模式) 就会变成【冰/火】双属性！没有比这更贴合"Inferno Crater Snowfield"的主题了！
            
            // 极寒巨兽
            { "id": "baxcalibur", "min": 55 },    // 戟脊龙：背棘的冷冻喷射
            { "id": "aurorus", "min": 48 },       // 冰雪巨龙
            { "id": "mamoswine", "min": 48 },     // 象牙猪
            { "id": "abomasnow", "min": 42 },     // 暴雪王
            { "id": "weavile", "min": 42 },       // 玛狃拉：极速猎手
            { "id": "crabominable", "min": 35 }   // 好胜毛蟹：原本试图登顶，结果在背面住下了
        ]
    }

},
/* Zone: Scorched_Dunes (The Red Desert) */
/* Threat: Safe (Outpost) -> Low -> Mid -> High -> Apex (Near Volcano) */
/* Weather: Sandstorm / Harsh Sunlight */

"Scorched_Dunes": {

    // === 1. 沙丘哨站/补给镇 (Pavement) ===
    // "Dune Watcher Post"。建立在磐石之上的休息点，挂着防风布帘。
    // 生态位：耐热的坐骑、被雇佣的安保、不仅不怕热反而甚至享受热的伴侣
    "Pavement": {
        "common": [
            // 哨站生活圈
            "meowth_alola",   // 喵喵(阿罗拉)：非常聪明，会跟旅行者讨水喝
            "lillipup",       // 哈约克：虽然毛多，但作为搜救犬不可或缺
            "fidough",        // 狗仔包：就是烤得香香的
            "bunnelby",       // 掘掘兔：也在这里挖洞纳凉
            "machop",         // 腕力：搬运重型水桶
            "pidove",         // 豆豆鸽：哪有建筑哪有它
            "skwovet"         // 贪心栗鼠
        ],

        "uncommon": [
            // 户外作业者
            "growlithe",      // 卡蒂狗：警卫
            "timburr",        // 搬运小匠
            "charcadet",      // 炭小侍：小镇火炉里的住客
            "torchic",        // 火稚鸡：虽然是火系但被家养了
            "maccino"         // -> "minccino" 泡沫栗鼠：扫除沙尘
        ],

        "rare": [
            "cyclizar",       // 摩托蜥：穿越沙漠的必备载具
            "chansey",        // 吉利蛋：医疗帐篷的护士
            "rotom",          // 洛托姆：为了吹电风扇
            "smeargle",       // 图图犬：路过的行脚画家
            "eevee"           // 伊布
        ],

        "boss": [
            // 镇守者
            { "id": "conkeldurr", "min": 40 },  // 修建老匠：据点维护工头
            { "id": "blissey", "min": 35 },     // 幸福蛋：这片不毛之地的神迹
            { "id": "arcanine", "min": 35 },    // 风速狗 (普通)：它主要在铺装路上守卫，不下沙海
            { "id": "revavroom", "min": 40 }    // 普隆隆姆：被停在车库里的暴走引擎
        ]
    },


    // === 2. 漫无边际的红沙之海 (Desert_Sand) ===
    // 覆盖全图70%的主体。这里没有路，只有不断被风改变形状的沙脊。
    // 如果你停下，你的脚就会陷进去，然后可能会踩到什么不得了的东西。
    // 生态位：沙游者、耐旱甲壳、沙漠清道夫、远古猎手
    "Desert_Sand": {
        
        // === Common Pool: 沙海基底 (Base Stage / Adapters) ===
        // 数量极大，在任何时间段都能遭遇
        "common": [
            // 沙下游动者
            "sandile",        // 黑眼鳄：数量很多，通常只露出一对眼睛
            "shroodle",       // (Gen 9) 滋汁鼹：在沙岩上画地标
            "rellor",         // (Gen 9) 虫滚泥：沙漠清道夫，推着红色的土球
            "silicobra",      // 沙包蛇：盘起来睡觉，这是保护湿气的方式
            "trapinch",       // 大颚蚁：真正的地雷，踩进去就是一个沙漏坑
            "sandshrew",      // 穿山鼠(普通)：蜷缩起来不仅防御，还能快速下坡
            "diglett",        // 地鼠：在较硬的沙层下穿梭
            
            // 甲壳与耐热植被
            "cacnea",         // 刺球仙人掌：如果不想被吃掉，就要长刺
            "dwebble",        // 石居蟹：这里的石居蟹背着红色的砂岩
            "bramblin",       // 纳噬草：风什么时候吹，它们什么时候动
            "helioptile",     // 伞电蜥：张开颈部的伞吸收太阳光
            "nacli",          // 盐石宝：盐漠化严重，喜欢舔岩石
            
            // 大型哺乳类（吃少量草根）
            "hippopotas",     // 沙河马：沙浴这种行为就是这里的自然景观
            "rhyhorn",        // 独角犀牛：硬皮足以抵挡沙暴磨损
            "skwovet",        // 贪心栗鼠：比一般的瘦一点
            "bunnelby"        // 掘掘兔：耳朵当铲子用
        ],

        // === Uncommon Pool: 熟练的荒原猎人 (Lv 28-42) ===
        "uncommon": [
            // 主动出击的捕食者
            { "id": "vibrava", "min": 35 },     // 超音波幼虫：声音武器，会把猎物震晕
            { "id": "krokorok", "min": 29 },    // 混混鳄：开始有团队协作意识
            { "id": "sandaconda", "min": 36 },  // 沙螺蟒：储沙囊鼓鼓的
            { "id": "rabsca", "min": 25 },      // (Gen 9) 虫甲圣：(以滚虫进化) 用甚至超能力保护它的泥球
            { "id": "maractus", "min": 1 },     // 街头沙铃：用舞蹈求雨（或求关注）
            { "id": "naclstack", "min": 24 },   // 盐石垒
            
            // 来自天空的威胁
            "gligar",         // 天蝎：滑翔无声
            "vullaby",        // 秃鹰丫头：盯着力竭的旅行者
            "fearow",         // 大嘴雀：这是荒地最凶的鸟
            
            // 沙漠里奇怪的伏击陷阱
            "stunfisk",       // 泥巴鱼：这里没有泥，它埋在软沙里放电
            "baltoy",         // 天秤偶：古代文明遗留?
            "ferroseed",      // 种子铁球：别以为它是石头就踢它
            "orthworm"        // 拖拖蚓：偶尔探头
        ],

        // === Rare Pool: 沙暴中的阴影与龙 (Lv 40+) ===
        "rare": [
            // 地面与龙的霸主血脉
            "gible",          // 圆陆鲨：沙鲨鱼，咬住了就不松口 (Iconic Rare!!)
            { "id": "gabite", "min": 24 },      // 尖牙陆鲨：为了鳞片收集闪光物
            "larvesta",       // 燃烧虫：这里的沙子被火神蛾加温过
            "pupitar",        // 沙基拉斯：正在积蓄足以甚至崩坏山脉的力量
            "onix",           // 大岩蛇：在地底造成的震动如同微型地震
            
            // 特殊适应者/进化困难户
            "scovillain",     // 狠雷椒怪： (Capsakid evolution)
            "mandibuzz",      // 秃鹰娜
            "runerigus"       // 死神板：迷失在沙漠中的石版
        ],

        // === Boss Pool: 统治旱海的古老力量 (Lv 50-65) ===
        // "Sandstorm approaching... colossal lifeform detected."
        "boss": [
            // 四天王/冠军级的招牌
            { "id": "garchomp", "min": 60 },    // 烈咬陆鲨：A 区沙漠速度的顶点，在地面游动比在天上飞还恐怖
            { "id": "flygon", "min": 45 },      // 沙漠蜻蜓：被称为沙漠精怪，沙暴是它的屏障
            { "id": "krookodile", "min": 42 },  // 流氓鳄：A区最狡猾的掠食者领袖
            { "id": "hippowdon", "min": 42 },   // 河马兽：吞噬沙子，制造沙丘
            { "id": "tyranitar", "min": 58 },   // 班基拉斯：移动的天灾 (Roaming Super Boss) -> 沙暴天气的永动机
            
            // 沙漠植物的逆袭
            { "id": "brambleghast", "min": 38 },// (Gen 9) 怖纳噬草：极其巨大的风滚草幽灵
            { "id": "cacturne", "min": 35 },    // 梦歌仙人掌：如果在晚上生成的Boss，那它不是在等你，是在猎杀你
            
            // 钢铁巨兽
            { "id": "steelix", "min": 45 },     // 大钢蛇
            { "id": "garganacl", "min": 45 }    // 盐石巨灵
        ]
    },


    // === 3. 沙漠北部的硬化荒地过渡带 (Waste) ===
    // 接近火山脚下，沙子变少了，更多是碎矿渣和坚硬的毒土。地形陡峭。
    // 生态位：钢系、毒/地混合、化石复活区
    "Waste": {
        "common": [
            "trubbish",       // 破破袋
            "grimer_alola",   // 臭泥(阿罗拉)：在吃矿物废渣
            "orthworm",       // (Gen 9) 拖拖蚓：从硬土里探出巨大的金属头
            "roggenrola",     // 石丸子
            "diglett_alola",  // 地鼠(阿罗拉)：必须要是钢头才能顶破这种地
            "onix",           // 大岩蛇
            "dwebble"         // 石居蟹：这里的石居蟹背着黑色的玄武岩
        ],

        "uncommon": [
            "koffing",        // 瓦斯弹
            "garbodor",       // 灰尘山
            "steelix",        // 大钢蛇：钻地留下的洞
            "boldore",        // 地幔岩
            "glimmet"         // 晶光芽
        ],

        "rare": [
            "duraludon",      // 铝钢龙：像建筑物残骸一样站着
            "skarmory",       // 盔甲鸟
            "pupitar",        // 沙基拉斯：在硬壳中积蓄力量 (非常适合Waste)
            "shieldon",       // 盾甲龙
            "cranidos"        // 头盖龙
        ],

        "boss": [
            { "id": "aggron", "min": 42 },      // 波士可多拉
            { "id": "rhyperior", "min": 50 },   // 超甲狂犀
            { "id": "copperajah", "min": 45 },  // 大王铜象
            { "id": "iron_treads", "min": 58 }  // (Paradox - Donphan) 铁辙迹：(Extreme Rare Boss) 像是未来坦克的战车
        ]
    },


    // === 4. 生机断绝之处的奇迹：沙丘绿洲 (Fresh_Water) ===
    // 并不是公园那种清澈的水，稍微有点浑浊，但这就是沙漠的命。
    // 生态位：极端耐旱的水系（鲶鱼/泥鳅）、被水吸引的飞行与草食系
    "Fresh_Water": {
        "common": [
            // 底层耐受鱼
            "barboach",       // 泥泥鳅
            "whiscash",       // 鲶鱼王：绿洲的霸主，占据最好的深水区
            "wooper_paldea",  // 乌波(帕底亚)：其实这里的水质不咋地
            "remoraid",       // 铁炮鱼：(共生关系)
            "magikarp",       // 鲤鱼王：生命力顽强
            "lotad",          // 莲叶童子：只有这一小片叶子
            "surskit"         // 溜溜糖球
        ],

        "uncommon": [
            "lombre",         // 莲帽小童
            "quagsire",       // 沼王
            "stunfisk",       // 泥巴鱼：小心水边的泥地
            "psyduck",        // 可达鸭：可能是迷路来的
            "marill",         // 玛力露
            "masquerain",     // 雨翅蛾：可以飞行寻找下一个水塘
            "basculin_white_striped" // 野蛮鲈鱼(白条/洗翠)：更古老更有野性
        ],

        "rare": [
            "feebas",         // 笨笨鱼：只有在某个特定的阴影格子里...
            "gyarados",       // 暴鲤龙：如果这个水池够大...
            "drednaw",        // 暴噬龟：性格暴躁的乌龟
            "vaporeon"        // 水伊布：沙漠传说
        ],

        "boss": [
            { "id": "whiscash", "min": 35 },    // 鲶鱼王 (地震也是它放的)
            { "id": "gyarados", "min": 30 },    // 暴鲤龙
            { "id": "seismitoad", "min": 38 },  // 蟾蜍王
            { "id": "swampert", "min": 45 }     // 巨沼怪：只有最强的两栖类才能霸占绿洲
        ]
    },


    // === 5. 绿洲边缘也是仅有的植被区 (Standard_Grass) ===
    // 围绕着水源的一圈绿化带，是食草动物的甚至必争之地。
    // 生态位：草食性的、需要喝水的、伏击草食动物的
    "Standard_Grass": {
        "common": [
            // 来喝水的/争夺树荫的
            "skiddo",         // 小骑山羊：耐渴
            "goat",           // (Gogoat) -> skiddo evo in uncommon
            "rhyhorn",        // 独角犀牛
            "mudbray",        // 泥驴仔
            "deerling",       // 四季鹿 (夏季/绿色)：这有些稀有了
            "cacnea",         // 刺球仙人掌：更靠近水反而长得更好
            "maractus",       // 街头沙铃
            "hoppip",         // 毽子草：想要喝水
            "tropius"         // 热带龙：本身就是水果提供者，它们就是会动的绿洲
        ],

        "uncommon": [
            "gogoat",         // 坐骑山羊
            "mudsdale",       // 重泥挽马
            "scyther",        // 飞天螳螂：在这小片绿地里称霸
            "girafarig",      // 麒麟奇
            "doduo",          // 嘟嘟
            "carnivine",      // 尖牙笼
            "sunflora"        // 向日花怪：这里阳光正好，水也够
        ],

        "rare": [
            // 稀有的草系流浪者
            "meganium",       // 大竺葵：(Super Rare - Starter) 据说它的呼吸可以让枯草复苏，它是这片绿洲的守护神话
            "bayleef",        // 菊草叶 -> leaf
            "chikorita",      // 菊草叶
            "lilligant",      // 裙儿小姐：如果这里开花了
            "zarude"          // (Mythical - Maybe not spawn, just lore) -> replace with "decidueye" (Base form)
        ],

        "boss": [
            { "id": "meganium", "min": 45 },    // [大竺葵]：绿洲之心Boss
            { "id": "venusaur", "min": 45 },    // 妙蛙花：雨林之王在沙漠里就是神
            { "id": "hippowdon", "min": 40 },   // 河马兽：其实也想泡澡
            { "id": "cradily", "min": 40 }      // 摇篮百合：古代海草复活！
        ]
    }
},
/* Zone: Obsidian_Beach (The Razor Coast) */
/* Threat: Low (South) -> Mid(Central) -> High (North/Vents) */
/* Terrain Focus: Volcanic Glass / Boiling Water / Sharp Cliffs */

"Obsidian_Beach": {

    // === 1. 破碎的黑曜石滩涂 (Scorched_Earth) ===
    // 覆盖地表的也是是黑色的火成岩碎块，有些还带着余温。
    // 在这上面行走如果不小心会割破鞋子。
    // 生态位：有着坚硬外壳的蟹类 / 古代海龟 / 能够利用地热的爬行类
    "Scorched_Earth": {
        
        // === Common Pool: 黑色海岸的原住民 (Base Stage) ===
        "common": [
            // 甲壳与碎片
            "binacle",        // 龟脚脚：大量吸附在黑曜石礁石上，非常割手 (数量No.1)
            "dwebble",        // 石居蟹：这里的个体不管是背的还是本体都是深黑色的
            "krabby",         // 大钳蟹：在这种满是缝隙的地观上很灵活
            "shellder",       // 大舌贝
            "clauncher",      // 铁臂枪虾
            
            // 地热适应者
            "torkoal",        // 煤炭龟：在海边被水浪打到身体发出"呲呲"的蒸汽声
            "rolycoly",       // 小炭仔：在黑色的底色里只能看见红红的眼睛
            "numel",          // 呆火驼
            "sandile",        // 黑眼鳄：黑色变种?
            
            // 坚硬的慢步者
            "shuckle",        // 壶壶
            "chewtle",        // 咬咬龟：脾气很暴
            "tirtouga",       // 原盖海龟：(Rare Base? 既然是黑曜石滩，提升为 Uncommon/Common) 活化石
            "aron"            // 可可多拉
        ],

        // === Uncommon Pool: 沸水的住民 (Lv 25-40) ===
        "uncommon": [
            // 有攻击性的硬壳
            { "id": "barbaracle", "min": 39 },  // 龟足巨铠：成群地站在礁石上，像极了克苏鲁生物，非常有压迫感
            { "id": "kingler", "min": 28 },     // 巨钳蟹
            { "id": "blastoise", "min": 36 },   // 水箭龟：(Rare spawn within shells) - 不，换成 "wartortle" 卡咪龟
            "wartortle",      // 卡咪龟 (Min 16)
            
            // 锋利与蒸汽
            "graveler_alola", // 隆隆石(阿罗拉)：电/岩，这里也导电? No, keep focus on Rock/Fire/Water.
            // 用这个代替:
            "carkol",         // 大炭车
            "corsola",        // 太阳珊瑚 (普通)：喜欢热水
            "cursola",        // 魔灵珊瑚 (伽勒尔)：(在北边更高温/毒气重的地方出现的死去的珊瑚壳)
            
            // 本地特化
            "skrelp",         // 垃垃藻：这里的“藻”其实是黑色的矿物纤维
            "mareanie",       // 坏星：猎杀珊瑚
            "kabuto",         // 化石盔：像鲎一样爬上岸
            "qwilfish_hisui"  // (Gen-LA) 千针鱼(洗翠)：这里的水有毒且热
        ],

        // === Rare Pool: 深海热泉的访客 (Lv 40+) ===
        "rare": [
            // 拥有坚不可摧防御的单位
            "turtonator",     // 爆焰龟兽：拟态成一块奇怪的硫磺石
            "klawf",          // (Gen 9) 毛崖蟹：从悬崖上下到滩涂找东西吃
            "pyukumuku",      // 拳海参
            "drednaw",        // 暴噬龟
            
            // 古代霸主前置
            "kabutops",       // 镰刀盔：它的镰刀和这里的石头一样锋利 (High Lethality)
            "carracosta",     // 肋骨海龟
            "golisopod"       // 具甲武者：(Min 30/Require wimpod evo? No, wild spawn)
        ],

        // === Boss Pool: 黑岸的巨兽 (Lv 45-60) ===
        "boss": [
            { "id": "barbaracle", "min": 45 },  // 龟足巨铠（领主级）：极其巨大，像是指挥这片乱石阵
            { "id": "carracosta", "min": 40 },  // 肋骨海龟：坚不可摧的移动堡垒
            { "id": "kabutops", "min": 42 },    // 镰刀盔：海滩上的收割者
            { "id": "clawitzer", "min": 40 },   // 钢炮臂虾
            { "id": "turtonator", "min": 35 },  // 爆焰龟兽 (Living Mine)
            { "id": "coalossal", "min": 45 }    // 巨炭山：当它入水时，周围全部沸腾
        ]
    },


    // === 2. 也是无法立足的垂直玄武岩壁 (Rocky_Mountain) ===
    // 从海中直插云霄的六棱柱状玄武岩柱（Basalt Columns）。海浪直接拍碎在上面。
    // 生态位：悬崖伏击者、刀锋磨砺者、空中掠食生物
    "Rocky_Mountain": {
        "common": [
            // 攀附在潮湿且锋利岩壁上的
            "binacle",        // 龟脚脚 (它们是垂直附着的专家)
            "klawf",          // (Gen 9) 毛崖蟹：这就是它的绝对领域 (Titan Flavor)
            "geodude",        // 小拳石
            "roggenrola",     // 石丸子
            "dwebble",        // 石居蟹
            "nosepass",       // 朝北鼻
            "skarmory",       // 盔甲鸟：常常下来在黑曜石上磨爪子
            "onix",           // 大岩蛇：把身驱缠在石柱上
            "drillbur"        // 螺钉地鼠
        ],

        "uncommon": [
            // 进化的岩石兵器
            { "id": "boldore", "min": 25 },     // 地幔岩
            { "id": "graveler", "min": 25 },    // 隆隆石
            { "id": "lycanroc_midnight", "min": 25 }, // 鬃岩狼人(黑夜)：在黑色的岩壁上跳跃，只有红眼睛在发光
            "braviary",       // 勇士雄鹰
            "archeops",       // 始祖大鸟
            "minior",         // 小陨星：(海边的陨石坑)
            "aerodactyl"      // 化石翼龙
        ],

        "rare": [
            // 刀锋的磨砺
            "scyther",        // 飞天螳螂
            "kleavor",        // (Gen-LA) 劈斧螳螂：【Lore Drop】这里产出最纯粹的黑曜石(Black Augurite)，所以这里的螳螂进化成了劈斧螳螂！ (Ultra Rare)
            "scizor",         // 巨钳螳螂：更适应这种硬度
            "gligar",         // 天蝎
            "metang"          // 金属怪
        ],

        // === Boss Pool: 潮汐与黑岩的主宰 (Lv 50-70) ===
        "boss": [
            { "id": "kleavor", "min": 50 },     // [劈斧螳螂]：这片黑曜石悬崖的顶级掠食者，不仅砍断岩石也砍断海浪 (Zone Unique)
            { "id": "aerodactyl", "min": 45 },  // 化石翼龙
            { "id": "aggron", "min": 48 },      // 波士可多拉：如果悬崖自己动了，那是它
            { "id": "tyranitar", "min": 60 },   // 班基拉斯：在海边怒吼
            { "id": "volcanion", "min": 70 }    // (Mythical - Easter Egg only) 波尔凯尼恩：水与火的甚至结合 (Steam Pokemon)，没有比这里更适合它的家了
        ]
    }
},
/* Zone: Frostbite_Slope (The Steam-Ice Paradox) */
/* Threat: Low(East) -> Mid -> High(Central) */
/* Theme: Thermal Vents / Grey Snow / Opposing Elements */

"Frostbite_Slope": {

    // === 1. 脆弱的冻结火山岩壁 (Rocky_Mountain) ===
    // 山脚与侧翼。红色的岩石被一层薄薄的脆冰覆盖。行走时会发出玻璃碎裂的声音。
    // 生态位：攀岩生物、寻找热源的虫类、依靠岩石温度孵化的蛋
    "Rocky_Mountain": {
        
        // === Common Pool: 破碎岩壁的生灵 (Base Stage) ===
        "common": [
            // 追热者
            "snom",           // 雪吞虫：成群挤在有地热的岩缝里
            "larvesta",       // 燃烧虫：在此吸取也是地底的热量孵化
            "rolycoly",       // 小炭仔：本身有温度，不怕冻
            "rogderola",      // (Typo fix) -> "roggenrola" 石丸子
            "sizzlipede",     // 烧火螟：捕食雪吞虫（冰/火的生态链）
            
            // 极地岩石
            "geodude_alola",  // 小拳石(阿罗拉)：带磁力，吸附在含铁的黑石头上
            "minior",         // 小陨星：在冷空气中核心不会过热
            "carbink",        // 小碎钻：藏在冰晶洞穴里
            "bergmite",       // 冰宝：伪装成一块冰石头
            "machop"          // 腕力：依靠锻炼产生的热量抵御寒冷
        ],

        // === Uncommon Pool: 冰裂峡谷的猎手 (Lv 30-40) ===
        "uncommon": [
            // 硬壳进化
            { "id": "graveler_alola", "min": 25 }, // 隆隆石(阿罗拉)
            { "id": "magcargo", "min": 38 },       // 熔岩蜗牛：壳因为快速冷却而变脆，但依然极热
            { "id": "crustle", "min": 34 },        // 岩殿居蟹
            { "id": "centiskorch", "min": 28 },    // 焚焰蚣：甚至融化了挡路的冰
            { "id": "boldore", "min": 25 },        // 地幔岩
            { "id": "piloswine", "min": 33 },      // 长毛猪：用象牙凿开岩石
            
            // 高山适应
            "skarmory",       // 盔甲鸟：无视极赛温差的金属羽毛
            "absol",          // 阿勃梭鲁：预警上方发生的雪崩或岩崩
            "drampa",         // 老翁龙：在云层高度
            "gligar",         // 天蝎
            "sneasel"         // 狃拉
        ],

        // === Rare Pool: 奇迹的共生 (Lv 40+) ===
        "rare": [
            "frigibax",       // (Gen 9) 凉脊龙：在此处练习热交换能力 (Dragon/Ice)
            "glimmet",        // 晶光芽：有毒的晶花
            "larvitar",       // 幼基拉斯：甚至把冰当零食吃
            "amaura",         // 冰雪龙：太古的极光种
            "arctibax",       // 冻脊龙
            { "id": "volcarona", "min": 59 } // 火神蛾：如果运气极好，能在暴风雪中见到从这里升起的一轮太阳... (0.1% Rare)
        ],

        // === Boss Pool: 甚至是冻结的修罗场 (Lv 45-60) ===
        "boss": [
            { "id": "aurorus", "min": 45 },     // 冰雪巨龙
            { "id": "mamoswine", "min": 45 },   // 象牙猪：攀岩能手
            { "id": "gigalith", "min": 40 },    // 庞岩怪
            { "id": "garganacl", "min": 42 },   // 盐石巨灵
            { "id": "coalossal", "min": 48 },   // 巨炭山：如果它发怒，整个坡地的冰都会融化造成洪水
            { "id": "kleavor", "min": 50 }      // 劈斧螳螂：在最陡峭的岩壁削冰
        ]
    },


    // === 2. 覆盖火山灰的永久冻土 (Snowfield) ===
    // 覆盖在蒸汽裂缝之上的灰色积雪 (灰雪)。
    // 这里非常滑，而且如果有蒸汽喷出，视野会瞬间归零。
    // 生态位：热转换者、冰/钢复合体、极巨生物
    "Snowfield": {
        
        // === Common Pool: 蒸汽与绒毛 (Base Stage) ===
        "common": [
            // 对照组：冰与钢
            "sandshrew_alola",// 穿山鼠(阿罗拉)：钢属性让它无视脚下的热岩石带来的冲击
            "vulpix_alola",   // 六尾(阿罗拉)：在蒸汽中保养毛发
            "snorunt",        // 雪童子
            "cubchoo",        // 喷嚏熊
            "cetoddle",       // 走鲸：陆地鲸鱼，主要群体
            "swinub",         // 小山猪
            
            // 地区特色
            "darumaka_galar", // 达摩狒狒(伽勒尔)：这里是它转换形态的关键点
            "vanillite",      // 迷你冰：被火山灰染成了有点灰的颜色
            "delibird",       // 信使鸟：给在山上这里考察的人送物资(或扔炸弹)
            "cryogonal",      // 几何雪花：随蒸汽上升形成
            "glimmet"         // 晶光芽：在灰雪中闪烁
        ],

        // === Uncommon Pool: 冰封防线 (Lv 30-45) ===
        "uncommon": [
            // 进阶的捕食者
            { "id": "beartic", "min": 37 },     // 冻原熊
            { "id": "sandslash_alola", "min": 22 }, // 穿山王(阿罗拉)：背上的冰刺坚硬如钢
            { "id": "ninetales_alola", "min": 1 },  // 九尾(阿罗拉)：(Item Evo, rare find)
            { "id": "vanillish", "min": 35 },   // 多多多冰
            { "id": "crabominable", "min": 30 },// 好胜毛蟹：试图登顶但失败了
            { "id": "weavile", "min": 40 },     // 玛狃拉：极速猎手，利用爪子即使在冰面也不会打滑
            
            // 蒸汽利用者
            { "id": "torkoal", "min": 30 },     // 煤炭龟：(少见的跑到雪地里的火系，为了冷却?)
            "rotom_frost"     // 洛托姆(冰箱)
        ],

        // === Rare Pool: 下个世代的冰河期 (Lv 45+) ===
        "rare": [
            // 强大的龙与兽
            "baxcalibur",     // 戟脊龙 (Pseudo Legendary) -> No, put boss. Rare: "frigibax"
            { "id": "cetitan", "min": 35 },     // 浩大鲸
            "eiscue",         // 冰砌鹅
            "frosmoth",       // 雪绒蛾：极具威胁
            "duraludon",      // 铝钢龙
            
            // Paradox (悖谬种 - Hidden)
            { "id": "iron_bundle", "min": 50 }  // [铁包袱]：它不需要体温，它是为了极端环境制造的机器
        ],

        // === Boss Pool: 极寒与极热的最终融合 (Lv 50-70) ===
        // "Temperature Critical. Massive Lifeform Detected."
        "boss": [
            // 地域限定 BOSS
            { "id": "darmanitan_galar", "min": 50 }, // **达摩狒狒(伽勒尔·达摩模式)**：【冰/火】双属性的完美象征。它就是Frostbite Slope的活体图腾。
            
            // 远古地质霸主
            { "id": "avalugg_hisui", "min": 48 },    // **冰岩怪(洗翠)**：【岩石/冰】双属性。像破冰船一样碾碎这里的岩石地面。
            { "id": "baxcalibur", "min": 55 },       // 戟脊龙：背棘喷射极低温冷气
            { "id": "abomasnow", "min": 45 },        // 暴雪王：Mega进化潜能?
            { "id": "glalie", "min": 42 },           // 冰鬼护
            { "id": "walrein", "min": 45 },          // 帝牙海狮
            { "id": "heatran", "min": 60 }           // (Roaming Legend) 席多蓝恩：虽然是火/钢，但它可能在寻找最冷的地方冷却甲壳
        ]
    }
},

/* Zone: Savanna_Outlands (The Golden Plains) */
/* Threat: Low (South) -> Mid (North) */
/* Theme: Safari / Migration / Pack Hunting / Speed */

"Savanna_Outlands": {

    // === 1. 广阔的短草放牧区 (Standard_Grass) ===
    // 覆盖A区南端80%的通过型区域。金黄色的短草甸被阳光暴晒。
    // 这里是食草者的大迁徙路线，也是掠食者的自助餐厅。
    // 生态位：有蹄类兽群、蝗灾虫群、鸵鸟与猛禽、土穴挖掘者
    "Standard_Grass": {
        
        // === Common Pool: 迁徙兽群与害虫 (Base Stage / Level 15-25) ===
        "common": [
            // 大草原有蹄类 (数量最大)
            "blitzle",        // 斑斑马：成群结队的黑白条纹
            "tauros",         // 肯泰罗(普通)：横冲直撞的公牛，平原的基础战力
            "miltank",        // 大奶罐：通常和肯泰罗混居
            "girafarig",      // 麒麟奇：用反光的尾巴晃瞎捕食者
            "ponyta",         // 小火马：在烈日下奔跑
            "mudbray",        // 泥驴仔：吃苦耐劳的驴
            "deerling",       // 四季鹿 (秋季只有黄色，完美伪装)
            
            // 啮齿与小兽 (数量次之)
            "patrat",         // 探探鼠：站立警戒（经典猫轴草风格）
            "sentret",        // 尾立：充当望风者
            "yungoos",        // 猫鼬少：外来入侵的吃货
            "bunnelby",       // 掘掘兔：到处而且也是打洞
            "lillipup",       // 哈约克：作为游荡的野狗群
            
            // 草原昆虫 (覆盖物)
            "nymble",         // (Gen 9) 豆蟋蟀：像蝗灾一样多，在草尖跳跃
            "cutiefly",       // 萌虻：给稀有的花授粉
            "tarountula",     // (Gen 9) 团珠蛛：把自己裹成泥球滚来滚去
            "kricketot"       // 圆法师：为这片平原提供BGM
        ],

        // === Uncommon Pool: 亚成体与中型掠食者 (Level 25-35) ===
        // *严格加入了等级限制 (min)*，确保不会出现也就是幼年碾压现象
        "uncommon": [
            // 幼狮/幼犬的狩猎练习
            "litleo",         // 小狮狮：在草丛里扑咬大人的尾巴
            "electrike",      // 落雷兽：高速追逐
            "poochyena",      // 土狼犬：这就是鬣狗生态位，专门跟在狮子后面拣剩饭
            "shinx",          // 小猫怪
            "houndour",       // 戴鲁比：这里的黑狗可能在和其他野狗抢食
            
            // 进化的草食者 (群体领队)
            { "id": "herdier", "min": 16 },     // 哈约克：游荡狗群的小头目
            { "id": "watchog", "min": 20 },     // 步哨鼠：警戒等级提升，甚至会吐发光种子
            { "id": "furret", "min": 15 },      // 大尾立：跑得很快的长条生物
            { "id": "diggersby", "min": 20 },   // 掘地兔：用耳朵当挖掘机拓宽河道
            
            // 草原特化生物
            "doduo",          // 嘟嘟：以极高的速度飞奔而过的鸵鸟
            "corn",           // -> "flittle" (Gen 9) 飘飘雏：鸵鸟幼崽，依靠超能力悬浮适应长途跋涉
            "phanpy",         // 小小象：如果附近有泥坑
            "skiddo",         // 小骑山羊：能够甚至喝很少的水生存
            "rhyhorn",        // 独角犀牛：硬皮能抗住草原的任何攻击
            "vullaby"         // 秃鹰丫头：开始在伤者头顶盘旋
        ],

        // === Rare Pool: 稀有种群与暴徒 (Level 32+) ===
        "rare": [
            // 强大的独行侠
            "kangaskhan",     // 袋兽：为了保护口袋里的孩子可以和任何东西拼命
            "farfetchd_galar",// 大葱鸭(伽勒尔)：手持巨大“长枪”的流浪骑士
            "zangoose",       // 猫鼬斩：独自在草地巡逻，寻找饭匙蛇
            "absol",          // 阿勃梭鲁：预告即将到来的旱灾
            "bouffalant",     // 爆炸头水牛：(Uncommon -> Rare in Standard Grass) 因为这东西太强了，草丛里出现是惊喜也是惊吓
            
            // 高级进化型 (偷跑)
            { "id": "luxio", "min": 15 },       // 勒克猫
            { "id": "mightyena", "min": 18 },   // 大狼犬：(Rare Spawn，如果作为单只)
            { "id": "lokix", "min": 24 },       // (Gen 9 - Nymble Evo) 烈腿蝗：变身模式开启的黑色蝗虫骑士
            { "id": "espathra", "min": 35 }     // (Gen 9) 超能鸵鸟：艳丽且致命
        ],

        // === Boss Pool: 能够引发践踏的超级野兽 (Level 40-55) ===
        "boss": [
            // "Stampede Alert!"
            { "id": "zebstrika", "min": 40 },   // 雷电斑马：如果不跑起来连电都发不出来
            { "id": "dodrio", "min": 35 },      // 嘟嘟利：三个头同时警戒
            { "id": "rapidash", "min": 40 },    // 烈焰马：平原上移动的火墙
            { "id": "uncial", "min": 42 },      // -> Typo "braviary"? Yes. { "id": "braviary", "min": 54 } 勇士雄鹰：领空凝视者 (Gen 5 Evolve Late)
            { "id": "donphan", "min": 40 },     // 顿甲：高速滚动的轮胎象
            { "id": "tauros_paldea_combat", "min": 35 }, // 肯泰罗(斗战种/黑色)：好战的黑牛首领
            { "id": "gumshoos", "min": 35 },    // 猫鼬探长：看起来像是这一片区的管事
            { "id": "mudsdale", "min": 35 }     // 重泥挽马：重型卡车
        ]
    },


    // === 2. 隐藏杀机的半干燥深草 (High_Grass) ===
    // 更靠近北部的红色过度土层。高耸的金色干草能完全藏住一只成年肯泰罗。
    // 沙沙声可能不是风，是正在接近你的猎手。
    // 生态位：社会性掠食者(狮/狼/鬣狗)、毒蛇、巨型角斗士
    "High_Grass": {
        
        // === Common Pool: 草浪中游动的威胁 (Base Stage) ===
        // "保持安静，别惊动它们"
        "common": [
            // 潜伏者基础
            "ekans",          // 阿柏蛇：经典的草丛杀手，数量虽多但致命
            "silicobra",      // 沙包蛇：只有眼睛和鼻孔露在外面
            "seviper",        // 饭匙蛇：S行动线，极具攻击性
            "nymble",         // (Gen 9) 豆蟋蟀：即使是虫子也会反击
            "nuzleaf",        // 长鼻叶：利用长鼻子伪装成草叶的阴影
            "cacnea",         // 刺球仙人掌：北部的干旱征兆，如果这里有人工灌溉渠会更多
            
            // 幼兽群
            "litleo",         // 小狮狮：在草丛里扑咬大人的尾巴
            "shinx",          // 小猫怪：草原另一股势力，别惹它，后面有大人
            "poochyena",      // 土狼犬：这就是所谓的鬣狗生态位，一直在寻找腐肉
            "houndour",       // 戴鲁比：从北边工厂跑出来的黑狗群体
            
            // 铁甲与挖掘
            "sandshrew",      // 穿山鼠(普通)：在这些土墩里挖洞
            "diglett",        // 地鼠
            "rhyhorn",        // 独角犀牛：即使什么都看不到，撞到了也很疼
            "meowth_galar"    // 喵喵(伽勒尔)：浑身铁锈色，最适合这种红土
        ],

        // === Uncommon Pool: 熟练的猎杀时刻 (Lv 30-45) ===
        "uncommon": [
            // 进阶掠食者 (Strict Min Levels)
            { "id": "luxio", "min": 18 },       // 勒克猫：群体行动的先锋，通过电流沟通位置
            { "id": "pyroar", "min": 35 },      // 火炎狮 (雌性)：主要的狩猎执行者，甚至比雄性更危险
            { "id": "mightyena", "min": 22 },   // 大狼犬：群体围猎，一呼百应
            { "id": "manectric", "min": 26 },   // 雷电兽：追逐雷电的速度
            { "id": "arbok", "min": 22 },       // 阿柏怪：巨大的眼睛花纹威吓
            { "id": "sandaconda", "min": 36 },  // 沙螺蟒：储沙囊鼓鼓的，盘踞路中央
            { "id": "persian_alola", "min": 28 }, // (为什么在这? 因为它是机会主义者) N/A Remove -> replace with "liepard" 酷豹: 草原潜行者
            "zangoose",       // 猫鼬斩：与 Common 里的饭匙蛇在这里永恒乱战
            
            // 强壮的游荡者
            "girafarig",      // 麒麟奇：超能属性让它们能提前感知伏击
            "tauros_paldea_blaze", // (Gen 9) 肯泰罗(火炽种)：红热的角，脾气极臭
            "scyther",        // 飞天螳螂：收割干燥的硬草
            "primeape",       // 火暴猴：愤怒狂奔
            "bouffalant"      // 爆炸头水牛：(Upgraded density here) 移动的非洲野牛墙
        ],

        // === Rare Pool: 甚至是无法理解的强悍 (Lv 40+) ===
        "rare": [
            // 区域限定的特殊进化
            "farigiraf",      // (Gen 9) 奇麒麟：把头缩进甚至更硬的像宇航员头盔一样的脖子里，全角度防御
            { "id": "lokix", "min": 24 },       // (Gen 9) 烈腿蝗：开启 Showdown Mode 的黑色假面骑士
            
            // 接近霸主的存在
            "rhydon",         // 钻角犀兽：这个身板只有在这里能完全施展
            "passimian",      // 投掷猴：拿硬壳果甚至石头在远处砸你
            "kangaskhan",     // 袋兽：育儿袋里的孩子都很有精神
            "skarmory",       // 盔甲鸟：从北边的Badlands飞下来抓蛇吃
            "absol",          // 阿勃梭鲁：出现在风暴前的岩石上
            "fraxure"         // 斧牙龙：来自北部的龙族在此试锋
        ],

        // === Boss Pool: 热带稀树草原霸主 (Lv 48-60) ===
        // "King of the Circle."
        "boss": [
            // 领主之争
            { "id": "pyroar", "min": 45 },      // [火炎狮 (雄性)]：拥有巨大的可以喷射高热的鬃毛，草原毫无疑问的狮子王
            { "id": "luxray", "min": 42 },      // [伦琴猫]：拥有透视眼，躲在草里并没有用
            
            // 重量级压制
            { "id": "nidoking", "min": 45 },    // 尼多王：紫色的各种暴君 (Ground/Immu Electric) -> 克制电狮子
            { "id": "nidoqueen", "min": 45 },   // 尼多后
            { "id": "copperajah", "min": 48 },  // 大王铜象：巨大的甚至非洲象风格，皮肤因为富矿而发绿
            { "id": "hippowdon", "min": 42 },   // 河马兽：如果不高兴就制造沙尘暴
            { "id": "mandibuzz", "min": 40 },   // 秃鹰娜：只要你不动，她就下来吃你
            { "id": "talonflame", "min": 45 }   // 烈箭鹰：从天而降的火球
        ]
    }
},
/* Zone: Zero_Halo_Moat (The Artificial Ring) */
/* Threat: Safe (Sterile Environment) */
/* Theme: Bioluminescence / Ornamental Fish / Lab Escapies */

"Zero_Halo_Moat": {

    // === 深蓝色的净化循环水体 (Fresh_Water) ===
    // 虽然叫 Fresh_Water，但其实是经过多重过滤的软水，有着类似泳池的清澈度。
    // 水底有规则排列的六边形灯带。
    "Fresh_Water": {
        
        // === Common Pool: 景观与净化员 (Lv 5-15) ===
        // "Please do not feed the specimens."
        "common": [
            // 荧光装饰组
            "finneon",        // 荧光鱼：数量最多，晚上一亮灯，它们就跟着亮，美轮美奂
            "chinchou",       // 灯笼鱼：负责水底照明
            "staryu",         // 海星星：像不知疲倦的扫地机器人一样在水底旋转，核心宝石闪闪发光
            "wishiwashi",     // 弱丁鱼：虽然弱，但是在灯光下鱼群闪闪发亮（虽然是海鱼，但这里是人工咸淡水）
            
            // 优雅的游弋者
            "goldeen",        // 角金鱼：经典观赏鱼
            "ducklett",       // 鸭宝宝：与白色建筑绝配的天鹅雏形
            "tympole",        // 圆蝌蚪：圆润光滑的设计很符合Z区审美
            "remoraid",       // 铁炮鱼：起到了甚至清理管道的作用？
            "luvdisc",        // 爱心鱼：为了甚至体现"爱与和平"的Z区宣传口号而投放的
            "magikarp",       // 鲤鱼王：这里的鲤鱼王是被不仅选育过的，鳞片格外亮
            "slowpoke"        // 呆呆兽：除了发呆不会污染环境
        ],

        // === Uncommon Pool: 昂贵的展示品 (Lv 15-25) ===
        "uncommon": [
            // 光辉进化型
            { "id": "lumineon", "min": 20 },    // 霓虹鱼：巨大的发光鳍是护城河也是最美的风景
            { "id": "seaking", "min": 25 },     // 金鱼王
            { "id": "swanna", "min": 28 },      // 舞天鹅：在水面优雅滑行
            { "id": "corsola", "min": 1 },      // 太阳珊瑚(仅普通)：展示以太基金会的珊瑚复育成果
            { "id": "lanturn", "min": 27 },     // 电灯怪
            
            // 科研相关
            "piplup",         // 波加曼：可能是甚至从寒冷实验区偷跑出来游泳的
            "porygon",        // 多边兽：(罕见现象) 虽然是数据，但有时会像鸭子一样浮在水面上检测水质
            "castform_rainy", // 飘浮泡泡(雨水)：正在监测湿度，像水珠一样溶在水里
            "goomy",          // 黏黏宝：必须用这么干净的水才能养活
            "azurill"         // 露力丽
        ],

        // === Rare Pool: 基因工程的杰作 (Lv 25+) ===
        "rare": [
            // 梦幻般的生物
            "feebas",         // 笨笨鱼：(Z区特供) 这里致力于展现"内在美进化"的研究
            "dratini",        // 迷你龙：蜕皮会有专门的无人机回收，以保持整洁
            "lapras",         // 拉普拉斯：用于接待VIP访客的渡水坐骑，平时在此休息
            "vaporeon",       // 水伊布：完全适应了这里的人造水体，几乎隐形
            "starmie",        // 宝石海星：神秘的旋转几何体，疑似外星科技
            "phione"          // (Mythical-ish?) 霏欧纳：极其罕见的海洋漂流者，被这里这种纯净甚至的水质吸引
        ],

        // === Boss Pool: 完美的守护者 (Lv 35-50) ===
        // 即使是Boss，也是那种看起来不仅神圣、不甚至会随便攻击人的类型
        "boss": [
            { "id": "milotic", "min": 35 },     // 美纳斯：护城河毫无疑问的女王。如果在水面看到虹色光芒……
            { "id": "dragonair", "min": 30 },   // 哈克龙：优雅操纵天气的蛇
            { "id": "primarina", "min": 40 },   // 西狮海壬：在护城河中央甚至有专门的歌剧台？(Starters Boss)
            { "id": "suicune", "min": 60 },     // (Legendary Roaming?) 水君：净化污水的北风化身，可能会被Zero Halo Moat的极致纯净吸引驻足（万分之一概率彩蛋）
            { "id": "vaporeon", "min": 30 }
        ]
    }
},
/* Zone: Mirror_Lotis_Lake (The Psychedelic Waters) */
/* Threat: Safe (Edges) -> High (Center Mist) */
/* Theme: Lotus / Reflection / Time Dilation / Deep Water */

"Mirror_Lotis_Lake": {

    // === 巨大的、覆盖半个湖面的镜面水域 (Fresh_Water) ===
    // 包含开放水域和如陆地般大小的承重莲叶系统。
    // 这里的水平静得像固体，倒映着天空，容易让人分不清上下。
    "Fresh_Water": {
        
        // === Common Pool: 莲叶间的跳跃者 (Base Stage) ===
        // 数量极大，在薄雾中若隐若现
        "common": [
            // 莲叶/水面住民 (Surface)
            "lotad",          // 莲叶童子：数量最多，它们就是这片景色的一部分
            "surskit",        // 溜溜糖球：利用表面张力滑行
            "poliwag",        // 蚊香蝌蚪：透过肚子上的旋涡看到内脏...
            "tympole",        // 圆蝌蚪
            "dewpider",       // 滴蛛：带着气泡头盔在莲叶上通过
            "azurill",        // 露力丽：在叶子上弹跳
            "marill",         // 玛力露
            "psyduck",        // 可达鸭：抱头头痛，因为感受到了湖底的超能波动？
            
            // 水下游弋
            "goldeen",        // 角金鱼
            "magikarp",       // 鲤鱼王：这里的比较安静
            "wooper",         // 乌波：(只有普通种，帕底亚种在泥地不能在深水)
            "slowpoke",       // 呆呆兽：它的迟钝完美符合这里"时间变慢"的感官描述
            "finneon",        // 荧光鱼：(淡水适性) 在阴暗的荷叶下发光
            "yanma"           // 阳阳玛：点水蜻蜓
        ],

        // === Uncommon Pool: 迷雾中的黑影 (Lv 25-38) ===
        "uncommon": [
            // 进阶的捕食者与法师
            { "id": "lombre", "min": 14 },      // 莲帽小童：不仅在水里，还会甚至站在叶子上戏弄人
            { "id": "seaking", "min": 33 },     // 金鱼王
            { "id": "masquerain", "min": 22 },  // 雨翅蛾：威吓的大眼睛图案
            { "id": "poliwhirl", "min": 25 },   // 蚊香君
            { "id": "araquanid", "min": 25 },   // 滴蛛霸：巨大的水泡蜘蛛，也是把人拖下水的元凶
            { "id": "golduck", "min": 33 },     // 哥达鸭：擅长游泳，额头的宝石微微发光
            "vaporeon",       // 水伊布：因为水质带有虹光能量，由于水之石辐射自然进化
            "quagsire",       // 沼王
            
            // 特殊生态
            "basculin",       // (White-Striped/Red/Blue random) 野蛮鲈鱼：水下的流氓
            "veluza",         // (Gen 9) 轻身雪鳕：这个鱼是超能系，非常符合这里的Mirror/Mental主题，且会把自己的肉甩出去攻击，很恐怖
            "cramorant"       // 古月鸟：呆呆的鸟
        ],

        // === Rare Pool: 镜中奇迹 (Lv 35+) ===
        "rare": [
            // 龙与祥瑞
            "dragonair",      // 哈克龙：神秘的蛇，能操控湖上的天气
            "dratini",        // 迷你龙
            "milotic",        // 美纳斯：湖水的虹彩光泽其实就是它的鳞片反光
            "lapras",         // 拉普拉斯：(Ultra Rare) 如果听到优美的歌声...
            
            // 强大的超能水系
            "bruxish",        // 磨牙彩皮鱼：鲜艳且自带精神力
            "starmie",        // 宝石海星：这里有足够深的水和谜之光
            "slowbro",        // 呆壳兽
            "goodra"          // 黏美龙：(纯龙，但喜欢湿润)，偶尔会浮出水面
        ],

        // === Boss Pool: 莲池之主 (Lv 45-65) ===
        // "The ripples stopped. Something is coming."
        "boss": [
            // 毫无疑问的区域霸权
            { "id": "ludicolo", "min": 40 },    // 乐天河童：伴随着欢快的节奏出现，但这节奏可能让人疯癫。
            { "id": "politoed", "min": 40 },    // 牛蛙君：青蛙以及蝌蚪的王，它的叫声能引发大雨
            { "id": "gyarados", "min": 45 },    // 暴鲤龙：打破平静的凶神
            { "id": "dondozo", "min": 50 },     // (Gen 9) 吃吼霸：【湖之主】巨大的淡水鲶鱼，吞噬一切
            { "id": "tatsugiri", "min": 50 },   // (Gen 9) 米立龙：虽然小，但它在大声发号施令，通常和吃吼霸一起出现
            { "id": "swampert", "min": 48 },    // 巨沼怪
            { "id": "slowking", "min": 45 },    // 呆呆王：智慧的贤者，守护着湖底通往深根的秘密
            { "id": "wishiwashi_school", "min": 45 }// 弱丁鱼(鱼群)：如果不小心惹了鱼苗群...
        ]
    }
},
/* Zone: Emerald_Vein_River (The Vibrant Artery) */
/* Threat: Safe (High traffic nature hiking/boating area) */
/* Terrain: Fresh_Water (Fast Flowing) Only */

"Emerald_Vein_River": {

    // === 充满矿物质的翠绿色奔流 (Fresh_Water) ===
    // 水质极好但流速快。两岸是"翡翠天冠"延伸出来的巨大树根网。
    // 这里也是B区水运交通（皮划艇/渡船）的必经之路。
    "Fresh_Water": {
        
        // === Common Pool: 顺流而下的活跃分子 (Base Stage) ===
        "common": [
            // 激流勇进者
            "buizel",         // 泳圈鼬：本身就是救生衣，在激流里玩耍
            "arrokuda",       // (Gen 8) 刺梭鱼：像飞镖一样在水里冲刺
            "basculin",       // 野蛮鲈鱼(蓝/红条纹)：河道里因为抢地盘最吵就是它们
            "goldeen",        // 角金鱼：在此处逆流而上，为了锻炼角
            
            // 树根居住者 (Slow/Static)
            "lotad",          // 莲叶童子：在树根盘结的缓流处
            "surskit",        // 溜溜糖球
            "wooper_paldea",  // (No, clean water here) -> "wooper" 乌波(普通)：抓着树根不被为了冲走
            "barboach",       // 泥泥鳅
            "corphish",       // 龙虾小兵：活力十足
            
            // 表层水面
            "psyduck",        // 可达鸭：可能是从上游不小心掉下来被冲走的...
            "ducklett",       // 鸭宝宝
            "azurill"         // 露力丽：在岸边玩水
        ],

        // === Uncommon Pool: 熟练的领航员 (Lv 20-35) ===
        // "Watch out for the currents!"
        "uncommon": [
            // 进化的游泳健将
            { "id": "floatzel", "min": 26 },    // 浮潜鼬：甚至是这里的河流救援队成员
            { "id": "barraskewda", "min": 26 }, // 国际刺梭鱼：此时它是螺旋桨鱼雷
            { "id": "seaking", "min": 33 },     // 金鱼王
            
            // 力量型河道清理者
            "chewtle",        // 咬咬龟
            { "id": "drednaw", "min": 22 },     // 暴噬龟：强大的下颚能咬碎挡路的枯木
            "crawdaunt",      // 铁螯龙虾：河道霸王
            { "id": "poliwhirl", "min": 25 },   // 蚊香君
            { "id": "lombre", "min": 14 },      // 莲帽小童
            "tympole"         // 圆蝌蚪 -> Palpitoad 蓝蟾蜍 (in eddies)
        ],

        // === Rare Pool: 翡翠色的传说 (Lv 30+) ===
        "rare": [
            // 大型水兽
            "totodile",       // 小锯鳄：罕见的鳄鱼，这在急流里非常欢快 (Starter Rare)
            "poliwrath",      // 蚊香泳士：在瀑布下面修炼
            "slowking",       // 呆呆王：在河边钓鱼?
            "dratini",        // 迷你龙：在深水树荫里蜕皮
            
            // 下游的访客
            "mantyke",        // 小球飞鱼：经常会跳出水面
            "mantine",        // 巨翅飞鱼：河流足够宽的话，它们会逆流而上
            "vaporeon"        // 水伊布：几乎是隐形的
        ],

        // === Boss Pool: 河道守护神 (Lv 40-55) ===
        // 它们通常不攻击船只，而是维持河道通畅
        "boss": [
            { "id": "feraligatr", "min": 45 },  // 大力鳄：虽然脸凶，但在"Safe"区通常也是比较讲道理的
            { "id": "gyarados", "min": 35 },    // 暴鲤龙：即使是Safe区也有这种暴躁老哥
            { "id": "ludicolo", "min": 40 },    // 乐天河童：跟着水和树叶的声音跳舞
            { "id": "swampert", "min": 45 },    // 巨沼怪：靠力气搬开阻塞河道的岩石
            { "id": "poliwrath", "min": 42 }    // 蚊香泳士
        ]
    }
},
/* Zone: Crystal_Lagoon (The Prismatic Shallows) */
/* Threat: Safe (Shallows) -> Low -> Mid (Deep/Caves) */
/* Theme: Crystals / Reflection / Cool Water / Coral Reef */

"Crystal_Lagoon": {

    // === 3. 遍布发光晶簇的浅海泻湖 (Shallow_Sea) ===
    // 水深只齐腰，脚下是雪白的沙。巨大的晶体像礁石一样生长在水下。
    // 这是一片像薄荷苏打水一样清凉的魔幻海域。
    "Shallow_Sea": {
        
        // === Common Pool: 闪烁的光点 (Base Stage) ===
        // 它们的外壳或身体能够折射阳光
        "common": [
            // 宝石基底
            "corsola",        // 太阳珊瑚(普通)：这里的优势物种，粉红色的角与蓝色晶体辉映
            "staryu",         // 海星星：白天在水底休眠，核心红宝石反射着波光
            "shellder",       // 大舌贝：在晶簇上磨壳
            "luvdisc",        // 爱心鱼：成群游动，像粉红色的花瓣
            
            // 冰冷适应者 (The Minty Vibe)
            "seel",           // 小海狮：因为这里水凉快，所以热带也能活
            "shellder",       // (重复确认) 大舌贝
            "tentacool",      // 玛瑙水母：像水晶一样透明的身体
            "finneon",        // 荧光鱼：其漂亮的尾鳍在发光水中最好看
            "remoraid",       // 铁炮鱼
            "carbink"         // 小碎钻：【特异点】居然生在水底的晶体矿脉上，和珊瑚混在一起
        ],

        // === Uncommon Pool: 晶体守护者 (Lv 25-35) ===
        "uncommon": [
            // 天敌与共生
            "mareanie",       // 坏星：追逐太阳珊瑚的猎手，但在这里数量被控制正如（Safe区）
            "horsea",         // 墨海马：在晶体柱之间玩耍
            "clamperl",       // 珍珠贝：像是一个闭合的宝箱
            "chinchou",       // 灯笼鱼：在晶体阴影处照明
            "palafin_zero",   // (Gen 9) 海豚侠(平凡形态)：看似普通海豚，在此英雄救美
            
            // 进化的光辉
            { "id": "staravia", "min": 1 },     // (Oops flying?) -> "starmie" 宝石海星(Core form in rare)
            { "id": "dewgong", "min": 34 },     // 白海狮：优雅的白色身影
            { "id": "lantern", "min": 27 },     // 电灯怪
            { "id": "lumineon", "min": 31 }     // 霓虹鱼：深处的发光源
        ],

        // === Rare Pool: 梦幻的折射 (Lv 35+) ===
        "rare": [
            // 活体宝石
            "starmie",        // 宝石海星：高速旋转的核心发出怪光线
            "cloyster",       // 刺甲贝：拥有只有金刚石才能击碎的硬壳
            "lapras",         // 拉普拉斯：喜欢在这种"不真实"的美景中唱歌
            
            // 龙与仙
            "popplio",        // 球球海狮：(Starter) 吹出的泡泡和晶体一样闪亮
            "primarina",      // 西狮海壬：(Rare Wild) 泻湖歌姬
            "dragonair",      // 哈克龙：身上有能操纵天气的宝珠
            "milotic",        // 美纳斯：鳞片折射彩虹光，这里是它最喜欢的舞台
            
            // 异色/特殊材质
            "dhelmise"        // 破破舵轮：如果水底有古代沉船的锚被晶体包裹...
        ],

        // === Boss Pool: 晶体宫殿的主人 (Lv 42-55) ===
        // "This area is mesmerizing, but respect the locals."
        "boss": [
            { "id": "toxapex", "min": 38 },     // 超坏星：用剧毒碉堡统治一片珊瑚礁
            { "id": "palafin_hero", "min": 40 },// (Gen 9) 海豚侠(全能形态)：当由于Threat变为Mid以上时，英雄登场
            { "id": "walrein", "min": 44 },     // 帝牙海狮：因冷水而在此定居的巨兽
            { "id": "gorebyss", "min": 35 },    // 樱花鱼：美丽但残酷
            { "id": "huntail", "min": 35 },     // 猎斑鱼
            { "id": "vaporeon", "min": 30 },    // 水伊布：融化在水中
            { "id": "diancie", "min": 70 }      // (Mythical - 0.00% Event) 蒂安希：【彩蛋】矿石之国的公主，晶体泻湖真正的传说源头
        ]
    }
},
/* Zone: Twin_Destiny_Basin (The Great Divide) */
/* Threat: Safe (Strictly Monitored Infrastructure) */
/* Terrain: Fresh_Water (Turbulent & Deep) Only */

"Twin_Destiny_Basin": {

    // === 向北奔流的湍急分水岭 (Fresh_Water) ===
    // 水流在此处被机械巨闸一分为二。一边是平静的人工河，一边是野生瀑布。
    // 巨大的轰鸣声和震动掩盖了一切。
    "Fresh_Water": {
        
        // === Common Pool: 逆流奋斗者 (Base Stage) ===
        // 数量最多的是那些试图冲过闸门的鱼群
        "common": [
            // 鲤鱼跃龙门
            "magikarp",       // 鲤鱼王：成千上万，试图跳过人工闸门，展现出一种悲壮的毅力
            "arrokuda",       // 刺梭鱼：在湍流中像飞镖一样穿梭
            "basculin_white", // 野蛮鲈鱼 (白条/混种)：性格强硬，逆流而上
            "buizel",         // 泳圈鼬：这里的救生员，利用尾巴在涡流中保持平衡
            
            // 漩涡与震动
            "poliwag",        // 蚊香蝌蚪：腹部的漩涡暗示了这里的水流
            "tympole",        // 圆蝌蚪
            "barboach",       // 泥泥鳅：感知"大地的轻微震动" (Sensory description match)
            
            // 适应天气的漂浮者
            "castform",       // 飘浮泡泡：(Common在此地) 因为"风向混乱、时冷时热"，它是这里的指示标
            "wingull"         // 长翅鸥：在闸门上空盘旋
        ],

        // === Uncommon Pool: 水流利用者 (Lv 25-35) ===
        "uncommon": [
            // 中级游泳者
            "poliwhirl",      // 蚊香君：命运的分歧点 (在此地可以捡到进化石?)
            "lumineon",       // 霓虹鱼：从深处游上来看看水面
            "seaking",        // 金鱼王：使用角击碎水中的浮木
            "whiscash",       // 鲶鱼王：造成震动的元凶之一，在此地吸收大坝的波动
            "qwilfish",       // 千针鱼：被湍流搞得心烦意乱
            "cramorant",      // 古月鸟：在等待晕头转向的鱼被冲出来吞掉
            
            // 设施维护者
            "rotom_wash",     // 洛托姆 (清洗/洗衣机)：附着在水闸管理室的清洁设备上，经常跑出来滋水
            "bibarel",        // 大尾狸：尽管这是混凝土大坝，它还是想以此筑巢
            "pelipper"        // 大嘴鸥
        ],

        // === Rare Pool: 命定之人 (Lv 30+) ===
        "rare": [
            // 分支进化的抉择
            "slowpoke",       // 呆呆兽：顺流而下的哲学家。它会成为呆壳兽还是呆呆王？
            "gloomy",         // 黏黏宝：(No, Goomy belongs to swamp) -> Replace with "dratini"
            "dratini",        // 迷你龙：在深潭漩涡中心蜕皮
            
            // Z区的祥瑞
            "dragonair",      // 哈克龙：不仅控制风雨，外形也像在这里流动的丝带
            "lapras",         // 拉普拉斯：(极罕见) 只有在大闸开启水位平衡通过时才会经过这里
            "wishiwashi_school" // 弱丁鱼(鱼群)：虽然个体弱，但在巨大的闸口前集结成怪兽形态对抗水流
        ],

        // === Boss Pool: 镇守天险的龙门 (Lv 40-55) ===
        // "The Gate Opens."
        "boss": [
            { "id": "gyarados", "min": 35 },    // 暴鲤龙：跨越了龙门的鲤鱼王，愤怒与力量的化身，此地的绝对标志
            { "id": "empoleon", "min": 45 },    // 帝王拿波：钢铁属性的水主，如神像般耸立在金属闸门上，威严的管理者
            { "id": "kingdra", "min": 48 },     // 刺龙王：深渊漩涡的制造者，藏在最湍急的水底
            { "id": "poliwrath", "min": 40 },   // 蚊香泳士：逆流而上修炼肌肉
            { "id": "politoed", "min": 40 },    // 牛蛙君：命运的另一种可能
            { "id": "samurott_hisui", "min": 45 } // 大剑鬼(洗翠)：恶/水，孤高的浪人，在此斩断流水
        ]
    }
},
/* Zone: Chrome_Canal (The Oil & Steel Waterway) */
/* Threat: Safe -> Mid (Industrial Pollution) */
/* Terrain: Fresh_Water (High Tech West) | Sewage (Polluted East) */

"Chrome_Canal": {

    // === 【西部】流经霓虹区的液钢水道 (Fresh_Water) ===
    // 虽然叫Fresh Water，但其实是加入了防锈剂的冷却水，呈银灰色，且带有电压。
    // 生态位：电气水生生物、钢铁甲壳、发光体(配合霓虹倒影)
    "Fresh_Water": {
        
        // === Common Pool: 机械化的鱼群 (Base Stage) ===
        "common": [
            // 电气化/人造感
            "chinchou",       // 灯笼鱼：在银色的水中，它的灯像浮标一样
            "remoraid",       // 铁炮鱼：吸附在金属护墙上
            "magnemite",      // 小磁怪：(浮游) 在离水面半米的地方巡逻
            "finneon",        // 荧光鱼：其条纹与岸边的霓虹灯同步闪烁
            "tynamo",         // 麻麻小鱼：像电流一样由于水导电而游得很快
            "buizel",         // 泳圈鼬：这里的可以充当河道搜救犬
            "krabby",         // 大钳蟹：金属光泽
            "porygon"         // 多边兽：在这个倒影全是电子广告的水里偶尔生成
        ],

        // === Uncommon Pool: 运河巡逻队 (Lv 25-35) ===
        "uncommon": [
            // 安保与工程
            { "id": "floatzel", "min": 26 },    // 浮潜鼬：高速救援/追击
            { "id": "lanturn", "min": 27 },     // 电灯怪：水下照明灯
            "clawitzer",      // 钢炮臂虾：仿佛是炮架一样
            "voltorb",        // 霹雳电球：漂在水上的球形浮标
            "shellder",       // 大舌贝：硬得像铁
            "staryu",         // 海星星
            "basculin_white", // 野蛮鲈鱼 (白条是淡水，性格更凶)
            "clobbopus"       // 拳拳蛸：用来维修水下管道?
        ],

        // === Rare Pool: 合金构造 (Lv 35+) ===
        "rare": [
            "duraludon",      // 铝钢龙：有时会涉水过河，像一座移动的铁塔
            "lapras",         // 拉普拉斯：(Ultra Rare) 如果出现，通常身上挂满了光带，作为观光船
            "vaporeon",       // 水伊布：在这种人造水体里很自在
            "dhelmise",       // 破破舵轮：巨大的船锚，与“货船”的设定完美契合
            "orthworm"        // (Gen 9) 拖拖蚓：从运河的金属护两岸探出头
        ],

        // === Boss Pool: 铬色霸主 (Lv 40-55) ===
        "boss": [
            { "id": "empoleon", "min": 45 },    // 帝王拿波：不锈钢企鹅，它是这条铬色运河的尊严象征 (Steel/Water)
            { "id": "kingler", "min": 40 },     // 巨钳蟹
            { "id": "clawitzer", "min": 42 },   // 钢炮臂虾（巨炮形态）
            { "id": "rotom_wash", "min": 40 },  // 洛托姆(洗衣机)
            { "id": "milotic", "min": 40 }      // 美纳斯 (霓虹色变种?)：虽然是生物，但鳞片像镜面一样反光
        ]
    },


    // === 【东部】通往暗影区与出海口的各种油污段 (Sewage) ===
    // 越往东走，水越脏。上面漂浮着彩虹色的机油油膜和 S 区排放的废弃物。
    // 生态位：食油生物 (Oil Eaters)、垃圾清道夫、剧毒钢材
    "Sewage": {
        "common": [
            // 油污清理者
            "grimer_alola",   // 臭泥(阿罗拉)：在水面游动，吃泄露的石油 (Dark/Poison)
            "trubbish",       // 破破袋：掉进河里的垃圾
            "skrelp",         // 垃垃藻：完美伪装成烂塑料袋
            "tentacool",      // 玛瑙水母：在这里数量泛滥
            "qwilfish",       // 千针鱼：水雷
            "shellos_east",   // 无壳海兔(东海/蓝色/甚至脏色)：粘液保护它不受油污影响
            "mareanie",       // 坏星
            "varoom"          // (Gen 9) 噗隆隆：【重点】漂浮引擎，通过吃废机油维持运转
        ],

        "uncommon": [
            // 重度污染
            { "id": "muk_alola", "min": 38 },   // 臭臭泥(阿罗拉)：彩色的泄露源
            { "id": "dragalge", "min": 48 },    // 毒藻龙：沉在底部的强酸生物
            "qwilfish_hisui", // 千针鱼(洗翠)：恶/毒，因为环境太恶劣而出现返祖?
            "corphish",       // 龙虾小兵：甚至是适应力极强的入侵物种
            "weezing_galar",  // 双弹瓦斯(伽勒尔)：虽然是浮在空气中，但净化这片水域上空的废气
            "koffing",        // 瓦斯弹
            "grapploct"       // 八爪武师：触手都是黑的机油
        ],

        "rare": [
            // 工业怪谈
            "revavroom",      // (Gen 9) 普隆隆姆：在充满油气的河面上飙车 (Steel/Poison) - 它是喝油的！
            "dauge",          // No -> "dhelmise" 破破舵轮: 浑身缠满垃圾水草
            "garbodor",       // 灰尘山：(Rare Swim?) 也许是在运垃圾船上
            "toxapex",        // 超坏星
            "toxtricity"      // (Low Key) 颤弦蝾螈：在带电的脏水里
        ],

        // === Boss Pool: 剧毒与机油的混合体 (Lv 45-60) ===
        // "Warning: Toxicity levels exceeding limits."
        "boss": [
            { "id": "revavroom", "min": 45 },   // [普隆隆姆]：这条充满机油味道河道的真正霸主。引擎轰鸣声的源头。
            { "id": "overqwil", "min": 35 },    // 万针鱼：水中的机雷阵列
            { "id": "muk", "min": 40 },         // 臭臭泥(该地区原生种，更脏)
            { "id": "kingdra", "min": 50 },     // 刺龙王：即便是在这里，龙也是至高无上的（或许是受污染变异的黑色龙）
            { "id": "golisopod", "min": 40 }    // 具甲武者：无论多脏，它的甲壳依然坚硬
        ]
    }
},
/* Zone: Mercury_Stream (The Grey Sludge River) */
/* Threat: Safe -> Low -> Mid -> High */
/* Terrain: Fresh_Water (Silty South) -> Sewage (Industrial Mid) -> Glacial_Water (Freezing North) */

"Mercury_Stream": {

    // === 1. 上游：灰白色的浑浊泥浆 (Fresh_Water) ===
    // 虽然被标记为Fresh_Water，但这是充斥了悬浮矿物颗粒的"硬水"。
    // 水底沉积着来自余烬荒原的灰。
    "Fresh_Water": {
        
        // === Common Pool: 泥巴佬与滤食者 (Base Stage) ===
        "common": [
            "barboach",       // 泥泥鳅：完美的保护色，滑溜溜
            "tympole",        // 圆蝌蚪：依靠声音在浑水中交流
            "wooper",         // 乌波(普通)：在充满矿物质的泥浆里很开心
            "shellos_east",   // 无壳海兔(东海)：蓝色的一坨
            "goldeen",        // 角金鱼：即使水混，依然强韧
            "slowpoke",       // 呆呆兽：并不在意水是不是脏了
            "basculin"        // 野蛮鲈鱼：性格暴躁
        ],

        // === Uncommon Pool: 矿物硬壳 (Lv 25-35) ===
        "uncommon": [
            { "id": "whiscash", "min": 30 },    // 鲶鱼王：这片浑水的真正主人，会引发小地震
            { "id": "palpitoad", "min": 25 },   // 蓝蟾蜍
            { "id": "quagsire", "min": 20 },    // 沼王：呆萌但耐打
            "corphish",       // 龙虾小兵
            "psyduck",        // 可达鸭：可能是误入
            "shellder",       // 大舌贝：硬壳能抵御碎石冲刷
            "lotad"           // 莲叶童子：叶子上积满了灰
        ],

        // === Rare Pool: 硬派水兽 (Lv 30+) ===
        "rare": [
            "reli-canth",     // (Typo->Relicanth) 古空棘鱼：(Ultra Rare) 这个活化石在这种高矿物质环境里如鱼得水
            "mudkip",         // 水跃鱼
            "totodile",       // 小锯鳄：喜欢在浑水里咬人
            "clauncher",      // 铁臂枪虾
            "drednaw"         // 暴噬龟
        ],

        // === Boss Pool: 泥沼的主宰 (Lv 40-50) ===
        "boss": [
            { "id": "swampert", "min": 45 },    // 巨沼怪：它只需要把头探出水面就能甚至拖动大岩石
            { "id": "seismitoad", "min": 38 },  // 蟾蜍王
            { "id": "crawdaunt", "min": 35 },   // 铁螯龙虾
            { "id": "golisopod", "min": 35 }    // 具甲武者：喜欢浑浊阴暗的水底
        ]
    },


    // === 2. 中游：散发着化学气味的重金属段 (Sewage) ===
    // 工业区的废水管网汇入点。水面有一层金属光泽的油膜。重金属含量超标。
    // 生态位：毒系、钢系/水系、垃圾附着物
    "Sewage": {
        
        // === Common Pool: 污染耐受组 (Eco-Cleaners) ===
        "common": [
            "grimer_alola",   // 臭泥(阿罗拉)：在处理油膜
            "wooper_paldea",  // 乌波(帕底亚)：在这样的毒水里进化出了毒性
            "skrelp",         // 垃垃藻：这种像烂海草一样的样子就是为了这里而生的
            "tentacool",      // 玛瑙水母：数量泛滥
            "qwilfish_hisui", // (Gen-LA) 千针鱼(洗翠)：这里的水质让它呈现出古代/恶系的特征
            "trubbish",       // 破破袋：掉水里了
            "sliggoo"         // 黏美儿：(Kalos, steel variant for hisui?) -> Common Goomy 黏黏宝
        ],

        // === Uncommon Pool: 腐蚀与剧毒 (Lv 30-40) ===
        "uncommon": [
            { "id": "clodsire", "min": 20 },    // (Gen 9) 土王：毒之沼王，这里是它的天堂，不仅厚实而且带刺
            { "id": "muk_alola", "min": 38 },   // 臭臭泥(阿罗拉)
            "weezing_galar",  // 分布在水面吸收废气的烟囱
            "stunfisk_galar", // 泥巴鱼(伽勒尔)：由于沉积了铁质，变成了捕兽夹
            "amoonguss",      // 败露球菇：就在岸边潮湿处
            "toxapex"         // 超坏星 (Pre-evo mareanie common in sea, uncommon here)
        ],

        // === Rare Pool: 重金属沉积 (Lv 40+) ===
        "rare": [
            "dragalge",       // 毒藻龙：极强的领地意识，喷射穿透船底的酸液
            "overqwil",       // (Gen-LA) 万针鱼：水中的高危地雷
            "duraludon",      // 铝钢龙：在河岸边生锈？不，它防锈
            "revavroom"       // (Gen 9) 普隆隆姆：在某种浮桥或宽阔水浅处行驶
        ],

        // === Boss Pool: 剧毒要塞 (Lv 45-55) ===
        "boss": [
            { "id": "garbodor", "min": 40 },    // 灰尘山
            { "id": "toxtricity", "min": 40 },  // 颤弦蝾螈 (Low Key / 像贝斯手一样阴郁)：经常喝这种电池水
            { "id": "goodra_hisui", "min": 50 },// (Gen-LA) 黏美龙(洗翠)：龙/钢属性。由于长期在重金属河里生活，长出了巨大的金属壳
            { "id": "clodsire", "min": 35 }     // 土王 (领主)：看起来傻乎乎，打起来谁都得中毒
        ]
    },


    // === 3. 下游入海口：混合着碎冰的冻流 (Glacial_Water) ===
    // 接近 S 区和 Silent Tundra 的北界。水温骤降至冰点，水变得粘稠。
    // 生态位：耐寒水系、海象、装甲企鹅
    "Glacial_Water": {
        
        // === Common Pool: 冰泳俱乐部 (Thermal Fat) ===
        "common": [
            "spheal",         // 海豹球：像冰块一样漂下来
            "seel",           // 小海狮
            "shellder",       // 大舌贝：低温加上矿物质让它的壳无比坚硬
            "piplup",         // 波加曼：在这里游泳
            "psyduck",        // 可达鸭：(头痛冻住了)
            "snom",           // 雪吞虫：掉进水里了，正爬上岸
            "bergmite"        // 冰宝
        ],

        // === Uncommon Pool: 冰川时代的居民 (Lv 30-45) ===
        "uncommon": [
            { "id": "sealeo", "min": 32 },      // 海魔狮
            { "id": "prinplup", "min": 16 },    // 波皇子
            { "id": "dewgong", "min": 34 },     // 白海狮
            { "id": "cloyster", "min": 30 },    // 刺甲贝：不仅是防御，更能发射冰锥
            "eiscue",         // 冰砌鹅
            "lapras"          // 拉普拉斯：(Small chance) - Rare
        ],

        // === Rare Pool: 钢铁与冰 (Lv 40+) ===
        "rare": [
            "empoleon",       // 帝王拿波：(Base form uncommon, Evo Rare) -> 尊贵的甚至如破冰船般的存
            "lapras",         // 拉普拉斯：运载旅人渡过冰河
            "cetitan"         // 浩大鲸：在浅滩涉水，哪怕结冰也能撞开
        ],

        // === Boss Pool: 极寒领主 (Lv 50-65) ===
        "boss": [
            { "id": "walrein", "min": 45 },     // 帝牙海狮：统治极地水域的王者，厚实得像坦克
            { "id": "empoleon", "min": 45 },    // 帝王拿波：钢铁与水的完美结合，水银溪尽头的看门人
            { "id": "gyarados", "min": 40 },    // 暴鲤龙：即使是冰水也无法冷却它的愤怒
            { "id": "kingdra", "min": 50 }      // 刺龙王：如果在最深的出海口位置
        ]
    }
},
/* Zone: Ferro_Straits (The Iron Sea) */
/* Threat: Low -> Mid (Hostile Waters) */
/* Theme: Sharks / Heavy Currents / Sunken Metal / Bridge Pylons */

"Ferro_Straits": {

    // === 1. 河口排放区 (Sewage) ===
    // 西侧连接 Chrome Canal 的出口。水体浑浊，有一层闪着霓虹色的油膜。
    // 生态位：食腐海产、剧毒水母、靠吃下水道冲下来的垃圾为生的鱼
    "Sewage": {
        "common": [
            "tentacool",      // 玛瑙水母：数量泛滥
            "grimer_alola",   // 臭泥（阿罗拉）：在海面上漂浮吃油
            "trubbish",       // 破破袋：被不断冲入海里的垃圾
            "mareanie",       // 坏星：猎杀珊瑚
            "skrelp",         // 垃垃藻：拟态成腐烂的海带
            "qwilfish",       // 千针鱼：充满毒刺
            "shellos",        // 无壳海兔
            "magikarp"        // 鲤鱼王
        ],

        "uncommon": [
            "tentacruel",     // 毒刺水母：触手很长
            { "id": "muk_alola", "min": 38 },   // 臭臭泥(阿罗拉)
            "corphish",       // 龙虾小兵：外来入侵种在污水道很开心
            "toxapex",        // 超坏星：像堡垒一样不可撼动
            "weezing_galar",  // 双弹瓦斯(伽勒尔)：趴在出海口的烟囱上
            "slowpoke_galar"  // 呆呆兽(伽勒尔)：被毒素感染
        ],

        "rare": [
            "dragalge",       // 毒藻龙 (Lore: 这里的酸度很高)
            "garbodor",       // 灰尘山：从垃圾船上掉下来的?
            "revavroom",      // 普隆隆姆：在浅滩涉水，引擎轰鸣
            "overqwil"        // 万针鱼
        ],

        "boss": [
            { "id": "toxtricity", "min": 40 },  // 颤弦蝾螈 (Low Key)
            { "id": "muk_alola", "min": 45 },   // 臭臭泥 (油层领主)
            { "id": "clawitzer", "min": 40 }    // 钢炮臂虾：甲壳即使在只有污水道也能维持光泽
        ]
    },


    // === 2. 汹涌的深蓝钢铁海峡 (Shallow_Sea) ===
    // 即便判定是Shallow(可通行)，视觉描述是深蓝色深水。
    // 这片水域布满了巨大的混凝土和金属桥墩。水流极快。
    "Shallow_Sea": {
        
        // === Common Pool: 钢铁波涛中的泳者 (Base Stage) ===
        // 它们必须游得非常快，或者把自己固定在某种东西上
        "common": [
            // 速度型 (Sharpedo Fodder)
            "carvanha",       // 利牙鱼：这片海域最臭名昭著的集群，什么都咬，哪怕是钢铁
            "arrokuda",       // 刺梭鱼：像鱼雷一样发射自己
            "wingull",        // 长翅鸥：在桥墩间筑巢
            "remoraid",       // 铁炮鱼：吸附在桥墩或巨翅飞鱼身上
            "finneon",        // 荧光鱼
            "buizel",         // 泳圈鼬：海路救援
            
            // 附着型 / 结构型
            "binacle",        // 龟脚脚：密得让人发麻地长在桥墩上
            "magnemite",      // 小磁怪：这片海里铁太多了，所以会有磁怪在低空/水面甚至水下(生锈的)
            "clamperl",       // 珍珠贝：夹住沉船的碎片
            "dwebble",        // 石居蟹：这次背的是螺帽或者金属块
            "chinchou"        // 灯笼鱼：深水区的光点
        ],

        // === Uncommon Pool: 巡航导弹与活体水雷 (Lv 28-38) ===
        "uncommon": [
            // 海战主力
            "sharpedo",       // 巨牙鲨：海中的流氓，任何落水者都会被撕碎
            "barraskewda",    // 国际刺梭鱼：没有它钻不穿的船底
            "basculin",       // (Red/Blue) 野蛮鲈鱼：这里真的很野蛮
            "floatzel",       // 浮潜鼬
            "lanturn",        // 电灯怪
            "clobbopus",      // 拳拳蛸：用来维修桥底的铆钉?
            "wailmer",        // 吼吼鲸：像浮桶一样漂着
            "pelipper",       // 大嘴鸥
            
            // 金属外壳
            "barbaracle",     // 龟足巨铠
            "shellder",       // 大舌贝
            "staryu",         // 海星星
            { "id": "carkol", "min": 1 } // 大炭车? (掉进海里的...) -> No. Keep to Rock/Steel. 
            // "aron" 可可多拉 (Shoreline?) No. 
        ],

        // === Rare Pool: 沉船与冷雨 (Lv 35+) ===
        "rare": [
            // 沉没的历史
            "dhelmise",       // 破破舵轮：【核心Rare】这种充满海藻的生锈船锚简直就是为了 Ferro Straits 设计的
            "veluza",         // (Gen 9) 轻身雪鳕：极其残暴，为了加速不惜削掉自己的肉
            "empoleon",       // 帝王拿波：寒冷海流的帝王
            
            // 重装甲
            "metang",         // 金属怪: 在桥下悬浮
            "beldum",         // 铁哑铃
            "skarmory"        // 盔甲鸟: 从桥塔上冲下来捕鱼
        ],

        // === Boss Pool: 跨海大桥也是活的 (Lv 45-60) ===
        // 这里不适合普通的生物Boss，全是机械与怪兽
        "boss": [
            /* Gen 9 生态契合度 MAX */
            { "id": "archaludon", "min": 50 },  // (Gen 9) [铝钢桥龙]：它的造型就是一座悬索桥！它伪装成Ferro Straits大桥的一部分，是这里的终极神主。
            
            { "id": "duraludon", "min": 45 },   // 铝钢龙：普通的桥墩塔
            { "id": "sharpedo", "min": 40 },    // 巨牙鲨 (Mega? Alpha?)：撕裂浪花
            { "id": "gyarados", "min": 42 },    // 暴鲤龙：在白头浪中翻滚
            { "id": "wailord", "min": 47 },     // 吼鲸王：它浮上来的时候像个航空母舰
            { "id": "kingdra", "min": 48 },     // 刺龙王
            { "id": "grapploct", "min": 40 }    // 八爪武师：能锁住潜水艇的腕力
        ]
    }
},
/* Zone: Frigid_Floe (The Frozen Barrier) */
/* Threat: High -> Apex (Freezing temperatures cause hazard) */
/* Terrain: Glacial_Water (Ice Chunks) | Shallow_Sea (Freezing Shores) */

"Frigid_Floe": {

    // === 1. 漂浮着巨大冰山的深黑海面 (Glacial_Water) ===
    // 只有在冰层裂开的缝隙里才能下钩或潜水。水温在零下，但没有完全冻结因为盐分。
    // 生态位：极地海洋哺乳类、深海游荡者、冰块拟态者
    "Glacial_Water": {
        
        // === Common Pool: 冰泳的勇者 (Base Stage) ===
        "common": [
            "spheal",         // 海豹球：像球一样在水里浮沉
            "seel",           // 小海狮：在浮冰边缘爬上爬下
            "bergmite",       // 冰宝：在冰面上随波逐流
            "piplup",         // 波加曼：试图在浮冰间跳跃
            "shellder",       // 大舌贝：硬得不行，夹在冰块里
            "wishiwashi",     // 弱丁鱼：在深处成群结队取暖
            "snover",         // 雪笠怪? (No, land) -> "remoraid" 铁炮鱼 (被Mantine携带)
            "cryogonal"       // 几何雪花：随着升华的水汽出现
        ],

        // === Uncommon Pool: 冰洋的定居者 (Lv 30-45) ===
        "uncommon": [
            "sealeo",         // 海魔狮
            "dewgong",        // 白海狮：优雅地穿过碎冰带
            "cloyster",       // 刺甲贝：不仅有甲壳，还发射冰锥
            "eiscue",         // 冰砌鹅：头插在水里
            "prinplup",       // 波皇子
            "arctibax",       // (Gen 9) 冻脊龙：龙会在冷水里洗澡吗？会的
            "beartic"         // 冻原熊：(Swimming) 它是游泳健将
        ],

        // === Rare Pool: 古代寒意 (Lv 40+) ===
        "rare": [
            "lapras",         // 拉普拉斯：可以载人破冰前行 (Classic Rare)
            "cetitan",        // 浩大鲸：巨大的身躯在水下就像潜艇
            "glalie",         // 冰鬼护
            "dhelmise",       // 破破舵轮：如果是有被冻住的沉船...
            "avalugg_hisui",  // 洗翠冰岩怪：偶尔从岸边滑入水中
            
            // 下一代机械
            { "id": "iron_bundle", "min": 50 } // 铁包袱 (Ultra Rare Enounter)
        ],

        // === Boss Pool: 绝对零度的海王 (Lv 50-65) ===
        "boss": [
            { "id": "walrein", "min": 45 },     // 帝牙海狮：也是甚至能撞碎冰山的巨牙
            { "id": "empoleon", "min": 45 },    // 帝王拿波：黑金色的装甲企鹅
            { "id": "lapras", "min": 35 },      // (Gigantamax size context?) 拉普拉斯首领
            { "id": "avalugg", "min": 45 },     // 冰岩怪 (卡洛斯)：它就是一座漂浮的冰山
            { "id": "mamoswine", "min": 48 }    // 象牙猪：偶尔涉水渡海
        ]
    },


    // === 2. 封冻的海岸线浅滩 (Shallow_Sea) ===
    // 并不是沙滩，而是被冰雪覆盖的礁石和浅水。能见度低，经常又暴风雪。
    // 生态位：岸边涉水者、被冲上岸的猎物、甚至是冰系捕食者
    "Shallow_Sea": {
        "common": [
            "empoleon",       // (Wait, Piplup here) -> "piplup" 波加曼
            "staryu",         // 海星星 (冷冻版? 核心发蓝光)
            "krabby",         // 大钳蟹
            "clamperl",       // 珍珠贝（可以开出猎斑鱼/樱花鱼）
            "slowpoke_galar", // 呆呆兽(伽勒尔)：在发抖
            "cetoddle",       // 走鲸
            "crabrawler"      // 好胜蟹
        ],

        "uncommon": [
            "kingler",        // 巨鉗蟹
            "crabominable",   // 好胜毛蟹：原本在雪山，现在在极地海边也很合理
            "sneasel",        // 狃拉：捡食海边的贝壳
            "weavile",        // 玛狃拉
            "polytoed",       // (No.) -> "politoed"
            "tentacruel"      // 毒刺水母
        ],

        "rare": [
            // 海里的神秘来客
            "milotic",        // 美纳斯：据说在极光出现的日子会浮出水面
            "finizen",        // (Gen 9) 波普海豚：极地探索者? (Maybe Palafin needs unlock)
            "drednaw"         // 暴噬龟
        ],

        "boss": [
            // 有攻击性的海岸
            { "id": "kingra", "min": 50 },      // 刺龙王
            { "id": "beartic", "min": 45 },     // 冻原熊
            { "id": "cetitan", "min": 48 },     // 浩大鲸
            { "id": "barbaracle", "min": 40 }   // 龟足巨铠：但是每一只手上都结了冰流挂
        ]
    }
},
/* Zone: Mist_Veil_Sound (The Foggy Abyss) */
/* Threat: Mid (Low visibility hazard) */
/* Terrain: Shallow_Sea (Misty & treacherous rocks) Only */

"Mist_Veil_Sound": {

    // === 终年不散浓雾的浅海 (Shallow_Sea) ===
    // 水流不快，但底下暗礁密布。视觉受阻。
    // 在这里经常不知道碰到的是漂流木，还是什么活物。
    "Shallow_Sea": {
        
        // === Common Pool: 雾中隐现者 (Base Stage) ===
        // 它们通常不动，随波逐流
        "common": [
            // 雾的制造者与居民
            "horsea",         // 墨海马：喷墨把水弄黑，或者利用雾气
            "wingull",        // 长翅鸥：在雾里安静地滑翔，叫声是著名的背景音
            "tentacool",      // 玛瑙水母：像红色的信号灯一樣漂浮
            "shellos_east",   // 无壳海兔(东海)
            "spheal",         // 海豹球：在雾里滚来滚去
            "slowpoke",       // 呆呆兽：在礁石上发呆，成为了路标
            
            // 幽灵系入侵
            "drifloon",       // 飘飘球：(Ghost/Flying) 被海风吹到这里的，常常被误认为浮标
            "frillish",       // 轻飘飘：【核心】水/幽灵，这真的就是雾海的象征
            "litwick"         // 烛光灵：(如果是灯塔附近?)，在礁石上燃烧蓝火
        ],

        // === Uncommon Pool: 惑人心智的船歌 (Lv 28-40) ===
        "uncommon": [
            // 海妖与陷阱
            "seadra",         // 海刺龙
            "tentacruel",     // 毒刺水母：如果在雾里看到几十根触手...
            { "id": "jellicent", "min": 40 },   // 胖嘟嘟：据说会把船只拖进海底
            
            // 心理恐惧
            "malamar",        // 乌贼王：颠倒发光的斑点催眠水手 (Base: Inkay)
            "stars",          // (Typo->Starmie/Startyu) -> "staryu" 海星星(不会发得太亮)
            "dhelmise",       // 破破舵轮：在迷雾中只有海藻包裹的船锚是真实的
            "qwilfish",       // 千针鱼
            "cursola"         // 魔灵珊瑚 (伽勒尔)：死去的珊瑚礁在雾里哀嚎 (Ghost type)
        ],

        // === Rare Pool: 迷航的传说 (Lv 38+) ===
        "rare": [
            // 迷雾领航员（或者误导者）
            "lapras",         // 无壳海兔...不对 -> 拉普拉斯：在浓雾里唱歌，好坏难说
            "dragonair",      // 哈克龙：身上有能驱散（或聚集）云雾的宝珠
            "milotic",        // 美纳斯：见者幸运，但在雾里看不清
            "spiritomb",      // 花岩怪：封印在某块海边礁石上
            
            // 真正的危险
            { "id": "gyarados", "min": 20 },    // 暴鲤龙：如果是它是从雾里冲出来的...
            { "id": "primarina", "min": 34 }    // 西狮海壬：用歌声制造肥皂泡
        ],

        // === Boss Pool: 幽灵舰队 (Lv 45-60) ===
        /* "The fog is getting thicker..." */
        "boss": [
            { "id": "jellicent", "min": 40 },   // 胖嘟嘟 (雄/雌)：雾中贵族
            { "id": "basculegion", "min": 45 }, // **(Gen-LA) 幽尾玄鱼** (雄/雌)：【绝对MVP】依靠死去同伴的怨念进化的幽灵鱼，没有比这里更适合它的了！
            { "id": "dhelmise", "min": 42 },    // 破破舵轮：或许它才是那艘幽灵船的本体
            { "id": "kingra", "min": 50 },      // 刺龙王
            { "id": "wailord", "min": 47 },     // 吼鲸王：像极了一座突然浮出水面的岛屿
            { "id": "dragapult", "min": 60 }    // (Roaming) 多龙巴鲁托：隐形轰炸机，在这里更是完全不可见
        ]
    }
},
/* Zone: Cerulean_Reef (The Warm Shallows) */
/* Threat: Safe -> Mid (Purely Natural) */
/* Terrain: Shallow_Sea (Coral Reefs) Only */

"Cerulean_Reef": {

    // === 温水珊瑚礁 (Shallow_Sea) ===
    // 水温28度左右，清澈见底，但也因此能看到深处的危险。
    // 是Mantine冲浪的绝佳地点。
    "Shallow_Sea": {
        
        // === Common Pool: 浮潜者的天堂 (Base Stage) ===
        // 这里的即使是"怪"也是观感极佳的
        "common": [
            // 漂浮与飞行
            "mantyke",        // 小球飞鱼：在水面跳跃
            "remoraid",       // 铁炮鱼：寻找宿主
            "wingull",        // 长翅鸥
            "finneon",        // 荧光鱼
            "luvdisc",        // 爱心鱼
            "red_basculin",   // No, calm water -> "wishiwashi_solo" 弱丁鱼(单)
            "wishiwashi",     // 弱丁鱼
            "corsola",        // 太阳珊瑚 (普通)：(是的，从 Lagoo 到这里的 Reef 是一条连贯的珊瑚带)
            
            // 暖水共生
            "shellder",       // 大舌贝
            "krabby",         // 大钳蟹
            "clamperl",       // 珍珠贝
            "slowpoke",       // 呆呆兽
            "wigglet"         // 海地鼠：像花园里的鳗鱼
        ],

        // === Uncommon Pool: 珊瑚维护者 (Lv 25-35) ===
        "uncommon": [
            // 中型鱼类
            "lumineon",       // 霓虹鱼
            { "id": "mantine", "min": 30 },     // 巨翅飞鱼：(Iconic spawn) 如同风筝一样在水底和水面滑翔
            "gorebyss",       // 樱花鱼：(Clamperl evo) 鲜艳的粉红
            "huntail",        // 猎斑鱼：藏在珊瑚缝隙
            "alomomola",      // 保姆曼波：会治愈受伤的宝可梦
            "seadra",         // 海刺龙
            "octillery",      // 章鱼桶：(Remoraid evo) 躲在洞里
            "bruxish"         // 磨牙彩皮鱼：虽然花哨，但负责驱也是赶外敌
        ],

        // === Rare Pool: 洋流带来的惊喜 (Lv 35+) ===
        "rare": [
            "kingdra",        // 刺龙王 (Rare)：龙族通常很深，但这水太暖和了
            "lapras",         // 拉普拉斯：(Migratory) 迁徙途中
            "wailmer",        // 吼吼鲸：小喷泉
            "relicanth",      // 古空棘鱼：在最深的岩缝（连接古老的地理历史）
            "dondozo"         // 吃吼霸 (Smaller ones?)
        ],

        // === Boss Pool: 暖流之主 (Lv 45-60) ===
        // "Peaceful giants."
        "boss": [
            { "id": "wailord", "min": 45 },     // 吼鲸王：它浮出水面换气时就像一座小岛 (Horizon landmark)
            { "id": "mantine", "min": 35 },     // 巨翅飞鱼 (Alpha/Leader)：背上经常吸着好几只铁炮鱼
            { "id": "vaporeon", "min": 35 },    // 水伊布：完全的液态化
            { "id": "milotic", "min": 40 },     // 美纳斯 (Another spawn?) Yes, B-Region beauty.
            { "id": "dondozo", "min": 50 }      // 吃吼霸
        ]
    }
},
/* === Southern Border: Equatorial Dark Zone (无光深渊) === */
/* Theme: Deep water, Bioluminescence, Terror of the Depth */
"Equatorial_Dark_Zone": {
    "Deep_Sea": {
        "common": [ // 虽然是Common，但在这种地方Common意味着体型很大
            "lanturn",       // 电灯怪：深海唯一的光
            "huntail",       // 猎斑鱼：长条形的深海鱼，等待猎物
            "gorebyss",      // 樱花鱼
            "sharpedo",      // 巨牙鲨 (成群结队的巡逻，阻止你离开地图)
            "tentacruel"     // 毒刺水母：触手极长
        ],
        "uncommon": [
            "wailord",       // 吼鲸王：它在这里可以甚至完全舒展身体下潜
            "overqwil",      // 万针鱼：体型被深海压力压缩得很大?.. 不，依然是刺
            "eelektross",    // 麻麻鳗鱼王
            "relicanth"      // 古空棘鱼
        ],
        "rare": [
            "dhelmise",      // 破破舵轮：巨大的沉船遗物，尺寸远超内海版本
            "kingdra",       // 刺龙王
            "dragonite"      // 快龙：绕过这座岛的飞行者(在海面遇到)
        ],
        "boss": [
            /* The Leviathans */
            { "id": "kyogre", "min": 80 },      // 盖欧卡（原始）：始源之海的幻影。如果你继续往南，它就会张开嘴。
            { "id": "lugia", "min": 80 },       // 洛奇亚：深海的守护者，仅仅是阴影游过
            { "id": "wishiwashi_school", "min": 60 } // 改编成 "Kraken" 级大小的鱼群集合体，像云一样遮蔽光线
        ]
    }
},


/* === Western Border: Titan Trough (泰坦海槽) === */
/* Theme: Volcanic Ocean, Boiling Currents, Ancient Power */
"Titan_Trough": {
    "Deep_Sea": {
        "common": [
            "qwilfish_hisui",// 千针鱼(洗翠)：恶/毒，性格暴躁
            "gyarados",      // 暴鲤龙：这里无时无刻不在暴怒
            "crawdaunt",     // 铁螯龙虾
            "barbaracle",    // 龟足巨铠：长在海底烟囱上
            "grapploct"      // 八爪武师：和楼上打架的
        ],
        "uncommon": [
            "dragalge",      // 毒藻龙：这里酸度很高
            "cursola",       // 魔灵珊瑚：死去的珊蝴礁释放的怨念
            "drednaw",       // 暴噬龟 (G-Max Factor)
            "milotic"        // 美纳斯 (也许是黑化的?)
        ],
        "rare": [
            "volcanion",     // 波尔凯尼恩：(Lore Spawn) 在海底火山口吸水
            "lapras",        // 巨型拉普拉斯 (Gigantamax size)
            "braviary_hisui" // (Flying over sea)
        ],
        "boss": [
            /* The Kaijus */
            { "id": "godzilla", "min": 99 },    // -> Just kidding. { "id": "tyranitar", "min": 60 } 班基拉斯，站在露出的岩礁上
            { "id": "groudon", "min": 80 },     // (Primal?) 深海也能遇见古拉多？因为这里连接地幔。
            { "id": "regidrago", "min": 70 },   // 雷吉铎拉戈：龙之力量的凝结
            { "id": "tatsugiri", "min": 60 }    // (Titan Form) 巨大的霸主米立龙/吃吼霸组合
        ]
    }
},


/* === Eastern Border: Chrome Abyss (铬色深渊) === */
/* Theme: Liquid Metal, Magnetism, Alien Tech */
"Chrome_Abyss": {
    "Deep_Sea": {
        "common": [
            "magnemite",     // 小磁怪：(怎么在海里?) 它们被磁化了，吸附在彼此身上像云一样漂浮
            "klinklang",     // 齿轮怪：不知为什么在转动
            "starmie",       // 宝石海星：发出的不仅是光，还有无线电波
            "elgyem",        // 小灰怪：(Alien?) 疑似飞船坠毁点
            "rotom_wash"     // 洛托姆
        ],
        "uncommon": [
            "metang",        // 金属怪
            "bronzong",      // 青铜钟：这里其实是它的陵墓?
            "daps",          // -> "araquanid" 滴蛛霸 (Water bubbles protect them from heavy metal?)
            "beldum"
        ],
        "rare": [
            "magnezone",     // 自爆磁怪：像UFO一样在海面上方盘旋 (Sniper)
            "genesect",      // (Mythical) 盖诺赛克特：古代被改造的猎手，这里是放逐地？
            "celesteela"     // (Ultra Beast) 铁火辉夜：如果是从外星坠入深海的火箭...
        ],
        "boss": [
            /* The Machines */
            { "id": "necrozma", "min": 70 },    // 分解的棱镜装甲散落在深海，正在聚合?
            { "id": "registeel", "min": 70 },   // 雷吉斯奇鲁
            { "id": "melmetal", "min": 65 },    // 美录梅塔：液态金属的主宰
            { "id": "iron_moth", "min": 60 }    // (Paradox) 铁毒蛾：古代的卫星落下来了
        ]
    }
},


/* === Northern Border: Boreal Trench (北境海沟) === */
/* Theme: Icebergs, Cryolife, Stillness */
"Boreal_Trench": {
    "Deep_Sea": {
        "common": [
            "avaluug",       // 冰岩怪：它们不是生物，就是地形本身
            "walrein",       // 帝牙海狮
            "sealeo",        // 海魔狮
            "dewgong",       // 白海狮
            "cryogonal",     // 几何雪花：结晶化的海水
            "beartic"        // 冻原熊：正在跨越海冰
        ],
        "uncommon": [
            "lapras",        // 拉普拉斯
            "cloyster",      // 刺甲贝
            "eiscue",        // 冰 筑鹅
            "piplup"         // 波加曼大迁徙
        ],
        "rare": [
            "regice",        // 雷吉艾斯：本身就是一座无法融化的冰山
            "arctovish",     // (Fossil) 鳃鱼海兽：错误的复活，痛苦地生活在冰水中
            "arctozolt"      // 雷鸟海兽
        ],
        "boss": [
            /* The Frozen Gods */
            { "id": "kyurem", "min": 80 },      // 酋雷姆：来自外太空的冰龙，在此沉睡
            { "id": "baxcalibur", "min": 65 },  // 戟脊龙：哥斯拉
            { "id": "articuno", "min": 70 },    // 急冻鸟
            { "id": "iron_bundle", "min": 60 }  // 铁包袱：疯狂地在海沟里穿梭
        ]
    }
}
} ;
