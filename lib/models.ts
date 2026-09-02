import { docClient } from "./db";
import {
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { TableName, IndexName } from "./schema";

export interface Service {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "deploying";
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  passwordHash: string;
  verified: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationCode {
  id: string;
  target: string;
  code: string;
  type: "email_verification" | "phone_verification" | "password_reset";
  expiresAt: string;
  createdAt: string;
}

export type TransactionType =
  "earnings" | "withdrawal" | "referral" | "deposit";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface ReferralClick {
  id: string;
  referrerId: string;
  createdAt: string;
  convertedAdvertiserId?: string;
  convertedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  createdAt: string;
}

export type AdType = "video" | "banner";
export type AdStatus = "active" | "inactive";

export interface Ad {
  id: string;
  title: string;
  description?: string;
  type: AdType;
  mediaUrl: string;
  reward: number;
  duration: number;
  status: AdStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdView {
  id: string;
  userId: string;
  adId: string;
  reward: number;
  watchedAt: string;
}

export type TaskPlatform =
  "youtube" | "vk" | "telegram" | "cpc" | "app" | "survey" | "other";
export type TaskActionType =
  | "watch"
  | "like"
  | "subscribe"
  | "comment"
  | "cpc"
  | "install"
  | "survey"
  | "other";
export type TaskType =
  "social" | "subscription" | "cpc" | "app_install" | "survey";
export type TaskStatus = "active" | "inactive";

export interface Task {
  id: string;
  title: string;
  description: string;
  platform: TaskPlatform;
  actionType: TaskActionType;
  taskType: TaskType;
  url: string;
  reward: number;
  status: TaskStatus;
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  userId: string;
  reward: number;
  completedAt: string;
}

export type TaskReviewStatus = "pending" | "approved" | "rejected";

export interface TaskReview {
  id: string;
  taskId: string;
  userId: string;
  advertiserId: string;
  campaignId?: string;
  reward: number;
  status: TaskReviewStatus;
  createdAt: string;
  expiresAt: string;
  reviewedAt?: string;
  taskTitle?: string;
}

export interface Advertiser {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  passwordHash: string;
  balance: number;
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type CampaignType =
  "video" | "banner" | "cpc" | "survey" | "app_install" | "subscription";
export type CampaignStatus = "active" | "paused" | "completed";

export const MIN_VIEWS_BY_CAMPAIGN_TYPE: Record<CampaignType, number> = {
  video: 500,
  banner: 400,
  cpc: 200,
  survey: 100,
  app_install: 50,
  subscription: 100,
};

export interface Campaign {
  id: string;
  advertiserId: string;
  title: string;
  description?: string;
  type: CampaignType;
  mediaUrl?: string;
  targetUrl?: string;
  taskDescription?: string;
  budget: number;
  duration: number;
  costPerView: number;
  status: CampaignStatus;
  views: number;
  clicks: number;
  spend: number;
  completions: number;
  createdAt: string;
  updatedAt: string;
}

export type WithdrawalRequestStatus = "pending" | "approved" | "rejected";
export type WithdrawalMethod = "card" | "sbp";

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  method: WithdrawalMethod;
  recipient: string;
  status: WithdrawalRequestStatus;
  createdAt: string;
}

export type TicketStatus = "open" | "closed";

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: TicketStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getServiceById(id: string): Promise<Service | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
  return (result.Item as Service) ?? null;
}

export async function getServicesByStatus(status: string): Promise<Service[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.SERVICES,
      IndexName: IndexName.SERVICES_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function getAllServices(): Promise<Service[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.SERVICES,
    })
  );
  return (result.Items as Service[]) ?? [];
}

export async function createService(
  data: Omit<Service, "createdAt" | "updatedAt">
): Promise<Service> {
  const now = new Date().toISOString();
  const service: Service = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.SERVICES,
      Item: service,
    })
  );

  return service;
}

