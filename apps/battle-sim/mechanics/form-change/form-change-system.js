/**
 * =============================================
 * FORM CHANGE SYSTEM - 统一形态变化系统
 * =============================================
 * 
 * 整合自:
 * - form-change-system.js (通用形态变化)
 * - mega-selection-dialog.js (Mega X/Y 选择)
 * - necrozma-fusion.js (奈克洛兹玛合体)
 * 
 * 支持的形态变化类型：
 * 1. Mega Evolution（超进化）- 按钮触发
 * 2. Ultra Burst（究极爆发）- 按钮触发
 * 3. Primal Reversion（原始回归）- 进场自动触发
 * 4. Crowned Form（剑盾之王）- 进场自动触发
 * 5. Battle Bond（羁绊进化）- 击杀触发
 * 6. HP-Threshold Forms（血量阈值形态）- HP 变化触发
 * 7. Necrozma Fusion（奈克洛兹玛合体）- 开局触发
 */

(function() {
'use strict';

// ============================================
// 第一部分：通用形态变化核心逻辑
// ============================================

/**
 * 执行通用形态变化（引擎层面）
 * @param {Pokemon} pokemon - 要变形的宝可梦
 * @param {string} targetFormId - 目标形态 ID（如 'charizardmegax', 'kyogreprimal'）
 * @param {string} formType - 形态类型（'mega', 'primal', 'ultra', 'crowned' 等）
 * @returns {object|null} - 变化结果信息，或 null 如果失败
 */
function performFormChange(pokemon, targetFormId, formType = 'mega') {
    if (!targetFormId) {
        console.warn(`[FORM] No target form ID provided for ${pokemon.name}`);
        return null;
    }
    
    const formData = getPokemonData(targetFormId);
    if (!formData) {
        console.warn(`[FORM] Form data not found: ${targetFormId}`);
        return null;
    }
    
    // 保存旧数据用于日志
    const oldName = pokemon.cnName;
    const oldTypes = [...pokemon.types];
    const oldAbility = pokemon.ability;
    
    // 更新基础数据
    pokemon.name = formData.name;
    
    // 重新翻译新形态的名字
    if (typeof window !== 'undefined' && window.Locale) {
        const transName = window.Locale.get(formData.name);
        
        if (transName === formData.name && formType === 'minior') {
            pokemon.cnName = `小陨星-${transName.split('-')[1] || '核心'}`;
        } 
        else if (transName === formData.name && formData.name.includes("-Hisui")) {
            const baseName = window.Locale.get(formData.name.split('-')[0]);
            pokemon.cnName = `${baseName}-洗翠`;
        }
        else {
            pokemon.cnName = transName;
        }
    } else {
        pokemon.cnName = formData.name;
    }
    
    pokemon.types = formData.types || pokemon.types;
    pokemon.baseStats = formData.baseStats;
    
    // 获取新形态的特性
    const formPokedexData = typeof POKEDEX !== 'undefined' ? POKEDEX[targetFormId] : null;
    if (formPokedexData && formPokedexData.abilities) {
        pokemon.ability = formPokedexData.abilities['0'] || formPokedexData.abilities['H'] || pokemon.ability;
    }
    
    // 重新计算能力值
    const oldHp = pokemon.currHp;
    const oldMaxHp = pokemon.maxHp;
    
    let autoEv = Math.floor(pokemon.level * 1.5);
    if (autoEv > 85) autoEv = 85;
    
    const newStats = calcStats(formData.baseStats, pokemon.level, 31, autoEv);
    
    // HP 处理：大部分形态变化保持 HP 不变，但基格尔德完全体例外
    const isZygardeComplete = targetFormId === 'zygardecomplete';
    if (isZygardeComplete) {
        const hpRatio = oldHp / oldMaxHp;
        pokemon.maxHp = newStats.hp;
        pokemon.currHp = Math.floor(pokemon.maxHp * hpRatio);
    } else {
        pokemon.maxHp = oldMaxHp;
        pokemon.currHp = oldHp;
    }
    
    // 更新其他能力值
    pokemon.atk = newStats.atk;
    pokemon.def = newStats.def;
    pokemon.spa = newStats.spa;
    pokemon.spd = newStats.spd;
    pokemon.spe = newStats.spe;
    
    // 标记已变形
    pokemon.isTransformed = true;
    pokemon.currentForm = targetFormId;
    pokemon.formType = formType;
    
    // 向后兼容：如果是 Mega/Ultra，也标记 isMega
    if (formType === 'mega' || formType === 'ultra') {
        pokemon.isMega = true;
    }
    
    // 返回变化信息
    const typeChanged = JSON.stringify(oldTypes) !== JSON.stringify(pokemon.types);
    const abilityChanged = oldAbility !== pokemon.ability;
    
    return {
        success: true,
        oldName,
        newName: pokemon.cnName,
        formType,
        typeChanged,
        newTypes: pokemon.types,
        abilityChanged,
        newAbility: pokemon.ability
    };
}

/**
 * 检查并执行进场时的自动形态变化（Init-Transform）
 */
function checkInitTransform(pokemon) {
    if (pokemon.needsInitTransform && pokemon.initTransformTarget && !pokemon.isTransformed) {
        console.log(`[FORM] Init-Transform triggered for ${pokemon.name} -> ${pokemon.initTransformTarget}`);
        const result = performFormChange(pokemon, pokemon.initTransformTarget, pokemon.initTransformType);
        pokemon.needsInitTransform = false;
        return result;
    }
    return null;
}

/**
 * 检查并执行击杀触发的形态变化（Battle Bond）
 */
function checkBattleBondTransform(pokemon) {
    if (pokemon.ability !== 'Battle Bond') return null;
    
    const baseId = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (baseId === 'greninjaash' || pokemon.isTransformed) return null;
    
    const targetId = 'greninjaash';
    const targetData = getPokemonData(targetId);
    if (!targetData) return null;
    
    console.log(`[FORM] Battle Bond triggered: ${pokemon.name} -> Ash-Greninja`);
    return performFormChange(pokemon, targetId, 'battlebond');
}

/**
 * 检查并执行血量阈值触发的形态变化
 */
function checkHPThresholdTransform(pokemon) {
    const baseId = pokemon.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hpRatio = pokemon.currHp / pokemon.maxHp;
    
    // 弱丁鱼 (Wishiwashi) - 鱼群特性
    if (pokemon.ability === 'Schooling' && baseId.includes('wishiwashi')) {
        const currentlySchool = baseId === 'wishiwashischool';
        if (hpRatio > 0.25 && !currentlySchool) {
            return performFormChange(pokemon, 'wishiwashischool', 'schooling');
        } else if (hpRatio <= 0.25 && currentlySchool) {
            return performFormChange(pokemon, 'wishiwashi', 'schooling');
        }
    }
    
    // 基格尔德 (Zygarde) - 群聚变形特性
    if (pokemon.ability === 'Power Construct' && baseId.includes('zygarde')) {
        const currentlyComplete = baseId === 'zygardecomplete';
        if (hpRatio < 0.5 && !currentlyComplete && !pokemon._zygardeTransformed) {
            pokemon._zygardeTransformed = true;
            return performFormChange(pokemon, 'zygardecomplete', 'powerconstruct');
        }
    }
    
    // 小陨星 (Minior) - 界限盾特性
    if (pokemon.ability === 'Shields Down' && baseId.includes('minior')) {
        const currentlyShielded = !baseId.includes('core');
        if (hpRatio > 0.5 && !currentlyShielded) {
            return performFormChange(pokemon, 'minior', 'shieldsdown');
        } else if (hpRatio <= 0.5 && currentlyShielded) {
            return performFormChange(pokemon, 'miniorcoreform', 'shieldsdown');
        }
    }
    
    // 达摩狒狒 (Darmanitan) - 达摩模式特性
    // 普通版：darmanitan <-> darmanitanzen
    // 伽勒尔版：darmanitangalar <-> darmanitangalarzen
    if (pokemon.ability === 'Zen Mode' && baseId.includes('darmanitan')) {
        const isZen = baseId.includes('zen');
        const isGalar = baseId.includes('galar');
        
        // HP <= 50% 且不是达摩模式 -> 变成达摩模式
        if (hpRatio <= 0.5 && !isZen) {
            const targetId = isGalar ? 'darmanitangalarzen' : 'darmanitanzen';
            const result = performFormChange(pokemon, targetId, 'zenmode');
            if (result && result.success) {
                console.log(`[ZEN MODE] ${pokemon.cnName} 变成了达摩模式！`);
            }
            return result;
        }
        // HP > 50% 且是达摩模式 -> 变回普通模式
        else if (hpRatio > 0.5 && isZen) {
            const targetId = isGalar ? 'darmanitangalar' : 'darmanitan';
            const result = performFormChange(pokemon, targetId, 'zenmode');
            if (result && result.success) {
                console.log(`[ZEN MODE] ${pokemon.cnName} 恢复了普通模式！`);
            }
            return result;
        }
    }
    
    return null;
}

// ============================================
// 第二部分：对话框通用样式
// ============================================

function injectDialogStyles() {
    if (document.getElementById('form-change-dialog-style')) return;
    
    const style = document.createElement('style');
    style.id = 'form-change-dialog-style';
    style.textContent = `
        :root {
            --fc-mega-x-color: #3b82f6;
            --fc-mega-y-color: #ef4444;
            --fc-mega-base-color: #a855f7;
            --fc-fusion-dusk-color: #f59e0b;
            --fc-fusion-dawn-color: #8b5cf6;
            --fc-fusion-ultra-color: #fbbf24;
        }
        .fc-overlay {
            animation: fcFadeIn 0.3s ease-out forwards;
        }
        @keyframes fcFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fcGlassUp {
            from { opacity: 0; transform: translateY(30px) skewX(-10deg); }
            to { opacity: 1; transform: translateY(0) skewX(-10deg); }
        }
        .fc-bg-grid {
            background-image: 
                linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
            background-size: 20px 20px;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 创建通用对话框容器
 */
function createDialogContainer(isDark = false) {
    injectDialogStyles();
    
    const overlay = document.createElement('div');
    overlay.className = 'fc-overlay';
    overlay.style.cssText = `
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, ${isDark ? '0.55' : '0.45'});
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 8000;
    `;

    const dialogShape = document.createElement('div');
    dialogShape.style.cssText = `
        position: relative;
        background: ${isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.85)'};
        backdrop-filter: blur(20px) saturate(1.8);
        -webkit-backdrop-filter: blur(20px) saturate(1.8);
        border: 1px solid rgba(255, 255, 255, ${isDark ? '0.1' : '0.6'});
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, ${isDark ? '0.6' : '0.4'});
        padding: 40px 60px;
        border-radius: 20px;
        max-width: ${isDark ? '800px' : '620px'};
        transform: skewX(-10deg);
        animation: fcGlassUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
    `;

    // 背景网格
    const bgDecor = document.createElement('div');
    bgDecor.className = 'fc-bg-grid';
    bgDecor.style.cssText = `
        position: absolute;
        top: -50%; left: -50%; width: 200%; height: 200%;
        z-index: 0;
        pointer-events: none;
        transform: skewX(10deg);
        opacity: ${isDark ? '0.3' : '0.6'};
    `;
    dialogShape.appendChild(bgDecor);

    // 内容容器
    const content = document.createElement('div');
    content.style.cssText = `
        transform: skewX(10deg);
        position: relative;
        z-index: 5;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    `;

    return { overlay, dialogShape, content };
}

/**
 * 创建取消按钮
 */
function createCancelButton(text, isDark, onClick) {
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = text;
    cancelBtn.style.cssText = `
        margin-top: 35px;
        background: transparent;
        border: 2px solid ${isDark ? '#475569' : '#cbd5e1'};
        color: ${isDark ? '#64748b' : '#94a3b8'};
        font-weight: 800;
        font-size: ${isDark ? '12px' : '13px'};
        letter-spacing: 1px;
        cursor: pointer;
        padding: 8px 32px;
        border-radius: 50px;
        transition: all 0.2s;
        font-family: inherit;
    `;
    cancelBtn.onmouseenter = () => {
        cancelBtn.style.borderColor = isDark ? '#64748b' : '#94a3b8';
        cancelBtn.style.color = isDark ? '#94a3b8' : '#64748b';
        cancelBtn.style.background = isDark ? 'rgba(255,255,255,0.05)' : '#fff';
    };
    cancelBtn.onmouseleave = () => {
        cancelBtn.style.borderColor = isDark ? '#475569' : '#cbd5e1';
        cancelBtn.style.color = isDark ? '#64748b' : '#94a3b8';
        cancelBtn.style.background = 'transparent';
    };
    cancelBtn.onclick = onClick;
    return cancelBtn;
}

// ============================================
// 第三部分：Mega 形态选择对话框
// ============================================

/**
 * 显示 Mega 形态选择对话框（喷火龙/超梦 X/Y 选择）
 */
function showMegaFormSelectionDialog(pokemon, callback) {
    const { overlay, dialogShape, content } = createDialogContainer(false);

    // 顶部彩色装饰条
    const topBar = document.createElement('div');
    topBar.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 6px;
        background: linear-gradient(90deg, #3b82f6 0%, #a855f7 50%, #ef4444 100%);
        z-index: 2;
    `;
    dialogShape.appendChild(topBar);

    // 标题
    const title = document.createElement('h2');
    title.innerHTML = `MEGA EVOLUTION`;
    title.style.cssText = `
        color: #1e293b;
        font-size: 36px;
        font-weight: 900;
        font-style: italic;
        margin: 0;
        letter-spacing: -1.5px;
        text-shadow: 2px 2px 0px rgba(255,255,255,0.4);
    `;

    const subTitle = document.createElement('div');
    subTitle.textContent = `Select form for ${pokemon.cnName || pokemon.name}`;
    subTitle.style.cssText = `
        color: #64748b;
        font-size: 15px;
        font-weight: 600;
        margin-top: 5px;
        margin-bottom: 35px;
        text-transform: uppercase;
        letter-spacing: 1px;
    `;

    // 选项按钮容器
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = `
        display: flex;
        gap: 24px;
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
    `;

    // 形态处理
    const forms = pokemon.megaFormsAvailable || [];
    if (forms.length === 0) {
        const base = pokemon.name.toLowerCase();
        if (base.includes('mewtwo') || base.includes('charizard')) {
            forms.push(base.endsWith('mega') ? base + 'x' : base + 'megax');
            forms.push(base.endsWith('mega') ? base + 'y' : base + 'megay');
        } else {
            forms.push('default');
        }
    }

    forms.forEach(formId => {
        const isX = formId.toLowerCase().includes('x');
        const isY = formId.toLowerCase().includes('y');
        
        let labelLarge = isX ? 'X' : isY ? 'Y' : '∞';
        let subText = isX ? 'ATTACK' : isY ? 'SPECIAL' : 'POWER';
        let themeColor = isX ? '#3b82f6' : isY ? '#ef4444' : '#a855f7';

        const btn = document.createElement('div');
        btn.style.cssText = `
            flex: 1;
            min-width: 130px;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255,255,255,0.8);
            border-bottom: 4px solid ${themeColor}15;
            border-radius: 16px;
            padding: 25px 15px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;

        btn.innerHTML = `
            <div style="font-size: 12px; font-weight: 800; color: ${themeColor}; opacity: 0.8; letter-spacing: 1.5px; margin-bottom: 4px;">MEGA</div>
            <div style="font-size: 56px; font-weight: 900; color: #1e293b; line-height:1; font-style: italic; position: relative; z-index:2;">${labelLarge}</div>
            <div style="font-size: 11px; font-weight: 700; color: #94a3b8; margin-top: 4px; letter-spacing: 0.5px;">${subText}</div>
            <div class="fill-anim" style="
                position: absolute; bottom: 0; left: 0; right: 0; height: 0; 
                background: ${themeColor}; z-index: 1;
                transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            "></div>
        `;

        btn.onmouseenter = () => {
            btn.style.transform = 'translateY(-6px)';
            btn.style.borderBottomColor = themeColor;
            btn.style.boxShadow = `0 12px 25px -5px ${themeColor}40`;
            btn.children[0].style.color = 'rgba(255,255,255,0.8)';
            btn.children[1].style.color = '#fff';
            btn.children[2].style.color = 'rgba(255,255,255,0.6)';
            btn.querySelector('.fill-anim').style.height = '100%';
        };
        btn.onmouseleave = () => {
            btn.style.transform = 'translateY(0)';
            btn.style.borderBottomColor = `${themeColor}15`;
            btn.style.boxShadow = 'none';
            btn.children[0].style.color = themeColor;
            btn.children[1].style.color = '#1e293b';
            btn.children[2].style.color = '#94a3b8';
            btn.querySelector('.fill-anim').style.height = '0';
        };

        btn.onclick = () => {
            overlay.style.transition = 'opacity 0.2s';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.parentNode && overlay.parentNode.removeChild(overlay), 200);
            callback(formId);
        };

        optionsContainer.appendChild(btn);
    });

    // 取消按钮
    const cancelBtn = createCancelButton('CANCEL', false, () => {
        overlay.style.transition = 'opacity 0.2s';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.parentNode && overlay.parentNode.removeChild(overlay), 200);
        callback(null);
    });

    // 组装
    content.appendChild(title);
    content.appendChild(subTitle);
    content.appendChild(optionsContainer);
    content.appendChild(cancelBtn);
    dialogShape.appendChild(content);
    overlay.appendChild(dialogShape);
    // 添加到 #ui-scale 内部，确保在 .screen-filters 的层叠上下文中
    const uiScale = document.getElementById('ui-scale') || document.body;
    uiScale.appendChild(overlay);

    overlay.onclick = (e) => {
        if (e.target === overlay) cancelBtn.click();
    };
}

// ============================================
// 第四部分：Necrozma 合体系统
// ============================================

/**
 * 检测队伍中是否存在 Necrozma 合体条件
 */
function detectNecrozmaFusion(party) {
    if (!party || !Array.isArray(party)) return { canFuse: false };
    
    let necrozmaIndex = -1, lunalaIndex = -1, solgaleoIndex = -1;
    
    party.forEach((poke, index) => {
        if (!poke) return;
        const name = (poke.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (name === 'necrozma') necrozmaIndex = index;
        if (name === 'lunala') lunalaIndex = index;
        if (name === 'solgaleo') solgaleoIndex = index;
    });
    
    const hasLunala = lunalaIndex !== -1;
    const hasSolgaleo = solgaleoIndex !== -1;
    const hasNecrozma = necrozmaIndex !== -1;
    
    return {
        necrozmaIndex, lunalaIndex, solgaleoIndex,
        hasLunala, hasSolgaleo, hasNecrozma,
        canFuse: hasNecrozma && (hasLunala || hasSolgaleo),
        hasBothOptions: hasNecrozma && hasLunala && hasSolgaleo
    };
}

/**
 * 执行 Necrozma 合体
 */
function executeNecrozmaFusion(party, fusionType, detection) {
    const logs = [];
    
    if (!detection.canFuse) {
        return { success: false, logs: ['合体条件不满足'], fusedPokemon: null };
    }
    
    const necrozma = party[detection.necrozmaIndex];
    let fusionPartner = null;
    let fusionPartnerIndex = -1;
    let newFormName = '';
    let newFormCnName = '';
    
    if (fusionType === 'dawn' && detection.hasLunala) {
        fusionPartner = party[detection.lunalaIndex];
        fusionPartnerIndex = detection.lunalaIndex;
        newFormName = 'Necrozma-Dawn-Wings';
        newFormCnName = '拂晓之翼·奈克洛兹玛';
    } else if (fusionType === 'dusk' && detection.hasSolgaleo) {
        fusionPartner = party[detection.solgaleoIndex];
        fusionPartnerIndex = detection.solgaleoIndex;
        newFormName = 'Necrozma-Dusk-Mane';
        newFormCnName = '黄昏之鬃·奈克洛兹玛';
    } else {
        return { success: false, logs: ['无效的合体类型'], fusedPokemon: null };
    }
    
    const originalNecrozmaName = necrozma.cnName || necrozma.name;
    const originalPartnerName = fusionPartner.cnName || fusionPartner.name;
    
    // 变形 Necrozma
    necrozma.name = newFormName;
    necrozma.cnName = newFormCnName;
    
    if (typeof POKEDEX !== 'undefined') {
        const formId = newFormName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const formData = POKEDEX[formId];
        if (formData) {
            necrozma.types = formData.types || necrozma.types;
            if (formData.baseStats) necrozma.baseStats = { ...formData.baseStats };
        }
    }
    
    // 添加 Photon Geyser
    const hasPhotonGeyser = (necrozma.moves || []).some(m => {
        const moveName = (m.name || m || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return moveName === 'photongeyser';
    });
    
    if (!hasPhotonGeyser) {
        const photonGeyserData = (typeof MOVES !== 'undefined' && MOVES.photongeyser) 
            ? { ...MOVES.photongeyser, name: 'Photon Geyser' }
            : { name: 'Photon Geyser', type: 'Psychic', power: 100, cat: 'spec', accuracy: 100 };
        
        if (necrozma.moves && necrozma.moves.length >= 4) {
            necrozma.moves[3] = photonGeyserData;
        } else if (necrozma.moves) {
            necrozma.moves.push(photonGeyserData);
        }
        logs.push(`${newFormCnName} 习得了 光子喷涌！`);
    }
    
    // 重新计算种族值
    if (typeof necrozma.recalculateStats === 'function') necrozma.recalculateStats();
    
    // 标记
    necrozma.isFused = true;
    necrozma.fusionType = fusionType;
    necrozma.fusionPartnerIndex = fusionPartnerIndex;
    
    // 处理合体伙伴
    fusionPartner.fusedIntoNecrozma = true;
    fusionPartner.fusionNecrozmaIndex = detection.necrozmaIndex;
    
    const originalMaxHp = fusionPartner.maxHp;
    const originalCurrHp = fusionPartner.currHp;
    fusionPartner.maxHp = Math.floor(fusionPartner.maxHp / 2);
    fusionPartner.currHp = Math.min(fusionPartner.currHp, fusionPartner.maxHp);
    
    logs.push(`✦ ${originalNecrozmaName} 与 ${originalPartnerName} 合体！`);
    logs.push(`✦ ${originalNecrozmaName} 变为 ${newFormCnName}！`);
    logs.push(`✦ ${originalPartnerName} 的力量被分享，HP 减半 (${originalCurrHp}/${originalMaxHp} → ${fusionPartner.currHp}/${fusionPartner.maxHp})！`);
    
    return { success: true, logs, fusedPokemon: necrozma, fusionPartner };
}

/**
 * 检测是否可以 Ultra Burst
 */
function canUltraBurst(pokemon) {
    if (!pokemon) return false;
    const name = (pokemon.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const isEligible = name === 'necrozmaduskmane' || name === 'necrozmadawnwings';
    return isEligible && pokemon.mechanic === 'zmove' && !pokemon.isUltraBursted;
}

/**
 * 执行 Ultra Burst
 */
function executeUltraBurst(pokemon) {
    const logs = [];
    
    if (!canUltraBurst(pokemon)) {
        return { success: false, logs: ['无法执行 Ultra Burst'] };
    }
    
    const originalName = pokemon.cnName || pokemon.name;
    
    pokemon.name = 'Necrozma-Ultra';
    pokemon.cnName = '究极奈克洛兹玛';
    pokemon.isUltraBursted = true;
    delete pokemon._cachedBestZ;
    
    pokemon.types = ['Psychic', 'Dragon'];
    pokemon.ability = 'Neuroforce';
    pokemon.abilityName = '脑核之力';
    
    if (typeof POKEDEX !== 'undefined' && POKEDEX.necrozmaultra) {
        const ultraData = POKEDEX.necrozmaultra;
        if (ultraData.baseStats) pokemon.baseStats = { ...ultraData.baseStats };
    } else {
        pokemon.baseStats = { hp: 97, atk: 167, def: 97, spa: 167, spd: 97, spe: 129 };
    }
    
    if (typeof pokemon.recalculateStats === 'function') pokemon.recalculateStats();
    
    logs.push(`<b style="color:#fbbf24; text-shadow: 0 0 10px #fbbf24;">☀ ULTRA BURST ☀</b>`);
    logs.push(`<span style="color:#fbbf24">${originalName} 释放了光辉的力量！</span>`);
    logs.push(`<span style="color:#fbbf24">✦ ${originalName} 变为 究极奈克洛兹玛！</span>`);
    logs.push(`<span style="color:#fbbf24">✦ 特性变为 脑核之力 (Neuroforce)！</span>`);
    
    return { success: true, logs };
}

/**
 * 显示 Necrozma 合体选择对话框
 */
function showNecrozmaFusionDialog(necrozma, options, callback) {
    const { hasZMechanic, hasLunala, hasSolgaleo } = options;
    const { overlay, dialogShape, content } = createDialogContainer(true);

    // 顶部彩色装饰条
    const topBar = document.createElement('div');
    topBar.style.cssText = `
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 6px;
        background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #8b5cf6 100%);
        z-index: 2;
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
    `;
    dialogShape.appendChild(topBar);

    // 标题
    const title = document.createElement('h2');
    title.innerHTML = `NECROZMA FUSION`;
    title.style.cssText = `
        color: #fbbf24;
        font-size: 32px;
        font-weight: 900;
        font-style: italic;
        margin: 0;
        letter-spacing: -1px;
        text-shadow: 0 0 30px rgba(251, 191, 36, 0.5);
    `;

    const subTitle = document.createElement('div');
    subTitle.textContent = hasZMechanic ? `选择合体形态 (Z-MOVE 已启用)` : `选择合体形态`;
    subTitle.style.cssText = `
        color: #94a3b8;
        font-size: 14px;
        font-weight: 600;
        margin-top: 8px;
        margin-bottom: 35px;
        text-transform: uppercase;
        letter-spacing: 2px;
    `;

    // 主容器
    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `display: flex; flex-direction: column; gap: 16px; width: 100%;`;

    // 创建按钮的辅助函数
    const createOptionButton = (opt, isLarge) => {
        const btn = document.createElement('div');
        const padding = isLarge ? '24px 20px' : '16px 12px';
        const minHeight = isLarge ? '140px' : '80px';
        
        btn.style.cssText = `
            flex: 1;
            min-height: ${minHeight};
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(255,255,255,0.1);
            border-bottom: 4px solid ${opt.color}30;
            border-radius: 16px;
            padding: ${padding};
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        const labelSize = isLarge ? '48px' : '32px';
        const subLabelSize = isLarge ? '11px' : '9px';
        const descSize = isLarge ? '13px' : '10px';
        const noteSize = isLarge ? '10px' : '8px';
        
        btn.innerHTML = `
            <div style="font-size: ${subLabelSize}; font-weight: 800; color: ${opt.color}; opacity: 0.8; letter-spacing: 1.5px; margin-bottom: 4px;">${opt.subLabel}</div>
            <div style="font-size: ${labelSize}; font-weight: 900; color: #f1f5f9; line-height:1; font-style: italic; position: relative; z-index:2;">${opt.label}</div>
            <div style="font-size: ${descSize}; font-weight: 700; color: #64748b; margin-top: 6px; letter-spacing: 0.5px;">${opt.desc}</div>
            <div style="font-size: ${noteSize}; color: #475569; margin-top: 4px;">${opt.note}</div>
            <div class="fill-anim" style="
                position: absolute; bottom: 0; left: 0; right: 0; height: 0; 
                background: ${opt.color}; z-index: 1;
                transition: height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            "></div>
        `;

        btn.onmouseenter = () => {
            btn.style.transform = 'translateY(-4px)';
            btn.style.borderBottomColor = opt.color;
            btn.style.boxShadow = `0 12px 25px -5px ${opt.color}40, 0 0 30px ${opt.color}20`;
            btn.children[0].style.color = 'rgba(255,255,255,0.9)';
            btn.children[1].style.color = '#fff';
            btn.children[2].style.color = 'rgba(255,255,255,0.7)';
            btn.children[3].style.color = 'rgba(255,255,255,0.5)';
            btn.querySelector('.fill-anim').style.height = '100%';
        };
        
        btn.onmouseleave = () => {
            btn.style.transform = 'translateY(0)';
            btn.style.borderBottomColor = `${opt.color}30`;
            btn.style.boxShadow = 'none';
            btn.children[0].style.color = opt.color;
            btn.children[1].style.color = '#f1f5f9';
            btn.children[2].style.color = '#64748b';
            btn.children[3].style.color = '#475569';
            btn.querySelector('.fill-anim').style.height = '0';
        };

        btn.onclick = () => {
            overlay.style.transition = 'opacity 0.2s';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.parentNode && overlay.parentNode.removeChild(overlay), 200);
            callback(opt.id);
        };

        return btn;
    };

    // Ultra 选项行
    if (hasZMechanic) {
        const ultraRow = document.createElement('div');
        ultraRow.style.cssText = `display: flex; gap: 16px; width: 100%;`;

        if (hasSolgaleo) {
            ultraRow.appendChild(createOptionButton({ 
                id: 'ultra_dusk', label: '☀', subLabel: 'ULTRA BURST',
                desc: '究极奈克洛兹玛', note: 'Solgaleo → 黄昏之鬃 → Ultra', color: '#fbbf24'
            }, true));
        }
        if (hasLunala) {
            ultraRow.appendChild(createOptionButton({ 
                id: 'ultra_dawn', label: '☽', subLabel: 'ULTRA BURST',
                desc: '究极奈克洛兹玛', note: 'Lunala → 拂晓之翼 → Ultra', color: '#fbbf24'
            }, true));
        }
        if (ultraRow.children.length > 0) mainContainer.appendChild(ultraRow);
    }

    // 普通选项行
    const normalRow = document.createElement('div');
    normalRow.style.cssText = `display: flex; gap: 16px; width: 100%;`;

    if (hasSolgaleo) {
        normalRow.appendChild(createOptionButton({ 
            id: 'dusk', label: '日', subLabel: 'DUSK MANE',
            desc: '黄昏之鬃', note: '+ Solgaleo', color: '#f59e0b'
        }, false));
    }
    if (hasLunala) {
        normalRow.appendChild(createOptionButton({ 
            id: 'dawn', label: '月', subLabel: 'DAWN WINGS',
            desc: '拂晓之翼', note: '+ Lunala', color: '#8b5cf6'
        }, false));
    }
    if (normalRow.children.length > 0) mainContainer.appendChild(normalRow);

    // 取消按钮
    const cancelBtn = createCancelButton('不合体', true, () => {
        overlay.style.transition = 'opacity 0.2s';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.parentNode && overlay.parentNode.removeChild(overlay), 200);
        callback(null);
    });

    // 组装
    content.appendChild(title);
    content.appendChild(subTitle);
    content.appendChild(mainContainer);
    content.appendChild(cancelBtn);
    dialogShape.appendChild(content);
    overlay.appendChild(dialogShape);
    // 添加到 #ui-scale 内部，确保在 .screen-filters 的层叠上下文中
    const uiScale2 = document.getElementById('ui-scale') || document.body;
    uiScale2.appendChild(overlay);

    overlay.onclick = (e) => {
        if (e.target === overlay) cancelBtn.click();
    };
}

