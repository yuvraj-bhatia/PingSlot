import type { ReactNode } from "react";

interface DashboardShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function DashboardShell({ sidebar, children }: DashboardShellProps) {
  return (
    <div className="glass-dashboard-wrapper">
      {/* Background gradient blob shapes */}
      <div className="shape-1" />
      <div className="shape-2" />

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          height: "100vh",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {sidebar}

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 0,
            maxWidth: "100%",
            background: "transparent",
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
