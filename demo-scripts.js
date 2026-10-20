// Drehbücher der Demos. Ein Kapitel = { dur: Mindestdauer in ms, run: async (p) => … }.
// p ist der DemoPlayer (siehe demo-player.js): p.tap, p.type, p.scroll, p.wait, p.find, p.go, p.call …
// Jedes Kapitel muss auch direkt nach frischem Laden funktionieren (Klick auf ein Kapitel).

window.DEMO_SCRIPTS = {

  // ------------------------------------------------------------------ Kalo
  kalo: (() => {
    const css = `
      .demo-typing{display:inline-flex;gap:4px;align-items:center;height:18px}
      .demo-typing i{width:6px;height:6px;border-radius:50%;background:#94a3b8;animation:demoDot 1s infinite}
      .demo-typing i:nth-child(2){animation-delay:.15s}.demo-typing i:nth-child(3){animation-delay:.3s}
      @keyframes demoDot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
      .chat-msg{animation:demoIn .3s ease both}
      @keyframes demoIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      .demo-new{animation:demoIn .4s ease both;outline:2px solid #22c55e;outline-offset:-2px}
      .demo-toast{position:fixed;left:50%;top:18px;transform:translate(-50%,-20px);opacity:0;z-index:99;background:#fff;
        border-radius:16px;padding:12px 18px;box-shadow:0 10px 30px rgba(15,23,42,.15);font:600 15px system-ui;color:#0f172a;
        transition:all .35s ease;text-align:center}
      .demo-toast small{display:block;font-weight:500;color:#64748b;margin-top:2px}
      .demo-toast.show{opacity:1;transform:translate(-50%,0)}`;

    // Der Prototyp enthält eine versteckte Übersicht mit Kopien aller Screens – nur im sichtbaren Screen arbeiten
    const app = p => p.d.getElementById('detail-container');

    const prep = p => {
      if (!p.d.getElementById('demo-css')) {
        const s = p.d.createElement('style'); s.id = 'demo-css'; s.textContent = css; p.d.head.appendChild(s);
      }
    };

    // Zählt eine Zahl hoch/runter
    const count = (p, el, from, to, ms = 1400) => {
      const start = p.w.performance.now();
      const step = now => {
        const k = Math.min(1, (now - start) / ms), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(from + (to - from) * e);
        if (k < 1) p.w.requestAnimationFrame(step);
      };
      p.w.requestAnimationFrame(step);
    };

    // Füllt Ringe auf ihren Zielwert. Ohne "only": alle Ringe von leer.
    // Mit only = { 0: [von, bis] }: nur diese Ringe, Anteile 0..1.
    const fillRings = (p, only) => {
      const rings = [...app(p).querySelectorAll('circle[stroke-dashoffset]')];
      rings.forEach((c, i) => {
        if (only && !only[i]) return;
        const C = parseFloat(c.getAttribute('stroke-dasharray'));
        const to = only ? C * (1 - only[i][1]) : parseFloat(c.getAttribute('stroke-dashoffset'));
        const from = only ? C * (1 - only[i][0]) : C;
        c.style.transition = 'none';
        c.style.strokeDashoffset = from;
        c.getBoundingClientRect();
        c.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.2,.7,.2,1)';
        p.w.requestAnimationFrame(() => { c.style.strokeDashoffset = to; });
      });
    };

    const dashboard = async p => {
      p.call("show('dashboard')");
      prep(p);
      await p.wait(50);
    };

    return {
      chapters: [
        { // Dashboard füllt sich
          dur: 6500,
          run: async p => {
            await dashboard(p);
            fillRings(p);
            count(p, await p.find('.donut-remaining'), 2400, 930);
            const nums = app(p).querySelectorAll('.calorie-num');
            count(p, nums[1], 0, 1470); count(p, nums[2], 0, 240);
            app(p).querySelectorAll('.macro-ring-val').forEach(el => count(p, el, 0, parseInt(el.textContent)));
            await p.wait(2600);
            await p.scroll(420, 1400);
            await p.wait(800);
            await p.scroll(0, 900);
          },
        },
        { // Mahlzeit per Chat, Antwort im Ruhrpott-Ton
          dur: 15000,
          run: async p => {
            await dashboard(p);
            await p.wait(600);
            await p.tap('.calorie-stat-item', 'Verbraucht');
            prep(p);
            const card = await p.find('.chat-card');
            [...card.querySelectorAll('.chat-msg')].slice(1).forEach(m => m.remove());
            card.querySelectorAll('.meal-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
            const input = card.querySelector('.chat-input');
            input.value = '';
            const row = card.querySelector('.chat-input-row');
            const say = (cls, html) => {
              const m = p.d.createElement('div'); m.className = 'chat-msg ' + cls; m.innerHTML = html;
              card.insertBefore(m, row); return m;
            };
            await p.wait(500);
            await p.type(input, 'Haferflocken mit Banane und Milch', 55);
            await p.tap('.chat-send');
            say('user', 'Haferflocken mit Banane und Milch');
            input.value = '';
            const typing = say('bot', '<span class="demo-typing"><i></i><i></i><i></i></span>');
            await p.wait(1500);
            typing.innerHTML = 'Hömma ma, Haferflocken mit Banane – unaufgeregt, vernünftig, kein Kokolores. So geht dat!';
            await p.wait(1600);
            say('bot', '3 Sachen erkannt: Haferflocken 60 g, Banane 1 Stk, Milch 200 ml. Macht 420 kcal. Passt dat?');
            await p.wait(1400);
            await p.type(input, 'passt', 80);
            await p.tap('.chat-send');
            say('user', 'passt');
            input.value = '';
            await p.wait(500);
            const list = app(p).querySelector('.section-title');
            const item = p.d.createElement('div');
            item.className = 'fav-item demo-new';
            item.innerHTML = '<div class="fav-item-body"><div class="fav-item-name">🥣 Haferflocken mit Banane</div><div class="fav-item-meta">Frühstück · 08:10 · 3 Items</div></div><span style="color: var(--green); font-weight: 700; font-size: 14px;">420</span>';
            list.after(item);
            await p.scroll(item, 900);
          },
        },
        { // Zurück zum Dashboard, Ring wächst, Kalo freut sich
          dur: 6500,
          run: async p => {
            await dashboard(p);
            const toast = p.d.createElement('div');
            toast.className = 'demo-toast';
            toast.innerHTML = 'Eingetragen! 🍽️<small>Mahlzeit!</small>';
            p.d.body.appendChild(toast);
            await p.wait(100);
            toast.classList.add('show');
            fillRings(p, { 0: [1470 / 2400, 1890 / 2400] });
            count(p, await p.find('.donut-remaining'), 930, 510);
            count(p, app(p).querySelectorAll('.calorie-num')[1], 1470, 1890);
            await p.wait(2600);
            toast.classList.remove('show');
          },
        },
      ],
    };
  })(),

  // ------------------------------------------------------------------ Mahlzeit
  mahlzeit: (() => {
    let imported = null;
    const ready = p => p.find('#root nav, #root header, .heute, main', null, 8000);
    return {
      setup: async p => {
        imported = null;
        try { p.w.localStorage.removeItem('mahlzeit:liste:checked'); } catch (e) {}
      },
      chapters: [
        { // Instagram-Link einfügen → KI liest das Rezept
          dur: 12000,
          run: async p => {
            await ready(p);
            await p.wait(700);
            p.go('#/rezepte/import');
            const input = await p.find('.rimp input');
            await p.wait(600);
            await p.tap(input);
            await p.wait(400);
            await p.paste(input, 'https://www.instagram.com/reel/C9xFeta2/');
            await p.find('.rdet__ib', null, 9000);
            imported = p.w.location.hash.replace('#/rezepte/', '');
            await p.wait(1400);
            await p.scroll(520, 1500);
          },
        },
        { // Rezept in die Woche legen
          dur: 9000,
          run: async p => {
            await ready(p);
            p.go('#/plan');
            const add = await p.find('.plan__lib-add', 'Ofen-Feta', 3000).catch(() => p.find('.plan__lib-add'));
            await p.wait(700);
            await p.tap(add);
            const days = await p.find('.plan__sheet-day');
            await p.wait(500);
            await p.tap(p.d.querySelectorAll('.plan__sheet-day')[2] || days);
            await p.wait(1000);
            await p.tap(p.d.querySelectorAll('.plan__day')[2]);
          },
        },
        { // Einkaufsliste abhaken
          dur: 9000,
          run: async p => {
            await ready(p);
            p.go('#/liste');
            await p.find('.liste__check');
            await p.wait(900);
            for (const i of [0, 2, 3, 6]) {
              const btn = p.d.querySelectorAll('.liste__check')[i];
              if (btn) { await p.tap(btn); await p.wait(650); }
            }
          },
        },
        { // Kochmodus Schritt für Schritt
          dur: 11000,
          run: async p => {
            await ready(p);
            p.go('#/rezepte/' + (imported || 'r-curry'));
            await p.wait(1000);
            await p.tap('.rdet__cook-btn');
            await p.find('.koch__nav-btn--next');
            for (let i = 0; i < 3; i++) {
              await p.wait(1700);
              await p.tap('.koch__nav-btn--next');
            }
          },
        },
      ],
    };
  })(),

  // ------------------------------------------------------------------ Human vs. AI
  human: (() => {
    const spin = async p => {
      p.call("go('screen-start')");
      await p.wait(900);
      await p.tap('[onclick="startGame()"]');
      await p.find('#confirm-btn', null, 9000);
    };
    return {
      chapters: [
        { // Slot-Machine zieht Rolle + Fähigkeiten
          dur: 8000,
          run: async p => { await spin(p); },
        },
        { // Diskussion, Timer läuft
          dur: 9500,
          run: async p => {
            if (!p.d.querySelector('#confirm-btn')?.offsetParent) await spin(p);
            await p.wait(600);
            await p.tap('#confirm-btn');
            await p.wait(900);
            await p.tap('[onclick="setTimer(5)"]');
            await p.wait(500);
            await p.tap('#timer-toggle');
          },
        },
        { // KI-Perspektive wird aufgedeckt und getippt
          dur: 13000,
          run: async p => {
            if (!p.d.getElementById('screen-result')?.classList.contains('active')) {
              await spin(p);
              await p.tap('#confirm-btn');
              await p.wait(800);
            }
            await p.tap(`[onclick="go('screen-ai')"]`);
            await p.wait(1500);
            await p.tap('.skip-btn');
            await p.wait(9000);
            p.call('stopTimer()');
          },
        },
      ],
    };
  })(),

  // ------------------------------------------------------------------ Punktekönig
  punkte: (() => {
    const day = 86400000;
    const history = () => {
      const P = ['Spieler A', 'Spieler B', 'Spieler C', 'Spieler D'];
      const games = [
        ['flip7', [212, 168, 190, 145], 0, 7], ['uno', [88, 41, 120, 67], 1, 8], ['flip7', [176, 205, 131, 160], 1, 6],
        ['flip7', [150, 120, 201, 188], 2, 7], ['uno', [35, 77, 52, 29], 3, 4], ['flip7', [230, 199, 174, 121], 0, 8],
      ];
      return games.map(([game, scores, w, rounds], i) => ({
        id: 1700000000000 + i, ts: Date.now() - (i * 5 + 2) * day, game, players: P.slice(), scores, winner: P[w], rounds,
      }));
    };
    const rounds = [[23, 41, 12, 30], [35, 18, 40, 27], [44, 25, 31, 20]];
    return {
      setup: async p => {
        try {
          p.w.localStorage.removeItem('punkte_demo');
          p.w.localStorage.setItem('punkte_demo_history', JSON.stringify(history()));
        } catch (e) {}
      },
      chapters: [
        { // Spiel wählen: Farben wechseln mit dem Spiel
          dur: 7500,
          run: async p => {
            await p.find('.gtile');
            await p.wait(800);
            await p.tap('.gtile[data-g="uno"]');
            await p.wait(1400);
            await p.tap('.pill', '8');
            await p.wait(1100);
            await p.tap('.gtile[data-g="flip7"]');
            await p.wait(1000);
            await p.tap('.pill', '100');
          },
        },
        { // Punkte eintragen bis zum Sieg
          dur: 14000,
          run: async p => {
            if (!p.d.querySelector('#start')) { p.w.localStorage.removeItem('punkte_demo'); await p.reload(); }
            await p.tap('.gtile[data-g="flip7"]');
            await p.tap('.pill', '100');
            await p.wait(500);
            await p.tap('#start');
            await p.find('#rows input');
            await p.wait(700);
            for (let r = 0; r < rounds.length; r++) {
              for (let s = 0; s < 4; s++) {
                const inp = await p.find(`#rows input[data-r="${r}"][data-p="${s}"]`);
                const b = inp.getBoundingClientRect();
                p.ripple(b.left + b.width / 2, b.top + b.height / 2);
                await p.wait(200);
                await p.paste(inp, String(rounds[r][s]));
                await p.wait(380);
              }
              await p.wait(500);
            }
            await p.find('#overlay', null, 4000);
          },
        },
        { // Verlauf mit Fakten aus den letzten Partien
          dur: 8500,
          run: async p => {
            const again = p.d.querySelector('#newW');
            if (again) { await p.tap(again); await p.wait(700); }
            await p.tap('#verlauf');
            await p.wait(1800);
            const box = p.d.querySelector('.view:last-child .history, .view:last-child [class*="hist"]') || p.d.querySelector('.view:last-child');
            const scroller = [...box.querySelectorAll('*')].find(el => el.scrollHeight > el.clientHeight + 40 && getComputedStyle(el).overflowY !== 'visible');
            if (scroller) { await p.scroll(scroller.scrollHeight, 2600, scroller); }
          },
        },
      ],
    };
  })(),

  // ------------------------------------------------------------------ VUCA Blaster (Screenshot-Rundgang)
  vuca: {
    chapters: [
      { dur: 7500, run: async p => { await p.call("showPage('home')"); await p.wait(1200); await p.scroll(1300, 3000); await p.wait(600); await p.tapAt(1350, 1300 + 120); } },
      { dur: 7000, run: async p => { await p.call("showPage('archiv')"); await p.wait(900); await p.tapAt(480, 330); await p.wait(700); await p.scroll(700, 2200); await p.tapAt(560, 700 + 230); } },
      { dur: 6500, run: async p => { await p.call("showPage('folge')"); await p.wait(900); await p.scroll(700, 2200); await p.wait(500); await p.tapAt(150, 1470); } },
      { dur: 7000, run: async p => { await p.call("showPage('transkript')"); await p.scroll(1380, 1400); await p.wait(900); await p.scroll(2300, 4000); } },
    ],
  },

  // ------------------------------------------------------------------ Zirkusprojekt (Screenshot-Rundgang)
  zirkus: {
    chapters: [
      { dur: 7000, run: async p => { await p.call("showPage('home')"); await p.wait(1500); await p.scroll(900, 2400); await p.wait(700); await p.scroll(1500, 1800); } },
      { dur: 6500, run: async p => { await p.call("showPage('home')"); await p.scroll(2300, 2600); await p.wait(800); await p.scroll(2900, 2200); } },
      { dur: 7500, run: async p => { await p.call("showPage('spenden')"); await p.wait(1500); await p.scroll(850, 2600); await p.wait(600); await p.scroll(1500, 2200); } },
    ],
  },
};