/**
 * 战斗开始时检测并处理 Necrozma 合体
 */
function checkAndProcessNecrozmaFusion(party, logFn, onComplete) {
    const log = logFn || console.log;
    const detection = detectNecrozmaFusion(party);
    
    if (!detection.canFuse) {
        if (onComplete) onComplete();
        return;
    }
    
    const necrozma = party[detection.necrozmaIndex];
    const hasZMechanic = necrozma.mechanic === 'zmove';
    
    const handleChoice = (choice) => {
        if (!choice) {
            log(`<span style="color:#94a3b8">奈克洛兹玛 选择不进行合体。</span>`);
            if (onComplete) onComplete();
            return;
        }
        
        let fusionType = choice;
        let shouldUltraBurst = false;
        
        if (choice.startsWith('ultra_')) {
            shouldUltraBurst = true;
            fusionType = choice.replace('ultra_', '');
        }
        
        const result = executeNecrozmaFusion(party, fusionType, detection);
        if (result.success) {
            result.logs.forEach(msg => log(msg));
            
            if (shouldUltraBurst && hasZMechanic) {
                const burstResult = executeUltraBurst(necrozma);
                if (burstResult.success) burstResult.logs.forEach(msg => log(msg));
                updateNecrozmaSprite(necrozma);
                if (onComplete) onComplete();
                return;
            }
            
            updateNecrozmaSprite(necrozma);
        }
        if (onComplete) onComplete();
    };
    
    const needsDialog = detection.hasBothOptions || hasZMechanic;
    
    if (needsDialog) {
        showNecrozmaFusionDialog(necrozma, {
            hasZMechanic,
            hasLunala: detection.hasLunala,
            hasSolgaleo: detection.hasSolgaleo
        }, handleChoice);
    } else {
        const fusionType = detection.hasLunala ? 'dawn' : 'dusk';
        const result = executeNecrozmaFusion(party, fusionType, detection);
        if (result.success) {
            result.logs.forEach(msg => log(msg));
            updateNecrozmaSprite(necrozma);
        }
        if (onComplete) onComplete();
    }
}

