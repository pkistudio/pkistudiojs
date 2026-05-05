# npm Viewer Import Design

## Goal

Make `pkistudiojs/viewer` a proper npm public API for browser applications that want to embed the PkiStudioJS viewer as an internal viewer/editor.

The viewer is still a browser UI component. Importing it in Node-like module evaluation contexts should be safe, but rendering and editing require a browser DOM.

## Reference Consumer: pkistudio/pvkgadgets

`pkistudio/pvkgadgets` currently vendors PkiStudioJS browser assets under `public/vendor/pkistudiojs/` and loads them from HTML:

- `pkistudio-core.js`
- `pkistudio.js`
- `oids.json`

The main application disables auto-init and mounts the viewer manually:

```js
viewer = window.PkiStudio.init({
  mount: '#viewerMount',
  oidUrl: `${APP_BASE_URL}vendor/pkistudiojs/oids.json`,
  newWindowUrl: `${APP_BASE_URL}viewer.html`
});
```

The standalone viewer page also initializes manually with `fullscreen: true`.

## Behaviors pvkgadgets Depends On

The current integration is deeper than simple display. A stable npm viewer API must preserve these behaviors:

- `init(options)` returns a viewer instance.
- The instance exposes `loadBytes(bytes, notice)` to display selected DER data.
- The instance exposes `getNodeBytes(nodeId)` so host applications can read edited DER back from the viewer.
- The instance exposes `close()` so the host can clear the viewer when no DER object is selected.
- The instance exposes `root`, currently a `DocumentFragment` or `Element`, so host applications can add embedded styles and listen for internal viewer events.
- The instance accepts `mount`, `oidUrl`, `newWindowUrl`, `shadowRoot`, and `fullscreen` options.
- `newWindowUrl` must continue to let embedded apps send selected DER to a standalone viewer-only page.
- Direct script-tag usage must continue to set `window.PkiStudio`.
- `data-pkistudio-auto-init="false"` must continue to suppress browser auto-initialization.
- Existing `data-action` and `data-node-action` attributes are used by pvkgadgets for readonly guarding, so they should be treated as integration-facing selectors or replaced with a better supported API before they change.

## Current Problem

`package.json` exports `./viewer` as `./app/static/pkistudio.js`, but that file is a browser script that directly references `window` and `document` at module top level.

That means `require('pkistudiojs/viewer')` is misleading: consumers may expect it to be importable, but module evaluation can fail outside a browser DOM.

## Proposed API

CommonJS should work first because the package is currently CommonJS:

```js
const viewer = require('pkistudiojs/viewer');

const instance = viewer.init({
  mount: '#viewerMount',
  oidUrl: '/oids.json',
  newWindowUrl: '/viewer.html'
});

instance.loadBytes(bytes, 'Loaded DER.');
```

The exported object should include:

- `version`
- `core`
- `init(options)`
- `autoInit()` if auto-initialization remains externally useful

The instance should include:

- `mount`
- `root`
- `loadBytes(bytes, notice)`
- `getNodeBytes(nodeId)`
- `close()`

## Implementation Direction

Keep the existing browser asset usable by script tags, but wrap it so it is also import-safe:

1. Convert `app/static/pkistudio.js` to the same UMD-style shape used by `pkistudio-core.js`.
2. Build the API object without touching the DOM.
3. Export the API with `module.exports` when CommonJS is available.
4. Attach the API to `globalThis.PkiStudio` when a global object exists.
5. Gate all `window` and `document` access behind browser runtime checks or inside `init()` / `autoInit()`.
6. Make `init()` throw a clear error if called without a browser DOM.
7. Run auto-init only when a browser DOM exists.

This keeps the package simple and avoids a build step while making `pkistudiojs/viewer` honest as an npm export.

## Follow-Up API Improvements

The pvkgadgets integration currently reaches into viewer internals for readonly behavior. A better long-term API would reduce reliance on internal selectors:

- `editable: boolean | (context) => boolean`
- `setEditable(editable)` on the instance
- `hiddenActions` or `disabledActions`
- `onChange(callback)` for edited document bytes
- `onNotice(callback)` for host-managed status display
- `className` or `hostClassName` option for embedded styling

These do not need to be completed in the first import-safe change, but the design should avoid blocking them.

## Acceptance Criteria

- `require('pkistudiojs/viewer')` succeeds in Node without a DOM.
- `require('pkistudiojs/viewer').init()` without a DOM throws a clear browser-DOM-required error.
- Existing script-tag usage still sets `window.PkiStudio`.
- Existing manual browser initialization still works.
- Existing auto-init behavior still works unless `data-pkistudio-auto-init="false"` is present.
- `pvkgadgets` can migrate from vendored script tags to an npm dependency without losing `loadBytes`, `getNodeBytes`, `close`, `root`, `oidUrl`, `newWindowUrl`, `fullscreen`, or Shadow DOM behavior.
- `npm test`, `npm run check`, and `npm pack --dry-run` pass.

## Suggested Issue Title

Make `pkistudiojs/viewer` import-safe for embedded browser applications

## Suggested Issue Body

Prepare `pkistudiojs/viewer` as a real npm public API for applications such as `pkistudio/pvkgadgets`, which embeds PkiStudioJS as an internal ASN.1 viewer/editor. The viewer should remain browser-only at runtime, but importing the module should be safe in Node-like module evaluation contexts. Preserve the current script-tag API and manual initialization behavior while adding tests and documentation for npm usage.