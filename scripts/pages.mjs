import {openingHoursFor} from '../public/hours.js';
import {directionsUrl, rankClinics} from '../public/search.js';
import {
  badgeHtml,
  escapeHtml,
  formatAddress,
  formatPhone,
  hoursHtml,
  publicNote,
  reviewMeta,
  schemaTelephone,
  serviceLabel,
} from '../public/present.js';

export {openingHoursFor};

export const SITE = 'https://www.vetafterhours.au';
/** Sitemap lastmod for information.html. The Victorian locality note on that page is still 15 September 2026. */
export const INFORMATION_LASTMOD = '2026-11-28';

export const AREA_REDIRECTS = [
  {source: '/areas/warragul', destination: '/areas/gippsland'},
  {source: '/vic', destination: '/states/vic'},
  {source: '/nsw', destination: '/states/nsw'},
  {source: '/qld', destination: '/states/qld'},
  {source: '/wa', destination: '/states/wa'},
  {source: '/sa', destination: '/states/sa'},
];

const HOME_TITLE = 'Vet After Hours — Find an after-hours vet in Victoria, Greater Sydney, South East Queensland, Greater Perth and Greater Adelaide';
const HOME_DESCRIPTION = 'Find after-hours veterinary services in Victoria, Greater Sydney, South East Queensland (Brisbane, Gold Coast, Sunshine Coast), Greater Perth and Greater Adelaide. Search your suburb, check published details and call a clinic. Free to use. Other states are not covered yet.';
const CALLOUT = '<div class="callout"><span class="info-icon" aria-hidden="true">i</span><p><strong>Please call before travelling.</strong> Published hours don’t guarantee a clinic can accept your pet. Confirm availability and the treatment location directly.</p></div>';
const STATE_NAME = {VIC: 'Victoria', NSW: 'New South Wales', QLD: 'Queensland', WA: 'Western Australia', SA: 'South Australia'};

const VIC_AREAS = [
  {id: 'melbourne', state: 'VIC', region: 'Melbourne', path: '/areas/melbourne', file: 'areas/melbourne.html', nav: 'Melbourne', title: 'Emergency vets in Melbourne — Vet After Hours', h1: 'After-hours vets in Melbourne', description: describeArea, intro: melbourneIntro},
  {id: 'mornington-peninsula', state: 'VIC', region: 'Mornington Peninsula', path: '/areas/mornington-peninsula', file: 'areas/mornington-peninsula.html', nav: 'Mornington Peninsula', title: 'Emergency vet in Mornington — Vet After Hours', h1: 'After-hours vet in Mornington', description: describeArea, intro: morningtonIntro},
  {id: 'yarra-valley', state: 'VIC', region: 'Yarra Valley / Outer East', path: '/areas/yarra-valley', file: 'areas/yarra-valley.html', nav: 'Yarra Valley', title: 'After-hours vets in the Yarra Valley — Vet After Hours', h1: 'After-hours vets in the Yarra Valley', description: describeArea, intro: yarraIntro},
  {id: 'geelong', state: 'VIC', region: 'Geelong & Surf Coast', path: '/areas/geelong', file: 'areas/geelong.html', nav: 'Geelong', title: 'Emergency vets in Geelong — Vet After Hours', h1: 'After-hours vets in Geelong', description: describeArea, intro: geelongIntro},
  {id: 'colac', state: 'VIC', region: 'Colac', path: '/areas/colac', file: 'areas/colac.html', nav: 'Colac', title: 'After-hours vets in Colac — Vet After Hours', h1: 'After-hours vets in Colac', description: describeArea, intro: colacIntro},
  {id: 'ballarat', state: 'VIC', region: 'Ballarat', path: '/areas/ballarat', file: 'areas/ballarat.html', nav: 'Ballarat', title: 'After-hours vet in Ballarat — Vet After Hours', h1: 'After-hours vet in Ballarat', description: describeArea, intro: ballaratIntro},
  {id: 'bendigo', state: 'VIC', region: 'Bendigo & Central', path: '/areas/bendigo', file: 'areas/bendigo.html', nav: 'Bendigo', title: 'After-hours vets in Bendigo and central Victoria — Vet After Hours', h1: 'After-hours vets in Bendigo and central Victoria', description: describeArea, intro: bendigoIntro},
  {id: 'hume', state: 'VIC', region: 'Hume / North East', path: '/areas/hume', file: 'areas/hume.html', nav: 'Hume & North East', title: 'After-hours vets in Hume and north-east Victoria — Vet After Hours', h1: 'After-hours vets in Hume and north-east Victoria', description: describeArea, intro: humeIntro},
  {id: 'loddon-mallee', state: 'VIC', region: 'Loddon Mallee / Murray', path: '/areas/loddon-mallee', file: 'areas/loddon-mallee.html', nav: 'Murray & Mallee', title: 'After-hours vets in the Murray and Mallee — Vet After Hours', h1: 'After-hours vets in the Murray and Mallee', description: describeArea, intro: loddonIntro},
  {id: 'wimmera', state: 'VIC', region: 'Wimmera & South West', path: '/areas/wimmera', file: 'areas/wimmera.html', nav: 'Wimmera & South West', title: 'After-hours vets in the Wimmera and south-west — Vet After Hours', h1: 'After-hours vets in the Wimmera and south-west', description: describeArea, intro: wimmeraIntro},
  {id: 'gippsland', state: 'VIC', region: 'Gippsland', path: '/areas/gippsland', file: 'areas/gippsland.html', nav: 'Gippsland', title: 'After-hours vets in Gippsland — Vet After Hours', h1: 'After-hours vets in Gippsland', description: describeArea, intro: gippslandIntro},
];

/** Region strings from the Greater Sydney clinic records, in browse order. Slugs come from these names. */
const NSW_REGIONS = [
  'Inner Sydney & Eastern Suburbs',
  'Inner West',
  'North Shore & Northern Beaches',
  'Hills & North West',
  'Western Sydney',
  'South West Sydney',
  'St George & Sutherland',
  'Central Coast',
  'Blue Mountains',
];

/** Region strings from the South East Queensland clinic records, in browse order. Slugs come from these names. */
const QLD_REGIONS = [
  'Brisbane North & Moreton Bay',
  'Brisbane South, Logan & Redlands',
  'Brisbane West & Ipswich',
  'Gold Coast',
  'Sunshine Coast',
];

/** Region strings from the Greater Perth clinic records, in browse order. Slugs come from these names. */
const WA_REGIONS = [
  'Perth North & Joondalup',
  'Perth Inner & North-Central',
  'Perth South & Fremantle',
  'Perth South East & Hills',
  'Perth North East & Swan',
  'Rockingham & Kwinana',
  'Peel & Mandurah',
];

/** Region strings from the Greater Adelaide clinic records, in browse order. Slugs come from these names. */
const SA_REGIONS = [
  'Adelaide Central & East',
  'Adelaide West',
  'Adelaide South',
  'Adelaide Hills',
];

