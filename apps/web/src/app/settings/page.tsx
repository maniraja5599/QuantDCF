"use client";

import { useState } from "react";
import { Settings, Sliders, Database, CheckCircle, Info, Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState("INR");
  const [reportingUnit, setReportingUnit] = useState("crore");
  const [defaultRiskFreeRate, setDefaultRiskFreeRate] = useState("7.10");
  const [defaultERP, setDefaultERP] = useState("6.50");
  const [defaultTaxRate, setDefaultTaxRate] = useState("25.17");
  const [defaultTerminalG, setDefaultTerminalG] = useState("5.00");
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-400" />
          Platform Settings & Benchmarks
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure default reporting currency, macroeconomic benchmarks, display appearance, and DCF calculation defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Appearance & Color Scheme */}
        <div className="bg-[#111726] border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Sun className="w-4 h-4 text-sky-400" />
            Display Appearance & Theme
          </h3>
          <p className="text-xs text-slate-400">
            Choose your preferred color theme for high-contrast equity modeling and comfortable reading.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "dark", label: "Dark Theme", desc: "Institutional Bloomberg dark mode", icon: Moon },
              { id: "light", label: "Light Theme", desc: "Clean, high-contrast crisp day mode", icon: Sun },
              { id: "system", label: "System Sync", desc: "Follow OS preference automatically", icon: Laptop },
            ].map((item) => {
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id as any)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-sky-500/15 border-sky-500 text-sky-400 shadow-md ring-1 ring-sky-500/30"
                      : "bg-[#0c1220] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <item.icon className={`w-5 h-5 ${isSelected ? "text-sky-400" : "text-slate-400"}`} />
                    {isSelected && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {/* Currency & Units */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg space-y-4 transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Reporting Currency & Units
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0c1220] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-sky-500 focus:outline-none font-medium"
              >
                <option value="INR">Indian Rupee (INR - ₹)</option>
                <option value="USD">United States Dollar (USD - $)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Financial Statement Unit</label>
              <select
                value={reportingUnit}
                onChange={(e) => setReportingUnit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0c1220] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-sky-500 focus:outline-none font-medium"
              >
                <option value="crore">Crores (₹ 10,000,000)</option>
                <option value="lakh">Lakhs (₹ 100,000)</option>
                <option value="million">Millions</option>
                <option value="billion">Billions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Macroeconomic Defaults */}
        <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg space-y-4 transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Macroeconomic Valuation Defaults (Indian Equities)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Default Risk-Free Rate (%)</label>
              <input
                type="number"
                step="0.05"
                value={defaultRiskFreeRate}
                onChange={(e) => setDefaultRiskFreeRate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0c1220] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Benchmark: 10Y Indian Government Securities yield (~7.10%)</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Equity Risk Premium (ERP %)</label>
              <input
                type="number"
                step="0.1"
                value={defaultERP}
                onChange={(e) => setDefaultERP(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0c1220] border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Benchmark: Long-term historical Indian market ERP (~6.50%)</span>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Standard Corporate Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(e.target.value)}
                className="w-full bg-[#0c1220] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">India Section 115BAA: 22% base + 10% surcharge + 4% cess = 25.17%</span>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Perpetual Terminal Growth Cap (%)</label>
              <input
                type="number"
                step="0.25"
                value={defaultTerminalG}
                onChange={(e) => setDefaultTerminalG(e.target.value)}
                className="w-full bg-[#0c1220] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-sky-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Sustainable long-term nominal Indian GDP growth anchor (4.5% - 6.0%)</span>
            </div>
          </div>
        </div>

        {savedAlert && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Platform defaults updated successfully.</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 py-2 rounded-lg text-xs transition-colors shadow-lg shadow-sky-500/20"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
