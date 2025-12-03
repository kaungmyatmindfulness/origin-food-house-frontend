# Code Style & Formatting

## Prettier Configuration

**Implicit configuration** (using Prettier defaults):

- Single quotes for strings
- 2 spaces indentation
- Semicolons required
- Trailing commas in multi-line

## ESLint Rules (Key Enforcements)

```typescript
// 1. Nullish coalescing over OR
const value = config ?? 'default'; // GOOD
const value = config || 'default'; // BAD

// 2. Optional chaining
const name = user?.profile?.name; // GOOD
const name = user && user.profile && user.profile.name; // BAD

// 3. No floating promises
await this.service.doSomething(); // GOOD
this.service.doSomething(); // BAD - ESLint error

// 4. Prefer const
const items = []; // GOOD
let items = []; // BAD (if never reassigned)

// 5. Template literals
const message = `User ${userId} created`; // GOOD
const message = 'User ' + userId + ' created'; // BAD

// 6. Import order (enforced by eslint-plugin-import)
// 1. Built-in modules (fs, path)
// 2. External modules (@nestjs/common)
// 3. Internal modules (src/...)
// 4. Parent/sibling imports (../, ./)
// With blank lines between groups, alphabetically sorted
```

## Naming Conventions

```typescript
// Classes: PascalCase
class StoreService {}
class CreateStoreDto {}

// Interfaces/Types: PascalCase with descriptive names
interface StoreWithDetails {}
type TransactionClient = ...;

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_ROLES = ['OWNER', 'ADMIN'] as const;

// Variables/Functions: camelCase
const userId = 'abc123';
async function createStore() {}

// Private methods: camelCase with descriptive names
private async validateStoreAccess() {}

// Boolean variables: is/has/can prefix
const isAuthenticated = true;
const hasPermission = false;
const canDelete = user.role === 'OWNER';

// Enum values: UPPER_CASE (Prisma convention)
enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  CHEF = 'CHEF',
}

// Database fields: camelCase (Prisma convention)
model User {
  firstName String  // camelCase
  lastName  String
  createdAt DateTime
}
```

## File Naming Conventions

```
CORRECT naming patterns:
store.service.ts           # Service
store.controller.ts        # Controller
store.module.ts            # Module
store.service.spec.ts      # Unit test
create-store.dto.ts        # DTO (kebab-case)
store-response.dto.ts      # Response DTO
jwt-auth.guard.ts          # Guard
roles.decorator.ts         # Decorator
prisma-mock.helper.ts      # Test helper

INCORRECT patterns:
StoreService.ts            # Don't use PascalCase for files
store_service.ts           # Don't use snake_case
storeService.ts            # Don't use camelCase
```

## DTO Class Naming (Avoiding Duplicates)

**CRITICAL**: DTO class names MUST be globally unique across the entire codebase. Swagger/OpenAPI uses class names to generate schema definitions, and duplicate names cause schema conflicts.

```typescript
// BAD - Same class name in different modules causes OpenAPI conflicts
// src/category/dto/category-response.dto.ts
export class CategoryResponseDto {
  /* with menuItems */
}

// src/menu/dto/category-response.dto.ts
export class CategoryResponseDto {
  /* without menuItems */
}
// Result: Swagger picks wrong schema, OpenAPI spec is inconsistent

// GOOD - Unique class names per module context
// src/category/dto/category-response.dto.ts
export class CategoryResponseDto {
  /* full category with menuItems */
}

// src/menu/dto/category-response.dto.ts
export class MenuCategoryDto {
  /* simplified category for menu context */
}
```

**DTO naming rules:**

- ALWAYS use globally unique class names
- PREFIX with module/domain name when DTOs serve different purposes:
  - `MenuCategoryDto` (in menu module) vs `CategoryResponseDto` (in category module)
  - `AdminSuspendUserDto` (in admin module) vs `SuspendUserDto` (in user module)
  - `MenuCustomizationGroupDto` vs `CustomizationGroupResponseDto`
- CHECK for existing DTOs before creating new ones: `grep -r "class YourDtoName" src/`
- REUSE existing DTOs when the schema is identical (import from the canonical module)

**Common duplicate patterns to avoid:**

