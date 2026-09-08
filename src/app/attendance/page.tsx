import type { Metadata } from "next";
import { createAttendanceEvent, createLeaveEntry, deleteAttendanceEvent, deleteLeaveEntry } from "@/app/phase2-actions";
import { attendanceMonth, leaveOverview, phase2Options } from "@/lib/phase2";

export const metadata: Metadata = { title: "근태·연차" };
export const dynamic = "force-dynamic";

const input="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500";
const card="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const n=(v:unknown)=>Number(v??0);
const hm=(minutes:unknown)=>{const m=n(minutes);return m?`${Math.floor(m/60)}시간 ${m%60}분`:"-";};

export default async function Page({searchParams}:{searchParams:Promise<{month?:string}>}) {
  const query=await searchParams;
  const month=query.month&&/^\d{4}-\d{2}$/.test(query.month)?query.month:new Date().toISOString().slice(0,7);
  const attendance=attendanceMonth(month), leave=leaveOverview(), options=phase2Options();
  return <div className="space-y-6">
    <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-semibold text-teal-700">정상근무는 자동 · 예외만 입력</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">근태·연차</h1><p className="mt-2 text-sm text-slate-500">연장·야간·휴일·결근 등 예외와 연차 원장을 기록하면 이후 급여 계산에서 그대로 사용합니다.</p></div><form className="flex items-center gap-2"><input className={input} type="month" name="month" defaultValue={month}/><button className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white">월 조회</button></form></header>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Stat label="근태 예외" value={`${attendance.events.length}건`} sub={`${month} 등록 건`}/><Stat label="연차 원장" value={`${leave.ledger.length}건`} sub="최근 300건 기준"/><Stat label="잔액 부족" value={`${leave.balances.filter(r=>n(r.balance)<0).length}명`} sub="즉시 확인 필요"/><Stat label="관리 인원" value={`${attendance.summary.length}명`} sub="재직·휴직 기준"/>
    </section>

    <div className="grid gap-6 xl:grid-cols-2">
      <section className={card}><h2 className="text-lg font-bold text-slate-950">근태 예외 등록</h2><p className="mt-1 text-xs text-slate-500">정상근무는 별도 입력하지 않습니다.</p>
        <form action={createAttendanceEvent} className="mt-4 grid gap-3 sm:grid-cols-2">
          <select className={input} name="worker_id" required><option value="">근로자 선택</option>{options.workers.map(r=><option key={String(r.id)} value={String(r.id)}>{String(r.name)} {r.employee_no?`(${String(r.employee_no)})`:""}</option>)}</select>
          <input className={input} type="date" name="work_date" required/>
          <select className={input} name="event_type" required>{["연장","야간","휴일","지각","조퇴","결근","무급","휴직","기타"].map(x=><option key={x}>{x}</option>)}</select>
          <input className={input} type="number" name="minutes" min="0" step="1" placeholder="시간성 항목: 분(예 120)"/>
          <input className={input} type="number" name="days" min="0" step="0.5" placeholder="일수성 항목: 일(예 1)"/>
          <input className={`${input} sm:col-span-2`} name="note" placeholder="사유/메모"/>
          <button className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-bold text-white sm:col-span-2">근태 예외 저장</button>
        </form>
      </section>

      <section className={card}><h2 className="text-lg font-bold text-slate-950">연차 원장 등록</h2><p className="mt-1 text-xs text-slate-500">잔액은 발생·사용·조정·취소·만료·퇴사정산 기록을 합산해 자동 계산합니다.</p>
        <form action={createLeaveEntry} className="mt-4 grid gap-3 sm:grid-cols-2">
          <select className={input} name="worker_id" required><option value="">근로자 선택</option>{options.workers.map(r=><option key={String(r.id)} value={String(r.id)}>{String(r.name)}</option>)}</select>
          <input className={input} type="date" name="event_date" required/>
          <select className={input} name="event_type" required>{["발생","사용","조정","취소","만료","퇴사정산"].map(x=><option key={x}>{x}</option>)}</select>
          <input className={input} type="number" name="leave_days" min="0.5" step="0.5" placeholder="일수" required/>
          <input className={`${input} sm:col-span-2`} name="note" placeholder="사유/근거"/>
          <button className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-bold text-white sm:col-span-2">연차 원장 저장</button>
        </form>
      </section>
    </div>

    <section className={card}><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-950">{month} 근태 요약</h2><p className="mt-1 text-xs text-slate-500">급여 단계에서는 이 예외값만 계산에 반영합니다.</p></div></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="border-y border-slate-200 bg-slate-50 text-left text-xs text-slate-500"><tr>{["성명","지점","직무","연장","야간","휴일","지각","조퇴","결근","무급"].map(h=><th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{attendance.summary.map(r=><tr key={String(r.id)} className="border-b border-slate-100"><td className="px-3 py-3 font-semibold text-slate-900">{String(r.name)}</td><td className="px-3 py-3">{String(r.site_name??"-")}</td><td className="px-3 py-3">{String(r.job_name??"-")}</td><td className="px-3 py-3">{hm(r.overtime_minutes)}</td><td className="px-3 py-3">{hm(r.night_minutes)}</td><td className="px-3 py-3">{hm(r.holiday_minutes)}</td><td className="px-3 py-3">{n(r.tardy_count)||"-"}</td><td className="px-3 py-3">{n(r.early_count)||"-"}</td><td className="px-3 py-3">{n(r.absence_days)||"-"}</td><td className="px-3 py-3">{n(r.unpaid_days)||"-"}</td></tr>)}</tbody></table></div></section>

    <div className="grid gap-6 xl:grid-cols-2">
      <section className={card}><h2 className="text-lg font-bold text-slate-950">최근 근태 예외</h2><div className="mt-4 space-y-2">{attendance.events.slice(0,30).map(r=><div key={String(r.id)} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{String(r.worker_name)} · {String(r.event_type)}</p><p className="mt-1 text-xs text-slate-500">{String(r.work_date)} · {String(r.site_name??"지점 미지정")} · {n(r.minutes)?hm(r.minutes):`${n(r.days)}일`}</p></div><form action={deleteAttendanceEvent}><input type="hidden" name="id" value={String(r.id)}/><button className="text-xs font-semibold text-rose-600">삭제</button></form></div>)}{attendance.events.length===0&&<p className="py-6 text-center text-sm text-slate-400">등록된 예외가 없습니다.</p>}</div></section>
      <section className={card}><h2 className="text-lg font-bold text-slate-950">연차 잔액</h2><div className="mt-4 max-h-[520px] overflow-auto"><table className="w-full text-sm"><thead className="sticky top-0 bg-slate-50 text-left text-xs text-slate-500"><tr><th className="px-3 py-3">성명</th><th className="px-3 py-3">상태</th><th className="px-3 py-3 text-right">잔액</th><th className="px-3 py-3">최근 기록</th></tr></thead><tbody>{leave.balances.map(r=><tr key={String(r.id)} className="border-b border-slate-100"><td className="px-3 py-3 font-semibold">{String(r.name)}</td><td className="px-3 py-3">{String(r.status)}</td><td className={`px-3 py-3 text-right font-bold ${n(r.balance)<0?"text-rose-600":"text-teal-700"}`}>{n(r.balance).toFixed(1)}일</td><td className="px-3 py-3 text-slate-500">{String(r.last_event_date??"-")}</td></tr>)}</tbody></table></div></section>
    </div>

    <section className={card}><h2 className="text-lg font-bold text-slate-950">연차 원장 최근 기록</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr><th className="px-3 py-3">날짜</th><th className="px-3 py-3">성명</th><th className="px-3 py-3">유형</th><th className="px-3 py-3">일수</th><th className="px-3 py-3">사유</th><th/></tr></thead><tbody>{leave.ledger.map(r=><tr key={String(r.id)} className="border-b border-slate-100"><td className="px-3 py-3">{String(r.event_date)}</td><td className="px-3 py-3 font-semibold">{String(r.worker_name)}</td><td className="px-3 py-3">{String(r.event_type)}</td><td className="px-3 py-3">{n(r.leave_days)}일</td><td className="px-3 py-3 text-slate-500">{String(r.note??"-")}</td><td className="px-3 py-3 text-right"><form action={deleteLeaveEntry}><input type="hidden" name="id" value={String(r.id)}/><button className="text-xs font-semibold text-rose-600">삭제</button></form></td></tr>)}</tbody></table></div></section>
  </div>;
}

function Stat({label,value,sub}:{label:string;value:string;sub:string}){return <div className={card}><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-400">{sub}</p></div>}
