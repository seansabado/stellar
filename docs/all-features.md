# Stellar Features Inventory

## Customer App Shell

- Route shell with top bar and bottom mobile nav.
- Network mode toggle (`testnet` / `mainnet`).
- Session-aware sign-out actions.
- Status: Active

## Dashboard

- Personalized greeting + summary cards.
- Quick actions for Orders / History / Pay.
- Status: Active (recent UI polish)

## Orders Module

- Live order list with status filters.
- Action lane (`PAY`, `READY PICKUP`, `READY DELIVERY`).
- SaaS/demo source fallback behavior.
- Status: Active

## Payment Flow

- Order checkout page with QR generation.
- Payment status polling and proof timeline.
- Receipt persistence after payment confirmation.
- Status: Active

## Soroban Contract Logging and Registry

- Mainnet contract ID: `CANEW7EC3W6BMVDJQNRDVTUZZ32QWIY5LNOEGWPVRWYF7LEJUUWEYWKB`.
- Production writes on confirmation via `record()`.
- Public verification via `get()` and API bridge `/api/contract/verify`.
- Registry count validated on mainnet after LPX0034 and LPX0039 logging.
- Status: Active (mainnet)

## Payment History

- Receipt listing with order, amount, timestamp, network, payment ID.
- Empty state with CTA.
- Dedicated history table CSS isolation (to avoid card-row style leakage).
- Status: Active (fixed in this session)

## Profile & Transactions

- Customer profile details and quick links.
- Recent transactions list with filters/pagination/export.
- Status: Active

## Auth Gate

- Google sign-in gate for customer sessions.
- Loading + unauthenticated states.
- Status: Active

## PWA / Runtime Reliability

- Service worker registration guard for localhost.
- Local cache cleanup for developer stability.
- Status: Active (stability hardened)

## Deployment

- Firebase App Hosting backend: `stelllar`.
- Domain: `stellar.laundromatai.app`.
- Rollout-driven deployment via App Hosting console.
- Release tag advanced to `v0.1.15`.
- Status: Active
