"""
Консьюмер топика arna.behavior.logged.

Сейчас: создаёт системное уведомление и пробрасывает событие
в топик arna.ai.analyze (задел под будущий ИИ-анализ паттернов
поведения — consumer arna.ai.analyze пока НЕ реализован).

Запуск:  python -m kafka.consumers.behavior_consumer
"""
import logging

from .base import run_consumer

logger = logging.getLogger("arna.kafka")


def handle_behavior_logged(payload: dict) -> None:
    from kafka.producer import publish_ai_analyze

    child_id = payload.get("child_id")
    log_id = payload.get("log_id")
    mood = payload.get("mood")

    logger.info(
        "Новая запись в дневнике: child=%s log=%s mood=%s",
        child_id,
        log_id,
        mood,
    )

    # Задел под ИИ: перекидываем событие в топик анализа.
    # Consumer arna.ai.analyze будет добавлен позже.
    publish_ai_analyze(
        child_id=child_id,
        kind="behavior_log",
        payload={"log_id": log_id, "mood": mood, "date": payload.get("date")},
    )


def main():
    run_consumer(
        topic_key="behavior_logged",
        handler=handle_behavior_logged,
        group_suffix="behavior",
    )


if __name__ == "__main__":
    main()
