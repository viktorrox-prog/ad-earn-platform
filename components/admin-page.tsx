"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Megaphone,
  Wallet,
  MessageSquare,
  BarChart3,
  LogOut,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Send,
  Loader2,
  Phone,
  Calendar,
  CalendarClock,
  Clock,
  BadgeCheck,
  Image,
  ExternalLink,
  Plus,
  ChevronDown,
  Settings,
  Tag,
  Pencil,
  Save,
  Wrench,
  RotateCcw,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { PriceListItem } from "@/lib/models";
import { MIN_VIEWS_BY_CAMPAIGN_TYPE } from "@/lib/models";

type AdminTab =
  | "stats"
  | "users"
  | "campaigns"
  | "withdrawals"
  | "payments"
  | "tickets"
  | "banners"
  | "homepage-banners"
  | "broadcasts"
  | "settings"
  | "price-list";

interface AdminStats {
  totalUsers: number;
  totalAdvertisers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  turnover: number;
  withdrawn: number;
  commission: number;
}

interface AdminUser {
  id: string;
  email: string;
  phone: string;
  verified: boolean;
  blocked: boolean;
  createdAt: string;
}

interface AdminCampaign {
  id: string;
  advertiserId: string;
  title: string;
  type: string;
  budget: number;
  duration: number;
  costPerView: number;
  status: string;
  views: number;
  spend: number;
  createdAt: string;
}

interface AdminWithdrawal {
  id: string;
  userId: string;
  amount: number;
  method: string;
  recipient: string;
  status: string;
  createdAt: string;
  userEmail?: string;
  userPhone?: string;
  payByDate?: string | null;
  isOverdue?: boolean;
}

interface AdminTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

