#!/usr/bin/env python3
"""Full-gospel literary itinerary for jesus_jerusalem path viz (all literary miracles)."""
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


def verse(cid, label, sid, ref, q):
    return {
        "id": cid,
        "label_ru": label,
        "kind": "verse",
        "source_id": sid,
        "ref": ref,
        "url": NRSV.format(q),
    }


def main() -> None:
    sources = load(DATA / "sources.json")
    upsert(
        sources,
        {
            "id": "johannine_gospel",
            "label_ru": "Евангелие от Иоанна",
            "type": "canon_text",
            "tradition_note_ru": "Канон; для пути Иисуса — literary/география визитов, не firm-биография",
            "urls": [
                "https://www.biblegateway.com/passage/?search=John+1&version=NRSVUE"
            ],
        },
    )
    dump(DATA / "sources.json", sources)

    places = load(DATA / "places.json")
    for p in [
        {
            "id": "nain",
            "label_ru": "Наин",
            "epoch_ids": ["jesus_jerusalem"],
            "confidence": "literary",
            "note_ru": "Лк 7 — воскрешение сына вдовы; только Лука",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "person_ids": ["jesus_of_nazareth"],
            "citations": [
                verse(
                    "cite_place_nain",
                    "Лк 7:11–17",
                    "synoptic_gospels",
                    "Luke.7.11-17",
                    "Luke+7%3A11-17",
                )
            ],
        },
        {
            "id": "bethsaida",
            "label_ru": "Вифсаида",
            "epoch_ids": ["jesus_jerusalem"],
            "confidence": "literary",
            "note_ru": "Узел Мк/Лк/Ин у северного берега озера",
            "source_ids": ["synoptic_gospels", "johannine_gospel", "modern_handbook"],
            "person_ids": ["jesus_of_nazareth", "peter"],
            "citations": [
                {
                    "id": "cite_place_bethsaida",
                    "label_ru": "Bethsaida",
                    "kind": "web",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Bethsaida",
                }
            ],
        },
        {
            "id": "caesarea_philippi",
            "label_ru": "Кесария Филиппова",
            "epoch_ids": ["jesus_jerusalem"],
            "confidence": "literary",
            "note_ru": "Северный поворот синоптиков (исповедание Петра); не чудо, но якорь маршрута",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "person_ids": ["jesus_of_nazareth", "peter"],
            "citations": [
                verse(
                    "cite_place_caes_phil",
                    "Мк 8:27–30",
                    "synoptic_gospels",
                    "Mark.8.27-30",
                    "Mark+8%3A27-30",
                )
            ],
        },
        {
            "id": "jericho",
            "label_ru": "Иерихон",
            "epoch_ids": ["jesus_jerusalem"],
            "confidence": "literary",
            "note_ru": "Подход к Иерусалиму в Мк/Лк (Вартимей, Закхей)",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "person_ids": ["jesus_of_nazareth"],
            "citations": [
                verse(
                    "cite_place_jericho",
                    "Мк 10:46–52",
                    "synoptic_gospels",
                    "Mark.10.46-52",
                    "Mark+10%3A46-52",
                )
            ],
        },
        {
            "id": "jordan_valley",
            "label_ru": "Иордан (долина / крещение)",
            "epoch_ids": ["jesus_jerusalem"],
            "confidence": "disputed",
            "note_ru": "Зона крещения; точный пункт спорный",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "person_ids": ["jesus_of_nazareth", "john_the_baptist"],
            "citations": [
                {
                    "id": "cite_place_jordan",
                    "label_ru": "Baptism of Jesus",
                    "kind": "web",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Baptism_of_Jesus",
                }
            ],
        },
    ]:
        upsert(places, p)
    # attach jesus to samaria for Jn 4
    for pl in places:
        if pl["id"] == "samaria":
            if "jesus_jerusalem" not in pl["epoch_ids"]:
                pl["epoch_ids"].append("jesus_jerusalem")
            for pid in ["jesus_of_nazareth"]:
                if pid not in pl.get("person_ids", []):
                    pl.setdefault("person_ids", []).append(pid)
    dump(DATA / "places.json", places)

    events = load(DATA / "events.json")
    # Enrich existing + add new. date_* encode narrative sequence for viz, not firm chronology.
    pack = [
        {
            "id": "evt_miracle_cana",
            "label_ru": "Кана: вода в вино (Ин)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["cana"],
            "person_ids": ["jesus_of_nazareth"],
            "date_min": 28,
            "date_max": 29,
            "confidence": "literary",
            "statement_ru": "Первый «знак» Иоанна в Кане Галилейской — literary; задаёт ранний галилейский узел после крещения.",
            "note_ru": "Ин 2 · literary itinerary",
            "source_ids": ["johannine_gospel", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_cana",
                    "Ин 2:1–11",
                    "johannine_gospel",
                    "John.2.1-11",
                    "John+2%3A1-11",
                )
            ],
        },
        {
            "id": "evt_miracle_capernaum",
            "label_ru": "Капернаум: база исцелений (Мк/Мф/Лк)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["capernaum"],
            "person_ids": ["jesus_of_nazareth", "peter"],
            "date_min": 28,
            "date_max": 30,
            "confidence": "literary",
            "statement_ru": "Синоптики делают Капернаум «своим городом»: множественные исцеления — предание; география базы маршрута.",
            "note_ru": "Мк 1–2 · Мф 8–9 · Лк 4–5",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_cap_mk",
                    "Мк 1:21–34",
                    "synoptic_gospels",
                    "Mark.1.21-34",
                    "Mark+1%3A21-34",
                ),
                verse(
                    "cite_mir_cap_mt",
                    "Мф 8:5–17",
                    "synoptic_gospels",
                    "Matt.8.5-17",
                    "Matthew+8%3A5-17",
                ),
                verse(
                    "cite_mir_cap_lk",
                    "Лк 4:31–41",
                    "synoptic_gospels",
                    "Luke.4.31-41",
                    "Luke+4%3A31-41",
                ),
            ],
        },
        {
            "id": "evt_miracle_nazareth_reject",
            "label_ru": "Назарет: отвержение (Мк/Лк)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["nazareth"],
            "person_ids": ["jesus_of_nazareth"],
            "date_min": 28,
            "date_max": 30,
            "confidence": "literary",
            "statement_ru": "Возврат в Назарет и конфликт — literary узел; показывает движение Капернаум↔Назарет в предании.",
            "note_ru": "Мк 6:1–6 · Лк 4:16–30",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_naz_mk",
                    "Мк 6:1–6",
                    "synoptic_gospels",
                    "Mark.6.1-6",
                    "Mark+6%3A1-6",
                ),
                verse(
                    "cite_mir_naz_lk",
                    "Лк 4:16–30",
                    "synoptic_gospels",
                    "Luke.4.16-30",
                    "Luke+4%3A16-30",
                ),
            ],
        },
        {
            "id": "evt_miracle_nain",
            "label_ru": "Наин: сын вдовы (Лк)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["nain"],
            "person_ids": ["jesus_of_nazareth"],
            "date_min": 29,
            "date_max": 31,
            "confidence": "literary",
            "statement_ru": "Только Лука: воскрешение в Наине — literary; южный край Галилеи на карте Лк.",
            "note_ru": "Лк 7 · только Лука",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_nain",
                    "Лк 7:11–17",
                    "synoptic_gospels",
                    "Luke.7.11-17",
                    "Luke+7%3A11-17",
                )
            ],
        },
        {
            "id": "evt_miracle_sea",
            "label_ru": "Озеро: буря и хождение по воде (Мк/Мф/Ин)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["sea_of_galilee"],
            "person_ids": ["jesus_of_nazareth", "peter"],
            "date_min": 29,
            "date_max": 31,
            "confidence": "literary",
            "statement_ru": "Чудеса на Кинерете — literary знаки; фиксируют переходы между берегами озера.",
            "note_ru": "Мк 4; 6 · Мф 8; 14 · Ин 6",
            "source_ids": ["synoptic_gospels", "johannine_gospel", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_sea_mk",
                    "Мк 4:35–41",
                    "synoptic_gospels",
                    "Mark.4.35-41",
                    "Mark+4%3A35-41",
                ),
                verse(
                    "cite_mir_sea_mt",
                    "Мф 14:22–33",
                    "synoptic_gospels",
                    "Matt.14.22-33",
                    "Matthew+14%3A22-33",
                ),
                verse(
                    "cite_mir_sea_jn",
                    "Ин 6:16–21",
                    "johannine_gospel",
                    "John.6.16-21",
                    "John+6%3A16-21",
                ),
            ],
        },
        {
            "id": "evt_miracle_gerasene",
            "label_ru": "Декаполис: одержимый (Мк/Мф/Лк)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["decapolis"],
            "person_ids": ["jesus_of_nazareth"],
            "date_min": 29,
            "date_max": 31,
            "confidence": "literary",
            "statement_ru": "Выход на восточный берег; топоним Гераса/Гадара спорный — literary маршрут «через озеро на восток».",
            "note_ru": "Мк 5 · Мф 8 · Лк 8",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_ger_mk",
                    "Мк 5:1–20",
                    "synoptic_gospels",
                    "Mark.5.1-20",
                    "Mark+5%3A1-20",
                ),
                verse(
                    "cite_mir_ger_lk",
                    "Лк 8:26–39",
                    "synoptic_gospels",
                    "Luke.8.26-39",
                    "Luke+8%3A26-39",
                ),
            ],
        },
        {
            "id": "evt_miracle_feeding",
            "label_ru": "Насыщение 5000 (Мк/Мф/Лк/Ин)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["bethsaida", "sea_of_galilee"],
            "person_ids": ["jesus_of_nazareth", "peter"],
            "date_min": 29,
            "date_max": 32,
            "confidence": "literary",
            "statement_ru": "Единственное чудо во всех четырёх Евангелиях — literary; локализация у озера/Вифсаиды.",
            "note_ru": "Мк 6 · Мф 14 · Лк 9 · Ин 6",
            "source_ids": ["synoptic_gospels", "johannine_gospel", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_feed_mk",
                    "Мк 6:30–44",
                    "synoptic_gospels",
                    "Mark.6.30-44",
                    "Mark+6%3A30-44",
                ),
                verse(
                    "cite_mir_feed_jn",
                    "Ин 6:1–15",
                    "johannine_gospel",
                    "John.6.1-15",
                    "John+6%3A1-15",
                ),
            ],
        },
        {
            "id": "evt_miracle_tyre",
            "label_ru": "Тир/Сидон: сирофиникиянка (Мк/Мф)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["tyre_region"],
            "person_ids": ["jesus_of_nazareth"],
            "date_min": 30,
            "date_max": 32,
            "confidence": "literary",
            "statement_ru": "Северный выступ маршрута Марка/Матфея — literary география «из Галилеи к Финикии».",
            "note_ru": "Мк 7 · Мф 15",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_tyre_mk",
                    "Мк 7:24–30",
                    "synoptic_gospels",
                    "Mark.7.24-30",
                    "Mark+7%3A24-30",
                ),
                verse(
                    "cite_mir_tyre_mt",
                    "Мф 15:21–28",
                    "synoptic_gospels",
                    "Matt.15.21-28",
                    "Matthew+15%3A21-28",
                ),
            ],
        },
        {
            "id": "evt_path_caesarea_philippi",
            "label_ru": "Кесария Филиппова: поворот на север (Мк/Мф)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["caesarea_philippi"],
            "person_ids": ["jesus_of_nazareth", "peter"],
            "date_min": 30,
            "date_max": 32,
            "confidence": "literary",
            "statement_ru": "Не чудо, но ключевой северный якорь синоптического пути перед поворотом к Иерусалиму.",
            "note_ru": "Мк 8 · Мф 16 · маршрут",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                verse(
                    "cite_path_caes",
                    "Мк 8:27–33",
                    "synoptic_gospels",
                    "Mark.8.27-33",
                    "Mark+8%3A27-33",
                )
            ],
        },
        {
            "id": "evt_miracle_samaria_well",
            "label_ru": "Самария / Сихарь: колодец (Ин)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["samaria"],
            "person_ids": ["jesus_of_nazareth"],
            "date_min": 29,
            "date_max": 32,
            "confidence": "literary",
            "statement_ru": "Иоанн проводит Иисуса через Самарию — literary коридор Галилея↔Иудея, отсутствующий в кратком Мк.",
            "note_ru": "Ин 4 · только Иоанн",
            "source_ids": ["johannine_gospel", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_sam",
                    "Ин 4:1–42",
                    "johannine_gospel",
                    "John.4.1-42",
                    "John+4%3A1-42",
                )
            ],
        },
        {
            "id": "evt_miracle_bethesda",
            "label_ru": "Иерусалим: купальня Вифезда (Ин)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["jerusalem"],
            "person_ids": ["jesus_of_nazareth"],
            "date_min": 29,
            "date_max": 32,
            "confidence": "literary",
            "statement_ru": "Иоанн даёт ранние/повторные визиты в Иерусалим с исцелением — literary; усложняет «один финальный заход» синоптиков.",
            "note_ru": "Ин 5 · literary",
            "source_ids": ["johannine_gospel", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_beth_pool",
                    "Ин 5:1–9",
                    "johannine_gospel",
                    "John.5.1-9",
                    "John+5%3A1-9",
                )
            ],
        },
        {
            "id": "evt_miracle_jericho",
            "label_ru": "Иерихон: Вартимей / Закхей (Мк/Лк)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["jericho"],
            "person_ids": ["jesus_of_nazareth"],
            "date_min": 30,
            "date_max": 33,
            "confidence": "literary",
            "statement_ru": "Подход к Иерусалиму через Иерихон в Мк/Лк — literary последний отрезок пути в Иудею.",
            "note_ru": "Мк 10 · Лк 18–19",
            "source_ids": ["synoptic_gospels", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_jer_mk",
                    "Мк 10:46–52",
                    "synoptic_gospels",
                    "Mark.10.46-52",
                    "Mark+10%3A46-52",
                ),
                verse(
                    "cite_mir_jer_lk",
                    "Лк 19:1–10",
                    "synoptic_gospels",
                    "Luke.19.1-10",
                    "Luke+19%3A1-10",
                ),
            ],
        },
        {
            "id": "evt_miracle_bethany",
            "label_ru": "Вифания: Лазарь (Ин)",
            "epoch_id": "jesus_jerusalem",
            "place_ids": ["bethany"],
            "person_ids": ["jesus_of_nazareth"],
            "date_min": 30,
            "date_max": 33,
            "confidence": "literary",
            "statement_ru": "Иоанновский знак у Иерусалима — literary; южный якорь перед страстями. Не смешивать с керигмой 1 Кор 15.",
            "note_ru": "Ин 11 · literary",
            "source_ids": ["johannine_gospel", "modern_handbook"],
            "citations": [
                verse(
                    "cite_mir_beth",
                    "Ин 11:1–44",
                    "johannine_gospel",
                    "John.11.1-44",
                    "John+11%3A1-44",
                )
            ],
        },
    ]
    for e in pack:
        upsert(events, e)
    dump(DATA / "events.json", events)

    claims = load(DATA / "claims" / "by-epoch" / "jesus_jerusalem.json")
    upsert(
        claims,
        {
            "id": "claim_jesus_jerusalem_miracle_itinerary",
            "epoch_id": "jesus_jerusalem",
            "statement_ru": "Свод Мф+Мк+Лк+Ин даёт literary-географию пути: Галилея (Кана/Капернаум/озеро/Декаполис/Тир/Кесария Филиппова) → Самария (Ин) → Иерихон → Вифания/Иерусалим. Это схема чтения преданий, не attested travelogue и не historicity чудес.",
            "confidence": "literary",
            "date_min": 28,
            "date_max": 33,
            "source_ids": [
                "synoptic_gospels",
                "johannine_gospel",
                "modern_handbook",
            ],
            "dissent_ru": "Синоптики и Иоанн расходятся по числу визитов в Иерусалим; маршрут — компромиссная карта для UI.",
            "citations": [
                {
                    "id": "cite_claim_mir_itin",
                    "label_ru": "Ministry of Jesus — geography",
                    "kind": "handbook",
                    "source_id": "modern_handbook",
                    "url": "https://en.wikipedia.org/wiki/Ministry_of_Jesus",
                },
                verse(
                    "cite_claim_mir_mk",
                    "Мк 1–10 (галилея→путь)",
                    "synoptic_gospels",
                    "Mark.1-10",
                    "Mark+1",
                ),
                verse(
                    "cite_claim_mir_jn",
                    "Ин 2–11 (знаки/визиты)",
                    "johannine_gospel",
                    "John.2-11",
                    "John+2",
                ),
            ],
        },
    )
    dump(DATA / "claims" / "by-epoch" / "jesus_jerusalem.json", claims)
    print(
        json.dumps(
            {
                "sources": len(sources),
                "places": len(places),
                "events": len(events),
                "claims": len(claims),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
