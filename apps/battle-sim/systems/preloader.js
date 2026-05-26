/**
 * ===========================================
 * PRELOADER.JS - 资源预加载系统
 * ===========================================
 */

const PreloadCache = {
    sprites: {},
    cries: {},
    bgm: {},
    sfx: {},
    trainerAvatars: {},
    pokemonIcons: {}
};

// 获取基础路径 (兼容 GitHub Pages)
function getPreloadBasePath() {
    // 如果已有全局 getBasePath，使用它
    if (typeof window !== 'undefined' && typeof window.getBasePath === 'function') {
        return window.getBasePath();
    }
    const path = window.location.pathname;
    // GitHub Pages: /repo-name/
    if (path.includes('/pkm33/')) {
        return path.substring(0, path.indexOf('/pkm33/') + 7);
    }
    return './';
}

// 本地资源路径配置（动态获取基础路径）
function getLocalResources() {
    const basePath = getPreloadBasePath();
    return {
        avatarPath: `${basePath}data/avatar/`,
        bgmPath: `${basePath}data/bgm/`,
        sfxPath: `${basePath}data/sfx/`,
        // BGM 文件列表
        bgmFiles: LOCAL_RESOURCE_FILES.bgm,
        // SFX 文件列表
        sfxFiles: LOCAL_RESOURCE_FILES.sfx,
        // 训练家头像列表
        avatarFiles: LOCAL_RESOURCE_FILES.avatars
    };
}

// 静态文件列表（不依赖路径）
const LOCAL_RESOURCE_FILES = {
    // BGM 文件列表
    bgm: [
        'battle_01_raw', 'battle_02_standard', 'battle_03_gym_crisis', 'battle_03_gym_main',
        'battle_04_elite', 'battle_05_legend', 'wild_01_low_unova', 'wild_02_mid_sinnoh',
        'wild_03_ex_areazero', 'win_01_wild', 'win_02_trainer'
    ],
    // SFX 文件列表
    sfx: [
        'Hit_Super_Effective_XY', 'ball_open', 'ball_throw', 'battle_faint', 'battle_heal',
        'hit_00_normal', 'hit_02_weak', 'stat_down', 'stat_up', 'ui_01_confirm'
    ],
    // 训练家头像列表
    avatars: [
        'akari', 'bea', 'cynthia', 'dawn', 'erika', 'gloria', 'hexmaniac', 'iono',
        'irida', 'juliana', 'lana', 'lillie', 'lusamine', 'mallow', 'marnie', 'nessa',
        'rosa', 'roxie', 'selene', 'serena', 'sonia'
    ]
};

/**
 * 预加载精灵图
 */
function preloadSprite(name, isBack = false) {
    return new Promise((resolve) => {
        // 使用与 battle-engine.js resolveSpriteId 相同的格式（保留横杠）
        const id = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const cacheKey = `${id}_${isBack ? 'back' : 'front'}`;
        
        if (PreloadCache.sprites[cacheKey]) {
            resolve(PreloadCache.sprites[cacheKey]);
            return;
        }
        
        const folder = isBack ? 'ani-back' : 'ani';
        const url = `https://play.pokemonshowdown.com/sprites/${folder}/${id}.gif`;
        
        const img = new Image();
        img.onload = () => {
            PreloadCache.sprites[cacheKey] = img;
            resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = url;
        
        setTimeout(() => resolve(null), 5000);
    });
}

/**
 * 预加载叫声
 */
function preloadCry(name) {
    return new Promise((resolve) => {
        let id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (typeof POKEDEX !== 'undefined' && POKEDEX[id] && POKEDEX[id].baseSpecies) {
            id = POKEDEX[id].baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, '');
        }
        
        const suffixes = ['mega', 'megax', 'megay', 'gmax', 'alola', 'hisui', 'paldea', 'galar'];
        for (const s of suffixes) {
            if (id.endsWith(s) && id.length > s.length) {
                id = id.replace(s, '');
                break;
            }
        }
        
        if (PreloadCache.cries[id]) {
            resolve(PreloadCache.cries[id]);
            return;
        }
        
        const url = `https://play.pokemonshowdown.com/audio/cries/${id}.mp3`;
        const audio = new Audio();
        audio.preload = 'auto';
        
        audio.oncanplaythrough = () => {
            PreloadCache.cries[id] = audio;
            resolve(audio);
        };
        audio.onerror = () => resolve(null);
        audio.src = url;
        
        setTimeout(() => resolve(null), 5000);
    });
}

