"""Baut die Demo von rolle. für das Portfolio.

Kopiert die App aus CodingDojo/rolle/app nach demos/rolle/app, passt sie für eine öffentliche Demo an
und legt einen erfundenen Beispiel-Datensatz in demos/rolle/beispiel/ an. Echte Trainingsdaten aus
rolle/daten werden NIE kopiert.

Anpassungen an der Kopie (die echte App bleibt unverändert):
  - Demo liest den Beispiel-Datensatz statt rolle/daten; „HEUTE“, „HEUTE-2“ usw. werden zum echten Datum
  - Fahrten-Liste kommt aus beispiel/fahrten/index.json (GitHub Pages zeigt keine Ordner an)
  - kein Lebenszeichen an den lokalen Server (gibt es online nicht)
  - Knöpfe Demo/Beenden, Demo-Hinweis und Demo-Leiste unsichtbar (die Leiste steuert das Drehbuch)

Aufruf:  python3 _build/make-rolle-demo.py   (aus dem Portfolio-Ordner)
"""
from pathlib import Path
import json
import random
import re
import shutil

PORTFOLIO = Path(__file__).resolve().parent.parent
SRC = PORTFOLIO.parent / "rolle" / "app"
OUT = PORTFOLIO / "demos" / "rolle"
FTP = 240


def patch(path, pairs):
    s = path.read_text(encoding="utf-8")
    for old, new in pairs:
        if old not in s:
            raise SystemExit(f"Stelle nicht gefunden in {path.name}: {old[:60]!r} – hat sich die App geändert?")
        s = s.replace(old, new, 1)
    path.write_text(s, encoding="utf-8")


# ---------- App kopieren ----------
if OUT.exists():
    shutil.rmtree(OUT)
app = OUT / "app"
shutil.copytree(SRC, app, ignore=shutil.ignore_patterns("tasten.html", "beispiel-plan.json", ".DS_Store"))

patch(app / "js" / "store.js", [
    ("export class DemoStore {",
     """// Portfolio-Demo: „HEUTE“, „HEUTE-2“, „HEUTE+4“ in den Beispieldaten werden zum echten Datum
const heute = v => {
  if (typeof v === 'string') return v.replace(/HEUTE([+-]\\d+)?/g, (_, n) => {
    const d = new Date(); d.setDate(d.getDate() + Number(n || 0));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  if (Array.isArray(v)) return v.map(heute);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, heute(x)]));
  return v;
};

export class DemoStore {"""),
    ("constructor(base = '../daten/')", "constructor(base = '../beispiel/')"),
    ("return r?.ok ? r.json() : null;", "return r?.ok ? heute(await r.json()) : null;"),
    ("""    const html = await fetch(this.base + path + '/', { cache: 'no-store' }).then(r => r.ok ? r.text() : '').catch(() => '');
    const real = [...html.matchAll(/href="([^"]+\\.json)"/g)].map(m => decodeURIComponent(m[1]));""",
     """    const real = await fetch(this.base + path + '/index.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []);"""),
])
patch(app / "js" / "main.js", [
    ("ping(); setInterval(ping, 60_000);", "if (!DEMO) { ping(); setInterval(ping, 60_000); }   // Portfolio-Demo: kein lokaler Server"),
])
with (app / "style.css").open("a", encoding="utf-8") as f:
    f.write("\n/* Portfolio-Demo: Knöpfe für den lokalen Betrieb und die Demo-Leiste ausblenden (das Drehbuch klickt sie unsichtbar) */\n"
            "#demoBtn, #quitBtn, #demoTag, #demoBar { display: none !important; }\n")

