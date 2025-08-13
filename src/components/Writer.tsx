"use client";

import { useEffect, useRef, useState } from "react";
import { WritingBar } from "./WritingBar";

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

  // Live analyzer configuration
  const ANALYZE_DELAY_MS = 5000;
  const PUNCTUATION = new Set([".", ",", "!", "?", ";", ":", "…", "—", ")", "]"]);

  // Internal state/refs to keep React renders minimal while typing
  const rawTextRef = useRef<string>("");
  const highlightsRef = useRef<import("@/lib/highlighter").HighlightItem[]>([]);
  const analyzeTimerRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [writingScore, setWritingScore] = useState(0);

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

  // Build innerHTML with <mark> wrappers and our own tooltip wiring (data-tip)
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
        const cls = `${typeToClasses[p.range.item.type]} rounded-sm px-0.5 pointer-events-auto`;
        const tip = (p.range.item.hoverTip ?? "").trim();
        const tipAttr = tip ? ` data-tip="${escapeHtml(tip)}"` : "";
        html += `<mark class="${cls}" data-highlight="true"${tipAttr}>${escapeHtml(p.text)}</mark>`;
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
    el.innerHTML = buildHTMLWithHighlights(text, items);
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
        body: JSON.stringify({ text, currentItems: highlightsRef.current, currentScore: writingScore }),
      });
      const data = await res.json().catch(() => ({ items: [], score: 0 }));
      const items = Array.isArray(data.items) ? data.items : [];
      const score = typeof data.score === "number" ? data.score : 0;
      highlightsRef.current = items;
      applyHighlights(items);
      setWritingScore(score);
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
    
    // Trigger immediate analysis after paste (similar to punctuation behavior)
    if (text.trim().length > 0) {
      // Cancel any pending analysis to avoid double analysis
      if (analyzeTimerRef.current) {
        window.clearTimeout(analyzeTimerRef.current);
        analyzeTimerRef.current = null;
      }
      // Update rawTextRef and trigger analysis after DOM update
      window.setTimeout(() => {
        const el = ref.current;
        if (el) rawTextRef.current = el.textContent ?? "";
        void analyzeNow();
      }, 0);
    }
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

  // Delegated tooltip for marks (hover + click-to-pin)
  const tooltipElRef = useRef<HTMLDivElement | null>(null);
  const pinnedTargetRef = useRef<HTMLElement | null>(null);
  const hoverTargetRef = useRef<HTMLElement | null>(null);

  const ensureTooltipEl = () => {
    if (tooltipElRef.current) return tooltipElRef.current;
    const host = document.createElement("div");
    host.style.position = "absolute";
    host.style.zIndex = "50";
    host.style.display = "none";
    // Match TooltipContent styling (simplified)
    host.className =
      "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md px-3 py-1.5 text-xs shadow-sm";
    // Optional arrow
    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    arrow.setAttribute("viewBox", "0 0 8 8");
    arrow.setAttribute("class", "absolute -top-2 left-1/2 -translate-x-1/2 size-2");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M0 8 L4 0 L8 8 Z");
    path.setAttribute("fill", "currentColor");
    arrow.appendChild(path);
    host.appendChild(arrow);

    const content = document.createElement("div");
    content.setAttribute("data-content", "true");
    host.appendChild(content);

    const wrapper = wrapperRef.current;
    (wrapper ?? document.body).appendChild(host);
    tooltipElRef.current = host;
    return host;
  };

  const positionTooltip = (target: HTMLElement) => {
    const tooltip = ensureTooltipEl();
    const wrapper = wrapperRef.current;
    const wrapRect = (wrapper ?? document.body).getBoundingClientRect();
    const rect = target.getBoundingClientRect();

    const top = rect.bottom - wrapRect.top + 6; // 6px gap
    const left = rect.left - wrapRect.left + rect.width / 2;

    tooltip.style.display = "block";
    tooltip.style.top = `${Math.round(top)}px`;
    // Center by translating half width (we can't know width yet, so use transform)
    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.transform = "translateX(-50%)";
  };

  const showTooltipFor = (target: HTMLElement) => {
    const tooltip = ensureTooltipEl();
    const tip = target.getAttribute("data-tip") || "";
    const content = tooltip.querySelector('[data-content="true"]') as HTMLDivElement | null;
    if (content) content.textContent = tip;
    positionTooltip(target);
  };

  const hideTooltip = () => {
    const tooltip = ensureTooltipEl();
    tooltip.style.display = "none";
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const editor = ref.current;
    if (!wrapper || !editor) return;

    const isMark = (el: Element | null): el is HTMLElement =>
      !!el && el instanceof HTMLElement && el.matches('mark[data-highlight][data-tip]');

    const onPointerDown = (e: PointerEvent) => {
      const target = (e.target as Element)?.closest('mark[data-highlight][data-tip]') as HTMLElement | null;
      if (target) {
        // Toggle pin on the clicked mark
        if (pinnedTargetRef.current === target) {
          pinnedTargetRef.current = null;
          hideTooltip();
        } else {
          pinnedTargetRef.current = target;
          showTooltipFor(target);
        }
        return;
      }
      // Click outside closes pin
      if (pinnedTargetRef.current) {
        pinnedTargetRef.current = null;
        hideTooltip();
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      if (pinnedTargetRef.current) return;
      const target = (e.target as Element)?.closest('mark[data-highlight][data-tip]') as HTMLElement | null;
      if (target && isMark(target)) {
        hoverTargetRef.current = target;
        showTooltipFor(target);
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      if (pinnedTargetRef.current) return;
      const related = e.relatedTarget as Element | null;
      // If moving to another mark, let onMouseOver handle reposition
      if (related && isMark(related.closest('mark[data-highlight][data-tip]'))) return;
      hoverTargetRef.current = null;
      hideTooltip();
    };

    const onScrollOrResize = () => {
      const target = pinnedTargetRef.current || hoverTargetRef.current;
      if (target) showTooltipFor(target);
    };

    wrapper.addEventListener("pointerdown", onPointerDown);
    wrapper.addEventListener("mouseover", onMouseOver);
    wrapper.addEventListener("mouseout", onMouseOut);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      wrapper.removeEventListener("pointerdown", onPointerDown);
      wrapper.removeEventListener("mouseover", onMouseOver);
      wrapper.removeEventListener("mouseout", onMouseOut);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      // Do not remove tooltip element; it is reused between patches
    };
  }, []);

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
    <section ref={wrapperRef as any} className={`w-full h-full bg-white flex flex-col min-h-0 relative ${className}`}>
      {/* Loading spinner */}
      {loading && (
        <div
          aria-live="polite"
          aria-label="Analyzing"
          className="absolute top-2 right-2 text-gray-500 font-sans"
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
          font-serif
        "
        style={{ fontSize }}
      />

      {/* Writing Bar */}
      <WritingBar score={writingScore} />
    </section>
  );
}
