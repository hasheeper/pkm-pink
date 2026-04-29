# PKM ST Bridge

Stable SillyTavern entry for PKM Pink scripts.

## Links

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

## Contract

`bridge.js` owns loading, ordering, cache busting, logging, pack selection, and shared MVU IO helpers.
Pack scripts own PKM business behavior.
