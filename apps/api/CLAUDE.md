# CLAUDE.md - Backend API

This file provides backend-specific guidance. **See root `/CLAUDE.md` for monorepo-wide commands and structure.**

## Overview

Origin Food House Backend is a **multi-tenant restaurant management platform** built with NestJS, Prisma 7 ORM, and PostgreSQL. The system supports POS (Point of Sale) operations, Kitchen Display Systems (KDS), customer self-ordering via QR codes, payment processing, and subscription management.

- **Port:** 3000
- **Package name:** `@app/api`
- **Tech Stack:** NestJS 11 + Prisma 7.0.0 + PostgreSQL + TypeScript 5.9
- **API Docs:** `http://localhost:3000/api/docs` (when server running)

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

The following sections import detailed documentation for specific topics:

@.claude/docs/development-commands.md

@.claude/docs/clean-code-rules.md

@.claude/docs/api-documentation.md

@.claude/docs/prisma-7-guide.md

@.claude/docs/nestjs-architecture.md

@.claude/docs/architecture-patterns.md

@.claude/docs/security-patterns.md

@.claude/docs/code-style.md

@.claude/docs/database-best-practices.md

@.claude/docs/performance-guide.md

@.claude/docs/quality-checklists.md
