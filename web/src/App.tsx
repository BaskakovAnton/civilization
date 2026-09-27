import { useEffect, useMemo, useState } from "react";
import epochs from "../../data/epochs.json";
import sources from "../../data/sources.json";
import interactionsData from "../../data/interactions.json";
import placesData from "../../data/places.json";
import eventsData from "../../data/events.json";
import patriarchal from "../../data/claims/by-epoch/patriarchal_horizon.json";
import exodus from "../../data/claims/by-epoch/exodus_emergence.json";
import earlyMonarchy from "../../data/claims/by-epoch/early_monarchy.json";
import divided from "../../data/claims/by-epoch/divided_kingdoms.json";
import assyria from "../../data/claims/by-epoch/assyria_to_exile.json";
import exile from "../../data/claims/by-epoch/exile_and_persian.json";
import hellenistic from "../../data/claims/by-epoch/hellenistic_hasmonean.json";
import roman from "../../data/claims/by-epoch/roman_herodian.json";
import jesus from "../../data/claims/by-epoch/jesus_jerusalem.json";
import pauline from "../../data/claims/by-epoch/pauline_networks.json";
import war from "../../data/claims/by-epoch/war_and_divergence.json";
import barKokhba from "../../data/claims/by-epoch/bar_kokhba.json";
import candidatesFile from "../../data/candidates/people.json";
import politiesData from "../../data/polities.json";
import universityLens from "../../data/lenses/university.json";
import conservativeLens from "../../data/lenses/conservative.json";
import minimalistLens from "../../data/lenses/minimalist.json";
import CitationList from "./CitationList";
import EpochGraph from "./EpochGraph";
import GlobalTools from "./GlobalTools";
import type {
  CandidatePerson,
  Claim,
  Confidence,
  Epoch,
  HistEvent,
  Interaction,
  Place,
  Source,
} from "./types";
import {
  confidenceLabel,
  formatSpan,
  formatYear,
  relationLabelRu,
} from "./types";

type Polity = {
  id: string;
  label_ru: string;
  epoch_ids: string[];
  confidence: Confidence;
  note_ru?: string;
  source_ids: string[];
  person_ids?: string[];
};

type LensFile = {
  id: string;
  label_ru: string;
  description_ru: string;
  claim_overrides?: Record<
    string,
    { confidence: Confidence; note_ru?: string }
  >;
};

const lenses: LensFile[] = [
  universityLens as LensFile,
  conservativeLens as LensFile,
  minimalistLens as LensFile,
];
const lensById = Object.fromEntries(lenses.map((l) => [l.id, l]));
const allPolities = politiesData as Polity[];

const allClaims: Claim[] = [
  ...(patriarchal as Claim[]),
  ...(exodus as Claim[]),
  ...(earlyMonarchy as Claim[]),
  ...(divided as Claim[]),
  ...(assyria as Claim[]),
  ...(exile as Claim[]),
  ...(hellenistic as Claim[]),
  ...(roman as Claim[]),
  ...(jesus as Claim[]),
  ...(pauline as Claim[]),
  ...(war as Claim[]),
  ...(barKokhba as Claim[]),
];

const epochList = epochs as Epoch[];
const sourceList = sources as Source[];
const sourceById = Object.fromEntries(sourceList.map((s) => [s.id, s]));
const candidatePeople = (candidatesFile as { people: CandidatePerson[] }).people;
const personById = Object.fromEntries(candidatePeople.map((p) => [p.id, p]));
const allInteractions = interactionsData as Interaction[];
const allPlaces = placesData as Place[];
const allEvents = eventsData as HistEvent[];
const placeById = Object.fromEntries(allPlaces.map((p) => [p.id, p]));

const josephusRu: Record<Epoch["josephus_role"], string> = {
  none: "нет",
  background: "фон",
  point: "точечно",
  primary: "основной нарратив",
};

