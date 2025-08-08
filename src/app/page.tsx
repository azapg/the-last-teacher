"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <main className="page">
      <style jsx global>{`
        .writer {
          width: 100%;
          height: 100dvh;
          background: #fff;
        }
        .writer textarea {
          /* create whitespace around the text area */
          margin: 10dvh 8vw;
          width: calc(100% - 16vw);
          height: calc(100dvh - 20dvh);
          resize: none;
          border: none;
          outline: none;
          background: transparent;
          color: #111;
          font: inherit;
          font-size: clamp(28px, 5vw, 48px);
          line-height: 1.35;
          caret-color: #888; /* subtle */
        }
        /* Blink caret effect to hint typing */
        .writer textarea:focus {
          caret-color: #000;
          animation: caretBlink 1.2s steps(2, start) infinite;
        }
        @keyframes caretBlink {
          50% { caret-color: transparent; }
        }
        ::placeholder { color: #c7c7c7; opacity: 1; }
      `}</style>

      <section className="writer">
        <textarea
          ref={ref}
          placeholder="Start typing..."
          aria-label="Writing area"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      </section>
    </main>
  );
}
