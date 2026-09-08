import type { Metadata } from "next";
import Link from "next/link";
import { createPayrollRun } from "@/app/payroll/actions";
import { listPayrollRuns, won } from "@/lib/payroll";

export const metadata: Metadata = { title: "급여" };
export const dynamic = "force-dynamic";
const v=(x:unknown)=>String(x??"");

export default function PayrollPage() {
  const runs=listPayrollRuns();
  const currentMonth=new Date().toISOString().slice(0,7);
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-teal-700">월 급여</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">급여 회차 관리</h1><p className="mt-2 text-sm text-slate-500">근태와 직무별 급여기준을 연결해 월 급여를 생성하고 검토·승인·마감합니다. 한성자동차 청구는 다음 단계에서 별도로 계산합니다.</p></header>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-950">새 급여 회차</h2><p className="mt-1 text-xs text-slate-500">월 기준일수는 실제 급여 산정 기준일수를 입력합니다. 입·퇴사 월은 생성 후 직원별 근무일수를 확인하세요.</p><form action={createPayrollRun} className="mt-4 grid gap-3 md:grid-cols-[180px_160px_1fr_auto]">
      <label className="text-xs font-semibold text-slate-600">급여월<input name="payroll_month" type="month" defaultValue={currentMonth} required className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600">월 기준일수<input name="standard_days" type="number" step="0.5" min="1" required className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-600">메모<input name="note" className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="예: 9월 정기급여" /></label>
      <button className="self-end rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white">급여 회차 생성</button>
    </form></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-950">급여 회차</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><th className="px-5 py-3">급여월</th><th className="px-4 py-3">상태</th><th className="px-4 py-3 text-right">대상</th><th className="px-4 py-3 text-right">확인필요</th><th className="px-4 py-3 text-right">지급총액</th><th className="px-5 py-3"></th></tr></thead><tbody>
      {runs.map(r=><tr key={v(r.id)} className="border-t border-slate-100"><td className="px-5 py-4 font-bold text-slate-900">{v(r.payroll_month)}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${v(r.status)==="마감"?"bg-slate-100 text-slate-600":v(r.status)==="승인"?"bg-blue-50 text-blue-700":v(r.status)==="검토"?"bg-amber-50 text-amber-700":"bg-teal-50 text-teal-700"}`}>{v(r.status)}</span></td><td className="px-4 py-4 text-right">{v(r.item_count)}명</td><td className="px-4 py-4 text-right font-semibold text-amber-700">{v(r.review_count)}명</td><td className="px-4 py-4 text-right font-bold">{won(r.gross_total)}</td><td className="px-5 py-4 text-right"><Link href={`/payroll/${v(r.id)}`} className="font-bold text-teal-700">열기</Link></td></tr>)}
      {!runs.length?<tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">생성된 급여 회차가 없습니다.</td></tr>:null}
    </tbody></table></div></section>
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><p className="font-bold">현재 급여 범위</p><p className="mt-1">이번 단계는 근로자 지급 총액 산정까지입니다. 근로자 개인 4대보험·소득세·지방소득세 공제는 원본 근거가 확정되지 않아 임의 자동계산하지 않으며, 회사 부담 간접비와 고객사 청구는 급여와 분리합니다.</p></section>
  </div>;
}
