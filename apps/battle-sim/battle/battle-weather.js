/**
 * =============================================
 * Canvas 粒子天气系统 v2.0
 * =============================================
 * 支持：Smog(N), Ashfall(A), Fog(S), Gale(B), Ambrosia(Boss), Distortion(Rift)
 */

let canvas = null;
let ctx = null;
let particles = [];
let weatherType = 'none';
let animationFrameId = null;
let transitionProgress = 1.0; // 1.0 = 完全显示，0.0 = 完全隐藏
let isTransitioning = false;

// [粒子配置参数]
const CONFIG = {
    // ---------------- 原版 ----------------
    rain:       { count: 180, speed: 12, angle: 0.1,  color: '120, 160, 230' },
    heavyrain:  { count: 400, speed: 22, angle: 0.15, color: '60, 80, 160' },
    snow:       { count: 300, speed: 2.5,  angle: 0.3,  color: '255, 255, 255' },
    hail:       { count: 120, speed: 9,  angle: 0.1,  color: '200, 220, 255' },
    sand:       { count: 600, speed: 28, angle: -0.2, color: '210, 180, 120' },
    harshsun:   { count: 80,  speed: 0.8, angle: 0,   color: '255, 140, 0' },
    deltastream:{ count: 120, speed: 35, angle: -0.8, color: '80, 255, 200' },
    sun:        { count: 80,  speed: 0.6, angle: 0,   color: '255, 225, 150' },

    // ---------------- N/A/S/B 特色 ----------------
    smog:       { count: 200, speed: -0.5, angle: 0.1, color: '160, 80, 200' }, // N区: 深紫色毒气
    ashfall:    { count: 500, speed: 4,   angle: 0.2, color: '120, 120, 120' },// A区: 灰色重火山灰
    fog:        { count: 60,  speed: 0.15, angle: 0.8, color: '235, 240, 250' }, // S区: 巨大柔边雾团
    gale:       { count: 300, speed: 45,  angle: 0,   color: '180, 230, 255' }, // B区: 极速青色风线

    // ---------------- 剧情/BOSS ----------------
    ambrosia:   { count: 150, speed: -1.5, angle: 0,   color: '255, 20, 147' },  // 粉色能量上浮
    distortion: { 
        count: 60,   // 不需要太多，重点是单个粒子的质量
        speed: 0, 
        angle: 0, 
        // 赛博霓虹色：亮青色(未来)、洋红色(过去)、纯白(数据)、石灰绿(矩阵)
        colors: ['0, 255, 255', '255, 0, 255', '255, 255, 255', '50, 205, 50']
    }
};

class Particle {
    constructor(type, w, h) {
        this.w = w;
        this.h = h;
        this.reset(type);
    }

