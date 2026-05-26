#!/usr/bin/env node

/**
 * PKM Dashboard - iframe 隔离注入
 * 用 iframe 完全隔离样式，悬浮球用已验证成功的 jQuery 方式
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 [BUILD] iframe 隔离注入...\n');

const readFile = (filename) => {
    const filepath = path.join(__dirname, filename);
    if (!fs.existsSync(filepath)) {
        console.error(`❌ 找不到: ${filename}`);
        process.exit(1);
    }
    console.log(`📖 读取: ${filename}`);
    return fs.readFileSync(filepath, 'utf8');
};

const readFileOptional = (filename) => {
    const filepath = path.join(__dirname, filename);
    if (!fs.existsSync(filepath)) {
        console.warn(`⚠️ 可选文件不存在: ${filename}`);
        return '';
    }
    console.log(`📖 读取: ${filename}`);
    return fs.readFileSync(filepath, 'utf8');
};

// 主应用文件
const styles = readFile('styles.css');
const dataHelpers = readFile('data-helpers.js');
const app = readFile('app.js');
const script = readFile('script.js');

// MAP 系统文件
const mapScifiCss = readFileOptional('map/scifi.css');
const mapGameJs = readFileOptional('map/game.js');
const mapTacticalViewJs = readFileOptional('map/tacticalView.js');
const mapPkmdataJs = readFileOptional('map/data/pkmdata.js');
const mapPokemonEngineJs = readFileOptional('map/pokemonEngine.js');
const mapLocationContextJs = readFileOptional('map/locationContext.js');
const mapInfoJson = readFileOptional('map/data/mapinfo.json');

console.log('\n✅ 文件读取完成\n');

// 转义反引号和 ${} 用于嵌入到模板字符串
const escapeForTemplate = (str) => {
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
};

// 转义字符串用于 JS 字符串字面量（单引号）
const escapeForJsString = (str) => {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${')
        .replace(/<\/script>/gi, "<' + '/script>");
};

// 构建 MAP iframe HTML 内容的 parts.push 语句
function buildMapIframeHtmlParts() {
    if (!mapScifiCss) return "    parts.push('');";
    
    const lines = [];
    lines.push("    parts.push('<!DOCTYPE html>');");
    lines.push("    parts.push('<html lang=\"en\">');");
    lines.push("    parts.push('<head>');");
    lines.push("    parts.push('<meta charset=\"UTF-8\">');");
    lines.push("    parts.push('<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\">');");
    lines.push("    parts.push('<title>RHODIA CMD SYSTEM</title>');");
    lines.push("    parts.push('<link href=\"https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css\" rel=\"stylesheet\">');");
    lines.push("    parts.push('<style>');");
    lines.push("    parts.push('" + escapeForJsString(mapScifiCss) + "');");
    lines.push("    parts.push('</style>');");
    lines.push("    parts.push('</head>');");
    lines.push("    parts.push('<body>');");
    
    // HTML body content
    const bodyHtml = `
    <div class="scanline"></div>
    <div id="journey-panel" class="hidden">
        <div class="panel-header">
            <span style="color:var(--highlight); font-weight:800; letter-spacing:1px;">
                <i class="ri-route-line"></i> FLIGHT PLAN
            </span>
            <button onclick="window.RouteSystem && RouteSystem.toggle()" class="close-btn" title="CLOSE">
                <i class="ri-close-fill"></i>
            </button>
        </div>
        <div class="route-dashboard">
            <div class="stat-box"><div class="label">DIST</div><div class="val" id="route-dist">0m</div></div>
            <div class="stat-box"><div class="label">LEGS</div><div class="val" id="route-legs">0</div></div>
            <div class="stat-box"><div class="label">RISK</div><div class="val" id="route-risk" style="color:#2ecc71">--</div></div>
        </div>
        <div id="route-steps"></div>
        <div class="panel-footer">
            <button class="nav-btn reset" onclick="window.RouteSystem && RouteSystem.reset()"><i class="ri-refresh-line"></i> RESET</button>
            <button class="nav-btn commit" onclick="window.RouteSystem && RouteSystem.toggle()"><i class="ri-check-double-line"></i> EXECUTE</button>
        </div>
    </div>
    <div id="ui-layer">
        <div class="ui-header">
            <div>
                <h1>RHODIA <span style="font-weight:400; font-size: 0.8em; opacity: 0.6;">OS</span></h1>
                <div class="subtitle">TACTICAL COMMAND // VER 1.5</div>
            </div>
            <button id="layer-toggle-btn" onclick="toggleLayerMenu()">
                <i class="ri-stack-line"></i> LAYERS
            </button>
        </div>
        <div id="layer-panel-content" class="collapsed">
            <div class="layer-control-actions">
                <span onclick="toggleAllLayers(true)">ALL ON</span>
                <span style="opacity: 0.3">|</span>
                <span onclick="toggleAllLayers(false)">ALL OFF</span>
            </div>
            <div id="layer-toggles"></div>
        </div>
    </div>
    <div id="tooltip"></div>
    <div id="canvas-wrapper"><canvas id="gameCanvas"></canvas></div>
    <div id="map-controls">
        <button class="map-btn" onclick="modifyZoom(0.2)" title="ZOOM IN"><i class="ri-add-line"></i></button>
        <button class="map-btn" onclick="modifyZoom(-0.2)" title="ZOOM OUT"><i class="ri-subtract-line"></i></button>
        <div style="height: 10px;"></div>
        <button class="map-btn" onclick="centerCameraOnPlayer()" title="LOCATE SQUAD"><i class="ri-crosshair-2-line"></i></button>
        <div style="height: 10px;"></div>
        <button class="map-btn accent" onclick="window.RouteSystem && RouteSystem.toggle()" title="SET ROUTE"><i class="ri-map-pin-add-line"></i></button>
        <div style="height: 10px;"></div>
        <button class="map-btn" onclick="showLocationContext()" title="LOCATION INFO"><i class="ri-map-pin-line"></i></button>
    </div>
    <div id="bottom-dock">
        <div class="info-card">
            <div class="label">SQUAD STATUS</div>
            <div class="val" style="color:#2ecc71">OPTIMAL</div>
            <div class="label" style="margin-top: 4px;">GRID REF</div>
            <div class="val" id="ui-coords" style="color:var(--accent)">--.--</div>
        </div>
        <button id="action-btn" onclick="toggleTacticalMode()" class="action-btn">
            <i class="ri-focus-2-line"></i> <span id="action-btn-text">TACTICAL DIVE</span>
        </button>
    </div>
    <div id="location-context-modal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:2px solid var(--accent);border-radius:8px;padding:20px;max-width:500px;max-height:80vh;overflow-y:auto;z-index:10001;font-family:monospace;font-size:12px;white-space:pre-wrap;color:#e0e0e0;box-shadow:0 0 30px rgba(0,200,255,0.3);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid var(--accent);padding-bottom:10px;">
            <span style="color:var(--highlight);font-weight:bold;"><i class="ri-map-pin-line"></i> LOCATION CONTEXT</span>
            <button id="location-close-btn" style="background:none;border:none;color:#ff6b6b;cursor:pointer;font-size:20px;padding:5px 10px;">✕</button>
        </div>
        <div id="location-context-content" style="min-height:100px;"></div>
    </div>
    <div id="location-context-backdrop" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;"></div>`;
    
    lines.push("    parts.push('" + escapeForJsString(bodyHtml) + "');");
    
    // Scripts
    lines.push("    parts.push('<script>');");
    lines.push("    parts.push('" + escapeForJsString(mapTacticalViewJs) + "');");
    lines.push("    parts.push('<' + '/script>');");
    
    lines.push("    parts.push('<script>');");
    lines.push("    parts.push('" + escapeForJsString(mapPkmdataJs) + "');");
    lines.push("    parts.push('<' + '/script>');");
    
    lines.push("    parts.push('<script>');");
    lines.push("    parts.push('" + escapeForJsString(mapGameJs) + "');");
    lines.push("    parts.push('<' + '/script>');");
    
    lines.push("    parts.push('<script>');");
    lines.push("    parts.push('" + escapeForJsString(mapPokemonEngineJs) + "');");
    lines.push("    parts.push('<' + '/script>');");
    
    lines.push("    parts.push('<script>');");
    lines.push("    parts.push('" + escapeForJsString(mapLocationContextJs) + "');");
    lines.push("    parts.push('<' + '/script>');");
    
    lines.push("    parts.push('<script>');");
    lines.push("    parts.push('window.MAPINFO_DATA = " + escapeForJsString(mapInfoJson || 'null') + ";');");
    lines.push("    parts.push('<' + '/script>');");
    
    // Inline functions
    const inlineFunctions = `
        function toggleLayerMenu() {
            const panel = document.getElementById('layer-panel-content');
            panel.classList.toggle('collapsed');
            const btn = document.getElementById('layer-toggle-btn');
            btn.classList.toggle('active');
        }
        function showLocationContext() {
            if (!window.LocationContextGenerator) { alert('位置系统未就绪'); return; }
            let gx, gy;
            if (window.playerState && typeof window.playerState.gx === 'number') {
                gx = window.playerState.gx;
                gy = window.playerState.gy;
            } else if (window.TacticalSystem && window.TacticalSystem.isActive && window.TacticalSystem.playerGrid) {
                gx = window.TacticalSystem.playerGrid.x;
                gy = window.TacticalSystem.playerGrid.y;
            } else { alert('玩家位置未初始化'); return; }
            try {
                const contextText = LocationContextGenerator.generateContextText(gx, gy);
                document.getElementById('location-context-content').textContent = contextText || '无法获取位置信息';
            } catch(e) {
                console.error('[LocationContext] Error:', e);
                document.getElementById('location-context-content').textContent = '错误: ' + e.message;
            }
            document.getElementById('location-context-modal').style.display = 'block';
            document.getElementById('location-context-backdrop').style.display = 'block';
        }
        function hideLocationContext() {
            document.getElementById('location-context-modal').style.display = 'none';
            document.getElementById('location-context-backdrop').style.display = 'none';
        }
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('location-close-btn').addEventListener('click', hideLocationContext);
            document.getElementById('location-context-backdrop').addEventListener('click', hideLocationContext);
        });`;
    
    lines.push("    parts.push('<script>');");
    lines.push("    parts.push('" + escapeForJsString(inlineFunctions) + "');");
    lines.push("    parts.push('<' + '/script>');");
    
    lines.push("    parts.push('</body>');");
    lines.push("    parts.push('</html>');");
    
    return lines.join('\n');
}

// 构建 MAP iframe HTML 内容（保留用于本地开发）
function buildMapIframeHtml() {
    if (!mapScifiCss) return '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>RHODIA CMD SYSTEM</title>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    <style>
${mapScifiCss}
    </style>
</head>
<body>
    <div class="scanline"></div>
    <div id="journey-panel" class="hidden">
        <div class="panel-header">
            <span style="color:var(--highlight); font-weight:800; letter-spacing:1px;">
                <i class="ri-route-line"></i> FLIGHT PLAN
            </span>
            <button onclick="window.RouteSystem && RouteSystem.toggle()" class="close-btn" title="CLOSE">
                <i class="ri-close-fill"></i>
            </button>
        </div>
        <div class="route-dashboard">
            <div class="stat-box"><div class="label">DIST</div><div class="val" id="route-dist">0m</div></div>
            <div class="stat-box"><div class="label">LEGS</div><div class="val" id="route-legs">0</div></div>
            <div class="stat-box"><div class="label">RISK</div><div class="val" id="route-risk" style="color:#2ecc71">--</div></div>
        </div>
        <div id="route-steps"></div>
        <div class="panel-footer">
            <button class="nav-btn reset" onclick="window.RouteSystem && RouteSystem.reset()"><i class="ri-refresh-line"></i> RESET</button>
            <button class="nav-btn commit" onclick="window.RouteSystem && RouteSystem.toggle()"><i class="ri-check-double-line"></i> EXECUTE</button>
        </div>
    </div>
    <div id="ui-layer">
        <div class="ui-header">
            <div>
                <h1>RHODIA <span style="font-weight:400; font-size: 0.8em; opacity: 0.6;">OS</span></h1>
                <div class="subtitle">TACTICAL COMMAND // VER 1.5</div>
            </div>
            <button id="layer-toggle-btn" onclick="toggleLayerMenu()">
                <i class="ri-stack-line"></i> LAYERS
            </button>
        </div>
        <div id="layer-panel-content" class="collapsed">
            <div class="layer-control-actions">
                <span onclick="toggleAllLayers(true)">ALL ON</span>
                <span style="opacity: 0.3">|</span>
                <span onclick="toggleAllLayers(false)">ALL OFF</span>
            </div>
            <div id="layer-toggles"></div>
        </div>
    </div>
    <div id="tooltip"></div>
    <div id="canvas-wrapper"><canvas id="gameCanvas"></canvas></div>
    <div id="map-controls">
        <button class="map-btn" onclick="modifyZoom(0.2)" title="ZOOM IN"><i class="ri-add-line"></i></button>
        <button class="map-btn" onclick="modifyZoom(-0.2)" title="ZOOM OUT"><i class="ri-subtract-line"></i></button>
        <div style="height: 10px;"></div>
        <button class="map-btn" onclick="centerCameraOnPlayer()" title="LOCATE SQUAD"><i class="ri-crosshair-2-line"></i></button>
        <div style="height: 10px;"></div>
        <button class="map-btn accent" onclick="window.RouteSystem && RouteSystem.toggle()" title="SET ROUTE"><i class="ri-map-pin-add-line"></i></button>
        <div style="height: 10px;"></div>
        <button class="map-btn" onclick="showLocationContext()" title="LOCATION INFO"><i class="ri-map-pin-line"></i></button>
    </div>
    <div id="bottom-dock">
        <div class="info-card">
            <div class="label">SQUAD STATUS</div>
            <div class="val" style="color:#2ecc71">OPTIMAL</div>
            <div class="label" style="margin-top: 4px;">GRID REF</div>
            <div class="val" id="ui-coords" style="color:var(--accent)">--.--</div>
        </div>
        <button id="action-btn" onclick="toggleTacticalMode()" class="action-btn">
            <i class="ri-focus-2-line"></i> <span id="action-btn-text">TACTICAL DIVE</span>
        </button>
    </div>
    <div id="location-context-modal" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:2px solid var(--accent);border-radius:8px;padding:20px;max-width:500px;max-height:80vh;overflow-y:auto;z-index:10001;font-family:monospace;font-size:12px;white-space:pre-wrap;color:#e0e0e0;box-shadow:0 0 30px rgba(0,200,255,0.3);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid var(--accent);padding-bottom:10px;">
            <span style="color:var(--highlight);font-weight:bold;"><i class="ri-map-pin-line"></i> LOCATION CONTEXT</span>
            <button id="location-close-btn" style="background:none;border:none;color:#ff6b6b;cursor:pointer;font-size:20px;padding:5px 10px;">✕</button>
        </div>
        <div id="location-context-content" style="min-height:100px;"></div>
    </div>
    <div id="location-context-backdrop" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;"></div>
    <script>
${mapTacticalViewJs}
    <\/script>
    <script>
${mapPkmdataJs}
    <\/script>
    <script>
${mapGameJs}
    <\/script>
    <script>
${mapPokemonEngineJs}
    <\/script>
    <script>
${mapLocationContextJs}
    <\/script>
    <script>
        window.MAPINFO_DATA = ${mapInfoJson || 'null'};
    <\/script>
    <script>
        function toggleLayerMenu() {
            const panel = document.getElementById('layer-panel-content');
            panel.classList.toggle('collapsed');
            const btn = document.getElementById('layer-toggle-btn');
            btn.classList.toggle('active');
        }
        function showLocationContext() {
            if (!window.LocationContextGenerator) { alert('位置系统未就绪'); return; }
            let gx, gy;
            if (window.playerState && typeof window.playerState.gx === 'number') {
                gx = window.playerState.gx;
                gy = window.playerState.gy;
            } else if (window.TacticalSystem && window.TacticalSystem.isActive && window.TacticalSystem.playerGrid) {
                gx = window.TacticalSystem.playerGrid.x;
                gy = window.TacticalSystem.playerGrid.y;
            } else { alert('玩家位置未初始化'); return; }
            try {
                const contextText = LocationContextGenerator.generateContextText(gx, gy);
                document.getElementById('location-context-content').textContent = contextText || '无法获取位置信息';
            } catch(e) {
                console.error('[LocationContext] Error:', e);
                document.getElementById('location-context-content').textContent = '错误: ' + e.message;
            }
            document.getElementById('location-context-modal').style.display = 'block';
            document.getElementById('location-context-backdrop').style.display = 'block';
        }
        function hideLocationContext() {
            document.getElementById('location-context-modal').style.display = 'none';
            document.getElementById('location-context-backdrop').style.display = 'none';
        }
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('location-close-btn').addEventListener('click', hideLocationContext);
            document.getElementById('location-context-backdrop').addEventListener('click', hideLocationContext);
        });
    <\/script>
<\/body>
<\/html>`;
}

const bundle = `/**
 * PKM Dashboard - iframe 隔离版本
 * 悬浮球用 jQuery（已验证成功），面板用 iframe 隔离样式
 */

