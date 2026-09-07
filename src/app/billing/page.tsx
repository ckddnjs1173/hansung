import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { moduleConfigs } from "@/mocks/modules";
export const metadata: Metadata = { title: "월 청구" };
export default function Page() { return <ModulePage {...moduleConfigs.billing} />; }
