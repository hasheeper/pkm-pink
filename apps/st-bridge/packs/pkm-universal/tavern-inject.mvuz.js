/**
 * PKM PINK Universal - MVUZ dashboard/status injector
 *
 * This file intentionally keeps UI/status bridge concerns here:
 * - Floating entry + iframe
 * - MVUZ state push to dashboard/status page
 * - Legacy dashboard message compatibility
 * - Frontend actions -> PKMPlugin.dispatchAction
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const CORE = ROOT.PKMPackCore || null;
  const PLUGIN_NAME = '[PKM Universal Dashboard MVUZ]';
  if (!CORE?.mvu) throw new Error(`${PLUGIN_NAME} requires PKMPackCore. Load pkm-core.js before this script.`);
  const PKM_URL = 'https://hasheeper.github.io/pkm-pink/apps/dashboard-universal/index.html';
  const PRODUCT = 'universal';
  const VERSION = '0.1.0-mvuz-universal';
  const IFRAME_ID = 'pkm-mvuz-iframe';
  const OVERLAY_ID = 'pkm-mvuz-overlay';
  const BALL_ID = 'pkm-mvuz-ball';
  const STYLE_ID = 'pkm-mvuz-style';

  let iframeInitialized = false;
  let refreshTimer = null;
  let transferTimer = null;
  let actionLock = false;
  let dashboardWindow = null;
  const messageTargets =[];
  const pushDedupState = ROOT.__PKM_MVUZ_PUSH_DEDUP__ || { key: '', at: 0, inFlight: false };
  ROOT.__PKM_MVUZ_PUSH_DEDUP__ = pushDedupState;

  function handleLocalStateChanged() {
    scheduleRefresh('stateChanged');
  }

  function waitForJQuery(callback) {
    if (typeof ROOT.jQuery !== 'undefined') {
      callback(ROOT.jQuery);
      return;
    }
    setTimeout(() => waitForJQuery(callback), 100);
  }

  function stateToLegacyDashboard(state) {
    if (ROOT.PKMPlugin?.legacyDashboardShape) {
      return ROOT.PKMPlugin.legacyDashboardShape(state);
    }
    return CORE.legacyDashboardShape(state);
  }

  async function loadMvuzState() {
    if (ROOT.PKMPlugin?.loadState) {
      return ROOT.PKMPlugin.loadState({ persist: false, skipMigration: true, requireExisting: true });
    }
    if (CORE.mvu.readState) return CORE.mvu.readState('stat_data', 'pkm', { type: 'message' });
    if (typeof ROOT.getVariables !== 'function') {
      console.warn(`${PLUGIN_NAME} getVariables is unavailable; cannot read stat_data.pkm`);
      return null;
    }
    try {
      const vars = await ROOT.getVariables({ type: 'message' });
      const state = vars?.stat_data?.pkm || null;
      if (!state) console.warn(`${PLUGIN_NAME} stat_data.pkm is empty`);
      return state;
    } catch (error) {
      console.warn(`${PLUGIN_NAME} failed to read MVUZ state:`, error);
      return null;
    }
  }

  function postToIframe(message) {
    const iframe = ROOT.document?.getElementById(IFRAME_ID);
    const targetWindow = iframe?.contentWindow || dashboardWindow;
    if (!targetWindow) {
      console.warn(`${PLUGIN_NAME} iframe is not ready; skip ${message?.type || 'message'}`);
      return false;
    }
    try {
      targetWindow.postMessage(message, '*');
      return true;
    } catch (error) {
      console.warn(`${PLUGIN_NAME} failed to post message:`, error);
      return false;
    }
  }

  async function pushDashboardState(reason = 'refresh') {
    if (pushDedupState.inFlight) {
      console.log(`${PLUGIN_NAME} skip dashboard push while another push is in flight`, { reason });
      return false;
    }
    pushDedupState.inFlight = true;
    const state = await loadMvuzState();
    if (!state) {
      pushDedupState.inFlight = false;
      return false;
    }
    const legacy = stateToLegacyDashboard(state);
    const payloadKey = JSON.stringify({
      player: legacy?.player?.name,
      party: Object.values(legacy?.player?.party || {}).map((pokemon) => pokemon?.name || null),
      boxCount: Object.keys(legacy?.player?.box || {}).length,
      settings: legacy?.settings || legacy?.player?.settings || {}
    });
    const now = Date.now();
    if (payloadKey === pushDedupState.key && now - pushDedupState.at < 1500) {
      pushDedupState.inFlight = false;
      console.log(`${PLUGIN_NAME} skip duplicate dashboard state`, { reason });
      return false;
    }

    const pushedState = postToIframe({
      type: 'PKM_STATE_PUSH',
      product: PRODUCT,
      version: VERSION,
      reason,
      state,
      legacy
    });

    console.log(`${PLUGIN_NAME} pushed dashboard state`, {
      reason,
      pushedState,
      player: legacy?.player?.name,
      slot1: legacy?.player?.party?.slot1?.name || null
    });
    if (pushedState) {
      pushDedupState.key = payloadKey;
      pushDedupState.at = now;
    }
    pushDedupState.inFlight = false;
    return pushedState;
  }

  function scheduleRefresh(reason = 'refresh') {
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      refreshTimer = null;
      pushDashboardState(reason);
    }, 120);
  }

  async function dispatchAction(action, payload = {}) {
    if (actionLock) return null;
    actionLock = true;
    try {
      if (typeof ROOT.PKMPlugin?.dispatchAction !== 'function') {
        throw new Error('PKMPlugin.dispatchAction is unavailable');
      }
      const state = await ROOT.PKMPlugin.dispatchAction(action, payload);
      await pushDashboardState(`action:${action}`);
      return state;
    } catch (error) {
      console.error(`${PLUGIN_NAME} action failed: ${action}`, error);
      postToIframe({
        type: 'PKM_ACTION_ERROR',
        product: PRODUCT,
        action,
        message: error?.message || String(error)
      });
      return null;
    } finally {
      setTimeout(() => { actionLock = false; }, 150);
    }
  }

  async function handleTransferBuffer() {
    const state = await loadMvuzState();
    if (state?.party?.transferBuffer?.name) {
      await dispatchAction('box.depositTransferBuffer', {});
    }
  }

  function scheduleTransferBufferCheck(reason = 'refresh') {
    if (transferTimer) clearTimeout(transferTimer);
    const delays = [250, 900, 2200];
    let index = 0;
    const run = () => {
      transferTimer = null;
      handleTransferBuffer();
      index += 1;
      if (index < delays.length) transferTimer = setTimeout(run, delays[index]);
    };
    transferTimer = setTimeout(run, delays[index]);
    console.log(`${PLUGIN_NAME} scheduled transferBuffer check`, { reason });
  }

  function handlePromptInjection(eventData) {
    if (!eventData?.id) return;
    try {
      if (typeof ROOT.uninjectPrompts === 'function') {
        try { ROOT.uninjectPrompts([eventData.id]); } catch (_) {}
      }
      if (typeof ROOT.injectPrompts === 'function') {
        ROOT.injectPrompts([{
          id: eventData.id,
          position: eventData.position || 'after_wi_scan',
          depth: eventData.depth || 0,
          role: 'system',
          should_scan: false,
          content: eventData.content || ''
        }]);
      }
    } catch (error) {
      console.error(`${PLUGIN_NAME} prompt injection failed:`, error);
    }
  }

  function handleClearInjection(eventData) {
    if (!eventData?.id || typeof ROOT.uninjectPrompts !== 'function') return;
    try {
      ROOT.uninjectPrompts([eventData.id]);
    } catch (error) {
      console.error(`${PLUGIN_NAME} clear injection failed:`, error);
    }
  }

  function normalizeSetLeaderPayload(data) {
    const targetSlot = data?.targetSlot ?? data?.slot;
    if (typeof targetSlot === 'string' && /^slot\d+$/.test(targetSlot)) {
      return { slot: Number(targetSlot.replace('slot', '')) };
    }
    return { slot: Number(targetSlot) || 1 };
  }

  function normalizeUpdateMovePayload(data) {
    return {
      slot: Number(data?.slot) || 1,
      moveIndex: Number(data?.moveIndex ?? data?.index) || 1,
      move: data?.move || data?.value || null
    };
  }

  function handleWindowMessage(event) {
    const data = event?.data;
    if (!data || !data.type) return;

    if (data.type === 'PKM_READY') {
      console.log(`${PLUGIN_NAME} received PKM_READY`, data);
      if (event?.source && typeof event.source.postMessage === 'function') {
        dashboardWindow = event.source;
      }
      pushDashboardState('initial');
      return;
    }
    if (data.type === 'PKM_REQUEST_STATE') {
      pushDashboardState('request');
      return;
    }
    if (data.type === 'PKM_ACTION') {
      dispatchAction(data.action, data.payload || data.data || {});
      return;
    }
    if (data.type === 'PKM_SET_LEADER') {
      dispatchAction('party.setLead', normalizeSetLeaderPayload(data.data || data));
      return;
    }
    if (data.type === 'PKM_UPDATE_SETTINGS') {
      dispatchAction('settings.update', data.data || data.payload || {});
      return;
    }
    if (data.type === 'PKM_UPDATE_MOVES') {
      dispatchAction('party.updateMove', normalizeUpdateMovePayload(data.data || data.payload || {}));
      return;
    }
    if (data.type === 'PKM_INJECT_LOCATION') {
      handlePromptInjection(data);
      return;
    }
    if (data.type === 'PKM_CLEAR_INJECTION') {
      handleClearInjection(data);
    }
  }

  function exposeGlobals() {
    ROOT.pkmSetLeader = (targetSlot) => dispatchAction('party.setLead', normalizeSetLeaderPayload({ targetSlot }));
    ROOT.pkmUpdateSettings = (settings) => dispatchAction('settings.update', settings || {});
    ROOT.pkmUpdateMove = (payload) => dispatchAction('party.updateMove', normalizeUpdateMovePayload(payload || {}));

    if (typeof ROOT.initializeGlobal === 'function') {
      try {
        ROOT.initializeGlobal('pkmSetLeader', ROOT.pkmSetLeader);
        ROOT.initializeGlobal('pkmUpdateSettings', ROOT.pkmUpdateSettings);
        ROOT.initializeGlobal('pkmUpdateMove', ROOT.pkmUpdateMove);
      } catch (error) {
        console.warn(`${PLUGIN_NAME} initializeGlobal failed:`, error);
      }
    }
  }

  function bindSillyTavernEvents() {
    ROOT.addEventListener?.('pkm:stateChanged', handleLocalStateChanged);
    ROOT.addEventListener?.('pkm:stateChanged', () => scheduleTransferBufferCheck('stateChanged'));
    ROOT.addEventListener?.('st-bridge:state-written', () => scheduleTransferBufferCheck('stateWritten'));
    if (typeof ROOT.eventOn !== 'function') return;
    ROOT.eventOn('pkm:stateChanged', () => {
      scheduleRefresh('stateChanged');
      scheduleTransferBufferCheck('stateChanged');
    });
    ROOT.eventOn('character_message_rendered', () => {
      scheduleRefresh('messageRendered');
      scheduleTransferBufferCheck('messageRendered');
    });
    ROOT.eventOn('message_received', () => {
      scheduleRefresh('messageReceived');
      scheduleTransferBufferCheck('messageReceived');
    });
    ROOT.eventOn('generation_ended', () => {
      scheduleRefresh('generationEnded');
      scheduleTransferBufferCheck('generationEnded');
    });
    ROOT.eventOn('message_updated', () => {
      scheduleRefresh('messageUpdated');
      scheduleTransferBufferCheck('messageUpdated');
    });
    ROOT.eventOn('era:writeDone', () => {
      scheduleRefresh('writeDone');
      scheduleTransferBufferCheck('writeDone');
    });
    ROOT.eventOn('CHAT_CHANGED', () => {
      iframeInitialized = false;
      scheduleRefresh('chatChanged');
    });
    ROOT.eventOn('chat_changed', () => {
      iframeInitialized = false;
      scheduleRefresh('chatChanged');
    });
  }

  function bindMessageTargets() {
    const candidates = [ROOT];
    try { if (ROOT.parent && ROOT.parent !== ROOT) candidates.push(ROOT.parent); } catch (_) {}
    try { if (ROOT.top && ROOT.top !== ROOT && ROOT.top !== ROOT.parent) candidates.push(ROOT.top); } catch (_) {}

    candidates.forEach((target) => {
      if (!target || messageTargets.includes(target)) return;
      try {
        target.removeEventListener?.('message', handleWindowMessage);
        target.addEventListener?.('message', handleWindowMessage);
        messageTargets.push(target);
      } catch (error) {
        console.warn(`${PLUGIN_NAME} failed to bind message target:`, error);
      }
    });
  }

  function injectUi($) {
    $(`#${BALL_ID}, #${OVERLAY_ID}, #${STYLE_ID}`).remove();

    // 统合载入 面板关闭按钮 + 科幻极简悬浮球的 CSS 样式
    const style = `
      <style id="${STYLE_ID}">
        /* 全局悬浮球呼吸动画 */
        @keyframes pkm-mvuz-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        /* 悬浮球伪元素光环旋转 */
        @keyframes pkm-mvuz-spin {
          100% { transform: rotate(360deg); }
        }

        /* ---------------- 科幻悬浮球基础设置 ---------------- */
        #${BALL_ID} {
          position: fixed;
          top: 80px;
          right: 20px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2147483645; /* 确保在面板 Overlay 层之下 */
          
          /* 蓝白透明光泽玻璃质感 */
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(0, 140, 255, 0.1) 100%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.4), 
            0 0 15px rgba(0, 150, 255, 0.15), 
            inset 0 0 12px rgba(255, 255, 255, 0.3);

          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          animation: pkm-mvuz-float 3s ease-in-out infinite;
        }

        /* 科技感呼吸环外圈 */
        #${BALL_ID}::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 1px solid transparent;
          background: linear-gradient(180deg, rgba(0, 212, 255, 0), rgba(0, 212, 255, 0.5)) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          opacity: 0.6;
          animation: pkm-mvuz-spin 4s linear infinite;
        }

        /* 悬停时的光照响应 */
        #${BALL_ID}:hover {
          transform: scale(1.1);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(0, 140, 255, 0.3) 100%);
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.5), 
            0 0 25px rgba(0, 180, 255, 0.4), 
            inset 0 0 15px rgba(255, 255, 255, 0.6);
        }
        #${BALL_ID}:hover::before {
          opacity: 1;
          animation: pkm-mvuz-spin 1.5s linear infinite;
        }

        /* 悬浮球 SVG 核心动态配置 */
        #${BALL_ID} svg {
          width: 24px;
          height: 24px;
          color: #e0f2ff;
          filter: drop-shadow(0 0 4px rgba(0, 180, 255, 0.8));
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease, filter 0.3s ease;
          z-index: 1;
        }
        #${BALL_ID}:hover svg {
          color: #ffffff;
          transform: rotate(90deg) scale(1.1);
          filter: drop-shadow(0 0 8px rgba(0, 212, 255, 1));
        }

        /* ---------------- 面板右上角关闭按钮 ---------------- */
        .pkm-mvuz-close-btn {
          position: absolute;
          top: 6px;
          right: 12px;
          appearance: none;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(25, 25, 25, 0.35);
          color: rgba(255, 255, 255, 0.6);
          border-radius: 10px;
          padding: 8px;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 2;
        }
        .pkm-mvuz-close-btn:hover {
          background: rgba(40, 40, 40, 0.85);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }
        .pkm-mvuz-close-btn:active {
          transform: translateY(0);
        }
      </style>
    `;
    $('head').append(style);

    // 注入科幻极简版的悬浮球（去除了以前厚重的内联圆角样式，统一交给CSS）
    const ball = $('<div>')
      .attr('id', BALL_ID)
      .attr('title', 'PKM Dashboard')
      .html(`
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h7" />
          <path d="M15 12h7" />
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        </svg>
      `);

    const overlay = $('<div>')
      .attr('id', OVERLAY_ID)
      .css({
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.48)',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'auto',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        zIndex: 2147483647, /* 全局最顶层，压住悬浮球 */
        overflow: 'hidden'
      });

    const wrapper = $('<div>')
      .css({
        position: 'relative',
        width: '100%',
        maxWidth: '485px',
        height: '95vh',
        maxHeight: '850px',
        display: 'flex'
      });

    const closeBtn = $('<button>')
      .attr('type', 'button')
      .attr('title', '关闭面板')
      .addClass('pkm-mvuz-close-btn')
      .html('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>');

    const iframe = $('<iframe>')
      .attr('id', IFRAME_ID)
      .css({
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        background: '#f2f4f8',
        overflow: 'hidden'
      });

    wrapper.append(iframe, closeBtn);
    overlay.append(wrapper);
    $('body').append(ball, overlay);

    ball.on('click', () => {
      overlay.css('display', 'flex');
      if (!iframeInitialized) {
        iframe.on('load', () => {
          iframeInitialized = true;
          pushDashboardState('initial');
          try {
            const iframeWindow = iframe[0]?.contentWindow;
            if (iframeWindow) {
              dashboardWindow = iframeWindow;
              iframeWindow.pkmSetLeaderCallback = ROOT.pkmSetLeader;
              iframeWindow.pkmUpdateSettingsCallback = ROOT.pkmUpdateSettings;
              iframeWindow.pkmUpdateMoveCallback = ROOT.pkmUpdateMove;
            }
          } catch (_) {}
        });
        iframe.attr('src', PKM_URL);
      } else {
        pushDashboardState('open');
      }
    });

    closeBtn.on('click', () => overlay.css('display', 'none'));
    overlay.on('click', (event) => {
      if (event.target === overlay[0]) overlay.css('display', 'none');
    });
    $(document).on('keydown.pkmMvuz', (event) => {
      if (event.key === 'Escape' && overlay.css('display') !== 'none') overlay.css('display', 'none');
    });
  }

  function unload() {
    try {
      ROOT.jQuery?.(`#${BALL_ID}, #${OVERLAY_ID}, #${STYLE_ID}`).remove();
      ROOT.jQuery?.(document).off('keydown.pkmMvuz');
    } catch (_) {}
    ROOT.removeEventListener?.('message', handleWindowMessage);
    messageTargets.forEach((target) => {
      try { target.removeEventListener?.('message', handleWindowMessage); } catch (_) {}
    });
    messageTargets.length = 0;
    ROOT.removeEventListener?.('pkm:stateChanged', handleLocalStateChanged);
    ROOT.removeEventListener?.('pagehide', unload);
  }

  exposeGlobals();
  bindSillyTavernEvents();
  bindMessageTargets();
  ROOT.removeEventListener?.('pagehide', unload);
  ROOT.addEventListener?.('pagehide', unload);

  waitForJQuery(($) => {
    injectUi($);
    scheduleRefresh('load');
    console.log(`${PLUGIN_NAME} loaded (${VERSION})`);
  });
})();
