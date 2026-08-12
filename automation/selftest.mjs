import * as M from "./mapper.mjs";
const TEAMS = ["Calheat","Boston TH","Seattle","LATHC","Denver Wolves","San Diego M","Calheat U21",
  "West Point - Army M","Calheat W","Massif SLC","NYC","San Diego W","West Point - Army W"];
function teamsSheet(names){
  const rows=[["junk"],["TeamID","Short Name","Division","Group Code","Jersey Color Home","Jersey Color Away"]];
  names.forEach((n,i)=>rows.push(["T"+i,n,(i>=8?"W":"M"),(i%2?"B":"A"),"orange","white"]));
  return rows;
}
function gamesSheet(n){
  const rows=[["Game #","Div.","Gr.","Date","Game time","NameTeam A","NameTeam B","Score Team A","Score Team B","Code Team A","Code Team B","Referees","Time Keeper","Score Keeper","Jersey Color Team A","Jersey Color Team B"]];
  for(let i=1;i<=n;i++) rows.push([i,"M","A",46416,0.5,"Calheat","Seattle","","", "CH","SE","r1","tk","sk","orange","white"]);
  return rows;
}
function standingsSheet(groups){
  const rows=[["Team","Group","Pts","GF","GA","GD","RankInGrp"]];
  groups.forEach(g=>rows.push(["Calheat",g,0,0,0,0,1]));
  return rows;
}
const scorers=[["Team","First Name","Last Name","Total Goals"]];
const refsSheet=(n)=>{const r=[["Pair #","Referee 1","Referee 2"]];for(let i=1;i<=n;i++)r.push([i,"A"+i,"B"+i]);return r;};
function build(teamNames,{games=24,groups=["A","B","W"],refs=4}={}){
  return {
    "Teams Master":teamsSheet(teamNames), "Games Schedule":gamesSheet(games),
    "Standings Engine":standingsSheet(groups), "Individuals Stats Men":scorers,
    "Individuals Stats Women":scorers, "Referees Master":refsSheet(refs)
  };
}
function run(label, sheets, mode){
  const model={teams:M.mapTeams(sheets),games:M.mapGames(sheets),standings:M.mapStandings(sheets),
    scorers:M.mapScorers(sheets),referees:M.mapReferees(sheets),rosters:null};
  const res=M.validate(model,{mode,audit:M.auditTeams(sheets)});
  console.log("\n=== "+label+" ["+mode+"] -> exit "+(res.errors.length?2:0)+" ===");
  res.errors.forEach(e=>console.log("  ERROR   "+e));
  res.warnings.forEach(w=>console.log("  warning "+w));
  if(!res.errors.length && !res.warnings.length) console.log("  clean");
  return res.errors.length?2:0;
}
const A=build(TEAMS);
run("A healthy workbook", A, "permissive");
run("A healthy workbook", A, "strict");
const renamed=TEAMS.slice(); renamed[1]="Boston Team Handball";
const B=build(renamed);
run("B Boston TH renamed in workbook", B, "permissive");
run("B Boston TH renamed in workbook", B, "strict");
const C=build(TEAMS.slice(0,11));
run("C roster cut to 11 teams", C, "permissive");
run("C roster cut to 11 teams", C, "strict");
const D=build(TEAMS.concat(["Seattle"]));
run("D duplicate Seattle row", D, "permissive");
run("D duplicate Seattle row", D, "strict");
