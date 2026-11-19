import { FtmsTrainer } from './ftms.js';
import { ZwiftRide } from './zwiftride.js';
import { FakeTrainer, KeyboardController } from './fake.js';
import { FolderStore, DemoStore } from './store.js';
import { fromPlan, rampTest, ftp20Test, fmt, zone, totalDuration, haerteText, DEFAULT_FTP } from './workout.js';
import { Player, ANNOUNCE, ERG_STEP } from './player.js';
import { gearFor } from './shifting.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const DEMO = params.has('demo');
const FAST = params.has('fast');
const store = DEMO ? new DemoStore() : new FolderStore();
const icon = id => `<svg class="i"><use href="#i-${id}"/></svg>`;
// Texte aus plan.json und den Fahrten werden nur als Text eingesetzt, nie als HTML
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

const state = { profile: { ftp: null }, plan: { einheiten: [] }, rides: [], ready: false };
const dev = { trainer: null, trainerStatus: 'aus', ride: null, rideStatus: 'aus', battery: null };
let player = null, ride = null, wakeLock = null, saveTimer = null;

// ---------- Hilfen ----------
const localDate = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayLabel = iso => new Date(iso + 'T12:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
const slug = s => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 3200); }
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === 's-' + id));
  document.body.classList.toggle('riding', id === 'ride');
  if (id === 'ride') wake(); else document.body.classList.remove('idle');
  if (id !== 'ride') setAccent(css('--blue'));
  window.scrollTo(0, 0);
}
// Ruhemodus beim Fahren: Ohne Maus/Tastatur blendet sich nach einer Minute die Leiste oben aus.
// Bewegt sich die Maus, kommt sie zurück.
const IDLE_AFTER = 60_000;
let idleTimer = null;
function wake() {
  document.body.classList.remove('idle');
  clearTimeout(idleTimer);
  if (document.body.classList.contains('riding')) idleTimer = setTimeout(() => document.body.classList.add('idle'), IDLE_AFTER);
}
['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, wake, { passive: true }));

function setAccent(c) { document.documentElement.style.setProperty('--accent', c); }

// Profil: Säulen in Zonenfarben, optional Cursor und gefahrene Leistung als Linie
function drawProfile(svg, segs, { cursor = null, line = null, ftpLine = null } = {}) {
  const vb = 1000, h = 100;
  const total = segs.reduce((s, x) => s + x.dauer, 0) || 1;
  const max = Math.max(...segs.map(x => Math.max(x.von, x.bis)), ...(line ?? []).map(p => p[1]), ftpLine ?? 0) * 1.12 || 1;
  let t = 0, out = '<defs>';
  for (let z = 1; z <= 6; z++) out += `<linearGradient id="g${z}-${svg.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--z${z})" stop-opacity=".95"/><stop offset="1" stop-color="var(--z${z})" stop-opacity=".22"/></linearGradient>`;
  out += '</defs>';
  for (const s of segs) {
    const gap = Math.min(2, s.dauer / total * vb / 4);
    const x1 = t / total * vb + gap, x2 = (t + s.dauer) / total * vb - gap;
    const y1 = h - s.von / max * h, y2 = h - s.bis / max * h;
    const past = cursor != null && t + s.dauer <= cursor;
    out += `<path data-k="${segs.indexOf(s)}" d="M${x1},${h} L${x1},${y1} L${x2},${y2} L${x2},${h}Z" fill="url(#g${zone(s.pct)}-${svg.id})" opacity="${past ? .35 : 1}"/>`;
    t += s.dauer;
  }
  if (ftpLine) out += `<line class="ftpl" x1="0" x2="${vb}" y1="${h - ftpLine / max * h}" y2="${h - ftpLine / max * h}" vector-effect="non-scaling-stroke"/>`;
  if (line?.length) out += `<polyline points="${line.map(([s, w]) => `${s / total * vb},${h - w / max * h}`).join(' ')}" fill="none" stroke="var(--ink)" stroke-width="1.5" opacity=".8" vector-effect="non-scaling-stroke"/>`;
  if (cursor != null) out += `<line x1="${cursor / total * vb}" x2="${cursor / total * vb}" y1="0" y2="${h}" stroke="var(--ink)" stroke-width="2" vector-effect="non-scaling-stroke"/>`;
  svg.setAttribute('viewBox', `0 0 ${vb} ${h}`);
  svg.innerHTML = out;
  svg._segs = segs; svg._total = total;   // für Tooltip und Hervorheben
  return { max, total };
}

// ---------- Ablauf kompakt (wie bei Trainingsplänen üblich: eine Zeile je Block, Wiederholungen als „3 ×“) ----------
const sameSeg = (a, b) => a.dauer === b.dauer && a.von === b.von && a.bis === b.bis && !!a.frei === !!b.frei && String(a.kadenz) === String(b.kadenz);
function groupSegs(segs) {
  const out = []; let i = 0;
  while (i < segs.length) {
    let best = null;
    for (let L = 1; L <= 6 && i + 2 * L <= segs.length; L++) {
      let n = 1;
      while (i + (n + 1) * L <= segs.length && segs.slice(i + n * L, i + (n + 1) * L).every((s, k) => sameSeg(s, segs[i + k]))) n++;
      if (n >= 2 && (!best || n * L > best.n * best.L)) best = { L, n };
    }
    if (best) {
      out.push({ rep: best.n, items: segs.slice(i, i + best.L).map((s, k) => ({ s, ks: Array.from({ length: best.n }, (_, r) => i + r * best.L + k) })) });
      i += best.n * best.L;
    } else { out.push({ s: segs[i], ks: [i] }); i++; }
  }
  return out;
}
const plainName = n => String(n).replace(/\s*\d+(\s*von\s*\d+)?$/, '');
const wattTxt = s => s.frei ? `~${s.von} W` : s.von === s.bis ? `${s.von} W` : `${s.von}–${s.bis} W`;
const cadTxt = s => s.kadenz ? `${s.kadenz[0]}–${s.kadenz[1]}` : '';
function abRow({ s, ks }) {
  return `<div class="ab" data-ks="${ks.join(',')}"><i style="background:var(--z${zone(s.pct)})"></i><span class="t num">${fmt(s.dauer)}</span><span class="w num">${wattTxt(s)}</span><span class="c num">${s.kadenz ? icon('rotate') + cadTxt(s) : ''}</span><span class="n">${esc(plainName(s.name))}${s.frei ? ' · selbst schalten' : ''}</span></div>`;
}
function ablaufHtml(w) {
  if (w.typ === 'ramp') {
    const [a, b, c] = [w.segs[0], w.segs[1], w.segs.at(-1)];
    return abRow({ s: a, ks: [0] }) + `<div class="ab" data-ks=""><i style="background:linear-gradient(var(--z5),var(--z2))"></i><span class="t num">je 1:00</span><span class="w num">ab ${b.von} W</span><span class="c"></span><span class="n">jede Minute +20 W, bis es nicht mehr geht</span></div>` + abRow({ s: c, ks: [] });
  }
  return groupSegs(w.segs).map(g => g.rep
    ? `<div class="abg"><span class="rep num">${g.rep} ×</span><div class="abg-in">${g.items.map(abRow).join('')}</div><span class="gsum num">${fmt(g.items.reduce((a, x) => a + x.s.dauer, 0) * g.rep)}</span></div>`
    : abRow(g)).join('');
}
// Zeile ↔ Profil: Hover auf eine Zeile hebt die Säulen hervor
function linkList(list, svg) {
  list.onmouseover = e => {
    const r = e.target.closest('.ab'); const ks = r?.dataset.ks ? r.dataset.ks.split(',') : null;
    svg.classList.toggle('focus', !!ks);
    svg.querySelectorAll('path[data-k]').forEach(p => p.classList.toggle('hl', !!ks && ks.includes(p.dataset.k)));
  };
  list.onmouseleave = () => { svg.classList.remove('focus'); svg.querySelectorAll('.hl').forEach(p => p.classList.remove('hl')); };
}
// Tooltip über dem Profil: Abschnitt, Dauer, Watt, Trittfrequenz
function profileTip(svg) {
  const tip = $('ptip');
  svg.addEventListener('mousemove', e => {
    const segs = svg._segs; if (!segs?.length) return;
    const box = svg.getBoundingClientRect(), t = (e.clientX - box.left) / box.width * svg._total;
    let acc = 0, s = segs[0], start = 0;
    for (const x of segs) { if (t < acc + x.dauer) { s = x; start = acc; break; } acc += x.dauer; }
    tip.innerHTML = `<b>${esc(s.name)}</b><span>${icon('clock')}${fmt(s.dauer)}<em>ab ${fmt(start)}</em></span><span>${wattTxt(s)}${s.kadenz ? ` · ${icon('rotate')}${cadTxt(s)} U/min` : ''}</span>`;
    tip.classList.remove('hidden');
    const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 10);
    tip.style.left = x + 'px'; tip.style.top = (e.clientY - tip.offsetHeight - 12) + 'px';
  });
  svg.addEventListener('mouseleave', () => tip.classList.add('hidden'));
}
// Zeitachse fürs Profil: Position = Start des Abschnitts im Plan + Sekunde im Abschnitt.
// So stimmen Cursor und Linie auch nach übersprungenen Abschnitten. Beim Ramp nur die gefahrenen Stufen (+ ein paar kommende).
function timeline(p, stufeLimit) {
  const view = [], off = new Map(); let acc = 0;
  p.w.segs.forEach((x, k) => { if (!x.stufe || x.stufe <= stufeLimit) { off.set(k, acc); view.push(x); acc += x.dauer; } });
  const pos = (i, st) => (off.get(i) ?? acc) + st;
  const line = p.samples.filter((_, k) => k % 5 === 0).map(x => [pos(x[4], x[5]), x[2]]);
  return { view, cursor: pos(p.i, p.segT), line };
}

