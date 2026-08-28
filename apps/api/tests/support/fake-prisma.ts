/**
 * Shared Map-backed fake Prisma client for API integration tests.
 *
 * This is the ONE fixture module every `tests/integration/*.test.ts` file should
 * use instead of hand-rolling its own `vi.mock("@komunaid/database", ...)` block.
 * See tests/support/README.md for the rationale and the real-database opt-in.
 *
 * Design goals:
 *  - Every table method (`findUnique`, `create`, `updateMany`, ...) is a real
 *    `vi.fn()` wrapping a generic, Map-backed implementation, so existing test
 *    idioms like `(prisma.event.findUnique as any).mockResolvedValueOnce(...)`
 *    keep working untouched.
 *  - `updateMany` performs REAL `where` matching against the stored row. If a
 *    row's current `status` no longer matches `where.status`, it is excluded
 *    from the update and does not count — this is what makes optimistic
 *    concurrency guards (`changed.count !== 1`) actually testable.
 *  - `deletedAt: null` in a `where` clause is matched like any other field, so
 *    soft-deleted rows are naturally excluded once a test seeds `deletedAt`.
 *  - `$transaction` supports both the array form (`Promise.all`) and the
 *    interactive callback form (`fn(tx)`, where `tx` is the same client).
 */
import { vi } from "vitest";

// ---------------------------------------------------------------------------
// where / data helpers
// ---------------------------------------------------------------------------

type AnyRecord = Record<string, any>;

function isPlainObject(value: unknown): value is AnyRecord {
  return (
    value !== null &&
    typeof value === "object" &&
    !(value instanceof Date) &&
    !Array.isArray(value)
  );
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : (a as any) === b;
  }
  return a === b;
}

/** Matches a single `field: condition` pair from a Prisma-style `where`. */
function matchField(record: AnyRecord, key: string, cond: unknown): boolean {
  if (cond === undefined) return true;

  if (isPlainObject(cond)) {
    if ("in" in cond) return Array.isArray(cond.in) && cond.in.some((v: unknown) => valuesEqual(record[key], v));
    if ("notIn" in cond) return !(Array.isArray(cond.notIn) && cond.notIn.some((v: unknown) => valuesEqual(record[key], v)));
    if ("not" in cond) return !valuesEqual(record[key], cond.not);
    if ("equals" in cond) return valuesEqual(record[key], cond.equals);
    if ("contains" in cond) return typeof record[key] === "string" && record[key].includes(cond.contains);
    if ("gte" in cond && !(record[key] >= cond.gte)) return false;
    if ("lte" in cond && !(record[key] <= cond.lte)) return false;
    if ("gt" in cond && !(record[key] > cond.gt)) return false;
    if ("lt" in cond && !(record[key] < cond.lt)) return false;
    if (["gte", "lte", "gt", "lt"].some((op) => op in cond)) return true;

    // Not a recognized filter operator: this is very likely a compound-unique
    // key filter, e.g. `communityId_userId: { communityId, userId }`, where the
    // record itself stores the flattened fields rather than the compound key.
    if (!(key in record)) {
      return matchesWhere(record, cond);
    }
    if (record[key] == null) return false;
    return matchesWhere(record[key], cond);
  }

  return valuesEqual(record[key], cond);
}

export function matchesWhere(record: AnyRecord, where?: AnyRecord | null): boolean {
  if (!where) return true;
  for (const [key, cond] of Object.entries(where)) {
    if (key === "AND") {
      const clauses = Array.isArray(cond) ? cond : [cond];
      if (!clauses.every((w: AnyRecord) => matchesWhere(record, w))) return false;
      continue;
    }
    if (key === "OR") {
      const clauses = Array.isArray(cond) ? cond : [cond];
      if (!clauses.some((w: AnyRecord) => matchesWhere(record, w))) return false;
      continue;
    }
    if (key === "NOT") {
      const clauses = Array.isArray(cond) ? cond : [cond];
      if (clauses.some((w: AnyRecord) => matchesWhere(record, w))) return false;
      continue;
    }
    if (!matchField(record, key, cond)) return false;
  }
  return true;
}

/** Applies a Prisma-style `data` payload (incl. increment/decrement/set) onto a stored row. */
function applyData(record: AnyRecord, data: AnyRecord): AnyRecord {
  for (const [key, value] of Object.entries(data)) {
    if (isPlainObject(value)) {
      if ("increment" in value) { record[key] = (record[key] ?? 0) + value.increment; continue; }
      if ("decrement" in value) { record[key] = (record[key] ?? 0) - value.decrement; continue; }
      if ("multiply" in value) { record[key] = (record[key] ?? 0) * value.multiply; continue; }
      if ("divide" in value) { record[key] = (record[key] ?? 0) / value.divide; continue; }
      if ("set" in value) { record[key] = value.set; continue; }
      if ("connect" in value || "create" in value || "disconnect" in value) {
        // Relation writes through `update`/`updateMany` are out of scope for the
        // generic engine — routes under test perform these as separate calls.
        continue;
      }
    }
    record[key] = value;
  }
  record.updatedAt = new Date();
  return record;
}

