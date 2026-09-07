import "server-only";
import type { ModulePageProps } from "@/components/ui/module-page";
import { display, formatNumber, formatWon } from "@/lib/format";
import { hasLocalDatabase, withDatabase } from "@/lib/database";

type DbRow = Record<string, unknown>;
const all = (sql: string, ...params: unknown[]) => withDatabase((db) => db.prepare(sql).all(...params) as DbRow[]) ?? [];
const one = (sql: string, ...params: unknown[]) => withDatabase((db) => db.prepare(sql).get(...params) as DbRow | undefined) ?? undefined;
const count = (sql: string, ...params: unknown[]) => Number(one(sql, ...params)?.count ?? 0);
const base = (title: string, eyebrow: string, description: string, actionLabel: string) => ({ title, eyebrow, description, actionLabel, loaded:hasLocalDatabase() });

export function getWorkersView(): ModulePageProps {
  const rows=all(`SELECT w.name,w.employee_no,w.status,COALESCE(s.name,'') site,COALESCE(a.job_name,w.occupation,'') job,COALESCE(a.contract_first,'') contract_first FROM workers w LEFT JOIN assignments a ON a.worker_id=w.id AND a.status='활성' LEFT JOIN sites s ON s.id=a.site_id ORDER BY CASE w.status WHEN '재직' THEN 0 ELSE 1 END,w.name LIMIT 200`);
  return {...base("인력 관리","실제 근로자명부 통합","재직·퇴사 명부와 현재 배치 정보를 출처와 함께 관리합니다.","인력 등록"),stats:[
    {label:"통합 인력",value:`${formatNumber(count('SELECT COUNT(*) count FROM workers'))}명`,caption:"원본 명부 중복키 기준",icon:"users",iconClass:"bg-teal-50 text-teal-700"},
    {label:"재직",value:`${formatNumber(count("SELECT COUNT(*) count FROM workers WHERE status='재직'"))}명`,caption:"재직 원본 기준",icon:"check",iconClass:"bg-emerald-50 text-emerald-700"},
    {label:"퇴사",value:`${formatNumber(count("SELECT COUNT(*) count FROM workers WHERE status='퇴사'"))}명`,caption:"이력 보존",icon:"clock",iconClass:"bg-slate-100 text-slate-600"},
    {label:"활성 배치",value:`${formatNumber(count("SELECT COUNT(*) count FROM assignments WHERE status='활성'"))}건`,caption:"사용사업관리대장 기준",icon:"building",iconClass:"bg-blue-50 text-blue-700"}],
    columns:[{key:"name",label:"성명"},{key:"employeeNo",label:"사번"},{key:"site",label:"현재 지점"},{key:"job",label:"직무"},{key:"contract",label:"계약 기간"}],
    rows:rows.map(r=>({name:display(r.name),employeeNo:display(r.employee_no),site:display(r.site),job:display(r.job),contract:display(r.contract_first),status:display(r.status),tone:r.status==='재직'?'green':'slate'}))};
}

export function getSitesView(): ModulePageProps {
  const rows=all(`SELECT s.name,COUNT(a.id) headcount,GROUP_CONCAT(DISTINCT a.job_name) jobs FROM sites s LEFT JOIN assignments a ON a.site_id=s.id AND a.status='활성' GROUP BY s.id ORDER BY headcount DESC,s.name`);
  return {...base("지점·직무","실제 사용사업관리대장","배치 이력에서 확인된 지점과 운영 직무를 자동 집계합니다.","지점 등록"),stats:[
    {label:"확인된 지점",value:`${formatNumber(rows.length)}곳`,caption:"원본 지점명 기준",icon:"building",iconClass:"bg-teal-50 text-teal-700"},
    {label:"활성 배치",value:`${formatNumber(count("SELECT COUNT(*) count FROM assignments WHERE status='활성'"))}건`,caption:"현재 운영",icon:"users",iconClass:"bg-blue-50 text-blue-700"},
    {label:"운영 직무",value:`${formatNumber(count("SELECT COUNT(DISTINCT job_name) count FROM assignments WHERE job_name<>''"))}개`,caption:"표기 통합 전",icon:"document",iconClass:"bg-emerald-50 text-emerald-700"},
    {label:"명칭 검토",value:"필요",caption:"동일 지점 표기 정리",icon:"alert",iconClass:"bg-amber-50 text-amber-700"}],
    columns:[{key:"site",label:"지점"},{key:"headcount",label:"활성 배치"},{key:"jobs",label:"운영 직무"}],
    rows:rows.map(r=>({site:display(r.name),headcount:`${formatNumber(r.headcount)}명`,jobs:display(r.jobs),status:Number(r.headcount)>0?'운영':'이력',tone:Number(r.headcount)>0?'green':'slate'}))};
}

