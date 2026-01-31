Create (or paste into the prompt) a stable set of facts so the agent doesn’t guess. This is the single biggest quality lever.

Include in Context Pack

Routes: / (Dashboard), /targets/[id] (Details)

State model (frontend):

status: available | unavailable | unknown | error

nextSlotTime: ISO string or null

lastCheckedAt: ISO

lastAlert: { status: sent|deduped|not_sent|error, reason?: string, at?: ISO }

API contracts (even if mock initially):

GET /api/targets → TargetSummary[]

POST /api/targets → created target

GET /api/targets/:id → TargetDetail

POST /api/check → { runId }

GET /api/check/:runId → { state: running|complete|error, progress, summary, resultsByTargetId }

UI rules:

Never blank old data on error

Dedupe reasons always visible

Source links always visible

A11y requirements: keyboard-only completion, focus visible, labels/errors, no color-only status

Performance constraints: stable layout (no CLS), minimal re-renders on polling

Definition of Done standard: working UI + states + lint + basic tests if applicable.