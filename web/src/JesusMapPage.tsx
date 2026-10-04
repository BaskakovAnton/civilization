import { useEffect, useMemo, useRef, useState } from "react";
import itinerary from "../../data/jesus_map_itinerary.json";
import placesData from "../../data/places.json";
import type { Confidence, Place } from "./types";
import { confidenceLabel } from "./types";
import PlaceStopCard, { type StopCardModel } from "./PlaceStopCard";
import { jesusGeoHref, larkinAppHref } from "./jesusGeoBridge";
import { loadYmaps, type YmapsMap } from "./loadYmaps";

type Stop = {
  place_id: string;
  lat: number;
  lon: number;
  geo_note_ru?: string;
};

type ResolvedStop = StopCardModel & Stop;

const places = placesData as Place[];
const placeById: Record<string, Place> = Object.fromEntries(
  places.map((p) => [p.id, p])
);

const STOPS: ResolvedStop[] = (itinerary.stops as Stop[]).map((s, index) => {
  const place = placeById[s.place_id];
  return {
    ...s,
    index,
    place,
    label_ru: place?.label_ru ?? s.place_id,
    confidence: (place?.confidence ?? "literary") as Confidence,
  };
});

const PIN_FILL: Record<Confidence, string> = {
  firm: "#1f5c45",
  anchored: "#245a7a",
  disputed: "#8a5a12",
  literary: "#5a5a5a",
};

/** Yandex 2.1 bounds: [[south, west], [north, east]]. */
function itineraryBoundsLatLon(): number[][] {
  const lats = STOPS.map((s) => s.lat);
  const lons = STOPS.map((s) => s.lon);
  const padLat = 0.12;
  const padLon = 0.18;
  return [
    [Math.min(...lats) - padLat, Math.min(...lons) - padLon],
    [Math.max(...lats) + padLat, Math.max(...lons) + padLon],
  ];
}

function homeHref(): string {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? `${base}index.html` : `${base}/index.html`;
}

function initialSelected(): number {
  const stop = new URLSearchParams(window.location.search).get("stop");
  if (!stop) return 0;
  const i = STOPS.findIndex((s) => s.place_id === stop);
  return i >= 0 ? i : 0;
}

