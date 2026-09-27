#!/usr/bin/env python3
"""P-B: densify early_monarchy + roman_herodian (people, ints, events, claims)."""
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


def upsert_person(people: list, person: dict) -> None:
    ids = {p["id"] for p in people}
    if person["id"] in ids:
        for i, p in enumerate(people):
            if p["id"] == person["id"]:
                people[i] = person
                return
    # insert after solomon for saul; after herod for archelaus/pompey
    people.append(person)


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

    new_people = [
        {
            "id": "saul",
            "label_ru": "Саул",
            "theographic_slug": "",
            "epoch_ids": ["early_monarchy"],
            "confidence": "disputed",
            "note_ru": "Первый царь в династической традиции; внешняя аттестация слабее, чем у «дома Давида»",
            "upstream": {"found": False},
        },
        {
            "id": "pompey",
            "label_ru": "Помпей",
            "theographic_slug": "",
            "epoch_ids": ["roman_herodian"],
            "confidence": "firm",
            "note_ru": "Римский полководец; взятие Иерусалима 63 до н.э. (Иосиф / римская хронология)",
            "upstream": {"found": False},
        },
        {
            "id": "herod_archelaus",
            "label_ru": "Ирод Архелай",
            "theographic_slug": "",
            "epoch_ids": ["roman_herodian"],
            "confidence": "firm",
            "note_ru": "Этнарх Иудеи после Ирода; свергнут (~6 н.э.), далее римские префекты",
            "upstream": {"found": False},
        },
    ]
    for p in new_people:
        upsert_person(people, p)

    # Keep a readable order: saul after solomon
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
        "simon_bar_kokhba",
        "hadrian",
    ]
    by_id = {p["id"]: p for p in people}
    ordered = [by_id[i] for i in order_hint if i in by_id]
    ordered += [p for p in people if p["id"] not in set(order_hint)]
    people_file["people"] = ordered
    dump(DATA / "candidates" / "people.json", people_file)

    # --- claims early_monarchy ---
    em_claims = load(DATA / "claims" / "by-epoch" / "early_monarchy.json")
    upsert_by_id(
        em_claims,
        {
            "id": "claim_early_monarchy_saul",
            "epoch_id": "early_monarchy",
            "statement_ru": "Саул — первый царь в библейской династической традиции; надёжной внешней биографической аттестации нет.",
            "confidence": "literary",
            "date_min": -1050,
            "date_max": -1000,
            "source_ids": ["deuteronomistic_history", "modern_handbook"],
            "dissent_ru": "Некоторые реконструкции допускают историческое ядро ранней монархии без деталей 1 Сам.",
            "citations": [
                {
                    "id": "cite_claim_em_saul_1sam9",
                    "label_ru": "1 Цар 9–11",
                    "kind": "verse",
                    "source_id": "deuteronomistic_history",
                    "ref": "1Sam.9-11",
                    "url": NRSV.format("1+Samuel+9-11"),
                },
                {
                    "id": "cite_claim_em_saul_hb",
                    "label_ru": "Saul (king)",
                    "kind": "handbook",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Saul",
                },
            ],
        },
    )
    dump(DATA / "claims" / "by-epoch" / "early_monarchy.json", em_claims)

    # --- claims roman_herodian ---
    rh_claims = load(DATA / "claims" / "by-epoch" / "roman_herodian.json")
    upsert_by_id(
        rh_claims,
        {
            "id": "claim_roman_herodian_archelaus",
            "epoch_id": "roman_herodian",
            "statement_ru": "После смерти Ирода Архелай правит как этнарх Иудеи; около 6 н.э. свергнут, иудея переходит под прямых римских префектов.",
            "confidence": "firm",
            "date_min": -4,
            "date_max": 6,
            "source_ids": ["josephus_antiquities", "roman_fasti", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_claim_rom_archelaus",
                    "label_ru": "Herod Archelaus",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/Herod_Archelaus",
                }
            ],
        },
    )
    dump(DATA / "claims" / "by-epoch" / "roman_herodian.json", rh_claims)

    # --- interactions ---
    ints = load(DATA / "interactions.json")
    new_ints = [
        {
            "id": "int_david_saul_succeeds",
            "epoch_id": "early_monarchy",
            "from_person_id": "david",
            "to_person_id": "saul",
            "relation": "succeeds",
            "label_ru": "Давид наследует/сменяет Саула в династической традиции",
            "confidence": "literary",
            "source_ids": ["deuteronomistic_history", "modern_handbook"],
            "note_ru": "Литературное преемство; внешний якорь — позже «дом Давида» (Тель Дан)",
            "citations": [
                {
                    "id": "cite_int_dav_saul",
                    "label_ru": "1 Цар 31; 2 Цар 2–5",
                    "kind": "verse",
                    "source_id": "deuteronomistic_history",
                    "ref": "1Sam.31;2Sam.2-5",
                    "url": NRSV.format("1+Samuel+31%3B+2+Samuel+2-5"),
                }
            ],
        },
        {
            "id": "int_herod_archelaus_succeeds",
            "epoch_id": "roman_herodian",
            "from_person_id": "herod_archelaus",
            "to_person_id": "herod_the_great",
            "relation": "succeeds",
            "label_ru": "Архелай наследует Ироду в Иудее (как этнарх)",
            "confidence": "firm",
            "source_ids": ["josephus_antiquities", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_herod_arch",
                    "label_ru": "Herod Archelaus",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/Herod_Archelaus",
                }
            ],
        },
        {
            "id": "int_archelaus_to_prefects",
            "epoch_id": "roman_herodian",
            "from_person_id": "pontius_pilate",
            "to_person_id": "herod_archelaus",
            "relation": "succeeds",
            "label_ru": "После свержения Архелая Иудеей управляют римские префекты (Пилат — яркий пример)",
            "confidence": "firm",
            "source_ids": ["josephus_antiquities", "roman_fasti", "modern_handbook"],
            "note_ru": "Не прямое личное преемство; смена модели власти (~6 н.э. → префектура)",
            "citations": [
                {
                    "id": "cite_int_arch_pref",
                    "label_ru": "Judea (Roman province)",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/Judea_(Roman_province)",
                }
            ],
        },
        {
            "id": "int_pompey_herod_context",
            "epoch_id": "roman_herodian",
            "from_person_id": "herod_the_great",
            "to_person_id": "pompey",
            "relation": "succeeds",
            "label_ru": "Ирод правит в мире, открытом римским вмешательством Помпея (63 до н.э.)",
            "confidence": "firm",
            "source_ids": ["josephus_antiquities", "roman_fasti", "modern_handbook"],
            "note_ru": "Не личное преемство; Помпей → хасмонейский кризис → возвышение Ирода",
            "citations": [
                {
                    "id": "cite_int_pompey_herod",
                    "label_ru": "Siege of Jerusalem (63 BC)",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/Siege_of_Jerusalem_(63_BC)",
                }
            ],
        },
    ]
    for i in new_ints:
        upsert_by_id(ints, i)
    dump(DATA / "interactions.json", ints)

    # --- events ---
    events = load(DATA / "events.json")
    for e in events:
        if e["id"] == "evt_pompey_63":
            e["person_ids"] = ["pompey"]
    new_events = [
        {
            "id": "evt_david_jerusalem",
            "label_ru": "Иерусалим как центр «дома Давида» (традиция)",
            "epoch_id": "early_monarchy",
            "place_ids": ["jerusalem"],
            "person_ids": ["david", "saul"],
            "date_min": -1000,
            "date_max": -960,
            "confidence": "disputed",
            "statement_ru": "В традиции Давид делает Иерусалим политическим центром; масштаб и дата X в. спорны.",
            "source_ids": ["deuteronomistic_history", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_evt_dav_jeru",
                    "label_ru": "2 Цар 5",
                    "kind": "verse",
                    "source_id": "deuteronomistic_history",
                    "ref": "2Sam.5",
                    "url": NRSV.format("2+Samuel+5"),
                },
                {
                    "id": "cite_evt_dav_jeru_hb",
                    "label_ru": "City of David / Iron Age Jerusalem",
                    "kind": "handbook",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/City_of_David_(historic)",
                },
            ],
        },
        {
            "id": "evt_solomon_temple_tradition",
            "label_ru": "Храм Соломона (традиция Первого храма)",
            "epoch_id": "early_monarchy",
            "place_ids": ["jerusalem"],
            "person_ids": ["solomon", "david"],
            "date_min": -970,
            "date_max": -930,
            "confidence": "literary",
            "statement_ru": "Построение Первого храма — центральный узел династической традиции; внешняя абсолютная дата и масштаб спорны.",
            "source_ids": ["deuteronomistic_history", "modern_handbook"],
            "note_ru": "Не путать с иродианской перестройкой Второго храма",
            "citations": [
                {
                    "id": "cite_evt_sol_temple",
                    "label_ru": "3 Цар 6–8",
                    "kind": "verse",
                    "source_id": "deuteronomistic_history",
                    "ref": "1Kgs.6-8",
                    "url": NRSV.format("1+Kings+6-8"),
                }
            ],
        },
        {
            "id": "evt_herod_temple_rebuild",
            "label_ru": "Перестройка храма Иродом",
            "epoch_id": "roman_herodian",
            "place_ids": ["jerusalem"],
            "person_ids": ["herod_the_great"],
            "date_min": -20,
            "date_max": 10,
            "confidence": "firm",
            "statement_ru": "Масштабная иродианская перестройка Второго храма; видима у Иосифа и в археологии.",
            "source_ids": ["josephus_antiquities", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_evt_herod_temple",
                    "label_ru": "Herod's Temple",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/Herod%27s_Temple",
                }
            ],
        },
        {
            "id": "evt_archelaus_deposed",
            "label_ru": "Свержение Архелая / переход к префектуре",
            "epoch_id": "roman_herodian",
            "place_ids": ["jerusalem"],
            "person_ids": ["herod_archelaus"],
            "date_min": 6,
            "date_max": 6,
            "confidence": "firm",
            "statement_ru": "Около 6 н.э. Архелай свергнут; Иудея входит в режим римских префектов.",
            "source_ids": ["josephus_antiquities", "roman_fasti", "modern_handbook"],
            "note_ru": "Пилат — позднейший яркий пример префектуры; связь через рёбра эпохи",
            "citations": [
                {
                    "id": "cite_evt_arch_dep",
                    "label_ru": "Herod Archelaus",
                    "kind": "josephus",
                    "source_id": "josephus_antiquities",
                    "url": "https://en.wikipedia.org/wiki/Herod_Archelaus",
                }
            ],
        },
    ]
    for e in new_events:
        upsert_by_id(events, e)
    dump(DATA / "events.json", events)

    # --- places ---
    places = load(DATA / "places.json")
    for pl in places:
        if pl["id"] == "jerusalem":
            for pid in [
                "saul",
                "solomon",
                "pompey",
                "herod_archelaus",
            ]:
                if pid not in pl["person_ids"]:
                    pl["person_ids"].append(pid)
    dump(DATA / "places.json", places)

    # --- polities ---
    polities = load(DATA / "polities.json")
    for pol in polities:
        if pol["id"] == "polity_rome":
            for pid in ["pompey", "herod_archelaus"]:
                if pid not in pol["person_ids"]:
                    pol["person_ids"].append(pid)
    dump(DATA / "polities.json", polities)

    # summary
    people_n = len(people_file["people"])
    ints_n = len(ints)
    events_n = len(events)
    em_people = [p["id"] for p in people_file["people"] if "early_monarchy" in p["epoch_ids"]]
    rh_people = [p["id"] for p in people_file["people"] if "roman_herodian" in p["epoch_ids"]]
    em_ints = [i["id"] for i in ints if i["epoch_id"] == "early_monarchy"]
    rh_ints = [i["id"] for i in ints if i["epoch_id"] == "roman_herodian"]
    em_ev = [e["id"] for e in events if e["epoch_id"] == "early_monarchy"]
    rh_ev = [e["id"] for e in events if e["epoch_id"] == "roman_herodian"]
    print(
        json.dumps(
            {
                "people_total": people_n,
                "interactions_total": ints_n,
                "events_total": events_n,
                "early_monarchy": {
                    "people": em_people,
                    "ints": em_ints,
                    "events": em_ev,
                    "claims": len(em_claims),
                },
                "roman_herodian": {
                    "people": rh_people,
                    "ints": rh_ints,
                    "events": rh_ev,
                    "claims": len(rh_claims),
                },
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
