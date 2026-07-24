import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllUsers,
  getAllTransactions,
  getAllAdvertisers,
  getAllCampaigns,
} from "@/lib/models";
import {
  mockUsers,
  mockTransactions,
  mockAdvertisers,
  mockCampaigns,
} from "@/lib/mock-data";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  let users = mockUsers;
  let transactions = mockTransactions;
  let advertisers = mockAdvertisers;
  let campaigns = mockCampaigns;

  if (dbAvailable) {
    const [dbUsers, dbTransactions, dbAdvertisers, dbCampaigns] =
      await Promise.all([
        getAllUsers(),
        getAllTransactions(),
        getAllAdvertisers(),
        getAllCampaigns(),
      ]);
    if (dbUsers.length > 0) users = dbUsers;
    if (dbTransactions.length > 0) transactions = dbTransactions;
    if (dbAdvertisers.length > 0) advertisers = dbAdvertisers;
    if (dbCampaigns.length > 0) campaigns = dbCampaigns;
  }

  const totalUsers = users.length;
  const totalAdvertisers = advertisers.length;
  const totalCampaigns = campaigns.length;

  const turnover = transactions
    .filter((t) => t.status === "completed" && t.type !== "withdrawal")
    .reduce((sum, t) => sum + Math.max(0, t.amount), 0);

  const withdrawn = transactions
    .filter((t) => t.status === "completed" && t.type === "withdrawal")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  return NextResponse.json({
    totalUsers,
    totalAdvertisers,
    totalCampaigns,
    activeCampaigns,
    turnover,
    withdrawn,
    commission: 0,
  });
}
