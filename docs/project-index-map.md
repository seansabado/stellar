# Stellar Project Index Map

## Root

- `package.json` - scripts, dependencies, local dev behavior.
- `next.config.ts` - Next.js runtime configuration.
- `apphosting.yaml` - Firebase App Hosting deployment config.

## App Routes (`src/app`)

- `src/app/layout.tsx` - root app layout + providers + auth gate wrapping.
- `src/app/AppFrame.tsx` - shared shell, top nav, bottom nav.
- `src/app/page.tsx` - dashboard/home.
- `src/app/orders/page.tsx` - orders list and filters.
- `src/app/history/page.tsx` - payment history receipts table.
- `src/app/profile/page.tsx` - customer profile + recent transactions.
- `src/app/pay/[orderId]/page.tsx` - payment checkout and proof flow.

## Components (`src/components`)

- `src/components/CustomerAuthGate.tsx` - signed-in gating and auth UX.
- `src/components/ServiceWorkerRegistrar.tsx` - SW registration and localhost cleanup behavior.
- `src/components/StellarQR.tsx` - QR display for payment flow.
- `src/components/AddToHomeScreenBanner.tsx` - install prompt UI.
- `src/components/MobileSuccessScreen.tsx` - payment success experience.

## Lib (`src/lib`)

- `src/lib/customerAuth.tsx` - auth provider/session state.
- `src/lib/customerData.ts` - customer order data contracts/helpers.
- `src/lib/clientDemoOrders.ts` - demo/live order fetch and fallback logic.
- `src/lib/receiptStore.ts` - receipt persistence and retrieval.
- `src/lib/stellarService.ts` - transaction retrieval service.
- `src/lib/networkContext.tsx` - network mode context.
- `src/lib/useAppBase.ts` - route base resolver (`/` vs `/stelllar`).

## Styling

- `src/index.css` - global theme + layout + module styles.
- `src/app/layout.css` - root import bridge to global styles.

## Ops / Scripts

- `scripts/dev-watchdog.ps1` - local dev restart loop.
- `package.json:scripts.dev:once` - local dev command with `.next` cleanup.

## Docs (Stellar-specific)

- `docs/resume.md` - state cursor and session ledger.
- `docs/all-features.md` - feature inventory and status.
- `docs/project-index-map.md` - module/file ownership map.
- `docs/demo-script.md` - short and extended live demo walkthrough.
- `docs/architecture.md` - system architecture and layer overview.
- `docs/interview-walkthrough.md` - interview and reviewer talk track.
- `docs/case-study.md` - enterprise case study summary.
- `docs/hiring-manager.md` - hiring manager one-pager.
