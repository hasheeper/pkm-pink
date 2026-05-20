/**
 * PKM common state + MVU replay runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const COMMON = ROOT.PKMCommonRuntime || {};
  ROOT.PKMCommonRuntime = COMMON;

  COMMON.createStateReplay = function createStateReplay(ctx, options = {}) {
    const {
      ROOT: hostRoot,
      CORE,
      PLUGIN_NAME,
      PRODUCT,
      STAT_KEY,
      PKM_KEY
    } = ctx;
    const {
      clone,
      isObject,
      normalizePkmState,
      readJsonPointer,
      appendJsonPointerPath,
      areJsonValuesEqual
    } = ctx.util;

    async function readStatData(options = {}) {
      const hasExplicitFloor = options.messageId !== undefined
        || options.message_id !== undefined
        || (typeof options.floorKey === 'string' && options.floorKey.trim());
      if (hasExplicitFloor) {
        const messageId = resolveReplayMessageId(options);
        const vars = await getMessageVariableBundle(messageId);
        return isObject(vars?.[STAT_KEY]) ? vars[STAT_KEY] : {};
      }
      return CORE.mvu.readStatData(STAT_KEY, { type: 'message' });
    }

    function buildReplayPatch(op, path, value) {
      const patch = { op, path };
      if (op !== 'remove') patch.value = clone(value, value);
      return patch;
    }

    function collectReplayDiffPatches(prevValue, nextValue, path, patches) {
      if (!path || areJsonValuesEqual(prevValue, nextValue)) return;
      if (nextValue === undefined) {
        patches.push(buildReplayPatch('remove', path));
        return;
      }
      if (prevValue === undefined) {
        patches.push(buildReplayPatch('add', path, nextValue));
        return;
      }
      if (isObject(prevValue) && isObject(nextValue)) {
        const keys = new Set([...Object.keys(prevValue), ...Object.keys(nextValue)]);
        keys.forEach((key) => {
          collectReplayDiffPatches(prevValue[key], nextValue[key], appendJsonPointerPath(path, key), patches);
        });
        return;
      }
      patches.push(buildReplayPatch('replace', path, nextValue));
    }

    function buildReplayDiffPatchesForPaths(prevRoot, nextRoot, paths) {
      const patches = [];
      (Array.isArray(paths) ? paths : []).forEach((path) => {
        const nextValue = readJsonPointer(nextRoot, path);
        if (nextValue === undefined) return;
        collectReplayDiffPatches(readJsonPointer(prevRoot, path), nextValue, path, patches);
      });
      return patches;
    }

    function buildReplayValuePatchesForPaths(nextRoot, paths) {
      const patches = [];
      (Array.isArray(paths) ? paths : []).forEach((path) => {
        const nextValue = readJsonPointer(nextRoot, path);
        if (nextValue !== undefined) patches.push(buildReplayPatch('add', path, nextValue));
      });
      return patches;
    }

    function sanitizeReplayOperationId(value) {
      return String(value || 'pkm')
        .trim()
        .replace(/[^\w:.-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 120) || 'pkm';
    }

    function escapeRegExp(value) {
      return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function buildPkmReplayBlock(operationId, patches) {
      const id = sanitizeReplayOperationId(operationId);
      if (typeof options.buildReplayBlock === 'function') {
        return options.buildReplayBlock(id, patches);
      }
      if (options.replayBlockFormat === 'compact') {
        return `<UpdateVariable><Analyze>PKM_REPLAY:${id}</Analyze><JSONPatch>${JSON.stringify(patches)}</JSONPatch></UpdateVariable>`;
      }
      return [
        '<UpdateVariable>',
        `<Analyze>PKM_REPLAY:${id}</Analyze>`,
        '<JSONPatch>',
        JSON.stringify(patches, null, 2),
        '</JSONPatch>',
        '</UpdateVariable>'
      ].join('\n');
    }

    function stripPkmReplayBlock(content, operationId) {
      const id = sanitizeReplayOperationId(operationId);
      const text = typeof content === 'string' ? content : '';
      const pattern = new RegExp(
        `\\n*<UpdateVariable>\\s*<Analyze>\\s*PKM_REPLAY:${escapeRegExp(id)}\\s*<\\/Analyze>\\s*<JSONPatch>[\\s\\S]*?<\\/JSONPatch>\\s*<\\/UpdateVariable>\\s*`,
        'gi'
      );
      return text.replace(pattern, '\n\n').replace(/\n{4,}/g, '\n\n\n').trimEnd();
    }

    function insertPkmReplayBlock(content, block) {
      const text = typeof content === 'string' ? content : '';
      const placeholder = '<StatusPlaceHolderImpl/>';
      const index = text.indexOf(placeholder);
      if (index >= 0) {
        const before = text.slice(0, index).trimEnd();
        const after = text.slice(index);
        return `${before}\n\n${block}\n\n${after.trimStart()}`;
      }
      const trimmed = text.trimEnd();
      return trimmed ? `${trimmed}\n\n${block}` : block;
    }

    function parseMessageIdFromFloorKey(floorKey) {
      const match = String(floorKey || '').trim().match(/^message:(\d+)$/i);
      if (!match) return null;
      const id = Number(match[1]);
      return Number.isFinite(id) && id >= 0 ? Math.round(id) : null;
    }

    function makeMessageFloorKey(messageId) {
      if (messageId === null || messageId === undefined || messageId === '') return '';
      const id = Number(messageId);
      return Number.isFinite(id) && id >= 0 ? `message:${Math.round(id)}` : '';
    }

    function getLatestMessageId() {
      try {
        if (typeof hostRoot.getCurrentMessageId === 'function') {
          const id = Number(hostRoot.getCurrentMessageId());
          if (Number.isFinite(id) && id >= 0) return Math.round(id);
        }
      } catch (_) {}
      try {
        if (typeof hostRoot.getChatMessages === 'function') {
          const latest = hostRoot.getChatMessages(-1)?.[0];
          const id = Number(latest?.message_id);
          if (Number.isFinite(id) && id >= 0) return Math.round(id);
        }
      } catch (_) {}
      try {
        if (typeof hostRoot.getLastMessageId === 'function') {
          const id = Number(hostRoot.getLastMessageId());
          if (Number.isFinite(id) && id >= 0) return Math.round(id);
        }
      } catch (_) {}
      return null;
    }

    function resolveReplayMessageId(options = {}) {
      const explicitId = Number(options.messageId ?? options.message_id);
      if (Number.isFinite(explicitId) && explicitId >= 0) return Math.round(explicitId);
      const floorId = parseMessageIdFromFloorKey(options.floorKey);
      if (floorId !== null) return floorId;
      return getLatestMessageId();
    }

    function hasMvuReplayBase(vars) {
      return isObject(vars) && isObject(vars.stat_data) && Object.prototype.hasOwnProperty.call(vars, 'schema');
    }

    async function getMessageVariableBundle(messageId) {
      if (typeof hostRoot.getVariables !== 'function') return null;
      try {
        const id = Number(messageId);
        const options = { type: 'message' };
        if (Number.isFinite(id) && id >= 0) options.message_id = Math.round(id);
        const vars = await hostRoot.getVariables(options);
        return isObject(vars) ? vars : null;
      } catch (error) {
        console.warn(`${PLUGIN_NAME} failed to read message MVU variables:`, error);
        return null;
      }
    }

    function resolveMvuReplayHandler() {
      const candidates = [];
      const seen = [];
      const pushHandler = (owner) => {
        try {
          const fn = owner && owner.handleVariablesInMessage;
          if (typeof fn !== 'function' || seen.includes(fn)) return;
          seen.push(fn);
          candidates.push(fn.bind(owner));
        } catch (_) {}
      };
      try {
        if (typeof handleVariablesInMessage === 'function' && !seen.includes(handleVariablesInMessage)) {
          seen.push(handleVariablesInMessage);
          candidates.push(handleVariablesInMessage);
        }
      } catch (_) {}
      try { pushHandler(hostRoot); } catch (_) {}
      try { pushHandler(hostRoot?.parent); } catch (_) {}
      try { pushHandler(hostRoot?.parent?.parent); } catch (_) {}
      try { pushHandler(hostRoot?.top); } catch (_) {}
      try { pushHandler(typeof window !== 'undefined' ? window : null); } catch (_) {}
      try { pushHandler(typeof window !== 'undefined' ? window?.parent : null); } catch (_) {}
      try { pushHandler(typeof window !== 'undefined' ? window?.top : null); } catch (_) {}
      try { pushHandler(typeof unsafeWindow === 'object' ? unsafeWindow : null); } catch (_) {}
      try { pushHandler(typeof unsafeWindow === 'object' ? unsafeWindow?.parent : null); } catch (_) {}
      try { pushHandler(typeof unsafeWindow === 'object' ? unsafeWindow?.top : null); } catch (_) {}
      try { pushHandler(hostRoot?.STBridge?.mvu); } catch (_) {}
      return candidates[0] || null;
    }

    function resolveMvuApi() {
      const candidates = [];
      const pushOwner = (owner) => {
        try {
          if (owner && !candidates.includes(owner)) candidates.push(owner);
        } catch (_) {}
      };
      try { pushOwner(hostRoot); } catch (_) {}
      try { pushOwner(hostRoot?.parent); } catch (_) {}
      try { pushOwner(hostRoot?.parent?.parent); } catch (_) {}
      try { pushOwner(hostRoot?.top); } catch (_) {}
      try { pushOwner(typeof window !== 'undefined' ? window : null); } catch (_) {}
      try { pushOwner(typeof window !== 'undefined' ? window?.parent : null); } catch (_) {}
      try { pushOwner(typeof window !== 'undefined' ? window?.top : null); } catch (_) {}
      try { pushOwner(typeof unsafeWindow === 'object' ? unsafeWindow : null); } catch (_) {}
      try { pushOwner(typeof unsafeWindow === 'object' ? unsafeWindow?.parent : null); } catch (_) {}
      try { pushOwner(typeof unsafeWindow === 'object' ? unsafeWindow?.top : null); } catch (_) {}

      for (const owner of candidates) {
        const api = owner?.Mvu;
        if (api && typeof api.parseMessage === 'function' && typeof api.replaceMvuData === 'function') {
          return api;
        }
      }
      return null;
    }

    async function getMvuReplayBaseVariables(messageId) {
      const id = Math.round(Number(messageId) || 0);
      const previousId = id > 0 ? id - 1 : 0;
      const previousVars = await getMessageVariableBundle(previousId);
      if (hasMvuReplayBase(previousVars)) return clone(previousVars, previousVars);
      if (id === 0) {
        const currentVars = await getMessageVariableBundle(0);
        if (hasMvuReplayBase(currentVars)) return clone(currentVars, currentVars);
      }
      return null;
    }

    async function replayMessageThroughMvu(messageId) {
      const replayHandler = resolveMvuReplayHandler();
      if (typeof replayHandler === 'function') {
        await replayHandler(messageId);
        return { ok: true, method: 'handleVariablesInMessage' };
      }

      const mvuApi = resolveMvuApi();
      if (!mvuApi) return { ok: false, reason: 'mvu_replay_unavailable' };

      const id = Math.round(Number(messageId) || 0);
      const msg = typeof hostRoot.getChatMessages === 'function' ? hostRoot.getChatMessages(id)?.[0] : null;
      if (!msg || typeof msg.message !== 'string') return { ok: false, reason: 'message_not_found' };

      const baseVars = await getMvuReplayBaseVariables(id);
      if (!hasMvuReplayBase(baseVars)) return { ok: false, reason: 'mvu_replay_missing_base' };

      const nextVars = await mvuApi.parseMessage(msg.message, baseVars);
      if (!hasMvuReplayBase(nextVars)) return { ok: false, reason: 'mvu_replay_parse_failed' };
      await mvuApi.replaceMvuData(nextVars, { type: 'message', message_id: id });
      return { ok: true, method: 'Mvu.parseMessage' };
    }

    async function parseMvuVariablesFromMessage(messageId, messageText) {
      const mvuApi = resolveMvuApi();
      if (!mvuApi) return null;
      const baseVars = await getMvuReplayBaseVariables(messageId);
      if (!hasMvuReplayBase(baseVars)) return null;
      try {
        const parsed = await mvuApi.parseMessage(String(messageText || ''), baseVars);
        return hasMvuReplayBase(parsed) ? parsed : null;
      } catch (error) {
        console.warn(`${PLUGIN_NAME} failed to parse stripped MVU replay baseline:`, error);
        return null;
      }
    }

    function normalizeReplayPatches(patches) {
      const byPath = new Map();
      (Array.isArray(patches) ? patches : []).forEach((patch) => {
        if (!patch || typeof patch !== 'object') return;
        const path = typeof patch.path === 'string' ? patch.path.trim() : '';
        if (!path || !path.startsWith('/pkm')) return;
        byPath.set(path, { ...patch, path });
      });
      return Array.from(byPath.values());
    }

    async function commitPkmReplayPatch(options = {}) {
      const requestedPatches = Array.isArray(options.patches) ? options.patches.filter((item) => item && typeof item === 'object') : [];
      const hasAfterStatData = isObject(options.afterStatData);
      const messageId = resolveReplayMessageId(options);
      if (!Number.isFinite(Number(messageId)) || Number(messageId) < 0) {
        return { ok: false, reason: 'missing_message_id' };
      }

      const normalizedMessageId = Math.round(Number(messageId));
      const expectedFloorKey = typeof options.floorKey === 'string' ? options.floorKey.trim() : '';
      const actualFloorKey = makeMessageFloorKey(normalizedMessageId);
      if (expectedFloorKey && expectedFloorKey !== actualFloorKey) {
        return { ok: false, reason: 'floor_key_mismatch', floorKey: actualFloorKey, expectedFloorKey };
      }

      const vars = await getMessageVariableBundle(normalizedMessageId);
      if (!hasMvuReplayBase(vars)) {
        return { ok: false, reason: 'mvu_replay_missing_base', messageId: normalizedMessageId, floorKey: actualFloorKey };
      }

      if (typeof hostRoot.getChatMessages !== 'function' || typeof hostRoot.setChatMessages !== 'function') {
        return { ok: false, reason: 'chat_message_api_unavailable', messageId: normalizedMessageId, floorKey: actualFloorKey };
      }

      const messages = hostRoot.getChatMessages(normalizedMessageId);
      const msg = Array.isArray(messages) ? messages[0] : null;
      if (!msg || typeof msg !== 'object') {
        return { ok: false, reason: 'message_not_found', messageId: normalizedMessageId, floorKey: actualFloorKey };
      }

      const hasReplayHandler = typeof resolveMvuReplayHandler() === 'function';
      const hasMvuApi = Boolean(resolveMvuApi());
      if (!hasReplayHandler && !hasMvuApi) {
        return { ok: false, reason: 'mvu_replay_unavailable', messageId: normalizedMessageId, floorKey: actualFloorKey };
      }

      const operationId = sanitizeReplayOperationId(options.operationId || `pkm:${normalizedMessageId}`);
      const stripIds = [
        operationId,
        ...(Array.isArray(options.replaceOperationIds) ? options.replaceOperationIds : [])
      ].map(sanitizeReplayOperationId).filter(Boolean);
      const uniqueStripIds = Array.from(new Set(stripIds));
      const originalMessage = msg.message || '';
      const stripped = uniqueStripIds.reduce((content, stripId) => stripPkmReplayBlock(content, stripId), originalMessage);

      let patchList = requestedPatches;
      const replayPaths = Array.isArray(options.paths) && options.paths.length ? options.paths : ['/pkm'];
      if (hasAfterStatData) {
        const parsedBaseline = await parseMvuVariablesFromMessage(normalizedMessageId, stripped);
        const hasParsedBaseline = hasMvuReplayBase(parsedBaseline);
        const baselineStatData = hasParsedBaseline
          ? parsedBaseline.stat_data
          : (isObject(options.beforeStatData) ? options.beforeStatData : vars.stat_data);
        patchList = buildReplayDiffPatchesForPaths(baselineStatData, options.afterStatData, replayPaths);
        if (!hasParsedBaseline && stripped !== originalMessage && replayPaths.length) {
          patchList = buildReplayValuePatchesForPaths(options.afterStatData, replayPaths);
        }
      }

      patchList = normalizeReplayPatches(patchList);
      if (!patchList.length) {
        if (hasAfterStatData && stripped !== originalMessage) {
          await hostRoot.setChatMessages([{ message_id: normalizedMessageId, message: stripped }], { refresh: options.refresh || 'affected' });
          const replayResult = await replayMessageThroughMvu(normalizedMessageId);
          if (!replayResult.ok) {
            return { ok: false, reason: replayResult.reason || 'mvu_replay_failed', messageId: normalizedMessageId, floorKey: actualFloorKey, operationId };
          }
          return {
            ok: true,
            messageId: normalizedMessageId,
            floorKey: actualFloorKey,
            operationId,
            patchCount: 0,
            removedReplayBlock: true,
            replayMethod: replayResult.method || ''
          };
        }
        return { ok: true, messageId: normalizedMessageId, floorKey: actualFloorKey, operationId, patchCount: 0, unchanged: true };
      }

      const block = buildPkmReplayBlock(operationId, patchList);
      const nextMessage = insertPkmReplayBlock(stripped, block);
      await hostRoot.setChatMessages([{ message_id: normalizedMessageId, message: nextMessage }], { refresh: options.refresh || 'affected' });

      const replayResult = await replayMessageThroughMvu(normalizedMessageId);
      if (!replayResult.ok) {
        return { ok: false, reason: replayResult.reason || 'mvu_replay_failed', messageId: normalizedMessageId, floorKey: actualFloorKey, operationId };
      }
      return {
        ok: true,
        messageId: normalizedMessageId,
        floorKey: actualFloorKey,
        operationId,
        patchCount: patchList.length,
        replayMethod: replayResult.method || ''
      };
    }

    async function persistPkmStatePatch(nextState, options = {}) {
      const messageId = resolveReplayMessageId(options);
      if (!Number.isFinite(Number(messageId)) || Number(messageId) < 0) {
        throw new Error('missing_message_id');
      }
      const vars = await getMessageVariableBundle(messageId);
      if (!hasMvuReplayBase(vars)) {
        throw new Error('mvu_replay_missing_base');
      }
      const beforeStatData = isObject(vars.stat_data) ? vars.stat_data : {};
      const normalized = normalizePkmState(nextState);
      const afterStatData = { ...beforeStatData, [PKM_KEY]: normalized };
      const result = await commitPkmReplayPatch({
        messageId,
        floorKey: options.floorKey,
        operationId: options.operationId || 'state:pkm',
        replaceOperationIds: options.replaceOperationIds,
        beforeStatData,
        afterStatData,
        paths: Array.isArray(options.paths) && options.paths.length ? options.paths : ['/pkm'],
        refresh: options.refresh
      });
      if (!result.ok) {
        const error = new Error(result.reason || 'mvu_replay_failed');
        error.result = result;
        throw error;
      }
      notifyStateChanged(normalized);
      return normalized;
    }

    async function loadState(options = {}) {
      const statData = await readStatData(options);
      const existing = isObject(statData[PKM_KEY]) ? statData[PKM_KEY] : null;
      if (existing) {
        const normalized = normalizePkmState(existing);
        const changed = JSON.stringify(existing) !== JSON.stringify(normalized);
        if (changed && options.persist !== false) {
          await persistPkmStatePatch(normalized, {
            operationId: 'state:normalize',
            paths: ['/pkm'],
            floorKey: options.floorKey,
            messageId: options.messageId ?? options.message_id
          });
        }
        return normalized;
      }

      if (options.requireExisting) return null;
      const initial = normalizePkmState({});
      const shouldPersistInitial = options.persist !== false;
      if (shouldPersistInitial) {
        await persistPkmStatePatch(initial, {
          operationId: 'state:initialize',
          paths: ['/pkm'],
          floorKey: options.floorKey,
          messageId: options.messageId ?? options.message_id
        });
      }
      return initial;
    }

    async function saveState(nextState, options = {}) {
      return persistPkmStatePatch(nextState, {
        operationId: options.operationId || 'state:save',
        replaceOperationIds: options.replaceOperationIds,
        paths: Array.isArray(options.paths) && options.paths.length ? options.paths : ['/pkm'],
        floorKey: options.floorKey,
        messageId: options.messageId ?? options.message_id,
        refresh: options.refresh
      });
    }

    async function patchState(patcher, options = {}) {
      const current = await loadState({
        floorKey: options.floorKey,
        messageId: options.messageId ?? options.message_id,
        persist: options.persistNormalization
      });
      const draft = clone(current, {});
      const result = await patcher(draft);
      return saveState(result || draft, options);
    }

    function notifyStateChanged(state) {
      try {
        hostRoot.dispatchEvent?.(new CustomEvent('pkm:stateChanged', { detail: { product: PRODUCT, state } }));
      } catch (_) {}
    }

    return {
      readStatData,
      loadState,
      saveState,
      patchState,
      notifyStateChanged,
      makeMessageFloorKey,
      commitPkmReplayPatch,
      resolveReplayMessageId
    };
  };
})();
