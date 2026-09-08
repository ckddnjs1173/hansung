import fs from "node:fs";
import path from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const root=process.cwd();
const dbPath=path.join(root,"data","local","hansung.sqlite");
fs.mkdirSync(path.dirname(dbPath),{recursive:true});
const db=new DatabaseSync(dbPath);
for(const file of ["schema.sql","phase2.sql","phase3.sql","phase4.sql","phase5.sql"]){const p=path.join(root,"database",file);if(fs.existsSync(p)) db.exec(fs.readFileSync(p,"utf8"));}
const hash=(password,salt)=>scryptSync(password,salt,64).toString("hex");
const randomPassword=()=>randomBytes(12).toString("base64url");
const upsert=(loginId,displayName,role,password)=>{
  let user=db.prepare("SELECT id FROM app_users WHERE login_id=?").get(loginId);
  if(!user){const r=db.prepare("INSERT INTO app_users(login_id,display_name,role,is_active) VALUES(?,?,?,1)").run(loginId,displayName,role);user={id:Number(r.lastInsertRowid)};}
  else db.prepare("UPDATE app_users SET display_name=?,role=?,is_active=1,updated_at=CURRENT_TIMESTAMP WHERE id=?").run(displayName,role,user.id);
  const salt=randomBytes(16).toString("hex");
  db.prepare(`INSERT INTO app_user_credentials(user_id,password_salt,password_hash) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET password_salt=excluded.password_salt,password_hash=excluded.password_hash,password_updated_at=CURRENT_TIMESTAMP`).run(user.id,salt,hash(password,salt));
};
const ownerPassword=process.env.OWNER_PASSWORD||randomPassword();
const operatorPassword=process.env.OPERATOR_PASSWORD||randomPassword();
upsert(process.env.OWNER_LOGIN||"owner",process.env.OWNER_NAME||"관리자","owner",ownerPassword);
upsert(process.env.OPERATOR_LOGIN||"operator",process.env.OPERATOR_NAME||"운영담당자","operator",operatorPassword);
db.close();

const envPath=path.join(root,".env.local");
let env=fs.existsSync(envPath)?fs.readFileSync(envPath,"utf8"):"";
if(!/^AUTH_SECRET=/m.test(env)){if(env&&!env.endsWith("\n")) env+="\n";env+=`AUTH_SECRET=${randomBytes(48).toString("base64url")}\n`;fs.writeFileSync(envPath,env,"utf8");console.log("AUTH_SECRET을 .env.local에 생성했습니다.");}
console.log("\n로그인 계정이 준비되었습니다. 아래 비밀번호는 다시 표시되지 않습니다.\n");
console.log(`관리자  : ${process.env.OWNER_LOGIN||"owner"} / ${ownerPassword}`);
console.log(`운영자  : ${process.env.OPERATOR_LOGIN||"operator"} / ${operatorPassword}`);
console.log("\n필요하면 환경변수 OWNER_PASSWORD / OPERATOR_PASSWORD를 지정하고 다시 실행해 비밀번호를 재설정할 수 있습니다.");
