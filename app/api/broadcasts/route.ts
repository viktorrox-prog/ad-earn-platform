import { NextResponse } from "next/server";
import { getLatestBroadcast } from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { mockBroadcasts } from "@/lib/mock-data";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    const broadcast = await getLatestBroadcast();
    return NextResponse.json({ broadcast });
  }
  const sorted = [...mockBroadcasts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ broadcast: sorted[0] ?? null });
}
