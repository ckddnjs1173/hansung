import { currentUser } from "@/lib/auth";
import { listAuditLogs, listUsers } from "@/lib/settings";
import { saveUserAccess } from "./actions";

export const metadata={title:"설정"};
export const dynamic="force-dynamic";
const v=(x:unknown)=>String(x??"");

export default async function SettingsPage(){
  const me=await currentUser();
  const users=listUsers(), logs=listAuditLogs(80);
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-teal-700">운영 설정</p><h1 className="mt-1 text-3xl font-black text-slate-950">설정 · 권한 · 감사로그</h1><p className="mt-2 text-sm text-slate-500">현재 로그인: {me?.display_name||"-"} · {me?.role==="owner"?"관리자":"운영 사용자"}</p></header>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold">사용자 관리</h2><p className="mt-1 text-xs text-slate-500">관리자만 권한과 활성상태를 변경할 수 있습니다. 비밀번호 재설정은 로컬 bootstrap 명령을 사용합니다.</p></div></div><div className="mt-4 space-y-3">{users.map(u=><form key={v(u.id)} action={saveUserAccess} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto]"><input type="hidden" name="id" value={v(u.id)}/><div><p className="font-bold text-slate-900">{v(u.display_name)}</p><p className="text-xs text-slate-500">{v(u.login_id)}</p></div><select name="role" defaultValue={v(u.role)} disabled={me?.role!=="owner"} className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option value="owner">관리자</option><option value="operator">운영 사용자</option></select><label className="flex items-center gap-2 text-sm font-semibold text-slate-600"><input name="is_active" type="checkbox" defaultChecked={Number(u.is_active)===1} disabled={me?.role!=="owner"}/>활성</label><button disabled={me?.role!=="owner"} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-30">저장</button></form>)}</div></section>
    <section className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">DB 백업</h3><p className="mt-2 text-sm text-slate-500">로컬 DB를 안전한 SQLite 사본으로 생성합니다.</p><code className="mt-3 block rounded-lg bg-slate-950 p-3 text-xs text-white">npm run db:backup</code></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">계정 재설정</h3><p className="mt-2 text-sm text-slate-500">2인 계정과 비밀번호를 로컬에서 재설정합니다.</p><code className="mt-3 block rounded-lg bg-slate-950 p-3 text-xs text-white">npm run auth:bootstrap</code></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">운영 원칙</h3><p className="mt-2 text-sm text-slate-500">Excel은 입력 원본이 아닙니다. 프로그램 DB가 단일 기준 원본입니다.</p></div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">최근 감사로그</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b text-xs text-slate-400"><tr><th className="py-2">시각</th><th>권한</th><th>작업</th><th>대상</th><th>내용</th></tr></thead><tbody>{logs.map(l=><tr key={v(l.id)} className="border-b border-slate-100"><td className="py-3 text-xs text-slate-500">{v(l.created_at)}</td><td>{v(l.actor_role)}</td><td className="font-semibold">{v(l.action)}</td><td>{v(l.entity_type)} #{v(l.entity_id)}</td><td>{v(l.summary)}</td></tr>)}</tbody></table></div></section>
  </div>;
}
