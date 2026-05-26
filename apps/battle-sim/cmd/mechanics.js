/**
 * ===========================================
 * COMMANDER SYSTEM V2 - 轮播悬浮窗 + 四象限菜单
 * ===========================================
 * 
 * 职责:
 * - 智能轮播气泡 (Smart Bubble)
 * - 四象限轮盘菜单 (Commander Wheel)
 * - 与主战斗系统集成
 */

const QUADRANTS = ['top', 'right', 'bottom', 'left'];

// 战斗状态代理：从全局 battle 对象读取真实状态
// 【嫁接】逻辑参考 ui-menus.js 中的 toggleMega 和 updateMegaButtonVisibility
const battleState = {
    get gimmickType() {
        // 从当前宝可梦检查可用的 gimmick 类型
        // 逻辑与 ui-menus.js 中的 updateMegaButtonVisibility 保持一致
        if (typeof window.battle === 'undefined') return 'none';
        const b = window.battle;
        const p = b.getPlayer?.();
        const unlocks = b.playerUnlocks || {};
        
        if (!p) return 'none';
        
        // 【二层锁机制】检查当前宝可梦的 mechanic 字段
        const lockedMechanic = p.mechanic;
        
        // 太晶化 (tera)
        if (lockedMechanic === 'tera' && unlocks.enable_tera === true && p.canTera) {
            return 'tera';
        }
        
        // 极巨化 (dynamax)
        if (lockedMechanic === 'dynamax' && unlocks.enable_dynamax === true) {
            if (p.canDynamax || (p.megaTargetId && p.megaTargetId.toLowerCase().includes('gmax'))) {
                return 'dyna';
            }
        }
        
        // Z招式 (zmove)
        if (lockedMechanic === 'zmove' && unlocks.enable_z_move === true) {
            return 'zmove';
        }
        
        // Mega进化 (mega)
        if (lockedMechanic === 'mega' && unlocks.enable_mega === true) {
            const canMegaEvolveFunc = window.canMegaEvolve;
            if (typeof canMegaEvolveFunc === 'function' && canMegaEvolveFunc(p)) {
                return 'mega';
            }
        }
        
        // 当前宝可梦没有任何机制
        return 'none';
    },
    get canGimmick() {
        if (typeof window.battle === 'undefined') return false;
        const b = window.battle;
        const p = b.getPlayer?.();
        
        if (!p) return false;
        
        const gType = this.gimmickType;
        if (gType === 'none') return false;
        
        // 检查是否已经使用过或已经变身
        if (gType === 'mega') {
            return !b.playerMegaUsed && !p.isMega;
        }
        if (gType === 'dyna') {
            return !b.playerMaxUsed && !p.isDynamaxed;
        }
        if (gType === 'tera') {
            return !b.playerTeraUsed && !p.isTerastallized;
        }
        if (gType === 'zmove') {
            return !b.playerZUsed;
        }
        
        return false;
    },
    get canEvo() {
        if (typeof window.battle === 'undefined') return false;
        const p = window.battle.getPlayer?.();
        if (!p) return false;
        // 使用 EvolutionSystem.checkEligibility 检查是否可以进化
        if (typeof window.EvolutionSystem?.checkEligibility === 'function') {
            const evoInfo = window.EvolutionSystem.checkEligibility(p);
            return evoInfo !== null;
        }
        return false;
    },
    get evoType() {
        // 返回进化类型: 'bio' | 'bond' | 'none'
        if (typeof window.battle === 'undefined') return 'none';
        const p = window.battle.getPlayer?.();
        if (!p) return 'none';
        // 使用 EvolutionSystem.checkEligibility 获取进化类型
        if (typeof window.EvolutionSystem?.checkEligibility === 'function') {
            const evoInfo = window.EvolutionSystem.checkEligibility(p);
            if (evoInfo) return evoInfo.type; // 'bio' 或 'bond'
        }
        return 'none';
    },
    get canStyle() {
        if (typeof window.battle === 'undefined') return false;
        const unlocks = window.battle.playerUnlocks || {};
        // 【解锁检查】enable_styles 必须为 true
        if (!unlocks.enable_styles) return false;
        // 【冷却检查】冷却中不可用，不显示在轮播中
        if (window.battle.playerStyleCooldown > 0) return false;
        return true;
    },
    get styleCooldown() {
        // 返回当前冷却回合数
        if (typeof window.battle === 'undefined') return 0;
        return window.battle.playerStyleCooldown || 0;
    },
    get canCommand() {
        if (typeof window.battle === 'undefined') return false;
        // 【设置检查】enableAVS 或 enableCommander 任意一个关闭则不可用
        if (window.GAME_SETTINGS) {
            if (window.GAME_SETTINGS.enableAVS === false) return false;
            if (window.GAME_SETTINGS.enableCommander === false) return false;
        }
        const p = window.battle.getPlayer?.();
        if (!p) return false;
        // 检查当前宝可梦是否是王牌（isAce）
        const isAce = p.isAce === true || p.data?.isAce === true;
        if (!isAce) return false;
        // 【同步率检查】同步率 < 60 时完全不可用
        if (typeof window.getCommanderSyncScore === 'function') {
            const proficiency = window.battle.trainerProficiency ?? 0;
            const syncScore = window.getCommanderSyncScore(proficiency, p);
            if (syncScore < 60) return false;
        }
        // 【冷却检查】冷却中不可用，不显示在轮播中
        if (window.battle.commandCooldown > 0) return false;
        return true;
    },
    get commandCooldown() {
        // 返回当前指令冷却回合数
        if (typeof window.battle === 'undefined') return 0;
        return window.battle.commandCooldown || 0;
    },
};

