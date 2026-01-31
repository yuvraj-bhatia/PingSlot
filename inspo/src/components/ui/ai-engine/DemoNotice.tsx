import { AlertTriangle } from "lucide-react";
import { Card, Text } from "@/components/ui/form-components";

export default function DemoNotice({
  message = "This screen is not part of the AI Engine demo flow.",
}: {
  message?: string;
}) {
  return (
    <Card
      style={{
        marginBottom: "1.5rem",
        padding: "0.75rem 1rem",
        border: "1px solid rgba(245, 158, 11, 0.35)",
        background: "rgba(245, 158, 11, 0.08)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <AlertTriangle style={{ width: 18, height: 18, color: "#f59e0b" }} />
        <Text style={{ fontWeight: 600 }}>{message}</Text>
      </div>
    </Card>
  );
}
