import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import ExcelJS from 'exceljs';

const args = process.argv.slice(2);
const sourceArg = args.find((item) => item.startsWith('--source='))?.slice(9);
const sourceDir = sourceArg || process.env.HANSUNG_SOURCE_DIR;
const dbPath = path.resolve(process.env.HANSUNG_DB_PATH || 'data/local/hansung.sqlite');
if (!sourceDir) throw new Error('HANSUNG_SOURCE_DIR 또는 --source=원본폴더 를 지정하세요.');
if (!fs.existsSync(sourceDir)) throw new Error('원본 폴더를 찾을 수 없습니다.');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(fs.readFileSync(path.resolve('database/schema.sql'), 'utf8'));

const text = (value) => {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') return String(value.result ?? value.text ?? value.formula ?? '');
  return String(value).trim();
};
const number = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(String(value ?? '').replaceAll(',', '').replaceAll('%', ''));
  return Number.isFinite(parsed) ? parsed : null;
};
const key = (...parts) => parts.map(text).join('|').replaceAll(/\s+/g, '').toLowerCase();
const isPersonName = (value) => /^[가-힣]{2,5}$/.test(value) || /^[A-Za-z]+(?: [A-Za-z]+){0,2}$/.test(value);
const categoryOf = (relative) => relative.split(/[\\/]/)[0] || '기타';
const walk = (dir) => fs.readdirSync(dir, { withFileTypes:true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const allFiles = walk(sourceDir).filter((file) => !path.basename(file).startsWith('~$'));

db.exec('BEGIN; DELETE FROM leave_sources; DELETE FROM monthly_billing_items; DELETE FROM pay_rule_components; DELETE FROM pay_rule_versions; DELETE FROM substitute_work_history; DELETE FROM substitute_profiles; DELETE FROM assignments; DELETE FROM sites; DELETE FROM workers; DELETE FROM source_rows; DELETE FROM source_files; DELETE FROM import_runs; COMMIT;');
const runStmt = db.prepare('INSERT INTO import_runs(started_at, source_dir) VALUES (?, ?)');
const runId = Number(runStmt.run(new Date().toISOString(), path.resolve(sourceDir)).lastInsertRowid);
const fileStmt = db.prepare('INSERT INTO source_files(import_run_id,relative_path,category,extension,size_bytes,modified_at) VALUES(?,?,?,?,?,?)');
const rowStmt = db.prepare('INSERT INTO source_rows(source_file_id,sheet_name,row_number,values_json) VALUES(?,?,?,?)');
const workerStmt = db.prepare('INSERT INTO workers(worker_key,name,birth_date,phone,status,occupation,source_file_id) VALUES(?,?,?,?,?,?,?) ON CONFLICT(worker_key) DO UPDATE SET status=excluded.status, occupation=COALESCE(excluded.occupation,workers.occupation), source_file_id=excluded.source_file_id');
const siteStmt = db.prepare('INSERT INTO sites(name,source_file_id) VALUES(?,?) ON CONFLICT(name) DO NOTHING');
const getWorker = db.prepare('SELECT id FROM workers WHERE worker_key=?');
const findWorkersByName = db.prepare('SELECT id,worker_key,status FROM workers WHERE name=? ORDER BY id');
const updateEmployeeNo = db.prepare("UPDATE workers SET employee_no=COALESCE(NULLIF(employee_no,''),?) WHERE name=?");
const getSite = db.prepare('SELECT id FROM sites WHERE name=?');
const assignmentStmt = db.prepare('INSERT OR IGNORE INTO assignments(worker_id,site_id,job_name,contract_first,contract_second,status,source_file_id) VALUES(?,?,?,?,?,?,?)');
const substituteStmt = db.prepare('INSERT INTO substitute_profiles(worker_key,name,phone,experience_type,total_work_count,service_count,showroom_count,work_history_text,recent_site,recent_work_date,note,source_file_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(worker_key) DO UPDATE SET total_work_count=excluded.total_work_count, recent_site=excluded.recent_site, recent_work_date=excluded.recent_work_date, source_file_id=excluded.source_file_id');
const getSubstitute = db.prepare('SELECT id FROM substitute_profiles WHERE worker_key=?');
const historyStmt = db.prepare('INSERT INTO substitute_work_history(substitute_id,worker_key,work_date,work_type,site_name,department,hours,source_file_id) VALUES(?,?,?,?,?,?,?,?)');
const ruleStmt = db.prepare('INSERT INTO pay_rule_versions(job_name,effective_year,source_sheet,source_file_id) VALUES(?,2026,?,?) ON CONFLICT(job_name,effective_year) DO UPDATE SET source_file_id=excluded.source_file_id RETURNING id');
const componentStmt = db.prepare('INSERT OR REPLACE INTO pay_rule_components(pay_rule_version_id,row_number,label,amount,rate,formula_text,note) VALUES(?,?,?,?,?,?,?)');
const billingStmt = db.prepare('INSERT INTO monthly_billing_items(billing_month,employee_no,worker_name,department,job_name,work_type,join_date,leave_date,standard_days,worked_days,standard_total,payroll_total,indirect_total,welfare_cost,management_fee,profit,supply_amount,vat,total_amount,calculation_json,source_file_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
const leaveStmt = db.prepare('INSERT INTO leave_sources(worker_name,worker_status,source_sheet,row_number,values_json,source_file_id) VALUES(?,?,?,?,?,?)');

let rowCount = 0;
try {
  for (const file of allFiles) {
    const stat = fs.statSync(file);
    const relative = path.relative(sourceDir, file);
    const extension = path.extname(file).toLowerCase();
    const fileId = Number(fileStmt.run(runId, relative, categoryOf(relative), extension, stat.size, stat.mtime.toISOString()).lastInsertRowid);
    if (extension !== '.xlsx') continue;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file, { ignoreNodes:['tableParts'] });
    for (const sheet of workbook.worksheets) {
      sheet.eachRow({ includeEmpty:false }, (row, rowNumber) => {
        const values = Array.from({length:row.cellCount}, (_, index) => text(row.getCell(index + 1).value));
        if (!values.some(Boolean)) return;
        rowStmt.run(fileId, sheet.name, rowNumber, JSON.stringify(values));
        rowCount += 1;
      });
    }
    const base = path.basename(file);
    if (base.includes('근로자명부')) {
      const status = base.includes('퇴사') ? '퇴사' : '재직';
      for (const sheet of workbook.worksheets) for (let r=11; r<=sheet.rowCount; r++) {
        const name=text(sheet.getCell(r,2).value), birth=text(sheet.getCell(r,3).value), phone=text(sheet.getCell(r,4).value), occupation=text(sheet.getCell(r,5).value);
        if (!isPersonName(name)) continue;
        workerStmt.run(key(name,birth,phone),name,birth,phone,status,occupation,fileId);
      }
    }
    if (base.includes('사용사업관리대장')) {
      const status = base.includes('퇴사') ? '종료' : '활성';
      for (const sheet of workbook.worksheets) for (let r=7; r<=sheet.rowCount; r++) {
        const name=text(sheet.getCell(r,4).value), site=text(sheet.getCell(r,5).value), job=text(sheet.getCell(r,6).value);
        if (!isPersonName(name)) continue;
        const candidates=findWorkersByName.all(name);
        const preferred=candidates.find((item)=>item.status===(status==='활성'?'재직':'퇴사')) ?? (candidates.length===1?candidates[0]:null);
        const workerKey=preferred?.worker_key ?? key(name,'ledger',status);
        if(!preferred) workerStmt.run(workerKey,name,null,null,status==='활성'?'재직':'퇴사',null,fileId);
        if (site) siteStmt.run(site,fileId);
        assignmentStmt.run(preferred?.id ?? getWorker.get(workerKey)?.id,getSite.get(site)?.id ?? null,job,text(sheet.getCell(r,8).value),text(sheet.getCell(r,9).value),status,fileId);
      }
    }
    if (base.includes('대타DB')) {
      const main=workbook.worksheets[0];
      for (let r=8; r<=main.rowCount; r++) {
        const name=text(main.getCell(r,2).value), phone=text(main.getCell(r,3).value);
        if (!isPersonName(name)) continue;
        substituteStmt.run(key(name,phone),name,phone,text(main.getCell(r,5).value),number(main.getCell(r,4).value)??0,number(main.getCell(r,6).value)??0,number(main.getCell(r,7).value)??0,text(main.getCell(r,8).value),text(main.getCell(r,9).value),text(main.getCell(r,10).value),text(main.getCell(r,11).value),fileId);
      }
      const history=workbook.worksheets.find((s)=>s.name.includes('근무이력'));
      if (history) for (let r=5; r<=history.rowCount; r++) {
        const name=text(history.getCell(r,2).value), phone=text(history.getCell(r,3).value); if(!isPersonName(name)) continue;
        const workerKey=key(name,phone);
        historyStmt.run(getSubstitute.get(workerKey)?.id ?? null,workerKey,text(history.getCell(r,1).value),text(history.getCell(r,4).value),text(history.getCell(r,5).value),text(history.getCell(r,6).value),number(history.getCell(r,7).value),fileId);
      }
    }
    if (base.includes('급여테이블')) for (const sheet of workbook.worksheets) {
      const ruleId=Number(ruleStmt.get(sheet.name,sheet.name,fileId).id);
      for(let r=9;r<=35;r++) {
        const label=text(sheet.getCell(r,4).value); if(!label) continue;
        const cell=sheet.getCell(r,5).value;
        componentStmt.run(ruleId,r,label,number(cell?.result ?? cell),number(sheet.getCell(r,6).value),cell && typeof cell==='object'?text(cell.formula):null,text(sheet.getCell(r,7).value));
      }
    }
    if (base.includes('파견료 청구내역서')) {
      const sheet=workbook.getWorksheet('청구09월') || workbook.worksheets[0];
      for(let r=9;r<=sheet.rowCount;r++) {
        const name=text(sheet.getCell(r,5).value); if(!isPersonName(name)) continue;
        const cols={}; for(let c=1;c<=72;c++) cols[c]=text(sheet.getCell(r,c).value);
        const employeeNo=text(sheet.getCell(r,2).value);
        billingStmt.run('2026-09',employeeNo,name,text(sheet.getCell(r,4).value),text(sheet.getCell(r,6).value),text(sheet.getCell(r,8).value),text(sheet.getCell(r,9).value),text(sheet.getCell(r,10).value),number(sheet.getCell(r,13).value),number(sheet.getCell(r,14).value),number(sheet.getCell(r,23).value),number(sheet.getCell(r,43).value),number(sheet.getCell(r,53).value),number(sheet.getCell(r,54).value),number(sheet.getCell(r,55).value),number(sheet.getCell(r,56).value),number(sheet.getCell(r,70).value),number(sheet.getCell(r,71).value),number(sheet.getCell(r,72).value),JSON.stringify(cols),fileId);
        if(employeeNo) updateEmployeeNo.run(employeeNo,name);
      }
    }
    if (base.includes('연차대장')) for (const sheet of workbook.worksheets) for(let r=1;r<=sheet.rowCount;r++) {
      const values=Array.from({length:sheet.columnCount},(_,i)=>text(sheet.getCell(r,i+1).value));
      if(!values.some(Boolean)) continue;
      leaveStmt.run(values.find((v)=>/^[가-힣]{2,5}$/.test(v)) ?? null,sheet.name.includes('퇴사')?'퇴사':'재직',sheet.name,r,JSON.stringify(values),fileId);
    }
  }
  db.prepare("UPDATE import_runs SET completed_at=?,file_count=?,row_count=?,status='completed' WHERE id=?").run(new Date().toISOString(),allFiles.length,rowCount,runId);
  const summary=db.prepare("SELECT (SELECT COUNT(*) FROM workers) workers,(SELECT COUNT(*) FROM sites) sites,(SELECT COUNT(*) FROM assignments) assignments,(SELECT COUNT(*) FROM substitute_profiles) substitutes,(SELECT COUNT(*) FROM pay_rule_versions) pay_rules,(SELECT COUNT(*) FROM monthly_billing_items) billing_items,(SELECT COUNT(*) FROM source_files) files").get();
  console.log(JSON.stringify({ dbPath, ...summary }, null, 2));
} catch (error) {
  db.prepare("UPDATE import_runs SET completed_at=?,status='failed',error_message=? WHERE id=?").run(new Date().toISOString(),error instanceof Error?error.message:String(error),runId);
  throw error;
} finally { db.close(); }
