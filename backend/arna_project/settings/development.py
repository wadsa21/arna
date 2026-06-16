"""Настройки для локальной разработки."""
from .base import *  # noqa: F401,F403

DEBUG = True

# В разработке разрешаем все CORS-источники для удобства
CORS_ALLOW_ALL_ORIGINS = True

# Подробное логирование Kafka/Channels
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
    "loggers": {
        "arna.kafka": {"handlers": ["console"], "level": "DEBUG", "propagate": False},
    },
}
