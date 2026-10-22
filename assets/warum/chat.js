// „Warum diese Seite“ als Messenger-Chat (Deutsch und Englisch).
// Nachrichten erscheinen beim Scrollen. Thomas' Antworten kommen nacheinander mit Tipp-Indikator,
// ohne dass man weiter scrollen muss. Am Ende erscheint eine Eingabeleiste mit LinkedIn und Nachricht.
// Kopf, Fuß und Hell/Dunkel kommen aus assets/glas-ui.js, die Seite bleibt vollständig frei scrollbar.
(() => {
  const { esc, C, ROOT, calm, lang } = V2;
  const { mount } = GlasUI;

  // Gesprächsverlauf – Text und Aufteilung wie von Thomas vorgegeben, Englisch übersetzt
  const CHATS = {
    de: [
    { sender: 'visitor', messages: ['Nette Produkte. Aber mal ehrlich: Wie kommt es dazu, dass du diese selbst baust?'] },
    { sender: 'thomas', messages: [
      'Initial war das pure Neugier.',
      'Ich wollte einfach ausprobieren, was mit KI wie Claude Code heute *wirklich* geht – jenseits der ganzen LinkedIn-Posts.',
    ] },
    { sender: 'visitor', messages: ['Und? Hast du damit jetzt bewiesen, dass ab sofort jeder zum Entwickler wird und eigene Produkte baut?'] },
    { sender: 'thomas', thinkMs: 1000, messages: [
      'Nee, überhaupt nicht. Ehrlich gesagt halte ich das für eine ziemliche Bubble.',
      'Das wird kein Massending, bei dem plötzlich jeder Software-Architekt spielt.',
      'Aber was ich schon glaube: Wir erleben gerade den Start von **Hyper-Individualisierung**.',
    ] },
    { sender: 'visitor', messages: ['Was meinst du damit?'] },
    { sender: 'thomas', messages: [
      'Schau dir meine Projekte hier an. Das sind keine Weltneuheiten.',
      'Es sind Lösungen für Dinge, die es so schon gibt – aber eben zu 100 % auf meinen Alltag und meinen Kopf zugeschnitten.',
      'Bin ich dadurch ein Entwickler? Nein.',
      'Aber eigene kleine Webseiten und funktionierende Tools traue ich mir heute komplett selbst zu. Es ist einfach ein unfassbar starkes Werkzeug.',
    ] },
    { sender: 'visitor', messages: ['Okay, cool für deine Freizeit-Projekte. Aber was hat das mit deinem eigentlichen Job zu tun?'] },
    { sender: 'thomas', messages: [
      'Extrem viel.',
      'Ich arbeite seit fast 20 Jahren genau an der Schnittstelle zwischen den Leuten, die eine Idee haben, und den Teams, die sie bauen.',
      'Und ein Problem ist in den 20 Jahren immer gleich geblieben: **Was jemand meint und was am Ende gebaut wird, ist selten dasselbe.**',
    ] },
    { sender: 'visitor', messages: ['Der Klassiker. Und was ändert sich jetzt durch KI?'] },
    { sender: 'thomas', messages: [
      'Vieles. Zum Beispiel löst es das **„Leere-Blatt-Papier-Problem“**.',
      'Früher saßen alle vor einem Textdokument und haben gerätselt: *Wo starten wir? Wie sieht der erste Screen aus?* Damals habe ich mir mit MS Paint oder PowerPoint-Klickdummys geholfen, damit wir überhaupt ein gemeinsames Bild hatten.',
      'Heute sage ich der KI: *„Bau mir 5 unterschiedliche Prototypen für genau diesen Ablauf.“*',
      'Das kostet fast nichts, man kann sich sofort durchklicken und wir validieren in **Minuten statt in Monaten**.',
    ] },
    { sender: 'visitor', messages: ['Wenn Bauen und Ausprobieren fast nichts mehr kosten – wo liegt dann heute überhaupt noch die echte Arbeit?'] },
    { sender: 'thomas', messages: [
      'Der Engpass verschiebt sich komplett.',
      'Was jetzt zählt, sind Urteilskraft und Geschmack:',
      '**Die richtigen Fragen stellen. Was lassen wir bewusst weg? Wo stolpert der Nutzer? Wo entsteht wirklich Wert?**',
    ] },
    { sender: 'visitor', messages: ['Klingt, als wäre die Zukunft dann das „Ein-Mann-Produktteam“ – einer, der alles weiß, alles entscheidet und mit KI alles alleine baut?'] },
    { sender: 'thomas', typingDelayMs: 800, messages: [
      'Genau das glaube ich eben nicht. 😉',
      'Für ein kleines Tool für mich allein reicht das. Aber **richtig gute Produkte** entstehen nur durch Reibung, Iteration und unterschiedliche Perspektiven. Sie brauchen den echten Austausch mit echten Menschen.',
      'Und genau deshalb sollten wir jetzt auch aufhören, hier einen Chat zu simulieren. Lass uns den Dialog im echten Leben fortsetzen.',
    ] },
  ],
    en: [
    { sender: 'visitor', messages: ['Nice products. But honestly: how did you end up building them yourself?'] },
    { sender: 'thomas', messages: [
      'It started out as pure curiosity.',
      'I just wanted to try out what AI like Claude Code can *really* do today – beyond all the LinkedIn posts.',
    ] },
    { sender: 'visitor', messages: ['And? Have you now proven that from now on everyone becomes a developer and builds their own products?'] },
    { sender: 'thomas', thinkMs: 1000, messages: [
      'Nope, not at all. Honestly, I think that’s quite a bubble.',
      'This won’t become a mass thing where suddenly everyone plays software architect.',
      'But here’s what I do believe: we’re seeing the start of **hyper-individualisation**.',
    ] },
    { sender: 'visitor', messages: ['What do you mean by that?'] },
    { sender: 'thomas', messages: [
      'Take a look at my projects here. None of them are world firsts.',
      'They’re solutions for things that already exist – but tailored 100 % to my everyday life and the way I think.',
      'Does that make me a developer? No.',
      'But these days I’m fully confident building my own small websites and working tools. It’s simply an incredibly powerful tool.',
    ] },
    { sender: 'visitor', messages: ['Okay, nice for your side projects. But what does that have to do with your actual job?'] },
    { sender: 'thomas', messages: [
      'A lot.',
      'For almost 20 years I’ve worked right at the interface between the people who have an idea and the teams who build it.',
      'And one problem has stayed the same in all those 20 years: **what someone means and what ends up being built are rarely the same thing.**',
    ] },
    { sender: 'visitor', messages: ['The classic. And what changes now with AI?'] },
    { sender: 'thomas', messages: [
      'A lot. For example, it solves the **blank page problem**.',
      'Everyone used to sit in front of a text document and wonder: *Where do we start? What does the first screen look like?* Back then I used MS Paint or PowerPoint click dummies so we had a shared picture at all.',
      'Today I tell the AI: *“Build me 5 different prototypes for exactly this flow.”*',
      'It costs almost nothing, you can click through right away and we validate in **minutes instead of months**.',
    ] },
    { sender: 'visitor', messages: ['If building and trying things out costs next to nothing – where is the real work these days?'] },
    { sender: 'thomas', messages: [
      'The bottleneck shifts completely.',
      'What counts now is judgement and taste:',
      '**Asking the right questions. What do we deliberately leave out? Where does the user stumble? Where is real value created?**',
    ] },
    { sender: 'visitor', messages: ['Sounds like the future is the “one-person product team” – someone who knows everything, decides everything and builds it all alone with AI?'] },
    { sender: 'thomas', typingDelayMs: 800, messages: [
      'That’s exactly what I don’t believe. 😉',
      'For a small tool just for me, that’s enough. But **really good products** only come from friction, iteration and different perspectives. They need real exchange with real people.',
      'And that’s exactly why we should stop simulating a chat here. Let’s continue the conversation in real life.',
    ] },
    ],
  };
  const CHAT = CHATS[lang] || CHATS.de;

  // Texte rund um den Chat
  const T = {
    de: { title: 'Warum diese Seite – Thomas Wordenbeck', label: 'Warum diese Seite', profile: 'Profil ansehen', today: 'Heute',
      typing: 'schreibt gerade …', linkedin: 'Auf LinkedIn vernetzen', mail: 'Nachricht schicken',
      draft: 'Guter Punkt, Thomas. Lass uns mal im echten Leben sprechen...', subject: 'Hallo Thomas – über dein Portfolio' },
    en: { title: 'Why this site – Thomas Wordenbeck', label: 'Why this site', profile: 'View profile', today: 'Today',
      typing: 'typing …', linkedin: 'Connect on LinkedIn', mail: 'Send a message',
      draft: 'Good point, Thomas. Let’s talk in real life...', subject: 'Hi Thomas – about your portfolio' },
  }[lang] || {};
  document.title = T.title;

  const DRAFT = T.draft;
  // E-Mail: Adresse erst beim Klick zusammensetzen, damit sie nicht lesbar im Seitencode steht (weniger Spam)
  const MAIL_PARTS = ['thomas.wordenbeck', 'gmail.com'];
  const MAIL_SUBJECT = T.subject;
  // Natürliches Tempo: kurze Sätze schnell getippt, lange dauern länger – jeweils mit etwas Zufall
  const rnd = (a, b) => a + Math.random() * (b - a);
  const typingFor = text => Math.min(1350, Math.max(420, 280 + text.length * 7)) * rnd(.85, 1.15);
  // Abstand bis zur nächsten Bubble einer Gruppe: nach der ersten länger überlegen,
  // in der Mitte wechselnd, die letzte kommt bei langen Blöcken wieder zügiger hinterher
  const gapAfter = (k, n) => {
    if (n === 2) return rnd(500, 800);
    if (k === 0) return rnd(650, 1000);
    if (k === n - 2 && n >= 4) return rnd(200, 380);
    return rnd(450, 750);
  };
  const FADE = 200;                  // Einblenden einer Bubble
  const START = 700;                 // Pause, bevor das Gespräch beginnt
  const READ = 650;                  // Lesepause zwischen zwei Gruppen

  // *kursiv* – erst maskieren, dann formatieren. **fett** bewusst ohne Hervorhebung (ruhigeres Lesen)
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Uhrzeit: die echte aktuelle Zeit, gesetzt in dem Moment, in dem die Nachricht erscheint
  const now = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const CHECKS = '<svg viewBox="0 0 18 11" width="16" height="10" aria-hidden="true"><path d="M1 5.5 4.5 9 11 1.5M7 9l.5.5L15.5 1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SEND = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>';
  const MAIL_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';

  const groups = CHAT.map((g, i) => `
    <div class="grp ${g.sender}" data-g="${i}">
      ${g.messages.map((m, k) => {
        const last = k === g.messages.length - 1;
        // Thomas: jede Nachricht mit Uhrzeit und zwei blauen Häkchen. Besucher: Uhrzeit an der letzten Nachricht.
        const meta = g.sender === 'thomas' ? `<span class="meta"><time>00:00</time>${CHECKS}</span>`
          : last ? `<span class="meta"><time>00:00</time></span>` : '';
        return `<div class="slot${last ? ' last' : ''}${k === 0 ? ' first' : ''}"><p class="bubble">${md(m)}${meta}</p></div>`;
      }).join('')}
    </div>`).join('');

  mount(`
    <main class="chat-page">
      <section class="chat" aria-label="${esc(T.label)}">
        <header class="chat-head">
          <a class="who-link" href="${ROOT}ueber-mich/" title="${esc(T.profile)}">
            <img class="avatar" src="${ROOT}favicon.svg" alt="" width="40" height="40">
            <div><strong>Thomas</strong><span class="presence" id="presence">online</span></div>
          </a>
        </header>
        <div class="log" id="log" aria-live="polite">
          <p class="day">${esc(T.today)}</p>
          ${groups}
        </div>
        <div class="composer" id="composer" aria-hidden="true">
          <div class="field"><span class="draft">${esc(DRAFT)}</span><span class="caret"></span></div>
          <div class="cta">
            <a class="btn primary" href="${C.linkedin}" target="_blank" rel="noopener">${SEND}<span>${esc(T.linkedin)}</span></a>
            <a class="btn glass" id="mail" href="#kontakt">${MAIL_ICON}<span>${esc(T.mail)}</span></a>
          </div>
        </div>
      </section>
    </main>`, '');

  document.getElementById('mail').addEventListener('click', e => {
    e.preventDefault();
    location.href = `mailto:${MAIL_PARTS.join('@')}?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(DRAFT.replace(/\.\.\.$/, '.') + '\n\n')}`;
  });

  // Nachricht zeigen und dabei die aktuelle Uhrzeit eintragen
  const show = slot => { const t = slot.querySelector('time'); if (t) t.textContent = now(); slot.classList.add('shown'); };

  const presence = document.getElementById('presence');
  const composer = document.getElementById('composer');
  const grpEls = [...document.querySelectorAll('.grp')];
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // Alles sofort zeigen (ohne Bewegung gewünscht)
  if (calm) {
    document.querySelectorAll('.slot').forEach(s => show(s));
    composer.classList.add('shown'); composer.removeAttribute('aria-hidden');
    return;
  }

  // Tipp-Indikator an der Stelle der nächsten Bubble
  const showTyping = slot => {
    const dots = document.createElement('span');
    dots.className = 'typing';
    dots.innerHTML = '<i></i><i></i><i></i>';
    slot.appendChild(dots);
    presence.textContent = T.typing;
    presence.classList.add('busy');
    return () => { dots.remove(); presence.textContent = 'online'; presence.classList.remove('busy'); };
  };

  // Gruppen nacheinander abspielen. Kommen mehrere gleichzeitig ins Bild (schnelles Scrollen), geht es zügiger.
  const queue = [];
  let running = false, next = 0;
  let started = false;
  async function play() {
    if (running) return;
    running = true;
    if (!started) { started = true; await wait(START); }
    while (queue.length) {
      const g = queue.shift();
      const data = CHAT[+g.dataset.g];
      // Nur zügiger, wenn der Leser schon an dieser Gruppe vorbeigescrollt ist
      const hurry = g.getBoundingClientRect().bottom < 0;
      const slots = [...g.querySelectorAll('.slot')];
      for (let k = 0; k < slots.length; k++) {
        if (data.sender === 'thomas') {
          if (k === 0 && data.thinkMs && !hurry) await wait(data.thinkMs);   // erst überlegen, dann tippen
          // erste Rückmeldung kommt zügig (wie gehabt), danach Tempo nach Textlänge
          const ms = k === 0 ? (data.typingDelayMs || rnd(380, 520)) : typingFor(data.messages[k]);
          const stop = showTyping(slots[k]);
          await wait(hurry ? ms / 3 : ms);
          stop();
        }
        show(slots[k]);
        await wait(FADE);
        if (k < slots.length - 1) { const gap = gapAfter(k, slots.length); await wait(hurry ? gap / 3 : gap); }
      }
      if (+g.dataset.g === CHAT.length - 1) {
        await wait(400);
        composer.classList.add('shown');
        composer.removeAttribute('aria-hidden');
      } else if (!hurry) {
        await wait(READ);
      }
    }
    running = false;
  }

  // Eine Gruppe startet, sobald ihr oberer Rand die unteren 30 % des Fensters verlässt – oder schon darüber liegt
  // (schnelles Scrollen, Sprung ans Ende). Immer in Reihenfolge, nie übersprungen.
  let ticking = false;
  const check = () => {
    ticking = false;
    const line = innerHeight * 0.7;
    while (next < grpEls.length && grpEls[next].getBoundingClientRect().top < line) queue.push(grpEls[next++]);
    play();
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(check); } }, { passive: true });
  addEventListener('resize', check);
  check();
})();
