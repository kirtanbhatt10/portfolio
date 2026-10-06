/* Shared UI: cursor, transitions, command palette, reveals, lab toys. No dependencies. */
(() => {
  const fine = matchMedia('(pointer:fine)').matches;
  const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const EMAIL = 'kirtan11bhatt@gmail.com';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const P = window.__ptr = { x: innerWidth * .7, y: innerHeight * .4, nx: .4, ny: .2, color: null, hot: -1, clicks: 0, scroll: 0, dance: 0 };

  /* ---------- accent theme ---------- */
  const ACCENTS = ['lime', 'cyan', 'amber', 'pink', 'violet'];
  function setAccent(a) {
    if (a === 'lime') root.removeAttribute('data-accent'); else root.setAttribute('data-accent', a);
    store.set('kb-accent', a);
    $$('.sw').forEach(s => s.setAttribute('aria-pressed', String(s.dataset.accent === a)));
    P.accent = getComputedStyle(root).getPropertyValue('--acc').trim();
  }
  setAccent(ACCENTS.includes(store.get('kb-accent')) ? store.get('kb-accent') : 'lime');

  /* ---------- toast ---------- */
  const toastEl = $('.toast'); let toastT;
  function toast(msg) { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 1800); }
  async function copyEmail() { try { await navigator.clipboard.writeText(EMAIL); toast('Email copied'); } catch { toast(EMAIL); } }

  /* ---------- page transitions ---------- */
  const curtainText = $('.curtain pre');
  function go(href) {
    if (calm) { location.href = href; return; }
    const name = href.split('/').pop().replace('.html', '') || 'home';
    if (curtainText) curtainText.innerHTML = `<b>$</b> cd /${name === 'index' ? 'home' : name}\n<b>$</b> decrypting…`;
    root.classList.add('leaving');
    setTimeout(() => { location.href = href; }, 480);
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!/^[\w-]+\.html$/.test(href)) return;
    e.preventDefault(); go(href);
  });
  function enter() {
    const first = document.body.dataset.scene === 'home' && !sessionFlag();
    const lines = ['booting sentry.sys', 'loading shaders', 'checking integrity … ok', 'welcome.'];
    if (first && !calm && curtainText) {
      let i = 0; curtainText.textContent = '';
      const t = setInterval(() => {
        curtainText.innerHTML += `<b>&gt;</b> ${lines[i++]}\n`;
        if (i >= lines.length) { clearInterval(t); setTimeout(() => root.classList.remove('entering'), 320); }
      }, 240);
    } else requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('entering')));
  }
  function sessionFlag() { try { const s = sessionStorage.getItem('kb-boot'); sessionStorage.setItem('kb-boot', '1'); return !!s; } catch { return true; } }
  enter();
  addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('leaving', 'entering'); });

  /* ---------- cursor ---------- */
  const dot = $('.c-dot'), ring = $('.c-ring'), spot = $('.spot');
  let rx = P.x, ry = P.y;
  addEventListener('pointermove', e => {
    P.x = e.clientX; P.y = e.clientY; P.nx = e.clientX / innerWidth * 2 - 1; P.ny = -(e.clientY / innerHeight * 2 - 1);
    if (spot) { spot.style.setProperty('--sx', P.x + 'px'); spot.style.setProperty('--sy', P.y + 'px'); }
    if (fine) { document.body.classList.add('cur-on'); dot.style.transform = `translate(${P.x}px,${P.y}px)`; }
  }, { passive: true });
  if (fine) {
    (function loop() { rx += (P.x - rx) * .16; ry += (P.y - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      ring.classList.toggle('is-hover', !!t); ring.textContent = t ? t.dataset.cursor : '';
    });
    addEventListener('pointerdown', () => ring.classList.add('is-down'));
    addEventListener('pointerup', () => ring.classList.remove('is-down'));
    root.addEventListener('pointerleave', () => document.body.classList.remove('cur-on'));
  }
  addEventListener('pointerdown', e => {
    if (e.target.closest('input,.pal')) return;
    P.clicks++;
    if (calm) return;
    const s = document.createElement('i'); s.className = 'spark'; s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
    document.body.appendChild(s); setTimeout(() => s.remove(), 650);
  });

  /* ---------- magnetic buttons, glow tiles, hot rows ---------- */
  if (fine && !calm) $$('.mag').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .28}px,${(e.clientY - r.top - r.height / 2) * .4}px)`;
    });
    b.addEventListener('pointerleave', () => { b.style.transition = 'transform .5s cubic-bezier(.2,1.6,.4,1)'; b.style.transform = ''; setTimeout(() => b.style.transition = '', 500); });
  });
  $$('.tile').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) / r.width * 100 + '%'); c.style.setProperty('--my', (e.clientY - r.top) / r.height * 100 + '%');
  }));
  $$('[data-color]').forEach(c => {
    c.addEventListener('pointerenter', () => { P.color = c.dataset.color; P.hot = +(c.dataset.i ?? -1); });
    c.addEventListener('pointerleave', () => { P.color = null; P.hot = -1; });
  });

  /* ---------- scroll: progress, reveals, count-up, flow diagram ---------- */
  const bar = $('.bar');
  const onScroll = () => { const m = root.scrollHeight - innerHeight; P.scroll = m > 0 ? scrollY / m : 0; if (bar) bar.style.transform = `scaleX(${P.scroll})`; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add('in'); io.unobserve(el);
    $$('[data-count]', el).forEach(countUp);
    if (el.classList.contains('flow')) runFlow(el);
  }), { threshold: .15 });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, pre = el.dataset.pre || '', suf = el.dataset.suf || '';
    if (calm) { el.textContent = pre + to.toFixed(dec) + suf; return; }
    const t0 = performance.now();
    (function tick(t) { const k = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + (to * e).toFixed(dec) + suf; if (k < 1) requestAnimationFrame(tick); })(t0);
  }
  function runFlow(el) {
    const nodes = $$('.node', el); if (calm) { nodes.forEach(n => n.classList.add('on')); return; }
    let i = 0; const step = () => { nodes.forEach((n, k) => n.classList.toggle('on', k <= i)); i = (i + 1) % (nodes.length + 2); if (i === 0) nodes.forEach(n => n.classList.remove('on')); };
    step(); setInterval(step, 800);
  }

  /* ---------- text effects ---------- */
  const glyphs = '01#$%&/<>[]{}=+*ABCDEF';
  $$('[data-scramble]').forEach((el, k) => {
    const txt = el.textContent; if (calm) return; let f = 0; const total = 22 + k * 8;
    const t = setInterval(() => {
      f++; el.textContent = [...txt].map((ch, i) => i < (f / total) * txt.length ? ch : glyphs[Math.random() * glyphs.length | 0]).join('');
      if (f >= total) { el.textContent = txt; clearInterval(t); }
    }, 38);
  });
  const typed = $('#typed');
  if (typed) { const line = typed.dataset.text || ''; if (calm) typed.textContent = line; else { let i = 0; const t = setInterval(() => { typed.textContent = line.slice(0, ++i); if (i >= line.length) clearInterval(t); }, 30); } }
  $$('[data-copy]').forEach(b => b.addEventListener('click', copyEmail));
  $$('.sw').forEach(s => s.addEventListener('click', () => { setAccent(s.dataset.accent); toast('Accent: ' + s.dataset.accent); }));

  /* ---------- command palette ---------- */
  const PAGES = [
    ['Home', 'index.html', 'page'], ['Work', 'work.html', 'page'], ['About', 'about.html', 'page'], ['Lab', 'lab.html', 'page'], ['Contact', 'contact.html', 'page'],
    ['Sentinel AI', 'sentinel.html', 'project'], ['Zenny AI Therapist', 'zenny.html', 'project'], ['Sugam', 'sugam.html', 'project'], ['Solaris', 'solaris.html', 'project'], ['AI Code Security Platform', 'codesec.html', 'project'],
  ];
  const ACTIONS = [
    ...PAGES.map(([n, h, k]) => ({ n, k, run: () => go(h) })),
    { n: 'Copy email address', k: 'action', run: copyEmail },
    { n: 'Change accent colour', k: 'action', run: () => { const cur = store.get('kb-accent') || 'lime'; const nx = ACCENTS[(ACCENTS.indexOf(cur) + 1) % ACCENTS.length]; setAccent(nx); toast('Accent: ' + nx); } },
    { n: 'Make Sentry dance', k: 'action', run: () => { P.dance = 4; toast('Sentry is dancing'); } },
    { n: 'Open GitHub', k: 'link', run: () => open('https://github.com/kirtanbhatt10', '_blank', 'noopener') },
    { n: 'Open LinkedIn', k: 'link', run: () => open('https://www.linkedin.com/in/kirtan-bhatt-974422322', '_blank', 'noopener') },
  ];
  const pal = $('.pal'), palIn = $('.pal input'), palList = $('.pal ul');
  let sel = 0, shown = ACTIONS;
  function renderPal() {
    const q = palIn.value.trim().toLowerCase();
    shown = ACTIONS.filter(a => !q || (a.n + ' ' + a.k).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    palList.innerHTML = shown.map((a, i) => `<li role="option" data-i="${i}" class="${i === sel ? 'sel' : ''}"><span>${a.n}</span><small>${a.k}</small></li>`).join('') || '<li><span>No matches</span></li>';
    const s = $('.sel', palList); if (s) s.scrollIntoView({ block: 'nearest' });
  }
  function openPal() { pal.classList.add('open'); palIn.value = ''; sel = 0; renderPal(); palIn.focus(); }
  function closePal() { pal.classList.remove('open'); }
  if (pal) {
    $$('[data-palette]').forEach(b => b.addEventListener('click', openPal));
    palIn.addEventListener('input', () => { sel = 0; renderPal(); });
    pal.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) { closePal(); shown[+li.dataset.i].run(); } else if (e.target === pal) closePal(); });
    addEventListener('keydown', e => {
      const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) { e.preventDefault(); pal.classList.contains('open') ? closePal() : openPal(); return; }
      if (!pal.classList.contains('open')) return;
      if (e.key === 'Escape') closePal();
      else if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % shown.length; renderPal(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; renderPal(); }
      else if (e.key === 'Enter' && shown[sel]) { closePal(); shown[sel].run(); }
    });
  }

  /* ---------- lab: terminal ---------- */
  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const out = $('.term-out'), tin = $('.term-in input');
  if (out && tin) {
    const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const print = (html, cls = '') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; };
    const projects = PAGES.filter(p => p[2] === 'project');
    const CMDS = {
      help: () => print('whoami · projects · open &lt;name&gt; · skills · wins · contact · sha256 &lt;text&gt; · accent &lt;' + ACCENTS.join('|') + '&gt; · dance · clear', 'dim'),
      whoami: () => print('Kirtan Bhatt. B.Tech Computer Engineering (Cyber Security), IAR Gandhinagar, 5th semester.\nI build backends and AI products, and I look at them the way an attacker would.'),
      projects: () => print(projects.map(p => '  ' + p[1].replace('.html', '').padEnd(10) + p[0]).join('\n') + '\n<span class="dim">try: open sentinel</span>'),
      open: a => { const p = projects.find(p => p[1].startsWith(a.toLowerCase())) || PAGES.find(p => p[0].toLowerCase() === a.toLowerCase()); if (p) { print('opening ' + p[0] + ' …', 'ok'); setTimeout(() => go(p[1]), 350); } else print('not found: ' + esc(a) + '. Run "projects" for the list.'); },
      skills: () => print('security   web security, API security, networking, secure coding, security reviews\nlanguages  Python, JavaScript/TypeScript, Java, C/C++\nbuild      React, Node.js, REST APIs, AI/LLM integration\ncloud      AWS, DynamoDB · Git/GitHub · Linux'),
      wins: () => print('National Finalist   Smart India Hackathon 2025\n2nd place           CyberPeace × IAR Hackathon 2025\n7th of 300 teams    LJ University Hackathon'),
      contact: () => print(EMAIL + '\ngithub.com/kirtanbhatt10'),
      sha256: async a => print(a ? await sha256(a) : 'usage: sha256 &lt;text&gt;', a ? 'ok' : ''),
      accent: a => { if (ACCENTS.includes(a)) { setAccent(a); print('accent set to ' + a, 'ok'); } else print('usage: accent &lt;' + ACCENTS.join('|') + '&gt;'); },
      dance: () => { P.dance = 4; print('Sentry is dancing. Look right.', 'ok'); },
      sudo: () => print('Nice try. This incident will be reported.'),
      ls: () => CMDS.projects(),
      clear: () => { out.innerHTML = ''; },
    };
    print('sentry-shell 1.0. Type <span class="ok">help</span> to see commands.', 'dim');
    const hist = []; let hi = 0;
    tin.addEventListener('keydown', async e => {
      if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.max(0, hi - 1); tin.value = hist[hi]; return; }
      if (e.key !== 'Enter') return;
      const raw = tin.value.trim(); tin.value = ''; if (!raw) return;
      hist.push(raw); hi = hist.length;
      print(esc(raw), 'cmd');
      const [c, ...rest] = raw.split(/\s+/), fn = CMDS[c.toLowerCase()];
      if (fn) await fn(rest.join(' ')); else print('command not found: ' + esc(c) + '. Try "help".');
    });
    $('.term').addEventListener('click', () => tin.focus());
  }

  /* ---------- lab: live hash + entropy ---------- */
  const hin = $('#hash-in'), hout = $('#hash-out');
  if (hin && hout) {
    let prev = '';
    const upd = async () => {
      const h = await sha256(hin.value);
      hout.innerHTML = [...h].map((c, i) => `<span class="${prev && prev[i] !== c ? 'ch' : ''}">${c}</span>`).join('');
      const changed = prev ? [...h].filter((c, i) => c !== prev[i]).length : 0;
      $('#hash-note').textContent = prev ? `${changed} of 64 hex characters changed` : 'Change one letter and watch the whole hash flip';
      prev = h; setTimeout(() => $$('.ch', hout).forEach(s => s.classList.remove('ch')), 500);
    };
    hin.addEventListener('input', upd); upd();
  }
  const pin = $('#pw-in');
  if (pin) pin.addEventListener('input', () => {
    const v = pin.value; let pool = 0;
    if (/[a-z]/.test(v)) pool += 26; if (/[A-Z]/.test(v)) pool += 26; if (/\d/.test(v)) pool += 10; if (/[^a-zA-Z0-9]/.test(v)) pool += 33;
    const bits = v.length && pool ? Math.round(v.length * Math.log2(pool)) : 0;
    const label = bits === 0 ? 'Nothing typed' : bits < 40 ? 'Weak' : bits < 60 ? 'Fair' : bits < 80 ? 'Strong' : 'Very strong';
    const m = $('#pw-meter'); m.style.width = Math.min(100, bits / 100 * 100) + '%'; m.style.background = bits < 40 ? '#ff5c8a' : bits < 60 ? '#ffb03c' : 'var(--acc)';
    $('#pw-bits').textContent = bits + ' bits'; $('#pw-label').textContent = label;
  });
})();
