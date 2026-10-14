import {
  Company,
  MarketQuote,
  HistoricalStatement,
  DCFCalculationInput,
  DCFCalculationOutput,
  WACCAssumptions,
  SensitivityMatrix,
  ScenarioResult,
  ProviderStatus,
  SavedValuation,
  PeerCompsResponse,
  BFSIValuationInput,
  BFSIValuationOutput,
  SOTPValuationInput,
  SOTPValuationOutput,
} from "./types";

// In browser context (mobile or desktop), use relative path so Next.js proxies all /api requests to FastAPI backend.
// In SSR context, use process.env.NEXT_PUBLIC_API_BASE_URL or fallback to http://127.0.0.1:8000.
const API_BASE =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_BASE_URL || "";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let errMsg = `API error: ${res.status} ${res.statusText}`;
      try {
        const json = await res.json();
        if (json.detail) errMsg = typeof json.detail === "string" ? json.detail : JSON.stringify(json.detail);
      } catch (_) {}
      throw new Error(errMsg);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`Request failed to ${url}:`, err);
    throw err;
  }
}

export const api = {
  // Companies
  searchCompanies: (query: string): Promise<Company[]> =>
    request<Company[]>(`/api/companies/search?q=${encodeURIComponent(query)}`),

  getCompanyProfile: (symbol: string): Promise<Company> =>
    request<Company>(`/api/companies/${encodeURIComponent(symbol)}`),

  getCompany: (symbol: string): Promise<Company> =>
    request<Company>(`/api/companies/${encodeURIComponent(symbol)}`),

  getQuote: (symbol: string): Promise<MarketQuote> =>
    request<MarketQuote>(`/api/companies/${encodeURIComponent(symbol)}/quote`),

  getNiftyQuote: (): Promise<{
    symbol: string;
    current_price: number;
    change: number;
    percent_change: number;
    day_high?: number;
    day_low?: number;
    timestamp: string;
    source: string;
    is_live: boolean;
  }> => request("/api/companies/indices/nifty"),

  getMarketLeaders: (): Promise<Array<{
    s: string;
    price: number;
    change: number;
    p_change: number;
    type: "index" | "stock";
    is_live: boolean;
  }>> => request("/api/companies/indices/leaders"),

  // Financial Statements
  getHistoricalFinancials: (symbol: string): Promise<HistoricalStatement[]> =>
    request<HistoricalStatement[]>(`/api/financials/${encodeURIComponent(symbol)}/historical`),

  uploadStatement: async (file: File): Promise<HistoricalStatement[]> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/financials/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Statement upload failed");
    }
    return await res.json();
  },

  // DCF Engine
  calculateDCF: (payload: DCFCalculationInput): Promise<DCFCalculationOutput> =>
    request<DCFCalculationOutput>("/api/valuation/calculate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  calculateWACC: (payload: WACCAssumptions): Promise<{ effective_wacc_pct: number; details: any }> =>
    request("/api/valuation/wacc", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  calculateSensitivity: (payload: DCFCalculationInput): Promise<SensitivityMatrix> =>
    request<SensitivityMatrix>("/api/valuation/sensitivity", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  calculateScenarios: (payload: DCFCalculationInput): Promise<ScenarioResult[]> =>
    request<ScenarioResult[]>("/api/valuation/scenarios", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Peer Comps & Multiples
  getPeerComps: (symbol: string, params?: { eps?: number; ebit?: number; revenue?: number }): Promise<PeerCompsResponse> => {
    const q = new URLSearchParams();
    if (params?.eps) q.append("eps", params.eps.toString());
    if (params?.ebit) q.append("ebit", params.ebit.toString());
    if (params?.revenue) q.append("revenue", params.revenue.toString());
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<PeerCompsResponse>(`/api/valuation/peers/${encodeURIComponent(symbol)}${qs}`);
  },

  // BFSI Banking Valuation
  calculateBFSI: (payload: BFSIValuationInput): Promise<BFSIValuationOutput> =>
    request<BFSIValuationOutput>("/api/valuation/bfsi", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Sum-of-the-Parts (SOTP) Valuation
  calculateSOTP: (payload: SOTPValuationInput): Promise<SOTPValuationOutput> =>
    request<SOTPValuationOutput>("/api/valuation/sotp", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Data Sources & Compliance
  listSources: (): Promise<ProviderStatus[]> =>
    request<ProviderStatus[]>("/api/sources/list"),

  getSourcesHealth: (): Promise<any> =>
    request<any>("/api/sources/health"),

  // Reports
  generateReport: (payload: any): Promise<any> =>
    request<any>("/api/reports/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Saved Valuations
  listSavedValuations: (): Promise<SavedValuation[]> =>
    request<SavedValuation[]>("/api/saved"),

  getSavedValuation: (id: string): Promise<SavedValuation> =>
    request<SavedValuation>(`/api/saved/${id}`),

  saveValuation: (payload: any): Promise<SavedValuation> =>
    request<SavedValuation>("/api/saved", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteSavedValuation: (id: string): Promise<{ success: boolean }> =>
    request(`/api/saved/${id}`, {
      method: "DELETE",
    }),
};
