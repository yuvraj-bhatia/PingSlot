import type { RequirementCategory, RequirementItem } from "@/lib/types";
import { groq } from "@/lib/groq";

const PROMPT = `Extract all requirements from this document for an appointment.

Document:
{{content}}

Return a JSON object with this shape:
{
  "items": [
    {
      "text": "requirement description",
      "category": "document|payment|preparation|other",
      "required": true|false,
      "details": "additional context"
    }
  ]
}

Categories:
- document: IDs, forms, certificates to bring
- payment: fees, payment methods
- preparation: things to do before
- other: anything else

Only return the JSON object, no other text.`;

const VALID_CATEGORIES: RequirementCategory[] = [
  "document",
  "payment",
  "preparation",
  "other",
];

function normalizeCategory(value: unknown): RequirementCategory {
  if (typeof value !== "string") return "other";
  const normalized = value.toLowerCase().trim();
  return (VALID_CATEGORIES as string[]).includes(normalized) ? (normalized as RequirementCategory) : "other";
}

function normalizeItems(items: unknown): RequirementItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const raw = item as Record<string, unknown>;
      const text = typeof raw.text === "string" ? raw.text.trim() : "";
      if (!text) return null;

      const details =
        typeof raw.details === "string" && raw.details.trim()
          ? raw.details.trim()
          : undefined;

      const normalized: RequirementItem = {
        text,
        category: normalizeCategory(raw.category),
        required: Boolean(raw.required),
        ...(details ? { details } : {}),
      };

      return normalized;
    })
    .filter((item): item is RequirementItem => item !== null);
}

export async function extractRequirements(content: string): Promise<RequirementItem[]> {
  if (!content.trim()) return [];
  if (!process.env.GROQ_API_KEY) {
    console.warn("[Requirements] GROQ_API_KEY is not set - skipping AI extraction");
    return [];
  }

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
    messages: [
      {
        role: "user",
        content: PROMPT.replace("{{content}}", content.slice(0, 10000)),
      },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content || "";
  if (!text) return [];

  try {
    const parsed = JSON.parse(text) as { items?: RequirementItem[] } | RequirementItem[];
    if (Array.isArray(parsed)) {
      return normalizeItems(parsed);
    }
    return normalizeItems(parsed.items);
  } catch (error) {
    console.warn("[Requirements] Failed to parse Groq response", error);
    return [];
  }
}
