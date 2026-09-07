import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { getSettingsView } from "@/lib/repository";
export const metadata: Metadata = { title: "설정" };
export const dynamic = "force-dynamic";
export default function Page() { return <ModulePage {...getSettingsView()} />; }
