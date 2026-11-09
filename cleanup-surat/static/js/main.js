const E=window.ENV||{},$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const T0=Date.now(),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(m,ok=true){const t=document.createElement('div');t.className='toast '+(ok?'ok':'err');t.setAttribute('role','status');t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),4000)}
// Supabase client (auth-ready: use sb.auth.signInWithOtp / signUp when adding login)
const sb=E.url&&window.supabase?window.supabase.createClient(E.url,E.key):null;window.sb=sb;
addEventListener('load',()=>$('#loader').classList.add('done'));
$('#theme').onclick=()=>{const d=document.documentElement,n=d.dataset.theme==='dark'?'light':'dark';d.dataset.theme=n;localStorage.setItem('theme',n)};
$('#menuBtn').onclick=e=>{const o=$('#menu').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
addEventListener('scroll',()=>{$('#nav').classList.toggle('s',scrollY>10);$('#top').classList.toggle('show',scrollY>500)},{passive:true});
$('#top').onclick=()=>scrollTo({top:0});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');const c=$('[data-count]',e.target);if(c&&!c.done){c.done=1;const n=+c.dataset.count,s=performance.now();(function f(t){const p=Math.min((t-s)/1500,1);c.textContent=Math.floor(n*p).toLocaleString()+(p>=1?'+':'');p<1&&requestAnimationFrame(f)})(s)}io.unobserve(e.target)}),{threshold:.2});
$$('.reveal').forEach(el=>io.observe(el));
// forms -> Supabase
$$('form[data-table]').forEach(f=>f.addEventListener('submit',async e=>{
 e.preventDefault();
 if(f.hp.value||Date.now()-T0<2500)return;
 if(Date.now()-(+localStorage.getItem('last')||0)<8000)return toast('Please wait a moment.',false);
 if(!f.checkValidity())return f.reportValidity();
 if(!sb)return toast('Supabase is not configured yet.',false);
 const btn=$('[type=submit]',f);btn.disabled=true;
 try{
  const fd=new FormData(f),d=Object.fromEntries(fd);delete d.hp;delete d.images;
  if(d.age)d.age=+d.age;Object.keys(d).forEach(k=>d[k]===''&&delete d[k]);
  const files=fd.getAll('images').filter(x=>x.size);
  if(files.length){const urls=[];for(const x of files.slice(0,5)){if(x.size>5e6)throw Error('Each image must be under 5MB');
   const p=`${Date.now()}-${Math.random().toString(36).slice(2)}-${x.name.replace(/[^\w.]/g,'_')}`;
   const {error}=await sb.storage.from('reports').upload(p,x);if(error)throw error;urls.push(sb.storage.from('reports').getPublicUrl(p).data.publicUrl)}d.image_url=urls.join(',')}
  const {error}=await sb.from(f.dataset.table).insert(d);if(error)throw error;
  localStorage.setItem('last',Date.now());f.reset();toast('Thank you! Submitted successfully.');f.dispatchEvent(new Event('saved'));
 }catch(err){toast(err.message||'Something went wrong. Try again.',false)}
 btn.disabled=false}));
// events
const box=$('[data-events]');
if(box&&sb){let all=[];const draw=()=>{const q=($('#q')?.value||'').toLowerCase(),a=($('#area')?.value||'').toLowerCase(),d=$('#dt')?.value;
 let l=all.filter(x=>((x.title||'')+(x.description||'')).toLowerCase().includes(q)&&(x.location||'').toLowerCase().includes(a)&&(!d||x.date.startsWith(d)));
 if(box.dataset.limit)l=l.slice(0,+box.dataset.limit);
 box.innerHTML=l.map(x=>{const dt=new Date(x.date);return`<article class="card ev">${x.image_url?`<img loading="lazy" src="${esc(x.image_url)}" alt="${esc(x.title)}">`:''}<h3>${esc(x.title)}</h3><small>📅 ${dt.toLocaleDateString()} ⏰ ${dt.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</small><br><small>📍 ${esc(x.location)}</small><p>${esc(x.description)}</p><a class="btn" href="/volunteer">Register</a></article>`}).join('')||'<p>No upcoming events found.</p>'};
 sb.from('events').select('*').gte('date',new Date().toISOString()).order('date').then(({data})=>{all=data||[];draw()});
 $$('.filters input').forEach(i=>i.oninput=draw)}
// gallery + lightbox
$$('[data-gallery]').forEach(g=>{const load=async cat=>{if(!sb)return;const {data}=await sb.storage.from('gallery').list(cat,{limit:+g.dataset.limit||100});
 g.innerHTML=(data||[]).filter(x=>/\.(jpe?g|png|webp|gif)$/i.test(x.name)).map(x=>{const u=sb.storage.from('gallery').getPublicUrl(`${cat}/${x.name}`).data.publicUrl;return`<img loading="lazy" src="${u}" alt="Cleanup Surat ${cat}">`}).join('')||'<p>No photos yet.</p>'};
 load(g.dataset.cat);$$('[data-tab]').forEach(b=>b.onclick=()=>{$$('[data-tab]').forEach(x=>x.classList.toggle('on',x===b));load(b.dataset.tab)});
 g.onclick=e=>{const lb=$('#lb');if(e.target.tagName==='IMG'&&lb){$('img',lb).src=e.target.src;lb.showModal()}}});
const lb=$('#lb');if(lb)lb.onclick=()=>lb.close();
// report: geolocation + map preview
const loc=$('#loc');if(loc){const m=()=>$('#map').src='https://maps.google.com/maps?q='+encodeURIComponent(loc.value)+'&output=embed';loc.onchange=m;
 $('#geo').onclick=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{loc.value=p.coords.latitude.toFixed(6)+','+p.coords.longitude.toFixed(6);m()},()=>toast('Location access denied.',false)):toast('Geolocation unsupported.',false)}

// adopt an item
const ib=$('[data-items]');
if(ib&&sb){
 const dlg=$('#adoptDlg'),af=$('#adoptForm');
 const load=async()=>{
  const {data,error}=await sb.from('items').select('*').order('created_at',{ascending:false});
  if(error){ib.innerHTML='<p>Could not load items. Please try again later.</p>';return}
  ib.innerHTML=(data||[]).map(x=>{const ok=x.status==='available';return`<article class="card item${ok?'':' gone'}">
  <div class="imgbox"><img loading="lazy" src="${esc(x.image_url)}" alt="${esc(x.name)}"><span class="badge${ok?' ok':''}">${ok?esc(x.condition):'Adopted'}</span></div>
  <h3>${esc(x.name)}</h3><small>${esc(x.category)} · ${esc(x.found_at)}</small><p>${esc(x.description)}</p>
  ${ok?`<button class="btn" data-id="${esc(x.id)}" data-name="${esc(x.name)}">Adopt this item</button>`:'<button class="btn" disabled>Already adopted</button>'}</article>`}).join('')||'<p>No items listed right now. Check back after our next drive!</p>'};
 load();
 ib.onclick=e=>{const b=e.target.closest('button[data-id]');if(!b)return;
  af.item_id.value=b.dataset.id;af.item_name.value=b.dataset.name;
  $('#adoptTitle').textContent='Adopt: '+b.dataset.name;dlg.showModal()};
 $('#adoptClose').onclick=()=>dlg.close();
 af.addEventListener('saved',()=>{dlg.close();load()});
}
