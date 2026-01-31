#!/usr/bin/env node
/**
 * Script to reset test user password
 * Usage: node scripts/reset-test-user-password.js
 */

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TEST_USER = {
  email: "test@apmac.com",
  password: "Test1234!",
};

async function resetPassword() {
  try {
    console.log("🔍 Finding test user...");

    const user = await prisma.user.findUnique({
      where: { email: TEST_USER.email },
    });

    if (!user) {
      console.log("❌ User not found!");
      console.log("Please create the user first using create-test-user.js");
      await prisma.$disconnect();
      return;
    }

    console.log("✅ User found. Resetting password...");

    const passwordHash = await bcrypt.hash(TEST_USER.password, 10);

    await prisma.user.update({
      where: { email: TEST_USER.email },
      data: { passwordHash },
    });

    console.log("✅ Password reset successfully!");
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 CREDENTIALS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    ", TEST_USER.email);
    console.log("🔑 Password: ", TEST_USER.password);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n✨ You can now login with these credentials!");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetPassword();
