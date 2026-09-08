"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { withDatabase } from "@/lib/database";
import { auditAs, requireUser } from "@/lib/auth";

const text=(form:FormData,key:string)=>String(form.get(key)??"").trim();
const num=(form:FormData,key:string)=>Number(text(form,key)||0);
const nullable=(value:string)=>value||null;

export async function createAttendanceEvent(form:FormData){
  const user=await requireUser();const workerId=num(form,"worker_id"),workDate=text(form,"work_date"),eventType=text(form,"event_type");
  if(!workerId||!workDate||!eventType) throw new Error("근로자, 날짜, 근태 유형은 필수입니다.");
  const id=withDatabase(db=>{const assignment=db.prepare("SELECT id,site_id FROM app_assignments WHERE worker_id=? AND status='활성' ORDER BY started_at DESC LIMIT 1").get(workerId) as {id?:number;site_id?:number}|undefined; const r=db.prepare(`INSERT INTO app_attendance_events(worker_id,assignment_id,site_id,work_date,event_type,minutes,days,started_at,ended_at,note) VALUES(?,?,?,?,?,?,?,?,?,?)`).run(workerId,assignment?.id??null,assignment?.site_id??null,workDate,eventType,num(form,"minutes"),num(form,"days"),nullable(text(form,"started_at")),nullable(text(form,"ended_at")),nullable(text(form,"note")));return Number(r.lastInsertRowid);});
  auditAs(user,"create","attendance",id,`${workDate} ${eventType} 등록`);revalidatePath("/attendance"); revalidatePath("/");
}

export async function deleteAttendanceEvent(form:FormData){
  const user=await requireUser();const id=num(form,"id"); if(!id)return;
  withDatabase(db=>db.prepare("DELETE FROM app_attendance_events WHERE id=?").run(id));auditAs(user,"delete","attendance",id,"근태 예외 삭제");revalidatePath("/attendance");
}

export async function createLeaveEntry(form:FormData){
  const user=await requireUser();const workerId=num(form,"worker_id"),eventDate=text(form,"event_date"),eventType=text(form,"event_type"),days=num(form,"leave_days");
  if(!workerId||!eventDate||!eventType||!days) throw new Error("근로자, 날짜, 유형, 일수는 필수입니다.");
  const id=withDatabase(db=>Number(db.prepare("INSERT INTO app_leave_ledger(worker_id,event_date,event_type,leave_days,note) VALUES(?,?,?,?,?)").run(workerId,eventDate,eventType,days,nullable(text(form,"note"))).lastInsertRowid));auditAs(user,"create","leave",id,`${eventType} ${days}일`);revalidatePath("/attendance"); revalidatePath("/");
}

export async function deleteLeaveEntry(form:FormData){
  const user=await requireUser();const id=num(form,"id");if(!id)return;withDatabase(db=>db.prepare("DELETE FROM app_leave_ledger WHERE id=?").run(id));auditAs(user,"delete","leave",id,"연차 원장 삭제");revalidatePath("/attendance");
}

export async function createSubstitutePerson(form:FormData){
  const user=await requireUser();const name=text(form,"name");if(!name)throw new Error("성명은 필수입니다.");const id=withDatabase(db=>Number(db.prepare("INSERT INTO app_substitute_people(name,phone,experience_type,status,note) VALUES(?,?,?,?,?)").run(name,nullable(text(form,"phone")),nullable(text(form,"experience_type")),text(form,"status")||"활동",nullable(text(form,"note"))).lastInsertRowid));auditAs(user,"create","substitute_person",id,`${name} 등록`);revalidatePath("/substitutes");
}

export async function createSubstituteRequest(form:FormData){
  const user=await requireUser();const siteId=num(form,"site_id"),jobId=num(form,"job_id"),workDate=text(form,"work_date");if(!siteId||!jobId||!workDate)throw new Error("지점, 직무, 날짜는 필수입니다.");
  const id=withDatabase(db=>Number(db.prepare(`INSERT INTO app_substitute_requests(site_id,job_id,work_date,started_at,ended_at,hours,reason,status,note) VALUES(?,?,?,?,?,?,?,?,?)`).run(siteId,jobId,workDate,nullable(text(form,"started_at")),nullable(text(form,"ended_at")),num(form,"hours")||null,nullable(text(form,"reason")),"요청",nullable(text(form,"note"))).lastInsertRowid));auditAs(user,"create","substitute_request",id,`${workDate} 대체근무 요청`);revalidatePath("/substitutes");revalidatePath("/");redirect(`/substitutes/${id}`);
}

export async function assignSubstitute(form:FormData){
  const user=await requireUser();const requestId=num(form,"request_id"),substituteId=num(form,"substitute_id");if(!requestId||!substituteId)throw new Error("대체근무자 선택이 필요합니다.");withDatabase(db=>db.prepare("UPDATE app_substitute_requests SET assigned_substitute_id=?,status='배정',updated_at=CURRENT_TIMESTAMP WHERE id=?").run(substituteId,requestId));auditAs(user,"assign","substitute_request",requestId,"대체근무자 배정");revalidatePath("/substitutes");revalidatePath(`/substitutes/${requestId}`);revalidatePath("/");
}

export async function completeSubstituteRequest(form:FormData){
  const user=await requireUser();const requestId=num(form,"request_id");if(!requestId)return;
  withDatabase(db=>{const r=db.prepare("SELECT * FROM app_substitute_requests WHERE id=?").get(requestId) as Record<string,unknown>|undefined;if(!r?.assigned_substitute_id)throw new Error("배정된 대체근무자가 없습니다.");db.prepare("UPDATE app_substitute_requests SET status='완료',updated_at=CURRENT_TIMESTAMP WHERE id=?").run(requestId);db.prepare(`INSERT OR IGNORE INTO app_substitute_work_history(substitute_id,request_id,site_id,job_id,work_date,hours,note) VALUES(?,?,?,?,?,?,?)`).run(r.assigned_substitute_id,requestId,r.site_id,r.job_id,r.work_date,r.hours,r.note);});auditAs(user,"complete","substitute_request",requestId,"대체근무 완료");revalidatePath("/substitutes");revalidatePath(`/substitutes/${requestId}`);revalidatePath("/");
}

export async function cancelSubstituteRequest(form:FormData){
  const user=await requireUser();const requestId=num(form,"request_id");if(!requestId)return;withDatabase(db=>db.prepare("UPDATE app_substitute_requests SET status='취소',updated_at=CURRENT_TIMESTAMP WHERE id=?").run(requestId));auditAs(user,"cancel","substitute_request",requestId,"대체근무 요청 취소");revalidatePath("/substitutes");revalidatePath(`/substitutes/${requestId}`);revalidatePath("/");
}