export async function updateService(
  id: string,
  data: Partial<Pick<Service, "name" | "description" | "status" | "url">>
): Promise<Service> {
  const updateExpr = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.description !== undefined) {
    updateExpr.push("#description = :description");
    exprValues[":description"] = data.description;
    exprNames["#description"] = "description";
  }

  if (data.status !== undefined) {
    updateExpr.push("#status = :status");
    exprValues[":status"] = data.status;
    exprNames["#status"] = "status";
  }

  if (data.url !== undefined) {
    updateExpr.push("#url = :url");
    exprValues[":url"] = data.url;
    exprNames["#url"] = "url";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.SERVICES,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as Service;
}

export async function deleteService(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.SERVICES,
      Key: { id },
    })
  );
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.USERS,
      Key: { id },
    })
  );
  return (result.Item as User) ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.USERS,
      IndexName: IndexName.USERS_EMAIL,
      KeyConditionExpression: "#email = :email",
      ExpressionAttributeNames: { "#email": "email" },
      ExpressionAttributeValues: { ":email": email },
    })
  );
  return (result.Items?.[0] as User) ?? null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.USERS,
      IndexName: IndexName.USERS_PHONE,
      KeyConditionExpression: "#phone = :phone",
      ExpressionAttributeNames: { "#phone": "phone" },
      ExpressionAttributeValues: { ":phone": phone },
    })
  );
  return (result.Items?.[0] as User) ?? null;
}

export async function createUser(
  data: Omit<User, "createdAt" | "updatedAt">
): Promise<User> {
  const now = new Date().toISOString();
  const user: User = { ...data, createdAt: now, updatedAt: now };

  await docClient.send(
    new PutCommand({
      TableName: TableName.USERS,
      Item: user,
    })
  );

  return user;
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, "verified" | "passwordHash">>
): Promise<User | null> {
  const updateExpr = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.verified !== undefined) {
    updateExpr.push("#verified = :verified");
    exprValues[":verified"] = data.verified;
    exprNames["#verified"] = "verified";
  }

  if (data.passwordHash !== undefined) {
    updateExpr.push("#passwordHash = :passwordHash");
    exprValues[":passwordHash"] = data.passwordHash;
    exprNames["#passwordHash"] = "passwordHash";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.USERS,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return (result.Attributes as User) ?? null;
}

export async function createVerificationCode(
  data: Omit<VerificationCode, "createdAt" | "id">
): Promise<VerificationCode> {
  const { randomUUID } = await import("crypto");
  const code: VerificationCode = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.VERIFICATION_CODES,
      Item: code,
    })
  );

  return code;
}

export async function getVerificationCodeByTarget(
  target: string,
  _type: VerificationCode["type"]
): Promise<VerificationCode | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.VERIFICATION_CODES,
      IndexName: IndexName.VERIFICATION_CODES_TARGET,
      KeyConditionExpression: "#target = :target",
      ExpressionAttributeNames: { "#target": "target" },
      ExpressionAttributeValues: { ":target": target },
    })
  );
  const codes = result.Items as VerificationCode[];
  if (!codes || codes.length === 0) return null;
  return codes.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

export async function deleteVerificationCode(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TableName.VERIFICATION_CODES,
      Key: { id },
    })
  );
}

export async function getTransactionsByUserId(
  userId: string
): Promise<Transaction[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.TRANSACTIONS,
      IndexName: IndexName.TRANSACTIONS_USER_ID,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    })
  );
  return (result.Items as Transaction[]) ?? [];
}

export async function createTransaction(
  data: Omit<Transaction, "id" | "createdAt">
): Promise<Transaction> {
  const { randomUUID } = await import("crypto");
  const transaction: Transaction = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.TRANSACTIONS,
      Item: transaction,
    })
  );

  return transaction;
}

export async function getActiveAds(): Promise<Ad[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.ADS,
      IndexName: IndexName.ADS_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": "active" },
    })
  );
  return (result.Items as Ad[]) ?? [];
}

export async function getAdById(id: string): Promise<Ad | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.ADS,
      Key: { id },
    })
  );
  return (result.Item as Ad) ?? null;
}