// ---------- Datenordner ----------
async function initStore() {
  if (DEMO) {
    $('demoTag').classList.remove('hidden');
    if (params.has('beispiel')) { // Beispielplan statt echtem Plan, Datum = heute
      const plan = await fetch('beispiel-plan.json').then(r => r.json());
      plan.einheiten.forEach(e => { if (e.datum === 'HEUTE') e.datum = localDate(); });
      await store.writeJSON('plan.json', plan);
    }
    return load();
  }
  if (!store.supported) return setup('Chrome nötig', 'Dieser Browser kann keine Ordner öffnen. Bitte die App in Chrome öffnen.', null);
  const st = await store.restore();
  if (st === 'ok') return load();
  if (st === 'prompt') return setup('Zugriff erlauben', `Chrome braucht nach dem Neustart einmal deine Erlaubnis für den Ordner <code>${esc(store.name)}</code>.`, 'Zugriff erlauben', async () => { if (await store.grant()) load(); });
  setup('Datenordner verbinden', 'Wähle einmalig den Ordner <code>rolle/daten</code>. Dort liegen dein Plan und deine Fahrten.', 'Ordner wählen', async () => { await store.pick(); load(); });
}
function setup(title, text, btn, fn) {
  $('setup').classList.remove('hidden');
  $('setupTitle').textContent = title; $('setupText').innerHTML = text;
  $('setupBtn').classList.toggle('hidden', !btn);
  if (btn) { $('setupBtn').textContent = btn; $('setupBtn').onclick = () => fn().catch(e => toast(e.message)); }
  renderHome();
}

const pickAgain = async () => { await store.pick(); load(); };
async function load() {
  $('setup').classList.add('hidden');
  try {
    if (!DEMO && !(await store.exists()))
      return setup('Ordner nicht gefunden', 'Den gemerkten Datenordner gibt es nicht mehr (umbenannt oder verschoben). Bitte einmal <code>rolle/daten</code> neu wählen.', 'Ordner wählen', pickAgain);
    const profile = await store.readJSON('profil.json'), plan = await store.readJSON('plan.json');
    if (!DEMO && !profile && !plan)
      return setup('Kein Plan gefunden', `Im Ordner <code>${esc(store.name)}</code> liegen weder plan.json noch profil.json. Richtig ist <code>rolle/daten</code>.`, 'Anderen Ordner wählen', pickAgain);
    state.profile = profile ?? { ftp: null };
    state.plan = plan ?? { einheiten: [] };
    const names = await store.list('fahrten');
    state.rides = (await Promise.all(names.map(n => store.readJSON('fahrten/' + n).catch(() => null)))).filter(Boolean);
    if (!DEMO && store.name !== 'daten') toast(`Gewählt ist „${store.name}“. Richtig wäre der Ordner rolle/daten.`);
    state.ready = true;
    if (store.mtime) planStamp = await store.mtime('plan.json');
  } catch (e) { toast('Ordner konnte nicht gelesen werden: ' + e.message); }
  renderHome();
}

// ---------- Startseite ----------
function doneIds() { return new Map(state.rides.filter(r => r.einheit_id && r.status !== 'laeuft').map(r => [r.einheit_id, r])); }
function currentEinheit() {
  const done = doneIds(), today = localDate();
  const list = [...(state.plan.einheiten ?? [])].sort((a, b) => a.datum.localeCompare(b.datum));
  return list.find(e => e.datum === today && !done.has(e.id)) ?? list.find(e => e.datum > today && !done.has(e.id)) ?? list.find(e => !done.has(e.id)) ?? null;
}

let homeWorkout = null, homeEinheit = null;
let pickedId = null;   // in der Wochenleiste angeklickte Einheit (Vorschau), null = automatisch
function renderHome() {
  const today = localDate();
  const e = (pickedId && state.plan.einheiten?.find(x => x.id === pickedId)) || currentEinheit();
  homeEinheit = e;
  homeWorkout = e ? fromPlan(e, state.profile.ftp) : null;
  if (!homeWorkout) {
    $('todayDate').textContent = dayLabel(today);
    $('todayTitle').textContent = state.ready ? 'Nichts geplant' : 'Lade …';
    $('todayLede').textContent = state.ready ? 'Sag Claude im Chat Bescheid, dann gibt es einen neuen Plan. Oder fahr einen FTP-Test.' : '';
    $('todayMeta').innerHTML = '';
    $('startBtn').classList.add('hidden'); $('phasesBtn').classList.add('hidden');
    $('heroProfile').innerHTML = ''; $('stageMid').textContent = ''; $('stageEnd').textContent = '';
  } else {
    const prefix = e.datum === today ? 'Heute' : e.datum < today ? 'Nachholen' : pickedId ? 'Vorschau' : 'Als Nächstes';
    $('todayDate').textContent = `${prefix} · ${dayLabel(e.datum)}`;
    $('todayTitle').textContent = homeWorkout.titel;
    $('todayLede').textContent = homeWorkout.zweck;
    const dur = totalDuration(homeWorkout);
    $('todayMeta').innerHTML = metaPills(homeWorkout);
    $('startBtn').classList.remove('hidden'); $('phasesBtn').classList.remove('hidden');
    const segs = homeWorkout.typ === 'ramp' ? homeWorkout.segs.filter(s => !s.stufe || s.stufe <= 15) : homeWorkout.segs;
    drawProfile($('heroProfile'), segs);
    $('stageMid').textContent = homeWorkout.segs.filter(s => !s.stufe).map(s => s.name).filter((n, i, a) => a.indexOf(n) === i).slice(0, 4).join(' · ');
    $('stageEnd').textContent = fmt(dur);
    $('phases').innerHTML = ablaufHtml(homeWorkout);
    linkList($('phases'), $('heroProfile'));
    if (!$('bigView').classList.contains('hidden')) renderBig();
  }
  updateStartHint();
  renderWeek(); renderDevices(); renderFtp(); renderCoach();
  maybeAutoWeek();
}

// Pills unter dem Titel: Dauer (Uhr), Härte, Hinweise. Gleiche Pills in der Wochenleiste.
const durPill = w => `<span class="pill num">${icon('clock')}${w.typ === 'ramp' ? 'ca. ' : ''}${Math.round(totalDuration(w) / 60)} min</span>`;
const hardPill = w => `<span class="pill"><span class="hard l${w.haerte}"><i></i><i></i><i></i></span>${haerteText(w.haerte)}</span>`;
function metaPills(w) {
  const extra = w.typ === 'ramp' ? 'Start 100 W, jede Minute +20 W' : !state.profile.ftp ? `FTP fehlt, gerechnet mit ${DEFAULT_FTP} W` : '';
  return durPill(w) + hardPill(w) + (extra ? `<span class="pill">${extra}</span>` : '');
}

// Großansicht: Profil mit Watt- und Zeitachse, Ablauf kompakt in Spalten
function renderBig() {
  const w = homeWorkout; if (!w) return;
  $('bigDate').textContent = $('todayDate').textContent;
  $('bigTitle').textContent = w.titel;
  const ftp = state.profile.ftp ?? DEFAULT_FTP;
  const work = w.segs.filter(s => !s.stufe || s.stufe <= 15);
  const avg = Math.round(work.reduce((a, s) => a + (s.von + s.bis) / 2 * s.dauer, 0) / (work.reduce((a, s) => a + s.dauer, 0) || 1));
  $('bigMeta').innerHTML = metaPills(w) + (w.typ === 'workout' ? `<span class="pill num">Ø ${avg} W</span>` : '') + `<span class="pill num">FTP ${ftp} W</span>`;
  const { max, total } = drawProfile($('bigProfile'), work, { ftpLine: ftp });
  // Wattachse: alle 50 W, Zeitachse: alle 5 oder 10 min
  const ys = []; for (let v = 50; v < max; v += 50) ys.push(v);
  $('bigY').innerHTML = ys.map(v => `<span style="bottom:${v / max * 100}%">${v}</span>`).join('')
    + `<span class="ftp" style="bottom:${ftp / max * 100}%">FTP ${ftp} W</span>`;
  const step = total > 3600 ? 600 : 300, xs = []; for (let t = 0; t <= total; t += step) xs.push(t);
  $('bigX').innerHTML = xs.map(t => `<span style="left:${t / total * 100}%">${Math.round(t / 60)}′</span>`).join('');
  $('bigList').innerHTML = ablaufHtml(w);
  linkList($('bigList'), $('bigProfile'));
}
const openBig = () => { $('bigView').classList.remove('hidden'); renderBig(); $('maxBtn').blur(); };
const closeBig = () => { $('bigView').classList.add('hidden'); $('ptip').classList.add('hidden'); };
$('maxBtn').onclick = openBig;
$('bigClose').onclick = closeBig;
$('bigView').onclick = e => { if (e.target === $('bigView')) closeBig(); };
$('bigStart').onclick = () => { closeBig(); homeWorkout && startRide(homeWorkout, homeEinheit); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBig(); });
profileTip($('heroProfile')); profileTip($('bigProfile'));


