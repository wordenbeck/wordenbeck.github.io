// Gemeinsame Helfer aller Seiten: Texte, Sprache, Bilder, Geräte-Rahmen, Demo-Bühne.
// Nutzt content.js, demo-player.js und demo-scripts.js aus dem Hauptordner.
// data-root am <body> = Weg zum Hauptordner ("" auf der Startseite, "../" in Unterordnern).

(() => {
  const C = window.CONTENT;
  const ROOT = document.body.dataset.root ?? '';
  const store = (k, v) => { try { v === undefined ? (v = localStorage.getItem(k)) : localStorage.setItem(k, v); } catch (e) {} return v; };

  let lang = store('lang') || 'de';
  if (!C[lang]) lang = 'de';
  document.documentElement.lang = lang;

  const get = (o, path) => path.split('.').reduce((a, k) => a && a[k], o);
  const t = path => get(C[lang], path);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Projekt + Texte der aktuellen Sprache in einem Objekt
  const projects = C.projects.map((p, i) => ({ ...p, ...p[lang], index: i }));
  const byId = id => projects.find(p => p.id === id) || projects[0];
  const params = new URLSearchParams(location.search);
  const current = () => byId(document.body.dataset.project || params.get('p'));
  const url = p => `${ROOT}${p.id}/`;

  const icon = (p, size = 20, stroke = 1.8) =>
    `<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p.icon}</svg>`;

  // Vorschaubilder: Handy-Standbilder oder ein langer Website-Screenshot.
  // HERO = ersetzt das erste Standbild (Mahlzeit: Startseite mit Rezeptfoto, Foto: Sara Dubler / Unsplash)
  const HERO = { mahlzeit: 'img/v2/mahlzeit-rezept-foto.jpg' };
  const images = p => (p.preview.stills || [p.preview.pan]).map((s, k) => ROOT + (k === 0 && HERO[p.id] || s));
  // Mehrere Screens je Projekt (für Explosionsdarstellung und Karussell)
  const LAYERS = {
    vuca: ['img/vuca-home.jpg', 'img/vuca-archiv.jpg', 'img/vuca-folge.jpg', 'img/vuca-transkript.jpg'],
    zirkus: ['img/zirkus-home.jpg', 'img/zirkus-1.jpg', 'img/zirkus-spenden.jpg'],
  };
  const layers = p => LAYERS[p.id] ? LAYERS[p.id].map(s => ROOT + s) : images(p);
  const status = p => C[lang].status[p.status];
  const extra = {
    de: { madeWith: 'Gebaut mit', variants: 'Varianten', next: 'Nächstes Projekt', chapters: 'Kapitel', status: 'Status', stack: 'Technik', site: 'Website', open: 'Projekt öffnen', all: 'Alle Projekte', home: 'Start', prev: 'Zurück', fwd: 'Weiter' },
    en: { madeWith: 'Built with', variants: 'Variants', next: 'Next project', chapters: 'Chapters', status: 'Status', stack: 'Stack', site: 'Website', open: 'Open project', all: 'All projects', home: 'Home', prev: 'Previous', fwd: 'Next' },
  }[lang];

  function setLang(l) { store('lang', l); location.reload(); }

  // Schreibt Texte in alle Elemente mit data-k="pfad.im.content"
  function fill(scope = document) {
    scope.querySelectorAll('[data-k]').forEach(el => { el.textContent = t(el.dataset.k); });
    scope.querySelectorAll('[data-x]').forEach(el => { el.textContent = extra[el.dataset.x]; });
    scope.querySelectorAll('[data-linkedin]').forEach(el => { el.href = C.linkedin; });
    scope.querySelectorAll('[data-root]').forEach(el => { el.setAttribute('href', ROOT + el.dataset.root); });
    scope.querySelectorAll('[data-lang]').forEach(el => {
      el.setAttribute('aria-pressed', el.dataset.lang === lang);
      el.addEventListener('click', () => setLang(el.dataset.lang));
    });
  }

  // Einmaliges Einblenden beim Hineinscrollen
  function reveal(els, opts = {}) {
    const list = typeof els === 'string' ? document.querySelectorAll(els) : els;
    if (calm) { list.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); opts.onIn && opts.onIn(e.target); io.unobserve(e.target); }
    }), { threshold: opts.threshold ?? 0.2, rootMargin: opts.margin ?? '0px 0px -8% 0px' });
    list.forEach(el => io.observe(el));
  }

  // Zahl hochzählen (Über mich)
  function countUp(el) {
    const to = +el.dataset.count, start = performance.now(), ms = 1600;
    if (calm) { el.textContent = to.toLocaleString(lang); return; }
    const step = now => {
      const k = Math.min(1, (now - start) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e).toLocaleString(lang);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Wort-für-Wort-Spans (für Text-Animationen)
  const words = (s, cls = 'w') => esc(s).split(/(\s+)/).map(w => /^\s+$/.test(w) ? w : `<span class="${cls}">${w}</span>`).join('');
  const letters = (s, cls = 'l') => [...s].map((c, i) => c === ' ' ? '<span class="sp"> </span>' : `<span class="${cls}" style="--i:${i}">${esc(c)}</span>`).join('');

  // ---------- Geräte-Rahmen ----------
  // iPhone: Rahmen mit Titankante, Tasten, Dynamic Island und Statusleiste. Größe kommt von außen (Breite).
  const STATUS = `<span class="iph-time">9:41</span><span class="iph-icons">
    <svg viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8"/></svg>
    <svg viewBox="0 0 16 12" aria-hidden="true"><path d="M8 2.2a9.6 9.6 0 0 1 6.6 2.6l1.2-1.3A11.4 11.4 0 0 0 8 .4 11.4 11.4 0 0 0 .2 3.5l1.2 1.3A9.6 9.6 0 0 1 8 2.2Zm0 3.6a6 6 0 0 1 4.1 1.6l1.2-1.3A7.8 7.8 0 0 0 8 4a7.8 7.8 0 0 0-5.3 2.1l1.2 1.3A6 6 0 0 1 8 5.8Zm0 3.6c.7 0 1.3.3 1.7.7L8 12 6.3 10.1c.4-.4 1-.7 1.7-.7Z"/></svg>
    <svg viewBox="0 0 27 12" aria-hidden="true"><rect x=".5" y=".5" width="23" height="11" rx="3.5" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="8" rx="2"/><path d="M25 4v4a2 2 0 0 0 0-4Z" opacity=".5"/></svg>
  </span>`;
  const iphone = (body, cls = '', attrs = '') => `<div class="iph ${cls}" ${attrs}><div class="iph-frame"><div class="iph-scr">
      <div class="iph-bar">${STATUS}</div><div class="iph-body">${body}</div><span class="iph-island"></span>
    </div></div></div>`;
  // Browserfenster für Websites
  const browser = (body, label = '', cls = '') => `<div class="brw ${cls}"><div class="brw-bar"><i></i><i></i><i></i>${label ? `<span>${esc(label)}</span>` : ''}</div><div class="brw-body">${body}</div></div>`;
  // Passendes Gerät mit Standbildern (das erste trägt "on")
  const deviceStills = (p, { cls = '', first = 0 } = {}) => {
    const list = images(p);
    const imgs = list.map((s, k) => `<img src="${s}" alt="" loading="lazy" class="${k === first % list.length ? 'on' : ''}">`).join('');
    if (p.preview.device === 'phone') return iphone(imgs, cls);
    return browser(imgs, (p.url || '').replace(/^https?:\/\//, '') || p.title, cls + (p.preview.pan ? ' pan' : ''));
  };

  // Statusleiste in der Farbe der App-Kopfzeile (aus dem obersten Bildstreifen gelesen)
  function tintBar(iph, color) {
    const m = String(color).match(/\d+(\.\d+)?/g);
    if (!m) return;
    const [r, g, b, a = 1] = m.map(Number);
    if (a < 0.5) return;
    iph.style.setProperty('--sb', `rgb(${r},${g},${b})`);
    iph.style.setProperty('--sb-ink', (r * 299 + g * 587 + b * 114) / 1000 > 140 ? '#000' : '#fff');
  }
  function tintFromImage(iph, img) {
    const go = () => {
      try {
        const c = document.createElement('canvas'); c.width = 8; c.height = 1;
        const x = c.getContext('2d');
        x.drawImage(img, 0, 2, img.naturalWidth, 4, 0, 0, 8, 1);
        const d = x.getImageData(0, 0, 8, 1).data;
        let r = 0, g = 0, b = 0; for (let i = 0; i < 32; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
        tintBar(iph, `rgb(${r / 8 | 0},${g / 8 | 0},${b / 8 | 0})`);
      } catch (e) {}
    };
    img.complete && img.naturalWidth ? go() : img.addEventListener('load', go, { once: true });
  }
  // Für alle iPhones im Bereich: Statusleiste passend zum sichtbaren Bild
  function tintPhones(scope = document) {
    scope.querySelectorAll('.iph').forEach(iph => {
      const img = iph.querySelector('.iph-body img.on') || iph.querySelector('.iph-body img');
      if (img) tintFromImage(iph, img);
    });
  }

  // Standbilder einer Vorschau überblenden – nur solange trigger überfahren wird
  function cycleOnHover(trigger, box = trigger, ms = 1500) {
    const imgs = [...box.querySelectorAll('.iph-body img, .brw-body img')];
    const wrap = box.querySelector('.brw.pan');
    let k = imgs.findIndex(i => i.classList.contains('on')), timer = 0;
    if (k < 0) k = 0;
    const iph = box.querySelector('.iph');
    const start = () => {
      if (wrap) { wrap.classList.add('panning'); return; }
      if (imgs.length < 2 || timer) return;
      timer = setInterval(() => {
        imgs[k].classList.remove('on'); k = (k + 1) % imgs.length; imgs[k].classList.add('on');
        if (iph) tintFromImage(iph, imgs[k]);
      }, ms);
    };
    const stop = () => { clearInterval(timer); timer = 0; if (wrap) wrap.classList.remove('panning'); };
    trigger.addEventListener('pointerenter', start);
    trigger.addEventListener('pointerleave', stop);
    trigger.addEventListener('focusin', start);
    trigger.addEventListener('focusout', stop);
    return { start, stop };
  }

  // ---------- Demo-Bühne ----------
  // slot = Fläche, in die das Gerät eingepasst wird. onChapter(k, dur) meldet den Kapitelwechsel.
  // iphone: true = Handy-Demos im echten iPhone-Rahmen mit Statusleiste.
  function stage({ slot, project: p, maxPhone = 0.76, bezel = 9, onChapter, onPause, iphone: realPhone = false }) {
    const { width, height, device, src, url: site } = p.demo;
    const real = realPhone && device === 'phone';
    const dev = document.createElement('div');
    const core = `<div class="dv-scaled" style="width:${width}px;height:${height}px">
        <iframe title="${esc(p.title)} Demo" tabindex="-1" width="${width}" height="${height}" data-src="${ROOT}${src}"></iframe>
        <div class="taps"></div>
      </div>`;
    if (real) {
      dev.className = 'dv dv-real';
      dev.innerHTML = iphone(`<div class="dv-view">${core}</div>`);
    } else {
      dev.className = 'dv dv-' + device;
      dev.innerHTML = `${device === 'desktop' ? `<div class="dv-bar"><i></i><i></i><i></i><span>${esc(site || p.title)}</span></div>` : ''}
        <div class="dv-view">${core}</div>`;
      dev.style.setProperty('--bezel', bezel + 'px');
    }
    slot.appendChild(dev);

    const scaled = dev.querySelector('.dv-scaled');
    const bar = 30;
    const RATIO = 2.1819; // Höhe/Breite des iPhone-Rahmens (siehe glas-base.css)
    const fit = () => {
      const w = slot.clientWidth, h = slot.clientHeight;
      if (!w || !h) return;
      let s;
      if (real) {
        const W = Math.min(w, h / RATIO, width * maxPhone * 1.087);
        dev.style.width = W + 'px';
        dev.style.height = W * RATIO + 'px';
        s = dev.querySelector('.iph-body').clientWidth / width;
      } else if (device === 'phone') {
        s = Math.min((h - bezel * 2) / height, (w - bezel * 2) / width, maxPhone);
        dev.style.width = (width * s + bezel * 2) + 'px';
        dev.style.height = (height * s + bezel * 2) + 'px';
      } else {
        s = Math.min(w / width, (h - bar) / height);
        dev.style.width = (width * s) + 'px';
        dev.style.height = (height * s + bar) + 'px';
      }
      scaled.style.transform = `scale(${s})`;
    };
    fit();
    new ResizeObserver(fit).observe(slot);

    // Statusleiste färbt sich wie die Kopfzeile der laufenden App
    const iph = dev.querySelector('.iph');
    const frame = dev.querySelector('iframe');
    const sampleBar = () => {
      try {
        const d = frame.contentDocument; if (!d || !d.body) return;
        let el = d.elementFromPoint(width / 2, 3);
        while (el) {
          const bg = frame.contentWindow.getComputedStyle(el).backgroundColor;
          if (bg && !/rgba\(.*,\s*0\)$/.test(bg) && bg !== 'transparent') { tintBar(iph, bg); return; }
          el = el.parentElement;
        }
        tintBar(iph, 'rgb(255,255,255)');
      } catch (e) {}
    };

    const player = new DemoPlayer({
      frame,
      taps: dev.querySelector('.taps'),
      script: window.DEMO_SCRIPTS[p.id],
      onChapter: (k, dur) => { player.current = k; onChapter && onChapter(k, dur); if (iph) setTimeout(sampleBar, 400); },
    });
    const tick = iph && setInterval(() => {
      if (!frame.isConnected) return clearInterval(tick);
      if (player.visible && !player.paused) sampleBar();
    }, 1200);
    const api = {
      player, device: dev,
      get paused() { return player.paused; },
      setPaused(v) { player.paused = v; onPause && onPause(v); },
      toggle() { api.setPaused(!player.paused); },
      go(k) { api.setPaused(false); player.start(k); },
      stop() { player.token++; dev.remove(); },
    };
    new IntersectionObserver(es => { player.visible = es[0].isIntersecting; }, { threshold: 0.15 }).observe(slot);
    document.addEventListener('visibilitychange', () => { player.visible = !document.hidden; });
    player.start(0);
    return api;
  }

  const ICON = {
    pause: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    out: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>',
  };

  window.V2 = { C, ROOT, lang, t, esc, calm, fine, projects, byId, current, params, url, icon, images, layers, status, extra, fill, reveal, countUp, words, letters,
    iphone, browser, deviceStills, tintPhones, tintFromImage, cycleOnHover, stage, ICON, setLang, HERO };
})();
