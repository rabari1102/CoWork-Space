/**
 * Notification stub. A real deployment would hand this off to an email
 * provider; here it writes the message that would have been sent so the status
 * change is visible in the server log.
 */
export function sendBookingStatusEmail({ to, name, booking, spaceName }) {
  const subject = `Your booking for ${spaceName} is ${booking.status}`;
  const body = [
    `Hi ${name},`,
    '',
    `Booking #${booking.id} for ${spaceName} on ${booking.startsAt} - ${booking.endsAt}`,
    `is now ${booking.status}.`,
    '',
    'Co-working Space Booking',
  ].join('\n');

  console.log(`[email] to=${to} subject="${subject}"\n${body}\n`);
}
