/**
 * PKM PINK Universal - dashboard host adapter.
 */
(function () {
  'use strict';

  const ROOT = typeof window !== 'undefined' ? window : globalThis;

  if (typeof ROOT.PKMCommonRuntime?.startDashboardHost !== 'function') {
    throw new Error('[PKM Universal Dashboard MVUZ] requires PKMCommonRuntime.startDashboardHost. Load pkm-common/dashboard-host.mvuz.js before this script.');
  }

  ROOT.PKMCommonRuntime.startDashboardHost({
    product: 'universal',
    version: '0.1.1-mvuz-universal',
    pluginName: '[PKM Universal Dashboard MVUZ]',
    dashboardPath: 'apps/dashboard-universal/index.html',
    dashboardUrlGlobal: 'PKM_UNIVERSAL_DASHBOARD_URL',
    defaultGreetingSource: 'greeting-universal',
    enableTransferBufferCheck: true,
    adaptDashboardState(state, helpers) {
      return helpers.toLegacyDashboardView(state);
    }
  });
})();
