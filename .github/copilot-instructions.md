# AI agent guide for this repo

Scope: Minimal Next.js 15 (App Router) + React 19 + Tailwind CSS v4 writing surface. Keep changes small and aligned with existing patterns.

## Architecture and conventions
- App Router structure lives under `src/app/*`.
  - Root layout: `src/app/layout.tsx` sets global font via `next/font/local` (Libertinus) and includes `./globals.css`.
  - Home page: `src/app/page.tsx` renders `<Writer />` and controls layout width (`WRITER_MAX_W`) and font size via a prop.
- Components are colocated under `src/components/` (example: `src/components/Writer.tsx`).
  - Client components use the "use client" directive when hooks are used.
  - Props are simple and typed; follow the `WriterProps` style.
- Styling: Tailwind v4 utilities (via PostCSS plugin) plus a small `globals.css`.
  - `src/app/globals.css` imports `tailwindcss` and defines a few utilities (`hide-scrollbar`, `caret-blink`, etc.).
  - Prefer Tailwind utility classes in JSX and only add globals for widely reused primitives.
- Fonts: Local fonts loaded with `next/font/local` and a CSS variable `--font-libertinus` applied on `<body>`.
  - Font files live in `public/fonts/libertinus/*`. Keep additions here and reference them in `layout.tsx`.
- TypeScript path alias `@/*` maps to `./src/*` (tsconfig). Current code mixes relative imports; both work—prefer `@/` in new code for clarity.

## Developer workflows
- Dev server (Turbopack):
  - With Bun (lockfile present): `bun run dev`
  - Or npm/yarn/pnpm: `npm run dev` / `yarn dev` / `pnpm dev`
- Build: `bun run build` (or `npm run build`)
- Start production server: `bun run start`
- Lint: `bun run lint` (ESLint flat config extends `next/core-web-vitals` + `next/typescript`).
- Tests: none configured. If you add tests, include the runner in `package.json` and minimal examples.

## Patterns to follow (with examples)
- Pages/routes: add a folder under `src/app/<route>/page.tsx`.
  - Example: `src/app/about/page.tsx` exporting a default React component.
- Client components: include `"use client"` only when needed (hooks, browser-only APIs).
- Accessibility & UX: mirror `Writer.tsx` defaults (e.g., `aria-label`, `spellCheck={false}`, selection and caret styles from globals).
- Sizing text: follow `Writer`’s API and use CSS sizes like `clamp(28px,5vw,48px)`.
- Styling: utility-first. Example from `Writer.tsx`:
  - `className="w-full h-full resize-none border-0 outline-none ... caret-blink selection:bg-[#b3b3b3]"`.

## External/tooling details
- Next.js 15.4.6, React 19.1.0.
- Tailwind CSS v4 via `@tailwindcss/postcss` in `postcss.config.mjs`; no separate Tailwind config file is present.
- ESLint configured via `eslint.config.mjs` using `FlatCompat` to extend Next presets.

## Do/Don’t for this repo
- Do keep UI minimal and distraction-free; reuse existing utilities from `globals.css`
- Do load additional fonts via `next/font/local` and apply via CSS variables on `<body>`.
- Do prefer `@/` imports for new modules (e.g., `import { Writer } from "@/components/Writer"`).
- Don’t introduce the legacy `pages/` directory—use App Router only.
- Don’t add global CSS frameworks; stick to Tailwind utilities and small globals.
- Don’t use `next/head` in App Router; use `export const metadata` in layouts/pages.

## Key files
- `src/app/layout.tsx`: global fonts, metadata, and body classes.
- `src/app/page.tsx`: landing page using `Writer`.
- `src/components/Writer.tsx`: core writing surface component.
- `src/app/globals.css`: Tailwind import and shared utilities.
- `package.json`: scripts for dev/build/lint; prefer Bun in this workspace.

If anything is unclear (e.g., adding routes, extending `Writer`, or introducing state/storage), ask for confirmation and propose a minimal diff aligned with these patterns.

## Some tips
- The `run_in_terminal` tool sometimes fails to capture the command output. If that happens, use the `get_terminal_last_command` tool to retrieve the last command output from the terminal. If that fails, ask the user to copy-paste the output from the terminal.