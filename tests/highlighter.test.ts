import { describe, it, expect } from "bun:test";
import { computeHighlightRanges, splitByRanges } from "../src/lib/highlighter";

const text = "The results were kind of impressive but not consistent.";

describe("computeHighlightRanges", () => {
  it("finds fragment via context first", () => {
    const ranges = computeHighlightRanges(text, [
      {
        fragment: "kind of impressive",
        context: "The results were kind of impressive but not consistent.",
        type: "vague",
        hoverTip: "Can you be more specific than 'kind of impressive'?",
      },
    ]);
    expect(ranges.length).toBe(1);
    const r = ranges[0]!;
    expect(text.slice(r.start, r.end)).toBe("kind of impressive");
  });

  it("falls back to fragment when context missing", () => {
    const ranges = computeHighlightRanges(text, [
      {
        fragment: "impressive",
        context: "not present",
        type: "vague",
      },
    ]);
    expect(ranges.length).toBe(1);
    expect(text.slice(ranges[0]!.start, ranges[0]!.end)).toBe("impressive");
  });

  it("drops overlaps conservatively", () => {
    const ranges = computeHighlightRanges(text, [
      { fragment: "kind of", context: text, type: "vague" },
      { fragment: "kind of impressive", context: text, type: "wording" },
    ]);
    // Depending on sort, shorter first keeps, longer drops (keep-first policy)
    expect(ranges.length).toBe(1);
    expect(text.slice(ranges[0]!.start, ranges[0]!.end)).toBe("kind of");
  });
});

describe("splitByRanges", () => {
  it("splits text into parts around ranges", () => {
    const ranges = computeHighlightRanges(text, [
      { fragment: "kind of impressive", context: text, type: "vague" },
    ]);
    const parts = splitByRanges(text, ranges);
    expect(parts.some((p) => p.range)).toBe(true);
    const joined = parts.map((p) => p.text).join("");
    expect(joined).toBe(text);
  });
});
