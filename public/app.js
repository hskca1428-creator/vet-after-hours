import {matchSuburbs, normalize, rankClinics, directionsUrl, distanceKm} from './search.js';
const $ = id => document.getElementById(id);
const state = {suburbs:[],clinics:[],origin:null,label:'',filter:'all',limit:5,matches:[],active:-1,ready:false};
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function closeSuggestions(){ $('suggestions').hidden=true; $('suburb').setAttribute('aria-expanded','false'); $('suburb').removeAttribute('aria-activedescendant'); state.active=-1; }
function suggest(){
 state.matches=matchSuburbs(state.suburbs,$('suburb').value); state.active=-1;
 $('suggestions').innerHTML=state.matches.map((s,i)=>`<li id="option-${i}" role="option" aria-selected="false" data-index="${i}">${escape(s.name)}<span>VIC ${escape(s.postcode)}</span></li>`).join('');
 $('suggestions').hidden=!state.matches.length; $('suburb').setAttribute('aria-expanded',String(!!state.matches.length)); $('suburb').removeAttribute('aria-activedescendant');
 if($('suburb').value.trim() && !state.matches.length) $('search-message').textContent='No matching Victorian suburb. Try the full suburb name or a postcode.'; else $('search-message').textContent='';
}
function selectSuburb(s){ state.origin={lat:s.lat,lon:s.lon};state.label=`${s.name}, VIC ${s.postcode}`;state.limit=5;$('suburb').value=state.label;closeSuggestions();$('search-message').textContent='';render();$('results-title').focus({preventScroll:true});$('results-title').scrollIntoView({behavior:'smooth',block:'start'}); }
function publicNote(c){
 if(c.id==='ballarat-pet-farm') return 'Call and press 1 for the treatment location. After midnight, callers are directed to Geelong or Melbourne.';
 if(c.id==='central-bendigo') return 'No on-call service on Sunday nights due to staffing shortages. You may be referred to a Melbourne clinic. Call to arrange on-call care.';
 return '';
}
function card(c){
 const reviewed=c.verification_status==='website_checked', dir=directionsUrl(c);
 const type=c.service_type==='hospital_24h'?'Published 24-hour hospital':c.service_type.includes('on_call')?'After-hours & on-call':c.service_type.includes('rotating')?'Call-first service':'After-hours service';
 const date=new Date(c.source_checked_on+'T12:00:00Z').toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric',timeZone:'Australia/Melbourne'});
 const note=publicNote(c);
 const report='mailto:hello@vetafterhours.au?subject='+encodeURIComponent('Listing correction: '+c.name)+'&body='+encodeURIComponent('Clinic: '+c.name+'\nListing ID: '+c.id+'\n\nWhat needs correcting?\n\nSource or supporting details:\n');
 const phone=c.phone.startsWith('1300')?c.phone.replace(/(\d{4})(\d{3})(\d{3})/,'$1 $2 $3'):c.phone.replace(/(\d{2})(\d{4})(\d{4})/,'$1 $2 $3');
 return `<article class="card"><div class="card-top"><span class="badge ${reviewed?'':'review'}">${escape(reviewed?type:'Call to confirm')}</span>${c.distance!==null?`<span class="distance">≈ ${Math.max(1,Math.round(c.distance))} km · suburb estimate</span>`:''}</div><h3>${escape(c.name)}</h3><p class="address">${escape(c.address)}, ${escape(c.suburb)} VIC ${escape(c.postcode)}</p>${c.hours_lines ? '<ul class="hours">'+c.hours_lines.map(line=>'<li>'+escape(line)+'</li>').join('')+'</ul>' : '<p class="hours">'+escape(c.public_hours || c.published_hours_summary)+'</p>'}<p class="details">Hours and availability may change, including on public holidays. Call the clinic to confirm before travelling.</p>${note?`<p class="notice">${escape(note)}</p>`:''}<div class="card-actions"><a class="button primary" href="tel:${escape(c.phone)}" aria-label="Call ${escape(c.name)} on ${phone}">Call ${phone} <span aria-hidden="true">↗</span></a>${dir?`<a class="button secondary" href="${escape(dir)}" target="_blank" rel="noopener noreferrer" aria-label="Get directions to ${escape(c.name)} (opens Google Maps)">Get directions <span aria-hidden="true">↗</span></a>`:`<a class="button secondary" href="${escape(c.source_url)}" target="_blank" rel="noopener noreferrer">Clinic website ↗</a>`}</div><div class="card-meta"><span>Website reviewed ${escape(date)}${c.hours_updated_on ? ' · Hours clarified 19 Sept 2026' : ''}${reviewed?'':' · Details need confirmation'}</span><a href="${escape(report)}">Report an issue</a></div><details class="details"><summary>Source & verification details</summary><p>${escape(type)}. Published website information${c.hours_updated_on ? ' with hours clarified from details supplied by the directory owner' : ''}. The clinic has not confirmed live availability. Confirm dog or cat acceptance by phone.</p><a href="${escape(c.source_url)}" target="_blank" rel="noopener noreferrer">View the original clinic source ↗</a></details></article>`;
}
function render(){
 const rows=rankClinics(state.clinics,state.origin,state.filter);
 $('results-title').textContent=state.origin?'Services near '+state.label:'Explore the directory';
 $('results-summary').textContent=state.origin?`${rows.length} listed services · Ordered by approximate distance between suburb centres`:`${rows.length} listed services · Choose a suburb to sort by approximate distance`;
 $('reset').hidden=!state.origin;
 const nearest=rows.find(c=>c.distance!==null)?.distance;
 $('coverage-note').textContent=state.origin && nearest>50?`Our closest listed service is approximately ${Math.round(nearest)} km away, measured between suburb centres. This directory is incomplete: closer services may exist. Call your regular vet for its after-hours arrangements.`:'Initial Victorian directory. Regional coverage is incomplete; closer services may be missing. Call to confirm availability. Distances are not driving distances.';
 $('results').innerHTML=rows.length?rows.slice(0,state.limit).map(card).join(''):'<div class="empty"><h3>No services in this category</h3><p>Try All services. Our directory is still growing, so an empty result does not mean care is unavailable.</p></div>';
 $('results').setAttribute('aria-busy','false');$('show-more').hidden=rows.length<=state.limit;
 $('show-more').textContent=`Show more clinics (${Math.max(0,rows.length-state.limit)} remaining)`;
}
$('results-title').tabIndex=-1;
$('suburb').addEventListener('input',suggest);
$('suburb').addEventListener('keydown',e=>{
 if(e.key==='Escape'){closeSuggestions();return;}
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){
  if(!state.matches.length)return;e.preventDefault();$('suggestions').hidden=false;$('suburb').setAttribute('aria-expanded','true');
  state.active=(state.active+(e.key==='ArrowDown'?1:-1)+state.matches.length)%state.matches.length;
  for(const [i,li] of [...$('suggestions').children].entries())li.setAttribute('aria-selected',String(i===state.active));
  $('suburb').setAttribute('aria-activedescendant','option-'+state.active);$('option-'+state.active).scrollIntoView({block:'nearest'});
 }
 if(e.key==='Enter'&&state.active>=0){e.preventDefault();selectSuburb(state.matches[state.active]);}
});
$('suggestions').addEventListener('click',e=>{const li=e.target.closest('[data-index]');if(li)selectSuburb(state.matches[Number(li.dataset.index)]);});
document.addEventListener('click',e=>{if(!e.target.closest('.input-wrap'))closeSuggestions();});
$('search-form').addEventListener('submit',e=>{
 e.preventDefault();if(!state.ready)return;
 const q=normalize($('suburb').value);const found=matchSuburbs(state.suburbs,q);
 const exact=found.filter(s=>normalize(`${s.name} VIC ${s.postcode}`)===q || normalize(s.name)===q);
 if(exact.length===1)selectSuburb(exact[0]);else if(found.length===1)selectSuburb(found[0]);else{suggest();$('suburb').focus();$('search-message').textContent=found.length?'Select your suburb from the suggestions.':'Enter a Victorian suburb or postcode to find services.';}
});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.filter;state.limit=5;document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(state.ready)render();}));
$('show-more').addEventListener('click',()=>{state.limit+=5;render();});
$('reset').addEventListener('click',()=>{state.origin=null;state.label='';state.limit=5;$('suburb').value='';$('search-message').textContent='';closeSuggestions();render();$('suburb').focus();});
$('locate').addEventListener('click',()=>{
 if(!navigator.geolocation){$('search-message').textContent='Location is unavailable in this browser. Enter your suburb instead.';return;}
 $('locate').disabled=true;$('search-message').textContent='Waiting for location permission…';
 navigator.geolocation.getCurrentPosition(pos=>{
  $('locate').disabled=false;const origin={lat:pos.coords.latitude,lon:pos.coords.longitude};
  const nearest=state.suburbs.reduce((a,b)=>distanceKm(origin,a)<distanceKm(origin,b)?a:b);
  if(distanceKm(origin,nearest)>50){$('search-message').textContent='Your location appears outside our Victorian search area. Enter a Victorian suburb instead.';return;}
  state.origin=origin;state.label='your location';state.limit=5;$('suburb').value='';closeSuggestions();$('search-message').textContent='Location used only in this browser. Distances are estimates to clinic suburb centres.';render();
 },err=>{$('locate').disabled=false;$('search-message').textContent=err.code===1?'Location permission was not granted. Enter your suburb instead.':'We couldn’t determine your location. Enter your suburb instead.';},{timeout:10000,maximumAge:60000,enableHighAccuracy:false});
});
try{
 const responses=await Promise.all([fetch('/data/clinics.json'),fetch('/data/suburbs.json')]);
 if(responses.some(r=>!r.ok))throw Error('Directory request failed');
 const [directory,suburbs]=await Promise.all(responses.map(r=>r.json()));state.clinics=directory.clinics;state.suburbs=suburbs;state.ready=true;
 for(const id of ['suburb','find','locate'])$(id).disabled=false;$('search-message').textContent='';render();
}catch{
 $('search-message').textContent='The directory could not load. Please reload the page or use the clinic links below.';$('results-summary').textContent='Directory temporarily unavailable';$('results').setAttribute('aria-busy','false');
 $('results').innerHTML='<div class="empty"><h3>Contact a provider directly</h3><p>You can check the Melbourne emergency hospital network or call Advanced Vetcare Kensington on 03 9092 0400. Confirm availability before travelling.</p><a class="button primary" href="tel:0390920400">Call 03 9092 0400</a><br><a href="https://www.emergencyvet.com.au/our-network/melbourne-locations.html">Find Melbourne emergency hospitals ↗</a></div>';
}

