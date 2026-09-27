---
name: source-ingest-checklist
description: >-
  Чеклист добавления источника или внешнего датасета в civilization.
  Use when adding sources, inscriptions, handbook refs, or proposing
  Theographic/Gnosis ingest.
---

# source-ingest-checklist

Перед добавлением источника/датасета:

1. **Лицензия** — можно ли использовать и атрибутировать?
2. **Тип** — один из `Source.type` в каноне.
3. **Id** — английский `snake_case`; `label_ru` для UI.
4. **tradition_note_ru** — если статус в канонах расходится (как у Маккавеев).
5. **Default confidence** для claims на этом источнике — не завышать.
6. **Theographic (P4):** полный raw в `data/external/raw/` (gitignore); в репо — только curated `data/candidates/people.json`. Команда: `npm run extract:theographic`.
7. Candidate-слой → не смешивать с claims; UI отдельной секцией; не поднимать confidence без ручной калибровки.
8. Обновить `data/sources.json`; при новых claims — файл эпохи в `data/claims/by-epoch/`.
