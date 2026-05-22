# Speaker Notes — LaundromatAI x StellarPay
**Build on Stellar Philippines Hackathon**
*~30 seconds per slide*

---

## Slide 1 — Title

> **Hook:** It's live on mainnet right now — open it on your phone.

Hi, I'm Sean, founder of LaundromatAI. We built a Stellar-based payment system for laundry MSMEs in the Philippines — and it's live right now at stellar.laundromatai.app. You can open it on your phone. That's mainnet, not a demo environment. Every laundry order has a payment. We made that payment fast, on-chain, and tied directly to the business record. Here's why that matters.

---

## Slide 2 — The Problem

> **Hook:** A GCash screenshot is not a receipt — and every laundry owner in the Philippines knows it.

A customer pays for their laundry via GCash and sends a screenshot. The owner is at a different branch on Monday trying to match that screenshot to an order. Manually. That's the daily reality for tens of thousands of operators in the Philippines. Cash and e-wallet screenshots are the only "proof." No real-time confirmation. No single source of truth. The payment layer is completely disconnected from operations — and we fix that.

---

## Slide 3 — The Opportunity

> **Hook:** Estimated 600,000+ laundry MSMEs across Southeast Asia. Zero fintech tools built for them.

Industry-inferred estimates place the Philippines at around 8,000 to 15,000 laundromat and laundry shop operators (not 120,000): Metro Manila (~3,000 to 4,000), Cebu (~800 to 1,200), Davao (~600 to 900), and the rest of the Philippines (~4,000 to 8,000). Across Southeast Asia, 600,000+ laundry MSMEs is a plausible industry estimate, not an official statistic. These ranges align with machine import volumes, detergent supplier distribution, franchise network sizes, and MSME density per barangay, and no official PSA total exists for laundry shop counts. This market continues to grow, yet fintech has almost entirely ignored it. Most payment tools target e-commerce, not service businesses. The fastest-growing operators — expanding from one branch to ten, twenty — are still doing it with Excel and WhatsApp screenshots. Whoever builds the payment layer for this segment owns the operations stack.

---

## Slide 4 — Our Solution

> **Hook:** One flow. No screenshots, no follow-up, no disputes.

One flow: Order → Payment → Confirmation → Receipt. Customer opens their order, sees the PHP amount, pays via Stellar. The payment is linked to a deterministic `PAY-{ORDER_ID}` identity. Horizon confirms it in three to five seconds, the dashboard updates automatically, and a receipt is saved — permanently — for both the customer and the owner. No screenshots. No follow-up. No disputes. The payment layer and the operations layer are the same system.

---

## Slide 5 — Product Demo

> **Hook:** Open your browser right now — I'll walk you through it live.

Go to stellar.laundromatai.app. Sign in with Google. Pick an unpaid order. Hit Pay Now. Behind the scenes, a Stellar payment fires — and because this is a demo, a funded hackathon account auto-sends 0.01 XLM on mainnet so you don't need a wallet. Horizon confirms it in a few seconds, the order flips to paid, and a receipt with the full transaction reference appears in History. Full flow, real mainnet, under 60 seconds.

---

## Slide 6 — Stellar Integration

> **Hook:** Not just *that* Stellar — here's exactly *why* Stellar.

Three to five second settlement means real-time dashboard updates. Fractions of a cent in fees make this viable for ₱50 to ₱500 laundry transactions. But the key is auditability — every payment gets a deterministic `PAY-{ORDER_ID}` that permanently links a business order to an on-chain transaction. And we go further: a Soroban PaymentRegistry contract writes an immutable record after every confirmed payment. Any judge can verify it independently at `/api/contract/verify` — no database access needed.

---

## Slide 7 — Architecture

> **Hook:** Multi-tenant from the ground up — one `git push` deploys the whole thing.

The whole stack is multi-tenant from the ground up. Every order is scoped at `/tenants/{tenantId}/branches/{branchId}/orders/{orderId}` — that's a hard security boundary, not just folder structure. The deterministic payment identity means Horizon polling is stateless — just look for the memo. The Soroban contract sits above that as an independent audit layer. Everything deploys from a single `git push`, and post-deploy smoke tests run automatically. Lean architecture, but every layer is built to scale.

---

## Slide 8 — Traction & Status

> **Hook:** This is not a wireframe. Open your browser.

This is not a wireframe. Everything on this list is live in production right now. Full payment flow, on-chain confirmation, receipt persistence, Soroban contract, `/api/contract/verify` — all live. The demo tenant is accessible at stellar.laundromatai.app right now. And mainnet is running — I have two verified transactions on Stellar Expert, links in the README. Real XLM moved. Real confirmation. Real receipts. Open your browser and see it yourself.

---

## Slide 9 — Business Model & Roadmap

> **Hook:** Ten times cheaper than GCash merchant rates — and Stellar scales with us into every SEA market.

Revenue is SaaS plus transaction fees. ₱500 to ₱2,000 per branch per month, and 0.5% on Stellar-settled payments — ten times cheaper than GCash merchant rates. Roadmap goes from today's single-branch demo to multi-branch sync, USDC anchor integration, and eventually Soroban escrow for franchise multi-party settlement. Stellar scales with us the whole way — no gas wars, anchor ecosystem handles fiat on/off-ramp across SEA, and USDC is already in the architecture.

---

## Slide 10 — Team & Ask

> **Hook:** One engineer, 17 hours, real mainnet transactions. Here's the ask.

I built everything here solo — product, frontend, backend, Stellar integration, Soroban contract in Rust, CI/CD — in about 17 hours. LaundromatAI already serves real operators. This is the payment layer the platform has needed. The ask: does this solve a real problem? Yes. Is Stellar the right tool? Yes. Is it built? Yes — demo it now. A win here validates the concept and opens the door to Stellar Foundation ecosystem partners for the Philippines rollout. Thank you.
