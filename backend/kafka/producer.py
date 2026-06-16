"""
Тонкая обёртка над confluent-kafka Producer.

Используется синглтон, чтобы переиспользовать одно соединение
на процесс Django. Все события сериализуются в JSON.
"""
import json
import logging
import atexit
from typing import Any

from django.conf import settings

logger = logging.getLogger("arna.kafka")

# confluent_kafka импортируется лениво: веб/ASGI-процесс должен
# подниматься даже если клиент Kafka недоступен (publish мягко
# проглатывает ошибки и не ломает пользовательский запрос).
_producer = None


def get_producer():
    global _producer
    if _producer is None:
        from confluent_kafka import Producer

        _producer = Producer(
            {
                "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
                "client.id": "arna-producer",
                "enable.idempotence": True,
                "acks": "all",
            }
        )
        atexit.register(lambda: _producer and _producer.flush(5))
        logger.info(
            "Kafka producer инициализирован (%s)",
            settings.KAFKA_BOOTSTRAP_SERVERS,
        )
    return _producer


def _delivery_report(err, msg):
    if err is not None:
        logger.error("Доставка сообщения не удалась: %s", err)
    else:
        logger.debug(
            "Сообщение доставлено в %s [%s]", msg.topic(), msg.partition()
        )


def publish(topic: str, payload: dict[str, Any], key: str | None = None) -> None:
    """
    Опубликовать событие в Kafka. Не бросает исключение наружу —
    отказ брокера не должен ломать пользовательский запрос.
    """
    try:
        producer = get_producer()
        producer.produce(
            topic=topic,
            key=key.encode() if key else None,
            value=json.dumps(payload, default=str).encode(),
            callback=_delivery_report,
        )
        producer.poll(0)  # триггерим delivery callbacks
    except Exception:  # noqa: BLE001
        logger.exception("Не удалось опубликовать событие в топик %s", topic)


# --- Высокоуровневые хелперы под доменные события ------------------------

def publish_schedule_completed(child_id, item_id, completed_at) -> None:
    publish(
        settings.KAFKA_TOPICS["schedule_completed"],
        {
            "child_id": str(child_id),
            "item_id": str(item_id),
            "completed_at": completed_at,
        },
        key=str(child_id),
    )


def publish_behavior_logged(child_id, log_id, mood, date) -> None:
    publish(
        settings.KAFKA_TOPICS["behavior_logged"],
        {
            "child_id": str(child_id),
            "log_id": str(log_id),
            "mood": mood,
            "date": date,
        },
        key=str(child_id),
    )


def publish_ai_analyze(child_id, kind, payload: dict) -> None:
    """Задел под будущий ИИ-анализ. Consumer пока не реализован."""
    publish(
        settings.KAFKA_TOPICS["ai_analyze"],
        {"child_id": str(child_id), "kind": kind, **payload},
        key=str(child_id),
    )
