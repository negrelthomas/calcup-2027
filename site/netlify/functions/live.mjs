// CalCup live scoring API (Netlify Function + Netlify Blobs).
//
// Routes (all on /.netlify/functions/live?op=...):
//   GET  op=game&no=N          public   meta and full event log of one game
//   GET  op=all                public   score, phase and clock of every game that has a log
//   POST op=login  {pin,name}           returns a session token for the scorer app (5 days)
//   POST op=setup  Bearer      {no, meta, dev, takeover}  opens a game on this device
//   POST op=push   Bearer      {no, dev, clientNow, events[]}  appends events (safe to resend)
//   POST op=reset  Bearer admin {no}    deletes the log of one game
//
// One device scores a game at a time. Another device can take over with takeover=true,
// for example when the phone runs out of battery. Events are never edited: a correction is a
// "void" event that cancels an earlier one, so every change stays visible in the log.
//
// Public reads are cached at the Netlify CDN for a few seconds, so hundreds of viewers polling
// the match center cost about one function call per game every few seconds.
//
// Environment (Netlify > Site configuration > Environment variables):
//   SCORER_PIN        code given to the table crews to open the scorer app (at least 6 characters)
//   VOTE_ADMIN_TOKEN  also opens the scorer app, with reset rights
import { getStore } from "@netlify/blobs";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import core from "../../assets/live-core.js";

const SESSION_TTL = 5 * 24 * 3600 * 1000;
const LOCK_IDLE = 3 * 60 * 1000; // a device that sent nothing for 3 minutes no longer holds the game
const MAX_EVENTS = 1500;
const GAME_RE = /^(?:[0-9]{1,3}|P[0-9])$/;

const store = () => getStore({ name: "calcup-live", consistency: "strong" });
const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
function safeEq(a, b) {
  const x = Buffer.from(String(a || "")), y = Buffer.from(String(b || ""));
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}
function json(data, status = 200, cdn = 0) {
  const h = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  if (cdn) { h["Cache-Control"] = "public, max-age=0, must-revalidate"; h["Netlify-CDN-Cache-Control"] = `public, s-maxage=${cdn}, stale-while-revalidate=${cdn * 3}`; }
  return new Response(JSON.stringify(data), { status, headers: h });
}
const err = (status, code, message) => json({ error: code, message }, status);
const str = (s, n) => String(s == null ? "" : s).replace(/[<>]/g, "").trim().slice(0, n);

async function session(req, st) {
  const h = req.headers.get("authorization") || "";
  const tok = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (!tok) return null;
  const s = await st.get("sess/" + sha(tok), { type: "json" });
  return s && s.exp > Date.now() ? s : null;
}

// Read, change, write with a version check, retried if another write landed in between.
async function update(st, key, fn) {
  for (let i = 0; i < 5; i++) {
    const cur = await st.getWithMetadata(key, { type: "json" });
    const res = fn(cur ? cur.data : null);
    if (res.error) return res;
    const opt = cur && cur.etag ? { onlyIfMatch: cur.etag } : { onlyIfNew: true };
    const w = await st.setJSON(key, res.value, opt);
    if (!w || w.modified !== false) return res;
  }
  return { error: [409, "busy", "Too many changes at once, try again."] };
}

async function saveSummary(st, no, game) {
  const line = { ...core.summary(game.meta, game.events, Date.now()), teamA: game.meta.teamA, teamB: game.meta.teamB, practice: !!game.meta.practice, at: Date.now() };
  await update(st, "summary", (cur) => ({ value: { ...(cur || {}), [no]: line } }));
}

function cleanMeta(m, no) {
  m = m || {};
  const half = Number(m.halfLen);
  return {
    no, teamA: str(m.teamA, 40), teamB: str(m.teamB, 40), nameA: str(m.nameA, 60), nameB: str(m.nameB, 60),
    division: m.division === "W" ? "W" : "M", label: str(m.label, 60), halfLen: half >= 10 && half <= 30 ? Math.round(half) : 25,
    practice: /^P/.test(no)
  };
}

