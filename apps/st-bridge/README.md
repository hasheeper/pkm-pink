# ST Bridge

Stable SillyTavern entry for PKM Pink and AceZero scripts.

## Links

Default pack, controlled by `manifest.json`:

```text
https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js
```

Explicit packs:

```text
https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js?pack=pkm-universal
https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js?pack=pkm-main
https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js?pack=acezero
```

Force refresh during development:

```text
https://hasheeper.github.io/pkm-pink/apps/st-bridge/bridge.js?pack=pkm-universal&force=1&v=dev
```

## Contract

`bridge.js` owns loading, ordering, cache busting, logging, and pack selection.
Pack scripts own business behavior.
