"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    if (pathname === "/maintenance") return;
    if (pathname.startsWith("/admin")) return;

    const admin = localStorage.getItem("adearn_admin");
    if (admin) return;

    checkedRef.current = true;

    fetch("/api/admin/maintenance")
      .then((res) => res.json())
      .then((data) => {
        if (data.enabled) {
          router.replace("/maintenance");
        }
      })
      .catch(() => {});
  }, [pathname, router]);

  return <>{children}</>;
}
