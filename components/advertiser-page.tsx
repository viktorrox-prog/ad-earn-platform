"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Play,
  Image as ImageIcon,
  MousePointerClick,
  ClipboardList,
  Rocket,
  Users,
  Wallet,
  TrendingUp,
  Plus,
  Upload,
  Landmark,
  CreditCard,
  CheckCheck,
  Clock,
  X,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type CampaignType =
  | "video"
  | "banner"
  | "cpc"
  | "survey"
  | "app_install"
  | "subscription";

interface Advertiser {
  id: string;
  email: string;
  balance: number;
  referredBy?: string;
}

interface Campaign {
  id: string;
  advertiserId: string;
  title: string;
  description: string;
  type: CampaignType;
  mediaUrl?: string;
  targetUrl?: string;
  taskDescription?: string;
  duration: number;
  views: number;
  costPerView: number;
  budget: number;
  spent: number;
  status: "active" | "paused" | "completed";
  completions: number;
  clicks: number;
  createdAt: string;
}

interface PriceListItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
}

const MIN_VIEWS_BY_TYPE: Record<CampaignType, number> = {
  video: 500,
  banner: 400,
  cpc: 200,
  survey: 100,
  app_install: 50,
  subscription: 100,
};

const TYPE_LABELS: Record<CampaignType, string> = {
  video: "Видео",
  banner: "Баннер",
  cpc: "Переход по ссылке",
  survey: "Опрос / анкета",
  app_install: "Установка приложения",
  subscription: "Подписка на канал",
};

const TYPE_ICONS: Record<CampaignType, typeof Play> = {
  video: Play,
  banner: ImageIcon,
  cpc: MousePointerClick,
  survey: ClipboardList,
  app_install: Rocket,
  subscription: Users,
};

const COST_PER_SECOND = 0.05;

function formatMoney(n: number): string {
  return `${n.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₽`;
}

