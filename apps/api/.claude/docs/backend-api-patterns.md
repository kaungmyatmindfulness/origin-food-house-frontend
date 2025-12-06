# API Documentation & REST Patterns

This guide covers REST conventions, Swagger decorators, OpenAPI type safety, and DTO patterns.

---

## REST API Conventions

### Resource Naming

```typescript
// CORRECT - Plural nouns, kebab-case
@Controller('stores')
@Controller('menu-items')
@Controller('payment-methods')

// INCORRECT
@Controller('getStores')    // Verb
@Controller('store')        // Singular
@Controller('menuItems')    // camelCase in URL
```

### HTTP Methods

| Method | Purpose        | Example              |
| ------ | -------------- | -------------------- |
| GET    | Read           | `GET /stores/:id`    |
| POST   | Create         | `POST /stores`       |
| PATCH  | Partial update | `PATCH /stores/:id`  |
| DELETE | Soft delete    | `DELETE /stores/:id` |

```typescript
// INCORRECT - Verbs in URLs
@Post('stores/create')        // POST already means create
@Post('stores/:id/update')    // Should be PATCH
```

### Nested Resources

```typescript
// CORRECT - Show relationships (max 2-3 levels)
GET /stores/:storeId/menu-items
GET /stores/:storeId/orders/:orderId
GET /stores/:storeId/orders/:orderId/items

// INCORRECT - Flat structure
GET /menu-items?storeId=...
```

### Query Parameters

```typescript
@Get('stores/:storeId/menu-items')
async getMenuItems(
  @Query('category') category?: string,
  @Query('isActive') isActive?: boolean,
  @Query('search') search?: string,
  @Query('sortBy') sortBy?: string,
  @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  @Query('page') page?: number,
  @Query('limit') limit?: number,
) {}
```

### HTTP Status Codes

```typescript
@Post('stores')
@HttpCode(HttpStatus.CREATED)         // 201 for POST create

@Delete('stores/:id')
@HttpCode(HttpStatus.NO_CONTENT)      // 204 for DELETE

// Errors (via NestJS exceptions)
throw new BadRequestException()       // 400
throw new UnauthorizedException()     // 401
throw new ForbiddenException()        // 403
throw new NotFoundException()         // 404
throw new ConflictException()         // 409
```

### Naming

- **JSON properties:** camelCase (`menuCategoryId`, `isActive`)
- **URL paths:** kebab-case (`/menu-items`, `/payment-methods`)

---

## Swagger/OpenAPI Decorators

Use the API CRUD decorators from `src/common/decorators/api-crud.decorator.ts`:

### Error Response Decorators

| Decorator             | Includes           | Use Case                     |
| --------------------- | ------------------ | ---------------------------- |
| `ApiStandardErrors()` | 400, 401, 403      | Authenticated endpoints      |
| `ApiResourceErrors()` | 400, 401, 403, 404 | Accessing specific resources |
| `ApiCreateErrors()`   | 400, 401, 403, 409 | POST create                  |
| `ApiDeleteErrors()`   | 400, 401, 403, 404 | DELETE                       |

### Authentication Decorators

| Decorator            | Use Case                    |
| -------------------- | --------------------------- |
| `ApiAuth()`          | Simple auth (no role check) |
| `ApiAuthWithRoles()` | Role-based access           |

### CRUD Decorators (Top-level)

| Decorator                   | HTTP       | Includes                   |
| --------------------------- | ---------- | -------------------------- |
| `ApiGetAll<T>(model, name)` | GET list   | Operation, success (array) |
| `ApiGetOne<T>(model, name)` | GET single | Operation, id param, 404   |
| `ApiCreate<T>(model, name)` | POST       | Auth, 201, create errors   |
| `ApiPatch<T>(model, name)`  | PATCH      | Auth, id param, errors     |
| `ApiDelete(name)`           | DELETE     | Auth, id param, errors     |
| `ApiDeleteNoContent(name)`  | DELETE 204 | Same with 204              |

### Store-Nested Decorators

