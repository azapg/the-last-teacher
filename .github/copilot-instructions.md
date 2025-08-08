# AI agent guide for this repo

Scope: Minimal Next.js 15 (App Router) + React 19 + Tailwind CSS v4 writing surface. Keep diffs tiny, align with existing patterns, and avoid framework bloat.

## Architecture and layout
- App Router lives under `src/app/*`.
  - Root layout `src/app/layout.tsx` loads two local fonts via `next/font/local`:
    - `--font-host-grotesk` (UI default on <body>) from `public/fonts/host-grotesk/*`.
    - `--font-libertinus` (writer/longform) from `public/fonts/libertinus/*`.
    - Includes `./globals.css` (Tailwind v4 import + CSS vars/utilities).
  - Home `src/app/page.tsx` renders `<DemoBar />` and `<Writer />` inside a centered container (`WRITER_MAX_W = "max-w-5xl"`).

## Core components and patterns
- `src/components/Writer.tsx` (client): autofocus `<textarea>` writing surface.
  - API: `fontSize?: string` (e.g., `"clamp(28px,5vw,48px)"`), `placeholder?`, `className?`.
  - Styling: utility-first; uses `hide-scrollbar`, `caret-blink`, and `style={{ fontFamily: "var(--font-libertinus), serif" }}`.
- `src/components/DemoBar.tsx` (client): toggleable demo/legend.
  - Uses `Button` from `src/components/ui/button.tsx` (cva + `cn`) and `HighlightedText`.
  - UI font set to Host Grotesk; longform preview uses Libertinus.
- `src/components/HighlightedText.tsx`: stateless renderer for inline highlights.
  - Splits text into parts using `computeHighlightRanges` + `splitByRanges` from `src/lib/highlighter.ts`.
  - For items with `hoverTip`, wraps the fragment in Radix Tooltip (`components/ui/tooltip.tsx`).
- UI primitives:
  - `components/ui/button.tsx` uses class-variance-authority; prefer `variant="outline|..."`, `size="sm|..."` and compose with `cn(...)` from `src/lib/utils.ts`.
  - `components/ui/tooltip.tsx` wraps `@radix-ui/react-tooltip`; content uses explicit HSL CSS vars for reliable contrast in light mode.

## Highlighter library (what to know)
- `src/lib/highlighter.ts` provides:
  - Types: `HighlightType` ("typo" | "vague" | "wording" | "error" | "boring"), `HighlightItem`.
  - `computeHighlightRanges(text, items)`: finds non-overlapping ranges, preferring `fragment` inside `context`; otherwise first occurrence of `fragment`. Overlaps are dropped conservatively (keep-first policy).
  - `splitByRanges(text, ranges)`: returns text parts with optional attached range.
  - `typeToClasses`: Tailwind bg + underline mapping per type. If you add a new type, update the union and this map.

## Styling and conventions
- Tailwind v4 via `@tailwindcss/postcss` (no tailwind.config). Use utilities in JSX; keep globals small.
- CSS variables defined in `globals.css` (colors, radius). Reuse helpers: `hide-scrollbar`, `caret-blink`, `.page`.
- Only add `"use client"` when using hooks/browser APIs. Prefer `@/` imports (alias in `tsconfig.json`). Use App Router metadata exports, not `next/head`.

## Developer workflows
- Dev (Turbopack): `bun run dev` (or `npm/yarn/pnpm run dev`).
- Build: `bun run build`; Start: `bun run start`.
- Lint: `bun run lint` (Flat config extends Next presets).
- Tests: `bun test` (see `tests/highlighter.test.ts` for examples using `bun:test`). Run a single file: `bun test tests/highlighter.test.ts`.

## Key references
- Pages: `src/app/page.tsx`.
- Fonts/layout: `src/app/layout.tsx`, `public/fonts/*`.
- Writer: `src/components/Writer.tsx`.
- Demo + highlighting: `src/components/DemoBar.tsx`, `src/components/HighlightedText.tsx`, `src/lib/highlighter.ts`.
- UI primitives: `src/components/ui/button.tsx`, `src/components/ui/tooltip.tsx`, utils in `src/lib/utils.ts`.

Notes for changes: keep UI minimal and distraction-free; avoid adding server APIs/state unless requested. If unclear (e.g., new route, extending highlighting types), propose a minimal diff with file paths.