/**
 * 预加载训练家头像
 */
function preloadTrainerAvatar(trainerId) {
    return new Promise((resolve) => {
        if (!trainerId || trainerId === 'wild') {
            resolve(null);
            return;
        }
        
        if (PreloadCache.trainerAvatars[trainerId]) {
            resolve(PreloadCache.trainerAvatars[trainerId]);
            return;
        }
        
        // 修复路径: data/trainers -> data/avatar
        const resources = getLocalResources();
        const url = `${resources.avatarPath}${trainerId}.png`;
        const img = new Image();
        img.onload = () => {
            PreloadCache.trainerAvatars[trainerId] = img;
            console.log(`[PRELOAD] Trainer avatar loaded: ${trainerId}`);
            resolve(img);
        };
        img.onerror = () => {
            console.warn(`[PRELOAD] Failed to load trainer avatar: ${trainerId}`);
            resolve(null);
        };
        img.src = url;
        
        setTimeout(() => resolve(null), 3000);
    });
}

/**
 * 预加载本地 BGM
 */
function preloadBGM(bgmId) {
    return new Promise((resolve) => {
        if (PreloadCache.bgm[bgmId]) {
            resolve(PreloadCache.bgm[bgmId]);
            return;
        }
        
        const resources = getLocalResources();
        const url = `${resources.bgmPath}${bgmId}.mp3`;
        const audio = new Audio();
        audio.preload = 'auto';
        
        audio.oncanplaythrough = () => {
            PreloadCache.bgm[bgmId] = audio;
            console.log(`[PRELOAD] BGM loaded: ${bgmId}`);
            resolve(audio);
        };
        audio.onerror = () => {
            console.warn(`[PRELOAD] Failed to load BGM: ${bgmId}`);
            resolve(null);
        };
        audio.src = url;
        
        setTimeout(() => resolve(null), 10000);
    });
}

/**
 * 预加载本地 SFX
 */
function preloadSFX(sfxId) {
    return new Promise((resolve) => {
        if (PreloadCache.sfx[sfxId]) {
            resolve(PreloadCache.sfx[sfxId]);
            return;
        }
        
        const resources = getLocalResources();
        const url = `${resources.sfxPath}${sfxId}.mp3`;
        const audio = new Audio();
        audio.preload = 'auto';
        
        audio.oncanplaythrough = () => {
            PreloadCache.sfx[sfxId] = audio;
            resolve(audio);
        };
        audio.onerror = () => resolve(null);
        audio.src = url;
        
        setTimeout(() => resolve(null), 5000);
    });
}

/**
 * 预加载所有本地 BGM 和 SFX
 */
async function preloadAllLocalAudio() {
    const tasks = [];
    
    const resources = getLocalResources();
    
    // 预加载所有 BGM
    for (const bgmId of resources.bgmFiles) {
        tasks.push(preloadBGM(bgmId));
    }
    
    // 预加载所有 SFX
    for (const sfxId of resources.sfxFiles) {
        tasks.push(preloadSFX(sfxId));
    }
    
    await Promise.all(tasks);
    console.log('[PRELOAD] All local audio loaded');
}

/**
 * 预加载所有本地训练家头像
 */
async function preloadAllAvatars() {
    const resources = getLocalResources();
    const tasks = resources.avatarFiles.map(id => preloadTrainerAvatar(id));
    await Promise.all(tasks);
    console.log('[PRELOAD] All trainer avatars loaded');
}

/**
 * 预加载宝可梦头像 sprite sheet (所有宝可梦共享)
 */
