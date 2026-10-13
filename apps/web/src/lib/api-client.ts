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
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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

  getQuote: (symbol: string): Promise<MarketQuote> =>
    request<MarketQuote>(`/api/companies/${encodeURIComponent(symbol)}/quote`),

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
