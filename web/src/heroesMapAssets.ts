/** Heroes-style art under web/public/heroes-map/ */
import markerLayout from "../../data/jesus_map_marker_layout.json";

const PLACE_IDS = [
  "jordan_valley",
  "cana",
  "capernaum",
  "nazareth",
  "nain",
  "sea_of_galilee",
  "bethsaida",
  "decapolis",
  "tyre_region",
  "caesarea_philippi",
  "samaria",
  "jericho",
  "bethany",
  "jerusalem",
] as const;

export type HeroesPlaceId = (typeof PLACE_IDS)[number];

export type MarkerXY = { x: number; y: number };

const markers = markerLayout.markers as Record<string, MarkerXY>;

function publicHref(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}${path.replace(/^\//, "")}`;
}

export function heroesOverworldHref(): string {
  return publicHref("heroes-map/overworld.jpg");
}

export function heroesLocationHref(placeId: string): string | null {
  if (!(PLACE_IDS as readonly string[]).includes(placeId)) return null;
  return publicHref(`heroes-map/locations/${placeId}.jpg`);
}

export function heroesMarkerXY(placeId: string): MarkerXY | null {
  return markers[placeId] ?? null;
}
