import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleLogin, sessionRole } from '../src/auth.js';

// Minimal stand-in for the D1 binding (login attempt bookkeeping only).
const db = { prepare: () => ({ bind: () => ({ first: async () => ({ n: 0 }) }) }), batch: async () => {} };
const env = { DB: db, DASHBOARD_PASSWORD: 'team-pass', VIEWER_PASSWORD: 'view-pass', SESSION_SECRET: 's3cret' };

async function login(password, e = env) {
  const res = await handleLogin(new Request('https://x.test/api/login', { method: 'POST', body: JSON.stringify({ password }) }), e);
  const cookie = (res.headers.get('Set-Cookie') || '').split(';')[0];
  return { status: res.status, role: cookie ? await sessionRole(new Request('https://x.test/', { headers: { Cookie: cookie } }), e) : null, cookie };
}

test('team password signs in as editor, viewer password as viewer', async () => {
  assert.equal((await login('team-pass')).role, 'editor');
  assert.equal((await login('view-pass')).role, 'viewer');
  assert.equal((await login('wrong')).status, 401);
});

test('viewer password does nothing when not configured', async () => {
  assert.equal((await login('view-pass', { ...env, VIEWER_PASSWORD: undefined })).status, 401);
});

test('a viewer cookie cannot be edited into an editor cookie', async () => {
  const { cookie } = await login('view-pass');
  const forged = cookie.replace('.viewer.', '.editor.');
  assert.equal(await sessionRole(new Request('https://x.test/', { headers: { Cookie: forged } }), env), null);
});