export async function createAdView(data: Omit<AdView, "id">): Promise<AdView> {
  const { randomUUID } = await import("crypto");
  const view: AdView = {
    ...data,
    id: randomUUID(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.AD_VIEWS,
      Item: view,
    })
  );

  return view;
}

export async function getTodayAdViewsCount(userId: string): Promise<number> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.AD_VIEWS,
      IndexName: IndexName.AD_VIEWS_USER_ID,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    })
  );

  const views = (result.Items as AdView[]) ?? [];
  const today = new Date().toISOString().split("T")[0];

  return views.filter((v) => v.watchedAt.startsWith(today)).length;
}

export async function getActiveTasks(): Promise<Task[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.TASKS,
      IndexName: IndexName.TASKS_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": "active" },
    })
  );
  return (result.Items as Task[]) ?? [];
}

export async function getActiveTasksByType(taskType: string): Promise<Task[]> {
  const all = await getActiveTasks();
  return all.filter((t) => t.taskType === taskType);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.TASKS,
      Key: { id },
    })
  );
  return (result.Item as Task) ?? null;
}

export async function createTask(
  data: Omit<Task, "id" | "createdAt" | "updatedAt">
): Promise<Task> {
  const { randomUUID } = await import("crypto");
  const now = new Date().toISOString();
  const task: Task = {
    ...data,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.TASKS,
      Item: task,
    })
  );

  return task;
}

export async function createTaskCompletion(
  data: Omit<TaskCompletion, "id">
): Promise<TaskCompletion> {
  const { randomUUID } = await import("crypto");
  const completion: TaskCompletion = {
    ...data,
    id: randomUUID(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.TASK_COMPLETIONS,
      Item: completion,
    })
  );

  return completion;
}

export async function getUserTaskCompletions(
  userId: string
): Promise<TaskCompletion[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.TASK_COMPLETIONS,
      IndexName: IndexName.TASK_COMPLETIONS_USER_ID,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    })
  );
  return (result.Items as TaskCompletion[]) ?? [];
}

export async function createTaskReview(
  data: Omit<TaskReview, "id" | "createdAt" | "expiresAt">
): Promise<TaskReview> {
  const { randomUUID } = await import("crypto");
  const now = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + 3 * 24 * 60 * 60 * 1000
  ).toISOString();
  const review: TaskReview = {
    ...data,
    id: randomUUID(),
    createdAt: now,
    expiresAt,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.TASK_REVIEWS,
      Item: review,
    })
  );

  return review;
}

export async function getPendingTaskReviewsByAdvertiser(
  advertiserId: string
): Promise<TaskReview[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.TASK_REVIEWS,
      IndexName: IndexName.TASK_REVIEWS_ADVERTISER_ID,
      KeyConditionExpression: "#advertiserId = :advertiserId",
      ExpressionAttributeNames: { "#advertiserId": "advertiserId" },
      ExpressionAttributeValues: { ":advertiserId": advertiserId },
    })
  );
  return (result.Items as TaskReview[]) ?? [];
}

export async function getTaskReviewsByUserId(
  userId: string
): Promise<TaskReview[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.TASK_REVIEWS,
      IndexName: IndexName.TASK_REVIEWS_USER_ID,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    })
  );
  return (result.Items as TaskReview[]) ?? [];
}

export async function updateTaskReviewStatus(
  id: string,
  status: TaskReviewStatus
): Promise<TaskReview | null> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.TASK_REVIEWS,
      Key: { id },
      UpdateExpression: "set #status = :status, reviewedAt = :reviewedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ":reviewedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as TaskReview) ?? null;
}

export async function getReviewById(id: string): Promise<TaskReview | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.TASK_REVIEWS,
      Key: { id },
    })
  );
  return (result.Item as TaskReview) ?? null;
}

export async function getExpiredPendingReviews(): Promise<TaskReview[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.TASK_REVIEWS,
      IndexName: IndexName.TASK_REVIEWS_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": "pending" },
    })
  );
  const reviews = (result.Items as TaskReview[]) ?? [];
  const now = new Date().toISOString();
  return reviews.filter((r) => r.expiresAt < now);
}

