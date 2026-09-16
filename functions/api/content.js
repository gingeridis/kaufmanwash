import { DEFAULT_CONTENT } from "../lib/defaultContent.js";
import { isAuthed } from "../lib/auth.js";

const KV_KEY = "site-content";
const MAX_BODY_BYTES = 200_000;

export async function onRequestGet({ request, env }) {
  let content = DEFAULT_CONTENT;
  if (env.CONTENT_KV) {
    const stored = await env.CONTENT_KV.get(KV_KEY);
    if (stored) {
      try {
        content = JSON.parse(stored);
      } catch {
        content = DEFAULT_CONTENT;
      }
    }
  }
  return new Response(JSON.stringify(content), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequestPut({ request, env }) {
  if (!(await isAuthed(request, env))) {
    return new Response(JSON.stringify({ error: "Not authenticated." }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!env.CONTENT_KV) {
    return new Response(JSON.stringify({ error: "CONTENT_KV is not bound to this project." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ error: "Content payload is too large." }), {
      status: 413,
      headers: { "Content-Type": "application/json" }
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new Response(JSON.stringify({ error: "Body must be valid JSON." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return new Response(JSON.stringify({ error: "Body must be a JSON object." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const expectedKeys = Object.keys(DEFAULT_CONTENT);
  const missing = expectedKeys.filter(k => !(k in parsed));
  if (missing.length) {
    return new Response(JSON.stringify({ error: `Missing sections: ${missing.join(", ")}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  await env.CONTENT_KV.put(KV_KEY, JSON.stringify(parsed));
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
