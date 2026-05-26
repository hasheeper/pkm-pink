/**
 * PKM Main map shared runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  RUNTIME.createMapShared = function createMapShared(ctx) {
    const {
      ROOT: hostRoot,
      PLUGIN_NAME
    } = ctx;
    const {
      isObject,
      normalizeString
    } = ctx.util;

    const DEFAULT_APP_BASE_URL = 'https://hasheeper.github.io/pkm-pink';
    const LOCATION_INJECT_ID = 'pkm_location_context';
    const MAP_CENTER_X = 26;
    const MAP_CENTER_Y = 26;
    const GRID_SIZE = 16;

    const REGIONS = {
      Region_Zenith: { name: 'Z区 ZENITH (中枢区)', center: [1, 1], short: 'Z' },
      Region_Neon: { name: 'N区 NEON (霓虹区)', center: [12, -12], short: 'N' },
      Region_Bloom: { name: 'B区 BLOOM (盛放区)', center: [-13, -13], short: 'B' },
      Region_Shadow: { name: 'S区 SHADOW (暗影区)', center: [12, 12], short: 'S' },
      Region_Apex: { name: 'A区 APEX (极诣区)', center: [-13, 13], short: 'A' }
    };

    const REGION_SHORT_MAP = Object.fromEntries(
      Object.entries(REGIONS).map(([key, value]) => [key, value.short])
    );

    const REGION_ID_BY_SHORT = Object.fromEntries(
      Object.entries(REGIONS).map(([key, value]) => [value.short, key])
    );

    const GRID_OFFSETS = [
      { dx: 0, dy: 0, dir: '脚下' },
      { dx: 0, dy: -1, dir: '北' },
      { dx: 0, dy: 1, dir: '南' },
      { dx: -1, dy: 0, dir: '西' },
      { dx: 1, dy: 0, dir: '东' },
      { dx: -1, dy: -1, dir: '西北' },
      { dx: 1, dy: -1, dir: '东北' },
      { dx: -1, dy: 1, dir: '西南' },
      { dx: 1, dy: 1, dir: '东南' },
      { dx: 0, dy: -2, dir: '北2' },
      { dx: 0, dy: 2, dir: '南2' },
      { dx: -2, dy: 0, dir: '西2' },
      { dx: 2, dy: 0, dir: '东2' }
    ];

    const TERRAIN_CONFIG = {
      1: { type: 'Deep_Sea' },
      2: { type: 'High_Grass' },
      3: { type: 'Waste' },
      4: { type: 'Pavement' },
      6: { type: 'Shallow_Sea' },
      7: { type: 'Fresh_Water' },
      9: { type: 'Sewage' },
      10: { type: 'Standard_Grass' },
      12: { type: 'Flower_Field' },
      13: { type: 'Deep_Jungle' },
      14: { type: 'Wet_Soil' },
      15: { type: 'Coastal_Sand' },
      16: { type: 'Light_Forest' },
      17: { type: 'Industrial' },
      18: { type: 'High_Voltage' },
      19: { type: 'Synthetic_Turf' },
      20: { type: 'Swamp' },
      21: { type: 'Slum_Pavement' },
      22: { type: 'Withered_Grass' },
      23: { type: 'Snowfield' },
      24: { type: 'Glacial_Water' },
      25: { type: 'Desert_Sand' },
      26: { type: 'Rocky_Mountain' },
      27: { type: 'Scorched_Earth' },
      28: { type: 'Magma' },
      29: { type: 'Ancient_Timber' }
    };

    const TRANSIT_ID_MAP = {
      Summit_Dojo_POINT: 'Summit_Dojo_Point',
      Northern_Cemetery: 'Northern_Cemetery_Pad',
      Zenith_HQ: 'Zenith_HQ_Helipad'
    };

    const WARP_ID_MAP = {
      Sewer_0: 'Sewer',
      Sewer_1: 'Sewer',
      Sewer_2: 'Sewer',
      Cave_0: 'Cave',
      Cave_1: 'Cave',
      Cave_2: 'Cave',
      Gate_0: 'Gate',
      Gate_1: 'Gate'
    };

    const NPC_ID_MAP = {
      Iono_Stream_Tower: 'Iono_Levincia_Guild_Tower'
    };

    const NPC_TRIGGERS = {
      lusamine: ['Lusamine', 'ルザミーネ', '露莎米奈', '露莎米那', '露莎米恩', '卢莎米奈'],
      erika: ['Erika', 'エリカ', '莉佳', '艾莉嘉'],
      roxie: ['Roxie', 'Homika', 'ホミカ', '霍米加', '霍米卡'],
      iono: ['Iono', 'Nanjamo', 'ナンジャモ', '奇树', '奇樹'],
      marnie: ['Marnie', 'マリィ', '玛俐', '瑪俐', '真俐'],
      cynthia: ['Cynthia', 'Shirona', 'シロナ', '竹兰', '竹蘭', '希罗娜', '希羅娜'],
      bea: ['Saito', 'サイトウ', '彩豆'],
      sonia: ['Sonia', 'ソニア', '索妮亚', '索妮亞'],
      gloria: ['Gloria', 'Yuuri', 'ユウリ', '小优', '小優', '優莉'],
      rosa: ['Rosa', 'メイ', '鸣依', '鳴依', '芽以'],
      dawn: ['Hikari', 'ヒカリ', '小光'],
      serena: ['Serena', 'セレナ', '莎莉娜', '瑟蕾娜', '瑟琳娜'],
      irida: ['Irida', 'カイ', '珠贝', '珠貝'],
      akari: ['Akari', 'ショウ', '小照'],
      nessa: ['Nessa', 'Rurina', 'ルリナ', '露璃娜'],
      mallow: ['Mallow', 'マオ', '玛奥', '瑪奧', '玛沃'],
      lana: ['Suiren', 'スイレン', '水莲', '水蓮'],
      lillie: ['Lillie', 'Lilie', 'リーリエ', '莉莉艾', '莉莉愛', '莉莉安'],
      hex: ['Hex Maniac', 'Occult Maniac', 'オカルトマニア', '灵异迷', '靈異迷', '海可丝'],
      selene: ['Selene', 'Mizuki', 'ミヅキ', '美月'],
      juliana: ['Juliana', 'アオイ', '小青'],
      may: ['Haruka', 'ハルカ', '小遥', '小遙'],
      lacey: ['Lacey', 'Nerine', 'ネリネ', '紫竽', '紫玉', '紫芋'],
      misty: ['Misty', 'Kasumi', 'カスミ', '小霞'],
      acerola: ['Acerola', 'アセロラ', '阿塞萝拉', '阿塞蘿拉', '阿塞罗拉'],
      skyla: ['Skyla', 'Fuuro', 'フウロ', '风露', '風露'],
      iris: ['Iris', 'アイリス', '艾莉丝', '艾莉絲', '艾丽丝'],
      nemona: ['Nemona', 'ネモ', '妮莫', '尼莫']
    };

    const NPC_TRIGGER_TO_MAP_ID = {
      lusamine: 'Lusamine',
      erika: 'Erika',
      roxie: 'Roxie',
      iono: 'Iono',
      marnie: 'Marnie',
      cynthia: 'Cynthia',
      bea: 'Bea',
      sonia: 'Sonia',
      gloria: 'Gloria',
      rosa: 'Rosa',
      dawn: 'Dawn',
      serena: 'Serena',
      irida: 'Irida',
      akari: 'Akari',
      nessa: 'Nessa',
      mallow: 'Mallow_Lana',
      lana: 'Mallow_Lana',
      lillie: 'Lillie',
      hex: 'Hex',
      selene: 'Selene',
      juliana: 'Juliana',
      may: 'May',
      lacey: 'Lacey',
      misty: 'Misty',
      acerola: 'Acerola',
      skyla: 'Skyla',
      iris: 'Iris',
      nemona: 'Nemona'
    };

    function getNpcTriggers() {
      return RUNTIME.data?.npc?.triggers || NPC_TRIGGERS;
    }

    const state = {
      mapInfoData: null,
      mapData: null,
      spawnTablesData: null,
      dataLoaded: false,
      loadPromise: null,
      regionZones: {},
      biomeFlavor: {},
      regionDescriptions: {},
      service: {},
      placeAnchor: {},
      systemWarps: {},
      transitInfra: {},
      npcContext: {},
      layerCache: new Map()
    };

    function trimTrailingSlash(value) {
      return typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
    }

    function resolveAppBaseUrl() {
      return trimTrailingSlash(hostRoot.PKM_APP_BASE_URL || DEFAULT_APP_BASE_URL) || DEFAULT_APP_BASE_URL;
    }

    function dataUrl(fileName) {
      return `${resolveAppBaseUrl()}/apps/dashboard-main/map/data/${fileName}`;
    }

    async function fetchJson(fileName) {
      const response = await fetch(dataUrl(fileName), { cache: 'no-cache' });
      if (!response.ok) throw new Error(`failed to load ${fileName}: ${response.status}`);
      return response.json();
    }

    function initFromMapInfo(mapInfoData) {
      state.regionZones = mapInfoData?.region_zones || {};
      state.biomeFlavor = mapInfoData?.biome_flavor || {};
      const serviceData = mapInfoData?.service || {};
      state.service = serviceData;
      state.placeAnchor = serviceData.place_anchor || mapInfoData?.place_anchor || {};
      state.systemWarps = mapInfoData?.system_warps || {};
      state.transitInfra = mapInfoData?.transit_infrastructure || {};
      state.npcContext = mapInfoData?.npc_actor_context || {};
      state.regionDescriptions = mapInfoData?.narrative_layer?.world_atmosphere?.regions || {};
    }

    async function loadPkmData() {
      if (hostRoot.SPAWN_TABLES_DATA) {
        state.spawnTablesData = hostRoot.SPAWN_TABLES_DATA;
        return true;
      }
      if (!hostRoot.document?.head) return false;
      const src = dataUrl('pkmdata.js');
      const existing = Array.from(hostRoot.document.querySelectorAll('script[data-pkm-main-map-data="pkmdata"]'))
        .find((script) => script.src === src);
      if (existing && hostRoot.SPAWN_TABLES_DATA) {
        state.spawnTablesData = hostRoot.SPAWN_TABLES_DATA;
        return true;
      }
      await new Promise((resolve) => {
        const script = hostRoot.document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.pkmMainMapData = 'pkmdata';
        script.onload = resolve;
        script.onerror = resolve;
        hostRoot.document.head.appendChild(script);
      });
      state.spawnTablesData = hostRoot.SPAWN_TABLES_DATA || null;
      return Boolean(state.spawnTablesData);
    }

    async function loadData() {
      if (state.dataLoaded) return state;
      if (state.loadPromise) return state.loadPromise;
      state.loadPromise = (async () => {
        try {
          const [mapInfoData, mapData] = await Promise.all([
            fetchJson('mapinfo.json'),
            fetchJson('mapdata.json')
          ]);
          state.mapInfoData = mapInfoData;
          state.mapData = mapData;
          initFromMapInfo(mapInfoData);
          await loadPkmData();
          state.dataLoaded = true;
          console.log(`${PLUGIN_NAME} map data loaded`, {
            hasMap: Boolean(state.mapData),
            hasSpawnTables: Boolean(state.spawnTablesData)
          });
        } catch (error) {
          console.error(`${PLUGIN_NAME} failed to load map data:`, error);
        } finally {
          state.loadPromise = null;
        }
        return state;
      })();
      return state.loadPromise;
    }

    function getLevelData() {
      return state.mapData?.levels?.[0] || null;
    }

    function getLayer(layerName, type = '') {
      const key = `${layerName}:${type}`;
      if (state.layerCache.has(key)) return state.layerCache.get(key);
      const layer = (getLevelData()?.layerInstances || []).find((item) => {
        if (item.__identifier !== layerName) return false;
        return type ? item.__type === type : true;
      }) || null;
      state.layerCache.set(key, layer);
      return layer;
    }

    function getIntVal(gx, gy, layerName) {
      const layer = getLayer(layerName, 'IntGrid');
      const width = layer?.__cWid || 52;
      const index = gy * width + gx;
      if (!layer?.intGridCsv || index < 0 || index >= layer.intGridCsv.length) return 0;
      return layer.intGridCsv[index] || 0;
    }

    function getEntityGrid(entity) {
      if (Array.isArray(entity?.__grid)) return { gx: entity.__grid[0], gy: entity.__grid[1] };
      const worldX = entity?.__worldX ?? entity?.px?.[0] ?? 0;
      const worldY = entity?.__worldY ?? entity?.px?.[1] ?? 0;
      return {
        gx: Math.floor(worldX / GRID_SIZE),
        gy: Math.floor(worldY / GRID_SIZE)
      };
    }

    function getEntityFieldValue(entity, preferredId = '') {
      const fields = Array.isArray(entity?.fieldInstances) ? entity.fieldInstances : [];
      if (preferredId) {
        const exact = fields.find((field) => field.__identifier === preferredId);
        if (exact && exact.__value !== undefined && exact.__value !== null) return exact.__value;
      }
      const first = fields.find((field) => field.__value !== undefined && field.__value !== null);
      return first ? first.__value : null;
    }

    function entityCoversGrid(entity, gx, gy) {
      const worldX = gx * GRID_SIZE;
      const worldY = gy * GRID_SIZE;
      const ex = entity?.px?.[0] ?? entity?.__worldX ?? 0;
      const ey = entity?.px?.[1] ?? entity?.__worldY ?? 0;
      const ew = entity?.width || GRID_SIZE;
      const eh = entity?.height || GRID_SIZE;
      return worldX >= ex && worldX < ex + ew && worldY >= ey && worldY < ey + eh;
    }

    function toInternalCoords(displayX, displayY) {
      let x = Number(displayX) || 0;
      if (x > 0) x -= 1;
      let y = Number(displayY) || 0;
      if (y > 0) y -= 1;
      return {
        gx: x + MAP_CENTER_X,
        gy: MAP_CENTER_Y - y - 1
      };
    }

    function toDisplayCoords(gx, gy) {
      let x = Number(gx) - MAP_CENTER_X;
      if (x >= 0) x += 1;
      let y = MAP_CENTER_Y - Number(gy) - 1;
      if (y >= 0) y += 1;
      return { x, y };
    }

    function getRegionIdByCoords(x, y) {
      if (Math.abs(x) <= 6 && Math.abs(y) <= 6) return 'Region_Zenith';
      if (x > 0 && y < 0) return 'Region_Neon';
      if (x < 0 && y < 0) return 'Region_Bloom';
      if (x > 0 && y > 0) return 'Region_Shadow';
      if (x < 0 && y > 0) return 'Region_Apex';
      return 'Region_Zenith';
    }

    function getRegionShortByCoords(x, y) {
      return REGION_SHORT_MAP[getRegionIdByCoords(x, y)] || 'Z';
    }

    function normalizeRegionId(region) {
      const text = normalizeString(region, '');
      return REGION_ID_BY_SHORT[text] || (REGIONS[text] ? text : 'Region_Zenith');
    }

    function normalizeTransitId(id) {
      return TRANSIT_ID_MAP[id] || id;
    }

    function normalizeWarpId(id) {
      return WARP_ID_MAP[id] || id;
    }

    function normalizeNpcId(id) {
      return NPC_ID_MAP[id] || id;
    }

    function getThreatLabel(threat) {
      return ({ 0: '未知', 1: '安全', 2: '低危', 3: '中危', 4: '高危', 5: '极危', 6: '和平' })[threat] || '未知';
    }

    function getGridInfo(gx, gy) {
      const surfaceVal = getIntVal(gx, gy, 'Surface');
      const regionVal = getIntVal(gx, gy, 'Regions');
      const regionMap = {
        2: 'Region_Zenith',
        3: 'Region_Neon',
        4: 'Region_Bloom',
        5: 'Region_Shadow',
        6: 'Region_Apex'
      };
      return {
        gx,
        gy,
        surface: TERRAIN_CONFIG[surfaceVal]?.type || null,
        traversable: getIntVal(gx, gy, 'Traversability') !== 1,
        threat: getIntVal(gx, gy, 'Threat') || 0,
        biomeZone: null,
        region: regionMap[regionVal] || null
      };
    }

    function getEntitiesAtGrid(gx, gy) {
      const entities = {
        biomeZone: null,
        regionZone: null,
        placeAnchor: null,
        npcActor: null,
        pokemonCenter: null,
        warp: null,
        service: null,
        bedRest: null,
        pcTerminal: null,
        policeBox: null,
        transitStation: null,
        lavaLine: null,
        seaRoute: null,
        skyNet: null,
        paradoxAnchors: [],
        ultraWormholes: []
      };
      const level = getLevelData();
      if (!level) return entities;

      for (const layer of level.layerInstances || []) {
        if (layer.__type !== 'Entities') continue;
        const layerId = layer.__identifier;
        for (const entity of layer.entityInstances || []) {
          if (!entityCoversGrid(entity, gx, gy)) continue;
          const id = entity.__identifier;
          const fieldValue = getEntityFieldValue(entity, id);
          if (layerId === 'Biome_Zone' || id === 'Biome' || String(id).startsWith('Biome')) {
            entities.biomeZone = fieldValue || id;
          } else if (layerId === 'Region_Zone' || String(id).startsWith('Region_')) {
            entities.regionZone = fieldValue || id;
          } else if (layerId === 'Place_Anchor' || id === 'Place_Anchor') {
            entities.placeAnchor = fieldValue;
          } else if (layerId === 'NPC_Actor' || id === 'NPC_Actor') {
            entities.npcActor = fieldValue;
          } else if (id === 'Pokemon_Centers') {
            entities.pokemonCenter = fieldValue;
          } else if (id === 'Warp') {
            entities.warp = fieldValue;
          } else if (id === 'Shop_Kiosk') {
            entities.service = fieldValue;
          } else if (id === 'Bed_Rest') {
            entities.bedRest = fieldValue || 'Bed_Rest';
          } else if (id === 'PC_Terminal') {
            entities.pcTerminal = 'PC_Terminal';
          } else if (id === 'Police_Box') {
            entities.policeBox = fieldValue || 'Police_Box';
          } else if (id === 'Transit_Station') {
            entities.transitStation = fieldValue;
          } else if (id === 'Lava_Line') {
            entities.lavaLine = fieldValue;
          } else if (id === 'Sea_Route') {
            entities.seaRoute = fieldValue;
          } else if (id === 'Sky_Net') {
            entities.skyNet = fieldValue;
          } else if (layerId === 'Ultra_Wormhole' || id === 'Ultra_Wormhole') {
            if (fieldValue) entities.ultraWormholes.push(fieldValue);
          } else if (layerId === 'Paradox_Anchors' || id === 'Paradox_Anchors') {
            if (fieldValue) entities.paradoxAnchors.push(fieldValue);
          }
        }
      }
      return entities;
    }

    function getSurroundingInfo(gx, gy) {
      return GRID_OFFSETS.filter((offset) => offset.dx !== 0 || offset.dy !== 0).map((offset) => {
        const nx = gx + offset.dx;
        const ny = gy + offset.dy;
        const info = getGridInfo(nx, ny);
        const entities = getEntitiesAtGrid(nx, ny);
        return {
          direction: offset.dir,
          offset: [offset.dx, offset.dy],
          ...info,
          biomeZone: info.biomeZone || entities.biomeZone,
          regionZone: entities.regionZone,
          placeAnchor: entities.placeAnchor,
          service: entities.service,
          pokemonCenter: entities.pokemonCenter,
          npcActor: entities.npcActor,
          warp: entities.warp,
          bedRest: entities.bedRest,
          pcTerminal: entities.pcTerminal,
          policeBox: entities.policeBox,
          transitStation: entities.transitStation,
          lavaLine: entities.lavaLine,
          seaRoute: entities.seaRoute,
          skyNet: entities.skyNet
        };
      });
    }

    function collectEntityLocations(matchIds) {
      const ids = Array.isArray(matchIds) ? matchIds : [matchIds];
      const output = [];
      const level = getLevelData();
      if (!level) return output;
      for (const layer of level.layerInstances || []) {
        if (layer.__type !== 'Entities') continue;
        for (const entity of layer.entityInstances || []) {
          if (!ids.includes(entity.__identifier) && !ids.includes(layer.__identifier)) continue;
          const { gx, gy } = getEntityGrid(entity);
          const display = toDisplayCoords(gx, gy);
          const id = getEntityFieldValue(entity, entity.__identifier);
          output.push({
            id,
            gx,
            gy,
            displayX: display.x,
            displayY: display.y,
            region: getRegionShortByCoords(display.x, display.y),
            name: state.npcContext[id]?.name || String(id || entity.__identifier).replace(/_/g, ' '),
            desc: state.npcContext[id]?.desc || null
          });
        }
      }
      return output;
    }

    function getNpcLocationsInRegion(regionId) {
      return collectEntityLocations('NPC_Actor').filter((loc) => {
        return getRegionIdByCoords(loc.displayX, loc.displayY) === regionId;
      });
    }

    function getAllNpcLocations() {
      return collectEntityLocations('NPC_Actor').filter((loc) => loc.id);
    }

    function getNpcLocationsByTriggers(triggeredNpcKeys) {
      const all = getAllNpcLocations();
      const output = [];
      (triggeredNpcKeys || []).forEach((npcKey) => {
        const prefix = NPC_TRIGGER_TO_MAP_ID[npcKey];
        if (!prefix) return;
        all.forEach((loc) => {
          if (loc.id === prefix || String(loc.id || '').startsWith(`${prefix}_`)) {
            output.push({
              ...loc,
              triggerKey: npcKey,
              displayName: getNpcTriggers()[npcKey]?.[0] || prefix
            });
          }
        });
      });
      return output;
    }

    function scanForNpcTriggers(text) {
      const lower = String(text || '').toLowerCase();
      if (!lower) return [];
      const found = new Set();
      Object.entries(getNpcTriggers()).forEach(([npcKey, triggers]) => {
        if (triggers.some((trigger) => lower.includes(String(trigger).toLowerCase()))) found.add(npcKey);
      });
      return Array.from(found);
    }

    function findNearest(collection, x, y, maxDistance) {
      let nearest = null;
      Object.entries(collection || {}).forEach(([name, data]) => {
        if (!Array.isArray(data?.center_point)) return;
        const distance = Math.abs(data.center_point[0] - x) + Math.abs(data.center_point[1] - y);
        if (distance <= maxDistance && (!nearest || distance < nearest.distance)) {
          nearest = { name, data, distance };
        }
      });
      return nearest;
    }

    function getRegionLandmarks(regionId, x, y) {
      const prefixes = {
        Region_Zenith: ['Aether', 'Royal', 'Living', 'Lusamine', 'Eco', 'Academic', 'Zero_Halo', 'Arcadia'],
        Region_Neon: ['Iono', 'Toxic', 'Cyber', 'Port', 'Glitch', 'Skyline', 'Synth', 'Golden', 'Radiant', 'Chrome'],
        Region_Bloom: ['Pearl', 'Sunflora', 'Marina', 'Sapphire', 'Hermit', 'Aroma', 'Jade', 'Deep_Root', 'Silt', 'Breeze', 'Prism', 'Crystal', 'Mirror'],
        Region_Shadow: ['Grim', 'Venom', 'Frost', 'Requiem', 'Canal', 'Kamunagi', 'Cinder', 'Silent', 'Spirit', 'Twilight', 'Crimson_Peat', 'Ginkgo', 'Mercury'],
        Region_Apex: ['Crimson_Forge', 'Titan', 'Dune', 'Ruins', 'Savanna', 'Scorched', 'Obsidian', 'Inferno', 'Crimson_Badlands', 'Frostbite', 'Desolate']
      }[regionId] || [];
      const landmarks = [];
      const collect = (collection, type) => {
        Object.entries(collection || {}).forEach(([name, data]) => {
          if (!Array.isArray(data?.center_point)) return;
          if (!prefixes.some((prefix) => name.includes(prefix))) return;
          const distance = Math.abs(data.center_point[0] - x) + Math.abs(data.center_point[1] - y);
          landmarks.push({ name, center: data.center_point, distance, type });
        });
      };
      collect(state.regionZones, 'zone');
      collect(state.biomeFlavor, 'biome');
      return landmarks.sort((a, b) => a.distance - b.distance);
    }

    function getBiomeZoneLandmarks(_biomeZone, x, y) {
      return Object.entries(state.regionZones || {})
        .filter(([, data]) => Array.isArray(data?.center_point))
        .map(([name, data]) => ({
          name,
          center: data.center_point,
          distance: Math.abs(data.center_point[0] - x) + Math.abs(data.center_point[1] - y)
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    return {
      LOCATION_INJECT_ID,
      REGIONS,
      REGION_SHORT_MAP,
      REGION_ID_BY_SHORT,
      GRID_OFFSETS,
      TERRAIN_CONFIG,
      state,
      resolveAppBaseUrl,
      dataUrl,
      loadData,
      getLevelData,
      getLayer,
      getIntVal,
      getEntityFieldValue,
      getEntityGrid,
      toInternalCoords,
      toDisplayCoords,
      getRegionIdByCoords,
      getRegionShortByCoords,
      normalizeRegionId,
      normalizeTransitId,
      normalizeWarpId,
      normalizeNpcId,
      getThreatLabel,
      getGridInfo,
      getEntitiesAtGrid,
      getSurroundingInfo,
      collectEntityLocations,
      getNpcLocationsInRegion,
      getAllNpcLocations,
      getNpcLocationsByTriggers,
      scanForNpcTriggers,
      findNearestRegionZone: (x, y) => findNearest(state.regionZones, x, y, 8),
      findNearestBiomeZone: (x, y) => findNearest(state.biomeFlavor, x, y, 10),
      getRegionLandmarks,
      getBiomeZoneLandmarks
    };
  };
})();
