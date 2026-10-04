import { useEffect, useMemo, useRef, useState } from "react";
import genealogy from "../../data/jesus_genealogy_matt.json";
import candidatesFile from "../../data/candidates/people.json";
import { confidenceHintRu, confidenceLabel, type Confidence } from "./types";

type GeneNode = {
  id: string;
  label_ru: string;
  verse: string;
  verse_text_ru: string;
  person_id?: string;
  confidence: Confidence;
  note_ru?: string;
};

type Segment = {
  id: string;
  label_ru: string;
  from_index: number;
  to_index: number;
};

const nodes = genealogy.nodes as GeneNode[];
const segments = (genealogy.segments ?? []) as Segment[];

const personById = Object.fromEntries(
  (
    candidatesFile.people as {
      id: string;
      note_ru?: string;
      label_ru: string;
      confidence: Confidence;
    }[]
  ).map((p) => [p.id, p])
);

function pageHref(file: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? `${base}${file}` : `${base}/${file}`;
}

/** Exclusive column ranges so shared hinge names aren’t duplicated. */
function segmentColumns(segs: Segment[]): { seg: Segment; items: GeneNode[] }[] {
  return segs.map((seg, si) => {
    const start = si === 0 ? seg.from_index : seg.from_index + 1;
    const end = seg.to_index;
    return { seg, items: nodes.slice(start, end + 1) };
  });
}

function FlowConnector({ label }: { label?: string }) {
  return (
    <div className="gg-flow-connector" aria-hidden="true">
      <span className="gg-flow-line" />
      {label ? <span className="gg-flow-edge-label">{label}</span> : null}
      <span className="gg-flow-arrowhead" />
    </div>
  );
}

export default function GenealogyMattPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const selected = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [selectedId]
  );
  const selectedIndex = selected
    ? nodes.findIndex((n) => n.id === selected.id)
    : -1;
  const parent = selectedIndex > 0 ? nodes[selectedIndex - 1] : null;
  const child =
    selectedIndex >= 0 && selectedIndex < nodes.length - 1
      ? nodes[selectedIndex + 1]
      : null;
  const person = selected?.person_id
    ? personById[selected.person_id]
    : undefined;

  const columns = useMemo(() => segmentColumns(segments), []);

  useEffect(() => {
    if (!selectedId) return;
    nodeRefs.current[selectedId]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedId]);

  return (
    <div className="gg-page">
      <header className="gg-chrome">
        <div className="gg-chrome-titles">
          <h1 className="gg-brand">{genealogy.label_ru}</h1>
          <p className="gg-meta">
            Блок-схема · {genealogy.translation_label_ru} · literary · клик по
            блоку
          </p>
        </div>
        <nav className="gg-nav">
          <a href={pageHref("index.html")}>←</a>
          <a className="gg-btn" href={pageHref("jesus.html")}>
            Карта
          </a>
        </nav>
      </header>

      <p className="gg-note">{genealogy.note_ru}</p>

      <div className="gg-body">
        <div className="gg-flowchart" aria-label="Блок-схема родословия Мф 1">
          {columns.map(({ seg, items }, colIdx) => (
            <section key={seg.id} className="gg-flow-col">
              <header className="gg-flow-col-head">
                <span className="gg-flow-col-n">{colIdx + 1}</span>
                <h2>{seg.label_ru}</h2>
              </header>
              <ol className="gg-flow">
                {items.map((n, i) => {
                  const globalIndex = nodes.findIndex((x) => x.id === n.id);
                  const isStart = globalIndex === 0;
                  const isEnd = globalIndex === nodes.length - 1;
                  const shape = isStart
                    ? "terminal-start"
                    : isEnd
                      ? "terminal-end"
                      : "process";
                  return (
                    <li key={n.id} className="gg-flow-item">
                      {i > 0 ? <FlowConnector label="родил" /> : null}
                      <button
                        type="button"
                        ref={(el) => {
                          nodeRefs.current[n.id] = el;
                        }}
                        className={
                          selectedId === n.id
                            ? `gg-block gg-block-${shape} is-active`
                            : `gg-block gg-block-${shape}`
                        }
                        onClick={() => setSelectedId(n.id)}
                      >
                        <span className="gg-block-n">{globalIndex + 1}</span>
                        <span className="gg-block-label">{n.label_ru}</span>
                        <span className="gg-block-verse">Мф {n.verse}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>

        {selected ? (
          <aside
            className="gg-card"
            role="dialog"
            aria-label={selected.label_ru}
          >
            <div className="gg-card-head">
              <div>
                <p className="gg-card-kicker">Мф {selected.verse}</p>
                <h2 className="gg-card-title">{selected.label_ru}</h2>
              </div>
              <button
                type="button"
                className="gg-btn"
                onClick={() => setSelectedId(null)}
              >
                Закрыть
              </button>
            </div>

            <p className={`gg-badge ${selected.confidence}`}>
              {confidenceLabel[selected.confidence]}
            </p>
            <p className="gg-card-hint">
              {confidenceHintRu[selected.confidence]}
            </p>

            <section className="gg-card-block">
              <h3>Текст стиха</h3>
              <p className="gg-verse-text">{selected.verse_text_ru}</p>
            </section>

            {(selected.note_ru || person?.note_ru) && (
              <section className="gg-card-block">
                <h3>Заметка</h3>
                {selected.note_ru ? <p>{selected.note_ru}</p> : null}
                {person?.note_ru && person.note_ru !== selected.note_ru ? (
                  <p>{person.note_ru}</p>
                ) : null}
              </section>
            )}

            <section className="gg-card-block">
              <h3>В цепи</h3>
              <ul className="gg-rel">
                {parent ? (
                  <li>
                    ← {parent.label_ru}{" "}
                    <button
                      type="button"
                      className="gg-linkish"
                      onClick={() => setSelectedId(parent.id)}
                    >
                      открыть
                    </button>
                  </li>
                ) : (
                  <li>Начало цепочки</li>
                )}
                {child ? (
                  <li>
                    → {child.label_ru}{" "}
                    <button
                      type="button"
                      className="gg-linkish"
                      onClick={() => setSelectedId(child.id)}
                    >
                      открыть
                    </button>
                  </li>
                ) : (
                  <li>Конец цепочки</li>
                )}
              </ul>
            </section>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