function bearingDeg(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δλ = ((b.lon - a.lon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function lerp(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
  t: number
) {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lon: a.lon + (b.lon - a.lon) * t,
  };
}

function svgDataUrl(svg: string) {
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function arrowIcon(deg: number, active: boolean) {
  const fill = active ? "#3d2a1a" : "#8a7a68";
  const size = active ? 22 : 16;
  return {
    iconLayout: "default#image",
    iconImageHref: svgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="rotate(${deg} 12 12)"><path d="M12 2 L20 20 L12 15 L4 20 Z" fill="${fill}"/></g></svg>`
    ),
    iconImageSize: [size, size] as [number, number],
    iconImageOffset: [-size / 2, -size / 2] as [number, number],
    hasBalloon: false,
    hasHint: false,
  };
}

function pinIcon(n: number, confidence: Confidence, active: boolean) {
  const size = active ? 28 : 22;
  const r = active ? 12 : 10;
  const fill = PIN_FILL[confidence];
  return {
    iconLayout: "default#image",
    iconImageHref: svgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><circle cx="14" cy="14" r="${r}" fill="${fill}" stroke="#fff" stroke-width="2"/><text x="14" y="18" text-anchor="middle" fill="#fff" font-size="${active ? 12 : 11}" font-family="Arial,sans-serif" font-weight="700">${n}</text></svg>`
    ),
    iconImageSize: [size, size] as [number, number],
    iconImageOffset: [-size / 2, -size / 2] as [number, number],
    hasBalloon: false,
  };
}

export default function JesusMapPage() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YmapsMap | null>(null);
  const [selected, setSelected] = useState(initialSelected);
  const [cardOpen, setCardOpen] = useState(() =>
    Boolean(new URLSearchParams(window.location.search).get("stop"))
  );
  const [mapReady, setMapReady] = useState(0);
  const [mapError, setMapError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_YANDEX_MAPS_KEY as string | undefined;
  const vectorFrom = Math.min(selected, STOPS.length - 2);
  const vectorTo = vectorFrom + 1;
  const selectedStop = STOPS[selected];
  const bounds = useMemo(() => itineraryBoundsLatLon(), []);

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

  useEffect(() => {
    const el = mapEl.current;
    if (!el) return;
    if (!apiKey) {
      setMapError(
        "Нет VITE_YANDEX_MAPS_KEY. Создайте web/.env.local (см. web/.env.example)."
      );
      return;
    }

    let cancelled = false;
    let map: YmapsMap | null = null;

    loadYmaps(apiKey)
      .then((ymaps) => {
        if (cancelled || !mapEl.current) return;
        map = new ymaps.Map(
          mapEl.current,
          {
            bounds,
            controls: ["zoomControl"],
          },
          {
            restrictMapArea: bounds,
            minZoom: 8,
            maxZoom: 16,
            suppressMapOpenBlock: true,
          }
        );
        mapRef.current = map;
        setMapReady((n) => n + 1);
      })
      .catch((e: Error) => {
        setMapError(e.message || "Не удалось загрузить Яндекс.Карты");
      });

    return () => {
      cancelled = true;
      if (map) map.destroy();
      mapRef.current = null;
    };
  }, [apiKey, bounds]);

  useEffect(() => {
    const map = mapRef.current;
    const ymaps = window.ymaps;
    if (!mapReady || !map || !ymaps) return;

    map.geoObjects.removeAll();

    const full = STOPS.map((s) => [s.lat, s.lon]);
    map.geoObjects.add(
      new ymaps.Polyline(
        full,
        {},
        {
          strokeColor: "#b7a894",
          strokeWidth: 2,
          strokeOpacity: 0.55,
          strokeStyle: "dash",
        }
      )
    );

    for (let i = 0; i < STOPS.length - 1; i++) {
      const a = STOPS[i];
      const b = STOPS[i + 1];
      const active = i === vectorFrom;
      map.geoObjects.add(
        new ymaps.Polyline(
          [
            [a.lat, a.lon],
            [b.lat, b.lon],
          ],
          {},
          {
            strokeColor: active ? "#3d2a1a" : "#8a7a68",
            strokeWidth: active ? 4 : 2,
            strokeOpacity: active ? 0.95 : 0.35,
          }
        )
      );

      const tip = lerp(a, b, 0.72);
      map.geoObjects.add(
        new ymaps.Placemark(
          [tip.lat, tip.lon],
          {},
          arrowIcon(bearingDeg(a, b), active)
        )
      );
    }

    for (const stop of STOPS) {
      const active = stop.index === selected;
      const pm = new ymaps.Placemark(
        [stop.lat, stop.lon],
        { hintContent: `${stop.index + 1}. ${stop.label_ru}` },
        pinIcon(stop.index + 1, stop.confidence, active)
      );
      (pm as { events: { add: (e: string, fn: () => void) => void } }).events.add(
        "click",
        () => selectStop(stop.index, true)
      );
      map.geoObjects.add(pm);
    }

    map.setCenter([selectedStop.lat, selectedStop.lon], undefined, {
      duration: 300,
    });
  }, [mapReady, selected, selectedStop, vectorFrom]);

  return (
    <div className="jm-page">
      <aside className="jm-sidebar">
        <h1 className="jm-brand">Иисус — гео-карта</h1>
        <p className="jm-sub">{itinerary.label_ru}</p>
        <p className="jm-disclaimer">{itinerary.disclaimer_ru}</p>

        <div className="jm-nav">
          <a href={homeHref()}>← Civilization</a>
          <a className="jm-btn" href={larkinAppHref(selectedStop.place_id)}>
            Схема Larkin
          </a>
          <button
            type="button"
            className="jm-btn"
            disabled={selected <= 0}
            onClick={() => selectStop(Math.max(0, selected - 1), true)}
          >
            Назад
          </button>
          <button
            type="button"
            className="jm-btn"
            disabled={selected >= STOPS.length - 1}
            onClick={() =>
              selectStop(Math.min(STOPS.length - 1, selected + 1), true)
            }
          >
            Далее
          </button>
        </div>

        <p className="jm-step-meta">
          Вектор {vectorFrom + 1}→{vectorTo + 1}: {STOPS[vectorFrom].label_ru} →{" "}
          {STOPS[vectorTo].label_ru}
        </p>

        <ul className="jm-stops">
          {STOPS.map((stop) => {
            const cls = [
              "jm-stop",
              stop.index === selected ? "is-selected" : "",
              stop.index === vectorFrom ? "is-vector-from" : "",
              stop.index === vectorTo ? "is-vector-to" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <li key={`${stop.index}-${stop.place_id}`}>
                <button
                  type="button"
                  className={cls}
                  onClick={() => selectStop(stop.index, true)}
                >
                  <span className="jm-stop-n">{stop.index + 1}</span>
                  <span>
                    <span className="jm-stop-title">{stop.label_ru}</span>
                    <span className="jm-stop-note">
                      {stop.geo_note_ru ?? stop.place?.note_ru ?? ""}
                    </span>
                  </span>
                  <span className={`jm-badge ${stop.confidence}`}>
                    {confidenceLabel[stop.confidence]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="jm-map-wrap">
        {mapError ? <div className="jm-map-error">{mapError}</div> : null}
        <div ref={mapEl} className="jm-map" />
        {cardOpen ? (
          <div className="jm-card-dock">
            <PlaceStopCard
              stop={selectedStop}
              onClose={() => setCardOpen(false)}
              larkinHref={larkinAppHref(selectedStop.place_id)}
            />
          </div>
        ) : null}
        <div className="jm-map-legend">
          Яндекс.Карты 2.1 · номера = literary itinerary · клик → тексты /
          справки ·{" "}
          <a href={jesusGeoHref(selectedStop.place_id)}>ссылка на точку</a>
        </div>
      </div>
    </div>
  );
}
