// Workouts: Plan-Einheiten in fahrbare Abschnitte umwandeln, dazu die beiden FTP-Tests.
// Ein Abschnitt: { name, beschreibung, dauer (s), von, bis (Watt), kadenz [lo,hi]|null, tipp [Titel, Text]|null,
//                  frei (selbst schalten statt Watt fest), stufe (Ramp), messung (20-Min-Test), ausrollen }

export const fmt = s => {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0');
};
export const zone = pct => pct < 56 ? 1 : pct < 76 ? 2 : pct < 91 ? 3 : pct < 106 ? 4 : pct < 121 ? 5 : 6;
export const DEFAULT_FTP = 200;

const BLOCK_TIP = ['Gleichmäßig drücken', 'Oberkörper ruhig, Schultern locker.'];
const EASY_TIP = ['Durchatmen und locker treten', 'Guter Moment für einen Schluck.'];

function expand(list, n = null) {
  const out = [];
  for (const a of list ?? []) {
    if (a.wiederhole) {
      for (let i = 1; i <= a.wiederhole; i++) out.push(...expand(a.abschnitte, i));
    } else {
      out.push({ ...a, name: String(a.name ?? 'Abschnitt').replace('{n}', n ?? '') });
    }
  }
  return out;
}

export function fromPlan(einheit, ftp) {
  if (einheit.typ === 'ramp') return { ...rampTest(), id: einheit.id, titel: einheit.titel ?? 'FTP-Test (Ramp)' };
  if (einheit.typ === 'ftp20') return { ...ftp20Test(ftp), id: einheit.id, titel: einheit.titel ?? 'FTP-Test (20 Minuten)' };
  const base = ftp ?? DEFAULT_FTP;
  const segs = expand(einheit.abschnitte).map(a => {
    const von = a.von ?? a.prozent ?? 50, bis = a.bis ?? a.prozent ?? von;
    const easy = Math.max(von, bis) < 70;
    const auto = bis > von + 5 ? ['Locker einrollen', 'Die Watt steigen langsam. Finde deinen Rhythmus.']
      : von > bis + 5 ? ['Ausrollen lassen', 'Locker treten, gut gemacht.']
      : a.frei ? ['Freie Fahrt', 'Schalte, wie es sich gut anfühlt.'] : easy ? EASY_TIP : BLOCK_TIP;
    return {
      name: a.name, beschreibung: a.beschreibung ?? '',
      dauer: Math.round(a.sek ?? (a.min ?? 1) * 60),
      von: Math.round(von / 100 * base), bis: Math.round(bis / 100 * base),
      pct: (von + bis) / 2, kadenz: a.kadenz ?? null,
      tipp: a.tipp ?? auto,
      frei: !!a.frei,
    };
  });
  return { id: einheit.id, typ: 'workout', titel: einheit.titel, zweck: einheit.zweck ?? '', haerte: einheit.haerte ?? 2, segs };
}

// Ramp-Test: 5 min einrollen, dann jede Minute +20 W, bis es nicht mehr geht. FTP = 75 % der besten Minute.
export function rampTest(start = 100, step = 20, ftpGuess = DEFAULT_FTP) {
  const segs = [{
    name: 'Einrollen', beschreibung: 'locker warm werden', dauer: 300, von: Math.round(start * .5), bis: start,
    pct: 40, tipp: ['Locker einrollen', 'Gleich beginnt der Test. Er wird jede Minute etwas schwerer.'],
  }];
  for (let i = 0; i < 40; i++) {
    const w = start + i * step;
    segs.push({ name: `Stufe ${i + 1}`, beschreibung: 'so lange es geht', dauer: 60, von: w, bis: w, pct: w / ftpGuess * 100, stufe: i + 1,
      tipp: [`Stufe ${i + 1}: ${w} Watt`, 'Weiter so. Wenn nichts mehr geht: Taste A oder „Ich kann nicht mehr“.'] });
  }
  // Ausrollen nicht zu niedrig: sehr wenige Watt fühlen sich im ERG zäh an (Feedback 15.11.)
  segs.push({ name: 'Ausrollen', beschreibung: 'locker', dauer: 300, von: Math.round(start * 1.3), bis: Math.round(start * 1.1), pct: 45, ausrollen: true,
    tipp: ['Geschafft, jetzt ausrollen', 'Ganz locker treten, bis der Puls runterkommt.'] });
  return { typ: 'ramp', titel: 'FTP-Test (Ramp)', zweck: 'Jede Minute 20 Watt mehr, bis es nicht mehr geht. Deine FTP ist 75 % deiner besten Minute.', haerte: 3, segs };
}

