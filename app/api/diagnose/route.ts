import { NextResponse } from "next/server";
import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { docClient, isDatabaseAvailable } from "@/lib/db";
import { TABLE_NAMES } from "@/lib/schema";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  if (!dbAvailable) {
    return NextResponse.json({
      dbAvailable: false,
      message:
        "База данных недоступна (работаем в статическом режиме). Проверьте USE_DATABASE, DOCUMENT_API_ENDPOINT и ключи доступа.",
      existingTables: [],
      expectedTables: TABLE_NAMES,
      missingTables: TABLE_NAMES,
    });
  }

  try {
    const res = await docClient.send(new ListTablesCommand({}));
    const existing = (res.TableNames ?? []).slice().sort();

    const expected = TABLE_NAMES.slice().sort();
    const missing = expected.filter((t) => !existing.includes(t));

    return NextResponse.json({
      dbAvailable: true,
      endpoint: process.env.DOCUMENT_API_ENDPOINT ?? "(не задан)",
      existingTables: existing,
      expectedTables: expected,
      missingTables: missing,
      allPresent: missing.length === 0,
    });
  } catch (err) {
    return NextResponse.json(
      {
        dbAvailable: true,
        error: "Ошибка при получении списка таблиц",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
