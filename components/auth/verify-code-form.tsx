"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, CheckCheck } from "lucide-react";

interface VerifyCodeFormProps {
  email: string;
  displayCode?: string;
  onBack: () => void;
}

export function VerifyCodeForm({
  email,
  displayCode,
  onBack,
}: VerifyCodeFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!displayCode) return;
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the text manually
    }
  }

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
        Код подтверждения отправлен на <strong>{email}</strong>
      </p>

      {displayCode && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Код подтверждения (отправлен на email)
          </p>
          <div className="flex items-center gap-2">
            <code className="select-all rounded bg-background px-3 py-1.5 text-lg font-bold tracking-widest text-primary">
              {displayCode}
            </code>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleCopy}
            >
              {copied ? (
                <CheckCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Код действителен в течение 10 минут. Вы можете скопировать его или
            ввести вручную.
          </p>
        </div>
      )}

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
