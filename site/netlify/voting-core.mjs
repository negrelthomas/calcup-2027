// Shared voting logic for the vote and vote-reminders functions.
import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";

export const CATS = [
  { id: "mvp-m", label: "MVP Men", div: "M", gk: false, award: "Steve Goss Award" },
  { id: "mvp-w", label: "MVP Women", div: "W", gk: false, award: "Steve Goss Award" },
  { id: "mvg-m", label: "MVG Men", div: "M", gk: true, award: "Mark Ragatz Award" },
  { id: "mvg-w", label: "MVG Women", div: "W", gk: true, award: "Mark Ragatz Award" }
];
const POINTS = [3, 2, 1];

export const store = () => getStore({ name: "calcup-voting", consistency: "strong" });
export const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
export const normEmail = (e) => String(e || "").trim().toLowerCase();
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
export const err = (status, code, message) => json({ error: code, message }, status);
export function safeEq(a, b) {
  const x = Buffer.from(String(a || "")), y = Buffer.from(String(b || ""));
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

export async function loadRoster(st) { return (await st.get("roster", { type: "json" })) || null; }
export function deadlineOf(roster) {
  const d = process.env.VOTE_DEADLINE || (roster && roster.deadline);
  const t = d ? Date.parse(d) : NaN;
  return isFinite(t) ? t : null;
}
export const isClosed = (roster, now = Date.now()) => { const d = deadlineOf(roster); return d != null && now >= d; };

// Eligible players for one category and one voter: right division, GK or field,
// and not on any team the voter coaches.
export function eligible(roster, person, cat) {
  const c = CATS.find((x) => x.id === cat); if (!c) return [];
  const ex = new Set(person.exclude || []);
  return (roster.players || []).filter((p) => p.div === c.div && !!p.gk === c.gk && !ex.has(p.team));
}

export async function sendEmail(to, subject, text) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "no_sender" };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.VOTE_FROM || "CalCup 2027 <calcup@calheat.com>", to: [to], subject, text,
      reply_to: process.env.VOTE_REPLY_TO || "calcup@calheat.com" })
  });
  return { ok: r.ok, reason: r.ok ? null : ("resend_" + r.status) };
}

export function tally(roster, ballots) {
  const byId = {}; (roster.players || []).forEach((p) => (byId[p.id] = p));
  const roles = new Set(); (roster.voters || []).forEach((v) => v.roles.forEach((r) => roles.add(r.id)));
  const out = {};
  CATS.forEach((c) => {
    const rows = {};
    Object.keys(ballots).forEach((rid) => {
      if (!roles.has(rid)) return; // ballot of a role no longer in the workbook
      const picks = ((ballots[rid].cats || {})[c.id] || {}).picks || [];
      picks.forEach((pid, i) => {
        const p = byId[pid]; if (!p) return;
        const r = rows[pid] || (rows[pid] = { id: pid, name: p.name, team: p.team, n: p.n, v: [0, 0, 0], pts: 0 });
        r.v[i]++; r.pts += POINTS[i];
      });
    });
    // Points, then number of 1st place votes (workbook tiebreak), then 2nd place votes.
    out[c.id] = Object.values(rows).sort((a, b) => b.pts - a.pts || b.v[0] - a.v[0] || b.v[1] - a.v[1] || a.name.localeCompare(b.name));
  });
  return out;
}

export async function allBallots(st) {
  const { blobs } = await st.list({ prefix: "ballot/" });
  const out = {};
  for (const b of blobs) { const v = await st.get(b.key, { type: "json" }); if (v) out[b.key.slice(7)] = v; }
  return out;
}


// ===== Technical document acknowledgment (head coaches) =====
// Version string shown to coaches and stored with each acknowledgment. Change it when the
// document changes materially (Netlify env TECH_DOC_VERSION); acknowledgments of an older
// version then show as "old version" on the admin page.
export const TECH_DOC = {
  url: "assets/docs/CalCup_2027_Technical_Document.pdf",
  title: "2027 California Cup technical document"
};
export const techDocVersion = () => process.env.TECH_DOC_VERSION || "v1 (Oct 2026)";
// Deadline: court time of the first game of the tournament (from Games Schedule), or env ACK_DEADLINE.
export function ackDeadlineOf(roster) {
  const d = process.env.ACK_DEADLINE || (roster && roster.firstGame);
  const t = d ? Date.parse(d) : NaN;
  return isFinite(t) ? t : null;
}
export const coachRoles = (person) => (person.roles || []).filter((r) => r.type === "coach");
