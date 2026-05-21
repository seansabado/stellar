# Customer OAuth Flow

Date: 2026-05-19

## Objective

Add Google sign-in for customer checkout so the Stellar app uses the same Firebase Auth project as LaundromatAI x StellarPay and binds every signed-in customer session to `demo-tenant-ph` for the demo lane.

## Implementation

- Auth provider: Firebase Authentication
- Sign-in surface: Google Identity Services rendered button
- Credential exchange: GIS ID token -> Firebase `GoogleAuthProvider.credential(...)`
- Localhost fallback: Firebase `signInWithPopup(...)` with redirect fallback via `signInWithRedirect(...)`
- Firebase project: `seanraynon`
- Demo tenant binding: `demo-tenant-ph`
- Session persistence: browser local persistence

## Runtime Behavior

1. Customer opens the Stellar app.
2. App checks Firebase Auth state before rendering customer routes.
3. If no session exists, an official Google Identity Services button is shown on authorized origins.
4. On localhost, the app falls back to Firebase popup sign-in until the GIS web client is authorized for `http://localhost:3001`.
5. If the popup is blocked by browser policies, the app offers a redirect sign-in button and resumes the session after return.
6. Google Identity Services returns an ID token and the app exchanges it into Firebase Auth when GIS is available.
7. On successful sign-in, the app writes demo tenant binding keys:
   - `lubotos.tenantId = demo-tenant-ph`
   - `tenantId = demo-tenant-ph`
   - `lubotos.demoSession = 1`
8. Customer pages and checkout flow render inside the authenticated session.
9. Sign-out clears the demo tenant binding and customer session cache.

## Demo Seed Orders

- Primary source: LubotOS SaaS orders from `tenants/demo-tenant-ph/branches/*/orders` (read-only)
- Stellar mirror target: `tenants/demo-tenant-ph/stellar_demo_orders`
- Fallback source: `src/lib/customerData.ts` when SaaS source is unavailable
- Seed API list endpoint: `GET /api/orders?tenantId=demo-tenant-ph`
- Seed API detail endpoint: `GET /api/order/:orderId`
- Login sync endpoint: `GET /api/orders?tenantId=demo-tenant-ph&sync=1`
- Orders screen uses mirrored SaaS-shaped orders first, then falls back to local seed list when API fails.
- Checkout reads the seeded order id, then creates a Stellar payment through `POST /api/create-stellar-payment`.
- Payment status polling remains unchanged via `GET /api/check-stellar-payment`.

## Firestore Demo Reset Policy

- Seed count per login: mirrors current SaaS demo orders; falls back to **6 fixed demo orders** when SaaS source is unavailable.
- Every new customer login triggers a reset of `tenants/demo-tenant-ph/stellar_demo_orders/*`.
- Reset never writes to LubotOS SaaS source orders.
- Local receipt cache is cleared on each new login reset to keep demos clean.
- Manual reseed command: `npm run seed:demo`

## Strict SaaS Parity Mode

- Stellar orders view now enforces strict value parity for `demo-tenant-ph`.
- Displayed values for order number, amount, branch, service, and pickup are sourced from LubotOS SaaS order docs.
- Local placeholder demo rows are no longer rendered when live SaaS data is unavailable.

## SaaS UI Parity Redesign

- Customer pages were redesigned to follow the LubotOS `/app` visual language end-to-end.
- Updated modules: shell/top navigation, dashboard, orders, checkout, history, profile, and auth gate.
- Orders now use a SaaS-style operations table with customer-safe columns only.
- Internal-only columns and controls (operator and admin stage actions) remain hidden in customer view.

## Common Localhost Failures

- `auth/popup-blocked`: Use the redirect sign-in button.
- `auth/unauthorized-domain`: Add `localhost` to Firebase Authentication authorized domains.
- `auth/operation-not-allowed`: Enable Google provider in Firebase Authentication for project `seanraynon`.

## Why Firebase Auth Instead of Raw OAuth Client Secret

The downloaded Google OAuth client secret file is not used directly in the browser app.
For this customer app, the correct implementation path is Firebase Auth because LaundromatAI already uses the same Google sign-in provider and Firebase project.

## Demo Outcome

- Customer identity is visible in the top bar.
- Payment screens remain tenant-locked to `demo-tenant-ph`.
- The auth model stays aligned with LaundromatAI `/app` rather than creating a second identity system.
