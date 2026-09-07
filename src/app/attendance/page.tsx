import type { Metadata } from "next";
import { ModulePage } from "@/components/ui/module-page";
import { getAttendanceView } from "@/lib/repository";
export const metadata: Metadata = { title: "근태·연차" };
export const dynamic = "force-dynamic";
export default function Page() { return <ModulePage {...getAttendanceView()} />; }
