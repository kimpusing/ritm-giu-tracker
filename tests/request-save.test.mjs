import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';

const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const originalVersion = '2026-11-11T08:00:00.123456+00:00';
const changedVersion = '2026-11-11T08:01:00.654321+00:00';
const row = {
  id: 'existing-request', display_id: 'GIU-2026-001', lab: 'Example Lab',
  program: 'Example', project: 'Original', stage: 'Request received', status: 'In progress',
  priority: 'Routine', assignee: 'GIU - Iona', received: '2026-11-11', target: '2026-11-25',
  updated: '2026-11-11', updated_at: originalVersion, notes: 'Original notes',
  next_step: '', requisitioner_name: 'Example', requisitioner_section: 'Example Lab',
  required_assistance: 'Others',
};
const response = (body, status = 200) => ({ ok: status < 400, status, json: async () => body });

function setup(fetchImplementation) {
  const elements = new Map();
  const storage = new Map();
  const calls = [];
  const notices = [];
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, {
      value: '', textContent: '', disabled: false, open: false,
      classList: { add() {}, toggle() {}, remove() {} },
      reset() {}, reportValidity() { return true; }, focus() {},
      showModal() { this.open = true; }, close() { this.open = false; },
    });
    return elements.get(selector);
  };
  const context = vm.createContext({
    console, crypto: { randomUUID }, AbortController, Date, URL,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    document: { querySelector: element, querySelectorAll: () => [] },
    window: {
      GIU_SUPABASE_CONFIG: { url: 'https://giu-test.invalid', anonKey: 'test-key' },
      setTimeout() { return 1; }, clearTimeout() {}, confirm: () => true,
    },
    fetch: async (url, options) => {
      calls.push({ url: new URL(url), ...options });
      return fetchImplementation(url, options, calls.length);
    },
    notices, fixture: structuredClone(row),
  });
  assert.equal((app.match(/^initialize\(\);$/gm) || []).length, 1);
  // Suppress startup reads; invoke the actual dialog and save/delete entry points.
  vm.runInContext(app.replace(/^initialize\(\);$/m, ''), context);
  vm.runInContext([
    'supabaseClient = {};',
    'currentUser = { id: "staff-user" };',
    'currentProfile = { role: "admin" };',
    'requests = [fromSupabaseRow(fixture)];',
    'getAccessToken = async () => ({token: "test-token"});',
    'renderAssigneeOptions = () => {};',
    'updateStagePreview = () => {};',
    'setSelectValue = (element, value) => { element.value = value; };',
    'validateAssigneeSelection = () => true;',
    'selectedAssignees = () => ["GIU - Iona"];',
    'render = () => {};',
    'showToast = (title, message, type) => notices.push({title, message, type});',
    'setRequestSaveMessage = (message = "", type) => { els.requestSaveMessage.textContent = message; };',
  ].join('\n'), context);
  return { context, storage, calls, notices, element,
    evaluate: source => vm.runInContext(source, context) };
}

