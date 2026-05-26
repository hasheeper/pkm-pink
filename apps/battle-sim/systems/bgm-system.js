/**
 * ===========================================
 * BGM-SYSTEM.JS - 背景音乐系统
 * ===========================================
 * 
 * 洛迪亚特区 BGM 管理系统
 * 
 * 职责:
 * - 战斗 BGM 选择 (根据等级/训练家类型)
 * - 胜利音乐播放 (野生/训练家)
 * - 动态切歌 (馆主战危机时刻)
 * - 音频淡入淡出
 */

// ============================================
// BGM 资源索引表
// ============================================

// 获取基础路径 (兼容 GitHub Pages)
function getBgmBasePath() {
    // 优先使用全局 getBasePath（由 index.js 定义）
    if (typeof window !== 'undefined' && typeof window.getBasePath === 'function') {
        return window.getBasePath();
    }
    const path = window.location.pathname;
    // GitHub Pages: /pkm33/
    if (path.includes('/pkm33/')) {
        return path.substring(0, path.indexOf('/pkm33/') + 7);
    }
    return './';
}

// BGM 文件名配置（不包含路径，路径在播放时动态获取）
const BGM_FILES = {
    WILD_LOW:     'wild_01_low_unova.mp3',
    WILD_MID:     'wild_02_mid_sinnoh.mp3',
    WILD_HIGH:    'wild_03_ex_areazero.mp3',
    TIER_1:       'battle_01_raw.mp3',
    TIER_2:       'battle_02_standard.mp3',
    TIER_3_MAIN:  'battle_03_gym_main.mp3',
    TIER_3_LAST:  'battle_03_gym_crisis.mp3',
    TIER_4:       'battle_04_elite.mp3',
    TIER_5_BOSS:  'battle_05_legend.mp3',
    WIN_WILD:     'win_01_wild.mp3',
    WIN_TRAINER:  'win_02_trainer.mp3'
};

// 动态获取 BGM 完整路径
function getBgmPath(key) {
    const basePath = getBgmBasePath();
    const filename = BGM_FILES[key];
    return filename ? `${basePath}data/bgm/${filename}` : null;
}

// BGM_INDEX 现在存储 key 而不是完整 URL，实际路径通过 getBgmPath() 动态获取
const BGM_INDEX = {
    WILD_LOW:     'WILD_LOW',
    WILD_MID:     'WILD_MID',
    WILD_HIGH:    'WILD_HIGH',
    TIER_1:       'TIER_1',
    TIER_2:       'TIER_2',
    TIER_3_MAIN:  'TIER_3_MAIN',
    TIER_3_LAST:  'TIER_3_LAST',
    TIER_4:       'TIER_4',
    TIER_5_BOSS:  'TIER_5_BOSS',
    WIN_WILD:     'WIN_WILD',
    WIN_TRAINER:  'WIN_TRAINER'
};

// ============================================
// BGM 音量配置表 (0.0 - 1.0) - 使用 key 作为索引
// ============================================

const BGM_VOLUME_CONFIG = {
    'WILD_LOW':     0.25,
    'WILD_MID':     0.28,
    'WILD_HIGH':    0.20,
    'TIER_1':       0.22,
    'TIER_2':       0.25,
    'TIER_3_MAIN':  0.28,
    'TIER_3_LAST':  0.32,
    'TIER_4':       0.30,
    'TIER_5_BOSS':  0.35,
    'WIN_WILD':     0.20,
    'WIN_TRAINER':  0.27
};

// ============================================
// BGM 播放器状态
// ============================================

