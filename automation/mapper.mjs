// Pure mapping: master workbook rows -> CALCUP dynamic sections. Reader-agnostic.
// Input: sheets = { "Sheet Name": rows[][] } (row 0 may be junk; we find header by name)
const TEAM_ID = {
  "Calheat":"ch-orange","Boston TH":"boston","Seattle":"seattle","LATHC":"lathc",
  "Denver Wolves":"denver","San Diego M":"sd-m","Calheat U21":"ch-blue","West Point - Army M":"army-m",
  "Calheat W":"ch-w","Massif SLC":"massif","NYC":"nyc","San Diego W":"sd-w","West Point - Army W":"army-w"
};
const idOf = (name) => TEAM_ID[String(name||"").trim()] || null;
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function findHeader(rows, must){ // returns {r, idx:{headerName:colIndex}}
  for(let r=0;r<Math.min(rows.length,8);r++){
    const row=(rows[r]||[]).map(c=>String(c==null?"":c).trim());
    if(must.every(m=>row.includes(m))){
      const idx={}; row.forEach((h,i)=>{ if(h) idx[h]=i; }); return {r, idx};
    }
  }
  throw new Error("header not found; need: "+must.join(", "));
}
const val=(row,idx,name)=> (idx[name]==null?null:row[idx[name]]);

function fmtTime(v){
  if(v==null||v==="") return "";
  if(typeof v==="number"){ var frac=v-Math.floor(v); var mins=Math.round(frac*1440); var h=Math.floor(mins/60), m=mins%60; var ap=h<12?"AM":"PM"; var hh=h%12; if(hh===0)hh=12; return hh+":"+String(m).padStart(2,"0")+" "+ap; }
  var s=String(v).trim(); var mt=s.match(/(\d{1,2}):(\d{2})/); if(mt){ var H=+mt[1],M=+mt[2]; var ap2=H<12?"AM":"PM"; var HH=H%12; if(HH===0)HH=12; return HH+":"+String(M).padStart(2,"0")+" "+ap2; }
  return s;
}
function excelDate(v){ if(typeof v==="number") return new Date(Date.UTC(1899,11,30)+Math.round(v)*86400000); var d=new Date(v); return isNaN(d)?null:d; }
function dayOf(v){ var d=excelDate(v); return d?(DAYS[d.getUTCDay()]||""):""; }

export function mapTeams(sheets){
  const rows=sheets["Teams Master"]; const {r,idx}=findHeader(rows,["TeamID","Short Name","Division","Group Code"]);
  const out=[];
  for(let i=r+1;i<rows.length;i++){ const row=rows[i]||[]; const short=val(row,idx,"Short Name"); if(!short) continue;
    const id=idOf(short); if(!id) continue;
    out.push({ id, name:String(short).trim(),
      division: String(val(row,idx,"Division")||"").startsWith("W")?"W":"M",
      group: String(val(row,idx,"Group Code")||"").trim().charAt(0),
      jersey: { home:String(val(row,idx,"Jersey Color Home")||"").trim(), away:String(val(row,idx,"Jersey Color Away")||"").trim() } });
  }
  return out;
}

export function mapGames(sheets){
  const rows=sheets["Games Schedule"]; const {r,idx}=findHeader(rows,["Game #","NameTeam A","NameTeam B","Score Team A"]);
  const out=[];
  for(let i=r+1;i<rows.length;i++){ const row=rows[i]||[]; const no=val(row,idx,"Game #");
    if(no==null||no==="" || isNaN(Number(no))) continue;
    const division=String(val(row,idx,"Div.")||"").trim(); if(!division) continue;  // skip helper/junk rows
    const nameA=val(row,idx,"NameTeam A"), nameB=val(row,idx,"NameTeam B");
    const sA=val(row,idx,"Score Team A"), sB=val(row,idx,"Score Team B");
    const played = sA!=null&&sA!==""&&sB!=null&&sB!=="";
    out.push({
      no:Number(no), day:dayOf(val(row,idx,"Date")), time:fmtTime(val(row,idx,"Game time")), court:1,
      division:division, group:String(val(row,idx,"Gr.")||"").trim(),
      teamA: idOf(nameA)||("tbd-"+String(val(row,idx,"Code Team A")||no).toLowerCase()),
      teamB: idOf(nameB)||("tbd-"+String(val(row,idx,"Code Team B")||no).toLowerCase()),
      scoreA: played?Number(sA):null, scoreB: played?Number(sB):null,
      status: played?"final":"upcoming",
      refs: String(val(row,idx,"Referees")||"").trim(),
      table: [val(row,idx,"Time Keeper"), val(row,idx,"Score Keeper")].filter(Boolean).map(String),
      jA: String(val(row,idx,"Jersey Color Team A")||"").trim(),
      jB: String(val(row,idx,"Jersey Color Team B")||"").trim()
    });
  }
  return out;
}

