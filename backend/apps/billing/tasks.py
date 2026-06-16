"""
Celery-задачи биллинга.

Расписание (celery beat) задаётся в arna_project/celery.py:
  - check_expired_subscriptions — ежедневно в 00:00
  - send_expiry_reminder       — ежедневно (за 3 дня до истечения)
"""
from datetime import timedelta

from celery import shared_task
from django.utils import timezone


def _notify(user, title, body):
    """Создать уведомление + пушнуть в WebSocket (если канальный слой жив)."""
    from asgiref.sync import async_to_sync
    from channels.layers import get_channel_layer

    from apps.notifications.models import Notification

    n = Notification.objects.create(
        user=user, title=title, body=body, type=Notification.Type.SYSTEM
    )
    try:
        layer = get_channel_layer()
        if layer:
            async_to_sync(layer.group_send)(
                f"user_{user.id}",
                {
                    "type": "notify",
                    "payload": {
                        "id": str(n.id),
                        "title": n.title,
                        "body": n.body,
                        "type": n.type,
                        "created_at": n.created_at.isoformat(),
                    },
                },
            )
    except Exception:  # noqa: BLE001
        pass


@shared_task
def check_expired_subscriptions():
    """Помечает истёкшие подписки EXPIRED и откатывает на FREE."""
    from .models import Plan, Subscription

    now = timezone.now()
    expired = Subscription.objects.filter(
        status__in=[Subscription.Status.ACTIVE, Subscription.Status.CANCELLED],
        expires_at__lt=now,
    ).select_related("user", "plan")

    free = Plan.objects.filter(name=Plan.Name.FREE).first()
    count = 0
    for sub in expired:
        sub.status = Subscription.Status.EXPIRED
        if free:
            sub.plan = free
            sub.expires_at = None
        sub.save(update_fields=["status", "plan", "expires_at"])
        _notify(
            sub.user,
            "Подписка истекла",
            "Ваш тариф вернулся к FREE. Продлите, чтобы вернуть все функции.",
        )
        count += 1
    return f"expired: {count}"


@shared_task
def send_expiry_reminder():
    """За 3 дня до истечения шлёт напоминание."""
    from .models import Subscription

    now = timezone.now()
    window_start = now + timedelta(days=2)
    window_end = now + timedelta(days=3)
    soon = Subscription.objects.filter(
        status=Subscription.Status.ACTIVE,
        auto_renew=False,
        expires_at__gte=window_start,
        expires_at__lte=window_end,
    ).select_related("user")
    for sub in soon:
        _notify(
            sub.user,
            "Подписка скоро истекает ⏳",
            f"Тариф {sub.plan.name} истекает через {sub.days_left} дн. Продлите подписку.",
        )
    return f"reminders: {soon.count()}"


@shared_task
def send_renewal_success(subscription_id: str):
    """Уведомление об успешном продлении/оплате."""
    from .models import Subscription

    sub = Subscription.objects.filter(id=subscription_id).select_related("user").first()
    if sub:
        _notify(
            sub.user,
            "Оплата прошла успешно 🎉",
            f"Тариф {sub.plan.name} активирован. Спасибо, что вы с Арна!",
        )
