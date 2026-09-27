# Civilization

Интерактивный **историко-критический** каркас длинной дуги Ветхого и Нового Завета: эпохи → утверждения (claims) → источники.

Тон: университетский textbook-консенсус. UI на русском, id — английские.

## Быстрый старт

```bash
npm install
npm run dev
```

Откроется Vite-приложение (`web/`): лента 12 эпох, граф лиц, взаимодействия, claims.

```bash
npm run build
npm run check:data            # целостность data/* (ids, citations, orphans)
npm run extract:theographic   # P4: обогатить candidates из Theographic
```

## Структура

| Путь | Содержание |
|------|------------|
| `docs/canon/` | Методология, политика источников, список эпох |
| `schema/` | JSON Schema для Epoch / Source / Claim |
| `data/epochs.json` | 12 эпох |
| `data/sources.json` | Реестр источников (`1_macc` / `2_macc` = `historical_document`) |
| `data/claims/by-epoch/` | Ручные якоря-утверждения |
| `data/candidates/people.json` | Curated лица (candidate, не attested) |
| `data/interactions.json` | Взаимодействия лиц (рёбра + источники) |
| `data/places.json` | Места (P5) |
| `data/events.json` | События (P5) + citations (P6) |
| `data/polities.json` | Имперские акторы (P9) |
| `data/lenses/` | Линзы university / conservative / minimalist (сравнительные overrides) |
| `data/layers/fathers/` | Opt-in слой отцов (рецепция/канон; выкл по умолчанию) |
| `data/external/` | Upstream docs; raw/ в gitignore |
| `scripts/extract-theographic-people.mjs` | P4 extract |
| `web/` | UI (React + Vite + TS) |
| `.cursor/rules/` | Правило агента |
| `.cursor/skills/` | Три project skills |

## Согласованные решения

- 12 эпох (Бар-Кохба = 12, `firm`)
- Иосиф — точечно с эпохи 8
- Отцы Церкви — opt-in слой рецепции (`data/layers/fathers/`), не university baseline
- Маккавеи — `historical_document`, не канон UI
- **P4 Theographic** — candidate layer (`data/candidates` + extract script)

## Публикация (GitHub Pages)

CI: `.github/workflows/pages.yml` (push в `master`).

Сайт: `https://baskakovanton.github.io/civilization/`

Локальная сборка под Pages:

```bash
# PowerShell
$env:GITHUB_PAGES="true"; npm run build
```

## Upstream check (P12 stub)

```bash
npm run check:upstream
```

## Канон для агента

См. `.cursor/skills/historical-critical-canon/SKILL.md` и `docs/canon/methodology.md`.
