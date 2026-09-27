#!/usr/bin/env python3
"""P-D: densify pauline_networks + bar_kokhba."""
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
    people_file = load(DATA / "candidates" / "people.json")
    by_id = {p["id"]: p for p in people_file["people"]}

    for person in [
        {
            "id": "james_of_jerusalem",
            "label_ru": "Иаков (брат Господень / Иерусалим)",
            "theographic_slug": "",
            "epoch_ids": ["jesus_jerusalem", "pauline_networks"],
            "confidence": "anchored",
            "note_ru": "Столп Иерусалима у Павла (Гал 1–2); не путать с сыном Зеведея без отдельной калибровки",
            "upstream": {"found": False},
        },
        {
            "id": "barnabas",
            "label_ru": "Варнава",
            "theographic_slug": "",
            "epoch_ids": ["pauline_networks"],
            "confidence": "anchored",
            "note_ru": "Упоминается Павлом в Гал 2 (Антиохия); биография Деяний вторична",
            "upstream": {"found": False},
        },
        {
            "id": "rabbi_akiva",
            "label_ru": "Рабби Акива",
            "theographic_slug": "",
            "epoch_ids": ["bar_kokhba"],
            "confidence": "disputed",
            "note_ru": "Поздняя традиция связывает с поддержкой Бар-Кохбы; степень историчности спорна",
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
        "james_of_jerusalem",
        "barnabas",
        "paul_of_tarsus",
        "josephus_flavius",
        "vespasian",
        "titus",
        "rabbi_akiva",
        "simon_bar_kokhba",
        "hadrian",
    ]
    ordered = [by_id[i] for i in order_hint if i in by_id]
    ordered += [p for pid, p in by_id.items() if pid not in set(order_hint)]
    people_file["people"] = ordered
    dump(DATA / "candidates" / "people.json", people_file)

    # claims
    paul_claims = load(DATA / "claims" / "by-epoch" / "pauline_networks.json")
    upsert_by_id(
        paul_claims,
        {
            "id": "claim_pauline_networks_jerusalem_pillars",
            "epoch_id": "pauline_networks",
            "statement_ru": "Павел признаёт «столпов» Иерусалима (Иаков, Кифа, Иоанн) и согласование миссий (Гал 2:1–10) — ранний якорь структуры общин.",
            "confidence": "anchored",
            "date_min": 48,
            "date_max": 55,
            "source_ids": ["pauline_letters", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_claim_paul_pillars",
                    "label_ru": "Гал 2:1–10",
                    "kind": "verse",
                    "source_id": "pauline_letters",
                    "ref": "Gal.2.1-10",
                    "url": NRSV.format("Galatians+2%3A1-10"),
                }
            ],
        },
    )
    dump(DATA / "claims" / "by-epoch" / "pauline_networks.json", paul_claims)

    bk_claims = load(DATA / "claims" / "by-epoch" / "bar_kokhba.json")
    upsert_by_id(
        bk_claims,
        {
            "id": "claim_bar_kokhba_akiva_tradition",
            "epoch_id": "bar_kokhba",
            "statement_ru": "Традиция приписывает рабби Акиве поддержку Бар-Кохбы как «звезды»; историчность этой связки в handbook остаётся спорной.",
            "confidence": "disputed",
            "date_min": 132,
            "date_max": 135,
            "source_ids": ["modern_handbook", "bar_kokhba_letters"],
            "dissent_ru": "Письма восстания не называют Акиву; связь — раввинистическая память",
            "citations": [
                {
                    "id": "cite_claim_bk_akiva",
                    "label_ru": "Akiva / Bar Kokhba (tradition)",
                    "kind": "handbook",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Akiva#Bar_Kokhba_revolt",
                }
            ],
        },
    )
    dump(DATA / "claims" / "by-epoch" / "bar_kokhba.json", bk_claims)

    # interactions
    ints = load(DATA / "interactions.json")
    for item in [
        {
            "id": "int_paul_james_meets",
            "epoch_id": "pauline_networks",
            "from_person_id": "paul_of_tarsus",
            "to_person_id": "james_of_jerusalem",
            "relation": "meets",
            "label_ru": "Павел встречается с Иаковом как авторитетом Иерусалима (Гал 1–2)",
            "confidence": "anchored",
            "source_ids": ["pauline_letters", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_paul_james",
                    "label_ru": "Гал 1:18–19; 2:9",
                    "kind": "verse",
                    "source_id": "pauline_letters",
                    "ref": "Gal.1.18-19;2.9",
                    "url": NRSV.format("Galatians+1%3A18-19%3B+Galatians+2%3A9"),
                }
            ],
        },
        {
            "id": "int_paul_barnabas_allies",
            "epoch_id": "pauline_networks",
            "from_person_id": "paul_of_tarsus",
            "to_person_id": "barnabas",
            "relation": "allies",
            "label_ru": "Павел и Варнава — сотрудники миссии; в Антиохии Варнава оказывается на стороне Кифы (Гал 2)",
            "confidence": "anchored",
            "source_ids": ["pauline_letters", "modern_handbook"],
            "note_ru": "Детали разрыва по Деяниям не подменяют письмо",
            "citations": [
                {
                    "id": "cite_int_paul_barnabas",
                    "label_ru": "Гал 2:1; 2:13",
                    "kind": "verse",
                    "source_id": "pauline_letters",
                    "ref": "Gal.2.1;2.13",
                    "url": NRSV.format("Galatians+2%3A1%3B+Galatians+2%3A13"),
                }
            ],
        },
        {
            "id": "int_james_peter_allies",
            "epoch_id": "pauline_networks",
            "from_person_id": "james_of_jerusalem",
            "to_person_id": "peter",
            "relation": "allies",
            "label_ru": "Иаков и Кифа — «столпы» Иерусалима в свидетельстве Павла",
            "confidence": "anchored",
            "source_ids": ["pauline_letters", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_int_james_peter",
                    "label_ru": "Гал 2:9",
                    "kind": "verse",
                    "source_id": "pauline_letters",
                    "ref": "Gal.2.9",
                    "url": NRSV.format("Galatians+2%3A9"),
                }
            ],
        },
        {
            "id": "int_akiva_bar_kokhba_allies",
            "epoch_id": "bar_kokhba",
            "from_person_id": "rabbi_akiva",
            "to_person_id": "simon_bar_kokhba",
            "relation": "allies",
            "label_ru": "Традиция: Акива поддерживает Бар-Кохбу",
            "confidence": "disputed",
            "source_ids": ["modern_handbook"],
            "note_ru": "Раввинистическая память; не подтверждено письмами восстания",
            "citations": [
                {
                    "id": "cite_int_akiva_bk",
                    "label_ru": "Akiva — Bar Kokhba tradition",
                    "kind": "handbook",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Akiva#Bar_Kokhba_revolt",
                }
            ],
        },
        {
            "id": "int_akiva_hadrian_opposes",
            "epoch_id": "bar_kokhba",
            "from_person_id": "rabbi_akiva",
            "to_person_id": "hadrian",
            "relation": "opposes",
            "label_ru": "Традиция помещает Акиву в лагерь сопротивления Риму Адриана",
            "confidence": "disputed",
            "source_ids": ["modern_handbook", "dio_cassius"],
            "note_ru": "Косвенная связка через память о восстании; не римский аннал",
            "citations": [
                {
                    "id": "cite_int_akiva_hadrian",
                    "label_ru": "Akiva / Bar Kokhba revolt",
                    "kind": "handbook",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Akiva#Bar_Kokhba_revolt",
                }
            ],
        },
    ]:
        upsert_by_id(ints, item)
    dump(DATA / "interactions.json", ints)

    # events
    events = load(DATA / "events.json")
    for e in events:
        if e["id"] == "evt_antioch_incident":
            if "barnabas" not in e.get("person_ids", []):
                e.setdefault("person_ids", []).append("barnabas")
        if e["id"] == "evt_bar_kokhba_revolt":
            if "rabbi_akiva" not in e.get("person_ids", []):
                # akiva not firmly in revolt event — skip attaching to firm event
                pass

    for e in [
        {
            "id": "evt_jerusalem_pillars",
            "label_ru": "Согласование с «столпами» Иерусалима (Гал 2)",
            "epoch_id": "pauline_networks",
            "place_ids": ["jerusalem"],
            "person_ids": [
                "paul_of_tarsus",
                "james_of_jerusalem",
                "peter",
                "barnabas",
            ],
            "date_min": 48,
            "date_max": 55,
            "confidence": "anchored",
            "statement_ru": "Павел описывает признание миссии к язычникам иерусалимскими авторитетами.",
            "source_ids": ["pauline_letters", "modern_handbook"],
            "note_ru": "Деян 15 — параллельный, вторичный нарратив",
            "citations": [
                {
                    "id": "cite_evt_pillars",
                    "label_ru": "Гал 2:1–10",
                    "kind": "verse",
                    "source_id": "pauline_letters",
                    "ref": "Gal.2.1-10",
                    "url": NRSV.format("Galatians+2%3A1-10"),
                }
            ],
        },
        {
            "id": "evt_aelia_capitolina",
            "label_ru": "Элия Капитолина после 135",
            "epoch_id": "bar_kokhba",
            "place_ids": ["aelia_capitolina", "jerusalem"],
            "person_ids": ["hadrian"],
            "date_min": 135,
            "date_max": 135,
            "confidence": "firm",
            "statement_ru": "После подавления восстания Иерусалим переустраивается как римская колония Элия Капитолина.",
            "source_ids": ["dio_cassius", "modern_handbook"],
            "citations": [
                {
                    "id": "cite_evt_aelia",
                    "label_ru": "Aelia Capitolina",
                    "kind": "web",
                    "source_id": "dio_cassius",
                    "url": "https://en.wikipedia.org/wiki/Aelia_Capitolina",
                }
            ],
        },
    ]:
        upsert_by_id(events, e)
    dump(DATA / "events.json", events)

    # places
    places = load(DATA / "places.json")
    for pl in places:
        if pl["id"] == "jerusalem":
            for pid in ["james_of_jerusalem", "paul_of_tarsus"]:
                if pid not in pl.get("person_ids", []):
                    pl.setdefault("person_ids", []).append(pid)
            if "pauline_networks" not in pl["epoch_ids"]:
                # jerusalem already spans many epochs; check if pauline is there
                # from earlier read it may not include pauline_networks
                pass
        if pl["id"] == "antioch":
            for pid in ["barnabas", "james_of_jerusalem"]:
                if pid not in pl.get("person_ids", []):
                    # james not primarily antioch — only barnabas
                    pass
            if "barnabas" not in pl.get("person_ids", []):
                pl.setdefault("person_ids", []).append("barnabas")
        if pl["id"] == "aelia_capitolina":
            if "hadrian" not in pl.get("person_ids", []):
                pl.setdefault("person_ids", []).append("hadrian")
        if pl["id"] == "judean_desert":
            if "rabbi_akiva" not in pl.get("person_ids", []):
                # don't force akiva into desert letters place
                pass

    # ensure jerusalem has pauline_networks in epoch_ids for pillars event
    for pl in places:
        if pl["id"] == "jerusalem" and "pauline_networks" not in pl["epoch_ids"]:
            # insert after jesus_jerusalem if present
            eps = pl["epoch_ids"]
            if "jesus_jerusalem" in eps:
                idx = eps.index("jesus_jerusalem") + 1
                eps.insert(idx, "pauline_networks")
            else:
                eps.append("pauline_networks")
    dump(DATA / "places.json", places)

    # polity rome
    polities = load(DATA / "polities.json")
    for pol in polities:
        if pol["id"] == "polity_rome" and "rabbi_akiva" not in pol["person_ids"]:
            # akiva not roman actor — skip
            pass
    dump(DATA / "polities.json", polities)

    people = people_file["people"]
    print(
        json.dumps(
            {
                "people_total": len(people),
                "ints_total": len(ints),
                "events_total": len(events),
                "pauline": {
                    "people": [
                        p["id"]
                        for p in people
                        if "pauline_networks" in p["epoch_ids"]
                    ],
                    "ints": [
                        i["id"] for i in ints if i["epoch_id"] == "pauline_networks"
                    ],
                    "events": [
                        e["id"] for e in events if e["epoch_id"] == "pauline_networks"
                    ],
                    "claims": len(paul_claims),
                },
                "bar_kokhba": {
                    "people": [
                        p["id"] for p in people if "bar_kokhba" in p["epoch_ids"]
                    ],
                    "ints": [i["id"] for i in ints if i["epoch_id"] == "bar_kokhba"],
                    "events": [
                        e["id"] for e in events if e["epoch_id"] == "bar_kokhba"
                    ],
                    "claims": len(bk_claims),
                },
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
