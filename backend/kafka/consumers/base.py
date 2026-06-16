"""
Базовый раннер для Kafka-консьюмеров.

Каждый консьюмер — это отдельный процесс, который инициализирует
Django, затем крутит poll-цикл по своему топику.
"""
import json
import logging
import os
import signal
import sys

import django
from confluent_kafka import Consumer, KafkaError

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE", "arna_project.settings.development"
)
django.setup()  # noqa: E402  нужно до импорта моделей в дочерних консьюмерах

from django.conf import settings  # noqa: E402

logger = logging.getLogger("arna.kafka")


def run_consumer(topic_key: str, handler, group_suffix: str) -> None:
    """
    topic_key   — ключ в settings.KAFKA_TOPICS
    handler     — функция(payload: dict) -> None
    group_suffix — суффикс consumer-группы (изоляция офсетов)
    """
    topic = settings.KAFKA_TOPICS[topic_key]
    consumer = Consumer(
        {
            "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
            "group.id": f"{settings.KAFKA_CONSUMER_GROUP}.{group_suffix}",
            "auto.offset.reset": "earliest",
            "enable.auto.commit": True,
        }
    )
    consumer.subscribe([topic])
    logger.info("Консьюмер подписан на топик '%s'", topic)

    running = True

    def _shutdown(*_):
        nonlocal running
        running = False
        logger.info("Получен сигнал остановки, закрываю консьюмер…")

    signal.signal(signal.SIGINT, _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)

    try:
        while running:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                logger.error("Ошибка консьюмера: %s", msg.error())
                continue
            try:
                payload = json.loads(msg.value().decode())
                handler(payload)
            except Exception:  # noqa: BLE001
                logger.exception("Ошибка обработки сообщения из '%s'", topic)
    finally:
        consumer.close()
        logger.info("Консьюмер '%s' остановлен", topic)
        sys.exit(0)
