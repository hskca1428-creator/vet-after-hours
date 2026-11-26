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

export const SITE = 'https://www.vetafterhours.au';
/** Sitemap lastmod for information.html. The locality dataset note on that page is still 15 September 2026. */
export const INFORMATION_LASTMOD = '2026-11-26';

export const AREA_REDIRECTS = [
  {source: '/areas/warragul', destination: '/areas/gippsland'},
];

const HOME_TITLE = 'Vet After Hours — Find an emergency vet in Victoria';
const HOME_DESCRIPTION = 'Find after-hours veterinary services in Victoria. Search your suburb, check published service details and call a clinic. Free to use.';
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const GIPPSLAND_HOURS = 'Open continuously from Friday 6 pm to Monday 8 am, plus public holidays.';
const CALLOUT = '<div class="callout"><span class="info-icon" aria-hidden="true">i</span><p><strong>Please call before travelling.</strong> Published hours don’t guarantee a clinic can accept your pet. Confirm availability and the treatment location directly.</p></div>';

const AREAS = [
  {id: 'melbourne', region: 'Melbourne', path: '/areas/melbourne', file: 'areas/melbourne.html', nav: 'Melbourne', title: 'Emergency vets in Melbourne — Vet After Hours', h1: 'After-hours vets in Melbourne', description: describeArea, intro: melbourneIntro},
  {id: 'mornington-peninsula', region: 'Mornington Peninsula', path: '/areas/mornington-peninsula', file: 'areas/mornington-peninsula.html', nav: 'Mornington Peninsula', title: 'Emergency vet in Mornington — Vet After Hours', h1: 'After-hours vet in Mornington', description: describeArea, intro: morningtonIntro},
  {id: 'yarra-valley', region: 'Yarra Valley / Outer East', path: '/areas/yarra-valley', file: 'areas/yarra-valley.html', nav: 'Yarra Valley', title: 'After-hours vets in the Yarra Valley — Vet After Hours', h1: 'After-hours vets in the Yarra Valley', description: describeArea, intro: yarraIntro},
  {id: 'geelong', region: 'Geelong & Surf Coast', path: '/areas/geelong', file: 'areas/geelong.html', nav: 'Geelong', title: 'Emergency vets in Geelong — Vet After Hours', h1: 'After-hours vets in Geelong', description: describeArea, intro: geelongIntro},
  {id: 'colac', region: 'Colac', path: '/areas/colac', file: 'areas/colac.html', nav: 'Colac', title: 'After-hours vets in Colac — Vet After Hours', h1: 'After-hours vets in Colac', description: describeArea, intro: colacIntro},
  {id: 'ballarat', region: 'Ballarat', path: '/areas/ballarat', file: 'areas/ballarat.html', nav: 'Ballarat', title: 'After-hours vet in Ballarat — Vet After Hours', h1: 'After-hours vet in Ballarat', description: describeArea, intro: ballaratIntro},
  {id: 'bendigo', region: 'Bendigo & Central', path: '/areas/bendigo', file: 'areas/bendigo.html', nav: 'Bendigo', title: 'After-hours vets in Bendigo and central Victoria — Vet After Hours', h1: 'After-hours vets in Bendigo and central Victoria', description: describeArea, intro: bendigoIntro},
  {id: 'hume', region: 'Hume / North East', path: '/areas/hume', file: 'areas/hume.html', nav: 'Hume & North East', title: 'After-hours vets in Hume and north-east Victoria — Vet After Hours', h1: 'After-hours vets in Hume and north-east Victoria', description: describeArea, intro: humeIntro},
  {id: 'loddon-mallee', region: 'Loddon Mallee / Murray', path: '/areas/loddon-mallee', file: 'areas/loddon-mallee.html', nav: 'Murray & Mallee', title: 'After-hours vets in the Murray and Mallee — Vet After Hours', h1: 'After-hours vets in the Murray and Mallee', description: describeArea, intro: loddonIntro},
  {id: 'wimmera', region: 'Wimmera & South West', path: '/areas/wimmera', file: 'areas/wimmera.html', nav: 'Wimmera & South West', title: 'After-hours vets in the Wimmera and south-west — Vet After Hours', h1: 'After-hours vets in the Wimmera and south-west', description: describeArea, intro: wimmeraIntro},
  {id: 'gippsland', region: 'Gippsland', path: '/areas/gippsland', file: 'areas/gippsland.html', nav: 'Gippsland', title: 'After-hours vets in Gippsland — Vet After Hours', h1: 'After-hours vets in Gippsland', description: describeArea, intro: gippslandIntro},
];

const TWENTY_FOUR = {
  path: '/24-hour-emergency-vets',
  file: '24-hour-emergency-vets.html',
  nav: '24-hour emergency vets',
  title: '24-hour emergency vets in Victoria — Vet After Hours',
  h1: '24-hour emergency vets in Victoria',
};

export function clinicLastmod(clinic) {
  const dates = [clinic.source_checked_on, clinic.hours_updated_on].filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d || ''));
  if (!dates.length) throw new Error(`No review date for ${clinic.id}`);
  return dates.sort().at(-1);
}

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

