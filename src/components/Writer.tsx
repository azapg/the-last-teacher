"use client";

import { useEffect, useRef } from "react";

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
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <section className={`w-full h-full bg-white flex flex-col min-h-0 ${className}`}>
      <textarea
        ref={ref}
        aria-label="Writing area"
        placeholder={placeholder}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="flex-1 pt-3 w-full h-full resize-none border-0 outline-none focus:outline-none focus:ring-0 bg-transparent text-[#111] leading-snug overflow-auto hide-scrollbar caret-[#888] focus:caret-black caret-blink selection:bg-[#b3b3b3] selection:text-black min-h-0"
        style={{ fontSize, fontFamily: "var(--font-libertinus), serif" }}
      />
    </section>
  );
}