const STATES = [
  {id: 'vic', code: 'VIC', path: '/states/vic', file: 'states/vic.html', nav: 'Victoria', title: 'After-hours vets in Victoria — Vet After Hours', h1: 'After-hours vets in Victoria', intro: vicStateIntro},
  {id: 'nsw', code: 'NSW', path: '/states/nsw', file: 'states/nsw.html', nav: 'Greater Sydney, NSW', title: 'After-hours vets in Greater Sydney, NSW — Vet After Hours', h1: 'After-hours vets in Greater Sydney, NSW', intro: nswStateIntro},
  {id: 'qld', code: 'QLD', path: '/states/qld', file: 'states/qld.html', nav: 'South East Queensland', title: 'After-hours vets in South East Queensland — Vet After Hours', h1: 'After-hours vets in South East Queensland', intro: qldStateIntro},
  {id: 'wa', code: 'WA', path: '/states/wa', file: 'states/wa.html', nav: 'Greater Perth, WA', title: 'After-hours vets in Greater Perth, WA — Vet After Hours', h1: 'After-hours vets in Greater Perth, WA', intro: waStateIntro},
  {id: 'sa', code: 'SA', path: '/states/sa', file: 'states/sa.html', nav: 'Greater Adelaide, SA', title: 'After-hours vets in Greater Adelaide, SA — Vet After Hours', h1: 'After-hours vets in Greater Adelaide, SA', intro: saStateIntro},
];

const TWENTY_FOUR = {
  path: '/24-hour-emergency-vets',
  file: '24-hour-emergency-vets.html',
  nav: '24-hour emergency vets',
  title: '24-hour emergency vets in Victoria, Greater Sydney, South East Queensland, Greater Perth and Greater Adelaide — Vet After Hours',
  h1: '24-hour emergency vets in Victoria, Greater Sydney, South East Queensland, Greater Perth and Greater Adelaide',
};

function areaSlug(region) {
  return region.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function regionAreaDefinitions(regions, stateCode, intro) {
  return regions.map(region => {
    const id = areaSlug(region);
    return {
      id,
      state: stateCode,
      region,
      path: `/areas/${id}`,
      file: `areas/${id}.html`,
      nav: region,
      title: `After-hours vets in ${region}, ${stateCode} — Vet After Hours`,
      h1: `After-hours vets in ${region}`,
      description: describeArea,
      intro,
    };
  });
}

function nswAreaDefinitions() {
  return regionAreaDefinitions(NSW_REGIONS, 'NSW', nswIntro);
}

function qldAreaDefinitions() {
  return regionAreaDefinitions(QLD_REGIONS, 'QLD', qldIntro);
}

function waAreaDefinitions() {
  return regionAreaDefinitions(WA_REGIONS, 'WA', waIntro);
}

function saAreaDefinitions() {
  return regionAreaDefinitions(SA_REGIONS, 'SA', saIntro);
}

function allAreaDefs() {
  const areas = [...VIC_AREAS, ...nswAreaDefinitions(), ...qldAreaDefinitions(), ...waAreaDefinitions(), ...saAreaDefinitions()];
  const ids = areas.map(area => area.id);
  if (new Set(ids).size !== ids.length) throw new Error(`Area slug collision: ${ids.join(', ')}`);
  return areas;
}

export function clinicLastmod(clinic) {
  const dates = [clinic.source_checked_on, clinic.hours_updated_on].filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d || ''));
  if (!dates.length) throw new Error(`No review date for ${clinic.id}`);
  return dates.sort().at(-1);
}

export function generateSite({clinics, indexHtml}) {
  if (!Array.isArray(clinics) || !clinics.length) throw new Error('No clinic records');
  for (const clinic of clinics) {
    if (typeof clinic.existing_clients_only !== 'boolean') throw new Error(`existing_clients_only missing on ${clinic.id}`);
    if (!clinic.region) throw new Error(`region missing on ${clinic.id}`);
    if (!clinic.state || !STATE_NAME[clinic.state]) throw new Error(`state missing on ${clinic.id}`);
    if (!clinic.timezone) throw new Error(`timezone missing on ${clinic.id}`);
    if (!clinic.locality_coordinates || typeof clinic.locality_coordinates.lat !== 'number' || typeof clinic.locality_coordinates.lon !== 'number') {
      throw new Error(`coordinates missing on ${clinic.id}`);
    }
  }
  const areas = allAreaDefs().map(area => {
    const list = sortClinics(clinics.filter(clinic => clinic.region === area.region && clinic.state === area.state));
    if (!list.length) throw new Error(`Area ${area.id} has no clinics`);
    return {...area, clinics: list, clinicIds: list.map(clinic => clinic.id)};
  });
  const assigned = areas.flatMap(area => area.clinicIds);
  if (new Set(assigned).size !== assigned.length) throw new Error('A clinic is listed in more than one area');
  const missing = clinics.filter(clinic => !assigned.includes(clinic.id)).map(clinic => clinic.id);
  if (missing.length) throw new Error(`Clinics missing an area page: ${missing.join(', ')}`);

  const states = STATES.map(state => {
    const list = sortClinics(clinics.filter(clinic => clinic.state === state.code));
    const stateAreas = areas.filter(area => area.state === state.code);
    if (!list.length || !stateAreas.length) throw new Error(`State ${state.id} has no clinics`);
    return {...state, clinics: list, areas: stateAreas};
  });

  const twentyFour = sortClinics(clinics.filter(clinic => clinic.service_type === 'hospital_24h'));
  const pages = [
    ...states.map(state => statePage(state)),
    ...areas.map(area => areaPage(area, areas)),
    twentyFourPage(twentyFour, areas),
    ...sortClinics(clinics).map(clinic => clinicPage(clinic, areas)),
  ];
  const entries = [
    {path: '/', lastmod: maxDate(clinics.map(clinicLastmod))},
    {path: '/information', lastmod: INFORMATION_LASTMOD},
    ...pages.map(page => ({path: page.path, lastmod: page.lastmod})),
  ];
  return {
    areas: areas.map(area => ({id: area.id, state: area.state, path: area.path, nav: area.nav, region: area.region, clinicIds: [...area.clinicIds]})),
    states: states.map(state => ({id: state.id, path: state.path, nav: state.nav})),
    pages,
    entries,
    indexHtml: prerenderHomepage(indexHtml, clinics, areas),
    notFoundHtml: notFoundPage(areas),
    sitemap: sitemapXml(entries),
  };
}

function nswIntro(list) {
  const places = escapeHtml(joinAnd([...new Set(list.map(c => c.suburb))]));
  const names = escapeHtml(joinAnd(list.map(c => `${c.name} in ${c.suburb}`)));
  const hospitals = list.filter(c => c.service_type === 'hospital_24h');
  const others = list.filter(c => c.service_type !== 'hospital_24h');
  const lead = `<p>Greater Sydney listings for this area: ${names}. ${list.length === 1 ? 'The suburb on this page is' : 'Suburbs on this page are'} ${places}.</p>`;
  if (hospitals.length && !others.length) {
    return `${lead}<p>${hospitals.length === 1 ? 'This clinic publishes' : 'These clinics publish'} round-the-clock emergency care. Call before travelling. This is not every clinic in the area, and other parts of New South Wales are not listed.</p>`;
  }
  if (!hospitals.length) {
    return `${lead}<p>${list.length === 1 ? 'This listing is' : 'These listings are'} not a published 24-hour hospital. Call before travelling and confirm where to go. Published 24-hour hospitals in Victoria, Greater Sydney, South East Queensland, Greater Perth and Greater Adelaide are on the <a href="${TWENTY_FOUR.path}">24-hour emergency vets</a> page.</p>`;
  }
  return `${lead}<p>${escapeHtml(joinAnd(hospitals.map(c => c.name)))} ${hospitals.length === 1 ? 'publishes' : 'publish'} round-the-clock emergency care. ${escapeHtml(joinAnd(others.map(c => c.name)))} ${others.length === 1 ? 'is listed' : 'are listed'} from published after-hours hours, not as a 24-hour hospital. Call before travelling.</p>`;
}