    reset(type) {
        this.type = type;
        this.x = Math.random() * this.w;
        this.y = Math.random() * this.h;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.size = Math.random() * 2 + 1;
        this.alpha = 1;

        // 根据逻辑设置初始速度
        /* --- 垂直下落系 --- */
        if (['rain', 'heavyrain', 'ashfall'].includes(type)) {
            this.y = Math.random() * -this.h; // 从很天花板生成
            const cfg = CONFIG[type];
            this.vy = cfg.speed + Math.random() * 2;
            this.vx = (type === 'ashfall') ? Math.random() - 0.5 : (cfg.angle * this.vy); 
            // 灰烬是灰色的方块感
            this.length = (type === 'ashfall') ? Math.random() * 4 + 2 : Math.random() * 20 + 10;
        } 
        /* --- 飘雪/冰雹 轻盈系 --- */
        else if (['snow', 'hail'].includes(type)) {
            this.y = Math.random() * -this.h;
            const cfg = CONFIG[type];
            this.vy = cfg.speed + (type === 'hail' ? Math.random() * 5 : Math.random());
            this.vx = Math.sin(Math.random() * Math.PI) * (type === 'snow' ? 1 : 0.5);
            this.size = (type === 'snow') ? Math.random() * 3 + 1.5 : Math.random() * 3 + 2; 
        } 
        /* --- 横向高速位移系 --- */
        else if (['sand', 'deltastream', 'gale'].includes(type)) {
            const cfg = CONFIG[type];
            this.x = Math.random() * this.w + (type !== 'sand' ? 200 : 0);
            this.vx = -cfg.speed - Math.random() * 10; // 从右往左吹
            this.vy = (Math.random() - 0.5) * (type === 'gale' ? 1 : 2); // 风比较直
            if (type === 'gale') this.length = Math.random() * 200 + 50; // 风痕很长
        }
        /* --- 漂浮/呼吸系 (Smog, Sun, Ambrosia) --- */
        else if (['harshsun', 'sun', 'smog', 'fog', 'ambrosia'].includes(type)) {
            const cfg = CONFIG[type];
            this.vy = cfg.speed + (Math.random() - 0.5) * 0.5; // Smog/Ambrosia 向上飘
            this.vx = (Math.random() - 0.5) * (type === 'fog' ? 0.3 : 1); 
            
            // Smog 圆形毒气 / Fog 巨大云雾
            if (type === 'smog') {
                this.size = Math.random() * 20 + 10;
                this.opacity = Math.random() * 0.15 + 0.05; // 淡淡的烟圈
            } else if (type === 'fog') {
                // 暗影迷雾：巨大柔边雾团，越大越淡
                let scale = Math.random();
                this.size = scale * 180 + 100;  // 100-280px 的超大粒子
                this.opacity = (1 - scale) * 0.5 + 0.4; // 极低透明度(0.02-0.08)，靠叠加产生浓度
                this.vx = (Math.random() - 0.5) * 0.5; // 极缓慢蠕动
                this.vy = (Math.random() - 0.5) * 0.15;
                this.isRadialFog = true; // 标记使用径向渐变渲染
            } else if (type === 'ambrosia') {
                this.sideOscillation = Math.random() * 100; // 前后摆动相位
            } else if (type === 'sun') {
                this.size = Math.random() * 6 + 2; // 普通日照更大的光斑
                this.opacity = Math.random() * 0.4 + 0.2;
            } else if (type === 'harshsun') {
                this.size = Math.random() * 7 + 3; // 大日照更夸张
                this.opacity = Math.random() * 0.5 + 0.3;
            }
        }
        /* --- 故障系 (Distortion / Chronal Rift) --- */
        else if (type === 'distortion') {
            this.x = Math.random() * this.w;
            this.y = Math.random() * this.h;
            this.size = Math.random() * 30 + 10;
            
            // 三种形态：0=乱码文字, 1=空心碎片, 2=闪烁横条
            this.subType = Math.floor(Math.random() * 3);
            
            // 赛博霓虹色
            const colorArray = CONFIG.distortion.colors;
            this.colorStr = colorArray[Math.floor(Math.random() * colorArray.length)];
            
            // 乱码字符库（片假名、卢恩字母、西里尔字母）
            const charSets = [0x30A0, 0x16A0, 0x0400];
            const set = charSets[Math.floor(Math.random() * charSets.length)];
            this.glitchChar = String.fromCharCode(set + Math.floor(Math.random() * 50));
            
            // 控制"跳变"频率，模拟电子接触不良
            this.refreshRate = Math.floor(Math.random() * 20) + 5;
            this.tick = 0;
            this.opacity = Math.random() * 0.8 + 0.2;
        }
    }

