"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface VerifyCodeFormProps {
  email: string;
  onBack: () => void;
}

export function VerifyCodeForm({ email, onBack }: VerifyCodeFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("Код должен содержать 6 цифр");
      return;
    }

    setLoading(true);
    const id = toast.loading("Проверка кода...");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Ошибка подтверждения", { id });
        return;
      }

      toast.success("Email подтверждён!", { id });

      localStorage.setItem("adearn_user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } catch {
      toast.error("Ошибка сети", { id });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Мы отправили код подтверждения на <strong>{email}</strong>. Проверьте
        почту и введите код ниже.
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">Код подтверждения</label>
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
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Проверка..." : "Подтвердить"}
      </Button>
      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm text-muted-foreground underline underline-offset-4 hover:no-underline"
      >
        Назад к регистрации
      </button>
    </form>
  );
}
