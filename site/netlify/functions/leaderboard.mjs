import { getStore } from "@netlify/blobs";

const KEY = "scores";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

export default async (req) => {
  try {
    const store = getStore("refquiz");
    // Admin reset: visit /.netlify/functions/leaderboard?reset=YOUR_TOKEN
    // (set QUIZ_RESET_TOKEN in Netlify → Site configuration → Environment variables)
    const resetParam = new URL(req.url).searchParams.get("reset");
    if (resetParam && process.env.QUIZ_RESET_TOKEN && resetParam === process.env.QUIZ_RESET_TOKEN) {
      await store.setJSON(KEY, []);
      return json({ reset: true, message: "Leaderboard cleared." });
    }
    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      let list = (await store.get(KEY, { type: "json" })) || [];
      if (body && typeof body.name === "string" && typeof body.score === "number" && typeof body.total === "number") {
        list.push({
          id: String(body.id || (Date.now() + "-" + Math.random())),
          name: body.name.slice(0, 18),
          score: Math.max(0, Math.min(99, body.score | 0)),
          total: Math.max(1, Math.min(99, body.total | 0)),
          ms: Math.max(0, Math.min(3600000, body.ms | 0)) || null,
          ts: Date.now()
        });
        list.sort((a, b) => (b.score - a.score) || ((a.ms || 9e9) - (b.ms || 9e9)) || (a.ts - b.ts));
        list = list.slice(0, 200);
        await store.setJSON(KEY, list);
      }
      return json(list.slice(0, 20));
    }
    const list = (await store.get(KEY, { type: "json" })) || [];
    return json(list.slice(0, 20));
  } catch (e) {
    return json([], 200);
  }
};
