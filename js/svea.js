(function(){
'use strict';
const {$,$$,esc,kr,toast}=EU;
const now=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
const DAYS=['SÖNDAG','MÅNDAG','TISDAG','ONSDAG','TORSDAG','FREDAG','LÖRDAG'];
const SV={};
const stage=$('#p-svea .stage');
function init(){
  Object.assign(SV,{tab:'pause',pm:'home',play:false,modal:null,wp:null,secs:5400,online:23,cash:12450,bank:284900,openAcc:0,
    rid:4,invoices:[],
    players:[
     {id:1,n:'Ayo Zenxx',u:'ayozenxx',job:'Polis',grade:'Kommissarie',role:'admin',ms:24,cash:8200,bank:91000,cid:'SVA10001'},
     {id:4,n:'Erik Svensson',u:'Kallar',job:'Polis',grade:'Inspektör',ms:41,cash:12450,bank:284900,cid:'SVA12345'},
     {id:7,n:'Linnea Berg',u:'Linnebo',job:'Ambulans',grade:'Sjuksköterska',role:'staff',ms:33,cash:2300,bank:44100,cid:'SVA20417'},
     {id:12,n:'Ali Haddad',u:'xXSnabbXx',job:'Mekaniker',grade:'Lärling',ms:67,cash:1150,bank:12800,cid:'SVA31188'}],
    reports:[
     {id:3,type:'Bugg',from:'Erik Svensson',pid:4,status:'han',closed:false,chat:[{w:'Erik Svensson',t:'19:41',m:'Min bil försvann när jag loggade ut vid garaget på Legion.'},{sys:'ayozenxx tog ärendet · 19:42'},{w:'ayozenxx',me:1,t:'19:42',m:'Hej! Jag kollar det åt dig, står du kvar vid garaget?'},{w:'Erik Svensson',t:'19:43',m:'Ja, jag står vid ingången.'}]},
     {id:4,type:'Regelbrott',from:'Ali Haddad',pid:12,status:'open',closed:false,chat:[{w:'Ali Haddad',t:'19:45',m:'Någon kör över folk vid Mission Row hela tiden.'}]}],
    ad:{tab:'players',sel:4,q:'',ban:false,rtab:'open',rsel:3}});
  hudDefaults();hudSync();invRender();setTab('pause');badge();
}
function badge(){const n=SV.reports.filter(r=>!r.closed).length;$('#svBdg').textContent=n||'';}
function setTab(t){SV.tab=t;$$('[data-svv]').forEach(v=>v.hidden=v.dataset.svv!==t);$$('#svSeg button').forEach(b=>b.classList.toggle('on',b.dataset.sv===t));
  if(t==='pause')pmRender();if(t==='admin')adRender();}
$('#svSeg').addEventListener('click',e=>{const b=e.target.closest('[data-sv]');if(b)setTab(b.dataset.sv);});

/* ================= PAUSMENY ================= */
const GUIDE=[['Kom igång','Skapa din karaktär, hämta ut ditt ID-kort i stadshuset och ta bussen in till stan. Öppna telefonen med F1.'],['Hitta ett jobb','Gå till jobbcentret eller sök in till polisen, sjukvården eller mekanikerna via Discord.'],['Pengar & bank','Lön betalas till Nordvik Bank. Ta ut kontanter i bankomater och betala fakturor i telefonen.'],['Fordon','Köp bil hos bilhandlaren. Parkera i garaget innan du loggar ut så att den sparas.']];
const RULES=[['Respektera rollspelet','Bryt inte karaktär i onödan och håll OOC-snack till Discord.'],['Ingen RDM eller VDM','Döda eller kör inte över andra utan en tydlig rollspelsanledning.'],['Inget metagaming','Använd inte information från streams eller Discord i spelet.'],['Värdesätt ditt liv','Agera som om din karaktär är rädd för att dö.'],['Fusk = permanent bann','Moddmenyer, buggutnyttjande och exploits leder till bann.'],['Lyssna på staff','Följ staffs beslut i stunden och överklaga på Discord efteråt.']];
const KEYS=[['ESC','Pausmeny'],['F1','Telefon'],['F2','Inventarie'],['F3','Animationer'],['M','Karta'],['T','Chatt'],['L','Lås fordon'],['B','Bälte'],['X','Händer upp'],['K','Skicka report'],['Z','Röstavstånd'],['1-4','Flikar']];
const fmtT=s=>Math.floor(s/3600)+' h '+Math.floor(s%3600/60)+' min';
function pmRender(){
  const pm=$('#pm');const d=new Date();
  const nav=[['home','01','Hem'],['guide','02','Spelguide'],['keys','03','Tangenter'],['rules','04','Regler']];
  let main='';
  if(SV.pm==='home'){const p=SV.players.find(x=>x.id===4)||{cash:SV.cash,bank:SV.bank};
    main=`<div><div class="pm-when">${DAYS[d.getDay()]} · ${now()}</div><div class="pm-hi">Hej, <em>Erik</em></div></div>
    <div class="pm-g"><div class="pm-c"><span class="lab">DIN KARAKTÄR</span><span class="nm">Erik Svensson</span><span class="job"><i></i>Polis · Inspektör</span>
      <div class="pm-kv"><div><small>KONTANTER</small><b>${kr(p.cash)} kr</b></div><div><small>BANK</small><b>${kr(p.bank)} kr</b></div><div><small>MEDBORGAR-ID</small><b>SVA12345</b></div><div><small>TELEFON</small><b>0701234567</b></div></div></div>
     <div class="pm-c"><span class="lab">SERVERN</span><div class="pm-big" id="pmOnline">${SV.online}<small>/ 48 online</small></div><div class="pm-bar"><i id="pmBar" style="width:${(SV.online/48*100).toFixed(0)}%"></i></div>
      <div class="pm-kv"><div><small>DITT ID</small><b>4</b></div><div><small>SPELTID IDAG</small><b id="pmPlay">${fmtT(SV.secs)}</b></div></div></div></div>
    <button type="button" class="pm-map" data-pm="map"><span class="pm-ic" style="background:linear-gradient(135deg,#3dc5ff,#4f6bff)">🗺️</span><div><b>Öppna kartan</b><small>Sätt markeringar och hitta rätt i stan</small></div><span class="arr">→</span></button>
    <div class="pm-tiles">
     <button type="button" class="pm-tile" disabled><span class="pm-ic" style="background:linear-gradient(135deg,#ff3d8b,#ff8a3d)">🛒</span><div><b>Butik</b><small>Kommer snart</small></div><span class="arr">↗</span></button>
     <button type="button" class="pm-tile" data-pm="discord"><span class="pm-ic" style="background:#5865f2">💬</span><div><b>Discord</b><small>Regler, nyheter och ansökningar</small></div><span class="arr">↗</span></button>
     <button type="button" class="pm-tile" data-pm="report"><span class="pm-ic" style="background:rgba(255,255,255,.08)">⚑</span><div><b>Skicka report</b><small>Få hjälp av staff</small></div><span class="arr">→</span></button>
     <button type="button" class="pm-tile" data-pm="hud"><span class="pm-ic" style="background:rgba(255,255,255,.08)">⚙️</span><div><b>Anpassa HUD</b><small>Tema, storlek, minikarta</small></div><span class="arr">→</span></button></div>`;}
  else if(SV.pm==='guide'||SV.pm==='rules'){const L=SV.pm==='guide'?GUIDE:RULES;
    main=`<div><div class="pm-when">${SV.pm==='guide'?'SPELGUIDE':'SERVERREGLER'}</div><div class="pm-hi" style="font-size:clamp(38px,5vw,60px)">${SV.pm==='guide'?'Ny i <em>stan</em>?':'Håll det <em>schysst</em>'}</div></div>
    <div style="display:flex;flex-direction:column;gap:8px">${L.map((x,i)=>`<div class="acc-item ${SV.openAcc===i?'open':''}"><button type="button" data-acc="${i}" aria-expanded="${SV.openAcc===i}"><span class="num">${String(i+1).padStart(2,'0')}</span>${x[0]}<span>+</span></button><div class="bd"><div>${x[1]}</div></div></div>`).join('')}</div>`;}
  else if(SV.pm==='keys'){main=`<div><div class="pm-when">TANGENTER</div><div class="pm-hi" style="font-size:clamp(38px,5vw,60px)">Tryck på <em>en tangent</em></div></div>
    <p style="color:rgba(255,255,255,.6);font-size:14px">Tryck på tangenterna på ditt tangentbord eller klicka, så lyser de upp.</p>
    <div class="keys">${KEYS.map(([k,t])=>`<button type="button" class="key" data-key="${k}"><kbd>${k}</kbd><span>${t}</span></button>`).join('')}</div>`;}
  let modal='';
  if(SV.modal==='report')modal=`<div class="svmodal" data-mclose><div role="dialog" aria-label="Skicka report"><h5>Skicka report</h5><label for="rpType">TYP<select id="rpType"><option>Bugg</option><option>Regelbrott</option><option>Fråga</option></select></label>
    <label for="rpMsg">MEDDELANDE<textarea id="rpMsg" rows="3" placeholder="Beskriv vad som hänt…" maxlength="160"></textarea></label><div class="sv-row"><button type="button" class="svbtn" data-mclose2>Avbryt</button><button type="button" class="svbtn go" data-rpsend>Skicka</button></div></div></div>`;
  if(SV.modal==='map')modal=`<div class="svmodal" data-mclose><div role="dialog" aria-label="Karta" style="max-width:620px"><h5>Karta</h5><p style="font-size:13px;color:#a597a8;margin:0">Klicka på kartan eller en plats för att sätta en markering.</p>
    <div class="svmap" id="svmap"><svg viewBox="0 0 320 200" preserveAspectRatio="none" aria-hidden="true"><rect width="320" height="200" fill="#2c4a3a"/><path d="M0 150 C60 140 90 175 150 160 S260 120 320 140 V200 H0Z" fill="#1d4e78"/><g stroke="#cfc6b6" stroke-width="5" fill="none" opacity=".75"><path d="M0 60 L320 50"/><path d="M90 0 L110 200"/><path d="M210 0 L190 150"/><path d="M0 110 L320 100"/></g>
     ${[['Polisstation',100,55,'#4f8bff'],['Sjukhus',200,45,'#ff3d8b'],['Garage Legion',150,105,'#ffc93d'],['Nordvik Bank',60,100,'#8b6bff'],['Vespucci Beach',260,140,'#3ddc97']].map(([n,x,y,c])=>`<g data-place="${n}" data-x="${x}" data-y="${y}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="7" fill="${c}" stroke="#fff" stroke-width="2"/><text x="${x+10}" y="${y+4}" fill="#fff" font-size="9" font-weight="700" font-family="sans-serif">${n}</text></g>`).join('')}</svg>
     ${SV.wp?`<svg class="wp" style="left:${SV.wp.x/320*100}%;top:${SV.wp.y/200*100}%" viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" fill="#ff3d8b" stroke="#fff" stroke-width="1.5"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>`:''}</div>
    <div class="sv-row"><button type="button" class="svbtn" data-wpclear>Ta bort markering</button><button type="button" class="svbtn go" data-mclose2>Stäng (M)</button></div></div></div>`;
  if(SV.modal==='leave')modal=`<div class="svmodal" data-mclose><div role="dialog" aria-label="Lämna servern"><h5>Lämna servern?</h5><p style="color:#a597a8;font-size:14px;margin:0">Din karaktär sparas där du står. Parkera bilen i ett garage först!</p><div class="sv-row"><button type="button" class="svbtn" data-mclose2>Stanna kvar</button><button type="button" class="svbtn go" data-leave style="background:#ff5c7a">Lämna</button></div></div></div>`;
  pm.innerHTML=`<aside class="pm-side"><div class="pm-logo"><i></i>SVEA ROLEPLAY</div>
   ${nav.map(([k,n,t])=>`<button type="button" class="pm-nav ${SV.pm===k?'on':''}" data-nav="${k}"><small>${n}</small><b>${t}</b></button>`).join('')}
   <div class="pm-btns"><button type="button" class="pm-btn go" data-pm="play">Fortsätt spela</button><button type="button" class="pm-btn" data-pm="map">🗺️ Karta</button><button type="button" class="pm-btn" data-pm="gta">⚙️ GTA-inställningar</button><button type="button" class="pm-btn leave" data-pm="leave">Lämna servern</button></div>
   <div class="pm-keys"><span class="kb">ESC</span> stäng · <span class="kb">M</span> karta · <span class="kb">1-4</span> flikar</div></aside>
   <main class="pm-main">${main}</main>${modal}
   ${SV.play?`<div class="pm-play"><h5>Tillbaka i spelet</h5><p>Erik står vid garaget på Legion Square.</p><button type="button" class="svbtn go" data-pm="menu" style="padding:12px 22px">Öppna pausmenyn (ESC)</button></div>`:''}`;
  const t=$('#rpMsg');if(t)t.focus();
}
$('#pm').addEventListener('click',e=>{
  const t=e.target;
  if(t.matches('[data-mclose]')||t.closest('[data-mclose2]')){SV.modal=null;pmRender();return;}
  const g=t.closest('[data-place]');if(g){SV.wp={x:+g.dataset.x,y:+g.dataset.y};pmRender();toast('sv','📍 Markering satt: '+g.dataset.place);return;}
  const map=t.closest('#svmap');if(map&&!t.closest('button')){const r=map.getBoundingClientRect();SV.wp={x:(e.clientX-r.left)/r.width*320,y:(e.clientY-r.top)/r.height*200};pmRender();toast('sv','📍 Markering satt på kartan');return;}
  const b=t.closest('button');if(!b)return;const d=b.dataset;
  if(d.nav){SV.pm=d.nav;SV.openAcc=0;pmRender();return;}
  if(d.acc!==undefined){const i=+d.acc;SV.openAcc=SV.openAcc===i?-1:i;pmRender();return;}
  if(d.key){b.classList.add('hit');setTimeout(()=>b.classList.remove('hit'),350);toast('sv',d.key+' → '+b.querySelector('span').textContent);return;}
  if(d.wpclear!==undefined){SV.wp=null;pmRender();return;}
  if(d.leave!==undefined){SV.modal=null;pmRender();toast('sv','👋 Du lämnade Svea Roleplay. (Inte på riktigt, klicka vidare!)');return;}
  if(d.rpsend!==undefined){const m=$('#rpMsg').value.trim();if(m.length<3){$('#rpMsg').classList.add('shake');setTimeout(()=>{const x=$('#rpMsg');x&&x.classList.remove('shake');},400);$('#rpMsg').focus();return;}
    const r={id:++SV.rid,type:$('#rpType').value,from:'Erik Svensson',pid:4,status:'open',closed:false,fresh:true,chat:[{w:'Erik Svensson',t:now(),m}]};
    SV.reports.push(r);SV.ad.rtab='open';SV.ad.rsel=r.id;SV.modal=null;pmRender();badge();
    toast('sv','⚑ Report #'+r.id+' skickad! Öppna Admin-fliken och svara som staff!');return;}
  const p=d.pm;if(!p)return;
  if(p==='play'){SV.play=true;pmRender();}
  else if(p==='menu'){SV.play=false;pmRender();}
  else if(p==='map'||p==='report'||p==='leave'){SV.modal=p;pmRender();}
  else if(p==='hud')setTab('hud');
  else if(p==='discord')toast('sv','💬 Öppnar Discord… (discord.gg/svearp)');
  else if(p==='gta')toast('sv','⚙️ Öppnar GTA:s egna inställningar');
});
document.addEventListener('keydown',e=>{
  if(SV.tab!=='pause'||EU.typing()||!EU.inView(stage)||$$('.ov').some(o=>!o.hidden))return;
  const k=e.key.toUpperCase();
  if(e.key==='Escape'){e.preventDefault();if(SV.modal){SV.modal=null;}else SV.play=!SV.play;pmRender();return;}
  if(SV.play)return;
  if(k==='M'){e.preventDefault();SV.modal=SV.modal==='map'?null:'map';pmRender();return;}
  if(['1','2','3','4'].includes(k)&&!SV.modal){e.preventDefault();SV.pm=['home','guide','keys','rules'][+k-1];pmRender();return;}
  if(SV.pm==='keys'&&!SV.modal){const kk=k.startsWith('F')&&k.length<=3?k:k;const btn=$(`#pm [data-key="${kk}"]`);if(btn){e.preventDefault();btn.classList.add('hit');setTimeout(()=>btn.classList.remove('hit'),350);}}
});
setInterval(()=>{SV.secs++;const el=$('#pmPlay');if(el)el.textContent=fmtT(SV.secs);},1000);
setInterval(()=>{SV.online=Math.max(18,Math.min(44,SV.online+Math.round((Math.random()-.5)*3)));const o=$('#pmOnline');if(o){o.innerHTML=SV.online+'<small>/ 48 online</small>';$('#pmBar').style.width=(SV.online/48*100).toFixed(0)+'%';}},4000);

/* ================= HUD ================= */
const THEMES={sunset:['#ff3d8b','#ff8a3d','#ffc93d'],neon:['#ff3df2','#8b6bff','#3dd6ff'],svea:['#2f6bff','#4fa3ff','#ffd23f'],mono:['#ffffff','#bdbdbd','#8a8a8a']};
const H={};const hp=$('#hudprev');
function hudDefaults(){Object.assign(H,{map:'car',unit:'kmh',theme:'sunset',size:100,money:'always',hide:false,street:true,logo:true,film:false});}
function hudSync(){
  $$('#hudset .pills').forEach(g=>$$('button',g).forEach(b=>b.classList.toggle('on',b.dataset.v===H[g.dataset.set])));
  $('#hudSize').value=H.size;$('#hudSizeV').textContent=H.size+'%';
  $('#hudHide').checked=H.hide;$('#hudStreet').checked=H.street;$('#hudLogo').checked=H.logo;$('#hudFilm').checked=H.film;hudApply();
}
function hudApply(){
  const t=THEMES[H.theme];hp.style.setProperty('--hc1',t[0]);hp.style.setProperty('--hc2',t[1]);hp.style.setProperty('--hc3',t[2]);
  $('#hudset').style.setProperty('--hg',`linear-gradient(100deg,${t[0]},${t[1]} 55%,${t[2]})`);$('#hgs1').setAttribute('stop-color',t[0]);$('#hgs2').setAttribute('stop-color',t[2]);
  hp.style.setProperty('--scale',H.size/100);$('#hMap').hidden=H.map==='never';$('#hStreet').hidden=!H.street;$('#hLogo').hidden=!H.logo;hp.classList.toggle('film',H.film);
  $$('.meter',hp).forEach(m=>{const v=parseInt(m.style.getPropertyValue('--v'));m.classList.toggle('hide',H.hide&&v>=100);m.classList.toggle('low',v<=25);});
  const mo=H.money==='change';$('#hMoney').style.opacity=mo?0:1;$('#hBank').style.opacity=mo?0:1;$('#hUnit').textContent=(H.unit==='kmh'?'KM/H':'MPH')+' · G4';
}
$$('#hudset .pills').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;H[g.dataset.set]=b.dataset.v;hudSync();}));
$('#hudSize').addEventListener('input',e=>{H.size=+e.target.value;$('#hudSizeV').textContent=H.size+'%';hudApply();});
[['hudHide','hide'],['hudStreet','street'],['hudLogo','logo'],['hudFilm','film']].forEach(([id,k])=>$('#'+id).addEventListener('change',e=>{H[k]=e.target.checked;hudApply();}));
$('#hudReset').addEventListener('click',()=>{hudDefaults();hudSync();toast('sv','Standardinställningar återställda');});
$('#hudSave').addEventListener('click',()=>toast('sv','✓ Sparat! Följer med till nästa gång du loggar in'));
let speed=96,target=128,hcash=12450;const dirs=['N','NÖ','Ö','SÖ','S','SV','V','NV'];let di=3;
const ROADS=[['Ocean Drive','Vespucci Beach'],['Del Perro Fwy','Del Perro'],['Alta Street','Pillbox Hill'],['Legion Square','Downtown']];let ri=0;
setInterval(()=>{if(SV.tab!=='hud')return;
  if(Math.random()<.04)target=Math.round(30+Math.random()*130);speed+=(target-speed)*.08;const s=Math.round(speed);
  $('#hSpeed').textContent=H.unit==='kmh'?s:Math.round(s*.621);$('#hArc').setAttribute('stroke-dasharray',(235.6*Math.min(s/200,1)).toFixed(1)+' 314.2');
  hp.style.setProperty('--rd',Math.max(.16,1.4-s/120).toFixed(2)+'s');},80);
