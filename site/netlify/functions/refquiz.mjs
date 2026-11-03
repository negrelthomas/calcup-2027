// CalCup 2027 referee quiz API (Netlify Function + Netlify Blobs).
//
// The server holds the question bank (../quiz-bank.json), draws each round, times every
// question on its own clock and scores the answers. The browser never sees the correct
// answers before it has answered, and never reports its own score.
//
// Anyone can play. Only players who verified their email with a 6 digit code, and declared
// they are not a certified referee, go on the leaderboard. The board keeps each player's
// best round (score, then fastest total time). Players are keyed by a canonical email
// (lower case, "+tag" removed, dots removed in Gmail names), so one person has one entry.
//
// Routes (all on /.netlify/functions/refquiz?op=...):
//   GET  op=board                     public top 15 and closing time
//   POST op=code    {email}           emails a sign in code
//   POST op=verify  {email,code,name,notReferee,news}   returns a session token
//   GET  op=me      Bearer            nickname, best, rank, who passed you since your last visit
//   POST op=start   Bearer optional   new round, first question
//   POST op=answer  {round,picks[]}   scores the current question, returns the explanation
//   POST op=next    {round}           next question (its clock starts now)
//   POST op=logout  Bearer
//   GET  op=unsub   ?u=&s=            stops rank emails for one player
//   GET  op=admin   x-admin-token     full board with emails, declarations, consent, timing flags
//   POST op=reset   x-admin-token     clears the leaderboard (players keep their sign in)
//
// Environment (Netlify > Site configuration > Environment variables):
//   VOTE_ADMIN_TOKEN   reused as the quiz admin token (same organizing committee)
//   RESEND_API_KEY     email sender, shared with voting; QUIZ_FROM optional sender override
//   QUIZ_CLOSE         optional ISO override of the closing time; default is the voting deadline
//                      (court time of the first final), then Sunday Jan 31, 2027 at noon Pacific
//   QUIZ_EMAILS_ON=1   turns on the "X took your rank" emails and the final call email
//   QUIZ_DEV_CODES=1   testing only: returns the code in the response instead of emailing it
import { randomBytes, randomInt, createHmac } from "node:crypto";
import { getStore } from "@netlify/blobs";
import bank from "../quiz-bank.json";
import { sha, json, err, safeEq, loadRoster, deadlineOf, store as voteStore } from "../voting-core.mjs";

export const ROUND = 15, MAX_MULTI = 5, GRACE_MS = 2500, BOARD_SHOW = 15;
const CODE_TTL = 10 * 60 * 1000, SESSION_TTL = 60 * 24 * 3600 * 1000, ROUND_TTL = 3 * 3600 * 1000;
const DEFAULT_CLOSE = "2027-01-31T12:00:00-08:00";
const QS = bank.questions;

export const qstore = () => getStore({ name: "calcup-refquiz", consistency: "strong" });

