import type { Citation } from "./types";

const kindRu: Record<Citation["kind"], string> = {
  verse: "стих",
  inscription: "надпись",
  josephus: "Иосиф",
  web: "web",
  handbook: "handbook",
};

export default function CitationList({ items }: { items?: Citation[] }) {
  if (!items?.length) return null;
  return (
    <ul className="citations">
      {items.map((c) => (
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
  );
}
