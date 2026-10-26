import { SCAN_HOURS_PACIFIC, TIMEZONE } from '../config/settings.js';

// Cloudflare cron runs hourly in UTC; we act only when it's a scan hour in
// Pacific time, so daylight-saving changes are handled automatically.
export function pacificHour(date) {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, hour: 'numeric', hourCycle: 'h23' }).format(date));
}

export function isScanSlot(date) {
  return SCAN_HOURS_PACIFIC.includes(pacificHour(date));
}

export function nextScanTime(now = new Date()) {
  const t = new Date(now);
  t.setUTCMinutes(0, 0, 0);
  for (let i = 0; i < 48; i++) {
    t.setUTCHours(t.getUTCHours() + 1);
    if (isScanSlot(t)) return t.toISOString();
  }
  return null;
}
