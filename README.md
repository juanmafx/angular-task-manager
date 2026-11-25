# angular-task-manager

A compact Angular 22 task manager client, built as an interview-preparation workspace. It uses lazy-loaded feature routes, signal-based state, runtime validation of task list responses, and unit and component tests.

## Purpose

The repository is a practice ground for frontend interview exercises. It gives a realistic starting point (routing, HTTP, forms, state, tests) so an exercise can focus on the feature being asked for rather than on setup.

## Why it exists

Interview exercises are usually timed, and scaffolding consumes that time. Keeping a clean, already-tested baseline makes it possible to practice design decisions, state management and testing against a small but real CRUD domain.

## What it does

- Lists tasks from a REST API.
- Creates tasks with a trimmed, length-validated title.
- Advances a task through `pending`, `in_progress` and `completed`, then back to `pending`.
- Deletes tasks.
- Shows loading, empty and error states, and blocks concurrent writes.
- Includes a `/products` route that is an explicit placeholder with no data or API behind it.

**This repository contains the client only.** The REST API is not included. The expected contract is documented below, and `db/schema.sql` provides a matching PostgreSQL schema for whoever implements it.

## Architecture

```text
src/app/
  core/                  Cross-cutting infrastructure
    config/              API base URL injection token
    http/                Typed API client and safe error mapping
  features/
    tasks/
      domain/            Types, status rules, validation (framework-free)
      data/              REST adapter and response validation
      state/             Signal-based store
      ui/task-list/      Presentation component
    products/
      ui/product-list/   Placeholder page
```

Dependencies point inward: `ui -> state -> data -> domain`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Quick start

Requires Node.js 24 (see `.nvmrc`).

```bash
nvm use
npm ci --ignore-scripts
npm start
```

Open `http://localhost:4200/`. Requests to `/api` are proxied to `http://127.0.0.1:8000`. Without an API running there, the page loads and reports that the API is unreachable.

`./start-dev.sh` does the same on `http://127.0.0.1:4300/`.

## Usage guide

1. Type a title and press Enter or select **Add**.
2. Select **Status** to move a task to its next status.
3. Select **Delete** to remove a task.
4. Use the navigation bar to switch between **Tasks** and **Products**.

### API contract

| Method | Path              | Request body                               | Success response  |
| ------ | ----------------- | ------------------------------------------ | ----------------- |
| GET    | `/api/tasks`      | None                                       | `Task[]`          |
| POST   | `/api/tasks`      | `{ "title": string, "status": "pending" }` | Created task      |
| PUT    | `/api/tasks/{id}` | `{ "status": TaskStatus }`                 | Any JSON          |
| DELETE | `/api/tasks/{id}` | None                                       | Empty or any JSON |

A `Task` has a positive integer `id`, a `title`, an optional `description`, and a `status`. List responses that do not match this shape are rejected by the client. The client ignores the body of write responses, but it must be empty or valid JSON.

## Configuration

| Setting          | Location                    | Default                 |
| ---------------- | --------------------------- | ----------------------- |
| API base URL     | `API_BASE_URL` token        | `/api`                  |
| Dev proxy target | `proxy.conf.json`           | `http://127.0.0.1:8000` |
| Production CSP   | `src/index.production.html` | Same-origin sources     |

The client holds no secrets and needs no environment variables.

## Database

`db/schema.sql` creates the `tasks` table for the API described above, with constraints for a non-blank title of at most 200 characters and a valid status. It can be run repeatedly and targets PostgreSQL 14 or newer. The client does not connect to a database.

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

## Testing

```bash
npm run test:ci        # Unit and component tests
npm run test:coverage  # With coverage
npm run test:report    # Regenerates reports/tests/
npm run typecheck
npm run build
```

The latest committed run is in [reports/tests/latest.md](reports/tests/latest.md). Tests run on Vitest with jsdom.

## Security

- Angular template escaping, with no `innerHTML` or dynamic code execution.
- Same-origin API calls, so Angular sends the XSRF header on writes when the API issues an `XSRF-TOKEN` cookie. The API must verify that header.
- Content Security Policy in production builds. `style-src` still allows `'unsafe-inline'` because Angular injects component styles at runtime.
- Endpoint and id validation before a request is sent.
- User-facing errors never echo server content.

The client has no authentication, so a deployed API must enforce its own. See [SECURITY.md](SECURITY.md) and [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md).

## Project history

Originally created in 2026 and modernized in 2026.

## Attribution and license

The project was bootstrapped with [Angular CLI](https://github.com/angular/angular-cli) (MIT License), and `public/favicon.ico` comes from that scaffold. No license file has been published for this repository, so no reuse rights are granted beyond those of its third-party components.
