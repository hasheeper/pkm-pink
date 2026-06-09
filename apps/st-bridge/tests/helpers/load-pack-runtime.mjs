import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

export const ST_BRIDGE_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));

function clone(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeVariables(target, source) {
  if (!isObject(source)) return target;
  Object.entries(source).forEach(([key, value]) => {
    if (isObject(value) && isObject(target[key])) {
      mergeVariables(target[key], value);
      return;
    }
    target[key] = clone(value, value);
  });
  return target;
}

function decodePointerPart(part) {
  return String(part).replace(/~1/g, '/').replace(/~0/g, '~');
}

function ensurePatchParent(root, pointer) {
  const parts = String(pointer || '').split('/').slice(1).map(decodePointerPart);
  if (!parts.length) return { parent: null, key: '' };
  let parent = root;
  for (const part of parts.slice(0, -1)) {
    if (!isObject(parent[part]) && !Array.isArray(parent[part])) parent[part] = {};
    parent = parent[part];
  }
  return { parent, key: parts[parts.length - 1] };
}

function applyJsonPatch(root, patches) {
  for (const patch of Array.isArray(patches) ? patches : []) {
    if (!patch || typeof patch.path !== 'string') continue;
    const { parent, key } = ensurePatchParent(root, patch.path);
    if (!parent) continue;
    if (patch.op === 'remove') {
      if (Array.isArray(parent)) parent.splice(Number(key), 1);
      else delete parent[key];
      continue;
    }
    if (patch.op === 'delta') {
      parent[key] = (Number(parent[key]) || 0) + (Number(patch.value) || 0);
      continue;
    }
    if (patch.op === 'add' || patch.op === 'replace') {
      if (Array.isArray(parent) && key === '-') parent.push(clone(patch.value, patch.value));
      else parent[key] = clone(patch.value, patch.value);
    }
  }
}

function createZChain() {
  return {
    default() { return this; },
    transform() { return this; },
    passthrough() { return this; },
    optional() { return this; },
    nullable() { return this; },
    array() { return this; }
  };
}

function createZStub() {
  const chain = () => createZChain();
  return {
    any: chain,
    array: chain,
    boolean: chain,
    enum: chain,
    literal: chain,
    number: chain,
    object: chain,
    record: chain,
    string: chain,
    union: chain
  };
}

function createDocumentStub() {
  const byId = new Map();
  const makeElement = (tagName) => {
    const element = {
      tagName: String(tagName || '').toUpperCase(),
      children: [],
      dataset: {},
      style: {},
      attributes: {},
      classList: {
        add() {},
        remove() {},
        toggle() {},
        contains() { return false; }
      },
      appendChild(child) {
        this.children.push(child);
        child.parentNode = this;
        return child;
      },
      remove() {
        if (!this.parentNode) return;
        this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
      },
      setAttribute(name, value) {
        this.attributes[name] = String(value);
        if (name === 'id') byId.set(String(value), this);
      },
      getAttribute(name) {
        return this.attributes[name] || null;
      },
      addEventListener() {},
      removeEventListener() {},
      querySelector() { return null; },
      querySelectorAll() { return []; }
    };
    return element;
  };
  const body = makeElement('body');
  return {
    body,
    head: makeElement('head'),
    createElement: makeElement,
    getElementById(id) {
      return byId.get(String(id)) || null;
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    removeEventListener() {}
  };
}

function createStorageStub() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(String(key)) ? store.get(String(key)) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    }
  };
}

function normalizeMessages(messages) {
  const source = Array.isArray(messages) && messages.length
    ? messages
    : [{ message_id: 0, message: '' }];
  return source.map((message, index) => ({
    message_id: Number.isFinite(Number(message.message_id)) ? Math.round(Number(message.message_id)) : index,
    message: String(message.message || '')
  }));
}

