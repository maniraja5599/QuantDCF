-- ==============================================================================
-- DCF Valuation Platform - Supabase PostgreSQL Schema & RLS Policies
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Companies / Instruments Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    exchange VARCHAR(20) NOT NULL DEFAULT 'NSE',
    isin VARCHAR(30),
    sector VARCHAR(100),
    industry VARCHAR(100),
    reporting_currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    reporting_unit VARCHAR(20) NOT NULL DEFAULT 'crore',
    has_audited_filings BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on symbol for instant ticker lookup
CREATE INDEX IF NOT EXISTS idx_companies_symbol ON public.companies(symbol);

-- 3. Historical Financial Statements Table
CREATE TABLE IF NOT EXISTS public.financial_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_symbol VARCHAR(30) NOT NULL REFERENCES public.companies(symbol) ON DELETE CASCADE,
    fiscal_year INT NOT NULL,
    fiscal_period VARCHAR(20) NOT NULL,
    revenue NUMERIC(18, 4) NOT NULL,
    operating_expenses NUMERIC(18, 4) NOT NULL,
    ebit NUMERIC(18, 4) NOT NULL,
    ebit_margin_pct NUMERIC(8, 4) NOT NULL,
    tax_expense NUMERIC(18, 4) NOT NULL,
    effective_tax_rate_pct NUMERIC(8, 4) NOT NULL,
    depreciation_amortization NUMERIC(18, 4) NOT NULL,
    capex NUMERIC(18, 4) NOT NULL,
    working_capital NUMERIC(18, 4) NOT NULL,
    change_in_nwc NUMERIC(18, 4) NOT NULL,
    cash_and_equivalents NUMERIC(18, 4) NOT NULL,
    total_debt NUMERIC(18, 4) NOT NULL,
    minority_interest NUMERIC(18, 4) NOT NULL DEFAULT 0,
    diluted_shares NUMERIC(18, 4) NOT NULL,
    provenance VARCHAR(30) NOT NULL CHECK (provenance IN ('AUDITED', 'REPORTED', 'ESTIMATED', 'USER_ENTERED')),
    source_document TEXT,
    source_url TEXT,
    retrieval_timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_company_fiscal_period UNIQUE (company_symbol, fiscal_year)
);

-- 4. User Valuations Table (Protected by Supabase Auth & RLS)
CREATE TABLE IF NOT EXISTS public.user_valuations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company_symbol VARCHAR(30) NOT NULL,
    valuation_model_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    model_inputs JSONB NOT NULL,
    model_outputs JSONB NOT NULL,
    calculated_intrinsic_value NUMERIC(18, 4) NOT NULL,
    market_price_at_calc NUMERIC(18, 4),
    implied_upside_downside_pct NUMERIC(8, 4),
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_valuations_user_id ON public.user_valuations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_valuations_symbol ON public.user_valuations(company_symbol);

-- 5. Assumption Overrides & Audit Log Table
CREATE TABLE IF NOT EXISTS public.assumption_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    valuation_id UUID REFERENCES public.user_valuations(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    original_value NUMERIC(18, 4),
    overridden_value NUMERIC(18, 4) NOT NULL,
    justification_reason TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on user tables
ALTER TABLE public.user_valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assumption_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_statements ENABLE ROW LEVEL SECURITY;

-- 1. Public reference tables are readable by all authenticated & anonymous users
CREATE POLICY "Public companies viewable by everyone"
    ON public.companies FOR SELECT
    USING (true);

CREATE POLICY "Financial statements viewable by everyone"
    ON public.financial_statements FOR SELECT
    USING (true);

-- 2. User Valuations RLS:
-- Users can only read their own valuations or valuations marked public
CREATE POLICY "Users can view own valuations or public valuations"
    ON public.user_valuations FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

-- Users can only insert their own valuations
CREATE POLICY "Users can create own valuations"
    ON public.user_valuations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only update their own valuations
CREATE POLICY "Users can update own valuations"
    ON public.user_valuations FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can only delete their own valuations
CREATE POLICY "Users can delete own valuations"
    ON public.user_valuations FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Audit Logs RLS:
CREATE POLICY "Users can view audit logs for accessible valuations"
    ON public.assumption_audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_valuations v
            WHERE v.id = assumption_audit_logs.valuation_id
            AND (v.user_id = auth.uid() OR v.is_public = true)
        )
    );

CREATE POLICY "Users can insert audit logs for own valuations"
    ON public.assumption_audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);
