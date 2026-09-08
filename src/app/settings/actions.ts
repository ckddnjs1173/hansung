"use server";
import { revalidatePath } from "next/cache";
import { auditAs, requireOwner } from "@/lib/auth";
import { updateUserAccess } from "@/lib/settings";

export async function saveUserAccess(form:FormData){const user=await requireOwner();const id=Number(form.get("id"));const role=String(form.get("role")) as "owner"|"operator";const isActive=form.get("is_active")?1:0;updateUserAccess(id,role,isActive);auditAs(user,"update","user",id,`사용자 권한 변경: ${role}, active=${isActive}`);revalidatePath("/settings");}
