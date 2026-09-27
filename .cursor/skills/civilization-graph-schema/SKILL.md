---
name: civilization-graph-schema
description: >-
  Схема данных civilization: Epoch, Source, Claim, Interaction; английские id,
  русские label. Use when editing schema/, data/epochs.json, data/sources.json,
  data/interactions.json, or claim files.
---

# civilization-graph-schema

## Сущности MVP

1. **Epoch** — `data/epochs.json`, контракт `schema/epoch.schema.json`
2. **Source** — `data/sources.json`, контракт `schema/source.schema.json`
3. **Claim** — `data/claims/by-epoch/<epoch_id>.json`, контракт `schema/claim.schema.json`
4. **Interaction** — `data/interactions.json`, контракт `schema/interaction.schema.json`
5. **Candidate person** — `data/candidates/people.json` (не attested)

## Id

- Эпохи: как в согласованном каркасе (`patriarchal_horizon`, … `bar_kokhba`).
- Источники: `1_macc`, `josephus_war`, `merneptah_stele`, …
- Claims: `claim_<epoch>_<slug>`
- Interactions: `int_<slug>`; `from_person_id` / `to_person_id` = id из candidates

## Interaction

Ребро с `relation`, `confidence`, `source_ids`. Не рисовать «встречи» без источника;
политическая смена власти допустима с `note_ru`.

## Правки

1. Сверься с `docs/canon/epoch-skeleton.md` и skill `historical-critical-canon`.
2. Обнови JSON, не ломая schema.
3. UI читает `data/*` через импорт/fetch — сохрани структуру массивов.
