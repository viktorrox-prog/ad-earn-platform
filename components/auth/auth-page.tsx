"use client";

import { useState } from "react";
import { RegisterForm } from "./register-form";
import { VerifyCodeForm } from "./verify-code-form";
import { LoginForm } from "./login-form";
import { ResetPasswordForm } from "./reset-password-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

type AuthMode = "login" | "register" | "verify" | "reset";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [pendingEmail, setPendingEmail] = useState("");

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "login" && "Вход в аккаунт"}
            {mode === "register" && "Регистрация"}
            {mode === "verify" && "Подтверждение email"}
            {mode === "reset" && "Восстановление пароля"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "login" && "Войдите, чтобы продолжить"}
            {mode === "register" && "Создайте аккаунт для заработка"}
            {mode === "verify" && "Введите код из письма"}
            {mode === "reset" && "Сбросьте пароль"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {mode === "login" && "Вход"}
              {mode === "register" && "Регистрация"}
              {mode === "verify" && "Подтверждение"}
              {mode === "reset" && "Восстановление"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mode === "login" && (
              <LoginForm
                onSuccess={() => {
                  window.location.href = "/";
                }}
                onSwitchToRegister={() => setMode("register")}
                onSwitchToReset={() => setMode("reset")}
              />
            )}
            {mode === "register" && (
              <RegisterForm
                onSuccess={(email) => {
                  setPendingEmail(email);
                  setMode("verify");
                }}
                onSwitchToLogin={() => setMode("login")}
              />
            )}
            {mode === "verify" && (
              <VerifyCodeForm
                email={pendingEmail}
                onBack={() => setMode("register")}
              />
            )}
            {mode === "reset" && (
              <ResetPasswordForm onBackToLogin={() => setMode("login")} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
