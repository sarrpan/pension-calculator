import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRequestPin, copyRequestPin, pasteRequestPin } from './requestPin.js';

const original = ['navigator', 'document'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
afterEach(() => original.forEach(([key, descriptor]) => {
  if (descriptor) Object.defineProperty(globalThis, key, descriptor);
  else delete globalThis[key];
}));

function browser({ clipboard, accepted = true, throws = false } = {}) {
  const calls = [], fields = [];
  let focused = false;
  const field = { style: {}, focus() {}, select() { this.selected = true; },
    setSelectionRange(start, end) { this.range = [start, end]; }, remove() { fields.splice(fields.indexOf(this), 1); } };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { clipboard } });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    activeElement: { focus() { focused = true; } }, getSelection: () => null,
    createElement: () => field, body: { appendChild: node => fields.push(node) },
    execCommand(command) { calls.push({ command, text: field.value, selected: field.selected, range: field.range });
      if (throws) throw new Error('copy denied'); return accepted; },
  } });
  return { calls, fields, get focused() { return focused; } };
}

test('PIN normalization accepts only a full PIN or exactly six digits, including numeric values', () => {
  for (const value of ['PIN-123456', ' pin-123456 ', '123456', 123456]) assert.equal(normalizeRequestPin(value), 'PIN-123456');
  assert.equal(normalizeRequestPin('000012'), 'PIN-000012');
  for (const value of [null, undefined, '', 12, 'PIN-12', 'abc123456', '1234567', 'PIN-123456junk']) {
    assert.throws(() => normalizeRequestPin(value), /Invalid request PIN/);
  }
});

test('Clipboard API receives exactly PIN-123456 and completes before copy resolves', async () => {
  let finish;
  const written = [];
  const h = browser({ clipboard: { writeText: text => { written.push(text); return new Promise(resolve => { finish = resolve; }); } } });
  let done = false;
  const copying = copyRequestPin('PIN-123456').then(() => { done = true; });
  await Promise.resolve(); assert.equal(done, false);
  finish(); await copying;
  assert.deepEqual(written, ['PIN-123456']); assert.equal(done, true); assert.deepEqual(h.calls, []);
});

test('fallback copies the entire normalized PIN when Clipboard API is missing or rejects', async () => {
  for (const clipboard of [undefined, { writeText: async () => { throw new Error('denied'); } }]) {
    const h = browser({ clipboard });
    await copyRequestPin(123456);
    assert.deepEqual(h.calls, [{ command: 'copy', text: 'PIN-123456', selected: true, range: [0, 10] }]);
    assert.deepEqual(h.fields, []); assert.equal(h.focused, true);
  }
});

test('failed or throwing fallback rejects and always cleans up its field and restores focus', async () => {
  for (const options of [{ accepted: false }, { throws: true }]) {
    const h = browser(options);
    await assert.rejects(copyRequestPin('PIN-123456'));
    assert.deepEqual(h.fields, []); assert.equal(h.focused, true);
  }
});

test('malformed PIN is rejected before any clipboard call', async () => {
  let calls = 0;
  const h = browser({ clipboard: { writeText: async () => { calls++; } } });
  await assert.rejects(copyRequestPin('PIN-12'));
  assert.equal(calls, 0); assert.deepEqual(h.calls, []);
});

test('paste normalizes the complete clipboard before the input maxLength is applied', () => {
  for (const text of ['PIN-123456', '123456', ' pin-123456 ']) {
    let prevented = false, digits;
    pasteRequestPin({ clipboardData: { getData: () => text }, preventDefault() { prevented = true; } }, value => { digits = value; });
    assert.equal(prevented, true); assert.equal(digits, '123456');
  }
  pasteRequestPin({ clipboardData: { getData: () => '12' }, preventDefault() { assert.fail('partial paste must retain native handling'); } }, () => assert.fail());
});