# ---------- Beispiel-Datensatz (erfunden) ----------
W = lambda pct: round(FTP * pct / 100)
WEEK = [
    {"id": "demo-grundlage", "datum": "HEUTE-4", "typ": "workout", "titel": "Grundlage 60 mit Würze", "haerte": 1,
     "zweck": "Ruhige Grundlage, aufgelockert durch kurze Druck- und Trittfrequenz-Wechsel.",
     "abschnitte": [
         {"name": "Einrollen", "beschreibung": "locker reinkommen", "min": 8, "von": 50, "bis": 62},
         {"wiederhole": 4, "abschnitte": [
             {"name": "Grundlage {n} von 4", "beschreibung": "gleichmäßig", "min": 8, "prozent": 68, "kadenz": [88, 95],
              "tipp": ["Ruhig rollen", "So, dass du dich noch unterhalten könntest."]},
             {"name": "Würze {n} von 4", "beschreibung": "kurz mehr Druck", "min": 2, "prozent": 85, "kadenz": [80, 85],
              "tipp": ["Etwas mehr Druck", "Langsamer treten, kräftiger drücken."]}]},
         {"name": "Ausrollen", "beschreibung": "locker", "min": 12, "von": 62, "bis": 50}]},
    {"id": "demo-vo2", "datum": "HEUTE-2", "typ": "workout", "titel": "VO2max 30/30", "haerte": 3,
     "zweck": "Kurze, harte Wechsel für mehr Spitzenleistung.",
     "abschnitte": [
         {"name": "Aufwärmen", "beschreibung": "langsam steigern", "min": 12, "von": 50, "bis": 75},
         {"wiederhole": 10, "abschnitte": [
             {"name": "Hart {n} von 10", "beschreibung": "30 Sekunden voll", "sek": 30, "prozent": 120, "kadenz": [95, 105],
              "tipp": ["Jetzt hart", "Schnell treten, Oberkörper ruhig."]},
             {"name": "Locker", "beschreibung": "erholen", "sek": 30, "prozent": 55}]},
         {"name": "Locker", "beschreibung": "erholen", "min": 6, "prozent": 55},
         {"name": "Ausrollen", "beschreibung": "locker", "min": 12, "von": 60, "bis": 50}]},
    {"id": "demo-sweetspot", "datum": "HEUTE", "typ": "workout", "titel": "Sweet Spot 3 × 10", "haerte": 2,
     "zweck": "Drei Blöcke knapp unter deiner Grenze. Anstrengend, aber machbar.",
     "abschnitte": [
         {"name": "Aufwärmen", "beschreibung": "langsam steigern", "min": 10, "von": 50, "bis": 75},
         {"wiederhole": 3, "abschnitte": [
             {"name": "Block {n} von 3", "beschreibung": "anstrengend, aber machbar", "min": 10, "prozent": 90, "kadenz": [88, 95],
              "tipp": ["Gleichmäßig drücken", "Nicht zu schnell anfangen, die letzten Minuten zählen."]},
             {"name": "Locker", "beschreibung": "erholen", "min": 4, "prozent": 55}]},
         {"name": "Selbst schalten", "beschreibung": "Gefühl für die Gänge", "min": 5, "prozent": 75, "frei": True,
          "tipp": ["Jetzt du", "Schalte so, dass es sich zügig, aber locker anfühlt."]},
         {"name": "Ausfahren", "beschreibung": "langsam runter", "min": 8, "von": 60, "bis": 50}]},
    {"id": "demo-kadenz", "datum": "HEUTE+2", "typ": "workout", "titel": "Trittfrequenz und Tempo", "haerte": 1,
     "zweck": "Runder treten: Wechsel zwischen schnellen und kräftigen Umdrehungen.",
     "abschnitte": [
         {"name": "Einrollen", "beschreibung": "locker", "min": 10, "von": 50, "bis": 65},
         {"wiederhole": 5, "abschnitte": [
             {"name": "Schnell {n} von 5", "beschreibung": "hohe Trittfrequenz", "min": 3, "prozent": 70, "kadenz": [100, 110]},
             {"name": "Tempo {n} von 5", "beschreibung": "zügig", "min": 4, "prozent": 82, "kadenz": [85, 92]}]},
         {"name": "Ausrollen", "beschreibung": "locker", "min": 10, "von": 60, "bis": 50}]},
    {"id": "demo-lang", "datum": "HEUTE+4", "typ": "workout", "titel": "Lange Runde mit Sweet Spot", "haerte": 2,
     "zweck": "Die lange Einheit der Woche, mit zwei Sweet-Spot-Blöcken in der Mitte.",
     "abschnitte": [
         {"name": "Einrollen", "beschreibung": "locker", "min": 15, "von": 50, "bis": 65},
         {"name": "Grundlage", "beschreibung": "gleichmäßig", "min": 25, "prozent": 68},
         {"wiederhole": 2, "abschnitte": [
             {"name": "Sweet Spot {n} von 2", "beschreibung": "knapp unter der Grenze", "min": 12, "prozent": 90},
             {"name": "Locker", "beschreibung": "erholen", "min": 6, "prozent": 58}]},
         {"name": "Grundlage", "beschreibung": "gleichmäßig", "min": 15, "prozent": 68},
         {"name": "Ausrollen", "beschreibung": "locker", "min": 9, "von": 60, "bis": 50}]},
]


