import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { CheckResult, CheckStatus } from "../../../shared/types";
import { randomUUID } from "crypto";
import { scrapeToText } from "../lib/firecrawl";

export const checkRouter = Router();

// POST /api/check - Run checks on all active targets
checkRouter.post("/", async (req: Request, res: Response) => {
    try {
        const targets = db.prepare(`
      SELECT id, name, booking_url, type, requirements_url, alert_email
      FROM targets
      WHERE active = 1
    `).all() as Array<{
            id: string;
            name: string;
            booking_url: string;
            type: string;
            requirements_url: string | null;
            alert_email: string;
        }>;

        const results: Array<{ targetId: string; status: CheckStatus; nextSlotTime: string | null; bookingLink: string; checkedAt: string }> = [];
        const checkedAt = new Date().toISOString();

        const insertStmt = db.prepare(`
      INSERT INTO checks (id, target_id, status, next_slot_time, booking_link, raw_text, checked_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        for (const target of targets) {
            const checkId = randomUUID();
            let status: CheckStatus = "unknown";
            let nextSlotTime: string | null = null;
            let rawText = "";

            try {
                const scrapeResult = await scrapeToText(target.booking_url);
                const text = scrapeResult.text;
                rawText = text.substring(0, 2000);

                if (!text || text.trim().length === 0) {
                    status = "blocked";
                } else {
                    const lowerText = text.toLowerCase();

                    const availableKeywords = [
                        "select a time",
                        "choose a time",
                        "available times",
                        "book now",
                        "confirm",
                        "duration",
                        "timezone"
                    ];

                    const unavailableKeywords = [
                        "no times available",
                        "no availability",
                        "fully booked",
                        "no appointments available"
                    ];

                    const hasAvailable = availableKeywords.some(kw => lowerText.includes(kw));
                    const hasUnavailable = unavailableKeywords.some(kw => lowerText.includes(kw));

                    if (hasAvailable) {
                        status = "available";
                        nextSlotTime = new Date().toISOString();
                    } else if (hasUnavailable) {
                        status = "unavailable";
                    } else {
                        status = "unknown";
                    }
                }
            } catch (error) {
                status = "error";
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                rawText = `Firecrawl error: ${errorMessage}`;
                console.error(`[Check] Error scraping ${target.name}:`, errorMessage);
            }

            insertStmt.run(
                checkId,
                target.id,
                status,
                nextSlotTime,
                target.booking_url,
                rawText,
                checkedAt
            );

            const result = {
                targetId: target.id,
                status,
                nextSlotTime,
                bookingLink: target.booking_url,
                checkedAt
            };

            results.push(result);
        }

        console.log(`[Check] Processed ${results.length} targets`);
        res.json({ ok: true, results });
    } catch (error) {
        console.error("[Check] Error running checks:", error);
        res.status(500).json({ error: "Failed to run checks" });
    }
});

// GET /api/results?targetId=<id> - Get check results for a target
checkRouter.get("/results", (req: Request, res: Response) => {
    const { targetId } = req.query;

    if (!targetId || typeof targetId !== "string") {
        res.status(400).json({ error: "Missing or invalid targetId query parameter" });
        return;
    }

    try {
        // Get latest check
        const latestCheck = db.prepare(`
      SELECT id, target_id, status, next_slot_time, booking_link, raw_text, checked_at
      FROM checks
      WHERE target_id = ?
      ORDER BY checked_at DESC
      LIMIT 1
    `).get(targetId);

        // Get last 5 checks
        const recentChecks = db.prepare(`
      SELECT id, target_id, status, next_slot_time, booking_link, raw_text, checked_at
      FROM checks
      WHERE target_id = ?
      ORDER BY checked_at DESC
      LIMIT 5
    `).all(targetId);

        res.json({
            latestCheck: latestCheck || null,
            recentChecks: recentChecks || [],
        });
    } catch (error) {
        console.error("[Check] Error fetching results:", error);
        res.status(500).json({ error: "Failed to fetch results" });
    }
});
