import {cp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {generateSite} from './pages.mjs';

const clinicsDoc = JSON.parse(await readFile('public/data/clinics.json', 'utf8'));
const suburbs = JSON.parse(await readFile('public/data/suburbs.json', 'utf8'));
if (!clinicsDoc.clinics?.length || !suburbs.length) throw new Error('Missing directory data');
const indexHtml = await readFile('public/index.html', 'utf8');
const site = generateSite({clinics: clinicsDoc.clinics, indexHtml});

await rm('dist', {recursive: true, force: true});
await mkdir('dist', {recursive: true});
await cp('public', 'dist', {recursive: true});
await writeFile('dist/index.html', site.indexHtml);
await writeFile('dist/sitemap.xml', site.sitemap);
await writeFile('dist/404.html', site.notFoundHtml);
for (const page of site.pages) {
  const file = join('dist', page.file);
  await mkdir(dirname(file), {recursive: true});
  await writeFile(file, page.html);
}
const vicSuburbs = suburbs.filter(suburb => suburb.state === 'VIC').length;
const nswSuburbs = suburbs.filter(suburb => suburb.state === 'NSW').length;
console.log(`Built ${clinicsDoc.clinics.length} clinic records, ${site.pages.length} generated pages and ${suburbs.length} locality/postcode entries (${vicSuburbs} VIC, ${nswSuburbs} NSW).`);
