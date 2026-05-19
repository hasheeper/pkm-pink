/**
 * PKM Universal dashboard action API runtime.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const RUNTIME = ROOT.PKMUniversalPluginRuntime || {};
  ROOT.PKMUniversalPluginRuntime = RUNTIME;

  RUNTIME.createActionsApi = function createActionsApi(ctx, stateService) {
    const {
      DEFAULT_SETTINGS,
      DEFAULT_UNLOCKS,
      MAX_PARTY_SIZE
    } = ctx;
    const {
      clampNumber,
      escapeJsonPointerPart,
      isObject,
      normalizeString,
      normalizeMoves,
      normalizePartySlots,
      normalizePokemon,
      normalizeTransferBuffer
    } = ctx.util;
    const {
      patchState,
      saveState
    } = stateService;

    function actionWriteOptions(action, options = {}, paths = ['/pkm'], operationKey = '') {
      const suffix = operationKey ? `:${operationKey}` : '';
      return {
        floorKey: options.floorKey,
        messageId: options.messageId ?? options.message_id,
        operationId: options.operationId || `action:${action}${suffix}`,
        paths: Array.isArray(paths) && paths.length ? paths : ['/pkm']
      };
    }

    function actionObjectKeySuffix(value, fallback = 'state') {
      if (!isObject(value)) return fallback;
      const keys = Object.keys(value).sort();
      return keys.length ? keys.map(escapeJsonPointerPart).join('.') : fallback;
    }

    function getGreetingLocationPayload(payload) {
      const world = isObject(payload?.world) ? payload.world : {};
      return isObject(world.location) ? world.location : null;
    }

    async function dispatchAction(action, payload = {}, options = {}) {
      switch (action) {
        case 'greeting.configure':
          {
            const locationPayload = getGreetingLocationPayload(payload);
            return patchState((state) => {
              if (isObject(payload.unlocks)) {
                Object.keys(DEFAULT_UNLOCKS).forEach((key) => {
                  if (key in payload.unlocks) state.player.unlocks[key] = Boolean(payload.unlocks[key]);
                });
              }
              if (isObject(payload.settings)) {
                Object.keys(DEFAULT_SETTINGS).forEach((key) => {
                  if (key in payload.settings) state.settings[key] = Boolean(payload.settings[key]);
                });
              }
              if (locationPayload) {
                state.world = isObject(state.world) ? state.world : {};
                state.world.location = {
                  region: normalizeString(locationPayload.region, ''),
                  location: normalizeString(locationPayload.location, '')
                };
              }
              return state;
            }, actionWriteOptions(action, options, [
              ...(isObject(payload.unlocks) ? ['/pkm/player/unlocks'] : []),
              ...(isObject(payload.settings)
                ? Object.keys(payload.settings).map((key) => `/pkm/settings/${escapeJsonPointerPart(key)}`)
                : []),
              ...(locationPayload ? ['/pkm/world/location/region', '/pkm/world/location/location'] : [])
            ], [
              isObject(payload.unlocks) ? `unlocks.${actionObjectKeySuffix(payload.unlocks)}` : '',
              isObject(payload.settings) ? `settings.${actionObjectKeySuffix(payload.settings)}` : '',
              locationPayload ? `location.${actionObjectKeySuffix(locationPayload)}` : ''
            ].filter(Boolean).join(':') || 'state'));
          }
        case 'party.setLead':
          return patchState((state) => {
            const slot = clampNumber(payload.slot ?? payload.targetSlot, 1, MAX_PARTY_SIZE, 1);
            state.party.slots.forEach((pokemon, index) => {
              pokemon.isLead = Boolean(pokemon.name) && index + 1 === slot;
            });
            return state;
          }, actionWriteOptions(action, options, ['/pkm/party/slots']));
        case 'settings.update':
          return patchState((state) => {
            state.settings = { ...state.settings, ...(isObject(payload) ? payload : {}) };
            return state;
          }, actionWriteOptions(action, options, isObject(payload)
            ? Object.keys(payload).map((key) => `/pkm/settings/${escapeJsonPointerPart(key)}`)
            : ['/pkm/settings'], actionObjectKeySuffix(payload, 'settings')));
        case 'party.updateMove':
          {
            const slotNumber = clampNumber(payload.slot, 1, MAX_PARTY_SIZE, 1);
            return patchState((state) => {
              const slot = slotNumber - 1;
              const moveIndex = clampNumber(payload.moveIndex ?? payload.index, 1, 4, 1) - 1;
              const moves = normalizeMoves(state.party.slots[slot]?.moves);
              moves[moveIndex] = payload.move || null;
              state.party.slots[slot].moves = moves;
              return state;
            }, actionWriteOptions(action, {
              ...options,
              operationId: options.operationId || `action:party.moves:slot${slotNumber}`
            }, [`/pkm/party/slots/${slotNumber - 1}/moves`]));
          }
        case 'party.updateMoves':
          {
            const slotNumber = clampNumber(payload.slot, 1, MAX_PARTY_SIZE, 1);
            return patchState((state) => {
              const slot = slotNumber - 1;
              if (!state.party.slots[slot]) return state;
              state.party.slots[slot].moves = normalizeMoves(payload.moves);
              return state;
            }, actionWriteOptions(action, {
              ...options,
              operationId: options.operationId || `action:party.moves:slot${slotNumber}`
            }, [`/pkm/party/slots/${slotNumber - 1}/moves`]));
          }
        case 'box.depositTransferBuffer':
          return patchState((state) => {
            const pokemon = normalizeTransferBuffer(state.party.transferBuffer);
            if (!pokemon) return state;
            if (!state.box.boxes?.length) state.box.boxes = [{ id: 'box_01', name: 'Box 1', slots: [] }];
            state.box.boxes[0].slots.push(pokemon);
            state.party.transferBuffer = null;
            return state;
          }, actionWriteOptions(action, options, ['/pkm/party/transferBuffer', '/pkm/box/boxes/0/slots']));
        case 'box.applyTransferMutation':
          return patchState((state) => {
            const box = state.box.boxes?.[0] || { id: 'box_01', name: 'Box 1', slots: [] };
            state.box.boxes = [box, ...(state.box.boxes || []).slice(1)];
            box.slots = Array.isArray(box.slots) ? box.slots : [];

            const partyEdits = isObject(payload.partyEdits) ? payload.partyEdits : {};
            Object.entries(partyEdits).forEach(([slotKey, pokemon]) => {
              const match = String(slotKey).match(/^slot(\d+)$/);
              if (!match) return;
              const slotNumber = clampNumber(match[1], 1, MAX_PARTY_SIZE, 1);
              state.party.slots[slotNumber - 1] = normalizePokemon(pokemon, slotNumber);
            });

            const boxInserts = isObject(payload.boxInserts) ? payload.boxInserts : {};
            Object.keys(boxInserts).sort().forEach((key) => {
              const pokemon = normalizeTransferBuffer(boxInserts[key]);
              if (pokemon) box.slots.push(pokemon);
            });

            const boxEdits = isObject(payload.boxEdits) ? payload.boxEdits : {};
            Object.entries(boxEdits).forEach(([key, pokemon]) => {
              const match = String(key).match(/^storage_(\d+)$/);
              if (!match) return;
              const index = Number(match[1]) - 1;
              const normalized = normalizeTransferBuffer(pokemon);
              if (normalized && index >= 0) box.slots[index] = normalized;
            });

            const boxDeletes = isObject(payload.boxDeletes) ? payload.boxDeletes : {};
            Object.keys(boxDeletes)
              .map((key) => {
                const match = String(key).match(/^storage_(\d+)$/);
                return match ? Number(match[1]) - 1 : -1;
              })
              .filter((index) => index >= 0)
              .sort((a, b) => b - a)
              .forEach((index) => {
                if (index < box.slots.length) box.slots.splice(index, 1);
              });

            state.party.slots = normalizePartySlots(state.party.slots);
            return state;
          }, actionWriteOptions(action, options, ['/pkm/party/slots', '/pkm/box/boxes/0/slots']));
        case 'state.replace':
          return saveState(payload?.state || payload, actionWriteOptions(action, options, ['/pkm']));
        default:
          throw new Error(`Unknown PKM action: ${action}`);
      }
    }

    return {
      dispatchAction
    };
  };
})();
