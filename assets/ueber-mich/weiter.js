// Spielerei „Weitersuchen“: Rückfrage im Stil von Windows 95.
// „Nein“ füllt sich und klickt am Ende von selbst (wie die Rückfragen bei Google Maps).
// „Ja“ lässt sich nicht erwischen: Bei jedem Öffnen flieht es zufällig anders (weghüpfen, Plätze tauschen, Sanduhr).
(() => {
  const WAIT = 8000;          // so lange läuft die Nein-Taste
  const GIVE_UP = 6;          // nach so vielen Versuchen verabschiedet sich „Ja“
  const MODES = ['hop', 'swap', 'busy'];
  const BUSY = ['Ja ist gerade beschäftigt …', 'Bitte warten …', 'Ja installiert Updates (3 von 117) …', 'Fast fertig …'];

  const ICONS = {
    q: '<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="#fff" stroke="#000080" stroke-width="2"/><path d="M12 12.5a4 4 0 1 1 5.6 3.7c-1 .5-1.6 1.3-1.6 2.4V20" fill="none" stroke="#000080" stroke-width="2.6" stroke-linecap="round"/><circle cx="16" cy="24" r="1.7" fill="#000080"/></svg>',
    x: '<svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" stroke-width="1.8"/></svg>',
    glass: '<svg class="hourglass" viewBox="0 0 12 16" width="12" height="16" aria-hidden="true"><path d="M1 1h10M1 15h10M2 1c0 5 4 5 4 7S2 10 2 15M10 1c0 5-4 5-4 7s4 2 4 7" fill="none" stroke="#000" stroke-width="1.4"/><path d="M3.5 3h5L6 6.5zM3 14.2 6 11l3 3.2z" fill="#000080"/></svg>',
  };

  let wrap = null, mode = null;
  const close = () => { if (!wrap) return; const w = wrap; wrap = null; w.classList.remove('in'); setTimeout(() => w.remove(), 200); };
  const no = () => { close(); document.dispatchEvent(new Event('ov-again')); };

  // Wird „Ja“ doch erwischt (z. B. per Tastatur): freundliche Fehlermeldung
  const error = dlg => {
    dlg.querySelector('.dlg-body p').textContent = 'Fehler 404: Kein besseres Profil gefunden.';
    dlg.querySelector('.dlg-btns').innerHTML = '<button class="dlg-no ok" type="button"><span class="lbl">OK</span></button>';
    dlg.querySelector('.dlg-no').focus();
  };

  const runaway = dlg => {
    const yes = dlg.querySelector('.dlg-yes'), btnNo = dlg.querySelector('.dlg-no'), status = dlg.querySelector('.dlg-status');
    let tries = 0, last = 0, done = false;
    const wait = ms => { const t = performance.now(); if (t - last < ms) return false; last = t; return true; };
    const box = () => yes.getBoundingClientRect();

    // Abschied: „Ciao“ und aus dem Fenster fallen
    const bye = () => {
      done = true; yes.textContent = 'Ciao'; yes.classList.remove('busy'); yes.classList.add('fall');
      status.textContent = '';
      setTimeout(() => yes.remove(), 900);
    };

    const FLEE = {
      // springt an eine zufällige Stelle im Fenster, weit weg vom Zeiger und nie auf die Nein-Taste
      hop(px, py) {
        const d = dlg.getBoundingClientRect(), b = box(), n = btnNo.getBoundingClientRect();
        if (!yes.classList.contains('free')) {
          yes.style.left = `${b.left - d.left}px`; yes.style.top = `${b.top - d.top}px`;
          yes.classList.add('free'); void yes.offsetWidth;
        }
        if (++tries > GIVE_UP) return bye();
        let best = null;
        for (let i = 0; i < 40; i++) {
          const x = 8 + Math.random() * (d.width - b.width - 16), y = 30 + Math.random() * (d.height - b.height - 38);
          const l = d.left + x, t = d.top + y;
          if (l < n.right + 8 && l + b.width > n.left - 8 && t < n.bottom + 8 && t + b.height > n.top - 8) continue;
          const dist = Math.hypot(l + b.width / 2 - px, t + b.height / 2 - py);
          if (!best || dist > best.dist) best = { x, y, dist };
          if (dist > 160) break;
        }
        if (best) { yes.style.left = `${best.x}px`; yes.style.top = `${best.y}px`; }
      },
      // tauscht blitzschnell den Platz mit „Nein“
      swap() {
        if (!wait(380)) return;
        if (++tries > GIVE_UP) return bye();
        const a = box(), b = btnNo.getBoundingClientRect();
        yes.style.order = yes.style.order === '2' ? '' : '2';
        const a2 = box(), b2 = btnNo.getBoundingClientRect();
        const ease = { duration: 220, easing: 'cubic-bezier(.2,1.3,.4,1)' };
        yes.animate([{ transform: `translateX(${a.left - a2.left}px)` }, { transform: 'none' }], ease);
        btnNo.animate([{ transform: `translateX(${b.left - b2.left}px)` }, { transform: 'none' }], ease);
      },
      // ist „beschäftigt“, mit Sanduhr und Meldung
      busy() {
        if (yes.classList.contains('busy')) return;
        if (++tries > BUSY.length) return bye();
        yes.classList.add('busy');
        status.innerHTML = `${ICONS.glass}<span>${BUSY[tries - 1]}</span>`;
        setTimeout(() => { if (done) return; yes.classList.remove('busy'); status.textContent = ''; }, 2600);
      },
    };

    const flee = (x, y) => { if (!done && yes.isConnected) FLEE[mode](x, y); };
    wrap.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || done) return;
      const b = box();
      if (e.clientX > b.left - 34 && e.clientX < b.right + 34 && e.clientY > b.top - 30 && e.clientY < b.bottom + 30) flee(e.clientX, e.clientY);
    });
    // Auf dem Handy: beim Antippen fliehen
    yes.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse') return;
      e.preventDefault(); flee(e.clientX, e.clientY);
    });
    yes.addEventListener('click', e => {
      e.stopPropagation();
      if (done || yes.classList.contains('busy')) return;
      error(dlg);
    });
  };

  const open = () => {
    if (wrap) return;
    // jedes Mal eine andere Fluchtart als beim letzten Mal
    const rest = MODES.filter(m => m !== mode);
    mode = rest[Math.floor(Math.random() * rest.length)];
    wrap = document.createElement('div');
    wrap.className = 'dlg-wrap';
    wrap.innerHTML = `
      <div class="dlg" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t">
        <div class="dlg-bar"><span id="dlg-t">Weitersuchen.exe</span><button class="dlg-x" type="button" aria-label="Schließen">${ICONS.x}</button></div>
        <div class="dlg-body"><span class="dlg-q">${ICONS.q}</span><p>Sind Sie sicher, dass Sie weitersuchen möchten?</p></div>
        <div class="dlg-btns">
          <p class="dlg-status" aria-live="polite"></p>
          <button class="dlg-yes" type="button">Ja</button>
          <button class="dlg-no" type="button"><span class="fill" style="animation-duration:${WAIT}ms"></span><span class="lbl">Nein, Thomas zurückholen</span></button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap && wrap.classList.add('in'));
    const dlg = wrap.querySelector('.dlg');
    dlg.querySelector('.dlg-no').focus();
    runaway(dlg);
    dlg.addEventListener('click', e => {
      if (e.target.closest('.dlg-x')) close();
      else if (e.target.closest('.dlg-no')) no();
    });
    // Taste abgelaufen: automatisch „Nein“
    dlg.querySelector('.fill').addEventListener('animationend', () => { if (wrap && wrap.contains(dlg)) no(); });
  };

  document.getElementById('more').addEventListener('click', open);
  addEventListener('keydown', e => { if (e.key === 'Escape' && wrap) close(); });
})();
