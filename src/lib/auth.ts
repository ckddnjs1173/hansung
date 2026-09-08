import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual, scryptSync } from "node:crypto";
import { withDatabase } from "@/lib/database";

type User = { id:number; login_id:string; display_name:string; role:"owner"|"operator"; is_active:number };
const COOKIE_NAME="hansung_session";
const secret=()=>process.env.AUTH_SECRET?.trim()||"";
const b64=(v:string)=>Buffer.from(v).toString("base64url");
const unb64=(v:string)=>Buffer.from(v,"base64url").toString("utf8");

export function hashPassword(password:string,salt:string){return scryptSync(password,salt,64).toString("hex");}
export function verifyPassword(password:string,salt:string,expected:string){const actual=Buffer.from(hashPassword(password,salt),"hex"), target=Buffer.from(expected,"hex");return actual.length===target.length&&timingSafeEqual(actual,target);}
function sign(payload:string){const key=secret();if(!key) throw new Error("AUTH_SECRET이 설정되지 않았습니다.");return createHmac("sha256",key).update(payload).digest("base64url");}
export function createSessionToken(user:User){const payload=b64(JSON.stringify({uid:user.id,role:user.role,exp:Date.now()+1000*60*60*12}));return `${payload}.${sign(payload)}`;}
export function parseSessionToken(token:string|undefined|null){if(!token||!secret()) return null;const [payload,sig]=token.split(".");if(!payload||!sig) return null;const expected=sign(payload);const a=Buffer.from(sig),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b)) return null;try{const parsed=JSON.parse(unb64(payload)) as {uid:number;role:"owner"|"operator";exp:number};if(!parsed.uid||parsed.exp<Date.now()) return null;return parsed;}catch{return null;}}
export async function setSession(user:User){const store=await cookies();store.set(COOKIE_NAME,createSessionToken(user),{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*12});}
export async function clearSession(){const store=await cookies();store.delete(COOKIE_NAME);}
export async function currentUser():Promise<User|null>{const store=await cookies();const parsed=parseSessionToken(store.get(COOKIE_NAME)?.value);if(!parsed) return null;return withDatabase(db=>db.prepare("SELECT id,login_id,display_name,role,is_active FROM app_users WHERE id=? AND is_active=1").get(parsed.uid) as User|undefined)||null;}
export async function requireUser(){const user=await currentUser();if(!user) throw new Error("로그인이 필요합니다.");return user;}
export async function requireOwner(){const user=await requireUser();if(user.role!=="owner") throw new Error("관리자만 수행할 수 있는 작업입니다.");return user;}
export function authenticate(loginId:string,password:string){return withDatabase(db=>{const row=db.prepare(`SELECT u.id,u.login_id,u.display_name,u.role,u.is_active,c.password_salt,c.password_hash FROM app_users u JOIN app_user_credentials c ON c.user_id=u.id WHERE u.login_id=? AND u.is_active=1`).get(loginId) as (User&{password_salt:string;password_hash:string})|undefined;if(!row||!verifyPassword(password,row.password_salt,row.password_hash)) return null;return {id:row.id,login_id:row.login_id,display_name:row.display_name,role:row.role,is_active:row.is_active} as User;});}
export function auditAs(user:User,action:string,entityType:string,entityId:number|null,summary:string){withDatabase(db=>db.prepare("INSERT INTO app_audit_logs(actor_role,action,entity_type,entity_id,summary) VALUES(?,?,?,?,?)").run(user.role,action,entityType,entityId,`${user.display_name}: ${summary}`));}
