"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Megaphone,
  Wallet,
  MessageSquare,
  MessageCircle,
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
  | "chat"
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

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

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
      setUsers(data.users);
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
      setCampaigns(data.campaigns);
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
                    Ссылка на креатив
                  </label>
                  <Input
                    value={form.mediaUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mediaUrl: e.target.value }))
                    }
                    placeholder="https://example.com/video.mp4"
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
                      Целевая ссылка
                    </label>
                    <Input
                      value={form.targetUrl}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, targetUrl: e.target.value }))
                      }
                      placeholder="https://example.com"
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

