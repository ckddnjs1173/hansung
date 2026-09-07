import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
const dbPath=path.resolve(process.env.HANSUNG_DB_PATH || 'data/local/hansung.sqlite');
if(!fs.existsSync(dbPath)) throw new Error('먼저 npm run data:import -- --source="원본경로" 를 실행하세요.');
const db=new DatabaseSync(dbPath,{readOnly:true});
console.table(db.prepare("SELECT (SELECT COUNT(*) FROM workers) workers,(SELECT COUNT(*) FROM sites) sites,(SELECT COUNT(*) FROM assignments) assignments,(SELECT COUNT(*) FROM substitute_profiles) substitutes,(SELECT COUNT(*) FROM pay_rule_versions) pay_rules,(SELECT COUNT(*) FROM monthly_billing_items) billing_items").all());
db.close();
