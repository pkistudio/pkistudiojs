# PkiStudioJS

PkiStudioJS is a browser-based ASN.1 DER/BER/PEM viewer and editor with a reusable CommonJS Core API. It parses DER, BER, PEM, headerless base64, and HEX input locally in the browser, displays ASN.1 data as a navigable tree, and provides tools for inspecting, copying, exporting, editing, deleting, and reopening selected nodes.

Hosted viewer: https://pkistudio.github.io/pkistudiojs/

Documentation: https://github.com/pkistudio/pkistudiojs/wiki

Current version: 0.6.1

File contents are not uploaded to the server. The Node.js service only serves the static web application.

## Features

- Browser-local DER, BER, PEM, headerless base64, and HEX parsing.
- ASN.1 tree display with tag metadata, decoded values, OID names, and hexadecimal previews.
- Editing and DER re-encoding for supported primitive values.
- Node-level copy, export, delete, insert, add, and new-window actions.
- Reusable Core API for parsing, serializing, encoding, and inspecting ASN.1 data.
- Embeddable viewer API for browser applications.
- Bundled OID resolver with support for custom names and overrides.

See the Wiki for details:

- [Getting Started](https://github.com/pkistudio/pkistudiojs/wiki/Getting-Started)
- [Viewer Usage](https://github.com/pkistudio/pkistudiojs/wiki/Viewer-Usage)
- [Core API](https://github.com/pkistudio/pkistudiojs/wiki/Core-API)
- [Editing and Interaction](https://github.com/pkistudio/pkistudiojs/wiki/Editing-and-Interaction)
- [OID Resolver](https://github.com/pkistudio/pkistudiojs/wiki/OID-Resolver)
- [Testing](https://github.com/pkistudio/pkistudiojs/wiki/Testing)
- [Development](https://github.com/pkistudio/pkistudiojs/wiki/Development)

## Install

```sh
npm install @pkistudio/pkistudiojs
```

Package exports:

- `@pkistudio/pkistudiojs`: Core API.
- `@pkistudio/pkistudiojs/core`: Core API alias.
- `@pkistudio/pkistudiojs/viewer`: browser viewer API.
- `@pkistudio/pkistudiojs/oid-resolver`: bundled OID resolver API.

## Viewer

The browser viewer can be embedded from npm:

```js
const viewer = require('@pkistudio/pkistudiojs/viewer');
const oidResolver = require('@pkistudio/pkistudiojs/oid-resolver');

window.addEventListener('DOMContentLoaded', () => {
	const studio = viewer.init({
		mount: '#certificate-viewer',
		oidResolver: oidResolver.create({
			'1.2.3.4.5': 'Example Custom Extension'
		}),
		newWindowUrl: '/viewer.html'
	});

	studio.loadBytes(new Uint8Array([0x30, 0x03, 0x02, 0x01, 0x01]), 'Loaded DER.');
});
```

It can also be used directly with script tags:

```html
<div id="pkistudio"></div>
<script src="pkistudio-core.js" defer></script>
<script src="pkistudio.js" defer></script>
```

When `#pkistudio`, `[data-pkistudio]`, or `[data-pkistudio-mount]` is present, the script auto-initializes and renders the viewer into a Shadow DOM. Disable auto-init with `data-pkistudio-auto-init="false"` when initializing manually with `window.PkiStudio.init()`.

`@pkistudio/pkistudiojs/viewer` exports `version`, `core`, `init(options)`, and `autoInit()`. Importing the module is safe in Node-like module evaluation contexts, but `init()` still requires a browser DOM.

Pass `editable: false` to initialize the viewer in read-only mode. The returned instance can later switch modes with `setEditable(false)` or `setEditable(true)`.

The DER inspector can edit an existing node's identifier class and tag index, and validates the current content against the selected universal tag before applying identifier changes.

For viewer options, script-tag usage, OID configuration, read-only mode, and new-window behavior, see [Viewer Usage](https://github.com/pkistudio/pkistudiojs/wiki/Viewer-Usage).

## Core API

Use the Core API when code needs ASN.1 parsing without mounting the browser UI:

```js
const pkistudio = require('@pkistudio/pkistudiojs');

const document = pkistudio.parseInput(
	new Uint8Array([0x30, 0x03, 0x02, 0x01, 0x01])
);

console.log(pkistudio.serializeTree(document.nodes));
```

The same file can be loaded directly in a browser. It exposes `window.PkiStudioCore`:

```html
<script src="pkistudio-core.js"></script>
<script>
	const summary = window.PkiStudioCore.parseAsn1('3003020101');
	console.log(summary.nodes[0].tagName);
</script>
```

Common Core APIs include `parseInput(input, options)`, `parseAsn1(input, options)`, `serializeTree(nodes, options)`, `serializeNode(node, options)`, `encodeNodes(nodes)`, `encodeNode(node)`, `getNodeBytes(nodes, nodeId)`, `decodePem(text)`, `hexToBytes(text)`, `decodeOid(bytes)`, `encodeOid(text)`, `getTagName(node)`, `describeValue(node)`, `findNodeById(nodes, id)`, and `resolveOid(oid, oidNamesOrResolver)`.

Use `options.format` when input should not be auto-detected. Supported values are `auto`, `der`, `ber`, `pem`, `base64`, `headerless-pem`, and `hex`.

For full parsing, serialization, encoding, and helper API details, see [Core API](https://github.com/pkistudio/pkistudiojs/wiki/Core-API).

## Development

Run local checks with:

```sh
npm test
npm run check
```

Start the local static server with:

```sh
node app/server.js
```

Then open `http://localhost:8080/`.

For what `npm test` covers and where browser verification is still needed, see [Testing](https://github.com/pkistudio/pkistudiojs/wiki/Testing).

For local server, package entry points, version metadata, release notes, Wiki preview, and related development details, see [Development](https://github.com/pkistudio/pkistudiojs/wiki/Development).

## License

PkiStudioJS is licensed under the MIT License. See [LICENSE](LICENSE).
