// Beispielrezepte für die Portfolio-Demo (keine echten Haushaltsdaten).

const z = (name: string, menge: number | null, einheit: string, hinweis: string | null = null) => ({ name, menge, einheit, hinweis });

export const RECIPES = [
  {
    id: 'r-linsen', source: 'instagram', source_url: 'https://www.instagram.com/reel/demo-linsen/',
    titel: 'Linsenbowl mit Feta', beschreibung: 'Warme Linsen, knackiges Gemüse, cremiger Feta.',
    portionen: 2, zubereitungszeit_min: 25, schwierigkeit: 'einfach', kategorie: ['mittag', 'abendessen'],
    recipe_type: 'hauptgericht', tags: ['vegetarisch', 'bowl'], is_favorite: true,
    zutaten: [z('Belugalinsen', 150, 'g'), z('Feta', 100, 'g'), z('Gurke', 1, 'Stk'), z('Cherrytomaten', 200, 'g'), z('Zitrone', 1, 'Stk'), z('Olivenöl', 2, 'EL')],
    zubereitung: ['Linsen 20 Minuten köcheln.', 'Gemüse klein schneiden.', 'Alles mit Zitrone und Öl mischen, Feta darüber.'],
  },
  {
    id: 'r-ofengemuese', source: 'sanamana', source_url: null,
    titel: 'Ofengemüse mit Kräuterquark', beschreibung: 'Ein Blech, wenig Arbeit.',
    portionen: 2, zubereitungszeit_min: 40, schwierigkeit: 'einfach', kategorie: ['abendessen'],
    recipe_type: 'hauptgericht', tags: ['vegetarisch'],
    zutaten: [z('Kartoffeln', 500, 'g'), z('Paprika', 2, 'Stk'), z('Zucchini', 1, 'Stk'), z('Magerquark', 250, 'g'), z('Schnittlauch', 1, 'Bund'), z('Olivenöl', 2, 'EL')],
    zubereitung: ['Ofen auf 200 °C vorheizen.', 'Gemüse schneiden, mit Öl aufs Blech.', '30 Minuten backen.', 'Quark mit Kräutern verrühren.'],
  },
  {
    id: 'r-curry', source: 'instagram', source_url: 'https://www.instagram.com/reel/demo-curry/',
    titel: 'Kichererbsen-Curry', beschreibung: 'Mild, cremig, in 30 Minuten fertig.',
    portionen: 4, zubereitungszeit_min: 30, schwierigkeit: 'mittel', kategorie: ['abendessen'],
    recipe_type: 'hauptgericht', tags: ['vegan'], is_favorite: true,
    zutaten: [z('Kichererbsen', 2, 'Dosen'), z('Kokosmilch', 400, 'ml'), z('Spinat', 150, 'g'), z('Zwiebel', 1, 'Stk'), z('Currypaste', 2, 'EL')],
    zubereitung: ['Zwiebel anschwitzen.', 'Currypaste kurz mitrösten.', 'Kichererbsen und Kokosmilch dazu, 15 Minuten köcheln.', 'Spinat unterheben.'],
  },
  {
    id: 'r-pasta', source: 'url', source_url: 'https://www.chefkoch.de/demo',
    titel: 'Zitronen-Pasta mit Brokkoli', beschreibung: null,
    portionen: 2, zubereitungszeit_min: 20, schwierigkeit: 'einfach', kategorie: ['mittag'],
    recipe_type: 'hauptgericht', tags: ['pasta'],
    zutaten: [z('Spaghetti', 250, 'g'), z('Brokkoli', 1, 'Stk'), z('Zitrone', 1, 'Stk'), z('Parmesan', 50, 'g')],
    zubereitung: ['Pasta kochen, Brokkoli die letzten 4 Minuten mitgaren.', 'Mit Zitrone und Parmesan schwenken.'],
  },
  {
    id: 'r-shakshuka', source: 'instagram', source_url: 'https://www.instagram.com/reel/demo-shakshuka/',
    titel: 'Shakshuka', beschreibung: 'Eier in würziger Tomatensoße.',
    portionen: 2, zubereitungszeit_min: 25, schwierigkeit: 'einfach', kategorie: ['fruehstueck', 'mittag'],
    recipe_type: 'hauptgericht', tags: ['vegetarisch'],
    zutaten: [z('Eier', 4, 'Stk'), z('Passierte Tomaten', 500, 'g'), z('Paprika', 1, 'Stk'), z('Kreuzkümmel', 1, 'TL')],
    zubereitung: ['Paprika anbraten.', 'Tomaten und Gewürze dazu.', 'Eier hineinschlagen, zugedeckt stocken lassen.'],
  },
  {
    id: 'r-reis', source: 'manual', source_url: null,
    titel: 'Pikante Reispfanne', beschreibung: null,
    portionen: 2, zubereitungszeit_min: 45, schwierigkeit: 'mittel', kategorie: ['abendessen'],
    recipe_type: 'hauptgericht', tags: [],
    zutaten: [z('Reis', 200, 'g'), z('Mais', 1, 'Dose'), z('Kidneybohnen', 1, 'Dose'), z('Paprika', 1, 'Stk')],
    zubereitung: ['Reis kochen.', 'Gemüse anbraten.', 'Alles mischen und würzen.'],
  },
];

// Das Rezept, das die "KI" aus dem Instagram-Reel liest
export const PARSED_RECIPE = {
  source: 'instagram', source_url: null, source_author: '@gruenkueche', source_caption_raw: null,
  titel: 'Ofen-Feta mit Tomaten & Orzo',
  beschreibung: 'Der Klassiker aus dem Netz, mit Orzo statt Spaghetti.',
  portionen: 2, zubereitungszeit_min: 35, schwierigkeit: 'einfach',
  kategorie: ['abendessen'], recipe_type: 'hauptgericht', tags: ['vegetarisch', 'ofen'],
  zutaten: [
    z('Feta', 200, 'g'), z('Cherrytomaten', 400, 'g'), z('Orzo', 200, 'g'),
    z('Knoblauch', 2, 'Zehen', 'gepresst'), z('Olivenöl', 3, 'EL'), z('Basilikum', 1, 'Bund', 'zum Garnieren'),
  ],
  zubereitung: [
    'Ofen auf 200 °C vorheizen.',
    'Tomaten mit Öl und Knoblauch in eine Form geben, Feta in die Mitte legen.',
    '25 Minuten backen.',
    'Orzo nach Packungsangabe kochen.',
    'Feta und Tomaten zerdrücken, mit Orzo mischen und mit Basilikum servieren.',
  ],
  bild_url: null, is_favorite: false, ai_confidence: 'high', ai_warnings: [],
};
