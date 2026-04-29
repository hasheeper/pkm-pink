/**
 * PKM Dashboard Host - MVUZ draft
 *
 * Replaces the ERA dashboard injector. It hosts the dashboard iframe and
 * dispatches UI requests to window.PKMPlugin instead of appending VariableEdit.
 */
(function () {
  'use strict';

  const CORE = window.PKMPackCore || null;
  const HOST_NAME = '[PKM-MVUZ-HOST]';
  const DASHBOARD_URL = window.PKM_MVUZ_DASHBOARD_URL || 'https://hasheeper.github.io/pkm-pink/containers/app.html?app=dashboard-main';
  const PRODUCT = window.PKM_MVUZ_PRODUCT || 'main';
  const IDS = {
    style: 'pkm-mvuz-host-style',
    container: 'pkm-mvuz-host-container',
    trigger: 'pkm-mvuz-host-trigger',
    overlay: 'pkm-mvuz-host-overlay',
    wrapper: 'pkm-mvuz-host-wrapper',
    frame: 'pkm-mvuz-host-frame',
    close: 'pkm-mvuz-host-close'
  };

  const runtime = {
    frameLoaded: false,
    refreshTimer: null,
    handlers: {}
  };

  function getPlugin() {
    return window.PKMPlugin || window.top?.PKMPlugin || window.parent?.PKMPlugin || null;
  }

  async function waitForPlugin(timeoutMs = 5000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const plugin = getPlugin();
      if (plugin && typeof plugin.loadState === 'function') return plugin;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return getPlugin();
  }

  function removeExisting() {
    Object.values(IDS).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  function injectStyle() {
    const style = document.createElement('style');
    style.id = IDS.style;
    style.textContent = `
#${IDS.container} {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 99999;
}
#${IDS.trigger} {
  width: 50px;
  height: 50px;
  border: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 165, 0, 0.5);
  font: 900 12px/1 system-ui, sans-serif;
  color: #1f2937;
}
#${IDS.overlay} {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  pointer-events: auto;
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 2147483646;
  overflow: hidden;
}
#${IDS.wrapper} {
  position: relative;
  width: min(485px, 100vw);
  height: min(850px, 95vh);
}
#${IDS.frame} {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  background: #f2f4f8;
}
#${IDS.close} {
  position: absolute;
  top: -5px;
  right: -10px;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  color: #636e72;
  font: 800 22px/1 system-ui, sans-serif;
}
`;
    document.head.appendChild(style);
  }

  function buildDom() {
    removeExisting();
    injectStyle();

    const container = document.createElement('div');
    container.id = IDS.container;

    const trigger = document.createElement('button');
    trigger.id = IDS.trigger;
    trigger.type = 'button';
    trigger.textContent = 'PKM';
    trigger.title = 'Open PKM dashboard';

    const overlay = document.createElement('div');
    overlay.id = IDS.overlay;

    const wrapper = document.createElement('div');
    wrapper.id = IDS.wrapper;

    const frame = document.createElement('iframe');
    frame.id = IDS.frame;
    frame.src = DASHBOARD_URL;
    frame.sandbox = 'allow-scripts allow-forms allow-modals allow-popups allow-same-origin';
    frame.allow = 'fullscreen';

    const close = document.createElement('button');
    close.id = IDS.close;
    close.type = 'button';
    close.textContent = '×';
    close.title = 'Close';

    wrapper.appendChild(frame);
    wrapper.appendChild(close);
    overlay.appendChild(wrapper);
    container.appendChild(trigger);
    document.body.appendChild(container);
    document.body.appendChild(overlay);

    runtime.frame = frame;
    runtime.overlay = overlay;
    runtime.wrapper = wrapper;
    return { trigger, overlay, wrapper, frame, close };
  }

  async function loadStateSnapshot() {
    const plugin = await waitForPlugin();
    if (!plugin || typeof plugin.loadState !== 'function') return null;
    try {
      return await plugin.loadState();
    } catch (error) {
      console.error(`${HOST_NAME} loadState failed`, error);
      return null;
    }
  }

  function postToFrame(type, payload) {
    if (!runtime.frame?.contentWindow) return;
    runtime.frame.contentWindow.postMessage({
      type,
      product: PRODUCT,
      payload,
      data: payload
    }, '*');
  }

  async function pushState() {
    const state = await loadStateSnapshot();
    if (!state) return;
    postToFrame('PKM_STATE_PUSH', state);
    // Compatibility for existing dashboards while they still expect ERA-like data.
    postToFrame('PKM_ERA_DATA', mvuzToLegacyDashboardSnapshot(state));
  }

  function schedulePushState(delay = 100) {
    if (runtime.refreshTimer) clearTimeout(runtime.refreshTimer);
    runtime.refreshTimer = setTimeout(() => {
      runtime.refreshTimer = null;
      pushState();
    }, delay);
  }

  function mvuzToLegacyDashboardSnapshot(state) {
    if (CORE?.legacyDashboardShape) return CORE.legacyDashboardShape(state);

    const party = {};
    (state.party?.slots || []).forEach((pokemon, index) => {
      party[`slot${index + 1}`] = pokemon;
    });
    party.transfer_buffer = state.party?.transferBuffer || null;

    const box = {};
    const firstBox = state.box?.boxes?.[0]?.slots || [];
    firstBox.forEach((pokemon, index) => {
      box[`storage_${String(index + 1).padStart(2, '0')}`] = pokemon;
    });

    return {
      player: {
        ...state.player,
        party,
        box
      },
      world_state: state.world,
      settings: state.settings
    };
  }

  async function dispatchAction(action, payload) {
    const plugin = await waitForPlugin();
    if (!plugin || typeof plugin.dispatchAction !== 'function') {
      console.warn(`${HOST_NAME} PKMPlugin.dispatchAction unavailable`);
      return;
    }
    await plugin.dispatchAction(action, payload);
    schedulePushState();
  }

  async function handleMessage(event) {
    const msg = event?.data;
    if (!msg || typeof msg !== 'object') return;

    if (msg.type === 'PKM_READY' || msg.type === 'ST_BRIDGE_READY') {
      pushState();
      return;
    }

    if (msg.type === 'PKM_ACTION' || msg.type === 'ST_BRIDGE_ACTION') {
      await dispatchAction(msg.action, msg.payload || msg.data);
      return;
    }

    // Compatibility with current dashboard ERA protocol.
    if (msg.type === 'PKM_SET_LEADER') {
      await dispatchAction('party.setLead', msg.data || msg.payload);
      return;
    }

    if (msg.type === 'PKM_UPDATE_SETTINGS') {
      await dispatchAction('settings.update', msg.data || msg.payload);
      return;
    }

    if (msg.type === 'PKM_UPDATE_MOVES') {
      await dispatchAction('party.updateMove', {
        slotKey: msg.slotKey,
        moves: msg.moves
      });
      return;
    }

    if (msg.type === 'PKM_MAP_FULLSCREEN') {
      setFullscreen(msg.fullscreen === true);
    }
  }

  function setFullscreen(enabled) {
    if (!runtime.wrapper || !runtime.overlay || !runtime.frame) return;
    if (enabled) {
      runtime.wrapper.style.width = '100vw';
      runtime.wrapper.style.height = '100vh';
      runtime.frame.style.borderRadius = '0';
    } else {
      runtime.wrapper.style.width = 'min(485px, 100vw)';
      runtime.wrapper.style.height = 'min(850px, 95vh)';
      runtime.frame.style.borderRadius = '24px';
    }
    setTimeout(() => postToFrame('MAP_RESIZE', {}), 150);
  }

  function openOverlay() {
    runtime.overlay.style.display = 'flex';
    schedulePushState(0);
  }

  function closeOverlay() {
    runtime.overlay.style.display = 'none';
  }

  function teardown() {
    window.removeEventListener('message', runtime.handlers.message);
    window.removeEventListener('pagehide', runtime.handlers.teardown);
    document.removeEventListener('keydown', runtime.handlers.keydown);
    if (runtime.refreshTimer) clearTimeout(runtime.refreshTimer);
    removeExisting();
    delete window.__pkmMvuzDashboardHost;
  }

  async function init() {
    if (window.__pkmMvuzDashboardHost?.teardown) {
      window.__pkmMvuzDashboardHost.teardown();
    }
    const dom = buildDom();
    runtime.handlers.message = handleMessage;
    runtime.handlers.teardown = teardown;
    runtime.handlers.keydown = (event) => {
      if (event.key === 'Escape') closeOverlay();
    };

    dom.trigger.addEventListener('click', openOverlay);
    dom.close.addEventListener('click', closeOverlay);
    dom.overlay.addEventListener('click', (event) => {
      if (event.target === dom.overlay) closeOverlay();
    });
    dom.frame.addEventListener('load', () => {
      runtime.frameLoaded = true;
      schedulePushState(100);
    });
    window.addEventListener('message', handleMessage);
    window.addEventListener('pagehide', teardown);
    document.addEventListener('keydown', runtime.handlers.keydown);

    if (typeof eventOn === 'function') {
      eventOn('message_updated', () => schedulePushState());
      eventOn('chat_changed', () => schedulePushState());
      eventOn('generation_ended', () => schedulePushState());
    }

    window.__pkmMvuzDashboardHost = { teardown, pushState };
    await waitForPlugin();
    schedulePushState(100);
    console.log(`${HOST_NAME} loaded`);
  }

  init().catch(error => {
    console.error(`${HOST_NAME} failed to initialize`, error);
  });
})();
