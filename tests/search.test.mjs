import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {formatPhone, schemaTelephone, serviceLabel} from '../public/present.js';
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
test('regional searches rank a listed local clinic and do not invent one for towns with none',()=>{
 for(const name of ['Mildura','Wodonga','Warrnambool','Bairnsdale']){
  const origin=matchSuburbs(suburbs,name)[0];
  const nearest=rankClinics(clinics,origin)[0];
  assert.ok(nearest.distance<25, `${name} ${nearest.id} ${nearest.distance}`);
 }
 const benalla=matchSuburbs(suburbs,'Benalla')[0];
 assert.notEqual(rankClinics(clinics,benalla)[0].suburb,'Benalla');
 const castlemaine=matchSuburbs(suburbs,'Castlemaine')[0];
 assert.notEqual(rankClinics(clinics,castlemaine)[0].suburb,'Castlemaine');
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
 assert.ok(filtered.some(c=>c.id==='geelong-emergency'));
 assert.ok(filtered.some(c=>c.id==='aec-frankston'));
 assert.ok(!filtered.some(c=>c.id==='central-bendigo'||c.id==='gippsland-warragul'));
 assert.ok(filtered.some(c=>c.id==='penvet-emergency-mornington'));
 const after=rankClinics(clinics,null,'after');
 assert.ok(after.some(c=>c.service_type==='after_hours_on_call'));
 assert.ok(after.some(c=>c.service_type==='after_hours_rotating'));
 assert.ok(after.some(c=>c.id==='benetook-veterinary-clinic-mildura'&&c.service_type==='after_hours_limited'));
 assert.ok(after.every(c=>c.service_type!=='hospital_24h'));
 assert.equal(rankClinics([{id:'x',name:'X',service_type:'on_call',verification_status:'website_checked'}],null,'after').length,1);
 assert.equal(rankClinics([{id:'x',name:'X',service_type:'after_hours_limited',verification_status:'website_checked'}],null,'24h').length,0);
 assert.equal(serviceLabel({service_type:'after_hours_limited'}),'Limited after-hours service');
 assert.equal(serviceLabel({service_type:'on_call'}),'After-hours & on-call');
 assert.equal(serviceLabel({service_type:'rotating'}),'Call-first service');
 assert.equal(formatPhone('1800387543'),'1800 387 543');
 assert.equal(schemaTelephone('1800387543'),'+611800387543');
});
test('unresolved and rotating destinations never produce directions',()=>{
 for(const c of clinics.filter(c=>c.verification_status==='needs_review'||c.service_type.includes('rotating')||c.service_type.includes('on_call')))assert.equal(directionsUrl(c),null);
 assert.ok(directionsUrl(clinics.find(c=>c.id==='benetook-veterinary-clinic-mildura')).includes('Benetook'));
 assert.ok(directionsUrl(clinics.find(c=>c.id==='advanced-kensington')).startsWith('https://www.google.com/maps/dir/?api=1&destination='));
});
test('data has unique IDs, valid phone links and no invented real-time status',()=>{
 assert.equal(new Set(clinics.map(c=>c.id)).size,clinics.length);
 for(const c of clinics){assert.match(c.phone,/^(0\d{9}|1300\d{6}|1800\d{6})$/);assert.equal(c.accepting_patients_now,null);assert.equal(c.automated_open_now_enabled,false);assert.equal(c.state,'VIC');assert.equal(typeof c.existing_clients_only,'boolean');assert.ok(c.region);assert.equal(c.coordinate_precision,'suburb_centroid');assert.equal(typeof c.locality_coordinates.lat,'number');}
 const clientsOnly=clinics.filter(c=>c.existing_clients_only).map(c=>c.id).sort();
 assert.deepEqual(clientsOnly,['family-vet-centre-wodonga','moe-veterinary-centre','traralgon-veterinary-centre']);
 const milduraSuburb=suburbs.find(s=>s.name==='Mildura'&&s.postcode==='3500');
 assert.deepEqual(clinics.find(c=>c.id==='mildura-veterinary-hospital').locality_coordinates,{lat:milduraSuburb.lat,lon:milduraSuburb.lon});
 const maffra=clinics.find(c=>c.id==='gippsland-vet-hospital-maffra');
 assert.equal(maffra.postcode,null);
 assert.equal(maffra.locality_coordinates.lat,suburbs.find(s=>s.name==='Maffra').lat);
 for(const id of ['your-family-vet-horsham','shepparton-kialla-vets'])assert.equal(clinics.some(c=>c.id===id),false);
 assert.equal(JSON.stringify(clinics).includes('Eureka Veterinary'),false);
 assert.ok(suburbs.every(s=>s.lat<0&&s.lon>0&&/^\d{4}$/.test(s.postcode)));
});

