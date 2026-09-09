# ANVA Conferences production runbook

Hostinger should run Node.js 22 with a MySQL database and a persistent storage directory. Set `DATABASE_URL`, `NEXT_PUBLIC_APP_URL=https://conferences.anvapublishing.com`, a random `AUTH_SECRET`, `STORAGE_DRIVER`, `LOCAL_STORAGE_ROOT`, and optional SMTP/payment-provider variables from the deployment secret store. Never commit them.

Build with `npm ci`, `npx prisma generate --schema prisma/schema.mysql.prisma`, and `npm run build:production`; initialize the approved MySQL schema through a reviewed migration process before starting the app. Create the first administrator through the bootstrap script. Configure HTTPS and the custom domain, then smoke-test login, conference pages, submissions, review, registration, payment verification, check-in, certificates, proceedings, sitemap and certificate verification.

## One-time empty-database baseline

For a brand-new, completely empty MySQL database only, the owner may run the reviewed baseline with the MySQL client:

```bash
mysql --host=HOST --port=3306 --user=USER --password DATABASE_NAME < prisma/mysql/0001_baseline.sql
```

Run this exactly once after selecting the empty production database. **NEVER run `prisma/mysql/0001_baseline.sql` against an already initialized database.** It is an initialization baseline, not an upgrade migration; take a verified backup and use a reviewed migration for any later schema change. The script contains schema DDL only and no seed records, credentials, destructive resets, `DROP`, `TRUNCATE`, or `INSERT` statements.

Back up MySQL and all persistent storage (public media, private uploads, certificates and proceedings) before releases. Roll back by restoring the previous application artifact and compatible database backup; do not run destructive resets. Phase 4 does not deploy or initialize production infrastructure.
