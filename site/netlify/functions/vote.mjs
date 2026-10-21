// CalCup 2027 MVP / MVG voting API (Netlify Function + Netlify Blobs).
//
// Routes (all on /.netlify/functions/vote?op=...):
//   POST op=sync     x-sync-token  GitHub Action pushes voters, players, deadline from the workbook
//   POST op=code     {email}       emails a 6 digit sign in code to a listed voter
//   POST op=verify   {email,code}  returns a session token
//   GET  op=me       Bearer        voter profile, eligible players, ballots, notes
//   PUT  op=notes    Bearer        {text, stars[]} private notes, any time
//   PUT  op=ballot   Bearer        {role, cat, picks[3]} one category of one ballot, until the deadline
//   POST op=logout   Bearer
//   GET  op=admin    x-admin-token voters status, tallies, export (VOTE_ADMIN_TOKEN)
//
// Environment (Netlify > Site configuration > Environment variables):
//   VOTE_SYNC_TOKEN   shared with the GitHub secret of the same name
//   VOTE_ADMIN_TOKEN  for vote-admin.html
//   RESEND_API_KEY    email sender; VOTE_FROM e.g. "CalCup 2027 <calcup@calheat.com>"
//   VOTE_DEADLINE     optional ISO override of the deadline computed from the schedule
//   VOTE_DEV_CODES=1  testing only: returns the code in the response instead of emailing it
import { randomBytes, randomInt } from "node:crypto";
const CODE_TTL = 10 * 60 * 1000, SESSION_TTL = 21 * 24 * 3600 * 1000;
import { CATS, store, sha, normEmail, json, err, safeEq, loadRoster, deadlineOf, isClosed, eligible, sendEmail, tally, allBallots, TECH_DOC, techDocVersion, ackDeadlineOf, coachRoles } from "../voting-core.mjs";

async function session(req, st) {
  const h = req.headers.get("authorization") || "";
  const tok = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (!tok) return null;
  const s = await st.get("sess/" + sha(tok), { type: "json" });
  if (!s || s.exp < Date.now()) return null;
  return { ...s, key: "sess/" + sha(tok) };
}

