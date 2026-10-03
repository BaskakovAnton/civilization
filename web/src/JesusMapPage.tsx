import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import itinerary from "../../data/jesus_map_itinerary.json";
import placesData from "../../data/places.json";
import type { Confidence, Place } from "./types";
import { confidenceLabel } from "./types";

type Stop = {
  place_id: string;
  lat: number;
  lon: number;
  geo_note_ru?: string;
};

type ResolvedStop = Stop & {
  index: number;
  place?: Place;
  label_ru: string;
  confidence: Confidence;
};

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

function homeHref(): string {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? `${base}index.html` : `${base}/index.html`;
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

function pinIcon(n: number, confidence: Confidence, active: boolean) {
  return L.divIcon({
    className: "jm-pin-wrap",
    html: `<div class="jm-pin ${confidence}${active ? " is-active" : ""}">${n}</div>`,
    iconSize: active ? [28, 28] : [22, 22],
    iconAnchor: active ? [14, 14] : [11, 11],
  });
}

function arrowIcon(deg: number, strong: boolean) {
  const fill = strong ? "#3d2a1a" : "#8a7a68";
  const size = strong ? 22 : 16;
  return L.divIcon({
    className: "jm-arrow-icon",
    html: `<svg class="jm-arrow-svg" width="${size}" height="${size}" viewBox="0 0 24 24" style="transform:rotate(${deg}deg)"><path d="M12 2 L20 20 L12 15 L4 20 Z" fill="${fill}"/></svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function JesusMapPage() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [selected, setSelected] = useState(0);
  const [mapReady, setMapReady] = useState(0);
  /** Active vector = from selected → selected+1 (or last segment if at end). */
  const vectorFrom = Math.min(selected, STOPS.length - 2);
  const vectorTo = vectorFrom + 1;

  const selectedStop = STOPS[selected];

  const bounds = useMemo(
    () => L.latLngBounds(STOPS.map((s) => [s.lat, s.lon] as [number, number])),
    []
  );

  useEffect(() => {
    const el = mapEl.current;
    if (!el) return;

    const map = L.map(el, {
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    // Grid layout may settle after first paint — without this, tiles/bounds break.
    const settle = () => {
      map.invalidateSize();
      map.fitBounds(bounds.pad(0.18));
    };
    settle();
    const t1 = window.setTimeout(settle, 0);
    const t2 = window.setTimeout(settle, 120);
    setMapReady((n) => n + 1);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [bounds]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!mapReady || !map || !layer) return;
    layer.clearLayers();

    const fullLatLngs = STOPS.map((s) => [s.lat, s.lon] as [number, number]);
    L.polyline(fullLatLngs, {
      color: "#b7a894",
      weight: 2,
      opacity: 0.55,
      dashArray: "4 6",
    }).addTo(layer);

    for (let i = 0; i < STOPS.length - 1; i++) {
      const a = STOPS[i];
      const b = STOPS[i + 1];
      const active = i === vectorFrom;
      L.polyline(
        [
          [a.lat, a.lon],
          [b.lat, b.lon],
        ],
        {
          color: active ? "#3d2a1a" : "#8a7a68",
          weight: active ? 3.5 : 1.5,
          opacity: active ? 0.95 : 0.35,
        }
      ).addTo(layer);

      const tip = lerp(a, b, 0.72);
      const deg = bearingDeg(a, b);
      L.marker([tip.lat, tip.lon], {
        icon: arrowIcon(deg, active),
        interactive: false,
        keyboard: false,
      }).addTo(layer);
    }

    for (const stop of STOPS) {
      const active = stop.index === selected;
      const marker = L.marker([stop.lat, stop.lon], {
        icon: pinIcon(stop.index + 1, stop.confidence, active),
        title: stop.label_ru,
      });
      marker.on("click", () => setSelected(stop.index));
      marker.bindTooltip(`${stop.index + 1}. ${stop.label_ru}`, {
        direction: "top",
        offset: [0, -10],
      });
      marker.addTo(layer);
    }

    map.panTo([selectedStop.lat, selectedStop.lon], { animate: true });
  }, [mapReady, selected, selectedStop, vectorFrom]);

  return (
    <div className="jm-page">
      <aside className="jm-sidebar">
        <h1 className="jm-brand">Иисус — гео-карта</h1>
        <p className="jm-sub">{itinerary.label_ru}</p>
        <p className="jm-disclaimer">{itinerary.disclaimer_ru}</p>

        <div className="jm-nav">
          <a href={homeHref()}>← Civilization</a>
          <button
            type="button"
            className="jm-btn"
            disabled={selected <= 0}
            onClick={() => setSelected((i) => Math.max(0, i - 1))}
          >
            Назад
          </button>
          <button
            type="button"
            className="jm-btn"
            disabled={selected >= STOPS.length - 1}
            onClick={() => setSelected((i) => Math.min(STOPS.length - 1, i + 1))}
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
                  onClick={() => setSelected(stop.index)}
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
        <div ref={mapEl} className="jm-map" />
        <div className="jm-map-legend">
          Carto/OSM · стрелки = направление literary itinerary · confidence места
          из places.json · не firm travelogue
        </div>
      </div>
    </div>
  );
}
