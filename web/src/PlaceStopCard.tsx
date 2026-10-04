import type { Citation, Confidence, Place } from "./types";
import { confidenceHintRu, confidenceLabel } from "./types";

export type StopCardModel = {
  index: number;
  place_id: string;
  label_ru: string;
  confidence: Confidence;
  geo_note_ru?: string;
  place?: Place;
};

const PRIMARY = new Set(["verse", "inscription", "josephus", "handbook"]);

function splitCitations(place?: Place): {
  texts: Citation[];
  refs: Citation[];
} {
  const all = (place?.citations || []).filter((c) => c.url);
  return {
    texts: all.filter((c) => PRIMARY.has(c.kind)),
    refs: all.filter((c) => !PRIMARY.has(c.kind)),
  };
}

type Props = {
  stop: StopCardModel;
  onClose: () => void;
  larkinHref?: string;
};

export default function PlaceStopCard({ stop, onClose, larkinHref }: Props) {
  const { texts, refs } = splitCitations(stop.place);
  const note = stop.geo_note_ru || stop.place?.note_ru || "";

  return (
    <div className="jm-card" role="dialog" aria-label={stop.label_ru}>
      <div className="jm-card-head">
        <div>
          <p className="jm-card-kicker">
            Точка {stop.index + 1} · {stop.place_id}
          </p>
          <h2 className="jm-card-title">{stop.label_ru}</h2>
        </div>
        <button type="button" className="jm-btn" onClick={onClose}>
          Закрыть
        </button>
      </div>

      <p className={`jm-badge ${stop.confidence}`}>
        {confidenceLabel[stop.confidence]}
      </p>
      <p className="jm-card-hint">{confidenceHintRu[stop.confidence]}</p>
      {note ? <p className="jm-card-note">{note}</p> : null}

      <section className="jm-card-block">
        <h3>Тексты (первоисточник)</h3>
        {texts.length ? (
          <ul>
            {texts.map((c) => (
              <li key={c.id}>
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  {c.label_ru}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="jm-card-empty">Стихи/handbook для точки ещё не заведены.</p>
        )}
      </section>

      <section className="jm-card-block">
        <h3>Справки</h3>
        {refs.length ? (
          <ul>
            {refs.map((c) => (
              <li key={c.id}>
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  {c.label_ru}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="jm-card-empty">Нет вторичных ссылок.</p>
        )}
      </section>

      {larkinHref ? (
        <p className="jm-card-bridge">
          <a href={larkinHref}>Открыть в схеме «Как Larkin»</a>
        </p>
      ) : null}
    </div>
  );
}
