// Zwift Ride Controller (Schalter/Tasten am Lenker).
// Protokoll nach dem Open-Source-Projekt BikeControl (ehem. SwiftControl).
// Jede Seite (links/rechts) ist ein eigenes Bluetooth-Gerät.

const ZWIFT_COMPANY_ID = 0x094a;
const SVC_RIDE = '0000fc82-0000-1000-8000-00805f9b34fb';
const SVC_ZWIFT = '00000001-19ca-4651-86e5-fa29dcdd09d1';
const CH_ASYNC = '00000002-19ca-4651-86e5-fa29dcdd09d1';   // Tastendrücke (notify)
const CH_SYNC_RX = '00000003-19ca-4651-86e5-fa29dcdd09d1'; // wir schreiben hierhin
const CH_SYNC_TX = '00000004-19ca-4651-86e5-fa29dcdd09d1'; // Antworten (indicate)
const RIDE_ON = [0x52, 0x69, 0x64, 0x65, 0x4f, 0x6e];     // "RideOn"
// Nachrichtentypen (erstes Byte), bestätigt per Log vom 12.11.2026:
const MSG_BUTTONS = 0x23;  // Tasten-Status (Bitmaske + Paddel)
const MSG_BATTERY = 0x19;  // alle 5 s, z.B. "19 10 64" = 100 % Akku
const MSG_IDLE = 0x15;     // Lebenszeichen (Zwift Play)
// 0x2a und 0xff: Geräte-Infos beim Verbinden → ignorieren

// Bit = 0 heißt gedrückt.
const MASKS = {
  navLeft: 0x1, navUp: 0x2, navRight: 0x4, navDown: 0x8,
  a: 0x10, b: 0x20, y: 0x40, z: 0x80,
  shiftUpL: 0x100, shiftDownL: 0x200, powerUpL: 0x400, onOffL: 0x800,
  shiftUpR: 0x1000, shiftDownR: 0x2000, powerUpR: 0x4000, onOffR: 0x8000,
};

export const hex = bytes => [...bytes].map(b => b.toString(16).padStart(2, '0')).join(' ');

// Minimaler Protobuf-Leser: liefert [{field, type, value}]
function readVarint(bytes, pos) {
  let result = 0n, shift = 0n;
  while (pos < bytes.length) {
    const b = bytes[pos++];
    result |= BigInt(b & 0x7f) << shift;
    if (!(b & 0x80)) return [result, pos];
    shift += 7n;
  }
  throw new Error('Varint abgeschnitten');
}
function parseProto(bytes) {
  const fields = [];
  let pos = 0;
  while (pos < bytes.length) {
    let key; [key, pos] = readVarint(bytes, pos);
    const field = Number(key >> 3n), type = Number(key & 7n);
    if (type === 0) { let v; [v, pos] = readVarint(bytes, pos); fields.push({ field, type, value: v }); }
    else if (type === 2) {
      let len; [len, pos] = readVarint(bytes, pos);
      fields.push({ field, type, value: bytes.slice(pos, pos + Number(len)) });
      pos += Number(len);
    }
    else if (type === 5) { pos += 4; }
    else if (type === 1) { pos += 8; }
    else throw new Error(`Unbekannter Protobuf-Typ ${type}`);
  }
  return fields;
}

