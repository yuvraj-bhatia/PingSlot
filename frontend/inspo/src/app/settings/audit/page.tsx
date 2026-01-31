"use client";

import { List, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/ui/dashboard/dashboard-cards";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import { Heading } from "@/components/ui/form-components";

type AuditLogEntry = {
  id: string;
  event_type: string;
  entity_type: string;
  user_id?: string | null;
  entity_id?: string | null;
  metadata?: Record<string, unknown> | null;
  timestamp: string;
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_ML_API_BASE || "http://localhost:8000";
        const res = await fetch(`${apiBase}/api/audit/recent`);
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs", err);
      }
    }
    fetchLogs();
  }, []);

  return (
    <PageContent>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Heading
          level={1}
          style={{
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          Audit Trail
        </Heading>
      </div>

      <DashboardCard
        icon={<ShieldCheck className="h-4 w-4" />}
        title="Recent User Activity"
        description={
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {logs.length === 0 && (
              <div
                style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}
              >
                No recent audit activity.
              </div>
            )}

            {/* Render each audit item */}
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "1rem 1.2rem",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Title Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    marginBottom: ".6rem",
                  }}
                >
                  <List className="h-4 w-4 text-blue-400" />
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    {log.event_type} — {log.entity_type}
                  </div>
                </div>

                {/* Metadata table */}
                <div style={{ marginTop: ".4rem", marginBottom: ".8rem" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ padding: "4px 0", opacity: 0.6 }}>
                          User ID:
                        </td>
                        <td style={{ padding: "4px 0" }}>{log.user_id}</td>
                      </tr>

                      <tr>
                        <td style={{ padding: "4px 0", opacity: 0.6 }}>
                          Entity ID:
                        </td>
                        <td style={{ padding: "4px 0" }}>{log.entity_id}</td>
                      </tr>

                      {/* Metadata: displayed as clean rows */}
                      {log.metadata &&
                        Object.entries(log.metadata).map(([k, v]) => (
                          <tr key={k}>
                            <td style={{ padding: "4px 0", opacity: 0.6 }}>
                              {k.replace(/_/g, " ")}:
                            </td>
                            <td style={{ padding: "4px 0" }}>
                              {typeof v === "object"
                                ? JSON.stringify(v)
                                : String(v)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Timestamp */}
                <div
                  style={{
                    fontSize: ".85rem",
                    opacity: 0.6,
                    marginTop: ".6rem",
                  }}
                >
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        }
      />
    </PageContent>
  );
}
