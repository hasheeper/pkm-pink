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
  const PLUGIN_NAME = '[PKM Universal Dashboard MVUZ]';
  const PKM_URL = 'https://hasheeper.github.io/pkm-pink/apps/dashboard-universal/index.html';
  const PRODUCT = 'universal';
  const VERSION = '0.1.0-mvuz-universal';
  const IFRAME_ID = 'pkm-mvuz-iframe';
  const OVERLAY_ID = 'pkm-mvuz-overlay';
  const BALL_ID = 'pkm-mvuz-ball';
  const STYLE_ID = 'pkm-mvuz-style';

  let iframeInitialized = false;
  let refreshTimer = null;
  let actionLock = false;
  let dashboardWindow = null;
  const messageTargets = [];
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

  function isObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function createEmptySlot(slot) {
    return {
      slot,
      name: null,
      nickname: null,
      species: null,
      gender: null,
      lv: null,
      quality: null,
      nature: null,
      ability: null,
      shiny: false,
      item: null,
      mechanic: null,
      teraType: null,
      isAce: false,
      isLead: false,
      bonds: 0,
      moves: { move1: null, move2: null, move3: null, move4: null },
      stats_meta: {
        ivs: { hp: null, atk: null, def: null, spa: null, spd: null, spe: null },
        ev_level: 0
      },
      notes: null
    };
  }

  function stateToLegacyDashboard(state) {
    if (ROOT.PKMPlugin?.legacyDashboardShape) {
      return ROOT.PKMPlugin.legacyDashboardShape(state);
    }

    const toLegacyPokemon = (pokemon, fallback = {}) => {
      const next = clone(pokemon, fallback);
      const moves = Array.isArray(next.moves)
        ? next.moves
        : [next.moves?.move1, next.moves?.move2, next.moves?.move3, next.moves?.move4];
      next.moves = {
        move1: moves[0] || null,
        move2: moves[1] || null,
        move3: moves[2] || null,
        move4: moves[3] || null
      };
      return next;
    };

    const party = {};
    const slots = Array.isArray(state?.party?.slots) ? state.party.slots : [];
    for (let i = 0; i < 6; i += 1) {
      party[`slot${i + 1}`] = toLegacyPokemon(slots[i], createEmptySlot(i + 1));
    }
    party.transfer_buffer = toLegacyPokemon(state?.party?.transferBuffer, createEmptySlot(7));

    const box = {};
    let idx = 1;
    for (const boxEntry of state?.box?.boxes || []) {
      for (const pokemon of boxEntry.slots || []) {
        box[`storage_${String(idx).padStart(2, '0')}`] = toLegacyPokemon(pokemon, {});
        idx += 1;
      }
    }

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

  async function loadMvuzState() {
    if (ROOT.PKMPlugin?.loadState) return ROOT.PKMPlugin.loadState();
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
      if (!ROOT.PKMPlugin?.dispatchAction) {
        console.warn(`${PLUGIN_NAME} PKMPlugin.dispatchAction is unavailable`);
        return null;
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
    if (typeof ROOT.eventOn !== 'function') return;
    ROOT.eventOn('pkm:stateChanged', () => scheduleRefresh('stateChanged'));
    ROOT.eventOn('character_message_rendered', () => {
      scheduleRefresh('messageRendered');
      handleTransferBuffer();
    });
    ROOT.eventOn('message_received', () => {
      scheduleRefresh('messageReceived');
      setTimeout(handleTransferBuffer, 600);
    });
    ROOT.eventOn('generation_ended', () => {
      scheduleRefresh('generationEnded');
      handleTransferBuffer();
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

    const style = `
      <style id="${STYLE_ID}">
        @keyframes pkm-mvuz-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        #${BALL_ID}:hover { transform: scale(1.08); }
      </style>
    `;
    $('head').append(style);

    const ball = $('<div>')
      .attr('id', BALL_ID)
      .attr('title', 'PKM Dashboard')
      .css({
        position: 'fixed',
        top: '80px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        zIndex: 2147483647,
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #ffd54a 0%, #f28b25 100%)',
        boxShadow: '0 4px 15px rgba(242, 139, 37, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'pkm-mvuz-float 3s ease-in-out infinite',
        transition: 'transform 0.2s ease'
      })
      .html('<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#242424" stroke-width="2" fill="none"/><line x1="2" y1="12" x2="22" y2="12" stroke="#242424" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#242424"/></svg>');

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
        zIndex: 2147483646,
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
      .attr('title', 'Close')
      .css({
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        fontSize: '22px',
        lineHeight: '34px',
        cursor: 'pointer',
        zIndex: 2
      })
      .text('x');

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