function preloadPokemonIconSheet() {
    return new Promise((resolve) => {
        if (PreloadCache.pokemonIcons['sheet']) {
            resolve(PreloadCache.pokemonIcons['sheet']);
            return;
        }
        
        const url = `https://play.pokemonshowdown.com/sprites/pokemonicons-sheet.png`;
        const img = new Image();
        img.onload = () => {
            PreloadCache.pokemonIcons['sheet'] = img;
            console.log('[PRELOAD] Pokemon icon sheet loaded');
            resolve(img);
        };
        img.onerror = () => {
            console.warn('[PRELOAD] Failed to load pokemon icon sheet');
            resolve(null);
        };
        img.src = url;
        
        setTimeout(() => resolve(null), 5000);
    });
}

/**
 * 获取宝可梦所有可能的形态（用于预加载）
 * @param {object} pokemon - 宝可梦对象
 * @returns {string[]} - 所有可能的形态 ID 列表
 */
function getPossibleForms(pokemon) {
    const forms = [];
    const baseName = pokemon.name || pokemon;
    // 保留横杠，与 Showdown 精灵图 URL 格式一致
    const baseId = baseName.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    forms.push(baseId);
    
    // 检查 mechanic 字段决定可能的形态变化
    const mechanic = pokemon.mechanic || '';
    
    // Mega 进化 - Showdown 格式带横杠: charizard-mega-x
    if (mechanic === 'mega' || pokemon.canMega) {
        // 检查是否有 X/Y 双形态（喷火龙、超梦）
        if (baseId === 'charizard' || baseId === 'mewtwo') {
            forms.push(`${baseId}-mega-x`);
            forms.push(`${baseId}-mega-y`);
        } else {
            forms.push(`${baseId}-mega`);
        }
    }
    
    // 极巨化 - Showdown 格式带横杠: lapras-gmax
    if (mechanic === 'dynamax' || pokemon.canDynamax) {
        if (pokemon.canGmax || pokemon.gmaxMove) {
            forms.push(`${baseId}-gmax`);
        }
    }
    
    // 原始回归 - Showdown 格式带横杠: groudon-primal
    if (baseId === 'groudon' || baseId === 'kyogre') {
        forms.push(`${baseId}-primal`);
    }
    
    // 究极爆发（奈克洛兹玛）- Showdown 格式
    if (baseId.includes('necrozma')) {
        forms.push('necrozma-dawn-wings');
        forms.push('necrozma-dusk-mane');
        forms.push('necrozma-ultra');
    }
    
    // 基格尔德形态
    if (baseId.includes('zygarde')) {
        forms.push('zygarde');
        forms.push('zygarde-10');
        forms.push('zygarde-complete');
    }
    
    // 弱丁鱼形态
    if (baseId.includes('wishiwashi')) {
        forms.push('wishiwashi');
        forms.push('wishiwashi-school');
    }
    
    return [...new Set(forms)]; // 去重
}

/**
 * 预加载切换界面图标（gen5 静态图 + pokesprite 特殊形态）
 * @param {object} pokemon - 宝可梦对象
 * @returns {Promise} - 预加载 Promise
 */
