import { cp, mkdir, readFile } from 'node:fs/promises';
const clinics = JSON.parse(await readFile('public/data/clinics.json', 'utf8'));
const suburbs = JSON.parse(await readFile('public/data/suburbs.json', 'utf8'));
if (!clinics.clinics.length || !suburbs.length) throw new Error('Missing directory data');
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
console.log(`Built ${clinics.clinics.length} clinic records and ${suburbs.length} Victorian locality/postcode entries.`);
