import { getAllPriceListItems } from "@/lib/models";
import { isDatabaseAvailable } from "@/lib/db";
import { mockPriceList } from "@/lib/mock-data";
import { PricesPage } from "@/components/prices-page";
import type { PriceListItem } from "@/lib/models";

export const metadata = {
  title: "Прайс-лист — AdEarn",
  description:
    "Цены на услуги продвижения в социальных сетях: YouTube, Telegram, VK, Instagram, TikTok",
};

export default async function Page() {
  let items: PriceListItem[] = mockPriceList;

  try {
    const dbAvailable = await isDatabaseAvailable();
    if (dbAvailable) {
      const dbItems = await getAllPriceListItems();
      if (dbItems.length > 0) {
        items = dbItems;
      }
    }
  } catch {}

  return <PricesPage items={items} />;
}
