import { useEffect, useMemo, useState } from "react";
import type { CandidatePerson, Confidence, HistEvent } from "./types";
import {
  confidenceHintRu,
  confidenceLabel,
  formatYear,
  previewText,
} from "./types";
import {
  IconChevron,
  IconClose,
  IconHelp,
  IconPin,
  NavSpriteIcon,
} from "./icons/journeyIcons";
import LarkinChart from "./LarkinChart";

type ChapterId = "jesus" | "baptist" | "early" | "paul" | "war";
type RouteMode = "larkin" | "core" | "miracles";

type Props = {
  person: CandidatePerson;
  events: HistEvent[];
  onClose: () => void;
  onJumpEpoch: (epochId: string) => void;
};

const CHAPTERS: {
  id: ChapterId;
  icon: 0 | 1 | 2 | 3 | 4;
  title: string;
  sub: string;
  epochId?: string;
}[] = [
  { id: "jesus", icon: 0, title: "Иисус / Иерусалим", sub: "30–33 н.э." },
  { id: "baptist", icon: 1, title: "Иоанн Креститель / Иудея", sub: "28–29 н.э." },
  {
    id: "early",
    icon: 2,
    title: "Раннее движение / Антиохия",
    sub: "33–40 н.э.",
    epochId: "pauline_networks",
  },
  {
    id: "paul",
    icon: 3,
    title: "Павел / Средиземноморье",
    sub: "40–60 н.э.",
    epochId: "pauline_networks",
  },
  {
    id: "war",
    icon: 4,
    title: "Иудейская война / Иудея",
    sub: "66–73 н.э.",
    epochId: "war_and_divergence",
  },
];

/** HC core path — few waypoints. */
const PATH_CORE = [
  { id: "nazareth", label: "Назарет", x: 18, y: 34 },
  { id: "capernaum", label: "Капернаум", x: 40, y: 28 },
  { id: "jordan", label: "Иордан", x: 58, y: 42 },
  { id: "jerusalem", label: "Иерусалим", x: 78, y: 68 },
];

/**
 * Maximal literary itinerary from Mt+Mk+Lk+Jn geography
 * (not a firm travelogue; miracles stay literary).
 */
const PATH_MIRACLES = [
  { id: "jordan_valley", label: "Иордан", x: 56, y: 48 },
  { id: "cana", label: "Кана", x: 28, y: 26 },
  { id: "capernaum", label: "Капернаум", x: 42, y: 22 },
  { id: "nazareth", label: "Назарет", x: 22, y: 32 },
  { id: "nain", label: "Наин", x: 30, y: 40 },
  { id: "sea_of_galilee", label: "Озеро", x: 50, y: 30 },
  { id: "bethsaida", label: "Вифсаида", x: 52, y: 20 },
  { id: "decapolis", label: "Декаполис", x: 62, y: 36 },
  { id: "tyre_region", label: "Тир", x: 24, y: 12 },
  { id: "caesarea_philippi", label: "Кесария Ф.", x: 48, y: 10 },
  { id: "samaria", label: "Самария", x: 58, y: 52 },
  { id: "jericho", label: "Иерихон", x: 72, y: 60 },
  { id: "bethany", label: "Вифания", x: 78, y: 66 },
  { id: "jerusalem", label: "Иерусалим", x: 84, y: 72 },
];

const PATH_D_CORE =
  "M18 34 C 28 24, 34 30, 40 28 S 50 30, 58 42 S 68 58, 78 68";
const PATH_D_MIRACLES =
  "M56 48 L28 26 L42 22 L22 32 L30 40 L42 22 L50 30 L52 20 L62 36 L42 22 L24 12 L48 10 L42 22 L58 52 L72 60 L78 66 L84 72";

const MAIN_EVENT_IDS = [
  "evt_baptism_jordan",
  "evt_galilee_activity",
  "evt_temple_incident",
  "evt_crucifixion",
  "evt_resurrection_kerygma",
] as const;

