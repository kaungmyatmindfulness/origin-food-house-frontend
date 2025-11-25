# Design System Guidelines

## Core Design Principles

1. **Use Component Props Over Custom Classes** - Prefer `variant` and `size` props
2. **Semantic Colors Only** - Use design system tokens, never raw Tailwind colors
3. **No Arbitrary Values** - Avoid `w-[234px]` or `text-[13px]`
4. **Consistent Spacing** - Follow spacing scale (4, 6, 8, 12, 16, 24)
5. **Check `@repo/ui` First** - We have 52+ pre-built components

## Color System

**ALWAYS use semantic tokens from `globals.css`:**

| Token              | Usage                                   |
| ------------------ | --------------------------------------- |
| `background`       | Page backgrounds                        |
| `foreground`       | Primary text                            |
| `muted`            | Muted backgrounds (secondary UI)        |
| `muted-foreground` | Muted text (descriptions, placeholders) |
| `primary`          | Brand color (CTA buttons, links)        |
| `destructive`      | Destructive actions (delete, cancel)    |
| `border`           | Borders                                 |
| `input`            | Input borders                           |
| `ring`             | Focus rings                             |

```typescript
// ✅ CORRECT - Semantic tokens
<div className="bg-background text-foreground">
<p className="text-muted-foreground">
<Card className="border-border">

// ❌ WRONG - Raw colors
<div className="bg-white text-gray-900">
<p className="text-gray-500">
<Card className="border-gray-200">
```

## Component Usage Patterns

### Buttons

```typescript
// ✅ CORRECT - Use variant props
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// ❌ WRONG - Don't override with custom classes
<Button className="bg-red-600 hover:bg-red-700 h-12 px-6">Delete</Button>
```

### Badges

```typescript
// ✅ CORRECT
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Suspended</Badge>
<Badge variant="outline">Draft</Badge>

// ❌ WRONG
<Badge className="bg-green-500 text-white">Active</Badge>
```

### Cards

```typescript
// ✅ CORRECT - Use Card components with semantic structure
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// ❌ WRONG - Don't use arbitrary padding
<Card>
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Title</h2>
  </div>
</Card>
```

### Inputs

```typescript
// ✅ CORRECT - Basic input
<Input
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// ✅ CORRECT - With icon
<div className="relative">
  <Search className="text-muted-foreground absolute left-3 top-3 size-4" />
  <Input placeholder="Search..." className="pl-9" />
</div>

// ❌ WRONG - Don't add arbitrary borders or colors
<Input className="border-blue-500 bg-gray-50" />
```

## Spacing & Layout

### Container Patterns

```typescript
// ✅ CORRECT - Page container
<div className="container mx-auto py-8">
  <div className="space-y-6">
    {/* Page sections with consistent vertical spacing */}
  </div>
</div>

// ✅ CORRECT - Content padding
<div className="p-8">  {/* Large padding for major sections */}
<div className="p-6">  {/* Medium padding for cards */}
<div className="p-4">  {/* Small padding for compact areas */}

// ❌ WRONG - Arbitrary padding values
<div className="pt-[23px] pb-[17px] pl-[31px]">
```

### Vertical Spacing

```typescript
// ✅ CORRECT - Consistent spacing
<div className="space-y-6">  {/* Between major sections */}
<div className="space-y-4">  {/* Between related elements */}
<div className="space-y-2">  {/* Between tightly grouped items */}

// ❌ WRONG - Inconsistent spacing
<div className="mb-3">
<div className="mt-5">
<div className="mb-7">
```

### Grid Layouts

```typescript
// ✅ CORRECT - Standard grid patterns
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
<div className="grid gap-6 md:grid-cols-3">

// ❌ WRONG - Arbitrary grid values
<div className="grid grid-cols-[200px,1fr,300px] gap-[17px]">
```

## Typography

### Heading Hierarchy

```typescript
// ✅ CORRECT - Semantic heading sizes
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>
<h3 className="text-xl font-semibold">Subsection Title</h3>
<h4 className="text-lg font-medium">Card Title</h4>

// ❌ WRONG - Arbitrary font sizes
<h1 className="text-[32px] font-black leading-[1.2]">
```

### Text Styles

```typescript
// ✅ CORRECT - Semantic text styles
<p className="text-sm text-muted-foreground">Description text</p>
<span className="text-xs text-muted-foreground">Helper text</span>
<p className="font-medium">Emphasized text</p>

// ❌ WRONG - Raw color classes
<p className="text-gray-500 text-[13px]">
```

## When Custom Classes ARE Acceptable

### Layout & Positioning

```typescript
// ✅ CORRECT - Layout utilities
<div className="flex items-center justify-between">
<div className="grid grid-cols-3 gap-4">
<div className="absolute top-0 right-0">
<div className="sticky top-0">
```

### Responsive Design

```typescript
// ✅ CORRECT - Responsive utilities
<div className="hidden md:block">
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

### State Variations

```typescript
// ✅ CORRECT - State-based styling
<div className="hover:bg-accent">
<Input className="focus:ring-2" />
<Button className="disabled:opacity-50">
```
