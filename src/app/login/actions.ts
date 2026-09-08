"use server";
import { redirect } from "next/navigation";
import { authenticate, clearSession, setSession } from "@/lib/auth";

export async function loginAction(form:FormData){
  const loginId=String(form.get("login_id")??"").trim();
  const password=String(form.get("password")??"");
  const next=String(form.get("next")??"/");
  const user=authenticate(loginId,password);
  if(!user) redirect(`/login?error=1&next=${encodeURIComponent(next.startsWith("/")?next:"/")}`);
  await setSession(user);
  redirect(next.startsWith("/")?next:"/");
}
export async function logoutAction(){await clearSession();redirect("/login");}
