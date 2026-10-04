/**
 * Build data/jesus_map_gospel_passages.json from justbible.ru (rst + rbo).
 * Usage: node scripts/fetch-jesus-gospel-ru.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "data", "jesus_map_gospel_passages.json");

/** Protestant book numbers 1–66: Mt=40 Mk=41 Lk=42 Jn=43 */
const BOOK = { mt: 40, mk: 41, lk: 42, jn: 43 };
const GOSPEL_RU = { mt: "Мф", mk: "Мк", lk: "Лк", jn: "Ин" };
const TRANSLATIONS = [
  { id: "rst", label_ru: "Синодальный" },
  { id: "rbo", label_ru: "РБО (современный)" },
];

/**
 * Parallel literary passages per map stop (place_id).
 * Ranges are chapter-local verse strings for the API.
 */
const STOPS = [
  {
    place_id: "jordan_valley",
    title_ru: "Крещение",
    passages: [
      { gospel: "mt", chapter: 3, verses: "13-17" },
      { gospel: "mk", chapter: 1, verses: "9-11" },
      { gospel: "lk", chapter: 3, verses: "21-22" },
    ],
  },
  {
    place_id: "cana",
    title_ru: "Кана · брак",
    passages: [{ gospel: "jn", chapter: 2, verses: "1-11" }],
  },
  {
    place_id: "capernaum",
    title_ru: "Капернаум",
    passages: [
      { gospel: "mt", chapter: 8, verses: "14-17" },
      { gospel: "mk", chapter: 1, verses: "21-34" },
      { gospel: "lk", chapter: 4, verses: "31-41" },
    ],
  },
  {
    place_id: "nazareth",
    title_ru: "Назарет",
    passages: [
      { gospel: "mt", chapter: 13, verses: "53-58" },
      { gospel: "mk", chapter: 6, verses: "1-6" },
      { gospel: "lk", chapter: 4, verses: "16-30" },
    ],
  },
  {
    place_id: "nain",
    title_ru: "Наин",
    passages: [{ gospel: "lk", chapter: 7, verses: "11-17" }],
  },
  {
    place_id: "sea_of_galilee",
    title_ru: "Буря на озере",
    passages: [
      { gospel: "mt", chapter: 8, verses: "23-27" },
      { gospel: "mk", chapter: 4, verses: "35-41" },
      { gospel: "lk", chapter: 8, verses: "22-25" },
      { gospel: "jn", chapter: 6, verses: "16-21" },
    ],
  },
  {
    place_id: "bethsaida",
    title_ru: "Вифсаида / насыщение",
    passages: [
      { gospel: "mt", chapter: 14, verses: "13-21" },
      { gospel: "mk", chapter: 6, verses: "30-44" },
      { gospel: "lk", chapter: 9, verses: "10-17" },
      { gospel: "jn", chapter: 6, verses: "1-15" },
    ],
  },
  {
    place_id: "decapolis",
    title_ru: "Герасинский / Декаполис",
    passages: [
      { gospel: "mt", chapter: 8, verses: "28-34" },
      { gospel: "mk", chapter: 5, verses: "1-20" },
      { gospel: "lk", chapter: 8, verses: "26-39" },
    ],
  },
  {
    place_id: "tyre_region",
    title_ru: "Тир / Сидон",
    passages: [
      { gospel: "mt", chapter: 15, verses: "21-28" },
      { gospel: "mk", chapter: 7, verses: "24-30" },
    ],
  },
  {
    place_id: "caesarea_philippi",
    title_ru: "Кесария Филиппова",
    passages: [
      { gospel: "mt", chapter: 16, verses: "13-20" },
      { gospel: "mk", chapter: 8, verses: "27-30" },
      { gospel: "lk", chapter: 9, verses: "18-21" },
    ],
  },
  {
    place_id: "samaria",
    title_ru: "Самария · колодец",
    passages: [{ gospel: "jn", chapter: 4, verses: "1-42" }],
  },
  {
    place_id: "jericho",
    title_ru: "Иерихон",
    passages: [
      { gospel: "mt", chapter: 20, verses: "29-34" },
      { gospel: "mk", chapter: 10, verses: "46-52" },
      { gospel: "lk", chapter: 18, verses: "35-43" },
    ],
  },
  {
    place_id: "bethany",
    title_ru: "Вифания",
    passages: [
      { gospel: "mt", chapter: 26, verses: "6-13" },
      { gospel: "mk", chapter: 14, verses: "3-9" },
      { gospel: "jn", chapter: 11, verses: "1-44" },
    ],
  },
  {
    place_id: "jerusalem",
    title_ru: "Иерусалим · Храм",
    passages: [
      { gospel: "mt", chapter: 21, verses: "12-17" },
      { gospel: "mk", chapter: 11, verses: "15-19" },
      { gospel: "lk", chapter: 19, verses: "45-48" },
      { gospel: "jn", chapter: 2, verses: "13-22" },
    ],
  },
];

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchVerses(translation, book, chapter, verses, attempt = 1) {
  const url = new URL("https://justbible.ru/api/bible");
  url.searchParams.set("translation", translation);
  url.searchParams.set("book", String(book));
  url.searchParams.set("chapter", String(chapter));
  url.searchParams.set("verses", verses);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`${res.status} ${url}`);
    }
    const data = await res.json();
    // API returns { "13": "text", "14": "text", ... }
    const keys = Object.keys(data)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b));
    return keys.map((k) => ({ n: Number(k), text: String(data[k]).trim() }));
  } catch (err) {
    if (attempt >= 6) throw err;
    const wait = 400 * attempt;
    console.warn(`retry ${attempt} ${translation} ${book}:${chapter}:${verses} (${wait}ms)`);
    await sleep(wait);
    return fetchVerses(translation, book, chapter, verses, attempt + 1);
  }
}

