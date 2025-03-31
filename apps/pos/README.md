# Technical Documentation

---

## 1. Overview

This project is a **Next.js (App Router)** application that manages a Restaurant POS system. It includes:

- **Authentication** and **User** management
- **Store** (restaurant) selection / management
- **React Query** (optional) or **custom** fetch wrappers for data loading
- **Zustand** for global state (auth token, user info, etc.)
- **Tailwind CSS** for design and layout
- **TypeScript** to ensure maintainability and typed domain logic
- **Skeleton UIs** to maintain a smooth user experience when data is loading

---

## 2. Folder Structure & Conventions

A typical structure might look like this:

```
apps/pos/
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ (auth)/
│  │  │  ├─ login/
│  │  │  │  └─ page.tsx         # /login route
│  │  │  ├─ register/
│  │  │  │  └─ page.tsx         # /register route
│  │  │  └─ layout.tsx          # Optional layout for (auth)
│  │  └─ (protected)/
│  │     └─ store/
│  │        └─ choose/
│  │           └─ page.tsx      # /store/choose route
│  ├─ features/
│  │  ├─ auth/
│  │  │  ├─ services/
│  │  │  │  └─ auth.service.ts
│  │  │  ├─ store/
│  │  │  │  └─ auth.store.ts
│  │  │  └─ types/
│  │  │     └─ auth.types.ts
│  │  ├─ user/
│  │  │  ├─ services/
│  │  │  │  └─ user.service.ts
│  │  │  ├─ store/
│  │  │  │  └─ user.store.ts
│  │  │  └─ types/
│  │  │     └─ user.types.ts
│  │  └─ store/
│  │     ├─ services/
│  │     │  └─ store.service.ts
│  │     ├─ store/
│  │     │  └─ store.store.ts
│  │     └─ types/
│  │        └─ store.types.ts
│  ├─ components/
│  │  ├─ store-card.tsx
│  │  ├─ store-card-skeleton.tsx
│  │  ├─ store-list-skeleton.tsx
│  │  └─ ...
│  ├─ utils/
│  │  └─ apiFetch.ts
│  └─ ...
├─ .next/                    # Build artifacts (auto-generated)
├─ node_modules/             # Dependencies (auto-generated)
└─ package.json
```

**Key Points**:

- **`src/app/`**: Next.js App Router directories. Each subfolder is a route (e.g. `/login`, `/register`, `/store/choose`).
- **`features/`**: Domain logic grouping. Each feature (auth, user, store) has `services/`, `store/`, and `types/`.
- **`components/`**: Shared UI (cards, skeleton placeholders, etc.).
- **`utils/`**: Generic utilities (e.g., `apiFetch.ts` for HTTP).

---

## 3. Handling API Calls

### 3.1 `apiFetch` Utility

A custom fetch wrapper that merges default headers, reads an auth token from Zustand, and returns an `ApiResponse<T>`.

```ts
import { ApiResponse } from '@/common/types/api.types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { toast } from 'sonner';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = useAuthStore.getState().accessToken;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const url = baseUrl + path;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  let json: ApiResponse<T>;

  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    toast.error(`Failed to parse JSON from ${url}`);
    throw new Error(`Failed to parse JSON from ${url}`);
  }

  if (!response.ok || json.status === 'error') {
    if (response.status === 401) {
      // Possibly clear auth state if 401
      useAuthStore.getState().clearAuth();
    }
    const errMsg =
      json.error?.message || json.message || `Request failed: ${url}`;
    toast.error(errMsg);
    throw new Error(errMsg);
  }

  return json;
}
```

### 3.2 Example Service Function

```ts
import { apiFetch } from '@/utils/apiFetch';
import {
  CreateUserDto,
  RegisterUserData,
} from '@/features/user/types/user.types';

export async function registerUser(
  data: CreateUserDto
): Promise<RegisterUserData> {
  const res = await apiFetch<RegisterUserData>('/user/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}
```

**Behavior**:

- We only return `res.data`, having thrown an error if `res.status` is `"error"`.