// Icon assets isolation
const ICON_SVGS = {
    MEGA: `
<svg viewBox="0 0 14 17.5" xmlns="http://www.w3.org/2000/svg">
  <g>
    <path d="M3.88792,10.9 C5.96264,10.9,8.03736,10.9,10.1121,10.9 C11.0183,10.9426,11.0183,9.45744,10.1121,9.5 C8.03736,9.5,5.96264,9.5,3.88792,9.5 C2.98166,9.45744,2.98166,10.9426,3.88792,10.9 z"/>
    <path d="M2.75289,2 C2.75289,2.10488,2.75289,2.20976,2.75289,2.31464 C2.75355,4.80881,4.40963,6.99632,6.81004,7.67374 C8.60567,8.17928,9.84777,9.81993,9.84711,11.6854 C9.84711,11.7903,9.84711,11.8951,9.84711,12 C9.80455,12.9063,11.2897,12.9063,11.2471,12 C11.2471,11.8951,11.2471,11.7903,11.2471,11.6854 C11.2464,9.19119,9.59033,7.00368,7.18992,6.32626 C5.39429,5.82072,4.15223,4.18007,4.15289,2.31464 C4.15289,2.20976,4.15289,2.10488,4.15289,2 C4.19545,1.09374,2.71033,1.09374,2.75289,2 z"/>
    <g>
       <path d="M6.99988,6.26793 C6.93733,6.28879,6.87403,6.30825,6.81004,6.32626 C4.40962,7.00368,2.75355,9.1912,2.75289,11.6854 C2.75289,11.6854,2.75289,12,2.75289,12 C2.71033,12.9063,4.19545,12.9063,4.15289,12 C4.15289,12,4.15289,11.6854,4.15289,11.6854 C4.15223,9.81992,5.3943,8.17928,7.18992,7.67374 C7.73053,7.52117,8.23338,7.29202,8.68807,7.00001 C8.23346,6.70808,7.73068,6.47894,7.19012,6.32632 C7.12599,6.30829,7.06257,6.28881,6.99988,6.26793 z"/>
       <path d="M8.21185,5.62527 C9.21994,4.85339,9.84758,3.64081,9.84711,2.31464 C9.84711,2.31464,9.84711,2,9.84711,2 C9.80455,1.09375,11.2897,1.09374,11.2471,2 C11.2471,2,11.2471,2.31464,11.2471,2.31464 C11.2467,3.88075,10.5936,5.32595,9.51336,6.35232 C9.1132,6.06454,8.67745,5.81966,8.21185,5.62527 z"/>
    </g>
    <path d="M6.02737,4.5 C6.02737,4.5,10.1121,4.5,10.1121,4.5 C11.0183,4.54256,11.0183,3.05744,10.1121,3.1 C10.1121,3.1,5.2513,3.1,5.2513,3.1 C5.38672,3.62909,5.65656,4.11049,6.02737,4.5 z"/>
  </g>
</svg>
`,
    ZMOVE: `
<svg class="z-svg" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <linearGradient id="z-prism-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff0000" />
      <stop offset="16%" stop-color="#ff9900" />
      <stop offset="33%" stop-color="#cccc00" />
      <stop offset="50%" stop-color="#33cc33" />
      <stop offset="66%" stop-color="#3399ff" />
      <stop offset="83%" stop-color="#6633cc" />
      <stop offset="100%" stop-color="#ff0044" />
    </linearGradient>
    <filter id="z-glitch">
      <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="1" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
    </filter>
  </defs>
  <g class="z-shape-group">
    <polygon points="52.4375,28 33.5764,28 44.5625,0 11.5625,36 30.4236,36 19.4375,64"
      fill="url(#z-prism-gradient)" stroke="none" />
    <polygon points="52.4375,28 33.5764,28 44.5625,0 11.5625,36 30.4236,36 19.4375,64"
      fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" class="z-stroke" />
  </g>
</svg>
`,
    DYNA: `
<svg class="dyna-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <filter id="dyna-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <g class="dyna-clouds">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="10 5" opacity="0.3" class="dyna-ring-1" />
    <path d="M50 0 C22 0 0 22 0 50 C0 78 22 100 50 100 C78 100 100 78 100 50" fill="none" stroke="currentColor" stroke-width="8" opacity="0.1" transform="rotate(20 50 50)" />
  </g>
  <g class="dyna-cross-group" filter="url(#dyna-glow)">
    <path class="dyna-cross-path" d="M30 30 L70 70 L85 70 L45 30 Z" />
    <path class="dyna-cross-path" d="M70 30 L30 70 L15 70 L55 30 Z" />
  </g>
</svg>
`,
    TERA: `
<svg class="tera-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <linearGradient id="tera-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#a5f3fc" stop-opacity="0.6" />
    </linearGradient>
  </defs>

  <g class="tera-bg-ring" opacity="0.3" fill="none" stroke="currentColor">
    <path d="M50 5 L88 27 v45 L50 95 L12 72 v-45 Z" stroke-width="1" stroke-dasharray="4 4" />
    <path d="M50 15 L80 32 v35 L50 85 L20 67 v-35 Z" stroke-width="2" />
  </g>

  <g class="tera-gem-group">
    <path d="M50 10 L85 30 V70 L50 90 L15 70 V30 Z" fill="rgba(8, 145, 178, 0.2)" stroke="currentColor" stroke-width="3" stroke-linejoin="round" />
    <path d="M50 50 L15 30 L50 10 L85 30 Z" fill="url(#tera-sheen)" opacity="0.8" />
    <path d="M15 30 L15 70 L50 90 L50 50 Z" fill="black" opacity="0.2" />
    <path d="M85 30 L85 70 L50 90 L50 50 Z" fill="currentColor" opacity="0.1" />
    <path d="M50 35 L62 42 V58 L50 65 L38 58 V42 Z" fill="#fff" class="tera-core-pulse" />
  </g>

  <g fill="#fff">
    <circle cx="85" cy="15" r="3" class="tera-sparkle s1" />
    <circle cx="15" cy="85" r="2" class="tera-sparkle s2" />
    <path d="M20 20 L22 15 L24 20 L29 22 L24 24 L22 29 L20 24 L15 22 Z" class="tera-sparkle s3" transform="scale(0.8)" />
  </g>
</svg>
`,
    STYLE_TAIJI: `
<svg viewBox="0 0 75 93.75" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path transform="translate(0, 10) scale(0.9)" d="m50 5.8594c-11.79 0-22.876 4.5903-31.213 12.928-8.3374 8.3366-12.928 19.422-12.928 31.213s4.5903 22.874 12.928 31.211c2.8053 2.8061 5.9253 5.1857 9.2754 7.1113-2.8564-4.2252-4.5273-9.3145-4.5273-14.787 0-14.593 11.872-26.465 26.465-26.465 11.362 0 20.605-9.2438 20.605-20.605s-9.2438-20.605-20.605-20.605zm21.939 5.8184c2.8572 4.2252 4.5254 9.3146 4.5254 14.787 0 14.593-11.872 26.465-26.465 26.465-11.362 0-20.605 9.2438-20.605 20.605s9.2438 20.605 20.605 20.605c11.79 0 22.876-4.5923 31.213-12.93 8.3374-8.3367 12.928-19.42 12.928-31.211s-4.5903-22.876-12.928-31.213c-2.8053-2.8061-5.9234-5.1837-9.2734-7.1094zm-21.939 3.0625c6.4652 0 11.725 5.2602 11.725 11.725 0 6.4644-5.2595 11.723-11.725 11.723-6.4652 0-11.725-5.2575-11.725-11.723-2e-6 -6.4651 5.2595-11.725 11.725-11.725zm0 5.8594c-3.2341 0-5.8652 2.6311-5.8652 5.8652-2e-6 3.2341 2.6311 5.8633 5.8652 5.8633 3.2341 0 5.8652-2.6292 5.8652-5.8633 0-3.2341-2.6311-5.8652-5.8652-5.8652zm0 41.211c6.4652 0 11.725 5.2594 11.725 11.725s-5.2595 11.723-11.725 11.723c-6.4652 0-11.725-5.2575-11.725-11.723-2e-6 -6.4652 5.2595-11.725 11.725-11.725zm0 5.8594c-3.2341 0-5.8652 2.6311-5.8652 5.8652s2.6311 5.8633 5.8652 5.8633c3.2341-1e-6 5.8652-2.6292 5.8652-5.8633s-2.6311-5.8652-5.8652-5.8652z" stroke-width="0.2"/>
</svg>
`,
    BIO: `
    <svg class="bio-svg" version="1.1" viewBox="-5 -10 110 130" xmlns="http://www.w3.org/2000/svg">
       <g fill="currentColor">
         <path d="m70.656 40.012c-2.5195-0.078125-4.2305-0.28906-4.6172-0.32812-0.42187-0.058594-1.3828-0.15234-2.75-0.21094 0.042969 3.2031-0.097656 6.2578-0.64062 9.0859l-11.078-11.078c2.9961-0.64062 6.1016-0.90625 8.793-0.92969 5.7266-0.16406 21.125 3.1758 32.98-4.1328 2.0977-1.2695 2.4805-4.1328 0.75-5.8672v-0.019531c-1.2109-1.1914-3.0977-1.4609-4.5586-0.55859-0.92969 0.58594-1.9492 1.0781-3.0234 1.5l-14.027-14.027c0.42578-1.0312 0.91016-2.0352 1.5156-2.9922 0.94141-1.4609 0.65234-3.3477-0.55859-4.5586-1.7305-1.7305-4.5781-1.3477-5.8672 0.73047-3.7305 6.0586-4.5586 12.828-4.6133 19.559 1.6133 0.058594 3.1914 0.17188 4.75 0.34766 0.42187 0.058594 1.3477 0.15234 2.6328 0.21094 0.023438-3.582 0.28516-7.0391 1.1172-10.242l11.965 11.965c-6.082 1.5586-12.961 1.3242-16.059 0.92969-9.9023-1.1914-23.652 0.28906-30.672 7.3086-6.25 6.25-7.5586 16.559-7.6328 23.48 1.5586 0 3.1172 0.058594 4.6523 0.11719 0.94141 0.039063 1.8828 0.078125 2.8281 0.097657 0.035156-2.707 0.30078-5.8125 0.94141-8.8125l11.094 11.098c-12.418 2.4258-28.906-3.1055-41.941 4.8906-2.0781 1.2891-2.4609 4.1328-0.73047 5.8828 1.1914 1.1914 3.0977 1.4805 4.5391 0.55859 0.99219-0.625 2.043-1.125 3.125-1.5586 0.070313 0.19922 0.17188 0.38672 0.54688 0.54688l13.559 13.562c-0.42188 1.0586-0.89453 2.0742-1.4766 2.9883-0.36719 0.57812-0.55859 1.25-0.55859 1.9023 0 0.96094 0.38281 1.9219 1.1172 2.6523 1.7305 1.7305 4.5977 1.3281 5.8828-0.75 3.7695-6.1172 4.6523-14.059 4.7109-19.73-1.3086-0.019531-2.6328-0.078125-3.9414-0.11719-1.1719-0.039063-2.3672-0.078125-3.5195-0.11719-0.023437 3.0898-0.33984 6.7109-1.2109 10.094l-11.977-11.977c14.375-3.6055 34.195 4.3906 46.801-8.2109 6.4453-6.4414 7.4453-14.77 7.3711-23.289zm-8.8477 11.789c-0.64844 1.8555-1.5977 3.5586-2.875 5.1016l-15.82-15.82c1.4922-1.168 3.2773-2.0742 5.2422-2.7383zm-23.469-3.4336c0.66016-1.9609 1.5664-3.7461 2.7344-5.2461l15.82 15.82c-1.543 1.2773-3.2383 2.2344-5.0898 2.8906z"/>
         <circle cx="88" cy="51" r="5" class="bio-bubble b1"/>
         <circle cx="51" cy="9" r="4" class="bio-bubble b2"/>
         <circle cx="49" cy="88" r="4" class="bio-bubble b3"/>
         <circle cx="28" cy="30" r="3" class="bio-bubble b4"/>
       </g>
    </svg>` ,

    BOND: `
    <svg class="bond-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
          <radialGradient id="heart-glow">
            <stop offset="20%" stop-color="#fff"/>
            <stop offset="95%" stop-color="transparent"/>
          </radialGradient>
      </defs>
      <g>
         <path class="bond-heart" 
               d="M50 90 L15 55 A15 15 0 0 1 50 25 A15 15 0 0 1 85 55 Z" 
               fill="#F472B6" opacity="0.4" transform="scale(1.2)" transform-origin="center" />
         <path class="bond-heart-core"
               d="M50 85 L18 50 A18 18 0 0 1 50 18 A18 18 0 0 1 82 50 Z" 
               fill="currentColor"/>
         <path class="bond-pulse-line" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" 
               d="M10 50h20l5 -15l10 30l10 -20l5 5h20" 
               opacity="0" pointer-events="none" />
         <path class="bond-mini-heart h1" d="M10 10l-2 2a2 2 0 0 1 5 0a2 2 0 0 1 2 2z" fill="#fff" />
         <path class="bond-mini-heart h2" d="M50 10l-2 2a2 2 0 0 1 5 0a2 2 0 0 1 2 2z" fill="#fff" />    
      </g>
    </svg>`

    ,

    TACTIC: `
    <svg class="tactic-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" overflow="visible">
       <g fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="50" cy="50" r="42" stroke-dasharray="2 6" opacity="0.6" class="hud-ring-outer" />
          <path d="M50 15 A35 35 0 0 1 85 50" class="hud-arc" stroke-width="2" />
          <path d="M50 85 A35 35 0 0 1 15 50" class="hud-arc" stroke-width="2" />
          <line x1="50" y1="10" x2="50" y2="35" class="hud-line op" />
          <line x1="50" y1="65" x2="50" y2="90" class="hud-line op" />
          <line x1="10" y1="50" x2="35" y2="50" class="hud-line op" />
          <line x1="65" y1="50" x2="90" y2="50" class="hud-line op" />
          <circle cx="50" cy="50" r="4" fill="currentColor" stroke="none" class="hud-core">
             <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="15" stroke-width="1" opacity="0.8" />
       </g>
       <g fill="currentColor" stroke="none" class="hud-chevrons">
          <path d="M48 5 L50 2 L52 5 L50 8 Z" />
          <path d="M48 95 L50 92 L52 95 L50 98 Z" />
          <path d="M95 48 L98 50 L95 52 L92 50 Z" />
          <path d="M5 48 L8 50 L5 52 L2 50 Z" />
       </g>
    </svg>`
};