function updateStartHint() {
  const ok = dev.trainerStatus === 'verbunden' || dev.trainerStatus === 'wieder verbunden';
  $('startBtn').querySelector('span').textContent = ok ? 'Training starten' : 'KICKR verbinden und starten';
  $('startHint').textContent = ok ? '' : 'Tipp: Vorher Zwift und die Wahoo-App schließen, sonst halten sie den KICKR fest.';
}

// Wochenleiste: Kalenderwoche Mo–So. weekShift = geblättert (‹ ›), null = automatisch:
// diese Woche, nur sonntags ohne offene Einheit mehr schon die nächste.
let weekShift = null;
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return localDate(d); };
const hm = s => { const m = Math.round(s / 60); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; };
function autoShift(today, done) {
  if (new Date(today + 'T12:00:00').getDay() !== 0) return 0;
  return (state.plan.einheiten ?? []).some(e => e.datum === today && !done.has(e.id)) ? 0 : 1;
}
function renderWeek() {
  const done = doneIds(), today = localDate();
  const shift = weekShift ?? autoShift(today, done);
  const mo = addDays(weekRange(today)[0], shift * 7), so = addDays(mo, 6);
  const names = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
  let planned = 0, ridden = 0, units = 0, unitsDone = 0;
  const cols = [];
  $('week').innerHTML = [0, 1, 2, 3, 4, 5, 6].map(k => {
    const iso = addDays(mo, k), d = new Date(iso + 'T12:00:00');
    const tag = names[d.getDay()], nr = `${d.getDate()}.`;
    const now = iso === today;
    const tl = now ? '<span class="tl"><i></i>heute</span>' : '';
    const items = (state.plan.einheiten ?? []).filter(e => e.datum === iso);
    if (!items.length) {
      cols.push('minmax(0, .5fr)');
      return `<div class="day rest${now ? ' now' : ''}">${tl}<span class="d">${tag}<br>${nr}</span>${icon('sofa')}</div>`;
    }
    cols.push('minmax(0, 1.6fr)');
    // mehrere Einheiten am Tag: die offene zeigen, sonst die erste
    const e = items.find(x => !done.has(x.id)) ?? items[0], w = fromPlan(e, state.profile.ftp), r = done.get(e.id);
    const dur = totalDuration(w);
    units++; planned += dur;
    if (r) { unitsDone++; ridden += r.dauer ?? dur; }
    const st = r ? ' isdone' : iso < today ? ' ismiss' : '';
    const sel = homeEinheit && e.id === homeEinheit.id;
    return `<button class="day glass pick${st}${now ? ' now' : ''}${sel ? ' sel' : ''}" data-id="${esc(e.id)}"${r ? ' data-done="1"' : ''} title="${r ? 'Fahrt ansehen' : 'Profil ansehen'}">${tl}<span class="d">${tag} ${nr}</span><b>${esc(w.titel)}</b>`
      + `<span class="wmeta">${durPill(w)}${hardPill(w)}</span></button>`;
  }).join('');
  $('week').style.setProperty('--wcols', cols.join(' '));

  // Kopfzeile: Titel, Datum, Stand
  $('weekTitle').textContent = shift === 0 ? 'Diese Woche' : shift === 1 ? 'Nächste Woche' : shift === -1 ? 'Letzte Woche' : 'Woche';
  const a = new Date(mo + 'T12:00:00'), b = new Date(so + 'T12:00:00');
  const month = x => x.toLocaleDateString('de-DE', { month: 'long' });
  $('weekRange').textContent = a.getMonth() === b.getMonth() ? `${a.getDate()}.–${b.getDate()}. ${month(b)}` : `${a.getDate()}. ${month(a)} – ${b.getDate()}. ${month(b)}`;
  $('weekSum').innerHTML = units ? `<span><b>${unitsDone} von ${units}</b> gefahren</span><span><b>${hm(ridden)}</b> von ${hm(planned)} h</span>` : '<span>nichts geplant</span>';
}
$('weekPrev').onclick = () => { weekShift = (weekShift ?? autoShift(localDate(), doneIds())) - 1; renderWeek(); };
$('weekNext').onclick = () => { weekShift = (weekShift ?? autoShift(localDate(), doneIds())) + 1; renderWeek(); };
// Klick auf einen Tag: dessen Einheit oben mit Profil zeigen; nochmal klicken = zurück zu heute
$('week').addEventListener('click', ev => {
  const b = ev.target.closest('.day.pick'); if (!b) return;
  // gefahrener Tag: Rückblick auf die Fahrt (Werte, Profil, Gefühl)
  if (b.dataset.done) {
    const einheit = state.plan.einheiten.find(x => x.id === b.dataset.id);
    const r = [...state.rides].reverse().find(x => x.einheit_id === b.dataset.id && x.status !== 'laeuft');
    if (einheit && r) return openReview(r, einheit);
  }
  pickedId = b.classList.contains('sel') && pickedId ? null : b.dataset.id;
  renderHome();
});

// ---------- Kacheln unten: Geräte · FTP · Coach (gleiches Gerüst, Knopf rechts unten) ----------
const isOn = s => s === 'verbunden' || s === 'wieder verbunden';
// Akku: ab 25 % orange, ab 10 % rot (dann bald laden)
const battery = p => `<span class="bat${p <= 10 ? ' crit' : p < 25 ? ' low' : ''}" title="Akku ${p} %"><svg viewBox="0 0 22 12"><rect x=".75" y=".75" width="18" height="10.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="20" y="4" width="1.6" height="4" rx=".8" fill="currentColor"/><rect class="lvl" x="2.5" y="2.5" width="${Math.round(14.5 * p / 100)}" height="7" rx="1.2"/></svg>${p} %</span>`;

function renderDevices() {
  const k = isOn(dev.trainerStatus), r = isOn(dev.rideStatus);
  const kBusy = !k && dev.trainerStatus !== 'aus', rBusy = !r && dev.rideStatus !== 'aus';
  $('devices').innerHTML =
    `<span class="dv"><i class="dot${k ? ' on' : ''}"></i>KICKR CORE</span>` +
    `<span class="dv"><i class="dot${r ? ' on' : ''}"></i>Zwift Ride${r && dev.battery != null ? battery(dev.battery) : ''}</span>`;
  // Satz: Verbundenes zuerst
  const kTxt = kBusy ? `KICKR ${esc(dev.trainerStatus)}.` : 'KICKR CORE noch nicht verbunden.';
  const rTxt = rBusy ? `Ride ${esc(dev.rideStatus)}.` : 'Zwift Ride noch nicht verbunden.';
  $('devText').innerHTML = k && r ? '<b>Alles bereit.</b> KICKR und Ride sind verbunden.'
    : k ? `<b>KICKR bereit.</b> ${rTxt}`
    : r ? `<b>Ride bereit.</b> ${kTxt}`
    : 'Noch nichts verbunden. Rad einschalten, dann verbinden.';
  const label = k && r ? 'Verbunden' : !k && !r ? 'KICKR und Ride verbinden' : !k ? 'KICKR verbinden' : 'Ride verbinden';
  $('devFoot').innerHTML = `<button class="btn primary small" id="connBtn"${k && r ? ' disabled' : ''}>${label}</button>`;
  $('connBtn').onclick = connectMissing;

  // Kopfzeile beim Fahren: Punkt + Name, Akku vom Ride, dezenter Verbinden-Knopf wenn etwas fehlt
  const lost = s => s === 'aus' || s === 'verloren';
  $('rideDevs').innerHTML =
    `<span class="dv" title="KICKR ${esc(dev.trainerStatus)}"><i class="dot${k ? ' on' : kBusy && !lost(dev.trainerStatus) ? ' busy' : ''}"></i>KICKR</span>` +
    `<span class="dv" title="Ride ${esc(dev.rideStatus)}"><i class="dot${r ? ' on' : rBusy && !lost(dev.rideStatus) ? ' busy' : ''}"></i>Ride${r && dev.battery != null ? battery(dev.battery) : ''}</span>` +
    (lost(dev.trainerStatus) || lost(dev.rideStatus) ? '<button class="btn glass small" id="rideConnBtn">Verbinden</button>' : '');
  if ($('rideConnBtn')) $('rideConnBtn').onclick = e => { e.currentTarget.blur(); connectMissing(); };
}
async function connectMissing() {
  try {
    if (!isOn(dev.trainerStatus)) {
      await connectTrainer();
      if (player && !player.done) { player.trainer = dev.trainer; player.resend(); }  // laufendes Training übernimmt den neuen KICKR
    }
    if (!isOn(dev.rideStatus)) await connectRide();
  } catch (e) { toast(e.message.includes('cancelled') ? 'Kein Gerät gewählt.' : e.message); }
}