| Decorator                 | Description     |
| ------------------------- | --------------- |
| `ApiStoreGetAll<T>`       | + storeId param |
| `ApiStoreGetOne<T>`       | + storeId param |
| `ApiStoreCreate<T>`       | + storeId param |
| `ApiStorePatch<T>`        | + storeId param |
| `ApiStoreDelete`          | + storeId param |
| `ApiStoreDeleteNoContent` | + storeId param |

### Usage Examples

```typescript
// OLD VERBOSE - Don't use
@Post()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: "Create menu item (OWNER or ADMIN)" })
@ApiParam({ name: "storeId", description: "Store UUID" })
@ApiUnauthorizedResponse({ description: "Authentication required" })
@ApiForbiddenResponse({ description: "Insufficient permissions" })
@ApiSuccessResponse(MenuItemDto, { status: HttpStatus.CREATED })
async create(@Body() dto: CreateMenuItemDto) {}

// NEW COMPACT - Use this
@Post()
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.CREATED)
@ApiStoreCreate(MenuItemDto, "menu item", { roles: "OWNER or ADMIN" })
async create(@Body() dto: CreateMenuItemDto) {}
```

```typescript
// Common patterns
@Get()
@ApiStoreGetAll(MenuItemResponseDto, "menu items")
async findAll(@Param("storeId") storeId: string) {}

@Get(":id")
@ApiStoreGetOne(MenuItemResponseDto, "menu item")
async findOne(@Param("id") id: string) {}

@Patch(":id")
@UseGuards(JwtAuthGuard)
@ApiStorePatch(MenuItemResponseDto, "menu item", { roles: "OWNER, ADMIN" })
async update(@Param("id") id: string, @Body() dto: UpdateMenuItemDto) {}

@Delete(":id")
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.NO_CONTENT)
@ApiStoreDeleteNoContent("menu item", { roles: "OWNER or ADMIN" })
async remove(@Param("id") id: string) {}

// Action endpoint
@Post(":id/approve")
@UseGuards(JwtAuthGuard)
@ApiAction(PaymentResponseDto, "approve", "payment request", { roles: "PLATFORM_ADMIN" })
async approve(@Param("id") id: string) {}
```

### Options Object

```typescript
interface ApiCrudOptions {
  summary?: string; // Override summary
  description?: string; // Override success description
  roles?: string; // Add roles to summary
  idDescription?: string; // Custom ID param description
  storeIdDescription?: string;
}
```

### When to Use Raw Decorators

Use raw Swagger decorators for:

- Custom `@ApiBody` with examples
- Complex `@ApiQuery` parameters
- File upload endpoints (`@ApiConsumes`)
- Endpoints that don't fit CRUD patterns

---

## Response DTOs in extraModels

**CRITICAL:** Response DTOs used with `getSchemaPath()` must be registered in `extraModels`:

```typescript
// src/main.ts
const document = SwaggerModule.createDocument(app, config, {
  extraModels: [
    StandardApiResponse,
    StandardApiErrorDetails,
    // Session
    SessionCreatedResponseDto,
    SessionResponseDto,
    // Cart
    CartResponseDto,
    CartItemResponseDto,
    // Order
    OrderResponseDto,
    OrderItemResponseDto,
    // ... add new DTOs here
    MyNewResponseDto,
  ],
});
```

**Verify:** `curl -s http://localhost:3000/api-docs-json | jq '.components.schemas | keys[]' | grep "YourNewDto"`

---

## DTO Naming (Avoiding Duplicates)

**CRITICAL:** DTO class names MUST be globally unique (Swagger uses class names for schemas).

```typescript
// BAD - Same name in different modules
// src/category/dto/category-response.dto.ts
export class CategoryResponseDto {
  /* with menuItems */
}

// src/menu/dto/category-response.dto.ts
export class CategoryResponseDto {
  /* without menuItems */
} // CONFLICT!

// GOOD - Unique names
export class CategoryResponseDto {
  /* full */
} // category module
export class MenuCategoryDto {
  /* simplified */
} // menu module
```

**Naming rules:**

- PREFIX with module name when DTOs serve different purposes
- CHECK before creating: `grep -r "class YourDtoName" src/`
- REUSE existing DTOs when schema is identical

