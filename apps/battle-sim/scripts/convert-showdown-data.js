#!/usr/bin/env node
/**
 * Pokemon Showdown 数据转换脚本
 * 将 TypeScript 格式的 pokedex.ts 和 moves.ts 转换为浏览器可用的纯 JS
 * 
 * 使用方法：
 *   node convert-showdown-data.js
 * 
 * 输出：
 *   - pokedex-data.js  (宝可梦数据库)
 *   - moves-data.js    (技能数据库)
 */

const fs = require('fs');
const path = require('path');

const SHOWDOWN_DIR = path.join(__dirname, 'Pokemon Showdown');
const OUTPUT_DIR = __dirname;

// ============================================================
// 1. 转换 Pokedex (宝可梦数据)
// ============================================================
function convertPokedex() {
    console.log('Converting pokedex.ts...');
    
    const inputPath = path.join(SHOWDOWN_DIR, 'pokedex.ts');
    const outputPath = path.join(OUTPUT_DIR, 'pokedex-data.js');
    
    let content = fs.readFileSync(inputPath, 'utf-8');
    
    // 移除 TypeScript 类型注解
    content = content.replace(
        /^export const Pokedex:\s*import\([^)]+\)\.[^\s=]+ = /m,
        'const POKEDEX = '
    );
    
    // 添加文件头注释
    const header = `/**
 * Pokemon Showdown Pokedex Data
 * 自动生成，请勿手动编辑
 * 来源: https://github.com/smogon/pokemon-showdown/blob/master/data/pokedex.ts
 * 
 * 使用方法:
 *   <script src="pokedex-data.js"></script>
 *   console.log(POKEDEX.pikachu.baseStats);
 */

`;
    
    content = header + content;
    
    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`  -> ${outputPath}`);
    
    // 统计数量
    const count = (content.match(/^\t[a-z]/gm) || []).length;
    console.log(`  -> ${count} Pokemon entries`);
}

