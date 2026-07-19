/* CalCup 2027 — renders all views from window.CALCUP. No data lives here. */
(function () {
  var D = window.CALCUP || {};
  var M = D.meta || {};
  if (!M.streamUrl) M.streamUrl = "https://www.youtube.com/embed/XsOU8JnEpNM"; // TEST feed — replace/remove when the real stream is set
  var teams = D.teams || [], refs = D.referees || [], vols = D.volunteers || [], games = D.games || [];
  var WIN = M.winPoints != null ? M.winPoints : 2, DRAW = M.drawPoints != null ? M.drawPoints : 1, LOSS = M.lossPoints != null ? M.lossPoints : 0;
  var DAYS = ["Thu", "Fri", "Sat", "Sun"];
  var DAY_DATE = { Thu:"2027-01-29", Fri:"2027-01-30", Sat:"2027-01-31", Sun:"2027-02-01" };
  var JCOL = { White:"#FFFFFF", Blue:"#2E6FD6", Black:"#1F1F1F", Green:"#1E8449", Gold:"#C9A227", Red:"#C0392B", Yellow:"#E4B90B", Navy:"#1F3A93", Orange:"#F47920" };

  /* Single source of truth for both the top nav and the home "Explore" grid — they can't drift. */
  /* primary:true → top nav. All items → home "Explore" directory. Watch live is a header CTA, not a nav item. */
  var SECTIONS = [
    { href:"schedule.html",   nav:"Schedule",    tile:"Schedule",     icon:"ti-clock",           primary:true },
    { href:"standings.html",  nav:"Standings",   tile:"Standings",    icon:"ti-friends",         primary:true },
    { href:"scorers.html",    nav:"Top scorers", tile:"Top scorers",  icon:"ti-run",             primary:true },
    { href:"teams.html",      nav:"Teams",       tile:"Teams",        icon:"ti-users",           primary:true },
    { href:"referees.html",   nav:"Refereeing",  tile:"Refereeing",   icon:"whistle",            primary:true },
    { href:"info.html",       nav:"Info",        tile:"Visitor info", icon:"ti-map-pin",         primary:true },
    { href:"physio.html",     nav:"Physio",      tile:"Physio",       icon:"ti-stethoscope",     primary:true },
    { href:"concession.html", nav:"Concession",  tile:"Concession",   icon:"ti-bolt",            primary:true },
    { href:"history.html",    nav:"History",     tile:"History",      icon:"ti-trophy",          primary:true },
    { href:"watch.html",      nav:"Watch live",  tile:"Watch live",   icon:"ti-player-play",     primary:false },
    { href:"sponsors.html",   nav:"Sponsors",    tile:"Sponsors",     icon:"ti-heart-handshake", primary:false },
    { href:"press.html",      nav:"Press",       tile:"Press kit",    icon:"ti-file-text",       primary:false }
  ];
  function currentPage(){ var p=(location.pathname.split("/").pop()||"index.html"); return p||"index.html"; }
  function renderNav(){
    var menu=document.getElementById("menu"); if(menu){
      var cur=currentPage();
      var items=[{href:"index.html",nav:"Home"}].concat(SECTIONS.filter(function(s){return s.primary;}));
      menu.innerHTML=items.map(function(it){
        var act=(it.href===cur)?' class="active"':'';
        return '<a href="'+it.href+'"'+act+'>'+it.nav+'</a>';
      }).join("");
    }
    // "Watch live" CTA pinned in the header on every page (visible on mobile too)
    var wrap=document.querySelector(".nav .wrap");
    if(wrap && !document.getElementById("watch-cta")){
      var cta=document.createElement("a");
      cta.id="watch-cta"; cta.className="watch-cta"; cta.href="watch.html";
      cta.innerHTML='<i class="ti ti-player-play"></i> Watch live';
      wrap.insertBefore(cta, document.getElementById("burger"));
    }
  }
  var WHISTLE_SVG='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9.5" cy="14.5" r="5.5"/><path d="M14 11.5 21 9v4l-7 1.5"/><path d="M9.5 9V5.5h4"/></svg>';
  function iconHTML(icon){ return icon==="whistle" ? WHISTLE_SVG : '<i class="ti '+icon+'"></i>'; }
  var BUNDLE_SVG='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
  function renderExplore(){
    var el=document.getElementById("explore-grid"); if(!el) return;
    el.innerHTML=SECTIONS.map(function(it){
      return '<a class="tile" href="'+it.href+'"><span class="ico">'+iconHTML(it.icon)+'</span><span>'+it.tile+'</span></a>';
    }).join("");
  }
  /* click-to-zoom for product images (class "zoomable") */
  function setupZoom(){
    if(document.getElementById("zoom-overlay")) return;
    var ov=document.createElement("div");
    ov.id="zoom-overlay"; ov.className="zoom-overlay";
    ov.innerHTML='<img alt=""><button class="zoom-close" aria-label="Close">&times;</button>';
    document.body.appendChild(ov);
    function close(){ ov.classList.remove("open"); }
    ov.addEventListener("click", close);
    document.addEventListener("keydown", function(e){ if(e.key==="Escape") close(); });
    document.addEventListener("click", function(e){
      var t=e.target;
      if(t && t.classList && t.classList.contains("zoomable")){
        e.preventDefault();
        ov.querySelector("img").src=t.getAttribute("src");
        ov.classList.add("open");
      }
    });
  }
  /* real datetime for a game, used to pick the next game by actual date & time */
  function gameDate(g){
    var d=DAY_DATE[g.day]; if(!d) return null;
    var m=String(g.time||"").match(/(\d+):(\d+)\s*(AM|PM)?/i); if(!m) return null;
    var hh=parseInt(m[1],10), mm=parseInt(m[2],10), ap=(m[3]||"").toUpperCase();
    if(ap==="PM"&&hh<12) hh+=12; if(ap==="AM"&&hh===12) hh=0;
    return new Date(d+"T"+("0"+hh).slice(-2)+":"+("0"+mm).slice(-2)+":00");
  }
  function chronSorted(){ return games.slice().sort(function(a,b){ var da=gameDate(a),db=gameDate(b); if(da&&db) return da-db; return (a.no||0)-(b.no||0); }); }
  function upcomingByTime(){
    var now=new Date(), sorted=chronSorted();
    var notFinal=sorted.filter(function(g){ return g.status!=="final"; });
    var future=notFinal.filter(function(g){ var d=gameDate(g); return d? d>=now : true; });
    return future.length? future : notFinal;
  }
  function nextGame(){
    var live=games.find(function(g){ return g.status==="live"; }); if(live) return live;
    var pool=upcomingByTime();
    return pool.find(function(g){ return isReal(g.teamA)&&isReal(g.teamB); }) || pool[0]
        || chronSorted().reverse().find(function(g){ return g.status==="final"; }) || games[games.length-1];
  }

  var byId = {}; teams.forEach(function (t) { byId[t.id] = t; });
  var refMap = {}; refs.forEach(function (r) { refMap[r.id] = r; });
  var volMap = {}; vols.forEach(function (v) { volMap[v.id] = v; });

  function teamName(id) {
    if (byId[id]) return byId[id].name;
    if (id && id.indexOf("tbd-") === 0) return "TBD (" + id.slice(4).toUpperCase() + ")";
    return id || "TBD";
  }
  function isReal(id) { return !!byId[id]; }
  function teamLogo(id, cls) { return byId[id] ? '<img class="' + (cls || "tlogo") + '" src="assets/logos/' + id + '.png" alt="" onerror="this.style.display=\'none\'">' : ""; }
  function refName(id) { var r = refMap[id]; if (r) return r.refs ? r.refs.join(" / ") : r.pair; var s = String(id || "").trim(); return (!s || /assign manually/i.test(s) || /^referee \d+ \(tbd\)\s*\/\s*referee \d+ \(tbd\)$/i.test(s)) ? "TBD" : s; }
  function flagEmoji(c) { return c === "USA" ? "🇺🇸" : c === "FRA" ? "🇫🇷" : c === "CAN" ? "🇨🇦" : "🏳️"; }
  function flagImg(c) { var m = { USA: "flag-us.png", FRA: "flag-fr.png", CAN: "flag-ca.png" }; return m[c] ? '<img class="ref-flag-img" src="assets/' + m[c] + '" alt="' + c + '">' : ""; }
  function tableNames(ids) { return (ids || []).map(function (i) { return volMap[i] ? volMap[i].name : i; }).join(", ") || "TBD"; }
  function statusPill(s) {
    if (s === "final") return '<span class="pill final">Final</span>';
    if (s === "live") return '<span class="pill live"><i class="ti ti-player-play"></i> Live</span>';
    return '<span class="pill up">Upcoming</span>';
  }
  function gameTitle(g) { return g.label || ((g.division === "W" ? "Women" : "Men") + (g.group === "A" || g.group === "B" ? " · Group " + g.group : "")); }
  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }

  function divPill(g){ var w=g.division==="W"; return '<span class="dvp '+(w?"dvp-w":"dvp-m")+'" title="'+(w?"Women’s":"Men’s")+' game">'+(w?"W":"M")+'</span>'; }

  /* ---------- game card ---------- */
  function gameCardHTML(g) {
    var a = g.status === "upcoming" ? '<span class="sc" style="color:var(--muted)">–</span>' : '<span class="sc">' + g.scoreA + "</span>";
    var b = g.status === "upcoming" ? '<span class="sc" style="color:var(--muted)">–</span>' : '<span class="sc">' + g.scoreB + "</span>";
    return '<div class="game">' +
      '<div class="meta">' + divPill(g) + " " + gameTitle(g) + " · Game " + g.no + " · " + g.day + " " + g.time + "</div>" +
      '<div class="row"><span class="gt">' + teamLogo(g.teamA) + teamName(g.teamA) + "</span>" + a + "</div>" +
      '<div class="row"><span class="gt">' + teamLogo(g.teamB) + teamName(g.teamB) + "</span>" + b + "</div>" +
      '<div style="margin-top:8px">' + statusPill(g.status) + "</div>" +
      '<div class="offi">' +
        '<div>Refs: ' + refName(g.refs) + "</div>" +
        '<div>Table: ' + tableNames(g.table) + "</div>" +
      "</div></div>";
  }

  /* ---------- top scorers ---------- */
  function topScorers(division, limit) {
    if (D.scorers && D.scorers[division]) {
      var s = D.scorers[division].slice().sort(function (a, b) { return b.goals - a.goals; });
      return limit ? s.slice(0, limit) : s;
    }
    var tally = {};
    games.forEach(function (g) {
      (g.goals || []).forEach(function (e) {
        var t = byId[e.team]; if (!t || t.division !== division) return;
        var key = e.player + "|" + e.team;
        if (!tally[key]) tally[key] = { player: e.player, team: e.team, goals: 0 };
        tally[key].goals += e.goals;
      });
    });
    var arr = Object.keys(tally).map(function (k) { return tally[k]; }).sort(function (a, b) { return b.goals - a.goals; });
    return limit ? arr.slice(0, limit) : arr;
  }
  function leaderHTML(list) {
    if (!list.length) return '<div style="color:var(--muted);font-size:14px">No goals recorded yet.</div>';
    return '<div class="lead">' + list.map(function (s, i) {
      return '<div class="lrow"><span><span class="rk ' + (i === 0 ? "top" : "") + '">' + (i + 1) + "</span> " +
        s.player + ' · <span class="gt">' + teamLogo(s.team) + teamName(s.team) + "</span></span><span style=\"font-weight:700\">" + s.goals + "</span></div>";
    }).join("") + "</div>";
  }

  /* ---------- standings (with head-to-head tiebreak) ---------- */
  function finalsFor(div, grp) {
    return games.filter(function (g) {
      return g.status === "final" && g.division === div && g.group === grp && isReal(g.teamA) && isReal(g.teamB);
    });
  }
  function computeTable(div, grp) {
    var row = {};
    teams.filter(function (t) { return t.division === div && t.group === grp; })
      .forEach(function (t) { row[t.id] = { id: t.id, name: t.name, P: 0, W: 0, D: 0, L: 0, GF: 0, GA: 0, Pts: 0 }; });
    var fin = finalsFor(div, grp);
    fin.forEach(function (g) {
      var A = row[g.teamA], B = row[g.teamB]; if (!A || !B) return;
      A.P++; B.P++; A.GF += g.scoreA; A.GA += g.scoreB; B.GF += g.scoreB; B.GA += g.scoreA;
      if (g.scoreA > g.scoreB) { A.W++; B.L++; A.Pts += WIN; B.Pts += LOSS; }
      else if (g.scoreB > g.scoreA) { B.W++; A.L++; B.Pts += WIN; A.Pts += LOSS; }
      else { A.D++; B.D++; A.Pts += DRAW; B.Pts += DRAW; }
    });
    var arr = Object.keys(row).map(function (k) { return row[k]; });
    arr.sort(function (a, b) { return b.Pts - a.Pts; });
    // resolve equal-points clusters by mini-league (h2h), then overall GD, GF
    var out = [], i = 0;
    while (i < arr.length) {
      var j = i; while (j < arr.length && arr[j].Pts === arr[i].Pts) j++;
      var cluster = arr.slice(i, j);
      if (cluster.length > 1) {
        var ids = {}; cluster.forEach(function (t) { ids[t.id] = { pts: 0, gd: 0 }; });
        fin.forEach(function (g) {
          if (ids[g.teamA] && ids[g.teamB]) {
            ids[g.teamA].gd += g.scoreA - g.scoreB; ids[g.teamB].gd += g.scoreB - g.scoreA;
            if (g.scoreA > g.scoreB) { ids[g.teamA].pts += WIN; ids[g.teamB].pts += LOSS; }
            else if (g.scoreB > g.scoreA) { ids[g.teamB].pts += WIN; ids[g.teamA].pts += LOSS; }
            else { ids[g.teamA].pts += DRAW; ids[g.teamB].pts += DRAW; }
          }
        });
        cluster.sort(function (a, b) {
          var m = ids[b.id].pts - ids[a.id].pts; if (m) return m;
          var mg = ids[b.id].gd - ids[a.id].gd; if (mg) return mg;
          var gd = (b.GF - b.GA) - (a.GF - a.GA); if (gd) return gd;
          if (b.GF !== a.GF) return b.GF - a.GF;
          return a.name.localeCompare(b.name);
        });
      }
      cluster.forEach(function (t) { out.push(t); });
      i = j;
    }
    return out;
  }
  function standingsFromExcel(grp) {
    return D.standings[grp].map(function (s) {
      var P = 0, W = 0, Dr = 0, L = 0;
      games.forEach(function (g) {
        if (g.status !== "final") return;
        var me = g.teamA === s.id ? "A" : (g.teamB === s.id ? "B" : null); if (!me) return;
        var us = me === "A" ? g.scoreA : g.scoreB, th = me === "A" ? g.scoreB : g.scoreA;
        P++; if (us > th) W++; else if (us < th) L++; else Dr++;
      });
      return { id: s.id, name: s.name, P: P, W: W, D: Dr, L: L, GF: s.gf, GA: s.ga, Pts: s.pts };
    });
  }
  function tableHTML(div, grp, qualLabels) {
    qualLabels = qualLabels || [];
    var rows = (D.standings && D.standings[grp] && D.standings[grp].length) ? standingsFromExcel(grp) : computeTable(div, grp);
    var body = rows.map(function (t, i) {
      var ql = qualLabels[i], label = ql ? (ql.t || ql) : "", champ = !!(ql && ql.c);
      var q = champ ? ' class="qual"' : '';
      var badge = label ? '<span class="qbadge' + (champ ? '' : ' qbadge-plain') + '">&rarr; ' + label + '</span>' : '';
      return '<tr' + q + '><td>' + (i + 1) + '</td><td class="tm"><span class="gt">' + teamLogo(t.id) + t.name + '</span>' + badge + '</td><td>' + t.P + '</td><td>' + t.W + '</td><td>' + t.D + '</td><td>' + t.L + '</td><td>' + t.GF + '</td><td>' + t.GA + '</td><td>' + (t.GF - t.GA > 0 ? "+" : "") + (t.GF - t.GA) + '</td><td class="pts">' + t.Pts + '</td></tr>';
    }).join("");
    return '<table class="tbl"><thead><tr><th>#</th><th style="text-align:left">Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead><tbody>' + body + '</tbody></table>';
  }

  /* ---------- schedule ---------- */
  function jerseySwatch(name){ if(!name) return '<span class="jersey jersey-tbd" title="Jersey TBD"></span>'; var c=JCOL[name]||"#8895a3"; return '<span class="jersey" style="background:'+c+'" title="'+name+' jersey"></span>'; }
  function schedTeam(g, side){ var id=side==="A"?g.teamA:g.teamB, sc=side==="A"?g.scoreA:g.scoreB, jn=side==="A"?g.jA:g.jB, played=g.status!=="upcoming"; var win=played&&((side==="A"&&g.scoreA>g.scoreB)||(side==="B"&&g.scoreB>g.scoreA)); return '<div class="gteam'+(win?" gwin":"")+'">'+jerseySwatch(jn)+teamLogo(id)+'<span class="gtn">'+teamName(id)+'</span>'+(played?'<span class="gsc">'+sc+'</span>':'')+'</div>'; }
  function rowHTML(g){
    return '<div class="grow" data-div="'+g.division+'">'+
      '<div class="gno">'+g.no+'</div>'+
      '<div class="gmain">'+
        '<div class="gmeta">'+divPill(g)+' '+gameTitle(g)+' · '+g.time+'</div>'+
        schedTeam(g,"A")+schedTeam(g,"B")+
        '<div class="goff">Refs: '+refName(g.refs)+' · Table: '+tableNames(g.table)+'</div>'+
      '</div>'+
      '<div class="gstat">'+statusPill(g.status)+'</div>'+
    '</div>';
  }
  function renderSchedule(el) {
    var html = DAYS.filter(function (d) { return games.some(function (g) { return g.day === d; }); }).map(function (d) {
      var gs = games.filter(function (g) { return g.day === d; });
      return '<div class="dayblock"><h3 class="dayhead">' + dayLabel(d) + '</h3>' + gs.map(rowHTML).join("") + '</div>';
    }).join("");
    var legend = '<div class="sched-legend"><span class="lg lg-m">Men</span><span class="lg lg-w">Women</span><span class="lg-sw">Swatch = jersey each team wears this game</span></div>';
    el.innerHTML = legend + html;
  }
  function dayLabel(d) {
    return { Thu: "Thursday — opener", Fri: "Friday", Sat: "Saturday", Sun: "Sunday — placements & finals" }[d] || d;
  }

  /* ---------- watch ---------- */
  function renderWatch(el) {
    if (M.streamUrl) {
      el.innerHTML = '<div class="video"><iframe src="' + M.streamUrl + '" title="CalCup live stream" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>';
    } else {
      el.innerHTML = '<div class="video placeholder"><div><i class="ti ti-player-play" style="font-size:34px;color:var(--orange)"></i><p>The live stream goes live when the tournament begins.</p><p style="font-size:13px;color:var(--muted)">All games are streamed. Bookmark this page.</p></div></div>';
    }
  }

  /* ---------- featured / preview ---------- */
  function featured() { return nextGame(); }
  function previewRows(list) {
    return '<div class="sched">' + list.map(function (g) {
      var res = g.status === "final" ? '<span style="color:var(--green);font-weight:600">' + g.scoreA + "-" + g.scoreB + "</span>"
        : g.status === "live" ? '<span style="color:var(--red);font-weight:600">live</span>'
        : '<span style="color:var(--muted)">' + g.time + "</span>";
      return '<div class="srow"><span style="color:var(--muted)">' + g.day + "</span>" +
        '<span><span class="gt">' + teamLogo(g.teamA) + teamName(g.teamA) + '</span> v <span class="gt">' + teamLogo(g.teamB) + teamName(g.teamB) + "</span>" +
        '<div class="refs">' + refName(g.refs) + "</div></span>" +
        "<span style=\"text-align:right\">" + res + "</span></div>";
    }).join("") + "</div>";
  }

  /* ---------- teams ---------- */
  function getParam(k) { return new URLSearchParams(location.search).get(k); }
  function teamFinals(id) { return games.filter(function (g) { return g.status === "final" && (g.teamA === id || g.teamB === id); }); }
  function teamGames(id) { return games.filter(function (g) { return g.teamA === id || g.teamB === id; }); }
  function teamRecord(id) {
    var r = { W: 0, L: 0, D: 0, GF: 0, GA: 0 };
    teamFinals(id).forEach(function (g) {
      var us = g.teamA === id ? g.scoreA : g.scoreB, th = g.teamA === id ? g.scoreB : g.scoreA;
      r.GF += us; r.GA += th; if (us > th) r.W++; else if (us < th) r.L++; else r.D++;
    });
    return r;
  }
  function divLabel(d, g) { return (d === "W" ? "Women" : "Men" + (g === "A" || g === "B" ? " · Group " + g : "")); }
  function renderTeamsDirectory(el) {
    var groups = [["Men · Group A", "M", "A"], ["Men · Group B", "M", "B"], ["Women", "W", "W"]];
    el.innerHTML = groups.map(function (grp) {
      var ts = teams.filter(function (t) { return t.division === grp[1] && t.group === grp[2]; });
      return '<section><div class="sec-head"><h2>' + grp[0] + '</h2></div><div class="grid cols-3">' +
        ts.map(function (t) {
          var r = teamRecord(t.id);
          return '<a class="card teamcard" href="team.html?id=' + t.id + '"><div class="team-logo"><img src="assets/logos/' + t.id + '.png" alt="' + t.name + '" onerror="this.parentNode.style.display=\'none\'"></div><h3>' + t.name + '</h3>' +
            '<div class="muted">' + t.city + '</div>' +
            '<div class="rec">' + r.W + 'W · ' + r.L + 'L</div></a>';
        }).join("") + '</div></section>';
    }).join("");
  }
  function renderTeamDetail(el) {
    var t = byId[getParam("id")];
    if (!t) { el.innerHTML = '<div class="card">Team not found. <a href="teams.html">Back to teams</a></div>'; return; }
    document.title = t.name + " — CalCup 2027";
    var r = teamRecord(t.id);
    var ros = (D.rosters && D.rosters[t.id]) || [];
    var rosterHTML = ros.length
      ? '<table class="tbl"><thead><tr><th>#</th><th style="text-align:left">Player</th><th style="text-align:left">Position</th></tr></thead><tbody>' +
        ros.map(function (p) { return '<tr><td>' + p.n + '</td><td class="tm">' + p.name + '</td><td style="text-align:left">' + p.pos + '</td></tr>'; }).join("") + '</tbody></table>'
      : '<div class="muted">Roster to be announced.</div>';
    var gs = teamGames(t.id).map(function (g) {
      var opp = g.teamA === t.id ? teamName(g.teamB) : teamName(g.teamA);
      var us = g.teamA === t.id ? g.scoreA : g.scoreB, th = g.teamA === t.id ? g.scoreB : g.scoreA;
      var res = g.status === "final" ? '<span class="res final">' + us + "–" + th + (us > th ? " W" : us < th ? " L" : "") + "</span>"
        : g.status === "live" ? '<span class="res live">live</span>' : '<span class="res up">' + g.day + " " + g.time + "</span>";
      return '<div class="grow"><div class="gno">' + g.no + '</div><div class="gmain"><div class="gteams">vs ' + opp + '</div><div class="gsub">' + gameTitle(g) + '</div></div><div class="gres">' + res + '</div></div>';
    }).join("");
    el.innerHTML =
      '<section><img src="assets/logos/' + t.id + '.png" alt="' + t.name + '" onerror="this.style.display=\'none\'" style="max-height:72px;margin:0 0 10px;display:block"><h1 style="font-size:28px;margin:0 0 4px">' + t.name + '</h1>' +
      '<p class="muted" style="margin:0 0 14px">' + t.city + ' · ' + divLabel(t.division, t.group) + ' · Record ' + r.W + 'W–' + r.L + 'L</p>' +
      '<div class="grid cols-2"><div><div class="sec-head"><h2>Roster</h2></div>' + rosterHTML + '</div>' +
      '<div><div class="sec-head"><h2>Games</h2></div>' + gs + '</div></div></section>';
  }

  /* ---------- referees ---------- */
  function flagFace(c){ var m={USA:"flag-us.png",FRA:"flag-fr.png",CAN:"flag-ca.png"}; return m[c]?'<img class="rp-flag" src="assets/'+m[c]+'" alt="'+c+'">':''; }
  function renderReferees(el){
    function refKey(s){ return String(s||"").toLowerCase().replace(/[^a-z]+/g," ").trim().split(" ").filter(Boolean).sort().join(""); }
    function isRealRef(s){ s=String(s||""); return !!s && !/tbd/i.test(s) && !/assign manually/i.test(s); }
    // Optional bio/country metadata, keyed by referee name.
    var meta={};
    (D.referees||[]).forEach(function(r){ var k=refKey((r.refs||[]).join(" ")); if(k) meta[k]={country:r.country,bio:r.bio}; });
    // Single source of truth: the referee pairs actually assigned to games (exactly what the schedule shows).
    var order=[], seen={};
    games.forEach(function(g){
      if(!isRealRef(g.refs)) return;
      var k=refKey(g.refs);
      if(!seen[k]){ seen[k]={ names:String(g.refs).split(/\s*\/\s*/), nums:[] }; order.push(k); }
      seen[k].nums.push(g.no);
    });
    if(!order.length){ el.innerHTML='<div class="muted">Referee pairs will appear here once assignments are confirmed.</div>'; return; }
    var cards=order.map(function(k){
      var r=seen[k], m=meta[k]||{country:"USA",bio:"USATH-certified referee pair."};
      var people=r.names.map(function(n){
        var init=(n.replace(/[^A-Za-z ]/g,"").trim().split(/\s+/).map(function(w){return w[0]||"";}).join("").slice(0,2).toUpperCase())||"?";
        return '<div class="ref-person"><div class="ref-portrait"><span class="rp-init">'+init+'</span>'+flagFace(m.country)+'</div><div class="ref-name">'+n+'</div></div>';
      }).join("");
      var nums=r.nums.sort(function(a,b){return a-b;}).join(" · ");
      var asg='Officiates '+r.nums.length+' game'+(r.nums.length>1?'s':'')+' · Game'+(r.nums.length>1?'s':'')+' '+nums;
      return '<div class="rc-card"><div class="ref-people">'+people+'</div>'+
        (m.bio?'<div class="muted rc-bio">'+m.bio+'</div>':'')+
        '<div class="rc-assign">'+asg+'</div></div>';
    });
    el.innerHTML='<div class="ref-cf" id="refcf">'+
      '<button class="rc-arrow rc-prev" aria-label="Previous pair">&#8249;</button>'+
      '<div class="rc-stage">'+cards.map(function(c,i){return '<div class="rc-slot" data-i="'+i+'">'+c+'</div>';}).join("")+'</div>'+
      '<button class="rc-arrow rc-next" aria-label="Next pair">&#8250;</button>'+
      '<div class="rc-dots">'+order.map(function(_,i){return '<button class="rc-dot" data-i="'+i+'" aria-label="Pair '+(i+1)+'"></button>';}).join("")+'</div></div>';
    setupRefCarousel(el.querySelector("#refcf"), order.length);
  }
  function setupRefCarousel(root,N){
    if(!root||!N)return;
    var slots=Array.prototype.slice.call(root.querySelectorAll(".rc-slot"));
    var dots=Array.prototype.slice.call(root.querySelectorAll(".rc-dot"));
    var idx=0, half=Math.floor(N/2);
    function dist(i){ var d=i-idx; while(d>half)d-=N; while(d<-half)d+=N; return d; }
    function layout(){
      slots.forEach(function(sl){ var d=dist(+sl.getAttribute("data-i")), ad=Math.abs(d);
        sl.className="rc-slot"+(ad>2?" rc-hide":" rc-p"+(d<0?"m":"")+ad);
        sl.style.zIndex=String(10-ad); sl.setAttribute("aria-hidden", ad===0?"false":"true"); });
      dots.forEach(function(dt,i){ dt.className="rc-dot"+(i===idx?" on":""); });
    }
    function go(n){ idx=((n%N)+N)%N; layout(); }
    root.querySelector(".rc-next").addEventListener("click",function(){go(idx+1);});
    root.querySelector(".rc-prev").addEventListener("click",function(){go(idx-1);});
    dots.forEach(function(dt){ dt.addEventListener("click",function(){go(+dt.getAttribute("data-i"));}); });
    slots.forEach(function(sl){ sl.addEventListener("click",function(){ if(dist(+sl.getAttribute("data-i"))!==0) go(+sl.getAttribute("data-i")); }); });
    root.tabIndex=0; root.addEventListener("keydown",function(e){ if(e.key==="ArrowRight")go(idx+1); else if(e.key==="ArrowLeft")go(idx-1); });
    layout();
  }

  /* ---------- sponsors ---------- */
  function renderSponsors(el) {
    var s = D.sponsors || {};
    var current = (s.list && s.list.length)
      ? s.list.map(function (x) { return '<div class="sponsor"><div class="sname">' + x.name + '</div>' + (x.tier ? '<div class="muted">' + x.tier + '</div>' : '') + '</div>'; }).join("")
      : '<div class="sponsor ph">Your logo here</div><div class="sponsor ph">Your logo here</div><div class="sponsor ph">Your logo here</div>';
    el.innerHTML =
      '<section><div class="card" style="border-color:var(--orange);background:var(--orange-tint)">' +
      '<h3 style="margin-top:0">Become a CalCup sponsor — ' + (s.ask || '') + '</h3>' +
      '<p style="margin:0 0 6px">' + (s.intro || '') + '</p>' +
      '<a class="btn btn-pri" href="mailto:' + (s.contact || 'calcup@calheat.com') + '?subject=CalCup%202027%20sponsorship"><i class="ti ti-mail"></i> Sponsor CalCup</a></div></section>' +
      '<section><div class="sec-head"><h2>What sponsors receive</h2></div><div class="card"><ul class="rules" style="margin:0;padding-left:18px">' +
      (s.benefits || []).map(function (b) { return '<li>' + b + '</li>'; }).join("") + '</ul></div></section>' +
      '<section><div class="sec-head"><h2>Our supporters</h2></div><div class="sponsorgrid">' + current + '</div></section>';
  }

  /* ---------- history ---------- */
  function renderHistory(el) {
    var h = D.history || {};
    // Corrections/additions sourced from the CalCup 2026 Final Rankings & Awards
    (h.champions || []).forEach(function (c) { if (c.year === 2026) { c.men = "San Diego"; c.women = "San Diego"; } });
    if (h.timeline && !h.timeline.some(function (e) { return e.year === 2025; })) { h.timeline.push({ year: 2025, text: "Welcomed a guest team from Brisbane, Australia in both the men's and women's divisions." }); h.timeline.sort(function (a, b) { return a.year - b.year; }); }
    if (h.championsNote) h.championsNote = "2026 results are final, from the official CalCup rankings. Earlier years' roll of honour is still being verified — corrections welcome.";
    var AWARDS_2026 =
      '<div class="sec-head" style="margin-top:24px"><h2>2026 podium &amp; awards</h2><span class="note">19th edition &middot; official results</span></div>' +
      '<div class="grid cols-2">' +
        '<div class="card award-card"><div class="ac-div ac-m">Men’s Division</div>' +
          '<div class="ac-podium"><span>🥇 San Diego</span><span>🥈 CalHeat</span><span>🥉 West Point–Army</span></div>' +
          '<div class="ac-row"><span>MVP</span><b>Hassen Dhouioui <em>(Boston TH)</em></b></div>' +
          '<div class="ac-row"><span>MVG</span><b>Aleix Navarro <em>(San Diego)</em></b></div>' +
          '<div class="ac-row"><span>Top scorer</span><b>Hassen Dhouioui <em>(Boston TH · 41 goals)</em></b></div>' +
        '</div>' +
        '<div class="card award-card"><div class="ac-div ac-w">Women’s Division</div>' +
          '<div class="ac-podium"><span>🥇 San Diego</span><span>🥈 NYC</span><span>🥉 CalHeat</span></div>' +
          '<div class="ac-row"><span>MVP</span><b>Mire Chew <em>(San Diego)</em></b></div>' +
          '<div class="ac-row"><span>MVG</span><b>Marilia Cantagessi <em>(San Diego)</em></b></div>' +
          '<div class="ac-row"><span>Top scorer</span><b>Elizaveta Danilova <em>(Massif SLC · 33 goals)</em></b></div>' +
        '</div>' +
      '</div>';
    var tl = (h.timeline || []).map(function (e) { return '<div class="tlrow"><div class="tlyear">' + e.year + '</div><div class="tltext">' + e.text + '</div></div>'; }).join("");
    var aw = (h.awards || []).map(function (a) { return '<div class="card"><h3 style="margin:0 0 2px">' + a.name + '</h3><div class="muted">' + a.for + '</div></div>'; }).join("");
    var champ = (h.champions && h.champions.length)
      ? '<table class="tbl champs"><thead><tr><th>Year</th><th style="text-align:left">Men\'s champion</th><th style="text-align:left">Women\'s champion</th></tr></thead><tbody>' +
        h.champions.map(function (c) {
          if (c.notHeld) return '<tr class="notheld"><td>' + c.year + '</td><td colspan="2" class="tm">Not held — COVID-19</td></tr>';
          return '<tr><td>' + c.year + '</td><td class="tm">' + (c.men || '<span class="tbd">TBD</span>') + '</td><td class="tm">' + (c.women || '<span class="tbd">TBD</span>') + '</td></tr>';
        }).join("") + '</tbody></table>' +
        (h.championsNote ? '<p class="muted" style="font-size:13px;margin-top:10px">' + h.championsNote + '</p>' : '')
      : '<div class="callout">Two decades of champions are being compiled. Have results or photos from past editions? Email <a href="mailto:' + M.contactEmail + '">' + M.contactEmail + '</a>.</div>';
    el.innerHTML =
      '<section><p style="font-size:17px;max-width:760px">' + (h.blurb || '') + '</p></section>' +
      '<section><div class="sec-head"><h2>Milestones</h2></div><div class="timeline">' + tl + '</div></section>' +
      '<section><div class="sec-head"><h2>The awards</h2></div><div class="grid cols-2">' + aw + '</div></section>' +
      '<section><div class="sec-head"><h2>Hall of Champions</h2></div>' + champ + AWARDS_2026 + '</section>';
  }

  /* ---------- press ---------- */
  function renderPress(el) {
    var p = D.press || {};
    var facts = (p.facts || []).map(function (f) { return '<li>' + f + '</li>'; }).join("");
    var assets = (p.assets || []).map(function (a) {
      return a.url
        ? '<a class="btn btn-ghost" href="' + a.url + '" target="_blank" rel="noopener" style="margin:0 8px 8px 0"><i class="ti ti-download"></i> ' + a.name + '</a>'
        : '<span class="btn btn-ghost" style="margin:0 8px 8px 0;opacity:.55;cursor:default"><i class="ti ti-clock"></i> ' + a.name + ' (soon)</span>';
    }).join("");
    el.innerHTML =
      '<section><p style="font-size:17px;max-width:760px">' + (p.intro || '') + '</p></section>' +
      (p.about ? '<section><div class="sec-head"><h2>About CalCup</h2></div><div class="card"><p style="margin:0">' + p.about + '</p></div></section>' : '') +
      '<section><div class="sec-head"><h2>Key facts</h2></div><div class="card"><ul class="rules" style="margin:0;padding-left:18px">' + facts + '</ul></div></section>' +
      '<section><div class="sec-head"><h2>Media assets</h2></div><div>' + assets + '</div></section>' +
      '<section><div class="card" style="border-color:var(--orange);background:var(--orange-tint)"><h3 style="margin-top:0">Press contact</h3><p style="margin:0">For interviews, credentials or assets: <a href="mailto:' + (p.contact || 'calcup@calheat.com') + '">' + (p.contact || 'calcup@calheat.com') + '</a></p></div></section>';
  }

  /* ---------- physiotherapy ---------- */
  function renderPhysio(el) {
    var p = D.physio || {}, L = p.lead || {};
    var c = [];
    if (L.website) c.push('<a href="' + L.website + '" target="_blank" rel="noopener"><i class="ti ti-world"></i> ' + L.website.replace(/^https?:\/\//, "") + '</a>');
    if (L.email) c.push('<a href="mailto:' + L.email + '"><i class="ti ti-mail"></i> ' + L.email + '</a>');
    if (L.phone) c.push('<span><i class="ti ti-phone"></i> ' + L.phone + '</span>');
    if (L.address) c.push('<span><i class="ti ti-map-pin"></i> ' + L.address + '</span>');
    var lead = L.org ? '<section><div class="sec-head"><h2>Lead care provider</h2></div>' +
      '<div class="card" style="border-color:var(--orange)">' +
      (L.logo ? '<img src="' + L.logo + '" alt="' + L.org + '" style="max-height:50px;width:auto;margin:0 0 12px;display:block">' : '<h3 style="margin-top:0">' + L.org + '</h3>') +
      (L.tagline ? '<div class="muted" style="margin:0 0 8px">' + L.tagline + '</div>' : '') +
      '<p style="margin:0 0 10px">' + (L.desc || '') + '</p>' +
      (c.length ? '<div class="physio-contact">' + c.join("") + '</div>' : '') + '</div></section>' : '';
    var team = (p.team || []).map(function (m) {
      var clean = m.name.replace(/^Dr\.?\s*/i, "");
      var init = (clean.replace(/[^A-Za-z ]/g, "").trim().split(/\s+/).map(function (w) { return w[0] || ""; }).join("").slice(0, 2).toUpperCase()) || "?";
      var slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return '<div class="physio-portrait">' +
        '<span class="pp-init">' + init + '</span>' +
        '<img class="pp-photo" src="assets/physio/' + slug + '.jpg" alt="' + m.name + '" onerror="this.remove()">' +
        '<div class="pp-cap"><span class="pp-name">' + m.name + '</span><span class="pp-role">' + (m.role || "Vibrant Niche") + '</span></div>' +
        '</div>';
    }).join("");
    var prot = (p.protocols || []).map(function (x) {
      if (/^Supplies\b/i.test(x)) x = "We provide the medical supplies on site — ice, tape, gel, Biofreeze and more.";
      return '<li>' + x + '</li>';
    }).join("");
    el.innerHTML =
      '<section><p style="font-size:17px;max-width:760px">' + (p.intro || '') + '</p></section>' + lead +
      '<section><div class="sec-head"><h2>The physiotherapy team</h2></div><div class="physio-team-grid">' + team + '</div></section>' +
      '<section><div class="sec-head"><h2>Protocols at CalCup</h2></div><div class="card"><ul class="rules" style="margin:0;padding-left:18px">' + prot + '</ul></div></section>' + recoveryHTML(p.recovery);
  }

  /* ---------- recovery (physio) ---------- */
  function recoveryHTML(R){
    if(!R) return "";
    var tips=(R.tips||[]).map(function(t){return '<div class="card reccard"><span class="rec-ico"><i class="ti '+(t.icon||"ti-bolt")+'"></i></span><h3 style="margin:0 0 5px">'+t.title+'</h3><p class="muted" style="margin:0">'+t.body+'</p></div>';}).join("");
    var src=(R.sources&&R.sources.length)?'<p class="muted" style="font-size:12.5px;margin-top:12px">Further reading: '+R.sources.map(function(o){return '<a href="'+o.url+'" target="_blank" rel="noopener">'+o.name+'</a>';}).join(" &nbsp;·&nbsp; ")+'</p>':'';
    return '<section><div class="sec-head"><h2>Recover like a pro</h2><span class="note">4 games, 3 days</span></div>'+
      '<p style="max-width:760px;margin:0 0 14px">'+(R.intro||'')+'</p>'+
      '<div class="grid cols-2">'+tips+'</div>'+src+'</section>';
  }

  /* ---------- lottery ---------- */
  var LOTTERY = {
    headline: "Win a player-signed pro jersey",
    blurb: "Three prizes, drawn live at the Sunday finals. Every ticket backs the tournament and the youth handball programs behind it.",
    prizes: [
      { place:"1st prize", item:"Match jersey signed by the French national team players", src:"Courtesy of the French Handball Federation" },
      { place:"2nd prize", item:"Match jersey signed by the PSG Handball players", src:"Courtesy of Paris Saint-Germain Handball" },
      { place:"3rd prize", item:"$75 of CalCup merch — your choice", src:"Redeemable at the concession stand, at your discretion" }
    ],
    tickets: [ {name:"Single",price:"$5"}, {name:"3-pack",price:"$12"}, {name:"Team 12-pack",price:"$40"}, {name:"School 20-pack",price:"$60"} ],
    where: "On sale at the concession stand — Friday through Sunday 12 PM.",
    draw: "Drawn at the finals ceremony on Sunday. You must be present to win.",
    pay: "Venmo · PayPal · Zelle accepted"
  };
  function renderLottery(el){
    var L=LOTTERY; if(!L){el.innerHTML="";return;}
    var prizes=(L.prizes||[]).map(function(p){return '<div class="lot-prize"><div class="lot-place">'+p.place+'</div><div><div class="lot-item">'+p.item+'</div><div class="muted" style="font-size:12px">'+p.src+'</div></div></div>';}).join("");
    var tix=(L.tickets||[]).map(function(t){return '<div class="lot-tix"><span class="lot-tname">'+t.name+'</span><span class="lot-tprice">'+t.price+'</span></div>';}).join("");
    el.innerHTML='<div class="lottery"><span class="lot-badge">Grand-prize lottery</span>'+
      '<h2 class="lot-head">'+L.headline+'</h2><p class="lot-blurb">'+L.blurb+'</p>'+
      '<div class="lot-prizes">'+prizes+'</div>'+
      '<div class="lot-tix-row">'+tix+'</div>'+
      '<div class="lot-meta"><span><i class="ti ti-map-pin"></i> '+L.where+'</span><span><i class="ti ti-trophy"></i> '+L.draw+'</span><span class="lot-pay">'+L.pay+'</span></div></div>';
  }

  /* ---------- concession ---------- */
  function renderConcession(el){
    var C=D.concession; if(!C)return;
    function rows(list){ return list.map(function(it){return '<div class="con-row"><span>'+it.n+'</span><span class="con-p">'+it.p+'</span></div>';}).join(""); }
    function bcard(b){
      var slug=(b.n||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
      return '<div class="card con-bundle"><div class="cb-vis"><span class="cb-ico">'+BUNDLE_SVG+'</span><img class="cb-img" src="assets/concession/'+slug+'.jpg" alt="'+b.n+'" onerror="this.remove()"></div>'+
        '<div class="con-bname">'+b.n+'</div><div class="muted" style="font-size:13px">'+b.d+'</div><div class="con-bprice">'+b.p+'</div></div>';
    }
    var menu=(C.menu||[]).map(function(g){return '<div class="card"><h3 style="margin:0 0 8px">'+g.group+'</h3><div class="con-list">'+rows(g.items)+'</div></div>';}).join("");
    var bundles=(C.bundles||[]).map(bcard).join("");
    var M=C.merch||{};
    var merchExtras=(M.items||M.bundles)?('<section><div class="sec-head"><h2>Jerseys &amp; extras</h2>'+(M.note?'<span class="note">'+M.note+'</span>':'')+'</div><div class="grid cols-3">'+
      (M.items?'<div class="card"><h3 style="margin:0 0 8px">Jerseys</h3><div class="con-list">'+rows(M.items)+'</div></div>':'')+
      (M.bundles||[]).map(bcard).join("")+'</div></section>'):'';
    function gcard(img,name,desc,price){
      var im=img?'<div class="gear-img"><img class="zoomable" src="assets/merch/'+img+'" alt="'+name+'" onerror="this.closest(\'.gear-img\').style.display=\'none\'"></div>':'';
      return '<a class="card gear-card" href="#preorder"><span class="preorder-tag">Pre-order</span>'+im+'<div class="gear-name">'+name+'</div><div class="muted" style="font-size:13px">'+desc+'</div><div class="gear-price">'+price+'</div></a>';
    }
    var teeSec='<section class="con-hero card"><div class="con-hero-img"><img class="zoomable" src="assets/merch/calcup-tshirt.jpg" alt="CalCup T-shirt" onerror="this.closest(\'.con-hero\').classList.add(\'noimg\');this.remove()"></div>'+
      '<div class="con-hero-txt"><span class="con-tag">Best seller</span><h2 style="margin:.2em 0">The CalCup tee</h2><p class="muted">Sport-grey heavyweight cotton, three-colour print. Available in <b>men&rsquo;s, women&rsquo;s and kids&rsquo;</b> sizes &mdash; <b>$20</b>, grab yours at the booth.</p></div></section>';
    var gearMsg='<p class="muted" style="max-width:820px;margin:2px 0 14px">Special <b>XXth-edition</b> hoodie and hat &mdash; <b>pre-order only</b>. Reserve below, then confirm with payment (Venmo <b>@CalHeat-Handball</b> / Zelle / PayPal <b>calcup@calheat.com</b>) &mdash; pick up at the tournament.</p>';
    var gearSec='<section><div class="sec-head"><h2>Commemorative gear</h2><span class="note">pre-order &middot; special XXth edition</span></div>'+gearMsg+'<div class="grid cols-3">'+
      gcard("calcup-hoodie.jpg","Commemorative hoodie","XXth-edition, orange strings","$75")+
      gcard("calcup-hat.jpg","Commemorative hat","XXth-edition flat-visor snapback","$35")+
      gcard("","Hoodie + hat bundle","Save $10 vs. buying separately","$100")+
      '</div></section>';
    var foodSec='<section><div class="sec-head"><h2>Food &amp; drink</h2></div><div class="grid cols-3">'+menu+'</div></section>'+
      '<section><div class="sec-head"><h2>Food bundles</h2><span class="note">save vs. buying separately</span></div><div class="grid cols-3">'+bundles+'</div></section>';
    var merchHead='<section style="padding-top:4px"><div class="sec-head"><h2>Merch</h2><span class="note">gear up &mdash; cashless (Venmo/PayPal/Zelle)</span></div></section>';
    var starterSec='<section><div class="card starter-kit"><div class="sk-txt"><span class="con-tag">Starter kit</span><h3>Fan starter kit</h3><p class="muted">One CalCup tee <b>+</b> a $12 prepaid food card &mdash; gear up and fuel up in one.</p></div><div class="sk-price"><span class="sk-was">$32 value</span><span class="sk-now">$27</span><span class="sk-save">save 16%</span></div></div></section>';
    el.innerHTML='<section><p style="font-size:17px;max-width:760px">'+C.intro+'</p>'+(C.card?'<div class="callout" style="margin-top:10px"><b>'+C.card+'</b></div>':'')+'</section>'+
      merchHead+gearSec+'<div id="preorder-anchor"></div>'+teeSec+starterSec+merchExtras+foodSec;
    // The Netlify pre-order form stays static in concession.html (so Netlify detects it);
    // move it into place directly below the commemorative gear.
    var _pf=document.getElementById('preorder'), _anchor=document.getElementById('preorder-anchor');
    if(_pf&&_anchor){ _anchor.parentNode.replaceChild(_pf,_anchor); } else if(_anchor){ _anchor.parentNode.removeChild(_anchor); }
  }
  function renderConcessionTeaser(el){
    var C=D.concession; if(!C){el.innerHTML="";return;}
    var picks=(C.bundles||[]).slice(0,3).map(function(b){return '<span class="cteas-pick">'+b.n+' <b>'+b.p+'</b></span>';}).join("");
    el.innerHTML='<a class="cteas" href="concession.html"><span class="cteas-txt"><b>Hungry courtside?</b> Grab a bundle at the concession booth</span><span class="cteas-picks">'+picks+'</span><span class="cteas-cta">Full menu →</span></a>';
  }

  /* ---------- "You think you can ref?" quiz ---------- */
  // Corrections to flagged questions + extra questions so the 15-question quiz rotates from a larger pool.
  var QFIX=[
    { match:/7m throw is saved/i, q:{ q:"A 7-metre throw is saved by the keeper. The rebound falls to an attacking teammate who scores immediately. Valid?",
      a:["Goal — the save put the ball back in play","No — free throw to the defenders","Retake the 7-metre throw","7-metre throw again"], c:0, topic:"7m",
      why:"Goal. Once the ball has touched the goalkeeper (the save), the 7-metre restriction ends and the ball is live for everyone. A teammate may legally play the rebound and score. (Rule 14:6)" } },
    { match:/dribbles twice, then passes/i, q:{ q:"Passive-play forewarning shown. The team makes 3 passes, then a player dribbles twice and passes again. How many passes count toward the limit?",
      a:["4 — the dribble doesn't count, the next pass does","3 — the dribble cancels a pass","6 — dribbles count as passes","5"], c:0, topic:"passive",
      why:"4 passes. After the raised-arm warning a team has a limited number of passes to get a shot away. Dribbling is not a pass, so the two dribbles add nothing — but the pass after them is the 4th pass. (Rule 7:11)" } },
    { match:/hits a referee standing in front of goal/i, q:{ q:"A team is awarded a free throw. Can a goal be scored directly from it?",
      a:["Yes — a direct goal is allowed","No — a teammate must touch it first","Only from inside 9 metres","Only in the last minute"], c:0, topic:"procedure",
      why:"Yes — a goal may be scored directly from a free throw, provided the throw is taken correctly. (Rule 15)" } },
    { match:/red-carded together for fighting/i, q:{ q:"A player is disqualified (red card) for a serious foul. How does it affect the team on court?",
      a:["Down a player for 2 minutes, then a substitute may enter","The same player returns after 2 minutes","Down a player for the rest of the match","No effect — a straight substitution is allowed"], c:0, topic:"2min",
      why:"A disqualification carries a 2-minute team suspension: the team plays short for 2 minutes, after which a substitute may enter. The disqualified player takes no further part. (Rule 16:8)" } },
    { match:/simultaneously signals no-goal/i, q:{ q:"The two referees signal different sanctions for the same offence at the same moment. Which applies?",
      a:["The more severe of the two decisions","The court referee's, always","The goal referee's, always","Neither — the situation is replayed"], c:0, topic:"procedure",
      why:"When the two referees disagree on how severely to punish the same action, the more severe decision is applied. (Rule 17:7)" } },
    { match:/clearly inside the 9m line and scores/i, q:{ q:"A player receives on-court treatment during an injury interruption. What then applies to that player?",
      a:["Must leave the court and may return only after the team's 3rd attack","May stay on and play immediately","Is suspended for 2 minutes","Must sit out the rest of the half"], c:0, topic:"procedure",
      why:"A player treated on court during an injury stoppage must leave and can only re-enter after their team has completed its 3rd attack. (Rule 4:11)" } }
  ];
  var QUIZ_EXTRA=[
    { q:"A team attacks with a 7th court player and an empty net. It loses the ball, and an opponent shoots into the unguarded goal from their own half. Call?", a:["Goal — it counts","No goal — struck from own half","Goalkeeper throw to the empty-net team","Free throw"], c:0, topic:"other", why:"A goal into the unguarded net counts, even from a player's own half, provided no violation occurred in the process. (Rule 9:1)" },
    { q:"The final buzzer sounds while a 7-metre throw has been awarded but not yet taken. What happens?", a:["The 7-metre is still taken — time is prolonged for it","The match ends immediately","It carries over to the next period","No goal — too late"], c:0, topic:"clock", why:"Playing time is prolonged to allow a 7-metre throw (and its direct outcome) that was awarded before the buzzer. (Rule 2:5)" },
    { q:"A goalkeeper gains clear control of the ball inside the goal area, then steps out over the goal-area line still holding it. Call?", a:["Free throw to the opponents","Play on — legal","7-metre throw","Corner throw"], c:0, topic:"goalkeeper", why:"A goalkeeper may not leave the goal area with the ball under control — free throw to the opponents. (Rule 6:7b)" },
    { q:"A player is shown a blue card. What does it mean beyond a red card (disqualification)?", a:["Disqualification plus a written report to the authorities","An automatic two-match ban","A 4-minute team suspension","Only a final warning"], c:0, topic:"procedure", why:"A blue card is a disqualification accompanied by a written report; the disciplinary body then decides any further sanction. (Rule 8:10, 16:9)" },
    { q:"When may a team request its team time-out?", a:["Only while it is in possession of the ball","At any moment during play","Only when defending","Only in the second half"], c:0, topic:"procedure", why:"A team may request its team time-out only while in possession of the ball, by placing the green card on the timekeeper's table. (Rule 2:10)" },
    { q:"Passive-play forewarning is up. An attacker shoots on goal; the ball rebounds off the keeper straight back to the attacking team. The forewarning?", a:["Is cancelled — a shot on goal resets it; a fresh attack begins","Stays up and the pass count continues","Triggers an immediate free throw","Limits them to one more pass"], c:0, topic:"passive", why:"A genuine shot on goal ends the passive sequence; the raised-arm signal is cancelled, and on regaining the rebound a new attack begins. (Rule 7:11)" }
  ];
  function refQuizPool(base){
    var out=(base||[]).map(function(q){ for(var k=0;k<QFIX.length;k++){ if(QFIX[k].match.test(q.q)) return QFIX[k].q; } return q; });
    return out.concat(QUIZ_EXTRA);
  }
  // Standalone always-visible leaderboard (independent of playing the quiz).
  function renderQuizBoard(el){
    function esc(x){ return String(x).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
    function fmtMs(ms){ if(ms==null||isNaN(ms))return "—"; var s=ms/1000,m=Math.floor(s/60),sec=Math.floor(s%60),t=Math.floor((s*10)%10); return m+":"+("0"+sec).slice(-2)+"."+t; }
    function board(list){
      list=(list||[]).slice(0,15);
      if(!list.length) return '<div class="muted" style="font-size:13px;text-align:center">No scores yet — be the first to play!</div>';
      return '<table class="lb"><thead><tr><th>#</th><th style="text-align:left">Player</th><th>Score</th><th>Time</th></tr></thead><tbody>'+
        list.map(function(r,i){return '<tr><td>'+(i+1)+'</td><td class="lb-name">'+esc(r.name)+'</td><td>'+r.score+'/'+r.total+'</td><td>'+fmtMs(r.ms)+'</td></tr>';}).join("")+'</tbody></table>'+
        '<div class="muted" style="font-size:11px;text-align:center;margin-top:6px">Ranked by score, then fastest time.</div>';
    }
    el.innerHTML='<div class="quiz-lb-wrap"><div class="quiz-lb-h">Weekend leaderboard</div><div class="muted" style="font-size:13px;text-align:center">Loading&hellip;</div></div>';
    fetch("/.netlify/functions/leaderboard",{headers:{"Accept":"application/json"}}).then(function(r){return r.json();}).then(function(l){
      el.innerHTML='<div class="quiz-lb-wrap"><div class="quiz-lb-h">Weekend leaderboard</div>'+board(l)+'</div>';
    }).catch(function(){ el.innerHTML='<div class="quiz-lb-wrap"><div class="quiz-lb-h">Weekend leaderboard</div><div class="muted" style="font-size:13px;text-align:center">Leaderboard unavailable right now.</div></div>'; });
  }
  function renderRefQuiz(el){
    var Q=D.refQuiz; if(!Q||!Q.questions)return;
    var per=Q.perQuestion||5, POOL=refQuizPool(Q.questions), ROUND=Math.min(15,POOL.length);
    var API="/.netlify/functions/leaderboard", LKEY="calcup_refquiz_v1";
    var CLOSE=new Date("2027-02-01T12:00:00-08:00"); // leaderboard closes before the Sunday finals — adjust date if needed
    function boardOpen(){ return Date.now() < CLOSE.getTime(); }
    function esc(x){ return String(x).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
    function loadLocal(){ try{return JSON.parse(localStorage.getItem(LKEY)||"[]");}catch(e){return [];} }
    function saveLocal(rec){ try{var a=loadLocal(); a.push(rec); a.sort(function(x,y){return (y.score-x.score)||(x.ts-y.ts);}); localStorage.setItem(LKEY,JSON.stringify(a.slice(0,50)));}catch(e){} }
    function boardHTML(list,hl,live){
      list=(list||[]).slice(0,10);
      var tag=live?' <span class="lb-live">live</span>':'';
      var head='<div class="quiz-lb-h">Weekend leaderboard'+tag+'</div>';
      if(!list.length) return head+'<div class="muted" style="font-size:13px;text-align:center">No scores yet — be the first!</div>';
      return head+'<table class="lb"><thead><tr><th>#</th><th style="text-align:left">Player</th><th>Score</th><th>Time</th></tr></thead><tbody>'+
        list.map(function(r,i){return '<tr'+(hl&&r.id===hl?' class="me"':'')+'><td>'+(i+1)+'</td><td class="lb-name">'+esc(r.name)+'</td><td>'+r.score+'/'+r.total+'</td><td>'+fmtMs(r.ms)+'</td></tr>';}).join("")+'</tbody></table>'+
        '<div class="muted" style="font-size:11px;text-align:center;margin-top:6px">Ranked by score, then fastest time.</div>';
    }
    function getBoard(cb){ fetch(API,{headers:{"Accept":"application/json"}}).then(function(r){return r.json();}).then(function(l){cb(l,true);}).catch(function(){cb(loadLocal(),false);}); }
    function postBoard(rec,cb){ saveLocal(rec); if(!boardOpen()){ getBoard(cb); return; } fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(rec)}).then(function(r){return r.json();}).then(function(l){cb(l,true);}).catch(function(){cb(loadLocal(),false);}); }
    function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;} return a; }
    // Topic-balanced round draw: guarantee the on-court decisive calls (7m / 2-min / late-clock)
    // each round, then fill the remainder at random. Degrades gracefully if a topic is thin.
    function drawRound(pool){
      var MIN={"7m":3,"2min":3,"clock":2}, byTopic={}, used={}, chosen=[];
      pool.forEach(function(q,idx){ var t=(q&&q.topic)||"other"; (byTopic[t]=byTopic[t]||[]).push(idx); });
      Object.keys(MIN).forEach(function(t){ var ids=shuffle(byTopic[t]||[]);
        for(var k=0;k<MIN[t]&&k<ids.length&&chosen.length<ROUND;k++){ used[ids[k]]=true; chosen.push(ids[k]); } });
      var rest=shuffle(pool.map(function(_,idx){return idx;}).filter(function(idx){return !used[idx];}));
      for(var j=0;chosen.length<ROUND&&j<rest.length;j++) chosen.push(rest[j]);
      return shuffle(chosen).slice(0,ROUND).map(function(idx){return pool[idx];});
    }
    var name="", qs=[], i=0, score=0, timer=null, left=per, answered=false, qStartTs=0, qElapsedMs=0;
    function fmtMs(ms){ if(ms==null||isNaN(ms))return "—"; var s=ms/1000, m=Math.floor(s/60), sec=Math.floor(s%60), t=Math.floor((s*10)%10); return m+":"+("0"+sec).slice(-2)+"."+t; }
    function intro(){
      el.innerHTML='<div class="quiz quiz-intro"><div class="quiz-badge"><i class="ti ti-flag"></i></div>'+
        '<h2 style="margin:10px 0 4px">You think you can ref?</h2>'+
        '<p class="muted" style="max-width:520px;margin:0 auto 14px">'+ROUND+' questions &middot; <b>'+per+' seconds each</b>. Fast on purpose &mdash; no time to phone a friend. Add a nickname to join the weekend leaderboard.</p>'+
        '<div class="quiz-prize"><i class="ti ti-trophy"></i> Top the weekend leaderboard &rarr; win a <b>$50 concession gift card</b>. Board closes before the Sunday finals, so you can still shop.</div>'+
        (boardOpen()?'':'<div class="callout" style="margin:0 0 12px">The leaderboard is <b>closed</b> — winner announced at the concession booth. You can still play for fun!</div>')+
        '<input id="qname" class="quiz-name" maxlength="18" placeholder="Your nickname" autocomplete="off" spellcheck="false">'+
        '<div style="margin:14px 0"><button class="btn btn-pri btn-lg" id="qstart">Start the test</button></div>'+
        '<div class="quiz-lb-wrap" id="qlb"><div class="quiz-lb-h">Weekend leaderboard</div><div class="muted" style="font-size:13px;text-align:center">Loading…</div></div></div>';
      var inp=el.querySelector("#qname"); void inp; /* no autofocus — keeps the Refereeing page at the top */
      getBoard(function(l,live){ var w=el.querySelector("#qlb"); if(w)w.innerHTML=boardHTML(l,null,live); });
      function begin(){ name=((inp&&inp.value)||"Anon").trim().slice(0,18)||"Anon"; qElapsedMs=0;
        qs=drawRound(POOL).map(function(q){ var opts=shuffle(q.a.map(function(t,idx){return {t:t,ok:idx===q.c};})); return {q:q.q,opts:opts,why:q.why}; });
        i=0; score=0; show(); }
      el.querySelector("#qstart").addEventListener("click",begin);
      if(inp)inp.addEventListener("keydown",function(e){ if(e.key==="Enter")begin(); });
    }
    function show(){
      answered=false; left=per; qStartTs=Date.now(); var q=qs[i];
      var opts=q.opts.map(function(o,idx){return '<button class="quiz-opt" data-i="'+idx+'">'+esc(o.t)+'</button>';}).join("");
      el.innerHTML='<div class="quiz"><div class="quiz-top"><span class="quiz-count">Q '+(i+1)+' / '+qs.length+'</span><span class="quiz-score">Score '+score+'</span><span class="quiz-timer" id="qtimer">'+left+'</span></div>'+
        '<div class="quiz-bar"><div class="quiz-bar-in" id="qbar"></div></div>'+
        '<div class="quiz-q">'+esc(q.q)+'</div><div class="quiz-opts">'+opts+'</div><div class="quiz-fb" id="qfb"></div></div>';
      Array.prototype.forEach.call(el.querySelectorAll(".quiz-opt"),function(b){b.addEventListener("click",function(){choose(+b.getAttribute("data-i"));});});
      var bar=el.querySelector("#qbar"); if(bar){ bar.style.transition="none"; bar.style.width="100%"; void bar.offsetWidth; bar.style.transition="width "+per+"s linear"; bar.style.width="0%"; }
      clearInterval(timer); timer=setInterval(function(){ left--; var t=el.querySelector("#qtimer"); if(t)t.textContent=left; if(left<=0){clearInterval(timer); if(!answered)choose(-1);} },1000);
    }
    function choose(idx){
      if(answered)return; qElapsedMs+=Date.now()-qStartTs; answered=true; clearInterval(timer);
      var q=qs[i], ci=-1; q.opts.forEach(function(o,k){if(o.ok)ci=k;});
      Array.prototype.forEach.call(el.querySelectorAll(".quiz-opt"),function(b){var bi=+b.getAttribute("data-i"); b.disabled=true; if(bi===ci)b.classList.add("correct"); if(bi===idx&&idx!==ci)b.classList.add("wrong");});
      var ok=(idx===ci); if(ok)score++;
      var st=el.querySelector(".quiz-score"); if(st)st.textContent="Score "+score;
      el.querySelector("#qfb").innerHTML='<b>'+(ok?"Correct! ":(idx===-1?"Time&rsquo;s up! ":"Nope. "))+'</b>'+esc(q.why)+'<div class="muted" style="font-size:12px;margin-top:6px">Take your time — the clock is paused while you read.</div><div style="margin-top:10px"><button class="btn btn-pri" id="qnext">'+(i+1<qs.length?"Next &rarr;":"Finish")+'</button></div>';
      el.querySelector("#qnext").addEventListener("click",function(){ i++; if(i<qs.length)show(); else finish(); });
    }
    function finish(){
      var id=Date.now()+"-"+Math.floor(Math.random()*1e6), rec={id:id,name:name,score:score,total:qs.length,ms:qElapsedMs,ts:Date.now()};
      var r=score/qs.length, g=r>=0.86?["Certified referee","You could officiate the final."]:r>=0.6?["Table official","Strong rules knowledge."]:r>=0.33?["Rookie","Keep studying the rulebook."]:["Spectator","Best leave the whistle to the pros!"];
      el.innerHTML='<div class="quiz quiz-result"><div class="quiz-bigscore"><span class="bs-num">'+score+'</span> / '+qs.length+'</div><h2 style="margin:8px 0 2px">'+g[0]+'</h2><p class="muted" style="margin:0 0 8px">'+esc(name)+' &mdash; '+g[1]+'</p>'+
        '<div class="quiz-lb-wrap" id="qlb"><div class="quiz-lb-h">Weekend leaderboard</div><div class="muted" style="font-size:13px;text-align:center">Saving…</div></div>'+
        '<div style="margin-top:14px"><button class="btn btn-pri" id="qretry">Play again</button> <a class="btn btn-ghost" href="referees.html">Meet the real refs</a></div></div>';
      el.querySelector("#qretry").addEventListener("click",intro);
      postBoard(rec,function(l,live){ var w=el.querySelector("#qlb"); if(w)w.innerHTML=boardHTML(l,id,live); });
    }
    intro();
  }

  /* ---------- hero photo backgrounds (graceful: navy stays if photo missing) ---------- */
  function applyHeroPhotos() {
    var el = document.querySelector("[data-hero]");
    if (!el) return;
    var base = el.getAttribute("data-hero").replace(/\.[^.]+$/, "");
    var exts = ["jpg", "jpeg", "png"], i = 0;
    var layer = document.createElement("div");
    layer.className = "page-photo";
    document.body.appendChild(layer);
    (function tryNext() {
      if (i >= exts.length) return;
      var src = "assets/photos/" + base + "." + exts[i++];
      var img = new Image();
      img.onload = function () {
        layer.style.backgroundImage = "linear-gradient(rgba(246,248,250,.78), rgba(246,248,250,.82)), url('" + src + "')";
      };
      img.onerror = tryNext;
      img.src = src;
    })();
  }

  function init() {
    renderNav();          // top nav from SECTIONS (every page)
    renderExplore();      // home "Explore" grid from the same SECTIONS
    setupZoom();          // click-to-zoom product images
    var b = document.getElementById("burger");
    if (b) b.addEventListener("click", function () { document.getElementById("menu").classList.toggle("open"); });

    // home
    var f = featured(); if (document.getElementById("featured") && f) set("featured", gameCardHTML(f));
    if (document.getElementById("top-m")) set("top-m", leaderHTML(topScorers("M", 5)));
    if (document.getElementById("top-w")) set("top-w", leaderHTML(topScorers("W", 5)));
    if (document.getElementById("sched-preview")) {
      var now = new Date();
      // Next two games that haven't started yet by the actual date & time — excludes any game currently live.
      var upcoming = chronSorted().filter(function (g) { var d = gameDate(g); return d ? d > now : true; });
      var next = upcoming.slice(0, 2);
      if (!next.length) next = chronSorted().slice(-2);
      set("sched-preview", previewRows(next));
    }

    // standings
    var MEN_Q = [{t:"Championship · 1st/2nd place final",c:true},{t:"Plays 3rd/4th place",c:false},{t:"Plays 5th/6th place",c:false},{t:"Plays 7th/8th place",c:false}];
    var WOMEN_Q = [{t:"Championship · 1st/2nd place final",c:true},{t:"Championship · 1st/2nd place final",c:true},{t:"Plays 3rd/4th place",c:false},{t:"Plays 3rd/4th place",c:false}];
    if (document.getElementById("tbl-ma")) set("tbl-ma", tableHTML("M", "A", MEN_Q));
    if (document.getElementById("tbl-mb")) set("tbl-mb", tableHTML("M", "B", MEN_Q));
    if (document.getElementById("tbl-w")) set("tbl-w", tableHTML("W", "W", WOMEN_Q));

    // scorers (full)
    if (document.getElementById("scorers-m")) set("scorers-m", leaderHTML(topScorers("M")));
    if (document.getElementById("scorers-w")) set("scorers-w", leaderHTML(topScorers("W")));

    // schedule
    var sc = document.getElementById("schedule"); if (sc) renderSchedule(sc);
    document.querySelectorAll("[data-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (x) { x.classList.toggle("on", x === btn); });
        document.querySelectorAll(".grow").forEach(function (r) {
          r.style.display = (f === "all" || r.getAttribute("data-div") === f) ? "" : "none";
        });
        document.querySelectorAll(".dayblock").forEach(function (db) {
          var any = Array.prototype.some.call(db.querySelectorAll(".grow"), function (r) { return r.style.display !== "none"; });
          db.style.display = any ? "" : "none";
        });
      });
    });

    // teams / referees / sponsors / history
    var td = document.getElementById("teams-dir"); if (td) renderTeamsDirectory(td);
    var tdet = document.getElementById("team-detail"); if (tdet) renderTeamDetail(tdet);
    var rfp = document.getElementById("referees"); if (rfp) renderReferees(rfp);
    var spn = document.getElementById("sponsors"); if (spn) renderSponsors(spn);
    var his = document.getElementById("history"); if (his) renderHistory(his);
    var phy = document.getElementById("physio"); if (phy) renderPhysio(phy);
    var prs = document.getElementById("press"); if (prs) renderPress(prs);
    var lot = document.getElementById("lottery"); if (lot) renderLottery(lot);
    var cot = document.getElementById("concession-teaser"); if (cot) renderConcessionTeaser(cot);
    var con = document.getElementById("concession"); if (con) renderConcession(con);
    var rq = document.getElementById("refquiz"); if (rq) renderRefQuiz(rq);
    var qlb = document.getElementById("quiz-leaderboard"); if (qlb) renderQuizBoard(qlb);
    applyHeroPhotos();

    // watch
    var w = document.getElementById("watch"); if (w) renderWatch(w);
    var sb = document.getElementById("stream-btn"); if (sb && M.streamUrl) sb.setAttribute("href", M.streamUrl);
  }
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
