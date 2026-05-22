# Stellar Resume

## State Cursor

- Last updated: 2026-05-22
- Current sprint: Mainnet Soroban proof + judge documentation sync
- Status: Completed

## Internal Session Log (2026-05-22) — Soroban Mainnet and Pitch Sync

- Scope: align production proof, judge narrative, and docs with mainnet Soroban logging and registry verification.
- Confirmed contract: `CANEW7EC3W6BMVDJQNRDVTUZZ32QWIY5LNOEGWPVRWYF7LEJUUWEYWKB` (mainnet).
- Verified registry entries and reads:
  - `PAY-LPX0034`
  - `PAY-LPX0039`
  - `count() = 2` after the validated writes.
- Release progression:
  - repo `seansabado/stellar` tag advanced to `v0.1.15`
  - release workflow completed successfully and published latest release.
- Documentation synchronized:
  - judge pitch script, pitch deck, architecture, demo script, case study, features, release notes.
- Visual proof added:
  - `docs/screenshots/soroban-mainnet-contract-logging-registry-2026-05-22.png`

## Internal Session Log (2026-05-22) — Camera Fixes

- Scope: internal-only mobile camera and checkout UX stabilization for `/pay/[orderId]` flow.
- Root issue: repeated camera preview failures on iPhone/Android plus narrow scanner layout on some Android devices.
- Implemented fixes:
  - Added resilient `getUserMedia` fallback chain in `src/components/QRScanner.tsx`.
  - Removed touch-start activation path and improved camera interruption/error handling.
  - Added iPhone Lockdown Mode warning when camera open fails.
  - Added fallback progression path so manual verification can continue when preview is unavailable.
  - Moved VERIFY action to sit directly below camera preview (before status text) for no-scroll access.
  - Reduced Android over-zoom by changing scanner preview framing from crop to contain.
  - Widened mobile scanner/payment container widths and reduced card paddings for better viewport usage.
- Internal deploy references:
  - `7145d54` — harden mobile camera preview startup
  - `13b008c` — unblock pay flow when camera preview fails
  - `bcd0191` — reduce Android scanner preview zoom
  - `a909734` — iPhone Lockdown warning
  - `d5b7392` — widen mobile scanner layout
  - `b323783` — scanner-verified payment intent start fix (build unblock)
  - `d003dcd` — move verify button above scanner status text
- Build status: latest rollout builds in `asia-east1` reached SUCCESS after type-fix forward patch.
- Note: This log is internal engineering tracking only; no customer-facing release note update requested.

## Session Summary (2026-05-20)

- Implemented mobile-first UX polish updates in `src/index.css` and route pages.
- Removed dashboard-strip stats and rebuilt profile Recent Transactions list for iOS-style layout.
- Fixed bottom nav layering with explicit `z-index` control.
- Diagnosed and fixed local dev CSS/runtime instability caused by stale Next chunks (`_next/static/*` 404).
- Added local service worker cleanup guard in `src/components/ServiceWorkerRegistrar.tsx` for localhost.
- Updated dev startup script behavior in `package.json` to clear `.next` before `next dev` to prevent stale chunk references.
- Added dedicated history table styling to prevent receipt cells collapsing into vertical text.
- Triggered Firebase App Hosting rollout for backend `stelllar` via console flow.

## Deployment & Parity Notes

- App Hosting backend: `stelllar` (region `asia-east1`).
- Custom domain: `https://stellar.laundromatai.app`.
- Rollout execution: submitted and observed in Rollouts view as in-progress during session.
- Parity check status: local vs production is not strict 1:1 due to auth/session/data behavior differences.

## Bugs / Incidents Tracker

- CSS broken in local Chrome (vertical text/collapsed cards):
  Status: Mitigated. Root cause: desktop grid rules plus stale Next chunk references after dev restarts.
  Fixes: force mobile single-column behavior for constrained shell, history table-specific class overrides, localhost SW/cache cleanup, and `.next` cleanup before each `dev:once`.

- `_next/static/*` 404 (`layout.css`, `main-app.js`, `app/page.js`):
  Status: Mitigated. Root cause: stale asset references during dev server restarts.
  Fix: clean `.next` before each local dev start.

## Verification Log

- `get_errors` checks: no diagnostics errors on touched files.
- `npm run build`: successful (Next.js 15.5.18).
- Browser validation: local and production pages load; local layout now stable in fresh sessions.

## Next Actions

- Continue route-level parity normalization between local and production behavior.
- Add explicit auth/session parity strategy for local QA mode.
- Re-run production parity suite after next rollout.
