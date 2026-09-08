"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditAs, requireOwner, requireUser } from "@/lib/auth";
import { withDatabase } from "@/lib/database";
import { changePayrollRunStatus, generatePayrollRun, updatePayrollItem } from "@/lib/payroll";
import { reopenPayrollRun } from "@/lib/payroll-admin";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const num = (form: FormData, key: string) => Number(text(form,key) || 0);

type PayrollStatus="작성중"|"검토"|"승인"|"마감";
const allowed:Record<PayrollStatus,PayrollStatus[]>={작성중:["검토"],검토:["작성중","승인"],승인:["마감"],마감:[]};
function getRunStatusByItem(id:number){return withDatabase(db=>{const row=db.prepare(`SELECT r.status FROM app_payroll_items i JOIN app_payroll_runs r ON r.id=i.payroll_run_id WHERE i.id=?`).get(id) as {status?:PayrollStatus}|undefined;if(!row?.status)throw new Error("급여 항목을 찾을 수 없습니다.");return row.status;});}
function getRunStatus(id:number){return withDatabase(db=>{const row=db.prepare("SELECT status FROM app_payroll_runs WHERE id=?").get(id) as {status?:PayrollStatus}|undefined;if(!row?.status)throw new Error("급여회차를 찾을 수 없습니다.");return row.status;});}

export async function createPayrollRun(form: FormData) {
  const user=await requireUser();
  const id = generatePayrollRun(text(form,"payroll_month"), num(form,"standard_days"), text(form,"note"));
  auditAs(user,"create","payroll_run",id,`${text(form,"payroll_month")} 급여회차 생성`);
  revalidatePath("/payroll"); revalidatePath("/"); redirect(`/payroll/${id}`);
}

export async function savePayrollItem(form: FormData) {
  const user=await requireUser();
  const id = num(form,"id");
  const status=getRunStatusByItem(id);
  if(status==="승인"||status==="마감") throw new Error("승인 또는 마감된 급여는 수정할 수 없습니다. 관리자가 검토 상태로 되돌린 뒤 수정하세요.");
  const runId = updatePayrollItem(id, {
    workedDays:num(form,"worked_days"), overtimeHours:num(form,"overtime_hours"), holidayHours:num(form,"holiday_hours"), nightHours:num(form,"night_hours"),
    leavePay:num(form,"leave_pay"), incentive:num(form,"incentive"), retroactivePay:num(form,"retroactive_pay"), otherPay:num(form,"other_pay"),
    otherDeduction:num(form,"other_deduction"), manualAdjustment:num(form,"manual_adjustment"), manualReason:text(form,"manual_reason"),
  });
  auditAs(user,"update","payroll_item",id,"급여 항목 수정");
  revalidatePath(`/payroll/${runId}`); revalidatePath("/payroll");
}

export async function setPayrollStatus(form: FormData) {
  const id=num(form,"id"); const status=text(form,"status") as PayrollStatus;
  const current=getRunStatus(id);
  if(current===status) return;
  if(!allowed[current]?.includes(status)) throw new Error(`급여 상태는 ${current}에서 ${status}(으)로 바로 변경할 수 없습니다.`);
  const user=(status==="승인"||status==="마감")?await requireOwner():await requireUser();
  changePayrollRunStatus(id,status); auditAs(user,"status","payroll_run",id,`급여 상태 ${current} → ${status}`);
  revalidatePath(`/payroll/${id}`); revalidatePath("/payroll"); revalidatePath("/");
}

export async function reopenPayroll(form:FormData){const user=await requireOwner();const id=num(form,"id");const current=getRunStatus(id);if(current!=="마감"&&current!=="승인")throw new Error("승인 또는 마감 상태만 검토로 되돌릴 수 있습니다.");reopenPayrollRun(id);auditAs(user,"unlock","payroll_run",id,`급여 ${current} → 검토`);revalidatePath(`/payroll/${id}`);revalidatePath("/payroll");revalidatePath("/");}