Object.assign(ICON_SVGS, {
    DODGE: `
    <svg class="cmd-svg" viewBox="0 0 244 274" xmlns="http://www.w3.org/2000/svg">
        <g fill="currentColor">
            <path d="M232 39c0 77-129 3-170 114 16-129 163-72 170-114z"/>
            <path d="M244 0c1 80-133 4-176 117-10 34-31 108-68 101 66-19 11-196 161-200-25 5-43 16-56 29 51-38 134-15 139-47z"/>
            <path d="M211 81c-10 80-115 0-151 95 18-110 137-53 151-95z"/>
        </g>
    </svg>`,

    FOCUS: `
    <svg class="cmd-svg" viewBox="0 0 48 60" xmlns="http://www.w3.org/2000/svg">
        <g fill="currentColor">
            <path d="M39 13l-1.6 1.6c2.3 3.1 3.6 6.9 3.6 11 0 10.3-8.3 18.6-18.6 18.6S3.7 35.9 3.7 25.6C3.7 15.4 12.1 7 22.3 7c4.1 0 8 1.4 11.1 3.7l1.6-1.6.1-1.7c-3.6-2.5-8-4-12.8-4C10 3.3 0 13.3 0 25.6S10 48 22.3 48c12.3 0 22.3-10 22.3-22.3 0-4.7-1.5-9.1-4-12.7L39 13z"/>
            <path d="M30.4 13.7c-2.3-1.6-5.1-2.5-8.1-2.5-8 0-14.4 6.5-14.4 14.4 0 8 6.5 14.4 14.4 14.4 8 0 14.4-6.5 14.4-14.4 0-2.9-.9-5.7-2.4-8l-2.7 2.7c.9 1.6 1.4 3.3 1.4 5.3 0 5.9-4.8 10.7-10.7 10.7-5.9 0-10.7-4.8-10.7-10.7 0-5.9 4.8-10.7 10.7-10.7 2 0 3.8.5 5.4 1.5l2.7-2.7z"/>
            <path d="M23.8 20.3c-.5-.1-1-.2-1.5-.2-3.1 0-5.6 2.5-5.6 5.6 0 3.1 2.5 5.6 5.6 5.6 3.1 0 5.6-2.5 5.6-5.6 0-.5-.1-.9-.2-1.4l-3.3 3.3c-.5.5-1.2.8-2 .8-.8 0-1.5-.3-2-.8-1.1-1.1-1.1-2.9 0-3.9l3.4-3.4z"/>
            <path d="M47 5.7l-3.5.2 1.4-1.4c.4-.4.4-1 0-1.3-.4-.4-1-.4-1.3 0l-1.4 1.4L42.4 1c0-.5-.4-1-1-.9-.5 0-1 .4-1 .9l-.3 5.6-1.4 1.4-.3-2.5c0-.5-.4-1-.9-1-.5 0-1 .4-1 .9l-.3 5.6L21.8 25c-.4.4-.4 1 0 1.3.2.2.7.5 1.3 0l15.1-15.1 5.6-.3c.5 0 .9-.5.9-1 0-.5-.5-.9-1-.9l-3.5.2 1.4-1.4 5.6-.3c.5 0 .9-.5.9-1 .1-.6-.4-1-1-.9z"/>
        </g>
    </svg>`,

    ENDURE: `
    <svg class="cmd-svg" viewBox="0 0 100 125" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, -952.36218)" fill="currentColor">
            <path d="m51.1339 955.36611a2.9995345 3.0001855 0 0 1 1.43713.4375c4.4064 2.6807 9.61209 6.1381 14.83996 8.3747 5.22788 2.2365 10.22474 3.1499 14.4963 1.4686a2.9995345 3.0001855 0 0 1 12.09271 2.7812c0 31.60899-7.04861 50.60179-16.68324 62.30999-9.63463 11.7083-21.67399 15.8706-30.42974 18.4993a2.9995345 3.0001855 0 0 1-2.87426-.6562c-7.30294-6.5034-14.4164-11.4997-18.4328-22.2491-4.01639-10.7495-4.88977-26.60879-1.40589-55.37279a2.9995345 3.0001855 0 0 1 3.74904-2.5312c4.32204 1.1795 9.44291-.3576 14.68376-3.1562 5.24084-2.7983 10.3515-6.7103 14.80872-9.4683a2.9995345 3.0001855 0 0 1 1.71831-.4375zm-.0625 6.5622c-3.82197 2.4944-8.4668 5.8556-13.65276 8.6247-4.80862 2.5676-10.15153 4.4718-15.58977 4.0936-2.96179 26.25779-1.91794 40.77949 1.37465 49.59179 3.20751 8.5845 8.64616 12.702 15.52728 18.718 8.24206-2.5511 17.93077-6.2707 25.96213-16.0306 8.15816-9.9141 14.6568-26.4095 15.21486-54.68539-5.07588.7184-10.17975-.5375-14.83996-2.5311-5.26895-2.2541-10.01929-5.3101-13.99643-7.781zm-1.43713 12.9682 5.62357 15.4995 15.74598 3.8124-12.71551 10.24949 1.31217 16.4368-13.49656-9.1247-14.93369 6.3124 4.37389-15.8743-10.52857-12.56209 16.18337-.6562 8.43535-14.0933z"/>
        </g>
    </svg>`,

    LISTEN: `
    <svg class="cmd-svg" viewBox="0 0 100 125" xmlns="http://www.w3.org/2000/svg">
        <g fill="currentColor">
            <path d="M87.395 12.618c9.161 9.177 9.183 24.065-.012 33.252L70.758 62.493c-1.427 1.427-3.004 2.609-4.666 3.593-5.491 3.258-12.014 4.088-18.035 2.482-3.864-1.028-7.523-3.036-10.549-6.067-2.061-2.056-3.604-4.415-4.742-6.913l7.276-7.274c.681-.675 1.518-1.168 2.426-1.565.184 2.709 1.276 5.361 3.354 7.434 3.083 3.083 7.427 4.046 11.344 2.99 1.933-.516 3.766-1.484 5.277-2.997l6.129-6.122 10.493-10.499c4.587-4.594 4.591-12.013.004-16.62-4.598-4.58-12.038-4.595-16.626 0l-7.717 7.719c-.622-.213-1.232-.457-1.868-.629-4.692-1.253-9.637-1.167-14.262.122l15.531-15.528c9.192-9.199 24.075-9.187 33.275.99zM61.339 71.878c-5.271 1.459-10.889 1.277-16.078-.511l-7.699 7.703c-4.596 4.578-12.035 4.578-16.629-.006-4.587-4.601-4.58-12.024-.005-16.627l16.634-16.626c1.516-1.506 3.34-2.469 5.266-2.984 3.919-1.05 8.261-.087 11.355 2.991 2.079 2.093 3.171 4.761 3.348 7.485.87-.395 1.695-.924 2.41-1.637l7.283-7.278c-1.13-2.493-2.671-4.843-4.718-6.895-3.037-3.026-6.692-5.036-10.552-6.065-6.029-1.607-12.546-.775-18.044 2.48-1.659.979-3.235 2.159-4.666 3.585l-16.63 16.628c-9.182 9.189-9.188 24.08-.004 33.262 9.187 9.185 24.07 9.185 33.263 0l16.215-16.212z"/>
        </g>
    </svg>`
});

