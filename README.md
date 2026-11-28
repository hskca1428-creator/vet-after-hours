# Vet After Hours

Mobile-first emergency-vet locator for vetafterhours.au. 87 website-checked clinic records: Victoria, Greater Sydney in NSW, South East Queensland (Brisbane, Gold Coast and Sunshine Coast), and Greater Perth in WA. 2,933 Victorian, 1,317 Greater Sydney, 1,006 South East Queensland and 450 Greater Perth locality/postcode entries. Other states are not covered yet. Free, no accounts or paid ranking.

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
- Coverage is not every Victorian town, not every Greater Sydney suburb, not every South East Queensland suburb, and not every Greater Perth suburb. Do not advertise complete state or national coverage. Victorian regional clinic websites and Greater Sydney clinics were checked on 26 November 2026. South East Queensland and Greater Perth clinics were checked on 28 November 2026. Towns without a clear official after-hours statement are not listed. Other states are not listed yet. South Australia, Tasmania, the Australian Capital Territory and the Northern Territory are not listed.
- All 87 clinic records are website-checked. Metro Victorian records were first reviewed on 5 September 2026; some published hours were clarified on 19 September 2026. Regional Victorian records and Greater Sydney records were reviewed on 26 November 2026. South East Queensland and Greater Perth records were reviewed on 28 November 2026. No telephone verification or live intake status.
- Coordinates refer to suburb centres, not clinic street entrances. Distances are approximate straight-line estimates. Geocode actual treatment addresses before claiming nearest-clinic precision.
- Geolocation uses proximity to Victorian, Greater Sydney, South East Queensland and Greater Perth localities as a coarse service-area check, not a legal state-boundary polygon.
- Species eligibility and public-holiday schedules need confirmation. Scheduled-open status, when a record enables it, uses that clinic’s IANA timezone. Every current record keeps `automated_open_now_enabled` false, so the site does not show an open-now badge.
- No analytics, newsletters, third-party AI calls or accounts have been enabled.
- Review public privacy wording against actual hosting and email handling before launch.

## Pages

`npm run build` copies public/ to dist/ and generates the crawlable HTML:

- Prerendered homepage, so clinic names, suburbs, phone numbers, service types and hours are in the file before JavaScript runs. Suburb search, filters and geolocation still replace that list after app.js loads.
- One page per clinic at /clinics/<id>.
- Area pages generated from each clinic's `region`. Victoria: /areas/melbourne, /areas/mornington-peninsula, /areas/yarra-valley, /areas/geelong, /areas/colac, /areas/ballarat, /areas/bendigo, /areas/hume, /areas/loddon-mallee, /areas/wimmera and /areas/gippsland. Greater Sydney: /areas/inner-sydney-and-eastern-suburbs, /areas/inner-west, /areas/north-shore-and-northern-beaches, /areas/hills-and-north-west, /areas/western-sydney, /areas/south-west-sydney, /areas/st-george-and-sutherland, /areas/central-coast and /areas/blue-mountains. South East Queensland: /areas/brisbane-north-and-moreton-bay, /areas/brisbane-south-logan-and-redlands, /areas/brisbane-west-and-ipswich, /areas/gold-coast and /areas/sunshine-coast. Greater Perth: /areas/perth-north-and-joondalup, /areas/perth-inner-and-north-central, /areas/perth-south-and-fremantle, /areas/perth-south-east-and-hills, /areas/perth-north-east-and-swan, /areas/rockingham-and-kwinana and /areas/peel-and-mandurah. /areas/warragul redirects to /areas/gippsland.
- State pages: /states/vic, /states/nsw, /states/qld and /states/wa. /vic, /nsw, /qld and /wa redirect to those pages. The NSW page lists Greater Sydney only. The QLD page lists South East Queensland only (Brisbane, Gold Coast and Sunshine Coast). The WA page lists Greater Perth only, including Peel and Mandurah.
- /24-hour-emergency-vets for the published round-the-clock hospitals in Victoria, Greater Sydney, South East Queensland and Greater Perth.
- dist/sitemap.xml and dist/404.html.

Vercel serves the extensionless paths via cleanUrls and uses dist/404.html for unknown URLs.

## Data maintenance

Edit public/data/clinics.json. Keep source_checked_on distinct from clinic_confirmed_on; preserve null for unknowns. A website review must not be presented as live confirmation. Set directions_enabled only after resolving the actual treatment destination. Never direct to a rotating provider without caller confirmation. Set existing_clients_only only when the clinic website limits after-hours care to existing clients. region groups clinics onto area pages. Every record has state and an IANA timezone: Australia/Melbourne for VIC, Australia/Sydney for NSW, Australia/Brisbane for QLD, Australia/Perth for WA. Queensland and Western Australia do not use daylight saving. During AEDT, Perth is three hours behind Melbourne and two hours behind Brisbane.

Locality data: Victorian names, postcodes and centres from joelkoen/postcodes-au, retrieved 15 September 2026, with state VIC added. Greater Sydney names, postcodes and centres from Matthew Proctor’s Australian Postcodes (https://github.com/matthewproctor/australianpostcodes), credited as CC0, retrieved 26 November 2026. South East Queensland names, postcodes and centres are from the same Matthew Proctor list, credited as CC0, retrieved 28 November 2026, covering Greater Brisbane, the Gold Coast and the Sunshine Coast. Greater Perth names, postcodes and centres are from the same Matthew Proctor list, credited as CC0, retrieved 28 November 2026, covering the Perth metropolitan area including Peel and Mandurah. Data copyright and source links are reproduced in public/information.html. Victorian coordinates are averaged locality coordinates derived from G-NAF, not Australia Post's licensed directory or precise routing data. Some Greater Sydney, South East Queensland and Greater Perth postcode groups share a coarse centroid.

## Deployment

Use a dedicated Vercel project connected to hskca1428-creator/vet-after-hours. Deploy a preview branch before production. Keep existing Titan MX/TXT records when configuring the domain. No DNS changes are required for previews.
