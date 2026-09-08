import Link from "next/link";
import { coreSummary, listContracts } from "@/lib/operations";

export const dynamic = "force-dynamic";
const v=(x:unknown)=>String(x??"");

export default function DashboardPage() {
  const summary=coreSummary();
  const expiring=listContracts().filter(c=>v(c.status)==="유효" && v(c.ended_at)).slice(0,6);
  const cards=[
    {label:"재직 인력",value:`${summary.activeWorkers}명`,caption:"프로그램 운영 DB 기준",href:"/workers"},
    {label:"운영 지점",value:`${summary.sites}곳`,caption:`활성 배치 ${summary.assignments}건`,href:"/sites"},
    {label:"운영 직무",value:`${summary.jobs}개`,caption:"급여기준 버전 관리",href:"/jobs"},
    {label:"유효 계약",value:`${summary.contracts}건`,caption:`30일 내 만료 ${summary.expiring}건`,href:"/contracts"},
  ];
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-teal-700">오늘 할 일</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">한성자동차 운영 관리</h1><p className="mt-2 text-sm text-slate-500">이 화면부터 새 업무는 프로그램에서 직접 처리합니다. Excel 업로드는 일상 업무에 사용하지 않습니다.</p></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=><Link key={c.label} href={c.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm font-semibold text-slate-500">{c.label}</p><p className="mt-2 text-3xl font-black text-slate-950">{c.value}</p><p className="mt-2 text-xs text-slate-400">{c.caption}</p></Link>)}</section>
    <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-950">빠른 업무 시작</h2><p className="mt-1 text-xs text-slate-500">월별 Excel을 만들기 전에 먼저 필요한 기준정보를 프로그램에서 관리합니다.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link href="/workers" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-bold">신규 인력 등록</p><p className="mt-1 text-xs text-slate-500">기본정보 등록 후 상세에서 배치·계약 연결</p></Link>
        <Link href="/sites" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-bold">지점 관리</p><p className="mt-1 text-xs text-slate-500">공식명칭·책임자·운영상태 관리</p></Link>
        <Link href="/jobs" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-bold">직무·급여기준</p><p className="mt-1 text-xs text-slate-500">직무와 적용기간별 급여조건 등록</p></Link>
        <Link href="/contracts" className="rounded-xl border border-slate-200 p-4 hover:border-teal-300"><p className="font-bold">배치·계약</p><p className="mt-1 text-xs text-slate-500">지점 이동과 계약 연장 이력 처리</p></Link>
      </div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-950">계약 확인</h2><p className="mt-1 text-xs text-slate-500">유효 계약 종료일 기준</p></div><Link href="/contracts" className="text-xs font-bold text-teal-700">전체 보기</Link></div><div className="mt-5 space-y-3">{expiring.length?expiring.map(c=><div key={v(c.id)} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><div><p className="text-sm font-bold">{v(c.worker_name)}</p><p className="text-xs text-slate-500">{v(c.site_name)} {v(c.job_name)}</p></div><span className="text-sm font-semibold text-slate-700">~ {v(c.ended_at)}</span></div>):<div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">등록된 유효 계약이 없습니다.</div>}</div></section>
    </div>
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><p className="font-bold text-blue-950">Phase 1 운영 기준</p><p className="mt-1 text-sm text-blue-800">기존 Excel은 과거 데이터의 1회 이관·검증 자료로만 남깁니다. 앞으로 생성되는 인력·지점·직무·배치·계약은 운영 DB가 원본입니다.</p></section>
  </div>;
}
