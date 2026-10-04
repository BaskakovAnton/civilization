import { useMemo, useState } from "react";
import itinerary from "../../data/jesus_map_itinerary.json";
import placesData from "../../data/places.json";
import type { Confidence, Place } from "./types";
import PlaceStopCard, { type StopCardModel } from "./PlaceStopCard";
import {
  heroesLocationHref,
  heroesMarkerXY,
  heroesOverworldHref,
  type MarkerXY,
} from "./heroesMapAssets";

type Stop = {
  place_id: string;
  lat: number;
  lon: number;
  geo_note_ru?: string;
};

type ResolvedStop = StopCardModel & Stop & { xy: MarkerXY };

const places = placesData as Place[];
const placeById: Record<string, Place> = Object.fromEntries(
  places.map((p) => [p.id, p])
);

const STOPS: ResolvedStop[] = (itinerary.stops as Stop[])
  .map((s, index) => {
    const place = placeById[s.place_id];
    const xy = heroesMarkerXY(s.place_id);
    if (!xy) return null;
    return {
      ...s,
      index,
      place,
      label_ru: place?.label_ru ?? s.place_id,
      confidence: (place?.confidence ?? "literary") as Confidence,
      xy,
    };
  })
  .filter((s): s is ResolvedStop => Boolean(s))
  .map((s, index) => ({ ...s, index }));

const PIN_FILL: Record<Confidence, string> = {
  firm: "#1f5c45",
  anchored: "#245a7a",
  disputed: "#8a5a12",
  literary: "#5a5a5a",
};

function pageHref(file: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? `${base}${file}` : `${base}/${file}`;
}

function homeHref(): string {
  return pageHref("index.html");
}

function initialSelected(): number {
  const stop = new URLSearchParams(window.location.search).get("stop");
  if (!stop) return 0;
  const i = STOPS.findIndex((s) => s.place_id === stop);
  return i >= 0 ? i : 0;
}

function shortPinLabel(label: string): string {
  const t = label.replace(/\s*\(.*\)\s*/g, "").trim();
  return t.length > 12 ? `${t.slice(0, 11)}…` : t;
}

export default function JesusMapPage() {
  const [selected, setSelected] = useState(initialSelected);
  const [cardOpen, setCardOpen] = useState(() =>
    Boolean(new URLSearchParams(window.location.search).get("stop"))
  );

  const vectorFrom = Math.min(selected, Math.max(0, STOPS.length - 2));
  const selectedStop = STOPS[selected] ?? STOPS[0];

  const routePath = useMemo(
    () => STOPS.map((s) => `${s.xy.x},${s.xy.y}`).join(" "),
    []
  );

  const selectStop = (index: number, openCard: boolean) => {
    setSelected(index);
    if (openCard) setCardOpen(true);
    const placeId = STOPS[index]?.place_id;
    if (placeId) {
      const url = new URL(window.location.href);
      url.searchParams.set("stop", placeId);
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="jm-page">
      <div className="jm-map-wrap">
        <nav className="jm-float-nav" aria-label="Навигация">
          <a href={homeHref()}>←</a>
          <a href={pageHref("genealogy.html")}>Мф 1</a>
        </nav>

        <div className="jm-arena" aria-label="Карта маршрута">
          <div className="jm-arena-stage">
            <img
              className="jm-arena-img"
              src={heroesOverworldHref()}
              alt=""
              draggable={false}
            />

            <svg
              className="jm-arena-routes"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                className="jm-route-ghost"
                points={routePath}
                fill="none"
              />
              {STOPS.slice(0, -1).map((a, i) => {
                const b = STOPS[i + 1];
                const active = i === vectorFrom;
                return (
                  <line
                    key={`${a.place_id}-${b.place_id}`}
                    className={
                      active ? "jm-route-seg is-active" : "jm-route-seg"
                    }
                    x1={a.xy.x}
                    y1={a.xy.y}
                    x2={b.xy.x}
                    y2={b.xy.y}
                  />
                );
              })}
            </svg>

            {STOPS.map((stop) => {
              const active = stop.index === selected;
              return (
                <button
                  key={stop.place_id}
                  type="button"
                  className={active ? "jm-marker is-active" : "jm-marker"}
                  style={{
                    left: `${stop.xy.x}%`,
                    top: `${stop.xy.y}%`,
                    ["--jm-pin" as string]: PIN_FILL[stop.confidence],
                  }}
                  title={`${stop.index + 1}. ${stop.label_ru}`}
                  aria-label={`${stop.index + 1}. ${stop.label_ru}`}
                  aria-pressed={active}
                  onClick={() => selectStop(stop.index, true)}
                >
                  <span className="jm-marker-dot">{stop.index + 1}</span>
                  <span className="jm-marker-label">
                    {shortPinLabel(stop.label_ru)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {cardOpen && selectedStop ? (
          <div
            className="jm-modal"
            onClick={() => setCardOpen(false)}
            role="presentation"
          >
            <div
              className="jm-modal-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <PlaceStopCard
                key={selectedStop.place_id}
                stop={selectedStop}
                onClose={() => setCardOpen(false)}
                locationArtHref={heroesLocationHref(selectedStop.place_id)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
