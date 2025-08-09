# AI agent guide for this repo

Scope: Minimal Next.js 15 (App Router) + React 19 + Tailwind CSS v4 writing surface. Keep diffs tiny, align with existing patterns, and avoid framework bloat.

## Architecture
- App Router under `src/app/*`.
  - Root layout `src/app/layout.tsx` loads two local fonts via `next/font/local` and imports `./globals.css`.
    - UI: `--font-host-grotesk` from `public/fonts/host-grotesk/*`
    - Longform: `--font-libertinus` from `public/fonts/libertinus/*`
  - Home `src/app/page.tsx` renders `<DemoBar />` + `<Writer />` inside a centered container (`WRITER_MAX_W = "max-w-5xl"`).
- Aliases: prefer `@/` (see `tsconfig.json`). Only add "use client" where hooks/browser APIs are used.

## LLM analysis pipeline (server)
- Route: `POST /api/analyze` (`src/app/api/analyze/route.ts`).
  - Body: `{ text: string, currentItems?: HighlightItem[], systemOverrides?: string }`
  - Calls `analyzeTextWithLLM(text, opts)` in `src/lib/llmAnalyze.ts`.
- LLM: LangChain `ChatGroq` with default `model = "moonshotai/kimi-k2-instruct"` and `temperature=0.2`.
  - Requires `GROQ_API_KEY` (if missing, returns `{ items: [] }`).
  - Uses `zod` + `StructuredOutputParser` to enforce `{ items: HighlightItem[] }`.
  - Stability: prompt includes CURRENT_HIGHLIGHTS; preserve items across small edits and avoid churn.
- Types shape (shared with client): `HighlightItem = { fragment, context, type, hoverTip? }` with `type ∈ { typo|vague|wording|error|boring }`.

## Writing surface (client)
- `src/components/Writer.tsx`: contentEditable editor (not a textarea) with autofocus and plain-text paste.
  - Builds innerHTML with `<mark data-highlight data-tip>…</mark>` via `computeHighlightRanges/splitByRanges` and `typeToClasses`.
  - Preserves caret position across DOM patches; debounce analyze (5s) and also trigger on punctuation.
  - Fetches `/api/analyze` with `{ text, currentItems }` and applies returned items.
  - Tooltip in editor is custom DOM (appended to a wrapper) for reliability inside contentEditable; do not use Radix here.

## Highlight rendering (static text)
- `src/components/HighlightedText.tsx` renders any string + `HighlightItem[]` by splitting and wrapping fragments.
- `src/components/Highlight.tsx` uses Radix Tooltip (`components/ui/tooltip.tsx`) with click-to-pin and Escape to close.
- `src/lib/highlighter.ts`:
  - `computeHighlightRanges`: prefer `fragment` inside `context`; fallback to first `fragment`; drop overlaps (keep-first).
  - `splitByRanges`: returns ordered parts.
  - `typeToClasses`: Tailwind styles per type (bg + underline). Update when adding types.

## Styling and UI primitives
- Tailwind v4 via `@tailwindcss/postcss` (no tailwind.config). Use utilities in JSX; keep `globals.css` small.
- Helpers in `globals.css`: `hide-scrollbar`, `caret-blink`, `.page`; selection and base CSS vars for colors/radius.
- Fonts: default UI font is Host Grotesk (body). Use Libertinus for longform: `style={{ fontFamily: "var(--font-libertinus), serif" }}`.
- Buttons: `components/ui/button.tsx` (CVA + `cn`); prefer `variant="outline|..."`, `size="sm|..."`.
- Tooltip content uses explicit HSL CSS vars for consistent contrast in light mode.

## Dev workflows
- Dev (Turbopack): `bun run dev` (or `npm/yarn/pnpm run dev`). Build: `bun run build`. Start: `bun run start`.
- Lint: `bun run lint` (Flat config extends Next). Tests: `bun test`.
  - Example test: `tests/highlighter.test.ts` covers range finding/splitting. Run a single file: `bun test tests/highlighter.test.ts`.

## Extending highlights (update all three places)
- Add type in:
  1) `src/lib/highlighter.ts` (union + `typeToClasses`),
  2) `src/lib/llmAnalyze.ts` (Zod enum),
  3) `src/lib/analyzePrompt.ts` (prompt doc). Optionally update demo legend in `components/DemoBar.tsx`.

## Key references
- Pages/layout/fonts: `src/app/page.tsx`, `src/app/layout.tsx`, `public/fonts/*`.
- Editor: `src/components/Writer.tsx`.
- Highlights: `src/components/HighlightedText.tsx`, `src/components/Highlight.tsx`, `src/lib/highlighter.ts`.
- UI primitives: `components/ui/button.tsx`, `components/ui/tooltip.tsx`, `src/lib/utils.ts`.

Notes: keep UI minimal and distraction-free; avoid adding server APIs/state unless requested; prefer tiny, focused diffs with file paths in PR descriptions.