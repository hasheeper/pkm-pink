#!/usr/bin/env node
/**
 * Pokemon Showdown 数据转换脚本
 * 将 TypeScript 格式的 pokedex.ts 和 moves.ts 转换为浏览器可用的纯 JS
 * 
 * 使用方法：
 *   node convert-showdown-data.js
 * 
 * 输出：
 *   - ../../shared/pokedex-data.js  (宝可梦数据库)
 *   - moves-data.js                 (技能数据库)
 */

const fs = require('fs');
const path = require('path');

const SHOWDOWN_DIR = path.join(__dirname, 'Pokemon Showdown');
const OUTPUT_DIR = __dirname;
const SHARED_DIR = path.resolve(__dirname, '../../shared');
const POKEDEX_OUTPUT_PATH = path.join(SHARED_DIR, 'pokedex-data.js');

const POKEDEX_RUNTIME_FOOTER = `

// ============================================
// 统一标签映射 (Engine Tags)
// 用于 Chronal Rift 等机制的宝可梦分类
// ============================================

/**
 * 人造/机械类宝可梦 ID 列表
 * 在时空裂隙中触发【技能黑箱】效果
 */
const ARTIFICIAL_POKEMON = [
    'porygon', 'porygon2', 'porygonz',
    'castform', 'castformsunny', 'castformrainy', 'castformsnowy',
    'ditto',
    'magnemite', 'magneton', 'magnezone',
    'voltorb', 'electrode',
    'klink', 'klang', 'klinklang',
    'beldum', 'metang', 'metagross',
    'varoom', 'revavroom',
    'duraludon', 'archaludon',
    'melmetal', 'meltan',
    'mewtwo', 'mewtwomegax', 'mewtwomegay',
    'genesect', 'genesectburn', 'genesectchill', 'genesectdouse', 'genesectshock',
    'typenull', 'silvally',
    'volcanion',
    'baltoy', 'claydol',
    'golett', 'golurk',
    'magearna', 'magearnaoriginal',
    'bronzor', 'bronzong',
    'rotom', 'rotomheat', 'rotomwash', 'rotomfrost', 'rotomfan', 'rotommow'
];

/**
 * 洗翠形态宝可梦 ID 列表
 * 在时空裂隙中享受【起源共鸣】加成（古武无惩罚）
 */
const HISUIAN_POKEMON = [
    'decidueyehisui', 'typhlosionhisui', 'samurotthisui',
    'growlithehisui', 'arcaninehisui',
    'voltorbhisui', 'electrodehisui',
    'sneaselhisui',
    'zoruahisui', 'zoroarkhisui',
    'braviaryhisui',
    'sliggoohisui', 'goodrahisui',
    'avalugghisui',
    'lilliganthisui',
    'qwilfishhisui',
    'wyrdeer', 'kleavor', 'ursaluna', 'ursalunabloodmoon',
    'basculegion', 'basculegionf',
    'sneasler', 'overqwil',
    'enamorus', 'enamorustherian'
];

/**
 * 起源形态宝可梦 ID 列表
 * 在时空裂隙中享受【起源共鸣】加成
 */
const ORIGIN_POKEMON = [
    'giratinaorigin',
    'dialgaorigin',
    'palkiaorigin'
];

/**
 * 究极异兽 ID 列表
 * 在时空裂隙中获得【异兽气场】伤害减免
 */
const ULTRA_BEAST_POKEMON = [
    'nihilego', 'buzzwole', 'pheromosa', 'xurkitree',
    'celesteela', 'kartana', 'guzzlord',
    'poipole', 'naganadel',
    'stakataka', 'blacephalon',
    'necrozma', 'necrozmaduskmane', 'necrozmadawnwings', 'necrozmaultra'
];

/**
 * 古代悖谬种 ID 列表
 */
const PARADOX_PAST_POKEMON = [
    'greattusk', 'screamtail', 'brutebonnet', 'fluttermane',
    'slitherwing', 'sandyshocks', 'roaringmoon',
    'walkingwake', 'gougingfire', 'ragingbolt',
    'koraidon'
];

/**
 * 未来悖谬种 ID 列表
 */
const PARADOX_FUTURE_POKEMON = [
    'irontreads', 'ironbundle', 'ironhands', 'ironjugulis',
    'ironmoth', 'ironthorns', 'ironvaliant',
    'ironleaves', 'ironboulder', 'ironcrown',
    'miraidon'
];

function isPokemonInCategory(pokemonId, category) {
    const id = (pokemonId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    switch (category) {
        case 'artificial':
            return ARTIFICIAL_POKEMON.includes(id);
        case 'hisuian':
            return HISUIAN_POKEMON.includes(id) || id.includes('hisui');
        case 'origin':
            return ORIGIN_POKEMON.includes(id) || id.includes('origin');
        case 'ultrabeast':
            return ULTRA_BEAST_POKEMON.includes(id);
        case 'paradox_past':
            return PARADOX_PAST_POKEMON.includes(id);
        case 'paradox_future':
            return PARADOX_FUTURE_POKEMON.includes(id);
        case 'paradox':
            return PARADOX_PAST_POKEMON.includes(id) || PARADOX_FUTURE_POKEMON.includes(id);
        default:
            return false;
    }
}

function getPokemonEngineTags(pokemonId) {
    const tags = [];
    const id = (pokemonId || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (ARTIFICIAL_POKEMON.includes(id)) tags.push('Artificial');
    if (HISUIAN_POKEMON.includes(id) || id.includes('hisui')) tags.push('Hisuian');
    if (ORIGIN_POKEMON.includes(id) || id.includes('origin')) tags.push('Origin');
    if (ULTRA_BEAST_POKEMON.includes(id)) tags.push('Ultra Beast');
    if (PARADOX_PAST_POKEMON.includes(id)) tags.push('Paradox', 'Paradox Past');
    if (PARADOX_FUTURE_POKEMON.includes(id)) tags.push('Paradox', 'Paradox Future');

    return tags;
}

root.POKEDEX = POKEDEX;
root.POKEMON_CATEGORIES = {
    ARTIFICIAL: ARTIFICIAL_POKEMON,
    HISUIAN: HISUIAN_POKEMON,
    ORIGIN: ORIGIN_POKEMON,
    ULTRA_BEAST: ULTRA_BEAST_POKEMON,
    PARADOX_PAST: PARADOX_PAST_POKEMON,
    PARADOX_FUTURE: PARADOX_FUTURE_POKEMON,
    isPokemonInCategory,
    getPokemonEngineTags
};
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
`;