function preloadSwitchIcon(pokemon) {
    return new Promise((resolve) => {
        const name = pokemon.name || pokemon;
        const seedIdWithHyphen = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
        const seedIdCompact = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // 从 POKEDEX 获取形态信息
        const pokeData = (typeof POKEDEX !== 'undefined' && POKEDEX[seedIdCompact]) 
            ? POKEDEX[seedIdCompact] : null;
        const forme = pokeData?.forme || '';
        const baseSpecies = pokeData?.baseSpecies || '';
        const formeLower = forme.toLowerCase();
        
        // 检测形态类型
        const regionalForms = ['alola', 'galar', 'hisui', 'paldea'];
        const isRegionalForm = regionalForms.some(r => formeLower.includes(r)) ||
            regionalForms.some(r => seedIdWithHyphen.includes(`-${r}`));
        const isMegaForm = formeLower.includes('mega') || seedIdWithHyphen.includes('-mega');
        const isPrimalForm = formeLower === 'primal' || seedIdWithHyphen.includes('-primal');
        const isUltraForm = formeLower === 'ultra' || seedIdWithHyphen.includes('-ultra');
        const isCrownedForm = formeLower === 'crowned' || seedIdWithHyphen.includes('-crowned');
        
        const specialForms = ['wash', 'heat', 'mow', 'frost', 'fan', 'dusk-mane', 'dawn-wings',
            'ice', 'shadow', 'zen', 'therian', 'origin', 'sky', 'attack', 'defense', 'speed',
            'combat', 'blaze', 'aqua'];
        const isOtherSpecialForm = specialForms.some(f => formeLower.includes(f)) ||
            specialForms.some(f => seedIdWithHyphen.includes(`-${f}`));
        
        const needsPokesprite = isRegionalForm || isMegaForm || isPrimalForm || isUltraForm || 
            isCrownedForm || isOtherSpecialForm;
        
        // 生成图标 URL
        let imgSrc;
        if (needsPokesprite) {
            let pokespriteId = seedIdWithHyphen;
            // Mega X/Y 格式修正
            if (isMegaForm && !pokespriteId.includes('-mega')) {
                pokespriteId = pokespriteId.replace(/mega([xy])$/i, '-mega-$1');
                if (!pokespriteId.includes('-mega')) {
                    pokespriteId = pokespriteId.replace(/mega$/i, '-mega');
                }
            }
            // Primal 格式修正
            if (isPrimalForm && !pokespriteId.includes('-primal')) {
                pokespriteId = pokespriteId.replace(/primal$/i, '-primal');
            }
            // Necrozma 特殊形态格式修正
            pokespriteId = pokespriteId.replace(/-dusk-mane$/, '-dusk');
            pokespriteId = pokespriteId.replace(/-dawn-wings$/, '-dawn');
            
            imgSrc = `https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${pokespriteId}.png`;
        } else {
            imgSrc = `https://play.pokemonshowdown.com/sprites/gen5/${seedIdCompact}.png`;
        }
        
        // 缓存键
        const cacheKey = `icon_${seedIdCompact}`;
        if (PreloadCache.sprites[cacheKey]) {
            resolve(PreloadCache.sprites[cacheKey]);
            return;
        }
        
        const img = new Image();
        img.onload = () => {
            PreloadCache.sprites[cacheKey] = img;
            resolve(img);
        };
        img.onerror = () => resolve(null);
        img.src = imgSrc;
        
        setTimeout(() => resolve(null), 5000);
    });
}

/**
 * 预加载本局所有资源（增强版）
 */
async function preloadBattleResources(playerParty, enemyParty, trainerId, onProgress) {
    const spriteTasks = [];
    const cryTasks = [];
    const iconTasks = [];
    const otherTasks = [];
    
    // 收集所有需要预加载的形态
    const allForms = new Set();
    
    // 玩家队伍
    for (const p of playerParty) {
        const forms = getPossibleForms(p);
        forms.forEach(f => allForms.add(f));
        // 预加载切换界面图标
        iconTasks.push(preloadSwitchIcon(p));
    }
    
    // 敌方队伍
    for (const e of enemyParty) {
        const forms = getPossibleForms(e);
        forms.forEach(f => allForms.add(f));
    }
    
    // 计算总数
    const formsList = [...allForms];
    // 精灵图(正面+背面) + 叫声 + 图标 + 训练家头像 + 头像sheet
    const total = formsList.length * 3 + iconTasks.length + 2;
    let loaded = 0;
    
    const updateProgress = () => {
        loaded++;
        if (onProgress) onProgress(loaded, total);
    };
    
    // 预加载所有形态的精灵图和叫声
    for (const formId of formsList) {
        // 正面精灵图（敌方）
        spriteTasks.push(preloadSprite(formId, false).then(updateProgress));
        // 背面精灵图（玩家）
        spriteTasks.push(preloadSprite(formId, true).then(updateProgress));
        // 叫声
        cryTasks.push(preloadCry(formId).then(updateProgress));
    }
    
    // 图标任务添加进度更新
    const iconTasksWithProgress = iconTasks.map(task => task.then(updateProgress));
    
    // 训练家头像
    otherTasks.push(preloadTrainerAvatar(trainerId).then(updateProgress));
    
    // 宝可梦头像 sprite sheet
    otherTasks.push(preloadPokemonIconSheet().then(updateProgress));
    
    // 并行执行所有任务
    await Promise.all([...spriteTasks, ...cryTasks, ...iconTasksWithProgress, ...otherTasks]);
    console.log(`[PRELOAD] All resources loaded (${formsList.length} forms, ${iconTasks.length} icons)`);
}

