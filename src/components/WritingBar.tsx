import React from "react";

export function WritingBar({ score = 0 }: { score: number }) {
  return (
    <div
      className="pointer-events-none select-none w-full left-0 bottom-0 z-20"
      style={{
        position: "absolute",
        paddingBottom: "1.5rem",
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
      }}
    >
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 font-medium tracking-wide">Writing Quality</span>
          <span
            className="text-xs font-semibold"
            style={{
              color:
                score > 0.85
                  ? "#22c55e"
                  : score > 0.6
                  ? "#eab308"
                  : "#ef4444",
              transition: "color 0.3s",
            }}
          >
            {Math.round(score * 100)}
          </span>
        </div>
        <div className="relative h-3 rounded-full bg-gray-200 overflow-hidden shadow-inner">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.round(score * 100)}%`,
              background: `linear-gradient(90deg, #22c55e 0%, #eab308 60%, #ef4444 100%)`,
              boxShadow: score > 0.85 ? "0 0 8px #22c55e88" : undefined,
              transition: "width 0.7s cubic-bezier(.4,1.6,.4,1), box-shadow 0.3s",
            }}
            aria-valuenow={Math.round(score * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
          {/* Animated shine */}
          <div
            className="absolute left-0 top-0 h-full w-full pointer-events-none"
            style={{
              background:
                "linear-gradient(120deg, transparent 60%, rgba(255,255,255,0.25) 80%, transparent 100%)",
              animation: "shine 2.5s linear infinite",
              maskImage: `linear-gradient(90deg, black 80%, transparent 100%)`,
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes shine {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>
    </div>
  );
}
