/**
 * Stable SillyTavern bridge.
 *
 * ST only needs to load this file. The bridge then loads the selected pack
 * from manifest.json in a deterministic order.
 *
 * Usage:
 *   bridge.js
 *   bridge.js?pack=<manifest-pack-id>
 *
 * Local testing:
 *   window.ST_BRIDGE_PACK = 'pkm-universal';
 *   window.ST_BRIDGE_ENV = 'local';
 *   window.PKM_APP_BASE_URL = 'http://127.0.0.1:4173';
 *   import 'http://127.0.0.1:4173/apps/st-bridge/bridge.js?pack=pkm-universal&env=local&force=1&v=dev';
 */
(async function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const BRIDGE_NAME = '[ST Bridge]';
  const VERSION = '0.1.0';
  const DEFAULT_MANIFEST = './manifest.json';
  const FALLBACK_BRIDGE_URL = 'https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js';
  const PROD_APP_BASE_URL = 'https://hasheeper.github.io/pkm-pink';
  const LOCAL_APP_BASE_URL = 'http://127.0.0.1:4173';
  const TOAST_TITLE = '[PKM]脚本加载';
  const LOADING_TOAST_KEY = '__PKM_ST_BRIDGE_LOADING_TOAST__';
  const DOM_TOAST_HOST_ID = 'pkm-st-bridge-toast-host';

  function getWindowCandidates() {
    const candidates = [ROOT, globalThis];
    try {
      if (ROOT.parent && ROOT.parent !== ROOT) candidates.push(ROOT.parent);
    } catch (_) {}
    try {
      if (ROOT.top && ROOT.top !== ROOT) candidates.push(ROOT.top);
    } catch (_) {}
    return candidates.filter(Boolean);
  }

  function getToastr() {
    for (const candidate of getWindowCandidates()) {
      try {
        if (candidate.toastr && typeof candidate.toastr.info === 'function') return candidate.toastr;
      } catch (_) {}
    }
    try {
      const globalToastr = Function('return typeof toastr !== "undefined" ? toastr : null')();
      if (globalToastr && typeof globalToastr.info === 'function') return globalToastr;
    } catch (_) {}
    return null;
  }

  function getSillyTavern() {
    for (const candidate of getWindowCandidates()) {
      try {
        if (candidate.SillyTavern && typeof candidate.SillyTavern.callGenericPopup === 'function') {
          return candidate.SillyTavern;
        }
      } catch (_) {}
    }
    try {
      const globalSillyTavern = Function('return typeof SillyTavern !== "undefined" ? SillyTavern : null')();
      if (globalSillyTavern && typeof globalSillyTavern.callGenericPopup === 'function') return globalSillyTavern;
    } catch (_) {}
    return null;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function ensureDomToastHost() {
    try {
      const doc = ROOT.document || document;
      if (!doc || !doc.body) return null;
      let host = doc.getElementById(DOM_TOAST_HOST_ID);
      if (host) return host;
      host = doc.createElement('div');
      host.id = DOM_TOAST_HOST_ID;
      host.style.position = 'fixed';
      host.style.top = '12px';
      host.style.right = '12px';
      host.style.zIndex = '2147483647';
      host.style.display = 'grid';
      host.style.gap = '8px';
      host.style.maxWidth = '360px';
      host.style.pointerEvents = 'none';
      doc.body.appendChild(host);
      return host;
    } catch (_) {
      return null;
    }
  }

  function getDomToastColors(level) {
    if (level === 'success') return { border: '#2f9e44', background: '#17351f' };
    if (level === 'warning') return { border: '#f08c00', background: '#3b2a12' };
    if (level === 'error') return { border: '#e03131', background: '#3b1717' };
    return { border: '#228be6', background: '#172b3f' };
  }

  function clearDomToast(handle) {
    try {
      if (!handle || !handle.element) return;
      if (handle.timer) clearTimeout(handle.timer);
      handle.element.remove();
    } catch (_) {}
  }

  function showDomToast(level, message, title, options = {}) {
    const host = ensureDomToastHost();
    if (!host) return null;
    try {
      const doc = host.ownerDocument;
      const colors = getDomToastColors(level);
      const toast = doc.createElement('div');
      toast.setAttribute('role', 'status');
      toast.style.pointerEvents = 'auto';
      toast.style.border = `1px solid ${colors.border}`;
      toast.style.borderLeft = `4px solid ${colors.border}`;
      toast.style.background = colors.background;
      toast.style.color = '#fff';
      toast.style.borderRadius = '6px';
      toast.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.35)';
      toast.style.padding = '10px 12px';
      toast.style.fontSize = '13px';
      toast.style.lineHeight = '1.45';
      toast.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

      const titleEl = doc.createElement('div');
      titleEl.textContent = title || TOAST_TITLE;
      titleEl.style.fontWeight = '700';
      titleEl.style.marginBottom = '4px';
      toast.appendChild(titleEl);

      const messageEl = doc.createElement('div');
      messageEl.textContent = message;
      toast.appendChild(messageEl);

      host.appendChild(toast);
      const handle = { kind: 'dom', element: toast, timer: null };
      if (options.timeOut !== 0) {
        handle.timer = setTimeout(() => clearDomToast(handle), Number(options.timeOut) || 3200);
      }
      return handle;
    } catch (error) {
      console.warn(`${BRIDGE_NAME} DOM toast failed:`, error);
      return null;
    }
  }

  function showGenericPopup(level, message, title) {
    const tavern = getSillyTavern();
    if (!tavern) return null;
    try {
      const popupType = tavern.POPUP_TYPE && tavern.POPUP_TYPE.TEXT || 'text';
      const content = `<strong>${escapeHtml(title || TOAST_TITLE)}</strong><br>${escapeHtml(message)}`;
      tavern.callGenericPopup(content, popupType, '', { wide: false, large: false });
      return { kind: 'popup' };
    } catch (error) {
      console.warn(`${BRIDGE_NAME} popup failed:`, error);
      return null;
    }
  }

  function showToast(level, message, title = TOAST_TITLE, options = {}) {
    const toastr = getToastr();
    if (toastr && typeof toastr[level] === 'function') {
      try {
        const value = toastr[level](message, title, {
          closeButton: true,
          newestOnTop: true,
          progressBar: false,
          escapeHtml: true,
          ...options
        });
        return { kind: 'toastr', api: toastr, value };
      } catch (error) {
        console.warn(`${BRIDGE_NAME} toast failed:`, error);
      }
    }
    if (options.useGenericPopup === true) {
      const popup = showGenericPopup(level, message, title);
      if (popup) return popup;
    }
    return showDomToast(level, message, title, options);
  }

  function clearLoadingToast() {
    const toast = ROOT[LOADING_TOAST_KEY];
    ROOT[LOADING_TOAST_KEY] = null;
    if (!toast) return;
    if (toast.kind === 'dom') {
      clearDomToast(toast);
      return;
    }
    if (toast.kind === 'toastr' && toast.api && typeof toast.api.clear === 'function') {
      try {
        toast.api.clear(toast.value);
      } catch (_) {}
    }
  }

  function showLoadingToast() {
    clearLoadingToast();
    ROOT[LOADING_TOAST_KEY] = showToast('info', '脚本正在加载，请稍后', '[PKM]脚本加载中', {
      timeOut: 0,
      extendedTimeOut: 0,
      tapToDismiss: false
    });
  }

  function showLoadedToast(state) {
    clearLoadingToast();
    const failedOptional = Array.isArray(state?.failedOptional) ? state.failedOptional : [];
    if (failedOptional.length > 0) {
      const names = failedOptional.map((entry) => entry.id || entry.url).filter(Boolean).join(', ');
      showToast(
        'warning',
        `核心脚本加载完成，但部分模块加载失败：${names || '未知模块'}。如果功能异常，请检查网络，或关闭后重新开启脚本。`,
        '[PKM]脚本部分加载失败'
      );
      return;
    }
    showToast('success', '脚本加载完成', '[PKM]脚本加载完成');
  }

  function showFailedToast() {
    clearLoadingToast();
    showToast('error', '脚本加载失败，请检查网络，或关闭后重新开启脚本。', '[PKM]脚本加载失败', {
      timeOut: 0,
      extendedTimeOut: 0,
      tapToDismiss: false,
      useGenericPopup: true
    });
  }

  function isUsableBridgeUrl(value) {
    if (!value || typeof value !== 'string') return false;
    if (!/^https?:\/\//i.test(value)) return false;
    try {
      return new URL(value).pathname.endsWith('/bridge.js');
    } catch (_) {
      return false;
    }
  }

  function getCurrentScriptUrl() {
    try {
      if (isUsableBridgeUrl(document.currentScript?.src)) return document.currentScript.src;
    } catch (_) {}
    try {
      const scripts = Array.from(document.getElementsByTagName('script'));
      const matched = scripts.reverse().find((script) => isUsableBridgeUrl(script.src));
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
    return FALLBACK_BRIDGE_URL;
  }

  function makeBridgeUrl() {
    const rawUrl = getCurrentScriptUrl();
    try {
      return new URL(rawUrl);
    } catch (_) {
      return new URL(FALLBACK_BRIDGE_URL);
    }
  }

  const bridgeUrl = makeBridgeUrl();
  const bridgeRoot = new URL('.', bridgeUrl);
  const params = bridgeUrl.searchParams;
  const cacheBust = params.get('v') || params.get('cache') || '';
  const forceReload = params.get('force') === '1';

  function normalizeString(value, fallback = '') {
    return typeof value === 'string' ? value.trim() : fallback;
  }

  function trimTrailingSlash(value) {
    return normalizeString(value, '').replace(/\/+$/, '');
  }

  function isLocalBridgeUrl(url) {
    try {
      const hostname = String(url.hostname || '').toLowerCase();
      return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
    } catch (_) {
      return false;
    }
  }

  function normalizeEnv(value, fallback = '') {
    const normalized = normalizeString(value, '').toLowerCase();
    if (normalized === 'local' || normalized === 'prod') return normalized;
    return fallback;
  }

  function resolveBridgeProfile() {
    const env = normalizeEnv(
      params.get('env') || ROOT.ST_BRIDGE_ENV,
      isLocalBridgeUrl(bridgeUrl) ? 'local' : 'prod'
    );
    const fallbackAppBaseUrl = env === 'local' ? LOCAL_APP_BASE_URL : PROD_APP_BASE_URL;
    const appBaseUrl = trimTrailingSlash(params.get('appBase') || ROOT.PKM_APP_BASE_URL || fallbackAppBaseUrl) || fallbackAppBaseUrl;
    return {
      env,
      appBaseUrl,
      universalDashboardUrl: `${appBaseUrl}/apps/dashboard-universal/index.html`
    };
  }

  const bridgeProfile = resolveBridgeProfile();

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

  function resolveAppUrl(app, profile = bridgeProfile) {
    const key = normalizeString(app, '').toLowerCase();
    const appBaseUrl = trimTrailingSlash(profile?.appBaseUrl || PROD_APP_BASE_URL) || PROD_APP_BASE_URL;
    if (key === 'dashboard-universal' || key === 'universal-dashboard' || key === 'pkm-universal') {
      return `${appBaseUrl}/apps/dashboard-universal/index.html`;
    }
    throw new Error(`Unknown PKM app "${app}"`);
  }

  function applyGlobals(pack, packId, profile = bridgeProfile) {
    ROOT.ST_BRIDGE_PACK = packId;
    ROOT.ST_BRIDGE_PRODUCT = pack.product || packId;
    ROOT.ST_BRIDGE_ENV = profile.env;
    ROOT.PKM_APP_BASE_URL = profile.appBaseUrl;
    ROOT.PKM_UNIVERSAL_DASHBOARD_URL = resolveAppUrl('dashboard-universal', profile);
    if (pack.globals && typeof pack.globals === 'object') {
      Object.entries(pack.globals).forEach(([key, value]) => {
        ROOT[key] = value;
      });
    }
  }

  function clone(value, fallback = null) {
    if (value === undefined || value === null) return fallback;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_) {
      return fallback;
    }
  }

  function isObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  async function readVariables(options = {}) {
    const type = options.type || 'message';
    if (typeof ROOT.getVariables !== 'function') return {};
    try {
      const vars = await ROOT.getVariables({ type });
      return isObject(vars) ? vars : {};
    } catch (error) {
      console.warn(`${BRIDGE_NAME} readVariables failed:`, error);
      return {};
    }
  }

  async function writeVariables(data, options = {}) {
    const type = options.type || 'message';
    if (typeof ROOT.insertOrAssignVariables !== 'function') {
      throw new Error('insertOrAssignVariables is unavailable');
    }
    await ROOT.insertOrAssignVariables(data, { type });
    return data;
  }

  async function readState(rootKey = 'stat_data', stateKey = null, options = {}) {
    const vars = await readVariables(options);
    if (!stateKey) return isObject(vars?.[rootKey]) ? vars[rootKey] : null;
    return isObject(vars?.[rootKey]?.[stateKey]) ? vars[rootKey][stateKey] : null;
  }

  async function writeState(rootKey = 'stat_data', stateKey = null, state, options = {}) {
    const vars = await readVariables(options);
    if (!stateKey) {
      await writeVariables({ [rootKey]: state }, options);
      try {
        ROOT.dispatchEvent?.(new CustomEvent('st-bridge:state-written', {
          detail: { rootKey, stateKey: null, state }
        }));
      } catch (_) {}
      return state;
    }
    const root = isObject(vars?.[rootKey]) ? vars[rootKey] : {};
    const nextRoot = { ...root, [stateKey]: state };
    await writeVariables({ [rootKey]: nextRoot }, options);
    try {
      ROOT.dispatchEvent?.(new CustomEvent('st-bridge:state-written', {
        detail: { rootKey, stateKey, state }
      }));
    } catch (_) {}
    return state;
  }

  async function patchState(rootKey = 'stat_data', stateKey = null, patcher, options = {}) {
    const current = await readState(rootKey, stateKey, options);
    const draft = clone(current, {});
    const result = await patcher(draft, current);
    return writeState(rootKey, stateKey, result || draft, options);
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
    const existing = isObject(ROOT.STBridge) ? ROOT.STBridge : {};
    const actionHandlers = existing.actionHandlers || {};

    ROOT.STBridge = {
      ...existing,
      version: VERSION,
      state,
      utils: {
        clone,
        isObject,
        resolveUrl,
        resolveAppUrl,
        withCache,
        bridgeRoot: bridgeRoot.href,
        env: state?.env || bridgeProfile.env,
        appBaseUrl: state?.appBaseUrl || bridgeProfile.appBaseUrl,
        universalDashboardUrl: state?.universalDashboardUrl || bridgeProfile.universalDashboardUrl
      },
      mvu: {
        readVariables,
        writeVariables,
        readState,
        writeState,
        patchState
      },
      actionHandlers,
      registerActions(namespace, handlers) {
        if (!namespace || !isObject(handlers)) return;
        actionHandlers[namespace] = {
          ...(actionHandlers[namespace] || {}),
          ...handlers
        };
      },
      async dispatch(namespace, action, payload = {}) {
        const handler = actionHandlers?.[namespace]?.[action];
        if (typeof handler !== 'function') {
          throw new Error(`No STBridge action handler for ${namespace}.${action}`);
        }
        return handler(payload);
      },
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
    const registryKey = [
      manifestUrl,
      packId,
      bridgeProfile.env,
      bridgeProfile.appBaseUrl
    ].join('::');

    if (registry[registryKey] && !forceReload) {
      console.log(`${BRIDGE_NAME} ${packId} already loaded; add ?force=1 to reload`);
      exposeApi(registry[registryKey]);
      showLoadedToast(registry[registryKey]);
      return registry[registryKey];
    }

    applyGlobals(pack, packId, bridgeProfile);

    const state = {
      bridgeVersion: VERSION,
      manifestUrl,
      manifestVersion: manifest.version || '',
      packId,
      product: pack.product || packId,
      label: pack.label || packId,
      env: bridgeProfile.env,
      appBaseUrl: bridgeProfile.appBaseUrl,
      universalDashboardUrl: bridgeProfile.universalDashboardUrl,
      loaded: [],
      failedOptional: [],
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
        state.failedOptional.push({
          id: entry.id || '',
          url: entry.url || '',
          message: error?.message || String(error)
        });
      }
    }

    try {
      ROOT.dispatchEvent?.(new CustomEvent('st-bridge:loaded', { detail: state }));
    } catch (_) {}
    console.log(`${BRIDGE_NAME} loaded ${packId}`, state);
    showLoadedToast(state);
    return state;
  }

  try {
    showLoadingToast();
    await main();
  } catch (error) {
    console.error(`${BRIDGE_NAME} startup failed:`, error);
    showFailedToast();
    throw error;
  }
})();
