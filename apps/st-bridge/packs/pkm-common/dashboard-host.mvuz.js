/**
 * PKM common dashboard host.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const COMMON = ROOT.PKMCommonRuntime || {};
  ROOT.PKMCommonRuntime = COMMON;

  COMMON.startDashboardHost = function startDashboardHost(config = {}) {
    const CORE = ROOT.PKMPackCore || null;
    const PRODUCT = config.product || 'universal';
    const VERSION = config.version || '0.1.0-mvuz';
    const PLUGIN_NAME = config.pluginName || `[PKM ${PRODUCT} Dashboard MVUZ]`;
    if (!CORE?.mvu) throw new Error(`${PLUGIN_NAME} requires PKMPackCore. Load pkm-core.js before this script.`);
    if (typeof COMMON.createScheduler !== 'function') {
      throw new Error(`${PLUGIN_NAME} requires PKMCommonRuntime.createScheduler. Load pkm-common/scheduler.mvuz.js before this script.`);
    }

    const DEFAULT_APP_BASE_URL = 'https://hasheeper.github.io/pkm-pink';
    const dashboardPath = String(config.dashboardPath || `apps/dashboard-${PRODUCT}/index.html`).replace(/^\/+/, '');
    const DEFAULT_DASHBOARD_URL = `${DEFAULT_APP_BASE_URL}/${dashboardPath}`;
    const IFRAME_ID = config.iframeId || 'pkm-mvuz-iframe';
    const OVERLAY_ID = config.overlayId || 'pkm-mvuz-overlay';
    const BALL_ID = config.ballId || 'pkm-mvuz-ball';
    const BALL_COLLAPSED_CLASS = config.ballCollapsedClass || 'pkm-mvuz-ball-collapsed';
    const BALL_COLLAPSED_STORAGE_KEY = config.ballCollapsedStorageKey || 'pkm.mvuz.ballCollapsed';
    const STYLE_ID = config.styleId || 'pkm-mvuz-style';
    const defaultGreetingSource = config.defaultGreetingSource || `greeting-${PRODUCT}`;

    try {
      if (typeof ROOT.__PKM_MVUZ_DASHBOARD_HOST_UNLOAD__ === 'function') {
        ROOT.__PKM_MVUZ_DASHBOARD_HOST_UNLOAD__();
      }
    } catch (error) {
      console.warn(`${PLUGIN_NAME} failed to unload previous dashboard host:`, error);
    }

    let iframeInitialized = false;
    let dashboardWindow = null;
    let disposed = false;
    const dashboardChrome = {
      iframe: null,
      wrapper: null,
      overlay: null
    };
    const messageTargets = [];
    const scheduler = COMMON.createScheduler(`${PRODUCT}:dashboard-host`);
    const messageSourceIds = new WeakMap();
    let messageSourceSeq = 0;
    const messageDedupe = scheduler.ttlDedupe({ ttlMs: 900 });
    const pushDedupState = ROOT.__PKM_MVUZ_PUSH_DEDUP__ || {
      key: '',
      at: 0,
      inFlight: false,
      dirty: false,
      inFlightPromise: null,
      lastPushResult: false,
      pendingReason: '',
      pendingState: null
    };
    ROOT.__PKM_MVUZ_PUSH_DEDUP__ = pushDedupState;
    const stateReadCache = { key: '', at: 0, promise: null };
    let transferSequenceCancelers = [];
    let lastTransferSignature = '';

    function trimTrailingSlash(value) {
      return typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
    }

    function appendQueryParams(url, params = {}) {
      const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '');
      if (!entries.length || typeof url !== 'string' || !url.trim()) return url;
      try {
        const absolute = /^https?:\/\//i.test(url);
        const parsed = absolute ? new URL(url) : new URL(url, 'https://pkm.local');
        entries.forEach(([key, value]) => parsed.searchParams.set(key, String(value)));
        return absolute
          ? parsed.toString()
          : `${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch (_) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${entries
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
          .join('&')}`;
      }
    }

    function resolveDashboardUrl() {
      const globalName = String(config.dashboardUrlGlobal || '').trim();
      const rawUrl = globalName && typeof ROOT[globalName] === 'string' && ROOT[globalName].trim()
        ? ROOT[globalName].trim()
        : (() => {
            const appBase = trimTrailingSlash(ROOT.PKM_APP_BASE_URL || DEFAULT_APP_BASE_URL);
            return appBase ? `${appBase}/${dashboardPath}` : DEFAULT_DASHBOARD_URL;
          })();
      return appendQueryParams(rawUrl, {
        bridge: '1',
        v: VERSION
      });
    }

    const PKM_URL = resolveDashboardUrl();

    function waitForJQuery(callback) {
      if (disposed) return;
      if (typeof ROOT.jQuery !== 'undefined') {
        callback(ROOT.jQuery);
        return;
      }
      scheduler.setTimer(() => waitForJQuery(callback), 100, 'waitForJQuery');
    }

    function clone(value, fallback = null) {
      if (value === undefined || value === null) return fallback;
      try {
        return JSON.parse(JSON.stringify(value));
      } catch (_) {
        return fallback;
      }
    }

    function getPlainObject(value, fallback = {}) {
      return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
    }

    function toDashboardPokemon(pokemon, fallback = {}) {
      const next = clone(pokemon, fallback);
      next.moves = CORE.normalizeMovesObject(next.moves);
      return next;
    }

    function buildFallbackDashboardView(state) {
      const maxPartySize = CORE.constants?.MAX_PARTY_SIZE || 6;
      const slots = Array.isArray(state?.party?.slots) ? state.party.slots : [];
      const party = {};
      for (let index = 0; index < maxPartySize; index += 1) {
        const slot = index + 1;
        party[`slot${slot}`] = toDashboardPokemon(slots[index], CORE.createEmptySlot(slot, { moves: 'object' }));
      }
      party.transfer_buffer = toDashboardPokemon(
        state?.party?.transferBuffer || state?.party?.transfer_buffer,
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
        world_state: clone(state?.world, {}),
        world: clone(state?.world, {})
      };
    }

    function toLegacyDashboardView(state) {
      const dashboard = typeof CORE.legacyDashboardShape === 'function'
        ? CORE.legacyDashboardShape(state)
        : buildFallbackDashboardView(state);
      const party = dashboard.party || dashboard.player?.party || {};
      party.transferBuffer = clone(party.transferBuffer ?? party.transfer_buffer, party.transfer_buffer);
      const box = dashboard.box || dashboard.player?.box || {};
      const settings = dashboard.settings || dashboard.player?.settings || clone(state?.settings, {});
      return {
        ...dashboard,
        player: {
          ...(dashboard.player || {}),
          party,
          box,
          settings
        },
        party,
        box,
        settings,
        world: clone(dashboard.world || state?.world, {}),
        npcs: clone(dashboard.npcs || state?.npcs, { records: {} })
      };
    }

    function stateToDashboardView(state) {
      if (typeof config.adaptDashboardState === 'function') {
        return config.adaptDashboardState(state, helpers);
      }
      return toLegacyDashboardView(state);
    }

    async function loadMvuzState() {
      if (ROOT.PKMPlugin?.loadState) {
        return ROOT.PKMPlugin.loadState({ persist: false, requireExisting: true });
      }
      console.warn(`${PLUGIN_NAME} PKMPlugin.loadState is unavailable; cannot read stat_data.pkm`);
      return null;
    }

    function getDashboardIframe() {
      return dashboardChrome.iframe || ROOT.document?.getElementById(IFRAME_ID);
    }

    function postToIframe(message) {
      const iframe = getDashboardIframe();
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

    function invalidateStateReadCache() {
      stateReadCache.key = '';
      stateReadCache.at = 0;
      stateReadCache.promise = null;
    }

    async function loadMvuzStateCached() {
      const floorKey = getCurrentFloorKey();
      const now = Date.now();
      if (stateReadCache.promise && stateReadCache.key === floorKey && now - stateReadCache.at < 600) {
        return stateReadCache.promise;
      }
      stateReadCache.key = floorKey;
      stateReadCache.at = now;
      stateReadCache.promise = loadMvuzState().catch((error) => {
        invalidateStateReadCache();
        throw error;
      });
      return stateReadCache.promise;
    }

    async function executeDashboardPush(reason = 'refresh', stateOverride = null) {
      const state = stateOverride || await loadMvuzStateCached();
      if (!state) return false;
      const dashboard = stateToDashboardView(state);
      const payloadKey = JSON.stringify({
        product: PRODUCT,
        player: dashboard?.player?.name,
        party: Object.values(dashboard?.player?.party || {}).map((pokemon) => pokemon?.name || null),
        boxCount: Object.keys(dashboard?.player?.box || {}).length,
        settings: dashboard?.settings || dashboard?.player?.settings || {},
        world: dashboard?.world || {},
        npcs: dashboard?.npcs || {}
      });
      const now = Date.now();
      if (payloadKey === pushDedupState.key && now - pushDedupState.at < 1500) {
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
      } else {
        pushDedupState.pendingReason = reason;
        pushDedupState.pendingState = stateOverride || null;
      }
      return pushedState;
    }

    async function runDashboardPushLoop(initialReason = 'refresh', initialState = null) {
      let reason = initialReason;
      let stateOverride = initialState;
      let result = false;
      pushDedupState.inFlight = true;
      try {
        do {
          pushDedupState.dirty = false;
          pushDedupState.pendingReason = '';
          pushDedupState.pendingState = null;
          result = await executeDashboardPush(reason, stateOverride);
          pushDedupState.lastPushResult = result;
          if (pushDedupState.dirty) {
            reason = pushDedupState.pendingReason || `${reason}:trailing`;
            stateOverride = pushDedupState.pendingState || null;
          }
        } while (pushDedupState.dirty && !disposed);
        return result;
      } finally {
        pushDedupState.inFlight = false;
        pushDedupState.inFlightPromise = null;
      }
    }

    function pushDashboardState(reason = 'refresh', stateOverride = null) {
      if (disposed) return Promise.resolve(false);
      if (pushDedupState.inFlight) {
        pushDedupState.dirty = true;
        pushDedupState.pendingReason = reason;
        if (stateOverride) pushDedupState.pendingState = stateOverride;
        console.log(`${PLUGIN_NAME} queued trailing dashboard push`, { reason });
        return pushDedupState.inFlightPromise || Promise.resolve(pushDedupState.lastPushResult || false);
      }
      pushDedupState.inFlightPromise = runDashboardPushLoop(reason, stateOverride);
      return pushDedupState.inFlightPromise;
    }

    const scheduleRefresh = scheduler.debounceTrailing(
      (reason = 'refresh') => pushDashboardState(reason),
      { delayMs: 120, maxWaitMs: 600, label: 'dashboardRefresh' }
    );

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

    function postTypedResult(event, type, detail = {}) {
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
        postTypedResult(event, 'PKM_TAVERN_NOTICE_RESULT', {
          ok: true,
          shown,
          requestId,
          source: eventData?.source || ''
        });
      } catch (error) {
        postTypedResult(event, 'PKM_TAVERN_NOTICE_ERROR', {
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
        const cancelTimer = scheduler.setTimer(() => reject(new Error(timeoutMessage)), timeoutMs, 'withTimeout');
        Promise.resolve(promise).then(
          (value) => {
            cancelTimer();
            resolve(value);
          },
          (error) => {
            cancelTimer();
            reject(error);
          }
        );
      });
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
        postTypedResult(event, 'PKM_SET_TAVERN_INPUT_RESULT', {
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
        postTypedResult(event, 'PKM_SET_TAVERN_INPUT_ERROR', result);
        return result;
      }
    }

    async function runAction(action, payload = {}, meta = {}) {
      const requestId = meta.requestId || '';
      const floorKey = meta.floorKey || getCurrentFloorKey();
      const replyEvent = meta.replyEvent || null;
      const suppressResult = meta.suppressResult === true;
      try {
        const state = await dispatchPluginAction(action, payload, {
          floorKey,
          ...(meta.operationId ? { operationId: meta.operationId } : {}),
          ...(meta.messageId !== undefined ? { messageId: meta.messageId } : {})
        });
        if (!suppressResult) {
          postActionResult('PKM_ACTION_RESULT', {
            ok: true,
            action,
            requestId,
            floorKey,
            state
          }, replyEvent);
        }
        invalidateStateReadCache();
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
      }
    }

    const queuedAction = scheduler.serialQueue(
      runAction,
      { ttlMs: 5000, label: 'dashboardAction' }
    );

    function dispatchAction(action, payload = {}, meta = {}) {
      const requestId = meta.requestId || '';
      const queueKey = requestId ? `${PRODUCT}:action:${requestId}` : '';
      return queuedAction(queueKey, action, payload, meta);
    }

    async function dispatchPluginAction(action, payload, options = {}) {
      if (typeof ROOT.PKMPlugin?.dispatchAction !== 'function') {
        throw new Error('PKMPlugin.dispatchAction is unavailable');
      }
      return ROOT.PKMPlugin.dispatchAction(action, payload, options);
    }

    async function handleGreetingLaunch(event, eventData) {
      const requestId = eventData?.requestId || '';
      const source = eventData?.source || defaultGreetingSource;
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

        postTypedResult(event, 'PKM_GREETING_LAUNCH_RESULT', {
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
        postTypedResult(event, 'PKM_GREETING_LAUNCH_ERROR', {
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
      const transfer = state?.party?.transferBuffer || state?.party?.transfer_buffer;
      if (transfer?.name) {
        const signature = JSON.stringify({
          floorKey: getCurrentFloorKey(),
          name: transfer.name || '',
          species: transfer.species || '',
          lv: transfer.lv ?? null
        });
        if (signature === lastTransferSignature) return { ok: true, skipped: true };
        lastTransferSignature = signature;
        await dispatchAction('box.depositTransferBuffer', {}, { suppressResult: true });
        return { ok: true };
      }
      lastTransferSignature = '';
      return { ok: true, skipped: true };
    }

    function cancelTransferSequence() {
      transferSequenceCancelers.forEach((cancel) => {
        try { cancel(); } catch (_) {}
      });
      transferSequenceCancelers = [];
    }

    function runTransferBufferSequence(reason = 'refresh') {
      cancelTransferSequence();
      const delays = [250, 900, 2200];
      delays.forEach((delayMs, index) => {
        transferSequenceCancelers.push(scheduler.setTimer(() => {
          handleTransferBuffer().catch((error) => {
            console.warn(`${PLUGIN_NAME} transferBuffer check failed:`, error);
          });
          if (index === delays.length - 1) transferSequenceCancelers = [];
        }, delayMs, `transferBuffer:${reason}:${index}`));
      });
    }

    const debouncedTransferBufferCheck = scheduler.debounceTrailing(
      runTransferBufferSequence,
      { delayMs: 120, maxWaitMs: 700, label: 'transferBufferCheck' }
    );

    function scheduleTransferBufferCheck(reason = 'refresh') {
      if (disposed) return;
      if (config.enableTransferBufferCheck !== true) return;
      debouncedTransferBufferCheck(reason);
      console.log(`${PLUGIN_NAME} scheduled transferBuffer check`, { reason });
    }

    function setFullscreen(enabled, options = {}) {
      const iframe = getDashboardIframe();
      const wrapper = dashboardChrome.wrapper || iframe?.parentElement;
      const overlay = dashboardChrome.overlay || ROOT.document?.getElementById(OVERLAY_ID);
      if (!iframe || !wrapper || !overlay) {
        return;
      }
      if (enabled) {
        wrapper.style.width = '100vw';
        wrapper.style.maxWidth = '100vw';
        wrapper.style.height = '100vh';
        wrapper.style.maxHeight = '100vh';
        iframe.style.borderRadius = '0';
        overlay.style.padding = '0';
      } else {
        wrapper.style.width = '100%';
        wrapper.style.maxWidth = '485px';
        wrapper.style.height = '95vh';
        wrapper.style.maxHeight = '850px';
        iframe.style.borderRadius = '24px';
        overlay.style.padding = '4px';
      }
      if (options.resize !== false) {
        postToIframe({ type: 'MAP_RESIZE', product: PRODUCT });
      }
    }

    function getMessageSourceId(source) {
      if (!source || typeof source !== 'object') return 'none';
      if (!messageSourceIds.has(source)) {
        messageSourceSeq += 1;
        messageSourceIds.set(source, `w${messageSourceSeq}`);
      }
      return messageSourceIds.get(source);
    }

    function stableStringify(value) {
      try {
        const normalize = (input) => {
          if (!input || typeof input !== 'object') return input;
          if (Array.isArray(input)) return input.map(normalize);
          return Object.keys(input).sort().reduce((acc, key) => {
            acc[key] = normalize(input[key]);
            return acc;
          }, {});
        };
        return JSON.stringify(normalize(value));
      } catch (_) {
        return '';
      }
    }

    function buildMessageDedupeKey(event, data) {
      const type = String(data?.type || '');
      if (!type) return '';
      if (type === 'PKM_READY') return `${type}:${data.product || ''}:${data.target || ''}`;
      if (type === 'PKM_REQUEST_STATE') return `${type}:${data.product || ''}:${data.source || ''}`;
      if (type === 'PKM_ACTION' && data.requestId) return `${type}:${data.requestId}`;
      if (data.requestId) return `${type}:${data.requestId}`;
      if (type === 'PKM_ACTION') {
        return `${type}:${getMessageSourceId(event?.source)}:${data.action || ''}:${stableStringify(data.payload || {})}`;
      }
      return '';
    }

    function handleWindowMessage(event) {
      const data = event?.data;
      if (!data || !data.type) return;
      const dedupeKey = buildMessageDedupeKey(event, data);
      if (dedupeKey && messageDedupe.check(dedupeKey)) {
        console.log(`${PLUGIN_NAME} skip duplicate dashboard message`, { type: data.type });
        return;
      }

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
      if (typeof config.handleMessage === 'function') {
        try {
          const handled = config.handleMessage(event, data, helpers);
          if (handled && typeof handled.catch === 'function') {
            handled.catch((error) => console.error(`${PLUGIN_NAME} custom message handler failed:`, error));
            return;
          }
          if (handled) return;
        } catch (error) {
          console.error(`${PLUGIN_NAME} custom message handler failed:`, error);
        }
      }
    }

    function handleLocalStateChanged() {
      invalidateStateReadCache();
      scheduleRefresh('stateChanged');
    }

    function handleTransferStateChanged() {
      scheduleTransferBufferCheck('stateChanged');
    }

    function handleStateWritten() {
      invalidateStateReadCache();
      scheduleTransferBufferCheck('stateWritten');
    }

    function bindSillyTavernEvents() {
      ROOT.addEventListener?.('pkm:stateChanged', handleLocalStateChanged);
      if (config.enableTransferBufferCheck === true) {
        ROOT.addEventListener?.('pkm:stateChanged', handleTransferStateChanged);
        ROOT.addEventListener?.('st-bridge:state-written', handleStateWritten);
      }
      if (typeof ROOT.eventOn !== 'function') return;
      const bindRefresh = (eventName, reason) => {
        ROOT.eventOn(eventName, () => {
          scheduleRefresh(reason);
          scheduleTransferBufferCheck(reason);
        });
      };
      bindRefresh('pkm:stateChanged', 'stateChanged');
      bindRefresh('character_message_rendered', 'messageRendered');
      bindRefresh('message_received', 'messageReceived');
      bindRefresh('generation_ended', 'generationEnded');
      bindRefresh('message_updated', 'messageUpdated');
      bindRefresh('mag_variable_update_ended', 'mvuVariableUpdateEnded');
      bindRefresh('mag_variable_update_ended_for_zod', 'mvuZodVariableUpdateEnded');
      ROOT.eventOn('CHAT_CHANGED', () => {
        iframeInitialized = false;
        invalidateStateReadCache();
        messageDedupe.clear();
        scheduleRefresh('chatChanged');
      });
      ROOT.eventOn('chat_changed', () => {
        iframeInitialized = false;
        invalidateStateReadCache();
        messageDedupe.clear();
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

    function buildStyleTag() {
      return `
      <style id="${STYLE_ID}">
        @keyframes pkm-mvuz-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pkm-mvuz-spin {
          100% { transform: rotate(360deg); }
        }
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
          z-index: 2147483645;
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
        .pkm-mvuz-close-btn {
          position: absolute;
          top: -12px;
          right: -12px;
          left: auto;
          appearance: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(25, 25, 25, 0.35);
          color: rgba(255, 255, 255, 0.6);
          border-radius: 10px;
          padding: 0;
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
    }

    function injectUi($) {
      $(`#${BALL_ID}, #${OVERLAY_ID}, #${STYLE_ID}`).remove();
      $('head').append(buildStyleTag());

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
          zIndex: 2147483647,
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
      dashboardChrome.iframe = iframe[0] || null;
      dashboardChrome.wrapper = wrapper[0] || null;
      dashboardChrome.overlay = overlay[0] || null;

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
              if (iframeWindow) dashboardWindow = iframeWindow;
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

      const hideOverlay = () => {
        setFullscreen(false, { resize: false });
        postToIframe({ type: 'PKM_EXIT_MAP_FULLSCREEN', product: PRODUCT, resize: false });
        overlay.css('display', 'none');
      };

      closeBtn.on('click', hideOverlay);
      overlay.on('click', (event) => {
        if (event.target === overlay[0]) hideOverlay();
      });
      ROOT.jQuery(ROOT.document).on('keydown.pkmMvuz', (event) => {
        if (event.key === 'Escape' && overlay.css('display') !== 'none') hideOverlay();
      });
    }

    function unload() {
      disposed = true;
      try {
        ROOT.jQuery?.(`#${BALL_ID}, #${OVERLAY_ID}, #${STYLE_ID}`).remove();
        ROOT.jQuery?.(ROOT.document).off('keydown.pkmMvuz');
      } catch (_) {}
      dashboardChrome.iframe = null;
      dashboardChrome.wrapper = null;
      dashboardChrome.overlay = null;
      cancelTransferSequence();
      scheduler.disposeAll();
      ROOT.removeEventListener?.('message', handleWindowMessage);
      messageTargets.forEach((target) => {
        try { target.removeEventListener?.('message', handleWindowMessage); } catch (_) {}
      });
      messageTargets.length = 0;
      ROOT.removeEventListener?.('pkm:stateChanged', handleLocalStateChanged);
      ROOT.removeEventListener?.('pkm:stateChanged', handleTransferStateChanged);
      ROOT.removeEventListener?.('st-bridge:state-written', handleStateWritten);
      ROOT.removeEventListener?.('pagehide', unload);
      if (ROOT.__PKM_MVUZ_DASHBOARD_HOST_UNLOAD__ === unload) {
        delete ROOT.__PKM_MVUZ_DASHBOARD_HOST_UNLOAD__;
      }
    }

    const helpers = {
      ROOT,
      CORE,
      product: PRODUCT,
      version: VERSION,
      pluginName: PLUGIN_NAME,
      ids: { IFRAME_ID, OVERLAY_ID, BALL_ID, STYLE_ID },
      clone,
      getPlainObject,
      toDashboardPokemon,
      toLegacyDashboardView,
      loadMvuzState,
      pushDashboardState,
      scheduleRefresh,
      makeMessageFloorKey,
      getCurrentFloorKey,
      postToIframe,
      postToMessageSource,
      postTypedResult,
      showTavernNotice,
      writeTavernInput,
      dispatchAction,
      dispatchPluginAction,
      setFullscreen
    };

    bindSillyTavernEvents();
    bindMessageTargets();
    ROOT.__PKM_MVUZ_DASHBOARD_HOST_UNLOAD__ = unload;
    ROOT.removeEventListener?.('pagehide', unload);
    ROOT.addEventListener?.('pagehide', unload);

    waitForJQuery(($) => {
      if (disposed) return;
      injectUi($);
      scheduleRefresh('load');
      console.log(`${PLUGIN_NAME} loaded (${VERSION})`);
    });

    return helpers;
  };
})();
