import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseAvailable } from "@/lib/db";
import { getMaintenanceMode, setMaintenanceMode } from "@/lib/models";
import { mockMaintenanceMode } from "@/lib/mock-data";

const toggleSchema = z.object({
  enabled: z.boolean(),
});

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let mode = mockMaintenanceMode;

  if (dbAvailable) {
    const dbMode = await getMaintenanceMode();
    if (dbMode) {
      mode = dbMode;
    }
  }

  return NextResponse.json(mode);
}

export async function POST(request: NextRequest) {
  const parsed = toggleSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const mode = await setMaintenanceMode(parsed.data.enabled, "admin");
  return NextResponse.json(mode);
}
