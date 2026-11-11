import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile } from '../tools/reconcile-data.mjs';
const database = { giu_requests: [{ id: 'one', display_id: 'GIU-2026-001', requisitioner_name: 'Example', notes: '' }] };
test('maps legacy fields and ignores fields absent from a source', () => {
  assert.equal(reconcile(database, [{id:'one',displayId:'GIU-2026-001'}]).summary.matching, 1);
});
test('preserves differences including blank strings', () => {
  const result = reconcile(database, [{id:'one',requisitionerName:''}]);
  assert.equal(result.summary.different, 1);
  assert.equal(result.requests[0].changes[0].source, '');
});
test('detects cross-ID display collisions and missing rows', () => {
  const result = reconcile(database, [{id:'two', displayId:'giu-2026-001'}, {id:'three',displayId:'GIU-2026-003'}]);
  assert.equal(result.summary.displayIdConflicts,1);
  assert.equal(result.summary.sourceOnly,1);
});
test('rejects duplicate IDs and conflicting aliases', () => {
  assert.throws(() => reconcile(database,[{id:'one'},{id:'one'}]), /duplicate/);
  assert.throws(() => reconcile(database,[{id:'one',displayId:'a',display_id:'b'}]), /Conflicting/);
});
test('compares requester cache independently without overwriting local records', () => {
  const browser = {format:'giu-browser-storage-v1',storage:{
    'giu-nrl-status-tracker':JSON.stringify([{id:'one',requisitionerName:'Example'}]),
    'giu-requester-details-cache':JSON.stringify({one:{requisitionerName:'Changed'}})
  }};
  const result = reconcile(database,browser);
  assert.equal(result.summary.matching,1);
  assert.equal(result.summary.requesterCacheDifferences,1);
});
test('rejects malformed records and corrupted stored JSON', () => {
  assert.throws(() => reconcile(database,[{}]), /missing/);
  assert.throws(() => reconcile(database,{format:'giu-browser-storage-v1',storage:{
    'giu-nrl-status-tracker':'broken','giu-requester-details-cache':null
  }}));
});

test('detects duplicate display IDs among incoming browser rows', () => {
  const result = reconcile(database,[{id:'two',displayId:'GIU-2026-003'},{id:'three',displayId:'giu-2026-003'}]);
  assert.equal(result.summary.displayIdConflicts,2);
});
