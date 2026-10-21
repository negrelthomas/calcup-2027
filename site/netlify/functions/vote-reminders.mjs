// CalCup 2027 voting reminders. Scheduled every 10 minutes; does nothing unless
// VOTE_EMAILS_ON=1 is set in Netlify, so no email leaves before Thomas switches it on.
//
// Stages (times derived from the workbook schedule, recomputed on every sync):
//   welcome   first game court time minus 2 hours, every voter: how to sign in, notes, deadline
//   day-before  deadline minus 20 hours, voters with an incomplete ballot
//   morning   deadline minus 3 hours, voters with an incomplete ballot
//   last-call deadline minus 45 minutes, voters with an incomplete ballot
// Each stage goes once per voter. If several stages are due at once (switched on late),
// only the latest is sent.
import { CATS, store, loadRoster, deadlineOf, sendEmail } from "../voting-core.mjs";

export const config = { schedule: "*/10 * * * *" };

const H = 3600 * 1000;
export function stages(roster) {
  const d = deadlineOf(roster); if (d == null) return [];
  const first = roster.firstGame ? Date.parse(roster.firstGame) : NaN;
  const list = [];
  if (isFinite(first) && first - 2 * H < d) list.push({ id: "welcome", at: first - 2 * H, all: true });
  list.push({ id: "day-before", at: d - 20 * H }, { id: "morning", at: d - 3 * H }, { id: "last-call", at: d - 0.75 * H });
  return list.sort((a, b) => a.at - b.at);
}

function when(ms) {
  return new Date(ms).toLocaleString("en-US", { timeZone: "America/Los_Angeles", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }) + " Pacific time";
}

export function message(stage, person, missing, deadline) {
  const url = process.env.VOTE_URL || "https://calcup-2027.netlify.app/vote.html";
  const teams = person.roles.filter((r) => r.type === "coach").map((r) => r.voterTeam);
  const parts = [];
  if (teams.length) parts.push("head coach of " + teams.join(" and "));
  if (person.roles.some((r) => r.type === "ref")) parts.push("a referee");
  const ballots = parts.join(" and ");
  const sign = "\n\nCalCup 2027 organizing committee\ncalcup@calheat.com\n";
  if (stage === "welcome") {
    return {
      subject: "CalCup 2027: you vote for MVP and MVG",
      text: "Hello " + person.name + ",\n\n" +
        "As " + ballots + ", you vote for this year's MVP and MVG awards (Men and Women). " +
        "Voting is open now on the CalCup site and closes " + when(deadline) + ", before the first final.\n\n" +
        "Sign in at " + url + " with this email address. You will receive a 6 digit code.\n\n" +
        "During the tournament you can keep private notes and star players on the same page. " +
        "Starred players appear first when you vote. You can change your votes until the deadline." + sign
    };
  }
  const left = stage === "last-call" ? "Voting closes in 45 minutes" : ("Voting closes " + when(deadline));
  return {
    subject: stage === "last-call" ? "CalCup 2027: last call for your MVP and MVG votes" : "CalCup 2027: reminder to submit your MVP and MVG votes",
    text: "Hello " + person.name + ",\n\n" + left + ". Still missing: " + missing.join("; ") + ".\n\n" +
      "Sign in at " + url + " with this email address to finish." + sign
  };
}

export async function run(st, now = Date.now(), send = sendEmail) {
  if (process.env.VOTE_EMAILS_ON !== "1") return { skipped: "VOTE_EMAILS_ON is not 1" };
  const roster = await loadRoster(st); if (!roster) return { skipped: "no roster" };
  const d = deadlineOf(roster); if (d == null || now >= d) return { skipped: "no deadline or closed" };
  const due = stages(roster).filter((s) => s.at <= now);
  if (!due.length) return { skipped: "nothing due" };
  const log = [];
  for (const person of roster.voters) {
    if (!person.email) continue;
    const key = "remind/" + person.id;
    const sent = (await st.get(key, { type: "json" })) || {};
    const latest = due[due.length - 1];
    if (sent[latest.id]) continue;
    const missing = [];
    for (const r of person.roles) {
      const b = (await st.get("ballot/" + r.id, { type: "json" })) || { cats: {} };
      const todo = CATS.filter((c) => !(b.cats[c.id] && b.cats[c.id].picks && b.cats[c.id].picks.length)).map((c) => c.label);
      if (todo.length) missing.push(todo.join(", ") + (person.roles.length > 1 ? " on your " + (r.type === "ref" ? "referee" : r.voterTeam) + " ballot" : ""));
    }
    due.forEach((s) => { if (!sent[s.id]) sent[s.id] = "skipped"; });
    if (latest.all || missing.length) {
      const m = message(latest.id, person, missing, d);
      const r = await send(person.email, m.subject, m.text);
      if (r.ok) sent[latest.id] = new Date(now).toISOString(); // a failed send is retried on the next run
      log.push(person.email + " " + latest.id + " " + (r.ok ? "sent" : "failed " + r.reason));
    } else sent[latest.id] = "complete";
    await st.setJSON(key, sent);
  }
  return { sent: log };
}

export default async () => {
  const out = await run(store());
  return new Response(JSON.stringify(out), { headers: { "Content-Type": "application/json" } });
};