function renderFtp() {
  const f = state.profile.ftp, p = state.profile;
  $('ftpVal').innerHTML = f ? `${f}<span>Watt</span>` : '<span style="margin:0">noch offen</span>';
  if (!f) { $('ftpText').innerHTML = 'Die Watt, die du etwa eine Stunde durchhältst. <b>Starte mit dem Ramp-Test.</b>'; return; }
  const when = p.aktualisiert ? new Date(p.aktualisiert) : null;
  const next = when ? new Date(when.getTime() + 42 * 864e5) : null;   // alle 6 Wochen neu testen
  const nextTxt = !next ? '' : next <= new Date() ? ' <b>Zeit für einen neuen Test.</b>' : ` <b>Nächster Test um den ${next.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' })}</b>`;
  // Datum „15.11.“ endet schon mit Punkt → keinen zweiten anhängen
  $('ftpText').innerHTML = `Letzter ${esc(p.ftp_quelle ?? 'Test')}${when ? ' am ' + when.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' }) : '.'} Alle Pläne rechnen in Prozent davon.${nextTxt}`;
}

// Woche Mo–So, in der heute liegt
function weekRange(today = localDate()) {
  const d = new Date(today + 'T12:00:00'), mo = new Date(d); mo.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const so = new Date(mo); so.setDate(mo.getDate() + 6);
  return [localDate(mo), localDate(so)];
}
function renderCoach() {
  coachState ??= { state: 'idle' };
  const today = localDate(), [mo, so] = weekRange(today), done = doneIds();
  const tag = iso => ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'][new Date(iso + 'T12:00:00').getDay()];
  const week = (state.plan.einheiten ?? []).filter(e => e.datum >= mo && e.datum <= so).sort((a, b) => a.datum.localeCompare(b.datum));
  const st = e => done.has(e.id) ? 'gefahren' : e.datum < today ? 'ausgefallen' : e.datum === today ? 'heute' : '';
  $('bubbles').innerHTML = week.length
    ? week.map(e => { const s = st(e); return `<span class="bub" title="${esc(e.titel ?? '')}"><i class="${s}">${s === 'gefahren' ? icon('check') : s === 'ausgefallen' ? icon('x') : ''}</i><small>${tag(e.datum)}</small></span>`; }).join('')
    : '<span class="none">Für diese Woche ist nichts geplant.</span>';
  const open = week.filter(e => st(e) === 'heute' || st(e) === '').length, missed = week.filter(e => st(e) === 'ausgefallen').length;
  const last = [...state.rides].filter(x => x.status !== 'laeuft').sort((a, b) => b.start.localeCompare(a.start))[0];
  const lastTxt = last ? ` Zuletzt <b>${esc(last.titel)}</b> (${new Date(last.start).toLocaleDateString('de-DE', { weekday: 'short' }).replace('.', '')})${last.gefuehl ? ', „' + esc(last.gefuehl) + '“' : ''}.` : '';
  $('changeBtn').disabled = coachState.state === 'running';
  if (coachState.state === 'running') {
    $('coachText').innerHTML = `<span class="spin"></span>${coachState.mode === 'woche' ? '<b>Woche geschafft.</b> Der Coach wertet aus und schreibt die nächste Woche.' : 'Der Coach passt die restliche Woche an. Dauert etwa eine Minute.'}`;
    return;
  }
  if (coachState.note) { $('coachText').innerHTML = coachState.note; return; }
  $('coachText').innerHTML = !week.length ? 'Über „Plan ändern“ fragst du beim Coach eine neue Woche an.'
    : open ? `Diese Woche noch <b>${open} ${open === 1 ? 'Einheit' : 'Einheiten'}</b>.${missed ? ` ${missed} ausgefallen.` : ''}${lastTxt}`
    : `<b>Woche geschafft.</b>${lastTxt} Der Coach schreibt gleich die nächste Woche.`;
}

// Popup „Plan ändern“ – vorerst: Wunsch für den Chat kopieren (Automatik folgt)
function openChange() { $('changeModal').classList.remove('hidden'); $('wish').focus(); }
function closeChange() { $('changeModal').classList.add('hidden'); }
$('changeBtn').onclick = openChange;
$('changeCancel').onclick = closeChange;
$('changeModal').addEventListener('click', e => { if (e.target === $('changeModal')) closeChange(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('changeModal').classList.contains('hidden')) closeChange(); });
$('quick').onclick = e => { const b = e.target.closest('button'); if (!b) return; const t = $('wish'); t.value = (t.value.trim() ? t.value.trim() + ' ' : '') + b.textContent + '.'; t.focus(); };
$('changeSend').onclick = async () => {
  const wish = $('wish').value.trim();
  if (!wish) { $('wish').focus(); return; }
  if (await askCoach('aendern', wish)) { $('wish').value = ''; closeChange(); }
};

/* ---------- Coach im Hintergrund (serve.py startet Claude Code, das nur plan.json schreibt) ---------- */
var coachState = { state: 'idle' }, coachTimer = null;   // var: renderCoach kann vorher schon laufen
async function askCoach(mode, wunsch = '') {
  if (DEMO) {   // Demo: nur so tun als ob
    coachState = { state: 'running', mode }; renderCoach();
    setTimeout(() => { coachState = { state: 'idle', note: `<b>Coach (Demo):</b> ${mode === 'woche' ? 'Nächste Woche geschrieben.' : 'Restliche Woche angepasst.'}` }; renderCoach(); toast('Demo: Der Coach hätte jetzt den Plan angepasst.'); }, 4000);
    return true;
  }
  try {
    const r = await fetch('/api/coach', { method: 'POST', headers: { 'X-Rolle': '1', 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, wunsch }) });
    const j = await r.json();
    if (r.status === 409) { toast('Der Coach arbeitet schon.'); }
    else if (!r.ok) { toast(j.error ?? 'Coach konnte nicht starten.'); return false; }
    coachState = j; renderCoach(); pollCoach();
    return true;
  } catch { toast('Coach nicht erreichbar. Läuft rolle. noch?'); return false; }
}
function pollCoach() {
  clearTimeout(coachTimer);
  coachTimer = setTimeout(async () => {
    try {
      const j = await (await fetch('/api/coach')).json();
      if (j.state === 'running') { coachState = j; return pollCoach(); }
      if (j.state === 'done') { coachState = { state: 'idle', note: `<b>Coach:</b> ${esc(j.message)}` }; await load(); toast('Neuer Plan vom Coach'); }
      else if (j.state === 'error') { coachState = { state: 'idle', note: `<b>Coach hatte ein Problem:</b> ${esc(j.message)} Der alte Plan gilt weiter.` }; renderCoach(); }
      else { coachState = j; renderCoach(); }
    } catch { pollCoach(); }
  }, 4000);
}
// Beim Start: läuft schon ein Auftrag (z. B. nach Neuladen der Seite)?
if (!DEMO) fetch('/api/coach').then(r => r.json()).then(j => { if (j.state === 'running') { coachState = j; renderCoach(); pollCoach(); } }).catch(() => {});

// Wochenauswertung automatisch: keine offene Einheit mehr ab heute → Coach schreibt die nächste Woche (höchstens 1× pro Tag)
function maybeAutoWeek() {
  if (DEMO || !state.ready || coachState.state === 'running' || (player && !player.done)) return;
  const today = localDate(), done = doneIds();
  const units = state.plan.einheiten ?? [];
  if (!units.length) return;
  const open = units.some(e => e.datum >= today && !done.has(e.id));
  if (open) return;
  try { if (localStorage.getItem('rolle-auto-woche') === today) return; localStorage.setItem('rolle-auto-woche', today); } catch { /* egal */ }
  askCoach('woche');
}

// ---------- Geräte ----------
async function connectTrainer() {
  const t = DEMO ? new FakeTrainer({ failAt: 260, speedup: FAST ? 4 : 1 }) : new FtmsTrainer();
  t.addEventListener('status', e => {
    dev.trainerStatus = e.detail; renderDevices(); updateStartHint(); renderConn();
    if (e.detail === 'wieder verbunden') { player?.resend(); toast('KICKR wieder verbunden'); }
    if (e.detail === 'getrennt') toast('KICKR getrennt, verbinde neu …');
  });
  t.addEventListener('data', e => { player?.onData(e.detail); watchStart(e.detail); });
  t.addEventListener('log', e => console.info('[KICKR]', e.detail));
  await t.connect();
  dev.trainer = t;
}