// ---------- helpers ----------
export function normEmail(e) { return String(e || "").trim().toLowerCase(); }
export function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 200; }
export function canonEmail(e) {
  e = normEmail(e); const at = e.lastIndexOf("@"); if (at < 1) return e;
  let local = e.slice(0, at), dom = e.slice(at + 1);
  local = local.split("+")[0];
  if (dom === "gmail.com" || dom === "googlemail.com") { local = local.replace(/\./g, ""); dom = "gmail.com"; }
  return local + "@" + dom;
}
export const cleanName = (n) => String(n || "").replace(/[<>&"\u0000-\u001f]/g, "").replace(/\s+/g, " ").trim().slice(0, 18);
const pid = (email) => sha("p:" + canonEmail(email)).slice(0, 24);
const secret = () => process.env.QUIZ_SECRET || process.env.VOTE_ADMIN_TOKEN || "calcup-dev";
export const unsubSig = (id) => createHmac("sha256", secret()).update("unsub:" + id).digest("hex").slice(0, 32);
export function rankCmp(a, b) { return (b.score - a.score) || (a.ms - b.ms) || (a.at - b.at); }

export async function closeAt() {
  const env = process.env.QUIZ_CLOSE && Date.parse(process.env.QUIZ_CLOSE);
  if (env && isFinite(env)) return env;
  try { const d = deadlineOf(await loadRoster(voteStore())); if (d) return d; } catch (e) { /* voting store not available */ }
  return Date.parse(DEFAULT_CLOSE);
}

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = randomInt(0, i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Rule spread draw: at most one question per rule until every rule is used, then the rest at
// random; at most MAX_MULTI "select all" questions per round (same rule as the old client draw).
export function drawRound(pool = QS) {
  const byTopic = {}; pool.forEach((q) => (byTopic[q.topic] = byTopic[q.topic] || []).push(q));
  const topics = shuffle(Object.keys(byTopic)), lists = {}; topics.forEach((t) => (lists[t] = shuffle(byTopic[t])));
  const chosen = []; let multi = 0, cap = MAX_MULTI;
  while (chosen.length < ROUND) {
    let added = false;
    for (const t of topics) {
      if (chosen.length >= ROUND) break;
      const l = lists[t];
      for (let j = 0; j < l.length; j++) { if (l[j].cs && multi >= cap) continue; const q = l.splice(j, 1)[0]; if (q.cs) multi++; chosen.push(q); added = true; break; }
    }
    if (!added) { if (cap === Infinity) break; cap = Infinity; }
  }
  return shuffle(chosen).map((q) => ({ id: q.id, perm: shuffle(q.a.map((_, i) => i)) }));
}
const correctSet = (q) => (q.cs ? q.cs.slice() : [q.c]);
// Question as the player sees it: options in the round's shuffled order, no answer.
function publicQ(r, i) {
  const it = r.items[i], q = QS[it.id];
  return { n: i + 1, of: r.items.length, q: q.q, a: it.perm.map((k) => q.a[k]), multi: !!q.cs, t: q.t };
}

async function session(req, st) {
  const h = req.headers.get("authorization") || "";
  const tok = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (!tok) return null;
  const s = await st.get("sess/" + sha(tok), { type: "json" });
  if (!s || s.exp < Date.now()) return null;
  const p = await st.get("p/" + s.pid, { type: "json" });
  return p ? { tokKey: "sess/" + sha(tok), p } : null;
}

export async function sendMail(to, subject, text) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "no_sender" };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.QUIZ_FROM || process.env.VOTE_FROM || "CalCup 2027 <calcup@calheat.com>", to: [to], subject, text,
      reply_to: "calcup@calheat.com" })
  });
  return { ok: r.ok, reason: r.ok ? null : "resend_" + r.status };
}

// ---------- board ----------
// "board" holds one entry per player who has a best round: {id,name,score,total,ms,at}.
// Player records ("p/<id>") are the source of truth; the board is rebuilt from them if it is lost.
export async function loadBoard(st) { return (await st.get("board", { type: "json" })) || []; }
export async function putEntry(st, entry) {
  for (let k = 0; k < 4; k++) {
    const b = (await loadBoard(st)).filter((e) => e.id !== entry.id);
    b.push(entry); b.sort(rankCmp);
    await st.setJSON("board", b);
    const check = await loadBoard(st);
    const mine = check.find((e) => e.id === entry.id);
    if (mine && mine.at === entry.at) return check;
  }
  return loadBoard(st);
}
const pub = (b) => b.slice(0, BOARD_SHOW).map((e, i) => ({ rank: i + 1, name: e.name, score: e.score, total: e.total, ms: e.ms }));

