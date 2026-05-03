const assert = require('node:assert/strict');
const test = require('node:test');

const core = require('../app/static/pkistudio-core.js');

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