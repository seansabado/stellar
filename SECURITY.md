# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| `main` branch | ✅ Active |
| Tagged releases | ✅ Current tag only |

## Reporting a Vulnerability

If you discover a security vulnerability in this repository, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Contact us directly:

- Email: [hello@laundromatai.app](mailto:hello@laundromatai.app)
- Subject line: `[SECURITY] stellar — <brief description>`

We will acknowledge your report within 48 hours and aim to resolve confirmed vulnerabilities within 14 days.

## Scope

This repository is a public demo showcase. In scope for security reports:

- Authentication bypass or session issues
- Firestore data exposure beyond the `demo-tenant-ph` demo scope
- API endpoint vulnerabilities (`/api/create-stellar-payment`, `/api/check-stellar-payment`)
- Dependency vulnerabilities with active exploit potential

Out of scope:

- Stellar testnet account funds (testnet tokens have no real value)
- Issues requiring physical access to the device
- Social engineering attacks

## Notes

- No real customer data is stored in this demo
- All payment flows are scoped to the `demo-tenant-ph` tenant
- Stellar testnet is used for all hackathon demonstrations
