document.addEventListener('DOMContentLoaded', () => {
  /* --- REFERENCIAS --- */
  const licenciaNumero = document.querySelector('.licencia-numero');
  const btnSoporte = document.getElementById('btnSoporte');
  const menuSoporte = document.getElementById('menuSoporte');
  const inputClave = document.getElementById('claveInput');
  const btns = document.querySelectorAll('.keys button');
  const toggleClave = document.getElementById('toggleClave');

  /* 🔹 COPIAR LICENCIA */
  if (licenciaNumero) {
    licenciaNumero.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(licenciaNumero.textContent.trim());
        const aviso = document.createElement('span');
        aviso.textContent = '📋 Copiado';
        aviso.classList.add('copiado-aviso');
        licenciaNumero.appendChild(aviso);
        setTimeout(() => aviso.remove(), 1500);
      } catch {
        alert('No se pudo copiar la licencia 😕');
      }
    });
  }

  /* 🔹 MENÚ SOPORTE */
  if (btnSoporte && menuSoporte) {
    btnSoporte.addEventListener('click', (e) => {
      e.preventDefault();
      menuSoporte.style.display =
        menuSoporte.style.display === 'flex' ? 'none' : 'flex';
    });

    document.addEventListener('click', (e) => {
      if (!btnSoporte.contains(e.target) && !menuSoporte.contains(e.target)) {
        menuSoporte.style.display = 'none';
      }
    });
  }

  /* 🔹 TECLADO EN PANTALLA */
  if (btns && inputClave) {
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.textContent.trim();

        if (!isNaN(value)) {
          inputClave.value += value;
        } else if (value === 'C') {
          // borrar último carácter
          inputClave.value = inputClave.value.slice(0, -1);
        } else if (value === '×') {
          // limpiar todo
          inputClave.value = '';
        } else if (value === '✔') {
          handleEnter();
        }
      });
    });
  }

  /* 🔹 TECLADO FÍSICO (sin foco necesario) */
  document.addEventListener('keydown', (e) => {
    if (!inputClave) return;

    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      inputClave.value += e.key;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      inputClave.value = inputClave.value.slice(0, -1);
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      inputClave.value = '';
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnter();
    }
  });

  /* 🔹 ACCIÓN DE ENTER */
  function handleEnter() {
    if (!inputClave.value) return;
    alert(`Clave ingresada: ${inputClave.value}`);
    inputClave.value = '';
  }

  /* 🔹 OJITO PERSONALIZADO (SVGs dorados) */
  if (toggleClave && inputClave) {
    const icono = toggleClave.querySelector('img');
    toggleClave.addEventListener('click', () => {
      const visible = inputClave.type === 'text';
      inputClave.type = visible ? 'password' : 'text';
      icono.src = visible
        ? '/img/ojo-no-visible.svg'
        : '/img/ojo-visible.svg';
    });
  }
});
