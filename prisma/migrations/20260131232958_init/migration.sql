-- CreateTable
CREATE TABLE "targets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "booking_url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'unknown',
    "requirements_url" TEXT,
    "alert_email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "requirements_bullets" TEXT,
    "requirements_hash" TEXT
);

-- CreateTable
CREATE TABLE "checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "next_slot_time" DATETIME,
    "booking_link" TEXT,
    "checked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_text" TEXT,
    "error_message" TEXT,
    CONSTRAINT "checks_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "targets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "target_id" TEXT NOT NULL,
    "dedupe_hash" TEXT NOT NULL,
    "sent_to" TEXT NOT NULL,
    "sent_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "next_slot_time" DATETIME,
    "email_id" TEXT,
    CONSTRAINT "alerts_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "targets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "checks_target_id_checked_at_idx" ON "checks"("target_id", "checked_at");

-- CreateIndex
CREATE INDEX "alerts_target_id_sent_at_idx" ON "alerts"("target_id", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "alerts_dedupe_hash_key" ON "alerts"("dedupe_hash");
