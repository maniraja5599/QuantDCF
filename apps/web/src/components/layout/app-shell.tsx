"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { CommandPalette } from "./command-palette";
import { PWARegister } from "@/components/pwa-register";
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal";
import { Footer } from "./footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Desktop view: sidebar is strictly ON (open / expanded) by default
  useEffect(() => {
    try {
      const saved = localStorage.getItem("quantdcf_sidebar_user_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      } else {
        // Always ON by default on desktop
        setIsCollapsed(false);
      }
    } catch {
      setIsCollapsed(false);
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("quantdcf_sidebar_user_collapsed", String(next));
      } catch {
        // Ignored
      }
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#080c16] text-slate-100 flex flex-col overflow-x-hidden max-w-[100vw]">
      {/* 1. Sidebar (Desktop Fixed w-64/w-16 + Mobile Off-Canvas Drawer) */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* 2. Main Content & Navbar Wrapper with Smooth Desktop Left Padding Offset */}
      <div
        className={`flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        }`}
      >
        {/* Top Header Navigation */}
        <Navbar
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Main Page Content Container */}
        <main className="flex-1 w-full p-3 sm:p-5 lg:p-6 xl:p-8 pb-12 transition-all min-w-0 overflow-x-hidden">
          {children}
        </main>

        {/* Global Institutional Footer */}
        <Footer />
      </div>

      {/* 3. Mobile Bottom Sticky Navigation Bar */}
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen(true)} />

      {/* 4. Progressive Web App (PWA) Register & Install Prompt */}
      <PWARegister />

      {/* 5. Bloomberg-style Ctrl+K Command Palette */}
      <CommandPalette />

      {/* 6. Institutional Keyboard Shortcuts Modal (?) */}
      <KeyboardShortcutsModal />
    </div>
  );
}
