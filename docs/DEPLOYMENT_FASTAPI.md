# FastAPI Backend Deployment Guide (Railway / Render / Docker)

This guide covers deploying the Python FastAPI calculation engine (`services/api`) to container-compatible hosting platforms such as **Railway**, **Render**, or a standalone Docker host.

---

## 1. Option A: Railway Deployment (Recommended)

1. Connect your GitHub repository to Railway ([railway.app](https://railway.app)).
2. Create a new service pointing to the repository.
3. In **Settings**:
   - **Root Directory**: `.` (or specify `/` so the build context includes `services/api`)
   - **Dockerfile Path**: `services/api/Dockerfile`
4. In **Variables**, configure:
   ```env
   ENVIRONMENT=production
   PORT=8000
   HOST=0.0.0.0
   CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
   NSE_DATA_LICENSE_APPROVED=false
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   DATABASE_URL=postgresql://postgres:...@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
5. Railway will automatically build the container and provide a public URL like `https://api-dcf.up.railway.app`.

---

## 2. Option B: Render Deployment

1. Create a **New Web Service** on Render ([render.com](https://render.com)).
2. Select your repository.
3. Select **Docker** environment:
   - **Dockerfile Path**: `services/api/Dockerfile`
   - **Context**: `.`
4. In the Render Environment Variables tab, paste the required variables listed above.
5. In **Health Check Path**, enter: `/health`.

---

## 3. Option C: Local / VPS Docker Compose

To run the entire system on a VPS using Docker:

```bash
# Clone the repository
git clone https://github.com/your-username/dcf-valuation-platform.git
cd dcf-valuation-platform

# Copy environment template
cp .env.example .env

# Build and start all services
docker compose up -d --build

# Verify container health
docker compose ps
curl http://localhost:8000/health
```

---

## 4. Health Check & Verification

Once deployed, query the health check endpoint:

```bash
curl https://your-backend-api.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "dcf-valuation-api",
  "version": "1.0.0",
  "environment": "production",
  "providers": {
    "nse_mcp": {
      "status": "RESTRICTED",
      "licensed": false,
      "message": "NSE MCP provider is locked by compliance gate..."
    },
    "fundamental_disclosures": {
      "status": "ONLINE",
      "licensed": true,
      "verified_symbols_count": 2
    }
  }
}
```
