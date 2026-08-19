# Co-working Space Desk & Room Booking System

Members book desks and meeting rooms for time slots, admins manage the inventory and
approve or reject requests, and the database itself guarantees that two people can
never hold the same slot.

- **Backend** - Node.js, Express, PostgreSQL (node-postgres), JWT with refresh tokens
- **Frontend** - React (Vite), Axios, React Router, Tailwind CSS, Phosphor icons
- **Infra** - Docker Compose brings up the database, API and web app together

---

## Running it

### With Docker (one command)

```bash
docker compose up --build
```

- Web app: http://localhost:5173
- API: http://localhost:4000/api

Migrations run on boot and the seed data is loaded automatically the first time
(only when the database is empty, so a restart never wipes your data).

### Without Docker

You need a PostgreSQL 13+ server. Both apps read their config from `.env`.

```bash
# backend
cd backend
cp .env.example .env          # point DATABASE_URL at your Postgres
npm install
npm run seed                  # runs migrations, then loads demo data
npm run dev                   # http://localhost:4000

# frontend, in a second terminal
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

### Demo accounts

| Role   | Email                | Password     |
| ------ | -------------------- | ------------ |
| Admin  | `admin@cowork.test`  | `admin1234`  |
| Member | `member@cowork.test` | `member1234` |
| Member | `tom@cowork.test`    | `member1234` |

---

## How double-booking is prevented

This is the core of the task, so it is worth being explicit about where the rule lives.

Checking for a clash with a `SELECT` and then inserting is not safe. Two requests can
both run the `SELECT`, both see a free slot, and both insert. Wrapping that in a
transaction does not help either, because under `READ COMMITTED` neither transaction
can see the other's uncommitted row.

So the rule is a **PostgreSQL exclusion constraint** instead
([`backend/migrations/001_init.sql`](backend/migrations/001_init.sql)):

```sql
ALTER TABLE bookings
    ADD CONSTRAINT bookings_no_overlap
    EXCLUDE USING gist (
        space_id WITH =,
        tsrange(starts_at, ends_at, '[)') WITH &&
    ) WHERE (status IN ('pending', 'approved'));
```

Read it as: *for the same `space_id`, no two rows may have overlapping time ranges,
considering only rows that are pending or approved.*

- `btree_gist` is what lets a GiST index mix the equality check on `space_id` with
  the range overlap check.
- `'[)'` makes the range half-open, so a booking that ends at 11:00 and one that
  starts at 11:00 are back-to-back, not overlapping.
- The `WHERE` clause means rejecting or cancelling a booking releases the slot
  immediately, with no extra bookkeeping.

Postgres takes a lock on the index entry, so under simultaneous requests the second
writer blocks until the first commits and then fails with SQLSTATE `23P01`. The error
middleware maps that to `409 SLOT_UNAVAILABLE`. One request wins, the other gets a
clean error - there is no window where both can succeed.

Booking creation still runs in a transaction
([`bookings.service.js`](backend/src/modules/bookings/bookings.service.js)) because
the maintenance-window check and the insert have to succeed or fail together.

### A note on auto-reject

The task asks for two things that interact:

1. a member cannot book a slot overlapping an existing **approved or pending** booking, and
2. approving a booking should auto-reject other **pending** bookings that overlap it.

Because the constraint above already covers `pending`, two overlapping pending
bookings cannot exist in the first place, so in practice the auto-reject statement
matches zero rows. It is implemented anyway, inside the same transaction as the
approval, so the invariant holds even if the constraint's `WHERE` clause is ever
widened.

---

## Auth

Access tokens are short-lived (15 minutes) and carry the user id and role. Refresh
tokens live for 7 days and are stored in the `refresh_tokens` table as SHA-256
digests, so a leaked database dump does not hand over usable tokens.

Refresh tokens **rotate**: every call to `POST /api/auth/refresh` revokes the token it
was given and issues a new pair. Replaying an old refresh token returns 401, which
also means a stolen token stops working the moment the real owner refreshes.

On the client, an Axios response interceptor
([`frontend/src/api/client.js`](frontend/src/api/client.js)) catches a 401, refreshes
once and replays the original request. Parallel requests that expire together share a
single refresh call rather than each firing their own.

---

## API

All responses are JSON. Errors always use the same envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "body.startsAt", "message": "Bookings cannot start in the past" }]
  }
}
```

