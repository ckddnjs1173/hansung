import type { ReactNode } from "react";
export type BadgeTone = "green" | "amber" | "red" | "blue" | "slate" | "teal";
const tones: Record<BadgeTone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/10", amber: "bg-amber-50 text-amber-700 ring-amber-600/10",
  red: "bg-rose-50 text-rose-700 ring-rose-600/10", blue: "bg-blue-50 text-blue-700 ring-blue-600/10",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/10", teal: "bg-teal-50 text-teal-700 ring-teal-600/10",
};
export function StatusBadge({ children, tone = "slate" }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${tones[tone]}`}>{children}</span>;
}
