/**
 * PKM Tavern Plugin - MVUZ draft
 *
 * Replaces the ERA business plugin with message-variable MVUZ state.
 * This file intentionally does not create dashboard UI. The dashboard host is
 * handled by tavern-inject.mvuz.js.
 */
(async function () {
  'use strict';

  const PLUGIN_NAME = '[PKM-MVUZ]';
  const STATE_ROOT = 'stat_data';
  const STATE_KEY = 'pkm';
  const SCHEMA_VERSION = 1;
  const DEFAULT_PRODUCT = 'main';
  const DEFAULT_INJECT_IDS = {
    party: 'pkm_mvuz_party_state',
    time: 'pkm_mvuz_time_state',
    npc: 'pkm_mvuz_npc_state',
    unlock: 'pkm_mvuz_unlock_events'
  };

  const PERIODS = ['dawn', 'morning', 'noon', 'afternoon', 'evening', 'night', 'midnight'];
  const DEFAULT_SETTINGS = {
    enableAVS: true,
    enableCommander: true,
    enableEVO: true,
    enableBGM: true,
    enableSFX: true,
    enableClash: false,
    enableBattleEnvironment: true
  };

  const runtime = {
    initialized: false,
    product: DEFAULT_PRODUCT,
    processedMessages: new Set(),
    handlers: {},
    lastStateSnapshot: null
  };

  function clone(value, fallback = value) {
    if (value == null) return fallback;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return fallback;
    }
  }

  function nowIso() {
    try {
      return new Date().toISOString();
    } catch (_) {
      return '';
    }
  }

  function clampNumber(value, min, max, fallback = min) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }

  function normalizeString(value, fallback = '') {
    return typeof value === 'string' ? value.trim() : fallback;
  }

  function getPath(object, path, fallback) {
    if (!path) return object == null ? fallback : object;
    const parts = String(path).split('.').filter(Boolean);
    let cursor = object;
    for (const part of parts) {
      if (!cursor || typeof cursor !== 'object' || !(part in cursor)) return fallback;
      cursor = cursor[part];
    }
    return cursor == null ? fallback : cursor;
  }

  function setPath(object, path, value) {
    const parts = String(path || '').split('.').filter(Boolean);
    if (!parts.length) return value;
    let cursor = object;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const part = parts[i];
      if (!cursor[part] || typeof cursor[part] !== 'object') cursor[part] = {};
      cursor = cursor[part];
    }
    cursor[parts[parts.length - 1]] = value;
    return object;
  }

  function makeDefaultPkmState(product = DEFAULT_PRODUCT) {
    const at = nowIso();
    return {
      meta: {
        schemaVersion: SCHEMA_VERSION,
        product,
        contentVersion: '0.1.0',
        createdAt: at,
        updatedAt: at
      },
      player: {
        name: '{{user}}',
        trainerProficiency: 0,
        unlocks: {},
        bonds: {}
      },
      party: {
        slots: [null, null, null, null, null, null],
        transferBuffer: null
      },
      box: {
        boxes: [{ id: 'box_01', name: 'Box 1', slots: [] }],
        indexes: {}
      },
      world: {
        location: {},
        time: { day: 1, period: 'morning', derived: calculateDerivedTime(1) },
        weatherGrid: {},
        pokemonSpawns: {},
        phenomenon: { active_type: 'clear', active_region: 'none' }
      },
      npcs: {
        records: {}
      },
      battle: {
        lastConfig: null,
        lastResult: null,
        pendingNarrative: null
      },
      settings: { ...DEFAULT_SETTINGS },
      runtime: {
        migration: {},
        caches: {},
        flags: {}
      }
    };
  }

  function normalizeMoves(moves) {
    if (Array.isArray(moves)) {
      return {
        move1: moves[0] || null,
        move2: moves[1] || null,
        move3: moves[2] || null,
        move4: moves[3] || null
      };
    }
    const source = moves && typeof moves === 'object' ? moves : {};
    return {
      move1: source.move1 || null,
      move2: source.move2 || null,
      move3: source.move3 || null,
      move4: source.move4 || null
    };
  }

  function normalizeFriendship(source) {
    const raw = source && typeof source === 'object' ? source : {};
    const avsRaw = raw.avs || raw;
    const upRaw = raw.av_up || {};
    const avs = {
      trust: clampNumber((avsRaw.trust || 0) + (upRaw.trust || 0), 0, 255, 0),
      passion: clampNumber((avsRaw.passion || 0) + (upRaw.passion || 0), 0, 255, 0),
      insight: clampNumber((avsRaw.insight || 0) + (upRaw.insight || 0), 0, 255, 0),
      devotion: clampNumber((avsRaw.devotion || 0) + (upRaw.devotion || 0), 0, 255, 0)
    };
    return {
      avs,
      av_up: { trust: 0, passion: 0, insight: 0, devotion: 0 }
    };
  }

  function normalizeStatsMeta(source) {
    const raw = source && typeof source === 'object' ? source : {};
    const evLevel = typeof raw.ev_level === 'object'
      ? clone(raw.ev_level, {})
      : clampNumber((raw.ev_level || 0) + (raw.ev_up || 0), 0, 252, 0);
    return {
      ...raw,
      ivs: raw.ivs || { hp: null, atk: null, def: null, spa: null, spd: null, spe: null },
      ev_level: evLevel,
      ev_up: 0
    };
  }

  function normalizePokemon(source, index = 0) {
    if (!source || typeof source !== 'object') return null;
    const name = normalizeString(source.name || source.species || source.nickname, '');
    if (!name) return null;
    return {
      ...clone(source, {}),
      slot: index + 1,
      name,
      species: normalizeString(source.species, name),
      nickname: source.nickname || null,
      lv: clampNumber(source.lv ?? source.level, 1, 100, 5),
      gender: source.gender || null,
      nature: source.nature || null,
      ability: source.ability || null,
      shiny: source.shiny === true,
      item: source.item || null,
      mechanic: source.mechanic || null,
      teraType: source.teraType || null,
      isAce: source.isAce === true,
      isLead: source.isLead === true,
      friendship: normalizeFriendship(source.friendship || source.avs),
      moves: normalizeMoves(source.moves),
      stats_meta: normalizeStatsMeta(source.stats_meta),
      notes: source.notes || null
    };
  }

  function normalizeParty(party) {
    const sourceSlots = Array.isArray(party?.slots)
      ? party.slots
      : [party?.slot1, party?.slot2, party?.slot3, party?.slot4, party?.slot5, party?.slot6];
    const slots = sourceSlots.slice(0, 6).map((slot, index) => normalizePokemon(slot, index));
    while (slots.length < 6) slots.push(null);

    let leadSeen = false;
    for (const slot of slots) {
      if (!slot) continue;
      if (slot.isLead && !leadSeen) {
        leadSeen = true;
      } else {
        slot.isLead = false;
      }
    }
    if (!leadSeen) {
      const first = slots.find(Boolean);
      if (first) first.isLead = true;
    }

    const transferRaw = party?.transferBuffer ?? party?.transfer_buffer;
    return {
      slots,
      transferBuffer: normalizePokemon(transferRaw, 6)
    };
  }

  function normalizeBox(box) {
    if (!box || typeof box !== 'object') {
      return { boxes: [{ id: 'box_01', name: 'Box 1', slots: [] }], indexes: {} };
    }
    if (Array.isArray(box.boxes)) {
      const boxes = box.boxes.map((b, index) => ({
        id: b.id || `box_${String(index + 1).padStart(2, '0')}`,
        name: b.name || `Box ${index + 1}`,
        slots: Array.isArray(b.slots) ? b.slots.map((p, i) => normalizePokemon(p, i)).filter(Boolean) : []
      }));
      return { boxes: boxes.length ? boxes : [{ id: 'box_01', name: 'Box 1', slots: [] }], indexes: box.indexes || {} };
    }
    const slots = Object.entries(box)
      .filter(([key, value]) => key.startsWith('storage_') && value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value], index) => normalizePokemon(value, index))
      .filter(Boolean);
    return {
      boxes: [{ id: 'box_01', name: 'Box 1', slots }],
      indexes: {}
    };
  }

  function calculateDerivedTime(day) {
    const normalizedDay = Math.max(1, Math.round(Number(day) || 1));
    const dayOfYear = ((normalizedDay - 1) % 365) + 1;
    return {
      year: Math.floor((normalizedDay - 1) / 365) + 1,
      month: Math.floor((dayOfYear - 1) / 30) + 1,
      dayOfMonth: ((dayOfYear - 1) % 30) + 1,
      week: Math.floor((normalizedDay - 1) / 7) + 1,
      dayOfWeek: (normalizedDay - 1) % 7
    };
  }

  function parseTimeAdvance(value) {
    if (value == null || value === '') return null;
    if (typeof value === 'number') return { days: value };
    const text = String(value).trim().toLowerCase();
    const periodMatch = text.match(/^(\d+)\s*periods?$/);
    if (periodMatch) return { periods: Number(periodMatch[1]) };
    const dayMatch = text.match(/^(\d+)\s*days?$/);
    if (dayMatch) return { days: Number(dayMatch[1]) };
    const skipMatch = text.match(/^skip[_\s]?to[_\s]?(\w+)$/);
    if (skipMatch && PERIODS.includes(skipMatch[1])) return { skipTo: skipMatch[1] };
    return null;
  }

  function applyTimeAdvance(time, advance) {
    let day = Math.max(1, Math.round(Number(time?.day) || 1));
    let period = PERIODS.includes(time?.period) ? time.period : 'morning';
    if (!advance) return { day, period, derived: calculateDerivedTime(day), day_advance: null, period_set: null };
    if (advance.days) day += Math.max(0, Math.round(advance.days));
    if (advance.periods) {
      const total = PERIODS.indexOf(period) + Math.max(0, Math.round(advance.periods));
      day += Math.floor(total / PERIODS.length);
      period = PERIODS[total % PERIODS.length];
    }
    if (advance.skipTo) {
      const current = PERIODS.indexOf(period);
      const target = PERIODS.indexOf(advance.skipTo);
      if (target <= current) day += 1;
      period = advance.skipTo;
    }
    return { day, period, derived: calculateDerivedTime(day), day_advance: null, period_set: null };
  }

  function normalizeTime(source) {
    const raw = source && typeof source === 'object' ? source : {};
    let next = {
      ...raw,
      day: Math.max(1, Math.round(Number(raw.day) || 1)),
      period: PERIODS.includes(raw.period) ? raw.period : 'morning'
    };
    if (raw.day_advance) next = { ...next, ...applyTimeAdvance(next, parseTimeAdvance(raw.day_advance)) };
    if (raw.period_set && PERIODS.includes(String(raw.period_set).toLowerCase())) {
      next.period = String(raw.period_set).toLowerCase();
      next.period_set = null;
    }
    next.derived = calculateDerivedTime(next.day);
    next.day_advance = null;
    next.period_set = null;
    return next;
  }

  function normalizeNpcRecords(records, playerBonds = {}) {
    const result = {};
    for (const [id, record] of Object.entries(records || {})) {
      if (!record || typeof record !== 'object') continue;
      const love = clampNumber((record.love || 0) + (record.love_up || 0), 0, 999, 0);
      result[id] = {
        ...record,
        love,
        love_up: 0,
        stage: clampNumber(record.stage, 0, 10, 0),
        unlockedBond: record.unlock_key ? playerBonds[record.unlock_key] === true : record.unlockedBond === true
      };
    }
    return result;
  }

  function normalizePkmState(input, product = DEFAULT_PRODUCT) {
    const base = makeDefaultPkmState(product);
    const state = input && typeof input === 'object' ? clone(input, {}) : {};
    const next = {
      ...base,
      ...state,
      meta: {
        ...base.meta,
        ...(state.meta || {}),
        schemaVersion: SCHEMA_VERSION,
        product: state.meta?.product || product,
        updatedAt: nowIso()
      },
      player: {
        ...base.player,
        ...(state.player || {})
      },
      party: normalizeParty(state.party || {}),
      box: normalizeBox(state.box || {}),
      world: {
        ...base.world,
        ...(state.world || {})
      },
      npcs: {
        ...base.npcs,
        ...(state.npcs || {})
      },
      battle: {
        ...base.battle,
        ...(state.battle || {})
      },
      settings: {
        ...DEFAULT_SETTINGS,
        ...(state.settings || {})
      },
      runtime: {
        ...base.runtime,
        ...(state.runtime || {})
      }
    };

    next.player.trainerProficiency = clampNumber(
      (next.player.trainerProficiency || 0) + (next.player.proficiency_up || 0),
      0,
      255,
      0
    );
    next.player.proficiency_up = 0;
    next.world.time = normalizeTime(next.world.time);
    next.npcs.records = normalizeNpcRecords(next.npcs.records, next.player.bonds);
    return next;
  }

  function migrateFromEra(eraVars, product = DEFAULT_PRODUCT) {
    const era = eraVars && typeof eraVars === 'object' ? eraVars : {};
    const defaultState = makeDefaultPkmState(product);
    const player = era.player || {};
    const worldState = era.world_state || {};
    const migrated = {
      ...defaultState,
      meta: {
        ...defaultState.meta,
        product,
        updatedAt: nowIso()
      },
      player: {
        name: player.name || defaultState.player.name,
        trainerProficiency: player.trainerProficiency || 0,
        unlocks: clone(player.unlocks, {}),
        bonds: clone(player.bonds, {})
      },
      party: normalizeParty(player.party || {}),
      box: normalizeBox(player.box || {}),
      world: {
        ...defaultState.world,
        location: clone(worldState.location, {}),
        time: normalizeTime(worldState.time || {}),
        weatherGrid: clone(worldState.weather_grid || worldState.weatherGrid, {}),
        pokemonSpawns: clone(worldState.pokemon_spawns || worldState.pokemonSpawns, {}),
        phenomenon: clone(worldState.phenomenon, defaultState.world.phenomenon)
      },
      npcs: {
        records: normalizeNpcRecords(worldState.npcs || {}, player.bonds || {})
      },
      settings: {
        ...DEFAULT_SETTINGS,
        ...(era.settings || {})
      },
      runtime: {
        ...defaultState.runtime,
        migration: {
          from: 'era',
          migratedAt: nowIso()
        }
      }
    };
    return normalizePkmState(migrated, product);
  }

  function readMessageVariables() {
    if (typeof getVariables !== 'function') return {};
    return getVariables({ type: 'message' }) || {};
  }

  async function updateMessageVariables(updater) {
    if (typeof updateVariablesWith === 'function') {
      return updateVariablesWith(updater, { type: 'message' });
    }
    if (typeof replaceVariables === 'function') {
      const current = readMessageVariables();
      const next = await updater(clone(current, {}));
      replaceVariables(next, { type: 'message' });
      return next;
    }
    throw new Error('MVUZ variable APIs are not available');
  }

  async function loadState(options = {}) {
    const product = options.product || runtime.product || DEFAULT_PRODUCT;
    const vars = readMessageVariables();
    const existing = getPath(vars, `${STATE_ROOT}.${STATE_KEY}`, null);
    if (existing) return normalizePkmState(existing, product);

    if (options.migrate !== false) {
      const eraVars = await getEraVars();
      if (eraVars && Object.keys(eraVars).length) {
        const migrated = migrateFromEra(eraVars, product);
        await saveState(migrated);
        return migrated;
      }
    }
    return makeDefaultPkmState(product);
  }

  async function saveState(nextState) {
    const normalized = normalizePkmState(nextState, nextState?.meta?.product || runtime.product);
    await updateMessageVariables((vars) => {
      const target = vars && typeof vars === 'object' ? vars : {};
      if (!target[STATE_ROOT] || typeof target[STATE_ROOT] !== 'object') target[STATE_ROOT] = {};
      target[STATE_ROOT][STATE_KEY] = normalized;
      return target;
    });
    runtime.lastStateSnapshot = normalized;
    return normalized;
  }

  async function patchState(patcher) {
    const current = await loadState();
    const next = await patcher(clone(current, {}));
    return saveState(next === undefined ? current : next);
  }

  async function getEraVars() {
    return new Promise((resolve) => {
      if (typeof eventEmit === 'undefined' || typeof eventOn === 'undefined') {
        resolve(null);
        return;
      }
      const timeout = setTimeout(() => resolve(null), 3000);
      eventOn('era:queryResult', (detail) => {
        if (detail?.queryType !== 'getCurrentVars') return;
        clearTimeout(timeout);
        resolve(detail.result?.statWithoutMeta || null);
      }, { once: true });
      eventEmit('era:getCurrentVars');
    });
  }

  const actions = {
    async 'settings.update'({ payload }) {
      return patchState((state) => {
        state.settings = { ...state.settings, ...(payload || {}) };
        return state;
      });
    },

    async 'party.setLead'({ payload }) {
      const targetSlot = typeof payload === 'string' ? payload : payload?.slot || payload?.targetSlot;
      return patchState((state) => {
        state.party.slots = state.party.slots.map((pokemon, index) => {
          if (!pokemon) return null;
          const slotKey = `slot${index + 1}`;
          return { ...pokemon, isLead: slotKey === targetSlot || index + 1 === Number(targetSlot) };
        });
        return state;
      });
    },

    async 'party.updateMove'({ payload }) {
      return patchState((state) => {
        const slot = payload?.slotKey || payload?.slot || payload?.targetSlot;
        const index = typeof slot === 'string' && slot.startsWith('slot')
          ? Number(slot.replace('slot', '')) - 1
          : Number(slot) - 1;
        if (!Number.isInteger(index) || index < 0 || index > 5 || !state.party.slots[index]) return state;
        state.party.slots[index].moves = normalizeMoves(payload.moves);
        return state;
      });
    },

    async 'box.depositTransferBuffer'() {
      return patchState((state) => {
        const pokemon = state.party.transferBuffer;
        if (!pokemon) return state;
        if (!state.box.boxes.length) state.box.boxes.push({ id: 'box_01', name: 'Box 1', slots: [] });
        state.box.boxes[0].slots.push({ ...pokemon, slot: null, isLead: false });
        state.party.transferBuffer = null;
        return state;
      });
    }
  };

  async function dispatchAction(action, payload) {
    const handler = actions[action];
    if (!handler) throw new Error(`Unknown PKM action: ${action}`);
    return handler({ payload });
  }

  function stripCodeFence(text) {
    return String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  function parseTaggedJson(text, tag) {
    const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = String(text || '').match(re);
    if (!match) return null;
    try {
      return JSON.parse(stripCodeFence(match[1]));
    } catch (error) {
      console.warn(`${PLUGIN_NAME} Failed to parse <${tag}>`, error);
      return null;
    }
  }

  async function buildCompleteBattleJson(aiBattleData) {
    const state = await loadState();
    return {
      ...(aiBattleData || {}),
      player: {
        name: state.player.name,
        trainerProficiency: state.player.trainerProficiency,
        unlocks: state.player.unlocks,
        party: state.party.slots.filter(Boolean)
      },
      settings: state.settings,
      environment: state.world.phenomenon?.active_type ? {
        phenomenon: state.world.phenomenon,
        weatherGrid: state.world.weatherGrid
      } : undefined
    };
  }

  async function appendFrontendPayload(messageId, payload) {
    if (typeof getChatMessages !== 'function' || typeof setChatMessages !== 'function') return false;
    const messages = getChatMessages(messageId);
    const message = messages && messages[0];
    if (!message) return false;
    const block = `<PKM_FRONTEND>\n${JSON.stringify(payload, null, 2)}\n</PKM_FRONTEND>`;
    await setChatMessages([{
      message_id: messageId,
      message: `${String(message.message || '').trim()}\n\n${block}`
    }], { refresh: 'affected' });
    return true;
  }

  async function handleMessageForBattle(detail) {
    const messageId = detail?.message_id ?? (typeof getLastMessageId === 'function' ? getLastMessageId() : null);
    if (messageId == null || runtime.processedMessages.has(messageId)) return;
    if (typeof getChatMessages !== 'function') return;
    const message = getChatMessages(messageId)[0];
    if (!message?.message || message.message.includes('<PKM_FRONTEND>')) return;
    const battleData = parseTaggedJson(message.message, 'PKM_BATTLE');
    if (!battleData) return;
    const complete = await buildCompleteBattleJson(battleData);
    await appendFrontendPayload(messageId, complete);
    runtime.processedMessages.add(messageId);
  }

  async function injectPromptIfChanged(id, prompt) {
    if (typeof injectPrompts !== 'function') return false;
    try {
      if (typeof uninjectPrompts === 'function') uninjectPrompts([id]);
      injectPrompts([prompt], { once: true });
      return true;
    } catch (error) {
      console.warn(`${PLUGIN_NAME} prompt injection failed:`, id, error);
      return false;
    }
  }

  async function injectGenerationContext() {
    const state = await loadState();
    const partyLines = state.party.slots
      .filter(Boolean)
      .map((pokemon, index) => `${index + 1}. ${pokemon.name} Lv.${pokemon.lv}${pokemon.isLead ? ' [LEAD]' : ''}`)
      .join('\n');
    await injectPromptIfChanged(DEFAULT_INJECT_IDS.party, {
      id: DEFAULT_INJECT_IDS.party,
      position: 'in_chat',
      depth: 0,
      role: 'system',
      should_scan: false,
      content: `<pkm_party_state>\n${partyLines || 'No party data.'}\n</pkm_party_state>`
    });
    const time = state.world.time;
    await injectPromptIfChanged(DEFAULT_INJECT_IDS.time, {
      id: DEFAULT_INJECT_IDS.time,
      position: 'in_chat',
      depth: 0,
      role: 'system',
      should_scan: false,
      content: `<pkm_time_status>\nDAY ${time.day} / ${time.period}\n</pkm_time_status>`
    });
  }

  async function init() {
    if (runtime.initialized) return;
    runtime.initialized = true;
    runtime.product = window.PKM_MVUZ_PRODUCT || DEFAULT_PRODUCT;

    await loadState({ product: runtime.product });

    const onGenerationAfterCommands = async () => {
      await loadState();
      await injectGenerationContext();
    };
    const onMessageUpdated = async (detail) => handleMessageForBattle(detail);
    const onChatChanged = () => runtime.processedMessages.clear();

    runtime.handlers = { onGenerationAfterCommands, onMessageUpdated, onChatChanged };
    if (typeof eventOn === 'function') {
      eventOn('GENERATION_AFTER_COMMANDS', onGenerationAfterCommands);
      eventOn('era:writeDone', onMessageUpdated);
      eventOn('message_updated', onMessageUpdated);
      eventOn('chat_changed', onChatChanged);
    }

    window.PKMPlugin = {
      version: '2.0.0-mvuz-draft',
      loadState,
      saveState,
      patchState,
      dispatchAction,
      migrateFromEra,
      normalizePkmState,
      makeDefaultPkmState,
      async getPlayerParty() {
        const state = await loadState();
        return {
          name: state.player.name,
          party: state.party.slots.filter(Boolean),
          reserve: state.box.boxes.flatMap(box => box.slots || [])
        };
      },
      async setPlayerParty(mode, input) {
        return patchState((state) => {
          if (mode === 'custom' && Array.isArray(input)) {
            state.party.slots = normalizeParty({ slots: input }).slots;
          }
          return state;
        });
      },
      async triggerBattle(aiBattleData) {
        const complete = await buildCompleteBattleJson(aiBattleData);
        if (typeof createChatMessages === 'function') {
          await createChatMessages([{ role: 'assistant', message: `<PKM_FRONTEND>\n${JSON.stringify(complete, null, 2)}\n</PKM_FRONTEND>` }]);
        }
        return complete;
      },
      async getTime() {
        const state = await loadState();
        return state.world.time;
      }
    };

    console.log(`${PLUGIN_NAME} loaded`);
  }

  try {
    await init();
  } catch (error) {
    console.error(`${PLUGIN_NAME} failed to initialize`, error);
  }
})();