| Instead of...                    | Use...                       | Location         |
| -------------------------------- | ---------------------------- | ---------------- |
| `CategoryResponseDto` (menu)     | `MenuCategoryDto`            | `src/menu/dto/`  |
| `CustomizationGroupResponseDto`  | `MenuCustomizationGroupDto`  | `src/menu/dto/`  |
| `CustomizationOptionResponseDto` | `MenuCustomizationOptionDto` | `src/menu/dto/`  |
| `SuspendUserDto` (admin)         | `AdminSuspendUserDto`        | `src/admin/dto/` |

**If you see this warning, you have duplicate DTOs:**

```
Duplicate DTO detected: "YourDtoName" is defined multiple times with different schemas.
```

## Response DTO Patterns for GET vs UPDATE

**ALWAYS use separate response DTOs when GET and UPDATE operations have different guarantees:**

When a resource supports both GET (read) and UPDATE (write) operations with different nullability or side-effect characteristics, create separate response DTOs to accurately reflect the API contract.

### Why Separate DTOs?

| Operation  | Return Guarantee                               | DTO Pattern                        |
| ---------- | ---------------------------------------------- | ---------------------------------- |
| **GET**    | May return `null` if resource doesn't exist    | `Get{Resource}ResponseDto \| null` |
| **UPDATE** | Always returns data (upsert ensures existence) | `Update{Resource}ResponseDto`      |

### Naming Convention

```typescript
// Base DTO with common fields (not exported)
class {Resource}BaseResponseDto {
  id: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
  // ... common fields
}

// GET response - can be null if resource not found/configured
export class Get{Resource}ResponseDto extends {Resource}BaseResponseDto {}

// UPDATE response - always returns the updated resource
export class Update{Resource}ResponseDto extends {Resource}BaseResponseDto {}
```

### Example: Print Settings

```typescript
// print-settings.dto.ts

// Base class (not exported - internal use only)
class PrintSettingBaseResponseDto extends PrintSettingsDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  storeId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// GET endpoint - may return null if not configured
export class GetPrintSettingResponseDto extends PrintSettingBaseResponseDto {}

// UPDATE endpoint - always returns data (upsert pattern)
export class UpdatePrintSettingResponseDto extends PrintSettingBaseResponseDto {}
```

### Service Method Signatures

```typescript
// GET - nullable return type (read-only, no side effects)
async getPrintSettings(
  userId: string,
  storeId: string
): Promise<GetPrintSettingResponseDto | null> {
  return this.prisma.printSetting.findUnique({ where: { storeId } });
}

// UPDATE - guaranteed return type (creates if not exists)
async updatePrintSettings(
  userId: string,
  storeId: string,
  dto: UpdatePrintSettingsDto
): Promise<UpdatePrintSettingResponseDto> {
  return this.prisma.printSetting.upsert({
    where: { storeId },
    update: dto,
    create: { storeId, ...dto },
  });
}
```

### Controller Usage

```typescript
// GET endpoint - nullable response
@Get(':id/settings/print-settings')
@ApiGetOne(GetPrintSettingResponseDto, 'print settings')
async getPrintSettings(
  @Param('id') storeId: string
): Promise<StandardApiResponse<GetPrintSettingResponseDto | null>> {
  const settings = await this.service.getPrintSettings(userId, storeId);
  return StandardApiResponse.success(
    settings,
    settings ? 'Settings retrieved.' : 'Settings not configured yet.'
  );
}

// UPDATE endpoint - always returns data
@Patch(':id/settings/print-settings')
@ApiPatch(UpdatePrintSettingResponseDto, 'print settings')
async updatePrintSettings(
  @Param('id') storeId: string,
  @Body() dto: UpdatePrintSettingsDto
): Promise<StandardApiResponse<UpdatePrintSettingResponseDto>> {
  const settings = await this.service.updatePrintSettings(userId, storeId, dto);
  return StandardApiResponse.success(settings, 'Settings updated.');
}
```

### When to Use This Pattern

Use separate GET/UPDATE response DTOs when:

- **GET uses `findUnique`/`findFirst`** - may return `null`
- **UPDATE uses `upsert`** - creates record if not exists, always returns data
- **Different nullability guarantees** - frontend needs to handle `null` for GET but not UPDATE

**Don't** use separate DTOs when:

- Both operations have the same nullability (both always return data or both may return null)
- The resource always exists (e.g., user profile created at registration)

### OpenAPI Benefits

Separate DTOs generate accurate OpenAPI schemas:

- Frontend type generators create distinct types
- GET responses correctly typed as nullable
- UPDATE responses never require null checks
- Better developer experience with accurate autocomplete
