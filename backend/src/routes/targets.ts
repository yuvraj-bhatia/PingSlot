import { Router, Request, Response } from "express";
import { db } from "../db/client";
import { Target } from "../../../shared/types";
import { randomUUID } from "crypto";

export const targetsRouter = Router();

// POST /api/targets - Create a new target
targetsRouter.post("/", (req: Request, res: Response) => {
    const { name, bookingUrl, type, alertEmail, requirementsUrl } = req.body;

    // Validate required fields
    if (!name || !bookingUrl || !type || !alertEmail) {
        res.status(400).json({ error: "Missing required fields: name, bookingUrl, type, alertEmail" });
        return;
    }

    // Validate type
    if (!["acuity", "generic", "unknown"].includes(type)) {
        res.status(400).json({ error: "Invalid type. Must be 'acuity', 'generic', or 'unknown'" });
        return;
    }

    const id = randomUUID();
    const createdAt = new Date().toISOString();

    try {
        const stmt = db.prepare(`
      INSERT INTO targets (id, name, booking_url, type, requirements_url, alert_email, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `);

        stmt.run(id, name, bookingUrl, type, requirementsUrl || null, alertEmail, createdAt);

        const target: Target = {
            id,
            name,
            bookingUrl,
            type,
            requirementsUrl: requirementsUrl || null,
            alertEmail,
        };

        res.status(201).json(target);
    } catch (error) {
        console.error("[Targets] Error creating target:", error);
        res.status(500).json({ error: "Failed to create target" });
    }
});

// GET /api/targets - Get all targets with last check summary
targetsRouter.get("/", (req: Request, res: Response) => {
    try {
        const targets = db.prepare(`
      SELECT 
        t.id,
        t.name,
        t.booking_url as bookingUrl,
        t.type,
        t.requirements_url as requirementsUrl,
        t.alert_email as alertEmail,
        t.active,
        t.created_at as createdAt,
        c.status as lastStatus,
        c.next_slot_time as lastNextSlotTime,
        c.checked_at as lastCheckedAt
      FROM targets t
      LEFT JOIN (
        SELECT target_id, status, next_slot_time, checked_at,
               ROW_NUMBER() OVER (PARTITION BY target_id ORDER BY checked_at DESC) as rn
        FROM checks
      ) c ON t.id = c.target_id AND c.rn = 1
      WHERE t.active = 1
      ORDER BY t.created_at DESC
    `).all();

        res.json(targets);
    } catch (error) {
        console.error("[Targets] Error fetching targets:", error);
        res.status(500).json({ error: "Failed to fetch targets" });
    }
});