function getBottomSlotConfig() {
    const evoType = battleState.evoType || 'bond';

    if (evoType === 'bio') {
        return {
            label: 'EVO',
            sub: 'BIO-FORCE',
            theme: 'theme-evo-bio',
            icon: ICON_SVGS.BIO,
            action: () => activateEvolution('Bio Evolution'),
            check: () => battleState.canEvo,
        };
    }

    if (evoType === 'bond') {
        return {
            label: 'LINK',
            sub: 'SYNCHRONIZE',
            theme: 'theme-evo-bond',
            icon: ICON_SVGS.BOND,
            action: () => activateEvolution('Bond Evolution'),
            check: () => battleState.canEvo,
        };
    }

    return {
        label: '---',
        sub: '',
        icon: null,
        theme: '',
        action: () => {},
        check: () => false,
    };
}

function getTopSlotConfig() {
    if (battleState.gimmickType === 'none' || !battleState.gimmickType) {
        return {
            label: '---',
            sub: '无可选用机制',
            theme: '',
            icon: null,
            action: () => {},
            check: () => false,
        };
    }

    if (battleState.gimmickType === 'mega') {
        return {
            label: 'MEGA',
            sub: 'BEYOND LIMIT',
            theme: 'theme-mega',
            icon: ICON_SVGS.MEGA,
            action: () => activateGimmick('Mega Evolution'),
            check: () => battleState.canGimmick,
        };
    }

    if (battleState.gimmickType === 'zmove') {
        return {
            label: 'Z-PWR',
            sub: 'FULL FORCE',
            theme: 'theme-zmove',
            icon: ICON_SVGS.ZMOVE,
            action: () => activateGimmick('Z-Power'),
            check: () => battleState.canGimmick,
        };
    }

    if (battleState.gimmickType === 'dyna') {
        return {
            label: 'Dynamax',
            sub: 'CLASHING SCALE',
            theme: 'theme-dyna',
            icon: ICON_SVGS.DYNA,
            action: () => activateGimmick('Dynamax'),
            check: () => battleState.canGimmick,
        };
    }

    if (battleState.gimmickType === 'tera') {
        return {
            label: 'TERA',
            sub: 'PHENOMENON',
            theme: 'theme-tera',
            icon: ICON_SVGS.TERA,
            action: () => activateGimmick('Terastallize'),
            check: () => battleState.canGimmick,
        };
    }

    return {
        label: '---',
        sub: '无可选用机制',
        theme: '',
        icon: null,
        action: () => {},
        check: () => false,
    };
}

