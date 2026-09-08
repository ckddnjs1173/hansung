"use server";
import { revalidatePath } from "next/cache";
import { auditAs, requireOwner, requireUser } from "@/lib/auth";
import { confirmAttendanceMonth,reopenAttendanceMonth,setAttendanceReviewed } from "@/lib/workflow";
const t=(f:FormData,k:string)=>String(f.get(k)??"").trim();
const n=(f:FormData,k:string)=>Number(t(f,k)||0);
export async function toggleReview(form:FormData){const user=await requireUser();const month=t(form,"month"),workerId=n(form,"worker_id"),reviewed=t(form,"reviewed")==="1";setAttendanceReviewed(month,workerId,reviewed,user.id);auditAs(user,"review","attendance_month",null,`${month} 근태 ${reviewed?"확인":"확인취소"} · worker ${workerId}`);revalidatePath(`/attendance/close?month=${month}`);}
export async function confirmMonth(form:FormData){const user=await requireUser();const month=t(form,"month");confirmAttendanceMonth(month,user.id);auditAs(user,"close","attendance_month",null,`${month} 근태 확정`);revalidatePath("/attendance");revalidatePath("/attendance/close");revalidatePath("/payroll");revalidatePath("/");}
export async function reopenMonth(form:FormData){const user=await requireOwner();const month=t(form,"month");reopenAttendanceMonth(month,user.id);auditAs(user,"unlock","attendance_month",null,`${month} 근태 확정 해제`);revalidatePath("/attendance");revalidatePath("/attendance/close");revalidatePath("/payroll");revalidatePath("/");}
