import express from "express";
import dotenv from "dotenv";
import { initDatabase } from "./db/init";
import { targetsRouter } from "./routes/targets";
import { checkRouter } from "./routes/check";
import { scrapeToText } from "./lib/firecrawl";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize database
initDatabase();

// Health check
app.get("/health", (req, res) => {
    res.json({ ok: true, name: "PingSlot" });
});

// Debug endpoint
app.get("/debug/firecrawl", async (req, res) => {
    try {
        const url = req.query.url as string;
        if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
            return res.status(400).json({ ok: false, error: "Invalid url parameter" });
        }

        const result = await scrapeToText(url);
        const preview = result.text.substring(0, 500);

        res.json({ ok: true, url: result.url, preview });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ ok: false, error: message });
    }
});

// API routes
app.use("/api/targets", targetsRouter);
app.use("/api/check", checkRouter);
app.use("/api", checkRouter);

// Start server
app.listen(PORT, () => {
    console.log(`[Server] PingSlot backend running on http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/health`);
});
