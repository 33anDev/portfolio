/* 3D-klot med skills.
   Ikonerna ligger utspridda på en sfär (Fibonacci-fördelning) och projiceras med perspektiv.
   Klotet snurrar av sig självt, går att dra i, och ikonen längst fram får namnet under sig.
   Klick eller tangentbordsfokus på en ikon snurrar den till framsidan. */
(function () {
  'use strict';
  const root = document.getElementById('globe');
  if (!root) return;
  const { T } = EU;
  const canvas = document.getElementById('globeCanvas');
  const ctx = canvas.getContext('2d');
  const layer = document.getElementById('globeItems');
  const nameEl = document.getElementById('globeName');
  const labelEl = root.querySelector('.globe-label');
  const catEl = document.getElementById('globeCat');

  const LANG = ['Språk', 'Language'], WEB = ['Webb', 'Web'], TOOL = ['Verktyg', 'Tool'], FIVEM = ['FiveM', 'FiveM'], PLAT = ['Plattform', 'Platform'];
  const SKILLS = [
    { n: 'Rust', c: LANG, img: 'rust', mono: true },
    { n: 'Java', c: LANG, img: 'java' },
    { n: 'Lua', c: LANG, img: 'lua', cls: 'lua' },
    { n: 'JavaScript', c: WEB, img: 'javascript' },
    { n: 'React', c: WEB, img: 'react' },
    { n: 'HTML', c: WEB, img: 'html5' },
    { n: 'CSS', c: WEB, img: 'css3' },
    { n: 'Git', c: TOOL, img: 'git' },
    { n: 'GitHub', c: TOOL, img: 'github', mono: true },
    { n: 'Supabase', c: PLAT, img: 'supabase' },
    { n: 'Vercel', c: PLAT, img: 'vercel', mono: true, cls: 'sm' },
    { n: 'Windows API', c: PLAT, img: 'windows11' },
    { n: 'QBCore', c: FIVEM, txt: 'QB', col: '#ff3d8b' },
    { n: 'ESX', c: FIVEM, txt: 'ESX', col: '#ff8a3d' },
    { n: 'NUI', c: FIVEM, txt: 'NUI', col: '#f2b84b' },
    { n: 'egui', c: ['Rust-GUI', 'Rust GUI'], txt: 'egui', col: '#22c3d6' },
    { n: 'AI', c: ['Lär mig för arbetslivet', 'Learning for real work'], txt: 'AI', col: '#16a066' },
  ];

  /* Jämnt fördelade punkter på en enhetssfär */
  const N = SKILLS.length, GA = Math.PI * (3 - Math.sqrt(5));
  SKILLS.forEach((s, i) => {
    const y = 1 - (i + 0.5) * 2 / N, r = Math.sqrt(1 - y * y), th = GA * i;
    s.p = [Math.cos(th) * r, y, Math.sin(th) * r];
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'g-item' + (s.mono ? ' mono' : '') + (s.cls ? ' ' + s.cls : '');
    b.setAttribute('aria-label', s.n);
    b.innerHTML = s.img ? `<img src="img/skills/${s.img}.svg" alt="" draggable="false">` : `<span class="g-chip" style="--c:${s.col}">${s.txt}</span>`;
    b.addEventListener('click', () => focusOn(i));
    b.addEventListener('focus', () => focusOn(i));
    b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = i; });
    b.addEventListener('pointerleave', () => { if (hover === i) hover = -1; });
    layer.appendChild(b); s.el = b;
  });

  let pauseUntil = 0;
  let W = 0, R = 0, dpr = 1, ay = 0.4, ax = -0.25, vy = 0, vx = 0, hover = -1, front = -1, shown = -1, target = null, dragging = false, visible = true, last = 0;
  const AUTO = 0.0035;

  function size() {
    W = root.clientWidth; R = W * 0.37; dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = W * dpr; canvas.style.width = W + 'px'; canvas.style.height = W + 'px';
  }
  const rot = (p) => { // rotera runt Y och sedan X
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    const x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
    const y2 = p[1] * cx - z1 * sx, z2 = p[1] * sx + z1 * cx;
    return [x1, y2, z2];
  };
  const proj = (q) => { const f = 3.2 / (3.2 - q[2]); return [q[0] * R * f, q[1] * R * f, f]; };

  function drawWire() {
    const cs = getComputedStyle(document.documentElement);
    const acc = cs.getPropertyValue('--accent').trim() || '#0a8c9e';
    ctx.setTransform(dpr, 0, 0, dpr, W / 2 * dpr, W / 2 * dpr);
    ctx.clearRect(-W / 2, -W / 2, W, W);
    /* mjukt sken bakom klotet */
    const g = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 1.15);
    g.addColorStop(0, acc + '22'); g.addColorStop(1, acc + '00');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R * 1.15, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = acc;
    const line = (pts) => {
      for (let i = 1; i < pts.length; i++) {
        const a = rot(pts[i - 1]), b = rot(pts[i]); const z = (a[2] + b[2]) / 2;
        ctx.globalAlpha = 0.05 + Math.max(0, z + 1) * 0.11;
        const pa = proj(a), pb = proj(b);
        ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
      }
    };
    const S = 48;
    for (let lat = -75; lat <= 75; lat += 15) { const y = Math.sin(lat * Math.PI / 180), r = Math.cos(lat * Math.PI / 180); const pts = []; for (let k = 0; k <= S; k++) { const t = k / S * Math.PI * 2; pts.push([Math.cos(t) * r, y, Math.sin(t) * r]); } line(pts); }
    for (let lon = 0; lon < 180; lon += 15) { const t0 = lon * Math.PI / 180, pts = []; for (let k = 0; k <= S; k++) { const t = k / S * Math.PI * 2; pts.push([Math.cos(t) * Math.cos(t0), Math.sin(t), Math.cos(t) * Math.sin(t0)]); } line(pts); }
    ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(0, 0, R * 1.02, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
  }

  function place() {
    let best = -1, bz = -9;
    SKILLS.forEach((s, i) => {
      const q = rot(s.p), p = proj(q), z = q[2];
      const sc = 0.55 + (z + 1) * 0.33;
      s.el.style.transform = `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px) scale(${sc.toFixed(3)})`;
      s.el.style.opacity = (0.25 + (z + 1) * 0.375).toFixed(2);
      s.el.style.zIndex = Math.round((z + 1) * 100);
      s.el.style.filter = z < -0.2 ? `blur(${((-z - 0.2) * 2).toFixed(1)}px)` : '';
      if (z > bz) { bz = z; best = i; }
    });
    front = best;
    const show = hover >= 0 ? hover : front;
    const sq = rot(SKILLS[show].p), sp = proj(sq), ssc = 0.55 + (sq[2] + 1) * 0.33;
    labelEl.style.transform = `translate(calc(-50% + ${sp[0].toFixed(1)}px), ${(sp[1] + 30 * ssc + 8).toFixed(1)}px)`;
    SKILLS.forEach((s, i) => s.el.classList.toggle('on', i === show));
    if (show !== shown) { shown = show; label(); }
  }
  function label() {
    const s = SKILLS[shown]; if (!s) return;
    nameEl.textContent = s.n; catEl.textContent = T(s.c[0], s.c[1]);
    nameEl.parentElement.classList.remove('pop'); void nameEl.offsetWidth; nameEl.parentElement.classList.add('pop');
  }
  EU.onLang(label);

  /* Snurra en ikon till framsidan */
  function focusOn(i) {
    const p = SKILLS[i].p;
    const tY = Math.atan2(-p[0], p[2]);
    const z1 = -p[0] * Math.sin(tY) + p[2] * Math.cos(tY);
    const tX = Math.atan2(p[1], z1);
    let dy = tY - ay; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    target = { y: ay + dy, x: tX }; hover = -1; vy = 0; vx = 0;
  }

  function frame(t) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const dt = Math.min(3, last ? (t - last) / 16.67 : 1); last = t;
    if (target) {
      ay += (target.y - ay) * 0.12 * dt; ax += (target.x - ax) * 0.12 * dt;
      if (Math.abs(target.y - ay) < 0.002 && Math.abs(target.x - ax) < 0.002) { target = null; pauseUntil = performance.now() + 1800; }
    } else if (!dragging) {
      const auto = (hover >= 0 || performance.now() < pauseUntil) ? 0 : AUTO;
      vy += (auto - vy) * 0.04 * dt; vx *= Math.pow(0.94, dt);
      ay += vy * dt; ax += vx * dt;
      ax += (-0.25 - ax) * 0.01 * dt; // luta tillbaka lite mot startvinkeln
    }
    ax = Math.max(-1.2, Math.min(1.2, ax));
    drawWire(); place();
  }

  /* Dra för att snurra */
  let px = 0, py = 0, moved = 0;
  root.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragging = true; target = null; moved = 0; px = e.clientX; py = e.clientY; vy = 0; vx = 0;
    root.classList.add('grab');
  });
  addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    vy = dx * 0.006; vx = dy * 0.006; ay += vy; ax += vx;
    if (moved > 6 && e.pointerType !== 'mouse') e.preventDefault();
  }, { passive: false });
  const end = () => { if (!dragging) return; dragging = false; root.classList.remove('grab'); pauseUntil = performance.now() + 900; };
  addEventListener('pointerup', end); addEventListener('pointercancel', end);
  root.addEventListener('click', e => { if (moved > 6) { e.stopPropagation(); e.preventDefault(); } }, true);

  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; last = 0; }, { rootMargin: '100px' }).observe(root);
  addEventListener('resize', size);
  size(); place(); label();
  requestAnimationFrame(frame);
})();
