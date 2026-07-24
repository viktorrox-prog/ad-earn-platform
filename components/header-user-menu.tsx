"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, TrendingUp, LogOut } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";

function getStoredUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adearn_user");
}

function getStoredAdvertiser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("adearn_advertiser");
}

export function HeaderUserMenu() {
  const router = useRouter();
  const [isLoggedIn] = useState(() => !!getStoredUser());
  const [isAdvertiser] = useState(() => !!getStoredAdvertiser());

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adearn_user");
    localStorage.removeItem("adearn_advertiser");
    router.push("/");
  }, [router]);

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/advertiser"
        className={
          buttonVariants({
            variant: isAdvertiser ? "default" : "outline",
            size: "sm",
          }) + " gap-2"
        }
      >
        <TrendingUp className="h-4 w-4" />
        {isAdvertiser ? "Кабинет" : "Рекламодателям"}
      </Link>
      {isLoggedIn && (
        <Link
          href="/dashboard"
          className={
            buttonVariants({ variant: "ghost", size: "sm" }) + " gap-2"
          }
        >
          <User className="h-4 w-4" />
          Личный кабинет
        </Link>
      )}
      {(isLoggedIn || isAdvertiser) && (
        <button
          onClick={handleLogout}
          className={
            buttonVariants({ variant: "ghost", size: "sm" }) + " gap-2"
          }
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      )}
    </div>
  );
}
