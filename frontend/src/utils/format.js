const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** API timestamps are wall-clock strings, so they are formatted, never re-parsed into a Date. */
export function formatDateTime(value) {
  if (!value) return '';
  const [date, time] = value.split('T');
  return `${formatDate(date)}, ${time.slice(0, 5)}`;
}

function formatDate(value) {
  const [year, month, day] = value.split('-');
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatTime(value) {
  return value ? value.split('T')[1].slice(0, 5) : '';
}

export function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const SPACE_TYPE_LABELS = {
  desk: 'Desk',
  meeting_room: 'Meeting room',
};

/** Minutes since midnight, used to place blocks on the availability timeline. */
export function minutesFromMidnight(timestamp) {
  const [hours, minutes] = timestamp.split('T')[1].split(':').map(Number);
  return hours * 60 + minutes;
}
