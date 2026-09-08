# ANVA Conferences

ANVA Conferences is a database-driven, multi-conference publishing platform for academic and scientific events. A single deployment hosts a central conference directory and any number of conference microsites at routes such as `/conferences/example-2027`. Conference content is created and managed through the protected administrator workspace; adding a conference does not require a code change.

Public identity: **ANVA Conferences — Academic & Scientific Conferences**, a scholarly events initiative of ANVA Publishing.

## Phase 2 scope

Phase 2 adds secure participant registration and shared account login, editable participant/reviewer profiles, role-aware author and reviewer workspaces, conference-scoped submissions with human references, ordered co-authors, protected PDF manuscript versions with SHA-256 integrity hashes, technical screening, reviewer invitations and conflict declarations, author-visible and confidential review comments, editorial decisions, revision rounds, presentation classification, internal notifications, and controlled withdrawal. Administrators can promote verified accounts to reviewer or conference manager and deactivate access. Mutations enforce ownership and roles server-side and emit audit events and status history records.

The end-to-end workflow is:

1. An administrator publishes a conference, enables accepted submission types, and opens submissions.
2. A participant creates an account and a draft, adds authors and—except for abstract-only work—uploads a validated PDF.
3. The author submits the draft. A conference manager assigns active reviewer accounts; authors and co-authors cannot be assigned to their own paper.
4. A reviewer accepts or declines with a conflict reason, then submits a recommendation, author comments, and optional confidential editor comments.
5. A manager records an acceptance, rejection, or revision request. Author-visible feedback and the decision appear in the submission workspace.
6. For a revision request, the author uploads a new immutable version with a response to reviewers and resubmits it.

Submission files never inherit a conference's public visibility. Downloads require the owning author, an assigned reviewer, a conference manager, or an administrator.

## Phase 1 foundation

Phase 1 supplies the public platform, configurable conference microsites, administrator authentication and conference management, local media storage, news/blog publishing, newsletter subscriptions, and a truthful proceedings foundation. The production-facing database starts empty. There are no seeded conferences, people, sponsors, posts, proceedings, statistics, or testimonials.

The following workflows remain deferred:

- Phase 3: registrations, payments, invoices, attendance operations, expanded programme management, badges, and QR check-in.
- Phase 4: certificates, certificate verification, proceedings publication workflow, final production hardening, and launch audit.

The Phase 1 data model includes stable identities, role and lifecycle enums, relational conference content, and audit events so these later modules can be added without turning individual conferences into separate applications.

## Technology and architecture

- Next.js 16 App Router, React 19, and TypeScript
- Prisma 6.12 with SQLite for local development
- A parallel MySQL-compatible Prisma schema for Hostinger production
- Server-rendered public discovery and microsite routes
- Server-validated, database-backed administrator sessions
- Zod validation at mutation boundaries
- Local persistent media storage with database metadata
- Webpack for both development and production builds
- Vitest regression tests and ESLint

The application uses two related surfaces:

1. The public surface reads only publishable records and provides conference discovery, database-driven microsites, blog posts, and newsletter subscription.
2. The administrator surface is protected server-side. Its mutations repeat authorization and validation independently of navigation visibility.

Conference sections are records rather than a growing set of fragile columns. Each section can be enabled, ordered, and optionally shown with a truthful empty state. Related content—dates, tracks, committees, speakers, organizers, fees, programme entries, sponsors, documents, FAQs, and announcements—is normalized into its own models.

## Requirements

- Node.js 22 or newer
- npm
- SQLite for local development (used through Prisma)
- MySQL on `localhost:3306` or another MySQL-compatible endpoint for production

No external SaaS database or identity provider is required.

## Local setup

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. Prisma resolves `file:./dev.db` relative to the Prisma schema directory, so the development database is local and must not be committed.

Use a fresh, random `AUTH_SECRET` before creating sessions. For example, generate one with a trusted password manager or a cryptographically secure local tool. Do not reuse a password as the session secret.