/**
 * 预加载所有静态资源（游戏启动时调用）
 */
async function preloadStaticResources(onProgress) {
    const resources = getLocalResources();
    const tasks = [];
    let loaded = 0;
    const total = resources.bgmFiles.length + resources.sfxFiles.length + resources.avatarFiles.length;
    
    const updateProgress = () => {
        loaded++;
        if (onProgress) onProgress(loaded, total);
    };
    
    // BGM
    for (const bgmId of resources.bgmFiles) {
        tasks.push(preloadBGM(bgmId).then(updateProgress));
    }
    
    // SFX
    for (const sfxId of resources.sfxFiles) {
        tasks.push(preloadSFX(sfxId).then(updateProgress));
    }
    
    // 训练家头像
    for (const avatarId of resources.avatarFiles) {
        tasks.push(preloadTrainerAvatar(avatarId).then(updateProgress));
    }
    
    await Promise.all(tasks);
    console.log('[PRELOAD] All static resources loaded');
}

/**
 * 获取缓存的叫声并播放
 */
function playCachedCry(name, volume = 0.45) {
    // 【全局开关】SFX 系统关闭时不播放叫声
    if (typeof window !== 'undefined' && window.GAME_SETTINGS && !window.GAME_SETTINGS.enableSFX) {
        return;
    }
    
    let id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (typeof POKEDEX !== 'undefined' && POKEDEX[id] && POKEDEX[id].baseSpecies) {
        id = POKEDEX[id].baseSpecies.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    
    const suffixes = ['mega', 'megax', 'megay', 'gmax', 'alola', 'hisui', 'paldea', 'galar'];
    for (const s of suffixes) {
        if (id.endsWith(s) && id.length > s.length) {
            id = id.replace(s, '');
            break;
        }
    }
    
    const cached = PreloadCache.cries[id];
    if (cached) {
        const clone = cached.cloneNode();
        clone.volume = volume;
        clone.play().catch(() => {});
        console.log(`[CRY] Playing cached: ${name} -> ${id}`);
    } else {
        // Fallback: 直接在线加载 (避免递归调用 playPokemonCry)
        const url = `https://play.pokemonshowdown.com/audio/cries/${id}.mp3`;
        const cryAudio = new Audio(url);
        cryAudio.volume = volume;
        cryAudio.play().catch(() => {});
        console.log(`[CRY] Playing online (cache miss): ${name} -> ${id}`);
    }
}

// 导出
window.preloadBattleResources = preloadBattleResources;
window.preloadStaticResources = preloadStaticResources;
window.preloadAllLocalAudio = preloadAllLocalAudio;
window.preloadAllAvatars = preloadAllAvatars;
window.preloadTrainerAvatar = preloadTrainerAvatar;
window.preloadPokemonIconSheet = preloadPokemonIconSheet;
window.preloadSwitchIcon = preloadSwitchIcon;
window.preloadBGM = preloadBGM;
window.preloadSFX = preloadSFX;
window.playCachedCry = playCachedCry;
window.getPossibleForms = getPossibleForms;
window.getPreloadBasePath = getPreloadBasePath;
window.getLocalResources = getLocalResources;
window.PreloadCache = PreloadCache;
window.LOCAL_RESOURCE_FILES = LOCAL_RESOURCE_FILES;