---

## Response DTO Patterns: GET vs UPDATE

Use separate DTOs when GET and UPDATE have different nullability:

```typescript
// Base class (not exported)
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

// GET - may return null
export class GetPrintSettingResponseDto extends PrintSettingBaseResponseDto {}

// UPDATE - always returns data (upsert)
export class UpdatePrintSettingResponseDto extends PrintSettingBaseResponseDto {}
```

```typescript
// Service signatures
async getPrintSettings(storeId: string): Promise<GetPrintSettingResponseDto | null> {
  return this.prisma.printSetting.findUnique({ where: { storeId } });
}

async updatePrintSettings(storeId: string, dto: UpdatePrintSettingsDto): Promise<UpdatePrintSettingResponseDto> {
  return this.prisma.printSetting.upsert({
    where: { storeId },
    update: dto,
    create: { storeId, ...dto },
  });
}
```

**When to use:**

- GET uses `findUnique` → may return null
- UPDATE uses `upsert` → always returns data

---

## Preventing Record<string, unknown>

**Problem:** `additionalProperties: true` generates `Record<string, unknown>` in frontend types.

### Solution 1: Typed DTO for Object Values

```typescript
// Define value DTO
export class BusinessHoursSlotDto {
  @ApiProperty({ example: "09:00" })
  open: string;
  @ApiProperty({ example: "22:00" })
  close: string;
  @ApiProperty({ example: true })
  isOpen: boolean;
}

// Use additionalProperties with $ref
@ApiPropertyOptional({
  type: "object",
  additionalProperties: { $ref: "#/components/schemas/BusinessHoursSlotDto" },
  description: "Business hours by day",
})
businessHours?: Record<string, BusinessHoursSlotDto> | null;
```

### Solution 2: Array Instead of Record

```typescript
export class BusinessHoursEntryDto {
  @ApiProperty({ enum: ['monday', 'tuesday', ...] })
  day: string;
  @ApiProperty()
  open: string;
  @ApiProperty()
  close: string;
}

@ApiProperty({ type: [BusinessHoursEntryDto] })
businessHours: BusinessHoursEntryDto[];
```

### Solution 3: Inline Schema

```typescript
@ApiPropertyOptional({
  type: "object",
  properties: {
    width: { type: "number" },
    height: { type: "number" },
    format: { type: "string" },
  },
})
metadata?: { width: number; height: number; format: string };
```

### Patterns to Avoid

| Pattern                      | Problem        | Solution                                   |
| ---------------------------- | -------------- | ------------------------------------------ |
| `additionalProperties: true` | No type info   | Use `{ $ref: "..." }`                      |
| `type: "object"` alone       | No properties  | Add `properties` or `additionalProperties` |
| `Record<string, any>`        | any propagates | Define explicit value DTO                  |

### Registration Requirement

Value DTOs used in `additionalProperties.$ref` MUST be in `extraModels`:

```typescript
extraModels: [
  BusinessHoursSlotDto,
  SpecialHoursEntryDto,
  // ...
];
```

### Exception: StandardApiResponse.data

`StandardApiResponse<T>` uses `additionalProperties: true` intentionally - resolved via `allOf` composition in `ApiSuccessResponse` decorator.

---

## WebSocket Security

**CRITICAL:** WebSocket gateways MUST authenticate connections.

```typescript
@WebSocketGateway()
export class CartGateway implements OnGatewayConnection {
  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    if (!token) {
      client.disconnect();
      return;
    }

    const user = await this.authService.validateToken(token);
    if (!user) {
      client.disconnect();
      return;
    }

    client.data.userId = user.id;
  }

  @SubscribeMessage('cart:add')
  async handleAddItem(client: Socket, data: AddCartItemDto) {
    const userId = client.data.userId;
    // ... validated operation
  }
}
```

**Rules:**

- ALWAYS validate authentication in `handleConnection`
- ALWAYS disconnect unauthenticated clients
- ALWAYS validate DTOs for WebSocket messages
- ALWAYS emit to specific rooms (session/store-based)
