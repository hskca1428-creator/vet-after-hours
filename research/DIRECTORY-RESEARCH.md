# Victorian emergency vet locator — first research pass

Research date: 5 September 2026. Free public MVP; no accounts, advertising, sponsored rankings or monetization in this version.

## Deliverable
The September 2026 deliverable was 14 service records in [public/data/clinics.json](../public/data/clinics.json), with official source URLs, contact numbers, service distinctions and review notes. This is a starting directory, not complete Victorian coverage. Website checks do not establish current patient intake or constitute telephone verification. No clinics were contacted.

The table below is the 5 September 2026 research snapshot. Its review column is historical. Those 14 records are `website_checked` in `public/data/clinics.json` (some hours were clarified on 19 September 2026). A 26 November 2026 regional pass added further website-checked records. Use the JSON file, not this table, for the live list.

## Initial directory
| Service | Suburb | Published service | Review |
|---|---|---|---|
| [Advanced Vetcare Kensington](https://advancedvetcare.com.au/contact/) | Kensington | 24 hours | website_checked |
| [Advanced Vetcare Kew](https://advancedvetcare.com.au/contact/) | Kew | 24 hours | needs_review |
| [Animal Referral Hospital Essendon Fields](https://www.emergencyvet.com.au/our-network/melbourne-locations.html) | Essendon Fields | 24/7 | website_checked |
| [Centre for Animal Referral & Emergency](https://www.emergencyvet.com.au/our-network/melbourne-locations.html) | Collingwood | Network describes 24/7 Melbourne services; branch hours need checking | needs_review |
| [Animal Emergency Centre Mount Waverley](https://www.emergencyvet.com.au/our-network/aec-home/aec-mt-waverley.html) | Mount Waverley | 24/7 including public holidays | website_checked |
| [Veterinary Referral Hospital](https://www.emergencyvet.com.au/our-network/melbourne-locations.html) | Dandenong | 24 hours | website_checked |
| [Animal Emergency Centre Moorabbin](https://www.emergencyvet.com.au/our-network/melbourne-locations.html) | Highett | 24 hours | website_checked |
| [Greencross Vet Hospital](https://www.greencrossvets.com.au/vets/greencrossvethospital/) | Werribee | 24/7 emergency service | website_checked |
| [Animal Emergency Centre Frankston](https://www.emergencyvet.com.au/our-network/melbourne-locations.html) | Frankston | After-hours service; exact branch hours pending | needs_review |
| [Geelong Animal Emergency](https://www.geelonganimalemergency.com.au/contact-us/) | South Geelong | Own contact page advertises 24/7 onsite staff | needs_review |
| [Geelong Animal Referral Services](https://garsvets.com.au/services/emergency-and-critical-care/) | Newtown | 24/7 emergency service | website_checked |
| [Ballarat Pet + Farm Vet after-hours pathway](https://www.ballaratpetfarmvet.com.au/afterhours) | Delacombe | Mon-Fri 18:00-midnight; weekends/public holidays 08:00-midnight | website_checked |
| [Central Veterinary Emergency](https://www.centralvetemergency.com/) | Kennington | Detailed section: Fri 18:00-midnight; Sat/Sun 08:30-midnight; limited overnight on-call | needs_review |
| [Gippsland Pet Emergency](https://gippslandpetemergency.com.au/) | Warragul | Main text: Friday 18:00-Monday 08:00 plus public holidays | needs_review |

## Findings affecting the product
- An advertised 24-hour hospital, a staffed evening service and an on-call arrangement need distinct labels.
- Ballarat Pet + Farm Vet directs callers to another provider after midnight. Its normal street address must not automatically become the after-hours destination.
- Central Veterinary Emergency has internally inconsistent time labels and Sunday overnight restrictions. Do not generate open-now status until resolved.
- Gippsland Pet Emergency has conflicting Friday versus Saturday start times on the same page.
- Advanced Vetcare Kew formats its street address two ways. Verify the entrance for navigation.
- Geelong Animal Emergency advertises 24/7 on its indexed contact page, while referring clinic websites publish different hours. Direct retrieval failed during this pass; keep under review.
- AEC Moorabbin is physically listed in Highett. Store service name and locality separately.
- Null postcodes, coordinates, species and intake status are deliberately unknown, not negative answers.

## Regional pass, 26 November 2026

Official clinic websites were checked for regional Victoria. Confirmed after-hours, on-call, rotating and 24-hour services were added to `public/data/clinics.json`, with `region` and `existing_clients_only`.

Not added, because the page was uncertain, thin, or not a separate service:

- Your Family Vet, Horsham: the after-hours page does not say a local vet is rostered.
- Shepparton and Kialla Veterinary Clinics: VetChat / local on-call wording was in the page source and not in the rendered emergencies text.
- Grampians Vet, Hamilton: after-hours calls are answered by Vetriage, without a clear local attendance statement.
- Seymour Veterinary Surgery: generic template text and no after-hours number. Victorian Central Vet Group in Seymour is listed instead.
- GV Vets, Shepparton: no after-hours or on-call process on the homepage.
- Bacchus Marsh: no official clinic website with current after-hours wording.
- Ballarat Eureka / Ballarat Veterinary Practices roster: it overlaps the existing Ballarat pathway, and the published weekend location and after-midnight destination disagree. It was not added as a second Ballarat service.

Maffra's own site prints postcode 3830. That postcode is omitted; Maffra's locality postcode is 3860. Sale's emergency page still mixes business hours into an after-hours line, so those clock times are omitted. Wangaratta Veterinary Clinic's Friday daytime closing time still conflicts between page sections, so Friday daytime hours are omitted.

Towns checked with no qualifying official after-hours service included Benalla, Ararat, Castlemaine, Gisborne, Sunbury, Torquay, Stawell and Kilmore. Coverage is still not every Victorian clinic.

Further official leads:
- [VicVet Whittlesea](https://vicvet.au/): advertises 24/7 emergency; complete address verification.
- [Peninsula Vet Care](https://penvetcare.com.au/contact/): investigate emergency hospital branch details.
- [Gippsland Veterinary Group](https://www.gippsvet.com.au/emergency-and-hospitalisation.html): distinguish after-hours care from continuous overnight monitoring.
- [Eureka after-hours](https://www.eurekavet.com.au/afterhours-vet-care): resolve routing/shared coverage before adding a separate destination.
- [Ballarat Veterinary Practice](https://bvp.com.au/small-animals/companion-animal-clinic-services/): lists an overnight call pathway; verify actual treatment location and hours.

## Data rules for the build
1. Official clinic branch pages take priority over generic directory listings. Preserve conflicting evidence for review.
2. Use each clinic’s IANA timezone (Australia/Melbourne for Victoria, Australia/Sydney for New South Wales, Australia/Brisbane for Queensland, Australia/Perth for Western Australia, Australia/Adelaide for South Australia). Queensland and Western Australia do not observe daylight saving. A Brisbane clinic stays on Australian Eastern Standard Time (UTC+10) when Sydney and Melbourne are on AEDT (UTC+11). A Perth clinic stays on Australian Western Standard Time (UTC+8), three hours behind Melbourne during AEDT and two hours behind Brisbane. Adelaide is UTC+9:30 in standard time and UTC+10:30 during daylight saving, half an hour behind Melbourne in both seasons. Model schedules crossing midnight and public-holiday exceptions explicitly. Do not assume one state clock for every record.
3. Only calculate scheduled-open status from reviewed structured hours; never call this live availability. All seed records currently disable this calculation.
4. Leave unknown details null. Do not invent distances, travel times, species eligibility or wait times.
5. Support both website_checked and clinic_confirmed verification with separate dates. Display the actual level of verification.
6. On-call or rotating services need a call-first action; only show directions when the treatment destination is established.
7. Public copy should say the locator is free; veterinary treatment may incur clinic fees.

## Next implementation gate
Complete priority geographic gaps and resolve flagged details; verify dog/cat acceptance, geocode treatment destinations and choose a licensed Victorian suburb/postcode dataset. Then build suburb autocomplete and a mobile results list with call and directions actions. Keep statewide coverage claims off until coverage has been assessed.

Suggested ongoing process: review official sources weekly during pilot, immediately review reported errors, and flag aged records for rechecking. This is a proposed process, not a scheduled automation.

