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

    function buildPlayerPrompt(state) {
      const filledSlots = state.party.slots.filter((pokemon) => pokemon?.name);

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
--------------------------------------------------
The player currently has no Pokémon in their party.
--------------------------------------------------
Use <PKM_BATTLE>{...}</PKM_BATTLE> to start a battle. The player party above is authoritative.
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
--------------------------------------------------
${lines}
--------------------------------------------------
${boxSection}
Use <PKM_BATTLE>{...}</PKM_BATTLE> to start a battle. The player party above is authoritative.
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
