/**
 * ===========================================
 * UI-SPRITES.JS - 精灵图加载与管理
 * ===========================================
 * 
 * 职责:
 * - 精灵图智能加载（支持多图库回退）
 * - ID 变体生成（支持地区形态、Mega 等）
 * - 精灵图状态重置
 */

// ============================================
// 状态管理
// ============================================

// 记录每个精灵当前请求的原始URL（用于判断是否需要重新加载）
const spriteRequestedUrls = {};

// ============================================
// ID 变体生成
// ============================================

/**
 * 生成 ID 变体（支持带横杠的宝可梦名字）
 * @param {string} name 原始名称
 * @returns {object} 包含多种 ID 变体的对象
 */
function generateIdVariants(name = '') {
    const raw = name.toLowerCase().trim();
    // 1. 严格模式 (保留横杠): "vulpix-alola", "ho-oh"
    const strict = raw.replace(/[^a-z0-9-]/g, '');
  
    // 2. 紧凑模式 (无横杠): "vulpixalola", "hooh"
    const compact = raw.replace(/[^a-z0-9]/g, '');
  
    // 3. 基础模式 (尝试移除后缀): "vulpix-alola" -> "vulpix"
    const suffixes = [
        '-alola', '-galar', '-hisui', '-paldea',
        '-mega', '-megax', '-megay', '-gmax',
        '-origin', '-therian', '-incarnate',
        '-black', '-white', '-dusk', '-dawn',
        '-school', '-complete', '-attack', '-defense', '-speed',
        '-primal', '-combat', '-blaze', '-aqua'
    ];
  
    let base = strict;
    for (const suffix of suffixes) {
        if (base.endsWith(suffix)) {
            base = base.replace(suffix, '');
            break;
        }
    }
    // 保留特殊名字的横杠
    if (base !== 'ho-oh' && base !== 'porygon-z' && base !== 'jangmo-o' && base !== 'hakamo-o' && base !== 'kommo-o') {
        base = base.replace(/-/g, '');
    }

    return { strict, compact, base };
}

// ============================================
// 智能精灵图加载
// ============================================

/**
 * 智能加载精灵图（支持多图库回退）
 * @param {string} id DOM 元素 ID
 * @param {string} url 目标 URL
 * @param {boolean} forceAnim 是否强制播放入场动画
 */
