// Baut eine Demo-Version von Mahlzeit für das Portfolio.
// Nutzt den Original-Code aus ../../../MealPlanner, tauscht aber:
//   - src/lib/supabase.ts  → fake-supabase.ts (Beispieldaten im Speicher, kein Netzwerk)
//   - virtual:pwa-register → leerer Stub (kein Service Worker in der Demo)
//   - BrowserRouter        → HashRouter (läuft in einem Unterordner auf GitHub Pages)
//
// Aufruf (aus dem Portfolio-Ordner):
//   node ../MealPlanner/node_modules/vite/bin/vite.js build --config _build/mahlzeit/vite.config.mjs

import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '../../../MealPlanner');
const { default: react } = await import(path.join(appRoot, 'node_modules/@vitejs/plugin-react/dist/index.js'));

const demoSwaps = {
  name: 'mahlzeit-demo-swaps',
  enforce: 'pre',
  async resolveId(source, importer) {
    if (source === 'virtual:pwa-register') return '\0pwa-stub';
    if (importer && /(^|\/)supabase(\.ts)?$/.test(source)) {
      const resolved = await this.resolve(source, importer, { skipSelf: true });
      if (resolved && resolved.id.endsWith('/src/lib/supabase.ts')) return path.join(here, 'fake-supabase.ts');
    }
    return null;
  },
  load(id) {
    if (id === '\0pwa-stub') return 'export const registerSW = () => () => {};';
    return null;
  },
  transform(code, id) {
    if (id.endsWith('/src/App.tsx')) return code.replaceAll('BrowserRouter', 'HashRouter');
    return null;
  },
};

export default {
  root: appRoot,
  base: './',
  configFile: false,
  publicDir: false,
  plugins: [demoSwaps, react()],
  build: {
    outDir: path.resolve(here, '../../demos/mahlzeit'),
    emptyOutDir: true,
  },
};