// ---------- rank emails ----------
const H = 3600 * 1000;
export async function notifyPassed(st, board, mover, before, close) {
  if (process.env.QUIZ_EMAILS_ON !== "1") return 0;
  const now = Date.now(); if (now >= close) return 0;
  const weekend = close - now < 3 * 24 * H; // tournament weekend: send when it happens
  const url = process.env.QUIZ_URL || "https://calcup-2027.netlify.app/refquiz.html";
  let sent = 0;
  for (let i = 0; i < Math.min(10, board.length); i++) {
    const e = board[i]; if (e.id === mover.id) continue;
    const was = before.indexOf(e.id); // rank before the move (0 based)
    if (was < 0 || was >= i) continue; // only players this round pushed down
    const p = await st.get("p/" + e.id, { type: "json" });
    if (!p || p.unsub) continue;
    if (p.lastMail && now - p.lastMail < (weekend ? 2 * H : 24 * H)) continue;
    const unsub = (process.env.QUIZ_FN_URL || "https://calcup-2027.netlify.app/.netlify/functions/refquiz") + "?op=unsub&u=" + e.id + "&s=" + unsubSig(e.id);
    const r = await sendMail(p.email, mover.name + " took your " + ord(was + 1) + " place on the CalCup referee quiz",
      "Hello " + p.name + ",\n\n" + mover.name + " just passed you on the CalCup referee quiz leaderboard. You are now " + ord(i + 1) + ".\n\n" +
      "Play again: " + url + "\n\nThe board closes " + when(close) + ".\n\n" +
      "To stop these emails: " + unsub + "\n\nCalCup 2027 organizing committee\ncalcup@calheat.com\n");
    if (r.ok) { p.lastMail = now; await st.setJSON("p/" + e.id, p); sent++; }
  }
  return sent;
}
export function ord(n) { const t = n % 100; if (t >= 11 && t <= 13) return n + "th"; return n + (["th", "st", "nd", "rd"][n % 10] || "th"); }
export function when(ms) {
  return new Date(ms).toLocaleString("en-US", { timeZone: "America/Los_Angeles", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }) + " Pacific time";
}

