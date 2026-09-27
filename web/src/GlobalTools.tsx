import { useMemo, useState } from "react";
import type { CandidatePerson, Epoch, HistEvent } from "./types";
import { shortestPersonPath } from "./graphPath";
import type { Edge } from "./graphPath";

type LensMeta = {
  id: string;
  label_ru: string;
  description_ru: string;
};

type Props = {
  people: CandidatePerson[];
  epochs: Epoch[];
  edges: Edge[];
  events: HistEvent[];
  focusPersonId: string | null;
  lensId: string;
  lenses: LensMeta[];
  onLensChange: (id: string) => void;
  onJumpToPerson: (personId: string, epochId: string) => void;
  onJumpToEpoch: (epochId: string) => void;
};

export default function GlobalTools({
  people,
  epochs,
  edges,
  events,
  focusPersonId,
  lensId,
  lenses,
  onLensChange,
  onJumpToPerson,
  onJumpToEpoch,
}: Props) {
  const [query, setQuery] = useState("");
  const [pathFrom, setPathFrom] = useState("paul_of_tarsus");
  const [pathTo, setPathTo] = useState("abraham");
  const epochById = useMemo(
    () => Object.fromEntries(epochs.map((e) => [e.id, e])),
    [epochs]
  );
  const personById = useMemo(
    () => Object.fromEntries(people.map((p) => [p.id, p])),
    [people]
  );

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return people
      .filter(
        (p) =>
          p.label_ru.toLowerCase().includes(q) ||
          p.id.includes(q) ||
          (p.theographic_slug || "").includes(q)
      )
      .slice(0, 8);
  }, [people, query]);

  const path = useMemo(
    () => shortestPersonPath(edges, pathFrom, pathTo),
    [edges, pathFrom, pathTo]
  );

  const focusEvents = useMemo(() => {
    if (!focusPersonId) return [];
    return events
      .filter((e) => e.person_ids?.includes(focusPersonId))
      .slice(0, 6);
  }, [events, focusPersonId]);

  const focusPerson = focusPersonId ? personById[focusPersonId] : null;

  return (
    <section className="global-tools">
      <div className="tools-grid">
        <div>
          <h3>Поиск лица</h3>
          <input
            className="tools-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="например: Пилат, moses…"
            aria-label="Поиск лица"
          />
          {hits.length > 0 && (
            <ul className="tools-hits">
              {hits.map((p) => {
                const ep = p.epoch_ids[0];
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => {
                        onJumpToPerson(p.id, ep);
                        setQuery("");
                      }}
                    >
                      {p.label_ru}
                    </button>
                    <span className="tools-muted">
                      {epochById[ep]?.label_ru ?? ep}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <h3>Путь A → B</h3>
          <div className="tools-row">
            <select
              className="tools-input"
              value={pathFrom}
              onChange={(e) => setPathFrom(e.target.value)}
              aria-label="От кого"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label_ru}
                </option>
              ))}
            </select>
            <select
              className="tools-input"
              value={pathTo}
              onChange={(e) => setPathTo(e.target.value)}
              aria-label="К кому"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label_ru}
                </option>
              ))}
            </select>
          </div>
          <p className="tools-path">
            {path
              ? path
                  .map((id) => people.find((p) => p.id === id)?.label_ru ?? id)
                  .join(" → ")
              : "Пути по текущим рёбрам нет"}
          </p>
        </div>

        <div>
          <h3>Линза аудитории</h3>
          <select
            className="tools-input"
            value={lensId}
            onChange={(e) => onLensChange(e.target.value)}
            aria-label="Линза"
          >
            {lenses.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label_ru}
              </option>
            ))}
          </select>
          <p className="tools-muted">
            {lenses.find((l) => l.id === lensId)?.description_ru}
          </p>
        </div>

        <div>
          <h3>События выбранного лица</h3>
          {!focusPerson ? (
            <p className="tools-muted">
              Выберите лицо на графе или в списке эпохи.
            </p>
          ) : focusEvents.length === 0 ? (
            <p className="tools-muted">
              У «{focusPerson.label_ru}» нет curated-событий.
            </p>
          ) : (
            <ul className="tools-hits">
              {focusEvents.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    className="linkish"
                    onClick={() => onJumpToEpoch(e.epoch_id)}
                  >
                    {e.label_ru}
                  </button>
                  <span className="tools-muted">
                    {epochById[e.epoch_id]?.label_ru ?? e.epoch_id}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
