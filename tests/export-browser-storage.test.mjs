import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const script = readFileSync(new URL('../tools/export-browser-storage.js',import.meta.url),'utf8');
test('exports only approved keys and preserves raw storage without writing', async () => {
  const reads=[];
  let blob;
  let downloaded=false;
  const context={
    location:{origin:'https://ritm-giu-tracker.onrender.com',pathname:'/',hostname:'ritm-giu-tracker.onrender.com',protocol:'https:'},
    localStorage:{getItem(key){reads.push(key);return key==='giu-nrl-status-tracker'?'malformed raw data':null;},
      setItem(){throw new Error('Unexpected storage write');},removeItem(){throw new Error('Unexpected deletion');}},
    Blob,URL:{createObjectURL(value){blob=value;return 'blob:test';},revokeObjectURL(){}},
    document:{createElement(){return {click(){downloaded=true;}};}},
    setTimeout(fn){fn();},console:{info(){}}
  };
  vm.runInNewContext(script,context);
  assert.equal(downloaded,true);
  assert.deepEqual(reads,['giu-nrl-status-tracker','giu-requester-details-cache','giu-nrl-user-manager-cache','giu-nrl-last-viewed']);
  const exported=JSON.parse(await blob.text());
  assert.equal(exported.storage['giu-nrl-status-tracker'],'malformed raw data');
  assert.equal(Object.keys(exported.storage).length,4);
});
test('rejects unrelated hosted origins before reading storage', () => {
  assert.throws(()=>vm.runInNewContext(script,{location:{origin:'https://ritm-giu-ipt-portal.onrender.com',hostname:'ritm-giu-ipt-portal.onrender.com',protocol:'https:'}}),/Open the GIU Tracker/);
});
