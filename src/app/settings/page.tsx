import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";
export const metadata: Metadata = { title: "설정" };
export default function Page() { return <ComingSoon title="설정" description="사용자 권한과 계산 규칙, 공통 코드를 관리합니다." icon="settings" />; }