/**
 * 更新 Necrozma 的精灵图
 */
function updateNecrozmaSprite(pokemon) {
    if (!pokemon) return;
    if (typeof window !== 'undefined' && typeof window.updateAllVisuals === 'function') {
        window.updateAllVisuals('player');
    }
    if (typeof window !== 'undefined' && typeof window.smartLoadSprite === 'function') {
        const spriteUrl = pokemon.getSprite ? pokemon.getSprite(true) : null;
        if (spriteUrl) window.smartLoadSprite('player-sprite', spriteUrl, true);
    }
}

/**
 * AI 自动处理 Necrozma 合体（无对话框）
 * 用于敌方 AI 在战斗开始时自动合体
 * @param {Array} party - 队伍数组
 * @param {Function} logFn - 日志函数
 * @returns {Object} - { success, logs }
 */
function autoProcessNecrozmaFusion(party, logFn) {
    const log = logFn || console.log;
    const detection = detectNecrozmaFusion(party);
    
    if (!detection.canFuse) {
        return { success: false, logs: [] };
    }
    
    const necrozma = party[detection.necrozmaIndex];
    
    // 防止重复合体
    if (necrozma.isFused || necrozma.isUltraBursted) {
        console.log('[AI NECROZMA] 已经合体过，跳过');
        return { success: false, logs: [] };
    }
    
    const hasZMechanic = necrozma.mechanic === 'zmove';
    
    // AI 优先选择 Solgaleo（黄昏之鬃），因为物攻更高
    // 如果有 Z 招式机制，直接选择 Ultra Burst 路线
    let fusionType = detection.hasSolgaleo ? 'dusk' : 'dawn';
    
    const result = executeNecrozmaFusion(party, fusionType, detection);
    const allLogs = [];
    
    if (result.success) {
        result.logs.forEach(msg => {
            log(msg);
            allLogs.push(msg);
        });
        
        // 如果有 Z 招式机制，自动触发 Ultra Burst
        if (hasZMechanic) {
            const burstResult = executeUltraBurst(necrozma);
            if (burstResult.success) {
                burstResult.logs.forEach(msg => {
                    log(msg);
                    allLogs.push(msg);
                });
            }
        }
        
        console.log(`[AI NECROZMA] 敌方 AI 自动合体完成: ${necrozma.name} (Ultra: ${necrozma.isUltraBursted || false})`);
    }
    
    return { success: result.success, logs: allLogs, fusedPokemon: necrozma };
}

