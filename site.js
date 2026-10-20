// Baut Übersicht (data-page="home"), Projektseiten ("project") und Profil ("about").
// Texte aus content.js, Demos über demo-player.js + demo-scripts.js.
// data-root = Weg zum Hauptordner (für Bilder, Demos und Links zwischen den Seiten)

(() => {
  const C = window.CONTENT;
  const body = document.body;
  const root = body.dataset.root || '';
  const html = document.documentElement;
  const get = (o, path) => path.split('.').reduce((a, k) => a && a[k], o);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = (k, v) => { try { v === undefined ? (v = localStorage.getItem(k)) : localStorage.setItem(k, v); } catch (e) {} return v; };

  const ICON = {
    pause: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>',
    sun: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  };

  let lang = store('lang') || 'de';
  if (!C[lang]) lang = 'de';

  const icon = p => `<svg class="ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p.icon}</svg>`;
  const pills = list => `<div class="pills">${list.map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div>`;
  const status = p => `<span class="status ${p.status}">${C[lang].status[p.status]}</span>`;

  // ---------- Kopfzeile: Texte, Hell/Dunkel, Projekte-Menü ----------
  function texts() {
    const t = C[lang];
    html.lang = lang;
    document.querySelectorAll('[data-k]').forEach(el => { el.textContent = get(t, el.dataset.k); });
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    document.querySelectorAll('[data-linkedin]').forEach(a => { a.href = C.linkedin; });
    themeButton();
    menuItems();
  }

  function themeButton() {
    const b = document.getElementById('theme-btn');
    if (!b) return;
    const dark = html.dataset.theme !== 'light';
    b.innerHTML = dark ? ICON.sun : ICON.moon;
    b.setAttribute('aria-label', C[lang].nav.theme);
    b.title = C[lang].nav.theme;
  }
  document.getElementById('theme-btn')?.addEventListener('click', () => {
    html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
    store('theme', html.dataset.theme);
    themeButton();
  });

  function menuItems() {
    const panel = document.getElementById('menu-panel');
    if (!panel) return;
    const current = body.dataset.project;
    panel.innerHTML = C.projects.map(p => `
      <a class="menu-item${p.id === current ? ' is-current' : ''}" href="${root}${p.id}/">
        ${icon(p)}<span class="mi-t">${p.title}</span><span class="mi-s">${p[lang].tagline}</span>
      </a>`).join('');
  }
  (() => {
    const btn = document.querySelector('.menu-btn'), panel = document.getElementById('menu-panel');
    if (!btn) return;
    const set = open => { panel.hidden = !open; btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', e => { e.stopPropagation(); set(panel.hidden); });
    document.addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  })();

  // ---------- Übersicht mit lebendigen Vorschauen ----------
  function preview(p) {
    const pv = p.preview;
    const stack = (list, start) => list.map((src, i) =>
      `<img src="${root}${src}" alt="" loading="lazy" class="${i === start % list.length ? 'on' : ''}">`).join('');
    if (pv.pan) return `<div class="shot desk"><div class="screen pan"><img src="${root}${pv.pan}" alt="" loading="lazy"></div></div>`;
    if (pv.device === 'phone')
      return `<div class="shot"><div class="phone fader">${stack(pv.stills, 0)}</div><div class="phone fader">${stack(pv.stills, 1)}</div></div>`;
    return `<div class="shot desk"><div class="screen fader">${stack(pv.stills, 0)}</div></div>`;
  }

  function renderHome() {
    const t = C[lang];
    document.getElementById('projekte').innerHTML = C.projects.map(p => `
      <article class="card" style="--tint:${p.tint};--accent:${p.accent}">
        ${preview(p)}
        <div class="body">
          <div class="top"><h2><a href="${p.id}/">${icon(p)}<span>${p.title}</span></a></h2>${status(p)}</div>
          <p class="tagline">${p[lang].tagline}</p>
          ${pills(p.stack)}
          <div class="actions">
            ${p.url ? `<a class="ext" href="${p.url}" target="_blank" rel="noopener">${t.labels.visit} ↗</a>` : ''}
            <a class="btn secondary small open" href="${p.id}/">${t.labels.open}</a>
          </div>
        </div>
      </article>`).join('');
    startFaders();
  }

  // Vorschau bewegt sich nur, solange die Maus über der Karte ist.
  // Zwei Handys wechseln abwechselnd und zeigen nie dasselbe Bild.
  function startFaders() {
    if (calm) return;
    document.querySelectorAll('.card').forEach(card => {
      const faders = [...card.querySelectorAll('.fader')];
      let timer = null, turn = 0;
      const shown = f => [...f.children].findIndex(x => x.classList.contains('on'));
      const advance = () => {
        if (!faders.length) return;
        const f = faders[turn % faders.length], imgs = [...f.children];
        const others = faders.filter(o => o !== f).map(shown);
        let next = shown(f);
        do { next = (next + 1) % imgs.length; } while (others.includes(next) && imgs.length > faders.length);
        imgs.forEach((im, k) => im.classList.toggle('on', k === next));
        turn++;
      };
      card.addEventListener('mouseenter', () => {
        card.classList.add('is-playing');
        clearInterval(timer);
        setTimeout(() => card.classList.contains('is-playing') && advance(), 500);
        timer = setInterval(advance, faders.length > 1 ? 1700 : 2400);
      });
      card.addEventListener('mouseleave', () => { card.classList.remove('is-playing'); clearInterval(timer); });
    });
  }

  // ---------- Projektseite ----------
  let player = null;

  function renderProject() {
    const t = C[lang];
    const p = C.projects.find(x => x.id === body.dataset.project), x = p[lang];
    document.title = `${p.title} · Thomas Wordenbeck`;
    body.style.setProperty('--accent', p.accent);

    document.getElementById('p-head').innerHTML = `
      <h1>${icon(p)}<span>${p.title}</span></h1>
      <p class="tagline">${x.tagline}</p>
      <div class="meta">${status(p)}${pills(p.stack)}</div>
      ${p.url ? `<a class="visit" href="${p.url}" target="_blank" rel="noopener">${t.labels.visit} ↗</a>` : ''}`;
    renderTabs(p);

    document.getElementById('switcher').innerHTML = C.projects.filter(o => o.id !== p.id).map(o => `
      <a href="${root}${o.id}/" style="--accent:${o.accent}">${icon(o)}<span>${o.title}</span></a>`).join('');

    const box = document.getElementById('chapters');
    if (box.children.length) {
      [...box.children].forEach((b, k) => { b.querySelector('.l').textContent = x.chapters[k]; });
      if (player) caption(player.current);
    } else {
      box.innerHTML = x.chapters.map((c, k) => `<button type="button"><span class="n">${k + 1}</span><span class="l">${esc(c)}</span><span class="bar"></span></button>`).join('');
      [...box.children].forEach((b, k) => b.addEventListener('click', () => { setPaused(false); player.start(k); }));
      setupStage(p);
      // Passen die Kapitel nicht in eine Zeile, zeigen nur noch das aktive Kapitel seinen Namen
      const bar = box.parentElement;
      const fitChapters = () => {
        box.classList.remove('compact');
        if (box.scrollWidth + 46 > bar.clientWidth) box.classList.add('compact');
      };
      new ResizeObserver(fitChapters).observe(bar);
    }
    [...box.children].forEach((b, k) => { b.title = x.chapters[k]; });
    playButton();
  }

  // Umschaltleiste rechts: Worum es geht · Highlights · Technik
  let tab = 0;
  try { tab = +sessionStorage.getItem('tab') || 0; } catch (e) {}
  function renderTabs(p) {
    const x = p[lang], labels = C[lang].labels.tabs;
    const bar = document.getElementById('p-tabs'), panel = document.getElementById('p-panel');
    const list = (items, cls) => `<div class="${cls}">${items.map(([t, d]) => `<div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>`;
    const content = k => [`<p class="p-text">${x.text}</p>`, list(x.highlights, 'p-highlights'), list(x.tech, 'p-tech')][k];

    // Blaue Markierung gleitet unter den aktiven Knopf
    const moveThumb = animate => {
      const b = bar.querySelectorAll('button')[tab], th = bar.querySelector('.seg-thumb');
      if (!b || !th) return;
      th.style.transition = animate ? '' : 'none';
      th.style.width = b.offsetWidth + 'px';
      th.style.transform = `translateX(${b.offsetLeft - 3}px)`;
      [...bar.querySelectorAll('button')].forEach((x, k) => x.setAttribute('aria-selected', k === tab));
    };

    bar.innerHTML = '<span class="seg-thumb" aria-hidden="true"></span>' +
      labels.map((l, i) => `<button type="button" role="tab" aria-selected="${i === tab}">${l}</button>`).join('');
    bar.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => {
      if (i === tab) return;
      tab = i;
      try { sessionStorage.setItem('tab', i); } catch (e) {}
      moveThumb(true);
      // Inhalt weich aus- und wieder einblenden
      panel.classList.remove('in');
      clearTimeout(panel._t);
      panel._t = setTimeout(() => { panel.innerHTML = content(tab); void panel.offsetWidth; panel.classList.add('in'); }, calm ? 0 : 180);
    }));
    requestAnimationFrame(() => moveThumb(false));
    if (!bar._ro) { bar._ro = new ResizeObserver(() => moveThumb(false)); bar._ro.observe(bar); }

    panel.innerHTML = content(tab);
    panel.classList.add('in');
  }

  function caption(k) {
    const el = document.getElementById('caption');
    const p = C.projects.find(x => x.id === body.dataset.project);
    const text = p[lang].captions?.[k] || '';
    if (el.textContent === text) return;
    el.classList.remove('in');
    setTimeout(() => { el.textContent = text; el.classList.add('in'); }, 180);
  }

  function playButton() {
    const btn = document.getElementById('playpause');
    if (!btn || !player) return;
    btn.innerHTML = player.paused ? ICON.play : ICON.pause;
    btn.setAttribute('aria-label', player.paused ? C[lang].labels.play : C[lang].labels.pause);
    btn.title = btn.getAttribute('aria-label');
  }

  function setPaused(v) {
    player.paused = v;
    document.getElementById('stage').classList.toggle('is-paused', v || !player.visible);
    playButton();
  }

  function setupStage(p) {
    const stage = document.getElementById('stage');
    stage.style.setProperty('--tint', p.tint);
    if (isDark(p.tint)) stage.classList.add('dark');
    document.querySelector('.p-layout').classList.add('is-' + p.demo.device);

    const dev = document.getElementById('device');
    const { width, height, device, src, url } = p.demo;
    dev.className = 'device ' + device;
    dev.innerHTML = `${device === 'desktop' ? `<div class="bar">${url ? esc(url) : esc(p.title)}</div>` : ''}
      <div class="viewport"><div class="scaled" style="width:${width}px;height:${height}px">
        <iframe title="${esc(p.title)} Demo" tabindex="-1" width="${width}" height="${height}" data-src="${root}${src}"></iframe>
        <div class="taps"></div>
      </div></div>`;

    // Gerät so groß wie möglich in den freien Platz einpassen (Handy höchstens 76 % der echten Größe)
    const scaled = dev.querySelector('.scaled'), slot = dev.parentElement;
    const fit = () => {
      const w = slot.clientWidth, h = slot.clientHeight;
      if (!w || !h) return;
      let s;
      if (device === 'phone') {
        s = Math.min((h - 18) / height, (w - 18) / width, 0.76);
        dev.style.width = (width * s + 18) + 'px';
        dev.style.height = (height * s + 18) + 'px';
      } else {
        s = Math.min(w / width, (h - 28) / height);
        dev.style.width = (width * s) + 'px';
        dev.style.height = (height * s + 28) + 'px';
      }
      scaled.style.transform = `scale(${s})`;
    };
    fit();
    new ResizeObserver(fit).observe(slot);

    const buttons = [...document.getElementById('chapters').children];
    player = new DemoPlayer({
      frame: dev.querySelector('iframe'),
      taps: dev.querySelector('.taps'),
      script: window.DEMO_SCRIPTS[p.id],
      onChapter: (k, dur) => {
        player.current = k;
        caption(k);
        buttons.forEach((b, j) => {
          b.classList.remove('on');
          if (j === k) { b.style.setProperty('--dur', dur + 'ms'); void b.offsetWidth; b.classList.add('on'); }
        });
      },
    });

    document.getElementById('playpause').addEventListener('click', () => setPaused(!player.paused));
    new IntersectionObserver(es => {
      player.visible = es[0].isIntersecting;
      stage.classList.toggle('is-paused', player.paused || !player.visible);
    }, { threshold: 0.2 }).observe(stage);
    document.addEventListener('visibilitychange', () => { player.visible = !document.hidden; });
    player.start(0);
  }

  function isDark(hex) {
    const n = parseInt(hex.slice(1), 16);
    return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 110;
  }

  // ---------- Über mich ----------
  function renderAbout() {
    const a = C.about[lang], t = C[lang];
    document.title = `${t.nav.about} · Thomas Wordenbeck`;
    document.getElementById('about').innerHTML = `
      <section class="a-hero fade">
        <p class="eyebrow">${t.name}</p>
        <h1>${a.title.replace(/\n/g, '<br>')}</h1>
        <p class="lead">${a.lead}</p>
        <a class="cta" href="${C.linkedin}" target="_blank" rel="noopener">${a.cta} ↗</a>
      </section>

      <section class="a-numbers fade" aria-label="${a.numbersTitle}">
        ${a.numbers.map(n => `<div class="num"><strong data-count="${n.value}">${calm ? n.value.toLocaleString(lang) : 0}</strong><span>${n.label}</span></div>`).join('')}
      </section>

      <section class="a-block fade">
        <h2>${a.stationsTitle}</h2>
        <ol class="stations">
          ${a.stations.map(s => `<li><div class="when">${s.when}</div><div><h3>${s.what}</h3><div class="where">${s.where}</div><p>${s.text}</p></div></li>`).join('')}
        </ol>
      </section>

      <section class="a-block fade">
        <h2>${a.strengthsTitle}</h2>
        <div class="strengths">
          ${a.strengths.map(s => `<div class="strength"><h3>${s.title}</h3><p>${s.text}</p></div>`).join('')}
        </div>
      </section>

      <section class="a-block a-facts fade">
        <div><h2>${a.educationTitle}</h2><ul>${a.education.map(e => `<li>${e}</li>`).join('')}</ul></div>
        <div><h2>${a.certsTitle}</h2>${pills(a.certs)}</div>
        <div><h2>${a.toolsTitle}</h2>${pills(a.tools)}</div>
      </section>

      <section class="a-end fade">
        <a class="cta" href="${C.linkedin}" target="_blank" rel="noopener">${a.cta} ↗</a>
        <a class="more" href="${root}#projekte">${t.nav.all} →</a>
      </section>`;

    fadeIn('#about');  // sanft einblenden + Zahlen hochzählen, sobald sichtbar
  }

  // ---------- Warum diese Seite ----------
  function renderStory() {
    const st = C.story[lang];
    document.title = `${st.eyebrow} · Thomas Wordenbeck`;
    const paras = list => (list || []).map(t => `<p>${t}</p>`).join('');
    document.getElementById('story').innerHTML = `
      <section class="s-hero fade">
        <p class="eyebrow">${st.eyebrow}</p>
        <h1>${st.hero}</h1>
      </section>
      ${st.sections.map((sec, i) => `
        <section class="s-chapter fade">
          <div class="s-no">0${i + 1}</div>
          <div class="s-body">
            <h2>${sec.title}</h2>
            ${paras(sec.text)}
            ${sec.quote ? `<blockquote>„${sec.quote}“</blockquote>` : ''}
            ${paras(sec.after)}
          </div>
        </section>`).join('')}
      <section class="s-closing fade">
        <p>${st.closing}</p>
        <div class="s-links">
          <a class="cta" href="${root}#projekte">${st.toProjects}</a>
          <a class="more" href="${root}ueber-mich/">${st.toAbout} →</a>
        </div>
      </section>`;
    fadeIn('#story');
  }

  function fadeIn(scope) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      io.unobserve(e.target);
    }), { threshold: 0.15 });
    document.querySelectorAll(scope + ' .fade').forEach(el => calm ? el.classList.add('in') : io.observe(el));
  }

  function countUp(el) {
    const to = +el.dataset.count, start = performance.now(), ms = 1600;
    const step = now => {
      const k = Math.min(1, (now - start) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e).toLocaleString(lang);
      if (k < 1) requestAnimationFrame(step);
    };
    if (calm) { el.textContent = to.toLocaleString(lang); return; }
    requestAnimationFrame(step);
  }

  // ---------- Zurück: im Verlauf zurück, wenn man von dieser Seite kam, sonst zur Übersicht ----------
  document.getElementById('back-btn')?.addEventListener('click', e => {
    try {
      if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); }
    } catch (err) {}
  });

  // ---------- Start ----------
  function render() {
    texts();
    if (body.dataset.page === 'home') renderHome();
    else if (body.dataset.page === 'project') renderProject();
    else if (body.dataset.page === 'about') renderAbout();
    else if (body.dataset.page === 'story') renderStory();
  }
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => {
    lang = b.dataset.lang;
    store('lang', lang);
    render();
  }));
  render();
})();
