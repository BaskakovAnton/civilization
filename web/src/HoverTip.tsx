import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import type { Confidence } from "./types";
import { confidenceHintRu, confidenceLabel } from "./types";

type HoverTipProps = {
  title: string;
  lines?: string[];
  children: ReactElement;
  placement?: "below" | "above";
};

type TipHandlers = {
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onClick?: (e: MouseEvent) => void;
  "aria-describedby"?: string;
};

function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const apply = () => setCoarse(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return coarse;
}

export default function HoverTip({
  title,
  lines = [],
  children,
  placement = "below",
}: HoverTipProps) {
  const tipId = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const coarse = useCoarsePointer();
  const body: ReactNode[] = lines.filter(Boolean);

  useEffect(() => {
    if (!open || !coarse) return;
    const onDoc = (e: Event) => {
      const el = wrapRef.current;
      if (!el) return;
      const t = e.target as Node | null;
      if (t && el.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [open, coarse]);

  if (!isValidElement(children)) return children;

  const prev = children.props as TipHandlers;

  const child = cloneElement(children, {
    ...prev,
    "aria-describedby": open ? tipId : undefined,
    onMouseEnter: (e: MouseEvent) => {
      if (!coarse) setOpen(true);
      prev.onMouseEnter?.(e);
    },
    onMouseLeave: (e: MouseEvent) => {
      if (!coarse) setOpen(false);
      prev.onMouseLeave?.(e);
    },
    onFocus: (e: FocusEvent) => {
      setOpen(true);
      prev.onFocus?.(e);
    },
    onBlur: (e: FocusEvent) => {
      if (!coarse) setOpen(false);
      prev.onBlur?.(e);
    },
    onClick: (e: MouseEvent) => {
      if (coarse) setOpen((v) => !v);
      prev.onClick?.(e);
    },
  } as TipHandlers);

  return (
    <span className={`hover-tip-wrap${open ? " open" : ""}`} ref={wrapRef}>
      {child}
      {open ? (
        <span
          id={tipId}
          role="tooltip"
          className={`hover-tip ${placement === "above" ? "above" : "below"}`}
        >
          <strong className="hover-tip-title">{title}</strong>
          {body.map((line, i) => (
            <span key={i} className="hover-tip-line">
              {line}
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
}

export function ConfPill({
  level,
  extraLines,
  className = "",
}: {
  level: Confidence;
  extraLines?: string[];
  className?: string;
}) {
  return (
    <HoverTip
      title={confidenceLabel[level]}
      lines={[confidenceHintRu[level], ...(extraLines || [])]}
    >
      <span
        className={`pill conf-${level}${className ? ` ${className}` : ""}`}
        tabIndex={0}
      >
        {confidenceLabel[level]}
      </span>
    </HoverTip>
  );
}