// ============================================================
// 1. 转换 Pokedex (宝可梦数据)
// ============================================================
function convertPokedex() {
    console.log('Converting pokedex.ts...');
    
    const inputPath = path.join(SHOWDOWN_DIR, 'pokedex.ts');
    const outputPath = POKEDEX_OUTPUT_PATH;
    
    let content = fs.readFileSync(inputPath, 'utf-8');
    
    // 移除 TypeScript 类型注解
    content = content.replace(
        /^export const Pokedex:\s*import\([^)]+\)\.[^\s=]+ = /m,
        'var POKEDEX = '
    );
    content = content.replace(
        /(\tporygon2:\s*{[\s\S]*?\n\t\tcolor: "Red",\n)(?!\t\ttags:)/,
        '$1\t\ttags: ["Artificial"],\n'
    );
    
    // 添加文件头注释
    const header = `/**
 * Pokemon Showdown Pokedex Data
 * 自动生成，请勿手动编辑
 * 来源: https://github.com/smogon/pokemon-showdown/blob/master/data/pokedex.ts
 * 
 * 使用方法:
 *   <script src="../shared/pokedex-data.js"></script>
 *   console.log(POKEDEX.pikachu.baseStats);
 */

(function(root) {
`;
    
    content = header + content + POKEDEX_RUNTIME_FOOTER;
    
    fs.mkdirSync(SHARED_DIR, { recursive: true });
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
    
    const pokedexPath = POKEDEX_OUTPUT_PATH;
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
    console.log('  - ../../shared/pokedex-data.js');
    console.log('  - moves-data.js');
    console.log('');
    console.log('Usage in HTML:');
    console.log('  <script src="../../shared/pokedex-data.js"></script>');
    console.log('  <script src="moves-data.js"></script>');
    console.log('='.repeat(60));
}

main();
