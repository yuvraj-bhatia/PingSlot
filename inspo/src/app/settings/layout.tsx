// src/app/settings/layout.tsx
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/ui/dashboard/DashboardShell";
import SettingsSidebar from "@/components/ui/dashboard/settings-sidebar";

type Props = {
  children: ReactNode;
};

export const metadata = {
  title: "Settings",
};

export default function SettingsLayout({ children }: Props) {
  return (
    <DashboardShell sidebar={<SettingsSidebar />}>{children}</DashboardShell>
  );
}
