// Bausteine im Glas-Stil: Kopf, Fuß, Projektseite, „Warum diese Seite“ und „Über mich“.
// GLAS_PAGES (von make-pages.py gesetzt) = Wege zur Startseite, zu Warum und zu Über mich.
(() => {
  const { C, t, esc, lang, projects, current, url, icon, status, extra, fill, reveal, countUp, stage, ICON, ROOT, calm, store } = V2;
  const app = document.getElementById('app');
  const page = document.body.dataset.page;
  const PAGES = Object.assign({ why: ROOT + 'warum/', about: ROOT + 'ueber-mich/', home: ROOT || './' }, window.GLAS_PAGES || {});

  // Kopf wie in V1: Projekte-Menü, Warum, Über mich, Hell/Dunkel, Sprache
  const header = () => `
    <header class="top"><div class="top-in">
      <a class="who" href="${PAGES.home}"><img src="${ROOT}favicon.svg" alt="" width="24" height="24"><span data-k="name"></span></a>
      <nav>
        <div class="menu">
          <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu-panel"><span data-k="nav.work"></span>${ICON.chevron}</button>
          <div class="menu-panel" id="menu-panel" hidden>${projects.map(p => `
            <a class="menu-item${p.id === document.body.dataset.project ? ' is-current' : ''}" href="${url(p)}" style="--accent:${p.accent}">
              ${icon(p, 18)}<span class="mi-t">${esc(p.title)}</span><span class="mi-s">${esc(p.tagline)}</span></a>`).join('')}
          </div>
        </div>
        <a href="${PAGES.why}" data-k="nav.why"${page === 'story' ? ' aria-current="page"' : ''}></a>
        <a href="${PAGES.about}" data-k="nav.about"${page === 'about' ? ' aria-current="page"' : ''}></a>
        <button class="theme-btn" id="theme-btn" type="button"></button>
        <div class="lang"><button type="button" data-lang="de">DE</button><button type="button" data-lang="en">EN</button></div>
      </nav>
    </div></header>`;

  // Hell/Dunkel: Wahl merken, Symbol zeigt jeweils den anderen Modus
  function themeButton() {
    const b = document.getElementById('theme-btn'); if (!b) return;
    const html = document.documentElement;
    const paint = () => {
      const dark = html.dataset.theme !== 'light';
      b.innerHTML = dark ? ICON.sun : ICON.moon;
      b.setAttribute('aria-label', t('nav.theme')); b.title = t('nav.theme');
    };
    b.addEventListener('click', () => { html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light'; store('theme', html.dataset.theme); paint(); });
    paint();
  }

  // Projekte-Menü auf- und zuklappen
  function menu() {
    const btn = document.querySelector('.menu-btn'), panel = document.getElementById('menu-panel');
    if (!btn) return;
    const set = open => { panel.hidden = !open; btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', e => { e.stopPropagation(); set(panel.hidden); });
    document.addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  // Fußleiste: Thomas Wordenbeck × Claude Code = Herz (Name führt zur Profilkarte), dann LinkedIn und Rechtliches.
  // Alles grau, Links werden beim Überfahren weiß; über der Zeile füllt sich das Herz rot und schlägt einmal.
  const FOOT_ICON = {
    pen: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3H8"/><path d="m15.007 5.008 3.987 3.986"/><path d="M20 15v4"/><path d="M21.174 6.813a2.82 2.82 0 0 0-3.986-3.987L3.842 16.175a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="M22 17h-4"/><path d="M4 5v4"/><path d="M6 7H2"/><path d="M9 2v2"/></svg>',
    chip: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>',
    heart: '<svg class="heart" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  };
  const footer = () => {
    const en = lang === 'en';
    return `
    <footer class="foot">
      <span class="duo"><a class="duo-me" href="${PAGES.about}">${FOOT_ICON.pen}<span>Thomas Wordenbeck</span></a><span class="duo-op" aria-hidden="true">×</span><span class="duo-cc">${FOOT_ICON.chip}<span>Claude Code</span></span><span class="duo-op" aria-hidden="true">=</span>${FOOT_ICON.heart}</span>
      <span class="foot-legal"><a data-linkedin target="_blank" rel="noopener">LinkedIn</a><a href="${ROOT}impressum/">${en ? 'Legal notice' : 'Impressum'}</a><a href="${ROOT}datenschutz/">${en ? 'Privacy' : 'Datenschutz'}</a></span>
    </footer>`;
  };

  // Zurück: im Verlauf zurück, wenn man von dieser Seite kam, sonst zur Übersicht
  function backButton(el) {
    el.addEventListener('click', e => {
      try {
        if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); }
      } catch (err) {}
    });
  }

  function mount(html, ambient = '') {
    app.innerHTML = `<div class="ambient ${ambient}" aria-hidden="true"></div>${header()}${html}${footer()}`;
    fill();
    themeButton();
    menu();
    // Einblenden starten – per Timer, damit es auch in Hintergrund-Tabs (ohne Bild-Rendering) passiert
    setTimeout(() => document.body.classList.add('loaded'), 30);
    const b = document.getElementById('back'); if (b) backButton(b);
  }

  // ---------- Projektseite ----------
  function project() {
    const p = current();
    const others = projects.filter(o => o.id !== p.id);
    const tabs = t('labels.tabs');
    document.title = `${p.title} – Thomas Wordenbeck`;
    document.body.style.setProperty('--accent', p.accent);
    // Status und Technik in einer Reihe, nur über Farbe getrennt: Status gefüllt (Live grün, Pausiert grau), Technik ruhig mit Rahmen
    const visit = p.url ? `<a class="btn primary small visit" href="${p.url}" target="_blank" rel="noopener"><span data-k="labels.visit"></span>${ICON.out}</a>` : '';
    const head = `
      <div class="p-head"><span class="ci big">${icon(p, 24)}</span><div><h1>${esc(p.title)}</h1><p class="p-tag">${esc(p.tagline)}</p></div></div>
      <div class="meta-row"><span class="sb s-${p.status}">${status(p)}</span>${p.stack.map(s => `<span class="tp">${esc(s)}</span>`).join('')}</div>
      ${visit}`;
    const body = `
      <div class="seg" role="tablist"><span class="thumb" id="thumb"></span>${tabs.map((x, k) => `<button role="tab" data-tab="${k}" aria-selected="${k === 0}">${esc(x)}</button>`).join('')}</div>
      <div class="panel" id="panel"></div>`;
    mount(`
      <main class="proj is-${p.demo.device}">
        <section class="p-stage">
          <div class="p-dev"><div class="slot" id="slot"></div></div>
          <div class="ctrl glass">
            <div class="chips" id="chapters">${p.chapters.map((c, k) => `<button data-i="${k}"><b>${k + 1}</b><span>${esc(c)}</span><i></i></button>`).join('')}</div>
            <button class="pp" id="pp" aria-label="Pause">${ICON.pause}</button>
          </div>
          <p class="caption" id="caption" aria-live="polite"></p>
        </section>
        <aside class="p-info">
          <a class="back glass" id="back" href="${PAGES.home}#projekte">${ICON.back}<span data-k="nav.backBtn"></span></a>
          <div class="p-open">${head}${body}</div>
          <div class="others">
            <h2 data-k="labels.more"></h2>
            <div class="o-grid">${others.map(o => `<a class="o" href="${url(o)}" style="--accent:${o.accent}"><span class="ci">${icon(o, 16)}</span><span>${esc(o.title)}</span></a>`).join('')}</div>
          </div>
        </aside>
      </main>`, 'tinted');

    // Blauer Umschalter mit gleitendem Daumen (wie V1)
    const panel = document.getElementById('panel'), thumb = document.getElementById('thumb');
    const tabBtns = [...document.querySelectorAll('[data-tab]')];
    const moveThumb = b => { thumb.style.width = b.offsetWidth + 'px'; thumb.style.transform = `translateX(${b.offsetLeft - 3}px)`; };
    const render = k => {
      if (k === 0) panel.innerHTML = `<p class="lede">${esc(p.text)}</p>`;
      if (k === 1) panel.innerHTML = `<div class="hl-tiles">${p.highlights.map(([h, s]) => `<div class="hl-tile"><h3>${esc(h)}</h3><p>${esc(s)}</p></div>`).join('')}</div>`;
      if (k === 2) panel.innerHTML = `<div class="tech-rows">${p.tech.map(([h, s]) => `<div><h3>${esc(h)}</h3><p>${esc(s)}</p></div>`).join('')}</div>`;
      panel.firstElementChild.classList.add('pop');
    };
    tabBtns.forEach(b => b.addEventListener('click', () => {
      tabBtns.forEach(x => x.setAttribute('aria-selected', x === b));
      moveThumb(b); render(+b.dataset.tab);
    }));
    render(0);
    requestAnimationFrame(() => moveThumb(tabBtns[0]));
    document.fonts && document.fonts.ready.then(() => moveThumb(tabBtns.find(b => b.getAttribute('aria-selected') === 'true')));
    new ResizeObserver(() => moveThumb(tabBtns.find(b => b.getAttribute('aria-selected') === 'true'))).observe(thumb.parentElement);

    const btns = [...document.querySelectorAll('#chapters button')];
    const cap = document.getElementById('caption');
    const pp = document.getElementById('pp');
    const s = stage({
      slot: document.getElementById('slot'), project: p, maxPhone: 0.72, iphone: true,
      onChapter: (k, dur) => {
        cap.classList.remove('pop'); void cap.offsetWidth;
        cap.textContent = p.captions[k]; cap.classList.add('pop');
        btns.forEach((b, j) => { b.classList.remove('on'); if (j === k) { b.style.setProperty('--dur', dur + 'ms'); void b.offsetWidth; b.classList.add('on'); } });
      },
      onPause: v => { pp.innerHTML = v ? ICON.play : ICON.pause; document.querySelector('.p-stage').classList.toggle('paused', v); },
    });
    btns.forEach((b, k) => b.addEventListener('click', () => s.go(k)));
    pp.addEventListener('click', () => s.toggle());
  }

  // ---------- Warum diese Seite ----------
  function story() {
    const st = C.story[lang];
    document.title = `${st.eyebrow} – Thomas Wordenbeck`;
    const paras = list => (list || []).map(x => `<p>${esc(x)}</p>`).join('');
    mount(`
      <main class="page story">
        <a class="back glass" id="back" href="${PAGES.home}">${ICON.back}<span data-k="nav.backBtn"></span></a>
        <header class="pg-hero fade">
          <p class="pg-kicker">${esc(st.eyebrow)}</p>
          <h1>${esc(st.hero)}</h1>
        </header>
        <ol class="chapters-v">
          ${st.sections.map((sec, i) => `
          <li class="ch-v fade">
            <span class="ch-n">${i + 1}</span>
            <div class="ch-card glass">
              <h2>${esc(sec.title)}</h2>
              ${paras(sec.text)}
              ${sec.quote ? `<blockquote>„${esc(sec.quote)}“</blockquote>` : ''}
              ${paras(sec.after)}
            </div>
          </li>`).join('')}
        </ol>
        <section class="pg-end glass fade">
          <p>${esc(st.closing)}</p>
          <div class="actions">
            <a class="btn primary" href="${PAGES.home}#projekte">${esc(st.toProjects)}</a>
            <a class="btn glass" href="${PAGES.about}">${esc(st.toAbout)}</a>
          </div>
        </section>
      </main>`);
    reveal('.fade');
  }

  // ---------- Über mich ----------
  function about() {
    const a = C.about[lang], tt = C[lang];
    document.title = `${tt.nav.about} – Thomas Wordenbeck`;
    const pills = list => `<ul class="pills">${list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    mount(`
      <main class="page about">
        <a class="back glass" id="back" href="${PAGES.home}">${ICON.back}<span data-k="nav.backBtn"></span></a>
        <header class="pg-hero fade">
          <p class="pg-kicker">${esc(tt.name)}</p>
          <h1>${a.title.split('\n').map(esc).join('<br>')}</h1>
          <p class="pg-lead">${esc(a.lead)}</p>
          <a class="btn primary" data-linkedin target="_blank" rel="noopener">${esc(a.cta)} ${ICON.out}</a>
        </header>
        <section class="nums fade" aria-label="${esc(a.numbersTitle)}">
          ${a.numbers.map(n => `<div class="num glass"><strong data-count="${n.value}">${calm ? n.value.toLocaleString(lang) : 0}</strong><span>${esc(n.label)}</span></div>`).join('')}
        </section>
        <section class="blk fade">
          <h2>${esc(a.stationsTitle)}</h2>
          <ol class="stations">
            ${a.stations.map(s => `<li class="glass"><span class="when">${esc(s.when)}</span><div><h3>${esc(s.what)}</h3><p class="where">${esc(s.where)}</p><p>${esc(s.text)}</p></div></li>`).join('')}
          </ol>
        </section>
        <section class="blk fade">
          <h2>${esc(a.strengthsTitle)}</h2>
          <div class="strengths">${a.strengths.map(s => `<div class="glass"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join('')}</div>
        </section>
        <section class="blk facts fade">
          <div class="glass"><h2>${esc(a.educationTitle)}</h2><ul class="edu">${a.education.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>
          <div class="glass"><h2>${esc(a.certsTitle)}</h2>${pills(a.certs)}</div>
          <div class="glass"><h2>${esc(a.toolsTitle)}</h2>${pills(a.tools)}</div>
        </section>
        <section class="pg-end glass fade">
          <div class="actions">
            <a class="btn primary" data-linkedin target="_blank" rel="noopener">${esc(a.cta)} ${ICON.out}</a>
            <a class="btn glass" href="${PAGES.home}#projekte">${esc(tt.nav.all)}</a>
          </div>
        </section>
      </main>`);
    reveal('.fade', { onIn: el => el.querySelectorAll('[data-count]').forEach(countUp) });
  }

  window.GlasUI = { header, footer, mount, project, story, about, PAGES };
})();
