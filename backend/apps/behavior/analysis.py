"""
Анализ паттернов поведения по записям дневника.

Сейчас — детерминированная rule-based логика (без внешних моделей),
но интерфейс готов к замене на ML/LLM: вход — записи ребёнка,
выход — структурированные инсайты и рекомендации, которые кладутся
в BehaviorLog.ai_insights и отдаются по API.
"""
import re
from collections import Counter
from datetime import date

WINDOW = 30  # сколько последних записей анализируем


def _split_phrases(text: str):
    """Разбить поле триггеров/заметок на отдельные фразы."""
    if not text:
        return []
    parts = re.split(r"[,;\n]+", text)
    return [p.strip().lower() for p in parts if p.strip()]


def analyze_behavior(child, logs=None) -> dict:
    """
    Вернуть инсайты по ребёнку. logs — итерабельно BehaviorLog
    (если None — берём последние WINDOW записей).
    """
    if logs is None:
        logs = list(
            child.behavior_logs.order_by("-date")[:WINDOW]
        )
    logs = sorted(logs, key=lambda l: l.date)  # по возрастанию даты

    count = len(logs)
    result = {
        "generated_at": date.today().isoformat(),
        "data_points": count,
        "engine": "rule-based-v1",
    }

    if count == 0:
        result["recommendations"] = [
            "Пока нет записей. Ведите дневник, чтобы получить анализ."
        ]
        return result

    moods = [l.mood for l in logs]
    avg = round(sum(moods) / count, 2)
    result["average_mood"] = avg

    # Тренд: сравниваем среднее первой и второй половины
    trend = "stable"
    if count >= 4:
        half = count // 2
        early = sum(moods[:half]) / half
        late = sum(moods[half:]) / (count - half)
        if late - early >= 0.5:
            trend = "improving"
        elif early - late >= 0.5:
            trend = "declining"
    result["trend"] = trend

    # Лучший / самый трудный день
    best = max(logs, key=lambda l: l.mood)
    worst = min(logs, key=lambda l: l.mood)
    result["best_day"] = {"date": best.date.isoformat(), "mood": best.mood}
    result["hardest_day"] = {"date": worst.date.isoformat(), "mood": worst.mood}

    # Текущая серия «хороших» дней (mood >= 4) с конца
    streak = 0
    for l in reversed(logs):
        if l.mood >= 4:
            streak += 1
        else:
            break
    result["good_streak"] = streak

    # Частые триггеры
    trigger_counter = Counter()
    for l in logs:
        trigger_counter.update(_split_phrases(l.triggers))
    common = [
        {"text": text, "count": c}
        for text, c in trigger_counter.most_common(3)
        if c >= 2
    ]
    result["common_triggers"] = common

    # --- Рекомендации (rule-based) ---
    rec = []
    if count < 3:
        rec.append("Недостаточно данных — ведите дневник регулярнее для точного анализа.")
    if avg < 2.5:
        rec.append("Среднее настроение низкое: сократите нагрузку и добавьте любимые активности в расписание.")
    elif avg >= 4:
        rec.append("Высокое среднее настроение — текущий распорядок отлично подходит ребёнку.")
    if trend == "declining":
        rec.append("Настроение снижается. Обратите внимание на недавние изменения в режиме и окружении.")
    elif trend == "improving":
        rec.append("Положительная динамика настроения — продолжайте в том же духе.")
    for tr in common:
        rec.append(f"Повторяющийся триггер: «{tr['text']}» ({tr['count']}×). Постарайтесь его минимизировать или подготовить ребёнка заранее.")
    if streak >= 3:
        rec.append(f"{streak} дн. подряд с хорошим настроением — отличный результат!")
    if not rec:
        rec.append("Стабильная картина без выраженных проблем. Продолжайте наблюдение.")
    result["recommendations"] = rec

    return result
