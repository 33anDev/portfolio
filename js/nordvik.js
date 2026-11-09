(function(){
'use strict';
const {$,$$,esc,kr,toast}=EU;
const IC={
 home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
 send:'<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 wallet:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/>',
 card:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
 out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
 down:'<path d="M12 5v14M5 12l7 7 7-7"/>',up:'<path d="M12 19V5M5 12l7-7 7 7"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 4a3.5 3.5 0 0 1 0 7M22 21a7 7 0 0 0-4-6.3"/>',
 brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
 receipt:'<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
 eject:'<path d="M12 4l8 10H4z"/><path d="M4 19h16"/>',
 piggy:'<path d="M19 9c1 0 2 1 2 2v2h-2l-1 3h-2v2h-3v-2H9v2H6v-2.5A6 6 0 0 1 10 5h3a6 6 0 0 1 6 4z"/><circle cx="15" cy="10" r=".8"/>'
};
const ic=(n,s)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${s||''}>${IC[n]}</svg>`;
const LOGO=`<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M6 27V8l11 12 11-12v19" fill="none" stroke="url(#nvg2)" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M10 18h14" stroke="#ffc93d" stroke-width="3" stroke-linecap="round"/><defs><linearGradient id="nvg2" x1="0" x2="1"><stop offset="0" stop-color="#4f6bff"/><stop offset="1" stop-color="#8b6bff"/></linearGradient></defs></svg>`;
const MON=['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];
const stamp=()=>{const d=new Date();return d.getDate()+' '+MON[d.getMonth()]+' · '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
const NV={};
function init(){
  Object.assign(NV,{view:'ov',out:false,first:'Elsa',name:'Elsa Lindqvist',acct:'SVE48213',cash:3420,pin:'1234',
   card:{last:'4821',exp:'10/30'},newCard:false,
   accs:[{id:'lon',n:'Lönekonto',t:'Privatkonto',b:48250,ic:'user'},{id:'spar',n:'Sparkonto',t:'Delat konto',b:120000,ic:'users'},{id:'ftg',n:'Företag · police',t:'Företagskonto',b:1250000,ic:'brief'}],
   tx:[{t:'Lön Svea Taxi',a:8400,acc:'lon',d:'30 okt · 02:32'},{t:'Bankomatuttag',a:-1000,acc:'lon',d:'29 okt · 23:32'},{t:'Hyra lägenhet',a:-6500,acc:'lon',d:'29 okt · 02:32'},{t:'Swish från Oskar',a:450,acc:'lon',d:'28 okt · 22:32'},{t:'Pizzeria Napoli',a:-189,acc:'lon',d:'28 okt · 02:31'},{t:'Insättning sparande',a:2000,acc:'spar',d:'27 okt · 18:10'},{t:'Bilverkstad Mekka',a:-12400,acc:'ftg',d:'26 okt · 14:02'},{t:'Uppdrag Polisen',a:45000,acc:'ftg',d:'25 okt · 09:15'}],
   mv:{acc:'lon',amt:'',msg:'',res:'',rc:''},xf:{from:'lon',mode:'own',to:'spar',who:'',amt:'',msg:'',res:'',rc:''},tf:'all',ta:'all',cd:{p1:'',p2:'',res:'',rc:''},
   atm:{s:'pin',pin:'',acc:0,msg:'',mc:'',rc:null}});
  setView('bank');render();atmRender();pinHint();
}
const acc=id=>NV.accs.find(a=>a.id===id);
const total=()=>NV.accs.reduce((s,a)=>s+a.b,0);
function addTx(t,a,accId){NV.tx.unshift({t,a,acc:accId,d:stamp(),fresh:true});}
function pinHint(){$('#pinHint').textContent=NV.pin;}
function greet(){const h=new Date().getHours();return h<10?'God morgon':h<18?'Hej':'God kväll';}
function card(cw,cls){return `<div class="ncard tilt ${cls||''}" style="--cw:${cw}px"><svg class="waves" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 70 C40 20 80 90 120 45 S180 10 200 30" fill="none" stroke="#6f6bff" stroke-width="3" opacity=".9"/><path d="M0 80 C50 40 90 95 130 60 S185 35 200 50" fill="none" stroke="#5b8cff" stroke-width="2" opacity=".7"/><path d="M0 60 C40 30 70 70 120 35 S170 0 200 15" fill="none" stroke="#a78bfa" stroke-width="1" opacity=".5"/></svg><span class="shine"></span><span class="t1">${LOGO.replace('nvg2','nvgc'+cw).replace('nvg2','nvgc'+cw)}Nordvik</span><span class="deb">debit</span><span class="chip"></span><span class="nfc">)))</span><span class="num">•••• ${NV.card.last}</span><span class="nm">${esc(NV.name)}</span><span class="ex">${NV.card.exp}</span><span class="nova">NOVA</span></div>`;}
function txRow(x){const inn=x.a>0;return `<div class="nb-tx"><span class="d ${inn?'in':'out'}">${ic(inn?'down':'up')}</span><div><b>${esc(x.t)}</b><small>${x.d}${NV.view==='tx'?' · '+esc(acc(x.acc).n):''}</small></div><span class="v ${inn?'in':'out'}">${inn?'+':''}${kr(x.a)} kr</span></div>`;}
const NAV=[['ov','home','Översikt'],['mv','cash','Insättning & uttag'],['xf','send','Överföring'],['tx','list','Kontohändelser'],['ac','wallet','Konton'],['cd','card','Bankkort']];
function render(){
  const nb=$('#nb');
  const side=`<aside class="nb-side"><div class="nb-brand">${LOGO}<div><b>Nordvik</b><small>BANK</small></div></div>
   <div class="nb-user"><span class="av">EL</span><div><b>${esc(NV.name)}</b><small>Kontonr <em>${NV.acct}</em></small></div></div>
   ${NAV.map(([k,i,t])=>`<button type="button" class="nb-nav ${NV.view===k?'on':''}" data-go="${k}">${ic(i)}${t}</button>`).join('')}
   <button type="button" class="nb-nav nb-out" data-logout>${ic('out')}Logga ut</button></aside>`;
  nb.innerHTML=side+`<main class="nb-main" id="nbMain">${views[NV.view]()}</main>`+(NV.out?outScreen():'');
  bindView();
}
function outScreen(){return `<div class="nb-out-screen">${LOGO.replace('nvg2','nvgo')}<h4>Du är utloggad</h4><p>Tack för att du använder Nordvik Bank.</p><button type="button" class="nb-pri" data-login>Logga in med BankID</button></div>`;}
const views={
 ov(){const l=acc('lon');return `<div><div class="nb-ey">ÖVERSIKT</div><h4 class="nb-h">${greet()}, <em>${NV.first}</em></h4></div>
  <div class="nb-g ovw"><div style="display:flex;flex-direction:column;gap:14px;min-width:0">
   <div class="nb-c nb-bal"><div class="lab">LÖNEKONTO · TILLGÄNGLIGT</div><div class="amt">${kr(l.b)}<small>kr</small></div>
    <div class="nb-chips"><span>${ic('cash','width="14" height="14"')} Kontanter <b>${kr(NV.cash)} kr</b></span><span>${ic('wallet','width="14" height="14"')} Alla konton <b>${kr(total())} kr</b></span></div></div>
   <div class="nb-q">
    <button type="button" data-go="mv">${ic('down')}<b>Sätt in</b><small>Kontanter till konto</small></button>
    <button type="button" data-go="mv">${ic('up')}<b>Ta ut</b><small>Konto till kontanter</small></button>
    <button type="button" data-go="xf">${ic('send')}<b>Skicka</b><small>Till annan person</small></button>
    <button type="button" data-go="cd">${ic('card')}<b>Kort</b><small>Beställ nytt kort</small></button></div>
   <div class="nb-g two">
    <div class="nb-c"><div class="lab">DINA KONTON <button type="button" data-go="ac">Hantera</button></div>${NV.accs.map(a=>`<div class="nb-acc"><span class="ai2">${ic(a.ic)}</span><div><b>${esc(a.n)}</b><small>${esc(a.t)}</small></div><span class="v">${kr(a.b)} kr</span></div>`).join('')}</div>
    <div class="nb-c"><div class="lab">SENASTE HÄNDELSER <button type="button" data-go="tx">Visa alla</button></div>${NV.tx.slice(0,5).map(txRow).join('')}</div>
   </div></div>
   <div class="nb-c nb-cardcol"><div class="lab" style="align-self:stretch">DITT KORT</div>${card(190)}<p>Använd kortet i alla <b>bankomater</b> i staden.</p>
    <button type="button" class="nb-btn" data-go="cd" style="align-self:stretch">+ Nytt kort</button><button type="button" class="nb-pri" data-goatm style="align-self:stretch">Till bankomaten →</button></div></div>`;},
 mv(){const m=NV.mv,a=acc(m.acc);return `<div><div class="nb-ey">INSÄTTNING &amp; UTTAG</div><h4 class="nb-h">Flytta <em>pengar</em></h4></div>
  <div class="nb-g two"><div class="nb-c"><span class="nb-lbl">KONTO</span><div class="nb-tabs">${NV.accs.map(x=>`<button type="button" class="${x.id===m.acc?'on':''}" data-mvacc="${x.id}">${esc(x.n)}<small>${kr(x.b)} kr</small></button>`).join('')}</div>
   <span class="nb-lbl">BELOPP</span><label class="nb-amt"><input id="mvAmt" type="number" inputmode="numeric" min="1" placeholder="0" value="${esc(m.amt)}" aria-label="Belopp"><span>kr</span></label>
   <div class="nb-quick">${[100,500,1000,5000].map(v=>`<button type="button" data-mvq="${v}">${kr(v)}</button>`).join('')}<button type="button" data-mvq="all">Alla kontanter</button></div>
   <span class="nb-lbl">MEDDELANDE (VALFRITT)</span><input class="nb-in" id="mvMsg" placeholder="T.ex. Hyra" value="${esc(m.msg)}" maxlength="40">
   <div class="nb-row2"><button type="button" class="nb-pri" data-mv="in">${ic('down','width="16" height="16"')} Sätt in</button><button type="button" class="nb-btn" data-mv="out">${ic('up','width="16" height="16" style="vertical-align:-3px"')} Ta ut</button></div>
   <div class="nb-msg ${m.rc}">${esc(m.res)}</div></div>
  <div class="nb-c"><span class="nb-lbl">SALDO</span>
   <div class="nb-acc"><span class="ai2">${ic('cash')}</span><div><b>Kontanter</b><small>I fickan</small></div><span class="v">${kr(NV.cash)} kr</span></div>
   <div class="nb-acc"><span class="ai2">${ic(a.ic)}</span><div><b>${esc(a.n)}</b><small>${esc(a.t)}</small></div><span class="v">${kr(a.b)} kr</span></div>
   <span class="nb-lbl" style="margin-top:6px">HÄNDELSER PÅ KONTOT</span>${NV.tx.filter(x=>x.acc===m.acc).slice(0,5).map(txRow).join('')||'<p class="nb-msg">Inga händelser än.</p>'}</div></div>`;},
 xf(){const f=NV.xf;return `<div><div class="nb-ey">ÖVERFÖRING</div><h4 class="nb-h">Skicka <em>pengar</em></h4></div>
  <div class="nb-g two"><div class="nb-c">
   <span class="nb-lbl">FRÅN</span><select class="nb-sel" id="xfFrom">${NV.accs.map(x=>`<option value="${x.id}" ${x.id===f.from?'selected':''}>${esc(x.n)} (${kr(x.b)} kr)</option>`).join('')}</select>
   <span class="nb-lbl">TILL</span><div class="nb-radio"><button type="button" class="${f.mode==='own'?'on':''}" data-xfm="own">Eget konto</button><button type="button" class="${f.mode==='person'?'on':''}" data-xfm="person">Annan person</button></div>
   ${f.mode==='own'?`<select class="nb-sel" id="xfTo">${NV.accs.filter(x=>x.id!==f.from).map(x=>`<option value="${x.id}" ${x.id===f.to?'selected':''}>${esc(x.n)}</option>`).join('')}</select>`:`<input class="nb-in" id="xfWho" placeholder="Mottagare, t.ex. Oskar Berg" value="${esc(f.who)}" maxlength="30">`}
   <span class="nb-lbl">BELOPP</span><label class="nb-amt"><input id="xfAmt" type="number" inputmode="numeric" min="1" placeholder="0" value="${esc(f.amt)}" aria-label="Belopp"><span>kr</span></label>
   <input class="nb-in" id="xfMsg" placeholder="Meddelande (valfritt)" value="${esc(f.msg)}" maxlength="40">
   <button type="button" class="nb-pri" data-xfgo>${ic('send','width="16" height="16"')} Skicka</button><div class="nb-msg ${f.rc}">${esc(f.res)}</div></div>
  <div class="nb-c"><span class="nb-lbl">SENASTE ÖVERFÖRINGAR</span>${NV.tx.filter(x=>/^Till |^Från |Överföring/.test(x.t)).slice(0,6).map(txRow).join('')||'<p class="nb-msg">Inga överföringar än. Prova att skicka något!</p>'}</div></div>`;},
 tx(){let l=NV.tx.filter(x=>(NV.ta==='all'||x.acc===NV.ta)&&(NV.tf==='all'||(NV.tf==='in'?x.a>0:x.a<0)));
  const sin=l.filter(x=>x.a>0).reduce((s,x)=>s+x.a,0),sout=l.filter(x=>x.a<0).reduce((s,x)=>s+x.a,0);
  return `<div><div class="nb-ey">KONTOHÄNDELSER</div><h4 class="nb-h">Alla <em>händelser</em></h4></div>
  <div class="nb-c"><div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><div class="nb-radio" style="flex:1;min-width:240px">${[['all','Alla'],['in','In'],['out','Ut']].map(([k,t])=>`<button type="button" class="${NV.tf===k?'on':''}" data-tf="${k}">${t}</button>`).join('')}</div>
   <select class="nb-sel" id="txAcc" style="width:auto;flex:1;min-width:180px"><option value="all">Alla konton</option>${NV.accs.map(x=>`<option value="${x.id}" ${NV.ta===x.id?'selected':''}>${esc(x.n)}</option>`).join('')}</select></div>
   <div class="nb-chips"><span>In <b style="color:#3ddc97">+${kr(sin)} kr</b></span><span>Ut <b>${kr(sout)} kr</b></span><span>${l.length} händelser</span></div>
   <div>${l.map(txRow).join('')||'<p class="nb-msg">Inga händelser matchar filtret.</p>'}</div></div>`;},
 ac(){const t=total();return `<div><div class="nb-ey">KONTON</div><h4 class="nb-h">Dina <em>konton</em></h4></div>
  <div class="nb-c nb-bal"><div class="lab">TOTALT PÅ ALLA KONTON</div><div class="amt">${kr(t)}<small>kr</small></div></div>
  <div class="nb-g" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">${NV.accs.map(a=>`<div class="nb-c"><div class="nb-acc" style="border:0;padding:0"><span class="ai2">${ic(a.ic)}</span><div><b>${esc(a.n)}</b><small>${esc(a.t)}</small></div></div>
   <div style="font-size:28px;font-weight:800;letter-spacing:-.04em">${kr(a.b)} kr</div><div class="nb-share"><i style="--w:${(a.b/t*100).toFixed(1)}%"></i></div><small style="color:var(--nv-muted)">${(a.b/t*100).toFixed(1)} % av totalen</small>
   <button type="button" class="nb-btn" data-go="mv" data-mvacc2="${a.id}">Flytta pengar</button></div>`).join('')}</div>`;},
 cd(){const c=NV.cd,l=acc('lon');return `<div><div class="nb-ey">BANKKORT</div><h4 class="nb-h">Beställ <em>nytt kort</em></h4></div>
  <div class="nb-g two"><div class="nb-c" style="align-items:center;justify-content:center;gap:16px;min-height:360px">${card(240,NV.newCard?'flip':'')}<p style="font-size:13px;color:var(--nv-muted)">Aktivt kort slutar på <b style="color:#fff">${NV.card.last}</b> · PIN i bankomaten: <b style="color:#fff">${'•'.repeat(4)}</b></p></div>
  <div class="nb-c"><span class="nb-lbl">VÄLJ PIN-KOD</span>
   <label class="nb-lbl" for="cdP1" style="letter-spacing:.14em">PIN-KOD (4 SIFFROR)</label><input class="nb-in" id="cdP1" type="password" inputmode="numeric" maxlength="4" placeholder="••••" value="${esc(c.p1)}" autocomplete="off">
   <label class="nb-lbl" for="cdP2" style="letter-spacing:.14em">UPPREPA PIN-KOD</label><input class="nb-in" id="cdP2" type="password" inputmode="numeric" maxlength="4" placeholder="••••" value="${esc(c.p2)}" autocomplete="off">
   <div class="nb-fee"><span class="ai2">${ic('receipt','width="18" height="18"')}</span><div><b>Kortavgift</b><small>Dras från lönekontot (${kr(l.b)} kr)</small></div><span class="v">250 kr</span></div>
   <div class="nb-warn">⚠️ <span>Ditt gamla kort <b>spärras</b> och tas bort när du får det nya.</span></div>
   <button type="button" class="nb-pri" data-cdgo>${ic('card','width="16" height="16"')} Beställ nytt kort</button><div class="nb-msg ${c.rc}">${esc(c.res)}</div></div></div>`;}
};
function bindView(){
  const on=(id,ev,f)=>{const el=$('#'+id);if(el)el.addEventListener(ev,f);};
  on('mvAmt','input',e=>NV.mv.amt=e.target.value);on('mvMsg','input',e=>NV.mv.msg=e.target.value);
  on('xfAmt','input',e=>NV.xf.amt=e.target.value);on('xfMsg','input',e=>NV.xf.msg=e.target.value);on('xfWho','input',e=>NV.xf.who=e.target.value);
  on('xfFrom','change',e=>{NV.xf.from=e.target.value;if(NV.xf.to===NV.xf.from)NV.xf.to=NV.accs.find(a=>a.id!==NV.xf.from).id;render();});
  on('xfTo','change',e=>NV.xf.to=e.target.value);
  on('txAcc','change',e=>{NV.ta=e.target.value;render();});
  on('cdP1','input',e=>{e.target.value=e.target.value.replace(/\D/g,'');NV.cd.p1=e.target.value;});
  on('cdP2','input',e=>{e.target.value=e.target.value.replace(/\D/g,'');NV.cd.p2=e.target.value;});
}
function go(v){NV.view=v;NV.newCard=false;render();}
$('#nb').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.login!==undefined){b.textContent='Väntar på BankID…';b.disabled=true;setTimeout(()=>{NV.out=false;NV.view='ov';render();toast('nv','Inloggad med BankID ✓');},1100);return;}
  if(d.logout!==undefined){NV.out=true;render();return;}
  if(d.goatm!==undefined){setView('atm');return;}
  if(d.mvacc2){NV.mv.acc=d.mvacc2;}
  if(d.go){go(d.go);return;}
  if(d.mvacc){NV.mv.acc=d.mvacc;NV.mv.res='';render();return;}
  if(d.mvq){NV.mv.amt=d.mvq==='all'?String(NV.cash):String(d.mvq);const i=$('#mvAmt');if(i)i.value=NV.mv.amt;return;}
  if(d.mv){const m=NV.mv,a=acc(m.acc),v=parseInt(m.amt,10);
    if(!v||v<=0){m.res='Skriv ett belopp först.';m.rc='err';render();$('#mvAmt').focus();return;}
    if(d.mv==='in'){if(v>NV.cash){m.res=`Du har bara ${kr(NV.cash)} kr i kontanter.`;m.rc='err';render();return;}
      NV.cash-=v;a.b+=v;addTx(m.msg||'Insättning',v,a.id);m.res=`${kr(v)} kr insatt på ${a.n}.`;toast('nv',`💸 ${kr(v)} kr insatt på ${a.n}`);}
    else{if(v>a.b){m.res=`Det finns bara ${kr(a.b)} kr på ${a.n}.`;m.rc='err';render();return;}
      a.b-=v;NV.cash+=v;addTx(m.msg||'Uttag',-v,a.id);m.res=`${kr(v)} kr uttaget till kontanter.`;toast('nv',`💵 ${kr(v)} kr uttaget från ${a.n}`);}
    m.rc='ok';m.amt='';m.msg='';render();return;}
  if(d.xfm){NV.xf.mode=d.xfm;NV.xf.res='';render();return;}
  if(d.xfgo!==undefined){const f=NV.xf,a=acc(f.from),v=parseInt(f.amt,10);
    if(!v||v<=0){f.res='Skriv ett belopp.';f.rc='err';render();return;}
    if(v>a.b){f.res=`Det finns bara ${kr(a.b)} kr på ${a.n}.`;f.rc='err';render();return;}
    if(f.mode==='person'){const w=f.who.trim();if(w.length<2){f.res='Skriv vem pengarna ska till.';f.rc='err';render();$('#xfWho').focus();return;}
      a.b-=v;addTx('Till '+w+(f.msg?': '+f.msg:''),-v,a.id);f.res=`${kr(v)} kr skickat till ${w}.`;toast('nv',`📨 ${kr(v)} kr skickat till ${w}`);f.who='';}
    else{const t=acc(f.to);a.b-=v;t.b+=v;addTx('Överföring till '+t.n,-v,a.id);addTx('Överföring från '+a.n,v,t.id);f.res=`${kr(v)} kr flyttat till ${t.n}.`;toast('nv',`🔁 ${kr(v)} kr flyttat till ${t.n}`);}
    f.rc='ok';f.amt='';f.msg='';render();return;}
  if(d.tf){NV.tf=d.tf;render();return;}
  if(d.cdgo!==undefined){const c=NV.cd,l=acc('lon');
    if(!/^\d{4}$/.test(c.p1)){c.res='PIN-koden måste vara 4 siffror.';c.rc='err';render();return;}
    if(c.p1!==c.p2){c.res='PIN-koderna matchar inte.';c.rc='err';c.p2='';render();$('#cdP2').focus();return;}
    if(l.b<250){c.res='Det finns inte 250 kr på lönekontot.';c.rc='err';render();return;}
    l.b-=250;addTx('Kortavgift',-250,'lon');NV.pin=c.p1;NV.card.last=String(1000+Math.floor(Math.random()*9000));const d2=new Date();NV.card.exp=String(d2.getMonth()+1).padStart(2,'0')+'/'+String((d2.getFullYear()+4)%100);
    NV.newCard=true;c.res=`Klart! Nytt kort slutar på ${NV.card.last}. Din nya PIN funkar i bankomaten.`;c.rc='ok';c.p1='';c.p2='';
    render();NV.newCard=false;pinHint();NV.atm={s:'pin',pin:'',acc:0,msg:'',mc:'',rc:null};atmRender();toast('nv','💳 Nytt kort beställt! Prova din nya PIN i bankomaten!');return;}
});
/* 3D-kort */
document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.ncard.tilt');if(!c)return;const r=c.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  c.style.setProperty('--ry',((x-.5)*22).toFixed(1)+'deg');c.style.setProperty('--rx',((.5-y)*18).toFixed(1)+'deg');c.style.setProperty('--sx',(x*100)+'%');c.style.setProperty('--sy',(y*100)+'%');},{passive:true});
document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest('.ncard.tilt');if(c&&!c.contains(e.relatedTarget)){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg');}});

/* ---------- Bankomat ---------- */
const scr=$('#atmScr');
function atmRender(){
  const A=NV.atm,a=NV.accs[A.acc];let h='';
  if(A.s==='pin')h=`<div class="atm-h"><span class="ey">VÄLKOMMEN</span><h4>Ange din <em>PIN-kod</em></h4><p>Kort som slutar på ${NV.card.last}</p></div>
    <div class="atm-dots" id="atmDots">${[0,1,2,3].map(k=>`<i class="${k<A.pin.length?'on':''}"></i>`).join('')}</div>
    <div class="pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-k="${n}">${n}</button>`).join('')}<button type="button" class="del" data-k="del" aria-label="Radera">⌫</button><button type="button" data-k="0">0</button><button type="button" class="ok" data-k="ok">OK</button></div>`;
  else if(A.s==='menu')h=`<div class="atm-h"><span class="ey">HEJ ${NV.first.toUpperCase()}</span><h4>Vad vill du <em>göra</em>?</h4></div>
    <div class="atm-h"><span class="ey" style="color:var(--nv-muted)">${esc(a.n.toUpperCase())}</span></div><div class="atm-bal">${kr(a.b)}<small>kr</small></div>
    <div class="nb-tabs" style="justify-content:center">${NV.accs.map((x,k)=>`<button type="button" data-acc="${k}" class="${k===A.acc?'on':''}">${esc(x.n)}<small>${kr(x.b)} kr</small></button>`).join('')}</div>
    <div class="atm-grid"><button type="button" data-atm="wd">${ic('cash')}<b>Uttag</b><small>Ta ut kontanter</small></button><button type="button" data-atm="dp">${ic('piggy')}<b>Insättning</b><small>Du har ${kr(NV.cash)} kr</small></button>
    <button type="button" data-atm="rc">${ic('receipt')}<b>Saldo &amp; kvitto</b><small>Senaste händelser</small></button><button type="button" data-atm="end">${ic('eject')}<b>Avsluta</b><small>Ta ut kortet</small></button></div>`;
  else if(A.s==='wd'||A.s==='dp'){const w=A.s==='wd';h=`<div class="atm-h"><span class="ey">${w?'UTTAG':'INSÄTTNING'}</span><h4>Välj <em>belopp</em></h4><p>${w?esc(a.n)+': '+kr(a.b)+' kr':'Kontanter i fickan: '+kr(NV.cash)+' kr'}</p></div>
    <div class="amts">${[100,200,500,1000,2000,5000].map(v=>`<button type="button" class="nvb" data-amt="${v}">${kr(v)} kr</button>`).join('')}</div>
    <div class="atm-h" style="text-align:left"><span class="ey" style="color:var(--nv-muted)">ANNAT BELOPP</span></div>
    <div class="atm-o"><input id="atmO" type="number" inputmode="numeric" placeholder="0" aria-label="Annat belopp"><button type="button" class="nb-pri" data-amt="o">OK</button></div>
    <button type="button" class="atm-back" data-atm="menu">← Tillbaka</button>`;}
  else if(A.s==='rc')h=`<div class="atm-h"><span class="ey">KVITTO</span><h4>Saldo &amp; <em>kvitto</em></h4></div>
    <div class="rcpt"><div class="c">NORDVIK BANK · BANKOMAT<br>${stamp()}</div><div class="r"><span>KONTO</span><span>${esc(a.n)}</span></div><div class="r"><span>KORT</span><span>•••• ${NV.card.last}</span></div><div class="r" style="font-weight:700"><span>SALDO</span><span>${kr(a.b)} kr</span></div><div class="c" style="border-top:1px dashed #999;border-bottom:0;padding-top:6px;margin-top:4px">SENASTE</div>
    ${NV.tx.filter(x=>x.acc===a.id).slice(0,6).map(x=>`<div class="r"><span>${esc(x.t.slice(0,18))}</span><span>${x.a>0?'+':''}${kr(x.a)}</span></div>`).join('')}</div>
    <button type="button" class="atm-back" data-atm="menu">← Tillbaka</button>`;
  else if(A.s==='bye')h=`<div class="atm-h" style="margin:auto 0"><span class="ey">TACK</span><h4>Glöm inte <em>kortet</em>!</h4><p>Kontanter i fickan: ${kr(NV.cash)} kr</p></div>
    <button type="button" class="nb-pri" data-atm="pin" style="align-self:center">Sätt in kortet igen</button>`;
  h+=`<div class="atm-msg ${A.mc}">${esc(A.msg)}</div>`;
  scr.innerHTML=h;
}
function bills(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=document.createElement('div');c.className='cash';
  for(let i=0;i<5;i++){const b=document.createElement('i');b.style.setProperty('--dx',((Math.random()-.5)*160)+'px');b.style.setProperty('--rot',((Math.random()-.5)*60)+'deg');b.style.animationDelay=(i*90)+'ms';c.appendChild(b);}
  scr.appendChild(c);setTimeout(()=>c.remove(),1700);}
scr.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const A=NV.atm;A.msg='';A.mc='';
  if(b.dataset.k!==undefined){const k=b.dataset.k;
    if(k==='del')A.pin=A.pin.slice(0,-1);
    else if(k==='ok'){if(A.pin===NV.pin){A.s='menu';A.pin='';}else{A.pin='';A.msg='Fel PIN-kod. Försök igen.';A.mc='err';atmRender();$('#atmDots').classList.add('shake');return;}}
    else if(A.pin.length<4){A.pin+=k;if(A.pin.length===4){atmRender();setTimeout(()=>{if(NV.atm.s==='pin'&&NV.atm.pin.length===4){const o=scr.querySelector('[data-k="ok"]');o&&o.click();}},250);return;}}
    atmRender();return;}
  if(b.dataset.acc!==undefined){A.acc=+b.dataset.acc;atmRender();return;}
  if(b.dataset.amt!==undefined){const v=b.dataset.amt==='o'?parseInt($('#atmO').value,10):+b.dataset.amt;const a=NV.accs[A.acc];
    if(!v||v<=0){A.msg='Skriv ett belopp först.';A.mc='err';atmRender();return;}
    if(A.s==='wd'){if(v>a.b){A.msg='Det finns inte så mycket på kontot.';A.mc='err';atmRender();return;}
      a.b-=v;NV.cash+=v;addTx('Bankomatuttag',-v,a.id);A.s='menu';A.msg='Ta dina '+kr(v)+' kr.';A.mc='okc';atmRender();bills();toast('nv','💵 '+kr(v)+' kr uttaget och syns direkt i internetbanken');}
    else{if(v>NV.cash){A.msg='Du har bara '+kr(NV.cash)+' kr i fickan.';A.mc='err';atmRender();return;}
      a.b+=v;NV.cash-=v;addTx('Insättning bankomat',v,a.id);A.s='menu';A.msg=kr(v)+' kr insatt.';A.mc='okc';atmRender();toast('nv','🐷 '+kr(v)+' kr insatt på '+a.n);}
    return;}
  const s=b.dataset.atm;if(s){A.s=s==='end'?'bye':s;atmRender();}
});
$('#atmX').addEventListener('click',()=>{if(NV.atm.s!=='pin'){NV.atm.s='bye';atmRender();}});
document.addEventListener('keydown',e=>{
  if(NV.atm.s!=='pin'||$('#nvAtmView').hidden||EU.typing()||!EU.inView(scr))return;
  if(!/^[0-9]$|^Backspace$|^Enter$/.test(e.key))return;
  const k=e.key==='Backspace'?'del':e.key==='Enter'?'ok':e.key;const btn=scr.querySelector(`[data-k="${k}"]`);if(btn){e.preventDefault();btn.click();}
});
function setView(v){$('#nvBankView').hidden=v!=='bank';$('#nvAtmView').hidden=v!=='atm';$$('#nvSeg button').forEach(b=>b.classList.toggle('on',b.dataset.nv===v));if(v==='bank')render();else atmRender();}
$('#nvSeg').addEventListener('click',e=>{const b=e.target.closest('[data-nv]');if(b)setView(b.dataset.nv);});
EU.resetNv=init;
init();
})();
