import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const baseUrl = request.nextUrl.origin;
  const advertiserId = searchParams.get("advertiserId");

  if (advertiserId) {
    return NextResponse.redirect(
      new URL("/advertiser?error=payment_failed", baseUrl)
    );
  }
  return NextResponse.redirect(
    new URL("/finance?error=payment_failed", baseUrl)
  );
}
