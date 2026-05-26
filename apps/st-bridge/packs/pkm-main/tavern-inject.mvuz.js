/**
 * PKM PINK Main - dashboard host adapter.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;

  if (typeof ROOT.PKMCommonRuntime?.startDashboardHost !== 'function') {
    throw new Error('[PKM Main Dashboard MVUZ] requires PKMCommonRuntime.startDashboardHost. Load pkm-common/dashboard-host.mvuz.js before this script.');
  }

  function clampNpcLove(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(-100, Math.min(100, Math.round(n)));
  }

  function deriveNpcDashboardStage(npcId, record, state) {
    const api = ROOT.PKMMainPluginRuntime?.data?.npc || ROOT.PKM_MAIN_NPC_DATA || null;
    const bonds = state?.player?.bonds || {};
    if (typeof api?.deriveNpcStage === 'function') return api.deriveNpcStage(npcId, record, bonds);
    const love = clampNpcLove(record?.love);
    if (love <= -40) return -2;
    if (love <= -20) return -1;
    if (love < 20) return 0;
    if (love < 40) return 1;
    if (love < 60) return 2;
    if (love < 80) return 3;
    return 4;
  }

  function toDashboardNpcRecords(npcs, state, helpers) {
    const records = helpers.clone(npcs?.records, {});
    const output = {};
    Object.entries(records || {}).forEach(([key, record]) => {
      if (!key || !record || typeof record !== 'object') return;
      const love = clampNpcLove(record.love);
      output[key] = {
        love,
        stage: deriveNpcDashboardStage(key, { love }, state)
      };
    });
    return output;
  }

  function adaptDashboardState(state, helpers) {
    const dashboard = helpers.toLegacyDashboardView(state);
    const party = dashboard.party || {};
    const world = helpers.clone(state?.world, {});
    const npcs = helpers.clone(state?.npcs, { records: {} });
    const npcRecords = toDashboardNpcRecords(npcs, state, helpers);
    party.transferBuffer = helpers.clone(party.transfer_buffer, party.transfer_buffer);
    const worldState = {
      ...world,
      weather_grid: helpers.clone(world.weatherGrid, {}),
      pokemon_spawns: helpers.clone(world.pokemonSpawns, {}),
      npcs: npcRecords
    };

    return {
      ...dashboard,
      player: {
        ...(dashboard.player || {}),
        party,
        box: dashboard.box || {},
        settings: dashboard.settings || helpers.clone(state?.settings, {})
      },
      party,
      box: dashboard.box || {},
      settings: dashboard.settings || helpers.clone(state?.settings, {}),
      world,
      world_state: worldState,
      npcs: {
        ...npcs,
        records: npcRecords
      }
    };
  }

  function normalizeMapLocation(location) {
    if (!location || typeof location !== 'object') return null;
    const x = Number(location.x);
    const y = Number(location.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    const next = { ...location, x, y };
    if (typeof next.region !== 'string') delete next.region;
    return next;
  }

  async function handleMapEnvironmentRequest(event, eventData, helpers) {
    const requestId = eventData?.requestId || '';
    const payload = helpers.getPlainObject(eventData?.payload);
    const floorKey = eventData?.floorKey || helpers.getCurrentFloorKey();
    const location = normalizeMapLocation(payload.location);
    const reason = payload.reason || 'dashboardMapEnvironment';
    try {
      if (typeof ROOT.PKMPlugin?.map?.refreshEnvironment !== 'function') {
        throw new Error('PKMPlugin.map.refreshEnvironment is unavailable');
      }

      let state = null;
      if (location) {
        state = await helpers.dispatchPluginAction('world.updateLocation', { location }, {
          floorKey,
          operationId: requestId ? `map:location:${requestId}` : 'map:location'
        });
      }

      const refreshResult = await ROOT.PKMPlugin.map.refreshEnvironment({
        floorKey,
        force: payload.force === true,
        daily: payload.daily === true,
        replaceGrids: payload.replaceGrids === true,
        inject: payload.inject === true,
        reason
      });
      if (!refreshResult?.ok) {
        throw new Error(refreshResult?.reason || 'map_environment_refresh_failed');
      }

      state = refreshResult.state || state || await helpers.loadMvuzState();
      await helpers.pushDashboardState(`map:environment:${reason}`, state);
      helpers.postTypedResult(event, 'PKM_MAP_ENVIRONMENT_RESULT', {
        ok: true,
        requestId,
        floorKey,
        reason,
        state,
        result: {
          unchanged: refreshResult.unchanged === true,
          deduped: refreshResult.deduped === true,
          payload: refreshResult.payload || null
        }
      });
      return { ok: true, state };
    } catch (error) {
      console.error(`${helpers.pluginName} map environment request failed:`, error);
      const result = {
        ok: false,
        requestId,
        floorKey,
        reason: error?.message || 'map_environment_failed',
        message: error?.message || String(error)
      };
      helpers.postTypedResult(event, 'PKM_MAP_ENVIRONMENT_ERROR', result);
      return result;
    }
  }

  async function handleMapContextRequest(event, eventData, helpers) {
    const requestId = eventData?.requestId || '';
    const payload = helpers.getPlainObject(eventData?.payload);
    const floorKey = eventData?.floorKey || helpers.getCurrentFloorKey();
    const mode = payload.mode === 'clear' ? 'clear' : 'inject';
    const reason = payload.reason || `dashboardMapContext:${mode}`;
    try {
      const mapApi = ROOT.PKMPlugin?.map;
      if (!mapApi) throw new Error('PKMPlugin.map is unavailable');
      const result = mode === 'clear'
        ? mapApi.clearLocationContext({ reason })
        : await mapApi.injectLocationContext({
            floorKey,
            force: payload.force === true,
            reason
          });
      if (mode !== 'clear' && result?.ok === false) {
        throw new Error(result.reason || 'map_context_injection_failed');
      }
      helpers.postTypedResult(event, 'PKM_MAP_CONTEXT_RESULT', {
        ok: true,
        requestId,
        floorKey,
        mode,
        result
      });
      return { ok: true, mode, result };
    } catch (error) {
      console.error(`${helpers.pluginName} map context request failed:`, error);
      const result = {
        ok: false,
        requestId,
        floorKey,
        mode,
        reason: error?.message || 'map_context_failed',
        message: error?.message || String(error)
      };
      helpers.postTypedResult(event, 'PKM_MAP_CONTEXT_ERROR', result);
      return result;
    }
  }

  function handleMessage(event, data, helpers) {
    if (data.type === 'PKM_MAP_FULLSCREEN') {
      helpers.setFullscreen(data.fullscreen === true);
      return true;
    }
    if (data.type === 'PKM_MAP_ENVIRONMENT_REQUEST') {
      handleMapEnvironmentRequest(event, data, helpers);
      return true;
    }
    if (data.type === 'PKM_MAP_CONTEXT_REQUEST') {
      handleMapContextRequest(event, data, helpers);
      return true;
    }
    return false;
  }

  ROOT.PKMCommonRuntime.startDashboardHost({
    product: 'main',
    version: '0.1.1-mvuz-main',
    pluginName: '[PKM Main Dashboard MVUZ]',
    dashboardPath: 'apps/dashboard-main/index.html',
    dashboardUrlGlobal: 'PKM_MAIN_DASHBOARD_URL',
    defaultGreetingSource: 'greeting-main',
    adaptDashboardState,
    handleMessage
  });
})();
