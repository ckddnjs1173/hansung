"use client";

import { useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";

type Stat = { label: string; value: string; caption: string; icon: IconName; iconClass: string };
type Column = { key: string; label: string };
type Row = Record<string, string> & { status: string; tone: BadgeTone };
export type ModulePageProps = { eyebrow: string; title: string; description: string; actionLabel: string; stats: Stat[]; columns: Column[]; rows: Row[]; loaded?: boolean };

function csvCell(value: string) { return `"${value.replaceAll('"','""')}"`; }

export function ModulePage({ eyebrow,title,description,stats,columns,rows,loaded=true }: ModulePageProps) {
  const [query,setQuery]=useState("");
  const filteredRows=useMemo(()=>{
    const normalized=query.trim().toLocaleLowerCase("ko-KR");
    if(!normalized) return rows;
    return rows.filter(row=>columns.some(column=>row[column.key].toLocaleLowerCase("ko-KR").includes(normalized)) || row.status.toLocaleLowerCase("ko-KR").includes(normalized));
  },[columns,query,rows]);
  function exportCsv() {
    const header=[...columns.map(column=>column.label),"상태"].map(csvCell).join(',');
    const body=filteredRows.map(row=>[...columns.map(column=>row[column.key]),row.status].map(csvCell).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(["\uFEFF",header,"\r\n",body],{type:"text/csv;charset=utf-8"}));
    const anchor=document.createElement('a'); anchor.href=url; anchor.download=`${title}.csv`; anchor.click(); URL.revokeObjectURL(url);
  }
  return <div className="space-y-6">
    <header><p className="mb-1 text-sm font-semibold text-teal-700">{eyebrow}</p><h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></header>
    {!loaded ? <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-bold text-amber-950">실제 자료를 아직 가져오지 않았습니다.</p><p className="mt-1 text-sm text-amber-800">README의 데이터 가져오기 명령을 실행하면 이 화면에 실제 자료가 표시됩니다.</p></section> : null}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(stat=><article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className={`grid size-10 place-items-center rounded-xl ${stat.iconClass}`}><Icon name={stat.icon} className="size-5" /></span><p className="mt-4 text-sm font-medium text-slate-500">{stat.label}</p><p className="mt-1 text-2xl font-bold text-slate-950">{stat.value}</p><p className="mt-2 text-xs text-slate-400">{stat.caption}</p></article>)}</section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full max-w-sm"><Icon name="search" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={event=>setQuery(event.target.value)} aria-label={`${title} 검색`} placeholder="목록에서 검색" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-teal-500" /></div><button onClick={exportCsv} disabled={!filteredRows.length} className="h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 disabled:opacity-40">CSV 내보내기</button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[780px] border-collapse text-left"><thead><tr className="bg-slate-50 text-xs font-semibold text-slate-500">{columns.map(column=><th key={column.key} className="px-5 py-3.5">{column.label}</th>)}<th className="px-5 py-3.5">상태</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredRows.map((row,index)=><tr key={`${row[columns[0].key]}-${index}`} className="text-sm text-slate-600 [content-visibility:auto] hover:bg-slate-50/70">{columns.map((column,columnIndex)=><td key={column.key} className={`px-5 py-4 ${columnIndex===0?"font-semibold text-slate-900":""}`}>{row[column.key]}</td>)}<td className="px-5 py-4"><StatusBadge tone={row.tone}>{row.status}</StatusBadge></td></tr>)}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>{loaded?`실제 원본 반영 ${filteredRows.length}건`:"데이터 없음"}</span><span>{query?`전체 ${rows.length}건 중 검색 결과`:'최대 200건 표시'}</span></div>
    </section>
  </div>;
}