(function() {
    'use strict';

    console.log('[PKM] 开始加载...');

    $(function() {
        console.log('[PKM] DOM 就绪');

        // 清理旧版本
        $('[id^="pkm-"]').remove();

        /* =========================================================================
           [NEW] PKM 赛博悬浮终端 - Ver. Dawn Style
           Data Link Stick 设计：矩形毛玻璃材质 + Rotom Phone SVG
           ========================================================================= */

        // 0. 注入全局动画样式 (Keyframes for Float & Pulse)
        const animationStyle = \`
        <style id="pkm-anim-style">
            @keyframes pkm-float-idle {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-6px); }
            }
            @keyframes pkm-scan-pulse {
                0%, 100% { filter: drop-shadow(0 0 0 rgba(112, 161, 255, 0)); }
                50% { filter: drop-shadow(0 0 4px rgba(112, 161, 255, 0.4)); }
            }
        </style>
        \`;
        if (!$('#pkm-anim-style').length) {
            $('head').append(animationStyle);
        }

        // ========== 悬浮终端容器 ==========
        const container = $('<div>')
            .attr('id', 'pkm-container')
            .css({
                'position': 'fixed',
                'inset': '0',
                'pointer-events': 'none',
                'z-index': 2147483647
            });

        // ========== Data Link Stick (矩形终端设备) ==========
        const ball = $('<div>')
            .attr('id', 'pkm-ball')
            .css({
                'position': 'absolute',
                'top': '80px',
                'right': '15px',
                
                // 形状：垂直手机/手持终端比例
                'width': '44px',
                'height': '66px',
                'border-radius': '12px',
                
                // 材质：Ver. Dawn 标志性的高亮毛玻璃
                'background': 'rgba(255, 255, 255, 0.65)',
                'backdrop-filter': 'blur(6px)',
                '-webkit-backdrop-filter': 'blur(6px)',
                
                // 边框：做出实体厚度感
                'border': '2px solid rgba(255, 255, 255, 0.85)',
                'border-bottom': '4px solid #dfe6e9',
                
                // 阴影：锐利的边缘+柔和的扩散
                'box-shadow': '0 8px 20px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255,255,255,0.2)',
                
                // 布局与交互
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'cursor': 'pointer',
                'pointer-events': 'auto',
                'z-index': 2147483647,
                'user-select': 'none',
                
                // 动画基础属性
                'animation': 'pkm-float-idle 3.5s ease-in-out infinite',
                'transition': 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            });

        // ========== SVG 核心图标 (Rotom Phone Device) ==========
        const rotomSvg = \`
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="32 15 36 70" 
             style="width: 26px; height: auto; fill: #636e72; transition: all 0.3s ease; animation: pkm-scan-pulse 4s infinite;">
           <g>
               <path d="M61,19.9H39c-2.5,0-4.5,2-4.5,4.5v51.3c0,2.5,2,4.5,4.5,4.5h22c2.5,0,4.5-2,4.5-4.5V24.4C65.5,21.9,63.5,19.9,61,19.9z M47.9,24.2h4.3c0.3,0,0.5,0.2,0.5,0.5s-0.2,0.5-0.5,0.5h-4.3c-0.3,0-0.5-0.2-0.5-0.5S47.6,24.2,47.9,24.2z M45.3,24.1 c0.3,0,0.5,0.2,0.5,0.5s-0.2,0.5-0.5,0.5s-0.5-0.2-0.5-0.5S45,24.1,45.3,24.1z M50,78.2c-1.5,0-2.8-1.2-2.8-2.8 c0-1.5,1.2-2.8,2.8-2.8c1.5,0,2.8,1.2,2.8,2.8C52.8,76.9,51.5,78.2,50,78.2z M63.2,71H36.8V29h26.4V71z"/>
               <path d="M50,58.5c4.7,0,8.5-3.8,8.5-8.5s-3.8-8.5-8.5-8.5s-8.5,3.8-8.5,8.5S45.3,58.5,50,58.5z M50,47.1c1.6,0,2.9,1.3,2.9,2.9 s-1.3,2.9-2.9,2.9s-2.9-1.3-2.9-2.9S48.4,47.1,50,47.1z M42.6,50h2.8c0,0,0,0,0,0c0,2.6,2.1,4.6,4.6,4.6c2.6,0,4.6-2.1,4.6-4.6 c0,0,0,0,0,0h2.8c0,0,0,0,0,0c0,4.1-3.3,7.4-7.4,7.4C45.9,57.4,42.6,54.1,42.6,50C42.6,50,42.6,50,42.6,50z"/>
           </g>
        </svg>
        \`;

        ball.html(rotomSvg);

        // ========== 交互动画逻辑 (Hover Effects) ==========
        ball.hover(
            // Mouse Enter
            function() {
                $(this).css({
                    'transform': 'scale(1.08) translateY(-2px)',
                    'background': 'rgba(255, 255, 255, 0.95)',
                    'border-bottom-color': '#70a1ff',
                    'box-shadow': '0 12px 28px rgba(112, 161, 255, 0.25), 0 0 0 1px rgba(112, 161, 255, 0.3)',
                    'animation': 'none'
                });
                
                $(this).find('svg').css({
                    'fill': '#0984e3',
                    'filter': 'drop-shadow(0 0 3px rgba(9, 132, 227, 0.5))'
                });
            },
            // Mouse Leave
            function() {
                $(this).css({
                    'transform': 'scale(1) translateY(0)',
                    'background': 'rgba(255, 255, 255, 0.65)',
                    'border-bottom-color': '#dfe6e9',
                    'box-shadow': '0 8px 20px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255,255,255,0.2)',
                    'animation': 'pkm-float-idle 3.5s ease-in-out infinite'
                });
                
                $(this).find('svg').css({
                    'fill': '#636e72',
                    'filter': 'none'
                });
            }
        );

        // ========== 面板覆盖层 ==========
        const overlay = $('<div>')
            .attr('id', 'pkm-overlay')
            .css({
                'position': 'fixed',
                'top': '0',
                'left': '0',
                'right': '0',
                'bottom': '0',
                'width': '100vw',
                'height': '97.5vh',
                'background': 'rgba(0, 0, 0, 0.5)',
                'backdrop-filter': 'blur(4px)',
                'pointer-events': 'auto',
                'display': 'none',
                'align-items': 'center',
                'justify-content': 'center',
                'padding': '1px',
                'z-index': 2147483646,
                'overflow': 'hidden'
            });

        // ========== 布局包装层 (用于让关闭按钮永远吸附在面板上) ==========
        const contentWrapper = $('<div>')
            .css({
                'position': 'relative',
                'width': '100%',
                'max-width': '485px',
                'height': '95vh',
                'max-height': '850px',
                'display': 'flex',
                'flex-direction': 'column',
                'align-items': 'center',
                'justify-content': 'center',
                'pointer-events': 'auto'
            });

        // ========== iframe 面板（完全隔离样式）==========
        const iframe = $('<iframe>')
            .attr('id', 'pkm-iframe')
            .css({
                'width': '100%',
                'height': '100%',
                'border': 'none',
                'border-radius': '24px',
                'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1)',
                'background': '#f2f4f8',
                'overflow': 'hidden',
                'mask-image': 'radial-gradient(white, black)'
            });

        // ========== 现代化的关闭按钮 ==========
        const closeIconSvg = \`
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>\`;

        const closeBtn = $('<div>')
            .attr('id', 'pkm-close')
            .html(closeIconSvg)
            .css({
                'position': 'absolute',
                'top': '-5px',
                'right': '-10px',
                'width': '40px',
                'height': '40px',
                'background': 'rgba(255, 255, 255, 0.85)',
                'backdrop-filter': 'blur(4px)',
                'border-radius': '50%',
                'border': 'none',
                'cursor': 'pointer',
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'color': '#636e72',
                'z-index': 100,
                'pointer-events': 'auto',
                'transition': 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            });

        closeBtn.hover(
            function() {
                $(this).css({
                    'transform': 'rotate(90deg) scale(1.1)',
                    'background': '#ff7675',
                    'color': '#fff'
                });
            },
            function() {
                $(this).css({
                    'transform': 'rotate(0deg) scale(1)',
                    'background': 'rgba(255, 255, 255, 0.85)',
                    'color': '#636e72'
                });
            }
        );

        contentWrapper.append(iframe).append(closeBtn);
        overlay.empty().append(contentWrapper);
        container.append(ball).append(overlay);
        $('body').append(container);

        console.log('[PKM] 悬浮球已添加');

        // ========== iframe 内容 ==========
        const iframeContent = \`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,700;1,900&family=M+PLUS+Rounded+1c:wght@500;800;900&display=swap" rel="stylesheet">
    <style>
${escapeForTemplate(styles)}
    </style>
</head>
<body style="margin:0;padding:0;background:#f2f4f8;overflow:hidden;">
    <div class="ver-dawn-frame">
        <div class="header-section" id="inject-header"></div>
        <div class="nav-wrap" style="display:none;">
            <div class="tab" onclick="switchPage('party', this)">
                <span class="t-txt">PARTY</span>
            </div>
            <div class="tab" id="nav-box" data-t="box" onclick="switchPage('box', this)">
                <span class="t-txt">PC BOX</span>
            </div>
            <div class="tab" data-t="soc" onclick="switchPage('social', this)">
                <span class="t-txt">RELATION</span>
            </div>
            <div class="tab" data-t="cfg" onclick="switchPage('settings', this)">
                <span class="t-txt">CONFIG</span>
            </div>
        </div>
        <div class="main-viewport" id="inject-viewport">
            <div id="pg-dashboard" class="page curr"></div>
            <div id="pg-party" class="page"></div>
            <div id="pg-social" class="page"></div>
            <div id="pg-settings" class="page"></div>
            <div id="pg-box" class="page"></div>
        </div>
    </div>

    <div id="box-ops-console" class="box-ops-bar">
        <div class="ops-text" id="ops-log">
            选择操作对象...
        </div>
        <div class="ops-btn-group">
            <button class="btn-ops-cancel" onclick="resetBoxSelection()">取消 / RESET</button>
            <button class="btn-ops-confirm" onclick="confirmBoxTransfer()">确认传输 / EXE</button>
        </div>
    </div>

    <script src="https://files.catbox.moe/8oxf4b.js"><\\/script>
    <script>
${escapeForTemplate(dataHelpers)}
    <\\/script>
    <script>
${escapeForTemplate(app)}
    <\\/script>
    <script>
${escapeForTemplate(script)}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});
    <\\/script>
</body>
</html>
\`;

        // ========== 从 ERA 获取数据（使用酒馆的 eventEmit/eventOn）==========
        async function getEraVars() {
            return new Promise((resolve) => {
                // 酒馆使用全局函数 eventEmit 和 eventOn
                if (typeof eventEmit === 'undefined' || typeof eventOn === 'undefined') {
                    console.warn('[PKM] eventEmit/eventOn 不可用');
                    resolve(null);
                    return;
                }

                const timeout = setTimeout(() => {
                    console.warn('[PKM] ERA 查询超时');
                    resolve(null);
                }, 3000);

                eventOn('era:queryResult', (detail) => {
                    if (detail.queryType === 'getCurrentVars') {
                        clearTimeout(timeout);
                        resolve(detail.result?.statWithoutMeta || null);
                    }
                }, { once: true });

                eventEmit('era:getCurrentVars');
            });
        }

        // ========== iframe 内容初始化标记 ==========
        let iframeInitialized = false;

        // ========== 事件绑定 ==========
        ball.on('click', async function() {
            console.log('[PKM] 打开面板');
            overlay.css('display', 'flex');
            
            // 只初始化一次 iframe
            if (!iframeInitialized) {
                // 先获取 ERA 数据
                console.log('[PKM] 正在获取 ERA 数据...');
                const eraData = await getEraVars();
                
                // 构建带数据的 iframe 内容
                const dataScript = eraData 
                    ? \`<script>window.eraData = \${JSON.stringify(eraData)};<\\/script>\`
                    : \`<script>window.eraData = null;<\\/script>\`;
                
                const fullContent = iframeContent.replace(
                    '<script src="https://files.catbox.moe/8oxf4b.js">',
                    dataScript + '\\n    <script src="https://files.catbox.moe/8oxf4b.js">'
                );
                
                // 写入 iframe 内容
                const iframeEl = iframe[0];
                const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
                doc.open();
                doc.write(fullContent);
                doc.close();
                
                // 注入回调函数到 iframe 的 window
                if (iframeEl.contentWindow) {
                    iframeEl.contentWindow.pkmSetLeaderCallback = handleLeaderToggle;
                    iframeEl.contentWindow.pkmUpdateSettingsCallback = handleSettingsToggle;
                    console.log('[PKM] ✓ 已注入 pkmSetLeaderCallback 和 pkmUpdateSettingsCallback 到 iframe');
                }
                
                iframeInitialized = true;
                console.log('[PKM] iframe 已初始化');
            }
        });

        closeBtn.on('click', function(e) {
            e.stopPropagation();
            overlay.css('display', 'none');
        });

        overlay.on('click', function(e) {
            if (e.target === overlay[0]) {
                overlay.css('display', 'none');
            }
        });

        ball.on('mouseenter', function() {
            $(this).css('transform', 'scale(1.1)');
        });

        ball.on('mouseleave', function() {
            $(this).css('transform', 'scale(1)');
        });

        // ========== 刷新函数 ==========
        async function refreshDashboard() {
            if (!iframeInitialized) return;
            
            console.log('[PKM] 刷新面板数据...');
            const eraData = await getEraVars();
            
            if (eraData) {
                // 通过 postMessage 发送新数据给 iframe
                const iframeEl = iframe[0];
                if (iframeEl.contentWindow) {
                    iframeEl.contentWindow.postMessage({
                        type: 'PKM_REFRESH',
                        data: eraData
                    }, '*');
                }
            }
        }

        // ========== 事件处理函数（具名函数，便于移除）==========
        function onWriteDone() {
            console.log('[PKM] 检测到 ERA 变量更新，刷新面板');
            refreshDashboard();
            // 检测 transfer_buffer 并处理
            handleTransferBuffer();
        }
        
        function onGenerationEnded() {
            console.log('[PKM] 检测到消息生成完成，刷新面板');
            refreshDashboard();
            // 检测 transfer_buffer 并处理
            handleTransferBuffer();
        }
        
        function onChatChanged() {
            console.log('[PKM] 检测到对话切换，重置面板');
            iframeInitialized = false;
        }

        // ========== Transfer Buffer 处理逻辑 ==========
        let transferBufferLock = false;
        
        async function handleTransferBuffer() {
            // 防抖锁
            if (transferBufferLock) {
                console.log('[PKM] [TRANSFER] 正在处理中，忽略重复请求');
                return;
            }
            
            try {
                const eraVars = await getEraVars();
                const transferBuffer = eraVars?.player?.party?.transfer_buffer;
                
                // 检查 transfer_buffer 是否有内容（name 不为 null）
                if (!transferBuffer || !transferBuffer.name) {
                    return; // 没有需要传输的内容
                }
                
                transferBufferLock = true;
                console.log('[PKM] [TRANSFER] 检测到 transfer_buffer 有内容:', transferBuffer.name);
                
                // 查找第一个空的盒子位置
                const box = eraVars?.player?.box || {};
                const existingKeys = Object.keys(box);
                const existingIds = existingKeys
                    .filter(k => k.startsWith('storage_'))
                    .map(k => parseInt(k.split('_')[1]) || 0);
                const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
                const newBoxKey = \`storage_\${String(nextId).padStart(2, '0')}\`;
                
                // 准备盒子数据（移除 slot 字段）
                const boxData = JSON.parse(JSON.stringify(transferBuffer));
                delete boxData.slot;
                
                // 准备空的 transfer_buffer 结构
                const emptyTransferBuffer = {
                    slot: 7,
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
                        ivs: { hp: null, atk: null, def: null, spa: null, spd: null, spe: null },
                        ev_level: 0,
                        ev_up: 0
                    },
                    notes: null
                };
                
                // 构建 VariableInsert（插入盒子）和 VariableEdit（清空 transfer_buffer）
                const variableInsertData = {
                    player: {
                        box: {
                            [newBoxKey]: boxData
                        }
                    }
                };
                
                const variableEditData = {
                    player: {
                        party: {
                            transfer_buffer: emptyTransferBuffer
                        }
                    }
                };
                
                const variableInsertJson = JSON.stringify(variableInsertData, null, 2);
                const variableEditJson = JSON.stringify(variableEditData, null, 2);
                // 验证 JSON 格式（确保有最外层的 {}）
                if (!variableEditJson.startsWith('{') || !variableEditJson.endsWith('}')) {
                    console.error('[PKM] [TRANSFER] VariableEdit JSON 格式错误:', variableEditJson);
                }
                const variableInsertBlock = \`<VariableInsert>\\n\${variableInsertJson}\\n</VariableInsert>\`;
                const variableEditBlock = \`<VariableEdit>\\n\${variableEditJson}\\n</VariableEdit>\`;
                
                console.log('[PKM] [TRANSFER] 生成 VariableInsert:', variableInsertBlock);
                
                // 获取最近一楼消息
                const lastMessageId = getLastMessageId();
                const messages = getChatMessages(lastMessageId);
                
                if (!messages || messages.length === 0) {
                    console.warn('[PKM] [TRANSFER] 无法获取最近消息');
                    return;
                }
                
                const msg = messages[0];
                let content = msg.message || '';
                
                // 在末尾追加 VariableInsert 和 VariableEdit
                content = content.trim() + '\\n\\n' + variableInsertBlock + '\\n\\n' + variableEditBlock;
                console.log('[PKM] [TRANSFER] 追加传输指令到消息末尾');
                
                // 更新消息
                await setChatMessages([{
                    message_id: lastMessageId,
                    message: content
                }], { refresh: 'affected' });
                
                console.log(\`[PKM] [TRANSFER] ✓ 已将 \${transferBuffer.name} 传输到盒子 \${newBoxKey}\`);
                
                // 立即触发 ERA 变量更新
                if (typeof eventEmit !== 'undefined') {
                    // 先插入盒子
                    eventEmit('era:updateByObject', variableInsertData);
                    // 再清空 transfer_buffer
                    eventEmit('era:updateByObject', variableEditData);
                    console.log('[PKM] [TRANSFER] ✓ ERA 变量已更新');
                }
                
                // 刷新面板
                setTimeout(() => refreshDashboard(), 100);
                
            } catch (e) {
                console.error('[PKM] [TRANSFER] 处理失败:', e);
            } finally {
                // 1秒后解锁
                setTimeout(() => { transferBufferLock = false; }, 1000);
            }
        }

        // ========== 监听 ERA 变化事件 ==========
        if (typeof eventOn !== 'undefined') {
            eventOn('era:writeDone', onWriteDone);
            eventOn('GENERATION_ENDED', onGenerationEnded);
            eventOn('CHAT_CHANGED', onChatChanged);
        }

        // ========== Leader 切换处理 ==========
        let leaderToggleLock = false;
        
        async function handleLeaderToggle(targetSlot) {
            // 防抖锁：防止重复执行
            if (leaderToggleLock) {
                console.log('[PKM] [LEADER] 正在处理中，忽略重复请求');
                return;
            }
            leaderToggleLock = true;
            
            try {
                console.log(\`[PKM] [LEADER] 收到切换请求: \${targetSlot}\`);
                
                // 1. 获取当前队伍数据
                const eraVars = await getEraVars();
                const party = eraVars?.player?.party || {};
                
                if (!party || Object.keys(party).length === 0) {
                    console.warn('[PKM] [LEADER] 队伍为空，无法切换');
                    return;
                }
                
                // 2. 构建 VariableEdit JSON：一个 true，其余 false
                const variableEditData = {
                    player: {
                        party: {}
                    }
                };
                
                // 遍历所有槽位，设置 isLead
                for (let i = 1; i <= 6; i++) {
                    const slotKey = \`slot\${i}\`;
                    const pokemon = party[slotKey];
                    
                    // 只有非空槽位才设置 isLead
                    if (pokemon && pokemon.name) {
                        variableEditData.player.party[slotKey] = {
                            isLead: slotKey === targetSlot
                        };
                    }
                }
                
                const variableEditJson = JSON.stringify(variableEditData, null, 2);
                // 验证 JSON 格式（确保有最外层的 {}）
                if (!variableEditJson.startsWith('{') || !variableEditJson.endsWith('}')) {
                    console.error('[PKM] [LEADER] VariableEdit JSON 格式错误:', variableEditJson);
                }
                const variableEditBlock = \`<VariableEdit>\\n\${variableEditJson}\\n</VariableEdit>\`;
                
                console.log('[PKM] [LEADER] 生成 VariableEdit:', variableEditBlock);
                
                // 3. 获取最近一楼消息
                const lastMessageId = getLastMessageId();
                const messages = getChatMessages(lastMessageId);
                
                if (!messages || messages.length === 0) {
                    console.warn('[PKM] [LEADER] 无法获取最近消息');
                    return;
                }
                
                const msg = messages[0];
                let content = msg.message || '';
                
                // 4. 直接在末尾追加新的 VariableEdit（不删除现有标签）
                content = content.trim() + '\\n\\n' + variableEditBlock;
                console.log('[PKM] [LEADER] 追加新 VariableEdit 到末尾');
                
                // 5. 更新消息
                await setChatMessages([{
                    message_id: lastMessageId,
                    message: content
                }], { refresh: 'affected' });
                
                console.log(\`[PKM] [LEADER] ✓ 已注入 Leader 切换到消息 #\${lastMessageId}\`);
                
                // 6. 立即触发 ERA 变量更新（让前端立即刷新）
                if (typeof eventEmit !== 'undefined') {
                    eventEmit('era:updateByObject', variableEditData);
                    console.log('[PKM] [LEADER] ✓ ERA 变量已更新');
                }
                
                // 7. 刷新面板（延迟执行，避免和锁冲突）
                setTimeout(() => refreshDashboard(), 100);
                
            } catch (e) {
                console.error('[PKM] [LEADER] 切换失败:', e);
            } finally {
                // 1秒后解锁，防止快速连续点击
                setTimeout(() => { leaderToggleLock = false; }, 1000);
            }
        }
        
        // ========== 暴露 Leader 切换函数给 iframe 调用 ==========
        window.pkmSetLeader = handleLeaderToggle;
        console.log('[PKM] ✓ window.pkmSetLeader 已暴露');

        // ========== Settings 切换处理（类似 Leader 逻辑）==========
        let settingsToggleLock = false;
        
        async function handleSettingsToggle(settingsData) {
            if (settingsToggleLock) {
                console.log('[PKM] [SETTINGS] 正在处理中，忽略重复请求');
                return;
            }
            settingsToggleLock = true;
            
            try {
                console.log('[PKM] [SETTINGS] 收到设置更新:', settingsData);
                
                // 1. 构建 VariableEdit JSON
                const variableEditData = {
                    settings: settingsData
                };
                
                const variableEditJson = JSON.stringify(variableEditData, null, 2);
                // 验证 JSON 格式（确保有最外层的 {}）
                if (!variableEditJson.startsWith('{') || !variableEditJson.endsWith('}')) {
                    console.error('[PKM] [SETTINGS] VariableEdit JSON 格式错误:', variableEditJson);
                }
                const variableEditBlock = \`<VariableEdit>\n\${variableEditJson}\n</VariableEdit>\`;
                
                console.log('[PKM] [SETTINGS] 生成 VariableEdit:', variableEditBlock);
                
                // 2. 获取最近一楼消息
                const lastMessageId = getLastMessageId();
                const messages = getChatMessages(lastMessageId);
                
                if (!messages || messages.length === 0) {
                    console.warn('[PKM] [SETTINGS] 无法获取最近消息');
                    return;
                }
                
                const msg = messages[0];
                let content = msg.message || '';
                
                // 3. 直接在末尾追加新的 VariableEdit
                content = content.trim() + '\\n\\n' + variableEditBlock;
                console.log('[PKM] [SETTINGS] 追加新 VariableEdit 到末尾');
                
                // 4. 更新消息
                await setChatMessages([{
                    message_id: lastMessageId,
                    message: content
                }], { refresh: 'affected' });
                
                console.log(\`[PKM] [SETTINGS] ✓ 已注入 Settings 到消息 #\${lastMessageId}\`);
                
                // 5. 立即触发 ERA 变量更新
                if (typeof eventEmit !== 'undefined') {
                    eventEmit('era:updateByObject', variableEditData);
                    console.log('[PKM] [SETTINGS] ✓ ERA 变量已更新');
                }
                
            } catch (e) {
                console.error('[PKM] [SETTINGS] 更新失败:', e);
            } finally {
                setTimeout(() => { settingsToggleLock = false; }, 500);
            }
        }
        
        // ========== 暴露 Settings 切换函数 ==========
        window.pkmUpdateSettings = handleSettingsToggle;
        console.log('[PKM] ✓ window.pkmUpdateSettings 已暴露');

        // ========== 卸载清理函数（退出角色卡时调用）==========
        function unloadPkmUI() {
            console.log('[PKM] UI 脚本开始卸载');
            
            // 移除 DOM 元素
            $('#pkm-container').remove();
            $('#pkm-anim-style').remove();
            
            // 清理事件监听
            if (typeof eventRemoveListener !== 'undefined') {
                eventRemoveListener('era:writeDone', onWriteDone);
                eventRemoveListener('GENERATION_ENDED', onGenerationEnded);
                eventRemoveListener('CHAT_CHANGED', onChatChanged);
            }
            
            // 清理全局变量
            delete window.pkmDashboard;
            delete window.pkmSetLeader;
            delete window.pkmUpdateSettings;
            
            // 移除 pagehide 监听器
            window.removeEventListener('pagehide', unloadPkmUI);
            
            console.log('[PKM] UI 脚本卸载完成');
        }
        
        // 监听 pagehide 事件（退出角色卡时触发）
        window.removeEventListener('pagehide', unloadPkmUI);
        window.addEventListener('pagehide', unloadPkmUI);

        // 全局接口
        window.pkmDashboard = {
            show: async () => {
                overlay.css('display', 'flex');
                if (!iframeInitialized) {
                    const eraData = await getEraVars();
                    const dataScript = eraData 
                        ? \`<script>window.eraData = \${JSON.stringify(eraData)};<\\/script>\`
                        : \`<script>window.eraData = null;<\\/script>\`;
                    const fullContent = iframeContent.replace(
                        '<script src="https://files.catbox.moe/8oxf4b.js">',
                        dataScript + '\\n    <script src="https://files.catbox.moe/8oxf4b.js">'
                    );
                    const iframeEl = iframe[0];
                    const doc = iframeEl.contentDocument || iframeEl.contentWindow.document;
                    doc.open();
                    doc.write(fullContent);
                    doc.close();
                    iframeInitialized = true;
                }
            },
            hide: () => overlay.css('display', 'none'),
            toggle: async () => {
                if (overlay.css('display') === 'none') {
                    await window.pkmDashboard.show();
                } else {
                    window.pkmDashboard.hide();
                }
            },
            refresh: refreshDashboard
        };

        console.log('[PKM] ✓ 加载成功！点击右上角闪电球');
    });

})();
`;

// 写入
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

fs.writeFileSync(path.join(distDir, 'pkm-iframe.js'), bundle, 'utf8');

console.log('✅ 完成！');
console.log('📦 输出: dist/pkm-iframe.js');
console.log(`📊 大小: ${(bundle.length / 1024).toFixed(2)} KB\n`);
