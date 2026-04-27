const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const trainerPath = path.resolve(baseDir, '..', 'TRAINER_data.js');
const pluginPath = path.join(baseDir, 'pkm-tavern-plugin.js');
const asyncMarker = '(async function() {';
const inlineMarker = '// ---------------------------------------------------------------\n//  以下为内置的 trainer_data.js';

function bundleTrainerData() {
  if (!fs.existsSync(trainerPath)) {
    throw new Error(`无法找到训练家数据文件: ${trainerPath}`);
  }
  if (!fs.existsSync(pluginPath)) {
    throw new Error(`无法找到插件文件: ${pluginPath}`);
  }

  const trainerRaw = fs.readFileSync(trainerPath, 'utf8').trimEnd();
  const trainerContent = `${trainerRaw}\n`;
  const pluginContent = fs.readFileSync(pluginPath, 'utf8');

  const asyncIndex = pluginContent.indexOf(asyncMarker);
  if (asyncIndex === -1) {
    throw new Error('未在插件中找到 (async function() { 标记，无法插入数据');
  }

  const inlineIndex = pluginContent.indexOf(inlineMarker);
  const header = inlineIndex !== -1
    ? pluginContent.slice(0, inlineIndex)
    : pluginContent.slice(0, asyncIndex);

  const after = pluginContent.slice(asyncIndex);

  const prefix = `${header}// ---------------------------------------------------------------\n//  以下为内置的 trainer_data.js（自动打包生成）\n// ---------------------------------------------------------------\n${trainerContent}\n`;

  const bundled = prefix + after;
  fs.writeFileSync(pluginPath, bundled, 'utf8');
  console.log('已将 trainer_data.js 内联到 pkm-tavern-plugin.js');
}

bundleTrainerData();
