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

  return (
    <div className="space-y-3">
      <div className="relative group rounded-xl overflow-hidden border border-border/50">
        <a
          href={currentBanner.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={currentBanner.imageUrl}
            alt="Рекламный баннер"
            className="w-full h-32 sm:h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3" />
            Реклама
          </div>
        </a>

        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? "w-5 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BroadcastModal({ broadcast }: { broadcast: Broadcast | null }) {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined" || !broadcast) return false;
    const dismissed = localStorage.getItem(
      `broadcast_dismissed_${broadcast.id}`
    );
    return !dismissed;
  });

  const handleDismiss = () => {
    if (broadcast) {
      localStorage.setItem(`broadcast_dismissed_${broadcast.id}`, "1");
    }
    setOpen(false);
  };

  if (!open || !broadcast) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />
      <div className="relative w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
        <Card className="border-primary/30">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{broadcast.title}</CardTitle>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {broadcast.message}
            </p>
            <Button
              variant="default"
              className="w-full"
              onClick={handleDismiss}
            >
              Понятно
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("adearn_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [hydrated] = useState(() => typeof window !== "undefined");
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [referralLoading, setReferralLoading] = useState(true);
  const [banners, setBanners] = useState<DashboardBanner[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);

  const fetchBanner = () => {
    fetch("/api/dashboard-banners")
      .then((res) => res.json())
      .then((json) => {
        setBanners(json.banners ?? []);
        setBannerLoading(false);
      })
      .catch(() => {
        setBannerLoading(false);
      });
  };

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    fetch(`/api/balance?userId=${user.id}`)
      .then((res) => res.json())
      .then((json: BalanceData) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить данные");
        setLoading(false);
      });

    fetch(`/api/referral?userId=${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((json: ReferralData) => {
        setReferral(json);
        setReferralLoading(false);
      })
      .catch(() => {
        setReferralLoading(false);
      });

    fetchBanner();

    fetch("/api/broadcasts")
      .then((res) => res.json())
      .then((json) => setBroadcast(json.broadcast))
      .catch(() => {});
  }, [user, hydrated, router]);

  const copyReferralLink = () => {
    if (referral?.referralLink) {
      navigator.clipboard.writeText(referral.referralLink);
      toast.success("Реферальная ссылка скопирована");
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      <BroadcastModal key={broadcast?.id ?? "none"} broadcast={broadcast} />
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Личный кабинет</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {bannerLoading ? (
          <Skeleton className="h-32 rounded-xl" />
        ) : (
          <BannerCarousel
            banners={banners}
            user={user}
            onRefresh={fetchBanner}
          />
        )}

        <Card className="relative overflow-hidden border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <CardContent className="relative p-8">
            <p className="text-sm text-muted-foreground mb-2">Текущий баланс</p>
            {loading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <p className="text-4xl font-bold tracking-tight">
                {data?.balance.toFixed(2) ?? "0.00"}{" "}
                <span className="text-xl text-muted-foreground font-normal">
                  ₽
                </span>
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Доступно для вывода
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {navCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card
                className={`card-hover bg-gradient-to-br ${card.color} border-border/50`}
              >
                <CardContent className="flex flex-col items-center text-center gap-3 py-6">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-background/50`}
                  >
                    <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{card.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              Партнёрская программа
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {referralLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : referral ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-blue-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {referral.clicksCount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Переходов по ссылке
                    </p>
                  </div>
                  <div className="rounded-xl bg-purple-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-purple-400">
                      {referral.convertedClicksCount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Регистраций из переходов
                    </p>
                  </div>
                  <div className="rounded-xl bg-green-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {referral.referredAdvertisersCount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Приведено рекламодателей
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                      {referral.earned.toFixed(2)} ₽
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Заработано
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3">
                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="flex-1 truncate text-xs text-muted-foreground">
                    {referral.referralLink}
                  </p>
                  <button
                    onClick={copyReferralLink}
                    className="shrink-0 rounded-lg p-1.5 hover:bg-primary/10 transition-colors"
                  >
                    <Copy className="h-4 w-4 text-primary" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Вы получаете 12% от расходов рекламодателей, которые
                  зарегистрируются по вашей ссылке
                </p>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              История транзакций
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {error}
              </p>
            ) : data && data.transactions.length > 0 ? (
              <div className="divide-y divide-border/50">
                {data.transactions.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  История транзакций пуста
                </p>
                <Link
                  href="/ads"
                  className={
                    buttonVariants({ variant: "outline", size: "sm" }) +
                    " gap-2"
                  }
                >
                  Начать зарабатывать
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
