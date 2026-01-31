// apmac-ui/src/app/ai-engine/layout.tsx
import type { ReactNode } from "react";
import AIEngineSidebar from "@/components/ui/ai-engine/AIEngineSidebar";
import { DashboardShell } from "@/components/ui/dashboard/DashboardShell";

type Props = {
  children: ReactNode;
};

export const metadata = {
  title: "AI Engine - APMAC",
};

export default function AIEngineLayout({ children }: Props) {
  return (
    <DashboardShell sidebar={<AIEngineSidebar />}>{children}</DashboardShell>
  );
}
