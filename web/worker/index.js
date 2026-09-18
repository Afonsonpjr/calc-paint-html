const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";
const MAX_IMAGE_B64_LEN = 8_000_000;
const MAX_IMAGE_DIM = 4096;
const DEFAULT_MODEL = "gemini-3.1-flash-lite";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    rows: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          finish_tag: { type: "STRING" },
          section: { type: "STRING" },
          category: { type: "STRING" },
          description: { type: "STRING" },
          manufacturer: { type: "STRING" },
          style: { type: "STRING" },
          spec_color: { type: "STRING" },
          size: { type: "STRING" },
        },
        required: ["finish_tag"],
      },
    },
  },
  required: ["rows"],
};

const PROMPT = [
  "This image is a crop of a construction finish/material SCHEDULE table.",
  "Extract every finish row into JSON.",
  "Fields: finish_tag, section, category, description, manufacturer, style, spec_color, size.",
  "category must be one of floor, base, wall, transition, ceiling, other.",
  "Do not invent rows or fields. Use empty strings for missing cells.",
].join(" ");

function json(status, body, extraHeaders = {}) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}

function parseHdList(value) {
  return [...new Set(String(value || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean))].sort();
}

async function verifyGoogleUser(authHeader, allowedDomains) {
  const token = /^Bearer\s+(.+)$/i.exec(authHeader || "")?.[1];
  if (!token) return { ok: false, status: 401, error: "Sign in to import from scanned plans." };

  let res;
  try {
    res = await fetch(GOOGLE_USERINFO, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    return { ok: false, status: 502, error: "Couldn't verify your sign-in." };
  }
  if (!res.ok) return { ok: false, status: 401, error: "Session expired — sign in again." };

  const profile = await res.json().catch(() => ({}));
  const email = String(profile.email || "").toLowerCase();
  if (!email || profile.email_verified === false) {
    return { ok: false, status: 401, error: "Your Google sign-in doesn't have a verified email." };
  }

  const domain = String(profile.hd || email.split("@")[1] || "").toLowerCase();
  if (!allowedDomains.includes(domain)) {
    return { ok: false, status: 403, error: "This deployment is limited to an approved organization." };
  }
  return { ok: true, email };
}

async function readSchedule(env, imageB64) {
  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { mime_type: "image/png", data: imageB64 } }, { text: PROMPT }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
    }),
  });

  if (!res.ok) {
    const snippet = (await res.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 240);
    console.error(`parse-schedule: Gemini HTTP ${res.status}${snippet ? ` — ${snippet}` : ""}`);
    if (res.status === 429) throw Object.assign(new Error("rate limited"), { status: 429 });
    throw Object.assign(new Error("Gemini request failed"), { status: 502 });
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const parsed = JSON.parse(text);
  return Array.isArray(parsed.rows) ? parsed.rows : [];
}

async function parseSchedule(request, env) {
  if (!env.GEMINI_API_KEY) return json(501, { error: "scan reader not configured" });

  // Fail closed. A paid AI endpoint must never silently become available to any Google account.
  const allowedDomains = parseHdList(env.ALLOWED_HD);
  if (!allowedDomains.length) {
    console.error("parse-schedule: GEMINI_API_KEY is configured but ALLOWED_HD is empty");
    return json(503, { error: "scan reader organization gate not configured" });
  }

  const auth = await verifyGoogleUser(request.headers.get("Authorization"), allowedDomains);
  if (!auth.ok) return json(auth.status, { error: auth.error });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: "bad JSON" }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { error: "bad JSON" });

  const imageB64 = typeof body.image_b64 === "string" ? body.image_b64 : "";
  if (!imageB64) return json(400, { error: "image_b64 required" });
  if (imageB64.length > MAX_IMAGE_B64_LEN) return json(413, { error: "image too large" });

  const width = Number(body.width);
  const height = Number(body.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || width > MAX_IMAGE_DIM || height > MAX_IMAGE_DIM) {
    return json(400, { error: "invalid image dimensions" });
  }

  try {
    const rows = await readSchedule(env, imageB64);
    return json(200, { rows });
  } catch (error) {
    if (error?.status === 429) return json(429, { error: "The schedule reader is rate limited right now — try again shortly." });
    console.error("parse-schedule:", error?.message || error);
    return json(502, { error: "couldn't read the schedule" });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/ai/parse-schedule") {
      if (request.method !== "POST") return json(405, { error: "POST only" }, { Allow: "POST" });
      return parseSchedule(request, env);
    }
    if (url.pathname.startsWith("/ai/")) return json(404, { error: "unknown API route" });
    return new Response(null, { status: 404 });
  },
};
