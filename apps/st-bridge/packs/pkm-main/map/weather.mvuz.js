/**
 * PKM Main map weather runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  RUNTIME.createMapWeather = function createMapWeather(ctx, mapShared) {
    const { PLUGIN_NAME } = ctx;
    const { isObject } = ctx.util;
    const YEAR_DAYS = 108;
    const SEASON_DAYS = 27;
    const SEGMENT_DAYS = 9;
    const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
    const SEGMENTS = ['Early', 'Mid', 'Late'];
    const CLIMATE_INT_MAP = {
      1: 'Tropical_Monsoon',
      2: 'Industrial_Gloom',
      3: 'Scorched_Badlands',
      4: 'Polar_Tundra',
      5: 'Spectral_Haze',
      6: 'Continental_Lush',
      7: 'Controlled_Vault',
      8: 'Continental_Savanna',
      9: 'Continental_Highland',
      10: 'Iron_Sand_Desert',
      11: 'Volcanic_Fallout',
      12: 'Radiant_Cityscape',
      13: 'Maritime_Trade_Winds',
      14: 'Azure_Coral_Atolls',
      15: 'Southern_Tradewind',
      16: 'Chrome_Magnetic_Waters',
      17: 'Northern_Floe',
      18: 'Phosphorescent_Shoals',
      19: 'Basalt_Geyser_Shelf',
      20: 'Abyssal_North',
      21: 'Abyssal_South',
      22: 'Abyssal_Middle'
    };

    const weatherState = {
      climateData: null,
      climatePromise: null,
      climateGridData: null,
      climateGridWidth: 52
    };

    async function loadClimateData() {
      if (weatherState.climateData) return weatherState.climateData;
      if (weatherState.climatePromise) return weatherState.climatePromise;
      weatherState.climatePromise = (async () => {
        try {
          const response = await fetch(mapShared.dataUrl('climatedata.json'), { cache: 'no-cache' });
          if (!response.ok) throw new Error(`climatedata.json ${response.status}`);
          weatherState.climateData = await response.json();
        } catch (error) {
          console.error(`${PLUGIN_NAME} weather climate data load failed:`, error);
          weatherState.climateData = null;
        } finally {
          weatherState.climatePromise = null;
        }
        return weatherState.climateData;
      })();
      return weatherState.climatePromise;
    }

    function getSeasonSegment(day) {
      const dayIndex = (((Math.max(1, Math.round(Number(day) || 1)) - 1) % YEAR_DAYS) + YEAR_DAYS) % YEAR_DAYS;
      const seasonIndex = Math.floor(dayIndex / SEASON_DAYS);
      const dayInSeason = dayIndex % SEASON_DAYS;
      const segmentIndex = Math.floor(dayInSeason / SEGMENT_DAYS);
      return {
        season: SEASONS[seasonIndex],
        segment: SEGMENTS[segmentIndex],
        dayIndex,
        seasonIndex,
        segmentIndex
      };
    }

    function calculateWeather(climateZoneId, day) {
      const climateData = weatherState.climateData;
      const baseWeights = climateData?.[climateZoneId] || null;
      if (!baseWeights) return null;
      const { season, segment } = getSeasonSegment(day);
      const modifiers = climateData?.[season]?.[segment]?.modifier || null;
      if (!modifiers) return null;
      const finalWeights = {};
      let totalWeight = 0;
      Object.entries(baseWeights).forEach(([weatherType, baseWeight]) => {
        const finalWeight = Number(baseWeight || 0) * Number(modifiers[weatherType] ?? 1);
        if (finalWeight > 0) {
          finalWeights[weatherType] = finalWeight;
          totalWeight += finalWeight;
        }
      });
      if (totalWeight <= 0) return { weather: 'clear', weights: finalWeights, season, segment, climateZone: climateZoneId };
      const roll = Math.random() * totalWeight;
      let cumulative = 0;
      let selectedWeather = 'clear';
      for (const [weatherType, weight] of Object.entries(finalWeights)) {
        cumulative += weight;
        if (roll < cumulative) {
          selectedWeather = weatherType;
          break;
        }
      }
      return { weather: selectedWeather, weights: finalWeights, season, segment, climateZone: climateZoneId };
    }

    function generateGridWeather(climateZoneId, day) {
      const weatherResult = calculateWeather(climateZoneId, day);
      if (!weatherResult) return null;
      return weatherResult.weather;
    }

    function loadClimateGrid() {
      if (weatherState.climateGridData) return;
      const layer = mapShared.getLayer('Climate', 'IntGrid');
      if (!layer?.intGridCsv) return;
      weatherState.climateGridData = layer.intGridCsv;
      weatherState.climateGridWidth = layer.__cWid || 52;
    }

    function getClimateZoneAtGrid(gx, gy) {
      loadClimateGrid();
      if (!weatherState.climateGridData) return 'Continental_Lush';
      const index = gy * weatherState.climateGridWidth + gx;
      const climateInt = weatherState.climateGridData[index];
      return CLIMATE_INT_MAP[climateInt] || 'Continental_Lush';
    }

    function getWorldWeatherGrid(pkmState) {
      const world = isObject(pkmState?.world) ? pkmState.world : {};
      return isObject(world.weatherGrid) ? world.weatherGrid : (isObject(world.weather_grid) ? world.weather_grid : {});
    }

    async function generateForNearbyGrids(x, y, pkmState, forceRefresh = false) {
      await mapShared.loadData();
      await loadClimateData();
      if (!weatherState.climateData) return null;
      const currentDay = pkmState?.world?.time?.day || 1;
      const internal = mapShared.toInternalCoords(x, y);
      const existingWeather = forceRefresh ? {} : getWorldWeatherGrid(pkmState);
      const newWeather = {};
      mapShared.GRID_OFFSETS.forEach(({ dx, dy }) => {
        const gx = internal.gx + dx;
        const gy = internal.gy + dy;
        const key = `${gx}_${gy}`;
        if (existingWeather[key]) return;
        const weatherConfig = generateGridWeather(getClimateZoneAtGrid(gx, gy), currentDay);
        if (weatherConfig) newWeather[key] = weatherConfig;
      });
      return Object.keys(newWeather).length ? newWeather : null;
    }

    function getCurrentGridWeather(x, y, pkmState) {
      const internal = mapShared.toInternalCoords(x, y);
      return getWorldWeatherGrid(pkmState)[`${internal.gx}_${internal.gy}`] || null;
    }

    return {
      loadClimateData,
      getSeasonSegment,
      generateGridWeather,
      generateForNearbyGrids,
      getCurrentGridWeather,
      getWorldWeatherGrid,
      getClimateZoneAtGrid
    };
  };
})();
