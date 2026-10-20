// Ersatz für src/lib/supabase.ts in der Portfolio-Demo.
// Kein Netzwerk: alle Tabellen liegen im Speicher und sind beim Neuladen wieder frisch.
// Der Query-Builder kann genau das, was Mahlzeit benutzt
// (select/eq/order/limit/single/maybeSingle/insert/update/upsert/delete).

import { RECIPES, PARSED_RECIPE } from './demo-data';

type Row = Record<string, any>;
const now = () => new Date().toISOString();
let seq = 1;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`;

const USER = { id: 'u-thomas' };

const db: Record<string, Row[]> = {
  workspaces: [{ id: 'w-1', name: 'Unser Haushalt', code: '4711', created_at: now() }],
  profiles: [
    { id: 'u-thomas', workspace_id: 'w-1', display_name: 'Thomas', color: '--profile-amber', created_at: now(), pin: '1234' },
  ],
  recipes: RECIPES.map((r, i) => ({
    workspace_id: 'w-1', created_by: 'u-thomas', source_author: null, source_caption_raw: null,
    is_favorite: false, ai_confidence: 'high', ai_warnings: [], bild_url: null,
    created_at: new Date(Date.now() - (i + 1) * 86400000).toISOString(), updated_at: now(),
    ...r,
  })),
  weekplans: [],
  weekplan_slots: [],
  recipe_ratings: [],
  recipe_history: [],
  recipe_notes: [],
};

// Neuer Wochenplan → zwei Tage sind schon verplant, damit Einkauf & Liste Inhalt haben
function seedSlots(weekplanId: string) {
  const plan = [
    { day_of_week: 0, recipe_id: 'r-linsen' },
    { day_of_week: 1, recipe_id: 'r-ofengemuese' },
  ];
  plan.forEach((p, i) => db.weekplan_slots.push({
    id: uid('slot'), weekplan_id: weekplanId, meal_type: 'abendessen', custom_text: null,
    position: i, added_by: USER.id, notes: null, zutaten_override: {}, portionen_override: null,
    created_at: now(), ...p,
  }));
}

class Query implements PromiseLike<any> {
  private filters: [string, any][] = [];
  private orders: [string, boolean][] = [];
  private max: number | null = null;
  private mode: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private payload: any = null;
  private conflict: string[] = ['id'];
  private one: false | 'single' | 'maybe' = false;
  private returning = false;

  constructor(private table: string) {
    if (!db[table]) db[table] = [];
  }
  select(_cols?: string) { if (this.mode !== 'select') this.returning = true; return this; }
  insert(v: any) { this.mode = 'insert'; this.payload = v; return this; }
  update(v: any) { this.mode = 'update'; this.payload = v; return this; }
  upsert(v: any, opts?: { onConflict?: string }) {
    this.mode = 'upsert'; this.payload = v;
    if (opts?.onConflict) this.conflict = opts.onConflict.split(',').map(s => s.trim());
    return this;
  }
  delete() { this.mode = 'delete'; return this; }
  eq(col: string, val: any) { this.filters.push([col, val]); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.orders.push([col, opts?.ascending !== false]); return this; }
  limit(n: number) { this.max = n; return this; }
  single() { this.one = 'single'; return this; }
  maybeSingle() { this.one = 'maybe'; return this; }

  private match(r: Row) { return this.filters.every(([c, v]) => r[c] === v); }

  private run(): { data: any; error: any } {
    const rows = db[this.table];
    let out: Row[] = [];

    if (this.mode === 'insert' || this.mode === 'upsert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      for (const it of items) {
        const existing = this.mode === 'upsert'
          ? rows.find(r => this.conflict.every(c => it[c] !== undefined && r[c] === it[c]))
          : undefined;
        if (existing) { Object.assign(existing, it); out.push(existing); continue; }
        const row = { id: uid(this.table), created_at: now(), updated_at: now(), ...it };
        rows.push(row);
        out.push(row);
        if (this.table === 'weekplans') seedSlots(row.id);
      }
      if (!this.returning && !this.one) return { data: null, error: null };
    } else if (this.mode === 'update') {
      out = rows.filter(r => this.match(r));
      out.forEach(r => Object.assign(r, this.payload, { updated_at: now() }));
      if (!this.returning && !this.one) return { data: null, error: null };
    } else if (this.mode === 'delete') {
      db[this.table] = rows.filter(r => !this.match(r));
      return { data: null, error: null };
    } else {
      out = rows.filter(r => this.match(r));
      for (const [col, asc] of [...this.orders].reverse()) {
        out = [...out].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (asc ? 1 : -1));
      }
      if (this.max != null) out = out.slice(0, this.max);
    }

    const copy = out.map(r => structuredClone(r));
    if (this.one === 'single') {
      return copy.length === 1 ? { data: copy[0], error: null } : { data: null, error: { code: 'PGRST116', message: 'Keine Zeile' } };
    }
    if (this.one === 'maybe') return { data: copy[0] ?? null, error: null };
    return { data: copy, error: null };
  }

  then<A = any, B = never>(ok?: ((v: any) => A | PromiseLike<A>) | null, fail?: ((e: any) => B | PromiseLike<B>) | null) {
    const delay = this.mode === 'select' ? 60 : 30;
    return new Promise(res => setTimeout(() => res(this.run()), delay)).then(ok, fail);
  }
}

const channel = { on() { return channel; }, subscribe() { return channel; } };

export const supabase: any = {
  from: (t: string) => new Query(t),
  rpc: async () => ({ data: null, error: null }),
  channel: () => channel,
  removeChannel: () => {},
  auth: {
    getUser: async () => ({ data: { user: USER }, error: null }),
    signInAnonymously: async () => ({ data: { user: USER }, error: null }),
    signOut: async () => ({ error: null }),
  },
  functions: {
    async invoke(name: string) {
      if (name === 'import-recipe-from-url') {
        await new Promise(r => setTimeout(r, 2600)); // "KI liest das Reel"
        return {
          data: {
            status: 'ok',
            extracted_author: '@gruenkueche',
            extracted_caption: null,
            result: { status: 'ok', rezept: structuredClone(PARSED_RECIPE), rueckfrage: null, warnungen: [] },
          },
          error: null,
        };
      }
      return { data: null, error: { message: 'In der Demo nicht verfügbar' } };
    },
  },
};

export const isSupabaseConfigured = true;
