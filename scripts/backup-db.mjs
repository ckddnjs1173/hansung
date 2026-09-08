import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const root=process.cwd();
const dbPath=path.join(root,"data","local","hansung.sqlite");
if(!fs.existsSync(dbPath)){console.error("백업할 로컬 DB가 없습니다.");process.exit(1);}
const backupDir=path.join(root,"data","backups");
fs.mkdirSync(backupDir,{recursive:true});
const stamp=new Date().toISOString().replaceAll(":","-").replace(".","-");
const target=path.join(backupDir,`hansung-${stamp}.sqlite`);
const db=new DatabaseSync(dbPath);
try{db.exec(`VACUUM INTO '${target.replaceAll("'","''")}'`);}finally{db.close();}
console.log(`백업 완료: ${target}`);
