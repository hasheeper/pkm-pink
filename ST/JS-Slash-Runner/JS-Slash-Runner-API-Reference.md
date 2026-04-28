# JS-Slash-Runner (酒馆助手) API 完整参考文档

## 目录

- [1. 概述](#1-概述)
- [2. 核心功能](#2-核心功能)
  - [2.1 渲染器](#21-渲染器)
  - [2.2 脚本库](#22-脚本库)
  - [2.3 提示词查看器](#23-提示词查看器)
  - [2.4 变量管理器](#24-变量管理器)
  - [2.5 音频播放器](#25-音频播放器)
  - [2.6 日志查看器](#26-日志查看器)
- [3. API 函数索引](#3-api-函数索引)
  - [3.1 工具函数](#31-工具函数)
  - [3.2 事件系统](#32-事件系统)
  - [3.3 变量管理](#33-变量管理)
  - [3.4 聊天消息](#34-聊天消息)
  - [3.5 角色卡管理](#35-角色卡管理)
  - [3.6 预设管理](#36-预设管理)
  - [3.7 世界书管理](#37-世界书管理)
  - [3.8 酒馆正则](#38-酒馆正则)
  - [3.9 AI 生成](#39-ai-生成)
  - [3.10 提示词注入](#310-提示词注入)
  - [3.11 Slash 命令](#311-slash-命令)
  - [3.12 脚本功能](#312-脚本功能)
  - [3.13 宏功能](#313-宏功能)
  - [3.14 导入功能](#314-导入功能)

---

## 1. 概述

**酒馆助手 (Tavern Helper)** 是为 SillyTavern 设计的多功能扩展，提供以下核心能力：

- 🖥️ **前端界面渲染**：在消息楼层中渲染交互式 HTML/JavaScript 界面
- 🎮 **脚本库系统**：在后台运行 JavaScript 脚本，实现自动化功能
- 🔧 **深度交互**：修改世界书、预设、变量、注入提示词等
- 🔌 **外部连接**：通过 socket.io-client 等连接外部应用程序
- 🎁 **扩展功能**：提示词查看器、变量管理器、音频播放器等

### 安全提示

⚠️ 酒馆助手允许执行自定义 JavaScript 代码，请务必：
- 仔细检查脚本内容，确保来源可信
- 理解脚本功能和可能的影响
- 不执行来源不明的脚本

---

## 2. 核心功能

### 2.1 渲染器

在楼层消息中显示前端界面，支持完整的 HTML/CSS/JavaScript。

#### 使用方法

将 HTML 代码包裹在代码块中：

```html
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
        padding: 20px;
      }
    </style>
  </head>
  <body>
    <h1>欢迎使用脚本注入功能！</h1>
    <button onclick="showMessage()">点击我</button>
    <script>
      function showMessage() {
        alert('你点击了按钮！');
      }
    </script>
  </body>
</html>
```

#### 渲染条件

- 代码必须在 ``` 代码块中
- 必须包含 `<body>` 和 `</body>` 标签
- `min-height: * vh` 会自动转换为以浏览器高度为基准

#### 获取头像

**使用 CSS 类：**
```html
<div class="char_avatar"></div>
<div class="user_avatar"></div>
```

**使用宏：**
```html
<div style="background-image: url('{{charAvatarPath}}');"></div>
<div style="background-image: url('{{userAvatarPath}}');"></div>
```

### 2.2 脚本库

在后台运行 JavaScript 脚本，支持全局、预设、角色三种绑定方式。

#### 脚本类型

- **全局脚本库**：适用于酒馆所有聊天
- **预设脚本库**：适用于当前预设，随预设导出
- **角色脚本库**：适用于当前角色卡，随角色卡导出

#### 脚本按钮

为脚本添加按钮，用户点击时触发功能：

```javascript
eventOn(getButtonEvent('按钮名称'), () => {
  console.log('按键被点击');
});
```

#### 脚本生命周期

```javascript
// 页面加载完成时执行
$(() => {
  // 初始化逻辑
});

// 脚本关闭时执行
$(window).on('pagehide', () => {
  // 清理逻辑
});
```

### 2.3 提示词查看器

查看 AI 实际收到的提示词，支持：
- 实时显示最新提示词
- 搜索和筛选功能
- 正则表达式搜索
- 显示经过酒馆处理后的真实提示词

### 2.4 变量管理器

查看、编辑并实时监听不同作用域下的变量：
- 支持 JSON 编辑器
- 可注册变量结构验证
- 支持全局、预设、角色、聊天、消息、脚本、扩展变量

### 2.5 音频播放器

播放音乐和音效，解决多楼层音频冲突问题：
- 支持单曲循环、列表循环、随机播放
- 音量调整
- 播放列表管理

### 2.6 日志查看器

收集前端界面或脚本中的日志，便于调试和错误报告。

---

## 3. API 函数索引

### 3.1 工具函数

#### `reloadIframe()`
重新加载前端界面或脚本。

```javascript
reloadIframe();
```

#### `getIframeName()`
获取前端界面或脚本的标识名称。

```javascript
const name = getIframeName();
// 返回: 'TH-message--楼层号--界面序号' 或 'TH-script--脚本名称--脚本id'
```

#### `getCurrentMessageId()`
获取当前消息楼层的楼层 ID（仅在楼层消息 iframe 中使用）。

```javascript
const messageId = getCurrentMessageId();
```

#### `getScriptId()`
获取脚本的脚本库 ID（仅在脚本内使用）。

```javascript
const scriptId = getScriptId();
```

---

### 3.2 事件系统

#### `eventOn(event_type, listener)`
监听事件，当事件发生时自动运行 listener。

```javascript
// 监听消息接收
eventOn(tavern_events.MESSAGE_RECEIVED, () => {
  alert('收到新消息！');
});

// 监听消息更新
eventOn(tavern_events.MESSAGE_UPDATED, message_id => {
  console.log(`第 ${message_id} 条消息被更新`);
});
```

**返回值：**
- `stop()`: 取消监听

#### `eventOnce(event_type, listener)`
仅监听下一次事件。

```javascript
eventOnce(tavern_events.MESSAGE_RECEIVED, () => {
  console.log('这只会执行一次');
});
```

#### `eventMakeFirst(event_type, listener)`
将 listener 调整为最先运行。

```javascript
eventMakeFirst(tavern_events.GENERATION_STARTED, () => {
  console.log('最先执行');
});
```

#### `eventMakeLast(event_type, listener)`
将 listener 调整为最后运行。

```javascript
eventMakeLast(tavern_events.GENERATION_ENDED, () => {
  console.log('最后执行');
});
```

#### `eventEmit(event_type, ...data)`
发送事件。

```javascript
// 发送自定义事件
await eventEmit("角色阶段更新完成");

// 发送带数据的事件
await eventEmit("存档", saveData);
```

#### `eventClearAll()`
清除所有监听器。

```javascript
eventClearAll();
```

#### 常用事件类型

**iframe_events（前端界面事件）：**
- `GENERATION_STARTED`: 生成开始
- `GENERATION_ENDED`: 生成结束
- `STREAM_TOKEN_RECEIVED_FULLY`: 流式传输完整文本
- `STREAM_TOKEN_RECEIVED_INCREMENTALLY`: 流式传输增量文本

**tavern_events（酒馆事件）：**
- `CHAT_CHANGED`: 聊天文件变更
- `MESSAGE_RECEIVED`: 收到消息
- `MESSAGE_UPDATED`: 消息更新
- `MESSAGE_DELETED`: 消息删除
- `MESSAGE_SWIPED`: 消息切换
- `CHARACTER_MESSAGE_RENDERED`: 角色消息渲染
- `USER_MESSAGE_RENDERED`: 用户消息渲染
- `GENERATION_AFTER_COMMANDS`: 生成前（可注入提示词）
- `CHAT_COMPLETION_PROMPT_READY`: 提示词准备完成
- `WORLDINFO_ENTRIES_LOADED`: 世界书条目加载
- `PRESET_CHANGED`: 预设变更

---

### 3.3 变量管理

#### 变量类型 (VariableOption)

```typescript
type VariableOption = 
  | { type: 'global' }                                    // 全局变量
  | { type: 'preset' }                                    // 预设变量
  | { type: 'character' }                                 // 角色卡变量
  | { type: 'chat' }                                      // 聊天变量
  | { type: 'message', message_id?: number | 'latest' }   // 消息楼层变量
  | { type: 'script', script_id?: string }                // 脚本变量
  | { type: 'extension', extension_id: string };          // 扩展变量
```

#### `getVariables(option)`
获取变量表。

```javascript
// 获取聊天变量
const chatVars = getVariables({ type: 'chat' });

// 获取倒数第二楼层的变量
const msgVars = getVariables({ type: 'message', message_id: -2 });

// 在脚本内获取脚本变量
const scriptVars = getVariables({ type: 'script' });
```

#### `replaceVariables(variables, option)`
完全替换变量表。

```javascript
// 替换聊天变量
replaceVariables({ 神乐光: { 好感度: 5, 认知度: 0 } }, { type: 'chat' });

// 删除变量
let vars = getVariables({ type: 'chat' });
_.unset(vars, "神乐光.好感度");
replaceVariables(vars, { type: 'chat' });
```

#### `updateVariablesWith(updater, option)`
用函数更新变量表。

```javascript
// 删除变量
updateVariablesWith(vars => {
  _.unset(vars, "神乐光.好感度");
  return vars;
}, { type: 'chat' });

// 更新变量值
updateVariablesWith(vars => 
  _.update(vars, "爱城华恋.好感度", v => v ? v * 2 : 0),
  { type: 'chat' }
);
```

#### `insertOrAssignVariables(variables, option)`
插入或修改变量值。

```javascript
// 不存在则新增，存在则修改
await insertOrAssignVariables(
  { 爱城华恋: { 好感度: 10 }, 神乐光: { 好感度: 5 } },
  { type: 'chat' }
);
```

#### `insertVariables(variables, option)`
插入新变量（已存在则不操作）。

```javascript
await insertVariables(
  { 神乐光: { 好感度: 5 } },
  { type: 'chat' }
);
```

#### `deleteVariable(variable_path, option)`
删除变量。

```javascript
const result = await deleteVariable("爱城华恋.好感度", { type: 'chat' });
console.log(result.delete_occurred); // 是否成功删除
```

#### `registerVariableSchema(schema, option)`
为变量管理器注册变量结构。

```javascript
registerVariableSchema(
  z.object({
    stat_data: z.object({
      好感度: z.number(),
    }),
  }),
  { type: 'message' }
);
```

---

### 3.4 聊天消息

#### 消息类型

```typescript
type ChatMessage = {
  message_id: number;
  name: string;
  role: 'system' | 'assistant' | 'user';
  is_hidden: boolean;
  message: string;
  data: Record<string, any>;
  extra: Record<string, any>;
};
```

#### `getChatMessages(range, option?)`
获取聊天消息。

```javascript
// 获取第 10 楼
const msg = getChatMessages(10);

// 获取最新楼层
const lastMsg = getChatMessages(-1)[0];

// 获取所有楼层
const allMsgs = getChatMessages('0-{{lastMessageId}}');

// 获取包含所有消息页的楼层
const swipedMsgs = getChatMessages(10, { include_swipes: true });

// 按角色筛选
const userMsgs = getChatMessages('0-{{lastMessageId}}', { role: 'user' });
```

#### `getLastMessageId()`
获取最后一条消息的楼层号。

```javascript
const lastId = getLastMessageId();
```

#### `setChatMessages(chat_messages, option?)`
修改聊天消息。

```javascript
// 修改第 10 楼的正文
await setChatMessages([{ message_id: 10, message: '新的消息' }]);

// 设置开局
await setChatMessages([{ message_id: 0, swipes: ['开局1', '开局2'] }]);

// 切换为开局 3
await setChatMessages([{ message_id: 0, swipe_id: 2 }]);

// 隐藏所有楼层
const lastId = getLastMessageId();
await setChatMessages(
  _.range(lastId + 1).map(id => ({ message_id: id, is_hidden: true }))
);
```

#### `createChatMessages(chat_messages, option?)`
创建聊天消息。

```javascript
// 在末尾插入消息
await createChatMessages([{ role: 'user', message: '你好' }]);

// 在第 10 楼前插入
await createChatMessages(
  [{ role: 'user', message: '你好' }],
  { insert_before: 10 }
);
```

#### `deleteChatMessages(message_ids, option?)`
删除聊天消息。

```javascript
// 删除指定楼层
await deleteChatMessages([10, 15, -2, getLastMessageId()]);

// 删除所有楼层
await deleteChatMessages(_.range(getLastMessageId() + 1));
```

#### `rotateChatMessages(begin, middle, end, option?)`
旋转楼层顺序。

```javascript
// 将最后一楼放到第 5 楼之前
await rotateChatMessages(5, getLastMessageId(), getLastMessageId() + 1);

// 将前 3 楼放到最后
await rotateChatMessages(0, 3, getLastMessageId() + 1);
```

---

### 3.5 角色卡管理

#### 角色卡类型

```typescript
type Character = {
  name: string;
  version: string;
  creator: string;
  creator_notes: string;
  worldbook: string | null;
  description: string;
  first_messages: string[];
  extensions: {
    regex_scripts: TavernRegex[];
    tavern_helper: {
      scripts: Record<string, any>[];
      variables: Record<string, any>;
    };
  };
};
```

#### `getCharacterNames()`
获取角色卡名称列表。

```javascript
const names = getCharacterNames();
```

#### `getCharacter(character_name)`
获取角色卡内容。

```javascript
// 获取当前角色卡
const char = await getCharacter('current');

// 获取指定角色卡
const char = await getCharacter('角色卡名称');
```

#### `createCharacter(character_name, character?)`
新建角色卡。

```javascript
const success = await createCharacter('新角色', {
  name: '新角色',
  description: '角色描述',
  first_messages: ['你好！']
});
```

#### `replaceCharacter(character_name, character, options?)`
完全替换角色卡内容。

```javascript
// 更改开场白
const char = await getCharacter('角色卡名称');
char.first_messages = ['新的开场白1', '新的开场白2'];
await replaceCharacter('角色卡名称', char);

// 清空局部正则
const char = await getCharacter('角色卡名称');
char.extensions.regex_scripts = [];
await replaceCharacter('角色卡名称', char);
```

#### `updateCharacterWith(character_name, updater)`
用函数更新角色卡。

```javascript
// 添加开场白
await updateCharacterWith('角色卡名称', char => {
  char.first_messages.push('新的开场白');
  return char;
});

// 清空局部正则
await updateCharacterWith('角色卡名称', char => {
  char.extensions.regex_scripts = [];
  return char;
});
```

#### `deleteCharacter(character_name)`
删除角色卡。

```javascript
const success = await deleteCharacter('角色卡名称');
```

#### `createOrReplaceCharacter(character_name, character?, options?)`
创建或替换角色卡。

```javascript
const isCreated = await createOrReplaceCharacter('角色卡名称', {
  name: '角色卡名称',
  description: '描述'
});
```

---

### 3.6 预设管理

#### 预设类型

```typescript
type Preset = {
  settings: {
    max_context: number;                    // 最大上下文 token 数
    max_completion_tokens: number;          // 最大回复 token 数
    should_stream: boolean;                 // 是否流式传输
    temperature: number;                    // 温度
    frequency_penalty: number;              // 频率惩罚
    presence_penalty: number;               // 存在惩罚
    reasoning_effort: string;               // 推理强度
    // ... 更多设置
  };
  prompts: PresetPrompt[];                  // 提示词列表
  prompts_unused: PresetPrompt[];           // 未使用的提示词
  extensions: Record<string, any>;          // 扩展字段
};
```

#### `getPresetNames()`
获取预设名称列表。

```javascript
const names = getPresetNames();
```

#### `getPreset(preset_name)`
获取预设内容。

```javascript
// 获取当前使用的预设
const preset = getPreset('in_use');

// 获取指定预设
const preset = getPreset('预设名称');
```

#### `replacePreset(preset_name, preset, options?)`
完全替换预设内容。

```javascript
// 开启流式传输
const preset = getPreset('in_use');
preset.settings.should_stream = true;
await replacePreset('in_use', preset);

// 关闭包含 "COT" 的条目
const preset = getPreset('in_use');
preset.prompts
  .filter(p => p.name.includes('COT'))
  .forEach(p => p.enabled = false);
await replacePreset('in_use', preset);
```

#### `updatePresetWith(preset_name, updater, options?)`
用函数更新预设。

```javascript
// 开启流式传输
await updatePresetWith('in_use', preset => {
  preset.settings.should_stream = true;
  return preset;
});

// 添加提示词条目
await updatePresetWith('in_use', preset => {
  preset.prompts.push({
    id: 'new_prompt',
    name: '新提示词',
    enabled: true,
    position: { type: 'relative' },
    role: 'user',
    content: '新提示词内容',
  });
  return preset;
});
```

#### `setPreset(preset_name, preset, options?)`
部分修改预设内容。

```javascript
// 开启流式传输
await setPreset('in_use', { settings: { should_stream: true } });
```

---

### 3.7 世界书管理

#### 世界书条目类型

```typescript
type WorldbookEntry = {
  uid: number;
  name: string;
  enabled: boolean;
  strategy: {
    type: 'constant' | 'selective' | 'vectorized';  // 蓝灯/绿灯/向量化
    keys: (string | RegExp)[];                      // 主要关键字
    keys_secondary: { logic: string; keys: (string | RegExp)[] };
    scan_depth: 'same_as_global' | number;
  };
  position: {
    type: string;
    role: 'system' | 'assistant' | 'user';
    depth: number;
  };
  content: string;
  // ... 更多字段
};
```

#### `getWorldbookNames()`
获取世界书名称列表。

```javascript
const names = getWorldbookNames();
```

#### `getWorldbook(worldbook_name)`
获取世界书条目。

```javascript
const entries = await getWorldbook('世界书名称');
```

#### `replaceWorldbook(worldbook_name, worldbook, options?)`
完全替换世界书。

```javascript
// 禁止所有条目递归
const wb = await getWorldbook('世界书名称');
await replaceWorldbook(
  '世界书名称',
  wb.map(entry => ({
    ...entry,
    recursion: { prevent_incoming: true, prevent_outgoing: true }
  }))
);

// 删除包含特定名称的条目
const wb = await getWorldbook('世界书名称');
_.remove(wb, entry => entry.name.includes('神乐光'));
await replaceWorldbook('世界书名称', wb);
```

#### `updateWorldbookWith(worldbook_name, updater, options?)`
用函数更新世界书。

```javascript
// 禁止所有条目递归
await updateWorldbookWith('世界书名称', wb => {
  return wb.map(entry => ({
    ...entry,
    recursion: { prevent_incoming: true, prevent_outgoing: true }
  }));
});
```

#### `createWorldbookEntries(worldbook_name, new_entries, options?)`
新增世界书条目。

```javascript
const { worldbook, new_entries } = await createWorldbookEntries(
  '世界书名称',
  [{ name: '神乐光' }, {}]
);
```

#### `deleteWorldbookEntries(worldbook_name, predicate, options?)`
删除世界书条目。

```javascript
const { worldbook, deleted_entries } = await deleteWorldbookEntries(
  '世界书名称',
  entry => entry.name.includes('神乐光')
);
```

#### 世界书绑定

```javascript
// 获取/设置全局世界书
const globalWbs = getGlobalWorldbookNames();
await rebindGlobalWorldbooks(['世界书1', '世界书2']);

// 获取/设置角色卡世界书
const charWbs = getCharWorldbookNames('current');
await rebindCharWorldbooks('current', {
  primary: '主世界书',
  additional: ['附加世界书1', '附加世界书2']
});

// 获取/设置聊天世界书
const chatWb = getChatWorldbookName('current');
await rebindChatWorldbook('current', '世界书名称');
```

---

### 3.8 酒馆正则

#### `formatAsTavernRegexedString(text, source, destination, option?)`
对文本应用酒馆正则。

```javascript
const message = getChatMessages(-1)[0];
const result = formatAsTavernRegexedString(
  message.message,
  'ai_output',
  'display',
  { depth: 0 }
);
```

#### `getTavernRegexes(option?)`
获取酒馆正则。

```javascript
// 获取所有正则
const regexes = getTavernRegexes();

// 获取全局正则
const globalRegexes = getTavernRegexes({ scope: 'global' });

// 获取已启用的正则
const enabledRegexes = getTavernRegexes({ enable_state: 'enabled' });
```

#### `replaceTavernRegexes(regexes, option?)`
完全替换酒馆正则。

```javascript
await replaceTavernRegexes(newRegexes, { scope: 'all' });
```

#### `updateTavernRegexesWith(updater, option?)`
用函数更新酒馆正则。

```javascript
// 开启所有名字包含 "舞台少女" 的正则
await updateTavernRegexesWith(regexes => {
  regexes.forEach(regex => {
    if (regex.script_name.includes('舞台少女')) {
      regex.enabled = true;
    }
  });
  return regexes;
});
```

#### `isCharacterTavernRegexesEnabled()`
判断局部正则是否启用。

```javascript
const enabled = isCharacterTavernRegexesEnabled();
```

---

### 3.9 AI 生成

#### `generate(config)`
使用当前预设让 AI 生成文本。

```javascript
// 基本生成
const result = await generate({ user_input: '你好' });

// 图片输入
const result = await generate({
  user_input: '描述这张图片',
  image: 'https://example.com/image.jpg'
});

// 流式生成
eventOn(iframe_events.STREAM_TOKEN_RECEIVED_FULLY, text => {
  console.info('流式回复: ', text);
});
const result = await generate({
  user_input: '你好',
  should_stream: true
});

// 注入提示词
const result = await generate({
  user_input: '你好',
  injects: [{
    role: 'system',
    content: '思维链...',
    position: 'in_chat',
    depth: 0,
    should_scan: true
  }],
  overrides: {
    char_personality: '温柔',
    world_info_before: ''
  }
});

// 使用自定义 API
const result = await generate({
  user_input: '你好',
  custom_api: {
    apiurl: 'https://your-proxy-url.com',
    key: 'your-api-key',
    model: 'gpt-4',
    source: 'openai'
  }
});
```

#### `generateRaw(config)`
不使用预设让 AI 生成文本。

```javascript
// 自定义提示词顺序
const result = await generateRaw({
  user_input: '你好',
  ordered_prompts: [
    'char_description',
    { role: 'system', content: '你是一个助手' },
    'chat_history',
    'user_input'
  ]
});
```

#### 生成配置类型

```typescript
type GenerateConfig = {
  user_input?: string;
  should_stream?: boolean;
  should_silence?: boolean;
  image?: File | string | (File | string)[];
  overrides?: Overrides;
  injects?: Omit<InjectionPrompt, 'id'>[];
  max_chat_history?: 'all' | number;
  custom_api?: CustomApiConfig;
};
```

#### `stopGenerationById(generation_id)`
停止指定生成请求。

```javascript
stopGenerationById(generationId);
```

#### `stopAllGeneration()`
停止所有生成请求。

```javascript
stopAllGeneration();
```

---

### 3.10 提示词注入

#### `injectPrompts(prompts, options?)`
注入提示词。

```javascript
const { uninject } = injectPrompts([
  {
    id: 'custom_prompt',
    position: 'in_chat',
    depth: 0,
    role: 'system',
    content: '自定义提示词',
    should_scan: true
  }
]);

// 取消注入
uninject();
```

#### `uninjectPrompts(ids)`
移除注入的提示词。

```javascript
uninjectPrompts(['custom_prompt']);
```

#### 提示词类型

```typescript
type InjectionPrompt = {
  id: string;
  position: 'in_chat' | 'none';
  depth: number;
  role: 'system' | 'assistant' | 'user';
  content: string;
  filter?: () => boolean | Promise<boolean>;
  should_scan?: boolean;
};
```

---

### 3.11 Slash 命令

#### `triggerSlash(command)`
运行 Slash 命令。

```javascript
// 弹出提示
await triggerSlash('/echo severity=success 运行成功!');

// 获取变量
const lastId = await triggerSlash('/pass {{lastMessageId}}');

// 触发 AI 回复
await createChatMessages([{ role: 'user', content: '你好' }]);
await triggerSlash('/trigger');
```

---

### 3.12 脚本功能

#### `getButtonEvent(button_name)`
获取按钮对应的事件类型（仅在脚本中使用）。

```javascript
const eventType = getButtonEvent('按钮名');
eventOn(eventType, () => {
  console.log('按钮被点击了');
});
```

#### `getScriptButtons()`
获取脚本的按钮列表（仅在脚本中使用）。

```javascript
const buttons = getScriptButtons();
```

#### `replaceScriptButtons(buttons)`
完全替换脚本的按钮列表（仅在脚本中使用）。

```javascript
replaceScriptButtons([
  { name: '开始游戏', visible: true },
  { name: '继续游戏', visible: false }
]);
```

#### `appendInexistentScriptButtons(buttons)`
添加不存在的按钮（仅在脚本中使用）。

```javascript
appendInexistentScriptButtons([{ name: '重新开始', visible: true }]);
```

#### `getScriptInfo()`
获取脚本作者注释。

```javascript
const info = getScriptInfo();
```

#### `replaceScriptInfo(info)`
替换脚本作者注释。

```javascript
replaceScriptInfo('新的作者注释');
```

---

### 3.13 宏功能

#### `registerMacroLike(regex, replace)`
注册一个新的助手宏。

```javascript
// 注册统计行数的宏
registerMacroLike(
  /<count_lines>(.*?)<\/count_lines>/gi,
  (context, content) => content.split('\n').length
);
```

#### `unregisterMacroLike(regex)`
取消注册助手宏。

```javascript
unregisterMacroLike(/<count_lines>(.*?)<\/count_lines>/gi);
```

---

### 3.14 导入功能

#### `importRawCharacter(filename, content)`
导入新角色/更新现有角色卡。

```javascript
const response = await fetch('角色卡网络链接');
await importRawCharacter('角色卡名', await response.blob());
```

#### `importRawChat(filename, content)`
导入聊天文件。

```javascript
const response = await fetch('聊天文件网络链接');
await importRawChat('聊天文件名', await response.text());
```

#### `importRawPreset(filename, content)`
导入新预设/更新现有预设。

```javascript
const response = await fetch('预设网络链接');
await importRawPreset('预设名', await response.text());
```

#### `importRawWorldbook(filename, content)`
导入新世界书/更新现有世界书。

```javascript
const response = await fetch('世界书网络链接');
await importRawWorldbook('世界书名', await response.text());
```

#### `importRawTavernRegex(filename, content)`
导入酒馆正则。

```javascript
const response = await fetch('酒馆正则网络链接');
await importRawTavernRegex('酒馆正则名', await response.text());
```

---

## 4. 常用示例

### 4.1 监听聊天变更并重新加载

```javascript
let current_chat_id = SillyTavern.getCurrentChatId();
eventOn(tavern_events.CHAT_CHANGED, chat_id => {
  if (current_chat_id !== chat_id) {
    current_chat_id = chat_id;
    reloadIframe();
  }
});
```

### 4.2 每 20 楼自动生成总结

```javascript
eventOn(tavern_events.MESSAGE_RECEIVED, async () => {
  const lastId = getLastMessageId();
  if ((lastId + 1) % 20 === 0) {
    const result = await generate({
      user_input: '请总结前面的剧情',
      should_silence: true
    });
    console.log('总结:', result);
  }
});
```

### 4.3 动态修改世界书条目

```javascript
await updateWorldbookWith('世界书名称', wb => {
  const entry = wb.find(e => e.name === '神乐光');
  if (entry) {
    entry.content = '更新后的内容';
  }
  return wb;
});
```

### 4.4 创建交互式状态栏

```html
<body>
  <div id="status-bar">
    <div>好感度: <span id="favor">0</span></div>
    <button onclick="increaseFavor()">增加好感度</button>
  </div>
  <script>
    async function increaseFavor() {
      await updateVariablesWith(vars => {
        vars.好感度 = (vars.好感度 || 0) + 1;
        return vars;
      }, { type: 'chat' });
      
      const vars = getVariables({ type: 'chat' });
      document.getElementById('favor').textContent = vars.好感度;
    }
    
    // 初始化显示
    const vars = getVariables({ type: 'chat' });
    document.getElementById('favor').textContent = vars.好感度 || 0;
  </script>
</body>
```

### 4.5 脚本按钮示例

```javascript
// 设置按钮
replaceScriptButtons([
  { name: '推进剧情', visible: true },
  { name: '查看状态', visible: true }
]);

// 绑定按钮事件
eventOn(getButtonEvent('推进剧情'), async () => {
  await triggerSlash('/send 推进剧情 | /trigger');
});

eventOn(getButtonEvent('查看状态'), () => {
  const vars = getVariables({ type: 'chat' });
  toastr.info(JSON.stringify(vars, null, 2));
});
```

---

## 5. 最佳实践

### 5.1 性能优化

- 使用 `{ render: 'debounced' }` 选项进行批量更新
- 避免频繁调用 `replaceWorldbook` 等慢操作
- 使用 `should_silence: true` 进行后台生成

### 5.2 错误处理

```javascript
try {
  const char = await getCharacter('current');
  // 处理角色卡
} catch (error) {
  console.error('获取角色卡失败:', error);
  toastr.error('操作失败');
}
```

### 5.3 事件清理

```javascript
// 脚本关闭时清理
$(window).on('pagehide', () => {
  eventClearAll();
  // 其他清理逻辑
});
```

### 5.4 变量管理

- 使用 lodash 库进行复杂变量操作
- 为变量注册结构验证
- 使用合适的变量作用域

---

## 6. 调试技巧

### 6.1 使用日志查看器

```javascript
console.info('信息日志');
console.warn('警告日志');
console.error('错误日志');
```

### 6.2 使用提示词查看器

- 查看实际发送给 AI 的提示词
- 使用搜索功能定位问题
- 验证注入和覆盖是否生效

### 6.3 使用变量管理器

- 实时查看变量变化
- 手动编辑变量进行测试
- 验证变量结构

---

## 7. 内置库

酒馆助手内置以下库：

- **jQuery**: DOM 操作和事件处理
- **lodash**: 实用函数库（`_.get`, `_.set`, `_.has`, `_.update` 等）
- **toastr**: 消息提示（`toastr.success()`, `toastr.error()` 等）
- **zod**: 类型验证（用于 `registerVariableSchema`）

---

## 8. 参考资源

- [SillyTavern 官方文档](https://docs.sillytavern.app/)
- [Slash 命令手册](https://rentry.org/sillytavern-script-book)
- 类型定义文件：在酒馆助手界面中可打包下载所有 `.d.txt` 文件

---

**文档版本**: 1.0  
**最后更新**: 2026-01-27
