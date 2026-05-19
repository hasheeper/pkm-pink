# ST Bridge

Stable SillyTavern entry for project packs.

## Production Links

Default pack, controlled by `manifest.json`:

```text
https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js
```

Explicit packs:

```text
https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js?pack=pkm-universal
https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js?pack=pkm-main
```

Force refresh during development:

```text
https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js?pack=pkm-universal&force=1&v=dev
```

## SillyTavern Script

Load the universal pack in SillyTavern from GitHub Pages:

```js
window.ST_BRIDGE_PACK = 'pkm-universal';
window.ST_BRIDGE_ENV = 'prod';
window.PKM_APP_BASE_URL = 'https://hasheeper.github.io/pkm-pink';
import 'https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js?pack=pkm-universal';
```

## Local Testing

Start a local static server from the repo root:

```sh
node apps/st-bridge/scripts/serve-local.mjs --port 4173 --root .
```

In local mode, the universal dashboard resolves to:

```text
http://127.0.0.1:4173/apps/dashboard-universal/index.html
```

Local ST replacement wrappers live in:

```text
ST/ST替换文件/local/BATTLE.local.html
ST/ST替换文件/local/GREETING.local.html
```

They point directly to:

```text
http://127.0.0.1:4173/apps/battle-sim/index.html
http://127.0.0.1:4173/apps/greeting-universal/index.html
```

## Contract

`bridge.js` owns loading, ordering, cache busting, logging, pack selection, and shared MVU IO helpers.
Pack scripts own project business behavior.

When loaded inside SillyTavern, the bridge shows a small loading notification:
loading, loaded, optional-module warning, or failed. It uses Tavern/toastr when
available and falls back to an in-page DOM toast.
