"use client";

import { usePathname } from "next/navigation";
import { CosmicBackground } from "@/components/cosmic-background";

export function CosmicBackgroundWrapper() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <CosmicBackground />;
}
