# Слой «Отцы Церкви» (P11)

Статус: **opt-in**, вне university baseline. Default в UI — выключен.

Данные: `data/layers/fathers/claims.json` (`meta.default_enabled: false`).

## Источники

| id | Автор |
|----|--------|
| `ignatius_letters` | Игнатий Антиохийский |
| `justin_apology` | Иустин Мученик |
| `irenaeus_haer` | Ириней |
| `eusebius_he` | Евсевий, Церковная история |

## Правила

- Только история **канона и рецепции** после 70/135.
- Не «биография Иисуса»; не поднимать евангельский сюжет до `firm` через отцов.
- Claims помечены `"layer": "church_fathers"` и не лежат в `data/claims/by-epoch/`.
- Эпохи `war_and_divergence` / `bar_kokhba` — якоря контекста «после 70/135»; даты внутри claim могут выходить за вилку эпохи.
