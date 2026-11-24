# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

## [1.0.1] - 2026-11-24

### Changed

- Corrected the release notes and security audit to reflect the published 1.0.0 release and the rewritten repository history. Documentation only, no change in code behaviour.

## [1.0.0] - 2026-11-24

### Changed

- **Breaking:** upgraded to Angular 22.3, TypeScript 6.0 and Vitest 5.
- **Breaking:** the minimum runtime is now Node.js 24.15. Node.js 20 is end of life.
- **Breaking:** the API base URL is now the same-origin `/api`, proxied to `127.0.0.1:8000` in development.
- Reorganized the source into nested `core` and `features` modules with `domain`, `data`, `state` and `ui` layers.
- Moved task state into a signal-based store and made feature routes lazy.
- Pinned direct dependencies to exact versions.

### Added

- Loading, empty and error states, plus protection against concurrent writes and stale responses.
- Runtime validation of task list responses, ids and API endpoints.
- Production Content Security Policy.
- Unit and component test suite with a committed report.
- GitHub Actions CI with least-privilege permissions and SHA-pinned actions.
- PostgreSQL schema, architecture guide, security policy and security audit.

### Fixed

- Whitespace around task titles is no longer sent to the API.
- Replaced the scaffold test that asserted a heading the application does not render.
- Gateway errors (502, 503, 504) now report an unreachable API, which is what the dev proxy returns when no API is running.
- Task list validation now rejects a `description` that is not a string.
- The database title constraint now rejects titles made only of whitespace characters such as tabs and non-breaking spaces.

### Removed

- Unused scaffold template and styles, the duplicate `Task` type, and the Angular CLI analytics identifier.

### Security

- Resolved all 52 vulnerable packages reported by `npm audit` on the previous lockfile.
- Enabled XSRF header delivery by removing the absolute API URL.
- Replaced an unpinned `npx -y` editor tool configuration with the locally installed CLI.
