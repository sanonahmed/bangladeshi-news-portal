# 📰 দৈনিক বাংলাদেশ বার্তা (Daily Bangladesh Barta)
### Modern Bangladeshi Online News Portal & Editorial Publishing Platform

A complete, production-ready, high-performance Bangladeshi online newspaper platform inspired by the editorial professionalism and information density of leading national publications (Prothom Alo, The Daily Star, Jugantor, bdnews24). Built with **Next.js 16 App Router**, **TypeScript**, **Neon Serverless PostgreSQL**, **Drizzle ORM**, **Better Auth (RBAC)**, **Cloudflare R2**, **Upstash Redis**, and **Tiptap**.

---

## 🌟 Key Highlights & Features

- **Authentic Bangladeshi Newspaper Identity**:
  - Deep news red brand palette (`#C8102E`) with subtle warm gold accents.
  - High-readability Bengali typography with **Hind Siliguri** and **Noto Sans Bengali** via `next/font`.
  - Dynamic Asia/Dhaka local date and time formatting (Bengali numerals, Bangla month names, weekdays, relative time).
  - Information-rich newspaper editorial grid: Lead story banner, supporting headlines, latest chronostream, and most-read rankings.
  - Zero Layout Shift (CLS) reserved advertising placements.
  - Dark mode and light mode with instant CSS token switching.
  - Print stylesheet for clean physical newspaper printing and PDF archiving.

- **Editorial Newsroom Management**:
  - Full-featured **Tiptap Rich-Text Editor** supporting headers, bold, italics, quotes, video embeds, images, alignments, and revision history.
  - Transparent **Correction Notices** with date and explanatory note as required by journalistic ethics.
  - 8-Division and 64-District localized reporting system with dedicated regional landing pages.
  - Breaking news ticker with smooth pause-on-hover marquee, urgency badges, and admin controls.
  - Editorial review queue for article approval and editorial workflow.
  - Cloudflare R2 direct presigned file uploads with image dimension/mime validation.

- **Enterprise Security & Architecture**:
  - **Better Auth** session-backed authentication with email/password and optional Google OAuth.
  - Server-side Role-Based Access Control (**RBAC**) across 5 roles: `super_admin`, `admin`, `editor`, `journalist`, and `reader` with 23 granular permissions.
  - Security audit logging for sensitive actions (article publishing, role modifications, settings changes).
  - Secret-protected `/api/bootstrap` endpoint for secure first-time super admin provisioning.

- **SEO & Search Engines**:
  - Valid `NewsArticle` schema.org JSON-LD structured data on all article detail pages.
  - Standard XML sitemap (`/sitemap.xml`).
  - Google News specific XML sitemap (`/sitemap-news.xml`) filtering articles from the last 48 hours with `<news:news>` publication tags.
  - Unicode-compatible Bengali full-text search with trigram indexing.

- **Performance & Caching**:
  - **Upstash Redis** buffered view counting (zero database write bottlenecks on page loads; batched cron sync).
  - Next.js 16 On-demand tag revalidation (`revalidateTag`).
  - Edge rate limiting on authentication and API endpoints.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript (Strict Mode) |
| **Styling & UI** | Tailwind CSS v4, shadcn/ui primitives, Lucide React, Framer Motion |
| **Database & ORM** | Neon Serverless PostgreSQL, Drizzle ORM, Drizzle Kit |
| **Authentication** | Better Auth, Database Sessions, RBAC middleware |
| **Rich Text Editor** | Tiptap (Headings, Underline, Link, Image, YouTube, Alignment) |
| **Media Storage** | Cloudflare R2 via AWS S3 SDK (Presigned Direct Uploads) |
| **Cache & Rate Limiting**| Upstash Redis, `@upstash/ratelimit` |
| **Transactional Email** | Resend |
| **Testing** | Vitest (Unit tests), Playwright (E2E tests) |
| **Deployment** | **Render** (via `render.yaml`) or **Vercel** (via `vercel.json`) |

---

## 🚀 Quick Start & Development Setup

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd bangladeshi-news-portal
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your credentials (see [Environment Configuration](#-environment-configuration) below).

### 3. Database Migrations & Seeding
```bash
# Generate SQL migration files from Drizzle schema
npm run db:generate

# Push migrations directly to your Neon PostgreSQL database
npm run db:push

# Seed authentic categories, Bangladesh divisions & districts, and demo articles
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Configuration

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Serverless PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | 32+ character random secret for JWT/session encryption |
| `BETTER_AUTH_URL` | Application base URL (`http://localhost:3000` or production domain) |
| `BOOTSTRAP_SECRET` | Secret token to authenticate the initial Super Admin provisioning |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare account identifier |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 API token access key ID |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 API token secret access key |
| `CLOUDFLARE_R2_BUCKET_NAME` | S3 bucket name on R2 |
| `CLOUDFLARE_R2_PUBLIC_DOMAIN` | CDN domain serving media (e.g., `media.yourdomain.com`) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for buffered views and rate limits |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token |
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `CRON_SECRET` | Secret for protecting Vercel Cron endpoints |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`) |

---

## 🔑 Initial Super Admin Bootstrapping

To create the initial Super Admin user safely without manual database SQL queries:

1. Send a POST request to `/api/bootstrap` with your `BOOTSTRAP_SECRET`:
```bash
curl -X POST http://localhost:3000/api/bootstrap \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-secret: your_secure_bootstrap_secret" \
  -d '{
    "name": "Super Admin",
    "email": "admin@yournewspaper.com",
    "password": "SecurePassword123!"
  }'
```
2. Navigate to `/login` and sign in with your credentials.
3. Access the full newsroom dashboard at `/admin`.

---

## ☁️ Production Deployment

* **Deploy on Render + Neon PostgreSQL**: See the comprehensive [Render Deployment Guide](docs/RENDER_DEPLOYMENT.md) using the automated [`render.yaml`](render.yaml) Blueprint.
* **Deploy on Vercel + Neon PostgreSQL**: See the [Vercel Deployment Guide](docs/DEPLOYMENT.md) with automated [`vercel.json`](vercel.json) cron schedules.

---

## 🧪 Testing & Verification

```bash
# Run unit tests (Bengali date, RBAC permissions, CSS utils, Zod validations)
npm run test

# Run End-to-End browser tests (Playwright)
npm run test:e2e

# Run strict TypeScript type check
npx tsc --noEmit

# Compile production build
npm run build
```

---

## 📄 License
This project is open-source under the MIT License.
