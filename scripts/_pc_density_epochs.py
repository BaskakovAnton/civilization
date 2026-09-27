#!/usr/bin/env python3
"""P-C: densify hellenistic_hasmonean + war_and_divergence."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
NRSV = "https://www.biblegateway.com/passage/?search={}&version=NRSVUE"


def dump(path: Path, data) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def upsert_by_id(items: list, item: dict) -> None:
    for i, x in enumerate(items):
        if x["id"] == item["id"]:
            items[i] = item
            return
    items.append(item)


def main() -> None:
    # --- people ---
    people_file = load(DATA / "candidates" / "people.json")
    people = people_file["people"]
    by_id = {p["id"]: p for p in people}

    for person in [
        {
            "id": "alexander_the_great",
            "label_ru": "Александр Македонский",
            "theographic_slug": "",
            "epoch_ids": ["hellenistic_hasmonean"],
            "confidence": "firm",
            "note_ru": "332 до н.э. — вход Иудеи в эллинистический мир; не биография по 1 Макк",
            "upstream": {"found": False},
        },
        {
            "id": "titus",
            "label_ru": "Тит",
            "theographic_slug": "",
            "epoch_ids": ["war_and_divergence"],
            "confidence": "firm",
            "note_ru": "Сын Веспасиана; осада и взятие Иерусалима 70 н.э.",
            "upstream": {"found": False},
        },
    ]:
        by_id[person["id"]] = person

    order_hint = [
        "abraham",
        "jacob",
        "joseph_patriarch",
        "moses",
        "aaron",
        "joshua",
        "saul",
        "david",
        "solomon",
        "omri",
        "ahab",
        "elijah",
        "jehu",
        "hezekiah",
        "josiah",
        "nebuchadnezzar",
        "cyrus",
        "ezra",
        "nehemiah",
        "alexander_the_great",
        "antiochus_iv",
        "mattathias",
        "judas_maccabeus",
        "pompey",
        "herod_the_great",
        "herod_archelaus",
        "pontius_pilate",
        "jesus_of_nazareth",
        "peter",
        "paul_of_tarsus",
        "josephus_flavius",
        "vespasian",
        "titus",
        "simon_bar_kokhba",
        "hadrian",
    ]
    ordered = [by_id[i] for i in order_hint if i in by_id]
    ordered += [p for pid, p in by_id.items() if pid not in set(order_hint)]
    people_file["people"] = ordered
    dump(DATA / "candidates" / "people.json", people_file)

    # --- claims ---
    hel = load(DATA / "claims" / "by-epoch" / "hellenistic_hasmonean.json")
    # alexander + rededication claims already exist
    dump(DATA / "claims" / "by-epoch" / "hellenistic_hasmonean.json", hel)

    war = load(DATA / "claims" / "by-epoch" / "war_and_divergence.json")
    upsert_by_id(
        war,
        {
            "id": "claim_war_and_divergence_masada",
            "epoch_id": "war_and_divergence",
            "statement_ru": "Падение Масады (~73/74 н.э.) завершает основной цикл Первой иудейской войны в нарративе Иосифа.",
            "confidence": "anchored",
            "date_min": 73,
            "date_max": 74,
            "source_ids": ["josephus_war", "modern_handbook"],
            "dissent_ru": "Детали самоубийства защитников — спорная литературная конструкция Иосифа",
            "citations": [
                {
                    "id": "cite_claim_war_masada",
                    "label_ru": "Siege of Masada",
                    "kind": "josephus",
                    "source_id": "josephus_war",
                    "url": "https://en.wikipedia.org/wiki/Siege_of_Masada",
                }
            ],
        },
    )
    dump(DATA / "claims" / "by-epoch" / "war_and_divergence.json", war)

    # --- interactions ---
    ints = load(DATA / "interactions.json")
    for item in [
        {
            "id": "int_alexander_antiochus_context",
            "epoch_id": "hellenistic_hasmonean",
            "from_person_id": "antiochus_iv",
            "to_person_id": "alexander_the_great",
            "relation": "succeeds",
            "label_ru": "Селевкиды (Антиох IV) действуют в эллинистическом порядке после Александра",
            "confidence": "firm",
            "source_ids": ["hellenistic_chronology", "modern_handbook"],
            "note_ru": "Не личное преемство; имперский контекст от Александра к диадохам/Селевкидам",
            "citations": [
                {
                    "id": "cite_int_alex_ant",
                    "label_ru": "Hellenistic period",
                    "kind": "web",
                    "source_id": "hellenistic_chronology",
                    "url": "https://en.wikipedia.org/wiki/Hellenistic_period",
                }
            ],
        },
        {
            "id": "int_judas_antiochus_opposes",
            "epoch_id": "hellenistic_hasmonean",
            "from_person_id": "judas_maccabeus",
            "to_person_id": "antiochus_iv",
            "relation": "opposes",
            "label_ru": "Иуда Маккавей возглавляет военный этап восстания против Антиоха IV",
            "confidence": "firm",
            "source_ids": ["1_macc", "2_macc", "hellenistic_chronology"],
            "citations": [
                {
                    "id": "cite_int_judas_ant",
                    "label_ru": "1 Макк 3–4",
                    "kind": "verse",
                    "source_id": "1_macc",
                    "ref": "1Macc.3-4",
                    "url": NRSV.format("1+Maccabees+3-4"),
                }
            ],
        },
        {
            "id": "int_titus_vespasian_succeeds",
            "epoch_id": "war_and_divergence",
            "from_person_id": "titus",
            "to_person_id": "vespasian",
            "relation": "succeeds",
            "label_ru": "Тит продолжает осаду Иерусалима после ухода Веспасиана к императорской власти",
            "confidence": "firm",
            "source_ids": ["josephus_war", "roman_fasti", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_titus_vesp",
                    "label_ru": "Titus / First Jewish–Roman War",
                    "kind": "josephus",
                    "source_id": "josephus_war",
                    "url": "https://en.wikipedia.org/wiki/Titus#First_Jewish%E2%80%93Roman_War",
                }
            ],
        },
        {
            "id": "int_josephus_titus_mentions",
            "epoch_id": "war_and_divergence",
            "from_person_id": "josephus_flavius",
            "to_person_id": "titus",
            "relation": "mentions",
            "label_ru": "Иосиф подробно описывает действия Тита при осаде Иерусалима",
            "confidence": "firm",
            "source_ids": ["josephus_war", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_jos_titus",
                    "label_ru": "The Jewish War",
                    "kind": "josephus",
                    "source_id": "josephus_war",
                    "url": "https://en.wikipedia.org/wiki/The_Jewish_War",
                }
            ],
        },
    ]:
        upsert_by_id(ints, item)
    dump(DATA / "interactions.json", ints)

    # --- places ---
    places = load(DATA / "places.json")
    upsert_by_id(
        places,
        {
            "id": "masada",
            "label_ru": "Масада",
            "epoch_ids": ["war_and_divergence"],
            "confidence": "firm",
            "note_ru": "Последний крупный очаг сопротивления (~73/74); нарратив Иосифа + археология",
            "source_ids": ["josephus_war", "modern_handbook"],
            "person_ids": ["josephus_flavius", "titus"],
            "citations": [
                {
                    "id": "cite_place_masada",
                    "label_ru": "Masada",
                    "kind": "josephus",
                    "source_id": "josephus_war",
                    "url": "https://en.wikipedia.org/wiki/Masada",
                }
            ],
        },
    )
    for pl in places:
        if pl["id"] == "jerusalem":
            for pid in ["alexander_the_great", "judas_maccabeus", "titus"]:
                if pid not in pl.get("person_ids", []):
                    pl.setdefault("person_ids", []).append(pid)
        if pl["id"] == "rome":
            for pid in ["titus", "josephus_flavius"]:
                if pid not in pl.get("person_ids", []):
                    pl.setdefault("person_ids", []).append(pid)
        if pl["id"] == "modein":
            if "antiochus_iv" not in pl.get("person_ids", []):
                pl.setdefault("person_ids", []).append("antiochus_iv")
    dump(DATA / "places.json", places)

    # --- polities ---
    polities = load(DATA / "polities.json")
    for pol in polities:
        if pol["id"] == "polity_seleucid":
            if "alexander_the_great" not in pol["person_ids"]:
                # Alexander is precursor context, not Seleucid — skip adding to seleucid
                pass
        if pol["id"] == "polity_rome":
            if "titus" not in pol["person_ids"]:
                pol["person_ids"].append("titus")
    dump(DATA / "polities.json", polities)

    # --- events ---
    events = load(DATA / "events.json")
    for e in events:
        if e["id"] == "evt_temple_70":
            if "titus" not in e.get("person_ids", []):
                e.setdefault("person_ids", []).append("titus")

    for e in [
        {
            "id": "evt_alexander_332",
            "label_ru": "Александр и эллинизация региона (контекст 332)",
            "epoch_id": "hellenistic_hasmonean",
            "place_ids": ["jerusalem"],
            "person_ids": ["alexander_the_great"],
            "date_min": -332,
            "date_max": -323,
            "confidence": "firm",
            "statement_ru": "После похода Александра Иудея входит в эллинистический мир (далее Птолемеи/Селевкиды).",
            "source_ids": ["hellenistic_chronology", "modern_handbook"],
            "note_ru": "Не отдельный «захват Иерусалима» как главный якорь; региональный перелом",
            "citations": [
                {
                    "id": "cite_evt_alex_332",
                    "label_ru": "Alexander the Great / Coele-Syria",
                    "kind": "web",
                    "source_id": "hellenistic_chronology",
                    "url": "https://en.wikipedia.org/wiki/Alexander_the_Great",
                }
            ],
        },
        {
            "id": "evt_temple_rededication_164",
            "label_ru": "Переосвящение храма (~164)",
            "epoch_id": "hellenistic_hasmonean",
            "place_ids": ["jerusalem"],
            "person_ids": ["judas_maccabeus"],
            "date_min": -164,
            "date_max": -164,
            "confidence": "anchored",
            "statement_ru": "Очищение храма после кризиса Антиоха IV — ядро хасмонейской памяти (Ханука в поздней традиции).",
            "source_ids": ["1_macc", "2_macc", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_evt_hanukkah",
                    "label_ru": "1 Макк 4:36–59",
                    "kind": "verse",
                    "source_id": "1_macc",
                    "ref": "1Macc.4.36-59",
                    "url": NRSV.format("1+Maccabees+4%3A36-59"),
                }
            ],
        },
        {
            "id": "evt_war_outbreak_66",
            "label_ru": "Начало Иудейской войны (66)",
            "epoch_id": "war_and_divergence",
            "place_ids": ["jerusalem"],
            "person_ids": ["josephus_flavius", "vespasian"],
            "date_min": 66,
            "date_max": 66,
            "confidence": "firm",
            "statement_ru": "Восстание против Рима в 66 н.э.; Веспасиан возглавляет подавление на севере.",
            "source_ids": ["josephus_war", "roman_fasti", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_evt_war_66",
                    "label_ru": "First Jewish–Roman War",
                    "kind": "josephus",
                    "source_id": "josephus_war",
                    "url": "https://en.wikipedia.org/wiki/First_Jewish%E2%80%93Roman_War",
                }
            ],
        },
        {
            "id": "evt_masada_73",
            "label_ru": "Падение Масады (~73/74)",
            "epoch_id": "war_and_divergence",
            "place_ids": ["masada"],
            "person_ids": ["josephus_flavius"],
            "date_min": 73,
            "date_max": 74,
            "confidence": "anchored",
            "statement_ru": "Последний крупный очаг сопротивления; детали финала у Иосифа читают критически.",
            "source_ids": ["josephus_war", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_evt_masada",
                    "label_ru": "Siege of Masada",
                    "kind": "josephus",
                    "source_id": "josephus_war",
                    "url": "https://en.wikipedia.org/wiki/Siege_of_Masada",
                }
            ],
        },
    ]:
        upsert_by_id(events, e)
    dump(DATA / "events.json", events)

    # summary
    people = people_file["people"]
    hel_p = [p["id"] for p in people if "hellenistic_hasmonean" in p["epoch_ids"]]
    war_p = [p["id"] for p in people if "war_and_divergence" in p["epoch_ids"]]
    hel_i = [i["id"] for i in ints if i["epoch_id"] == "hellenistic_hasmonean"]
    war_i = [i["id"] for i in ints if i["epoch_id"] == "war_and_divergence"]
    hel_e = [e["id"] for e in events if e["epoch_id"] == "hellenistic_hasmonean"]
    war_e = [e["id"] for e in events if e["epoch_id"] == "war_and_divergence"]
    print(
        json.dumps(
            {
                "people_total": len(people),
                "ints_total": len(ints),
                "events_total": len(events),
                "places_total": len(places),
                "hellenistic": {
                    "people": hel_p,
                    "ints": hel_i,
                    "events": hel_e,
                    "claims": len(hel),
                },
                "war": {
                    "people": war_p,
                    "ints": war_i,
                    "events": war_e,
                    "claims": len(war),
                },
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
