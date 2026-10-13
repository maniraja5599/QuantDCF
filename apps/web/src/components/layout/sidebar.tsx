"use client";

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
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Company Screener", href: "/screener", icon: Search },
  { name: "Valuation Terminal", href: "/valuation/TCS", icon: Calculator },
  { name: "Saved Valuations", href: "/saved", icon: Bookmark },
  { name: "Research Reports", href: "/reports", icon: FileText },
  { name: "Data Sources & MCP", href: "/sources", icon: Database },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0d1322] border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-wider text-slate-100 uppercase">
            QuantDCF <span className="text-sky-400">India</span>
          </span>
          <div className="text-[10px] text-slate-400 font-mono tracking-tighter">
            EQUITY RESEARCH v1.0
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Terminal Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href.split("/")[1] ? `/${item.href.split("/")[1]}` : item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Licensing Compliance Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-[#090e18]">
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>NSE MCP Gate: Active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Data policy compliance enforced. Audited filings verified.
          </p>
        </div>
      </div>
    </aside>
  );
}
