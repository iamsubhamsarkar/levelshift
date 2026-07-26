/**
 * LevelShift — Date Utilities
 */

/**
 * Get today's date as YYYY-MM-DD string.
 */
export function today() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Add days to a date string.
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days
 * @returns {string} YYYY-MM-DD
 */
export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Calculate days between two date strings.
 * @param {string} from - YYYY-MM-DD
 * @param {string} to - YYYY-MM-DD
 * @returns {number} - positive if 'to' is after 'from'
 */
export function daysBetween(from, to) {
  const a = new Date(from);
  const b = new Date(to);
  const diff = b.getTime() - a.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format a date string for display.
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string} e.g., "Aug 28"
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a date string with year.
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string} e.g., "Aug 28, 2026"
 */
export function formatDateFull(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Check if a date string is today.
 */
export function isToday(dateStr) {
  return dateStr === today();
}

/**
 * Check if a date string is a weekend (Saturday or Sunday).
 */
export function isWeekend(dateStr) {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
}

/**
 * Get the last N dates as an array of YYYY-MM-DD strings.
 * @param {number} n
 * @returns {string[]}
 */
export function getLastNDays(n) {
  const dates = [];
  const now = today();
  for (let i = n - 1; i >= 0; i--) {
    dates.push(addDays(now, -i));
  }
  return dates;
}

/**
 * Get the day of the week (0=Sun, 6=Sat).
 */
export function getDayOfWeek(dateStr) {
  return new Date(dateStr).getDay();
}
