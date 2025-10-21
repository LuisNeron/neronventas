document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // ⚙️ CONFIG
  // =========================
  const CONFIG = {
    familias: 30,
    rangoArticulosPorFamilia: [6, 14],
    tarifa: 1,
  };

  // 🎨 helpers de color (mapeado a clases de tu CSS)
  const COLORS = ["is-yellow","is-cyan","is-green","is-red","is-lilac"];

  // Diccionarios para nombres falsos
  const BASE_FAMILIAS = [
    "Para compartir","Tapas y pinchos","Bocadillos","Menú argentino","Menú niños",
    "Ensaladas","Verduras","Carnes","Del mar","Postres","Pizzas","Bebidas"
  ];
  const BASE_A = ["Milanesa","Fugazzeta","Choripán","Empanada","Provoleta","Napolitana","Caprese","Parmesana","Sola","Hamburguesa","Pizza","Ensalada","Tostada","Tarta"];
  const BASE_B = ["Individual","L","XL","XXL","Doble","Trío","Especial","del Día","Clásica","Premium"];

  // =========================
  // 🔗 DOM refs
  // =========================
  const el = s => document.querySelector(s);
  const $familias    = el('#familias');
  const $articulos   = el('#articulos');
  const $ticketBody  = el('#ticket-body');
  const $ticketBodyModif  = el('#ticket-body-modif');
  const $total       = el('#ticket-total');
  const $inputBuscar = el('#inputBuscar');
  const $selPreview = document.querySelector('.selection-modal-modif');

  // =========================
  // 🧠 Estado
  // =========================
  let familias = [];   // [{id, nombre, color}]
  let articulos = [];  // [{id, familiaId, nombre, precio, color}]
  let familiaActiva = null;
  let ticket = [];     // [{nombre, punit, cantidad}]
  let lastAddedKey = null;

  // ——— QtyPad ———
  let pendingQty = 1;  // cantidad a aplicar al próximo click
  const $qtyValue = document.querySelector('#qty-value');
  const $qtyHint  = document.querySelector('#qty-hint');

// =========================
// ⏰ Reloj + Tarifa
// =========================
el('#tarifa-pill').textContent = `Tarifa ${CONFIG.tarifa}`;

