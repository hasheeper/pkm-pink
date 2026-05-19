/**
 * PKM PINK Universal - MVUZ dashboard/status injector
 *
 * This file intentionally keeps UI/status bridge concerns here:
 * - Floating entry + iframe
 * - MVUZ state push to dashboard/status page
 * - Frontend actions -> PKMPlugin.dispatchAction
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const CORE = ROOT.PKMPackCore || null;
  const PLUGIN_NAME = '[PKM Universal Dashboard MVUZ]';
  if (!CORE?.mvu) throw new Error(`${PLUGIN_NAME} requires PKMPackCore. Load pkm-core.js before this script.`);
  const DEFAULT_APP_BASE_URL = 'https://hasheeper.github.io/pkm-pink';
  const DEFAULT_DASHBOARD_URL = `${DEFAULT_APP_BASE_URL}/apps/dashboard-universal/index.html`;
  function trimTrailingSlash(value) {
    return typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
  }
  function resolveDashboardUrl() {
    if (typeof ROOT.PKM_UNIVERSAL_DASHBOARD_URL === 'string' && ROOT.PKM_UNIVERSAL_DASHBOARD_URL.trim()) {
      return ROOT.PKM_UNIVERSAL_DASHBOARD_URL.trim();
    }
    const appBase = trimTrailingSlash(ROOT.PKM_APP_BASE_URL || DEFAULT_APP_BASE_URL);
    return appBase ? `${appBase}/apps/dashboard-universal/index.html` : DEFAULT_DASHBOARD_URL;
  }
  const PKM_URL = resolveDashboardUrl();
  const PRODUCT = 'universal';
  const VERSION = '0.1.0-mvuz-universal';
  const IFRAME_ID = 'pkm-mvuz-iframe';
  const OVERLAY_ID = 'pkm-mvuz-overlay';
  const BALL_ID = 'pkm-mvuz-ball';
  const BALL_COLLAPSED_CLASS = 'pkm-mvuz-ball-collapsed';
  const BALL_COLLAPSED_STORAGE_KEY = 'pkm.mvuz.ballCollapsed';
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

  function clone(value, fallback = null) {
    if (value === undefined || value === null) return fallback;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return fallback;
    }
  }

  function toDashboardPokemon(pokemon, fallback = {}) {
    const next = clone(pokemon, fallback);
    next.moves = CORE.normalizeMovesObject(next.moves);
    return next;
  }

  function stateToDashboardView(state) {
    const maxPartySize = CORE.constants?.MAX_PARTY_SIZE || 6;
    const slots = Array.isArray(state?.party?.slots) ? state.party.slots : [];
    const party = {};
    for (let index = 0; index < maxPartySize; index += 1) {
      const slot = index + 1;
      party[`slot${slot}`] = toDashboardPokemon(slots[index], CORE.createEmptySlot(slot, { moves: 'object' }));
    }
    party.transferBuffer = toDashboardPokemon(
      state?.party?.transferBuffer,
      CORE.createEmptySlot(maxPartySize + 1, { moves: 'object' })
    );

    const box = {};
    let boxIndex = 1;
    (state?.box?.boxes || []).forEach((boxEntry) => {
      (boxEntry?.slots || []).forEach((pokemon) => {
        box[`storage_${String(boxIndex).padStart(2, '0')}`] = toDashboardPokemon(pokemon, {});
        boxIndex += 1;
      });
    });

    return {
      player: {
        ...clone(state?.player, {}),
        party,
        box,
        settings: clone(state?.settings, {})
      },
      party,
      box,
      settings: clone(state?.settings, {}),
      world: clone(state?.world, {}),
      npcs: clone(state?.npcs, { records: {} })
    };
  }

  async function loadMvuzState() {
    if (ROOT.PKMPlugin?.loadState) {
      return ROOT.PKMPlugin.loadState({ persist: false, requireExisting: true });
    }
    console.warn(`${PLUGIN_NAME} PKMPlugin.loadState is unavailable; cannot read stat_data.pkm`);
    return null;
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

  async function pushDashboardState(reason = 'refresh', stateOverride = null) {
    if (pushDedupState.inFlight) {
      console.log(`${PLUGIN_NAME} skip dashboard push while another push is in flight`, { reason });
      return false;
    }
    pushDedupState.inFlight = true;
    const state = stateOverride || await loadMvuzState();
    if (!state) {
      pushDedupState.inFlight = false;
      return false;
    }
    const dashboard = stateToDashboardView(state);
    const payloadKey = JSON.stringify({
      player: dashboard?.player?.name,
      party: Object.values(dashboard?.player?.party || {}).map((pokemon) => pokemon?.name || null),
      boxCount: Object.keys(dashboard?.player?.box || {}).length,
      settings: dashboard?.settings || dashboard?.player?.settings || {},
      world: dashboard?.world || {},
      npcs: dashboard?.npcs || {}
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
      dashboard
    });

    console.log(`${PLUGIN_NAME} pushed dashboard state`, {
      reason,
      pushedState,
      player: dashboard?.player?.name,
      slot1: dashboard?.player?.party?.slot1?.name || null,
      npcCount: Object.keys(dashboard?.npcs?.records || {}).length
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

  function makeMessageFloorKey(messageId) {
    if (messageId === null || messageId === undefined || messageId === '') return '';
    const id = Number(messageId);
    return Number.isFinite(id) && id >= 0 ? `message:${Math.round(id)}` : '';
  }

  function getCurrentFloorKey() {
    try {
      if (typeof ROOT.getCurrentMessageId === 'function') {
        const floorKey = makeMessageFloorKey(ROOT.getCurrentMessageId());
        if (floorKey) return floorKey;
      }
    } catch (_) {}
    try {
      if (typeof ROOT.getChatMessages === 'function') {
        const latest = ROOT.getChatMessages(-1)?.[0];
        const floorKey = makeMessageFloorKey(latest?.message_id);
        if (floorKey) return floorKey;
      }
    } catch (_) {}
    try {
      if (typeof ROOT.getLastMessageId === 'function') {
        const floorKey = makeMessageFloorKey(ROOT.getLastMessageId());
        if (floorKey) return floorKey;
      }
    } catch (_) {}
    return '';
  }

  function postActionResult(type, detail = {}, event = null) {
    const message = {
      type,
      product: PRODUCT,
      ...detail
    };
    if (event) return postToMessageSource(event, message);
    return postToIframe(message);
  }

  function postToMessageSource(event, message) {
    const targetWindow = event?.source;
    if (targetWindow && typeof targetWindow.postMessage === 'function') {
      try {
        targetWindow.postMessage(message, '*');
        return true;
      } catch (error) {
        console.warn(`${PLUGIN_NAME} failed to post message to source:`, error);
      }
    }
    return postToIframe(message);
  }

  function postTavernInputResult(event, type, detail = {}) {
    return postToMessageSource(event, {
      type,
      product: PRODUCT,
      ...detail
    });
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function showTavernNotice(level, title, message, options = {}) {
    const normalizedLevel = ['success', 'info', 'warning', 'error'].includes(level) ? level : 'info';
    const noticeTitle = title || '[PKM]';
    const noticeMessage = message || '';
    if (options.usePopup !== false) {
      try {
        const tavern = ROOT.SillyTavern;
        if (tavern && typeof tavern.callGenericPopup === 'function') {
          const popupType = tavern.POPUP_TYPE?.TEXT || 'text';
          tavern.callGenericPopup(
            `<strong>${escapeHtml(noticeTitle)}</strong><br>${escapeHtml(noticeMessage)}`,
            popupType,
            '',
            { wide: false, large: false }
          );
          return true;
        }
      } catch (error) {
        console.warn(`${PLUGIN_NAME} Tavern popup failed:`, error);
      }
    }
    try {
      const toastr = ROOT.toastr;
      if (toastr && typeof toastr[normalizedLevel] === 'function') {
        toastr[normalizedLevel](noticeMessage, noticeTitle, {
          closeButton: true,
          newestOnTop: true,
          timeOut: options.timeOut ?? 5000
        });
        return true;
      }
    } catch (error) {
      console.warn(`${PLUGIN_NAME} Tavern toast failed:`, error);
    }
    console[normalizedLevel === 'error' ? 'error' : 'log'](`${noticeTitle} ${noticeMessage}`);
    return false;
  }

  function handleTavernNotice(event, eventData) {
    const requestId = eventData?.requestId || '';
    try {
      const shown = showTavernNotice(eventData?.level, eventData?.title, eventData?.message, {
        usePopup: eventData?.usePopup !== false,
        timeOut: eventData?.timeOut
      });
      postToMessageSource(event, {
        type: 'PKM_TAVERN_NOTICE_RESULT',
        product: PRODUCT,
        ok: true,
        shown,
        requestId,
        source: eventData?.source || ''
      });
    } catch (error) {
      postToMessageSource(event, {
        type: 'PKM_TAVERN_NOTICE_ERROR',
        product: PRODUCT,
        ok: false,
        requestId,
        source: eventData?.source || '',
        reason: error?.message || 'tavern_notice_failed',
        message: error?.message || String(error)
      });
    }
  }

  function escapeSetInputText(text) {
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\|/g, '\\|')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}');
  }

  function withTimeout(promise, timeoutMs, timeoutMessage) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      Promise.resolve(promise).then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  function getPlainObject(value, fallback = {}) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
  }

  async function writeTavernInput(text) {
    if (typeof ROOT.triggerSlash !== 'function') {
      throw new Error('triggerSlash is unavailable');
    }
    const inputText = typeof text === 'string' ? text : '';
    if (!inputText.trim()) {
      throw new Error('Cannot write empty text to Tavern input');
    }
    const command = `/setinput "${escapeSetInputText(inputText)}"`;
    await withTimeout(
      ROOT.triggerSlash(command),
      10000,
      'Writing to Tavern input timed out'
    );
  }

  async function handleSetTavernInput(event, eventData) {
    const requestId = eventData?.requestId || '';
    const source = eventData?.source || '';
    try {
      await writeTavernInput(eventData?.text);
      postTavernInputResult(event, 'PKM_SET_TAVERN_INPUT_RESULT', {
        ok: true,
        requestId,
        source
      });
      return { ok: true, requestId, source };
    } catch (error) {
      console.error(`${PLUGIN_NAME} set Tavern input failed:`, error);
      const result = {
        ok: false,
        requestId,
        source,
        reason: error?.message || 'set_tavern_input_failed',
        message: error?.message || String(error)
      };
      postTavernInputResult(event, 'PKM_SET_TAVERN_INPUT_ERROR', result);
      return result;
    }
  }

  function postGreetingLaunchResult(event, type, detail = {}) {
    return postToMessageSource(event, {
      type,
      product: PRODUCT,
      ...detail
    });
  }

  async function dispatchAction(action, payload = {}, meta = {}) {
    const requestId = meta.requestId || '';
    const floorKey = meta.floorKey || getCurrentFloorKey();
    const replyEvent = meta.replyEvent || null;
    const suppressResult = meta.suppressResult === true;
    if (actionLock) {
      const busy = { ok: false, action, requestId, floorKey, message: 'PKM action is already in progress', reason: 'action_in_progress' };
      if (!suppressResult) postActionResult('PKM_ACTION_ERROR', busy, replyEvent);
      return busy;
    }
    actionLock = true;
    try {
      if (typeof ROOT.PKMPlugin?.dispatchAction !== 'function') {
        throw new Error('PKMPlugin.dispatchAction is unavailable');
      }
      const state = await ROOT.PKMPlugin.dispatchAction(action, payload, { floorKey });
      if (!suppressResult) {
        postActionResult('PKM_ACTION_RESULT', {
          ok: true,
          action,
          requestId,
          floorKey,
          state
        }, replyEvent);
      }
      await pushDashboardState(`action:${action}`, state);
      return { ok: true, action, requestId, floorKey, state };
    } catch (error) {
      console.error(`${PLUGIN_NAME} action failed: ${action}`, error);
      const result = {
        ok: false,
        action,
        requestId,
        floorKey,
        reason: error?.result?.reason || error?.message || 'action_failed',
        message: error?.message || String(error)
      };
      if (!suppressResult) postActionResult('PKM_ACTION_ERROR', result, replyEvent);
      return result;
    } finally {
      setTimeout(() => { actionLock = false; }, 150);
    }
  }

  async function handleGreetingLaunch(event, eventData) {
    const requestId = eventData?.requestId || '';
    const source = eventData?.source || 'greeting-universal';
    const floorKey = eventData?.floorKey || getCurrentFloorKey();
    const configPayload = getPlainObject(eventData?.payload);
    const notice = getPlainObject(eventData?.notice);
    try {
      const actionResult = await dispatchAction('greeting.configure', configPayload, {
        requestId,
        floorKey,
        suppressResult: true
      });
      if (!actionResult?.ok) {
        throw new Error(actionResult?.message || actionResult?.reason || 'Greeting MVU injection failed');
      }

      await writeTavernInput(eventData?.text);

      const shown = showTavernNotice(
        notice.level || 'success',
        notice.title || 'PKM 开局准备完成',
        notice.message || '机制变量和世界设置已注入当前楼层，开局叙事已写入酒馆输入栏。确认后发送输入栏内容，就可以开始游玩。',
        {
          usePopup: notice.usePopup !== false,
          timeOut: notice.timeOut
        }
      );

      postGreetingLaunchResult(event, 'PKM_GREETING_LAUNCH_RESULT', {
        ok: true,
        requestId,
        source,
        floorKey,
        shown
      });
    } catch (error) {
      console.error(`${PLUGIN_NAME} greeting launch failed:`, error);
      const message = error?.message || String(error);
      showTavernNotice('error', 'PKM 开局准备失败', message, { usePopup: true });
      postGreetingLaunchResult(event, 'PKM_GREETING_LAUNCH_ERROR', {
        ok: false,
        requestId,
        source,
        floorKey,
        reason: error?.message || 'greeting_launch_failed',
        message
      });
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
      dispatchAction(data.action, data.payload || {}, {
        requestId: data.requestId || '',
        floorKey: data.floorKey || '',
        replyEvent: event
      });
      return;
    }
    if (data.type === 'PKM_GREETING_LAUNCH') {
      handleGreetingLaunch(event, data);
      return;
    }
    if (data.type === 'PKM_SET_TAVERN_INPUT') {
      handleSetTavernInput(event, data);
      return;
    }
    if (data.type === 'PKM_TAVERN_NOTICE') {
      handleTavernNotice(event, data);
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
        #${BALL_ID} .pkm-mvuz-ball-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          transition: opacity 0.2s ease, transform 0.25s ease;
          z-index: 1;
        }

        #${BALL_ID} .pkm-mvuz-ball-icon svg {
          width: 24px;
          height: 24px;
          color: #e0f2ff;
          filter: drop-shadow(0 0 4px rgba(0, 180, 255, 0.8));
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease, filter 0.3s ease;
        }
        #${BALL_ID}:hover .pkm-mvuz-ball-icon svg {
          color: #ffffff;
          transform: rotate(90deg) scale(1.1);
          filter: drop-shadow(0 0 8px rgba(0, 212, 255, 1));
        }

        .pkm-mvuz-ball-fold-btn {
          position: absolute;
          right: -2px;
          bottom: -2px;
          appearance: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          background: rgba(18, 26, 34, 0.82);
          color: rgba(255, 255, 255, 0.88);
          cursor: pointer;
          padding: 0;
          z-index: 2;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .pkm-mvuz-ball-fold-btn:hover {
          background: rgba(28, 42, 54, 0.94);
          border-color: rgba(255, 255, 255, 0.48);
          transform: translateY(-1px);
        }
        .pkm-mvuz-ball-fold-btn svg {
          width: 12px;
          height: 12px;
        }
        .pkm-mvuz-ball-fold-open {
          display: none;
        }

        #${BALL_ID}.${BALL_COLLAPSED_CLASS} {
          right: 0;
          width: 30px;
          height: 62px;
          border-radius: 18px 0 0 18px;
          opacity: 0.76;
          animation: none;
          background: rgba(20, 32, 42, 0.76);
          box-shadow:
            0 6px 16px rgba(0, 0, 0, 0.32),
            inset 0 0 10px rgba(255, 255, 255, 0.18);
        }
        #${BALL_ID}.${BALL_COLLAPSED_CLASS}::before {
          display: none;
        }
        #${BALL_ID}.${BALL_COLLAPSED_CLASS}:hover {
          transform: none;
          opacity: 0.95;
          background: rgba(25, 42, 54, 0.92);
        }
        #${BALL_ID}.${BALL_COLLAPSED_CLASS} .pkm-mvuz-ball-icon {
          width: 20px;
          height: 20px;
          transform: translateY(-10px);
          opacity: 0.88;
        }
        #${BALL_ID}.${BALL_COLLAPSED_CLASS} .pkm-mvuz-ball-icon svg {
          width: 18px;
          height: 18px;
        }
        #${BALL_ID}.${BALL_COLLAPSED_CLASS}:hover .pkm-mvuz-ball-icon svg {
          transform: none;
        }
        #${BALL_ID}.${BALL_COLLAPSED_CLASS} .pkm-mvuz-ball-fold-btn {
          right: 3px;
          bottom: 5px;
          width: 24px;
          height: 24px;
          border-color: transparent;
          background: transparent;
          box-shadow: none;
        }
        #${BALL_ID}.${BALL_COLLAPSED_CLASS} .pkm-mvuz-ball-fold-close {
          display: none;
        }
        #${BALL_ID}.${BALL_COLLAPSED_CLASS} .pkm-mvuz-ball-fold-open {
          display: block;
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
        <span class="pkm-mvuz-ball-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h7" />
            <path d="M15 12h7" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <button class="pkm-mvuz-ball-fold-btn" type="button" title="收起悬浮球" aria-label="收起悬浮球">
          <svg class="pkm-mvuz-ball-fold-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          <svg class="pkm-mvuz-ball-fold-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      `);
    const ballFoldBtn = ball.find('.pkm-mvuz-ball-fold-btn');

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

    const setBallCollapsed = (collapsed) => {
      ball.toggleClass(BALL_COLLAPSED_CLASS, collapsed);
      ball.attr('title', collapsed ? 'PKM Dashboard（点击打开，箭头展开）' : 'PKM Dashboard');
      ballFoldBtn
        .attr('title', collapsed ? '展开悬浮球' : '收起悬浮球')
        .attr('aria-label', collapsed ? '展开悬浮球' : '收起悬浮球');
      try {
        ROOT.localStorage?.setItem(BALL_COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0');
      } catch (_) {}
    };

    let initialBallCollapsed = true;
    try {
      initialBallCollapsed = ROOT.localStorage?.getItem(BALL_COLLAPSED_STORAGE_KEY) !== '0';
    } catch (_) {}
    setBallCollapsed(initialBallCollapsed);

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
            }
          } catch (_) {}
        });
        iframe.attr('src', PKM_URL);
      } else {
        pushDashboardState('open');
      }
    });
    ballFoldBtn.on('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setBallCollapsed(!ball.hasClass(BALL_COLLAPSED_CLASS));
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
