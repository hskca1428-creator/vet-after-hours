import {directionsUrl, rankClinics} from '../public/search.js';
import {
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
/** Date printed on information.html (privacy copy and locality retrieval). */
export const INFORMATION_LASTMOD = '2026-09-15';

const HOME_TITLE = 'Vet After Hours — Find an emergency vet in Victoria';
const HOME_DESCRIPTION = 'Find after-hours veterinary services in Victoria. Search your suburb, check published service details and call a clinic. Free to use.';
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const GIPPSLAND_HOURS = 'Open continuously from Friday 6 pm to Monday 8 am, plus public holidays.';
const CALLOUT = '<div class="callout"><span class="info-icon" aria-hidden="true">i</span><p><strong>Please call before travelling.</strong> Published hours don’t guarantee a clinic can accept your pet. Confirm availability and the treatment location directly.</p></div>';

const AREAS = [
  {
    id: 'melbourne',
    path: '/areas/melbourne',
    file: 'areas/melbourne.html',
    nav: 'Melbourne',
    title: 'Emergency vets in Melbourne — Vet After Hours',
    h1: 'After-hours vets in Melbourne',
    clinicIds: [
      'advanced-kensington',
      'advanced-kew',
      'arh-essendon',
      'care-collingwood',
      'aec-mount-waverley',
      'vrh-dandenong',
      'aec-moorabbin',
      'gvh-werribee',
      'aec-frankston',
    ],
    description(list) {
      return `Published 24-hour veterinary hospitals listed for Melbourne: ${joinAnd(list.map(c => c.suburb))}. Call the clinic before you travel. This is not every Melbourne emergency clinic.`;
    },
    intro(list) {
      const moorabbin = list.find(c => c.id === 'aec-moorabbin');
      const grouped = list.filter(c => c.id === 'aec-frankston' || c.id === 'gvh-werribee');
      const sentences = [];
      if (moorabbin) sentences.push(`${escapeHtml(moorabbin.name)} is listed in ${escapeHtml(moorabbin.suburb)}, the suburb on its street address.`);
      if (grouped.length) sentences.push(`${escapeHtml(joinAnd(grouped.map(c => `${c.name} in ${c.suburb}`)))} ${grouped.length > 1 ? 'are' : 'is'} on this Melbourne page rather than a separate area page.`);
      sentences.push('This is not every emergency clinic in Melbourne. A suburb that is missing has not been surveyed for this directory.');
      return `<p>The Melbourne section of this directory has ${list.length} published 24-hour veterinary hospitals: ${escapeHtml(joinAnd(list.map(c => `${c.name} (${c.suburb})`)))}.</p><p>${sentences.join(' ')}</p>`;
    },
  },
  {
    id: 'geelong',
    path: '/areas/geelong',
    file: 'areas/geelong.html',
    nav: 'Geelong',
    title: 'Emergency vets in Geelong — Vet After Hours',
    h1: 'After-hours vets in Geelong',
    clinicIds: ['geelong-emergency', 'gars-newtown'],
    description(list) {
      return `${joinAnd(list.map(c => `${c.name} in ${c.suburb}`))}: both are published 24-hour veterinary hospitals. Call the clinic you plan to visit before travelling.`;
    },
    intro(list) {
      const bits = list.map(c => `${escapeHtml(c.name)} in ${escapeHtml(c.suburb)} (${escapeHtml(formatAddress(c))}, ${escapeHtml(formatPhone(c.phone))})`).join(' and ');
      return `<p>The Geelong listings are ${list.length} published 24-hour hospitals: ${bits}. They are different clinics. This page cannot tell you which one can accept a patient.</p>`;
    },
  },
  {
    id: 'ballarat',
    path: '/areas/ballarat',
    file: 'areas/ballarat.html',
    nav: 'Ballarat',
    title: 'After-hours vet in Ballarat — Vet After Hours',
    h1: 'After-hours vet in Ballarat',
    clinicIds: ['ballarat-pet-farm'],
    description(list) {
      const c = list[0];
      return `${c.name} in ${c.suburb}: ${withPeriod(c.published_hours_summary)} ${publicNote(c)}`;
    },
    intro(list) {
      const c = list[0];
      return `<p>The Ballarat listing is ${escapeHtml(c.name)} at ${escapeHtml(formatAddress(c))}. It is a call-first after-hours pathway, not a published 24-hour hospital. Published hours: ${escapeHtml(withPeriod(c.published_hours_summary))}</p><p>${escapeHtml(publicNote(c))} This record has no directions link, because the clinic asks you to confirm the treatment location on the phone. The Geelong and Melbourne pages list the published 24-hour hospitals those overnight calls are directed toward.</p>`;
    },
  },
  {
    id: 'bendigo',
    path: '/areas/bendigo',
    file: 'areas/bendigo.html',
    nav: 'Bendigo',
    title: 'After-hours vet in Bendigo — Vet After Hours',
    h1: 'After-hours vet in Bendigo',
    clinicIds: ['central-bendigo'],
    description(list) {
      const c = list[0];
      return `${c.name} in ${c.suburb} is an on-call service, not a 24-hour hospital. ${publicNote(c)}`;
    },
    intro(list) {
      const c = list[0];
      return `<p>The Bendigo-area listing is ${escapeHtml(c.name)} at ${escapeHtml(formatAddress(c))}. It is an after-hours on-call service, not a published 24-hour hospital. The phone number in this directory is ${escapeHtml(formatPhone(c.phone))}.</p><p>${escapeHtml(publicNote(c))} This record has no directions link, because the treatment location is confirmed when you call. If you are referred on, the Melbourne page lists published 24-hour hospitals.</p>`;
    },
  },
  {
    id: 'warragul',
    path: '/areas/warragul',
    file: 'areas/warragul.html',
    nav: 'Warragul',
    title: 'After-hours vet in Warragul and Gippsland — Vet After Hours',
    h1: 'After-hours vet in Warragul and Gippsland',
    clinicIds: ['gippsland-warragul'],
    description(list) {
      const c = list[0];
      return `${c.name} in ${c.suburb}: ${withPeriod(c.public_hours || c.published_hours_summary)} Not a 24-hour hospital. No other Gippsland town is in this directory. Call before travelling.`;
    },
    intro(list) {
      const c = list[0];
      return `<p>The only Gippsland listing in this directory is ${escapeHtml(c.name)} at ${escapeHtml(formatAddress(c))}. Published hours: ${escapeHtml(withPeriod(c.public_hours || c.published_hours_summary))} It is an after-hours service, not a 24-hour hospital. The phone number in this directory is ${escapeHtml(formatPhone(c.phone))}.</p><p>No other Gippsland town is listed. That is a limit of this directory, not a finding that those towns have no after-hours vet. The published hours include public holidays; confirm the day’s times, and whether they can see your pet, by phone.</p>`;
    },
  },
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
  const byId = new Map(clinics.map(c => [c.id, c]));
  for (const area of AREAS) {
    for (const id of area.clinicIds) {
      if (!byId.has(id)) throw new Error(`Area ${area.id} references unknown clinic ${id}`);
    }
  }
  const assigned = AREAS.flatMap(area => area.clinicIds);
  if (new Set(assigned).size !== assigned.length) throw new Error('A clinic is listed in more than one area');
  const missing = clinics.filter(c => !assigned.includes(c.id)).map(c => c.id);
  if (missing.length) throw new Error(`Clinics missing an area page: ${missing.join(', ')}`);

  const areas = AREAS.map(area => ({...area, clinics: sortClinics(area.clinicIds.map(id => byId.get(id)))}));
  const twentyFour = sortClinics(clinics.filter(c => c.service_type === 'hospital_24h'));
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
    areas: AREAS.map(area => ({id: area.id, path: area.path, nav: area.nav, clinicIds: [...area.clinicIds]})),
    pages,
    entries,
    indexHtml: prerenderHomepage(indexHtml, clinics, areas),
    notFoundHtml: notFoundPage(areas),
    sitemap: sitemapXml(entries),
  };
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
<p><span class="badge">${escapeHtml(serviceLabel(clinic))}</span></p>
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
  return `<article class="card"><div class="card-top"><span class="badge">${escapeHtml(serviceLabel(clinic))}</span></div><h3><a href="/clinics/${escapeHtml(clinic.id)}">${escapeHtml(clinic.name)}</a></h3><p class="address">${escapeHtml(formatAddress(clinic))}</p>${hoursHtml(clinic)}<p class="details">Hours and availability may change, including on public holidays. Call the clinic to confirm before travelling.</p>${note ? `<p class="notice">${escapeHtml(note)}</p>` : ''}<div class="card-actions"><a class="button primary" href="tel:${escapeHtml(clinic.phone)}">Call ${escapeHtml(phone)}</a>${secondary}</div><p class="card-meta"><span>${escapeHtml(reviewMeta(clinic))}</span></p></article>`;
}

function clinicLede(clinic) {
  return `${clinic.name} is listed at ${formatAddress(clinic)}. The directory classifies it as ${article(serviceLabel(clinic))} ${lowerFirst(serviceLabel(clinic))}. ${reviewMeta(clinic)}. Call ${formatPhone(clinic.phone)} before travelling.`;
}

function clinicDescription(clinic) {
  const hours = clinic.public_hours || clinic.published_hours_summary;
  return `${clinic.name} — ${serviceLabel(clinic)} at ${formatAddress(clinic)}. ${withPeriod(hours)} Call ${formatPhone(clinic.phone)} before travelling.`;
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
<footer class="footer wrap"><div><strong>vetafterhours.au</strong><p>Helping you find the next step.</p></div><div><a href="mailto:hello@vetafterhours.au">hello@vetafterhours.au</a><a href="/information">Privacy &amp; data sources</a></div><p class="pilot">Preview · Victoria pilot<br>Clinic coverage is still being checked.</p></footer>
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
