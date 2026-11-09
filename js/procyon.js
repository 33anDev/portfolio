(function(){
'use strict';
const {$,$$,esc}=EU;
const SID='S-1-5-21-4097158814-809733047-1296483018-1001';
const RAW=[
 // name,pid,ppid,memMiB,user,icon,cpuBase,prot
 ['System',4,0,0.14,0,'svc',0.2,1],
 ['services.exe',1672,912,11.8,0,'svc',0,1],
 ['AggregatorHost.exe',6288,4920,12.59,0,'svc',0],
 ['amdfendrsr.exe',3244,1672,14.86,0,'svc',0],
 ['amdow.exe',17928,4548,2.48,1,'app',0],
 ['AmdPpkgSvc.exe',5004,1672,7.20,0,'svc',0],
 ['AMDRSServ.exe',4548,14908,141.54,1,'app',0.1],
 ['AMDRSSrcExt.exe',18856,4548,9.33,1,'app',0],
 ['ApplicationFrameHost.exe',22688,1896,45.48,1,'app',0],
 ['AsusCertService.exe',3228,1672,8.05,0,'svc',0],
 ['atieclxx.exe',19776,3236,22.25,0,'svc',0],
 ['atiesrxx.exe',3236,1672,11.32,0,'svc',0],
 ['audiodg.exe',4204,4044,40.80,0,'svc',3.1],
 ['cargo.exe',21540,9932,84.2,1,'rst',1.8],
 ['chrome.exe',1580,25428,359.61,1,'chr',2.1],
 ['chrome.exe',1724,1580,103.66,1,'chr',0],
 ['chrome.exe',5340,1580,33.22,1,'chr',0],
 ['chrome.exe',5972,1580,166.54,1,'chr',0.2],
 ['chrome.exe',6188,1580,120.13,1,'chr',0],
 ['Code.exe',9932,25428,412.7,1,'code',1.4],
 ['Discord.exe',11208,25428,268.1,1,'dsc',0.4],
 ['explorer.exe',25428,25380,188.4,1,'app',0.3],
 ['FiveM.exe',14020,25428,2190.5,1,'fvm',4.2],
 ['procyon.exe',30112,25428,31.2,1,'pcy',0.6],
 ['Spotify.exe',16604,25428,174.3,1,'spt',0.5],
 ['svchost.exe',1896,1672,28.1,0,'svc',0.1],
 ['svchost.exe',4044,1672,19.6,0,'svc',0],
 ['svchost.exe',4920,1672,22.4,0,'svc',0],
];
const PATHS={'chrome.exe':'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','Code.exe':'C:\\Users\\emil\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe','Discord.exe':'C:\\Users\\emil\\AppData\\Local\\Discord\\app-1.0.9\\Discord.exe','FiveM.exe':'C:\\Users\\emil\\AppData\\Local\\FiveM\\FiveM.exe','procyon.exe':'C:\\Users\\emil\\Downloads\\procyon.exe','explorer.exe':'C:\\Windows\\explorer.exe','Spotify.exe':'C:\\Users\\emil\\AppData\\Roaming\\Spotify\\Spotify.exe','cargo.exe':'C:\\Users\\emil\\.cargo\\bin\\cargo.exe'};
const pathOf=p=>PATHS[p.name]||(p.name.startsWith('AMD')||p.name.startsWith('amd')?'C:\\Program Files\\AMD\\CNext\\CNext\\'+p.name:'C:\\Windows\\System32\\'+p.name);
const S={};const body=$('#pwBody'),menu=$('#pwMenu'),dlg=$('#pwDlg'),win=$('#pw');
function init(){
  Object.assign(S,{sort:'name',desc:false,q:'',sel:null,paused:false,hist:[],
    procs:RAW.map(r=>({name:r[0],pid:r[1],ppid:r[2],mem:r[3],user:r[4]?SID:'',ic:r[5],base:r[6],cpu:r[6],prot:!!r[7],sys:!r[4],prio:'Normal',sus:false}))});
  $('#pwQ').value='';status('Right-click a process for actions · double-click for details');closeMenu();dlg.hidden=true;
  $('#pwPause').classList.remove('on');$('#pwPause').textContent='❚❚ PAUSE';render();
}
function status(m,c){const s=$('#pwStatus');s.className='pw-status'+(c?' '+c:'');s.querySelector('span').textContent=m;}
const mem=m=>m>=1024?(m/1024).toFixed(2)+' GiB':m.toFixed(2)+' MiB';
function render(){
  const q=S.q.toLowerCase();
  const list=S.procs.filter(p=>!q||p.name.toLowerCase().includes(q)||String(p.pid).includes(q));
  const k=S.sort,d=S.desc?-1:1;
  list.sort((a,b)=>{const x=k==='name'?a.name.toLowerCase():a[k],y=k==='name'?b.name.toLowerCase():b[k];return (x>y?1:x<y?-1:a.pid-b.pid)*d;});
  body.innerHTML=list.map(p=>`<tr data-pid="${p.pid}" tabindex="0" class="${p.pid===S.sel?'sel':''} ${p.sus?'sus':''}">
    <td><span class="pname"><span class="pi ${p.ic}"></span>${esc(p.name)}${p.sus?'<span class="stz">suspended</span>':''}</span></td>
    <td class="num">${p.pid}</td><td class="num ppid">${p.ppid}</td>
    <td class="num cpuc">${p.cpu>0.05?`<i style="--h:${Math.min(1,p.cpu/6).toFixed(2)}"></i>`:''}${p.cpu.toFixed(1)}</td>
    <td class="num">${mem(p.mem)}</td><td class="usr">${p.user}</td></tr>`).join('')||'<tr><td colspan="6" style="text-align:center;color:#77818d;height:80px">No processes match the filter.</td></tr>';
  $$('.pw-t th').forEach(th=>{th.classList.toggle('on',th.dataset.s===S.sort);th.classList.toggle('desc',th.dataset.s===S.sort&&S.desc);});
  const tot=Math.min(100,S.procs.reduce((s,p)=>s+p.cpu,0)),m=S.procs.reduce((s,p)=>s+p.mem,0)/1024+7.4;
  $('#pwCpu').textContent=tot.toFixed(1)+'%';$('#pwMem').textContent=m.toFixed(2)+' GiB / 31.16 GiB';$('#pwCount').textContent=S.procs.length;
}
function spark(){const tot=Math.min(100,S.procs.reduce((s,p)=>s+p.cpu,0));S.hist.push(tot);if(S.hist.length>32)S.hist.shift();
  const mx=Math.max(15,...S.hist);$('#pwSpark').setAttribute('points',S.hist.map((v,i)=>(i/31*64).toFixed(1)+','+(21-v/mx*19).toFixed(1)).join(' '));}
const find=pid=>S.procs.find(p=>p.pid===pid);
const kids=pid=>{const o=[];const w=id=>S.procs.filter(p=>p.ppid===id&&p.pid!==id).forEach(c=>{o.push(c);w(c.pid);});w(pid);return o;};
function closeMenu(){menu.hidden=true;}
function openMenu(p,x,y){
  S.sel=p.pid;render();
  const PR=['Idle','Below normal','Normal','Above normal','High','Realtime'];
  menu.innerHTML=`<div class="hd">${esc(p.name)} · PID ${p.pid}</div><div class="hd" style="padding-top:0">Set priority</div>
   <div class="prio">${PR.map(r=>`<button type="button" data-prio="${r}" class="${p.prio===r?'on':''}">${r}</button>`).join('')}</div><hr>
   <button type="button" data-a="${p.sus?'resume':'suspend'}">${p.sus?'Resume':'Suspend'}</button>
   <button type="button" data-a="kill" class="dg">End process <small>Del</small></button>
   <button type="button" data-a="tree" class="dg">End process tree</button><hr>
   <button type="button" data-a="details">Details</button>
   <button type="button" data-a="loc">Open file location</button>
   <button type="button" data-a="cpid">Copy PID <small>${p.pid}</small></button>
   <button type="button" data-a="cname">Copy name</button>
   <button type="button" data-a="cpath">Copy path</button>`;
  menu.hidden=false;
  const r=win.getBoundingClientRect(),mw=menu.offsetWidth,mh=menu.offsetHeight;
  menu.style.left=Math.max(6,Math.min(x-r.left,r.width-mw-6))+'px';menu.style.top=Math.max(6,Math.min(y-r.top,r.height-mh-6))+'px';
  const f=menu.querySelector('[data-a]');f&&f.focus({preventScroll:true});
}
function details(p){
  dlg.innerHTML=`<div role="dialog" aria-label="Process details"><h5><span class="pi ${p.ic}"></span>${esc(p.name)}</h5><dl>
   <dt>PID</dt><dd>${p.pid}</dd><dt>Parent PID</dt><dd>${p.ppid}</dd><dt>Path</dt><dd>${esc(pathOf(p))}</dd>
   <dt>User</dt><dd>${p.user||'SYSTEM'}</dd><dt>CPU</dt><dd>${p.cpu.toFixed(1)} %</dd><dt>Memory</dt><dd>${mem(p.mem)}</dd>
   <dt>Priority</dt><dd>${p.prio}</dd><dt>Status</dt><dd>${p.sus?'Suspended':'Running'}</dd><dt>Children</dt><dd>${kids(p.pid).length}</dd></dl>
   <button type="button" data-close-dlg>Close</button></div>`;
  dlg.hidden=false;dlg.querySelector('button').focus();
}
dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.closest('[data-close-dlg]'))dlg.hidden=true;});
let lastTap=0,lastPid=null;
body.addEventListener('click',e=>{const tr=e.target.closest('tr[data-pid]');if(!tr)return;const p=find(+tr.dataset.pid);if(!p)return;
  const now=Date.now();
  if(e.pointerType!=='mouse'&&lastPid===p.pid&&now-lastTap<600&&menu.hidden){const b=tr.getBoundingClientRect();openMenu(p,b.left+30,b.bottom);lastTap=0;return;}
  lastTap=now;lastPid=p.pid;S.sel=p.pid;closeMenu();render();status(`${p.name} (PID ${p.pid}) selected`);});
