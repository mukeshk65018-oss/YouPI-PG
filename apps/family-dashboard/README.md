# YOUPI Family Dashboard

A separate, lightweight family operations dashboard for the YOUPI-PG fork.

## Preview locally

Open `apps/family-dashboard/index.html` in a modern browser. No build step, package installation, database, API key, or paid hosting is required for this static preview.

## Design

- Monochrome-only palette: black backgrounds with white text in dark mode; white backgrounds with black text in light mode.
- Responsive layout with Overview, Transactions, Merchants, Configuration, Webhooks, and System Health views.
- Theme toggle; transaction search; sample merchant and transaction records.
- Minimal Apple / Notion-inspired visual language with restrained borders, spacing, and typography.

## Safety boundaries

- All dashboard records are synthetic demonstration data.
- The dashboard does not call the payment API, database, bank, webhook endpoints, or any external service.
- Live payment processing, merchant onboarding, automatic fulfilment, and real-money actions are not implemented or enabled.
- Never treat a browser callback, screenshot, SMS/email observation, or demo status as proof of settlement. Verify against official bank records and complete the project's security, legal, and compliance review before considering real-money use.

## Next implementation stages

1. Integrate authenticated family-admin access and server-side authorization.
2. Connect read-only operational data after the backend and database are reviewed.
3. Add audited admin actions, backups, monitoring, and tests.
4. Keep live payment activation as a separate, explicit approval gate.