    update() {
        // [雨/灰烬] 掉落重置
        if (['rain', 'heavyrain', 'ashfall'].includes(this.type)) {
            this.x += this.vx;
            this.y += this.vy;
            if (this.y > this.h) { this.y = -50; this.x = Math.random() * this.w; }
            if (this.x > this.w) this.x = 0;
            if (this.x < 0) this.x = this.w;
        } 
        // [雪] 摆动掉落
        else if (['snow', 'hail'].includes(this.type)) {
            this.x += Math.sin(this.y * 0.01) * 0.5;
            this.y += this.vy;
            if (this.y > this.h) this.y = -10;
        } 
        // [沙/风/乱气流] 横向
        else if (['sand', 'deltastream', 'gale'].includes(this.type)) {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -200) { this.x = this.w + Math.random() * 100; this.y = Math.random() * this.h; }
        }
        // [雾/光/毒气/神馔] 上浮呼吸
        else if (['harshsun', 'sun', 'smog', 'fog', 'ambrosia'].includes(this.type)) {
            this.y -= this.vy; // 负数向下，正数向上? 此时我们配置的speed是正/负已在constructor处理
            this.x += this.vx;
            
            // 连贯呼吸闪烁
            this.alpha = Math.sin(Date.now() * 0.002 + this.x * 0.01) * 0.4 + 0.6;
            
            if (this.type === 'ambrosia') {
               // Ambrosia 特有：会有左右蛇形摆动
               this.x += Math.sin(Date.now() / 500 + this.sideOscillation) * 0.5;
            }

            // 越也是循环处理，如果飘出头了就到底下（用于雾/光）
            if (this.y < -100) this.y = this.h + 100;
            else if (this.y > this.h + 100) this.y = -100;
            if (this.x < -100) this.x = this.w + 100;
            else if (this.x > this.w + 100) this.x = -100;
        }
        // [故障] 瞬移与突变 (Chronal Rift)
        else if (this.type === 'distortion') {
            this.tick++;
            
            // 核心思路：并不是平滑移动，而是"瞬移"和"突变"
            if (this.tick % this.refreshRate === 0) {
                // 1. 位置突变 (Teleport)
                if (Math.random() > 0.5) {
                    this.x = Math.random() * this.w;
                } else {
                    // 偶尔横向拉伸突变，模拟坏点光栅
                    this.x += (Math.random() - 0.5) * 50;
                }
                
                // 2. 只有横条会上下扫描
                if (this.subType === 2) {
                    this.y = Math.random() * this.h;
                }
                
                // 3. 乱码字符变化
                if (this.subType === 0) {
                    const charSets = [0x30A0, 0x16A0, 0x0400];
                    const set = charSets[Math.floor(Math.random() * charSets.length)];
                    this.glitchChar = String.fromCharCode(set + Math.floor(Math.random() * 50));
                }
                
                // 4. 重随机计时器，让节奏不规律
                this.refreshRate = Math.floor(Math.random() * 10) + 2;
                
                // 5. 随机显隐 (Strobe effect)
                this.opacity = Math.random() > 0.3 ? Math.random() : 0;
            }
        }
    }

    draw(ctx) {
        // ============ 时空裂隙专属渲染 ============
        if (this.type === 'distortion') {
            const visualAlpha = this.opacity * transitionProgress;
            if (visualAlpha < 0.05) return;
            
            ctx.save();
            ctx.shadowBlur = 0;
            
            // 模拟 RGB 色散：如果是碎片，加一点红/蓝阴影
            if (Math.random() > 0.8) {
                ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
                ctx.shadowOffsetX = 2;
            } else if (Math.random() > 0.8) {
                ctx.shadowColor = 'rgba(0, 0, 255, 0.8)';
                ctx.shadowOffsetX = -2;
            }
            
            ctx.fillStyle = `rgba(${this.colorStr}, ${visualAlpha})`;
            ctx.strokeStyle = `rgba(${this.colorStr}, ${visualAlpha})`;
            
            /* === 子类型A: 乱码字符 (The Code) === */
            if (this.subType === 0) {
                ctx.font = `${this.size}px "Courier New", monospace`;
                ctx.shadowBlur = 5;
                ctx.shadowColor = ctx.fillStyle;
                ctx.fillText(this.glitchChar, this.x, this.y);
            }
            /* === 子类型B: 空心碎片 (The Shard) === */
            else if (this.subType === 1) {
                ctx.lineWidth = 1.5;
                const s = this.size;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + s, this.y);
                ctx.lineTo(this.x + s, this.y + s);
                if (Math.random() > 0.5) {
                    ctx.stroke();
                } else {
                    ctx.strokeRect(this.x, this.y, this.size, this.size);
                }
                
                // 有概率加一条贯穿屏幕的极细线来模拟裂痕
                if (Math.random() > 0.98) {
                    ctx.beginPath();
                    ctx.moveTo(0, this.y + s/2);
                    ctx.lineTo(this.w, this.y + s/2);
                    ctx.strokeStyle = `rgba(${this.colorStr}, ${visualAlpha * 0.3})`;
                    ctx.stroke();
                }
            }
            /* === 子类型C: 数据坏块 (The Glitch Block) === */
            else if (this.subType === 2) {
                ctx.fillRect(this.x, this.y, this.size * (Math.random() * 5 + 1), 2);
            }
            
            ctx.restore();
            return;
        }
        
        // ============ 其他天气类型的原有渲染逻辑 ============
        ctx.beginPath();
        let cfg = CONFIG[this.type] || CONFIG.rain;
        let colorStr = cfg.color;
        
        let visualAlpha = (['sun','harshsun','ambrosia'].includes(this.type)) ? this.alpha * 0.5 : this.opacity;
        visualAlpha *= transitionProgress;

        ctx.fillStyle = `rgba(${colorStr}, ${visualAlpha})`;
        ctx.strokeStyle = `rgba(${colorStr}, ${visualAlpha})`;

        switch(this.type) {
            case 'rain': 
            case 'heavyrain':
            case 'gale':
                ctx.moveTo(this.x, this.y);
                if (this.type === 'gale') { ctx.lineTo(this.x + this.length, this.y); } 
                else { ctx.lineTo(this.x + this.vx, this.y + this.length); }
                ctx.lineWidth = (this.type === 'gale') ? 2 : 1.5; 
                ctx.stroke();
                break;
                
            case 'ashfall':
                ctx.fillRect(this.x, this.y, this.size, this.size);
                break;

            case 'snow':
            case 'hail':
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                if(this.type === 'hail'){
                   ctx.strokeStyle = `rgba(255,255,255,${visualAlpha*0.8})`;
                   ctx.stroke();
                }
                break;
                
            case 'sand':
            case 'deltastream':
                ctx.fillRect(this.x, this.y, this.size * 5, 2);
                break;

            case 'smog':
            case 'ambrosia': 
            case 'harshsun': 
            case 'sun':
                ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
                ctx.fill();
                break;
                
            case 'fog':
                let fogGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                fogGradient.addColorStop(0, `rgba(${colorStr}, ${visualAlpha})`);
                fogGradient.addColorStop(0.3, `rgba(${colorStr}, ${visualAlpha * 0.7})`);
                fogGradient.addColorStop(0.6, `rgba(${colorStr}, ${visualAlpha * 0.3})`);
                fogGradient.addColorStop(1, `rgba(${colorStr}, 0)`);
                ctx.fillStyle = fogGradient;
                ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
                break;
        }
    }

}

