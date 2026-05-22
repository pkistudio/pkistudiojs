# pkistudiojs Release Profile

## Repository

- GitHub repository: `pkistudio/pkistudiojs`
- Product name: `PkiStudioJS`
- npm package name: `@pkistudio/pkistudiojs`
- Hosted Pages URL: `https://pkistudio.github.io/pkistudiojs/`
- Documentation URL: `https://github.com/pkistudio/pkistudiojs/wiki`
- ADR path: `docs/adr/`

## Version And Build

- Version files:
  - `package.json`
  - `package-lock.json`
  - `app/static/pkistudio-core.js` (`VERSION`)
  - `app/static/pkistudio.js` (`APP_VERSION`)
  - `README.md` (`Current version:`)
- Install command: `npm ci`
- Build command: none. This package serves static browser assets directly.
- Verification commands:
  - `npm test`
  - `npm run check`
- Package preview command: `npm pack --dry-run`
- Published package verification:
  - `npm view @pkistudio/pkistudiojs@<version> version dist-tags dist.tarball --json`

## Publishing

- npm publish workflow: `.github/workflows/publish-npm.yml`
- npm publish command in workflow: `npm publish --access public`
- npm publication requires explicit user approval.
- GitHub Release requires explicit user approval.
- Stable published tags should have a GitHub Release marked as latest unless the user instructs otherwise.
- WordPress post workflow: `.github/workflows/publish-release-to-wordpress.yml`
- Bluesky post workflow: `.github/workflows/post-release-to-bluesky.yml`
- WordPress and Bluesky posting require the configured repository secrets and release publication event.

## Pages And Wiki

- Pages workflow: `.github/workflows/pages.yml`
- Pages artifact path: `app/static`
- Wiki path in Codespaces: `/workspaces/pkistudiojs.wiki`
- Keep Wiki work separate from main repository work unless explicitly requested.
- Do not push Wiki commits until the user has reviewed the local preview or diff and explicitly asks to publish or push.

## Special Hooks

- Preserve CommonJS compatibility for package exports.
- Keep package examples and published package checks scoped to `@pkistudio/pkistudiojs`.
- Use `node app/server.js` or the VS Code task `Start pkistudio server` for browser verification when needed.