function getAdmin(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adearn_admin");
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Ошибка входа");
        return;
      }
      localStorage.setItem("adearn_admin", email);
      onLogin();
      toast.success("Вход выполнен");
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Вход в админ-панель</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="admin@adearn.ru"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "Ошибка загрузки статистики");
        return data;
      })
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <p className="text-center text-muted-foreground py-8">
        Не удалось загрузить статистику
      </p>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      icon: Users,
      label: "Пользователей",
      value: stats.totalUsers,
      sub: `+${stats.totalAdvertisers} рекламодателей`,
    },
    {
      icon: Megaphone,
      label: "Кампаний",
      value: stats.totalCampaigns,
      sub: `${stats.activeCampaigns} активных`,
    },
    {
      icon: Wallet,
      label: "Оборот",
      value: `${stats.turnover.toLocaleString()} ₽`,
      sub: "всего начислено",
    },
    {
      icon: Wallet,
      label: "Выведено",
      value: `${stats.withdrawn.toLocaleString()} ₽`,
      sub: "выплачено пользователям",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                {card.sub && (
                  <p className="text-xs text-muted-foreground">{card.sub}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      toast.error("Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBlock = async (userId: string, blocked: boolean) => {
    const action = blocked ? "unblock" : "block";
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchUsers();
    } else {
      toast.error(data.error);
    }
  };

  const handleVerify = async (userId: string) => {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "verify" }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchUsers();
    } else {
      toast.error(data.error);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Поиск по email или телефону..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        {filtered.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{user.email}</span>
                  {user.verified ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs shrink-0"
                    >
                      <BadgeCheck className="h-3 w-3" />
                      Верифицирован
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs shrink-0">
                      Не верифицирован
                    </Badge>
                  )}
                  {user.blocked && (
                    <Badge variant="destructive" className="text-xs shrink-0">
                      Заблокирован
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {user.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                {!user.verified && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVerify(user.id)}
                    title="Верифицировать"
                  >
                    <BadgeCheck className="h-4 w-4 text-green-500" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBlock(user.id, user.blocked)}
                  title={user.blocked ? "Разблокировать" : "Заблокировать"}
                >
                  {user.blocked ? (
                    <Unlock className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Пользователи не найдены
          </p>
        )}
      </div>
    </div>
  );
}

function CampaignsPanel() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "video",
    mediaUrl: "",
    targetUrl: "",
    taskDescription: "",
    duration: 10,
    views: MIN_VIEWS_BY_CAMPAIGN_TYPE.video,
  });

  const minViewsForType =
    MIN_VIEWS_BY_CAMPAIGN_TYPE[
      form.type as keyof typeof MIN_VIEWS_BY_CAMPAIGN_TYPE
    ] ?? MIN_VIEWS_BY_CAMPAIGN_TYPE.video;

  const budget = Math.round(form.views * form.duration * 0.05 * 100) / 100;

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
    } catch {
      toast.error("Ошибка загрузки кампаний");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleModerate = async (
    campaignId: string,
    status: "active" | "paused" | "completed"
  ) => {
    const res = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, status }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchCampaigns();
    } else {
      toast.error(data.error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration: Number(form.duration),
          views: Number(form.views),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Кампания создана");
        setShowForm(false);
        setForm({
          title: "",
          description: "",
          type: "video",
          mediaUrl: "",
          targetUrl: "",
          taskDescription: "",
          duration: 10,
          views: MIN_VIEWS_BY_CAMPAIGN_TYPE.video,
        });
        fetchCampaigns();
      } else {
        toast.error(data.error ?? "Ошибка создания");
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSubmitting(false);
    }
  };

  const campaignTypes = [
    { value: "video", label: "Видео" },
    { value: "banner", label: "Баннер" },
    { value: "cpc", label: "Переход (CPC)" },
    { value: "survey", label: "Опрос" },
    { value: "app_install", label: "Установка приложения" },
    { value: "subscription", label: "Подписка" },
  ];

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      active: "default",
      paused: "secondary",
      completed: "outline",
      moderation: "destructive",
    };
    return <Badge variant={variants[status] ?? "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Всего кампаний: {campaigns.length}
        </p>
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="h-4 w-4 mr-1" />
          {showForm ? "Отмена" : "Создать кампанию"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Новая кампания</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Название</label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Название кампании"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Описание</label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Описание кампании"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Тип кампании</label>
                <div className="relative">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    value={form.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const newMin =
                        MIN_VIEWS_BY_CAMPAIGN_TYPE[
                          newType as keyof typeof MIN_VIEWS_BY_CAMPAIGN_TYPE
                        ] ?? MIN_VIEWS_BY_CAMPAIGN_TYPE.video;
                      setForm((f) => ({
                        ...f,
                        type: newType,
                        views: f.views < newMin ? newMin : f.views,
                      }));
                    }}
                  >
                    {campaignTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              {(form.type === "video" || form.type === "banner") && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {form.type === "banner"
                      ? "Ссылка на картинку баннера"
                      : "Ссылка на видео"}
                  </label>
                  <Input
                    value={form.mediaUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mediaUrl: e.target.value }))
                    }
                    placeholder={
                      form.type === "banner"
                        ? "https://example.com/banner.jpg"
                        : "https://example.com/video.mp4"
                    }
                  />
                </div>
              )}
              {(form.type === "cpc" ||
                form.type === "survey" ||
                form.type === "app_install" ||
                form.type === "subscription") && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {form.type === "cpc"
                        ? "Ссылка для перехода"
                        : form.type === "survey"
                          ? "Ссылка на опрос/анкету"
                          : form.type === "app_install"
                            ? "Ссылка на приложение"
                            : "Ссылка на канал"}
                    </label>
                    <Input
                      value={form.targetUrl}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, targetUrl: e.target.value }))
                      }
                      placeholder={
                        form.type === "cpc"
                          ? "https://example.com/landing"
                          : form.type === "survey"
                            ? "https://example.com/survey"
                            : form.type === "app_install"
                              ? "https://play.google.com/store/apps/details?id=..."
                              : "https://t.me/channel"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Описание задания
                    </label>
                    <Input
                      value={form.taskDescription}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          taskDescription: e.target.value,
                        }))
                      }
                      placeholder="Описание действия для пользователя"
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Длительность просмотра (сек)
                  </label>
                  <Input
                    type="number"
                    min={10}
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        duration: Number(e.target.value),
                      }))
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Цена за просмотр: {(form.duration * 0.05).toFixed(2)} ₽
                    (0.05 ₽/сек)
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Количество просмотров
                  </label>
                  <Input
                    type="number"
                    min={minViewsForType}
                    step={1}
                    value={form.views}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, views: Number(e.target.value) }))
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Минимум {minViewsForType}{" "}
                    {form.type === "video" || form.type === "banner"
                      ? "просмотров"
                      : "действий"}{" "}
                    для типа «
                    {form.type === "video"
                      ? "Видео"
                      : form.type === "banner"
                        ? "Баннер"
                        : form.type === "cpc"
                          ? "CPC"
                          : form.type === "survey"
                            ? "Опрос"
                            : form.type === "app_install"
                              ? "Установка"
                              : "Подписка"}
                    »
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-primary/5 p-3 text-sm">
                <span className="text-muted-foreground">Бюджет: </span>
                <span className="font-semibold">
                  {budget.toLocaleString()} ₽
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  ({form.views.toLocaleString()} ×{" "}
                  {(form.duration * 0.05).toFixed(2)} ₽)
                </span>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {submitting ? "Создание..." : "Создать кампанию"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.title}</span>
                    {statusBadge(c.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Длит.: {c.duration} сек</span>
                    <span>Бюджет: {c.budget.toLocaleString()} ₽</span>
                    <span>Цена: {c.costPerView} ₽/просмотр</span>
                    <span>Показы: {c.views}</span>
                    <span>Потрачено: {c.spend.toLocaleString()} ₽</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.status !== "active" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleModerate(c.id, "active")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Одобрить
                    </Button>
                  )}
                  {c.status === "active" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleModerate(c.id, "paused")}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Приостановить
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {campaigns.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Кампании не найдены
          </p>
        )}
      </div>
    </div>
  );
}