(function startClocks(){
  const $bottomClock   = document.querySelector('#reloj-bottom');
  const $articlesClock = document.querySelector('#clock-articles'); // ← nuevo
  const pad = n => String(n).padStart(2,'0');

  const tick = () => {
    const d = new Date();
    const hora = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    if ($bottomClock)   $bottomClock.textContent   = hora;
    if ($articlesClock) $articlesClock.textContent = hora;  // ← actualizar cabecera de artículos
  };

  tick();
  setInterval(tick, 1000);
})();


  // =========================
  // Utils y datos dummy
  // =========================
  const rnd  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const eur  = n => n.toFixed(2).replace('.', ',');

  function setQty(n){
    pendingQty = Math.max(1, n|0);
    const d = document.querySelector('#qty-display');
    if (!d) return;
    d.classList.add('bump');
    if ($qtyValue) $qtyValue.textContent = pendingQty;
    showQtyHint();
    setTimeout(()=>d.classList.remove('bump'),180);
  }
  
  function showQtyHint() { /* no-op; dejamos el hint oculto */ }

  // function showQtyHint(){
  //   if(!$qtyHint) return;
  //   $qtyHint.textContent = pendingQty>1 ? `×${pendingQty} listo — toca un artículo` : '';
  // }

  // 🖼️ Imágenes de fondo de las familias
  const urls = [
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1625938144756-903ba3f7c5f3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"
  ];

  // ⚙️ Familias aleatorias con imagen cíclica
  function genFamilias() {
    familias = Array.from({ length: CONFIG.familias }, (_, i) => ({
      id: (i % urls.length) + 1,
      nombre: BASE_FAMILIAS[i % BASE_FAMILIAS.length] + (i >= BASE_FAMILIAS.length ? ` ${i + 1}` : ''),
      color: pick(COLORS),
    }));
  }

  function genArticulos(){
    articulos = [];
    familias.forEach(f=>{
      const n = rnd(...CONFIG.rangoArticulosPorFamilia);
      for(let i=0;i<n;i++){
        articulos.push({
          id: `${f.id}-${i}`,
          familiaId: f.id,
          nombre: `${pick(BASE_A)} ${pick(BASE_B)}`,
          precio: +(Math.random()*18 + 1.2),  // 1.20 - 19.20
          color: pick(COLORS)
        });
      }
    });
  }

  // =========================
  // 🔎 Búsqueda
  // =========================
  function pasaBusqueda(a){
    const t = ($inputBuscar?.value || '').trim().toLowerCase();
    if(!t) return true;
    return a.nombre.toLowerCase().includes(t);
  }
  function pasaFiltros(a){ return true; }

  let selectedKey = null; // ← clave de la fila seleccionada (compartida entre ambas tablas)

  function clearSelectionIn(tbody) {
    tbody.querySelectorAll('tr.selected').forEach(tr => tr.classList.remove('selected'));
  }

  function highlightInModalByKey(key, { scroll = true } = {}) {
    if (!key) return;
    const row = $ticketBodyModif.querySelector(`tr[data-key="${key}"]`);
    if (!row) return;
    clearSelectionIn($ticketBodyModif);
    row.classList.add('selected');
    if (scroll) row.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }


  // =========================
  // 🧩 HTML de cada producto
  // =========================
  function renderProductoHTML(a){
    return `
      <div class="price-tag"> ${eur(a.precio)}</div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:center">
        <div style="font-weight:900">${a.nombre.toUpperCase()}</div>
      </div>
    `;
  }

  // =========================
  // 🖼 Render
  // =========================
  function renderFamilias() {
    $familias.innerHTML = '';

    // Botón TODAS
    const bAll = document.createElement('button');
    bAll.className = 'cat';
    bAll.innerHTML = '<span>TODAS</span>';
    bAll.addEventListener('click', () => {
      familiaActiva = null;
      renderArticulos();
      marcarFamilia();
    });
    $familias.appendChild(bAll);

    familias.forEach(f => {
      const b = document.createElement('button');
      b.className = 'cat';
      b.innerHTML = `<span>${f.nombre.toUpperCase()}</span>`;
      b.style.setProperty('--bg-img', `url('${urls[f.id - 1]}')`);
      b.addEventListener('click', () => {
        familiaActiva = f.id;
        renderArticulos();
        marcarFamilia(f.id);
      });
      $familias.appendChild(b);
    });

    marcarFamilia();
  }

  function marcarFamilia(id=null){
    [...$familias.children].forEach(btn=>{
      btn.style.filter = '';
      btn.style.outline = '';
    });
    if(id===null) return;
    const idx = id; // 0 es "TODAS"
    const btn = $familias.children[idx];
    if(btn){
      btn.style.filter = 'brightness(1.12)';
      btn.style.outline = '2px solid rgba(255,255,255,.25)';
    }
  }

  function renderArticulos(){
    $articulos.innerHTML = '';

    const list = articulos
      .filter(a => familiaActiva ? a.familiaId === familiaActiva : true)
      .filter(pasaBusqueda)
      .filter(pasaFiltros);

    // Etiqueta familia activa
    const famLabel = el('#familia-actual');
    if (famLabel) {
      if (familiaActiva) {
        const fam = familias.find(f => f.id === familiaActiva);
        famLabel.textContent = fam ? `– ${fam.nombre.toUpperCase()}` : '';
      } else {
        famLabel.textContent = '– TODAS';
      }
    }

    if(list.length===0){
      const msg = document.createElement('div');
      msg.style.opacity = .65;
      msg.style.padding = '10px';
      msg.textContent = '(Sin artículos que coincidan)';
      $articulos.appendChild(msg);
      return;
    }

    list.forEach(a=>{
      const b = document.createElement('button');
      b.className = `prod ${a.color}`;
      b.innerHTML = renderProductoHTML(a);
      b.addEventListener('click', ()=> addToTicket(a, pendingQty));
      $articulos.appendChild(b);
    });
  }

  function renderTicket(){
    $ticketBody.innerHTML = '';
    let total = 0;

    ticket.forEach(item=>{
      const pvp = item.cantidad * item.punit;
      total += pvp;

      const tr = document.createElement('tr');
      const rowKey = `${item.nombre}::${item.punit.toFixed(2)}`; // ← MISMA clave en ambas tablas
      tr.dataset.key = rowKey;

      tr.innerHTML = `
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>${eur(item.punit)}</td>
        <td>${eur(pvp)}</td>
      `;

      // Al hacer click en una fila del ticket principal:
      // 1) guardamos la clave seleccionada
      // 2) abrimos el modal
      // 3) renderizamos la tabla del modal (por si cambió)
      // 4) destacamos la misma fila dentro del modal
      tr.addEventListener('click', ()=>{
        selectedKey = rowKey;
        openModalModif();
        renderTicketModif();                 // asegura que el modal está actualizado
        requestAnimationFrame(() => {        // garantiza que los <tr> existen antes de buscar
          highlightInModalByKey(selectedKey);
        });
        updateSelectedPreview();
      });

      $ticketBody.appendChild(tr);
    });

    $total.textContent = eur(total);

    // efecto "flash" última línea + pop total
    if (lastAddedKey) {
      const row = $ticketBody.querySelector(`tr[data-key="${lastAddedKey}"]`);
      if (row) {
        row.classList.remove('row-flash');
        void row.offsetWidth;
        row.classList.add('row-flash');
      }
      $total.classList.remove('bump');
      void $total.offsetWidth;
      $total.classList.add('bump');

      lastAddedKey = null;
    }
  }

  function renderTicketModif(){
    $ticketBodyModif.innerHTML = '';
    let total = 0;

    ticket.forEach(item=>{
      const pvp = item.cantidad * item.punit;
      total += pvp;

      const tr = document.createElement('tr');
      const rowKey = `${item.nombre}::${item.punit.toFixed(2)}`; // ← MISMA clave
      tr.dataset.key = rowKey;

      tr.innerHTML = `
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>${eur(item.punit)}</td>
        <td>${eur(pvp)}</td>
      `;

      // Permite cambiar la selección dentro del modal
      tr.addEventListener('click', ()=>{
        selectedKey = rowKey;                     // ← guarda la nueva selección
        clearSelectionIn($ticketBodyModif);
        tr.classList.add('selected');
        updateSelectedPreview();
      });

      $ticketBodyModif.appendChild(tr);
    });

    // ← restaura selección previa si existe (no hace scroll para no marear si fue un simple re-render)
    if (selectedKey) highlightInModalByKey(selectedKey, { scroll: false });
    updateSelectedPreview();
    $total.textContent = eur(total);
  }

  // =========================
  // 🧾 Ticket ops
  // =========================
  function addToTicket(art, qty = pendingQty){
    const key = `${art.nombre}::${art.precio.toFixed(2)}`;
    const row = ticket.find(x => x.nombre === art.nombre && x.punit === art.precio);

    if(row) row.cantidad += qty;
    else ticket.push({ nombre: art.nombre, punit: art.precio, cantidad: qty });

    lastAddedKey = key;
    renderTicket();
    renderTicketModif();

    // reset qty a ×1 siempre
    pendingQty = 1;
    if ($qtyValue) $qtyValue.textContent = 1;
    showQtyHint();
  }

  // =========================
  // 🔍 Buscador
  // =========================
  $inputBuscar.addEventListener('input', ()=> renderArticulos());

  // =========================
  // 🔁 Randomize + Init
  // =========================
  function randomizeAll(){
    genFamilias();
    genArticulos();
    familiaActiva = null;
    ticket = [];
    renderFamilias();
    renderArticulos();
    renderTicket();
  }

  // =========================
  // 🔢 Keypad (2..6 y C)
  // =========================
  document.querySelectorAll('.q[data-q]').forEach(btn=>{
    btn.addEventListener('click', ()=> setQty(parseInt(btn.dataset.q,10)));
  });
  const $btnClear = document.querySelector('#qty-clear');
  if ($btnClear) {
    $btnClear.addEventListener('click', ()=>{
      pendingQty = 1; if ($qtyValue) $qtyValue.textContent = 1; showQtyHint();
    });
  }

  // Teclado: 2..6 y C/c (si no estás escribiendo en el buscador)
  document.addEventListener('keydown', (e)=>{
    if (document.activeElement === $inputBuscar) return;
    if (/[2-6]/.test(e.key)) setQty(parseInt(e.key,10));
    if (e.key.toLowerCase() === 'c') { pendingQty = 1; if ($qtyValue) $qtyValue.textContent = 1; showQtyHint(); }
  });

  // =========================
  // ⚡ Artículos Rápidos (usa pendingQty)
  // =========================
  el('#btn-rapidos').addEventListener('click', () => {
    const seleccion = [];
    const copia = [...articulos];

    while (seleccion.length < 12 && copia.length > 0) {
      const index = Math.floor(Math.random() * copia.length);
      seleccion.push(copia.splice(index, 1)[0]);
    }

    const lista = el('#rapidos-list');
    lista.innerHTML = '';
    seleccion.forEach(a => {
      const b = document.createElement('button');
      b.className = `prod ${a.color}`;
      b.innerHTML = renderProductoHTML(a);
      b.addEventListener('click', () => {
        addToTicket(a, pendingQty); // ← respeta la cantidad
        closeModal();
      });
      lista.appendChild(b);
    });

    openModal();
  });

  function openModal() { el('#modal-rapidos').classList.remove('hidden'); }
  function closeModal() { el('#modal-rapidos').classList.add('hidden'); }
  el('#cerrar-modal').addEventListener('click', closeModal);
  el('#modal-rapidos .modal-backdrop').addEventListener('click', closeModal);

  const modificarBtn = document.getElementById("btn-modificar")
  const cerrarModificar = document.getElementById("cerrar-modal-modificar")
  function openModalModif() { el("#modal-modificar").classList.remove('hidden'); }
  function closeModalModif() { el("#modal-modificar").classList.add('hidden'); }
  modificarBtn.addEventListener('click', openModalModif);
  cerrarModificar.addEventListener('click', closeModalModif);