async function connectRide() {
  const r = DEMO ? new KeyboardController() : new ZwiftRide();
  r.addEventListener('status', e => { dev.rideStatus = e.detail; renderDevices(); renderConn(); });
  r.addEventListener('battery', e => { dev.battery = e.detail; renderDevices(); });
  r.addEventListener('press', e => onButton(e.detail));
  r.addEventListener('log', e => console.info('[Ride]', e.detail));
  await r.connect();
  if (DEMO) { dev.rideStatus = 'verbunden'; dev.battery = Number(params.get('akku') ?? 72); }  // ?akku=8 zeigt den roten Akku
  dev.ride = r; renderDevices();
}

// Geräte trennen, wenn nicht gefahren wird: Solange Chrome mit dem Ride verbunden ist, bleiben seine Lichter an
// und er schläft nie ein (16.11.: nach 2 Stunden noch an). Also nach 10 Min. ohne Training, beim Beenden und beim Schließen des Tabs.
function disconnectAll() {
  if (!dev.trainer && !dev.ride) return;
  try { dev.trainer?.disconnect?.(); } catch { /* egal */ }
  try { dev.ride?.disconnect?.(); } catch { /* egal */ }
  Object.assign(dev, { trainer: null, ride: null, trainerStatus: 'aus', rideStatus: 'aus', battery: null });
  renderDevices(); updateStartHint();
}
let lastBusy = Date.now();
setInterval(() => {
  if ((player && !player.done) || waiting || !(dev.trainer || dev.ride)) { lastBusy = Date.now(); return; }
  if (Date.now() - lastBusy > 10 * 60_000) { disconnectAll(); toast('KICKR und Ride getrennt, damit sie schlafen gehen.'); }
}, 60_000);
window.addEventListener('pagehide', disconnectAll);

// Tastatur funktioniert immer zusätzlich (Leertaste = A, Z = Z, ↑/↓ = Schalter, S = Y)
const keys = new KeyboardController();
keys.addEventListener('press', e => onButton(e.detail));
keys.connect();

// Tastensperre (Wunsch 16.11.): Im Training wirken nur A (Pause) und Z (entsperren/sperren).
// Ausnahme: In „selbst schalten“-Abschnitten gehen die Schalter immer, sonst könnte man dort nicht schalten.
let unlocked = false;
// Schalten nur über die seitlichen Knöpfe (Wunsch 17.11.): beide rechts = hoch/mehr, beide links = runter/weniger.
// Die langen Hebel vorne bleiben aus, damit man sich nicht verschaltet.
const UP = ['shiftUpR', 'shiftDownR'], DOWN = ['shiftUpL', 'shiftDownL'];
// Fokus-Modus (19.11.): Pfeil rechts am Ride (navRight) oder → schaltet um. Geht immer, auch gesperrt. Bleibt gemerkt.
let focusOn = false, focusAt = 0;

function toggleFocus() {
  if (performance.now() - focusAt < 300) return;   // Demo: Tastatur meldet sich doppelt (Ride-Ersatz + immer aktive Tastatur)
  focusAt = performance.now();
  focusOn = !focusOn;
  try { localStorage.setItem('rolle-fokus', focusOn ? '1' : '0'); } catch { /* egal */ }
  renderRide();
}

function onButton(k) {
  if (!player || player.done) return;
  if (k === 'navRight') return toggleFocus();
  if (waiting) { if (k === 'a') beginRide(); return; }
  if (k === 'a') return player.inRampSteps ? player.stopRamp('manuell') : player.togglePause();
  // Z: Zustand steht oben im Kopf. Nur beim Entsperren vibriert der Ride (2×), Sperren ist der Normalzustand (Wunsch 18.11.)
  if (k === 'z') { unlocked = !unlocked; if (unlocked) buzz(2); return renderRide(); }
  if (player.inRampSteps) return;
  const shift = UP.includes(k) ? 1 : DOWN.includes(k) ? -1 : 0;
  if (shift && (player.seg.frei || unlocked)) return player.adjust(shift);
  if (k === 'y' && unlocked) return player.skip();
}

// Vibration am Ride (18.11.): 1× kurz als Vorwarnung vor dem nächsten Abschnitt, 2× beim Entsperren. Sonst nie.
function buzz(n = 1) {
  if (DEMO) return console.info(`[Ride] vibriert ${n}×`);
  const r = dev.ride;
  if (!r?.vibrate) return;
  r.vibrate().catch(() => {});
  if (n > 1) setTimeout(() => r.vibrate().catch(() => {}), 450);
}

// ---------- Fahren ----------
async function startRide(workout, einheit = null) {
  if (!dev.trainer?.connected) {
    try { await connectTrainer(); } catch (e) { return toast(e.message === 'User cancelled the requestDevice() chooser.' ? 'Kein Trainer gewählt.' : e.message); }
  }
  const ftp = state.profile.ftp;
  ride = null; review = null; unlocked = false;
  player = new Player(workout, { trainer: dev.trainer, ftp, tickMs: FAST ? 250 : 1000 });
  player.addEventListener('tick', renderRide);
  player.addEventListener('done', e => onDone(e.detail));
  player.einheit = einheit;
  $('rideTitle').textContent = workout.titel;
  document.activeElement?.blur(); // sonst löst die Leertaste (= Pause) den zuletzt geklickten Knopf aus
  // Erst „Bereit?“: Die Zeit läuft los, sobald du trittst oder A drückst (Wunsch 16.11.)
  waiting = true; cadSeen = 0;
  dev.trainer.setSimulation?.(0);   // bis zum Start leicht treten können
  show('ride');
  renderRide();
  $('readyBox').classList.remove('hidden');
  requestWakeLock();
}

let waiting = false, cadSeen = 0;
function beginRide() {
  if (!waiting || !player) return;
  waiting = false;
  $('readyBox').classList.add('hidden');
  const startedAt = new Date(), w = player.w;
  ride = {
    version: 1, einheit_id: player.einheit?.id ?? null, titel: w.titel, typ: w.typ,
    start: startedAt.toISOString(), ftp: player.ftp, status: 'laeuft', gefuehl: null,
    datei: `${localDate(startedAt)}_${String(startedAt.getHours()).padStart(2, '0')}${String(startedAt.getMinutes()).padStart(2, '0')}_${slug(w.titel)}.json`,
  };
  player.startedAt = startedAt;
  player.start();
  saveTimer = setInterval(() => saveRide(), FAST ? 1500 : 30000);
}
function cancelReady() {
  waiting = false; player = null;
  $('readyBox').classList.add('hidden');
  releaseWakeLock();
  renderHome(); show('home');
}
// Treten startet, aber nur echtes Losfahren: 4 Sekunden am Stück mindestens 50 U/min und 30 W.
// Ein kurzer Tritt beim Aufsteigen oder ein Zucken der Kurbel reicht nicht (Wunsch 16.11.).
const START_SEK = FAST ? 0.3 : 4;
function watchStart(d) {
  if (!waiting) return;
  if (player) renderRide();   // Watt und Trittfrequenz schon vor dem Start anzeigen
  const rolling = (d.cadence ?? 0) >= 50 && (d.power ?? 0) >= 30;
  if (!rolling) { cadSeen = 0; return; }
  cadSeen ||= performance.now();
  if (performance.now() - cadSeen >= START_SEK * 1000) beginRide();
}

function renderConn() {
  const ok = s => s === 'verbunden' || s === 'wieder verbunden';
  const warn = !ok(dev.trainerStatus) && player && !player.done;
  $('connWarn').classList.toggle('hidden', !warn);
  if (warn) $('connWarn').textContent = dev.trainerStatus === 'verloren' ? 'Verbindung zum KICKR verloren. Die Zeit läuft weiter. Unter „Beenden“ kannst du speichern.' : 'KICKR kurz getrennt. Ich verbinde neu, das Training läuft weiter.';
}

// Skala: Punkt an der Position des Ist-Werts, optional helles Zielband
function gauge(bandId, dotId, val, min, max, band) {
  const pos = v => Math.max(0, Math.min(100, (v - min) / (max - min) * 100));
  const b = $(bandId);
  b.style.display = band ? '' : 'none';
  if (band) { b.style.left = pos(band[0]) + '%'; b.style.width = (pos(band[1]) - pos(band[0])) + '%'; }
  $(dotId).style.left = pos(val || min) + '%';
}

