import type { AvailabilityResult, SlotInfo } from './types';
import { groq } from '@/lib/groq';

const SYSTEM_PROMPT = `You are an expert at analyzing appointment booking pages to determine if appointments are available for booking RIGHT NOW.

Your task:
1. Carefully analyze the page content
2. Determine if appointments can be booked immediately
3. Extract any specific available time slots mentioned
4. Be CONSERVATIVE - only mark hasAvailability as true if you're confident users can book

Key signals for AVAILABLE:
- Clickable date/time options
- "Select a time" with actual times shown
- Calendar with selectable dates
- "Next available: [specific date]" with booking option
- "Book Now" button that appears functional

Key signals for NOT AVAILABLE:
- "No appointments available"
- "Fully booked"
- "Check back later"
- All dates grayed out on calendar
- "Join waitlist" as the only option
- Only contact forms without date selection

Return ONLY valid JSON, no markdown formatting or code blocks.`;

const USER_PROMPT_TEMPLATE = `Analyze this appointment booking page and determine availability.

Platform type: {{platform}}
(Use platform-specific knowledge if applicable)

PAGE CONTENT:
---
{{content}}
---

Respond with this exact JSON structure:
{
  "hasAvailability": true or false,
  "confidence": 0.0 to 1.0,
  "slots": [
    {
      "datetime": "the date/time or descriptive text like 'Next Monday'",
      "location": "location if mentioned, otherwise null",
      "type": "appointment type if mentioned, otherwise null",
      "rawText": "exact quote from page showing this slot"
    }
  ],
  "reasoning": "2-3 sentence explanation of your analysis"
}

If no specific slots are found but availability exists, return an empty slots array with hasAvailability: true.`;

/**
 * Analyze page content for appointment availability
 */
export async function analyzeAvailability(
  content: string,
  platform: string
): Promise<AvailabilityResult> {
  try {
    // Truncate content if too long (Groq context limit)
    const maxContentLength = 12000;
    const truncatedContent = content.length > maxContentLength
      ? content.slice(0, maxContentLength) + '\n\n[Content truncated...]'
      : content;

    // Build prompt
    const userPrompt = USER_PROMPT_TEMPLATE
      .replace('{{platform}}', platform || 'generic')
      .replace('{{content}}', truncatedContent);

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1, // Low temperature for consistent results
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const responseText = response.choices[0]?.message?.content || '{}';

    // Parse and validate response
    let analysis: any;
    try {
      analysis = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return createErrorResult('Failed to parse AI response');
    }

    // Validate and normalize the response
    return {
      hasAvailability: Boolean(analysis.hasAvailability),
      confidence: normalizeConfidence(analysis.confidence),
      slots: normalizeSlots(analysis.slots),
      reasoning: analysis.reasoning || 'No reasoning provided',
      rawAnalysis: analysis,
    };
  } catch (error) {
    console.error('Availability analysis error:', error);
    return createErrorResult(
      error instanceof Error ? error.message : 'Analysis failed'
    );
  }
}

/**
 * Normalize confidence score to 0-1 range
 */
function normalizeConfidence(confidence: any): number {
  if (typeof confidence !== 'number') return 0;
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Normalize and validate slots array
 */
function normalizeSlots(slots: any): SlotInfo[] {
  if (!Array.isArray(slots)) return [];

  return slots
    .filter((slot: any) => slot && typeof slot === 'object')
    .map((slot: any) => ({
      datetime: String(slot.datetime || 'Unknown'),
      location: slot.location || undefined,
      type: slot.type || undefined,
      rawText: String(slot.rawText || ''),
    }))
    .slice(0, 10); // Limit to 10 slots
}

/**
 * Create an error result
 */
function createErrorResult(reason: string): AvailabilityResult {
  return {
    hasAvailability: false,
    confidence: 0,
    slots: [],
    reasoning: `Analysis error: ${reason}`,
  };
}

/**
 * Platform-specific content preprocessing
 */
export function preprocessForPlatform(content: string, platform: string): string {
  const normalizedPlatform = (platform || 'generic').toLowerCase();

  switch (normalizedPlatform) {
    case 'acuity':
      return preprocessAcuity(content);
    case 'calendly':
      return preprocessCalendly(content);
    case 'square':
      return preprocessSquare(content);
    default:
      return content;
  }
}

function preprocessAcuity(content: string): string {
  return content
    .replace(/Powered by Acuity Scheduling/gi, '')
    .replace(/Scheduling by Acuity/gi, '')
    // Acuity often has timezone selectors - keep those
    .replace(/\bPST\b|\bEST\b|\bCST\b|\bMST\b/gi, (match) => `[${match}]`);
}

function preprocessCalendly(content: string): string {
  return content
    .replace(/Powered by Calendly/gi, '')
    .replace(/Cookie settings/gi, '');
}

function preprocessSquare(content: string): string {
  return content
    .replace(/Powered by Square/gi, '')
    .replace(/Square Appointments/gi, '');
}
