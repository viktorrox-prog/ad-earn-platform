import { NextRequest, NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";
import {
  getAllPriceListItems,
  updatePriceListItem,
  createPriceListItem,
} from "@/lib/models";
import { mockPriceList } from "@/lib/mock-data";
import { updatePriceListItemSchema } from "@/lib/validation/price-list";
import { z } from "zod";

const createPriceListItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  unit: z.string().min(1),
  category: z.string().min(1),
});

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

export async function POST(request: NextRequest) {
  const parsed = createPriceListItemSchema.safeParse(await request.json());
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

  const item = await createPriceListItem(parsed.data);
  return NextResponse.json(item);
}

export async function PUT(request: NextRequest) {
  const parsed = updatePriceListItemSchema.safeParse(await request.json());
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

  const item = await updatePriceListItem(parsed.data.id, {
    price: parsed.data.price,
  });

  if (!item) {
    return NextResponse.json({ error: "Услуга не найдена" }, { status: 404 });
  }

  return NextResponse.json(item);
}
