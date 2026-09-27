---
name: civilization-graph-schema
description: >-
  Схема данных civilization: Epoch, Source, Claim; английские id, русские
  label. Use when editing schema/, data/epochs.json, data/sources.json,
  or claim files.
---

# civilization-graph-schema

## Сущности MVP

1. **Epoch** — `data/epochs.json`, контракт `schema/epoch.schema.json`
2. **Source** — `data/sources.json`, контракт `schema/source.schema.json`
3. **Claim** — `data/claims/by-epoch/<epoch_id>.json`, контракт `schema/claim.schema.json`

Полный граф Person/Place/Event — позже; сейчас якоря внутри claim и `anchors` эпохи.

## Id

- Эпохи: как в согласованном каркасе (`patriarchal_horizon`, … `bar_kokhba`).
- Источники: `1_macc`, `josephus_war`, `merneptah_stele`, …
- Claims: `claim_<epoch>_<slug>`

## Правки

1. Сверься с `docs/canon/epoch-skeleton.md` и skill `historical-critical-canon`.
2. Обнови JSON, не ломая schema.
3. UI читает `data/*` через импорт/fetch — сохрани структуру массивов.