export async function getAdvertiserById(
  id: string
): Promise<Advertiser | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.ADVERTISERS,
      Key: { id },
    })
  );
  return (result.Item as Advertiser) ?? null;
}

export async function getAdvertiserByEmail(
  email: string
): Promise<Advertiser | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.ADVERTISERS,
      IndexName: IndexName.ADVERTISERS_EMAIL,
      KeyConditionExpression: "#email = :email",
      ExpressionAttributeNames: { "#email": "email" },
      ExpressionAttributeValues: { ":email": email },
    })
  );
  return (result.Items?.[0] as Advertiser) ?? null;
}

export async function createAdvertiser(
  data: Omit<Advertiser, "createdAt" | "updatedAt">
): Promise<Advertiser> {
  const now = new Date().toISOString();
  const advertiser: Advertiser = { ...data, createdAt: now, updatedAt: now };

  await docClient.send(
    new PutCommand({
      TableName: TableName.ADVERTISERS,
      Item: advertiser,
    })
  );

  return advertiser;
}

export async function updateAdvertiserBalance(
  id: string,
  newBalance: number
): Promise<Advertiser | null> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.ADVERTISERS,
      Key: { id },
      UpdateExpression: "set #balance = :balance, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#balance": "balance" },
      ExpressionAttributeValues: {
        ":balance": newBalance,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as Advertiser) ?? null;
}

export async function getAdvertisersByReferrer(
  referrerId: string
): Promise<Advertiser[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.ADVERTISERS,
      IndexName: IndexName.ADVERTISERS_REFERRED_BY,
      KeyConditionExpression: "referredBy = :referredBy",
      ExpressionAttributeValues: { ":referredBy": referrerId },
    })
  );
  return (result.Items as Advertiser[]) ?? [];
}

export async function getReferralEarnings(userId: string): Promise<number> {
  const transactions = await getTransactionsByUserId(userId);
  return transactions
    .filter((t) => t.type === "referral" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
}

export async function createReferralClick(
  referrerId: string
): Promise<ReferralClick> {
  const click: ReferralClick = {
    id: crypto.randomUUID(),
    referrerId,
    createdAt: new Date().toISOString(),
  };
  await docClient.send(
    new PutCommand({ TableName: TableName.REFERRAL_CLICKS, Item: click })
  );
  return click;
}

export async function getReferralClicksByReferrer(
  referrerId: string
): Promise<ReferralClick[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.REFERRAL_CLICKS,
      IndexName: IndexName.REFERRAL_CLICKS_REFERRER_ID,
      KeyConditionExpression: "#referrerId = :referrerId",
      ExpressionAttributeNames: { "#referrerId": "referrerId" },
      ExpressionAttributeValues: { ":referrerId": referrerId },
    })
  );
  return (result.Items as ReferralClick[]) ?? [];
}

export async function markReferralClickConverted(
  clickId: string,
  advertiserId: string
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TableName.REFERRAL_CLICKS,
      Key: { id: clickId },
      UpdateExpression:
        "set convertedAdvertiserId = :advertiserId, convertedAt = :convertedAt",
      ExpressionAttributeValues: {
        ":advertiserId": advertiserId,
        ":convertedAt": new Date().toISOString(),
      },
    })
  );
}

export async function creditReferralReward(
  referrerId: string,
  amount: number,
  advertiserCompanyName: string
): Promise<void> {
  const reward = Math.round(amount * 0.12 * 100) / 100;
  if (reward <= 0) return;
  await createTransaction({
    userId: referrerId,
    type: "referral",
    amount: reward,
    description: `12% от расходов рекламодателя «${advertiserCompanyName}»`,
    status: "completed",
  });
}

