# Command Reference

## Development

```bash
# Start all services (frontend + API)
pnpm dev

# Start only frontend
pnpm dev:web

# Start only API
pnpm dev:api
```

## Build

```bash
# Build all packages
pnpm build

# Build frontend only
pnpm build:web

# Build API only
pnpm build:api
```

## Start (Production)

```bash
# Start all services
pnpm start

# Start frontend only
pnpm start:web

# Start API only
pnpm start:api
```

## Lint & Format

```bash
# Lint all packages
pnpm lint

# Auto-fix lint issues
pnpm lint:fix

# Format all files
pnpm format

# Check formatting
pnpm format:check
```

## Type Checking

```bash
# Type check all packages
pnpm typecheck
```

## Testing

```bash
# Run all tests
pnpm test
```

## Database

```bash
# Run Prisma migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Reset database (drops all data)
pnpm db:reset

# Open Prisma Studio
pnpm db:studio

# Generate Prisma client
pnpm db:generate
```

## Docker

```bash
# Start all services
pnpm docker:up

# Stop all services
pnpm docker:down

# Rebuild and start
pnpm docker:build
```

## Cleanup

```bash
# Clean all build outputs
pnpm clean
```