const BgmPlayer = {
    currentAudio: null,
    currentKey: null,
    defaultVolume: 0.25,
    
    // key: BGM_INDEX 中的 key (如 'WILD_LOW', 'TIER_1')
    play(key, loop = true, fadeInDuration = 500) {
        // 【全局开关】BGM 系统关闭时不播放
        if (typeof window !== 'undefined' && window.GAME_SETTINGS && !window.GAME_SETTINGS.enableBGM) {
            console.log('[BGM] Disabled by GAME_SETTINGS');
            return;
        }
        
        // 如果正在播放相同的 BGM 且未暂停，跳过
        if (this.currentAudio && this.currentKey === key && !this.currentAudio.paused) {
            console.log('[BGM] Already playing:', key);
            return;
        }
        
        // 动态获取完整路径
        const url = getBgmPath(key);
        if (!url) {
            console.warn('[BGM] Unknown key:', key);
            return;
        }
        
        // 停止当前播放的 BGM
        this.stop(0);
        
        console.log('[BGM] Starting playback:', key, '->', url);
        
        try {
            this.currentAudio = new Audio(url);
            this.currentKey = key;
            this.currentAudio.loop = loop;
            this.currentAudio.volume = 0;
            
            const playPromise = this.currentAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('[BGM] Playback started successfully');
                }).catch(err => {
                    console.warn('[BGM] Autoplay blocked:', err);
                });
            }
            
            // 使用配置表中的音量，如果没有配置则使用默认值
            const targetVolume = BGM_VOLUME_CONFIG[key] || this.defaultVolume;
            this._fadeIn(fadeInDuration, targetVolume);
        } catch (err) {
            console.error('[BGM] Play error:', err);
        }
    },
    
    stop(fadeOutDuration = 300) {
        if (!this.currentAudio) return;
        
        if (fadeOutDuration > 0) {
            this._fadeOut(fadeOutDuration, () => {
                if (this.currentAudio) {
                    this.currentAudio.pause();
                    this.currentAudio = null;
                    this.currentKey = null;
                }
            });
        } else {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.currentKey = null;
        }
    },
    
    // key: BGM_INDEX 中的 key
    crossFade(key, loop = true) {
        if (this.currentKey === key) return;
        
        const url = getBgmPath(key);
        if (!url) {
            console.warn('[BGM] Unknown key for crossFade:', key);
            return;
        }
        
        const oldAudio = this.currentAudio;
        
        try {
            const newAudio = new Audio(url);
            newAudio.loop = loop;
            newAudio.volume = 0;
            
            newAudio.play().then(() => {
                if (oldAudio) {
                    this._fadeOutAudio(oldAudio, 800, () => {
                        oldAudio.pause();
                    });
                }
                this.currentAudio = newAudio;
                this.currentKey = key;
                const targetVolume = BGM_VOLUME_CONFIG[key] || this.defaultVolume;
                this._fadeIn(800, targetVolume);
            }).catch(err => {
                console.warn('[BGM] 切换失败:', err.message);
            });
        } catch (e) {
            console.warn('[BGM] 切换音频失败:', e.message);
        }
    },
    
    setVolume(vol) {
        this.defaultVolume = Math.max(0, Math.min(1, vol));
        if (this.currentAudio) {
            this.currentAudio.volume = this.defaultVolume;
        }
    },
    
    _fadeIn(duration, targetVolume = null) {
        if (!this.currentAudio) return;
        const startTime = Date.now();
        const volume = targetVolume !== null ? targetVolume : this.defaultVolume;
        
        const fade = () => {
            if (!this.currentAudio) return;
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            this.currentAudio.volume = volume * progress;
            if (progress < 1) requestAnimationFrame(fade);
        };
        requestAnimationFrame(fade);
    },
    
    _fadeOut(duration, callback) {
        if (!this.currentAudio) {
            if (callback) callback();
            return;
        }
        this._fadeOutAudio(this.currentAudio, duration, callback);
    },
    
    _fadeOutAudio(audio, duration, callback) {
        const startTime = Date.now();
        const startVolume = audio.volume;
        
        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(1, elapsed / duration);
            audio.volume = startVolume * (1 - progress);
            if (progress < 1) {
                requestAnimationFrame(fade);
            } else {
                if (callback) callback();
            }
        };
        requestAnimationFrame(fade);
    }
};

// ============================================
// BGM 选择逻辑
// ============================================

function getBattleBgm(avgLevel, isTrainer, isCrisis = false) {
    if (!isTrainer) {
        if (avgLevel >= 70) return BGM_INDEX.WILD_HIGH;
        if (avgLevel >= 40) return BGM_INDEX.WILD_MID;
        return BGM_INDEX.WILD_LOW;
    } else {
        if (avgLevel >= 85) return BGM_INDEX.TIER_5_BOSS;
        // Tier 4 (70-84级) 也支持危机 BGM
        if (avgLevel >= 70) return isCrisis ? BGM_INDEX.TIER_3_LAST : BGM_INDEX.TIER_4;
        // Tier 3 (50-69级) 支持危机 BGM
        if (avgLevel >= 50) return isCrisis ? BGM_INDEX.TIER_3_LAST : BGM_INDEX.TIER_3_MAIN;
        if (avgLevel >= 25) return BGM_INDEX.TIER_2;
        return BGM_INDEX.TIER_1;
    }
}

