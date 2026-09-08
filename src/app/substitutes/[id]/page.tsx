import Link from "next/link";
import { notFound } from "next/navigation";
import { assignSubstitute, completeSubstituteRequest, cancelSubstituteRequest } from "@/app/phase2-actions";
import { substituteCandidates } from "@/lib/phase2";

export const dynamic="force-dynamic";
const card="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params; const requestId=Number(id); if(!requestId) notFound();
  const data=substituteCandidates(requestId); if(!data.request) notFound(); const r=data.request;
  return <div className="space-y-6">
    <header><Link href="/substitutes" className="text-sm font-semibold text-teal-700">← 대체근무 목록</Link><h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">대체근무 후보 선택</h1><p className="mt-2 text-sm text-slate-500">{String(r.work_date)} · {String(r.site_name)} · {String(r.job_name)}</p></header>
    <section className={card}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Info label="상태" value={String(r.status)}/><Info label="근무시간" value={r.hours?`${String(r.hours)}시간`:"-"}/><Info label="사유" value={String(r.reason??"-")}/><Info label="메모" value={String(r.note??"-")}/></div></section>
    <section className={card}><div className="flex items-end justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-950">추천 후보</h2><p className="mt-1 text-xs text-slate-500">같은 지점 경험 3점 + 같은 직무 경험 2점 + 전체 근무 횟수로 우선순위를 계산합니다.</p></div></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>{["순위","성명","연락처","총 근무","해당 지점","해당 직무","최근 근무","점수","배정"].map(h=><th key={h} className="px-3 py-3">{h}</th>)}</tr></thead><tbody>{data.candidates.map((c,index)=><tr key={String(c.id)} className="border-b border-slate-100"><td className="px-3 py-3 font-bold text-slate-400">{index+1}</td><td className="px-3 py-3 font-semibold text-slate-900">{String(c.name)}</td><td className="px-3 py-3">{String(c.phone??"-")}</td><td className="px-3 py-3">{String(c.total_count??0)}회</td><td className="px-3 py-3">{String(c.site_count??0)}회</td><td className="px-3 py-3">{String(c.job_count??0)}회</td><td className="px-3 py-3">{String(c.recent_work_date??"-")}</td><td className="px-3 py-3 font-bold text-teal-700">{String(c.score??0)}</td><td className="px-3 py-3"><form action={assignSubstitute}><input type="hidden" name="request_id" value={requestId}/><input type="hidden" name="substitute_id" value={String(c.id)}/><button className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white">배정</button></form></td></tr>)}</tbody></table>{data.candidates.length===0&&<p className="py-10 text-center text-sm text-slate-400">활동 중인 대체인력이 없습니다. 먼저 대체인력을 등록하세요.</p>}</div></section>
    <section className={card}><h2 className="font-bold">요청 처리</h2><div className="mt-3 flex flex-wrap gap-2">{String(r.assigned_substitute_id??"")&&String(r.status)!=="완료"&&<form action={completeSubstituteRequest}><input type="hidden" name="request_id" value={requestId}/><button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white">배정 근무 완료 처리</button></form>}{!["완료","취소"].includes(String(r.status))&&<form action={cancelSubstituteRequest}><input type="hidden" name="request_id" value={requestId}/><button className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700">요청 취소</button></form>}</div></section>
  </div>;
}
function Info({label,value}:{label:string;value:string}){return <div><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>}
