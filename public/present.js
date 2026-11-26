const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
}

export function formatDisplayDate(iso) {
  if (!iso || typeof iso !== 'string') return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return '';
  const month = MONTHS[Number(match[2]) - 1];
  const day = Number(match[3]);
  if (!month || day < 1 || day > 31) return '';
  return `${day} ${month} ${match[1]}`;
}

export function hoursClarifiedLabel(iso) {
  const pretty = formatDisplayDate(iso);
  return pretty ? `Hours clarified ${pretty}` : '';
}

export function reviewMeta(c) {
  const date = formatDisplayDate(c.source_checked_on);
  const hours = hoursClarifiedLabel(c.hours_updated_on);
  const base = date ? `Website reviewed ${date}` : 'Website reviewed';
  return hours ? `${base} · ${hours}` : base;
}

export function formatPhone(phone) {
  const digits = String(phone ?? '');
  if (digits.startsWith('1300')) return digits.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
}

export function schemaTelephone(phone) {
  const digits = String(phone ?? '');
  if (/^0\d{9}$/.test(digits)) return `+61${digits.slice(1)}`;
  if (/^1300\d{6}$/.test(digits)) return `+61${digits}`;
  return '';
}

export function formatAddress(c) {
  const postcode = c.postcode ? ` ${c.postcode}` : '';
  return `${c.address}, ${c.suburb} VIC${postcode}`;
}

export function serviceLabel(c) {
  if (c.service_type === 'hospital_24h') return 'Published 24-hour hospital';
  if (String(c.service_type).includes('on_call')) return 'After-hours & on-call';
  if (String(c.service_type).includes('rotating')) return 'Call-first service';
  return 'After-hours service';
}

export function publicNote(c) {
  if (c.id === 'ballarat-pet-farm') return 'Call and press 1 for the treatment location. After midnight, callers are directed to Geelong or Melbourne.';
  if (c.id === 'central-bendigo') return 'No on-call service on Sunday nights due to staffing shortages. You may be referred to a Melbourne clinic. Call to arrange on-call care.';
  return '';
}

export function hoursHtml(c) {
  if (c.hours_lines?.length) return `<ul class="hours">${c.hours_lines.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`;
  const text = c.public_hours || c.published_hours_summary;
  return text ? `<p class="hours">${escapeHtml(text)}</p>` : '';
}
