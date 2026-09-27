/**
 * P4: скачать Theographic people.json и обогатить data/candidates/people.json.
 * Полный дамп не коммитим — только raw/ (gitignore) + curated candidates.
 *
 * Usage: node scripts/extract-theographic-people.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const rawDir = path.join(root, "data", "external", "raw");
const rawPeople = path.join(rawDir, "theographic-people.json");
const candidatesPath = path.join(root, "data", "candidates", "people.json");
const UPSTREAM =
  "https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/people.json";

function asList(data) {
  return Array.isArray(data) ? data : Object.values(data);
}

function fieldsOf(p) {
  return p?.fields && typeof p.fields === "object" ? p.fields : p;
}

function indexPeople(data) {
  const byLookup = new Map();
  const byName = new Map();
  const list = asList(data);
  for (const p of list) {
    const f = fieldsOf(p);
    const lookup = String(f.personLookup || f.slug || "").toLowerCase();
    const name = String(f.name || f.displayTitle || "").toLowerCase();
    if (lookup) byLookup.set(lookup, f);
    if (name && !byName.has(name)) byName.set(name, f);
  }
  return { byLookup, byName, list };
}

/** Prefer exact personLookup; prefix only if slug has no numeric id. */
function matchPerson(person, index) {
  const slug = String(person.theographic_slug || "").toLowerCase();
  if (slug && index.byLookup.has(slug)) return index.byLookup.get(slug);

  // Already pinned to theographic id (name_123) but missing upstream → fail soft
  if (slug && /_[0-9]+$/.test(slug)) return null;

  if (slug && !["judas", "jesus", "joseph", "simon"].includes(slug)) {
    const prefix = `${slug}_`;
    const prefixed = [...index.byLookup.keys()]
      .filter((k) => k.startsWith(prefix))
      .sort((a, b) => a.length - b.length);
    if (prefixed.length === 1) return index.byLookup.get(prefixed[0]);
  }

  const pinned = {
    abraham: "abraham_58",
    jacob: "jacob_683",
    joseph_patriarch: "joseph_1710",
    moses: "moses_2108",
    aaron: "aaron_1",
    joshua: "joshua_893",
    david: "david_994",
    solomon: "solomon_2762",
    omri: "omri_2243",
    ahab: "ahab_113",
    jehu: "jehu_816",
    elijah: "elijah_1131",
    hezekiah: "hezekiah_1512",
    sennacherib: "sennacherib_2489",
    josiah: "josiah_1730",
    nebuchadnezzar: "nebuchadnezzar_2167",
    cyrus: "cyrus_968",
    ezra: "ezra_1244",
    nehemiah: "nehemiah_2171",
    mattathias: "mattathias_1963",
    herod_the_great: "herod_1504",
    pontius_pilate: "pilate_2365",
    jesus_of_nazareth: "jesus_905",
    peter: "peter_2745",
    paul_of_tarsus: "paul_2479",
    saul: "saul_2478",
    barnabas: "barnabas_1722",
    // Brother of Jesus — not Zebedee / Alphaeus
    james_of_jerusalem: "james_719",
    isaac: "isaac_616",
    miriam: "miriam_2087",
    zerubbabel: "zerubbabel_3054",
    john_the_baptist: "john_1676",
    // Exact lookup only (disambiguation fields in upstream are noisy)
    caiaphas: "caiaphas_532",
    herod_antipas: "herod_1505",
    mary_magdalene: "mary_1943",
    judas_iscariot: "judas_1760",
  };
  const pin = pinned[person.id];
  if (pin && index.byLookup.has(pin)) return index.byLookup.get(pin);

  return null;
}

async function ensureRaw() {
  await mkdir(rawDir, { recursive: true });
  try {
    await readFile(rawPeople, "utf8");
    console.log("Using cached", rawPeople);
    return;
  } catch {
    /* download */
  }
  console.log("Downloading Theographic people.json …");
  const res = await fetch(UPSTREAM);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${UPSTREAM}`);
  const text = await res.text();
  await writeFile(rawPeople, text, "utf8");
  console.log("Saved", rawPeople, `(${(text.length / 1e6).toFixed(1)} MB)`);
}

async function main() {
  await ensureRaw();
  const raw = JSON.parse(await readFile(rawPeople, "utf8"));
  const index = indexPeople(raw);
  console.log("Indexed people:", index.list.length);

  const file = JSON.parse(await readFile(candidatesPath, "utf8"));
  let found = 0;
  let missing = 0;
  file.people = file.people.map((person) => {
    // strip previous upstream before rematch
    const { upstream: _u, ...rest } = person;
    void _u;
    const hit = matchPerson(rest, index);
    if (!hit) {
      missing += 1;
      return { ...rest, upstream: { found: false } };
    }
    found += 1;
    const also = hit.alsoCalled || hit.aka || [];
    return {
      ...rest,
      theographic_slug: hit.personLookup || rest.theographic_slug,
      upstream: {
        found: true,
        name: hit.name || hit.displayTitle || null,
        alsoCalled: Array.isArray(also) ? also.slice(0, 8) : [],
        dictionaryLink: hit.dictionaryLink || null,
      },
    };
  });

  await writeFile(candidatesPath, JSON.stringify(file, null, 2) + "\n", "utf8");
  console.log(`Updated candidates: found=${found} missing=${missing}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
