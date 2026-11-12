import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
function setup(auth, location = new URL('https://giu-test.invalid/')) {
  const elements = new Map();
  let focused;
  function element(selector) {
    if (!elements.has(selector)) {
      const classes = new Set();
      elements.set(selector, {
        value: '', disabled: false, open: false, validity: { valid: true },
        classList: {
          toggle(name, active) { if (active) classes.add(name); else classes.delete(name); },
          contains(name) { return classes.has(name); },
        },
        closest: () => element(selector + '-label'),
        focus() { focused = selector; },
        setAttribute() {}, removeAttribute() {}, reset() {},
        showModal() { this.open = true; },
        close() { this.open = false; },
      });
    }
    return elements.get(selector);
  }
  const context = vm.createContext({
    document: { querySelector: element, querySelectorAll: () => [], body: element('body') },
    localStorage: { getItem: () => null, setItem() {} },
    crypto: { randomUUID },
    window: {
      setTimeout, clearTimeout,
      location,
      history: { replaceState(_state, _title, url) { location.href = url; } },
    },
    URL, URLSearchParams, auth,
  });
  vm.runInContext(source.replace(/^initialize\(\);$/m, ''), context);
  vm.runInContext('supabaseClient = { auth };', context);
  return {
    element, open: mode => context.openAuthDialog(mode), switchTo: mode => context.setAuthMode(mode),
    submit: () => context.handleAuthSubmit({ preventDefault() {} }), focused: () => focused,
    evaluate: script => vm.runInContext(script, context),
  };
}

test('recovery preserves the email, clears the password, and prevents duplicate sends', async () => {
  let release;
  let calls = 0;
  const h = setup({ resetPasswordForEmail(email, options) {
    calls++;
    assert.equal(email, 'staff@example.invalid');
    assert.equal(options.redirectTo, 'https://giu-test.invalid/?password_reset=1');
    return new Promise(resolve => { release = resolve; });
  } });
  h.open('sign-in');
  h.element('#authEmail').value = 'staff@example.invalid';
  h.element('#authPassword').value = 'sample-password';
  h.switchTo('recover');
  assert.equal(h.element('#authPassword').value, '');
  assert.ok(h.element('#authPasswordField').classList.contains('hidden'));
  const pending = h.submit();
  await h.submit();
  assert.equal(calls, 1);
  release({});
  await pending;
  assert.equal(h.element('#authTitle').textContent, 'Check your email');
  assert.match(h.element('#authCopy').textContent, /If an account exists/);
  assert.ok(h.element('#authSubmit').classList.contains('hidden'));
  assert.equal(h.focused(), '#authTitle');
});

test('a reset failure stays in the recovery form and restores its controls', async () => {
  const h = setup({ resetPasswordForEmail: async () => ({ error: { status: 429 } }) });
  h.open('recover');
  h.element('#authEmail').value = 'staff@example.invalid';
  await h.submit();
  assert.equal(h.element('#authTitle').textContent, 'Reset your password');
  assert.match(h.element('#authMessage').textContent, /Too many requests/);
  assert.equal(h.element('#authSubmit').disabled, false);
});

test('registration requiring confirmation clears the password and explains approval', async () => {
  const h = setup({ signUp: async ({ options }) => {
    assert.equal(options.data.full_name, 'Sample Staff');
    return { data: { session: null } };
  } });
  h.open('create');
  h.element('#authName').value = 'Sample Staff';
  h.element('#authEmail').value = 'staff@example.invalid';
  h.element('#authPassword').value = 'sample-password';
  await h.submit();
  assert.equal(h.element('#authTitle').textContent, 'Check your email');
  assert.equal(h.element('#authPassword').value, '');
  assert.match(h.element('#authCopy').textContent, /administrator reviews new accounts/);
});

test('immediate signup session shows approval confirmation', async () => {
  const h = setup({ signUp: async () => ({ data: { session: {} } }) });
  h.evaluate('ensurePendingProfile = async () => {};');
  h.open('create');
  h.element('#authName').value = 'Sample Staff';
  h.element('#authEmail').value = 'staff@example.invalid';
  h.element('#authPassword').value = 'sample-password';
  await h.submit();
  assert.equal(h.element('#authTitle').textContent, 'Awaiting GIU approval');
  assert.ok(h.element('#authSubmit').classList.contains('hidden'));
});

test('expired recovery link clears the redirect and offers a fresh link', async () => {
  const location = new URL('https://giu-test.invalid/?password_reset=1#error_code=otp_expired&error_description=Email+link+expired');
  const h = setup({}, location);
  await h.evaluate('finishAuthRedirect()');
  assert.equal(location.href, 'https://giu-test.invalid/');
  assert.equal(h.element('#authTitle').textContent, 'Reset your password');
  assert.equal(h.element('#authSubmit').textContent, 'Send reset link');
  assert.match(h.element('#authMessage').textContent, /expired or was already used/);
});

test('recovery rejects mismatched passwords before saving a matching pair', async () => {
  let changes = 0;
  const h = setup({ updateUser: async ({ password }) => {
    assert.equal(password, 'sample-password');
    changes++;
    return {};
  } });
  h.evaluate('currentSession = {}; ensurePendingProfile = loadProfile = loadSupabaseRequests = async () => {}; render = showToast = () => {};');
  h.open('reset');
  h.element('#authPassword').value = 'sample-password';
  h.element('#authConfirmPassword').value = 'different-password';
  await h.submit();
  assert.match(h.element('#authMessage').textContent, /do not match/);
  assert.equal(changes, 0);
  h.element('#authConfirmPassword').value = 'sample-password';
  await h.submit();
  assert.equal(changes, 1);
  assert.equal(h.element('#authDialog').open, false);
});

test('sign-in keeps the loader open until the queue resolves and restores the form on failure', async () => {
  let result = { error: { status: 400 } };
  const h = setup({ signInWithPassword: async () => result });
  h.evaluate('loadProfile = async () => {}; render = () => {}; loadSupabaseRequests = () => new Promise(resolve => { globalThis.finishQueue = resolve; });');
  h.open('sign-in');
  h.element('#authEmail').value = 'staff@example.invalid';
  h.element('#authPassword').value = 'sample-password';
  await h.submit();
  assert.match(h.element('#authMessage').textContent, /Check your email and password/);
  assert.ok(h.element('#signInLoader').classList.contains('hidden'));
  result = { data: { session: { access_token: 'sample', user: { id: 'sample' } } } };
  const submission = h.submit();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.element('#signInProgress').textContent, 'Loading your workspace…');
  assert.ok(h.element('#authForm').classList.contains('hidden'));
  h.evaluate('finishQueue()');
  await submission;
  assert.equal(h.element('#authDialog').open, false);
  assert.equal(h.focused(), '#mainContent');
});

test('workspace controls reflect the role and disappear after the session ends', () => {
  const h = setup({});
  h.evaluate('currentUser = { id: "sample" };');
  for (const [role, canCreate, canManage] of [
    ['admin', true, true], ['giu', true, false], ['nrl', false, false], ['pending', false, false],
  ]) {
    h.evaluate('currentProfile = { role: ' + JSON.stringify(role) + ' }; updateAccessControls();');
    assert.equal(!h.element('#newRequest').classList.contains('hidden'), canCreate);
    assert.equal(!h.element('#manageUsers').classList.contains('hidden'), canManage);
  }
  h.evaluate('currentUser = currentProfile = null; updateAccessControls();');
  assert.ok(h.element('#workspace').classList.contains('hidden'));
  assert.ok(!h.element('#signInLanding').classList.contains('hidden'));
});
