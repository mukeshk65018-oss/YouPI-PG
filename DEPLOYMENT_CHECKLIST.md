# YOUPI PG V2 — Deployment & Release Checklist

This checklist is for the self-hosted YOUPI PG V2 repository. A passing CI run or a published static dashboard is not production approval.

## 1. Repository and build integrity

- [ ] Review the exact release commit and all changes from the previous release.
- [ ] Run `npm ci`, `npm run typecheck`, `npm run build`, and `npm test` on the supported Node.js 24 line.
- [ ] Confirm GitHub Actions passes secret scanning, dependency audit, typecheck/build, and regression tests.
- [ ] Confirm the Android APK is built from the same reviewed source and verify its published SHA-256 checksum.
- [ ] Confirm no `.env`, database files, OAuth tokens, APK signing keys, backups, or generated secrets are tracked.
- [ ] Review dependency changes, licenses, and native module compatibility on the target operating system.

## 2. Host and persistence

- [ ] Select a host that supports long-running Node.js processes, persistent writable storage, required native modules, and the required network access.
- [ ] Do not assume a static host or serverless deployment can run the process supervisor, SQLite database, Gmail/SMS observers, WhatsApp session, or durable webhook worker.
- [ ] Keep the SQLite database on a persistent local volume; enable WAL and foreign-key enforcement.
- [ ] Configure automated encrypted backups and complete a restore drill before accepting real payments.
- [ ] Confirm process restart, host reboot, database recovery, and graceful shutdown behavior.
- [ ] Configure HTTPS reverse proxying, strict host/origin allowlists, request limits, firewall rules, and monitoring.
- [ ] Keep the Control Center and internal observer ports private; expose only the routes that are required.

## 3. Secrets and authentication

- [ ] Generate unique production values for `ENCRYPTION_MASTER_KEY`, `JWT_SECRET`, admin credentials/tokens, observer tokens, Android enrollment secrets, merchant API keys, and webhook HMAC secrets.
- [ ] Store secrets only in the host's server-side secret store or protected environment; never place them in browser bundles, GitHub Pages, source code, screenshots, or logs.
- [ ] Keep merchant API keys separate from webhook-signing secrets. Rotate any credential that may have been exposed.
- [ ] Restrict admin and observer credentials to the minimum required services; document revocation and rotation.
- [ ] Configure exact `YOUPI_ALLOWED_ORIGINS`, checkout frame ancestors, allowed return URLs, and webhook destination policy.
- [ ] Confirm rate limiting and abuse controls are appropriate for the deployment topology; the in-process limiter is not a shared multi-instance control.

## 4. Payment and observer safety

- [ ] Configure and verify the receiving account using the bank's official records.
- [ ] Bind each observer/device to its authorized merchant and receiving account; reject unregistered or mismatched observations.
- [ ] Test exact-amount attribution, duplicate observations, late alerts, amount mismatch, reused UTRs, queue contention, expiry, and recovery using synthetic data.
- [ ] Verify webhook HMAC signatures, delivery IDs, idempotency, retry behavior, and durable outbox recovery.
- [ ] Treat SMS, Gmail, browser callbacks, screenshots, and observer events as signals—not conclusive proof of settlement.
- [ ] Reconcile any real credit against official bank records before manually approving fulfilment or other irreversible actions.
- [ ] Disable unused Gmail/SMS/Android observers and remove their OAuth permissions and credentials.
- [ ] Keep development tools, OTP disclosure, simulators, and test routes disabled in production.

## 5. Dashboard and data protection

- [ ] Treat `apps/family-dashboard` on GitHub Pages as a static synthetic-data preview only.
- [ ] Do not add admin tokens, merchant API keys, webhook secrets, database credentials, or service-role keys to the static dashboard.
- [ ] Before connecting live family operations data, deploy a separate authenticated server-side BFF with dedicated family-admin sessions, CSRF protection, rate limits, audit logging, and field-level redaction.
- [ ] Prove that unauthenticated users and users without the family-admin role cannot access any family API endpoint.
- [ ] Verify that customer phone numbers, UPI identifiers, raw bank messages, UTRs, secrets, and raw database rows are not returned by default.
- [ ] Keep privileged payment operations disabled until separately reviewed and approved.

## 6. Legal, bank, and operational release gates

- [ ] Obtain qualified legal/compliance review and confirm the bank/acquirer and applicable regulatory requirements for the intended use.
- [ ] Do not represent YOUPI PG as bank-approved, NPCI-approved, audited, or production-certified.
- [ ] Confirm the receiving account and merchant arrangements are permitted for the intended activity.
- [ ] Establish incident response, security contact, alerting, log retention, backup retention, and credential-rotation procedures.
- [ ] Run a staging pilot with synthetic data and explicitly documented limits before considering any real-money pilot.
- [ ] Keep production payment activation disabled until all applicable gates are reviewed and approved by the responsible owner.

## 7. Current repository status

- The family dashboard is a static GitHub Pages preview and is not connected to live gateway data.
- The current Vercel connection is not a YOUPI-PG deployment and must not be reused from another project.
- The connected Supabase project must not be reused for YOUPI-PG if it belongs to another application.
- The default deployment model documented by this repository is self-hosted Node.js with persistent SQLite and separately supervised services.
- Passing automated tests verifies tested code paths; it does not establish legal authorization, bank settlement correctness, production availability, or payment-system certification.
