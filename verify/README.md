# Verification harness

A standalone host that exercises the plugin without a DSH installation.

It exists because the development environment could not install the plugin into a live Host (the
checkout was mounted read-only), while the plugin's own contract still had to be proven.

## What it does

`server.mjs`:

1. Serves the real DSH `index.html` through the **real** index-injection pipeline
   (`renderIndexInjections` from `@deepseek-ai/dsh-host-webserver`)
2. Registers the **real** built bundle (`../lib/client.js`) into a `window.__ModuleLoader__` table
3. Calls the plugin's `apply` with a minimal Cordis-shaped context exposing `effect`, `locale`
   and `slots`
4. Renders the `shell.overlay` registration with React, wiring the injected `hooks` through
   `useSyncExternalStore` — the same contract the slot renderer uses

`verify.mjs` drives it with Playwright and asserts the outcomes below.

## Faking an old engine

A real WebView old enough to fail the transport cannot be installed here, so `server.mjs` fakes
it in the document head:

- Overrides `navigator.userAgent` with a Chrome 61 Android string
- Deletes `Object.hasOwn`

The probe then reports `Chrome 61` with `Object.hasOwn` missing, which is what an engine below
the transport floor produces.

## What it proves

- The bundle registers under its package name
- `apply` registers both slots (`shell.overlay`, `settings.general.item`)
- The injected faces produce a verdict the components can render
- The banner renders with **correct placeholder interpolation**
- Dismissing the banner removes it

## What it cannot prove

- Behaviour inside a real DSH Host (real slot renderer, real locale service, real module table)
- Behaviour on an actual old WebView
- That the WebSocket transport recovers — this plugin does not touch the transport

## Running it

```bash
# from this directory
SIM_UA='Mozilla/5.0 (Linux; Android 7.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/61.0.3163.98 Mobile Safari/537.36' \
  node server.mjs
# in another shell
node verify.mjs
```

`server.mjs` expects:

- a DSH checkout with `@deepseek-ai/dsh-host-webserver` built (for `renderIndexInjections`)
- the shell's built `dist/` (for `index.html` and assets)
- `../lib/client.js` built from this package

Paths are at the top of `server.mjs`; edit them for your checkout. The `vendor/` directory holds
the React 18 UMD builds the harness page loads.