function SourceList({ ids }: { ids: string[] }) {
  return (
    <ul className="sources">
      {ids.map((sid) => {
        const s = sourceById[sid];
        return (
          <li key={sid}>
            <strong>{s?.label_ru ?? sid}</strong>
            <span className="src-type">{s?.type ?? "?"}</span>
            {s?.tradition_note_ru && (
              <span className="src-note">{s.tradition_note_ru}</span>
            )}
            {s?.urls?.[0] && (
              <a href={s.urls[0]} target="_blank" rel="noreferrer">
                открыть
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function App() {
  const sorted = useMemo(
    () => [...epochList].sort((a, b) => a.order - b.order),
    []
  );
  const [selectedId, setSelectedId] = useState(sorted[0]?.id ?? "");
  const [focusPersonId, setFocusPersonId] = useState<string | null>(null);
  const [lensId, setLensId] = useState("university");
  const selected = sorted.find((e) => e.id === selectedId) ?? sorted[0];
  const lens = lensById[lensId] ?? lenses[0];
  const claimsRaw = allClaims.filter((c) => c.epoch_id === selected?.id);
  const claims = claimsRaw.map((c) => {
    const ov = lens.claim_overrides?.[c.id];
    if (!ov) return c;
    return {
      ...c,
      confidence: ov.confidence,
      dissent_ru: ov.note_ru
        ? `${ov.note_ru}${c.dissent_ru ? ` · ${c.dissent_ru}` : ""}`
        : c.dissent_ru,
    };
  });
  const people = candidatePeople.filter((p) =>
    selected ? p.epoch_ids.includes(selected.id) : false
  );
  const interactions = allInteractions.filter(
    (i) => i.epoch_id === selected?.id
  );
  const visibleInteractions = focusPersonId
    ? interactions.filter(
        (i) =>
          i.from_person_id === focusPersonId ||
          i.to_person_id === focusPersonId
      )
    : interactions;
  const places = allPlaces.filter((p) =>
    selected ? p.epoch_ids.includes(selected.id) : false
  );
  const events = allEvents.filter((e) => e.epoch_id === selected?.id);
  const polities = allPolities.filter((p) =>
    selected ? p.epoch_ids.includes(selected.id) : false
  );

  useEffect(() => {
    setFocusPersonId(null);
  }, [selectedId]);

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">civilization · historical-critical</p>
        <h1>Длинная дуга</h1>
        <p className="lede">
          Каркас из 12 эпох: граф, места, события, взаимодействия и источники.
          Default — университетский консенсус; линзы — сравнительный слой.
        </p>
      </header>

      <GlobalTools
        people={candidatePeople}
        epochs={sorted}
        edges={allInteractions}
        lensId={lensId}
        lenses={lenses}
        onLensChange={setLensId}
        onJumpToPerson={(personId, epochId) => {
          setSelectedId(epochId);
          setFocusPersonId(personId);
        }}
      />

      <div className="layout">
        <nav className="rail" aria-label="Эпохи">
          {sorted.map((e) => (
            <button
              key={e.id}
              type="button"
              className={e.id === selected?.id ? "epoch-btn active" : "epoch-btn"}
              onClick={() => setSelectedId(e.id)}
            >
              <span className="epoch-order">{e.order}</span>
              <span className="epoch-meta">
                <span className="epoch-title">{e.label_ru}</span>
                <span className={`pill conf-${e.confidence}`}>
                  {confidenceLabel[e.confidence as Confidence]}
                </span>
              </span>
            </button>
          ))}
        </nav>

        {selected && (
          <main className="detail">
            <div className="detail-head">
              <h2>{selected.label_ru}</h2>
              <code className="id">{selected.id}</code>
            </div>

            <dl className="facts">
              <div>
                <dt>Вилка</dt>
                <dd>
                  {formatSpan(
                    selected.year_start,
                    selected.year_end,
                    selected.span_note_ru
                  )}
                </dd>
              </div>
              <div>
                <dt>Базис дат</dt>
                <dd>{selected.date_basis_ru}</dd>
              </div>
              <div>
                <dt>Иосиф</dt>
                <dd>{josephusRu[selected.josephus_role]}</dd>
              </div>
            </dl>

            <section>
              <h3>Якоря</h3>
              <ul className="anchors">
                {selected.anchors.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3>Граф лиц</h3>
              <EpochGraph
                people={people}
                interactions={interactions}
                selectedPersonId={focusPersonId}
                onSelectPerson={setFocusPersonId}
              />
            </section>

            <section>
              <h3>Политии ({polities.length})</h3>
              {polities.length === 0 ? (
                <p className="empty">Нет polity-акторов для этой эпохи.</p>
              ) : (
                <ul className="entity-list">
                  {polities.map((p) => (
                    <li key={p.id}>
                      <div className="people-top">
                        <strong>{p.label_ru}</strong>
                        <span className={`pill conf-${p.confidence}`}>
                          {confidenceLabel[p.confidence]}
                        </span>
                        <span className="pill relation">polity</span>
                      </div>
                      {p.note_ru && <p className="people-note">{p.note_ru}</p>}
                      {p.person_ids && p.person_ids.length > 0 && (
                        <p className="entity-meta">
                          Лица:{" "}
                          {p.person_ids
                            .map((id) => personById[id]?.label_ru ?? id)
                            .join(", ")}
                        </p>
                      )}
                      <SourceList ids={p.source_ids} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3>Места ({places.length})</h3>
              {places.length === 0 ? (
                <p className="empty">Нет curated-мест для этой эпохи.</p>
              ) : (
                <ul className="entity-list">
                  {places.map((p) => (
                    <li key={p.id}>
                      <div className="people-top">
                        <strong>{p.label_ru}</strong>
                        <span className={`pill conf-${p.confidence}`}>
                          {confidenceLabel[p.confidence]}
                        </span>
                        <code className="id">{p.id}</code>
                      </div>
                      {p.note_ru && <p className="people-note">{p.note_ru}</p>}
                      {p.person_ids && p.person_ids.length > 0 && (
                        <p className="entity-meta">
                          Лица:{" "}
                          {p.person_ids
                            .map((id) => personById[id]?.label_ru ?? id)
                            .join(", ")}
                        </p>
                      )}
                      <SourceList ids={p.source_ids} />
                      <CitationList items={p.citations} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3>События ({events.length})</h3>
              {events.length === 0 ? (
                <p className="empty">Нет curated-событий для этой эпохи.</p>
              ) : (
                <div className="claims">
                  {events.map((e) => (
                    <article key={e.id} className="claim">
                      <div className="claim-top">
                        <strong>{e.label_ru}</strong>
                        <span className={`pill conf-${e.confidence}`}>
                          {confidenceLabel[e.confidence]}
                        </span>
                        {(e.date_min !== null || e.date_max !== null) && (
                          <span className="claim-dates">
                            {formatYear(e.date_min)} – {formatYear(e.date_max)}
                          </span>
                        )}
                      </div>
                      <p>{e.statement_ru}</p>
                      {e.note_ru && <p className="dissent">{e.note_ru}</p>}
                      {e.place_ids && e.place_ids.length > 0 && (
                        <p className="entity-meta">
                          Места:{" "}
                          {e.place_ids
                            .map((id) => placeById[id]?.label_ru ?? id)
                            .join(", ")}
                        </p>
                      )}
                      {e.person_ids && e.person_ids.length > 0 && (
                        <p className="entity-meta">
                          Лица:{" "}
                          {e.person_ids
                            .map((id) => personById[id]?.label_ru ?? id)
                            .join(", ")}
                        </p>
                      )}
                      <SourceList ids={e.source_ids} />
                      <CitationList items={e.citations} />
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3>
                Лица (candidate){" "}
                <span className="section-hint">не attested</span>
              </h3>
              {people.length === 0 ? (
                <p className="empty">Нет curated-лиц для этой эпохи.</p>
              ) : (
                <ul className="people">
                  {people.map((p) => (
                    <li
                      key={p.id}
                      className={
                        focusPersonId === p.id ? "people-item focus" : "people-item"
                      }
                    >
                      <div className="people-top">
                        <button
                          type="button"
                          className="linkish person-pick"
                          onClick={() =>
                            setFocusPersonId(
                              focusPersonId === p.id ? null : p.id
                            )
                          }
                        >
                          <strong>{p.label_ru}</strong>
                        </button>
                        <span className={`pill conf-${p.confidence}`}>
                          {confidenceLabel[p.confidence]}
                        </span>
                        {p.upstream?.found === true && (
                          <span className="pill upstream-ok">theographic</span>
                        )}
                        {p.upstream?.found === false && (
                          <span className="pill upstream-miss">
                            slug не найден
                          </span>
                        )}
                      </div>
                      {p.note_ru && <p className="people-note">{p.note_ru}</p>}
                      {p.theographic_slug ? (
                        <code className="id">slug: {p.theographic_slug}</code>
                      ) : null}
                      {p.upstream?.dictionaryLink ? (
                        <a
                          className="dict-link"
                          href={p.upstream.dictionaryLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Easton / dictionary
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3>
                Взаимодействия ({visibleInteractions.length}
                {focusPersonId ? ` / ${interactions.length}` : ""})
              </h3>
              {visibleInteractions.length === 0 ? (
                <p className="empty">
                  {interactions.length === 0
                    ? "Для этой эпохи пока нет рёбер — только якоря/лица."
                    : "Нет рёбер у выбранного лица."}
                </p>
              ) : (
                <div className="claims">
                  {visibleInteractions.map((i) => {
                    const from = personById[i.from_person_id];
                    const to = personById[i.to_person_id];
                    return (
                      <article key={i.id} className="claim interaction">
                        <div className="claim-top">
                          <span className="pill relation">
                            {relationLabelRu[i.relation]}
                          </span>
                          <span className={`pill conf-${i.confidence}`}>
                            {confidenceLabel[i.confidence]}
                          </span>
                        </div>
                        <p className="edge-line">
                          <strong>{from?.label_ru ?? i.from_person_id}</strong>
                          <span className="edge-arrow">→</span>
                          <strong>{to?.label_ru ?? i.to_person_id}</strong>
                        </p>
                        <p>{i.label_ru}</p>
                        {i.note_ru && <p className="dissent">{i.note_ru}</p>}
                        <SourceList ids={i.source_ids} />
                        <CitationList items={i.citations} />
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <h3>Утверждения ({claims.length})</h3>
              <div className="claims">
                {claims.map((c) => (
                  <article key={c.id} className="claim">
                    <div className="claim-top">
                      <span className={`pill conf-${c.confidence}`}>
                        {confidenceLabel[c.confidence]}
                      </span>
                      {(c.date_min !== null || c.date_max !== null) && (
                        <span className="claim-dates">
                          {formatYear(c.date_min)} – {formatYear(c.date_max)}
                        </span>
                      )}
                    </div>
                    <p>{c.statement_ru}</p>
                    {c.dissent_ru && (
                      <p className="dissent">Спор: {c.dissent_ru}</p>
                    )}
                    <SourceList ids={c.source_ids} />
                    <CitationList items={c.citations} />
                  </article>
                ))}
              </div>
            </section>
          </main>
        )}
      </div>

      <footer className="foot">
        1–2 Макк. = historical_document · Отцы Церкви вне MVP · Theographic
        CC-BY-SA (candidate) ·{" "}
        <code>npm run extract:theographic</code>
      </footer>
    </div>
  );
}
