import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync, spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {hoursClarifiedLabel, reviewMeta} from '../public/present.js';
import {INFORMATION_LASTMOD, SITE, generateSite, openingHoursFor} from '../scripts/pages.mjs';

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
  assert.match(site.indexHtml, /14 listed services/);
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
    assert.equal(entity.telephone, clinic.phone.startsWith('1300') ? `+61${clinic.phone}` : `+61${clinic.phone.slice(1)}`);
    assert.equal(entity.address.streetAddress, clinic.address);
    assert.equal(entity.address.addressLocality, clinic.suburb);
    assert.equal(entity.address.addressRegion, 'VIC');
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
});

test('opening hours are omitted when the stored text does not support them', () => {
  assert.deepEqual(openingHoursFor({id: 'gippsland-warragul', service_type: 'after_hours', public_hours: 'Changed', published_hours_summary: 'Changed'}), {});
  assert.deepEqual(openingHoursFor({service_type: 'hospital_24h', published_hours_summary: 'By appointment'}), {});
  assert.deepEqual(openingHoursFor({service_type: 'after_hours', public_hours: '24 hours a day, 7 days a week'}), {});
  assert.equal(openingHoursFor(clinics.find(c => c.id === 'aec-mount-waverley')).openingHours, 'Mo-Su 00:00-23:59');
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
  assert.equal(jsonLdBlocks(melbourne)[0]['@graph'].find(node => node['@type'] === 'CollectionPage').mainEntity.numberOfItems, 9);
  const ballarat = page('/areas/ballarat').html;
  assert.match(ballarat, /Call and press 1 for the treatment location/);
  assert.match(ballarat, /href="\/areas\/geelong"/);
  assert.doesNotMatch(ballarat, /google\.com\/maps/);
  const bendigo = page('/areas/bendigo').html;
  assert.match(bendigo, /No on-call service on Sunday nights/);
  assert.match(bendigo, /not a published 24-hour hospital/);
  const warragul = page('/areas/warragul').html;
  assert.match(warragul, /No other Gippsland town is listed/);
  assert.match(warragul, /Friday 6 pm to Monday 8 am/);
  assert.doesNotMatch(warragul, /holidays\.\./);
  const twentyFour = page('/24-hour-emergency-vets').html;
  for (const clinic of clinics.filter(c => c.service_type === 'hospital_24h')) assert.match(twentyFour, new RegExp(`tel:${clinic.phone}`));
  for (const clinic of clinics.filter(c => c.service_type !== 'hospital_24h')) assert.doesNotMatch(twentyFour, new RegExp(`tel:${clinic.phone}`));
  assert.match(twentyFour, /href="\/areas\/ballarat"/);
  assert.match(twentyFour, /href="\/areas\/bendigo"/);
  assert.match(twentyFour, /href="\/areas\/warragul"/);
  const descriptions = site.pages.map(item => meta(item.html, 'description'));
  assert.equal(new Set(descriptions).size, descriptions.length);
});

test('sitemap lists every public URL with data-derived lastmod', () => {
  const entries = sitemapEntries(site.sitemap);
  assert.equal(entries.length, 22);
  assert.equal(new Set(entries.map(entry => entry.loc)).size, entries.length);
  const byLoc = Object.fromEntries(entries.map(entry => [entry.loc, entry.lastmod]));
  assert.equal(byLoc[`${SITE}/`], '2026-09-19');
  assert.equal(byLoc[`${SITE}/information`], INFORMATION_LASTMOD);
  assert.equal(byLoc[`${SITE}/clinics/advanced-kensington`], '2026-09-19');
  assert.equal(byLoc[`${SITE}/clinics/arh-essendon`], '2026-09-05');
  assert.equal(byLoc[`${SITE}/clinics/ballarat-pet-farm`], '2026-09-05');
  assert.equal(byLoc[`${SITE}/areas/ballarat`], '2026-09-05');
  assert.equal(byLoc[`${SITE}/areas/bendigo`], '2026-09-19');
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
  assert.match(readme, /All 14 clinic records are website-checked/);
  const research = readFileSync(new URL('../research/DIRECTORY-RESEARCH.md', import.meta.url), 'utf8');
  assert.equal(research.includes('victoria-clinics.seed.json'), false);
  assert.match(research, /public\/data\/clinics\.json/);
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  assert.equal(vercel.cleanUrls, true);
  assert.equal(vercel.trailingSlash, false);
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
