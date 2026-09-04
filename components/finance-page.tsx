"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Smartphone,
  Clock,
  RefreshCw,
  AlertCircle,
  Plus,
  Loader2,
  Landmark,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button-variants";
import { toast } from "sonner";
import { Transaction } from "@/lib/models";

interface UserData {
  id: string;
  email: string;
  phone: string;
}

interface BalanceData {
  balance: number;
  transactions: Transaction[];
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  method: string;
  recipient: string;
  status: string;
  createdAt: string;
}

const methodLabels: Record<string, string> = {
  azvox: "Azvox",
  card: "Банковская карта",
};

const methodIcons: Record<string, typeof CreditCard> = {
  azvox: Landmark,
  card: CreditCard,
};

const statusLabels: Record<string, string> = {
  pending: "Ожидает",
  approved: "Одобрено",
  rejected: "Отклонено",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

type TabValue = "deposit" | "withdraw" | "history";

function FinancePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<BalanceData | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("deposit");

  const [depositAmount, setDepositAmount] = useState("");

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"card" | "sbp">("card");
  const [withdrawRecipient, setWithdrawRecipient] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const MIN_WITHDRAWAL = 100;

  useEffect(() => {
    const stored = localStorage.getItem("adearn_user");
    setUser(stored ? JSON.parse(stored) : null);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    Promise.all([
      fetch(`/api/balance?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/balance/withdraw?userId=${user.id}`).then((r) => r.json()),
    ])
      .then(([balanceData, withdrawalData]) => {
        setData(balanceData);
        setWithdrawals(withdrawalData.requests);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Не удалось загрузить данные");
        setLoading(false);
      });
  }, [user, hydrated, router]);

  if (!user) return null;

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      toast.error("Введите сумму пополнения");
      return;
    }

    const endpoint = "/api/payment/azvox/init";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount,
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

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < MIN_WITHDRAWAL) {
      toast.error(`Минимальная сумма вывода — ${MIN_WITHDRAWAL} ₽`);
      return;
    }
    if (!withdrawRecipient.trim()) {
      toast.error("Укажите реквизиты для вывода");
      return;
    }

    if (data && amount > data.balance) {
      toast.error("Недостаточно средств");
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch("/api/balance/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount,
          method: withdrawMethod,
          recipient: withdrawRecipient,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Ошибка создания заявки");
        return;
      }

      toast.success(json.message);
      setWithdrawAmount("");
      setWithdrawRecipient("");

      const [balanceRes, wdRes] = await Promise.all([
        fetch(`/api/balance?userId=${user.id}`),
        fetch(`/api/balance/withdraw?userId=${user.id}`),
      ]);
      setData(await balanceRes.json());
      setWithdrawals((await wdRes.json()).requests);
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setWithdrawing(false);
    }
  };

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

  const depositAmounts = [100, 300, 500, 1000, 3000, 5000];
  const recentTransactions =
    data?.transactions
      .filter((t) => t.type === "deposit" || t.type === "withdrawal")
      .slice(0, 10) ?? [];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Депозиты и вывод средств</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

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

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deposit">
              <Plus className="h-4 w-4 mr-1.5" />
              Пополнение
            </TabsTrigger>
            <TabsTrigger value="withdraw">
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              Вывод
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-1.5" />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Способ пополнения
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Пополнение через Azvox работает только через VPN.
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Метод оплаты</p>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="default"
                      className="flex-col gap-1.5 h-auto py-3"
                    >
                      <Landmark className="h-5 w-5" />
                      <span className="text-sm font-medium">Azvox</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <p className="text-sm font-medium">Сумма пополнения</p>
                  <div className="flex flex-wrap gap-2">
                    {depositAmounts.map((a) => (
                      <Button
                        key={a}
                        variant={
                          Number(depositAmount) === a ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setDepositAmount(String(a))}
                      >
                        {a} ₽
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Другая сумма"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min={1}
                    />
                    <Button
                      onClick={handleDeposit}
                      disabled={!depositAmount || Number(depositAmount) <= 0}
                      className="gap-2 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      Пополнить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Заявка на вывод средств
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-400 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Минимальная сумма вывода — {MIN_WITHDRAWAL} ₽
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Способ вывода</label>
                  <div className="flex gap-2">
                    <Button
                      variant={
                        withdrawMethod === "card" ? "default" : "outline"
                      }
                      className="flex-1 gap-2"
                      onClick={() => setWithdrawMethod("card")}
                    >
                      <CreditCard className="h-4 w-4" />
                      Карта
                    </Button>
                    <Button
                      variant={withdrawMethod === "sbp" ? "default" : "outline"}
                      className="flex-1 gap-2"
                      onClick={() => setWithdrawMethod("sbp")}
                    >
                      <Smartphone className="h-4 w-4" />
                      СБП
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {withdrawMethod === "card"
                      ? "Номер карты"
                      : "Номер телефона (СБП)"}
                  </label>
                  <Input
                    placeholder={
                      withdrawMethod === "card"
                        ? "2200 0000 0000 0000"
                        : "+7 (999) 000-00-00"
                    }
                    value={withdrawRecipient}
                    onChange={(e) => setWithdrawRecipient(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Сумма вывода</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={`от ${MIN_WITHDRAWAL} ₽`}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min={MIN_WITHDRAWAL}
                    />
                  </div>
                  {data && Number(withdrawAmount) > data.balance && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Недостаточно средств. Доступно: {data.balance.toFixed(
                        2
                      )}{" "}
                      ₽
                    </p>
                  )}
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleWithdraw}
                  disabled={
                    withdrawing ||
                    !withdrawAmount ||
                    !withdrawRecipient ||
                    Number(withdrawAmount) < MIN_WITHDRAWAL ||
                    (data !== null && Number(withdrawAmount) > data.balance)
                  }
                >
                  {withdrawing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                  Отправить заявку
                </Button>
              </CardContent>
            </Card>

            {withdrawals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Мои заявки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border/50">
                    {withdrawals.map((wd) => {
                      const Icon =
                        methodIcons[wd.method as keyof typeof methodIcons] ??
                        CreditCard;
                      return (
                        <div
                          key={wd.id}
                          className="flex items-center gap-3 py-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              Вывод на{" "}
                              {methodLabels[
                                wd.method as keyof typeof methodLabels
                              ] ?? wd.method}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {wd.recipient} ·{" "}
                              {new Date(wd.createdAt).toLocaleDateString("ru")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold">
                              -{wd.amount.toFixed(2)} ₽
                            </p>
                            <Badge
                              variant={
                                statusVariants[
                                  wd.status as keyof typeof statusVariants
                                ] ?? "outline"
                              }
                              className="mt-0.5"
                            >
                              {statusLabels[
                                wd.status as keyof typeof statusLabels
                              ] ?? wd.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  История пополнений и выводов
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
                ) : recentTransactions.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {recentTransactions.map((tx) => {
                      const Icon = typeIcons[tx.type] ?? ArrowUpRight;
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center gap-3 py-3"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeBgColors[tx.type] ?? "bg-muted"}`}
                          >
                            <Icon
                              className={`h-4 w-4 ${typeColors[tx.type] ?? "text-muted-foreground"}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {tx.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
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
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      История пополнений и выводов пуста
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

            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors block text-center"
            >
              ← Вернуться в личный кабинет
            </Link>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export { FinancePage, type TabValue };
