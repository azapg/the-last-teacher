import React from "react";
import { computeHighlightRanges, splitByRanges, typeToClasses, HighlightItem } from "@/lib/highlighter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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

        if (tip) {
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <mark className={classes} tabIndex={0} aria-label={tip}>
                  {p.text}
                </mark>
              </TooltipTrigger>
              <TooltipContent>{tip}</TooltipContent>
            </Tooltip>
          );
        }

        return (
          <mark key={i} className={classes}>
            {p.text}
          </mark>
        );
      })}
    </span>
  );
}
