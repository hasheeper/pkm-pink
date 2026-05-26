const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const trainerDataPath = path.resolve(baseDir, '..', 'TRAINER_data.js');
const pluginPath = path.join(baseDir, 'pkm-tavern-plugin.js');

console.log('开始内联训练家数据...');
console.log(`训练家数据文件: ${trainerDataPath}`);
console.log(`插件文件: ${pluginPath}`);

// 检查文件是否存在
if (!fs.existsSync(trainerDataPath)) {
  console.error(`❌ 错误: 找不到训练家数据文件 ${trainerDataPath}`);
  process.exit(1);
}

if (!fs.existsSync(pluginPath)) {
  console.error(`❌ 错误: 找不到插件文件 ${pluginPath}`);
  process.exit(1);
}

// 读取训练家数据
const trainerData = fs.readFileSync(trainerDataPath, 'utf8');
console.log(`✓ 已读取训练家数据 (${trainerData.length} 字符)`);

// 读取插件文件
let pluginContent = fs.readFileSync(pluginPath, 'utf8');
console.log(`✓ 已读取插件文件 (${pluginContent.length} 字符)`);

// 移除旧的内联内容（如果存在）
const inlineStartMarker = '// ================================================================\n//  以下为内联的训练家数据 (自动生成，请勿手动编辑)\n// ================================================================';
const inlineEndMarker = '// ================================================================\n//  训练家数据内联结束\n// ================================================================';

const startIdx = pluginContent.indexOf(inlineStartMarker);
const endIdx = pluginContent.indexOf(inlineEndMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const endOfBlock = endIdx + inlineEndMarker.length;
  // 移除旧的内联块（包括后面的空行）
  let afterBlock = pluginContent.substring(endOfBlock);
  // 去掉开头的空行
  afterBlock = afterBlock.replace(/^\n+/, '\n');
  pluginContent = afterBlock;
  console.log('✓ 已移除旧的内联内容');
}

// 查找插入位置 - 在 (async function() { 之前
const asyncMarker = '(async function() {';
const insertIndex = pluginContent.indexOf(asyncMarker);

if (insertIndex === -1) {
  console.error('❌ 错误: 在插件文件中找不到 (async function() { 标记');
  process.exit(1);
}

console.log(`✓ 找到插入位置: 第 ${insertIndex} 个字符`);

// 构建新的插件内容 - 直接在文件开头插入训练家数据
const inlineBlock = `// ================================================================
//  以下为内联的训练家数据 (自动生成，请勿手动编辑)
// ================================================================
${trainerData}

// ================================================================
//  训练家数据内联结束
// ================================================================

`;

const newPluginContent = inlineBlock + pluginContent;

// 写入新的插件文件
fs.writeFileSync(pluginPath, newPluginContent, 'utf8');

console.log('✓ 训练家数据已成功内联到插件文件');
console.log(`新插件文件大小: ${newPluginContent.length} 字符`);
console.log('完成！');
