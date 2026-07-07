# Contributing to KomunaID

Thank you for your interest in contributing to KomunaID!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature`
5. Make your changes
6. Run tests: `pnpm test`
7. Run lint: `pnpm lint`
8. Commit: `git commit -m "feat: your description"`
9. Push: `git push origin feature/your-feature`
10. Create a Pull Request

## Branch Naming

- `feature/<description>` - New features
- `fix/<description>` - Bug fixes
- `chore/<description>` - Maintenance
- `docs/<description>` - Documentation

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## Development

```bash
pnpm dev          # Start all services
pnpm lint         # Lint all packages
pnpm test         # Run all tests
pnpm build        # Build all packages
```

## Code Standards

- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Write tests for new features

## Pull Request

- Title follows commit convention
- Description explains what and why
- All CI checks pass
- At least 1 review required
