import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PingSlot — Appointment Availability Monitoring",
  description: "Monitor official appointment booking pages and get alerts when real slots become available.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
