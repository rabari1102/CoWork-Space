import bcrypt from 'bcryptjs';
import { runMigrations } from './migrate.js';
import { pool, query } from './pool.js';

const USERS = [
  { name: 'Alex Doyle', email: 'admin@cowork.test', password: 'admin1234', role: 'admin' },
  { name: 'Priya Nair', email: 'member@cowork.test', password: 'member1234', role: 'member' },
  { name: 'Tom Weber', email: 'tom@cowork.test', password: 'member1234', role: 'member' },
];

const SPACES = [
  { name: 'Hot Desk A1', type: 'desk', capacity: 1, amenities: ['Monitor', 'Power outlet'], description: 'Open-plan desk near the window.' },
  { name: 'Hot Desk A2', type: 'desk', capacity: 1, amenities: ['Power outlet'], description: 'Open-plan desk in the quiet row.' },
  { name: 'Hot Desk B1', type: 'desk', capacity: 1, amenities: ['Monitor', 'Docking station'], description: 'Desk with a 27 inch monitor.' },
  { name: 'Standing Desk C1', type: 'desk', capacity: 1, amenities: ['Height adjustable', 'Monitor'], description: 'Electric sit-stand desk.' },
  { name: 'Focus Pod D1', type: 'desk', capacity: 1, amenities: ['Soundproofing', 'Power outlet'], description: 'Single-person pod for calls.' },
  { name: 'Huddle Room 1', type: 'meeting_room', capacity: 4, amenities: ['TV screen', 'Whiteboard'], description: 'Small room for stand-ups.' },
  { name: 'Huddle Room 2', type: 'meeting_room', capacity: 6, amenities: ['TV screen', 'Video conferencing'], description: 'Room with a camera and mic bar.' },
  { name: 'Boardroom', type: 'meeting_room', capacity: 12, amenities: ['Projector', 'Whiteboard', 'Video conferencing'], description: 'Main boardroom with a long table.' },
  { name: 'Training Room', type: 'meeting_room', capacity: 20, amenities: ['Projector', 'Whiteboard', 'Flipchart'], description: 'Classroom layout for workshops.' },
  { name: 'Studio', type: 'meeting_room', capacity: 8, amenities: ['Soundproofing', 'Lighting rig'], description: 'Recording and workshop studio.' },
];

/** Returns a wall-clock string N days from today at the given hour. */
function daysFromNow(days, hour) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:00:00`;
}

async function seed() {
  await runMigrations();

  // docker-compose passes --if-empty so a restart never wipes real data.
  if (process.argv.includes('--if-empty')) {
    const { rows } = await query('SELECT COUNT(*)::int AS total FROM users');
    if (rows[0].total > 0) {
      console.log('database already has data, skipping seed');
      return;
    }
  }

  await query('TRUNCATE bookings, maintenance_windows, spaces, refresh_tokens, users RESTART IDENTITY CASCADE');

  const userIds = {};
  for (const user of USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const { rows } = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [user.name, user.email, passwordHash, user.role],
    );
    userIds[user.email] = rows[0].id;
  }

  const spaceIds = {};
  for (const space of SPACES) {
    const { rows } = await query(
      'INSERT INTO spaces (name, type, capacity, amenities, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [space.name, space.type, space.capacity, space.amenities, space.description],
    );
    spaceIds[space.name] = rows[0].id;
  }

  // A few live bookings so the admin queue and the availability calendar are not
  // empty on a fresh install.
  const bookings = [
    { space: 'Boardroom', email: 'member@cowork.test', start: daysFromNow(1, 10), end: daysFromNow(1, 12), status: 'pending' },
    { space: 'Huddle Room 1', email: 'tom@cowork.test', start: daysFromNow(1, 14), end: daysFromNow(1, 15), status: 'pending' },
    { space: 'Hot Desk A1', email: 'member@cowork.test', start: daysFromNow(2, 9), end: daysFromNow(2, 17), status: 'approved' },
  ];

  for (const booking of bookings) {
    await query(
      'INSERT INTO bookings (space_id, user_id, starts_at, ends_at, status) VALUES ($1, $2, $3, $4, $5)',
      [spaceIds[booking.space], userIds[booking.email], booking.start, booking.end, booking.status],
    );
  }

  await query(
    'INSERT INTO maintenance_windows (space_id, starts_at, ends_at, reason) VALUES ($1, $2, $3, $4)',
    [spaceIds['Training Room'], daysFromNow(3, 8), daysFromNow(3, 18), 'Projector replacement'],
  );

  console.log(`seeded ${USERS.length} users, ${SPACES.length} spaces, ${bookings.length} bookings`);
  console.log('admin login:  admin@cowork.test / admin1234');
  console.log('member login: member@cowork.test / member1234');
}

seed()
  .then(() => pool.end())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