function qldIntro(list) {
  const places = escapeHtml(joinAnd([...new Set(list.map(c => c.suburb))]));
  const names = escapeHtml(joinAnd(list.map(c => `${c.name} in ${c.suburb}`)));
  const hospitals = list.filter(c => c.service_type === 'hospital_24h');
  const limited = list.filter(c => c.service_type === 'after_hours_limited');
  const others = list.filter(c => c.service_type !== 'hospital_24h' && c.service_type !== 'after_hours_limited');
  const lead = `<p>South East Queensland listings for this area: ${names}. ${list.length === 1 ? 'The suburb on this page is' : 'Suburbs on this page are'} ${places}.</p>`;
  const bits = [];
  if (hospitals.length && !others.length && !limited.length) {
    bits.push(`${hospitals.length === 1 ? 'This clinic publishes' : 'These clinics publish'} round-the-clock emergency care.`);
  } else {
    if (hospitals.length) bits.push(`${escapeHtml(joinAnd(hospitals.map(c => c.name)))} ${hospitals.length === 1 ? 'publishes' : 'publish'} round-the-clock emergency care.`);
    if (others.length) bits.push(`${escapeHtml(joinAnd(others.map(c => c.name)))} ${others.length === 1 ? 'is listed' : 'are listed'} from published after-hours hours, not as a 24-hour hospital.`);
    if (limited.length) bits.push(limited.length === 1
      ? `${escapeHtml(limited[0].name)} in ${escapeHtml(limited[0].suburb)} is walk-in urgent care with set evening and weekend hours. It is not overnight cover and it is not a 24-hour hospital.`
      : `${escapeHtml(joinAnd(limited.map(c => `${c.name} in ${c.suburb}`)))} are walk-in urgent care with set evening and weekend hours. They are not overnight cover and they are not 24-hour hospitals.`);
  }
  bits.push('Call before travelling. This is not every clinic in the area, and other parts of Queensland are not listed.');
  return `${lead}<p>${bits.join(' ')}</p>`;
}

function waIntro(list) {
  const places = escapeHtml(joinAnd([...new Set(list.map(c => c.suburb))]));
  const names = escapeHtml(joinAnd(list.map(c => `${c.name} in ${c.suburb}`)));
  const hospitals = list.filter(c => c.service_type === 'hospital_24h');
  const others = list.filter(c => c.service_type !== 'hospital_24h');
  const lead = `<p>Greater Perth listings for this area: ${names}. ${list.length === 1 ? 'The suburb on this page is' : 'Suburbs on this page are'} ${places}.</p>`;
  const bits = [];
  if (hospitals.length && !others.length) {
    bits.push(`${hospitals.length === 1 ? 'This clinic publishes' : 'These clinics publish'} round-the-clock emergency care.`);
  } else {
    if (hospitals.length) bits.push(`${escapeHtml(joinAnd(hospitals.map(c => c.name)))} ${hospitals.length === 1 ? 'publishes' : 'publish'} round-the-clock emergency care.`);
    if (others.length) bits.push(`${escapeHtml(joinAnd(others.map(c => c.name)))} ${others.length === 1 ? 'is listed' : 'are listed'} from published after-hours hours, not as a 24-hour hospital.`);
  }
  const baldivis = list.find(c => c.id === 'baldivis-emergency-vet');
  if (baldivis) bits.push(`${escapeHtml(baldivis.name)} publishes conflicting hours: the emergency page lists 6pm–8am, and the site also calls itself a 24-hour hospital. Call to confirm daytime cover.`);
  const midland = list.find(c => c.id === 'aec-midland');
  if (midland) bits.push(`${escapeHtml(midland.name)} is not confirmed overnight. The published hours widget ends at midnight.`);
  const osborne = list.find(c => c.id === 'aes-osborne-park');
  if (osborne) bits.push(`The ${escapeHtml(osborne.name)} page does not print a postcode. 6017 is inferred from the Osborne Park locality.`);
  bits.push('Call before travelling. This is not every clinic in the area, and other parts of Western Australia are not listed.');
  return `${lead}<p>${bits.join(' ')}</p>`;
}

function saIntro(list) {
  const places = escapeHtml(joinAnd([...new Set(list.map(c => c.suburb))]));
  const names = escapeHtml(joinAnd(list.map(c => `${c.name} in ${c.suburb}`)));
  const hospitals = list.filter(c => c.service_type === 'hospital_24h');
  const limited = list.filter(c => c.service_type === 'after_hours_limited');
  const others = list.filter(c => c.service_type !== 'hospital_24h' && c.service_type !== 'after_hours_limited');
  const lead = `<p>Greater Adelaide listings for this area: ${names}. ${list.length === 1 ? 'The suburb on this page is' : 'Suburbs on this page are'} ${places}.</p>`;
  const bits = [];
  if (hospitals.length && !others.length && !limited.length) {
    bits.push(`${hospitals.length === 1 ? 'This clinic publishes' : 'These clinics publish'} round-the-clock emergency care.`);
  } else {
    if (hospitals.length) bits.push(`${escapeHtml(joinAnd(hospitals.map(c => c.name)))} ${hospitals.length === 1 ? 'publishes' : 'publish'} round-the-clock emergency care.`);
    if (others.length) bits.push(`${escapeHtml(joinAnd(others.map(c => c.name)))} ${others.length === 1 ? 'is listed' : 'are listed'} from published after-hours hours, not as a 24-hour hospital.`);
    if (limited.length) bits.push(limited.length === 1
      ? `${escapeHtml(limited[0].name)} in ${escapeHtml(limited[0].suburb)} is a limited after-hours service. It is not overnight cover and it is not a 24-hour hospital.`
      : `${escapeHtml(joinAnd(limited.map(c => `${c.name} in ${c.suburb}`)))} are limited after-hours services. They are not overnight cover and they are not 24-hour hospitals.`);
  }
  const eva = list.find(c => c.id === 'emergency-vet-adelaide-plympton');
  if (eva) bits.push(`${escapeHtml(eva.name)} cannot treat rabbits on site.`);
  const pawprints = list.find(c => c.id === 'pawprints-afterhours-blackwood');
  if (pawprints) bits.push(`${escapeHtml(pawprints.name)} publishes round-the-clock care, and the website still shows a stale closure notice for the Blackwood Christmas Parade. Call to confirm there is no fixed closure.`);
  const walkIn = list.find(c => c.id === 'adelaide-vet-walk-in-clinic-prospect');
  if (walkIn) bits.push(`Public-holiday hours at ${escapeHtml(walkIn.name)} vary. The page lists 1pm–9pm and says to check the clinic profile.`);
  const barker = list.find(c => c.id === 'mount-barker-veterinary-clinic-emergency');
  if (barker) bits.push(`${escapeHtml(barker.name)} is for regular clients only.`);
  bits.push('Call before travelling. This is not every clinic in the area, and other parts of South Australia are not listed.');
  return `${lead}<p>${bits.join(' ')}</p>`;
}

