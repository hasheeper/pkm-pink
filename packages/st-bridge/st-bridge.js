/**
 * ST Bridge
 * A single-file, product-neutral bridge for SillyTavern dashboards.
 *
 * The bridge owns ST/MVU/message/prompt/iframe plumbing. Product logic belongs
 * in profiles registered at runtime.
 */
(function () {
  'use strict';

  const VERSION = '0.1.0';
  const ROOT = typeof unsafeWindow !== 'undefined'
    ? unsafeWindow
    : (typeof window !== 'undefined' ? window : globalThis);

  const runtime = {
    config: {
      appId: 'app',
      product: 'default',
      namespace: 'app',
      stateMode: 'mvu-message',
      dashboardUrl: '',
      autoMount: true,
      promptOnce: true,
      debug: false
    },
    initialized: false,
    disposers: [],
    frame: null,
    overlay: null,
    trigger: null,
    profile: null,
    providers: [],
    actions: Object.create(null),
    profiles: Object.create(null),
    processedMessages: new Set()
  };

  const log = {
    info(...args) {
      if (runtime.config.debug) console.log('[ST Bridge]', ...args);
    },
    warn(...args) {
      console.warn('[ST Bridge]', ...args);
    },
    error(...args) {
      console.error('[ST Bridge]', ...args);
    }
  };

  const utils = {
    clone(value) {
      if (value == null) return value;
      try {
        return JSON.parse(JSON.stringify(value));
      } catch (_) {
        return value;
      }
    },

    mergeConfig(base, extra) {
      const next = Object.assign({}, base, extra || {});
      if (base.profile || extra?.profile) {
        next.profile = Object.assign({}, base.profile || {}, extra?.profile || {});
      }
      return next;
    },

    getPath(object, path, fallback) {
      if (!path) return object == null ? fallback : object;
      const parts = String(path).split('.').filter(Boolean);
      let cursor = object;
      for (const part of parts) {
        if (cursor == null || typeof cursor !== 'object' || !(part in cursor)) return fallback;
        cursor = cursor[part];
      }
      return cursor == null ? fallback : cursor;
    },

    setPath(object, path, value) {
      const parts = String(path || '').split('.').filter(Boolean);
      if (!parts.length) return value;
      let cursor = object;
      for (let i = 0; i < parts.length - 1; i += 1) {
        const part = parts[i];
        if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
        cursor = cursor[part];
      }
      cursor[parts[parts.length - 1]] = value;
      return object;
    },

    stripCodeFence(text) {
      return String(text || '')
        .trim()
        .replace(/^```(?:json|js|javascript)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
    },

    normalizeProvider(provider) {
      return Object.assign({
        priority: 0,
        position: 'in_chat',
        depth: 0,
        role: 'system',
        should_scan: false
      }, provider || {});
    },

    createId(...parts) {
      return parts
        .filter(part => part != null && String(part).trim())
        .map(part => String(part).trim().replace(/[^a-zA-Z0-9_.:-]+/g, '_'))
        .join(':');
    }
  };

  const st = {
    has(name) {
      return typeof ROOT[name] === 'function';
    },

    on(eventName, handler) {
      if (!eventName || typeof handler !== 'function') return () => {};
      if (st.has('eventOn')) {
        const result = ROOT.eventOn(eventName, handler);
        return () => {
          try {
            if (result && typeof result.stop === 'function') result.stop();
            else if (st.has('eventRemoveListener')) ROOT.eventRemoveListener(eventName, handler);
          } catch (_) {}
        };
      }
      return () => {};
    },

    once(eventName, handler) {
      if (!eventName || typeof handler !== 'function') return () => {};
      if (st.has('eventOnce')) {
        const result = ROOT.eventOnce(eventName, handler);
        return () => {
          try {
            if (result && typeof result.stop === 'function') result.stop();
          } catch (_) {}
        };
      }
      let stop = () => {};
      const wrapped = (...args) => {
        stop();
        handler(...args);
      };
      stop = st.on(eventName, wrapped);
      return stop;
    },

    emit(eventName, ...args) {
      if (st.has('eventEmit')) return ROOT.eventEmit(eventName, ...args);
      return Promise.resolve();
    },

    getVariables(option) {
      if (st.has('getVariables')) return ROOT.getVariables(option || { type: 'message' }) || {};
      return {};
    },

    replaceVariables(variables, option) {
      if (st.has('replaceVariables')) return ROOT.replaceVariables(variables, option || { type: 'message' });
      return undefined;
    },

    updateVariablesWith(updater, option) {
      const target = option || { type: 'message' };
      if (st.has('updateVariablesWith')) return ROOT.updateVariablesWith(updater, target);
      if (st.has('replaceVariables')) {
        const current = st.getVariables(target);
        const next = updater(utils.clone(current) || {});
        return Promise.resolve(next).then(resolved => {
          st.replaceVariables(resolved, target);
          return resolved;
        });
      }
      return Promise.resolve({});
    },

    injectPrompts(prompts, options) {
      if (st.has('injectPrompts')) return ROOT.injectPrompts(prompts, options);
      return null;
    },

    uninjectPrompts(ids) {
      if (st.has('uninjectPrompts')) ROOT.uninjectPrompts(ids);
    },

    getLastMessageId() {
      if (st.has('getLastMessageId')) return ROOT.getLastMessageId();
      return null;
    },

    getChatMessages(range, options) {
      if (st.has('getChatMessages')) return ROOT.getChatMessages(range, options) || [];
      return [];
    },

    setChatMessages(messages, options) {
      if (st.has('setChatMessages')) return ROOT.setChatMessages(messages, options);
      return Promise.resolve();
    },

    createChatMessages(messages, options) {
      if (st.has('createChatMessages')) return ROOT.createChatMessages(messages, options);
      return Promise.resolve();
    },

    getContext() {
      if (st.has('getContext')) return ROOT.getContext();
      return null;
    },

    registerVariableSchema(schema, option) {
      if (st.has('registerVariableSchema')) {
        ROOT.registerVariableSchema(schema, option || { type: 'message' });
      }
    },

    registerMvuSchema(schema, option) {
      if (st.has('registerMvuSchema')) {
        ROOT.registerMvuSchema(schema, option || { type: 'message' });
      }
    }
  };

  const validators = {
    validate(schema, value) {
      if (!schema) return { ok: true, value };
      try {
        if (typeof schema === 'function') {
          const result = schema(value);
          return { ok: true, value: result === undefined ? value : result };
        }
        if (schema && typeof schema.safeParse === 'function') {
          const result = schema.safeParse(value);
          return result.success
            ? { ok: true, value: result.data }
            : { ok: false, error: result.error };
        }
        if (schema && typeof schema.parse === 'function') {
          return { ok: true, value: schema.parse(value) };
        }
      } catch (error) {
        return { ok: false, error };
      }
      return { ok: true, value };
    }
  };

  const stateAdapters = {
    'mvu-message': {
      load() {
        const vars = st.getVariables({ type: 'message' });
        const statData = vars?.stat_data || {};
        const raw = runtime.config.namespace
          ? statData[runtime.config.namespace]
          : statData;
        return raw == null ? utils.clone(runtime.config.defaultState || {}) : utils.clone(raw);
      },

      async save(nextState) {
        const namespace = runtime.config.namespace;
        await st.updateVariablesWith((vars) => {
          const nextVars = vars && typeof vars === 'object' ? vars : {};
          nextVars.stat_data = nextVars.stat_data && typeof nextVars.stat_data === 'object'
            ? nextVars.stat_data
            : {};
          if (namespace) nextVars.stat_data[namespace] = nextState;
          else nextVars.stat_data = nextState;
          return nextVars;
        }, { type: 'message' });
        return nextState;
      }
    },

    'era-legacy': {
      load() {
        return new Promise((resolve) => {
          if (!st.has('eventEmit') || !st.has('eventOn')) {
            resolve(utils.clone(runtime.config.defaultState || {}));
            return;
          }

          const timeout = setTimeout(() => {
            stop();
            resolve(utils.clone(runtime.config.defaultState || {}));
          }, runtime.config.eraTimeoutMs || 3000);

          const stop = st.on('era:queryResult', (detail) => {
            if (detail?.queryType !== 'getCurrentVars') return;
            clearTimeout(timeout);
            stop();
            const raw = detail.result?.statWithoutMeta || {};
            const value = runtime.config.namespace
              ? utils.getPath(raw, runtime.config.namespace, raw[runtime.config.namespace])
              : raw;
            resolve(utils.clone(value || runtime.config.defaultState || {}));
          });

          st.emit('era:getCurrentVars');
        });
      },

      async save(nextState) {
        const payload = runtime.config.namespace
          ? utils.setPath({}, runtime.config.namespace, nextState)
          : nextState;
        await st.emit('era:updateByObject', payload);
        return nextState;
      }
    }
  };

  const state = {
    adapter() {
      return stateAdapters[runtime.config.stateMode] || stateAdapters['mvu-message'];
    },

    async load() {
      return state.adapter().load();
    },

    async save(nextState) {
      const normalized = await state.normalize(nextState);
      const validation = validators.validate(runtime.profile?.schema || runtime.config.schema, normalized);
      if (!validation.ok) {
        log.error('State validation failed', validation.error);
        throw validation.error || new Error('State validation failed');
      }
      const saved = await state.adapter().save(validation.value);
      iframe.pushState(saved);
      return saved;
    },

    async patch(patcher) {
      const current = await state.load();
      const next = await patcher(utils.clone(current));
      return state.save(next === undefined ? current : next);
    },

    async normalize(value) {
      const normalizers = [
        runtime.profile?.normalizeState,
        runtime.config.normalizeState
      ].filter(fn => typeof fn === 'function');

      let next = utils.clone(value);
      for (const normalizer of normalizers) {
        const result = await normalizer(next, context());
        if (result !== undefined) next = result;
      }
      return next;
    },

    async backup() {
      const key = utils.createId('__st_bridge_backup__', runtime.config.appId, runtime.config.product);
      try {
        ROOT[key] = {
          at: new Date().toISOString(),
          state: await state.load()
        };
      } catch (_) {}
      return ROOT[key];
    },

    registerSchema(schema) {
      runtime.config.schema = schema;
      st.registerVariableSchema(schema, { type: 'message' });
      st.registerMvuSchema(schema, { type: 'message' });
    }
  };

  const prompt = {
    registerProvider(provider) {
      if (!provider || !provider.id || typeof provider.build !== 'function') {
        throw new Error('Prompt provider requires id and build(ctx)');
      }
      const normalized = utils.normalizeProvider(provider);
      runtime.providers = runtime.providers.filter(existing => existing.id !== normalized.id);
      runtime.providers.push(normalized);
      runtime.providers.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      return () => {
        runtime.providers = runtime.providers.filter(existing => existing.id !== normalized.id);
      };
    },

    async buildAll() {
      const currentState = await state.load();
      const ctx = context({ state: currentState });
      const prompts = [];

      for (const provider of runtime.providers) {
        if (typeof provider.enabled === 'function') {
          const enabled = await provider.enabled(ctx);
          if (!enabled) continue;
        }
        const content = await provider.build(ctx);
        if (!content) continue;
        prompts.push({
          id: provider.namespaced === false
            ? provider.id
            : utils.createId(runtime.config.appId, runtime.config.product, provider.id),
          position: provider.position,
          depth: provider.depth,
          role: provider.role,
          content: String(content),
          should_scan: provider.should_scan
        });
      }

      return prompts;
    },

    async injectAll() {
      const prompts = await prompt.buildAll();
      if (!prompts.length) return { prompts, injected: false };
      st.uninjectPrompts(prompts.map(item => item.id));
      st.injectPrompts(prompts, { once: runtime.config.promptOnce !== false });
      return { prompts, injected: true };
    },

    clear(ids) {
      st.uninjectPrompts(ids);
    }
  };

  const artifact = {
    parse(text, tag, schema) {
      if (!tag) throw new Error('artifact.parse requires a tag');
      const re = new RegExp(`<${escapeRegExp(tag)}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapeRegExp(tag)}>`, 'i');
      const match = String(text || '').match(re);
      if (!match) return null;

      const raw = utils.stripCodeFence(match[1]);
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch (error) {
        log.warn(`Failed to parse <${tag}> JSON`, error);
        return { ok: false, tag, raw, error };
      }

      const validation = validators.validate(schema, data);
      if (!validation.ok) return { ok: false, tag, raw, data, error: validation.error };
      return { ok: true, tag, raw, data: validation.value };
    },

    parseAll(text, tags) {
      const result = {};
      for (const tag of tags || []) result[tag] = artifact.parse(text, tag);
      return result;
    }
  };

  const messages = {
    latest() {
      const id = st.getLastMessageId();
      if (id == null) return null;
      return st.getChatMessages(id)[0] || null;
    },

    async appendTag(messageId, tag, payload) {
      const messagesForId = st.getChatMessages(messageId);
      const message = messagesForId[0];
      if (!message) return false;
      const body = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
      const block = `<${tag}>\n${body}\n</${tag}>`;
      await st.setChatMessages([{
        message_id: messageId,
        message: `${String(message.message || '').trim()}\n\n${block}`
      }], { refresh: 'affected' });
      return true;
    },

    markProcessed(messageId, key) {
      runtime.processedMessages.add(`${messageId}:${key || 'default'}`);
    },

    isProcessed(messageId, key) {
      return runtime.processedMessages.has(`${messageId}:${key || 'default'}`);
    }
  };

  const iframe = {
    mount(options) {
      if (typeof document === 'undefined') return null;
      const opts = Object.assign({}, runtime.config.ui || {}, options || {});
      const ids = {
        style: utils.createId(runtime.config.appId, runtime.config.product, 'st-bridge-style'),
        trigger: utils.createId(runtime.config.appId, runtime.config.product, 'st-bridge-trigger'),
        overlay: utils.createId(runtime.config.appId, runtime.config.product, 'st-bridge-overlay'),
        wrapper: utils.createId(runtime.config.appId, runtime.config.product, 'st-bridge-wrapper'),
        iframe: utils.createId(runtime.config.appId, runtime.config.product, 'st-bridge-iframe'),
        close: utils.createId(runtime.config.appId, runtime.config.product, 'st-bridge-close')
      };

      iframe.unmount();
      injectStyle(ids.style, opts);

      const trigger = document.createElement('button');
      trigger.id = ids.trigger;
      trigger.type = 'button';
      trigger.className = 'st-bridge-trigger';
      trigger.textContent = opts.triggerLabel || runtime.config.product || 'APP';
      trigger.title = opts.triggerTitle || 'Open dashboard';

      const overlay = document.createElement('div');
      overlay.id = ids.overlay;
      overlay.className = 'st-bridge-overlay';
      overlay.style.display = 'none';

      const wrapper = document.createElement('div');
      wrapper.id = ids.wrapper;
      wrapper.className = 'st-bridge-wrapper';

      const close = document.createElement('button');
      close.id = ids.close;
      close.type = 'button';
      close.className = 'st-bridge-close';
      close.textContent = '×';
      close.title = 'Close';

      const frame = document.createElement('iframe');
      frame.id = ids.iframe;
      frame.className = 'st-bridge-frame';
      frame.sandbox = opts.sandbox || 'allow-scripts allow-forms allow-modals allow-popups allow-same-origin';
      frame.allow = opts.allow || 'fullscreen';
      frame.src = runtime.config.dashboardUrl || 'about:blank';

      wrapper.appendChild(frame);
      wrapper.appendChild(close);
      overlay.appendChild(wrapper);
      document.body.appendChild(trigger);
      document.body.appendChild(overlay);

      runtime.trigger = trigger;
      runtime.overlay = overlay;
      runtime.frame = frame;

      const open = async () => {
        overlay.style.display = 'flex';
        iframe.pushState(await state.load());
      };
      const hide = () => {
        overlay.style.display = 'none';
      };
      const onOverlayClick = (event) => {
        if (event.target === overlay) hide();
      };
      const onKeydown = (event) => {
        if (event.key === 'Escape') hide();
      };
      const onFrameLoad = async () => {
        iframe.pushState(await state.load());
      };
      const onMessage = (event) => iframe.onMessage(event);

      trigger.addEventListener('click', open);
      close.addEventListener('click', hide);
      overlay.addEventListener('click', onOverlayClick);
      document.addEventListener('keydown', onKeydown);
      frame.addEventListener('load', onFrameLoad);
      ROOT.addEventListener?.('message', onMessage);

      runtime.disposers.push(() => trigger.removeEventListener('click', open));
      runtime.disposers.push(() => close.removeEventListener('click', hide));
      runtime.disposers.push(() => overlay.removeEventListener('click', onOverlayClick));
      runtime.disposers.push(() => document.removeEventListener('keydown', onKeydown));
      runtime.disposers.push(() => frame.removeEventListener('load', onFrameLoad));
      runtime.disposers.push(() => ROOT.removeEventListener?.('message', onMessage));
      runtime.disposers.push(() => iframe.unmount());

      return frame;
    },

    unmount() {
      if (runtime.trigger?.parentNode) runtime.trigger.parentNode.removeChild(runtime.trigger);
      if (runtime.overlay?.parentNode) runtime.overlay.parentNode.removeChild(runtime.overlay);
      runtime.trigger = null;
      runtime.overlay = null;
      runtime.frame = null;
    },

    post(type, payload) {
      if (!runtime.frame?.contentWindow) return false;
      runtime.frame.contentWindow.postMessage({
        type,
        appId: runtime.config.appId,
        product: runtime.config.product,
        payload
      }, runtime.config.targetOrigin || '*');
      return true;
    },

    pushState(nextState) {
      return iframe.post('ST_BRIDGE_STATE_PUSH', nextState);
    },

    reply(event, type, payload) {
      const target = event?.source;
      if (!target || typeof target.postMessage !== 'function') return false;
      target.postMessage({
        type,
        appId: runtime.config.appId,
        product: runtime.config.product,
        payload
      }, runtime.config.targetOrigin || '*');
      return true;
    },

    onMessage(event) {
      const msg = event?.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.appId && msg.appId !== runtime.config.appId) return;
      if (msg.product && msg.product !== runtime.config.product) return;

      if (msg.type === 'ST_BRIDGE_READY') {
        state.load().then(nextState => {
          iframe.reply(event, 'ST_BRIDGE_STATE_PUSH', nextState);
        });
        return;
      }

      if (msg.type === 'ST_BRIDGE_ACTION') {
        actions.dispatch(msg.action, msg.payload, event);
      }
    }
  };

  const actions = {
    register(name, handler) {
      if (!name || typeof handler !== 'function') {
        throw new Error('Action requires name and handler(ctx)');
      }
      runtime.actions[name] = handler;
      return () => {
        delete runtime.actions[name];
      };
    },

    registerAll(actionMap) {
      for (const [name, handler] of Object.entries(actionMap || {})) {
        actions.register(name, handler);
      }
    },

    async dispatch(name, payload, event) {
      const handler = runtime.actions[name];
      if (!handler) {
        const error = `Unknown action: ${name}`;
        log.warn(error);
        iframe.reply(event, 'ST_BRIDGE_ERROR', { action: name, error });
        return null;
      }

      try {
        const nextState = await state.patch(async currentState => {
          const result = await handler(context({ state: currentState, payload, event, action: name }));
          return result === undefined ? currentState : result;
        });
        iframe.reply(event, 'ST_BRIDGE_ACTION_RESULT', { action: name, ok: true });
        return nextState;
      } catch (error) {
        log.error(`Action failed: ${name}`, error);
        iframe.reply(event, 'ST_BRIDGE_ERROR', { action: name, error: String(error?.message || error) });
        return null;
      }
    }
  };

  const profiles = {
    register(id, profile) {
      if (!id || !profile) throw new Error('Profile requires id and definition');
      runtime.profiles[id] = profile;
      return () => {
        delete runtime.profiles[id];
      };
    },

    resolve(config) {
      if (config.profile && typeof config.profile === 'object') return config.profile;
      const candidates = [
        config.profileId,
        utils.createId(config.appId, config.product),
        config.product,
        config.appId
      ].filter(Boolean);
      for (const id of candidates) {
        if (runtime.profiles[id]) return runtime.profiles[id];
      }
      return {};
    },

    apply(profile) {
      runtime.profile = profile || {};
      if (runtime.profile.schema) state.registerSchema(runtime.profile.schema);
      if (runtime.profile.defaultState && runtime.config.defaultState == null) {
        runtime.config.defaultState = runtime.profile.defaultState;
      }
      for (const provider of runtime.profile.promptProviders || []) {
        prompt.registerProvider(provider);
      }
      actions.registerAll(runtime.profile.actions);
    }
  };

  function context(extra) {
    return Object.assign({
      bridge: api,
      config: runtime.config,
      profile: runtime.profile,
      st,
      utils,
      tavernContext: st.getContext()
    }, extra || {});
  }

  async function handleGenerationEnded(detail) {
    if (typeof runtime.profile?.onGenerationEnded === 'function') {
      await runtime.profile.onGenerationEnded(context({ detail }));
    }
  }

  function resetRuntime(reason) {
    runtime.processedMessages.clear();
    if (typeof runtime.profile?.onReset === 'function') {
      runtime.profile.onReset(context({ reason }));
    }
  }

  async function init(userConfig) {
    if (runtime.initialized) destroy();

    const externalConfig = ROOT.ST_BRIDGE_CONFIG || {};
    runtime.config = utils.mergeConfig(runtime.config, externalConfig);
    runtime.config = utils.mergeConfig(runtime.config, userConfig || {});

    const profile = profiles.resolve(runtime.config);
    profiles.apply(profile);

    runtime.disposers.push(st.on('GENERATION_AFTER_COMMANDS', () => prompt.injectAll()));
    runtime.disposers.push(st.on('generation_ended', detail => handleGenerationEnded(detail)));
    runtime.disposers.push(st.on('chat_changed', () => resetRuntime('chat_changed')));
    runtime.disposers.push(st.on('message_swiped', () => resetRuntime('message_swiped')));
    runtime.disposers.push(st.on('message_edited', () => resetRuntime('message_edited')));

    if (runtime.config.autoMount !== false) iframe.mount();
    runtime.initialized = true;

    if (typeof runtime.profile?.onInit === 'function') {
      await runtime.profile.onInit(context());
    }

    log.info('initialized', runtime.config);
    return api;
  }

  function destroy() {
    while (runtime.disposers.length) {
      const dispose = runtime.disposers.pop();
      try {
        dispose();
      } catch (_) {}
    }
    iframe.unmount();
    runtime.providers = [];
    runtime.actions = Object.create(null);
    runtime.profile = null;
    runtime.processedMessages.clear();
    runtime.initialized = false;
  }

  function injectStyle(id, opts) {
    if (typeof document === 'undefined') return;
    const old = document.getElementById(id);
    if (old) old.remove();

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
.st-bridge-trigger {
  position: fixed;
  right: ${opts.right || '20px'};
  top: ${opts.top || '80px'};
  z-index: 2147483646;
  min-width: 54px;
  height: 54px;
  border: 1px solid rgba(255,255,255,.22);
  border-radius: 999px;
  background: ${opts.triggerBackground || 'linear-gradient(135deg, #1f2937, #2563eb)'};
  color: ${opts.triggerColor || '#fff'};
  font: 800 12px/1 system-ui, sans-serif;
  cursor: pointer;
  box-shadow: 0 14px 36px rgba(0,0,0,.26);
}
.st-bridge-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483645;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.48);
  backdrop-filter: blur(4px);
}
.st-bridge-wrapper {
  position: relative;
  width: ${opts.width || 'min(485px, 96vw)'};
  height: ${opts.height || 'min(850px, 95vh)'};
}
.st-bridge-frame {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: ${opts.radius || '20px'};
  background: ${opts.frameBackground || '#f2f4f8'};
  box-shadow: 0 24px 60px rgba(0,0,0,.35);
}
.st-bridge-close {
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(0,0,0,.1);
  border-radius: 999px;
  background: rgba(255,255,255,.92);
  color: #111827;
  font: 700 24px/1 system-ui, sans-serif;
  cursor: pointer;
}
`;
    document.head.appendChild(style);
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const api = {
    version: VERSION,
    init,
    destroy,
    registerProfile: profiles.register,
    state,
    prompt,
    artifact,
    iframe,
    actions,
    messages,
    st,
    utils,
    _runtime: runtime
  };

  ROOT.StBridge = api;

  if (ROOT.ST_BRIDGE_AUTO_INIT) {
    init(ROOT.ST_BRIDGE_CONFIG).catch(error => log.error('auto init failed', error));
  }
})();
