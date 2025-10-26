# Design System Guidelines

**Last Updated**: January 2025

This document defines the design system rules and component usage patterns for the Origin Food House frontend applications.

## Core Principles

1. **Use Component Props Over Custom Classes** - Always prefer built-in component variants and props before adding custom className overrides
2. **Semantic Colors** - Use semantic color tokens (`bg-background`, `text-foreground`, `text-muted-foreground`) instead of raw Tailwind colors
3. **Consistent Spacing** - Follow the predefined spacing scale (container patterns, card padding, etc.)
4. **Component Composition** - Use shadcn/ui component APIs and slots correctly
5. **No Magic Numbers** - Avoid arbitrary values like `w-[234px]` or `pt-[13px]`

---

## 🎨 Color System

### Semantic Color Tokens

**ALWAYS use semantic tokens** from `globals.css`:

```tsx
// ✅ CORRECT - Use semantic tokens
<div className="bg-background text-foreground">
<p className="text-muted-foreground">
<Button variant="destructive">Delete</Button>
<Badge variant="outline">Status</Badge>

// ❌ WRONG - Never use raw Tailwind colors
<div className="bg-white text-gray-900">
<p className="text-gray-500">
<Button className="bg-red-600">Delete</Button>
```

### Available Semantic Colors

| Token                    | Usage                                   |
| ------------------------ | --------------------------------------- |
| `background`             | Page backgrounds                        |
| `foreground`             | Primary text                            |
| `muted`                  | Muted backgrounds (secondary UI)        |
| `muted-foreground`       | Muted text (descriptions, placeholders) |
| `primary`                | Brand color (CTA buttons, links)        |
| `primary-foreground`     | Text on primary backgrounds             |
| `secondary`              | Secondary actions                       |
| `secondary-foreground`   | Text on secondary backgrounds           |
| `accent`                 | Accent UI elements                      |
| `accent-foreground`      | Text on accent backgrounds              |
| `destructive`            | Destructive actions (delete, cancel)    |
| `destructive-foreground` | Text on destructive backgrounds         |
| `border`                 | Borders                                 |
| `input`                  | Input borders                           |
| `ring`                   | Focus rings                             |

---

## 📦 Component Usage Patterns

### Buttons

Use **variant props** instead of custom classes:

```tsx
// ✅ CORRECT - Use variant props
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// ❌ WRONG - Don't override with custom classes
<Button className="bg-red-600 hover:bg-red-700">Delete</Button>
<Button className="h-12 px-6">Custom Size</Button>
```

**Icons in Buttons**:

```tsx
// ✅ CORRECT - Icons are automatically sized
<Button>
  <Plus />
  Add Item
</Button>

// ❌ WRONG - Don't manually size icons
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>
```

### Badges

```tsx
// ✅ CORRECT
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Suspended</Badge>
<Badge variant="outline">Draft</Badge>

// ❌ WRONG
<Badge className="bg-green-500 text-white">Active</Badge>
```

### Cards

```tsx
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
    <div className="mt-6">Content</div>
  </div>
</Card>
```

### Inputs

```tsx
// ✅ CORRECT - Basic input
<Input
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// ✅ CORRECT - With icon (manual positioning only when necessary)
<div className="relative">
  <Search className="text-muted-foreground absolute left-3 top-3 size-4" />
  <Input placeholder="Search..." className="pl-9" />
</div>

// ❌ WRONG - Don't add arbitrary borders or colors
<Input className="border-blue-500 bg-gray-50" />
```

### Tables

```tsx
// ✅ CORRECT - Use Table components
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>

// ❌ WRONG - Don't use arbitrary table styling
<table className="w-full border-collapse">
  <thead className="bg-gray-100">
    ...
  </thead>
</table>
```

---

## 📏 Spacing & Layout

### Container Patterns

```tsx
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

### Spacing Scale

**Vertical Spacing** (use `space-y-*` or `gap-*`):

```tsx
// ✅ CORRECT - Consistent spacing
<div className="space-y-6">  {/* Between major sections */}
<div className="space-y-4">  {/* Between related elements */}
<div className="space-y-2">  {/* Between tightly grouped items */}

// ❌ WRONG - Inconsistent spacing
<div className="mb-3">
<div className="mt-5">
<div className="mb-7">
```

**Grid Layouts**:

```tsx
// ✅ CORRECT - Use standard grid patterns
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
<div className="grid gap-6 md:grid-cols-3">