let overlayEl;
let cancelTextEl;
let cancelKeyEl;
let menuLevel = 'hidden';

const MENU_LAYERS = {
    root: {
        top: 'dynamic-top',
        right: {
            label: 'TACTIC',
            get sub() {
                // 【解锁检查】enableAVS 或 enableCommander 关闭时显示"不可用"
                if (window.GAME_SETTINGS) {
                    if (window.GAME_SETTINGS.enableAVS === false) return '不可用';
                    if (window.GAME_SETTINGS.enableCommander === false) return '不可用';
                }
                // 【Ace检查】非王牌宝可梦不可用
                const p = window.battle?.getPlayer?.();
                const isAce = p?.isAce === true || p?.data?.isAce === true;
                if (!isAce) return '不可用';
                // 【同步率检查】同步率 < 60 时显示"默契不足"
                if (typeof window.getCommanderSyncScore === 'function') {
                    const proficiency = window.battle?.trainerProficiency ?? 0;
                    const syncScore = window.getCommanderSyncScore(proficiency, p);
                    if (syncScore < 60) return '默契不足';
                }
                // 冷却中显示冷却时间
                const cd = battleState.commandCooldown;
                if (cd > 0) return `冷却中: ${cd}回合`;
                return 'COMMAND PANEL';
            },
            theme: 'theme-tactics-entry',
            icon: ICON_SVGS.TACTIC,
            action: () => setMenuLevel('tactics'),
            check: () => battleState.canCommand,
        },
        bottom: {
            label: 'EVO',
            sub: '突破极限',
            theme: 'theme-evo-bond',
            action: () => activateEvolution(),
            check: () => battleState.canEvo,
        },
        left: {
            label: 'STYLE',
            get sub() {
                // 【解锁检查】enable_styles 关闭时显示"不可用"
                const unlocks = window.battle?.playerUnlocks || {};
                if (!unlocks.enable_styles) return '不可用';
                // 冷却中显示冷却时间
                const cd = battleState.styleCooldown;
                if (cd > 0) return `休憩中: ${cd}回合`;
                return 'Ancient Arts';
            },
            theme: 'theme-style-entry',
            icon: ICON_SVGS.STYLE_TAIJI,
            action: () => setMenuLevel('style'),
            check: () => battleState.canStyle,
        },
    },
    tactics: {
        top: {
            class: 'fix-scale',
            label: 'DODGE!',
            sub: '回避行动',
            theme: 'theme-insight',
            icon: ICON_SVGS.DODGE,
            action: () => sendCommand('dodge'),
        },
        right: {
            class: 'fix-scale',
            label: 'FOCUS!',
            sub: '必杀一击',
            theme: 'theme-passion',
            icon: ICON_SVGS.FOCUS,
            action: () => sendCommand('crit'),
        },
        bottom: {
            class: 'fix-scale',
            label: 'ENDURE!',
            sub: '绝境坚守',
            theme: 'theme-devotion',
            icon: ICON_SVGS.ENDURE,
            action: () => sendCommand('endure'),
        },
        left: {
            class: 'fix-scale',
            label: 'LISTEN!',
            sub: '清醒意志',
            theme: 'theme-trust',
            icon: ICON_SVGS.LISTEN,
            action: () => sendCommand('cure'),
        },
    },
    style: {
        top: { label: '<span class="c1">迅</span><span class="c2">疾</span>', sub: '', theme: 'theme-style-pure-agile', icon: null, action: () => selectStyle('agile') },
        bottom: { label: '<span class="c1">刚</span><span class="c2">猛</span>', sub: '', theme: 'theme-style-pure-strong', icon: null, action: () => selectStyle('strong') },
        left: { label: '<span class="c1">凝</span><span class="c2">神</span>', sub: '', theme: 'theme-style-pure-focus', icon: null, action: () => selectStyle('focus') },
        right: { label: '<span class="c1">休</span><span class="c2">憩</span>', sub: '', theme: 'theme-style-pure-back', icon: null, action: () => {} },
    },
};

