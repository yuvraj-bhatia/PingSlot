"use client";

export const dynamic = "force-dynamic";

import type React from "react";
import { useState } from "react";
import {
  Button,
  Card,
  Heading,
  Text,
} from "../../components/ui/form-components";
import { ThemeToggle } from "../../components/ui/ThemeToggle";

type Ticket = {
  id: number;
  subject: string;
  description: string;
  priority: string;
  status: string;
};

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTicket: Ticket = {
      id: Date.now(),
      subject,
      description,
      priority,
      status: "Open",
    };

    setTickets([...tickets, newTicket]);
    setSubject("");
    setDescription("");
    setPriority("medium");
    setSuccess(true);

    setTimeout(() => setSuccess(false), 3000);
  };

  const updateStatus = (id: number, newStatus: string) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, status: newStatus } : ticket,
      ),
    );
  };

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
          style={{
            color: "var(--brand-primary)",
            marginBottom: "3rem",
          }}
        >
          IT Support Ticketing
        </Heading>
        <ThemeToggle />
      </div>

      {/* Submit Ticket Card */}
      <div
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--input-border)",
        }}
      >
        <Card className="p-6 shadow-md">
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "3rem",
            }}
          >
            {/* Subject */}
            <div>
              <Heading
                level={3}
                style={{
                  color: "var(--brand-primary-600)",
                  marginBottom: "1rem",
                }}
              >
                Subject
              </Heading>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter ticket subject..."
                required
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "10px",
                  backgroundColor: "var(--surface-alt)",
                  border: "1px solid var(--input-border)",
                  color: "var(--foreground)",
                }}
              />
            </div>

            {/* Describe Issue */}
            <div>
              <Heading
                level={3}
                style={{
                  color: "var(--brand-primary-600)",
                  marginBottom: "1rem",
                }}
              >
                Describe Your Issue
              </Heading>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the issue..."
                required
                style={{
                  width: "100%",
                  minHeight: "150px",
                  padding: "1rem",
                  borderRadius: "10px",
                  backgroundColor: "var(--surface-alt)",
                  border: "1px solid var(--input-border)",
                  color: "var(--foreground)",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Priority Dropdown */}
            <div>
              <Heading
                level={3}
                style={{
                  color: "var(--brand-primary-600)",
                  marginBottom: "1rem",
                }}
              >
                Priority Level
              </Heading>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: "200px",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  backgroundColor: "var(--surface-alt)",
                  border: "1px solid var(--input-border)",
                  color: "var(--foreground)",
                  cursor: "pointer",
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                className="px-6 py-3 rounded-xl font-semibold"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "white",
                  border: "none",
                }}
              >
                Submit Ticket
              </Button>
            </div>
          </form>

          {/* Success Message */}
          {success && (
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                backgroundColor: "var(--success-bg, #d1fae5)",
                color: "var(--success-text, #065f46)",
                borderRadius: "8px",
                textAlign: "center",
                transition: "opacity 0.3s ease",
              }}
            >
              ✅ Ticket submitted successfully!
            </div>
          )}
        </Card>
      </div>

      {/* View Tickets Modal Toggle */}
      <div className="flex justify-center mt-12">
        <Button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 rounded-xl font-semibold"
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "white",
            border: "none",
          }}
        >
          View My Tickets
        </Button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <div
            className="p-6 rounded-xl shadow-lg"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--input-border)",
              width: "90%",
              maxWidth: "800px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <Heading level={2} style={{ color: "var(--brand-primary)" }}>
                My Tickets
              </Heading>
              <Button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: "transparent",
                  color: "var(--foreground)",
                  fontWeight: 600,
                }}
              >
                ✖ Close
              </Button>
            </div>

            {tickets.length === 0 ? (
              <Text muted>No tickets submitted yet.</Text>
            ) : (
              tickets.map((t) => (
                <Card
                  key={t.id}
                  className="p-4 mb-4"
                  style={{
                    backgroundColor: "var(--surface-alt)",
                    border: "1px solid var(--input-border)",
                  }}
                >
                  <Heading level={4} style={{ marginBottom: "0.5rem" }}>
                    {t.subject}
                  </Heading>
                  <Text style={{ marginBottom: "0.5rem" }}>
                    {t.description}
                  </Text>
                  <Text muted>Priority: {t.priority}</Text>
                  <div style={{ marginTop: "0.75rem" }}>
                    <label
                      htmlFor={`ticket-status-${t.id}`}
                      style={{
                        marginRight: "1rem",
                        fontWeight: 600,
                      }}
                    >
                      Status:
                    </label>
                    <select
                      id={`ticket-status-${t.id}`}
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "10px",
                        border: "1px solid var(--input-border)",
                        backgroundColor: "var(--background)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
