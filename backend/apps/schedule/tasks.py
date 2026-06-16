"""
Отложенные задачи Celery — напоминания о предстоящих активностях.

Запуск воркера:  celery -A arna_project worker -l info
"""
from celery import shared_task


@shared_task
def send_activity_reminder(item_id: str):
    """
    Напоминание родителю/ребёнку о приближающейся активности.
    Создаёт уведомление и пушит его в WebSocket.
    """
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer

    from apps.notifications.models import Notification

    from .models import ScheduleItem

    try:
        item = ScheduleItem.objects.select_related(
            "schedule__child__parent"
        ).get(id=item_id)
    except ScheduleItem.DoesNotExist:
        return

    if item.status != ScheduleItem.Status.PENDING:
        return  # уже начали/выполнили — напоминание неактуально

    parent = item.schedule.child.parent
    notification = Notification.objects.create(
        user=parent,
        title="Скоро активность ⏰",
        body=f"Через несколько минут: «{item.title_ru}»",
        type=Notification.Type.SYSTEM,
        data={"item_id": str(item.id)},
    )

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
