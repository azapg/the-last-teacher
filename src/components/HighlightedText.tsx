import React from "react";
import { computeHighlightRanges, splitByRanges, typeToClasses, HighlightItem } from "@/lib/highlighter";
import { Highlight } from "@/components/Highlight";

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
      {parts.map((p, i) => {
        if (!p.range) return <React.Fragment key={i}>{p.text}</React.Fragment>;

        const tip = p.range.item.hoverTip?.trim();
        const classes = `${typeToClasses[p.range.item.type]} rounded-sm px-0.5`;

        return (
          <Highlight key={i} tip={tip} className={classes}>
            {p.text}
          </Highlight>
        );
      })}
    </span>
  );
}
