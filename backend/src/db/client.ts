import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../../pingslot.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

console.log(`[DB] Connected to database at: ${dbPath}`);
