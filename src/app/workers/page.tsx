import type { Metadata } from "next";
import Link from "next/link";
import { createWorker } from "@/app/actions";
import { listWorkers, options } from "@/lib/operations";

export const metadata: Metadata = { title: "인력 관리" };
export const dynamic = "force-dynamic";

const value = (v: unknown) => String(v ?? "");

export default async function Page({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const params=await searchParams;
  const q=typeof params.q==="string"?params.q:"";
  const site=typeof params.site==="string"?params.site:"";
  const job=typeof params.job==="string"?params.job:"";
  const status=typeof params.status==="string"?params.status:"";
  const rows=listWorkers({q,site,job,status});
  const opts=options();
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-teal-700">운영 마스터</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">인력 관리</h1><p className="mt-2 text-sm text-slate-500">신규 인력은 여기서 직접 등록합니다. Excel 입력이나 업로드가 필요하지 않습니다.</p></header>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-slate-950">신규 인력 등록</h2>
      <form action={createWorker} className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <input name="name" required placeholder="성명 *" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <input name="employee_no" placeholder="사번" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <input name="phone" placeholder="연락처" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <input name="joined_at" type="date" aria-label="입사일" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <select name="status" defaultValue="재직" className="h-11 rounded-xl border border-slate-200 px-3 text-sm"><option>입사예정</option><option>재직</option><option>휴직</option><option>퇴사</option></select>
        <input name="birth_date" type="date" aria-label="생년월일" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <input name="email" type="email" placeholder="이메일" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <input name="address" placeholder="주소" className="h-11 rounded-xl border border-slate-200 px-3 text-sm md:col-span-2" />
        <input name="note" placeholder="특이사항" className="h-11 rounded-xl border border-slate-200 px-3 text-sm" />
        <button className="h-11 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white hover:bg-teal-800">인력 등록</button>
      </form>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <form className="grid gap-3 md:grid-cols-5">
        <input name="q" defaultValue={q} placeholder="이름·사번·연락처 검색" className="h-10 rounded-xl border border-slate-200 px-3 text-sm md:col-span-2" />
        <select name="site" defaultValue={site} className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option value="">전체 지점</option>{opts.sites.map(r=><option key={value(r.id)} value={value(r.id)}>{value(r.name)}</option>)}</select>
        <select name="job" defaultValue={job} className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option value="">전체 직무</option>{opts.jobs.map(r=><option key={value(r.id)} value={value(r.id)}>{value(r.name)}</option>)}</select>
        <div className="flex gap-2"><select name="status" defaultValue={status} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm"><option value="">전체 상태</option><option>입사예정</option><option>재직</option><option>휴직</option><option>퇴사</option></select><button className="rounded-xl border border-slate-200 px-4 text-sm font-bold">조회</button></div>
      </form>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm"><thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3">성명</th><th>사번</th><th>상태</th><th>지점</th><th>직무</th><th>입사일</th><th>계약 종료</th><th></th></tr></thead>
        <tbody>{rows.map(r=><tr key={value(r.id)} className="border-b border-slate-100"><td className="px-4 py-3 font-bold text-slate-950">{value(r.name)}</td><td>{value(r.employee_no)||"-"}</td><td>{value(r.status)}</td><td>{value(r.site_name)||"미배치"}</td><td>{value(r.job_name)||"-"}</td><td>{value(r.joined_at)||"-"}</td><td>{value(r.contract_ended)||"-"}</td><td className="text-right"><Link href={`/workers/${value(r.id)}`} className="font-bold text-teal-700">상세</Link></td></tr>)}</tbody></table>
        {rows.length===0?<p className="py-10 text-center text-sm text-slate-400">조건에 맞는 인력이 없습니다.</p>:null}
      </div>
    </section>
  </div>;
}
