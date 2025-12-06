# CLAUDE.md - Backend API

This file provides backend-specific guidance. **See root `/CLAUDE.md` for monorepo-wide commands and structure.**

## Overview

Origin Food House Backend is a **multi-tenant restaurant management platform** built with NestJS, Prisma 7 ORM, and PostgreSQL. The system supports POS (Point of Sale) operations, Kitchen Display Systems (KDS), customer self-ordering via QR codes, payment processing, and subscription management.

- **Port:** 3000
- **Package name:** `@app/api`
- **Tech Stack:** NestJS 11 + Prisma 7.0.0 + PostgreSQL + TypeScript 5.9
- **API Docs:** `http://localhost:3000/api/docs` (when server running)

---

## API Route Structure

All routes are versioned with `/api/v1` prefix and organized by app namespace:

```
/api/v1/
├── rms/                    # RMS-specific (JWT auth)
│   ├── cart/               # Staff cart operations
│   ├── orders/             # Staff order management
│   └── sessions/           # Table session management
├── sos/                    # SOS-specific (Session Token auth)
│   ├── cart/               # Customer cart operations
│   ├── menu/               # Customer menu browsing
│   └── orders/             # Customer order placement
├── admin/                  # Admin Platform (JWT + Platform Admin)
│   ├── stores/             # Store verification
│   ├── users/              # User management
│   └── payments/           # Payment verification
├── stores/{storeId}/       # Shared store routes (JWT auth)
│   ├── categories/
│   ├── menu-items/
│   ├── tables/
│   └── orders/
└── auth/                   # Authentication routes
```

### Module Organization

```
src/
├── rms/                    # RMS-specific modules
│   ├── rms-cart/
│   ├── rms-order/
│   └── rms-session/
├── sos/                    # SOS-specific modules
│   ├── sos-cart/
│   ├── sos-menu/
│   └── sos-order/
├── admin/                  # Admin Platform modules
├── common/
│   └── context/
│       └── app-context.service.ts  # Request-scoped app detection
├── store/                  # Shared store management
├── menu/                   # Shared menu operations
└── order/                  # Shared order operations
```

### App Context Detection

The `AppContextService` detects which app is making requests:

```typescript
// Automatic detection from route prefix or X-App-Context header
const appContext = this.appContextService.getAppContext(); // 'rms' | 'sos' | 'admin'
```

---

## Quick Reference

### Essential Commands

```bash
npm install                 # Install dependencies
npm run docker:up           # Start PostgreSQL database
npm run migrate:db          # Run database migrations
npm run generate:db         # Generate Prisma client
npm run dev                 # Start dev server (port 3000)
```

### Quality Gates (Run Before Every Commit)

```bash
npm run format              # 1. Format code
npm run lint                # 2. Lint passes
npm run typecheck           # 3. Type check passes
npm test                    # 4. All tests pass
npm run build               # 5. Build succeeds
```

**CRITICAL**: If any of these commands fail, the task is NOT complete.

---

## Additional Resources

- **Architecture Review**: [docs/solution-architect/architecture/](docs/solution-architect/architecture/)
- **Security Audit**: [docs/security-audit/](docs/security-audit/)
- **Auth0 Integration**: [docs/AUTH0_INTEGRATION.md](docs/AUTH0_INTEGRATION.md)

---

## Detailed Documentation

The following consolidated guides cover all backend patterns and conventions:

@.claude/docs/backend-guide.md

@.claude/docs/backend-api-patterns.md

@.claude/docs/backend-checklist.md
