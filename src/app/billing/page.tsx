import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { getBillingView } from "@/lib/repository";
export const metadata: Metadata = { title: "월 청구" };
export const dynamic = "force-dynamic";
export default function Page() { return <ModulePage {...getBillingView()} />; }
