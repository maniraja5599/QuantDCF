# Vercel Deployment Guide: Next.js Frontend

This guide covers deploying the frontend application (`apps/web`) to **Vercel** from the monorepo.

---

## 1. Prerequisites

- A GitHub repository containing the monorepo codebase.
- A Vercel account ([vercel.com](https://vercel.com)).
- The deployed URL of your FastAPI backend (e.g. on Railway, Render, or Fly.io).

---

## 2. Project Import & Configuration in Vercel

1. In the Vercel Dashboard, click **Add New...** -> **Project**.
2. Select your connected GitHub repository.
3. Under **Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select:
     ```text
     apps/web
     ```
   - **Build Command**: `npm run build` (or leave default Next.js build command)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

---

## 3. Environment Variables Configuration

In the Vercel project settings under **Environment Variables**, add the following:

| Variable Name | Environment | Example Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Production, Preview | `https://your-api.up.railway.app` | Base URL of the deployed FastAPI backend |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | `https://xyz.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | `eyJhbGci...` | Supabase anonymous public client key |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Production, Preview | `INR` | Default reporting currency display |

> [!IMPORTANT]
> Do NOT set backend service-role keys or database passwords as `NEXT_PUBLIC_` variables in Vercel. Keep sensitive credentials strictly inside the backend hosting provider environment.

---

## 4. Deployment Verification

After clicking **Deploy**:
1. Check the build logs to confirm that all 10 static and dynamic routes compile successfully.
2. Visit the assigned Vercel URL (e.g. `https://your-app.vercel.app`).
3. Verify that the company search bar auto-completes symbols and that the valuation terminal fetches live DCF calculations from the backend API.