## Environment variables

Copy `.env.example` to `.env` for development. Never commit `.env` or production credentials.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | SQLite URL locally; MySQL connection URL in production. |
| `AUTH_SECRET` | Yes | Random secret of at least 32 characters used to protect authentication state. |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical public origin, without a trailing path. Production value is `https://conferences.anvapublishing.com`. |
| `NODE_ENV` | Set by runtime | `development`, `test`, or `production`. |
| `STORAGE_DRIVER` | Yes | `local` in Phase 1. |
| `LOCAL_STORAGE_ROOT` | Yes | Writable persistent upload directory. Use an absolute path in production. |
| `MAX_UPLOAD_MB` | Recommended | Maximum accepted upload size. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | No | Reserved for a later mail-delivery integration. Phase 1 does not claim to send mail. |

For production, use a least-privilege MySQL user and a URL in this form:

```text
mysql://USER:PASSWORD@localhost:3306/DATABASE
```

Percent-encode reserved characters in credentials. Keep the URL in Hostinger's environment settings, not in source control.

## Commands

```text
npm run dev                 Start Next.js development mode with Webpack
npm run build               Create a Webpack production build
npm run build:production    Build with NODE_ENV=production and Webpack
npm start                   Serve the completed production build
npm run lint                Run ESLint
npm run typecheck           Run TypeScript without emitting files
npm test                    Run the Vitest regression suite once
npm run test:watch          Run Vitest in watch mode
npm run db:generate         Generate the SQLite Prisma client
npm run db:migrate          Create/apply local SQLite migrations
npm run db:push             Synchronize a disposable local database
npm run db:validate         Validate the SQLite schema
npm run db:validate:mysql   Validate the production MySQL schema
npm run db:generate:mysql   Generate against the production schema
npm run admin:bootstrap     Establish the first administrator
```

Do not run development migrations against the production database. Production migrations should be reviewed, backed up, and applied using the deployment procedure chosen for the Hostinger environment.

## First administrator bootstrap

There is no default administrator and no credential in the repository. Configure the production environment first, then run:

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL="administrator@example.org"
$env:BOOTSTRAP_ADMIN_PASSWORD="supply-a-unique-strong-password"
$env:AUTH_SECRET="supply-a-random-secret-at-least-32-characters"
npm run admin:bootstrap
```

Replace the example values at execution time and clear the password variable immediately afterward. The password must be at least 14 characters and contain upper- and lowercase letters, a number, and a symbol. Never add it to `.env.example` or source. Production additionally requires `CONFIRM_PRODUCTION_BOOTSTRAP=CREATE_FIRST_ANVA_ADMIN`. The bootstrap refuses to run when an administrator already exists or when the chosen email is registered.

Production checklist before running the command:

- `DATABASE_URL` points to the intended production database, not the development SQLite file.
- `AUTH_SECRET` is a unique production secret with at least 32 characters.
- TLS is enabled at the public origin.
- The command is executed from a private terminal session by an authorized operator.
- A current database backup exists if the database is already in service.

The password is stored only as a secure one-way hash. Successful sign-in creates an opaque, expiring session whose server-side record is validated on each protected request. Logging out invalidates that session.

## Media storage

Phase 1 uses the `local` storage driver. During development the default root is `./storage/uploads`; uploaded objects and generated local storage contents are ignored by Git. In production, `LOCAL_STORAGE_ROOT` must identify a Hostinger directory that:

- persists across deployments and application restarts;
- is writable by the Node.js process;
- is not inside the Git checkout or a directory that deployment replaces;
- is included in the site's backup plan; and
- is not directly exposed as an unrestricted executable directory.

The upload boundary limits file size, checks supported extensions and MIME types, inspects signatures where applicable, creates randomized object keys, and does not expose physical filesystem paths. Keep the allowed document set conservative (for example PDF) and the image set limited to known web image formats. Alt text is stored with image metadata and should describe meaningful images.

Moving uploads between servers requires both the database metadata and the contents beneath `LOCAL_STORAGE_ROOT`.

## Database schemas

- `prisma/schema.prisma` is the SQLite development schema and the default Prisma Client source.
- `prisma/schema.mysql.prisma` mirrors the relational model for MySQL production.

Any model or enum change must be applied to both files and validated against both providers:

```powershell
npm run db:validate
npm run db:validate:mysql
npm run db:generate
npm run db:generate:mysql
```

Generating from the MySQL schema replaces the generated client metadata. Run `npm run db:generate` again before continuing local SQLite development.

Core models cover users and sessions; conferences and public content; submissions, authors and manuscript versions; reviewer assignments and reviews; editorial decisions; media; subscribers; and audit events.

## Hostinger deployment notes

1. Configure Node.js 22 and install dependencies with the lockfile (`npm ci`).
2. Add production environment values in the hosting control panel. Do not upload `.env` from development.
3. Set `DATABASE_URL` to the Hostinger MySQL database, normally on `localhost:3306`.
4. Allocate and back up a persistent upload directory, then set its absolute path as `LOCAL_STORAGE_ROOT`.
5. Validate and generate the MySQL Prisma client with `npm run db:validate:mysql` and `npm run db:generate:mysql`.
6. Apply reviewed production migrations before starting the new application revision.
7. Run `npm run build:production`, then start with `npm start` using the hosting process manager.
8. Terminate TLS at `https://conferences.anvapublishing.com` and set `NEXT_PUBLIC_APP_URL` to that exact origin.
9. Run the administrator bootstrap once from a private shell after the database and secrets are confirmed.
10. Verify public pages, an unauthorized `/admin` request, authorized sign-in/logout, an upload, and database backups after deployment.

