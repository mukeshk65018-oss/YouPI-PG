# Family dashboard: secure integration plan

## Current state

The family dashboard at `apps/family-dashboard/` is a static GitHub Pages preview. Its figures and event rows are synthetic. It intentionally makes no API, database, bank, or webhook requests.

This is a security boundary, not a missing frontend setting: GitHub Pages cannot host a private server-side proxy, and a browser must never receive `ADMIN_API_TOKEN`, `OBSERVER_API_TOKEN`, a merchant API key, a webhook secret, a database URL, or a Supabase service-role key.

## Required architecture before live operational data

Use a same-origin backend-for-frontend (BFF) on a separately deployed, persistent server. The static dashboard should call only same-origin `/family-api/*` routes. The BFF authenticates a family administrator using a dedicated account/session mechanism and then makes narrowly scoped server-to-server calls to the gateway.

Do not reuse the gateway's global admin token as a browser login credential. Do not put credentials in query strings, local storage, HTML, JavaScript bundles, GitHub Pages repository variables, or client-visible environment variables.

### Authentication and session requirements

- Dedicated family-admin identities; no shared default password.
- Passwords stored with a modern password hash (Argon2id preferred; otherwise an approved adaptive hash).
- Short-lived server-side sessions in a persistent store; rotate session identifiers after login and privilege changes.
- Secure, HttpOnly, SameSite cookies; CSRF protection for every state-changing request.
- Login throttling, generic authentication errors, session expiry, logout and revocation.
- MFA before granting any privileged action.
- No self-registration and no public family-admin invitation endpoint.
- Secrets loaded only from the server's secret manager/environment and rotated independently.

### Read-only API contract (first integration milestone)

The first release must be read-only. The BFF may expose only these normalized resources:

| BFF route | Purpose | Allowed data |
|---|---|---|
| `GET /family-api/summary` | Overview cards | Aggregated counts and totals, time window and currency |
| `GET /family-api/transactions` | Transaction list | Opaque ID, order reference, amount, currency, method, status, timestamps |
| `GET /family-api/merchants` | Merchant directory | Merchant ID, business name, status and created date |
| `GET /family-api/events` | Recent operational events | Event type, outcome, timestamp and redacted reason |
| `GET /family-api/health` | Service status | Service name, availability and checked-at timestamp |

Every route must enforce a family-admin role, validate pagination and filters, return bounded results, redact personal data and secrets, and emit security/audit logs. Do not return UPI account numbers, customer phone numbers, raw bank messages, UTRs, API keys, webhook secrets, OAuth tokens, internal stack traces, or raw database rows by default.

The BFF must call existing authenticated gateway APIs over private networking where possible. It must not query the gateway database directly from the browser. Prefer a separate read-only DB role or a dedicated internal read service over reusing unrestricted admin routes.

### Later privileged operations

Keep merchant changes, credential rotation, payment review, reconciliation, refunds, fulfilment, observer controls and live-payment activation out of the first release. Each later operation needs a separately designed permission, explicit confirmation, server-side validation, idempotency where appropriate, immutable audit entry, and tests. No dashboard action may declare a payment settled based only on an SMS, email, screenshot or observer event.

### Persistence and hosting prerequisites

- A persistent database with encrypted backups and a tested restore procedure.
- Durable session storage and a documented session-revocation path.
- HTTPS, strict origin allowlists, security headers, CSRF protection and rate limiting at the edge.
- Centralized redacted logs, alerts, uptime checks and an incident/secret-rotation runbook.
- Separate development, staging and production environments with distinct credentials.
- No dependency on Render or any paid service is assumed by this plan; the selected free hosting option must be verified for always-on server processes, persistent storage, secrets, bandwidth, sleep/usage limits and acceptable terms before use.

## Acceptance gates

1. Automated tests prove that unauthenticated and wrong-role users cannot read any family API resource.
2. Tests prove that no global admin, observer, merchant or webhook credential is ever returned to the browser.
3. CSRF, session fixation, logout/revocation, brute-force throttling and pagination bounds are tested.
4. Security review confirms field-level redaction and least privilege.
5. Backup restore and service restart tests pass against persistent storage.
6. Staging integration tests pass with synthetic records only.
7. Production data access and any real-money capability remain disabled until the owner explicitly approves the release and all legal, bank/acquirer and compliance requirements are independently satisfied.

## Current release decision

**Not connected to live data.** The static demo remains safe to publish as a preview. Do not label it a live family operations dashboard until all acceptance gates above pass.
