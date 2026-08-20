import { config } from '../config/env.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('T')[0].split('-');
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

function formatTime(value) {
  if (!value) return '';
  const timePart = value.split('T')[1] || '';
  return timePart.slice(0, 5);
}

const STATUS_CONFIG = {
  approved: {
    title: 'Booking Confirmed!',
    badgeBg: '#ecfdf5',
    badgeText: '#065f46',
    badgeBorder: '#a7f3d0',
    headerIcon: '&#10003;', // Checkmark
    headerBg: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
    message: 'Great news! Your workspace reservation request has been approved by the management team.',
  },
  rejected: {
    title: 'Booking Request Update',
    badgeBg: '#fff1f2',
    badgeText: '#9f1239',
    badgeBorder: '#fecdd3',
    headerIcon: '&#10005;', // Cross
    headerBg: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    message: 'We were unable to approve your reservation request due to a scheduling conflict or operational requirements.',
  },
  cancelled: {
    title: 'Booking Cancelled',
    badgeBg: '#fffbeb',
    badgeText: '#92400e',
    badgeBorder: '#fde68a',
    headerIcon: '&#9888;', // Warning
    headerBg: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
    message: 'Your reservation has been successfully cancelled as requested.',
  },
  pending: {
    title: 'Booking Request Received',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    badgeBorder: '#fde68a',
    headerIcon: '&#8987;', // Hourglass
    headerBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    message: 'Your workspace reservation request is currently awaiting administrator review.',
  },
};

/**
 * Builds a responsive HTML email template for workspace booking status updates.
 */
export function buildBookingEmailHtml({ name, booking, spaceName }) {
  const status = (booking.status || 'pending').toLowerCase();
  const statusMeta = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const baseUrl = config.corsOrigin?.[0] || 'http://localhost:5173';
  const dashboardUrl = `${baseUrl}/dashboard`;

  const dateStr = formatDate(booking.startsAt);
  const startTimeStr = formatTime(booking.startsAt);
  const endTimeStr = formatTime(booking.endsAt);
  const spaceType = booking.spaceType === 'desk' ? 'Dedicated Desk' : 'Meeting Room';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusMeta.title} - CoworkDesk</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    table { border-collapse: collapse; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03); border: 1px solid #e2e8f0; }
    .header { background: ${statusMeta.headerBg}; padding: 36px 32px 30px; text-align: center; color: #ffffff; }
    .brand-logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; margin-bottom: 20px; display: inline-flex; align-items: center; }
    .brand-accent { color: #5eead4; }
    .content { padding: 32px 32px; }
    .greeting { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .message { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 28px; }
    .card-row { margin-bottom: 12px; }
    .card-row:last-child { margin-bottom: 0; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 4px; }
    .value { font-size: 15px; font-weight: 600; color: #0f172a; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: ${statusMeta.badgeBg}; color: ${statusMeta.badgeText}; border: 1px solid ${statusMeta.badgeBorder}; }
    .btn-container { text-align: center; margin: 32px 0 16px; }
    .btn { display: inline-block; background: #0d9488; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2); }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header with Branding -->
    <div class="header">
      <div class="brand-logo">
        <span>Cowork</span><span class="brand-accent">Desk</span>
      </div>
      <div style="font-size: 36px; line-height: 1; margin-bottom: 8px;">${statusMeta.headerIcon}</div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;">${statusMeta.title}</h1>
    </div>

    <!-- Main Content -->
    <div class="content">
      <h2 class="greeting">Hi ${name},</h2>
      <p class="message">${statusMeta.message}</p>

      <!-- Reservation Summary Box -->
      <div class="card">
        <table style="width: 100%;">
          <tr>
            <td style="padding-bottom: 16px; width: 50%;">
              <div class="label">Workspace</div>
              <div class="value">${spaceName}</div>
              <div style="font-size: 12px; color: #64748b;">${spaceType}</div>
            </td>
            <td style="padding-bottom: 16px; width: 50%;">
              <div class="label">Status</div>
              <span class="status-badge">${status}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 16px;">
              <div class="label">Date</div>
              <div class="value">${dateStr}</div>
            </td>
            <td style="padding-bottom: 16px;">
              <div class="label">Time Slot</div>
              <div class="value">${startTimeStr} – ${endTimeStr}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="border-top: 1px dashed #cbd5e1; padding-top: 12px;">
              <div class="label">Reservation Reference</div>
              <div style="font-size: 13px; font-family: monospace; font-weight: 700; color: #334155;">#CW-${String(booking.id).padStart(5, '0')}</div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Action Button -->
      <div class="btn-container">
        <a href="${dashboardUrl}" class="btn" target="_blank">View My Bookings</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 6px;">CoworkDesk &bull; Modern Co-working Workspace &bull; All rights reserved.</p>
      <p style="margin: 0;">This is an automated notification regarding your workspace booking.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Notification handler that formats and simulates email delivery.
 */
export function sendBookingStatusEmail({ to, name, booking, spaceName }) {
  const status = (booking.status || 'pending').toLowerCase();
  const subject = `[CoworkDesk] Your booking for ${spaceName} is ${status}`;
  const html = buildBookingEmailHtml({ name, booking, spaceName });

  const text = [
    `============================================================`,
    `COWORKDESK NOTIFICATION: ${status.toUpperCase()}`,
    `============================================================`,
    `Hi ${name},`,
    '',
    `Your workspace reservation for ${spaceName} (#CW-${String(booking.id).padStart(5, '0')}) is now ${status}.`,
    '',
    `Details:`,
    `  - Workspace : ${spaceName}`,
    `  - Date      : ${formatDate(booking.startsAt)}`,
    `  - Time Slot : ${formatTime(booking.startsAt)} - ${formatTime(booking.endsAt)}`,
    `  - Status    : ${status.toUpperCase()}`,
    '',
    `View your reservations at: ${config.corsOrigin?.[0] || 'http://localhost:5173'}/dashboard`,
    `============================================================`,
  ].join('\n');

  console.log(`\n📧 [EMAIL DISPATCHED TO: ${to}]`);
  console.log(`📌 Subject: "${subject}"`);
  console.log(text);
  console.log(`✨ [HTML Template Generated: ${html.length} bytes]\n`);

  return { to, subject, text, html };
}
