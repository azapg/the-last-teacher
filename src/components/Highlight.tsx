"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type HighlightProps = {
  children: React.ReactNode;
  tip?: string;
  className?: string;
  as?: "mark" | "span";
};

export function Highlight({ children, tip, className, as = "mark" }: HighlightProps) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const Tag = as as any;

  const close = useCallback(() => {
    setPinned(false);
    setOpen(false);
  }, []);

  const suppressCloseRef = useRef(false);

  useEffect(() => {
    const onDocPointerDown = (e: PointerEvent) => {
      if (!pinned) return;
      const el = triggerRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      close();
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    return () => document.removeEventListener("pointerdown", onDocPointerDown, true);
  }, [pinned, close]);

  const onMouseEnter = () => setOpen(true);
  const onMouseLeave = () => {
    if (!pinned) setOpen(false);
  };

  const onPointerDown: React.PointerEventHandler<HTMLElement> = () => {
    if (!tip) return;
    suppressCloseRef.current = true;
    setPinned((p) => !p);
    setOpen(true);
    requestAnimationFrame(() => {
      suppressCloseRef.current = false;
    });
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      suppressCloseRef.current = true;
      setPinned((p) => !p);
      setOpen(true);
      requestAnimationFrame(() => {
        suppressCloseRef.current = false;
      });
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  const triggerEl = (
    <Tag
      ref={triggerRef as any}
      className={cn("rounded-sm px-0.5", className)}
      tabIndex={0}
      aria-expanded={open}
      aria-pressed={pinned || undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    >
      {children}
    </Tag>
  );

  if (!tip) return triggerEl;

  return (
    <Tooltip
      open={open}
      onOpenChange={(v) => {
        if ((pinned || suppressCloseRef.current) && v === false) return;
        setOpen(v);
      }}
    >
      <TooltipTrigger asChild>{triggerEl}</TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}
