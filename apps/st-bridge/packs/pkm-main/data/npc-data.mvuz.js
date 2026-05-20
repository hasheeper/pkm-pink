/**
 * PKM Main fixed NPC relationship data and helpers.
 * Generated from apps/dashboard-main/backups/pkm-tavern-plugin.js.20260324.bak and adapted for MVUZ.
 */
(function () {
  'use strict';

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


  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;
  RUNTIME.data = RUNTIME.data || {};

  function clone(value, fallback = null) {
    if (value === undefined || value === null) return fallback;
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return fallback; }
  }

  function clampNumber(value, min, max, fallback = 0) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }

  function normalizeNpcKey(value) {
    const normalized = String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!normalized) return '';
    if (NPC_ADDON_DATA[normalized]) return normalized;
    for (const [key, triggers] of Object.entries(NPC_TRIGGERS)) {
      if (key === normalized) return key;
      if ((triggers || []).some((trigger) => String(trigger || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '') === normalized)) {
        return key;
      }
    }
    return normalized;
  }

  function getNpcAddon(npcId) {
    return NPC_ADDON_DATA[normalizeNpcKey(npcId)] || null;
  }

  function clampLove(value) {
    return clampNumber(value, -100, 100, 0);
  }

  function deriveNpcStage(npcId, record = {}, playerBonds = {}) {
    const key = normalizeNpcKey(npcId);
    const addon = NPC_ADDON_DATA[key] || null;
    const love = clampLove(record && typeof record === 'object' ? record.love : record);
    if (love <= -40) return -2;
    if (love <= -20) return -1;
    if (love < 20) return 0;
    if (love < 40) return 1;
    if (love < 60) return 2;
    if (love < 80) return 3;
    if (addon && addon.unlock_key && addon.unlock_item && playerBonds && playerBonds[addon.unlock_key] !== true) return 3;
    return 4;
  }

  function getNpcStageTags(npcId, stage) {
    const addon = getNpcAddon(npcId);
    const stageKey = String(stage);
    const commonTags = RELATIONSHIP_TAGS_COMMON[stageKey] || ['未知', '未知'];
    const characterTags = addon && addon.relationship_tags && addon.relationship_tags[stageKey] ? addon.relationship_tags[stageKey] : ['未知', '未知'];
    const tags = commonTags.concat(characterTags);
    return { tags, tagsDisplay: tags.map((tag) => '#' + tag).join(' ') };
  }

  function getNpcStageDesc(npcId, stage) {
    const tags = getNpcStageTags(npcId, stage);
    return { label: tags.tagsDisplay, desc: '' };
  }

  function getNextLoveThreshold(stage) {
    if (stage <= -2) return -20;
    if (stage <= -1) return 20;
    if (stage === 0) return 20;
    if (stage === 1) return 40;
    if (stage === 2) return 60;
    if (stage === 3) return 80;
    return null;
  }

  function formatNpcStatusCard(npcId, record = {}, playerBonds = {}) {
    const key = normalizeNpcKey(npcId);
    const addon = NPC_ADDON_DATA[key];
    if (!addon) return null;
    const love = clampLove(record.love);
    const stage = deriveNpcStage(key, { love }, playerBonds);
    const tags = getNpcStageTags(key, stage);
    const nextThreshold = getNextLoveThreshold(stage);
    const hasBond = addon.unlock_key && playerBonds && playerBonds[addon.unlock_key] === true;
    let statusTag = '';
    if (addon.unlock_key && addon.unlock_item && love >= 80 && !hasBond) {
      statusTag = '[羁绊道具事件待触发]';
    } else if (stage === 4 || stage === -2) {
      statusTag = '[Lock]';
    }
    const loveDisplay = nextThreshold === null ? String(love) + '/MAX' : String(love) + '/' + String(nextThreshold);
    return [
      addon.name_cn + ' (' + addon.name_en + ')',
      '   - [Stage ' + stage + '] ' + tags.tagsDisplay + ' (Love: ' + loveDisplay + ')',
      statusTag ? '   - ' + statusTag : ''
    ].filter(Boolean).join('\n');
  }

  function scanForNpcTriggers(text) {
    const lower = String(text || '').toLowerCase();
    if (!lower) return [];
    const found = new Set();
    Object.entries(NPC_TRIGGERS).forEach(([npcKey, triggers]) => {
      if ((triggers || []).some((trigger) => lower.includes(String(trigger).toLowerCase()))) found.add(npcKey);
    });
    return Array.from(found);
  }

  function getPendingUnlockEvents(state = {}) {
    const records = state && state.npcs && state.npcs.records && typeof state.npcs.records === 'object' ? state.npcs.records : {};
    const playerBonds = state && state.player && state.player.bonds && typeof state.player.bonds === 'object' ? state.player.bonds : {};
    return Object.entries(records)
      .map(([npcId, record]) => {
        const key = normalizeNpcKey(npcId);
        const addon = NPC_ADDON_DATA[key];
        const love = clampLove(record && record.love);
        if (!addon || !addon.unlock_key || !addon.unlock_item || love < 80 || playerBonds[addon.unlock_key] === true) return null;
        return { npcId: key, npcName: addon.name_cn, unlockKey: addon.unlock_key, unlockItem: clone(addon.unlock_item, {}), love };
      })
      .filter(Boolean)
      .sort((a, b) => b.love - a.love || a.npcId.localeCompare(b.npcId));
  }

  function generateUnlockEventPrompt(event) {
    const npcId = event && event.npcId;
    const npcName = event && event.npcName;
    const unlockKey = event && event.unlockKey;
    const unlockItem = event && event.unlockItem;
    if (!npcId || !unlockKey || !unlockItem) return '';
    const patches = [
      { op: 'replace', path: '/pkm/player/bonds/' + unlockKey, value: true },
      { op: 'replace', path: '/pkm/player/unlocks/' + unlockKey, value: true }
    ];
    return '<pkm_unlock_event>\n'
      + '【羁绊遗物获得事件】' + npcName + ' 的誓约之证\n'
      + (unlockItem.emoji || '') + ' ' + (unlockItem.name_cn || '') + ' (' + (unlockItem.name_en || '') + ')\n'
      + '物品描述: ' + (unlockItem.desc || '') + '\n'
      + npcName + '的话语: ' + (unlockItem.dialogue || '') + '\n'
      + '系统效果: ' + (unlockItem.effect || '') + '\n'
      + '[系统指令] 请在本次回复中演绎 ' + npcName + ' 将这件遗物交给玩家的场景。演绎完成后，在回复末尾输出以下 MVU JSONPatch，授予该羁绊道具和对应战斗能力；不要写 NPC stage。\n'
      + '<UpdateVariable>\n<Analysis>' + npcId + ' bond relic is unlocked.</Analysis>\n<JSONPatch>\n'
      + JSON.stringify(patches)
      + '\n</JSONPatch>\n</UpdateVariable>\n</pkm_unlock_event>';
  }

  const npcDataApi = {
    triggers: NPC_TRIGGERS,
    addons: NPC_ADDON_DATA,
    zones: ZONE_DATA,
    commonTags: RELATIONSHIP_TAGS_COMMON,
    normalizeNpcKey,
    getNpcAddon,
    clampLove,
    deriveNpcStage,
    getNpcStageTags,
    getNpcStageDesc,
    getNextLoveThreshold,
    getZoneCharacters,
    generateZoneStatusCard,
    formatNpcStatusCard,
    scanForNpcTriggers,
    getPendingUnlockEvents,
    generateUnlockEventPrompt
  };

  RUNTIME.data.npc = npcDataApi;
  ROOT.PKM_MAIN_NPC_DATA = npcDataApi;
})();
