"use client";

import { Download } from "lucide-react";

export function PromoBanner() {
  const handleDownload = () => {
    const svg = document.getElementById("promo-banner-svg");
    if (!svg) return;
    const clone = svg.cloneNode(true) as Element;
    clone
      .querySelectorAll("[class]")
      .forEach((el) => el.removeAttribute("class"));
    clone.removeAttribute("class");
    const svgString = clone.outerHTML;
    const dataUri =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    const a = document.createElement("a");
    a.href = dataUri;
    a.download = "adearn-partner-banner.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="relative">
      <svg
        id="promo-banner-svg"
        viewBox="0 0 800 400"
        width="800"
        height="400"
        className="w-full rounded-xl border border-border/40"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="AdEarn партнёрская программа — зарабатывайте 12%"
      >
        <defs>
          <linearGradient id="bannerBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d0d1a" />
            <stop offset="100%" stopColor="#1a1a30" />
          </linearGradient>
          <linearGradient id="bannerAccent" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="bannerBtn" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <radialGradient id="bannerGlow1" cx="0.85" cy="0.2" r="0.4">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bannerGlow2" cx="0.15" cy="0.9" r="0.35">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
          <pattern
            id="bannerGrid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="16" cy="16" r="0.8" fill="#ffffff" opacity="0.04" />
          </pattern>
        </defs>

        <rect width="800" height="400" fill="url(#bannerBg)" rx="12" />
        <rect width="800" height="400" fill="url(#bannerGrid)" rx="12" />
        <rect width="800" height="400" fill="url(#bannerGlow1)" rx="12" />
        <rect width="800" height="400" fill="url(#bannerGlow2)" rx="12" />

        <rect
          x="0"
          y="0"
          width="800"
          height="3"
          fill="url(#bannerAccent)"
          rx="1.5"
        />

        <rect
          x="40"
          y="40"
          width="44"
          height="44"
          rx="10"
          fill="url(#bannerAccent)"
        />
        <polyline
          points="52,68 60,55 70,62 80,48"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <text
          x="100"
          y="58"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="bold"
          fill="#ffffff"
        >
          AdEarn
        </text>
        <text
          x="100"
          y="78"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="13"
          fill="#a1a1aa"
        >
          Партнёрская программа
        </text>

        <text
          x="40"
          y="170"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="32"
          fontWeight="bold"
          fill="#ffffff"
        >
          Зарабатывайте 12%
        </text>
        <text
          x="40"
          y="210"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="18"
          fill="#a1a1aa"
        >
          от расходов приведённых рекламодателей
        </text>

        <text
          x="40"
          y="258"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="14"
          fill="#71717a"
        >
          Рекламируйте на платформе AdEarn — получайте доступ к
        </text>
        <text
          x="40"
          y="278"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="14"
          fill="#71717a"
        >
          активной аудитории и отслеживайте эффективность кампаний.
        </text>

        <g
          onClick={() =>
            window.open("/advertiser", "_blank", "noopener,noreferrer")
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              window.open("/advertiser", "_blank", "noopener,noreferrer");
            }
          }}
          role="link"
          tabIndex={0}
          className="cursor-pointer"
          aria-label="Стать рекламодателем"
        >
          <rect
            x="40"
            y="310"
            width="220"
            height="44"
            rx="8"
            fill="url(#bannerBtn)"
          />
          <text
            x="150"
            y="337"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="14"
            fontWeight="600"
            fill="#ffffff"
            textAnchor="middle"
          >
            Стать рекламодателем
          </text>
        </g>

        <text
          x="40"
          y="380"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11"
          fill="#52525b"
        >
          © 2025 AdEarn. Все права защищены.
        </text>
      </svg>

      <button
        onClick={handleDownload}
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-background/90 transition-all"
      >
        <Download className="h-3.5 w-3.5" />
        Скачать
      </button>
    </div>
  );
}