// ❌ WRONG - Arbitrary grid values
<div className="grid grid-cols-[200px,1fr,300px] gap-[17px]">
```

---

## 🎭 Typography

### Heading Hierarchy

```tsx
// ✅ CORRECT - Semantic heading sizes
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>
<h3 className="text-xl font-semibold">Subsection Title</h3>
<h4 className="text-lg font-medium">Card Title</h4>

// ❌ WRONG - Arbitrary font sizes
<h1 className="text-[32px] font-black leading-[1.2]">
```

### Text Styles

```tsx
// ✅ CORRECT - Semantic text styles
<p className="text-sm text-muted-foreground">Description text</p>
<span className="text-xs text-muted-foreground">Helper text</span>
<p className="font-medium">Emphasized text</p>

// ❌ WRONG - Raw color classes
<p className="text-gray-500 text-[13px]">
```

---

## 🚫 Common Anti-Patterns

### ❌ Overriding Component Styles

```tsx
// ❌ WRONG - Don't override built-in component styles
<Button className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl">
  Custom Button
</Button>

// ✅ CORRECT - Use variant props or create a new variant
<Button variant="default" size="lg">
  Proper Button
</Button>
```

### ❌ Hardcoded Colors

```tsx
// ❌ WRONG
<div className="bg-white border-gray-200 text-gray-900">
<Badge className="bg-green-500 text-white">Active</Badge>

// ✅ CORRECT
<div className="bg-background border-border text-foreground">
<Badge variant="default">Active</Badge>
```

### ❌ Arbitrary Values

```tsx
// ❌ WRONG
<div className="w-[234px] h-[567px] mt-[13px]">
<Input className="pl-[37px]" />

// ✅ CORRECT
<div className="w-56 h-64 mt-4">
<div className="relative">
  <Icon className="absolute left-3 top-3 size-4" />
  <Input className="pl-9" />
</div>
```

### ❌ Inconsistent Spacing

```tsx
// ❌ WRONG - Random spacing values
<div className="mb-3">
<div className="mt-5">
<div className="mb-7">

// ✅ CORRECT - Consistent spacing scale
<div className="space-y-4">
  <div>Section 1</div>
  <div>Section 2</div>
  <div>Section 3</div>
</div>
```

---

## ✅ When Custom Classes ARE Acceptable

### Layout & Positioning

```tsx
// ✅ CORRECT - Layout utilities
<div className="flex items-center justify-between">
<div className="grid grid-cols-3 gap-4">
<div className="absolute top-0 right-0">
<div className="sticky top-0">
```

### Responsive Design

```tsx
// ✅ CORRECT - Responsive utilities
<div className="hidden md:block">
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<h1 className="text-2xl md:text-3xl lg:text-4xl">
```

### State Variations

```tsx
// ✅ CORRECT - State-based styling
<div className="hover:bg-accent">
<Input className="focus:ring-2" />
<Button className="disabled:opacity-50">
```

### One-Off Adjustments (Use Sparingly)

```tsx
// ✅ ACCEPTABLE - When absolutely necessary
<Icon className="absolute left-3 top-3 size-4" />  {/* Icon positioning in Input */}
<TableHead className="text-right">Actions</TableHead>  {/* Text alignment */}
```

---

## 📋 Component Checklist

Before adding custom `className`:

- [ ] Does the component have a variant prop I can use?
- [ ] Does the component have a size prop I can use?
- [ ] Am I using semantic color tokens?
- [ ] Is this spacing value part of the spacing scale (4, 6, 8, 12, 16, 24)?
- [ ] Could I achieve this with layout utilities (flex, grid)?
- [ ] Is this truly a one-off exception?

**If you answered "no" to most questions**, you're probably overriding unnecessarily.

---

## 🔍 Code Review Guidelines

When reviewing code, check for:

1. **Variant usage** - Are all component variants used properly?
2. **Semantic colors** - No `bg-white`, `text-gray-500`, etc.
3. **Spacing consistency** - Standard scale values only
4. **No arbitrary values** - No `w-[234px]` or `text-[13px]`
5. **Proper component composition** - Using Card, CardHeader, CardContent, etc.

---

## 📚 Additional Resources

- **Tailwind v4 Documentation**: https://tailwindcss.com/docs
- **shadcn/ui Components**: Check `@repo/ui/components` for all 52 available components
- **OKLCH Color System**: See `packages/ui/src/styles/globals.css` for available semantic tokens

---

**Remember**: The goal is **consistency, maintainability, and predictability**. When in doubt, use component props over custom classes.
