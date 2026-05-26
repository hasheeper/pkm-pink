/**
 * PKM Main map phenomenon runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  RUNTIME.createMapPhenomenon = function createMapPhenomenon(ctx) {
    const { isObject } = ctx.util;
    const CLEAR = { active_type: 'clear', active_region: 'none' };
    const RANDOM_REGIONS = ['A', 'B', 'N', 'S', 'Z'];
    const SCHEDULE = {
      0: { type: 'clear', region: 'none' },
      1: { type: 'ancient', region: 'west' },
      2: { type: 'future', region: 'east' },
      3: { type: 'ultra', region: 'random' },
      4: { type: 'ancient', region: 'west' },
      5: { type: 'future', region: 'east' },
      6: { type: 'ultra', region: 'random' }
    };

    function normalize(value) {
      if (!isObject(value)) return { ...CLEAR };
      return {
        active_type: typeof value.active_type === 'string' && value.active_type ? value.active_type : 'clear',
        active_region: typeof value.active_region === 'string' && value.active_region ? value.active_region : 'none'
      };
    }

    function computeForDay(day, current = null, options = {}) {
      const normalizedDay = Math.max(1, Math.round(Number(day) || 1));
      if (normalizedDay <= 7) return { ...CLEAR };
      const dayOfWeek = ((normalizedDay - 1) % 7) + 1;
      const normalizedDayOfWeek = dayOfWeek === 7 ? 0 : dayOfWeek;
      const today = SCHEDULE[normalizedDayOfWeek] || SCHEDULE[0];
      let activeRegion = today.region;
      const currentState = normalize(current);
      if (activeRegion === 'random') {
        const canReuseCurrent = !options.force &&
          currentState.active_type === today.type &&
          RANDOM_REGIONS.includes(currentState.active_region);
        activeRegion = canReuseCurrent
          ? currentState.active_region
          : RANDOM_REGIONS[Math.floor(Math.random() * RANDOM_REGIONS.length)];
      }
      return {
        active_type: today.type,
        active_region: activeRegion
      };
    }

    function equals(left, right) {
      const a = normalize(left);
      const b = normalize(right);
      return a.active_type === b.active_type && a.active_region === b.active_region;
    }

    return {
      CLEAR,
      normalize,
      computeForDay,
      equals
    };
  };
})();
