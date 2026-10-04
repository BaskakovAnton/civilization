import { useMemo, useState } from "react";
import type { Confidence, HistEvent } from "./types";
import { confidenceLabel, previewText } from "./types";
import {
  jesusGeoHref,
  LARKIN_EVENT_TO_PLACE,
} from "./jesusGeoBridge";

type GospelKey = "mt" | "mk" | "lk" | "jn";

type RegionId =
  | "phoenicia"
  | "decapolis"
  | "galilee"
  | "samaria"
  | "perea"
  | "judea";

type LarkinStop = {
  eventId: string;
  label: string;
  region: RegionId;
  kind: "miracle" | "path" | "passion";
  gospels: Partial<Record<GospelKey, boolean>>;
};

const REGIONS: { id: RegionId; label: string; y: number; fill: string }[] = [
  { id: "phoenicia", label: "Финикия", y: 10, fill: "#f0d5d8" },
  { id: "decapolis", label: "Декаполис", y: 26, fill: "#e8dcc8" },
  { id: "galilee", label: "Галилея", y: 44, fill: "#d9e6d0" },
  { id: "samaria", label: "Самария", y: 62, fill: "#efe6b8" },
  { id: "perea", label: "Перея", y: 76, fill: "#ddd0e6" },
  { id: "judea", label: "Иудея", y: 90, fill: "#edd4bc" },
];

/** Narrative order · literary geography (Larkin-style bands, not firm chronology). */
const STOPS: LarkinStop[] = [
  {
    eventId: "evt_baptism_jordan",
    label: "Крещение",
    region: "judea",
    kind: "path",
    gospels: { mt: true, mk: true, lk: true },
  },
  {
    eventId: "evt_miracle_cana",
    label: "Кана · вино",
    region: "galilee",
    kind: "miracle",
    gospels: { jn: true },
  },
  {
    eventId: "evt_miracle_capernaum",
    label: "Капернаум",
    region: "galilee",
    kind: "miracle",
    gospels: { mt: true, mk: true, lk: true },
  },
  {
    eventId: "evt_miracle_nazareth_reject",
    label: "Назарет",
    region: "galilee",
    kind: "path",
    gospels: { mt: true, mk: true, lk: true },
  },
  {
    eventId: "evt_miracle_nain",
    label: "Наин",
    region: "galilee",
    kind: "miracle",
    gospels: { lk: true },
  },
  {
    eventId: "evt_miracle_sea",
    label: "Озеро",
    region: "galilee",
    kind: "miracle",
    gospels: { mt: true, mk: true, jn: true },
  },
  {
    eventId: "evt_miracle_gerasene",
    label: "Декаполис",
    region: "decapolis",
    kind: "miracle",
    gospels: { mt: true, mk: true, lk: true },
  },
  {
    eventId: "evt_miracle_feeding",
    label: "5000",
    region: "galilee",
    kind: "miracle",
    gospels: { mt: true, mk: true, lk: true, jn: true },
  },
  {
    eventId: "evt_miracle_tyre",
    label: "Тир",
    region: "phoenicia",
    kind: "miracle",
    gospels: { mt: true, mk: true },
  },
  {
    eventId: "evt_path_caesarea_philippi",
    label: "Кесария Ф.",
    region: "galilee",
    kind: "path",
    gospels: { mt: true, mk: true },
  },
  {
    eventId: "evt_miracle_samaria_well",
    label: "Сихарь",
    region: "samaria",
    kind: "miracle",
    gospels: { jn: true },
  },
  {
    eventId: "evt_miracle_bethesda",
    label: "Вифезда",
    region: "judea",
    kind: "miracle",
    gospels: { jn: true },
  },
  {
    eventId: "evt_miracle_jericho",
    label: "Иерихон",
    region: "judea",
    kind: "miracle",
    gospels: { mt: true, mk: true, lk: true },
  },
  {
    eventId: "evt_miracle_bethany",
    label: "Вифания",
    region: "judea",
    kind: "miracle",
    gospels: { jn: true },
  },
  {
    eventId: "evt_temple_incident",
    label: "Храм",
    region: "judea",
    kind: "passion",
    gospels: { mt: true, mk: true, lk: true, jn: true },
  },
  {
    eventId: "evt_crucifixion",
    label: "Казнь",
    region: "judea",
    kind: "passion",
    gospels: { mt: true, mk: true, lk: true, jn: true },
  },
];

const GOSPEL_META: { key: GospelKey; label: string; color: string }[] = [
  { key: "mt", label: "Мф", color: "#c47a4a" },
  { key: "mk", label: "Мк", color: "#4a7ab0" },
  { key: "lk", label: "Лк", color: "#7a5a9a" },
  { key: "jn", label: "Ин", color: "#4a9a6a" },
];

type Props = {
  events: HistEvent[];
};

function regionY(id: RegionId): number {
  return REGIONS.find((r) => r.id === id)?.y ?? 50;
}

