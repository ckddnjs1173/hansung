import type { ModulePageProps } from "@/components/ui/module-page";

export const moduleConfigs = {
  workers: {
    eyebrow:"인력 통합 마스터", title:"인력 관리", description:"재직 상태와 배치·계약 이력을 한곳에서 관리합니다.", actionLabel:"인력 등록",
    stats:[
      { label:"전체 인력", value:"142명", caption:"재직·입사예정·휴직 포함", icon:"users", iconClass:"bg-teal-50 text-teal-700" },
      { label:"현재 재직", value:"128명", caption:"전월 대비 4명 증가", icon:"check", iconClass:"bg-emerald-50 text-emerald-700" },
      { label:"입사 예정", value:"6명", caption:"이번 달 예정", icon:"calendar", iconClass:"bg-blue-50 text-blue-700" },
      { label:"퇴사 예정", value:"3명", caption:"정산 확인 필요", icon:"alert", iconClass:"bg-amber-50 text-amber-700" },
    ],
    columns:[{key:"worker",label:"인력"},{key:"employeeNo",label:"사번"},{key:"site",label:"배치 지점"},{key:"role",label:"직무"},{key:"startDate",label:"입사일"}],
    rows:[
      {worker:"가상 인력 001",employeeNo:"HS-26001",site:"가상 중앙센터",role:"운영 지원",startDate:"2025.03.04",status:"재직",tone:"green"},
      {worker:"가상 인력 002",employeeNo:"HS-26002",site:"가상 남부센터",role:"고객 안내",startDate:"2025.05.12",status:"재직",tone:"green"},
      {worker:"가상 인력 003",employeeNo:"HS-26003",site:"가상 동부센터",role:"서비스 지원",startDate:"2026.09.15",status:"입사 예정",tone:"blue"},
      {worker:"가상 인력 004",employeeNo:"HS-26004",site:"가상 서부센터",role:"운영 지원",startDate:"2024.11.20",status:"휴직",tone:"amber"},
    ],
  },
  sites: {
    eyebrow:"조직·기준정보", title:"지점·직무 관리", description:"지점 정원과 책임자, 운영 직무 기준을 관리합니다.", actionLabel:"지점 등록",
    stats:[
      {label:"운영 지점",value:"12곳",caption:"서비스센터 8 · 전시장 4",icon:"building",iconClass:"bg-teal-50 text-teal-700"},
      {label:"등록 직무",value:"9개",caption:"사용 중인 표준 직무",icon:"document",iconClass:"bg-blue-50 text-blue-700"},
      {label:"전체 정원",value:"136명",caption:"현재 배치 128명",icon:"users",iconClass:"bg-emerald-50 text-emerald-700"},
      {label:"정원 부족",value:"2곳",caption:"추가 배치 3명 필요",icon:"alert",iconClass:"bg-amber-50 text-amber-700"},
    ],
    columns:[{key:"site",label:"지점"},{key:"type",label:"유형"},{key:"manager",label:"책임자"},{key:"headcount",label:"배치 / 정원"},{key:"roles",label:"운영 직무"}],
    rows:[
      {site:"가상 중앙센터",type:"서비스센터",manager:"가상 책임자 A",headcount:"34 / 36명",roles:"4개",status:"운영",tone:"green"},
      {site:"가상 남부센터",type:"서비스센터",manager:"가상 책임자 B",headcount:"28 / 28명",roles:"3개",status:"정원 충족",tone:"teal"},
      {site:"가상 동부센터",type:"전시장",manager:"가상 책임자 C",headcount:"19 / 22명",roles:"3개",status:"충원 필요",tone:"amber"},
      {site:"가상 서부센터",type:"서비스센터",manager:"가상 책임자 D",headcount:"24 / 25명",roles:"4개",status:"운영",tone:"green"},
    ],
  },
  contracts: {
    eyebrow:"배치 및 계약 이력", title:"배치·계약", description:"누가 언제 어디에서 어떤 조건으로 근무하는지 관리합니다.", actionLabel:"배치 등록",
    stats:[
      {label:"활성 배치",value:"128건",caption:"현재 근무 중",icon:"users",iconClass:"bg-teal-50 text-teal-700"},
      {label:"만료 30일 이내",value:"7건",caption:"7일 이내 2건",icon:"clock",iconClass:"bg-amber-50 text-amber-700"},
      {label:"서명 대기",value:"3건",caption:"확인 요청 필요",icon:"document",iconClass:"bg-blue-50 text-blue-700"},
      {label:"이번 달 종료",value:"4건",caption:"연장 검토 포함",icon:"calendar",iconClass:"bg-rose-50 text-rose-700"},
    ],
    columns:[{key:"worker",label:"인력"},{key:"site",label:"배치 지점"},{key:"role",label:"직무"},{key:"period",label:"계약 기간"},{key:"round",label:"회차"}],
    rows:[
      {worker:"가상 인력 011",site:"가상 중앙센터",role:"운영 지원",period:"2026.01.01 ~ 2026.09.30",round:"2차",status:"만료 예정",tone:"amber"},
      {worker:"가상 인력 012",site:"가상 남부센터",role:"고객 안내",period:"2026.03.01 ~ 2027.02.28",round:"1차",status:"체결",tone:"green"},
      {worker:"가상 인력 013",site:"가상 동부센터",role:"서비스 지원",period:"2026.09.15 ~ 2027.09.14",round:"1차",status:"서명 대기",tone:"blue"},
      {worker:"가상 인력 014",site:"가상 서부센터",role:"운영 지원",period:"2026.07.01 ~ 2027.06.30",round:"1차",status:"체결",tone:"green"},
    ],
  },
  attendance: {
    eyebrow:"2026년 9월 근무내역", title:"근태·연차", description:"정상 근무는 자동으로 채우고 예외 내역만 확인합니다.", actionLabel:"예외 근태 등록",
    stats:[
      {label:"제출 완료",value:"120명",caption:"전체 대상 128명",icon:"check",iconClass:"bg-emerald-50 text-emerald-700"},
      {label:"미제출",value:"8명",caption:"3개 지점 확인 필요",icon:"alert",iconClass:"bg-rose-50 text-rose-700"},
      {label:"승인 대기",value:"13건",caption:"근태 8 · 연차 5",icon:"clock",iconClass:"bg-amber-50 text-amber-700"},
      {label:"연차 신청",value:"21건",caption:"이번 수집 기간",icon:"calendar",iconClass:"bg-blue-50 text-blue-700"},
    ],
    columns:[{key:"worker",label:"인력"},{key:"site",label:"지점"},{key:"type",label:"구분"},{key:"date",label:"대상일"},{key:"detail",label:"내용"}],
    rows:[
      {worker:"가상 인력 021",site:"가상 중앙센터",type:"연장근로",date:"2026.09.05",detail:"2시간",status:"승인 대기",tone:"amber"},
      {worker:"가상 인력 022",site:"가상 남부센터",type:"연차",date:"2026.09.09",detail:"1일",status:"현장 승인",tone:"blue"},
      {worker:"가상 인력 023",site:"가상 동부센터",type:"지각",date:"2026.09.07",detail:"20분",status:"확인 필요",tone:"red"},
      {worker:"가상 인력 024",site:"가상 서부센터",type:"휴일근로",date:"2026.09.06",detail:"8시간",status:"승인 완료",tone:"green"},
    ],
  },
  substitutes: {
    eyebrow:"대체인력 요청·배정", title:"대체근무", description:"경험과 가능 일정을 기준으로 적합한 후보를 배정합니다.", actionLabel:"대체근무 요청",
    stats:[
      {label:"배정 요청",value:"5건",caption:"이번 주 전체 요청",icon:"swap",iconClass:"bg-teal-50 text-teal-700"},
      {label:"미배정",value:"2건",caption:"긴급 요청 1건",icon:"alert",iconClass:"bg-rose-50 text-rose-700"},
      {label:"확정",value:"3건",caption:"근무 안내 완료",icon:"check",iconClass:"bg-emerald-50 text-emerald-700"},
      {label:"가용 후보",value:"18명",caption:"최근 90일 응답 기준",icon:"users",iconClass:"bg-blue-50 text-blue-700"},
    ],
    columns:[{key:"site",label:"요청 지점"},{key:"date",label:"근무일"},{key:"role",label:"직무"},{key:"reason",label:"요청 사유"},{key:"candidate",label:"배정 후보"}],
    rows:[
      {site:"가상 동부센터",date:"2026.09.12",role:"고객 안내",reason:"연차 대체",candidate:"후보 검토 중",status:"긴급",tone:"red"},
      {site:"가상 중앙센터",date:"2026.09.14",role:"운영 지원",reason:"교육 참석",candidate:"가상 후보 101",status:"연락 중",tone:"amber"},
      {site:"가상 남부센터",date:"2026.09.19",role:"서비스 지원",reason:"주말 증원",candidate:"가상 후보 102",status:"확정",tone:"green"},
      {site:"가상 서부센터",date:"2026.09.20",role:"고객 안내",reason:"행사 지원",candidate:"가상 후보 103",status:"확정",tone:"green"},
    ],
  },
  billing: {
    eyebrow:"2026년 9월 마감", title:"월 청구", description:"근태와 배치 데이터를 모아 계산·검증·잠금까지 진행합니다.", actionLabel:"마감 회차 생성",
    stats:[
      {label:"마감 진행률",value:"62%",caption:"자료 수집 단계",icon:"chart",iconClass:"bg-teal-50 text-teal-700"},
      {label:"계산 대상",value:"128명",caption:"활성 배치 기준",icon:"users",iconClass:"bg-blue-50 text-blue-700"},
      {label:"필수값 누락",value:"8건",caption:"근무내역 미제출",icon:"alert",iconClass:"bg-rose-50 text-rose-700"},
      {label:"검증 오류",value:"3건",caption:"확인 후 재계산 필요",icon:"clock",iconClass:"bg-amber-50 text-amber-700"},
    ],
    columns:[{key:"period",label:"마감 회차"},{key:"collection",label:"수집 기간"},{key:"target",label:"대상 인원"},{key:"progress",label:"진행률"},{key:"owner",label:"담당"}],
    rows:[
      {period:"2026년 9월",collection:"08.21 ~ 09.20",target:"128명",progress:"62%",owner:"운영 관리자",status:"자료 수집",tone:"blue"},
      {period:"2026년 8월",collection:"07.21 ~ 08.20",target:"124명",progress:"100%",owner:"운영 관리자",status:"마감 완료",tone:"green"},
      {period:"2026년 7월",collection:"06.21 ~ 07.20",target:"121명",progress:"100%",owner:"운영 관리자",status:"마감 완료",tone:"green"},
      {period:"2026년 6월",collection:"05.21 ~ 06.20",target:"119명",progress:"100%",owner:"운영 관리자",status:"마감 완료",tone:"green"},
    ],
  },
} satisfies Record<string, ModulePageProps>;
