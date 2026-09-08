import type { Metadata } from "next";
import { createSite } from "@/app/actions";
import { listSites } from "@/lib/operations";

export const metadata: Metadata = { title: "지점 관리" };
export const dynamic = "force-dynamic";
const v=(x:unknown)=>String(x??"");

export default function Page() {
  const rows=listSites();
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-teal-700">기준정보</p><h1 className="mt-1 text-3xl font-bold text-slate-950">지점 관리</h1><p className="mt-2 text-sm text-slate-500">공식 지점명과 운영 책임자를 한 곳에서 관리합니다.</p></header>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">지점 등록</h2>
      <form action={createSite} className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        <input name="name" required placeholder="공식 지점명 *" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <input name="short_name" placeholder="표시명·약어" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <select name="site_type" defaultValue="전시장" className="h-11 rounded-xl border border-slate-200 px-3 text-sm"><option>본사</option><option>전시장</option><option>서비스센터</option><option>BDC</option><option>중고차</option><option>기타</option></select>
        <select name="operation_status" defaultValue="운영" className="h-11 rounded-xl border border-slate-200 px-3 text-sm"><option>운영</option><option>중단</option><option>종료</option></select>
        <input name="address" placeholder="주소" className="h-11 rounded-xl border border-slate-200 px-3 text-sm md:col-span-2" />
        <input name="manager_name" placeholder="사용사업관리책임자" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <input name="command_manager_name" placeholder="업무지휘명령자" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <input name="note" placeholder="운영 특이사항" className="h-11 rounded-xl border border-slate-200 px-3 text-sm md:col-span-3" />
        <button className="h-11 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white">지점 등록</button>
      </form>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold">지점 현황</h2><span className="text-sm text-slate-500">{rows.length}곳</span></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3">지점</th><th>유형</th><th>상태</th><th>현재 인원</th><th>운영 직무</th><th>책임자</th><th>주소</th></tr></thead><tbody>{rows.map(r=><tr key={v(r.id)} className="border-b border-slate-100"><td className="px-4 py-3 font-bold">{v(r.name)}{r.short_name?<span className="ml-2 text-xs font-normal text-slate-400">{v(r.short_name)}</span>:null}</td><td>{v(r.site_type)}</td><td>{v(r.operation_status)}</td><td>{v(r.active_count)}명</td><td>{v(r.job_names)||"-"}</td><td>{v(r.manager_name)||"-"}</td><td>{v(r.address)||"-"}</td></tr>)}</tbody></table>{rows.length===0?<p className="py-10 text-center text-sm text-slate-400">등록된 지점이 없습니다. 운영 지점을 먼저 등록하세요.</p>:null}</div>
    </section>
  </div>;
}
