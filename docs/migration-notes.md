# Migration Notes

## Migration Date: 2026-04-28

## Old → New Mapping

| Old Path | New Path | Notes |
|----------|----------|-------|
| `pkmpink/ST/` | *(deleted)* | Empty directory, documented in `archive/obsolete/empty-ST.readme.md` |
| `pkmpink/pkm12/` | `pkm-pink/apps/battle-sim/` | Vite project. `node_modules/` and `dist/` excluded from copy. |
| `pkmpink/pkm13/` | `pkm-pink/apps/dashboard-main/` | Full tavern plugin. Git history not preserved. |
| `pkmpink/pkm21/` | `pkm-pink/apps/dashboard-universal/` | Mini tavern plugin. Git history not preserved. |
| `pkmpink/pkm14/` | `pkm-pink/packages/commander-ui-legacy/` | Prototype preserved for reference. |
| `pkmpink/pkm15/` | `pkm-pink/apps/tactical-map/` | Tactical map. `其他/` and `参考/` subdirs kept intact. |

## What Was Changed

### Directory Structure
- Created `apps/`, `packages/`, `containers/`, `registry/`, `docs/`, `archive/`, `scripts/`
- Moved all 5 projects into semantic locations
- Deleted empty `ST/`

### New Files Created
- `index.html` — unified entry page with app selector
- `registry/apps.json` — canonical app registry
- `containers/app.html` — generic iframe container
- `containers/tavern.html` — Tavern AI inject container
- `docs/audit/current-structure-report.md` — full audit
- `docs/ARCHITECTURE.md` — architecture documentation
- `docs/migration-notes.md` — this file

### What Was NOT Changed
- No business logic modified
- No files deleted within app directories
- No import paths rewritten
- No data files deduplicated
- `apps/battle-sim/vite.config.js` still has `base: '/pkm33/'` (must update before deploy)

## Known Issues Requiring Attention

### 1. Vite Base Path
**File**: `apps/battle-sim/vite.config.js`
**Current**: `base: '/pkm33/'`
**Required**: Update to match new GitHub Pages deploy path.
If deploying to `hasheeper.github.io/pkm-pink/apps/battle-sim/`:
```js
base: '/pkm-pink/apps/battle-sim/',
```
If deploying root to `hasheeper.github.io/pkm-pink/` with flat structure:
```js
base: '/pkm-pink/',
```

### 2. Orphaned `index.js`
**File**: `apps/battle-sim/index.js` (255KB)
**Status**: Tracked by git in original repo, but `index.html` references `./src/main.js` instead.
**Action**: Marked as deprecated. Safe to delete after confirming no other references exist.

### 3. ST Wrapper Old URL
**File**: `apps/battle-sim/ST/STver.html`
**Current**: References `https://hasheeper.github.io/pkm12/`
**Status**: This URL will 404 after restructuring.
**Action**: Marked as deprecated. Replaced by `containers/tavern.html`.

### 4. Duplicate Plugin Files
**Files**:
- `apps/dashboard-main/doc/pkm-tavern-plugin.js`
- `apps/battle-sim/ST/pkm-tavern-plugin.js`
- `apps/dashboard-universal/pkm-tavern-plugin.js`
**Status**: 3 different versions (different MD5s).
**Action**: Preserved in Phase 1. Will consolidate in Phase 2.

### 5. Dashboard Fork Status
**Observation**: `dashboard-main` (pkm55) was last updated 2026-03-24.
`dashboard-universal` (pkm21) was last updated 2026-02-03.
**Implication**: `dashboard-universal` may be abandoned.
**Action**: Marked as `status: "legacy"` in `registry/apps.json`. Evaluate in Phase 2 whether to archive or revive.

## Rollback Plan

If anything goes wrong, the original directory is preserved at:
```
/Users/liuhang/Documents/pkmpink_backup_20260428_031427/
```

To rollback:
```bash
rm -rf /Users/liuhang/Documents/pkm-pink
cp -r /Users/liuhang/Documents/pkmpink_backup_20260428_031427 /Users/liuhang/Documents/pkmpink
```

## Next Steps

1. **Update vite base path** in `apps/battle-sim/vite.config.js`
2. **Test locally** with `python -m http.server`
3. **Initialize git** in `pkm-pink/` and push to `hasheeper/pkm-pink`
4. **Configure GitHub Pages** to deploy from `main` branch
5. **Verify all apps load** through `containers/app.html`
