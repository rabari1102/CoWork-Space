-- btree_gist lets an exclusion constraint mix an equality check (space_id) with a
-- range overlap check. pg_trgm backs the ILIKE search on space names.
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens (user_id);

CREATE TABLE spaces (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL CHECK (type IN ('desk', 'meeting_room')),
    capacity    INTEGER NOT NULL CHECK (capacity > 0),
    amenities   TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL DEFAULT '',
    image_url   TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Filters exposed on the public listing.
CREATE INDEX spaces_type_idx ON spaces (type);
CREATE INDEX spaces_capacity_idx ON spaces (capacity);
CREATE INDEX spaces_name_trgm_idx ON spaces USING gin (name gin_trgm_ops);

-- Times are stored as naive timestamps and are always read as venue local time.
-- There is a single site, so there is nothing to convert between.
CREATE TABLE maintenance_windows (
    id         SERIAL PRIMARY KEY,
    space_id   INTEGER NOT NULL REFERENCES spaces (id) ON DELETE CASCADE,
    starts_at  TIMESTAMP NOT NULL,
    ends_at    TIMESTAMP NOT NULL,
    reason     TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT maintenance_windows_valid_range CHECK (ends_at > starts_at)
);

CREATE INDEX maintenance_windows_space_range_idx
    ON maintenance_windows USING gist (space_id, tsrange(starts_at, ends_at, '[)'));

CREATE TABLE bookings (
    id         SERIAL PRIMARY KEY,
    space_id   INTEGER NOT NULL REFERENCES spaces (id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    starts_at  TIMESTAMP NOT NULL,
    ends_at    TIMESTAMP NOT NULL,
    status     TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT bookings_valid_range CHECK (ends_at > starts_at)
);

-- The whole double-booking rule lives here rather than in application code. Two
-- live bookings (pending or approved) on the same space can never hold
-- overlapping time ranges, so two simultaneous transactions cannot both commit:
-- the second one fails with SQLSTATE 23P01 and is translated into a 409.
-- Rejected and cancelled rows drop out of the constraint and free the slot again.
ALTER TABLE bookings
    ADD CONSTRAINT bookings_no_overlap
    EXCLUDE USING gist (
        space_id WITH =,
        tsrange(starts_at, ends_at, '[)') WITH &&
    ) WHERE (status IN ('pending', 'approved'));

CREATE INDEX bookings_user_id_idx ON bookings (user_id);
CREATE INDEX bookings_status_idx ON bookings (status);
CREATE INDEX bookings_starts_at_idx ON bookings (starts_at);
CREATE INDEX bookings_space_starts_at_idx ON bookings (space_id, starts_at);
