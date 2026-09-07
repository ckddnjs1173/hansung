import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { closingSteps, dashboardStats, siteOccupancy, urgentTasks } from "@/mocks/dashboard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold text-teal-700">2026년 9월 7일 월요일</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">오늘의 운영 현황</h1>
          <p className="mt-2 text-sm text-slate-500">처리해야 할 업무와 이번 달 마감 상태를 한눈에 확인하세요.</p>
        </div>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
          <Icon name="plus" className="size-4" /> 인력 등록
        </button>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><Icon name="alert" className="size-5" /></span>
          <div>
            <p className="font-semibold text-amber-950">이번 달 마감까지 5일 남았습니다.</p>
            <p className="mt-1 text-sm text-amber-800">근무내역 미제출 8건과 승인 대기 5건을 먼저 확인해 주세요.</p>
          </div>
        </div>
        <a href="#closing" className="shrink-0 text-sm font-bold text-amber-900 hover:underline">마감 현황 보기 →</a>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className={`grid size-10 place-items-center rounded-xl ${stat.iconClass}`}><Icon name={stat.icon} className="size-5" /></span>
              <span className={`text-xs font-bold ${stat.changeClass}`}>{stat.change}</span>
            </div>
            <p className="mt-5 text-sm font-medium text-slate-500">{stat.label}</p>
            <div className="mt-1 flex items-baseline gap-1">
              <strong className="text-3xl font-bold tracking-tight text-slate-950">{stat.value}</strong>
              <span className="text-sm font-semibold text-slate-500">{stat.unit}</span>
            </div>
            <p className="mt-3 text-xs text-slate-400">{stat.caption}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h2 className="font-bold text-slate-950">우선 처리 업무</h2><p className="mt-1 text-xs text-slate-500">기한과 중요도를 기준으로 정렬했습니다.</p></div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">12건</span>
          </div>
          <div className="divide-y divide-slate-100">
            {urgentTasks.map((task) => (
              <article key={task.title} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/80">
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${task.iconClass}`}><Icon name={task.icon} className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-slate-900">{task.title}</p><StatusBadge tone={task.tone}>{task.status}</StatusBadge></div>
                  <p className="mt-1 truncate text-xs text-slate-500">{task.description}</p>
                </div>
                <span className="hidden text-xs font-semibold text-slate-400 sm:block">{task.due}</span>
                <Icon name="chevron" className="size-4 shrink-0 text-slate-300" />
              </article>
            ))}
          </div>
          <div className="border-t border-slate-100 px-5 py-3 text-center"><button className="text-sm font-semibold text-teal-700 hover:text-teal-900">전체 업무 보기</button></div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div><h2 className="font-bold text-slate-950">지점별 배치 현황</h2><p className="mt-1 text-xs text-slate-500">정원 대비 현재 배치 인원</p></div>
            <button className="text-xs font-semibold text-slate-500 hover:text-slate-900">지점 관리 →</button>
          </div>
          <div className="mt-6 space-y-5">
            {siteOccupancy.map((site) => (
              <div key={site.name}>
                <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-700">{site.name}</span><span className="text-slate-500"><strong className="text-slate-950">{site.current}</strong> / {site.capacity}명</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${site.barClass}`} style={{ width: `${Math.round((site.current / site.capacity) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Icon name="info" className="size-4 text-teal-700" /> 정원 부족 지점 2곳</div>
            <p className="mt-1 pl-6 text-xs leading-5 text-slate-500">가상 동부센터 외 1곳에 총 3명의 추가 배치가 필요합니다.</p>
          </div>
        </section>
      </div>

      <section id="closing" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-bold text-slate-950">9월 급여·청구 마감</h2><p className="mt-1 text-xs text-slate-500">수집 기간: 8월 21일 ~ 9월 20일</p></div>
          <div className="flex items-center gap-3"><span className="text-sm font-semibold text-slate-600">전체 진행률</span><strong className="text-xl text-teal-700">62%</strong></div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {closingSteps.map((step, index) => (
            <article key={step.title} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between"><span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${step.numberClass}`}>{index + 1}</span><StatusBadge tone={step.tone}>{step.status}</StatusBadge></div>
              <p className="mt-4 text-sm font-bold text-slate-900">{step.title}</p><p className="mt-1 text-xs text-slate-500">{step.caption}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