export async function getCampaignsByAdvertiserId(
  advertiserId: string
): Promise<Campaign[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.CAMPAIGNS,
      IndexName: IndexName.CAMPAIGNS_ADVERTISER_ID,
      KeyConditionExpression: "#advertiserId = :advertiserId",
      ExpressionAttributeNames: { "#advertiserId": "advertiserId" },
      ExpressionAttributeValues: { ":advertiserId": advertiserId },
    })
  );
  return (result.Items as Campaign[]) ?? [];
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.CAMPAIGNS,
      Key: { id },
    })
  );
  return (result.Item as Campaign) ?? null;
}

export async function incrementCampaignCompletions(
  campaignId: string
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: TableName.CAMPAIGNS,
      Key: { id: campaignId },
      UpdateExpression: "ADD completions :inc SET updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":inc": 1,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );
}

export async function createCampaign(
  data: Omit<
    Campaign,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "views"
    | "clicks"
    | "spend"
    | "completions"
  >
): Promise<Campaign> {
  const { randomUUID } = await import("crypto");
  const now = new Date().toISOString();
  const campaign: Campaign = {
    ...data,
    id: randomUUID(),
    views: 0,
    clicks: 0,
    spend: 0,
    completions: 0,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.CAMPAIGNS,
      Item: campaign,
    })
  );

  return campaign;
}

export async function getWithdrawalRequestsByUserId(
  userId: string
): Promise<WithdrawalRequest[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.WITHDRAWAL_REQUESTS,
      IndexName: IndexName.WITHDRAWAL_REQUESTS_USER_ID,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    })
  );
  return (result.Items as WithdrawalRequest[]) ?? [];
}

export async function createWithdrawalRequest(
  data: Omit<WithdrawalRequest, "id" | "createdAt" | "status">
): Promise<WithdrawalRequest> {
  const { randomUUID } = await import("crypto");
  const request: WithdrawalRequest = {
    ...data,
    id: randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.WITHDRAWAL_REQUESTS,
      Item: request,
    })
  );

  return request;
}

export async function getAllUsers(): Promise<User[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.USERS,
    })
  );
  return (result.Items as User[]) ?? [];
}

export async function updateUserBlock(
  id: string,
  blocked: boolean
): Promise<User | null> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.USERS,
      Key: { id },
      UpdateExpression: "set #blocked = :blocked, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#blocked": "blocked" },
      ExpressionAttributeValues: {
        ":blocked": blocked,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as User) ?? null;
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.CAMPAIGNS,
    })
  );
  return (result.Items as Campaign[]) ?? [];
}

export async function getCampaignsByStatus(
  status: string
): Promise<Campaign[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.CAMPAIGNS,
      IndexName: IndexName.CAMPAIGNS_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
    })
  );
  return (result.Items as Campaign[]) ?? [];
}

export async function updateCampaignStatus(
  id: string,
  status: CampaignStatus
): Promise<Campaign | null> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.CAMPAIGNS,
      Key: { id },
      UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as Campaign) ?? null;
}

export async function getAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.WITHDRAWAL_REQUESTS,
    })
  );
  return (result.Items as WithdrawalRequest[]) ?? [];
}

export async function updateWithdrawalRequestStatus(
  id: string,
  status: WithdrawalRequestStatus
): Promise<WithdrawalRequest | null> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.WITHDRAWAL_REQUESTS,
      Key: { id },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as WithdrawalRequest) ?? null;
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.TRANSACTIONS,
    })
  );
  return (result.Items as Transaction[]) ?? [];
}

export async function getAllAdvertisers(): Promise<Advertiser[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.ADVERTISERS,
    })
  );
  return (result.Items as Advertiser[]) ?? [];
}

export async function getUserBalance(userId: string): Promise<number> {
  const transactions = await getTransactionsByUserId(userId);
  return transactions.reduce(
    (sum, t) => (t.status === "completed" ? sum + t.amount : sum),
    0
  );
}

export async function deleteUserTransactions(userId: string): Promise<void> {
  const transactions = await getTransactionsByUserId(userId);
  for (const transaction of transactions) {
    await docClient.send(
      new DeleteCommand({
        TableName: TableName.TRANSACTIONS,
        Key: { id: transaction.id },
      })
    );
  }
}

