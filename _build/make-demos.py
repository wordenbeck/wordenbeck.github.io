"""Erzeugt die Demo-Kopien der Apps unter Portfolio/demos/.

Die Originale bleiben unverändert. Pro App werden nur kleine, demo-spezifische
Anpassungen gemacht (Namen anonymisiert, Ton aus, kein Service Worker ...).

Aufruf:  python3 _build/make-demos.py   (aus dem Portfolio-Ordner)
Mahlzeit wird separat mit Vite gebaut, siehe _build/mahlzeit/vite.config.mjs.
"""
from pathlib import Path

PORTFOLIO = Path(__file__).resolve().parent.parent
DOJO = PORTFOLIO.parent
OUT = PORTFOLIO / "demos"


def replace(text, old, new, count=1):
    if old not in text:
        raise SystemExit(f"Nicht gefunden: {old[:60]!r}")
    return text.replace(old, new, count)


def write(rel, text):
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    print("geschrieben:", path.relative_to(PORTFOLIO))


# --- Kalo: klickbarer Prototyp, aber nur der App-Screen, ohne Übersicht -------------
kalo = (DOJO / "Kalo-Prototype/index.html").read_text(encoding="utf-8")
kalo_demo = """
<style>
  html,body{background:#f8fafc!important;overflow:hidden!important}
  #overview,.detail-nav,.iphone-notch,.status-bar{display:none!important}
  #detail-container{display:block!important;padding:0!important;margin:0!important}
  .iphone{transform:none!important;position:fixed!important;inset:0!important;width:100%!important;height:100%!important;
    padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;margin:0!important}
  .iphone-screen{width:100%!important;height:100%!important;border-radius:0!important}
</style>
<script>window.addEventListener('load',()=>show('dashboard'));</script>
"""
kalo = replace(kalo, "</body>", kalo_demo + "</body>")
write("kalo/index.html", kalo)

# --- Human vs. AI: Ton aus, Kennzahlen auf der Startseite an die Daten angepasst ------
human = (DOJO / "human-vs-ai/index.html").read_text(encoding="utf-8")
human = replace(human, "muted: false", "muted: true")
human = replace(human, '<div class="v">15</div><div class="l">Roles</div>', '<div class="v">10</div><div class="l">Roles</div>')
human = replace(human, '<div class="v">25</div><div class="l">AI Skills</div>', '<div class="v">36</div><div class="l">AI Skills</div>')
human = replace(human, '<div class="v">25</div><div class="l">Human<br>Strengths</div>', '<div class="v">35</div><div class="l">Human<br>Strengths</div>')
for line in human.splitlines():
    if 'href="favicon/' in line:
        human = human.replace(line + "\n", "")
write("human/index.html", human)

# --- Punktekönig: neutrale Spielernamen, eigener Speicher, kein Service Worker ---------
punkte = (DOJO / "punkte-app/deploy/index.html").read_text(encoding="utf-8")
punkte = replace(punkte, "const DEFAULTS=['Theo','Greta','Mama','Papa'];", "const DEFAULTS=['Spieler A','Spieler B','Spieler C','Spieler D'];")
punkte = replace(punkte, '<body data-store="d2"', '<body data-store="demo"')
punkte = replace(punkte, "const HKEY='punkte_history';", "const HKEY='punkte_demo_history';")
punkte = replace(punkte, "if('serviceWorker' in navigator)", "if(false)")
punkte = replace(punkte, '<link rel="manifest" href="manifest.webmanifest">', "")
punkte = replace(punkte, '<link rel="apple-touch-icon" href="apple-touch-icon-v6.png">', "")
write("punkte/index.html", punkte)
