(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');
  const toggleLabel = toggle?.querySelector('.sr-only');

  const setHeaderState = () => {
    if (header && !header.classList.contains('header-solid')) {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    }
  };

  const closeMenu = () => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    if (toggleLabel) toggleLabel.textContent = 'Abrir menú';
  };

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const opening = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(opening));
      menu.classList.toggle('is-open', opening);
      if (toggleLabel) toggleLabel.textContent = opening ? 'Cerrar menú' : 'Abrir menú';
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        toggle.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  document.querySelectorAll('[data-current-year]').forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const form = document.querySelector('[data-contact-form]');
  const formStatus = document.querySelector('[data-form-status]');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const institution = String(data.get('institution') || '').trim();
      const email = String(data.get('email') || '').trim();
      const topic = String(data.get('topic') || '').trim();
      const message = String(data.get('message') || '').trim();
      const subject = `Consulta web ANACEO: ${topic}`;
      const body = [
        `Nombre: ${name}`,
        `Institución: ${institution || 'No indicada'}`,
        `Correo de respuesta: ${email}`,
        `Tipo de consulta: ${topic}`,
        '',
        'Mensaje:',
        message
      ].join('\n');

      if (formStatus) formStatus.textContent = 'Abriendo tu aplicación de correo. Revisa el mensaje antes de enviarlo.';
      window.location.href = `mailto:contacto@anaceochile.cl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
})();
