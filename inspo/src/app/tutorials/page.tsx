"use client";

export const dynamic = "force-dynamic";

import {
  Button,
  Card,
  Heading,
  Text,
} from "../../components/ui/form-components";
import { ThemeToggle } from "../../components/ui/ThemeToggle";

export default function OnboardingPage() {
  return (
    <div
      className="min-h-screen px-8 py-16 transition-colors duration-300"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <Heading
          level={1}
          style={{ color: "var(--brand-primary)", marginBottom: "3rem" }}
        >
          In-App User Guidance & Tutorials
        </Heading>
        <ThemeToggle />
      </div>

      {/* Forms / Cards Container with consistent vertical gap */}
      <div className="flex flex-col space-y-12">
        {/* Interactive Walkthrough */}
        <Card
          className="p-6 shadow-md"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--input-border)",
          }}
        >
          <Heading
            level={2}
            style={{ marginBottom: "1rem", color: "var(--brand-primary-600)" }}
          >
            Interactive Walkthrough
          </Heading>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-200 h-32 flex items-center justify-center rounded-lg">
              Step 1: Login
            </div>
            <div className="bg-gray-200 h-32 flex items-center justify-center rounded-lg">
              Step 2: Profile Setup
            </div>
            <div className="bg-gray-200 h-32 flex items-center justify-center rounded-lg">
              Step 3: Dashboard Tour
            </div>
          </div>
        </Card>

        {/* Dynamic Tooltips */}
        <Card
          className="p-6 shadow-md"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--input-border)",
          }}
        >
          <Heading
            level={2}
            style={{ marginBottom: "1rem", color: "var(--brand-primary-600)" }}
          >
            Dynamic Tooltips
          </Heading>
          <Text>Hover over key features to see contextual hints.</Text>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-100 h-32 flex items-center justify-center rounded-lg border">
              Feature 1
            </div>
            <div className="bg-gray-100 h-32 flex items-center justify-center rounded-lg border">
              Feature 2
            </div>
            <div className="bg-gray-100 h-32 flex items-center justify-center rounded-lg border">
              Feature 3
            </div>
          </div>
        </Card>

        {/* Searchable Help Center */}
        <Card
          className="p-6 shadow-md"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--input-border)",
          }}
        >
          <Heading
            level={2}
            style={{ marginBottom: "1rem", color: "var(--brand-primary-600)" }}
          >
            Searchable Help Center
          </Heading>
          <Text>Find helpful articles and tutorials instantly.</Text>
          <div className="flex mt-4 space-x-2">
            <input
              placeholder="Search help topics..."
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: "1px solid var(--input-border)",
                backgroundColor: "var(--surface-alt)",
                color: "var(--foreground)",
              }}
            />
            <Button
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "white",
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "10px",
              }}
            >
              Search
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-100 h-24 flex items-center justify-center rounded-lg border">
              Article 1
            </div>
            <div className="bg-gray-100 h-24 flex items-center justify-center rounded-lg border">
              Article 2
            </div>
            <div className="bg-gray-100 h-24 flex items-center justify-center rounded-lg border">
              Article 3
            </div>
            <div className="bg-gray-100 h-24 flex items-center justify-center rounded-lg border">
              Article 4
            </div>
          </div>
        </Card>

        {/* Gamified Onboarding */}
        <Card
          className="p-6 shadow-md"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--input-border)",
          }}
        >
          <Heading
            level={2}
            style={{ marginBottom: "1rem", color: "var(--brand-primary-600)" }}
          >
            Gamified Onboarding
          </Heading>
          <Text>Earn badges and track progress as you complete steps!</Text>
          <div className="flex items-center space-x-4 mt-4">
            <div className="bg-yellow-300 h-16 w-16 flex items-center justify-center rounded-full border">
              🏆
            </div>
            <div className="flex-1 bg-gray-200 h-6 rounded-lg">
              <div className="bg-green-500 h-6 rounded-lg w-2/3"></div>
            </div>
            <div className="bg-blue-300 h-16 w-16 flex items-center justify-center rounded-full border">
              💡
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
