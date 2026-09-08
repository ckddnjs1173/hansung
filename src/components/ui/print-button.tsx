"use client";
export function PrintButton(){return <button onClick={()=>window.print()} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white print:hidden">인쇄 / PDF 저장</button>}
