/**
 * PKM common pack bootstrap lifecycle.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const COMMON = ROOT.PKMCommonRuntime || {};
  ROOT.PKMCommonRuntime = COMMON;

  COMMON.startPackBootstrap = async function startPackBootstrap(runtime, options = {}) {
    const bootstrapName = options.bootstrapName || '[PKM MVUZ]';
    if (!runtime?.shared?.createContext) {
      throw new Error(`${bootstrapName} requires pack shared runtime.`);
    }
    if (typeof COMMON.createScheduler !== 'function') {
      throw new Error(`${bootstrapName} requires PKMCommonRuntime.createScheduler.`);
    }
    if (typeof COMMON.createMessageAutofill !== 'function') {
      throw new Error(`${bootstrapName} requires PKMCommonRuntime.createMessageAutofill.`);
    }

    const ctx = runtime.shared.createContext();
    const {
      PLUGIN_NAME,
      VERSION,
      PRODUCT,
      FRONTEND_TAG,
      MAX_PARTY_SIZE
    } = ctx;
    const {
      wait,
      isObject,
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
      'createActionsApi',
      ...(Array.isArray(options.requiredFactories) ? options.requiredFactories : [])
    ];
    requiredFactories.forEach((factoryName) => {
      if (typeof runtime[factoryName] !== 'function') {
        throw new Error(`${PLUGIN_NAME} requires ${factoryName}. Check manifest script order.`);
      }
    });

    const state = runtime.createStateReplay(ctx);
    const prompt = runtime.createPromptInjection(ctx, state);
    const battle = runtime.createBattleFrontend(ctx, state);
    const actions = runtime.createActionsApi(ctx, state);
    const autofill = COMMON.createMessageAutofill(ctx);
    const scheduler = COMMON.createScheduler(`${PRODUCT}:bootstrap`);
    const services = typeof options.createServices === 'function'
      ? options.createServices({ ctx, state, prompt, battle, actions })
      : {};
    const api = { ctx, state, prompt, battle, actions, autofill, services };
    const delayedRenderTimers = new Map();
    const messageRenderHashes = new Map();
    const messageRenderRunners = new Map();
    let runtimeEpoch = 0;

    function normalizeMessageId(input) {
      const source = isObject(input?.detail) ? input.detail : input;
      const raw = isObject(source)
        ? source.message_id ?? source.messageId ?? source.id
        : source;
      const id = Number(raw);
      return Number.isFinite(id) && id >= 0 ? Math.round(id) : null;
    }

    function hashContent(value) {
      const text = String(value || '');
      let hash = 2166136261;
      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return `${text.length}:${(hash >>> 0).toString(36)}`;
    }

    function readMessageContent(messageId) {
      if (!Number.isFinite(Number(messageId)) || typeof ROOT.getChatMessages !== 'function') {
        return { exists: false, content: '' };
      }
      const messages = ROOT.getChatMessages(Math.round(Number(messageId)));
      const message = Array.isArray(messages) ? messages[0] : null;
      if (!message) return { exists: false, content: '' };
      return {
        exists: true,
        content: typeof message.message === 'string' ? message.message : ''
      };
    }

    function rememberMessageHash(messageId, content) {
      if (messageId === null) return;
      messageRenderHashes.set(String(messageId), hashContent(content));
    }

    function clearDelayedRender(messageId) {
      const key = String(messageId);
      const cancel = delayedRenderTimers.get(key);
      if (typeof cancel === 'function') {
        try { cancel(); } catch (_) {}
      }
      delayedRenderTimers.delete(key);
    }

    function clearMessageRuntimeState() {
      runtimeEpoch += 1;
      delayedRenderTimers.forEach((cancel) => {
        try { cancel(); } catch (_) {}
      });
      delayedRenderTimers.clear();
      messageRenderHashes.clear();
      messageRenderRunners.clear();
    }

    function resetRuntimeState(reason) {
      clearMessageRuntimeState();
      battle.resetRuntimeState();
      if (typeof options.resetRuntimeState === 'function') {
        options.resetRuntimeState(reason, api);
      }
      console.log(`${PLUGIN_NAME} ${reason}: runtime state reset`);
    }

    async function handleBeforeMessageUpdate(event) {
      await battle.handleBeforeMessageUpdate(event);
      await autofill.handleBeforeMessageUpdate(event);
      const messageId = normalizeMessageId(event);
      if (messageId !== null) rememberMessageHash(messageId, event?.message_content || '');
    }

    async function handleMessageRendered(messageId, options = {}) {
      const normalizedId = normalizeMessageId(messageId);
      if (normalizedId === null) return { ok: false, skipped: true, reason: 'missing_message_id' };
      if (typeof ROOT.setChatMessages !== 'function') {
        return { ok: false, skipped: true, reason: 'chat_message_api_unavailable', messageId: normalizedId };
      }
      const taskEpoch = Number.isFinite(Number(options.epoch)) ? Number(options.epoch) : runtimeEpoch;
      if (taskEpoch !== runtimeEpoch) {
        return { ok: false, skipped: true, reason: 'runtime_epoch_changed', messageId: normalizedId };
      }

      const before = readMessageContent(normalizedId);
      if (!before.exists) {
        messageRenderHashes.delete(String(normalizedId));
        return { ok: false, skipped: true, reason: 'message_not_found', messageId: normalizedId };
      }

      const originalHash = hashContent(before.content);
      if (options.expectedHash && options.expectedHash !== originalHash) {
        return { ok: false, skipped: true, reason: 'content_changed', messageId: normalizedId };
      }

      let nextContent = before.content;
      const battleResult = await battle.processBattleContent(nextContent);
      nextContent = battleResult?.content ?? nextContent;
      const autofillResult = autofill.autofillText(nextContent);
      nextContent = autofillResult?.content ?? nextContent;

      if (taskEpoch !== runtimeEpoch) {
        return { ok: false, skipped: true, reason: 'runtime_epoch_changed', messageId: normalizedId };
      }
      if (nextContent === before.content) {
        rememberMessageHash(normalizedId, before.content);
        return { ok: true, skipped: false, changed: false, messageId: normalizedId };
      }

      const latest = readMessageContent(normalizedId);
      if (!latest.exists) {
        messageRenderHashes.delete(String(normalizedId));
        return { ok: false, skipped: true, reason: 'message_not_found', messageId: normalizedId };
      }
      if (hashContent(latest.content) !== originalHash) {
        return { ok: false, skipped: true, reason: 'content_changed', messageId: normalizedId };
      }

      await ROOT.setChatMessages([{ message_id: normalizedId, message: nextContent }], { refresh: 'affected' });
      rememberMessageHash(normalizedId, nextContent);
      return { ok: true, skipped: false, changed: true, messageId: normalizedId };
    }

    function getMessageRenderRunner(messageId) {
      const key = String(messageId);
      if (!messageRenderRunners.has(key)) {
        messageRenderRunners.set(key, scheduler.coalesceLatest(async (request = {}) => {
          const normalizedId = normalizeMessageId(request.messageId ?? request);
          if (normalizedId === null) return { ok: false, skipped: true, reason: 'missing_message_id' };
          clearDelayedRender(normalizedId);
          const before = readMessageContent(normalizedId);
          if (!before.exists) {
            messageRenderHashes.delete(String(normalizedId));
            return { ok: false, skipped: true, reason: 'message_not_found', messageId: normalizedId };
          }
          const currentHash = hashContent(before.content);
          const lastHash = messageRenderHashes.get(String(normalizedId)) || '';
          if (currentHash && currentHash === lastHash) {
            return { ok: true, skipped: true, reason: 'unchanged_hash', messageId: normalizedId };
          }
          return handleMessageRendered(normalizedId, {
            epoch: request.epoch,
            expectedHash: currentHash
          });
        }, { label: `messageRendered:${key}` }));
      }
      return messageRenderRunners.get(key);
    }

    function queueMessageRendered(messageLike, reason = 'rendered', options = {}) {
      const messageId = normalizeMessageId(messageLike);
      if (messageId === null) return Promise.resolve({ ok: false, skipped: true, reason: 'missing_message_id' });
      clearDelayedRender(messageId);
      const epoch = runtimeEpoch;
      const run = () => getMessageRenderRunner(messageId)({
        messageId,
        reason,
        floorKey: typeof state.makeMessageFloorKey === 'function' ? state.makeMessageFloorKey(messageId) : '',
        epoch
      });
      const delayMs = Math.max(0, Number(options.delayMs) || 0);
      if (!delayMs) return run();
      return new Promise((resolve) => {
        const cancel = scheduler.setTimer(() => {
          delayedRenderTimers.delete(String(messageId));
          resolve(run());
        }, delayMs, `messageRenderedDelay:${reason}:${messageId}`);
        delayedRenderTimers.set(String(messageId), cancel);
      });
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
      async setPlayerParty(mode, input = null, writeOptions = {}) {
        return state.patchState((draft) => {
          const source = mode === 'single'
            ? [{ name: input }]
            : Array.isArray(input)
              ? input
              : [];
          if (!source.length) return draft;
          draft.party.slots = normalizePartySlots(source.slice(0, MAX_PARTY_SIZE));
          return draft;
        }, { ...writeOptions, operationId: writeOptions.operationId || 'api:setPlayerParty', paths: ['/pkm/party/slots'] });
      },
      async addToParty(pokemon, writeOptions = {}) {
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
        }, { ...writeOptions, operationId: writeOptions.operationId || 'api:addToParty', paths: ['/pkm/party/slots', '/pkm/party/transferBuffer'] });
      },
      async addToReserve(pokemon, writeOptions = {}) {
        return state.patchState((draft) => {
          const normalized = normalizeTransferBuffer(pokemon);
          if (!normalized) return draft;
          if (!draft.box.boxes?.length) draft.box.boxes = [{ id: 'box_01', name: 'Box 1', slots: [] }];
          draft.box.boxes[0].slots.push(normalized);
          return draft;
        }, { ...writeOptions, operationId: writeOptions.operationId || 'api:addToReserve', paths: ['/pkm/box/boxes/0/slots'] });
      },
      async repairPartySlots(writeOptions = {}) {
        const repairedState = await state.patchState((draft) => {
          draft.party.slots = normalizePartySlots(draft.party.slots);
          return draft;
        }, { ...writeOptions, operationId: writeOptions.operationId || 'api:repairPartySlots', paths: ['/pkm/party/slots'] });
        return { repaired: true, slots: repairedState.party.slots };
      },
      async setPlayerName(name, writeOptions = {}) {
        return state.patchState((draft) => {
          draft.player.name = normalizeString(name, draft.player.name);
          return draft;
        }, { ...writeOptions, operationId: writeOptions.operationId || 'api:setPlayerName', paths: ['/pkm/player/name'] });
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
      },
      ...(typeof options.pluginExtensions === 'function' ? options.pluginExtensions(api) : {})
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
      await state.loadState(options.initialLoadOptions || {});
    } catch (error) {
      console.warn(`${PLUGIN_NAME} initial state normalization skipped:`, error);
    }

    if (typeof options.afterInitialLoad === 'function') {
      await options.afterInitialLoad(api);
    }

    if (typeof ROOT.eventOn === 'function') {
      ROOT.eventOn('CHAT_CHANGED', () => resetRuntimeState('CHAT_CHANGED'));
      ROOT.eventOn('chat_changed', () => resetRuntimeState('chat_changed'));
      ROOT.eventOn('message_swiped', (messageId) => {
        resetRuntimeState('message_swiped');
        queueMessageRendered(messageId, 'message_swiped', { delayMs: 1200 });
      });
      ROOT.eventOn('message_edited', (messageId) => {
        resetRuntimeState('message_edited');
        queueMessageRendered(messageId, 'message_edited', { delayMs: 1200 });
      });
      ROOT.eventOn('GENERATION_AFTER_COMMANDS', async (detail) => {
        await prompt.handleGenerationBefore(detail);
        if (typeof options.onGenerationAfterCommands === 'function') {
          await options.onGenerationAfterCommands(detail, api);
        }
      });
      ROOT.eventOn('mag_before_message_update', handleBeforeMessageUpdate);
      ROOT.eventOn('character_message_rendered', (messageId) => {
        queueMessageRendered(messageId, 'character_message_rendered');
      });
      ROOT.eventOn('message_received', (messageId) => {
        queueMessageRendered(messageId, 'message_received', { delayMs: 1200 });
      });
      if (typeof options.bindEvents === 'function') {
        options.bindEvents(api, {
          handleMessageRendered: queueMessageRendered,
          resetRuntimeState
        });
      }
    }

    ROOT.addEventListener?.('pagehide', clearMessageRuntimeState);

    console.log(`${PLUGIN_NAME} loaded (${VERSION})`);
    return api;
  };
})();