function getPartyAvgLevel(party) {
    if (!party || party.length === 0) return 1;
    const total = party.reduce((sum, p) => sum + (p.level || p.lv || 1), 0);
    return Math.round(total / party.length);
}

function playBattleBgm() {
    if (typeof battle === 'undefined' || !battle) {
        console.warn('[BGM] battle 对象未定义');
        return;
    }
    
    const enemyParty = battle.enemyParty || [];
    if (enemyParty.length === 0) {
        console.warn('[BGM] 敌方队伍为空，延迟 100ms 重试');
        setTimeout(playBattleBgm, 100);
        return;
    }
    
    const avgLevel = getPartyAvgLevel(enemyParty);
    const isTrainer = battle.trainer && battle.trainer.id !== 'wild';
    
    const bgmUrl = getBattleBgm(avgLevel, isTrainer, false);
    console.log(`[BGM] 战斗开始 - 平均等级: ${avgLevel}, 训练家: ${isTrainer}, 队伍数: ${enemyParty.length}`);
    console.log(`[BGM] 播放: ${bgmUrl}`);
    
    BgmPlayer.play(bgmUrl, true);
}

function checkCrisisBgm() {
    if (typeof battle === 'undefined' || !battle) return;
    
    const enemyParty = battle.enemyParty || [];
    const avgLevel = getPartyAvgLevel(enemyParty);
    const isTrainer = battle.trainer && battle.trainer.id !== 'wild';
    
    // 只在 Tier 3 (50-69级) 和 Tier 4 (70-84级) 触发危机 BGM
    if (!isTrainer || avgLevel < 50 || avgLevel >= 85) return;
    
    const totalEnemies = enemyParty.length;
    const aliveEnemies = enemyParty.filter(p => p.currHp > 0);
    const aliveCount = aliveEnemies.length;
    
    // 根据队伍总数决定触发时机
    let shouldTriggerCrisis = false;
    
    if (totalEnemies <= 2) {
        // 1-2只: 不播放危机 BGM
        shouldTriggerCrisis = false;
    } else if (totalEnemies >= 3 && totalEnemies <= 5) {
        // 3-5只: 最后一只时播放
        shouldTriggerCrisis = (aliveCount === 1);
    } else if (totalEnemies === 6) {
        // 6只: 最后两只时播放
        shouldTriggerCrisis = (aliveCount <= 2);
    }
    
    if (shouldTriggerCrisis) {
        const crisisBgm = BGM_INDEX.TIER_3_LAST;
        if (BgmPlayer.currentKey !== crisisBgm) {
            console.log(`[BGM] 危机时刻！队伍: ${totalEnemies}只, 剩余: ${aliveCount}只, 切换BGM`);
            BgmPlayer.crossFade(crisisBgm, true);
        }
    }
}

function playVictoryBgm(isTrainerBattle) {
    const bgmUrl = isTrainerBattle ? BGM_INDEX.WIN_TRAINER : BGM_INDEX.WIN_WILD;
    console.log(`[BGM] 胜利音乐 - 训练家: ${isTrainerBattle}`);
    BgmPlayer.play(bgmUrl, false, 300);
}

function stopBgm(fadeOut = 500) {
    BgmPlayer.stop(fadeOut);
}

// ============================================
// 导出
// ============================================

if (typeof window !== 'undefined') {
    window.BGM_INDEX = BGM_INDEX;
    window.BgmPlayer = BgmPlayer;
    window.getBattleBgm = getBattleBgm;
    window.getPartyAvgLevel = getPartyAvgLevel;
    window.playBattleBgm = playBattleBgm;
    window.checkCrisisBgm = checkCrisisBgm;
    window.playVictoryBgm = playVictoryBgm;
    window.stopBgm = stopBgm;
}
