import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      email,
      firstName,
      lastName,
      password,
      companyName,
      role,
      department,
      watchTutorial,
      selectedFeatures,
    } = await req.json();

    // Validate required fields
    if (!email || !firstName || !lastName || !password || !companyName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with all fields
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        companyName,
        passwordHash,
        name: `${firstName} ${lastName}`,
        role: role || null,
        department: department || null,
        watchTutorial: watchTutorial ?? true,
        selectedFeatures: selectedFeatures || [],
      },
    });

    return NextResponse.json({ id: user.id });
  } catch (e) {
    console.error("Registration error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
