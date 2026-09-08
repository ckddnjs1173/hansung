import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { currentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "한성자동차 관리프로그램", template: "%s | 한성자동차 관리프로그램" },
  description: "인력, 현장, 근태와 청구 업무를 한곳에서 관리합니다.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user=await currentUser();
  return <html lang="ko"><body><AppShell user={user?{display_name:user.display_name,role:user.role}:null}>{children}</AppShell></body></html>;
}
