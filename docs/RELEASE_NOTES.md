# StellarPay MVP Release v0.1.1

**Tenant-Scoped Customer Payments Experience for LaundromatAI x StellarPay**

## 🎯 What's New

### Next.js 15 + React 19 Migration Complete

The customer payments app is now built on **Next.js 15 App Router**, replacing the previous Vite + Express stack. This delivers:

- **Unified deployment**: single Next.js runtime for frontend and API routes
- **Improved performance**: route-level optimization and cleaner bundle handling
- **Production consistency**: better alignment with industry-standard payment app patterns
- **Enhanced reliability**: App Hosting deployment with automated smoke testing

### Core Features (Production-Ready)

✅ **Customer Identity & Session Management**
- Google Sign-In gate for authenticated payment access
- Demo tenant scoping (`demo-tenant-ph`) for safe, repeatable workflows
- Session persistence across routes
- Profile management with recent transactions

✅ **Tenant-Scoped Order Resolution**
- Live order list with filterable status (Pending, Ready Pickup, Ready Delivery)
- Fallback demo data for continuity when live API is unavailable
- Customer-safe order information display
- Mobile-first order interaction

✅ **Stellar Payment Workflow**
- Two-step payment verification (verify → pay)
- Deterministic payment identity linking to orders
- QR code generation for payment verification
- Real-time payment status polling (pending → confirmed)
- Duplicate payment protection via idempotent request handling
- Transaction reference capture from Stellar Horizon

✅ **Payment History & Receipts**
- Persistent receipt storage after payment confirmation
- Complete transaction history with payment IDs, amounts, timestamps
- Network visibility (testnet / mainnet toggle)
- Export-ready transaction listing

✅ **Operational Proof Layer**
- Checkout proof panel displaying:
  - Tenant ID
  - Payment ID
  - Transaction reference
  - Status timeline with timestamps
- Receipt persistence for support and dispute resolution

✅ **Mobile-First Design**
- Responsive layout optimized for in-store checkout scenarios
- iOS PWA compliance with proper app metadata
- Service worker caching (with localhost safety guard)
- Tap-friendly payment flows

### Recent Hardening (May 2026)

- **History table CSS isolation** — prevents style leakage in payment history view
- **Demo order fallback** — if live order API is delayed, checkout can proceed with `demo-order-001`
- **Payment state stability** — confirmed receipts remain stable across repeated status checks
- **API health monitoring** — `/api/health` endpoint for deployment verification

---

## 📦 Deployments

