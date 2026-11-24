# Release Notes: 1.0.0

Release prepared on 2026-11-23. No tag or GitHub release has been created.

## Highlights

- Angular 22.3 on Node.js 24, with no advisories reported by `npm audit` at preparation time.
- Layered, lazy-loaded feature architecture with signal-based state.
- Automated tests, a committed test report, and a least-privilege CI workflow.
- Production Content Security Policy and working XSRF header delivery.

## Upgrade notes

1. Switch to Node.js 24 with `nvm use`.
2. Reinstall dependencies with `npm ci --ignore-scripts`.
3. Serve the API from the same origin under `/api`. In development, run it on `127.0.0.1:8000`.
4. Have the API set the `XSRF-TOKEN` cookie and verify the `X-XSRF-TOKEN` header on writes.

## Known limitations

- The REST API is not part of this repository.
- The client has no authentication.
- The `/products` route is a placeholder.

See [CHANGELOG.md](CHANGELOG.md) for the full list of changes.