function smartLoadSprite(id, url, forceAnim = false) {
    const img = document.getElementById(id);
    if (!img) return;

    // 如果请求的URL没变且已加载完成，跳过（避免重复加载）
    if (!forceAnim && spriteRequestedUrls[id] === url && img.classList.contains('loaded')) {
        return;
    }

    // 强制重播动画（换人时）
    if (forceAnim && spriteRequestedUrls[id] === url && img.classList.contains('loaded')) {
        console.log(`[SPRITE] Replay entry animation for: ${url}`);
        img.classList.remove('entering');
        void img.offsetWidth;
        img.classList.add('entering');
        setTimeout(() => img.classList.remove('entering'), 650);
        return;
    }

    // 记录本次请求的原始URL
    spriteRequestedUrls[id] = url;

    // 标记是否已经播放过入场动画
    let hasPlayedAnimation = false;
    
    // 播放入场动画的helper
    const playEntryAnimation = () => {
        if (!hasPlayedAnimation) {
            hasPlayedAnimation = true;
            img.classList.remove('entering');
            void img.offsetWidth;
            img.classList.add('entering');
            setTimeout(() => img.classList.remove('entering'), 650);
        }
    };
    
    // === 关键修复：使用预加载，完全加载后再一次性切换 ===
    const tryLoadUrl = (targetUrl, fallbackUrls = []) => {
        console.log(`[SPRITE] Trying to load: ${targetUrl}, fallbacks: ${fallbackUrls.length}`);
        const preloader = new Image();
        preloader.onload = () => {
            console.log(`[SPRITE] SUCCESS: ${preloader.src}`);
            
            // 【关键】如果 URL 变化了（真正的精灵图切换），触发淡入效果
            const isUrlChanged = img.src !== preloader.src;
            
            if (isUrlChanged) {
                // URL 变化：移除 loaded 类触发淡入
                img.style.transition = 'none';
                img.classList.remove('loaded', 'fainted-hidden', 'fainting', 'entering');
                img.src = preloader.src;
                void img.offsetWidth; // 强制重排
                img.style.transition = '';
                img.classList.add('loaded');
            } else {
                // URL 未变：只移除动画类，保持显示状态
                img.classList.remove('fainted-hidden', 'fainting', 'entering');
                img.src = preloader.src;
                if (!img.classList.contains('loaded')) {
                    img.classList.add('loaded');
                }
            }
            
            // 【太晶化】注入 --sprite-url CSS 变量供 mask-image 使用
            if (img.parentElement) {
                img.parentElement.style.setProperty('--sprite-url', `url(${preloader.src})`);
            }
            
            playEntryAnimation();
        };
        preloader.onerror = () => {
            console.log(`[SPRITE] FAILED: ${targetUrl}, trying next fallback...`);
            if (fallbackUrls.length > 0) {
                tryLoadUrl(fallbackUrls[0], fallbackUrls.slice(1));
            } else {
                console.log(`[SPRITE] All fallbacks exhausted for: ${targetUrl}`);
                
                // === 动态检测非官方 Mega：所有回退都失败 ===
                const originalUrl = spriteRequestedUrls[id] || url;
                const megaMatch = originalUrl.match(/sprites\/(ani|ani-back)\/(.+?)\.gif$/);
                if (megaMatch && megaMatch[2].includes('mega')) {
                    const isBack = megaMatch[1] === 'ani-back';
                    const baseId = megaMatch[2].replace(/mega[xy]?$/, '').replace(/-$/, '');
                    const baseSpriteUrl = `https://play.pokemonshowdown.com/sprites/${isBack ? 'ani-back' : 'ani'}/${baseId}.gif`;
                    
                    console.log(`[SPRITE] Unofficial Mega detected! Falling back to base form: ${baseSpriteUrl}`);
                    img.classList.add('unofficial-mega');
                    
                    const baseLoader = new Image();
                    baseLoader.onload = () => {
                        img.style.transition = 'none';
                        img.classList.remove('loaded', 'entering');
                        img.src = baseLoader.src;
                        void img.offsetWidth;
                        img.style.transition = '';
                        img.classList.add('loaded');
                        if (img.parentElement) {
                            img.parentElement.style.setProperty('--sprite-url', `url(${baseLoader.src})`);
                        }
                        playEntryAnimation();
                    };
                    baseLoader.onerror = () => {
                        img.style.transition = 'none';
                        img.classList.remove('loaded', 'entering');
                        img.src = targetUrl;
                        void img.offsetWidth;
                        img.style.transition = '';
                        img.classList.add('loaded');
                        if (img.parentElement) {
                            img.parentElement.style.setProperty('--sprite-url', `url(${targetUrl})`);
                        }
                    };
                    baseLoader.src = baseSpriteUrl;
                    return;
                }
                
                img.style.transition = 'none';
                img.classList.remove('loaded', 'entering');
                img.src = targetUrl;
                void img.offsetWidth;
                img.style.transition = '';
                img.classList.add('loaded');
                if (img.parentElement) {
                    img.parentElement.style.setProperty('--sprite-url', `url(${targetUrl})`);
                }
            }
        };
        preloader.src = targetUrl;
    };
    
    // 构建回退URL列表
    const m = url.match(/https?:\/\/play\.pokemonshowdown\.com\/sprites\/(ani|ani-back|ani-back-shiny|ani-shiny)\/(.+?)\.gif$/);
    if (m) {
        const spriteFolder = m[1];
        const isBack = spriteFolder.includes('back');
        const isShiny = spriteFolder.includes('shiny');
        const spriteId = m[2];
        
        const { strict, compact, base } = generateIdVariants(spriteId);
        const baseId = typeof getFallbackSpriteId === 'function' ? getFallbackSpriteId(spriteId) : base;
        
        const idVariants = [spriteId];
        if (strict !== spriteId) idVariants.push(strict);
        if (compact !== spriteId && compact !== strict) idVariants.push(compact);
        const semiCompact = spriteId.replace(/-([a-z]+)-/g, '-$1');
        if (semiCompact !== spriteId && !idVariants.includes(semiCompact)) {
            idVariants.push(semiCompact);
        }
        if (baseId !== spriteId && !idVariants.includes(baseId)) {
            idVariants.push(baseId);
        }
        
        const fallbacks = [];
        
        const isMega = spriteId.includes('mega');
        const isGmax = spriteId.includes('gmax');
        const isPrimal = spriteId.includes('primal');
        const isSpecialForm = isMega || isGmax || isPrimal;
        
        const aniFolder = isShiny 
            ? (isBack ? 'ani-back-shiny' : 'ani-shiny')
            : (isBack ? 'ani-back' : 'ani');
        const frontFolder = isShiny ? 'ani-shiny' : 'ani';
        const gen5aniFolder = isBack ? 'gen5ani-back' : 'gen5ani';
        const gen5Folder = isBack ? 'gen5-back' : 'gen5';
        
        const formVariants = idVariants.filter(id => id !== baseId);
        
        if (isSpecialForm) {
            // 特殊形态优先
            for (const id of formVariants) {
                if (id !== spriteId) {
                    fallbacks.push(`https://play.pokemonshowdown.com/sprites/${aniFolder}/${id}.gif`);
                }
            }
            if (isBack) {
                for (const id of formVariants) {
                    fallbacks.push(`https://play.pokemonshowdown.com/sprites/${frontFolder}/${id}.gif`);
                }
            }
            
            // pkparaiso 图库
            let pkparaisoId = spriteId;
            if (/mega[xy]?$/i.test(pkparaisoId)) {
                pkparaisoId = pkparaisoId.replace(/mega([xy])?$/i, '-mega$1');
            } else if (/gmax$/i.test(pkparaisoId)) {
                pkparaisoId = pkparaisoId.replace(/gmax$/i, '-gmax');
            } else if (/primal$/i.test(pkparaisoId)) {
                pkparaisoId = pkparaisoId.replace(/primal$/i, '-primal');
            }
            const pkparaisoFolder = isBack ? 'animados-espalda' : 'animados';
            const isORASForm = spriteId.includes('rayquaza') || spriteId.includes('primal');
            const pkparaisoGen = isORASForm ? 'rubi-omega-zafiro-alfa' : (isGmax ? 'espada_escudo' : 'xy');
            fallbacks.push(`https://www.pkparaiso.com/imagenes/${pkparaisoGen}/sprites/${pkparaisoFolder}/${pkparaisoId}.gif`);
            
            for (const id of formVariants) {
                fallbacks.push(`https://play.pokemonshowdown.com/sprites/${gen5aniFolder}/${id}.gif`);
            }
            
            for (const id of formVariants) {
                fallbacks.push(`https://play.pokemonshowdown.com/sprites/${gen5Folder}/${id}.png`);
            }
            
            // 最后回退到基础形态
            fallbacks.push(`https://play.pokemonshowdown.com/sprites/${aniFolder}/${baseId}.gif`);
            if (isBack) {
                fallbacks.push(`https://play.pokemonshowdown.com/sprites/${frontFolder}/${baseId}.gif`);
            }
            fallbacks.push(`https://play.pokemonshowdown.com/sprites/${gen5aniFolder}/${baseId}.gif`);
            fallbacks.push(`https://play.pokemonshowdown.com/sprites/${gen5Folder}/${baseId}.png`);
        } else {
            // 普通形态按层级回退
            for (const id of idVariants) {
                if (id !== spriteId) {
                    fallbacks.push(`https://play.pokemonshowdown.com/sprites/${aniFolder}/${id}.gif`);
                }
            }
            if (isBack) {
                for (const id of idVariants) {
                    fallbacks.push(`https://play.pokemonshowdown.com/sprites/${frontFolder}/${id}.gif`);
                }
            }
            
            for (const id of idVariants) {
                fallbacks.push(`https://play.pokemonshowdown.com/sprites/${gen5aniFolder}/${id}.gif`);
            }
            
            for (const id of idVariants) {
                fallbacks.push(`https://play.pokemonshowdown.com/sprites/${gen5Folder}/${id}.png`);
            }
        }
        
        // Pokesprite 图库（只有正面图）
        if (!isBack) {
            for (const id of idVariants) {
                fallbacks.push(`https://raw.githubusercontent.com/msikma/pokesprite/master/pokemon-gen8/regular/${id}.png`);
            }
        }
        
        tryLoadUrl(url, fallbacks);
    } else {
        tryLoadUrl(url, []);
    }
}

// ============================================
// 精灵图状态重置
// ============================================

/**
 * 重置精灵图状态
 */
function resetSpriteState() {
    ['player-sprite', 'enemy-sprite'].forEach(id => {
        const sprite = document.getElementById(id);
        if (!sprite) return;
        sprite.classList.remove('fainted-hidden', 'fainting', 'entering', 'loaded', 'shake-hit-anim');
        sprite.style.removeProperty('opacity');
        sprite.style.removeProperty('transform');
    });
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.spriteRequestedUrls = spriteRequestedUrls;
    window.generateIdVariants = generateIdVariants;
    window.smartLoadSprite = smartLoadSprite;
    window.resetSpriteState = resetSpriteState;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        spriteRequestedUrls,
        generateIdVariants,
        smartLoadSprite,
        resetSpriteState
    };
}
