import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/coming-soon";
export const metadata: Metadata = { title: "문서·교육" };
export default function Page() { return <ComingSoon title="문서·교육" description="계약 문서 생성과 온보딩·교육 이수를 관리합니다." icon="folder" />; }