function createManualTimers() {
  let now = 0;
  let sequence = 0;
  const timers = new Map();

  function set(callback, delayMs = 0, repeat = false) {
    const id = ++sequence;
    const delay = Math.max(0, Number(delayMs) || 0);
    timers.set(id, {
      id,
      at: now + delay,
      delay,
      callback,
      repeat
    });
    return id;
  }

  function clear(id) {
    timers.delete(Number(id));
  }

  async function settleMicrotasks(count = 8) {
    for (let index = 0; index < count; index += 1) {
      await Promise.resolve();
    }
  }

  async function flushDue() {
    let ran = false;
    while (true) {
      const due = Array.from(timers.values())
        .filter((timer) => timer.at <= now)
        .sort((left, right) => left.at - right.at || left.id - right.id)[0];
      if (!due) break;
      timers.delete(due.id);
      if (due.repeat) {
        due.at = now + due.delay;
        timers.set(due.id, due);
      }
      due.callback();
      ran = true;
      await settleMicrotasks();
    }
    return ran;
  }

  return {
    get now() {
      return now;
    },
    get count() {
      return timers.size;
    },
    setTimeout(callback, delayMs) {
      return set(callback, delayMs, false);
    },
    clearTimeout: clear,
    setInterval(callback, delayMs) {
      return set(callback, delayMs, true);
    },
    clearInterval: clear,
    async tick(ms = 0) {
      now += Math.max(0, Number(ms) || 0);
      await flushDue();
    },
    async flushAll(limit = 100) {
      for (let index = 0; index < limit && timers.size; index += 1) {
        const nextAt = Math.min(...Array.from(timers.values()).map((timer) => timer.at));
        now = Math.max(now, nextAt);
        await flushDue();
      }
    },
    clearAll() {
      timers.clear();
    }
  };
}

export function createRuntimeSandbox(options = {}) {
  const manualTimers = options.manualTimers === true ? createManualTimers() : null;
  const listeners = new Map();
  const memory = {
    events: [],
    postedMessages: [],
    registeredSchemas: [],
    variables: clone(options.variables, { schema: {}, stat_data: {} }),
    messages: normalizeMessages(options.messages),
    listeners,
    timers: manualTimers
  };
  if (!Object.prototype.hasOwnProperty.call(memory.variables, 'schema')) memory.variables.schema = {};
  if (!isObject(memory.variables.stat_data)) memory.variables.stat_data = {};

  class TestEvent {
    constructor(type, eventOptions = {}) {
      this.type = type;
      this.detail = eventOptions.detail;
    }
  }

  const sandbox = {
    __memory: memory,
    console,
    clearInterval: manualTimers ? manualTimers.clearInterval : clearInterval,
    clearTimeout: manualTimers ? manualTimers.clearTimeout : clearTimeout,
    setInterval: manualTimers ? manualTimers.setInterval : setInterval,
    setTimeout: manualTimers ? manualTimers.setTimeout : setTimeout,
    queueMicrotask,
    CustomEvent: TestEvent,
    Event: TestEvent,
    URL,
    URLSearchParams,
    document: createDocumentStub(),
    localStorage: createStorageStub(),
    sessionStorage: createStorageStub(),
    location: {
      href: 'http://127.0.0.1/st-bridge-test',
      origin: 'http://127.0.0.1'
    },
    navigator: { userAgent: 'node:test' },
    z: createZStub(),
    registerMvuSchema(schema) {
      memory.registeredSchemas.push(schema);
    },
    $: (callback) => {
      if (typeof callback === 'function') callback();
    },
    addEventListener(type, listener) {
      const key = String(type || '');
      if (!key || typeof listener !== 'function') return;
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(String(type || ''))?.delete(listener);
    },
    dispatchEvent(event) {
      memory.events.push(event);
      const key = String(event?.type || '');
      for (const listener of Array.from(listeners.get(key) || [])) {
        listener.call(sandbox, event);
      }
      return true;
    },
    postMessage(message, targetOrigin = '*') {
      memory.postedMessages.push({ message: clone(message, message), targetOrigin });
    },
    async getVariables() {
      return clone(memory.variables, {});
    },
    async insertOrAssignVariables(data) {
      mergeVariables(memory.variables, data);
      return clone(memory.variables, {});
    },
    getChatMessages(messageId) {
      if (messageId === -1) return [clone(memory.messages[memory.messages.length - 1], null)].filter(Boolean);
      const id = Number(messageId);
      if (Number.isFinite(id) && id >= 0) {
        return memory.messages.filter((message) => message.message_id === Math.round(id)).map((message) => clone(message, message));
      }
      return memory.messages.map((message) => clone(message, message));
    },
    async setChatMessages(messages) {
      for (const message of Array.isArray(messages) ? messages : []) {
        const id = Number(message?.message_id);
        if (!Number.isFinite(id) || id < 0) continue;
        const normalizedId = Math.round(id);
        const next = { message_id: normalizedId, message: String(message.message || '') };
        const index = memory.messages.findIndex((item) => item.message_id === normalizedId);
        if (index >= 0) memory.messages[index] = next;
        else memory.messages.push(next);
      }
      memory.messages.sort((left, right) => left.message_id - right.message_id);
      return memory.messages.map((message) => clone(message, message));
    },
    async handleVariablesInMessage(messageId) {
      const id = Number(messageId);
      const message = memory.messages.find((item) => item.message_id === Math.round(id));
      if (!message) return { ok: false, reason: 'message_not_found' };
      const patches = [];
      const re = /<JSONPatch>([\s\S]*?)<\/JSONPatch>/gi;
      let match = null;
      while ((match = re.exec(message.message))) {
        patches.push(...JSON.parse(match[1].trim()));
      }
      applyJsonPatch(memory.variables.stat_data, patches);
      return { ok: true, patchCount: patches.length };
    }
  };

  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  sandbox.parent = sandbox;
  sandbox.top = sandbox;
  sandbox.unsafeWindow = sandbox;

  return vm.createContext(sandbox);
}

