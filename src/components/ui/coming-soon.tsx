import { Icon, type IconName } from "@/components/ui/icon";

export function ComingSoon({ title, description, icon }: { title: string; description: string; icon: IconName }) {
  return <div className="space-y-6">
    <header><p className="mb-1 text-sm font-semibold text-teal-700">2단계 예정 기능</p><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></header>
    <section className="grid min-h-[420px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
      <div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon name={icon} className="size-7" /></span><h2 className="mt-5 text-lg font-bold text-slate-900">핵심 업무 안정화 후 연결합니다</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">현재 화면은 메뉴 구조를 확인하기 위한 자리 표시자입니다. 실제 기능과 데이터는 다음 개발 단계에서 추가합니다.</p></div>
    </section>
  </div>;
}
