/* MVP and MVG voting: ballot page (#vote-ballot) and organizer page (#vote-admin).
   All checks and scoring run on the server (netlify/functions/vote.mjs). */
(function () {
  var API = "/.netlify/functions/vote";
  var css =
    ".vt{max-width:820px;margin:0 auto;padding:22px 0 40px;font-size:15px;line-height:1.5}" +
    ".vt h2{font-size:20px;margin:26px 0 8px}.vt h3{font-size:16px;margin:0 0 2px}" +
    ".vt .vt-card{background:#fff;border:1px solid #dfe5ec;border-radius:12px;padding:16px;margin:12px 0}" +
    ".vt .vt-muted{color:#5b6b7c;font-size:13px}.vt .vt-row{display:flex;gap:10px;align-items:center;margin:8px 0;flex-wrap:wrap}" +
    ".vt .vt-rk{display:inline-block;min-width:92px;font-weight:700;color:var(--vt-pri,#102A43)}" +
    ".vt select,.vt input[type=text],.vt input[type=password],.vt input[type=datetime-local]{flex:1;min-width:0;font:inherit;padding:9px 10px;border:1px solid #c5cfda;border-radius:8px;background:#fff;max-width:100%}" +
    ".vt button{font:inherit;font-weight:600;padding:10px 18px;border-radius:8px;border:1px solid transparent;cursor:pointer;background:var(--vt-acc,#F47920);color:#2b1400}" +
    ".vt button.vt-sec{background:#fff;border-color:#c5cfda;color:#102A43}.vt button:disabled{opacity:.5;cursor:default}" +
    ".vt .vt-msg{padding:12px 14px;border-radius:10px;margin:12px 0;background:#eef2f6}.vt .vt-ok{background:#e2f2ec;color:#145a3a}.vt .vt-err{background:#f7e3e3;color:#8a1f1f}" +
    ".vt table{width:100%;border-collapse:collapse;font-size:14px}.vt th,.vt td{padding:7px 6px;border-bottom:1px solid #e6ebf1;text-align:left;vertical-align:top}" +
    ".vt th{background:var(--vt-pri,#102A43);color:#fff;font-size:12px;text-transform:uppercase;letter-spacing:.3px}" +
    ".vt .vt-scroll{overflow-x:auto}.vt .vt-pill{font-size:12px;font-weight:600;padding:2px 8px;border-radius:20px;background:#eef2f6}" +
    ".vt .vt-pill.on{background:#e2f2ec;color:#145a3a}.vt .vt-pill.off{background:#f7e3e3;color:#8a1f1f}" +
    ".vt .vt-link{font-size:12px;word-break:break-all;color:#5b6b7c}";
  function addCss() { var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function post(body) {
    return fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || j.error) throw new Error(j.error || ("Error " + r.status)); return j; }); });
  }
  function fmt(iso) { if (!iso) return ""; var d = new Date(iso); return d.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
  function ordinal(i) { return ["1st choice", "2nd choice", "3rd choice"][i] || (i + 1) + "th choice"; }

  /* ================= ballot ================= */
  function ballot(el) {
    var t = new URLSearchParams(location.search).get("t");
    if (!t) { el.innerHTML = '<div class="vt-msg vt-err">This page opens from your personal ballot link. Use the link the organizer sent you.</div>'; return; }
    el.innerHTML = '<div class="vt-msg">Loading your ballot&hellip;</div>';
    post({ action: "ballot", t: t }).then(function (B) { render(B); }).catch(function (e) { el.innerHTML = '<div class="vt-msg vt-err">' + esc(e.message) + "</div>"; });

    function render(B) {
      var head = '<div class="vt-card"><h3>' + esc(B.voter.name) + "</h3><div class=\"vt-muted\">" + esc(B.voter.role) + (B.voter.team ? ", " + esc(B.voter.team) : "") + " &middot; " + esc(B.event) + "</div></div>";
      if (B.voted) { el.innerHTML = head + '<div class="vt-msg vt-ok">Your ballot was recorded on ' + esc(fmt(B.voted.ts)) + ". Thank you. A ballot is final once submitted.</div>"; return; }
      if (!B.open) { el.innerHTML = head + '<div class="vt-msg">Voting is not open right now. Keep this link: it opens when the organizer starts the vote' + (B.closeAt ? ", and it closes " + esc(fmt(B.closeAt)) : "") + ".</div>"; return; }
      var h = head + '<div class="vt-msg">Pick up to three players per award, in order: 1st choice ' + B.points[0] + " points, 2nd " + B.points[1] + ", 3rd " + B.points[2] + ". Players from your own team are not listed. Leave an award empty if you did not see enough of that division." + (B.closeAt ? " Voting closes " + esc(fmt(B.closeAt)) + "." : "") + "</div>";
      B.divisions.forEach(function (d) {
        h += "<h2>" + esc(d.div) + "</h2>";
        d.awards.forEach(function (a) {
          var k = d.div + "|" + a.id;
          h += '<div class="vt-card"><h3>' + esc(a.label) + '</h3><div class="vt-muted">' + esc(a.sub) + "</div>";
          if (!a.candidates.length) { h += '<div class="vt-muted" style="margin-top:8px">No eligible players listed yet.</div></div>'; return; }
          for (var i = 0; i < B.points.length; i++) {
            h += '<div class="vt-row"><span class="vt-rk">' + ordinal(i) + '</span><select data-k="' + esc(k) + '" data-i="' + i + '"><option value="">No choice</option>';
            var team = null;
            a.candidates.forEach(function (c) {
              if (c.team !== team) { if (team !== null) h += "</optgroup>"; team = c.team; h += '<optgroup label="' + esc(team) + '">'; }
              h += '<option value="' + esc(c.id) + '">' + esc(c.label) + "</option>";
            });
            h += "</optgroup></select></div>";
          }
          h += "</div>";
        });
      });
      h += '<div id="vt-check"></div><div class="vt-row"><button id="vt-review">Review my ballot</button></div><div id="vt-review-box"></div>';
      el.innerHTML = h;
      var sels = el.querySelectorAll("select[data-k]");
      function picks() {
        var p = {};
        sels.forEach(function (s) { var k = s.getAttribute("data-k"), i = +s.getAttribute("data-i"); p[k] = p[k] || []; p[k][i] = s.value; });
        Object.keys(p).forEach(function (k) { p[k] = p[k].filter(function (x) { return x; }); if (!p[k].length) delete p[k]; });
        return p;
      }
      function problems() {
        var errs = [], by = {};
        sels.forEach(function (s) { var k = s.getAttribute("data-k"); (by[k] = by[k] || []).push(s); });
        Object.keys(by).forEach(function (k) {
          var vals = by[k].map(function (s) { return s.value; });
          var seen = {};
          vals.forEach(function (v) { if (v && seen[v]) errs.push(k.replace("|", " ").replace(/\b(mvp|mvg)\b/, function (x) { return x.toUpperCase(); }) + ": the same player is chosen twice."); seen[v] = 1; });
          var gap = false; vals.forEach(function (v, i) { if (!v && vals.slice(i + 1).some(Boolean)) gap = true; });
          if (gap) errs.push(k.split("|")[1].toUpperCase() + " " + k.split("|")[0] + ": fill the 1st choice before the 2nd, and the 2nd before the 3rd.");
        });
        return errs;
      }
      el.querySelector("#vt-review").addEventListener("click", function () {
        var box = el.querySelector("#vt-review-box"), errs = problems(), p = picks();
        if (errs.length) { box.innerHTML = '<div class="vt-msg vt-err">' + errs.map(esc).join("<br>") + "</div>"; return; }
        if (!Object.keys(p).length) { box.innerHTML = '<div class="vt-msg vt-err">Choose at least one player.</div>'; return; }
        var lab = {}; sels.forEach(function (s) { Array.prototype.forEach.call(s.options, function (o) { if (o.value) lab[o.value] = o.textContent + " (" + o.parentNode.label + ")"; }); });
        var r = '<div class="vt-card"><h3>Your ballot</h3>';
        Object.keys(p).forEach(function (k) {
          var parts = k.split("|");
          r += '<div style="margin-top:8px"><b>' + esc(parts[1].toUpperCase() + " " + parts[0]) + "</b><br>" + p[k].map(function (id, i) { return esc(ordinal(i) + ": " + lab[id]); }).join("<br>") + "</div>";
        });
        r += '<div class="vt-msg" style="margin-top:12px">Once submitted, the ballot is final and cannot be changed.</div><div class="vt-row"><button id="vt-submit">Submit final ballot</button><button class="vt-sec" id="vt-edit">Edit</button></div></div>';
        box.innerHTML = r;
        box.querySelector("#vt-edit").addEventListener("click", function () { box.innerHTML = ""; });
        box.querySelector("#vt-submit").addEventListener("click", function () {
          var btn = this; btn.disabled = true; btn.textContent = "Sending...";
          post({ action: "submit", t: t, picks: p }).then(function (res) {
            el.innerHTML = head + '<div class="vt-msg vt-ok">Your ballot was recorded on ' + esc(fmt(res.ts)) + ". Thank you.</div>";
            window.scrollTo(0, 0);
          }).catch(function (e) { btn.disabled = false; btn.textContent = "Submit final ballot"; box.insertAdjacentHTML("afterbegin", '<div class="vt-msg vt-err">' + esc(e.message) + "</div>"); });
        });
        box.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  /* ================= organizer ================= */
  function admin(el) {
    var SK = "vote_admin_token", token = "";
    try { token = sessionStorage.getItem(SK) || ""; } catch (e) {}
    el.innerHTML =
      '<div class="vt-card"><h3>Organizer token</h3><div class="vt-muted">The value of VOTE_ADMIN_TOKEN set in Netlify. It stays in this browser tab only.</div>' +
      '<div class="vt-row"><input type="password" id="vt-tok" autocomplete="off" placeholder="Organizer token"><button id="vt-load">Load</button></div></div><div id="vt-out"></div>';
    var inp = el.querySelector("#vt-tok"), out = el.querySelector("#vt-out");
    inp.value = token;
    function call(action, extra) {
      token = inp.value.trim();
      try { sessionStorage.setItem(SK, token); } catch (e) {}
      var b = { action: action, token: token }; for (var k in (extra || {})) b[k] = extra[k];
      out.insertAdjacentHTML("afterbegin", '<div class="vt-msg" id="vt-busy">Working&hellip;</div>');
      return post(b).then(function (S) { draw(S); return S; }).catch(function (e) { var x = out.querySelector("#vt-busy"); if (x) x.remove(); out.insertAdjacentHTML("afterbegin", '<div class="vt-msg vt-err">' + esc(e.message) + "</div>"); });
    }
    function csvCell(v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    function download(name, rows) {
      var blob = new Blob(["﻿" + rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n")], { type: "text/csv" });
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    }
    var last = null;
    function draw(S) {
      last = S;
      var voted = S.voters.filter(function (v) { return v.voted; }).length;
      var h = '<div class="vt-card"><h3>' + esc(S.event) + " &middot; round " + S.round + '</h3><div class="vt-row"><span class="vt-pill ' + (S.open ? "on" : "off") + '">' + (S.open ? "Voting open" : "Voting closed") + "</span>" +
        '<span class="vt-muted">' + voted + " of " + S.voters.length + " voters have voted" + (S.closeAt ? " &middot; closes " + esc(fmt(S.closeAt)) : "") + "</span></div>" +
        '<div class="vt-row">' + (S.open ? '<button id="vt-close">Close voting now</button>' : '<button id="vt-open">Open voting</button>') + '<button class="vt-sec" id="vt-res">Results</button><button class="vt-sec" id="vt-csv">Download ballot links (CSV)</button></div>' +
        '<div class="vt-row"><span class="vt-muted">Close automatically at</span><input type="datetime-local" id="vt-at"><button class="vt-sec" id="vt-sched">Set</button><button class="vt-sec" id="vt-unsched">Clear</button></div></div>';
      if (S.missingCoach && S.missingCoach.length) h += '<div class="vt-msg vt-err">No Official A on the roster for: ' + S.missingCoach.map(esc).join(", ") + ". Those teams have no ballot until the roster lists one.</div>";
      h += '<h2>Voters</h2><div class="vt-muted">Send each person their own link. A forwarded link votes in that person\'s name, so send it directly.</div><div class="vt-scroll"><table><tr><th>Voter</th><th>Role</th><th>Team</th><th>Voted</th><th>Ballot link</th></tr>';
      S.voters.forEach(function (v, i) {
        h += "<tr><td>" + esc(v.name) + "</td><td>" + esc(v.role) + "</td><td>" + esc(v.team) + "</td><td>" + (v.voted ? esc(fmt(v.voted)) : "") + '</td><td><button class="vt-sec" data-copy="' + i + '" style="padding:5px 10px">Copy</button></td></tr>';
      });
      h += "</table></div>";
      if (S.results) {
        h += "<h2>Results</h2><div class=\"vt-muted\">" + S.ballots + (S.ballots === 1 ? " ballot" : " ballots") + ". Points " + S.points.join(", ") + "; ties broken on the number of 1st choices, then 2nd choices.</div>";
        S.results.forEach(function (r) {
          h += '<div class="vt-card"><h3>' + esc(r.label) + '</h3><div class="vt-muted">' + r.ballots + (r.ballots === 1 ? " ballot" : " ballots") + " for this award</div>";
          if (r.tieForFirst) h += '<div class="vt-msg vt-err">Tie for first place on points and 1st choices. The organizer decides as the rules state.</div>';
          if (!r.rows.length) h += '<div class="vt-muted">No votes yet.</div>';
          else { h += '<div class="vt-scroll"><table><tr><th>#</th><th>Player</th><th>Team</th><th>Points</th><th>1st</th><th>2nd</th><th>3rd</th></tr>'; r.rows.slice(0, 10).forEach(function (x) { h += "<tr><td>" + x.rank + "</td><td>" + esc(x.name) + (x.n != null && x.n !== "" ? " #" + esc(x.n) : "") + "</td><td>" + esc(x.team) + "</td><td><b>" + x.points + "</b></td><td>" + x.firsts + "</td><td>" + x.seconds + "</td><td>" + x.thirds + "</td></tr>"; }); h += "</table></div>"; }
          h += "</div>";
        });
        h += '<div class="vt-row"><button class="vt-sec" id="vt-rescsv">Download ballots (CSV, one row per voter and award)</button></div>';
      }
      h += '<h2>New round</h2><div class="vt-card"><div class="vt-muted">Use only to restart from zero, for example after a test. It deletes nothing, but every current link and ballot stops counting. Type NEW ROUND to confirm.</div><div class="vt-row"><input type="text" id="vt-confirm" placeholder="NEW ROUND"><button class="vt-sec" id="vt-new">Start a new round</button></div></div>';
      out.innerHTML = h;
      function on(id, fn) { var b = out.querySelector(id); if (b) b.addEventListener("click", fn); }
      on("#vt-open", function () { call("open"); });
      on("#vt-close", function () { call("close"); });
      on("#vt-res", function () { call("results"); });
      on("#vt-sched", function () { var v = out.querySelector("#vt-at").value; if (v) call("schedule", { closeAt: new Date(v).toISOString() }); });
      on("#vt-unsched", function () { call("schedule", { closeAt: "" }); });
      on("#vt-new", function () { call("newround", { confirm: out.querySelector("#vt-confirm").value.trim() }); });
      on("#vt-csv", function () { download("ballot-links-round-" + S.round + ".csv", [["Voter", "Role", "Team", "Ballot link", "Voted"]].concat(S.voters.map(function (v) { return [v.name, v.role, v.team, v.link, v.voted || ""]; }))); });
      on("#vt-rescsv", function () {
        var rows = [["Voter", "Role", "Voter team", "Award", "1st choice (3 pts)", "2nd choice (2 pts)", "3rd choice (1 pt)", "Submitted"]];
        var names = {}; (S.results || []).forEach(function (r) { r.rows.forEach(function (x) { names[x.id] = x.team + (x.n != null && x.n !== "" ? " #" + x.n : "") + ", " + x.name; }); });
        (S.detail || []).forEach(function (b) { Object.keys(b.picks).forEach(function (k) { var p = b.picks[k], parts = k.split("|"); rows.push([b.name, b.role, b.team, parts[1].toUpperCase() + " " + parts[0], names[p[0]] || "", names[p[1]] || "", names[p[2]] || "", b.ts]); }); });
        download("ballots-round-" + S.round + ".csv", rows);
      });
      out.querySelectorAll("[data-copy]").forEach(function (b) {
        b.addEventListener("click", function () {
          var v = S.voters[+b.getAttribute("data-copy")];
          var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1500); };
          if (navigator.clipboard) navigator.clipboard.writeText(v.link).then(done, function () { prompt("Ballot link for " + v.name, v.link); });
          else prompt("Ballot link for " + v.name, v.link);
        });
      });
    }
    el.querySelector("#vt-load").addEventListener("click", function () { call("status"); });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") call("status"); });
    if (token) call("status");
  }

  function init() {
    var b = document.getElementById("vote-ballot"), a = document.getElementById("vote-admin");
    if (!b && !a) return;
    addCss();
    if (b) ballot(b);
    if (a) admin(a);
  }
  if (document.readyState !== "loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