def expand(sections):
    """Abschnitte mit Wiederholungen flach machen: [(name, sekunden, von%, bis%)]"""
    out = []
    for a in sections:
        if "wiederhole" in a:
            for n in range(1, a["wiederhole"] + 1):
                out += [(name.replace("{n}", str(n)), d, v, b) for name, d, v, b in expand(a["abschnitte"])]
        else:
            sec = a.get("sek") or a["min"] * 60
            out.append((a["name"], sec, a.get("von", a.get("prozent")), a.get("bis", a.get("prozent"))))
    return out


def ride(unit, start, feel, seed):
    """Erfundene Fahrt mit Werten jede Sekunde (leicht verrauscht um die Sollwatt)"""
    rnd = random.Random(seed)
    rows, parts, t = [], [], 0
    for i, (name, dur, von, bis) in enumerate(expand(unit["abschnitte"])):
        ws, ks = [], []
        for s in range(dur):
            soll = W(von + (bis - von) * s / max(1, dur - 1))
            watt = max(0, round(soll + rnd.gauss(0, 4)))
            kad = round(rnd.gauss(91 if soll < W(100) else 98, 2))
            rows.append([t, soll, watt, kad, i, s]); ws.append(watt); ks.append(kad); t += 1
        parts.append({"name": name, "dauer": dur, "soll": W((von + bis) / 2), "watt": round(sum(ws) / dur), "kadenz": round(sum(ks) / dur)})
    slug = re.sub(r"[^a-z0-9]+", "-", unit["titel"].lower().replace("ü", "ue")).strip("-")
    datei = f"{unit['datum']}_{start.replace(':', '')}_{slug}.json"
    return datei, {
        "version": 1, "einheit_id": unit["id"], "titel": unit["titel"], "typ": "workout",
        "start": f"{unit['datum']}T{start}:00", "ftp": FTP, "status": "fertig", "gefuehl": feel, "datei": datei,
        "ende": f"{unit['datum']}T{start}:00", "dauer": t,
        "watt": round(sum(r[2] for r in rows) / t), "kadenz": round(sum(r[3] for r in rows) / t),
        "abschnitte": parts,
        "werte": {"spalten": ["sekunde", "soll_watt", "watt", "kadenz", "abschnitt", "sekunde_im_abschnitt"], "daten": rows},
    }


data = OUT / "beispiel"
(data / "fahrten").mkdir(parents=True)
(data / "profil.json").write_text(json.dumps({"ftp": FTP, "ftp_quelle": "Ramp-Test", "aktualisiert": "HEUTE-9T08:50:00"}, ensure_ascii=False, indent=1), encoding="utf-8")
(data / "plan.json").write_text(json.dumps({"name": "Beispielwoche", "einheiten": WEEK}, ensure_ascii=False, indent=1), encoding="utf-8")
files = []
for unit, start, feel, seed in [(WEEK[0], "18:30", "passend", 1), (WEEK[1], "07:15", "hart", 2)]:
    name, r = ride(unit, start, feel, seed)
    # Dateiname ohne Platzhalter, im Inhalt bleibt „HEUTE-…“ (wird beim Laden zum Datum)
    real = name.replace("HEUTE-", "tag-minus-")
    (data / "fahrten" / real).write_text(json.dumps(r, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    files.append(real)
(data / "fahrten" / "index.json").write_text(json.dumps(files), encoding="utf-8")
(data / "README.md").write_text("Erfundene Beispieldaten für die Portfolio-Demo. Erzeugt von _build/make-rolle-demo.py, nicht von Hand ändern.\n", encoding="utf-8")
print("Demo gebaut:", app.relative_to(PORTFOLIO), "+", len(files), "Beispielfahrten")
