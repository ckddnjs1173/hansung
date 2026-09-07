import { Icon, type IconName } from "@/components/ui/icon";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";

type Stat = { label: string; value: string; caption: string; icon: IconName; iconClass: string };
type Column = { key: string; label: string };
type Row = Record<string, string> & { status: string; tone: BadgeTone };
export type ModulePageProps = {
  eyebrow: string; title: string; description: string; actionLabel: string; stats: Stat[]; columns: Column[]; rows: Row[];
};

export function ModulePage({ eyebrow, title, description, actionLabel, stats, columns, rows }: ModulePageProps) {
  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-1 text-sm font-semibold text-teal-700">{eyebrow}</p><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div><button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"><Icon name="plus" className="size-4" />{actionLabel}</button></header>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className={`grid size-10 place-items-center rounded-xl ${stat.iconClass}`}><Icon name={stat.icon} className="size-5" /></span><Icon name="chevron" className="size-4 text-slate-300" /></div><p className="mt-4 text-sm font-medium text-slate-500">{stat.label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{stat.value}</p><p className="mt-2 text-xs text-slate-400">{stat.caption}</p></article>)}</section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full max-w-sm"><Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input aria-label={`${title} 검색`} placeholder="목록에서 검색" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:bg-white" /></div><div className="flex gap-2"><button className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">전체 상태</button><button className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">내보내기</button></div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[780px] border-collapse text-left"><thead><tr className="bg-slate-50 text-xs font-semibold text-slate-500">{columns.map((column) => <th key={column.key} className="px-5 py-3.5">{column.label}</th>)}<th className="px-5 py-3.5">상태</th><th className="w-12 px-5 py-3.5" /></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr key={`${row[columns[0].key]}-${index}`} className="text-sm text-slate-600 transition hover:bg-slate-50/70">{columns.map((column, columnIndex) => <td key={column.key} className={`px-5 py-4 ${columnIndex === 0 ? "font-semibold text-slate-900" : ""}`}>{row[column.key]}</td>)}<td className="px-5 py-4"><StatusBadge tone={row.tone}>{row.status}</StatusBadge></td><td className="px-5 py-4"><Icon name="chevron" className="size-4 text-slate-300" /></td></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>가상 데이터 {rows.length}건</span><span>1 / 1 페이지</span></div>
    </section>
  </div>;
}
