"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ResetPasswordFormProps {
  onBackToLogin: () => void;
}

export function ResetPasswordForm({ onBackToLogin }: ResetPasswordFormProps) {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();

    if (!target.trim()) {
      toast.error("Укажите email или номер телефона");
      return;
    }

    setLoading(true);
    const id = toast.loading("Отправка кода...");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Ошибка", { id });
        return;
      }

      toast.success("Код отправлен", { id });
      setStep("confirm");
    } catch {
      toast.error("Ошибка сети", { id });
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("Код должен содержать 6 цифр");
      return;
    }

    if (password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }

    setLoading(true);
    const id = toast.loading("Смена пароля...");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, code, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Ошибка", { id });
        return;
      }

      toast.success("Пароль изменён!", { id });
      onBackToLogin();
    } catch {
      toast.error("Ошибка сети", { id });
    } finally {
      setLoading(false);
    }
  }

  if (step === "request") {
    return (
      <form onSubmit={handleRequest} className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Введите email или номер телефона, и мы отправим код для сброса пароля.
        </p>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Email или номер телефона
          </label>
          <Input
            type="text"
            placeholder="email@example.com или +71234567890"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Отправка..." : "Отправить код"}
        </Button>
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full text-center text-sm text-muted-foreground underline underline-offset-4 hover:no-underline"
        >
          Назад ко входу
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleConfirm} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Мы отправили код на <strong>{target}</strong>. Проверьте почту и введите
        код ниже.
      </p>
      <div className="space-y-2">
        <label className="text-sm font-medium">Код из письма/SMS</label>
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Новый пароль</label>
        <Input
          type="password"
          placeholder="Минимум 6 символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Сохранение..." : "Сохранить пароль"}
      </Button>
      <button
        type="button"
        onClick={() => setStep("request")}
        className="w-full text-center text-sm text-muted-foreground underline underline-offset-4 hover:no-underline"
      >
        Назад
      </button>
    </form>
  );
}

