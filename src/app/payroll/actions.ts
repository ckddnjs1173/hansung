"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { changePayrollRunStatus, generatePayrollRun, updatePayrollItem } from "@/lib/payroll";

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const num = (form: FormData, key: string) => Number(text(form,key) || 0);

export async function createPayrollRun(form: FormData) {
  const id = generatePayrollRun(text(form,"payroll_month"), num(form,"standard_days"), text(form,"note"));
  revalidatePath("/payroll");
  revalidatePath("/");
  redirect(`/payroll/${id}`);
}

export async function savePayrollItem(form: FormData) {
  const id = num(form,"id");
  const runId = updatePayrollItem(id, {
    workedDays:num(form,"worked_days"),
    overtimeHours:num(form,"overtime_hours"),
    holidayHours:num(form,"holiday_hours"),
    nightHours:num(form,"night_hours"),
    leavePay:num(form,"leave_pay"),
    incentive:num(form,"incentive"),
    retroactivePay:num(form,"retroactive_pay"),
    otherPay:num(form,"other_pay"),
    otherDeduction:num(form,"other_deduction"),
    manualAdjustment:num(form,"manual_adjustment"),
    manualReason:text(form,"manual_reason"),
  });
  revalidatePath(`/payroll/${runId}`);
  revalidatePath("/payroll");
}

export async function setPayrollStatus(form: FormData) {
  const id=num(form,"id");
  const status=text(form,"status") as "작성중"|"검토"|"승인"|"마감";
  changePayrollRunStatus(id,status);
  revalidatePath(`/payroll/${id}`);
  revalidatePath("/payroll");
  revalidatePath("/");
}