function applyOrderBy(items: AnyRecord[], orderBy: unknown): AnyRecord[] {
  if (!orderBy) return items;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...items].sort((a, b) => {
    for (const ord of orders as AnyRecord[]) {
      const [[field, dir]] = Object.entries(ord);
      const av = a[field];
      const bv = b[field];
      if (av === bv) continue;
      const cmp = av > bv ? 1 : -1;
      return dir === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

// ---------------------------------------------------------------------------
// table engine
// ---------------------------------------------------------------------------

export interface RelationConfig {
  /** Name of the table holding the related rows. */
  table: string;
  /** Foreign key field on the related row pointing back at this row's id. */
  fk: string;
  /** Set false for a to-one relation (e.g. settings). Defaults to true (to-many). */
  many?: boolean;
}

export interface FakeTable {
  seed(row: AnyRecord): AnyRecord;
  clear(): void;
  all(): AnyRecord[];
  findUnique: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
  findMany: ReturnType<typeof vi.fn>;
  findUniqueOrThrow: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  createMany: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  groupBy: ReturnType<typeof vi.fn>;
  aggregate: ReturnType<typeof vi.fn>;
}

function createTable(
  store: Map<string, Map<string, AnyRecord>>,
  name: string,
  relations: Record<string, RelationConfig>,
  defaults: AnyRecord = {}
): FakeTable {
  const rows = new Map<string, AnyRecord>();
  store.set(name, rows);
  let counter = 1;
  const nextId = () => `${name}-${counter++}`;

  const all = () => Array.from(rows.values());

  function matchOne(where: AnyRecord | undefined): AnyRecord | undefined {
    if (!where) return undefined;
    if (where.id !== undefined && Object.keys(where).length === 1) return rows.get(where.id);
    return all().find((row) => matchesWhere(row, where));
  }

  function stripRelationWrites(data: AnyRecord): { clean: AnyRecord; pending: Array<{ relKey: string; payload: AnyRecord[] }> } {
    const clean: AnyRecord = {};
    const pending: Array<{ relKey: string; payload: AnyRecord[] }> = [];
    for (const [key, value] of Object.entries(data)) {
      if (relations[key] && isPlainObject(value) && "create" in value) {
        pending.push({ relKey: key, payload: Array.isArray(value.create) ? value.create : [value.create] });
        continue;
      }
      if (relations[key] && isPlainObject(value) && ("connect" in value || "connectOrCreate" in value)) {
        continue;
      }
      clean[key] = value;
    }
    return { clean, pending };
  }

  function fillIncludes(row: AnyRecord, include?: AnyRecord, select?: AnyRecord): AnyRecord {
    const spec = include || select;
    if (!spec) return row;
    const result = { ...row };
    for (const [key, val] of Object.entries(spec)) {
      if (!val) continue;
      if (key === "_count" && isPlainObject(val) && val.select) {
        const counts: AnyRecord = {};
        for (const countKey of Object.keys(val.select)) {
          const rel = relations[countKey];
          counts[countKey] = rel
            ? (store.get(rel.table) ? Array.from(store.get(rel.table)!.values()) : []).filter(
                (r) => r[rel.fk] === row.id && r.deletedAt == null
              ).length
            : Array.isArray(row[countKey])
              ? row[countKey].length
              : 0;
        }
        result._count = { ...(row._count || {}), ...counts };
        continue;
      }
      const rel = relations[key];
      if (rel) {
        const target = store.get(rel.table);
        let joined = target ? Array.from(target.values()).filter((r) => r[rel.fk] === row.id) : [];
        if (isPlainObject(val) && val.where) joined = joined.filter((r) => matchesWhere(r, val.where));
        result[key] = rel.many === false ? joined[0] ?? null : joined;
        continue;
      }
      if (!(key in result)) {
        result[key] = row[key] ?? (Array.isArray(row[key]) ? [] : null);
      }
    }
    return result;
  }

  function insertRow(data: AnyRecord): AnyRecord {
    const { clean, pending } = stripRelationWrites(data);
    const id = clean.id || nextId();
    const row: AnyRecord = { deletedAt: null, createdAt: new Date(), updatedAt: new Date(), ...defaults, ...clean, id };
    rows.set(id, row);
    for (const { relKey, payload } of pending) {
      const rel = relations[relKey];
      if (!rel) continue;
      const target = store.get(rel.table);
      if (!target) continue;
      for (const item of payload) {
        const childId = item.id || `${rel.table}-${Math.random().toString(36).slice(2, 9)}`;
        target.set(childId, {
          deletedAt: null,
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
          ...item,
          id: childId,
          [rel.fk]: id,
        });
      }
    }
    return row;
  }

  // Plain default implementations, kept around so `resetMocks()` can reinstall them.
  // This matters because `vi.clearAllMocks()` (used by every test file's `beforeEach`)
  // only clears call history — a `mockResolvedValue`/`mockImplementation` set by an
  // earlier test on a table's shared `vi.fn()` otherwise silently shadows this default
  // for every later test in the file. `db.reset()` calls this after clearing rows so
  // each test starts from the genuine generic behavior unless it re-overrides a call
  // itself.
  const defaultImpls = {
    findUnique: async ({ where, include, select }: AnyRecord = {}) => {
      const row = matchOne(where);
      return row ? fillIncludes(row, include, select) : null;
    },
    findUniqueOrThrow: async ({ where, include, select }: AnyRecord = {}) => {
      const row = matchOne(where);
      if (!row) throw new Error(`${name} not found`);
      return fillIncludes(row, include, select);
    },
    findFirst: async ({ where, include, select, orderBy }: AnyRecord = {}) => {
      const matched = applyOrderBy(all().filter((r) => matchesWhere(r, where)), orderBy);
      const row = matched[0];
      return row ? fillIncludes(row, include, select) : null;
    },
    findMany: async ({ where, include, select, orderBy, skip, take }: AnyRecord = {}) => {
      let matched = applyOrderBy(all().filter((r) => matchesWhere(r, where)), orderBy);
      if (typeof skip === "number") matched = matched.slice(skip);
      if (typeof take === "number") matched = matched.slice(0, take);
      return matched.map((r) => fillIncludes(r, include, select));
    },
    count: async ({ where }: AnyRecord = {}) => all().filter((r) => matchesWhere(r, where)).length,
    create: async ({ data, include, select }: AnyRecord) => fillIncludes(insertRow(data), include, select),
    createMany: async ({ data }: AnyRecord) => {
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) insertRow(item);
      return { count: items.length };
    },
    update: async ({ where, data, include, select }: AnyRecord) => {
      const row = matchOne(where);
      if (!row) throw new Error("Not Found");
      const { clean } = stripRelationWrites(data);
      applyData(row, clean);
      return fillIncludes(row, include, select);
    },
    updateMany: async ({ where, data }: AnyRecord) => {
      const matched = all().filter((r) => matchesWhere(r, where));
      const { clean } = stripRelationWrites(data);
      for (const row of matched) applyData(row, clean);
      return { count: matched.length };
    },
    delete: async ({ where }: AnyRecord) => {
      const row = matchOne(where);
      if (row) rows.delete(row.id);
      return row ?? null;
    },
    deleteMany: async ({ where }: AnyRecord = {}) => {
      const matched = all().filter((r) => matchesWhere(r, where));
      for (const row of matched) rows.delete(row.id);
      return { count: matched.length };
    },
    upsert: async ({ where, create, update, include, select }: AnyRecord) => {
      const row = matchOne(where);
      if (row) {
        const { clean } = stripRelationWrites(update || {});
        applyData(row, clean);
        return fillIncludes(row, include, select);
      }
      return fillIncludes(insertRow(create), include, select);
    },
    groupBy: async () => [],
    aggregate: async () => ({}),
  } as const;

  const table: FakeTable = {
    seed(row: AnyRecord) {
      const id = row.id || nextId();
      const full = { deletedAt: null, createdAt: new Date(), updatedAt: new Date(), ...row, id };
      rows.set(id, full);
      return full;
    },
    clear() {
      rows.clear();
      counter = 1;
      for (const key of Object.keys(defaultImpls) as Array<keyof typeof defaultImpls>) {
        (table[key] as ReturnType<typeof vi.fn>).mockReset();
        (table[key] as ReturnType<typeof vi.fn>).mockImplementation(defaultImpls[key] as any);
      }
    },
    all,

    findUnique: vi.fn(defaultImpls.findUnique),
    findUniqueOrThrow: vi.fn(defaultImpls.findUniqueOrThrow),
    findFirst: vi.fn(defaultImpls.findFirst),
    findMany: vi.fn(defaultImpls.findMany),
    count: vi.fn(defaultImpls.count),
    create: vi.fn(defaultImpls.create),
    createMany: vi.fn(defaultImpls.createMany),
    update: vi.fn(defaultImpls.update),
    updateMany: vi.fn(defaultImpls.updateMany),
    delete: vi.fn(defaultImpls.delete),
    deleteMany: vi.fn(defaultImpls.deleteMany),
    upsert: vi.fn(defaultImpls.upsert),
    groupBy: vi.fn(defaultImpls.groupBy),
    aggregate: vi.fn(defaultImpls.aggregate),
  };

  return table;
}

// ---------------------------------------------------------------------------
// known tables + relations
// ---------------------------------------------------------------------------

const TABLE_NAMES = [
  "user",
  "userRole",
  "community",
  "communityMember",
  "communitySettings",
  "communityMedia",
  "communityCategory",
  "communityTag",
  "organization",
  "organizationMember",
  "event",
  "eventRegistration",
  "eventSave",
  "eventCategory",
  "eventStatusHistory",
  "category",
  "joinRequest",
  "auditLog",
  "activityHistory",
  "membershipHistory",
  "notification",
  "notificationTemplate",
  "refreshToken",
  "loginHistory",
  "report",
  "setting",
  "volunteerOpportunity",
  "volunteerPosition",
  "volunteerApplication",
  "volunteerStatusHistory",
  "volunteerProgram",
  "volunteerProgramStatusHistory",
  "volunteerProgramOrganizerAccess",
  "volunteerProgramApplication",
  "volunteerProgramApplicationHistory",
  "volunteerProgramParticipation",
] as const;

const RELATIONS: Partial<Record<(typeof TABLE_NAMES)[number], Record<string, RelationConfig>>> = {
  user: {
    roles: { table: "userRole", fk: "userId" },
  },
  community: {
    members: { table: "communityMember", fk: "communityId" },
    settings: { table: "communitySettings", fk: "communityId", many: false },
    categories: { table: "communityCategory", fk: "communityId" },
    tags: { table: "communityTag", fk: "communityId" },
    events: { table: "event", fk: "communityId" },
  },
  event: {
    categories: { table: "eventCategory", fk: "eventId" },
    registrations: { table: "eventRegistration", fk: "eventId" },
  },
  organization: {
    members: { table: "organizationMember", fk: "organizationId" },
    events: { table: "event", fk: "organizationId" },
  },
};

/** Mirrors the handful of `@default(...)` scalar columns tests actually rely on. */
const TABLE_DEFAULTS: Partial<Record<(typeof TABLE_NAMES)[number], AnyRecord>> = {
  user: { tokenVersion: 0, status: "ACTIVE" },
  community: { status: "DRAFT", visibility: "PUBLIC" },
  event: { status: "DRAFT", visibility: "PUBLIC" },
};

export interface FakeDb {
  tables: Record<(typeof TABLE_NAMES)[number], FakeTable>;
  reset(): void;
}

export interface FakePrismaHandle {
  prisma: AnyRecord;
  db: FakeDb;
}

/**
 * Builds a fresh, isolated fake Prisma client + its backing tables. Call this
 * once per test file (module scope) and pass `prisma` into `vi.mock`.
 */
export function createFakePrisma(): FakePrismaHandle {
  const store = new Map<string, Map<string, AnyRecord>>();
  const tables = {} as Record<(typeof TABLE_NAMES)[number], FakeTable>;
  for (const name of TABLE_NAMES) {
    tables[name] = createTable(store, name, RELATIONS[name] || {}, TABLE_DEFAULTS[name] || {});
  }

  const root: AnyRecord = { ...tables };

  const defaultTransaction = async (arg: any, _options?: any) => {
    if (typeof arg === "function") return arg(root);
    return Promise.all(arg);
  };
  const defaultQueryRaw = async () => [];
  const defaultExecuteRaw = async () => 0;

  root.$transaction = vi.fn(defaultTransaction);
  root.$queryRaw = vi.fn(defaultQueryRaw);
  root.$queryRawUnsafe = vi.fn(defaultQueryRaw);
  root.$executeRaw = vi.fn(defaultExecuteRaw);
  root.$executeRawUnsafe = vi.fn(defaultExecuteRaw);

  const db: FakeDb = {
    tables,
    reset() {
      for (const t of Object.values(tables)) t.clear();
      root.$transaction.mockReset();
      root.$transaction.mockImplementation(defaultTransaction);
      root.$queryRaw.mockReset();
      root.$queryRaw.mockImplementation(defaultQueryRaw);
      root.$queryRawUnsafe.mockReset();
      root.$queryRawUnsafe.mockImplementation(defaultQueryRaw);
      root.$executeRaw.mockReset();
      root.$executeRaw.mockImplementation(defaultExecuteRaw);
      root.$executeRawUnsafe.mockReset();
      root.$executeRawUnsafe.mockImplementation(defaultExecuteRaw);
    },
  };

  // Non-enumerable so it never shows up in route code that spreads/iterates `prisma`.
  Object.defineProperty(root, "__fakeDb", { value: db, enumerable: false });

  return { prisma: root, db };
}