// ============================================================
// 2. 转换 Moves - 使用 eval 直接解析，提取纯数据
// ============================================================
function convertMoves() {
    console.log('Converting moves.ts (extracting static data only)...');
    
    const inputPath = path.join(SHOWDOWN_DIR, 'moves.ts');
    const outputPath = path.join(OUTPUT_DIR, 'moves-data.js');
    
    let content = fs.readFileSync(inputPath, 'utf-8');
    
    // 移除 TypeScript 类型注解
    content = content.replace(
        /^export const Moves:\s*import\([^)]+\)\.[^\s=]+ = /m,
        'const Moves = '
    );
    
    // 移除注释
    content = content.replace(/^\/\/.*$/gm, '');
    
    // 移除所有函数 - 使用递归匹配大括号
    // 匹配形如: funcName(args) { ... } 或 funcName: function(args) { ... }
    function removeFunctions(str) {
        let result = str;
        let changed = true;
        
        while (changed) {
            changed = false;
            
            // 移除方法定义: name(args) { body }
            // 需要正确匹配嵌套大括号
            const funcRegex = /(\w+)\s*\([^)]*\)\s*\{/g;
            let match;
            
            while ((match = funcRegex.exec(result)) !== null) {
                const startIdx = match.index;
                const braceStart = result.indexOf('{', startIdx);
                
                // 找到匹配的结束大括号
                let depth = 1;
                let endIdx = braceStart + 1;
                while (depth > 0 && endIdx < result.length) {
                    if (result[endIdx] === '{') depth++;
                    if (result[endIdx] === '}') depth--;
                    endIdx++;
                }
                
                if (depth === 0) {
                    // 检查这是否是一个方法定义（不是对象字面量）
                    const beforeMatch = result.substring(Math.max(0, startIdx - 10), startIdx);
                    if (!beforeMatch.match(/:\s*$/)) {
                        // 这是一个方法定义，替换为 null
                        const funcName = match[1];
                        const replacement = `${funcName}: null`;
                        result = result.substring(0, startIdx) + replacement + result.substring(endIdx);
                        changed = true;
                        break;
                    }
                }
            }
        }
        
        return result;
    }
    
    content = removeFunctions(content);
    
    // 移除 TypeScript 特有语法
    content = content.replace(/!\./g, '.'); // 非空断言
    content = content.replace(/!,/g, ',');
    content = content.replace(/!\)/g, ')');
    content = content.replace(/!\]/g, ']');
    content = content.replace(/!\}/g, '}');
    content = content.replace(/ as \w+/g, '');
    content = content.replace(/<[A-Za-z\[\]|, ]+>/g, '');
    
    // 移除 condition 块（包含复杂逻辑）
    function removeConditionBlocks(str) {
        let result = str;
        const conditionRegex = /condition:\s*\{/g;
        let match;
        
        while ((match = conditionRegex.exec(result)) !== null) {
            const startIdx = match.index;
            const braceStart = result.indexOf('{', startIdx);
            
            let depth = 1;
            let endIdx = braceStart + 1;
            while (depth > 0 && endIdx < result.length) {
                if (result[endIdx] === '{') depth++;
                if (result[endIdx] === '}') depth--;
                endIdx++;
            }
            
            if (depth === 0) {
                // 移除整个 condition 块
                result = result.substring(0, startIdx) + 'condition: null' + result.substring(endIdx);
            }
        }
        
        return result;
    }
    
    content = removeConditionBlocks(content);
    
    // 添加文件头
    const header = `/**
 * Pokemon Showdown Moves Data
 * 自动生成，请勿手动编辑
 * 来源: https://github.com/smogon/pokemon-showdown/blob/master/data/moves.ts
 * 
 * 注意: 函数回调、condition 块已被移除，仅保留静态数据
 * 
 * 使用方法:
 *   <script src="moves-data.js"></script>
 *   console.log(MOVES.thunderbolt.basePower); // 90
 */

`;
    
    // 重命名变量
    content = content.replace(/const Moves = /, 'const MOVES = ');
    content = header + content;
    
    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`  -> ${outputPath}`);
    
    // 统计数量
    const count = (content.match(/^\t[a-z"]/gm) || []).length;
    console.log(`  -> ${count} Move entries`);
}

// ============================================================
// 3. 验证生成的文件
// ============================================================
function validateFiles() {
    console.log('Validating generated files...');
    
    const pokedexPath = path.join(OUTPUT_DIR, 'pokedex-data.js');
    const movesPath = path.join(OUTPUT_DIR, 'moves-data.js');
    
    // 验证 pokedex
    try {
        const vm = require('vm');
        const pokedexContent = fs.readFileSync(pokedexPath, 'utf-8');
        vm.runInNewContext(pokedexContent);
        console.log('  -> pokedex-data.js: OK');
    } catch (e) {
        console.log('  -> pokedex-data.js: ERROR -', e.message);
    }
    
    // 验证 moves
    try {
        const vm = require('vm');
        const movesContent = fs.readFileSync(movesPath, 'utf-8');
        vm.runInNewContext(movesContent);
        console.log('  -> moves-data.js: OK');
    } catch (e) {
        console.log('  -> moves-data.js: ERROR -', e.message.substring(0, 100));
    }
}

// ============================================================
// Main
// ============================================================
function main() {
    console.log('='.repeat(60));
    console.log('Pokemon Showdown Data Converter');
    console.log('='.repeat(60));
    
    const pokedexPath = path.join(SHOWDOWN_DIR, 'pokedex.ts');
    const movesPath = path.join(SHOWDOWN_DIR, 'moves.ts');
    const hasPokedex = fs.existsSync(pokedexPath);
    const hasMoves = fs.existsSync(movesPath);
    
    if (!hasPokedex) {
        console.warn('Warning: pokedex.ts not found. Skipping pokedex-data.js generation.');
    }
    if (!hasMoves) {
        console.error('Error: moves.ts not found in', SHOWDOWN_DIR);
        process.exit(1);
    }
    
    if (hasPokedex) {
        convertPokedex();
    }
    convertMoves();
    validateFiles();
    
    console.log('='.repeat(60));
    console.log('Done! Files generated:');
    console.log('  - pokedex-data.js');
    console.log('  - moves-data.js');
    console.log('');
    console.log('Usage in HTML:');
    console.log('  <script src="pokedex-data.js"></script>');
    console.log('  <script src="moves-data.js"></script>');
    console.log('='.repeat(60));
}

main();
