/** Shared place_id ↔ Larkin event bridge for jesus.html?stop= */

export const LARKIN_EVENT_TO_PLACE: Record<string, string> = {
  evt_baptism_jordan: "jordan_valley",
  evt_miracle_cana: "cana",
  evt_miracle_capernaum: "capernaum",
  evt_miracle_nazareth_reject: "nazareth",
  evt_miracle_nain: "nain",
  evt_miracle_sea: "sea_of_galilee",
  evt_miracle_gerasene: "decapolis",
  evt_miracle_feeding: "bethsaida",
  evt_miracle_tyre: "tyre_region",
  evt_path_caesarea_philippi: "caesarea_philippi",
  evt_miracle_samaria_well: "samaria",
  evt_miracle_bethesda: "jerusalem",
  evt_miracle_jericho: "jericho",
  evt_miracle_bethany: "bethany",
  evt_temple_incident: "jerusalem",
  evt_crucifixion: "jerusalem",
};

export const PLACE_TO_LARKIN_EVENT: Record<string, string> = Object.fromEntries(
  Object.entries(LARKIN_EVENT_TO_PLACE).map(([evt, place]) => [place, evt])
);

export function jesusGeoHref(placeId: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}jesus.html?stop=${encodeURIComponent(placeId)}`;
}

/** Deep-link back into main app path view (hash). */
export function larkinAppHref(placeId: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  const evt = PLACE_TO_LARKIN_EVENT[placeId];
  const q = new URLSearchParams({ epoch: "jesus_jerusalem", path: "1" });
  if (evt) q.set("event", evt);
  q.set("stop", placeId);
  return `${root}index.html?${q.toString()}`;
}
