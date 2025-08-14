"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  computeEmpty,
  placeCaretAtStart,
  getCaretOffset,
  setCaretOffset,
  escapeHtml,
} from "@/lib/html";
import type { HighlightItem } from "@/lib/highlighter";

export type UseLiveAnalyzerOptions = {
  analyzeDelayMs?: number;
  punctuation?: string[]; // characters that trigger immediate analyze
};

export function useLiveAnalyzer(
  editorRef: React.RefObject<HTMLDivElement | null>,
  { analyzeDelayMs = 5000, punctuation = [".", ",", "!", "?", ";", ":", "…", "—", ")", "]"] }: UseLiveAnalyzerOptions = {}
) {
  const rawTextRef = useRef<string>("");
  const highlightsRef = useRef<HighlightItem[]>([]);
  const analyzeTimerRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const applyHighlights = useCallback((items: HighlightItem[]) => {
    const el = editorRef.current;
    if (!el) return;
    const text = rawTextRef.current;
    const caret = getCaretOffset(el);
    el.innerHTML = buildHTMLWithHighlights(text, items);
    setCaretOffset(el, Math.min(caret, text.length));
    el.dataset.empty = computeEmpty(el) ? "true" : "false";
  }, [editorRef]);

  const clearTimer = () => {
    if (analyzeTimerRef.current) {
      window.clearTimeout(analyzeTimerRef.current);
      analyzeTimerRef.current = null;
    }
  };

  const analyzeNow = useCallback(async () => {
    if (loading) return;
    const el = editorRef.current;
    if (!el) return;
    const text = rawTextRef.current;
    if (!text) {
      highlightsRef.current = [];
      applyHighlights([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, currentItems: highlightsRef.current, currentScore: score }),
      });
      const data = await res.json().catch(() => ({ items: [], score: 0 }));
      const items = Array.isArray(data.items) ? data.items : [];
      const newScore = typeof data.score === "number" ? data.score : 0;
      highlightsRef.current = items;
      applyHighlights(items);
      setScore(newScore);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [applyHighlights, editorRef, loading, score]);

  const scheduleAnalyze = useCallback(() => {
    clearTimer();
    analyzeTimerRef.current = window.setTimeout(() => {
      void analyzeNow();
    }, analyzeDelayMs);
  }, [analyzeDelayMs, analyzeNow]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    rawTextRef.current = el.textContent ?? "";
    el.dataset.empty = computeEmpty(el) ? "true" : "false";
    scheduleAnalyze();
  }, [editorRef, scheduleAnalyze]);

  const handlePaste = useCallback((e: any) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") ?? "";
    document.execCommand("insertText", false, text);
    if (text.trim().length > 0) {
      clearTimer();
      window.setTimeout(() => {
        const el = editorRef.current;
        if (el) rawTextRef.current = el.textContent ?? "";
        void analyzeNow();
      }, 0);
    }
  }, [analyzeNow, editorRef]);

  const punctuationSetRef = useRef<Set<string> | null>(null);
  if (!punctuationSetRef.current) punctuationSetRef.current = new Set(punctuation);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key;
    if (punctuationSetRef.current?.has(key)) {
      clearTimer();
      window.setTimeout(() => {
        const el = editorRef.current;
        if (el) rawTextRef.current = el.textContent ?? "";
        void analyzeNow();
      }, 0);
    }
  }, [analyzeNow, editorRef]);

  const handleFocus = useCallback(() => {
    const el = editorRef.current;
    if (el && computeEmpty(el)) {
      placeCaretAtStart(el);
    }
  }, [editorRef]);

  useEffect(() => {
    const el = editorRef.current;
    el?.focus();
    if (el) {
      rawTextRef.current = el.textContent ?? "";
      el.dataset.empty = computeEmpty(el) ? "true" : "false";
      if (el.dataset.empty === "true") placeCaretAtStart(el);
    }
    return () => clearTimer();
  }, [editorRef]);

  return {
    loading,
    score,
    handlers: {
      onInput: handleInput,
      onPaste: handlePaste,
      onFocus: handleFocus,
      onKeyDown: handleKeyDown,
    },
  };
}

function buildHTMLWithHighlights(text: string, items: HighlightItem[]): string {
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
}
