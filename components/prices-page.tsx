"use client";

import {
  TrendingUp,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Music,
  Video,
  Send,
  Camera,
  MousePointerClick,
} from "lucide-react";
import type { PriceListItem } from "@/lib/models";

const categoryConfig: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  youtube: { label: "YouTube", icon: Video, color: "text-red-500" },
  telegram: { label: "Telegram", icon: Send, color: "text-sky-500" },
  vk: { label: "VK", icon: Users, color: "text-blue-500" },
  instagram: { label: "Instagram", icon: Camera, color: "text-pink-500" },
  tiktok: { label: "TikTok", icon: Music, color: "text-rose-400" },
  yandex: { label: "Яндекс Музыка", icon: Music, color: "text-yellow-500" },
  cpc: {
    label: "CPC переходы",
    icon: MousePointerClick,
    color: "text-emerald-500",
  },
};

const actionIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  просмотры: Eye,
  подписчики: Users,
  лайки: Heart,
  комментарии: MessageSquare,
  репосты: Share2,
};

function getActionIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(actionIcons)) {
    if (lower.includes(key)) return Icon;
  }
  return TrendingUp;
}

function formatPrice(price: number, unit: string) {
  if (unit === "шт") {
    return `${price} ₽ / шт`;
  }
  return `${price} ₽ / ${unit}`;
}

function PricesGrid({ items }: { items: PriceListItem[] }) {
  const grouped: Record<string, PriceListItem[]> = {};
  const order = [
    "youtube",
    "telegram",
    "vk",
    "instagram",
    "tiktok",
    "yandex",
    "cpc",
  ];

  for (const item of items) {
    const cat = item.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return (
    <div className="space-y-16">
      {order.map((cat) => {
        const catItems = grouped[cat];
        if (!catItems?.length) return null;
        const config = categoryConfig[cat];
        const Icon = config?.icon || TrendingUp;

        return (
          <section key={cat}>
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 border border-border/40 ${config?.color || "text-muted-foreground"}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {config?.label || cat}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catItems.map((item) => {
                const ActionIcon = getActionIcon(item.name);
                return (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/50 p-5 transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <ActionIcon className="h-4 w-4 text-primary" />
                          </div>
                          <h3 className="font-semibold leading-tight">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="text-2xl font-bold tracking-tight text-primary">
                        {formatPrice(item.price, item.unit)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function PricesPage({ items }: { items: PriceListItem[] }) {
  return (
    <div className="relative min-h-screen">
      <div className="pattern-grid pointer-events-none absolute inset-0 opacity-[0.03]" />
      <div className="container mx-auto px-4 py-20 max-w-6xl relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <TrendingUp className="h-4 w-4" />
            Прайс-лист
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-glow">
            Услуги продвижения
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Цены на услуги по продвижению в популярных социальных сетях.
            Актуальность цен уточняйте у менеджеров.
          </p>
        </div>

        <PricesGrid items={items} />
      </div>
    </div>
  );
}
