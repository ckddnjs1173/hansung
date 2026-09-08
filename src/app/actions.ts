"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withDatabase } from "@/lib/database";
import { auditAs, requireOwner, requireUser } from "@/lib/auth";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const numberOrNull = (value: string) => value === "" ? null : Number(value);
const dateOrNull = (value: string) => value || null;

export async function createWorker(form: FormData) {
  const user=await requireUser(); const name=text(form,"name"); if (!name) throw new Error("성명은 필수입니다.");
  const id=withDatabase((db)=>{const result=db.prepare(`INSERT INTO app_workers(employee_no,name,birth_date,phone,email,address,joined_at,status,note) VALUES(?,?,?,?,?,?,?,?,?)`).run(text(form,"employee_no")||null,name,dateOrNull(text(form,"birth_date")),text(form,"phone")||null,text(form,"email")||null,text(form,"address")||null,dateOrNull(text(form,"joined_at")),text(form,"status")||"재직",text(form,"note")||null); return Number(result.lastInsertRowid);});
  auditAs(user,"create","worker",id,`${name} 등록`); revalidatePath("/"); revalidatePath("/workers"); redirect(`/workers/${id}`);
}

export async function updateWorker(form: FormData) {
  const user=await requireUser(); const id=Number(text(form,"id")); const name=text(form,"name"); if (!id||!name) throw new Error("필수값이 없습니다.");
  withDatabase((db)=>{db.prepare(`UPDATE app_workers SET employee_no=?,name=?,birth_date=?,phone=?,email=?,address=?,joined_at=?,left_at=?,status=?,note=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(text(form,"employee_no")||null,name,dateOrNull(text(form,"birth_date")),text(form,"phone")||null,text(form,"email")||null,text(form,"address")||null,dateOrNull(text(form,"joined_at")),dateOrNull(text(form,"left_at")),text(form,"status")||"재직",text(form,"note")||null,id);});
  auditAs(user,"update","worker",id,`${name} 수정`); revalidatePath("/workers"); revalidatePath(`/workers/${id}`);
}

export async function createSite(form: FormData) {
  const user=await requireUser(); const name=text(form,"name"); if (!name) throw new Error("지점명은 필수입니다.");
  const id=withDatabase((db)=>{const r=db.prepare(`INSERT INTO app_sites(name,short_name,site_type,address,manager_name,command_manager_name,operation_status,note) VALUES(?,?,?,?,?,?,?,?)`).run(name,text(form,"short_name")||null,text(form,"site_type")||"기타",text(form,"address")||null,text(form,"manager_name")||null,text(form,"command_manager_name")||null,text(form,"operation_status")||"운영",text(form,"note")||null);return Number(r.lastInsertRowid);});
  auditAs(user,"create","site",id,`${name} 등록`); revalidatePath("/sites"); revalidatePath("/");
}

export async function createJob(form: FormData) {
  const user=await requireUser(); const name=text(form,"name"); if (!name) throw new Error("직무명은 필수입니다.");
  const id=withDatabase((db)=>{const r=db.prepare(`INSERT INTO app_jobs(name,display_name,work_type,standard_hours,description) VALUES(?,?,?,?,?)`).run(name,text(form,"display_name")||null,text(form,"work_type")||"주중",numberOrNull(text(form,"standard_hours")),text(form,"description")||null);return Number(r.lastInsertRowid);});
  auditAs(user,"create","job",id,`${name} 등록`); revalidatePath("/jobs"); revalidatePath("/");
}

export async function createPayRule(form: FormData) {
  const user=await requireOwner(); const jobId=Number(text(form,"job_id")); if (!jobId) throw new Error("직무를 선택하세요.");
  const id=withDatabase((db)=>{const r=db.prepare(`INSERT INTO app_pay_rules(job_id,site_id,effective_from,effective_to,base_salary,meal_allowance,fixed_overtime_allowance,fixed_night_allowance,fixed_holiday_allowance,other_allowance,monthly_standard_hours,note,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(jobId,numberOrNull(text(form,"site_id")),text(form,"effective_from"),dateOrNull(text(form,"effective_to")),Number(text(form,"base_salary")||0),Number(text(form,"meal_allowance")||0),Number(text(form,"fixed_overtime_allowance")||0),Number(text(form,"fixed_night_allowance")||0),Number(text(form,"fixed_holiday_allowance")||0),Number(text(form,"other_allowance")||0),numberOrNull(text(form,"monthly_standard_hours")),text(form,"note")||null,"적용");return Number(r.lastInsertRowid);});
  auditAs(user,"create","pay_rule",id,"급여기준 등록"); revalidatePath("/jobs");
}

export async function createAssignment(form: FormData) {
  const user=await requireUser(); const workerId=Number(text(form,"worker_id")),siteId=Number(text(form,"site_id")),jobId=Number(text(form,"job_id"));
  if (!workerId||!siteId||!jobId||!text(form,"started_at")) throw new Error("인력, 지점, 직무, 시작일은 필수입니다.");
  const id=withDatabase((db)=>{db.prepare("UPDATE app_assignments SET status='종료',ended_at=COALESCE(ended_at,date(?,'-1 day')),updated_at=CURRENT_TIMESTAMP WHERE worker_id=? AND status='활성'").run(text(form,"started_at"),workerId); const r=db.prepare(`INSERT INTO app_assignments(worker_id,site_id,job_id,work_type,started_at,ended_at,status,pay_rule_id,note) VALUES(?,?,?,?,?,?,?,?,?)`).run(workerId,siteId,jobId,text(form,"work_type")||"주중",text(form,"started_at"),dateOrNull(text(form,"ended_at")),text(form,"status")||"활성",numberOrNull(text(form,"pay_rule_id")),text(form,"note")||null);return Number(r.lastInsertRowid);});
  auditAs(user,"create","assignment",id,"배치 등록"); revalidatePath("/contracts"); revalidatePath("/workers"); revalidatePath(`/workers/${workerId}`); revalidatePath("/");
}

export async function createContract(form: FormData) {
  const user=await requireUser(); const workerId=Number(text(form,"worker_id")); if (!workerId||!text(form,"started_at")||!text(form,"ended_at")) throw new Error("근로자와 계약기간은 필수입니다.");
  const result=withDatabase((db)=>{const previous=db.prepare("SELECT id,sequence_no FROM app_contracts WHERE worker_id=? ORDER BY sequence_no DESC,id DESC LIMIT 1").get(workerId) as {id?:number;sequence_no?:number}|undefined; const type=text(form,"contract_type")|| (previous?"연장":"최초"); const seq=(previous?.sequence_no??0)+1; const r=db.prepare(`INSERT INTO app_contracts(worker_id,assignment_id,contract_type,sequence_no,started_at,ended_at,status,previous_contract_id,note) VALUES(?,?,?,?,?,?,?,?,?)`).run(workerId,numberOrNull(text(form,"assignment_id")),type,seq,text(form,"started_at"),text(form,"ended_at"),text(form,"status")||"유효",previous?.id??null,text(form,"note")||null);return {id:Number(r.lastInsertRowid),type};});
  auditAs(user,"create","contract",result.id,`${result.type} 계약 등록`); revalidatePath("/contracts"); revalidatePath(`/workers/${workerId}`); revalidatePath("/");
}

export async function endAssignment(form: FormData) {
  const user=await requireUser(); const id=Number(text(form,"id")); if (!id) return;
  withDatabase((db)=>{db.prepare("UPDATE app_assignments SET status='종료',ended_at=COALESCE(?,date('now')),updated_at=CURRENT_TIMESTAMP WHERE id=?").run(dateOrNull(text(form,"ended_at")),id);});
  auditAs(user,"end","assignment",id,"배치 종료"); revalidatePath("/contracts"); revalidatePath("/workers");
}
