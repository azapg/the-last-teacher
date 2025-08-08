"use client";

import React, { useMemo, useState } from "react";
import { HighlightedText } from "@/components/HighlightedText";
import type { HighlightItem } from "@/lib/highlighter";

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

  const legend = useMemo(
    () => [
      { label: "typo", className: "bg-orange-100 underline decoration-orange-600" },
      { label: "vague", className: "bg-yellow-100 underline decoration-yellow-600" },
      { label: "wording", className: "bg-purple-100 underline decoration-purple-600" },
      { label: "error", className: "bg-red-100 underline decoration-red-600" },
      { label: "boring", className: "bg-gray-200 underline decoration-gray-600" },
    ],
    []
  );

  return (
    <div className="w-full sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
            aria-pressed={show}
          >
            {show ? "Hide demo highlights" : "Show demo highlights"}
          </button>
          <div className="hidden sm:flex gap-2 text-xs text-gray-700">
            {legend.map((l) => (
              <span key={l.label} className={`${l.className} rounded px-1 underline-offset-2`}>{l.label}</span>
            ))}
          </div>
        </div>
        {show && (
          <p className="text-base text-gray-700">
            <HighlightedText text={demoParagraph} items={demoHighlights} />
          </p>
        )}
      </div>
    </div>
  );
}
