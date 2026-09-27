#!/usr/bin/env python3
"""PE: targeted content density (no new ontology)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
NRSV = "https://www.biblegateway.com/passage/?search={}&version=NRSVUE"


def dump(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def upsert(items: list, item: dict) -> None:
    for i, x in enumerate(items):
        if x["id"] == item["id"]:
            items[i] = item
            return
    items.append(item)


def main() -> None:
    people_file = load(DATA / "candidates" / "people.json")
    by_id = {p["id"]: p for p in people_file["people"]}

    for person in [
        {
            "id": "isaac",
            "label_ru": "Исаак",
            "theographic_slug": "",
            "epoch_ids": ["patriarchal_horizon"],
            "confidence": "literary",
            "note_ru": "Фигура генеалогии предания Авраам–Исаак–Иаков",
            "upstream": {"found": False},
        },
        {
            "id": "miriam",
            "label_ru": "Мириам",
            "theographic_slug": "",
            "epoch_ids": ["exodus_emergence"],
            "confidence": "literary",
            "note_ru": "Сестра Моисея/Аарона в предании Исхода",
            "upstream": {"found": False},
        },
        {
            "id": "zerubbabel",
            "label_ru": "Зерубавель",
            "theographic_slug": "",
            "epoch_ids": ["exile_and_persian"],
            "confidence": "disputed",
            "note_ru": "Фигура восстановления; хронология и роль спорны",
            "upstream": {"found": False},
        },
        {
            "id": "john_the_baptist",
            "label_ru": "Иоанн Креститель",
            "theographic_slug": "",
            "epoch_ids": ["jesus_jerusalem", "roman_herodian"],
            "confidence": "anchored",
            "note_ru": "Внешнее упоминание у Иосифа + традиция синоптиков",
            "upstream": {"found": False},
        },
        {
            "id": "yeshua_ben_galgula",
            "label_ru": "Иешуа бен Галгула",
            "theographic_slug": "",
            "epoch_ids": ["bar_kokhba"],
            "confidence": "firm",
            "note_ru": "Адресат/офицер в письмах Бар-Кохбы (административная сеть)",
            "upstream": {"found": False},
        },
    ]:
        by_id[person["id"]] = person

    order = [
        "abraham",
        "isaac",
        "jacob",
        "joseph_patriarch",
        "moses",
        "aaron",
        "miriam",
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
        "zerubbabel",
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
        "john_the_baptist",
        "jesus_of_nazareth",
        "peter",
        "james_of_jerusalem",
        "barnabas",
        "paul_of_tarsus",
        "josephus_flavius",
        "vespasian",
        "titus",
        "rabbi_akiva",
        "simon_bar_kokhba",
        "yeshua_ben_galgula",
        "hadrian",
    ]
    ordered = [by_id[i] for i in order if i in by_id]
    ordered += [p for pid, p in by_id.items() if pid not in set(order)]
    people_file["people"] = ordered
    dump(DATA / "candidates" / "people.json", people_file)

    # claims
    for path, claim in [
        (
            DATA / "claims" / "by-epoch" / "patriarchal_horizon.json",
            {
                "id": "claim_patriarchal_horizon_genealogy",
                "epoch_id": "patriarchal_horizon",
                "statement_ru": "Цепочка Авраам–Исаак–Иаков в Бытии задаёт генеалогическую рамку предания; внешняя биографическая аттестация отсутствует.",
                "confidence": "literary",
                "date_min": None,
                "date_max": None,
                "source_ids": ["genesis_narrative", "modern_handbook"],
                "citations": [
                    {
                        "id": "cite_claim_pat_geneal",
                        "label_ru": "Быт 21–28",
                        "kind": "verse",
                        "source_id": "genesis_narrative",
                        "ref": "Gen.21-28",
                        "url": NRSV.format("Genesis+21-28"),
                    }
                ],
            },
        ),
        (
            DATA / "claims" / "by-epoch" / "exile_and_persian.json",
            {
                "id": "claim_exile_and_persian_zerubbabel",
                "epoch_id": "exile_and_persian",
                "statement_ru": "Зерубавель фигурирует в традиции восстановления культа/общины Йехуда; объём исторической роли реконструируют осторожно.",
                "confidence": "disputed",
                "date_min": -538,
                "date_max": -515,
                "source_ids": ["ezra_nehemiah", "modern_handbook"],
                "citations": [
                    {
                        "id": "cite_claim_zerubbabel",
                        "label_ru": "Езд 3–5",
                        "kind": "verse",
                        "source_id": "ezra_nehemiah",
                        "ref": "Ezra.3-5",
                        "url": NRSV.format("Ezra+3-5"),
                    }
                ],
            },
        ),
        (
            DATA / "claims" / "by-epoch" / "jesus_jerusalem.json",
            {
                "id": "claim_jesus_jerusalem_baptist",
                "epoch_id": "jesus_jerusalem",
                "statement_ru": "Иоанн Креститель — независимый якорь контекста: упомянут Иосифом; связь с Иисусом держится на традиции синоптиков и критической фильтрации.",
                "confidence": "anchored",
                "date_min": 28,
                "date_max": 30,
                "source_ids": [
                    "josephus_antiquities",
                    "synoptic_gospels",
                    "modern_handbook",
                ],
                "citations": [
                    {
                        "id": "cite_claim_baptist_jos",
                        "label_ru": "Josephus on John the Baptist",
                        "kind": "josephus",
                        "source_id": "josephus_antiquities",
                        "url": "https://en.wikipedia.org/wiki/Josephus_on_Jesus#John_the_Baptist",
                    },
                    {
                        "id": "cite_claim_baptist_mark",
                        "label_ru": "Мк 1:2–11",
                        "kind": "verse",
                        "source_id": "synoptic_gospels",
                        "ref": "Mark.1.2-11",
                        "url": NRSV.format("Mark+1%3A2-11"),
                    },
                ],
            },
        ),
    ]:
        claims = load(path)
        upsert(claims, claim)
        dump(path, claims)

    ints = load(DATA / "interactions.json")
    for item in [
        {
            "id": "int_abraham_isaac_kin",
            "epoch_id": "patriarchal_horizon",
            "from_person_id": "abraham",
            "to_person_id": "isaac",
            "relation": "kin",
            "label_ru": "Авраам — отец Исаака в генеалогии предания",
            "confidence": "literary",
            "source_ids": ["genesis_narrative", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_abr_isaac",
                    "label_ru": "Быт 21",
                    "kind": "verse",
                    "source_id": "genesis_narrative",
                    "ref": "Gen.21",
                    "url": NRSV.format("Genesis+21"),
                }
            ],
        },
        {
            "id": "int_isaac_jacob_kin",
            "epoch_id": "patriarchal_horizon",
            "from_person_id": "isaac",
            "to_person_id": "jacob",
            "relation": "kin",
            "label_ru": "Исаак — отец Иакова в генеалогии предания",
            "confidence": "literary",
            "source_ids": ["genesis_narrative", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_isaac_jac",
                    "label_ru": "Быт 25; 27",
                    "kind": "verse",
                    "source_id": "genesis_narrative",
                    "ref": "Gen.25;27",
                    "url": NRSV.format("Genesis+25%3B+Genesis+27"),
                }
            ],
        },
        {
            "id": "int_moses_miriam_kin",
            "epoch_id": "exodus_emergence",
            "from_person_id": "moses",
            "to_person_id": "miriam",
            "relation": "kin",
            "label_ru": "Моисей и Мириам — сиблинги в предании Исхода",
            "confidence": "literary",
            "source_ids": ["exodus_narrative", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_mos_mir",
                    "label_ru": "Исх 15:20–21",
                    "kind": "verse",
                    "source_id": "exodus_narrative",
                    "ref": "Exod.15.20-21",
                    "url": NRSV.format("Exodus+15%3A20-21"),
                }
            ],
        },
        {
            "id": "int_zerubbabel_cyrus_context",
            "epoch_id": "exile_and_persian",
            "from_person_id": "zerubbabel",
            "to_person_id": "cyrus",
            "relation": "serves",
            "label_ru": "Зерубавель действует в персидском контексте после указа Кира (традиция восстановления)",
            "confidence": "disputed",
            "source_ids": ["ezra_nehemiah", "cyrus_cylinder", "modern_handbook"],
            "note_ru": "Не личная служба Киру; имперский фон возвращения",
            "citations": [
                {
                    "id": "cite_int_zer_cyrus",
                    "label_ru": "Езд 1–3",
                    "kind": "verse",
                    "source_id": "ezra_nehemiah",
                    "ref": "Ezra.1-3",
                    "url": NRSV.format("Ezra+1-3"),
                }
            ],
        },
        {
            "id": "int_zerubbabel_ezra_context",
            "epoch_id": "exile_and_persian",
            "from_person_id": "ezra",
            "to_person_id": "zerubbabel",
            "relation": "succeeds",
            "label_ru": "Традиция связывает Зерубавеля (раннее восстановление) и Эзру (закон/община) как этапы Йехуда",
            "confidence": "disputed",
            "source_ids": ["ezra_nehemiah", "modern_handbook"],
            "note_ru": "Не прямое личное преемство; хронологический разрыв спорен",
            "citations": [
                {
                    "id": "cite_int_zer_ezra",
                    "label_ru": "Езд 3; 7",
                    "kind": "verse",
                    "source_id": "ezra_nehemiah",
                    "ref": "Ezra.3;7",
                    "url": NRSV.format("Ezra+3%3B+Ezra+7"),
                }
            ],
        },
        {
            "id": "int_jesus_baptist_meets",
            "epoch_id": "jesus_jerusalem",
            "from_person_id": "jesus_of_nazareth",
            "to_person_id": "john_the_baptist",
            "relation": "meets",
            "label_ru": "Иисус связан с движением Иоанна (крещение / преемство проповеди в традиции)",
            "confidence": "anchored",
            "source_ids": ["synoptic_gospels", "josephus_antiquities", "modern_handbook"],
            "note_ru": "Факт крещения Иисуса у Иоанна — сильный критический консенсус; детали — literary",
            "citations": [
                {
                    "id": "cite_int_jes_baptist",
                    "label_ru": "Мк 1:9–11",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.1.9-11",
                    "url": NRSV.format("Mark+1%3A9-11"),
                }
            ],
        },
        {
            "id": "int_josephus_baptist_mentions",
            "epoch_id": "jesus_jerusalem",
            "from_person_id": "josephus_flavius",
            "to_person_id": "john_the_baptist",
            "relation": "mentions",
            "label_ru": "Иосиф упоминает Иоанна Крестителя независимо от евангелий",
            "confidence": "firm",
            "source_ids": ["josephus_antiquities", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_jos_baptist",
                    "label_ru": "Josephus — John the Baptist",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/Josephus_on_Jesus#John_the_Baptist",
                }
            ],
        },
        {
            "id": "int_bar_kokhba_writes_galgula",
            "epoch_id": "bar_kokhba",
            "from_person_id": "simon_bar_kokhba",
            "to_person_id": "yeshua_ben_galgula",
            "relation": "writes_to",
            "label_ru": "Бар-Кохба пишет Иешуа бен Галгуле (снабжение/назначения в архиве пустыни)",
            "confidence": "firm",
            "source_ids": ["bar_kokhba_letters", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_bk_writes",
                    "label_ru": "Bar Kokhba letters",
                    "kind": "inscription",
                    "source_id": "bar_kokhba_letters",
                    "url": "https://en.wikipedia.org/wiki/Bar_Kokhba_letters",
                }
            ],
        },
    ]:
        upsert(ints, item)
    # josephus is war epoch primarily - adding jesus_jerusalem to josephus for baptist mention edge
    dump(DATA / "interactions.json", ints)

    # extend josephus epoch_ids for baptist mention in jesus epoch graph
    for p in people_file["people"]:
        if p["id"] == "josephus_flavius":
            if "jesus_jerusalem" not in p["epoch_ids"]:
                p["epoch_ids"].append("jesus_jerusalem")
    dump(DATA / "candidates" / "people.json", people_file)

    places = load(DATA / "places.json")
    upsert(
        places,
        {
            "id": "hebron",
            "label_ru": "Хеврон",
            "epoch_ids": ["patriarchal_horizon"],
            "confidence": "literary",
            "note_ru": "Традиционное место погребения праотцев; не абсолютная хронология",
            "source_ids": ["genesis_narrative", "modern_handbook"],
            "person_ids": ["abraham", "isaac", "jacob"],
            "citations": [
                {
                    "id": "cite_place_hebron",
                    "label_ru": "Быт 23",
                    "kind": "verse",
                    "source_id": "genesis_narrative",
                    "ref": "Gen.23",
                    "url": NRSV.format("Genesis+23"),
                }
            ],
        },
    )
    for pl in places:
        if pl["id"] == "egypt" and "miriam" not in pl.get("person_ids", []):
            pl.setdefault("person_ids", []).append("miriam")
        if pl["id"] == "yehud":
            if "zerubbabel" not in pl.get("person_ids", []):
                pl.setdefault("person_ids", []).append("zerubbabel")
        if pl["id"] == "judean_desert":
            if "yeshua_ben_galgula" not in pl.get("person_ids", []):
                pl.setdefault("person_ids", []).append("yeshua_ben_galgula")
        if pl["id"] == "galilee" and "john_the_baptist" not in pl.get("person_ids", []):
            pl.setdefault("person_ids", []).append("john_the_baptist")
    dump(DATA / "places.json", places)

    events = load(DATA / "events.json")
    for e in [
        {
            "id": "evt_nehemiah_wall",
            "label_ru": "Стена Неемии (традиция восстановления)",
            "epoch_id": "exile_and_persian",
            "place_ids": ["jerusalem", "yehud"],
            "person_ids": ["nehemiah", "ezra"],
            "date_min": -445,
            "date_max": -430,
            "confidence": "disputed",
            "statement_ru": "Традиция Неемии о восстановлении стен Иерусалима; хронология и масштаб спорны.",
            "source_ids": ["ezra_nehemiah", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_evt_neh_wall",
                    "label_ru": "Неем 2–6",
                    "kind": "verse",
                    "source_id": "ezra_nehemiah",
                    "ref": "Neh.2-6",
                    "url": NRSV.format("Nehemiah+2-6"),
                }
            ],
        },
        {
            "id": "evt_baptist_activity",
            "label_ru": "Проповедь Иоанна Крестителя",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["galilee", "jerusalem"],
            "person_ids": ["john_the_baptist", "jesus_of_nazareth"],
            "date_min": 28,
            "date_max": 30,
            "confidence": "anchored",
            "statement_ru": "Иоанн как независимый проповедник крещения; связь с Иисусом — в традиции и критическом консенсусе о крещении.",
            "source_ids": [
                "josephus_antiquities",
                "synoptic_gospels",
                "modern_handbook",
            ],
            "citations": [
                {
                    "id": "cite_evt_baptist",
                    "label_ru": "Josephus / Mark 1",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/John_the_Baptist",
                }
            ],
        },
        {
            "id": "evt_hebron_machpelah",
            "label_ru": "Пещера Махпела / Хеврон (предание)",
            "epoch_id": "patriarchal_horizon",
            "place_ids": ["hebron"],
            "person_ids": ["abraham", "isaac", "jacob"],
            "date_min": None,
            "date_max": None,
            "confidence": "literary",
            "statement_ru": "Предание о родовом погребении праотцев в Хевроне; без внешней абсолютной даты.",
            "source_ids": ["genesis_narrative", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_evt_machpelah",
                    "label_ru": "Быт 23",
                    "kind": "verse",
                    "source_id": "genesis_narrative",
                    "ref": "Gen.23",
                    "url": NRSV.format("Genesis+23"),
                }
            ],
        },
    ]:
        upsert(events, e)
    dump(DATA / "events.json", events)

    # polity persia: zerubbabel
    polities = load(DATA / "polities.json")
    for pol in polities:
        if pol["id"] == "polity_persia" and "zerubbabel" not in pol["person_ids"]:
            pol["person_ids"].append("zerubbabel")
        if pol["id"] == "polity_rome" and "john_the_baptist" not in pol["person_ids"]:
            pol["person_ids"].append("john_the_baptist")
    dump(DATA / "polities.json", polities)

    print(
        json.dumps(
            {
                "people": len(people_file["people"]),
                "ints": len(ints),
                "events": len(events),
                "places": len(places),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
