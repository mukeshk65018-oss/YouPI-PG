# YOUPI Family Dashboard

A separate, lightweight family operations dashboard for the YOUPI-PG fork.

## Preview locally

Open `apps/family-dashboard/index.html` in a modern browser. No build step, package installation, database, API key, or paid hosting is required for this static preview.

## Design

- Polished navy / indigo visual system with dark and light themes, clear typography, restrained gradients, and consistent cards.
- Responsive layout with Overview, Transactions, Merchants, Configuration, Webhooks, and System Health views.
- Theme toggle; transaction search; sample merchant and transaction records.
- Accessible skip link, semantic section navigation, visible keyboard focus, reduced-motion support, responsive transaction tables, and clear demo-data labels.

## Safety boundaries

- All dashboard records are synthetic demonstration data.
- The dashboard does not call the payment API, database, bank, webhook endpoints, or any external service.
- Live payment processing, merchant onboarding, automatic fulfilment, and real-money actions are not implemented or enabled.
- Never treat a browser callback, screenshot, SMS/email observation, or demo status as proof of settlement. Verify against official bank records and complete the project's security, legal, and compliance review before considering real-money use.

## Integration status

The dashboard is intentionally not connected to live data. The GitHub Pages site is public static hosting and cannot safely hold gateway credentials or run a private API proxy. Do not add admin tokens, merchant keys, webhook secrets, database URLs, or service-role keys to this page.

The secure server-side integration contract, authentication requirements, read-only API contract, hosting prerequisites, and acceptance gates are documented in [FAMILY_DASHBOARD_INTEGRATION.md](../../docs/FAMILY_DASHBOARD_INTEGRATION.md).

The next implementation milestone is a separately hosted, authenticated backend-for-frontend (BFF) with dedicated family-admin sessions and read-only, redacted data. Only after its security and persistence acceptance gates pass should the dashboard be switched from synthetic records to live operational data.

Live payment activation and privileged payment actions remain separate approval gates.
