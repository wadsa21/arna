"""
Локальный демо-режим без внешней инфраструктуры.

Поднимает приложение БЕЗ Docker/PostgreSQL/Kafka/Redis:
  - БД: SQLite (файл db_demo.sqlite3)
  - Channels: in-memory layer (WebSocket работает в пределах процесса)
  - Celery: задачи выполняются синхронно (eager)
  - Kafka: producer ленивый и проглатывает ошибки, поэтому
    эндпоинты работают и без брокера (события просто не публикуются)

Запуск:
    DJANGO_SETTINGS_MODULE=arna_project.settings.local_demo \
        python manage.py migrate
    DJANGO_SETTINGS_MODULE=arna_project.settings.local_demo \
        python manage.py runserver

Для полноценной работы (Kafka-консьюмеры, реалтайм между процессами,
напоминания) используйте development.py + docker compose up.
"""
from .base import *  # noqa: F401,F403

DEBUG = True
SECRET_KEY = "local-demo-insecure-key"
CORS_ALLOW_ALL_ORIGINS = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db_demo.sqlite3",  # noqa: F405
    }
}

CHANNEL_LAYERS = {
    "default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}
}

CELERY_TASK_ALWAYS_EAGER = True

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
