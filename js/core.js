(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kr=n=>Math.round(n).toLocaleString('sv-SE').replace(/ /g,' ');
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
window.EU={$,$$,esc,kr,store};

/* ---------- Språk ---------- */
let LANG=store.get('eu-lang')==='en'?'en':'sv';
const T=(sv,en)=>LANG==='en'?en:sv;
const langHooks=[];
EU.T=T;EU.onLang=f=>langHooks.push(f);EU.lang=()=>LANG;
function applyLang(anim){
  $$('[data-en]').forEach(el=>{if(el._sv===undefined)el._sv=el.innerHTML;el.innerHTML=LANG==='en'?el.dataset.en:el._sv;});
  $$('[data-en-ph]').forEach(el=>{if(el._svph===undefined)el._svph=el.getAttribute('placeholder')||'';el.setAttribute('placeholder',LANG==='en'?el.dataset.enPh:el._svph);});
  $$('[data-en-al]').forEach(el=>{if(el._sval===undefined)el._sval=el.getAttribute('aria-label')||'';el.setAttribute('aria-label',LANG==='en'?el.dataset.enAl:el._sval);});
  document.documentElement.lang=LANG;
  $('#langLbl').innerHTML=LANG==='en'?'<b>EN</b> <span>/ SV</span>':'<b>SV</b> <span>/ EN</span>';
  langHooks.forEach(f=>{try{f()}catch(e){console.error(e)}});
  if(anim&&!RM){document.body.classList.remove('fading');void document.body.offsetWidth;document.body.classList.add('fading');}
}
$('#langBtn').addEventListener('click',()=>{LANG=LANG==='en'?'sv':'en';store.set('eu-lang',LANG);applyLang(true);});

/* ---------- Tema ---------- */
const root=document.documentElement;
const saved=store.get('eu-theme');if(saved==='dark'||saved==='light')root.dataset.theme=saved;
const effTheme=()=>root.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
$('#themeBtn').addEventListener('click',e=>{
  const next=effTheme()==='dark'?'light':'dark';
  const r=e.currentTarget.getBoundingClientRect();
  root.style.setProperty('--tx',(r.left+r.width/2)+'px');root.style.setProperty('--ty',(r.top+r.height/2)+'px');
  const go=()=>{root.dataset.theme=next;store.set('eu-theme',next);};
  if(document.startViewTransition&&!RM){try{document.startViewTransition(go);}catch(err){go();}}else go();
});

/* ---------- Effekter ---------- */
const dots=$('.bgfx .dots');let raf=0,px=0,py=0;
addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY;if(!raf)raf=requestAnimationFrame(()=>{raf=0;dots.style.setProperty('--mx',px+'px');dots.style.setProperty('--my',py+'px');});},{passive:true});
document.addEventListener('pointermove',e=>{
  const s=e.target.closest&&e.target.closest('.spot');
  if(s){const r=s.getBoundingClientRect();s.style.setProperty('--x',(e.clientX-r.left)+'px');s.style.setProperty('--y',(e.clientY-r.top)+'px');}
},{passive:true});
$$('.magnet').forEach(m=>{
  m.addEventListener('pointermove',e=>{if(RM||e.pointerType!=='mouse')return;const r=m.getBoundingClientRect();m.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`;});
  m.addEventListener('pointerleave',()=>{m.style.transform='';});
});
/* Jättebokstäver */
let li=0;const L=$('#letters');
for(const w of ['EMIL','UZEIROVIC']){const g=document.createElement('span');g.className='word';for(const ch of w){const s=document.createElement('span');s.textContent=ch;s.style.setProperty('--i',li++);g.appendChild(s);}L.appendChild(g);}
/* Marquee */
const T1=[['Rust','#ce7b4e'],['egui','#22c3d6'],['JavaScript','#e8c547'],['HTML','#e8673a'],['CSS','#3b82f6'],['Java','#e06c4a'],['Lua','#5b6cf0'],['Git','#f05033']];
const T2=[['QBCore','#ff3d8b'],['ESX','#ff8a3d'],['NUI','#ffc93d'],['GitHub','#8b95a1'],['Cargo','#ce7b4e'],['sysinfo','#22c3d6'],['Win32','#3b82f6'],['AI','#16a066']];
const mq=(id,arr)=>{$(id).innerHTML=[...arr,...arr].map(([t,c])=>`<span><i style="--c:${c}"></i>${t}</span>`).join('');};
mq('#mq1',T1);mq('#mq2',T2);
/* Klocka */
const clock=()=>{try{$('#clock').textContent=new Date().toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Stockholm'});}catch(e){}};
clock();setInterval(clock,20000);
/* Terminal */
const TL=['$ cargo run --release','   Compiling procyon v0.1.0','    Finished release ✓','$ git push origin main','$ ny idé → bygger…'];
let tl=0,tc=0;const term=$('#term');let buf=[];
(function type(){
  const line=TL[tl];tc++;
  const shown=buf.concat(line.slice(0,tc));
  term.innerHTML=shown.slice(-3).map(esc).join('\n')+'<span class="cur"></span>';
  if(tc>=line.length){buf.push(line);tl=(tl+1)%TL.length;tc=0;if(tl===0)buf=[];setTimeout(type,700);}
  else setTimeout(type,line.startsWith('$')?55:18);
})();
/* Räknare */
if('IntersectionObserver' in window&&!RM){
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;io.unobserve(en.target);
    const el=en.target,n=+el.dataset.count,t0=performance.now();
    const step=t=>{const p=Math.min(1,(t-t0)/1200),v=Math.round(n*(1-Math.pow(1-p,3)));el.textContent=v;if(p<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);}),{threshold:.6});
  $$('[data-count]').forEach(el=>io.observe(el));
}
/* Animerad memoji */
(function(){const av=$('#heroAv');if(!av)return;const tilt=$('.ha-tilt',av),bub=$('#heroBubble');
  const LINES=[['Hej! 👋','Hi! 👋'],['Kul att du kikar in!','Glad you stopped by!'],['Söker LIA, hör av dig!','Looking for an internship!'],['Testa demona nedanför 👇','Try the demos below 👇'],['Klicka på en fråga om mig 👆','Click a question about me 👆'],['Jag lär mig AI för arbetslivet 🤖','Learning AI for real-world work 🤖'],['Klicka på mig! 😄','Click me! 😄']];
  let li=0,bt,last=Date.now(),mouse=false;
  const act=c=>{['jump','talk','nod','spin'].forEach(k=>av.classList.remove(k));void av.offsetWidth;av.classList.add(c);};
  const say=(t,ms)=>{bub.textContent=t;bub.classList.add('show');act('talk');clearTimeout(bt);bt=setTimeout(()=>bub.classList.remove('show'),ms||2800);};
  const look=(ry,rx,rz)=>{tilt.style.setProperty('--ry',ry+'deg');tilt.style.setProperty('--rx',rx+'deg');tilt.style.setProperty('--rz',(rz||0)+'deg');tilt.style.setProperty('--hx',(ry*.4)+'px');tilt.style.setProperty('--hy',(-rx*.3)+'px');};
  setTimeout(()=>say(T('Hej! 👋','Hi! 👋'),2600),1200);
  av.addEventListener('click',()=>{last=Date.now();act(Math.random()<.25?'spin':'jump');li=(li+1)%LINES.length;const l=LINES[li];setTimeout(()=>{bub.textContent=LANG==='en'?l[1]:l[0];bub.classList.add('show');clearTimeout(bt);bt=setTimeout(()=>bub.classList.remove('show'),2800);},150);});
  av.addEventListener('animationend',e=>{if(['hop','talk','nod','spin3d'].includes(e.animationName))['jump','talk','nod','spin'].forEach(k=>av.classList.remove(k));});
  /* lever av sig själv: tittar runt, nickar, pratar */
  setInterval(()=>{
    if(!EU.inView(av)||document.hidden)return;
    const idle=Date.now()-last>3500;
    if(!mouse||idle){const r=Math.random();
      if(r<.35)look(-24+Math.random()*48,-8+Math.random()*16,-6+Math.random()*12);
      else if(r<.55){look(0,0,0);act('nod');}
      else if(r<.75){li=(li+1)%LINES.length;const l=LINES[li];say(LANG==='en'?l[1]:l[0]);}
      else if(r<.85)act('spin');
      else look(0,0,0);}
  },2600);
  let raf2=0,mx=0,my=0;
  addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;mouse=true;last=Date.now();mx=e.clientX;my=e.clientY;if(raf2)return;raf2=requestAnimationFrame(()=>{raf2=0;
    const r=av.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
    const dx=(mx-(r.left+r.width/2))/innerWidth,dy=(my-(r.top+r.height/2))/innerHeight;
    look((dx*44).toFixed(1),(-dy*30).toFixed(1),(dx*6).toFixed(1));});},{passive:true});
})();
/* Studentbilder */
(function(){const box=$('#gradImg');if(!box)return;const imgs=$$('.gs',box),dots=$$('.gdots button',box);let i=0,auto;
  const show=n=>{i=(n+imgs.length)%imgs.length;imgs.forEach((im,k)=>im.classList.toggle('on',k===i));dots.forEach((d,k)=>d.classList.toggle('on',k===i));};
  box.addEventListener('click',e=>{const d=e.target.closest('[data-gs]');if(d){show(+d.dataset.gs);clearInterval(auto);return;}if(e.target.closest('[data-gnext]')){show(i+1);clearInterval(auto);}});
  if(!RM)auto=setInterval(()=>{if(EU.inView(box))show(i+1);},5000);
})();
/* Hovercards på touch */
$$('.hc').forEach(c=>{
  c.addEventListener('click',()=>c.classList.toggle('open'));
  if(RM)return;
  c.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.classList.add('tilting');c.style.setProperty('--try',(x*7).toFixed(2)+'deg');c.style.setProperty('--trx',(-y*7).toFixed(2)+'deg');});
  c.addEventListener('pointerleave',()=>{c.classList.remove('tilting');c.style.setProperty('--try','0deg');c.style.setProperty('--trx','0deg');});
});

/* ---------- Overlays ---------- */
let lastFocus=null;
function openOv(ov,focusSel){lastFocus=document.activeElement;ov.hidden=false;document.body.style.overflow='hidden';const f=focusSel?$(focusSel,ov):$('[data-close]',ov);f&&f.focus();}
function closeOv(ov){ov.hidden=true;document.body.style.overflow='';lastFocus&&lastFocus.focus&&lastFocus.focus();}
$$('.ov').forEach(ov=>{ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('[data-close]'))closeOv(ov);});});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const o=$$('.ov').find(x=>!x.hidden);if(o){e.preventDefault();closeOv(o);}});
document.addEventListener('click',e=>{const h=e.target.closest('[data-hey]');if(h){e.preventDefault();openOv($('#heyOv'),'#heyName');}});
function heyHref(){const n=$('#heyName').value.trim(),m=$('#heyMsg').value.trim();
  const sub=T('Hej från din portfolio','Hi from your portfolio')+(n?(LANG==='en'?' from ':' från ')+n:'');
  const body=(m||'')+(n?'\n\n/ '+n:'');
  $('#heyMail').href='mailto:uzeirovicemil44@gmail.com?subject='+encodeURIComponent(sub)+(body.trim()?'&body='+encodeURIComponent(body):'');}
$('#heyName').addEventListener('input',heyHref);$('#heyMsg').addEventListener('input',heyHref);EU.onLang(heyHref);
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-copy]');if(!b)return;
  const txt=b.dataset.copy;const lbl=b.querySelector('span')||b;
  const done=ok=>{const old=lbl.innerHTML;lbl.textContent=ok?T('Kopierat ✓','Copied ✓'):T('Markera och kopiera','Select and copy');setTimeout(()=>{lbl.innerHTML=LANG==='en'&&lbl.dataset.en?lbl.dataset.en:(lbl._sv||old);},1600);
    if(!ok){const c=b.parentElement.querySelector('code');if(c){const r=document.createRange();r.selectNodeContents(c);const s=getSelection();s.removeAllRanges();s.addRange(r);}}};
  try{navigator.clipboard.writeText(txt).then(()=>done(true),()=>done(false));}catch(err){done(false);}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-lb]');if(!b)return;$('#lbImg').src=b.dataset.lb;$('#lbImg').alt=b.dataset.cap||'';$('#lbCap').textContent=b.dataset.cap||'';openOv($('#lb'));});

/* ---------- Demo-toast ---------- */
EU.toast=(id,msg)=>{const t=$('#toast-'+id);if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2600);};
EU.inView=el=>{const r=el.getBoundingClientRect();return r.bottom>60&&r.top<innerHeight-60;};
EU.typing=()=>{const a=document.activeElement;return a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName);};

/* ---------- Snabbfrågor ---------- */
const CHIPS=[
 ["Vem är du?", "Who are you?", "Jag heter Emil Uzeirovic, är 19 år och bor i Halmstad. Jag utbildar mig till mjukvaruutvecklare på Folkuniversitetet YH och bygger allt från desktop-appar i Rust till kompletta system för spelservrar. Just nu söker jag en LIA-plats där jag kan bidra på riktigt och växa i ett team.", "I'm Emil Uzeirovic, 19, based in Halmstad. I'm training to become a software developer at Folkuniversitetet YH and I build everything from desktop apps in Rust to complete systems for game servers. Right now I'm looking for an internship where I can contribute for real and grow within a team."],
 ["Varför anställa dig?", "Why hire you?", "Tre saker. Jag levererar: Procyon är en fungerande processmonitor i Rust som pratar direkt med Windows API, och mina FiveM-system har både backend i Lua och gränssnitt i JavaScript. Jag lär mig snabbt: frontend, Java, Rust och Lua på kort tid, med Git som grund. Och jag tänker framåt: jag lär mig AI för att kunna bygga in det i era produkter, inte bara använda det.", "Three things. I deliver: Procyon is a working process monitor in Rust that talks directly to the Windows API, and my FiveM systems cover both a Lua backend and a JavaScript interface. I learn fast: front-end, Java, Rust and Lua in a short time, with Git as the foundation. And I think ahead: I'm learning AI so I can build it into your products, not just use it."],
 ["Vad är ditt bästa projekt?", "What is your best project?", "Procyon. Det är en öppen processmonitor för Windows byggd i Rust med egui. Den hämtar data via sysinfo, ritar en live-tabell med CPU, minne och processträd, och använder Win32-anrop för att ändra prioritet, pausa och avsluta processer. Koden är medvetet liten och läsbar så att vem som helst kan granska den. Du kan prova en kopia under Projekt.", "Procyon. It's an open-source process monitor for Windows built in Rust with egui. It gathers data through sysinfo, draws a live table with CPU, memory and the process tree, and uses Win32 calls to change priority, suspend and end processes. The code is deliberately small and readable so anyone can review it. You can try a copy under Projects."],
 ["Hur jobbar du med AI?", "How do you work with AI?", "Jag lär mig AI på djupet med ett tydligt mål: att kunna implementera det i verkliga produkter på en arbetsplats. Det kan vara AI-funktioner i appar, automatisering av återkommande arbete eller tjänster som blir smartare över tid. För mig är AI ett verktyg som skapar värde för både företag och användare.", "I'm learning AI in depth with a clear goal: to implement it in real products at a company. That could be AI features in apps, automating repetitive work or services that get smarter over time. To me AI is a tool that creates value for both businesses and users."],
 ["Vad kan du tekniskt?", "What are your technical skills?", "Frontend med HTML, CSS och JavaScript, med fokus på tydliga gränssnitt och mjuka animationer. Java från utbildningen, Rust för systemnära desktop-appar och Lua för serverlogik i QBCore och ESX. Jag arbetar med Git och GitHub, och fördjupar mig just nu i AI och hur det integreras i produkter.", "Front-end with HTML, CSS and JavaScript, focusing on clear interfaces and smooth animations. Java from my studies, Rust for low-level desktop apps and Lua for server logic in QBCore and ESX. I work with Git and GitHub, and I'm currently going deep on AI and how it's integrated into products."],
 ["Vad pluggar du?", "What do you study?", "Mjukvaruutvecklare inom mobilitetstjänster på Folkuniversitetet YH i Göteborg. Jag har klarat 100 YH-poäng: frontend (40), Java (30), versionshantering med Git (20) och utveckling av tjänster (10). Nästa del av utbildningen är LIA, och det är där jag vill komma in hos er.", "Software development in mobility services at Folkuniversitetet YH in Gothenburg. I've completed 100 credits: front-end (40), Java (30), version control with Git (20) and service development (10). The next part of the programme is the internship, and that's where I'd like to join you."],
 ["Söker du LIA?", "Looking for an internship?", "Ja, just nu. Jag söker en LIA-plats inom webb, appar, tjänster eller AI, och på sikt ett jobb. Jag vill vara i ett team där jag får bygga saker som används på riktigt och lära mig av erfarna utvecklare. Tryck på \"Säg hej 👋\" eller mejla uzeirovicemil44@gmail.com.", "Yes, right now. I'm looking for an internship in web, apps, services or AI, and a job later on. I want to be part of a team where I build things people actually use and learn from experienced developers. Hit \"Say hi 👋\" or email uzeirovicemil44@gmail.com."],
 ["Vad har du byggt för FiveM?", "What have you built for FiveM?", "Kompletta system i QBCore och ESX. Nordvik Bank har internetbank, bankomat med PIN och kortbeställning som delar samma saldo. Svea Roleplay har pausmeny, anpassningsbart HUD, fakturor och en adminpanel där reports från spelare hamnar direkt. Logiken skriver jag i Lua och gränssnitten i HTML, CSS och JavaScript.", "Complete systems in QBCore and ESX. Nordvik Bank has online banking, an ATM with PIN and card ordering that all share the same balance. Svea Roleplay has a pause menu, a customizable HUD, invoices and an admin panel where player reports land directly. I write the logic in Lua and the interfaces in HTML, CSS and JavaScript."],
 ["Hur lär du dig nya saker?", "How do you learn new things?", "Genom att bygga. När jag vill förstå något nytt startar jag ett eget projekt, som när jag lärde mig Rust genom att bygga Procyon. Jag sitter med egna projekt, små som stora, på fritiden och försöker bli lite bättre varje dag.", "By building. When I want to understand something new I start a project of my own, like learning Rust by building Procyon. I work on my own projects, big and small, in my free time and try to get a little better every day."],
 ["Var bor du?", "Where are you based?", "Jag bor i Halmstad och pluggar på Folkuniversitetet YH i Göteborg.", "I live in Halmstad and study at Folkuniversitetet YH in Gothenburg."],
 ["Hur når jag dig?", "How do I reach you?", "Mejla mig på uzeirovicemil44@gmail.com, skriv till mig på LinkedIn eller tryck på \"Säg hej 👋\" uppe till höger. Koden hittar du på github.com/33anDev.", "Email me at uzeirovicemil44@gmail.com, message me on LinkedIn or hit \"Say hi 👋\" in the top right. You'll find my code at github.com/33anDev."]
];
const log=$('#chatlog');let busy=false,talked=false;
function bub(who,txt){const d=document.createElement('div');d.className='msg '+who;d.textContent=txt;log.appendChild(d);log.scrollTop=log.scrollHeight;return d;}
function chatIntro(){if(talked)return;log.innerHTML='';bub('bot',T('Hej! 👋 Klicka på en fråga nedanför så berättar jag mer om mig.','Hi! 👋 Click a question below and I\'ll tell you more about me.'));}
const asked=new Set();
function renderChips(){$('#chips').innerHTML=CHIPS.map((c,i)=>`<button type="button" data-ci="${i}" class="${asked.has(i)?'used':''}">${esc(LANG==='en'?c[1]:c[0])}</button>`).join('');}
async function ask(i){
  if(busy)return;busy=true;talked=true;const c=CHIPS[i];asked.add(i);
  $$('#chips button').forEach(b=>{b.disabled=true;if(+b.dataset.ci===i)b.classList.add('used');});
  bub('me',LANG==='en'?c[1]:c[0]);
  const ans=LANG==='en'?c[3]:c[2];
  const b=bub('bot',T('Skriver','Typing'));b.classList.add('wait');
  await new Promise(r=>setTimeout(r,500));b.classList.remove('wait');b.textContent='';
  let k=0;await new Promise(res=>{const t=setInterval(()=>{k=Math.min(ans.length,k+3);b.textContent=ans.slice(0,k);log.scrollTop=log.scrollHeight;if(k>=ans.length){clearInterval(t);res();}},14);});
  busy=false;$$('#chips button').forEach(x=>x.disabled=false);
}
$('#chips').addEventListener('click',e=>{const b=e.target.closest('[data-ci]');if(b)ask(+b.dataset.ci);});
EU.onLang(()=>{renderChips();chatIntro();});

applyLang(false);
})();