export function getContractsView(): ModulePageProps {
  const rows=all(`SELECT w.name,s.name site,a.job_name,a.contract_first,a.contract_second,a.status FROM assignments a JOIN workers w ON w.id=a.worker_id LEFT JOIN sites s ON s.id=a.site_id ORDER BY CASE a.status WHEN '활성' THEN 0 ELSE 1 END,w.name LIMIT 200`);
  return {...base("배치·계약","실제 계약기간 통합","1·2차 파견기간과 지점·직무 배치 이력을 연결합니다.","배치 등록"),stats:[
    {label:"전체 배치",value:`${formatNumber(count('SELECT COUNT(*) count FROM assignments'))}건`,caption:"재직·종료 포함",icon:"document",iconClass:"bg-teal-50 text-teal-700"},
    {label:"활성",value:`${formatNumber(count("SELECT COUNT(*) count FROM assignments WHERE status='활성'"))}건`,caption:"현재 명부 기준",icon:"check",iconClass:"bg-emerald-50 text-emerald-700"},
    {label:"종료 이력",value:`${formatNumber(count("SELECT COUNT(*) count FROM assignments WHERE status='종료'"))}건`,caption:"추적 가능",icon:"clock",iconClass:"bg-slate-100 text-slate-600"},
    {label:"계약기간 누락",value:`${formatNumber(count("SELECT COUNT(*) count FROM assignments WHERE COALESCE(contract_first,'')='' AND COALESCE(contract_second,'')=''"))}건`,caption:"원본 보완 필요",icon:"alert",iconClass:"bg-amber-50 text-amber-700"}],
    columns:[{key:"worker",label:"성명"},{key:"site",label:"지점"},{key:"job",label:"직무"},{key:"first",label:"1차 기간"},{key:"second",label:"2차 기간"}],
    rows:rows.map(r=>({worker:display(r.name),site:display(r.site),job:display(r.job_name),first:display(r.contract_first),second:display(r.contract_second),status:display(r.status),tone:r.status==='활성'?'green':'slate'}))};
}

export function getSubstitutesView(): ModulePageProps {
  const rows=all(`SELECT name,experience_type,total_work_count,service_count,showroom_count,recent_site,recent_work_date FROM substitute_profiles ORDER BY total_work_count DESC,name LIMIT 200`);
  return {...base("대체근무","실제 대체인력 DB","근무 횟수·경험 유형·최근 지점을 기준으로 후보를 찾습니다.","대체근무 등록"),stats:[
    {label:"대체인력",value:`${formatNumber(rows.length)}명`,caption:"대타 DB 기준",icon:"users",iconClass:"bg-teal-50 text-teal-700"},
    {label:"2회 이상 경험",value:`${formatNumber(count('SELECT COUNT(*) count FROM substitute_profiles WHERE total_work_count>=2'))}명`,caption:"우선 후보",icon:"check",iconClass:"bg-emerald-50 text-emerald-700"},
    {label:"근무 이력",value:`${formatNumber(count('SELECT COUNT(*) count FROM substitute_work_history'))}건`,caption:"일자·지점별",icon:"calendar",iconClass:"bg-blue-50 text-blue-700"},
    {label:"경험 미분류",value:`${formatNumber(count("SELECT COUNT(*) count FROM substitute_profiles WHERE COALESCE(experience_type,'')=''"))}명`,caption:"확인 필요",icon:"alert",iconClass:"bg-amber-50 text-amber-700"}],
    columns:[{key:"name",label:"성명"},{key:"type",label:"경험 유형"},{key:"count",label:"총 근무"},{key:"mix",label:"SVC / S·R"},{key:"recent",label:"최근 근무"}],
    rows:rows.map(r=>({name:display(r.name),type:display(r.experience_type),count:`${formatNumber(r.total_work_count)}회`,mix:`${formatNumber(r.service_count)} / ${formatNumber(r.showroom_count)}`,recent:`${display(r.recent_site)} · ${display(r.recent_work_date)}`,status:Number(r.total_work_count)>=2?'경력':'1회',tone:Number(r.total_work_count)>=2?'green':'blue'}))};
}

