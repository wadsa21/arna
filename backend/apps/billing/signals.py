from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Plan, Subscription


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_free_subscription(sender, instance, created, **kwargs):
    """При регистрации пользователя автоматически выдаём FREE-подписку."""
    if not created:
        return
    free_plan = Plan.objects.filter(name=Plan.Name.FREE).first()
    if not free_plan:
        # Планы ещё не засеяны (seed_plans) — пропускаем, выдадим лениво позже
        return
    Subscription.objects.get_or_create(
        user=instance,
        defaults={
            "plan": free_plan,
            "status": Subscription.Status.ACTIVE,
            "billing_cycle": Subscription.BillingCycle.MONTHLY,
        },
    )
