// CalCup site generator: master workbook -> site/data/data.js
// Modes: --local <xlsx> (dev/test) | default reads Microsoft Graph (prod, env creds)
import {readFileSync,writeFileSync} from "fs";
import {createHash} from "crypto";
import * as M from "./mapper.mjs";
const SHEETS=["Teams Master","Games Schedule","Standings Engine","Individuals Stats Men","Individuals Stats Women","Referees Master"];
// Validation mode. VALIDATE_MODE=strict|permissive overrides.
// Auto: strict inside the tournament window, permissive the rest of the year.
const STRICT_FROM  = Date.UTC(2027, 0, 15);  // Jan 15 2027, roster lock
const STRICT_UNTIL = Date.UTC(2027, 1,  5);  // Feb  5 2027, post-event wrap
function resolveMode(){
  const forced=String(process.env.VALIDATE_MODE||"").trim().toLowerCase();
  if(forced==="strict"||forced==="permissive") return forced;
  const t=Date.now();
  return (t>=STRICT_FROM && t<=STRICT_UNTIL) ? "strict" : "permissive";
}
// In permissive mode a structurally empty section must not overwrite good data
// already in data.js. Applies to standings, games and referees only. Scorers are
// deliberately excluded: an empty scorers list is correct before the first game.
function keep(next, prev){
  const isEmpty = next==null
    || (Array.isArray(next) && next.length===0)
    || (!Array.isArray(next) && typeof next==="object" && Object.keys(next).length===0);
  return isEmpty && prev!=null ? prev : next;
}
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
// Push the private voter list (names, emails, roles, eligible players, deadline) to the
// voting function. Runs on every generator run so the function always mirrors the workbook.
// Never blocks the site deploy: any failure is a warning only.
async function syncVoters(voting){
  const url=process.env.VOTE_SYNC_URL, tok=process.env.VOTE_SYNC_TOKEN;
  if(!voting||!url||!tok){ console.log("Voter sync skipped (no VOTE_SYNC_URL / VOTE_SYNC_TOKEN)."); return; }
  try{
    const r=await fetch(url+(url.indexOf("?")<0?"?":"&")+"op=sync",{method:"POST",
      headers:{"Content-Type":"application/json","x-sync-token":tok},body:JSON.stringify(voting.private)});
    const t=await r.text();
    if(!r.ok) console.warn("Voter sync failed: "+r.status+" "+t.slice(0,200));
    else console.log("Voter sync ok: "+t.slice(0,200));
    if(voting.private.missingEmail.length) console.warn("VOTERS WITHOUT EMAIL (cannot sign in): "+voting.private.missingEmail.join(", "));
  }catch(e){ console.warn("Voter sync error: "+e.message); }
}
async function getSheets(names){
  const li=process.argv.indexOf("--local");
  if(li>=0){ const {readLocal}=await import("./readLocal.mjs"); return readLocal(process.argv[li+1],names); }
  const {readGraph}=await import("./graph.mjs"); return readGraph(names);
}
(async()=>{
  const DATAJS=process.env.DATA_JS||"../site/data/data.js";
  const base=loadBase(DATAJS);
  const sheets=await getSheets(SHEETS);
  // Rosters live on an optional tab. Read separately so a missing or renamed tab never aborts the deploy.
  try{ Object.assign(sheets, await getSheets(["Rosters Master"])); }
  catch(e){ console.warn("Rosters Master not read, keeping existing rosters:", e.message); }
  // Voters Master gives the MVP Voting row order for the vote export. Optional tab.
  try{ Object.assign(sheets, await getSheets(["Voters Master"])); }
  catch(e){ console.warn("Voters Master not read, vote export falls back to voter list order:", e.message); }
  // Registration list for the public "Registered teams" page. Optional tab, same safety as rosters.
  try{ Object.assign(sheets, await getSheets(["Registration 2027"])); }
  catch(e){ console.warn("Registration 2027 not read, keeping existing registration list:", e.message); }
  const model={
    teams: M.mapTeams(sheets), games: M.mapGames(sheets),
    standings: M.mapStandings(sheets), scorers: M.mapScorers(sheets), referees: M.mapReferees(sheets),
    rosters: M.mapRosters(sheets),
    registration: M.mapRegistration(sheets)
  };
  // Voting: public block (deadline) goes into data.js; voter emails go only to the voting function.
  let voting=null;
  try{ voting=M.mapVoting(sheets, model.teams); }
  catch(e){ console.warn("Voting data not built, keeping existing voting block:", e.message); }
  const audit=M.auditTeams(sheets);
  const {mode,errors,warnings}=M.validate(model,{mode:resolveMode(), audit});
  if(warnings.length){
    console.warn("VALIDATION WARNINGS ("+mode+" mode, not blocking):\n - "+warnings.join("\n - "));
  }
  if(errors.length){
    console.error("VALIDATION FAILED ("+mode+" mode), deploy aborted:\n - "+errors.join("\n - "));
    process.exit(2);
  }
  console.log("Validation passed in "+mode+" mode. warnings="+warnings.length);
  // merge into base (preserve static sections + team city/logo)
  const out=Object.assign({}, base);
  out.teams=mergeTeams(base.teams, model.teams);
  out.games=keep(model.games, base.games);
  out.referees=keep(model.referees, base.referees);
  out.standings=keep(model.standings, base.standings);
  out.scorers=model.scorers;
  if(model.rosters) out.rosters=model.rosters;
  if(model.registration) out.registration=model.registration;
  if(voting) out.voting=voting.public;
  await syncVoters(voting);
  const header="/* AUTO-GENERATED from 2027_Calcup Master File.xlsx. Do not edit by hand. */\n";
  const body="window.CALCUP = "+JSON.stringify(out,null,2)+";\n";
  const next=header+body;
  const prev=(()=>{try{return readFileSync(DATAJS,"utf8");}catch(e){return "";}})();
  const h=x=>createHash("sha1").update(x.replace(/^\/\*.*\*\/\n/,"")).digest("hex");
  if(h(prev)===h(next)){ console.log("No data change, skipping deploy."); writeFileSync(process.env.CHANGED_FLAG||"/tmp/changed","0"); process.exit(0); }
  writeFileSync(DATAJS,next);
  writeFileSync(process.env.CHANGED_FLAG||"/tmp/changed","1");
  console.log("data.js regenerated. teams="+out.teams.length+" games="+out.games.length+" scorersM="+model.scorers.M.length+" scorersW="+model.scorers.W.length);
})().catch(e=>{ console.error("GENERATOR ERROR:",e.message); process.exit(1); });