body.addEventListener('dblclick',e=>{const tr=e.target.closest('tr[data-pid]');if(!tr)return;const p=find(+tr.dataset.pid);if(p){closeMenu();details(p);}});
body.addEventListener('contextmenu',e=>{const tr=e.target.closest('tr[data-pid]');if(!tr)return;e.preventDefault();openMenu(find(+tr.dataset.pid),e.clientX,e.clientY);});
body.addEventListener('keydown',e=>{const tr=e.target.closest('tr[data-pid]');if(!tr)return;const p=find(+tr.dataset.pid);if(!p)return;
  if(e.key==='Enter'){e.preventDefault();details(p);}
  if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();const b=tr.getBoundingClientRect();openMenu(p,b.left+30,b.bottom);}
  if(e.key==='Delete'){e.preventDefault();S.sel=p.pid;act('kill',p);}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const n=e.key==='ArrowDown'?tr.nextElementSibling:tr.previousElementSibling;if(n&&n.dataset.pid){S.sel=+n.dataset.pid;render();const t=body.querySelector(`tr[data-pid="${S.sel}"]`);t&&t.focus();}}
});
document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!e.target.closest('#pwBody'))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!menu.hidden)closeMenu();else if(!dlg.hidden)dlg.hidden=true;}});
$('.pw-t thead').addEventListener('click',e=>{const th=e.target.closest('th');if(!th)return;const k=th.dataset.s;if(S.sort===k)S.desc=!S.desc;else{S.sort=k;S.desc=(k==='cpu'||k==='mem');}render();});
$('#pwQ').addEventListener('input',e=>{S.q=e.target.value;render();});
$('#pwPause').addEventListener('click',e=>{S.paused=!S.paused;e.currentTarget.classList.toggle('on',S.paused);e.currentTarget.textContent=S.paused?'▶ RESUME':'❚❚ PAUSE';status(S.paused?'Live updates paused':'Live updates resumed',S.paused?'warn':'ok');});
function copy(t,l){const d=()=>status(`Copied ${l}: ${t}`,'ok');try{navigator.clipboard.writeText(t).then(d,d);}catch(e){d();}}
function act(a,p){
  if(a==='details')return details(p);
  if(a==='cpid')return copy(String(p.pid),'PID');
  if(a==='cname')return copy(p.name,'name');
  if(a==='cpath')return copy(pathOf(p),'path');
  if(a==='loc')return status('Opened '+pathOf(p).replace(/\\[^\\]+$/,'\\'),'ok');
  if(p.prot)return status(`Access denied: ${p.name} is a protected system process (even for administrators)`,'err');
  if(p.sys)return status(`Access denied: ${p.name} runs as SYSTEM. Run Procyon as administrator`,'err');
  if(a==='suspend'){p.sus=true;p.cpu=0;status(p.name==='explorer.exe'?'Warning: explorer.exe suspended. The desktop may freeze until it is resumed':`Suspended ${p.name} (PID ${p.pid})`,p.name==='explorer.exe'?'warn':'ok');}
  if(a==='resume'){p.sus=false;status(`Resumed ${p.name} (PID ${p.pid})`,'ok');}
  if(a==='kill'||a==='tree'){
    const gone=a==='tree'?[p,...kids(p.pid)]:[p];const ids=new Set(gone.map(x=>x.pid));
    ids.forEach(id=>{const tr=body.querySelector(`tr[data-pid="${id}"]`);tr&&tr.classList.add('gone');});
    setTimeout(()=>{S.procs=S.procs.filter(x=>!ids.has(x.pid));S.sel=null;render();},320);
    status(a==='tree'?`Ended ${p.name} and ${gone.length-1} child process${gone.length-1===1?'':'es'}`:`Ended ${p.name} (PID ${p.pid})`,'ok');
    if(p.name==='procyon.exe')EU.toast('pc',EU.T('Du avslutade Procyon i Procyon 😅 Klicka "Börja om".','You ended Procyon inside Procyon 😅 Hit "Reset".'));
    return;
  }
  render();
}
menu.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const p=find(S.sel);if(!p)return;
  if(b.dataset.prio){const r=b.dataset.prio;closeMenu();
    if(p.prot)status(`Access denied: ${p.name} is protected`,'err');
    else if(p.sys)status(`Access denied: ${p.name} runs as SYSTEM. Run as administrator`,'err');
    else if(r==='Realtime')status('Realtime priority requires running Procyon as administrator','err');
    else{p.prio=r;status(`Priority of ${p.name} set to ${r}`,'ok');}
    render();return;}
  closeMenu();act(b.dataset.a,p);
});
setInterval(()=>{
  if(!S.procs||S.paused)return;
  S.procs.forEach(p=>{if(p.sus){p.cpu=0;return;}
    const spike=Math.random()<.05?Math.random()*4:0;
    p.cpu=Math.max(0,p.base+(Math.random()-.5)*p.base*.9+spike*(p.base>0?1:.4));if(p.cpu<.05)p.cpu=0;
    p.mem=Math.max(.1,p.mem*(1+(Math.random()-.5)*.012));});
  spark();
  const ae=document.activeElement;let kb=false;try{kb=!!(ae&&ae.closest&&ae.closest('#pwBody')&&ae.matches(':focus-visible'));}catch(e){}
  if(menu.hidden&&dlg.hidden&&!kb)render();
},1100);
EU.resetPc=init;
init();for(let i=0;i<20;i++)spark();
})();
