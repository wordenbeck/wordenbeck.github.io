// Startseite: Glas-Hero mit iPhone-Karussell (alle 4 s eine Position weiter, ohne Maus-Wackeln),
// darunter Querkacheln im Turm-Stil: Beim Überfahren legt sich das Gerät schräg hin und die Screens
// steigen wie Stockwerke senkrecht auf. Bei Apps heben sich zusätzlich zwei Bauteile des obersten Screens ab,
// Websites fächern nur ihre Seiten auf. Projektseite, Warum und Über mich kommen aus glas-ui.js.
(() => {
  const { esc, projects, url, icon, status, images, layers, iphone, browser, tintPhones, ICON, ROOT, calm, fine } = V2;
  const { mount, project, story, about, PAGES } = GlasUI;

  // Bauteile, die aus dem obersten App-Screen herausgehoben werden (Pixel im Originalbild, W = Bildbreite)
  const POPS = {
    kalo:     { W: 600, parts: [[58, 234, 212, 212, 'circle'], [24, 508, 552, 260]] },
    mahlzeit: { W: 600, parts: [[26, 192, 548, 484], [308, 833, 266, 115]] },
    punkte:   { W: 600, parts: [[30, 142, 542, 130], [30, 488, 542, 392]] },
  };

  // Abgehobene Teile (.pop) schweben über dem Bildschirm
  const pops = p => {
    const cfg = POPS[p.id]; if (!cfg) return '';
    const src = images(p)[0];
    return `<div class="pops">${cfg.parts.map(([x, y, w, h, shape], i) =>
      `<span class="pop${shape ? ' ' + shape : ''}" style="--i:${i};--x:${x / cfg.W};--y:${y / cfg.W};--w:${w / cfg.W};--h:${h / cfg.W};background-image:url('${src}')"></span>`).join('')}</div>`;
  };
  // Mulden an der alten Stelle: vorab weichgezeichneter Screen (img/v2/blur/), ohne CSS-Filter – Filter bringen die 3D-Sortierung durcheinander
  const holes = p => (POPS[p.id] ? POPS[p.id].parts : []).map(([x, y, w, h, shape]) =>
    `<span class="hole${shape ? ' ' + shape : ''}" style="left:${x / 6}%;top:${y / 12.98}%;width:${w / 6}%;height:${h / 12.98}%;`
    + `background-image:url('${ROOT}img/v2/blur/${p.id}.jpg');background-size:${600 / w * 100}% auto;background-position:${x / (600 - w) * 100}% ${y / (1298 - h) * 100}%"></span>`).join('');

  // Turm: Ebene 0 = oberster Screen, darunter die weiteren Screens des Projekts
  const tower = p => {
    const ls = layers(p).slice(0, 4);
    const phone = p.preview.device === 'phone';
    const label = (p.url || '').replace(/^https?:\/\//, '') || p.title;
    return `<div class="xs"><div class="stack" style="--n:${ls.length}">${ls.map((s, k) => `<div class="ly" style="--k:${k}">
      ${phone ? iphone(`<img class="on" src="${s}" alt="">${k === 0 ? holes(p) : ''}`) : browser(`<img src="${s}" alt="">`, k === 0 ? label : '')}
      ${k === 0 ? pops(p) : ''}</div>`).join('')}</div></div>`;
  };

  // Hero-Karussell: Kalo links, Mahlzeit vorn, Punktekönig rechts – alle 4 s rückt jedes eine Position nach rechts
  const HERO = ['kalo', 'mahlzeit', 'punkte'];
  const heroPhones = () => HERO.map((id, i) => {
    const p = projects.find(x => x.id === id);
    return `<a class="fp" data-pos="${i}" href="${url(p)}" tabindex="-1" style="--accent:${p.accent}">${iphone(`<img src="${images(p)[0]}" alt="">`)}</a>`;
  }).join('');
  function carousel() {
    if (calm) return;
    const phones = [...document.querySelectorAll('.fp')];
    // Erst nach dem Einflug starten, damit sich beides nicht überlagert
    setTimeout(() => {
      setInterval(() => {
        if (document.hidden) return;
        phones.forEach(fp => { fp.classList.add('moving'); fp.dataset.pos = (+fp.dataset.pos + 1) % 3; });
      }, 4000);
    }, 2000);
  }

  function home() {
    mount(`
      <main>
        <section class="hero">
          <div class="hero-text">
            <img class="mark" src="${ROOT}icons/logo-e.svg" alt="" width="56" height="56">
            <h1><span data-k="name"></span><em data-k="role"></em></h1>
            <p class="intro" data-k="intro"></p>
            <div class="actions">
              <a class="btn primary" href="#projekte" data-k="labels.discover"></a>
              <a class="btn glass" href="${PAGES.why}" data-k="nav.why"></a>
              <a class="btn glass" href="${PAGES.about}" data-k="labels.aboutLink"></a>
            </div>
          </div>
          <div class="scene" aria-hidden="true"><div class="rig">${heroPhones()}</div></div>
        </section>
        <section class="xworks" id="projekte">
          <h2 data-k="labels.projects"></h2>
          <div class="xgrid">
            ${projects.map(p => `
            <a class="xt glass d-${p.preview.device} p-${p.id}" href="${url(p)}" style="--accent:${p.accent}">
              <div class="xt-text">
                <div class="xt-top"><span class="ci">${icon(p, 18)}</span><span class="st s-${p.status}">${status(p)}</span></div>
                <h3>${esc(p.title)}</h3>
                <p>${esc(p.tagline)}</p>
                <span class="go"><span data-k="labels.open"></span>${ICON.arrow}</span>
              </div>
              ${tower(p)}
            </a>`).join('')}
          </div>
        </section>
      </main>`);
    tintPhones();
    carousel();

    // Bauteile maßstabsgerecht platzieren: --u = Breite des Bildschirms in px
    const ro = new ResizeObserver(es => es.forEach(e => e.target.style.setProperty('--u', e.contentRect.width + 'px')));
    document.querySelectorAll('.pops').forEach(el => ro.observe(el));

    // Ohne Maus (Handy, Tablet): Turm öffnet sich, sobald die Kachel gut sichtbar ist
    if (!fine) {
      const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('open', e.intersectionRatio > 0.6)), { threshold: [0, 0.6, 1] });
      document.querySelectorAll('.xt').forEach(t => io.observe(t));
    }
  }

  ({ home, project, story, about })[document.body.dataset.page]();
})();
