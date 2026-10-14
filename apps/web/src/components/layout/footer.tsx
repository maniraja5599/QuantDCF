"use client";

import Link from "next/link";
import { Instagram, Heart, ShieldCheck } from "lucide-react";
import { LogoIcon } from "@/components/ui/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1220] transition-colors py-6 px-4 sm:px-6 lg:px-8 mt-auto pb-24 lg:pb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        {/* Left: Platform Branding */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
          <Link href="/" className="flex items-center gap-2 group hover:opacity-95 transition-opacity">
            <LogoIcon size="sm" />
            <span className="font-black text-slate-900 dark:text-white tracking-tight text-sm">
              Quant<span className="bg-gradient-to-r from-sky-500 to-emerald-400 bg-clip-text text-transparent">DCF</span>
              <span className="text-slate-500 font-normal text-xs ml-1 font-mono">INDIA</span>
            </span>
          </Link>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            Institutional Equity Research & DCF Valuation Engine
          </span>
        </div>

        {/* Center: Author Credit & Instagram */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium text-[11px]">
            Developed by
            <strong className="text-slate-900 dark:text-slate-100 font-bold ml-0.5">
              Maniraja
            </strong>
          </span>

          {/* Instagram Profile Badge Link */}
          <a
            href="https://www.instagram.com/maniraja__/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Maniraja Instagram Profile"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/30 hover:border-pink-500/60 hover:scale-105 active:scale-95 transition-all shadow-sm group"
          >
            <Instagram className="w-3.5 h-3.5 text-pink-500 group-hover:rotate-12 transition-transform duration-200" />
            <span className="font-mono">@maniraja__</span>
          </a>
        </div>

        {/* Right: Regulatory & Integrity Notice */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>© {currentYear} Audited Ind AS & BSE/NSE Feeds</span>
        </div>
      </div>
    </footer>
  );
}
