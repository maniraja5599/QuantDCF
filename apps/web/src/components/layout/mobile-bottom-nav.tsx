"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Calculator,
  FileText,
  Menu,
} from "lucide-react";

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  const tabs = [
    { name: "Home", href: "/", icon: LayoutDashboard },
    { name: "Screener", href: "/screener", icon: Search },
    { name: "Terminal", href: "/valuation/TCS", icon: Calculator },
    { name: "Reports", href: "/reports", icon: FileText },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800/90 px-3 py-1.5 flex items-center justify-around shadow-xl safe-area-bottom select-none transition-colors"
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href.split("/")[1] ? `/${tab.href.split("/")[1]}` : tab.href);

        return (
          <Link
            key={tab.name}
            href={tab.href}
            suppressHydrationWarning
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-transform duration-100 active:scale-95 ${
              isActive
                ? "text-sky-600 dark:text-sky-300 font-bold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:text-slate-950 dark:active:text-white"
            }`}
          >
            {/* Active Top Glow Pill */}
            {isActive && (
              <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 shadow-[0_0_10px_rgba(56,189,248,0.95)]" />
            )}
            <tab.icon className={`w-5 h-5 mb-0.5 transition-transform duration-100 ${isActive ? "text-sky-600 dark:text-sky-300 dark:drop-shadow-[0_0_6px_rgba(56,189,248,0.8)] scale-105" : "text-slate-500 dark:text-slate-400"}`} />
            <span className={isActive ? "text-sky-700 dark:text-white font-bold" : ""}>{tab.name}</span>
          </Link>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={onOpenMenu}
        aria-label="Open full menu"
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 active:text-slate-950 dark:active:text-white active:scale-95 transition-transform duration-100"
      >
        <Menu className="w-5 h-5 mb-0.5 text-slate-500 dark:text-slate-400" />
        <span>Menu</span>
      </button>
    </nav>
  );
}