/** Ordered axis for «Чудеса → маршрут» (narrative sequence). */
const MIRACLE_EVENT_IDS = [
  "evt_baptism_jordan",
  "evt_miracle_cana",
  "evt_miracle_capernaum",
  "evt_miracle_nazareth_reject",
  "evt_miracle_nain",
  "evt_miracle_sea",
  "evt_miracle_gerasene",
  "evt_miracle_feeding",
  "evt_miracle_tyre",
  "evt_path_caesarea_philippi",
  "evt_miracle_samaria_well",
  "evt_miracle_bethesda",
  "evt_miracle_jericho",
  "evt_miracle_bethany",
  "evt_temple_incident",
  "evt_crucifixion",
] as const;

const YEAR_MIN = 28;
const YEAR_MAX = 33.5;

function midYear(e: HistEvent): number {
  const a = e.date_min ?? YEAR_MIN;
  const b = e.date_max ?? a;
  return (a + b) / 2;
}

function yearPct(y: number): number {
  const t = (y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN);
  return Math.min(96, Math.max(4, t * 100));
}

function shortLabel(e: HistEvent): string {
  const l = e.label_ru;
  if (e.id === "evt_baptism_jordan" || (l.includes("Крещение") && !l.includes("Чудо")))
    return "Иордан";
  if (l.includes("Кана")) return "Кана";
  if (l.includes("Капернаум")) return "Капернаум";
  if (l.includes("Назарет")) return "Назарет";
  if (l.includes("Наин")) return "Наин";
  if (l.includes("бури") || l.includes("воде") || l.includes("Озеро")) return "Озеро";
  if (l.includes("Декаполис") || l.includes("одержим") || l.includes("Одержим"))
    return "Декаполис";
  if (l.includes("Насыщение") || l.includes("5000")) return "5000";
  if (l.includes("Тир")) return "Тир";
  if (l.includes("Кесария")) return "Кесария Ф.";
  if (l.includes("Самари") || l.includes("Сихар") || l.includes("колодец")) return "Самария";
  if (l.includes("Вифезда") || l.includes("купальн")) return "Вифезда";
  if (l.includes("Иерихон") || l.includes("Вартимей") || l.includes("Закхей"))
    return "Иерихон";
  if (l.includes("Лазарь") || l.includes("Вифани")) return "Вифания";
  if (l.includes("Храм") || l.includes("храм")) return "Храм";
  if (l.includes("Казнь")) return "Казнь";
  if (l.includes("керигма") || l.includes("Керигма")) return "Керигма";
  if (l.includes("Галиле")) return "Галилея";
  return l.length > 14 ? `${l.slice(0, 13)}…` : l;
}

function placeForEvent(e: HistEvent): string {
  const ids = e.place_ids || [];
  if (e.id.includes("baptism") || ids.includes("jordan_valley")) return "jordan_valley";
  if (e.id.includes("bethesda")) return "jerusalem";
  for (const id of [
    "cana",
    "capernaum",
    "nain",
    "bethsaida",
    "sea_of_galilee",
    "decapolis",
    "tyre_region",
    "caesarea_philippi",
    "samaria",
    "jericho",
    "bethany",
    "nazareth",
    "jerusalem",
    "galilee",
  ]) {
    if (ids.includes(id)) return id === "galilee" ? "capernaum" : id;
  }
  if (e.id.includes("temple") || e.id.includes("crucifixion") || e.id.includes("kerygma"))
    return "jerusalem";
  return ids[0] || "capernaum";
}

function dateLine(e: HistEvent): string {
  if (e.date_min === e.date_max) return `ок. ${formatYear(e.date_min)}`;
  return `${formatYear(e.date_min)} – ${formatYear(e.date_max)}`;
}

