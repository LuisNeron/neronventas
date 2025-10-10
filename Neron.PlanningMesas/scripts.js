document.addEventListener('DOMContentLoaded', () => {
  const mainGrid = document.querySelector('.mesas-grid');
  const filtros = document.querySelectorAll('.filtro');

  const lugares = ['cafeteria', 'comedor', 'terraza', 'meson', 'habitacion'];

  // 🎨 Mapa de colores (para fondo y texto del botón)
  const coloresLugares = {
    cafeteria:  { fondo: '#00bcd4', texto: '#ffffff' },
    comedor:    { fondo: '#795548', texto: '#ffffff' },
    terraza:    { fondo: '#8e7cc3', texto: '#ffffff' },
    meson:      { fondo: '#ffeb3b', texto: '#000000' }, // texto negro por ser amarillo
    habitacion: { fondo: '#607d8b', texto: '#ffffff' }
  };

  // ==========================================================
  // 🧩 Generar datos aleatorios de mesas (simulación)
  //   - importe = 0 → libre (verde)
  //   - importe > 0 y !pendiente → ocupada (amarilla)
  //   - pendiente = true → pendiente (roja)
  // ==========================================================
  const mesasData = [];
  let idCounter = 1;

  lugares.forEach(lugar => {
    const numMesas = Math.floor(Math.random() * 15) + 1; // mínimo 1, máximo 15
    for (let i = 1; i <= numMesas; i++) {
      const random = Math.random();
      let importe;
      let pendiente; // 👈 evita variable global

      if (random < 0.6) {
        importe = 0; // libre
        pendiente = false;
      } else {
        importe = +(Math.random() * 50).toFixed(2); // ocupada o pendiente (número, no string)
        pendiente = Math.random() > 0.5; // 50% de las ocupadas están pendientes
      }

      mesasData.push({
        id: idCounter++,
        nombre: `Mesa ${i}`,
        lugar,
        importe,
        pendiente,
        ticket: [] // se rellena si está pendiente
      });
    }
  });

  // ==========================================================
  // 🧾 Tickets de ejemplo para las mesas pendientes
  // ==========================================================
  const productos = [
    { nombre: "Café", precio: 1.5 },
    { nombre: "Té", precio: 1.2 },
    { nombre: "Bocadillo", precio: 3.5 },
    { nombre: "Ensalada", precio: 4.2 },
    { nombre: "Refresco", precio: 2.0 },
    { nombre: "Cerveza", precio: 2.5 },
    { nombre: "Postre", precio: 3.0 },
    { nombre: "Pizza", precio: 6.0 },
    { nombre: "Hamburguesa", precio: 5.5 }
  ];

  mesasData.forEach(mesa => {
    if (mesa.pendiente) {
      const numItems = Math.floor(Math.random() * 5) + 1;
      let total = 0;
      for (let i = 0; i < numItems; i++) {
        const prod = productos[Math.floor(Math.random() * productos.length)];
        const cantidad = Math.floor(Math.random() * 3) + 1;
        mesa.ticket.push({ nombre: prod.nombre, precio: prod.precio, cantidad });
        total += prod.precio * cantidad;
      }
      mesa.importe = +total.toFixed(2); // número
    }
  });

  // ==========================================================
  // 🔍 Buscador + (se crean) checkboxes de estado
  // ==========================================================
  const inputBuscar = document.getElementById('inputBuscar');

  // Creamos los checkboxes por JS para no tocar tu HTML
  const buscadorBox = document.querySelector('.buscador');
  let chkConPedido, chkPendiente;
  if (buscadorBox && !document.querySelector('.estado-filtros')) {
    const estadoFiltros = document.createElement('div');
    estadoFiltros.className = 'estado-filtros';
    estadoFiltros.innerHTML = `
      <label class="chk">
        <input type="checkbox" id="chkConPedido">
        <span>Con pedido</span>
      </label>
      <label class="chk">
        <input type="checkbox" id="chkPendiente">
        <span>Pendiente de cobro</span>
      </label>
    `;
    buscadorBox.insertAdjacentElement('afterend', estadoFiltros);
    chkConPedido = estadoFiltros.querySelector('#chkConPedido');
    chkPendiente = estadoFiltros.querySelector('#chkPendiente');
  } else {
    chkConPedido = document.getElementById('chkConPedido');
    chkPendiente = document.getElementById('chkPendiente');
  }

  function pasaFiltroEstado(mesa) {
    const conPedidoMarcado = chkConPedido?.checked;
    const pendienteMarcado = chkPendiente?.checked;
    // Si no hay checks marcados → no filtra por estado
    if (!conPedidoMarcado && !pendienteMarcado) return true;

    const esConPedido = mesa.importe > 0; // amarillas + rojas
    const esPendiente = mesa.pendiente;   // rojas

    return (conPedidoMarcado && esConPedido) || (pendienteMarcado && esPendiente);
  }

  function pasaFiltroBusqueda(mesa) {
    const texto = (inputBuscar?.value || '').trim().toLowerCase();
    if (!texto) return true;
    return mesa.nombre.toLowerCase().includes(texto);
  }

  // ==========================================================
  // 🎨 Renderizado de mesas (con contador de abiertas/pendientes)
  // ==========================================================
  function renderMesas(filtro = 'todos') {
    mainGrid.innerHTML = ''; // limpiar

    function crearBloqueLugar(lugar, grupo) {
      // Aplica filtros de estado + búsqueda
      const visible = grupo.filter(m => pasaFiltroEstado(m) && pasaFiltroBusqueda(m));
      if (visible.length === 0) return;

      const abiertas   = visible.filter(m => m.importe > 0).length; // amarillas + rojas
      const pendientes = visible.filter(m => m.pendiente).length;   // rojas

      const separador = document.createElement('div');
      separador.classList.add('separador-lugar');

      // 🏷️ Título con nombre + icono + cantidad
      const titulo = document.createElement('div');
      titulo.classList.add('titulo-lugar');
      titulo.innerHTML = `
        <span class="nombre-lugar">
          ${lugar.charAt(0).toUpperCase() + lugar.slice(1)}
        </span>
        <i class="fa-solid fa-caret-down toggle-icon-inline"></i>
        ${
          abiertas > 0
            ? `<span class="info-abiertas">
                 ${abiertas} mesa${abiertas > 1 ? 's' : ''} abierta${abiertas > 1 ? 's' : ''}
                 ${pendientes > 0 ? ` · <span class="pendientes">${pendientes} pendientes de cobro</span>` : ''}
               </span>`
            : `<span class="info-vacia">(ninguna mesa abierta)</span>`
        }
      `;

      separador.appendChild(titulo);
      separador.style.color = coloresLugares[lugar].fondo;

      const contenedorGrupo = document.createElement('div');
      contenedorGrupo.classList.add('grupo-lugar');
      visible.forEach(mesa => contenedorGrupo.appendChild(crearMesaDiv(mesa)));

      // 🧩 Click para plegar/desplegar
      separador.addEventListener('click', () => {
        const isCollapsed = contenedorGrupo.classList.toggle('colapsado');
        const iconos = separador.querySelectorAll('.toggle-icon-inline');
        iconos.forEach(i => {
          i.classList.toggle('fa-caret-down', !isCollapsed);
          i.classList.toggle('fa-caret-right', isCollapsed);
        });
      });

      mainGrid.appendChild(separador);
      mainGrid.appendChild(contenedorGrupo);
    }

    if (filtro === 'todos') {
      lugares.forEach(lugar => {
        const grupo = mesasData.filter(m => m.lugar === lugar);
        crearBloqueLugar(lugar, grupo);
      });
    } else {
      const filtradas = mesasData.filter(m => m.lugar === filtro);
      if (filtradas.length === 0) {
        mainGrid.innerHTML = '<p style="opacity:0.6;">(Sin mesas en este lugar)</p>';
        return;
      }
      crearBloqueLugar(filtro, filtradas);
    }
  }

  // ==========================================================
  // 🪑 Crear elemento visual de mesa
  // ==========================================================
  function crearMesaDiv(mesa) {
    const div = document.createElement('div');
    div.classList.add('mesa');

    if (mesa.importe === 0) {
      div.classList.add('libre');         // verde
    } else if (mesa.pendiente) {
      div.classList.add('pendiente');     // rojo
    } else {
      div.classList.add('ocupada');       // amarillo
    }

    // Nombre + importe
    const nombreSpan = document.createElement('span');
    nombreSpan.classList.add('nombre');
    nombreSpan.textContent = mesa.nombre;

    const importeSpan = document.createElement('span');
    importeSpan.classList.add('importe');
    importeSpan.textContent = `(${Number(mesa.importe).toFixed(2)}€)`;

    div.appendChild(nombreSpan);
    div.appendChild(importeSpan);

    // Icono de factura si está pendiente
    if (mesa.pendiente) {
      const facturaIcon = document.createElement('img');
      facturaIcon.src = '/img/factura.svg';
      facturaIcon.classList.add('icono-factura');
      facturaIcon.addEventListener('click', e => {
        e.stopPropagation();
        abrirTicket(mesa);
      });
      div.appendChild(facturaIcon);
    }

    return div;
  }

  // ==========================================================
  // 🧭 Filtros laterales (lugares)
  // ==========================================================
  function lugarActivo() {
    const act = document.querySelector('.filtro.activo');
    if (!act) return 'todos';
    const raw = act.textContent.trim().toLowerCase();
    const lugar = raw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '');
    return lugar.includes('todos') ? 'todos' : lugar;
  }

  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      renderMesas(lugarActivo());
    });

    // 🎨 Aplicar color de fondo y texto desde el mapa
    const raw = btn.textContent.trim().toLowerCase();
    const lugar = raw
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '');
    if (coloresLugares[lugar]) {
      btn.style.background = coloresLugares[lugar].fondo;
      btn.style.color = coloresLugares[lugar].texto;
    }
  });

  // ==========================================================
  // 🔧 Ajustes
  // ==========================================================
  const btnAjustes = document.getElementById('btnAjustes');
  const modal = document.getElementById('modalAjustes');
  const btnCerrar = document.getElementById('btnCerrarAjustes');
  const btnGuardar = document.getElementById('btnGuardarAjustes');
  const selectLugar = document.getElementById('selectLugarDefault');

  btnAjustes?.addEventListener('click', () => modal.classList.add('activo'));
  btnCerrar?.addEventListener('click', () => modal.classList.remove('activo'));

  const config = JSON.parse(localStorage.getItem('ajustesMesas')) || {};
  lugares.forEach(l => {
    const chk = document.getElementById(`chk${l.charAt(0).toUpperCase() + l.slice(1)}`);
    if (chk && config[l] === false) chk.checked = false;
  });
  if (config.defaultLugar && selectLugar) selectLugar.value = config.defaultLugar;

  btnGuardar?.addEventListener('click', () => {
    const nuevaConfig = {};
    lugares.forEach(l => {
      const chk = document.getElementById(`chk${l.charAt(0).toUpperCase() + l.slice(1)}`);
      nuevaConfig[l] = chk ? chk.checked : true;
    });
    if (selectLugar) nuevaConfig.defaultLugar = selectLugar.value;
    localStorage.setItem('ajustesMesas', JSON.stringify(nuevaConfig));
    modal.classList.remove('activo');
    alert('✅ Ajustes guardados correctamente');
  });

  // ==========================================================
  // 🔍 Buscador de mesas (re-render con filtros)
  // ==========================================================
  if (inputBuscar) {
    inputBuscar.addEventListener('input', () => {
      renderMesas(lugarActivo());
    });
  }

  // 🔁 Re-render al cambiar los checkboxes de estado
  [chkConPedido, chkPendiente].forEach(chk => {
    chk?.addEventListener('change', () => renderMesas(lugarActivo()));
  });

  // ==========================================================
  // 🧾 Modal Ticket (usa los tickets generados arriba)
  // ==========================================================
  function abrirTicket(mesa) {
    const modal = document.getElementById('modalTicket');
    const nombre = document.getElementById('ticketMesaNombre');
    const itemsUl = document.getElementById('ticketItems');
    const totalSpan = document.getElementById('ticketTotal');

    if (!modal) return; // por si no existe en tu HTML

    nombre.textContent = mesa.nombre;
    itemsUl.innerHTML = '';

    let total = 0;
    (mesa.ticket || []).forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.cantidad} x ${item.nombre}</span> <span>${(item.precio * item.cantidad).toFixed(2)}€</span>`;
      itemsUl.appendChild(li);
      total += item.precio * item.cantidad;
    });

    totalSpan.textContent = total.toFixed(2) + '€';
    modal.classList.add('activo');
  }

  document.getElementById('btnCerrarTicket')?.addEventListener('click', () => {
    document.getElementById('modalTicket')?.classList.remove('activo');
  });

  // ==========================================================
  // 🚀 Render inicial
  // ==========================================================
  renderMesas('todos');
});
