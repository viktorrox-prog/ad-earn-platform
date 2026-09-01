"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Wallet,
  Plus,
  Play,
  Image,
  BarChart3,
  Eye,
  DollarSign,
  Target,
  LogOut,
  RefreshCw,
  Upload,
  MousePointerClick,
  ClipboardList,
  Smartphone,
  Users,
  ExternalLink,
  FileText,
  Landmark,
  CreditCard,
  Tag,
  CheckCheck,
  Timer,
  Hourglass,
  CopyCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Campaign,
  PriceListItem,
  MIN_VIEWS_BY_CAMPAIGN_TYPE,
} from "@/lib/models";

interface AdvertiserData {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  balance: number;
}

type PageMode =
  | "register"
  | "login"
  | "dashboard"
  | "topup"
  | "create_campaign"
  | "task_reviews";

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completed: "bg-muted text-muted-foreground border-border/50",
};

function AdvertiserRegisterForm({
  onSuccess,
  onSwitchToLogin,
  refCode,
  clickId,
}: {
  onSuccess: (data: AdvertiserData) => void;
  onSwitchToLogin: () => void;
  refCode?: string;
  clickId?: string;
}) {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/advertiser/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          email,
          phone,
          password,
          ...(refCode ? { refCode } : {}),
          ...(clickId ? { clickId } : {}),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Ошибка регистрации");
        return;
      }

      localStorage.setItem("adearn_advertiser", JSON.stringify(json));
      onSuccess(json);
      toast.success("Регистрация рекламодателя успешна");
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Название компании</label>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="ООО Реклама Про"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="company@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Номер телефона</label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+71234567891"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Пароль</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Минимум 6 символов"
          minLength={6}
          required
        />
      </div>
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? "Регистрация..." : "Зарегистрироваться"}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Уже есть аккаунт?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:underline"
        >
          Войти
        </button>
      </p>
    </form>
  );
}

function AdvertiserLoginForm({
  onSuccess,
  onSwitchToRegister,
}: {
  onSuccess: (data: AdvertiserData) => void;
  onSwitchToRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/advertiser/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Ошибка входа");
        return;
      }

      localStorage.setItem("adearn_advertiser", JSON.stringify(json));
      onSuccess(json);
      toast.success("Вход выполнен");
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="company@example.com"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Пароль</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите пароль"
          required
        />
      </div>
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading ? "Вход..." : "Войти"}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Нет аккаунта?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary hover:underline"
        >
          Зарегистрироваться
        </button>
      </p>
    </form>
  );
}

const campaignTypeConfig: Record<
  string,
  { icon: React.ReactNode; label: string }