function vicStateIntro(list, areas) {
  const links = areas.map(area => `<a href="${area.path}">${escapeHtml(area.nav)}</a>`).join(', ');
  return `<p>This page lists ${list.length} Victorian services in the directory, grouped into ${areas.length} areas: ${links}.</p><p>Regional towns are included where a clinic website describes an after-hours, on-call or 24-hour service. Not every Victorian town is covered. Greater Sydney is on the <a href="/states/nsw">New South Wales</a> page. South East Queensland is on the <a href="/states/qld">Queensland</a> page. Greater Perth is on the <a href="/states/wa">Western Australia</a> page. Greater Adelaide is on the <a href="/states/sa">South Australia</a> page.</p>`;
}

function nswStateIntro(list, areas) {
  const links = areas.map(area => `<a href="${area.path}">${escapeHtml(area.nav)}</a>`).join(', ');
  return `<p>This page lists ${list.length} Greater Sydney services in the directory, grouped into ${areas.length} areas: ${links}.</p><p>Coverage here is Greater Sydney, including the Central Coast and Blue Mountains clinics in this directory. It is not every New South Wales town, and it is not every Sydney suburb. Victoria is on the <a href="/states/vic">Victoria</a> page. South East Queensland is on the <a href="/states/qld">Queensland</a> page. Greater Perth is on the <a href="/states/wa">Western Australia</a> page. Greater Adelaide is on the <a href="/states/sa">South Australia</a> page.</p>`;
}

function qldStateIntro(list, areas) {
  const links = areas.map(area => `<a href="${area.path}">${escapeHtml(area.nav)}</a>`).join(', ');
  return `<p>This page lists ${list.length} South East Queensland services in the directory, grouped into ${areas.length} areas: ${links}.</p><p>Coverage here is Brisbane, the Gold Coast and the Sunshine Coast. It is not every Queensland town, and it is not every suburb in those areas. Victoria is on the <a href="/states/vic">Victoria</a> page. Greater Sydney is on the <a href="/states/nsw">New South Wales</a> page. Greater Perth is on the <a href="/states/wa">Western Australia</a> page. Greater Adelaide is on the <a href="/states/sa">South Australia</a> page.</p>`;
}

function waStateIntro(list, areas) {
  const links = areas.map(area => `<a href="${area.path}">${escapeHtml(area.nav)}</a>`).join(', ');
  return `<p>This page lists ${list.length} Greater Perth services in the directory, grouped into ${areas.length} areas: ${links}.</p><p>Coverage here is Greater Perth, including Peel and Mandurah. It is not every Western Australian town, and it is not every Perth suburb. Victoria is on the <a href="/states/vic">Victoria</a> page. Greater Sydney is on the <a href="/states/nsw">New South Wales</a> page. South East Queensland is on the <a href="/states/qld">Queensland</a> page. Greater Adelaide is on the <a href="/states/sa">South Australia</a> page.</p>`;
}

function saStateIntro(list, areas) {
  const links = areas.map(area => `<a href="${area.path}">${escapeHtml(area.nav)}</a>`).join(', ');
  return `<p>This page lists ${list.length} Greater Adelaide services in the directory, grouped into ${areas.length} areas: ${links}.</p><p>Coverage here is Greater Adelaide, including the Adelaide Hills and Mount Barker. It is not every South Australian town, and it is not every Adelaide suburb. Three limited after-hours services on this page are not overnight cover. Victoria is on the <a href="/states/vic">Victoria</a> page. Greater Sydney is on the <a href="/states/nsw">New South Wales</a> page. South East Queensland is on the <a href="/states/qld">Queensland</a> page. Greater Perth is on the <a href="/states/wa">Western Australia</a> page.</p>`;
}

function stateDescription(state, list) {
  if (state.code === 'NSW') return `${list.length} after-hours and 24-hour veterinary listings in Greater Sydney, New South Wales. Not every NSW town is covered. Call before travelling.`;
  if (state.code === 'QLD') return `${list.length} after-hours and 24-hour veterinary listings in South East Queensland (Brisbane, Gold Coast and Sunshine Coast). Not every Queensland town is covered. Call before travelling.`;
  if (state.code === 'WA') return `${list.length} after-hours and 24-hour veterinary listings in Greater Perth, Western Australia. Not every WA town is covered. Call before travelling.`;
  if (state.code === 'SA') return `${list.length} after-hours and 24-hour veterinary listings in Greater Adelaide, South Australia. Not every SA town is covered. Call before travelling.`;
  return `${list.length} after-hours and 24-hour veterinary listings in Victoria. Not every Victorian town is covered. Call before travelling.`;
}

function describeArea(list) {
  const places = joinAnd([...new Set(list.map(c => c.suburb))]);
  const noun = list.length === 1 ? 'service' : 'services';
  return `${this.h1}. ${list.length} listed ${noun} in ${places}. Call before travelling. This page is not a complete list of local clinics.`;
}

function melbourneIntro(list) {
  const moorabbin = list.find(c => c.id === 'aec-moorabbin');
  const grouped = list.filter(c => c.id === 'aec-frankston' || c.id === 'gvh-werribee');
  const sentences = [];
  if (moorabbin) sentences.push(`${escapeHtml(moorabbin.name)} is listed in ${escapeHtml(moorabbin.suburb)}, the suburb on its street address.`);
  if (grouped.length) sentences.push(`${escapeHtml(joinAnd(grouped.map(c => `${c.name} in ${c.suburb}`)))} ${grouped.length > 1 ? 'are' : 'is'} on this Melbourne page rather than a separate area page.`);
  sentences.push(`${escapeHtml('Peninsula Vet Emergency & Referral Hospital')} in Mornington is on the <a href="/areas/mornington-peninsula">Mornington Peninsula</a> page.`);
  sentences.push('This is not every emergency clinic in Melbourne. A suburb that is missing has not been surveyed for this directory.');
  return `<p>The Melbourne section of this directory has ${list.length} published 24-hour veterinary hospitals: ${escapeHtml(joinAnd(list.map(c => `${c.name} (${c.suburb})`)))}.</p><p>${sentences.join(' ')}</p>`;
}

function morningtonIntro(list) {
  const c = list[0];
  return `<p>${escapeHtml(c.name)} in ${escapeHtml(c.suburb)} publishes round-the-clock emergency care at ${escapeHtml(formatAddress(c))}. It is a 24-hour hospital. The phone number in this directory is ${escapeHtml(formatPhone(c.phone))}.</p><p>Animal Emergency Centre Frankston stays on the <a href="/areas/melbourne">Melbourne</a> page. This is not every clinic on the Mornington Peninsula.</p>`;
}

function yarraIntro(list) {
  const names = escapeHtml(joinAnd(list.map(c => `${c.name} in ${c.suburb}`)));
  return `<p>Yarra Valley and outer-east listings are ${names}. Both publish an on-call vet. They are not 24-hour hospitals. Call before travelling.</p>`;
}

