import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { getWorkersView } from "@/lib/repository";
export const metadata: Metadata = { title: "인력 관리" };
export const dynamic = "force-dynamic";
export default function Page() { return <ModulePage {...getWorkersView()} />; }
