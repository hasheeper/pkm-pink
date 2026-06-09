import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import path from 'node:path';
import {
  createRuntimeSandbox,
  listBridgeSourceFiles,
  loadCore,
  loadSchema,
  ST_BRIDGE_ROOT
} from './helpers/load-pack-runtime.mjs';

test('bridge source files pass node syntax checks', async () => {
  const files = await listBridgeSourceFiles();
  assert.ok(files.includes('bridge.js'));
  assert.ok(files.includes('packs/pkm-core.js'));

  for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', path.join(ST_BRIDGE_ROOT, file)], {
      cwd: ST_BRIDGE_ROOT,
      encoding: 'utf8'
    });
    assert.equal(
      result.status,
      0,
      `${file} failed syntax check\n${result.stdout || ''}${result.stderr || ''}`
    );
  }
});

test('schema modules load with test MVU-zod stubs', async () => {
  for (const product of ['main', 'universal']) {
    const context = createRuntimeSandbox();
    await loadCore(context);
    const runtime = await loadSchema(context, product);
    assert.equal(typeof runtime.normalizePkmState, 'function');
    assert.ok(context.__memory.registeredSchemas.length >= 1);
  }
});
