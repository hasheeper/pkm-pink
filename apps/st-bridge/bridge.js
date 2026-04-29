/**
 * PKM Pink / AceZero stable SillyTavern bridge.
 *
 * ST only needs to load this file. The bridge then loads the selected pack
 * from manifest.json in a deterministic order.
 *
 * Usage:
 *   bridge.js
 *   bridge.js?pack=pkm-universal
 *   bridge.js?pack=pkm-main
 *   bridge.js?pack=acezero
 */
(async function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const BRIDGE_NAME = '[ST Bridge]';
  const VERSION = '0.1.0';
  const DEFAULT_MANIFEST = './manifest.json';
  const DEFAULT_BRIDGE_URL = 'https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js';

  function isUsableBridgeUrl(value) {
    if (!value || typeof value !== 'string') return false;
    if (!/^https?:\/\//i.test(value)) return false;
    return value.includes('/apps/st-bridge/bridge.js');
  }

  function getCurrentScriptUrl() {
    try {
      if (isUsableBridgeUrl(document.currentScript?.src)) return document.currentScript.src;
    } catch (_) {}
    try {
      const scripts = Array.from(document.getElementsByTagName('script'));
      const matched = scripts.reverse().find((script) => String(script.src || '').includes('/apps/st-bridge/bridge.js'));
      if (isUsableBridgeUrl(matched?.src)) return matched.src;
    } catch (_) {}
    try {
      const resources = performance.getEntriesByType?.('resource') || [];
      const matched = resources
        .map((entry) => entry.name)
        .reverse()
        .find((name) => isUsableBridgeUrl(name));
      if (matched) return matched;
    } catch (_) {}
    try {
      if (isUsableBridgeUrl(ROOT.ST_BRIDGE_URL)) return ROOT.ST_BRIDGE_URL;
    } catch (_) {}
    return DEFAULT_BRIDGE_URL;
  }

  function makeBridgeUrl() {
    const rawUrl = getCurrentScriptUrl();
    try {
      return new URL(rawUrl);
    } catch (_) {
      return new URL(DEFAULT_BRIDGE_URL);
    }
  }

  const bridgeUrl = makeBridgeUrl();
  const bridgeRoot = new URL('.', bridgeUrl);
  const params = bridgeUrl.searchParams;
  const cacheBust = params.get('v') || params.get('cache') || '';
  const forceReload = params.get('force') === '1';

  function withCache(url) {
    if (!cacheBust) return url;
    const next = new URL(url);
    next.searchParams.set('_st_bridge_v', cacheBust);
    return next.href;
  }

  function resolveUrl(path, base = bridgeRoot.href) {
    return new URL(path, base).href;
  }

  async function fetchJson(url) {
    const response = await fetch(withCache(url), { cache: cacheBust ? 'reload' : 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status} while loading ${url}`);
    return response.json();
  }

  async function fetchText(url) {
    const response = await fetch(withCache(url), { cache: cacheBust ? 'reload' : 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status} while loading ${url}`);
    return response.text();
  }

  function getManifestUrl() {
    const explicit = params.get('manifest') || ROOT.ST_BRIDGE_MANIFEST_URL;
    return explicit ? resolveUrl(explicit, bridgeRoot.href) : resolveUrl(DEFAULT_MANIFEST, bridgeRoot.href);
  }

  function selectPack(manifest) {
    const requested = params.get('pack') || ROOT.ST_BRIDGE_PACK || manifest.activePack || manifest.defaultPack;
    const pack = manifest.packs?.[requested];
    if (!pack) {
      const available = Object.keys(manifest.packs || {}).join(', ') || '(none)';
      throw new Error(`Unknown pack "${requested}". Available packs: ${available}`);
    }
    return { id: requested, pack };
  }

  function applyGlobals(pack, packId) {
    ROOT.ST_BRIDGE_PACK = packId;
    ROOT.ST_BRIDGE_PRODUCT = pack.product || packId;
    if (pack.globals && typeof pack.globals === 'object') {
      Object.entries(pack.globals).forEach(([key, value]) => {
        ROOT[key] = value;
      });
    }
  }

  function getLoadedRegistry() {
    if (!ROOT.__ST_BRIDGE_LOADED__ || typeof ROOT.__ST_BRIDGE_LOADED__ !== 'object') {
      ROOT.__ST_BRIDGE_LOADED__ = {};
    }
    return ROOT.__ST_BRIDGE_LOADED__;
  }

  async function importModule(url) {
    const target = withCache(url);
    try {
      return await import(target);
    } catch (firstError) {
      const source = await fetchText(url);
      const blob = new Blob([source], { type: 'text/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      try {
        return await import(blobUrl);
      } catch (secondError) {
        secondError.cause = firstError;
        throw secondError;
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    }
  }

  async function runClassicScript(url, scriptId) {
    const source = await fetchText(url);
    const sourceUrl = `\n//# sourceURL=${url}`;
    (0, eval)(`${source}${sourceUrl}`);
    return { id: scriptId, url };
  }

  async function loadScript(entry, manifestUrl) {
    const type = entry.type || 'script';
    const url = resolveUrl(entry.url, manifestUrl);
    console.log(`${BRIDGE_NAME} loading ${entry.id || type}: ${url}`);

    if (type === 'module') {
      await importModule(url);
      return { id: entry.id, type, url };
    }
    if (type === 'script' || type === 'classic') {
      return runClassicScript(url, entry.id);
    }
    throw new Error(`Unsupported script type "${type}" for ${entry.id || entry.url}`);
  }

  function exposeApi(state) {
    ROOT.STBridge = {
      version: VERSION,
      state,
      reload() {
        const next = new URL(bridgeUrl.href);
        next.searchParams.set('force', '1');
        next.searchParams.set('v', String(Date.now()));
        return import(next.href);
      }
    };
  }

  async function main() {
    const manifestUrl = getManifestUrl();
    const manifest = await fetchJson(manifestUrl);
    const { id: packId, pack } = selectPack(manifest);
    const registry = getLoadedRegistry();
    const registryKey = `${manifestUrl}::${packId}`;

    if (registry[registryKey] && !forceReload) {
      console.log(`${BRIDGE_NAME} ${packId} already loaded; add ?force=1 to reload`);
      exposeApi(registry[registryKey]);
      return registry[registryKey];
    }

    applyGlobals(pack, packId);

    const state = {
      bridgeVersion: VERSION,
      manifestUrl,
      manifestVersion: manifest.version || '',
      packId,
      product: pack.product || packId,
      label: pack.label || packId,
      loaded: [],
      loadedAt: new Date().toISOString()
    };
    registry[registryKey] = state;
    exposeApi(state);

    for (const entry of pack.scripts || []) {
      try {
        const result = await loadScript(entry, manifestUrl);
        state.loaded.push(result);
      } catch (error) {
        console.error(`${BRIDGE_NAME} failed to load ${entry.id || entry.url}:`, error);
        if (entry.required !== false) throw error;
      }
    }

    try {
      ROOT.dispatchEvent?.(new CustomEvent('st-bridge:loaded', { detail: state }));
    } catch (_) {}
    console.log(`${BRIDGE_NAME} loaded ${packId}`, state);
    return state;
  }

  try {
    await main();
  } catch (error) {
    console.error(`${BRIDGE_NAME} startup failed:`, error);
    throw error;
  }
})();
