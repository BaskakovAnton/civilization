import { useState } from "react";
import type { Citation, Confidence, Place } from "./types";
import gospelPassages from "../../data/jesus_map_gospel_passages.json";

export type StopCardModel = {
  index: number;
  place_id: string;
  label_ru: string;
  confidence: Confidence;
  geo_note_ru?: string;
  place?: Place;
};

type GospelVersion = {
  translation_id: string;
  label_ru: string;
  text_ru: string;
};

type GospelPassage = {
  gospel: string;
  label_ru: string;
  versions: GospelVersion[];
};

type PlaceGospelBundle = {
  place_id: string;
  title_ru: string;
  passages: GospelPassage[];
};

const byPlace = (
  gospelPassages as { by_place: Record<string, PlaceGospelBundle> }
).by_place;

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
  locationArtHref?: string | null;
};

export default function PlaceStopCard({
  stop,
  onClose,
  locationArtHref,
}: Props) {
  const { texts, refs } = splitCitations(stop.place);
  const note = stop.geo_note_ru || "";
  const bundle = byPlace[stop.place_id];
  const passages = bundle?.passages ?? [];

  const [gospelIdx, setGospelIdx] = useState(0);
  const [translationId, setTranslationId] = useState("rst");

  const safeIdx = Math.min(gospelIdx, Math.max(0, passages.length - 1));
  const active = passages[safeIdx];
  const versions = active?.versions ?? [];
  const version =
    versions.find((v) => v.translation_id === translationId) ?? versions[0];

  return (
    <div className="jm-card" role="dialog" aria-modal="true" aria-label={stop.label_ru}>
      <div className="jm-card-head">
        <h2 className="jm-card-title">{stop.label_ru}</h2>
        <button type="button" className="jm-btn" onClick={onClose}>
          Закрыть
        </button>
      </div>

      {locationArtHref ? (
        <figure className="jm-loc-art">
          <img
            src={locationArtHref}
            alt={stop.label_ru}
            loading="lazy"
          />
        </figure>
      ) : null}

      {note ? <p className="jm-card-note">{note}</p> : null}

      <section className="jm-card-block jm-gospel-block">
        <h3>Евангелие</h3>
        {passages.length ? (
          <>
            <div className="jm-gospel-tabs" role="tablist" aria-label="Евангелия">
              {passages.map((p, i) => (
                <button
                  key={p.label_ru}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIdx}
                  className={
                    i === safeIdx ? "jm-gospel-tab is-active" : "jm-gospel-tab"
                  }
                  onClick={() => setGospelIdx(i)}
                >
                  {p.label_ru}
                </button>
              ))}
            </div>

            {versions.length > 1 ? (
              <div
                className="jm-trans-tabs"
                role="tablist"
                aria-label="Переводы"
              >
                {versions.map((v) => (
                  <button
                    key={v.translation_id}
                    type="button"
                    role="tab"
                    aria-selected={version?.translation_id === v.translation_id}
                    className={
                      version?.translation_id === v.translation_id
                        ? "jm-trans-tab is-active"
                        : "jm-trans-tab"
                    }
                    onClick={() => setTranslationId(v.translation_id)}
                  >
                    {v.label_ru}
                  </button>
                ))}
              </div>
            ) : null}

            {version?.text_ru ? (
              <pre className="jm-gospel-text">{version.text_ru}</pre>
            ) : (
              <p className="jm-card-empty">Текст перевода не найден.</p>
            )}
          </>
        ) : (
          <p className="jm-card-empty">
            Русский текст евангелия для этой точки ещё не заведён.
          </p>
        )}
      </section>

      {texts.length ? (
        <section className="jm-card-block">
          <h3>Ссылки на стихи</h3>
          <ul>
            {texts.map((c) => (
              <li key={c.id}>
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  {c.label_ru}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {refs.length ? (
        <section className="jm-card-block">
          <h3>Справки</h3>
          <ul>
            {refs.map((c) => (
              <li key={c.id}>
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  {c.label_ru}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
