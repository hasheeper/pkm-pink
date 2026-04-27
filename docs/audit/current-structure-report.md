# PKM Pink Structure Audit Report

> Generated: 2026-04-28
> Auditor: Claude Code

## Original Structure (pkmpink/)

```
pkmpink/
├── ST/                          # Empty directory (0 bytes)
├── pkm12/  → hasheeper/pkm33    # Vite-based battle simulator (155MB)
├── pkm13/  → hasheeper/pkm55    # Tavern plugin full version (13MB)
├── pkm14/                       # Commander UI V2 prototype (92KB)
├── pkm15/                       # RHODIA tactical map (2.1MB)
└── pkm21/  → hasheeper/pkm21    # Tavern plugin mini version (10MB)
```

## Critical Issues Found

### 1. Naming Chaos
- Local folders: `pkm12`, `pkm13`, `pkm14`, `pkm15`, `pkm21`
- GitHub repos: `pkm33`, `pkm55`, `pkm21`
- No correlation between folder names and their actual purpose

### 2. Code Nesting
- `pkm12/` (battle engine) contained a nested `ST/` subdirectory with tavern iframe wrapper
- `pkm12/cmd/` contained a full copy of Commander UI V2 (from `pkm14/`)
- A single repo contained code for 3 different responsibilities

### 3. Duplicate/Forked Projects
- `pkm13` and `pkm21` are the same Tavern plugin:
  - Shared early git history (commits 463a371 ~ 18fc475)
  - `pkm21` is explicitly a "Mini version" with map/transit/social removed
  - `data-helpers.js`: identical (MD5 match)
  - `styles.css`: nearly identical (33 lines diff)
  - `app.js`: massive divergence (+1843/-3120 lines)

### 4. Data Redundancy
- `pkm-tavern-plugin.js` appeared in 3 locations with 3 different MD5s:
  - `pkm13/doc/` (440KB)
  - `pkm12/ST/` (441KB)
  - `pkm21/` (124KB)
- `pkmdata.js` in `pkm15/` root vs `pkm15/参考/`: different content
- `pokedex-data.js` in `pkm12/data/` vs `pkm15/参考/`: different versions

### 5. Deployment Path Drift
- `pkm12/vite.config.js`: `base: '/pkm33/'`
- `pkm12/ST/STver.html`: references dead URL `https://hasheeper.github.io/pkm12/`
- Three separate GitHub Pages sites with hardcoded URLs scattered across code

### 6. Orphaned Files
- `pkm12/index.js` (255KB): tracked by git but never referenced by `index.html`
- `pkm12/index.css` (139KB): referenced by `index.html` but may be redundant with `dist/`

## Size Breakdown

| Directory | Size | Content |
|-----------|------|---------|
| `pkm12/` | 155MB | node_modules(27M) + data(30M) + dist(32M) + .git |
| `pkm13/` | 13MB | Full tavern plugin + docs + backups |
| `pkm21/` | 10MB | Mini tavern plugin |
| `pkm15/` | 2.1MB | Tactical map + reference data |
| `pkm14/` | 92KB | Commander UI prototype |
| `ST/` | 0B | Empty |

## Git Repository Analysis

| Local | Remote | Branches | Latest Commit |
|-------|--------|----------|---------------|
| `pkm12` | `hasheeper/pkm33` | main, feature/clash-system, refactor/es-modules | "Implement Revival Blessing revive choice flow" |
| `pkm13` | `hasheeper/pkm55` | main | "updata" (2026-03-24) |
| `pkm21` | `hasheeper/pkm21` | main | "first commit" (2026-02-03) |

**Observation**: `pkm13` (full version) was last updated in March 2026, while `pkm21` (mini) was last updated in February 2026. The full version is the actively maintained branch.

## Technical Debt Marked for Phase 2

| Debt | Location | Status |
|------|----------|--------|
| Orphaned `index.js` | `apps/battle-sim/index.js` | Tracked but unused |
| Deprecated ST wrapper | `apps/battle-sim/ST/` | Superseded by `containers/tavern.html` |
| Multiple plugin versions | `apps/dashboard-main/doc/`, `apps/dashboard-universal/` | Need to determine canonical source |
| Divergent pkmdata | `apps/tactical-map/` vs `参考/` | Need to determine canonical source |
| Vite base path | `apps/battle-sim/vite.config.js` | Must update for new deploy path |
| Build artifact handling | `apps/battle-sim/dist/` | Currently .gitignored; needs CI strategy |