function setMenuLevel(level) {
    if (level === 'hidden') {
        overlayEl.classList.add('hidden');
        menuLevel = 'hidden';
        updateCancelHint();
        return;
    }

    if (menuLevel === 'hidden') {
        overlayEl.classList.remove('hidden');
    }

    menuLevel = level;
    renderWheel(level);
    updateCancelHint();
}

function updateCancelHint() {
    if (!cancelTextEl || !cancelKeyEl) return;
    if (menuLevel === 'root' || menuLevel === 'hidden') {
        cancelTextEl.innerText = '关闭指令';
        cancelKeyEl.innerText = 'X';
    } else {
        cancelTextEl.innerText = '返回上级';
        cancelKeyEl.innerText = 'ESC';
    }
}

function renderWheel(type) {
    let layerData;

    if (type === 'root') {
        const rootConfig = { ...MENU_LAYERS.root };
        rootConfig.top = getTopSlotConfig();
        rootConfig.bottom = getBottomSlotConfig();
        layerData = rootConfig;
    } else {
        layerData = MENU_LAYERS[type];
    }

    if (!layerData) return;

    QUADRANTS.forEach((pos) => {
        const btn = document.getElementById(`slot-${pos}`);
        if (!btn) return;

        // 重置类名，清除旧主题/状态
        btn.className = `cmd-btn pos-${pos}`;

        const config = layerData[pos];
        const labelEl = btn.querySelector('.cmd-label');
        const subEl = btn.querySelector('.cmd-sub');
        const currentIconSvg = btn.querySelector('.icon-bg');

        if (!config) {
            btn.classList.add('disabled');
            if (labelEl) labelEl.innerText = '';
            if (subEl) subEl.innerText = '';
            if (currentIconSvg) currentIconSvg.remove();
            btn.disabled = true;
            return;
        }

        if (config.icon) {
            const newSvgString = config.icon.replace('<svg', '<svg class="icon-bg"');
            if (currentIconSvg) {
                currentIconSvg.outerHTML = newSvgString;
            } else {
                btn.insertAdjacentHTML('afterbegin', newSvgString);
            }
        } else {
            if (currentIconSvg) currentIconSvg.remove();
        }

        const isLocked = config.check ? !config.check() : false;

        if (labelEl) labelEl.innerHTML = config.label;
        // 对于有冷却的项目，显示冷却时间而不是"不可用"
        const subText = typeof config.sub === 'string' ? config.sub : (config.sub || '');
        if (subEl) subEl.innerText = isLocked && !subText.includes('冷却') && !subText.includes('休憩') ? '不可用' : subText;

        if (config.theme) {
            btn.classList.add(config.theme);
        }
        
        // 添加额外的 class（如 fix-scale）
        if (config.class) {
            btn.classList.add(config.class);
        }

        if (isLocked) {
            btn.disabled = true;
            btn.classList.add('disabled');
            btn.onclick = null;
        } else {
            btn.disabled = false;
            btn.onclick = () => config.action();
        }

        // 强制重绘，避免极少数渲染残留
        btn.style.display = 'none';
        btn.offsetHeight;
        btn.style.display = '';
    });
}

function toggleCommanderRoot() {
    if (menuLevel === 'hidden') {
        setMenuLevel('root');
    } else {
        setMenuLevel('hidden');
    }
}
// 【修复】立即暴露到全局，避免在initializeCommanderSystem调用前点击报错
window.toggleCommanderRoot = toggleCommanderRoot;

function handleCloseOrBack() {
    if (menuLevel === 'hidden') {
        setMenuLevel('hidden');
        return;
    }

    if (menuLevel === 'root') {
        setMenuLevel('hidden');
    } else {
        setMenuLevel('root');
    }
}
// 【修复】立即暴露到全局
window.handleCloseOrBack = handleCloseOrBack;

function sendCommand(cmd) {
    console.log(`[CMD] Command Sent: ${cmd}`);
    setMenuLevel('hidden');
    
    // 调用主项目的 armCommand 函数（装填模式）
    let armed = false;
    if (typeof window.armCommand === 'function') {
        armed = window.armCommand(cmd);
    }
    
    // 根据装填结果决定悬浮窗显示
    if (armed) {
        // 装填成功，锁定悬浮窗显示当前指令
        SmartBubbleManager.lockToCommand(cmd);
    } else {
        // 取消或失败，恢复轮播
        SmartBubbleManager.refresh();
    }
}

function activateGimmick(type) {
    console.log(`[CMD] Gimmick Triggered: ${type}`);
    setMenuLevel('hidden');
    
    // 【嫁接】所有机制统一通过 toggleMega 函数处理
    // toggleMega 内部会根据当前宝可梦的 mechanic 字段判断是 Mega/Dynamax/Tera
    if (typeof window.toggleMega === 'function') {
        window.toggleMega();
    }
    
    // 根据当前机制类型确定悬浮窗显示
    const gimmickKey = battleState.gimmickType || 'mega';
    
    // 检查是否已装填（armed）- toggleMega 统一使用 playerMegaArmed
    const isArmed = window.battle?.playerMegaArmed;
    if (isArmed) {
        SmartBubbleManager.lockToGimmick(gimmickKey);
    } else {
        SmartBubbleManager.refresh();
    }
}

