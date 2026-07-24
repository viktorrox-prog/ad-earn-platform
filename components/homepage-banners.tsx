"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Banner {
  id: string;
  imageUrl: string;
  targetUrl: string;
}

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("adearn_user");
  if (!stored) return null;
  try {
    const user = JSON.parse(stored);
    return user.id ?? null;
  } catch {
    return null;
  }
}

function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div className="relative group rounded-xl overflow-hidden">
      <a
        href={banner.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src={banner.imageUrl}
          alt="Реклама"
          className="w-full h-full object-cover"
        />
      </a>
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrent(
                (prev) => (prev - 1 + banners.length) % banners.length
              );
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrent((prev) => (prev + 1) % banners.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrent(i);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current
                    ? "bg-primary w-4"
                    : "bg-background/50 hover:bg-background/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BannerPlaceholder({
  onClickBuy,
  vertical = false,
}: {
  onClickBuy: () => void;
  vertical?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed border-muted-foreground/30 rounded-xl bg-card/20 ${
        vertical ? "w-full min-h-[400px] py-8" : "w-full h-24"
      }`}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/30">
        <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-sm font-medium text-muted-foreground/80">
          Рекламное место
        </span>
        <span className="text-xs text-muted-foreground/60">300 ₽/сутки</span>
      </div>
      <Button
        size="sm"
        className="gap-1.5 text-xs h-8"
        onClick={(e) => {
          e.preventDefault();
          onClickBuy();
        }}
      >
        <ShoppingCart className="h-3.5 w-3.5" />
        Купить
      </Button>
    </div>
  );
}

export function BuyBannerDialog({
  open,
  onClose,
  position,
}: {
  open: boolean;
  onClose: () => void;
  position: "top" | "bottom" | "left" | "right";
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [days, setDays] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const userId = getCurrentUserId();
  const isLoggedIn = !!userId;
  const totalPrice = 300 * days;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("Войдите в систему, чтобы купить размещение");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/homepage-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, imageUrl, targetUrl, days }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Ошибка покупки");
        return;
      }
      toast.success("Баннер отправлен на модерацию");
      setImageUrl("");
      setTargetUrl("");
      setDays(1);
      onClose();
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Купить размещение</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Разместите свой баннер на главной странице
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ✕
          </Button>
        </div>
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-center">
          <p className="text-sm text-muted-foreground">Стоимость размещения</p>
          <p className="text-2xl font-bold text-primary">{totalPrice} ₽</p>
          <p className="text-xs text-muted-foreground mt-1">
            300 ₽ × {days} {days === 1 ? "сутки" : "суток"}
          </p>
        </div>
        <div className="rounded-lg bg-muted/30 border border-border p-3 text-xs text-muted-foreground space-y-0.5">
          <p className="font-medium text-foreground">
            Рекомендуемые размеры изображения
          </p>
          {position === "top" || position === "bottom" ? (
            <p>728×90 или 1200×200 px — широкий баннер</p>
          ) : (
            <p>160×600 или 300×600 px — вертикальный баннер</p>
          )}
        </div>
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Количество дней</label>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ссылка на изображение
              </label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Целевая ссылка</label>
              <Input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={submitting}
            >
              <ShoppingCart className="h-4 w-4" />
              {submitting ? "Оформление..." : `Купить за ${totalPrice} ₽`}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Войдите в аккаунт, чтобы купить размещение
            </p>
            <Button
              className="w-full gap-2"
              onClick={() => {
                window.location.href = "/auth";
              }}
            >
              Войти и оплатить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface HomepageBannersProps {
  position: "top" | "left" | "right" | "bottom";
  className?: string;
}

export function HomepageBanners({
  position,
  className = "",
}: HomepageBannersProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/homepage-banners", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setBanners(data.banners ?? []))
      .catch(() => setBanners([]));

    return () => controller.abort();
  }, [position]);

  const openBuyDialog = useCallback(() => {
    setShowDialog(true);
  }, []);

  return (
    <>
      {position === "top" && (
        <div
          className={`relative w-full ${banners.length > 0 ? "mb-4" : ""} ${className}`}
        >
          {banners.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-border/30 shadow-lg">
              <BannerCarousel banners={banners} />
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 bg-background/80 backdrop-blur-sm hover:bg-background/90 text-xs h-8"
                  onClick={openBuyDialog}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Купить
                </Button>
              </div>
            </div>
          )}
          {banners.length === 0 && (
            <BannerPlaceholder onClickBuy={openBuyDialog} />
          )}
        </div>
      )}

      {(position === "left" || position === "right") && (
        <div className={`relative ${className}`}>
          {banners.length > 0 ? (
            <div className="rounded-xl overflow-hidden border border-border/30 shadow-lg">
              <BannerCarousel banners={banners} />
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 bg-background/80 backdrop-blur-sm hover:bg-background/90 text-xs h-7"
                  onClick={openBuyDialog}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Купить
                </Button>
              </div>
            </div>
          ) : (
            <BannerPlaceholder onClickBuy={openBuyDialog} vertical />
          )}
        </div>
      )}

      {position === "bottom" && (
        <div
          className={`relative w-full ${banners.length > 0 ? "mt-6" : ""} ${className}`}
        >
          {banners.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-border/30 shadow-lg">
              <BannerCarousel banners={banners} />
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 bg-background/80 backdrop-blur-sm hover:bg-background/90 text-xs h-8"
                  onClick={openBuyDialog}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Купить
                </Button>
              </div>
            </div>
          )}
          {banners.length === 0 && (
            <BannerPlaceholder onClickBuy={openBuyDialog} />
          )}
        </div>
      )}

      <BuyBannerDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        position={position}
      />
    </>
  );
}
