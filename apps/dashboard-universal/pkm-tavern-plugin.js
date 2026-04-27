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
   * 检测训练家类型：生成式NPC / 野生（Mini版本：无固定NPC数据库）
   * @param {string} name - 训练家名字
   * @param {string} type - 显式指定的类型 ('wild', 'trainer', etc)
   * @returns {string} - 'generated_trainer' | 'wild' | 'player'
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
    
    // Mini版本：所有非玩家、非野生的训练家都是生成式NPC
    return 'generated_trainer';
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

  // Mini版本：无固定NPC数据库
  function getTrainerDatabase() {
    return {}; // 返回空对象，所有训练家都使用AI生成数据
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
   * @param {string} trainerName - 训练家名字
   * @param {number} tier - 难度等级 (1-4)
   * @returns {object|null} { party: [...], unlocks: {...}, difficulty: '...' }
   */
  function lookupTrainerFromDB(trainerName, tier = 2) {
    // Mini版本：无固定NPC数据库，直接返回 null
    console.log(`${PLUGIN_NAME} [DEBUG] Mini版本：无固定NPC数据库，${trainerName} 将使用AI生成数据`);
    return null;
  }

  // ============================================
  //    敌方队伍解析
  // ============================================
  
  function resolveEnemyParty(enemySource, aiBattleData) {
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
   * 解析敌方数据（Mini版本：无固定NPC数据库，全部使用AI生成）
   * @param {object} enemySource - AI 输出的敌方配置
   * @param {object} aiBattleData - AI 输出的完整数据
   * @returns {object} { party, type, name, lines, unlocks, difficulty }
   */
  function resolveEnemyData(enemySource, aiBattleData) {
    const rawType = (enemySource.type || '').toString().toLowerCase();
    const isWild = rawType === 'wild';
    const enemyName = enemySource.name || (isWild ? 'wild' : 'Trainer');
    const enemyLines = enemySource.lines || {};
    const enemyId = enemySource.id || enemyName;
    const tier = enemySource.tier || aiBattleData.tier || 2;
    
    // 特殊处理：双打格式已经在 processTrainerParty 中处理过，直接返回
    if (enemySource._trainersData && Array.isArray(enemySource._trainersData)) {
      console.log(`${PLUGIN_NAME} 双打格式敌方已预处理，直接使用`);
      
      // 处理每个训练家的队伍（生成缺失的宝可梦）
      const trainersWithParty = enemySource._trainersData.map(trainerData => {
        const isWildTrainer = trainerData.trainerType === 'wild';
        
        let trainerParty = trainerData.party.map(p => {
          if (p._needGenerate) {
            const pokemonTier = p._tier || trainerData.tier || tier;
            console.log(`${PLUGIN_NAME} [P2] 为 ${trainerData.name} 生成宝可梦: ${p.name} (Tier ${pokemonTier}, ${isWildTrainer ? '野生' : '自定义NPC'})`);
            return generateWildPokemon(p, pokemonTier, !isWildTrainer);
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
      
      // 计算总数并按比例分配
      const totalCount = trainersWithParty.reduce((sum, t) => sum + t.originalCount, 0);
      const finalParty = [];
      
      if (totalCount <= 6) {
        trainersWithParty.forEach(t => {
          finalParty.push(...t.party);
          console.log(`${PLUGIN_NAME} [P2] ${t.name} 队伍: ${t.party.map(p => p.name).join(', ')}`);
        });
      } else {
        console.log(`${PLUGIN_NAME} [P2] 总队伍数 ${totalCount} > 6，按比例分配`);
        
        const allocations = trainersWithParty.map(t => {
          const ratio = t.originalCount / totalCount;
          const allocated = Math.max(1, Math.round(ratio * 6));
          return { ...t, allocated };
        });
        
        let totalAllocated = allocations.reduce((sum, a) => sum + a.allocated, 0);
        while (totalAllocated > 6) {
          const maxAlloc = allocations.filter(a => a.allocated > 1).sort((a, b) => b.allocated - a.allocated)[0];
          if (maxAlloc) {
            maxAlloc.allocated--;
            totalAllocated--;
          } else break;
        }
        
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
    
    // Mini版本：所有敌方都使用 AI 生成数据
    if (hasDetailedParty || aiProvidedParty) {
      const isCustomNpc = !isWild;
      console.log(`${PLUGIN_NAME} [Mini] 使用 AI 数据生成敌方（${isWild ? '野生' : '自定义NPC'}模式）`);
      
      const generatedParty = enemySource.party.map(p => {
        const baseData = typeof p === 'string' ? { name: p } : p;
        const pokemonTier = baseData._tier || tier;
        return generateWildPokemon(baseData, pokemonTier, isCustomNpc);
      });
      
      // 自动检测 mechanic 字段并设置 unlock 权限
      const autoDetectedUnlocks = detectUnlocksFromParty(generatedParty);
      const finalUnlocks = mergeUnlocks(enemySource.unlocks, autoDetectedUnlocks);
      
      return {
        party: generatedParty,
        type: isWild ? 'wild' : 'trainer',
        name: enemyName,
        id: enemyId,
        lines: enemyLines,
        unlocks: finalUnlocks,
        trainerProficiency: enemySource.trainerProficiency || 0,
        difficulty: aiBattleData.difficulty || 'normal'
      };
    }
    
    // 兜底：完全随机生成
    console.log(`${PLUGIN_NAME} [Mini] 使用随机生成模式`);
    
    let rawParty = (Array.isArray(aiBattleData.party) && aiBattleData.party.length > 0)
      ? aiBattleData.party
      : [{ name: enemyName !== 'wild' ? enemyName : 'Rattata', lv: 5 }];
    
    const isCustomNpc = !isWild;
    const generatedParty = rawParty.map(p => {
      const baseData = typeof p === 'string' ? { name: p } : p;
      const pokemonTier = baseData._tier || tier;
      return generateWildPokemon(baseData, pokemonTier, isCustomNpc);
    });
    
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
      // 处理：bonds (数字) → avs (四项), 保留 mechanic/teraType
      const normalizePokemonFormat = (pokemon) => {
        if (!pokemon) return pokemon;
        
        // === 新格式：bonds 是数字，展开为四项 AVS ===
        if (typeof pokemon.bonds === 'number') {
          const bondsValue = pokemon.bonds;
          pokemon.avs = {
            trust: bondsValue,
            passion: bondsValue,
            insight: bondsValue,
            devotion: bondsValue
          };
          console.log(`${PLUGIN_NAME} [BONDS] ${pokemon.name}: bonds=${bondsValue} → avs={T:${bondsValue}/P:${bondsValue}/I:${bondsValue}/D:${bondsValue}}`);
        }
        // 兼容旧格式：如果有嵌套的 friendship，提取为扁平 avs
        else if (pokemon.friendship && pokemon.friendship.avs) {
          pokemon.avs = { ...pokemon.friendship.avs };
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
    // 从 unlocks 读取解锁状态
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
      
      // Bonds (羁绊值) - 简化版：单一数值，显示时展开为四项
      const bonds = pokemon.bonds || 0;
      const bondsDisplay = bonds > 0 ? `${bonds}` : '0';
      
      // 技能
      const moves = Array.isArray(pokemon.moves) && pokemon.moves.length > 0 ? pokemon.moves : [];
      const movesCount = moves.length;
      const movesDetailed = Array.from({ length: 4 }).map((_, moveIdx) => {
        const moveName = moves[moveIdx] || '—';
        return `move${moveIdx + 1}: ${moveName}`;
      }).join(' | ');

      return `slot${slotNum}. ${gender} ${name} (Lv.${level})${leadTag}
   🧬 [Nature: ${nature}] [Ability: ${ability}]
   💎 [Stats: ${ivsDisplay}] [EVs: ${evLevel}] [Bonds: ${bondsDisplay}]
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

    // 构建解锁能力清单（简化版）
    let inventorySection = '';
    if (unlocksDisplay.length > 0) {
      inventorySection = `\n🔓 《解锁能力》\n  ${unlocksDisplay.join(' | ')}\n`;
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
      
      // === 处理 bonds_up：累加到 bonds ===
      const bondsUpdateData = {};
      if (playerData && playerData.party) {
        for (const [slotKey, slotData] of Object.entries(playerData.party)) {
          if (slotData && typeof slotData.bonds_up === 'number' && slotData.bonds_up > 0) {
            const currentBonds = slotData.bonds || 0;
            const bondsUp = slotData.bonds_up;
            const newBonds = currentBonds + bondsUp;
            
            console.log(`${PLUGIN_NAME} [BONDS_UP] 槽位: ${slotKey}, 当前 bonds: ${currentBonds}, bonds_up: ${bondsUp}, 新 bonds: ${newBonds}`);
            
            // 标记需要更新
            bondsUpdateData[`pkm.player.party.${slotKey}.bonds`] = newBonds;
            bondsUpdateData[`pkm.player.party.${slotKey}.bonds_up`] = 0;
            
            // 立即更新本地数据（用于注入）
            slotData.bonds = newBonds;
            slotData.bonds_up = 0;
          }
        }
      }
      
      // 如果有 bonds_up 需要处理，立即更新到 ERA
      if (Object.keys(bondsUpdateData).length > 0) {
        try {
          await updateEraVars(bondsUpdateData);
          console.log(`${PLUGIN_NAME} ✓ 已处理 bonds_up 并更新到 ERA`);
        } catch (e) {
          console.warn(`${PLUGIN_NAME} 更新 bonds_up 失败:`, e);
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
      
      // === 设置玩家宝可梦 isAce（主角光环）===
      const aceUpdateData = {};
      let pokemonCount = 0;
      if (playerData && playerData.party) {
        for (const [slotKey, slotData] of Object.entries(playerData.party)) {
          if (!slotData || !slotData.name) continue;
          pokemonCount++;
          
          // 玩家的所有宝可梦都是 Ace（主角光环）
          if (!slotData.isAce) {
            slotData.isAce = true;
            aceUpdateData[`pkm.player.party.${slotKey}.isAce`] = true;
          }
        }
      }
      
      // 如果有 isAce 需要更新，立即更新到 ERA
      if (Object.keys(aceUpdateData).length > 0) {
        try {
          await updateEraVars(aceUpdateData);
          console.log(`${PLUGIN_NAME} ✓ 已设置 ${Object.keys(aceUpdateData).length} 只玩家宝可梦 isAce`);
        } catch (e) {
          console.warn(`${PLUGIN_NAME} 更新 isAce 失败:`, e);
        }
      } else if (pokemonCount === 0) {
        console.log(`${PLUGIN_NAME} [DEBUG] 队伍中没有宝可梦，跳过 isAce 设置`);
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

  // 监听生成前事件 - 注入玩家队伍数据到上下文
  eventOn('GENERATION_AFTER_COMMANDS', async (detail) => {
    // 处理玩家队伍数据注入
    await handleGenerationBeforeInject(detail);
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
    
    
    // 获取当前版本
    version: '2.0.0-mini'
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
      
      // === 处理 bonds_up：累加到 bonds ===
      // 检查是否是 party 的槽位更新
      if (path.includes('player.party.slot') || path.includes('pkm.player.party.slot')) {
        const slotMatch = path.match(/slot\d+/);
        if (slotMatch) {
          const slotKey = slotMatch[0];
          const bondsUp = obj.bonds_up;
          
          // 如果有 bonds_up 且大于 0，累加到 bonds
          if (bondsUp !== undefined && bondsUp !== null && typeof bondsUp === 'number' && bondsUp > 0) {
            const currentBonds = getEraValue(currentVars, `player.party.${slotKey}.bonds`, 0);
            const newBonds = currentBonds + bondsUp;
            
            console.log(`${PLUGIN_NAME} [BONDS_UP] 槽位: ${slotKey}, 当前 bonds: ${currentBonds}, bonds_up: ${bondsUp}, 新 bonds: ${newBonds}`);
            
            // 更新 bonds
            obj.bonds = newBonds;
            
            // 重置 bonds_up 为 0
            obj.bonds_up = 0;
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
        const guardedData = guardDeleteSlots(data);
        originalEventEmit.call(window, eventName, guardedData);
      } else {
        // 其他事件直接透传
        originalEventEmit.apply(window, arguments);
      }
    };
    console.log(`${PLUGIN_NAME} ✓ ERA 变量拦截器已安装（防呆 + ev_up/proficiency_up/bonds_up 自动累加）`);
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

  console.log(`${PLUGIN_NAME} ✓✓✓ Mini版本插件加载完成 (v2.0.0) ✓✓✓`);
  console.log(`${PLUGIN_NAME} 可用接口: window.PKMPlugin`);
  console.log(`${PLUGIN_NAME} [队伍] getPlayerParty() / setPlayerParty(mode, input) / addToParty(pokemon)`);
  console.log(`${PLUGIN_NAME} [战斗] triggerBattle(data)`);

})();

