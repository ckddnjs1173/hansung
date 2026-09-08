import Link from "next/link";
import { notFound } from "next/navigation";
import { createAssignment, createContract, updateWorker } from "@/app/actions";
import { getWorker, options } from "@/lib/operations";

export const dynamic = "force-dynamic";
const v=(x:unknown)=>String(x??"");
const n=(x:unknown)=>Number(x??0).toLocaleString("ko-KR");

export default async function Page({params}:{params:Promise<{id:string}>}) {
  const {id}=await params; const data=getWorker(Number(id)); if(!data) notFound();
  const {worker,assignments,contracts}=data; const opts=options();
  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><Link href="/workers" className="text-sm font-semibold text-teal-700">← 인력 목록</Link><h1 className="mt-2 text-3xl font-bold text-slate-950">{v(worker.name)}</h1><p className="mt-1 text-sm text-slate-500">사번 {v(worker.employee_no)||"미등록"} · {v(worker.status)}</p></div><span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-bold text-teal-800">{v(worker.status)}</span></header>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">기본정보</h2>
      <form action={updateWorker} className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-4"><input type="hidden" name="id" value={v(worker.id)} />
        <label className="text-xs font-semibold text-slate-500">성명<input name="name" required defaultValue={v(worker.name)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-500">사번<input name="employee_no" defaultValue={v(worker.employee_no)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-500">연락처<input name="phone" defaultValue={v(worker.phone)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-500">이메일<input name="email" defaultValue={v(worker.email)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-500">생년월일<input name="birth_date" type="date" defaultValue={v(worker.birth_date)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-500">입사일<input name="joined_at" type="date" defaultValue={v(worker.joined_at)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-500">퇴사일<input name="left_at" type="date" defaultValue={v(worker.left_at)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-500">상태<select name="status" defaultValue={v(worker.status)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm"><option>입사예정</option><option>재직</option><option>휴직</option><option>퇴사</option></select></label>
        <label className="text-xs font-semibold text-slate-500 md:col-span-2">주소<input name="address" defaultValue={v(worker.address)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-slate-500 md:col-span-2">특이사항<input name="note" defaultValue={v(worker.note)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" /></label>
        <div className="md:col-span-3 xl:col-span-4"><button className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">기본정보 저장</button></div>
      </form>
    </section>

    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">지점·직무 배치</h2><p className="mt-1 text-xs text-slate-500">새 배치를 활성화하면 기존 활성 배치는 자동 종료됩니다.</p>
        <form action={createAssignment} className="mt-4 grid gap-3 sm:grid-cols-2"><input type="hidden" name="worker_id" value={v(worker.id)} />
          <select name="site_id" required className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option value="">지점 선택 *</option>{opts.sites.map(r=><option key={v(r.id)} value={v(r.id)}>{v(r.name)}</option>)}</select>
          <select name="job_id" required className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option value="">직무 선택 *</option>{opts.jobs.map(r=><option key={v(r.id)} value={v(r.id)}>{v(r.name)}</option>)}</select>
          <input name="started_at" type="date" required className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
          <select name="work_type" defaultValue="주중" className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option>주중</option><option>주말</option><option>스케줄</option><option>야간</option><option>단기</option></select>
          <select name="pay_rule_id" className="h-10 rounded-xl border border-slate-200 px-3 text-sm sm:col-span-2"><option value="">급여기준 선택(선택)</option>{opts.payRules.map(r=><option key={v(r.id)} value={v(r.id)}>{v(r.job_name)} · {v(r.effective_from)} · {n(r.base_salary)}원</option>)}</select>
          <button className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white sm:col-span-2">배치 등록</button>
        </form>
        <div className="mt-5 space-y-3">{assignments.map(a=><div key={v(a.id)} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between gap-3"><div><p className="font-bold">{v(a.site_name)} · {v(a.job_name)}</p><p className="mt-1 text-xs text-slate-500">{v(a.started_at)} ~ {v(a.ended_at)||"현재"} · {v(a.work_type)}</p></div><span className="text-xs font-bold text-teal-700">{v(a.status)}</span></div>{Number(a.base_salary)>0?<p className="mt-2 text-sm text-slate-600">적용 기본급 {n(a.base_salary)}원 · 식대 {n(a.meal_allowance)}원</p>:null}</div>)}</div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold">계약 이력</h2><p className="mt-1 text-xs text-slate-500">최초·연장·변경 계약을 이력으로 누적합니다.</p>
        <form action={createContract} className="mt-4 grid gap-3 sm:grid-cols-2"><input type="hidden" name="worker_id" value={v(worker.id)} />
          <select name="assignment_id" className="h-10 rounded-xl border border-slate-200 px-3 text-sm sm:col-span-2"><option value="">배치 연결(선택)</option>{assignments.map(a=><option key={v(a.id)} value={v(a.id)}>{v(a.site_name)} · {v(a.job_name)} · {v(a.started_at)}</option>)}</select>
          <select name="contract_type" defaultValue={contracts.length?"연장":"최초"} className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option>최초</option><option>연장</option><option>변경</option><option>종료</option></select>
          <select name="status" defaultValue="유효" className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option>예정</option><option>유효</option><option>만료</option><option>종료</option></select>
          <input name="started_at" type="date" required aria-label="계약 시작일" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
          <input name="ended_at" type="date" required aria-label="계약 종료일" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
          <input name="note" placeholder="계약 메모" className="h-10 rounded-xl border border-slate-200 px-3 text-sm sm:col-span-2" />
          <button className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white sm:col-span-2">계약 등록</button>
        </form>
        <div className="mt-5 space-y-3">{contracts.map(c=><div key={v(c.id)} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between"><p className="font-bold">{v(c.sequence_no)}차 · {v(c.contract_type)}</p><span className="text-xs font-bold text-teal-700">{v(c.status)}</span></div><p className="mt-1 text-sm text-slate-600">{v(c.started_at)} ~ {v(c.ended_at)}</p><p className="mt-1 text-xs text-slate-400">{v(c.site_name)} {v(c.job_name)}</p></div>)}</div>
      </section>
    </div>
  </div>;
}