function geelongIntro(list) {
  const bits = list.map(c => `${escapeHtml(c.name)} in ${escapeHtml(c.suburb)} (${escapeHtml(formatAddress(c))}, ${escapeHtml(formatPhone(c.phone))})`).join(' and ');
  return `<p>The Geelong listings are ${list.length} published 24-hour hospitals: ${bits}. They are different clinics. This page cannot tell you which one can accept a patient.</p><p>On-call clinics in Colac are on the <a href="/areas/colac">Colac</a> page. No separate Surf Coast after-hours hospital is listed.</p>`;
}

function colacIntro(list) {
  const names = escapeHtml(joinAnd(list.map(c => `${c.name} in ${c.suburb}`)));
  return `<p>This page lists ${list.length} on-call clinics: ${names}. They are not published 24-hour hospitals. Call before travelling and confirm where to go.</p><p>Published 24-hour hospitals for this part of Victoria are on the <a href="/areas/geelong">Geelong</a> page.</p>`;
}

function ballaratIntro(list) {
  const c = list[0];
  return `<p>The Ballarat listing is ${escapeHtml(c.name)} at ${escapeHtml(formatAddress(c))}. It is a call-first after-hours pathway, not a published 24-hour hospital. Published hours: ${escapeHtml(withPeriod(c.published_hours_summary))}</p><p>${escapeHtml(publicNote(c))} This record has no directions link, because the clinic asks you to confirm the treatment location on the phone. The Geelong and Melbourne pages list the published 24-hour hospitals those overnight calls are directed toward.</p>`;
}

function bendigoIntro(list) {
  const central = list.find(c => c.id === 'central-bendigo');
  const towns = escapeHtml(joinAnd([...new Set(list.map(c => c.suburb))]));
  return `<p>Bendigo and central Victorian listings on this page are in ${towns}. Central Veterinary Emergency is not a published 24-hour hospital. The other listings are separate on-call services.</p><p>${escapeHtml(central.name)} at ${escapeHtml(formatAddress(central))} uses ${escapeHtml(formatPhone(central.phone))}. ${escapeHtml(publicNote(central))} This record has no directions link, because the treatment location is confirmed when you call.</p>`;
}

function humeIntro(list) {
  const towns = escapeHtml(joinAnd([...new Set(list.map(c => c.suburb))]));
  return `<p>Hume and north-east listings are on-call services in ${towns}. None is a published 24-hour hospital. Call first and confirm where to go.</p><p>Family Vet Centre in Wodonga is listed for existing clients. Murray River Animal Hospital is on call until 10pm and shares that roster with Fur Life Albury.</p>`;
}

function loddonIntro(list) {
  const towns = escapeHtml(joinAnd([...new Set(list.map(c => c.suburb))]));
  return `<p>Murray and Mallee listings are in ${towns}. They are on-call or limited after-hours services, not published 24-hour hospitals.</p><p>Benetook Veterinary Clinic publishes weekend and public-holiday cover from 8:30am to 5pm only. It is not an overnight service.</p>`;
}

function wimmeraIntro(list) {
  const towns = escapeHtml(joinAnd([...new Set(list.map(c => c.suburb))]));
  return `<p>Wimmera and south-west listings are on-call services in ${towns}. They are not published 24-hour hospitals. Horsham Veterinary Hospital puts after-hours callers through to a triage service that can contact its on-call vets. The Vet Group publishes an on-call emergency team at Wollaston in Warrnambool and at Portland.</p>`;
}

function gippslandIntro(list) {
  const towns = escapeHtml(joinAnd([...new Set(list.map(c => c.suburb))]));
  const warragul = list.find(c => c.id === 'gippsland-warragul');
  return `<p>Gippsland listings in this directory are in ${towns}. Gippsland Pet Emergency in ${escapeHtml(warragul.suburb)} publishes hours from Friday 6 pm to Monday 8 am, plus public holidays. The other listings are on-call, rotating or existing-client services, not one 24-hour hospital for the region.</p><p>Traralgon Veterinary Centre and Moe Veterinary Centre are existing clients only. Gippsland Veterinary Group is available to new clients; a telehealth fee can apply for new or inactive companion-animal clients. This is not every Gippsland town.</p>`;
}

function prerenderHomepage(indexHtml, clinics, areas) {
  let html = indexHtml;
  const ordered = rankClinics(clinics, null);
  const results = `<div id="results" class="cards" aria-busy="false">\n${ordered.map(staticCard).join('\n')}\n</div>`;
  html = replaceOnce(html, '<div id="results" class="cards" aria-busy="true"></div>', results, 'homepage results marker');
  html = replaceOnce(
    html,
    '<p id="results-summary" role="status">Preparing clinic details…</p>',
    `<p id="results-summary" role="status">${ordered.length} listed services · Choose a suburb to sort by approximate distance</p>`,
    'homepage summary marker',
  );
  html = replaceOnce(html, 'Loading the directory…', '', 'homepage loading text');
  html = replaceOnce(html, '<div id="browse-slot"></div>', browseNav(areas), 'homepage browse slot');
  const jsonLd = jsonLdScript({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        name: 'Vet After Hours',
        url: `${SITE}/`,
        description: HOME_DESCRIPTION,
        inLanguage: 'en-AU',
        areaServed: coverageAreaServed(),
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE}/#directory`,
        name: 'After-hours veterinary directory for Victoria, Greater Sydney, South East Queensland, Greater Perth and Greater Adelaide',
        numberOfItems: ordered.length,
        itemListElement: ordered.map((clinic, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: clinic.name,
          url: canonicalUrl(`/clinics/${clinic.id}`),
        })),
      },
    ],
  });
  html = replaceOnce(html, '</head>', `${jsonLd}\n</head>`, 'homepage head');
  if (!html.includes(HOME_TITLE) || !html.includes(HOME_DESCRIPTION)) throw new Error('homepage title or description does not match the national copy');
  return html;
}

function statePage(state) {
  const lastmod = maxDate(state.clinics.map(clinicLastmod));
  const description = stateDescription(state, state.clinics);
  const areaLinks = `<ul class="related">${state.areas.map(area => `<li><a href="${area.path}">${escapeHtml(area.nav)}</a> <span>${area.clinics.length} listed</span></li>`).join('')}</ul>`;
  const body = `${crumbs([{href: '/', label: 'Directory'}, {label: state.nav}])}
<h1>${escapeHtml(state.h1)}</h1>
${state.intro(state.clinics, state.areas)}
${CALLOUT}
<h2>Areas</h2>
${areaLinks}
<h2>Listed services</h2>
<div class="cards">${state.clinics.map(staticCard).join('')}</div>
${relatedNav(state.areas, state.path)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl(state.path)}#webpage`,
        url: canonicalUrl(state.path),
        name: state.title,
        description,
        dateModified: lastmod,
        inLanguage: 'en-AU',
        isPartOf: {'@id': `${SITE}/#website`},
        areaServed: stateAreaServed(state.code),
        hasPart: state.areas.map(area => ({'@type': 'CollectionPage', name: area.nav, url: canonicalUrl(area.path)})),
        mainEntity: itemList(state.clinics, state.h1),
      },
      breadcrumbNode(state.path, [{href: '/', label: 'Directory'}, {label: state.nav}]),
    ],
  };
  return {
    path: state.path,
    file: state.file,
    lastmod,
    html: pageShell({title: state.title, description, path: state.path, lastmod, jsonLd, body}),
  };
}

