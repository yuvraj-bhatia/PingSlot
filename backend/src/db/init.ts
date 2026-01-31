import { db } from "./client";

export function initDatabase() {
    // Create targets table
    db.exec(`
    CREATE TABLE IF NOT EXISTS targets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      booking_url TEXT NOT NULL,
      type TEXT NOT NULL,
      requirements_url TEXT,
      alert_email TEXT NOT NULL,
      active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `);

    // Create checks table
    db.exec(`
    CREATE TABLE IF NOT EXISTS checks (
      id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      status TEXT NOT NULL,
      next_slot_time TEXT,
      booking_link TEXT,
      raw_text TEXT,
      checked_at TEXT NOT NULL,
      FOREIGN KEY (target_id) REFERENCES targets(id)
    )
  `);

    // Create alerts table
    db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      dedupe_hash TEXT UNIQUE,
      sent_to TEXT NOT NULL,
      sent_at TEXT NOT NULL,
      next_slot_time TEXT,
      FOREIGN KEY (target_id) REFERENCES targets(id)
    )
  `);

    console.log("[DB] Tables initialized");
}
