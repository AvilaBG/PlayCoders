(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA_NUMBER = '5553999661614';
  // Built from reversed base64 parts at click time so scrapers don't find a plain address in the source.
  // shortcut: deters bots only, anyone reading the JS can decode it; replace with the company inbox.
  const getEmail = () => ['bW9jLmxp', 'YW1nQDYwbmFtLmFsaXZh'].map(atob).join('').split('').reverse().join('');

  /* ---------- Theme ---------- */
  const themeBtn = document.getElementById('themeToggle');
  const sysLight = matchMedia('(prefers-color-scheme: light)');
  const resolved = () => root.dataset.theme || (sysLight.matches ? 'light' : 'dark');
  const applyTheme = () => {
    const t = resolved();
    root.dataset.themeResolved = t;
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.content = t === 'dark' ? '#0B0A0E' : '#F6F5F8');
    window.dispatchEvent(new Event('themechange'));
  };
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = resolved() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('pc-theme', root.dataset.theme); } catch (e) {}
    applyTheme();
  });
  sysLight.addEventListener('change', applyTheme);
  applyTheme();

  /* ---------- Header + mobile menu ---------- */
  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 900px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Reveal on scroll (staggered per parent) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  const groups = new Map();
  reveals.forEach(el => {
    const i = groups.get(el.parentElement) || 0;
    el.style.setProperty('--d', `${Math.min(i, 5) * 0.08}s`);
    groups.set(el.parentElement, i + 1);
  });
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-in');
    io.unobserve(en.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => io.observe(el));

  /* ---------- Rotating hero word ---------- */
  const words = ['tu app', 'tu web', 'tu sistema', 'tu tienda', 'tu software'];
  const codeTypes = ["'app'", "'web'", "'sistema'", "'e-commerce'", "'software'"];
  const rot = document.getElementById('rotator');
  const codeType = document.getElementById('codeType');
  if (!reduceMotion) {
    let w = 0;
    setInterval(() => {
      rot.classList.add('is-out');
      setTimeout(() => {
        w = (w + 1) % words.length;
        rot.textContent = words[w];
        codeType.textContent = codeTypes[w];
        rot.classList.remove('is-out');
      }, 350);
    }, 2600);
  }

  /* ---------- Count-up stats ---------- */
  const countIO = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    countIO.unobserve(el);
    if (reduceMotion || end === 0) { el.textContent = pre + end + suf; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

  /* ---------- Card spotlight (pointer devices only) ---------- */
  if (matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Hide FAB while the contact section is visible ---------- */
  const fab = document.querySelector('.fab');
  new IntersectionObserver(([en]) => fab.classList.toggle('is-hidden', en.isIntersecting), { threshold: 0.15 })
    .observe(document.getElementById('contacto'));

  /* ---------- Hero particle network ---------- */
  const canvas = document.getElementById('net');
  const ctx = canvas.getContext('2d');
  let pts = [], W = 0, H = 0, color = '79,198,202', running = false, raf = 0;
  const mouse = { x: -9999, y: -9999 };
  const readColor = () => {
    const hex = getComputedStyle(root).getPropertyValue('--brand').trim().replace('#', '');
    color = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',');
  };
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(Math.round(W * H / 16000), W < 600 ? 36 : 80);
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 }));
  };
  const LINK = 130;
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dxm = p.x - mouse.x, dym = p.y - mouse.y, dm = Math.hypot(dxm, dym);
      if (dm < 120) { p.x += dxm / dm; p.y += dym / dm; }
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      ctx.fillStyle = `rgba(${color},.8)`;
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${color},${(1 - d / LINK) * .35})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    if (running) raf = requestAnimationFrame(draw);
  };
  readColor(); resize();
  addEventListener('themechange', () => { readColor(); if (!running) draw(); });
  addEventListener('resize', () => { resize(); if (!running) draw(); });
  canvas.parentElement.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  if (reduceMotion) draw();
  else new IntersectionObserver(([en]) => {
    running = en.isIntersecting;
    cancelAnimationFrame(raf);
    if (running) raf = requestAnimationFrame(draw);
  }).observe(canvas);

  /* ---------- Contact form: build an email or WhatsApp message ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const via = e.submitter?.dataset.via || 'mail';
    const d = Object.fromEntries(new FormData(form));
    Object.keys(d).forEach(k => d[k] = String(d[k]).trim());

    const checks = [
      ['f-name', d.name.length > 1],
      // WhatsApp replies by phone, so email is only mandatory for the email route.
      ['f-email', via === 'wa' ? (!d.email || emailOk(d.email)) : emailOk(d.email)],
      ['f-msg', d.message.length > 4],
    ];
    let firstBad = null;
    checks.forEach(([id, ok]) => {
      const input = document.getElementById(id);
      input.closest('.field').classList.toggle('has-error', !ok);
      input.setAttribute('aria-invalid', !ok);
      if (!ok && !firstBad) firstBad = input;
    });
    if (firstBad) { firstBad.focus(); status.textContent = ''; return; }

    const text = `Hola PLAYCODERS, quiero pedir un presupuesto.\n\nNombre: ${d.name}\n` +
      (d.email ? `Email: ${d.email}\n` : '') + (d.phone ? `Teléfono: ${d.phone}\n` : '') +
      `Proyecto: ${d.type}\n\n${d.message}`;

    if (via === 'wa') {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      status.textContent = '¡Listo! Abrimos WhatsApp con tu mensaje.';
    } else {
      location.href = `mailto:${getEmail()}?subject=${encodeURIComponent(`Presupuesto: ${d.type} — ${d.name}`)}&body=${encodeURIComponent(text)}`;
      status.textContent = '¡Listo! Abrimos tu app de correo con el mensaje armado.';
    }
  });
  form.addEventListener('input', e => {
    const f = e.target.closest('.field');
    if (f?.classList.contains('has-error')) { f.classList.remove('has-error'); e.target.removeAttribute('aria-invalid'); }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
