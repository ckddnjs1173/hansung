import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { getSitesView } from "@/lib/repository";
export const metadata: Metadata = { title: "지점·직무" };
export const dynamic = "force-dynamic";
export default function Page() { return <ModulePage {...getSitesView()} />; }
