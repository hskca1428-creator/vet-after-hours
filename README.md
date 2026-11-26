# Vet After Hours

Mobile-first Victorian emergency-vet locator for vetafterhours.au. 42 website-checked clinic records and 2,933 Victorian locality/postcode entries. Free, no accounts or paid ranking.

## Run

Node.js 22 or newer; no runtime dependencies or API keys required.

```
npm run dev
npm test
npm run build
```

Preview: http://127.0.0.1:4173. The dev server also serves generated clinic pages, area pages, the sitemap and the 404 page. Build output: dist/. Vercel configuration is included; framework preset Other, build npm run build, output dist, cleanUrls on, trailingSlash off.

## Current behavior

- Keyboard-accessible suburb/postcode suggestions; ambiguous postcodes require choosing a locality.
- Browser geolocation with permission and error handling. Coordinates stay in the browser.
- Service-type filters, distance sorting, expandable results, source details and call links.
- Report links open a draft email to hello@vetafterhours.au; no email is sent by the app.
- Clinic directions only for records with resolved, fixed destinations.
- Missing data requests show direct provider links rather than an empty screen.

## Important limits before public launch

- Production indexing is enabled. Canonical URLs use https://www.vetafterhours.au. The build writes dist/sitemap.xml, with lastmod taken from each clinic’s review dates, and public/robots.txt points at that sitemap.
- Coverage is not every Victorian town. Do not advertise comprehensive statewide service coverage. Regional clinic websites were checked on 26 November 2026. Towns without a clear official after-hours statement are not listed.
- All 42 clinic records are website-checked. Metro records were first reviewed on 5 September 2026; some published hours were clarified on 19 September 2026. Regional records were reviewed on 26 November 2026. No telephone verification or live intake status.
- Coordinates refer to suburb centres, not clinic street entrances. Distances are approximate straight-line estimates. Geocode actual treatment addresses before claiming nearest-clinic precision.
- Geolocation uses proximity to Victorian localities as a coarse service-area check, not a legal state-boundary polygon.
- Species eligibility and public-holiday schedules need confirmation. No automated open-now badge is implemented.
- No analytics, newsletters, third-party AI calls or accounts have been enabled.
- Review public privacy wording against actual hosting and email handling before launch.

## Pages

`npm run build` copies public/ to dist/ and generates the crawlable HTML:

- Prerendered homepage, so clinic names, suburbs, phone numbers, service types and hours are in the file before JavaScript runs. Suburb search, filters and geolocation still replace that list after app.js loads.
- One page per clinic at /clinics/<id>.
- Area pages generated from each clinic's `region`: /areas/melbourne, /areas/mornington-peninsula, /areas/yarra-valley, /areas/geelong, /areas/colac, /areas/ballarat, /areas/bendigo, /areas/hume, /areas/loddon-mallee, /areas/wimmera and /areas/gippsland. /areas/warragul redirects to /areas/gippsland.
- /24-hour-emergency-vets for the published round-the-clock hospitals.
- dist/sitemap.xml and dist/404.html.

Vercel serves the extensionless paths via cleanUrls and uses dist/404.html for unknown URLs.

## Data maintenance

Edit public/data/clinics.json. Keep source_checked_on distinct from clinic_confirmed_on; preserve null for unknowns. A website review must not be presented as live confirmation. Set directions_enabled only after resolving the actual treatment destination. Never direct to a rotating provider without caller confirmation. Set existing_clients_only only when the clinic website limits after-hours care to existing clients. region groups clinics onto area pages. state remains on every record for a later national list; this directory is still Victoria only.

Locality dataset: joelkoen/postcodes-au, retrieved 15 September 2026; only VIC entries retained. Data copyright and source links are reproduced in public/information.html. These are averaged locality coordinates derived from G-NAF, not Australia Post's licensed directory or precise routing data.

## Deployment

Use a dedicated Vercel project connected to hskca1428-creator/vet-after-hours. Deploy a preview branch before production. Keep existing Titan MX/TXT records when configuring the domain. No DNS changes are required for previews.