// =========================
// 🗑️ Borrados
// =========================
document.getElementById('btn-borrar-linea')?.addEventListener('click', deleteSelectedLine);
document.getElementById('btn-borrar-todo') ?.addEventListener('click', deleteAllLines);

function deleteSelectedLine() {
  // Si no hay selección, intenta leerla del modal
  if (!selectedKey) {
    const sel = $ticketBodyModif.querySelector('tr.selected');
    if (sel) selectedKey = sel.dataset.key || null;
    
  }
  if (!selectedKey) return; // nada que borrar

  const idx = ticket.findIndex(it => `${it.nombre}::${it.punit.toFixed(2)}` === selectedKey);
  if (idx === -1) return;

  // Quitar del modelo
  ticket.splice(idx, 1);

  // Elegir nueva selección (siguiente o anterior)
  if (ticket.length > 0) {
    const newIndex = Math.min(idx, ticket.length - 1);
    const it = ticket[newIndex];
    selectedKey = `${it.nombre}::${it.punit.toFixed(2)}`;
  } else {
    selectedKey = null;
  }

  // Re-render en ambas tablas
  renderTicket();
  renderTicketModif();

  // Re-enfocar selección en el modal si queda algo
  if (selectedKey) {
    requestAnimationFrame(() => highlightInModalByKey(selectedKey));
  }
  updateSelectedPreview();

}

function deleteAllLines() {
  ticket.length = 0;
  selectedKey = null;
  renderTicket();
  renderTicketModif();
  updateSelectedPreview();
}
// helper para encontrar una línea por la clave compartida
function findByKey(key){
  return ticket.find(it => `${it.nombre}::${it.punit.toFixed(2)}` === key);
}

// refresca el texto del resumen en el hueco del modal
function updateSelectedPreview(){
  if (!$selPreview) return;
  const it = selectedKey ? findByKey(selectedKey) : null;
  if (!it){
    $selPreview.textContent = '(sin línea seleccionada)';
    return;
  }
  // “Descripción — cantidad × precioUnitario”
  $selPreview.innerHTML = `<strong>${it.nombre}</strong> — ${it.cantidad} × ${eur(it.punit)}`;
}

    
  // 🚀 Init
  randomizeAll();
});

