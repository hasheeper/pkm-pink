/**
 * PKM Main map environment event runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const COMMON = ROOT.PKMCommonRuntime || {};
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  RUNTIME.createMapRuntime = function createMapRuntime(ctx, stateService, actionsApi) {
    const {
      ROOT: hostRoot,
      PLUGIN_NAME,
      PRODUCT
    } = ctx;
    const {
      clone,
      isObject,
      wait
    } = ctx.util;
    if (typeof COMMON.createScheduler !== 'function') {
      throw new Error(`${PLUGIN_NAME} requires PKMCommonRuntime.createScheduler. Check manifest script order.`);
    }
    const scheduler = COMMON.createScheduler(`${PRODUCT}:map-runtime`);

    const requiredFactories = [
      'createMapShared',
      'createMapWeather',
      'createMapSpawns',
      'createMapPhenomenon',
      'createMapLocationContext'
    ];
    requiredFactories.forEach((factoryName) => {
      if (typeof RUNTIME[factoryName] !== 'function') {
        throw new Error(`${PLUGIN_NAME} requires PKMMainPluginRuntime.${factoryName}. Check manifest script order.`);
      }
    });

    const shared = RUNTIME.createMapShared(ctx);
    const weather = RUNTIME.createMapWeather(ctx, shared);
    const spawns = RUNTIME.createMapSpawns(ctx, shared);
    const phenomenon = RUNTIME.createMapPhenomenon(ctx);
    const locationContext = RUNTIME.createMapLocationContext(ctx, shared, { weather, spawns });

    const runtime = {
      bound: false,
      refreshDelayCancel: null,
      injectDelayCancel: null,
      lastPromptContent: '',
      lastEnvironmentRequestKey: '',
      lastEnvironmentWriteKey: '',
      lastObservedDay: null
    };

    function isValidLocation(location) {
      return Number.isFinite(Number(location?.x)) && Number.isFinite(Number(location?.y));
    }

    function getLocation(state) {
      return isObject(state?.world?.location) ? state.world.location : {};
    }

    function getWorldTime(state) {
      return isObject(state?.world?.time) ? state.world.time : { day: 1, period: 'morning' };
    }

    function getWorldDay(state) {
      return Math.max(1, Math.round(Number(getWorldTime(state).day) || 1));
    }

    function normalizeFloorKey(value) {
      return typeof value === 'string' && value.trim() ? value.trim() : '';
    }

    function makeMessageFloorKey(messageId) {
      if (typeof stateService?.makeMessageFloorKey === 'function') {
        return stateService.makeMessageFloorKey(messageId);
      }
      const id = Number(messageId);
      return Number.isFinite(id) && id >= 0 ? `message:${Math.round(id)}` : '';
    }

    function getCurrentFloorKey() {
      try {
        if (typeof hostRoot.getCurrentMessageId === 'function') {
          const floorKey = makeMessageFloorKey(hostRoot.getCurrentMessageId());
          if (floorKey) return floorKey;
        }
      } catch (_) {}
      try {
        if (typeof hostRoot.getChatMessages === 'function') {
          const latest = hostRoot.getChatMessages(-1)?.[0];
          const floorKey = makeMessageFloorKey(latest?.message_id);
          if (floorKey) return floorKey;
        }
      } catch (_) {}
      try {
        if (typeof hostRoot.getLastMessageId === 'function') {
          const floorKey = makeMessageFloorKey(hostRoot.getLastMessageId());
          if (floorKey) return floorKey;
        }
      } catch (_) {}
      return '';
    }

    function resolveFloorKey(input) {
      const detail = isObject(input?.detail) ? input.detail : null;
      return normalizeFloorKey(input?.floorKey || detail?.floorKey) || getCurrentFloorKey();
    }

    function withRuntimeFloorKey(options = {}) {
      const floorKey = resolveFloorKey(options);
      return floorKey ? { ...options, floorKey } : { ...options };
    }

    function getFloorKeyMismatch(options = {}) {
      const expectedFloorKey = normalizeFloorKey(options.floorKey);
      if (!expectedFloorKey) return null;
      const actualFloorKey = getCurrentFloorKey();
      if (!actualFloorKey || actualFloorKey === expectedFloorKey) return null;
      return {
        ok: false,
        reason: 'floor_key_mismatch',
        floorKey: actualFloorKey,
        expectedFloorKey
      };
    }

    function buildEnvironmentRequestKey(state, options = {}) {
      const location = getLocation(state);
      const time = getWorldTime(state);
      const currentPhenomenon = phenomenon.normalize(state?.world?.phenomenon);
      return JSON.stringify({
        x: Number(location.x) || 0,
        y: Number(location.y) || 0,
        day: Number(time.day) || 1,
        period: time.period || '',
        region: location.region || '',
        phenomenon: currentPhenomenon,
        force: options.force === true || options.daily === true
      });
    }

    function buildEnvironmentWriteKey(payload) {
      return JSON.stringify({
        location: payload.location || null,
        weather: Object.keys(payload.weatherGrid || {}).sort(),
        spawns: Object.keys(payload.pokemonSpawns || {}).sort(),
        phenomenon: payload.phenomenon || null,
        replace: payload.replaceGrids === true
      });
    }

    function makeOperationId(options = {}) {
      if (options.operationId) return options.operationId;
      if (options.daily || options.force) return 'map:environment:refresh';
      return 'map:environment:hydrate';
    }

    async function maybeInjectLocationContext(options = {}, state, reason) {
      if (options.inject === false) return { ok: true, skipped: true };
      return injectLocationContext({ ...options, state, reason });
    }

    async function loadStateForMap(options = {}) {
      if (isObject(options.state)) return options.state;
      return stateService.loadState({
        persist: false,
        requireExisting: options.requireExisting === true,
        floorKey: options.floorKey,
        messageId: options.messageId ?? options.message_id
      });
    }

    async function refreshEnvironmentCore(options = {}) {
      const refreshOptions = withRuntimeFloorKey(options);
      const floorMismatch = getFloorKeyMismatch(refreshOptions);
      if (floorMismatch) return floorMismatch;
      let currentState = null;
      try {
        currentState = await loadStateForMap(refreshOptions);
        if (!currentState) return { ok: false, reason: 'state_missing' };
        const location = getLocation(currentState);
        if (!isValidLocation(location)) return { ok: false, reason: 'location_missing' };
        const currentDay = getWorldDay(currentState);
        const crossedIntoNewDay = runtime.lastObservedDay !== null && currentDay > runtime.lastObservedDay;
        const nextOptions = crossedIntoNewDay
          ? { ...refreshOptions, force: true, daily: true }
          : refreshOptions;

        const requestKey = buildEnvironmentRequestKey(currentState, nextOptions);
        if (!nextOptions.force && runtime.lastEnvironmentRequestKey === requestKey) {
          runtime.lastObservedDay = currentDay;
          await maybeInjectLocationContext(nextOptions, currentState, refreshOptions.reason || 'environmentUnchanged');
          return { ok: true, unchanged: true, state: currentState };
        }

        await shared.loadData();
        const x = Number(location.x);
        const y = Number(location.y);
        const region = shared.getRegionShortByCoords(x, y);
        const time = getWorldTime(currentState);
        const nextPhenomenon = phenomenon.computeForDay(time.day, currentState?.world?.phenomenon, {
          force: nextOptions.force === true || nextOptions.daily === true
        });
        const forceGenerate = nextOptions.force === true || nextOptions.daily === true || nextOptions.replaceGrids === true;
        const replaceGrids = nextOptions.daily === true || nextOptions.replaceGrids === true;
        const workingState = clone(currentState, {});
        workingState.world = isObject(workingState.world) ? workingState.world : {};
        workingState.world.phenomenon = nextPhenomenon;

        const [newWeather, newSpawns] = await Promise.all([
          weather.generateForNearbyGrids(x, y, workingState, forceGenerate),
          spawns.generateForNearbyGrids(x, y, workingState, forceGenerate)
        ]);

        const payload = {};
        if (location.region !== region) {
          payload.location = { ...location, region };
        }
        if (!phenomenon.equals(currentState?.world?.phenomenon, nextPhenomenon)) {
          payload.phenomenon = nextPhenomenon;
        }
        if (replaceGrids || (newWeather && Object.keys(newWeather).length)) payload.weatherGrid = newWeather || {};
        if (replaceGrids || (newSpawns && Object.keys(newSpawns).length)) payload.pokemonSpawns = newSpawns || {};
        if (replaceGrids) payload.replaceGrids = true;

        const hasWork = Boolean(payload.location || payload.phenomenon || payload.weatherGrid || payload.pokemonSpawns);
        if (!hasWork) {
          runtime.lastEnvironmentRequestKey = requestKey;
          runtime.lastObservedDay = currentDay;
          await maybeInjectLocationContext(nextOptions, currentState, refreshOptions.reason || 'environmentReady');
          return { ok: true, unchanged: true, state: currentState };
        }

        const writeKey = buildEnvironmentWriteKey(payload);
        if (!nextOptions.force && runtime.lastEnvironmentWriteKey === writeKey) {
          runtime.lastEnvironmentRequestKey = requestKey;
          runtime.lastObservedDay = currentDay;
          await maybeInjectLocationContext(nextOptions, currentState, refreshOptions.reason || 'environmentWriteDedup');
          return { ok: true, unchanged: true, deduped: true, state: currentState };
        }

        const nextState = await actionsApi.dispatchAction('world.refreshMapEnvironment', payload, {
          floorKey: nextOptions.floorKey,
          messageId: nextOptions.messageId ?? nextOptions.message_id,
          operationId: makeOperationId(nextOptions)
        });
        runtime.lastEnvironmentRequestKey = requestKey;
        runtime.lastEnvironmentWriteKey = writeKey;
        runtime.lastObservedDay = getWorldDay(nextState);
        await maybeInjectLocationContext({ ...nextOptions, force: true }, nextState, refreshOptions.reason || 'environmentUpdated');
        return { ok: true, state: nextState, payload };
      } catch (error) {
        console.error(`${PLUGIN_NAME} map environment refresh failed:`, error);
        return { ok: false, reason: error?.message || 'map_refresh_failed', error };
      }
    }

    async function injectLocationContextCore(options = {}) {
      const injectOptions = withRuntimeFloorKey(options);
      const floorMismatch = getFloorKeyMismatch(injectOptions);
      if (floorMismatch) return floorMismatch;
      try {
        const currentState = await loadStateForMap(injectOptions);
        if (!currentState) return { ok: false, reason: 'state_missing' };
        if (!isValidLocation(getLocation(currentState))) return { ok: false, reason: 'location_missing' };
        await shared.loadData();
        const promptContent = locationContext.buildPrompt(currentState, {
          forceNpcScan: injectOptions.force === true || injectOptions.forceNpcScan === true
        });
        if (!promptContent) return { ok: false, reason: 'prompt_empty' };
        if (!injectOptions.force && promptContent === runtime.lastPromptContent) {
          return { ok: true, unchanged: true, content: promptContent };
        }
        const lateFloorMismatch = getFloorKeyMismatch(injectOptions);
        if (lateFloorMismatch) return lateFloorMismatch;
        clearLocationContext({ silent: true });
        if (typeof hostRoot.injectPrompts !== 'function') {
          console.warn(`${PLUGIN_NAME} injectPrompts unavailable; location context not injected`);
          return { ok: false, reason: 'inject_prompts_unavailable', content: promptContent };
        }
        hostRoot.injectPrompts([{
          id: shared.LOCATION_INJECT_ID,
          position: 'after_wi_scan',
          depth: 0,
          role: 'system',
          should_scan: false,
          content: promptContent
        }]);
        runtime.lastPromptContent = promptContent;
        console.log(`${PLUGIN_NAME} location context injected`, {
          reason: injectOptions.reason || '',
          length: promptContent.length
        });
        return { ok: true, content: promptContent };
      } catch (error) {
        console.error(`${PLUGIN_NAME} location context injection failed:`, error);
        return { ok: false, reason: error?.message || 'location_context_failed', error };
      }
    }

    const refreshEnvironmentQueued = scheduler.coalesceLatest(
      (options = {}) => refreshEnvironmentCore(options),
      { label: 'mapRefresh' }
    );

    const injectLocationContextQueued = scheduler.coalesceLatest(
      (options = {}) => injectLocationContextCore(options),
      { label: 'mapInject' }
    );

    function refreshEnvironment(options = {}) {
      return refreshEnvironmentQueued(withRuntimeFloorKey(options));
    }

    function injectLocationContext(options = {}) {
      return injectLocationContextQueued(withRuntimeFloorKey(options));
    }

    function clearLocationContext(options = {}) {
      debouncedInject.cancel?.();
      if (typeof runtime.injectDelayCancel === 'function') {
        try { runtime.injectDelayCancel(); } catch (_) {}
        runtime.injectDelayCancel = null;
      }
      let cleared = false;
      try {
        if (typeof hostRoot.uninjectPrompts === 'function') {
          hostRoot.uninjectPrompts([shared.LOCATION_INJECT_ID]);
          cleared = true;
        }
      } catch (error) {
        if (!options.silent) console.warn(`${PLUGIN_NAME} clear location context failed:`, error);
      }
      if (!options.silent) runtime.lastPromptContent = '';
      return { ok: cleared };
    }

    const debouncedRefresh = scheduler.debounceTrailing(
      (reason = 'refresh', options = {}) => refreshEnvironment({ ...options, reason }),
      { delayMs: 180, maxWaitMs: 700, label: 'mapRefreshDebounce' }
    );

    const debouncedInject = scheduler.debounceTrailing(
      (reason = 'inject', options = {}) => injectLocationContext({ ...options, reason }),
      { delayMs: 120, maxWaitMs: 420, label: 'mapInjectDebounce' }
    );

    function scheduleRefresh(reason, options = {}) {
      const nextOptions = withRuntimeFloorKey(options);
      const delayMs = Math.max(0, Number(nextOptions.delayMs) || 0);
      if (typeof runtime.refreshDelayCancel === 'function') {
        try { runtime.refreshDelayCancel(); } catch (_) {}
        runtime.refreshDelayCancel = null;
      }
      if (delayMs > 0) {
        const queuedOptions = { ...nextOptions };
        delete queuedOptions.delayMs;
        runtime.refreshDelayCancel = scheduler.setTimer(() => {
          runtime.refreshDelayCancel = null;
          debouncedRefresh(reason, queuedOptions);
        }, delayMs, `mapRefreshDelay:${reason}`);
        return;
      }
      debouncedRefresh(reason, nextOptions);
    }

    function scheduleInject(reason, options = {}) {
      const nextOptions = withRuntimeFloorKey(options);
      const delayMs = Math.max(0, Number(nextOptions.delayMs) || 0);
      if (typeof runtime.injectDelayCancel === 'function') {
        try { runtime.injectDelayCancel(); } catch (_) {}
        runtime.injectDelayCancel = null;
      }
      if (delayMs > 0) {
        const queuedOptions = { ...nextOptions };
        delete queuedOptions.delayMs;
        runtime.injectDelayCancel = scheduler.setTimer(() => {
          runtime.injectDelayCancel = null;
          debouncedInject(reason, queuedOptions);
        }, delayMs, `mapInjectDelay:${reason}`);
        return;
      }
      debouncedInject(reason, nextOptions);
    }

    function handleStateChanged(eventOrDetail) {
      const state = eventOrDetail?.detail?.state || eventOrDetail?.state || null;
      const day = state ? getWorldDay(state) : null;
      const crossedIntoNewDay = day !== null && runtime.lastObservedDay !== null && day > runtime.lastObservedDay;
      scheduleRefresh('stateChanged', {
        state,
        floorKey: resolveFloorKey(eventOrDetail),
        force: crossedIntoNewDay,
        daily: crossedIntoNewDay
      });
    }

    function cancelScheduledTasks() {
      if (typeof runtime.refreshDelayCancel === 'function') {
        try { runtime.refreshDelayCancel(); } catch (_) {}
        runtime.refreshDelayCancel = null;
      }
      if (typeof runtime.injectDelayCancel === 'function') {
        try { runtime.injectDelayCancel(); } catch (_) {}
        runtime.injectDelayCancel = null;
      }
      debouncedRefresh.cancel?.();
      debouncedInject.cancel?.();
      scheduler.disposeAll();
    }

    function resetForChat(reason) {
      cancelScheduledTasks();
      runtime.lastPromptContent = '';
      runtime.lastEnvironmentRequestKey = '';
      runtime.lastEnvironmentWriteKey = '';
      runtime.lastObservedDay = null;
      locationContext.resetCache();
      scheduleRefresh(reason || 'chatChanged', {
        delayMs: 400,
        floorKey: getCurrentFloorKey()
      });
    }

    function bindEventOn(name, handler) {
      if (typeof hostRoot.eventOn !== 'function') return;
      try {
        hostRoot.eventOn(name, handler);
      } catch (error) {
        console.warn(`${PLUGIN_NAME} failed to bind ${name}:`, error);
      }
    }

    function bindEvents() {
      if (runtime.bound) return;
      runtime.bound = true;
      hostRoot.addEventListener?.('pkm:stateChanged', handleStateChanged);
      bindEventOn('generation_ended', () => scheduleRefresh('generationEnded'));
      bindEventOn('GENERATION_AFTER_COMMANDS', () => scheduleInject('generationBefore'));
      bindEventOn('chat_changed', () => resetForChat('chatChanged'));
      bindEventOn('CHAT_CHANGED', () => resetForChat('CHAT_CHANGED'));
      bindEventOn('pkm:refreshPokemonSpawns', (detail) => {
        scheduleRefresh('dailyRefresh', {
          force: true,
          daily: true,
          floorKey: resolveFloorKey(detail),
          delayMs: 50
        });
      });
      hostRoot.addEventListener?.('pagehide', cancelScheduledTasks);
      scheduler.setTimer(() => {
        refreshEnvironment({
          reason: 'initial',
          floorKey: getCurrentFloorKey()
        });
      }, 800, 'mapInitialRefresh');
      scheduler.setTimer(() => {
        injectLocationContext({
          reason: 'initial',
          floorKey: getCurrentFloorKey()
        });
      }, 1400, 'mapInitialInject');
    }

    async function waitForData(options = {}) {
      const retries = Math.max(1, Number(options.retries) || 20);
      for (let index = 0; index < retries; index += 1) {
        const data = await shared.loadData();
        if (data.dataLoaded) return data;
        await wait(Number(options.intervalMs) || 150);
      }
      return shared.state;
    }

    return {
      product: PRODUCT,
      shared,
      weather,
      spawns,
      phenomenon,
      locationContext,
      bindEvents,
      waitForData,
      refreshEnvironment,
      injectLocationContext,
      clearLocationContext
    };
  };
})();
