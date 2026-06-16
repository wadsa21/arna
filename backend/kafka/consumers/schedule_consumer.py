"""
Консьюмер топика arna.schedule.completed.

Когда ребёнок завершает активность, событие попадает сюда,
и мы:
  1. создаём Notification родителю в БД;
  2. пушим реалтайм-уведомление в WebSocket через Channels.

Запуск:  python -m kafka.consumers.schedule_consumer
"""
import logging

from .base import run_consumer

logger = logging.getLogger("arna.kafka")


def handle_schedule_completed(payload: dict) -> None:
    # Импорты внутри функции — Django уже инициализирован в base.run_consumer
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer

    from apps.children.models import ChildProfile
    from apps.notifications.models import Notification
    from apps.schedule.models import ScheduleItem

    child_id = payload.get("child_id")
    item_id = payload.get("item_id")

    try:
        child = ChildProfile.objects.select_related("parent").get(id=child_id)
    except ChildProfile.DoesNotExist:
        logger.warning("Ребёнок %s не найден, пропускаю", child_id)
        return

    item_title = "Активность"
    try:
        item = ScheduleItem.objects.get(id=item_id)
        item_title = item.title_ru or item.title_kk
    except ScheduleItem.DoesNotExist:
        pass

    parent = child.parent
    notification = Notification.objects.create(
        user=parent,
        title="Активность завершена 🎉",
        body=f"{child.name} завершил(а): «{item_title}»",
        type=Notification.Type.SCHEDULE_DONE,
        data={"child_id": str(child_id), "item_id": str(item_id)},
    )

    # Реалтайм-пуш в персональную группу родителя
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{parent.id}",
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
    logger.info("Уведомление отправлено родителю %s", parent.id)


def main():
    run_consumer(
        topic_key="schedule_completed",
        handler=handle_schedule_completed,
        group_suffix="schedule",
    )


if __name__ == "__main__":
    main()