export default function JesusPathView({
  person,
  events,
  onClose,
  onJumpEpoch,
}: Props) {
  const byId = useMemo(
    () => Object.fromEntries(events.map((e) => [e.id, e])),
    [events]
  );
  const mainEvents = useMemo(
    () => MAIN_EVENT_IDS.map((id) => byId[id]).filter(Boolean) as HistEvent[],
    [byId]
  );
  const miracleEvents = useMemo(
    () =>
      MIRACLE_EVENT_IDS.map((id) => byId[id]).filter(Boolean) as HistEvent[],
    [byId]
  );
  const allSorted = useMemo(
    () => [...events].sort((a, b) => midYear(a) - midYear(b)),
    [events]
  );

  const [chapter, setChapter] = useState<ChapterId>("jesus");
  const [routeMode, setRouteMode] = useState<RouteMode>("larkin");
  const [activeId, setActiveId] = useState<string>(
    miracleEvents[0]?.id ?? mainEvents[0]?.id ?? ""
  );
  const [personOpen, setPersonOpen] = useState(false);
  const [showGeo, setShowGeo] = useState(true);
  const [eventFilter, setEventFilter] = useState<"route" | "all">("route");
  const [helpOpen, setHelpOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (routeMode === "larkin") return;
    if (routeMode === "miracles") {
      setActiveId(miracleEvents[0]?.id ?? "");
      setEventFilter("route");
    } else {
      setActiveId(mainEvents[0]?.id ?? "");
    }
  }, [routeMode, miracleEvents, mainEvents]);

  const pathNodes = routeMode === "miracles" ? PATH_MIRACLES : PATH_CORE;
  const pathD = routeMode === "miracles" ? PATH_D_MIRACLES : PATH_D_CORE;

  const axisEvents = useMemo(() => {
    if (eventFilter === "all") return allSorted;
    return routeMode === "miracles" ? miracleEvents : mainEvents;
  }, [eventFilter, allSorted, routeMode, miracleEvents, mainEvents]);

  /** Even spacing on axis in miracle mode (narrative order > calendar midpoints). */
  function axisLeftPct(e: HistEvent, index: number, total: number): number {
    if (routeMode === "miracles" && eventFilter === "route" && total > 1) {
      return 4 + (index / (total - 1)) * 92;
    }
    return yearPct(midYear(e));
  }

  const active = byId[activeId] ?? axisEvents[0] ?? null;
  const activePlace = active ? placeForEvent(active) : null;

  function selectChapter(id: ChapterId) {
    setChapter(id);
    const ch = CHAPTERS.find((c) => c.id === id);
    if (ch?.epochId && id !== "jesus" && id !== "baptist") {
      onJumpEpoch(ch.epochId);
      onClose();
    }
  }

  const years = [28, 29, 30, 31, 32, 33];
  const itineraryRu =
    "Иордан → Кана → Капернаум ↔ Назарет/Наин → озеро/Вифсаида/Декаполис → Тир → Кесария Ф. → Самария (Ин) → Иерихон → Вифания → Иерусалим";

  return (
    <div className="jp-root" role="dialog" aria-modal="true" aria-label="Путь Иисуса">
      <aside className="jp-sidebar">
        <div className="jp-brand">
          <NavSpriteIcon index={0} className="jp-brand-icon" />
          <div>
            <div className="jp-brand-kicker">История и критика</div>
            <div className="jp-brand-title">Иисус Назаретянин</div>
          </div>
        </div>

        <nav className="jp-nav" aria-label="Главы NT-дуги">
          {CHAPTERS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={chapter === c.id ? "jp-nav-item on" : "jp-nav-item"}
              onClick={() => selectChapter(c.id)}
            >
              <NavSpriteIcon index={c.icon} />
              <span>
                <strong>{c.title}</strong>
                <em>{c.sub}</em>
              </span>
            </button>
          ))}
        </nav>

        <div className="jp-sidebar-foot">
          <button
            type="button"
            className="jp-side-link"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            Фильтры <IconChevron dir={filtersOpen ? "down" : "right"} />
          </button>
          {filtersOpen ? (
            <div className="jp-filters-panel">
              <label className="jp-check">
                <input
                  type="checkbox"
                  checked={showGeo}
                  onChange={(e) => setShowGeo(e.target.checked)}
                />
                География на карте
              </label>
              <label className="jp-check">
                <input
                  type="checkbox"
                  checked={eventFilter === "all"}
                  onChange={(e) =>
                    setEventFilter(e.target.checked ? "all" : "route")
                  }
                />
                Все события эпохи
              </label>
            </div>
          ) : null}
          <button
            type="button"
            className="jp-side-link"
            onClick={() => setHelpOpen((v) => !v)}
          >
            <IconHelp /> Справка
          </button>
          <button type="button" className="jp-side-link jp-exit" onClick={onClose}>
            ← К ленте эпох
          </button>
        </div>
      </aside>

      <div className="jp-main">
        <header className="jp-header">
          <div>
            <h1>Иисус из Назарета: путь и контекст</h1>
            <p className="jp-sub">
              {routeMode === "larkin"
                ? "Схема Larkin: регион × время · literary-гармония Евангелий"
                : routeMode === "miracles"
                  ? "Литературный маршрут по географии чудес • не historicity чудес"
                  : "Историко-критическое ядро • 28–33 гг. н.э."}
            </p>
            <div className="jp-mode-row" role="group" aria-label="Режим пути">
              <button
                type="button"
                className={routeMode === "larkin" ? "jp-mode on" : "jp-mode"}
                onClick={() => setRouteMode("larkin")}
              >
                Как Larkin
              </button>
              <button
                type="button"
                className={routeMode === "miracles" ? "jp-mode on" : "jp-mode"}
                onClick={() => setRouteMode("miracles")}
              >
                Чудеса → карта
              </button>
              <button
                type="button"
                className={routeMode === "core" ? "jp-mode on" : "jp-mode"}
                onClick={() => setRouteMode("core")}
              >
                Ядро HC
              </button>
            </div>
          </div>
          <button
            type="button"
            className="jp-person-chip"
            onClick={() => setPersonOpen(true)}
          >
            <img
              src="/icons/jesus-avatar-line.png"
              alt=""
              width={40}
              height={40}
            />
            <span>
              <strong>{person.label_ru}</strong>
              <em>ок. 4 г. до н.э. – 30/33 г. н.э.</em>
            </span>
            <IconChevron dir="right" />
          </button>
        </header>

        {routeMode === "larkin" ? (
          <div className="jp-larkin-slot">
            <LarkinChart events={events} />
          </div>
        ) : null}

        {routeMode === "miracles" ? (
          <p className="jp-itinerary-banner">
            Как «ходил» в предании: <strong>{itineraryRu}</strong>
            <span>
              {" "}
              · все узлы чудес = literary; география читается из текста, не из
              анналов
            </span>
          </p>
        ) : null}

        {routeMode !== "larkin" ? (
        <div className="jp-stage">
          <div
            className={`jp-map${showGeo ? "" : " no-geo"}`}
            style={{
              backgroundImage: showGeo
                ? "url(/mock/judea-galilee-contour.png)"
                : "none",
            }}
          >
            <div className="jp-year-grid" aria-hidden>
              {years.map((y) => (
                <span key={y} style={{ left: `${yearPct(y)}%` }}>
                  {y}
                </span>
              ))}
            </div>
            <span className="jp-region north">Галилея</span>
            <span className="jp-region south">Иудея</span>

            <svg
              className="jp-path-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                className={
                  routeMode === "miracles"
                    ? "jp-path-line jp-path-miracle"
                    : "jp-path-line"
                }
                d={pathD}
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {pathNodes.map((p) => (
              <button
                key={p.id}
                type="button"
                className={activePlace === p.id ? "jp-node on" : "jp-node"}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onClick={() => {
                  const hit = axisEvents.find((e) => placeForEvent(e) === p.id);
                  if (hit) setActiveId(hit.id);
                }}
              >
                <span className="jp-node-dot" />
                <span className="jp-node-label">{p.label}</span>
              </button>
            ))}

            {active ? (
              <div
                className="jp-event-tip"
                style={{
                  left: `${Math.min(55, Math.max(4, yearPct(midYear(active)) - 10))}%`,
                  top:
                    activePlace === "jerusalem" || activePlace === "bethany"
                      ? "8%"
                      : activePlace === "tyre_region"
                        ? "28%"
                        : "50%",
                }}
              >
                <div className="jp-event-tip-top">
                  <strong>{shortLabel(active)}</strong>
                  <span>{dateLine(active)}</span>
                </div>
                <p>{previewText(active.statement_ru, 160)}</p>
                {active.note_ru ? (
                  <p className="jp-refs">{active.note_ru}</p>
                ) : null}
                {active.citations && active.citations.length > 0 ? (
                  <p className="jp-refs">
                    {active.citations.map((c) => c.label_ru).join(" · ")}
                  </p>
                ) : null}
                <p className="jp-conf-line">
                  Уверенность:{" "}
                  <span className={`jp-dot conf-${active.confidence}`} />{" "}
                  {confidenceLabel[active.confidence as Confidence]}
                </p>
              </div>
            ) : null}

            {personOpen ? (
              <div className="jp-person-card">
                <button
                  type="button"
                  className="jp-card-close"
                  aria-label="Закрыть"
                  onClick={() => setPersonOpen(false)}
                >
                  <IconClose />
                </button>
                <h2>{person.label_ru}</h2>
                <p>
                  {person.note_ru ||
                    "Иудейский учитель I в.; историческое ядро удерживается критическим консенсусом."}
                </p>
                <p className="jp-conf-line">
                  Уверенность:{" "}
                  <span className={`jp-dot conf-${person.confidence}`} />{" "}
                  {confidenceLabel[person.confidence]}
                </p>
              </div>
            ) : null}
          </div>

          <div className="jp-axis">
            {axisEvents.map((e, index) => (
              <button
                key={e.id}
                type="button"
                className={activeId === e.id ? "jp-axis-item on" : "jp-axis-item"}
                style={{
                  left: `${axisLeftPct(e, index, axisEvents.length)}%`,
                }}
                onClick={() => setActiveId(e.id)}
              >
                <span className={`jp-axis-dot conf-${e.confidence}`} />
                <span className="jp-axis-lab">{shortLabel(e)}</span>
                <span className={`pill conf-${e.confidence}`}>
                  {confidenceLabel[e.confidence]}
                </span>
              </button>
            ))}
          </div>
        </div>
        ) : null}

        <footer className="jp-footer">
          <p>
            {routeMode === "larkin"
              ? "Larkin-схема · literary · не XIX-вековая гармония как firm"
              : routeMode === "miracles"
                ? "Маршрут из географии чудес · literary · не travelogue"
                : "Шкала: линейная • критический консенсус"}
            {helpOpen
              ? ` • ${
                  routeMode === "core"
                    ? confidenceHintRu.anchored
                    : confidenceHintRu.literary
                }`
              : ""}
          </p>
          <div className="jp-footer-actions">
            <button
              type="button"
              className={showGeo ? "jp-foot-btn on" : "jp-foot-btn"}
              onClick={() => setShowGeo((v) => !v)}
            >
              <IconPin /> Показывать географию
            </button>
            <label className="jp-foot-btn jp-select-wrap">
              <select
                value={eventFilter}
                onChange={(e) =>
                  setEventFilter(e.target.value as "route" | "all")
                }
              >
                <option value="route">
                  {routeMode === "miracles"
                    ? "Чудеса (маршрут)"
                    : "Основные события"}
                </option>
                <option value="all">Все события</option>
              </select>
            </label>
            <button
              type="button"
              className="jp-foot-btn"
              onClick={() => setHelpOpen((v) => !v)}
            >
              <IconHelp /> Справка
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
