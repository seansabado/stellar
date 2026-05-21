# LaundromatAI x StellarPay — Pitch Deck
**Build on Stellar Philippines Hackathon**

> 📊 **Google Slides:** [View Pitch Deck](https://docs.google.com/presentation/d/1n6tGEixR1ePmFnOjmU1daJfj2xHD21QKashvyntPLKI/edit?usp=sharing)

---

## Slide 1 — Title

# LaundromatAI × StellarPay
### Stellar-powered payments for laundry MSMEs

Fast checkout. On-chain verification. Receipt-ready in seconds.

> **Live:** [stellar.laundromatai.app](https://stellar.laundromatai.app)  
> **Repo:** [github.com/seansabado/stellar](https://github.com/seansabado/stellar)

---

## Slide 2 — The Problem

### Laundry owners are drowning in payment chaos

Every day, thousands of laundromat operators in the Philippines face:

| Pain Point | What It Costs |
|---|---|
| Cash + e-wallet screenshots as "proof" | Hours of manual reconciliation daily |
| No real-time payment confirmation | Staff handle payment disputes instead of orders |
| Delayed remittance | Cash stuck, can't pay suppliers or staff |
| Multi-branch chaos | No single source of truth across locations |

> **The root cause:** The payment layer is disconnected from the operation.  
> Orders live in one place. Payment proof lives in someone's phone.

---

## Slide 3 — The Opportunity

### 600,000+ laundry MSMEs in Southeast Asia

- **Philippines alone:** ~120,000 laundromat and laundry shop operators
- Growing fast: urban migration + middle-class outsourcing of chores
- Underserved by fintech — most tools target e-commerce, not service businesses
- Multi-branch operators (10–50 branches) are the fastest-growing segment
- Current payment stack: GCash screenshots, manual Excel reconciliation

> **Whoever owns the payment layer for this segment, owns the operations stack.**

---

## Slide 4 — Our Solution

### One flow. Order → Payment → Confirmation → Receipt.

**LaundromatAI x StellarPay** embeds Stellar-based payments directly into laundry order workflows:

1. **Customer opens their order** — scans QR at branch, sees PHP amount
2. **Customer pays** — Stellar payment linked to deterministic order identity (`PAY-{ORDER_ID}`)
3. **On-chain confirmation** triggers automatic status update in the branch dashboard
4. **Receipt is saved** — customer has permanent payment proof; owner has audit trail

No screenshots. No manual follow-up. No disputes.

> The payment layer *is* the operations layer.

---

## Slide 5 — Product Demo

### What judges see in 60 seconds

```
Customer opens Orders  →  Selects active order  →  Sees PHP checkout amount
       ↓
Stellar payment initiated  →  On-chain confirmation received
       ↓
Order status updated in branch dashboard  →  Receipt saved in History
```

**Live demo flow (demo-tenant-ph):**
- `stellar.laundromatai.app` — customer-facing PWA
- Sign in with Google → see orders → checkout → confirm → history
- Full flow: under 60 seconds

**Key proof points shown:**
- Tenant-isolated order resolution
- PHP amount formatting (local market fit)
- Stellar transaction reference on receipt
- Receipt persistence across sessions

---

## Slide 6 — Stellar Integration

### Why Stellar is the right rail for MSME commerce

| Stellar Capability | How We Use It |
|---|---|
| Fast settlement (3–5 sec) | Confirmation triggers real-time branch status update |
| Low fees (~$0.00001/tx) | Viable for small-ticket laundry transactions (₱50–₱500) |
| Deterministic transaction ID | `PAY-{ORDER_ID}` links every on-chain tx to an exact business record |
| USDC + XLM support | XLM default today; USDC path for anchor-compatible payouts |
| Testnet → Mainnet parity | Architecture works identically on both networks |
| SEP-0001 compliant | `stellar.toml` published at `stellar.laundromatai.app/.well-known/stellar.toml` |
| **Soroban smart contract** | PaymentRegistry contract records every confirmed payment on-chain as a tamper-proof audit log |

> Stellar doesn't just process the payment — it *proves* it happened, and our Soroban contract binds that proof to the exact business order.

**PaymentRegistry Contract (`CCLFE47Z...`):**
- Written in Rust, compiled to WASM, deployed to testnet via Stellar CLI
- `record(order_id, amount_stroops, payer, tx_hash, network)` — called after every Horizon confirmation
- `get(order_id)` — publicly queryable by anyone, including judges
- Verify any payment: `https://stellar.laundromatai.app/api/contract/verify?orderId=<id>`

---

## Slide 7 — Architecture

### Production-lean. Multi-tenant. Branch-scoped.

```
Customer PWA (Next.js 15 / React 19)
        │
Firebase Auth (Google OAuth)
        │
Firestore: /tenants/{tenantId}/branches/{branchId}/orders/{orderId}
        │
Cloud Functions API
        │
Stellar Horizon (testnet + mainnet)
        │
On-chain confirmation → Soroban PaymentRegistry.record()
        │
Firestore status update → UI reflects instantly
```

**Key design decisions:**
- Deterministic payment identity prevents duplicate-payment errors
- Tenant isolation at the data layer — no cross-branch leakage
- Reconciliation endpoint repairs any incomplete confirmed rows
- **Soroban contract** creates an immutable on-chain business record independent of our database
- Firebase App Hosting auto-deploys from main branch on every push
- Post-deploy smoke tests run automatically via GitHub Actions

---

## Slide 8 — Traction & Status

### Shipped. Running. Ready to demo.

| Milestone | Status |
|---|---|
| Customer payment flow (full end-to-end) | ✅ Live |
| Stellar on-chain confirmation → branch dashboard sync | ✅ Live |
| Receipt persistence across sessions | ✅ Live |
| PHP currency formatting | ✅ Live |
| QR-based checkout entry | ✅ Live |
| Multi-tenant Firestore isolation | ✅ Live |
| SEP-0001 `stellar.toml` published | ✅ Live |
| **Soroban PaymentRegistry contract deployed** | ✅ Live (testnet) |
| **On-chain `record()` called after every payment** | ✅ Live |
| **`/api/contract/verify` judge verification endpoint** | ✅ Live |
| Post-deploy smoke test pipeline | ✅ Active |
| Firebase App Hosting (asia-east1) | ✅ Live |
| Demo tenant: `demo-tenant-ph` | ✅ Accessible |

> This is not a wireframe. Not a prototype. A deployed, working system — with on-chain proof.

---

## Slide 9 — Business Model & Roadmap

### How this becomes a real business

**Revenue model:**
- SaaS subscription per branch (₱500–₱2,000/branch/month)
- Transaction fee on Stellar-settled payments (0.5% — 10× cheaper than GCash merchant rates)
- White-label licensing to franchise networks and SME enablement programs

**Expansion path:**
```
Phase 1 (Now)   → Single-branch demo, Soroban on-chain payment verification
Phase 2 (Q3)    → Multi-branch dashboard sync, USDC anchor integration
Phase 3 (Q4)    → Soroban escrow for franchise multi-party settlement
Phase 4 (2027)  → Full SEA rollout: Indonesia, Malaysia, Vietnam
```

**Why Stellar scales with us:**
- No per-transaction gas war risk
- Anchor ecosystem enables fiat on/off-ramp in any SEA market
- USDC settlement path is already in the architecture
- Soroban contract layer is extensible — next: multi-party escrow, franchise royalty splits

---

## Slide 10 — Team & Ask

### One engineer. Full-stack. Shipped.

**Sean Raynon** — Founder & CTO, LaundromatAI

- Designed and built the entire system solo: product, architecture, frontend, backend, Stellar integration, **Soroban smart contract**, CI/CD
- 10+ years in B2B SaaS and operations tech
- Deep MSME workflow expertise — LaundromatAI serves real laundry operators today

| | |
|---|---|
| 🌐 Product | [laundromatai.app](https://laundromatai.app) |
| 💻 Repo | [github.com/seansabado/stellar](https://github.com/seansabado/stellar) |
| 🚀 Live app | [stellar.laundromatai.app](https://stellar.laundromatai.app) |
| 🔗 Verify payment | [/api/contract/verify?orderId=demo-order-001](https://stellar.laundromatai.app/api/contract/verify?orderId=demo-order-001) |
| 📜 Contract | `CCLFE47ZTMIV5UGJZOI7KIVAKXG7ZQAMROHLROHMHRCDPEZWE7MU7G33` |
| 📧 Contact | [hello@laundromatai.app](mailto:hello@laundromatai.app) |

---

### What we're asking for

> **Hackathon win** to validate the concept, connect with Stellar Foundation ecosystem partners, and accelerate the Philippines rollout.

**The ask to judges:**
- ✅ Does this solve a real MSME problem? **Yes.**
- ✅ Is Stellar the right tool? **Yes — fast, cheap, auditable, and programmable via Soroban.**
- ✅ Is it built and working? **Yes — demo it now at stellar.laundromatai.app**

> *Stellar-powered payments for laundry MSMEs — fast checkout, on-chain ledger verification, and receipt persistence in one production-ready merchant workflow.*
