import { useMemo, useState } from "react";
import type { CandidatePerson, Confidence, HistEvent, Place } from "./types";
import {
  confidenceHintRu,
  confidenceLabel,
  formatYear,
  previewText,
} from "./types";
import { ConfPill } from "./HoverTip";

type Props = {
  person: CandidatePerson;
  events: HistEvent[];
  places: Place[];
  onSelectEvent?: (id: string) => void;
};

/** Curated path nodes for the Jesus journey mock-style map (RU labels). */
const PATH: { id: string; label: string; x: number; y: number }[] = [
  { id: "nazareth", label: "Назарет", x: 14, y: 32 },
  { id: "galilee", label: "Галилея", x: 42, y: 28 },
  { id: "jordan", label: "Иордан", x: 62, y: 38 },
  { id: "jerusalem", label: "Иерусалим", x: 86, y: 72 },
];

const YEAR_MIN = 28;
const YEAR_MAX = 34;

function midYear(e: HistEvent): number {
  const a = e.date_min ?? YEAR_MIN;
  const b = e.date_max ?? a;
  return (a + b) / 2;
}

function yearPct(y: number): number {
  const t = (y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);
  return Math.min(98, Math.max(2, t * 100));
}

/** Prefer a short display label for the timeline tick. */
function shortEventLabel(label: string): string {
  if (label.includes("Крещение")) return "Крещение";
  if (label.includes("Галиле")) return "Проповедь";
  if (label.includes("Храм") || label.includes("храм")) return "Храм";
  if (label.includes("Конфликт") || label.includes("недел")) return "Конфликт";
  if (label.includes("Казнь")) return "Казнь";
  if (label.includes("керигма") || label.includes("Керигма")) return "Керигма";
  if (label.includes("Иоанн")) return "Иоанн";
  return label.length > 14 ? `${label.slice(0, 13)}…` : label;
}

function placeForEvent(e: HistEvent): string {
  const ids = e.place_ids || [];
  if (e.id.includes("baptism")) return "jordan";
  if (ids.includes("nazareth") && !ids.includes("jerusalem")) return "nazareth";
  if (ids.includes("galilee") && !ids.includes("jerusalem")) return "galilee";
  if (ids.includes("jerusalem")) return "jerusalem";
  return ids[0] || "galilee";
}

export default function JesusJourney({
  person,
  events,
  places,
  onSelectEvent,
}: Props) {
  const timelineEvents = useMemo(() => {
    const prefer = [
      "evt_baptism_jordan",
      "evt_galilee_activity",
      "evt_temple_incident",
      "evt_jerusalem_final_week",
      "evt_crucifixion",
      "evt_resurrection_kerygma",
    ];
    const byId = Object.fromEntries(events.map((e) => [e.id, e]));
    const ordered = prefer.map((id) => byId[id]).filter(Boolean) as HistEvent[];
    const rest = events.filter((e) => !prefer.includes(e.id));
    return [...ordered, ...rest].sort((a, b) => midYear(a) - midYear(b));
  }, [events]);

  const [activeId, setActiveId] = useState<string | null>(
    timelineEvents[0]?.id ?? null
  );
  const active = timelineEvents.find((e) => e.id === activeId) ?? null;
  const activePlace = active ? placeForEvent(active) : null;

  const placeLabel = (id: string) =>
    places.find((p) => p.id === id)?.label_ru ||
    PATH.find((p) => p.id === id)?.label ||
    id;

  function pick(id: string) {
    setActiveId(id);
    onSelectEvent?.(id);
  }

  const years = [28, 29, 30, 31, 32, 33];

  return (
    <div className="journey">
      <div className="journey-toolbar">
        <div className="journey-person-card">
          <div className="journey-avatar" aria-hidden />
          <div>
            <strong>{person.label_ru}</strong>
            <p>
              {person.note_ru ||
                "Историческое ядро; путь и годы — textbook-вилка, не евангельский фильм."}
            </p>
            <ConfPill level={person.confidence} />
          </div>
        </div>
        <p className="journey-toolbar-note">
          Линейная шкала · university consensus · география схематична
        </p>
      </div>

      <div
        className="journey-map"
        style={{ backgroundImage: "url(/mock/jesus-map-band.png)" }}
      >
        <div className="journey-year-grid" aria-hidden>
          {years.map((y) => (
            <span key={y} style={{ left: `${yearPct(y)}%` }}>
              {y}
            </span>
          ))}
        </div>
        <span className="journey-band-tag north">Галилея</span>
        <span className="journey-band-tag south">Иудея</span>

        <svg
          className="journey-path-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            className="journey-path-line"
            d="M14 32 C 28 22, 36 34, 42 28 S 54 22, 62 38 S 74 58, 86 72"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {PATH.map((p) => (
          <button
            key={p.id}
            type="button"
            className={
              activePlace === p.id
                ? "journey-node on"
                : "journey-node"
            }
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            onClick={() => {
              const hit = timelineEvents.find((e) => placeForEvent(e) === p.id);
              if (hit) pick(hit.id);
            }}
          >
            <span className="journey-node-dot" />
            <span className="journey-node-label">{p.label}</span>
          </button>
        ))}

        {active ? (
          <div
            className="journey-float-tip"
            style={{
              left: `${Math.min(72, Math.max(8, yearPct(midYear(active)) - 8))}%`,
              top: activePlace === "jerusalem" ? "8%" : "52%",
            }}
          >
            <div className="journey-float-top">
              <strong>{shortEventLabel(active.label_ru)}</strong>
              <span className={`pill conf-${active.confidence}`}>
                {confidenceLabel[active.confidence]}
              </span>
            </div>
            <p>{previewText(active.statement_ru, 140)}</p>
            <p className="journey-float-meta">
              {formatYear(active.date_min)} – {formatYear(active.date_max)} ·{" "}
              {placeLabel(placeForEvent(active))}
            </p>
          </div>
        ) : null}
      </div>

      <div className="journey-timeline">
        <div className="journey-ruler">
          {timelineEvents.map((e) => (
            <button
              key={e.id}
              type="button"
              className={activeId === e.id ? "journey-tick on" : "journey-tick"}
              style={{ left: `${yearPct(midYear(e))}%` }}
              onClick={() => pick(e.id)}
            >
              <span className={`journey-tick-dot conf-${e.confidence}`} />
              <span className="journey-tick-lab">
                {shortEventLabel(e.label_ru)}
              </span>
              <span className={`pill conf-${e.confidence}`}>
                {confidenceLabel[e.confidence]}
              </span>
            </button>
          ))}
        </div>

        <div className="journey-event-list">
          {timelineEvents.map((e) => (
            <button
              key={e.id}
              type="button"
              className={
                activeId === e.id ? "journey-evt on" : "journey-evt"
              }
              onClick={() => pick(e.id)}
            >
              <span className="journey-evt-top">
                <strong>{e.label_ru}</strong>
                <span className={`pill conf-${e.confidence}`}>
                  {confidenceLabel[e.confidence]}
                </span>
              </span>
              <span className="journey-evt-body">
                {previewText(e.statement_ru, 120)}
              </span>
              <span className="journey-evt-meta">
                {formatYear(e.date_min)} – {formatYear(e.date_max)} ·{" "}
                {confidenceHintRu[e.confidence as Confidence].slice(0, 42)}…
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
