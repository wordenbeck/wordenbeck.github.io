// „Über mich“ als Profilkarte wie bei Tinder – Kartenstapel, drei Bilder zum Durchtippen, echtes Wischen.
// Bild 1 Hallo (Headshot), Bild 2 Karriere (Lebenslauf-Foto), Bild 3 Privat (Abenteuer).
// Ziehen dreht die Karte je nach Griffpunkt, zeigt Daumen runter oder hoch und lässt die Karten darunter nachrücken.
// Rechts = It's a Match → Kontakt. Links = leere Karte „Das war das beste Match“, mit Zurückholen und „Weitersuchen“.
(() => {
  const { mount } = GlasUI;
  const { I, overlays, esc } = MeUI;
  const IMG = `${V2.ROOT}img/ueber-mich/`;
  const { lang } = V2;

  // Alle Texte der Karte auf Deutsch und Englisch (Sprache wechselt per Neuladen)
  const T = {
    de: {
      title: 'Über mich – Thomas Wordenbeck', years: n => `${n} Jahre`, since: 'seit 2024',
      gefa: 'IT-Projekte, Business Analyse, IT-Betrieb',
      hi: 'Hi, ich bin Thomas. Ich bringe Produktideen und Teams zusammen – und baue inzwischen auch selbst.',
      career: 'Karriere', nums: ['Produktteams', 'MVPs', 'Nutzer'],
      personal: 'Privat', chips: ['Familienvater', 'Abenteurer', 'Berge', 'Wandern', 'Gravelbike'],
      outdoors: 'Am liebsten draußen – mit der Familie, auf dem Rad oder mit Rucksack in den Bergen.',
      fakes: [['Product Owner · Hamburg', 'Backlog-Zero ist mein Cardio.'], ['Agile Coach · Köln', 'Ich habe ein Post-it für dich.']],
      best: 'Das war das beste Match in der Nähe.', more: 'Weitersuchen geht natürlich.<br>Ein besseres Match ist unwahrscheinlich 😉',
      again: 'Thomas zurückholen', keepLooking: 'Weitersuchen', cv: 'Lebenslauf', card: 'Profilkarte',
      prev: 'Vorheriges Bild', next: 'Nächstes Bild', no: 'Weiter suchen', yes: 'Gefällt mir',
      hint: 'Ziehen oder Pfeiltasten · Links/rechts tippen zum Blättern',
    },
    en: {
      title: 'About me – Thomas Wordenbeck', years: n => `${n} years`, since: 'since 2024',
      gefa: 'IT projects, business analysis, IT operations',
      hi: 'Hi, I’m Thomas. I bring product ideas and teams together – and these days I build things myself, too.',
      career: 'Career', nums: ['product teams', 'MVPs', 'users'],
      personal: 'Personal', chips: ['Family man', 'Adventurer', 'Mountains', 'Hiking', 'Gravel biking'],
      outdoors: 'Happiest outdoors – with my family, on the bike or with a backpack in the mountains.',
      fakes: [['Product Owner · Hamburg', 'Backlog zero is my cardio.'], ['Agile Coach · Cologne', 'I’ve got a Post-it for you.']],
      best: 'That was the best match nearby.', more: 'You can keep looking, of course.<br>A better match is unlikely 😉',
      again: 'Bring Thomas back', keepLooking: 'Keep looking', cv: 'CV', card: 'profile card',
      prev: 'Previous photo', next: 'Next photo', no: 'Keep looking', yes: 'Like',
      hint: 'Drag or use the arrow keys · Tap left/right to browse',
    },
  }[lang] || {};
  document.title = T.title;

  const ICON = {
    pen: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3H8"/><path d="m15.007 5.008 3.987 3.986"/><path d="M20 15v4"/><path d="M21.174 6.813a2.82 2.82 0 0 0-3.986-3.987L3.842 16.175a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="M22 17h-4"/><path d="M4 5v4"/><path d="M6 7H2"/><path d="M9 2v2"/></svg>',
    check: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#2997ff"/><path d="m7.5 12.2 3 3 6-6.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    thumb: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v11"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 17.5 21H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9z"/></svg>',
    down: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V3"/><path d="M9 18.1 10 14H4.2a2 2 0 0 1-1.9-2.6l2.3-7A2 2 0 0 1 6.5 3H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2.8a2 2 0 0 0-1.8 1.1L12 22a3.1 3.1 0 0 1-3-3.9z"/></svg>',
    undo: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    home: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    mtn: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2z"/></svg>',
    walk: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="m4 22 4-10 3 2v8M15 22l-2-6M7 12l3-5 4 2 2 3 3 1"/></svg>',
    bike: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 17.5V14l-3-3 4-3 2 3h2"/></svg>',
    compass: '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z"/></svg>',
  };

  // Drei Seiten der Karte: je ein Bild mit eigenem Inhalt
  // Karriere: Firma, Zeitraum und Dauer klein oben, darunter die Rolle
  const JAHR = new Date().getFullYear();
  const dauer = (von, bis = JAHR) => T.years(bis - von);
  const JOBS = [
    { firma: 'E.ON', zeit: T.since, von: 2024, was: 'Transformation Manager' },
    { firma: 'E.ON, d lab_', zeit: '2022 – 2024', von: 2022, bis: 2024, was: 'Product Manager' },
    { firma: 'GEFA Bank', zeit: '2004 – 2022', von: 2004, bis: 2022, was: T.gefa },
  ];
  const PAGES = [
    { img: `${IMG}headshot.jpg`, pos: '50% 28%', html: `
        <h1>${esc(ME.name)} ${ICON.check}</h1>
        <p class="lead">${ICON.pen}${esc(ME.slogan)}</p>
        <p class="txt">${esc(T.hi)}</p>` },
    { img: `${IMG}foto.jpg`, pos: '50% 16%', html: `
        <p class="kick">${esc(T.career)}</p>
        <ul class="tl">${JOBS.map(j => `<li><small><b>${esc(j.firma)}</b> · ${j.zeit} · ${dauer(j.von, j.bis)}</small><span>${esc(j.was)}</span></li>`).join('')}</ul>
        <div class="nums">${ME.zahlen.slice(0, 3).map((z, i) => `<span><b>${z.v.toLocaleString(lang)}</b> ${esc(T.nums[i])}</span>`).join('')}</div>` },
    { img: `${IMG}abenteuer.jpg`, pos: '66% 40%', html: `
        <p class="kick">${esc(T.personal)}</p>
        <div class="chips">
          ${[ICON.home, ICON.compass, ICON.mtn, ICON.walk, ICON.bike].map((ic, i) => `<span>${ic}${esc(T.chips[i])}</span>`).join('')}
        </div>
        <p class="txt">${esc(T.outdoors)}</p>` },
  ];

  // Erfundene Profile auf den Karten dahinter (Fotos von Unsplash, unscharf)
  const FAKES = [
    { img: `${IMG}fake-1.jpg`, name: 'Lena', alter: 31, job: T.fakes[0][0], text: T.fakes[0][1] },
    { img: `${IMG}fake-2.jpg`, name: 'Marco', alter: 36, job: T.fakes[1][0], text: T.fakes[1][1] },
  ];
  const fake = f => `<div class="fake"><img src="${f.img}" alt=""><div class="shade"></div>
    <div class="fake-info"><p class="fake-name">${f.name} <span>${f.alter}</span></p><p class="fake-job">${esc(f.job)}</p><p class="fake-txt">${esc(f.text)}</p></div></div>`;

  mount(`
    <main class="proto tm">
      <div class="deck" id="deck">
        <div class="tcard ghost" aria-hidden="true">${fake(FAKES[1])}</div>
        <article class="tcard empty" id="empty" aria-hidden="true">
          ${fake(FAKES[0])}
          <div class="radar"><img src="${IMG}headshot.jpg" alt=""></div>
          <h2>${esc(T.best)}</h2>
          <p>${T.more}</p>
          <button class="btn primary" type="button" id="again">${ICON.undo}<span>${esc(T.again)}</span></button>
          <button class="more" type="button" id="more">${esc(T.keepLooking)}</button>
        </article>
        <article class="tcard face" id="card" aria-roledescription="${T.card}">
          <div class="pics">${PAGES.map((p, i) => `<img src="${p.img}" alt="" style="object-position:${p.pos}" class="${i ? '' : 'on'}" draggable="false">`).join('')}</div>
          <div class="shade"></div>
          <div class="bars">${PAGES.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>
          <a class="cv" href="${ME.lebenslauf}">${I.doc}<span>${esc(T.cv)}</span></a>
          <span class="badge like">${ICON.thumb}</span>
          <span class="badge nope">${ICON.down}</span>
          <div class="info">${PAGES.map((p, i) => `<div class="pane${i ? '' : ' on'}">${p.html}</div>`).join('')}</div>
          <button class="tap prev" type="button" aria-label="${T.prev}"></button>
          <button class="tap next" type="button" aria-label="${T.next}"></button>
        </article>
      </div>
      <div class="acts">
        <button class="act no" type="button" id="no" aria-label="${T.no}">${ICON.down}</button>
        <button class="act yes" type="button" id="yes" aria-label="${T.yes}">${ICON.thumb}</button>
      </div>
      <p class="hint">${esc(T.hint)}</p>
    </main>`);

  const ov = overlays();
  document.querySelectorAll('.ov img').forEach(img => { img.src = `${IMG}headshot.jpg`; });   // im Match das aktuelle Bild zeigen
  const deck = document.getElementById('deck'), card = document.getElementById('card'), empty = document.getElementById('empty');
  const pics = [...card.querySelectorAll('.pics img')], panes = [...card.querySelectorAll('.pane')], bars = [...card.querySelectorAll('.bars i')];
  const btnYes = document.getElementById('yes'), btnNo = document.getElementById('no');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Bilder: wechseln von allein (Balken füllen sich), Antippen blättert, Ken-Burns-Zoom im CSS ----------
  const SLIDE = 6500;
  card.style.setProperty('--slide', SLIDE + 'ms');
  let page = 0, timer = 0, started = 0, remaining = SLIDE;
  // Hinweis aufs Wischen: Nach zwei Dritteln der Standzeit neigt sich die Karte kurz nach links und rechts –
  // höchstens dreimal und nur, bis jemand selbst zieht oder einen Knopf drückt
  let nudgeTimer = 0, nudges = 0, interacted = false;
  const schedule = ms => {
    clearTimeout(timer); clearTimeout(nudgeTimer); started = performance.now(); remaining = ms;
    timer = setTimeout(() => showPage((page + 1) % PAGES.length, true), ms);
    if (!interacted && nudges < 3) nudgeTimer = setTimeout(() => nudge(), Math.max(0, ms - SLIDE / 3));
  };
  const pause = () => { clearTimeout(timer); clearTimeout(nudgeTimer); remaining -= performance.now() - started; card.classList.add('paused'); };
  const resume = () => { card.classList.remove('paused'); if (!gone) schedule(Math.max(400, remaining)); };
  const showPage = (k, auto = false) => {
    if (!auto && (k < 0 || k >= PAGES.length)) {     // am Rand: kurzes Kippen statt Weiterblättern
      card.classList.remove('edge-l', 'edge-r'); void card.offsetWidth;
      card.classList.add(k < 0 ? 'edge-l' : 'edge-r');
      return;
    }
    page = k;
    [...pics, ...panes, ...bars].forEach(el => el.classList.remove('on'));
    void card.offsetWidth;                           // Animationen (Zoom, Balken) neu starten
    pics[k].classList.add('on'); panes[k].classList.add('on'); bars[k].classList.add('on');
    bars.forEach((b, i) => b.classList.toggle('done', i < k));
    card.classList.remove('paused');
    if (!gone) schedule(SLIDE);
  };
  card.querySelector('.prev').addEventListener('click', () => { if (!moved) showPage(page - 1); });
  card.querySelector('.next').addEventListener('click', () => { if (!moved) showPage(page + 1); });
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : resume()));
  if (!reduce) schedule(SLIDE); else card.classList.add('manual');

  // ---------- Stapel: Karten darunter rücken mit dem Ziehen nach ----------
  const setStack = p => {   // p = 0 (Ruhe) … 1 (Karte fast weg)
    deck.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
  };

  // ---------- Ziehen ----------
  let sx = 0, sy = 0, dx = 0, dy = 0, dir = 1, dragging = false, moved = false, gone = false;
  let hist = [];
  const W = () => card.offsetWidth;
  const paint = () => {
    const r = Math.max(-22, Math.min(22, dx / W() * 28 * dir));
    card.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${r}deg)`;
    const k = Math.min(1, Math.abs(dx) / (W() * .35));
    deck.style.setProperty('--like', dx > 0 ? k : 0);
    deck.style.setProperty('--nope', dx < 0 ? k : 0);
    btnYes.style.setProperty('--hot', dx > 0 ? k : 0);
    btnNo.style.setProperty('--hot', dx < 0 ? k : 0);
    setStack(Math.abs(dx) / (W() * .9));
  };
  // Kurzes Links-rechts-Neigen mit Daumen und Glow, wie ein angedeutetes Wischen
  let nudgeFrame = 0;
  const stopNudge = () => {
    if (!nudgeFrame) return;
    cancelAnimationFrame(nudgeFrame); nudgeFrame = 0;
    dx = dy = 0; paint(); card.style.transform = '';
  };
  const nudge = () => {
    if (interacted || gone || dragging || document.hidden || nudges >= 3) return;
    nudges++; dir = 1; dy = 0;
    card.style.transition = 'none';
    const t0 = performance.now(), MS = 1700, A = W() * .13;
    const step = t => {
      const k = Math.min(1, (t - t0) / MS);
      dx = -A * Math.sin(k * Math.PI * 2) * Math.sin(k * Math.PI);   // erst links, dann rechts, weich zurück
      paint();
      if (k < 1) nudgeFrame = requestAnimationFrame(step);
      else { nudgeFrame = 0; dx = 0; paint(); card.style.transform = ''; }
    };
    nudgeFrame = requestAnimationFrame(step);
  };

  card.addEventListener('pointerdown', e => {
    if (gone || e.button > 0 || e.target.closest('a')) return;
    stopNudge();
    const r = card.getBoundingClientRect();
    dir = e.clientY - r.top < r.height / 2 ? 1 : -1;   // oben gegriffen dreht anders als unten (wie bei Tinder)
    sx = e.clientX; sy = e.clientY; dx = dy = 0; moved = false; dragging = true;
    hist = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
    card.style.transition = 'none';
    pause();
  });
  addEventListener('pointermove', e => {
    if (!dragging) return;
    dx = e.clientX - sx; dy = (e.clientY - sy) * .6;
    if (!moved && Math.hypot(dx, dy) > 6) { moved = true; interacted = true; card.setPointerCapture?.(e.pointerId); card.classList.add('drag'); }
    if (!moved) return;
    hist.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (hist.length > 6) hist.shift();
    paint();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('drag');
    if (!moved) { resume(); return; }
    const a = hist[0], b = hist[hist.length - 1];
    const vx = (b.x - a.x) / Math.max(16, b.t - a.t);   // Pixel pro ms
    const vy = (b.y - a.y) / Math.max(16, b.t - a.t);
    if (dx > W() * .32 || vx > .55) fling(1, vx, vy);
    else if (dx < -W() * .32 || vx < -.55) fling(-1, vx, vy);
    else springBack();
    setTimeout(() => { moved = false; }, 0);
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  // Zurückfedern mit leichtem Überschwingen
  const springBack = () => {
    card.style.transition = reduce ? 'none' : 'transform .55s cubic-bezier(.2,1.5,.35,1)';
    card.style.transform = '';
    deck.style.setProperty('--like', 0); deck.style.setProperty('--nope', 0);
    btnYes.style.setProperty('--hot', 0); btnNo.style.setProperty('--hot', 0);
    deck.classList.add('settle'); setStack(0);
    setTimeout(() => deck.classList.remove('settle'), 550);
    resume();
  };

  // Rauswerfen: Richtung, Schwung und Drehung aus der Bewegung
  const fling = (side, vx = 0, vy = 0) => {
    gone = true; pause();
    const out = (innerWidth / 2 + W()) * side;
    const speed = Math.max(1, Math.abs(vx));
    const ms = reduce ? 0 : Math.max(260, 520 / speed);
    card.style.transition = `transform ${ms}ms cubic-bezier(.3,.6,.4,1), opacity ${ms}ms`;
    card.style.transform = `translate3d(${out}px, ${dy + vy * 220}px, 0) rotate(${side * 32 * dir}deg)`;
    deck.style.setProperty(side > 0 ? '--like' : '--nope', 1);
    deck.classList.add('settle'); setStack(1);
    (side > 0 ? btnYes : btnNo).classList.add('pop');
    setTimeout(() => {
      btnYes.style.setProperty('--hot', 0); btnNo.style.setProperty('--hot', 0);
      btnYes.classList.remove('pop'); btnNo.classList.remove('pop');
      if (side > 0) ov.match();
      else { deck.style.setProperty('--nope', 0); empty.classList.add('front'); empty.removeAttribute('aria-hidden'); }
    }, ms * .7);
  };

  // Karte zurückholen (nach links weg oder nach dem Match)
  const comeBack = () => {
    if (!gone) return;
    empty.classList.remove('front'); empty.setAttribute('aria-hidden', 'true');
    card.style.transition = 'none';
    deck.style.setProperty('--like', 0); deck.style.setProperty('--nope', 0);
    void card.offsetWidth;
    card.style.transition = reduce ? 'none' : 'transform .7s cubic-bezier(.2,1.3,.35,1)';
    card.style.transform = '';
    setStack(0); gone = false;
    showPage(0, true);
    setTimeout(() => deck.classList.remove('settle'), 700);
  };
  document.getElementById('again').addEventListener('click', comeBack);
  document.addEventListener('ov-close', comeBack);
  document.addEventListener('ov-again', comeBack);

  // Knöpfe und Tastatur: gleiche Bewegung wie beim Wischen, mit kurzem Anlauf
  const choose = side => {
    if (gone) return;
    interacted = true; stopNudge();
    dir = 1; dy = 0; dx = side * 30;
    card.style.transition = 'transform .12s ease-out'; paint();
    setTimeout(() => fling(side, side * 1.2, 0), 110);
  };
  btnYes.addEventListener('click', () => choose(1));
  btnNo.addEventListener('click', () => choose(-1));
  addEventListener('keydown', e => {
    if (document.querySelector('.ov.in')) return;
    if (e.key === 'ArrowRight') choose(1);
    if (e.key === 'ArrowLeft') choose(-1);
    if (e.key === ' ') { e.preventDefault(); showPage((page + 1) % PAGES.length, true); }
  });
})();
