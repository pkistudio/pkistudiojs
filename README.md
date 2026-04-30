# PkiStudioJS

PkiStudioJS is a simplified JavaScript version of PkiStudio. It is a browser-based ASN.1 DER/BER viewer and editor that parses DER, BER, and PEM data locally in the browser, displays it as a navigable tree, and provides tools for inspecting, copying, editing, deleting, and opening selected nodes.

A hosted version is available at https://pkistudio.github.io/pkistudiojs/.

Current version: 0.1.4

File contents are not uploaded to the server. The Node.js service only serves the static web application.

## Reusing the Viewer

The viewer UI and behavior live in `app/static/pkistudio.js`. The bundled `index.html` only provides a mount target and loads the script:

```html
<div id="pkistudio"></div>
<script src="pkistudio.js" defer></script>
```

When `#pkistudio`, `[data-pkistudio]`, or `[data-pkistudio-mount]` is present, the script auto-initializes and renders the full viewer, menus, dialogs, and styles into a Shadow DOM. To initialize it manually from another site, disable auto-init and call `window.PkiStudio.init()` yourself:

```html
<div id="certificate-viewer"></div>
<script src="/path/to/pkistudio.js" data-pkistudio-auto-init="false" defer></script>
<script>
	window.addEventListener('DOMContentLoaded', () => {
		window.PkiStudio.init({
			mount: '#certificate-viewer',
			oidUrl: '/path/to/oids.json'
		});
	});
</script>
```

By default the generated UI is isolated in a Shadow DOM so host-page styles do not need to match pkistudio's internal markup.

## Minimal Debug Harness

The simplest way to debug the ASN.1 editor is to keep the Node.js service out of the problem and run the viewer as a static browser component. Create a temporary HTML file next to `pkistudio.js` and `oids.json`, disable auto-initialization, initialize the viewer manually, and load a tiny DER value through the public `loadBytes` helper:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>pkistudio debug</title>
	</head>
	<body>
		<div id="debug-pkistudio"></div>

		<script src="./pkistudio.js" data-pkistudio-auto-init="false"></script>
		<script>
			window.addEventListener('DOMContentLoaded', () => {
				const studio = window.PkiStudio.init({
					mount: '#debug-pkistudio',
					oidUrl: './oids.json'
				});

				// SEQUENCE { INTEGER 1 }
				studio.loadBytes(
					new Uint8Array([0x30, 0x03, 0x02, 0x01, 0x01]),
					'Loaded minimal debug DER.'
				);

				window.pkistudioDebug = studio;
			});
		</script>
	</body>
</html>
```

Serve the directory from localhost so `oids.json` can be fetched normally:

```sh
node app/server.js
```

Then open `http://localhost:8080/your-debug-file.html`. From the browser console, call `pkistudioDebug.loadBytes(...)` with different `Uint8Array` inputs to isolate parser, renderer, edit, and re-encoding behavior without changing the main `index.html`.

## Loading Data

Use the `Load` menu to import data:

- `Load -> from File`: opens the browser file picker for DER or PEM files.
- `Load -> from Clipboard as PEM`: reads PEM text from the clipboard and parses it.
- `Load -> from Clipboard as HEX`: reads a hexadecimal DER string from the clipboard and parses it.
- `Close`: clears the current document and returns the viewer to the empty state.
- `Tools -> Expand All`: opens every visible tree item in the current document.
- `Tools -> Collapse All`: closes every tree item in the current document.
- `About`: displays the application name and version.

The file picker accepts common certificate and ASN.1-related extensions, including `.der`, `.pem`, `.cer`, `.crt`, `.csr`, `.p7b`, `.p7c`, `.crl`, and `.bin`.

## Supported Data

pkistudio supports ASN.1 DER binaries, BER constructed values with indefinite length, and PEM files. PEM input is base64-decoded in the browser before parsing.

The viewer displays:

- ASN.1 tag names and tag numbers
- Universal, Application, Context-specific, and Private classes
- Primitive and constructed encoding
- Header length, value range, and value length
- Decoded values for common universal types
- Compact hexadecimal value previews
- OID names loaded from `app/static/oids.json` when available
- Nested constructed values as expandable tree nodes
- BER indefinite-length constructed values as `TAG (Indefinite)` with derived `EndOfContent (0)` terminators
- Encapsulated DER inside supported `BIT STRING` and `OCTET STRING` values

## Tree Interaction

Click a tree item icon to open its context menu. The menu order is:

- `Edit`
- `Insert before`
- `Add` for structured items
- `Delete`
- `Send to`

`Edit` opens the DER inspector for the selected node. The inspector shows identifier details, class, method, tag index, length, tag name, and a hexadecimal content preview. For editable nodes, `Edit...` opens the appropriate content editor.

`Insert before` creates a new sibling immediately before the selected node. New items default to an empty `OCTET STRING`.

