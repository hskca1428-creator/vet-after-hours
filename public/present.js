const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export const CLIENTS_ONLY_LABEL = 'Existing clients only';

const SERVICE_LABELS = {
  hospital_24h: 'Published 24-hour hospital',
  after_hours: 'After-hours service',
  after_hours_on_call: 'After-hours & on-call',
  after_hours_rotating: 'Call-first service',
  after_hours_limited: 'Limited after-hours service',
};

const PUBLIC_NOTES = {
  'ballarat-pet-farm': 'Call and press 1 for the treatment location. After midnight, callers are directed to Geelong or Melbourne.',
  'central-bendigo': 'No on-call service on Sunday nights due to staffing shortages. You may be referred to a Melbourne clinic. Call to arrange on-call care.',
  'family-vet-centre-wodonga': 'After 10pm, urgent cases are directed to Lake Road Veterinary Clinic in Wagga Wagga, NSW.',
  'traralgon-veterinary-centre': 'The clinic says it may refer you to another emergency centre when it is at capacity. That centre is not named on the page.',
  'moe-veterinary-centre': 'No separate after-hours number is published. Call the clinic.',
  'gvg-after-hours-pathway': 'Call the nearest GVG clinic and press 1 for pets or 2 for livestock or equine. Companion-animal after-hours runs from Leongatha and/or Wonthaggi. New or inactive companion-animal clients may be charged a telehealth fee. Active clients are not charged for the initial phone consultation. Clinics are not staffed on site 24/7.',
  'murray-river-animal-hospital-wodonga': 'Local vets are on call until 10pm, on a roster shared with Fur Life Albury. After 10pm the page does not name a Victorian 24-hour hospital. Do not arrive after hours without calling.',
  'eastwood-mainst-bairnsdale-pathway': 'Shared roster with Main Street Veterinary Clinic. Confirm which clinic is on duty. Main Street publishes a separate out-of-hours number, (03) 5152 6666.',
};

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
  if (digits.startsWith('1300') || digits.startsWith('1800')) return digits.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
}

export function schemaTelephone(phone) {
  const digits = String(phone ?? '');
  if (/^0\d{9}$/.test(digits)) return `+61${digits.slice(1)}`;
  if (/^1[38]00\d{6}$/.test(digits)) return `+61${digits}`;
  return '';
}

export function formatAddress(c) {
  const postcode = c.postcode ? ` ${c.postcode}` : '';
  return `${c.address}, ${c.suburb} VIC${postcode}`;
}

export function serviceLabel(c) {
  if (SERVICE_LABELS[c.service_type]) return SERVICE_LABELS[c.service_type];
  const type = String(c.service_type || '');
  if (type.includes('on_call') || type === 'on_call') return SERVICE_LABELS.after_hours_on_call;
  if (type.includes('rotating') || type === 'rotating') return SERVICE_LABELS.after_hours_rotating;
  if (type.includes('limited')) return SERVICE_LABELS.after_hours_limited;
  if (type.includes('24')) return SERVICE_LABELS.hospital_24h;
  return SERVICE_LABELS.after_hours;
}

export function clientsOnlyLabel(c) {
  return c.existing_clients_only === true ? CLIENTS_ONLY_LABEL : '';
}

export function badgeHtml(c) {
  const reviewed = c.verification_status === 'website_checked';
  const type = reviewed ? serviceLabel(c) : 'Call to confirm';
  const service = `<span class="badge${reviewed ? '' : ' review'}">${escapeHtml(type)}</span>`;
  const clients = clientsOnlyLabel(c);
  const extra = clients ? `<span class="badge clients-only">${escapeHtml(clients)}</span>` : '';
  return `<span class="badge-row">${service}${extra}</span>`;
}

export function publicNote(c) {
  return PUBLIC_NOTES[c.id] || '';
}

export function hoursHtml(c) {
  if (c.hours_lines?.length) return `<ul class="hours">${c.hours_lines.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>`;
  const text = c.public_hours || c.published_hours_summary;
  return text ? `<p class="hours">${escapeHtml(text)}</p>` : '';
}
