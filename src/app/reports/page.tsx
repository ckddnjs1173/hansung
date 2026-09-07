import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";
export const metadata: Metadata = { title: "보고서" };
export default function Page() { return <ComingSoon title="보고서" description="인원, 계약, 근태와 청구 현황을 기준별로 분석합니다." icon="chart" />; }