function setState(el, cls) { el.classList.remove('s-ok', 's-warn', 's-bad', 's-none'); el.classList.add(cls); }
const ampel = (x, warn, bad) => x <= warn ? 's-ok' : x <= bad ? 's-warn' : 's-bad';
function coach(ic, title, sub = '', cls = '') {
  $('coachIc').innerHTML = icon(ic);
  $('coachMsg').innerHTML = `${esc(title)}${sub ? `<small>${esc(sub)}</small>` : ''}`;
  $('coach').className = 'coach glass ' + cls;
}

function renderRide() {
  const p = player, s = p.seg, nx = p.next;
  const left = s.dauer - p.segT;
  const ramp = p.inRampSteps;
  const announce = ANNOUNCE;
  const harder = nx && nx.von > Math.max(s.von, s.bis) + 10;
  // !! = echtes true/false. Sonst ist „ending“ im letzten Abschnitt undefined, und classList.toggle(…, undefined)
  // schaltet die Klasse jede Sekunde um → Zeit blinkte beim Ausfahren rot/orange (16.11.)
  const ending = !!(!p.paused && nx && left <= announce && !(ramp && nx.ausrollen));
  setAccent(css(`--z${zone(s.pct)}`));

  // Vorwarnung per Vibration, einmal je Abschnitt. Kurze Abschnitte (30/30) erst 5 s vorher, sonst brummt es ständig.
  const buzzAt = s.dauer < 60 ? 5 : announce;
  if (!waiting && !p.paused && !ramp && nx && left <= buzzAt && p.buzzed !== p.i) { p.buzzed = p.i; buzz(1); }

  $('pauseBox').classList.toggle('hidden', !p.paused);
  $('pauseBtn').textContent = p.paused ? 'Weiter' : 'Pause';
  $('giveUpBtn').classList.toggle('hidden', !ramp);
  $('pauseBtn').classList.toggle('hidden', ramp);

  // Countdown + Zeitbalken: neutral, letzte 15 s orange, letzte 3 s rot. Was kommt, erklärt die Coach-Leiste.
  const cd = $('countdown');
  cd.textContent = fmt(left);
  const warn = ending && left > 3, alarm = ending && left <= 3;
  for (const el of [cd, $('ivbar')]) { el.classList.toggle('warn', warn); el.classList.toggle('alarm', alarm); }
  $('ivProgress').style.width = `${p.segT / s.dauer * 100}%`;
  $('ivName').textContent = s.name;
  $('ivDesc').textContent = s.beschreibung ?? '';

  // Selbst schalten (18.11.): vorher ankündigen, im Block sagen, wie viele Gänge es ungefähr sind, am Ende Rückkehr zu Watt fest
  const gearHint = w => { const d = gearFor(w) - p.gear; return d > 0 ? `Etwa ${d} ${d === 1 ? 'Gang' : 'Gänge'} hoch (Schalter rechts), Richtwert ${w} W.` : d < 0 ? `Etwa ${-d} ${d === -1 ? 'Gang' : 'Gänge'} runter (Schalter links), Richtwert ${w} W.` : `Der Gang passt, Richtwert ${w} W.`; };
  if (ending && nx.frei && !s.frei) coach('bike', 'Gleich schaltest du selbst', `Schalter rechts = schwerer, links = leichter. Du startest in Gang ${gearFor(nx.von) + 1}, passend zu ${nx.von} W.`, 'hard');
  else if (ending && s.frei && nx.frei) coach('bike', `Gleich ${nx.name}`, gearHint(nx.von), harder ? 'hard' : 'easy');
  else if (ending && s.frei) coach('bulb', 'Gleich wieder Watt fest', 'Der KICKR übernimmt, du musst nicht mehr schalten.', 'easy');
  else if (s.frei) coach('bike', s.tipp?.[0] ?? 'Selbst schalten', `${s.tipp?.[1] ?? 'Schalter rechts = schwerer, links = leichter.'} Gang ${p.gear + 1}.`);
  else if (ramp && ending) coach('zap', `Gleich ${nx.von} Watt`, 'Noch einmal 20 Watt mehr. Durchhalten!', 'hard');
  else if (ending && harder) coach('zap', `Gleich geht's los: ${nx.name}`, `${nx.frei ? 'Selbst schalten' : nx.von + ' W'}${nx.kadenz ? ` · Trittfrequenz ${nx.kadenz[0]}–${nx.kadenz[1]}` : ''} · Hände an den Lenker, mach dich bereit.`, 'hard');
  else if (ending) coach(nx.ausrollen ? 'flag' : 'drop', `Gleich geschafft, dann ${nx.ausrollen ? 'ausrollen' : nx.name.toLowerCase()}`, 'Noch kurz durchhalten. Danach ein Schluck trinken.', 'easy');
  else if (s.kadenz && s.dauer >= 240 && Math.abs(p.segT - s.dauer / 2) < 10) coach('gauge', 'Halbzeit in diesem Abschnitt', 'Weiter so, gleichmäßig bleiben.');
  else coach(s.pct >= 76 ? 'zap' : 'bulb', s.tipp?.[0] ?? s.name, s.tipp?.[1] ?? '');

  // Watt: 3-Sekunden-Schnitt, Ampel erst nach 6 s im Abschnitt (ERG braucht kurz zum Einregeln)
  const last = p.samples.slice(-3);
  const ist = last.length ? Math.round(last.reduce((a, x) => a + x[2], 0) / last.length) : Math.round(p.live.power || 0);
  const soll = s.frei ? null : p.target();
  const dev_ = soll ? (ist - soll) / soll : 0;
  const pst = s.frei || p.paused || p.segT < 6 || !soll ? 's-none' : ampel(Math.abs(dev_), .05, .10);
  setState($('pwTile'), pst);
  $('ist').textContent = ist;
  $('sollLabel').textContent = s.frei ? 'Richtwert' : 'Ziel';
  $('soll').textContent = s.frei ? s.von : soll;
  $('hint').innerHTML = pst === 's-none' ? '' : pst === 's-ok' ? `${icon('check')}im Ziel`
    : dev_ < 0 ? `${icon('up')}${pst === 's-warn' ? 'etwas mehr' : 'deutlich zu wenig'}` : `${icon('down')}${pst === 's-warn' ? 'etwas weniger' : 'deutlich zu viel'}`;
  // Skala: Ziel ±15 %, helles Band = ±5 %, Punkt = aktuell
  const ref = soll ?? s.von;
  gauge('wBand', 'wDot', ist, ref * .85, ref * 1.15, s.frei ? null : [ref * .95, ref * 1.05]);

  // Trittfrequenz: eigene Kachel, Ampel nur wenn der Plan ein Ziel vorgibt
  const cad = Math.round(p.live.cadence || 0);
  $('cad').textContent = cad || '–';
  if (s.kadenz) {
    const [lo, hi] = s.kadenz, off = cad < lo ? lo - cad : cad > hi ? cad - hi : 0;
    const cst = p.segT < 6 ? 's-none' : ampel(off, 0, 5);
    setState($('cadTile'), cst);
    $('cadGoal').textContent = `${lo}–${hi}`;
    $('cadHint').innerHTML = cst === 's-none' ? '' : off === 0 ? `${icon('check')}passt` : cad < lo ? `${icon('up')}schneller treten` : `${icon('down')}etwas ruhiger`;
    gauge('cBand', 'cDot', cad, lo - 15, hi + 15, [lo, hi]);
  } else {
    setState($('cadTile'), 's-none'); $('cadGoal').textContent = 'frei'; $('cadHint').textContent = '';
    gauge('cBand', 'cDot', cad, 60, 110, null);
  }

  const rem = p.remaining();
  $('left').textContent = rem == null ? (s.stufe ?? '–') : fmt(rem);
  $('leftLabel').textContent = rem == null ? 'Stufe' : 'noch gesamt';
  $('elapsed').textContent = fmt(p.t);
  // Uhrzeit, zu der das Training fertig ist (beim Ramp unbekannt, solange die Stufen laufen)
  $('endPill').classList.toggle('hidden', rem == null);
  if (rem != null) $('endAt').textContent = new Date(Date.now() + rem * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  $('next').innerHTML = nx
    ? `<span>Danach</span><b>${esc(nx.name)}</b><span>${ramp && !nx.ausrollen ? '' : fmt(nx.dauer) + ' · '}${nx.frei ? 'selbst schalten' : nx.von + ' W'}</span>`
    : '<span>Gleich geschafft</span>';

  $('cadTile').classList.toggle('dim', !s.kadenz);
  const badge = p.paused ? 'Pause' : s.frei ? `Selbst schalten · Gang ${p.gear + 1}` : `Watt fest${p.offset ? ` ${p.offset > 0 ? '+' : ''}${p.offset} W` : ''}`;
  $('modeBadge').textContent = badge;
  $('keys').innerHTML = ramp
    ? '<span><kbd>A</kbd>oder „Ich kann nicht mehr“: Test beenden</span><span>Der Test endet auch, wenn du aufhörst zu treten.</span>'
    : waiting ? '<span><kbd>A</kbd>Start (oder ein paar Sekunden treten)</span>'
    : `<span><kbd>A</kbd>Pause</span><span><kbd>Z</kbd>${unlocked ? 'Tasten sperren' : 'Tasten entsperren'}</span>`
      + (!unlocked ? ''   // gesperrt: unten nur A und Z (Wunsch 18.11.), dass die Schalter beim Selbst schalten wirken, zeigt die Pille oben
        : s.frei ? '<span><kbd>Schalter rechts</kbd>hoch</span><span><kbd>Schalter links</kbd>runter</span><span><kbd>Y</kbd>überspringen</span>'
        : `<span><kbd>Schalter rechts</kbd>+${ERG_STEP} W</span><span><kbd>Schalter links</kbd>−${ERG_STEP} W</span><span><kbd>Y</kbd>überspringen</span>`);
  // Sperr-Zustand oben im Kopf: gesperrt · gesperrt, aber Schalter aktiv · frei (blendet mit dem Kopf aus)
  $('lockSt').className = 'lockst' + (unlocked ? ' free' : s.frei ? ' shift' : '') + (ramp ? ' hidden' : '');
  renderFocus({ s, nx, left, ending, pst, dev_, cad });
  $('lockSt').innerHTML = unlocked ? `${icon('unlock')}Tasten frei` : s.frei ? `${icon('lock')}Gesperrt · Schalter aktiv` : `${icon('lock')}Tasten gesperrt`;

  const tl = timeline(p, p.rampEnd?.stufe ?? (s.stufe ?? 0) + 3);
  drawProfile($('rideProfile'), tl.view, { cursor: tl.cursor, line: tl.line });
  renderConn();
}

// Fokus-Modus: ein Wort (Halten / Mehr / Weniger / Gleich rauf …), Farbschein nach Ampel, Zeit grob in Minuten.
// Trittfrequenz nur als zweites, kleines Wort, wenn sie nicht passt.
function renderFocus({ s, nx, left, ending, pst, dev_, cad }) {
  const p = player, fx = $('focusView');
  fx.classList.toggle('hidden', !focusOn || waiting);
  if (!focusOn || waiting) return;
  const now = s.frei ? s.von : p.target();
  const up = nx && nx.von > now + 5, down = nx && nx.von < now - 5;
  const cadOff = s.kadenz && p.segT >= 6 && !ending && !p.paused ? (cad < s.kadenz[0] ? -1 : cad > s.kadenz[1] ? 1 : 0) : 0;
  let word, fc = '--green', ft = '12%';
  if (p.paused) { word = 'Pause'; fc = '--gray'; ft = '8%'; }
  else if (ending) { word = up ? 'Gleich rauf' : down ? 'Gleich runter' : 'Gleich weiter'; fc = '--soft'; ft = '8%'; }
  else if (s.frei) { word = 'Schalten'; fc = '--blue'; }
  else if (pst === 's-none' || pst === 's-ok') { word = 'Halten'; if (cadOff) { fc = '--yellow'; ft = '15%'; } }
  else { word = dev_ < 0 ? 'Mehr' : 'Weniger'; fc = pst === 's-warn' ? '--yellow' : '--red'; ft = pst === 's-warn' ? '18%' : '24%'; }
  const ok = st => st === 'verbunden' || st === 'wieder verbunden';
  $('fxWord').textContent = word;
  $('fxWord2').textContent = !ok(dev.trainerStatus) ? 'KICKR getrennt' : cadOff < 0 ? 'schneller treten' : cadOff > 0 ? 'ruhiger treten' : '';
  $('fxTime').textContent = ending ? `${left} s` : `noch ${Math.ceil(left / 60)} min`;
  fx.style.setProperty('--fc', css(fc));
  fx.style.setProperty('--ft', ft);
}

// ---------- Speichern ----------
function rideData(result) {
  const r = result ?? player.result();
  return {
    ...ride, ende: new Date().toISOString(),
    dauer: r.dauer, watt: r.watt, kadenz: r.kadenz, test: r.test ?? null, abschnitte: r.abschnitte,
    werte: { spalten: ['sekunde', 'soll_watt', 'watt', 'kadenz', 'abschnitt', 'sekunde_im_abschnitt'], daten: player.samples },
  };
}
async function saveRide(result) {
  if (!ride || !player) return;
  try {
    const data = rideData(result);
    await store.writeJSON('fahrten/' + ride.datei, data);
    const k = state.rides.findIndex(x => x.datei === ride.datei);
    if (k >= 0) state.rides[k] = data; else state.rides.push(data);
    return true;
  } catch (e) { toast('Speichern fehlgeschlagen: ' + e.message); return false; }
}

async function onDone(result) {
  clearInterval(saveTimer);
  releaseWakeLock();
  ride.status = player.aborted ? 'abgebrochen' : 'fertig';
  const ok = await saveRide(result);
  renderDone(result);
  $('savedHint').innerHTML = DEMO ? 'Demo-Modus: Diese Fahrt wird nicht im Datenordner gespeichert.'
    : ok ? `Gespeichert in <code>daten/fahrten/${esc(ride.datei)}</code>` : 'Nicht gespeichert, siehe Hinweis.';
  show('done');
}

// Rückblick auf eine frühere Fahrt: gleicher Bildschirm wie nach dem Training
let review = null;
function openReview(r, einheit) {
  player = null; ride = null; review = r;
  const p = { w: fromPlan(einheit, r.ftp), samples: r.werte?.daten ?? [], i: 0, segT: 0, rampEnd: null, aborted: r.status === 'abgebrochen' };
  renderDone({ dauer: r.dauer, watt: r.watt, kadenz: r.kadenz, abschnitte: r.abschnitte ?? [], test: null }, p, r);
  const d = new Date(r.start);
  $('doneTitle').textContent = r.status === 'abgebrochen' ? 'Abgebrochen.' : 'Gefahren.';
  $('doneLede').textContent = `${r.titel} · ${dayLabel(localDate(d))}, ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr · ${fmt(r.dauer)}.`;
  $('savedHint').innerHTML = `Gespeichert in <code>daten/fahrten/${esc(r.datei)}</code>`;
  show('done');
  window.scrollTo(0, 0);
  requestAnimationFrame(() => setFeel(r.gefuehl));
}
function setFeel(v) {
  const b = [...document.querySelectorAll('#feel button')].find(x => x.dataset.v === v);
  document.querySelectorAll('#feel button').forEach(x => x.classList.toggle('on', x === b));
  $('feelThumb').style.width = b ? b.offsetWidth + 'px' : '0';
  if (b) $('feelThumb').style.left = b.offsetLeft + 'px';
}

function renderDone(r, p = player, info = ride) {
  $('doneTitle').textContent = p.aborted ? 'Beendet.' : 'Geschafft.';
  $('doneLede').textContent = `${info.titel} · ${fmt(r.dauer)} gefahren.`;
  const stats = [[fmt(r.dauer), 'Zeit'], [r.watt + ' W', 'Ø Watt'], [r.kadenz || '–', 'Ø Trittfrequenz']];
  if (r.test?.art === 'ramp') stats.push([r.test.letzte_stufe ?? '–', 'letzte Stufe']);
  else stats.push([r.abschnitte.length, 'Abschnitte']);
  $('doneStats').innerHTML = stats.map(([v, l]) => `<div class="stat glass"><b class="num">${v}</b><span>${l}</span></div>`).join('');

  const t = r.test;
  $('testResult').classList.toggle('hidden', !t);
  if (t) {
    const old = state.profile.ftp;
    $('resFtp').innerHTML = t.ftp ? `${t.ftp}<span>Watt</span>` : '<span style="margin:0">kein Ergebnis</span>';
    $('resText').textContent = t.ftp
      ? (t.art === 'ramp' ? `Beste Minute ${t.beste_minute} W, davon 75 %. ` : `20-Minuten-Schnitt ${t.schnitt_20min} W, davon 95 %. `) + (old ? `Bisher: ${old} W.` : 'Damit schreibt Claude deinen ersten Plan.')
      : (t.art === 'ramp' ? 'Der Test war zu kurz für ein Ergebnis (mindestens eine volle Stufe nötig).' : 'Die 20 Minuten wurden nicht ganz gefahren, daher kein Ergebnis.');
    $('takeFtp').classList.toggle('hidden', !t.ftp);
    $('takeFtp').disabled = false; $('takeFtp').textContent = 'Als FTP übernehmen';
    $('takeFtp').onclick = async () => {
      state.profile = { ...state.profile, ftp: t.ftp, ftp_quelle: t.art === 'ramp' ? 'Ramp-Test' : '20-Minuten-Test', aktualisiert: new Date().toISOString() };
      try { await store.writeJSON('profil.json', state.profile); toast(`FTP ${t.ftp} W gespeichert`); $('takeFtp').disabled = true; $('takeFtp').textContent = 'Übernommen'; }
      catch (e) { toast('Speichern fehlgeschlagen: ' + e.message); }
    };
  }

  document.querySelectorAll('#feel button').forEach(b => b.classList.remove('on'));
  $('feelThumb').style.width = '0';
  $('segTable').innerHTML = `<div class="row head"><span>Abschnitt</span><span>Zeit</span><span>Ziel</span><span>Ø Watt</span><span>U/min</span></div>` +
    r.abschnitte.map(a => `<div class="row"><span>${esc(a.name)}</span><span class="num">${fmt(a.dauer)}</span><span class="num">${a.soll ?? '–'}</span><span class="num">${a.watt}</span><span class="num">${a.kadenz || '–'}</span></div>`).join('');
  const tl = timeline(p, p.rampEnd?.stufe ?? 99);
  drawProfile($('doneProfile'), tl.view, { line: tl.line });
}

$('feel').onclick = async e => {
  const b = e.target.closest('button'); if (!b) return;
  setFeel(b.dataset.v);
  if (review) {   // Gefühl einer früheren Fahrt ändern
    review.gefuehl = b.dataset.v;
    try { if (!DEMO) await store.writeJSON('fahrten/' + review.datei, review); toast('Gefühl gespeichert'); }
    catch (err) { toast('Speichern fehlgeschlagen: ' + err.message); }
    return;
  }
  ride.gefuehl = b.dataset.v;
  if (await saveRide(player.result())) toast('Gefühl gespeichert');
};
$('homeBtn').onclick = () => { player = null; review = null; renderHome(); show('home'); };

// ---------- Bildschirm wach halten ----------
async function requestWakeLock() { try { wakeLock = await navigator.wakeLock?.request('screen'); } catch { /* egal */ } }
function releaseWakeLock() { wakeLock?.release?.(); wakeLock = null; }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && player && !player.done) requestWakeLock(); });
window.addEventListener('beforeunload', e => { if (player && !player.done) { e.preventDefault(); e.returnValue = ''; } });

