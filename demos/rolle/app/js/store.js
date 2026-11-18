// Datenordner: Die App liest plan.json/profil.json und schreibt Fahrten in fahrten/.
// Chrome merkt sich den gewählten Ordner (IndexedDB); nach einem Neustart reicht ein Klick auf „Zugriff erlauben“.

const DB = 'ridetrainer', KV = 'kv';
function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(KV);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function kv(mode, fn) {
  const db = await idb();
  return new Promise((res, rej) => {
    const req = fn(db.transaction(KV, mode).objectStore(KV));
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export class FolderStore {
  constructor() { this.dir = null; }
  get supported() { return 'showDirectoryPicker' in window; }

  // 'none' = noch nie gewählt, 'prompt' = Klick nötig, 'ok' = bereit
  async restore() {
    const h = await kv('readonly', s => s.get('dir')).catch(() => null);
    if (!h) return 'none';
    this.dir = h;
    return (await h.queryPermission({ mode: 'readwrite' })) === 'granted' ? 'ok' : 'prompt';
  }
  async pick() {
    this.dir = await window.showDirectoryPicker({ id: 'ridetrainer-daten', mode: 'readwrite' });
    await kv('readwrite', s => s.put(this.dir, 'dir'));
  }
  async grant() { return (await this.dir.requestPermission({ mode: 'readwrite' })) === 'granted'; }
  get name() { return this.dir?.name ?? ''; }

  // Gibt es den gemerkten Ordner noch? (z. B. nach Umbenennen/Verschieben zeigt der Handle ins Leere)
  async exists() {
    try { for await (const _ of this.dir.keys()) break; return true; }
    catch { return false; }
  }

  // Zeitstempel der letzten Änderung (für „neuer Plan da?“), null wenn es die Datei nicht gibt
  async mtime(path) {
    const parts = path.split('/'), file = parts.pop();
    try { return (await (await (await this.folder(parts)).getFileHandle(file)).getFile()).lastModified; }
    catch { return null; }
  }

  async folder(parts, create = false) {
    let d = this.dir;
    for (const p of parts) d = await d.getDirectoryHandle(p, { create });
    return d;
  }
  async readJSON(path) {
    const parts = path.split('/'), file = parts.pop();
    try {
      const d = await this.folder(parts);
      const f = await (await d.getFileHandle(file)).getFile();
      return JSON.parse(await f.text());
    } catch (e) {
      if (e.name === 'NotFoundError') return null;
      throw e;
    }
  }
  async writeJSON(path, data) {
    const parts = path.split('/'), file = parts.pop();
    const d = await this.folder(parts, true);
    const w = await (await d.getFileHandle(file, { create: true })).createWritable();
    await w.write(JSON.stringify(data, null, 2));
    await w.close();
  }
  async list(path) {
    try {
      const d = await this.folder(path.split('/'));
      const names = [];
      for await (const [name, h] of d.entries()) if (h.kind === 'file' && name.endsWith('.json')) names.push(name);
      return names.sort();
    } catch { return []; }
  }
}

// Demo: liest die echten Dateien per HTTP, schreibt nur in den Arbeitsspeicher.
// Portfolio-Demo: „HEUTE“, „HEUTE-2“, „HEUTE+4“ in den Beispieldaten werden zum echten Datum
const heute = v => {
  if (typeof v === 'string') return v.replace(/HEUTE([+-]\d+)?/g, (_, n) => {
    const d = new Date(); d.setDate(d.getDate() + Number(n || 0));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  if (Array.isArray(v)) return v.map(heute);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, heute(x)]));
  return v;
};

export class DemoStore {
  constructor(base = '../beispiel/') { this.base = base; this.mem = new Map(); }
  get supported() { return true; }
  get name() { return 'daten (Demo)'; }
  async restore() { return 'ok'; }
  async readJSON(path) {
    if (this.mem.has(path)) return structuredClone(this.mem.get(path));
    const r = await fetch(this.base + path, { cache: 'no-store' }).catch(() => null);
    return r?.ok ? heute(await r.json()) : null;
  }
  async writeJSON(path, data) { this.mem.set(path, structuredClone(data)); }
  async list(path) {
    // echte Dateien aus der Ordneransicht des lokalen Servers + im Demo gespeicherte
    const real = await fetch(this.base + path + '/index.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []);
    const mem = [...this.mem.keys()].filter(k => k.startsWith(path + '/')).map(k => k.slice(path.length + 1));
    return [...new Set([...real, ...mem])].sort();
  }
}