> = {
  video: { icon: <Play className="h-5 w-5 text-primary" />, label: "Видео" },
  banner: { icon: <Image className="h-5 w-5 text-primary" />, label: "Баннер" },
  cpc: {
    icon: <MousePointerClick className="h-5 w-5 text-primary" />,
    label: "CPC",
  },
  survey: {
    icon: <ClipboardList className="h-5 w-5 text-primary" />,
    label: "Опрос",
  },
  app_install: {
    icon: <Smartphone className="h-5 w-5 text-primary" />,
    label: "Установка",
  },
  subscription: {
    icon: <Users className="h-5 w-5 text-primary" />,
    label: "Подписка",
  },
};

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const budgetUsedPercent =
    campaign.budget > 0
      ? Math.min(100, Math.round((campaign.spend / campaign.budget) * 100))
      : 0;

  const typeConfig =
    campaignTypeConfig[campaign.type] ?? campaignTypeConfig.video;
  const isActionType = [
    "cpc",
    "survey",
    "app_install",
    "subscription",
  ].includes(campaign.type);
  const metricLabel = isActionType ? "Клики" : "Показы";
  const metricValue = isActionType ? campaign.clicks : campaign.views;

  return (
    <Card className="border-border/50 card-hover">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              {typeConfig.icon}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{campaign.title}</h3>
              <p className="text-xs text-muted-foreground">
                {typeConfig.label}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={statusColors[campaign.status] ?? ""}
          >
            {campaign.status === "active"
              ? "Активна"
              : campaign.status === "paused"
                ? "Пауза"
                : "Завершена"}
          </Badge>
        </div>

        {(campaign.targetUrl || campaign.taskDescription) && (
          <div className="text-xs text-muted-foreground space-y-1">
            {campaign.targetUrl && (
              <p className="flex items-center gap-1 truncate">
                <ExternalLink className="h-3 w-3 shrink-0" />
                {campaign.targetUrl}
              </p>
            )}
            {campaign.taskDescription && (
              <p className="flex items-center gap-1">
                <FileText className="h-3 w-3 shrink-0" />
                {campaign.taskDescription}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {isActionType ? (
                <MousePointerClick className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
              {metricLabel}
            </p>
            <p className="text-sm font-semibold">
              {metricValue.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCheck className="h-3 w-3" />
              Выполнено
            </p>
            <p className="text-sm font-semibold">
              {campaign.completions.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Расход
            </p>
            <p className="text-sm font-semibold">
              {campaign.spend.toFixed(2)} ₽
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Timer className="h-3 w-3" />
              Длительность
            </p>
            <p className="text-sm font-semibold">{campaign.duration} сек</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Бюджет</span>
            <span className="font-medium">
              {campaign.spend.toFixed(0)} / {campaign.budget.toFixed(0)} ₽
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${budgetUsedPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            Остаток: {(campaign.budget - campaign.spend).toFixed(2)} ₽
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TopUpForm({
  advertiserId,
  onBack,
}: {
  advertiserId: string;
  onBack: () => void;
}) {
  const [amount, setAmount] = useState("1000");
  const [method, setMethod] = useState<"azvox" | "freekassa">("azvox");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      toast.error("Введите сумму пополнения");
      return;
    }

    const endpoint =
      method === "azvox"
        ? "/api/payment/azvox/init"
        : "/api/payment/freekassa/init";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserId,
          amount: numericAmount,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка пополнения");
        return;
      }
      window.location.href = json.url;
    } catch {
      toast.error("Ошибка сети");
    }
  };

  const presetAmounts = [500, 1000, 3000, 5000, 10000];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Сумма пополнения</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={1}
          placeholder="1000"
          required
        />
        <div className="flex gap-2 flex-wrap">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                Number(amount) === preset
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/50"
              }`}
            >
              {preset.toLocaleString()} ₽
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Метод оплаты</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod("azvox")}
            className={`flex w-full flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
              method === "azvox"
                ? "border-primary bg-primary/10"
                : "border-border/50 hover:border-primary/50"
            }`}
          >
            <Landmark className="h-6 w-6" />
            <span className="text-sm font-medium">Azvox</span>
            <span className="text-xs text-muted-foreground">
              Платёжный сервис
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMethod("freekassa")}
            className={`flex w-full flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
              method === "freekassa"
                ? "border-primary bg-primary/10"
                : "border-border/50 hover:border-primary/50"
            }`}
          >
            <CreditCard className="h-6 w-6" />
            <span className="text-sm font-medium">FreeKassa</span>
            <span className="text-xs text-muted-foreground">
              Платёжный сервис
            </span>
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Назад
        </Button>
        <Button type="submit" className="flex-1 gap-2">
          Пополнить {Number(amount).toLocaleString()} ₽
        </Button>
      </div>
    </form>
  );
}

function CreateCampaignForm({
  advertiserId,
  onSuccess,
  onBack,
}: {
  advertiserId: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Campaign["type"]>("video");
  const [mediaUrl, setMediaUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [views, setViews] = useState("");
  const [loading, setLoading] = useState(false);
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);

  const minViewsForType = MIN_VIEWS_BY_CAMPAIGN_TYPE[type];

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(() => {
        setDuration("10");
        setViews(String(MIN_VIEWS_BY_CAMPAIGN_TYPE.video));
      })
      .catch(() => {
        setDuration("10");
        setViews(String(MIN_VIEWS_BY_CAMPAIGN_TYPE.video));
      });
    fetch("/api/price-list")
      .then((r) => r.json())
      .then((data) => setPriceList(data.items ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setViews((prev) => {
      const num = Number(prev);
      if (!prev || num < minViewsForType) {
        return String(minViewsForType);
      }
      return prev;
    });
  }, [type, minViewsForType]);

  const isMediaType = type === "video" || type === "banner";

  const computedBudget =
    Number(views) > 0 && Number(duration) > 0
      ? Math.round(Number(views) * Number(duration) * 0.05 * 100) / 100
      : 0;

  const typeOptions: {
    value: Campaign["type"];
    icon: React.ReactNode;
    label: string;
  }[] = [
    { value: "video", icon: <Play className="h-5 w-5" />, label: "Видео" },
    { value: "banner", icon: <Image className="h-5 w-5" />, label: "Баннер" },
    {
      value: "cpc",
      icon: <MousePointerClick className="h-5 w-5" />,
      label: "CPC",
    },
    {
      value: "survey",
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Опрос",
    },
    {
      value: "app_install",
      icon: <Smartphone className="h-5 w-5" />,
      label: "Установка",
    },
    {
      value: "subscription",
      icon: <Users className="h-5 w-5" />,
      label: "Подписка",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/advertiser/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advertiserId,
          title,
          description: description || undefined,
          type,
          mediaUrl: isMediaType ? mediaUrl : undefined,
          targetUrl: !isMediaType ? targetUrl : undefined,
          taskDescription: !isMediaType ? taskDescription : undefined,
          views: Number(views),
          duration: Number(duration),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Ошибка создания кампании");
        return;
      }

      const stored = localStorage.getItem("adearn_advertiser");
      if (stored && json.remainingBalance !== undefined) {
        const data = JSON.parse(stored);
        data.balance = json.remainingBalance;
        localStorage.setItem("adearn_advertiser", JSON.stringify(data));
      }

      onSuccess();
      toast.success("Кампания создана");
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Название кампании</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Новая рекламная кампания"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Описание</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание кампании (необязательно)"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Тип кампании</label>
        <div className="grid grid-cols-3 gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors text-xs ${
                type === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/50"
              }`}
            >
              {opt.icon}
              <span className="font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {priceList.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Прайс-лист (выберите услугу для автозаполнения)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto rounded-xl border border-border/50 p-2">
            {priceList.map((item) => {
              const unitPrice =
                item.unit === "1000"
                  ? (item.price / 1000).toFixed(2)
                  : item.price.toFixed(2);
              const isSelected = title === item.name;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTitle(item.name);
                  }}
                  className={`flex flex-col items-start gap-1 p-3 rounded-lg border transition-colors text-left ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border/30 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <span className="text-sm font-medium leading-tight">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.price} ₽ / {item.unit}
                  </span>
                  <span className="text-xs text-primary font-medium">
                    {unitPrice} ₽ за ед.
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isMediaType ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">Ссылка на креатив</label>
          <Input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            type="url"
            required
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Целевая ссылка</label>
            <Input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              type="url"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Описание задания</label>
            <Input
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Опишите, что нужно сделать пользователю"
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Количество просмотров</label>
          <Input
            type="number"
            value={views}
            onChange={(e) => setViews(e.target.value)}
            placeholder={String(minViewsForType)}
            min={minViewsForType}
            required
          />
          <p className="text-xs text-muted-foreground">
            Минимум {minViewsForType}{" "}
            {type === "video" || type === "banner" ? "просмотров" : "действий"}{" "}
            для типа «
            {type === "video"
              ? "Видео"
              : type === "banner"
                ? "Баннер"
                : type === "cpc"
                  ? "CPC"
                  : type === "survey"
                    ? "Опрос"
                    : type === "app_install"
                      ? "Установка"
                      : "Подписка"}
            »
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Длительность просмотра (сек)
          </label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="10"
            min={10}
            step={1}
            required
          />
          <p className="text-xs text-muted-foreground">
            Цена за просмотр: {(Number(duration) * 0.05).toFixed(2)} ₽ (0.05
            ₽/сек)
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-1">
        <p className="text-xs text-muted-foreground">
          Бюджет (рассчитан автоматически)
        </p>
        <p className="text-xl font-bold text-primary">
          {computedBudget.toLocaleString()} ₽
        </p>
        <p className="text-xs text-muted-foreground">
          {views || "0"} просмотров × {(Number(duration) * 0.05).toFixed(2)} ₽
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Отмена
        </Button>
        <Button type="submit" className="flex-1 gap-2" disabled={loading}>
          {loading ? "Создание..." : "Создать кампанию"}
        </Button>
      </div>
    </form>
  );
}

interface ReviewItem {
  id: string;
  taskId: string;
  userId: string;
  reward: number;
  status: string;
  createdAt: string;
  expiresAt: string;
  taskTitle?: string;
  campaignId?: string;
  timeRemaining: number;
  expired: boolean;
}

function TaskReviewPanel({ advertiserId }: { advertiserId: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/advertiser/task-reviews?advertiserId=${advertiserId}`
      );
      const json = await res.json();
      setReviews(json.reviews ?? []);
    } catch {
      toast.error("Не удалось загрузить проверки");
    } finally {
      setLoading(false);
    }
  }, [advertiserId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReview = async (
    reviewId: string,
    action: "approve" | "reject"
  ) => {
    const id = toast.loading(
      action === "approve" ? "Подтверждение..." : "Отклонение..."
    );
    try {
      const res = await fetch("/api/advertiser/task-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Ошибка", { id });
        return;
      }
      toast.success(json.message, { id });
      fetchReviews();
    } catch {
      toast.error("Ошибка сети", { id });
    }
  };

  const pending = reviews.filter((r) => r.status === "pending");
  const history = reviews.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-amber-400" />
              Ожидают проверки
              {pending.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({pending.length})
                </span>
              )}
            </h2>
          </div>

          {pending.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Hourglass className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Нет заданий на проверку
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((review) => (
                <Card key={review.id} className="border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {review.taskTitle ?? "Задание"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Пользователь: {review.userId.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-green-400 font-medium mt-1">
                          +{review.reward.toFixed(2)} ₽
                        </p>
                        {review.expired ? (
                          <p className="text-xs text-red-400 mt-1">
                            Срок истёк — будет авто-подтверждено при загрузке
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">
                            Осталось: {review.timeRemaining} ч
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-400/30 hover:bg-red-500/10"
                          onClick={() => handleReview(review.id, "reject")}
                          disabled={review.expired}
                        >
                          Отклонить
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleReview(review.id, "approve")}
                          disabled={review.expired}
                        >
                          Подтвердить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <>
              <h2 className="text-lg font-semibold flex items-center gap-2 pt-4">
                История проверок
              </h2>
              <div className="space-y-2">
                {history.map((review) => (
                  <Card key={review.id} className="border-border/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {review.taskTitle ?? "Задание"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {review.reward.toFixed(2)} ₽
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            review.status === "approved"
                              ? "text-green-400 border-green-500/20"
                              : "text-red-400 border-red-500/20"
                          }
                        >
                          {review.status === "approved"
                            ? "Подтверждено"
                            : "Отклонено"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export function AdvertiserPage() {
  const router = useRouter();
  const [advertiser, setAdvertiser] = useState<AdvertiserData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<PageMode>("login");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [refCode, setRefCode] = useState<string | undefined>(undefined);
  const [clickId, setClickId] = useState<string | undefined>(undefined);
  const [dashboardTab, setDashboardTab] = useState<"campaigns" | "reviews">(
    "campaigns"
  );

  useEffect(() => {
    const stored = localStorage.getItem("adearn_advertiser");
    const adv = stored ? JSON.parse(stored) : null;
    setAdvertiser(adv);
    if (adv) setMode("dashboard");
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    setRefCode(ref ?? undefined);

    if (ref) {
      fetch("/api/referral/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerId: ref }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.clickId) setClickId(json.clickId);
        })
        .catch(() => {});
    }

    setHydrated(true);
  }, []);

  const fetchCampaigns = useCallback(async () => {
    if (!advertiser) return;
    setLoadingCampaigns(true);

    try {
      const res = await fetch(
        `/api/advertiser/campaigns?advertiserId=${advertiser.id}`
      );
      const json = await res.json();
      setCampaigns(json.campaigns ?? []);
    } catch {
      toast.error("Не удалось загрузить кампании");
    } finally {
      setLoadingCampaigns(false);
    }
  }, [advertiser]);

  useEffect(() => {
    if (advertiser) {
      fetchCampaigns();
    }
  }, [advertiser, fetchCampaigns]);

  const handleAuthSuccess = (data: AdvertiserData) => {
    setAdvertiser(data);
    setMode("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("adearn_advertiser");
    localStorage.removeItem("adearn_user");
    setAdvertiser(null);
    setMode("login");
    router.push("/");
  };

  const handleCampaignCreated = () => {
    fetchCampaigns();
    setMode("dashboard");
  };

  if (!advertiser) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-xl">
              {mode === "register" ? "Регистрация" : "Вход"} рекламодателя
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "register"
                ? "Создайте аккаунт для размещения рекламы"
                : "Войдите в кабинет рекламодателя"}
            </p>
          </CardHeader>
          <CardContent>
            {mode === "register" ? (
              <AdvertiserRegisterForm
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setMode("login")}
                refCode={refCode}
                clickId={clickId}
              />
            ) : (
              <AdvertiserLoginForm
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setMode("register")}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Кабинет рекламодателя</h1>
              <p className="text-sm text-muted-foreground">
                {advertiser.companyName} — {advertiser.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={
              buttonVariants({ variant: "ghost", size: "sm" }) + " gap-2"
            }
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>

        <Card className="relative overflow-hidden border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <CardContent className="relative p-8">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Текущий баланс</p>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setMode("topup")}
              >
                <Plus className="h-4 w-4" />
                Пополнить
              </Button>
            </div>
            <p className="text-4xl font-bold tracking-tight">
              {advertiser.balance.toFixed(2)}{" "}
              <span className="text-xl text-muted-foreground font-normal">
                ₽
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Доступно для кампаний
            </p>
          </CardContent>
        </Card>

        {mode === "topup" && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Пополнение баланса
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopUpForm
                advertiserId={advertiser.id}
                onBack={() => setMode("dashboard")}
              />
            </CardContent>
          </Card>
        )}

        {mode === "create_campaign" && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Новая кампания
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreateCampaignForm
                advertiserId={advertiser.id}
                onSuccess={handleCampaignCreated}
                onBack={() => setMode("dashboard")}
              />
            </CardContent>
          </Card>
        )}

        {mode === "dashboard" && (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-border/50 card-hover">
                <CardContent className="flex flex-col items-center text-center gap-3 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {totalViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Всего показов
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-border/50 card-hover">
                <CardContent className="flex flex-col items-center text-center gap-3 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50">
                    <MousePointerClick className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {totalClicks.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Всего кликов
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-border/50 card-hover">
                <CardContent className="flex flex-col items-center text-center gap-3 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {totalSpend.toFixed(2)} ₽
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Всего расходов
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-border/50 card-hover">
                <CardContent className="flex flex-col items-center text-center gap-3 py-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50">
                    <Target className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeCampaigns}</p>
                    <p className="text-xs text-muted-foreground">
                      Активных кампаний
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs
              value={dashboardTab}
              onValueChange={(v) =>
                setDashboardTab(v as "campaigns" | "reviews")
              }
            >
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="campaigns" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Кампании
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="gap-2">
                    <CopyCheck className="h-4 w-4" />
                    Проверка заданий
                  </TabsTrigger>
                </TabsList>
                {dashboardTab === "campaigns" && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => setMode("create_campaign")}
                    disabled={advertiser.balance <= 0}
                  >
                    <Plus className="h-4 w-4" />
                    Создать кампанию
                  </Button>
                )}
              </div>

              <TabsContent value="campaigns" className="space-y-4 mt-4">
                {loadingCampaigns ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, j) => (
                              <div key={j} className="space-y-1">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                            ))}
                          </div>
                          <Skeleton className="h-4 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : campaigns.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {campaigns.map((campaign) => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                          <Eye className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          У вас пока нет рекламных кампаний
                        </p>
                        {advertiser.balance > 0 ? (
                          <Button
                            onClick={() => setMode("create_campaign")}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Создать первую кампанию
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => setMode("topup")}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Пополнить баланс
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <TaskReviewPanel advertiserId={advertiser.id} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

