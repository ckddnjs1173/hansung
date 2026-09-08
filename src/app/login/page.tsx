import { loginAction } from "./actions";

export const metadata={title:"로그인"};
export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string;next?:string}>}){
  const q=await searchParams;
  return <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl">
      <div className="mb-6"><div className="mb-4 grid size-12 place-items-center rounded-2xl bg-teal-700 font-black text-white">HS</div><h1 className="text-2xl font-black text-slate-950">한성자동차 통합 운영 관리</h1><p className="mt-2 text-sm text-slate-500">등록된 내부 사용자만 로그인할 수 있습니다.</p></div>
      {q.error?<div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">아이디 또는 비밀번호를 확인하세요.</div>:null}
      <form action={loginAction} className="space-y-4"><input type="hidden" name="next" value={q.next||"/"}/><label className="block text-sm font-bold text-slate-700">아이디<input name="login_id" required autoComplete="username" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-500"/></label><label className="block text-sm font-bold text-slate-700">비밀번호<input name="password" required type="password" autoComplete="current-password" className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-teal-500"/></label><button className="h-11 w-full rounded-xl bg-slate-950 text-sm font-black text-white">로그인</button></form>
      <p className="mt-5 text-xs leading-5 text-slate-400">최초 계정은 로컬에서 <code className="rounded bg-slate-100 px-1">npm run auth:bootstrap</code>으로 생성합니다. 비밀번호는 평문으로 저장되지 않습니다.</p>
    </div>
  </div>;
}
