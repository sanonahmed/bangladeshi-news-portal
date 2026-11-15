# Security and accounting upgrade

## Required operator actions

- **Rotate the database password previously embedded in the migration scripts.** Removing it from the current tree does not remove it from Git history, clones, logs, or old deployments. Update `DATABASE_URL` everywhere it is used and revoke the old credential. No provider credentials have been rotated by these code changes.
- Set a random `BETTER_AUTH_SECRET` of at least 32 characters. Production startup/build now fails without it. Rotating this secret invalidates existing signed session cookies.
- Inspect existing `super_admin` accounts and remove any unauthorized promotions. Email-based automatic promotion has been removed; existing stored roles are not silently rewritten.
- Bootstrap uses `ADMIN_BOOTSTRAP_SECRET` (at least 32 characters) in `Authorization: Bearer <secret>`. Remove it after creating the initial administrator. Public signup is disabled for both email and Google. Authorized staff creation uses a server-only, atomic Neon batch with Better Auth password hashing; it does not create a login session for the new user.
- Login and password-reset throttling require **no Redis configuration**. Better Auth uses its built-in memory limiter: 10 sign-in requests per 15 minutes per IP/path and 3 password-reset requests per 15 minutes. Counters are local to each process and reset on restart; they are not a distributed limit. Before scaling to multiple instances, plan shared rate-limit storage. No database migration is needed for this login fix, and password verification, staff-role checks, and the signup ban are unchanged. Password-reset email delivery still requires Resend.
- Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for production **search and article-view protection**, which still fail closed if Redis is unavailable, including timeout fallbacks. Deploy behind a trusted proxy that **overwrites** `X-Forwarded-For` and prevents direct-origin access; arbitrary client-supplied forwarding headers must not be trusted. Better Auth falls back to a shared per-path bucket when it cannot resolve a trusted client IP.
- Rename legacy `CLOUDFLARE_R2_*` settings to `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL`. The last setting must be a full HTTPS URL, not just a hostname. Supply it at build time as well as runtime so Next.js permits the correct image host. Configure bucket CORS for the site's upload origin.

## View counters

- Each accepted view now updates `articles.view_count` and `article_view_aggregates.total_views` in one atomic SQL statement. Missing/unpublished articles are not counted.
- Redis is no longer a second source of view increments. Remove any existing `news-portal-flush-views` or `/api/cron/aggregate-views` scheduler. The old endpoint remains authenticated but does no writes.
- Do not flush old `views:buffer:*` keys into PostgreSQL: the old request path had already written those views. Let expiring keys expire or remove them through a controlled maintenance operation after old application instances are stopped.
- Existing aggregate totals are not bulk-rewritten by this deployment. The next view synchronizes that article's aggregate total to its article counter. Audit historical data before any separate reconciliation; unique visits cannot be reconstructed from counters alone.
- The legacy `last_24h`, `last_7d`, and `last_30d` fields are not real rolling windows and are no longer incremented as if they were lifetime counters. They should not be used for analytics without a separate time-bucket/event implementation. Current application readers use lifetime article counts.
- A network timeout after a committed write can still lead a client to submit another view. This change eliminates the known dual-write/replay bug; it does not add per-event idempotency or bot-proof unique-visitor counting.

## Verification and remaining work

Run `npm test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` before deploying. Regression tests mock external services; validate account creation/login and real uploads against a staging database and bucket before production rollout. The existing repository-wide lint backlog is not suppressed by this patch. Browser end-to-end tests and credential rotation are separate operational steps.
