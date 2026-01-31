// apmac-ui/src/components/chatbot/ChatbotWidget.tsx
"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import "./chatbot.css";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  type?: "chat" | "action" | "page_help" | "redirect";
  metadata?: Record<string, unknown>;
}

interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon?: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const initializeChat = useCallback(async () => {
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPage: pathname }),
      });

      const data = await response.json();

      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          type: data.type,
        },
      ]);

      setQuickActions(data.quickActions || []);
      setSessionId(data.sessionId);
      setShowQuickActions(true);
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    }
  }, [pathname]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, initializeChat, messages.length]);

  useEffect(() => {
    if (messages.length === 0) return;
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          action: "chat",
          currentPage: pathname,
          sessionId,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        type: data.type,
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSuggestions(data.suggestions || []);

      // Handle redirects
      if (data.type === "redirect" && data.metadata?.url) {
        setTimeout(() => {
          window.location.href = data.metadata.url;
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    setShowQuickActions(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: action.label,
      timestamp: new Date(),
      type: "action",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action.action,
          currentPage: pathname,
          sessionId,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        type: data.type,
        metadata: data.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Handle redirects
      if (data.type === "redirect" && data.metadata?.url) {
        setTimeout(() => {
          window.location.href = data.metadata.url;
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to handle action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!session) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-button"
        aria-label="Open chatbot"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <h3>APMAC Assistant</h3>
                <p>Always here to help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="chatbot-close"
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.role}`}
              >
                {message.role === "assistant" && (
                  <div className="message-avatar">🤖</div>
                )}
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {showQuickActions && quickActions.length > 0 && (
              <div className="quick-actions">
                <p className="quick-actions-title">Quick actions:</p>
                <div className="quick-actions-grid">
                  {quickActions.map((action) => (
                    <button
                      type="button"
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className="quick-action-btn"
                    >
                      {action.icon && <span>{action.icon}</span>}
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && !showQuickActions && (
              <div className="suggestions">
                <p className="suggestions-title">You might also ask:</p>
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    className="suggestion-btn"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="chatbot-send-btn"
              aria-label="Send message"
            >
              {isLoading ? "⏳" : "➤"}
            </button>
          </div>

          {/* Footer */}
          <div className="chatbot-footer">
            <button
              type="button"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="chatbot-footer-btn"
            >
              {showQuickActions ? "Hide" : "Show"} quick actions
            </button>
          </div>
        </div>
      )}
    </>
  );
}
