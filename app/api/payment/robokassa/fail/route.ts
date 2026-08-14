import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin;
  return NextResponse.redirect(
    new URL("/finance?error=payment_failed", baseUrl)
  );
}