`details` is only present for validation failures.

### Auth

| Method | Path                 | Access | Notes                                    |
| ------ | -------------------- | ------ | ---------------------------------------- |
| POST   | `/api/auth/register` | Public | Rate limited. Always creates a member.    |
| POST   | `/api/auth/login`    | Public | Rate limited.                             |
| POST   | `/api/auth/refresh`  | Public | Rotates the refresh token.                |
| POST   | `/api/auth/logout`   | Public | Revokes the supplied refresh token.       |
| GET    | `/api/auth/me`       | Any    | Current user.                             |

### Spaces

| Method | Path                                          | Access | Notes                                   |
| ------ | --------------------------------------------- | ------ | --------------------------------------- |
| GET    | `/api/spaces`                                 | Public | Search, filters, pagination.            |
| GET    | `/api/spaces/:id`                             | Public | Single space.                           |
| GET    | `/api/spaces/:id/availability?date=`          | Public | Bookings + maintenance for that day.    |
| POST   | `/api/spaces`                                 | Admin  |                                         |
| PATCH  | `/api/spaces/:id`                             | Admin  | Partial update.                         |
| DELETE | `/api/spaces/:id`                             | Admin  | Cascades to its bookings.               |
| GET    | `/api/spaces/:id/maintenance`                 | Admin  |                                         |
| POST   | `/api/spaces/:id/maintenance`                 | Admin  | 409 if live bookings sit in the window. |
| DELETE | `/api/spaces/:id/maintenance/:maintenanceId`  | Admin  |                                         |

Query parameters on `GET /api/spaces`: `search`, `type` (`desk` \| `meeting_room`),
`minCapacity`, `date`, `startTime`, `endTime`, `page`, `limit`. Supplying `date` (plus
optionally a time range) returns only spaces with nothing booked and no maintenance in
that window.

### Bookings

| Method | Path                        | Access | Notes                                            |
| ------ | --------------------------- | ------ | ------------------------------------------------ |
| POST   | `/api/bookings`             | Member | Creates a pending booking.                        |
| GET    | `/api/bookings/me`          | Member | Own bookings, filter by `status`.                 |
| PATCH  | `/api/bookings/:id/cancel`  | Member | Own, future, pending or approved only.            |
| GET    | `/api/bookings`             | Admin  | Filter by `status`, `spaceId`, `date`.            |
| PATCH  | `/api/bookings/:id/approve` | Admin  | Also auto-rejects overlapping pending bookings.   |
| PATCH  | `/api/bookings/:id/reject`  | Admin  |                                                   |

A Postman collection covering every endpoint is in
[`postman_collection.json`](postman_collection.json). Log in first - the collection
stores the tokens in variables and the other requests reuse them.

---

## Data model

```
users (id, name, email UNIQUE, password_hash, role)
refresh_tokens (id, user_id, token_hash UNIQUE, expires_at, revoked_at)
spaces (id, name, type, capacity, amenities[], description)
maintenance_windows (id, space_id, starts_at, ends_at, reason)
bookings (id, space_id, user_id, starts_at, ends_at, status)
```

Indexes exist on everything the app filters or searches by:

- `spaces` - `type`, `capacity`, and a GIN trigram index on `name` so the `ILIKE`
  search does not degrade into a sequential scan
- `bookings` - `user_id`, `status`, `starts_at`, and a composite `(space_id, starts_at)`
- `maintenance_windows` - a GiST index on `(space_id, tsrange(starts_at, ends_at))`
- the exclusion constraint itself is backed by a GiST index that also serves the
  overlap queries used by the availability endpoint

### About time

