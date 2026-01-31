"use client";

export const dynamic = "force-dynamic";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Heading,
  Text,
} from "../../components/ui/form-components";
import { ThemeToggle } from "../../components/ui/ThemeToggle";

export default function ChatbotPage() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<
    { role: string; text: string; typing?: boolean }[]
  >([{ role: "bot", text: "Hello! 👋 How can I assist you today?" }]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    setMessages([...messages, { role: "user", text: chatInput }]);
    setChatInput("");

    // Add bot typing indicator
    setMessages((prev) => [...prev, { role: "bot", text: "", typing: true }]);

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev.slice(0, -1), // remove typing
        {
          role: "bot",
          text: "Thanks for your message! Our AI assistant is learning to reply soon 🤖.",
        },
      ]);
    }, 1000);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
          AI Chatbot Support
        </Heading>
        <ThemeToggle />
      </div>

      <div className="flex flex-col space-y-16">
        {" "}
        {/* Increased vertical gap to 4rem (16 × 0.25rem) */}
        {/* Chatbot Section */}
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--input-border)",
          }}
        >
          <Card className="p-6 shadow-md">
            <div
              style={{
                height: "400px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "1.5rem",
                paddingRight: "0.5rem",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={`${msg.role}-${msg.text}-${msg.typing ? "typing" : "message"}`}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    backgroundColor:
                      msg.role === "user"
                        ? "var(--brand-primary)"
                        : "var(--surface-alt)",
                    color: msg.role === "user" ? "#fff" : "var(--foreground)",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    maxWidth: "70%",
                    boxShadow:
                      msg.role === "bot"
                        ? "0 1px 4px rgba(0,0,0,0.1)"
                        : "0 2px 6px rgba(0,0,0,0.15)",
                    transition: "transform 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className="hover:scale-105"
                >
                  {msg.typing ? (
                    <div className="typing-dots flex space-x-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce200"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce400"></span>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
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
                type="submit"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.75rem 1.5rem",
                }}
              >
                Send
              </Button>
            </form>
          </Card>
        </div>
        {/* Info / Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div
            style={{
              backgroundColor: "var(--surface-alt)",
              border: "1px solid var(--input-border)",
            }}
          >
            <Card className="p-5 text-center transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
              <Heading level={3} style={{ color: "var(--brand-primary)" }}>
                Multilingual Support
              </Heading>
              <div className="flex justify-center mt-4 space-x-2">
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
              <Text muted className="mt-2">
                Chatbot will support multiple languages soon 🌍
              </Text>
            </Card>
          </div>

          <div
            style={{
              backgroundColor: "var(--surface-alt)",
              border: "1px solid var(--input-border)",
            }}
          >
            <Card className="p-5 text-center transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
              <Heading level={3} style={{ color: "var(--brand-primary)" }}>
                Omnichannel Access
              </Heading>
              <div className="flex justify-center mt-4 space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  F
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center text-white">
                  T
                </div>
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white">
                  I
                </div>
              </div>
              <Text muted className="mt-2">
                Connect via social media platforms instantly
              </Text>
            </Card>
          </div>

          <div
            style={{
              backgroundColor: "var(--surface-alt)",
              border: "1px solid var(--input-border)",
            }}
          >
            <Card className="p-5 text-center transform transition duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
              <Heading level={3} style={{ color: "var(--brand-primary)" }}>
                Live Agent Escalation
              </Heading>
              <Button
                style={{
                  marginTop: "1rem",
                  backgroundColor: "var(--brand-primary)",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  border: "none",
                }}
              >
                Contact Human Support
              </Button>
              <Text muted className="mt-2">
                Our team can assist you when AI cannot help
              </Text>
            </Card>
          </div>
        </div>
      </div>

      {/* Tailwind bounce animation delays */}
      <style jsx>{`
        .animate-bounce200 {
          animation: bounce 1s infinite 0.2s;
        }
        .animate-bounce400 {
          animation: bounce 1s infinite 0.4s;
        }
      `}</style>
    </div>
  );
}
