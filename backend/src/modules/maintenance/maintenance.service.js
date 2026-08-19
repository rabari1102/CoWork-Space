import { query, withTransaction } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { formatTimestamp } from '../../utils/datetime.js';

const mapWindow = (row) => ({
  id: row.id,
  spaceId: row.space_id,
  startsAt: formatTimestamp(row.starts_at),
  endsAt: formatTimestamp(row.ends_at),
  reason: row.reason,
});

export async function listWindows(spaceId) {
  const { rows } = await query(
    'SELECT * FROM maintenance_windows WHERE space_id = $1 ORDER BY starts_at',
    [spaceId],
  );
  return rows.map(mapWindow);
}

export async function createWindow(spaceId, { startsAt, endsAt, reason }) {
  return withTransaction(async (client) => {
    const space = await client.query('SELECT id FROM spaces WHERE id = $1 FOR SHARE', [spaceId]);
    if (space.rowCount === 0) {
      throw ApiError.notFound('Space not found');
    }

    // Blocking out a range that members have already reserved would leave the
    // space double-committed, so refuse instead of silently overriding them.
    const clash = await client.query(
      `SELECT 1 FROM bookings
        WHERE space_id = $1
          AND status IN ('pending', 'approved')
          AND tsrange(starts_at, ends_at, '[)') && tsrange($2::timestamp, $3::timestamp, '[)')
        LIMIT 1`,
      [spaceId, startsAt, endsAt],
    );
    if (clash.rowCount > 0) {
      throw ApiError.conflict(
        'BOOKINGS_IN_WINDOW',
        'There are live bookings inside that window. Reject or cancel them first.',
      );
    }

    const { rows } = await client.query(
      `INSERT INTO maintenance_windows (space_id, starts_at, ends_at, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [spaceId, startsAt, endsAt, reason],
    );
    return mapWindow(rows[0]);
  });
}

export async function deleteWindow(spaceId, maintenanceId) {
  const { rowCount } = await query(
    'DELETE FROM maintenance_windows WHERE id = $1 AND space_id = $2',
    [maintenanceId, spaceId],
  );
  if (rowCount === 0) {
    throw ApiError.notFound('Maintenance window not found');
  }
}
