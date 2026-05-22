# Interview Walkthrough

## Purpose

This document is a concise guide for explaining the StellarPay showcase in an interview, technical review, or architecture discussion.

The goal is not to narrate every component. The goal is to explain the engineering judgment behind the repo clearly and quickly.

## 60-Second Version

"This repo is a public showcase of a customer-facing payment experience for LaundromatAI x StellarPay. It focuses on a mobile-first flow where a signed-in customer sees tenant-scoped orders, enters a guided payment route, receives confirmation status, and can review receipts afterward. The interesting part is not only the UI. It is the combination of tenant-scoped order access, auth-backed checkout, payment proof visibility, deployment verification, and mobile reliability work around the final payment moment."

## 3-Minute Walkthrough

### 1. Start With The Problem

Frame the repo around the real product risk:

- customer payment flows must be trustworthy
- the user needs to know whether payment actually completed
- support needs proof after payment
- mobile interaction quality matters because this happens on a phone

Suggested phrasing:

"I built this showcase to demonstrate how I think about customer payments as an operational workflow, not just a front-end screen. The key concerns were tenant scope, authenticated access, confirmation proof, and mobile usability under real checkout conditions."

### 2. Explain The Main Flow

Use this sequence:

1. customer signs in through Firebase Auth
2. orders resolve under the demo tenant `demo-tenant-ph`
3. customer opens the pay route for an order
4. customer verifies the merchant QR and explicitly triggers `PAY NOW`
5. the app polls for pending-to-confirmed payment state
6. receipt history preserves proof after payment

Suggested phrasing:

"The flow is intentionally narrow and clear. I wanted the app to demonstrate a full order-to-payment-to-receipt journey that a reviewer can understand quickly."

### 3. Call Out The Hard Parts

Emphasize what actually required engineering decisions:

- tenant-scoped order resolution
- auth before sensitive actions
- confirmation visibility after pay
- Soroban mainnet logging and independent registry verification
- route and asset stability in deployment
- touch reliability in iPhone/PWA-like conditions

Suggested phrasing:

"The tricky parts were not just payment helpers. The harder work was around trust boundaries and user confidence: making sure the right tenant context is shown, the user is authenticated, the payment state can be checked, and the mobile interaction doesn’t break at the moment of payment."

## 5-10 Minute Deep Dive Path

If the interviewer wants more detail, use this order:

1. [README.md](../README.md)
2. [docs/architecture.md](architecture.md)
3. [docs/project-index-map.md](project-index-map.md)
4. [src/app/pay/[orderId]/page.tsx](../src/app/pay/%5BorderId%5D/page.tsx)
5. [src/components/QRScanner.tsx](../src/components/QRScanner.tsx)
6. [src/app/api/create-stellar-payment/route.ts](../src/app/api/create-stellar-payment/route.ts)
7. [src/app/api/check-stellar-payment/route.ts](../src/app/api/check-stellar-payment/route.ts)
8. [server/utils/stellar.ts](../server/utils/stellar.ts)

## Questions You Should Expect

### Why did you scope it to `demo-tenant-ph`?

Because the showcase is meant to prove a reliable end-to-end customer payment flow under one controlled tenant context. That keeps the trust boundary explicit and avoids fuzzy demo behavior.

### Why use Firebase Auth instead of a separate OAuth path?

Because the wider LaundromatAI ecosystem already uses Firebase Auth and Google sign-in. Reusing that identity model makes the showcase more realistic and avoids inventing a second authentication surface.

### What is the real engineering value here beyond UI?

The engineering value is in connecting customer UX to operational proof. The repo demonstrates how identity, tenant scoping, confirmation checks, and receipts work together to make payment outcomes understandable and supportable.

It also shows independent proof on Soroban mainnet, where `record()` writes are queryable through `get()` and bridged through `/api/contract/verify` for judge-facing verification.

### What are the current tradeoffs or limitations?

- parity between local and production is still not perfect
- demo reliability has been prioritized over generalized platform behavior
- mobile payment interactions still need careful real-device validation

## Strong Closing Statement

Use this if the conversation needs a concise finish:

"What I wanted this repo to show is that I do not think about payments as a single API integration. I think about them as a trust workflow: the right customer, the right tenant context, a credible confirmation path, and post-payment proof that survives the moment of checkout."