# Внешние датасеты (P4)

## Theographic Bible Metadata

- Upstream: https://github.com/robertrouse/theographic-bible-metadata
- License: **CC-BY-SA 4.0**
- Роль в civilization: только **candidate layer**, не attested history

### Команда

```bash
npm run extract:theographic
```

Скачивает `people.json` в `data/external/raw/` (gitignore) и обогащает
`data/candidates/people.json` полем `upstream`.

### Правило

Не копировать весь Theographic в claims. Candidate people в UI помечены отдельно;
confidence не выше согласованного в curated-файле.
