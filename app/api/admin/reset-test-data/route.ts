import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { resetTestBalances } from "@/lib/models";

export async function POST() {
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    return NextResponse.json(
      { error: "База данных недоступна" },
      { status: 503 }
    );
  }

  const result = await resetTestBalances();

  return NextResponse.json({
    success: true,
    ...result,
    message: `Обнулено аккаунтов: ${result.usersReset} пользователей, ${result.advertisersReset} рекламодателей`,
  });
}
