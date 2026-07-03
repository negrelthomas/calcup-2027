// CalCup site generator: master workbook -> site/data/data.js
// Modes: --local <xlsx> (dev/test) | default reads Microsoft Graph (prod, env creds)
import {readFileSync,writeFileSync} from "fs";
import {createHash} from "crypto";
import * as M from "./mapper.mjs";
const SHEETS=["Teams Master","Games Schedule","Standings Engine","Individuals Stats Men","Individuals Stats Women","Referees Master"];

function loadBase(dataJsPath){ // eval current data.js to get the static-content base
  const src=readFileSync(dataJsPath,"utf8");
  const win={}; new Function("window",src)(win); return win.CALCUP||{};
}
function mergeTeams(base, mapped){
  const byId={}; (base||[]).forEach(t=>byId[t.id]=t);
  return mapped.map(m=>{ const b=byId[m.id]||{}; return {
    id:m.id, name:m.name, city:b.city||"", division:m.division, group:m.group, logo:"",
    jersey:b.jersey||null, jerseyKit:m.jersey }; });
}
async function getSheets(){
  const li=process.argv.indexOf("--local");
  if(li>=0){ const {readLocal}=await import("./readLocal.mjs"); return readLocal(process.argv[li+1],SHEETS); }
  const {readGraph}=await import("./graph.mjs"); return readGraph(SHEETS);
}
(async()=>{
  const DATAJS=process.env.DATA_JS||"../site/data/data.js";
  const base=loadBase(DATAJS);
  const sheets=await getSheets();
  const model={
    teams: M.mapTeams(sheets), games: M.mapGames(sheets),
    standings: M.mapStandings(sheets), scorers: M.mapScorers(sheets), referees: M.mapReferees(sheets)
  };
  const errs=M.validate(model);
  if(errs.length){ console.error("VALIDATION FAILED — deploy aborted:\n - "+errs.join("\n - ")); process.exit(2); }
  // merge into base (preserve static sections + team city/logo)
  const out=Object.assign({}, base);
  out.teams=mergeTeams(base.teams, model.teams);
  out.games=model.games; out.referees=model.referees;
  out.standings=model.standings; out.scorers=model.scorers;
  const header="/* AUTO-GENERATED from 2027_Calcup Master File.xlsx — do not edit by hand. */\n";
  const body="window.CALCUP = "+JSON.stringify(out,null,2)+";\n";
  const next=header+body;
  const prev=(()=>{try{return readFileSync(DATAJS,"utf8");}catch(e){return "";}})();
  const h=x=>createHash("sha1").update(x.replace(/^\/\*.*\*\/\n/,"")).digest("hex");
  if(h(prev)===h(next)){ console.log("No data change — skipping deploy."); writeFileSync(process.env.CHANGED_FLAG||"/tmp/changed","0"); process.exit(0); }
  writeFileSync(DATAJS,next);
  writeFileSync(process.env.CHANGED_FLAG||"/tmp/changed","1");
  console.log("data.js regenerated. teams="+out.teams.length+" games="+out.games.length+" scorersM="+model.scorers.M.length+" scorersW="+model.scorers.W.length);
})().catch(e=>{ console.error("GENERATOR ERROR:",e.message); process.exit(1); });
