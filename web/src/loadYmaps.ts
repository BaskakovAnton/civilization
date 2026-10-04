/** Load Yandex Maps JS API 2.1 (cabinet key works with 2.1; v3 → 403). */

export type YmapsMap = {
  geoObjects: {
    add: (o: unknown) => void;
    removeAll: () => void;
    getBounds: () => number[][] | null;
  };
  setCenter: (c: number[], zoom?: number, opts?: { duration?: number }) => void;
  setBounds: (
    b: number[][],
    opts?: {
      checkZoomRange?: boolean;
      duration?: number;
      zoomMargin?: number | number[];
      preciseZoom?: boolean;
    }
  ) => void | Promise<unknown>;
  getZoom: () => number;
  setZoom: (zoom: number, opts?: { duration?: number }) => void;
  setType?: (type: string) => void;
  options: {
    set: (key: string, value: unknown) => void;
    unset?: (key: string) => void;
  };
  controls?: {
    remove: (c: unknown) => void;
    get: (name: string) => unknown;
    each?: (fn: (c: { options?: { get?: (k: string) => unknown } }) => void) => void;
  };
  panes?: {
    get: (name: string) => { getElement?: () => HTMLElement | null } | null;
  };
  container: {
    fitToViewport: () => void;
    getSize: () => number[];
  };
  destroy: () => void;
};

/** Hide Yandex POI / toponym panes when they exist as separate DOM layers. */
export function hideYandexExtraneousLabels(map: YmapsMap) {
  for (const name of ["places", "overlaps", "outdoor", "copyrights"]) {
    try {
      const el = map.panes?.get?.(name)?.getElement?.();
      if (el) el.style.display = "none";
    } catch {
      /* pane may be absent */
    }
  }
}

/** Keep only the zoom slider; drop any other chrome Yandex injects. */
export function keepOnlyZoomControl(map: YmapsMap) {
  const drop = [
    "searchControl",
    "trafficControl",
    "typeSelector",
    "fullscreenControl",
    "geolocationControl",
    "rulerControl",
    "routeButtonControl",
    "routePanelControl",
  ];
  for (const name of drop) {
    try {
      const c = map.controls?.get?.(name);
      if (c) map.controls?.remove(c);
    } catch {
      /* absent */
    }
  }
}

type YmapsNS = {
  ready: (cb: () => void) => void;
  Map: new (
    el: string | HTMLElement,
    state: Record<string, unknown>,
    options?: Record<string, unknown>
  ) => YmapsMap;
  Placemark: new (
    coords: number[],
    props?: Record<string, unknown>,
    opts?: Record<string, unknown>
  ) => unknown;
  Polyline: new (
    coords: number[][],
    props?: Record<string, unknown>,
    opts?: Record<string, unknown>
  ) => unknown;
  Rectangle: new (
    geometry: number[][] | number[][][],
    props?: Record<string, unknown>,
    opts?: Record<string, unknown>
  ) => unknown;
};

declare global {
  interface Window {
    ymaps?: YmapsNS;
  }
}

let loading: Promise<YmapsNS> | null = null;

export function loadYmaps(apikey: string): Promise<YmapsNS> {
  if (window.ymaps) {
    return new Promise((resolve) => {
      window.ymaps!.ready(() => resolve(window.ymaps!));
    });
  }
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apikey)}&lang=ru_RU`;
    s.async = true;
    s.dataset.ymaps21 = "1";
    s.onload = () => {
      if (!window.ymaps) {
        reject(new Error("ymaps missing after script load"));
        return;
      }
      window.ymaps.ready(() => resolve(window.ymaps!));
    };
    s.onerror = () =>
      reject(
        new Error(
          "ymaps script failed (проверьте ключ JavaScript API и HTTP Referer: localhost, 127.0.0.1, baskakovanton.github.io)"
        )
      );
    document.head.appendChild(s);
  });

  return loading;
}
