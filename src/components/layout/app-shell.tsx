"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/icon";

type NavItem = { label: string; href: string; icon: IconName };
const mainNav: NavItem[] = [
  { label: "오늘 할 일", href: "/", icon: "home" },
  { label: "인력 관리", href: "/workers", icon: "users" },
  { label: "지점 관리", href: "/sites", icon: "building" },
  { label: "직무·급여기준", href: "/jobs", icon: "receipt" },
  { label: "배치·계약", href: "/contracts", icon: "document" },
  { label: "근태·연차", href: "/attendance", icon: "calendar" },
  { label: "대체근무", href: "/substitutes", icon: "swap" },
  { label: "급여·청구", href: "/billing", icon: "receipt" },
];
const secondaryNav: NavItem[] = [
  { label: "문서·교육", href: "/documents", icon: "folder" },
  { label: "보고서", href: "/reports", icon: "chart" },
  { label: "설정", href: "/settings", icon: "settings" },
];

function NavigationItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  return <Link href={item.href} className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${active ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
    <Icon name={item.icon} className="size-[18px] shrink-0" /><span className="flex-1 truncate">{item.label}</span>
  </Link>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-screen bg-slate-50">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-[72px] items-center gap-3 border-b border-slate-100 px-5">
        <div className="grid size-10 place-items-center rounded-xl bg-teal-700 text-white shadow-sm"><span className="text-lg font-black tracking-tighter">HS</span></div>
        <div><p className="font-extrabold tracking-tight text-slate-950">한성자동차</p><p className="text-[11px] font-medium text-slate-400">통합 운영 관리</p></div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">업무 관리</p>
        <div className="space-y-1">{mainNav.map((item) => <NavigationItem key={item.href} item={item} pathname={pathname} />)}</div>
        <div className="my-5 border-t border-slate-100" />
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">운영 도구</p>
        <div className="space-y-1">{secondaryNav.map((item) => <NavigationItem key={item.href} item={item} pathname={pathname} />)}</div>
      </nav>
      <div className="border-t border-slate-100 p-4"><div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">관리</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">관리자</p><p className="truncate text-[11px] text-slate-500">2인 운영 · 인증은 Phase 5</p></div></div></div>
    </aside>
    <div className="lg:pl-64">
      <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
        <Link href="/" className="mr-auto flex items-center gap-2 lg:hidden"><span className="grid size-9 place-items-center rounded-xl bg-teal-700 text-sm font-black text-white">HS</span><span className="font-extrabold text-slate-950">한성자동차</span></Link>
        <div className="relative hidden w-full max-w-md md:block"><Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input aria-label="통합 검색" placeholder="인력·지점·계약 검색" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400" /></div>
        <span className="hidden rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 sm:inline">Excel 없이 운영</span>
      </header>
      <nav className="sticky top-[72px] z-10 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden">{mainNav.map((item) => { const active=item.href==="/"?pathname==="/":pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${active?"bg-teal-50 text-teal-800":"text-slate-500"}`}><Icon name={item.icon} className="size-4" />{item.label}</Link>; })}</nav>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}
