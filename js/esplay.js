/* Demo: Esplay ToDo (React-appen återskapad i vanlig JavaScript).
   Bredvid appen visas en live-panel med hur React-statet förändras,
   så att man ser att varje ändring skapar en ny array. */
(function () {
  'use strict';
  const { $, $$, esc, T } = EU;
  const app = $('#esApp');
  if (!app) return;
  const list = $('#esList'), input = $('#esInput'), form = $('#esForm'), counter = $('#esCounter'), empty = $('#esEmpty');
  const stateEl = $('#esState'), logEl = $('#esLog'), refEl = $('#esRef');

  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2)).slice(0, 8);
  const SEED = () => [
    { id: uid(), text: T('Skicka LIA-ansökan', 'Send internship application'), completed: false },
    { id: uid(), text: T('Plugga React hooks', 'Study React hooks'), completed: false },
    { id: uid(), text: T('Bygga portfolio', 'Build portfolio'), completed: true },
  ];
  let todos = [], version = 0, log = [], flash = null;

  /* setTodos: ersätter hela arrayen, precis som i React */
  function setTodos(next, op) {
    const same = next === todos;
    todos = next; version++;
    log.unshift({ op, same, v: version });
    log = log.slice(0, 5);
    render();
  }

  function render() {
    const remaining = todos.filter(t => !t.completed).length;
    counter.textContent = `${remaining} ${T('av', 'of')} ${todos.length} ${T('kvar', 'left')}`;
    empty.hidden = todos.length > 0;
    list.innerHTML = todos.map(t => `<li class="es-item${flash === t.id ? ' es-new' : ''}" data-id="${t.id}">
      <label class="es-label"><input type="checkbox" ${t.completed ? 'checked' : ''} data-toggle="${t.id}" aria-label="${esc(t.text)}"><span class="${t.completed ? 'es-done' : ''}">${esc(t.text)}</span></label>
      <button type="button" class="es-del" data-del="${t.id}">${T('Ta bort', 'Delete')}</button></li>`).join('');
    flash = null;
    /* live-state */
    stateEl.innerHTML = '<span class="ek">todos</span> = [\n' + todos.map(t =>
      `  { <span class="ek">id</span>: <span class="es">"${t.id}"</span>, <span class="ek">text</span>: <span class="es">"${esc(t.text)}"</span>, <span class="ek">completed</span>: <span class="${t.completed ? 'eb1' : 'eb0'}">${t.completed}</span> }`
    ).join(',\n') + (todos.length ? '\n' : '') + ']';
    refEl.textContent = T('Array-version #', 'Array version #') + version;
    refEl.classList.remove('bump'); void refEl.offsetWidth; refEl.classList.add('bump');
    logEl.innerHTML = log.length ? log.map((l, i) => `<li class="${i === 0 ? 'latest' : ''}"><code>${esc(l.op)}</code><small>${T('ny array → React renderar om', 'new array → React re-renders')}</small></li>`).join('') : `<li class="muted">${T('Lägg till, bocka i eller ta bort en uppgift.', 'Add, check or delete a task.')}</li>`;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (text === '') { input.focus(); app.classList.remove('es-shake'); void app.offsetWidth; app.classList.add('es-shake'); return; }
    const todo = { id: uid(), text, completed: false };
    flash = todo.id;
    setTodos([...todos, todo], 'setTodos(prev => [...prev, todo])');
    input.value = '';
  });
  list.addEventListener('change', e => {
    const id = e.target.dataset.toggle; if (!id) return;
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t), 'prev.map(t => ({ ...t, completed: !t.completed }))');
  });
  list.addEventListener('click', e => {
    const id = e.target.dataset.del; if (!id) return;
    const li = e.target.closest('.es-item'); li.classList.add('es-out');
    setTimeout(() => setTodos(todos.filter(t => t.id !== id), 'prev.filter(t => t.id !== id)'), 220);
  });

  function reset() { todos = SEED(); version = 0; log = []; input.value = ''; render(); }
  EU.resetEs = reset;
  EU.onLang(() => { render(); });
  reset();
})();
