"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  ListChecks,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Clock,
  RefreshCw,
  Users,
  Copy,
  Link2,
  Image,
  ExternalLink,
  ShoppingCart,
  X,
  Megaphone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction, DashboardBanner, Broadcast } from "@/lib/models";
import { toast } from "sonner";

interface UserData {
  id: string;
  email: string;
  phone: string;
}

interface BalanceData {
  balance: number;
  transactions: Transaction[];
}

interface ReferralData {
  referralLink: string;
  referredAdvertisersCount: number;
  earned: number;
  clicksCount: number;
  convertedClicksCount: number;
}

const navCards = [
  {
    icon: Eye,
    title: "Просмотр рекламы",
    description: "Смотри ролики и зарабатывай",
    href: "/ads",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
  },
  {
    icon: ListChecks,
    title: "Задания",
    description: "Выполняй задания в соцсетях",
    href: "/tasks",
    color: "from-green-500/20 to-green-600/10",
    iconColor: "text-green-400",
  },
  {
    icon: Wallet,
    title: "Вывод средств",
    description: "Забери заработанное",
    href: "/finance",
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
  },
];

const typeLabels: Record<string, string> = {
  earnings: "Начисление",
  withdrawal: "Списание",
  referral: "Реферал",
  deposit: "Пополнение",
};

const typeIcons: Record<string, typeof ArrowUpRight> = {
  earnings: ArrowUpRight,
  withdrawal: ArrowDownLeft,
  referral: ArrowUpRight,
  deposit: ArrowUpRight,
};

const typeColors: Record<string, string> = {
  earnings: "text-green-400",
  withdrawal: "text-red-400",
  referral: "text-blue-400",
  deposit: "text-emerald-400",
};

const typeBgColors: Record<string, string> = {
  earnings: "bg-green-500/10",
  withdrawal: "bg-red-500/10",
  referral: "bg-blue-500/10",
  deposit: "bg-emerald-500/10",
};

function TransactionItem({ tx }: { tx: Transaction }) {
  const Icon = typeIcons[tx.type] ?? ArrowUpRight;
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeBgColors[tx.type] ?? "bg-muted"}`}
      >
        <Icon
          className={`h-4 w-4 ${typeColors[tx.type] ?? "text-muted-foreground"}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.description}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Clock className="h-3 w-3" />
          {new Date(tx.createdAt).toLocaleDateString("ru", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span
          className={`text-sm font-semibold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}
        >
          {tx.amount > 0 ? "+" : ""}
          {tx.amount.toFixed(2)} ₽
        </span>
        <p className="text-xs text-muted-foreground">
          {typeLabels[tx.type] ?? tx.type}
        </p>
      </div>
    </div>
  );
}

function BannerCarousel({
  banners,
  user,
  onRefresh,
}: {
  banners: DashboardBanner[];
  user: UserData;
  onRefresh: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPurchase, setShowPurchase] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [days, setDays] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const totalPrice = 300 * days;

  useEffect(() => {
    if (banners.length <= 1) return;
    const ms = 5000 + Math.random() * 2000;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, ms);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchasing(true);
    try {
      const res = await fetch("/api/dashboard-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          imageUrl,
          targetUrl,
          days,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Ошибка при покупке");
        return;
      }
      toast.success("Баннер отправлен на модерацию");
      setShowPurchase(false);
      setImageUrl("");
      setTargetUrl("");
      setDays(1);
      onRefresh();
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setPurchasing(false);
    }
  };

  if (banners.length === 0) {
    return (
      <div className="space-y-3">
        <Card className="border-dashed border-border/50">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Image className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Рекламное место</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Разместите свой баннер за 300 ₽/сутки
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPurchase(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Купить размещение
              </Button>
            </div>
          </CardContent>
        </Card>

        {showPurchase && (
          <Card className="border-primary/30">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Купить размещение баннера
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPurchase(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePurchase} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Количество дней
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-sm font-semibold tabular-nums w-8 text-right">
                      {days}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>30</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Ссылка на изображение
                  </label>
                  <Input
                    placeholder="https://example.com/banner.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Целевая ссылка
                  </label>
                  <Input
                    placeholder="https://example.com"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground space-y-1">
                  <p>
                    Стоимость:{" "}
                    <span className="font-semibold text-primary">
                      {totalPrice} ₽
                    </span>{" "}
                    за {days} {days === 1 ? "сутки" : "суток"}
                  </p>
                  <p>После оплаты баннер проходит модерацию администратором</p>
                </div>
                <div className="rounded-lg bg-muted/30 border border-border p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">
                    Рекомендуемые размеры изображения
                  </p>
                  <p>800×200 или 1200×200 px — широкий баннер</p>
                </div>
                <Button type="submit" className="w-full" disabled={purchasing}>
                  {purchasing ? "Оплата..." : `Оплатить ${totalPrice} ₽`}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const currentBanner = banners[currentIndex];
  // ... продолжение: карусель, BroadcastModal, DashboardPage с партнёрским блоком
