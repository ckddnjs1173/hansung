import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath=path.join(process.cwd(),"data","local","hansung.sqlite");
const schemaPath=path.join(process.cwd(),"database","schema.sql");
if(!fs.existsSync(dbPath)){console.error("로컬 DB가 없습니다. 기존 실제 데이터 DB가 있는 PC에서만 실행하세요.");process.exit(1);}
const db=new DatabaseSync(dbPath);
try{
  db.exec(fs.readFileSync(schemaPath,"utf8"));
  const existing=Number(db.prepare("SELECT COUNT(*) count FROM app_workers").get()?.count??0);
  if(existing>0){console.log(`운영 데이터가 이미 ${existing}명 존재합니다. 중복 방지를 위해 이전을 건너뜁니다.`);process.exit(0);}
  db.exec("BEGIN");
  const workers=db.prepare("SELECT id,employee_no,name,birth_date,phone,status,joined_at,left_at FROM workers ORDER BY id").all();
  const sites=db.prepare("SELECT id,name,division,address,manager_name FROM sites ORDER BY id").all();
  const assignments=db.prepare("SELECT worker_id,site_id,job_name,status FROM assignments ORDER BY id").all();
  const jobNames=new Set(assignments.map(r=>String(r.job_name??"").trim()).filter(Boolean));
  for(const row of workers){db.prepare(`INSERT INTO app_workers(employee_no,name,birth_date,phone,joined_at,left_at,status,note) VALUES(?,?,?,?,?,?,?,?)`).run(row.employee_no??null,row.name,row.birth_date??null,row.phone??null,row.joined_at??null,row.left_at??null,["재직","퇴사","휴직","입사예정"].includes(String(row.status))?row.status:"재직","기존 운영자료 1회 이전");}
  for(const row of sites){db.prepare(`INSERT INTO app_sites(name,site_type,address,manager_name,operation_status,note) VALUES(?,?,?,?,?,?)`).run(row.name,row.division??"기타",row.address??null,row.manager_name??null,"운영","기존 운영자료 1회 이전");}
  for(const name of jobNames){db.prepare(`INSERT OR IGNORE INTO app_jobs(name,display_name,work_type,description) VALUES(?,?,?,?)`).run(name,name,"주중","기존 운영자료 1회 이전");}
  const appWorkers=db.prepare("SELECT id,employee_no,name FROM app_workers").all();
  const appSites=db.prepare("SELECT id,name FROM app_sites").all();
  const appJobs=db.prepare("SELECT id,name FROM app_jobs").all();
  const workerByEmployee=new Map(appWorkers.filter(r=>r.employee_no).map(r=>[String(r.employee_no),Number(r.id)]));
  const workerByName=new Map(appWorkers.map(r=>[String(r.name),Number(r.id)]));
  const legacyWorkers=new Map(db.prepare("SELECT id,employee_no,name FROM workers").all().map(r=>[Number(r.id),r]));
  const siteByLegacy=new Map(sites.map(r=>[Number(r.id),Number(appSites.find(s=>String(s.name)===String(r.name))?.id??0)]));
  const jobByName=new Map(appJobs.map(r=>[String(r.name),Number(r.id)]));
  let migratedAssignments=0;
  for(const row of assignments){const lw=legacyWorkers.get(Number(row.worker_id)); if(!lw) continue; const workerId=(lw.employee_no?workerByEmployee.get(String(lw.employee_no)):undefined)??workerByName.get(String(lw.name)); const siteId=siteByLegacy.get(Number(row.site_id)); const jobId=jobByName.get(String(row.job_name??"")); if(!workerId||!siteId||!jobId) continue; db.prepare(`INSERT INTO app_assignments(worker_id,site_id,job_id,work_type,started_at,status,note) VALUES(?,?,?,?,?,?,?)`).run(workerId,siteId,jobId,"주중",String(lw.joined_at??new Date().toISOString().slice(0,10)),String(row.status)==="활성"?"활성":"종료","기존 운영자료 1회 이전"); migratedAssignments++;}
  db.prepare("INSERT INTO app_audit_logs(action,entity_type,summary) VALUES('migrate','system',?)").run(`기존 DB에서 인력 ${workers.length}명, 지점 ${sites.length}곳, 직무 ${jobNames.size}개, 배치 ${migratedAssignments}건 1회 이전`);
  db.exec("COMMIT");
  console.log(`완료: 인력 ${workers.length}명 / 지점 ${sites.length}곳 / 직무 ${jobNames.size}개 / 배치 ${migratedAssignments}건`);
  console.log("이후 신규·수정 업무는 프로그램 운영 테이블에서 직접 처리합니다.");
}catch(error){try{db.exec("ROLLBACK");}catch{} console.error(error);process.exitCode=1;}finally{db.close();}
