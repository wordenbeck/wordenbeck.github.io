"""Erzeugt alle HTML-Seiten aus einer Vorlage.

  index.html               Startseite (Glas-Hero mit iPhone-Karussell, Querkacheln)
  <id>/index.html          Projektseite je Projekt (Demo im iPhone bzw. Browserfenster)
  warum/index.html         Warum diese Seite als Messenger-Chat (assets/warum/)
  ueber-mich/index.html    Über mich als Match-Karte (eigene Skripte in assets/ueber-mich/)
  lebenslauf/index.html    Ausführliches Profil (Zahlen, Stationen, Stärken)
  impressum/, datenschutz/ Rechtliches (assets/recht.js)

Aufruf:  python3 _build/make-pages.py   (aus dem Portfolio-Ordner)
Inhalte stehen in content.js, Aufbau und Aussehen in assets/ – hier nur das Gerüst.
"""
from pathlib import Path
import time

# Versionsnummer an CSS/JS, damit Browser nach Änderungen nicht die alte Fassung aus dem Zwischenspeicher zeigen
V = time.strftime("%Y%m%d%H%M%S")

# Vorschau beim Teilen (LinkedIn & Co.): Diese Dienste führen kein JavaScript aus, darum stehen Text und Bild fest im HTML
SITE = "https://wordenbeck.github.io/"
DESCRIPTION = "Produkte für den eigenen Alltag und für Menschen in meinem Umfeld – gebaut von Thomas Wordenbeck."

PORTFOLIO = Path(__file__).resolve().parent.parent
IDS = ["kalo", "mahlzeit", "human", "vuca", "punkte", "zirkus"]
CSS = ["core.css", "glas-base.css", "glas-pages.css"]


def page(kind, root, project=None, legal=None):
    match = kind == "match"
    chat = kind == "chat"
    # Match-Karte ohne glas-pages.css (Klassen wie .nums würden sich sonst überschneiden)
    css = (["core.css", "glas-base.css", "ueber-mich/ueber-mich.css"] if match else
           ["core.css", "glas-base.css", "warum/chat.css"] if chat else
           CSS + (["home.css"] if kind == "home" else []) + (["frag-mich.css"] if kind in ("home", "project") else []))
    links = "\n".join(f'<link rel="stylesheet" href="{root}assets/{c}?v={V}">' for c in css)
    js = (["ueber-mich/profil.js", "ueber-mich/match.js", "ueber-mich/weiter.js"] if match else
          ["warum/chat.js"] if chat else ["recht.js"] if legal else
          ["app.js"] + (["frag-mich.js"] if kind in ("home", "project") else []))
    scripts = "\n".join(f'<script src="{root}assets/{j}?v={V}"></script>' for j in js)
    kind = "about" if match else "story" if chat else kind
    demo = (f'<script src="{root}demo-player.js?v={V}"></script>\n<script src="{root}demo-scripts.js?v={V}"></script>\n'
            if kind == "project" else "")
    pid = (f' data-project="{project}"' if project else "") + (f' data-legal="{legal}"' if legal else "")
    return f"""<!doctype html>
<html lang="de" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thomas Wordenbeck</title>
<meta name="description" content="{DESCRIPTION}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Thomas Wordenbeck">
<meta property="og:title" content="Thomas Wordenbeck">
<meta property="og:description" content="{DESCRIPTION}">
<meta property="og:image" content="{SITE}img/ueber-mich/headshot.jpg">
<meta property="og:locale" content="de_DE">
<meta name="twitter:card" content="summary">
<script>try{{document.documentElement.dataset.theme=localStorage.getItem('theme')||'dark'}}catch(e){{}}</script>
<meta name="color-scheme" content="dark light">
<link rel="icon" href="{root}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="{root}assets/fonts/fonts.css?v={V}">
{links}
</head>
<body data-page="{kind}" data-root="{root}"{pid}>
<div id="app"></div>
<script src="{root}content.js?v={V}"></script>
{demo}<script src="{root}assets/core.js?v={V}"></script>
<script src="{root}assets/glas-ui.js?v={V}"></script>
{scripts}
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
write("warum/index.html", page("chat", "../"))
write("ueber-mich/index.html", page("match", "../"))
write("lebenslauf/index.html", page("about", "../"))
write("impressum/index.html", page("legal", "../", legal="impressum"))
write("datenschutz/index.html", page("legal", "../", legal="datenschutz"))
print("Seiten geschrieben:", 6 + len(IDS))
