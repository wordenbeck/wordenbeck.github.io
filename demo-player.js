// Spielt die geskripteten Demos ab: die echte App läuft in einem iframe,
// ein Skript (demo-scripts.js) klickt, tippt und scrollt darin.
// Kapitel laufen nacheinander in Dauerschleife; ein Klick auf ein Kapitel springt dorthin.

class Aborted extends Error {}

class DemoPlayer {
  constructor({ frame, taps, chapters, script, onChapter }) {
    this.frame = frame;       // <iframe>
    this.taps = taps;         // Ebene für die Tipp-Kreise (liegt deckungsgleich über dem iframe)
    this.chapters = chapters; // Beschriftungen
    this.script = script;     // { setup?, chapters: [{ dur, run }] }
    this.onChapter = onChapter;
    this.token = 0;
    this.paused = false;
    this.visible = true;
  }

  get w() { return this.frame.contentWindow; }
  get d() { return this.frame.contentDocument; }

  // ---------- Werkzeuge für die Skripte ----------

  check(t) { if (t !== this.token) throw new Aborted(); }

  async wait(ms, t = this.token) {
    const step = 50;
    for (let left = ms; left > 0; left -= step) {
      this.check(t);
      await new Promise(r => setTimeout(r, Math.min(step, left)));
      while ((this.paused || !this.visible) && t === this.token) await new Promise(r => setTimeout(r, 150));
    }
    this.check(t);
  }

  // Wartet, bis ein Element da ist (Selektor + optional Text)
  async find(sel, text, timeout = 6000) {
    const t = this.token, end = Date.now() + timeout;
    while (Date.now() < end) {
      this.check(t);
      const list = [...(this.d?.querySelectorAll(sel) || [])].filter(el => el.offsetParent !== null || el.getClientRects().length);
      const hit = text ? list.find(el => (el.innerText || el.getAttribute('aria-label') || '').includes(text)) : list[0];
      if (hit) return hit;
      await this.wait(80, t);
    }
    throw new Error('Nicht gefunden: ' + sel + (text ? ' / ' + text : ''));
  }

  el(target, text) { return typeof target === 'string' ? this.find(target, text) : Promise.resolve(target); }

  ripple(x, y) {
    const r = document.createElement('span');
    r.className = 'tap';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    this.taps.appendChild(r);
    setTimeout(() => r.remove(), 900);
  }

  // Sichtbarer Fingertipp, dann echter Klick
  async tap(target, text) {
    const el = await this.el(target, text);
    el.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    await this.wait(250);
    const b = el.getBoundingClientRect();
    this.ripple(b.left + b.width / 2, b.top + b.height / 2);
    await this.wait(180);
    el.click();
  }

  // Fingertipp an einer festen Stelle (für Screenshot-Rundgänge)
  async tapAt(x, y) {
    const sy = this.w.scrollY || 0;
    this.ripple(x, y - sy);
    await this.wait(300);
  }

  // Tippt Text Zeichen für Zeichen – funktioniert auch mit React-Eingabefeldern
  async type(target, text, perChar = 45) {
    const el = await this.el(target);
    const proto = el.tagName === 'TEXTAREA' ? this.w.HTMLTextAreaElement.prototype : this.w.HTMLInputElement.prototype;
    const setValue = Object.getOwnPropertyDescriptor(proto, 'value').set;
    el.focus?.();
    for (let i = 1; i <= text.length; i++) {
      setValue.call(el, text.slice(0, i));
      el.dispatchEvent(new this.w.Event('input', { bubbles: true }));
      await this.wait(perChar);
    }
  }

  // Fügt Text auf einmal ein (wie Einfügen aus der Zwischenablage)
  async paste(target, text) {
    const el = await this.el(target);
    const proto = el.tagName === 'TEXTAREA' ? this.w.HTMLTextAreaElement.prototype : this.w.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, text);
    el.dispatchEvent(new this.w.Event('input', { bubbles: true }));
  }

  // Sanftes Scrollen im Dokument oder in einem Container
  async scroll(to, ms = 1200, container) {
    const t = this.token;
    const box = container || this.d.scrollingElement;
    const from = box.scrollTop, start = performance.now();
    const target = typeof to === 'number' ? to : (await this.el(to)).getBoundingClientRect().top + from - 80;
    while (true) {
      this.check(t);
      const k = Math.min(1, (performance.now() - start) / ms);
      box.scrollTop = from + (target - from) * (0.5 - Math.cos(Math.PI * k) / 2);
      if (k >= 1) break;
      await new Promise(r => setTimeout(r, 16));
    }
  }

  go(hash) { this.w.location.hash = hash; }

  call(code) { return this.w.eval(code); }

  reload() {
    return new Promise(resolve => {
      this.frame.addEventListener('load', () => resolve(), { once: true });
      this.frame.src = this.frame.dataset.src + (this.frame.dataset.src.includes('?') ? '&' : '?') + 'r=' + Date.now();
    });
  }

  // ---------- Ablauf ----------

  start(from = 0) {
    const t = ++this.token;
    this.loop(from, t).catch(e => { if (!(e instanceof Aborted)) console.warn('[Demo]', e); });
  }

  async loop(i, t) {
    let fresh = true;
    while (t === this.token) {
      if (fresh || i === 0) {
        if (this.script.setup) await this.script.setup(this);
        await this.reload();
        this.check(t);
        fresh = false;
      }
      const ch = this.script.chapters[i];
      this.onChapter(i, ch.dur);
      const began = Date.now();
      try {
        await ch.run(this);
      } catch (e) {
        if (e instanceof Aborted) throw e;
        console.warn('[Demo] Kapitel', i + 1, e);
      }
      const rest = ch.dur - (Date.now() - began);
      if (rest > 0) await this.wait(rest, t);
      i = (i + 1) % this.script.chapters.length;
    }
  }
}

window.DemoPlayer = DemoPlayer;
