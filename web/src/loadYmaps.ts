/** Load Yandex Maps JS API 2.1 (key works with 2.1; v3 returns 403 for this cabinet key). */

export type YmapsMap = {
  geoObjects: {
    add: (o: unknown) => void;
    removeAll: () => void;
  };
  setCenter: (c: number[], zoom?: number, opts?: { duration?: number }) => void;
  setBounds: (
    b: number[][],
    opts?: { checkZoomRange?: boolean; duration?: number }
  ) => void;
  destroy: () => void;
};

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