// ---------- handler ----------
export default async (req) => {
  const url = new URL(req.url);
  const op = url.searchParams.get("op") || "board";
  const st = qstore();
  let body = null;
  if (req.method === "POST") body = await req.json().catch(() => null);

  try {
    if (op === "board") {
      const close = await closeAt();
      return json({ board: pub(await loadBoard(st)), closesAt: new Date(close).toISOString(), closed: Date.now() >= close, round: ROUND, pool: QS.length });
    }

    // ---------- sign in ----------
    if (op === "code") {
      const email = normEmail(body && body.email);
      if (!validEmail(email)) return err(400, "email_required", "Enter a valid email address.");
      const key = "code/" + sha(canonEmail(email)), now = Date.now();
      const prev = await st.get(key, { type: "json" });
      const sentAt = (prev && prev.sent ? prev.sent : []).filter((t) => now - t < H);
      if (sentAt.length && now - sentAt[sentAt.length - 1] < 45 * 1000) return err(429, "too_soon", "A code was just sent. Wait a minute before asking again.");
      if (sentAt.length >= 6) return err(429, "too_many", "Too many codes requested. Try again in an hour.");
      const code = String(randomInt(0, 1000000)).padStart(6, "0");
      await st.setJSON(key, { h: sha(canonEmail(email) + ":" + code), exp: now + CODE_TTL, tries: 0, sent: sentAt.concat(now) });
      if (process.env.QUIZ_DEV_CODES === "1") return json({ ok: true, devCode: code });
      const r = await sendMail(email, "Your CalCup referee quiz code: " + code,
        "Your sign in code for the CalCup 2027 referee quiz is " + code + ". It expires in 10 minutes.\n\n" +
        "If you did not ask for this code, you can ignore this email.\n\nCalCup 2027 organizing committee\ncalcup@calheat.com\n");
      if (!r.ok) return err(502, "email_failed", "The code could not be emailed right now. You can still play without the leaderboard.");
      return json({ ok: true });
    }

    if (op === "verify") {
      const email = normEmail(body && body.email), code = String((body && body.code) || "").replace(/\D/g, "");
      const key = "code/" + sha(canonEmail(email));
      const rec = await st.get(key, { type: "json" });
      if (!rec || !rec.h || rec.exp < Date.now()) return err(400, "expired", "This code has expired. Ask for a new one.");
      if (rec.tries >= 5) return err(429, "locked", "Too many attempts. Ask for a new code.");
      if (rec.h !== sha(canonEmail(email) + ":" + code)) { rec.tries++; await st.setJSON(key, rec); return err(400, "wrong_code", "This code is not correct."); }
      const id = pid(email);
      const prev = await st.get("p/" + id, { type: "json" });
      const name = cleanName(body && body.name) || (prev && prev.name) || "";
      if (!name) return err(400, "name_required", "Choose a nickname for the leaderboard.");
      if (!(body && body.notReferee === true)) return err(400, "declaration_required", "Confirm that you are not a certified referee to join the leaderboard.");
      // Nicknames are unique on the board (case insensitive)
      const taken = (await loadBoard(st)).find((e) => e.id !== id && e.name.toLowerCase() === name.toLowerCase());
      if (taken) return err(409, "name_taken", "This nickname is already on the board. Choose another one.");
      await st.setJSON(key, { sent: rec.sent || [] }); // code is single use
      const now = Date.now();
      const p = prev || { id, email, canon: canonEmail(email), created: now, plays: 0, best: null };
      p.email = email; p.name = name;
      p.notReferee = { at: now, text: "I am not a certified referee in the USA or any other country." };
      p.news = body && body.news === true ? (p.news && p.news.on ? p.news : { on: true, at: now }) : { on: false, at: now };
      p.verifiedAt = now;
      await st.setJSON("p/" + id, p);
      if (p.best) await putEntry(st, { id, name, score: p.best.score, total: p.best.total, ms: p.best.ms, at: p.best.at });
      const tok = randomBytes(32).toString("hex");
      await st.setJSON("sess/" + sha(tok), { pid: id, exp: now + SESSION_TTL });
      return json({ ok: true, token: tok, name });
    }

    if (op === "logout") {
      const s = await session(req, st); if (s) await st.delete(s.tokKey);
      return json({ ok: true });
    }

    if (op === "me") {
      const s = await session(req, st); if (!s) return err(401, "signed_out");
      const p = s.p, b = await loadBoard(st);
      const idx = b.findIndex((e) => e.id === p.id);
      const above = idx < 0 ? [] : b.slice(0, idx).map((e) => e.id);
      const passed = idx < 0 || !p.seenAbove ? [] : b.slice(0, idx).filter((e) => p.seenAbove.indexOf(e.id) < 0).map((e) => e.name);
      p.seenAbove = above; await st.setJSON("p/" + p.id, p);
      return json({ name: p.name, best: p.best, rank: idx < 0 ? null : idx + 1, passed, unsub: !!p.unsub });
    }

    if (op === "unsub") {
      const id = url.searchParams.get("u") || "", sig = url.searchParams.get("s") || "";
      if (!safeEq(sig, unsubSig(id))) return new Response("This link is not valid.", { status: 400 });
      const p = await st.get("p/" + id, { type: "json" });
      if (p) { p.unsub = Date.now(); await st.setJSON("p/" + id, p); }
      return new Response("You will no longer receive CalCup referee quiz emails.", { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    // ---------- rounds ----------
    if (op === "start") {
      const s = await session(req, st);
      const close = await closeAt();
      const id = randomBytes(16).toString("hex"), now = Date.now();
      const r = { id, pid: s ? s.p.id : null, items: drawRound(), i: 0, score: 0, ms: 0, issued: now, answered: false, created: now, ranked: !!s && now < close };
      await st.setJSON("r/" + id, r);
      return json({ round: id, ranked: r.ranked, question: publicQ(r, 0) });
    }

    if (op === "answer" || op === "next") {
      const rid = String((body && body.round) || "").replace(/[^a-f0-9]/g, "");
      const r = rid && (await st.get("r/" + rid, { type: "json" }));
      if (!r || Date.now() - r.created > ROUND_TTL) return err(404, "no_round", "This round has expired. Start a new one.");

      if (op === "next") {
        if (!r.answered) return err(409, "not_answered");
        if (r.i + 1 >= r.items.length) return err(409, "finished");
        r.i++; r.answered = false; r.issued = Date.now();
        await st.setJSON("r/" + rid, r);
        return json({ question: publicQ(r, r.i) });
      }

      if (r.answered) return err(409, "already_answered");
      const it = r.items[r.i], q = QS[it.id], now = Date.now();
      const elapsed = now - r.issued, limit = q.t * 1000;
      const late = elapsed > limit + GRACE_MS;
      // picks are positions in the shuffled options; map back to the bank's answer indices
      const picks = Array.isArray(body && body.picks) ? [...new Set(body.picks.map((x) => x | 0).filter((x) => x >= 0 && x < it.perm.length))] : [];
      const chosen = picks.map((k) => it.perm[k]).sort();
      const want = correctSet(q).sort();
      const ok = !late && chosen.length === want.length && chosen.every((v, k) => v === want[k]);
      if (ok) r.score++;
      r.ms += Math.min(elapsed, limit);
      r.answered = true;
      const correct = it.perm.map((k, pos) => (want.indexOf(k) >= 0 ? pos : -1)).filter((x) => x >= 0);
      const out = { ok, late, correct, why: q.why, score: r.score, last: r.i + 1 >= r.items.length };

      if (out.last) {
        const total = r.items.length, close = await closeAt();
        out.final = { score: r.score, total, ms: r.ms };
        if (r.pid && r.ranked && Date.now() < close) {
          const p = await st.get("p/" + r.pid, { type: "json" });
          if (p) {
            p.plays = (p.plays || 0) + 1;
            const cand = { score: r.score, total, ms: r.ms, at: Date.now() };
            const better = !p.best || rankCmp(cand, p.best) < 0;
            if (better) {
              p.best = cand; p.bestSecsPerQ = Math.round(r.ms / total / 100) / 10;
              await st.setJSON("p/" + p.id, p);
              const before = (await loadBoard(st)).map((e) => e.id);
              const b = await putEntry(st, { id: p.id, name: p.name, score: cand.score, total, ms: cand.ms, at: cand.at });
              await notifyPassed(st, b, { id: p.id, name: p.name }, before, close).catch(() => 0);
            } else await st.setJSON("p/" + p.id, p);
            const b = await loadBoard(st);
            out.rank = b.findIndex((e) => e.id === p.id) + 1;
            out.improved = better;
            out.best = p.best;
          }
        } else out.unranked = r.pid ? "closed" : "guest";
        out.board = pub(await loadBoard(st));
      }
      await st.setJSON("r/" + rid, r);
      return json(out);
    }

    // ---------- admin ----------
    if (op === "admin" || op === "reset") {
      if (!safeEq(req.headers.get("x-admin-token"), process.env.VOTE_ADMIN_TOKEN)) return err(401, "unauthorized");
      if (op === "reset") {
        if (!body || body.confirm !== "RESET") return err(400, "confirm_required");
        const { blobs } = await st.list({ prefix: "p/" });
        for (const x of blobs) { const p = await st.get(x.key, { type: "json" }); if (p) { p.best = null; p.seenAbove = null; p.plays = 0; await st.setJSON(x.key, p); } }
        await st.setJSON("board", []);
        try { await getStore("refquiz").setJSON("scores", []); } catch (e) { /* old nickname board */ }
        return json({ ok: true, reset: true, players: blobs.length });
      }
      const b = await loadBoard(st), close = await closeAt();
      const { blobs } = await st.list({ prefix: "p/" });
      const players = [];
      for (const x of blobs) { const p = await st.get(x.key, { type: "json" }); if (p) players.push(p); }
      const rows = players.map((p) => {
        const rank = b.findIndex((e) => e.id === p.id);
        return { rank: rank < 0 ? null : rank + 1, name: p.name, email: p.email, canon: p.canon, best: p.best, secsPerQ: p.bestSecsPerQ || null,
          fast: !!(p.bestSecsPerQ && p.bestSecsPerQ < 4), plays: p.plays || 0, notRefereeAt: p.notReferee ? p.notReferee.at : null,
          news: !!(p.news && p.news.on), newsAt: p.news ? p.news.at : null, verifiedAt: p.verifiedAt || null, unsub: !!p.unsub };
      }).sort((a, b2) => (a.rank || 1e9) - (b2.rank || 1e9));
      return json({ closesAt: new Date(close).toISOString(), emailsOn: process.env.QUIZ_EMAILS_ON === "1", senderReady: !!process.env.RESEND_API_KEY, players: rows });
    }

    return err(404, "unknown_op");
  } catch (e) {
    return err(500, "server_error", "Something went wrong. Try again.");
  }
};
