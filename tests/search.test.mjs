import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {matchSuburbs,rankClinics,directionsUrl,distanceKm} from '../public/search.js';
const suburbs=JSON.parse(readFileSync(new URL('../public/data/suburbs.json',import.meta.url)));
const {clinics}=JSON.parse(readFileSync(new URL('../public/data/clinics.json',import.meta.url)));
test('finds suburb names, exact rendered selections and shared postcodes',()=>{
 assert.equal(matchSuburbs(suburbs,'Richmond')[0].name,'Richmond');
 assert.equal(matchSuburbs(suburbs,'Richmond, VIC 3121')[0].postcode,'3121');
 assert.ok(matchSuburbs(suburbs,'3068').length>1);
 assert.equal(matchSuburbs(suburbs,'zzzxunknown').length,0);
 assert.equal(matchSuburbs(suburbs,'').length,0);
});
test('regional searches exist without fabricating local clinics',()=>{
 for(const name of ['Mildura','Wodonga','Warrnambool','Bairnsdale'])assert.ok(matchSuburbs(suburbs,name).length);
 const mildura=matchSuburbs(suburbs,'Mildura')[0];
 assert.ok(rankClinics(clinics,mildura)[0].distance>100);
});
test('distances are symmetrical, zero at origin, and Geelong results come first nearby',()=>{
 const a={lat:-37,lon:145},b={lat:-38,lon:144};
 assert.equal(distanceKm(a,a),0);assert.ok(Math.abs(distanceKm(a,b)-distanceKm(b,a))<.001);
 const origin=matchSuburbs(suburbs,'South Geelong')[0];
 assert.equal(rankClinics(clinics,origin)[0].id,'geelong-emergency');
});
test('24-hour filter excludes unreviewed hours',()=>{
 const filtered=rankClinics(clinics,null,'24h');assert.ok(filtered.length);
 assert.ok(filtered.every(c=>c.verification_status==='website_checked'&&c.service_type==='hospital_24h'));
 assert.ok(!filtered.some(c=>c.id==='geelong-emergency'));
});
test('unresolved and rotating destinations never produce directions',()=>{
 for(const c of clinics.filter(c=>c.verification_status==='needs_review'||c.service_type.includes('rotating')))assert.equal(directionsUrl(c),null);
 assert.ok(directionsUrl(clinics.find(c=>c.id==='advanced-kensington')).startsWith('https://www.google.com/maps/dir/?api=1&destination='));
});
test('data has unique IDs, valid phone links and no invented real-time status',()=>{
 assert.equal(new Set(clinics.map(c=>c.id)).size,clinics.length);
 for(const c of clinics){assert.match(c.phone,/^(0\d{9}|1300\d{6})$/);assert.equal(c.accepting_patients_now,null);assert.equal(c.automated_open_now_enabled,false);assert.equal(c.state,'VIC');}
 assert.ok(suburbs.every(s=>s.lat<0&&s.lon>0&&/^\d{4}$/.test(s.postcode)));
});