export default async (req) => {
  const url = new URL(req.url);
  const op = url.searchParams.get("op") || "";
  const st = store();
  let body = null;
  if (req.method === "POST" || req.method === "PUT") body = await req.json().catch(() => null);

  try {
    // ---------- sync from the GitHub Action ----------
    if (op === "sync") {
      if (!safeEq(req.headers.get("x-sync-token"), process.env.VOTE_SYNC_TOKEN)) return err(401, "unauthorized");
      if (!body || !Array.isArray(body.voters) || !Array.isArray(body.players)) return err(400, "bad_payload");
      const next = { ...body, syncedAt: new Date().toISOString() };
      const h = sha(JSON.stringify({ ...body }));
      const prev = await loadRoster(st);
      if (prev && prev.hash === h) return json({ ok: true, changed: false, voters: body.voters.length, players: body.players.length });
      next.hash = h;
      await st.setJSON("roster", next);
      return json({ ok: true, changed: true, voters: body.voters.length, players: body.players.length, deadline: body.deadline });
    }

    // ---------- public status ----------
    if (op === "status") {
      const roster = await loadRoster(st);
      const d = deadlineOf(roster);
      return json({ ready: !!roster, deadline: d ? new Date(d).toISOString() : null, closed: isClosed(roster), now: Date.now() });
    }

    // ---------- sign in ----------
    if (op === "code") {
      const email = normEmail(body && body.email);
      if (!email) return err(400, "email_required", "Enter your email address.");
      const roster = await loadRoster(st);
      if (!roster) return err(503, "not_ready", "Voting is not set up yet.");
      const person = roster.voters.find((v) => v.email === email);
      if (!person) return err(404, "not_listed", "This email is not on the voter list. Contact calcup@calheat.com.");
      const key = "code/" + sha(email);
      const prev = await st.get(key, { type: "json" });
      const now = Date.now();
      const sent = (prev && prev.sent ? prev.sent : []).filter((t) => now - t < 3600 * 1000);
      if (sent.length && now - sent[sent.length - 1] < 45 * 1000) return err(429, "too_soon", "A code was just sent. Wait a minute before asking again.");
      if (sent.length >= 6) return err(429, "too_many", "Too many codes requested. Try again in an hour.");
      const code = String(randomInt(0, 1000000)).padStart(6, "0");
      await st.setJSON(key, { h: sha(email + ":" + code), exp: now + CODE_TTL, tries: 0, sent: sent.concat(now) });
      if (process.env.VOTE_DEV_CODES === "1") return json({ ok: true, devCode: code });
      const r = await sendEmail(email, "Your CalCup voting code: " + code,
        "Hello " + person.name + ",\n\nYour CalCup 2027 voting sign in code is " + code + ". It expires in 10 minutes.\n\n" +
        "If you did not ask for this code, you can ignore this email.\n\nCalCup 2027 organizing committee\ncalcup@calheat.com");
      if (!r.ok) return err(502, "email_failed", "The code could not be emailed. Contact calcup@calheat.com.");
      return json({ ok: true });
    }

    if (op === "verify") {
      const email = normEmail(body && body.email); const code = String((body && body.code) || "").replace(/\D/g, "");
      const key = "code/" + sha(email);
      const rec = await st.get(key, { type: "json" });
      if (!rec || !rec.h || rec.exp < Date.now()) return err(400, "expired", "This code has expired. Ask for a new one.");
      if (rec.tries >= 5) return err(429, "locked", "Too many attempts. Ask for a new code.");
      if (rec.h !== sha(email + ":" + code)) { rec.tries++; await st.setJSON(key, rec); return err(400, "wrong_code", "This code is not correct."); }
      await st.setJSON(key, { sent: rec.sent || [] }); // single use
      const roster = await loadRoster(st);
      const person = roster && roster.voters.find((v) => v.email === email);
      if (!person) return err(404, "not_listed");
      const tok = randomBytes(32).toString("hex");
      await st.setJSON("sess/" + sha(tok), { email, exp: Date.now() + SESSION_TTL });
      return json({ ok: true, token: tok });
    }

    // ---------- admin ----------
    if (op === "admin") {
      if (!safeEq(req.headers.get("x-admin-token"), process.env.VOTE_ADMIN_TOKEN)) return err(401, "unauthorized");
      const roster = await loadRoster(st);
      if (!roster) return json({ ready: false });
      const ballots = await allBallots(st);
      const voters = roster.voters.map((v) => ({
        name: v.name, email: v.email, exclude: v.exclude,
        roles: v.roles.map((r) => {
          const b = ballots[r.id];
          const done = CATS.filter((c) => b && b.cats && b.cats[c.id] && b.cats[c.id].picks && b.cats[c.id].picks.length).map((c) => c.id);
          return { id: r.id, label: r.label, voterTeam: r.voterTeam, done, updated: b ? b.updated : null };
        })
      }));
      const ad = ackDeadlineOf(roster);
      const coachByTeam = {};
      roster.voters.forEach((v) => v.roles.forEach((r) => { if (r.type === "coach") coachByTeam[r.team] = { v, r }; }));
      const ackTeams = (roster.registeredTeams && roster.registeredTeams.length ? roster.registeredTeams : Object.keys(coachByTeam));
      const acks = [];
      for (const tid of ackTeams) {
        const c = coachByTeam[tid];
        const t = (roster.teams || []).find((x) => x.id === tid);
        const a = c ? await st.get("ack/" + c.r.id, { type: "json" }) : null;
        acks.push({ team: t ? t.name : tid, coach: c ? c.v.name : null, email: c ? c.v.email : null,
          status: !c ? "no_coach" : !a ? "missing" : a.late ? "late" : "on_time", ts: a ? a.ts : null,
          version: a ? a.version : null, current: a ? a.version === techDocVersion() : null });
      }
      const ackInfo = { deadline: ad ? new Date(ad).toISOString() : null, version: techDocVersion(), doc: TECH_DOC, items: acks };
      return json({ ack: ackInfo, ready: true, deadline: deadlineOf(roster) ? new Date(deadlineOf(roster)).toISOString() : null,
        closed: isClosed(roster), syncedAt: roster.syncedAt, missingEmail: roster.missingEmail || [],
        cats: CATS, teams: roster.teams, players: roster.players, sheetOrder: roster.sheetOrder || [], voters, ballots, tally: tally(roster, ballots) });
    }

    // ---------- signed in routes ----------
    const s = await session(req, st);
    if (!s) return err(401, "signed_out", "Please sign in again.");
    if (op === "logout") { await st.delete(s.key); return json({ ok: true }); }
    const roster = await loadRoster(st);
    const person = roster && roster.voters.find((v) => v.email === s.email);
    if (!person) return err(403, "not_listed", "You are no longer on the voter list. Contact calcup@calheat.com.");

    if (op === "me") {
      const ballots = {};
      for (const r of person.roles) ballots[r.id] = (await st.get("ballot/" + r.id, { type: "json" })) || { cats: {} };
      const notes = (await st.get("notes/" + person.id, { type: "json" })) || { text: "", stars: [] };
      const pool = {}; CATS.forEach((c) => (pool[c.id] = eligible(roster, person, c.id).map((p) => p.id)));
      const d = deadlineOf(roster);
      const ackItems = {};
      for (const r of coachRoles(person)) ackItems[r.id] = await st.get("ack/" + r.id, { type: "json" });
      const ad = ackDeadlineOf(roster);
      const ack = { doc: TECH_DOC, version: techDocVersion(), deadline: ad ? new Date(ad).toISOString() : null, items: ackItems };
      return json({ ack, person: { name: person.name, email: person.email, roles: person.roles, exclude: person.exclude },
        deadline: d ? new Date(d).toISOString() : null, closed: isClosed(roster),
        cats: CATS, teams: roster.teams, players: roster.players, pool, ballots, notes });
    }

    if (op === "notes" && req.method === "PUT") {
      const text = String((body && body.text) || "").slice(0, 20000);
      const ids = new Set((roster.players || []).map((p) => p.id));
      const stars = Array.isArray(body && body.stars) ? body.stars.filter((x) => ids.has(x)).slice(0, 200) : [];
      const rec = { text, stars, updated: new Date().toISOString() };
      await st.setJSON("notes/" + person.id, rec);
      return json({ ok: true, updated: rec.updated });
    }

    if (op === "ack" && req.method === "PUT") {
      if (!body || body.accept !== true) return err(400, "not_accepted", "Tick the box to confirm.");
      const roles = coachRoles(person);
      if (!roles.length) return err(403, "not_a_coach", "Only head coaches acknowledge the technical document.");
      const ad = ackDeadlineOf(roster);
      const now = Date.now();
      const rec = { name: person.name, email: person.email, ts: new Date(now).toISOString(), version: techDocVersion(), late: ad != null && now > ad };
      const out = {};
      for (const r of roles) { await st.setJSON("ack/" + r.id, { ...rec, team: r.voterTeam }); out[r.id] = { ...rec, team: r.voterTeam }; }
      return json({ ok: true, items: out });
    }

    if (op === "ballot" && req.method === "PUT") {
      if (isClosed(roster)) return err(403, "closed", "Voting is closed.");
      const role = person.roles.find((r) => r.id === (body && body.role));
      if (!role) return err(403, "not_your_ballot");
      const cat = CATS.find((c) => c.id === (body && body.cat));
      if (!cat) return err(400, "bad_category");
      const picks = Array.isArray(body.picks) ? body.picks.map(String) : [];
      const pool = new Set(eligible(roster, person, cat.id).map((p) => p.id));
      const need = Math.min(3, pool.size);
      if (picks.length !== need) return err(400, "need_picks", "Choose " + need + " different players.");
      if (new Set(picks).size !== picks.length) return err(400, "duplicate", "Each choice must be a different player.");
      if (!picks.every((p) => pool.has(p))) return err(400, "not_eligible", "One of the players cannot receive your vote.");
      const key = "ballot/" + role.id;
      const b = (await st.get(key, { type: "json" })) || { cats: {} };
      b.cats[cat.id] = { picks, ts: new Date().toISOString() };
      b.updated = b.cats[cat.id].ts; b.by = person.email;
      await st.setJSON(key, b);
      return json({ ok: true, ballot: b });
    }

    return err(404, "unknown_op");
  } catch (e) {
    return err(500, "server_error", "Something went wrong. Try again.");
  }
};
