import bcrypt from 'bcryptjs';
import { runMigrations } from './migrate.js';
import { pool, query } from './pool.js';

const USERS = [
  { name: 'Alex Doyle', email: 'admin@cowork.test', password: 'admin1234', role: 'admin' },
  { name: 'Priya Nair', email: 'member@cowork.test', password: 'member1234', role: 'member' },
  { name: 'Tom Weber', email: 'tom@cowork.test', password: 'member1234', role: 'member' },
  { name: 'Sarah Jenkins', email: 'sarah.j@example.com', password: 'member1234', role: 'member' },
  { name: 'Marcus Chen', email: 'marcus.c@example.com', password: 'member1234', role: 'member' },
];

export const SPACES = [
  // --- DESKS & INDIVIDUAL WORKSPACES (1 to 24) ---
  {
    name: 'Hot Desk Alpha-1',
    type: 'desk',
    capacity: 1,
    amenities: ['4K Monitor', 'USB-C Docking', 'Ergonomic Chair', 'Power Outlet'],
    description: 'Bright open-plan desk bathed in natural light with rapid dual-cable connection.',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Hot Desk Alpha-2',
    type: 'desk',
    capacity: 1,
    amenities: ['Power Outlet', 'Fast Wi-Fi 6', 'Wireless Charger'],
    description: 'Minimalist hot desk in the central active atrium, steps away from the espresso bar.',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Hot Desk Beta-1',
    type: 'desk',
    capacity: 1,
    amenities: ['27" 4K Monitor', 'Standing Lamp', 'Surge Protector'],
    description: 'Quiet corner desk with expansive garden views and adjustable warm task lighting.',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Hot Desk Beta-2',
    type: 'desk',
    capacity: 1,
    amenities: ['Power Outlet', 'Ethernet Port', 'Ergonomic Stool'],
    description: 'High-focus work spot along the acoustic-paneled eastern gallery wall.',
    imageUrl: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Standing Desk Ergo-1',
    type: 'desk',
    capacity: 1,
    amenities: ['Motorized Height Adjust', 'Anti-Fatigue Mat', 'Dual Arm Mount'],
    description: 'Premium sit-stand motorized desk with custom memory height presets and anti-fatigue mat.',
    imageUrl: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Standing Desk Ergo-2',
    type: 'desk',
    capacity: 1,
    amenities: ['Motorized Height Adjust', 'Ultrawide 34" Monitor', 'Thunderbolt 4 Dock'],
    description: 'Electric adjustable workstation equipped with a curved 34-inch ultra-wide display.',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Solarium Desk S1',
    type: 'desk',
    capacity: 1,
    amenities: ['Natural Sunlight', 'Plant Nook', 'Power Outlet', 'Monitor'],
    description: 'Glass-roofed solarium workstation surrounded by lush indoor botanical landscaping.',
    imageUrl: 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Solarium Desk S2',
    type: 'desk',
    capacity: 1,
    amenities: ['Natural Sunlight', 'Power Outlet', 'Ergonomic Mesh Chair'],
    description: 'Sun-drenched quiet desk offering an uplifting, calm atmosphere for creative thinking.',
    imageUrl: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Mezzanine Desk M1',
    type: 'desk',
    capacity: 1,
    amenities: ['Panoramic View', 'High-speed Fiber', 'Desk Lamp', 'Power Strip'],
    description: 'Elevated second-floor mezzanine desk overlooking the full architectural common floor.',
    imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Quiet Library Desk Q1',
    type: 'desk',
    capacity: 1,
    amenities: ['Strict Silence Zone', 'Reading Lamp', 'Leather Desk Pad', 'Privacy Divider'],
    description: 'Dedicated silent zone workstation designed for deep writing, research, and analysis.',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Quiet Library Desk Q2',
    type: 'desk',
    capacity: 1,
    amenities: ['Strict Silence Zone', 'Book Divider', 'Herman Miller Chair', 'Power Outlet'],
    description: 'Acoustically treated library study desk with zero interruptions guaranteed.',
    imageUrl: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Acoustic Focus Pod F1',
    type: 'desk',
    capacity: 1,
    amenities: ['Soundproof Glass', 'Ventilation Fan', 'Dimmable LED', 'Power Outlet'],
    description: 'Private enclosed acoustic phone pod for confident confidential video calls and podcasts.',
    imageUrl: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Acoustic Focus Pod F2',
    type: 'desk',
    capacity: 1,
    amenities: ['Soundproof Walls', 'Internal Airflow', 'Ring Light', 'USB-C Charging'],
    description: 'Sound-isolated micro office booth with built-in camera lighting for video interviews.',
    imageUrl: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Executive Workstation E1',
    type: 'desk',
    capacity: 1,
    amenities: ['Lockable Drawers', 'Dual 27" Displays', 'Premium Ergonomic Chair', 'Filing Cabinet'],
    description: 'Spacious corner workstation with dedicated storage and multi-monitor productivity hub.',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Executive Workstation E2',
    type: 'desk',
    capacity: 1,
    amenities: ['Solid Walnut Desk', 'Curved Display', 'Desk Organizer', 'Cable Management'],
    description: 'Handcrafted hardwood executive desk in the private membership wing.',
    imageUrl: 'https://images.unsplash.com/photo-1595844730298-b960ff98fee0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Loft Workspace L1',
    type: 'desk',
    capacity: 1,
    amenities: ['Industrial Brick Accent', 'High Ceilings', 'Power Outlet', 'Monitor'],
    description: 'Exposed brick loft desk with soaring 18ft ceilings and inspiring architectural volume.',
    imageUrl: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Loft Workspace L2',
    type: 'desk',
    capacity: 1,
    amenities: ['Industrial Chic', 'Track Lighting', 'Fast Wi-Fi 6', 'Coffee Bar Proximity'],
    description: 'Trendy loft hot desk near our gourmet specialty coffee counter.',
    imageUrl: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Designer Lab Station D1',
    type: 'desk',
    capacity: 1,
    amenities: ['Color-Accurate 4K ProArt Display', 'Wacom Tablet Mount', 'Anti-Glare Lighting'],
    description: 'Calibrated color workstation tailored specifically for graphic designers, 3D artists, and editors.',
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Developer Pod Dev-1',
    type: 'desk',
    capacity: 1,
    amenities: ['Vertical Pivot Monitor', 'Mechanical Keyboard Dock', 'Gigabit Ethernet', 'Power Outlet'],
    description: 'Dual monitor setup with vertical rotation support designed for full-stack software development.',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Developer Pod Dev-2',
    type: 'desk',
    capacity: 1,
    amenities: ['Dual 4K Screens', 'Ethernet RJ45', 'Ergonomic Armrests', 'High Speed Wi-Fi'],
    description: 'High-throughput workstation with direct hardwired fiber connectivity for heavy builds.',
    imageUrl: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Window Bay Desk W1',
    type: 'desk',
    capacity: 1,
    amenities: ['Skyline View', 'Natural Daylight', 'Single Monitor', 'Power Outlet'],
    description: 'Floor-to-ceiling glass panoramic desk overlooking downtown skyscrapers.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Window Bay Desk W2',
    type: 'desk',
    capacity: 1,
    amenities: ['Skyline View', 'Shaded Blinds', 'Ergonomic Chair', 'Fast Wi-Fi'],
    description: 'Panoramic window seat with motorized sun diffusion shades and serene outlooks.',
    imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Garden Terrace Desk T1',
    type: 'desk',
    capacity: 1,
    amenities: ['Outdoor Terrace Access', 'Weatherproof Outlets', 'High-Speed Mesh Wi-Fi'],
    description: 'Semi-sheltered open-air garden terrace workstation for working al fresco on clear days.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Minimalist Nook N1',
    type: 'desk',
    capacity: 1,
    amenities: ['Noise Reduction Felt', 'Dimmable Lamp', 'Power Strip'],
    description: 'Compact, zero-clutter nook lined with felt sound absorption panels for laser focus.',
    imageUrl: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1200&q=80',
  },

  // --- HUDDLE ROOMS & COLLABORATION HUBS (25 to 37) ---
  {
    name: 'Huddle Room Zen',
    type: 'meeting_room',
    capacity: 4,
    amenities: ['55" 4K TV', 'Logitech MeetUp Cam', 'Magnetic Whiteboard', 'Conference Mic'],
    description: 'Intimate Japanese minimalist huddle space with warm wood slats and instant wireless display cast.',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Huddle Room Spark',
    type: 'meeting_room',
    capacity: 4,
    amenities: ['4K Display', 'Jabra Speak 710', 'Glass Whiteboard', 'HDMI / Type-C'],
    description: 'Vibrant brainstorm nook with acoustic felt walls and rapid idea capture boards.',
    imageUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Huddle Room Nexus',
    type: 'meeting_room',
    capacity: 5,
    amenities: ['50" Smart TV', 'Wide-Angle Camera', 'Conference Phone', 'Whiteboard'],
    description: 'Balanced meeting room ideal for client consultations, pitch practice, and 1-on-1 reviews.',
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Huddle Room Orbit',
    type: 'meeting_room',
    capacity: 4,
    amenities: ['4K Video Bar', 'Digital Whiteboard', 'Apple AirPlay', 'Miracast'],
    description: 'Compact high-tech room optimized for hybrid standups with remote team members.',
    imageUrl: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Meeting Room Timber',
    type: 'meeting_room',
    capacity: 6,
    amenities: ['65" Ultra HD TV', 'Poly Studio 4K Bar', 'Full Wall Whiteboard', 'Oak Conference Table'],
    description: 'Scandinavian solid timber meeting space featuring acoustic dampening and crystal-clear audio.',
    imageUrl: 'https://images.unsplash.com/photo-1568992688065-536aad8a12f6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Meeting Room Canopy',
    type: 'meeting_room',
    capacity: 6,
    amenities: ['Conference TV', 'Omnidirectional Mics', 'Glass Whiteboard', 'Coffee Service'],
    description: 'Surrounded by indoor greenery, Canopy blends biophilic design with corporate-grade video tools.',
    imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Meeting Room Horizon',
    type: 'meeting_room',
    capacity: 6,
    amenities: ['65" 4K Screen', 'Zoom Rooms Certified', 'Neat Bar Pro', 'HDMI / Wireless Screen Share'],
    description: 'Corner conference room with expansive skyline horizons and one-tap Zoom conferencing.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Collaboration Hub C1',
    type: 'meeting_room',
    capacity: 6,
    amenities: ['Dual Touchscreens', 'Post-it Walls', 'Modular Tables', 'Snack Bar Access'],
    description: 'Flexible agile room with movable furniture configured for sprint planning and design sprints.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Project War Room 1',
    type: 'meeting_room',
    capacity: 8,
    amenities: ['360 Whiteboard Paint', 'Dual 65" Displays', 'Soundproofing', 'Dedicated Fiber Drop'],
    description: 'High-security enclosed project command center built for intense multi-day team sprints.',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Agile Sprint Room 2',
    type: 'meeting_room',
    capacity: 8,
    amenities: ['Smart Whiteboard', '4K Video Bar', 'Comfortable Swivel Chairs', 'Catering Table'],
    description: 'Purpose-built for agile ceremonies, product retrospectives, and architecture reviews.',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Strategy Suite Matrix',
    type: 'meeting_room',
    capacity: 8,
    amenities: ['75" Interactive Display', 'Ceiling Mic Array', 'Ergonomic Seating', 'Executive Beverage Bar'],
    description: 'Modern executive suite equipped with touchscreen collaborative whiteboards and ceiling audio.',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Venture Pitch Room',
    type: 'meeting_room',
    capacity: 10,
    amenities: ['Dual 75" Displays', 'PTZ Auto-Tracking Camera', 'Podium & Lapel Mics', 'Presenter Clicker'],
    description: 'Designed for investor pitches, key stakeholder presentations, and demo day dry runs.',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Design Thinking Studio',
    type: 'meeting_room',
    capacity: 10,
    amenities: ['Movable Whiteboard Walls', 'Prototyping Kit', 'High Top Stools', 'Projector'],
    description: 'Dynamic workshop space with endless sticky surfaces, craft kits, and workshop accessories.',
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
  },

  // --- MEETING ROOMS & LARGE SPACES (38 to 46) ---
  {
    name: 'Meeting Room Atlas',
    type: 'meeting_room',
    capacity: 16,
    amenities: ['Dual 85" 4K UHD Screens', 'Cisco Telepresence', 'Leather Executive Chairs', 'Acoustic Wood Ceiling'],
    description: 'Premier large meeting room with high-definition presentation displays and conferencing.',
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Meeting Room Meridian',
    type: 'meeting_room',
    capacity: 14,
    amenities: ['Laser 4K Projector', 'Poly Trio Smart Mics', 'Motorized Blackout Shades', 'Coffee Station'],
    description: 'Polished oak meeting room with discreet built-in AV and wireless presentation.',
    imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Meeting Room Vantage',
    type: 'meeting_room',
    capacity: 12,
    amenities: ['75" 4K Touch Display', 'Shure Table Mics', 'Video Conferencing', 'Whiteboard'],
    description: 'Classic high-floor meeting room with executive seating and presentation controls.',
    imageUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Meeting Room Summit',
    type: 'meeting_room',
    capacity: 18,
    amenities: ['Laser Projection Wall', 'Surround Sound', 'Smart Lighting Scenes', 'Catering Prep Station'],
    description: 'Flagship meeting room tailored for large team presentations, AGMs, and client meetings.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Panorama Conference Suite',
    type: 'meeting_room',
    capacity: 20,
    amenities: ['Dual Ultra HD Screens', 'Full Room Audio Tracking', 'Podium', 'Breakout Area'],
    description: 'Expansive conference room overlooking the central square, ideal for department wide summits.',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Innovation Workshop Space',
    type: 'meeting_room',
    capacity: 24,
    amenities: ['Modular Pod Desks', '4 Whiteboard Dividers', 'Wireless Screen Casting', 'Microphone System'],
    description: 'Reconfigurable classroom and workshop suite for internal training, hackathons, and certifications.',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Multi-Purpose Training Hall',
    type: 'meeting_room',
    capacity: 32,
    amenities: ['Dual 100" Projectors', 'Wireless Handheld Mics', 'Classroom Tables', 'Stage Lighting'],
    description: 'Tiered acoustic room structured for company bootcamps, workshops, and guest speaker lectures.',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Townhall Forum',
    type: 'meeting_room',
    capacity: 50,
    amenities: ['Live Stream Broadcast Rig', 'PA Sound System', 'Stage & Podium', 'Professional Lighting Rig'],
    description: 'Main auditorium for all-hands company meetings, keynote announcements, and industry meetups.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Penthouse Meeting Loft',
    type: 'meeting_room',
    capacity: 15,
    amenities: ['Sky Terrace Access', 'Lounge Seating', '75" OLED Display', 'Espresso Machine'],
    description: 'Top-floor sunlit executive lounge combining comfortable relaxed seating with full AV capabilities.',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
  },

  // --- SPECIALTY STUDIOS & MEDIA SUITES (47 to 50) ---
  {
    name: 'Podcast Recording Studio',
    type: 'meeting_room',
    capacity: 4,
    amenities: ['4x Shure SM7B Mics', 'Rodecaster Pro II', 'Acoustic Sound Isolation', 'Broadcast Headphones'],
    description: 'Broadcast-ready soundproof podcast studio with professional microphones and multitrack recording.',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Media & Video Broadcast Lab',
    type: 'meeting_room',
    capacity: 6,
    amenities: ['4K Cinema Camera Rig', 'Green Screen Wall', 'Aputure Softbox Lights', 'Teleprompter'],
    description: 'Dedicated video production studio for founder interviews, product demos, and webinar streaming.',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Creative Content Studio',
    type: 'meeting_room',
    capacity: 6,
    amenities: ['RGB Studio Lighting', 'Product Photo Backdrop', 'High-Speed Mac Studio', 'Sound Absorption'],
    description: 'Multi-backdrop creative space with studio strobes, continuous lighting, and tethered capture.',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Usability & Research Lab',
    type: 'meeting_room',
    capacity: 5,
    amenities: ['Eye-Tracking Rig', 'One-Way Mirror Partition', 'Screen Recording Suite', 'Participant Lounge'],
    description: 'Specialized lab designed for user research interviews, UX testing, and customer discovery.',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
  },
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
    const { rows } = await query('SELECT COUNT(*)::int AS total FROM spaces');
    if (rows[0].total >= 40) {
      console.log('database already has full data, skipping seed');
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
      'INSERT INTO spaces (name, type, capacity, amenities, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [space.name, space.type, space.capacity, space.amenities, space.description, space.imageUrl || ''],
    );
    spaceIds[space.name] = rows[0].id;
  }

  // A set of realistic live bookings across today and upcoming days
  const bookings = [
    { space: 'Meeting Room Atlas', email: 'member@cowork.test', start: daysFromNow(1, 10), end: daysFromNow(1, 12), status: 'approved' },
    { space: 'Huddle Room Zen', email: 'tom@cowork.test', start: daysFromNow(1, 14), end: daysFromNow(1, 16), status: 'pending' },
    { space: 'Hot Desk Alpha-1', email: 'sarah.j@example.com', start: daysFromNow(0, 9), end: daysFromNow(0, 17), status: 'approved' },
    { space: 'Standing Desk Ergo-1', email: 'marcus.c@example.com', start: daysFromNow(2, 9), end: daysFromNow(2, 13), status: 'approved' },
    { space: 'Podcast Recording Studio', email: 'member@cowork.test', start: daysFromNow(2, 14), end: daysFromNow(2, 16), status: 'approved' },
    { space: 'Innovation Workshop Space', email: 'tom@cowork.test', start: daysFromNow(3, 10), end: daysFromNow(3, 15), status: 'pending' },
    { space: 'Meeting Room Timber', email: 'sarah.j@example.com', start: daysFromNow(1, 11), end: daysFromNow(1, 13), status: 'pending' },
    { space: 'Acoustic Focus Pod F1', email: 'marcus.c@example.com', start: daysFromNow(0, 15), end: daysFromNow(0, 16), status: 'approved' },
  ];

  for (const booking of bookings) {
    if (!spaceIds[booking.space] || !userIds[booking.email]) continue;
    await query(
      'INSERT INTO bookings (space_id, user_id, starts_at, ends_at, status) VALUES ($1, $2, $3, $4, $5)',
      [spaceIds[booking.space], userIds[booking.email], booking.start, booking.end, booking.status],
    );
  }

  const maintenanceWindows = [
    { space: 'Multi-Purpose Training Hall', start: daysFromNow(4, 8), end: daysFromNow(4, 18), reason: 'Audio-visual system upgrade and calibration' },
    { space: 'Standing Desk Ergo-2', start: daysFromNow(5, 9), end: daysFromNow(5, 12), reason: 'Motorized desk calibration' },
  ];

  for (const mw of maintenanceWindows) {
    if (!spaceIds[mw.space]) continue;
    await query(
      'INSERT INTO maintenance_windows (space_id, starts_at, ends_at, reason) VALUES ($1, $2, $3, $4)',
      [spaceIds[mw.space], mw.start, mw.end, mw.reason],
    );
  }

  console.log(`seeded ${USERS.length} users, ${SPACES.length} spaces, ${bookings.length} bookings, ${maintenanceWindows.length} maintenance windows`);
  console.log('admin login:  admin@cowork.test / admin1234');
  console.log('member login: member@cowork.test / member1234');
}

seed()
  .then(() => pool.end())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
