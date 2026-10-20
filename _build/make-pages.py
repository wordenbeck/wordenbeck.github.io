"""Erzeugt alle HTML-Seiten aus einer Vorlage.

  index.html               Übersicht
  <id>/index.html          Projektseite je Projekt
  warum/index.html         Warum diese Seite (roter Faden)
  ueber-mich/index.html    Profil

Aufruf:  python3 _build/make-pages.py   (aus dem Portfolio-Ordner)
Inhalte stehen in content.js – hier nur das Gerüst.
"""
from pathlib import Path
import time

# Versionsnummer an CSS/JS, damit Browser nach Änderungen nicht die alte Fassung aus dem Zwischenspeicher zeigen
V = time.strftime("%Y%m%d%H%M%S")

PORTFOLIO = Path(__file__).resolve().parent.parent
IDS = ["kalo", "mahlzeit", "human", "vuca", "punkte", "zirkus"]

CHEVRON = '<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'


BACK = '''<a class="back-btn" id="back-btn" href="{href}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span data-k="nav.backBtn"></span></a>'''


def head(root):
    return f"""<!doctype html>
<html lang="de" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thomas Wordenbeck</title>
<meta name="description" content="Produkte für den eigenen Alltag und für Menschen in meinem Umfeld – gebaut von Thomas Wordenbeck.">
<script>try{{document.documentElement.dataset.theme=localStorage.getItem('theme')||'dark'}}catch(e){{}}</script>
<meta name="color-scheme" content="dark light">
<link rel="icon" href="{root}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}styles.css?v={V}">
</head>"""


def header(root):
    return f"""<header class="top"><div class="wrap top-in">
  <a class="who" href="{root or './'}" data-k="name"></a>
  <nav>
    <div class="menu">
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu-panel"><span data-k="nav.work"></span>{CHEVRON}</button>
      <div class="menu-panel" id="menu-panel" hidden></div>
    </div>
    <a class="nav-link" href="{root}warum/" data-k="nav.why"></a>
    <a class="nav-link" href="{root}ueber-mich/" data-k="nav.about"></a>
    <button class="theme-btn" id="theme-btn" type="button"></button>
    <div class="lang"><button type="button" data-lang="de">DE</button><button type="button" data-lang="en">EN</button></div>
  </nav>
</div></header>"""


def footer():
    return """<footer class="wrap site-foot">
  <span>© 2026 Thomas Wordenbeck</span>
  <a data-linkedin href="#" target="_blank" rel="noopener">LinkedIn ↗</a>
  <span data-k="footer"></span>
</footer>"""


def scripts(root, demo=False):
    extra = f'<script src="{root}demo-player.js?v={V}"></script>\n<script src="{root}demo-scripts.js?v={V}"></script>\n' if demo else ""
    return f'<script src="{root}content.js?v={V}"></script>\n{extra}<script src="{root}site.js?v={V}"></script>\n</body>\n</html>\n'


def home():
    root = ""
    return head(root) + f"""
<body data-page="home" data-root="{root}">
{header(root)}
<main class="wrap">
  <section class="intro">
    <h1 data-k="name"></h1>
    <div class="role" data-k="role"></div>
    <p data-k="intro"></p>
    <div class="intro-links">
      <a class="btn primary" href="#projekte" data-k="labels.discover"></a>
      <a class="btn secondary" href="warum/" data-k="nav.why"></a>
      <a class="btn secondary" href="ueber-mich/" data-k="labels.aboutLink"></a>
    </div>
  </section>
  <section class="grid" id="projekte"></section>
</main>
{footer()}
""" + scripts(root)


def project(pid):
    root = "../"
    return head(root) + f"""
<body data-page="project" data-project="{pid}" data-root="{root}">
{header(root)}
<main class="wrap p-layout">
  <div class="p-top">{BACK.format(href="../#projekte")}</div>
  <section class="stage" id="stage">
    <div class="stage-bar">
      <div class="chapters" id="chapters"></div>
      <button class="playpause" id="playpause" type="button"></button>
    </div>
    <p class="caption" id="caption" aria-live="polite"></p>
    <div class="device-slot"><div id="device"></div></div>
  </section>
  <aside class="p-info">
    <div class="p-head" id="p-head"></div>
    <div class="p-tabs">
      <div class="seg" id="p-tabs" role="tablist"></div>
      <div class="p-panel" id="p-panel" role="tabpanel"></div>
    </div>
    <nav class="switcher" aria-label="Projekte">
      <h2 data-k="labels.more"></h2>
      <div id="switcher"></div>
    </nav>
  </aside>
</main>
""" + scripts(root, demo=True)


def about():
    root = "../"
    return head(root) + f"""
<body data-page="about" data-root="{root}">
{header(root)}
<div class="wrap page-top">{BACK.format(href="../")}</div>
<main class="wrap about" id="about"></main>
{footer()}
""" + scripts(root)


def story():
    root = "../"
    return head(root) + f"""
<body data-page="story" data-root="{root}">
{header(root)}
<div class="wrap page-top">{BACK.format(href="../")}</div>
<main class="wrap story" id="story"></main>
{footer()}
""" + scripts(root)


def write(rel, text):
    path = PORTFOLIO / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


write("index.html", home())
for pid in IDS:
    write(f"{pid}/index.html", project(pid))
write("ueber-mich/index.html", about())
write("warum/index.html", story())
print("Seiten geschrieben:", 3 + len(IDS))
