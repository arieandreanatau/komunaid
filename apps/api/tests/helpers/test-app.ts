import { Hono } from "hono";

process.env.JWT_SECRET = "test-secret-for-unit-tests";
process.env.NODE_ENV = "test";
process.env.COOKIE_DOMAIN = "";
process.env.BCRYPT_ROUNDS = "1";
process.env.CORS_ORIGIN = "http://localhost:3000";

vi.mock("@komunaid/database", () => {
  const store = new Map<string, any[]>();
  let idCounter = 1;

  const createId = () => `test-id-${idCounter++}`;

  const handlers: Record<string, any> = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(async ({ data }: any) => ({ id: createId(), createdAt: new Date(), updatedAt: new Date(), ...data })),
    update: vi.fn(async ({ where, data }: any) => ({ id: where?.id || "id", ...data, updatedAt: new Date() })),
    updateMany: vi.fn(async () => ({ count: 0 })),
    delete: vi.fn(),
    deleteMany: vi.fn(async () => ({ count: 0 })),
    count: vi.fn(async () => 0),
    upsert: vi.fn(async ({ create, update }: any) => ({ id: createId(), ...create, ...update })),
    groupBy: vi.fn(async () => []),
    aggregate: vi.fn(),
    $transaction: vi.fn(async (fn: any) => {
      if (typeof fn === "function") {
        const tx = new Proxy(handlers, {
          get(target: any, prop: string) {
            return target[prop] || vi.fn();
          },
        });
        return fn(tx);
      }
      return Promise.all(fn);
    }),
    $queryRaw: vi.fn(async () => []),
  };

  const prisma: any = new Proxy(
    {},
    {
      get(_: any, table: string) {
        if (table.startsWith("$")) {
          return handlers[table] || vi.fn();
        }
        return handlers;
      },
    }
  );

  return { prisma };
});

vi.mock("@komunaid/database/prisma", () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("pino", () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn().mockReturnThis(),
  };
  return {
    default: vi.fn(() => mockLogger),
    __esModule: true,
  };
});

vi.mock("pino-pretty", () => ({
  default: vi.fn(() => ({})),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn(async () => ({ id: "test-email-id" })) },
  })),
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn(async () => ({ messageId: "test-message-id" })),
    })),
  },
}));

export function createTestApp(): Hono {
  return new Hono();
}

export const mockUser = {
  id: "test-user-1",
  email: "test@example.com",
  name: "Test User",
  username: "testuser",
  tokenVersion: 0,
};

export const mockAdminUser = {
  id: "test-admin-1",
  email: "admin@example.com",
  name: "Admin User",
  username: "adminuser",
  tokenVersion: 0,
};

export const mockSuperAdminUser = {
  id: "test-superadmin-1",
  email: "superadmin@example.com",
  name: "Super Admin",
  username: "superadmin",
  tokenVersion: 0,
};

export function createMockContext(options?: {
  user?: any;
  cookie?: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
  params?: Record<string, string>;
}): any {
  const headers = new Map<string, string>();
  headers.set("content-type", "application/json");

  if (options?.cookie) headers.set("cookie", options.cookie);
  if (options?.headers) {
    for (const [k, v] of Object.entries(options.headers)) {
      headers.set(k.toLowerCase(), v);
    }
  }

  const store = new Map<string, any>();

  return {
    req: {
      header: (name: string) => headers.get(name.toLowerCase()) || null,
      url: `http://localhost/api/v1/test${options?.query ? "?" + new URLSearchParams(options.query).toString() : ""}`,
      method: "GET",
      param: (name?: string) => {
        if (name) return options?.params?.[name];
        return options?.params || {};
      },
      json: vi.fn(async () => options?.body || {}),
    },
    json: vi.fn((data: any, status?: number) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } })),
    header: vi.fn(),
    set: (key: string, value: any) => store.set(key, value),
    get: (key: string) => store.get(key),
    _store: store,
  };
}

export { vi };
