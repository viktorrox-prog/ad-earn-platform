import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const globalForDb = globalThis as unknown as {
  docClient: DynamoDBDocumentClient | undefined;
};

function createDocClient() {
  const client = new DynamoDBClient({
    endpoint: process.env.DOCUMENT_API_ENDPOINT,
    region: process.env.DOCUMENT_API_REGION ?? "ru-central1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });

  return DynamoDBDocumentClient.from(client);
}

export const docClient = globalForDb.docClient ?? createDocClient();

if (process.env.NODE_ENV !== "production") globalForDb.docClient = docClient;

const globalForDbAvailable = globalThis as unknown as {
  _dbAvailable: boolean | null;
  _dbAvailablePromise: Promise<boolean> | null;
  _dbAvailableTimestamp: number | null;
};

const RECHECK_INTERVAL_MS = 30_000;

export async function isDatabaseAvailable(): Promise<boolean> {
  if (process.env.USE_DATABASE === "false") {
    return false;
  }

  const cached = globalForDbAvailable._dbAvailable;
  if (cached != null) {
    const elapsed =
      Date.now() - (globalForDbAvailable._dbAvailableTimestamp ?? 0);
    if (cached || elapsed < RECHECK_INTERVAL_MS) {
      return cached;
    }
  }

  if (globalForDbAvailable._dbAvailablePromise) {
    return globalForDbAvailable._dbAvailablePromise;
  }

  const promise = (async () => {
    try {
      await docClient.send(new ListTablesCommand({}));
      globalForDbAvailable._dbAvailable = true;
      globalForDbAvailable._dbAvailableTimestamp = Date.now();
      return true;
    } catch {
      console.warn("Database is not available. Running in static mode.");
      globalForDbAvailable._dbAvailable = false;
      globalForDbAvailable._dbAvailableTimestamp = Date.now();
      return false;
    } finally {
      globalForDbAvailable._dbAvailablePromise = null;
    }
  })();

  globalForDbAvailable._dbAvailablePromise = promise;
  return promise;
}

export function resetDbAvailableCache(): void {
  globalForDbAvailable._dbAvailable = null;
  globalForDbAvailable._dbAvailablePromise = null;
  globalForDbAvailable._dbAvailableTimestamp = null;
}
