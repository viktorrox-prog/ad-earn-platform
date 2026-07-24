import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getAdminSettings, updateAdminSettings } from "@/lib/models";
import { mockAdminSettings } from "@/lib/mock-data";
import { updateAdminSettingsSchema } from "@/lib/validation/admin";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let settings = mockAdminSettings;

  if (dbAvailable) {
    const dbSettings = await getAdminSettings();
    if (dbSettings) {
      settings = dbSettings;
    }
  }

  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const parsed = updateAdminSettingsSchema.safeParse(await request.json());
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

  const settings = await updateAdminSettings(parsed.data);
  return NextResponse.json(settings);
}
