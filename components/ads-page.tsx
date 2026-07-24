"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Play,
  ImageIcon,
  ArrowLeft,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Ad } from "@/lib/models";

interface AdsResponse {
  ads: Ad[];
  todayViews: number;
  viewsRemaining: number;
  dailyLimit: number;
}

function AdCard({
  ad,
  onWatch,
  disabled,
}: {
  ad: Ad;
  onWatch: () => void;
  disabled: boolean;
}) {
  return (
    <Card className="card-hover border-border/50 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
        {ad.type === "video" ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <Play className="h-6 w-6 text-primary ml-0.5" />
            </div>
            <span className="text-xs">Видеоролик</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs">Баннер</span>
          </div>
        )}
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 gap-1 text-xs"
        >
          {ad.type === "video" ? "Видео" : "Баннер"}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-sm mb-1">{ad.title}</h3>
        {ad.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {ad.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-green-400">
            +{ad.reward.toFixed(2)} ₽
          </span>
          <Button size="sm" onClick={onWatch} disabled={disabled}>
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Смотреть
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WatchModal({
  ad,
  onComplete,
  onClose,
}: {
  ad: Ad;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [countdown, setCountdown] = useState(ad.duration);
  const [paused, setPaused] = useState(false);
  const completed = countdown <= 0;
  const rewardCalledRef = useRef(false);

  useEffect(() => {
    const handleVisibility = () => {
      setPaused(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (completed || paused) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, completed, paused]);

  useEffect(() => {
    if (completed && !rewardCalledRef.current) {
      rewardCalledRef.current = true;
      onComplete();
    }
  }, [completed, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            {ad.type === "video" ? (
              <Play className="h-4 w-4 text-primary" />
            ) : (
              <ImageIcon className="h-4 w-4 text-primary" />
            )}
            {ad.title}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          {completed ? (
            <div className="flex flex-col items-center gap-2 text-green-400">
              <CheckCircle2 className="h-12 w-12" />
              <span className="text-sm font-medium">Просмотр завершён</span>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Начисляем вознаграждение...</span>
              </div>
            </div>
          ) : paused ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
                <span className="text-3xl font-bold text-amber-400">
                  {countdown}
                </span>
              </div>
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Таймер на паузе — вернитесь на вкладку
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                <span className="text-3xl font-bold text-primary">
                  {countdown}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {ad.type === "video"
                  ? "Досмотрите ролик до конца"
                  : "Ознакомьтесь с баннером"}
              </span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/50">
          {completed ? (
            <div className="flex items-center justify-center gap-2 text-sm text-green-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Начисление...
            </div>
          ) : paused ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Пауза
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Подождите {countdown} секунд
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("adearn_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [hydrated] = useState(() => typeof window !== "undefined");
  const [data, setData] = useState<AdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchingAd, setWatchingAd] = useState<Ad | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    fetch(`/api/ads?userId=${user.id}`)
      .then((res) => res.json())
      .then((json: AdsResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить объявления");
        setLoading(false);
      });
  }, [user, hydrated, router]);

  const handleWatchComplete = useCallback(() => {
    if (!user || !watchingAd) return;

    const ad = watchingAd;

    fetch("/api/ads/watch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, adId: ad.id }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error ?? "Ошибка начисления");
          return;
        }
        toast.success(json.message);
        setWatchedIds((prev) => new Set(prev).add(ad.id));
        setWatchingAd(null);
      })
      .catch(() => {
        toast.error("Ошибка сети");
      });
  }, [user, watchingAd]);

  if (!user) return null;

  const limitReached = data && data.viewsRemaining <= 0;
  const progressPercent = data
    ? Math.round((data.todayViews / data.dailyLimit) * 100)
    : 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Просмотр рекламы</h1>
            <p className="text-sm text-muted-foreground">
              Смотри ролики и баннеры, зарабатывай деньги
            </p>
          </div>
        </div>

        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Дневной лимит
              </span>
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span className="text-sm font-medium">
                  {data?.todayViews ?? 0} / {data?.dailyLimit ?? 20}
                </span>
              )}
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
            {limitReached && (
              <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Дневной лимит исчерпан. Возвращайтесь завтра!
              </p>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video rounded-t-xl" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </Button>
          </div>
        ) : data && data.ads.length > 0 && !limitReached ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {data.ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                disabled={watchedIds.has(ad.id)}
                onWatch={() => setWatchingAd(ad)}
              />
            ))}
          </div>
        ) : data && data.ads.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Eye className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Нет доступных объявлений
            </p>
            <Link
              href="/dashboard"
              className={
                buttonVariants({ variant: "outline", size: "sm" }) + " gap-2"
              }
            >
              <ArrowLeft className="h-4 w-4" />
              Вернуться в кабинет
            </Link>
          </div>
        ) : limitReached ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Вы исчерпали дневной лимит просмотров
            </p>
            <p className="text-xs text-muted-foreground">
              Лимит обновится в 00:00
            </p>
            <Link
              href="/dashboard"
              className={
                buttonVariants({ variant: "outline", size: "sm" }) + " gap-2"
              }
            >
              <ArrowLeft className="h-4 w-4" />
              Вернуться в кабинет
            </Link>
          </div>
        ) : null}
      </div>

      {watchingAd && (
        <WatchModal
          ad={watchingAd}
          onComplete={handleWatchComplete}
          onClose={() => setWatchingAd(null)}
        />
      )}
    </div>
  );
}
