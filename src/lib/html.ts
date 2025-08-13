// Detect true emptiness (like <textarea>): newline-only counts as content
export function computeEmpty(el: HTMLDivElement) {
  const text = el.textContent ?? "";
  if (text.length > 0) return false;
  const html = (el.innerHTML ?? "").replace(/\u200B/g, "");
  return html === "" || html === "<br>";
}

// Place caret at index 0 (start)
export function placeCaretAtStart(el: HTMLDivElement) {
  const sel = window.getSelection();
  if (!sel) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

// Get absolute caret offset within the element's textContent
export function getCaretOffset(el: HTMLDivElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);
  // Create a range that spans from start to caret to measure text length
  const preRange = document.createRange();
  preRange.selectNodeContents(el);
  preRange.setEnd(range.endContainer, range.endOffset);
  const s = preRange.toString();
  return s.length;
}

// Restore caret by absolute text offset
export function setCaretOffset(el: HTMLDivElement, target: number) {
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
}

// Escape HTML special characters for safe innerHTML
export function escapeHtml(s: string) {
  return s
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/"/g, "&quot;")
    .replaceAll(/'/g, "&#39;");
}