function WithdrawalsPanel() {
  const [requests, setRequests] = useState<AdminWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/withdrawals");
      const data = await res.json();
      setRequests(
        Array.isArray(data.withdrawalRequests) ? data.withdrawalRequests : []
      );
    } catch {
      toast.error("Ошибка загрузки заявок");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleAction = async (
    withdrawalId: string,
    action: "approve" | "reject"
  ) => {
    const res = await fetch("/api/admin/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId, action }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchWithdrawals();
    } else {
      toast.error(data.error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const methodLabel: Record<string, string> = {
    card: "Карта",
    sbp: "СБП",
  };

  const statusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] ?? "outline"}>{status}</Badge>;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ru", {
      day: "numeric",
      month: "long",
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 shrink-0 text-primary" />
        Заявки на вывод обрабатываются в течение 3 рабочих дней после подачи
        заявки. Дата выплаты рассчитывается автоматически.
      </div>
      {requests.map((r) => (
        <Card key={r.id}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {r.amount.toLocaleString()} ₽
                  </span>
                  {statusBadge(r.status)}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Способ: {methodLabel[r.method] ?? r.method}</span>
                  <span>Получатель: {r.recipient}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {(r.userEmail || r.userPhone) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mt-1 text-primary">
                    {r.userEmail && <span>Email: {r.userEmail}</span>}
                    {r.userPhone && <span>Тел.: {r.userPhone}</span>}
                  </div>
                )}
                {r.status === "pending" && r.payByDate && (
                  <div
                    className={`flex items-center gap-1.5 text-xs mt-1 ${
                      r.isOverdue ? "text-red-400" : "text-amber-400"
                    }`}
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    {r.isOverdue
                      ? `Просрочено — выплатить до ${formatDate(r.payByDate)}`
                      : `Выплата до ${formatDate(r.payByDate)} (3 рабочих дня)`}
                  </div>
                )}
              </div>
              {r.status === "pending" && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAction(r.id, "approve")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Подтвердить
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction(r.id, "reject")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Отклонить
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {requests.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Заявки не найдены
        </p>
      )}
    </div>
  );
}

interface AdminPayment {
  id: string;
  userId?: string;
  advertiserId?: string;
  amount: number;
  method: string;
  status: string;
  description?: string;
  createdAt: string;
}

function PaymentsPanel() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      const data = await res.json();
      setPayments(Array.isArray(data.payments) ? data.payments : []);
    } catch {
      toast.error("Ошибка загрузки платежей");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const statusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      success: "default",
      fail: "destructive",
    };
    return <Badge variant={variants[status] ?? "outline"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <Card key={p.id}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {p.amount.toLocaleString()} ₽
                  </span>
                  {statusBadge(p.status)}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Метод: Azvox</span>
                  {p.userId && <span>Пользователь: {p.userId}</span>}
                  {p.advertiserId && (
                    <span>Рекламодатель: {p.advertiserId}</span>
                  )}
                  <span>{new Date(p.createdAt).toLocaleDateString("ru")}</span>
                </div>
                {p.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {payments.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Платежи не найдены
        </p>
      )}
    </div>
  );
}

