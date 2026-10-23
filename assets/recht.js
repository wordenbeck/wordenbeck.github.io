// Impressum und Datenschutzerklärung (Deutsch und Englisch). body[data-legal] = "impressum" oder "datenschutz".
// Die E-Mail-Adresse wird erst im Browser zusammengesetzt, damit sie nicht lesbar im Seitencode steht (weniger Spam).
(() => {
  const { lang, esc, ICON } = V2;
  const { mount, PAGES } = GlasUI;
  const EN = lang === 'en';
  const MAIL = ['thomas.wordenbeck', 'gmail.com'].join('@');
  const ADDRESS = 'Thomas Wordenbeck<br>Gewerbestr. 8<br>42553 Velbert<br>' + (EN ? 'Germany' : 'Deutschland');
  const mail = `<a href="mailto:${MAIL}">${esc(MAIL)}</a>`;
  const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${esc(text)}</a>`;

  const PAGES_TEXT = {
    impressum: {
      de: {
        title: 'Impressum',
        blocks: [
          ['Angaben gemäß § 5 DDG', `<address>${ADDRESS}</address>`],
          ['Kontakt', `<p>E-Mail: ${mail}</p>`],
          ['Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV', `<p>Thomas Wordenbeck, Anschrift wie oben.</p>`],
          ['Links auf andere Websites', `<p>Diese Seite verlinkt auf externe Angebote, zum Beispiel LinkedIn und die Websites meiner Projekte. Für deren Inhalte sind ausschließlich die jeweiligen Betreiber verantwortlich.</p>`],
          ['Bildnachweis und Schriften', `<p>Unscharfe Beispielprofile auf „Über mich“ und das Rezeptfoto im Mahlzeit-Screen (Sara Dubler): ${link('https://unsplash.com/license', 'Unsplash-Lizenz')}. Alle übrigen Fotos: Thomas Wordenbeck. Schriften Inter und Space Grotesk unter der SIL Open Font License 1.1.</p>`],
        ],
      },
      en: {
        title: 'Legal notice',
        blocks: [
          ['Information pursuant to § 5 DDG (German Digital Services Act)', `<address>${ADDRESS}</address>`],
          ['Contact', `<p>Email: ${mail}</p>`],
          ['Responsible for content under § 18 (2) MStV', `<p>Thomas Wordenbeck, address as above.</p>`],
          ['Links to other websites', `<p>This site links to external services, for example LinkedIn and the websites of my projects. Their operators are solely responsible for their content.</p>`],
          ['Image credits and fonts', `<p>Blurred example profiles on “About me” and the recipe photo in the Mahlzeit screen (Sara Dubler): ${link('https://unsplash.com/license', 'Unsplash License')}. All other photos: Thomas Wordenbeck. Fonts Inter and Space Grotesk under the SIL Open Font License 1.1.</p>`],
        ],
      },
    },
    datenschutz: {
      de: {
        title: 'Datenschutz',
        lead: 'Kurz gesagt: Diese Seite setzt keine Cookies, nutzt keine Analyse- oder Tracking-Dienste und lädt keine Inhalte von Dritten nach.',
        blocks: [
          ['Verantwortlicher', `<address>${ADDRESS}</address><p>E-Mail: ${mail}</p>`],
          ['Hosting', `<p>Die Seite wird über GitHub Pages ausgeliefert (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). Beim Aufruf verarbeitet GitHub technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit, die aufgerufene Seite und Angaben zum Browser, um die Seite auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist mein berechtigtes Interesse an einer sicheren und zuverlässigen Bereitstellung (Art. 6 Abs. 1 lit. f DSGVO). Dabei können Daten in die USA übermittelt werden; GitHub stützt solche Übermittlungen nach eigenen Angaben auf das EU-US Data Privacy Framework und Standardvertragsklauseln. Mehr dazu: ${link('https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement', 'Datenschutzerklärung von GitHub')}.</p>`],
          ['Speicher im Browser', `<p>Die Seite merkt sich im Speicher Ihres Browsers Ihre Einstellungen (hell/dunkel, Sprache) und ob die kleine „Frag mich“-Blase schon gezeigt wurde. Die eingebetteten App-Demos legen dort außerdem ihre erfundenen Beispieldaten ab (etwa Spielstände oder eine zufällige Demo-Kennung), damit sie wie die echten Apps funktionieren. Diese Angaben verlassen Ihr Gerät nicht und dienen nur der von Ihnen gewünschten Darstellung (§ 25 Abs. 2 Nr. 2 TDDDG). Sie können sie jederzeit über die Einstellungen Ihres Browsers löschen.</p>`],
          ['Schriften und Inhalte', `<p>Schriften, Bilder und Demos liegen auf demselben Server wie die Seite. Es werden keine Verbindungen zu Google Fonts oder anderen Drittanbietern aufgebaut.</p>`],
          ['Kontakt per E-Mail', `<p>Wenn Sie mir schreiben, verarbeite ich Ihre Angaben, um Ihre Nachricht zu beantworten (Art. 6 Abs. 1 lit. b und f DSGVO). Mein Postfach wird von Google (Gmail) bereitgestellt. Ich lösche die Nachrichten, wenn sie nicht mehr benötigt werden.</p>`],
          ['Links zu anderen Anbietern', `<p>Links zu LinkedIn oder zu meinen Projekt-Websites sind normale Links. Erst wenn Sie darauf klicken, werden Daten an den jeweiligen Anbieter übertragen; dort gelten dessen Datenschutzbestimmungen.</p>`],
          ['Ihre Rechte', `<p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung, auf Datenübertragbarkeit und auf Widerspruch (Art. 15 bis 21 DSGVO). Außerdem können Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der Landesbeauftragten für Datenschutz und Informationsfreiheit Nordrhein-Westfalen.</p>`],
          ['Stand', '<p>Oktober 2026</p>'],
        ],
      },
      en: {
        title: 'Privacy',
        lead: 'In short: this site sets no cookies, uses no analytics or tracking services and loads no third-party content.',
        blocks: [
          ['Controller', `<address>${ADDRESS}</address><p>Email: ${mail}</p>`],
          ['Hosting', `<p>This site is served via GitHub Pages (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). When you visit, GitHub processes technically necessary data such as your IP address, date and time, the page requested and browser details in order to deliver the site and protect it against abuse. The legal basis is my legitimate interest in providing the site securely and reliably (Art. 6 (1) (f) GDPR). Data may be transferred to the USA; according to GitHub, such transfers are based on the EU-US Data Privacy Framework and standard contractual clauses. More: ${link('https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement', 'GitHub privacy statement')}.</p>`],
          ['Browser storage', `<p>The site stores your settings (light/dark, language) in your browser and whether the small “ask me” bubble has already been shown. The embedded app demos also keep their made-up sample data there (such as game scores or a random demo ID) so they work like the real apps. This information never leaves your device and only serves the display you requested (§ 25 (2) no. 2 TDDDG). You can delete it at any time in your browser settings.</p>`],
          ['Fonts and content', `<p>Fonts, images and demos are hosted on the same server as the site. No connections are made to Google Fonts or other third parties.</p>`],
          ['Contact by email', `<p>If you write to me, I process your details in order to reply (Art. 6 (1) (b) and (f) GDPR). My mailbox is provided by Google (Gmail). I delete messages once they are no longer needed.</p>`],
          ['Links to other services', `<p>Links to LinkedIn or to my project websites are plain links. Data is only transferred to the respective provider once you click them; their privacy policies then apply.</p>`],
          ['Your rights', `<p>You have the right of access, rectification, erasure and restriction of processing, the right to data portability and the right to object (Art. 15 to 21 GDPR). You may also lodge a complaint with a data protection supervisory authority, for example the State Commissioner for Data Protection and Freedom of Information of North Rhine-Westphalia.</p>`],
          ['Last updated', '<p>October 2026</p>'],
        ],
      },
    },
  };

  const page = PAGES_TEXT[document.body.dataset.legal] || PAGES_TEXT.impressum;
  const P = page[lang] || page.de;
  document.title = `${P.title} – Thomas Wordenbeck`;
  mount(`
    <main class="page legal">
      <a class="back glass" href="${PAGES.home}">${ICON.back}<span data-k="nav.backBtn"></span></a>
      <header class="pg-hero">
        <h1>${esc(P.title)}</h1>
        ${P.lead ? `<p class="pg-lead">${esc(P.lead)}</p>` : ''}
      </header>
      ${P.blocks.map(([h, body]) => `<section class="lg-blk"><h2>${esc(h)}</h2>${body}</section>`).join('')}
    </main>`);
})();
