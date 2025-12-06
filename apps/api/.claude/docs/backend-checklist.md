# Backend Quality & Security Checklist

This guide covers quality gates, security patterns, development commands, and testing.

---

## Quality Gates (MUST PASS)

Before marking ANY task complete, run in sequence:

```bash
npm run format              # 1. Format code
npm run lint                # 2. Lint passes
npm run typecheck           # 3. Type check passes
npm test                    # 4. All tests pass
npm run build               # 5. Build succeeds
```

**If ANY command fails, the task is NOT complete.**

---

## Essential Commands

```bash
# Setup
npm install
npm run docker:up           # Start PostgreSQL
npm run migrate:db          # Run migrations
npm run generate:db         # Generate Prisma client
npm run seed:db             # Seed demo data

# Development
npm run dev                 # Start server (port 3000)
npm run typecheck           # Type check

# Testing
npm test                    # All unit tests
npm run test:watch          # Watch mode
npm run test:cov            # Coverage report
npm run test:e2e            # E2E tests

# Database
npm run studio:db           # Prisma Studio GUI
npm run reset:db            # Reset database
```

---

## Environment Variables

**Required:**

```env
NODE_ENV=dev
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://api.your-domain.com
AUTH0_ISSUER=https://your-tenant.auth0.com/

# JWT
JWT_SECRET=minimum-32-character-secret-key
JWT_EXPIRES_IN=1d

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

**NEVER:**
- Commit `.env` files
- Use `process.env.VARIABLE` directly (use `ConfigService`)
- Use JWT secrets < 32 characters

---

## Security Patterns

### Authentication & Authorization

```typescript
// ALWAYS use guards on protected routes
@Patch(':id')
@UseGuards(JwtAuthGuard)
async updateStore(
  @Param('id') storeId: string,
  @GetUser('userId') userId: string,
  @Body() dto: UpdateStoreDto,
) {
  return this.storeService.update(userId, storeId, dto);
}

// ALWAYS verify roles in service
async update(userId: string, storeId: string, dto: UpdateStoreDto) {
  await this.checkUserRole(userId, storeId, ['OWNER', 'ADMIN']);
  // ... update logic
}
```

### Store Ownership Validation

```typescript
async checkStoreMembership(userId: string, storeId: string): Promise<void> {
  const membership = await this.prisma.userStore.findFirst({
    where: { userId, storeId },
  });
  if (!membership) {
    throw new ForbiddenException('Access denied to this store');
  }
}
```

### Input Sanitization

All string DTOs use `@Transform(({ value }) => value?.trim())`:

```typescript
export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value?.trim())
  name: string;
}
```

### Database Security

```typescript
// CORRECT - Prisma uses prepared statements
await this.prisma.user.findUnique({ where: { email: userEmail } });

// CORRECT - Template literals are parameterized
await this.prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;

// DANGEROUS - Never do this
await this.prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);
```

### File Upload Validation

```typescript
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
  throw new BadRequestException('Invalid file type');
}
```

---

## Security Checklist

- [ ] `@UseGuards(JwtAuthGuard)` on protected routes
- [ ] Role checks before privileged operations
- [ ] Store isolation enforced (multi-tenancy)
- [ ] Input validation with class-validator
- [ ] DTO sanitization with `@Transform(trim)`
- [ ] No SQL injection (Prisma parameterized queries)
- [ ] Sensitive data not exposed in responses
- [ ] Session tokens not in API responses
- [ ] WebSocket connections authenticated
- [ ] File uploads validated (type, size)
- [ ] Secrets in environment variables

---

## Comprehensive Quality Checklist

### Code Quality

- [ ] Code formatted (`npm run format`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Tests written and passing (`npm test`)
- [ ] Build succeeds (`npm run build`)

### TypeScript

- [ ] No `any` types
- [ ] Explicit return types
- [ ] Null/undefined handled with `?.` and `??`
- [ ] Union types instead of broad string/number

### NestJS Architecture

- [ ] Controllers: request/response handling only
- [ ] Business logic in services
- [ ] DTOs for all input/output
- [ ] Dependency injection used
- [ ] No `forwardRef()` circular dependencies

### Database & Prisma

- [ ] Transactions for multi-step operations
- [ ] Soft deletes (no hard deletes)
- [ ] Indexes on foreign keys
- [ ] `findUniqueOrThrow` when entity must exist
- [ ] `Decimal` for monetary values

### REST API

- [ ] Resource names are plural nouns
- [ ] HTTP methods used semantically
- [ ] Nested paths show relationships
- [ ] Query params for filtering/sorting/pagination
- [ ] camelCase JSON, kebab-case URLs
- [ ] Appropriate HTTP status codes

### Documentation & Logging

- [ ] Swagger documentation (`@ApiOperation`)
- [ ] JSDoc on public methods
- [ ] Structured logging with `[method]` prefix
- [ ] Error handling with typed exceptions
- [ ] `getErrorDetails(error)` for error logging

### Performance

- [ ] SELECT only needed fields
- [ ] Pagination for large datasets
- [ ] Redis caching for read-heavy operations
- [ ] N+1 queries avoided (`include` or `select`)

### OpenAPI Type Safety

- [ ] No `additionalProperties: true` without typed schema
- [ ] Value DTOs registered in `extraModels`
- [ ] No `Record<string, unknown>` in generated types

---

## Background Task Management

**ALWAYS clean up background tasks before finishing:**

```
1. Start dev server → Shell ID: abc123
2. Run tests, make changes
3. Verify changes work
4. Kill shell abc123 before finishing
```

- ONLY kill tasks YOU started
- NEVER kill user processes
- Use `KillShell` tool with shell ID

---

## Git Workflow

### Commit Messages

```bash
# Format: <type>(<scope>): <subject>
feat(auth): add Auth0 JWKS token validation
fix(cart): prevent race condition in WebSocket cart sync
refactor(store): extract slug generation to utility
test(order): add coverage for discount calculation
docs(api): update Swagger docs for payment endpoints
chore(deps): upgrade Prisma to 7.0.0
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `security`

### Pre-Commit Hooks

Husky + lint-staged automatically runs ESLint and Prettier on staged files.

**Manual verification before push:**

```bash
npm run typecheck
npm test
npm run build
```

---

## Testing Patterns

```typescript
describe('StoreService', () => {
  let service: StoreService;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  describe('createStore', () => {
    it('should create store in transaction', async () => {
      const dto: CreateStoreDto = { name: 'Test Store', slug: 'test-store' };
      prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));

      const result = await service.createStore('user-123', dto);

      expect(result).toBeDefined();
      expect(prismaMock.store.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for duplicate slug', async () => {
      prismaMock.$transaction.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002', clientVersion: '7.0.0',
        })
      );

      await expect(service.createStore('user-123', dto)).rejects.toThrow(BadRequestException);
    });
  });
});
```

**Testing rules:**
- Mock Prisma with `createPrismaMock()` helper
- Test success AND error cases
- Test transaction rollback
- Test authorization checks
- Aim for 85%+ coverage

---

## Resolved Vulnerabilities (Reference)

**P0 Critical Issues** - Fixed as of 2025-11-29:

1. **WebSocket Auth Bypass** - `handleConnection` now validates session/JWT
2. **Session Token Exposure** - `mapToSessionResponse()` strips tokens
3. **Checkout Auth Bypass** - Dual auth validation implemented
4. **Missing Store Isolation** - `update()`/`close()` verify store permission

See `docs/security-audit/` for historical context.
