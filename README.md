# QuantDCF India — Production-Ready DCF Valuation Platform

[![CI Pipeline](https://github.com/your-username/dcf-valuation-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/dcf-valuation-platform/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg?logo=supabase&logoColor=white)](https://supabase.com)
[![License Compliance](https://img.shields.io/badge/NSE%20Data%20Policy-Compliance%20Gated-amber.svg)](docs/NSE_DATA_LICENSING.md)

An institutional-grade **Discounted Cash Flow (DCF) Equity Valuation Platform** engineered specifically for Indian equities listed on the **National Stock Exchange (NSE)** and **Bombay Stock Exchange (BSE)**. Built with Next.js 14, Python FastAPI, audited financial statements normalization, official NSE Model Context Protocol (MCP) gateway integration, and Supabase Row Level Security.

---

## 1. Key Architectural Features

- **Mathematical DCF Engine**: Pure, isolated Python calculation module computing FCFF (Free Cash Flow to Firm), NOPAT, CapEx, $\Delta$NWC, Gordon Growth terminal value, enterprise-to-equity bridge, and diluted share intrinsic value.
- **WACC & CAPM Modeling**: Integrated 10-Year Indian Government Securities (G-Sec) risk-free rate ($\sim$7.10%), Indian Equity Risk Premium ($\sim$6.50%), levered beta, pre-tax cost of debt, corporate tax rate (25.17%), capital structure weighting, and audited manual overrides.
- **2D Sensitivity Matrix**: Interactive $7 \times 7$ matrix calculating intrinsic values across WACC discount rates and perpetual terminal growth rates ($g$), with strict rejection of mathematically invalid scenarios ($WACC \le g$).
- **Scenario Analysis**: Dynamic Bull, Base, and Bear cases with differentiated revenue CAGRs, operating leverage margins, and risk premiums.
- **Real Financial Data & Zero-Fabrication Guarantee**: No random numbers or fabricated demo valuations. Historical financials are ingested directly from audited annual reports filed with BSE/NSE with document provenance and timestamps.
- **Official NSE MCP Protocol Integration**: Integrates directly with official NSE MCP endpoints (`cmmkt` and `bhavcopy`) using JSON-RPC 2.0 tool discovery, guarded by an automated licensing gate (`NSE_DATA_LICENSE_APPROVED`).
- **Statement Document Parser**: Ingestion engine for user-uploaded CSV and Excel (`.xlsx`) balance sheets and P&L statements.
- **Institutional Financial Terminal UI**: Refined financial terminal theme with custom Indian currency formatters (₹, Crore, Lakh), Recharts valuation bridge and cash flow trajectory charts, print-ready institutional research memoranda, and responsive layouts.
- **Audited Mathematical Transparency**: Step-by-step formula disclosure panel displaying exact equations for every valuation component.
- **Supabase PostgreSQL with RLS**: Complete database schema and Row Level Security policies ensuring privacy of user valuations.

---

## 2. Monorepo Structure

```text
dcf-valuation-platform/
├── apps/
│   └── web/                     # Next.js 14 (App Router) frontend
│       ├── src/
│       │   ├── app/             # Dashboard, Screener, Valuation [symbol], Saved, Reports, Sources, Settings
│       │   ├── components/      # UI components, layout, DCF tables, sensitivity matrix, Recharts charts
│       │   └── lib/             # Formatters (INR/Crore/Lakh), API client, types
├── services/
│   └── api/                     # Python FastAPI calculation engine
│       ├── app/
│       │   ├── engine/          # DCF, WACC, sensitivity & scenario engines
│       │   ├── providers/       # NSE MCP client, Audited filings, CSV/XLSX parser
│       │   └── routers/         # REST APIs: companies, financials, valuation, sources, reports, saved
│       ├── main.py              # FastAPI entrypoint with CORS & health check
│       ├── requirements.txt     # Python backend dependencies
│       └── Dockerfile           # Production container configuration
├── packages/
│   └── shared/                  # Common TypeScript types & Indian macro constants
├── database/
│   └── migrations/              # Supabase PostgreSQL schema with Row Level Security (RLS)
├── tests/
│   └── backend/                 # Automated pytest suite (DCF engine, WACC, sensitivity, APIs)
├── docs/                        # Complete architecture, deployment, methodology & licensing guides
├── .github/workflows/           # Automated CI testing & build pipeline
├── docker-compose.yml           # Unified multi-container orchestration
├── .env.example                 # Documented environment variables template
└── README.md                    # Setup and deployment documentation
```

---

## 3. Local Setup & Quickstart

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/dcf-valuation-platform.git
cd dcf-valuation-platform
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

### 3. Backend Setup (FastAPI)
```bash
cd services/api
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI documentation is available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 4. Frontend Setup (Next.js)
In a new terminal window:
```bash
cd apps/web
npm install
npm run dev
```
The web application is available at [http://localhost:3000](http://localhost:3000).

---

## 4. Running Automated Tests

Run the backend test suite:
```bash
# From project root:
.\services\api\.venv\Scripts\python -m pytest tests/backend/ -v
```

Run frontend production build verification:
```bash
cd apps/web
npm run build
```

---

## 5. Deployment Instructions

### A. Deploy Frontend to Vercel
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), import the repository.
3. In **Project Settings**:
   - **Root Directory**: Select `apps/web`.
   - **Framework Preset**: `Next.js`.
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://your-api.up.railway.app`
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your-anon-key`
   - `NEXT_PUBLIC_DEFAULT_CURRENCY`: `INR`
5. Click **Deploy**. Detailed instructions are in [docs/DEPLOYMENT_VERCEL.md](docs/DEPLOYMENT_VERCEL.md).

### B. Deploy Backend to Railway or Render
1. Create a service pointing to `services/api/Dockerfile` with root context `.`.
2. Configure environment variables in Railway/Render:
   ```env
   ENVIRONMENT=production
   PORT=8000
   HOST=0.0.0.0
   CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
   NSE_DATA_LICENSE_APPROVED=false
   ```
3. Set health check probe to `/health`. Detailed instructions are in [docs/DEPLOYMENT_FASTAPI.md](docs/DEPLOYMENT_FASTAPI.md).

### C. Deploy Database to Supabase
1. Create a project in [Supabase](https://supabase.com).
2. Run `database/migrations/001_initial_schema.sql` in the Supabase SQL Editor.
3. Confirms that Row Level Security (RLS) is enabled. Detailed instructions are in [docs/DEPLOYMENT_SUPABASE.md](docs/DEPLOYMENT_SUPABASE.md).

---

## 6. Regulatory Disclaimer

This DCF Valuation Platform is designed strictly for educational, analytical, and research purposes. Intrinsic value projections are mathematical estimations derived from reported or user-specified assumptions and do NOT constitute financial advisory opinions, buy/sell recommendations, or guaranteed price targets.
