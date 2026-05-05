const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const core = require('../app/static/pkistudio-core.js');
const packageJson = require('../package.json');
const viewer = require('../app/static/pkistudio.js');
const exportedViewer = require('pkistudiojs/viewer');
const oidResolver = require('pkistudiojs/oid-resolver');

const rootDir = path.join(__dirname, '..');

test('parses and serializes a minimal DER document', () => {
  const document = core.parseInput(new Uint8Array([0x30, 0x03, 0x02, 0x01, 0x01]));

  assert.equal(document.format, 'DER');
  assert.equal(document.nodes.length, 1);
  assert.equal(core.getTagName(document.nodes[0]), 'SEQUENCE');
  assert.equal(core.getTagName(document.nodes[0].children[0]), 'INTEGER');
  assert.deepEqual(Array.from(core.encodeNodes(document.nodes)), [0x30, 0x03, 0x02, 0x01, 0x01]);
});

test('gets DER bytes for a node subtree by id', () => {
  const document = core.parseInput(new Uint8Array([0x30, 0x06, 0x02, 0x01, 0x01, 0x04, 0x01, 0xff]));
  const sequenceNode = document.nodes[0];
  const integerNode = sequenceNode.children[0];

  assert.deepEqual(Array.from(core.getNodeBytes(document.nodes, sequenceNode.id)), [0x30, 0x06, 0x02, 0x01, 0x01, 0x04, 0x01, 0xff]);
  assert.deepEqual(Array.from(core.getNodeBytes(document.nodes, integerNode.id)), [0x02, 0x01, 0x01]);
});

test('detects HEX text input in auto mode', () => {
  const summary = core.parseAsn1('3003020101');

  assert.equal(summary.format, 'HEX');
  assert.equal(summary.length, 5);
  assert.equal(summary.nodes[0].tagName, 'SEQUENCE');
  assert.equal(summary.nodes[0].children[0].value, '1');
});

test('decodes PEM text input', () => {
  const pem = [
    '-----BEGIN TEST-----',
    core.bytesToBase64(new Uint8Array([0x30, 0x03, 0x02, 0x01, 0x01])),
    '-----END TEST-----'
  ].join('\n');
  const document = core.parseInput(pem);

  assert.equal(document.format, 'PEM');
  assert.equal(document.nodes[0].tagNumber, 16);
});

test('serializes OID comments with a supplied OID map', () => {
  const oidBytes = core.encodeOid('1.2.840.113549');
  const oidNode = core.parseInput(new Uint8Array([0x06, oidBytes.length, ...oidBytes])).nodes[0];
  const serialized = core.serializeNode(oidNode, { oidNames: { '1.2.840.113549': 'rsadsi' } });

  assert.equal(serialized.value, '1.2.840.113549');
  assert.equal(serialized.oidName, 'rsadsi');
});

test('serializes OID comments with a supplied OID resolver', () => {
  const oidBytes = core.encodeOid('1.2.3.4.5');
  const oidNode = core.parseInput(new Uint8Array([0x06, oidBytes.length, ...oidBytes])).nodes[0];
  const resolver = oidResolver.create({ '1.2.3.4.5': 'custom test oid' });
  const serialized = core.serializeNode(oidNode, { oidResolver: resolver });

  assert.equal(serialized.value, '1.2.3.4.5');
  assert.equal(serialized.oidName, 'custom test oid');
});

test('exports an OID resolver with bundled names and custom overrides', () => {
  assert.equal(oidResolver.resolve('1.2.840.113549'), 'RSA Data Security inc.,');

  const resolver = oidResolver.create({
    '1.2.840.113549': 'custom rsadsi',
    '1.2.3.4.5': 'custom oid'
  });

  assert.equal(resolver.resolve('1.2.840.113549'), 'custom rsadsi');
  assert.equal(resolver.resolve('1.2.3.4.5'), 'custom oid');
  assert.equal(resolver.resolve('1.2.3.4.6'), '');
});

test('keeps public version metadata in sync', () => {
  const viewerSource = fs.readFileSync(path.join(rootDir, 'app/static/pkistudio.js'), 'utf8');
  const readme = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
  const viewerVersion = viewerSource.match(/const APP_VERSION = '([^']+)'/)[1];
  const readmeVersion = readme.match(/^Current version: (\S+)$/m)[1];

  assert.equal(core.VERSION, packageJson.version);
  assert.equal(viewerVersion, packageJson.version);
  assert.equal(readmeVersion, packageJson.version);
});

test('loads the viewer entry point without a browser DOM', () => {
  assert.equal(exportedViewer, viewer);
  assert.equal(typeof viewer.init, 'function');
  assert.equal(typeof viewer.autoInit, 'function');
  assert.equal(viewer.version, packageJson.version);
  assert.equal(viewer.core, core);
});

test('reports a clear error when initializing the viewer without a browser DOM', () => {
  assert.throws(
    () => viewer.init(),
    /PkiStudio viewer requires a browser DOM/
  );
});