export function getBillingView(): ModulePageProps {
  const rows=all(`SELECT worker_name,department,job_name,worked_days,payroll_total,supply_amount,total_amount FROM monthly_billing_items ORDER BY department,worker_name LIMIT 200`);
  const totals=one(`SELECT SUM(payroll_total) payroll,SUM(supply_amount) supply,SUM(total_amount) total FROM monthly_billing_items`) ?? {};
  return {...base("월 급여·청구","2026년 9월 실제 청구서","청구서의 계산 열과 직무별 급여 규칙을 구조화했습니다.","마감 회차 생성"),stats:[
    {label:"청구 대상",value:`${formatNumber(rows.length)}명`,caption:"청구09월 유효 행",icon:"users",iconClass:"bg-teal-50 text-teal-700"},
    {label:"급여 합계",value:formatWon(totals.payroll),caption:"원본 계산 결과",icon:"receipt",iconClass:"bg-blue-50 text-blue-700"},
    {label:"공급가 합계",value:formatWon(totals.supply),caption:"원본 계산 결과",icon:"chart",iconClass:"bg-emerald-50 text-emerald-700"},
    {label:"요율 검토",value:"필요",caption:"원본 내 상이한 표기 존재",icon:"alert",iconClass:"bg-amber-50 text-amber-700"}],
    columns:[{key:"worker",label:"성명"},{key:"department",label:"부서"},{key:"job",label:"직무"},{key:"days",label:"근무일"},{key:"payroll",label:"급여 계"},{key:"total",label:"청구 합계"}],
    rows:rows.map(r=>({worker:display(r.worker_name),department:display(r.department),job:display(r.job_name),days:formatNumber(r.worked_days),payroll:formatWon(r.payroll_total),total:formatWon(r.total_amount),status:'원본 반영',tone:'green'}))};
}

export function getAttendanceView(): ModulePageProps {
  const rows=all(`SELECT worker_name,worker_status,source_sheet,row_number FROM leave_sources WHERE worker_name IS NOT NULL ORDER BY source_sheet,row_number LIMIT 200`);
  return {...base("근태·연차","실제 연차대장 구조화","넓은 날짜 열 기반 원본을 사람별 연차 원장으로 전환하는 검증 단계입니다.","근태 등록"),stats:[
    {label:"연차 원본 행",value:`${formatNumber(count('SELECT COUNT(*) count FROM leave_sources'))}건`,caption:"공백 제외 전체 행",icon:"calendar",iconClass:"bg-teal-50 text-teal-700"},
    {label:"재직 시트",value:`${formatNumber(count("SELECT COUNT(*) count FROM leave_sources WHERE worker_status='재직'"))}행`,caption:"원본 보존",icon:"check",iconClass:"bg-emerald-50 text-emerald-700"},
    {label:"퇴사 시트",value:`${formatNumber(count("SELECT COUNT(*) count FROM leave_sources WHERE worker_status='퇴사'"))}행`,caption:"이력 보존",icon:"clock",iconClass:"bg-slate-100 text-slate-600"},
    {label:"정규화",value:"검증 중",caption:"날짜·사용일 매핑",icon:"alert",iconClass:"bg-amber-50 text-amber-700"}],
    columns:[{key:"worker",label:"인식 성명"},{key:"sheet",label:"원본 시트"},{key:"row",label:"원본 행"}],
    rows:rows.map(r=>({worker:display(r.worker_name),sheet:display(r.source_sheet),row:`${formatNumber(r.row_number)}행`,status:display(r.worker_status),tone:r.worker_status==='재직'?'green':'slate'}))};
}

export function getDashboardData() {
  const latest=one("SELECT completed_at,file_count,row_count FROM import_runs WHERE status='completed' ORDER BY id DESC LIMIT 1");
  return {loaded:hasLocalDatabase(),latest,activeWorkers:count("SELECT COUNT(*) count FROM workers WHERE status='재직'"),activeAssignments:count("SELECT COUNT(*) count FROM assignments WHERE status='활성'"),sites:count('SELECT COUNT(*) count FROM sites'),substitutes:count('SELECT COUNT(*) count FROM substitute_profiles'),payRules:count('SELECT COUNT(*) count FROM pay_rule_versions'),billingItems:count('SELECT COUNT(*) count FROM monthly_billing_items'),sourceFiles:count('SELECT COUNT(*) count FROM source_files'),categories:all('SELECT category,COUNT(*) count FROM source_files GROUP BY category ORDER BY category')};
}

