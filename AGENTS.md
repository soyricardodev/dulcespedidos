# AGENTS.md

Agentic coding guidelines for this Next.js project.

## Project Overview

- **Framework**: Next.js 16.1.6 with React 19.2.3
- **Language**: TypeScript 5 with strict mode
- **Styling**: Tailwind CSS v4 with shadcn/ui (radix-mira style)
- **UI Library**: @base-ui/react, radix-ui primitives
- **Icons**: lucide-react
- **Runtime**: Bun (see bun.lock)

## Build/Lint/Format Commands

```bash
# Development. Never run this unless i told you. I ran this command by myself
bun run dev              # Start dev server

# Build
bun run build            # Production build

# Linting (oxlint - Rust-based, type-aware)
bun run lint             # Check for issues
bun run lint:fix         # Fix auto-fixable issues

# Formatting (oxfmt - Rust-based)
bun run fmt              # Format all files
bun run fmt:check        # Check formatting without writing

# Type checking
bunx tsc --noEmit         # Run TypeScript compiler
```

## Code Style Guidelines

### Imports

- Use `@/` path aliases: `@/components`, `@/lib/utils`
- Import types with `type`: `import type { Metadata } from "next"`

### Component Patterns

- Use regular functions: `function ComponentName(props)` not arrow functions
- Destructure props with defaults: `function Button({ className, variant = "default" })`
- Apply `cn()` utility for className merging: `className={cn(base, className)}`
- Export named components, not default exports

### Types

- Enable strict TypeScript mode (configured)
- Use explicit return types sparingly (infer where clear)
- Define component props using intersection: `React.ComponentProps<"div"> & { customProp?: string }`

### Naming Conventions

- Components: PascalCase (e.g., `Button`, `CardHeader`)
- Files: kebab-case (e.g., `dropdown-menu.tsx`)
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE for true constants
- Boolean props: Use natural language (e.g., `asChild`, `disabled`)

### Error Handling

- Use Next.js error boundaries: `error.tsx`, `global-error.tsx`
- Use `notFound()` for 404s
- Use `redirect()` for navigation
- Always handle async errors with try/catch

### Styling (Tailwind)

- Use CSS variables from globals.css (e.g., `bg-primary`, `text-foreground`)
- Mobile-first responsive design
- Use `cn()` for conditional classes
- Follow existing component patterns for consistency

### Server vs Client Components

- Default to Server Components
- Add `"use client"` only when using:
  - React hooks (useState, useEffect, etc.)
  - Browser APIs
  - Event handlers
- Keep client components as small as possible

## Available Skills

Reference `.agents/skills/` for detailed guidance:

- `find-skills/` - To find usefull skills for the project stack
- `next-best-practices/` - File conventions, RSC boundaries, async patterns
- `next-cache-components/` - Caching, PPR, cache directives
- `better-auth-best-practices/` - Auth integration
- `web-design-guidelines/` - UI/UX best practices

## Key Files

- `app/globals.css` - Tailwind theme configuration
- `lib/utils.ts` - `cn()` helper for class merging
- `components/ui/` - shadcn/ui components
- `next.config.ts` - Next.js configuration
- `components.json` - shadcn/ui configuration
