import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getAllPayments } from "@/lib/models";
import { mockPayments } from "@/lib/mock-data";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();

  let payments = mockPayments;

  if (dbAvailable) {
    try {
      const dbPayments = await getAllPayments();
      if (dbPayments.length > 0) {
        payments = dbPayments;
      }
    } catch (err) {
      console.warn("Failed to load payments from DB", err);
    }
  }

  const normalized = payments.map((p) => ({
    ...p,
    id: p.id ?? "",
    amount: Number(p.amount) || 0,
    method: p.method ?? "azvox",
    status: p.status ?? "pending",
    createdAt: p.createdAt ?? new Date().toISOString(),
  }));

  normalized.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ payments: normalized });
}