function areaPage(area, areas) {
  const lastmod = maxDate(area.clinics.map(clinicLastmod));
  const description = area.description(area.clinics);
  const body = `${crumbs([{href: '/', label: 'Directory'}, {label: area.nav}])}
<h1>${escapeHtml(area.h1)}</h1>
${area.intro(area.clinics)}
${clientsOnlyBanner(area.clinics)}
${CALLOUT}
<h2>Listed services</h2>
<div class="cards">${area.clinics.map(staticCard).join('')}</div>
${relatedNav(areas, area.path)}`;
  return {
    path: area.path,
    file: area.file,
    lastmod,
    html: pageShell({title: area.title, description, path: area.path, lastmod, jsonLd: collectionJsonLd(area, description, lastmod), body}),
  };
}

function twentyFourPage(clinics, areas) {
  const lastmod = maxDate(clinics.map(clinicLastmod));
  const description = `${clinics.length} veterinary hospitals in this directory publish round-the-clock emergency care in Victoria, Greater Sydney, South East Queensland, Greater Perth or Greater Adelaide. Call before travelling. Published hours are not live availability, and this is not every hospital in Australia.`;
  const other = areas.filter(area => area.clinics.some(c => c.service_type !== 'hospital_24h'));
  const body = `${crumbs([{href: '/', label: 'Directory'}, {label: '24-hour emergency vets'}])}
<h1>${escapeHtml(TWENTY_FOUR.h1)}</h1>
<p>These ${clinics.length} records are the veterinary hospitals in the directory whose published service is round the clock, in Victoria, Greater Sydney, South East Queensland, Greater Perth and Greater Adelaide: ${escapeHtml(joinAnd(clinics.map(c => `${c.name} in ${c.suburb}`)))}. Each listing below uses the hours text stored for that clinic. Other states, and the rest of New South Wales, Queensland, Western Australia and South Australia, are not listed yet. Tasmania, the Australian Capital Territory and the Northern Territory are not listed.</p>
<p>Listings that are not published as 24-hour hospitals are on the ${joinAnd(other.map(area => `<a href="${area.path}">${escapeHtml(area.nav)}</a>`))} pages. A published 24-hour schedule is not confirmation the hospital can accept your pet.</p>
${CALLOUT}
<h2>Published 24-hour hospitals</h2>
<div class="cards">${clinics.map(staticCard).join('')}</div>
${relatedNav(areas, TWENTY_FOUR.path)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl(TWENTY_FOUR.path)}#webpage`,
        url: canonicalUrl(TWENTY_FOUR.path),
        name: TWENTY_FOUR.title,
        description,
        dateModified: lastmod,
        inLanguage: 'en-AU',
        isPartOf: {'@id': `${SITE}/#website`},
        areaServed: coverageAreaServed(),
        mainEntity: itemList(clinics, 'Published 24-hour veterinary hospitals in Victoria, Greater Sydney, South East Queensland, Greater Perth and Greater Adelaide'),
      },
      breadcrumbNode(TWENTY_FOUR.path, [{href: '/', label: 'Directory'}, {label: '24-hour emergency vets'}]),
    ],
  };
  return {
    path: TWENTY_FOUR.path,
    file: TWENTY_FOUR.file,
    lastmod,
    html: pageShell({title: TWENTY_FOUR.title, description, path: TWENTY_FOUR.path, lastmod, jsonLd, body}),
  };
}

function clinicPage(clinic, areas) {
  const area = areas.find(item => item.clinicIds.includes(clinic.id));
  const path = `/clinics/${clinic.id}`;
  const lastmod = clinicLastmod(clinic);
  const title = `${clinic.name} in ${clinic.suburb} | Vet After Hours`;
  const description = clinicDescription(clinic);
  const hours = openingHoursFor(clinic);
  const note = publicNote(clinic);
  const siblings = sortClinics(area.clinics.filter(item => item.id !== clinic.id));
  const directions = directionsUrl(clinic);
  const phone = formatPhone(clinic.phone);
  const source = `<a href="${escapeHtml(clinic.source_url)}" target="_blank" rel="noopener noreferrer">View the published clinic source</a>`;
  const directionsBlock = directions
    ? `<a class="button secondary" href="${escapeHtml(directions)}" target="_blank" rel="noopener noreferrer">Get directions</a>`
    : '<p>This listing does not include a directions link. Confirm where to go when you call.</p>';
  const siblingBlock = siblings.length
    ? `<ul class="related">${siblings.map(item => `<li><a href="/clinics/${escapeHtml(item.id)}">${escapeHtml(item.name)}</a> <span>in ${escapeHtml(item.suburb)}</span></li>`).join('')}</ul>`
    : `<p>This is the only ${escapeHtml(area.nav)} listing in the directory. <a href="${area.path}">Back to ${escapeHtml(area.nav)}</a>.</p>`;
  const roundTheClock = clinic.service_type === 'hospital_24h';
  const state = STATES.find(item => item.code === area.state);
  const body = `${crumbs([{href: '/', label: 'Directory'}, {href: state.path, label: state.nav}, {href: area.path, label: area.nav}, {label: clinic.name}])}
<p>${badgeHtml(clinic)}</p>
<h1>${escapeHtml(clinic.name)}</h1>
<p class="lede">${escapeHtml(clinicLede(clinic))}</p>
${CALLOUT}
<h2>Contact</h2>
<p class="address">${escapeHtml(formatAddress(clinic))}</p>
<div class="card-actions"><a class="button primary" href="tel:${escapeHtml(clinic.phone)}">Call ${escapeHtml(phone)}</a>${directions ? directionsBlock : ''}</div>
${directions ? '' : directionsBlock}
<h2>Published hours</h2>
${hoursHtml(clinic)}
${note ? `<p class="notice">${escapeHtml(note)}</p>` : ''}
<p>${escapeHtml(reviewMeta(clinic))}. These details come from the clinic’s published website. A website review is not a call to the clinic and it does not show whether they can accept a patient. ${source}.</p>
<p><a href="${escapeHtml(reportHref(clinic))}">Report an issue with this listing</a></p>
<h2>More in this directory</h2>
<p><a href="${area.path}">${escapeHtml(area.nav)} listings</a> · <a href="${state.path}">${escapeHtml(state.nav)}</a></p>
${siblingBlock}
<p>${roundTheClock ? 'This hospital is on the ' : 'This service is not published as a 24-hour hospital. See the '}<a href="${TWENTY_FOUR.path}">24-hour emergency vets</a> page, which lists published round-the-clock hospitals in Victoria, Greater Sydney, South East Queensland, Greater Perth and Greater Adelaide.</p>`;
  const entity = {
    '@type': 'VeterinaryCare',
    '@id': `${canonicalUrl(path)}#clinic`,
    name: clinic.name,
    url: clinic.source_url,
    telephone: schemaTelephone(clinic.phone),
    address: postalAddress(clinic),
    areaServed: {
      '@type': 'City',
      name: clinic.suburb,
      containedInPlace: {'@type': 'State', name: STATE_NAME[clinic.state] || clinic.state},
    },
    ...hours,
  };
  if (!entity.telephone) delete entity.telephone;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl(path)}#webpage`,
        url: canonicalUrl(path),
        name: title,
        description,
        dateModified: lastmod,
        inLanguage: 'en-AU',
        isPartOf: {'@id': `${SITE}/#website`},
        about: {'@id': entity['@id']},
      },
      entity,
      breadcrumbNode(path, [{href: '/', label: 'Directory'}, {href: state.path, label: state.nav}, {href: area.path, label: area.nav}, {label: clinic.name}]),
    ],
  };
  return {path, file: `clinics/${clinic.id}.html`, lastmod, html: pageShell({title, description, path, lastmod, jsonLd, body})};
}

