# Security remediation report — YOUPI PG manual UPI integration

## Scope and limits

This is a source/configuration review of the checked-out gateway, Fins & Wings customer app, and admin app for the manual UPI integration. It included focused searches for dynamic evaluation, subprocess use, third-party destinations, payment state transitions, browser checkout calls, environment/configuration, migrations, and deploy manifests. It is not a penetration test, a clean-room malware analysis of installed dependencies, or a bank/UPI settlement certification. No live Supabase project, real account, payment, credential file, or deployment was accessed. The gateway's pre-existing local `.env` and secret backups were intentionally not read.

## Security posture

**Do not use the current gateway as a source of payment settlement truth.** This change establishes a manual review flow for Fins & Wings: the customer UTR is a claim, gateway events only update the attempt/UTR, and an authenticated admin decision is the only path to `verified`. Keep the gateway experimental until the production blockers below are addressed.

## Integration changes in this branch

- Fins & Wings server order creation and retry requests now explicitly request `MANUAL_UPI`; amount stays sourced from the Supabase order result.
- Browser checkout SDK no longer creates payment sessions or sends a merchant key. It requires a server-created checkout URL/payment ID.
- Gateway payment creation requires explicit merchant identity and server-side credentials, validates the payment method, binds idempotency to the method, and restricts return URLs to configured origins.
- Checkout allows a UTR submission for manual sessions, stores it in a pending-review state, rejects repeated UTR reuse for the same receiving account, and prevents the legacy “Payment Done” auto-observer flow.
- Automatic observer attribution excludes manual sessions. The manual claim webhook includes customer UTR but cannot mark an order paid in the Supabase RPC.
- Supabase migration 009 makes gateway events non-authoritative and makes admin review atomic, pending-only, evidence-noted, and admin-role gated. Admin rejection requires a reason.
- Browser CORS allow headers include device/customer authentication headers. Basic per-process request throttles are applied to payment creation and UTR submission.

## Findings and remaining risks

### High — Gateway is not independently proven to settle funds

Notification observers, UTR strings, browser events, and signed webhooks cannot prove that funds cleared into the intended receiving account. Manual UTR review reduces automation risk but depends on an admin actually checking bank records and recognizing amount, account, date, reversal, and duplicate-payment issues. Never fulfill from a customer UTR or gateway event alone.

### High — Production persistence is not configured

`render.yaml` selects a free plan, enables SQLite fallback, and defines no durable disk. A restart/ephemeral filesystem may lose payment sessions, outbox items, webhook history, and credentials. Use a production-grade persistent database, backups, restore drills, and durable queue/outbox monitoring before production.

### High — Legacy merchant credential migration must be verified operationally

The current branch separates merchant API keys from webhook-signing secrets: new API keys are generated independently, the SDK no longer falls back to the webhook secret for API authentication, and migration logic rotates legacy records whose API-key hash matches the webhook-secret hash. Before deployment, verify the migration against a disposable copy of the actual database, confirm the encrypted merchant key can be recovered by trusted server-side code, and update each affected merchant integration with its newly issued API key. Never expose either credential to a browser.

### Medium — Rate limits are process-local

The payment and UTR throttles in `apps/payment-api/src/server.js` are in-memory and reset on restart. They do not coordinate across replicas, and do not replace edge-level limits, abuse monitoring, and durable idempotency controls.

### Medium — CORS and return allowlists must be configured

An empty `YOUPI_ALLOWED_ORIGINS` set denies browser origins and an empty `YOUPI_ALLOWED_RETURN_ORIGINS` rejects supplied return URLs. Configure exact HTTPS origins in each environment and verify iframe frame-ancestor policy separately. Avoid broad wildcard origins.

### Medium — Existing legacy observer functionality remains in the repository

The repository contains Gmail/SMS observer integrations, OAuth handling, device tooling, and subprocess use for local process/tunnel/build operations. The targeted source search found no unexpected `eval`/`new Function` in application runtime source and no unexpected package install lifecycle hooks; dynamic evaluation hits were test harnesses. The subprocesses found were named operational/test tools. This was not a complete behavioral analysis of every observer or installed dependency. If observers are unused, disable their services, revoke their OAuth/app permissions, and remove stored credentials during a separately reviewed cleanup.

### Medium — Browser SDK does not establish payment identity

The old pattern treating browser `data-youpi-key` as session-creation authority is removed from the current SDK path. Merchants must create checkout sessions on their server and pass only the checkout URL/payment ID to the browser. Treat payment IDs as bearer references; continue enforcing device/session binding and minimal public state.

### Medium — Customer webhook replay and database authority

The customer webhook verifies raw-body HMAC, event name, and matching delivery ID. Database idempotency is enforced by delivery ID. Protect the webhook secret and service-role key, and ensure `fw_apply_youpi_event` remains service-role-only. Migration 009 must be reviewed and tested against the live schema before application.

## Malware and hidden behavior review

No obvious credential exfiltration, cryptocurrency miner, obfuscated runtime, or unexpected remote-code execution was identified by the focused source search. Observed outbound destinations are the configured Supabase/YOUPI services, declared Google Maps Routes API, routing fallback, merchant webhook endpoints, and the observer/OAuth services described by the project. Endpoint allowlists, DNS rebinding, and runtime network traffic were not exhaustively validated. `npm audit --omit=dev --audit-level=high` completed with zero reported vulnerabilities. The package lock has a pre-existing worktree diff and was not changed by this implementation; inspect that diff before release.

## Required follow-up before production

1. Independently review this branch and all user-preserved gateway edits; inspect package-lock delta and run a clean dependency advisory audit.
2. Rotate and separate merchant API key, webhook secret, admin token, JWT secret, and encryption key; confirm all secrets in Git history and deployment logs are handled.
3. Choose persistent production database/hosting and implement backups, restore drills, multi-instance throttling, egress restrictions, monitoring, and incident response.
4. Review/apply Supabase migrations through the normal DBA workflow; verify grants, RLS, audit actor identity, pending/final state transitions, and order fulfilment guard.
5. Test the full checkout and bank-verification lifecycle on a sandbox account, including duplicate UTR, webhook replay, refunds/reversals, failure/expiry, and admin decision races.
6. Obtain payment provider/bank/legal compliance approval and independent payment-security review before accepting live funds.

## Additional Android observer findings (2026-11-04)

The Android source review identified release blockers requiring a dedicated remediation pass:

- `ApiClient.java` stores the paired device signing key in ordinary `SharedPreferences`. Move new credentials to Android Keystore-backed encrypted storage, migrate existing plaintext values safely, then delete the legacy values only after verified migration. Test interrupted migration, unpair, re-pair, and backup/restore behavior.
- Validate the pairing base URL before any network request or persistence. Require HTTPS for non-loopback hosts; permit only explicit emulator/loopback HTTP development endpoints. Reject malformed URLs, user-info, unexpected ports and fragments, and prevent signed requests from being redirected to another origin.
- Remove sensitive sender/endpoint details from logs. Never log SMS bodies, tokens, signing keys, or credential-bearing URLs.
- Review the necessity and disclosure of SMS permissions and notification-listener access. Google Play restricts SMS permissions and requires eligibility and policy compliance; no Play approval is claimed.
- The foreground service's 24-hour wake lock and 30-second heartbeat do not guarantee unrestricted background execution. Verify current Android service-type limits, battery restrictions, and device-specific behavior.
- Treat all parsed SMS and notification fields as untrusted observations. They cannot prove cleared funds or authorize fulfilment.

These findings were added after source inspection only. No APK rebuild, signing, emulator/device run, or Play policy assessment has yet verified remediation.
