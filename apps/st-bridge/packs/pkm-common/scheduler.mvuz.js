/**
 * PKM common async scheduling helpers.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const COMMON = ROOT.PKMCommonRuntime || {};
  ROOT.PKMCommonRuntime = COMMON;

  COMMON.createScheduler = function createScheduler(namespace = 'pkm') {
    const timers = new Set();
    const disposers = new Set();

    function logError(label, error) {
      console.error(`[PKM Scheduler:${namespace}] ${label || 'task'} failed:`, error);
    }

    function setTimer(callback, delayMs = 0, label = '') {
      let timer = null;
      const cancel = () => {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
        timers.delete(cancel);
      };
      timer = setTimeout(() => {
        cancel();
        try {
          const result = callback();
          if (result && typeof result.catch === 'function') result.catch((error) => logError(label, error));
        } catch (error) {
          logError(label, error);
        }
      }, Math.max(0, Number(delayMs) || 0));
      timers.add(cancel);
      return cancel;
    }

    function debounceTrailing(fn, options = {}) {
      const delayMs = Math.max(0, Number(options.delayMs) || 0);
      const maxWaitMs = Math.max(delayMs, Number(options.maxWaitMs) || 0);
      const label = options.label || fn?.name || 'debounce';
      let delayCancel = null;
      let maxCancel = null;
      let firstAt = 0;
      let latestArgs = [];
      let latestThis = null;

      const clear = () => {
        if (delayCancel) delayCancel();
        if (maxCancel) maxCancel();
        delayCancel = null;
        maxCancel = null;
        firstAt = 0;
      };

      const invoke = () => {
        const args = latestArgs;
        const thisArg = latestThis;
        clear();
        return fn.apply(thisArg, args);
      };

      const debounced = function debouncedTask(...args) {
        latestArgs = args;
        latestThis = this;
        if (!firstAt) firstAt = Date.now();
        if (delayCancel) delayCancel();
        delayCancel = setTimer(invoke, delayMs, label);
        if (maxWaitMs > 0 && !maxCancel) {
          const elapsed = Date.now() - firstAt;
          maxCancel = setTimer(invoke, Math.max(0, maxWaitMs - elapsed), `${label}:maxWait`);
        }
      };
      debounced.cancel = clear;
      disposers.add(clear);
      return debounced;
    }

    function singleFlight(fn, options = {}) {
      const label = options.label || fn?.name || 'singleFlight';
      let inFlight = null;
      return function singleFlightTask(...args) {
        if (inFlight) return inFlight;
        inFlight = Promise.resolve()
          .then(() => fn.apply(this, args))
          .catch((error) => {
            logError(label, error);
            throw error;
          })
          .finally(() => {
            inFlight = null;
          });
        return inFlight;
      };
    }

    function coalesceLatest(fn, options = {}) {
      const label = options.label || fn?.name || 'coalesceLatest';
      let inFlight = null;
      let dirty = false;
      let latestArgs = [];
      let latestThis = null;
      let latestPromise = null;
      let latestResolve = null;
      let latestReject = null;

      function ensureLatestPromise() {
        if (!latestPromise) {
          latestPromise = new Promise((resolve, reject) => {
            latestResolve = resolve;
            latestReject = reject;
          });
        }
        return latestPromise;
      }

      async function run(thisArg, args) {
        try {
          let result = await fn.apply(thisArg, args);
          while (dirty) {
            dirty = false;
            const nextArgs = latestArgs;
            const nextThis = latestThis;
            latestArgs = [];
            latestThis = null;
            result = await fn.apply(nextThis, nextArgs);
          }
          if (latestResolve) latestResolve(result);
          return result;
        } catch (error) {
          logError(label, error);
          if (latestReject) latestReject(error);
          throw error;
        } finally {
          inFlight = null;
          latestPromise = null;
          latestResolve = null;
          latestReject = null;
        }
      }

      return function coalescedTask(...args) {
        if (inFlight) {
          dirty = true;
          latestArgs = args;
          latestThis = this;
          return ensureLatestPromise();
        }
        inFlight = run(this, args);
        return inFlight;
      };
    }

    function serialQueue(fn, options = {}) {
      const label = options.label || fn?.name || 'serialQueue';
      const ttlMs = Math.max(0, Number(options.ttlMs) || 0);
      const cache = new Map();
      let tail = Promise.resolve();

      return function queuedTask(key, ...args) {
        const cacheKey = key ? String(key) : '';
        const now = Date.now();
        if (cacheKey && ttlMs > 0) {
          const entry = cache.get(cacheKey);
          if (entry && now - entry.at <= ttlMs) return entry.promise;
        }
        const task = tail
          .catch(() => {})
          .then(() => fn.apply(this, args))
          .catch((error) => {
            logError(label, error);
            throw error;
          });
        tail = task;
        if (cacheKey && ttlMs > 0) {
          cache.set(cacheKey, { at: now, promise: task });
          setTimer(() => {
            const entry = cache.get(cacheKey);
            if (entry?.promise === task) cache.delete(cacheKey);
          }, ttlMs + 50, `${label}:ttl`);
        }
        return task;
      };
    }

    function ttlDedupe(options = {}) {
      const ttlMs = Math.max(0, Number(options.ttlMs) || 1000);
      const map = new Map();
      return {
        has(key) {
          const normalized = String(key || '');
          if (!normalized) return false;
          const now = Date.now();
          const at = map.get(normalized);
          if (!at) return false;
          if (now - at > ttlMs) {
            map.delete(normalized);
            return false;
          }
          return true;
        },
        remember(key) {
          const normalized = String(key || '');
          if (!normalized) return false;
          map.set(normalized, Date.now());
          setTimer(() => map.delete(normalized), ttlMs + 50, 'ttlDedupe');
          return true;
        },
        check(key) {
          if (this.has(key)) return true;
          this.remember(key);
          return false;
        },
        clear() {
          map.clear();
        }
      };
    }

    function disposeAll() {
      Array.from(timers).forEach((cancel) => cancel());
      timers.clear();
      Array.from(disposers).forEach((dispose) => {
        try { dispose(); } catch (_) {}
      });
      disposers.clear();
    }

    return {
      setTimer,
      debounceTrailing,
      singleFlight,
      coalesceLatest,
      serialQueue,
      ttlDedupe,
      disposeAll
    };
  };
})();
