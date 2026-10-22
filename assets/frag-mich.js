// „Frag mich“: kleine Chat-Blase unten rechts auf Startseite und Projektseiten, führt zu „Warum diese Seite“.
// Beim ersten Mal erscheint sie erst, wenn man unten an der Fußleiste ankommt: Foto, kurz Tipp-Punkte, dann die Frage.
// Danach (auch auf den folgenden Seiten dieses Besuchs) steht nur noch das Foto da – beim Überfahren kommt die Frage wieder.
(() => {
  const { ROOT, lang, esc, calm } = V2;
  const KEY = 'frag-mich';
  const TEXT = lang === 'en' ? 'Curious why I build all this?' : 'Neugierig, warum ich das alles baue?';
  const TYPING = 1400;          // so lange tippt Thomas beim ersten Mal
  const STAY = 6000;            // so lange bleibt die Frage danach offen, dann nur noch das Foto

  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}

  const el = document.createElement('a');
  el.className = 'frag';
  el.href = `${ROOT}warum/`;
  el.setAttribute('aria-label', TEXT);
  el.innerHTML = `
    <span class="frag-msg" aria-hidden="true">
      <b>Thomas</b>
      <span class="frag-typing"><i></i><i></i><i></i></span>
      <span class="frag-txt">${esc(TEXT)}</span>
    </span>
    <img class="frag-ava" src="${ROOT}img/ueber-mich/headshot.jpg" alt="" width="48" height="48">`;
  document.body.appendChild(el);

  // Schon gesehen: nur das Foto, Frage beim Überfahren
  if (seen) {
    el.classList.add('said');
    setTimeout(() => el.classList.add('in'), 600);
  } else {
    // Erstes Mal: sobald die Fußleiste ins Bild kommt
    const foot = document.querySelector('.foot');
    const first = () => {
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
      el.classList.add('in', 'open');
      if (calm) el.classList.add('said');
      else setTimeout(() => el.classList.add('said'), TYPING);
      setTimeout(() => el.classList.remove('open'), (calm ? 0 : TYPING) + STAY);
    };
    // Beim Scrollen prüfen, ob die Fußleiste im Fenster ist (auch bei schnellem Sprung ans Ende)
    const check = () => {
      if (!foot || foot.getBoundingClientRect().top > innerHeight - 10) return;
      removeEventListener('scroll', check); removeEventListener('resize', check);
      first();
    };
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    check();
  }

  // Ohne Maus (Handy): erster Tipp zeigt die Frage, zweiter führt zum Chat
  el.addEventListener('click', e => {
    if (matchMedia('(hover: hover)').matches || el.classList.contains('open')) return;
    e.preventDefault();
    el.classList.add('open', 'said');
    setTimeout(() => el.classList.remove('open'), STAY);
  });
})();
