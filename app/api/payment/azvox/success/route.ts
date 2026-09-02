import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://adearn.ru";
  const advertiserId = searchParams.get("advertiserId");

  if (advertiserId) {
    return NextResponse.redirect(new URL("/advertiser?success=1", baseUrl));
  }
  return NextResponse.redirect(new URL("/finance?success=1", baseUrl));
}

