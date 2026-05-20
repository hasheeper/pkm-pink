/**
 * PKM PINK Main - MVUZ pack entry.
 * Pack adapters and main hooks are kept here; shared implementations stay in pkm-common.
 */

/**
 * PKM Main plugin shared adapter.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  if (typeof ROOT.PKMCommonRuntime?.createPackContext !== 'function') {
    throw new Error('[PKM Main MVUZ] requires PKMCommonRuntime.createPackContext. Load pkm-common/context.mvuz.js before this script.');
  }

  RUNTIME.shared = {
    createContext() {
      return ROOT.PKMCommonRuntime.createPackContext({
        product: 'main',
        pluginName: '[PKM Main MVUZ]',
        version: '0.1.0-mvuz-main',
        schemaRuntimeName: 'PKMMainSchemaRuntime',
        injectId: 'pkm_main_player_data_mvuz',
        pokemonMode: 'avs'
      });
    }
  };
})();

/**
 * PKM Main state replay adapter.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  if (typeof ROOT.PKMCommonRuntime?.createStateReplay !== 'function') {
    throw new Error('[PKM Main MVUZ] requires PKMCommonRuntime.createStateReplay. Load pkm-common/state-replay.mvuz.js before this script.');
  }

  RUNTIME.createStateReplay = function createStateReplay(ctx) {
    return ROOT.PKMCommonRuntime.createStateReplay(ctx, {
      replayBlockFormat: 'compact'
    });
  };
})();

/**
 * PKM Main player prompt injection runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  RUNTIME.createPromptInjection = function createPromptInjection(ctx, stateService) {
    const {
      ROOT: hostRoot,
      PLUGIN_NAME,
      INJECT_ID
    } = ctx;
    const {
      isObject,
      normalizeMoves
    } = ctx.util;
    const { loadState } = stateService;

    function formatGender(gender) {
      if (gender === 'M') return 'M';
      if (gender === 'F') return 'F';
      return '-';
    }

    function formatMoves(moves) {
      return normalizeMoves(moves).map((move, index) => `move${index + 1}: ${move || '-'}`).join(' | ');
    }

    function formatIvsDisplay(ivs) {
      const src = isObject(ivs) ? ivs : {};
      return ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
        .map((key) => `${key.toUpperCase()}:${src[key] ?? '?'}`)
        .join('/');
    }

    function formatAvsDisplay(friendship) {
      const avs = isObject(friendship?.avs) ? friendship.avs : {};
      return ['trust', 'passion', 'insight', 'devotion']
        .map((key) => `${key}:${clampNumber(avs[key], 0, 255, 0)}`)
        .join('/');
    }

    function formatLocationDisplay(world) {
      const location = isObject(world?.location) ? world.location : {};
      const region = typeof location.region === 'string' && location.region.trim() ? location.region.trim() : '';
      const place = typeof location.location === 'string' && location.location.trim() ? location.location.trim() : '';
      if (!region && !place) return 'Unknown';
      return `${region || 'Unknown'} / ${place || 'Unknown'}`;
    }

    function formatTimeDisplay(world) {
      const time = isObject(world?.time) ? world.time : {};
      const day = clampNumber(time.day, 1, 99999, 1);
      const period = typeof time.period === 'string' && time.period.trim() ? time.period.trim() : 'morning';
      const derived = isObject(time.derived) ? time.derived : {};
      const month = clampNumber(derived.month, 1, 12, 1);
      const dayOfMonth = clampNumber(derived.dayOfMonth, 1, 30, 1);
      const week = clampNumber(derived.week, 1, 9999, 1);
      return `Day ${day} / ${period} (Month ${month}, Day ${dayOfMonth}, Week ${week})`;
    }

    function clampNumber(value, min, max, fallback = 0) {
      const n = Number(value);
      if (!Number.isFinite(n)) return fallback;
      return Math.max(min, Math.min(max, Math.round(n)));
    }

    function buildPlayerPrompt(state) {
      const filledSlots = state.party.slots.filter((pokemon) => pokemon?.name);
      const locationLine = `Location: ${formatLocationDisplay(state.world)}`;
      const timeLine = `Time: ${formatTimeDisplay(state.world)}`;
      const proficiency = state.player.trainerProficiency ?? state.player.proficiency ?? 0;
      const worldHint = 'If a clear coordinate move happens, update /pkm/world/location/x and /pkm/world/location/y with replace. For time passage, write /pkm/world/time/day_advance with values like "next_period", "nextday", "skip_to_night", or "3days_morning".';

      const unlocks = state.player.unlocks || {};
      const unlockLabels = [];
      if (unlocks.enable_mega) unlockLabels.push('Mega');
      if (unlocks.enable_z_move) unlockLabels.push('Z');
      if (unlocks.enable_dynamax) unlockLabels.push('Dmax');
      if (unlocks.enable_tera) unlockLabels.push('Tera');
      if (unlocks.enable_bond) unlockLabels.push('Bond');
      if (unlocks.enable_styles) unlockLabels.push('Style');
      if (unlocks.enable_insight) unlockLabels.push('Insight');
      if (unlocks.enable_proficiency_cap) unlockLabels.push('ProfCap');

      const boxCount = (state.box.boxes || []).reduce((sum, box) => sum + (box.slots?.length || 0), 0);

      if (!filledSlots.length) {
        return `<pkm_team_summary>
Player: ${state.player.name} | Proficiency: ${proficiency} | Unlocks: [${unlockLabels.join('/') || 'none'}] | Party: 0/6 | Box: ${boxCount}
${locationLine}
${timeLine}
--------------------------------------------------
The player currently has no Pokémon in their party.
--------------------------------------------------
Use <PKM_BATTLE>{...}</PKM_BATTLE> to start a battle. The player party above is authoritative.
${worldHint}
</pkm_team_summary>`;
      }

      const lines = state.party.slots.map((pokemon, index) => {
        const slot = index + 1;
        if (!pokemon?.name) return `slot${slot}. -`;
        const name = pokemon.nickname || pokemon.name;
        const lv = pokemon.lv ?? pokemon.level ?? '??';
        const lead = pokemon.isLead ? ' [LEAD]' : '';
        const nature = pokemon.nature || '???';
        const ability = pokemon.ability || '???';
        const ev = pokemon.stats_meta?.ev_level ?? 0;
        const ivs = formatIvsDisplay(pokemon.stats_meta?.ivs);
        const avs = formatAvsDisplay(pokemon.friendship);
        return `slot${slot}. ${formatGender(pokemon.gender)} ${name} (Lv.${lv})${lead}
   [Nature: ${nature}] [Ability: ${ability}]
   [Stats: ${ivs}] [EVs: ${ev}] [AVS: ${avs}]
   Moves: ${formatMoves(pokemon.moves)}`;
      }).join('\n\n');

      const boxNames = (state.box.boxes || [])
        .flatMap((box) => box.slots || [])
        .filter((pokemon) => pokemon?.name)
        .slice(0, 12)
        .map((pokemon) => `${pokemon.nickname || pokemon.name}/Lv.${pokemon.lv ?? pokemon.level ?? '??'}`);
      const boxSection = boxNames.length
        ? `\nBox: ${boxNames.join(' | ')}${boxCount > boxNames.length ? ` | +${boxCount - boxNames.length} more` : ''}\n`
        : '';
      return `<pkm_team_summary>
Player: ${state.player.name} | Proficiency: ${proficiency} | Unlocks: [${unlockLabels.join('/') || 'none'}] | Party: ${filledSlots.length}/6 | Box: ${boxCount}
${locationLine}
${timeLine}
--------------------------------------------------
${lines}
--------------------------------------------------
${boxSection}
Use <PKM_BATTLE>{...}</PKM_BATTLE> to start a battle. The player party above is authoritative.
${worldHint}
</pkm_team_summary>`;
    }

    async function handleGenerationBefore(detail) {
      console.log(`${PLUGIN_NAME} handleGenerationBefore fired`, { dryRun: detail?.dryRun });
      if (detail?.dryRun) {
        console.log(`${PLUGIN_NAME} dryRun=true, skip injection`);
        return;
      }
      let state;
      try {
        state = await loadState({ persist: false });
      } catch (e) {
        console.error(`${PLUGIN_NAME} loadState failed in handleGenerationBefore`, e);
        return;
      }
      console.log(`${PLUGIN_NAME} loadState ok, party names:`, state?.party?.slots?.map((p) => p?.name || null));
      const promptContent = buildPlayerPrompt(state);
      console.log(`${PLUGIN_NAME} buildPlayerPrompt returned length=${promptContent?.length}, type=${typeof promptContent}, injectFn=${typeof hostRoot.injectPrompts}`);
      if (!promptContent) {
        console.warn(`${PLUGIN_NAME} promptContent is empty, abort injection`);
        return;
      }
      if (typeof hostRoot.injectPrompts !== 'function') {
        console.warn(`${PLUGIN_NAME} ROOT.injectPrompts unavailable, abort injection`);
        return;
      }
      try {
        if (typeof hostRoot.uninjectPrompts === 'function') hostRoot.uninjectPrompts([INJECT_ID]);
      } catch (_) {}
      hostRoot.injectPrompts([{
        id: INJECT_ID,
        position: 'in_chat',
        depth: 2,
        role: 'system',
        should_scan: false,
        content: promptContent
      }]);
      console.log(`${PLUGIN_NAME} player prompt injected, length=${promptContent.length}`);
    }

    return {
      buildPlayerPrompt,
      handleGenerationBefore
    };
  };
})();

/**
 * PKM Main battle frontend adapter.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  if (typeof ROOT.PKMCommonRuntime?.createBattleFrontend !== 'function') {
    throw new Error('[PKM Main MVUZ] requires PKMCommonRuntime.createBattleFrontend. Load pkm-common/battle-frontend.mvuz.js before this script.');
  }

  function weatherCellType(value, isObject) {
    if (typeof value === 'string') return value.trim();
    return isObject(value) && typeof value.weather === 'string' ? value.weather.trim() : '';
  }

  function toInternalCoords(displayX, displayY) {
    let x = Number(displayX) || 0;
    if (x > 0) x -= 1;
    let y = Number(displayY) || 0;
    if (y > 0) y -= 1;
    return {
      gx: x + 26,
      gy: 26 - y - 1
    };
  }

  function isActiveWeather(value) {
    const text = String(value || '').trim().toLowerCase();
    return Boolean(text && text !== 'none' && text !== 'clear');
  }

  RUNTIME.createBattleFrontend = function createBattleFrontend(ctx, stateService) {
    const { isObject, clampNumber } = ctx.util;

    function lookupTrainer(name, tier) {
      const api = ROOT.PKMMainPluginRuntime?.data?.trainer || null;
      return typeof api?.lookupTrainer === 'function' ? api.lookupTrainer(name, tier) : null;
    }

    function resolveStateWeather(state) {
      const location = isObject(state?.world?.location) ? state.world.location : {};
      const weatherGrid = isObject(state?.world?.weatherGrid)
        ? state.world.weatherGrid
        : (isObject(state?.world?.weather_grid) ? state.world.weather_grid : {});
      const x = Number(location.x);
      const y = Number(location.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return '';
      const internal = toInternalCoords(x, y);
      return weatherCellType(weatherGrid[`${internal.gx}_${internal.gy}`], isObject);
    }

    function resolveBattleEnvironment(state, battleData, settings) {
      if (settings?.enableBattleEnvironment === false || settings?.enableEnvironment === false) return null;
      const aiEnv = isObject(battleData.environment) ? battleData.environment : {};
      const finalWeather = weatherCellType(aiEnv.weather, isObject) || resolveStateWeather(state) || null;
      const finalSuppression = aiEnv.suppression || null;
      const activeWeather = isActiveWeather(finalWeather) ? finalWeather : null;
      if (!activeWeather && !aiEnv.overlay && !finalSuppression) return null;
      return {
        weather: activeWeather,
        weatherTurns: aiEnv.weatherTurns || 0,
        ...(aiEnv.overlay ? { overlay: aiEnv.overlay } : {}),
        ...(finalSuppression ? { suppression: finalSuppression } : {})
      };
    }

    return ROOT.PKMCommonRuntime.createBattleFrontend(ctx, stateService, {
      lookupTrainer,
      resolveBattleEnvironment,
      processSinglePlayerEntrant: true,
      getStateTrainerProficiency(state) {
        return clampNumber(state?.player?.trainerProficiency ?? state?.player?.proficiency, 0, 255, 0);
      }
    });
  };
})();

/**
 * PKM Main action API adapter.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  if (typeof ROOT.PKMCommonRuntime?.createActionsApi !== 'function') {
    throw new Error('[PKM Main MVUZ] requires PKMCommonRuntime.createActionsApi. Load pkm-common/actions-api.mvuz.js before this script.');
  }

  RUNTIME.createActionsApi = function createActionsApi(ctx, stateService) {
    const {
      clone,
      isObject,
      normalizeString
    } = ctx.util;

    function getLocationPayload(payload) {
      if (isObject(payload?.world?.location)) return payload.world.location;
      if (isObject(payload?.location)) return payload.location;
      return isObject(payload) ? payload : null;
    }

    function normalizeLocationPayload(payload, current = {}) {
      const src = getLocationPayload(payload);
      if (!src) return null;
      const next = { ...(isObject(current) ? current : {}), ...src };
      if ('x' in src) {
        const x = Number(src.x);
        if (Number.isFinite(x)) next.x = x;
      }
      if ('y' in src) {
        const y = Number(src.y);
        if (Number.isFinite(y)) next.y = y;
      }
      if ('region' in src) next.region = normalizeString(src.region, current?.region || '');
      if ('location' in src) next.location = normalizeString(src.location, current?.location || '');
      return next;
    }

    function normalizePhenomenonPayload(payload, current = {}) {
      const src = isObject(payload?.phenomenon) ? payload.phenomenon : (isObject(payload) ? payload : {});
      const currentState = isObject(current) ? current : {};
      return {
        active_type: normalizeString(src.active_type, currentState.active_type || 'clear'),
        active_region: normalizeString(src.active_region, currentState.active_region || 'none')
      };
    }

    function getMapObjectPayload(payload, camelKey, snakeKey) {
      if (isObject(payload?.[camelKey])) return payload[camelKey];
      if (isObject(payload?.[snakeKey])) return payload[snakeKey];
      return null;
    }

    function normalizeWeatherGridPayload(value) {
      if (!isObject(value)) return null;
      const output = {};
      Object.entries(value).forEach(([key, cell]) => {
        if (!key) return;
        if (typeof cell === 'string' && cell.trim()) {
          output[key] = cell.trim();
          return;
        }
        if (isObject(cell) && typeof cell.weather === 'string' && cell.weather.trim()) {
          output[key] = cell.weather.trim();
        }
      });
      return output;
    }

    function getRefreshLocationPayload(payload) {
      if (isObject(payload?.world?.location) || isObject(payload?.location)) return getLocationPayload(payload);
      return null;
    }

    function mergeOrReplaceObject(current, incoming, replace = false) {
      const nextIncoming = isObject(incoming) ? clone(incoming, {}) : null;
      if (!nextIncoming) return isObject(current) ? current : {};
      return replace ? nextIncoming : { ...(isObject(current) ? current : {}), ...nextIncoming };
    }

    return ROOT.PKMCommonRuntime.createActionsApi(ctx, stateService, {
      extensions(_ctx, _stateService, helpers) {
        const { patchState, actionWriteOptions, actionObjectKeySuffix } = helpers;
        return {
          'world.updateLocation': (payload, options) => patchState((state) => {
            state.world = isObject(state.world) ? state.world : {};
            const location = normalizeLocationPayload(payload, state.world.location || {});
            if (!location) throw new Error('world.updateLocation requires a location payload');
            state.world.location = location;
            return state;
          }, actionWriteOptions('world.updateLocation', options, ['/pkm/world/location'], `location.${actionObjectKeySuffix(getLocationPayload(payload), 'state')}`)),
          'world.setPhenomenon': (payload, options) => patchState((state) => {
            state.world = isObject(state.world) ? state.world : {};
            state.world.phenomenon = normalizePhenomenonPayload(payload, state.world.phenomenon || {});
            return state;
          }, actionWriteOptions('world.setPhenomenon', options, ['/pkm/world/phenomenon'], `phenomenon.${actionObjectKeySuffix(payload?.phenomenon || payload, 'state')}`)),
          'world.refreshMapEnvironment': (payload, options) => patchState((state) => {
            state.world = isObject(state.world) ? state.world : {};
            const replaceGrids = payload?.replaceGrids === true || payload?.mode === 'replace';
            const locationPayload = getRefreshLocationPayload(payload);
            const location = locationPayload ? normalizeLocationPayload({ location: locationPayload }, state.world.location || {}) : null;
            if (location) state.world.location = location;
            if (isObject(payload?.phenomenon)) {
              state.world.phenomenon = normalizePhenomenonPayload(payload.phenomenon, state.world.phenomenon || {});
            }
            const weatherGrid = getMapObjectPayload(payload, 'weatherGrid', 'weather_grid');
            if (weatherGrid) {
              state.world.weatherGrid = mergeOrReplaceObject(state.world.weatherGrid, normalizeWeatherGridPayload(weatherGrid), replaceGrids);
            }
            const pokemonSpawns = getMapObjectPayload(payload, 'pokemonSpawns', 'pokemon_spawns');
            if (pokemonSpawns) {
              state.world.pokemonSpawns = mergeOrReplaceObject(state.world.pokemonSpawns, pokemonSpawns, replaceGrids);
            }
            return state;
          }, actionWriteOptions('world.refreshMapEnvironment', options, [
            ...(getRefreshLocationPayload(payload) ? ['/pkm/world/location'] : []),
            ...(isObject(payload?.phenomenon) ? ['/pkm/world/phenomenon'] : []),
            ...(getMapObjectPayload(payload, 'weatherGrid', 'weather_grid') ? ['/pkm/world/weatherGrid'] : []),
            ...(getMapObjectPayload(payload, 'pokemonSpawns', 'pokemon_spawns') ? ['/pkm/world/pokemonSpawns'] : [])
          ], actionObjectKeySuffix({
            location: getRefreshLocationPayload(payload),
            phenomenon: payload?.phenomenon,
            weatherGrid: getMapObjectPayload(payload, 'weatherGrid', 'weather_grid') ? true : undefined,
            pokemonSpawns: getMapObjectPayload(payload, 'pokemonSpawns', 'pokemon_spawns') ? true : undefined
          }, 'environment')))
        };
      }
    });
  };
})();

/**
 * PKM Main fixed NPC relationship runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  RUNTIME.createNpcRuntime = function createNpcRuntime(ctx, stateService) {
    const {
      ROOT: hostRoot,
      PLUGIN_NAME
    } = ctx;
    const {
      isObject
    } = ctx.util;
    const { loadState } = stateService;

    const NPC_STATUS_INJECT_ID = 'pkm_npc_status';
    const NPC_UNLOCK_INJECT_ID = 'pkm_unlock_events';

    function getNpcDataApi() {
      return ROOT.PKMMainPluginRuntime?.data?.npc || ROOT.PKM_MAIN_NPC_DATA || null;
    }

    function stripVariableBlocks(text) {
      return String(text || '')
        .replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/gi, '');
    }

    function recentChatText(limit = 12) {
      if (typeof hostRoot.getChatMessages !== 'function') return '';
      try {
        const messages = hostRoot.getChatMessages(-limit);
        return (Array.isArray(messages) ? messages : [])
          .map((message) => stripVariableBlocks(message?.message || ''))
          .join('\n');
      } catch (_) {
        return '';
      }
    }

    function resolveZoneCode(state) {
      const region = String(state?.world?.location?.region || '').trim();
      if (/^[NBSAZ]$/i.test(region)) return region.toUpperCase();
      const zone = String(state?.world?.location?.zone || '').trim();
      if (/^[NBSAZ]$/i.test(zone)) return zone.toUpperCase();
      return 'Z';
    }

    function buildNpcStatusPrompt(state) {
      const api = getNpcDataApi();
      if (!api) return '';
      const zoneCode = resolveZoneCode(state);
      const sections = [];
      if (typeof api.generateZoneStatusCard === 'function') {
        sections.push(api.generateZoneStatusCard(zoneCode));
      }

      const records = isObject(state?.npcs?.records) ? state.npcs.records : {};
      const playerBonds = isObject(state?.player?.bonds) ? state.player.bonds : {};
      const activeKeys = typeof api.scanForNpcTriggers === 'function'
        ? api.scanForNpcTriggers(recentChatText())
        : [];
      const activeCards = activeKeys
        .filter((npcId) => isObject(records[npcId]))
        .map((npcId, index) => {
          const card = api.formatNpcStatusCard?.(npcId, records[npcId], playerBonds);
          return card ? `${index + 1}. ${card}` : '';
        })
        .filter(Boolean);
      if (activeCards.length) {
        sections.push(`【当前活跃/关注的主要 NPC 状态】\n${activeCards.join('\n\n')}`);
      }
      if (!sections.length) return '';
      return `<npc_status_brief>\n${sections.join('\n\n')}\n</npc_status_brief>`;
    }

    function injectPrompt(id, content, options = {}) {
      if (!content || typeof hostRoot.injectPrompts !== 'function') return false;
      try {
        if (typeof hostRoot.uninjectPrompts === 'function') hostRoot.uninjectPrompts([id]);
      } catch (_) {}
      hostRoot.injectPrompts([{
        id,
        position: options.position || 'after_wi_scan',
        depth: options.depth ?? 0,
        role: options.role || 'system',
        should_scan: false,
        content
      }]);
      return true;
    }

    function clearPrompt(id) {
      if (typeof hostRoot.uninjectPrompts !== 'function') return false;
      try {
        hostRoot.uninjectPrompts([id]);
        return true;
      } catch (_) {
        return false;
      }
    }

    async function injectNpcStatus(stateOverride = null) {
      const state = stateOverride || await loadState({ persist: false });
      const content = buildNpcStatusPrompt(state);
      if (!content) return false;
      return injectPrompt(NPC_STATUS_INJECT_ID, content, { position: 'after_wi_scan', depth: 0 });
    }

    async function injectUnlockEvent(stateOverride = null) {
      const api = getNpcDataApi();
      if (!api?.getPendingUnlockEvents || !api?.generateUnlockEventPrompt) return false;
      const state = stateOverride || await loadState({ persist: false });
      const event = api.getPendingUnlockEvents(state)[0] || null;
      if (!event) {
        clearPrompt(NPC_UNLOCK_INJECT_ID);
        return false;
      }
      const content = api.generateUnlockEventPrompt(event);
      if (!content) return false;
      return injectPrompt(NPC_UNLOCK_INJECT_ID, content, { position: 'in_chat', depth: 0 });
    }

    async function handleGenerationBefore(detail) {
      if (detail?.dryRun) return;
      let state = null;
      try {
        state = await loadState({ persist: false });
      } catch (error) {
        console.warn(`${PLUGIN_NAME} NPC runtime loadState failed`, error);
        return;
      }
      await injectNpcStatus(state);
      await injectUnlockEvent(state);
    }

    function clearInjections() {
      clearPrompt(NPC_STATUS_INJECT_ID);
      clearPrompt(NPC_UNLOCK_INJECT_ID);
    }

    return {
      buildNpcStatusPrompt,
      injectNpcStatus,
      injectUnlockEvent,
      handleGenerationBefore,
      clearInjections
    };
  };
})();

/**
 * PKM PINK Main - MVUZ bootstrap adapter.
 */