Times are stored as `TIMESTAMP` without a time zone and are always read as venue local
time. There is one site, so there is nothing to convert between, and it keeps the
calendar honest: what a member picks is exactly what is stored and displayed. Set `TZ`
on the backend to the venue's zone (`docker-compose.yml` uses UTC).

---

## Validation and error handling

Every write endpoint validates its body, params and query with zod before the
controller runs ([`middleware/validate.js`](backend/src/middleware/validate.js)),
which replaces the raw request parts with the parsed output. Bookings are rejected
when they are malformed, end before they start, or start in the past. Overlaps are
rejected by the database.

A single error middleware
([`middleware/errorHandler.js`](backend/src/middleware/errorHandler.js)) produces the
envelope above. It knows how to translate Postgres error codes (`23P01` exclusion,
`23505` unique, `23503` foreign key, `23514` check) and JWT errors, and anything it
does not recognise becomes a 500 with the details hidden in production.

Login and register are rate limited to 10 requests per IP per 15 minutes.

---

## Project layout

```
backend/
  migrations/001_init.sql        schema, indexes, exclusion constraint
  src/
    config/env.js                environment config, fails fast if a secret is missing
    db/                          pool, transaction helper, migration runner, seed
    middleware/                  auth, validate, rate limit, error handler
    modules/
      auth/                      register, login, refresh, logout
      spaces/                    public listing plus admin CRUD
      maintenance/               blackout windows
      bookings/                  create, cancel, approve, reject
    utils/                       ApiError, async wrapper, date helpers, email stub
frontend/
  src/
    api/                         axios instance, refresh interceptor, endpoints
    context/                     session state and toast notifications
    components/                  navbar, filters, calendar, modals, admin shell
    pages/                       listing, detail, login, register, dashboards
    utils/format.js              wall-clock date and duration formatting
docker-compose.yml
```

---

## Deploying to Vercel

The repo deploys as **two Vercel projects from the same repository**, plus a
managed Postgres. Vercel does not host a database, and the schema needs the
`btree_gist` and `pg_trgm` extensions, so the provider has to support them -
Neon and Supabase both do.

| Project  | Root directory | Framework preset  |
| -------- | -------------- | ----------------- |
| Backend  | `backend`      | Express (detected) |
| Frontend | `frontend`     | Vite (detected)    |

The backend needs no adapter: Vercel detects `src/server.js`, and that file
exports the Express app as its default export. The bootstrap that waits for the
database, runs migrations and calls `listen()` is guarded so it only runs when
the file is executed directly, which is what Docker and `npm run dev` do.

Migrations are **not** run on deploy - a serverless function has no boot step to
hang them off, and concurrent cold starts would race. Point `DATABASE_URL` at
the new database and run them once from your machine:

```bash
cd backend
npm run seed          # runs migrations, then loads the demo data
```

Backend environment variables:

| Variable                              | Value                                            |
| ------------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`                        | the provider's **pooled** connection string      |
| `JWT_ACCESS_SECRET`                   | a long random string                             |
| `JWT_REFRESH_SECRET`                  | a different long random string                   |
| `CORS_ORIGIN`                         | the frontend's deployed URL, no trailing slash   |
| `TZ`                                  | the venue's timezone, e.g. `UTC`                 |

Frontend environment variable: `VITE_API_URL` set to
`https://<backend-project>.vercel.app/api`. It is read at build time, so
changing it needs a redeploy.

`frontend/vercel.json` rewrites every path to `index.html`; without it a deep
link such as `/admin/bookings` returns 404 because React Router owns that route
on the client, not the CDN.

Two caveats that come with serverless rather than with this code:

- **Rate limiting is per instance.** `express-rate-limit` keeps its counters in
  memory, so each function instance enforces its own budget. It still works, but
  it is weaker than the single-process limit you get under Docker. A shared
  store (Redis) is the production answer.
- **Use the pooled connection string.** Each instance opens its own pool, so
  connecting direct will exhaust the database's connection limit under load.

## What is not included

- Email is a stub. `utils/notifier.js` logs the message that would have been sent on
  every booking status change rather than talking to a mail provider.
- There is no deployed link; everything runs locally through Docker Compose.