function activateEvolution(type) {
    console.log(`[CMD] Evolution Triggered: ${type}`);
    setMenuLevel('hidden');
    
    // 将传入的类型映射为内部键
    const typeMap = {
        'Bio Evolution': 'bio',
        'Bond Evolution': 'bond',
        'bio': 'bio',
        'bond': 'bond'
    };
    const evoKey = typeMap[type] || 'bio';
    
    const evoInfo = {
        bio: { label: '生命进化', color: '#2ecc71', cn: '进化' },
        bond: { label: '羁绊共鸣', color: '#ff9f43', cn: '共鸣' }
    };
    
    const info = evoInfo[evoKey];
    const b = window.battle;
    
    // 如果已经装填了同一个进化，则取消（使用映射后的evoKey比较）
    if (b?.evoArmed === evoKey) {
        b.evoArmed = null;
        if (typeof window.log === 'function') {
            window.log(`<span style="color:#94a3b8">取消${info.label}预备。</span>`);
        }
        console.log(`[CMD] Evolution disarmed: ${evoKey}`);
        SmartBubbleManager.refresh();
        return;
    }
    
    // 【互斥】选择进化时，自动取消指令和风格预备
    if (b?.commandArmed) {
        window.log(`<span style="color:#94a3b8">取消指令预备，切换为进化模式。</span>`);
        b.commandArmed = null;
    }
    if (window.currentMoveStyle && window.currentMoveStyle !== 'normal') {
        window.log(`<span style="color:#94a3b8">取消风格预备，切换为进化模式。</span>`);
        window.currentMoveStyle = 'normal';
        if (typeof window.setMoveStyle === 'function') {
            window.setMoveStyle('normal');
        }
    }
    
    // 装填进化（使用映射后的evoKey）
    if (b) b.evoArmed = evoKey;
    
    if (typeof window.log === 'function') {
        window.log(`<span style="color:${info.color}">✨ ${info.label}就绪！选择招式后将触发${info.cn}！</span>`);
    }
    console.log(`[CMD] Evolution armed: ${evoKey}`);
    
    // 锁定悬浮窗显示进化（使用映射后的evoKey）
    SmartBubbleManager.lockToEvo(evoKey);
}

function selectStyle(style) {
    console.log(`[CMD] selectStyle called with: ${style}`);
    setMenuLevel('hidden');
    
    const styleInfo = {
        agile: { label: '迅疾', color: '#00d2d3', cn: '迅疾风格' },
        strong: { label: '刚猛', color: '#ff4757', cn: '刚猛风格' },
        focus: { label: '凝神', color: '#2f9e44', cn: '凝神风格' },
        normal: { label: '普通', color: '#dcdde1', cn: '普通风格' }
    };
    
    const info = styleInfo[style] || styleInfo.normal;
    
    // 【互斥】选择风格时，自动取消指令预备
    if (style && style !== 'normal' && window.battle?.commandArmed) {
        window.log(`<span style="color:#94a3b8">取消指令预备，切换为风格模式。</span>`);
        window.battle.commandArmed = null;
    }
    
    // 【互斥】选择风格时，自动取消进化预备
    if (style && style !== 'normal' && window.battle?.evoArmed) {
        window.log(`<span style="color:#94a3b8">取消进化预备，切换为风格模式。</span>`);
        window.battle.evoArmed = null;
    }
    
    // 直接设置全局变量，确保战斗逻辑能读取
    window.currentMoveStyle = style || 'normal';
    console.log(`[CMD] window.currentMoveStyle set to: ${window.currentMoveStyle}`);
    
    // 同时调用 setMoveStyle 更新 UI
    if (typeof window.setMoveStyle === 'function') {
        window.setMoveStyle(style || 'normal');
    }
    
    // 输出战斗日志
    if (typeof window.log === 'function') {
        if (style && style !== 'normal') {
            window.log(`<span style="color:${info.color}">⚔️ ${info.cn}就绪！选择招式后将以${info.label}风格出招！</span>`);
        } else {
            window.log(`<span style="color:#94a3b8">取消风格预备，回归普通风格。</span>`);
        }
    }
    
    // 锁定悬浮窗显示当前风格
    if (style && style !== 'normal') {
        SmartBubbleManager.lockToStyle(style);
    } else {
        SmartBubbleManager.refresh();
    }
}

function handleQuadrant() {
    return false;
}
// 【修复】立即暴露到全局
window.handleQuadrant = handleQuadrant;

function initializeCommanderSystem() {
    overlayEl = document.getElementById('commander-overlay');
    cancelTextEl = document.getElementById('cancel-text');
    cancelKeyEl = document.getElementById('cancel-key-text');

    const prevLevel = menuLevel;
    menuLevel = 'root';
    renderWheel('root');
    menuLevel = prevLevel;
    overlayEl?.classList.add('hidden');
    updateCancelHint();

    window.battleState = battleState;
    window.toggleCommanderRoot = toggleCommanderRoot;
    window.handleQuadrant = handleQuadrant;
    window.handleCloseOrBack = handleCloseOrBack;
}

