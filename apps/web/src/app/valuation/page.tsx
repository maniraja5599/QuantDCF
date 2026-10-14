"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ValuationIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/valuation/TCS");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-sky-400">
      <Loader2 className="w-10 h-10 animate-spin" />
      <span className="text-sm font-semibold tracking-wider font-mono uppercase">
        Loading Valuation Terminal...
      </span>
    </div>
  );
}
