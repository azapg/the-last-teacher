"use client";

import { useEffect, useRef, useState } from "react";

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

  // Live analyzer configuration
  const ANALYZE_DELAY_MS = 5000;
  const PUNCTUATION = new Set([".", ",", "!", "?", ";", ":", "…", "—", ")", "]"]);

  // Internal state/refs to keep React renders minimal while typing
  const rawTextRef = useRef<string>("");
  const highlightsRef = useRef<import("@/lib/highlighter").HighlightItem[]>([]);
  const analyzeTimerRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Get absolute caret offset within the element's textContent
  const getCaretOffset = (el: HTMLDivElement): number => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0);
    // Create a range that spans from start to caret to measure text length
    const preRange = document.createRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.endContainer, range.endOffset);
    const s = preRange.toString();
    return s.length;
  };

  // Restore caret by absolute text offset
  const setCaretOffset = (el: HTMLDivElement, target: number) => {
    const sel = window.getSelection();
    if (!sel) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let node: Node | null = walker.nextNode();
    let remaining = target;

    while (node) {
      const len = node.textContent?.length ?? 0;
      if (remaining <= len) {
        const range = document.createRange();
        range.setStart(node, Math.max(0, remaining));
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= len;
      node = walker.nextNode();
    }

    // Fallback to end
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const escapeHtml = (s: string) =>
    s
      .replaceAll(/&/g, "&amp;")
      .replaceAll(/</g, "&lt;")
      .replaceAll(/>/g, "&gt;")
      .replaceAll(/"/g, "&quot;")
      .replaceAll(/'/g, "&#39;");

  // Build innerHTML with <mark> wrappers and native title tooltip
  const buildHTMLWithHighlights = (
    text: string,
    items: import("@/lib/highlighter").HighlightItem[]
  ): string => {
    const { computeHighlightRanges, splitByRanges, typeToClasses } = require("@/lib/highlighter");
    const ranges = computeHighlightRanges(text, items);
    const parts = splitByRanges(text, ranges);

    let html = "";
    for (const p of parts) {
      if (!p.range) {
        html += escapeHtml(p.text);
      } else {
        const cls = `${typeToClasses[p.range.item.type]} rounded-sm px-0.5`;
        const title = (p.range.item.hoverTip ?? "").trim();
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
        html += `<mark class="${cls}"${titleAttr}>${escapeHtml(p.text)}</mark>`;
      }
    }
    return html;
  };

  // Apply highlights by patching the DOM, preserving caret and placeholder state
  const applyHighlights = (items: import("@/lib/highlighter").HighlightItem[]) => {
    const el = ref.current;
    if (!el) return;
    const text = rawTextRef.current;

    const caret = getCaretOffset(el);
    // whitespace-pre-wrap ensures \n are rendered; keep raw text as-is
    el.innerHTML = buildHTMLWithHighlights(text, items);
    // Restore caret to best-effort same absolute offset
    setCaretOffset(el, Math.min(caret, text.length));

    el.dataset.empty = computeEmpty(el) ? "true" : "false";
  };

  // Debounced schedule
  const scheduleAnalyze = () => {
    if (analyzeTimerRef.current) {
      window.clearTimeout(analyzeTimerRef.current);
      analyzeTimerRef.current = null;
    }
    analyzeTimerRef.current = window.setTimeout(() => {
      void analyzeNow();
    }, ANALYZE_DELAY_MS);
  };

  const analyzeNow = async () => {
    if (loading) return; // avoid concurrent runs
    const el = ref.current;
    if (!el) return;

    const text = rawTextRef.current;
    if (!text) {
      // If empty, clear highlights
      highlightsRef.current = [];
      applyHighlights([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json().catch(() => ({ items: [] }));
      const items = Array.isArray(data.items) ? data.items : [];
      highlightsRef.current = items;
      applyHighlights(items);
    } catch {
      // Swallow errors for now; keep previous view untouched
    } finally {
      setLoading(false);
    }
  };

  // Update raw text and empty state on input
  const handleInput = () => {
    const el = ref.current;
    if (!el) return;
    rawTextRef.current = el.textContent ?? "";
    el.dataset.empty = computeEmpty(el) ? "true" : "false";
    scheduleAnalyze();
  };

  // Force plain-text paste
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

  // Trigger analyze immediately when typing punctuation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Ignore modified keys/controls
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key;
    if (PUNCTUATION.has(key)) {
      // Wait for the input event to apply the character, then analyze
      if (analyzeTimerRef.current) {
        window.clearTimeout(analyzeTimerRef.current);
        analyzeTimerRef.current = null;
      }
      window.setTimeout(() => {
        // Ensure rawTextRef is up-to-date after input
        const el = ref.current;
        if (el) rawTextRef.current = el.textContent ?? "";
        void analyzeNow();
      }, 0);
    }
  };

  useEffect(() => {
    const el = ref.current;
    el?.focus();
    if (el) {
      rawTextRef.current = el.textContent ?? "";
      el.dataset.empty = computeEmpty(el) ? "true" : "false";
      if (el.dataset.empty === "true") {
        placeCaretAtStart(el);
      }
    }
    return () => {
      if (analyzeTimerRef.current) window.clearTimeout(analyzeTimerRef.current);
    };
  }, []);

  return (
    <section className={`w-full h-full bg-white flex flex-col min-h-0 relative ${className}`}>
      {/* Loading spinner */}
      {loading && (
        <div
          aria-live="polite"
          aria-label="Analyzing"
          className="absolute top-2 right-2 text-gray-500"
          style={{ fontFamily: "var(--font-host-grotesk), system-ui" }}
        >
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="9" strokeOpacity="0.2" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 1-9 9" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      )}

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
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className="
          flex-1 pt-3 w-full h-full resize-none border-0 outline-none focus:outline-none focus:ring-0
          bg-transparent text-[#111] leading-snug overflow-auto hide-scrollbar caret-[#888] focus:caret-black
          caret-blink selection:bg-[#b3b3b3] selection:text-black min-h-0 whitespace-pre-wrap
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