function animate() {
    if (!ctx || !canvas) {
        animationFrameId = requestAnimationFrame(animate);
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 处理渐变过渡
    if (isTransitioning) {
        transitionProgress += 0.03; // 每帧增加3%
        if (transitionProgress >= 1.0) {
            transitionProgress = 1.0;
            isTransitioning = false;
        }
    }

    if (weatherType === 'none' || weatherType === 'clear') {
        // 依然循环以监听变更，但空绘图省资源
        animationFrameId = requestAnimationFrame(animate); 
        return;
    }

    for (let p of particles) {
        p.update();
        p.draw(ctx);
    }
    
    // ============ Chronal Rift 专属：屏幕撕裂与 RGB 错位 ============
    if (weatherType === 'distortion' && !isTransitioning) {
        // 每隔随机时间触发一次猛烈的干扰
        if (Math.random() > 0.96) { // 4% 的帧会有严重故障
            const sliceH = Math.random() * 50 + 10;
            const sliceY = Math.random() * canvas.height;
            const displaceX = (Math.random() - 0.5) * 20; // 左右错位 20px
            
            try {
                // 获取这一条的像素数据
                const imageData = ctx.getImageData(0, sliceY, canvas.width, sliceH);
                // 错位放回去
                ctx.putImageData(imageData, displaceX, sliceY);
                
                // 可以在这里加一个纯色块覆盖，模拟信号丢失
                if (Math.random() > 0.5) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                    ctx.fillRect(0, sliceY, canvas.width, 2);
                }
            } catch (e) {
                // 防止 getImageData 越界错误
            }
        }
        
        // 额外的全屏扫描线干扰（更频繁但更轻微）
        if (Math.random() > 0.92) {
            const scanY = Math.random() * canvas.height;
            const colors = CONFIG.distortion.colors;
            const scanColor = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillStyle = `rgba(${scanColor}, 0.15)`;
            ctx.fillRect(0, scanY, canvas.width, 1);
        }
    }

    animationFrameId = requestAnimationFrame(animate);
}

