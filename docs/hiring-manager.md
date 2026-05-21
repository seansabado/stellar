# Hiring Manager One-Pager

**Repository:** [stellar](https://github.com/seansabado/stellar)  
**Custom domain:** [stellar.laundromatai.app](https://stellar.laundromatai.app)  
**Hosted backend:** [stelllar--seanraynon.asia-east1.hosted.app](https://stelllar--seanraynon.asia-east1.hosted.app)

---

## What This Repo Demonstrates

This repository is a public engineering showcase for a customer-facing payment experience connected to a broader SaaS platform context.

It demonstrates judgment in three areas that matter in production-facing software:

- customer workflow design under operational constraints
- payment confirmation and proof visibility
- delivery discipline across routing, hosting, and post-deploy verification

### Core Competencies Evidenced

| Area | What you will see |
| --- | --- |
| **Customer payment UX** | Checkout is treated as a guided workflow, not just a button and API call |
| **Tenant-scoped thinking** | Orders and payment actions are constrained to `demo-tenant-ph` demo context |
| **Identity-backed actions** | Protected routes require authenticated customer context |
| **Operational proof** | Payment confirmation is surfaced through polling, status, and receipt persistence |
| **Mobile-first engineering** | The app is tuned for customer-device usage, including PWA and touch reliability concerns |
| **Deployment ownership** | Firebase App Hosting rollout behavior, smoke checks, and production verification are part of the repo story |
| **Documentation discipline** | Feature inventory, state cursor, showcase summary, and hackathon execution plan are maintained alongside implementation |

---

## What Problems This Addresses

These are real production-grade concerns in customer payment systems:

1. **The user can see the order, but not trust the payment outcome**
2. **The flow works in happy-path demos but becomes unclear under delay or retry conditions**
3. **Mobile interactions degrade at the exact moment checkout matters most**
4. **Support teams need post-payment proof, not just a temporary success screen**
5. **Deployment or asset instability can undermine otherwise-correct product behavior**

---

## What This Repo Does Not Claim

- It is not the full internal LaundromatAI production codebase
- It does not expose proprietary schemas, real customer data, or secrets
- It is not presented as a complete enterprise payment platform
- Demo data and constraints are intentionally scoped for safe public review

---

## What To Look At In Order

1. [README.md](../README.md) for scope, architecture flow, and repo positioning
2. [docs/showcase.md](showcase.md) for the one-page summary
3. [docs/case-study.md](case-study.md) for the engineering framing behind the repo
4. [docs/project-index-map.md](project-index-map.md) for route and module ownership
5. [docs/all-features.md](all-features.md) for current capability inventory
6. [docs/stellar-hackathon-execution-plan.md](stellar-hackathon-execution-plan.md) for delivery and win-condition framing
7. [docs/resume.md](resume.md) for current sprint, verification notes, and recent fixes

---

## Relevant Experience Context

This showcase reflects the kind of work involved in building:

- customer-facing payment experiences
- tenant-aware SaaS systems
- Firebase-backed application flows
- mobile-first operational products
- demo and rollout environments that still require engineering discipline

The public code here is useful for evaluating technical judgment, product framing, and execution quality without requiring access to private platform code.

---

## Why This Matters In Hiring Review

The signal in this repo is not just that it uses Next.js, Firebase, or Stellar.

The stronger signal is that it treats a payment flow as a system with multiple responsibilities:

- customer trust
- operational safety
- proof after payment
- mobile execution quality
- deployment reliability

That combination is usually a better indicator of engineering maturity than framework familiarity alone.