test('round-trips the precise timestamp without sending it as editable data', () => {
  const h = setup();
  assert.equal(h.evaluate('requests[0].serverUpdatedAt'), originalVersion);
  assert.equal(h.evaluate('Object.hasOwn(toSupabaseRow(requests[0]), "updated_at")'), false);
});
test('normal edit rejects a stale version after passive refresh and retains entries', async () => {
  const h = setup(() => response([]));
  h.context.openExistingRequest(row.id);
  h.element('#projectName').value = 'My unsaved edit';
  h.evaluate('requests[0].serverUpdatedAt = "2026-11-11T09:00:00+00:00"');
  await h.context.saveRequest();
  assert.equal(h.calls[0].url.searchParams.get('updated_at'), 'eq.' + originalVersion);
  assert.equal(h.calls[0].headers.Prefer, 'return=representation');
  assert.equal(h.element('#requestDialog').open, true);
  assert.equal(h.element('#projectName').value, 'My unsaved edit');
  assert.equal(h.storage.has('giu-requester-details-cache'), false);
  assert.equal(h.notices.some(item => item.type === 'success'), false);
});
test('confirmed save uses the server row and timestamp through the form entry', async () => {
  const h = setup(() => response([{ ...row, project: 'Server value', updated_at: changedVersion }]));
  h.context.openExistingRequest(row.id);
  await h.context.saveRequest();
  assert.equal(h.evaluate('requests[0].project'), 'Server value');
  assert.equal(h.evaluate('requests[0].serverUpdatedAt'), changedVersion);
  assert.equal(JSON.parse(h.calls[0].body).updated_by, 'staff-user');
  assert.equal(h.element('#requestDialog').open, false);
  assert.equal(h.notices.some(item => item.type === 'success'), true);
});
test('browser quota failure after database confirmation produces a cache warning', async () => {
  const h = setup(() => response([{ ...row, updated_at: changedVersion }]));
  h.context.openExistingRequest(row.id);
  h.context.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
  await h.context.saveRequest();
  assert.equal(h.evaluate('requests[0].serverUpdatedAt'), changedVersion);
  assert.equal(h.notices.some(item => item.title === 'Save failed'), false);
  assert.equal(h.notices.some(item => item.message.includes('browser could not store')), true);
});
test('failed new-request retries keep the same UUID', async () => {
  const h = setup(() => { throw new Error('Connection lost'); });
  h.evaluate('requests = []; reserveNextDisplayId = async () => ({data:"GIU-2026-003"});');
  await h.context.openNewRequest();
  await h.context.saveRequest();
  await h.context.saveRequest();
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[0].method, 'POST');
  assert.equal(JSON.parse(h.calls[0].body).id, JSON.parse(h.calls[1].body).id);
  assert.equal(h.element('#requestDialog').open, true);
});
test('missing versions prevent blind updates or deletes', async () => {
  const h = setup(() => { throw new Error('Unexpected network request'); });
  const saved = await h.context.saveSupabaseRequestDirect({}, row.id, true);
  const deleted = await h.context.deleteSupabaseRequestDirect(row.id);
  assert.match(saved.error.message, /version is unavailable/);
  assert.match(deleted.error.message, /version is unavailable/);
  assert.equal(h.calls.length, 0);
});
test('compatibility retry retains the version filter and requester cache', async () => {
  const h = setup((url, options, count) => count === 1
    ? response({ message: 'requisitioner_name missing in schema cache' }, 400)
    : response([{...row, requisitioner_name: undefined, updated_at: changedVersion}]));
  h.context.openExistingRequest(row.id);
  h.element('#requisitionerName').value = 'Local compatibility value';
  await h.context.saveRequest();
  assert.equal(h.calls.length, 2);
  assert.equal(h.calls[1].url.searchParams.get('updated_at'), 'eq.' + originalVersion);
  assert.equal(Object.hasOwn(JSON.parse(h.calls[1].body), 'requisitioner_name'), false);
  assert.equal(h.evaluate('requests[0].requisitionerName'), 'Local compatibility value');
  assert.equal(h.evaluate('requests[0].serverUpdatedAt'), changedVersion);
});
test('editor deletion uses its original version and keeps stale rows visible', async () => {
  const h = setup(() => response([]));
  h.context.openExistingRequest(row.id);
  h.evaluate('requests[0].serverUpdatedAt = "2026-11-11T09:00:00+00:00"');
  await h.context.deleteRequest();
  assert.equal(h.calls[0].method, 'DELETE');
  assert.equal(h.calls[0].url.searchParams.get('updated_at'), 'eq.' + originalVersion);
  assert.equal(h.evaluate('requests.length'), 1);
  assert.equal(h.element('#requestDialog').open, true);
});
test('queue deletion removes only a confirmed row', async () => {
  const h = setup(() => response([{id: row.id}]));
  await h.context.deleteRequestById(row.id);
  assert.equal(h.calls[0].headers.Prefer, 'return=representation');
  assert.equal(h.calls[0].url.searchParams.get('updated_at'), 'eq.' + originalVersion);
  assert.equal(h.evaluate('requests.length'), 0);
});
test('empty, multiple, or mismatched responses never report success', async () => {
  for (const body of [null, [], [row, row], [{...row, id:'other'}], [{id:row.id}]]) {
    const h = setup(() => response(body));
    assert.ok((await h.context.saveSupabaseRequestDirect({}, row.id, true, originalVersion)).error);
  }
  for (const body of [null, [], [{id:'other'}], [{id:row.id},{id:row.id}]]) {
    const h = setup(() => response(body));
    assert.ok((await h.context.deleteSupabaseRequestDirect(row.id, originalVersion)).error);
  }
});
test('permission errors leave the editor open', async () => {
  const h = setup(() => response({message:'Permission denied'},403));
  h.context.openExistingRequest(row.id);
  await h.context.saveRequest();
  assert.equal(h.element('#requestDialog').open,true);
  assert.equal(h.notices.some(item => item.message === 'Permission denied'),true);
});
test('local demo saves retain the original storage path', async () => {
  const h = setup(() => {throw new Error('Unexpected remote request');});
  h.evaluate('supabaseClient = null;');
  h.context.openExistingRequest(row.id);
  h.element('#projectName').value = 'Local edit';
  await h.context.saveRequest();
  assert.equal(h.calls.length,0);
  assert.equal(JSON.parse(h.storage.get('giu-nrl-status-tracker'))[0].project,'Local edit');
});


test('two editors cannot overwrite each other after the first save succeeds', async () => {
  let server = structuredClone(row);
  const api = (url, options) => {
    if (new URL(url).searchParams.get('updated_at') !== 'eq.' + server.updated_at) return response([]);
    server = { ...server, ...JSON.parse(options.body), updated_at: changedVersion };
    return response([structuredClone(server)]);
  };
  const first = setup(api);
  const second = setup(api);
  first.context.openExistingRequest(row.id);
  second.context.openExistingRequest(row.id);
  first.element('#projectName').value = 'First editor change';
  second.element('#projectName').value = 'Second editor change';
  await first.context.saveRequest();
  await second.context.saveRequest();
  assert.equal(server.project, 'First editor change');
  assert.equal(second.element('#requestDialog').open, true);
  assert.equal(second.element('#projectName').value, 'Second editor change');
  assert.equal(second.element('#saveRequest').disabled, false);
});

test('requester fields stay in the editor when both schema and browser storage reject them', async () => {
  const h = setup((url, options, count) => count === 1
    ? response({message:'requisitioner_name missing in schema cache'},400)
    : response([{...row,requisitioner_name:undefined,updated_at:changedVersion}]));
  h.context.openExistingRequest(row.id);
  h.element('#requisitionerName').value = 'Preserve these entries';
  h.context.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
  await h.context.saveRequest();
  assert.equal(h.element('#requestDialog').open, true);
  assert.equal(h.element('#requisitionerName').value, 'Preserve these entries');
  assert.equal(h.evaluate('editingRequestUpdatedAt'), changedVersion);
  assert.equal(h.notices.at(-1).title, 'Request partly saved');
  assert.equal(h.notices.some(item=>item.type==='success'), false);
});
