document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // ⚙️ CONFIG
  // =========================
const CONFIG = {
  familias: 12,  // antes estaba en 10
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
  const $familias = el('#familias');
  const $articulos = el('#articulos');
  const $ticketBody = el('#ticket-body');
  const $total = el('#ticket-total');
  const $titulo = el('#titulo-menu');
  const $inputBuscar = el('#inputBuscar');
  const $filtrosEstado = el('#filtrosEstado');

  // =========================
  // 🧠 Estado
  // =========================
  let familias = [];   // [{id, nombre, color}]
  let articulos = [];  // [{id, familiaId, nombre, precio, color}]
  let familiaActiva = null;
  let ticket = [];     // [{nombre, punit, cantidad}]

  // Filtros demo (como tu ejemplo de mesas)
  const filtros = {
    // si algún día tu artículo tiene flags (vegano/oferta/etc), los enchufas aquí
    oferta: false,
    caro: false, // > 10€
  };

  // =========================
  // ⏰ Reloj + Tarifa
  // =========================
  el('#tarifa-pill').textContent = `Tarifa ${CONFIG.tarifa}`;
  (function startClock(){
    const pill = el('#clock-pill');
    const tick = () => {
      const d = new Date();
      pill.textContent = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
    };
    tick(); setInterval(tick, 30_000);
  })();

  // =========================
// 🎲 Generación de datos (random)
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const eur = n => n.toFixed(2).replace('.', ',');

// 🖼️ Imágenes de fondo de las familias
const urls = [
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80", // hamburguesa ✅
  "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80", // pizza ✅
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", // ensalada ✅
  "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80", // pasta (reemplazo estable) ✅
  "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80", // carne ✅
  "https://images.unsplash.com/photo-1625938144756-903ba3f7c5f3?auto=format&fit=crop&w=600&q=80", // empanadas (reemplazo estable) ✅
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", // postre ✅
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", // filete ✅
  "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80", // pizza repetida ✅
  "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80", // empanadas repetidas ✅
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80", // carne repetida ✅
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"  // postre repetido ✅
];



// ⚙️ Familias aleatorias con imagen cíclica
function genFamilias() {
  familias = Array.from({ length: CONFIG.familias }, (_, i) => ({
    id: (i % urls.length) + 1, // 🔁 Repite imágenes si hay más familias que fotos
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
          color: pick(COLORS),
          oferta: Math.random() < 0.18       // ~18% están en "oferta"
        });
      }
    });
  }

  // =========================
  // 🧪 Filtros (búsqueda/estado)
  // =========================
  function pasaBusqueda(a){
    const t = ($inputBuscar.value || '').trim().toLowerCase();
    if(!t) return true;
    return a.nombre.toLowerCase().includes(t);
  }
  function pasaFiltros(a){
    if (filtros.caro && a.precio <= 10) return false;
    if (filtros.oferta && !a.oferta) return false;
    return true;
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

    // 🖼️ Asigna imagen de fondo (usa el ID para buscar la imagen)
    b.style.setProperty('--bg-img', `url('${urls[f.id - 1]}')`);


    // Evento al hacer click
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
    const idx = id; // porque 0 es "TODAS"
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

    // Título de arriba
    // Actualizar etiqueta de familia activa a la derecha de "ARTÍCULOS"
const famLabel = el('#familia-actual');
if (famLabel) {
  if (familiaActiva) {
    const fam = familias.find(f => f.id === familiaActiva);
    famLabel.textContent = fam ? `– ${fam.nombre.toUpperCase()}` : '';
  } else {
    famLabel.textContent = '– TODAS';
  }
}

    $titulo.textContent = familiaActiva
      ? (familias.find(f=>f.id===familiaActiva)?.nombre || 'MENÚ').toUpperCase()
      : 'MENÚ (TODAS)';

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
      b.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;align-items:center">
          <div style="font-weight:900">${a.nombre.toUpperCase()}</div>
          <div style="opacity:.85">€ ${eur(a.precio)}</div>
          ${a.oferta ? '<div class="pill" style="margin-top:4px">OFERTA</div>' : ''}
        </div>
      `;
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
      tr.innerHTML = `
        <td>${item.nombre}</td>
        <td>${item.cantidad}</td>
        <td>${eur(item.punit)}</td>
        <td>${eur(pvp)}</td>
      `;
      // click para quitar 1 (igual que en el ejemplo de mesas con acciones rápidas)
      tr.addEventListener('click', ()=>{
        item.cantidad -= 1;
        if(item.cantidad<=0) ticket = ticket.filter(x=>x!==item);
        renderTicket();
      });
      $ticketBody.appendChild(tr);
    });

    $total.textContent = eur(total);
  }

  // =========================
  // 🧾 Ticket ops
  // =========================
  function addToTicket(art){
    const row = ticket.find(x => x.nombre === art.nombre && x.punit === art.precio);
    if(row) row.cantidad += 1;
    else ticket.push({ nombre: art.nombre, punit: art.precio, cantidad: 1 });
    renderTicket();
  }

  // =========================
  // 🔍 Buscador + filtros “estado”
  // =========================
  (function crearFiltrosEstado(){
    // 2 pills/checkboxes para simular “estado”
    // caro: >10€ | oferta: flag aleatorio
    $filtrosEstado.innerHTML = `
      <label class="pill" style="cursor:pointer;display:flex;gap:6px;align-items:center;">
        <input type="checkbox" id="chkCaro" style="accent-color:#d3b36b"> > 10€
      </label>
      <label class="pill" style="cursor:pointer;display:flex;gap:6px;align-items:center;">
        <input type="checkbox" id="chkOferta" style="accent-color:#d3b36b"> Oferta
      </label>
    `;
    const chkCaro = el('#chkCaro');
    const chkOferta = el('#chkOferta');
    chkCaro.addEventListener('change', ()=>{ filtros.caro = chkCaro.checked; renderArticulos(); });
    chkOferta.addEventListener('change', ()=>{ filtros.oferta = chkOferta.checked; renderArticulos(); });
  })();

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

  el('#btn-aleatorio').addEventListener('click', randomizeAll);
  el('#btn-vaciar').addEventListener('click', ()=>{ ticket = []; renderTicket(); });

  // =========================
  // 🚀 Init
  // =========================
  randomizeAll();
});
