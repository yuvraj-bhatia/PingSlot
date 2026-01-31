import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const testEmail = "test@example.com";
  const testPassword = "password123";

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  if (existingUser) {
    console.log("Test user already exists:", testEmail);
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(testPassword, 10);

  // Create user
  const _user = await prisma.user.create({
    data: {
      email: testEmail,
      firstName: "Test",
      lastName: "User",
      companyName: "Test Company",
      passwordHash: passwordHash,
      name: "Test User",
    },
  });

  console.log("✅ Test user created successfully!");
  console.log("📧 Email:", testEmail);
  console.log("🔑 Password:", testPassword);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
