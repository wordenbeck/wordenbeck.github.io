"""Erzeugt alle HTML-Seiten aus einer Vorlage.

  index.html               Startseite (Glas-Hero mit iPhone-Karussell, Querkacheln)
  <id>/index.html          Projektseite je Projekt (Demo im iPhone bzw. Browserfenster)
  warum/index.html         Warum diese Seite (roter Faden)
  ueber-mich/index.html    Profil

Aufruf:  python3 _build/make-pages.py   (aus dem Portfolio-Ordner)
Inhalte stehen in content.js, Aufbau und Aussehen in assets/ – hier nur das Gerüst.
"""
from pathlib import Path
import time

# Versionsnummer an CSS/JS, damit Browser nach Änderungen nicht die alte Fassung aus dem Zwischenspeicher zeigen
V = time.strftime("%Y%m%d%H%M%S")

PORTFOLIO = Path(__file__).resolve().parent.parent
IDS = ["kalo", "mahlzeit", "human", "vuca", "punkte", "zirkus"]
CSS = ["core.css", "glas-base.css", "glas-pages.css"]


def page(kind, root, project=None):
    css = CSS + (["home.css"] if kind == "home" else [])
    links = "\n".join(f'<link rel="stylesheet" href="{root}assets/{c}?v={V}">' for c in css)
    demo = (f'<script src="{root}demo-player.js?v={V}"></script>\n<script src="{root}demo-scripts.js?v={V}"></script>\n'
            if kind == "project" else "")
    pid = f' data-project="{project}"' if project else ""
    return f"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thomas Wordenbeck</title>
<meta name="description" content="Produkte für den eigenen Alltag und für Menschen in meinem Umfeld – gebaut von Thomas Wordenbeck.">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#060a12">
<link rel="icon" href="{root}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300..700&display=swap" rel="stylesheet">
{links}
</head>
<body data-page="{kind}" data-root="{root}"{pid}>
<div id="app"></div>
<script src="{root}content.js?v={V}"></script>
{demo}<script src="{root}assets/core.js?v={V}"></script>
<script src="{root}assets/glas-ui.js?v={V}"></script>
<script src="{root}assets/app.js?v={V}"></script>
</body>
</html>
"""


def write(rel, text):
    path = PORTFOLIO / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


write("index.html", page("home", ""))
for pid in IDS:
    write(f"{pid}/index.html", page("project", "../", pid))
write("warum/index.html", page("story", "../"))
write("ueber-mich/index.html", page("about", "../"))
print("Seiten geschrieben:", 3 + len(IDS))
