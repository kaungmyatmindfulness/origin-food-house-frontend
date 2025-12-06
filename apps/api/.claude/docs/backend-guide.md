# Backend Development Guide

This consolidated guide covers TypeScript rules, NestJS architecture, Prisma 7, and database patterns.

---

## TypeScript Strictness

**Rules:**
- NEVER use `any` type
- NEVER use non-null assertion (`!`) without null check first
- ALWAYS use optional chaining (`?.`) and nullish coalescing (`??`)
- ALWAYS use explicit & narrow types (union types like `'OWNER' | 'ADMIN'` instead of `string`)
- ALWAYS use discriminated unions for type-safe branching
- PREFER default values: `function getConfig(env = 'dev')` instead of `env?: string`

```typescript
// Type-safe patterns
type UserRole = 'OWNER' | 'ADMIN' | 'CHEF' | 'CASHIER' | 'SERVER';

type PaymentResult =
  | { success: true; transactionId: string }
  | { success: false; error: string };

function handlePayment(result: PaymentResult) {
  if (result.success) {
    this.logger.log(`Payment successful: ${result.transactionId}`);
  } else {
    this.logger.error(`Payment failed: ${result.error}`);
  }
}
```

---

## Error Handling & Logging

**ALWAYS use typed exceptions and structured logging:**

```typescript
async findUser(id: string): Promise<User> {
  const method = this.findUser.name;
  this.logger.log(`[${method}] Fetching user with ID: ${id}`);

  try {
    return await this.prisma.findUniqueOrThrow({ where: { id } });
  } catch (error) {
    this.logger.error(`[${method}] Failed to fetch user ${id}`, getErrorDetails(error));

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    throw new InternalServerErrorException('An unexpected error occurred');
  }
}
```

**Rules:**
- ALWAYS use NestJS exception classes (`NotFoundException`, `BadRequestException`, etc.)
- ALWAYS prefix logs with `[${method}]` using `const method = this.methodName.name`
- ALWAYS use `getErrorDetails(error)` utility for error logging
- NEVER use `console.log` - use `this.logger` instead

---

## NestJS Architecture

### Module Organization

```
src/
├── auth/           # Authentication & authorization
├── store/          # Store management
├── menu/           # Menu items & pricing
├── order/          # Order processing
├── payment/        # Payment & refunds
├── kitchen/        # Kitchen Display System
├── common/         # Shared utilities
```

**Each module MUST contain:** Controller, Service, DTOs, Module file, Tests

### Controller Rules

Controllers MUST NOT contain business logic - delegate to services:

```typescript
// GOOD - Controller delegates to service
@Post()
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Create new user' })
async createUser(
  @Body() dto: CreateUserDto,
  @GetUser('userId') currentUserId: string,
): Promise<UserResponseDto> {
  return this.userService.create(currentUserId, dto);
}
```

**Controller responsibilities ONLY:** Request validation, authentication/authorization (guards), call service, return response.

### Service Rules

- Services MUST be stateless (use Redis for caching, not in-memory)
- Services MUST be injected (never `new Service()`)
- Services MUST use transactions for multi-step operations
- Services MUST handle all error cases with typed exceptions

### Dependency Injection

```typescript
// CORRECT - Constructor injection
@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}
}

// Use PrismaService directly (no repository abstraction)
// Use ConfigService for env vars (never process.env directly)
```

**NEVER use `forwardRef()`** - refactor to common module instead.

### Service Delegation Pattern

Delegate entity operations to their owning service:

```typescript
// GOOD - StoreService delegates to CategoryService
async createStore(dto: CreateStoreDto) {
  return this.prisma.$transaction(async (tx) => {
    const store = await tx.store.create({ data: dto });
    await this.categoryService.createBulkForSeeding(tx, store.id, DEFAULT_CATEGORIES);
    return store;
  });
}
```

---

## Prisma 7 Configuration

### Driver Architecture with `@prisma/adapter-pg`

```typescript
// src/prisma/prisma.service.ts
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from 'src/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

### Configuration File (`prisma.config.ts`)

```typescript
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'ts-node --transpile-only prisma/seed.ts' },
  datasource: { url: env('DATABASE_URL') },
});
```

**Import from:** `import { PrismaClient } from 'src/generated/prisma/client';`

---

## Database Patterns

### Schema Design

```prisma
model User {
  id        String   @id @default(uuid(7))  // uuid(7) is project standard
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now()) @updatedAt
  deletedAt DateTime?  // Soft delete pattern
}

model Order {
  subtotal Decimal @db.Decimal(10, 2)  // Decimal for money
  total    Decimal @db.Decimal(10, 2)
}
```

**Rules:**
- ALWAYS use `uuid(7)` for primary keys
- ALWAYS use `Decimal` for monetary values (not Float)
- ALWAYS use `deletedAt: DateTime?` for soft deletes
- ALWAYS use ENUMs for finite sets

### Indexing

```prisma
model Order {
  storeId String
  status  OrderStatus

  @@index([storeId])           // Foreign keys
  @@index([status])            // Frequently filtered
  @@index([storeId, status])   // Composite for common queries
}
```

### Transactions

```typescript
// ALWAYS use transactions for multi-step operations
async createStore(userId: string, dto: CreateStoreDto): Promise<Store> {
  return await this.prisma.$transaction(async (tx) => {
    const store = await tx.store.create({ data: { slug: dto.slug } });
    await tx.storeInformation.create({ data: { storeId: store.id, ...dto } });
    await tx.userStore.create({ data: { userId, storeId: store.id, role: 'OWNER' } });
    return store;
  });
}
```

### Query Patterns

```typescript
// Use findUniqueOrThrow when entity must exist
const store = await this.prisma.store.findUniqueOrThrow({ where: { id } });