function joinVerses(rows) {
  return rows.map((r) => `${r.n}. ${r.text}`).join("\n");
}

async function main() {
  const by_place = {};
  for (const stop of STOPS) {
    const passages = [];
    for (const p of stop.passages) {
      const book = BOOK[p.gospel];
      const label = `${GOSPEL_RU[p.gospel]} ${p.chapter}:${p.verses}`;
      const versions = [];
      for (const tr of TRANSLATIONS) {
        const rows = await fetchVerses(tr.id, book, p.chapter, p.verses);
        versions.push({
          translation_id: tr.id,
          label_ru: tr.label_ru,
          text_ru: joinVerses(rows),
        });
        // be gentle to the public API
        await sleep(200);
      }
      passages.push({
        gospel: p.gospel,
        label_ru: label,
        ref: `${p.gospel === "mt" ? "Matt" : p.gospel === "mk" ? "Mark" : p.gospel === "lk" ? "Luke" : "John"}.${p.chapter}.${p.verses.replace("-", "-")}`,
        versions,
      });
      console.log("ok", stop.place_id, label);
    }
    by_place[stop.place_id] = {
      place_id: stop.place_id,
      title_ru: stop.title_ru,
      confidence: "literary",
      translation_note_ru:
        "Тексты: Синодальный (rst) и современный РБО (rbo) через justbible.ru. Literary-параллели к точке маршрута, не firm-хронология.",
      passages,
    };
  }

  const doc = {
    id: "jesus_map_gospel_passages_v1",
    label_ru: "Евангельские тексты к точкам гео-карты (RU)",
    confidence: "literary",
    source_ids: ["synoptic_gospels", "johannine_gospel"],
    attribution_ru:
      "Русский текст: Синодальный перевод и перевод РБО (API justbible.ru). Для UI civilization; не утверждение firm-биографии.",
    by_place,
  };

  await writeFile(out, JSON.stringify(doc, null, 2) + "\n", "utf8");
  console.log("wrote", out);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
