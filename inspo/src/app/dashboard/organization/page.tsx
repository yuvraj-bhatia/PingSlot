"use client";

import {
  Building2,
  Clock,
  Crown,
  Plus,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { PageContent } from "@/components/ui/dashboard/PageContent";
import {
  DashboardCard,
  KPICard,
} from "../../../components/ui/dashboard/dashboard-cards";
import { Heading, Text } from "../../../components/ui/form-components";

export const dynamic = "force-dynamic";

export default function OrganizationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/SignIn");
    }
  }, [status, router]);

  if (status === "loading" || !session?.user) {
    return null;
  }

  const companyName =
    typeof session.user === "object" && "companyName" in session.user
      ? (session.user as { companyName?: string | null }).companyName ||
        "ACME Inc."
      : "ACME Inc.";

  const members = [
    {
      name: session.user.name || "You",
      email: session.user.email ?? "unknown@aptech.local",
      role: "Admin",
      status: "Active",
    },
    {
      name: "John Smith",
      email: "john@company.com",
      role: "Member",
      status: "Active",
    },
    {
      name: "Sarah Johnson",
      email: "sarah@company.com",
      role: "Member",
      status: "Active",
    },
    {
      name: "Mike Davis",
      email: "mike@company.com",
      role: "Viewer",
      status: "Pending",
    },
  ];

  const teams = [
    {
      name: "Sales Team",
      members: 5,
      description: "Sales and customer relations",
    },
    {
      name: "Engineering",
      members: 8,
      description: "Product development team",
    },
    { name: "Marketing", members: 4, description: "Marketing and growth" },
  ];

  return (
    <PageContent>
      {/* Header */}
      <div
        className="dashboard-header"
        style={{ textAlign: "center", marginBottom: "2rem" }}
      >
        <Heading
          level={1}
          style={{
            color: "#ffffff",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          Organization
        </Heading>
        <Text
          style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "1.1rem",
            marginTop: "0.5rem",
          }}
        >
          Manage your organization settings, members, and teams.
        </Text>
      </div>

      {/* Top row: 3 KPI cards */}
      <div
        className="dashboard-grid"
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <KPICard
          icon={<Building2 className="h-4 w-4" />}
          title="Organization Name"
          value={companyName}
          subtext=""
        />
        <KPICard
          icon={<Users className="h-4 w-4" />}
          title="Members"
          value="12"
          subtext="active members"
        />
        <KPICard
          icon={<Crown className="h-4 w-4" />}
          title="Plan"
          value="Professional"
          subtext=""
        />
      </div>

      {/* Middle row: Team Members and Teams side-by-side */}
      <div
        className="dashboard-grid"
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <DashboardCard
          icon={<Users className="h-4 w-4" />}
          title="Team Members"
          description={
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "1rem",
                }}
              >
                <button
                  type="button"
                  style={{
                    padding: "0.5rem 1rem",
                    background: "var(--brand-primary-600)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Member
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {members.map((member) => (
                  <MemberItem
                    key={member.email ?? member.name}
                    name={member.name}
                    email={member.email}
                    role={member.role}
                    status={member.status}
                  />
                ))}
              </div>
            </div>
          }
        />

        <DashboardCard
          icon={<Building2 className="h-4 w-4" />}
          title="Teams"
          description={
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: "1rem",
                }}
              >
                <button
                  type="button"
                  className="create-team-button"
                  style={{
                    padding: "0.5rem 1rem",
                    background: "linear-gradient(135deg, #0070f3, #3b82f6)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0, 112, 243, 0.3)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create Team
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {teams.map((team) => (
                  <div
                    key={team.name}
                    className="team-card"
                    style={{
                      padding: "1.25rem",
                      background: "rgba(255, 255, 255, 0.03)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Heading
                      level={3}
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                        color: "#ffffff",
                      }}
                    >
                      {team.name}
                    </Heading>
                    <Text
                      style={{
                        fontSize: "0.875rem",
                        color: "rgba(255, 255, 255, 0.7)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {team.description}
                    </Text>
                    <Text
                      style={{
                        fontSize: "0.85rem",
                        color: "rgba(255, 255, 255, 0.6)",
                      }}
                    >
                      {team.members} {team.members === 1 ? "member" : "members"}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </div>
    </PageContent>
  );
}

interface MemberItemProps {
  name: string;
  email: string;
  role: string;
  status: string;
}

function MemberItem({ name, email, role, status }: MemberItemProps) {
  const StatusIcon = status === "Active" ? UserCheck : Clock;

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
      <div
        style={{
          borderRadius: "8px",
          border: "0.75px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(255, 255, 255, 0.05)",
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          color: "rgba(255, 255, 255, 0.9)",
          flexShrink: 0,
        }}
      >
        <StatusIcon className="h-4 w-4" />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <Text
              style={{
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {name}
            </Text>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "0.875rem",
              }}
            >
              {email}
            </Text>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                padding: "0.25rem 0.75rem",
                background: "rgba(0, 112, 243, 0.15)",
                color: "#60a5fa",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              {role}
            </span>
            <span
              style={{
                padding: "0.25rem 0.75rem",
                background:
                  status === "Active"
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(251,191,36,0.15)",
                color: status === "Active" ? "#4ade80" : "#fbbf24",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
