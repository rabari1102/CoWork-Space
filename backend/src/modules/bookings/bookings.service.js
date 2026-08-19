import { query, withTransaction } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { dayBounds, formatTimestamp, nowLocal } from '../../utils/datetime.js';
import { sendBookingStatusEmail } from '../../utils/notifier.js';

const mapBooking = (row) => ({
  id: row.id,
  spaceId: row.space_id,
  spaceName: row.space_name,
  spaceType: row.space_type,
  userId: row.user_id,
  userName: row.user_name,
  userEmail: row.user_email,
  startsAt: formatTimestamp(row.starts_at),
  endsAt: formatTimestamp(row.ends_at),
  status: row.status,
  createdAt: row.created_at,
});

const BOOKING_SELECT = `
  SELECT b.*,
         s.name AS space_name,
         s.type AS space_type,
         u.name AS user_name,
         u.email AS user_email
    FROM bookings b
    JOIN spaces s ON s.id = b.space_id
    JOIN users u ON u.id = b.user_id
`;

async function findBookingById(client, id) {
  const { rows } = await client.query(`${BOOKING_SELECT} WHERE b.id = $1`, [id]);
  if (rows.length === 0) {
    throw ApiError.notFound('Booking not found');
  }
  return rows[0];
}

/**
 * Creates a pending booking.
 *
 * The overlap rule is not checked with a SELECT first: a check-then-insert can
 * always be beaten by a second request that slips in between the two
 * statements. Instead the insert runs straight into the bookings_no_overlap
 * exclusion constraint, so Postgres serialises the two writers and the loser
 * gets SQLSTATE 23P01, which the error middleware turns into a 409.
 */
export async function createBooking(userId, { spaceId, startsAt, endsAt }) {
  return withTransaction(async (client) => {
    const space = await client.query('SELECT id FROM spaces WHERE id = $1 FOR SHARE', [spaceId]);
    if (space.rowCount === 0) {
      throw ApiError.notFound('Space not found');
    }

    const maintenance = await client.query(
      `SELECT 1 FROM maintenance_windows
        WHERE space_id = $1
          AND tsrange(starts_at, ends_at, '[)') && tsrange($2::timestamp, $3::timestamp, '[)')
        LIMIT 1`,
      [spaceId, startsAt, endsAt],
    );
    if (maintenance.rowCount > 0) {
      throw ApiError.conflict(
        'SPACE_UNDER_MAINTENANCE',
        'The space is closed for maintenance during that time',
      );
    }

    const inserted = await client.query(
      `INSERT INTO bookings (space_id, user_id, starts_at, ends_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [spaceId, userId, startsAt, endsAt],
    );

    return mapBooking(await findBookingById(client, inserted.rows[0].id));
  });
}

export async function listUserBookings(userId, { status, page, limit }) {
  const values = [userId];
  let where = 'WHERE b.user_id = $1';

  if (status) {
    values.push(status);
    where += ` AND b.status = $${values.length}`;
  }

  const offset = (page - 1) * limit;
  const { rows } = await query(
    `${BOOKING_SELECT} ${where}
      ORDER BY b.starts_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset],
  );

  const counted = await query(
    `SELECT COUNT(*)::int AS total FROM bookings b ${where}`,
    values,
  );

  return buildPage(rows, counted.rows[0].total, page, limit);
}

export async function listAllBookings({ status, spaceId, date, page, limit }) {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`b.status = $${values.length}`);
  }
  if (spaceId) {
    values.push(spaceId);
    conditions.push(`b.space_id = $${values.length}`);
  }
  if (date) {
    const { start, end } = dayBounds(date);
    values.push(start, end);
    conditions.push(
      `b.starts_at < $${values.length}::timestamp AND b.ends_at > $${values.length - 1}::timestamp`,
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `${BOOKING_SELECT} ${where}
      ORDER BY b.starts_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset],
  );

  const counted = await query(`SELECT COUNT(*)::int AS total FROM bookings b ${where}`, values);

  return buildPage(rows, counted.rows[0].total, page, limit);
}

function buildPage(rows, total, page, limit) {
  return {
    data: rows.map(mapBooking),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function cancelBooking(user, bookingId) {
  return withTransaction(async (client) => {
    const locked = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
    if (locked.rowCount === 0) {
      throw ApiError.notFound('Booking not found');
    }

    const booking = locked.rows[0];
    if (booking.user_id !== Number(user.id)) {
      throw ApiError.forbidden('You can only cancel your own bookings');
    }
    if (!['pending', 'approved'].includes(booking.status)) {
      throw ApiError.conflict('INVALID_STATUS', `A ${booking.status} booking cannot be cancelled`);
    }
    if (formatTimestamp(booking.starts_at) <= nowLocal()) {
      throw ApiError.conflict('BOOKING_STARTED', 'Only future bookings can be cancelled');
    }

    await client.query(
      "UPDATE bookings SET status = 'cancelled', updated_at = now() WHERE id = $1",
      [bookingId],
    );

    const updated = mapBooking(await findBookingById(client, bookingId));
    notify(updated);
    return updated;
  });
}

/**
 * Approves a pending booking and, as the task requires, rejects every other
 * pending booking that overlaps it. In practice the exclusion constraint has
 * already stopped an overlapping pending row from existing, so this is the
 * belt-and-braces half of the rule rather than the load-bearing one.
 */
export async function approveBooking(bookingId) {
  return withTransaction(async (client) => {
    const booking = await lockPending(client, bookingId);

    await client.query(
      "UPDATE bookings SET status = 'approved', updated_at = now() WHERE id = $1",
      [bookingId],
    );

    const clashing = await client.query(
      `UPDATE bookings b
          SET status = 'rejected', updated_at = now()
         FROM spaces s, users u
        WHERE b.space_id = s.id
          AND b.user_id = u.id
          AND b.space_id = $1
          AND b.id <> $2
          AND b.status = 'pending'
          AND tsrange(b.starts_at, b.ends_at, '[)') && tsrange($3::timestamp, $4::timestamp, '[)')
      RETURNING b.*, s.name AS space_name, s.type AS space_type,
                u.name AS user_name, u.email AS user_email`,
      [booking.space_id, bookingId, booking.starts_at, booking.ends_at],
    );

    const approved = mapBooking(await findBookingById(client, bookingId));
    notify(approved);
    clashing.rows.map(mapBooking).forEach(notify);

    return { booking: approved, autoRejected: clashing.rows.map((row) => row.id) };
  });
}

export async function rejectBooking(bookingId) {
  return withTransaction(async (client) => {
    await lockPending(client, bookingId);
    await client.query(
      "UPDATE bookings SET status = 'rejected', updated_at = now() WHERE id = $1",
      [bookingId],
    );

    const updated = mapBooking(await findBookingById(client, bookingId));
    notify(updated);
    return updated;
  });
}

async function lockPending(client, bookingId) {
  const { rows } = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
  if (rows.length === 0) {
    throw ApiError.notFound('Booking not found');
  }
  if (rows[0].status !== 'pending') {
    throw ApiError.conflict('INVALID_STATUS', `This booking is already ${rows[0].status}`);
  }
  return rows[0];
}

function notify(booking) {
  sendBookingStatusEmail({
    to: booking.userEmail,
    name: booking.userName,
    spaceName: booking.spaceName,
    booking,
  });
}
