import { NextRequest } from "next/server";
import { getSessionManager } from "@/lib/backend/booker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TERMINAL_STATUSES = new Set(["success", "failed", "cancelled"]);

/**
 * GET /api/ws/booking?sessionId=...
 * Stream booking session events via Server-Sent Events (SSE).
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("Missing sessionId", { status: 400 });
  }

  const sessionManager = getSessionManager();
  const session = sessionManager.getSession(sessionId);

  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );
      };

      // Send initial status snapshot
      send({ type: "status", session });

      if (TERMINAL_STATUSES.has(session.status)) {
        controller.close();
        return;
      }

      const unsubscribe = sessionManager.onSessionEvent(sessionId, (event) => {
        send(event);

        if (
          event.type === "success" ||
          event.type === "cancelled" ||
          (event.type === "status" && TERMINAL_STATUSES.has(event.session.status))
        ) {
          unsubscribe();
          controller.close();
        }
      });

      request.signal.addEventListener("abort", () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
