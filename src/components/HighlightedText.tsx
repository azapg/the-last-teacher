import React from "react";
import { computeHighlightRanges, splitByRanges, typeToClasses, HighlightItem } from "@/lib/highlighter";

export function HighlightedText({
  text,
  items,
}: {
  text: string;
  items: HighlightItem[];
}) {
  const ranges = computeHighlightRanges(text, items);
  const parts = splitByRanges(text, ranges);

  return (
    <span>
      {parts.map((p, i) =>
        p.range ? (
          <mark
            key={i}
            className={`${typeToClasses[p.range.item.type]} rounded-sm px-0.5`}
            title={p.range.item.hoverTip || undefined}
          >
            {p.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        )
      )}
    </span>
  );
}
