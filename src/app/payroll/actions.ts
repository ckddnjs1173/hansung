"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditAs, requireOwner, requireUser } from "@/lib/auth";
import { changePayrollRunStatus, generatePayrollRun, reopenPayrollRun, updatePayrollItem } from "@/lib/payroll";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const num = (form: FormData, key: string) => Number(text(form,key) || 0);

export async function createPayrollRun(form: FormData) {
  const user=await requireUser();
  const id = generatePayrollRun(text(form,"payroll_month"), num(form,"standard_days"), text(form,"note"));
  auditAs(user,"create","payroll_run",id,`${text(form,"payroll_month")} 급여회차 생성`);
  revalidatePath("/payroll"); revalidatePath("/"); redirect(`/payroll/${id}`);
}

export async function savePayrollItem(form: FormData) {
  const user=await requireUser();
  const id = num(form,"id");
  const runId = updatePayrollItem(id, {
    workedDays:num(form,"worked_days"), overtimeHours:num(form,"overtime_hours"), holidayHours:num(form,"holiday_hours"), nightHours:num(form,"night_hours"),
    leavePay:num(form,"leave_pay"), incentive:num(form,"incentive"), retroactivePay:num(form,"retroactive_pay"), otherPay:num(form,"other_pay"),
    otherDeduction:num(form,"other_deduction"), manualAdjustment:num(form,"manual_adjustment"), manualReason:text(form,"manual_reason"),
  });
  auditAs(user,"update","payroll_item",id,"급여 항목 수정");
  revalidatePath(`/payroll/${runId}`); revalidatePath("/payroll");
}

export async function setPayrollStatus(form: FormData) {
  const id=num(form,"id"); const status=text(form,"status") as "작성중"|"검토"|"승인"|"마감";
  const user=(status==="승인"||status==="마감")?await requireOwner():await requireUser();
  changePayrollRunStatus(id,status); auditAs(user,"status","payroll_run",id,`급여 상태 ${status}`);
  revalidatePath(`/payroll/${id}`); revalidatePath("/payroll"); revalidatePath("/");
}

export async function reopenPayroll(form:FormData){const user=await requireOwner();const id=num(form,"id");reopenPayrollRun(id);auditAs(user,"unlock","payroll_run",id,"급여 마감 해제");revalidatePath(`/payroll/${id}`);revalidatePath("/payroll");revalidatePath("/");}