export async function runScript(context, relativePath, options = {}) {
  const filename = path.join(ST_BRIDGE_ROOT, relativePath);
  const rawSource = await readFile(filename, 'utf8');
  const source = typeof options.transformSource === 'function'
    ? options.transformSource(rawSource)
    : rawSource;
  const script = new vm.Script(source, { filename });
  script.runInContext(context);
  return context;
}

function transformSchemaSource(source) {
  return source
    .replace(/import\s+\{\s*registerMvuSchema\s*\}\s+from\s+['"]https?:\/\/[^'"]+['"];\s*/g, '')
    .replace(/\bexport\s+(function|const|let|var|class)\s+/g, '$1 ');
}

export async function loadCore(context) {
  await runScript(context, 'packs/pkm-core.js');
  return context.PKMPackCore;
}

export async function loadSchema(context, product = 'main') {
  const schemaPath = product === 'universal'
    ? 'packs/pkm-universal/pkm-universal-schema.js'
    : 'packs/pkm-main/pkm-main-schema.js';
  await runScript(context, schemaPath, { transformSource: transformSchemaSource });
  return product === 'universal'
    ? context.PKMUniversalSchemaRuntime
    : context.PKMMainSchemaRuntime;
}

export async function loadCommonRuntime(context, product = 'main') {
  await loadCore(context);
  const schema = await loadSchema(context, product);
  await runScript(context, 'packs/pkm-common/context.mvuz.js');
  await runScript(context, 'packs/pkm-common/state-replay.mvuz.js');
  await runScript(context, 'packs/pkm-common/actions-api.mvuz.js');
  return {
    core: context.PKMPackCore,
    common: context.PKMCommonRuntime,
    schema
  };
}

export async function loadDashboardRuntime(context, product = 'main') {
  const runtime = await loadCommonRuntime(context, product);
  await runScript(context, 'packs/pkm-common/scheduler.mvuz.js');
  await runScript(context, 'packs/pkm-common/dashboard-host.mvuz.js');
  return runtime;
}

export async function listBridgeSourceFiles() {
  const files = [];
  async function walk(relativeDir) {
    const absoluteDir = path.join(ST_BRIDGE_ROOT, relativeDir);
    const entries = await readdir(absoluteDir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = path.join(relativeDir, entry.name);
      if (entry.isDirectory()) {
        if (relativePath === 'tests') continue;
        await walk(relativePath);
        continue;
      }
      if (/\.(?:js|mjs)$/.test(entry.name)) files.push(relativePath);
    }
  }
  await walk('.');
  return files.sort();
}

export { applyJsonPatch, clone };
