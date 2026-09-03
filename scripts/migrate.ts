import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  ListTablesCommand,
  UpdateTableCommand,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { TABLE_SCHEMAS, TABLE_NAMES } from "../lib/schema";
import { TableName } from "../lib/schema";
import { mockPriceList } from "../lib/mock-data";

const client = new DynamoDBClient({
  endpoint: process.env.DOCUMENT_API_ENDPOINT,
  region: process.env.DOCUMENT_API_REGION ?? "ru-central1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLES = TABLE_NAMES.map((name) => TABLE_SCHEMAS[name]);

async function waitForIndexes(tableName: string, indexNames: string[]) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 120_000) {
    const { Table } = await client.send(
      new DescribeTableCommand({ TableName: tableName })
    );
    const existing = Table?.GlobalSecondaryIndexes ?? [];
    const allActive = indexNames.every((name) =>
      existing.some((i) => i.IndexName === name && i.IndexStatus === "ACTIVE")
    );
    if (allActive) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(`Таймаут ожидания индексов для таблицы ${tableName}`);
}

async function migrate() {
  console.log("🔧 Запуск миграций DynamoDB...");

  const { TableNames = [] } = await client.send(new ListTablesCommand({}));

  for (const table of TABLES) {
    if (TableNames.includes(table.name)) {
      const wantedIndexes = table.globalSecondaryIndexes ?? [];
      if (wantedIndexes.length) {
        const { Table } = await client.send(
          new DescribeTableCommand({ TableName: table.name })
        );
        const existingNames =
          Table?.GlobalSecondaryIndexes?.map((i) => i.IndexName) ?? [];
        const missing = wantedIndexes.filter(
          (idx) => !existingNames.includes(idx.IndexName)
        );

        if (missing.length) {
          console.log(
            `  Добавление индексов для ${table.name}: ${missing
              .map((i) => i.IndexName)
              .join(", ")}...`
          );
          await client.send(
            new UpdateTableCommand({
              TableName: table.name,
              GlobalSecondaryIndexUpdates: missing.map((idx) => ({
                Create: {
                  IndexName: idx.IndexName,
                  KeySchema: idx.KeySchema,
                  Projection: idx.Projection,
                },
              })),
              AttributeDefinitions: table.attributeDefinitions,
            })
          );
          await waitForIndexes(
            table.name,
            missing.map((i) => i.IndexName as string)
          );
          console.log(`  ✓ Индексы созданы для: ${table.name}`);
        }
      }
      console.log(`  ✓ Таблица существует: ${table.name}`);
      continue;
    }

    console.log(`  Создание таблицы: ${table.name}...`);

    await client.send(
      new CreateTableCommand({
        TableName: table.name,
        KeySchema: table.keySchema,
        AttributeDefinitions: table.attributeDefinitions,
        ...(table.globalSecondaryIndexes?.length
          ? { GlobalSecondaryIndexes: table.globalSecondaryIndexes }
          : {}),
        BillingMode: "PAY_PER_REQUEST",
      })
    );

    console.log(`  Ожидание активации ${table.name}...`);
    await waitUntilTableExists(
      { client, maxWaitTime: 120 },
      { TableName: table.name }
    );

    console.log(`  ✓ Создана: ${table.name}`);
  }

  console.log("🎉 Миграции завершены!");

  await seedPriceList();
}

async function seedPriceList() {
  console.log("💾 Сидинг прайс-листа...");
  for (const item of mockPriceList) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: TableName.PRICE_LIST,
          Item: { ...item, updatedAt: new Date().toISOString() },
        })
      );
    } catch (e) {
      console.warn(`  ⚠️ Не удалось записать услугу ${item.id}:`, e);
    }
  }
  console.log(`  ✓ Прайс-лист синхронизирован (${mockPriceList.length} услуг)`);
}

migrate().catch((e) => {
  console.error("❌ Ошибка миграции:", e);
  process.exit(1);
});
