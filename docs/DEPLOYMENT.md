# 🚀 Production Deployment Guide: Bangladeshi News Portal

This document outlines the end-to-end production deployment process for the Bangladeshi News Portal across Vercel, Neon PostgreSQL, Cloudflare R2, Upstash Redis, and Resend.

---

## 1. Neon Serverless PostgreSQL Setup

1. Create an account or log in at [Neon Console](https://console.neon.tech).
2. Create a new project:
   - **Project Name**: `bangladeshi-news-portal-prod`
   - **Region**: Choose closest to Bangladesh readers: `AWS ap-southeast-1 (Singapore)`.
   - **PostgreSQL Version**: `16` or `17`.
3. In the connection details panel:
   - Select **Connection pooling** for optimal serverless connection handling (`neondb?sslmode=require`).
   - Copy the Pooled connection string to set as `DATABASE_URL`.
4. Run migrations from your local machine:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-example-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" npm run db:push
   DATABASE_URL="postgresql://user:pass@ep-example-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" npm run db:seed
   ```

---

## 2. Cloudflare R2 Media Storage Setup

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com) and navigate to **R2**.
2. Click **Create Bucket**:
   - **Bucket Name**: `bangladesh-news-media`
   - **Location**: `APAC` (Asia-Pacific).
3. Connect a custom domain:
   - Navigate to the bucket **Settings** > **Custom Domains**.
   - Add a subdomain, e.g., `media.yournewspaper.com`.
4. Configure CORS under bucket **Settings** > **CORS Policy**:
   ```json
   [
     {
       "AllowedOrigins": [
         "https://yournewspaper.com",
         "https://*.vercel.app",
         "http://localhost:3000"
       ],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
5. Generate R2 API tokens:
   - Go to **R2** > **Manage R2 API Tokens** > **Create API Token**.
   - Permissions: **Object Read & Write**.
   - Copy **Access Key ID**, **Secret Access Key**, and your **Account ID**.

---

## 3. Upstash Redis Setup (Buffered Views & Rate Limiting)

1. Sign up or log into [Upstash Console](https://console.upstash.com).
2. Click **Create Database**:
   - **Name**: `news-portal-redis`
   - **Type**: Regional
   - **Region**: `ap-southeast-1 (Singapore)`
   - **TLS**: Enabled
3. Under the **REST API** tab, copy:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 4. Resend Transactional Email Setup

1. Sign up or log into [Resend](https://resend.com).
2. Go to **Domains** > **Add Domain** (`yournewspaper.com`).
3. Add the provided DNS records (SPF, DKIM, and DMARC) to your domain registrar / Cloudflare DNS.
4. Once verified, generate an API Key under **API Keys** with **Sending access**.
5. Save as `RESEND_API_KEY`.

---

## 5. Vercel Deployment

1. Push your repository to GitHub or GitLab.
2. In [Vercel](https://vercel.com), click **Add New Project** and import the repository.
3. Configure the **Build & Development Settings**:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`
4. Add all required **Environment Variables**:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET` (generate using `openssl rand -base64 32`)
   - `BETTER_AUTH_URL` (`https://yournewspaper.com`)
   - `BOOTSTRAP_SECRET` (generate a strong alphanumeric string)
   - `CLOUDFLARE_R2_ACCOUNT_ID`
   - `CLOUDFLARE_R2_ACCESS_KEY_ID`
   - `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
   - `CLOUDFLARE_R2_BUCKET_NAME`
   - `CLOUDFLARE_R2_PUBLIC_DOMAIN`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `RESEND_API_KEY`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
5. Click **Deploy**.

---

## 6. Vercel Cron Jobs Verification

The `vercel.json` file in the repository root automatically configures two scheduled cron tasks:

1. **Flush Buffered Views**:
   - Route: `/api/cron/aggregate-views`
   - Schedule: `*/10 * * * *` (Every 10 minutes)
   - Flushes Redis buffered article view counters to PostgreSQL in bulk.

2. **Publish Scheduled Articles**:
   - Route: `/api/cron/publish-scheduled`
   - Schedule: `*/5 * * * *` (Every 5 minutes)
   - Checks for articles with `status: "approved"` and `scheduledAt <= now()` and flips them to `published`.

Vercel will send the header `Authorization: Bearer <CRON_SECRET>` with each invocation.

---

## 7. Initial Super Admin Account Creation

After deployment completes:

```bash
curl -X POST https://yournewspaper.com/api/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-secret: <YOUR_BOOTSTRAP_SECRET>" \
  -d '{
    "name": "Super Admin",
    "email": "editor@yournewspaper.com",
    "password": "StrongPassword123!"
  }'
```

You can now log in at `https://yournewspaper.com/login` and access the newsroom at `/admin`.

---

## 8. Google News & Search Console Submission

1. **Google Search Console**:
   - Add your property `https://yournewspaper.com`.
   - Submit standard sitemap: `https://yournewspaper.com/sitemap.xml`.
2. **Google News Publisher Center**:
   - Open [Google News Publisher Center](https://publishercenter.google.com).
   - Add publication: "দৈনিক বাংলাদেশ বার্তা" / "Daily Bangladesh Barta".
   - Set primary language to **Bengali** (`bn`).
   - Submit News Sitemap: `https://yournewspaper.com/sitemap-news.xml`.
