// KICKR über den Bluetooth-Standard FTMS (Fitness Machine Service).
// Liest Watt/Trittfrequenz/Tempo und setzt Ziel-Watt (ERG) oder Steigung (SIM).
// Bei kurzem Verbindungsverlust verbindet es sich selbst wieder.

const FTMS_SERVICE = 0x1826;
const INDOOR_BIKE_DATA = 0x2ad2;
const CONTROL_POINT = 0x2ad9;
const RESULTS = { 1: 'OK', 2: 'nicht unterstützt', 3: 'ungültiger Wert', 4: 'fehlgeschlagen', 5: 'keine Kontrolle' };

export class FtmsTrainer extends EventTarget {
  constructor() {
    super();
    this.queue = Promise.resolve(); // Bluetooth verträgt nur einen Schreibvorgang gleichzeitig
    this.connected = false;
    this.lastCommand = null;        // wird nach Wiederverbindung erneut gesendet
    this.wantConnected = false;
    // feste Funktionen, damit nach einer Wiederverbindung kein Listener doppelt hängt
    this.onCpEvent = e => this.onControlPoint(e.target.value);
    this.onDataEvent = e => this.onBikeData(e.target.value);
  }
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail })); }

  async connect() {
    this.device = await navigator.bluetooth.requestDevice({ filters: [{ services: [FTMS_SERVICE] }] });
    this.device.addEventListener('gattserverdisconnected', () => this.onDisconnect());
    this.wantConnected = true;
    await this.setup();
    return this.device.name;
  }

  async setup() {
    const server = await this.device.gatt.connect();
    const svc = await server.getPrimaryService(FTMS_SERVICE);
    this.cp = await svc.getCharacteristic(CONTROL_POINT);
    this.cp.addEventListener('characteristicvaluechanged', this.onCpEvent);
    await this.cp.startNotifications();
    const data = await svc.getCharacteristic(INDOOR_BIKE_DATA);
    data.addEventListener('characteristicvaluechanged', this.onDataEvent);
    await data.startNotifications();
    this.queue = Promise.resolve();
    await this.write([0x00]); // Kontrolle anfordern
    await this.write([0x07]); // Start
    this.connected = true;
    this.emit('status', 'verbunden');
  }

  async onDisconnect() {
    this.connected = false;
    if (!this.wantConnected) return;
    this.emit('status', 'getrennt');
    for (let i = 1; i <= 10 && this.wantConnected; i++) {
      await new Promise(r => setTimeout(r, Math.min(1000 * i, 5000)));
      try {
        await this.setup();
        if (this.lastCommand) await this.write(this.lastCommand);
        this.emit('status', 'wieder verbunden');
        return;
      } catch { /* nächster Versuch */ }
    }
    this.emit('status', 'verloren');
  }

  write(bytes, remember = false) {
    if (remember) this.lastCommand = bytes;
    this.queue = this.queue.then(async () => {
      if (!this.cp || !this.connected && bytes[0] !== 0x00 && bytes[0] !== 0x07) return;
      await this.cp.writeValueWithResponse(new Uint8Array(bytes));
    }).catch(err => this.emit('log', `Senden fehlgeschlagen: ${err.message}`));
    return this.queue;
  }

  setTargetPower(watts) {
    const w = Math.max(0, Math.min(2000, Math.round(watts)));
    return this.write([0x05, w & 0xff, (w >> 8) & 0xff], true);
  }

  setSimulation(grade) {
    const buf = new DataView(new ArrayBuffer(7));
    buf.setUint8(0, 0x11);
    buf.setInt16(1, 0, true);
    buf.setInt16(3, Math.round(grade * 100), true);
    buf.setUint8(5, 0);
    buf.setUint8(6, 0);
    return this.write([...new Uint8Array(buf.buffer)], true);
  }

  onControlPoint(v) {
    if (v.getUint8(0) !== 0x80) return;
    const result = v.getUint8(2);
    if (result !== 1) this.emit('log', `KICKR meldet: ${RESULTS[result] ?? result}`);
  }

  onBikeData(v) {
    const flags = v.getUint16(0, true);
    let i = 2;
    const out = {};
    if (!(flags & 0x0001)) { out.speed = v.getUint16(i, true) / 100; i += 2; }
    if (flags & 0x0002) i += 2;
    if (flags & 0x0004) { out.cadence = v.getUint16(i, true) / 2; i += 2; }
    if (flags & 0x0008) i += 2;
    if (flags & 0x0010) i += 3;
    if (flags & 0x0020) i += 2;
    if (flags & 0x0040) { out.power = v.getInt16(i, true); i += 2; }
    if (flags & 0x0080) i += 2;
    if (flags & 0x0100) i += 5;
    if (flags & 0x0200) { out.hr = v.getUint8(i); i += 1; }
    this.emit('data', out);
  }

  disconnect() { this.wantConnected = false; this.device?.gatt?.disconnect(); }
}
