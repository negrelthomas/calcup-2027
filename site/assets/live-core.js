/* CalCup live scoring: shared logic for the scorer app (score.html), the match center (live.html)
   and the live function (netlify/functions/live.mjs). Plain JS, works in the browser (window.LiveCore)
   and in Node (module.exports). No data lives here.

   Event log, one entry per tap. Fields:
     id    unique id made on the scoring device (lets an offline device resend safely)
     seq   order of arrival on the server
     type  phase | clock | shot | pun | timeout | gk | void
     t     game time in seconds when the event happened (0 to 2 x half length)
     w     wall time in ms, corrected to server time
     team  "A" or "B" (A = first team of the game in the schedule)
     n     shirt number, or null when unknown; for officials "A" to "D"
     r     shot result: goal | saved | missed | blocked
     z     shot zone (see ZONES)
     k     punishment: yellow | 2min | red | blue
     p     phase: h1 | ht | h2 | end
     a     clock action: start | stop | adjust ; d = seconds to add (adjust)
     ref   id of the event a void cancels
*/
(function (root) {
  var ZONES = [
    { id: "LW", label: "Left wing" }, { id: "LB", label: "Left back" }, { id: "CB", label: "Centre back" },
    { id: "RB", label: "Right back" }, { id: "RW", label: "Right wing" }, { id: "PV", label: "Pivot" },
    { id: "BT", label: "Breakthrough" }, { id: "FB", label: "Fast break" }, { id: "7M", label: "7 metre" },
    { id: "EN", label: "Empty net" }
  ];
  var ZONE_LABEL = {}; ZONES.forEach(function (z) { ZONE_LABEL[z.id] = z.label; });
  var TYPES = { phase: 1, clock: 1, shot: 1, pun: 1, timeout: 1, gk: 1, void: 1 };
  var RESULTS = { goal: 1, saved: 1, missed: 1, blocked: 1 };
  var PUNS = { yellow: "Yellow card", "2min": "2 minute suspension", red: "Red card", blue: "Blue card" };
  var PHASES = { h1: 1, ht: 1, h2: 1, end: 1 };

  function other(team) { return team === "A" ? "B" : "A"; }

  /* Active events in game order: voids applied, sorted by game time then arrival. */
  function active(events) {
    var gone = {};
    (events || []).forEach(function (e) { if (e.type === "void" && e.ref) gone[e.ref] = 1; });
    return (events || []).filter(function (e) { return e.type !== "void" && !gone[e.id]; })
      .slice().sort(function (a, b) { return (a.t - b.t) || ((a.seq || 0) - (b.seq || 0)); });
  }
  /* Same, in arrival order (the clock is rebuilt in the order the taps happened). */
  function activeBySeq(events) {
    var gone = {};
    (events || []).forEach(function (e) { if (e.type === "void" && e.ref) gone[e.ref] = 1; });
    return (events || []).filter(function (e) { return e.type !== "void" && !gone[e.id]; })
      .slice().sort(function (a, b) { return ((a.seq || 0) - (b.seq || 0)) || (a.w - b.w); });
  }

  /* Clock and phase. halfLen in minutes. Returns {phase, elapsed (s), running, runStart, halfEnd} */
  function clock(meta, events, now) {
    var H = (meta && meta.halfLen ? meta.halfLen : 30) * 60;
    var s = { phase: "pre", elapsed: 0, running: false, runStart: 0, halfEnd: H };
    function stop(w) { if (s.running) { s.elapsed = Math.min(s.halfEnd, s.elapsed + Math.max(0, (w - s.runStart) / 1000)); s.running = false; } }
    activeBySeq(events).forEach(function (e) {
      if (e.type === "phase") {
        if (e.p === "h1") { s.phase = "h1"; s.elapsed = 0; s.running = true; s.runStart = e.w; s.halfEnd = H; }
        else if (e.p === "ht") { s.phase = "ht"; s.elapsed = H; s.running = false; s.halfEnd = H; }
        else if (e.p === "h2") { s.phase = "h2"; s.elapsed = H; s.running = true; s.runStart = e.w; s.halfEnd = 2 * H; }
        else if (e.p === "end") { s.phase = "end"; s.elapsed = 2 * H; s.running = false; s.halfEnd = 2 * H; }
      } else if (e.type === "clock" && (s.phase === "h1" || s.phase === "h2")) {
        if (e.a === "stop") stop(e.w);
        else if (e.a === "start" && !s.running) { s.running = true; s.runStart = e.w; }
        else if (e.a === "adjust") {
          var lo = s.phase === "h2" ? H : 0;
          if (s.running) { stop(e.w); s.elapsed = Math.max(lo, Math.min(s.halfEnd, s.elapsed + (e.d || 0))); s.running = true; s.runStart = e.w; }
          else s.elapsed = Math.max(lo, Math.min(s.halfEnd, s.elapsed + (e.d || 0)));
        }
      } else if (e.type === "timeout") stop(e.w);
    });
    if (s.running && now != null) {
      var cur = s.elapsed + Math.max(0, (now - s.runStart) / 1000);
      s.now = Math.min(s.halfEnd, cur);
    } else s.now = s.elapsed;
    return s;
  }

  function fmt(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  function minuteLabel(sec) { return Math.floor((sec || 0) / 60) + 1 + "'"; }

  function score(events, upToT) {
    var sc = { A: 0, B: 0 };
    active(events).forEach(function (e) { if (e.type === "shot" && e.r === "goal" && (upToT == null || e.t <= upToT)) sc[e.team]++; });
    return sc;
  }

  /* Goalkeeper in goal for each team at each moment (last gk event before the shot). */
  function keeperAt(list, team, t, seq) {
    var k = null;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (e.type !== "gk" || e.team !== team) continue;
      if (e.t < t || (e.t === t && (e.seq || 0) <= (seq || 0))) k = e.n; else break;
    }
    return k;
  }

  /* Everything the match center shows. roster: {A:[{n,name,pos}], B:[...]} */
  function stats(meta, events, roster) {
    var H = (meta && meta.halfLen ? meta.halfLen : 30) * 60;
    var list = active(events);
    var names = { A: {}, B: {} };
    ["A", "B"].forEach(function (s) { ((roster && roster[s]) || []).forEach(function (p) { names[s][p.n] = p.name; }); });
    function nm(team, n) { if (n == null || n === "") return "Unknown player"; return names[team][n] || ("#" + n); }

    var out = { score: { A: 0, B: 0 }, half: { A: [0, 0], B: [0, 0] }, players: { A: {}, B: {} }, keepers: { A: {}, B: {} },
      team: { A: tz(), B: tz() }, zones: { A: {}, B: {} }, puns: [], timeouts: { A: 0, B: 0 }, timeline: [], prog: [], periods: [], lastGoals: [],
      runs: { best: null }, H: H };
    function tz() { return { goals: 0, shots: 0, saves: 0, faced: 0, m7g: 0, m7: 0, y: 0, s2: 0, r: 0, b: 0, noShooter: 0, noZone: 0 }; }

    var run = { team: null, len: 0, from: 0, to: 0 };
    list.forEach(function (e) {
      if (e.type === "shot") {
        var T = out.team[e.team], D = out.team[other(e.team)];
        var key = e.n == null ? "?" : String(e.n);
        var P = out.players[e.team][key] || (out.players[e.team][key] = { n: e.n, name: nm(e.team, e.n), g: 0, a: 0, m7g: 0, m7: 0 });
        var onTarget = e.r === "goal" || e.r === "saved";
        P.a++; T.shots++;
        if (e.n == null) T.noShooter++;
        if (!e.z) T.noZone++;
        if (e.z === "7M") { P.m7++; T.m7++; }
        var Z = out.zones[e.team][e.z || "?"] || (out.zones[e.team][e.z || "?"] = { g: 0, a: 0 });
        Z.a++;
        var gk = keeperAt(list, other(e.team), e.t, e.seq);
        if (onTarget && e.z !== "EN") {
          D.faced++;
          var gkey = gk == null ? "?" : String(gk);
          var K = out.keepers[other(e.team)][gkey] || (out.keepers[other(e.team)][gkey] = { n: gk, name: gk == null ? "Keeper not set" : nm(other(e.team), gk), saves: 0, faced: 0, m7s: 0, m7: 0 });
          K.faced++; if (e.z === "7M") K.m7++;
          if (e.r === "saved") { K.saves++; D.saves++; if (e.z === "7M") K.m7s++; }
        }
        if (e.r === "goal") {
          out.score[e.team]++; T.goals++; P.g++; Z.g++;
          if (e.z === "7M") { P.m7g++; T.m7g++; }
          out.half[e.team][e.t >= H ? 1 : 0]++;
          out.prog.push({ t: e.t, A: out.score.A, B: out.score.B, team: e.team });
          if (run.team === e.team) { run.len++; run.to = e.t; } else { run = { team: e.team, len: 1, from: e.t, to: e.t }; }
          if (!out.runs.best || run.len > out.runs.best.len) out.runs.best = { team: run.team, len: run.len, from: run.from, to: run.to };
        }
        out.timeline.push({ e: e, kind: e.r === "goal" ? (e.z === "7M" ? "7m goal" : "Goal") : e.r === "saved" ? (e.z === "7M" ? "7m saved" : "Saved") : e.r === "blocked" ? "Blocked" : (e.z === "7M" ? "7m missed" : "Missed shot"),
          who: nm(e.team, e.n), keeper: e.r === "saved" ? (gk == null ? null : nm(other(e.team), gk)) : null, keeperN: e.r === "saved" ? gk : null, score: { A: out.score.A, B: out.score.B } });
      } else if (e.type === "pun") {
        var TT = out.team[e.team];
        if (e.k === "yellow") TT.y++; else if (e.k === "2min") TT.s2++; else if (e.k === "red") TT.r++; else if (e.k === "blue") TT.b++;
        var who = typeof e.n === "string" && /^[A-D]$/.test(e.n) ? ("Official " + e.n) : nm(e.team, e.n);
        out.puns.push({ e: e, who: who });
        out.timeline.push({ e: e, kind: PUNS[e.k] || "Punishment", who: who, score: { A: out.score.A, B: out.score.B } });
      } else if (e.type === "timeout") {
        out.timeouts[e.team]++;
        out.timeline.push({ e: e, kind: "Team timeout", who: "", score: { A: out.score.A, B: out.score.B } });
      } else if (e.type === "gk") {
        out.timeline.push({ e: e, kind: "In goal", who: nm(e.team, e.n), score: { A: out.score.A, B: out.score.B } });
      } else if (e.type === "phase") {
        var lab = { h1: "Throw off", ht: "Half time", h2: "Second half", end: "Full time" }[e.p];
        out.timeline.push({ e: e, kind: lab, who: "", score: { A: out.score.A, B: out.score.B }, phase: true });
      }
    });
    // score by period: each half in blocks of 10 minutes when the half length allows, else 5
    var B = (H % 600 === 0 ? 600 : 300), n = Math.round(H / B);
    out.blockMin = B / 60;
    [0, 1].forEach(function (h) {
      for (var b = 0; b < n; b++) {
        var from = h * H + b * B, to = from + B, ga = 0, gb = 0;
        list.forEach(function (e) {
          if (e.type !== "shot" || e.r !== "goal") return;
          var last = b === n - 1; // goals entered after the buzzer of a half stay in its last block
          var inHalf = h === 0 ? e.t < H : e.t >= H;
          if (!inHalf) return;
          if (e.t >= from && (e.t < to || (last && e.t >= from))) { if (e.team === "A") ga++; else gb++; }
        });
        out.periods.push({ half: h + 1, from: from, to: to, A: ga, B: gb });
      }
    });
    out.lastGoals = out.prog.slice(-5).map(function (p) { return p.team; });
    out.timeline.reverse();
    return out;
  }

  /* Suspensions still running at game time t (2 minutes of playing time each). */
  function suspensions(events, t) {
    return active(events).filter(function (e) { return e.type === "pun" && e.k === "2min" && e.t <= t && t < e.t + 120; })
      .map(function (e) { return { team: e.team, n: e.n, left: e.t + 120 - t }; });
  }

  function uid() {
    var s = Date.now().toString(36) + "-";
    for (var i = 0; i < 8; i++) s += Math.floor(Math.random() * 36).toString(36);
    return s;
  }

  /* Server side check of one event as sent by a device. Returns a clean copy or null. */
  function clean(e) {
    if (!e || typeof e !== "object" || !TYPES[e.type]) return null;
    var id = String(e.id || ""); if (!/^[a-z0-9-]{6,40}$/i.test(id)) return null;
    var o = { id: id, type: e.type, t: Math.max(0, Math.min(10800, Math.round(Number(e.t) || 0))), w: Number(e.w) || 0 };
    if (e.type === "void") { if (!/^[a-z0-9-]{6,40}$/i.test(String(e.ref || ""))) return null; o.ref = String(e.ref); return o; }
    if (e.type === "phase") { if (!PHASES[e.p]) return null; o.p = e.p; return o; }
    if (e.type === "clock") {
      if (["start", "stop", "adjust"].indexOf(e.a) < 0) return null; o.a = e.a;
      if (e.a === "adjust") o.d = Math.max(-600, Math.min(600, Math.round(Number(e.d) || 0)));
      return o;
    }
    if (e.team !== "A" && e.team !== "B") return null; o.team = e.team;
    var n = e.n;
    if (n === null || n === undefined || n === "") o.n = null;
    else if (e.type === "pun" && /^[A-D]$/.test(String(n))) o.n = String(n);
    else { n = Number(n); if (!(n >= 0 && n <= 99 && Math.floor(n) === n)) return null; o.n = n; }
    if (e.type === "shot") { if (!RESULTS[e.r]) return null; o.r = e.r; if (e.z) { if (!ZONE_LABEL[e.z]) return null; o.z = e.z; } }
    if (e.type === "pun") { if (!PUNS[e.k]) return null; o.k = e.k; }
    return o;
  }

  /* One line per game for the schedule and the live strip. */
  function summary(meta, events, now) {
    var c = clock(meta, events, now), sc = score(events);
    return { a: sc.A, b: sc.B, phase: c.phase, running: c.running, elapsed: c.elapsed, runStart: c.runStart, halfEnd: c.halfEnd };
  }

  var api = { ZONES: ZONES, ZONE_LABEL: ZONE_LABEL, PUNS: PUNS, active: active, clock: clock, fmt: fmt, minuteLabel: minuteLabel,
    score: score, stats: stats, suspensions: suspensions, uid: uid, clean: clean, summary: summary, other: other };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.LiveCore = api;
})(typeof window !== "undefined" ? window : this);
