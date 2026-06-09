import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  clone,
  createRuntimeSandbox,
  loadCommonRuntime,
  loadCore,
  loadSchema
} from '../helpers/load-pack-runtime.mjs';

function schemaRuntimeName(product) {
  return product === 'universal' ? 'PKMUniversalSchemaRuntime' : 'PKMMainSchemaRuntime';
}

function pokemonMode(product) {
  return product === 'universal' ? 'bonds' : 'avs';
}

function makePokemon(name, index = 1) {
  return {
    slot: index,
    name,
    species: name,
    lv: 12 + index,
    gender: index % 2 ? 'F' : 'M',
    quality: 'medium',
    moves: ['Tackle', 'Growl', null, null]
  };
}

function makeTransferPokemon(name = 'Tyranitar') {
  return {
    name,
    species: name,
    lv: 95,
    gender: 'N',
    quality: 'perfect',
    shiny: true,
    moves: ['Dragon Dance', 'Stone Edge', 'Crunch', 'Earthquake'],
    stats_meta: {
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      ev_level: 237
    }
  };
}

function makeFullParty() {
  return ['Sprigatito', 'Pawmi', 'Wooper', 'Fletchling', 'Shinx', 'Azurill']
    .map((name, index) => makePokemon(name, index + 1));
}

function createMemoryStateService(ctx, initialState) {
  let state = clone(initialState, {});
  return {
    getState() {
      return clone(state, {});
    },
    async loadState() {
      return clone(state, {});
    },
    async saveState(nextState) {
      state = clone(nextState, {});
      return clone(state, {});
    },
    async patchState(patcher) {
      const draft = clone(state, {});
      const result = await patcher(draft);
      state = clone(result || draft, {});
      return clone(state, {});
    }
  };
}

function extractFirstJsonPatch(message) {
  const match = String(message || '').match(/<JSONPatch>([\s\S]*?)<\/JSONPatch>/i);
  assert.ok(match, 'expected a JSONPatch block');
  return JSON.parse(match[1].trim());
}

test('main and universal schemas accept camel and snake transfer buffer fields', async () => {
  for (const product of ['main', 'universal']) {
    for (const field of ['transferBuffer', 'transfer_buffer']) {
      const context = createRuntimeSandbox();
      await loadCore(context);
      const runtime = await loadSchema(context, product);
      const transfer = makeTransferPokemon(`${product}-${field}`);
      const normalized = runtime.normalizePkmState({
        party: {
          slots: makeFullParty(),
          [field]: transfer
        }
      });

      assert.equal(normalized.party.transferBuffer.name, transfer.name);
      assert.equal(normalized.party.transferBuffer.isLead, false);
    }
  }
});

test('box.depositTransferBuffer deposits once and clears both buffer aliases', async () => {
  const context = createRuntimeSandbox();
  const { common } = await loadCommonRuntime(context, 'main');
  const ctx = common.createPackContext({
    product: 'main',
    schemaRuntimeName: schemaRuntimeName('main'),
    pokemonMode: pokemonMode('main')
  });
  const transfer = makeTransferPokemon();
  const initial = ctx.util.normalizePkmState({
    party: {
      slots: makeFullParty(),
      transferBuffer: transfer
    },
    box: { boxes: [{ id: 'box_01', name: 'Box 1', slots: [] }] }
  });
  initial.party.transfer_buffer = clone(transfer, transfer);

  const stateService = createMemoryStateService(ctx, initial);
  const actions = common.createActionsApi(ctx, stateService);

  await actions.dispatchAction('box.depositTransferBuffer');
  const state = stateService.getState();

  assert.equal(state.box.boxes[0].slots.length, 1);
  assert.equal(state.box.boxes[0].slots[0].name, 'Tyranitar');
  assert.equal(state.party.transferBuffer, null);
  assert.equal(state.party.transfer_buffer, null);

  await actions.dispatchAction('box.depositTransferBuffer');
  const repeatedState = stateService.getState();
  assert.equal(repeatedState.box.boxes[0].slots.length, 1);
});

test('concurrent transfer deposits are serialized and do not duplicate box entries', async () => {
  const context = createRuntimeSandbox();
  const { common } = await loadCommonRuntime(context, 'main');
  const ctx = common.createPackContext({
    product: 'main',
    schemaRuntimeName: schemaRuntimeName('main'),
    pokemonMode: pokemonMode('main')
  });
  const transfer = makeTransferPokemon();
  const initial = ctx.util.normalizePkmState({
    party: {
      slots: makeFullParty(),
      transferBuffer: transfer
    },
    box: { boxes: [{ id: 'box_01', name: 'Box 1', slots: [] }] }
  });
  initial.party.transfer_buffer = clone(transfer, transfer);

  const stateService = createMemoryStateService(ctx, initial);
  const actions = common.createActionsApi(ctx, stateService);

  await Promise.all([
    actions.dispatchAction('box.depositTransferBuffer'),
    actions.dispatchAction('box.depositTransferBuffer')
  ]);

  const state = stateService.getState();
  assert.equal(state.box.boxes[0].slots.length, 1);
  assert.equal(state.box.boxes[0].slots[0].name, 'Tyranitar');
  assert.equal(state.party.transferBuffer, null);
  assert.equal(state.party.transfer_buffer, null);
});

test('state replay emits remove patches when a tracked path disappears', async () => {
  const context = createRuntimeSandbox({
    variables: {
      schema: {},
      stat_data: {
        pkm: {
          party: {
            transferBuffer: makeTransferPokemon('BufferMon')
          }
        }
      }
    },
    messages: [{ message_id: 0, message: 'baseline <StatusPlaceHolderImpl/>' }]
  });
  const { common } = await loadCommonRuntime(context, 'main');
  const ctx = common.createPackContext({
    product: 'main',
    schemaRuntimeName: schemaRuntimeName('main'),
    pokemonMode: pokemonMode('main')
  });
  const replay = common.createStateReplay(ctx, { replayBlockFormat: 'compact' });

  const result = await replay.commitPkmReplayPatch({
    messageId: 0,
    operationId: 'test:remove-transfer-buffer',
    afterStatData: { pkm: { party: {} } },
    paths: ['/pkm/party/transferBuffer']
  });

  assert.equal(result.ok, true);
  assert.equal(result.patchCount, 1);
  const message = context.getChatMessages(0)[0].message;
  assert.deepEqual(extractFirstJsonPatch(message), [
    { op: 'remove', path: '/pkm/party/transferBuffer' }
  ]);
});

test('legacy dashboard shape exposes transfer buffer and box slots for old UI', async () => {
  const context = createRuntimeSandbox();
  await loadCore(context);
  const dashboard = context.PKMPackCore.legacyDashboardShape({
    player: { name: 'Yota' },
    party: {
      slots: makeFullParty(),
      transferBuffer: makeTransferPokemon('Tyranitar')
    },
    box: {
      boxes: [
        {
          id: 'box_01',
          name: 'Box 1',
          slots: [makeTransferPokemon('Lapras')]
        }
      ]
    },
    settings: { enableAVS: true },
    world: { location: { region: 'B' } }
  });

  assert.equal(dashboard.party.transfer_buffer.name, 'Tyranitar');
  assert.equal(dashboard.player.party.transfer_buffer.name, 'Tyranitar');
  assert.equal(dashboard.box.storage_01.name, 'Lapras');
  assert.equal(dashboard.player.box.storage_01.name, 'Lapras');
});
