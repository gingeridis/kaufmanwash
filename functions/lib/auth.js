/* ============================================================
   Admin session auth — a signed, stateless cookie.
   The session token is "<expiryMs>.<hmac>", where the HMAC is
   computed over the expiry using ADMIN_PASSWORD as the key. That
   means rotating ADMIN_PASSWORD instantly invalidates every
   existing session, with nothing extra to store or revoke.
   ============================================================ */

const COOKIE_NAME = "kw_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_SECONDS = 15 * 60;

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(message, key) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
  return toHex(sig);
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

// Local `wrangler pages dev` serves plain http://localhost, where a
// Secure-flagged cookie would silently be refused by real browsers.
// Cloudflare Pages preview/production is always https, so only omit
// Secure for that one local case.
function secureAttr(request) {
  return new URL(request.url).hostname === "localhost" ? "" : "Secure; ";
}

export async function createSessionCookie(request, env) {
  const expiry = Date.now() + SESSION_TTL_MS;
  const sig = await hmac(String(expiry), env.ADMIN_PASSWORD);
  const token = `${expiry}.${sig}`;
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; ${secureAttr(request)}SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`;
}

export function clearSessionCookie(request) {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; ${secureAttr(request)}SameSite=Lax; Max-Age=0`;
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

export async function isAuthed(request, env) {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return false;
  const [expiryStr, sig] = token.split(".");
  const expiry = Number(expiryStr);
  if (!expiry || !sig || Date.now() > expiry) return false;
  const expectedSig = await hmac(expiryStr, env.ADMIN_PASSWORD);
  return timingSafeEqual(sig, expectedSig);
}

// ---- basic brute-force protection on the password field, keyed by IP ----
function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

export async function isLoginLocked(request, env) {
  if (!env.CONTENT_KV) return false;
  const key = `loginfail:${clientIp(request)}`;
  const count = Number((await env.CONTENT_KV.get(key)) || "0");
  return count >= MAX_LOGIN_ATTEMPTS;
}

export async function recordFailedLogin(request, env) {
  if (!env.CONTENT_KV) return;
  const key = `loginfail:${clientIp(request)}`;
  const count = Number((await env.CONTENT_KV.get(key)) || "0") + 1;
  await env.CONTENT_KV.put(key, String(count), { expirationTtl: LOGIN_LOCKOUT_SECONDS });
}

export async function clearFailedLogins(request, env) {
  if (!env.CONTENT_KV) return;
  await env.CONTENT_KV.delete(`loginfail:${clientIp(request)}`);
}

export async function checkPassword(request, env, password) {
  if (!env.ADMIN_PASSWORD) return false;
  return timingSafeEqual(String(password || ""), env.ADMIN_PASSWORD);
}
