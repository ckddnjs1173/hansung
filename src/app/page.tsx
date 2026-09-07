import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";
import { formatNumber } from "@/lib/format";
import { getDashboardData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const data=getDashboardData();
  const cards: Array<{label:string;value:string;caption:string;icon:IconName;color:string;href:string}> = [
    {label:"재직 인력",value:`${formatNumber(data.activeWorkers)}명`,caption:"근로자명부 기준",icon:"users",color:"bg-teal-50 text-teal-700",href:"/workers"},
    {label:"활성 배치",value:`${formatNumber(data.activeAssignments)}건`,caption:`확인 지점 ${formatNumber(data.sites)}곳`,icon:"building",color:"bg-blue-50 text-blue-700",href:"/contracts"},
    {label:"대체인력",value:`${formatNumber(data.substitutes)}명`,caption:"근무 이력 연결",icon:"swap",color:"bg-emerald-50 text-emerald-700",href:"/substitutes"},
    {label:"9월 청구 대상",value:`${formatNumber(data.billingItems)}명`,caption:`급여 규칙 ${formatNumber(data.payRules)}개`,icon:"receipt",color:"bg-amber-50 text-amber-700",href:"/billing"},
  ];
  return <div className="space-y-6">
    <header><p className="mb-1 text-sm font-semibold text-teal-700">실제 운영자료 통합 현황</p><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">한성자동차 운영 대시보드</h1><p className="mt-2 text-sm text-slate-500">원본 파일을 한 번 가져오면 인력·배치·대체근무·급여·청구가 함께 갱신됩니다.</p></header>
    {!data.loaded?<section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-bold text-amber-950">로컬 실제 데이터가 없습니다.</p><p className="mt-1 text-sm text-amber-800">README의 가져오기 명령을 실행하세요. 원본과 생성 DB는 Git에 올라가지 않습니다.</p></section>:<section className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-emerald-950">실제 원본 {formatNumber(data.sourceFiles)}개 연결 완료</p><p className="mt-1 text-sm text-emerald-800">마지막 가져오기: {String(data.latest?.completed_at ?? "-").replace("T"," ").slice(0,19)}</p></div><span className="text-sm font-semibold text-emerald-800">개인정보는 로컬 DB에만 저장</span></section>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(card=><Link href={card.href} key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className={`grid size-10 place-items-center rounded-xl ${card.color}`}><Icon name={card.icon} className="size-5" /></span><p className="mt-4 text-sm font-medium text-slate-500">{card.label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{card.value}</p><p className="mt-2 text-xs text-slate-400">{card.caption}</p></Link>)}</section>
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-950">원본 자료 구성</h2><p className="mt-1 text-xs text-slate-500">파일 내용은 복사하지 않고 출처를 추적합니다.</p><div className="mt-5 space-y-3">{data.categories.map(item=><div key={String(item.category)} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm font-semibold text-slate-700">{String(item.category)}</span><span className="text-sm font-bold text-teal-700">{formatNumber(item.count)}개</span></div>)}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-950">데이터 검증 상태</h2><div className="mt-5 space-y-4 text-sm"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="font-bold text-emerald-900">완료: 원본 48개 인덱싱</p><p className="mt-1 text-emerald-700">Excel 원시 행과 핵심 업무 테이블을 함께 보존합니다.</p></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="font-bold text-amber-900">확인 필요: 보험 요율 표기</p><p className="mt-1 text-amber-700">급여표의 셀 값과 설명 문구가 다른 항목은 자동 확정하지 않습니다.</p></div><div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><p className="font-bold text-blue-900">다음 마감: 연차 날짜 정규화</p><p className="mt-1 text-blue-700">원본의 가로형 날짜표를 사람별 사용 이력으로 검증합니다.</p></div></div></section>
    </div>
  </div>;
}