export async function resetTestBalances(): Promise<{
  usersReset: number;
  advertisersReset: number;
}> {
  const users = await getAllUsers();
  const advertisers = await getAllAdvertisers();

  let usersReset = 0;
  for (const user of users) {
    const balance = await getUserBalance(user.id);
    if (balance !== 0) {
      await deleteUserTransactions(user.id);
      usersReset += 1;
    }
  }

  let advertisersReset = 0;
  for (const advertiser of advertisers) {
    if (advertiser.balance > 0) {
      await updateAdvertiserBalance(advertiser.id, 0);
      advertisersReset += 1;
    }
  }

  return { usersReset, advertisersReset };
}

export async function getPlatformStats() {
  const users = await getAllUsers();
  const transactions = await getAllTransactions();
  const advertisers = await getAllAdvertisers();
  const campaigns = await getAllCampaigns();

  const turnover = transactions
    .filter((t) => t.status === "completed" && t.type !== "withdrawal")
    .reduce((sum, t) => sum + Math.max(0, t.amount), 0);

  const withdrawn = transactions
    .filter((t) => t.status === "completed" && t.type === "withdrawal")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    totalUsers: users.length,
    totalAdvertisers: advertisers.length,
    totalCampaigns: campaigns.length,
    turnover,
    withdrawn,
    commission: 0,
  };
}

export async function createTicket(
  data: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "status">
): Promise<Ticket> {
  const { randomUUID } = await import("crypto");
  const now = new Date().toISOString();
  const ticket: Ticket = {
    ...data,
    id: randomUUID(),
    status: "open",
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.TICKETS,
      Item: ticket,
    })
  );

  return ticket;
}

export async function getAllTickets(): Promise<Ticket[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.TICKETS,
    })
  );
  return (result.Items as Ticket[]) ?? [];
}

export async function getTicketsByUserId(userId: string): Promise<Ticket[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.TICKETS,
      IndexName: IndexName.TICKETS_USER_ID,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    })
  );
  return (result.Items as Ticket[]) ?? [];
}

export type DashboardBannerStatus = "pending" | "active" | "rejected";

export interface DashboardBanner {
  id: string;
  userId: string;
  imageUrl: string;
  targetUrl: string;
  status: DashboardBannerStatus;
  createdAt: string;
  expiresAt: string;
}

export async function getActiveDashboardBanner(): Promise<DashboardBanner | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.DASHBOARD_BANNERS,
      IndexName: IndexName.DASHBOARD_BANNERS_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": "active" },
    })
  );
  const banners = (result.Items as DashboardBanner[]) ?? [];
  const now = new Date().toISOString();
  const valid = banners
    .filter((b) => b.expiresAt > now)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  return valid[0] ?? null;
}

export async function getAllActiveDashboardBanners(): Promise<
  DashboardBanner[]
> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.DASHBOARD_BANNERS,
      IndexName: IndexName.DASHBOARD_BANNERS_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": "active" },
    })
  );
  const banners = (result.Items as DashboardBanner[]) ?? [];
  const now = new Date().toISOString();
  return banners
    .filter((b) => b.expiresAt > now)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getAllDashboardBanners(): Promise<DashboardBanner[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.DASHBOARD_BANNERS,
    })
  );
  return (result.Items as DashboardBanner[]) ?? [];
}

export async function createDashboardBanner(
  data: Omit<DashboardBanner, "id" | "createdAt">
): Promise<DashboardBanner> {
  const { randomUUID } = await import("crypto");
  const banner: DashboardBanner = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.DASHBOARD_BANNERS,
      Item: banner,
    })
  );

  return banner;
}

export async function updateDashboardBannerStatus(
  id: string,
  status: DashboardBannerStatus
): Promise<DashboardBanner | null> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.DASHBOARD_BANNERS,
      Key: { id },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as DashboardBanner) ?? null;
}

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

export async function createBroadcast(
  data: Omit<Broadcast, "id" | "createdAt">
): Promise<Broadcast> {
  const { randomUUID } = await import("crypto");
  const broadcast: Broadcast = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await docClient.send(
    new PutCommand({
      TableName: TableName.BROADCASTS,
      Item: broadcast,
    })
  );
  return broadcast;
}

