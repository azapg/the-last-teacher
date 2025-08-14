"use client";

import { useRef } from "react";
import { WritingBar } from "./WritingBar";
import { LoadingSpinner } from "./LoadingSpinner";
import { useLiveAnalyzer } from "@/hooks/useLiveAnalyzer";
import { useHighlightTooltip } from "@/hooks/useHighlightTooltip";

type WriterProps = {
  fontSize?: string; // CSS size value, e.g. "clamp(28px,5vw,48px)" or "48px"
  placeholder?: string;
  className?: string;
};

export function Writer({
  fontSize = "clamp(28px,5vw,48px)",
  placeholder = "Start typing...",
  className = "",
}: WriterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLElement>(null);
  const { loading, score, handlers } = useLiveAnalyzer(ref);

  useHighlightTooltip(wrapperRef);

  return (
    <section ref={wrapperRef} className={`w-full h-full bg-white flex flex-col min-h-0 relative ${className}`}>
      {loading && <LoadingSpinner />}

      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-label="Writing area"
        // editable with inline marks; keep plain-text paste
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        {...({ autoCorrect: "off", autoCapitalize: "off" } as any)}
        data-empty="true"
        data-placeholder={placeholder}
        {...handlers}
        className="
          flex-1 pt-3 w-full h-full resize-none border-0 outline-none focus:outline-none focus:ring-0
          bg-transparent text-[#111] leading-snug overflow-auto hide-scrollbar caret-[#888] focus:caret-black
          caret-blink selection:bg-[#b3b3b3] selection:text-black min-h-0 whitespace-pre-wrap
          relative
          before:absolute before:inset-x-0 before:top-3 before:block before:pointer-events-none
          before:text-[#9ca3af] before:whitespace-pre-wrap before:content-[attr(data-placeholder)]
          data-[empty=false]:before:content-[''] data-[empty=false]:before:hidden
          font-serif
        "
        style={{ fontSize }}
      />

      <WritingBar score={score} />
    </section>
  );
}