setInterval(()=>{if(SV.tab!=='hud')return;hcash+=500;$('#hMoney').innerHTML='<small>KR</small>'+kr(hcash);const p=$('#hPlus');p.classList.add('show');
  if(H.money==='change'){$('#hMoney').style.opacity=1;$('#hBank').style.opacity=1;}
  setTimeout(()=>{p.classList.remove('show');if(H.money==='change'){$('#hMoney').style.opacity=0;$('#hBank').style.opacity=0;}},2200);},7000);
setInterval(()=>{if(SV.tab!=='hud')return;
  $$('.meter',hp).forEach(m=>{let v=parseInt(m.style.getPropertyValue('--v'));if(m.dataset.k==='fd'||m.dataset.k==='wt')v=v<=15?95:v-5;else if(m.dataset.k==='hp')v=v<100?Math.min(100,v+15):(Math.random()<.3?60:100);m.style.setProperty('--v',v+'%');});
  di=(di+(Math.random()<.5?1:7))%8;$('#hDir').textContent=dirs[di];hp.style.setProperty('--hd',(di*45)+'deg');
  if(Math.random()<.3){ri=(ri+1)%ROADS.length;$('#hRoad').textContent=ROADS[ri][0];$('#hArea').textContent=ROADS[ri][1];}
  $('#hTime').textContent=now();hudApply();},3000);