/**
 * 初始化天气系统
 */
function initWeatherSystem() {
    // 优先尝试获取已存在的或者重新创建
    canvas = document.getElementById('weather-canvas');
    if (!canvas) {
        // [适配] 这里假设你的战斗画面容器 class="battle-stage"
        const stage = document.querySelector('.battle-stage') || document.body; 
        if (stage) {
            canvas = document.createElement('canvas');
            canvas.id = 'weather-canvas';
            // 全屏遮罩模式
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none'; // 点击穿透核心
            canvas.style.zIndex = '50'; // 放在UI层下，立绘层上
            
            // 实际像素设置，或动态获取
            canvas.width = stage.offsetWidth || 1100;
            canvas.height = stage.offsetHeight || 720;
            
            stage.appendChild(canvas);
        }
    }
    
    // 如果还没获取到 (可能DOM没加载完)
    if(canvas) ctx = canvas.getContext('2d');
    
    if (!animationFrameId) animate();
}

/**
 * 设置天气视觉效果 (外部调用入口)
 * @param {string} type - 传入引擎天气代码
 */
function setWeatherVisuals(type) {
    if(!type) return;
    const lowerType = type.toLowerCase();
    
    // 映射表：将 引擎天气ID -> CONFIG配置KEY
    const typeMap = {
        'rain': 'rain', 'drizzle': 'rain',
        'heavyrain': 'heavyrain', 'primordialsea': 'heavyrain',
        'sun': 'sun', 'sunnyday': 'sun', 'clear_sun': 'sun',
        'harshsun': 'harshsun', 'desolateland': 'harshsun',
        'sand': 'sand', 'sandstorm': 'sand',
        'snow': 'snow', 'hail': 'hail',
        'deltastream': 'deltastream', 'strongwinds': 'gale', // 强风也用Gale效果
        // 新增的
        'smog': 'smog',
        'ashfall': 'ashfall',
        'fog': 'fog',
        'gale': 'gale',
        'ambrosia': 'ambrosia', 'ambrosia_overdrive': 'ambrosia',
        'distortion': 'distortion', 'chronalrift': 'distortion',
        // 空
        'none': 'none', 'clear': 'none'
    };

    const targetKey = typeMap[lowerType] || 'none';
    
    if (weatherType === targetKey) return; // 没变化则不重置

    // 若系统挂了则尝试重启
    if (!canvas || !ctx) initWeatherSystem();

    // 启动渐变过渡
    transitionProgress = 0.0;
    isTransitioning = true;

    weatherType = targetKey;
    console.log(`[WEATHER VISUAL] Switch to: ${weatherType}`);

    // 重置粒子池
    particles = [];
    if (weatherType !== 'none' && CONFIG[weatherType]) {
        const count = CONFIG[weatherType].count;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(weatherType, canvas.width || 1100, canvas.height || 720));
        }
    }
    
    // CSS 背景滤镜联动
    const bgLayer = document.querySelector('.bg-gradient');
    if (bgLayer) {
        // 清理旧 Class
        const allClasses = [
            'bg-rain', 'bg-heavyrain', 'bg-sand', 'bg-snow', 'bg-hail', 
            'bg-harshsun', 'bg-sun', 'bg-deltastream',
            // 新增的
            'bg-smog', 'bg-ashfall', 'bg-fog', 'bg-gale', 'bg-ambrosia', 'bg-distortion', 'bg-chronalrift'
        ];
        bgLayer.classList.remove(...allClasses);
        
        // 添加新 Class
        if (weatherType !== 'none') {
            // chronalrift 使用 distortion 的视觉效果
            const cssClass = `bg-${weatherType}`;
            bgLayer.classList.add(cssClass);
        }
    }

    // Canvas 可见性
    if (canvas) canvas.style.opacity = (weatherType === 'none') ? '0' : '1';
}

function clearWeatherVisuals() {
    setWeatherVisuals('none');
}

// 导出与自启动
window.initWeatherSystem = initWeatherSystem;
window.setWeatherVisuals = setWeatherVisuals;
window.clearWeatherVisuals = clearWeatherVisuals;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initWeatherSystem, 500));
} else {
    setTimeout(initWeatherSystem, 500);
}