export function getDocumentsView(): ModulePageProps {
  const rows=all('SELECT relative_path,category,extension,size_bytes,modified_at FROM source_files ORDER BY category,relative_path');
  return {...base("문서·교육","실제 원본 문서 인덱스","계약서·교육자료·직무문서의 위치와 유형을 추적합니다. 원본 자체는 복사하지 않습니다.","문서 등록"),stats:[
    {label:"전체 원본",value:`${formatNumber(rows.length)}개`,caption:"현재 연결 경로",icon:"folder",iconClass:"bg-teal-50 text-teal-700"},
    {label:"Excel",value:`${formatNumber(count("SELECT COUNT(*) count FROM source_files WHERE extension='.xlsx'"))}개`,caption:"데이터 가져오기 대상",icon:"chart",iconClass:"bg-emerald-50 text-emerald-700"},
    {label:"Word",value:`${formatNumber(count("SELECT COUNT(*) count FROM source_files WHERE extension='.docx'"))}개`,caption:"계약·교육 템플릿",icon:"document",iconClass:"bg-blue-50 text-blue-700"},
    {label:"PDF·PPT·이미지",value:`${formatNumber(count("SELECT COUNT(*) count FROM source_files WHERE extension IN ('.pdf','.pptx','.png')"))}개`,caption:"열람 자료",icon:"receipt",iconClass:"bg-amber-50 text-amber-700"}],
    columns:[{key:"file",label:"파일"},{key:"category",label:"업무 구역"},{key:"type",label:"형식"},{key:"size",label:"크기"},{key:"modified",label:"수정일"}],
    rows:rows.map(r=>({file:display(r.relative_path),category:display(r.category),type:display(r.extension).slice(1).toUpperCase(),size:`${Math.max(1,Math.round(Number(r.size_bytes)/1024))} KB`,modified:display(r.modified_at).slice(0,10),status:r.extension==='.xlsx'?'데이터 연결':'원본 참조',tone:r.extension==='.xlsx'?'green':'blue'}))};
}

export function getReportsView(): ModulePageProps {
  const rows=all(`SELECT p.job_name,p.effective_year,p.review_status,COUNT(c.id) component_count,MAX(CASE WHEN c.row_number=35 THEN c.amount END) fee_before_vat FROM pay_rule_versions p LEFT JOIN pay_rule_components c ON c.pay_rule_version_id=p.id GROUP BY p.id ORDER BY p.job_name`);
  return {...base("급여규칙 보고서","실제 직무별 급여표","직무별 구성항목과 원본 검토 상태를 비교합니다.","검토 결과 기록"),stats:[
    {label:"급여 규칙",value:`${formatNumber(rows.length)}개`,caption:"2026년 직무별",icon:"chart",iconClass:"bg-teal-50 text-teal-700"},
    {label:"구성 항목",value:`${formatNumber(count('SELECT COUNT(*) count FROM pay_rule_components'))}개`,caption:"수당·보험·비용",icon:"document",iconClass:"bg-blue-50 text-blue-700"},
    {label:"검토 필요",value:`${formatNumber(count("SELECT COUNT(*) count FROM pay_rule_versions WHERE review_status='needs_review'"))}개`,caption:"요율 확정 전",icon:"alert",iconClass:"bg-amber-50 text-amber-700"},
    {label:"청구 인원",value:`${formatNumber(count('SELECT COUNT(*) count FROM monthly_billing_items'))}명`,caption:"2026년 9월",icon:"users",iconClass:"bg-emerald-50 text-emerald-700"}],
    columns:[{key:"job",label:"직무 규칙"},{key:"year",label:"적용연도"},{key:"components",label:"구성항목"},{key:"fee",label:"VAT 전 파견료"}],
    rows:rows.map(r=>({job:display(r.job_name),year:display(r.effective_year),components:`${formatNumber(r.component_count)}개`,fee:r.fee_before_vat==null?'원본 수식':formatWon(r.fee_before_vat),status:'검토 필요',tone:'amber'}))};
}

export function getSettingsView(): ModulePageProps {
  const rows=all('SELECT id,started_at,completed_at,file_count,row_count,status FROM import_runs ORDER BY id DESC LIMIT 20');
  return {...base("데이터 설정","로컬 가져오기 관리","원본 경로와 DB는 이 PC에서만 사용하며 Git에 저장하지 않습니다.","데이터 다시 가져오기"),stats:[
    {label:"가져오기 상태",value:rows[0]?.status==='completed'?'완료':'대기',caption:display(rows[0]?.completed_at).slice(0,19),icon:"check",iconClass:"bg-emerald-50 text-emerald-700"},
    {label:"원본 파일",value:`${formatNumber(rows[0]?.file_count)}개`,caption:"현재 실행 기준",icon:"folder",iconClass:"bg-blue-50 text-blue-700"},
    {label:"원본 행",value:`${formatNumber(rows[0]?.row_count)}행`,caption:"공백 행 제외",icon:"chart",iconClass:"bg-teal-50 text-teal-700"},
    {label:"보안 위치",value:"로컬",caption:"data/local Git 제외",icon:"settings",iconClass:"bg-amber-50 text-amber-700"}],
    columns:[{key:"run",label:"실행"},{key:"started",label:"시작"},{key:"completed",label:"완료"},{key:"files",label:"파일"},{key:"rows",label:"행"}],
    rows:rows.map(r=>({run:`#${formatNumber(r.id)}`,started:display(r.started_at).replace('T',' ').slice(0,19),completed:display(r.completed_at).replace('T',' ').slice(0,19),files:`${formatNumber(r.file_count)}개`,rows:`${formatNumber(r.row_count)}행`,status:r.status==='completed'?'완료':'실패',tone:r.status==='completed'?'green':'red'}))};
}
