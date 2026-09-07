import type { IconName } from "@/components/ui/icon";
import type { BadgeTone } from "@/components/ui/status-badge";
export const dashboardStats: Array<{ label:string; value:string; unit:string; change:string; caption:string; icon:IconName; iconClass:string; changeClass:string }> = [
  { label:"현재 재직 인원", value:"128", unit:"명", change:"+4명", caption:"전월 말 대비", icon:"users", iconClass:"bg-teal-50 text-teal-700", changeClass:"text-emerald-600" },
  { label:"계약 만료 예정", value:"7", unit:"건", change:"30일 이내", caption:"7일 이내 2건", icon:"document", iconClass:"bg-blue-50 text-blue-700", changeClass:"text-blue-600" },
  { label:"승인 대기", value:"13", unit:"건", change:"확인 필요", caption:"근태 8 · 연차 5", icon:"clock", iconClass:"bg-amber-50 text-amber-700", changeClass:"text-amber-600" },
  { label:"대체근무 미배정", value:"2", unit:"건", change:"긴급 1건", caption:"이번 주 요청", icon:"swap", iconClass:"bg-rose-50 text-rose-700", changeClass:"text-rose-600" },
];
export const urgentTasks: Array<{ title:string; description:string; status:string; due:string; tone:BadgeTone; icon:IconName; iconClass:string }> = [
  { title:"근무내역 미제출 확인", description:"가상 남부센터 외 3개 지점 · 총 8건", status:"마감 임박", due:"오늘", tone:"red", icon:"calendar", iconClass:"bg-rose-50 text-rose-700" },
  { title:"계약 만료 검토", description:"30일 이내 만료 예정 계약 7건", status:"검토 필요", due:"9월 10일", tone:"amber", icon:"document", iconClass:"bg-amber-50 text-amber-700" },
  { title:"연차 신청 승인", description:"현장 승인 완료 · 운영 승인 대기 5건", status:"승인 대기", due:"9월 11일", tone:"blue", icon:"check", iconClass:"bg-blue-50 text-blue-700" },
  { title:"대체근무 후보 확정", description:"가상 동부센터 주말 지원 요청", status:"미배정", due:"9월 12일", tone:"red", icon:"swap", iconClass:"bg-teal-50 text-teal-700" },
];
export const siteOccupancy = [
  { name:"가상 중앙센터", current:34, capacity:36, barClass:"bg-teal-600" }, { name:"가상 남부센터", current:28, capacity:28, barClass:"bg-emerald-500" },
  { name:"가상 동부센터", current:19, capacity:22, barClass:"bg-amber-500" }, { name:"가상 서부센터", current:24, capacity:25, barClass:"bg-blue-500" },
];
export const closingSteps: Array<{ title:string; caption:string; status:string; tone:BadgeTone; numberClass:string }> = [
  { title:"자료 수집", caption:"120 / 128명 제출", status:"진행 중", tone:"blue", numberClass:"bg-blue-100 text-blue-700" },
  { title:"예외 검증", caption:"오류 3건 확인 필요", status:"대기", tone:"amber", numberClass:"bg-amber-100 text-amber-700" },
  { title:"금액 계산", caption:"자료 수집 후 자동 계산", status:"예정", tone:"slate", numberClass:"bg-slate-100 text-slate-500" },
  { title:"검토·잠금", caption:"최종 승인 후 마감", status:"예정", tone:"slate", numberClass:"bg-slate-100 text-slate-500" },
];
