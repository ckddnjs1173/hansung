import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath=path.join(process.cwd(),"data","local","hansung.sqlite");
const phase2Schema=path.join(process.cwd(),"database","phase2.sql");
if(!fs.existsSync(dbPath)){console.error("로컬 DB가 없습니다.");process.exit(1);}
const db=new DatabaseSync(dbPath);
try{
  if(fs.existsSync(phase2Schema)) db.exec(fs.readFileSync(phase2Schema,"utf8"));
  const legacyCount=Number(db.prepare("SELECT COUNT(*) count FROM substitute_profiles").get()?.count??0);
  if(!legacyCount){console.log("이전할 기존 대체인력 데이터가 없습니다.");process.exit(0);}
  const already=Number(db.prepare("SELECT COUNT(*) count FROM app_substitute_people WHERE legacy_worker_key IS NOT NULL").get()?.count??0);
  if(already){console.log(`기존 대체인력 ${already}명이 이미 이전되어 있습니다. 중복 이전하지 않습니다.`);process.exit(0);}
  db.exec("BEGIN");
  const profiles=db.prepare("SELECT worker_key,name,phone,experience_type,note FROM substitute_profiles ORDER BY id").all();
  for(const p of profiles){db.prepare(`INSERT OR IGNORE INTO app_substitute_people(name,phone,experience_type,status,note,legacy_worker_key) VALUES(?,?,?,?,?,?)`).run(p.name,p.phone??null,p.experience_type??null,"활동",p.note??"기존 대체인력 DB 1회 이전",p.worker_key);}
  const people=new Map(db.prepare("SELECT id,legacy_worker_key FROM app_substitute_people WHERE legacy_worker_key IS NOT NULL").all().map(r=>[String(r.legacy_worker_key),Number(r.id)]));
  const sites=db.prepare("SELECT id,name FROM app_sites").all();
  const jobs=db.prepare("SELECT id,name FROM app_jobs").all();
  const siteMap=new Map(sites.map(r=>[String(r.name),Number(r.id)]));
  const jobMap=new Map(jobs.map(r=>[String(r.name),Number(r.id)]));
  const history=db.prepare("SELECT worker_key,work_date,work_type,site_name,department,hours FROM substitute_work_history WHERE work_date IS NOT NULL ORDER BY id").all();
  let historyCount=0;
  for(const h of history){const substituteId=people.get(String(h.worker_key));if(!substituteId)continue;const siteId=siteMap.get(String(h.site_name??""))??null;const jobId=jobMap.get(String(h.department??""))??jobMap.get(String(h.work_type??""))??null;db.prepare(`INSERT INTO app_substitute_work_history(substitute_id,site_id,job_id,work_date,hours,note) VALUES(?,?,?,?,?,?)`).run(substituteId,siteId,jobId,String(h.work_date),h.hours??null,"기존 대체근무 이력 1회 이전");historyCount++;}
  db.prepare("INSERT INTO app_audit_logs(action,entity_type,summary) VALUES('migrate','phase2',?)").run(`대체인력 ${profiles.length}명, 과거 근무이력 ${historyCount}건 1회 이전`);
  db.exec("COMMIT");
  console.log(`완료: 대체인력 ${profiles.length}명 / 과거 근무이력 ${historyCount}건`);
  console.log("연차는 원본 구조의 날짜 정규화가 검증되지 않아 자동 이전하지 않습니다. 현재 잔액은 프로그램에서 조정 항목으로 시작값을 입력하세요.");
}catch(error){try{db.exec("ROLLBACK");}catch{}console.error(error);process.exitCode=1;}finally{db.close();}
