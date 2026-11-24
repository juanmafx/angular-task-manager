# Architecture

## Scope

This repository is a browser client. It contains no server code, so it is not split into `frontend/` and `backend/`. If an API is added later, the client should move to `frontend/` and the API should live in `backend/`.

## System context

```text
Browser (Angular SPA)
   |  same-origin /api, XSRF header on writes
   v
Reverse proxy or dev proxy
   |
   v
Task REST API (not in this repository)
   |
   v
PostgreSQL (db/schema.sql)
```

## Module structure

```text
src/app/
  app.ts                 Shell with navigation and router outlet
  app.config.ts          Router and HTTP providers
  app.routes.ts          Lazy feature routes
  core/
    config/api-base-url.token.ts
    http/api-client.service.ts
    http/api-error.ts
  features/
    tasks/
      tasks.routes.ts
      domain/task.model.ts
      data/task-api.service.ts
      state/task.store.ts
      ui/task-list/
    products/
      products.routes.ts
      ui/product-list/
```

## Layer rules

| Layer    | Responsibility                                 | May depend on            |
| -------- | ---------------------------------------------- | ------------------------ |
| `ui`     | Rendering and user events                      | `state`, `domain`        |
| `state`  | Loading, saving and error state; orchestration | `data`, `domain`, `core` |
| `data`   | HTTP mapping and response validation           | `domain`, `core`         |
| `domain` | Types, status transitions, validation          | Nothing                  |
| `core`   | Feature-agnostic infrastructure                | Nothing in `features`    |

## Key decisions

- **Signals for state.** `TaskStore` exposes read-only signals, and components use `OnPush`.
- **Component-scoped store.** The store is provided by `TaskList`, so its state is released when the route is left.
- **Server as source of truth.** Each successful write reloads the list rather than applying optimistic updates, which keeps the exercise simple and consistent.
- **Stale response protection.** Only the most recent load may update state.
- **Single write at a time.** Concurrent writes are ignored while one is in flight.
- **Validation at the boundary.** List responses are checked at runtime, because TypeScript types do not exist at runtime.
- **Relative API URL.** A same-origin `/api` removes environment-specific URLs and enables Angular's XSRF interceptor, which skips absolute URLs.

## Recommended production deployment

- Serve the static build and the API from one origin behind a reverse proxy.
- Set CSP, `Strict-Transport-Security`, `X-Content-Type-Options` and `frame-ancestors` as HTTP headers. A `<meta>` CSP cannot express `frame-ancestors`.
- Have the API issue the `XSRF-TOKEN` cookie and verify the `X-XSRF-TOKEN` header on writes.
- Enforce authentication, authorization, validation and rate limiting in the API.

## Data model

`db/schema.sql` defines one table, `tasks`. Its check constraints mirror the domain rules: a non-blank title of at most 200 characters and one of three statuses. A trigger maintains `updated_at`.
