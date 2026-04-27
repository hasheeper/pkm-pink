/**
 * 完全模仿 ERA 框架的注入方式
 * 使用 jQuery 和 $(document).ready
 */

(function() {
    'use strict';

    console.log('[PKM-JQUERY] 开始初始化（模仿 ERA 方式）...');

    // 等待 DOM 完全加载（模仿 ERA 的 $(() => {...})）
    $(function() {
        console.log('[PKM-JQUERY] DOM 已就绪，开始注入...');

        // 清理旧版本
        $('[id^="pkm-"]').remove();

        // 创建容器（绕过 #sheld 的定位问题）
        const container = $('<div>')
            .attr('id', 'pkm-container-jquery')
            .css({
                'position': 'fixed',
                'inset': '0',
                'pointer-events': 'none',
                'z-index': 2147483647
            });

        // 使用 jQuery 创建悬浮球
        const ball = $('<div>')
            .attr('id', 'pkm-ball-jquery')
            .css({
                'position': 'absolute',  // 相对于容器定位
                'top': '20px',  // 使用 top 而不是 bottom（酒馆中 bottom 定位有问题）
                'right': '20px',
                'width': '60px',
                'height': '60px',
                'border-radius': '50%',
                'background': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'box-shadow': '0 4px 12px rgba(102, 126, 234, 0.6), 0 8px 24px rgba(118, 75, 162, 0.4)',
                'cursor': 'pointer',
                'pointer-events': 'auto',  // 容器禁用，球启用
                'display': 'flex',
                'align-items': 'center',
                'justify-content': 'center',
                'font-size': '32px',
                'color': 'white',
                'user-select': 'none',
                'line-height': '60px',
                'text-align': 'center'
            })
            .text('⚡');

        // 组装：球放入容器
        container.append(ball);

        // 添加到 body
        $('body').append(container);

        console.log('[PKM-JQUERY] 悬浮球已添加到 body');

        // 验证
        setTimeout(() => {
            const check = $('#pkm-ball-jquery');
            
            if (check.length === 0) {
                console.error('[PKM-JQUERY] ✗ 元素未找到');
                return;
            }

            const el = check[0];
            const rect = el.getBoundingClientRect();

            console.log('[PKM-JQUERY] 位置:', {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });

            console.log('[PKM-JQUERY] 尺寸:', {
                offsetWidth: el.offsetWidth,
                offsetHeight: el.offsetHeight,
                clientWidth: el.clientWidth,
                clientHeight: el.clientHeight
            });

            if (el.offsetWidth > 0 && el.offsetHeight > 0) {
                console.log('[PKM-JQUERY] ✓✓✓ 成功！悬浮球已正常渲染！');
                console.log('[PKM-JQUERY] 请查看浏览器右下角，应该能看到紫色渐变的闪电球！');

                // 绑定点击事件（使用 jQuery）
                ball.on('click', function() {
                    console.log('[PKM-JQUERY] 悬浮球被点击！');
                    alert('🎉 成功！悬浮球工作正常！\n\n这是使用 jQuery 方式（模仿 ERA）的版本。');
                });

                // 添加悬停效果（使用 jQuery）
                ball.on('mouseenter', function() {
                    $(this).css({
                        'transform': 'scale(1.1)',
                        'box-shadow': '0 6px 16px rgba(102, 126, 234, 0.8), 0 12px 32px rgba(118, 75, 162, 0.6)'
                    });
                });

                ball.on('mouseleave', function() {
                    $(this).css({
                        'transform': 'scale(1)',
                        'box-shadow': '0 4px 12px rgba(102, 126, 234, 0.6), 0 8px 24px rgba(118, 75, 162, 0.4)'
                    });
                });

            } else {
                console.error('[PKM-JQUERY] ✗ 尺寸仍然是 0');
                console.error('[PKM-JQUERY] offsetWidth:', el.offsetWidth);
                console.error('[PKM-JQUERY] 计算样式:', {
                    display: getComputedStyle(el).display,
                    position: getComputedStyle(el).position,
                    width: getComputedStyle(el).width,
                    height: getComputedStyle(el).height
                });
            }
        }, 200);

        // 全局接口
        window.pkmJquery = {
            check: () => {
                const ball = $('#pkm-ball-jquery');
                if (ball.length === 0) {
                    console.log('悬浮球不存在');
                    return false;
                }

                const el = ball[0];
                console.log('=== 诊断信息 ===');
                console.log('jQuery 对象:', ball);
                console.log('DOM 元素:', el);
                console.log('位置:', el.getBoundingClientRect());
                console.log('尺寸:', {
                    offsetWidth: el.offsetWidth,
                    offsetHeight: el.offsetHeight,
                    clientWidth: el.clientWidth,
                    clientHeight: el.clientHeight
                });
                console.log('jQuery css():', {
                    width: ball.css('width'),
                    height: ball.css('height'),
                    display: ball.css('display'),
                    position: ball.css('position')
                });

                return el.offsetWidth > 0;
            },
            remove: () => {
                $('#pkm-ball-jquery').remove();
                console.log('悬浮球已移除');
            }
        };

        console.log('[PKM-JQUERY] ✓ 脚本加载完成');
        console.log('[PKM-JQUERY] 可用接口: window.pkmJquery.check()');
    });

})();
