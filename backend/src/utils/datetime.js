export const LOCAL_DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses a "YYYY-MM-DDTHH:mm" wall-clock string. Returns null when the string
 * looks right but describes an impossible date such as 2026-02-31T10:00.
 */
export function parseLocalDateTime(value) {
  if (!LOCAL_DATE_TIME_PATTERN.test(value)) return null;

  const [datePart, timePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second = 0] = timePart.split(':').map(Number);

  const date = new Date(year, month - 1, day, hour, minute, second);
  const isRealDate =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute;

  return isRealDate ? date : null;
}

/** Turns whatever Postgres hands back for a TIMESTAMP into YYYY-MM-DDTHH:mm:ss. */
export function formatTimestamp(value) {
  if (!value) return null;
  return String(value).replace(' ', 'T').slice(0, 19);
}

/** Start and end of a calendar day, as wall-clock strings the DB can compare. */
export function dayBounds(date) {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(year, month - 1, day + 1);
  const pad = (n) => String(n).padStart(2, '0');
  const nextDate = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
  return { start: `${date}T00:00:00`, end: `${nextDate}T00:00:00` };
}

/** Wall-clock "now" as a YYYY-MM-DDTHH:mm:ss string. */
export function nowLocal() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  );
}
