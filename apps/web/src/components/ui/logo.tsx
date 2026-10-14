"use client";

import Link from "next/link";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * 3D Isometric Logo Icon for QuantDCF India
 * Features:
 * - True 3D isometric cuboid DCF pillars (Top, Left, Right faces with directional lighting)
 * - Specular bevels & ambient occlusion shadows for tangible geometric depth
 * - 3D neon trajectory arc leaping across the valuation monoliths
 * - Floating apex 3D diamond/gemstone node representing intrinsic target valuation
 * - Glassmorphic squircle shield with dimensional metallic chamfer rim
 */
export function LogoIcon({
  size = "md",
  className = "",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dim =
    size === "xs"
      ? 22
      : size === "sm"
      ? 28
      : size === "lg"
      ? 42
      : size === "xl"
      ? 56
      : 34;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group select-none transition-transform duration-300 hover:scale-105 active:scale-95 ${className}`}
      style={{ width: dim, height: dim }}
    >
      {/* 3D Ambient Drop Glow / Underlight */}
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-sky-500/30 via-indigo-500/20 to-emerald-400/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />

      <svg
        width={dim}
        height={dim}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_4px_12px_rgba(14,165,233,0.35)]"
        aria-label="QuantDCF 3D Logo"
      >
        <defs>
          {/* Base Shield Gradients */}
          <linearGradient id="shieldBg3D" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#0a0f1d" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id="shieldBorder3D" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="shieldGloss3D" x1="0" y1="0" x2="36" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>

          {/* Column 1: Historical DCF Pillar (Front / Smallest) */}
          <linearGradient id="p1Top" x1="7" y1="23" x2="17" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="p1Left" x1="7" y1="24" x2="12" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="p1Right" x1="12" y1="27" x2="17" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0c4a6e" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>

          {/* Column 2: Forecast DCF Pillar (Mid / Medium) */}
          <linearGradient id="p2Top" x1="16" y1="16" x2="26" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="p2Left" x1="16" y1="17" x2="21" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="p2Right" x1="21" y1="20" x2="26" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* Column 3: Terminal Value Monolith (Back / Tallest) */}
          <linearGradient id="p3Top" x1="25" y1="9" x2="35" y2="13" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
          <linearGradient id="p3Left" x1="25" y1="10" x2="30" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="p3Right" x1="30" y1="13" x2="35" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* 3D Kinetic Growth Ribbon Curve */}
          <linearGradient id="ribbon3D" x1="6" y1="28" x2="38" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          {/* Apex 3D Diamond / Star Facets */}
          <linearGradient id="diamondTop" x1="36" y1="3" x2="41" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
          <linearGradient id="diamondLeft" x1="34" y1="8" x2="39" y2="13" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="diamondRight" x1="39" y1="8" x2="44" y2="13" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Holographic Glow Filters */}
          <filter id="neon3DGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="apexNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Base 3D Glass Shield with Metallic Bevel Rim */}
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="12"
          fill="url(#shieldBg3D)"
          stroke="url(#shieldBorder3D)"
          strokeWidth="1.5"
        />

        {/* 2. Glassmorphic Specular Highlight Sheen */}
        <path
          d="M 2 13 C 2 7, 7 2, 13 2 L 35 2 C 22 8, 10 18, 2 33 Z"
          fill="url(#shieldGloss3D)"
          className="pointer-events-none"
        />

        {/* 3. 3D Isometric Floor Grid Floor Reflection Lines */}
        <line x1="8" y1="39" x2="40" y2="39" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
        <line x1="12" y1="34" x2="36" y2="34" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />

        {/* 4. PILLAR 1: Historical DCF Cash Flow (Isometric Left) */}
        <g id="pillar-1">
          {/* Top Face */}
          <polygon points="12,23 17,21 21,23 16,25" fill="url(#p1Top)" />
          {/* Left / Key Face */}
          <polygon points="12,23 16,25 16,39 12,37" fill="url(#p1Left)" />
          {/* Right / Shadow Face */}
          <polygon points="16,25 21,23 21,37 16,39" fill="url(#p1Right)" />
          {/* Pillar Highlight Edge */}
          <line x1="16" y1="25" x2="16" y2="39" stroke="#7dd3fc" strokeWidth="0.8" opacity="0.8" />
        </g>

        {/* 5. PILLAR 2: 5-Year Forecast DCF Cash Flow (Isometric Center) */}
        <g id="pillar-2">
          {/* Top Face */}
          <polygon points="20,16 25,14 29,16 24,18" fill="url(#p2Top)" />
          {/* Left / Key Face */}
          <polygon points="20,16 24,18 24,39 20,37" fill="url(#p2Left)" />
          {/* Right / Shadow Face */}
          <polygon points="24,18 29,16 29,37 24,39" fill="url(#p2Right)" />
          {/* Pillar Highlight Edge */}
          <line x1="24" y1="18" x2="24" y2="39" stroke="#67e8f9" strokeWidth="0.8" opacity="0.9" />
        </g>

        {/* 6. PILLAR 3: Terminal Value Monolith (Isometric Right) */}
        <g id="pillar-3">
          {/* Top Face */}
          <polygon points="28,9 33,7 37,9 32,11" fill="url(#p3Top)" />
          {/* Left / Key Face */}
          <polygon points="28,9 32,11 32,39 28,37" fill="url(#p3Left)" />
          {/* Right / Shadow Face */}
          <polygon points="32,11 37,9 37,37 32,39" fill="url(#p3Right)" />
          {/* Pillar Highlight Edge */}
          <line x1="32" y1="11" x2="32" y2="39" stroke="#a7f3d0" strokeWidth="0.8" opacity="0.9" />
        </g>

        {/* 7. 3D Kinetic Momentum Ribbon Curve (Shadow + Glow) */}
        {/* Soft Drop Shadow on Pillars */}
        <path
          d="M 9 29 C 16 27, 24 20, 39 8"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Glowing Trajectory Arc */}
        <path
          d="M 9 27 C 16 25, 24 18, 38 7"
          stroke="url(#ribbon3D)"
          strokeWidth="2.8"
          strokeLinecap="round"
          filter="url(#neon3DGlow)"
        />
        <path
          d="M 9 27 C 16 25, 24 18, 38 7"
          stroke="#ffffff"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* 8. Apex 3D Diamond / Target Node (Floating Gemstone) */}
        <g id="apex-3d-diamond" filter="url(#apexNodeGlow)">
          {/* Upper Apex Face */}
          <polygon points="38,2.5 42,6.5 38,7.5 34,6.5" fill="url(#diamondTop)" />
          {/* Left Facet */}
          <polygon points="34,6.5 38,7.5 38,12.5" fill="url(#diamondLeft)" />
          {/* Right Facet */}
          <polygon points="38,7.5 42,6.5 38,12.5" fill="url(#diamondRight)" />
          {/* Crystal Specular Sparkle */}
          <circle cx="38" cy="7" r="1.4" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Full Brand Lockup with 3D Logo and Typography
 */
export function Logo({
  size = "md",
  showText = true,
  showBadge = true,
  className = "",
  onClick,
}: LogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={`group flex items-center gap-2.5 sm:gap-3 transition-all duration-200 hover:opacity-95 select-none ${className}`}
      title="QuantDCF India — Institutional Valuation & Equity Research"
    >
      <LogoIcon size={size} />

      {showText && (
        <div className="flex flex-col min-w-0 leading-none">
          <div className="flex items-center gap-1.5">
            <span className="font-black tracking-tight text-slate-900 dark:text-white text-sm sm:text-base font-sans drop-shadow-sm">
              Quant
              <span className="bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                DCF
              </span>
            </span>
            {showBadge && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono tracking-wider uppercase bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-emerald-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 shadow-[0_1px_4px_rgba(14,165,233,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse inline-block" />
                <span>IN</span>
              </span>
            )}
          </div>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase hidden sm:block mt-0.5 font-semibold">
            EQUITY RESEARCH v1.0
          </span>
        </div>
      )}
    </Link>
  );
}

/**
 * Showcase 3D Emblem for Hero Dashboard & Landing Highlights
 */
export function LogoHeroBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center gap-3.5 p-2 pr-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-sky-500/30 shadow-[0_8px_30px_rgba(14,165,233,0.2)] backdrop-blur-xl ${className}`}
    >
      <LogoIcon size="lg" />
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
            3D QUANT ENGINE
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
            NSE LIVE
          </span>
        </div>
        <span className="text-sm font-extrabold text-white font-sans tracking-tight">
          Quant<span className="text-sky-400">DCF</span> Institutional Valuation
        </span>
      </div>
    </div>
  );
}
