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
  // ==========================================================
  const mesasData = [];
  let idCounter = 1;

  lugares.forEach(lugar => {
    const numMesas = Math.floor(Math.random() * 15) + 1; // mínimo 1, máximo 15
for (let i = 1; i <= numMesas; i++) {
  const random = Math.random();
  let importe;

if (random < 0.6) {
  importe = 0; // libre
  pendiente = false;
} else {
  importe = (Math.random() * 50).toFixed(2); // ocupada o pendiente
  pendiente = Math.random() > 0.5; // 50% de las ocupadas están pendientes
}

mesasData.push({
  id: idCounter++,
  nombre: `Mesa ${i}`,
  lugar,
  importe,
  pendiente
});

}

  });

  // ==========================================================
  // 🎨 Renderizado de mesas (con contador de abiertas)
  // ==========================================================
  function renderMesas(filtro = 'todos') {
    mainGrid.innerHTML = ''; // limpiar

function crearBloqueLugar(lugar, grupo) {
  if (grupo.length === 0) return;

  const abiertas = grupo.filter(m => parseFloat(m.importe) > 0).length;
  const pendientes = grupo.filter(m => m.pendiente).length;

  const separador = document.createElement('div');
  separador.classList.add('separador-lugar');

  // 🔽 Ícono Font Awesome para plegar/desplegar
  const icono = document.createElement('i');
  icono.classList.add('fa-solid', 'fa-caret-down', 'toggle-icon'); // Ícono inicial desplegado

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
      : `<span class="info-vacia">(sin abiertas)</span>`
  }
`;

  separador.appendChild(titulo);
  separador.style.color = coloresLugares[lugar].fondo;

  const contenedorGrupo = document.createElement('div');
  contenedorGrupo.classList.add('grupo-lugar');
  grupo.forEach(mesa => contenedorGrupo.appendChild(crearMesaDiv(mesa)));

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

  // 🔴 Detectar estado
  if (mesa.importe == 0) {
    div.classList.add('mesa', 'libre');
  } else if (mesa.pendiente) {
    div.classList.add('mesa', 'pendiente');
  } else {
    div.classList.add('mesa', 'ocupada');
  }

  // 💰 Contenido base
  div.innerHTML = `
    <span class="nombre">${mesa.nombre}</span>
    <span class="importe">(${parseFloat(mesa.importe).toFixed(2)}€)</span>
  `;

  // 🧾 Si está pendiente (roja), añadimos la imagen factura.svg
  if (mesa.pendiente) {
    const facturaIcon = document.createElement('img');
    facturaIcon.src = '/img/factura.svg'; // Asegúrate de tener este archivo en la ruta correcta
    facturaIcon.classList.add('icono-factura');
    div.appendChild(facturaIcon);
  }

  return div;
}



  // ==========================================================
  // 🧭 Filtros laterales
  // ==========================================================
  filtros.forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');

      const raw = btn.textContent.trim().toLowerCase();
      const lugar = raw
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '');

      renderMesas(lugar.includes('todos') ? 'todos' : lugar);
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

  btnAjustes.addEventListener('click', () => modal.classList.add('activo'));
  btnCerrar.addEventListener('click', () => modal.classList.remove('activo'));

  const config = JSON.parse(localStorage.getItem('ajustesMesas')) || {};
  lugares.forEach(l => {
    const chk = document.getElementById(`chk${l.charAt(0).toUpperCase() + l.slice(1)}`);
    if (chk && config[l] === false) chk.checked = false;
  });
  if (config.defaultLugar) selectLugar.value = config.defaultLugar;

  btnGuardar.addEventListener('click', () => {
    const nuevaConfig = {};
    lugares.forEach(l => {
      const chk = document.getElementById(`chk${l.charAt(0).toUpperCase() + l.slice(1)}`);
      nuevaConfig[l] = chk.checked;
    });
    nuevaConfig.defaultLugar = selectLugar.value;
    localStorage.setItem('ajustesMesas', JSON.stringify(nuevaConfig));
    modal.classList.remove('activo');
    alert('✅ Ajustes guardados correctamente');
  });

  // ==========================================================
  // 🔍 Buscador de mesas
  // ==========================================================
  const inputBuscar = document.getElementById('inputBuscar');

  if (inputBuscar) {
    inputBuscar.addEventListener('input', () => {
      const texto = inputBuscar.value.trim().toLowerCase();

      if (texto === '') {
        renderMesas('todos');
        return;
      }

      const resultados = mesasData.filter(m =>
        m.nombre.toLowerCase().includes(texto)
      );

      mainGrid.innerHTML = '';

      if (resultados.length === 0) {
        mainGrid.innerHTML = `<p style="opacity:0.6;">No se encontraron mesas que coincidan con "${texto}"</p>`;
        return;
      }

      const lugaresEncontrados = [...new Set(resultados.map(r => r.lugar))];
      lugaresEncontrados.forEach(lugar => {
        const grupo = resultados.filter(m => m.lugar === lugar);

        const separador = document.createElement('div');
        separador.classList.add('separador-lugar');
        separador.textContent = lugar.charAt(0).toUpperCase() + lugar.slice(1);
        separador.style.color = coloresLugares[lugar].fondo;
        separador.style.borderColor = coloresLugares[lugar].fondo;
        mainGrid.appendChild(separador);

        const contenedorGrupo = document.createElement('div');
        contenedorGrupo.classList.add('grupo-lugar');
        grupo.forEach(mesa => contenedorGrupo.appendChild(crearMesaDiv(mesa)));
        mainGrid.appendChild(contenedorGrupo);
      });
    });
  }

  // ==========================================================
  // 🚀 Render inicial
  // ==========================================================
  renderMesas('todos');
});
