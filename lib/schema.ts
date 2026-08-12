import {
  type KeySchemaElement,
  type AttributeDefinition,
  type GlobalSecondaryIndex,
} from "@aws-sdk/client-dynamodb";

export const TableName = {
  SERVICES: "services",
  USERS: "users",
  VERIFICATION_CODES: "verification_codes",
  TRANSACTIONS: "transactions",
  ADS: "ads",
  AD_VIEWS: "ad_views",
  TASKS: "tasks",
  TASK_COMPLETIONS: "task_completions",
  ADVERTISERS: "advertisers",
  CAMPAIGNS: "campaigns",
  WITHDRAWAL_REQUESTS: "withdrawal_requests",
  TICKETS: "tickets",
  DASHBOARD_BANNERS: "dashboard_banners",
  BROADCASTS: "broadcasts",
  ADMIN_SETTINGS: "admin_settings",
  PRICE_LIST: "price_list",
  MAINTENANCE_MODE: "maintenance_mode",
  HOMEPAGE_BANNERS: "homepage_banners",
  TASK_REVIEWS: "task_reviews",
} as const;

export type TableName = (typeof TableName)[keyof typeof TableName];

export interface TableSchema {
  name: TableName;
  keySchema: KeySchemaElement[];
  attributeDefinitions: AttributeDefinition[];
  globalSecondaryIndexes?: GlobalSecondaryIndex[];
}

export const TABLE_SCHEMAS: Record<TableName, TableSchema> = {
  [TableName.SERVICES]: {
    name: TableName.SERVICES,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.USERS]: {
    name: TableName.USERS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
      { AttributeName: "phone", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "email-index",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "phone-index",
        KeySchema: [{ AttributeName: "phone", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.VERIFICATION_CODES]: {
    name: TableName.VERIFICATION_CODES,
      REFERRAL_CLICKS: "referral_clicks",

  keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "target", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "target-index",
        KeySchema: [{ AttributeName: "target", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.TRANSACTIONS]: {
    name: TableName.TRANSACTIONS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "userId-index",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.ADS]: {
    name: TableName.ADS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.AD_VIEWS]: {
    name: TableName.AD_VIEWS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "userId-index",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.TASKS]: {
    name: TableName.TASKS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.TASK_COMPLETIONS]: {
    name: TableName.TASK_COMPLETIONS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "userId-index",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.ADVERTISERS]: {
    name: TableName.ADVERTISERS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
      { AttributeName: "referredBy", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "email-index",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "referredBy-index",
        KeySchema: [{ AttributeName: "referredBy", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.CAMPAIGNS]: {
    name: TableName.CAMPAIGNS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "advertiserId", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "advertiserId-index",
        KeySchema: [{ AttributeName: "advertiserId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.WITHDRAWAL_REQUESTS]: {
    name: TableName.WITHDRAWAL_REQUESTS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "userId-index",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.TICKETS]: {
    name: TableName.TICKETS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "userId-index",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.DASHBOARD_BANNERS]: {
    name: TableName.DASHBOARD_BANNERS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.BROADCASTS]: {
    name: TableName.BROADCASTS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
  [TableName.ADMIN_SETTINGS]: {
    name: TableName.ADMIN_SETTINGS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
  [TableName.PRICE_LIST]: {
    name: TableName.PRICE_LIST,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
  [TableName.MAINTENANCE_MODE]: {
    name: TableName.MAINTENANCE_MODE,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
  [TableName.HOMEPAGE_BANNERS]: {
    name: TableName.HOMEPAGE_BANNERS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.TASK_REVIEWS]: {
    name: TableName.TASK_REVIEWS,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "advertiserId", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "advertiserId-index",
        KeySchema: [{ AttributeName: "advertiserId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "userId-index",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
};

export const TABLE_NAMES: TableName[] = Object.values(TableName);

export const IndexName = {
  SERVICES_STATUS: "status-index",
  USERS_EMAIL: "email-index",
  USERS_PHONE: "phone-index",
  VERIFICATION_CODES_TARGET: "target-index",
  TRANSACTIONS_USER_ID: "userId-index",
  ADS_STATUS: "status-index",
  AD_VIEWS_USER_ID: "userId-index",
  TASKS_STATUS: "status-index",
  TASK_COMPLETIONS_USER_ID: "userId-index",
  ADVERTISERS_EMAIL: "email-index",
  ADVERTISERS_REFERRED_BY: "referredBy-index",
  CAMPAIGNS_ADVERTISER_ID: "advertiserId-index",
  WITHDRAWAL_REQUESTS_USER_ID: "userId-index",
  CAMPAIGNS_STATUS: "status-index",
  TICKETS_USER_ID: "userId-index",
  TICKETS_STATUS: "status-index",
  DASHBOARD_BANNERS_STATUS: "status-index",
  HOMEPAGE_BANNERS_STATUS: "status-index",
  TASK_REVIEWS_ADVERTISER_ID: "advertiserId-index",
  TASK_REVIEWS_STATUS: "status-index",
  TASK_REVIEWS_USER_ID: "userId-index",
} as const;

export type IndexName = (typeof IndexName)[keyof typeof IndexName];
