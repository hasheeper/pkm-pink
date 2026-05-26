/**
 * ===========================================
 * CATCH-SYSTEM.JS - 捕获系统
 * ===========================================
 * 
 * 职责:
 * - 精灵球菜单控制
 * - 捕获概率计算
 * - 捕获动画与流程
 */

// ============================================
// 精灵球菜单控制
// ============================================

/**
 * 打开精灵球菜单
 */
function openBallMenu() {
    const battle = typeof window !== 'undefined' ? window.battle : null;
    if (!battle) return;
    
    const trainer = battle.trainer;
    const isWild = trainer && (trainer.id === 'wild' || !trainer.id);
    if (battle.locked || !isWild) return;
    
    const layer = document.getElementById('ball-layer');
    if (layer) layer.classList.remove('hidden');
}

/**
 * 关闭精灵球菜单
 */
function closeBallMenu() {
    const layer = document.getElementById('ball-layer');
    if (layer) layer.classList.add('hidden');
}

// ============================================
// 捕获逻辑
// ============================================

/**
 * 尝试捕获野生宝可梦
 * @param {number} ballMultiplier 精灵球捕获率倍数
 */
async function tryCatch(ballMultiplier = 1) {
    closeBallMenu();
    
    const battle = typeof window !== 'undefined' ? window.battle : null;
    if (!battle) return;
    
    const trainer = battle.trainer;
    const isWild = trainer && (trainer.id === 'wild' || !trainer.id);
    if (battle.locked || !isWild) return;

    const enemy = typeof battle.getEnemy === 'function' ? battle.getEnemy() : null;
    if (!enemy || !enemy.isAlive()) {
        log('当前没有可捕捉的目标。');
        return;
    }

    battle.locked = true;

    // 播放捕获动画
    const sprite = document.getElementById('enemy-sprite');
    if (sprite) {
        sprite.style.transition = 'transform 0.4s ease-in, opacity 0.3s';
        sprite.style.transform = 'scale(0.1) rotate(360deg)';
        sprite.style.opacity = '0';
    }

    log(`你向 ${enemy.cnName} 投掷了精灵球！`);
    await wait(600);

    // 计算捕获率
    const catchResult = calculateCatchRate(enemy, ballMultiplier);
    const { finalChance, caught } = catchResult;

    // 摇晃动画
    const shakeLog = async (count) => {
        log(`(精灵球摇晃了 ${count} 下...)`);
        await wait(600);
    };

    if (!caught) {
        // 捕获失败
        const breakShakes = finalChance > 0.7 ? 3 : finalChance > 0.4 ? 2 : 1;
        for (let i = 1; i <= breakShakes; i++) {
            await shakeLog(i);
        }
        if (breakShakes >= 3) {
            log("啊！明明就差一点点了！");
        } else {
            log("太可惜了！球破开了！");
        }

        // 恢复精灵图
        if (sprite) {
            sprite.style.transition = 'transform 0.35s ease-out, opacity 0.35s';
            sprite.style.transform = 'scale(1) rotate(0deg)';
            sprite.style.opacity = '1';
            sprite.classList.remove('entering');
            setTimeout(() => {
                sprite.style.transition = '';
                sprite.style.transform = '';
                sprite.style.opacity = '';
                sprite.classList.add('entering');
                setTimeout(() => sprite.classList.remove('entering'), 650);
            }, 400);
        }

        await wait(500);
        if (typeof updateAllVisuals === 'function') {
            updateAllVisuals(true);
        }
        if (typeof enemyTurn === 'function') {
            await enemyTurn();
        }
        return;
    }

    // 捕获成功
    await shakeLog(1);
    await shakeLog(2);
    await shakeLog(3);
    log("✨ 咚！");
    await wait(500);
    
    const catchColor = (getComputedStyle(document.documentElement).getPropertyValue('--color-catch') || '#4ade80').trim() || '#4ade80';
    log(`<b style="color:${catchColor}">成功收服了 ${enemy.cnName}!</b>`);
    enemy.currHp = 0;
    battle.phase = 'caught';

    await wait(800);
    if (typeof battleEndSequence === 'function') {
        battleEndSequence('caught');
    }
}

/**
 * 计算捕获率
 * @param {Object} enemy 敌方宝可梦
 * @param {number} ballMultiplier 精灵球倍率
 * @returns {Object} { finalChance, caught }
 */
function calculateCatchRate(enemy, ballMultiplier = 1) {
    // 计算种族值总和
    const statKeys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    const stats = enemy.baseStats || {};
    let bst = 0;
    statKeys.forEach(key => {
        const val = typeof stats[key] === 'number' ? stats[key] : 50;
        bst += val;
    });

    // 基础捕获率（种族值越高越难捕获）
    let baseCatchRate = 350 - (bst / 1.8);
    baseCatchRate = Math.max(3, Math.min(255, baseCatchRate));

    // HP 因子（HP 越低越容易捕获）
    const hpFactorRaw = ((3 * enemy.maxHp) - (2 * enemy.currHp)) / (3 * Math.max(1, enemy.maxHp));
    const hpFactor = Math.min(1, Math.max(0.1, hpFactorRaw));

    // 状态因子（暂未实现异常状态加成）
    const statusFactor = 1;

    // 最终捕获率
    let finalChance = (baseCatchRate * hpFactor * ballMultiplier * statusFactor) / 255;
    
    // 大师球保证捕获
    if (ballMultiplier >= 255) {
        finalChance = 2;
    } else {
        finalChance = Math.max(0.02, Math.min(0.95, finalChance));
    }

    // 判定是否捕获成功
    const caught = finalChance >= 1 || Math.random() <= finalChance;

    return { finalChance, caught, baseCatchRate, hpFactor };
}

/**
 * 辅助函数：等待
 */
function wait(ms) { 
    return new Promise(r => setTimeout(r, ms)); 
}

/**
 * 辅助函数：日志输出
 */
function log(msg) {
    if (typeof window !== 'undefined' && typeof window.log === 'function') {
        window.log(msg);
    } else {
        console.log(msg);
    }
}

// ============================================
// 导出
// ============================================

// 浏览器环境
if (typeof window !== 'undefined') {
    window.openBallMenu = openBallMenu;
    window.closeBallMenu = closeBallMenu;
    window.tryCatch = tryCatch;
    window.calculateCatchRate = calculateCatchRate;
}

// Node.js 环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openBallMenu,
        closeBallMenu,
        tryCatch,
        calculateCatchRate
    };
}