// ---------- Bedienung ----------
$('startBtn').onclick = () => homeWorkout && startRide(homeWorkout, homeEinheit);
// Schieber Profil | Ablauf
$('phasesBtn').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  const ablauf = b.dataset.v === 'ablauf';
  $('phasesBtn').dataset.v = b.dataset.v;
  $('phasesBtn').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  $('phases').classList.toggle('hidden', !ablauf);
  $('heroProfile').classList.toggle('hidden', ablauf);
};
$('rampBtn').onclick = () => startRide(rampTest(), null);
$('ftp20Btn').onclick = () => startRide(ftp20Test(state.profile.ftp), null);
$('giveUpBtn').onclick = () => player?.stopRamp('manuell');
$('pauseBtn').onclick = () => waiting ? beginRide() : player?.togglePause();
$('resumeBtn').onclick = () => player?.togglePause();
$('goBtn').onclick = () => beginRide();
// Tastenübersicht (i)
const closeKeys = () => $('keysModal').classList.add('hidden');
$('keysInfo').onclick = () => { $('keysModal').classList.remove('hidden'); $('keysInfo').blur(); };
$('keysClose').onclick = () => { closeKeys(); $('keysClose').blur(); };
$('keysModal').addEventListener('click', e => { if (e.target === $('keysModal')) closeKeys(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeKeys(); });
$('readyCancel').onclick = () => cancelReady();
$('endBtn').onclick = () => { if (waiting) return cancelReady(); if (confirm('Training beenden? Die Fahrt wird gespeichert.')) player?.finish(true); };
$('themeBtn').onclick = () => {
  const light = document.documentElement.dataset.theme !== 'light';
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
  $('themeBtn').innerHTML = icon(light ? 'moon' : 'sun');
  try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch { /* egal */ }
};
try { if (localStorage.getItem('theme') === 'light') $('themeBtn').click(); } catch { /* egal */ }

/* ---------- Server: Lebenszeichen + Beenden ----------
   serve.py geht 10 Min. nach dem letzten Lebenszeichen von selbst aus.
   Fahrten speichert die App direkt in den Ordner, nicht über den Server. */
const api = path => fetch(path, { method: 'POST', headers: { 'X-Rolle': '1' } });
let serverGone = false;
async function ping() {
  try { await api('/api/ping'); serverGone = false; }
  catch {
    if (!serverGone && !(player && !player.done)) toast('rolle. läuft nicht mehr. Zum Neustart rolle. im Dock anklicken.');
    serverGone = true;
  }
}
if (!DEMO) { ping(); setInterval(ping, 60_000); }   // Portfolio-Demo: kein lokaler Server

// Neuer Plan von Claude? plan.json alle 20 s prüfen und dann von selbst neu laden (nicht während einer Fahrt)
var planStamp = null;
setInterval(async () => {
  if (!state.ready || !store.mtime || (player && !player.done) || document.visibilityState !== 'visible') return;
  const m = await store.mtime('plan.json');
  if (m && planStamp && m !== planStamp) { await load(); toast('Neuer Plan geladen'); }
}, 20_000);

// ---------- Demo: Knopf oben öffnet ?demo im eigenen Tab, dort springt die Leiste unten zu jeder Seite ----------
if (DEMO) {
  $('demoBtn').classList.add('hidden');
  $('demoBar').classList.remove('hidden');
  $('quitBtn').lastChild.textContent = 'Demo beenden';
  if (FAST) $('demoFast').classList.add('on');
}
function demoStop() {   // laufende Demo-Fahrt still abbrechen, ohne Fertig-Seite
  if (player) { player.done = true; clearInterval(player.timer); }
  clearInterval(saveTimer);
  waiting = false; player = null; ride = null;
  $('readyBox').classList.add('hidden');
  document.querySelectorAll('.modal-bg').forEach(m => m.classList.add('hidden'));
  closeBig();
}
async function demoRide(w, e, { go = true, frei = false, pause = false } = {}) {
  demoStop();
  await startRide(w, e);
  if (!go || !player) return;
  beginRide();
  if (frei) while (!player.seg.frei && !player.done) player.skip();
  if (pause) player.togglePause();
}
$('demoBar').onclick = async ev => {
  const go = ev.target.closest('button')?.dataset.go; if (!go) return;
  focusOn = go === 'fokus'; $('focusView').classList.add('hidden');   // Portfolio-Demo: eigener Sprung in den Fokus-Modus
  if (go === 'fokus' && homeWorkout) return demoRide(homeWorkout, homeEinheit);
  ev.target.blur();
  const w = homeWorkout, e = homeEinheit;
  if (go === 'home') { demoStop(); renderHome(); show('home'); }
  else if (go === 'ready' && w) demoRide(w, e, { go: false });
  else if (go === 'ride' && w) demoRide(w, e);
  else if (go === 'pause' && w) demoRide(w, e, { pause: true });
  else if (go === 'frei') {
    // erste Einheit im Plan mit „selbst schalten“, sonst der 20-Minuten-Test
    const pe = (state.plan.einheiten ?? []).find(x => fromPlan(x, state.profile.ftp).segs?.some(s => s.frei));
    demoRide(pe ? fromPlan(pe, state.profile.ftp) : ftp20Test(state.profile.ftp), pe ?? null, { frei: true });
  }
  else if (go === 'done') {
    // echte letzte Fahrt als Fertig-Seite, sonst eine Einheit im Schnelldurchlauf beenden
    demoStop();
    const r = [...state.rides].filter(x => x.status !== 'laeuft' && x.einheit_id).sort((a, b) => b.start.localeCompare(a.start))[0];
    const pe = r && state.plan.einheiten?.find(x => x.id === r.einheit_id);
    if (pe) openReview(r, pe);
    else if (w) { await startRide(w, e); beginRide(); while (!player.done) player.skip(); }
  }
  else if (go === 'big') { demoStop(); renderHome(); show('home'); openBig(); }
  else if (go === 'keys') {   // die Übersicht gehört zum Fahren-Bildschirm
    if (!$('s-ride').classList.contains('on') && w) await demoRide(w, e);
    $('keysModal').classList.remove('hidden');
  }
  else if (go === 'fast') { const p = new URLSearchParams(location.search); FAST ? p.delete('fast') : p.set('fast', ''); location.search = p.toString().replace(/=(&|$)/g, '$1'); }
};

$('quitBtn').onclick = async () => {
  if (DEMO) { demoStop(); window.close(); location.href = location.pathname; return; }   // Demo: nur den Tab schließen, Server läuft weiter
  if (waiting) cancelReady();
  if (player && !player.done && !confirm('Es läuft noch ein Training. Trotzdem beenden? Die Fahrt wird gespeichert.')) return;
  if (player && !player.done) await player.finish(true);
  disconnectAll();
  try { await api('/api/stop'); } catch { /* war schon aus */ }
  document.querySelectorAll('.top, .screen').forEach(el => el.classList.add('hidden'));
  $('offScreen').classList.remove('hidden');
  window.close();   // klappt nur, wenn Chrome es erlaubt; sonst bleibt der Hinweis stehen
};

initStore();
