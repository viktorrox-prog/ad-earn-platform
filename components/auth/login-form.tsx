"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  onSwitchToReset: () => void;
}

export function LoginForm({
  onSuccess,
  onSwitchToRegister,
  onSwitchToReset,
}: LoginFormProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!login.trim() || !password.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    setLoading(true);
    const id = toast.loading("Вход...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.userId) {
          toast.error(data.error ?? "Email не подтверждён", { id });
          return;
        }
        toast.error(data.error ?? "Ошибка входа", { id });
        return;
      }

      toast.success("Вход выполнен успешно!", { id });
      localStorage.setItem("adearn_user", JSON.stringify(data.user));
      onSuccess();
    } catch {
      toast.error("Ошибка сети", { id });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email или номер телефона</label>
        <Input
          type="text"
          placeholder="email@example.com или +71234567890"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Пароль</label>
        <Input
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSwitchToReset}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:no-underline"
        >
          Забыли пароль?
        </button>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Вход..." : "Войти"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Нет аккаунта?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-primary underline underline-offset-4 hover:no-underline"
        >
          Зарегистрироваться
        </button>
      </p>
    </form>
  );
}
