# Security Audit

- **Date:** 2026-11-23
- **Version reviewed:** 1.0.0
- **Scope:** client source, build and editor configuration, dependencies, and git history
- **Method:** manual code review, `npm audit`, pattern-based history scan, and a production build exercised in headless Chrome against a local stub API

This is a self-review, not an independent penetration test.

## Fixed

| Severity | Area                 | Finding                                                                               | Resolution                                          |
| -------- | -------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Critical | Dependencies         | `npm audit` reported 52 vulnerable packages (3 critical, 22 high, 25 moderate, 2 low) | Upgraded the stack; `npm audit` now reports 0       |
| High     | Runtime              | Node.js 20 is end of life                                                             | Moved to Node.js 24                                 |
| Medium   | CSRF                 | The absolute API URL prevented Angular from sending the XSRF header                   | Same-origin `/api` with explicit XSRF configuration |
| Medium   | Supply chain         | Editor tool configuration ran an unpinned package with `npx -y`                       | Uses the locally installed, lockfile-pinned CLI     |
| Medium   | XSS hardening        | No Content Security Policy                                                            | Strict CSP in production builds                     |
| Low      | Input handling       | Endpoints and ids were interpolated into URLs unchecked                               | Validated before a request is sent                  |
| Low      | Data integrity       | API responses were trusted at runtime                                                 | Task list responses are validated                   |
| Low      | Information exposure | No controlled error handling                                                          | Fixed user messages that never echo server content  |
| Low      | Privacy              | Angular CLI analytics identifier was committed                                        | Removed from the tree and analytics disabled        |

## Verified

- A script-bearing task title rendered as inert text in a real browser, and no payload executed.
- The production page ran under its CSP with no console errors or violations.
- Create, update and delete requests carried a valid XSRF header against a stub API that enforces it.
- The history scan found no private keys, environment files, or credential assignments. A pattern scan cannot prove that no secret ever existed.

## Open

| Severity | Item                                                                                      | Owner action                                        |
| -------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Info     | The client has no authentication. Any deployment depends on the API for access control.   | Enforce authentication and authorization in the API |
| Low      | `style-src` allows `'unsafe-inline'` because Angular injects component styles at runtime. | Adopt nonce-based CSP if served dynamically         |
| Low      | `frame-ancestors`, HSTS and related protections cannot be set from a static page.         | Set them as HTTP headers at the proxy               |
| Info     | The removed analytics identifier remains in git history. It is not a credential.          | None required                                       |

## Not applicable

The client has no login, password storage, contact form, database connection, or secrets, so password hashing, salting and two-factor authentication do not apply to this codebase. They must be implemented in any API that adds user accounts.