// 20-Minuten-Test: aufwärmen, Vorbelastung, dann 20 min so hart wie gleichmäßig möglich. FTP = 95 % des Schnitts.
// Die 20 Minuten fährst du selbst (Schalten über den Ride), der Trainer gibt keine Watt vor.
export function ftp20Test(ftp) {
  const f = ftp ?? DEFAULT_FTP, W = p => Math.round(p / 100 * f);
  const segs = [
    { name: 'Aufwärmen', beschreibung: 'langsam steigern', dauer: 600, von: W(50), bis: W(70), pct: 60, tipp: ['Locker aufwärmen', 'Nimm dir Zeit, der Test ist lang.'] },
  ];
  for (let i = 1; i <= 3; i++) {
    segs.push({ name: `Kurz zügig ${i} von 3`, beschreibung: 'Beine wecken', dauer: 60, von: W(100), bis: W(100), pct: 100, kadenz: [95, 105], tipp: ['Kurz zügig', 'Schnell treten, nicht verbeißen.'] });
    segs.push({ name: 'Locker', beschreibung: 'erholen', dauer: 60, von: W(50), bis: W(50), pct: 50, tipp: EASY_TIP });
  }
  segs.push(
    { name: 'Locker', beschreibung: 'erholen', dauer: 240, von: W(50), bis: W(50), pct: 50, tipp: EASY_TIP },
    { name: 'Vorbelastung', beschreibung: 'hart, aber kontrolliert', dauer: 300, von: W(105), bis: W(105), pct: 105, tipp: ['Vorbelastung', 'Hart, aber nicht alles. Das macht den Test genauer.'] },
    { name: 'Locker', beschreibung: 'erholen vor dem Test', dauer: 600, von: W(50), bis: W(50), pct: 50, tipp: ['Erholen', 'Trinken, durchatmen. Gleich kommen die 20 Minuten.'] },
    { name: '20 Minuten Test', beschreibung: 'so hart wie gleichmäßig möglich', dauer: 1200, von: W(100), bis: W(100), pct: 100, frei: true, messung: true,
      tipp: ['20 Minuten: gleichmäßig hart', `Richtwert um ${W(100)} W. Mit den Schaltern regeln. In den letzten 5 Minuten alles geben.`] },
    { name: 'Ausrollen', beschreibung: 'ganz locker', dauer: 600, von: W(50), bis: W(40), pct: 45, ausrollen: true, tipp: ['Geschafft, jetzt ausrollen', 'Ganz locker treten.'] },
  );
  return { typ: 'ftp20', titel: 'FTP-Test (20 Minuten)', zweck: 'Nach dem Aufwärmen fährst du 20 Minuten so hart, wie du es gleichmäßig durchhältst. Deine FTP ist 95 % davon.', haerte: 3, segs };
}

export const totalDuration = w => w.typ === 'ramp'
  ? w.segs[0].dauer + 15 * 60 + w.segs.at(-1).dauer   // Ramp: geschätzt ~15 Stufen
  : w.segs.reduce((s, x) => s + x.dauer, 0);

export const haerteText = h => ['', 'leicht', 'mittel', 'hart'][h] ?? 'mittel';
