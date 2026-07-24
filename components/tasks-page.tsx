"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ListChecks,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  ThumbsUp,
  UserPlus,
  MessageSquare,
  Play,
  Send,
  Smartphone,
  ClipboardList,
  MessageCircle,
  Film,
  Hourglass,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Task, TaskPlatform, TaskActionType, TaskType } from "@/lib/models";

interface TasksResponse {
  tasks: Task[];
  completedTaskIds: string[];
}

interface TaskReviewInfo {
  taskId: string;
  status: "pending" | "approved" | "rejected";
}

type FilterType = TaskType | "all";

interface FilterOption {
  value: FilterType;
  label: string;
  icon: typeof Globe;
}

const filterOptions: FilterOption[] = [
  { value: "all", label: "Все", icon: ListChecks },
  { value: "social", label: "Соцсети", icon: Globe },
  { value: "subscription", label: "Подписки", icon: UserPlus },
  { value: "cpc", label: "CPC", icon: Send },
  { value: "app_install", label: "Установка", icon: Smartphone },
  { value: "survey", label: "Опросы", icon: ClipboardList },
];

const platformIcons: Record<TaskPlatform, typeof Globe> = {
  youtube: Film,
  vk: Globe,
  telegram: MessageCircle,
  cpc: Send,
  app: Smartphone,
  survey: ClipboardList,
  other: Globe,
};

const platformLabels: Record<TaskPlatform, string> = {
  youtube: "YouTube",
  vk: "VK",
  telegram: "Telegram",
  cpc: "Ссылка",
  app: "Приложение",
  survey: "Опрос",
  other: "Площадка",
};

const platformColors: Record<TaskPlatform, string> = {
  youtube: "text-red-400",
  vk: "text-blue-400",
  telegram: "text-sky-400",
  cpc: "text-amber-400",
  app: "text-emerald-400",
  survey: "text-violet-400",
  other: "text-muted-foreground",
};

const actionIcons: Record<TaskActionType, typeof Play> = {
  watch: Play,
  like: ThumbsUp,
  subscribe: UserPlus,
  comment: MessageSquare,
  cpc: Send,
  install: Smartphone,
  survey: ClipboardList,
  other: ListChecks,
};

const taskTypeDescriptions: Record<TaskType, string> = {
  social: "Лайки, комментарии, просмотры в соцсетях",
  subscription: "Подписка на Telegram и YouTube каналы",
  cpc: "Переходы по рекламным ссылкам",
  app_install: "Установка и запуск приложений",
  survey: "Прохождение опросов и анкет",
};

