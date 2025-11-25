# Navigation: Link vs Button Patterns

**CRITICAL RULE: Use `<Link>` for navigation, `<Button>` for actions.**

Navigation elements should use semantic HTML (`<a>` tags) for accessibility, SEO, and proper browser behavior (right-click to open in new tab, keyboard navigation, etc.).

## Link Button Pattern (Recommended)

**Use Button with `asChild` prop + Link for navigation that looks like a button:**

```typescript
import Link from 'next/link';
import { Button } from '@repo/ui/components/button';

// ✅ CORRECT - Link button for navigation
<Button variant="outline" size="lg" asChild>
  <Link href="/store/create">
    <Plus className="mr-2 h-5 w-5" />
    Create New Store
  </Link>
</Button>

// ❌ WRONG - Button with onClick for navigation
<Button
  variant="outline"
  onClick={() => router.push('/store/create')}
>
  Create New Store
</Button>
```

## When to Use Link

```typescript
// ✅ Navigation to a page (no locale prefix)
<Button asChild>
  <Link href="/menu">View Menu</Link>
</Button>

// ✅ Navigation to store page (no locale prefix)
<Button asChild>
  <Link href="/store/create">Create Store</Link>
</Button>

// ✅ External link (opens in new tab)
<Button asChild>
  <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
    Learn More
  </Link>
</Button>

// ✅ Plain link (not styled as button)
<Link href="/menu" className="text-primary hover:underline">
  View Menu
</Link>
```

## When to Use Button with onClick

```typescript
// ✅ Form submission
<Button onClick={handleSubmit} type="submit">
  Save Changes
</Button>

// ✅ Opening a dialog/modal
<Button onClick={() => setIsOpen(true)}>
  Open Dialog
</Button>

// ✅ Triggering a mutation
<Button onClick={() => deleteItem(id)}>
  Delete
</Button>

// ✅ Complex logic before navigation
<Button onClick={async () => {
  await saveData();
  await refreshSession();
  router.push('/dashboard');
}}>
  Save and Continue
</Button>
```

## Accessibility Considerations

**Why Link is better for navigation:**

1. **Keyboard Navigation**: Links are focusable with Tab key
2. **Screen Readers**: Announces as "link" vs "button" (semantic meaning)
3. **Browser Features**: Right-click → "Open in new tab" works
4. **SEO**: Search engines can crawl links, not button clicks
5. **Progressive Enhancement**: Works without JavaScript

```typescript
// ✅ CORRECT - Accessible navigation
<Button asChild>
  <Link href="/menu">View Menu</Link>
</Button>

// Screen reader announces: "View Menu, link"
// User can right-click to open in new tab
// Works even if JavaScript fails

// ❌ WRONG - Poor accessibility
<Button onClick={() => router.push('/menu')}>
  View Menu
</Button>

// Screen reader announces: "View Menu, button"
// No right-click menu option
// Broken if JavaScript fails
```

## Common Patterns

```typescript
// ✅ Card with link
<Card>
  <CardHeader>
    <CardTitle>Store Details</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Information about the store...</p>
  </CardContent>
  <CardFooter>
    <Button asChild>
      <Link href={`/store/${id}`}>View Store</Link>
    </Button>
  </CardFooter>
</Card>

// ✅ Navigation with confirmation
const handleNavigateWithConfirmation = () => {
  if (confirm('Unsaved changes. Continue?')) {
    router.push('/other-page');
  }
};

<Button onClick={handleNavigateWithConfirmation}>
  Leave Page
</Button>

// ✅ Conditional navigation (use Link when possible)
{canEdit ? (
  <Button asChild>
    <Link href="/edit">Edit</Link>
  </Button>
) : (
  <Button disabled>Edit (No Permission)</Button>
)}
```

## Router Methods vs Link

**Prefer `<Link>` over `router.push()` for most navigation:**

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

// ✅ GOOD - Link for simple navigation
<Button asChild>
  <Link href="/menu">Menu</Link>
</Button>

// ✅ GOOD - router.push() for programmatic navigation
useEffect(() => {
  if (isAuthenticated) {
    router.push('/dashboard');
  }
}, [isAuthenticated]);

// ✅ GOOD - router.replace() for redirects (no history entry)
useEffect(() => {
  if (user?.userStores?.length === 0) {
    router.replace('/store/create');
  }
}, [user]);

// ✅ GOOD - router.back() for navigation history
<Button onClick={() => router.back()}>
  Go Back
</Button>
```

## Decision Tree

```
Is this user-initiated navigation?
├─ YES
│  ├─ Simple navigation (no logic)?
│  │  └─ ✅ Use <Link> (with Button asChild if styled)
│  │
│  └─ Complex logic before navigation?
│     └─ ✅ Use Button onClick with router.push()
│
└─ NO (programmatic navigation)
   ├─ Redirect (no history)?
   │  └─ ✅ Use router.replace()
   │
   ├─ Navigation after action?
   │  └─ ✅ Use router.push()
   │
   └─ Go back in history?
      └─ ✅ Use router.back()
```
