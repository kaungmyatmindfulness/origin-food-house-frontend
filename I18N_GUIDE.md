# Internationalization (i18n) Guide

Origin Food House supports **4 languages**: English (en), Chinese (zh), Myanmar (my), and Thai (th).

## Overview

Both POS and SOS apps use `next-intl` for internationalization with a cookie-based locale detection system. URLs remain clean (no `/en/` or `/zh/` prefixes).

## Supported Languages

| Code | Language | Native Name | Flag |
|------|----------|-------------|------|
| `en` | English | English | 🇬🇧 |
| `zh` | Chinese | 中文 | 🇨🇳 |
| `my` | Myanmar | မြန်မာ | 🇲🇲 |
| `th` | Thai | ไทย | 🇹🇭 |

**Default Language**: English (`en`)

---

## Architecture

### File Structure

```
apps/pos/                          # Same structure for apps/sos
├── messages/                      # Translation files
│   ├── en.json                   # English
│   ├── zh.json                   # Chinese
│   ├── my.json                   # Myanmar
│   └── th.json                   # Thai
├── src/
│   ├── i18n/
│   │   ├── config.ts             # Locale configuration
│   │   └── request.ts            # next-intl request config
│   ├── middleware.ts             # Locale detection middleware
│   └── common/components/
│       └── LanguageSwitcher.tsx  # Language switcher UI
```

### How It Works

1. **Middleware** (`src/middleware.ts`) detects locale from:
   - `NEXT_LOCALE` cookie (set by LanguageSwitcher)
   - `Accept-Language` header (browser preference)
   - Falls back to `en` if not found

2. **Root Layout** provides locale context via `NextIntlClientProvider`

3. **Components** use `useTranslations()` hook to access translations

---

## Usage

### 1. Using Translations in Client Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('common');

  return (
    <div>
      <h1>{t('home')}</h1>
      <button>{t('save')}</button>
    </div>
  );
}
```

### 2. Using Translations in Server Components

```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('menu');

  return (
    <div>
      <h1>{t('title')}</h1>
    </div>
  );
}
```

### 3. Multiple Translation Namespaces

```typescript
const tCommon = useTranslations('common');
const tMenu = useTranslations('menu');
const tErrors = useTranslations('errors');

return (
  <>
    <h1>{tMenu('title')}</h1>
    <button>{tCommon('save')}</button>
    <p className="error">{tErrors('networkError')}</p>
  </>
);
```

### 4. Using the Language Switcher

```typescript
import { LanguageSwitcher } from '@/common/components/LanguageSwitcher';

export function Header() {
  return (
    <header>
      <nav>...</nav>
      <LanguageSwitcher />
    </header>
  );
}
```

---

## Translation File Structure

### POS App (`apps/pos/messages/*.json`)

```json
{
  "common": {
    "home": "Home",
    "menu": "Menu",
    "save": "Save",
    ...
  },
  "auth": {
    "login": "Login",
    "email": "Email",
    ...
  },
  "menu": {
    "title": "Menu Management",
    "createItem": "Create Menu Item",
    ...
  },
  "tables": { ... },
  "store": { ... },
  "errors": { ... }
}
```

### SOS App (`apps/sos/messages/*.json`)

```json
{
  "common": {
    "home": "Home",
    "cart": "Cart",
    "total": "Total",
    ...
  },
  "menu": {
    "title": "Our Menu",
    "addToCart": "Add to Cart",
    ...
  },
  "cart": {
    "title": "Your Cart",
    "empty": "Your cart is empty",
    ...
  },
  "order": { ... },
  "table": { ... },
  "restaurant": { ... },
  "errors": { ... }
}
```

---

## Adding New Translations

### Step 1: Add to English File

```json
// apps/pos/messages/en.json
{
  "common": {
    "newKey": "New Value"
  }
}
```

### Step 2: Add to Other Languages

```json
// apps/pos/messages/zh.json
{
  "common": {
    "newKey": "新值"
  }
}

// apps/pos/messages/my.json
{
  "common": {
    "newKey": "တန်ဖိုးအသစ်"
  }
}

// apps/pos/messages/th.json
{
  "common": {
    "newKey": "ค่าใหม่"
  }
}
```

### Step 3: Use in Components

```typescript
const t = useTranslations('common');
<p>{t('newKey')}</p>
```

---

## Advanced Features

### Dynamic Values (Interpolation)

```json
{
  "greeting": "Hello, {name}!"
}
```

```typescript
t('greeting', { name: 'John' })  // "Hello, John!"
```

### Pluralization

```json
{
  "itemCount": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
}
```

```typescript
t('itemCount', { count: 5 })  // "5 items"
```

### Rich Text (with HTML)

```typescript
t.rich('description', {
  bold: (chunks) => <strong>{chunks}</strong>,
})
```

---

## Best Practices

### ✅ DO

- Keep translation keys organized by feature/section
- Use descriptive key names (`menu.createItem`, not `m.ci`)
- Add new translations to ALL language files simultaneously
- Use translation namespaces to organize keys
- Extract all user-facing text to translation files

### ❌ DON'T

- Hardcode text in components
- Mix languages in the same file
- Use abbreviations for translation keys
- Forget to add translations for all languages
- Use locale-specific logic (keep components locale-agnostic)

---

## Testing Localization

### 1. Via Language Switcher
Click the globe icon and select a language

### 2. Via Cookie (for testing)
```javascript
// In browser console
document.cookie = 'NEXT_LOCALE=zh; path=/';
location.reload();
```

### 3. Via Accept-Language Header
Set browser language preference to test auto-detection

---

## Configuration Files

### `src/i18n/config.ts`
- Defines supported locales
- Exports locale names and flags
- Type definitions

### `src/i18n/request.ts`
- Configures next-intl request handling
- Loads appropriate message files
- Validates locale

### `src/middleware.ts`
- Detects and sets locale
- Manages NEXT_LOCALE cookie
- No URL prefixes (`localePrefix: 'never'`)

---

## Type Safety

TypeScript provides full type safety for translations:

```typescript
// ✅ Type-safe
t('common.home')  // OK

// ❌ Type error
t('common.nonExistent')  // Error: Key doesn't exist
```

---

## Troubleshooting

### Translation not showing

1. Check the translation key exists in `messages/en.json`
2. Verify all language files have the same keys
3. Check you're using the correct namespace
4. Ensure component is wrapped in `NextIntlClientProvider`

### Language not switching

1. Check cookie is being set (DevTools > Application > Cookies)
2. Verify middleware is running (check Network tab)
3. Ensure `router.refresh()` is called after cookie update

### Build errors

1. Ensure all JSON files are valid (no trailing commas)
2. Check all language files have matching structure
3. Verify import paths in `i18n/request.ts`

---

## Example: Translating a Component

### Before (Hardcoded English)

```tsx
export function WelcomeMessage() {
  return (
    <div>
      <h1>Welcome Back</h1>
      <p>Please login to continue</p>
      <button>Sign In</button>
    </div>
  );
}
```

### After (Localized)

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function WelcomeMessage() {
  const t = useTranslations('auth');

  return (
    <div>
      <h1>{t('loginTitle')}</h1>
      <p>{t('pleaseLogin')}</p>
      <button>{t('loginButton')}</button>
    </div>
  );
}
```

Now the component automatically displays in the user's selected language!

---

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- Translation files: `apps/pos/messages/` and `apps/sos/messages/`
