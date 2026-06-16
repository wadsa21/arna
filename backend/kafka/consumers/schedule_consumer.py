"""
Консьюмер топика arna.schedule.completed.

Само уведомление родителю создаётся синхронно во вьюхе complete()
(работает всегда, без обязательного запуска консьюмера). Здесь мы
обновляем аналитику выполнения и пробрасываем событие в ИИ-поток
arna.ai.analyze (задел под анализ продуктивности дня).

Запуск:  python -m kafka.consumers.schedule_consumer
"""
import logging

from .base import run_consumer

logger = logging.getLogger("arna.kafka")


def handle_schedule_completed(payload: dict) -> None:
    from kafka.producer import publish_ai_analyze

    child_id = payload.get("child_id")
    item_id = payload.get("item_id")
    logger.info("schedule.completed: child=%s item=%s", child_id, item_id)

    # Задел под ИИ: анализ выполнения расписания
    publish_ai_analyze(
        child_id=child_id,
        kind="schedule_completed",
        payload={"item_id": item_id, "completed_at": payload.get("completed_at")},
    )


def main():
    run_consumer(
        topic_key="schedule_completed",
        handler=handle_schedule_completed,
        group_suffix="schedule",
    )


if __name__ == "__main__":
    main()