export async function getLatestBroadcast(): Promise<Broadcast | null> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.BROADCASTS,
    })
  );
  const items = (result.Items as Broadcast[]) ?? [];
  if (items.length === 0) return null;
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}

export async function getAllBroadcasts(): Promise<Broadcast[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.BROADCASTS,
    })
  );
  const items = (result.Items as Broadcast[]) ?? [];
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function respondToTicket(
  id: string,
  adminResponse: string
): Promise<Ticket | null> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.TICKETS,
      Key: { id },
      UpdateExpression:
        "set adminResponse = :adminResponse, #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":adminResponse": adminResponse,
        ":status": "closed",
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as Ticket) ?? null;
}

export interface AdminSettings {
  id: string;
  minCostPerView: number;
  minViews: number;
  updatedAt: string;
}

export async function getAdminSettings(): Promise<AdminSettings | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.ADMIN_SETTINGS,
      Key: { id: "global" },
    })
  );
  return (result.Item as AdminSettings) ?? null;
}

export interface PriceListItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  updatedAt: string;
}

export async function getAllPriceListItems(): Promise<PriceListItem[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.PRICE_LIST,
    })
  );
  return (result.Items as PriceListItem[]) ?? [];
}

export async function updatePriceListItem(
  id: string,
  data: { price: number; name?: string; description?: string }
): Promise<PriceListItem | null> {
  const updateExpr = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.price !== undefined) {
    updateExpr.push("#price = :price");
    exprValues[":price"] = data.price;
    exprNames["#price"] = "price";
  }

  if (data.name !== undefined) {
    updateExpr.push("#name = :name");
    exprValues[":name"] = data.name;
    exprNames["#name"] = "name";
  }

  if (data.description !== undefined) {
    updateExpr.push("#description = :description");
    exprValues[":description"] = data.description;
    exprNames["#description"] = "description";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.PRICE_LIST,
      Key: { id },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return (result.Attributes as PriceListItem) ?? null;
}

export async function createPriceListItem(
  data: Omit<PriceListItem, "updatedAt">
): Promise<PriceListItem> {
  const item: PriceListItem = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TableName.PRICE_LIST,
      Item: item,
    })
  );

  return item;
}

export interface MaintenanceMode {
  id: string;
  enabled: boolean;
  message?: string;
  updatedAt: string;
  updatedBy?: string;
}

export async function getMaintenanceMode(): Promise<MaintenanceMode | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.MAINTENANCE_MODE,
      Key: { id: "global" },
    })
  );
  return (result.Item as MaintenanceMode) ?? null;
}

export async function setMaintenanceMode(
  enabled: boolean,
  updatedBy?: string
): Promise<MaintenanceMode> {
  const now = new Date().toISOString();
  const existing = await getMaintenanceMode();
  const mode: MaintenanceMode = {
    id: "global",
    enabled,
    message: existing?.message,
    updatedAt: now,
    updatedBy,
  };

  await docClient.send(
    new UpdateCommand({
      TableName: TableName.MAINTENANCE_MODE,
      Key: { id: "global" },
      UpdateExpression:
        "set #enabled = :enabled, updatedAt = :updatedAt, updatedBy = :updatedBy",
      ExpressionAttributeNames: { "#enabled": "enabled" },
      ExpressionAttributeValues: {
        ":enabled": enabled,
        ":updatedAt": now,
        ":updatedBy": updatedBy ?? null,
      },
      ReturnValues: "ALL_NEW",
    })
  );

  return mode;
}

export interface HomepageBanner {
  id: string;
  userId: string;
  imageUrl: string;
  targetUrl: string;
  status: "pending" | "active" | "rejected";
  createdAt: string;
  expiresAt: string;
}

export type PaymentStatus = "pending" | "success" | "fail";