export class ZwiftRide extends EventTarget {
  constructor() {
    super(); this.pressed = new Set(); this.idleCount = 0; this.wantConnected = false;
    this.onAsyncEvent = e => this.onAsync(new Uint8Array(e.target.value.buffer));
    this.onSyncEvent = e => this.onSync(new Uint8Array(e.target.value.buffer));
  }
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }
  log(msg) { this.emit('log', msg); }

  async connect({ showAll = false } = {}) {
    const optionalServices = [SVC_RIDE, SVC_ZWIFT];
    this.device = await navigator.bluetooth.requestDevice(showAll
      ? { acceptAllDevices: true, optionalServices }
      : { filters: [{ manufacturerData: [{ companyIdentifier: ZWIFT_COMPANY_ID }] }], optionalServices });
    this.device.addEventListener('gattserverdisconnected', () => this.onDisconnect());
    this.wantConnected = true;
    await this.setup();
    return this.device.name ?? 'Zwift Ride';
  }

  async onDisconnect() {
    if (!this.wantConnected) return;
    this.emit('status', 'getrennt');
    for (let i = 1; i <= 10 && this.wantConnected; i++) {
      await new Promise(r => setTimeout(r, Math.min(1000 * i, 5000)));
      try { await this.setup(); this.emit('status', 'wieder verbunden'); return; } catch { /* weiter versuchen */ }
    }
    this.emit('status', 'verloren');
  }

  async setup() {
    const server = await this.device.gatt.connect();

    const services = await server.getPrimaryServices().catch(() => []);
    this.log(`Gefundene Dienste: ${services.map(s => s.uuid.slice(0, 8)).join(', ') || 'keine'}`);
    const svc = services.find(s => s.uuid === SVC_RIDE) ?? services.find(s => s.uuid === SVC_ZWIFT);
    if (!svc) throw new Error('Zwift-Dienst nicht gefunden – evtl. gesperrte Firmware oder noch mit Zwift verbunden.');

    const chars = await svc.getCharacteristics();
    this.log(`Kanäle: ${chars.map(c => c.uuid.slice(0, 8)).join(', ')}`);
    const get = uuid => chars.find(c => c.uuid === uuid);
    const async_ = get(CH_ASYNC), rx = get(CH_SYNC_RX), tx = get(CH_SYNC_TX);
    if (!async_ || !rx || !tx) throw new Error('Erwartete Zwift-Kanäle fehlen.');

    async_.addEventListener('characteristicvaluechanged', this.onAsyncEvent);
    await async_.startNotifications();
    tx.addEventListener('characteristicvaluechanged', this.onSyncEvent);
    await tx.startNotifications();

    this.rx = rx;
    this.pressed = new Set();
    await rx.writeValueWithoutResponse(new Uint8Array(RIDE_ON));
    this.emit('status', 'verbunden');
  }

  onSync(bytes) {
    const isRideOn = RIDE_ON.every((b, i) => bytes[i] === b);
    this.log(isRideOn ? `Handshake-Antwort ✓ (${hex(bytes.slice(6, 8))})` : `Sync: ${hex(bytes)}`);
    if (isRideOn) this.emit('ready');
  }

  onAsync(bytes) {
    const opcode = bytes[0];
    if (opcode === MSG_IDLE) { this.idleCount++; this.emit('idle', this.idleCount); return; }
    if (opcode === MSG_BATTERY) {
      const pct = parseProto(bytes.slice(1)).find(f => f.field === 2);
      if (pct) this.emit('battery', Number(pct.value));
      return;
    }
    if (opcode !== MSG_BUTTONS) { this.emit('raw', `Info ${hex(bytes)}`); return; }

    let fields;
    try { fields = parseProto(bytes.slice(1)); }
    catch (err) { this.log(`Nicht lesbar (${err.message}): ${hex(bytes)}`); return; }

    const now = new Set();
    const map = fields.find(f => f.field === 1 && f.type === 0);
    if (map) {
      const bits = Number(map.value & 0xffffffffn);
      for (const [name, mask] of Object.entries(MASKS)) if ((bits & mask) === 0) now.add(name);
    }
    for (const f of fields.filter(f => f.field === 3 && f.type === 2)) {
      const sub = parseProto(f.value);
      const loc = Number(sub.find(s => s.field === 1)?.value ?? 0n);
      const raw = sub.find(s => s.field === 2)?.value ?? 0n;
      let val = Number(BigInt.asIntN(32, raw));
      if (Math.abs(val) > 100) val = Number(raw >> 1n) ^ -Number(raw & 1n); // falls zigzag-kodiert
      this.emit('analog', { loc, val }); // für die Tastentest-Seite (Stärke der Paddel)
      if (Math.abs(val) >= 25) now.add(loc === 0 ? 'paddleLeft' : loc === 1 ? 'paddleRight' : `paddle${loc}`);
    }

    for (const name of now) if (!this.pressed.has(name)) this.emit('press', name);
    const changed = now.size !== this.pressed.size || [...now].some(n => !this.pressed.has(n));
    this.pressed = now;
    if (changed) this.emit('buttons', [...now]); // Ride wiederholt den Status ~10×/s, nur Änderungen weitergeben
  }

  async vibrate() {
    await this.rx?.writeValueWithoutResponse(new Uint8Array([0x12, 0x12, 0x08, 0x0a, 0x06, 0x08, 0x02, 0x10, 0x00, 0x18, 0x20]));
  }

  disconnect() { this.wantConnected = false; this.device?.gatt?.disconnect(); }
}
