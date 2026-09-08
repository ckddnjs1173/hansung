import Link from "next/link";
import { notFound } from "next/navigation";
import { getGeneratedDocument } from "@/lib/documents";
import { PrintButton } from "@/components/ui/print-button";

export const dynamic="force-dynamic";
const v=(x:unknown)=>String(x??"");
export default async function DocumentDetailPage({params}:{params:Promise<{id:string}>}){const{id}=await params;const doc=getGeneratedDocument(Number(id));if(!doc)notFound();return <div className="mx-auto max-w-4xl space-y-5"><div className="flex items-center justify-between print:hidden"><div><Link href="/documents" className="text-sm font-semibold text-teal-700">← 문서 목록</Link><h1 className="mt-2 text-2xl font-black">{v(doc.title)}</h1><p className="mt-1 text-xs text-slate-500">템플릿 v{v(doc.template_version)} · 생성 {v(doc.created_at)}</p></div><PrintButton/></div><article className="min-h-[1000px] rounded-2xl border border-slate-200 bg-white p-10 shadow-sm print:min-h-0 print:border-0 print:p-0 print:shadow-none prose prose-slate max-w-none" dangerouslySetInnerHTML={{__html:v(doc.rendered_html)}} /></div>}
