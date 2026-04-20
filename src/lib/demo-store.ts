import {
  DEMO_RUNS, DEMO_SOURCES, DEMO_INSIGHT_DOCS, DEMO_SUMMARIES,
  DEMO_FOUNDATION_DOCS, DEMO_BRIEFS,
} from './demo-data';
import type { Run, Source, InsightDocument, InsightSummary, FoundationDocument, Brief } from './types';

// ---- Mutable in-memory store --------------------------------

let runs: Run[] = [...DEMO_RUNS];
let sources: Source[] = [...DEMO_SOURCES];
let insightDocs: InsightDocument[] = [...DEMO_INSIGHT_DOCS];
let summaries: InsightSummary[] = [...DEMO_SUMMARIES];
let foundationDocs: FoundationDocument[] = [...DEMO_FOUNDATION_DOCS];

function generateId(): string {
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ---- Query result type --------------------------------------

type DbResult<T> = { data: T; error: null } | { data: null; error: { message: string } };

function ok<T>(data: T): DbResult<T> { return { data, error: null }; }

// ---- Schema-aware table resolver ----------------------------

type TableName = 'runs' | 'sources' | 'insight_documents' | 'insight_summaries' | 'foundation_documents' | 'briefs';

function getStore(schema: string, table: string): unknown[] {
  if (schema === 'brief' && table === 'briefs') return [...DEMO_BRIEFS];
  if (schema === 'infohub') {
    if (table === 'runs') return runs;
    if (table === 'sources') return sources;
    if (table === 'insight_documents') return insightDocs;
    if (table === 'insight_summaries') return summaries;
    if (table === 'foundation_documents') return foundationDocs;
  }
  return [];
}

// ---- Mock query builder -------------------------------------

type Filter = { col: string; op: 'eq' | 'in'; val: unknown };
type Operation = 'select' | 'insert' | 'update' | 'delete' | 'upsert';

class MockQueryBuilder {
  private readonly _schema: string;
  private readonly _table: TableName;
  private _op: Operation = 'select';
  private _filters: Filter[] = [];
  private _orderCol: string | null = null;
  private _orderAsc = true;
  private _payload: Record<string, unknown> = {};
  private _upsertConflict: string | null = null;

  constructor(schema: string, table: string) {
    this._schema = schema;
    this._table = table as TableName;
  }

  select(_cols?: string): this { this._op = 'select'; return this; }
  insert(data: Record<string, unknown>): this { this._op = 'insert'; this._payload = data; return this; }
  update(data: Record<string, unknown>): this { this._op = 'update'; this._payload = data; return this; }
  delete(): this { this._op = 'delete'; return this; }
  upsert(data: Record<string, unknown>, opts?: { onConflict?: string }): this {
    this._op = 'upsert';
    this._payload = data;
    this._upsertConflict = opts?.onConflict ?? null;
    return this;
  }

  eq(col: string, val: unknown): this { this._filters.push({ col, op: 'eq', val }); return this; }
  in(col: string, vals: unknown[]): this { this._filters.push({ col, op: 'in', val: vals }); return this; }
  order(col: string, opts?: { ascending?: boolean }): this {
    this._orderCol = col;
    this._orderAsc = opts?.ascending !== false;
    return this;
  }

  single(): Promise<DbResult<Record<string, unknown>>> {
    return this._execute().then(r => {
      if (!r.data) return { data: null, error: { message: 'Not found' } };
      const arr = r.data as Record<string, unknown>[];
      return arr.length > 0 ? ok(arr[0]) : { data: null, error: { message: 'Not found' } };
    });
  }

  maybeSingle(): Promise<DbResult<Record<string, unknown> | null>> {
    return this._execute().then(r => {
      if (!r.data) return ok(null);
      const arr = r.data as Record<string, unknown>[];
      return ok(arr.length > 0 ? arr[0] : null);
    });
  }

  then<T>(onfulfilled: (value: DbResult<unknown[]>) => T): Promise<T> {
    return this._execute().then(onfulfilled as (v: DbResult<unknown[]>) => T);
  }

  private async _execute(): Promise<DbResult<unknown[]>> {
    await tick();

    // Writes
    if (this._op === 'insert') return this._doInsert();
    if (this._op === 'update') { this._doUpdate(); return ok([]); }
    if (this._op === 'delete') { this._doDelete(); return ok([]); }
    if (this._op === 'upsert') { this._doUpsert(); return ok([]); }

    // Read
    let rows = getStore(this._schema, this._table) as Record<string, unknown>[];
    rows = this._applyFilters(rows);
    if (this._orderCol) {
      const col = this._orderCol;
      const asc = this._orderAsc;
      rows = [...rows].sort((a, b) => {
        const av = String(a[col] ?? '');
        const bv = String(b[col] ?? '');
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return ok(rows);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _applyFilters(rows: any[]): any[] {
    return rows.filter(row =>
      this._filters.every(f => {
        if (f.op === 'eq') return row[f.col] === f.val;
        if (f.op === 'in') return (f.val as unknown[]).includes(row[f.col]);
        return true;
      })
    );
  }

  private _doInsert(): DbResult<unknown[]> {
    const schema = this._schema;
    const table = this._table;
    const now = new Date().toISOString();
    const record = { id: generateId(), created_at: now, updated_at: now, ...this._payload };

    if (schema === 'infohub') {
      if (table === 'runs') runs = [...runs, record as unknown as Run];
      else if (table === 'sources') sources = [...sources, record as unknown as Source];
      else if (table === 'insight_documents') insightDocs = [...insightDocs, record as unknown as InsightDocument];
    }
    return ok([record]);
  }

  private _doUpdate(): void {
    const schema = this._schema;
    const table = this._table;
    const patch = this._payload;

    if (schema === 'infohub') {
      if (table === 'runs') {
        runs = runs.map(r => this._matches(r) ? { ...r, ...patch, updated_at: new Date().toISOString() } : r);
      } else if (table === 'sources') {
        sources = sources.map(s => this._matches(s) ? { ...s, ...patch } as Source : s);
      } else if (table === 'insight_documents') {
        insightDocs = insightDocs.map(d => this._matches(d) ? { ...d, ...patch } as InsightDocument : d);
      } else if (table === 'foundation_documents') {
        foundationDocs = foundationDocs.map(d => this._matches(d) ? { ...d, ...patch, updated_at: new Date().toISOString() } as FoundationDocument : d);
      } else if (table === 'insight_summaries') {
        summaries = summaries.map(s => this._matches(s) ? { ...s, ...patch } as InsightSummary : s);
      }
    }
  }

  private _doDelete(): void {
    if (this._schema === 'infohub') {
      if (this._table === 'sources') {
        sources = sources.filter(s => !this._matches(s as unknown as Record<string, unknown>));
      }
    }
  }

  private _doUpsert(): void {
    const schema = this._schema;
    const table = this._table;
    const now = new Date().toISOString();
    const data = this._payload;
    const conflictKey = this._upsertConflict;

    if (schema === 'infohub') {
      if (table === 'insight_summaries') {
        const existing = summaries.find(s => conflictKey ? s[conflictKey as keyof InsightSummary] === data[conflictKey!] : false);
        if (existing) {
          summaries = summaries.map(s => s === existing ? { ...s, ...data, updated_at: now } as InsightSummary : s);
        } else {
          summaries = [...summaries, { id: generateId(), created_at: now, ...data } as unknown as InsightSummary];
        }
      } else if (table === 'foundation_documents') {
        const existing = foundationDocs.find(d => conflictKey ? d[conflictKey as keyof FoundationDocument] === data[conflictKey!] : false);
        if (existing) {
          foundationDocs = foundationDocs.map(d => d === existing ? { ...d, ...data, updated_at: now } as FoundationDocument : d);
        } else {
          foundationDocs = [...foundationDocs, { id: generateId(), created_at: now, updated_at: now, ...data } as unknown as FoundationDocument];
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _matches(row: any): boolean {
    return this._filters.every(f => {
      if (f.op === 'eq') return row[f.col] === f.val;
      return true;
    });
  }
}

async function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 20));
}

// ---- Storage mock -------------------------------------------

const mockStorage = {
  from: (_bucket: string) => ({
    upload: async (_path: string, _file: File, _opts?: unknown) => ({ data: {}, error: null }),
    download: async (_path: string) => ({ data: new Blob(), error: null }),
  }),
};

// ---- Supabase-shaped mock client ----------------------------

function createMockSupabase() {
  return {
    schema: (schemaName: string) => ({
      from: (tableName: string) => new MockQueryBuilder(schemaName, tableName),
    }),
    functions: {
      invoke: async <T>(_name: string, _opts?: unknown): Promise<{ data: T; error: null }> => {
        await tick();
        return { data: {} as T, error: null };
      },
    },
    storage: mockStorage,

    // Helpers for the edge function mocks to mutate state directly
    _getStore: getStore,
    _mutate: {
      updateSource: (id: string, patch: Partial<Source>) => {
        sources = sources.map(s => s.id === id ? { ...s, ...patch } as Source : s);
      },
      updateInsightDoc: (id: string, patch: Partial<InsightDocument>) => {
        insightDocs = insightDocs.map(d => d.id === id ? { ...d, ...patch } as InsightDocument : d);
      },
      upsertSummary: (data: InsightSummary) => {
        const idx = summaries.findIndex(s => s.run_id === data.run_id);
        if (idx >= 0) summaries = summaries.map((s, i) => i === idx ? data : s);
        else summaries = [...summaries, data];
      },
      upsertFoundation: (data: FoundationDocument) => {
        const idx = foundationDocs.findIndex(d => d.run_id === data.run_id);
        if (idx >= 0) foundationDocs = foundationDocs.map((d, i) => i === idx ? data : d);
        else foundationDocs = [...foundationDocs, data];
      },
      getInsightDocsForRun: (runId: string) => insightDocs.filter(d => d.run_id === runId && d.status === 'done'),
      getSummaryForRun: (runId: string) => summaries.find(s => s.run_id === runId) ?? null,
      getRunById: (id: string) => runs.find(r => r.id === id) ?? null,
      getSourcesForRun: (runId: string) => sources.filter(s => s.run_id === runId),
    },
  };
}

export const mockSupabase = createMockSupabase();
export type MockSupabase = typeof mockSupabase;
