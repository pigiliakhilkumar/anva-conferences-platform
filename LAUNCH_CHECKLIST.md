# Launch checklist

- Domain, HTTPS and `NEXT_PUBLIC_APP_URL`
- MySQL connectivity, migrations and backups
- `AUTH_SECRET`, storage path and permissions
- SMTP configuration tested without leaking credentials
- Payment provider intentionally enabled or clearly disabled
- Administrator bootstrap and role scoping
- Conference, submission, review, registration, payment, programme and check-in smoke tests
- Certificate issue/verification and proceedings publication smoke tests
- Robots, sitemap, canonical metadata, privacy and terms pages
- Private manuscript/payment-proof/certificate access checks
- Error logs, monitoring and rollback plan

No deployment, DNS change, production credential setup or live financial operation is performed by this repository pass.
