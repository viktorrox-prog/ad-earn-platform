"use client";

import { useMemo } from "react";

interface Star {
  cx: number;
  cy: number;
}

const starLayers = [
  {
    className: "animate-twinkle-slow",
    count: 80,
    r: 1.5,
    fill: "#ffffff",
    opacity: 1,
    filter: "url(#glow-white)",
    seed: 1,
  },
  {
    className: "animate-twinkle-medium",
    count: 50,
    r: 2.0,
    fill: "#a0c4ff",
    opacity: 1,
    filter: "url(#glow-blue)",
    seed: 2,
  },
  {
    className: "animate-twinkle-fast",
    count: 25,
    r: 3.0,
    fill: "#7aa2f7",
    opacity: 1,
    filter: "url(#glow-bright)",
    seed: 3,
  },
];

function generateStars(count: number, seed: number): Star[] {
  const rng = mulberry32(seed);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      cx: rng() * 2000,
      cy: rng() * 2000,
    });
  }
  return stars;
}

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function CosmicBackground() {
  const layers = useMemo(
    () =>
      starLayers.map((layer) => ({
        ...layer,
        stars: generateStars(layer.count, layer.seed),
      })),
    []
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[oklch(0.12_0.02_270)]" />

      <div className="absolute inset-0">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-[oklch(0.6_0.18_264/0.25)] blur-3xl animate-nebula-drift" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-[oklch(0.5_0.2_320/0.22)] blur-3xl animate-nebula-drift-reverse" />
        <div className="absolute top-1/4 left-1/3 w-1/3 h-1/3 rounded-full bg-[oklch(0.55_0.15_200/0.18)] blur-3xl animate-nebula-pulse" />
      </div>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 2000 2000"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id="glow-white" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2"
              result="blur1"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="4"
              result="blur2"
            />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2.5"
              result="blur1"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="5"
              result="blur2"
            />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-bright" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="3"
              result="blur1"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="6"
              result="blur2"
            />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {layers.map((layer) => (
        <svg
          key={layer.seed}
          className={`absolute inset-0 w-full h-full ${layer.className}`}
          viewBox="0 0 2000 2000"
          preserveAspectRatio="xMidYMid slice"
        >
          {layer.stars.map((star, i) => (
            <circle
              key={i}
              cx={star.cx}
              cy={star.cy}
              r={layer.r}
              fill={layer.fill}
              opacity={layer.opacity}
              filter={layer.filter}
            />
          ))}
        </svg>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20" />
    </div>
  );
}
