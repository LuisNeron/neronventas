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
  const $total       = el('#ticket-total');
  const $inputBuscar = el('#inputBuscar');

  // =========================
  // 🧠 Estado
  // =========================
  let familias = [];   // [{id, nombre, color}]
  let articulos = [];  // [{id, familiaId, nombre, precio, color}]
  let familiaActiva = null;
  let ticket = [];     // [{nombre, punit, cantidad}]
  let lastAddedKey = null; 

  // =========================
  // ⏰ Reloj + Tarifa
  // =========================
  //(dd/mm/yyyy HH:MM:SS)
el('#tarifa-pill').textContent = `Tarifa ${CONFIG.tarifa}`;

(function startBottomClock(){
  // Quita el reloj antiguo del ticket si existe
  const old = document.querySelector('#clock-pill');
  if (old && old.parentElement) old.parentElement.removeChild(old);

  const $bottomClock = document.querySelector('#reloj-bottom');
  const pad = n => String(n).padStart(2,'0');

  const tick = () => {
    const d = new Date();
    // const fecha = `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
    const hora  = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    if ($bottomClock) $bottomClock.textContent = `${hora}`;
  };

  tick();                 // pinta ya
  setInterval(tick, 1000); // y cada segundo
})();


  // =========================
  // Utils y datos dummy
  // =========================
  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const eur = n => n.toFixed(2).replace('.', ',');

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
  // 🔎 Búsqueda (sin filtros extra)
  // =========================
  function pasaBusqueda(a){
    const t = ($inputBuscar.value || '').trim().toLowerCase();
    if(!t) return true;
    return a.nombre.toLowerCase().includes(t);
  }
  function pasaFiltros(a){
    // No hay filtros (>10€, oferta). Todo pasa.
    return true;
  }

  // =========================
  // 🧩 HTML de cada producto (precio arriba-derecha)
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

    // Etiqueta de familia activa al lado de “ARTÍCULOS”
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
      b.innerHTML = renderProductoHTML(a);   // ← precio arriba-derecha
      b.addEventListener('click', ()=> addToTicket(a));
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
      const rowKey = `${item.nombre}::${item.punit.toFixed(2)}`; // <-- clave estable
      tr.dataset.key = rowKey;                                    // <-- NUEVO

      tr.innerHTML = `
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>${eur(item.punit)}</td>
        <td>${eur(pvp)}</td>
      `;

      // click para quitar 1
      tr.addEventListener('click', ()=>{
        item.cantidad -= 1;
        if(item.cantidad<=0) ticket = ticket.filter(x=>x!==item);
        renderTicket();
      });

      $ticketBody.appendChild(tr);
    });

    $total.textContent = eur(total);

    // 🔔 Aplica el flash a la última línea añadida y el “pop” al total
    if (lastAddedKey) {
      const row = $ticketBody.querySelector(`tr[data-key="${lastAddedKey}"]`);
      if (row) {
        row.classList.remove('row-flash'); // permite re-disparar
        void row.offsetWidth;              // reflow para reiniciar anim
        row.classList.add('row-flash');
      }
      $total.classList.remove('bump');
      void $total.offsetWidth;
      $total.classList.add('bump');

      lastAddedKey = null; // resetea
    }
  }

  // =========================
  // 🧾 Ticket ops
  // =========================
  function addToTicket(art){
    const key = `${art.nombre}::${art.precio.toFixed(2)}`; // <-- NUEVO
    const row = ticket.find(x => x.nombre === art.nombre && x.punit === art.precio);
    if(row) row.cantidad += 1;
    else ticket.push({ nombre: art.nombre, punit: art.precio, cantidad: 1 });

    lastAddedKey = key;   // <-- di a quién animar
    renderTicket();
  }

  // =========================
  // 🔍 Buscador
  // =========================
  $inputBuscar.addEventListener('input', ()=> renderArticulos());

  // =========================
  // 🔁 Randomize + Vaciar
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

  // el('#btn-vaciar').addEventListener('click', ()=>{ ticket = []; renderTicket(); });

  // =========================
  // 🔁 Artículos Rápidos
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
      b.innerHTML = renderProductoHTML(a);   // ← mismo badge aquí
      b.addEventListener('click', () => {
        addToTicket(a);
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

  // =========================
  // 🚀 Init
  // =========================
  randomizeAll();
});
