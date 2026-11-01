# 🌐 Deploying Bangladeshi News Portal on Render + Neon

This guide provides complete instructions for deploying the **Bangladeshi Online News Portal** on **Render.com** (as the application and cron server) paired with **Neon Serverless PostgreSQL** (as the primary database).

---

## 🏗️ Architecture Overview

```mermaid
flowchart TD
    Readers[Readers / Public Traffic] -->|HTTPS| CloudflareCDN[Cloudflare CDN / R2 Images]
    Readers -->|HTTPS| RenderWeb[Render Web Service: Next.js 16 App Router]
    
    subgraph Render Platform
        RenderWeb
        RenderCron1[Render Cron: Flush Views every 10m]
        RenderCron2[Render Cron: Publish Scheduled every 5m]
    end

    subgraph Data & Storage
        NeonDB[(Neon Serverless PostgreSQL - Singapore)]
        UpstashRedis[(Upstash Redis - Buffer & Rate Limit)]
    end

    RenderWeb -->|HTTP / Pooling| NeonDB
    RenderWeb -->|REST| UpstashRedis
    RenderCron1 -->|cURL + Auth| RenderWeb
    RenderCron2 -->|cURL + Auth| RenderWeb
```

---

## Step 1: Set Up Neon Serverless PostgreSQL

1. Sign up or log into [Neon Console](https://console.neon.tech).
2. Click **Create Project**:
   - **Name**: `bangladeshi-news-portal-prod`
   - **Region**: Choose `AWS ap-southeast-1 (Singapore)` (optimal low latency for Bangladesh readers).
   - **Postgres version**: `16` or `17`.
3. In the connection details widget:
   - Select the **Pooled connection** checkbox (host will include `-pooler`).
   - Copy the connection string:
     ```
     postgresql://neondb_owner:YOUR_PASSWORD@ep-example-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
     ```
4. Push database schema and seed the initial data from your local terminal:
   ```bash
   # Set your Neon connection string in the environment
   export DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-example-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

   # Push all 27 tables directly to Neon
   npm run db:push

   # Seed Bangladesh divisions, districts, editorial categories, and initial news
   npm run db:seed
   ```

---

## Step 2: Deploy to Render using Blueprints (`render.yaml`)

The repository includes a production-ready `render.yaml` Blueprint file that configures the Next.js web service, Singapore region, and the two background cron jobs automatically.

1. Push your repository to **GitHub** or **GitLab**.
2. Go to the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your GitHub/GitLab repository.
5. Render will automatically parse `render.yaml` and display the services to be created:
   - **`bangladeshi-news-portal`** (Web Service: Node.js / Next.js)
   - **`news-portal-flush-views`** (Cron Job: runs every 10 minutes)
   - **`news-portal-publish-scheduled`** (Cron Job: runs every 5 minutes)
6. Render will prompt you to enter the required secret environment variables:
   - `DATABASE_URL`: Paste your pooled Neon connection string from Step 1.
   - `BETTER_AUTH_URL`: Your Render service URL (e.g., `https://bangladeshi-news-portal.onrender.com` or custom domain).
   - `UPSTASH_REDIS_REST_URL`: (Optional) Upstash Redis endpoint for buffered views.
   - `UPSTASH_REDIS_REST_TOKEN`: (Optional) Upstash Redis token.
   - `RESEND_API_KEY`: (Optional) Resend API key for email delivery.
   - `CLOUDFLARE_R2_*`: (Optional) Cloudflare R2 credentials for media uploads.
7. Click **Apply**. Render will automatically run `npm install --legacy-peer-deps && npm run build` and launch the service!

---

## Step 3 (Alternative): Manual Setup on Render

If you prefer to configure the Web Service manually through the Render Dashboard UI:

1. Click **New +** > **Web Service**.
2. Select your repository.
3. Configure the following settings:
   - **Name**: `bangladeshi-news-portal`
   - **Region**: `Singapore`
   - **Branch**: `main` or `master`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Starter` ($7/mo) or `Free`
4. Under **Advanced** > **Health Check Path**, enter: `/`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *(Your pooled Neon PostgreSQL URL)*
   - `BETTER_AUTH_SECRET`: *(Click 'Generate' or use 32+ random characters)*
   - `BETTER_AUTH_URL`: `https://your-service-name.onrender.com`
   - `ADMIN_BOOTSTRAP_SECRET`: *(Secret for initial admin account creation)*
   - `CRON_SECRET`: *(Secret protecting background cron tasks)*
   - `NEXT_PUBLIC_SITE_NAME`: `দৈনিক বাংলাদেশ বার্তা`
   - `NEXT_PUBLIC_SITE_URL`: `https://your-service-name.onrender.com`
6. Click **Create Web Service**.

---

## Step 4: Provision Your Initial Super Admin Account

Once the Render build is live:

```bash
curl -X POST https://your-service-name.onrender.com/api/bootstrap \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_ADMIN_BOOTSTRAP_SECRET>" \
  -d '{
    "name": "প্রধান বার্তা সম্পাদক",
    "email": "editor@yournewspaper.com",
    "password": "YourStrongPassword123!"
  }'
```

You can now log in at `https://your-service-name.onrender.com/login` and access the newsroom at `/admin`.

---

## Step 5: Custom Domain & Free SSL on Render

1. In Render Dashboard, open your web service.
2. Go to **Settings** > **Custom Domains**.
3. Add your custom domain (e.g. `yournewspaper.com` and `www.yournewspaper.com`).
4. Update your DNS records at your domain registrar or Cloudflare as instructed by Render (CNAME / ALIAS record).
5. Render automatically provisions and renews a free Let's Encrypt SSL certificate.
6. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_SITE_URL` in your Render Environment Variables to your custom domain (`https://yournewspaper.com`).