export default function LarkinChart({ events }: Props) {
  const byId = useMemo(
    () => Object.fromEntries(events.map((e) => [e.id, e])),
    [events]
  );
  const stops = useMemo(
    () => STOPS.filter((s) => byId[s.eventId]),
    [byId]
  );
  const [activeId, setActiveId] = useState(stops[0]?.eventId ?? "");
  const activeStop = stops.find((s) => s.eventId === activeId) ?? stops[0];
  const activeEvent = activeStop ? byId[activeStop.eventId] : null;

  const n = Math.max(stops.length - 1, 1);
  const points = stops.map((s, i) => {
    const x = 8 + (i / n) * 84;
    const y = regionY(s.region);
    return { ...s, x, y, i };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  return (
    <div className="lk-root">
      <p className="lk-banner">
        Схема в духе Larkin (1894):{" "}
        <strong>время →</strong> · <strong>регион ↓</strong>. Literary-гармония
        Евангелий, не firm-биография и не historicity чудес.
      </p>

      <div className="lk-chart-wrap">
        <aside className="lk-region-key" aria-hidden>
          {REGIONS.map((r) => (
            <div key={r.id} className="lk-region-key-row" style={{ background: r.fill }}>
              {r.label}
            </div>
          ))}
        </aside>

        <div className="lk-stage">
          <svg
            className="lk-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            role="img"
            aria-label="Путь Иисуса: регион против времени"
          >
            {REGIONS.map((r, idx) => {
              const next = REGIONS[idx + 1];
              const y0 = idx === 0 ? 0 : (REGIONS[idx - 1].y + r.y) / 2;
              const y1 = next ? (r.y + next.y) / 2 : 100;
              return (
                <rect
                  key={r.id}
                  x={0}
                  y={y0}
                  width={100}
                  height={y1 - y0}
                  fill={r.fill}
                  opacity={0.85}
                />
              );
            })}
            {REGIONS.map((r) => (
              <text
                key={`t-${r.id}`}
                x={1.2}
                y={r.y}
                className="lk-band-label"
              >
                {r.label}
              </text>
            ))}

            <path d={pathD} className="lk-path" fill="none" />

            {points.map((p) => (
              <g key={p.eventId}>
                {p.kind === "miracle" ? (
                  <line
                    x1={p.x}
                    y1={Math.max(2, p.y - 8)}
                    x2={p.x}
                    y2={Math.min(98, p.y + 8)}
                    className="lk-miracle-tick"
                  />
                ) : null}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={p.eventId === activeId ? 1.8 : 1.35}
                  className={
                    p.eventId === activeId
                      ? "lk-node on"
                      : p.kind === "miracle"
                        ? "lk-node miracle"
                        : "lk-node"
                  }
                  onClick={() => setActiveId(p.eventId)}
                  style={{ cursor: "pointer" }}
                />
              </g>
            ))}
          </svg>

          <div className="lk-x-labels">
            {points.map((p) => (
              <button
                key={p.eventId}
                type="button"
                className={
                  p.eventId === activeId ? "lk-x-lab on" : "lk-x-lab"
                }
                style={{ left: `${p.x}%` }}
                onClick={() => setActiveId(p.eventId)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lk-harmony" aria-label="Гармония Евангелий">
        <div className="lk-harmony-head">Гармония (наличие в Евангелии)</div>
        {GOSPEL_META.map((g) => (
          <div key={g.key} className="lk-harmony-row">
            <span className="lk-harmony-name" style={{ color: g.color }}>
              {g.label}
            </span>
            <div className="lk-harmony-cells">
              {points.map((p) => (
                <span
                  key={`${g.key}-${p.eventId}`}
                  className={
                    p.gospels[g.key] ? "lk-cell on" : "lk-cell"
                  }
                  style={
                    p.gospels[g.key]
                      ? { background: g.color }
                      : undefined
                  }
                  title={`${g.label}: ${p.label}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeEvent && activeStop ? (
        <div className="lk-detail">
          <div className="lk-detail-top">
            <strong>{activeStop.label}</strong>
            <span className={`pill conf-${activeEvent.confidence}`}>
              {confidenceLabel[activeEvent.confidence as Confidence]}
            </span>
            <span className="lk-kind">
              {activeStop.kind === "miracle"
                ? "чудо · literary"
                : activeStop.kind === "passion"
                  ? "страсти"
                  : "путь"}
            </span>
            <span className="lk-region-pill">
              {REGIONS.find((r) => r.id === activeStop.region)?.label}
            </span>
          </div>
          <p>{previewText(activeEvent.statement_ru, 220)}</p>
          {activeEvent.citations?.length ? (
            <p className="lk-refs">
              {activeEvent.citations.map((c) => c.label_ru).join(" · ")}
            </p>
          ) : null}
          <p className="lk-gospels-line">
            Евангелия:{" "}
            {GOSPEL_META.filter((g) => activeStop.gospels[g.key])
              .map((g) => g.label)
              .join(", ") || "—"}
          </p>
          {LARKIN_EVENT_TO_PLACE[activeStop.eventId] ? (
            <p className="lk-geo-link">
              <a
                href={jesusGeoHref(LARKIN_EVENT_TO_PLACE[activeStop.eventId])}
              >
                На гео-карте →
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="lk-foot-note">
        Вертикальная чёрточка = чудо на линии пути (как у Larkin). Цветные
        клетки = какое Евангелие сообщает эпизод. Казнь/крещение на шкале —
        из data confidence, не «всё firm».
      </p>
    </div>
  );
}
