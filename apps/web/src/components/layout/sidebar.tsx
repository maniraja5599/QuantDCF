"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Calculator,
  Bookmark,
  FileText,
  Database,
  Settings,
  TrendingUp,
  ShieldAlert,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Instagram,
} from "lucide-react";
import { Logo, LogoIcon } from "@/components/ui/logo";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Company Screener", href: "/screener", icon: Search },
  { name: "Valuation Terminal", href: "/valuation/TCS", icon: Calculator },
  { name: "Saved Valuations", href: "/saved", icon: Bookmark },
  { name: "Research Reports", href: "/reports", icon: FileText },
  { name: "Data Sources & MCP", href: "/sources", icon: Database },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  // 1. Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // 2. Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const renderNavContent = (collapsed: boolean) => (
    <div className="flex flex-col h-full bg-[#0d1322] border-r border-slate-800 select-none">
      {/* Brand Header */}
      {collapsed ? (
        <div className="h-16 flex flex-col items-center justify-center border-b border-slate-800 px-2 relative">
          <Link
            href="/"
            onClick={handleLinkClick}
            suppressHydrationWarning
            title="QuantDCF India — Institutional Valuation"
            className="flex items-center justify-center p-1 rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <LogoIcon size="md" />
          </Link>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Logo size="md" onClick={handleLinkClick} />

          {/* Desktop Collapse Toggle Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              aria-label="Collapse navigation sidebar"
              title="Collapse Sidebar (Ctrl+B)"
              className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Close Button - 44px Touch Target with Smooth Feedback */}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-transform duration-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* When collapsed on desktop, show expand button under header */}
      {collapsed && onToggleCollapse && (
        <div className="pt-2 px-2 flex justify-center">
          <button
            onClick={onToggleCollapse}
            aria-label="Expand navigation sidebar"
            title="Expand Sidebar (Ctrl+B)"
            className="w-10 h-8 flex items-center justify-center rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 border border-sky-500/20 transition-all"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className={`flex-1 ${collapsed ? "px-2 py-3" : "px-3 py-4"} space-y-1.5 overflow-y-auto overscroll-contain`}>
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Terminal Navigation
          </div>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href.split("/")[1] ? `/${item.href.split("/")[1]}` : item.href);

          return (
            <div key={item.name} className="relative group">
              <Link
                href={item.href}
                onClick={handleLinkClick}
                suppressHydrationWarning
                className={`flex items-center ${
                  collapsed ? "justify-center p-3" : "gap-3 px-3.5 py-3"
                } rounded-xl text-xs font-medium transition-all duration-200 active:scale-[0.97] relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent text-sky-300 border border-sky-500/30 font-semibold shadow-sm shadow-sky-500/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 hover:translate-x-0.5"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-sky-400 rounded-r-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                )}
                <item.icon
                  className={`${collapsed ? "w-5 h-5" : "w-4 h-4"} shrink-0 transition-all duration-200 group-hover:scale-115 group-hover:-translate-y-0.5 ${
                    isActive ? "text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]" : "text-slate-400 group-hover:text-sky-300"
                  }`}
                />
                {!collapsed && (
                  <span className="truncate transition-colors duration-200 group-hover:text-slate-100">
                    {item.name}
                  </span>
                )}
              </Link>

              {/* Floating Tooltip Pill for Collapsed Mode (ItsHover Style) */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-slate-900/95 backdrop-blur-md text-slate-100 text-[11px] font-medium rounded-lg shadow-2xl border border-slate-700/80 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-50 whitespace-nowrap flex items-center gap-1.5">
                  <span>{item.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Licensing Compliance Status Footer */}
      <div className={`${collapsed ? "p-2" : "p-3"} border-t border-slate-800 bg-[#090e18]`}>
        {collapsed ? (
          <div className="space-y-2 flex flex-col items-center">
            <div
              title="NSE MCP Gate: Active - Audited filings verified"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400"
            >
              <ShieldAlert className="w-4 h-4" />
            </div>

            {/* Developer Icon (Collapsed) */}
            <a
              href="https://www.instagram.com/maniraja__/"
              target="_blank"
              rel="noopener noreferrer"
              title="Developed by Maniraja (@maniraja__)"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-amber-500/15 border border-pink-500/30 text-pink-400 hover:text-pink-300 hover:border-pink-500/60 hover:scale-105 active:scale-95 transition-all shadow-sm group"
            >
              <Instagram className="w-4 h-4 text-pink-400 group-hover:rotate-12 transition-transform duration-200" />
            </a>
          </div>
        ) : (
          <div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>NSE MCP Gate: Active</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Data policy compliance enforced. Audited filings verified.
              </p>
            </div>

            {/* Developer Badge (Expanded) - Alaga kutty a */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-800/70 flex items-center justify-between gap-1.5 px-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10.5px] text-slate-400 font-medium truncate">
                  Dev by <strong className="text-slate-200 font-semibold">Maniraja</strong>
                </span>
              </div>

              <a
                href="https://www.instagram.com/maniraja__/"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram: @maniraja__"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 text-pink-400 border border-pink-500/30 hover:border-pink-500/60 hover:text-pink-300 hover:scale-105 active:scale-95 transition-all shrink-0 group"
              >
                <Instagram className="w-2.5 h-2.5 text-pink-400 group-hover:rotate-12 transition-transform duration-200" />
                <span className="font-mono text-[9.5px]">@maniraja__</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (Smooth width collapse from w-64 to w-16) */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {renderNavContent(isCollapsed)}
      </aside>

      {/* 2. Mobile Butter-Smooth Off-Canvas Drawer (Persistent DOM with Hardware-Accelerated Transforms) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
        }`}
      >
        {/* Backdrop Blur Overlay with Smooth Fade */}
        <div
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        />

        {/* Drawer Menu Panel with iOS/Material Spring-Decel Curve */}
        <aside
          className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] h-full z-10 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {renderNavContent(false)}
        </aside>
      </div>
    </>
  );
}
