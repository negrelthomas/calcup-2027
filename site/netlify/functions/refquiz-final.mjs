// CalCup 2027 referee quiz: final call email. Scheduled every 10 minutes; does nothing unless
// QUIZ_EMAILS_ON=1. Once, in the two hours before the board closes, it emails the players
// ranked 2nd to 10th that the board is about to close. Players who unsubscribed are skipped.
import { qstore, loadBoard, closeAt, sendMail, when, ord, unsubSig } from "./refquiz.mjs";

export const config = { schedule: "*/10 * * * *" };

export default async () => {
  if (process.env.QUIZ_EMAILS_ON !== "1") return new Response("off");
  const st = qstore(), close = await closeAt(), now = Date.now();
  if (now < close - 2 * 3600 * 1000 || now >= close) return new Response("not due");
  if (await st.get("final-sent", { type: "json" })) return new Response("already sent");
  await st.setJSON("final-sent", { at: now });
  const b = await loadBoard(st), url = process.env.QUIZ_URL || "https://calcup-2027.netlify.app/refquiz.html";
  const fn = process.env.QUIZ_FN_URL || "https://calcup-2027.netlify.app/.netlify/functions/refquiz";
  let sent = 0;
  for (let i = 1; i < Math.min(10, b.length); i++) {
    const p = await st.get("p/" + b[i].id, { type: "json" });
    if (!p || p.unsub) continue;
    const gap = b[0].score - b[i].score;
    const r = await sendMail(p.email, "Last call: the CalCup referee quiz board closes " + when(close),
      "Hello " + p.name + ",\n\nYou are " + ord(i + 1) + " on the CalCup referee quiz leaderboard" +
      (gap > 0 ? ", " + gap + (gap === 1 ? " point" : " points") + " behind the leader" : ", level on points with the leader and behind on time") + ".\n\n" +
      "The board closes " + when(close) + ". Your best round counts, so one more try can only help.\n\n" +
      "Play: " + url + "\n\nTo stop these emails: " + fn + "?op=unsub&u=" + p.id + "&s=" + unsubSig(p.id) +
      "\n\nCalCup 2027 organizing committee\ncalcup@calheat.com\n");
    if (r.ok) sent++;
  }
  return new Response("sent " + sent);
};
