"use client";

import React, { useMemo, useState } from "react";
import { HighlightedText } from "@/components/HighlightedText";
import type { HighlightItem, HighlightType } from "@/lib/highlighter";
import { Button } from "@/components/ui/button";

const demoParagraph = `When the expedition finally reached the ridge, the air felt kind of impressive — thin and sharp like shattered glass. The guide, apparently confident, said the path was basically safe, though a few old ropes looked kinda tired. I literally held my breath as the clouds rolled in, and, for a moment, time itself seemed bored with us.`;

const demoHighlights: HighlightItem[] = [
  {
    fragment: "kind of impressive",
    context: "The air felt kind of impressive — thin and sharp like shattered glass.",
    type: "vague",
    hoverTip: "Can you be more specific than 'kind of impressive'?",
  },
  {
    fragment: "apparently",
    context: "The guide, apparently confident, said the path was basically safe",
    type: "boring",
    hoverTip: "Hedge words can weaken prose. Consider stating what you observed.",
  },
  {
    fragment: "basically",
    context: "said the path was basically safe",
    type: "wording",
    hoverTip: "Filler. If it's safe, say 'safe'. If not, be precise.",
  },
  {
    fragment: "kinda",
    context: "though a few old ropes looked kinda tired",
    type: "typo",
    hoverTip: "Colloquial. Consider 'rather' or a more descriptive adjective.",
  },
  {
    fragment: "literally",
    context: "I literally held my breath",
    type: "error",
    hoverTip: "Unless you mean it literally, avoid intensifiers that can be misused.",
  },
  {
    fragment: "bored",
    context: "time itself seemed bored with us",
    type: "boring",
    hoverTip: "Try a fresher metaphor that matches the scene's tension.",
  },
];

export function DemoBar() {
  const [show, setShow] = useState(true);

  const legend = useMemo(() => {
    const order: HighlightType[] = ["typo", "vague", "wording", "error", "boring"];
    const desc: Record<HighlightType, string> = {
      typo: "Spelling or informal colloquialism—use standard or clearer wording.",
      vague: "Vague phrasing—be more specific and concrete.",
      wording: "Filler or wordy phrasing—tighten the sentence.",
      error: "Incorrect or misleading usage—fix accuracy.",
      boring: "Cliché or dull phrasing—choose fresher language.",
    };
    return order.map((label) => ({
      label,
      text: label,
      items: [
        {
          fragment: label,
          context: label, // ensure exact match in this tiny text
          type: label,
          hoverTip: desc[label],
        } as HighlightItem,
      ],
    }));
  }, []);

  return (
    <div className="w-full sticky top-0 z-10 border-b border-gray-200 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between my-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
          >
            {show ? "Hide demo highlights" : "Show demo highlights"}
          </Button>
          <div className="hidden sm:flex gap-3 text-xs text-gray-700 items-center">
            {legend.map((l) => (
              <span key={l.label} className="inline-flex items-center">
                <HighlightedText text={l.text} items={l.items as HighlightItem[]} />
              </span>
            ))}
          </div>
        </div>
        {/* Mobile legend */}
        <div className="sm:hidden -mt-1 text-[11px] text-gray-700 flex flex-wrap gap-x-3 gap-y-1">
          {legend.map((l) => (
            <span key={l.label} className="inline-flex items-center">
              <HighlightedText text={l.text} items={l.items as HighlightItem[]} />
            </span>
          ))}
        </div>
        {show && (
          <p className="text-base text-gray-700 font-serif">
            <HighlightedText text={demoParagraph} items={demoHighlights} />
          </p>
        )}
      </div>
    </div>
  );
}