// ============================================
// 导出
// ============================================

if (typeof window !== 'undefined') {
    // 通用形态变化
    window.performFormChange = performFormChange;
    window.checkInitTransform = checkInitTransform;
    window.checkBattleBondTransform = checkBattleBondTransform;
    window.checkHPThresholdTransform = checkHPThresholdTransform;
    
    // Mega 选择
    window.showMegaFormSelectionDialog = showMegaFormSelectionDialog;
    
    // Necrozma 合体
    window.detectNecrozmaFusion = detectNecrozmaFusion;
    window.executeNecrozmaFusion = executeNecrozmaFusion;
    window.canUltraBurst = canUltraBurst;
    window.executeUltraBurst = executeUltraBurst;
    window.showNecrozmaFusionDialog = showNecrozmaFusionDialog;
    window.checkAndProcessNecrozmaFusion = checkAndProcessNecrozmaFusion;
    window.autoProcessNecrozmaFusion = autoProcessNecrozmaFusion;
    window.updateNecrozmaSprite = updateNecrozmaSprite;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        performFormChange,
        checkInitTransform,
        checkBattleBondTransform,
        checkHPThresholdTransform,
        showMegaFormSelectionDialog,
        detectNecrozmaFusion,
        executeNecrozmaFusion,
        canUltraBurst,
        executeUltraBurst,
        showNecrozmaFusionDialog,
        checkAndProcessNecrozmaFusion,
        autoProcessNecrozmaFusion,
        updateNecrozmaSprite
    };
}

console.log('[FORM CHANGE] 统一形态变化系统已加载');

})();
