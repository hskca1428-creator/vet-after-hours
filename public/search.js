export function normalize(value) { return value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
export function matchSuburbs(suburbs, query) {
  const q = normalize(query);
  if (!q) return [];
  return suburbs.filter(s => normalize(`${s.name} VIC ${s.postcode}`).includes(q) || normalize(`${s.name} ${s.postcode}`).includes(q))
    .sort((a,b) => Number(normalize(b.name) === q) - Number(normalize(a.name) === q) || a.name.localeCompare(b.name)).slice(0,10);
}
export function distanceKm(a,b) {
  const r = Math.PI / 180;
  const dlat = (b.lat-a.lat)*r, dlon = (b.lon-a.lon)*r;
  const h = Math.sin(dlat/2)**2 + Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlon/2)**2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1,h)));
}
export function rankClinics(clinics, origin, filter='all') {
  return clinics.filter(c => filter === 'all' || (filter === '24h' ? c.service_type === 'hospital_24h' && c.verification_status === 'website_checked' : c.service_type !== 'hospital_24h'))
    .map(c => ({...c, distance:origin && c.locality_coordinates ? distanceKm(origin,c.locality_coordinates):null}))
    .sort((a,b) => origin ? (a.distance ?? Infinity)-(b.distance ?? Infinity) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
}
export function directionsUrl(clinic) {
  if (clinic.directions_enabled !== true) return null;
  return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(`${clinic.name}, ${clinic.address}, ${clinic.suburb} VIC ${clinic.postcode || ''}, Australia`);
}
