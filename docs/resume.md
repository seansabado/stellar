# Stellar Resume

## State Cursor

- Last updated: 2026-05-20
- Current sprint: UI polish + deploy verification
- Status: In progress

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