function TaskConfirmModal({
  task,
  onComplete,
  onClose,
}: {
  task: Task;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [returned, setReturned] = useState(false);
  const [sending, setSending] = useState(false);
  const rewardCalledRef = useRef(false);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !returned) {
        setReturned(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [returned]);

  const handleConfirm = () => {
    if (rewardCalledRef.current) return;
    rewardCalledRef.current = true;
    setSending(true);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            {task.title}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-center py-16">
          {sending ? (
            <div className="flex flex-col items-center gap-2 text-amber-400">
              <Hourglass className="h-12 w-12" />
              <span className="text-sm font-medium">
                Отправлено на проверку
              </span>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">
                  Ожидайте подтверждения рекламодателя
                </span>
              </div>
            </div>
          ) : !returned ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                <ExternalLink className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                Выполните задание на внешнем сайте и вернитесь на эту страницу
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">
                Вы вернулись. Нажмите «Подтвердить», если выполнили задание
              </span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border/50">
          {sending ? (
            <div className="flex items-center justify-center gap-2 text-sm text-amber-400">
              <Hourglass className="h-4 w-4" />
              На проверке у рекламодателя
            </div>
          ) : !returned ? (
            <a
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ className: "w-full gap-2" })}
            >
              <ExternalLink className="h-4 w-4" />
              Перейти к заданию
            </a>
          ) : (
            <Button onClick={handleConfirm} className="w-full gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Подтвердить выполнение
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  completed,
  reviewStatus,
  onStart,
}: {
  task: Task;
  completed: boolean;
  reviewStatus: TaskReviewInfo["status"] | null;
  onStart: () => void;
}) {
  const PlatformIcon = platformIcons[task.platform];
  const ActionIcon = actionIcons[task.actionType];

  const statusBadge = () => {
    if (completed) {
      return (
        <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Выполнено
        </div>
      );
    }
    if (reviewStatus === "pending") {
      return (
        <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
          <Hourglass className="h-4 w-4" />
          На проверке
        </div>
      );
    }
    if (reviewStatus === "approved") {
      return (
        <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          Подтверждено
        </div>
      );
    }
    if (reviewStatus === "rejected") {
      return (
        <div className="flex items-center gap-1 text-xs text-red-400 font-medium">
          <X className="h-4 w-4" />
          Отклонено
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-hover border-border/50 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ActionIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-sm">{task.title}</h3>
              <Badge
                variant="outline"
                className={`gap-1 text-xs ${platformColors[task.platform]}`}
              >
                <PlatformIcon className="h-3 w-3" />
                {platformLabels[task.platform]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-green-400">
                +{task.reward.toFixed(2)} ₽
              </span>
              <div className="flex items-center gap-2">
                {completed || reviewStatus === "approved" ? (
                  <div className="flex items-center gap-1 text-xs text-green-400 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Выполнено
                  </div>
                ) : reviewStatus === "pending" ? (
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                    <Hourglass className="h-4 w-4" />
                    На проверке
                  </div>
                ) : reviewStatus === "rejected" ? (
                  <div className="flex items-center gap-1 text-xs text-red-400 font-medium">
                    <X className="h-4 w-4" />
                    Отклонено
                  </div>
                ) : (
                  <a
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onStart}
                    className={
                      buttonVariants({ variant: "outline", size: "sm" }) +
                      " gap-1.5"
                    }
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Перейти
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("adearn_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [hydrated] = useState(() => typeof window !== "undefined");
  const [data, setData] = useState<TasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [confirmingTask, setConfirmingTask] = useState<Task | null>(null);
  const [reviews, setReviews] = useState<TaskReviewInfo[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    fetch(`/api/tasks?userId=${user.id}`)
      .then((res) => res.json())
      .then((json: TasksResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Не удалось загрузить задания");
        setLoading(false);
      });

    fetch(`/api/tasks/reviews?userId=${user.id}`)
      .then((res) => res.json())
      .then((json: { reviews: { taskId: string; status: string }[] }) => {
        setReviews(
          json.reviews.map((r) => ({
            taskId: r.taskId,
            status: r.status as TaskReviewInfo["status"],
          }))
        );
      })
      .catch(() => {});
  }, [user, hydrated, router]);

  const filteredTasks = data
    ? activeFilter === "all"
      ? data.tasks
      : data.tasks.filter((t) => t.taskType === activeFilter)
    : [];

  const handleTimerComplete = useCallback(async () => {
    if (!user || !confirmingTask) return;

    const task = confirmingTask;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, taskId: task.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Ошибка отправки");
        return;
      }
      toast.success(json.message);
      setReviews((prev) => [...prev, { taskId: task.id, status: "pending" }]);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          completedTaskIds: [...prev.completedTaskIds, task.id],
        };
      });
    } catch {
      toast.error("Ошибка сети");
    }
  }, [user, confirmingTask]);

  const getReviewStatus = (taskId: string) => {
    return reviews.find((r) => r.taskId === taskId)?.status ?? null;
  };

  if (!user) return null;

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
            <ListChecks className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Задания</h1>
            <p className="text-sm text-muted-foreground">
              Выполняй задания и получай вознаграждение
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  activeFilter === option.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>

        {activeFilter !== "all" && (
          <p className="-mt-4 text-xs text-muted-foreground">
            {taskTypeDescriptions[activeFilter as TaskType]}
          </p>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-32 rounded-lg" />
                      </div>
                    </div>
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
        ) : filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                completed={data!.completedTaskIds.includes(task.id)}
                reviewStatus={getReviewStatus(task.id)}
                onStart={() => setConfirmingTask(task)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ListChecks className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Нет заданий этого типа
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
        )}
      </div>

      {confirmingTask && (
        <TaskConfirmModal
          task={confirmingTask}
          onComplete={handleTimerComplete}
          onClose={() => setConfirmingTask(null)}
        />
      )}
    </div>
  );
}
