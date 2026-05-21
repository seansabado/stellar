# Contributing to LaundromatAI x StellarPay

Thank you for your interest in contributing. This repository is a public engineering showcase for a Stellar-based payment workflow built for MSME laundry operations.

## Architecture Overview

```
src/app/          — Next.js 15 App Router pages and API routes
src/components/   — Shared UI components
server/utils/     — Stellar SDK integration and payment state logic
public/           — Static assets including stellar.toml (SEP-0001)
docs/             — Architecture, showcase, and pitch documentation
```

**Key files:**
- `server/utils/stellar.ts` — Stellar Horizon interaction (create payment, poll confirmation)
- `server/utils/paymentState.ts` — In-memory payment state store with idempotency
- `src/app/api/create-stellar-payment/route.ts` — POST endpoint: creates a Stellar payment request
- `src/app/api/check-stellar-payment/route.ts` — GET endpoint: polls Stellar Horizon for confirmation
- `src/app/pay/[orderId]/page.tsx` — Customer-facing checkout page

## Getting Started

```bash
git clone https://github.com/seansabado/stellar.git
cd stellar
npm install
cp .env.example .env.local   # fill in Firebase + Stellar credentials
npm run dev:once              # starts on localhost:3001
```

## Demo Tenant

All development and testing uses the scoped demo tenant:

- Tenant ID: `demo-tenant-ph`
- Network: Stellar Testnet
- Demo order: `demo-order-001`

Do not introduce code that reads from or writes to any tenant outside `demo-tenant-ph` in the demo flow.

## Contribution Guidelines

- Keep changes scoped and incremental
- Run `npm run build` before submitting a PR — zero build errors required
- Keep the Stellar integration on testnet unless explicitly approved
- Do not commit `.env.local`, `.next/`, or `node_modules/`
- Follow the existing TypeScript strict mode conventions

## Pull Request Process

1. Fork the repo and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes with clear, focused commits
3. Ensure `npm run build` passes with zero errors
4. Open a PR with a description of what changed and why
5. Reference any related issues or docs

## Questions

Open a GitHub Discussion or email [hello@laundromatai.app](mailto:hello@laundromatai.app).