/* ================= FAKTURA ================= */
let invType='Böter';
$('#invType').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;invType=b.dataset.v;$$('#invType button').forEach(x=>x.classList.toggle('on',x===b));});
function invReset(){$('#invId').value='';$('#invAmt').value='1500';invType='Böter';$$('#invType button').forEach((x,k)=>x.classList.toggle('on',k===0));$('#invDep').selectedIndex=0;$('#invSms').checked=true;$('#invUrg').checked=false;$$('#inv input').forEach(i=>i.classList.remove('bad'));}
function invRender(){const L=$('#invList');
  L.innerHTML=SV.invoices.length?SV.invoices.map(v=>`<div class="bill"><span class="bi">#${v.id}</span><b>${esc(v.to)}</b><span class="amt">${kr(v.amt)} kr</span><small>${esc(v.type)} · ${esc(v.dep)}${v.urg?' · brådskande':''}${v.sms?' · sms':''}</small><span class="st ${v.paid?'paid':''}">${v.paid?'BETALD':'OBETALD'}</span></div>`).join('')
  :`<div class="invempty">Inga fakturor än. Skicka en till ID <b>4</b> (Erik), <b>7</b> eller <b>12</b> och se vad som händer.</div>`;}
$('#invCancel').addEventListener('click',()=>{invReset();toast('sv','Fakturan avbröts');});
$('#inv').addEventListener('submit',e=>{e.preventDefault();
  const id=parseInt($('#invId').value,10),amt=parseInt($('#invAmt').value,10);const iI=$('#invId'),aI=$('#invAmt');
  iI.classList.remove('bad');aI.classList.remove('bad');void iI.offsetWidth;
  if(!id||id<1){iI.classList.add('bad');toast('sv','Skriv in spelarens ID först');iI.focus();return;}
  const pl=SV.players.find(p=>p.id===id);
  if(!pl){iI.classList.add('bad');toast('sv',`Ingen spelare med ID ${id} är online. Prova 4, 7 eller 12.`);return;}
  if(!amt||amt<1){aI.classList.add('bad');toast('sv','Beloppet måste vara större än 0');aI.focus();return;}
  const v={id:id,to:pl.n+' (ID '+id+')',amt,type:invType,dep:$('#invDep').value,urg:$('#invUrg').checked,sms:$('#invSms').checked,paid:false,pid:id};
  SV.invoices.unshift(v);invRender();iI.value='';
  toast('sv',`Faktura på ${kr(amt)} kr skickad till ${pl.n}${v.sms?' · 📱 sms skickat':''}`);
  setTimeout(()=>{if(!SV.invoices.includes(v))return;const p=SV.players.find(x=>x.id===v.pid);
    if(p&&p.bank>=v.amt){p.bank-=v.amt;v.paid=true;invRender();toast('sv',`✅ ${p.n} betalade fakturan på ${kr(v.amt)} kr`);if(SV.tab==='admin')adRender();}},2500+Math.random()*2500);
});