function notFoundPage(areas) {
  const body = `<h1>Page not found</h1>
<p class="lede">That address isn’t part of Vet After Hours. The directory, area pages and published 24-hour list are linked below.</p>
${CALLOUT}
<ul class="related"><li><a href="/">Veterinary directory</a></li>${STATES.map(state => `<li><a href="${state.path}">${escapeHtml(state.nav)}</a></li>`).join('')}${areas.map(area => `<li><a href="${area.path}">${escapeHtml(area.nav)}</a></li>`).join('')}<li><a href="${TWENTY_FOUR.path}">${escapeHtml(TWENTY_FOUR.nav)}</a></li><li><a href="/information">Privacy and data sources</a></li></ul>`;
  return pageShell({
    title: 'Page not found — Vet After Hours',
    description: 'This address isn’t a Vet After Hours page. Search the directory or browse Victoria, Greater Sydney, South East Queensland, Greater Perth and Greater Adelaide.',
    path: '',
    robots: 'noindex',
    body,
  });
}

function staticCard(clinic) {
  const phone = formatPhone(clinic.phone);
  const directions = directionsUrl(clinic);
  const note = publicNote(clinic);
  const secondary = directions
    ? `<a class="button secondary" href="${escapeHtml(directions)}" target="_blank" rel="noopener noreferrer">Get directions</a>`
    : `<a class="button secondary" href="${escapeHtml(clinic.source_url)}" target="_blank" rel="noopener noreferrer">Clinic website</a>`;
  return `<article class="card"><div class="card-top">${badgeHtml(clinic)}</div><h3><a href="/clinics/${escapeHtml(clinic.id)}">${escapeHtml(clinic.name)}</a></h3><p class="address">${escapeHtml(formatAddress(clinic))}</p>${hoursHtml(clinic)}<p class="details">Hours and availability may change, including on public holidays. Call the clinic to confirm before travelling.</p>${note ? `<p class="notice">${escapeHtml(note)}</p>` : ''}<div class="card-actions"><a class="button primary" href="tel:${escapeHtml(clinic.phone)}">Call ${escapeHtml(phone)}</a>${secondary}</div><p class="card-meta"><span>${escapeHtml(reviewMeta(clinic))}</span></p></article>`;
}

function clinicLede(clinic) {
  const access = clinic.existing_clients_only ? ' The clinic describes this after-hours service as existing clients only.' : '';
  return `${clinic.name} is listed at ${formatAddress(clinic)}. The directory classifies it as ${article(serviceLabel(clinic))} ${lowerFirst(serviceLabel(clinic))}.${access} ${reviewMeta(clinic)}. Call ${formatPhone(clinic.phone)} before travelling.`;
}

function clinicDescription(clinic) {
  const hours = clinic.public_hours || clinic.published_hours_summary;
  const access = clinic.existing_clients_only ? ' Existing clients only.' : '';
  return `${clinic.name} — ${serviceLabel(clinic)} at ${formatAddress(clinic)}. ${withPeriod(hours)}${access} Call ${formatPhone(clinic.phone)} before travelling.`;
}

function clientsOnlyBanner(list) {
  const flagged = list.filter(c => c.existing_clients_only);
  if (!flagged.length) return '';
  const names = joinAnd(flagged.map(c => c.name));
  const verb = flagged.length > 1 ? 'publish' : 'publishes';
  return `<p><span class="badge clients-only">Existing clients only</span> ${escapeHtml(names)} ${verb} after-hours care for existing clients. Call the clinic if you are not sure that includes you.</p>`;
}

function collectionJsonLd(area, description, lastmod) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl(area.path)}#webpage`,
        url: canonicalUrl(area.path),
        name: area.title,
        description,
        dateModified: lastmod,
        inLanguage: 'en-AU',
        isPartOf: {'@id': `${SITE}/#website`},
        areaServed: areaContained(area),
        mainEntity: itemList(area.clinics, area.h1),
      },
      breadcrumbNode(area.path, [{href: '/', label: 'Directory'}, {label: area.nav}]),
    ],
  };
}

function itemList(clinics, name) {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: clinics.length,
    itemListElement: clinics.map((clinic, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: clinic.name,
      url: canonicalUrl(`/clinics/${clinic.id}`),
    })),
  };
}

function breadcrumbNode(path, items) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl(path)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? {item: canonicalUrl(item.href)} : {}),
    })),
  };
}

function postalAddress(clinic) {
  const address = {
    '@type': 'PostalAddress',
    streetAddress: clinic.address,
    addressLocality: clinic.suburb,
    addressRegion: clinic.state,
    addressCountry: clinic.country,
  };
  if (clinic.postcode) address.postalCode = clinic.postcode;
  return address;
}

function browseNav(areas) {
  const groups = [
    {title: 'Victoria', state: 'VIC', href: '/states/vic'},
    {title: 'Greater Sydney, NSW', state: 'NSW', href: '/states/nsw'},
    {title: 'South East Queensland', state: 'QLD', href: '/states/qld'},
    {title: 'Greater Perth, WA', state: 'WA', href: '/states/wa'},
    {title: 'Greater Adelaide, SA', state: 'SA', href: '/states/sa'},
  ];
  const blocks = groups.map(group => {
    const links = areas.filter(area => area.state === group.state).map(area => `<li><a href="${area.path}">${escapeHtml(area.nav)}</a></li>`).join('');
    return `<div class="browse-group"><h3><a href="${group.href}">${escapeHtml(group.title)}</a></h3><ul class="browse-links">${links}</ul></div>`;
  }).join('');
  return `<nav class="browse" id="browse" aria-labelledby="browse-title"><h2 id="browse-title">Browse by area</h2>${blocks}<ul class="browse-links"><li><a href="${TWENTY_FOUR.path}">${escapeHtml(TWENTY_FOUR.nav)}</a></li></ul></nav>`;
}

function relatedNav(areas, currentPath) {
  const links = [
    {href: '/', label: 'Full directory'},
    ...STATES.filter(state => state.path !== currentPath).map(state => ({href: state.path, label: state.nav})),
    ...areas.filter(area => area.path !== currentPath).map(area => ({href: area.path, label: area.nav})),
  ];
  if (currentPath !== TWENTY_FOUR.path) links.push({href: TWENTY_FOUR.path, label: TWENTY_FOUR.nav});
  return `<nav aria-label="Related pages"><h2>Other pages</h2><ul class="related">${links.map(link => `<li><a href="${link.href}">${escapeHtml(link.label)}</a></li>`).join('')}</ul></nav>`;
}

