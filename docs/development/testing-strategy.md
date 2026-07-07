# KomunaID Testing Strategy

## 1. Testing Pyramid

```
        /\
       /  \        E2E Tests (Critical Flows)
      /    \       - Few in number
     /------\      - High confidence
    /        \     Integration Tests (API + DB)
   /          \    - Moderate number
  /            \   - Test real interactions
 /--------------\  Unit Tests (Services, Utils)
/                \ - Most numerous
                   - Fast, isolated, cheap
```

### Unit Tests

- Service methods with mocked dependencies
- Utility functions and helpers
- Validators and pipes
- Pure business logic
- **Scope**: Single function/class, no I/O

### Integration Tests

- API endpoints with real database
- Prisma queries against test database
- Authentication middleware
- Email sending (mocked SMTP)
- File upload/download flows
- **Scope**: Multiple components interacting

### E2E Tests

- Critical user flows (registration, login, password reset)
- Full request lifecycle (HTTP -> middleware -> controller -> service -> DB)
- **Scope**: End-to-end, production-like environment

## 2. Tools

| Tool                | Purpose                  | Used For                     |
| ------------------- | ------------------------ | ---------------------------- |
| **Jest**            | Test runner + assertions | Unit and integration tests   |
| **Supertest**       | HTTP assertion library   | API endpoint testing         |
| **Prisma**          | Database client          | Test database setup/teardown |
| **ts-jest**         | TypeScript support       | Compile TS tests in Jest     |
| **@nestjs/testing** | NestJS test utilities    | Module/container creation    |

### Jest Configuration

- Root config in monorepo `package.json` or per-app configs
- TypeScript path aliases resolved via `moduleNameMapper`
- Coverage collected from `apps/api/src/` and `apps/web/src/`

## 3. Test Organization

### Backend (`apps/api/`)

```
apps/api/
├── src/
│   └── modules/
│       ├── auth/
│       │   ├── auth.service.spec.ts        # Unit tests
│       │   ├── auth.controller.spec.ts     # Unit tests
│       │   └── auth.module.spec.ts         # Module tests
│       ├── users/
│       │   ├── users.service.spec.ts
│       │   └── users.controller.spec.ts
│       └── ...
└── test/
    ├── auth.e2e-spec.ts                     # E2E tests
    ├── users.e2e-spec.ts
    └── jest-e2e.config.js
```

### Frontend (`apps/web/`)

```
apps/web/
├── src/
│   ├── components/
│   │   └── Button.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   └── lib/
│       └── utils.test.ts
```

### Naming Conventions

- Unit tests: `*.spec.ts` / `*.spec.tsx`
- Integration tests: `*.integration-spec.ts`
- E2E tests: `*.e2e-spec.ts`
- Test files co-located with source files

## 4. Coverage Targets

| Area                    | Target   | Notes                                     |
| ----------------------- | -------- | ----------------------------------------- |
| **Services**            | 80%+     | Core business logic, heavily tested       |
| **Controllers**         | 70%+     | Request/response handling                 |
| **Utilities**           | 90%+     | Pure functions, easy to test              |
| **Critical Flows**      | 100% E2E | Registration, login, password reset, RBAC |
| **Overall Backend**     | 75%+     | Combined unit + integration               |
| **Frontend Components** | 60%+     | Focus on interactive components           |

### Critical Flows (100% E2E Required)

1. User registration and email verification
2. Login and token refresh
3. Password reset flow
4. Role-based access control
5. CRUD operations on core entities
6. File upload and access

## 5. Test Database

### Configuration

```env
# Test database (separate from development)
DATABASE_URL="mysql://root:password@localhost:3306/komunaid_test"
```

### Setup

- **Separate MySQL database**: `komunaid_test` (distinct from `komunaid`)
- **Schema management**: `prisma migrate deploy` before test suite runs
- **Seeding**: Minimal test data seeded per test suite as needed

### Teardown Strategy

| Strategy                 | When              | How                                             |
| ------------------------ | ----------------- | ----------------------------------------------- |
| **Transaction rollback** | Unit tests        | Wrap each test in a transaction, rollback after |
| **Database reset**       | Integration tests | `prisma migrate reset --force` between suites   |
| **Full reset**           | E2E tests         | Complete schema reset + seed before suite       |

### Test Data

- Fixtures defined in `test/fixtures/` or `test/seed.ts`
- No production data in test databases
- User accounts use predictable values for assertion

## 6. Running Tests

```bash
# Run all tests across monorepo
pnpm test

# Run tests for specific app
pnpm --filter @komunaid/api test
pnpm --filter @komunaid/web test

# Run with coverage
pnpm --filter @komunaid/api test -- --coverage

# Run specific test file
pnpm --filter @komunaid/api test -- auth.service.spec.ts

# Run E2E tests
pnpm --filter @komunaid/api test:e2e

# Watch mode for development
pnpm --filter @komunaid/api test -- --watch
```

## 7. CI Integration

Tests run automatically via GitHub Actions on every push and PR:

```yaml
# .github/workflows/test.yml (conceptual)
steps:
  - name: Install dependencies
    run: pnpm install --frozen-lockfile

  - name: Lint
    run: pnpm lint

  - name: Type check
    run: pnpm --parallel -r run typecheck

  - name: Unit & Integration tests
    run: pnpm test

  - name: E2E tests
    run: pnpm --filter @komunaid/api test:e2e
```

### Quality Gates

- All tests must pass before merge
- Coverage thresholds enforced via Jest config
- Lint errors block CI
- Type errors block CI
