"use client";

import { useEffect, useRef } from "react";

export function useHighlightTooltip<T extends HTMLElement>(wrapperRef: React.RefObject<T | null>) {
  const tooltipElRef = useRef<HTMLDivElement | null>(null);
  const pinnedTargetRef = useRef<HTMLElement | null>(null);
  const hoverTargetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const ensureTooltipEl = () => {
      if (tooltipElRef.current) return tooltipElRef.current;
      const host = document.createElement("div");
      host.style.position = "absolute";
      host.style.zIndex = "50";
      host.style.display = "none";
      host.className =
        "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md px-3 py-1.5 text-xs shadow-sm";
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
      (wrapper ?? document.body).appendChild(host);
      tooltipElRef.current = host;
      return host;
    };

    const positionTooltip = (target: HTMLElement) => {
      const tooltip = ensureTooltipEl();
      const wrapRect = (wrapper ?? document.body).getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const top = rect.bottom - wrapRect.top + 6;
      const left = rect.left - wrapRect.left + rect.width / 2;
      tooltip.style.display = "block";
      tooltip.style.top = `${Math.round(top)}px`;
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

    const isMark = (el: Element | null): el is HTMLElement =>
      !!el && el instanceof HTMLElement && el.matches('mark[data-highlight][data-tip]');

    const onPointerDown = (e: PointerEvent) => {
      const target = (e.target as Element)?.closest('mark[data-highlight][data-tip]') as HTMLElement | null;
      if (target) {
        if (pinnedTargetRef.current === target) {
          pinnedTargetRef.current = null;
          hideTooltip();
        } else {
          pinnedTargetRef.current = target;
          showTooltipFor(target);
        }
        return;
      }
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
    };
  }, [wrapperRef]);
}