function TicketsPanel() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets");
      const data = await res.json();
      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } catch {
      toast.error("Ошибка загрузки тикетов");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleRespond = async (ticketId: string) => {
    const text = responses[ticketId];
    if (!text?.trim()) {
      toast.error("Введите ответ");
      return;
    }
    setSending((prev) => ({ ...prev, [ticketId]: true }));
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, adminResponse: text }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setResponses((prev) => ({ ...prev, [ticketId]: "" }));
        fetchTickets();
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Ошибка отправки");
    } finally {
      setSending((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((t) => (
        <Card key={t.id}>
          <CardContent className="py-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.subject}</span>
                  <Badge
                    variant={t.status === "open" ? "secondary" : "outline"}
                  >
                    {t.status === "open" ? "Открыт" : "Закрыт"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(t.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {t.adminResponse && (
              <div className="rounded-lg bg-primary/5 p-3 space-y-1">
                <p className="text-xs font-medium text-primary flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Ответ администратора
                </p>
                <p className="text-sm">{t.adminResponse}</p>
              </div>
            )}
            {t.status === "open" && (
              <div className="flex gap-2">
                <Input
                  placeholder="Введите ответ..."
                  value={responses[t.id] ?? ""}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [t.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleRespond(t.id);
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => handleRespond(t.id)}
                  disabled={sending[t.id]}
                >
                  {sending[t.id] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {tickets.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Тикеты не найдены
        </p>
      )}
    </div>
  );
}

interface AdminDashboardBanner {
  id: string;
  userId: string;
  imageUrl: string;
  targetUrl: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

function DashboardBannersPanel() {
  const [banners, setBanners] = useState<AdminDashboardBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard-banners");
      const data = await res.json();
      setBanners(Array.isArray(data.banners) ? data.banners : []);
    } catch {
      toast.error("Ошибка загрузки баннеров");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleModerate = async (
    bannerId: string,
    status: "active" | "rejected"
  ) => {
    const res = await fetch("/api/admin/dashboard-banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerId, status }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchBanners();
    } else {
      toast.error(data.error);
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      active: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] ?? "outline"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {banners.map((b) => (
        <Card key={b.id}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Баннер</span>
                  {statusBadge(b.status)}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>ID: {b.id.slice(0, 8)}...</span>
                  <span>ID пользователя: {b.userId.slice(0, 8)}...</span>
                </div>
                <div className="flex gap-3">
                  <a
                    href={b.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                  >
                    <Image className="h-3 w-3" />
                    Изображение
                  </a>
                  <a
                    href={b.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Целевая ссылка
                  </a>
                </div>
                <div className="text-xs text-muted-foreground">
                  Создан: {new Date(b.createdAt).toLocaleString()}
                </div>
              </div>
              {b.status === "pending" && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleModerate(b.id, "active")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Одобрить
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleModerate(b.id, "rejected")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Отклонить
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {banners.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Баннеры не найдены
        </p>
      )}
    </div>
  );
}

interface AdminHomepageBanner {
  id: string;
  userId: string;
  imageUrl: string;
  targetUrl: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

function HomepageBannersPanel() {
  const [banners, setBanners] = useState<AdminHomepageBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/homepage-banners");
      const data = await res.json();
      setBanners(Array.isArray(data.banners) ? data.banners : []);
    } catch {
      toast.error("Ошибка загрузки баннеров главной");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleModerate = async (
    bannerId: string,
    status: "active" | "rejected"
  ) => {
    const res = await fetch("/api/admin/homepage-banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerId, status }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchBanners();
    } else {
      toast.error(data.error);
    }
  };

  const statusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "secondary",
      active: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] ?? "outline"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {banners.map((b) => (
        <Card key={b.id}>
          <CardContent className="py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Баннер главной</span>
                  {statusBadge(b.status)}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>ID: {b.id.slice(0, 8)}...</span>
                  <span>ID пользователя: {b.userId.slice(0, 8)}...</span>
                </div>
                <div className="flex gap-3">
                  <a
                    href={b.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                  >
                    <Image className="h-3 w-3" />
                    Изображение
                  </a>
                  <a
                    href={b.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Целевая ссылка
                  </a>
                </div>
                <div className="text-xs text-muted-foreground">
                  Создан: {new Date(b.createdAt).toLocaleString()}
                </div>
              </div>
              {b.status === "pending" && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleModerate(b.id, "active")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Одобрить
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleModerate(b.id, "rejected")}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Отклонить
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {banners.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          Баннеры не найдены
        </p>
      )}
    </div>
  );
}

interface AdminBroadcast {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

function BroadcastsPanel() {
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const fetchBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/broadcasts");
      const data = await res.json();
      setBroadcasts(Array.isArray(data.broadcasts) ? data.broadcasts : []);
    } catch {
      toast.error("Ошибка загрузки рассылок");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Заполните заголовок и сообщение");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Рассылка отправлена");
        setTitle("");
        setMessage("");
        fetchBroadcasts();
      } else {
        toast.error(data.error ?? "Ошибка отправки");
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            Создать рассылку
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Заголовок</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Важное объявление"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Сообщение</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Текст сообщения для всех пользователей..."
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={sending}>
              {sending && <Loader2 className="h-4 w-4 animate-spin" />}
              {sending ? "Отправка..." : "Отправить всем пользователям"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          История рассылок
        </h3>
        {broadcasts.map((b) => (
          <Card key={b.id}>
            <CardContent className="py-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">{b.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {b.message}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(b.createdAt).toLocaleString("ru")}
              </p>
            </CardContent>
          </Card>
        ))}
        {broadcasts.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Рассылок пока нет
          </p>
        )}
      </div>
    </div>
  );
}

function ResetTestDataCard() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/admin/reset-test-data", {
        method: "POST",
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Ошибка обнуления");
        return;
      }
      toast.success(
        `Обнулено аккаунтов: ${data.usersReset} пользователей, ${data.advertisersReset} рекламодателей`
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.error("Превышено время ожидания, попробуйте ещё раз");
      } else {
        toast.error("Ошибка соединения");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-primary" />
          Обнуление тестовых данных
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Сбросит балансы всех пользователей и бюджеты всех рекламодателей до
            нуля. Действие необратимо.
          </p>
          <Button
            variant="destructive"
            className="gap-2"
            disabled={loading}
            onClick={handleReset}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Обнуление..." : "Обнулить балансы"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsPanel() {
  const [settings, setSettings] = useState<{
    minCostPerView: number;
    minViews: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [minCostPerView, setMinCostPerView] = useState(1);
  const [minViews, setMinViews] = useState(1000);

  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [maintenanceToggling, setMaintenanceToggling] = useState(false);

  const fetchMaintenance = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/maintenance");
      const data = await res.json();
      setMaintenanceEnabled(data.enabled);
    } catch {
      // silently fail
    } finally {
      setMaintenanceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const handleMaintenanceToggle = async (enabled: boolean) => {
    setMaintenanceToggling(true);
    setMaintenanceEnabled(enabled);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
        signal: controller.signal,
      });
      if (!res.ok) {
        let err;
        try {
          err = await res.json();
        } catch {
          err = {};
        }
        toast.error(err.error ?? "Ошибка");
        setMaintenanceEnabled(!enabled);
        return;
      }
      toast.success(
        enabled ? "Режим техработ включён" : "Режим техработ выключен"
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        toast.error("Превышено время ожидания, попробуйте ещё раз");
      } else {
        toast.error("Ошибка соединения");
      }
      setMaintenanceEnabled(!enabled);
    } finally {
      clearTimeout(timeoutId);
      setMaintenanceToggling(false);
    }
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data);
      setMinCostPerView(data.minCostPerView);
      setMinViews(data.minViews);
    } catch {
      toast.error("Ошибка загрузки настроек");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minCostPerView: Number(minCostPerView),
          minViews: Number(minViews),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Настройки сохранены");
        setSettings(data);
      } else {
        toast.error(data.error ?? "Ошибка сохранения");
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Настройки цен на рекламу
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Минимальная цена за просмотр (₽)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={minCostPerView}
                  onChange={(e) => setMinCostPerView(Number(e.target.value))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Минимальная стоимость одного просмотра для рекламодателя
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Минимальное количество просмотров
                </label>
                <Input
                  type="number"
                  min={100}
                  step={100}
                  value={minViews}
                  onChange={(e) => setMinViews(Number(e.target.value))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Минимальное количество просмотров для кампании
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Сохранение..." : "Сохранить настройки"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {settings && (
        <Card>
          <CardContent className="py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  Текущая цена за просмотр
                </p>
                <p className="text-2xl font-bold">
                  {settings.minCostPerView} ₽
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Текущий минимум просмотров
                </p>
                <p className="text-2xl font-bold">
                  {settings.minViews.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            Технические работы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Режим технических работ</p>
              <p className="text-xs text-muted-foreground">
                {maintenanceEnabled
                  ? "Пользователи видят страницу о недоступности платформы"
                  : "Платформа доступна всем пользователям"}
              </p>
            </div>
            {maintenanceLoading ? (
              <Skeleton className="h-[18.4px] w-[32px] rounded-full" />
            ) : (
              <Switch
                checked={maintenanceEnabled}
                onCheckedChange={handleMaintenanceToggle}
                disabled={maintenanceToggling}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <ResetTestDataCard />
    </div>
  );
}

function PriceListPanel() {
  const [items, setItems] = useState<PriceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/price-list");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      toast.error("Ошибка загрузки прайс-листа");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSave = async (id: string, price: number) => {
    setSavingId(id);
    try {
      const res = await fetch("/api/admin/price-list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, price }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Ошибка сохранения");
        return;
      }
      toast.success("Цена обновлена");
      setEditingId(null);
      fetchItems();
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setSavingId(null);
    }
  };

  const grouped = items.reduce<Record<string, PriceListItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryLabels: Record<string, string> = {
    youtube: "YouTube",
    telegram: "Telegram",
    instagram: "Instagram",
    vk: "VK",
    tiktok: "TikTok",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3">
            {categoryLabels[category] ?? category}
          </h3>
          <div className="grid gap-3">
            {categoryItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            className="w-24 h-9 text-right"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            min={0}
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            ₽ / {item.unit}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSave(item.id, Number(editPrice))}
                          disabled={savingId === item.id}
                        >
                          {savingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Отмена
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {item.price.toLocaleString("ru-RU")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ₽ / {item.unit}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(item.id);
                            setEditPrice(String(item.price));
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const TABS: { id: AdminTab; label: string; icon: typeof Shield }[] = [
  { id: "stats", label: "Статистика", icon: BarChart3 },
  { id: "users", label: "Пользователи", icon: Users },
  { id: "campaigns", label: "Кампании", icon: Megaphone },
  { id: "withdrawals", label: "Выводы", icon: Wallet },
  { id: "payments", label: "Платежи", icon: Wallet },
  { id: "tickets", label: "Тикеты", icon: MessageSquare },
  { id: "banners", label: "Баннеры дэшборда", icon: Image },
  { id: "homepage-banners", label: "Баннеры главной", icon: Image },
  { id: "broadcasts", label: "Рассылка", icon: Megaphone },
  { id: "settings", label: "Настройки", icon: Settings },
  { id: "price-list", label: "Прайс-лист", icon: Tag },
];

export function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!getAdmin();
  });
  const [tab, setTab] = useState<AdminTab>("stats");

  const handleLogout = () => {
    localStorage.removeItem("adearn_admin");
    setAuthenticated(false);
    toast.success("Выход выполнен");
  };

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Админ-панель</h1>
            <p className="text-sm text-muted-foreground">
              Управление платформой
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </Button>
      </div>

      <Separator />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as AdminTab)}
        orientation="horizontal"
      >
        <TabsList variant="line">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              <t.icon className="h-4 w-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="stats">
          <StatsOverview />
        </TabsContent>
        <TabsContent value="users">
          <UsersPanel />
        </TabsContent>
        <TabsContent value="campaigns">
          <CampaignsPanel />
        </TabsContent>
        <TabsContent value="withdrawals">
          <WithdrawalsPanel />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentsPanel />
        </TabsContent>
        <TabsContent value="tickets">
          <TicketsPanel />
        </TabsContent>
        <TabsContent value="banners">
          <DashboardBannersPanel />
        </TabsContent>
        <TabsContent value="homepage-banners">
          <HomepageBannersPanel />
        </TabsContent>
        <TabsContent value="broadcasts">
          <BroadcastsPanel />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsPanel />
        </TabsContent>
        <TabsContent value="price-list">
          <PriceListPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
