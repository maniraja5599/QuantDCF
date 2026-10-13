# Supabase Database & Authentication Setup Guide

This guide covers setting up the PostgreSQL database schema, Row Level Security (RLS) policies, and Supabase Auth integration.

---

## 1. Create a Supabase Project

1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. Select your preferred AWS Region (e.g., `ap-south-1` Mumbai for low latency to Indian markets).
3. Securely record your **Database Password**.

---

## 2. Execute Database Migrations

1. In your Supabase Dashboard, navigate to the **SQL Editor**.
2. Click **New Query**.
3. Copy and paste the entire contents of:
   ```text
   database/migrations/001_initial_schema.sql
   ```
4. Click **Run**.
5. The migration creates:
   - `companies` table (with symbols, sectors, ISINs).
   - `financial_statements` table (with fiscal metrics, audited status, source references).
   - `user_valuations` table (with model inputs, outputs, and intrinsic values).
   - `assumption_audit_logs` table (with override histories).
   - Active **Row Level Security (RLS)** policies on all tables.

---

## 3. Verify Row Level Security (RLS) Policies

Navigate to **Authentication** -> **Policies** in Supabase and confirm:
- `companies` & `financial_statements` have `SELECT` policies enabled for public/authenticated reads.
- `user_valuations` enforces:
  - `SELECT`: `(auth.uid() = user_id OR is_public = true)`
  - `INSERT`: `(auth.uid() = user_id)`
  - `UPDATE`: `(auth.uid() = user_id)`
  - `DELETE`: `(auth.uid() = user_id)`
- Users cannot read or manipulate valuations belonging to other users.

---

## 4. Retrieve Credentials

Navigate to **Project Settings** -> **API**:
- **Project URL**: Use for `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`.
- **anon public key**: Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **service_role secret**: Use for backend server only `SUPABASE_SERVICE_ROLE_KEY`.

Navigate to **Project Settings** -> **Database**:
- Copy the **Connection string (Transaction pooler or URI)** for `DATABASE_URL`.
