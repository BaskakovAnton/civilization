/**
 * P12 stub: spot-check Gnosis/Theographic release URLs without full ingest.
 * Usage: node scripts/check-upstream-available.mjs
 */
const URLS = [
  "https://raw.githubusercontent.com/robertrouse/theographic-bible-metadata/master/json/people.json",
  "https://api.github.com/repos/spearssoftware/gnosis/releases/latest",
];

async function main() {
  for (const url of URLS) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(res.status, url);
    } catch (e) {
      console.log("ERR", url, e.message);
    }
  }
  console.log(
    "Full Gnosis ingest still requires explicit ok; use extract:theographic for people candidates only."
  );
}

main();
