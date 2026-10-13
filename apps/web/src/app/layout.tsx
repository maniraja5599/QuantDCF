import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuantDCF India — Institutional DCF Valuation Platform",
  description:
    "Production-ready DCF Equity Research Platform for Indian Equities with verified exchange filings, rigorous WACC modeling, and sensitivity analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#080c16] text-slate-100 min-h-screen antialiased`}>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 min-w-0">
            <Navbar />
            <main className="ml-64 p-8 min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