export function mapStandings(sheets){
  const rows=sheets["Standings Engine"]; const {r,idx}=findHeader(rows,["Team","Group","Pts","GF","GA","GD"]);
  const rankIdx = idx["RankInGrp"];
  const byGrp={};
  for(let i=r+1;i<rows.length;i++){ const row=rows[i]||[]; const team=val(row,idx,"Team"); if(!team) continue;
    const g=String(val(row,idx,"Group")||"").trim(); if(!g) continue;
    (byGrp[g]=byGrp[g]||[]).push({ id:idOf(team), name:String(team).trim(), group:g,
      pts:Number(val(row,idx,"Pts"))||0, gf:Number(val(row,idx,"GF"))||0, ga:Number(val(row,idx,"GA"))||0,
      gd:Number(val(row,idx,"GD"))||0, rank: rankIdx!=null?Number(row[rankIdx])||99:99 });
  }
  for(const g in byGrp) byGrp[g].sort((a,b)=>a.rank-b.rank);
  return byGrp;
}

function mapScorerSheet(rows){
  const {r,idx}=findHeader(rows,["Team","First Name","Last Name"]);
  const totName = idx["Total Goals"]!=null ? "Total Goals" : "Total";
  const out=[];
  for(let i=r+1;i<rows.length;i++){ const row=rows[i]||[]; const tot=val(row,idx,totName);
    const team=val(row,idx,"Team"); const fn=val(row,idx,"First Name"), ln=val(row,idx,"Last Name");
    if(!team||(!fn&&!ln)) continue; const goals=Number(tot)||0; if(goals<=0) continue;
    out.push({ player:(String(fn||"").trim()+" "+String(ln||"").trim()).trim(), team:idOf(team)||String(team).trim(), goals });
  }
  return out.sort((a,b)=>b.goals-a.goals);
}
export function mapScorers(sheets){ return { M: mapScorerSheet(sheets["Individuals Stats Men"]), W: mapScorerSheet(sheets["Individuals Stats Women"]) }; }

export function mapReferees(sheets){
  const rows=sheets["Referees Master"]; const {r,idx}=findHeader(rows,["Pair #","Referee 1","Referee 2"]);
  const pairs={};
  for(let i=r+1;i<rows.length;i++){ const row=rows[i]||[]; const p=val(row,idx,"Pair #"); if(p==null||p==="") continue;
    if(!pairs[p]) pairs[p]={ id:"r"+p, refs:[String(val(row,idx,"Referee 1")||"TBD").trim(), String(val(row,idx,"Referee 2")||"TBD").trim()], country:"USA", bio:"USATH-certified referee pair." };
  }
  return Object.keys(pairs).sort().map(k=>pairs[k]);
}

// Rosters Master tab: one row per person. Columns: Team, Type (Player/Official),
// Jersey, First Name, Last Name, Position, Role / Official. Players first, officials after.
export function mapRosters(sheets){
  const rows=sheets["Rosters Master"]; if(!rows||!rows.length) return null;
  let hdr; try{ hdr=findHeader(rows,["Team","Type","First Name","Last Name"]); }catch(e){ return null; }
  const {r,idx}=hdr;
  const roleName = idx["Role / Official"]!=null ? "Role / Official" : (idx["Role"]!=null ? "Role" : null);
  const out={};
  for(let i=r+1;i<rows.length;i++){ const row=rows[i]||[];
    const id=idOf(val(row,idx,"Team")); if(!id) continue;
    const fn=String(val(row,idx,"First Name")||"").trim(), ln=String(val(row,idx,"Last Name")||"").trim();
    if(!fn && !ln) continue;
    const isOfficial=String(val(row,idx,"Type")||"").trim().toLowerCase().indexOf("official")===0;
    const jv=val(row,idx,"Jersey"); const num=(jv==null||jv==="")?null:(isNaN(Number(jv))?String(jv).trim():Number(jv));
    (out[id]=out[id]||[]).push({
      name:(fn+" "+ln).trim(),
      n: isOfficial?null:num,
      pos: isOfficial ? (roleName?String(val(row,idx,roleName)||"").trim():"Official") : String(val(row,idx,"Position")||"").trim(),
      official: isOfficial
    });
  }
  Object.keys(out).forEach(function(id){ out[id].sort(function(a,b){ if(a.official!==b.official) return a.official?1:-1; var an=a.n==null?999:Number(a.n), bn=b.n==null?999:Number(b.n); return an-bn; }); });
  return Object.keys(out).length?out:null;
}

export function validate(model){
  const e=[];
  if(!model.teams || model.teams.length!==13) e.push("teams != 13 (got "+(model.teams||[]).length+")");
  if(!model.games || model.games.length<20) e.push("games < 20 (got "+(model.games||[]).length+")");
  model.games.forEach(g=>{ if(!g.teamA||!g.teamB) e.push("game "+g.no+" missing team"); });
  const grp=model.standings||{}; ["A","B","W"].forEach(g=>{ if(!grp[g]||!grp[g].length) e.push("standings group "+g+" empty"); });
  if(!model.scorers || !model.scorers.M || !model.scorers.W) e.push("scorers missing");
  if(!model.referees || model.referees.length<3) e.push("referees < 3");
  return e;
}
