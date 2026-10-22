// „Frag mich“: kleine Chat-Blase rechts in der Fußleiste von Startseite und Projektseiten, führt zu „Warum diese Seite“.
// Sie sitzt ganz normal in der Fußleiste (nicht festgeheftet, nichts liegt über dem Inhalt), ihr Platz ist von
// Anfang an reserviert, damit die Seite beim Auftauchen nicht springt.
// Ablauf: Das Foto steht ganz rechts. Öffnen = das Foto gleitet nach links, rechts daneben wächst die Blase
// (beim ersten Mal erst Tipp-Punkte, dann die Frage). Schließen = Blase schrumpft, Foto gleitet zurück nach rechts.
// Beim ersten Mal erst, wenn man ganz unten ist und trotzdem weiterscrollen will; danach (je Besuch) beim Überfahren.
(() => {
  const { ROOT, lang, esc, calm } = V2;
  const KEY = 'frag-mich';
  const TEXT = lang === 'en' ? 'Curious why I build all this?' : 'Neugierig, warum ich das alles baue?';
  const TYPING = 1600;          // so lange tippt Thomas beim ersten Mal
  const STAY = 5500;            // so lange bleibt die Frage danach offen

  const foot = document.querySelector('.foot');
  if (!foot) return;
  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}

  const el = document.createElement('a');
  el.className = 'frag';
  el.href = `${ROOT}warum/`;
  el.setAttribute('aria-label', TEXT);
  el.innerHTML = `
    <img class="frag-ava" src="${ROOT}img/ueber-mich/headshot.jpg" alt="" width="44" height="44">
    <span class="frag-msg" aria-hidden="true"><span class="frag-bub">
      <b>Thomas</b>
      <span class="frag-line"><span class="frag-typing"><i></i><i></i><i></i></span><span class="frag-txt">${esc(TEXT)}</span></span>
    </span></span>`;
  foot.appendChild(el);
  const msg = el.querySelector('.frag-msg'), bub = el.querySelector('.frag-bub');

  // Blase auf die Breite ihres aktuellen Inhalts bringen (0 = zu). Die Breite gleitet per CSS-Übergang.
  const fit = () => { msg.style.width = `${bub.offsetWidth}px`; };
  const open = (typing = false) => {
    el.classList.toggle('said', !typing);
    el.classList.add('open');
    fit();
  };
  const close = () => { el.classList.remove('open'); msg.style.width = '0px'; };
  const say = () => { el.classList.add('said'); fit(); };

  if (seen) {
    el.classList.add('in', 'said');
  } else {
    // Ganz unten angekommen und trotzdem weiter nach unten gescrollt (Mausrad, Wischen oder Tasten)
    const atBottom = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    let touchY = 0, fired = false;
    const first = () => {
      if (fired) return;
      fired = true;
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
      el.classList.add('in');
      if (calm) { open(); setTimeout(close, STAY); return; }
      setTimeout(() => open(true), 500);                    // Foto steht, dann gleitet es nach links: Tipp-Punkte
      setTimeout(say, 500 + TYPING);                         // Blase wächst weich auf die Frage
      setTimeout(() => { if (!el.matches(':hover')) close(); }, 500 + TYPING + STAY);
    };
    addEventListener('wheel', e => { if (e.deltaY > 0 && atBottom()) first(); }, { passive: true });
    addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
    addEventListener('touchmove', e => { if (touchY - e.touches[0].clientY > 30 && atBottom()) first(); }, { passive: true });
    addEventListener('keydown', e => { if (['ArrowDown', 'PageDown', 'End', ' '].includes(e.key) && atBottom()) first(); });
  }

  // Mit Maus: Überfahren öffnet, Verlassen schließt
  el.addEventListener('mouseenter', () => { if (el.classList.contains('in')) open(); });
  el.addEventListener('mouseleave', () => { if (el.classList.contains('said')) close(); });
  el.addEventListener('focus', () => open());
  el.addEventListener('blur', close);
  // Ohne Maus (Handy): erster Tipp zeigt die Frage, zweiter führt zum Chat
  el.addEventListener('click', e => {
    if (matchMedia('(hover: hover)').matches || el.classList.contains('open')) return;
    e.preventDefault();
    open();
    setTimeout(close, STAY);
  });
})();
