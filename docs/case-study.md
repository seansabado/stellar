# Case Study: Customer Payments Flow for LaundromatAI x StellarPay

## The Business Problem

In a service business checkout flow, customers do not care about payment rails, tenant architecture, or deployment topology. They care about one thing: whether payment is fast, trustworthy, and clearly confirmed.

For a laundromat operation, that problem is harder than it looks:

1. The order the customer sees must resolve to the correct tenant scope.
2. Payment confirmation must be visible and understandable, not hidden behind backend ambiguity.
3. Support teams need proof after payment, not just a hopeful success message.
4. Mobile interaction quality matters because the payment moment often happens on a phone, in a hurry, at the counter.

The problem is not simply "connect to Stellar." The problem is designing a customer payment experience that remains credible under real operational constraints.

## The Engineering Challenge

Building this kind of showcase required solving a small but real enterprise workflow:

1. **Tenant-scoped order visibility**
   The customer flow must only resolve orders for the intended demo tenant, `demo-tenant-ph`, without ambiguous cross-context behavior.

2. **Identity before payment**
   Sensitive checkout routes cannot behave like anonymous landing pages. The user must enter through an identity-backed session before order and payment state is trusted.

3. **Pending-to-confirmed payment proof**
   A payment experience is incomplete if it cannot show what happened after the user taps pay. The system needs polling, confirmation logic, proof state, and post-payment receipt visibility.

4. **Mobile-first reliability**
   The final mile of a payment flow happens on a phone. Tap reliability, QR verification, camera behavior, and clear fallback states are part of the engineering problem, not cosmetic polish.

## What I Built

This repository is a public showcase of a customer-facing payment app integrated with LaundromatAI and Stellar concepts.

| Capability | What it demonstrates |
| --- | --- |
| Customer sign-in | Identity-backed session before protected payment actions |
| Tenant-scoped orders | Customer sees orders aligned to the intended demo tenant |
| Checkout flow | Two-step verify-then-pay pattern for safer payment initiation |
| Payment polling | Pending and confirmed proof states driven by payment checks |
| Receipt persistence | Confirmation remains visible in History after payment |
| Operational fallback | Demo continuity even when the live data path is degraded |

## Soroban Mainnet Proof Layer

To move beyond app-only confirmation, the flow writes each confirmed payment into a Soroban contract on mainnet:

- Contract: `CANEW7EC3W6BMVDJQNRDVTUZZ32QWIY5LNOEGWPVRWYF7LEJUUWEYWKB`
- Functions used: `record()`, `get()`, `count()`
- Deterministic key strategy: `PAY-{ORDER_ID}`
- Verified examples: `PAY-LPX0034`, `PAY-LPX0039`

This gives judges and operators an independent, tamper-proof registry they can query without trusting internal database state.

## Constraints By Design

- This is a public showcase, not a full internal production codebase.
- It does not expose proprietary schemas, real customer data, or internal payment operations.
- Demo behavior is intentionally scoped to `demo-tenant-ph`.
- Some workflow choices prioritize reliability and clarity of demonstration over full platform generalization.

## What Makes It Enterprise-Relevant

1. **Trust boundaries are explicit**
   Orders, auth state, and payment confirmation are treated as separate concerns with clear boundaries.

2. **Customer experience is tied to operational traceability**
   The app does not stop at “payment sent.” It attempts to show confirmation, transaction proof, and receipt persistence.

3. **Demo readiness is engineered, not improvised**
   The repository includes execution planning, pitch support, feature inventory, and rollout verification notes.

4. **Deployment quality is part of the product story**
   Public hosting, smoke verification, and asset/route stability are treated as first-class delivery concerns.

5. **Mobile interaction quality is taken seriously**
   The payment flow was refined around tap behavior, QR verification, iPhone PWA constraints, and retry states because those are real checkout risks.

## Technical Proof Signals

- Next.js 15 + React 19 + TypeScript codebase
- Firebase Authentication-backed customer access flow
- Stellar payment request and confirmation helpers
- Soroban mainnet PaymentRegistry logging and public verification endpoint
- App Hosting deployment to `stelllar` in `asia-east1`
- Build verification via `npm run build`
- Smoke-test automation for public routes and assets
- Repository docs covering state cursor, feature inventory, project map, pitch script, and execution plan

## What I Would Improve Next

1. Strengthen local-to-production parity around auth and demo data behavior.
2. Add more explicit observability around checkout latency and confirmation timing.
3. Expand runbooks for payment delay scenarios and recovery paths.
4. Add richer reviewer-facing documents such as architecture deep dives and release notes.

## Outcome

This portfolio demonstrates more than UI implementation. It shows how I think about customer payments as an enterprise workflow: tenant scope, identity, confirmation, receipts, deployment integrity, and demo reliability all working together.

For reviewers, the value of this repo is not just that it uses Stellar. The value is that it treats payment UX as a trust problem, an operational proof problem, and a delivery-quality problem at the same time.