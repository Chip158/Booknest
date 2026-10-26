// Shared-password login. Passwords live only as encrypted Worker secrets:
//   DASHBOARD_PASSWORD  team password — full access ("editor")
//   VIEWER_PASSWORD     optional view-only password ("viewer"): can see and
//                       filter everything, can't change anything
// A successful login sets an HttpOnly, Secure, SameSite=Strict cookie that
// carries the role and is signed with SESSION_SECRET (HMAC-SHA256).

const COOKIE = 'ais_session';
const SESSION_DAYS = 30;
const MAX_FAILED = 8; // per IP per 15 minutes

const enc = new TextEncoder();

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => ({ '+': '-', '/': '_', '=': '' })[c]);
}

async function digest(s) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s)));
}

// Constant-time comparison of two strings (via fixed-length digests).
async function safeEqual(a, b) {
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

function assertConfigured(env) {
  if (!env.DASHBOARD_PASSWORD || !env.SESSION_SECRET) {
    throw new Error('DASHBOARD_PASSWORD and SESSION_SECRET secrets must be set (see README).');
  }
}

const ROLES = ['editor', 'viewer'];

// Returns the signed-in role ('editor' | 'viewer'), or null.
export async function sessionRole(request, env) {
  assertConfigured(env);
  const token = readCookie(request, COOKIE);
  if (!token) return null;
  const [exp, role, sig] = token.split('.');
  if (!exp || !sig || !ROLES.includes(role) || Number(exp) < Date.now()) return null;
  return (await safeEqual(sig, await hmac(env.SESSION_SECRET, `v2.${exp}.${role}`))) ? role : null;
}

function cookieHeader(value, maxAge, secure) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
}

export async function handleLogin(request, env) {
  assertConfigured(env);
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const since = Date.now() - 15 * 60 * 1000;
  const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ? AND at > ?').bind(ip, since).first();
  if (n >= MAX_FAILED) return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });

  let password = '';
  try {
    password = String((await request.json()).password || '');
  } catch {}

  // Always run both comparisons so timing doesn't reveal which password matched.
  const [isEditor, isViewer] = await Promise.all([
    safeEqual(password, env.DASHBOARD_PASSWORD),
    env.VIEWER_PASSWORD ? safeEqual(password, env.VIEWER_PASSWORD) : false,
  ]);
  const role = isEditor ? 'editor' : isViewer ? 'viewer' : null;
  if (!role) {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO login_attempts (ip, at) VALUES (?, ?)').bind(ip, Date.now()),
      env.DB.prepare('DELETE FROM login_attempts WHERE at < ?').bind(since),
    ]);
    return Response.json({ error: 'Wrong password.' }, { status: 401 });
  }

  const exp = Date.now() + SESSION_DAYS * 86400000;
  const token = `${exp}.${role}.${await hmac(env.SESSION_SECRET, `v2.${exp}.${role}`)}`;
  const secure = new URL(request.url).protocol === 'https:';
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': cookieHeader(token, SESSION_DAYS * 86400, secure) } });
}

export function handleLogout(request) {
  const secure = new URL(request.url).protocol === 'https:';
  return new Response(null, { status: 302, headers: { Location: '/login.html', 'Set-Cookie': cookieHeader('', 0, secure) } });
}
