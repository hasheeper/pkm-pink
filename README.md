# PKM Pink

Unified entry and container layer for the PKM (Pokémon Battle Simulator) ecosystem.

## Quick Start

```bash
cd pkm-pink
python3 -m http.server 8080
```

Open http://localhost:8080/ to see the app selector.

## Project Structure

```
pkm-pink/
├── index.html              # Unified entry / app selector
├── registry/
│   └── apps.json           # Canonical app registry
├── containers/             # Thin HTML shells for embedding
│   ├── app.html            # Generic app container
│   └── tavern.html         # Tavern AI inject container
├── apps/                   # Business applications
│   ├── battle-sim/         # Vite-based battle engine (was pkm12)
│   ├── dashboard-main/     # Full tavern dashboard (was pkm13)
│   ├── dashboard-universal/# Mini tavern dashboard (was pkm21)
│   └── tactical-map/       # RHODIA tactical map (was pkm15)
├── packages/               # Shared / prototype code
│   └── commander-ui-legacy/# Commander V2 prototype (was pkm14)
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── migration-notes.md
│   └── audit/
└── archive/                # Obsolete / backup materials
```

## Apps

| App | Type | Status | Legacy |
|-----|------|--------|--------|
| battle-sim | Battle Engine | active | pkm12 / pkm33 |
| dashboard-main | Dashboard (Full) | active | pkm13 / pkm55 |
| dashboard-universal | Dashboard (Mini) | legacy | pkm21 |
| tactical-map | Tactical Map | experimental | pkm15 |
| commander | UI Prototype | legacy | pkm14 |

## URL Schema

### Entry Page
- `/?app=battle` — Route directly to battle app
- `/?app=dashboard-main` — Route to main dashboard

### Containers
- `/containers/app.html?app=battle`
- `/containers/app.html?app=dashboard-main`
- `/containers/app.html?app=map`
- `/containers/tavern.html?target=dashboard-main`

## Deployment

This project is designed for GitHub Pages deployment.

1. Update `apps/battle-sim/vite.config.js` base path if needed
2. Build `apps/battle-sim/` with Vite
3. Push to `main` branch
4. Enable GitHub Pages from `main` branch root

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Migration Notes](docs/migration-notes.md)
- [Structure Audit](docs/audit/current-structure-report.md)

## Phase Roadmap

- **Phase 1** (Current): Directory governance + entry unification
- **Phase 2**: Tavern bridge unification + plugin consolidation
- **Phase 3**: Dashboard core extraction
- **Phase 4**: Battle engine package extraction
- **Phase 5**: State management migration (ERA → MVU)
