import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  clone,
  createRuntimeSandbox,
  loadDashboardRuntime
} from '../helpers/load-pack-runtime.mjs';

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

function makeState(party = {}) {
  return {
    player: { name: 'Yota' },
    party,
    box: { boxes: [{ id: 'box_01', name: 'Box 1', slots: [] }] },
    settings: { enableAVS: true },
    world: { location: { region: 'B' } },
    npcs: { records: {} }
  };
}

function createDeferred() {
  let resolve = null;
  let reject = null;
  const promise = new Promise((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });
  return { promise, resolve, reject };
}

async function createDashboardHarness(options = {}) {
  const context = createRuntimeSandbox({
    manualTimers: true,
    messages: [{ message_id: 7, message: 'latest' }]
  });
  await loadDashboardRuntime(context, 'main');

  let state = clone(options.state, makeState());
  const calls = [];
  const loadCalls = [];
  context.PKMPlugin = {
    async loadState(loadOptions = {}) {
      loadCalls.push(clone(loadOptions, loadOptions));
      return clone(state, state);
    },
    async dispatchAction(action, payload = {}, meta = {}) {
      calls.push({
        action,
        payload: clone(payload, payload),
        meta: clone(meta, meta)
      });
      if (typeof options.onDispatch === 'function') {
        return options.onDispatch({ action, payload, meta, calls, getState: () => state, setState: (next) => { state = next; } });
      }
      if (options.dispatchRejects) throw new Error(options.dispatchRejects);
      if (options.dispatchFails) return { ok: false, reason: options.dispatchFails };
      state = makeState({});
      return { ok: true, state: clone(state, state) };
    }
  };

  const helpers = context.PKMCommonRuntime.startDashboardHost({
    product: 'main',
    version: 'test',
    pluginName: '[PKM Dashboard Test]',
    enableTransferBufferCheck: true
  });
  await context.__memory.timers.tick(0);

  return {
    context,
    helpers,
    calls,
    loadCalls,
    getState: () => clone(state, state),
    setState: (next) => { state = clone(next, next); },
    async fire(type, detail = {}) {
      context.dispatchEvent(new context.CustomEvent(type, { detail }));
      await Promise.resolve();
    },
    async tick(ms) {
      await context.__memory.timers.tick(ms);
      await Promise.resolve();
    },
    async runTransferTimers() {
      await context.__memory.timers.tick(120);
      await context.__memory.timers.tick(250);
      await context.__memory.timers.tick(650);
      await context.__memory.timers.tick(1300);
      await Promise.resolve();
    }
  };
}

test('dashboard host deposits camel transferBuffer after state change', async () => {
  const harness = await createDashboardHarness({
    state: makeState({ transferBuffer: makeTransferPokemon('Tyranitar') })
  });

  await harness.fire('pkm:stateChanged');
  await harness.runTransferTimers();

  assert.equal(harness.calls.length, 1);
  assert.equal(harness.calls[0].action, 'box.depositTransferBuffer');
  assert.equal(harness.calls[0].meta.suppressResult, true);
  assert.equal(harness.calls[0].meta.floorKey, 'message:7');
});

test('dashboard host deposits snake transfer_buffer after state written event', async () => {
  const harness = await createDashboardHarness({
    state: makeState({ transfer_buffer: makeTransferPokemon('Lapras') })
  });

  await harness.fire('st-bridge:state-written');
  await harness.runTransferTimers();

  assert.equal(harness.calls.length, 1);
  assert.equal(harness.calls[0].action, 'box.depositTransferBuffer');
  assert.equal(harness.calls[0].meta.suppressResult, true);
});

test('rapid transfer checks do not duplicate after buffer is cleared', async () => {
  const harness = await createDashboardHarness({
    state: makeState({ transferBuffer: makeTransferPokemon('Tyranitar') })
  });

  await harness.fire('pkm:stateChanged');
  await harness.fire('pkm:stateChanged');
  await harness.fire('st-bridge:state-written');
  await harness.runTransferTimers();
  await harness.runTransferTimers();

  assert.equal(harness.calls.length, 1);
});

test('in-flight transfer signature prevents duplicate dispatch', async () => {
  const deferred = createDeferred();
  const harness = await createDashboardHarness({
    state: makeState({ transferBuffer: makeTransferPokemon('Tyranitar') }),
    onDispatch: () => deferred.promise
  });

  await harness.fire('pkm:stateChanged');
  await harness.tick(120);
  await harness.tick(250);
  assert.equal(harness.calls.length, 1);

  await harness.fire('pkm:stateChanged');
  await harness.tick(120);
  await harness.tick(250);
  assert.equal(harness.calls.length, 1);

  deferred.resolve({ ok: true, state: makeState({}) });
  await Promise.resolve();
});

test('dashboard transfer check skips empty buffers', async () => {
  const harness = await createDashboardHarness({
    state: makeState({})
  });

  await harness.fire('pkm:stateChanged');
  await harness.runTransferTimers();

  assert.equal(harness.calls.length, 0);
});

test('failed transfer dispatch can be retried on the next check', async () => {
  let attempts = 0;
  const harness = await createDashboardHarness({
    state: makeState({ transferBuffer: makeTransferPokemon('Tyranitar') }),
    onDispatch: () => {
      attempts += 1;
      if (attempts === 1) return { ok: false, reason: 'temporary_failure' };
      harness.setState(makeState({}));
      return { ok: true, state: makeState({}) };
    }
  });

  await harness.fire('pkm:stateChanged');
  await harness.runTransferTimers();
  assert.equal(harness.calls.length, 2);

  harness.setState(makeState({ transferBuffer: makeTransferPokemon('Tyranitar') }));
  await harness.fire('pkm:stateChanged');
  await harness.runTransferTimers();

  assert.equal(harness.calls.length, 3);
});
