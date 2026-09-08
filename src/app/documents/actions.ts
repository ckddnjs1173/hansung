"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auditAs, requireUser } from "@/lib/auth";
import { generateDocument } from "@/lib/documents";
export async function createGeneratedDocument(form:FormData){const user=await requireUser();const templateId=Number(form.get("template_id"));const workerId=Number(form.get("worker_id"));const id=generateDocument(templateId,workerId,user.id);auditAs(user,"create","generated_document",id,"문서 생성");revalidatePath("/documents");redirect(`/documents/${id}`);}
