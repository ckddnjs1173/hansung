import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const dbPath=path.resolve('data/local/hansung.sqlite');
if(!fs.existsSync(dbPath)) throw new Error('검증할 로컬 DB가 없습니다.');
const db=new DatabaseSync(dbPath,{readOnly:true});
const scalar=(sql)=>Number(db.prepare(sql).get().value ?? 0);
const checks=[
  ['원본 파일이 인덱싱됨',scalar('SELECT COUNT(*) value FROM source_files')>0],
  ['Excel 원본행이 보존됨',scalar('SELECT COUNT(*) value FROM source_rows')>0],
  ['근로자 데이터가 존재함',scalar('SELECT COUNT(*) value FROM workers')>0],
  ['고아 배치가 없음',scalar('SELECT COUNT(*) value FROM assignments a LEFT JOIN workers w ON w.id=a.worker_id WHERE w.id IS NULL')===0],
  ['급여규칙마다 구성항목이 있음',scalar('SELECT COUNT(*) value FROM pay_rule_versions p WHERE NOT EXISTS (SELECT 1 FROM pay_rule_components c WHERE c.pay_rule_version_id=p.id)')===0],
  ['청구서에 계산 원문이 있음',scalar("SELECT COUNT(*) value FROM monthly_billing_items WHERE COALESCE(calculation_json,'')=''")===0],
];
for(const [label,passed] of checks) console.log(`${passed?'PASS':'FAIL'} ${label}`);
db.close();
if(checks.some(([,passed])=>!passed)) process.exitCode=1;
