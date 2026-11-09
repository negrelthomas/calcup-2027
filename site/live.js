/* CalCup live scoring: public match center (live.html). Reads the event log of a game from the live
   function and rebuilds score, clock and every stat in the browser with LiveCore. Without ?game= it lists
   every game with a live log. Polls every 6 seconds while a game is on. */
(function () {
  var D = window.CALCUP || {}, L = window.LiveCore;
  var API = "/.netlify/functions/live";
  var games = D.games || [], rosters = D.rosters || {};
  var byTeam = {}; (D.teamStyles || []).concat(D.teams || []).forEach(function (t) { byTeam[t.id] = t; });
  var $app = document.getElementById("lc-app"), $board = document.getElementById("lc-board");
  var no = new URLSearchParams(location.search).get("game");
  var data = null, off = 0, tab = "summary", showAll = { A: false, B: false }, timer = null;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]; }); }
  function tname(id, fb) { if (byTeam[id]) return byTeam[id].name; if (fb) return fb; if (id && id.indexOf("tbd-") === 0) return "TBD"; return id || "TBD"; }
  function logo(id) { return byTeam[id] ? '<img class="lc-logo" src="assets/logos/' + id + '.png" alt="" onerror="this.style.display=\'none\'">' : ""; }
  function pct(a, b) { return b ? Math.round(100 * a / b) + "%" : "–"; }
  function roster(id) { return (rosters[id] || []).filter(function (p) { return !p.official && p.n != null && p.n !== ""; }).map(function (p) { return { n: Number(p.n), name: p.name }; }); }
  function sched(n) { return games.filter(function (g) { return String(g.no) === String(n); })[0] || null; }
  function now() { return Date.now() + off; }

  function get(q) { return fetch(API + "?" + q, { cache: "no-store" }).then(function (r) { return r.json(); }); }

  /* ---------- index: every game with a log ---------- */
  function loadIndex() {
    get("op=all").then(function (j) {
      off = j.serverNow - Date.now();
      var s = j.games || {};
      $board.innerHTML = '<p class="kicker">Match center</p><h1 style="font-size:28px">Live game stats</h1>';
      var rows = games.slice().sort(function (a, b) { return a.no - b.no; }).map(function (g) {
        var x = s[String(g.no)];
        var st = x ? statusLine(x) : '<span class="pill up">' + esc(g.day + " " + g.time) + '</span>';
        return '<a class="lc-row" href="live.html?game=' + g.no + '"><span class="lc-no">' + g.no + '</span><span class="lc-teams"><span>' + logo(g.teamA) + esc(tname(g.teamA)) + '</span><span>' + logo(g.teamB) + esc(tname(g.teamB)) + '</span></span>' +
          '<span class="lc-sc">' + (x ? x.a + '<br>' + x.b : '') + '</span><span class="lc-st">' + st + '</span></a>';
      }).join("");
      var prac = Object.keys(s).filter(function (k) { return /^P/.test(k); }).map(function (k) {
        var x = s[k];
        return '<a class="lc-row" href="live.html?game=' + k + '"><span class="lc-no">' + k + '</span><span class="lc-teams"><span>' + esc(tname(x.teamA)) + '</span><span>' + esc(tname(x.teamB)) + '</span></span><span class="lc-sc">' + x.a + '<br>' + x.b + '</span><span class="lc-st">' + statusLine(x) + '</span></a>';
      }).join("");
      $app.innerHTML = '<section><div class="lc-list">' + (rows || '<p class="muted">The schedule is not published yet.</p>') + '</div>' +
        (prac ? '<h3 class="lc-h">Practice games</h3><p class="muted">Used to train the table crews. They do not count.</p><div class="lc-list">' + prac + '</div>' : '') + '</section>';
    }).catch(function () { $app.innerHTML = '<p class="muted">Live stats are not available right now.</p>'; });
    clearTimeout(timer); timer = setTimeout(loadIndex, 20000);
  }
  function statusLine(x) {
    if (x.phase === "end") return '<span class="pill final">Full time</span>';
    if (x.phase === "ht") return '<span class="pill live">Half time</span>';
    if (x.phase === "h1" || x.phase === "h2") {
      var t = x.running ? Math.min(x.halfEnd, x.elapsed + (now() - x.runStart) / 1000) : x.elapsed;
      return '<span class="pill live"><i class="ti ti-player-play"></i> ' + L.minuteLabel(t) + '</span>';
    }
    return '<span class="pill up">Not started</span>';
  }

  /* ---------- one game ---------- */
  function loadGame() {
    get("op=game&no=" + encodeURIComponent(no)).then(function (j) {
      off = j.serverNow - Date.now(); data = j; paint();
      var c = j.exists ? L.clock(j.meta, j.events, now()) : null;
      var live = c && (c.phase === "h1" || c.phase === "h2" || c.phase === "ht");
      clearTimeout(timer); if (!c || c.phase !== "end") timer = setTimeout(loadGame, live ? 6000 : 30000);
    }).catch(function () { if (!data) $app.innerHTML = '<p class="muted">Live stats are not available right now.</p>'; clearTimeout(timer); timer = setTimeout(loadGame, 15000); });
  }

  function paint() {
    var g = sched(no);
    if (!data.exists) {
      var a = g ? tname(g.teamA) : "", b = g ? tname(g.teamB) : "";
      $board.innerHTML = '<p class="kicker">Match center · Game ' + esc(no) + '</p><h1 style="font-size:28px">' + (g ? esc(a) + ' v ' + esc(b) : 'Game ' + esc(no)) + '</h1>' + (g ? '<p class="sub" style="margin:0">' + esc(g.day + " " + g.time) + '</p>' : '');
      $app.innerHTML = '<p class="muted" style="margin-top:18px"><a href="live.html">All games</a></p>';
      return;
    }
    var m = data.meta, ev = data.events, R = { A: roster(m.teamA), B: roster(m.teamB) };
    var st = L.stats(m, ev, R), c = L.clock(m, ev, now());
    var nA = m.nameA || tname(m.teamA), nB = m.nameB || tname(m.teamB);
    var official = g && g.status === "final" && g.scoreA != null ? g : null;
    var label = { pre: "Not started", h1: "1st half", ht: "Half time", h2: "2nd half", end: "Full time" }[c.phase];
    var liveNow = c.phase === "h1" || c.phase === "h2";
    $board.innerHTML = '<div class="lc-top"><span class="kicker" style="margin:0">' + (m.practice ? "Practice game " : "Game ") + esc(no) + (m.label && !m.practice ? " · " + esc(m.label) : (g ? " · " + esc(g.division === "W" ? "Women" : "Men") : "")) + '</span>' +
      '<button class="lc-share" id="share"><i class="ti ti-share"></i> Share</button></div>' +
      '<div class="lc-score"><div class="lc-t">' + logo(m.teamA) + '<span>' + esc(nA) + '</span></div>' +
      '<div class="lc-num"><span>' + st.score.A + '</span><span class="lc-dash">:</span><span>' + st.score.B + '</span></div>' +
      '<div class="lc-t lc-tb">' + logo(m.teamB) + '<span>' + esc(nB) + '</span></div></div>' +
      '<div class="lc-state">' + (liveNow ? '<span class="lc-live">LIVE</span> <span id="lc-clock">' + L.fmt(c.now) + '</span> · ' : '') + label +
      (c.phase !== "pre" && c.phase !== "h1" ? ' · Half time ' + st.half.A[0] + '-' + st.half.B[0] : '') + '</div>' +
      (official && (official.scoreA !== st.score.A || official.scoreB !== st.score.B) ? '<div class="lc-off">Official result from the score sheet: ' + official.scoreA + '-' + official.scoreB + '. The live log below may differ slightly.</div>' : '') +
      (m.practice ? '<div class="lc-off">Practice game, used to train the table crew. It does not count.</div>' : '');
    var sh = document.getElementById("share");
    if (sh) sh.onclick = function () { var u = location.href, t = nA + " " + st.score.A + "-" + st.score.B + " " + nB + " | CalCup 2027"; if (navigator.share) navigator.share({ title: t, url: u }).catch(function () {}); else if (navigator.clipboard) { navigator.clipboard.writeText(u); sh.textContent = "Link copied"; } };

    var tabs = [["summary", "Summary"], ["players", "Players"], ["shots", "Shot map"], ["timeline", "Play by play"]];
    var body = tab === "players" ? players(st, nA, nB) : tab === "shots" ? shotmap(st, nA, nB) : tab === "timeline" ? timeline(st, m, nA, nB) : summary(st, m, nA, nB);
    $app.innerHTML = '<div class="filterbar lc-tabs">' + tabs.map(function (x) { return '<button data-tab="' + x[0] + '" class="' + (tab === x[0] ? "on" : "") + '">' + x[1] + '</button>'; }).join("") + '</div>' + body +
      notes(st) + '<p class="muted lc-foot"><a href="live.html">All games</a> · Entered live at the scorer&rsquo;s table. The official score sheet is the record.</p>';
    Array.prototype.forEach.call(document.querySelectorAll("[data-tab]"), function (b) { b.onclick = function () { tab = b.getAttribute("data-tab"); paint(); }; });
    Array.prototype.forEach.call(document.querySelectorAll("[data-all]"), function (b) { b.onclick = function () { var s = b.getAttribute("data-all"); showAll[s] = !showAll[s]; paint(); }; });
  }
  setInterval(function () {
    var el = document.getElementById("lc-clock");
    if (el && data && data.exists) el.textContent = L.fmt(L.clock(data.meta, data.events, now()).now);
  }, 500);

  function notes(st) {
    var n = [];
    var us = st.team.A.noShooter + st.team.B.noShooter, uz = st.team.A.noZone + st.team.B.noZone;
    if (us) n.push(us + (us > 1 ? " shots have" : " shot has") + " no recorded shooter.");
    if (uz) n.push(uz + (uz > 1 ? " shots have" : " shot has") + " no recorded zone.");
    if (st.keepers.A["?"] || st.keepers.B["?"]) n.push("Some shots were faced before the goalkeeper was set at the table.");
    return n.length ? '<p class="muted lc-note">' + n.join(" ") + '</p>' : '';
  }

  /* ---------- summary ---------- */
  function summary(st, m, nA, nB) {
    var A = st.team.A, B = st.team.B;
    function row(label, a, b, na, nb) {
      var tot = (na || 0) + (nb || 0), wa = tot ? Math.round(100 * na / tot) : 50;
      return '<div class="lc-cmp"><span class="v">' + a + '</span><span class="lab">' + label + '<span class="bar"><i style="width:' + wa + '%"></i></span></span><span class="v">' + b + '</span></div>';
    }
    var cmp = '<div class="card"><div class="lc-cmph"><b>' + esc(nA) + '</b><b>' + esc(nB) + '</b></div>' +
      row("Goals", A.goals, B.goals, A.goals, B.goals) +
      row("Shots", A.shots, B.shots, A.shots, B.shots) +
      row("Shooting", pct(A.goals, A.shots), pct(B.goals, B.shots), A.shots ? A.goals / A.shots : 0, B.shots ? B.goals / B.shots : 0) +
      row("Saves", A.saves + " / " + A.faced, B.saves + " / " + B.faced, A.faced ? A.saves / A.faced : 0, B.faced ? B.saves / B.faced : 0) +
      row("7 m", A.m7g + " / " + A.m7, B.m7g + " / " + B.m7, A.m7g, B.m7g) +
      row("2 min", A.s2, B.s2, A.s2, B.s2) +
      row("Yellow / red", A.y + " / " + (A.r + A.b), B.y + " / " + (B.r + B.b), A.y + A.r, B.y + B.r) +
      row("Timeouts", st.timeouts.A, st.timeouts.B, st.timeouts.A, st.timeouts.B) + '</div>';
    var q = st.quarters, half = m.halfLen;
    var won = { A: 0, B: 0 }; q.forEach(function (x) { if (x.A > x.B) won.A++; else if (x.B > x.A) won.B++; });
    var qt = '<div class="card"><h3>Score by period</h3><table class="tbl lc-q"><thead><tr><th></th>' + q.map(function (x) { return '<th>Q' + x.q + '</th>'; }).join("") + '<th>Total</th></tr></thead><tbody>' +
      '<tr><td class="tm">' + esc(nA) + '</td>' + q.map(function (x) { return '<td' + (x.A > x.B ? ' class="lc-win"' : '') + '>' + x.A + '</td>'; }).join("") + '<td class="pts">' + st.score.A + '</td></tr>' +
      '<tr><td class="tm">' + esc(nB) + '</td>' + q.map(function (x) { return '<td' + (x.B > x.A ? ' class="lc-win"' : '') + '>' + x.B + '</td>'; }).join("") + '<td class="pts">' + st.score.B + '</td></tr></tbody></table>' +
      '<p class="muted" style="margin:8px 0 0">Periods won: ' + esc(nA) + ' ' + won.A + ', ' + esc(nB) + ' ' + won.B + '. Q1 and Q2 are the two parts of the first half, Q3 and Q4 of the second, ' + (half / 2) + ' minutes each.</p></div>';
    var r = st.runs.best;
    var run = r && r.len >= 2 ? '<div class="card"><h3>Biggest run</h3><p style="margin:0"><b>' + esc(r.team === "A" ? nA : nB) + '</b> scored ' + r.len + ' unanswered goals between ' + L.minuteLabel(r.from) + ' and ' + L.minuteLabel(r.to) + '.</p></div>' : '';
    return cmp + '<div class="card"><h3>Momentum</h3>' + momentum(st, nA, nB) + '</div>' + qt + run;
  }

  function momentum(st, nA, nB) {
    var H = st.H, W = 520, Hh = 200, pad = 16, mid = (Hh - 16) / 2 + 2;
    var pts = [{ t: 0, d: 0 }]; st.prog.forEach(function (p) { pts.push({ t: p.t, d: p.A - p.B }); });
    var maxd = 3; pts.forEach(function (p) { maxd = Math.max(maxd, Math.abs(p.d)); });
    var end = Math.max(pts[pts.length - 1].t, 60);
    var span = Math.max(2 * H, end);
    function x(t) { return pad + (W - 2 * pad) * t / span; }
    function y(d) { return mid - (mid - 14) * d / maxd; }
    var d = "M" + x(0) + "," + y(0), last = 0;
    pts.forEach(function (p, i) { if (i) { d += " L" + x(p.t) + "," + y(last) + " L" + x(p.t) + "," + y(p.d); last = p.d; } });
    var cur = data && data.exists ? Math.min(span, L.clock(data.meta, data.events, now()).now) : end;
    d += " L" + x(cur) + "," + y(last);
    var area = d + " L" + x(cur) + "," + y(0) + " L" + x(0) + "," + y(0) + " Z";
    return '<svg class="lc-mom" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="Goal difference over the game">' +
      '<defs><clipPath id="up"><rect x="0" y="0" width="' + W + '" height="' + mid + '"/></clipPath><clipPath id="dn"><rect x="0" y="' + mid + '" width="' + W + '" height="' + mid + '"/></clipPath></defs>' +
      '<path d="' + area + '" fill="#0C2138" opacity=".28" clip-path="url(#up)"/><path d="' + area + '" fill="#F47920" opacity=".35" clip-path="url(#dn)"/>' +
      '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + mid + '" y2="' + mid + '" stroke="#C9D3DD"/>' +
      '<line x1="' + x(H) + '" x2="' + x(H) + '" y1="8" y2="' + (Hh - 8) + '" stroke="#C9D3DD" stroke-dasharray="4 4"/>' +
      '<path d="' + d + '" fill="none" stroke="#13202E" stroke-width="2"/>' +
      '<text x="' + pad + '" y="14" class="lc-svt">' + esc(nA) + ' ahead</text><text x="' + pad + '" y="' + (Hh - 4) + '" class="lc-svt">' + esc(nB) + ' ahead</text>' +
      '<text x="' + x(H) + '" y="' + (Hh - 4) + '" class="lc-svt" text-anchor="middle">HT</text><text x="' + (W - pad) + '" y="' + (Hh - 4) + '" class="lc-svt" text-anchor="end">' + Math.round(span / 60) + "'</text></svg>";
  }

  /* ---------- players ---------- */
  function players(st, nA, nB) {
    function shoot(side, nm) {
      var list = Object.keys(st.players[side]).map(function (k) { return st.players[side][k]; }).sort(function (a, b) { return (b.g - a.g) || (b.a - a.a); });
      var T = st.team[side], cut = showAll[side] ? list.length : 8;
      var rows = list.slice(0, cut).map(function (p) {
        return '<tr><td class="tm">' + (p.n == null ? '' : '<span class="lc-sh">' + p.n + '</span>') + esc(p.name) + '</td><td class="pts">' + p.g + '</td><td>' + p.a + '</td><td>' + pct(p.g, p.a) + '</td><td>' + (p.m7 ? p.m7g + "/" + p.m7 : "") + '</td></tr>';
      }).join("");
      return '<div class="card"><h3>' + esc(nm) + ' · shooting</h3><table class="tbl lc-tbl"><thead><tr><th style="text-align:left">Player</th><th>G</th><th>Att</th><th>Conv</th><th>7 m</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5" class="muted">No shots yet</td></tr>') +
        '<tr class="lc-tot"><td class="tm">Team</td><td class="pts">' + T.goals + '</td><td>' + T.shots + '</td><td>' + pct(T.goals, T.shots) + '</td><td>' + (T.m7 ? T.m7g + "/" + T.m7 : "") + '</td></tr></tbody></table>' +
        (list.length > 8 ? '<button class="lc-more" data-all="' + side + '">' + (showAll[side] ? "Show fewer" : "Show all players (" + (list.length - 8) + " more)") + '</button>' : '') + '</div>';
    }
    function keepers(side, nm) {
      var list = Object.keys(st.keepers[side]).map(function (k) { return st.keepers[side][k]; });
      var T = st.team[side];
      return '<div class="card"><h3>' + esc(nm) + ' · goalkeeping</h3><table class="tbl lc-tbl"><thead><tr><th style="text-align:left">Goalkeeper</th><th>Saves</th><th>Shots</th><th>Save %</th><th>7 m</th></tr></thead><tbody>' +
        (list.map(function (k) { return '<tr><td class="tm">' + (k.n == null ? '' : '<span class="lc-sh">' + k.n + '</span>') + esc(k.name) + '</td><td class="pts">' + k.saves + '</td><td>' + k.faced + '</td><td>' + pct(k.saves, k.faced) + '</td><td>' + (k.m7 ? k.m7s + "/" + k.m7 : "") + '</td></tr>'; }).join("") || '<tr><td colspan="5" class="muted">No shots on target yet</td></tr>') +
        '<tr class="lc-tot"><td class="tm">Team</td><td class="pts">' + T.saves + '</td><td>' + T.faced + '</td><td>' + pct(T.saves, T.faced) + '</td><td></td></tr></tbody></table><p class="muted" style="margin:8px 0 0">Shots on target, empty net goals excluded.</p></div>';
    }
    var pun = st.puns.slice().sort(function (a, b) { return a.e.t - b.e.t; });
    var disc = '<div class="card"><h3>Discipline</h3>' + (pun.length ? '<table class="tbl lc-tbl"><thead><tr><th>Time</th><th style="text-align:left">Team</th><th style="text-align:left">Player</th><th style="text-align:left">Decision</th></tr></thead><tbody>' +
      pun.map(function (p) { return '<tr><td>' + L.fmt(p.e.t) + '</td><td class="tm">' + esc(p.e.team === "A" ? nA : nB) + '</td><td style="text-align:left">' + (p.e.n != null && !/^[A-D]$/.test(String(p.e.n)) ? '<span class="lc-sh">' + p.e.n + '</span>' : '') + esc(p.who) + '</td><td style="text-align:left">' + esc(L.PUNS[p.e.k]) + '</td></tr>'; }).join("") + '</tbody></table>' : '<p class="muted" style="margin:0">No cards or suspensions.</p>') + '</div>';
    return '<div class="lc-two">' + shoot("A", nA) + shoot("B", nB) + '</div><div class="lc-two">' + keepers("A", nA) + keepers("B", nB) + '</div>' + disc;
  }

  /* ---------- shot map ---------- */
  function shotmap(st, nA, nB) {
    var LAY = [["LW", "LB", "CB", "RB", "RW"], ["PV", "BT", "FB", "7M", "EN"]];
    function map(side, nm) {
      var Z = st.zones[side], best = null; // zone with the best conversion, 3 attempts or more
      Object.keys(Z).forEach(function (k) { if (k !== "?" && Z[k].a >= 3 && (!best || Z[k].g / Z[k].a > Z[best].g / Z[best].a)) best = k; });
      var cells = LAY.map(function (row) {
        return '<div class="lc-zr">' + row.map(function (z) {
          var v = Z[z] || { g: 0, a: 0 }, r = v.a ? v.g / v.a : 0;
          return '<div class="lc-z" style="background:' + (v.a ? "rgba(244,121,32," + (0.12 + 0.6 * r).toFixed(2) + ")" : "#F6F8FA") + '"><span class="zl">' + esc(L.ZONE_LABEL[z]) + '</span><b>' + v.g + '/' + v.a + '</b><span class="zp">' + (v.a ? pct(v.g, v.a) : "") + '</span></div>';
        }).join("") + '</div>';
      }).join("");
      var nz = Z["?"] ? '<p class="muted" style="margin:8px 0 0">' + Z["?"].a + ' shots without a zone (' + Z["?"].g + ' goals).</p>' : '';
      return '<div class="card"><h3>' + esc(nm) + ' · goals / attempts by zone</h3>' + cells + nz +
        (best ? '<p style="margin:8px 0 0;font-size:14px">Most efficient: <b>' + esc(L.ZONE_LABEL[best]) + '</b>, ' + Z[best].g + ' of ' + Z[best].a + '.</p>' : '') + '</div>';
    }
    return map("A", nA) + map("B", nB);
  }

  /* ---------- play by play ---------- */
  function timeline(st, m, nA, nB) {
    var H = m.halfLen * 60, lastHalf = null;
    var rows = st.timeline.map(function (x) {
      var e = x.e, half = e.t >= H && !(e.type === "phase" && e.p === "ht") ? 2 : 1, head = "";
      if (half !== lastHalf) { head = '<div class="lc-half">' + (half === 2 ? "2nd half" : "1st half") + '</div>'; lastHalf = half; }
      if (x.phase) return head + '<div class="lc-ev lc-ph"><span class="t">' + L.fmt(e.t) + '</span><span>' + esc(x.kind) + '</span><span class="s">' + x.score.A + '-' + x.score.B + '</span></div>';
      var goal = e.type === "shot" && e.r === "goal";
      var cls = goal ? "g" : e.type === "pun" ? (e.k === "2min" ? "p2" : e.k === "yellow" ? "py" : "pr") : e.type === "shot" && e.r === "saved" ? "sv" : "";
      return head + '<div class="lc-ev ' + cls + ' side' + e.team + '"><span class="t">' + L.fmt(e.t) + '</span><span class="w"><b>' + esc(x.kind) + '</b> · ' + esc(e.team === "A" ? nA : nB) +
        (x.who ? '<br><span class="muted">' + (e.n != null && !/^[A-D]$/.test(String(e.n)) ? '#' + e.n + ' ' : '') + esc(x.who.charAt(0) === "#" ? "" : x.who) + (e.z && e.z !== "7M" ? " · " + esc(L.ZONE_LABEL[e.z]) : "") + (x.keeper ? " · saved by " + esc(x.keeper) : "") + '</span>' : '') +
        '</span>' + (goal ? '<span class="s">' + x.score.A + '-' + x.score.B + '</span>' : '<span class="s"></span>') + '</div>';
    }).join("");
    return '<div class="card lc-tl">' + (rows || '<p class="muted" style="margin:0">Nothing entered yet.</p>') + '</div>';
  }

  if (no) loadGame(); else loadIndex();
})();