(async function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || null;

  if (typeof ROOT.PKMCommonRuntime?.startPackBootstrap !== 'function') {
    throw new Error('[PKM Main MVUZ] requires PKMCommonRuntime.startPackBootstrap. Load pkm-common/bootstrap.mvuz.js before this script.');
  }

  await ROOT.PKMCommonRuntime.startPackBootstrap(RUNTIME, {
    bootstrapName: '[PKM Main MVUZ]',
    requiredFactories: ['createNpcRuntime', 'createMapRuntime'],
    initialLoadOptions: { persist: false },
    createServices({ ctx, state, actions }) {
      return {
        npcRuntime: RUNTIME.createNpcRuntime(ctx, state, actions),
        mapRuntime: RUNTIME.createMapRuntime(ctx, state, actions)
      };
    },
    pluginExtensions({ services }) {
      const { mapRuntime, npcRuntime } = services;
      return {
        map: {
          refreshEnvironment: mapRuntime.refreshEnvironment,
          injectLocationContext: mapRuntime.injectLocationContext,
          clearLocationContext: mapRuntime.clearLocationContext,
          waitForData: mapRuntime.waitForData
        },
        npc: {
          injectStatus: npcRuntime.injectNpcStatus,
          injectUnlockEvent: npcRuntime.injectUnlockEvent,
          clearInjections: npcRuntime.clearInjections
        }
      };
    },
    resetRuntimeState(_reason, { services }) {
      services.npcRuntime.clearInjections();
    },
    afterInitialLoad({ ctx, services }) {
      try {
        services.mapRuntime.bindEvents();
      } catch (error) {
        console.warn(`${ctx.PLUGIN_NAME} map runtime binding skipped:`, error);
      }
    },
    async onGenerationAfterCommands(detail, { services }) {
      await services.npcRuntime.handleGenerationBefore(detail);
    }
  });
})();
