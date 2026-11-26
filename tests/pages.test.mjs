import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync, spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {hoursClarifiedLabel, reviewMeta, schemaTelephone, serviceLabel} from '../public/present.js';
import {AREA_REDIRECTS, INFORMATION_LASTMOD, SITE, generateSite, openingHoursFor} from '../scripts/pages.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const clinicsDoc = JSON.parse(readFileSync(new URL('../public/data/clinics.json', import.meta.url)));
const clinics = clinicsDoc.clinics;
const indexHtml = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const site = generateSite({clinics, indexHtml});

function unescapeAttr(value) {
  return value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
}
function meta(html, name) {
  const match = html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`));
  assert.ok(match, name);
  return unescapeAttr(match[1]);
}
function jsonLdBlocks(html) {
  const blocks = [];
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    assert.equal(match[1].includes('<'), false, 'JSON-LD must not contain a raw <');
    blocks.push(JSON.parse(match[1]));
  }
  assert.ok(blocks.length);
  for (const block of blocks) assert.equal(block['@context'], 'https://schema.org');
  return blocks;
}
function page(path) {
  const found = site.pages.find(item => item.path === path);
  assert.ok(found, path);
  return found;
}
function veterinary(html) {
  const entity = jsonLdBlocks(html)[0]['@graph'].find(node => node['@type'] === 'VeterinaryCare');
  assert.ok(entity);
  return entity;
}
function sitemapEntries(xml) {
  return [...xml.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><\/url>/g)].map(match => ({loc: match[1], lastmod: match[2]}));
}

test('hours clarified text uses the record date and is omitted when absent', () => {
  assert.equal(hoursClarifiedLabel('2026-09-19'), 'Hours clarified 19 Sept 2026');
  assert.equal(hoursClarifiedLabel('2026-01-02'), 'Hours clarified 2 Jan 2026');
  for (const empty of [undefined, null, '', '19 Sept 2026']) assert.equal(hoursClarifiedLabel(empty), '');
  const kensington = clinics.find(c => c.id === 'advanced-kensington');
  const essendon = clinics.find(c => c.id === 'arh-essendon');
  assert.equal(reviewMeta(kensington), 'Website reviewed 5 Sept 2026 · Hours clarified 19 Sept 2026');
  assert.equal(reviewMeta(essendon), 'Website reviewed 5 Sept 2026');
  assert.equal(readFileSync(new URL('../public/app.js', import.meta.url), 'utf8').includes('Hours clarified 19 Sept 2026'), false);
});

test('homepage HTML lists every clinic without waiting for JavaScript', () => {
  assert.match(indexHtml, /Loading the directory…/);
  assert.doesNotMatch(site.indexHtml, /Loading the directory/);
  assert.doesNotMatch(site.indexHtml, /Preparing clinic details/);
  assert.match(site.indexHtml, /aria-busy="false"/);
  assert.match(site.indexHtml, new RegExp(`${clinics.length} listed services`));
  assert.match(site.indexHtml, /Existing clients only/);
  assert.match(site.indexHtml, /26 November 2026/);
  assert.doesNotMatch(site.indexHtml, /Victoria pilot/);
  assert.match(site.indexHtml, /src="\/app\.js"/);
  for (const clinic of clinics) {
    assert.ok(site.indexHtml.includes(clinic.name.replaceAll('&', '&amp;')), clinic.id);
    assert.match(site.indexHtml, new RegExp(`tel:${clinic.phone}`));
    assert.match(site.indexHtml, new RegExp(`href="/clinics/${clinic.id}"`));
  }
  assert.match(site.indexHtml, /Published 24-hour hospital/);
  assert.match(site.indexHtml, /24 hours a day, 7 days a week/);
  assert.match(site.indexHtml, /Sunday: 8:30 am–midnight; no overnight on-call/);
  assert.match(site.indexHtml, /href="\/areas\/melbourne"/);
  assert.match(site.indexHtml, /href="\/24-hour-emergency-vets"/);
  assert.match(site.indexHtml, /Hours clarified 19 Sept 2026/);
  assert.equal(site.indexHtml.includes('Hours clarified 5 Sept 2026'), false);
  const blocks = jsonLdBlocks(site.indexHtml);
  const list = blocks[0]['@graph'].find(node => node['@type'] === 'ItemList');
  assert.equal(list.numberOfItems, clinics.length);
  assert.equal(list.itemListElement[0].url.startsWith(`${SITE}/clinics/`), true);
});

test('clinic pages have unique copy, canonicals and VeterinaryCare JSON-LD', () => {
  const descriptions = [];
  const titles = [];
  for (const clinic of clinics) {
    const html = page(`/clinics/${clinic.id}`).html;
    const description = meta(html, 'description');
    const title = html.match(/<title>([^<]*)<\/title>/)[1];
    descriptions.push(description);
    titles.push(unescapeAttr(title));
    assert.ok(description.length >= 80 && description.length <= 420, description);
    assert.match(html, new RegExp(`<link rel="canonical" href="${SITE}/clinics/${clinic.id}">`));
    assert.match(html, /property="og:title"/);
    assert.match(html, /name="twitter:card" content="summary"/);
    assert.match(html, /Please call before travelling/);
    assert.match(html, new RegExp(`tel:${clinic.phone}`));
    assert.match(html, new RegExp(clinic.suburb));
    assert.equal(html.includes('needs_review'), false);
    assert.equal(html.includes('Owner-supplied'), false);
    assert.equal(html.includes('direct fetch failed'), false);
    assert.equal(html.includes('Do not infer'), false);
    assert.equal(html.includes(String(clinic.locality_coordinates.lat)), false);
    const entity = veterinary(html);
    assert.equal(entity.name, clinic.name);
    assert.equal(entity.url, clinic.source_url);
    assert.equal(entity.telephone, schemaTelephone(clinic.phone));
    assert.equal(entity.address.streetAddress, clinic.address);
    assert.equal(entity.address.addressLocality, clinic.suburb);
    assert.equal(entity.address.addressRegion, clinic.state);
    assert.equal(entity.address.addressCountry, 'AU');
    if (clinic.postcode) assert.equal(entity.address.postalCode, clinic.postcode);
    else assert.equal(Object.hasOwn(entity.address, 'postalCode'), false);
    const webpage = jsonLdBlocks(html)[0]['@graph'].find(node => node['@type'] === 'WebPage');
    assert.equal(webpage.dateModified, page(`/clinics/${clinic.id}`).lastmod);
  }
  assert.equal(new Set(descriptions).size, descriptions.length);
  assert.equal(new Set(titles).size, titles.length);
  const kensington = veterinary(page('/clinics/advanced-kensington').html);
  assert.equal(kensington.openingHours, 'Mo-Su 00:00-23:59');
  assert.equal(kensington.openingHoursSpecification[0].opens, '00:00');
  assert.equal(kensington.openingHoursSpecification[0].closes, '23:59');
  assert.equal(kensington.openingHoursSpecification[0].dayOfWeek.length, 7);
  assert.equal(kensington.address.postalCode, '3031');
  for (const id of ['ballarat-pet-farm', 'central-bendigo']) {
    const entity = veterinary(page(`/clinics/${id}`).html);
    assert.equal(Object.hasOwn(entity, 'openingHours'), false);
    assert.equal(Object.hasOwn(entity, 'openingHoursSpecification'), false);
    assert.match(page(`/clinics/${id}`).html, /does not include a directions link/);
    assert.doesNotMatch(page(`/clinics/${id}`).html, /google\.com\/maps/);
  }
  const gippsland = veterinary(page('/clinics/gippsland-warragul').html);
  assert.match(gippsland.openingHours, /Fr 18:00-23:59/);
  assert.equal(gippsland.openingHours.includes('Mo-Su'), false);
  const friday = gippsland.openingHoursSpecification.find(spec => spec.dayOfWeek === 'Friday');
  assert.equal(friday.opens, '18:00');
  assert.equal(friday.closes, '23:59');
  const monday = gippsland.openingHoursSpecification.find(spec => spec.dayOfWeek === 'Monday');
  assert.equal(monday.closes, '08:00');
  assert.match(page('/clinics/geelong-emergency').html, /google\.com\/maps/);
  assert.match(page('/clinics/care-collingwood').html, /<h1>Centre for Animal Referral &amp; Emergency<\/h1>/);
  assert.match(page('/clinics/advanced-kensington').html, /href="\/areas\/melbourne"/);
  assert.match(page('/clinics/advanced-kensington').html, /Hours clarified 19 Sept 2026/);
  assert.match(meta(page('/clinics/advanced-kensington').html, 'description'), /7 days a week\. Call 03 9092 0400/);
  const northRyde = page('/clinics/sash-north-ryde').html;
  assert.match(northRyde, /North Ryde NSW 2113/);
  assert.equal(veterinary(northRyde).address.addressRegion, 'NSW');
  assert.match(veterinary(northRyde).areaServed.containedInPlace.name, /New South Wales/);
  assert.match(page('/clinics/veca-norwest').html, /1 December 2026/);
  assert.match(page('/clinics/veca-campbelltown').html, /1 December 2026/);
  assert.equal(clinics.some(clinic => clinic.id === 'arh-baulkham-hills'), false);
  assert.match(page('/clinics/advanced-kensington').html, /Kensington VIC 3031/);
});

test('opening hours are omitted when the stored text does not support them', () => {
  assert.deepEqual(openingHoursFor({id: 'gippsland-warragul', service_type: 'after_hours', public_hours: 'Changed', published_hours_summary: 'Changed'}), {});
  assert.deepEqual(openingHoursFor({service_type: 'hospital_24h', published_hours_summary: 'By appointment'}), {});
  assert.deepEqual(openingHoursFor({service_type: 'after_hours', public_hours: '24 hours a day, 7 days a week'}), {});
  assert.deepEqual(openingHoursFor({service_type: 'after_hours_on_call', public_hours: 'A vet is available 24/7 for emergencies.'}), {});
  assert.deepEqual(openingHoursFor({service_type: 'after_hours_rotating', public_hours: 'On-call every night'}), {});
  assert.deepEqual(openingHoursFor({service_type: 'after_hours_limited', public_hours: 'Weekends 8:30am-5pm'}), {});
  assert.deepEqual(openingHoursFor({service_type: 'on_call', public_hours: '24 hours'}), {});
  assert.equal(openingHoursFor(clinics.find(c => c.id === 'aec-mount-waverley')).openingHours, 'Mo-Su 00:00-23:59');
  assert.equal(openingHoursFor(clinics.find(c => c.id === 'penvet-emergency-mornington')).openingHours, 'Mo-Su 00:00-23:59');
  assert.deepEqual(openingHoursFor(clinics.find(c => c.id === 'gippsland-vet-hospital-maffra')), {});
  assert.deepEqual(openingHoursFor(clinics.find(c => c.id === 'gippsland-vet-hospital-sale')), {});
  assert.deepEqual(openingHoursFor(clinics.find(c => c.id === 'wangaratta-veterinary-clinic')), {});
  assert.equal(serviceLabel({service_type: 'after_hours_limited'}), 'Limited after-hours service');
  assert.equal(serviceLabel({service_type: 'on_call'}), 'After-hours & on-call');
  assert.equal(serviceLabel({service_type: 'rotating'}), 'Call-first service');
});

test('area and 24-hour pages link the clinics they actually list', () => {
  const assigned = site.areas.flatMap(area => area.clinicIds);
  assert.deepEqual([...assigned].sort(), clinics.map(c => c.id).sort());
  assert.equal(new Set(assigned).size, assigned.length);
  const melbourne = page('/areas/melbourne').html;
  assert.match(melbourne, /tel:0397705555/);
  assert.doesNotMatch(melbourne, /tel:0413898331/);
  assert.match(melbourne, /Animal Emergency Centre Moorabbin is listed in Highett/);
  assert.match(melbourne, /Please call before travelling/);
  const melbourneArea = site.areas.find(area => area.id === 'melbourne');
  assert.equal(jsonLdBlocks(melbourne)[0]['@graph'].find(node => node['@type'] === 'CollectionPage').mainEntity.numberOfItems, melbourneArea.clinicIds.length);
  assert.equal(melbourneArea.clinicIds.includes('penvet-emergency-mornington'), false);
  assert.match(melbourne, /Mornington Peninsula/);
  const ballarat = page('/areas/ballarat').html;
  assert.match(ballarat, /Call and press 1 for the treatment location/);
  assert.match(ballarat, /href="\/areas\/geelong"/);
  assert.doesNotMatch(ballarat, /google\.com\/maps/);
  const bendigo = page('/areas/bendigo').html;
  assert.match(bendigo, /No on-call service on Sunday nights/);
  assert.match(bendigo, /not a published 24-hour hospital/);
  const gippsland = page('/areas/gippsland').html;
  assert.match(gippsland, /Friday 6 pm to Monday 8 am/);
  assert.match(gippsland, /Existing clients only/);
  assert.match(gippsland, /telehealth fee/);
  assert.match(gippsland, /Sale/);
  assert.match(gippsland, /Maffra/);
  assert.doesNotMatch(gippsland, /No other Gippsland town is listed/);
  assert.doesNotMatch(gippsland, /Weeknights 8am/);
  assert.doesNotMatch(gippsland, /3830/);
  const mornington = page('/areas/mornington-peninsula').html;
  assert.match(mornington, /tel:0359799600/);
  assert.match(mornington, /24-hour hospital/);
  assert.match(page('/areas/hume').html, /Existing clients only/);
  const family = page('/clinics/family-vet-centre-wodonga').html;
  assert.match(family, /Existing clients only/);
  assert.match(family, /Wagga Wagga/);
  const gvg = page('/clinics/gvg-after-hours-pathway').html;
  assert.match(gvg, /telehealth fee/);
  assert.doesNotMatch(gvg, /Existing clients only/);
  assert.doesNotMatch(page('/clinics/gippsland-vet-hospital-sale').html, /Weeknights/);
  assert.doesNotMatch(page('/clinics/gippsland-vet-hospital-maffra').html, /3830/);
  assert.doesNotMatch(page('/clinics/wangaratta-veterinary-clinic').html, /9:00pm|2pm-6pm|Friday/);
  assert.match(page('/clinics/benetook-veterinary-clinic-mildura').html, /Limited after-hours service/);
  const twentyFour = page('/24-hour-emergency-vets').html;
  for (const clinic of clinics.filter(c => c.service_type === 'hospital_24h')) assert.match(twentyFour, new RegExp(`tel:${clinic.phone}`));
  for (const clinic of clinics.filter(c => c.service_type !== 'hospital_24h')) assert.doesNotMatch(twentyFour, new RegExp(`tel:${clinic.phone}`));
  assert.match(twentyFour, /href="\/areas\/ballarat"/);
  assert.match(twentyFour, /href="\/areas\/bendigo"/);
  assert.match(twentyFour, /href="\/areas\/gippsland"/);
  assert.doesNotMatch(twentyFour, /href="\/areas\/warragul"/);
  assert.match(twentyFour, /Greater Sydney/);
  assert.match(page('/states/vic').html, /Advanced Vetcare Kensington/);
  assert.match(page('/states/vic').html, /href="\/areas\/melbourne"/);
  assert.doesNotMatch(page('/states/vic').html, /SASH North Ryde/);
  assert.match(page('/states/nsw').html, /SASH North Ryde/);
  assert.match(page('/states/nsw').html, /Greater Sydney/);
  assert.match(page('/states/nsw').html, /href="\/areas\/inner-west"/);
  assert.match(page('/areas/blue-mountains').html, /Limited after-hours service/);
  assert.match(page('/areas/north-shore-and-northern-beaches').html, /Northside Emergency Veterinary Service/);
  assert.doesNotMatch(page('/states/nsw').html, /Baulkham Hills/);
  const areaServed = jsonLdBlocks(site.indexHtml)[0]['@graph'].find(node => node['@type'] === 'WebSite').areaServed;
  assert.ok(areaServed.some(area => area.name === 'Victoria'));
  assert.ok(areaServed.some(area => area.name === 'Greater Sydney'));
  const descriptions = site.pages.map(item => meta(item.html, 'description'));
  assert.equal(new Set(descriptions).size, descriptions.length);
});

test('sitemap lists every public URL with data-derived lastmod', () => {
  const entries = sitemapEntries(site.sitemap);
  assert.equal(entries.length, site.pages.length + 2);
  assert.equal(new Set(entries.map(entry => entry.loc)).size, entries.length);
  const byLoc = Object.fromEntries(entries.map(entry => [entry.loc, entry.lastmod]));
  assert.equal(byLoc[`${SITE}/`], '2026-11-26');
  assert.equal(byLoc[`${SITE}/information`], INFORMATION_LASTMOD);
  assert.equal(byLoc[`${SITE}/clinics/advanced-kensington`], '2026-09-19');
  assert.equal(byLoc[`${SITE}/clinics/arh-essendon`], '2026-09-05');
  assert.equal(byLoc[`${SITE}/clinics/ballarat-pet-farm`], '2026-09-05');
  assert.equal(byLoc[`${SITE}/areas/ballarat`], '2026-09-05');
  assert.equal(byLoc[`${SITE}/areas/bendigo`], '2026-11-26');
  assert.equal(byLoc[`${SITE}/areas/gippsland`], '2026-11-26');
  assert.equal(byLoc[`${SITE}/areas/warragul`], undefined);
  assert.equal(byLoc[`${SITE}/clinics/penvet-emergency-mornington`], '2026-11-26');
  assert.equal(byLoc[`${SITE}/clinics/gippsland-vet-hospital-maffra`], '2026-11-26');
  for (const item of site.pages) assert.equal(byLoc[`${SITE}${item.path}`], item.lastmod);
  assert.equal(JSON.stringify(site.sitemap).includes('404'), false);
  assert.match(site.notFoundHtml, /<meta name="robots" content="noindex">/);
  assert.match(site.notFoundHtml, /Page not found/);
  assert.equal(site.notFoundHtml.includes('rel="canonical"'), false);
  assert.throws(() => generateSite({clinics, indexHtml: '<html></html>'}), /homepage results marker/);
});

test('existing pages carry descriptions and share cards', () => {
  const information = readFileSync(new URL('../public/information.html', import.meta.url), 'utf8');
  assert.match(information, /name="description"/);
  assert.match(information, /property="og:title"/);
  assert.match(information, /name="twitter:card"/);
  assert.match(information, /rel="canonical" href="https:\/\/www\.vetafterhours\.au\/information"/);
  assert.doesNotMatch(information, /information\.html/);
  assert.match(indexHtml, /property="og:title"/);
  assert.match(indexHtml, /name="twitter:description"/);
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.equal(readme.includes('Six records require further review'), false);
  assert.match(readme, new RegExp(`All ${clinics.length} clinic records are website-checked`));
  const research = readFileSync(new URL('../research/DIRECTORY-RESEARCH.md', import.meta.url), 'utf8');
  assert.equal(research.includes('victoria-clinics.seed.json'), false);
  assert.match(research, /public\/data\/clinics\.json/);
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  assert.equal(vercel.cleanUrls, true);
  assert.equal(vercel.trailingSlash, false);
  assert.deepEqual(vercel.redirects.map(({source, destination}) => ({source, destination})), AREA_REDIRECTS);
  assert.equal(vercel.outputDirectory, 'dist');
  assert.match(readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8'), /Sitemap: https:\/\/www\.vetafterhours\.au\/sitemap\.xml/);
});

test('build writes the prerendered site', () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], {cwd: root, stdio: 'pipe'});
  assert.equal(readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8'), site.indexHtml);
  assert.equal(readFileSync(new URL('../dist/sitemap.xml', import.meta.url), 'utf8'), site.sitemap);
  assert.equal(readFileSync(new URL('../dist/404.html', import.meta.url), 'utf8'), site.notFoundHtml);
  assert.equal(readFileSync(new URL('../dist/clinics/advanced-kensington.html', import.meta.url), 'utf8'), page('/clinics/advanced-kensington').html);
  assert.match(readFileSync(new URL('../dist/robots.txt', import.meta.url), 'utf8'), /sitemap\.xml/);
  assert.match(readFileSync(new URL('../dist/information.html', import.meta.url), 'utf8'), /name="description"/);
});

test('dev server serves crawlable HTML and a custom 404', async () => {
  const proc = spawn(process.execPath, ['scripts/serve.mjs'], {cwd: root, env: {...process.env, PORT: '47823'}, stdio: ['ignore', 'pipe', 'pipe']});
  let log = '';
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`server did not start\n${log}`)), 8000);
      proc.stdout.on('data', chunk => {
        log += chunk;
        if (log.includes('47823')) { clearTimeout(timer); resolve(); }
      });
      proc.stderr.on('data', chunk => { log += chunk; });
      proc.on('exit', code => reject(new Error(`server exited ${code}\n${log}`)));
    });
    const home = await fetch('http://127.0.0.1:47823/');
    assert.equal(home.status, 200);
    const homeHtml = await home.text();
    assert.match(homeHtml, /Advanced Vetcare Kensington/);
    assert.doesNotMatch(homeHtml, /Loading the directory/);
    const clinic = await fetch('http://127.0.0.1:47823/clinics/central-bendigo');
    assert.equal(clinic.status, 200);
    assert.match(await clinic.text(), /No on-call service on Sunday nights/);
    const family = await fetch('http://127.0.0.1:47823/clinics/moe-veterinary-centre');
    assert.equal(family.status, 200);
    assert.match(await family.text(), /Existing clients only/);
    const gippslandPage = await fetch('http://127.0.0.1:47823/areas/gippsland');
    assert.equal(gippslandPage.status, 200);
    assert.match(await gippslandPage.text(), /Existing clients only/);
    const sydneyClinic = await fetch('http://127.0.0.1:47823/clinics/sash-north-ryde');
    assert.equal(sydneyClinic.status, 200);
    assert.match(await sydneyClinic.text(), /North Ryde NSW/);
    const nswPage = await fetch('http://127.0.0.1:47823/states/nsw');
    assert.equal(nswPage.status, 200);
    assert.match(await nswPage.text(), /Greater Sydney/);
    const nswShortcut = await fetch('http://127.0.0.1:47823/nsw', {redirect: 'manual'});
    assert.equal(nswShortcut.status, 301);
    assert.equal(nswShortcut.headers.get('location'), '/states/nsw');
    const oldArea = await fetch('http://127.0.0.1:47823/areas/warragul', {redirect: 'manual'});
    assert.equal(oldArea.status, 301);
    assert.equal(oldArea.headers.get('location'), '/areas/gippsland');
    const missing = await fetch('http://127.0.0.1:47823/no-such-page');
    assert.equal(missing.status, 404);
    assert.match(await missing.text(), /Page not found/);
    const escaped = await fetch('http://127.0.0.1:47823/../package.json');
    assert.notEqual(escaped.status, 200);
    const body = await escaped.text();
    assert.equal(body.includes('"name": "vet-after-hours"'), false);
  } finally {
    proc.kill();
  }
});
