# PKM Pink Architecture

## Design Principles

1. **Directory governance over code refactoring**: Move things into the right place before rewriting them.
2. **Single source of truth for routing**: `registry/apps.json` is the only place that defines app entries.
3. **Container isolation**: All external injectors (Tavern, iframe embeds) go through `containers/` instead of directly loading apps.
4. **Preserve legacy, don't merge yet**: Keep `dashboard-main` and `dashboard-universal` separate in Phase 1.

## Directory Structure

```
pkm-pink/
├── index.html              # Unified entry / app selector
├── registry/
│   └── apps.json           # Canonical app registry
│
├── containers/             # Thin HTML shells for embedding
│   ├── app.html            # Generic app container (?app=xxx)
│   └── tavern.html         # Tavern AI inject container (?target=xxx)
│
├── apps/                   # Business applications
│   ├── battle-sim/         # Vite-based battle engine (was pkm12/pkm33)
│   ├── dashboard-main/     # Full tavern dashboard (was pkm13/pkm55)
│   ├── dashboard-universal/# Mini tavern dashboard (was pkm21)
│   └── tactical-map/       # RHODIA tactical map (was pkm15)
│
├── packages/               # Shared / prototype code
│   └── commander-ui-legacy/# Commander V2 prototype (was pkm14)
│                           # Already merged into battle-sim/cmd/
│
├── docs/                   # Documentation
│   ├── audit/              # Structure audit reports
│   ├── ARCHITECTURE.md     # This file
│   └── migration-notes.md  # Migration decisions and debt
│
├── archive/                # Obsolete / backup materials
│   ├── obsolete/
│   └── backups/
│
└── scripts/                # Build / check utilities
    ├── sync-static.js      # Copy static apps to deploy dir (future)
    ├── check-links.js      # Verify dead links (future)
    └── build-index.js      # Generate entry page from registry (future)
```

## Layer Responsibilities

### 1. Registry Layer
`registry/apps.json` is the single configuration file that defines:
- App metadata (name, type, status)
- Entry points (`entry` for direct load, `container` for wrapped load)
- Legacy mapping (for traceability)

No other file should hardcode app URLs.

### 2. Container Layer
`containers/app.html` and `containers/tavern.html` are thin shells:
- Parse URL parameters (`?app=xxx`, `?target=xxx`, `?profile=xxx`)
- Load `registry/apps.json`
- Create an iframe pointing to the app's `entry`
- Provide a `postMessage` bridge (Phase 2)

Containers do NOT contain business logic.

### 3. App Layer
`apps/*` contains the actual applications:
- Each app is self-contained with its own `index.html`
- Relative paths within an app continue to work after the move
- Apps may have different tech stacks (Vite, vanilla HTML, etc.)

### 4. Package Layer
`packages/*` contains code that is shared or referenced by apps:
- `commander-ui-legacy/` is a preserved prototype
- Future additions: `dashboard-core/`, `battle-engine/`, `pkm-st-bridge/`

## URL Schema

### Development (local server)
```
http://localhost:8080/                          # App selector
http://localhost:8080/?app=battle               # Route to battle
http://localhost:8080/containers/app.html?app=dashboard-main
http://localhost:8080/containers/tavern.html?target=battle
```

### Production (GitHub Pages)
```
https://hasheeper.github.io/pkm-pink/
https://hasheeper.github.io/pkm-pink/?app=battle
https://hasheeper.github.io/pkm-pink/containers/app.html?app=dashboard-main
https://hasheeper.github.io/pkm-pink/containers/tavern.html?target=dashboard-main
```

## Phase Roadmap

### Phase 1: Directory Governance (Current)
- [x] Restructure directories
- [x] Create registry and containers
- [x] Verify static loading works
- [ ] Update `battle-sim` vite base path for new deploy URL
- [ ] Configure GitHub Pages deployment

### Phase 2: Tavern Bridge Unification
- Merge `tavern-inject.js` from `dashboard-main/` and `dashboard-universal/` into `packages/pkm-st-bridge/`
- Update `containers/tavern.html` to use the unified bridge
- Deprecate `apps/battle-sim/ST/`

### Phase 3: Dashboard Core Extraction
- Extract shared code from `dashboard-main` and `dashboard-universal`:
  - `data-helpers.js`
  - `styles.css` (common parts)
  - Utility functions from `app.js`
- Create `packages/dashboard-core/`

### Phase 4: Battle Engine Package
- Extract battle logic from `apps/battle-sim/src/`, `engine/`, `mechanics/`
- Create `packages/battle-engine/` as an ES module package
- `apps/battle-sim/` becomes a thin UI shell around the engine

### Phase 5: State Management (ERA → MVU)
- Design and implement `packages/pkm-state-mvu/`
- Migrate variable systems from dashboard apps

## Notes

- `apps/battle-sim/` is a Vite project. Its `dist/` directory is `.gitignore`d.
  The deployment process must run `vite build` and copy the output to the
  appropriate location (e.g., root of `gh-pages` branch or a `docs/` folder).

- `apps/tactical-map/` has duplicate data files (`pkmdata.js` in root and
  `参考/pkmdata.js`). These are intentionally kept separate in Phase 1.

- `packages/commander-ui-legacy/` is already integrated into
  `apps/battle-sim/cmd/`. The standalone package is for reference only.