export interface Payment {
  id: string;
  userId?: string;
  advertiserId?: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getActiveHomepageBanners(): Promise<HomepageBanner[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.HOMEPAGE_BANNERS,
      IndexName: IndexName.HOMEPAGE_BANNERS_STATUS,
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": "active" },
    })
  );
  const banners = (result.Items as HomepageBanner[]) ?? [];
  const now = new Date().toISOString();
  return banners
    .filter((b) => b.expiresAt > now)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function getAllHomepageBanners(): Promise<HomepageBanner[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.HOMEPAGE_BANNERS,
    })
  );
  return (result.Items as HomepageBanner[]) ?? [];
}

export async function createHomepageBanner(
  data: Omit<HomepageBanner, "id" | "createdAt">
): Promise<HomepageBanner> {
  const { randomUUID } = await import("crypto");
  const banner: HomepageBanner = {
    ...data,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await docClient.send(
    new PutCommand({
      TableName: TableName.HOMEPAGE_BANNERS,
      Item: banner,
    })
  );
  return banner;
}

export async function updateHomepageBannerStatus(
  id: string,
  status: HomepageBanner["status"]
): Promise<HomepageBanner | null> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.HOMEPAGE_BANNERS,
      Key: { id },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: { ":status": status },
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as HomepageBanner) ?? null;
}

export async function updateAdminSettings(
  data: Partial<Pick<AdminSettings, "minCostPerView" | "minViews">>
): Promise<AdminSettings> {
  const updateExpr = [];
  const exprValues: Record<string, unknown> = {};
  const exprNames: Record<string, string> = {};

  if (data.minCostPerView !== undefined) {
    updateExpr.push("#minCostPerView = :minCostPerView");
    exprValues[":minCostPerView"] = data.minCostPerView;
    exprNames["#minCostPerView"] = "minCostPerView";
  }

  if (data.minViews !== undefined) {
    updateExpr.push("#minViews = :minViews");
    exprValues[":minViews"] = data.minViews;
    exprNames["#minViews"] = "minViews";
  }

  updateExpr.push("updatedAt = :updatedAt");
  exprValues[":updatedAt"] = new Date().toISOString();

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.ADMIN_SETTINGS,
      Key: { id: "global" },
      UpdateExpression: `set ${updateExpr.join(", ")}`,
      ExpressionAttributeValues: exprValues,
      ExpressionAttributeNames:
        Object.keys(exprNames).length > 0 ? exprNames : undefined,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes as AdminSettings;
}

export async function createPayment(
  data: Omit<Payment, "createdAt" | "updatedAt">
): Promise<Payment> {
  const now = new Date().toISOString();
  const payment: Payment = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  await docClient.send(
    new PutCommand({
      TableName: TableName.PAYMENTS,
      Item: payment,
    })
  );
  return payment;
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus
): Promise<Payment | null> {
  const result = await docClient.send(
    new UpdateCommand({
      TableName: TableName.PAYMENTS,
      Key: { id },
      UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return (result.Attributes as Payment) ?? null;
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TableName.PAYMENTS,
      Key: { id },
    })
  );
  return (result.Item as Payment) ?? null;
}

export async function getPaymentsByUserId(userId: string): Promise<Payment[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.PAYMENTS,
      IndexName: IndexName.PAYMENTS_USER_ID,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: { "#userId": "userId" },
      ExpressionAttributeValues: { ":userId": userId },
    })
  );
  return (result.Items as Payment[]) ?? [];
}

export async function getPaymentsByAdvertiserId(
  advertiserId: string
): Promise<Payment[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TableName.PAYMENTS,
      IndexName: IndexName.PAYMENTS_ADVERTISER_ID,
      KeyConditionExpression: "#advertiserId = :advertiserId",
      ExpressionAttributeNames: { "#advertiserId": "advertiserId" },
      ExpressionAttributeValues: { ":advertiserId": advertiserId },
    })
  );
  return (result.Items as Payment[]) ?? [];
}

export async function getAllPayments(): Promise<Payment[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TableName.PAYMENTS,
    })
  );
  return (result.Items as Payment[]) ?? [];
}
