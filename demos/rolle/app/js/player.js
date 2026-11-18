// Fahr-Engine: läuft jede Sekunde, schickt dem Trainer die Ziel-Watt (ERG) bzw. Steigung (frei),
// zeichnet alles auf und rechnet am Ende das Ergebnis aus (inkl. FTP bei Tests).

import { simGrade, gearFor } from './shifting.js';

export const ERG_STEP = 10; // Watt je Schalter-Druck, wenn die Tasten frei sind (18.11.: 5 W war kaum spürbar)

export const ANNOUNCE = 15; // Sekunden Vorwarnung vor einem Wechsel

export class Player extends EventTarget {
  constructor(workout, { trainer, ftp, tickMs = 1000 }) {
    super();
    this.w = workout; this.trainer = trainer; this.ftp = ftp; this.tickMs = tickMs;
    this.t = 0; this.i = 0; this.segT = 0;
    this.paused = false; this.done = false;
    this.offset = 0;          // Watt-Korrektur über die Schalter (ERG)
    this.gear = 11;           // virtueller Gang (frei)
    this.live = { power: 0, cadence: 0, speed: 0 };
    this.samples = [];        // [t, soll, watt, kadenz, abschnitt]
    this.sent = null;
    this.lowCad = 0;
    this.startedAt = new Date();
    this.rampEnd = null;
  }
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }

  get seg() { return this.w.segs[this.i]; }
  get next() { return this.w.segs[this.i + 1]; }
  get isRamp() { return this.w.typ === 'ramp'; }
  get inRampSteps() { return this.isRamp && !!this.seg.stufe; }

  target() {
    const s = this.seg;
    return Math.max(0, Math.round(s.von + (s.bis - s.von) * (this.segT / s.dauer)) + (s.frei ? 0 : this.offset));
  }
  remaining() {
    if (this.isRamp && !this.rampEnd) return null; // unbekannt, solange die Stufen laufen
    return this.w.segs.slice(this.i).reduce((s, x) => s + x.dauer, 0) - this.segT;
  }

  start() {
    if (this.seg.frei) this.gear = gearFor(this.seg.von);
    this.apply();
    this.timer = setInterval(() => this.tick(), this.tickMs);
    this.emit('tick');
  }

  onData(d) { Object.assign(this.live, d); }

  send(kind, val) {
    if (this.sent && this.sent.kind === kind && Math.abs(this.sent.val - val) < (kind === 'sim' ? 0.1 : 1)) return;
    this.sent = { kind, val };
    if (kind === 'erg') this.trainer.setTargetPower(val); else this.trainer.setSimulation(val);
  }
  resend() { this.sent = null; this.apply(); }

  apply() {
    if (this.done) return;
    const s = this.seg;
    if (this.paused) return this.send('sim', 0);
    if (s.frei) {
      const grade = simGrade({ cadence: this.live.cadence, gear: this.gear, roadGrade: 0, mass: 80, realRatio: 34 / 14, trainerMass: 75 });
      return this.send('sim', Math.round(grade * 10) / 10);
    }
    this.send('erg', this.target());
  }

  tick() {
    if (this.done) return;
    if (!this.paused) {
      this.t++; this.segT++;
      const soll = this.seg.frei ? null : this.target();
      this.samples.push([this.t, soll, Math.round(this.live.power || 0), Math.round(this.live.cadence || 0), this.i, this.segT]);

      // Ramp: hört die Trittfrequenz auf, ist der Test vorbei
      if (this.inRampSteps && this.seg.stufe > 2) {
        this.lowCad = (this.live.cadence || 0) < 40 ? this.lowCad + 1 : 0;
        if (this.lowCad >= 8) { this.stopRamp('Trittfrequenz zu niedrig'); return; }
      }
      if (this.segT >= this.seg.dauer) this.advance();
    }
    this.apply();
    this.emit('tick');
  }

  advance() {
    if (this.i >= this.w.segs.length - 1) return this.finish();
    if (this.inRampSteps && this.next?.ausrollen) return this.stopRamp('alle Stufen geschafft');
    const wasFrei = this.seg.frei;
    this.i++; this.segT = 0;
    // Beginn eines Selbst-schalten-Blocks: Startgang passend zum Richtwert (bei 90 U/min), danach schaltest du selbst
    if (this.seg.frei && !wasFrei) this.gear = gearFor(this.seg.von);
    this.emit('segment');
  }

  skip() { if (this.inRampSteps) return this.stopRamp('manuell'); this.advance(); this.apply(); this.emit('tick'); }

  stopRamp(reason) {
    if (!this.inRampSteps) return;
    this.rampEnd = { t: this.t, stufe: this.seg.stufe, reason };
    this.i = this.w.segs.findIndex(s => s.ausrollen); this.segT = 0; this.offset = 0;
    this.emit('segment'); this.apply(); this.emit('tick');
  }

  togglePause() { this.paused = !this.paused; this.apply(); this.emit('tick'); }
  adjust(delta) {
    if (this.seg.frei) this.gear = Math.max(0, Math.min(23, this.gear + delta));
    else this.offset += delta * ERG_STEP;
    this.apply(); this.emit('tick');
  }

  finish(aborted = false) {
    if (this.done) return;
    this.done = true; this.aborted = aborted;
    clearInterval(this.timer);
    this.trainer.setSimulation?.(0);
    this.emit('done', this.result());
  }

  // ---------- Auswertung ----------
  result() {
    const s = this.samples;
    const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const bySeg = new Map();
    for (const x of s) { if (!bySeg.has(x[4])) bySeg.set(x[4], []); bySeg.get(x[4]).push(x); }
    const abschnitte = [...bySeg].map(([i, xs]) => ({
      name: this.w.segs[i].name, dauer: xs.length,
      soll: this.w.segs[i].frei ? null : avg(xs.map(x => x[1])),
      watt: avg(xs.map(x => x[2])), kadenz: avg(xs.filter(x => x[3] > 0).map(x => x[3])),
    }));
    const res = {
      dauer: this.t, watt: avg(s.map(x => x[2])), kadenz: avg(s.filter(x => x[3] > 0).map(x => x[3])),
      abschnitte, abgebrochen: !!this.aborted,
    };
    if (this.isRamp) {
      const steps = s.filter(x => this.w.segs[x[4]].stufe);
      let best = 0;
      for (let k = 60; k <= steps.length; k++) best = Math.max(best, avg(steps.slice(k - 60, k).map(x => x[2])));
      res.test = { art: 'ramp', beste_minute: best, ftp: best ? Math.round(best * 0.75) : null, letzte_stufe: this.rampEnd?.stufe ?? null, ende: this.rampEnd?.reason ?? null };
    }
    if (this.w.typ === 'ftp20') {
      const m = s.filter(x => this.w.segs[x[4]].messung);
      const full = m.length >= 1140; // mind. 19 Minuten gefahren
      const a = avg(m.map(x => x[2]));
      res.test = { art: 'ftp20', schnitt_20min: a, ftp: full && a ? Math.round(a * 0.95) : null, vollstaendig: full };
    }
    return res;
  }
}
