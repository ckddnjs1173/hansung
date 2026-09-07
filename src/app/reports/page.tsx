import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { getReportsView } from "@/lib/repository";
export const metadata: Metadata = { title: "보고서" };
export const dynamic = "force-dynamic";
export default function Page() { return <ModulePage {...getReportsView()} />; }
