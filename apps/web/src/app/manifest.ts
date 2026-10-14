import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QuantDCF India — Institutional DCF Valuation Platform",
    short_name: "QuantDCF",
    description: "Production-ready DCF Equity Research Platform for Indian Equities with verified exchange filings, WACC modeling, and sensitivity analysis.",
    start_url: "/",
    display: "standalone",
    background_color: "#080c16",
    theme_color: "#0b0f1a",
    orientation: "any",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
