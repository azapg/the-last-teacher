export type HighlightType = "typo" | "vague" | "wording" | "error" | "boring";

export type HighlightItem = {
  fragment: string;
  context: string; // A surrounding snippet that appears in the source text
  type: HighlightType;
  hoverTip?: string;
};

export type HighlightRange = {
  start: number; // inclusive
  end: number; // exclusive
  item: HighlightItem;
};

// Find non-overlapping highlight ranges in `text` using the provided items.
// It prefers locating the fragment inside its context within the text; if the
// context isn't found, it falls back to the first occurrence of the fragment.
export function computeHighlightRanges(
  text: string,
  items: HighlightItem[]
): HighlightRange[] {
  const ranges: HighlightRange[] = [];

  for (const item of items) {
    if (!item.fragment) continue;

    let start = -1;
    let end = -1;

    if (item.context) {
      const ctxIdx = text.indexOf(item.context);
      if (ctxIdx !== -1) {
        const fragInCtx = item.context.indexOf(item.fragment);
        if (fragInCtx !== -1) {
          start = ctxIdx + fragInCtx;
          end = start + item.fragment.length;
        }
      }
    }

    // Fallback: find fragment directly in the text
    if (start === -1) {
      const fragIdx = text.indexOf(item.fragment);
      if (fragIdx !== -1) {
        start = fragIdx;
        end = fragIdx + item.fragment.length;
      }
    }

    if (start !== -1 && end !== -1) {
      ranges.push({ start, end, item });
    }
  }

  // Sort by start and drop overlaps conservatively (keep first win)
  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  const nonOverlapping: HighlightRange[] = [];
  for (const r of ranges) {
    const last = nonOverlapping.at(-1);
    if (!last || r.start >= last.end) {
      nonOverlapping.push(r);
    }
    // If overlapping, skip r (conservative policy)
  }

  return nonOverlapping;
}

export function splitByRanges(
  text: string,
  ranges: HighlightRange[]
): Array<{ text: string; range?: HighlightRange }> {
  const parts: Array<{ text: string; range?: HighlightRange }> = [];
  let cursor = 0;
  for (const r of ranges) {
    if (cursor < r.start) parts.push({ text: text.slice(cursor, r.start) });
    parts.push({ text: text.slice(r.start, r.end), range: r });
    cursor = r.end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}

export const typeToClasses: Record<HighlightType, string> = {
  typo: "bg-orange-100 underline decoration-orange-600 decoration-2 underline-offset-2",
  vague: "bg-yellow-100 underline decoration-yellow-600 decoration-2 underline-offset-2",
  wording: "bg-purple-100 underline decoration-purple-600 decoration-2 underline-offset-2",
  error: "bg-red-100 underline decoration-red-600 decoration-2 underline-offset-2",
  boring: "bg-gray-200 underline decoration-gray-600 decoration-2 underline-offset-2",
};
