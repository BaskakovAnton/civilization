/**
 * Integrity checks for data/* — fail CI if ids or provenance break.
 * Usage: node scripts/validate-data.mjs
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const data = path.join(root, "data");

const CONF = new Set(["literary", "disputed", "anchored", "firm"]);
const REL = new Set([
  "kin",
  "appoints",
  "serves",
  "opposes",
  "meets",
  "writes_to",
  "judges",
  "succeeds",
  "allies",
  "mentions",
]);
const CITE_KIND = new Set([
  "verse",
  "inscription",
  "josephus",
  "web",
  "handbook",
]);

const errors = [];
const warn = [];

function err(msg) {
  errors.push(msg);
}

async function loadJson(rel) {
  const text = await readFile(path.join(root, rel), "utf8");
  return JSON.parse(text);
}

function checkCitations(owner, citations, { requireUrl = true } = {}) {
  if (!Array.isArray(citations) || citations.length === 0) {
    err(`${owner}: missing citations`);
    return;
  }
  for (const c of citations) {
    if (!c?.id) err(`${owner}: citation without id`);
    if (!c?.label_ru) err(`${owner}: citation ${c?.id} without label_ru`);
    if (!CITE_KIND.has(c?.kind)) {
      err(`${owner}: citation ${c?.id} bad kind ${c?.kind}`);
    }
    if (requireUrl && !c?.url) {
      err(`${owner}: citation ${c?.id} missing url`);
    }
  }
}

async function main() {
  const epochs = await loadJson("data/epochs.json");
  const sources = await loadJson("data/sources.json");
  const interactions = await loadJson("data/interactions.json");
  const places = await loadJson("data/places.json");
  const events = await loadJson("data/events.json");
  const polities = await loadJson("data/polities.json");
  const candidatesFile = await loadJson("data/candidates/people.json");
  const people = candidatesFile.people || [];

  const epochIds = new Set(epochs.map((e) => e.id));
  const sourceIds = new Set(sources.map((s) => s.id));
  const personIds = new Set(people.map((p) => p.id));
  const placeIds = new Set(places.map((p) => p.id));

  for (const e of epochs) {
    if (!CONF.has(e.confidence)) err(`epoch ${e.id}: bad confidence`);
  }

  for (const s of sources) {
    if (!s.id) err("source without id");
  }

  for (const p of people) {
    if (!p.id) err("person without id");
    if (!CONF.has(p.confidence)) err(`person ${p.id}: bad confidence`);
    for (const ep of p.epoch_ids || []) {
      if (!epochIds.has(ep)) err(`person ${p.id}: unknown epoch ${ep}`);
    }
  }

  const claimDir = path.join(data, "claims", "by-epoch");
  const claimFiles = (await readdir(claimDir)).filter(
    (f) => f.endsWith(".json") && f !== "index.json"
  );
  const claims = [];
  for (const f of claimFiles) {
    const list = await loadJson(`data/claims/by-epoch/${f}`);
    for (const c of list) claims.push(c);
  }

  function checkClaim(c, { allowLayer = false } = {}) {
    if (!/^claim_[a-z0-9_]+$/.test(c.id)) err(`claim bad id ${c.id}`);
    if (!epochIds.has(c.epoch_id)) err(`claim ${c.id}: unknown epoch`);
    if (!CONF.has(c.confidence)) err(`claim ${c.id}: bad confidence`);
    if (!c.source_ids?.length) err(`claim ${c.id}: no source_ids`);
    for (const sid of c.source_ids || []) {
      if (!sourceIds.has(sid)) err(`claim ${c.id}: unknown source ${sid}`);
    }
    if (c.layer && !allowLayer) {
      err(`claim ${c.id}: layer=${c.layer} not allowed in by-epoch baseline`);
    }
    if (allowLayer && c.layer !== "church_fathers") {
      err(`claim ${c.id}: fathers layer requires layer=church_fathers`);
    }
    checkCitations(`claim ${c.id}`, c.citations);
  }

  for (const c of claims) checkClaim(c);

  const fathersFile = await loadJson("data/layers/fathers/claims.json");
  const fathersClaims = fathersFile.claims || [];
  if (fathersFile.meta?.default_enabled !== false) {
    err("fathers layer meta.default_enabled must be false");
  }
  for (const c of fathersClaims) checkClaim(c, { allowLayer: true });

  for (const i of interactions) {
    if (!/^int_[a-z0-9_]+$/.test(i.id)) err(`interaction bad id ${i.id}`);
    if (!epochIds.has(i.epoch_id)) err(`int ${i.id}: unknown epoch`);
    if (!REL.has(i.relation)) err(`int ${i.id}: bad relation`);
    if (!CONF.has(i.confidence)) err(`int ${i.id}: bad confidence`);
    if (!personIds.has(i.from_person_id)) {
      err(`int ${i.id}: unknown from ${i.from_person_id}`);
    }
    if (!personIds.has(i.to_person_id)) {
      err(`int ${i.id}: unknown to ${i.to_person_id}`);
    }
    for (const sid of i.source_ids || []) {
      if (!sourceIds.has(sid)) err(`int ${i.id}: unknown source ${sid}`);
    }
    checkCitations(`int ${i.id}`, i.citations);
  }

  const linked = new Set();
  for (const i of interactions) {
    linked.add(i.from_person_id);
    linked.add(i.to_person_id);
  }
  for (const p of people) {
    if (!linked.has(p.id)) err(`orphan person (no edges): ${p.id}`);
  }

  for (const pl of places) {
    if (!/^[a-z][a-z0-9_]*$/.test(pl.id)) err(`place bad id ${pl.id}`);
    if (!CONF.has(pl.confidence)) err(`place ${pl.id}: bad confidence`);
    for (const ep of pl.epoch_ids || []) {
      if (!epochIds.has(ep)) err(`place ${pl.id}: unknown epoch ${ep}`);
    }
    for (const sid of pl.source_ids || []) {
      if (!sourceIds.has(sid)) err(`place ${pl.id}: unknown source ${sid}`);
    }
    for (const pid of pl.person_ids || []) {
      if (!personIds.has(pid)) err(`place ${pl.id}: unknown person ${pid}`);
    }
    checkCitations(`place ${pl.id}`, pl.citations);
  }

  for (const e of events) {
    if (!/^evt_[a-z0-9_]+$/.test(e.id)) err(`event bad id ${e.id}`);
    if (!epochIds.has(e.epoch_id)) err(`event ${e.id}: unknown epoch`);
    if (!CONF.has(e.confidence)) err(`event ${e.id}: bad confidence`);
    for (const sid of e.source_ids || []) {
      if (!sourceIds.has(sid)) err(`event ${e.id}: unknown source ${sid}`);
    }
    for (const pid of e.person_ids || []) {
      if (!personIds.has(pid)) err(`event ${e.id}: unknown person ${pid}`);
    }
    for (const pid of e.place_ids || []) {
      if (!placeIds.has(pid)) err(`event ${e.id}: unknown place ${pid}`);
    }
    checkCitations(`event ${e.id}`, e.citations);
  }

  for (const pol of polities) {
    for (const ep of pol.epoch_ids || []) {
      if (!epochIds.has(ep)) err(`polity ${pol.id}: unknown epoch ${ep}`);
    }
    for (const sid of pol.source_ids || []) {
      if (!sourceIds.has(sid)) err(`polity ${pol.id}: unknown source ${sid}`);
    }
    for (const pid of pol.person_ids || []) {
      if (!personIds.has(pid)) err(`polity ${pol.id}: unknown person ${pid}`);
    }
  }

  const placesWithCite = places.filter((p) => p.citations?.length).length;
  if (placesWithCite < 14) {
    err(`places with citations ${placesWithCite}/15 (need ≥14)`);
  }

  console.log(
    JSON.stringify(
      {
        ok: errors.length === 0,
        counts: {
          epochs: epochs.length,
          sources: sources.length,
          people: people.length,
          claims: claims.length,
          fathers_claims: fathersClaims.length,
          interactions: interactions.length,
          places: places.length,
          events: events.length,
          polities: polities.length,
          places_with_citations: placesWithCite,
        },
        errors,
        warnings: warn,
      },
      null,
      2
    )
  );

  if (errors.length) {
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
