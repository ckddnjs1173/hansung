import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { getSubstitutesView } from "@/lib/repository";
export const metadata: Metadata = { title: "대체근무" };
export const dynamic = "force-dynamic";
export default function Page() { return <ModulePage {...getSubstitutesView()} />; }
