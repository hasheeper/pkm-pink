/**
 * PKM PINK Universal - MVUZ pack entry.
 * Pack adapters are kept here; shared implementations stay in pkm-common.
 */

/**
 * PKM Universal plugin shared adapter.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMUniversalPluginRuntime || {};
  ROOT.PKMUniversalPluginRuntime = RUNTIME;

  if (typeof ROOT.PKMCommonRuntime?.createPackContext !== 'function') {
    throw new Error('[PKM Universal MVUZ] requires PKMCommonRuntime.createPackContext. Load pkm-common/context.mvuz.js before this script.');
  }

  RUNTIME.shared = {
    createContext() {
      return ROOT.PKMCommonRuntime.createPackContext({
        product: 'universal',
        pluginName: '[PKM Universal MVUZ]',
        version: '0.1.0-mvuz-universal',
        schemaRuntimeName: 'PKMUniversalSchemaRuntime',
        injectId: 'pkm_universal_player_data_mvuz',
        pokemonMode: 'bonds'
      });
    }
  };
})();

/**
 * PKM Universal state replay adapter.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMUniversalPluginRuntime || {};
  ROOT.PKMUniversalPluginRuntime = RUNTIME;

  if (typeof ROOT.PKMCommonRuntime?.createStateReplay !== 'function') {
    throw new Error('[PKM Universal MVUZ] requires PKMCommonRuntime.createStateReplay. Load pkm-common/state-replay.mvuz.js before this script.');
  }

  RUNTIME.createStateReplay = function createStateReplay(ctx) {
    return ROOT.PKMCommonRuntime.createStateReplay(ctx);
  };
})();

/**
 * PKM Universal player prompt injection runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMUniversalPluginRuntime || {};
  ROOT.PKMUniversalPluginRuntime = RUNTIME;

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

    function formatLocationDisplay(world) {
      const location = isObject(world?.location) ? world.location : {};
      const region = typeof location.region === 'string' && location.region.trim() ? location.region.trim() : '';
      const place = typeof location.location === 'string' && location.location.trim() ? location.location.trim() : '';
      if (!region && !place) return 'Unknown';
      return `${region || 'Unknown'} / ${place || 'Unknown'}`;
    }

    function clampNumber(value, min, max, fallback = 0) {
      const n = Number(value);
      if (!Number.isFinite(n)) return fallback;
      return Math.max(min, Math.min(max, Math.round(n)));
    }

    function deriveNpcStage(love) {
      const value = clampNumber(love, 0, 255, 0);
      if (value <= 31) return -2;
      if (value <= 63) return -1;
      if (value <= 127) return 0;
      if (value <= 159) return 1;
      if (value <= 191) return 2;
      if (value <= 223) return 3;
      return 4;
    }

    function formatNpcRelations(state) {
      const records = isObject(state?.npcs?.records) ? state.npcs.records : {};
      const entries = Object.entries(records)
        .filter(([key, record]) => key && isObject(record))
        .map(([key, record]) => {
          const love = clampNumber(record.love, 0, 255, 0);
          return {
            key: String(key).trim(),
            love,
            stage: deriveNpcStage(love)
          };
        })
        .filter((entry) => entry.key)
        .sort((a, b) => (b.stage - a.stage) || (b.love - a.love) || a.key.localeCompare(b.key))
        .slice(0, 12);

      if (!entries.length) return 'NPC Relations: none';

      const lines = entries.map((entry) => {
        return `- ${entry.key}: love ${entry.love}/255`;
      });
      return `NPC Relations:\n${lines.join('\n')}`;
    }

    function buildNpcRelationsPrompt(state) {
      return `<pkm_npc_relations>
${formatNpcRelations(state)}
</pkm_npc_relations>`;
    }

    function buildPlayerPrompt(state) {
      const filledSlots = state.party.slots.filter((pokemon) => pokemon?.name);
      const locationLine = `Location: ${formatLocationDisplay(state.world)}`;
      const locationHint = 'If the current region or place changes, update /pkm/world/location/region and /pkm/world/location/location with replace.';
      const npcRelationsBlock = buildNpcRelationsPrompt(state);

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
Player: ${state.player.name} | Proficiency: ${state.player.proficiency} | Unlocks: [${unlockLabels.join('/') || 'none'}] | Party: 0/6 | Box: ${boxCount}
${locationLine}
--------------------------------------------------
The player currently has no Pokémon in their party.
--------------------------------------------------
Use <PKM_BATTLE>{...}</PKM_BATTLE> to start a battle. The player party above is authoritative.
${locationHint}
</pkm_team_summary>
${npcRelationsBlock}`;
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
        const bonds = pokemon.bonds ?? 0;
        return `slot${slot}. ${formatGender(pokemon.gender)} ${name} (Lv.${lv})${lead}
   [Nature: ${nature}] [Ability: ${ability}]
   [Stats: ${ivs}] [EVs: ${ev}] [Bonds: ${bonds}]
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
Player: ${state.player.name} | Proficiency: ${state.player.proficiency} | Unlocks: [${unlockLabels.join('/') || 'none'}] | Party: ${filledSlots.length}/6 | Box: ${boxCount}
${locationLine}
--------------------------------------------------
${lines}
--------------------------------------------------
${boxSection}
Use <PKM_BATTLE>{...}</PKM_BATTLE> to start a battle. The player party above is authoritative.
${locationHint}
</pkm_team_summary>
${npcRelationsBlock}`;
    }

    async function handleGenerationBefore(detail) {
      console.log(`${PLUGIN_NAME} handleGenerationBefore fired`, { dryRun: detail?.dryRun });
      if (detail?.dryRun) {
        console.log(`${PLUGIN_NAME} dryRun=true, skip injection`);
        return;
      }
      let state;
      try {
        state = await loadState();
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
 * PKM Universal battle frontend adapter.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMUniversalPluginRuntime || {};
  ROOT.PKMUniversalPluginRuntime = RUNTIME;

  if (typeof ROOT.PKMCommonRuntime?.createBattleFrontend !== 'function') {
    throw new Error('[PKM Universal MVUZ] requires PKMCommonRuntime.createBattleFrontend. Load pkm-common/battle-frontend.mvuz.js before this script.');
  }

  RUNTIME.createBattleFrontend = function createBattleFrontend(ctx, stateService) {
    return ROOT.PKMCommonRuntime.createBattleFrontend(ctx, stateService, {
      includeBondsAsAvs: true,
      getStateTrainerProficiency(state) {
        return state?.player?.proficiency ?? 0;
      }
    });
  };
})();

/**
 * PKM Universal action API adapter.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMUniversalPluginRuntime || {};
  ROOT.PKMUniversalPluginRuntime = RUNTIME;

  if (typeof ROOT.PKMCommonRuntime?.createActionsApi !== 'function') {
    throw new Error('[PKM Universal MVUZ] requires PKMCommonRuntime.createActionsApi. Load pkm-common/actions-api.mvuz.js before this script.');
  }

  RUNTIME.createActionsApi = function createActionsApi(ctx, stateService) {
    return ROOT.PKMCommonRuntime.createActionsApi(ctx, stateService);
  };
})();

/**
 * PKM PINK Universal - MVUZ bootstrap adapter.
 */
(async function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMUniversalPluginRuntime || null;

  if (typeof ROOT.PKMCommonRuntime?.startPackBootstrap !== 'function') {
    throw new Error('[PKM Universal MVUZ] requires PKMCommonRuntime.startPackBootstrap. Load pkm-common/bootstrap.mvuz.js before this script.');
  }

  await ROOT.PKMCommonRuntime.startPackBootstrap(RUNTIME, {
    bootstrapName: '[PKM Universal MVUZ]'
  });
})();
