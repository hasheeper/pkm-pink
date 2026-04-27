import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // GitHub Pages 部署路径（仓库名）
    // Unified repository: hasheeper.github.io/pkm-pink/apps/battle-sim/
    base: '/pkm-pink/apps/battle-sim/',
    
    // 开发服务器配置
    server: {
        port: 3000,
        open: true
    },
    
    // 构建配置
    build: {
        outDir: 'dist',
        // 生成传统浏览器兼容的代码
        target: 'es2015',
        // 资源内联阈值 - 设为 0 禁止内联，保持外部引用
        assetsInlineLimit: 0,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        },
        // 复制 data 目录到 dist
        copyPublicDir: true
    },
    
    // 解析配置
    resolve: {
        alias: {
            '@': resolve(__dirname, '.'),
            '@data': resolve(__dirname, 'data'),
            '@engine': resolve(__dirname, 'engine'),
            '@battle': resolve(__dirname, 'battle'),
            '@ui': resolve(__dirname, 'ui'),
            '@systems': resolve(__dirname, 'systems'),
            '@mechanics': resolve(__dirname, 'mechanics')
        }
    },
    
    // 静态资源目录 - data 目录包含 sfx, bgm, avatar 等运行时资源
    // 这些文件会被复制到 dist 根目录
    publicDir: 'public',
    
    // 排除 ST 目录（酒馆插件独立）
    // ST 目录不参与 Vite 构建
});
