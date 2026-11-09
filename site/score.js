/* CalCup live scoring: the scorer app (score.html). One phone or tablet at the table per game.
   Every tap becomes an event in a local queue first, so a weak gym connection never loses a goal;
   the queue is sent to the live function every two seconds and resent until the server accepts it. */
(function () {
  var D = window.CALCUP || {}, L = window.LiveCore;
  var API = "/.netlify/functions/live";
  var JCOL = { White:"#FFFFFF", Blue:"#2E6FD6", Black:"#1F1F1F", Green:"#1E8449", Gold:"#C9A227", Red:"#C0392B", Yellow:"#E4B90B", Navy:"#1F3A93", Orange:"#F47920" };
  var games = D.games || [], rosters = D.rosters || {};
  // registered teams first, then every other team CalHeat knows (Team Styles), for practice games
  var teams = (D.teams || []).slice(), byTeam = {};
  teams.forEach(function (t) { byTeam[t.id] = t; });
  (D.teamStyles || []).forEach(function (t) { if (!byTeam[t.id]) { byTeam[t.id] = t; teams.push(t); } });
  var $app = document.getElementById("app"), $sheet = document.getElementById("sheet"), $veil = document.getElementById("veil");

  function ls(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]; }); }
  var dev = ls("live-dev"); if (!dev) { dev = L.uid(); ls("live-dev", dev); }
  var S = ls("live-sess"); // {token, role, name}
  var G = null; // current game: {no, meta, events, pending, serverOk, taken}
  var seqLocal = 1e9;

  function toast(msg) { var t = document.getElementById("toast"); t.textContent = msg; t.style.display = "block"; clearTimeout(toast._t); toast._t = setTimeout(function () { t.style.display = "none"; }, 2200); }
  function api(op, body) {
    return fetch(API + "?op=" + op, { method: "POST", headers: { "Content-Type": "application/json", Authorization: S ? "Bearer " + S.token : "" }, body: JSON.stringify(body || {}) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); });
  }

  /* ---------- teams and rosters ---------- */
  function tname(id, fallback) { return (byTeam[id] && byTeam[id].name) || fallback || (/^tbd-/i.test(id || "") ? "TBD " + id.slice(4).toUpperCase() : id) || "TBD"; }
  function roster(id) {
    return (rosters[id] || []).filter(function (p) { return !p.official && p.n != null && p.n !== ""; })
      .map(function (p) { return { n: Number(p.n), name: p.name, pos: p.pos || "", gk: /^(GK|G|GOALKEEPER|GOALIE)$/i.test(p.pos || "") }; })
      .sort(function (a, b) { return a.n - b.n; });
  }
  function colorOf(side) {
    var g = G && G.game, jn = g ? (side === "A" ? g.jA : g.jB) : null, id = G.meta[side === "A" ? "teamA" : "teamB"];
    return JCOL[jn] || (byTeam[id] && byTeam[id].jersey && byTeam[id].jersey.c) || (side === "A" ? "#FFFFFF" : "#F47920");
  }
  function sideName(side) { return G.meta[side === "A" ? "nameA" : "nameB"] || tname(G.meta[side === "A" ? "teamA" : "teamB"]); }
  function sideRoster(side) { return roster(G.meta[side === "A" ? "teamA" : "teamB"]); }
  function rosterPair() { return { A: sideRoster("A"), B: sideRoster("B") }; }

  /* ---------- screens ---------- */
  function topbar(inner) {
    return '<div class="top"><div class="row"><span class="brand">CAL<b>CUP</b> live scoring</span><span class="sync" id="sync"></span></div>' + (inner || "") + '</div>';
  }
  function renderLogin(msg) {
    $app.innerHTML = topbar() + '<div class="wrap"><div class="card"><h2>Table crew sign in</h2><p class="muted">Use the scoring code from the tournament organizers. You sign in once per weekend on each device.</p>' +
      '<label>Your name</label><input id="nm" autocomplete="name" value="' + esc((ls("live-name") || "")) + '">' +
      '<label>Scoring code</label><input id="pin" type="password" autocomplete="off">' +
      '<div class="err" id="er">' + esc(msg || "") + '</div><button class="btn pri full" id="go">Sign in</button></div></div>';
    document.getElementById("go").onclick = function () {
      var name = document.getElementById("nm").value.trim(), pin = document.getElementById("pin").value.trim();
      ls("live-name", name);
      api("login", { name: name, pin: pin }).then(function (j) {
        if (!j.token) { document.getElementById("er").textContent = j.message || "Sign in failed."; return; }
        S = { token: j.token, role: j.role, name: j.name }; ls("live-sess", S); renderPick();
      }).catch(function () { document.getElementById("er").textContent = "No connection. Try again."; });
    };
  }

  function renderPick() {
    var list = games.slice().sort(function (a, b) { return a.no - b.no; }).map(function (g) {
      var saved = ls("live-game-" + g.no);
      return '<button data-no="' + g.no + '"><span class="no">' + g.no + '</span><span class="tt">' + esc(tname(g.teamA)) + ' v ' + esc(tname(g.teamB)) +
        '<small>' + esc(g.day + " " + g.time + " · " + (g.division === "W" ? "Women" : "Men") + (g.label ? " · " + g.label : "")) + '</small></span>' +
        (saved && saved.events && saved.events.length ? '<span class="tag live">open</span>' : '') + '</button>';
    }).join("");
    var opts = teams.map(function (t) { return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>'; }).join("");
    $app.innerHTML = topbar() + '<div class="wrap">' +
      '<div class="card"><h2>Pick the game you are scoring</h2><div class="glist" id="gl">' + (list || '<p class="muted">No games in the schedule yet.</p>') + '</div></div>' +
      '<div class="card"><h2>Practice game</h2><p class="muted">For training the table crew or scoring a video. Practice games show on the match center as practice and never count.</p>' +
      '<label>Home team</label><select id="pa">' + opts + '</select><label>Away team</label><select id="pb">' + opts + '</select>' +
      '<label>Practice slot</label><select id="ps"><option>P1</option><option>P2</option><option>P3</option></select>' +
      '<div style="margin-top:12px"><button class="btn full" id="pgo">Open practice game</button></div></div>' +
      '<p class="muted">Signed in as ' + esc(S.name) + (S.role === "admin" ? " (organizer)" : "") + ' · <a href="#" id="out">Sign out</a></p></div>';
    var pb = document.getElementById("pb"); if (pb.options.length > 1) pb.selectedIndex = 1;
    Array.prototype.forEach.call(document.querySelectorAll("#gl button"), function (b) {
      b.onclick = function () {
        var g = games.filter(function (x) { return String(x.no) === b.getAttribute("data-no"); })[0];
        askSettings({ no: String(g.no), teamA: g.teamA, teamB: g.teamB, nameA: tname(g.teamA), nameB: tname(g.teamB), division: g.division, label: g.label || "" }, g);
      };
    });
    document.getElementById("pgo").onclick = function () {
      var a = document.getElementById("pa").value, b = document.getElementById("pb").value;
      if (a === b) { toast("Pick two different teams."); return; }
      askSettings({ no: document.getElementById("ps").value, teamA: a, teamB: b, nameA: tname(a), nameB: tname(b), division: (byTeam[a] || {}).division || "M", label: "Practice" }, null);
    };
    document.getElementById("out").onclick = function (e) { e.preventDefault(); ls("live-sess", null); S = null; renderLogin(); };
  }

  function askSettings(meta, game) {
    var saved = ls("live-game-" + meta.no);
    var half = (saved && saved.meta && saved.meta.halfLen) || ls("live-half") || 25;
    openSheet('<h2>Game ' + esc(meta.no) + ': ' + esc(meta.nameA) + ' v ' + esc(meta.nameB) + '<button data-close>&times;</button></h2>' +
      '<label>Half length (minutes)</label><select id="hl">' + [20, 25, 30].map(function (m) { return '<option' + (m === half ? " selected" : "") + '>' + m + '</option>'; }).join("") + '</select>' +
      '<p class="hint" style="margin-top:8px">Check the two teams and the half length against the score sheet. They can change until the first event is entered.</p>' +
      '<button class="btn pri full" id="open">Open game</button><div class="err" id="er2"></div>');
    document.getElementById("open").onclick = function () {
      meta.halfLen = Number(document.getElementById("hl").value); ls("live-half", meta.halfLen);
      openGame(meta, game, false);
    };
  }

  function openGame(meta, game, takeover) {
    api("setup", { no: meta.no, dev: dev, meta: meta, takeover: takeover }).then(function (j) {
      if (j._status === 401) { ls("live-sess", null); S = null; closeSheet(); renderLogin("Your session ended. Sign in again."); return; }
      if (j._status === 409 && j.error === "held") {
        openSheet('<h2>Game ' + esc(meta.no) + '<button data-close>&times;</button></h2><p>' + esc(j.message) + '</p><p class="muted">Take over only if that device is no longer scoring, for example a phone with a dead battery. The other device stops sending as soon as you take over.</p>' +
          '<button class="btn red full" id="tk">Take over this game</button>');
        document.getElementById("tk").onclick = function () { openGame(meta, game, true); };
        return;
      }
      if (!j.ok) { var er = document.getElementById("er2"); if (er) er.textContent = j.message || "Could not open the game."; else toast(j.message || "Could not open the game."); return; }
      closeSheet();
      var off = j.serverNow - Date.now();
      var saved = ls("live-game-" + meta.no);
      var pending = (saved && saved.pending) || [];
      var serverIds = {}; j.events.forEach(function (e) { serverIds[e.id] = 1; });
      pending = pending.filter(function (e) { return !serverIds[e.id]; });
      var evs = j.events.map(function (e) { var c = Object.assign({}, e); c.w = e.w - off; return c; }).concat(pending);
      G = { no: meta.no, meta: j.meta, game: game, events: evs, pending: pending, taken: false };
      save(); renderGame(); keepAwake();
    }).catch(function () {
      // offline: reopen from this device's copy if there is one
      var saved = ls("live-game-" + meta.no);
      if (saved && saved.meta) { closeSheet(); G = { no: meta.no, meta: saved.meta, game: game, events: saved.events || [], pending: saved.pending || [] }; renderGame(); toast("Offline: working from this device. Events are sent when the connection returns."); }
      else toast("No connection. The game must be opened online once.");
    });
  }
  function save() { if (G) ls("live-game-" + G.no, { meta: G.meta, events: G.events, pending: G.pending }); }

  /* ---------- events ---------- */
  function clk() { return L.clock(G.meta, G.events, Date.now()); }
  function add(e) {
    e.id = L.uid(); e.w = Date.now(); if (e.t == null) e.t = Math.round(clk().now); e.seq = ++seqLocal;
    G.events.push(e); G.pending.push(e); save(); renderGame(); sync();
    return e;
  }

  var syncing = false, lastOk = Date.now(), online = true;
  function sync() {
    if (!G || syncing || G.taken || !G.pending.length) { paintSync(); return; }
    syncing = true;
    var batch = G.pending.slice(0, 100);
    api("push", { no: G.no, dev: dev, clientNow: Date.now(), events: batch }).then(function (j) {
      syncing = false; online = true;
      if (j._status === 401) { toast("Sign in again to keep sending."); ls("live-sess", null); S = null; renderLogin("Your session ended. Your events are kept on this device and sent after you sign in."); return; }
      if (j._status === 409) { G.taken = true; renderGame(); return; }
      if (j.ok) {
        var acc = {}; (j.accepted || []).forEach(function (id) { acc[id] = 1; });
        G.pending = G.pending.filter(function (e) { return !acc[e.id]; });
        lastOk = Date.now(); save();
        if (G.pending.length) setTimeout(sync, 200);
      }
      paintSync(); paintLog();
    }).catch(function () { syncing = false; online = false; paintSync(); });
  }
  setInterval(sync, 2000);
  window.addEventListener("online", sync);

  function paintSync() {
    var el = document.getElementById("sync"); if (!el) return;
    if (!G) { el.innerHTML = S ? esc(S.name) : ""; return; }
    var n = G.pending.length;
    el.innerHTML = G.taken ? '<span class="dot off"></span>Taken over' : !online ? '<span class="dot off"></span>Offline · ' + n + ' waiting' : n ? '<span class="dot wait"></span>' + n + ' sending' : '<span class="dot"></span>Live';
  }

  /* ---------- scoring screen ---------- */
  var PHASE_TXT = { pre: "Before throw off", h1: "1st half", ht: "Half time", h2: "2nd half", end: "Full time" };
  function renderGame() {
    if (!G) return;
    var c = clk(), sc = L.score(G.events), ph = c.phase;
    var play = ph === "h1" || ph === "h2";
    var head = '<div class="board"><div class="tn"><span class="sw" style="background:' + colorOf("A") + '"></span>' + esc(sideName("A")) + '</div>' +
      '<div class="sc">' + sc.A + ' : ' + sc.B + '</div><div class="tn b">' + esc(sideName("B")) + '<span class="sw" style="background:' + colorOf("B") + '"></span></div></div>' +
      '<div class="clockrow">' + (play ? '<button class="cbtn" id="cadj">&plusmn;</button>' : '') + '<span class="clk" id="clk">' + L.fmt(c.now) + '</span>' +
      (play ? '<button class="cbtn" id="cpp">' + (c.running ? "Pause" : "Resume") + '</button>' : '') + '</div>' +
      '<div class="phase">Game ' + esc(G.no) + ' · ' + PHASE_TXT[ph] + ' · ' + G.meta.halfLen + ' min halves</div><div class="susp" id="susp"></div>';
    var phaseBtn = { pre: ["Start 1st half", "h1", "pri"], h1: ["Half time", "ht", ""], ht: ["Start 2nd half", "h2", "pri"], h2: ["Full time", "end", ""] }[ph];
    var taken = G.taken ? '<div class="card" style="margin:10px;border-color:#E5B8B8"><b>Another device took over this game.</b><p class="muted">Nothing entered here is sent any more. Tap below to go back to the game list.</p><button class="btn ghost full" id="back2">Game list</button></div>' : '';
    function col(side) {
      var dis = play && !G.taken ? "" : " disabled";
      return '<div class="col"><h3><span>' + esc(sideName(side)) + '</span><span>TO ' + countTO(side) + '</span></h3>' +
        '<button class="act goal" data-a="goal" data-s="' + side + '"' + dis + '>Goal</button>' +
        '<div class="mini"><button class="act save" data-a="saved" data-s="' + side + '"' + dis + '>Saved</button><button class="act miss" data-a="missed" data-s="' + side + '"' + dis + '>Missed</button></div>' +
        '<div class="mini"><button class="act sm s2" data-a="2min" data-s="' + side + '"' + (G.taken ? " disabled" : "") + '>2 min</button><button class="act sm y" data-a="yellow" data-s="' + side + '"' + (G.taken ? " disabled" : "") + '>Yellow</button></div>' +
        '<div class="mini"><button class="act sm r" data-a="red" data-s="' + side + '"' + (G.taken ? " disabled" : "") + '>Red / blue</button><button class="act sm" data-a="timeout" data-s="' + side + '"' + dis + '>Timeout</button></div>' +
        '<button class="act sm" data-a="gk" data-s="' + side + '"' + (G.taken ? " disabled" : "") + '>Keeper: ' + esc(keeperLabel(side)) + '</button></div>';
    }
    $app.innerHTML = topbar(head) + taken + '<div class="cols">' + col("A") + col("B") + '</div>' +
      (phaseBtn && !G.taken ? '<div class="big-phase"><button class="btn full ' + phaseBtn[2] + '" id="ph">' + phaseBtn[0] + '</button></div>' : '') +
      (ph === "end" ? '<div class="card" style="margin:0 10px 10px"><b>Full time.</b> Check the final score against the score sheet, then export the player stats for the master workbook.<div style="display:flex;gap:8px;margin-top:10px"><button class="btn ghost" id="exp2">Export CSV</button><a class="btn ghost" href="live.html?game=' + encodeURIComponent(G.no) + '" target="_blank">Match center</a></div></div>' : '') +
      '<div class="log" id="log"></div>' +
      '<div style="margin:0 10px 30px;display:flex;gap:8px"><button class="btn ghost" id="back">Game list</button><a class="btn ghost" href="live.html?game=' + encodeURIComponent(G.no) + '" target="_blank">Match center</a></div>';
    Array.prototype.forEach.call(document.querySelectorAll("[data-a]"), function (b) { b.onclick = function () { action(b.getAttribute("data-a"), b.getAttribute("data-s")); }; });
    var p = document.getElementById("ph"); if (p) p.onclick = function () { phaseTap(phaseBtn[1], phaseBtn[0]); };
    var pp = document.getElementById("cpp"); if (pp) pp.onclick = function () { add({ type: "clock", a: clk().running ? "stop" : "start" }); };
    var ca = document.getElementById("cadj"); if (ca) ca.onclick = adjustSheet;
    document.getElementById("back").onclick = function () { G = null; renderPick(); };
    var b2 = document.getElementById("back2"); if (b2) b2.onclick = function () { G = null; renderPick(); };
    var e2 = document.getElementById("exp2"); if (e2) e2.onclick = exportCSV;
    paintSync(); paintLog(); tick();
  }
  function countTO(side) { return L.active(G.events).filter(function (e) { return e.type === "timeout" && e.team === side; }).length; }
  function keeperLabel(side) {
    var k = null; L.active(G.events).forEach(function (e) { if (e.type === "gk" && e.team === side) k = e.n; });
    if (k == null) return "not set";
    var p = sideRoster(side).filter(function (x) { return x.n === k; })[0];
    return "#" + k + (p ? " " + p.name.split(" ").slice(-1)[0] : "");
  }

  function tick() {
    if (!G) return;
    var c = clk(), el = document.getElementById("clk");
    if (el) { el.textContent = L.fmt(c.now); el.className = "clk" + (!c.running && (c.phase === "h1" || c.phase === "h2") ? " stopped" : "") + (c.running && c.now >= c.halfEnd ? " over" : ""); }
    var su = document.getElementById("susp");
    if (su) su.textContent = L.suspensions(G.events, c.now).map(function (s) { return sideName(s.team) + " #" + (s.n == null ? "?" : s.n) + " " + L.fmt(s.left); }).join("   ");
  }
  setInterval(tick, 250);

  function phaseTap(p, label) {
    if (p === "ht" || p === "end") {
      openSheet('<h2>' + esc(label) + '?<button data-close>&times;</button></h2><p class="muted">The clock stops at ' + (p === "ht" ? G.meta.halfLen : G.meta.halfLen * 2) + ':00. Corrections stay possible from the log.</p><button class="btn pri full" id="ok">' + esc(label) + '</button>');
      document.getElementById("ok").onclick = function () { closeSheet(); add({ type: "phase", p: p, t: p === "ht" ? G.meta.halfLen * 60 : G.meta.halfLen * 120 }); };
    } else add({ type: "phase", p: p, t: p === "h1" ? 0 : G.meta.halfLen * 60 });
  }

  function adjustSheet() {
    var c = clk();
    openSheet('<h2>Match the game clock<button data-close>&times;</button></h2><p class="hint">Match the clock to the scoreboard when they drift apart. Events already entered keep their time.</p>' +
      '<div class="zones">' + [-10, -1, 1, 10].map(function (d) { return '<button data-d="' + d + '">' + (d > 0 ? "+" : "") + d + ' s</button>'; }).join("") + '</div>' +
      '<label>Or set the clock (mm:ss)</label><div class="keypad"><input id="setc" inputmode="numeric" placeholder="' + L.fmt(c.now) + '"><button class="btn" id="setok">Set</button></div>');
    Array.prototype.forEach.call($sheet.querySelectorAll("[data-d]"), function (b) { b.onclick = function () { add({ type: "clock", a: "adjust", d: Number(b.getAttribute("data-d")) }); toast("Clock " + L.fmt(clk().now)); }; });
    document.getElementById("setok").onclick = function () {
      var v = document.getElementById("setc").value.replace(/[^0-9:]/g, ""), m = v.split(":"), s;
      if (m.length === 2) s = Number(m[0]) * 60 + Number(m[1]); else if (v.length >= 3) s = Number(v.slice(0, -2)) * 60 + Number(v.slice(-2)); else s = NaN;
      if (!(s >= 0)) { toast("Use mm:ss, for example 12:40."); return; }
      add({ type: "clock", a: "adjust", d: s - Math.round(clk().now) }); closeSheet();
    };
  }

  /* ---------- sheets ---------- */
  function openSheet(html) {
    $sheet.innerHTML = html; $sheet.classList.add("open"); $veil.classList.add("open");
    Array.prototype.forEach.call($sheet.querySelectorAll("[data-close]"), function (b) { b.onclick = closeSheet; });
  }
  function closeSheet() { $sheet.classList.remove("open"); $veil.classList.remove("open"); }
  $veil.onclick = closeSheet;

  function playerGrid(side, opts) {
    opts = opts || {};
    var list = sideRoster(side);
    if (opts.gkFirst) list = list.filter(function (p) { return p.gk; }).concat(list.filter(function (p) { return !p.gk; }));
    var html = list.map(function (p) { return '<button data-n="' + p.n + '" class="' + (p.gk ? "gk" : "") + '"><b>' + p.n + '</b><small>' + esc(p.name.split(" ").slice(-1)[0]) + (p.gk ? " GK" : "") + '</small></button>'; }).join("");
    if (opts.officials) html += ["A", "B", "C", "D"].map(function (o) { return '<button data-n="' + o + '" class="unk"><b>' + o + '</b><small>Official</small></button>'; }).join("");
    html += '<button data-n="" class="unk"><b>?</b><small>Unknown</small></button>';
    return '<div class="players">' + html + '</div><div class="keypad"><input id="othn" inputmode="numeric" maxlength="2" placeholder="Other number"><button class="btn" id="othok">OK</button></div>' +
      (list.length ? '' : '<p class="hint" style="margin-top:8px">No roster on file for this team yet: type the shirt number.</p>');
  }
  function bindGrid(cb) {
    Array.prototype.forEach.call($sheet.querySelectorAll("[data-n]"), function (b) { b.onclick = function () { var v = b.getAttribute("data-n"); cb(v === "" ? null : (/^[A-D]$/.test(v) ? v : Number(v))); }; });
    document.getElementById("othok").onclick = function () { var v = document.getElementById("othn").value.trim(); if (!/^[0-9]{1,2}$/.test(v)) { toast("Type a shirt number from 0 to 99."); return; } cb(Number(v)); };
  }

  var lastZone = null;
  function zl(id) { return id === "EN" ? "E. Net" : id; } // short zone labels on the buttons and in the log
  function action(a, side) {
    var nm = sideName(side);
    if (a === "goal" || a === "saved" || a === "missed") {
      var title = { goal: "Goal", saved: "Shot saved", missed: "Missed shot" }[a];
      var zone = null;
      openSheet('<h2>' + title + ' · ' + esc(nm) + '<button data-close>&times;</button></h2>' +
        '<p class="hint">' + (a === "saved" ? 'Saved: on target and stopped by the goalkeeper. ' : a === "missed" ? 'Missed: off target (wide, over, post) or blocked by a defender. It does not count as a save. ' : '') + 'Tap the zone if you saw it, then the shooter.</p>' +
        '<div class="zones">' + L.ZONES.map(function (z) { return '<button data-z="' + z.id + '">' + zl(z.id) + '</button>'; }).join("") + '</div>' +
        (a === "missed" ? '<div class="mini" style="margin-bottom:12px"><button class="act sm" data-r="missed" style="border-color:var(--navy)">Off target</button><button class="act sm" data-r="blocked">Blocked</button></div>' : '') +
        playerGrid(side));
      var res = a;
      Array.prototype.forEach.call($sheet.querySelectorAll("[data-z]"), function (b) {
        b.onclick = function () { var on = zone === b.getAttribute("data-z"); zone = on ? null : b.getAttribute("data-z"); Array.prototype.forEach.call($sheet.querySelectorAll("[data-z]"), function (x) { x.classList.toggle("on", x.getAttribute("data-z") === zone); }); };
      });
      Array.prototype.forEach.call($sheet.querySelectorAll("[data-r]"), function (b) {
        b.onclick = function () { res = b.getAttribute("data-r"); Array.prototype.forEach.call($sheet.querySelectorAll("[data-r]"), function (x) { x.style.borderColor = x === b ? "var(--navy)" : "#CBD5E1"; }); };
      });
      bindGrid(function (n) {
        closeSheet();
        add({ type: "shot", team: side, n: n, r: res, z: zone || undefined });
        var sc = L.score(G.events);
        toast((res === "goal" ? "Goal " : res === "saved" ? "Saved " : res === "blocked" ? "Blocked " : "Missed ") + (n == null ? "unknown" : "#" + n) + (zone ? " · " + zl(zone) : "") + (res === "goal" ? " · " + sc.A + "-" + sc.B : ""));
      });
    } else if (a === "2min" || a === "yellow" || a === "red") {
      var k = a;
      openSheet('<h2>' + (a === "2min" ? "2 minute suspension" : a === "yellow" ? "Yellow card" : "Red or blue card") + ' · ' + esc(nm) + '<button data-close>&times;</button></h2>' +
        (a === "red" ? '<div class="mini" style="margin-bottom:12px"><button class="act sm r" data-k="red" style="border-width:2px">Red</button><button class="act sm" data-k="blue">Blue (report follows)</button></div>' : '') +
        playerGrid(side, { officials: true }));
      Array.prototype.forEach.call($sheet.querySelectorAll("[data-k]"), function (b) { b.onclick = function () { k = b.getAttribute("data-k"); Array.prototype.forEach.call($sheet.querySelectorAll("[data-k]"), function (x) { x.style.borderWidth = x === b ? "2px" : "1px"; }); }; });
      bindGrid(function (n) { closeSheet(); add({ type: "pun", team: side, n: n, k: k }); toast(L.PUNS[k] + " · " + (n == null ? "unknown" : (/^[A-D]$/.test(n) ? "Official " + n : "#" + n))); });
    } else if (a === "timeout") {
      openSheet('<h2>Team timeout · ' + esc(nm) + '<button data-close>&times;</button></h2><p class="muted">The clock stops. Tap Resume when play restarts.</p><button class="btn pri full" id="ok">Timeout ' + esc(nm) + '</button>');
      document.getElementById("ok").onclick = function () { closeSheet(); add({ type: "timeout", team: side }); };
    } else if (a === "gk") {
      openSheet('<h2>Goalkeeper in goal · ' + esc(nm) + '<button data-close>&times;</button></h2><p class="hint">Set it before throw off and after every change, so saves go to the right keeper.</p>' + playerGrid(side, { gkFirst: true }));
      bindGrid(function (n) { closeSheet(); add({ type: "gk", team: side, n: n }); toast("In goal: " + (n == null ? "unknown" : "#" + n)); });
    }
  }

  /* ---------- log ---------- */
  function describe(e) {
    var who = e.n == null ? "unknown" : (/^[A-D]$/.test(String(e.n)) ? "Official " + e.n : "#" + e.n);
    if (e.type === "shot") return ({ goal: "Goal", saved: "Saved", missed: "Missed", blocked: "Blocked" }[e.r]) + " " + who + (e.z ? " · " + zl(e.z) : "");
    if (e.type === "pun") return L.PUNS[e.k] + " " + who;
    if (e.type === "timeout") return "Timeout";
    if (e.type === "gk") return "In goal " + who;
    if (e.type === "phase") return { h1: "Throw off", ht: "Half time", h2: "Second half starts", end: "Full time" }[e.p];
    if (e.type === "clock") return e.a === "adjust" ? "Clock " + (e.d > 0 ? "+" : "") + e.d + " s" : e.a === "stop" ? "Clock paused" : "Clock resumed";
    return e.type;
  }
  function paintLog() {
    var el = document.getElementById("log"); if (!el || !G) return;
    var pend = {}; G.pending.forEach(function (e) { pend[e.id] = 1; });
    var list = L.active(G.events).slice().reverse();
    el.innerHTML = '<h3><span>Log · ' + list.length + ' entries</span><button class="btn ghost" id="exp" style="padding:6px 10px;font-size:12px">Export CSV</button></h3>' +
      list.slice(0, 40).map(function (e) {
        var side = e.team ? '<span class="sw" style="background:' + colorOf(e.team) + ';border-color:#9AA8B6;display:inline-block;vertical-align:-1px"></span> <b>' + esc(sideName(e.team)) + '</b> ' : '';
        return '<div class="ev' + (pend[e.id] ? " pend" : "") + (e.type === "clock" ? " clk-ev" : "") + '"><span class="t">' + L.fmt(e.t) + '</span><span>' + side + esc(describe(e)) + '</span>' +
          (G.taken ? '' : '<button class="x" data-del="' + e.id + '">Delete</button>') + '</div>';
      }).join("") + (list.length > 40 ? '<div class="ev muted">Older entries are on the match center.</div>' : '');
    Array.prototype.forEach.call(el.querySelectorAll("[data-del]"), function (b) {
      b.onclick = function () {
        var id = b.getAttribute("data-del"), e = G.events.filter(function (x) { return x.id === id; })[0];
        openSheet('<h2>Delete this entry?<button data-close>&times;</button></h2><p>' + L.fmt(e.t) + ' · ' + (e.team ? esc(sideName(e.team)) + ' · ' : '') + esc(describe(e)) + '</p><p class="muted">To correct it, delete it and enter it again. The deletion stays in the log.</p><button class="btn red full" id="ok">Delete</button>');
        document.getElementById("ok").onclick = function () { closeSheet(); add({ type: "void", ref: id, t: e.t }); toast("Deleted"); };
      };
    });
    var ex = document.getElementById("exp"); if (ex) ex.onclick = exportCSV;
  }

  function exportCSV() {
    var st = L.stats(G.meta, G.events, rosterPair());
    var rows = [["Game", "Team", "No", "Player", "Goals", "Shots", "7m goals", "7m shots", "Yellow", "2 min", "Red", "Blue"]];
    ["A", "B"].forEach(function (s) {
      var pun = {}; st.puns.forEach(function (p) { if (p.e.team !== s) return; var k = String(p.e.n); pun[k] = pun[k] || { yellow: 0, "2min": 0, red: 0, blue: 0 }; pun[k][p.e.k]++; });
      var nos = {}; Object.keys(st.players[s]).forEach(function (k) { nos[k] = 1; }); Object.keys(pun).forEach(function (k) { nos[k === "null" ? "?" : k] = 1; });
      Object.keys(nos).forEach(function (k) {
        var p = st.players[s][k] || { n: k === "?" ? null : k, name: k === "?" ? "Unknown player" : (/^[A-D]$/.test(k) ? "Official " + k : "#" + k), g: 0, a: 0, m7g: 0, m7: 0 };
        var u = pun[k === "?" ? "null" : k] || { yellow: 0, "2min": 0, red: 0, blue: 0 };
        var named = sideRoster(s).filter(function (r) { return String(r.n) === k; })[0];
        rows.push([G.no, sideName(s), k === "?" ? "" : k, named ? named.name : p.name, p.g, p.a, p.m7g, p.m7, u.yellow, u["2min"], u.red, u.blue]);
      });
    });
    rows.push([]); rows.push(["Final score", sideName("A") + " " + st.score.A, sideName("B") + " " + st.score.B]);
    var csv = rows.map(function (r) { return r.map(function (v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(","); }).join("\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "CalCup_2027_Game_" + G.no + "_stats.csv"; document.body.appendChild(a); a.click(); a.remove();
  }

  /* keep the screen on while scoring */
  var lock = null;
  function keepAwake() { try { if (navigator.wakeLock && !lock) navigator.wakeLock.request("screen").then(function (l) { lock = l; l.addEventListener("release", function () { lock = null; }); }).catch(function () {}); } catch (e) {} }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && G) { keepAwake(); sync(); } });

  if (S && S.token) renderPick(); else renderLogin();
})();
