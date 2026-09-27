#!/usr/bin/env python3
"""Densify jesus_jerusalem per Jesus Branch Densify plan."""
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
            "id": "caiaphas",
            "label_ru": "Каиафа",
            "theographic_slug": "",
            "epoch_ids": ["jesus_jerusalem", "roman_herodian"],
            "confidence": "anchored",
            "note_ru": "Первосвященник; Иосиф + контекст иудейского суда (детали процесса спорны)",
            "upstream": {"found": False},
        },
        {
            "id": "herod_antipas",
            "label_ru": "Ирод Антипас",
            "theographic_slug": "",
            "epoch_ids": ["roman_herodian", "jesus_jerusalem"],
            "confidence": "firm",
            "note_ru": "Тетрарх Галилеи; казнь Иоанна у Иосифа",
            "upstream": {"found": False},
        },
        {
            "id": "mary_magdalene",
            "label_ru": "Мария Магдалина",
            "theographic_slug": "",
            "epoch_ids": ["jesus_jerusalem"],
            "confidence": "disputed",
            "note_ru": "Ранняя ученица в традиции синоптиков; не поднимать выше disputed",
            "upstream": {"found": False},
        },
        {
            "id": "judas_iscariot",
            "label_ru": "Иуда Искариот",
            "theographic_slug": "",
            "epoch_ids": ["jesus_jerusalem"],
            "confidence": "literary",
            "note_ru": "Узел предания о выдаче; literary, не внешняя биография",
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
        "herod_antipas",
        "pontius_pilate",
        "caiaphas",
        "john_the_baptist",
        "jesus_of_nazareth",
        "mary_magdalene",
        "judas_iscariot",
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

    places = load(DATA / "places.json")
    upsert(
        places,
        {
            "id": "nazareth",
            "label_ru": "Назарет",
            "epoch_ids": ["jesus_jerusalem"],
            "confidence": "disputed",
            "note_ru": "Родина в традиции; археология поселения ≠ полная биография",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "person_ids": ["jesus_of_nazareth"],
            "citations": [
                {
                    "id": "cite_place_nazareth",
                    "label_ru": "Nazareth",
                    "kind": "web",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Nazareth",
                },
                {
                    "id": "cite_place_nazareth_mark",
                    "label_ru": "Мк 1:9",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.1.9",
                    "url": NRSV.format("Mark+1%3A9"),
                },
            ],
        },
    )
    for pl in places:
        if pl["id"] == "jerusalem":
            for pid in ["caiaphas", "mary_magdalene", "judas_iscariot", "james_of_jerusalem"]:
                if pid not in pl.get("person_ids", []):
                    pl.setdefault("person_ids", []).append(pid)
        if pl["id"] == "galilee":
            for pid in ["herod_antipas", "mary_magdalene"]:
                if pid not in pl.get("person_ids", []):
                    pl.setdefault("person_ids", []).append(pid)
    dump(DATA / "places.json", places)

    polities = load(DATA / "polities.json")
    for pol in polities:
        if pol["id"] == "polity_rome":
            for pid in ["herod_antipas", "caiaphas"]:
                if pid not in pol["person_ids"]:
                    pol["person_ids"].append(pid)
    dump(DATA / "polities.json", polities)

    # --- claims ---
    claims = load(DATA / "claims" / "by-epoch" / "jesus_jerusalem.json")
    for claim in [
        {
            "id": "claim_jesus_jerusalem_baptism",
            "epoch_id": "jesus_jerusalem",
            "statement_ru": "Крещение Иисуса у Иоанна — один из наиболее устойчивых узлов критического консенсуса (критерий «неловкости»).",
            "confidence": "anchored",
            "date_min": 28,
            "date_max": 30,
            "source_ids": ["synoptic_gospels", "josephus_antiquities", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_claim_jes_baptism",
                    "label_ru": "Мк 1:9–11",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.1.9-11",
                    "url": NRSV.format("Mark+1%3A9-11"),
                },
                {
                    "id": "cite_claim_jes_baptism_hb",
                    "label_ru": "Baptism of Jesus",
                    "kind": "handbook",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Baptism_of_Jesus",
                },
            ],
        },
        {
            "id": "claim_jesus_jerusalem_nazareth",
            "epoch_id": "jesus_jerusalem",
            "statement_ru": "Иисус — галилеянин, связанный традицией с Назаретом; деталь топонима обсуждается, галилейский контекст — в ядре.",
            "confidence": "anchored",
            "date_min": 28,
            "date_max": 33,
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "dissent_ru": "Споры о форме названия/статусе поселения не отменяют галилейскую привязку.",
            "citations": [
                {
                    "id": "cite_claim_jes_naz",
                    "label_ru": "Мк 1:9",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.1.9",
                    "url": NRSV.format("Mark+1%3A9"),
                },
                {
                    "id": "cite_claim_jes_naz_wiki",
                    "label_ru": "Nazareth",
                    "kind": "web",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Nazareth",
                },
            ],
        },
        {
            "id": "claim_jesus_jerusalem_kingdom",
            "epoch_id": "jesus_jerusalem",
            "statement_ru": "Центр проповеди — близкое царство/владычество Бога; формулировки притч и чудес фильтруются критически.",
            "confidence": "anchored",
            "date_min": 28,
            "date_max": 33,
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_claim_jes_kingdom",
                    "label_ru": "Мк 1:14–15",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.1.14-15",
                    "url": NRSV.format("Mark+1%3A14-15"),
                },
                {
                    "id": "cite_claim_jes_kingdom_hb",
                    "label_ru": "Kingdom of God (Christianity)",
                    "kind": "handbook",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Kingdom_of_God_(Christianity)",
                },
            ],
        },
        {
            "id": "claim_jesus_jerusalem_temple_action",
            "epoch_id": "jesus_jerusalem",
            "statement_ru": "Жест против храмовой торговли/порядка в Иерусалиме входит в раннюю традицию; масштаб и точный смысл спорны.",
            "confidence": "disputed",
            "date_min": 30,
            "date_max": 33,
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "dissent_ru": "Одни видят пророческий знак разрушения; другие — ограниченный протест.",
            "citations": [
                {
                    "id": "cite_claim_jes_temple",
                    "label_ru": "Мк 11:15–17",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.11.15-17",
                    "url": NRSV.format("Mark+11%3A15-17"),
                }
            ],
        },
        {
            "id": "claim_jesus_jerusalem_resurrection_kerygma",
            "epoch_id": "jesus_jerusalem",
            "statement_ru": "Ранняя формула 1 Кор 15:3–8 фиксирует проповедь смерти и воскресения Христа в общине до писем Павла; это свидетельство керигмы, не historicity пустого гроба.",
            "confidence": "anchored",
            "date_min": 30,
            "date_max": 55,
            "source_ids": ["pauline_letters", "modern_handbook"],
            "dissent_ru": "Не смешивать с евангельским нарративом гроба/явлений как firm-фактами.",
            "citations": [
                {
                    "id": "cite_claim_jes_kerygma",
                    "label_ru": "1 Кор 15:3–8",
                    "kind": "verse",
                    "source_id": "pauline_letters",
                    "ref": "1Cor.15.3-8",
                    "url": NRSV.format("1+Corinthians+15%3A3-8"),
                },
                {
                    "id": "cite_claim_jes_kerygma_hb",
                    "label_ru": "1 Corinthians 15",
                    "kind": "handbook",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/1_Corinthians_15",
                },
            ],
        },
        {
            "id": "claim_jesus_jerusalem_josephus_tf",
            "epoch_id": "jesus_jerusalem",
            "statement_ru": "Testimonium Flavianum у Иосифа — спорный текст: возможное ядро упоминания Иисуса при поздних христианских вставках.",
            "confidence": "disputed",
            "date_min": 90,
            "date_max": 95,
            "source_ids": ["josephus_antiquities", "modern_handbook"],
            "dissent_ru": "Полная аутентичность отвергнута большинством; частичная — гипотеза handbook.",
            "citations": [
                {
                    "id": "cite_claim_jes_tf",
                    "label_ru": "Josephus on Jesus (Testimonium)",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/Josephus_on_Jesus",
                }
            ],
        },
    ]:
        upsert(claims, claim)
    dump(DATA / "claims" / "by-epoch" / "jesus_jerusalem.json", claims)

    # --- events ---
    events = load(DATA / "events.json")
    for e in events:
        if e["id"] == "evt_jerusalem_final_week":
            e["note_ru"] = (
                "Синоптическая «неделя» и арест — disputed reconstruction. "
                "Не путать с ранней керигмой воскресения (1 Кор 15) и не читать как attested chronology."
            )
            for pid in ["caiaphas", "judas_iscariot", "mary_magdalene"]:
                if pid not in e.get("person_ids", []):
                    e.setdefault("person_ids", []).append(pid)
        if e["id"] == "evt_crucifixion":
            for pid in ["caiaphas", "mary_magdalene"]:
                if pid not in e.get("person_ids", []):
                    e.setdefault("person_ids", []).append(pid)
        if e["id"] == "evt_galilee_activity":
            for pid in ["herod_antipas", "mary_magdalene"]:
                if pid not in e.get("person_ids", []):
                    e.setdefault("person_ids", []).append(pid)
            if "nazareth" not in e.get("place_ids", []):
                e.setdefault("place_ids", []).append("nazareth")

    for e in [
        {
            "id": "evt_baptism_jordan",
            "label_ru": "Крещение Иисуса у Иоанна",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["galilee"],
            "person_ids": ["jesus_of_nazareth", "john_the_baptist"],
            "date_min": 28,
            "date_max": 30,
            "confidence": "anchored",
            "statement_ru": "Иисус принимает крещение Иоанна — устойчивый критический узел (embarrassment).",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_evt_baptism",
                    "label_ru": "Мк 1:9–11",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.1.9-11",
                    "url": NRSV.format("Mark+1%3A9-11"),
                }
            ],
        },
        {
            "id": "evt_temple_incident",
            "label_ru": "Жест в Храме",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["jerusalem"],
            "person_ids": ["jesus_of_nazareth", "caiaphas"],
            "date_min": 30,
            "date_max": 33,
            "confidence": "disputed",
            "statement_ru": "Протест/знак в храмовом дворе по синоптической традиции; детали и масштаб спорны.",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_evt_temple",
                    "label_ru": "Мк 11:15–17",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.11.15-17",
                    "url": NRSV.format("Mark+11%3A15-17"),
                }
            ],
        },
        {
            "id": "evt_resurrection_kerygma",
            "label_ru": "Ранняя керигма воскресения (1 Кор 15)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["jerusalem"],
            "person_ids": ["peter", "james_of_jerusalem", "jesus_of_nazareth"],
            "date_min": 30,
            "date_max": 40,
            "confidence": "anchored",
            "statement_ru": "Община провозглашает смерть и воскресение Иисуса в формуле, которую Павел позже цитирует; это история проповеди, не аттестация пустого гроба.",
            "source_ids": ["pauline_letters", "modern_handbook"],
            "note_ru": "Не смешивать с евангельскими явлениями/гробом как firm",
            "citations": [
                {
                    "id": "cite_evt_kerygma",
                    "label_ru": "1 Кор 15:3–8",
                    "kind": "verse",
                    "source_id": "pauline_letters",
                    "ref": "1Cor.15.3-8",
                    "url": NRSV.format("1+Corinthians+15%3A3-8"),
                }
            ],
        },
    ]:
        upsert(events, e)
    dump(DATA / "events.json", events)

    # --- interactions ---
    ints = load(DATA / "interactions.json")
    for item in [
        {
            "id": "int_jesus_james_kin",
            "epoch_id": "jesus_jerusalem",
            "from_person_id": "jesus_of_nazareth",
            "to_person_id": "james_of_jerusalem",
            "relation": "kin",
            "label_ru": "Иаков — «брат Господень» у Павла (Гал 1:19)",
            "confidence": "anchored",
            "source_ids": ["pauline_letters", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_jes_james",
                    "label_ru": "Гал 1:19",
                    "kind": "verse",
                    "source_id": "pauline_letters",
                    "ref": "Gal.1.19",
                    "url": NRSV.format("Galatians+1%3A19"),
                }
            ],
        },
        {
            "id": "int_caiaphas_jesus_judges",
            "epoch_id": "jesus_jerusalem",
            "from_person_id": "caiaphas",
            "to_person_id": "jesus_of_nazareth",
            "relation": "judges",
            "label_ru": "Каиафа / храмовая элита участвует в предании о осуждении Иисуса",
            "confidence": "disputed",
            "source_ids": ["synoptic_gospels", "josephus_antiquities", "modern_handbook"],
            "note_ru": "Сам факт первосвященства Каиафы тверже, чем реконструкция ночного суда",
            "citations": [
                {
                    "id": "cite_int_caiaphas",
                    "label_ru": "Мк 14:53–65",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.14.53-65",
                    "url": NRSV.format("Mark+14%3A53-65"),
                },
                {
                    "id": "cite_int_caiaphas_wiki",
                    "label_ru": "Caiaphas",
                    "kind": "web",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/Caiaphas",
                },
            ],
        },
        {
            "id": "int_antipas_baptist_opposes",
            "epoch_id": "jesus_jerusalem",
            "from_person_id": "herod_antipas",
            "to_person_id": "john_the_baptist",
            "relation": "opposes",
            "label_ru": "Антипас казнит Иоанна (Иосиф) — внешний якорь",
            "confidence": "firm",
            "source_ids": ["josephus_antiquities", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_antipas_baptist",
                    "label_ru": "Josephus — death of John",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/John_the_Baptist#Imprisonment_and_execution",
                }
            ],
        },
        {
            "id": "int_jesus_mary_meets",
            "epoch_id": "jesus_jerusalem",
            "from_person_id": "jesus_of_nazareth",
            "to_person_id": "mary_magdalene",
            "relation": "meets",
            "label_ru": "Мария Магдалина — среди ближайших последовательниц в традиции",
            "confidence": "disputed",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_jes_mary",
                    "label_ru": "Мк 15:40–41; 16:1",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.15.40-41;16.1",
                    "url": NRSV.format("Mark+15%3A40-41%3B+Mark+16%3A1"),
                }
            ],
        },
        {
            "id": "int_josephus_jesus_mentions",
            "epoch_id": "jesus_jerusalem",
            "from_person_id": "josephus_flavius",
            "to_person_id": "jesus_of_nazareth",
            "relation": "mentions",
            "label_ru": "Иосиф упоминает Иисуса (Testimonium / параллели) — текст спорный",
            "confidence": "disputed",
            "source_ids": ["josephus_antiquities", "modern_handbook"],
            "note_ru": "Не использовать TF как firm-биографию",
            "citations": [
                {
                    "id": "cite_int_jos_jesus",
                    "label_ru": "Josephus on Jesus",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/Josephus_on_Jesus",
                }
            ],
        },
        {
            "id": "int_judas_jesus_opposes",
            "epoch_id": "jesus_jerusalem",
            "from_person_id": "judas_iscariot",
            "to_person_id": "jesus_of_nazareth",
            "relation": "opposes",
            "label_ru": "Иуда выдаёт Иисуса в страстном предании",
            "confidence": "literary",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "note_ru": "Literary узел; нет внешней аттестации биографии Иуды",
            "citations": [
                {
                    "id": "cite_int_judas",
                    "label_ru": "Мк 14:10–11, 43–46",
                    "kind": "verse",
                    "source_id": "synoptic_gospels",
                    "ref": "Mark.14.10-11;43-46",
                    "url": NRSV.format("Mark+14%3A10-11%3B+Mark+14%3A43-46"),
                }
            ],
        },
    ]:
        upsert(ints, item)
    dump(DATA / "interactions.json", ints)

    print(
        json.dumps(
            {
                "people": len(people_file["people"]),
                "claims_jesus": len(claims),
                "events": len(events),
                "ints": len(ints),
                "places": len(places),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