`Add` appears only for structured nodes and creates a new child item under the selected node. New child items also default to an empty `OCTET STRING`.

`Delete` removes the selected node from the current document and re-encodes the remaining tree. Derived `EndOfContent (0)` terminators are controlled by their parent indefinite-length setting and cannot be deleted directly.

## Send To Menu

The `Send to` submenu contains actions for exporting or reopening a selected node:

- `New Window`: opens the selected node and its subtree in a new browser window.
- `New Window as Extracted`: appears only when the node contains encapsulated DER; it opens only the extracted inner DER in a new browser window.
- `Clipboard as Tree Text`: copies the selected node as indented tree text.
- `Clipboard as HEX Text`: copies the selected node as a compact DER hexadecimal string.

New-window actions transfer DER bytes through browser `localStorage` and add a temporary query parameter to the new window URL. The transfer data is removed after it is read.

## Editing

pkistudio can edit primitive nodes and then re-encode the DER tree. Constructed nodes such as `SEQUENCE` and `SET` are inspectable but are not edited directly. Their length mode can be switched between definite and indefinite in the DER inspector.

Editable text-like values include:

- `UTF8String`
- `NumericString`
- `PrintableString`
- `TeletexString`
- `IA5String`
- `UTCTime`
- `GeneralizedTime`
- `BMPString`

Specialized primitive editors include:

- `OBJECT IDENTIFIER`, edited in dotted decimal form such as `1.2.840.113549`
- `OCTET STRING`, edited as hexadecimal bytes
- `BIT STRING`, edited as hexadecimal bytes plus the `Unused bits` value

Time values have a dedicated editor with date, time, GMT/local zone selection, and numeric offset fields. DER time format validation is applied before updating the node.

Primitive nodes without a specialized editor are edited as raw hexadecimal value bytes, using the same HEX editor style as `OCTET STRING`. Binary value editors can also load replacement bytes from a local file. Edited values are validated, re-encoded, reparsed, and displayed immediately.

## Validation and Error Handling

The parser enforces DER/BER constraints such as valid length boundaries, high-tag-number decoding, matching EndOfContent terminators for indefinite-length values, and matching re-encoded bytes. User-facing errors are shown in English in the viewer or notice area.

Clipboard reads require a browser context that permits the Clipboard API. In most browsers this means serving the page from a secure context such as HTTPS or localhost. Clipboard writes use the Clipboard API when available and fall back to a browser copy command when possible.

## Operational Notes

Browsers cannot allow a web page to open arbitrary local files automatically. Files must be selected by the user through the browser file picker, loaded from the clipboard, or loaded through an explicit editor file input.

## Release Announcements

New GitHub releases are announced on Bluesky by `.github/workflows/post-release-to-bluesky.yml`. To enable posting, create a Bluesky app password and add these repository secrets in GitHub:

- `BLUESKY_HANDLE`: the Bluesky handle to post from, such as `example.bsky.social`
- `BLUESKY_APP_PASSWORD`: an app password created from Bluesky settings

The workflow runs when a GitHub release is published. It can also be tested manually from the Actions tab with a release tag and release URL.

## License

PkiStudioJS is licensed under the MIT License. See [LICENSE](LICENSE).

## HTTPS with Docker Compose and nginx

Clipboard reads usually require HTTPS except on localhost. For a local HTTPS-like deployment, put nginx in front of the Node.js static server and terminate TLS at nginx.

One possible file layout is:

```text
.
|-- app/
|   |-- server.js
|   `-- static/
|-- certs/
|   |-- localhost.crt
|   `-- localhost.key
|-- compose.yml
`-- nginx/
    `-- default.conf
```

Create a local self-signed certificate for testing:

```sh
mkdir -p certs nginx
openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
	-keyout certs/localhost.key \
	-out certs/localhost.crt \
	-subj "/CN=localhost"
```

Example `compose.yml`:

```yaml
services:
	app:
		image: node:22-alpine
		working_dir: /srv/app
		command: node server.js
		environment:
			PORT: "8080"
		volumes:
			- ./app:/srv/app:ro
		expose:
			- "8080"

	nginx:
		image: nginx:1.27-alpine
		depends_on:
			- app
		ports:
			- "8443:443"
		volumes:
			- ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
			- ./certs:/etc/nginx/certs:ro
```

Example `nginx/default.conf`:

```nginx
server {
		listen 443 ssl;
		server_name localhost;

		ssl_certificate /etc/nginx/certs/localhost.crt;
		ssl_certificate_key /etc/nginx/certs/localhost.key;

		location / {
				proxy_pass http://app:8080;
				proxy_http_version 1.1;
				proxy_set_header Host $host;
				proxy_set_header X-Forwarded-Proto https;
				proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		}
}
```

Start it with:

```sh
docker compose up
```

Open `https://localhost:8443/`. Because the certificate is self-signed, the browser will show a certificate warning until you trust the local certificate or replace it with one issued by your development CA.
