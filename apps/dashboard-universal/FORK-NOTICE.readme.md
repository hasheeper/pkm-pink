# TODO(PHASE-2): Tavern Plugin Consolidation

This directory contains a forked version of the tavern plugin.
- apps/dashboard-main/ is the full version (actively maintained, last update 2026-03-24)
- apps/dashboard-universal/ is the mini version (possibly abandoned, last update 2026-02-03)

Phase 2 plan:
1. Evaluate if dashboard-universal still has use cases
2. If yes, extract shared code into packages/pkm-st-bridge/
3. If no, archive dashboard-universal to archive/obsolete/
4. Merge tavern-inject.js logic into containers/tavern.html

