// Alle Texte der Seite an einer Stelle – Deutsch (de) und Englisch (en).
// Projekte ändern oder ergänzen: nur hier anfassen.
// Die Abläufe der Demos stehen in demo-scripts.js (gleiche Reihenfolge wie "chapters").

window.CONTENT = {
  linkedin: "https://www.linkedin.com/in/thomas-wordenbeck/",

  de: {
    nav: { work: "Projekte", backBtn: "Zurück", why: "Warum diese Seite", about: "Über mich", back: "Alle Projekte", theme: "Hell/Dunkel umschalten", all: "Alle Projekte ansehen" },
    name: "Thomas Wordenbeck",
    role: "Product thinking. Hands-on building.",
    intro:
      "Ich denke seit vielen Jahren in Produkten. Jetzt habe ich endlich das Werkzeug, meine Ideen auch selbst umzusetzen. Hier zeige ich eine Auswahl davon: Produkte für den eigenen Alltag und für Menschen in meinem Umfeld.",
    status: { live: "Live", paused: "Pausiert" },
    labels: { tabs: ["Worum es geht", "Highlights", "Technik"], visit: "Website ansehen", about: "Worum es geht", pause: "Pause", play: "Abspielen", more: "Weitere Projekte", linkedin: "LinkedIn-Profil", aboutLink: "Mehr zu mir", projects: "Projekte", discover: "Produkte entdecken", open: "Demo ansehen", why: "Warum es diese Seite gibt" },
    description: "Produkte für den eigenen Alltag und für Menschen in meinem Umfeld – gebaut von Thomas Wordenbeck.",
  },
  en: {
    nav: { work: "Projects", backBtn: "Back", why: "Why this site", about: "About me", back: "All projects", theme: "Toggle light/dark", all: "See all projects" },
    name: "Thomas Wordenbeck",
    role: "Product thinking. Hands-on building.",
    intro:
      "I have been thinking in products for many years. Now I finally have the tools to build my own ideas. Here is a selection: products for my own everyday life and for people around me.",
    status: { live: "Live", paused: "Paused" },
    labels: { tabs: ["What it’s about", "Highlights", "Under the hood"], visit: "Visit website", about: "What it’s about", pause: "Pause", play: "Play", more: "More projects", linkedin: "LinkedIn profile", aboutLink: "More about me", projects: "Projects", discover: "Explore products", open: "View demo", why: "Why this site exists" },
    description: "Products for my own everyday life and for people around me – built by Thomas Wordenbeck.",
  },

  // ------------------------------------------------------------------ Über mich
  about: {
    de: {
      title: "Von IT-Betrieb bis Transformation.\nUnd jetzt ins Bauen.",
      lead:
        "Ich bin Wirtschaftsinformatiker und arbeite seit fast 20 Jahren an der Schnittstelle von Business und IT. Erst habe ich Anwendungen betrieben, dann Produkte entdeckt und validiert, heute begleite ich Organisationen auf dem Weg zu produktzentrierten Teams. Seit Kurzem baue ich meine Ideen selbst, mit KI als Werkzeug.",
      numbersTitle: "In Zahlen",
      numbers: [
        { value: 150, label: "Produktteams begleitet" },
        { value: 10, label: "MVPs gebaut" },
        { value: 5000, label: "Nutzer in Produktion betreut" },
      ],
      stationsTitle: "Stationen",
      stations: [
        { when: "seit 2024", what: "Transformation Manager", where: "E.ON Digital Technology",
          text: "Führe ein BizDevOps-Operating-Model in rund 150 Produktteams ein: produktzentrierte, crossfunktionale Teams, DevOps-Prozesse, Cloud-Automatisierung. Reifegrad wird über Belege gemessen, nicht über Selbstauskunft. Dazu Enablement-Formate wie ein Simulationsspiel für Produktteams." },
        { when: "2022 – 2024", what: "Product Manager, d lab_", where: "E.ON Digital Technology",
          text: "Rund zehn frühphasige Produktideen von der Problemdefinition bis zum MVP, jeweils mit UX-Design und Full-Stack-Entwicklung. Validierung mit Nutzerinterviews, Design Sprints und Hypothesentests. Eine App für Arbeitssicherheit bis zum Rollout für rund 2.000 Nutzer." },
        { when: "2019 – 2022", what: "IT-Projektleiter, Agile Master, Business Analyst", where: "GEFA BANK",
          text: "Agile Softwareentwicklung mit Offshore-Teams in Bangalore, ein Finanzierungsportal für rund 1.000 Händler, Backlog-Verantwortung und Coaching des Fachbereichs." },
        { when: "2007 – 2019", what: "Application Management & IT Service Management", where: "GEFA BANK",
          text: "Produktverantwortung im Betrieb für geschäftskritische Anwendungen im regulierten Bankenumfeld: Anforderungen, Releases, Qualitätssicherung, Audits. Parallel Aufbau der Business Analyse als Methode im ganzen Haus." },
        { when: "2004 – 2007", what: "Ausbildung zum Informatikkaufmann", where: "GEFA",
          text: "Der Einstieg in die IT, damals noch mit SQL-Skripten statt mit KI." },
      ],
      strengthsTitle: "Was ich mitbringe",
      strengths: [
        { title: "Produkt von der Idee bis zum Betrieb", text: "Ich kenne den ganzen Lebenszyklus: validieren, bauen, ausrollen, betreiben." },
        { title: "Transformation im großen Maßstab", text: "Methoden, Rollen und Strukturen so aufsetzen, dass sie über viele Teams tragen." },
        { title: "Discovery & Validierung", text: "Design Sprints, Nutzerinterviews, Hypothesentests. Erst lernen, dann bauen." },
        { title: "Bauen mit KI", text: "Prototypen, Apps und Websites mit Claude Code. Die Projekte auf dieser Seite sind so entstanden." },
      ],
      educationTitle: "Ausbildung",
      education: [
        "M.Sc. Wirtschaftsinformatik, TH Köln (berufsbegleitend)",
        "B.A. Business Administration, FH Südwestfalen (berufsbegleitend)",
        "Ausbildung zum Informatikkaufmann",
      ],
      certsTitle: "Zertifikate",
      certs: [
        "SAFe 6 Practice Consultant", "DevOps Fluency (Udacity)", "Certified Scrum Product Owner", "Design Sprint Masterclass (AJ&Smart)",
        "Elements of AI (University of Helsinki)", "Business Analyst (ibo)", "Professional Scrum Master I", "ITIL Foundation",
      ],
      toolsTitle: "Werkzeuge",
      tools: ["Jira", "Confluence", "Miro", "Power BI", "SQL", "Postman", "Claude Code"],
      cta: "Auf LinkedIn vernetzen",
    },
    en: {
      title: "From IT operations to transformation.\nAnd now to building.",
      lead:
        "I studied business informatics and have spent almost 20 years where business meets IT. First I ran applications, then I discovered and validated products, and today I help organisations move towards product-centred teams. Recently I started building my own ideas, with AI as my tool.",
      numbersTitle: "In numbers",
      numbers: [
        { value: 150, label: "product teams supported" },
        { value: 10, label: "MVPs built" },
        { value: 5000, label: "users supported in production" },
      ],
      stationsTitle: "Career",
      stations: [
        { when: "since 2024", what: "Transformation Manager", where: "E.ON Digital Technology",
          text: "Introducing a BizDevOps operating model across around 150 product teams: product-centred cross-functional teams, DevOps processes, cloud automation. Maturity is measured by evidence, not self-assessment. Plus enablement formats such as a simulation game for product teams." },
        { when: "2022 – 2024", what: "Product Manager, d lab_", where: "E.ON Digital Technology",
          text: "Around ten early-stage product ideas from problem definition to MVP, each with UX design and full-stack development. Validation through user interviews, design sprints and hypothesis tests. A workplace safety app taken to rollout for around 2,000 users." },
        { when: "2019 – 2022", what: "IT Project Lead, Agile Master, Business Analyst", where: "GEFA BANK",
          text: "Agile software development with offshore teams in Bangalore, a financing portal for around 1,000 dealers, backlog ownership and coaching of business teams." },
        { when: "2007 – 2019", what: "Application Management & IT Service Management", where: "GEFA BANK",
          text: "Product ownership in operations for business-critical applications in regulated banking: requirements, releases, quality assurance, audits. In parallel, establishing business analysis as a company-wide practice." },
        { when: "2004 – 2007", what: "Apprenticeship as an IT business specialist", where: "GEFA",
          text: "Where it all started, back then with SQL scripts instead of AI." },
      ],
      strengthsTitle: "What I bring",
      strengths: [
        { title: "Product from idea to operations", text: "I know the whole lifecycle: validate, build, roll out, run." },
        { title: "Transformation at scale", text: "Setting up methods, roles and structures that work across many teams." },
        { title: "Discovery & validation", text: "Design sprints, user interviews, hypothesis tests. Learn first, then build." },
        { title: "Building with AI", text: "Prototypes, apps and websites with Claude Code. The projects on this site were made that way." },
      ],
      educationTitle: "Education",
      education: [
        "M.Sc. Business Informatics, TH Köln (part-time)",
        "B.A. Business Administration, FH Südwestfalen (part-time)",
        "Apprenticeship as an IT business specialist (Informatikkaufmann)",
      ],
      certsTitle: "Certifications",
      certs: [
        "SAFe 6 Practice Consultant", "DevOps Fluency (Udacity)", "Certified Scrum Product Owner", "Design Sprint Masterclass (AJ&Smart)",
        "Elements of AI (University of Helsinki)", "Business Analyst (ibo)", "Professional Scrum Master I", "ITIL Foundation",
      ],
      toolsTitle: "Tools",
      tools: ["Jira", "Confluence", "Miro", "Power BI", "SQL", "Postman", "Claude Code"],
      cta: "Connect on LinkedIn",
    },
  },

  // ------------------------------------------------------------------ Warum diese Seite (roter Faden)
  story: {
    de: {
      eyebrow: "Warum diese Seite",
      hero: "Ich habe fast 20 Jahre an derselben Stelle gearbeitet: zwischen den Leuten, die eine Idee haben, und den Leuten, die sie bauen.",
      sections: [
        { title: "Das Problem",
          text: ["Was jemand meint und was am Ende gebaut wird, ist selten dasselbe. Böser Wille steckt da fast nie dahinter. Eine Anforderung auf Papier lässt viel Raum für Interpretation, und den Unterschied sieht man erst, wenn etwas fertig ist.",
                 "In meinen ersten Jahren in einer Bank mit langen Releasezyklen hieß das: Bei der Abnahme merkt man, dass es nicht passt. Dann kommt die Nacharbeit."] },
        { title: "Mein Workaround: MS Paint",
          text: ["Irgendwann habe ich aufgehört, nur zu beschreiben. Wenn kein Prototyp da war oder der vorhandene nicht gereicht hat, habe ich selbst einen gebaut. Erst in MS Paint, später klickbar in PowerPoint. Schön war das nicht. Aber plötzlich hatten alle dasselbe Bild vor Augen, und die wichtigste Frage kam vor der Umsetzung statt danach:"],
          quote: "Meinst du das so?",
          after: ["Später wurde daraus Methode. Nutzerinterviews, Design Sprints, User Tests. Das Ziel blieb dasselbe: früh etwas zeigen, an dem man sich reiben kann."] },
        { title: "Die Grenze",
          text: ["Weiter als bis zum Klickdummy kam ich allein nicht. Alles, was wirklich funktionieren sollte, brauchte ein Entwicklungsteam, Budget und einen Platz im Backlog. Für eine kleine Idee war das selten zu rechtfertigen."] },
        { title: "Jetzt fällt die Grenze weg",
          text: ["Mit KI-Werkzeugen wie Claude Code baue ich heute, was früher ein Paint-Bild geblieben wäre. Ich beschreibe, was gebraucht wird, die KI schreibt den Code, ich teste und entscheide, was bleibt.",
                 "Im Kern ist das dieselbe Arbeit wie vorher. Ich übersetze immer noch. Am anderen Ende sitzt jetzt manchmal eben ein Werkzeug statt eines Teams, und das Ergebnis kann man direkt benutzen."] },
      ],
      closing: "Ein Entwickler bin ich dadurch nicht geworden, und so tue ich auch nicht. Aber ich kann eine Idee heute so weit bringen, dass Menschen sie ausprobieren können. Was dabei entstanden ist, zeige ich hier.",
      toProjects: "Zu den Projekten",
      toAbout: "Mehr zu mir",
    },
    en: {
      eyebrow: "Why this site",
      hero: "For almost 20 years I have worked in the same spot: between the people who have an idea and the people who build it.",
      sections: [
        { title: "The problem",
          text: ["What someone means and what ends up being built are rarely the same. There is almost never bad intent behind it. A requirement on paper leaves plenty of room for interpretation, and you only see the difference once something is finished.",
                 "In my first years at a bank with long release cycles, that meant: at acceptance you notice it doesn’t fit. Then comes the rework."] },
        { title: "My workaround: MS Paint",
          text: ["At some point I stopped only describing things. When there was no prototype, or the existing one wasn’t enough, I built one myself. First in MS Paint, later clickable in PowerPoint. It wasn’t pretty. But suddenly everyone had the same picture in mind, and the most important question came before the build instead of after:"],
          quote: "Is this what you mean?",
          after: ["Later this became a method. User interviews, design sprints, user tests. The goal stayed the same: show something early that people can push back on."] },
        { title: "The limit",
          text: ["On my own I never got further than a clickable mock-up. Anything that really had to work needed a development team, a budget and a place in the backlog. For a small idea, that was rarely justifiable."] },
        { title: "Now the limit is gone",
          text: ["With AI tools like Claude Code I now build what used to remain a Paint sketch. I describe what is needed, the AI writes the code, I test and decide what stays.",
                 "At its core, it is the same work as before. I am still translating. Only now there is sometimes a tool at the other end instead of a team, and the result is something you can actually use."] },
      ],
      closing: "This hasn’t made me a developer, and I don’t pretend to be one. But today I can take an idea far enough for people to try it out. What came out of that is what I show here.",
      toProjects: "See the projects",
      toAbout: "More about me",
    },
  },

  // ------------------------------------------------------------------ Projekte
  // icon = Strich-Icon aus Lucide (lucide.dev, ISC-Lizenz), dieselbe Bibliothek wie in Mahlzeit
  // tint = Hintergrund der Vorschau (hell), accent = dezente Akzentfarbe
  // preview.stills = Standbilder, zwischen denen die Karte langsam überblendet
  // preview.pan    = langer Screenshot, der langsam durchs Bild gleitet
  projects: [
    {
      id: "kalo",
      icon: '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
      title: "Kalo",
      status: "paused",
      tint: "#cfe3d3", accent: "#30d158",
      preview: { device: "phone", stills: ["img/kalo-1.jpg", "img/live/kalo-chat.jpg", "img/live/kalo-done.jpg"] },
      stack: ["React", "TypeScript", "Vite", "Supabase", "Groq (Llama 3.3)", "Vercel"],
      demo: { src: "demos/kalo/index.html", device: "phone", width: 390, height: 844 },
      de: {
        tagline: "Kalorientracker mit Ruhrpott-Charme",
        chapters: ["Der Tag auf einen Blick", "Mahlzeit per Chat", "Eingetragen"],
        captions: [
          "Kalorien, Makros und Wasser auf einen Blick.",
          "Einfach aufschreiben, was man gegessen hat. Kalo erkennt die Zutaten und antwortet auf Ruhrpott.",
          "Eingetragen. Das Tagesbudget rechnet sich sofort neu.",
        ],
        highlights: [["Einfach", "So einfach und schnell wie möglich. Das unterscheidet Kalo von anderen Trackern."], ["Mahlzeiten per Chat", "Einfach aufschreiben, was man gegessen hat. Kalo erkennt Zutaten, Mengen und Kalorien."], ["Rückmeldung mit Charakter", "Jede Mahlzeit bekommt einen Kommentar im Ruhrpott-Ton. Ehrlich, aber nie belehrend."], ["Alles auf einen Blick", "Kalorien, Makros, Wasser und Sport in einem Dashboard."], ["Passend zum eigenen Ziel", "Abnehmen, halten oder aufbauen, nach Kalorien, High Protein oder SanaMana."], ["Wochenrückblick", "Jeden Sonntag ein Fazit der Woche mit Vorschlägen für die nächste."]],
        tech: [["Aufbau", "React mit TypeScript und Vite, gedacht als App fürs iPhone. Supabase übernimmt Login, Datenbank und acht Serverfunktionen."], ["Mahlzeit-Analyse", "Eine Serverfunktion schickt die Eingabe an das Sprachmodell Llama 3.3 (über Groq). Ein ausführlicher Prompt mit Beispielen sorgt dafür, dass immer strukturierte Daten zurückkommen: Lebensmittel, Mengen, Kalorien, Makros, Kommentar und bei Unklarheit eine Rückfrage."], ["Persönlichkeit per Prompt", "Der Ruhrpott-Ton ist im Prompt mit Pflicht-Vokabular, Tonregeln und Negativbeispielen festgelegt. Wie deutlich Kalo wird, hängt davon ab, wie gut die Mahlzeit zum gewählten Konzept passt."], ["Kontext", "Mit jeder Anfrage gehen Tagesbudget, bereits Gegessenes, Uhrzeit, Ernährungskonzept und Ziel mit. So passt die Antwort zur Situation."], ["Weitere KI-Funktionen", "Wochenrückblick, Rezeptvorschläge, Wochenplan und Einkaufsliste laufen jeweils als eigene Serverfunktion."]],
        text:
          "Ich hatte eine Diät angefangen und wollte bewusster essen. Dafür habe ich mir einen eigenen Kalorientracker gebaut, mit genau den Funktionen, die ich brauche. Am meisten Spaß hat die Erfassung per KI gemacht: Man schreibt einfach auf, was man gegessen hat, die App erkennt die Zutaten und antwortet im Ruhrpott-Ton. Als ich die App selbst nicht mehr gebraucht habe, habe ich sie pausiert. Aus ihr ist Mahlzeit entstanden.",
      },
      en: {
        tagline: "A calorie tracker with Ruhr Valley charm",
        chapters: ["Your day at a glance", "Log a meal by chat", "Logged"],
        captions: [
          "Calories, macros and water at a glance.",
          "Just write down what you ate. Kalo recognises the ingredients and replies in Ruhr Valley dialect.",
          "Logged. The daily budget updates right away.",
        ],
        highlights: [["Simple", "As simple and fast as possible. That is what sets Kalo apart from other trackers."], ["Log meals by chat", "Just write down what you ate. Kalo recognises ingredients, amounts and calories."], ["Feedback with character", "Every meal gets a comment in Ruhr Valley dialect. Honest, never preachy."], ["Everything at a glance", "Calories, macros, water and exercise in one dashboard."], ["Built around your goal", "Lose weight, maintain or build muscle, by calories, high protein or SanaMana."], ["Weekly review", "Every Sunday a summary of the week with suggestions for the next one."]],
        tech: [["Setup", "React with TypeScript and Vite, designed as an iPhone app. Supabase handles login, database and eight server functions."], ["Meal analysis", "A server function sends the input to the Llama 3.3 language model (via Groq). A detailed prompt with examples makes sure it always returns structured data: foods, amounts, calories, macros, a comment and, if unclear, a follow-up question."], ["Personality by prompt", "The Ruhr Valley tone is defined in the prompt with required vocabulary, tone rules and counter-examples. How outspoken Kalo gets depends on how well the meal fits the chosen diet."], ["Context", "Every request includes the daily budget, what has already been eaten, the time, the diet concept and the goal, so the answer fits the situation."], ["More AI features", "Weekly review, recipe suggestions, meal plan and shopping list each run as their own server function."]],
        text:
          "I had started a diet and wanted to eat more mindfully, so I built my own calorie tracker with exactly the features I needed. The most fun part was logging meals with AI: you simply write down what you ate, the app recognises the ingredients and replies in Ruhr Valley dialect. Once I no longer used it myself, I paused the project. Mahlzeit grew out of it.",
      },
    },
    {
      id: "mahlzeit",
      icon: '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"/><path d="m2.1 21.8 6.4-6.3"/><path d="m19 5-7 7"/>',
      title: "Mahlzeit",
      status: "live",
      tint: "#e9e2d3", accent: "#ffb340",
      preview: { device: "phone", stills: ["img/mahlzeit-1.jpg", "img/live/mahlzeit-rezept.jpg", "img/live/mahlzeit-liste.jpg", "img/live/mahlzeit-kochen.jpg"] },
      stack: ["React", "TypeScript", "Vite", "Supabase", "Gemini", "PWA", "Vercel"],
      demo: { src: "demos/mahlzeit/index.html", device: "phone", width: 390, height: 844 },
      de: {
        tagline: "Wochenplanung und Einkauf für den Haushalt",
        chapters: ["Rezept aus Instagram", "Woche planen", "Einkaufsliste", "Kochen"],
        captions: [
          "Instagram-Link einfügen. Die KI liest Zutaten und Schritte aus dem Reel.",
          "Das Rezept mit einem Tipp in die Woche legen.",
          "Aus dem Wochenplan entsteht die Einkaufsliste, mit Export nach Bring.",
          "Beim Kochen führt die App Schritt für Schritt durchs Rezept.",
        ],
        highlights: [["Rezepte aus Instagram", "Link einfügen oder direkt aus Instagram teilen. Daraus wird ein sauberes Rezept."], ["Woche planen", "Rezepte mit einem Tipp auf die Wochentage legen."], ["Einkaufsliste von allein", "Alle Zutaten der Woche zusammengerechnet, Portionen anpassbar, Export nach Bring."], ["Kochmodus", "Schritt für Schritt, mit Timern, die aus dem Rezepttext erkannt werden."], ["Für den ganzen Haushalt", "Mehrere Geräte, ein gemeinsamer Plan. Änderungen erscheinen sofort überall."]],
        tech: [["Aufbau", "React mit TypeScript und Vite, als App installierbar (PWA), gehostet auf Vercel."], ["Daten und Sync", "Supabase mit anonymem Login, ganz ohne Registrierung. Ein Haushalt ist ein gemeinsamer Bereich mit Beitrittscode; die Datenbank trennt die Haushalte sauber voneinander und synchronisiert Änderungen live zwischen den Geräten."], ["Rezept-Import", "Eine Serverfunktion liest Text und Vorschaubild des Reels aus und schickt sie mit einem Parser-Prompt an Gemini. Zurück kommt ein strukturiertes Rezept: Zutaten mit Menge, Einheit und Hinweis, Schritte, Zeit und Schwierigkeit. Ist das Modell überlastet, versucht sie es bis zu dreimal; lässt sich der Text nicht lesen, kann man ihn selbst einfügen."], ["Teilen aus Instagram", "Als installierte App meldet sich Mahlzeit beim Handy als Teilen-Ziel an. Ein Reel lässt sich so direkt aus Instagram an Mahlzeit schicken."], ["Einkaufsliste", "Gleiche Zutaten werden über alle Rezepte nach Name und Einheit zusammengezählt und auf die gewählten Portionen umgerechnet. Gewürze ohne Mengenangabe stehen gesammelt am Ende."], ["Export nach Bring", "Eine kleine Serverfunktion stellt die Liste im Rezept-Format bereit, das die Bring-App über einen Link einliest."]],
        text:
          "Nach den Kalorien rückte etwas anderes in den Fokus: Mahlzeiten konsequent planen und den großen Einkauf vorher durchdenken. Mahlzeit plant die Woche, macht daraus die Einkaufsliste und exportiert sie in Listen-Apps wie Bring. Die Rezepte stammen aus bestimmten Ernährungskonzepten und von Instagram: Link einfügen, die KI liest das Rezept aus dem Reel und bringt es in Form. So baut jeder Haushalt seine eigene Sammlung auf. Beim Kochen führt die App Schritt für Schritt durch das Rezept.",
      },
      en: {
        tagline: "Weekly meal planning and shopping for the household",
        chapters: ["Recipe from Instagram", "Plan the week", "Shopping list", "Cook"],
        captions: [
          "Paste an Instagram link. AI reads the ingredients and steps from the reel.",
          "Add the recipe to the week with a single tap.",
          "The weekly plan becomes a shopping list, with export to Bring.",
          "While cooking, the app guides you through the recipe step by step.",
        ],
        highlights: [["Recipes from Instagram", "Paste a link or share straight from Instagram. It becomes a clean recipe."], ["Plan the week", "Drop recipes into the week with a single tap."], ["Shopping list on autopilot", "All ingredients of the week added up, portions adjustable, export to Bring."], ["Cooking mode", "Step by step, with timers detected from the recipe text."], ["For the whole household", "Several devices, one shared plan. Changes show up everywhere instantly."]],
        tech: [["Setup", "React with TypeScript and Vite, installable as an app (PWA), hosted on Vercel."], ["Data and sync", "Supabase with anonymous login, no sign-up needed. A household is a shared space with a join code; the database keeps households cleanly separated and syncs changes live between devices."], ["Recipe import", "A server function reads the reel's text and thumbnail and sends them with a parser prompt to Gemini. Back comes a structured recipe: ingredients with amount, unit and note, steps, time and difficulty. If the model is overloaded it retries up to three times; if the text can't be read, you can paste it yourself."], ["Share from Instagram", "Once installed, Mahlzeit registers as a share target on the phone, so a reel can be sent straight from Instagram."], ["Shopping list", "Identical ingredients are added up across all recipes by name and unit and scaled to the chosen portions. Spices without an amount are listed together at the end."], ["Export to Bring", "A small server function provides the list in a recipe format that the Bring app imports via a link."]],
        text:
          "After calories, my focus shifted: planning meals consistently and thinking through the big weekly shop in advance. Mahlzeit plans the week, turns it into a shopping list and exports it to list apps such as Bring. Recipes come from specific diet concepts and from Instagram: paste a link, AI reads the recipe from the reel and puts it into shape. Every household builds up its own collection. While cooking, the app guides you through each recipe step by step.",
      },
    },
    {
      id: "human",
      icon: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
      title: "Human vs. AI",
      status: "paused",
      tint: "#4a1f2b", accent: "#ff375f",
      preview: { device: "desktop", stills: ["img/human-1.jpg", "img/live/human-slot.jpg", "img/live/human-timer.jpg", "img/live/human-ki.jpg"] },
      stack: ["HTML", "CSS", "JavaScript", "Web Audio API"],
      demo: { src: "demos/human/index.html", device: "desktop", width: 1440, height: 900 },
      de: {
        tagline: "Reflexionsspiel für ein Team-Event",
        chapters: ["Slot-Machine", "Diskussion mit Timer", "KI-Perspektive"],
        captions: [
          "Die Slot-Machine zieht eine Rolle, drei KI-Fähigkeiten und drei menschliche Stärken.",
          "Die Gruppe diskutiert, der Timer gibt den Takt vor.",
          "Dann wird die KI-Perspektive aufgedeckt, mit einer Frage zum Nachdenken.",
        ],
        highlights: [["Slot-Machine", "Zieht eine von zehn DevOps-Rollen, dazu drei KI-Fähigkeiten und drei menschliche Stärken."], ["Diskussions-Timer", "5, 10 oder 15 Minuten, auf Knopfdruck verlängerbar."], ["KI-Perspektive", "Ein Zukunftsszenario und eine Reflexionsfrage zur gezogenen Rolle."], ["Gemacht für den Beamer", "Große Schrift, Arcade-Look, Bedienung mit Leertaste und Enter."], ["Komplett offline", "Keine Installation, kein Konto, keine laufenden Kosten."]],
        tech: [["Aufbau", "Eine einzige HTML-Datei mit CSS und JavaScript, ohne Framework und ohne Build-Schritt. Sie läuft in jedem Browser, auch ohne Internet."], ["Inhalte", "20 handgeschriebene Sets, zwei pro Rolle, jeweils mit KI-Fähigkeiten, menschlichen Stärken, Szenario und Reflexionsfrage. Ein gemischter Stapel sorgt dafür, dass sich nichts wiederholt, bis alle Sets einmal dran waren."], ["Sound ohne Audiodateien", "Die Chiptune-Musik entsteht live im Browser mit der Web Audio API, aus Melodie-, Akkord- und Bassfolgen."], ["Inszenierung", "Die Walzen drehen im Takt der Musik. Die Reflexionsfrage erscheint nach einem Countdown wie mit der Schreibmaschine getippt, damit die Gruppe erst selbst nachdenkt."]],
        text:
          "Gebaut für ein Team-Event mit rund 50 Menschen aus verschiedenen europäischen Ländern. Eine Slot-Machine im Retro-Arcade-Look zieht eine von zehn DevOps-Rollen, dazu je drei KI-Fähigkeiten und drei menschliche Stärken. Ein Timer gibt den Kleingruppen Zeit zum Diskutieren, danach blendet „Reveal AI Perspective“ ein Zukunftsszenario und eine Reflexionsfrage zur Rolle ein. Es gibt keine Punkte und keine Gewinner. Jede und jeder soll für sich klären: Was mache ich künftig selbst, und wo arbeitet die KI besser als ich? Die App läuft komplett offline im Browser, ohne API-Kosten, mit Chiptune-Sounds im Stil alter Mario-Spiele.",
      },
      en: {
        tagline: "A reflection game for a team event",
        chapters: ["Slot machine", "Discussion timer", "AI perspective"],
        captions: [
          "The slot machine draws a role, three AI capabilities and three human strengths.",
          "The group discusses while the timer keeps the pace.",
          "Then the AI perspective is revealed, with a question to reflect on.",
        ],
        highlights: [["Slot machine", "Draws one of ten DevOps roles, plus three AI capabilities and three human strengths."], ["Discussion timer", "5, 10 or 15 minutes, extendable at the push of a button."], ["AI perspective", "A future scenario and a reflection question for the drawn role."], ["Made for the projector", "Large type, arcade look, controlled with space bar and enter."], ["Fully offline", "No installation, no account, no running costs."]],
        tech: [["Setup", "A single HTML file with CSS and JavaScript, no framework and no build step. It runs in any browser, even without internet."], ["Content", "20 hand-written sets, two per role, each with AI capabilities, human strengths, a scenario and a reflection question. A shuffled deck makes sure nothing repeats until every set has come up once."], ["Sound without audio files", "The chiptune music is generated live in the browser with the Web Audio API, from melody, chord and bass sequences."], ["Presentation", "The reels spin in time with the music. The reflection question appears after a countdown, typed out like on a typewriter, so the group thinks for itself first."]],
        text:
          "Built for a team event with around 50 people from several European countries. A retro arcade slot machine draws one of ten DevOps roles, plus three AI capabilities and three human strengths. A timer gives small groups time to discuss, then “Reveal AI Perspective” shows a future scenario and a reflection question for that role. There are no points and no winners. Everyone works out for themselves: What will I still do myself, and where does AI do the job better? The app runs fully offline in the browser with no API costs, accompanied by chiptune sounds inspired by classic Mario games.",
      },
    },
    {
      id: "vuca",
      icon: '<path d="M16.85 18.58a9 9 0 1 0-9.7 0"/><path d="M8 14a5 5 0 1 1 8 0"/><circle cx="12" cy="11" r="1" fill="currentColor"/><path d="M13 17a1 1 0 1 0-2 0l.5 4.5a.5.5 0 0 0 1 0Z" fill="currentColor"/>',
      title: "VUCA Blaster",
      status: "live",
      tint: "#efd6d6", accent: "#64d2ff",
      url: "https://vucablaster.de",
      preview: { device: "desktop", pan: "img/vuca-home.jpg" },
      stack: ["Python", "GitHub Actions", "GitHub Pages", "Playwright", "Whisper"],
      demo: { src: "demos/gallery/index.html?set=vuca", device: "desktop", width: 1440, height: 900, url: "vucablaster.de" },
      de: {
        tagline: "Website für einen Podcast",
        chapters: ["Startseite", "Archiv", "Folgenseite", "Transkript"],
        captions: [
          "Die Startseite zeigt immer die neueste Folge.",
          "Das Archiv mit allen Folgen, durchsuchbar und filterbar.",
          "Jede neue Folge bekommt automatisch eine eigene Seite.",
          "Jede Folge wird transkribiert, daraus entstehen die Key Learnings.",
        ],
        highlights: [["Immer aktuell", "Neue Folgen erscheinen automatisch auf der Seite und werden transkribiert."], ["Auf allen Plattformen", "Jede Folge mit Direktlinks zu Spotify, Apple Podcasts, Deezer und Amazon Music."], ["Archiv mit Suche", "Alle Folgen durchsuchbar und nach Wert, Staffel und Jahr filterbar."], ["Kurzlinks", "vucablaster.de/62 führt direkt zur Folge und lässt sich so gut auf LinkedIn teilen."]],
        tech: [["Statische Seite", "Ein Python-Skript baut alle Seiten aus dem RSS-Feed des Podcast-Hosters, den Schnittstellen von Apple und Deezer und gepflegten Inhaltsdateien. Gehostet auf GitHub Pages mit eigener Domain."], ["Automatik", "Ein GitHub-Workflow läuft stündlich. Erscheint eine neue Folge, entsteht ihre Seite und ein Ticket mit Checkliste für den Host."], ["Plattform-Links", "Spotify und Amazon bieten keinen einfachen Zugang ohne Entwicklerkonto. Deshalb öffnet ein automatisierter Browser (Playwright) ihre öffentlichen Podcast-Seiten und ordnet die Folgen über die Nummer im Titel zu."], ["Transkripte", "Das Spracherkennungsmodell Whisper läuft direkt auf den GitHub-Servern, mit Pausenerkennung und einem Filter gegen Wiederholungsschleifen. Sichtbar werden nur freigegebene Transkripte."], ["Pflege ohne Code", "Inhalte liegen in einfachen Dateien, damit die Hosts sie selbst ändern können."]],
        text:
          "Die Website zum Podcast VUCA Blaster. Sie pflegt sich weitgehend selbst: Erscheint eine neue Folge, landet sie automatisch auf der Startseite und bekommt eine eigene Seite mit Links zu Spotify, Apple Podcasts, Deezer und Amazon Music. Außerdem wird die Folge transkribiert, und aus dem Transkript werden die Key Learnings abgeleitet. Ein durchsuchbares Archiv zeigt alle Folgen auf einen Blick. Die Hosts können die Seite ohne Programmierkenntnisse betreuen.",
      },
      en: {
        tagline: "A website for a podcast",
        chapters: ["Home", "Archive", "Episode page", "Transcript"],
        captions: [
          "The home page always features the latest episode.",
          "The archive with every episode, searchable and filterable.",
          "Every new episode automatically gets its own page.",
          "Every episode is transcribed, and the key learnings come from it.",
        ],
        highlights: [["Always up to date", "New episodes appear on the site automatically and are transcribed."], ["On every platform", "Each episode with direct links to Spotify, Apple Podcasts, Deezer and Amazon Music."], ["Searchable archive", "Every episode searchable and filterable by core value, season and year."], ["Short links", "vucablaster.de/62 goes straight to the episode, which makes it easy to share on LinkedIn."]],
        tech: [["Static site", "A Python script builds every page from the podcast hosting provider's RSS feed, the Apple and Deezer APIs and maintained content files. Hosted on GitHub Pages with a custom domain."], ["Automation", "A GitHub workflow runs every hour. When a new episode comes out, its page is created along with a ticket and checklist for the host."], ["Platform links", "Spotify and Amazon offer no simple access without a developer account. So an automated browser (Playwright) opens their public podcast pages and matches episodes by the number in the title."], ["Transcripts", "The speech recognition model Whisper runs directly on GitHub's servers, with pause detection and a filter against repetition loops. Only approved transcripts are shown."], ["Maintenance without code", "Content lives in simple files so the hosts can change it themselves."]],
        text:
          "The website for the VUCA Blaster podcast. It largely maintains itself: when a new episode comes out, it automatically appears on the home page and gets its own page with links to Spotify, Apple Podcasts, Deezer and Amazon Music. The episode is also transcribed, and the key learnings are derived from the transcript. A searchable archive shows every episode at a glance. The hosts can look after the site without any coding knowledge.",
      },
    },
    {
      id: "punkte",
      icon: '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
      title: "Punktekönig",
      status: "live",
      tint: "#f1e2c4", accent: "#ffd60a",
      preview: { device: "phone", stills: ["img/punkte-1.jpg", "img/live/punkte-uno.jpg", "img/live/punkte-sieg.jpg", "img/live/punkte-liste.jpg"] },
      stack: ["HTML", "CSS", "JavaScript", "PWA", "localStorage"],
      demo: { src: "demos/punkte/index.html", device: "phone", width: 390, height: 844 },
      de: {
        tagline: "Punktezähler für Familienspieleabende",
        chapters: ["Spiel wählen", "Punkte eintragen", "Verlauf & Fakten"],
        captions: [
          "Uno oder Flip 7: Die App wechselt mit dem Spiel ihre Farben.",
          "Punkte eintragen, die Summen laufen mit. Am Ende gibt es Konfetti.",
          "Der Verlauf merkt sich jede Partie und zeigt die Bestenliste.",
        ],
        highlights: [["Zwei Spiele, eine App", "Punkte für die Kartenspiele Uno und Flip 7 nachverfolgen, jeweils mit den passenden Regeln."], ["Schnell eintragen", "Punkte tippen, die Summen laufen mit, die nächste Runde legt sich selbst an."], ["Siegerehrung", "Krone, Rangliste und Konfetti."], ["Verlauf und Fakten", "König der Woche, Ewiger Zweiter, beste Siegquote und mehr."], ["Ohne Konto", "Läuft komplett auf dem Handy, auch offline."]],
        tech: [["Aufbau", "Eine einzige HTML-Datei als installierbare App (PWA) mit Service Worker. Sie funktioniert auch ohne Internet."], ["Speicher", "Das laufende Spiel und der Verlauf liegen nur auf dem Gerät (localStorage). Keine Datenbank, kein Server."], ["Regeln je Spiel", "Flip 7 mit Punktziel zwischen 100 und 250. Uno mit Rundenziel (4, 8, 12 oder offen) und umgekehrter Wertung."], ["Fakten aus dem Verlauf", "Die App errechnet Serien, Siegquoten, das Lieblingsspiel, den Dauergast und den Ewigen Zweiten und wählt bei jedem Besuch einige davon aus."], ["Details", "Die Farben wechseln mit dem Spiel, Zahlen zählen animiert hoch, und auf dem Handy gibt es kurzes Vibrationsfeedback."]],
        text:
          "Für unsere Spieleabende mit Uno und Flip 7. Punkte eintragen, Zwischenstand sehen, den König oder die Königin des Abends küren. Die App läuft komplett lokal auf dem Handy, ganz ohne Datenbank und Konto. Trotzdem merkt sie sich alle vergangenen Partien und zeigt spannende Fakten daraus.",
      },
      en: {
        tagline: "A score keeper for family game nights",
        chapters: ["Pick a game", "Enter scores", "History & facts"],
        captions: [
          "Uno or Flip 7: the app changes its colours with the game.",
          "Enter points and watch the totals update. Confetti at the end.",
          "The history remembers every game and shows the leaderboard.",
        ],
        highlights: [["Two games, one app", "Track points for the card games Uno and Flip 7, each with its own rules."], ["Quick entry", "Type the points, totals update, the next round sets itself up."], ["Winner ceremony", "Crown, leaderboard and confetti."], ["History and facts", "King of the week, eternal runner-up, best win rate and more."], ["No account", "Runs entirely on the phone, even offline."]],
        tech: [["Setup", "A single HTML file as an installable app (PWA) with a service worker. It works without internet."], ["Storage", "The current game and the history live only on the device (localStorage). No database, no server."], ["Rules per game", "Flip 7 with a points target between 100 and 250. Uno with a round target (4, 8, 12 or open) and reversed scoring."], ["Facts from the history", "The app works out streaks, win rates, the favourite game, the most regular player and the eternal runner-up, and picks a few on every visit."], ["Details", "Colours change with the game, numbers count up with an animation, and phones give short vibration feedback."]],
        text:
          "For our game nights with Uno and Flip 7. Enter points, check the standings, crown the king or queen of the evening. The app runs entirely on the phone, with no database and no account. It still remembers every past game and surfaces interesting facts about them.",
      },
    },
    {
      id: "zirkus",
      icon: '<path d="M3.5 21 14 3"/><path d="M20.5 21 10 3"/><path d="M15.5 21 12 15l-3.5 6"/><path d="M2 21h20"/>',
      title: "Zirkusprojekt 2028",
      status: "live",
      tint: "#e9c46a", accent: "#ff453a",
      url: "https://zirkusprojekt2028.vercel.app",
      preview: { device: "desktop", pan: "img/zirkus-home.jpg" },
      stack: ["React", "JavaScript", "Vercel"],
      demo: { src: "demos/gallery/index.html?set=zirkus", device: "desktop", width: 1440, height: 900, url: "zirkusprojekt2028.vercel.app" },
      de: {
        tagline: "Spendenseite für ein Schulprojekt",
        chapters: ["Startseite", "Bilder der Kinder", "Spendenchronik"],
        captions: [
          "Die Startseite erklärt das Projekt und lädt zum Spenden ein.",
          "Die Bilder haben die Kinder selbst gemalt.",
          "Die Spendenchronik zeigt, wie nah das Ziel ist.",
        ],
        highlights: [["Das Projekt erklärt", "Was die Kinder erwartet und was das Zirkusprojekt fördert."], ["Bilder der Kinder", "Eine Galerie mit den Bildern, die die Kinder gemalt haben."], ["Spenden leicht gemacht", "Per Überweisung oder GiroCode zum Scannen mit der Banking-App."], ["Spendenchronik", "Der Fortschritt zum Ziel, jede Spende als Zeitleiste oder Feed."]],
        tech: [["Aufbau", "Eine React-Seite, die vorab in fertige Dateien übersetzt wird. Ausgeliefert als statische Seite über Vercel."], ["Pflege", "Texte, Spendenziel und alle Spenden stehen in einer Datei. Neue Spenden trage ich als Liste ein, Summe und Chronik rechnen sich daraus."], ["Bewegung mit Rücksicht", "Der Spendenring zählt hoch, sobald er ins Bild kommt. Wer am Gerät reduzierte Bewegung eingestellt hat, sieht direkt den Endwert."], ["Zeitleiste", "Die Größe der Punkte zeigt die Höhe der Spende."], ["Kein Zahlungsanbieter", "GiroCode reicht für Überweisungen und kostet die Schule keine Gebühren."]],
        text:
          "Die Regenbogenschule in Velbert-Neviges bringt 2028 gemeinsam mit dem Zirkus Dobbelino ein Zirkusprojekt an die Schule. Die Seite erklärt das Vorhaben, zeigt die Bilder, die die Kinder dafür gemalt haben, und sammelt Spenden per Überweisung oder GiroCode. Eine Spendenchronik zeigt, wie das Ziel näher rückt. Neue Spenden und Neuigkeiten trage ich laufend nach.",
      },
      en: {
        tagline: "A fundraising site for a school project",
        chapters: ["Home", "Children’s drawings", "Donation timeline"],
        captions: [
          "The home page explains the project and invites donations.",
          "The children painted these pictures themselves.",
          "The donation timeline shows how close the goal is.",
        ],
        highlights: [["The project explained", "What the children can look forward to and what the circus project supports."], ["Children’s drawings", "A gallery with the pictures the children painted."], ["Easy to donate", "By bank transfer or GiroCode, scanned with a banking app."], ["Donation timeline", "Progress towards the goal, every donation as a timeline or feed."]],
        tech: [["Setup", "A React site that is compiled ahead of time into plain files and served as a static site via Vercel."], ["Maintenance", "Texts, the donation goal and all donations live in one file. I add new donations as a list; the total and timeline are calculated from it."], ["Motion with care", "The donation ring counts up once it scrolls into view. Anyone who has reduced motion enabled sees the final value straight away."], ["Timeline", "The size of each dot shows the size of the donation."], ["No payment provider", "GiroCode is enough for bank transfers and costs the school no fees."]],
        text:
          "In 2028, the Regenbogenschule primary school in Velbert-Neviges is bringing a circus project to its pupils together with Zirkus Dobbelino. The site explains the project, shows pictures the children painted for it and collects donations by bank transfer or GiroCode. A donation timeline shows how close the goal is. I keep adding new donations and updates as they come in.",
      },
    },
  ],
};
