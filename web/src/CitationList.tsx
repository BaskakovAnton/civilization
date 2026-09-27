import { useState } from "react";
import type { Citation } from "./types";

const kindRu: Record<Citation["kind"], string> = {
  verse: "стих",
  inscription: "надпись",
  josephus: "Иосиф",
  web: "web",
  handbook: "handbook",
};

const COLLAPSE_AFTER = 2;

export default function CitationList({ items }: { items?: Citation[] }) {
  const [open, setOpen] = useState(false);
  if (!items?.length) return null;

  const needsCollapse = items.length > COLLAPSE_AFTER;
  const visible =
    !needsCollapse || open ? items : items.slice(0, COLLAPSE_AFTER);
  const hidden = items.length - visible.length;

  return (
    <div className="citations-block">
      <ul className="citations">
        {visible.map((c) => (
          <li key={c.id}>
            <span className="src-type">{kindRu[c.kind]}</span>
            {c.url ? (
              <a href={c.url} target="_blank" rel="noreferrer">
                {c.label_ru}
              </a>
            ) : (
              <span>{c.label_ru}</span>
            )}
            {c.ref ? <code className="id">{c.ref}</code> : null}
          </li>
        ))}
      </ul>
      {needsCollapse ? (
        <button
          type="button"
          className="linkish citations-more"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "свернуть ссылки" : `ещё ${hidden} ссылк.`}
        </button>
      ) : null}
    </div>
  );
}
