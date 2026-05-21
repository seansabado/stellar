# stellar

[![Live Site](https://img.shields.io/badge/live-stellar.laundromatai.app-0d6c63)](https://stellar.laundromatai.app)
[![Hosted Backend](https://img.shields.io/badge/app%20hosting-stelllar-1d4ed8)](https://stelllar--seanraynon.asia-east1.hosted.app)
[![Official Website](https://img.shields.io/badge/website-laundromatai.app-f97316)](https://laundromatai.app/)
[![SaaS Demo](https://img.shields.io/badge/saas%20demo-app.laundromatai.app-6366f1)](https://app.laundromatai.app/app?demo=1)
[![Stack](https://img.shields.io/badge/stack-Next.js%2015%20%7C%20React%2019%20%7C%20TypeScript-7c3aed)](https://github.com/seansabado/stellar)
[![CI](https://github.com/seansabado/stellar/actions/workflows/post-deploy-smoke.yml/badge.svg?branch=main)](https://github.com/seansabado/stellar/actions/workflows/post-deploy-smoke.yml)
[![stellar.toml](https://img.shields.io/badge/stellar.toml-SEP--0001-6366f1)](https://stellar.laundromatai.app/.well-known/stellar.toml)
[![Last Commit](https://img.shields.io/github/last-commit/seansabado/stellar?label=last%20commit)](https://github.com/seansabado/stellar/commits/main)
[![Pitch Deck](https://img.shields.io/badge/pitch%20deck-Google%20Slides-ea4335)](https://docs.google.com/presentation/d/1n6tGEixR1ePmFnOjmU1daJfj2xHD21QKashvyntPLKI/edit?usp=sharing)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production--grade-22c55e)](https://stellar.laundromatai.app)

[![Network](https://img.shields.io/badge/stellar-mainnet-0d6c63)](https://stellar.expert/explorer/public/account/GBDZXAJCTGPMASCYPPE6V5NYRBWFFRYSTL4QV72IJ6JYQEI62QIPEQMG)

---

## 🧩 Problem

Every day, thousands of laundromat operators in the Philippines face the same four problems:

| Pain Point | What It Costs |
|---|---|
| Cash + e-wallet screenshots as "proof" | Hours of manual reconciliation daily |
| No real-time payment confirmation | Staff handle disputes instead of orders |
| Delayed remittance | Cash stuck, can't pay suppliers or staff |
| Multi-branch chaos | No single source of truth across locations |

The root cause: the payment layer is disconnected from the operation. Orders live in one place. Payment proof lives in someone's phone. For multi-branch operators this compounds — staff and owners spend time fixing mismatched statuses, handling disputes with incomplete proof, and manually consolidating reports.

## 🌟 Vision

One payment layer that connects laundry counter operations to the Stellar blockchain — fast enough for ₱50 orders, auditable enough for multi-branch reconciliation, and open enough to serve Southeast Asia's 600,000+ MSME laundry operators.

## 🎯 Purpose

StellarPay resolves tenant-scoped customer orders, guides customers through a two-step payment flow, confirms Stellar payments from pending to verified, and persists receipts for replayable proof. The goal: a payment flow that is easy for customers, trustworthy for operators, and auditable for support teams.

## 👥 Target Users

There are 600,000+ laundry MSMEs across Southeast Asia, with approximately 120,000 laundromat and laundry shop operators in the Philippines alone. This segment is growing fast — driven by urban migration and middle-class outsourcing — yet is almost entirely underserved by fintech.

**Primary users:**
- Independent laundromat owners
- Multi-branch operators
- Frontline staff handling checkout
- Finance and admin teams responsible for reconciliation and reporting

**Secondary users:** anchor/payment providers, franchise networks, and SME-enablement programs.

## ✨ Features

**Customer Experience**
- Mobile-first app shell with top and bottom navigation
- Google sign-in flow for customer session continuity
- Orders list with operational filters and action states
- Dedicated pay route per order with receipt history and profile views

**Payment Workflow**
- Stellar payment request creation
- Two-step checkout flow with merchant QR verification and explicit `PAY NOW`
- Confirmation polling with pending and confirmed proof states
- Receipt persistence for post-payment history
- Transaction reference visibility for support and audit trails
- On-chain payment audit log via Soroban `PaymentRegistry` smart contract

**Reliability**
- SaaS/demo order fallback path for continuity
- Service worker safeguards for local development stability
- Post-deploy smoke test automation for public routes and assets

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 |
| UI | React 19 + TypeScript |
| Identity | Firebase Authentication |
| Payment integration | Stellar SDK + Soroban smart contract |
| Smart contract | Rust / Soroban SDK 22 (wasm32v1-none, 3,843 bytes) |
| APIs | Next.js route handlers |
| Hosting | Firebase App Hosting (`stelllar`, `asia-east1`) |

## 🚀 How to Run Locally

**Prerequisites:** Node.js 20+, npm 10+

```bash
npm install
npm run dev:once
```

Open: http://localhost:3001

```bash
# Production build check
npm run build

# Production smoke check
npm run smoke:production
```

## 🌐 Deployment

Deployed via Firebase App Hosting (`stelllar`, region `asia-east1`).

- Build: `npm run build` · Run: `npm run start`
- Custom domain: [stellar.laundromatai.app](https://stellar.laundromatai.app)
- Backend: [stelllar--seanraynon.asia-east1.hosted.app](https://stelllar--seanraynon.asia-east1.hosted.app)

### Testnet

- Contract Address: `CCLFE47ZTMIV5UGJZOI7KIVAKXG7ZQAMROHLROHMHRCDPEZWE7MU7G33`
- Account: `GBK4EPWBVRS5KLW6AR2QTPFD5ZUJIVCP3KTEY2CIF6QOCAYY4SDZO6WC`
- Explorer: [Stellar Expert — Soroban Contract (Testnet)](https://stellar.expert/explorer/testnet/contract/CCLFE47ZTMIV5UGJZOI7KIVAKXG7ZQAMROHLROHMHRCDPEZWE7MU7G33)
- 📸 Screenshot — Stellar Expert Contract (Testnet)

  ![Testnet Contract Screenshot](./docs/screenshots/testnet-contract-stellar-expert-2026-05-21.png)

- 📸 Screenshot — Stellar Expert Account (Testnet)

  ![Testnet Account Screenshot](./docs/screenshots/testnet-account-stellar-expert-2026-05-21.png)

### Mainnet

- App Address: `GBDZXAJCTGPMASCYPPE6V5NYRBWFFRYSTL4QV72IJ6JYQEI62QIPEQMG`
- Explorer: [Stellar Expert — Mainnet Account](https://stellar.expert/explorer/public/account/GBDZXAJCTGPMASCYPPE6V5NYRBWFFRYSTL4QV72IJ6JYQEI62QIPEQMG)
- 📸 Screenshot — Stellar Expert (Mainnet)

  ![Mainnet Screenshot](./docs/screenshots/mainnet-account-stellar-expert-2026-05-21.png)

## 🎥 Demo

- 🔗 Live App: [stellar.laundromatai.app](https://stellar.laundromatai.app)
- 🎬 Demo Video: [youtu.be/j7AWyGVniZg](https://youtu.be/j7AWyGVniZg)
- 🖼️ Pitch Deck: [Google Slides](https://docs.google.com/presentation/d/1n6tGEixR1ePmFnOjmU1daJfj2xHD21QKashvyntPLKI/edit?usp=sharing)

## 👨‍💻 Team

**Sean Raynon**
Founder & CTO — LaundromatAI

| | |
|---|---|
| 📧 Email | [hello@laundromatai.app](mailto:hello@laundromatai.app) |
| 📞 Phone | [+1 (877) 415-5442](tel:+18774155442) |
| 🌐 Website | [laundromatai.app](https://laundromatai.app/) |
| 💼 LinkedIn | [linkedin.com/in/seanraynon](https://www.linkedin.com/in/seanraynon/) |
| 👤 Personal | [seanraynon.com](https://seanraynon.com/) |
| 📰 Media Kit | [laundromatai.app/media](https://laundromatai.app/media) |
| 📍 Address | 254 Chapman Rd, Ste 208, Newark, Delaware 19702, USA |

---

> **Project Status: Production-Grade — Stellar Mainnet Live**  
> Full payment stack deployed on production infrastructure — Firebase App Hosting, Firestore, CI/CD, custom domain, SEP-0001 compliant `stellar.toml`. End-to-end XLM payments are confirmed on-chain and verifiable on Stellar Horizon. **Now running on Stellar Mainnet.** Payments settle against the live public ledger at merchant account `GBDZXAJCTGPMASCYPPE6V5NYRBWFFRYSTL4QV72IJ6JYQEI62QIPEQMG`.

![StellarPay Architecture Banner](docs/assets/architecture-banner.svg)

## Demo Video

[![Watch the demo](https://img.youtube.com/vi/j7AWyGVniZg/maxresdefault.jpg)](https://youtu.be/j7AWyGVniZg)

> Full end-to-end walkthrough: SaaS order → customer checkout → Stellar payment confirmation → receipt history.

**Stellar-powered payments for laundry MSMEs.** Real orders, on-chain confirmation, and receipt persistence — running on production infrastructure with verifiable Horizon transactions. [Try the live demo →](https://stellar.laundromatai.app)

LaundromatAI × StellarPay connects tenant-scoped order visibility, identity-backed customer access, Stellar ledger verification, and receipt history into one fast, auditable checkout flow — built for frontline operations in the Philippines and Southeast Asia.

## Soroban Smart Contract

**PaymentRegistry** — on-chain payment audit log for MSME orders.

| | |
|---|---|
| Contract ID | `CCLFE47ZTMIV5UGJZOI7KIVAKXG7ZQAMROHLROHMHRCDPEZWE7MU7G33` |
| Network | Stellar Testnet |
| WASM size | 3,843 bytes |
| Source | [contracts/payment-registry/src/lib.rs](contracts/payment-registry/src/lib.rs) |

**Exported functions:**
- `record(order_id, amount_stroops, payer, tx_hash, network) → bool` — writes a confirmed payment to persistent contract storage (idempotent)
- `get(order_id) → Option<PaymentRecord>` — retrieves a payment record by order ID
- `count() → u32` — total payments recorded on this contract

**Integration:** After Horizon confirms an XLM payment in `server/utils/stellar.ts`, the backend automatically calls `record()` on the contract. The call is fire-and-forget and does not block the customer confirmation response.

**Explorer links:**
- [Stellar Expert — Contract](https://stellar.expert/explorer/testnet/contract/CCLFE47ZTMIV5UGJZOI7KIVAKXG7ZQAMROHLROHMHRCDPEZWE7MU7G33)
- [Stellar Lab — Contract](https://lab.stellar.org/r/testnet/contract/CCLFE47ZTMIV5UGJZOI7KIVAKXG7ZQAMROHLROHMHRCDPEZWE7MU7G33)


## Stellar Explorer Accounts

- Testnet account: [stellar.expert/testnet](https://stellar.expert/explorer/testnet/account/GBK4EPWBVRS5KLW6AR2QTPFD5ZUJIVCP3KTEY2CIF6QOCAYY4SDZO6WC)
- Public account: [stellar.expert/public](https://stellar.expert/explorer/public/account/GBDZXAJCTGPMASCYPPE6V5NYRBWFFRYSTL4QV72IJ6JYQEI62QIPEQMG)

## Quick Entry Points

- Quick demo script: [docs/demo-script.md](docs/demo-script.md)
- Architecture overview: [docs/architecture.md](docs/architecture.md)
- Hiring manager one-pager: [docs/hiring-manager.md](docs/hiring-manager.md)
- Case study: [docs/case-study.md](docs/case-study.md)


## Visual Preview

![StellarPay Social Preview](docs/assets/social-preview.svg)

## Screenshots

Below are sample UI screens from the StellarPay (LaundromatAI × StellarPay) production app:

<table>
	<tr>
		<th>Login Screen</th>
		<th>Dashboard</th>
		<th>Orders</th>
	</tr>
	<tr>
		<td><img src="docs/screenshots/0-login-iPhone-13-PRO-stellar.laundromatai.app.png" alt="Login" width="200"/></td>
		<td><img src="docs/screenshots/1-dashboard-iPhone-13-PRO-stellar.laundromatai.app.png" alt="Dashboard" width="200"/></td>
		<td><img src="docs/screenshots/2-orders-iPhone-13-PRO-stellar.laundromatai.app.png" alt="Orders" width="200"/></td>
	</tr>
	<tr>
		<th>Profile</th>
		<th>Checkout</th>
		<th>QR Capture</th>
	</tr>
	<tr>
		<td><img src="docs/screenshots/3-profile-iPhone-13-PRO-stellar.laundromatai.app.png" alt="Profile" width="200"/></td>
		<td><img src="docs/screenshots/4-checkout-iPhone-13-PRO-stellar.laundromatai.app.png" alt="Checkout" width="200"/></td>
		<td><img src="docs/screenshots/5-qr-capture-iPhone-13-PRO-stellar.laundromatai.app.png" alt="QR Capture" width="200"/></td>
	</tr>
	<tr>
		<th>Stellar Ledger</th>
		<th>Ledger History</th>
		<th>QR Verified</th>
	</tr>
	<tr>
		<td><img src="docs/screenshots/6-stellar-ledger-iPhone-13-PRO-stellar.laundromatai.app.png" alt="Stellar Ledger" width="200"/></td>
		<td><img src="docs/screenshots/7-ledger-history-iPhone-13-PRO-stellar.laundromatai.app.png" alt="Ledger History" width="200"/></td>
		<td><img src="docs/screenshots/8-qr-code-verified-iPhone-13-PRO-stellar.laundromatai.app.png" alt="QR Verified" width="200"/></td>
	</tr>
	<tr>
		<th>Ledger Confirmation</th>
		<th>Mainnet Payment History</th>
		<th>Mainnet Order Success</th>
	</tr>
	<tr>
		<td><img src="docs/screenshots/9-ledger-confirmation-iPhone-13-PRO-stellar.laundromatai.app.png" alt="Ledger Confirmation" width="200"/></td>
		<td><img src="docs/screenshots/10-mainnet-payment-history-iPhone-13-PRO-stellar.laundromatai.app.png" alt="Mainnet Payment History" width="200"/></td>
		<td><img src="docs/screenshots/11-mainnet-order-success-iPhone-13-PRO-stellar.laundromatai.app.png" alt="Mainnet Order Success" width="200"/></td>
	</tr>
</table>

## Why Stellar?

For MSME operators in the Philippines and SEA, traditional payment rails create three hard problems:

| Problem | Stellar's Answer |
|---|---|
| **Settlement speed** | Transactions confirmed in under 5 seconds, 24/7/365 — no bank windows, no batch delays |
| **Cost** | Fractions of a US penny per transaction — viable for ₱50–₱500 laundry orders |
| **Auditability** | Every payment is on-chain and immutable — eliminates screenshot disputes between staff and customers |
| **Cross-border readiness** | Built-in anchor ecosystem enables PHP ↔ USDC and remittance flows without rewiring the payment layer |
| **No chargebacks** | Finality is real — confirmed means confirmed, no reversal risk for merchants |

For an MSME commerce platform, Stellar is the only rail that is simultaneously fast enough for counter operations, cheap enough for micro-transactions, and auditable enough for dispute resolution.

## Business Outcomes

- Faster customer checkout: mobile-first payment flow reduces friction at the counter.
- Better trust: status transitions, ledger references, and receipt history make payment outcomes clear.
- Safer operations: tenant-scoped order resolution and auth-gated routes reduce ambiguity in demo and pilot use.
- Better demo readiness: the app is designed to show an end-to-end customer payment journey, not just isolated screens.

## Roadmap

| Phase | Timeline | Focus |
|---|---|---|
| Phase 1 | Now | Single-branch demo, Soroban on-chain payment verification |
| Phase 2 | Q3 2026 | Multi-branch dashboard sync, USDC anchor integration |
| Phase 3 | Q4 2026 | Soroban escrow for franchise multi-party settlement |
| Phase 4 | 2027 | Full SEA rollout: Indonesia, Malaysia, Vietnam |

The Soroban contract layer is designed to evolve — from payment audit log today, to multi-party escrow and franchise royalty splits as the product moves to mainnet.

## What This Repository Demonstrates

| Area | What it demonstrates |
| --- | --- |
| Customer checkout | Guided order-to-payment experience with scan, pay, confirmation, and receipt history |
| Tenant isolation | Customer data and order flow scoped to the demo tenant `demo-tenant-ph` |
| Identity-backed access | Firebase customer sign-in gate before sensitive payment actions |
| Payment proof | Confirmation polling, transaction references, timeline state, and receipt persistence |
| Operational resilience | Demo/live fallback order loading, runtime hardening, service worker safeguards |
| Deployment discipline | Firebase App Hosting rollout model with smoke-test automation and production verification |

## Architecture Flow

```mermaid
flowchart LR
	A[Customer Sign-In] --> B[Tenant-Scoped Orders]
	B --> C[Checkout Intent Creation]
	C --> D[Stellar Payment Request]
	D --> E[Payment Status Polling]
	E --> F[Confirmed Receipt History]
	E --> G[Support and Audit Visibility]
```

## Read Path By Audience

- Recruiter or judge, 2-3 minutes:
	- Start with this README
	- Then read [docs/demo-script.md](docs/demo-script.md)
	- Then read [docs/case-study.md](docs/case-study.md)
	- Then read [docs/showcase.md](docs/showcase.md)
	- Then use [docs/judge-pitch-script.md](docs/judge-pitch-script.md)

- Engineering manager, 5-8 minutes:
	- Start with [docs/hiring-manager.md](docs/hiring-manager.md)
	- Then read [docs/architecture.md](docs/architecture.md)
	- Then review [docs/project-index-map.md](docs/project-index-map.md)
	- Then read [docs/all-features.md](docs/all-features.md)
	- Then read [docs/resume.md](docs/resume.md)

- Architect, CTO, or technical reviewer, 10-15 minutes:
	- Start with [docs/architecture.md](docs/architecture.md)
	- Then read [docs/interview-walkthrough.md](docs/interview-walkthrough.md)
	- Then review [docs/stellar-hackathon-execution-plan.md](docs/stellar-hackathon-execution-plan.md)
	- Then read [docs/customer-oauth-flow.md](docs/customer-oauth-flow.md)
	- Then review [docs/nextjs-migration.md](docs/nextjs-migration.md)

## Product Walkthrough

### 60-Second Demo Path

1. Open the customer app.
2. Sign in and show tenant-scoped orders.
3. Open an unpaid order and show the PHP amount.
4. Verify the merchant QR and trigger `PAY NOW`.
5. Show the payment transition from pending to confirmed.
6. Open History and show the saved receipt.

### Judge-Facing Proof Points

- Tenant-scoped customer flow tied to `demo-tenant-ph`
- Identity-backed customer session before payment actions
- PHP pricing and customer-facing payment messaging
- Payment confirmation timeline and receipt persistence
- Hosted deployment on Firebase App Hosting

## Repository Structure

### Primary App Routes

- [src/app/page.tsx](src/app/page.tsx) - customer dashboard
- [src/app/orders/page.tsx](src/app/orders/page.tsx) - orders list and action lane
- [src/app/pay/[orderId]/page.tsx](src/app/pay/%5BorderId%5D/page.tsx) - checkout and payment proof flow
- [src/app/history/page.tsx](src/app/history/page.tsx) - payment receipts and history
- [src/app/profile/page.tsx](src/app/profile/page.tsx) - customer profile and recent transaction context

### Supporting Modules

- [src/components/QRScanner.tsx](src/components/QRScanner.tsx) - merchant QR verification flow
- [src/components/AddToHomeScreenBanner.tsx](src/components/AddToHomeScreenBanner.tsx) - install prompt UX
- [src/lib/customerAuth.tsx](src/lib/customerAuth.tsx) - customer auth provider
- [src/lib/clientDemoOrders.ts](src/lib/clientDemoOrders.ts) - tenant-scoped order resolution and fallback
- [src/lib/receiptStore.ts](src/lib/receiptStore.ts) - receipt persistence
- [server/utils/stellar.ts](server/utils/stellar.ts) - Stellar request, confirmation, and Soroban contract helpers
- [contracts/payment-registry/src/lib.rs](contracts/payment-registry/src/lib.rs) - Soroban PaymentRegistry smart contract

## Documentation Map

- [docs/showcase.md](docs/showcase.md) - one-page project showcase
- [docs/demo-script.md](docs/demo-script.md) - 60-second and 3-minute demo walkthrough
- [docs/case-study.md](docs/case-study.md) - engineering case study narrative
- [docs/hiring-manager.md](docs/hiring-manager.md) - hiring manager one-pager
- [docs/architecture.md](docs/architecture.md) - system architecture overview
- [docs/interview-walkthrough.md](docs/interview-walkthrough.md) - interview-ready walkthrough guide
- [docs/project-index-map.md](docs/project-index-map.md) - route and module ownership map
- [docs/all-features.md](docs/all-features.md) - active feature inventory
- [docs/resume.md](docs/resume.md) - state cursor, verification notes, and session ledger
- [docs/stellar-hackathon-execution-plan.md](docs/stellar-hackathon-execution-plan.md) - execution plan and win condition
- [docs/judge-pitch-script.md](docs/judge-pitch-script.md) - judge-facing walkthrough script
- [docs/hackathon-questionnaires.md](docs/hackathon-questionnaires.md) - copy/paste submission answers for hackathon forms
- [docs/customer-oauth-flow.md](docs/customer-oauth-flow.md) - auth flow notes
- [docs/win-sprint-readiness.md](docs/win-sprint-readiness.md) - delivery readiness notes

## Security and Governance Direction

- Customer routes are auth-gated before sensitive actions
- Payment flow remains tenant-scoped to demo customer context
- Receipt history provides transaction proof visibility after confirmation
- Deployment verification and smoke checks are treated as part of delivery quality

This repository is intended to be a professional public showcase. It should help reviewers understand engineering judgment, payment-flow reliability concerns, and customer experience design without requiring a full internal system walkthrough.

## Current Status

- App Hosting deployment is active
- Core customer flows are operational
- Runtime and asset stability hardening has been applied
- Payment UX and mobile tap reliability have been actively refined
- Local build verification is passing

## Known Limits

- Local-to-production parity is not yet perfect because auth and data behavior differ by environment
- Demo flow is intentionally scoped to `demo-tenant-ph`
- Some flows still prioritize demo reliability over full production generalization


