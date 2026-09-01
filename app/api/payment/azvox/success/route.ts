import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const baseUrl = request.nextUrl.origin;
  const advertiserId = searchParams.get("advertiserId");

  if (advertiserId) {
    return NextResponse.redirect(new URL("/advertiser?success=1", baseUrl));
  }
  return NextResponse.redirect(new URL("/finance?success=1", baseUrl));
}
