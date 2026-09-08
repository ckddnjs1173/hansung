export const metadata={title:"보고서"};
const exports=[
  {kind:"workers",title:"인력 명단",desc:"사번·성명·재직상태·현재 지점/직무"},
  {kind:"attendance",title:"근태 예외",desc:"월별 연장·야간·휴일·결근·무급 등"},
  {kind:"leave",title:"연차 원장",desc:"발생·사용·조정·만료·퇴사정산 이력"},
  {kind:"payroll",title:"급여",desc:"월별 개인 급여 계산 결과"},
  {kind:"billing",title:"고객사 청구",desc:"월별 개인 청구 구성과 총액"},
  {kind:"sites",title:"지점별 인원",desc:"지점별 현재 인원과 운영 직무"},
];
export default function ReportsPage(){const month=new Date().toISOString().slice(0,7);return <div className="space-y-6"><header><p className="text-sm font-semibold text-teal-700">내보내기</p><h1 className="mt-1 text-3xl font-black text-slate-950">보고서 · CSV 출력</h1><p className="mt-2 text-sm text-slate-500">Excel은 더 이상 입력 원본이 아닙니다. 필요한 제출·가공 자료만 프로그램에서 CSV로 내보냅니다.</p></header><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{exports.map(item=><div key={item.kind} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-bold text-slate-950">{item.title}</h2><p className="mt-2 min-h-10 text-sm text-slate-500">{item.desc}</p>{["attendance","payroll","billing"].includes(item.kind)?<form action={`/api/export/${item.kind}`} method="get" className="mt-4 flex gap-2"><input name="month" type="month" defaultValue={month} className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm"/><button className="rounded-xl bg-slate-900 px-4 text-sm font-bold text-white">CSV</button></form>:<a href={`/api/export/${item.kind}`} className="mt-4 inline-flex h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white">CSV 내보내기</a>}</div>)}</section><section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900"><b>PDF 출력</b><p className="mt-1">근로계약서·입사안내 등 생성 문서는 문서 화면에서 바로 인쇄하거나 브라우저의 ‘PDF로 저장’을 사용할 수 있습니다.</p></section></div>}
