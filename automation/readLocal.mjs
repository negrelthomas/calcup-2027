import * as XLSX from "xlsx"; import {readFileSync} from "fs";
export function readLocal(path, sheetNames){
  const wb=XLSX.read(readFileSync(path),{cellDates:false});
  const out={};
  for(const n of sheetNames){ if(!wb.Sheets[n]) throw new Error("missing sheet: "+n);
    out[n]=XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,blankrows:false,defval:null,raw:true}); }
  return out;
}
