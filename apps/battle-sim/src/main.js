/**
 * ===========================================
 * MAIN.JS - Vite ES Module 入口文件
 * ===========================================
 * 
 * 聚合所有模块，Vite 会自动处理依赖和打包
 * 
 * 加载顺序：
 * 1. globals.js - 挂载核心全局变量
 * 2. 其他模块 - 依赖全局变量
 * 3. index.js - 主入口
 */

// ============================================
// 1. 首先加载全局变量（必须第一个）
// ============================================
import './globals.js';

// ============================================
// 2. 战斗机制模块
// ============================================
import '../mechanics/move-styles.js';
import '../mechanics/z-moves.js';
import '../mechanics/mechanic-checker.js';
import '../mechanics/dynamax.js';
import '../mechanics/mega-evolution.js';
import '../mechanics/form-change/form-change-system.js';
import '../mechanics/clash-system.js';

// ============================================
// 3. UI 模块
// ============================================
import '../ui/ui-renderer.js';
import '../ui/ui-sprites.js';
import '../ui/sprite-duplicate-fix.js';
import '../ui/ui-trainer-hud.js';
import '../ui/ui-menus.js';

// ============================================
// 4. 系统模块
// ============================================
import '../systems/translations.js';
import '../systems/environment-overlay.js';  // 环境图层系统 (需在 data-loader 之前)
import '../systems/data-loader.js';
import '../systems/catch-system.js';
import '../systems/bgm-system.js';
import '../systems/audio-manager.js';
import '../systems/preloader.js';
import '../systems/growth-system.js';
import '../systems/pp-system.js';

// ============================================
// 5. 战斗模块
// ============================================
import '../engine/weather-effects.js';  // 天气效果核心模块（需在其他战斗模块之前）
import '../battle/battle-vfx.js';
import '../battle/battle-effects.js';
import '../battle/battle-damage.js';
import '../battle/battle-switch.js';
import '../battle/battle-turns.js';
import '../battle/battle-weather.js';

// ============================================
// 6. AI 引擎
// ============================================
import '../engine/ai-engine.js';

// ============================================
// 7. 技能效果扩展
// ============================================
import '../engine/move-effects.js';

// ============================================
// 8. Commander System V2
// ============================================
import '../cmd/mechanics.js';

// ============================================
// 9. 主入口
// ============================================
import '../index.js';

// ============================================
// 9. 日志清洗与复制系统
// ============================================
import '../systems/log-filter.js';

console.log('[Vite] 所有模块加载完成');
