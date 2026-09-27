---
name: civilization-graph-schema
description: >-
  Схема данных civilization: Epoch, Source, Claim, Interaction, Place, Event,
  Citation. Use when editing schema/ or data/*.json.
---

# civilization-graph-schema

## Сущности

1. **Epoch** — `data/epochs.json`
2. **Source** — `data/sources.json` (желательно `urls[]`)
3. **Claim** — `data/claims/by-epoch/<epoch_id>.json` (+ optional `citations`)
4. **Interaction** — `data/interactions.json` (+ optional `citations`)
5. **Place** — `data/places.json`
6. **Event** — `data/events.json`
7. **Candidate person** — `data/candidates/people.json` (не attested)
8. **Citation** — вложенный объект (`verse|inscription|josephus|web|handbook` + `url`)

## Id

- Places: `jerusalem`, `samaria`, …
- Events: `evt_<slug>`
- Citations: `cite_<slug>`

## Правила

- Place/Event не повышать выше оправданного `confidence`.
- Citation без `url` допустим, но для P6 предпочтителен кликабельный url.
- Не смешивать Places с candidate people.
