/**
 * PKM PINK Universal - MVUZ business plugin bootstrap
 *
 * Scope:
 * - Assemble classic-script plugin modules.
 * - Expose window.PKMPlugin.
 * - Bind SillyTavern generation/message events.
 */
(async function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMUniversalPluginRuntime || null;
  const BOOTSTRAP_NAME = '[PKM Universal MVUZ]';

  if (!RUNTIME?.shared?.createContext) {
    throw new Error(`${BOOTSTRAP_NAME} requires PKMUniversalPluginRuntime.shared. Load plugin/shared.mvuz.js before this script.`);
  }

  const ctx = RUNTIME.shared.createContext();
  const {
    PLUGIN_NAME,
    VERSION,
    PRODUCT,
    FRONTEND_TAG,
    MAX_PARTY_SIZE
  } = ctx;
  const {
    wait,
    normalizePkmState,
    normalizePartySlots,
    normalizePokemon,
    normalizeString,
    normalizeTransferBuffer
  } = ctx.util;

  const requiredFactories = [
    'createStateReplay',
    'createPromptInjection',
    'createBattleFrontend',
    'createActionsApi'
  ];
  requiredFactories.forEach((factoryName) => {
    if (typeof RUNTIME[factoryName] !== 'function') {
      throw new Error(`${PLUGIN_NAME} requires PKMUniversalPluginRuntime.${factoryName}. Check manifest script order.`);
    }
  });

  const state = RUNTIME.createStateReplay(ctx);
  const prompt = RUNTIME.createPromptInjection(ctx, state);
  const battle = RUNTIME.createBattleFrontend(ctx, state);
  const actions = RUNTIME.createActionsApi(ctx, state);

  function resetRuntimeState(reason) {
    battle.resetRuntimeState();
    console.log(`${PLUGIN_NAME} ${reason}: runtime state reset`);
  }

  ROOT.PKMPlugin = {
    version: VERSION,
    product: PRODUCT,
    loadState: state.loadState,
    saveState: state.saveState,
    patchState: state.patchState,
    dispatchAction: actions.dispatchAction,
    getMvuzState: state.loadState,
    normalizePkmState,
    makeMessageFloorKey: state.makeMessageFloorKey,
    commitReplayPatch: state.commitPkmReplayPatch,
    async setPlayerParty(mode, input = null, options = {}) {
      return state.patchState((draft) => {
        const source = mode === 'single'
          ? [{ name: input }]
          : Array.isArray(input)
            ? input
            : [];
        if (!source.length) return draft;
        draft.party.slots = normalizePartySlots(source.slice(0, MAX_PARTY_SIZE));
        return draft;
      }, { ...options, operationId: options.operationId || 'api:setPlayerParty', paths: ['/pkm/party/slots'] });
    },
    async addToParty(pokemon, options = {}) {
      return state.patchState((draft) => {
        const index = draft.party.slots.findIndex((slot) => !slot?.name);
        const normalized = normalizePokemon(pokemon, index >= 0 ? index + 1 : null);
        if (!normalized?.name) return draft;
        if (index >= 0) {
          draft.party.slots[index] = normalized;
        } else {
          draft.party.transferBuffer = normalizeTransferBuffer(normalized);
        }
        return draft;
      }, { ...options, operationId: options.operationId || 'api:addToParty', paths: ['/pkm/party/slots', '/pkm/party/transferBuffer'] });
    },
    async addToReserve(pokemon, options = {}) {
      return state.patchState((draft) => {
        const normalized = normalizeTransferBuffer(pokemon);
        if (!normalized) return draft;
        if (!draft.box.boxes?.length) draft.box.boxes = [{ id: 'box_01', name: 'Box 1', slots: [] }];
        draft.box.boxes[0].slots.push(normalized);
        return draft;
      }, { ...options, operationId: options.operationId || 'api:addToReserve', paths: ['/pkm/box/boxes/0/slots'] });
    },
    async repairPartySlots(options = {}) {
      const repairedState = await state.patchState((draft) => {
        draft.party.slots = normalizePartySlots(draft.party.slots);
        return draft;
      }, { ...options, operationId: options.operationId || 'api:repairPartySlots', paths: ['/pkm/party/slots'] });
      return { repaired: true, slots: repairedState.party.slots };
    },
    async setPlayerName(name, options = {}) {
      return state.patchState((draft) => {
        draft.player.name = normalizeString(name, draft.player.name);
        return draft;
      }, { ...options, operationId: options.operationId || 'api:setPlayerName', paths: ['/pkm/player/name'] });
    },
    async triggerBattle(aiBattleData) {
      const battleJson = await battle.buildBattleJson(aiBattleData || {});
      if (typeof ROOT.createChatMessages === 'function') {
        await ROOT.createChatMessages([{
          role: 'assistant',
          message: `<${FRONTEND_TAG}>\n${JSON.stringify(battleJson)}\n</${FRONTEND_TAG}>`
        }]);
      }
      return battleJson;
    }
  };

  for (let retries = 0; retries < 30; retries += 1) {
    if (
      typeof ROOT.getVariables === 'function' &&
      typeof ROOT.getChatMessages === 'function' &&
      typeof ROOT.setChatMessages === 'function'
    ) break;
    await wait(100);
  }

  try {
    await state.loadState();
  } catch (error) {
    console.warn(`${PLUGIN_NAME} initial state normalization skipped:`, error);
  }

  if (typeof ROOT.eventOn === 'function') {
    ROOT.eventOn('CHAT_CHANGED', () => resetRuntimeState('CHAT_CHANGED'));
    ROOT.eventOn('chat_changed', () => resetRuntimeState('chat_changed'));
    ROOT.eventOn('message_swiped', (messageId) => {
      resetRuntimeState('message_swiped');
      setTimeout(() => battle.handleMessageRendered(messageId), 1200);
    });
    ROOT.eventOn('message_edited', (messageId) => {
      resetRuntimeState('message_edited');
      setTimeout(() => battle.handleMessageRendered(messageId), 1200);
    });
    ROOT.eventOn('GENERATION_AFTER_COMMANDS', prompt.handleGenerationBefore);
    ROOT.eventOn('mag_before_message_update', battle.handleBeforeMessageUpdate);
    ROOT.eventOn('character_message_rendered', battle.handleMessageRendered);
    ROOT.eventOn('message_received', (messageId) => setTimeout(() => battle.handleMessageRendered(messageId), 1200));
    ROOT.eventOn('era:writeDone', (detail) => {
      const messageId = detail?.message_id ?? (typeof ROOT.getLastMessageId === 'function' ? ROOT.getLastMessageId() : null);
      setTimeout(() => battle.handleMessageRendered(messageId), 300);
    });
  }

  console.log(`${PLUGIN_NAME} loaded (${VERSION})`);
})();
