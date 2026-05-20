/**
 * PKM Main map location context runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  RUNTIME.createMapLocationContext = function createMapLocationContext(ctx, mapShared, services = {}) {
    const { ROOT: hostRoot, PLUGIN_NAME } = ctx;
    const { isObject } = ctx.util;
    const CHAT_SCAN_CACHE_TTL_MS = 30000;
    const WATER_BIOMES = [
      'Zero_Halo_Moat',
      'Mirror_Lotis_Lake',
      'Emerald_Vein_River',
      'Crystal_Lagoon',
      'Twin_Destiny_Basin',
      'Chrome_Canal',
      'Ferro_Straits',
      'Mercury_Stream',
      'Frigid_Floe',
      'Mist_Veil_Sound',
      'Prism_Bay',
      'Cerulean_Reef',
      'Basalt_Shoals',
      'Equatorial_Dark_Zone',
      'Titan_Trough',
      'Chrome_Abyss',
      'Boreal_Trench'
    ];

    const cache = {
      npcScanKey: '',
      npcTriggerSection: '',
      npcScanAt: 0
    };

    function addNamedDescription(lines, label, id, source) {
      if (!id) return;
      const desc = source?.[id];
      lines.push(`【${label}】${desc?.name || String(id).replace(/_/g, ' ')}`);
      if (desc?.desc) lines.push(`  ${desc.desc}`);
    }

    function formatFacilityName(id) {
      return String(id || '').replace(/_/g, ' ');
    }

    function buildBaseContextText(location) {
      const x = Number(location?.x) || 0;
      const y = Number(location?.y) || 0;
      const regionId = mapShared.getRegionIdByCoords(x, y);
      const regionInfo = mapShared.REGIONS[regionId];
      const internal = mapShared.toInternalCoords(x, y);
      const entities = mapShared.getEntitiesAtGrid(internal.gx, internal.gy);
      const gridInfo = mapShared.getGridInfo(internal.gx, internal.gy);
      const lines = [];

      lines.push('【当前位置】');
      lines.push(`坐标: [${x}, ${y}] ZONE-${regionInfo?.short || '?'}`);
      lines.push(`地表: ${gridInfo.surface || '未知'}`);
      lines.push(`可通行: ${gridInfo.traversable ? '是' : '否'}`);
      lines.push(`威胁度: ${gridInfo.threat} (${mapShared.getThreatLabel(gridInfo.threat)})`);
      lines.push(`所属大区: ${regionInfo?.name || regionId}`);

      const regionDesc = mapShared.state.regionDescriptions[regionId];
      if (regionDesc?.prompt_snippet) lines.push(`【大区氛围】${regionDesc.prompt_snippet}`);
      if (regionDesc?.geography_desc) lines.push(`【地理概述】${regionDesc.geography_desc}`);

      const isWaterBiome = entities.biomeZone && WATER_BIOMES.includes(entities.biomeZone);
      if (isWaterBiome) {
        lines.push(`所属水域: ${entities.biomeZone}`);
        const desc = mapShared.state.biomeFlavor[entities.biomeZone];
        if (desc?.visual_texture) lines.push(`【视觉纹理】${desc.visual_texture}`);
        if (desc?.sensory_feed) lines.push(`【感官体验】${desc.sensory_feed}`);
      } else if (entities.regionZone) {
        lines.push(`所属设施区: ${entities.regionZone}`);
        const desc = mapShared.state.regionZones[entities.regionZone];
        if (desc?.exterior_view) lines.push(`【外观描述】${desc.exterior_view}`);
        if (desc?.internal_reality) lines.push(`【内部环境】${desc.internal_reality}`);
      } else if (entities.biomeZone) {
        lines.push(`所属生态区: ${entities.biomeZone}`);
        const desc = mapShared.state.biomeFlavor[entities.biomeZone];
        if (desc?.visual_texture) lines.push(`【视觉纹理】${desc.visual_texture}`);
        if (desc?.sensory_feed) lines.push(`【感官体验】${desc.sensory_feed}`);
      } else {
        const nearestRegion = mapShared.findNearestRegionZone(x, y);
        const nearestBiome = mapShared.findNearestBiomeZone(x, y);
        if (nearestRegion && (!nearestBiome || nearestRegion.distance <= nearestBiome.distance)) {
          lines.push(`附近设施区: ${nearestRegion.name} (~${nearestRegion.distance}格)`);
        } else if (nearestBiome) {
          lines.push(`附近生态区: ${nearestBiome.name} (~${nearestBiome.distance}格)`);
        }
      }

      addNamedDescription(lines, '宝可梦中心', entities.pokemonCenter, mapShared.state.service);
      addNamedDescription(lines, '服务设施', entities.service, mapShared.state.service);
      addNamedDescription(lines, '场所类型', entities.placeAnchor, mapShared.state.placeAnchor);
      if (entities.warp) addNamedDescription(lines, '传送点', mapShared.normalizeWarpId(entities.warp), mapShared.state.systemWarps);
      if (entities.npcActor) addNamedDescription(lines, 'NPC场景', mapShared.normalizeNpcId(entities.npcActor), mapShared.state.npcContext);
      addNamedDescription(lines, '休息点', entities.bedRest, mapShared.state.service);
      if (entities.pcTerminal) addNamedDescription(lines, 'PC终端', 'PC_Terminal', mapShared.state.service);
      addNamedDescription(lines, '警察站', entities.policeBox, mapShared.state.service);
      addNamedDescription(lines, '交通站', entities.transitStation, mapShared.state.transitInfra);
      addNamedDescription(lines, '缆车站', entities.lavaLine, mapShared.state.transitInfra);
      addNamedDescription(lines, '港口码头', entities.seaRoute, mapShared.state.transitInfra);
      if (entities.skyNet) addNamedDescription(lines, '空运停机坪', mapShared.normalizeTransitId(entities.skyNet), mapShared.state.transitInfra);

      const npcLocations = mapShared.getNpcLocationsInRegion(regionId);
      if (npcLocations.length) {
        lines.push('');
        lines.push(`【${regionInfo?.name || regionId} NPC住址】`);
        npcLocations.slice(0, 16).forEach((npc) => {
          lines.push(`  - ${formatFacilityName(npc.id)} [${npc.displayX}, ${npc.displayY}]`);
        });
      }

      appendSurroundingSection(lines, internal, entities);
      appendLandmarkSection(lines, regionId, regionInfo, x, y, entities);
      return lines.join('\n');
    }

    function appendSurroundingSection(lines, internal, currentEntities) {
      lines.push('');
      lines.push('【周围环境】(半径2格)');
      const surrounding = mapShared.getSurroundingInfo(internal.gx, internal.gy);
      const surfaceGrouped = {};
      const regionZoneGrouped = {};
      const facilities = [];
      surrounding.forEach((item) => {
        if (!item.surface) return;
        const surfKey = `${item.surface}${item.traversable ? '' : '(不可通行)'}`;
        surfaceGrouped[surfKey] = surfaceGrouped[surfKey] || [];
        surfaceGrouped[surfKey].push(item.direction);
        if (item.regionZone && item.regionZone !== currentEntities.regionZone) {
          regionZoneGrouped[item.regionZone] = regionZoneGrouped[item.regionZone] || [];
          regionZoneGrouped[item.regionZone].push(item.direction);
        }
        if (item.pokemonCenter) facilities.push({ dir: item.direction, type: 'PC', name: item.pokemonCenter });
        if (item.service) facilities.push({ dir: item.direction, type: '商店', name: item.service });
        if (item.placeAnchor) facilities.push({ dir: item.direction, type: '场所', name: item.placeAnchor });
        if (item.warp) facilities.push({ dir: item.direction, type: '传送', name: item.warp });
        if (item.npcActor) facilities.push({ dir: item.direction, type: 'NPC', name: item.npcActor });
        if (item.transitStation) facilities.push({ dir: item.direction, type: '交通', name: item.transitStation });
        if (item.seaRoute) facilities.push({ dir: item.direction, type: '港口', name: item.seaRoute });
        if (item.skyNet) facilities.push({ dir: item.direction, type: '空运', name: item.skyNet });
      });

      if (!Object.keys(surfaceGrouped).length) {
        lines.push('  (位于地图边缘，周围信息有限)');
      } else {
        Object.entries(surfaceGrouped).forEach(([terrain, dirs]) => {
          lines.push(`  ${dirs.join('、')}: ${terrain}`);
        });
      }

      if (Object.keys(regionZoneGrouped).length) {
        lines.push('  [周围设施区]');
        Object.entries(regionZoneGrouped).forEach(([zone, dirs]) => {
          lines.push(`    ${dirs.join('、')}: ${zone}`);
        });
      }

      if (facilities.length) {
        const grouped = {};
        facilities.forEach((facility) => {
          const key = `${facility.type}:${facility.name}`;
          grouped[key] = grouped[key] || { ...facility, dirs: [] };
          grouped[key].dirs.push(facility.dir);
        });
        lines.push('  [周围设施]');
        Object.values(grouped).forEach((facility) => {
          lines.push(`    ${facility.dirs.join('、')}: [${facility.type}] ${facility.name}`);
        });
      }
    }

    function appendLandmarkSection(lines, regionId, regionInfo, x, y, entities) {
      if (entities.biomeZone) {
        lines.push('');
        lines.push(`【本区块地标】(${entities.biomeZone})`);
        const landmarks = mapShared.getBiomeZoneLandmarks(entities.biomeZone, x, y).slice(0, 5);
        if (!landmarks.length) lines.push('  (无已知地标)');
        landmarks.forEach((landmark) => {
          lines.push(`  - ${landmark.name} [${landmark.center[0]}, ${landmark.center[1]}] (~${landmark.distance}格)`);
        });
      }

      lines.push('');
      lines.push(`【本大区地标】(${regionInfo?.name || regionId})`);
      mapShared.getRegionLandmarks(regionId, x, y).slice(0, 6).forEach((landmark) => {
        lines.push(`  - ${landmark.name} [${landmark.center[0]}, ${landmark.center[1]}] (~${landmark.distance}格)`);
      });

      lines.push('');
      lines.push('【全图区域】');
      Object.entries(mapShared.REGIONS).forEach(([id, region]) => {
        lines.push(`  ${id === regionId ? '*' : '-'} ${region.name} [${region.center[0]}, ${region.center[1]}]`);
      });
    }

    function getWeatherType(value) {
      if (typeof value === 'string') return value;
      return isObject(value) && typeof value.weather === 'string' ? value.weather : '';
    }

    function appendWeatherSection(lines, pkmState) {
      const location = pkmState?.world?.location || {};
      const x = Number(location.x);
      const y = Number(location.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      const weatherService = services.weather;
      const weatherGrid = weatherService?.getWorldWeatherGrid?.(pkmState) || {};
      const internal = mapShared.toInternalCoords(x, y);
      const currentKey = `${internal.gx}_${internal.gy}`;
      const current = weatherGrid[currentKey] || null;
      const nearby = [];
      mapShared.GRID_OFFSETS.filter((offset) => offset.dx !== 0 || offset.dy !== 0).forEach(({ dx, dy, dir }) => {
        const weather = weatherGrid[`${internal.gx + dx}_${internal.gy + dy}`];
        const weatherType = getWeatherType(weather);
        if (weatherType) nearby.push({ dir, weather: weatherType });
      });
      if (!current && !nearby.length) return;
      lines.push('');
      lines.push('【天气状况】');
      if (current) {
        const currentWeather = getWeatherType(current);
        if (currentWeather) lines.push(`脚下: ${currentWeather}`);
      }
      if (nearby.length) {
        const groups = {};
        nearby.forEach((item) => {
          groups[item.weather] = groups[item.weather] || [];
          groups[item.weather].push(item.dir);
        });
        lines.push(`四周: ${Object.entries(groups).map(([weather, dirs]) => `${dirs.join('/')}:${weather}`).join(', ')}`);
      }
    }

    function appendPokemonSection(lines, pkmState) {
      const location = pkmState?.world?.location || {};
      const currentPokemon = services.spawns?.getCurrentGridPokemon?.(location.x, location.y, pkmState) || [];
      if (!currentPokemon.length) return;
      lines.push('');
      lines.push('【附近宝可梦】');
      currentPokemon.forEach((pokemon) => {
        const level = pokemon.level ? `Lv.${pokemon.level}` : '';
        const rarity = pokemon.rarity ? `(${pokemon.rarity})` : '';
        lines.push(`  ${pokemon.id || 'unknown'} ${level} ${rarity}`.trimEnd());
      });
    }

    function getRecentMessagesForNpcScan(historyDepth = 10) {
      if (typeof hostRoot.getChatMessages !== 'function' || typeof hostRoot.getLastMessageId !== 'function') return [];
      const lastMessageId = Number(hostRoot.getLastMessageId());
      if (!Number.isFinite(lastMessageId) || lastMessageId < 0) return [];
      const startMessageId = Math.max(0, lastMessageId - historyDepth + 1);
      try {
        return hostRoot.getChatMessages(`${startMessageId}-${lastMessageId}`) || [];
      } catch (_) {
        return [];
      }
    }

    function stripNoiseForNpcScan(text) {
      return String(text || '')
        .replace(/<UpdateVariable>[\s\S]*?<\/UpdateVariable>/gi, '')
        .replace(/<planning>[\s\S]*?<\/planning>/gi, '');
    }

    function getNpcTriggerSection(force = false) {
      const messages = getRecentMessagesForNpcScan(10);
      if (!messages.length) return '';
      const scanKey = messages.map((message) => {
        const text = message.message || message.mes || '';
        const id = message.message_id ?? message.id ?? '';
        return `${id}:${text.length}`;
      }).join('|');
      if (!force && cache.npcScanKey === scanKey && Date.now() - cache.npcScanAt < CHAT_SCAN_CACHE_TTL_MS) {
        return cache.npcTriggerSection;
      }

      let npcTriggerSection = '';
      try {
        const textToScan = messages.map((message) => stripNoiseForNpcScan(message.message || message.mes || '')).join('\n');
        const triggered = mapShared.scanForNpcTriggers(textToScan);
        const npcLocations = mapShared.getNpcLocationsByTriggers(triggered);
        if (npcLocations.length) {
          const lines = ['', '【剧情触发NPC地点】'];
          const grouped = {};
          npcLocations.forEach((loc) => {
            grouped[loc.displayName] = grouped[loc.displayName] || [];
            grouped[loc.displayName].push(loc);
          });
          Object.entries(grouped).forEach(([npcName, locations]) => {
            lines.push(`  ■ ${npcName}:`);
            locations.forEach((loc) => {
              const regionShort = mapShared.getRegionShortByCoords(loc.displayX, loc.displayY);
              lines.push(`    - ${loc.name || formatFacilityName(loc.id)} [${loc.displayX}, ${loc.displayY}] (${regionShort}区)`);
            });
          });
          npcTriggerSection = lines.join('\n');
        }
      } catch (error) {
        console.warn(`${PLUGIN_NAME} NPC trigger scan failed:`, error);
      }
      cache.npcScanKey = scanKey;
      cache.npcTriggerSection = npcTriggerSection;
      cache.npcScanAt = Date.now();
      return npcTriggerSection;
    }

    function buildPrompt(pkmState, options = {}) {
      const location = pkmState?.world?.location || {};
      if (!Number.isFinite(Number(location.x)) || !Number.isFinite(Number(location.y))) return '';
      const lines = [buildBaseContextText(location)];
      appendWeatherSection(lines, pkmState);
      appendPokemonSection(lines, pkmState);
      const npcSection = getNpcTriggerSection(options.forceNpcScan === true);
      if (npcSection) lines.push(npcSection);
      return `<location_context>\n${lines.join('\n')}\n</location_context>`;
    }

    function resetCache() {
      cache.npcScanKey = '';
      cache.npcTriggerSection = '';
      cache.npcScanAt = 0;
    }

    return {
      buildBaseContextText,
      buildPrompt,
      getNpcTriggerSection,
      resetCache
    };
  };
})();
