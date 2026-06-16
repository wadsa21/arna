"""
Единая точка создания уведомлений: пишет запись в БД и сразу
пушит её в WebSocket-группу пользователя через Channels.

Используется напрямую из вьюх (синхронный путь — работает всегда,
даже без запущенного Kafka-консьюмера) и из Celery/Kafka.
"""
import logging

from .models import Notification

logger = logging.getLogger("arna.notifications")


def notify(user, title, body="", type=Notification.Type.SYSTEM, data=None):
    """Создать уведомление и доставить его в реальном времени."""
    notification = Notification.objects.create(
        user=user, title=title, body=body, type=type, data=data or {}
    )
    push_realtime(user, notification)
    return notification


def push_realtime(user, notification):
    """Отправить уведомление в персональную WS-группу пользователя."""
    try:
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer

        layer = get_channel_layer()
        if not layer:
            return
        async_to_sync(layer.group_send)(
            f"user_{user.id}",
            {
                "type": "notify",
                "payload": {
                    "id": str(notification.id),
                    "title": notification.title,
                    "body": notification.body,
                    "type": notification.type,
                    "created_at": notification.created_at.isoformat(),
                },
            },
        )
    except Exception:  # noqa: BLE001
        # Отсутствие канального слоя/Redis не должно ломать запрос
        logger.debug("WS push skipped", exc_info=True)
