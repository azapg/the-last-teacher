export function LoadingSpinner() {
  return (
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
  );
}
