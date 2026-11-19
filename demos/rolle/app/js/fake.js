// Demo-Trainer und Tastatur als Schalter: gleiche Schnittstelle wie KICKR und Ride.
// Damit lässt sich die App ohne Rad testen (Adresse mit ?demo öffnen).

import { speedFrom } from './shifting.js';

export class FakeTrainer extends EventTarget {
  constructor({ failAt = 300, speedup = 1 } = {}) {
    super();
    this.power = 0; this.cadence = 0; this.mode = 'sim'; this.target = 0; this.grade = 0;
    this.failAt = failAt;      // ab diesen Watt „gibt der Fahrer auf“ (für den Ramp-Test)
    this.overload = 0;
    this.speedup = speedup;
    this.connected = false;
  }
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }

  async connect() {
    this.connected = true;
    this.timer = setInterval(() => this.tick(), 1000 / this.speedup);
    this.emit('status', 'verbunden');
    return 'Demo-Trainer';
  }

  tick() {
    const hard = this.mode === 'erg' && this.target >= this.failAt;
    this.overload = hard ? this.overload + 1 : Math.max(0, this.overload - 2);
    const baseCad = 90 - Math.max(0, this.overload - 15) * 6;
    this.cadence = Math.max(0, baseCad + (Math.random() - .5) * 1);
    let want = 0;
    if (this.mode === 'erg') want = this.cadence > 30 ? this.target : this.target * this.cadence / 60;
    if (this.mode === 'sim') want = 75 * 9.81 * Math.max(0.005, this.grade / 100 + 0.005) * speedFrom(this.cadence, 34 / 14);
    this.power += (want - this.power) * 0.35;
    this.emit('data', { power: Math.max(0, Math.round(this.power + (Math.random() - .5) * 1.5)), cadence: Math.round(this.cadence), speed: speedFrom(this.cadence, 34 / 14) * 3.6 });
  }

  async setTargetPower(w) { this.mode = 'erg'; this.target = w; }
  async setSimulation(g) { this.mode = 'sim'; this.grade = g; }
  disconnect() { clearInterval(this.timer); this.connected = false; this.emit('status', 'getrennt'); }
}

// Tastatur: ↑ = Schalter rechts (hoch), ↓ = Schalter links (runter), Leertaste = A (Pause), S = Y (überspringen)
export class KeyboardController extends EventTarget {
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }
  async connect() {
    this.onKey = e => {
      if (e.target.closest?.('input, select, textarea, button')) return;
      const map = { ArrowUp: 'shiftUpR', ArrowDown: 'shiftDownL', ArrowRight: 'navRight', ' ': 'a', s: 'y', z: 'z', Z: 'z' };
      if (map[e.key]) { e.preventDefault(); this.emit('press', map[e.key]); }
    };
    window.addEventListener('keydown', this.onKey);
    return 'Tastatur';
  }
  disconnect() { window.removeEventListener('keydown', this.onKey); }
}
