// Georgia uses a fixed UTC+4 offset with no daylight saving time.
export const TBILISI_UTC_OFFSET_MS = 4 * 60 * 60 * 1000;

const DAY_MS = 24 * 60 * 60 * 1000;

export function nowUtcIso(): string {
  return new Date().toISOString();
}

/** 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM' in Tbilisi local time -> UTC ISO string. */
export function tbilisiLocalToUtcIso(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/.exec(local.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = m[4] ? Number(m[4]) : 0;
  const minute = m[5] ? Number(m[5]) : 0;
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    return null;
  }
  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - TBILISI_UTC_OFFSET_MS;
  if (Number.isNaN(utcMs)) return null;
  return new Date(utcMs).toISOString();
}

/** UTC ISO bounds [start, end) of a Tbilisi calendar day given as 'YYYY-MM-DD'. */
export function tbilisiDayRangeUtc(day: string): [string, string] | null {
  const start = tbilisiLocalToUtcIso(day);
  if (!start) return null;
  const end = new Date(Date.parse(start) + DAY_MS).toISOString();
  return [start, end];
}

/** UTC ISO -> value for <input type="datetime-local"> in Tbilisi time. */
export function utcIsoToDatetimeLocal(iso: string): string {
  return new Date(Date.parse(iso) + TBILISI_UTC_OFFSET_MS).toISOString().slice(0, 16);
}

/** Today's date in Tbilisi as 'YYYY-MM-DD', for <input type="date"> min/default. */
export function tbilisiTodayDateInput(): string {
  return new Date(Date.now() + TBILISI_UTC_OFFSET_MS).toISOString().slice(0, 10);
}

/** Min value for the new-trip datetime-local input: 30 minutes from now, Tbilisi time. */
export function datetimeLocalMinForNewTrip(): string {
  return new Date(Date.now() + TBILISI_UTC_OFFSET_MS + 30 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
}

const timeFmt = new Intl.DateTimeFormat("ka-GE", {
  timeZone: "Asia/Tbilisi",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dateFmt = new Intl.DateTimeFormat("ka-GE", {
  timeZone: "Asia/Tbilisi",
  day: "numeric",
  month: "long",
});
const dateYearFmt = new Intl.DateTimeFormat("ka-GE", {
  timeZone: "Asia/Tbilisi",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const weekdayFmt = new Intl.DateTimeFormat("ka-GE", {
  timeZone: "Asia/Tbilisi",
  weekday: "long",
});

export function formatTbilisiTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

export function formatTbilisiDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatTbilisiDateYear(iso: string): string {
  return dateYearFmt.format(new Date(iso));
}

export function formatTbilisiWeekday(iso: string): string {
  return weekdayFmt.format(new Date(iso));
}

export function formatTbilisiDateTime(iso: string): string {
  return `${formatTbilisiDate(iso)}, ${formatTbilisiTime(iso)}`;
}

function tbilisiDayKey(ms: number): string {
  return new Date(ms + TBILISI_UTC_OFFSET_MS).toISOString().slice(0, 10);
}

/** 'დღეს' / 'ხვალ' / '12 აგვისტო'. Server-side use only (reads the clock). */
export function departureDayLabel(iso: string): string {
  const target = tbilisiDayKey(Date.parse(iso));
  if (target === tbilisiDayKey(Date.now())) return "დღეს";
  if (target === tbilisiDayKey(Date.now() + DAY_MS)) return "ხვალ";
  return formatTbilisiDate(iso);
}

export function isPast(iso: string): boolean {
  return Date.parse(iso) <= Date.now();
}

export function formatPrice(gel: number): string {
  return `${Number.isInteger(gel) ? gel : gel.toFixed(2)}₾`;
}
