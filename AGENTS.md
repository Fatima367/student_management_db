<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Student Management Dashboard — Project Conventions

## Folder Structure
```
app/                    # Next.js App Router pages & API routes
  (auth)/               # Login/signup routes (route group, no URL prefix)
  (dashboard)/          # Dashboard routes (all protected by auth)
    _components/        # Private folder for dashboard-specific components
  api/                  # Route handlers (server actions preferred over API routes)
components/             # Shared UI components (shadcn/ui + custom)
  ui/                   # shadcn/ui primitives (button, card, input, etc.)
  forms/               # Form components
  tables/              # Table components
  charts/              # Chart wrapper components
lib/                    # Shared utilities & configuration
  supabase/            # Supabase client & server helpers
    client.ts          # Browser-side Supabase client
    server.ts          # Server-side Supabase client
    middleware.ts       # Auth middleware
  ai/                  # Vercel AI SDK setup
  utils.ts             # cn() helper & other utilities
public/                 # Static assets
```

## Component Conventions
- Server Components (SC) are the **default** — no directive needed.
- Client Components (CC) use `'use client'` directive at the top of the file.
- Keep CC boundaries narrow; prefer passing Server Components as `children` to CC wrappers.
- Props passed from SC to CC must be serializable.
- Never import server-only code (DB queries, API keys) into client components.

## Data Mutations
- All data writes go through **Server Actions** (not API routes).
- Server Actions are defined in `lib/actions/` or colocated in route files with `'use server'`.
- Forms use Server Actions directly via the `action` prop.

## State & Data Fetching
- Fetch data in Server Components using Supabase SDK directly (no fetch wrappers needed).
- Use React `cache()` for deduplicating identical requests within a render pass.
- Use `searchParams` (Promise-based) for pagination/filter state on list pages.
- Client-side state (useState) for UI interactions only.

## Supabase Schema
- The Supabase MCP server is the **source of truth** for database schema.
- All migrations go through MCP — no manual SQL drift.
- RLS is enabled on every table (default deny).
- Use `profiles` table for role-based access (linked 1:1 to `auth.users`).