const SmartBubbleManager = {
    intervalId: null,
    queue: [],
    currentIndex: 0,
    lockedState: null,
    ready: false,
    transitionTimeout: null,
    dom: {
        root: null,
        stage: null,
        label: null,
        timer: null,
    },

    init() {
        this.dom.root = document.getElementById('smart-bubble');
        this.dom.stage = document.getElementById('bubble-icon-stage');
        this.dom.label = document.getElementById('bubble-text');
        this.dom.timer = document.getElementById('bubble-timer-circle');
        if (!this.dom.root || !this.dom.stage || !this.dom.label) return;
        this.ready = true;
        this.scanBattleState();
        this.startLoop();
    },

    refresh() {
        if (!this.ready) return;
        this.scanBattleState();
        this.startLoop();
    },

    scanBattleState() {
        if (!this.ready) return;

        // 不再检查 currentStyle 来锁定状态，始终保持轮播
        this.lockedState = null;
        this.dom.root.classList.remove('locked');
        this.queue = [];
        this.currentIndex = 0;

        if (battleState.canGimmick && battleState.gimmickType && battleState.gimmickType !== 'none') {
            const config = getTopSlotConfig();
            this.queue.push({
                type: 'gimmick',
                subtype: battleState.gimmickType,
                icon: config.icon,
                label: config.label,
                themeColor: this.getColorForGimmick(battleState.gimmickType),
            });
        }

        if (battleState.canEvo && battleState.evoType && battleState.evoType !== 'none') {
            const config = getBottomSlotConfig();
            this.queue.push({
                type: 'evo',
                subtype: battleState.evoType,
                icon: config.icon,
                label: 'EVOLUTION',
                themeColor: battleState.evoType === 'bio' ? '#2ecc71' : '#ff9f43',
            });
        }

        if (battleState.canStyle) {
            this.queue.push({
                type: 'style',
                subtype: 'available',
                icon: ICON_SVGS.STYLE_TAIJI,
                label: 'ARTS',
                themeColor: '#dcdde1',
            });
        }

        if (battleState.canCommand) {
            this.queue.push({
                type: 'tactic',
                subtype: 'available',
                icon: ICON_SVGS.TACTIC,
                label: 'TACTIC',
                themeColor: '#ff9f43',
            });
        }

        if (!this.queue.length) {
            this.queue.push({
                type: 'empty',
                icon: null,
                label: 'READY',
                themeColor: '#666',
            });
        }

        this.render(this.queue[0]);
        this.currentIndex = this.queue.length > 1 ? 1 : 0;
    },

    lockToStyle(style) {
        this.stopLoop();
        const styleConfig = {
            agile: { text: '迅', label: 'AGILE', themeColor: '#00d2d3' },
            strong: { text: '刚', label: 'STRONG', themeColor: '#ff4757' },
            focus: { text: '凝', label: 'FOCUS', themeColor: '#2f9e44' },
        };
        const config = styleConfig[style] || { text: '道', label: 'NORMAL', themeColor: '#dcdde1' };
        this.lockedState = { icon: null, text: config.text, label: config.label, themeColor: config.themeColor };
        this.dom.root.classList.add('locked');
        this.render(this.lockedState);
    },

    lockToCommand(cmd) {
        this.stopLoop();
        const cmdConfig = {
            dodge: { text: '闪', label: 'DODGE', themeColor: '#48CAE4' },
            crit: { text: '击', label: 'FOCUS', themeColor: '#ff9f43' },
            endure: { text: '忍', label: 'ENDURE', themeColor: '#2f9e44' },
            cure: { text: '醒', label: 'LISTEN', themeColor: '#a855f7' },
        };
        const config = cmdConfig[cmd] || { text: '令', label: 'COMMAND', themeColor: '#ff9f43' };
        this.lockedState = { icon: null, text: config.text, label: config.label, themeColor: config.themeColor };
        this.dom.root.classList.add('locked');
        this.render(this.lockedState);
    },

    lockToGimmick(gimmickType) {
        this.stopLoop();
        const gimmickConfig = {
            mega: { icon: ICON_SVGS.MEGA, label: 'MEGA', themeColor: '#ec4899' },
            zmove: { icon: ICON_SVGS.Z_CRYSTAL, label: 'Z-POWER', themeColor: '#f59e0b' },
            dyna: { icon: ICON_SVGS.DYNA, label: 'DYNAMAX', themeColor: '#e11d48' },
            tera: { icon: ICON_SVGS.TERA, label: 'TERA', themeColor: '#06b6d4' },
        };
        const config = gimmickConfig[gimmickType] || gimmickConfig.mega;
        this.lockedState = { icon: config.icon, text: null, label: config.label, themeColor: config.themeColor };
        this.dom.root.classList.add('locked');
        this.render(this.lockedState);
    },

    lockToEvo(evoType) {
        this.stopLoop();
        const evoConfig = {
            bio: { icon: ICON_SVGS.BIO, text: '化', label: 'EVOLVE', themeColor: '#2ecc71' },
            bond: { icon: ICON_SVGS.BOND, text: '绊', label: 'BOND', themeColor: '#ff9f43' },
        };
        const config = evoConfig[evoType] || evoConfig.bio;
        this.lockedState = { icon: config.icon, text: config.text, label: config.label, themeColor: config.themeColor };
        this.dom.root.classList.add('locked');
        this.render(this.lockedState);
    },

    startLoop() {
        this.stopLoop();
        if (this.lockedState || !this.queue.length) return;
        this.intervalId = setInterval(() => this.cycle(), 3000);
    },

    stopLoop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },

    cycle() {
        if (this.lockedState || !this.queue.length) return;
        const item = this.queue[this.currentIndex];
        this.render(item);
        this.currentIndex = (this.currentIndex + 1) % this.queue.length;
    },

    render(item) {
        if (!this.ready || !item) return;
        this.dom.root.style.setProperty('--bubble-color', item.themeColor || '#00d2d3');
        this.dom.root.classList.toggle('locked', !!this.lockedState);
        const stage = this.dom.stage;
        const alignLeft = item.type === 'style' && item.subtype === 'available';
        stage.classList.toggle('align-left', alignLeft);

        if (this.transitionTimeout) {
            clearTimeout(this.transitionTimeout);
            this.transitionTimeout = null;
        }

        stage.classList.add('switching-out');
        this.transitionTimeout = setTimeout(() => {
            stage.innerHTML = '';
            if (item.icon) {
                const svgHTML = item.icon.replace('<svg', '<svg style="width:100%;height:100%;fill:currentColor;"');
                stage.insertAdjacentHTML('afterbegin', svgHTML);
            } else if (item.text) {
                stage.innerHTML = `<span class="bubble-big-text">${item.text}</span>`;
            } else {
                stage.innerHTML = '<span class="bubble-big-text">--</span>';
            }
            this.dom.label.innerText = item.label || '';
            stage.classList.remove('switching-out');
        }, 200);

        this.resetTimer();
    },

    resetTimer() {
        if (!this.dom.timer) return;
        this.dom.timer.style.animation = 'none';
        // force reflow
        // eslint-disable-next-line no-unused-expressions
        this.dom.timer.offsetHeight;
        if (this.lockedState) {
            this.dom.timer.style.animation = 'none';
        } else {
            this.dom.timer.style.animation = 'bubble-time 3s linear infinite';
        }
    },

    getColorForGimmick(type) {
        switch (type) {
            case 'mega':
                return '#d946ef';
            case 'zmove':
                return '#ffd700';
            case 'dyna':
                return '#ff0055';
            case 'tera':
                return '#22d3ee';
            default:
                return '#ffffff';
        }
    },
};

// 导出到全局，供主项目调用
window.initCommanderSystemV2 = function() {
    initializeCommanderSystem();
    SmartBubbleManager.init();
    console.log('[CMD V2] Commander System V2 initialized');
};

window.refreshCommanderBubble = function() {
    SmartBubbleManager.refresh();
};

// 隐藏 Smart Bubble 直到战斗开始
window.showCommanderBubble = function() {
    const bubble = document.getElementById('smart-bubble');
    if (bubble) {
        bubble.style.display = '';
        SmartBubbleManager.refresh();
    }
};

window.hideCommanderBubble = function() {
    const bubble = document.getElementById('smart-bubble');
    if (bubble) {
        bubble.style.display = 'none';
    }
};

// DOM 加载后初始化 UI 结构
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (document.getElementById('smart-bubble')) {
                initializeCommanderSystem();
                console.log('[CMD V2] Commander System V2 UI initialized');
            }
        }, 100);
    });
} else {
    setTimeout(() => {
        if (document.getElementById('smart-bubble')) {
            initializeCommanderSystem();
            console.log('[CMD V2] Commander System V2 UI initialized');
        }
    }, 100);
}
