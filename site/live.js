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
  var data = null, off = 0, showAll = false, lineupsOpen = false, timer = null;

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

  function initials(name) {
    var w = String(name || "").trim().split(/\s+/);
    if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
    return w.map(function (x) { return /\d/.test(x) ? x : x.charAt(0); }).join("").slice(0, 4).toUpperCase();
  }
  function badge(id, name, side) {
    return '<span class="lc-badge lc-b' + side + '">' + (byTeam[id] ? '<img src="assets/logos/' + id + '.png" alt="" onerror="this.remove()">' : '') + '<b>' + esc(initials(name)) + '</b></span>';
  }
  // team logo in place of a colored dot; initials in the team color when there is no logo file
  var JCOL = { White:"#FFFFFF", Blue:"#2E6FD6", Black:"#1F1F1F", Green:"#1E8449", Gold:"#C9A227", Red:"#C0392B", Yellow:"#E4B90B", Navy:"#1F3A93", Orange:"#F47920" };
  function tid(side) { return M ? M[side === "A" ? "teamA" : "teamB"] : ""; }
  function mk(side, size) {
    var id = tid(side), cls = "lc-tl" + (size ? " lc-tl-" + size : "");
    var fb = '<span class="' + cls + ' lc-tlf lc-b' + side + '">' + esc(((SH && SH[side]) || "").slice(0, 2)) + '</span>';
    var jc = jcolor(side), jo = jc ? '<i class="lc-jo" style="background:' + jc + '"></i>' : '';
    if (!byTeam[id]) return '<span class="lc-tlw">' + fb + jo + '</span>';
    return '<span class="lc-tlw"><img class="' + cls + '" src="assets/logos/' + id + '.png" alt="" onerror="this.outerHTML=this.dataset.fb" data-fb="' + esc(fb) + '">' + jo + '</span>';
  }
  // jersey worn in this game: schedule first, else the team's home (A) or away (B) kit
  function jname(side) {
    var g = sched(no), name = g ? (side === "A" ? g.jA : g.jB) : "";
    if (!JCOL[name]) { var t = byTeam[tid(side)] || {}, k = t.jerseyKit || t.jersey || {}; name = side === "A" ? k.home : k.away; }
    return JCOL[name] ? name : "";
  }
  function jcolor(side) { var n = jname(side); return n ? JCOL[n] : ""; }
  function jersey(side) { var n = jname(side); return n ? '<i class="lc-jd" style="background:' + JCOL[n] + '" title="' + esc(n) + ' jersey"></i>' : ''; }
  function num(n) { return n == null || n === "" ? "" : '<span class="lc-sh">#' + esc(n) + '</span>'; }

  var M, ST, NA, NB, SH;
  function paint() {
    var g = sched(no);
    if (!data.exists) {
      var a = g ? tname(g.teamA) : "", b = g ? tname(g.teamB) : "";
      $board.innerHTML = '<p class="kicker">Match center · Game ' + esc(no) + '</p><h1 style="font-size:28px">' + (g ? esc(a) + ' v ' + esc(b) : 'Game ' + esc(no)) + '</h1>' + (g ? '<p class="sub" style="margin:0">' + esc(g.day + " " + g.time) + '</p>' : '');
      $app.innerHTML = '<p class="muted" style="margin-top:18px"><a href="live.html">All games</a></p>';
      return;
    }
    M = data.meta; var ev = data.events, R = { A: roster(M.teamA), B: roster(M.teamB) };
    ST = L.stats(M, ev, R); var c = L.clock(M, ev, now());
    NA = M.nameA || tname(M.teamA); NB = M.nameB || tname(M.teamB);
    SH = { A: initials(NA), B: initials(NB) };
    var official = g && g.status === "final" && g.scoreA != null ? g : null;
    var liveNow = c.phase === "h1" || c.phase === "h2";
    var pill = liveNow ? '<span class="lc-pill lc-pl-live">LIVE <span id="lc-clock">' + L.fmt(c.now) + '</span></span>'
      : '<span class="lc-pill">' + ({ pre: "NOT STARTED", ht: "HALF TIME", end: "FULL TIME" }[c.phase] || "") + '</span>';
    var when = g ? esc(g.day + " " + g.time) : "";
    $board.innerHTML = '<div class="lc-card">' +
      '<div class="lc-ch"><span class="lc-code">' + (M.practice ? "PRACTICE " : "GAME ") + esc(no) + (g ? " · " + (g.division === "W" ? "WOMEN" : "MEN") : "") + '</span></div>' +
      '<div class="lc-ch2">' + pill + '<button class="lc-share" id="share">Share</button></div>' +
      '<div class="lc-sides"><div class="lc-side lc-sA"><span class="lc-ha">HOME</span>' + badge(M.teamA, NA, "A") + '<span class="lc-tn">' + jersey("A") + esc(NA) + '</span><span class="lc-big">' + ST.score.A + '</span></div>' +
      '<div class="lc-side lc-sB"><span class="lc-ha">AWAY</span>' + badge(M.teamB, NB, "B") + '<span class="lc-tn">' + jersey("B") + esc(NB) + '</span><span class="lc-big">' + ST.score.B + '</span></div></div>' +
      '<div class="lc-cf">' + (c.phase !== "pre" && c.phase !== "h1" ? 'Half time ' + ST.half.A[0] + '-' + ST.half.B[0] + (when ? ' · ' : '') : '') + when + '</div></div>' +
      (official && (official.scoreA !== ST.score.A || official.scoreB !== ST.score.B) ? '<div class="lc-off">Official result from the score sheet: ' + official.scoreA + '-' + official.scoreB + '. The live log may differ slightly.</div>' : '') +
      (M.practice ? '<div class="lc-off">Practice game, used to train the table crew. It does not count.</div>' : '');
    var sh = document.getElementById("share");
    if (sh) sh.onclick = function () { var u = location.href, t = NA + " " + ST.score.A + "-" + ST.score.B + " " + NB + " | CalCup 2027"; if (navigator.share) navigator.share({ title: t, url: u }).catch(function () {}); else if (navigator.clipboard) { navigator.clipboard.writeText(u); sh.textContent = "Link copied"; } };

    $app.innerHTML = lineups(R) + matchAnalysis() + analysis(c) + timeline() + notes(ST) +
      '<p class="muted lc-foot"><a href="live.html">All games</a> · Entered live at the scorer&rsquo;s table. The official score sheet is the record.</p>';
    var lu = document.getElementById("lc-lu"); if (lu) lu.addEventListener("toggle", function () { lineupsOpen = lu.open; });
    var sa = document.getElementById("lc-all"); if (sa) sa.onclick = function () { showAll = !showAll; paint(); };
  }
  setInterval(function () {
    var el = document.getElementById("lc-clock");
    if (el && data && data.exists) el.textContent = L.fmt(L.clock(data.meta, data.events, now()).now);
  }, 500);

  /* ---------- lineups ---------- */
  function lineups(R) {
    var nA = R.A.length, nB = R.B.length;
    function list(side) {
      var r = R[side]; if (!r.length) return '<p class="muted">No roster on file.</p>';
      var goals = {}, two = {}, yc = {}, rc = {};
      Object.keys(ST.players[side]).forEach(function (k) { goals[k] = ST.players[side][k].g; });
      ST.puns.forEach(function (p) { if (p.e.team !== side) return; var k = String(p.e.n); if (p.e.k === "2min") two[k] = (two[k] || 0) + 1; else if (p.e.k === "yellow") yc[k] = 1; else rc[k] = 1; });
      return '<ul class="lc-lul">' + r.slice().sort(function (a, b) { return a.n - b.n; }).map(function (p) {
        var k = String(p.n);
        return '<li><span class="lc-ln">' + p.n + '</span><span class="lc-lnm">' + esc(p.name) + '</span>' +
          (yc[k] ? '<i class="lc-cd lc-cy"></i>' : '') + (two[k] ? '<span class="lc-2m">' + (two[k] > 1 ? two[k] + "×" : "") + "2'</span>" : '') + (rc[k] ? '<i class="lc-cd lc-cr"></i>' : '') +
          '<span class="lc-lg">' + (goals[k] || "") + '</span></li>';
      }).join("") + '</ul>';
    }
    return '<details class="card lc-lu" id="lc-lu"' + (lineupsOpen ? " open" : "") + '><summary><span><b>Lineups</b><small>' + nA + ' and ' + nB + ' players · goals update live</small></span></summary>' +
      '<div class="lc-two"><div><h4 class="lc-tA">' + mk("A") + esc(NA) + jersey("A") + '</h4>' + list("A") + '</div><div><h4 class="lc-tB">' + mk("B") + esc(NB) + jersey("B") + '</h4>' + list("B") + '</div></div></details>';
  }

  /* ---------- match analysis: momentum dots, shooting, goalkeeping ---------- */
  function matchAnalysis() {
    var lg = ST.lastGoals, ca = lg.filter(function (t) { return t === "A"; }).length, cb = lg.length - ca;
    var mom = lg.length ? '<div class="lc-dots">' + lg.map(function (t) { return '' + mk(t, "lg") + ''; }).join("") + '<span>' + esc(ca >= cb ? NA : NB) + ' ' + Math.max(ca, cb) + '/' + lg.length + '</span></div>' : '<p class="muted">No goals yet.</p>';
    function rows(side) {
      var list = Object.keys(ST.players[side]).map(function (k) { return ST.players[side][k]; });
      var unk = list.filter(function (p) { return p.n == null; })[0];
      list = list.filter(function (p) { return p.n != null; }).sort(function (a, b) { return (b.g - a.g) || (b.a - a.a); });
      var top = showAll ? list : list.slice(0, 5), rest = showAll ? [] : list.slice(5), T = ST.team[side];
      var html = top.map(function (p) { return '<tr><td class="tm">' + mk(side) + '' + num(p.n) + esc(p.name.charAt(0) === "#" ? "" : p.name) + '</td><td class="pts">' + p.g + '</td><td>' + p.a + '</td><td>' + pct(p.g, p.a) + '</td></tr>'; }).join("");
      if (rest.length) { var rg = 0, ra = 0; rest.forEach(function (p) { rg += p.g; ra += p.a; }); html += '<tr><td class="tm">' + mk(side) + 'Other players (' + rest.length + ')</td><td class="pts">' + rg + '</td><td>' + ra + '</td><td>' + pct(rg, ra) + '</td></tr>'; }
      if (unk) html += '<tr class="lc-unk"><td class="tm">' + mk(side) + 'Unknown shooter</td><td class="pts">' + unk.g + '</td><td>' + unk.a + '</td><td>' + pct(unk.g, unk.a) + '</td></tr>';
      html += '<tr class="lc-tot"><td class="tm">' + mk(side) + '' + esc(side === "A" ? NA : NB) + ' total</td><td class="pts">' + T.goals + '</td><td>' + T.shots + '</td><td>' + pct(T.goals, T.shots) + '</td></tr>';
      return { html: html, more: rest.length };
    }
    var a = rows("A"), b = rows("B"), more = a.more + b.more;
    var unkN = ST.team.A.noShooter + ST.team.B.noShooter;
    var shooting = '<table class="lc-shoot"><thead><tr><th style="text-align:left">Player</th><th>G</th><th>Att</th><th>Conv</th></tr></thead><tbody>' + a.html + b.html + '</tbody></table>' +
      (more || showAll ? '<button class="lc-more" id="lc-all">' + (showAll ? "Show fewer players" : "Show all players (" + more + " more)") + '</button>' : '') +
      '<p class="lc-legend">G = goals, Att = recorded attempts, Conv = goals divided by attempts.' + (unkN ? ' ' + unkN + (unkN > 1 ? ' shots have' : ' shot has') + ' no shooter recorded, so a player&rsquo;s real rate may be lower than shown.' : '') + '</p>';
    function gk(side) {
      var other = side === "A" ? "B" : "A", K = ST.keepers[side], T = ST.team[side];
      var list = Object.keys(K).map(function (k) { return K[k]; }).sort(function (x, y) { return y.faced - x.faced; });
      return list.map(function (k) { return '<div class="lc-gk"><span>' + mk(side) + '' + num(k.n) + esc(k.n == null ? "Keeper not set" : (k.name.charAt(0) === "#" ? "" : k.name)) + '</span><span><b>' + pct(k.saves, k.faced) + '</b> (' + k.saves + '/' + k.faced + ')</span></div>'; }).join("") +
        '<p class="lc-legend">' + esc(side === "A" ? NA : NB) + ' keepers: ' + T.saves + ' saves of ' + T.faced + ' shots on target · ' + pct(T.saves, T.faced) + '</p>';
    }
    return '<div class="card lc-sec"><h3>Match analysis</h3><h5>Momentum</h5>' + mom + '<h5>Shooting</h5>' + shooting + '<h5>Goalkeeping</h5>' + gk("A") + gk("B") + '<p class="lc-legend">Save rate = saves divided by shots on target (goals plus saves). Missed and blocked shots do not count, and neither do empty net goals.</p></div>';
  }

  /* ---------- game analysis: run, momentum chart, keepers, periods, distribution, shot map ---------- */
  function analysis(c) {
    var r = ST.runs.best;
    var run = r && r.len >= 2 ? '<div class="lc-run"><div><b>Biggest run: ' + esc(r.team === "A" ? SH.A : SH.B) + ' scored ' + r.len + ' unanswered</b><small>Between ' + L.minuteLabel(r.from) + ' and ' + L.minuteLabel(r.to) + '</small></div><span>' + ST.score.A + ' - ' + ST.score.B + '</span></div>' : '';
    function gkCard(side) {
      var K = ST.keepers[side], T = ST.team[side];
      var list = Object.keys(K).map(function (k) { return K[k]; }).sort(function (x, y) { return y.faced - x.faced; });
      var k = list[0];
      return '<div class="lc-gkc"><small>' + esc(SH[side]) + ' GK</small>' + (k ? '<div class="lc-gkb lc-gk' + side + '"><b>' + (k.n == null ? "Not set" : '#' + k.n + ' ' + esc(k.name.charAt(0) === "#" ? "" : k.name)) + '</b><span class="lc-gkp">' + pct(k.saves, k.faced) + '</span><small>' + k.saves + '/' + k.faced + ' saves</small></div>' : '<div class="lc-gkb">No shots yet</div>') +
        '<small class="lc-gkt">Team ' + T.saves + '/' + T.faced + ' · <b>' + pct(T.saves, T.faced) + '</b></small></div>';
    }
    var per = ST.periods, won = { A: 0, B: 0 };
    per.forEach(function (p) { if (p.A > p.B) won.A++; else if (p.B > p.A) won.B++; });
    function perRow(h) {
      return '<div class="lc-prow"><span class="lc-plab">' + (h === 1 ? "1st half" : "2nd half") + '</span>' + per.filter(function (p) { return p.half === h; }).map(function (p) {
        var w = p.A > p.B ? "A" : p.B > p.A ? "B" : "";
        var future = p.from > c.now && !w && !p.A && !p.B;
        return '<div class="lc-pc' + (w ? " lc-pw" + w : "") + (future ? " lc-pf" : "") + '"><small>' + Math.round(p.from / 60) + "'-" + Math.round(p.to / 60) + "'</small><b>" + p.A + '-' + p.B + '</b><small>' + (w ? esc(SH[w]) : future ? "" : "Level") + '</small></div>';
      }).join("") + '</div>';
    }
    var periods = perRow(1) + perRow(2) + '<p class="lc-legend">Periods of ' + ST.blockMin + ' minutes won: ' + esc(SH.A) + ' ' + won.A + ' · ' + esc(SH.B) + ' ' + won.B + '</p>';
    function dist(side) {
      var T = ST.team[side]; if (!T.goals) return '<div class="lc-dist"><small>' + esc(SH[side]) + '</small><div class="lc-bar"></div></div>';
      var list = Object.keys(ST.players[side]).map(function (k) { return ST.players[side][k]; }).filter(function (p) { return p.g; }).sort(function (a, b) { return b.g - a.g; });
      var segs = list.slice(0, 3), rest = 0; list.slice(3).forEach(function (p) { rest += p.g; });
      var op = [1, .72, .5];
      return '<div class="lc-dist"><small>' + esc(SH[side]) + '</small><div class="lc-bar">' + segs.map(function (p, i) { return '<i class="lc-seg lc-g' + side + '" style="width:' + (100 * p.g / T.goals) + '%;opacity:' + op[i] + '" title="' + esc(p.name) + ' ' + p.g + '">' + (p.g / T.goals > .12 ? (p.n == null ? "?" : "#" + p.n) : "") + '</i>'; }).join("") +
        (rest ? '<i class="lc-seg lc-g' + side + '" style="width:' + (100 * rest / T.goals) + '%;opacity:.28" title="Other players ' + rest + '"></i>' : '') + '</div></div>';
    }
    return '<div class="card lc-sec"><div class="lc-sh2"><h3>Game analysis</h3><span class="lc-pill lc-pill-s">' + ({ pre: "NOT STARTED", h1: "LIVE", ht: "HALF TIME", h2: "LIVE", end: "FULL TIME" }[c.phase]) + '</span></div>' + run +
      '<h5>Momentum</h5>' + momentum() +
      '<h5>Goalkeeping</h5><div class="lc-two lc-two-k">' + gkCard("A") + gkCard("B") + '</div>' +
      '<h5>Score by period</h5>' + periods +
      '<h5>Goal distribution</h5>' + dist("A") + dist("B") +
      '<h5>Shot map</h5>' + court("A") + court("B") + insight() + '</div>';
  }

  function momentum() {
    var H = ST.H, W = 520, Hh = 190, pad = 18, mid = 92;
    var pts = [{ t: 0, d: 0 }]; ST.prog.forEach(function (p) { pts.push({ t: p.t, d: p.A - p.B }); });
    var maxd = 3; pts.forEach(function (p) { maxd = Math.max(maxd, Math.abs(p.d)); });
    var span = Math.max(2 * H, pts[pts.length - 1].t);
    function x(t) { return pad + (W - 2 * pad) * t / span; }
    function y(d) { return mid - (mid - 16) * d / maxd; }
    var cur = Math.min(span, L.clock(data.meta, data.events, now()).now);
    var d = "M" + x(0) + "," + y(0), last = 0;
    pts.forEach(function (p, i) { if (i) { d += " L" + x(p.t) + "," + y(last) + " L" + x(p.t) + "," + y(p.d); last = p.d; } });
    d += " L" + x(Math.max(cur, pts[pts.length - 1].t)) + "," + y(last);
    var area = d + " L" + x(Math.max(cur, pts[pts.length - 1].t)) + "," + y(0) + " L" + x(0) + "," + y(0) + " Z";
    var diff = ST.score.A - ST.score.B;
    return '<div class="lc-momw"><svg class="lc-mom" viewBox="0 0 ' + W + ' ' + Hh + '" role="img" aria-label="Goal difference over the game">' +
      '<defs><clipPath id="up"><rect x="0" y="0" width="' + W + '" height="' + mid + '"/></clipPath><clipPath id="dn"><rect x="0" y="' + mid + '" width="' + W + '" height="' + Hh + '"/></clipPath></defs>' +
      '<path d="' + area + '" fill="#2E5C8F" opacity=".32" clip-path="url(#up)"/><path d="' + area + '" fill="#F47920" opacity=".45" clip-path="url(#dn)"/>' +
      '<path d="' + d + '" fill="none" stroke="#0C2138" stroke-width="1.6" clip-path="url(#up)"/><path d="' + d + '" fill="none" stroke="#C75E12" stroke-width="1.6" clip-path="url(#dn)"/>' +
      '<line x1="' + pad + '" x2="' + (W - pad) + '" y1="' + mid + '" y2="' + mid + '" stroke="#C9D3DD"/>' +
      '<line x1="' + x(H) + '" x2="' + x(H) + '" y1="22" y2="' + (Hh - 26) + '" stroke="#9AA8B6" stroke-dasharray="3 3"/>' +
      '<text x="' + pad + '" y="14" class="lc-svt lc-svA">&#8593; ' + esc(SH.A) + '</text><text x="' + (W - pad) + '" y="14" class="lc-svt" text-anchor="end">' + (diff > 0 ? "+" : "") + diff + '</text>' +
      '<text x="' + pad + '" y="' + (Hh - 14) + '" class="lc-svt">0\'</text><text x="' + x(H) + '" y="' + (Hh - 14) + '" class="lc-svt" text-anchor="middle">HT</text><text x="' + (W - pad) + '" y="' + (Hh - 14) + '" class="lc-svt" text-anchor="end">' + Math.round(span / 60) + '\'</text>' +
      '<text x="' + pad + '" y="' + (Hh - 1) + '" class="lc-svt lc-svB">&#8595; ' + esc(SH.B) + '</text></svg></div>';
  }

  // shot map on a half court: zones placed where the shots are taken
  function court(side) {
    var Z = ST.zones[side], T = ST.team[side];
    // 20 m wide half court at 15 px per metre; goal 3 m; 6 m and 9 m lines are quarter circles
    // from each post joined by a straight line across the middle
    var pos = { LW: [24, 60], RW: [276, 60], PV: [150, 112], LB: [58, 150], RB: [242, 150], CB: [150, 172] };
    function pill(z) {
      var v = Z[z] || { g: 0, a: 0 }, p = pos[z], r = v.a ? v.g / v.a : 0;
      var op = v.a ? (0.45 + 0.55 * r).toFixed(2) : 0.15;
      return '<g transform="translate(' + p[0] + ',' + p[1] + ')"><rect x="-21" y="-12" width="42" height="24" rx="8" class="lc-zp' + side + '" style="opacity:' + op + '"/><text y="5" text-anchor="middle" class="lc-zt">' + v.g + '/' + v.a + '</text></g>';
    }
    var svg = '<svg class="lc-court" viewBox="0 0 300 196" role="img" aria-label="Goals and attempts by zone">' +
      '<rect x="1" y="1" width="298" height="194" rx="10" class="lc-cbg"/>' +
      '<path d="M37.5 1 A90 90 0 0 0 127.5 91 L172.5 91 A90 90 0 0 0 262.5 1 Z" class="lc-six"/>' +
      '<path d="M1 45 A135 135 0 0 0 127.5 136 L172.5 136 A135 135 0 0 0 299 45" class="lc-nine"/>' +
      '<line x1="142.5" x2="157.5" y1="106" y2="106" class="lc-sev"/>' +
      '<rect x="127.5" y="1" width="45" height="6" class="lc-goal"/>' +
      ["LW", "RW", "PV", "LB", "RB", "CB"].map(pill).join("") + '</svg>';
    function s(z, lab) { var v = Z[z]; return v ? lab + ' ' + v.g + '/' + v.a : null; }
    var extra = [s("7M", "7 metre"), s("FB", "Fast break"), s("BT", "Breakthrough"), s("EN", "Empty net")].filter(Boolean);
    if (Z["?"]) extra.push(Z["?"].a + (Z["?"].a > 1 ? " shots" : " shot") + " without a zone");
    return '<div class="lc-cw"><small>' + esc(SH[side]) + ' · ' + T.goals + ' of ' + T.shots + '</small>' + svg + (extra.length ? '<p class="lc-legend">' + extra.join(" · ") + '</p>' : '') + '</div>';
  }
  function insight() {
    var out = [];
    ["A", "B"].forEach(function (side) {
      var Z = ST.zones[side], best = null;
      Object.keys(Z).forEach(function (k) { if (k !== "?" && Z[k].a >= 3 && (!best || Z[k].g / Z[k].a > Z[best].g / Z[best].a || (Z[k].g / Z[k].a === Z[best].g / Z[best].a && Z[k].a > Z[best].a))) best = k; });
      if (best) out.push(esc(SH[side]) + ': ' + Z[best].g + ' of ' + Z[best].a + ' from the ' + esc(L.ZONE_LABEL[best].toLowerCase()) + '.');
    });
    return out.length ? '<p class="lc-ins">' + out.join(" ") + '</p>' : '';
  }

  /* ---------- play by play: home on the left, away on the right ---------- */
  function timeline() {
    var H = M.halfLen * 60, items = [];
    function who(team, n, name) { return (n != null && !/^[A-D]$/.test(String(n)) ? '#' + n + ' ' : '') + (name && name.charAt(0) !== "#" ? name : (n == null ? "Unknown" : "")); }
    ST.timeline.forEach(function (x) {
      var e = x.e;
      if (x.phase) { items.push({ mid: true, t: e.t, label: x.kind, score: x.score }); return; }
      if (e.type === "shot") {
        var zone = e.z && e.z !== "7M" ? e.z : (e.z === "7M" ? "7M" : "");
        if (e.r === "saved") {
          var kp = x.keeper ? who(L.other(e.team), x.keeperN, x.keeper) : "";
          items.push({ side: L.other(e.team), t: e.t, ic: "sv", title: "Save", who: kp || "Keeper not set", sub: "Shot by " + who(e.team, e.n, x.who) });
          items.push({ side: e.team, t: e.t, ic: "ss", title: e.z === "7M" ? "7m saved" : "Shot saved", who: who(e.team, e.n, x.who), zone: zone, sub: kp ? "Saved by " + kp : "" });
        } else items.push({ side: e.team, t: e.t, ic: e.r === "goal" ? "gl" : e.r === "blocked" ? "bl" : "ms", title: x.kind, who: who(e.team, e.n, x.who), zone: zone, score: e.r === "goal" ? x.score : null });
      } else if (e.type === "pun") items.push({ side: e.team, t: e.t, ic: e.k === "2min" ? "p2" : e.k === "yellow" ? "py" : "pr", title: x.kind, who: /^[A-D]$/.test(String(e.n)) ? x.who : who(e.team, e.n, x.who) });
      else if (e.type === "timeout") items.push({ side: e.team, t: e.t, ic: "to", title: "Timeout", who: e.team === "A" ? NA : NB });
      else if (e.type === "gk") items.push({ side: e.team, t: e.t, ic: "gk", title: "In goal", who: who(e.team, e.n, x.who) });
    });
    var lastHalf = null, html = "";
    items.forEach(function (it) {
      var half = it.t >= H && !(it.mid && it.label === "Half time") ? 2 : 1;
      if (half !== lastHalf) { html += '<div class="lc-tlh">' + (half === 2 ? "2ND HALF" : "1ST HALF") + '</div>'; lastHalf = half; }
      if (it.mid) { html += '<div class="lc-tlm"><span>' + esc(it.label) + ' · ' + it.score.A + '-' + it.score.B + '</span></div>'; return; }
      var body = '<div class="lc-tlb"><span class="lc-ic lc-ic-' + it.ic + '"></span><div><b>' + esc(it.who) + '</b><span>' + esc(it.title) + (it.zone ? ' <em>' + esc(it.zone) + '</em>' : '') + (it.score ? ' <strong>' + it.score.A + '-' + it.score.B + '</strong>' : '') + '</span>' + (it.sub ? '<small>' + esc(it.sub) + '</small>' : '') + '</div></div>';
      html += '<div class="lc-tlr">' + (it.side === "A" ? body : '<div></div>') + '<div class="lc-tls">' + mk(it.side) + '<small>' + L.fmt(it.t) + '</small></div>' + (it.side === "B" ? body : '<div></div>') + '</div>';
    });
    return '<div class="card lc-tl2"><div class="lc-tlt"><span class="lc-tA">' + mk("A") + esc(NA) + jersey("A") + '</span><span class="lc-tB">' + jersey("B") + esc(NB) + mk("B") + '</span></div>' + (html || '<p class="muted" style="padding:12px">Nothing entered yet.</p>') + '</div>';
  }

  function notes(st) {
    var n = [];
    if (st.keepers.A["?"] || st.keepers.B["?"]) n.push("Some shots were faced before the goalkeeper was set at the table.");
    return n.length ? '<p class="muted lc-note">' + n.join(" ") + '</p>' : '';
  }

  if (no) loadGame(); else loadIndex();
})();