// ALWAYS filter by storeId (multi-tenancy)
const items = await this.prisma.menuItem.findMany({
  where: { storeId, deletedAt: null },
});

// ALWAYS use soft deletes
await this.prisma.menuItem.update({
  where: { id },
  data: { deletedAt: new Date() },
});

// Atomic UPSERT instead of find + create/update
await this.prisma.userStore.upsert({
  where: { userId_storeId: { userId, storeId } },
  update: { role },
  create: { userId, storeId, role },
});
```

### Migrations

```bash
npm run migrate:db          # Development (interactive)
npx prisma migrate deploy   # Production (non-interactive)
```

- NEVER modify existing migration files
- NEVER drop columns without deprecation period
- ALWAYS test migrations on staging first

---

## Architecture Patterns

### Multi-Tenancy (Store Isolation)

```typescript
// ALWAYS filter by storeId
async getMenuItems(storeId: string) {
  return this.prisma.menuItem.findMany({
    where: { storeId, deletedAt: null },
  });
}

// ALWAYS verify store access
await this.checkStoreMembership(userId, storeId);
```

### RBAC (5 Roles)

| Role | Access |
|------|--------|
| OWNER | Full access |
| ADMIN | Store settings, menu, users |
| CHEF | Menu, orders (view/update status) |
| CASHIER | Orders, payments |
| SERVER | Create orders, tables |

```typescript
// Verify role before privileged operations
await this.checkUserRole(userId, storeId, ['OWNER', 'ADMIN']);
```

### Image Storage (Path-Based)

Store base paths (NOT URLs) in database:

```typescript
// Database stores: "uploads/abc-123-def"
// Frontend constructs: baseUrl + path + "-medium.webp"

await this.prisma.menuItem.create({
  data: { imagePath: uploadResult.basePath },  // Just base path
});
```

**Presets:** `menu-item` (small/medium/large), `store-logo` (small/medium), `cover-photo`, `payment-proof`

Use `@IsImagePath()` validator for input DTOs.

---

## Input Validation

```typescript
export class CreateMenuItemDto {
  @ApiProperty({ description: "Menu item name", example: "Margherita Pizza" })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }: { value: string }) => value?.trim())  // Sanitize
  name: string;

  @ApiProperty({ description: "Price", example: 12.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ description: "Store UUID" })
  @IsUUID()
  storeId: string;
}
```

**Rules:**
- ALWAYS use class-validator decorators
- ALWAYS add `@ApiProperty` for Swagger docs
- ALWAYS validate lengths, ranges, UUIDs
- ALWAYS use `@Transform` for string sanitization
- NEVER use inline DTO definitions

---

## Performance

### Query Optimization

```typescript
// Select only needed fields
const items = await this.prisma.menuItem.findMany({
  select: { id: true, name: true, price: true },
});

// Avoid N+1 - use include
const orders = await this.prisma.order.findMany({
  include: { items: true },
});

// Cursor-based pagination for large datasets
const items = await this.prisma.menuItem.findMany({
  take: limit,
  cursor: lastItemId ? { id: lastItemId } : undefined,
  skip: lastItemId ? 1 : 0,
});
```

### Caching (Redis)

```typescript
async getStoreDetails(storeId: string): Promise<Store> {
  const cacheKey = `store:${storeId}`;
  const cached = await this.cacheService.get<Store>(cacheKey);
  if (cached) return cached;

  const store = await this.prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  await this.cacheService.set(cacheKey, store, 300);  // 5 min TTL
  return store;
}

// Invalidate on mutation
await this.cacheService.del(`store:${storeId}`);
```

---

## File Naming & Code Style

### File Names

```
store.service.ts           # Service
store.controller.ts        # Controller
store.module.ts            # Module
store.service.spec.ts      # Unit test
create-store.dto.ts        # DTO (kebab-case)
jwt-auth.guard.ts          # Guard
```

### Naming Conventions

- Classes: `PascalCase` (`StoreService`, `CreateStoreDto`)
- Constants: `UPPER_SNAKE_CASE` (`MAX_FILE_SIZE`)
- Variables/Functions: `camelCase` (`userId`, `createStore`)
- Booleans: `is`/`has`/`can` prefix (`isAuthenticated`, `hasPermission`)
- Database fields: `camelCase` (Prisma convention)

### Import Paths

```typescript
// CORRECT - Absolute paths with 'src/' prefix
import { PrismaService } from 'src/prisma/prisma.service';

// INCORRECT - Relative for cross-module
import { PrismaService } from '../../prisma/prisma.service';
```

### ESLint Rules

```typescript
const value = config ?? 'default';         // Nullish coalescing (not ||)
const name = user?.profile?.name;          // Optional chaining
await this.service.doSomething();          // No floating promises
const message = `User ${userId} created`;  // Template literals
```
