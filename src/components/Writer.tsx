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
  const ref = useRef<HTMLDivElement>(null);

  // Detect true emptiness (like <textarea>): newline-only counts as content
  const computeEmpty = (el: HTMLDivElement) => {
    const text = el.textContent ?? "";
    if (text.length > 0) return false;
    const html = (el.innerHTML ?? "").replace(/\u200B/g, "");
    return html === "" || html === "<br>";
  };

  // Place caret at index 0 (start)
  const placeCaretAtStart = (el: HTMLDivElement) => {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  // Update empty state for placeholder visibility
  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    el.dataset.empty = computeEmpty(el) ? "true" : "false";
  };

  // Force plain-text paste (guards browsers without plaintext-only support)
  const handlePaste = (e: any) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") ?? "";
    document.execCommand("insertText", false, text);
  };

  const handleFocus = () => {
    const el = ref.current;
    if (el && computeEmpty(el)) {
      placeCaretAtStart(el);
    }
  };

  useEffect(() => {
    const el = ref.current;
    el?.focus();
    if (el) {
      el.dataset.empty = computeEmpty(el) ? "true" : "false";
      if (el.dataset.empty === "true") {
        placeCaretAtStart(el);
      }
    }
  }, []);

  return (
    <section className={`w-full h-full bg-white flex flex-col min-h-0 ${className}`}>
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-label="Writing area"
        // contentEditable in plain-text mode to avoid rich formatting
        {...({ contentEditable: "plaintext-only" } as any)}
        suppressContentEditableWarning
        spellCheck={false}
        {...({ autoCorrect: "off", autoCapitalize: "off" } as any)}
        data-empty="true"
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={handleFocus}
        className="
          flex-1 pt-3 w-full h-full resize-none border-0 outline-none focus:outline-none focus:ring-0
          bg-transparent text-[#111] leading-snug overflow-auto hide-scrollbar caret-[#888] focus:caret-black
          caret-blink selection:bg-[#b3b3b3] selection:text-black min-h-0
          relative
          before:absolute before:inset-x-0 before:top-3 before:block before:pointer-events-none
          before:text-[#9ca3af] before:whitespace-pre-wrap before:content-[attr(data-placeholder)]
          data-[empty=false]:before:content-[''] data-[empty=false]:before:hidden
        "
        style={{ fontSize, fontFamily: "var(--font-libertinus), serif" }}
      />
    </section>
  );
}