Uploads and the MySQL database are independent persistent assets; deploy and restore plans must account for both. Secure cookies require HTTPS in production. Avoid serving the application through a second public origin because canonical metadata and session policy assume the configured origin.

## Public and administrator behavior

Only published conferences are visible through public detail and discovery routes. Draft, archived, and cancelled content remains unavailable publicly. Directory filters are represented in query parameters and evaluated by the database-backed query layer. Microsite metadata and Event structured data are derived only from stored conference data.

The central public pages provide truthful empty states when no matching conference, deadline, post, or proceeding exists. Newsletter subscription stores a validated, unique address and status; it does not imply that mail delivery has been configured.

Administrator lifecycle operations prefer state transitions—draft, published, ongoing, completed, archived, and cancelled—over permanent deletion. Sensitive actions require authorization at the mutation boundary, validate input, and emit audit records without password or secret material.

## Security operations

- Rotate `AUTH_SECRET` deliberately; changing it invalidates protection for existing authentication state and should be paired with session cleanup.
- Restrict database and storage permissions to the application user.
- Keep dependencies patched and run `npm audit` as part of release review.
- Never log passwords, raw session tokens, database URLs, or upload filesystem paths.
- Keep the application behind HTTPS and retain secure, HttpOnly, SameSite cookie settings in production.
- Back up and periodically test restoration of MySQL and the persistent media directory.
- Treat administrator-entered prose as untrusted. The platform renders it without unsanitized arbitrary HTML.

## Verification before release

Run the following from a clean installation using non-production test credentials:

```powershell
npm run db:validate
npm run db:validate:mysql
npm run db:generate
npm run typecheck
npm run lint
npm test
npm run build:production
git diff --check
```

Also review tracked files for credentials and prohibited identity or fabricated content. Confirm that a draft conference returns no public detail, a published conference is discoverable, scope filters distinguish international and national events, administrator routes reject anonymous requests, uploads reject unsafe payloads, and newsletter duplicates receive a truthful response.

## Contact

General enquiries: `contact@anvapublishing.com`

Scientific or editorial correspondence: `editorial@anvapublishing.com`

No physical address or telephone number is asserted by this repository.
