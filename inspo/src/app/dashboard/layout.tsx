import type { ReactNode } from "react";
import { DashboardShell } from "@/components/ui/dashboard/DashboardShell";
import Sidebar from "@/components/ui/dashboard/sidebar";

type Props = {
  children: ReactNode;
};

export const metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({ children }: Props) {
  return <DashboardShell sidebar={<Sidebar />}>{children}</DashboardShell>;
}
