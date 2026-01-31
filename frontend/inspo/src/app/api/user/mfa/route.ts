// src/app/api/user/mfa/route.ts
// NOTE: MFA is NOT implemented. This endpoint returns 501 Not Implemented.
// TODO: Implement proper MFA with TOTP/SMS when ready for production.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(_req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // MFA is NOT IMPLEMENTED - return 501
    return NextResponse.json(
      {
        error: "MFA not implemented",
        message:
          "Multi-factor authentication is coming soon. This feature is not yet available.",
        status: "not_implemented",
      },
      { status: 501 },
    );
  } catch (error) {
    console.error("MFA update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(_req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return MFA status - always disabled since not implemented
    return NextResponse.json({
      sms_enabled: false,
      app_enabled: false,
      available: false,
      message: "MFA is not yet available. Coming soon.",
    });
  } catch (error) {
    console.error("MFA status error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
