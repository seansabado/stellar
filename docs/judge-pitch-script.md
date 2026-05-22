# LaundromatAI x Stellar Pay - Judge Pitch Script

## Purpose

Use this script for live demo delivery in front of judges.
It is optimized for speed, clarity, and proof of real customer value.

## 90-Second Script (Primary)

Opening (0:00-0:15)
"LaundromatAI x Stellar Pay gives laundry customers a simple way to pay for their orders and instantly see payment confirmation and receipts. Today, I will show one complete customer payment flow for demo-tenant-ph."

Problem + Opportunity (0:15-0:30)
"Laundry owners lose time with manual follow-ups, delayed confirmations, and payment disputes. Customers want a fast and trusted payment experience they can complete in seconds."

Demo Steps (0:30-1:05)
"First, we open an active order in demo-tenant-ph. Second, we open checkout and show the amount in Philippine pesos. Third, we trigger the Stellar payment flow. Fourth, we show the status moving to confirmed. Finally, we open receipt history and show that the payment record is saved for the customer."

Value + Differentiation (1:05-1:20)
"This is not only a payment screen. It is a tenant-scoped customer payment journey designed for laundromat operations, with clear status, local currency support, and receipt visibility. Every confirmed payment is also written to a Soroban smart contract on-chain — giving any judge an independent, tamper-proof audit trail they can query directly."

Close (1:20-1:30)
"In one flow, we reduce payment friction for customers and reduce reconciliation overhead for owners. That is why this is immediately useful for laundromat businesses."

## 3-Minute Script (Expanded)

1. Problem framing

"Most laundromats still handle customer payment status manually. That creates delays, confusion, and avoidable support work."

1. Product framing

"LaundromatAI x Stellar Pay is a customer-facing extension of the LaundromatAI ecosystem focused on fast checkout and trustworthy payment confirmation."

1. Walkthrough

- Open Orders and select demo order.
- Show checkout amount in PHP.
- Start payment and show status feedback.
- Confirm payment.
- Open history and show receipt entry.

1. Why judges should care

"This solves a real operational pain point with a flow customers can understand instantly. It also gives owners cleaner payment records and fewer status disputes. And every confirmed payment is recorded on a Soroban smart contract — contract `CANEW7EC...` on mainnet — so the payment proof lives on-chain, not just in our database. Judges can query any payment record directly at `/api/contract/verify?orderId=<id>`."

1. Closing line

"We are shipping practical fintech for laundromats: fast customer payment, clear confirmation, and accountable records."

## Backup 45-Second Script (If Time Is Cut)

"LaundromatAI x Stellar Pay helps laundry customers complete payment in seconds. We open an order, show checkout in Philippine pesos, confirm payment, and instantly show the saved receipt in history. This reduces payment friction for customers and reduces reconciliation overhead for owners."

## Judge Q and A Quick Responses

Q: What makes this different from generic checkout pages?
A: It is tenant-scoped and designed for laundromat workflows with customer-visible payment status and receipt history.

Q: What local market fit did you include?
A: PHP formatting and customer-facing flow language that matches local expectations.

Q: How do you prove this is useful now?
A: The demo shows a full end-to-end payment journey with immediate confirmation and receipt visibility.

Q: Do you use Soroban smart contracts?
A: Yes. Every confirmed payment is recorded on the PaymentRegistry contract (`CANEW7EC3W6BMVDJQNRDVTUZZ32QWIY5LNOEGWPVRWYF7LEJUUWEYWKB` on mainnet). Any judge can independently verify a payment — without trusting our database — by calling: `https://stellar.laundromatai.app/api/contract/verify?orderId=<id>`. The contract exposes `record()`, `get()`, and `count()` functions. It was written in Rust with `soroban-sdk v22`, built to WASM, and deployed via Stellar CLI.

Q: Why Soroban and not just Horizon?
A: Horizon confirms a Stellar payment happened. Soroban proves *which business order it was for*. Our PaymentRegistry contract binds the on-chain tx hash to a specific `ORDER_ID`, amount in stroops, payer address, and timestamp — creating a trustless business-layer audit trail that Horizon alone cannot provide.

## Live Demo Operator Checklist

- Keep one fallback order ready: demo-order-001.
- Keep both URLs ready:
  - [https://stellar.laundromatai.app/](https://stellar.laundromatai.app/)
  - [https://stelllar--seanraynon.asia-east1.hosted.app](https://stelllar--seanraynon.asia-east1.hosted.app)
- If network is slow, continue narration while status updates.
- End on the receipt history screen as proof of completion.
- For Soroban judge verification, have these URLs pre-loaded:
  - `https://stellar.laundromatai.app/api/contract/verify?orderId=LPX0034`
  - `https://stellar.laundromatai.app/api/contract/verify?orderId=PAY-LPX0034`
- Stellar Expert contract explorer (backup):
  `https://stellar.expert/explorer/public/contract/CANEW7EC3W6BMVDJQNRDVTUZZ32QWIY5LNOEGWPVRWYF7LEJUUWEYWKB`
- Screenshot reference for judges:
  `docs/screenshots/soroban-mainnet-contract-logging-registry-2026-05-22.png`
