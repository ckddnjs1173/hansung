import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { getContractsView } from "@/lib/repository";
export const metadata: Metadata = { title: "배치·계약" };
export const dynamic = "force-dynamic";
export default function Page() { return <ModulePage {...getContractsView()} />; }
