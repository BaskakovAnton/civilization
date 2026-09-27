#!/usr/bin/env python3
"""P-A: attach citations to claims and interactions. Idempotent."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

NRSV = "https://www.biblegateway.com/passage/?search={}&version=NRSVUE"


def verse(cid: str, label: str, source_id: str, ref: str, search: str) -> dict:
    return {
        "id": cid,
        "label_ru": label,
        "kind": "verse",
        "source_id": source_id,
        "ref": ref,
        "url": NRSV.format(search),
    }


def inscription(cid: str, label: str, source_id: str, url: str) -> dict:
    return {
        "id": cid,
        "label_ru": label,
        "kind": "inscription",
        "source_id": source_id,
        "url": url,
    }


def josephus(cid: str, label: str, source_id: str, url: str) -> dict:
    return {
        "id": cid,
        "label_ru": label,
        "kind": "josephus",
        "source_id": source_id,
        "url": url,
    }


def web(cid: str, label: str, source_id: str, url: str) -> dict:
    return {
        "id": cid,
        "label_ru": label,
        "kind": "web",
        "source_id": source_id,
        "url": url,
    }


def handbook(cid: str, label: str, url: str) -> dict:
    return {
        "id": cid,
        "label_ru": label,
        "kind": "handbook",
        "source_id": "modern_handbook",
        "url": url,
    }


# Claim id -> list of citations (replace if missing or empty)
CLAIM_CITATIONS: dict[str, list[dict]] = {
    # patriarchal
    "claim_patriarchal_horizon_saga": [
        verse(
            "cite_claim_pat_saga_gen12",
            "Быт 12",
            "genesis_narrative",
            "Gen.12",
            "Genesis+12",
        ),
        handbook(
            "cite_claim_pat_saga_hb",
            "Patriarchs (обзор)",
            "https://en.wikipedia.org/wiki/Patriarchs_(Bible)",
        ),
    ],
    "claim_patriarchal_horizon_setting": [
        handbook(
            "cite_claim_pat_setting_hb",
            "Abraham (хронология дискуссии)",
            "https://en.wikipedia.org/wiki/Abraham#Historicity",
        ),
    ],
    "claim_patriarchal_horizon_joseph_cycle": [
        verse(
            "cite_claim_pat_joseph_gen37",
            "Быт 37",
            "genesis_narrative",
            "Gen.37",
            "Genesis+37",
        ),
        web(
            "cite_claim_pat_joseph_wiki",
            "Joseph (Genesis)",
            "genesis_narrative",
            "https://en.wikipedia.org/wiki/Joseph_(Genesis)",
        ),
    ],
    # exodus (merneptah already has cites)
    "claim_exodus_emergence_settlement": [
        web(
            "cite_claim_exo_settle",
            "Israelites — origins / Iron I",
            "iron_i_settlement",
            "https://en.wikipedia.org/wiki/Israelites#Origins",
        ),
    ],
    "claim_exodus_emergence_mass_exodus": [
        verse(
            "cite_claim_exo_mass_ex1",
            "Исх 1–14 (нарратив)",
            "exodus_narrative",
            "Exod.1-14",
            "Exodus+1-14",
        ),
        web(
            "cite_claim_exo_mass_wiki",
            "The Exodus — historicity",
            "exodus_narrative",
            "https://en.wikipedia.org/wiki/The_Exodus#Origins_and_historicity",
        ),
    ],
    "claim_exodus_emergence_joshua_conquest": [
        web(
            "cite_claim_exo_josh",
            "Book of Joshua — conquest model",
            "exodus_narrative",
            "https://en.wikipedia.org/wiki/Book_of_Joshua#Historicity",
        ),
        web(
            "cite_claim_exo_josh_iron",
            "Israelites — Iron I settlement",
            "iron_i_settlement",
            "https://en.wikipedia.org/wiki/Israelites#Origins",
        ),
    ],
    "claim_exodus_emergence_moses_tradition": [
        verse(
            "cite_claim_exo_moses",
            "Исх 3",
            "exodus_narrative",
            "Exod.3",
            "Exodus+3",
        ),
        web(
            "cite_claim_exo_moses_wiki",
            "Moses — historicity",
            "exodus_narrative",
            "https://en.wikipedia.org/wiki/Moses#Historicity",
        ),
    ],
    # early monarchy
    "claim_early_monarchy_tel_dan": [
        inscription(
            "cite_claim_em_tel_dan",
            "Tel Dan Stele",
            "tel_dan_inscription",
            "https://en.wikipedia.org/wiki/Tel_Dan_stele",
        ),
    ],
    "claim_early_monarchy_scale": [
        verse(
            "cite_claim_em_scale_2sam",
            "2 Цар 5–8 (традиция)",
            "deuteronomistic_history",
            "2Sam.5-8",
            "2+Samuel+5-8",
        ),
        handbook(
            "cite_claim_em_scale_hb",
            "Kingdom of Israel (united monarchy)",
            "https://en.wikipedia.org/wiki/Kingdom_of_Israel_(united_monarchy)#Historicity",
        ),
    ],
    "claim_early_monarchy_jerusalem": [
        handbook(
            "cite_claim_em_jeru",
            "Jerusalem — Iron Age / City of David",
            "https://en.wikipedia.org/wiki/History_of_Jerusalem#Iron_Age",
        ),
        verse(
            "cite_claim_em_jeru_2sam5",
            "2 Цар 5",
            "deuteronomistic_history",
            "2Sam.5",
            "2+Samuel+5",
        ),
    ],
    # divided kingdoms
    "claim_divided_kingdoms_two_states": [
        verse(
            "cite_claim_div_two_1kgs12",
            "3 Цар 12",
            "deuteronomistic_history",
            "1Kgs.12",
            "1+Kings+12",
        ),
        web(
            "cite_claim_div_two_assyria",
            "Neo-Assyrian Empire (контекст)",
            "assyrian_annals",
            "https://en.wikipedia.org/wiki/Neo-Assyrian_Empire",
        ),
    ],
    "claim_divided_kingdoms_omrides": [
        web(
            "cite_claim_div_omri",
            "Omri / House of Omri",
            "assyrian_annals",
            "https://en.wikipedia.org/wiki/Omri",
        ),
        web(
            "cite_claim_div_omri_samaria",
            "Samaria (city)",
            "assyrian_annals",
            "https://en.wikipedia.org/wiki/Samaria_(ancient_city)",
        ),
    ],
    "claim_divided_kingdoms_jehu_obelisk": [
        inscription(
            "cite_claim_div_jehu",
            "Black Obelisk of Shalmaneser III",
            "black_obelisk",
            "https://en.wikipedia.org/wiki/Black_Obelisk_of_Shalmaneser_III",
        ),
    ],
    "claim_divided_kingdoms_mesha": [
        inscription(
            "cite_claim_div_mesha",
            "Mesha Stele",
            "mesha_stele",
            "https://en.wikipedia.org/wiki/Mesha_Stele",
        ),
    ],
    "claim_divided_kingdoms_elijah_ahab": [
        verse(
            "cite_claim_div_elijah",
            "3 Цар 18",
            "deuteronomistic_history",
            "1Kgs.18",
            "1+Kings+18",
        ),
    ],
    # assyria to exile
    "claim_assyria_to_exile_samaria_722": [
        verse(
            "cite_claim_ass_722_2kgs17",
            "4 Цар 17",
            "deuteronomistic_history",
            "2Kgs.17",
            "2+Kings+17",
        ),
        web(
            "cite_claim_ass_722_wiki",
            "Assyrian captivity / fall of Samaria",
            "assyrian_annals",
            "https://en.wikipedia.org/wiki/Assyrian_captivity",
        ),
    ],
    "claim_assyria_to_exile_sennacherib_701": [
        verse(
            "cite_claim_ass_701_2kgs18",
            "4 Цар 18–19",
            "deuteronomistic_history",
            "2Kgs.18-19",
            "2+Kings+18-19",
        ),
        web(
            "cite_claim_ass_701_prism",
            "Sennacherib's Annals",
            "assyrian_annals",
            "https://en.wikipedia.org/wiki/Sennacherib%27s_Annals",
        ),
    ],
    "claim_assyria_to_exile_jerusalem_586": [
        web(
            "cite_claim_ass_586_chron",
            "Babylonian Chronicles",
            "babylonian_chronicles",
            "https://en.wikipedia.org/wiki/Babylonian_Chronicles",
        ),
        verse(
            "cite_claim_ass_586_2kgs25",
            "4 Цар 25",
            "deuteronomistic_history",
            "2Kgs.25",
            "2+Kings+25",
        ),
    ],
    "claim_assyria_to_exile_josiah_reform": [
        verse(
            "cite_claim_ass_josiah",
            "4 Цар 22–23",
            "deuteronomistic_history",
            "2Kgs.22-23",
            "2+Kings+22-23",
        ),
        handbook(
            "cite_claim_ass_josiah_hb",
            "Josiah — reforms",
            "https://en.wikipedia.org/wiki/Josiah#Religious_reform",
        ),
    ],
    "claim_assyria_to_exile_597": [
        web(
            "cite_claim_ass_597",
            "Siege of Jerusalem (597 BCE)",
            "babylonian_chronicles",
            "https://en.wikipedia.org/wiki/Siege_of_Jerusalem_(597_BC)",
        ),
    ],
    # exile and persian
    "claim_exile_and_persian_cyrus_539": [
        inscription(
            "cite_claim_exil_cyrus",
            "Cyrus Cylinder",
            "cyrus_cylinder",
            "https://en.wikipedia.org/wiki/Cyrus_Cylinder",
        ),
        verse(
            "cite_claim_exil_ezra1",
            "Езд 1",
            "ezra_nehemiah",
            "Ezra.1",
            "Ezra+1",
        ),
    ],
    "claim_exile_and_persian_second_temple": [
        verse(
            "cite_claim_exil_temple_ez6",
            "Езд 6",
            "ezra_nehemiah",
            "Ezra.6",
            "Ezra+6",
        ),
        handbook(
            "cite_claim_exil_temple_hb",
            "Second Temple",
            "https://en.wikipedia.org/wiki/Second_Temple",
        ),
    ],
    "claim_exile_and_persian_ezra_nehemiah": [
        verse(
            "cite_claim_exil_ezra_neh",
            "Неем 8",
            "ezra_nehemiah",
            "Neh.8",
            "Nehemiah+8",
        ),
        handbook(
            "cite_claim_exil_ezra_hb",
            "Ezra–Nehemiah — historicity",
            "https://en.wikipedia.org/wiki/Ezra%E2%80%93Nehemiah#Historical_background",
        ),
    ],
    "claim_exile_and_persian_yehud": [
        handbook(
            "cite_claim_exil_yehud",
            "Yehud Medinata",
            "https://en.wikipedia.org/wiki/Yehud_Medinata",
        ),
    ],
    # hellenistic
    "claim_hellenistic_hasmonean_alexander": [
        web(
            "cite_claim_hel_alex",
            "Hellenistic period / Judea",
            "hellenistic_chronology",
            "https://en.wikipedia.org/wiki/Hellenistic_period",
        ),
        handbook(
            "cite_claim_hel_alex_judea",
            "History of the Jews in the Second Temple period",
            "https://en.wikipedia.org/wiki/History_of_the_Jews_in_the_Second_Temple_period",
        ),
    ],
    "claim_hellenistic_hasmonean_crisis_167": [
        verse(
            "cite_claim_hel_167_1macc",
            "1 Макк 1–4",
            "1_macc",
            "1Macc.1-4",
            "1+Maccabees+1-4",
        ),
        verse(
            "cite_claim_hel_167_2macc",
            "2 Макк 6–10",
            "2_macc",
            "2Macc.6-10",
            "2+Maccabees+6-10",
        ),
    ],
    "claim_hellenistic_hasmonean_state": [
        verse(
            "cite_claim_hel_state_1macc",
            "1 Макк 13–14",
            "1_macc",
            "1Macc.13-14",
            "1+Maccabees+13-14",
        ),
        josephus(
            "cite_claim_hel_state_jos",
            "Antiquities of the Jews (обзор)",
            "josephus_antiquities",
            "https://en.wikipedia.org/wiki/Hasmonean_dynasty",
        ),
    ],
    "claim_hellenistic_hasmonean_temple_rededication": [
        verse(
            "cite_claim_hel_hanukkah",
            "1 Макк 4:36–59",
            "1_macc",
            "1Macc.4.36-59",
            "1+Maccabees+4%3A36-59",
        ),
    ],
    # roman herodian
    "claim_roman_herodian_pompey_63": [
        josephus(
            "cite_claim_rom_pompey",
            "Pompey in Judea / Josephus",
            "josephus_antiquities",
            "https://en.wikipedia.org/wiki/Siege_of_Jerusalem_(63_BC)",
        ),
    ],
    "claim_roman_herodian_herod": [
        josephus(
            "cite_claim_rom_herod",
            "Herod the Great (Josephus)",
            "josephus_antiquities",
            "https://en.wikipedia.org/wiki/Herod_the_Great",
        ),
    ],
    "claim_roman_herodian_pilate": [
        inscription(
            "cite_claim_rom_pilate_stone",
            "Pilate Stone",
            "roman_fasti",
            "https://en.wikipedia.org/wiki/Pilate_stone",
        ),
        josephus(
            "cite_claim_rom_pilate_jos",
            "Pontius Pilate — Josephus",
            "josephus_antiquities",
            "https://en.wikipedia.org/wiki/Pontius_Pilate",
        ),
    ],
    "claim_roman_herodian_temple_rebuild": [
        josephus(
            "cite_claim_rom_temple",
            "Herod's Temple",
            "josephus_antiquities",
            "https://en.wikipedia.org/wiki/Herod%27s_Temple",
        ),
    ],
    # jesus
    "claim_jesus_jerusalem_historical_core": [
        verse(
            "cite_claim_jes_core_mark",
            "Мк 15",
            "synoptic_gospels",
            "Mark.15",
            "Mark+15",
        ),
        web(
            "cite_claim_jes_core_tacitus",
            "Тацит, Анналы 15.44",
            "tacitus_annals",
            "https://en.wikipedia.org/wiki/Tacitus_on_Jesus",
        ),
        verse(
            "cite_claim_jes_core_1cor15",
            "1 Кор 15:3–8",
            "pauline_letters",
            "1Cor.15.3-8",
            "1+Corinthians+15%3A3-8",
        ),
    ],
    "claim_jesus_jerusalem_crucifixion": [
        verse(
            "cite_claim_jes_cruc_mark15",
            "Мк 15",
            "synoptic_gospels",
            "Mark.15",
            "Mark+15",
        ),
        web(
            "cite_claim_jes_cruc_chrono",
            "Chronology of Jesus",
            "roman_fasti",
            "https://en.wikipedia.org/wiki/Chronology_of_Jesus",
        ),
    ],
    "claim_jesus_jerusalem_community": [
        verse(
            "cite_claim_jes_comm_gal1",
            "Гал 1:18–19",
            "pauline_letters",
            "Gal.1.18-19",
            "Galatians+1%3A18-19",
        ),
        verse(
            "cite_claim_jes_comm_acts2",
            "Деян 2 (традиция)",
            "acts",
            "Acts.2",
            "Acts+2",
        ),
    ],
    "claim_jesus_jerusalem_peter": [
        verse(
            "cite_claim_jes_peter_gal2",
            "Гал 2:7–9",
            "pauline_letters",
            "Gal.2.7-9",
            "Galatians+2%3A7-9",
        ),
        verse(
            "cite_claim_jes_peter_mark",
            "Мк 8:27–30",
            "synoptic_gospels",
            "Mark.8.27-30",
            "Mark+8%3A27-30",
        ),
    ],
    # pauline
    "claim_pauline_networks_letters": [
        verse(
            "cite_claim_paul_letters_gal",
            "Гал 1–2",
            "pauline_letters",
            "Gal.1-2",
            "Galatians+1-2",
        ),
        handbook(
            "cite_claim_paul_letters_hb",
            "Pauline epistles — undisputed",
            "https://en.wikipedia.org/wiki/Pauline_epistles#Undisputed_epistles",
        ),
    ],
    "claim_pauline_networks_geography": [
        verse(
            "cite_claim_paul_geo_rom",
            "Рим 15:19–28",
            "pauline_letters",
            "Rom.15.19-28",
            "Romans+15%3A19-28",
        ),
        verse(
            "cite_claim_paul_geo_1cor",
            "1 Кор 1:1–2",
            "pauline_letters",
            "1Cor.1.1-2",
            "1+Corinthians+1%3A1-2",
        ),
    ],
    "claim_pauline_networks_acts_secondary": [
        verse(
            "cite_claim_paul_acts",
            "Деян 15 / Гал 2 (сравнение)",
            "acts",
            "Acts.15",
            "Acts+15",
        ),
        handbook(
            "cite_claim_paul_acts_hb",
            "Acts of the Apostles — historicity",
            "https://en.wikipedia.org/wiki/Acts_of_the_Apostles#Historicity",
        ),
    ],
    "claim_pauline_networks_antioch_incident": [
        verse(
            "cite_claim_paul_antioch",
            "Гал 2:11–14",
            "pauline_letters",
            "Gal.2.11-14",
            "Galatians+2%3A11-14",
        ),
    ],
    # war
    "claim_war_and_divergence_66_70": [
        josephus(
            "cite_claim_war_70",
            "The Jewish War / Siege of Jerusalem (70)",
            "josephus_war",
            "https://en.wikipedia.org/wiki/Siege_of_Jerusalem_(70_CE)",
        ),
    ],
    "claim_war_and_divergence_paths": [
        handbook(
            "cite_claim_war_paths",
            "Split of early Christianity and Judaism",
            "https://en.wikipedia.org/wiki/Split_of_early_Christianity_and_Judaism",
        ),
        josephus(
            "cite_claim_war_paths_jos",
            "The Jewish War (обзор)",
            "josephus_war",
            "https://en.wikipedia.org/wiki/The_Jewish_War",
        ),
    ],
    "claim_war_and_divergence_vespasian_titus": [
        josephus(
            "cite_claim_war_vesp",
            "First Jewish–Roman War",
            "josephus_war",
            "https://en.wikipedia.org/wiki/First_Jewish%E2%80%93Roman_War",
        ),
    ],
    # bar kokhba
    "claim_bar_kokhba_revolt": [
        inscription(
            "cite_claim_bk_letters",
            "Bar Kokhba letters",
            "bar_kokhba_letters",
            "https://en.wikipedia.org/wiki/Bar_Kokhba_letters",
        ),
        web(
            "cite_claim_bk_dio",
            "Cassius Dio / Bar Kokhba",
            "dio_cassius",
            "https://en.wikipedia.org/wiki/Bar_Kokhba_revolt",
        ),
    ],
    "claim_bar_kokhba_aelia": [
        web(
            "cite_claim_bk_aelia",
            "Aelia Capitolina",
            "dio_cassius",
            "https://en.wikipedia.org/wiki/Aelia_Capitolina",
        ),
    ],
    "claim_bar_kokhba_letters_admin": [
        inscription(
            "cite_claim_bk_admin",
            "Bar Kokhba letters",
            "bar_kokhba_letters",
            "https://en.wikipedia.org/wiki/Bar_Kokhba_letters",
        ),
    ],
    "claim_bar_kokhba_hadrian_policy": [
        web(
            "cite_claim_bk_hadrian",
            "Hadrian — Judea policy",
            "dio_cassius",
            "https://en.wikipedia.org/wiki/Hadrian#Final_years",
        ),
    ],
}

INT_CITATIONS: dict[str, list[dict]] = {
    "int_abraham_jacob_kin": [
        verse(
            "cite_int_abr_jac",
            "Быт 25; 27–28",
            "genesis_narrative",
            "Gen.25;27-28",
            "Genesis+25%3B+Genesis+27-28",
        ),
    ],
    "int_jacob_joseph_kin": [
        verse(
            "cite_int_jac_jos",
            "Быт 37",
            "genesis_narrative",
            "Gen.37",
            "Genesis+37",
        ),
    ],
    "int_moses_aaron_kin": [
        verse(
            "cite_int_mos_aar",
            "Исх 4:14–16",
            "exodus_narrative",
            "Exod.4.14-16",
            "Exodus+4%3A14-16",
        ),
    ],
    "int_moses_joshua_succeeds": [
        verse(
            "cite_int_mos_josh",
            "Втор 31; Нав 1",
            "exodus_narrative",
            "Deut.31;Josh.1",
            "Deuteronomy+31%3B+Joshua+1",
        ),
    ],
    "int_solomon_david_succeeds": [
        verse(
            "cite_int_sol_dav",
            "3 Цар 1–2",
            "deuteronomistic_history",
            "1Kgs.1-2",
            "1+Kings+1-2",
        ),
        inscription(
            "cite_int_sol_dav_tel",
            "Tel Dan Stele (дом Давида)",
            "tel_dan_inscription",
            "https://en.wikipedia.org/wiki/Tel_Dan_stele",
        ),
    ],
    "int_omri_ahab_succeeds": [
        verse(
            "cite_int_omri_ahab",
            "3 Цар 16:23–34",
            "deuteronomistic_history",
            "1Kgs.16.23-34",
            "1+Kings+16%3A23-34",
        ),
        web(
            "cite_int_omri_ahab_wiki",
            "Ahab",
            "assyrian_annals",
            "https://en.wikipedia.org/wiki/Ahab",
        ),
    ],
    "int_elijah_ahab_opposes": [
        verse(
            "cite_int_elijah_ahab",
            "3 Цар 18",
            "deuteronomistic_history",
            "1Kgs.18",
            "1+Kings+18",
        ),
    ],
    "int_jehu_ahab_opposes": [
        inscription(
            "cite_int_jehu_obelisk",
            "Black Obelisk",
            "black_obelisk",
            "https://en.wikipedia.org/wiki/Black_Obelisk_of_Shalmaneser_III",
        ),
        verse(
            "cite_int_jehu_2kgs9",
            "4 Цар 9–10",
            "deuteronomistic_history",
            "2Kgs.9-10",
            "2+Kings+9-10",
        ),
    ],
    "int_sennacherib_hezekiah_opposes": [
        web(
            "cite_int_senn_hez",
            "Sennacherib's Annals",
            "assyrian_annals",
            "https://en.wikipedia.org/wiki/Sennacherib%27s_Annals",
        ),
        verse(
            "cite_int_senn_hez_2kgs",
            "4 Цар 18–19",
            "deuteronomistic_history",
            "2Kgs.18-19",
            "2+Kings+18-19",
        ),
    ],
    "int_nebuchadnezzar_josiah_context": [
        web(
            "cite_int_neb_jos",
            "Babylonian Chronicles",
            "babylonian_chronicles",
            "https://en.wikipedia.org/wiki/Babylonian_Chronicles",
        ),
        verse(
            "cite_int_neb_jos_2kgs",
            "4 Цар 23:29–30",
            "deuteronomistic_history",
            "2Kgs.23.29-30",
            "2+Kings+23%3A29-30",
        ),
    ],
    "int_cyrus_after_babylon": [
        inscription(
            "cite_int_cyrus",
            "Cyrus Cylinder",
            "cyrus_cylinder",
            "https://en.wikipedia.org/wiki/Cyrus_Cylinder",
        ),
    ],
    "int_ezra_nehemiah_allies": [
        verse(
            "cite_int_ezra_neh",
            "Неем 8",
            "ezra_nehemiah",
            "Neh.8",
            "Nehemiah+8",
        ),
    ],
    "int_antiochus_mattathias_opposes": [
        verse(
            "cite_int_ant_matt",
            "1 Макк 2",
            "1_macc",
            "1Macc.2",
            "1+Maccabees+2",
        ),
    ],
    "int_mattathias_judas_kin": [
        verse(
            "cite_int_matt_judas",
            "1 Макк 2:1–5",
            "1_macc",
            "1Macc.2.1-5",
            "1+Maccabees+2%3A1-5",
        ),
    ],
    "int_herod_to_prefects": [
        josephus(
            "cite_int_herod_pref",
            "Herodian kingdom → Roman Judea",
            "josephus_antiquities",
            "https://en.wikipedia.org/wiki/Judea_(Roman_province)",
        ),
    ],
    # int_pilate_jesus_judges already cited
    "int_jesus_peter_meets": [
        verse(
            "cite_int_jes_peter",
            "Мк 1:16–18; 8:27–30",
            "synoptic_gospels",
            "Mark.1.16-18;8.27-30",
            "Mark+1%3A16-18%3B+Mark+8%3A27-30",
        ),
        verse(
            "cite_int_jes_peter_gal",
            "Гал 1:18",
            "pauline_letters",
            "Gal.1.18",
            "Galatians+1%3A18",
        ),
    ],
    "int_paul_jesus_mentions": [
        verse(
            "cite_int_paul_jesus",
            "1 Кор 15:3–8",
            "pauline_letters",
            "1Cor.15.3-8",
            "1+Corinthians+15%3A3-8",
        ),
    ],
    # int_paul_peter_opposes already cited
    "int_josephus_documents_herod": [
        josephus(
            "cite_int_jos_herod",
            "Antiquities — Herod",
            "josephus_antiquities",
            "https://en.wikipedia.org/wiki/Antiquities_of_the_Jews",
        ),
    ],
    "int_josephus_vespasian_serves": [
        josephus(
            "cite_int_jos_vesp",
            "Josephus — Flavian patronage",
            "josephus_war",
            "https://en.wikipedia.org/wiki/Josephus#In_Rome",
        ),
    ],
    "int_bar_kokhba_hadrian_opposes": [
        inscription(
            "cite_int_bk_letters",
            "Bar Kokhba letters",
            "bar_kokhba_letters",
            "https://en.wikipedia.org/wiki/Bar_Kokhba_letters",
        ),
        web(
            "cite_int_bk_revolt",
            "Bar Kokhba revolt",
            "dio_cassius",
            "https://en.wikipedia.org/wiki/Bar_Kokhba_revolt",
        ),
    ],
    "int_david_hezekiah_dynasty": [
        inscription(
            "cite_int_dav_hez_tel",
            "Tel Dan Stele",
            "tel_dan_inscription",
            "https://en.wikipedia.org/wiki/Tel_Dan_stele",
        ),
        verse(
            "cite_int_dav_hez_2kgs",
            "4 Цар 18:1–3",
            "deuteronomistic_history",
            "2Kgs.18.1-3",
            "2+Kings+18%3A1-3",
        ),
    ],
    "int_herod_jesus_context": [
        josephus(
            "cite_int_herod_jes_jos",
            "Herod's Temple / Judea",
            "josephus_antiquities",
            "https://en.wikipedia.org/wiki/Herod%27s_Temple",
        ),
        verse(
            "cite_int_herod_jes_mark",
            "Мк 13:1–2",
            "synoptic_gospels",
            "Mark.13.1-2",
            "Mark+13%3A1-2",
        ),
    ],
    "int_paul_rome_mentions": [
        verse(
            "cite_int_paul_rome",
            "Рим 1:7; 15:22–29",
            "pauline_letters",
            "Rom.1.7;15.22-29",
            "Romans+1%3A7%3B+Romans+15%3A22-29",
        ),
        web(
            "cite_int_paul_rome_pilate",
            "Pilate Stone (префектура)",
            "roman_fasti",
            "https://en.wikipedia.org/wiki/Pilate_stone",
        ),
    ],
}


def dump(path: Path, data) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    claim_updated = 0
    claim_total = 0
    claim_cited = 0
    missing_claims: list[str] = []

    for path in sorted((DATA / "claims" / "by-epoch").glob("*.json")):
        if path.name == "index.json":
            continue
        items = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for c in items:
            claim_total += 1
            cid = c["id"]
            existing = c.get("citations") or []
            if existing:
                claim_cited += 1
                continue
            cites = CLAIM_CITATIONS.get(cid)
            if not cites:
                missing_claims.append(cid)
                continue
            c["citations"] = cites
            claim_updated += 1
            claim_cited += 1
            changed = True
        if changed:
            dump(path, items)

    ints = json.loads((DATA / "interactions.json").read_text(encoding="utf-8"))
    int_updated = 0
    int_cited = 0
    missing_ints: list[str] = []
    for i in ints:
        existing = i.get("citations") or []
        if existing:
            int_cited += 1
            continue
        cites = INT_CITATIONS.get(i["id"])
        if not cites:
            missing_ints.append(i["id"])
            continue
        i["citations"] = cites
        int_updated += 1
        int_cited += 1
    dump(DATA / "interactions.json", ints)

    print(
        json.dumps(
            {
                "claims_total": claim_total,
                "claims_cited": claim_cited,
                "claims_updated": claim_updated,
                "claims_missing": missing_claims,
                "ints_total": len(ints),
                "ints_cited": int_cited,
                "ints_updated": int_updated,
                "ints_missing": missing_ints,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
