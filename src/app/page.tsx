import Link from "next/link";
import { coreSummary, listContracts } from "@/lib/operations";
import { phase2Summary } from "@/lib/phase2";

export const dynamic = "force-dynamic";
const v=(x:unknown)=>String(x??"");

export default function DashboardPage() {
  const summary=coreSummary(), p2=phase2Summary();
  const expiring=listContracts().filter(c=>v(c.status)==="유효" && v(c.ended_at)).slice(0,6);
  const cards=[
    {label:"재직 인력",value:`${summary.activeWorkers}명`,caption:"프로그램 운영 DB 기준",href:"/workers"},
    {label:"계약 확인",value:`${summary.expiring}건`,caption:"30일 내 만료 예정",href:"/contracts"},
    {label:"근태 예외",value:`${p2.attendanceEvents}건`,caption:"정상근무 외 누적 기록",href:"/attendance"},
    {label:"대체근무 미배정",value:`${p2.openSubstituteRequests}건`,caption:`활동 대체인력 ${p2.substitutePeople}명`,href:"/substitutes"},
  ];
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-teal-700">오늘 할 일</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">한성자동차 운영 관리</h1><p className="mt-2 text-sm text-slate-500">새 업무는 프로그램에서 직접 처리합니다. Excel 업로드는 일상 업무에 사용하지 않습니다.</p></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=><Link key={c.label} href={c.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm font-semibold text-slate-500">{c.label}</p><p className="mt-2 text-3xl font-black text-slate-950">{c.value}</p><p className="mt-2 text-xs text-slate-400">{c.caption}</p></Link>)}</section>
    <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><h2 className="font-bold text-slate-950">빠른 업무 시작</h2><p className="mt-1 text-xs text-slate-500">입력한 정보가 배치·근태·연차·대체근무에 이어집니다.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link href="/workers" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-bold">신규 인력 등록</p><p className="mt-1 text-xs text-slate-500">기본정보 등록 후 배치·계약 연결</p></Link>
        <Link href="/attendance" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-bold">근태 예외 등록</p><p className="mt-1 text-xs text-slate-500">연장·야간·휴일·결근 등 예외만 입력</p></Link>
        <Link href="/attendance" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-bold">연차 원장</p><p className="mt-1 text-xs text-slate-500">발생·사용·조정 기록으로 잔액 자동 계산</p></Link>
        <Link href="/substitutes" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-bold">대체근무 요청</p><p className="mt-1 text-xs text-slate-500">요청 생성 후 경험 기반 후보 추천</p></Link>
      </div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-950">계약 확인</h2><p className="mt-1 text-xs text-slate-500">유효 계약 종료일 기준</p></div><Link href="/contracts" className="text-xs font-bold text-teal-700">전체 보기</Link></div><div className="mt-5 space-y-3">{expiring.length?expiring.map(c=><div key={v(c.id)} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><div><p className="text-sm font-bold">{v(c.worker_name)}</p><p className="text-xs text-slate-500">{v(c.site_name)} {v(c.job_name)}</p></div><span className="text-sm font-semibold text-slate-700">~ {v(c.ended_at)}</span></div>):<div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">등록된 유효 계약이 없습니다.</div>}</div></section>
    </div>
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><p className="font-bold text-blue-950">운영 기준</p><p className="mt-1 text-sm text-blue-800">기존 Excel은 1회 이관·검증 자료일 뿐입니다. 인력·배치·계약·근태·연차·대체근무의 신규 기록은 운영 DB가 원본입니다.</p></section>
  </div>;
}
