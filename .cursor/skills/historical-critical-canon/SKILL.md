---
name: historical-critical-canon
description: >-
  Канон историко-критической модели civilization (ВЗ/НЗ): confidence,
  типы источников, формат claim, политика Маккавеев и Иосифа. Use when
  editing epochs, claims, sources, docs/canon, or discussing biblical history.
---

# historical-critical-canon

## Confidence

| Уровень | Смысл |
|---------|--------|
| `literary` | Только предание/текст; нет абсолютной внешней хронологии |
| `disputed` | Есть якоря, реконструкция спорная |
| `anchored` | Историческое ядро; детали вилкой |
| `firm` | Внешняя хронология (анналы, эпиграфика, римская история) держит факт/эпоху |

Не поднимай `literary` → `firm` без нового источника и явного ок.

## Source.type

`canon_text` · `historical_document` · `inscription` · `archaeology` · `classical_historiography` · `modern_handbook`

Утверждено: `1_macc`, `2_macc` → `historical_document` (не канон Писания в UI).

## Claim (минимум)

```json
{
  "id": "claim_epoch_short_slug",
  "epoch_id": "divided_kingdoms",
  "statement_ru": "…",
  "confidence": "firm",
  "date_min": -722,
  "date_max": -722,
  "source_ids": ["assyrian_annals"],
  "dissent_ru": "опционально"
}
```

Годы: отрицательные = до н.э., положительные = н.э.

## Политика слоёв

- Иосиф: эпохи 8–11, точечно.
- Отцы Церкви: вне MVP.
- Competing schools: не в default-данных; позже отдельной линзой.
- Полный people-dump Theographic: P4, отдельный ок.