/* ================= ADMIN ================= */
const adMain=$('#adMain');
function adRender(){
  const A=SV.ad;
  $$('#admin .ad-nav').forEach(b=>b.classList.toggle('on',b.dataset.tab===A.tab));
  $('#cntP').textContent=SV.players.length;const open=SV.reports.filter(r=>!r.closed).length;$('#cntR').textContent=open;$('#cntR').classList.toggle('hot',open>0);badge();
  if(A.tab==='players'){
    const q=A.q.toLowerCase();const list=SV.players.filter(p=>!q||(p.n+' '+p.id+' '+p.cid+' '+p.u).toLowerCase().includes(q));const p=SV.players.find(x=>x.id===A.sel);
    adMain.innerHTML=`<div class="ad-head"><h4>Spelare online</h4><input class="ad-search" id="adQ" placeholder="Sök namn, ID eller citizen-ID" value="${esc(A.q)}" aria-label="Sök spelare"></div>
    <div class="ad-list">${list.length?list.map(x=>`<button type="button" class="row ${x.id===A.sel?'on':''}" data-pid="${x.id}"><span class="idbox">${x.id}</span><span class="txt"><b>${esc(x.n)}${x.role?` <span class="bdg2 b-${x.role}">${x.role}</span>`:''}</b><small>${esc(x.u)} · ${esc(x.job)} · ${esc(x.grade)}</small></span><span class="ms">${x.ms} ms</span></button>`).join(''):'<div class="empty">Ingen spelare matchar.</div>'}</div>
    <div class="ad-det">${p?`<div class="det-h"><div class="idbig">${p.id}</div><div><b>${esc(p.n)}</b><small>${esc(p.u)} · ${p.cid}</small></div></div>
      <div class="stats"><div class="stat"><small>Jobb</small><b>${esc(p.job)}</b></div><div class="stat"><small>Kontanter</small><b id="stCash">${kr(p.cash)} kr</b></div><div class="stat"><small>Bank</small><b>${kr(p.bank)} kr</b></div></div>
      <span class="acts-l">HANDLINGAR</span><div class="acts">
       <button type="button" data-a="goto">Gå till</button><button type="button" data-a="bring">Hämta hit</button><button type="button" data-a="spec">Spectate</button><button type="button" data-a="freeze">Frys / tina</button>
       <button type="button" data-a="heal">Hela</button><button type="button" data-a="money">Ge 500 kr</button><button type="button" data-a="kick" class="dg">Kicka</button><button type="button" data-a="ban" class="dg">Banna</button></div>
      ${A.ban?`<div class="banbox"><b>Banna spelaren</b><input id="banR" placeholder="Anledning (visas för spelaren)" aria-label="Anledning"><div class="r"><select id="banT" aria-label="Längd"><option>1 dag</option><option>3 dagar</option><option>1 vecka</option><option>Permanent</option></select><button type="button" class="banbtn" data-a="doban">Banna</button></div></div>`:''}`
      :'<div class="empty">Välj en spelare i listan.</div>'}</div>`;
    const qi=$('#adQ');qi.addEventListener('input',()=>{A.q=qi.value;const pos=qi.selectionStart;adRender();const n=$('#adQ');n.focus();n.setSelectionRange(pos,pos);});
  }else{
    const list=SV.reports.filter(r=>A.rtab==='open'?!r.closed:r.closed);const r=list.find(x=>x.id===A.rsel)||null;
    adMain.innerHTML=`<div class="ad-head"><h4>Reports</h4><div class="ad-seg"><button type="button" data-rt="open" class="${A.rtab==='open'?'on':''}">Aktiva</button><button type="button" data-rt="closed" class="${A.rtab==='closed'?'on':''}">Stängda</button></div></div>
    <div class="ad-list">${list.length?list.map(x=>`<button type="button" class="row ${r&&x.id===r.id?'on':''} ${x.fresh?'newr':''}" data-rid="${x.id}"><span class="idbox">#${x.id}</span><span class="txt"><b>${esc(x.type)} · ${esc(x.from)}</b><small>${esc((x.chat.filter(c=>c.m).slice(-1)[0]||{m:''}).m)}</small></span><span class="bdg2 ${x.closed?'b-closed':'b-'+x.status}">${x.closed?'Stängd':x.status==='han'?'Hanteras':'Öppen'}</span></button>`).join(''):`<div class="empty">${A.rtab==='open'?'Inga aktiva reports. Skicka en från pausmenyn!':'Inga stängda reports än.'}</div>`}</div>
    <div class="ad-det">${r?`<div class="det-h"><div class="idbig">#${r.id}</div><div><b>${esc(r.type)}</b><small>${esc(r.from)} · ID ${r.pid} · <span class="bdg2 ${r.closed?'b-closed':'b-'+r.status}">${r.closed?'Stängd':r.status==='han'?'Hanteras':'Öppen'}</span></small></div></div>
      <div class="chat" id="chat">${r.chat.map(c=>c.sys?`<div class="sys">${esc(c.sys)}</div>`:`<div class="cm ${c.me?'me':''}"><small>${esc(c.w)} · ${c.t}</small>${esc(c.m)}</div>`).join('')}</div>
      ${r.closed?'':`<form class="reply" id="reply"><input id="replyIn" placeholder="Svara spelaren…" aria-label="Svar"><button class="send" type="submit">Skicka</button></form>
      <div class="acts">${r.status==='open'?'<button type="button" data-ra="take">Ta ärendet</button>':''}<button type="button" data-ra="goto">Gå till</button><button type="button" data-ra="bring">Hämta hit</button><button type="button" data-ra="close" class="dg">Stäng</button></div>`}`
      :'<div class="empty">Välj en report.</div>'}</div>`;
    SV.reports.forEach(x=>x.fresh=false);
    const ch=$('#chat');if(ch)ch.scrollTop=ch.scrollHeight;
    const f=$('#reply');if(f)f.addEventListener('submit',e=>{e.preventDefault();const v=$('#replyIn').value.trim();if(!v)return;
      if(r.status==='open'){r.status='han';r.chat.push({sys:'ayozenxx tog ärendet · '+now()});}
      r.chat.push({w:'ayozenxx',me:1,t:now(),m:v});adRender();setTimeout(()=>{const n=$('#replyIn');n&&n.focus();},0);
      setTimeout(()=>{if(r.closed)return;const ans=['Tack! 🙏','Okej, jag väntar här.','Perfekt, tack för hjälpen!','Ja precis, det var där.'];r.chat.push({w:r.from,t:now(),m:ans[Math.floor(Math.random()*ans.length)]});if(SV.tab==='admin'&&SV.ad.tab==='reports'&&SV.ad.rsel===r.id){const keep=$('#replyIn')&&$('#replyIn').value;adRender();if(keep)$('#replyIn').value=keep;}},1500);});
  }
}
$('#admin').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const A=SV.ad,d=b.dataset;
  if(d.tab){A.tab=d.tab;A.ban=false;adRender();return;}
  if(d.pid){A.sel=+d.pid;A.ban=false;adRender();return;}
  if(d.rt){A.rtab=d.rt;const f=SV.reports.find(x=>A.rtab==='open'?!x.closed:x.closed);A.rsel=f?f.id:null;adRender();return;}
  if(d.rid){A.rsel=+d.rid;adRender();return;}
  const p=SV.players.find(x=>x.id===A.sel);
  if(d.a&&p){
    const M={goto:'Du teleporterade till '+p.n,bring:p.n+' hämtades till dig',spec:'Du spectatar '+p.n+' 👀',heal:p.n+' blev helad ❤️',freeze:p.n+' frystes / tinades ❄️'};
    if(M[d.a])toast('sv',M[d.a]);
    if(d.a==='money'){p.cash+=500;adRender();$('#stCash').classList.add('flash');toast('sv','Gav 500 kr till '+p.n);}
    if(d.a==='ban'){A.ban=!A.ban;adRender();if(A.ban)$('#banR').focus();}
    if(d.a==='kick'||d.a==='doban'){const why=d.a==='doban'?($('#banR').value.trim()||'Ingen anledning angiven'):'';const len=d.a==='doban'?$('#banT').value:'';
      SV.players=SV.players.filter(x=>x.id!==p.id);A.sel=SV.players[0]?SV.players[0].id:null;A.ban=false;adRender();
      toast('sv',d.a==='kick'?p.n+' kickades från servern':p.n+' bannades ('+len+'): '+why);}
    return;}
  const r=SV.reports.find(x=>x.id===A.rsel);
  if(d.ra&&r){
    if(d.ra==='take'){r.status='han';r.chat.push({sys:'ayozenxx tog ärendet · '+now()});adRender();toast('sv','Du tog report #'+r.id);}
    if(d.ra==='goto')toast('sv','Du teleporterade till '+r.from);
    if(d.ra==='bring')toast('sv',r.from+' hämtades till dig');
    if(d.ra==='close'){r.closed=true;r.chat.push({sys:'Ärendet stängdes · '+now()});const f=SV.reports.find(x=>!x.closed);A.rsel=f?f.id:null;adRender();toast('sv','Report #'+r.id+' stängd ✓');}
  }
});
EU.resetSv=()=>{SV.modal=null;SV.play=false;invReset();init();};
init();
})();
document.addEventListener('click',e=>{const b=e.target.closest('[data-reset]');if(!b)return;const r=b.dataset.reset;
  if(r==='pc'&&EU.resetPc)EU.resetPc();if(r==='nv'&&EU.resetNv)EU.resetNv();if(r==='sv'&&EU.resetSv)EU.resetSv();if(r==='es'&&EU.resetEs)EU.resetEs();
  EU.toast(r,EU.T('Återställt ↺','Reset ↺'));});
