import { DEFAULT_CONTENT } from "./lib/defaultContent.js";
import {
  isAuthed,
  createSessionCookie,
  clearSessionCookie,
  isLoginLocked,
  recordFailedLogin,
  clearFailedLogins,
  checkPassword
} from "./lib/auth.js";

const KV_KEY = "site-content";

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function pageShell(title, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} — Kaufman Wash Admin</title>
<link rel="icon" type="image/svg+xml" href="/images/icon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css">
<link rel="stylesheet" href="/css/admin.css">
</head>
<body class="admin-body">
${body}
</body>
</html>`;
}

function loginPage({ error = "", locked = false } = {}) {
  const message = locked
    ? "Too many failed attempts. Try again in a few minutes."
    : error;
  return pageShell("Sign in", `
<div class="admin-login-wrap">
  <form class="admin-login-card" method="POST" action="/admin">
    <span class="eyebrow">Kaufman Wash</span>
    <h1>Admin sign in</h1>
    ${message ? `<p class="admin-error">${escapeHtml(message)}</p>` : ""}
    <label class="admin-field">
      <span>Password</span>
      <input type="password" name="password" autocomplete="current-password" ${locked ? "disabled" : "autofocus"} required>
    </label>
    <button class="btn btn-primary btn-block" type="submit" ${locked ? "disabled" : ""}>Sign in</button>
  </form>
</div>`);
}

function dashboardPage(content) {
  const contentJson = JSON.stringify(content).replace(/</g, "\\u003c");
  return pageShell("Edit site content", `
<header class="admin-header">
  <div class="admin-header-inner">
    <span class="admin-brand">Kaufman Wash <span>· Admin</span></span>
    <div class="admin-header-actions">
      <span id="saveStatus" class="admin-save-status" aria-live="polite"></span>
      <a class="btn btn-ghost btn-sm" href="/index.html" target="_blank" rel="noopener">View site ↗</a>
      <a class="btn btn-ghost btn-sm" href="/admin?logout=1">Log out</a>
    </div>
  </div>
</header>

<main class="admin-main">
  <p class="admin-intro">Edit the text shown on the live site below, then hit Save. Changes go live immediately — no deploy needed.</p>
  <form id="contentForm"></form>
</main>

<script>window.__CONTENT__ = ${contentJson};</script>
<script src="/js/admin.js"></script>`);
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);

  if (url.searchParams.get("logout") === "1") {
    return new Response(null, {
      status: 302,
      headers: { Location: "/admin", "Set-Cookie": clearSessionCookie(request) }
    });
  }

  if (await isAuthed(request, env)) {
    let content = DEFAULT_CONTENT;
    if (env.CONTENT_KV) {
      const stored = await env.CONTENT_KV.get(KV_KEY);
      if (stored) {
        try { content = JSON.parse(stored); } catch { content = DEFAULT_CONTENT; }
      }
    }
    return new Response(dashboardPage(content), { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }

  return new Response(loginPage(), {
    status: 200,
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}

export async function onRequestPost({ request, env }) {
  if (await isLoginLocked(request, env)) {
    return new Response(loginPage({ locked: true }), {
      status: 429,
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }

  if (!env.ADMIN_PASSWORD) {
    return new Response(loginPage({ error: "ADMIN_PASSWORD is not configured for this deployment." }), {
      status: 500,
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }

  const form = await request.formData();
  const password = form.get("password");

  if (!(await checkPassword(request, env, password))) {
    await recordFailedLogin(request, env);
    return new Response(loginPage({ error: "Incorrect password." }), {
      status: 401,
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }

  await clearFailedLogins(request, env);
  const cookie = await createSessionCookie(request, env);
  return new Response(null, {
    status: 302,
    headers: { Location: "/admin", "Set-Cookie": cookie }
  });
}
