import { query } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { dayBounds, formatTimestamp } from '../../utils/datetime.js';

// High-speed in-memory cache for workspace lists and details
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data, ttl = CACHE_TTL_MS) {
  if (cache.size > 500) cache.clear();
  cache.set(key, { data, expiresAt: Date.now() + ttl });
}

export function invalidateSpacesCache() {
  cache.clear();
}

const mapSpace = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  capacity: row.capacity,
  amenities: row.amenities,
  description: row.description,
  imageUrl: row.image_url || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export async function listSpaces(filters) {
  const cacheKey = `list:${JSON.stringify(filters)}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  const { search, type, minCapacity, date, startTime, endTime, page, limit } = filters;
  const conditions = [];
  const values = [];

  if (search) {
    // Covers the "search by space name or type" requirement in one input.
    values.push(`%${search}%`);
    conditions.push(`(s.name ILIKE $${values.length} OR s.type ILIKE $${values.length})`);
  }
  if (type) {
    values.push(type);
    conditions.push(`s.type = $${values.length}`);
  }
  if (minCapacity) {
    values.push(minCapacity);
    conditions.push(`s.capacity >= $${values.length}`);
  }

  if (date) {
    const from = `${date}T${startTime || '00:00'}:00`;
    const to = endTime ? `${date}T${endTime}:00` : dayBounds(date).end;

    values.push(from, to);
    const fromParam = `$${values.length - 1}`;
    const toParam = `$${values.length}`;

    // A space qualifies only when nothing live and nothing under maintenance
    // overlaps the requested window.
    conditions.push(`NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.space_id = s.id
        AND b.status IN ('pending', 'approved')
        AND tsrange(b.starts_at, b.ends_at, '[)') && tsrange(${fromParam}::timestamp, ${toParam}::timestamp, '[)')
    )`);
    conditions.push(`NOT EXISTS (
      SELECT 1 FROM maintenance_windows m
      WHERE m.space_id = s.id
        AND tsrange(m.starts_at, m.ends_at, '[)') && tsrange(${fromParam}::timestamp, ${toParam}::timestamp, '[)')
    )`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `SELECT s.*, COUNT(*) OVER () AS total_count
       FROM spaces s
       ${where}
      ORDER BY s.name ASC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset],
  );

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  const result = {
    data: rows.map(mapSpace),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };

  setCached(cacheKey, result);
  return result;
}

export async function getSpace(id) {
  const { rows } = await query('SELECT * FROM spaces WHERE id = $1', [id]);
  if (rows.length === 0) {
    throw ApiError.notFound('Space not found');
  }
  return mapSpace(rows[0]);
}

/**
 * Everything that makes a space unavailable on a given day. Booking owners are
 * deliberately left out: visitors only need to see that a slot is taken.
 */
export async function getAvailability(spaceId, date) {
  await getSpace(spaceId);
  const { start, end } = dayBounds(date);

  const bookings = await query(
    `SELECT id, starts_at, ends_at, status
       FROM bookings
      WHERE space_id = $1
        AND status IN ('pending', 'approved')
        AND starts_at < $3::timestamp
        AND ends_at > $2::timestamp
      ORDER BY starts_at`,
    [spaceId, start, end],
  );

  const maintenance = await query(
    `SELECT id, starts_at, ends_at, reason
       FROM maintenance_windows
      WHERE space_id = $1
        AND starts_at < $3::timestamp
        AND ends_at > $2::timestamp
      ORDER BY starts_at`,
    [spaceId, start, end],
  );

  return {
    spaceId,
    date,
    bookings: bookings.rows.map((row) => ({
      id: row.id,
      startsAt: formatTimestamp(row.starts_at),
      endsAt: formatTimestamp(row.ends_at),
      status: row.status,
    })),
    maintenance: maintenance.rows.map((row) => ({
      id: row.id,
      startsAt: formatTimestamp(row.starts_at),
      endsAt: formatTimestamp(row.ends_at),
      reason: row.reason,
    })),
  };
}

export async function createSpace(payload) {
  const { rows } = await query(
    `INSERT INTO spaces (name, type, capacity, amenities, description, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      payload.name,
      payload.type,
      payload.capacity,
      payload.amenities,
      payload.description,
      payload.imageUrl || '',
    ],
  );
  invalidateSpacesCache();
  return mapSpace(rows[0]);
}

export async function updateSpace(id, payload) {
  const columns = {
    name: payload.name,
    type: payload.type,
    capacity: payload.capacity,
    amenities: payload.amenities,
    description: payload.description,
    image_url: payload.imageUrl,
  };

  const assignments = [];
  const values = [];
  for (const [column, value] of Object.entries(columns)) {
    if (value === undefined) continue;
    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  }

  values.push(id);
  const { rows } = await query(
    `UPDATE spaces
        SET ${assignments.join(', ')}, updated_at = now()
      WHERE id = $${values.length}
      RETURNING *`,
    values,
  );

  if (rows.length === 0) {
    throw ApiError.notFound('Space not found');
  }
  invalidateSpacesCache();
  return mapSpace(rows[0]);
}

export async function deleteSpace(id) {
  // Bookings and maintenance windows cascade with the space.
  const { rowCount } = await query('DELETE FROM spaces WHERE id = $1', [id]);
  if (rowCount === 0) {
    throw ApiError.notFound('Space not found');
  }
  invalidateSpacesCache();
}

export async function getSpacesSummary() {
  const cacheKey = 'summary';
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const { rows } = await query(
    `SELECT id, name, type, capacity, description, image_url FROM spaces ORDER BY name ASC`,
  );

  const desks = rows.filter((r) => r.type === 'desk').length;
  const rooms = rows.filter((r) => r.type === 'meeting_room').length;
  const largest = rows.reduce((max, r) => Math.max(max, r.capacity), 0);
  const totalCapacity = rows.reduce((sum, r) => sum + r.capacity, 0);

  const result = {
    total: rows.length,
    desks,
    rooms,
    largest,
    totalCapacity,
    spaces: rows.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      capacity: r.capacity,
      description: r.description || '',
      imageUrl: r.image_url || '',
    })),
  };

  setCached(cacheKey, result, 60_000);
  return result;
}
