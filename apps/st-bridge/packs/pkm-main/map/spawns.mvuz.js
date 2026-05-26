/**
 * PKM Main map Pokemon spawn runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMMainPluginRuntime || {};
  ROOT.PKMMainPluginRuntime = RUNTIME;

  RUNTIME.createMapSpawns = function createMapSpawns(ctx, mapShared) {
    const { PLUGIN_NAME } = ctx;
    const { isObject } = ctx.util;
    const THREAT_PEACE = 6;

    const BIOME_ZONE_MAPPING = {
      Arcadia_Lawns: 'Aether_Admin_Zone',
      Zenith_HQ: 'Aether_Admin_Zone',
      Lusamine_Gardens: 'Aether_Admin_Zone',
      Academic_Plaza: 'Aether_Admin_Zone',
      Royal_Academy: 'Aether_Admin_Zone',
      Zero_Halo_Moat: 'Zero_Halo_Moat',
      Pearl_Resort: 'Sapphire_Strand',
      Sapphire_Marina: 'Sapphire_Strand',
      Sunflora_Farmsteads: 'Aroma_Meadow',
      Marina_Port_Town: 'Breeze_Woodlands',
      Jade_Canopy: 'Jade_Canopy',
      Deep_Root_Hollow: 'Deep_Root_Hollow',
      Breeze_Woodlands: 'Breeze_Woodlands',
      Hermit_Sands: 'Hermit_Sands',
      Golden_Horizon: 'Golden_Horizon',
      Emerald_Vein_River: 'Emerald_Vein_River',
      Mirror_Lotis_Lake: 'Mirror_Lotis_Lake',
      Twin_Destiny_Basin: 'Twin_Destiny_Basin',
      Electro_Avenue: 'Radiant_Plains',
      Cyber_Shopping_District: 'Radiant_Plains',
      Glitch_Arcade_Lane: 'Radiant_Plains',
      Synth_Promenade: 'Radiant_Plains',
      Skyline_Residences: 'Radiant_Plains',
      Neon_Cargo_Terminal: 'Radiant_Plains',
      Chrome_Canal: 'Chrome_Canal',
      Frost_Smoke_City: 'Silent_Tundra',
      Grim_Borough: 'Cinder_Moor',
      Northern_Cemetery: 'Silent_Tundra',
      Requiem_Grounds: 'Silent_Tundra',
      District_S: 'Cinder_Moor',
      Ginkgo_Grove: 'Ginkgo_Grove',
      Spirit_Plateau: 'Spirit_Plateau',
      Twilight_Copse: 'Twilight_Copse',
      Mercury_Stream: 'Mercury_Stream',
      Crimson_Forge_City: 'Crimson_Badlands',
      Titan_Mining_site: 'Crimson_Badlands',
      Venom_Refinery: 'Crimson_Badlands',
      Toxic_Industrial_Park: 'Crimson_Badlands',
      Crimson_Peat: 'Crimson_Peat',
      Inferno_Crater: 'Inferno_Crater',
      Scorched_Dunes: 'Scorched_Dunes',
      Silt_Delta: 'Silt_Delta',
      Prism_Bay: 'Crystal_Lagoon',
      Crystal_Lagoon: 'Crystal_Lagoon',
      Cerulean_Reef: 'Cerulean_Reef',
      Mist_Veil_Sound: 'Mist_Veil_Sound',
      Basalt_Shoals: 'Obsidian_Beach',
      Equatorial_Dark_Zone: 'Equatorial_Dark_Zone',
      Titan_Trough: 'Titan_Trough',
      Chrome_Abyss: 'Chrome_Abyss',
      Boreal_Trench: 'Boreal_Trench',
      Ferro_Straits: 'Ferro_Straits',
      Frigid_Floe: 'Frigid_Floe',
      Obsidian_Beach: 'Obsidian_Beach',
      Frostbite_Slope: 'Frostbite_Slope',
      Savanna_Outlands: 'Savanna_Outlands',
      Aroma_Meadow: 'Aroma_Meadow',
      Radiant_Plains: 'Radiant_Plains'
    };

    const PARADOX_SPAWN_POOLS = {
      Pool_Ancient_Sun: { type: 'ancient', pokemon: [{ id: 'brutebonnet', min: 55 }, { id: 'slitherwing', min: 55 }] },
      Pool_Ancient_Moon: { type: 'ancient', pokemon: [{ id: 'screamtail', min: 55 }, { id: 'fluttermane', min: 55 }] },
      Pool_Ancient_Earth: { type: 'ancient', pokemon: [{ id: 'greattusk', min: 55 }, { id: 'sandyshocks', min: 55 }] },
      Pool_Future_Drive: { type: 'future', pokemon: [{ id: 'ironhands', min: 55 }, { id: 'irontreads', min: 55 }] },
      Pool_Future_Sky: { type: 'future', pokemon: [{ id: 'ironmoth', min: 55 }, { id: 'ironjugulis', min: 55 }] },
      Pool_Future_Code: { type: 'future', pokemon: [{ id: 'ironbundle', min: 55 }, { id: 'ironthorns', min: 55 }] }
    };

    const STATIC_BOSS_MAP = {
      Boss_Anc_Apex: { type: 'ancient', pokemon: { id: 'roaringmoon', min: 72 } },
      Boss_Fut_Apex: { type: 'future', pokemon: { id: 'ironvaliant', min: 72 } },
      Elite_Walking_Wake: { type: 'ancient', pokemon: { id: 'walkingwake', min: 68 } },
      Elite_Raging_Bolt: { type: 'ancient', pokemon: { id: 'ragingbolt', min: 68 } },
      Elite_Gouging_Fire: { type: 'ancient', pokemon: { id: 'gougingfire', min: 68 } },
      Elite_Iron_Leavs: { type: 'future', pokemon: { id: 'ironleaves', min: 68 } },
      Elite_Iron_Boulder: { type: 'future', pokemon: { id: 'ironboulder', min: 68 } },
      Elite_Iron_Crown: { type: 'future', pokemon: { id: 'ironcrown', min: 68 } }
    };

    const ULTRA_BEAST_MAP = {
      UB01_Nihilego: { pokemon: { id: 'nihilego', min: 55 } },
      UB02_Buzzwole: { pokemon: { id: 'buzzwole', min: 55 } },
      UB02_Pheromosa: { pokemon: { id: 'pheromosa', min: 55 } },
      UB03_Xurkitree: { pokemon: { id: 'xurkitree', min: 55 } },
      UB04_Celesteela: { pokemon: { id: 'celesteela', min: 55 } },
      UB04_Kartana: { pokemon: { id: 'kartana', min: 55 } },
      UB05_Guzzlord: { pokemon: { id: 'guzzlord', min: 55 } },
      UB_Blacephalon: { pokemon: { id: 'blacephalon', min: 55 } },
      UB_Stakataka: { pokemon: { id: 'stakataka', min: 55 } }
    };

    function isPeaceZone(threat) {
      return threat === THREAT_PEACE || threat === 0;
    }

    function getRarityPool(threat) {
      if (isPeaceZone(threat)) return null;
      const roll = Math.random() * 100;
      if (threat === 1) {
        if (roll < 79.5) return 'common';
        if (roll < 96.5) return 'uncommon';
        if (roll < 99.5) return 'rare';
        return 'boss';
      }
      if (threat === 2) {
        if (roll < 75) return 'common';
        if (roll < 92) return 'uncommon';
        if (roll < 98) return 'rare';
        return 'boss';
      }
      if (threat === 3) {
        if (roll < 70) return 'common';
        if (roll < 90) return 'uncommon';
        if (roll < 96) return 'rare';
        return 'boss';
      }
      if (threat === 4) {
        if (roll < 60) return 'common';
        if (roll < 85) return 'uncommon';
        if (roll < 94) return 'rare';
        return 'boss';
      }
      if (roll < 50) return 'common';
      if (roll < 80) return 'uncommon';
      if (roll < 100) return 'rare';
      return 'boss';
    }

    function getLevelRange(threat) {
      return ({
        1: { min: 2, max: 8 },
        2: { min: 8, max: 20 },
        3: { min: 20, max: 40 },
        4: { min: 40, max: 60 },
        5: { min: 60, max: 85 }
      })[threat] || { min: 2, max: 8 };
    }

    function resolveZoneName(biomeZone) {
      return BIOME_ZONE_MAPPING[biomeZone] || biomeZone;
    }

    function pickFromPool(pool, levelRange, rarity = null) {
      if (!Array.isArray(pool) || !pool.length) return null;
      const entry = pool[Math.floor(Math.random() * pool.length)];
      const id = typeof entry === 'string' ? entry : entry?.id;
      if (!id) return null;
      const configuredMin = typeof entry === 'object' ? Number(entry.min || 0) : 0;
      const min = Math.max(configuredMin || levelRange.min, levelRange.min);
      const max = Math.max(levelRange.max, min);
      let level = min + Math.floor(Math.random() * (max - min + 1));
      if (rarity === 'boss') level = Math.min(level + 3 + Math.floor(Math.random() * 3), 100);
      return { id, level };
    }

    function spawnPhenomenonPokemon(_gx, _gy, phenomenon, entities) {
      if (!isObject(phenomenon) || phenomenon.active_type === 'clear') return null;
      const activeType = phenomenon.active_type;
      const ultraWormholes = Array.isArray(entities?.ultraWormholes) ? entities.ultraWormholes : [];
      const paradoxAnchors = Array.isArray(entities?.paradoxAnchors) ? entities.paradoxAnchors : [];

      if (activeType === 'ultra') {
        for (const wormhole of ultraWormholes) {
          const config = ULTRA_BEAST_MAP[wormhole];
          if (!config) continue;
          return {
            id: config.pokemon.id,
            level: config.pokemon.min + Math.floor(Math.random() * 10),
            rarity: 'ultra_beast',
            phenomenon: activeType
          };
        }
      }

      if (activeType !== 'ancient' && activeType !== 'future') return null;
      for (const anchor of paradoxAnchors) {
        if (anchor.startsWith('Elite_') || anchor.startsWith('Boss_')) {
          const config = STATIC_BOSS_MAP[anchor];
          if (config?.type === activeType && Math.random() < 0.25) {
            return {
              id: config.pokemon.id,
              level: config.pokemon.min + Math.floor(Math.random() * 5),
              rarity: 'paradox_boss',
              phenomenon: activeType
            };
          }
        }
        if (anchor.startsWith('Pool_')) {
          const config = PARADOX_SPAWN_POOLS[anchor];
          if (config?.type === activeType && Math.random() < 0.25) {
            const pokemon = config.pokemon[Math.floor(Math.random() * config.pokemon.length)];
            return {
              id: pokemon.id,
              level: pokemon.min + Math.floor(Math.random() * 10),
              rarity: 'paradox',
              phenomenon: activeType
            };
          }
        }
      }
      return null;
    }

    function spawnForGrid(gx, gy, spawnTablesData, phenomenon = null) {
      const gridInfo = mapShared.getGridInfo(gx, gy);
      const entities = mapShared.getEntitiesAtGrid(gx, gy);
      const threat = gridInfo.threat;
      const surfaceType = gridInfo.surface;
      const biomeZone = entities.biomeZone;
      if (isPeaceZone(threat) || !surfaceType || !biomeZone) return [];

      const resolvedZone = resolveZoneName(biomeZone);
      const zoneTable = spawnTablesData?.[resolvedZone];
      if (!zoneTable) {
        console.warn(`${PLUGIN_NAME} spawn zone not found: ${resolvedZone}`);
        return [];
      }
      const surfacePool = zoneTable[surfaceType];
      if (!surfacePool) return [];

      const results = [];
      const levelRange = getLevelRange(threat);
      const phenomenonPokemon = spawnPhenomenonPokemon(gx, gy, phenomenon, entities);
      if (phenomenonPokemon) results.push(phenomenonPokemon);

      if (Array.isArray(surfacePool.legendary) && surfacePool.legendary.length && Math.random() * 1000 < 1) {
        const legendary = pickFromPool(surfacePool.legendary, { min: 70, max: 90 }, 'legendary');
        if (legendary) {
          results.push({ ...legendary, rarity: 'legendary' });
        }
      }

      const count = 4 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i += 1) {
        const requestedRarity = getRarityPool(threat);
        if (!requestedRarity) continue;
        let actualRarity = requestedRarity;
        let pool = surfacePool[requestedRarity];
        if (!Array.isArray(pool) || !pool.length) {
          if (requestedRarity === 'boss' && Array.isArray(surfacePool.rare) && surfacePool.rare.length) {
            pool = surfacePool.rare;
            actualRarity = 'rare';
          } else if ((requestedRarity === 'boss' || requestedRarity === 'rare') && Array.isArray(surfacePool.uncommon) && surfacePool.uncommon.length) {
            pool = surfacePool.uncommon;
            actualRarity = 'uncommon';
          } else {
            pool = surfacePool.common;
            actualRarity = 'common';
          }
        }
        const pokemon = pickFromPool(pool, levelRange, actualRarity);
        if (pokemon) {
          results.push({ ...pokemon, rarity: actualRarity });
        }
      }
      return results.sort((left, right) => (left.level || 0) - (right.level || 0));
    }

    function getLocationKey(gx, gy) {
      return `${gx}_${gy}`;
    }

    function getWorldSpawns(pkmState) {
      const world = isObject(pkmState?.world) ? pkmState.world : {};
      return isObject(world.pokemonSpawns) ? world.pokemonSpawns : (isObject(world.pokemon_spawns) ? world.pokemon_spawns : {});
    }

    async function generateForNearbyGrids(x, y, pkmState, forceRefresh = false) {
      await mapShared.loadData();
      const spawnTablesData = mapShared.state.spawnTablesData;
      if (!spawnTablesData) {
        console.warn(`${PLUGIN_NAME} SPAWN_TABLES_DATA unavailable`);
        return null;
      }
      const internal = mapShared.toInternalCoords(x, y);
      const existingSpawns = forceRefresh ? {} : getWorldSpawns(pkmState);
      const phenomenon = pkmState?.world?.phenomenon || { active_type: 'clear', active_region: 'none' };
      const newSpawns = {};
      mapShared.GRID_OFFSETS.forEach(({ dx, dy }) => {
        const gx = internal.gx + dx;
        const gy = internal.gy + dy;
        const key = getLocationKey(gx, gy);
        if (existingSpawns[key]) return;
        const pokemonList = spawnForGrid(gx, gy, spawnTablesData, phenomenon);
        if (!pokemonList.length) return;
        const pokemonObj = {};
        pokemonList.forEach((pokemon, index) => {
          pokemonObj[`p${index + 1}`] = pokemon;
        });
        newSpawns[key] = pokemonObj;
      });
      return Object.keys(newSpawns).length ? newSpawns : null;
    }

    function getCurrentGridPokemon(x, y, pkmState) {
      const internal = mapShared.toInternalCoords(x, y);
      const gridData = getWorldSpawns(pkmState)[getLocationKey(internal.gx, internal.gy)];
      if (!isObject(gridData)) return [];
      return Object.keys(gridData)
        .sort((left, right) => Number(left.replace(/^p/, '')) - Number(right.replace(/^p/, '')))
        .map((key) => gridData[key])
        .filter(Boolean);
    }

    return {
      isPeaceZone,
      getRarityPool,
      getLevelRange,
      resolveZoneName,
      spawnPhenomenonPokemon,
      spawnForGrid,
      generateForNearbyGrids,
      getCurrentGridPokemon,
      getWorldSpawns,
      getLocationKey
    };
  };
})();