function crumbs(items) {
  const html = items.map((item, index) => {
    const last = index === items.length - 1;
    if (last || !item.href) return `<span>${escapeHtml(item.label)}</span>`;
    return `<a href="${item.href}">${escapeHtml(item.label)}</a>`;
  }).join(' / ');
  return `<nav class="crumbs" aria-label="Breadcrumb">${html}</nav>`;
}

function pageShell({title, description, path, jsonLd, body, robots}) {
  const canonical = path ? `<link rel="canonical" href="${canonicalUrl(path)}">` : '';
  const robotsMeta = robots ? `<meta name="robots" content="${escapeHtml(robots)}">` : '';
  const url = path ? canonicalUrl(path) : `${SITE}/`;
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
${robotsMeta}
${canonical}
<meta name="theme-color" content="#124e46">
${socialMeta({title, description, url})}
${jsonLd ? jsonLdScript(jsonLd) : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<a class="skip" href="#content">Skip to content</a>
<header class="header wrap"><a class="brand" href="/" aria-label="Vet After Hours home"><img src="/favicon.svg" width="43" height="43" alt="">vetafterhours</a><a href="/">Back to the directory</a></header>
<main id="content" class="wrap info-page">
${body}
</main>
<footer class="footer wrap"><div><strong>vetafterhours.au</strong><p>Helping you find the next step.</p></div><div><a href="mailto:hello@vetafterhours.au">hello@vetafterhours.au</a><a href="/information">Privacy &amp; data sources</a></div><p class="pilot">Victoria, Greater Sydney, South East Queensland, Greater Perth and Greater Adelaide<br>Website-checked listings. Not every town is covered.</p></footer>
</body>
</html>
`;
}

function socialMeta({title, description, url}) {
  return `<meta property="og:type" content="website">
<meta property="og:site_name" content="Vet After Hours">
<meta property="og:locale" content="en_AU">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">`;
}

function jsonLdScript(data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

function sitemapXml(entries) {
  const urls = entries.map(entry => `  <url><loc>${xmlEscape(canonicalUrl(entry.path))}</loc><lastmod>${entry.lastmod}</lastmod></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function coverageAreaServed() {
  return [
    {'@type': 'State', name: 'Victoria', containedInPlace: {'@type': 'Country', name: 'Australia'}},
    {'@type': 'AdministrativeArea', name: 'Greater Sydney', containedInPlace: {'@type': 'State', name: 'New South Wales', containedInPlace: {'@type': 'Country', name: 'Australia'}}},
    {
      '@type': 'AdministrativeArea',
      name: 'South East Queensland',
      containedInPlace: {'@type': 'State', name: 'Queensland', containedInPlace: {'@type': 'Country', name: 'Australia'}},
      containsPlace: [
        {'@type': 'City', name: 'Brisbane'},
        {'@type': 'City', name: 'Gold Coast'},
        {'@type': 'AdministrativeArea', name: 'Sunshine Coast'},
      ],
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Greater Perth',
      containedInPlace: {'@type': 'State', name: 'Western Australia', containedInPlace: {'@type': 'Country', name: 'Australia'}},
      containsPlace: [
        {'@type': 'City', name: 'Perth'},
        {'@type': 'City', name: 'Mandurah'},
      ],
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Greater Adelaide',
      containedInPlace: {'@type': 'State', name: 'South Australia', containedInPlace: {'@type': 'Country', name: 'Australia'}},
      containsPlace: [
        {'@type': 'City', name: 'Adelaide'},
        {'@type': 'City', name: 'Mount Barker'},
      ],
    },
  ];
}

function stateAreaServed(code) {
  if (code === 'NSW') return {'@type': 'AdministrativeArea', name: 'Greater Sydney', containedInPlace: {'@type': 'State', name: 'New South Wales'}};
  if (code === 'QLD') {
    return {
      '@type': 'AdministrativeArea',
      name: 'South East Queensland',
      containedInPlace: {'@type': 'State', name: 'Queensland'},
      containsPlace: [
        {'@type': 'City', name: 'Brisbane'},
        {'@type': 'City', name: 'Gold Coast'},
        {'@type': 'AdministrativeArea', name: 'Sunshine Coast'},
      ],
    };
  }
  if (code === 'WA') {
    return {
      '@type': 'AdministrativeArea',
      name: 'Greater Perth',
      containedInPlace: {'@type': 'State', name: 'Western Australia'},
      containsPlace: [
        {'@type': 'City', name: 'Perth'},
        {'@type': 'City', name: 'Mandurah'},
      ],
    };
  }
  if (code === 'SA') {
    return {
      '@type': 'AdministrativeArea',
      name: 'Greater Adelaide',
      containedInPlace: {'@type': 'State', name: 'South Australia'},
      containsPlace: [
        {'@type': 'City', name: 'Adelaide'},
        {'@type': 'City', name: 'Mount Barker'},
      ],
    };
  }
  return {'@type': 'State', name: 'Victoria'};
}

function areaContained(area) {
  if (area.state === 'NSW') return {'@type': 'AdministrativeArea', name: area.region, containedInPlace: {'@type': 'AdministrativeArea', name: 'Greater Sydney', containedInPlace: {'@type': 'State', name: 'New South Wales'}}};
  if (area.state === 'QLD') return {'@type': 'AdministrativeArea', name: area.region, containedInPlace: {'@type': 'AdministrativeArea', name: 'South East Queensland', containedInPlace: {'@type': 'State', name: 'Queensland'}}};
  if (area.state === 'WA') return {'@type': 'AdministrativeArea', name: area.region, containedInPlace: {'@type': 'AdministrativeArea', name: 'Greater Perth', containedInPlace: {'@type': 'State', name: 'Western Australia'}}};
  if (area.state === 'SA') return {'@type': 'AdministrativeArea', name: area.region, containedInPlace: {'@type': 'AdministrativeArea', name: 'Greater Adelaide', containedInPlace: {'@type': 'State', name: 'South Australia'}}};
  return {'@type': 'AdministrativeArea', name: area.region, containedInPlace: {'@type': 'State', name: 'Victoria'}};
}

function canonicalUrl(path) {
  if (path === '/') return `${SITE}/`;
  return SITE + path;
}

function sortClinics(clinics) {
  return rankClinics(clinics, null);
}

function maxDate(dates) {
  return [...dates].sort().at(-1);
}

function reportHref(clinic) {
  const subject = `Listing correction: ${clinic.name}`;
  const body = `Clinic: ${clinic.name}\nListing ID: ${clinic.id}\n\nWhat needs correcting?\n\nSource or supporting details:\n`;
  return `mailto:hello@vetafterhours.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function withPeriod(text) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return '';
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function joinAnd(items) {
  if (items.length <= 1) return items[0] || '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function article(label) {
  return /^[aeiou]/i.test(label) ? 'an' : 'a';
}

function lowerFirst(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function xmlEscape(value) {
  return String(value).replace(/[&<>'"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'}[c]));
}

function replaceOnce(html, marker, replacement, label) {
  if (!html.includes(marker)) throw new Error(`Missing ${label}`);
  return html.replace(marker, replacement);
}
