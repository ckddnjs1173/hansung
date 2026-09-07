import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { moduleConfigs } from "@/mocks/modules";
export const metadata: Metadata = { title: "지점·직무" };
export default function Page() { return <ModulePage {...moduleConfigs.sites} />; }
