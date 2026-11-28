const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const GIPPSLAND_HOURS = 'Open continuously from Friday 6 pm to Monday 8 am, plus public holidays.';

export function openingHoursFor(clinic) {
  const type = String(clinic.service_type || '');
  // On-call, rotating and limited services have no schema opening hours unless a record
  // has an explicit schedule encoded below. "24/7 on call" is not a staffed opening day.
  if (type.includes('on_call') || type.includes('rotating') || type.includes('limited') || type === 'on_call' || type === 'rotating') return {};
  const text = `${clinic.public_hours || ''} ${clinic.published_hours_summary || ''}`;
  if (clinic.service_type === 'hospital_24h' && /24\s*hours|24\/7/i.test(text)) {
    return {
      openingHours: 'Mo-Su 00:00-23:59',
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: WEEKDAYS,
        opens: '00:00',
        closes: '23:59',
      }],
    };
  }
  const published = clinic.public_hours || clinic.published_hours_summary || '';
  if (clinic.id === 'gippsland-warragul' && published === GIPPSLAND_HOURS) {
    return {
      openingHours: 'Fr 18:00-23:59, Sa-Su 00:00-23:59, Mo 00:00-08:00',
      openingHoursSpecification: [
        {'@type': 'OpeningHoursSpecification', dayOfWeek: 'Friday', opens: '18:00', closes: '23:59'},
        {'@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: '00:00', closes: '23:59'},
        {'@type': 'OpeningHoursSpecification', dayOfWeek: 'Monday', opens: '00:00', closes: '08:00'},
      ],
    };
  }
  return {};
}

/**
 * Wall-clock parts in an IANA timezone. Returns null if the timezone is missing or invalid.
 * Australia/Brisbane does not observe daylight saving, so it stays on AEST (UTC+10) while
 * Australia/Sydney and Australia/Melbourne are on AEDT (UTC+11).
 * Australia/Perth does not observe daylight saving either, so it stays on AWST (UTC+8):
 * three hours behind Melbourne during AEDT, and two hours behind Brisbane.
 */
export function zonedDateTime(timeZone, date = new Date()) {
  if (!timeZone || typeof timeZone !== 'string') return null;
  let parts;
  try {
    parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date).map(part => [part.type, part.value]));
  } catch {
    return null;
  }
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  const minute = Number(parts.minute);
  const weekday = String(parts.weekday || '').replace(/[^A-Za-z]/g, '').slice(0, 3);
  if (!weekday || Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return {weekday, minutes: hour * 60 + minute};
}

function toMinutes(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(value || '');
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Scheduled-open check against reviewed structured hours, in the clinic's own timezone.
 * Returns null when the record disables the calculation, the timezone is unusable, or the
 * published text has no structured schedule. This is not live availability.
 * Static pages do not call this: a build-time clock would freeze the answer.
 */
export function scheduledOpenStatus(clinic, date = new Date()) {
  if (!clinic || clinic.automated_open_now_enabled !== true) return null;
  const spec = openingHoursFor(clinic).openingHoursSpecification;
  if (!spec) return null;
  const local = zonedDateTime(clinic.timezone, date);
  if (!local) return null;
  return spec.some(item => {
    const days = Array.isArray(item.dayOfWeek) ? item.dayOfWeek : [item.dayOfWeek];
    if (!days.some(day => String(day).startsWith(local.weekday))) return false;
    const start = toMinutes(item.opens);
    const end = toMinutes(item.closes);
    if (start === null || end === null) return false;
    return local.minutes >= start && local.minutes <= end;
  });
}
