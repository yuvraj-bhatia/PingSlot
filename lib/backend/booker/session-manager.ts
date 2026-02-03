/**
 * Booking Session Manager
 *
 * Tracks active booking sessions, enables cancellation,
 * and provides session status queries.
 */

import { EventEmitter } from "events";
import type {
  BookingStatus,
  BookingSession,
  BookingConfirmation,
} from "./types";

// ============================================================================
// Types
// ============================================================================

export interface SessionState {
  id: string;
  targetId: string;
  status: BookingStatus;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  screenshot?: string;
  error?: string;
  confirmation?: BookingConfirmation;
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelled: boolean;
}

export type SessionEvent =
  | { type: "status"; session: SessionState }
  | { type: "screenshot"; data: string; step: string }
  | { type: "log"; message: string; level: "info" | "warn" | "error" }
  | { type: "success"; confirmation: BookingConfirmation }
  | { type: "error"; message: string; recoverable: boolean }
  | { type: "cancelled" };

// ============================================================================
// Session Manager Class
// ============================================================================

export class SessionManager extends EventEmitter {
  private sessions: Map<string, SessionState> = new Map();
  private sessionCleanupTimeout = 30 * 60 * 1000; // 30 minutes

  constructor() {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Create a new booking session.
   */
  createSession(targetId: string): SessionState {
    const sessionId = `booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date();

    const session: SessionState = {
      id: sessionId,
      targetId,
      status: "initializing",
      currentStep: 0,
      totalSteps: 6,
      stepName: "initializing",
      startedAt: now,
      updatedAt: now,
      cancelled: false,
    };

    this.sessions.set(sessionId, session);
    this.emitSessionEvent(sessionId, { type: "status", session });

    // Schedule cleanup for stale sessions
    setTimeout(() => {
      this.cleanupSession(sessionId);
    }, this.sessionCleanupTimeout);

    return session;
  }

  /**
   * Get a session by ID.
   */
  getSession(sessionId: string): SessionState | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions.
   */
  getActiveSessions(): SessionState[] {
    return Array.from(this.sessions.values()).filter(
      (s) => !["success", "failed", "cancelled"].includes(s.status)
    );
  }

  /**
   * Get sessions for a specific target.
   */
  getSessionsForTarget(targetId: string): SessionState[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.targetId === targetId
    );
  }

  /**
   * Update session status.
   */
  updateSession(
    sessionId: string,
    updates: Partial<Omit<SessionState, "id" | "targetId" | "startedAt">>
  ): SessionState | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Don't update if cancelled
    if (session.cancelled && updates.status !== "cancelled") {
      return session;
    }

    Object.assign(session, {
      ...updates,
      updatedAt: new Date(),
    });

    // Mark as completed if terminal state
    if (["success", "failed", "cancelled"].includes(session.status)) {
      session.completedAt = new Date();
    }

    this.emitSessionEvent(sessionId, { type: "status", session });
    return session;
  }

  /**
   * Update session step.
   */
  updateStep(
    sessionId: string,
    step: number,
    stepName: string,
    status?: BookingStatus
  ): SessionState | null {
    const resolvedStatus = status ?? (stepName as BookingStatus);

    return this.updateSession(sessionId, {
      currentStep: step,
      stepName,
      status: stepName === "success" ? "success" : resolvedStatus,
    });
  }

  /**
   * Add screenshot to session.
   */
  addScreenshot(sessionId: string, screenshot: string, step: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.cancelled) return;

    session.screenshot = screenshot;
    session.updatedAt = new Date();

    this.emitSessionEvent(sessionId, {
      type: "screenshot",
      data: screenshot,
      step,
    });
  }

  /**
   * Log a message for a session.
   */
  log(
    sessionId: string,
    message: string,
    level: "info" | "warn" | "error" = "info"
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    this.emitSessionEvent(sessionId, {
      type: "log",
      message,
      level,
    });
  }

  /**
   * Mark session as successful.
   */
  markSuccess(sessionId: string, confirmation: BookingConfirmation): SessionState | null {
    const session = this.updateSession(sessionId, {
      status: "success",
      confirmation,
    });

    if (session) {
      this.emitSessionEvent(sessionId, {
        type: "success",
        confirmation,
      });
    }

    return session;
  }

  /**
   * Mark session as failed.
   */
  markFailed(sessionId: string, error: string, recoverable = false): SessionState | null {
    const session = this.updateSession(sessionId, {
      status: "failed",
      error,
    });

    if (session) {
      this.emitSessionEvent(sessionId, {
        type: "error",
        message: error,
        recoverable,
      });
    }

    return session;
  }

  /**
   * Cancel a booking session.
   * Returns true if cancellation was successful.
   */
  cancelSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Can't cancel if already in terminal state
    if (["success", "failed", "cancelled"].includes(session.status)) {
      return false;
    }

    session.cancelled = true;
    session.status = "cancelled";
    session.completedAt = new Date();
    session.updatedAt = new Date();

    this.emitSessionEvent(sessionId, { type: "cancelled" });
    this.emitSessionEvent(sessionId, { type: "status", session });

    return true;
  }

  /**
   * Check if a session is cancelled.
   */
  isCancelled(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    return session?.cancelled ?? false;
  }

  /**
   * Subscribe to session events.
   */
  onSessionEvent(
    sessionId: string,
    callback: (event: SessionEvent) => void
  ): () => void {
    const handler = (event: SessionEvent) => callback(event);
    this.on(`session:${sessionId}`, handler);

    return () => {
      this.off(`session:${sessionId}`, handler);
    };
  }

  /**
   * Subscribe to all session events.
   */
  onAnySessionEvent(
    callback: (sessionId: string, event: SessionEvent) => void
  ): () => void {
    const handler = (data: { sessionId: string; event: SessionEvent }) => {
      callback(data.sessionId, data.event);
    };
    this.on("session:*", handler);

    return () => {
      this.off("session:*", handler);
    };
  }

  /**
   * Emit a session event.
   */
  private emitSessionEvent(sessionId: string, event: SessionEvent): void {
    this.emit(`session:${sessionId}`, event);
    this.emit("session:*", { sessionId, event });
  }

  /**
   * Clean up a session.
   */
  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Only cleanup if in terminal state
    if (["success", "failed", "cancelled"].includes(session.status)) {
      this.sessions.delete(sessionId);
      this.removeAllListeners(`session:${sessionId}`);
    }
  }

  /**
   * Force cleanup all completed sessions.
   */
  cleanupCompletedSessions(): number {
    let cleaned = 0;
    for (const [id, session] of this.sessions) {
      if (["success", "failed", "cancelled"].includes(session.status)) {
        this.sessions.delete(id);
        this.removeAllListeners(`session:${id}`);
        cleaned++;
      }
    }
    return cleaned;
  }

  /**
   * Get session statistics.
   */
  getStats(): {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    failed: number;
  } {
    const sessions = Array.from(this.sessions.values());
    return {
      total: sessions.length,
      active: sessions.filter(
        (s) => !["success", "failed", "cancelled"].includes(s.status)
      ).length,
      completed: sessions.filter((s) => s.status === "success").length,
      cancelled: sessions.filter((s) => s.status === "cancelled").length,
      failed: sessions.filter((s) => s.status === "failed").length,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let sessionManagerInstance: SessionManager | null = null;

/**
 * Get the session manager instance.
 */
export function getSessionManager(): SessionManager {
  if (!sessionManagerInstance) {
    sessionManagerInstance = new SessionManager();
  }
  return sessionManagerInstance;
}

export default {
  SessionManager,
  getSessionManager,
};
