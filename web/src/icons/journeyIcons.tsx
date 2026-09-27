/** Inline SVG icons for Jesus path UI (A08–A11 + helpers). */

type IconProps = { className?: string; title?: string };

export function IconPin({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden width="1em" height="1em">
      <path
        fill="currentColor"
        d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
      />
    </svg>
  );
}

export function IconHelp({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden width="1em" height="1em">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M9.6 9.2a2.6 2.6 0 1 1 3.7 2.4c-.7.4-1.3 1-1.3 1.9V14"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden width="1em" height="1em">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M6 6l12 12M18 6L6 18"
      />
    </svg>
  );
}

export function IconChevron({
  className,
  dir = "right",
}: IconProps & { dir?: "right" | "down" | "left" }) {
  const rot = dir === "down" ? 90 : dir === "left" ? 180 : 0;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      width="1em"
      height="1em"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6l6 6-6 6"
      />
    </svg>
  );
}

/** Nav icon from generated sprite sheet (5 equal cells). */
export function NavSpriteIcon({
  index,
  className,
}: {
  index: 0 | 1 | 2 | 3 | 4;
  className?: string;
}) {
  const pct = index * 25;
  return (
    <span
      className={`jp-nav-sprite${className ? ` ${className}` : ""}`}
      style={{ backgroundPosition: `${pct}% 50%` }}
      aria-hidden
    />
  );
}
