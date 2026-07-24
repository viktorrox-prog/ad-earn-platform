import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import { getAllPriceListItems } from "@/lib/models";
import { mockPriceList } from "@/lib/mock-data";

export async function GET() {
  const dbAvailable = await isDatabaseAvailable();
  let items = mockPriceList;

  if (dbAvailable) {
    const dbItems = await getAllPriceListItems();
    if (dbItems.length > 0) {
      items = dbItems;
    }
  }

  return NextResponse.json({ items });
}
