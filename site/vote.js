/* CalCup 2027 MVP / MVG voting: voter page (vote.html) and admin page (vote-admin.html).
   Server: /.netlify/functions/vote (see netlify/functions/vote.mjs). Nothing is stored in
   this file; ballots, notes and the voter list live in Netlify Blobs. */
(function () {
  var API = "/.netlify/functions/vote";
  var TOK_KEY = "calcup_vote_token", ADM_KEY = "calcup_vote_admin";
  var D = window.CALCUP || {};
  var PUB = D.voting || {};
  var root = document.getElementById("vote-app");
  if (!root) return;
  var ADMIN = root.getAttribute("data-mode") === "admin";

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet(k, ss) { try { return (ss ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } }
  function lsSet(k, v, ss) { try { if (v == null) (ss ? sessionStorage : localStorage).removeItem(k); else (ss ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }
  function api(op, opts) {
    opts = opts || {};
    var h = { "Content-Type": "application/json" };
    var t = lsGet(TOK_KEY); if (t && !opts.noAuth) h.Authorization = "Bearer " + t;
    if (opts.admin) h["x-admin-token"] = opts.admin;
    return fetch(API + "?op=" + op, { method: opts.method || "GET", headers: h, body: opts.body ? JSON.stringify(opts.body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); })
      .catch(function () { return { _status: 0, error: "network", message: "No connection. Check your network and try again." }; });
  }
  function fmtWhen(iso) {
    if (!iso) return "to be confirmed";
    var d = new Date(iso); if (isNaN(d)) return "to be confirmed";
    return d.toLocaleString("en-US", { timeZone: "America/Los_Angeles", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }) + " PT";
  }
  function countdown(iso) {
    var ms = Date.parse(iso) - Date.now(); if (!isFinite(ms)) return "";
    if (ms <= 0) return "Voting is closed";
    var m = Math.floor(ms / 60000), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60;
    return (d ? d + " d " : "") + (d || h ? h + " h " : "") + mm + " min left";
  }
  function tickCountdowns() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-countdown]"), function (el) { el.textContent = countdown(el.getAttribute("data-countdown")); });
  }
  setInterval(tickCountdowns, 30000);

  var S = { me: null, role: null, step: 0, saving: false, notesTimer: null, starTeam: "" };
  function teamName(id) { var t = (S.me ? S.me.teams : []).filter(function (x) { return x.id === id; })[0]; return t ? t.name : id; }
  function playerById(id) { return S.byId[id]; }
  function playerLabel(p) { return (p.n != null && p.n !== "" ? "#" + p.n + " " : "") + p.name; }
  function catById(id) { return S.me.cats.filter(function (c) { return c.id === id; })[0]; }
  function ballotOf(roleId) { return (S.me.ballots[roleId] || { cats: {} }); }
  function doneCats(roleId) { var b = ballotOf(roleId); return S.me.cats.filter(function (c) { return b.cats && b.cats[c.id] && b.cats[c.id].picks && b.cats[c.id].picks.length; }); }

  /* ---------- static landing content ---------- */
  function rulesHTML(deadline) {
    return '' +
      '<div class="vt-grid">' +
      '<div class="card vt-card"><h3><i class="ti ti-trophy"></i> What you vote for</h3>' +
      '<ul class="vt-list"><li><b>MVP Men</b> and <b>MVP Women</b>, Steve Goss Award. Field players only.</li>' +
      '<li><b>MVG Men</b> and <b>MVG Women</b>, Mark Ragatz Award. Goalkeepers only.</li>' +
      '<li>The <b>Top Scorer</b> award (Joe McVein Award) needs no vote. It comes from the game sheets, see <a href="scorers.html">Top scorers</a>.</li></ul></div>' +
      '<div class="card vt-card"><h3><i class="ti ti-users"></i> Who votes</h3>' +
      '<ul class="vt-list"><li>The head coach of each team, one ballot per team. A coach of two teams gets two ballots.</li>' +
      '<li>Every referee, individually, one ballot each.</li>' +
      '<li>Sign in with the email address your team or the referee coordinator gave the organizers.</li></ul></div>' +
      '<div class="card vt-card vt-deadline"><h3><i class="ti ti-clock"></i> Deadline</h3>' +
      '<p class="vt-when">' + esc(fmtWhen(deadline)) + '</p>' +
      '<p class="muted">Voting closes when the first final takes the court. You can change your votes as often as you like until then.</p>' +
      (deadline ? '<p class="vt-cd" data-countdown="' + esc(deadline) + '">' + esc(countdown(deadline)) + '</p>' : '') + '</div>' +
      '</div>' +
      '<div class="vt-grid vt-grid-2">' +
      '<div class="card vt-card"><h3><i class="ti ti-clipboard-text"></i> How the winners are decided</h3>' +
      '<p>For each award you pick a 1st, 2nd and 3rd choice. A 1st choice is worth 3 points, a 2nd choice 2 points and a 3rd choice 1 point. Points from all voters are added up and the player with the most points wins.</p>' +
      '<p>If two players are level on points, the one with more 1st choice votes wins, then the one with more 2nd choice votes.</p></div>' +
      '<div class="card vt-card"><h3><i class="ti ti-file-text"></i> Rules</h3>' +
      '<ul class="vt-list"><li>You cannot vote for players of a team you coach. If you coach two teams, players of both teams are excluded from both of your ballots.</li>' +
      '<li>You can vote for players of your club\'s other team. The coach of a men\'s team can vote for players of the same club\'s women\'s team, and the reverse.</li>' +
      '<li>Ballots are private. Only the organizing committee sees them. Winners are announced at the awards ceremony.</li></ul></div>' +
      '</div>' +
      '<div class="card vt-card vt-how"><h3><i class="ti ti-flag"></i> How it works</h3>' +
      '<ol class="vt-steps"><li><b>Sign in</b> with your email. We send you a 6 digit code.</li>' +
      '<li><b>Take notes during the tournament.</b> Your notes are private. Star the players who stand out.</li>' +
      '<li><b>Vote in four short steps</b>, one per award. Each list only shows the players you can vote for, and your starred players come first.</li>' +
      '<li><b>Change your votes</b> until the deadline if you see something in the last games.</li></ol></div>';
  }

  /* ---------- sign in ---------- */
  function renderSignIn(msg) {
    root.innerHTML = rulesHTML(PUB.deadline) +
      '<div class="card vt-card vt-signin" id="signin"><h3><i class="ti ti-mail"></i> Sign in to vote</h3>' +
      '<form id="f-email" class="vt-form"><label for="vt-email">Email address</label>' +
      '<div class="vt-row"><input id="vt-email" type="email" autocomplete="email" required placeholder="name@example.com">' +
      '<button class="btn btn-pri" type="submit">Send my code</button></div></form>' +
      '<form id="f-code" class="vt-form" hidden><label for="vt-code">6 digit code sent to <b id="vt-sentto"></b></label>' +
      '<div class="vt-row"><input id="vt-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}" required placeholder="123456">' +
      '<button class="btn btn-pri" type="submit">Sign in</button></div>' +
      '<p class="muted vt-small">No email after a minute? Check your spam folder, or <a href="#" id="vt-resend">send a new code</a>.</p></form>' +
      '<p class="vt-msg" id="vt-msg">' + esc(msg || "") + '</p></div>';
    var email = "";
    function say(t, bad) { var m = document.getElementById("vt-msg"); m.textContent = t || ""; m.className = "vt-msg" + (bad ? " bad" : ""); }
    function ask() {
      say("Sending...");
      api("code", { method: "POST", body: { email: email }, noAuth: true }).then(function (r) {
        if (r.ok) {
          document.getElementById("f-code").hidden = false; document.getElementById("vt-sentto").textContent = email;
          say(r.devCode ? "Test mode, code: " + r.devCode : "Code sent. It expires in 10 minutes."); document.getElementById("vt-code").focus();
        } else say(r.message || "The code could not be sent.", true);
      });
    }
    document.getElementById("f-email").addEventListener("submit", function (e) { e.preventDefault(); email = document.getElementById("vt-email").value.trim().toLowerCase(); if (email) ask(); });
    document.getElementById("vt-resend").addEventListener("click", function (e) { e.preventDefault(); if (email) ask(); });
    document.getElementById("f-code").addEventListener("submit", function (e) {
      e.preventDefault(); say("Checking...");
      api("verify", { method: "POST", body: { email: email, code: document.getElementById("vt-code").value }, noAuth: true }).then(function (r) {
        if (r.token) { lsSet(TOK_KEY, r.token); load(); } else say(r.message || "Sign in failed.", true);
      });
    });
  }

  /* ---------- signed in ---------- */
  function load() {
    root.innerHTML = '<p class="muted">Loading your page...</p>';
    api("me").then(function (r) {
      if (r._status === 401 || r.error === "signed_out") { lsSet(TOK_KEY, null); return renderSignIn(); }
      if (!r.person) { lsSet(TOK_KEY, null); return renderSignIn(r.message || "Sign in failed."); }
      S.me = r; S.byId = {}; r.players.forEach(function (p) { S.byId[p.id] = p; });
      S.stars = (r.notes && r.notes.stars) || [];
      renderHome();
    });
  }

  function headerHTML() {
    var me = S.me;
    return '<div class="vt-bar"><div><b>' + esc(me.person.name) + '</b> <span class="muted">' + esc(me.person.email) + '</span></div>' +
      '<button class="vt-link" id="vt-out">Sign out</button></div>' +
      (me.closed ? '<div class="vt-banner closed"><i class="ti ti-alert-triangle"></i> Voting is closed. Thank you for voting. Winners are announced at the awards ceremony.</div>'
        : '<div class="vt-banner"><i class="ti ti-clock"></i> Voting closes ' + esc(fmtWhen(me.deadline)) + ' <span class="vt-cd" data-countdown="' + esc(me.deadline || "") + '">' + esc(me.deadline ? countdown(me.deadline) : "") + '</span></div>');
  }
  function bindHeader() {
    document.getElementById("vt-out").addEventListener("click", function () { api("logout", { method: "POST" }).then(function () { lsSet(TOK_KEY, null); renderSignIn("You are signed out."); }); });
  }

  function renderHome() {
    var me = S.me;
    var ex = me.person.exclude.map(teamName);
    var cards = me.person.roles.map(function (r) {
      var done = doneCats(r.id).length, total = me.cats.length;
      var state = done === total ? '<span class="pill vt-ok">Complete</span>' : done ? '<span class="pill vt-part">' + done + ' of ' + total + ' done</span>' : '<span class="pill up">Not started</span>';
      return '<div class="card vt-ballot"><div><div class="vt-blabel">' + esc(r.type === "ref" ? "Referee ballot" : r.voterTeam + " ballot") + '</div>' +
        '<div class="muted vt-small">' + esc(r.label) + '</div></div>' + state +
        (me.closed ? '' : '<button class="btn btn-pri" data-vote="' + esc(r.id) + '">' + (done ? 'Review or change' : 'Vote') + '</button>') + '</div>';
    }).join("");
    root.innerHTML = headerHTML() +
      '<section><div class="sec-head"><h2>' + (me.person.roles.length > 1 ? 'Your ballots' : 'Your ballot') + '</h2></div>' + cards +
      (ex.length ? '<p class="muted vt-small">Players of ' + esc(ex.join(" and ")) + ' do not appear on your ballot' + (me.person.roles.length > 1 ? 's' : '') + ' because you coach ' + (ex.length > 1 ? 'these teams' : 'this team') + '.</p>' : '') +
      '</section>' +
      '<section><div class="sec-head"><h2>My notes</h2><span class="note" id="vt-saved"></span></div>' +
      '<p class="muted vt-small">Private to you. Saved automatically as you type.</p>' +
      '<textarea id="vt-notes" class="vt-notes" placeholder="Game 7: #9 on Massif ran the fast break all night...">' + esc((me.notes && me.notes.text) || "") + '</textarea>' +
      '<div class="sec-head" style="margin-top:18px"><h2>Starred players</h2></div>' +
      '<p class="muted vt-small">Starred players appear first in your voting lists.</p>' +
      '<div id="vt-starred"></div>' +
      '<div class="vt-row vt-starpick"><label for="vt-starteam">Browse a team</label><select id="vt-starteam"><option value="">Choose a team</option>' +
      me.teams.filter(function (t) { return me.players.some(function (p) { return p.team === t.id; }); }).sort(function (a, b) { return a.div === b.div ? a.name.localeCompare(b.name) : (a.div === "M" ? -1 : 1); })
        .map(function (t) { return '<option value="' + esc(t.id) + '"' + (S.starTeam === t.id ? ' selected' : '') + '>' + esc(t.name) + '</option>'; }).join("") +
      '</select></div><div id="vt-teamlist"></div></section>' +
      '<details class="vt-rules"><summary>Rules and scoring</summary>' + rulesHTML(me.deadline) + '</details>';
    bindHeader();
    Array.prototype.forEach.call(root.querySelectorAll("[data-vote]"), function (b) { b.addEventListener("click", function () { S.role = b.getAttribute("data-vote"); S.step = 0; renderWizard(); window.scrollTo(0, 0); }); });
    var ta = document.getElementById("vt-notes");
    ta.addEventListener("input", function () { setSaved("Saving..."); clearTimeout(S.notesTimer); S.notesTimer = setTimeout(saveNotes, 1200); });
    document.getElementById("vt-starteam").addEventListener("change", function (e) { S.starTeam = e.target.value; renderTeamList(); });
    renderStarred(); renderTeamList();
  }
  function setSaved(t) { var el = document.getElementById("vt-saved"); if (el) el.textContent = t; }
  function saveNotes() {
    var ta = document.getElementById("vt-notes");
    var text = ta ? ta.value : ((S.me.notes && S.me.notes.text) || "");
    S.me.notes = { text: text, stars: S.stars };
    api("notes", { method: "PUT", body: { text: text, stars: S.stars } }).then(function (r) { setSaved(r.ok ? "Saved" : "Not saved, check your connection"); });
  }
  function toggleStar(id) {
    var i = S.stars.indexOf(id); if (i >= 0) S.stars.splice(i, 1); else S.stars.push(id);
    renderStarred(); renderTeamList(); setSaved("Saving..."); saveNotes();
  }
  function starBtn(p) {
    var on = S.stars.indexOf(p.id) >= 0;
    return '<button class="vt-star' + (on ? ' on' : '') + '" data-star="' + esc(p.id) + '" aria-pressed="' + on + '" title="' + (on ? 'Remove star' : 'Star this player') + '">' + (on ? '&#9733;' : '&#9734;') + '</button>';
  }
  function bindStars(scope) { Array.prototype.forEach.call(scope.querySelectorAll("[data-star]"), function (b) { b.addEventListener("click", function () { toggleStar(b.getAttribute("data-star")); }); }); }
  function renderStarred() {
    var el = document.getElementById("vt-starred"); if (!el) return;
    var list = S.stars.map(playerById).filter(Boolean);
    el.innerHTML = list.length ? '<ul class="vt-plist">' + list.map(function (p) {
      return '<li>' + starBtn(p) + '<span>' + esc(playerLabel(p)) + '</span><span class="muted vt-small">' + esc(teamName(p.team)) + (p.gk ? ' &middot; GK' : '') + '</span></li>';
    }).join("") + '</ul>' : '<p class="muted vt-small">No starred players yet.</p>';
    bindStars(el);
  }
  function renderTeamList() {
    var el = document.getElementById("vt-teamlist"); if (!el) return;
    if (!S.starTeam) { el.innerHTML = ""; return; }
    var list = S.me.players.filter(function (p) { return p.team === S.starTeam; }).sort(function (a, b) { return (Number(a.n) || 999) - (Number(b.n) || 999); });
    el.innerHTML = '<ul class="vt-plist">' + list.map(function (p) {
      return '<li>' + starBtn(p) + '<span>' + esc(playerLabel(p)) + '</span><span class="muted vt-small">' + (p.gk ? 'GK' : '') + '</span></li>';
    }).join("") + '</ul>';
    bindStars(el);
  }

  /* ---------- voting wizard ---------- */
  function renderWizard() {
    var me = S.me, role = me.person.roles.filter(function (r) { return r.id === S.role; })[0];
    var cats = me.cats, step = S.step;
    var steps = cats.map(function (c, i) {
      var done = doneCats(role.id).some(function (d) { return d.id === c.id; });
      return '<li class="' + (i === step ? 'on' : '') + (done ? ' done' : '') + '"><span>' + (done ? '&#10003;' : (i + 1)) + '</span>' + esc(c.label) + '</li>';
    }).join("") + '<li class="' + (step === cats.length ? 'on' : '') + '"><span>&#10003;</span>Review</li>';
    var head = headerHTML() + '<div class="vt-whead"><button class="vt-link" id="vt-back-home"><i class="ti ti-arrow-left"></i> My page</button>' +
      '<h2>' + esc(role.type === "ref" ? "Referee ballot" : role.voterTeam + " ballot") + '</h2></div><ol class="vt-stepper">' + steps + '</ol>';
    var body;
    if (step < cats.length) {
      var c = cats[step];
      var pool = me.pool[c.id].map(playerById).filter(Boolean);
      var need = Math.min(3, pool.length);
      var cur = ((ballotOf(role.id).cats || {})[c.id] || {}).picks || [];
      var exNames = me.person.exclude.filter(function (id) { var t = me.teams.filter(function (x) { return x.id === id; })[0]; return !t || t.div === c.div; }).map(teamName);
      var stars = pool.filter(function (p) { return S.stars.indexOf(p.id) >= 0; });
      var byTeam = {}; pool.forEach(function (p) { (byTeam[p.team] = byTeam[p.team] || []).push(p); });
      function opts(sel) {
        var o = '<option value="">Choose a player</option>';
        if (stars.length) o += '<optgroup label="Starred">' + stars.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === sel ? ' selected' : '') + '>' + esc(playerLabel(p) + ", " + teamName(p.team)) + '</option>'; }).join("") + '</optgroup>';
        Object.keys(byTeam).sort(function (a, b) { return teamName(a).localeCompare(teamName(b)); }).forEach(function (t) {
          o += '<optgroup label="' + esc(teamName(t)) + '">' + byTeam[t].sort(function (a, b) { return (Number(a.n) || 999) - (Number(b.n) || 999); })
            .map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === sel && stars.indexOf(p) < 0 ? ' selected' : '') + '>' + esc(playerLabel(p)) + '</option>'; }).join("") + '</optgroup>';
        });
        return o;
      }
      var places = ["1st choice, 3 points", "2nd choice, 2 points", "3rd choice, 1 point"];
      body = '<div class="card vt-card vt-step"><p class="kicker-dark">Step ' + (step + 1) + ' of ' + cats.length + '</p>' +
        '<h3>' + esc(c.label) + ' <span class="muted vt-small">' + esc(c.award) + '</span></h3>' +
        '<p class="muted">' + (c.gk ? 'Goalkeepers' : 'Field players') + ' from the ' + (c.div === "M" ? "men's" : "women's") + ' teams.' +
        (exNames.length ? ' Players of ' + esc(exNames.join(" and ")) + ' are not listed because you coach ' + (exNames.length > 1 ? 'these teams' : 'this team') + '.' : '') + '</p>' +
        (pool.length ? '' : '<p class="vt-msg bad">No eligible players are listed yet for this award. The rosters may not be complete; contact calcup@calheat.com.</p>') +
        '<div class="vt-picks">' + [0, 1, 2].slice(0, need).map(function (i) {
          return '<label class="vt-pick"><span>' + places[i] + '</span><select data-pick="' + i + '">' + opts(cur[i]) + '</select></label>';
        }).join("") + '</div>' +
        '<p class="vt-msg" id="vt-msg"></p>' +
        '<div class="vt-nav">' + (step > 0 ? '<button class="btn vt-btn2" id="vt-prev"><i class="ti ti-arrow-left"></i> Back</button>' : '<span></span>') +
        '<button class="btn btn-pri" id="vt-next">Save and continue &rarr;</button></div></div>' +
        notesPeek();
    } else {
      body = '<div class="card vt-card vt-step"><h3>Review your ballot</h3>' + cats.map(function (c, i) {
        var pk = ((ballotOf(role.id).cats || {})[c.id] || {}).picks || [];
        return '<div class="vt-rev"><div class="vt-rev-h"><b>' + esc(c.label) + '</b><button class="vt-link" data-goto="' + i + '">Change</button></div>' +
          (pk.length ? '<ol>' + pk.map(function (id) { var p = playerById(id); return '<li>' + esc(p ? playerLabel(p) + ", " + teamName(p.team) : id) + '</li>'; }).join("") + '</ol>' : '<p class="vt-msg bad">Not voted yet</p>') + '</div>';
      }).join("") +
        (doneCats(role.id).length === cats.length ? '<p class="vt-msg ok">&#10003; Your ballot is complete. You can change it until ' + esc(fmtWhen(me.deadline)) + '.</p>' : '<p class="vt-msg bad">Your ballot is not complete yet.</p>') +
        '<div class="vt-nav"><button class="btn vt-btn2" id="vt-prev"><i class="ti ti-arrow-left"></i> Back</button><button class="btn btn-pri" id="vt-done">Back to my page</button></div></div>';
    }
    root.innerHTML = head + body;
    bindHeader();
    document.getElementById("vt-back-home").addEventListener("click", function () { renderHome(); window.scrollTo(0, 0); });
    var prev = document.getElementById("vt-prev"); if (prev) prev.addEventListener("click", function () { S.step--; renderWizard(); });
    var doneB = document.getElementById("vt-done"); if (doneB) doneB.addEventListener("click", function () { renderHome(); window.scrollTo(0, 0); });
    Array.prototype.forEach.call(root.querySelectorAll("[data-goto]"), function (b) { b.addEventListener("click", function () { S.step = +b.getAttribute("data-goto"); renderWizard(); }); });
    var sels = root.querySelectorAll("[data-pick]");
    function syncDisabled() {
      var chosen = Array.prototype.map.call(sels, function (s) { return s.value; });
      Array.prototype.forEach.call(sels, function (s, i) {
        Array.prototype.forEach.call(s.options, function (o) { o.disabled = !!o.value && chosen.indexOf(o.value) >= 0 && chosen.indexOf(o.value) !== i && s.value !== o.value; });
      });
    }
    Array.prototype.forEach.call(sels, function (s) { s.addEventListener("change", syncDisabled); });
    syncDisabled();
    var next = document.getElementById("vt-next");
    if (next) next.addEventListener("click", function () {
      var c = cats[step];
      var picks = Array.prototype.map.call(sels, function (s) { return s.value; });
      var m = document.getElementById("vt-msg");
      if (picks.some(function (x) { return !x; })) { m.textContent = "Choose a player for each place."; m.className = "vt-msg bad"; return; }
      next.disabled = true; m.textContent = "Saving..."; m.className = "vt-msg";
      api("ballot", { method: "PUT", body: { role: role.id, cat: c.id, picks: picks } }).then(function (r) {
        next.disabled = false;
        if (r.ok) { S.me.ballots[role.id] = r.ballot; S.step++; renderWizard(); window.scrollTo(0, 0); }
        else { m.textContent = r.message || "Not saved. Try again."; m.className = "vt-msg bad"; if (r.error === "closed") { S.me.closed = true; } }
      });
    });
  }
  function notesPeek() {
    var t = (S.me.notes && S.me.notes.text) || "";
    if (!t) return "";
    return '<details class="vt-peek"><summary>My notes</summary><pre>' + esc(t) + '</pre></details>';
  }

  /* ---------- admin ---------- */
  function renderAdminLogin(msg) {
    root.innerHTML = '<div class="card vt-card vt-signin"><h3><i class="ti ti-alert-triangle"></i> Organizer access</h3>' +
      '<form id="f-adm" class="vt-form"><label for="vt-adm">Admin token</label><div class="vt-row"><input id="vt-adm" type="password" autocomplete="off" required>' +
      '<button class="btn btn-pri" type="submit">Open</button></div></form><p class="vt-msg bad">' + esc(msg || "") + '</p></div>';
    document.getElementById("f-adm").addEventListener("submit", function (e) { e.preventDefault(); lsSet(ADM_KEY, document.getElementById("vt-adm").value, true); loadAdmin(); });
  }
  function loadAdmin() {
    var tok = lsGet(ADM_KEY, true); if (!tok) return renderAdminLogin();
    root.innerHTML = '<p class="muted">Loading...</p>';
    api("admin", { admin: tok, noAuth: true }).then(function (r) {
      if (r._status === 401) { lsSet(ADM_KEY, null, true); return renderAdminLogin("Wrong token."); }
      if (!r.ready) { root.innerHTML = '<div class="card vt-card"><p>No voter list yet. It arrives with the next run of the GitHub Action once VOTE_SYNC_URL and VOTE_SYNC_TOKEN are set.</p></div>'; return; }
      renderAdmin(r);
    });
  }
  function renderAdmin(r) {
    var byId = {}; r.players.forEach(function (p) { byId[p.id] = p; });
    var tName = {}; r.teams.forEach(function (t) { tName[t.id] = t.name; });
    var roles = []; r.voters.forEach(function (v) { v.roles.forEach(function (x) { roles.push({ v: v, r: x }); }); });
    var complete = roles.filter(function (x) { return x.r.done.length === r.cats.length; }).length;
    var started = roles.filter(function (x) { return x.r.done.length; }).length;
    function sheetName(p) { return p ? (tName[p.team] || p.team) + " - #" + (p.n == null ? "" : p.n) + " - " + p.name : ""; }
    var rows = roles.map(function (x) {
      return '<tr><td>' + esc(x.v.name) + (x.v.email ? '' : ' <span class="pill vt-bad">no email</span>') + '</td><td>' + esc(x.r.voterTeam) + '</td><td>' +
        r.cats.map(function (c) { return '<span class="vt-dot' + (x.r.done.indexOf(c.id) >= 0 ? ' on' : '') + '" title="' + esc(c.label) + '"></span>'; }).join("") +
        '</td><td class="muted vt-small">' + (x.r.updated ? esc(new Date(x.r.updated).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })) : '') + '</td></tr>';
    }).join("");
    var tallies = r.cats.map(function (c) {
      var t = r.tally[c.id] || [];
      var body = t.slice(0, 10).map(function (x, i) {
        var tie = (t[i - 1] && t[i - 1].pts === x.pts && t[i - 1].v[0] === x.v[0] && t[i - 1].v[1] === x.v[1]) || (t[i + 1] && t[i + 1].pts === x.pts && t[i + 1].v[0] === x.v[0] && t[i + 1].v[1] === x.v[1]);
        return '<tr' + (i === 0 ? ' class="vt-lead"' : '') + '><td>' + (i + 1) + '</td><td>' + esc((x.n != null ? "#" + x.n + " " : "") + x.name) + (tie ? ' <span class="pill vt-bad">tie</span>' : '') + '</td><td>' + esc(tName[x.team] || x.team) + '</td><td>' + x.v[0] + '</td><td>' + x.v[1] + '</td><td>' + x.v[2] + '</td><td><b>' + x.pts + '</b></td></tr>';
      }).join("");
      return '<div class="card vt-card"><div class="vt-rev-h"><h3>' + esc(c.label) + '</h3><button class="btn vt-btn2 vt-small" data-copy="' + c.id + '"><i class="ti ti-clipboard-text"></i> Copy for MVP Voting tab</button></div>' +
        (t.length ? '<div class="vt-tablewrap"><table class="vt-table"><thead><tr><th>#</th><th>Player</th><th>Team</th><th>1st</th><th>2nd</th><th>3rd</th><th>Pts</th></tr></thead><tbody>' + body + '</tbody></table></div>' : '<p class="muted">No votes yet.</p>') + '</div>';
    }).join("");
    root.innerHTML =
      '<div class="vt-grid">' +
      '<div class="card vt-card"><h3>Deadline</h3><p class="vt-when">' + esc(fmtWhen(r.deadline)) + '</p>' + (r.deadline ? '<p class="vt-cd" data-countdown="' + esc(r.deadline) + '">' + esc(countdown(r.deadline)) + '</p>' : '') + '</div>' +
      '<div class="card vt-card"><h3>Ballots</h3><p class="vt-when">' + complete + ' of ' + roles.length + ' complete</p><p class="muted">' + (started - complete) + ' in progress, ' + (roles.length - started) + ' not started</p></div>' +
      '<div class="card vt-card"><h3>Voter list</h3><p class="muted">Synced from the workbook ' + esc(r.syncedAt ? new Date(r.syncedAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }) : "never") + '.</p>' +
      (r.missingEmail.length ? '<p class="vt-msg bad">No email, cannot sign in: ' + esc(r.missingEmail.join(", ")) + '</p>' : '') + '</div></div>' +
      '<section><div class="sec-head"><h2>Results</h2><span class="note">Confidential until the ceremony</span></div><div class="vt-grid vt-grid-2">' + tallies + '</div>' +
      '<p class="muted vt-small">Copy pastes 21 rows into columns C to E of the MVP Voting tab: at C6 for MVP Men, C30 for MVP Women, C54 for MVG Men, C78 for MVG Women. Rows follow the Voters Master order, so the workbook rankings and the Control Panel update on their own.</p>' +
      '<p class="vt-msg" id="vt-copymsg"></p></section>' +
      '<section><div class="sec-head"><h2>Voters</h2><button class="btn vt-btn2 vt-small" id="vt-csv"><i class="ti ti-download"></i> All ballots CSV</button></div><div class="vt-tablewrap"><table class="vt-table"><thead><tr><th>Voter</th><th>Ballot</th><th>MVP M, MVP W, MVG M, MVG W</th><th>Last change</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
    function rowsFor(cat) {
      var order = r.sheetOrder && r.sheetOrder.length ? r.sheetOrder : roles.map(function (x) { return { role: x.r.id }; });
      var lines = order.map(function (o) {
        var b = o.role && r.ballots[o.role]; var pk = (b && b.cats && b.cats[cat] && b.cats[cat].picks) || [];
        return [0, 1, 2].map(function (i) { return sheetName(byId[pk[i]]); }).join("\t");
      });
      var listed = {}; order.forEach(function (o) { if (o.role) listed[o.role] = 1; });
      var extra = roles.filter(function (x) { return !listed[x.r.id] && r.ballots[x.r.id]; }).map(function (x) { return x.v.name + " (" + x.r.voterTeam + ")"; });
      return { text: lines.join("\n"), extra: extra };
    }
    Array.prototype.forEach.call(root.querySelectorAll("[data-copy]"), function (b) {
      b.addEventListener("click", function () {
        var out = rowsFor(b.getAttribute("data-copy"));
        var m = document.getElementById("vt-copymsg");
        var done = function () { m.textContent = "Copied." + (out.extra.length ? " Not in the Voters Master tab, add by hand: " + out.extra.join(", ") : ""); m.className = "vt-msg" + (out.extra.length ? " bad" : " ok"); };
        if (navigator.clipboard) navigator.clipboard.writeText(out.text).then(done, function () { window.prompt("Copy these rows", out.text); });
        else window.prompt("Copy these rows", out.text);
      });
    });
    document.getElementById("vt-csv").addEventListener("click", function () {
      var q = function (s) { return '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"'; };
      var lines = [["Voter", "Email", "Ballot", "Award", "1st", "2nd", "3rd", "Saved"].map(q).join(",")];
      roles.forEach(function (x) {
        var b = r.ballots[x.r.id] || { cats: {} };
        r.cats.forEach(function (c) { var e = (b.cats || {})[c.id] || {}; var pk = e.picks || [];
          lines.push([x.v.name, x.v.email, x.r.voterTeam, c.label, sheetName(byId[pk[0]]), sheetName(byId[pk[1]]), sheetName(byId[pk[2]]), e.ts || ""].map(q).join(",")); });
      });
      var blob = new Blob([lines.join("\r\n")], { type: "text/csv" });
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "CalCup_2027_MVP_MVG_ballots.csv"; document.body.appendChild(a); a.click(); a.remove();
    });
  }

  /* ---------- start ---------- */
  if (ADMIN) loadAdmin();
  else if (lsGet(TOK_KEY)) load();
  else renderSignIn();
})();