export function generateSite({clinics, indexHtml}) {
  if (!Array.isArray(clinics) || !clinics.length) throw new Error('No clinic records');
  for (const clinic of clinics) {
    if (typeof clinic.existing_clients_only !== 'boolean') throw new Error(`existing_clients_only missing on ${clinic.id}`);
    if (!clinic.region) throw new Error(`region missing on ${clinic.id}`);
    if (!clinic.locality_coordinates || typeof clinic.locality_coordinates.lat !== 'number' || typeof clinic.locality_coordinates.lon !== 'number') {
      throw new Error(`coordinates missing on ${clinic.id}`);
    }
  }
  const areas = AREAS.map(area => {
    const list = sortClinics(clinics.filter(clinic => clinic.region === area.region));
    if (!list.length) throw new Error(`Area ${area.id} has no clinics`);
    return {...area, clinics: list, clinicIds: list.map(clinic => clinic.id)};
  });
  const assigned = areas.flatMap(area => area.clinicIds);
  if (new Set(assigned).size !== assigned.length) throw new Error('A clinic is listed in more than one area');
  const missing = clinics.filter(clinic => !assigned.includes(clinic.id)).map(clinic => clinic.id);
  if (missing.length) throw new Error(`Clinics missing an area page: ${missing.join(', ')}`);

  const twentyFour = sortClinics(clinics.filter(clinic => clinic.service_type === 'hospital_24h'));
  const pages = [
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
    areas: areas.map(area => ({id: area.id, path: area.path, nav: area.nav, region: area.region, clinicIds: [...area.clinicIds]})),
    pages,
    entries,
    indexHtml: prerenderHomepage(indexHtml, clinics, areas),
    notFoundHtml: notFoundPage(areas),
    sitemap: sitemapXml(entries),
  };
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
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE}/#directory`,
        name: 'Victorian after-hours veterinary directory',
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
  return replaceOnce(html, '</head>', `${jsonLd}\n</head>`, 'homepage head');
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
  const description = `${clinics.length} veterinary hospitals in this Victorian directory publish round-the-clock emergency care, in ${joinAnd([...new Set(clinics.map(c => c.suburb))])}. Call before travelling. Published hours are not live availability.`;
  const other = areas.filter(area => area.clinics.some(c => c.service_type !== 'hospital_24h'));
  const body = `${crumbs([{href: '/', label: 'Directory'}, {label: '24-hour emergency vets'}])}
<h1>${escapeHtml(TWENTY_FOUR.h1)}</h1>
<p>These ${clinics.length} records are the veterinary hospitals in the directory whose published service is round the clock: ${escapeHtml(joinAnd(clinics.map(c => `${c.name} in ${c.suburb}`)))}. Each listing below uses the hours text stored for that clinic.</p>
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
        mainEntity: itemList(clinics, 'Published 24-hour veterinary hospitals in Victoria'),
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
  const body = `${crumbs([{href: '/', label: 'Directory'}, {href: area.path, label: area.nav}, {label: clinic.name}])}
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
<p><a href="${area.path}">${escapeHtml(area.nav)} listings</a></p>
${siblingBlock}
<p>${roundTheClock ? 'This hospital is listed on the ' : 'This service is not published as a 24-hour hospital. The '}<a href="${TWENTY_FOUR.path}">24-hour emergency vets in Victoria</a> page.</p>`;
  const entity = {
    '@type': 'VeterinaryCare',
    '@id': `${canonicalUrl(path)}#clinic`,
    name: clinic.name,
    url: clinic.source_url,
    telephone: schemaTelephone(clinic.phone),
    address: postalAddress(clinic),
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
      breadcrumbNode(path, [{href: '/', label: 'Directory'}, {href: area.path, label: area.nav}, {label: clinic.name}]),
    ],
  };
  return {path, file: `clinics/${clinic.id}.html`, lastmod, html: pageShell({title, description, path, lastmod, jsonLd, body})};
}

function notFoundPage(areas) {
  const body = `<h1>Page not found</h1>
<p class="lede">That address isn’t part of Vet After Hours. The directory, area pages and published 24-hour list are linked below.</p>
${CALLOUT}
<ul class="related"><li><a href="/">Veterinary directory</a></li>${areas.map(area => `<li><a href="${area.path}">${escapeHtml(area.nav)}</a></li>`).join('')}<li><a href="${TWENTY_FOUR.path}">${escapeHtml(TWENTY_FOUR.nav)}</a></li><li><a href="/information">Privacy and data sources</a></li></ul>`;
  return pageShell({
    title: 'Page not found — Vet After Hours',
    description: 'This address isn’t a Vet After Hours page. Search the Victorian directory or browse the area pages.',
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
  const links = [
    ...areas.map(area => `<li><a href="${area.path}">${escapeHtml(area.nav)}</a></li>`),
    `<li><a href="${TWENTY_FOUR.path}">${escapeHtml(TWENTY_FOUR.nav)}</a></li>`,
  ];
  return `<nav class="browse" id="browse" aria-labelledby="browse-title"><h2 id="browse-title">Browse by area</h2><ul class="browse-links">${links.join('')}</ul></nav>`;
}

function relatedNav(areas, currentPath) {
  const links = [
    {href: '/', label: 'Full directory'},
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
<footer class="footer wrap"><div><strong>vetafterhours.au</strong><p>Helping you find the next step.</p></div><div><a href="mailto:hello@vetafterhours.au">hello@vetafterhours.au</a><a href="/information">Privacy &amp; data sources</a></div><p class="pilot">Victoria<br>Website-checked listings. Not every town is covered.</p></footer>
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
