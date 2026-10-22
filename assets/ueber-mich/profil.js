// „Über mich“ als Match-Karte: Profildaten, Kontakt-Knöpfe und das Match-Fenster.
// Zahlen und Slogan kommen aus content.js.
(() => {
  const { C, esc, projects, ROOT, lang } = V2;
  const A = C.about[lang] || C.about.de;
  const T = {
    de: { you: 'Sie', meet: 'Sie und Thomas wollen sich kennenlernen.', next: 'Der nächste Schritt ist ganz einfach: ein kurzes Gespräch.',
      linkedin: 'Auf LinkedIn vernetzen', mail: 'Nachricht schicken', back: 'Profil weiter ansehen', built: 'eigene Produkte gebaut',
      subject: 'Hallo Thomas – über dein Portfolio', body: 'Hallo Thomas, it\'s a match. Lass uns sprechen.\n\n' },
    en: { you: 'You', meet: 'You and Thomas want to get to know each other.', next: 'The next step is simple: a short conversation.',
      linkedin: 'Connect on LinkedIn', mail: 'Send a message', back: 'Keep viewing the profile', built: 'own products built',
      subject: 'Hi Thomas – about your portfolio', body: 'Hi Thomas, it\'s a match. Let\'s talk.\n\n' },
  }[lang] || {};

  const ME = {
    foto: `${ROOT}img/ueber-mich/headshot.jpg`,
    name: 'Thomas Wordenbeck',
    vorname: 'Thomas',
    slogan: C[lang].role,
    zahlen: [
      ...A.numbers.map(n => ({ v: n.value, l: n.label })),
      { v: projects.length, l: T.built },
    ],
    linkedin: C.linkedin,
    lebenslauf: `${ROOT}lebenslauf/`,
  };

  // E-Mail erst beim Klick zusammensetzen (Adresse steht nicht lesbar im Seitencode)
  const mail = (subject = T.subject, body = '') => {
    location.href = `mailto:${['thomas.wordenbeck', 'gmail.com'].join('@')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const I = {
    doc: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    in: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.92 1.3-1.92 2.63V21h-4z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  };

  // Kontakt-Knöpfe (LinkedIn + E-Mail), überall gleich
  const contactButtons = (body = '') => `
    <a class="btn primary" href="${ME.linkedin}" target="_blank" rel="noopener">${I.in}<span>${esc(T.linkedin)}</span></a>
    <button class="btn glass js-mail" type="button" data-body="${esc(body)}">${I.mail}<span>${esc(T.mail)}</span></button>`;
  document.addEventListener('click', e => {
    const b = e.target.closest('.js-mail');
    if (b) mail(b.dataset.subject || undefined, b.dataset.body || '');
  });

  // Match-Fenster
  function overlays() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="ov" id="ov-match" hidden>
        <div class="ov-in">
          <p class="ov-kicker">It's a Match!</p>
          <div class="pair"><i class="glow"></i><span class="you">${esc(T.you)}</span><img src="${ME.foto}" alt=""><i class="burst"></i></div>
          <h2>${esc(T.meet)}</h2>
          <p class="ov-text">${esc(T.next)}</p>
          <div class="ov-cta">${contactButtons(T.body)}</div>
          <button class="ov-back" type="button" data-close>${esc(T.back)}</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    // Beim Match: kurzer Funkenregen hinter den beiden Bildern (ruhige Farben, einmalig)
    const sparks = () => {
      const b = wrap.querySelector('.burst'); if (!b) return;
      const cols = ['#30d158', '#2997ff', '#ffffff', '#ffd60a'];
      b.innerHTML = Array.from({ length: 34 }, (_, i) => {
        const a = (i / 34) * Math.PI * 2 + Math.random() * .3, d = 110 + Math.random() * 90;
        return `<b style="--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d * .8}px;--r:${Math.random() * 360}deg;--d:${(Math.random() * .15).toFixed(2)}s;background:${cols[i % cols.length]}"></b>`;
      }).join('');
    };
    const open = id => { const o = document.getElementById(id); if (id === 'ov-match') sparks(); o.hidden = false; requestAnimationFrame(() => o.classList.add('in')); };
    const close = () => document.querySelectorAll('.ov').forEach(o => { o.classList.remove('in'); setTimeout(() => { o.hidden = true; }, 300); });
    wrap.addEventListener('click', e => {
      if (e.target.closest('[data-close]') || e.target.classList.contains('ov')) { close(); document.dispatchEvent(new Event('ov-close')); }
      if (e.target.closest('[data-again]')) { close(); document.dispatchEvent(new Event('ov-again')); }
    });
    return { match: () => open('ov-match'), close };
  }

  window.ME = ME;
  window.MeUI = { I, mail, contactButtons, overlays, esc };
})();
