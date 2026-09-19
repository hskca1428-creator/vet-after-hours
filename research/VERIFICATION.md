# First locator verification — 15 September 2026

Story: user selects a Victorian suburb or postcode, browser searches the local dataset, ranks clinic records by approximate suburb-centre distance, and presents direct contact links.

- Production build passed (14 clinic records; 2,933 locality/postcode entries).
- All six Node test cases passed: search/disambiguation, rural coverage, distance ranking, 24-hour filtering, destination restrictions and data invariants.
- Browser tested at mobile 390 × 844 and desktop 1440 × 1000.
- Richmond keyboard selection rendered matching location and distance-ranked results.
- Postcode 3068 required selection between Clifton Hill and Fitzroy North on Enter.
- Mildura search showed a 346 km nearest-listed-service estimate and an explicit incomplete-coverage message.
- Published 24-hour filter returned 7 website-checked hospital records.
- Unknown query produced an actionable search message.
- Browser geolocation timed out and correctly offered manual suburb entry. No permission was granted and no real coordinates were transmitted. Successful device geolocation was not exercised.
- No browser console errors were returned; mobile DOM check found no horizontal overflow.
- Phone, directions and correction-email link targets inspected; no calls made or emails sent.
- Agent-browser CLI could not connect to its browser service; browser checks completed using the connected in-app browser instead.
- Production deployment and live domain are not verified. Vercel connector returned no teams; requested project dashboard URL from owner.

Remaining release checks: clinic data confirmation, stronger regional coverage, accurate clinic geocoding, production hosting/privacy setup, and removal of preview noindex only when launch is approved.