---

## 4. Global Store (Zustand)

Use **Zustand** for global states like the auth token and user. For instance:

```ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CurrentUserData } from '@/features/user/types/user.types';

interface AuthState {
  accessToken: string | null;
  user: CurrentUserData | null;
  isAuthenticated: boolean;

  setAuth: (token: string) => void;
  setUser: (user: CurrentUserData) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        accessToken: null,
        user: null,
        isAuthenticated: false,

        setAuth: (token) =>
          set(() => ({ accessToken: token, isAuthenticated: true })),

        setUser: (user) => set(() => ({ user })),

        clearAuth: () =>
          set(() => ({
            accessToken: null,
            user: null,
            isAuthenticated: false,
          })),
      }),
      { name: 'auth-storage' }
    )
  )
);
```

- `persist`: Saves auth data in localStorage for persistent login.
- `devtools`: Integrates with Redux DevTools for debugging.

---

## 5. Pages Combining Services & Store

### 5.1 Example: `app/(auth)/login/page.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';

import { login } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { getCurrentUser } from '@/features/user/services/user.service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { accessToken, setAuth } = useAuthStore();

  // If we want to fetch user data once we have a token
  const {
    mutate: loginMutate,
    isLoading,
    error,
  } = useMutation(login, {
    onSuccess: (res) => {
      setAuth(res.access_token);
    },
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutate(data);
  };

  useEffect(() => {
    if (accessToken) {
      // Possibly fetch user or redirect
      router.replace('/store/choose');
    }
  }, [accessToken, router]);

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-xl">Login</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <input
          placeholder="Email"
          {...form.register('email')}
          className="w-full border p-2"
        />
        <input
          type="password"
          placeholder="Password"
          {...form.register('password')}
          className="w-full border p-2"
        />

        {error && (
          <p className="text-red-600">Error: {(error as Error).message}</p>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

---

## 6. Skeleton Usage for Loading States

### 6.1 Components

1. **StoreCardSkeleton** – Renders a single skeleton placeholder:

   ```tsx
   // store-card-skeleton.tsx
   import { motion } from 'motion/react';
   import { Skeleton } from '@repo/ui/components/skeleton';

   export function StoreCardSkeleton() {
     return (
       <motion.li className="list-none">
         <div className="rounded-lg border bg-white p-4" aria-hidden="true">
           <Skeleton className="mb-2 h-6 w-3/4" />
           <Skeleton className="mb-1 h-4 w-5/6" />
           <Skeleton className="h-4 w-1/2" />
           <div className="mt-4">
             <Skeleton className="h-4 w-1/3" />
           </div>
         </div>
       </motion.li>
     );
   }
   ```

2. **StoreListSkeleton** – Renders multiple skeleton cards in a list:

   ```tsx
   // store-list-skeleton.tsx
   import { AnimatePresence, motion } from 'motion/react';
   import { StoreCardSkeleton } from './store-card-skeleton';

   export function StoreListSkeleton() {
     return (
       <AnimatePresence>
         <motion.ul
           role="list"
           className="grid grid-cols-1 gap-6 sm:grid-cols-2"
           initial={{ opacity: 0.5, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
         >
           {Array.from({ length: 4 }).map((_, idx) => (
             <StoreCardSkeleton key={idx} />
           ))}
         </motion.ul>
       </AnimatePresence>
     );
   }
   ```

### 6.2 Usage

In your **Choose Store** page, you might have:

```tsx
// app/store/choose/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { StoreListSkeleton } from '@/components/store-list-skeleton';
import { StoreCard } from '@/components/store-card';
import { getCurrentUser } from '@/features/user/services/user.service';

export default function ChooseStorePage() {
  const router = useRouter();
  const {
    data: user,
    isLoading,
    error,
  } = useQuery(['user', 'me'], getCurrentUser);

  useEffect(() => {
    if (!isLoading && !error && user) {
      if (user.currentStore) router.push('/hub/sales');
      else if (!user.userStores?.length) router.push('/store/create');
    }
  }, [isLoading, error, user, router]);

  if (isLoading) {
    // Render skeleton while loading
    return (
      <main className="min-h-screen bg-gradient-to-r from-blue-200 to-indigo-200 p-4">
        <section className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold">Choose Store</h1>
          <StoreListSkeleton />
        </section>
      </main>
    );
  }

  if (error) {
    return <p className="text-center text-red-600">Error loading stores.</p>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-200 to-indigo-200 p-4">
      <section className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold">Choose Store</h1>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {user?.userStores?.map((storeObj: any) => (
            <StoreCard key={storeObj.id} userStore={storeObj} />
          ))}
        </ul>
      </section>
    </main>
  );
}
```

**Rule**:
Always use skeleton placeholders in loading states, **unless** the component is trivial or purely static. This **prevents** layout shifts and provides a modern UX.

---

## 7. Important Rules & Conventions

1. **Use Skeleton UI for Loading**
   - When data is fetching, display skeleton placeholders.
   - This reduces flicker and abrupt layout changes.
2. **TypeScript**
   - All code in `.ts` or `.tsx` with explicit interfaces or types.
   - Use `auth.types.ts`, `user.types.ts`, etc. for domain data.
3. **Zustand**
   - Store only minimal global states (token, user).
   - No direct API calls in store methods.
   - Use `persist` for session continuity.
4. **Services Return Data**
   - Service calls throw if `res.status === "error"`.
   - Return `res.data` on success.
5. **React Query or Custom**
   - For complex caching: React Query.
   - For simpler or one-off calls: direct `apiFetch` usage.
6. **Semantic HTML & Accessibility**
   - `<main>`, `<section>`, `<header>`, `<footer>`, `<ul>`, `<li>`.
   - Interactive elements: use `<button>` or `<a>` with ARIA roles/labels.
7. **Styling**
   - Tailwind utility classes.
   - Framer Motion for transitions (fade in/out of skeletons).
8. **Feature-Sliced**
   - Keep domain logic grouped by feature (`auth`, `user`, `store`), each with `services/`, `store/`, `types/`.

---

## 8. Summary for New Developers

1. **Clone & Install**

   ```bash
   git clone [repo-url]
   cd apps/pos
   npm install
   ```

2. **Run Locally**

   ```bash
   npm run dev
   ```

   Runs at [http://localhost:3000](http://localhost:3000).

3. **Folder Locations**

   - `src/app/`: Next.js routes (App Router).
   - `features/[feature]/services/`: API calls (auth, user, etc.).
   - `features/[feature]/store/`: Zustand store logic.
   - `features/[feature]/types/`: TypeScript definitions.
   - `components/`: Reusable UI (cards, skeletons, etc.).
   - `utils/`: e.g., `apiFetch.ts`.

4. **API Flow**

   - Service calls `apiFetch`, returns `res.data`.
   - Check for error => throw if necessary.
   - UI handles success/failure, e.g. using React Query or local state.

5. **Global Store**

   - `useAuthStore` for token, user object, `isAuthenticated`.
   - Avoid API calls in store, keep it pure state only.

6. **Skeleton Enforcement**

   - For all pages that fetch data, show Skeleton UIs while `isLoading`.
   - Only skip skeleton if the data is trivial or static.

7. **Contributing**

   - Consistent naming: `.service.ts`, `.store.ts`, `.types.ts`.
   - Follow the skeleton usage rule, semantic HTML, and TypeScript best practices.

8. **Final Steps**

   - Test any new route or service call with skeleton placeholders and typed endpoints.
   - Use devtools for debugging, and ensure it’s tested on local dev environment.

---

## Final Thoughts

This technical documentation should help new developers:

- **Understand** the folder structure and how to add new pages or features.
- **Know** how to handle data fetching (services + skeleton UIs).
- **See** how global state is kept minimal in Zustand.
- **Enforce** consistent best practices (skeleton loading, TypeScript, semantic HTML).

By following these guidelines, the project remains **easy to maintain**, **scalable**, and **welcoming** to future contributors.
