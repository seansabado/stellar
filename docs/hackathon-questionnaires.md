# Hackathon Submission Questionnaires

## Question 1 — What is your Project Name?

LaundromatAI x StellarPay

## Question 2 — What is your Problem Statement?

In the Philippines and across Southeast Asia, many laundry MSMEs still operate with fragmented payments: cash, screenshots, manual e-wallet confirmation, and delayed remittance. This creates slow cash conversion, weak payment traceability, and high daily reconciliation overhead.

For multi-branch operators, the problem compounds. Staff and owners spend time fixing mismatched order and payment statuses, handling disputes with incomplete proof, and manually consolidating reports. Customers also experience checkout friction and delayed confirmation, which reduces trust and repeat business.

This payment friction prevents MSMEs from scaling confidently from one branch to many, because the payment layer is not real-time, auditable, or operations-native.

## Question 3 — Proposed Solution

LaundromatAI x StellarPay is a branch-operations commerce platform that embeds Stellar-based payments directly into laundry order workflows.

Each order gets a deterministic payment identity, payment is verified on-chain, and confirmed transaction data is synced automatically back to the operational record. Branch dashboards and transaction history update in near real time, giving owners and staff one source of truth for both order status and payment status.

This eliminates manual reconciliation, reduces disputes, improves checkout reliability, and gives MSMEs a low-fee, cross-border-ready payment foundation.

## Question 4 — Target Users / Audience

Our primary audience is laundry MSMEs in the Philippines and SEA, especially businesses moving from single-store operations to multi-branch management.

Primary users include independent laundromat owners, multi-branch operators, frontline staff handling checkout, and finance/admin teams responsible for reconciliation and reporting. Secondary users include ecosystem partners such as anchor/payment providers, franchise networks, and SME-enablement programs.

## Question 6 — Team Member Names & Roles

Sean Raynon — Founder & CTO, LaundromatAI

Sean leads product strategy, architecture, and full-stack execution. He combines deep MSME workflow design with practical engineering delivery across frontend, backend, cloud infrastructure, and payment integration.

In this project, Sean defines the commerce problem, designs the multi-tenant and branch-level data model, architects Stellar payment verification and deterministic transaction identity, and leads end-to-end delivery from prototype to deployment-ready workflow.

The key strength is execution depth: not just proposing a blockchain payment concept, but integrating it into real merchant operations where order state, payment state, and audit trails remain synchronized and usable by frontline teams.

## Question 7 — Initial Technical Approach

We are building a production-lean architecture focused on real MSME usability and deployment readiness.

Our product stack uses React + TypeScript for fast, reliable operator workflows, with Firebase Auth, Firestore, and Cloud Functions as the secure backend. The core data model is tenant-scoped and branch-scoped, with canonical order records at `/tenants/{tenantId}/branches/{branchId}/orders/{orderId}` and supporting transaction views for history and observability.

On the Stellar side, we use deterministic payment identity (`PAY-{ORDER_ID}`), on-chain verification-driven status updates, duplicate-intent protection for already-paid orders, and a reconciliation endpoint to repair incomplete confirmed rows. This gives us both technical rigor and operational reliability.

Infrastructure-wise, the system is cloud-hosted, API-driven, and designed for multi-tenant growth, making it feasible to scale across MSME branches and new SEA markets without rewriting the core payment architecture.

## Question 8 — Expected Stellar Integration

Stellar is our settlement and verification rail for merchant payments.

We expect Stellar integration to deliver fast and low-cost settlement, deterministic linking between business orders and on-chain transactions, and complete payment auditability for dispute reduction and merchant trust.

Operationally, on-chain confirmation becomes the trigger for payment state transitions in our branch workflow. Strategically, this creates a cross-border-ready payment layer that can extend to anchor-compatible cash-in/cash-out and regional payout scenarios as adoption grows.

Our goal is to make Stellar practical for everyday MSME commerce, not only for crypto-native users.

Current proof status:

- Soroban PaymentRegistry is deployed on Stellar Mainnet at `CANEW7EC3W6BMVDJQNRDVTUZZ32QWIY5LNOEGWPVRWYF7LEJUUWEYWKB`.
- Confirmed payments are logged on-chain via `record()`.
- Judges can verify independently using:
	- `https://stellar.laundromatai.app/api/contract/verify?orderId=LPX0034`
	- `https://stellar.laundromatai.app/api/contract/verify?orderId=PAY-LPX0034`