export default async (req) => {
  const url = new URL(req.url);
  const op = url.searchParams.get("op") || "";
  const st = store();
  let body = null;
  if (req.method === "POST") body = await req.json().catch(() => null);

  try {
    if (op === "game" && req.method === "GET") {
      const no = url.searchParams.get("no") || "";
      if (!GAME_RE.test(no)) return err(400, "bad_game");
      const g = await st.get("game/" + no, { type: "json" });
      if (!g) return json({ no, exists: false, serverNow: Date.now() }, 200, 3);
      return json({ no, exists: true, meta: g.meta, events: g.events, seq: g.seq, serverNow: Date.now(), scorer: g.owner ? g.owner.name : "" }, 200, 3);
    }

    if (op === "all" && req.method === "GET") {
      const s = (await st.get("summary", { type: "json" })) || {};
      return json({ games: s, serverNow: Date.now() }, 200, 5);
    }

    if (op === "login" && req.method === "POST") {
      const pin = str(body && body.pin, 80), name = str(body && body.name, 40);
      if (!name) return err(400, "name_required", "Enter your name.");
      const hour = "fail/" + new Date().toISOString().slice(0, 13);
      const fails = (await st.get(hour, { type: "json" })) || { n: 0 };
      if (fails.n >= 30) return err(429, "locked", "Too many wrong codes. Try again in an hour.");
      let role = null;
      if (process.env.VOTE_ADMIN_TOKEN && safeEq(pin, process.env.VOTE_ADMIN_TOKEN)) role = "admin";
      else if (process.env.SCORER_PIN && process.env.SCORER_PIN.length >= 6 && safeEq(pin, process.env.SCORER_PIN)) role = "scorer";
      if (!role) { await st.setJSON(hour, { n: fails.n + 1 }); return err(401, "bad_pin", "This code is not valid."); }
      const tok = randomBytes(24).toString("hex");
      await st.setJSON("sess/" + sha(tok), { role, name, exp: Date.now() + SESSION_TTL });
      return json({ token: tok, role, name });
    }

    // everything below needs a scorer session
    const me = await session(req, st);
    if (!me) return err(401, "signin", "Sign in again.");
    const no = String((body && body.no) || "");
    if (!GAME_RE.test(no)) return err(400, "bad_game");
    const dev = str(body && body.dev, 40);
    const key = "game/" + no;

    if (op === "setup" && req.method === "POST") {
      if (!dev) return err(400, "bad_device");
      const res = await update(st, key, (g) => {
        const now = Date.now();
        if (!g) return { value: { meta: cleanMeta(body.meta, no), events: [], seq: 0, owner: { dev, name: me.name, at: now }, created: now } };
        const held = g.owner && g.owner.dev !== dev && now - g.owner.at < LOCK_IDLE;
        if (held && !body.takeover) return { error: [409, "held", `${g.owner.name} is scoring this game on another device.`] };
        const next = { ...g, owner: { dev, name: me.name, at: now } };
        if (!g.events.length && body.meta) next.meta = cleanMeta(body.meta, no); // settings can change until the first event
        return { value: next };
      });
      if (res.error) return err(...res.error);
      return json({ ok: true, meta: res.value.meta, events: res.value.events, seq: res.value.seq, serverNow: Date.now() });
    }

    if (op === "push" && req.method === "POST") {
      const incoming = Array.isArray(body.events) ? body.events.slice(0, 200) : [];
      const offset = Date.now() - (Number(body.clientNow) || Date.now());
      const res = await update(st, key, (g) => {
        if (!g) return { error: [404, "no_game", "Open the game first."] };
        if (g.owner && g.owner.dev !== dev) return { error: [409, "taken", `${g.owner.name} took over this game on another device.`] };
        const seen = new Set(g.events.map((e) => e.id));
        const events = g.events.slice(); let seq = g.seq || 0; const accepted = [];
        for (const raw of incoming) {
          const e = core.clean(raw);
          if (!e) continue;
          if (seen.has(e.id)) { accepted.push(e.id); continue; }
          if (events.length >= MAX_EVENTS) break;
          e.w = (e.w || Date.now() - offset) + offset; e.seq = ++seq; e.by = me.name;
          events.push(e); seen.add(e.id); accepted.push(e.id);
        }
        return { value: { ...g, events, seq, owner: { dev, name: me.name, at: Date.now() }, updated: Date.now() }, accepted };
      });
      if (res.error) return err(...res.error);
      await saveSummary(st, no, res.value);
      return json({ ok: true, accepted: res.accepted, seq: res.value.seq, serverNow: Date.now() });
    }

    if (op === "reset" && req.method === "POST") {
      if (me.role !== "admin") return err(403, "admin_only", "Only an organizer can reset a game.");
      await st.delete(key);
      await update(st, "summary", (cur) => { const v = { ...(cur || {}) }; delete v[no]; return { value: v }; });
      return json({ ok: true });
    }

    return err(404, "unknown_op");
  } catch (e) {
    return err(500, "server", String(e && e.message || e));
  }
};
