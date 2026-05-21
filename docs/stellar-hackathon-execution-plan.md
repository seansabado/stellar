# LaundromatAI x StellarPay - Hackathon Execution Plan

## Repository Showcase

- GitHub Repository: [https://github.com/seansabado/stellar](https://github.com/seansabado/stellar)
- Live Backend URL: [https://stelllar--seanraynon.asia-east1.hosted.app](https://stelllar--seanraynon.asia-east1.hosted.app)
- Target Domain: [https://stellar.laundromatai.app/](https://stellar.laundromatai.app/)
- Tenant Scope: `demo-tenant-ph`

## Core Objective

Build a customer-facing payment app that is visibly and operationally connected to LaundromatAI x StellarPay, using Stellar for checkout and payment confirmation.

## Win Condition

Deliver a reliable end-to-end flow in the demo:

1. Staff creates or opens an order in LaundromatAI SaaS (`demo-tenant-ph`).
2. Customer opens LaundromatAI x StellarPay and sees the same order.
3. Customer pays through Stellar checkout.
4. Payment confirmation updates customer app and SaaS order state.
5. Receipt and payment history are visible to customer.

## Current State (as of 2026-05-19)

- Customer app branding and UX are in place.
- App is deployed via Firebase App Hosting backend `stelllar`.
- Tenant reference for demo flow is `demo-tenant-ph`.
- Currency display uses PHP.
- Customer access now uses Firebase Google sign-in on the same project as LaundromatAI.
- Gap: full runtime linkage to canonical SaaS order/payment records still needs hardening.
- Gap: local dev route isolation (`/stelllar`) and custom domain verification need final QA.

## Execution Phases

### Phase 1 - Demo Reliability (Highest Priority)

1. Confirm local route isolation:
   - `/` remains SaaS root behavior.
   - `/stelllar` opens customer app behavior.
2. Confirm production route isolation:
   - `https://stellar.laundromatai.app/` serves customer app build, not SaaS shell.
3. Verify tenant lock:
   - requests only resolve `demo-tenant-ph` for demo run.
4. Smoke test matrix:
   - Home, Orders, Checkout, Receipt, History, Profile.

### Phase 2 - SaaS Data Link Integrity

1. Read order details from the same authoritative tenant scope used by SaaS.
2. Persist payment confirmation back to SaaS order or payment record.
3. Expose transaction reference or hash for auditability.
4. Prevent duplicate confirmation writes with idempotent status handling.
5. Confirm customer Firebase session can be reused as the identity layer for SaaS-linked order access.

### Phase 3 - Judge-Facing Polish

1. Keep LaundromatAI visual identity consistent across screens.
2. Ensure customer-facing language is clear and trust-oriented.
3. Show PHP amounts consistently in list, checkout, and receipt views.
4. Include obvious proof points:
   - tenant ID (`demo-tenant-ph`)
   - payment status timeline
   - receipt references

### Phase 4 - Demo Script + Backup Path

1. Primary live demo path (SaaS -> Customer -> Confirmed Payment -> Receipt).
2. Backup path (pre-seeded order + pre-validated payment route).
3. 90-second and 3-minute variants.
4. Final sanity checklist before pitch.

## Technical Checklist

- [ ] `/stelllar` works locally without redirecting to SaaS routes.
- [ ] `https://stellar.laundromatai.app/` serves latest branded build.
- [ ] Google sign-in succeeds for local customer login.
- [ ] `demo-tenant-ph` enforced in customer order fetch.
- [ ] PHP format applied in all customer amount surfaces.
- [ ] Checkout status transitions: pending -> confirmed.
- [ ] Receipt appears in history immediately after confirmation.
- [ ] Build and deployment pass with no blocking errors.

## Submission Assets

- Repo: [https://github.com/seansabado/stellar](https://github.com/seansabado/stellar)
- Architecture note (SaaS + customer app + payment confirmation flow).
- Demo video or script.
- Screenshots: Home, Orders, Checkout, Confirmed Payment, History.

## Demo Day Script (Short)

1. Open LaundromatAI order for `demo-tenant-ph`.
2. Open customer app and show the same order in PHP.
3. Run Stellar payment flow.
4. Show confirmed status and receipt.
5. Show order or payment state reflected in SaaS.

## Risk Register

- Domain points to stale target.
- Local route collision with SaaS dev server.
- Payment confirmation not syncing to SaaS in time.
- Demo wallet or network delays.

## Mitigation

- Keep fallback URL ready: [https://stelllar--seanraynon.asia-east1.hosted.app](https://stelllar--seanraynon.asia-east1.hosted.app).
- Keep backup pre-seeded order: `demo-order-001`.
- Keep manual transaction reference and receipt screen in demo deck.

## Owner Notes

This plan prioritizes reliability first, then integration depth, then presentation polish.
Winning this hackathon depends on proving real customer value and a stable end-to-end workflow, not only visual polish.
