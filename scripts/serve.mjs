import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname, resolve, sep} from 'node:path';
import {AREA_REDIRECTS, generateSite} from './pages.mjs';

const root = resolve('public');
const port = Number(process.env.PORT) || 4173;
const mime = {'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.xml': 'application/xml'};

async function loadSite() {
  const clinicsDoc = JSON.parse(await readFile(resolve(root, 'data/clinics.json'), 'utf8'));
  const indexHtml = await readFile(resolve(root, 'index.html'), 'utf8');
  return generateSite({clinics: clinicsDoc.clinics, indexHtml});
}

function send(res, status, body, type) {
  res.writeHead(status, {'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store'}).end(body);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { send(res, 400, 'Bad request', 'text/plain'); return; }
    if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    const redirect = AREA_REDIRECTS.find(item => item.source === pathname);
    if (redirect) {
      res.writeHead(301, {Location: redirect.destination, 'Cache-Control': 'no-store'}).end();
      return;
    }
    const site = await loadSite();
    if (pathname === '/' || pathname === '/index.html') { send(res, 200, site.indexHtml, 'text/html'); return; }
    if (pathname === '/sitemap.xml') { send(res, 200, site.sitemap, 'application/xml'); return; }
    const page = site.pages.find(item => item.path === pathname || `${item.path}.html` === pathname);
    if (page) { send(res, 200, page.html, 'text/html'); return; }
    const rel = pathname === '/information' ? '/information.html' : pathname;
    const path = resolve(root, '.' + rel);
    if (path !== root && !path.startsWith(root + sep)) { send(res, 403, 'Forbidden', 'text/plain'); return; }
    try {
      const body = await readFile(path);
      const type = mime[extname(path)] || 'application/octet-stream';
      res.writeHead(200, {'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store'}).end(body);
    } catch {
      send(res, 404, site.notFoundHtml, 'text/html');
    }
  } catch {
    send(res, 500, 'The directory could not be served.', 'text/plain');
  }
}).listen(port, '127.0.0.1', () => console.log(`Vet After Hours preview: http://127.0.0.1:${port}`));
