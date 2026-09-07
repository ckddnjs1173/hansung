import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { getDocumentsView } from "@/lib/repository";
export const metadata: Metadata = { title: "문서·교육" };
export const dynamic = "force-dynamic";
export default function Page() { return <ModulePage {...getDocumentsView()} />; }