| Environment | URL | Stack | Region |
|---|---|---|---|
| **Production** | [stellar.laundromatai.app](https://stellar.laundromatai.app) | Custom domain | `asia-east1` |
| **App Hosting Backend** | [stelllar--seanraynon.asia-east1.hosted.app](https://stelllar--seanraynon.asia-east1.hosted.app) | Fallback / staging | `asia-east1` |
| **Local Dev** | `http://localhost:3001` | Next.js dev server | N/A |

### Stellar Explorer Integration

- **Testnet account**: [stellar.expert/testnet](https://stellar.expert/explorer/testnet/account/GBK4EPWBVRS5KLW6AR2QTPFD5ZUJIVCP3KTEY2CIF6QOCAYY4SDZO6WC)
- **Mainnet account**: [stellar.expert/public](https://stellar.expert/explorer/public/account/GBDZXAJCTGPMASCYPPE6V5NYRBWFFRYSTL4QV72IJ6JYQEI62QIPEQMG)

---

## 🏗️ Architecture

```
Customer Device
    ↓
Next.js App Shell (AppFrame.tsx)
    ├→ Firebase Auth (Google Sign-In)
    ├→ Routes: /, /orders, /pay/[orderId], /history, /profile
    └→ API Handlers
         ├→ /api/create-stellar-payment (payment intent creation)
         ├→ /api/check-stellar-payment (status polling)
         ├→ /api/order/[orderId] (order resolution)
         └→ /api/health (deployment verification)
             ↓
    Stellar Horizon (Testnet / Mainnet)
    ↓
    Payment Confirmation & Receipt Persistence
```

**Key Design Principles:**

- **Trust boundaries**: Orders, auth state, and payment confirmation treated as separate concerns
- **Tenant isolation**: All customer views scoped to `demo-tenant-ph` in demo mode
- **Demo reliability**: Fallback local order data ensures checkout continuity if live API is slow
- **Operational traceability**: Receipt history persists proof for support and dispute resolution

---

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev:once
# Open http://localhost:3001
```

### Production Build

```bash
npm run build
npm run start
```

### Try the Demo

1. Visit [stellar.laundromatai.app](https://stellar.laundromatai.app)
2. Sign in with Google
3. Navigate to **Orders** and select an unpaid order
4. Follow the two-step checkout flow (verify QR → PAY NOW)
5. Watch payment transition from pending to confirmed
6. View receipt in **History**

**Demo Flow Reference**: See [docs/demo-script.md](docs/demo-script.md) for 60-second and 3-minute walkthroughs.

---

## 📚 Documentation

| Resource | Purpose |
|---|---|
| [docs/architecture.md](docs/architecture.md) | System design and layer responsibilities |
| [docs/demo-script.md](docs/demo-script.md) | 60-second and 3-minute demo procedures |
| [docs/case-study.md](docs/case-study.md) | Business problem, engineering challenges, and proof signals |
| [docs/all-features.md](docs/all-features.md) | Feature inventory and status tracking |
| [docs/customer-oauth-flow.md](docs/customer-oauth-flow.md) | Identity and session lifecycle |
| [docs/nextjs-migration.md](docs/nextjs-migration.md) | Vite→Next.js migration log and verification checklist |
| [docs/hackathon-questionnaires.md](docs/hackathon-questionnaires.md) | Problem statement, solution overview, and Stellar integration strategy |

---

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS (dark graphite theme, glass panels)
- **Auth**: Firebase Authentication (Google OAuth)
- **Payment**: Stellar SDK (@stellar/stellar-sdk ^15.1.0)
- **Data**: Firebase App Hosting backend
- **Deployment**: Firebase App Hosting (`asia-east1`)
- **QR**: qrcode (1.5.4) for payment verification
- **Utilities**: axios, uuid, Firebase admin SDK

---

## ✅ Verification Checklist

- [x] Home and `/stelllar` render correctly
- [x] Google sign-in opens and returns a customer session
- [x] Signed-in session binds to `demo-tenant-ph`
- [x] Orders list displays with action lane (`PAY`, `READY PICKUP`, `READY DELIVERY`)
- [x] Checkout page shows QR generation and proof panel
- [x] Payment flow transitions pending → confirmed
- [x] Receipt history shows payment and transaction reference
- [x] API health endpoint returns ok
- [x] Mobile-first layout responsive on iPhone SE through iPhone 15 Pro
- [x] PWA service worker registers without errors on production

---

## 💡 Business Context

**Problem**: MSME laundry operators in Southeast Asia face payment friction—fragmented checkout, weak payment traceability, manual reconciliation, and customer distrust.

**Solution**: StellarPay brings Stellar-based payments directly into laundry order workflows, providing:
- Fast, low-cost settlement
- Deterministic payment identity linking orders to transactions
- Real-time confirmation and receipt persistence
- Complete audit trail for dispute reduction

**Outcome**: Laundromat owners can scale from single-store to multi-branch operations with confidence in their payment infrastructure.

---

## 📈 Next Steps

- Expand from demo tenant to production multi-tenant flow
- Implement branch-scoped payment settlement
- Add cash-in/cash-out and regional payout scenarios
- Scale payment UI across additional MSME verticals (laundry, cleaning, fitness, etc.)

---

## 📄 License

MIT

---

## 🙋 Support & Questions

For architecture questions, feature requests, or deployment issues, refer to the documentation links above or open an issue on [github.com/seansabado/stellar](https://github.com/seansabado/stellar).

**Release Confidence**: HIGH — Production-ready demo with idempotent payment handling, fallback continuity, and comprehensive proof visibility for operators and support teams.

---

This release is an enterprise-focused showcase of a customer payment experience designed for real MSME operations, not just isolated UI screens. 🚀