function TopUpForm({
  balance,
  onSuccess,
}: {
  balance: number;
  onSuccess: (newBalance: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"azvox" | "freekassa">("azvox");
  const [loading, setLoading] = useState(false);

  const handleTopUp = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error("Введите сумму пополнения");
      return;
    }

    setLoading(true);
    try {
      const endpoint =
        method === "azvox"
          ? "/api/payment/azvox/init"
          : "/api/payment/freekassa/init";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertiserId: null, amount: amt }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка пополнения");
        return;
      }

      window.location.href = json.url;
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Пополнить бюджет
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Пополнение через Azvox и FreeKassa работает только через VPN.
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Метод оплаты</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={method === "azvox" ? "default" : "outline"}
              className="flex-col gap-1.5 h-auto py-3"
              onClick={() => setMethod("azvox")}
            >
              <Landmark className="h-5 w-5" />
              <span className="text-sm font-medium">Azvox</span>
            </Button>
            <Button
              variant={method === "freekassa" ? "default" : "outline"}
              className="flex-col gap-1.5 h-auto py-3"
              onClick={() => setMethod("freekassa")}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-sm font-medium">FreeKassa</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Сумма</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
            />
            <Button
              onClick={handleTopUp}
              disabled={loading || !amount || Number(amount) <= 0}
              className="gap-2 shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Пополнить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateCampaignForm({
  priceList,
  onCreated,
}: {
  priceList: PriceListItem[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CampaignType>("video");
  const [mediaUrl, setMediaUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [duration, setDuration] = useState("30");
  const [views, setViews] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const minViews = MIN_VIEWS_BY_TYPE[type];
  const costPerView = Number(duration) * COST_PER_SECOND || 0;
  const budget = Number(views) * costPerView || 0;

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Укажите название кампании");
      return;
    }
    if (Number(views) < minViews) {
      toast.error(`Минимальное количество — ${minViews}`);
      return;
    }

    setSubmitting(true);
    try {
      const advertiser = JSON.parse(localStorage.getItem("adearn_advertiser") || "null");
      const body: Record<string, unknown> = {
        title,
        description,
        type,
        duration: Number(duration),
        views: Number(views),
      };
      if (mediaUrl) body.mediaUrl = mediaUrl;
      if (targetUrl) body.targetUrl = targetUrl;
      if (taskDescription) body.taskDescription = taskDescription;

      const res = await fetch("/api/advertiser/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка создания кампании");
        return;
      }

      toast.success("Кампания создана");
      setTitle("");
      setDescription("");
      setMediaUrl("");
      setTargetUrl("");
      setTaskDescription("");
      setDuration("30");
      setViews("");
      onCreated();
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Создать кампанию
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Название кампании</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Летняя распродажа"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Описание</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Кратко опишите, что рекламируете"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Тип кампании</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TYPE_LABELS) as CampaignType[]).map((t) => {
              const Icon = TYPE_ICONS[t];
              return (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? "default" : "outline"}
                  className="justify-start gap-2 h-auto py-2.5"
                  onClick={() => setType(t)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-xs text-left leading-tight">
                    {TYPE_LABELS[t]}
                  </span>
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Минимум: {minViews}{" "}
            {minViews > 200 ? "просмотров/действий" : "действий"}
          </p>
        </div>

        {type === "video" || type === "banner" ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Ссылка на креатив ({type === "video" ? "видео" : "картинка"})
            </label>
            <Input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Целевая ссылка (внешний ресурс)
              </label>
              <Input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Описание задания</label>
              <Input
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Что нужно сделать пользователю"
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Длительность просмотра (сек)
            </label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={10}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Количество просмотров
            </label>
            <Input
              type="number"
              value={views}
              onChange={(e) => setViews(e.target.value)}
              min={minViews}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Цена за просмотр</span>
            <span className="font-medium">{formatMoney(costPerView)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Бюджет</span>
            <span className="font-semibold">{formatMoney(budget)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Прайс-лист услуг</p>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/40">
            {priceList.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">
                Прайс-лист загружается...
              </p>
            ) : (
              priceList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-muted/60 transition-colors"
                  onClick={() => {
                    setTitle(item.name);
                    setTaskDescription(item.description);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm font-semibold text-primary">
                      {item.price.toLocaleString("ru-RU")} ₽ /{" "}
                      {item.unit === "piece" ? "шт" : "1000"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <Button
          className="w-full gap-2"
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || Number(views) < minViews}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Создать кампанию
        </Button>
      </CardContent>
    </Card>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const Icon = TYPE_ICONS[campaign.type] ?? Play;
  const isVideoOrBanner =
    campaign.type === "video" || campaign.type === "banner";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{campaign.title}</p>
              <p className="text-xs text-muted-foreground">
                {TYPE_LABELS[campaign.type]}
              </p>
            </div>
          </div>
          <Badge
            variant={
              campaign.status === "active"
                ? "default"
                : campaign.status === "paused"
                ? "secondary"
                : "outline"
            }
          >
            {campaign.status === "active"
              ? "Активна"
              : campaign.status === "paused"
              ? "Пауза"
              : "Завершена"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {campaign.description && (
          <p className="text-sm text-muted-foreground">{campaign.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-muted/40 p-2.5">
            <p className="text-xs text-muted-foreground">Показы</p>
            <p className="font-semibold">
              {campaign.views.toLocaleString("ru-RU")}
            </p>
          </div>
          {isVideoOrBanner ? (
            <div className="rounded-lg bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground">Длительность</p>
              <p className="font-semibold">{campaign.duration} сек</p>
            </div>
          ) : (
            <div className="rounded-lg bg-muted/40 p-2.5">
              <p className="text-xs text-muted-foreground">Клики</p>
              <p className="font-semibold">
                {campaign.clicks.toLocaleString("ru-RU")}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <CheckCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-muted-foreground">Выполнено:</span>
          <span className="font-semibold">{campaign.completions}</span>
        </div>

        <div className="space-y-1.5 border-t border-border/40 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Бюджет</span>
            <span className="font-medium">{formatMoney(campaign.budget)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Расход</span>
            <span className="font-medium">{formatMoney(campaign.spent)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Цена за просмотр</span>
            <span className="font-medium">
              {formatMoney(campaign.costPerView)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Остаток</span>
            <span className="font-semibold">
              {formatMoney(campaign.budget - campaign.spent)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdvertiserPage() {
  const [advertiser, setAdvertiser] = useState<Advertiser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [balance, setBalance] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"campaigns" | "reviews">(
    "campaigns"
  );

  useEffect(() => {
    const stored = localStorage.getItem("adearn_advertiser");
    setAdvertiser(stored ? JSON.parse(stored) : null);
    setHydrated(true);
  }, []);

  const loadAll = useMemo(
    () => () => {
      if (!advertiser) return;
      Promise.all([
        fetch(`/api/advertiser/balance?id=${advertiser.id}`).then((r) =>
          r.json()
        ),
        fetch(`/api/advertiser/campaigns?advertiserId=${advertiser.id}`).then(
          (r) => r.json()
        ),
        fetch("/api/price-list").then((r) => r.json()),
      ])
        .then(([bal, camps, prices]) => {
          setBalance(bal.balance ?? 0);
          setCampaigns(camps.campaigns ?? []);
          setPriceList(prices.items ?? []);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Не удалось загрузить данные кабинета");
          setLoading(false);
        });
    },
    [advertiser]
  );

  useEffect(() => {
    if (hydrated && advertiser) {
      loadAll();
    }
  }, [hydrated, advertiser, loadAll]);

  if (!advertiser) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-lg">Вход для рекламодателей</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Для доступа к кабинету рекламодателя войдите через форму
              авторизации.
            </p>
            <Button
              className="w-full"
              onClick={() => (window.location.href = "/advertiser?mode=login")}
            >
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-background to-primary/5 pb-10">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Кабинет рекламодателя</h1>
            <p className="text-sm text-muted-foreground">{advertiser.email}</p>
          </div>
        </div>

        <Card className="relative overflow-hidden border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <CardContent className="relative p-6">
            <p className="text-sm text-muted-foreground mb-1">Баланс</p>
            {loading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">
                {balance.toFixed(2)}{" "}
                <span className="text-lg text-muted-foreground font-normal">
                  ₽
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        <TopUpForm
          balance={balance}
          onSuccess={(newBalance) => {
            setBalance(newBalance);
            loadAll();
          }}
        />

        <div className="flex gap-2">
          <Button
            variant={activeTab === "campaigns" ? "default" : "outline"}
            onClick={() => setActiveTab("campaigns")}
            className="gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Кампании
          </Button>
          <Button
            variant={activeTab === "reviews" ? "default" : "outline"}
            onClick={() => setActiveTab("reviews")}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Проверка заданий
          </Button>
        </div>

        {activeTab === "campaigns" ? (
          <>
            <CreateCampaignForm priceList={priceList} onCreated={loadAll} />
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : campaigns.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {campaigns.map((c) => (
                  <CampaignCard key={c.id} campaign={c} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    У вас пока нет кампаний
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <TaskReviewPanel advertiserId={advertiser.id} />
        )}
      </div>
    </div>
  );
}

function TaskReviewPanel({ advertiserId }: { advertiserId: string }) {
  const [tasks, setTasks] = useState<
    {
      id: string;
      userId: string;
      userEmail?: string;
      taskTitle?: string;
      reward: number;
      status: "pending" | "approved" | "rejected";
      createdAt: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch(
        `/api/advertiser/task-reviews?advertiserId=${advertiserId}`
      );
      const json = await res.json();
      setTasks(json.reviews ?? []);
    } catch {
      toast.error("Не удалось загрузить задания на проверку");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advertiserId]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/advertiser/task-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id, decision: status }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка");
        return;
      }
      toast.success(status === "approved" ? "Задание подтверждено" : "Задание отклонено");
      load();
    } catch {
      toast.error("Ошибка сети");
    }
  };

  const pending = tasks.filter((t) => t.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCheck className="h-4 w-4" />
          Проверка заданий
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-32" />
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CheckCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Нет заданий, ожидающих проверки
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {pending.map((task) => (
              <div key={task.id} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{task.taskTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {task.userEmail ?? `Пользователь ${task.userId}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    +{task.reward.toFixed(2)} ₽
                  </span>
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1"
                    onClick={() => decide(task.id, "approved")}
                  >
                    <Check className="h-4 w-4" />
                    Подтвердить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-red-400"
                    onClick={() => decide(task.id, "rejected")}
                  >
                    <X className="h-4 w-4" />
                    Отклонить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { AdvertiserPage, type CampaignType, type Campaign };
