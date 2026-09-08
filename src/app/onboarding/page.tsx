import { options } from "@/lib/operations";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const dynamic="force-dynamic";

export default function Page(){
  const o=options();
  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-teal-700">입사·배치</p><h1 className="mt-1 text-3xl font-black">신규 입사 등록</h1><p className="mt-2 text-sm text-slate-500">기본정보 → 근무정보 → 계약 → 급여기준 → 입사서류 순서로 등록합니다. 마지막 완료 시 인력·배치·계약이 한 번에 생성됩니다.</p></header>
    <OnboardingWizard sites={o.sites} jobs={o.jobs} payRules={o.payRules}/>
  </div>;
}
