#!/usr/bin/env node
/**
 * Script to create test user for local development
 * Usage: node scripts/create-test-user.js
 *
 * This will create a test user with credentials:
 * Email: test@apmac.com
 * Password: Test1234!
 */

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TEST_USER = {
  email: "test@apmac.com",
  password: "Test1234!",
  firstName: "Test",
  lastName: "User",
  companyName: "APMAC Test Company",
  role: "Admin",
  department: "Engineering",
  watchTutorial: false,
  selectedFeatures: ["Dashboard", "Analytics"],
  isAdmin: true,
};

async function createTestUser() {
  try {
    console.log("🔍 Checking for existing test user...");

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: TEST_USER.email },
    });

    if (existing) {
      console.log("⚠️  Test user already exists!");
      console.log("📧 Email:", TEST_USER.email);
      console.log("🔑 Password:", TEST_USER.password);
      console.log("\nYou can use these credentials to login.");
      console.log("To reset the user, delete it from the database first.");
      await prisma.$disconnect();
      return;
    }

    // Create user
    console.log("👤 Creating test user...");
    const passwordHash = await bcrypt.hash(TEST_USER.password, 10);

    const { password: _password, ...userData } = TEST_USER;
    const _user = await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
        name: `${TEST_USER.firstName} ${TEST_USER.lastName}`,
      },
    });

    console.log("✅ Test user created successfully!");
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📋 TEST CREDENTIALS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    ", TEST_USER.email);
    console.log("🔑 Password: ", TEST_USER.password);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🌐 Login URL: http://localhost:3000/SignIn");
    console.log("📊 Dashboard: http://localhost:3000/dashboard");
    console.log("\n✨ You can now login and access all features!");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTestUser();
