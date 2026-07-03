// Production reader: Microsoft Graph (app-only). Returns { "Sheet": rows[][] } like readLocal.
const G="https://graph.microsoft.com/v1.0";
async function token(){
  const {TENANT_ID,CLIENT_ID,CLIENT_SECRET}=process.env;
  const r=await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({client_id:CLIENT_ID,client_secret:CLIENT_SECRET,scope:"https://graph.microsoft.com/.default",grant_type:"client_credentials"})});
  if(!r.ok) throw new Error("token: "+r.status+" "+await r.text());
  return (await r.json()).access_token;
}
async function gget(tok,url){ const r=await fetch(G+url,{headers:{Authorization:"Bearer "+tok}}); if(!r.ok) throw new Error("GET "+url+" -> "+r.status+" "+await r.text()); return r.json(); }
export async function readGraph(sheetNames){
  const {SP_HOST,SP_SITE_PATH,SP_LIBRARY,SP_FILE}=process.env; // e.g. tenfinancialconsulting.sharepoint.com, /sites/Calcup, Calcup, 2027_Calcup Master File.xlsx
  const tok=await token();
  const site=await gget(tok,`/sites/${SP_HOST}:${SP_SITE_PATH}`);
  const drives=await gget(tok,`/sites/${site.id}/drives`);
  const drive=drives.value.find(d=>d.name===SP_LIBRARY)||drives.value[0];
  const item=await gget(tok,`/drives/${drive.id}/root:/${encodeURIComponent(SP_FILE)}`);
  const out={};
  for(const n of sheetNames){
    const ur=await gget(tok,`/drives/${drive.id}/items/${item.id}/workbook/worksheets('${encodeURIComponent(n)}')/usedRange(valuesOnly=true)?$select=values`);
    out[n]=ur.values||[];
  }
  return out;
}
