# Next.js Migration Log

Date: 2026-05-19

## Objective

Migrate StellarPay MVP from Vite plus Express to Next.js App Router for improved performance, route handling, and production consistency.

## What Changed

- Frontend runtime moved to Next.js App Router.
- Theme layer aligned closer to the LaundromatAI `/app` dark graphite and glass-panel shell.
- Customer routes now sit behind a Firebase Google sign-in gate.
- Customer session persistence binds the demo lane to `demo-tenant-ph`.
- Customer routes migrated:
  - /
  - /orders
  - /history
  - /profile
  - /pay/[orderId]
- Alias routes preserved for local and production compatibility:
  - /stelllar
  - /stelllar/orders
  - /stelllar/history
  - /stelllar/profile
  - /stelllar/pay/[orderId]
- API endpoints migrated to Next route handlers:
  - /api/create-stellar-payment
  - /api/check-stellar-payment
  - /api/order/[orderId]
  - /api/health
- Shared shell and bottom navigation implemented in Next layout via app frame.
- App icon metadata added so the browser no longer falls back to a missing favicon path.

## Performance Rationale

- Unified server and frontend deployment path with Next runtime.
- Better route-level optimization and bundle handling.
- Cleaner progression toward SSR or hybrid rendering where needed.

## Commands

- Dev: npm run dev
- Build: npm run build
- Start: npm run start

Default dev port is 3001.

## Verification Checklist

- [ ] Home and /stelllar render correctly.
- [ ] Google sign-in opens and returns a customer session.
- [ ] Signed-in session binds to `demo-tenant-ph`.
- [ ] Orders and fallback checkout path work.
- [ ] Payment flow transitions pending to confirmed.
- [ ] Receipt history shows payment and transaction reference.
- [ ] API health returns ok.
