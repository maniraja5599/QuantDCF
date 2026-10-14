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
 * Official 3D Financial Growth Emblem Logo Icon for QuantDCF India
 * Renders the uploaded official high-definition 3D blue and emerald upward trajectory emblem
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
      ? 24
      : size === "sm"
      ? 30
      : size === "lg"
      ? 48
      : size === "xl"
      ? 64
      : 36;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group select-none transition-transform duration-300 hover:scale-105 active:scale-95 ${className}`}
      style={{ width: dim, height: dim }}
    >
      {/* 3D Ambient Drop Glow / Underlight */}
      <div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500/35 via-cyan-400/25 to-emerald-400/35 blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />

      {/* Official 3D Logo Image */}
      <img
        src="/logo.png"
        alt="QuantDCF Logo"
        width={dim}
        height={dim}
        className="relative z-10 w-full h-full object-contain drop-shadow-[0_4px_14px_rgba(14,165,233,0.4)]"
      />
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
      className={`relative inline-flex items-center gap-3.5 p-2.5 pr-5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-[#0e1628]/90 to-slate-950/95 border border-sky-500/30 shadow-[0_8px_30px_rgba(14,165,233,0.25)] backdrop-blur-xl hover-lift group ${className}`}
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
