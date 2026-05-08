# Project Guidelines

## Project Overview

PkiStudioJS is a browser-based ASN.1 DER/BER/PEM viewer and editor with a reusable CommonJS Core API. The package is published as `@pkistudio/pkistudiojs`.

Key files:

- `app/static/pkistudio-core.js`: parser, serializer, encoder, OID helpers, and the package entry point.
- `app/static/pkistudio.js`: browser viewer UI, script-tag API, and `@pkistudio/pkistudiojs/viewer` export.
- `app/static/oid-resolver.js`: bundled OID resolver API.
- `app/server.js`: local static server only; application data should remain client-side.
- `test/core-api.test.js`: Node test coverage for the public API and important documentation contracts.

## Development Commands

Run these for normal code changes before handing work back:

```sh
npm test
npm run check
```

Use the VS Code task `Start pkistudio server` or run `node app/server.js` when browser verification is needed.

For package or release-related changes, also run:

```sh
npm pack --dry-run
```

When checking published package state, use the scoped package name:

```sh
npm view @pkistudio/pkistudiojs version --json
```

## Architecture Notes

- Keep the project build-free unless the task clearly requires changing that model.
- Preserve CommonJS compatibility for package exports.
- `@pkistudio/pkistudiojs` and `@pkistudio/pkistudiojs/core` resolve to `app/static/pkistudio-core.js`.
- `@pkistudio/pkistudiojs/viewer` must be import-safe in Node-like contexts, but `init()` still requires a browser DOM.
- Direct script-tag usage must continue to expose `window.PkiStudio` and `window.PkiStudioCore`.
- Browser viewer behavior used by embedders should remain stable: `init`, `loadBytes`, `getNodeBytes`, `setEditable`, `close`, `root`, `oidUrl`, `newWindowUrl`, `fullscreen`, `editable`, and Shadow DOM behavior.

## Coding Conventions

- Follow the existing plain JavaScript style and avoid introducing a bundler, transpiler, or framework without a specific need.
- Keep changes focused; do not reformat large static files or generated-looking data such as `app/static/oids.json` unless required.
- Keep version metadata synchronized across `package.json`, `app/static/pkistudio-core.js`, `app/static/pkistudio.js`, and `README.md` when bumping versions.
- Use `@pkistudio/pkistudiojs` in npm install, import, and test examples.
- Update README or docs when public API behavior, package exports, or release workflow expectations change.

## GitHub And Release Notes

- Prefer `gh` for GitHub issue and PR operations when available.
- The standard release workflow is documented in `.github/prompts/release.prompt.md`.
- Do not merge PRs unless the user explicitly asks to proceed.
- After merge is explicitly approved and required versions, credentials, and checks are in place, proceed with tags, GitHub Releases, npm publication, workflow reruns, and post-publication verification without asking for separate confirmations unless something is blocked or ambiguous.
- npm publication targets `@pkistudio/pkistudiojs` and should be verified after publishing with `npm view @pkistudio/pkistudiojs@<version> version dist-tags dist.tarball --json`.
