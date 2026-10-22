// „Frag mich“: kleine Chat-Blase rechts in der Fußleiste von Startseite und Projektseiten, führt zu „Warum diese Seite“.
// Sie sitzt ganz normal in der Fußleiste (nicht festgeheftet, nichts liegt über dem Inhalt).
// Beim ersten Mal taucht sie erst auf, wenn man ganz unten ist und trotzdem weiterscrollen will:
// Foto, kurz Tipp-Punkte, dann die Frage. Danach – auch auf den folgenden Seiten dieses Besuchs –
// steht nur noch das Foto da, beim Überfahren kommt die Frage wieder.
(() => {
  const { ROOT, lang, esc, calm } = V2;
  const KEY = 'frag-mich';
  const TEXT = lang === 'en' ? 'Curious why I build all this?' : 'Neugierig, warum ich das alles baue?';
  const TYPING = 1400;          // so lange tippt Thomas beim ersten Mal
  const STAY = 6000;            // so lange bleibt die Frage danach offen, dann nur noch das Foto

  const foot = document.querySelector('.foot');
  if (!foot) return;
  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}

  const el = document.createElement('a');
  el.className = 'frag';
  el.href = `${ROOT}warum/`;
  el.setAttribute('aria-label', TEXT);
  el.innerHTML = `
    <span class="frag-msg" aria-hidden="true"><span class="frag-bub">
      <b>Thomas</b>
      <span class="frag-typing"><i></i><i></i><i></i></span>
      <span class="frag-txt">${esc(TEXT)}</span>
    </span></span>
    <img class="frag-ava" src="${ROOT}img/ueber-mich/headshot.jpg" alt="" width="44" height="44">`;
  foot.appendChild(el);

  if (seen) {
    el.classList.add('in', 'said');
  } else {
    // Ganz unten angekommen und trotzdem weiter nach unten gescrollt (Mausrad, Wischen oder Tasten)
    const atBottom = () => innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    let touchY = 0;
    const done = () => {
      removeEventListener('wheel', onWheel); removeEventListener('touchstart', onStart);
      removeEventListener('touchmove', onMove); removeEventListener('keydown', onKey);
    };
    const first = () => {
      done();
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
      el.classList.add('in', 'open');
      if (calm) el.classList.add('said');
      else setTimeout(() => el.classList.add('said'), TYPING);
      setTimeout(() => el.classList.remove('open'), (calm ? 0 : TYPING) + STAY);
    };
    const onWheel = e => { if (e.deltaY > 0 && atBottom()) first(); };
    const onStart = e => { touchY = e.touches[0].clientY; };
    const onMove = e => { if (touchY - e.touches[0].clientY > 30 && atBottom()) first(); };
    const onKey = e => { if (['ArrowDown', 'PageDown', 'End', ' '].includes(e.key) && atBottom()) first(); };
    addEventListener('wheel', onWheel, { passive: true });
    addEventListener('touchstart', onStart, { passive: true });
    addEventListener('touchmove', onMove, { passive: true });
    addEventListener('keydown', onKey);
  }

  // Ohne Maus (Handy): erster Tipp zeigt die Frage, zweiter führt zum Chat
  el.addEventListener('click', e => {
    if (matchMedia('(hover: hover)').matches || el.classList.contains('open')) return;
    e.preventDefault();
    el.classList.add('open', 'said');
    setTimeout(() => el.classList.remove('open'), STAY);
  });
})();
