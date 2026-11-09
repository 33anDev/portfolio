/* Gästbok: Supabase + Google-inloggning.
   Alla kan läsa. För att skriva loggar man in med Google.
   Varje person har ett omdöme som de kan ändra eller ta bort.
   Ägaren (OWNER_EMAIL i config.js) kan ta bort alla omdömen. */
(function () {
  'use strict';
  const { $, $$, esc, T } = EU;
  const CFG = window.PORTFOLIO_CONFIG || {};
  const READY = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && window.supabase);
  const sb = READY ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY) : null;
  const OWNER = (CFG.OWNER_EMAIL || '').toLowerCase();

  const GB = { user: null, entries: [], loaded: false, error: false, saving: false, err: '', delArm: null };
  const mine = () => GB.user && GB.entries.find(e => e.user_id === GB.user.id);
  const isOwner = () => !!(GB.user && OWNER && (GB.user.email || '').toLowerCase() === OWNER);

  const stars = n => { n = Math.round(n); let s = ''; for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '<span class="off">★</span>'; return '<span class="stars">' + s + '</span>'; };
  const fmtDate = ts => { try { return new Date(ts).toLocaleDateString(EU.lang() === 'en' ? 'en-GB' : 'sv-SE', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  const meName = u => (u && (u.user_metadata?.full_name || u.user_metadata?.name || (u.email || '').split('@')[0])) || '';
  const meAvatar = u => (u && (u.user_metadata?.avatar_url || u.user_metadata?.picture)) || '';
  const GOOGLE = '<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';

  function renderSum() {
    const es = GB.entries, n = es.length, avg = n ? es.reduce((s, e) => s + (+e.rating || 0), 0) / n : 0;
    const cnt = [5, 4, 3, 2, 1].map(k => [k, es.filter(e => +e.rating === k).length]);
    $('#gbSum').innerHTML = `<span class="k">${T('Betyg', 'Rating')}</span>
      <div class="gb-avg"><b>${n ? avg.toFixed(1) : '0.0'}</b><div>${stars(avg)}<div class="gb-count">${n} ${n === 1 ? T('omdöme', 'review') : T('omdömen', 'reviews')}</div></div></div>
      <div class="dist">${cnt.map(([k, c]) => `<div><span>${k}★</span><i style="--w:${n ? (c / n * 100).toFixed(0) : 0}%"></i><span>${c}</span></div>`).join('')}</div>`;
  }

  function renderForm() {
    const w = $('#gbFormWrap');
    if (!READY) {
      w.innerHTML = `<div class="gb-form"><span class="k">${T('Skriv ett omdöme', 'Write a review')}</span><div class="gb-note">${T('Gästboken öppnar snart. Vill du säga något direkt? Tryck på <b>Säg hej</b>.', 'The guestbook opens soon. Want to say something directly? Hit <b>Say hi</b>.')}</div><button class="btn btn-fg" type="button" data-hey style="align-self:flex-start">${T('Säg hej 👋', 'Say hi 👋')}</button></div>`;
      return;
    }
    if (!GB.user) {
      w.innerHTML = `<div class="gb-form"><span class="k">${T('Skriv ett omdöme', 'Write a review')}</span>
        <h3 style="font-size:24px;font-weight:600;letter-spacing:-.03em">${T('Logga in för att lämna ett omdöme', 'Sign in to leave a review')}</h3>
        <p style="color:var(--muted);font-size:15px">${T('Du behöver bara logga in om du vill skriva. Ditt namn och din profilbild från Google visas vid omdömet.', 'You only need to sign in to write. Your Google name and profile picture are shown with your review.')} <a href="integritet.html" style="color:var(--accent)">${T('Läs om integritet', 'Privacy')}</a></p>
        <button class="btn btn-ghost gbtn" type="button" id="gbLogin">${GOOGLE}<span>${T('Logga in med Google', 'Sign in with Google')}</span></button>
        ${GB.err ? `<div class="gb-note" style="border-color:var(--bad)">${esc(GB.err)}</div>` : ''}</div>`;
      $('#gbLogin').addEventListener('click', login);
      return;
    }
    const m = mine() || {};
    w.innerHTML = `<form class="gb-form" id="gbForm">
      <div class="gb-row"><span class="k">${m.text ? T('Ditt omdöme', 'Your review') : T('Skriv ett omdöme', 'Write a review')}</span>
        <span class="gb-me"><img alt="" id="gbMeAv"><span id="gbMeName"></span> · <button class="linkbtn" type="button" id="gbLogout">${T('Logga ut', 'Sign out')}</button></span></div>
      <div class="rate" role="radiogroup" aria-label="${T('Betyg', 'Rating')}">${[5, 4, 3, 2, 1].map(k => `<input type="radio" name="gbr" id="gbr${k}" value="${k}" ${(+m.rating || 5) === k ? 'checked' : ''}><label for="gbr${k}" title="${k}">★</label>`).join('')}</div>
      <label for="gbRole">${T('Vem är du? (valfritt)', 'Who are you? (optional)')}<input type="text" id="gbRole" maxlength="40" placeholder="${T('T.ex. rekryterare, klasskompis', 'E.g. recruiter, classmate')}" value="${esc(m.role || '')}"></label>
      <label for="gbText">${T('Meddelande', 'Message')}<textarea id="gbText" rows="4" maxlength="400" required placeholder="${T('Vad tyckte du?', 'What did you think?')}">${esc(m.text || '')}</textarea></label>
      <div class="gb-row"><span class="gb-count" id="gbCnt">${(m.text || '').length}/400</span>
        <div style="display:flex;gap:8px;align-items:center">${m.text ? `<button class="linkbtn" type="button" data-gbdel="${esc(m.id)}">${GB.delArm === m.id ? T('Säker? Klicka igen', 'Sure? Click again') : T('Ta bort', 'Delete')}</button>` : ''}
        <button class="btn btn-fg" type="submit" ${GB.saving ? 'disabled' : ''}>${GB.saving ? T('Sparar…', 'Saving…') : m.text ? T('Uppdatera', 'Update') : T('Publicera', 'Publish')}</button></div></div>
      ${GB.err ? `<div class="gb-note" style="border-color:var(--bad)">${esc(GB.err)}</div>` : ''}
    </form>`;
    const av = $('#gbMeAv'); const src = meAvatar(GB.user); if (src) av.src = src; else av.remove();
    $('#gbMeName').textContent = meName(GB.user);
    $('#gbText').addEventListener('input', e => { $('#gbCnt').textContent = e.target.value.length + '/400'; });
    $('#gbForm').addEventListener('submit', save);
    $('#gbLogout').addEventListener('click', async () => { await sb.auth.signOut(); });
  }

  function renderList() {
    const L = $('#gbList'), es = GB.entries;
    if (READY && !GB.loaded) { L.innerHTML = `<div class="gb-empty">${T('Laddar omdömen…', 'Loading reviews…')}</div>`; return; }
    if (GB.error) { L.innerHTML = `<div class="gb-empty">${T('Gästboken kunde inte laddas just nu. Försök igen senare.', 'The guestbook could not be loaded right now. Try again later.')}</div>`; return; }
    if (!es.length) { L.innerHTML = READY ? `<div class="gb-empty">${T('Inga omdömen än. Bli först! ✨', 'No reviews yet. Be the first! ✨')}</div>` : ''; return; }
    L.innerHTML = es.map(e => {
      const me = GB.user && e.user_id === GB.user.id, canDel = me || isOwner();
      return `<div class="tile entry"><div class="who">${e.avatar_url ? `<img alt="" src="${esc(e.avatar_url)}" referrerpolicy="no-referrer">` : ''}<div><b>${esc(e.name || T('En besökare', 'A visitor'))}${me ? `<span class="you">${T('du', 'you')}</span>` : ''}</b><small>${esc(e.role || '')}</small></div></div>
        ${stars(+e.rating || 0)}<p>${esc(e.text || '')}</p>
        <div class="meta"><small>${fmtDate(e.updated_at || e.created_at)}</small>${canDel ? `<button class="linkbtn" type="button" data-gbdel="${esc(e.id)}">${GB.delArm === e.id ? T('Säker? Klicka igen', 'Sure? Click again') : T('Ta bort', 'Delete')}</button>` : ''}</div></div>`;
    }).join('');
  }

  const render = () => { renderSum(); renderForm(); renderList(); };

  async function load() {
    const { data, error } = await sb.from('guestbook').select('id,user_id,name,avatar_url,role,rating,text,created_at,updated_at').order('created_at', { ascending: false }).limit(300);
    GB.loaded = true; GB.error = !!error;
    if (!error) GB.entries = data || [];
    renderSum(); renderList();
  }

  async function login() {
    GB.err = '';
    const redirectTo = location.origin + location.pathname + '#gastbok';
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) { GB.err = T('Inloggningen fungerade inte. Försök igen.', 'Sign-in failed. Please try again.'); renderForm(); }
  }

  async function save(e) {
    e.preventDefault(); if (GB.saving) return;
    const text = $('#gbText').value.trim(), role = $('#gbRole').value.trim().slice(0, 40);
    const rating = +(($('input[name=gbr]:checked') || {}).value || 5);
    if (!text) { $('#gbText').focus(); return; }
    GB.saving = true; GB.err = ''; renderForm();
    const { error } = await sb.from('guestbook').upsert({ user_id: GB.user.id, rating, role, text: text.slice(0, 400) }, { onConflict: 'user_id' });
    GB.saving = false;
    if (error) GB.err = T('Det gick inte att spara. Försök igen om en stund.', "Couldn't save. Try again in a moment.");
    await load(); renderForm();
  }

  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-gbdel]'); if (!b || !sb) return;
    const id = b.dataset.gbdel;
    if (GB.delArm !== id) { GB.delArm = id; renderForm(); renderList(); setTimeout(() => { if (GB.delArm === id) { GB.delArm = null; renderForm(); renderList(); } }, 3500); return; }
    GB.delArm = null;
    const { error } = await sb.from('guestbook').delete().eq('id', id);
    if (error) GB.err = T('Det gick inte att ta bort.', "Couldn't delete.");
    await load(); renderForm();
  });

  EU.onLang(render);
  render();
  if (!READY) return;
  sb.auth.getSession().then(({ data }) => { GB.user = data.session ? data.session.user : null; renderForm(); renderList(); });
  sb.auth.onAuthStateChange((_ev, session) => {
    GB.user = session ? session.user : null; renderForm(); renderList();
    if (session && location.hash.includes('access_token')) history.replaceState(null, '', location.pathname + '#gastbok');
  });
  load();
})();
