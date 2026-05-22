# Demo Script

## Purpose

This script is the fastest way to demonstrate StellarPay to a reviewer, judge, hiring manager, or technical stakeholder.

Use the 60-second version when attention is limited. Use the 3-minute version when you want to explain product value and engineering choices.

## 60-Second Demo

### Goal

Show one complete customer payment journey clearly and confidently.

### Flow

1. Open the app at `https://stellar.laundromatai.app`.
2. Sign in and note that the app is operating inside the demo tenant `demo-tenant-ph`.
3. Open Orders and select an unpaid order.
4. Show the PHP amount and the customer payment route.
5. Verify the merchant QR and tap `PAY NOW`.
6. Show the payment moving through pending and then confirmed state.
7. Open History and show the saved receipt proof.
8. Open contract verification and show on-chain registry proof for the same order.

### What To Say

"This is a customer-facing payment experience for LaundromatAI x StellarPay. The flow is tenant-scoped, auth-backed, mobile-first, and designed to show confirmation proof after payment, not just a temporary success message."

"For independent proof, we also verify the same payment via Soroban on mainnet at `/api/contract/verify?orderId=LPX0034` or `PAY-LPX0034`."

## 3-Minute Demo

### Opening

"The purpose of this showcase is to demonstrate a trustworthy customer payment workflow, not just a UI screen. The key point is how order visibility, sign-in, payment confirmation, and receipt proof work together."

### Step 1: Identity and Tenant Context

- Open the app.
- Sign in.
- Explain that the demo is intentionally scoped to `demo-tenant-ph`.

What to say:

"The flow is anchored to one demo tenant so the reviewer can see a stable, tenant-scoped payment journey without ambiguous context switching."

### Step 2: Orders and Customer Context

- Open Orders.
- Show the unpaid order row and the `PAY` action.
- Mention that the customer sees PHP pricing and customer-safe order information.

What to say:

"This is the point where customer experience and tenant-scoped order visibility meet. The customer is not looking at an abstract payment demo. They are paying a real order context in the demo lane."

### Step 3: Checkout

- Open the pay route.
- Show the amount due.
- Explain the two-step pattern: verify merchant QR first, then tap `PAY NOW`.

What to say:

"We intentionally separated verification from payment submission. That reduces ambiguity and makes the payment action explicit."

### Step 4: Confirmation

- Trigger the payment flow.
- Show pending state, then confirmed state.
- Point out any transaction reference, receipt state, or timeline proof.

What to say:

"The key design goal here is post-payment trust. The user needs to understand whether payment actually completed, and support teams need proof afterward."

### Step 5: History

- Open History.
- Show the saved payment receipt.

What to say:

"The flow does not end at checkout. The receipt and payment history complete the proof loop."

### Step 6: Soroban Registry Proof

- Open `https://stellar.laundromatai.app/api/contract/verify?orderId=LPX0034`.
- Show `found: true`, contract id, tx hash, and payer details.
- Optionally open explorer contract page for direct public verification.

What to say:

"Every confirmed payment is written to the Soroban PaymentRegistry on mainnet. This gives a tamper-proof audit trail outside our database."

## Backup Demo Path

Use this if network timing is slow or the live confirmation path is delayed:

1. Open the app and show signed-in customer context.
2. Open Orders and navigate to the pay route.
3. Show the PHP amount and the verify-then-pay UX.
4. Explain the pending-to-confirmed workflow using History and the existing receipt records.
5. Point the reviewer to the live domain, hosted backend, and supporting docs in the README.

## What Reviewers Should Notice

- customer sign-in before payment actions
- tenant-scoped order visibility
- explicit `PAY NOW` trigger
- confirmation state and receipt persistence
- deployment-ready hosted experience on Firebase App Hosting